export type GameId = 'bird' | 'mole' | 'run' | 'fruit' | 'timber' | 'duck' | 'memory';

export interface Game {
  id: GameId;
  name: string;
  description: string;
  genre: string;
  badge: string;
  url: string;
  cover?: string;
  fallbackCover?: string;
}

export interface Player {
  id: string;
  displayName: string;
  level: number;
}

export interface PlayerState extends Player {
  aisPoints: number;
  masquePoints: number;
  energy: number;
  energyUpdatedAt: number;
  vipExpiresAt: number | null;
  battlePassXp: number;
  claimedRewards: string[];
  claimedMissions: string[];
  checkinDates: string[];
  gachaTickets: number;
  avatarId: string;
  ownedAvatarIds: string[];
  petId: string | null;
  ownedPetIds: string[];
}

export interface VipPackage {
  id: 'five-day' | 'seven-day';
  label: string;
  durationDays: number;
  cost: number;
  reward: string;
}

export interface RankingEntry {
  playerId: string;
  displayName: string;
  score: number;
  isCurrentPlayer?: boolean;
}

export type RankingPeriod = 'weekly' | 'allTime';

export type Page = 'home' | 'shop' | 'rewards' | 'avatar' | 'ranking' | 'room' | 'game';