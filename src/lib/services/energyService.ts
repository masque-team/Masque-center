import { ENERGY_CONFIG } from '../data/config';
import type { PlayerState } from '../types';

export function isVip(player: PlayerState, now = Date.now()): boolean {
  return player.vipExpiresAt !== null && player.vipExpiresAt > now;
}

export function refreshEnergy(player: PlayerState, now = Date.now()): PlayerState {
  if (isVip(player, now) || player.energy >= ENERGY_CONFIG.max) return player;
  const recovered = Math.floor((now - player.energyUpdatedAt) / ENERGY_CONFIG.refillEveryMs);
  if (recovered <= 0) return player;
  const energy = Math.min(ENERGY_CONFIG.max, player.energy + recovered);
  return {
    ...player,
    energy,
    energyUpdatedAt: energy >= ENERGY_CONFIG.max
      ? now
      : player.energyUpdatedAt + recovered * ENERGY_CONFIG.refillEveryMs,
  };
}

export function spendGameEnergy(player: PlayerState, now = Date.now()): PlayerState | null {
  const current = refreshEnergy(player, now);
  if (isVip(current, now)) return current;
  if (current.energy < ENERGY_CONFIG.costPerGame) return null;
  return {
    ...current,
    energy: current.energy - ENERGY_CONFIG.costPerGame,
    energyUpdatedAt: current.energy >= ENERGY_CONFIG.max ? now : current.energyUpdatedAt,
  };
}

export function refillEnergy(player: PlayerState, amount: number, cost: number): PlayerState | null {
  const current = refreshEnergy(player);
  if (current.masquePoints < cost || current.energy >= ENERGY_CONFIG.max) return null;
  return {
    ...current,
    masquePoints: current.masquePoints - cost,
    energy: Math.min(ENERGY_CONFIG.max, current.energy + amount),
    energyUpdatedAt: Date.now(),
  };
}

export function nextRefillIn(player: PlayerState, now = Date.now()): number {
  if (player.energy >= ENERGY_CONFIG.max || isVip(player, now)) return 0;
  return Math.max(0, ENERGY_CONFIG.refillEveryMs - (now - player.energyUpdatedAt) % ENERGY_CONFIG.refillEveryMs);
}