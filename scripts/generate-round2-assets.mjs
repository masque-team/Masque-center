import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const publicAssets = resolve(root, 'apps/masque-center/public/assets');
const artSource = resolve(root, 'art-source');

await mkdir(resolve(publicAssets, 'currency'), { recursive: true });
await mkdir(resolve(artSource, 'currency'), { recursive: true });
await mkdir(resolve(publicAssets, 'frames'), { recursive: true });
await mkdir(resolve(publicAssets, 'badges'), { recursive: true });

// 1. Generated AIS-inspired placeholder; not an approved official AIS asset.
const aisPointSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="coinFace" cx="44%" cy="32%" r="65%">
      <stop offset="0%" stop-color="#f2ffbd"/>
      <stop offset="28%" stop-color="#b4e81e"/>
      <stop offset="68%" stop-color="#69b800"/>
      <stop offset="100%" stop-color="#336e00"/>
    </radialGradient>
    <linearGradient id="outerBevel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffd6"/>
      <stop offset="30%" stop-color="#c9f438"/>
      <stop offset="68%" stop-color="#60ae00"/>
      <stop offset="100%" stop-color="#205200"/>
    </linearGradient>
    <linearGradient id="goldRing" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffef2"/>
      <stop offset="35%" stop-color="#ffe878"/>
      <stop offset="70%" stop-color="#ebb01e"/>
      <stop offset="100%" stop-color="#9e6700"/>
    </linearGradient>
    <linearGradient id="magentaArc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff85ca"/>
      <stop offset="45%" stop-color="#ec008c"/>
      <stop offset="100%" stop-color="#9c0058"/>
    </linearGradient>
    <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5ffbd"/>
      <stop offset="50%" stop-color="#a8e612"/>
      <stop offset="100%" stop-color="#4e9c00"/>
    </linearGradient>
    <filter id="pShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#194200" flood-opacity="0.48"/>
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#418000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- 3D Coin Extrusion Base -->
  <ellipse cx="256" cy="268" rx="216" ry="214" fill="#1e4900" filter="url(#softGlow)"/>
  <circle cx="256" cy="252" r="216" fill="url(#outerBevel)" stroke="#ffffff" stroke-width="10"/>
  <!-- Gold & Lime Inner Bevel Rings -->
  <circle cx="256" cy="252" r="192" fill="none" stroke="url(#goldRing)" stroke-width="14"/>
  <circle cx="256" cy="252" r="179" fill="url(#coinFace)" stroke="#e4ff85" stroke-width="4"/>

  <!-- Subtle Faceted Rays inside Coin -->
  <path d="M256 73 L296 252 L216 252 Z" fill="#ffffff" opacity="0.1"/>
  <path d="M77 252 L256 212 L256 292 Z" fill="#ffffff" opacity="0.08"/>
  <path d="M435 252 L256 212 L256 292 Z" fill="#ffffff" opacity="0.08"/>

  <!-- Top Gloss Reflection -->
  <path d="M 108 182 A 164 148 0 0 1 404 182 A 172 124 0 0 0 108 182 Z" fill="#ffffff" opacity="0.32"/>

  <!-- myAIS Magenta Dynamic Swoop & Orb -->
  <g filter="url(#pShadow)">
    <path d="M 294 106 C 362 104, 412 156, 396 226 C 370 184, 336 162, 286 156 C 276 134, 282 114, 294 106 Z" fill="url(#magentaArc)" stroke="#ffffff" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="354" cy="140" r="19" fill="url(#magentaArc)" stroke="#ffffff" stroke-width="5"/>
    <circle cx="348" cy="134" r="6" fill="#ffffff" opacity="0.8"/>
  </g>

  <!-- Central Embossed "P" Mark -->
  <g filter="url(#pShadow)">
    <path d="M 174 144 H 266 C 318 144, 352 173, 352 218 C 352 263, 318 292, 264 292 H 228 V 354 C 228 366, 218 376, 206 376 H 186 C 174 376, 164 366, 164 354 V 154 C 164 148, 168 144, 174 144 Z M 228 192 V 246 H 260 C 282 246, 294 235, 294 219 C 294 203, 282 192, 260 192 H 228 Z" fill="#ffffff" stroke="#eaffb0" stroke-width="3"/>
    <!-- Signature AIS Green Leaf Sprout on P -->
    <path d="M 266 130 C 300 106, 340 116, 346 148 C 316 164, 288 156, 266 130 Z" fill="url(#leafGrad)" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
  </g>

  <!-- Bottom Pill Label "AIS POINTS" -->
  <g filter="url(#pShadow)">
    <rect x="152" y="362" width="208" height="46" rx="23" fill="#1b4700" stroke="url(#goldRing)" stroke-width="5"/>
    <text x="256" y="393" text-anchor="middle" font-family="Kanit, Arial Black, sans-serif" font-weight="900" font-size="25" letter-spacing="2" fill="#ffffff">AIS POINTS</text>
  </g>

  <!-- Sparkle Highlights -->
  <path d="M 114 232 L 122 252 L 142 260 L 122 268 L 114 288 L 106 268 L 86 260 L 106 252 Z" fill="#ffffff"/>
  <path d="M 388 286 L 394 300 L 408 306 L 394 312 L 388 326 L 382 312 L 368 306 L 382 300 Z" fill="#fff9c4"/>
</svg>`;

const aisOut = resolve(publicAssets, 'currency/ais-point.png');
await sharp(Buffer.from(aisPointSvg)).png({ compressionLevel: 9 }).toFile(aisOut);
await copyFile(aisOut, resolve(artSource, 'currency/ais-point.png'));
console.log('Updated ais-point.png');

// 2. Richly Detailed 2.5D Collectible Profile Frames (5 Rarity Tiers)
function gemPolygon(cx, cy, r, fill, rim = '#ffffff') {
  return `<g transform="translate(${cx} ${cy})">
    <polygon points="0,-${r} ${r * 0.78},0 0,${r} -${r * 0.78},0" fill="${fill}" stroke="${rim}" stroke-width="4" stroke-linejoin="round"/>
    <polygon points="0,-${r * 0.65} ${r * 0.42},0 0,${r * 0.65} -${r * 0.42},0" fill="#ffffff" opacity="0.45"/>
  </g>`;
}

const frameConfigs = [
  {
    id: 'meadow', // Common
    cTop: '#e8fce0', cMid: '#74d66d', cBot: '#297a33',
    innerStroke: '#bdf7b5', outerStroke: '#ffffff',
    decor: `
      ${gemPolygon(256, 46, 24, '#38bdf8')}
      <circle cx="72" cy="72" r="16" fill="#a3e635" stroke="#ffffff" stroke-width="5"/>
      <circle cx="440" cy="72" r="16" fill="#a3e635" stroke="#ffffff" stroke-width="5"/>
      <circle cx="72" cy="440" r="16" fill="#a3e635" stroke="#ffffff" stroke-width="5"/>
      <circle cx="440" cy="440" r="16" fill="#a3e635" stroke="#ffffff" stroke-width="5"/>
      <path d="M210 464 Q256 484 302 464" fill="none" stroke="#d9f99d" stroke-width="8" stroke-linecap="round"/>
    `,
  },
  {
    id: 'ocean', // Rare
    cTop: '#e0f7ff', cMid: '#38bdf8', cBot: '#0369a1',
    innerStroke: '#bae6fd', outerStroke: '#ffffff',
    decor: `
      <!-- Top Shell & Aqua Gem -->
      <path d="M188 54 Q256 12 324 54 Q290 76 256 72 Q222 76 188 54 Z" fill="#7dd3fc" stroke="#ffffff" stroke-width="5"/>
      ${gemPolygon(256, 44, 28, '#0284c7')}
      <!-- Side Fins -->
      <path d="M40 200 Q10 256 40 312 L68 288 Q52 256 68 224 Z" fill="#7dd3fc" stroke="#ffffff" stroke-width="5"/>
      <path d="M472 200 Q502 256 472 312 L444 288 Q460 256 444 224 Z" fill="#7dd3fc" stroke="#ffffff" stroke-width="5"/>
      <!-- Corner Pearls -->
      <circle cx="74" cy="74" r="18" fill="#e0f2fe" stroke="#38bdf8" stroke-width="5"/>
      <circle cx="438" cy="74" r="18" fill="#e0f2fe" stroke="#38bdf8" stroke-width="5"/>
      <circle cx="74" cy="438" r="18" fill="#e0f2fe" stroke="#38bdf8" stroke-width="5"/>
      <circle cx="438" cy="438" r="18" fill="#e0f2fe" stroke="#38bdf8" stroke-width="5"/>
      <path d="M168 462 Q256 496 344 462" fill="none" stroke="#7dd3fc" stroke-width="10" stroke-linecap="round"/>
    `,
  },
  {
    id: 'sunrise', // Epic
    cTop: '#fff3c4', cMid: '#f59e0b', cBot: '#7e22ce',
    innerStroke: '#fde68a', outerStroke: '#ffffff',
    decor: `
      <!-- Royal Sunburst Crown -->
      <path d="M162 60 L196 18 L230 48 L256 8 L282 48 L316 18 L350 60 Z" fill="#fbbf24" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
      ${gemPolygon(256, 44, 26, '#ec4899')}
      <!-- Side Wing Crests -->
      <path d="M44 166 Q6 220 26 296 Q46 318 68 286 Q54 232 68 184 Z" fill="#c084fc" stroke="#ffffff" stroke-width="5"/>
      <path d="M468 166 Q506 220 486 296 Q466 318 444 286 Q458 232 444 184 Z" fill="#c084fc" stroke="#ffffff" stroke-width="5"/>
      ${gemPolygon(72, 72, 20, '#f59e0b')}
      ${gemPolygon(440, 72, 20, '#f59e0b')}
      ${gemPolygon(72, 440, 20, '#c084fc')}
      ${gemPolygon(440, 440, 20, '#c084fc')}
      ${gemPolygon(256, 466, 22, '#fbbf24')}
    `,
  },
  {
    id: 'celestial', // Legendary
    cTop: '#fffef0', cMid: '#fbbf24', cBot: '#b45309',
    innerStroke: '#fef08a', outerStroke: '#ffffff',
    decor: `
      <!-- Grand Seraph Wings Left & Right -->
      <path d="M52 248 Q-2 178 34 96 Q68 124 78 172 Q42 152 28 190 Q58 192 72 224 Z" fill="#fffbeb" stroke="#f59e0b" stroke-width="6" stroke-linejoin="round"/>
      <path d="M460 248 Q514 178 478 96 Q444 124 434 172 Q470 152 484 190 Q454 192 440 224 Z" fill="#fffbeb" stroke="#f59e0b" stroke-width="6" stroke-linejoin="round"/>
      <!-- Imperial Sovereign Crown -->
      <path d="M142 64 L168 10 L214 44 L256 2 L298 44 L344 10 L370 64 Z" fill="#fde047" stroke="#ffffff" stroke-width="7" stroke-linejoin="round"/>
      ${gemPolygon(256, 40, 30, '#0ea5e9')}
      ${gemPolygon(194, 46, 16, '#f43f5e')}
      ${gemPolygon(318, 46, 16, '#f43f5e')}
      <!-- Bottom Golden Crest -->
      <path d="M180 462 L256 502 L332 462 L306 438 H206 Z" fill="#fbbf24" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
      ${gemPolygon(256, 468, 22, '#f43f5e')}
      ${gemPolygon(68, 438, 22, '#38bdf8')}
      ${gemPolygon(444, 438, 22, '#38bdf8')}
    `,
  },
  {
    id: 'krathong', // Seasonal / Event
    cTop: '#ffe4f2', cMid: '#fb7185', cBot: '#9d174d',
    innerStroke: '#fecdd3', outerStroke: '#fde047',
    decor: `
      <!-- Top Golden Candle & Lotus Crown -->
      <path d="M196 56 Q226 18 256 44 Q286 18 316 56 Q286 78 256 74 Q226 78 196 56 Z" fill="#f43f5e" stroke="#ffffff" stroke-width="5"/>
      <path d="M256 6 Q276 28 256 52 Q236 28 256 6 Z" fill="#fde047" stroke="#ffffff" stroke-width="4"/>
      <!-- Bottom Lotus Petals -->
      <path d="M142 454 Q198 408 256 446 Q314 408 370 454 Q316 498 256 490 Q196 498 142 454 Z" fill="#f43f5e" stroke="#ffffff" stroke-width="6"/>
      <path d="M204 460 Q256 414 308 460 Q256 492 204 460 Z" fill="#fda4af" stroke="#ffffff" stroke-width="5"/>
      ${gemPolygon(256, 464, 20, '#fde047')}
      <!-- Side Lantern Gems -->
      <circle cx="52" cy="256" r="20" fill="#fde047" stroke="#ffffff" stroke-width="5"/>
      <circle cx="460" cy="256" r="20" fill="#fde047" stroke="#ffffff" stroke-width="5"/>
    `,
  },
];

for (const f of frameConfigs) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="grad-${f.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${f.cTop}"/>
        <stop offset="48%" stop-color="${f.cMid}"/>
        <stop offset="100%" stop-color="${f.cBot}"/>
      </linearGradient>
      <filter id="drop-${f.id}" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="${f.cBot}" flood-opacity="0.48"/>
      </filter>
    </defs>
    <g filter="url(#drop-${f.id})">
      <path fill-rule="evenodd" d="
        M 136 34 H 376 A 102 102 0 0 1 478 136 V 376 A 102 102 0 0 1 376 478 H 136 A 102 102 0 0 1 34 376 V 136 A 102 102 0 0 1 136 34 Z
        M 148 76 H 364 A 72 72 0 0 1 436 148 V 364 A 72 72 0 0 1 364 436 H 148 A 72 72 0 0 1 76 364 V 148 A 72 72 0 0 1 148 76 Z
      " fill="url(#grad-${f.id})" stroke="${f.outerStroke}" stroke-width="7"/>
      <rect x="64" y="64" width="384" height="384" rx="84" fill="none" stroke="${f.innerStroke}" stroke-width="5" opacity="0.9"/>
      ${f.decor}
    </g>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile(resolve(publicAssets, 'frames', `frame-${f.id}.webp`));
}
console.log('Updated 5 ornate 2.5D profile frames');

// 3. Richly Detailed 2.5D Achievement Badges (Matching existing first-finish / explorer / frequent-player style)
const badgeConfigs = [
  {
    id: 'games-played-50',
    ribbon1: '#38bdf8', ribbon2: '#0284c7',
    core1: '#e0f2fe', core2: '#0369a1',
    gem: '#38bdf8',
    emblem: `
      <!-- Golden Gamepad + Star -->
      <rect x="166" y="218" width="180" height="108" rx="48" fill="url(#goldMetal)" stroke="#ffffff" stroke-width="6"/>
      <path d="M214 252 V288 M196 270 H232" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>
      <circle cx="296" cy="256" r="10" fill="#ef4444"/><circle cx="318" cy="276" r="10" fill="#38bdf8"/>
      <text x="256" y="202" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="44" fill="#ffffff" stroke="#0c4a6e" stroke-width="4">50</text>
    `,
  },
  {
    id: 'games-played-100',
    ribbon1: '#c084fc', ribbon2: '#7e22ce',
    core1: '#fae8ff', core2: '#6b21a8',
    gem: '#ec4899',
    emblem: `
      <!-- Royal Crown + 100 -->
      <path d="M174 248 L192 184 L228 216 L256 168 L284 216 L320 184 L338 248 Z" fill="url(#goldMetal)" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
      <text x="256" y="318" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="52" fill="#fde047" stroke="#581c87" stroke-width="5">100</text>
    `,
  },
  {
    id: 'checkin-streak-7',
    ribbon1: '#fb923c', ribbon2: '#c2410c',
    core1: '#ffedd5', core2: '#b45309',
    gem: '#f43f5e',
    emblem: `
      <!-- Vivid Flame + 7D -->
      <path d="M256 156 C298 202, 326 244, 304 298 C292 326, 220 326, 208 298 C186 244, 214 202, 256 156 Z" fill="#f97316" stroke="#ffffff" stroke-width="6"/>
      <path d="M256 196 C280 226, 294 254, 280 290 C272 308, 240 308, 232 290 C218 254, 232 226, 256 196 Z" fill="#fde047"/>
      <text x="256" y="302" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="46" fill="#ffffff" stroke="#7c2d12" stroke-width="4">7D</text>
    `,
  },
  {
    id: 'all-game-genres',
    ribbon1: '#34d399', ribbon2: '#059669',
    core1: '#d1fae5', core2: '#065f46',
    gem: '#10b981',
    emblem: `
      <!-- 4-Point Compass Star + Gems -->
      <polygon points="256,162 282,234 354,260 282,286 256,358 230,286 158,260 230,234" fill="url(#goldMetal)" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="256" cy="260" r="26" fill="#10b981" stroke="#ffffff" stroke-width="5"/>
    `,
  },
  {
    id: 'high-score-10000',
    ribbon1: '#fbbf24', ribbon2: '#b45309',
    core1: '#fef3c7', core2: '#92400e',
    gem: '#38bdf8',
    emblem: `
      <!-- Trophy Cup + 10K -->
      <path d="M198 184 H314 V238 C314 276 286 298 256 298 C226 298 198 276 198 238 Z" fill="url(#goldMetal)" stroke="#ffffff" stroke-width="6"/>
      <rect x="236" y="294" width="40" height="32" fill="url(#goldMetal)"/>
      <rect x="206" y="322" width="100" height="22" rx="10" fill="url(#goldMetal)" stroke="#ffffff" stroke-width="4"/>
      <text x="256" y="254" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="38" fill="#ffffff" stroke="#78350f" stroke-width="3">10K</text>
    `,
  },
  {
    id: 'campaign-joins-3',
    ribbon1: '#818cf8', ribbon2: '#4338ca',
    core1: '#e0e7ff', core2: '#312e81',
    gem: '#f59e0b',
    emblem: `
      <!-- Crossed Campaign Banners + 3X -->
      <rect x="184" y="190" width="144" height="114" rx="22" fill="url(#goldMetal)" stroke="#ffffff" stroke-width="6"/>
      <text x="256" y="266" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="50" fill="#ffffff" stroke="#1e1b4b" stroke-width="4">3X</text>
    `,
  },
  {
    id: 'campaign-completed-1',
    ribbon1: '#fb7185', ribbon2: '#be123c',
    core1: '#ffe4e6', core2: '#881337',
    gem: '#fde047',
    emblem: `
      <!-- Victory Star & Laurel -->
      <polygon points="256,166 280,224 344,230 296,272 310,334 256,300 202,334 216,272 168,230 232,224" fill="url(#goldMetal)" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="256" cy="258" r="22" fill="#f43f5e" stroke="#ffffff" stroke-width="4"/>
    `,
  },
];

for (const b of badgeConfigs) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="goldMetal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="38%" stop-color="#fde047"/>
        <stop offset="75%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#a16207"/>
      </linearGradient>
      <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="65%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#93c5fd"/>
      </linearGradient>
      <linearGradient id="rib-${b.id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${b.ribbon1}"/>
        <stop offset="100%" stop-color="${b.ribbon2}"/>
      </linearGradient>
      <radialGradient id="core-${b.id}" cx="45%" cy="35%" r="65%">
        <stop offset="0%" stop-color="${b.core1}"/>
        <stop offset="100%" stop-color="${b.core2}"/>
      </radialGradient>
      <filter id="bShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#1e293b" flood-opacity="0.38"/>
      </filter>
    </defs>
    <g filter="url(#bShadow)">
      <!-- Top Medal Ribbon -->
      <rect x="164" y="38" width="184" height="24" rx="12" fill="url(#goldMetal)" stroke="#ffffff" stroke-width="4"/>
      <path d="M182 58 H330 L306 146 H206 Z" fill="url(#rib-${b.id})" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
      <path d="M232 58 H280 L272 146 H240 Z" fill="#fef9c3" opacity="0.85"/>

      <!-- Left & Right Angelic Wings -->
      <path d="M126 230 Q36 164 62 264 Q36 286 78 326 Q58 352 128 356 Z" fill="url(#wingGrad)" stroke="url(#goldMetal)" stroke-width="7" stroke-linejoin="round"/>
      <path d="M386 230 Q476 164 450 264 Q476 286 434 326 Q454 352 384 356 Z" fill="url(#wingGrad)" stroke="url(#goldMetal)" stroke-width="7" stroke-linejoin="round"/>

      <!-- Outer Gold Medallion Rim -->
      <circle cx="256" cy="264" r="144" fill="url(#goldMetal)" stroke="#ffffff" stroke-width="8"/>
      <circle cx="256" cy="264" r="122" fill="url(#core-${b.id})" stroke="url(#goldMetal)" stroke-width="8"/>

      <!-- Top & Bottom Gem Accents -->
      ${gemPolygon(256, 124, 24, b.gem)}
      ${gemPolygon(256, 404, 26, b.gem)}
      ${gemPolygon(118, 264, 18, b.gem)}
      ${gemPolygon(394, 264, 18, b.gem)}

      <!-- Center Emblem -->
      ${b.emblem}
    </g>
  </svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(resolve(publicAssets, 'badges', `${b.id}.png`));
}
console.log('Updated 7 high-detail 2.5D achievement badges');

