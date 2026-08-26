// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { loadKommuner } from './src/lib/kommuner.ts';

// lastmod per kommunsida/kategorisida ur `verifierad`-fältet (§5 UPPDRAG_POC.md).
const verifieradPerSlug = new Map(loadKommuner().map((k) => [k.kommun_slug, k.verifierad]));

function lastmodForPath(pathname) {
  const match = pathname.match(/^\/kommun\/([a-z0-9-]+)\//);
  const verifierad = match ? verifieradPerSlug.get(match[1]) : undefined;
  return verifierad ? new Date(verifierad) : undefined;
}

// H4 (SPEC_ATERSTAENDE_HAL.md, Kluster 4): kommun/[slug]/index.astro
// genererar numera EN sida per alla 290 KOMMUNFACIT-slugs, inte bara de
// med datafil — de otäckta landar i KommunLandningsSida (noindex, se den
// filens motivering). Ett noindexat formulär-skal hör inte hemma i
// sitemapen — samma resonemang som Base.astro:s noindex-flagga, bara på
// sitemap-sidan av samma beslut.
function arOtacktKommunLandning(pathname) {
  const match = pathname.match(/^\/kommun\/([a-z0-9-]+)\/$/);
  return match ? !verifieradPerSlug.has(match[1]) : false;
}

// M2.2 (Jacob 2026-08-17): noindex-sidor (Base noindex={true} — admin,
// avregistrera, mina-sidor, utkastvyerna) hamnade ändå i sitemapen, samma
// klass av läcka som H4 ovan. 2808 utkast-URL:er var störst — ett internt
// personligt förhandsvisningsläge, inte en sökbar sida.
function arNoindexadYta(pathname) {
  return (
    pathname === '/admin/' ||
    pathname === '/avregistrera/' ||
    pathname.startsWith('/mina-sidor/') ||
    /^\/kommun\/[a-z0-9-]+\/utkast\//.test(pathname)
  );
}

// https://astro.build/config
export default defineConfig({
  site: 'https://foreningsguiden.se',
  output: 'static',
  adapter: vercel(),
  // AB1.2 (Jacobs order, Astro 6→7-uppgraderingen): Astro 7 bytte
  // compressHTML:s default till 'jsx' (React-liknande whitespace-strip
  // mellan element) — kan ändra renderad mellanrumsstruktur i text som
  // sätts ihop av flera element (t.ex. "Vald: <strong>{namn}</strong>").
  // Astros egen changelog: "set compressHTML: true" för att behålla
  // 6.x:s beteende. Explicit satt, inte antaget — undviker en tyst
  // whitespace-regression samtidigt som säkerhetsuppgraderingen görs.
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !arOtacktKommunLandning(pathname) && !arNoindexadYta(pathname);
      },
      serialize(item) {
        const lastmod = lastmodForPath(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  // V6 (rättning 2026-08-19): Astro inlinear tyst en <script>-chunk som
  // saknar egna imports och ligger under assetsInlineLimit (Vite-default
  // 4096 B) — se node_modules/astro/dist/core/build/plugins/plugin-
  // scripts.js. Sajtens CSP (vercel.json) är script-src 'self' (ingen
  // 'unsafe-inline', ingen nonce), så ett inlinat skript tystnar helt i
  // en riktig webbläsare — hände på IdrottsIngangen.astro:s bevaknings-
  // formulär, som då föll tillbaka på webbläsarens default (GET mot
  // sidans egen URL, mejladressen i frågesträngen). Ett import i
  // källfilen räcker INTE ensamt — Rollup slår ihop en enda-konsument-
  // modul i samma chunk om inget annat importerar den, så chunken kan
  // fortfarande hamna under gränsen. assetsInlineLimit: 0 stänger av
  // storleksbaserad inlining av JS-chunkar helt, sajtsbrett och
  // permanent — nästa komponent som råkar skriva ett litet importfritt
  // skript ska inte kunna återintroducera samma tystnad.
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
