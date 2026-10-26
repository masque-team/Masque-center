import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const destination = fileURLToPath(new URL('../public/assets/wings/', import.meta.url));
await mkdir(destination, { recursive: true });
const palettes = [
  { id: 'sky-feather', light: '#ffffff', main: '#a4e4ff', edge: '#498db8', gem: '#48c4ed' },
  { id: 'sunrise-seraph', light: '#fffce7', main: '#ffe28c', edge: '#cc8944', gem: '#ed92ab' },
];

for (const palette of palettes) {
  const feathers = Array.from({ length: 7 }, (_, index) => {
    const angle = -42 + index * 12;
    const length = 350 - index * 23;
    return `<path transform="rotate(${angle} 512 563)" d="M512 563 Q${450 - index * 5} 365 ${512 - length} ${230 + index * 29} Q${155 + index * 24} 570 512 655Z" fill="url(#feather)" stroke="${palette.edge}" stroke-width="5" stroke-linejoin="round"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><linearGradient id="feather" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${palette.light}"/><stop offset=".65" stop-color="${palette.main}"/><stop offset="1" stop-color="${palette.edge}"/></linearGradient></defs><g>${feathers}</g><g transform="translate(1024 0) scale(-1 1)">${feathers}</g><path d="M512 504L552 563L512 622L472 563Z" fill="${palette.gem}" stroke="${palette.light}" stroke-width="9"/><path d="M493 559L512 530L527 552" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"/></svg>`;
  const output = `${destination}${palette.id}.png`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(output);
  const info = await sharp(output).metadata();
  if (info.width !== 1024 || info.height !== 1024 || !info.hasAlpha) throw new Error(`Invalid wing output: ${palette.id}`);
  console.log(`${palette.id}.png: ${info.width}x${info.height}, transparent PNG`);
}