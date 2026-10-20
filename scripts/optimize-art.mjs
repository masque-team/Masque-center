import { readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

// Source file order (-N suffix) -> item id used in src/lib/data/config.ts
const ORDER = {
  avatars: ['mali', 'flora', 'mimi', 'nami', 'mali-vip', 'ember', 'aqua', 'luna', 'fawn', 'nyx'],
  pets: ['pudding', 'mooncat', 'fawn-pet', 'puffin', 'ember-pet', 'cloud', 'mochi', 'sprout', 'sunny', 'frostwing'],
};

for (const [kind, ids] of Object.entries(ORDER)) {
  const sourceDir = join('art-source', kind);
  const outputDir = join('public', 'assets', kind);
  await mkdir(outputDir, { recursive: true });
  for (const file of (await readdir(sourceDir)).filter((name) => name.endsWith('.png'))) {
    const index = Number(/-(\d+)\.png$/.exec(file)?.[1]) - 1;
    const id = ids[index];
    if (!id) continue;
    const info = await sharp(join(sourceDir, file))
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 84, alphaQuality: 90, effort: 5 })
      .toFile(join(outputDir, `${id}.webp`));
    console.log(`${kind}/${id}.webp ${Math.round(info.size / 1024)} KB`);
  }
}
