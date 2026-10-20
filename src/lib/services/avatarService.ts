import { AVATARS } from '../data/config';
import type { PlayerState } from '../types';

export function selectAvatar(player: PlayerState, avatarId: string): PlayerState | null {
  const avatar = AVATARS.find((item) => item.id === avatarId);
  if (!avatar || !player.ownedAvatarIds.includes(avatarId)) return null;
  return { ...player, avatarId };
}