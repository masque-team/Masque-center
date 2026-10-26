import { PETS } from '../data/config';
import type { PlayerState } from '../types';

export function equipPet(player: PlayerState, petId: string | null): PlayerState | null {
  if (petId && !player.ownedPetIds.includes(petId)) return null;
  return { ...player, petId };
}

export function drawPet(player: PlayerState, random = Math.random): { player: PlayerState; petId: string; duplicate: boolean } | null {
  const useTicket = player.gachaTickets > 0;
  const config = player.demo.config;
  if (!useTicket && player.masquePoints < config.gachaCost) return null;
  const pool = config.gachaPool.filter((entry) => entry.weight > 0 && PETS.some((pet) => pet.id === entry.petId));
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  if (!total) return null;
  let draw = Math.max(0, Math.min(0.999999, random())) * total;
  const selected = pool.find((entry) => { draw -= entry.weight; return draw < 0; }) ?? pool[pool.length - 1];
  const pet = PETS.find((entry) => entry.id === selected.petId)!;
  const duplicate = player.ownedPetIds.includes(pet.id);
  return {
    player: {
      ...player,
      masquePoints: player.masquePoints - (useTicket ? 0 : config.gachaCost) + (duplicate ? config.duplicatePoints : 0),
      gachaTickets: player.gachaTickets - (useTicket ? 1 : 0),
      ownedPetIds: duplicate ? player.ownedPetIds : [...player.ownedPetIds, pet.id],
      petId: player.petId,
    },
    petId: pet.id,
    duplicate,
  };
}