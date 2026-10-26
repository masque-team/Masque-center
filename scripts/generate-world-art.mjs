import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'public/assets/world');
await mkdir(resolve(output, 'actors'), { recursive: true });

const palettes = [
  { id: 'coral', wall: '#fff2e9', accent: '#df776d', roof: '#c95d64' },
  { id: 'sky', wall: '#eff8fa', accent: '#479fbc', roof: '#367b9d' },
  { id: 'lemon', wall: '#fff9e7', accent: '#dcae4f', roof: '#b98745' },
  { id: 'lilac', wall: '#f4f1fb', accent: '#9a87bd', roof: '#766799' },
];

for (const palette of palettes) {
  const windows = [100, 300, 500, 700].map((left) => `<g transform="translate(${left} 110)"><rect width="126" height="164" rx="55" fill="${palette.accent}"/><rect x="11" y="12" width="104" height="141" rx="45" fill="#254c67"/><path d="M23 30h38v110H23z" fill="#a7dfef" opacity=".75"/><path d="M64 12v141M12 80h102" stroke="#fff6e9" stroke-width="9"/><rect x="-9" y="158" width="144" height="15" rx="4" fill="${palette.accent}"/></g>`).join('');
  const facade = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="${palette.wall}"/><path d="M0 40h960M0 320h960M0 600h960" stroke="${palette.accent}" stroke-width="14"/><path d="M30 0v640M930 0v640" stroke="${palette.accent}" stroke-width="30"/>${windows}<rect x="381" y="363" width="198" height="277" rx="72" fill="${palette.accent}"/><rect x="401" y="383" width="158" height="257" rx="56" fill="#315c73"/><rect x="414" y="466" width="131" height="150" rx="8" fill="#c3e4e7"/><path d="M480 394v224" stroke="${palette.wall}" stroke-width="10"/><circle cx="518" cy="535" r="8" fill="#f8cb69"/><path d="M64 387h217v116H64zM679 387h217v116H679z" fill="#b5dce7" stroke="${palette.accent}" stroke-width="13"/><path d="M172 392v104M787 392v104" stroke="${palette.wall}" stroke-width="9"/><rect x="55" y="508" width="235" height="28" rx="7" fill="${palette.accent}"/><rect x="670" y="508" width="235" height="28" rx="7" fill="${palette.accent}"/><g opacity=".2" fill="${palette.accent}"><rect x="50" y="570" width="70" height="18"/><rect x="120" y="592" width="70" height="18"/><rect x="830" y="555" width="70" height="18"/></g></svg>`;
  await sharp(Buffer.from(facade)).webp({ quality: 88 }).toFile(resolve(output, `facade-${palette.id}.webp`));
  const roof = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="${palette.roof}"/><defs><pattern id="tiles" width="64" height="48" patternUnits="userSpaceOnUse"><path d="M0 0v28q32 30 64 0V0" fill="none" stroke="#ffffff" stroke-opacity=".22" stroke-width="3"/><path d="M0 47h64" stroke="#342a45" stroke-opacity=".12" stroke-width="4"/></pattern></defs><rect width="512" height="512" fill="url(#tiles)"/></svg>`;
  await sharp(Buffer.from(roof)).webp({ quality: 86 }).toFile(resolve(output, `roof-${palette.id}.webp`));
  const postcard = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e0f2f6"/><path d="M0 330L640 260v160H0" fill="#c8e0e9"/><ellipse cx="335" cy="353" rx="210" ry="30" fill="#7599b2" opacity=".17"/><path d="M160 155l210 20v166l-210-25z" fill="${palette.wall}"/><path d="M370 175l100-62v190l-100 38z" fill="${palette.accent}"/><path d="M130 170l122-113 160 19-42 119z" fill="${palette.roof}"/><path d="M370 195l42-119 94 55-36 55z" fill="${palette.accent}"/><path d="M262 240l57 6v86l-57-6z" fill="#325e77"/><path d="M188 207l40 5v49l-40-5zM332 222l24 3v47l-24-3z" fill="#7abfd3" stroke="${palette.accent}" stroke-width="7"/><path d="M402 217l35-20v46l-35 21z" fill="#b8e6f0"/><path d="M176 281l57 6v16l-57-6zM322 295l43 4v16l-43-4z" fill="${palette.accent}"/><path d="M242 229l88 10 6 21-99-12z" fill="${palette.roof}"/><path d="M260 339l63 7 15 12-72-7z" fill="#f8fcff"/><rect x="290" y="60" width="25" height="44" fill="${palette.wall}"/><path d="M283 60h39v12h-39" fill="${palette.roof}"/></svg>`;
  await sharp(Buffer.from(postcard)).webp({ quality: 88 }).toFile(resolve(output, `house-${palette.id}.webp`));
}

const paving = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#e6e9eb"/><defs><pattern id="paving" width="128" height="128" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="60" height="60" rx="5" fill="#f5f5f2"/><rect x="66" y="2" width="60" height="60" rx="5" fill="#e2e9eb"/><rect x="2" y="66" width="60" height="60" rx="5" fill="#edf0ed"/><rect x="66" y="66" width="60" height="60" rx="5" fill="#f6f4ef"/></pattern></defs><rect width="512" height="512" fill="url(#paving)"/></svg>`;
await sharp(Buffer.from(paving)).webp({ quality: 88 }).toFile(resolve(output, 'paving.webp'));

for (const kind of ['avatars', 'pets']) {
  for (const file of await readdir(resolve(root, 'public/assets', kind))) {
    if (!file.endsWith('.webp')) continue;
    await sharp(resolve(root, 'public/assets', kind, file)).trim({ threshold: 12 }).resize({ height: 512 }).extend({ top: 4, bottom: 4, left: 4, right: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 86 }).toFile(resolve(output, 'actors', `${kind}-${file}`));
  }
}
console.log('Generated Masque Vease facades, tiled roofs, house postcards, paving and trimmed 2D actors.');