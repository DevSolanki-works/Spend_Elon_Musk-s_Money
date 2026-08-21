// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Real domain — update here once and every page's canonical/OG/sitemap URL follows.
  site: 'https://how-rich-is-too-rich.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
