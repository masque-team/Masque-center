import { BATTLE_PASS } from '../data/config';
import type { PlayerState } from '../types';

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