import { mount } from 'svelte';
import App from './App.svelte';
import { loadGameCatalog } from './lib/data/games';

const target = document.getElementById('app')!;
loadGameCatalog().then(() => {
  mount(App, { target });
}).catch((error: unknown) => {
  console.error('Game catalog error:', error);
  target.textContent = `ไม่สามารถโหลดรายการเกมได้ กรุณาตรวจสอบ games.json: ${error instanceof Error ? error.message : String(error)}`;
});