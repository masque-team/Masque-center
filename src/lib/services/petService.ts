import { PET_GACHA_COST, PETS } from '../data/config';
import type { PlayerState } from '../types';

export function equipPet(player: PlayerState, petId: string | null): PlayerState | null {
  if (petId && !player.ownedPetIds.includes(petId)) return null;
  return { ...player, petId };
}

export function drawPet(player: PlayerState): { player: PlayerState; petId: string; duplicate: boolean } | null {
  const useTicket = player.gachaTickets > 0;
  if (!useTicket && player.masquePoints < PET_GACHA_COST) return null;
  const pet = PETS[Math.floor(Math.random() * PETS.length)];
  const duplicate = player.ownedPetIds.includes(pet.id);
  return {
    player: {
      ...player,
      masquePoints: player.masquePoints - (useTicket ? 0 : PET_GACHA_COST) + (duplicate ? 15 : 0),
      gachaTickets: player.gachaTickets - (useTicket ? 1 : 0),
      ownedPetIds: duplicate ? player.ownedPetIds : [...player.ownedPetIds, pet.id],
      petId: duplicate ? player.petId : pet.id,
    },
    petId: pet.id,
    duplicate,
  };
}