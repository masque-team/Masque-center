import type { PlayerState } from '../types';

export function isVip(player: PlayerState, now = Date.now()): boolean {
  return player.vipExpiresAt !== null && player.vipExpiresAt > now;
}

export function energyCapacity(player: PlayerState, _vipActive = isVip(player)): number {
  return player.demo.config.energyMax;
}

export function refreshEnergy(player: PlayerState, now = Date.now()): PlayerState {
  const config = player.demo.config;
  const refillEveryMs = config.regenMinutes * 60_000;
  let energy = player.energy;
  let updatedAt = Math.min(player.energyUpdatedAt, now);
  if (energy >= config.energyMax) {
    updatedAt = now;
    return updatedAt === player.energyUpdatedAt ? player : { ...player, energyUpdatedAt: updatedAt };
  }
  function recover(until: number, capacity: number) {
    if (energy >= capacity || until <= updatedAt) return;
    const recovered = Math.min(capacity - energy, Math.floor((until - updatedAt) / refillEveryMs));
    if (recovered <= 0) return;
    energy += recovered;
    updatedAt = energy >= capacity ? until : updatedAt + recovered * refillEveryMs;
  }
  recover(now, config.energyMax);
  return energy === player.energy && updatedAt === player.energyUpdatedAt ? player : { ...player, energy, energyUpdatedAt: updatedAt };
}

function spendEnergy(player: PlayerState, cost: number, now: number): PlayerState | null {
  const current = refreshEnergy(player, now);
  if (!Number.isSafeInteger(cost) || cost < 1 || current.energy < cost) return null;
  return {
    ...current,
    energy: current.energy - cost,
    energyUpdatedAt: current.energy >= current.demo.config.energyMax ? now : current.energyUpdatedAt,
  };
}

export function spendGameEnergy(player: PlayerState, now = Date.now()): PlayerState | null {
  const current = refreshEnergy(player, now);
  if (isVip(current, now) && current.demo.config.vipFreeEntry) return current;
  return spendEnergy(current, current.demo.config.energyCost, now);
}

export function spendContinueEnergy(player: PlayerState, now = Date.now()): PlayerState | null {
  return spendEnergy(player, player.demo.config.continueEnergyCost, now);
}

export function refillEnergy(player: PlayerState, amount: number, cost: number, now = Date.now()): PlayerState | null {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(cost) || cost < 0) return null;
  const current = refreshEnergy(player, now);
  if (current.masquePoints < cost) return null;
  const energy = current.energy + amount;
  return {
    ...current,
    masquePoints: current.masquePoints - cost,
    energy,
    energyUpdatedAt: energy >= current.demo.config.energyMax ? now : current.energyUpdatedAt,
  };
}

export function nextRefillIn(player: PlayerState, now = Date.now()): number {
  if (player.energy >= player.demo.config.energyMax) return 0;
  const elapsed = Math.max(0, now - player.energyUpdatedAt);
  const interval = player.demo.config.regenMinutes * 60_000;
  return interval - elapsed % interval;
}