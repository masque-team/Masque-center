import { AVATARS, PETS } from '../data/config';
import { energyCapacity, isVip, refreshEnergy } from './energyService';
import type { GachaBatchResult, GachaDrawResult, GachaKind, GachaOddsItem, PlayerState } from '../types';

export const GACHA_ENERGY_WEIGHT = 25;
export const GACHA_RATE_UP_MULTIPLIER = 3;
const FEATURED_ITEM: Record<GachaKind, string> = { pet: 'frostwing', avatar: 'luna' };

export function getGachaOdds(player: PlayerState, kind: GachaKind): GachaOddsItem[] {
  const items = kind === 'pet'
    ? player.demo.config.gachaPool.flatMap((entry) => {
      const item = PETS.find((pet) => pet.id === entry.petId);
      return item && entry.weight > 0 ? [{ kind: 'pet' as const, itemId: item.id, title: item.name, weight: entry.weight, featured: item.id === FEATURED_ITEM.pet }] : [];
    })
    : AVATARS.map((item) => ({
      kind: 'avatar' as const,
      itemId: item.id,
      title: item.name,
      weight: item.rarity === 'Legendary' ? 2 : item.rarity === 'Epic' ? 8 : item.rarity === 'Rare' ? 15 : item.rarity === 'VIP' ? 1 : 20,
      featured: item.id === FEATURED_ITEM.avatar,
    }));
  const weighted = items.map((item) => ({ ...item, weight: item.featured ? item.weight * GACHA_RATE_UP_MULTIPLIER : item.weight }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0) + GACHA_ENERGY_WEIGHT;
  if (!total) return [];
  return [
    ...weighted.map((item) => ({ ...item, rate: item.weight / total * 100 })),
    { kind: 'energy', title: 'Energy +1', weight: GACHA_ENERGY_WEIGHT, rate: GACHA_ENERGY_WEIGHT / total * 100 },
  ];
}

export function drawGacha(
  player: PlayerState,
  kind: GachaKind,
  random = Math.random,
  now = Date.now(),
  consumeCoupon = true,
): { player: PlayerState; result: GachaDrawResult } | null {
  if (consumeCoupon && player.gachaTickets < 1) return null;
  const odds = getGachaOdds(player, kind);
  if (!odds.length) return null;
  const current = refreshEnergy(player, now);
  const charged = { ...current, gachaTickets: current.gachaTickets - (consumeCoupon ? 1 : 0) };
  const totalWeight = odds.reduce((sum, item) => sum + item.weight, 0);
  const sample = random();
  let draw = (Number.isFinite(sample) ? Math.max(0, Math.min(0.999999, sample)) : 0) * totalWeight;
  const selected = odds.find((item) => { draw -= item.weight; return draw < 0; }) ?? odds[odds.length - 1];

  if (selected.kind === 'energy') {
    const energy = charged.energy + 1;
    return {
      player: { ...charged, energy, energyUpdatedAt: energy >= energyCapacity(charged, isVip(charged, now)) ? now : charged.energyUpdatedAt },
      result: { kind: 'energy', amount: 1, duplicate: false },
    };
  }

  const owned = selected.kind === 'pet' ? charged.ownedPetIds : charged.ownedAvatarIds;
  const duplicate = owned.includes(selected.itemId!);
  const result = { kind: selected.kind, itemId: selected.itemId!, duplicate, ...(duplicate ? { duplicatePoints: charged.demo.config.duplicatePoints } : {}) } as GachaDrawResult;
  return {
    player: {
      ...charged,
      masquePoints: charged.masquePoints + (duplicate ? charged.demo.config.duplicatePoints : 0),
      ...(duplicate ? {} : selected.kind === 'pet'
        ? { ownedPetIds: [...charged.ownedPetIds, selected.itemId!] }
        : { ownedAvatarIds: [...charged.ownedAvatarIds, selected.itemId!] }),
    },
    result,
  };
}

export function drawGachaBatch(player: PlayerState, kind: GachaKind, count: 1 | 10, random = Math.random, now = Date.now()): GachaBatchResult | null {
  if (player.gachaTickets < count) return null;
  const bonusDraws = count === 10 ? 1 : 0;
  let current = player;
  const results: GachaDrawResult[] = [];
  for (let index = 0; index < count + bonusDraws; index += 1) {
    const drawn = drawGacha(current, kind, random, now, index < count);
    if (!drawn) return null;
    current = drawn.player;
    results.push(drawn.result);
  }
  return { player: current, results, paidCoupons: count, bonusDraws };
}

export function buyGachaCoupons(player: PlayerState, quantity: 1 | 10): PlayerState | null {
  if (quantity !== 1 && quantity !== 10) return null;
  const cost = player.demo.config.gachaCost * quantity;
  if (!Number.isSafeInteger(cost) || player.masquePoints < cost) return null;
  return { ...player, masquePoints: player.masquePoints - cost, gachaTickets: player.gachaTickets + quantity };
}

export function drawPet(player: PlayerState, random = Math.random): { player: PlayerState; petId: string; duplicate: boolean } | null {
  const batch = drawGachaBatch(player, 'pet', 1, random);
  const result = batch?.results[0];
  return result?.kind === 'pet' ? { player: batch!.player, petId: result.itemId, duplicate: result.duplicate } : null;
}