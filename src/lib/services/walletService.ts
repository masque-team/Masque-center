import type { PlayerState } from '../types';
import { WINGS } from '../data/config';

export function exchangeAisPoints(player: PlayerState, amount: number): PlayerState | null {
  if (!Number.isInteger(amount) || amount < 1 || amount > player.aisPoints) return null;
  return {
    ...player,
    aisPoints: player.aisPoints - amount,
    masquePoints: player.masquePoints + amount * player.demo.config.exchangeRate,
  };
}

export function purchaseShopItem(player: PlayerState, id: string): PlayerState | null {
  const item = player.demo.config.shop.find((entry) => entry.id === id);
  if (!item || !Number.isSafeInteger(item.cost) || item.cost < 0 || player.masquePoints < item.cost) return null;
  if (item.kind === 'wing' && !WINGS.some((wing) => wing.id === item.itemId)) return null;
  const owned = item.kind === 'avatar' ? player.ownedAvatarIds : item.kind === 'pet' ? player.ownedPetIds : item.kind === 'wing' ? player.demo.wings : player.demo.frames;
  if (owned.includes(item.itemId)) return null;
  return {
    ...player,
    masquePoints: player.masquePoints - item.cost,
    ...(item.kind === 'avatar'
      ? { ownedAvatarIds: [...owned, item.itemId] }
      : item.kind === 'pet' ? { ownedPetIds: [...owned, item.itemId] }
      : item.kind === 'wing' ? { demo: { ...player.demo, wings: [...owned, item.itemId] } }
      : { demo: { ...player.demo, frames: [...owned, item.itemId] } }),
  };
}

export function equipWings(player: PlayerState, id: string | null): PlayerState | null {
  if (id !== null && (!player.demo.wings.includes(id) || !WINGS.some((wing) => wing.id === id))) return null;
  return { ...player, demo: { ...player.demo, wingId: id } };
}

export function buyArenaTickets(player: PlayerState, quantity: number): PlayerState | null {
  const price = player.demo.config.arenaTicketPrice;
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99 || !Number.isSafeInteger(price) || price < 1 || player.masquePoints < price * quantity) return null;
  return { ...player, masquePoints: player.masquePoints - price * quantity, demo: { ...player.demo, arenaTickets: player.demo.arenaTickets + quantity } };
}