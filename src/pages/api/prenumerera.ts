// POST /api/prenumerera — §6 UPPDRAG_POC.md. Formuläret i produktion är
// bakom "kommer snart" tills Fables GDPR-/ändamålscopy är inkopplad (se
// EmailSignup.astro) — den här routen är infrastruktur, inte skarp insamling.
export const prerender = false;

import type { APIRoute } from 'astro';
import { loadKommuner } from '../../lib/kommuner';
import { addSubscriber } from '../../lib/subscribers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const samtycke = form.get('samtycke');
  const giltigaSlugs = new Set(loadKommuner().map((k) => k.kommun_slug));
  const kommuner = form.getAll('kommuner').map(String).filter((slug) => giltigaSlugs.has(slug));

  if (!EMAIL_RE.test(email) || !samtycke || kommuner.length === 0) {
    return new Response('Ogiltig anmälan — e-post, samtycke och minst en kommun krävs.', { status: 400 });
  }

  await addSubscriber(email, kommuner);

  return redirect('/deadlines/?bevakning=klar', 303);
};
