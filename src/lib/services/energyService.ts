import type { PlayerState } from '../types';

export function isVip(player: PlayerState, now = Date.now()): boolean {
  return player.vipExpiresAt !== null && player.vipExpiresAt > now;
}

export function refreshEnergy(player: PlayerState, now = Date.now()): PlayerState {
  const config = player.demo.config;
  if ((isVip(player, now) && config.vipUnlimited) || player.energy >= config.energyMax) return player;
  const elapsed = Math.max(0, now - player.energyUpdatedAt);
  const refillEveryMs = config.regenMinutes * 60_000;
  const recovered = Math.floor(elapsed / refillEveryMs);
  if (recovered <= 0) return player;
  const energy = Math.min(config.energyMax, player.energy + recovered);
  return {
    ...player,
    energy,
    energyUpdatedAt: energy >= config.energyMax
      ? now
      : player.energyUpdatedAt + recovered * refillEveryMs,
  };
}

export function spendGameEnergy(player: PlayerState, now = Date.now()): PlayerState | null {
  const current = refreshEnergy(player, now);
  const config = player.demo.config;
  if (isVip(current, now) && config.vipUnlimited) return current;
  if (current.energy < config.energyCost) return null;
  return {
    ...current,
    energy: current.energy - config.energyCost,
    energyUpdatedAt: current.energy >= config.energyMax ? now : current.energyUpdatedAt,
  };
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
  if (player.energy >= player.demo.config.energyMax || (isVip(player, now) && player.demo.config.vipUnlimited)) return 0;
  const elapsed = Math.max(0, now - player.energyUpdatedAt);
  const interval = player.demo.config.regenMinutes * 60_000;
  return interval - elapsed % interval;
}