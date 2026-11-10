import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const width = 1080;
const height = 1920;
const pixels = Buffer.alloc(width * height * 3);
const center = width / 2;
const floorHorizon = 1250;
const pillars = [
  { x: 48, top: 740, end: 1365, color: [135, 42, 255] },
  { x: 110, top: 830, end: 1390, color: [0, 205, 255] },
  { x: 180, top: 1015, end: 1340, color: [21, 166, 255] },
  { x: 900, top: 1015, end: 1340, color: [147, 38, 255] },
  { x: 970, top: 830, end: 1390, color: [0, 205, 255] },
  { x: 1032, top: 740, end: 1365, color: [237, 37, 255] },
];

function falloff(distance, radius) {
  return Math.exp(-((distance / radius) ** 2));
}

function addLight(color, light, intensity) {
  color[0] += light[0] * intensity;
  color[1] += light[1] * intensity;
  color[2] += light[2] * intensity;
}

for (let row = 0; row < height; row++) {
  for (let column = 0; column < width; column++) {
    const horizontal = (column - center) / center;
    const depth = row / height;
    const wallLight = Math.max(0, 1 - horizontal ** 2) * Math.sin(Math.min(1, depth * 1.35) * Math.PI);
    const color = [5 + wallLight * 3, 8 + wallLight * 12, 25 + wallLight * 35];
    const wallPanel = Math.abs(((column + 14) % 180) - 90);
    if (row < floorHorizon) {
      addLight(color, [5, 11, 25], falloff(wallPanel - 88, 1.2) * .55);
      addLight(color, [0, 35, 75], falloff(column - center, 340) * falloff(row - 820, 530) * .35);
    }

    const ringRadius = Math.hypot(column - center, row - 670);
    const ringDistance = Math.abs(ringRadius - 422);
    const ringBlend = (horizontal + 1) / 2;
    const ringColor = [15 + 195 * ringBlend, 235 - 185 * ringBlend, 255];
    addLight(color, ringColor, falloff(ringDistance, 58) * .22);
    addLight(color, ringColor, falloff(ringDistance, 21) * .5);
    addLight(color, ringColor, falloff(ringDistance, 6) * .9);
    addLight(color, [155, 230, 255], falloff(ringDistance, 2.2) * 1.1);

    for (const pillar of pillars) {
      const verticalDistance = Math.max(pillar.top - row, row - pillar.end, 0);
      const pillarDistance = Math.hypot(column - pillar.x, verticalDistance);
      const pillarPower = Math.min(1, Math.max(0, (row - pillar.top) / 75));
      addLight(color, pillar.color, falloff(pillarDistance, 26) * .2 * pillarPower);
      addLight(color, pillar.color, falloff(pillarDistance, 7) * .8 * pillarPower);
      addLight(color, [160, 235, 255], falloff(pillarDistance, 2) * .75 * pillarPower);
    }

    if (row > floorHorizon) {
      const floorDepth = (row - floorHorizon) / (height - floorHorizon);
      addLight(color, [1, 21, 62], Math.min(1, floorDepth * 6));
      for (let track = -5; track <= 5; track++) {
        const gridPosition = center + track * 310 * ((row - 1120) / 800);
        addLight(color, [14, 43, 100], falloff(column - gridPosition, 1) * .45);
      }
      for (const horizonLine of [1270, 1315, 1380, 1475, 1610, 1795]) {
        addLight(color, [20, 67, 133], falloff(row - horizonLine, 1) * .35);
      }
      for (const pillar of pillars) {
        const reflectionDistance = column - (center + (pillar.x - center) * (1 + floorDepth * .45));
        addLight(color, pillar.color, falloff(reflectionDistance, 12 + floorDepth * 13) * .12 * (1 - floorDepth * .7));
      }
      addLight(color, [0, 115, 225], falloff(horizontal, .75) * falloff(row - 1720, 180) * .23);
    }

    const platformHorizontal = (column - center) / 465;
    const platformVertical = (row - 1540) / 108;
    const platformEllipse = Math.hypot(platformHorizontal, platformVertical);
    const platformEdge = Math.abs(platformEllipse - 1) * 108;
    const platformBlend = Math.max(0, Math.min(1, (column - center + 300) / 600));
    const platformColor = [150 * platformBlend, 220 - 155 * platformBlend, 255];
    addLight(color, platformColor, falloff(platformEdge, 36) * .4);
    if (Math.abs(platformHorizontal) < 1) {
      const frontEdge = 1540 + Math.sqrt(1 - platformHorizontal ** 2) * 108;
      if (row > frontEdge && row < frontEdge + 72) {
        const sideDepth = (row - frontEdge) / 72;
        color[0] = 9 + Math.abs(platformHorizontal) * 20;
        color[1] = 15 + (1 - sideDepth) * 45;
        color[2] = 60 + (1 - sideDepth) * 85;
        addLight(color, [110, 30, 230], falloff(row - frontEdge - 65, 4) * .65);
      }
    }
    if (platformEllipse < 1) {
      const shine = Math.max(0, 1 - platformEllipse);
      color[0] = 5 + shine * 3;
      color[1] = 30 + shine * 52;
      color[2] = 95 + shine * 55;
      addLight(color, [0, 110, 160], falloff(platformEllipse - .83, .06) * .3);
    }
    addLight(color, platformColor, falloff(platformEdge, 13) * .65);
    addLight(color, [90, 235, 255], falloff(platformEdge, 3) * .95);
    addLight(color, [230, 255, 255], falloff(platformEdge, 1.25) * .8);

    const outerEllipse = Math.hypot((column - center) / 515, (row - 1655) / 116);
    addLight(color, [125, 35, 220], falloff(Math.abs(outerEllipse - 1) * 100, 4) * .6);
    const vignette = 1 - Math.min(.38, Math.abs(horizontal) ** 3 * .15 + Math.max(0, depth - .88) * 1.5);
    const grain = (Math.sin(column * 12.9898 + row * 78.233) * 43758.5453) % 1;
    const offset = (row * width + column) * 3;
    for (let channel = 0; channel < 3; channel++) {
      pixels[offset + channel] = Math.max(0, Math.min(255, Math.round(color[channel] * vignette + grain * 1.2)));
    }
  }
}

const source = resolve(root, 'art-source/ui-redesign/neon-avatar-stage.png');
const destination = resolve(root, 'apps/masque-mini/public/assets/world/neon-avatar-stage.webp');
await mkdir(resolve(root, 'apps/masque-mini/public/assets/world'), { recursive: true });
const scene = sharp(pixels, { raw: { width, height, channels: 3 } });
await scene.clone().png().toFile(source);
await scene.clone().webp({ quality: 90 }).toFile(destination);
console.log(`Generated ${width}x${height} full-height avatar stage: ${destination}`);

const characterStages = [
  { id: 'aqua', matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], lift: [0, 0, 0] },
  { id: 'flora', matrix: [[1, .1, .1], [.6, .6, .1], [0, .8, .2]], lift: [28, 48, 58] },
  { id: 'blaze', matrix: [[.12, 0, .03], [0, .55, .5], [0, .3, .7]], lift: [0, 3, 5] },
  { id: 'mint', matrix: [[.7, 0, .35], [0, .65, .25], [.8, 0, .2]], lift: [12, 0, 10] },
];
const stageDirectory = resolve(root, 'apps/masque-mini/public/assets/characters');
await mkdir(stageDirectory, { recursive: true });
for (const stage of characterStages) {
  const themed = scene.clone().recomb(stage.matrix).linear([1, 1, 1], stage.lift);
  await themed.clone().png().toFile(resolve(root, `art-source/mini-characters/${stage.id}-stage.png`));
  await themed.clone().webp({ quality: 90 }).toFile(resolve(stageDirectory, `${stage.id}-stage.webp`));
  console.log(`Generated ${stage.id} character stage`);
}