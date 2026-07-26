// POST /api/vantelista — köanmälan till utkasttjänsten (SPRINT §Spår B,
// SPRINT_COPY.ts §VÄNTELISTA), och sen matchningstrattens (turn-11)
// "Hjälp oss registrera" (syfte=registrering, kommun-scopad — inget
// enskilt bidrag). Ingen dubbel opt-in — kvittot lovar inget
// bekräftelsemejl. Anropas via fetch(), inte en full formulärnavigering —
// svarar JSON.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { addVantelista, type VantelistaSyfte } from '../../lib/vantelista';
import { addForeningsprofil } from '../../lib/subscribers';
import type { Foreningsprofil } from '../../lib/foreningsprofil';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const kommunSlug = String(form.get('kommun') ?? '').trim();
  const bidragIdRaw = String(form.get('bidrag') ?? '').trim();
  const syfte: VantelistaSyfte = form.get('syfte') === 'registrering' ? 'registrering' : 'utkast';
  const profilRaw = form.get('profil');

  const kommun = getKommunBySlug(kommunSlug);
  if (!kommun || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // registrering är kommun-scopad, inte bidrag-scopad — inget bidragId krävs.
  // utkast (befintligt beteende, oförändrat) kräver ett verkligt bidrag i kommunen.
  if (syfte === 'utkast') {
    const bidragFinns = kommun.bidrag.some((b) => b.id === bidragIdRaw);
    if (!bidragFinns) {
      return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
  }

  await addVantelista(email, kommunSlug, syfte === 'registrering' ? null : bidragIdRaw, syfte);

  // Matchningstrattens föreningsprofil (localStorage) mergas in på
  // subscriber-posten FÖRST när en e-post faktiskt fångas — se
  // foreningsprofil.ts filhuvud. Trasig/utebliven profil-payload blockerar
  // aldrig köanmälan i sig, den bara hoppas över.
  if (typeof profilRaw === 'string' && profilRaw.length > 0) {
    try {
      const profil = JSON.parse(profilRaw) as Foreningsprofil;
      await addForeningsprofil(email, profil);
    } catch {
      // ogiltig profil-payload — anmälan har redan sparats ovan, inget att göra åt.
    }
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
