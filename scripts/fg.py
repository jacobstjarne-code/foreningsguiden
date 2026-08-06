#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

try:
    import yaml
except ImportError:
    print("FEL: PyYAML saknas. Kör: python3 -m pip install pyyaml", file=sys.stderr)
    raise SystemExit(2)

ROOT_MARKERS = ("package.json", "data/kommuner", "src/lib")


class FgError(RuntimeError):
    pass


def repo_root() -> Path:
    env = os.environ.get("FG_ROOT")
    if env:
        root = Path(env).expanduser().resolve()
    else:
        start = Path.cwd().resolve()
        root = start
        while root != root.parent:
            if all((root / marker).exists() for marker in ROOT_MARKERS):
                return root
            root = root.parent
        root = start
    if not all((root / marker).exists() for marker in ROOT_MARKERS):
        raise FgError(
            "Kunde inte hitta Föreningsguidens repo. Kör kommandot i repot "
            "eller sätt FG_ROOT=/sökväg/till/repo."
        )
    return root


def run(
    args: list[str],
    *,
    cwd: Path,
    check: bool = True,
    capture: bool = False,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=cwd,
        text=True,
        check=check,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.STDOUT if capture else None,
    )


def git(root: Path, *args: str, capture: bool = True, check: bool = True) -> str:
    cp = run(["git", *args], cwd=root, capture=capture, check=check)
    return cp.stdout or ""


def npm_script_exists(root: Path, name: str) -> bool:
    package = json.loads((root / "package.json").read_text(encoding="utf-8"))
    return name in (package.get("scripts") or {})


def run_validation(root: Path) -> None:
    script = "validera" if npm_script_exists(root, "validera") else "validate"
    if not npm_script_exists(root, script):
        raise FgError("Varken npm-scriptet 'validera' eller 'validate' finns.")
    run(["npm", "run", script], cwd=root)


def run_build(root: Path) -> None:
    if not npm_script_exists(root, "build"):
        raise FgError("npm-scriptet 'build' saknas.")
    run(["npm", "run", "build"], cwd=root)


def status_lines(root: Path) -> list[str]:
    return [line for line in git(root, "status", "--short").splitlines() if line.strip()]


def changed_tracked_files(root: Path) -> list[str]:
    return sorted(
        set(
            filter(
                None,
                (
                    git(root, "diff", "--name-only").splitlines()
                    + git(root, "diff", "--cached", "--name-only").splitlines()
                ),
            )
        )
    )


def untracked_files(root: Path) -> list[str]:
    result = []
    for line in status_lines(root):
        if line.startswith("?? "):
            result.append(line[3:])
    return sorted(result)


def load_yaml(path: Path) -> dict:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise FgError(f"Trasig YAML: {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise FgError(f"YAML-roten måste vara ett objekt: {path}")
    return data


def all_municipality_paths(root: Path) -> list[Path]:
    return sorted((root / "data/kommuner").glob("*.yaml"))


def block_dir(root: Path, block: str) -> Path:
    candidates = [
        root / "kravextraktion-blocks" / block,
        root / "kravextraktion-blocks" / f"kallprioriterat-block-{int(block):02d}"
        if block.isdigit()
        else root / "kravextraktion-blocks" / block,
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FgError(f"Hittar inte block '{block}'.")


def read_block(root: Path, block: str) -> tuple[Path, dict, list[str]]:
    folder = block_dir(root, block)
    block_json = folder / "BLOCK.json"
    if not block_json.exists():
        raise FgError(f"Saknar {block_json}")
    data = json.loads(block_json.read_text(encoding="utf-8"))
    slugs: list[str] = []
    for row in data.get("kommuner", []):
        slug = row.get("slug") if isinstance(row, dict) else row
        if not slug:
            raise FgError(f"Ogiltig kommunpost i {block_json}: {row!r}")
        slugs.append(str(slug))
    if len(slugs) != len(set(slugs)):
        raise FgError("BLOCK.json innehåller dubbletter.")
    return folder, data, sorted(slugs)


@dataclass
class RepairFinding:
    file: str
    bidrag_id: str
    code: str
    detail: str
    mechanical: bool = False


ALLOWED_STATUS = {"olast", "okand", "ingen_regel", "kontrollast"}
STATUS_FIELDS = ("belopp_status", "deadline_status", "krav_status", "giltighet_status")
URL_RE = re.compile(r"https?://", re.I)


def scan_repairs(root: Path) -> list[RepairFinding]:
    findings: list[RepairFinding] = []
    for path in all_municipality_paths(root):
        data = load_yaml(path)
        for index, bid in enumerate(data.get("bidrag") or []):
            if not isinstance(bid, dict):
                findings.append(
                    RepairFinding(path.name, f"index:{index}", "INVALID_BIDRAG", "Bidragsposten är inte ett objekt")
                )
                continue
            bid_id = str(bid.get("id") or f"index:{index}")
            for field in STATUS_FIELDS:
                status = bid.get(field)
                if status is not None and status not in ALLOWED_STATUS:
                    mechanical = status == "verifierad"
                    findings.append(
                        RepairFinding(
                            path.name,
                            bid_id,
                            "INVALID_STATUS",
                            f"{field}={status!r}; tillåtna: {sorted(ALLOWED_STATUS)}",
                            mechanical=mechanical,
                        )
                    )
            belopp = bid.get("belopp")
            if isinstance(belopp, str) and URL_RE.search(belopp):
                findings.append(
                    RepairFinding(path.name, bid_id, "URL_IN_BELOPP", "URL hittad i belopp")
                )
            kalla = bid.get("kalla_url")
            if kalla not in (None, "") and not (
                isinstance(kalla, str) and re.match(r"^https?://", kalla.strip(), re.I)
            ):
                findings.append(
                    RepairFinding(path.name, bid_id, "INVALID_SOURCE_URL", f"kalla_url={kalla!r}")
                )
            krav = bid.get("krav")
            if bid.get("krav_status") == "kontrollast" and not (
                isinstance(krav, list) and len(krav) > 0
            ):
                findings.append(
                    RepairFinding(path.name, bid_id, "EMPTY_CONTROLLED_REQUIREMENTS", "kontrollast men tom kravlista")
                )
    return findings


def apply_mechanical_repairs(root: Path, findings: list[RepairFinding]) -> int:
    targets = {(f.file, f.bidrag_id) for f in findings if f.mechanical}
    changed = 0
    for filename, bid_id in sorted(targets):
        path = root / "data/kommuner" / filename
        data = load_yaml(path)
        file_changed = False
        for bid in data.get("bidrag") or []:
            if str(bid.get("id") or "") != bid_id:
                continue
            for field in STATUS_FIELDS:
                if bid.get(field) == "verifierad":
                    bid[field] = "kontrollast"
                    changed += 1
                    file_changed = True
        if file_changed:
            path.write_text(
                yaml.safe_dump(data, allow_unicode=True, sort_keys=False, width=120),
                encoding="utf-8",
            )
    return changed


def cmd_doctor(args: argparse.Namespace) -> int:
    root = repo_root()
    print("FÖRENINGSGUIDEN – DOCTOR")
    print(f"Repo: {root}")
    print(f"Gren: {git(root, 'branch', '--show-current').strip()}")
    local = git(root, "rev-parse", "HEAD").strip()
    remote = git(root, "rev-parse", "@{u}", check=False).strip()
    print(f"Synkad med upstream: {'JA' if remote and local == remote else 'NEJ/OKÄNT'}")

    tracked = changed_tracked_files(root)
    untracked = untracked_files(root)
    print(f"Spårade lokala ändringar: {len(tracked)}")
    print(f"Ospårade poster: {len(untracked)}")

    municipality_paths = all_municipality_paths(root)
    municipalities = 0
    grants = 0
    parse_errors: list[str] = []
    for path in municipality_paths:
        try:
            data = load_yaml(path)
            municipalities += 1
            grants += len(data.get("bidrag") or [])
        except FgError as exc:
            parse_errors.append(str(exc))

    print(f"Kommunfiler: {municipalities}")
    print(f"Bidrag: {grants}")
    print(f"YAML-läsfel: {len(parse_errors)}")

    findings = scan_repairs(root) if not parse_errors else []
    print(f"Reparationsfynd: {len(findings)}")

    if args.fast:
        return 1 if parse_errors or findings else 0

    ok = True
    try:
        print("\n→ npm run validera")
        run_validation(root)
    except Exception:
        ok = False
    try:
        print("\n→ npm run build")
        run_build(root)
    except Exception:
        ok = False

    if parse_errors:
        ok = False
    if findings:
        ok = False

    print("\nSTATUS:", "GRÖN" if ok else "RÖD")
    return 0 if ok else 1


def cmd_repair(args: argparse.Namespace) -> int:
    root = repo_root()
    findings = scan_repairs(root)
    if not findings:
        print("Inga reparationsfynd.")
        return 0

    for finding in findings:
        marker = "MEKANISK" if finding.mechanical else "MANUELL"
        print(
            f"{marker}\t{finding.file}\t{finding.bidrag_id}\t"
            f"{finding.code}\t{finding.detail}"
        )

    mechanical = [f for f in findings if f.mechanical]
    print(f"\nTotalt: {len(findings)} fynd; mekaniskt reparerbara: {len(mechanical)}")

    if not args.apply:
        print("Ingen ändring gjord. Kör 'fg repair --apply' för mekaniska statusrättningar.")
        return 1

    before = set(changed_tracked_files(root))
    count = apply_mechanical_repairs(root, findings)
    print(f"Mekaniska statusvärden rättade: {count}")

    run_validation(root)
    after = set(changed_tracked_files(root))
    changed_now = sorted(after - before)
    print("Nya ändrade filer:")
    for file in changed_now:
        print(f"  {file}")
    return 0


def cmd_batch_verify(args: argparse.Namespace) -> int:
    root = repo_root()
    _, data, slugs = read_block(root, args.block)
    expected_files = {f"data/kommuner/{slug}.yaml" for slug in slugs}
    changed = set(changed_tracked_files(root))
    changed_municipalities = {f for f in changed if f.startswith("data/kommuner/")}

    outside = sorted(changed_municipalities - expected_files)
    missing = sorted(expected_files - changed_municipalities)

    # Ett block kan verifieras i två lägen:
    # 1. före commit: kommunfilerna syns i lokal Git-diff,
    # 2. efter commit: arbetskopian är ren, men APPLY_AUDIT visar exakt
    #    vilka filer som applicerades.
    audit_files: set[str] = set()
    committed_mode = False

    if args.block.isdigit():
        audit_path = root / f"BLOCK_{int(args.block):02d}_APPLY_AUDIT.json"
        if audit_path.exists():
            try:
                audit = json.loads(audit_path.read_text(encoding="utf-8"))
                audit_files = set(audit.get("changed_files") or [])
            except Exception as exc:
                raise FgError(f"Ogiltig auditfil {audit_path.name}: {exc}") from exc

    if not changed_municipalities and audit_files:
        committed_mode = audit_files == expected_files
        if committed_mode:
            missing = []
        else:
            missing = sorted(expected_files - audit_files)
            outside = sorted(audit_files - expected_files)

    effective_changed = audit_files if committed_mode else changed_municipalities

    print(f"Block: {args.block}")
    print(f"Förväntade kommuner: {len(slugs)}")
    print(f"Verifieringsläge: {'audit/committat' if committed_mode else 'arbetskopia'}")
    print(f"Ändrade kommunfiler i blocket: {len(effective_changed & expected_files)}")
    print(f"Ändrade kommunfiler utanför blocket: {len(outside)}")
    print(f"Kommuner utan ändring: {len(missing)}")

    if outside:
        print("\nUTANFÖR BLOCK:")
        print("\n".join(outside))
    if missing and args.require_all_changed:
        print("\nUTAN ÄNDRING:")
        print("\n".join(missing))

    report_json = root / f"KRAVEXTRAKTION_KALLPRIORITERAT_BLOCK_{int(args.block):02d}.json" if args.block.isdigit() else None
    report_md = root / f"KRAVEXTRAKTION_KALLPRIORITERAT_BLOCK_{int(args.block):02d}.md" if args.block.isdigit() else None

    ok = not outside and (not args.require_all_changed or not missing)
    if args.require_reports and report_json and report_md:
        if not report_json.exists() or not report_md.exists():
            ok = False
            print("Rapportfiler saknas.")

    try:
        run_validation(root)
        run_build(root)
    except Exception:
        ok = False

    findings = [f for f in scan_repairs(root) if f.file[:-5] in set(slugs)]
    if findings:
        ok = False
        print(f"\nDatakvalitetsfynd i blocket: {len(findings)}")
        for finding in findings[:50]:
            print(f"{finding.file}\t{finding.bidrag_id}\t{finding.code}\t{finding.detail}")

    print("\nBLOCKSTATUS:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


def cmd_batch_create(args: argparse.Namespace) -> int:
    root = repo_root()
    manifest_path = root / "NORMREVISION_MANIFEST.json"
    done: set[str] = set()
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        done.update(manifest.get("kommuner") or [])

    blocks_root = root / "kravextraktion-blocks"
    if blocks_root.exists():
        for block_json in blocks_root.glob("*/BLOCK.json"):
            try:
                block = json.loads(block_json.read_text(encoding="utf-8"))
                for row in block.get("kommuner") or []:
                    done.add(str(row.get("slug") if isinstance(row, dict) else row))
            except Exception:
                continue

    rows = []
    for path in all_municipality_paths(root):
        if path.stem in done:
            continue
        data = load_yaml(path)
        bids = data.get("bidrag") or []
        text = " ".join(str(b.get("kalla_url") or "") for b in bids).lower()
        source_class = 1 if ".pdf" in text else 2
        empty = sum(not (b.get("krav") or []) for b in bids)
        one = sum(len(b.get("krav") or []) == 1 for b in bids)
        rows.append(
            {
                "slug": path.stem,
                "kommun": data.get("namn", path.stem),
                "antal_bidrag": len(bids),
                "source_class": source_class,
                "empty_requirements": empty,
                "one_requirement": one,
            }
        )
    rows.sort(key=lambda r: (r["source_class"], -r["empty_requirements"], -r["one_requirement"], r["kommun"]))
    selected = rows[: args.size]
    if len(selected) != args.size:
        raise FgError(f"Kunde bara välja {len(selected)} kommuner.")

    name = f"kallprioriterat-block-{args.number:02d}"
    out = blocks_root / name
    if out.exists() and not args.force:
        raise FgError(f"{out} finns redan. Använd --force för att skriva över.")
    if out.exists():
        shutil.rmtree(out)
    (out / "data/kommuner").mkdir(parents=True)
    (out / "src/lib").mkdir(parents=True)

    for row in selected:
        shutil.copy2(root / "data/kommuner" / f"{row['slug']}.yaml", out / "data/kommuner")
    for name_src in ("kommunTyper.ts", "kommuner.ts"):
        shutil.copy2(root / "src/lib" / name_src, out / "src/lib")

    payload = {
        "block": f"kallprioriterat-{args.number:02d}",
        "kommuner": selected,
        "rapportkrav": [
            "antal_bidrag",
            "antal_dar_krav_tillkom",
            "antal_ingen_regel",
            "antal_overifierat",
        ],
    }
    (out / "BLOCK.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Skapade {out}")
    for i, row in enumerate(selected, 1):
        print(f"{i:02d}. {row['kommun']} ({row['slug']})")
    return 0


def cmd_commit(args: argparse.Namespace) -> int:
    root = repo_root()
    _, _, slugs = read_block(root, args.block)
    verify_args = argparse.Namespace(
        block=args.block,
        require_all_changed=True,
        require_reports=True,
    )
    if cmd_batch_verify(verify_args) != 0:
        raise FgError("Commit stoppad: batch verify är röd.")

    paths = [f"data/kommuner/{slug}.yaml" for slug in slugs]
    if args.block.isdigit():
        n = int(args.block)
        paths += [
            f"KRAVEXTRAKTION_KALLPRIORITERAT_BLOCK_{n:02d}.json",
            f"KRAVEXTRAKTION_KALLPRIORITERAT_BLOCK_{n:02d}.md",
        ]
    run(["git", "add", "--", *paths], cwd=root)
    staged = git(root, "diff", "--cached", "--name-only").splitlines()
    unexpected = sorted(set(staged) - set(paths))
    if unexpected:
        raise FgError("Oväntade staged filer: " + ", ".join(unexpected))

    message = args.message or f"fix: kravextraktion källprioriterat block {int(args.block):02d}"
    run(["git", "commit", "-m", message], cwd=root)
    if args.push:
        run(["git", "push", "origin", git(root, "branch", "--show-current").strip()], cwd=root)
    return 0


def cmd_release_check(args: argparse.Namespace) -> int:
    root = repo_root()
    if changed_tracked_files(root):
        raise FgError("Arbetskopian har spårade ändringar.")
    run_validation(root)
    run_build(root)
    findings = scan_repairs(root)
    if findings:
        raise FgError(f"Release stoppad: {len(findings)} datakvalitetsfynd.")
    print("RELEASE-CHECK: PASS")
    return 0



def proposal_path(root: Path, block: str) -> Path:
    if not block.isdigit():
        raise FgError("Förslagsflödet kräver numeriskt blocknummer, t.ex. 3.")
    return root / f"BLOCK_{int(block):02d}_PROPOSAL.json"


PROPOSAL_FIELDS = {
    "krav",
    "krav_status",
    "krav_fullstandiga",
    "belopp",
    "belopp_status",
    "deadlines",
    "deadline_status",
    "giltighet",
    "giltighet_status",
    "sen_ansokan",
    "kalla_url",
    "anteckning",
    "alder_max",
    "alder_min",
    "foreningstyp",
    "kraver_registrering",
    "min_medlemmar",
    "sate_i_kommunen",
    "malgrupp",
    "senast_verifierad",
}


def bidrag_index_for_block(root: Path, slugs: list[str]) -> dict[tuple[str, str], dict]:
    index: dict[tuple[str, str], dict] = {}
    for slug in slugs:
        path = root / "data/kommuner" / f"{slug}.yaml"
        data = load_yaml(path)
        for bid in data.get("bidrag") or []:
            bid_id = str(bid.get("id") or "")
            if not bid_id:
                raise FgError(f"{path.name} innehåller bidrag utan id.")
            key = (slug, bid_id)
            if key in index:
                raise FgError(f"Dubblett-id i blocket: {slug}/{bid_id}")
            index[key] = bid
    return index


def cmd_proposal_init(args: argparse.Namespace) -> int:
    root = repo_root()
    _, _, slugs = read_block(root, args.block)
    index = bidrag_index_for_block(root, slugs)
    out = proposal_path(root, args.block)
    if out.exists() and not args.force:
        raise FgError(f"{out.name} finns redan. Använd --force för att skriva över.")

    payload = {
        "schema_version": 1,
        "block": int(args.block),
        "kommuner": slugs,
        "changes": [],
        "instructions": {
            "change_shape": {
                "slug": "kommunens slug",
                "bidrag_id": "befintligt bidrags-id",
                "source_url": "officiell URL som stödjer ändringen",
                "reason": "kort motivering",
                "set": {"fält": "nytt värde"},
            },
            "allowed_fields": sorted(PROPOSAL_FIELDS),
            "rules": [
                "Gissa aldrig.",
                "Varje ändring måste ha officiell source_url.",
                "Använd endast befintliga sluggar och bidrags-id:n.",
                "Ändra inte id eller namn.",
                "kontrollast kräver att värdet faktiskt har kontrollerats i källan.",
                "krav_status kontrollast kräver en icke-tom kravlista.",
            ],
        },
        "stats": {
            "antal_kommuner": len(slugs),
            "antal_bidrag": len(index),
        },
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Skapade {out}")
    print(f"Kommuner: {len(slugs)}")
    print(f"Bidrag: {len(index)}")
    return 0


def validate_proposal(root: Path, block: str) -> tuple[dict, list[str], list[str]]:
    path = proposal_path(root, block)
    if not path.exists():
        raise FgError(f"Saknar {path.name}. Kör './fg proposal init {block}' först.")
    try:
        proposal = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise FgError(f"Ogiltig JSON i {path.name}: {exc}") from exc

    _, _, slugs = read_block(root, block)
    slug_set = set(slugs)
    index = bidrag_index_for_block(root, slugs)
    errors: list[str] = []
    warnings: list[str] = []

    if proposal.get("schema_version") != 1:
        errors.append("schema_version måste vara 1.")
    if proposal.get("block") != int(block):
        errors.append(f"block måste vara {int(block)}.")
    listed = proposal.get("kommuner")
    if listed is not None and set(listed) != slug_set:
        errors.append("kommuner i proposal matchar inte BLOCK.json.")

    changes = proposal.get("changes")
    if not isinstance(changes, list):
        errors.append("changes måste vara en lista.")
        return proposal, errors, warnings

    seen: set[tuple[str, str]] = set()
    for i, change in enumerate(changes):
        prefix = f"changes[{i}]"
        if not isinstance(change, dict):
            errors.append(f"{prefix} måste vara ett objekt.")
            continue
        slug = str(change.get("slug") or "")
        bidrag_id = str(change.get("bidrag_id") or "")
        key = (slug, bidrag_id)
        if slug not in slug_set:
            errors.append(f"{prefix}: slug {slug!r} ingår inte i blocket.")
        if key not in index:
            errors.append(f"{prefix}: okänt bidrag {slug}/{bidrag_id}.")
        if key in seen:
            errors.append(f"{prefix}: dubblerad ändring för {slug}/{bidrag_id}.")
        seen.add(key)

        source_url = change.get("source_url")
        if not isinstance(source_url, str) or not re.match(r"^https?://", source_url.strip(), re.I):
            errors.append(f"{prefix}: source_url måste vara en http/https-URL.")
        reason = change.get("reason")
        if not isinstance(reason, str) or len(reason.strip()) < 5:
            errors.append(f"{prefix}: reason saknas eller är för kort.")

        updates = change.get("set")
        if not isinstance(updates, dict) or not updates:
            errors.append(f"{prefix}: set måste vara ett icke-tomt objekt.")
            continue
        unknown = sorted(set(updates) - PROPOSAL_FIELDS)
        if unknown:
            errors.append(f"{prefix}: otillåtna fält: {', '.join(unknown)}")

        for field in STATUS_FIELDS:
            if field in updates and updates[field] not in ALLOWED_STATUS:
                errors.append(
                    f"{prefix}: {field}={updates[field]!r}; tillåtna: {sorted(ALLOWED_STATUS)}"
                )

        krav = updates.get("krav", index.get(key, {}).get("krav"))
        krav_status = updates.get("krav_status", index.get(key, {}).get("krav_status"))
        if krav_status == "kontrollast" and not (isinstance(krav, list) and len(krav) > 0):
            errors.append(f"{prefix}: krav_status kontrollast kräver icke-tom kravlista.")

        belopp = updates.get("belopp")
        if isinstance(belopp, str) and URL_RE.search(belopp):
            errors.append(f"{prefix}: URL får inte ligga i belopp.")

        kalla = updates.get("kalla_url")
        if kalla is not None and not (
            isinstance(kalla, str) and re.match(r"^https?://", kalla.strip(), re.I)
        ):
            errors.append(f"{prefix}: kalla_url måste vara en http/https-URL.")

        if updates.get("krav_fullstandiga") is True and updates.get("krav_status") != "kontrollast":
            warnings.append(
                f"{prefix}: krav_fullstandiga=true utan explicit krav_status=kontrollast."
            )

    return proposal, errors, warnings


def cmd_proposal_validate(args: argparse.Namespace) -> int:
    root = repo_root()
    proposal, errors, warnings = validate_proposal(root, args.block)
    print(f"Förslag: {proposal_path(root, args.block).name}")
    print(f"Ändringar: {len(proposal.get('changes') or [])}")
    for warning in warnings:
        print(f"VARNING: {warning}")
    if errors:
        for error in errors:
            print(f"FEL: {error}")
        print("\nPROPOSALSTATUS: FAIL")
        return 1
    print("\nPROPOSALSTATUS: PASS")
    return 0


def cmd_proposal_apply(args: argparse.Namespace) -> int:
    root = repo_root()
    proposal, errors, warnings = validate_proposal(root, args.block)
    if errors:
        for error in errors:
            print(f"FEL: {error}")
        raise FgError("Applicering stoppad: förslaget är inte giltigt.")

    _, _, slugs = read_block(root, args.block)
    allowed_files = {f"data/kommuner/{slug}.yaml" for slug in slugs}
    before_changed = set(changed_tracked_files(root))
    outside_before = {p for p in before_changed if p.startswith("data/kommuner/") and p not in allowed_files}
    if outside_before:
        raise FgError(
            "Applicering stoppad: kommunfiler utanför blocket är redan ändrade: "
            + ", ".join(sorted(outside_before))
        )

    by_slug: dict[str, list[dict]] = {}
    for change in proposal.get("changes") or []:
        by_slug.setdefault(change["slug"], []).append(change)

    changed_files: list[str] = []
    audit_rows: list[dict] = []
    for slug, changes in sorted(by_slug.items()):
        path = root / "data/kommuner" / f"{slug}.yaml"
        data = load_yaml(path)
        bid_by_id = {str(b.get("id") or ""): b for b in data.get("bidrag") or []}
        file_changed = False
        for change in changes:
            bid = bid_by_id[change["bidrag_id"]]
            before = {field: bid.get(field) for field in change["set"]}
            for field, value in change["set"].items():
                bid[field] = value
            after = {field: bid.get(field) for field in change["set"]}
            if before != after:
                file_changed = True
                audit_rows.append(
                    {
                        "slug": slug,
                        "bidrag_id": change["bidrag_id"],
                        "source_url": change["source_url"],
                        "reason": change["reason"],
                        "before": before,
                        "after": after,
                    }
                )
        if file_changed:
            path.write_text(
                yaml.safe_dump(data, allow_unicode=True, sort_keys=False, width=120),
                encoding="utf-8",
            )
            changed_files.append(f"data/kommuner/{slug}.yaml")

    audit_path = root / f"BLOCK_{int(args.block):02d}_APPLY_AUDIT.json"
    audit_path.write_text(
        json.dumps(
            {
                "block": int(args.block),
                "proposal": proposal_path(root, args.block).name,
                "changed_files": changed_files,
                "changes": audit_rows,
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    run_validation(root)
    run_build(root)

    after_changed = set(changed_tracked_files(root))
    municipality_after = {p for p in after_changed if p.startswith("data/kommuner/")}
    outside_after = municipality_after - allowed_files
    if outside_after:
        raise FgError(
            "Applicering skapade ändringar utanför blocket: "
            + ", ".join(sorted(outside_after))
        )

    block_findings = [f for f in scan_repairs(root) if f.file[:-5] in set(slugs)]
    if block_findings:
        for finding in block_findings[:50]:
            print(f"FEL: {finding.file}/{finding.bidrag_id}: {finding.code}: {finding.detail}")
        raise FgError(f"Applicering stoppad: {len(block_findings)} datakvalitetsfynd.")

    print(f"Applicerade ändringar i {len(changed_files)} kommunfiler.")
    print(f"Audit: {audit_path.name}")
    for file in changed_files:
        print(f"  {file}")
    return 0

def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="fg", description="Föreningsguidens lokala kvalitets- och batchverktyg")
    sub = p.add_subparsers(dest="command", required=True)

    d = sub.add_parser("doctor")
    d.add_argument("--fast", action="store_true")
    d.set_defaults(func=cmd_doctor)

    r = sub.add_parser("repair")
    r.add_argument("--apply", action="store_true")
    r.set_defaults(func=cmd_repair)

    batch = sub.add_parser("batch")
    batch_sub = batch.add_subparsers(dest="batch_command", required=True)

    c = batch_sub.add_parser("create")
    c.add_argument("number", type=int)
    c.add_argument("--size", type=int, default=25)
    c.add_argument("--force", action="store_true")
    c.set_defaults(func=cmd_batch_create)

    v = batch_sub.add_parser("verify")
    v.add_argument("block")
    v.add_argument("--allow-unchanged", dest="require_all_changed", action="store_false")
    v.add_argument("--no-reports", dest="require_reports", action="store_false")
    v.set_defaults(func=cmd_batch_verify, require_all_changed=True, require_reports=True)

    cm = sub.add_parser("commit")
    cm.add_argument("block")
    cm.add_argument("--message")
    cm.add_argument("--push", action="store_true")
    cm.set_defaults(func=cmd_commit)

    rel = sub.add_parser("release-check")
    rel.set_defaults(func=cmd_release_check)

    proposal = sub.add_parser("proposal")
    proposal_sub = proposal.add_subparsers(dest="proposal_command", required=True)

    pi = proposal_sub.add_parser("init")
    pi.add_argument("block")
    pi.add_argument("--force", action="store_true")
    pi.set_defaults(func=cmd_proposal_init)

    pv = proposal_sub.add_parser("validate")
    pv.add_argument("block")
    pv.set_defaults(func=cmd_proposal_validate)

    pa = proposal_sub.add_parser("apply")
    pa.add_argument("block")
    pa.set_defaults(func=cmd_proposal_apply)

    return p


def main() -> int:
    try:
        args = parser().parse_args()
        return int(args.func(args))
    except FgError as exc:
        print(f"FEL: {exc}", file=sys.stderr)
        return 2
    except subprocess.CalledProcessError as exc:
        print(f"FEL: kommando misslyckades ({exc.returncode}): {' '.join(exc.cmd)}", file=sys.stderr)
        return exc.returncode or 1


if __name__ == "__main__":
    raise SystemExit(main())
