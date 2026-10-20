import { EXCHANGE_RATE, SHOP_ITEMS } from '../data/config';
import type { PlayerState } from '../types';

export function exchangeAisPoints(player: PlayerState, amount: number): PlayerState | null {
  if (!Number.isInteger(amount) || amount < 1 || amount > player.aisPoints) return null;
  return {
    ...player,
    aisPoints: player.aisPoints - amount,
    masquePoints: player.masquePoints + amount * EXCHANGE_RATE,
  };
}

export function purchaseShopItem(player: PlayerState, id: string): PlayerState | null {
  const item = SHOP_ITEMS.find((entry) => entry.id === id);
  if (!item || player.masquePoints < item.cost) return null;
  const owned = item.kind === 'avatar' ? player.ownedAvatarIds : player.ownedPetIds;
  if (owned.includes(item.itemId)) return null;
  return {
    ...player,
    masquePoints: player.masquePoints - item.cost,
    ...(item.kind === 'avatar'
      ? { ownedAvatarIds: [...owned, item.itemId] }
      : { ownedPetIds: [...owned, item.itemId] }),
  };
}