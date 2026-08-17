// POST /api/vantelista — köanmälan till utkasttjänsten (SPRINT §Spår B,
// SPRINT_COPY.ts §VÄNTELISTA), och sen matchningstrattens (turn-11)
// "Hjälp oss registrera" (syfte=registrering, kommun-scopad — inget
// enskilt bidrag).
//
// M2 (Jacob 2026-08-17, "säkerhet först"-uppföljning): STÄNGD. Ingen
// dubbel opt-in fanns — en godtycklig e-postadress kunde läggas i
// väntelistan utan att ägaren bekräftat. Lägre allvarsgrad än M1.1:s
// fakturaendpoint (inget mejl skickas härifrån, ingen ekonomisk eller
// trakasserifara — bara en oönskad databaspost), men samma klass av
// hål. Jacobs val mellan "dubbel opt-in som prenumerera.ts" eller
// "stäng som fakturaendpointen": stängning valt eftersom dubbel opt-in
// hade krävt en ny bekräftelsemejltext (Code skriver aldrig svensk
// kundtext själv) — stängning är både mindre kod OCH görbar utan att
// vänta på Opus. TILL SKILLNAD FRÅN abonnemang-faktura.ts är den här
// endpointen LIVE ANVÄND (VantelistaFlode.astro, bidragsutkastets
// väntelista) — stängningen gör att den knappen visar "Något gick fel.
// Försök igen." (redan byggd felhantering i komponenten, ingen ny UI-
// kod behövdes) i stället för att faktiskt lägga till i väntelistan,
// tills en riktig dubbel-opt-in-text finns. Ursprunglig kod kvar orörd
// i en oanropad funktion.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug } from '../../lib/kommuner';
import { addVantelista, type VantelistaSyfte } from '../../lib/vantelista';
import { addForeningsprofil } from '../../lib/subscribers';
import type { Foreningsprofil } from '../../lib/foreningsprofil';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: false, fel: 'stängd' }), {
    status: 410,
    headers: { 'content-type': 'application/json' },
  });
};

async function _stangdOanvandKod(request: Request) {
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
