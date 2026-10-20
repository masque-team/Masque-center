import type { PlayerState } from '../types';
import { ENERGY_CONFIG } from '../data/config';

const STORAGE_KEY = 'masquegame_center_v2';

function createPlayer(displayName: string | null): PlayerState {
  return {
    id: `MG${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`,
    displayName: displayName?.trim().slice(0, 40) || 'Guest Player',
    level: 18,
    aisPoints: 24,
    masquePoints: 320,
    energy: ENERGY_CONFIG.max,
    energyUpdatedAt: Date.now(),
    vipExpiresAt: null,
    battlePassXp: 230,
    claimedRewards: [],
    claimedMissions: [],
    checkinDates: [],
    gachaTickets: 0,
    avatarId: 'mali',
    ownedAvatarIds: ['mali'],
    petId: null,
    ownedPetIds: ['pudding', 'cloud'],
  };
}

function isPlayerState(value: unknown): value is PlayerState {
  if (typeof value !== 'object' || value === null) return false;
  const player = value as Record<string, unknown>;
  return typeof player.id === 'string'
    && typeof player.displayName === 'string'
    && typeof player.level === 'number'
    && typeof player.aisPoints === 'number'
    && typeof player.masquePoints === 'number'
    && typeof player.energy === 'number'
    && typeof player.energyUpdatedAt === 'number'
    && (typeof player.vipExpiresAt === 'number' || player.vipExpiresAt === null)
    && typeof player.battlePassXp === 'number'
    && Array.isArray(player.claimedRewards)
    && Array.isArray(player.claimedMissions)
    && Array.isArray(player.checkinDates)
    && typeof player.gachaTickets === 'number'
    && typeof player.avatarId === 'string'
    && Array.isArray(player.ownedAvatarIds)
    && (typeof player.petId === 'string' || player.petId === null)
    && Array.isArray(player.ownedPetIds);
}

export function loadPlayer(queryName: string | null): PlayerState {
  let player: PlayerState | null = null;
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (isPlayerState(stored)) player = stored;
  } catch {
    player = null;
  }
  const result = player ?? createPlayer(queryName);
  if (queryName?.trim()) result.displayName = queryName.trim().slice(0, 40);
  savePlayer(result);
  return result;
}

export function savePlayer(player: PlayerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  } catch {
    console.warn('MasqueGame mock player state could not be saved to localStorage.');
  }
}