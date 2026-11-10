import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'art-source/mini-characters');
const destination = resolve(root, 'apps/masque-mini/public/assets/characters');
const characters = [
  ['aqua', 'image 55685.png'],
  ['flora', 'image 55686.png'],
  ['blaze', 'image 55687.png'],
  ['mint', 'image 55684.png'],
];

await mkdir(destination, { recursive: true });
for (const [id, file] of characters) {
  const image = sharp(resolve(source, file));
  const { width, height } = await image.metadata();
  await image.clone()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 12 })
    .resize({ height: 768 })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(resolve(destination, `${id}.webp`));
  const size = Math.round(width * .72);
  await image.clone()
    .extract({ left: Math.round((width - size) / 2), top: Math.round(height * .025), width: size, height: size })
    .resize(256, 256)
    .webp({ quality: 88 })
    .toFile(resolve(destination, `${id}-portrait.webp`));
  console.log(`${id}: transparent full-body artwork and 256x256 portrait from ${width}x${height} source`);
}