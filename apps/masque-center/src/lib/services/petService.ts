import { PETS } from '../data/config';
import type { PlayerState } from '../types';
import { drawGachaBatch } from './gachaService';

export function equipPet(player: PlayerState, petId: string | null): PlayerState | null {
  if (petId && !player.ownedPetIds.includes(petId)) return null;
  return { ...player, petId };
}

export { drawPet } from './gachaService';