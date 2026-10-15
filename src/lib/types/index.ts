export type GameId = 'bird' | 'mole' | 'run' | 'fruit' | 'timber' | 'duck';

export interface Game {
  id: GameId;
  name: string;
  description: string;
  genre: string;
  badge: string;
  url: string;
  cover: string;
  fallbackCover: string;
}

export interface Player {
  id: string;
  displayName: string;
  level: number;
  aisPoints: number;
  passExpiredAt: number | null;
}

export interface PlayerState extends Player {
  freeDate: string;
  freeUsedSeconds: number;
}

export interface PassPackage {
  id: 'daily' | 'weekly';
  label: string;
  durationDays: number;
  cost: number;
  bestValue?: boolean;
}

export interface RankingEntry {
  playerId: string;
  displayName: string;
  score: number;
  isCurrentPlayer?: boolean;
}

export type RankingPeriod = 'weekly' | 'allTime';