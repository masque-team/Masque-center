import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : '/masque-gamecenter/masque-mini1/',
  plugins: [svelte(), tailwindcss()],
}));