import { AVATARS, BATTLE_PASS, ENERGY_CONFIG, PETS, PROFILE_BACKGROUNDS, PROFILE_FRAMES, SHOP_ITEMS, VIP_PACKAGES, WINGS } from '../data/config';
import { PASS_RULES, passTrack, passWindow } from './battlePassService';
import { GAMES } from '../data/games';
import { CAMPAIGNS } from '../data/campaigns';
import { getGameRanking } from './rankingService';
import { isVip, spendGameEnergy } from './energyService';
import { evaluateAchievementEvent, type AchievementEvent } from './achievementService';
import type { DemoConfig, DemoReward, DemoScenario, DemoState, GameId, GameMode, PlayerState, ProfileBadge } from '../types';

const MISSION_DEFINITIONS = [
  { id: 'check-in', title: 'แวะเช็กอิน', description: 'เช็กอินประจำวัน', entitlement: 'free', period: 'daily', target: 1, xp: 30, trigger: 'checkin' },
  { id: 'free-daily', title: 'เล่นเกมประจำวัน', description: 'เล่นจบ 3 รอบ', entitlement: 'free', period: 'daily', target: 3, xp: 80, trigger: 'game' },
  { id: 'vip-daily', title: 'VIP daily streak', description: 'เล่นจบ 5 รอบ', entitlement: 'vip', period: 'daily', target: 5, xp: 120, trigger: 'game' },
  { id: 'premium-daily', title: 'Premium daily streak', description: 'เล่นจบ 7 รอบ', entitlement: 'premium', period: 'daily', target: 7, xp: 150, trigger: 'game' },
  { id: 'free-weekly', title: 'ผู้เล่นประจำสัปดาห์', description: 'เล่นจบ 10 รอบ', entitlement: 'free', period: 'weekly', target: 10, xp: 180, trigger: 'game' },
  { id: 'vip-weekly', title: 'VIP weekly streak', description: 'เล่นจบ 15 รอบ', entitlement: 'vip', period: 'weekly', target: 15, xp: 260, trigger: 'game' },
  { id: 'premium-weekly', title: 'Premium weekly streak', description: 'เล่นจบ 20 รอบ', entitlement: 'premium', period: 'weekly', target: 20, xp: 320, trigger: 'game' },
  { id: 'free-season', title: 'นักสำรวจซีซัน', description: 'เล่นจบ 30 รอบ', entitlement: 'free', period: 'season', target: 30, xp: 500, trigger: 'game' },
  { id: 'vip-season', title: 'VIP season challenge', description: 'เล่นจบ 50 รอบ', entitlement: 'vip', period: 'season', target: 50, xp: 750, trigger: 'game' },
  { id: 'premium-season', title: 'Premium season challenge', description: 'เล่นจบ 75 รอบ', entitlement: 'premium', period: 'season', target: 75, xp: 900, trigger: 'game' },
] as const;
export function createDemo(): DemoState {
  const demo: DemoState = {
    version: 1, clockOffset: 0, profileXp: 0, transactions: [], sessions: [], arenaTickets: 0, campaignTickets: 2, gachaBoxes: { avatar: 0, pet: 0 }, campaignScores: {}, settledCampaigns: [], closedCampaigns: [], notifications: [], history: [], missionProgress: {}, recentMissionEvents: [], settledPasses: [], playTimeMs: {}, playCounts: {}, achievements: [], profile: { backgroundId: 'canal-day', bio: '', badgeIds: [] }, scores: {}, scoreTimes: {}, seasonScores: {}, rankingClaims: [], rankingResets: [], passes: {}, missionCounts: {}, missionClaims: [], pointPackClaims: [], frames: [], frameId: null, wings: [], wingId: null, ownedDecor: ['sofa', 'plant'], battles: [], room: null,
    config: {
      energyMax: 15, regenMinutes: 30, energyCost: 1, exchangeRate: 10, checkinEnergyReward: 3,
      missionTarget: 1, missionXp: 100, premiumPrice: 200, gachaCost: 90, duplicateEnergy: 1,
      gachaPool: PETS.map((pet) => ({ petId: pet.id, weight: pet.rarity === 'Legendary' ? 2 : pet.rarity === 'Epic' ? 8 : 20 })),
      games: GAMES.map((game) => ({ ...game, published: game.published ?? true })), vipPlans: structuredClone(VIP_PACKAGES), vipFreeEntry: true, vipEnergyBonus: 15, continueEnergyCost: 1,
      energyPacks: ENERGY_CONFIG.refillPacks.map((pack) => ({ ...pack })),
      campaigns: structuredClone(CAMPAIGNS),
      campaignTicketPacks: [
        { id: 'campaign-ticket-5', label: '5 Campaign Tickets', quantity: 5, cost: 100 },
        { id: 'campaign-ticket-12', label: '12 Campaign Tickets', quantity: 12, cost: 200 },
      ],
      shop: [...SHOP_ITEMS.map((item) => ({ ...item })), ...WINGS.map((wing) => ({ id: `wing-${wing.id}`, kind: 'wing' as const, itemId: wing.id, cost: wing.cost })), ...PROFILE_FRAMES.map((frame) => ({ id: `frame-${frame.id}`, kind: 'frame' as const, itemId: frame.id, cost: frame.cost }))],
      seasons: [
        { id: 'songkran', name: 'Songkran Splash', theme: 'water', starts: '2026-04-01', ends: '2026-04-30', free: structuredClone(BATTLE_PASS.freeRewards) as DemoReward[], premium: structuredClone(BATTLE_PASS.vipRewards) as DemoReward[] },
        { id: 'loy-krathong', name: 'Loy Krathong Lights', theme: 'lantern', starts: '2026-11-01', ends: '2026-11-30', free: [{ title: 'Energy +2', type: 'energy', amount: 2 }, { title: 'Energy +3', type: 'energy', amount: 3 }, { title: 'Pet Gacha Box', type: 'gacha-box', amount: 1, boxKind: 'pet' }, { title: 'Avatar: Aqua', type: 'avatar', itemId: 'aqua' }, { title: 'Energy +4', type: 'energy', amount: 4 }], premium: [{ title: 'Energy +3', type: 'energy', amount: 3 }, { title: 'Pet: Mooncat', type: 'pet', itemId: 'mooncat' }, { title: 'Energy +8', type: 'energy', amount: 8 }, { title: 'Avatar: Luna', type: 'avatar', itemId: 'luna' }, { title: 'Pet Gacha Box x2', type: 'gacha-box', amount: 2, boxKind: 'pet' }] },
      ],
      passSeasonId: 'songkran', rankingSeasonId: 'season-01', rankingEnergyPrize: 5,
      battleEntry: 30, arenaTicketPrice: 30, battleEnabled: true, worldEnabled: true, worldTheme: 'water', announcement: 'Welcome to Masque Island',
      roomLimit: 4, roomVipOnly: false, roomPrivate: true, decorPrice: 25, moderationRule: 'สุภาพ ไม่เปิดเผยข้อมูลส่วนตัว',
    },
  };
  demo.passRevision = 6;
  demo.weeklyGames = {};
  demo.backgrounds = PROFILE_BACKGROUNDS.map((background) => background.id);
  demo.config.passAutomatic = true;
  demo.config.missionTarget = 3;
  demo.config.missionXp = PASS_RULES.dailyXp;
  demo.config.seasons = demo.config.seasons.map((season) => ({ ...season, free: passTrack(season.free, 'free', season.theme), premium: passTrack(season.premium, 'premium', season.theme) }));
  return demo;
}

function missionPeriodKey(id: typeof MISSION_DEFINITIONS[number]['period'], player: PlayerState, at: number): string {
  if (id === 'daily') return dayKey(player, at);
  const season = currentSeason(player, at);
  if (id === 'season') return season.id;
  const week = Math.max(0, Math.floor((at - Date.parse(`${season.starts}T00:00:00Z`)) / (7 * 86_400_000)));
  return `${season.id}:week-${week}`;
}
export function getMissions(player: PlayerState, at = demoNow(player)) {
  const premium = currentPass(player, at).premium;
  return MISSION_DEFINITIONS.map((mission) => {
    const periodKey = missionPeriodKey(mission.period, player, at);
    const key = `m2:${mission.id}:${periodKey}`;
    const locked = mission.entitlement === 'vip' ? !isVip(player, at) : mission.entitlement === 'premium' ? !premium : false;
    return { ...mission, key, count: player.demo.missionProgress?.[key] ?? 0, locked, complete: player.demo.missionClaims.includes(key) };
  });
}
export function progressMissions(player: PlayerState, trigger: 'game' | 'checkin', at = demoNow(player)): PlayerState {
  let next: PlayerState = { ...player, demo: { ...player.demo, missionProgress: { ...(player.demo.missionProgress ?? {}) }, recentMissionEvents: [] } };
  const events: NonNullable<PlayerState['demo']['recentMissionEvents']> = [];
  const premium = currentPass(player, at).premium;
  for (const mission of MISSION_DEFINITIONS) {
    if (mission.trigger !== trigger) continue;
    if (mission.entitlement === 'vip' && !isVip(player, at) || mission.entitlement === 'premium' && !premium) continue;
    const key = `m2:${mission.id}:${missionPeriodKey(mission.period, player, at)}`;
    if (next.demo.missionClaims.includes(key)) continue;
    const before = next.demo.missionProgress?.[key] ?? 0;
    const after = Math.min(mission.target, before + 1);
    next = { ...next, demo: { ...next.demo, missionProgress: { ...next.demo.missionProgress, [key]: after } } };
    events.push({ title: mission.title, before, after, target: mission.target, xp: after === mission.target ? mission.xp : 0 });
    if (after < mission.target) continue;
    next = awardPassXp({ ...next, demo: { ...next.demo, missionClaims: [...next.demo.missionClaims, key] } }, mission.xp);
    const detail = `ภารกิจ ${mission.period} · +${mission.xp} XP`;
    const history = { id: crypto.randomUUID(), kind: 'reward' as const, title: mission.title, detail, at };
    next = { ...next, demo: { ...next.demo, history: [history, ...(next.demo.history ?? [])].slice(0, 250) } };
  }
  return { ...next, demo: { ...next.demo, recentMissionEvents: events } };
}
export function demoNow(player: PlayerState): number { return Date.now() + player.demo.clockOffset; }
export function validateConfig(config: DemoConfig): string | null {
  if (!config.vipPlans.length) return 'ต้องมีแพ็ก VIP อย่างน้อย 1 แพ็ก';
  if (config.vipPlans.some((plan) => !Number.isFinite(plan.durationDays) || plan.durationDays <= 0)) return 'ระยะเวลา VIP ต้องมากกว่า 0';
  if (!Number.isSafeInteger(config.arenaTicketPrice) || config.arenaTicketPrice < 1) return 'ราคาบัตร Ranked ต้องเป็นจำนวนเต็มมากกว่า 0';
  const positive = [config.energyMax, config.regenMinutes, config.energyCost, config.continueEnergyCost, config.exchangeRate, config.missionTarget, config.missionXp, config.roomLimit];
  const nonnegative = [config.vipEnergyBonus, config.checkinEnergyReward, config.premiumPrice, config.gachaCost, config.duplicateEnergy, config.rankingEnergyPrize, config.battleEntry, config.decorPrice, ...config.shop.map((item) => item.cost), ...config.energyPacks.map((pack) => pack.cost), ...config.vipPlans.flatMap((plan) => [plan.cost, plan.bonusPoints ?? 0, plan.bonusTickets ?? 0]), ...config.gachaPool.map((item) => item.weight)];
  if (positive.some((value) => !Number.isSafeInteger(value) || value < 1) || nonnegative.some((value) => !Number.isSafeInteger(value) || value < 0)) return 'จำนวนต้องเป็นเลขจำนวนเต็มที่ถูกต้อง';
  if (config.energyPacks.some((pack) => !Number.isSafeInteger(pack.energy) || pack.energy < 1)) return 'จำนวน Energy ต้องมากกว่า 0';
  if (!config.gachaPool.some((item) => item.weight > 0)) return 'Gacha ต้องมีอย่างน้อย 1 ตัวที่มีน้ำหนักมากกว่า 0';
  if (!config.rankingSeasonId.trim()) return 'กรุณาตั้งชื่อ Ranking Season';
  if (config.campaigns.some((campaign) => !campaign.title.trim() || !Number.isFinite(campaign.startAt) || !Number.isFinite(campaign.endAt) || campaign.endAt <= campaign.startAt || (campaign.entry === 'external' && campaign.launchMode !== 'external'))) return 'กรุณาตรวจสอบช่วงเวลาและรูปแบบ Campaign';
  if (config.campaignTicketPacks.some((pack) => !pack.id.trim() || !pack.label.trim() || !Number.isSafeInteger(pack.quantity) || pack.quantity < 1 || !Number.isSafeInteger(pack.cost) || pack.cost < 0)) return 'กรุณาตรวจสอบ Campaign Ticket packs';
  if (config.games.every((game) => game.published === false)) return 'ต้องเผยแพร่อย่างน้อย 1 เกม';
  if (!config.vipPlans.length || config.vipPlans.some((plan) => !plan.label.trim())) return 'กรุณาตั้งชื่อแพ็กเกจ VIP';
  if (config.roomLimit > 8) return 'จำนวนสมาชิกห้องต้องไม่เกิน 8';
  if (config.games.some((game) => { try { return !['https:', 'http:'].includes(new URL(game.url).protocol); } catch { return true; } })) return 'Game URL ไม่ถูกต้อง';
  for (const season of config.seasons) {
    if (!season.name.trim() || !season.starts || !season.ends || season.ends < season.starts) return 'กรุณาตรวจสอบชื่อและวันที่ Season';
    if (season.free.length !== season.premium.length) return 'Reward tracks ต้องมีจำนวน Tier เท่ากัน';
    for (const reward of [...season.free, ...season.premium]) {
      if (!reward.title.trim()) return 'กรุณาตั้งชื่อรางวัล';
      if (reward.type === 'points') return 'AIS Point ใช้ซื้อสินค้าเท่านั้น · เลือกรางวัล Energy หรือ Item';
      if (reward.type === 'avatar' || reward.type === 'pet') {
        if (!(reward.type === 'avatar' ? AVATARS : PETS).some((item) => item.id === reward.itemId)) return 'กรุณาเลือก Item ของรางวัล';
      } else if (['wing', 'frame', 'background', 'badge'].includes(reward.type)) {
        const valid = reward.type === 'wing' ? WINGS.some((item) => item.id === reward.itemId) : reward.type === 'frame' ? PROFILE_FRAMES.some((item) => item.id === reward.itemId) : reward.type === 'background' ? PROFILE_BACKGROUNDS.some((item) => item.id === reward.itemId) : reward.itemId === 'season-explorer';
        if (!valid) return 'Item ของรางวัลไม่ถูกต้อง';
      } else if (reward.type === 'gacha-box') {
        if (!Number.isSafeInteger(reward.amount) || (reward.amount ?? 0) < 1 || !['avatar', 'pet'].includes(reward.boxKind ?? '')) return 'กรุณาตรวจสอบชนิดและจำนวน Gacha Box';
      } else if (!Number.isSafeInteger(reward.amount) || (reward.amount ?? 0) < 1) return 'จำนวนรางวัลต้องมากกว่า 0';
    }
  }
  return null;
}
export function dayKey(player: PlayerState, at = demoNow(player)): string { return new Date(at).toLocaleDateString('en-CA'); }
export function currentPass(player: PlayerState, at = demoNow(player)) {
  return player.demo.passes[currentSeason(player, at).id] ?? { xp: 0, premium: false, claims: [] };
}
export function currentSeason(player: PlayerState, at = demoNow(player)) {
  const selected = player.demo.config.seasons.find((season) => season.id === player.demo.config.passSeasonId) ?? player.demo.config.seasons[0];
  if (player.demo.config.passAutomatic === false) return selected;
  const window = passWindow(at);
  const month = window.starts.slice(5, 7);
  const template = player.demo.config.seasons.find((season) => season.starts.slice(5, 7) === month) ?? selected;
  return { ...template, id: `${template.id}:${window.starts}`, name: `S${window.index + 1} · ${template.name}`, starts: window.starts, ends: window.ends };
}
export function settleExpiredPasses(player: PlayerState, at = demoNow(player)): PlayerState {
  if (player.demo.config.passAutomatic === false) return player;
  const active = currentSeason(player, at);
  let next = player;
  const settled = new Set(player.demo.settledPasses ?? []);
  for (const [seasonId, pass] of Object.entries(player.demo.passes)) {
    const starts = seasonId.slice(seasonId.lastIndexOf(':') + 1);
    const templateId = seasonId.slice(0, seasonId.lastIndexOf(':'));
    if (!player.demo.config.seasons.some((template) => template.id === templateId) || !/^\d{4}-\d{2}-\d{2}$/.test(starts) || starts >= active.starts || settled.has(seasonId)) continue;
    const rewards: string[] = [];
    for (const track of ['free', ...(pass.premium ? ['premium'] : [])] as ('free' | 'premium')[]) {
      const tiers = player.demo.config.seasons.find((item) => item.id === templateId)?.[track] ?? [];
      for (let index = 0; index < tiers.length; index += 1) {
        const claimId = `${track}-${index}`;
        if (pass.xp < (index + 1) * PASS_RULES.xpPerLevel || pass.claims.includes(claimId)) continue;
        next = grantReward(next, tiers[index]);
        rewards.push(tiers[index].title);
      }
    }
    settled.add(seasonId);
    const detail = rewards.length ? `Auto-delivered: ${rewards.join(' · ')}` : 'ไม่มีรางวัลที่มีสิทธิ์ค้างรับ';
    const notification = { id: `pass:${seasonId}`, title: `สรุปผล Battle Pass · ${seasonId}`, detail, viewed: false, at };
    next = { ...next, demo: { ...next.demo, notifications: [notification, ...(next.demo.notifications ?? []).filter((item) => item.id !== notification.id)], history: [{ id: notification.id, kind: 'reward' as const, title: notification.title, detail, at }, ...(next.demo.history ?? [])].slice(0, 250) } };
  }
  return settled.size === (player.demo.settledPasses ?? []).length ? player : { ...next, demo: { ...next.demo, settledPasses: [...settled] } };
}
export function seedDemoScenario(player: PlayerState, scenario: DemoScenario): PlayerState {
  const now = demoNow(player);
  const season = currentSeason(player, now);
  const pass = currentPass(player, now);
  if (scenario === 'energy-overflow') return { ...player, energy: 34, energyUpdatedAt: now };
  if (scenario === 'vip-renewal') return { ...player, energy: 14, vipExpiresAt: now + 2 * 86_400_000 };
  if (scenario === 'premium-retro') return { ...player, vipExpiresAt: null, demo: { ...player.demo, passes: { ...player.demo.passes, [season.id]: { xp: 1000, premium: false, claims: [] } } } };
  if (scenario === 'vip-no-premium') return { ...player, vipExpiresAt: now + 2 * 86_400_000, demo: { ...player.demo, passes: { ...player.demo.passes, [season.id]: { ...pass, premium: false } } } };
  if (scenario === 'ranking-tie') return { ...player, demo: { ...player.demo, scores: { ...player.demo.scores, bird: 15_320 }, scoreTimes: { ...player.demo.scoreTimes, bird: Date.UTC(2026, 0, 2) } } };
  if (scenario === 'campaign-ranking' || scenario === 'campaign-settlement') {
    const settledCampaigns = (player.demo.settledCampaigns ?? []).filter((id) => id !== 'lantern-festival');
    const closedCampaigns = (player.demo.closedCampaigns ?? []).filter((id) => id !== 'lantern-festival');
    const campaigns = player.demo.config.campaigns.map((campaign) => campaign.id === 'lantern-festival' && scenario === 'campaign-settlement' ? { ...campaign, startAt: Math.min(campaign.startAt, now - 86_400_000), endAt: now - 1 } : campaign);
    return { ...player, energy: 15, demo: { ...player.demo, config: { ...player.demo.config, campaigns }, campaignScores: { ...player.demo.campaignScores, 'lantern-festival': { bird: { score: 20_000, achievedAt: now - 60_000 }, memory: { score: 22, achievedAt: now - 30_000 } } }, settledCampaigns, closedCampaigns } };
  }
  if (scenario === 'pass-rollover') {
    const next = { ...player, demo: { ...player.demo, clockOffset: player.demo.clockOffset + Date.parse(`${season.ends}T00:00:00Z`) - now + 1_000, passes: { ...player.demo.passes, [season.id]: { xp: 300, premium: false, claims: [] } }, settledPasses: (player.demo.settledPasses ?? []).filter((id) => id !== season.id) } };
    return settleExpiredPasses(next, demoNow(next));
  }
  return { ...player, demo: { ...player.demo, gachaBoxes: { avatar: 1, pet: 1 } } };
}
export function hasPassAccess(player: PlayerState, at = demoNow(player)): boolean {
  return currentPass(player, at).premium;
}
export function gameMission(player: PlayerState, gameId: GameId) {
  const prefix = `game:${gameId}:`;
  let stage = 0;
  while (player.demo.missionClaims.includes(`${prefix}${stage}`)) stage += 1;
  const targets = [1, 5, 10, 20, 50];
  const legacyPoints = 10 + Math.min(stage, 10) * 5;
  return { id: `${prefix}${stage}`, stage, target: targets[stage] ?? 50 + (stage - 4) * 50, count: player.demo.playCounts[gameId] ?? 0, xp: Math.min(100, 20 + stage * 10), energy: Math.max(1, Math.ceil(legacyPoints / 25)) };
}
export function dailyPassMission(player: PlayerState, at = demoNow(player)) {
  const season = currentSeason(player, at);
  const today = dayKey(player, at);
  return { id: `${season.id}-${today}`, count: player.demo.missionCounts[`${season.id}:${today}`] ?? 0, target: player.demo.config.missionTarget, xp: player.demo.config.missionXp };
}
export function weeklyPassMission(player: PlayerState, at = demoNow(player)) {
  const season = currentSeason(player, at);
  const startsAt = Date.parse(`${season.starts}T00:00:00Z`);
  const week = Math.max(0, Math.floor((at - startsAt) / (7 * 86_400_000)));
  const id = `weekly:${season.id}:${week}`;
  const games = player.demo.weeklyGames?.[id] ?? [];
  return { id, games, target: Math.min(PASS_RULES.weeklyGames, player.demo.config.games.filter((game) => game.published !== false).length), xp: PASS_RULES.weeklyXp, endsAt: Math.min(startsAt + (week + 1) * 7 * 86_400_000, Date.parse(`${season.ends}T00:00:00Z`)) };
}
export function awardPassXp(player: PlayerState, amount: number): PlayerState {
  if (!Number.isSafeInteger(amount) || amount <= 0) return player;
  const id = currentSeason(player).id;
  const pass = currentPass(player);
  return { ...player, demo: { ...player.demo, passes: { ...player.demo.passes, [id]: { ...pass, xp: Math.min(PASS_RULES.levels * PASS_RULES.xpPerLevel, pass.xp + amount) } } } };
}
export function processAchievementEvent(player: PlayerState, event: AchievementEvent, at = demoNow(player)): PlayerState {
  const result = evaluateAchievementEvent(player, event, at);
  return result.unlocked.reduce((next, achievement) => achievement.reward ? grantReward(next, achievement.reward) : next, result.player);
}
export function claimWeeklyMission(player: PlayerState): PlayerState | null {
  const mission = weeklyPassMission(player);
  if (mission.games.length < mission.target || player.demo.missionClaims.includes(mission.id)) return null;
  return awardPassXp({ ...player, demo: { ...player.demo, missionClaims: [...player.demo.missionClaims, mission.id] } }, mission.xp);
}
export function nextPassBonus(_player: PlayerState, _at = demoNow(_player)): null {
  return null;
}
export function claimPassBonus(player: PlayerState): PlayerState | null {
  void player;
  return null;
}
export function ledger(previous: PlayerState, next: PlayerState, label: string): PlayerState {
  const mp = next.masquePoints - previous.masquePoints;
  const ais = next.aisPoints - previous.aisPoints;
  const energy = next.energy - previous.energy;
  if (!mp && !ais && !energy) return next;
  const at = demoNow(next);
  const transaction = { id: crypto.randomUUID(), at, label, mp, ais, energy };
  const kind: 'purchase' | 'reward' = label.includes('ซื้อ') || label.includes('เติม') || label.includes('VIP') || label.includes('คูปอง') ? 'purchase' : 'reward';
  const history = { id: transaction.id, kind, title: label, detail: [ais ? `${ais > 0 ? '+' : ''}${ais} AIS Point` : '', energy ? `${energy > 0 ? '+' : ''}${energy} Energy` : ''].filter(Boolean).join(' · '), at };
  return { ...next, demo: { ...next.demo, transactions: [transaction, ...next.demo.transactions].slice(0, 150), history: [history, ...(next.demo.history ?? [])].slice(0, 250) } };
}
export function ownsPassReward(player: PlayerState, reward: DemoReward): boolean {
  if (!reward.itemId) return false;
  switch (reward.type) {
    case 'avatar': return player.ownedAvatarIds.includes(reward.itemId);
    case 'pet': return player.ownedPetIds.includes(reward.itemId);
    case 'wing': return player.demo.wings.includes(reward.itemId);
    case 'frame': return player.demo.frames.includes(reward.itemId);
    case 'background': return (player.demo.backgrounds ?? PROFILE_BACKGROUNDS.map((item) => item.id)).includes(reward.itemId);
    case 'badge': return player.demo.achievements.some((badge) => badge.id === `pass:${currentSeason(player).id}:explorer`);
    default: return false;
  }
}
export function grantReward(player: PlayerState, reward: DemoReward): PlayerState {
  if (reward.type === 'points') {
    const amount = Math.max(1, Math.ceil((reward.amount ?? 0) / 25));
    return grantReward(player, { title: `Energy +${amount}`, type: 'energy', amount });
  }
  if (ownsPassReward(player, reward)) {
    const at = demoNow(player);
    const duplicateEnergy = player.demo.config.duplicateEnergy;
    const next = { ...player, energy: player.energy + duplicateEnergy };
    return { ...next, demo: { ...next.demo, history: [{ id: crypto.randomUUID(), kind: 'reward' as const, title: reward.title, detail: `ซ้ำ · Energy +${duplicateEnergy}`, at }, ...(next.demo.history ?? [])].slice(0, 250) } };
  }
  const next = { ...player };
  if (reward.type === 'energy') next.energy += reward.amount ?? 0;
  if (reward.type === 'ticket' || reward.type === 'arena-ticket') {
    const amount = reward.amount ?? 1;
    next.demo = { ...next.demo, gachaBoxes: { ...next.demo.gachaBoxes, pet: (next.demo.gachaBoxes?.pet ?? 0) + amount } };
  }
  if (reward.type === 'gacha-box') {
    const kind = reward.boxKind ?? 'pet';
    next.demo = { ...next.demo, gachaBoxes: { ...next.demo.gachaBoxes, [kind]: (next.demo.gachaBoxes?.[kind] ?? 0) + (reward.amount ?? 1) } };
  }
  if (reward.type === 'wing' && WINGS.some((item) => item.id === reward.itemId)) next.demo = { ...next.demo, wings: [...new Set([...next.demo.wings, reward.itemId!])] };
  if (reward.type === 'frame' && PROFILE_FRAMES.some((item) => item.id === reward.itemId)) next.demo = { ...next.demo, frames: [...new Set([...next.demo.frames, reward.itemId!])] };
  if (reward.type === 'background' && PROFILE_BACKGROUNDS.some((item) => item.id === reward.itemId)) next.demo = { ...next.demo, backgrounds: [...new Set([...(next.demo.backgrounds ?? ['canal-day']), reward.itemId!])] };
  if (reward.type === 'badge' && reward.itemId === 'season-explorer') {
    const season = currentSeason(player);
    const id = `pass:${season.id}:explorer`;
    if (!next.demo.achievements.some((badge) => badge.id === id)) next.demo = { ...next.demo, achievements: [...next.demo.achievements, { id, title: `${season.name} Explorer`, earnedAt: demoNow(player), seasonId: season.id }] };
  }
  if (reward.type === 'avatar' && AVATARS.some((item) => item.id === reward.itemId) && !next.ownedAvatarIds.includes(reward.itemId!)) next.ownedAvatarIds = [...next.ownedAvatarIds, reward.itemId!];
  if (reward.type === 'pet' && PETS.some((item) => item.id === reward.itemId) && !next.ownedPetIds.includes(reward.itemId!)) next.ownedPetIds = [...next.ownedPetIds, reward.itemId!];
  const at = demoNow(player);
  return { ...next, demo: { ...next.demo, history: [{ id: crypto.randomUUID(), kind: 'reward' as const, title: reward.title, detail: 'รับรางวัลจำลอง', at }, ...(next.demo.history ?? [])].slice(0, 250) } };
}
export function beginGame(player: PlayerState, gameId: GameId, mode: GameMode = 'casual'): PlayerState | null {
  if (!player.demo.config.games.some((game) => game.id === gameId && game.published !== false)) return null;
  if (mode === 'ranked' && (!player.demo.config.battleEnabled || player.demo.arenaTickets < 1)) return null;
  const next = mode === 'ranked' ? { ...player, demo: { ...player.demo, arenaTickets: player.demo.arenaTickets - 1 } } : spendGameEnergy(player, demoNow(player));
  if (!next) return null;
  const session = { id: crypto.randomUUID(), gameId, mode, startedAt: demoNow(player), finished: false, reward: { points: 0, xp: mode === 'ranked' ? 80 : 40 } };
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
  const isCampaign = session.mode === 'campaign' && Boolean(session.campaignId);
  const at = demoNow(player);
  const campaign = isCampaign ? player.demo.config.campaigns.find((item) => item.id === session.campaignId) : undefined;
  const campaignAcceptsScore = !!campaign && at >= campaign.startAt && at < campaign.endAt && !player.demo.closedCampaigns?.includes(campaign.id);
  const previousBest = player.demo.scores[session.gameId] ?? 0;
  const improvesBest = score > previousBest;
  const campaignBest = isCampaign ? player.demo.campaignScores?.[session.campaignId!]?.[session.gameId] : undefined;
  const improvesCampaign = isCampaign && campaignAcceptsScore && (!campaignBest || score > campaignBest.score);
  const reward = session.reward ?? { points: 0, xp: 40 };
  const profileXp = player.demo.profileXp + reward.xp;
  const playCounts = { ...player.demo.playCounts, [session.gameId]: (player.demo.playCounts[session.gameId] ?? 0) + 1 };
  const today = dayKey(player);
  const passId = currentSeason(player).id;
  const week = weeklyPassMission(player);
  const gameHistory = { id: crypto.randomUUID(), kind: 'game' as const, title: GAMES.find((game) => game.id === session.gameId)?.name ?? session.gameId, detail: `${session.mode === 'campaign' ? 'Campaign' : 'Normal'} · ${score.toLocaleString()} คะแนน`, at, gameId: session.gameId };
  const finished: PlayerState = { ...player, level: 18 + Math.floor(profileXp / 100), demo: { ...player.demo, profileXp, playCounts,
    sessions: player.demo.sessions.map((entry) => entry.id === sessionId ? { ...entry, finished: true, score } : entry),
    scores: isCampaign || !improvesBest ? player.demo.scores : { ...player.demo.scores, [session.gameId]: score },
    scoreTimes: !isCampaign && improvesBest ? { ...player.demo.scoreTimes, [session.gameId]: at } : player.demo.scoreTimes,
    campaignScores: improvesCampaign ? { ...player.demo.campaignScores, [session.campaignId!]: { ...player.demo.campaignScores?.[session.campaignId!], [session.gameId]: { score, achievedAt: at } } } : player.demo.campaignScores,
    seasonScores: isCampaign ? player.demo.seasonScores : { ...player.demo.seasonScores, [seasonId]: { ...seasonScores, [session.gameId]: Math.max(score, seasonScores[session.gameId] ?? 0) } },
    history: [gameHistory, ...(player.demo.history ?? [])].slice(0, 250),
    missionCounts: { ...player.demo.missionCounts, [today]: (player.demo.missionCounts[today] ?? 0) + 1, [`${passId}:${today}`]: (player.demo.missionCounts[`${passId}:${today}`] ?? 0) + 1 },
    weeklyGames: { ...player.demo.weeklyGames, [week.id]: [...new Set([...week.games, session.gameId])] },
  } };
  let next = processAchievementEvent(finished, { type: 'game_completed', gameId: session.gameId }, at);
  if (!isCampaign && improvesBest) next = processAchievementEvent(next, { type: 'game_score_updated', gameId: session.gameId, score }, at);
  return progressMissions(next, 'game', at);
}
export function buyPremium(player: PlayerState): PlayerState | null {
  if (hasPassAccess(player) || player.aisPoints < player.demo.config.premiumPrice) return null;
  const season = currentSeason(player);
  const pass = currentPass(player);
  return { ...player, aisPoints: player.aisPoints - player.demo.config.premiumPrice, demo: { ...player.demo, passes: { ...player.demo.passes, [season.id]: { ...pass, premium: true } } } };
}
export function claimPass(player: PlayerState, track: 'free' | 'premium', index: number): PlayerState | null {
  const pass = currentPass(player);
  const reward = currentSeason(player)[track][index];
  const claimId = `${track}-${index}`;
  if (!Number.isSafeInteger(index) || !reward || pass.xp < (index + 1) * PASS_RULES.xpPerLevel || pass.claims.includes(claimId) || (track === 'premium' && !pass.premium)) return null;
  const next = grantReward(player, reward);
  return { ...next, demo: { ...next.demo, passes: { ...next.demo.passes, [currentSeason(player).id]: { ...pass, claims: [...pass.claims, claimId] } } } };
}
export function claimMission(player: PlayerState, gameId?: GameId): PlayerState | null {
  if (gameId) {
    if (!player.demo.config.games.some((game) => game.id === gameId && game.published !== false)) return null;
    const mission = gameMission(player, gameId);
    if (mission.count < mission.target) return null;
    return awardPassXp({ ...player, energy: player.energy + mission.energy, demo: { ...player.demo, missionClaims: [...player.demo.missionClaims, mission.id] } }, mission.xp);
  }
  const mission = dailyPassMission(player);
  if (mission.count < mission.target || player.demo.missionClaims.includes(mission.id)) return null;
  return awardPassXp({ ...player, demo: { ...player.demo, missionClaims: [...player.demo.missionClaims, mission.id] } }, mission.xp);
}
export function startBattle(player: PlayerState, gameId: GameId): PlayerState | null {
  return beginGame(player, gameId, 'ranked');
}
export function claimBattle(player: PlayerState, id: string): PlayerState | null {
  const battle = player.demo.battles.find((entry) => entry.id === id);
  if (!battle || battle.claimed) return null;
  return { ...player, energy: player.energy + battle.prize, demo: { ...player.demo, battles: player.demo.battles.map((entry) => entry.id === id ? { ...entry, claimed: true } : entry) } };
}
export function claimRankingReward(player: PlayerState, gameId: GameId): PlayerState | null {
  const id = `${player.demo.config.rankingSeasonId}:${gameId}`;
  const score = player.demo.seasonScores[player.demo.config.rankingSeasonId]?.[gameId] ?? 0;
  const rank = getGameRanking(gameId, 'allTime', player, score).findIndex((entry) => entry.isCurrentPlayer);
  if (!score || rank > 2 || player.demo.rankingClaims.includes(id)) return null;
  const badge = { id: `top:${id}`, title: `Top ${rank + 1}`, earnedAt: demoNow(player), seasonId: player.demo.config.rankingSeasonId, gameId };
  return { ...player, energy: player.energy + player.demo.config.rankingEnergyPrize, demo: { ...player.demo, rankingClaims: [...player.demo.rankingClaims, id], achievements: [...player.demo.achievements, badge] } };
}
export function buyDecor(player: PlayerState, kind: string): PlayerState | null {
  if (!['sofa', 'plant', 'lamp', 'music'].includes(kind) || player.demo.ownedDecor.includes(kind) || player.aisPoints < player.demo.config.decorPrice) return null;
  return { ...player, aisPoints: player.aisPoints - player.demo.config.decorPrice, demo: { ...player.demo, ownedDecor: [...player.demo.ownedDecor, kind] } };
}
export function claimAvailablePass(player: PlayerState): PlayerState | null {
  let next = player;
  for (const track of ['free', 'premium'] as const) {
    for (let index = 0; index < currentSeason(player)[track].length; index += 1) next = claimPass(next, track, index) ?? next;
  }
  return next === player ? null : next;
}
