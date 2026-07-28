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
 */
import { BEVAKNING } from './content';

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
  document.querySelectorAll<HTMLElement>('[data-bevaka-cell]').forEach((cell) => {
    const knapp = cell.querySelector<HTMLButtonElement>('.bevaka-rad-knapp');
    const kommunSlug = cell.dataset.kommunSlug ?? '';
    const kommunNamn = cell.dataset.kommunNamn ?? '';

    knapp?.addEventListener('click', () => {
      const form = byggBevakaForm(kommunNamn);
      cell.replaceChildren(form);

      const felText = form.querySelector<HTMLElement>('[data-bevaka-fel]');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        felText?.setAttribute('hidden', '');
        const data = new FormData(form);
        data.set('kommun', kommunSlug);

        try {
          const res = await fetch('/api/prenumerera-json', { method: 'POST', body: data });
          const json = await res.json();
          if (!res.ok || !json.ok) throw new Error('svar ej ok');

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
