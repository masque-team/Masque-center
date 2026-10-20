export type GameId = 'bird' | 'mole' | 'run' | 'fruit' | 'timber' | 'duck' | 'memory';
export type EditorialGameTag = 'hot' | 'new' | 'pick';

export interface Game {
  id: GameId;
  name: string;
  description: string;
  genre: string;
  badge: string;
  url: string;
  cover?: string;
  fallbackCover?: string;
  featured?: boolean;
  editorialTag?: EditorialGameTag;
  displayOrder?: number;
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

export type Page = 'home' | 'world' | 'shop' | 'rewards' | 'ranking' | 'avatar' | 'profile' | 'room' | 'game' | 'detail';

export type ShopTab = 'items' | 'exchange' | 'energy' | 'vip';

export type ModalState =
  | { kind: 'notice'; title: string; message: string; tone?: 'info' | 'success' | 'warn' }
  | { kind: 'vip-confirm'; packageId: VipPackage['id'] }
  | { kind: 'refill-confirm'; refillId: string }
  | { kind: 'exchange-confirm' }
  | { kind: 'item-confirm'; itemId: string }
  | { kind: 'gacha-result'; petId: string; duplicate: boolean }
  | { kind: 'checkin-success' }
  | { kind: 'energy-empty' }
  | null;