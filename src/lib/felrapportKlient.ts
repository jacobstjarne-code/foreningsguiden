/**
 * felrapportKlient.ts — Klientsidans wiring för "Det här stämmer inte"
 * (H25, SPEC_ATERSTAENDE_HAL.md Kluster 4). Utbrutet till en delad modul
 * eftersom BidragCard.astro renderas från TVÅ sidor (kommun/[slug]/ och
 * kommun/[slug]/[kategori]/) — samma mönster som bevakningKlient.ts, en
 * sanning för DOM-wiringen i stället för dubblerad <script>-logik.
 */

function byggFelrapportForm(): HTMLFormElement {
  const form = document.createElement('form');
  form.className = 'felrapport-form';
  form.innerHTML = `
    <textarea name="meddelande" placeholder="Vad stämmer inte?" required></textarea>
    <input type="email" name="email" placeholder="Din e-post (valfritt, om vi behöver fråga något)" autocomplete="email" />
    <button type="submit" class="btn-primary">Skicka</button>
    <p class="felrapport-form__fel" data-felrapport-fel hidden>Något gick fel. Försök igen.</p>
  `;
  return form;
}

/** Event-delegation över sidans samtliga [data-felrapport]-widgetar. */
export function initFelrapportWidgets(): void {
  document.querySelectorAll<HTMLElement>('[data-felrapport]').forEach((wrap) => {
    const knapp = wrap.querySelector<HTMLButtonElement>('.felrapport-knapp');
    const kommunSlug = wrap.dataset.kommunSlug ?? '';
    const bidragId = wrap.dataset.bidragId ?? '';
    const bidragNamn = wrap.dataset.bidragNamn ?? '';

    knapp?.addEventListener('click', () => {
      const form = byggFelrapportForm();
      wrap.replaceChildren(form);

      const felText = form.querySelector<HTMLElement>('[data-felrapport-fel]');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        felText?.setAttribute('hidden', '');
        const data = new FormData(form);
        data.set('kommun', kommunSlug);
        data.set('bidragId', bidragId);
        data.set('bidragNamn', bidragNamn);

        try {
          const res = await fetch('/api/felrapport', { method: 'POST', body: data });
          const json = await res.json();
          if (!res.ok || !json.ok) throw new Error('svar ej ok');

          const kvitto = document.createElement('p');
          kvitto.className = 'felrapport-kvitto';
          kvitto.textContent = 'Tack, vi kollar det.';
          wrap.replaceChildren(kvitto);
        } catch {
          felText?.removeAttribute('hidden');
        }
      });
    });
  });
}
