import { BATTLE_PASS } from '../data/config';
import type { DemoReward, PlayerState } from '../types';

export const PASS_RULES = { days: 30, levels: 50, xpPerLevel: 100, dailyXp: 200, weeklyXp: 500, weeklyGames: 4 } as const;
const DAY = 86_400_000;
const EPOCH = Date.UTC(2026, 0, 1);

export function passWindow(now: number) {
  const index = Math.floor((now - EPOCH) / (PASS_RULES.days * DAY));
  const startsAt = EPOCH + index * PASS_RULES.days * DAY;
  const endsAt = startsAt + PASS_RULES.days * DAY;
  return { index, startsAt, endsAt, starts: new Date(startsAt).toISOString().slice(0, 10), ends: new Date(endsAt).toISOString().slice(0, 10), remaining: Math.max(0, endsAt - now) };
}

export function passProgress(xp: number) {
  const safeXp = Number.isSafeInteger(xp) && xp > 0 ? xp : 0;
  const level = Math.floor(safeXp / PASS_RULES.xpPerLevel);
  return { level, mainLevel: Math.min(PASS_RULES.levels, level), nextXp: (level + 1) * PASS_RULES.xpPerLevel, withinLevel: safeXp % PASS_RULES.xpPerLevel, complete: level >= PASS_RULES.levels };
}

export function battlePassLevel(player: PlayerState): number {
  return Math.min(BATTLE_PASS.totalLevels, Math.floor(player.battlePassXp / BATTLE_PASS.xpPerLevel) + 1);
}

export function claimMockReward(player: PlayerState, rewardId: string, amount: number): PlayerState | null {
  if (player.claimedRewards.includes(rewardId)) return null;
  return {
    ...player,
    claimedRewards: [...player.claimedRewards, rewardId],
    masquePoints: player.masquePoints + amount,
  };
}

export function passTrack(legacy: DemoReward[], track: 'free' | 'premium', theme: 'water' | 'lantern'): DemoReward[] {
  const milestones: Record<number, DemoReward> = track === 'free' ? {
    10: { title: 'Pet: Cloud', type: 'pet', itemId: 'cloud' },
    15: { title: 'Ocean Profile Frame', type: 'frame', itemId: 'ocean' },
    20: { title: 'Pet: Sprout', type: 'pet', itemId: 'sprout' },
    25: { title: 'Pet Gacha Tickets x3', type: 'ticket', amount: 3 },
    30: { title: 'Profile Background', type: 'background', itemId: theme === 'water' ? 'cloud-club' : 'atelier-dusk' },
    35: { title: 'Avatar: Aqua', type: 'avatar', itemId: 'aqua' },
    40: { title: 'Sky Feather Wings', type: 'wing', itemId: 'sky-feather' },
    45: { title: 'Ranked Tickets x3', type: 'arena-ticket', amount: 3 },
    50: { title: 'Season Explorer Badge', type: 'badge', itemId: 'season-explorer' },
  } : {
    10: { title: 'Pet: Mochi', type: 'pet', itemId: 'mochi' },
    15: { title: 'Sunrise Profile Frame', type: 'frame', itemId: 'sunrise' },
    20: { title: 'Avatar: Mimi', type: 'avatar', itemId: 'mimi' },
    25: { title: 'Sky Feather Wings', type: 'wing', itemId: 'sky-feather' },
    30: { title: 'Profile Background', type: 'background', itemId: theme === 'water' ? 'atelier-dusk' : 'cloud-club' },
    35: { title: 'Pet: Mooncat', type: 'pet', itemId: 'mooncat' },
    40: { title: 'Avatar: Luna', type: 'avatar', itemId: 'luna' },
    45: { title: 'Sunrise Seraph Wings', type: 'wing', itemId: 'sunrise-seraph' },
    50: { title: 'Avatar: Nyx', type: 'avatar', itemId: 'nyx' },
  };
  return Array.from({ length: PASS_RULES.levels }, (_, index) => {
    if (legacy[index]) return { ...legacy[index] };
    const level = index + 1;
    if (milestones[level]) return { ...milestones[level] };
    if (level % 5 === 0) return { title: 'Pet Gacha Ticket', type: 'ticket', amount: 1 };
    if (level % 4 === 0) return { title: 'Ranked Ticket', type: 'arena-ticket', amount: 1 };
    if (level % 3 === 0) return { title: `Energy +${track === 'free' ? 2 : 3}`, type: 'energy', amount: track === 'free' ? 2 : 3 };
    return { title: `Masque Points +${track === 'free' ? 25 : 40}`, type: 'points', amount: track === 'free' ? 25 : 40 };
  });
}