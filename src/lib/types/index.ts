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
  published?: boolean;
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
  demo: DemoState;
}

export interface VipPackage {
  id: string;
  label: string;
  durationDays: number;
  cost: number;
  reward: string;
  bonusPoints?: number;
  bonusTickets?: number;
}

export interface RankingEntry {
  playerId: string;
  displayName: string;
  score: number;
  isCurrentPlayer?: boolean;
}

export type RankingPeriod = 'weekly' | 'allTime';
export type GameMode = 'casual' | 'ranked';
export interface ProfileStyle { backgroundId: string; bio: string; badgeIds: string[] }
export interface ProfileBadge { id: string; title: string; earnedAt: number; seasonId?: string; gameId?: GameId }

export type Page = 'home' | 'world' | 'shop' | 'rewards' | 'ranking' | 'avatar' | 'profile' | 'room' | 'game' | 'detail' | 'battle' | 'admin' | 'wallet' | 'points' | 'gacha';

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
  | { kind: 'action-confirm'; title: string; message: string; label: string }
  | null;

export interface DemoReward {
  title: string;
  type: 'points' | 'energy' | 'ticket' | 'avatar' | 'pet' | 'arena-ticket' | 'wing' | 'frame' | 'background' | 'badge';
  amount?: number;
  itemId?: string;
}

export interface DemoSeason {
  id: string;
  name: string;
  theme: 'water' | 'lantern';
  starts: string;
  ends: string;
  free: DemoReward[];
  premium: DemoReward[];
}

export interface DemoConfig {
  energyMax: number;
  regenMinutes: number;
  energyCost: number;
  exchangeRate: number;
  checkinReward: number;
  missionTarget: number;
  missionXp: number;
  premiumPrice: number;
  gachaCost: number;
  duplicatePoints: number;
  gachaPool: { petId: string; weight: number }[];
  games: Game[];
  vipPlans: VipPackage[];
  vipUnlimited?: boolean;
  vipFreeEntry: boolean;
  vipEnergyBonus: number;
  continueEnergyCost: number;
  energyPacks: { id: string; energy: number; cost: number }[];
  shop: { id: string; kind: 'avatar' | 'pet' | 'frame' | 'wing'; itemId: string; cost: number }[];
  seasons: DemoSeason[];
  passSeasonId: string;
  passAutomatic?: boolean;
  rankingSeasonId: string;
  rankingPrize: number;
  battleEntry: number;
  arenaTicketPrice: number;
  battlePrize: number;
  battleEnabled: boolean;
  worldEnabled: boolean;
  worldTheme: 'water' | 'lantern';
  announcement: string;
  roomLimit: number;
  roomVipOnly: boolean;
  roomPrivate: boolean;
  decorPrice: number;
  moderationRule: string;
}

export interface DemoState {
  version: number;
  clockOffset: number;
  config: DemoConfig;
  profileXp: number;
  transactions: { id: string; at: number; label: string; mp: number; ais: number; energy: number }[];
  sessions: { id: string; gameId: GameId; startedAt: number; finished: boolean; score?: number; mode?: GameMode; reward?: { points: number; xp: number } }[];
  arenaTickets: number;
  playTimeMs: Partial<Record<GameId, number>>;
  playCounts: Partial<Record<GameId, number>>;
  achievements: ProfileBadge[];
  profile: ProfileStyle;
  scores: Partial<Record<GameId, number>>;
  seasonScores: Record<string, Partial<Record<GameId, number>>>;
  rankingClaims: string[];
  rankingResets: string[];
  passes: Record<string, { xp: number; premium: boolean; claims: string[] }>;
  missionCounts: Record<string, number>;
  missionClaims: string[];
  pointPackClaims: string[];
  passRevision?: number;
  weeklyGames?: Record<string, GameId[]>;
  backgrounds?: string[];
  frames: string[];
  frameId: string | null;
  wings: string[];
  wingId: string | null;
  ownedDecor: string[];
  battles: { id: string; gameId: GameId; at: number; result: 'win' | 'lose'; prize: number; claimed: boolean }[];
  room: null | { code: string; name: string; theme: 'water' | 'lantern'; private: boolean; guests: string[]; gameId: GameId; furniture: { id: string; kind: string; x: number; y: number }[]; savedAt: number };
}