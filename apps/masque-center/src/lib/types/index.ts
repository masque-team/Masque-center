export type GameId = string;
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
  onlineBase?: number;
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
  startLevel?: number;
}

export interface RankingEntry {
  playerId: string;
  displayName: string;
  score: number;
  achievedAt?: number;
  isCurrentPlayer?: boolean;
}

export type RankingPeriod = 'allTime';
export type GameMode = 'casual' | 'ranked' | 'campaign';
export type DemoScenario = 'energy-overflow' | 'vip-renewal' | 'premium-retro' | 'vip-no-premium' | 'ranking-tie' | 'campaign-ranking' | 'campaign-settlement' | 'pass-rollover' | 'gacha-ready';
export type GachaKind = 'avatar' | 'pet';
export type GachaDrawResult =
  | { kind: 'energy'; amount: number; duplicate: false }
  | { kind: 'avatar' | 'pet'; itemId: string; duplicate: boolean; duplicateEnergy?: number };
export interface GachaOddsItem { kind: GachaDrawResult['kind']; itemId?: string; title: string; weight: number; rate: number; featured?: boolean }
export interface GachaBatchResult { player: PlayerState; results: GachaDrawResult[]; paidCoupons: number; bonusDraws: number }
export interface ProfileStyle { backgroundId: string; bio: string; badgeIds: string[] }
export interface ProfileBadge { id: string; title: string; earnedAt: number; seasonId?: string; gameId?: GameId }

export type Page = 'home' | 'hub' | 'world' | 'shop' | 'rewards' | 'ranking' | 'avatar' | 'profile' | 'room' | 'game' | 'detail' | 'battle' | 'admin' | 'wallet' | 'points' | 'gacha' | 'campaigns' | 'campaign' | 'achievements' | 'missions' | 'inventory' | 'history' | 'vip';

export type ShopTab = 'items' | 'energy' | 'vip';

export type ModalState =
  | { kind: 'notice'; title: string; message: string; tone?: 'info' | 'success' | 'warn' }
  | { kind: 'vip-confirm'; packageId: VipPackage['id'] }
  | { kind: 'refill-confirm'; refillId: string }
  | { kind: 'exchange-confirm' }
  | { kind: 'item-confirm'; itemId: string }
  | { kind: 'gacha-box-detail'; gachaKind: GachaKind }
  | { kind: 'ticket-pack-confirm'; packId: string }
  | { kind: 'campaign-entry-confirm'; gameId: GameId; campaignId: string }
  | { kind: 'premium-pass-confirm' }
  | { kind: 'gacha-result'; gachaKind: GachaKind; results: GachaDrawResult[]; paidCoupons: number; bonusDraws: number; source?: 'box' | 'legacy-ticket' }
  | { kind: 'gacha-coupon-confirm'; quantity: 1 | 10 }
  | { kind: 'mission-progress'; score: number; rewardXp: number; events: { title: string; before: number; after: number; target: number; xp: number }[] }
  | { kind: 'checkin-success' }
  | { kind: 'energy-empty' }
  | { kind: 'action-confirm'; title: string; message: string; label: string }
  | null;

export interface DemoReward {
  title: string;
  type: 'points' | 'energy' | 'ticket' | 'gacha-box' | 'avatar' | 'pet' | 'arena-ticket' | 'wing' | 'frame' | 'background' | 'badge';
  amount?: number;
  itemId?: string;
  boxKind?: GachaKind;
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

export interface CampaignRewardTier {
  label: string;
  fromRank: number;
  toRank: number;
  rewards: DemoReward[];
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  gameIds: GameId[];
  startAt: number;
  endAt: number;
  launchMode?: 'hub' | 'external';
  externalUrl?: string | null;
  entry: 'free' | 'ticket' | 'external';
  ticketCost: number;
  rewards: CampaignRewardTier[];
}

export interface DemoConfig {
  energyMax: number;
  regenMinutes: number;
  energyCost: number;
  exchangeRate: number;
  checkinEnergyReward: number;
  missionTarget: number;
  missionXp: number;
  premiumPrice: number;
  gachaCost: number;
  duplicateEnergy: number;
  gachaPool: { petId: string; weight: number }[];
  games: Game[];
  vipPlans: VipPackage[];
  vipUnlimited?: boolean;
  vipFreeEntry: boolean;
  vipEnergyBonus: number;
  continueEnergyCost: number;
  campaigns: Campaign[];
  campaignTicketPacks: { id: string; label: string; quantity: number; cost: number }[];
  energyPacks: { id: string; energy: number; cost: number }[];
  shop: { id: string; kind: 'avatar' | 'pet' | 'frame' | 'wing'; itemId: string; cost: number }[];
  seasons: DemoSeason[];
  passSeasonId: string;
  passAutomatic?: boolean;
  rankingSeasonId: string;
  rankingEnergyPrize: number;
  battleEntry: number;
  arenaTicketPrice: number;
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
  sessions: { id: string; gameId: GameId; startedAt: number; finished: boolean; score?: number; mode?: GameMode; campaignId?: string; reward?: { points: number; xp: number } }[];
  arenaTickets: number;
  gachaBoxes?: Partial<Record<GachaKind, number>>;
  playTimeMs: Partial<Record<GameId, number>>;
  playCounts: Partial<Record<GameId, number>>;
  achievements: ProfileBadge[];
  profile: ProfileStyle;
  scores: Partial<Record<GameId, number>>;
  scoreTimes?: Partial<Record<GameId, number>>;
  seasonScores: Record<string, Partial<Record<GameId, number>>>;
  campaignScores?: Record<string, Partial<Record<GameId, { score: number; achievedAt: number }>>>;
  campaignTickets?: number;
  campaignJoinCount?: number;
  campaignCompletedCount?: number;
  settledCampaigns?: string[];
  settledPasses?: string[];
  closedCampaigns?: string[];
  notifications?: { id: string; title: string; detail: string; viewed: boolean; at: number }[];
  history?: { id: string; kind: 'game' | 'purchase' | 'reward'; title: string; detail: string; at: number; gameId?: GameId }[];
  missionProgress?: Record<string, number>;
  recentMissionEvents?: { title: string; before: number; after: number; target: number; xp: number }[];
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