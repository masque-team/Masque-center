import type { PlayerState, VipPackage } from '../types';

export function purchaseVip(player: PlayerState, packageId: VipPackage['id'], now = Date.now()): PlayerState | null {
  const selected = player.demo.config.vipPlans.find((item) => item.id === packageId);
  if (!selected || player.masquePoints < selected.cost) return null;
  const vipExpiresAt = Math.max(now, player.vipExpiresAt ?? 0) + selected.durationDays * 24 * 60 * 60 * 1000;
  return {
    ...player,
    masquePoints: player.masquePoints - selected.cost + (selected.bonusPoints ?? 0),
    gachaTickets: player.gachaTickets + (selected.bonusTickets ?? 0),
    vipExpiresAt,
    energyUpdatedAt: player.demo.config.vipUnlimited ? vipExpiresAt : now,
  };
}