/**
 * bevakaKlient.ts — "Bevaka den här", en kompakt en-kommun-scopad variant
 * av EmailSignup.astro/api/prenumerera (Jacob 2026-07-27: "kalendern blir
 * en tjänst i stället för en referens"). Samma backend (addPendingSubscriber
 * via api/prenumerera-json, dubbel opt-in) och samma BEVAKNING-copy som
 * helsidesformuläret — bara ett kompakt, fetch-baserat gränssnitt.
 *
 * Utbrutet till en delad modul (H20, SPEC: Kluster 1 — efter-köp-ytan,
 * 2026-07-28): widgeten renderas nu från TVÅ sidor (deadlines/index.astro
 * och kommun/[slug]/registrera/index.astro) — samma mönster som
 * felrapportKlient.ts, en sanning för DOM-wiringen i stället för
 * dubblerad <script>-logik.
 *
 * 1f (SPEC_HUVUDPROCESSEN §1f, Jacob 2026-08-02): "Knappen finns byggd;
 * det som saknas är det bevakade tillståndet" — kvittot syntes bara i
 * ögonblicket efter ett klick, en sidladdning senare var raden tillbaka
 * i "Bevaka den här"-läget som om inget hänt. Ingen inloggning finns för
 * kalendern (bevakning är e-post + dubbel opt-in, inte en session) — vi
 * kan alltså inte fråga SERVERN "är den här webbläsaren bekräftad", bara
 * komma ihåg klientsidan att DEN HÄR webbläsaren redan skickat in en
 * bevakningsbegäran. localStorage, en sanning delad mellan alla
 * [data-bevaka-cell]-widgetar på sidan.
 *
 * P3.1b (Jacob 2026-08-05): nyckeln är nu kommunSlug ELLER
 * "kommunSlug:bidragId" beroende på om cellen har data-bidrag-id (bara
 * deadlines/index.astro:s rader har det — registrera/index.astro:s
 * kommun-breda widget saknar det, oförändrad). Ren tilläggning, inget
 * brytande format: gamla v1-poster (bara kommunSlug) matchar fortfarande
 * kommun-breda celler exakt som förut; en bidrag-scopad cell kan aldrig
 * kollidera med en bar kommunSlug eftersom nyckeln alltid innehåller
 * kolontecknet då.
 */
import { BEVAKNING } from './content';

const BEVAKADE_KEY = 'foreningsguiden:bevakade-kommuner:v1';

function bevakadNyckel(kommunSlug: string, bidragId: string | undefined): string {
  return bidragId ? `${kommunSlug}:${bidragId}` : kommunSlug;
}

function hamtaBevakade(): Set<string> {
  try {
    const raw = localStorage.getItem(BEVAKADE_KEY);
    const lista = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(lista) ? lista : []);
  } catch {
    return new Set();
  }
}

function markeraBevakad(kommunSlug: string, bidragId: string | undefined): void {
  try {
    const bevakade = hamtaBevakade();
    bevakade.add(bevakadNyckel(kommunSlug, bidragId));
    localStorage.setItem(BEVAKADE_KEY, JSON.stringify([...bevakade]));
  } catch {
    // localStorage kan saknas/vara blockerad — kvittot i UI:t syns ändå
    // just nu, bara inte ihågkommet nästa sidladdning. Ingen krasch.
  }
}

function visaBevakasBadge(cell: HTMLElement): void {
  const badge = document.createElement('p');
  badge.className = 'bevaka-rad-kvitto bevaka-rad-kvitto--bevakas';
  badge.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> ${BEVAKNING.bevakasBadge}`;
  cell.replaceChildren(badge);
}

function byggBevakaForm(kommunNamn: string): HTMLFormElement {
  const form = document.createElement('form');
  form.className = 'bevaka-rad-form';
  form.innerHTML = `
    <input type="email" name="email" placeholder="${BEVAKNING.epostPlaceholder}" required autocomplete="email" />
    <label class="bevaka-rad-form__samtycke">
      <input type="checkbox" name="samtycke" required />
      ${BEVAKNING.samtycke}
    </label>
    <button type="submit" class="btn-primary">${BEVAKNING.knapp}</button>
    <p class="bevaka-rad-form__fel" data-bevaka-fel hidden>Något gick fel. Försök igen.</p>
  `;
  form.setAttribute('aria-label', `Bevaka deadlines i ${kommunNamn}`);
  return form;
}

/** Event-delegation över sidans samtliga [data-bevaka-cell]-widgetar. */
export function initBevakaWidgets(): void {
  const bevakade = hamtaBevakade();

  document.querySelectorAll<HTMLElement>('[data-bevaka-cell]').forEach((cell) => {
    // P3.1 (Jacob 2026-08-05): .bevaka-rad-knapp är nu en riktig <a
    // href="?kommun=slug#email-signup">, inte en <button type="button"> —
    // progressiv förbättring. Utan JS (eller om den här lyssnaren av
    // någon anledning aldrig hinner fästa) navigerar länken till en SSR-
    // renderad EmailSignup med kommunen redan förkryssad (P3.1a), i
    // stället för att vara helt verkningslös som en bar <button> utan
    // lyssnare skulle ha varit. Med JS: preventDefault, samma snabba
    // widget som förut.
    const knapp = cell.querySelector<HTMLAnchorElement>('.bevaka-rad-knapp');
    const kommunSlug = cell.dataset.kommunSlug ?? '';
    const kommunNamn = cell.dataset.kommunNamn ?? '';
    // P3.1b: bara satt på deadlines/index.astro:s rader — ogsatt (undefined)
    // på registrera/index.astro:s kommun-breda widget, oförändrat läge där.
    const bidragId = cell.dataset.bidragId || undefined;

    // 1f — redan bevakad (den här webbläsaren har skickat in en begäran
    // för just DET HÄR (kommun[, bidrag])-paret förut): visa det
    // tillståndet direkt, ingen knapp.
    if (kommunSlug && bevakade.has(bevakadNyckel(kommunSlug, bidragId))) {
      visaBevakasBadge(cell);
      return;
    }

    knapp?.addEventListener('click', (event) => {
      event.preventDefault();
      const form = byggBevakaForm(kommunNamn);
      cell.replaceChildren(form);

      const felText = form.querySelector<HTMLElement>('[data-bevaka-fel]');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        felText?.setAttribute('hidden', '');
        const data = new FormData(form);
        data.set('kommun', kommunSlug);
        if (bidragId) data.set('bidrag', bidragId);

        try {
          const res = await fetch('/api/prenumerera-json', { method: 'POST', body: data });
          const json = await res.json();
          if (!res.ok || !json.ok) throw new Error('svar ej ok');

          if (kommunSlug) markeraBevakad(kommunSlug, bidragId);
          const kvitto = document.createElement('p');
          kvitto.className = 'bevaka-rad-kvitto';
          kvitto.textContent = json.alreadyConfirmed ? BEVAKNING.kvittoRubrik : BEVAKNING.kvittoText;
          cell.replaceChildren(kvitto);
        } catch {
          felText?.removeAttribute('hidden');
        }
      });
    });
  });
}
