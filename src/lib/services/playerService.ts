import type { PlayerState } from '../types';
import { ENERGY_CONFIG, PLAYER_MOCK_CONFIG, PROFILE_BACKGROUNDS, SHOP_ITEMS, VIP_PACKAGES, WINGS } from '../data/config';
import type { ProfileStyle } from '../types';
import { createDemo, currentSeason, dayKey } from './demoService';
import { PASS_RULES, passTrack } from './battlePassService';

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
  result.demo.config.vipFreeEntry ??= result.demo.config.vipUnlimited ?? true;
  result.demo.config.vipEnergyBonus ??= 6;
  result.demo.config.continueEnergyCost ??= 1;
  delete result.demo.config.vipUnlimited;
  if (result.energyUpdatedAt > Date.now() + result.demo.clockOffset) result.energyUpdatedAt = Date.now() + result.demo.clockOffset;
  result.demo.weeklyGames ??= {};
  result.demo.backgrounds = [...new Set([...(result.demo.backgrounds ?? []), ...PROFILE_BACKGROUNDS.map((background) => background.id)])];
  if (result.demo.passRevision !== 2) {
    const oldId = result.demo.config.passSeasonId;
    const oldPass = result.demo.passes[oldId] ?? { xp: 0, premium: false, claims: [] };
    result.demo.config.passAutomatic = true;
    result.demo.config.seasons = result.demo.config.seasons.map((season) => ({ ...season, free: passTrack(season.free, 'free', season.theme), premium: passTrack(season.premium, 'premium', season.theme) }));
    result.demo.config.vipPlans = result.demo.config.vipPlans.filter((plan) => plan.durationDays === PASS_RULES.days);
    if (!result.demo.config.vipPlans.length) result.demo.config.vipPlans = structuredClone(VIP_PACKAGES);
    if (result.demo.config.missionTarget === 1) result.demo.config.missionTarget = 3;
    if (result.demo.config.missionXp === 100) result.demo.config.missionXp = PASS_RULES.dailyXp;
    const active = currentSeason(result);
    const id = active.id;
    for (const template of result.demo.config.seasons) {
      const previous = result.demo.passes[template.id];
      if (previous) result.demo.passes[`${template.id}:${active.starts}`] ??= { ...previous, xp: previous.xp + PASS_RULES.xpPerLevel, claims: [...previous.claims] };
    }
    result.demo.passes[id] ??= { ...oldPass, xp: oldPass.xp + PASS_RULES.xpPerLevel, claims: [...oldPass.claims] };
    const today = dayKey(result);
    result.demo.missionCounts[`${id}:${today}`] ??= result.demo.missionCounts[today] ?? 0;
    if (result.demo.missionClaims.includes(`${oldId}-${today}`)) result.demo.missionClaims.push(`${id}-${today}`);
    result.demo.passRevision = 2;
  }
  result.demo.pointPackClaims ??= [];
  result.demo.arenaTickets ??= 0;
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
  for (const item of SHOP_ITEMS) {
    if (!result.demo.config.shop.some((existing) => existing.id === item.id)) result.demo.config.shop.push({ ...item });
  }
  result.demo.ownedDecor ??= ['sofa', 'plant'];
  result.demo.config.decorPrice ??= 25;
  result.demo.config.games = result.demo.config.games.map((game, index) => ({ ...game, ...(game.id === 'memory' ? { cover: game.cover ?? 'mem.png' } : {}), published: game.published ?? true, displayOrder: game.displayOrder ?? index + 1 }));
  result.demo.config.vipPlans = result.demo.config.vipPlans.map((plan) => ({ ...plan, bonusPoints: plan.bonusPoints ?? (plan.id === 'seven-day' ? 80 : 0), bonusTickets: plan.bonusTickets ?? (plan.id === 'five-day' ? 1 : 0) }));
  if (!result.demo.config.vipPlans.some((plan) => (plan.startLevel ?? 1) > 1)) result.demo.config.vipPlans.push(structuredClone(VIP_PACKAGES.find((plan) => plan.id === 'monthly-boost-30')!));
  result.displayName = queryName?.trim().replace(/\s+/g, ' ').slice(0, 40) || 'Guest Player';
  savePlayer(result);
  return result;
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