// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadKommuner } from './src/lib/kommuner.ts';

// lastmod per kommunsida/kategorisida ur `verifierad`-fältet (§5 UPPDRAG_POC.md).
const verifieradPerSlug = new Map(loadKommuner().map((k) => [k.kommun_slug, k.verifierad]));

function lastmodForPath(pathname) {
  const match = pathname.match(/^\/kommun\/([a-z0-9-]+)\//);
  const verifierad = match ? verifieradPerSlug.get(match[1]) : undefined;
  return verifierad ? new Date(verifierad) : undefined;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://foreningsguiden.se',
  output: 'static',
  integrations: [
    sitemap({
      serialize(item) {
        const lastmod = lastmodForPath(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
});
