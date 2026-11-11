import sharp from 'sharp';
import { access, copyFile, mkdir, stat, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const directory = resolve(import.meta.dirname, '../apps/masque-mini/public');
const archive = resolve(import.meta.dirname, '../art-source/mini-runtime-originals');
const images = [
  ['assets/myais/free-games-banner.png', 'assets/myais/free-games-banner.webp', 960],
  ['assets/myais/minigame-entry.png', 'assets/myais/minigame-entry.webp', 960],
  ['assets/ui-redesign/header/header-banner.jpg', 'assets/myais/game-zone-banner.webp', 960],
  ['assets/ui-redesign/games/game-mole-cover.jpg', 'assets/ui-redesign/games/game-mole-cover.webp', 960],
  ['assets/ui-redesign/games/game-fruit-cover.jpg', 'assets/ui-redesign/games/game-fruit-cover.webp', 960],
  ['assets/ui-redesign/games/game-duck-cover.jpg', 'assets/ui-redesign/games/game-duck-cover.webp', 960],
  ['assets/ui-redesign/gameflow/mole-intro-hero.jpg', 'assets/ui-redesign/gameflow/mole-intro-hero.webp', 960],
  ['images/mem.png', 'images/mem.webp', 640],
  ['assets/currency/ais-point.png', 'assets/currency/ais-point.webp', 128],
  ['assets/myais/phone-promotion.jpg', 'assets/myais/phone-promotion.webp', 400],
];
let before = 0;
let after = 0;
for (const [source, destination, width] of images) {
  const original = resolve(directory, source);
  const archived = resolve(archive, source);
  const output = resolve(directory, destination);
  await mkdir(dirname(archived), { recursive: true });
  let originalExists = false;
  try { await access(original); originalExists = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (originalExists) await copyFile(original, archived);
  const oldSize = (await stat(archived)).size;
  const result = await sharp(archived)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 100, effort: 6 })
    .toFile(output);
  if (originalExists) await unlink(original);
  before += oldSize;
  after += result.size;
  console.log(`${destination}: ${Math.round(oldSize / 1024)} KB -> ${Math.round(result.size / 1024)} KB`);
}
console.log(`Optimized image total: ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB (${Math.round((1 - after / before) * 100)}% smaller). Original files are preserved in art-source/mini-runtime-originals.`);