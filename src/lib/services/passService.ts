import type { PlayerState, VipPackage } from '../types';
import { energyCapacity, isVip, refreshEnergy } from './energyService';
import { PASS_RULES, passProgress } from './battlePassService';
import { currentPass, currentSeason } from './demoService';

export function vipOffer(player: PlayerState, packageId: string, now = Date.now()) {
  const plan = player.demo.config.vipPlans.find((item) => item.id === packageId);
  if (!plan) return null;
  const startLevel = plan.startLevel ?? 1;
  if (!Number.isSafeInteger(startLevel) || startLevel < 1 || startLevel > PASS_RULES.levels || !Number.isSafeInteger(plan.cost) || plan.cost < 0 || plan.durationDays !== PASS_RULES.days) return null;
  const active = isVip(player, now);
  const pass = currentPass(player, now);
  const level = passProgress(pass.xp).level;
  const boosted = startLevel > 1;
  const eligible = !boosted || !active && level < startLevel;
  const xpAfter = active ? pass.xp : Math.max(pass.xp, startLevel * PASS_RULES.xpPerLevel);
  return { plan, active, boosted, eligible, level, levelAfter: passProgress(xpAfter).level, xpAfter, expiresAt: Math.max(now, player.vipExpiresAt ?? 0) + plan.durationDays * 86_400_000 };
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
  if (!offer || !offer.eligible || player.masquePoints < offer.plan.cost) return null;
  const selected = offer.plan;
  const current = refreshEnergy(player, now);
  const pass = currentPass(current, now);
  const passId = currentSeason(current, now).id;
  return {
    ...current,
    masquePoints: current.masquePoints - selected.cost + (selected.bonusPoints ?? 0),
    gachaTickets: current.gachaTickets + (selected.bonusTickets ?? 0),
    vipExpiresAt: offer.expiresAt,
    demo: { ...current.demo, passes: { ...current.demo.passes, [passId]: { ...pass, xp: offer.xpAfter } } },
    energyUpdatedAt: current.energy >= energyCapacity(current, isVip(current, now)) ? now : current.energyUpdatedAt,
  };
}