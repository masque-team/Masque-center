import { AVATARS, BATTLE_PASS, ENERGY_CONFIG, PETS, SHOP_ITEMS, VIP_PACKAGES, WINGS } from '../data/config';
import { GAMES } from '../data/games';
import { getGameRanking } from './rankingService';
import { isVip, spendGameEnergy } from './energyService';
import { purchaseVip } from './passService';
import type { DemoConfig, DemoReward, DemoState, GameId, GameMode, PlayerState } from '../types';

export function createDemo(): DemoState {
  return {
    version: 1, clockOffset: 0, profileXp: 0, transactions: [], sessions: [], arenaTickets: 0, playTimeMs: {}, playCounts: {}, achievements: [], profile: { backgroundId: 'canal-day', bio: '', badgeIds: [] }, scores: {}, seasonScores: {}, rankingClaims: [], rankingResets: [], passes: {}, missionCounts: {}, missionClaims: [], pointPackClaims: [], frames: [], frameId: null, wings: [], wingId: null, ownedDecor: ['sofa', 'plant'], battles: [], room: null,
    config: {
      energyMax: 12, regenMinutes: 30, energyCost: 1, exchangeRate: 10, checkinReward: 35,
      missionTarget: 1, missionXp: 100, premiumPrice: 200, gachaCost: 90, duplicatePoints: 30,
      gachaPool: PETS.map((pet) => ({ petId: pet.id, weight: pet.rarity === 'Legendary' ? 2 : pet.rarity === 'Epic' ? 8 : 20 })),
      games: GAMES.map((game) => ({ ...game, published: true })), vipPlans: structuredClone(VIP_PACKAGES), vipUnlimited: true,
      energyPacks: ENERGY_CONFIG.refillPacks.map((pack) => ({ ...pack })),
      shop: [...SHOP_ITEMS.map((item) => ({ ...item })), ...WINGS.map((wing) => ({ id: `wing-${wing.id}`, kind: 'wing' as const, itemId: wing.id, cost: wing.cost })), { id: 'frame-sunrise', kind: 'frame', itemId: 'sunrise', cost: 80 }, { id: 'frame-ocean', kind: 'frame', itemId: 'ocean', cost: 80 }],
      seasons: [
        { id: 'songkran', name: 'Songkran Splash', theme: 'water', starts: '2026-04-01', ends: '2026-04-30', free: structuredClone(BATTLE_PASS.freeRewards) as DemoReward[], premium: structuredClone(BATTLE_PASS.vipRewards) as DemoReward[] },
        { id: 'loy-krathong', name: 'Loy Krathong Lights', theme: 'lantern', starts: '2026-11-01', ends: '2026-11-30', free: [{ title: 'Masque Points +30', type: 'points', amount: 30 }, { title: 'Energy +3', type: 'energy', amount: 3 }, { title: 'Gacha Ticket', type: 'ticket', amount: 1 }, { title: 'Avatar: Aqua', type: 'avatar', itemId: 'aqua' }, { title: 'Masque Points +80', type: 'points', amount: 80 }], premium: [{ title: 'Masque Points +50', type: 'points', amount: 50 }, { title: 'Pet: Mooncat', type: 'pet', itemId: 'mooncat' }, { title: 'Energy +8', type: 'energy', amount: 8 }, { title: 'Avatar: Luna', type: 'avatar', itemId: 'luna' }, { title: 'Gacha Ticket x2', type: 'ticket', amount: 2 }] },
      ],
      passSeasonId: 'songkran', rankingSeasonId: 'season-01', rankingPrize: 100,
      battleEntry: 30, arenaTicketPrice: 30, battlePrize: 70, battleEnabled: true, worldEnabled: true, worldTheme: 'water', announcement: 'Welcome to Masque Island',
      roomLimit: 4, roomVipOnly: false, roomPrivate: true, decorPrice: 25, moderationRule: 'สุภาพ ไม่เปิดเผยข้อมูลส่วนตัว',
    },
  };
}

export function demoNow(player: PlayerState): number { return Date.now() + player.demo.clockOffset; }
export function validateConfig(config: DemoConfig): string | null {
  if (!Number.isSafeInteger(config.arenaTicketPrice) || config.arenaTicketPrice < 1) return 'ราคาบัตร Ranked ต้องเป็นจำนวนเต็มมากกว่า 0';
  const positive = [config.energyMax, config.regenMinutes, config.energyCost, config.exchangeRate, config.missionTarget, config.missionXp, config.roomLimit];
  const nonnegative = [config.checkinReward, config.premiumPrice, config.gachaCost, config.duplicatePoints, config.rankingPrize, config.battleEntry, config.battlePrize, config.decorPrice, ...config.shop.map((item) => item.cost), ...config.energyPacks.map((pack) => pack.cost), ...config.vipPlans.flatMap((plan) => [plan.cost, plan.bonusPoints ?? 0, plan.bonusTickets ?? 0]), ...config.gachaPool.map((item) => item.weight)];
  if (positive.some((value) => !Number.isSafeInteger(value) || value < 1) || nonnegative.some((value) => !Number.isSafeInteger(value) || value < 0)) return 'จำนวนต้องเป็นเลขจำนวนเต็มที่ถูกต้อง';
  if (config.energyPacks.some((pack) => !Number.isSafeInteger(pack.energy) || pack.energy < 1) || config.vipPlans.some((plan) => !Number.isSafeInteger(plan.durationDays) || plan.durationDays < 1)) return 'ระยะเวลาและจำนวน Energy ต้องมากกว่า 0';
  if (!config.gachaPool.some((item) => item.weight > 0)) return 'Gacha ต้องมีอย่างน้อย 1 ตัวที่มีน้ำหนักมากกว่า 0';
  if (!config.rankingSeasonId.trim()) return 'กรุณาตั้งชื่อ Ranking Season';
  if (config.games.every((game) => game.published === false)) return 'ต้องเผยแพร่อย่างน้อย 1 เกม';
  if (!config.vipPlans.length || config.vipPlans.some((plan) => !plan.label.trim())) return 'กรุณาตั้งชื่อแพ็กเกจ VIP';
  if (config.roomLimit > 8) return 'จำนวนสมาชิกห้องต้องไม่เกิน 8';
  if (config.games.some((game) => { try { return !['https:', 'http:'].includes(new URL(game.url).protocol); } catch { return true; } })) return 'Game URL ไม่ถูกต้อง';
  for (const season of config.seasons) {
    if (!season.name.trim() || !season.starts || !season.ends || season.ends < season.starts) return 'กรุณาตรวจสอบชื่อและวันที่ Season';
    if (season.free.length !== season.premium.length) return 'Reward tracks ต้องมีจำนวน Tier เท่ากัน';
    for (const reward of [...season.free, ...season.premium]) {
      if (!reward.title.trim()) return 'กรุณาตั้งชื่อรางวัล';
      if (reward.type === 'avatar' || reward.type === 'pet') {
        if (!(reward.type === 'avatar' ? AVATARS : PETS).some((item) => item.id === reward.itemId)) return 'กรุณาเลือก Item ของรางวัล';
      } else if (!Number.isSafeInteger(reward.amount) || (reward.amount ?? 0) < 1) return 'จำนวนรางวัลต้องมากกว่า 0';
    }
  }
  return null;
}
export function dayKey(player: PlayerState): string { return new Date(demoNow(player)).toLocaleDateString('en-CA'); }
export function currentPass(player: PlayerState) {
  return player.demo.passes[player.demo.config.passSeasonId] ?? { xp: 0, premium: false, claims: [] };
}
export function currentSeason(player: PlayerState) {
  return player.demo.config.seasons.find((season) => season.id === player.demo.config.passSeasonId) ?? player.demo.config.seasons[0];
}
export function hasPassAccess(player: PlayerState): boolean {
  return isVip(player, demoNow(player)) || currentPass(player).premium;
}
export function gameMission(player: PlayerState, gameId: GameId) {
  const prefix = `game:${gameId}:`;
  let stage = 0;
  while (player.demo.missionClaims.includes(`${prefix}${stage}`)) stage += 1;
  const targets = [1, 5, 10, 20, 50];
  return { id: `${prefix}${stage}`, stage, target: targets[stage] ?? 50 + (stage - 4) * 50, count: player.demo.playCounts[gameId] ?? 0, xp: Math.min(100, 20 + stage * 10), points: 10 + Math.min(stage, 10) * 5 };
}
export function ledger(previous: PlayerState, next: PlayerState, label: string): PlayerState {
  const mp = next.masquePoints - previous.masquePoints;
  const ais = next.aisPoints - previous.aisPoints;
  const energy = next.energy - previous.energy;
  if (!mp && !ais && !energy) return next;
  return { ...next, demo: { ...next.demo, transactions: [{ id: crypto.randomUUID(), at: demoNow(next), label, mp, ais, energy }, ...next.demo.transactions].slice(0, 150) } };
}
export function grantReward(player: PlayerState, reward: DemoReward): PlayerState {
  const next = { ...player };
  if (reward.type === 'points') next.masquePoints += reward.amount ?? 0;
  if (reward.type === 'energy') next.energy += reward.amount ?? 0;
  if (reward.type === 'ticket') next.gachaTickets += reward.amount ?? 1;
  if (reward.type === 'avatar' && AVATARS.some((item) => item.id === reward.itemId) && !next.ownedAvatarIds.includes(reward.itemId!)) next.ownedAvatarIds = [...next.ownedAvatarIds, reward.itemId!];
  if (reward.type === 'pet' && PETS.some((item) => item.id === reward.itemId) && !next.ownedPetIds.includes(reward.itemId!)) next.ownedPetIds = [...next.ownedPetIds, reward.itemId!];
  return next;
}
export function beginGame(player: PlayerState, gameId: GameId, mode: GameMode = 'casual'): PlayerState | null {
  if (!player.demo.config.games.some((game) => game.id === gameId && game.published !== false)) return null;
  if (mode === 'ranked' && (!player.demo.config.battleEnabled || player.demo.arenaTickets < 1)) return null;
  const next = mode === 'ranked' ? { ...player, demo: { ...player.demo, arenaTickets: player.demo.arenaTickets - 1 } } : spendGameEnergy(player, demoNow(player));
  if (!next) return null;
  const session = { id: crypto.randomUUID(), gameId, mode, startedAt: demoNow(player), finished: false, reward: { points: mode === 'ranked' ? player.demo.config.battlePrize : 0, xp: mode === 'ranked' ? 80 : 40 } };
  return { ...next, demo: { ...next.demo, sessions: [...next.demo.sessions, session].slice(-100) } };
}

export function recordPlayTime(player: PlayerState, sessionId: string, milliseconds: number): PlayerState {
  const session = player.demo.sessions.find((entry) => entry.id === sessionId);
  if (!session || session.finished || !Number.isFinite(milliseconds) || milliseconds <= 0 || milliseconds > 60_000) return player;
  return { ...player, demo: { ...player.demo, playTimeMs: { ...player.demo.playTimeMs, [session.gameId]: (player.demo.playTimeMs[session.gameId] ?? 0) + Math.round(milliseconds) } } };
}

export function finishGame(player: PlayerState, sessionId: string, score: number): PlayerState | null {
  const session = player.demo.sessions.find((entry) => entry.id === sessionId);
  if (!session || session.finished || !Number.isSafeInteger(score) || score < 0) return null;
  const seasonId = player.demo.config.rankingSeasonId;
  const seasonScores = player.demo.seasonScores[seasonId] ?? {};
  const reward = session.reward ?? { points: 0, xp: 40 };
  const profileXp = player.demo.profileXp + reward.xp;
  const achievements = [...player.demo.achievements];
  if (!achievements.some((badge) => badge.id === 'first-finish')) achievements.push({ id: 'first-finish', title: 'First Finish', earnedAt: demoNow(player), gameId: session.gameId });
  if (session.mode === 'ranked' && !achievements.some((badge) => badge.id === 'ranked-debut')) achievements.push({ id: 'ranked-debut', title: 'Ranked Debut', earnedAt: demoNow(player), gameId: session.gameId });
  const playCounts = { ...player.demo.playCounts, [session.gameId]: (player.demo.playCounts[session.gameId] ?? 0) + 1 };
  if (Object.keys(playCounts).length >= 5 && !achievements.some((badge) => badge.id === 'explorer')) achievements.push({ id: 'explorer', title: '5-Game Explorer', earnedAt: demoNow(player) });
  const today = dayKey(player);
  return { ...player, masquePoints: player.masquePoints + reward.points, level: 18 + Math.floor(profileXp / 100), demo: { ...player.demo, profileXp, achievements, playCounts,
    sessions: player.demo.sessions.map((entry) => entry.id === sessionId ? { ...entry, finished: true, score } : entry),
    scores: { ...player.demo.scores, [session.gameId]: Math.max(score, player.demo.scores[session.gameId] ?? 0) },
    seasonScores: { ...player.demo.seasonScores, [seasonId]: { ...seasonScores, [session.gameId]: Math.max(score, seasonScores[session.gameId] ?? 0) } },
    missionCounts: { ...player.demo.missionCounts, [today]: (player.demo.missionCounts[today] ?? 0) + 1 },
  } };
}
export function buyPremium(player: PlayerState): PlayerState | null {
  if (hasPassAccess(player)) return null;
  const plan = player.demo.config.vipPlans.find((item) => item.durationDays === 7) ?? player.demo.config.vipPlans[0];
  return plan ? purchaseVip(player, plan.id, demoNow(player)) : null;
}
export function claimPass(player: PlayerState, track: 'free' | 'premium', index: number): PlayerState | null {
  const pass = currentPass(player);
  const reward = currentSeason(player)[track][index];
  const claimId = `${track}-${index}`;
  if (!reward || pass.xp < index * 100 || pass.claims.includes(claimId) || (track === 'premium' && !hasPassAccess(player))) return null;
  const next = grantReward(player, reward);
  return { ...next, demo: { ...next.demo, passes: { ...next.demo.passes, [next.demo.config.passSeasonId]: { ...pass, claims: [...pass.claims, claimId] } } } };
}
export function claimMission(player: PlayerState, gameId?: GameId): PlayerState | null {
  if (gameId) {
    if (!player.demo.config.games.some((game) => game.id === gameId && game.published !== false)) return null;
    const mission = gameMission(player, gameId);
    if (mission.count < mission.target) return null;
    const pass = currentPass(player);
    return { ...player, masquePoints: player.masquePoints + mission.points, demo: { ...player.demo, missionClaims: [...player.demo.missionClaims, mission.id], passes: { ...player.demo.passes, [player.demo.config.passSeasonId]: { ...pass, xp: Math.min(currentSeason(player).free.length * 100, pass.xp + mission.xp) } } } };
  }
  const today = dayKey(player);
  const missionId = `${player.demo.config.passSeasonId}-${today}`;
  if ((player.demo.missionCounts[today] ?? 0) < player.demo.config.missionTarget || player.demo.missionClaims.includes(missionId)) return null;
  const pass = currentPass(player);
  return { ...player, demo: { ...player.demo, missionClaims: [...player.demo.missionClaims, missionId], passes: { ...player.demo.passes, [player.demo.config.passSeasonId]: { ...pass, xp: Math.min(500, pass.xp + player.demo.config.missionXp) } } } };
}
export function startBattle(player: PlayerState, gameId: GameId): PlayerState | null {
  return beginGame(player, gameId, 'ranked');
}
export function claimBattle(player: PlayerState, id: string): PlayerState | null {
  const battle = player.demo.battles.find((entry) => entry.id === id);
  if (!battle || battle.claimed) return null;
  return { ...player, masquePoints: player.masquePoints + battle.prize, demo: { ...player.demo, battles: player.demo.battles.map((entry) => entry.id === id ? { ...entry, claimed: true } : entry) } };
}
export function claimRankingReward(player: PlayerState, gameId: GameId): PlayerState | null {
  const id = `${player.demo.config.rankingSeasonId}:${gameId}`;
  const score = player.demo.seasonScores[player.demo.config.rankingSeasonId]?.[gameId] ?? 0;
  const rank = getGameRanking(gameId, 'weekly', player, score).findIndex((entry) => entry.isCurrentPlayer);
  if (!score || rank > 2 || player.demo.rankingClaims.includes(id)) return null;
  const badge = { id: `top:${id}`, title: `Top ${rank + 1}`, earnedAt: demoNow(player), seasonId: player.demo.config.rankingSeasonId, gameId };
  return { ...player, masquePoints: player.masquePoints + player.demo.config.rankingPrize, demo: { ...player.demo, rankingClaims: [...player.demo.rankingClaims, id], achievements: [...player.demo.achievements, badge] } };
}
export function buyDecor(player: PlayerState, kind: string): PlayerState | null {
  if (!['sofa', 'plant', 'lamp', 'music'].includes(kind) || player.demo.ownedDecor.includes(kind) || player.masquePoints < player.demo.config.decorPrice) return null;
  return { ...player, masquePoints: player.masquePoints - player.demo.config.decorPrice, demo: { ...player.demo, ownedDecor: [...player.demo.ownedDecor, kind] } };
}