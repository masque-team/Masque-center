import type { PlayerState, VipPackage } from '../types';
import { energyCapacity, isVip, refreshEnergy } from './energyService';

export function purchaseVip(player: PlayerState, packageId: VipPackage['id'], now = Date.now()): PlayerState | null {
  const selected = player.demo.config.vipPlans.find((item) => item.id === packageId);
  if (!selected || player.masquePoints < selected.cost) return null;
  const current = refreshEnergy(player, now);
  const vipExpiresAt = Math.max(now, player.vipExpiresAt ?? 0) + selected.durationDays * 24 * 60 * 60 * 1000;
  return {
    ...current,
    masquePoints: current.masquePoints - selected.cost + (selected.bonusPoints ?? 0),
    gachaTickets: current.gachaTickets + (selected.bonusTickets ?? 0),
    vipExpiresAt,
    energyUpdatedAt: current.energy >= energyCapacity(current, isVip(current, now)) ? now : current.energyUpdatedAt,
  };
}