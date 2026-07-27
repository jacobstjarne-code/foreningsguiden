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

// https://astro.build/config
export default defineConfig({
  site: 'https://foreningsguiden.se',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !arOtacktKommunLandning(new URL(page).pathname),
      serialize(item) {
        const lastmod = lastmodForPath(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
});
