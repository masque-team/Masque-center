import type { PlayerState } from '../types';

const STORAGE_KEY = 'masquegame_player_v1';
const LEGACY_STORAGE_KEY = 'masquegame_portal_demo_v1';

function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createPlayerId(): string {
  return `MG${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`;
}

function createGuest(): PlayerState {
  return {
    id: createPlayerId(),
    displayName: 'Guest Player',
    level: 18,
    aisPoints: 320,
    passExpiredAt: null,
    freeDate: todayKey(),
    freeUsedSeconds: 0,
  };
}

function isPlayerState(value: unknown): value is PlayerState {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string'
    && typeof candidate.displayName === 'string'
    && typeof candidate.level === 'number'
    && typeof candidate.aisPoints === 'number'
    && (typeof candidate.passExpiredAt === 'number' || candidate.passExpiredAt === null)
    && typeof candidate.freeDate === 'string'
    && typeof candidate.freeUsedSeconds === 'number';
}

function loadStoredPlayer(): PlayerState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isPlayerState(parsed)) return parsed;
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return null;
    const previous: unknown = JSON.parse(legacy);
    if (typeof previous !== 'object' || previous === null) return null;
    const old = previous as Record<string, unknown>;
    const guest = createGuest();
    return {
      ...guest,
      id: typeof old.playerId === 'string' ? old.playerId : guest.id,
      displayName: typeof old.playerName === 'string' ? old.playerName : guest.displayName,
      level: typeof old.level === 'number' ? old.level : guest.level,
      aisPoints: typeof old.points === 'number' ? old.points : guest.aisPoints,
      passExpiredAt: typeof old.passUntil === 'number' && old.passUntil > 0 ? old.passUntil : null,
      freeDate: typeof old.freeDate === 'string' ? old.freeDate : guest.freeDate,
      freeUsedSeconds: typeof old.freeUsed === 'number' ? old.freeUsed : guest.freeUsedSeconds,
    };
  } catch {
    return null;
  }
}

export function loadPlayer(queryName: string | null): PlayerState {
  const player = loadStoredPlayer() ?? createGuest();
  if (queryName?.trim()) player.displayName = queryName.trim().slice(0, 40);
  if (player.freeDate !== todayKey()) {
    player.freeDate = todayKey();
    player.freeUsedSeconds = 0;
  }
  savePlayer(player);
  return player;
}

export function savePlayer(player: PlayerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  } catch {
    console.warn('MasqueGame mock player state could not be saved to localStorage.');
  }
}

export function currentDayKey(date = new Date()): string {
  return todayKey(date);
}