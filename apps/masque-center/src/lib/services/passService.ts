import type { PlayerState, VipPackage } from '../types';
import { energyCapacity, isVip, refreshEnergy } from './energyService';
import { PASS_RULES, passProgress } from './battlePassService';
import { currentPass, currentSeason } from './demoService';

const DAY = 86_400_000;

export function vipOffer(player: PlayerState, packageId: string, now = Date.now()) {
  const plan = player.demo.config.vipPlans.find((item) => item.id === packageId);
  if (!plan) return null;
  if (!Number.isFinite(plan.durationDays) || plan.durationDays <= 0 || !Number.isSafeInteger(plan.cost) || plan.cost < 0) return null;
  const active = isVip(player, now);
  const pass = currentPass(player, now);
  const level = passProgress(pass.xp).level;
  const expiresAt = Math.max(now, player.vipExpiresAt ?? 0) + plan.durationDays * DAY;
  return { plan, active, boosted: false, eligible: true, level, levelAfter: level, xpAfter: pass.xp, cost: plan.cost, expiresAt };
}

export function passBenefitMilestones(player: PlayerState, now = Date.now()) {
  const season = currentSeason(player, now);
  return [1, 10, 20, 30, 50].map((level) => {
    const free = season.free.slice(0, level);
    const vip = season.premium.slice(0, level);
    const sum = (type: 'energy' | 'points' | 'ticket' | 'arena-ticket', rewards = vip) => rewards.filter((reward) => reward.type === type).reduce((total, reward) => total + (reward.amount ?? 0), 0);
    return { level, freeEnergy: sum('energy', free), vipEnergy: sum('energy'), vipPoints: sum('points'), vipTickets: sum('ticket'), vipRanked: sum('arena-ticket') };
  });
}

export function purchaseVip(player: PlayerState, packageId: VipPackage['id'], now = Date.now()): PlayerState | null {
  const offer = vipOffer(player, packageId, now);
  if (!offer || !offer.eligible || player.aisPoints < offer.cost) return null;
  const current = refreshEnergy(player, now);
  return {
    ...current,
    aisPoints: current.aisPoints - offer.cost,
    vipExpiresAt: offer.expiresAt,
    energyUpdatedAt: current.energy >= energyCapacity(current, true) ? now : current.energyUpdatedAt,
  };
}