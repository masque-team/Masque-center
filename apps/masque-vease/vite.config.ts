import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_PUBLIC_BASE || (mode === 'development' ? '/' : '/masque-gamecenter/masque-vease/'),
    plugins: [svelte(), tailwindcss()],
    server: { host: '0.0.0.0', port: 5174, strictPort: true },
    build: { outDir: 'dist' },
  }
})
