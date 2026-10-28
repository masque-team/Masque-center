import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const destination = fileURLToPath(new URL('../public/assets/points/', import.meta.url));
await mkdir(destination, { recursive: true });
const names = ['pocket', 'pouch', 'chest', 'treasure', 'tower', 'royal'];
function crystal(x, y, scale, rotation) {
  return `<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})"><path d="M0-65L35-25L24 40L0 68L-30 30L-36-25Z" fill="#31bfff" stroke="#d5fbff" stroke-width="4"/><path d="M0-65L-9-15L0 68L12-18Z" fill="#e2ffff"/><path d="M0-65L35-25L12-18Z" fill="#88efff"/><path d="M35-25L24 40L12-18Z" fill="#137eea"/><path d="M-36-25L-9-15L-30 30Z" fill="#2394f0"/><path d="M-9-15L12-18L0 68Z" fill="#6ce6ff"/></g>`;
}
for (const [index, name] of names.entries()) {
  const gems = Array.from({ length: 10 + index * 3 }, (_, gem) => {
    const angle = gem * 2.4;
    const radius = 30 + gem % 6 * 20;
    return crystal(256 + Math.sin(angle) * radius, 318 + Math.cos(angle) * radius * 0.4 - gem % 4 * 19, 0.5 + gem % 4 * 0.17, Math.sin(angle) * 35);
  }).join('');
  const coins = Array.from({ length: 3 + index }, (_, coin) => `<g transform="translate(${105 + coin * 39} ${382 + Math.sin(coin * 2) * 17})"><ellipse rx="34" ry="13" cy="8" fill="#b97a13"/><ellipse rx="34" ry="13" fill="#ffcb4b" stroke="#fff4bc" stroke-width="4"/><ellipse rx="23" ry="7" fill="none" stroke="#e9a323" stroke-width="3"/></g>`).join('');
  const container = index === 1 ? '<path d="M178 235Q146 260 155 350Q256 420 355 350Q370 260 332 235Z" fill="#8762d8" stroke="#d8c6ff" stroke-width="7"/><path d="M183 245Q256 270 330 245" fill="none" stroke="#ffd66f" stroke-width="12"/>' : index >= 2 ? `<path d="M133 250L366 250L382 365Q255 414 130 365Z" fill="${index === 5 ? '#9263d4' : '#c9873b'}" stroke="#ffdf82" stroke-width="10"/><path d="M133 270L366 270M180 253L180 380M321 253L321 380" stroke="#ffdf82" stroke-width="12"/><rect x="237" y="297" width="40" height="46" rx="8" fill="#ffe3a0"/>` : '';
  const crown = index === 5 ? '<path d="M160 182L141 107L205 145L256 77L306 145L370 107L351 182Z" fill="#ffcf4d" stroke="#fff0aa" stroke-width="7"/><path d="M160 191L351 191" stroke="#d69126" stroke-width="14"/>' : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><ellipse cx="256" cy="404" rx="185" ry="18" fill="#8fc5e4" opacity=".24"/>${container}${gems}${crown}${coins}<path d="M83 171L90 194L112 201L90 208L83 231L76 208L54 201L76 194Z" fill="#ffe88a"/><path d="M420 268L426 284L442 290L426 296L420 312L414 296L398 290L414 284Z" fill="#fff0b0"/></svg>`;
  const output = `${destination}${name}.png`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(output);
  const info = await sharp(output).metadata();
  if (info.width !== 512 || info.height !== 512 || !info.hasAlpha) throw new Error(`Invalid point art: ${name}`);
  console.log(`${name}.png: 512x512 RGBA`);
}