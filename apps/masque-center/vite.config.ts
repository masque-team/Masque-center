import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    base: env.VITE_PUBLIC_BASE || (mode === 'development' ? '/maque-center/' : '/masque-gamecenter/masque-center/'),
    plugins: [svelte(), tailwindcss()],
  };
});