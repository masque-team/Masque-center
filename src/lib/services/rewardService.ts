import { BATTLE_PASS, ENERGY_CONFIG } from '../data/config';
import type { PlayerState } from '../types';

type RewardTrack = 'free' | 'vip';

export function claimBattlePassReward(player: PlayerState, track: RewardTrack, index: number): PlayerState | null {
  const rewards = track === 'free' ? BATTLE_PASS.freeRewards : BATTLE_PASS.vipRewards;
  const reward = rewards[index];
  const rewardId = `${track}-${index + 1}`;
  const level = Math.min(BATTLE_PASS.totalLevels, Math.floor(player.battlePassXp / BATTLE_PASS.xpPerLevel) + 1);
  if (!reward || level < index + 1 || player.claimedRewards.includes(rewardId)) return null;
  const next: PlayerState = { ...player, claimedRewards: [...player.claimedRewards, rewardId] };
  if (reward.type === 'points') next.masquePoints += reward.amount ?? 0;
  if (reward.type === 'energy') next.energy = Math.min(ENERGY_CONFIG.max, next.energy + (reward.amount ?? 0));
  if (reward.type === 'ticket') next.gachaTickets += reward.amount ?? 1;
  if (reward.type === 'avatar' && reward.itemId && !next.ownedAvatarIds.includes(reward.itemId)) {
    next.ownedAvatarIds = [...next.ownedAvatarIds, reward.itemId];
  }
  if (reward.type === 'pet' && reward.itemId && !next.ownedPetIds.includes(reward.itemId)) {
    next.ownedPetIds = [...next.ownedPetIds, reward.itemId];
  }
  return next;
}

export function addMockMissionXp(player: PlayerState, amount: number): PlayerState {
  return { ...player, battlePassXp: Math.min(BATTLE_PASS.totalLevels * BATTLE_PASS.xpPerLevel, player.battlePassXp + amount) };
}