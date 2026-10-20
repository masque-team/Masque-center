import type { PlayerState } from '../types';
import { ENERGY_CONFIG, PLAYER_MOCK_CONFIG } from '../data/config';

const STORAGE_KEY = 'masquegame_center_v2';

export function parseAisPointSeed(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) return null;
  return Math.min(parsed, PLAYER_MOCK_CONFIG.maxTestAisPoints);
}

function createPlayer(displayName: string | null, aisPointSeed: number | null): PlayerState {
  return {
    id: `MG${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`,
    displayName: displayName?.trim().slice(0, 40) || 'Guest Player',
    level: PLAYER_MOCK_CONFIG.level,
    aisPoints: aisPointSeed ?? PLAYER_MOCK_CONFIG.aisPoints,
    masquePoints: PLAYER_MOCK_CONFIG.masquePoints,
    energy: ENERGY_CONFIG.max,
    energyUpdatedAt: Date.now(),
    vipExpiresAt: null,
    battlePassXp: PLAYER_MOCK_CONFIG.battlePassXp,
    claimedRewards: [],
    claimedMissions: [],
    checkinDates: [],
    gachaTickets: PLAYER_MOCK_CONFIG.gachaTickets,
    avatarId: PLAYER_MOCK_CONFIG.avatarId,
    ownedAvatarIds: [...PLAYER_MOCK_CONFIG.ownedAvatarIds],
    petId: PLAYER_MOCK_CONFIG.petId,
    ownedPetIds: [...PLAYER_MOCK_CONFIG.ownedPetIds],
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

export function loadPlayer(queryName: string | null, aisPointSeed: number | null = null, resetMock = false): PlayerState {
  let player: PlayerState | null = null;
  if (!resetMock) {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (isPlayerState(stored)) player = stored;
    } catch {
      player = null;
    }
  }
  const result = player ?? createPlayer(queryName, aisPointSeed);
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