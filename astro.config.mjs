// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // `site` sätts när domänbeslutet (§9.1 i UPPDRAG_POC.md) är klart —
  // krävs för korrekta canonical-URL:er och sitemap i steg 3.
  output: 'static',
});
