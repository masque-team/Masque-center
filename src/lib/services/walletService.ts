import { EXCHANGE_RATE } from '../data/config';
import type { PlayerState } from '../types';

export function exchangeAisPoints(player: PlayerState, amount: number): PlayerState | null {
  if (!Number.isInteger(amount) || amount < 1 || amount > player.aisPoints) return null;
  return {
    ...player,
    aisPoints: player.aisPoints - amount,
    masquePoints: player.masquePoints + amount * EXCHANGE_RATE,
  };
}