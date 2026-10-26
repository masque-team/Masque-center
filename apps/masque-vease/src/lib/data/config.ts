const avatarSpecs = [
  ['mali', 'Mali', 'Common'], ['nami', 'Nami', 'Rare'], ['luna', 'Luna', 'Epic'],
  ['mali-vip', 'Mali VIP', 'VIP'], ['flora', 'Flora', 'Rare'], ['mimi', 'Mimi', 'Epic'],
  ['ember', 'Ember', 'Epic'], ['aqua', 'Aqua', 'Rare'], ['fawn', 'Fawn', 'Epic'], ['nyx', 'Nyx', 'Legendary'],
] as const;
const petSpecs = [
  ['pudding', 'Pudding', 'Rare'], ['cloud', 'Cloud', 'Common'], ['mochi', 'Mochi', 'Epic'],
  ['sprout', 'Sprout', 'Rare'], ['mooncat', 'Mooncat', 'Epic'], ['fawn-pet', 'Fawn', 'Rare'],
  ['puffin', 'Puffin', 'Common'], ['ember-pet', 'Ember', 'Epic'], ['sunny', 'Sunny', 'Rare'], ['frostwing', 'Frostwing', 'Legendary'],
] as const;
export const AVATARS = avatarSpecs.map(([id, name, rarity]) => ({ id, name, rarity, placeholder: '*', imagePath: `assets/avatars/${id}.webp` }));
export const PETS = petSpecs.map(([id, name, rarity]) => ({ id, name, rarity, placeholder: '*', imagePath: `assets/pets/${id}.webp` }));
export const WINGS = [
  { id: 'sky-feather', name: 'Sky Feather', rarity: 'Rare', imagePath: 'assets/wings/sky-feather.png' },
  { id: 'sunrise-seraph', name: 'Sunrise Seraph', rarity: 'Legendary', imagePath: 'assets/wings/sunrise-seraph.png' },
];