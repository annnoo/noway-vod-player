// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import solid from '@astrojs/solid-js';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  // Enable many frameworks to support all different kinds of components.
  integrations: [
      preact({ include: ['**/preact/*'] }),
      solid({ include: ['**/solid/*'] }),
      react({ include: ['**/react/*'] }),
      svelte(),
      vue(),
    ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});