import { AVATARS, PETS } from '../data/config';
import type { PlayerState } from '../types';
import type { Outfit } from '@masque/vease-protocol';
import { equipPet } from './petService';
import { equipWings } from './walletService';

export function selectAvatar(player: PlayerState, avatarId: string): PlayerState | null {
  const avatar = AVATARS.find((item) => item.id === avatarId);
  if (!avatar || !player.ownedAvatarIds.includes(avatarId)) return null;
  return { ...player, avatarId };
}

export function equipOutfit(player: PlayerState, outfit: Outfit): PlayerState | null {
  if (outfit.petId !== null && !PETS.some((pet) => pet.id === outfit.petId)) return null;
  const avatar = selectAvatar(player, outfit.avatarId);
  if (!avatar) return null;
  const pet = equipPet(avatar, outfit.petId);
  if (!pet) return null;
  return equipWings(pet, outfit.wingId);
}