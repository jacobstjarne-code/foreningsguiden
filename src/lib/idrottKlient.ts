/**
 * idrottKlient.ts — V6 (rättning 2026-08-19). Klientlogiken för
 * IdrottsIngangen.astro (bevakningsfångst + kommunövergång) flyttad hit
 * ur en inline <script>-tagg.
 *
 * Rot till buggen den fixar: Astro inlinear automatiskt en <script>-chunk
 * som (a) inte har några egna imports och (b) ligger under
 * build.assetsInlineLimit (4096 B) — se node_modules/astro/dist/core/
 * build/plugins/plugin-scripts.js. Formulärets logik var självständig
 * vanilla-JS utan imports och långt under gränsen, så den blev inline i
 * dist-utdatan i stället för en egen /_astro/*.js-fil. Sajtens CSP
 * (vercel.json) är `script-src 'self' https://cloud.umami.is` — ingen
 * 'unsafe-inline', ingen nonce — så webbläsaren tystnade skriptet i
 * produktion. Formuläret hade inget attribut method="get" som lurade
 * någon; det saknade fungerande JS helt, och then föll tillbaka på
 * webbläsarens EGEN default (GET mot sidans URL, mejladressen i
 * frågesträngen).
 *
 * Fixen är inte en CSP-ändring (en hash att hålla i synk vid varje
 * redigering, engångslösning för just den här sidan) utan att göra
 * skriptet till en RIKTIG modul med ett import — exakt samma mönster
 * som bevakaKlient.ts/initBevakaWidgets() redan använder på resten av
 * sajten, och som redan bevisligen fungerar mot samma CSP eftersom
 * `output.imports.length > 0` diskvalificerar chunken från
 * inline-optimeringen ovan.
 */
export function initIdrottWidgets(): void {
  const root = document.querySelector<HTMLElement>('.idrott');
  if (!root) return;

  // Namn→slug — samma inbäddade-JSON-mönster som KommunProgression.astro:s
  // data-progression-per-filter, ingen server-tur-och-retur för att slå
  // upp en slug klienten redan har fått.
  const kommunlistaEl = root.querySelector<HTMLScriptElement>('[data-idrott-kommunlista]');
  const kommunlista: { namn: string; slug: string }[] = kommunlistaEl ? JSON.parse(kommunlistaEl.textContent ?? '[]') : [];
  function slugFranNamn(input: string): string | null {
    const normaliserat = input.trim().toLowerCase();
    const traff = kommunlista.find((k) => k.namn.toLowerCase() === normaliserat);
    return traff?.slug ?? null;
  }

  // Bevakningsfångst — nationell bevakning, samma /api/prenumerera-json
  // som resten av sajten (U1.5), egen presentation (stor ruta, inte
  // deadlines-tabellens kompakta klick-för-att-visa-rad).
  const captureEl = root.querySelector<HTMLElement>('[data-idrott-capture]');
  const captureForm = root.querySelector<HTMLFormElement>('[data-idrott-capture-form]');
  const captureKvitto = root.querySelector<HTMLElement>('[data-idrott-capture-kvitto]');
  const captureFel = root.querySelector<HTMLElement>('[data-idrott-capture-fel]');
  const stodId = captureEl?.dataset.nationelltStodId ?? '';

  captureForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    captureFel?.setAttribute('hidden', '');
    const submitKnapp = captureForm.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submitKnapp) submitKnapp.disabled = true;

    const data = new FormData(captureForm);
    data.set('nationelltStod', stodId);

    try {
      const res = await fetch('/api/prenumerera-json', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error('svar ej ok');
      captureForm.hidden = true;
      if (captureKvitto) {
        captureKvitto.textContent = json.alreadyConfirmed
          ? 'Ni bevakar redan LOK-stödet.'
          : 'Kolla er inkorg — bekräfta så börjar vi påminna er.';
        captureKvitto.hidden = false;
      }
    } catch {
      captureFel?.removeAttribute('hidden');
      if (submitKnapp) submitKnapp.disabled = false;
    }
  });

  // Övergången — V1.3: postar BARA kommun, ingen idrott/kategori.
  const transitForm = root.querySelector<HTMLFormElement>('[data-idrott-transit-form]');
  const transitFel = root.querySelector<HTMLElement>('[data-idrott-transit-fel]');

  transitForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    transitFel?.setAttribute('hidden', '');
    const input = transitForm.querySelector<HTMLInputElement>('input[name="kommun"]');
    const slug = input ? slugFranNamn(input.value) : null;
    if (!slug) {
      transitFel?.removeAttribute('hidden');
      return;
    }
    window.location.href = `/kommun/${slug}/`;
  });
}
