/**
 * /api/nationell-rackvidd.json — AH1.8: betalrutans "återanvänds i N
 * bidrag i hela Sverige" (mock 22d, F6). R2 håller den löpande
 * räckviddsraden kommun-scopad — "det nationella talet finns bara i
 * betalrutan" — men samma regel gäller båda: läses ur kravtabellen,
 * inget hårdkodat.
 *
 * Unionen (inte summan) av nationella aktivitetsbidrag vars kravrader
 * kräver ETT ELLER FLERA av de angivna fälten — annars dubbelräknas
 * bidrag som kräver flera av hennes redan besvarade fält. Den giriga
 * corpus-analysen (aktivitetsbidragKorpus.ts, samma heuristik som
 * analyze-krav-koppling.ts) körs bara på servern (node:fs) — därför en
 * egen route i stället för att skicka hela korpusen till klienten.
 *
 * ?falt=a,b,c — kommaseparerad lista av faltId:n (hennes besvarade fält).
 */
import type { APIRoute } from 'astro';
import { samlaAktivitetsbidrag } from '../../lib/aktivitetsbidragKorpus.ts';
import { byggBidragMedKravRader } from '../../lib/raknare.ts';

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const faltParam = url.searchParams.get('falt') ?? '';
  const falt = new Set(faltParam.split(',').map((f) => f.trim()).filter(Boolean));

  const bidrag = byggBidragMedKravRader(samlaAktivitetsbidrag());
  const antal = falt.size === 0 ? 0 : bidrag.filter((b) => b.kravRader.some((rad) => rad.faltIds.some((f) => falt.has(f)))).length;

  return new Response(JSON.stringify({ antal, totalt: bidrag.length }), {
    headers: { 'content-type': 'application/json' },
  });
};
