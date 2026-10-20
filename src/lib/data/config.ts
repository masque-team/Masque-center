import type { VipPackage } from '../types';

export const ENERGY_CONFIG = {
  max: 12,
  costPerGame: 1,
  refillEveryMs: 30 * 60 * 1000,
  refillPacks: [
    { id: 'small', energy: 3, cost: 30 },
    { id: 'large', energy: 8, cost: 70 },
  ],
} as const;

export const EXCHANGE_RATE = 10;

export const VIP_PACKAGES: VipPackage[] = [
  { id: 'five-day', label: '5-Day VIP Pass', durationDays: 5, cost: 180, reward: 'Pet Gacha Ticket x1' },
  { id: 'seven-day', label: '7-Day VIP Pass', durationDays: 7, cost: 240, reward: 'Masque Points +80' },
];

export const BATTLE_PASS = {
  xpPerLevel: 100,
  totalLevels: 10,
  freeRewards: [
    { title: 'Energy +2', type: 'energy', amount: 2 },
    { title: 'Masque Points +25', type: 'points', amount: 25 },
    { title: 'Gacha Ticket', type: 'ticket', amount: 1 },
    { title: 'Avatar: Nami', type: 'avatar', itemId: 'nami' },
    { title: 'Masque Points +60', type: 'points', amount: 60 },
  ],
  vipRewards: [
    { title: 'Masque Points +40', type: 'points', amount: 40 },
    { title: 'Pet: Pudding', type: 'pet', itemId: 'pudding' },
    { title: 'Energy +5', type: 'energy', amount: 5 },
    { title: 'Avatar: Mali VIP', type: 'avatar', itemId: 'mali-vip' },
    { title: 'Pet Gacha Ticket', type: 'ticket', amount: 1 },
  ],
};

export const AVATARS = [
  { id: 'mali', name: 'Mali', rarity: 'Common', owned: true, color: '#ffbf69' },
  { id: 'nami', name: 'Nami', rarity: 'Rare', owned: false, color: '#77c8e8' },
  { id: 'luna', name: 'Luna', rarity: 'Epic', owned: false, color: '#b09be9' },
  { id: 'mali-vip', name: 'Mali VIP', rarity: 'VIP', owned: false, color: '#f1c75b' },
];

export const PETS = [
  { id: 'pudding', name: 'Pudding', rarity: 'Rare', owned: true, color: '#f6ca72' },
  { id: 'cloud', name: 'Cloud', rarity: 'Common', owned: true, color: '#a7d9f3' },
  { id: 'mochi', name: 'Mochi', rarity: 'Epic', owned: false, color: '#e99cc5' },
  { id: 'sprout', name: 'Sprout', rarity: 'Rare', owned: false, color: '#8dcf98' },
];

export const PET_GACHA_COST = 90;