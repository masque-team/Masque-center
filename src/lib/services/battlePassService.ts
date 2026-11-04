import { BATTLE_PASS } from '../data/config';
import type { DemoReward, PlayerState } from '../types';

export const PASS_RULES = { days: 30, levels: 50, xpPerLevel: 100, dailyXp: 200, weeklyXp: 500, weeklyGames: 4 } as const;
const DAY = 86_400_000;

export function passWindow(now: number) {
  const date = new Date(now);
  const startsAt = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
  const endsAt = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  const index = date.getUTCFullYear() * 12 + date.getUTCMonth() - 2026 * 12;
  return { index, startsAt, endsAt, starts: new Date(startsAt).toISOString().slice(0, 10), ends: new Date(endsAt).toISOString().slice(0, 10), remaining: Math.max(0, endsAt - now) };
}

export function passProgress(xp: number) {
  const safeXp = Number.isSafeInteger(xp) && xp > 0 ? xp : 0;
  const cappedXp = Math.min(PASS_RULES.levels * PASS_RULES.xpPerLevel, safeXp);
  const level = Math.floor(cappedXp / PASS_RULES.xpPerLevel);
  return { level, mainLevel: level, nextXp: (level + 1) * PASS_RULES.xpPerLevel, withinLevel: level === PASS_RULES.levels ? 0 : cappedXp % PASS_RULES.xpPerLevel, percent: level >= PASS_RULES.levels ? 100 : cappedXp % PASS_RULES.xpPerLevel, complete: level >= PASS_RULES.levels };
}

export function battlePassLevel(player: PlayerState): number {
  return Math.min(BATTLE_PASS.totalLevels, Math.floor(player.battlePassXp / BATTLE_PASS.xpPerLevel) + 1);
}

export function claimMockReward(player: PlayerState, rewardId: string, amount: number): PlayerState | null {
  if (player.claimedRewards.includes(rewardId)) return null;
  return {
    ...player,
    claimedRewards: [...player.claimedRewards, rewardId],
    energy: player.energy + amount,
  };
}

export function passTrack(legacy: DemoReward[], track: 'free' | 'premium', theme: 'water' | 'lantern'): DemoReward[] {
  const milestones: Record<number, DemoReward> = track === 'free' ? {
    10: { title: 'Pet: Cloud', type: 'pet', itemId: 'cloud' },
    15: { title: 'Ocean Profile Frame', type: 'frame', itemId: 'ocean' },
    20: { title: 'Pet: Sprout', type: 'pet', itemId: 'sprout' },
    25: { title: 'Pet Gacha Boxes x3', type: 'gacha-box', amount: 3, boxKind: 'pet' },
    30: { title: 'Profile Background', type: 'background', itemId: theme === 'water' ? 'cloud-club' : 'atelier-dusk' },
    35: { title: 'Avatar: Aqua', type: 'avatar', itemId: 'aqua' },
    40: { title: 'Sky Feather Wings', type: 'wing', itemId: 'sky-feather' },
    45: { title: 'Pet Gacha Boxes x3', type: 'gacha-box', amount: 3, boxKind: 'pet' },
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
  const activeReward = (reward: DemoReward): DemoReward => {
    if (reward.type === 'points') {
      const amount = Math.max(1, Math.ceil((reward.amount ?? 0) / 25));
      return { title: `Energy +${amount}`, type: 'energy', amount };
    }
    if (reward.type === 'ticket' || reward.type === 'arena-ticket') {
      const amount = Math.max(1, reward.amount ?? 1);
      return { title: `Pet Gacha Box x${amount}`, type: 'gacha-box', amount, boxKind: 'pet' };
    }
    return { ...reward };
  };
  return Array.from({ length: PASS_RULES.levels }, (_, index) => {
    if (legacy[index]) return activeReward(legacy[index]);
    const level = index + 1;
    if (milestones[level]) return { ...milestones[level] };
    if (level % 5 === 0) return { title: 'Pet Gacha Box', type: 'gacha-box', amount: 1, boxKind: 'pet' };
    if (level % 4 === 0) return { title: `Energy +${track === 'free' ? 2 : 3}`, type: 'energy', amount: track === 'free' ? 2 : 3 };
    if (level % 3 === 0) return { title: `Energy +${track === 'free' ? 2 : 3}`, type: 'energy', amount: track === 'free' ? 2 : 3 };
    return { title: `Energy +${track === 'free' ? 1 : 2}`, type: 'energy', amount: track === 'free' ? 1 : 2 };
  });
}