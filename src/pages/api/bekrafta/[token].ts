// GET /api/bekrafta/{token}/ — dubbel opt-in-bekräftelse (SPRINT §Spår A).
// Klick på länken i MEJL.bekraftelse. Bekräftar prenumeranten, skickar
// MEJL.valkomst, redirectar till en kort bekräftelsenotis på /deadlines/.
// Obekräftade adresser (token saknas/utgånget) får inga påminnelser —
// ingen bevakning startar utan detta steg.
//
// Rotorsak till att token flyttades från querysträng (?token=...) till
// path-parameter: ett skarpt test mot en riktig inkorg visade att "="-
// tecknet i frågesträngen kolliderade med mejltransportens quoted-
// printable-radbrytning och korrumperade token mitt i URL:en
// ("token=f9cb59..." blev "token�f9cb59..."). Path-parametrar har inget
// "="-tecken alls, så problemet försvinner strukturellt istället för att
// lappas.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getKommunBySlug, svenskLista } from '../../../lib/kommuner';
import { confirmSubscriberByToken } from '../../../lib/subscribers';
import { sendValkomst, siteUrl } from '../../../lib/mejl';

export const GET: APIRoute = async ({ params, redirect }) => {
  const token = params.token;
  if (!token) return redirect('/deadlines/?bevakning=ogiltig', 303);

  const subscriber = await confirmSubscriberByToken(token);
  if (!subscriber) return redirect('/deadlines/?bevakning=ogiltig', 303);

  const kommunNamn = subscriber.kommuner
    .map((slug) => getKommunBySlug(slug)?.kommun)
    .filter((namn): namn is string => !!namn);
  // Länkar bara till den första bevakade kommunen om flera valdes — mejlet
  // hänvisar till "vad som gäller er kommun", inte en lista av länkar.
  const forstaSlug = subscriber.kommuner[0];
  const kommunLank = `${siteUrl()}/kommun/${forstaSlug}/`;

  await sendValkomst(subscriber.email, svenskLista(kommunNamn), kommunLank);

  return redirect('/deadlines/?bevakning=bekraftad', 303);
};
