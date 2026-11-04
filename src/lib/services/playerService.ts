import type { PlayerState } from '../types';
import { ENERGY_CONFIG, PLAYER_MOCK_CONFIG, PROFILE_BACKGROUNDS, PROFILE_FRAMES, SHOP_ITEMS, VIP_PACKAGES, WINGS } from '../data/config';
import type { ProfileStyle } from '../types';
import { createDemo, currentSeason, dayKey, settleExpiredPasses } from './demoService';
import { PASS_RULES, passTrack } from './battlePassService';
import { catalogFromFile, GAMES } from '../data/games';
import { CAMPAIGNS } from '../data/campaigns';
import { settleExpiredCampaigns } from './campaignService';

const STORAGE_KEY = 'masquegame_center_v2';

function createPlayer(displayName: string | null): PlayerState {
  return {
    id: `MG${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`,
    displayName: displayName?.trim().slice(0, 40) || 'Guest Player',
    level: PLAYER_MOCK_CONFIG.level,
    aisPoints: PLAYER_MOCK_CONFIG.aisPoints,
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
    demo: createDemo(),
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

export function loadPlayer(queryName: string | null, resetMock = false): PlayerState {
  let player: PlayerState | null = null;
  if (!resetMock) {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (isPlayerState(stored)) player = stored;
    } catch {
      player = null;
    }
  }
  const result = player ?? createPlayer(queryName);
  if (!result.demo || result.demo.version !== 1) {
    result.demo = createDemo();
    result.demo.passRevision = 1;
    result.demo.passes.songkran = {
      xp: Math.max(0, Math.min(500, result.battlePassXp)), premium: false,
      claims: result.claimedRewards.flatMap((claim) => {
        const match = /^(free|vip)-(\d+)$/.exec(claim);
        return match ? [`${match[1] === 'vip' ? 'premium' : 'free'}-${Number(match[2]) - 1}`] : [];
      }),
    };
  }
  result.demo.rankingResets ??= [];
  result.demo.config.energyMax = 15;
  result.demo.config.regenMinutes = 30;
  result.demo.config.energyCost = 1;
  result.demo.config.vipFreeEntry = true;
  result.demo.config.vipEnergyBonus = 15;
  result.demo.config.continueEnergyCost = 1;
  result.demo.config.checkinEnergyReward ??= 3;
  result.demo.config.duplicateEnergy ??= 1;
  result.demo.config.rankingEnergyPrize ??= 5;
  delete result.demo.config.vipUnlimited;
  if (result.energyUpdatedAt > Date.now() + result.demo.clockOffset) result.energyUpdatedAt = Date.now() + result.demo.clockOffset;
  result.demo.weeklyGames ??= {};
  result.demo.scoreTimes ??= {};
  result.demo.campaignScores ??= {};
  result.demo.campaignTickets ??= 2;
  result.demo.settledCampaigns ??= [];
  result.demo.campaignJoinCount ??= result.demo.sessions.filter((session) => session.mode === 'campaign').length;
  if (result.demo.campaignCompletedCount === undefined) {
    const participatedCampaigns = new Set([
      ...result.demo.sessions.flatMap((session) => session.mode === 'campaign' && session.campaignId ? [session.campaignId] : []),
      ...Object.keys(result.demo.campaignScores ?? {}),
    ]);
    result.demo.campaignCompletedCount = result.demo.settledCampaigns.filter((campaignId) => participatedCampaigns.has(campaignId)).length;
  }
  result.demo.closedCampaigns ??= [];
  result.demo.notifications ??= [];
  result.demo.history ??= [];
  result.demo.missionProgress ??= {};
  result.demo.recentMissionEvents ??= [];
  result.demo.settledPasses ??= [];
  result.demo.config.campaigns ??= structuredClone(CAMPAIGNS);
  result.demo.config.campaignTicketPacks ??= [
    { id: 'campaign-ticket-5', label: '5 Campaign Tickets', quantity: 5, cost: 100 },
    { id: 'campaign-ticket-12', label: '12 Campaign Tickets', quantity: 12, cost: 200 },
  ];
  result.demo.backgrounds = [...new Set([...(result.demo.backgrounds ?? []), ...PROFILE_BACKGROUNDS.map((background) => background.id)])];
  if (result.demo.passRevision !== 6) {
    const oldId = result.demo.config.passSeasonId;
    const oldPass = result.demo.passes[oldId] ?? { xp: 0, premium: false, claims: [] };
    result.demo.config.passAutomatic = true;
    result.demo.config.seasons = result.demo.config.seasons.map((season) => ({ ...season, free: passTrack(season.free, 'free', season.theme), premium: passTrack(season.premium, 'premium', season.theme) }));
    const legacyVipIds = new Set(['monthly', 'monthly-boost-20', 'monthly-boost-30']);
    const customVipPlans = result.demo.config.vipPlans.filter((plan) => !legacyVipIds.has(plan.id));
    result.demo.config.vipPlans = [...structuredClone(VIP_PACKAGES), ...customVipPlans];
    if (result.demo.config.missionTarget === 1) result.demo.config.missionTarget = 3;
    if (result.demo.config.missionXp === 100) result.demo.config.missionXp = PASS_RULES.dailyXp;
    const active = currentSeason(result);
    const id = active.id;
    for (const template of result.demo.config.seasons) {
      const previous = result.demo.passes[template.id];
      if (previous) result.demo.passes[`${template.id}:${active.starts}`] ??= { ...previous, claims: [...previous.claims] };
    }
    result.demo.passes[id] ??= { ...oldPass, claims: [...oldPass.claims] };
    const today = dayKey(result);
    result.demo.missionCounts[`${id}:${today}`] ??= result.demo.missionCounts[today] ?? 0;
    if (result.demo.missionClaims.includes(`${oldId}-${today}`)) result.demo.missionClaims.push(`${id}-${today}`);
    result.demo.passRevision = 6;
  }
  result.demo.pointPackClaims ??= [];
  result.demo.arenaTickets ??= 0;
  result.demo.gachaBoxes ??= { avatar: 0, pet: 0 };
  result.demo.playTimeMs ??= {};
  result.demo.playCounts ??= result.demo.sessions.filter((session) => session.finished).reduce<Record<string, number>>((counts, session) => ({ ...counts, [session.gameId]: (counts[session.gameId] ?? 0) + 1 }), {});
  result.demo.achievements ??= [];
  result.demo.profile ??= { backgroundId: 'canal-day', bio: '', badgeIds: [] };
  result.demo.config.arenaTicketPrice ??= 30;
  result.demo.wings ??= [];
  result.demo.wingId ??= null;
  if (!result.demo.wings.includes(result.demo.wingId ?? '') || !WINGS.some((wing) => wing.id === result.demo.wingId)) result.demo.wingId = null;
  for (const wing of WINGS) {
    if (!result.demo.config.shop.some((item) => item.kind === 'wing' && item.itemId === wing.id)) result.demo.config.shop.push({ id: `wing-${wing.id}`, kind: 'wing', itemId: wing.id, cost: wing.cost });
  }
  for (const frame of PROFILE_FRAMES) {
    if (!result.demo.config.shop.some((item) => item.kind === 'frame' && item.itemId === frame.id)) result.demo.config.shop.push({ id: `frame-${frame.id}`, kind: 'frame', itemId: frame.id, cost: frame.cost });
  }
  for (const item of SHOP_ITEMS) {
    if (!result.demo.config.shop.some((existing) => existing.id === item.id)) result.demo.config.shop.push({ ...item });
  }
  result.demo.ownedDecor ??= ['sofa', 'plant'];
  result.demo.config.decorPrice ??= 25;
  result.demo.config.games = (catalogFromFile ? GAMES : result.demo.config.games).map((game, index) => ({ ...game, ...(game.id === 'memory' ? { cover: game.cover ?? 'mem.png' } : {}), published: game.published ?? true, displayOrder: game.displayOrder ?? index + 1 }));
  if (!catalogFromFile && result.demo.config.games.some((game) => game.id === 'bird' && game.featured) && !result.demo.config.games.some((game) => game.id === 'memory' && game.featured)) {
    result.demo.config.games = result.demo.config.games.map((game) => game.id === 'memory' ? { ...game, featured: true, editorialTag: 'hot' } : game.id === 'bird' ? { ...game, featured: false, editorialTag: 'new' } : game);
  }
  result.demo.config.vipPlans = result.demo.config.vipPlans.map((plan) => ({ ...plan, bonusPoints: plan.bonusPoints ?? (plan.id === 'seven-day' ? 80 : 0), bonusTickets: plan.bonusTickets ?? (plan.id === 'five-day' ? 1 : 0) }));
  for (const plan of VIP_PACKAGES) {
    if (!result.demo.config.vipPlans.some((existing) => existing.id === plan.id)) result.demo.config.vipPlans.push(structuredClone(plan));
  }
  result.displayName = queryName?.trim().replace(/\s+/g, ' ').slice(0, 40) || 'Guest Player';
  const now = Date.now() + result.demo.clockOffset;
  const settled = settleExpiredCampaigns(settleExpiredPasses(result, now), now);
  savePlayer(settled);
  return settled;
}

export function savePlayer(player: PlayerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...player, displayName: 'Guest Player' }));
  } catch {
    console.warn('MasqueGame mock player state could not be saved to localStorage.');
  }
}

export function customizeProfile(player: PlayerState, style: ProfileStyle, frameId: string | null): PlayerState | null {
  if (!PROFILE_BACKGROUNDS.some((background) => background.id === style.backgroundId) || style.bio.length > 140 || style.badgeIds.length > 3) return null;
  if (!(player.demo.backgrounds ?? PROFILE_BACKGROUNDS.map((background) => background.id)).includes(style.backgroundId)) return null;
  if (new Set(style.badgeIds).size !== style.badgeIds.length || style.badgeIds.some((id) => !player.demo.achievements.some((badge) => badge.id === id))) return null;
  if (frameId && !player.demo.frames.includes(frameId)) return null;
  return { ...player, demo: { ...player.demo, profile: { ...style, bio: style.bio.trim(), badgeIds: [...style.badgeIds] }, frameId } };
}
