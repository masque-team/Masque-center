import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { customizeProfile, loadPlayer, parseAisPointSeed, savePlayer } from './playerService';
import { energyCapacity, nextRefillIn, refreshEnergy, refillEnergy, spendContinueEnergy, spendGameEnergy } from './energyService';
import { awardPassXp, beginGame, buyDecor, buyPremium, claimMission, claimPass, claimPassBonus, claimRankingReward, claimWeeklyMission, currentPass, currentSeason, dayKey, finishGame, gameMission, hasPassAccess, ledger, nextPassBonus, recordPlayTime, startBattle, validateConfig, weeklyPassMission } from './demoService';
import { drawPet } from './petService';
import { buyGachaCoupons, drawGachaBatch, getGachaOdds } from './gachaService';
import { buyArenaTickets, buyPointPack, pointPackReward, equipWings, exchangeAisPoints, purchaseShopItem } from './walletService';
import { getGameRanking } from './rankingService';
import { passBenefitMilestones, purchaseVip, vipOffer } from './passService';
import { equipOutfit } from './avatarService';
import { claimBattlePassReward } from './rewardService';
import { passProgress, passTrack, passWindow } from './battlePassService';
import { claimAvailablePass, grantReward } from './demoService';
import type { PlayerState } from '../types';

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) });
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-26T10:00:00Z'));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const sample = () => loadPlayer('Demo', 100, true);
function finishedSample(): PlayerState {
  const player = sample();
  player.demo.sessions = [{ id: 'session-1', gameId: 'bird', startedAt: Date.now(), finished: false }];
  return finishGame(player, 'session-1', 20000)!;
}

describe('shared demo economy', () => {
  it('offers normal and LV30 Pass packages without resetting earned XP or claims', () => {
    const player = { ...sample(), masquePoints: 5000 };
    const normal = purchaseVip(player, 'monthly')!;
    expect(currentPass(normal).xp).toBe(100);
    expect(normal.energy).toBe(player.energy);
    expect(normal.masquePoints).toBe(4010);
    const boostTwenty = purchaseVip(player, 'monthly-boost-20')!;
    expect(currentPass(boostTwenty).xp).toBe(2000);
    expect(boostTwenty.masquePoints).toBe(3510);
    const boost = purchaseVip(player, 'monthly-boost-30')!;
    expect(currentPass(boost).xp).toBe(3000);
    expect(currentPass(boost).claims).toEqual([]);
    expect(boost.masquePoints).toBe(3010);
    expect(boost.energy).toBe(player.energy);
    expect(boost.level).toBe(player.level);
    expect(purchaseVip(boost, 'monthly-boost-30')).toBeNull();
    const high = awardPassXp(player, 4000);
    expect(purchaseVip(high, 'monthly-boost-30')).toBeNull();
    expect(currentPass(purchaseVip(high, 'monthly')!).xp).toBe(4000);
  });
  it('blocks early VIP renewal and boost purchases while an active Pass is running', () => {
    let player = awardPassXp({ ...sample(), masquePoints: 5000 }, 1700);
    player = purchaseVip(player, 'monthly')!;
    player = claimPass(player, 'premium', 0)!;
    const offer = vipOffer(player, 'monthly')!;
    expect(offer.active).toBe(true);
    expect(offer.levelAfter).toBe(17);
    expect(offer.eligible).toBe(false);
    expect(purchaseVip(player, 'monthly')).toBeNull();
    expect(purchaseVip(player, 'monthly-boost-20')).toBeNull();
    expect(purchaseVip(player, 'monthly-boost-30')).toBeNull();
    expect(player.vipExpiresAt).toBeGreaterThan(Date.now());
    expect(currentPass(player).claims).toEqual(['premium-0']);
  });
  it('calculates advertised Energy and rewards from the actual configured VIP track', () => {
    const player = sample();
    const milestone = passBenefitMilestones(player).find((item) => item.level === 30)!;
    const expected = currentSeason(player).premium.slice(0, 30).filter((reward) => reward.type === 'energy').reduce((sum, reward) => sum + (reward.amount ?? 0), 0);
    expect(milestone.vipEnergy).toBe(expected);
    expect(milestone.freeEnergy).toBeGreaterThan(0);
    expect(vipOffer(player, 'unknown')).toBeNull();
  });
  it('atomically equips owned outfit items without charging currency or changing inventory', () => {
    const player = sample(); player.demo.wings = ['sky-feather'];
    const next = equipOutfit(player, { avatarId: 'mali', petId: 'cloud', wingId: 'sky-feather' })!;
    expect(next.petId).toBe('cloud'); expect(next.demo.wingId).toBe('sky-feather');
    expect(next.masquePoints).toBe(player.masquePoints); expect(next.energy).toBe(player.energy);
    expect(next.ownedPetIds).toEqual(player.ownedPetIds);
    expect(player.petId).toBe('pudding'); expect(player.demo.wingId).toBeNull();
  });
  it('rejects unowned or nonexistent outfit pieces without partially applying other selections', () => {
    const player = sample();
    expect(equipOutfit(player, { avatarId: 'mali', petId: 'cloud', wingId: 'sky-feather' })).toBeNull();
    expect(equipOutfit(player, { avatarId: 'nyx', petId: null, wingId: null })).toBeNull();
    expect(equipOutfit({ ...player, ownedPetIds: ['missing'] }, { avatarId: 'mali', petId: 'missing', wingId: null })).toBeNull();
    expect(player.petId).toBe('pudding');
    expect(equipOutfit(player, { avatarId: 'mali', petId: null, wingId: null })?.petId).toBeNull();
  });
  it('supports name and AIS test query inputs without persisting the login name', () => {
    expect(parseAisPointSeed('125')).toBe(125);
    expect(parseAisPointSeed('-1')).toBeNull();
    expect(loadPlayer('Fresh Player', null, true).aisPoints).toBe(1000);
    const player = loadPlayer('Demo One', 125, true);
    expect(player.displayName).toBe('Demo One');
    expect(player.aisPoints).toBe(125);
    expect(JSON.parse(localStorage.getItem('masquegame_center_v2')!).displayName).toBe('Guest Player');
    expect(loadPlayer(null).displayName).toBe('Guest Player');
    expect(loadPlayer('Demo Two').displayName).toBe('Demo Two');
  });
  it('adds new Avatar shop variants to saved players without changing their AIS balance', () => {
    const saved = loadPlayer('Returning Player', 432, true);
    saved.demo.config.shop = saved.demo.config.shop.filter((item) => !['avatar-nami', 'avatar-mali-festival', 'avatar-mali-ranked'].includes(item.id));
    savePlayer(saved);
    const migrated = loadPlayer('Returning Player');
    expect(migrated.aisPoints).toBe(432);
    expect(migrated.demo.config.shop.filter((item) => item.id.startsWith('avatar-mali-') || item.id === 'avatar-nami').map((item) => item.id).sort()).toEqual(['avatar-mali-festival', 'avatar-mali-ranked', 'avatar-nami']);
  });
  it('unlocks supplied profile backgrounds for existing players without resetting their selection or balances', () => {
    const saved = sample();
    saved.demo.backgrounds = ['canal-day'];
    saved.demo.profile.backgroundId = 'canal-day';
    savePlayer(saved);
    const migrated = loadPlayer('Returning Player');
    expect(migrated.demo.backgrounds).toEqual(['canal-day', 'cloud-club', 'atelier-dusk']);
    expect(migrated.demo.profile.backgroundId).toBe('canal-day');
    expect(migrated.aisPoints).toBe(saved.aisPoints);
    expect(migrated.masquePoints).toBe(saved.masquePoints);
  });
  it('moves the legacy Bird feature to Memory without overriding a custom featured game', () => {
    const legacy = sample();
    legacy.demo.config.games = legacy.demo.config.games.map((game) => ({ ...game, featured: game.id === 'bird', editorialTag: game.id === 'bird' ? 'hot' : game.editorialTag }));
    savePlayer(legacy);
    const migrated = loadPlayer(null);
    expect(migrated.demo.config.games.find((game) => game.id === 'memory')).toMatchObject({ featured: true, editorialTag: 'hot' });
    expect(migrated.demo.config.games.find((game) => game.id === 'bird')).toMatchObject({ featured: false, editorialTag: 'new' });

    const custom = sample();
    custom.demo.config.games = custom.demo.config.games.map((game) => ({ ...game, featured: game.id === 'mole' }));
    savePlayer(custom);
    const preserved = loadPlayer(null);
    expect(preserved.demo.config.games.find((game) => game.id === 'mole')?.featured).toBe(true);
    expect(preserved.demo.config.games.find((game) => game.id === 'memory')?.featured).toBe(false);
  });
  it('allows purchased overflow and pauses free regeneration above cap', () => {
    const next = refillEnergy(sample(), 8, 70)!;
    expect(next.energy).toBe(20);
    expect(next.masquePoints).toBe(250);
    expect(refreshEnergy(next, Date.now() + 3_600_000).energy).toBe(20);
    expect(nextRefillIn(next)).toBe(0);
    expect(claimBattlePassReward({ ...next, energy: 20 }, 'free', 0)?.energy).toBe(22);
  });
  it('regenerates one unit per configured interval without exceeding the free cap', () => {
    const player = sample(); player.energy = 8;
    expect(refreshEnergy(player, Date.now() + 3_600_000).energy).toBe(10);
    expect(refreshEnergy(player, Date.now() + 20_000_000).energy).toBe(12);
  });
  it('rejects insufficient balance and invalid exchange amounts', () => {
    expect(refillEnergy(sample(), 8, 9999)).toBeNull();
    expect(exchangeAisPoints(sample(), 1.5)).toBeNull();
    expect(exchangeAisPoints(sample(), -1)).toBeNull();
  });
  it('honors edited exchange rates and records exact wallet deltas', () => {
    const player = sample(); player.demo.config.exchangeRate = 25;
    const next = ledger(player, exchangeAisPoints(player, 2)!, 'exchange');
    expect(next.masquePoints).toBe(370);
    expect(next.aisPoints).toBe(98);
    expect(next.demo.transactions[0]).toMatchObject({ mp: 50, ais: -2 });
  });
  it('grants ownership without auto-equipping and prevents repeat purchases', () => {
    const next = purchaseShopItem(sample(), 'avatar-flora')!;
    expect(next.ownedAvatarIds).toContain('flora');
    expect(next.avatarId).toBe('mali');
    expect(purchaseShopItem(next, 'avatar-flora')).toBeNull();
  });
  it('honors weighted gacha, ticket priority and duplicate compensation', () => {
    const player = sample(); player.petId = null; player.gachaTickets = 1; player.demo.config.gachaPool = [{ petId: 'pudding', weight: 1 }];
    const result = drawPet(player, () => 0)!;
    expect(result.duplicate).toBe(true);
    expect(result.player.gachaTickets).toBe(0);
    expect(result.player.masquePoints).toBe(350);
    expect(result.player.petId).toBeNull();
  });
  it('requires Gacha coupons and grants the 10+1 draw without charging the bonus coupon', () => {
    const player = sample(); player.masquePoints = 2000; player.gachaTickets = 0;
    expect(drawGachaBatch(player, 'pet', 1, () => 0)).toBeNull();
    const coupons = buyGachaCoupons(player, 10)!;
    expect(coupons.gachaTickets).toBe(10);
    expect(coupons.masquePoints).toBe(1100);
    const batch = drawGachaBatch(coupons, 'pet', 10, () => 0)!;
    expect(batch.results).toHaveLength(11);
    expect(batch.paidCoupons).toBe(10);
    expect(batch.bonusDraws).toBe(1);
    expect(batch.player.gachaTickets).toBe(0);
    expect(getGachaOdds(player, 'pet').some((item) => item.kind === 'energy' && item.rate > 0)).toBe(true);
    expect(getGachaOdds(player, 'avatar').some((item) => item.kind === 'avatar' && item.featured)).toBe(true);
  });
  it('can award Energy instead of an Avatar/Pet from either Gacha cabinet', () => {
    const player = sample(); player.energy = 0; player.gachaTickets = 1;
    for (const kind of ['pet', 'avatar'] as const) {
      const batch = drawGachaBatch({ ...player, gachaTickets: 1 }, kind, 1, () => 0.999999)!;
      expect(batch.results[0]).toMatchObject({ kind: 'energy', amount: 1 });
      expect(batch.player.energy).toBe(1);
      expect(batch.player.gachaTickets).toBe(0);
    }
  });
  it('expires VIP without affecting free/vip ranking fairness', () => {
    const next = purchaseVip({ ...sample(), masquePoints: 2000 }, 'monthly')!;
    expect(spendGameEnergy(next)!.energy).toBe(12);
    expect(spendGameEnergy(next, next.vipExpiresAt! + 1)!.energy).toBe(17);
    expect(getGameRanking('bird', 'allTime', next, 0)).toEqual(getGameRanking('bird', 'allTime', { ...next, vipExpiresAt: null }, 0));
  });
  it('stores and regenerates numeric Energy for VIP while waiving only game admission', () => {
    const player = sample(); player.vipExpiresAt = Date.now() + 86_400_000; player.energy = 0;
    expect(energyCapacity(player)).toBe(18);
    expect(nextRefillIn(player)).toBe(1_800_000);
    expect(spendGameEnergy(player)?.energy).toBe(0);
    expect(spendContinueEnergy(player)).toBeNull();
    const recovered = refreshEnergy(player, Date.now() + 3_600_000);
    expect(recovered.energy).toBe(2);
    expect(spendContinueEnergy(recovered, Date.now() + 3_600_000)?.energy).toBe(1);
    expect(spendContinueEnergy({ ...recovered, vipExpiresAt: null }, Date.now() + 3_600_000)?.energy).toBe(1);
  });
  it('preserves VIP-earned overflow at expiry and partial regeneration across the boundary', () => {
    const player = sample(); player.energy = 12; player.vipExpiresAt = Date.now() + 45 * 60_000;
    expect(refreshEnergy(player, Date.now() + 60 * 60_000).energy).toBe(13);
    const partial = { ...player, energy: 0, vipExpiresAt: Date.now() + 20 * 60_000 };
    expect(refreshEnergy(partial, Date.now() + 30 * 60_000).energy).toBe(1);
    const overflow = { ...player, energy: 20 };
    expect(refreshEnergy(overflow, Date.now() + 3_600_000).energy).toBe(20);
  });
  it('does not bank full-cap refill time before VIP purchase and blocks active renewal', () => {
    const player = sample(); player.masquePoints = 2000; player.energyUpdatedAt = Date.now() - 3_600_000;
    const vip = purchaseVip(player, 'monthly')!;
    expect(vip.energy).toBe(12);
    expect(vip.energyUpdatedAt).toBe(Date.now());
    expect(refreshEnergy(vip).energy).toBe(12);
    const partial = { ...vip, masquePoints: 2000, energy: 3, energyUpdatedAt: Date.now() - 20 * 60_000 };
    expect(purchaseVip(partial, 'monthly')).toBeNull();
    expect(partial.energyUpdatedAt).toBe(Date.now() - 20 * 60_000);
  });
  it('migrates the old unlimited-VIP refill clock without losing Energy or VIP days', () => {
    const player = sample(); player.vipExpiresAt = Date.now() + 86_400_000; player.energy = 14; player.energyUpdatedAt = player.vipExpiresAt;
    const { vipFreeEntry, vipEnergyBonus, continueEnergyCost, ...legacyConfig } = player.demo.config;
    localStorage.setItem('masquegame_center_v2', JSON.stringify({ ...player, demo: { ...player.demo, config: { ...legacyConfig, vipUnlimited: true } } }));
    const restored = loadPlayer(null);
    expect(restored.energy).toBe(14);
    expect(restored.vipExpiresAt).toBe(player.vipExpiresAt);
    expect(restored.energyUpdatedAt).toBe(Date.now());
    expect(restored.demo.config.vipFreeEntry).toBe(true);
    expect(restored.demo.config.vipEnergyBonus).toBe(6);
    expect(refreshEnergy(restored, Date.now() + 30 * 60_000).energy).toBe(15);
  });
  it('starts new demos with an owned follower and buys, equips and removes wings', () => {
    const player = sample();
    expect(player.petId).toBe('pudding');
    expect(player.ownedPetIds).toContain(player.petId);
    expect(equipWings(player, 'sky-feather')).toBeNull();
    const purchased = purchaseShopItem(player, 'wing-sky-feather')!;
    expect(purchased.masquePoints).toBe(180);
    expect(purchased.demo.wings).toEqual(['sky-feather']);
    expect(purchased.demo.wingId).toBeNull();
    expect(purchased.demo.frames).toEqual([]);
    expect(purchaseShopItem(purchased, 'wing-sky-feather')).toBeNull();
    const equipped = equipWings(purchased, 'sky-feather')!;
    savePlayer(equipped);
    expect(loadPlayer(null).demo.wingId).toBe('sky-feather');
    expect(equipWings(equipped, null)!.demo.wingId).toBeNull();
    expect(purchaseShopItem({ ...player, masquePoints: 0 }, 'wing-sky-feather')).toBeNull();
  });
  it('migrates old saves without wings while preserving the unequipped pet and economy', () => {
    const player = sample();
    const { wings, wingId, pointPackClaims, ...legacyDemo } = player.demo;
    localStorage.setItem('masquegame_center_v2', JSON.stringify({ ...player, petId: null, demo: { ...legacyDemo, config: { ...player.demo.config, shop: player.demo.config.shop.filter((item) => item.kind !== 'wing') } } }));
    const restored = loadPlayer(null);
    expect(restored.demo.wings).toEqual([]);
    expect(restored.demo.pointPackClaims).toEqual([]);
    expect(restored.demo.wingId).toBeNull();
    expect(restored.demo.config.shop.filter((item) => item.kind === 'wing')).toHaveLength(2);
    expect(restored.petId).toBeNull();
    expect(restored.masquePoints).toBe(player.masquePoints);
  });
});
describe('progression and duplicate protection', () => {
  it('claims unlocked tiers in one action and converts owned cosmetic rewards to compensation', () => {
    let player = awardPassXp({ ...sample(), masquePoints: 2000 }, 1000);
    player = purchaseVip(player, 'monthly')!;
    const claimed = claimAvailablePass(player)!;
    expect(currentPass(claimed).claims).toHaveLength(20);
    expect(claimAvailablePass(claimed)).toBeNull();
    const duplicate = grantReward(player, { title: 'Pudding', type: 'pet', itemId: 'pudding' });
    expect(duplicate.masquePoints).toBe(player.masquePoints + player.demo.config.duplicatePoints);
    expect(duplicate.ownedPetIds).toEqual(player.ownedPetIds);
  });
  it('rolls over only season progress while retaining VIP time, profile and previous claims', () => {
    vi.setSystemTime(new Date('2026-10-28T10:00:00Z'));
    let player = sample(); player.masquePoints = 2000;
    const window = passWindow(Date.now());
    vi.setSystemTime(window.endsAt - 2 * 86_400_000);
    player = purchaseVip(player, 'monthly')!;
    player = awardPassXp(player, 200);
    const oldId = currentSeason(player).id;
    player = claimPass(player, 'free', 0)!;
    const expires = player.vipExpiresAt;
    const profileLevel = player.level;
    vi.setSystemTime(window.endsAt);
    expect(currentSeason(player).id).not.toBe(oldId);
    expect(currentPass(player).xp).toBe(0);
    expect(claimPass(player, 'free', 0)).toBeNull();
    expect(player.demo.passes[oldId]).toMatchObject({ xp: 300, claims: ['free-0'] });
    expect(player.level).toBe(profileLevel);
    expect(player.vipExpiresAt).toBe(expires);
    expect(expires! - Date.now()).toBe(28 * 86_400_000);
    expect(hasPassAccess(player)).toBe(true);
  });
  it('unlocks earned VIP tiers retroactively without resetting XP', () => {
    const player = awardPassXp({ ...sample(), masquePoints: 2000 }, 1100);
    expect(claimPass(player, 'premium', 9)).toBeNull();
    const vip = purchaseVip(player, 'monthly')!;
    const claimed = claimPass(vip, 'premium', 9)!;
    expect(claimed.ownedPetIds).toContain('mochi');
    expect(currentPass(claimed).xp).toBe(1100);
    expect(claimPass(claimed, 'premium', 9)).toBeNull();
    expect(claimPass(claimed, 'premium', 11)).toBeNull();
  });
  it('counts unique games for weekly missions and permits only one claim per week', () => {
    vi.setSystemTime(new Date('2026-10-28T10:00:00Z'));
    let player = sample();
    for (const id of ['bird', 'bird', 'mole', 'run', 'fruit'] as const) {
      player = beginGame(player, id)!;
      player = finishGame(player, player.demo.sessions.at(-1)!.id, 100)!;
    }
    expect(weeklyPassMission(player).games).toHaveLength(4);
    const claimed = claimWeeklyMission(player)!;
    expect(currentPass(claimed).xp).toBe(500);
    expect(claimWeeklyMission(claimed)).toBeNull();
    vi.setSystemTime(Date.now() + 7 * 86_400_000);
    expect(weeklyPassMission(claimed).games).toEqual([]);
    expect(claimWeeklyMission(claimed)).toBeNull();
  });
  it('keeps earning beyond level 50 and claims each light bonus exactly once', () => {
    let player = awardPassXp(sample(), 5500);
    const initialMp = player.masquePoints;
    expect(awardPassXp(player, NaN)).toBe(player);
    expect(awardPassXp(player, -10)).toBe(player);
    expect(claimPass(player, 'free', 49)).not.toBeNull();
    for (let count = 0; count < 5; count += 1) player = claimPassBonus(player)!;
    expect(player.masquePoints).toBe(initialMp + 40);
    expect(player.gachaTickets).toBe(1);
    expect(nextPassBonus(player)).toMatchObject({ level: 56, ready: false });
    expect(claimPassBonus(player)).toBeNull();
    expect(currentPass(player).claims).toHaveLength(5);
  });
  it('migrates short legacy passes once without resetting VIP, inventory or claimed rewards', () => {
    const player = sample();
    player.vipExpiresAt = Date.now() + 2 * 86_400_000;
    delete player.demo.passRevision;
    player.demo.config.vipPlans = [{ id: 'five-day', label: 'Old', durationDays: 5, cost: 180, reward: '' }];
    player.demo.config.seasons = player.demo.config.seasons.map((season) => ({ ...season, free: season.free.slice(0, 5), premium: season.premium.slice(0, 5) }));
    player.demo.passes.songkran = { xp: 230, premium: true, claims: ['free-0', 'premium-1'] };
    player.demo.passes['loy-krathong'] = { xp: 400, premium: true, claims: ['premium-0'] };
    savePlayer(player);
    const restored = loadPlayer(null);
    expect(restored.vipExpiresAt).toBe(player.vipExpiresAt);
    expect(restored.masquePoints).toBe(player.masquePoints);
    expect(restored.ownedPetIds).toEqual(player.ownedPetIds);
    expect(currentSeason(restored).free).toHaveLength(50);
    expect(currentPass(restored)).toMatchObject({ xp: 330, premium: true, claims: ['free-0', 'premium-1'] });
    expect(restored.demo.config.vipPlans[0].durationDays).toBe(30);
    expect(restored.demo.config.vipPlans.map((plan) => plan.id)).toEqual(expect.arrayContaining(['monthly', 'monthly-boost-20', 'monthly-boost-30']));
    expect(currentPass(loadPlayer(null)).xp).toBe(330);
    restored.demo.config.passSeasonId = 'loy-krathong';
    expect(currentPass(restored)).toMatchObject({ xp: 500, premium: true, claims: ['premium-0'] });
  });
  it('builds 50 reward tiers without rewriting existing rewards and grants cosmetic inventory', () => {
    const player = sample();
    const old = [{ title: 'Saved Reward', type: 'points' as const, amount: 12 }];
    const free = passTrack(old, 'free', 'water');
    const vip = passTrack([], 'premium', 'water');
    expect(free).toHaveLength(50); expect(vip).toHaveLength(50);
    expect(free[0]).toEqual(old[0]); expect(free[49].type).toBe('badge');
    const wing = grantReward(player, vip[44]);
    expect(wing.demo.wings).toContain('sunrise-seraph');
    expect(player.demo.wings).toEqual([]);
    expect(grantReward(player, free[14]).demo.frames).toContain('ocean');
    expect(grantReward(player, free[29]).demo.backgrounds).toContain('cloud-club');
    expect(grantReward(player, free[44]).demo.arenaTickets).toBe(3);
    expect(grantReward(player, free[49]).demo.achievements.at(-1)?.id).toContain('pass:');
  });
  it('uses shared 30-day UTC windows with a clean boundary and unlimited bonus levels', () => {
    const now = Date.UTC(2026, 9, 28);
    const first = passWindow(now);
    expect(first.starts).toBe('2026-10-28');
    expect(first.endsAt - first.startsAt).toBe(30 * 86_400_000);
    expect(passWindow(first.endsAt - 1).index).toBe(first.index);
    expect(passWindow(first.endsAt).index).toBe(first.index + 1);
    expect(passProgress(99)).toMatchObject({ level: 0, mainLevel: 0 });
    expect(passProgress(100).level).toBe(1);
    expect(passProgress(5000)).toMatchObject({ level: 50, complete: true });
    expect(passProgress(12300)).toMatchObject({ level: 123, mainLevel: 50 });
    expect(passProgress(Infinity).level).toBe(0);
  });
  it('finishes a session once and updates independent EXP and scores', () => {
    const player = finishedSample();
    expect(player.demo.profileXp).toBe(40);
    expect(currentPass(player).xp).toBe(0);
    expect(player.demo.scores.bird).toBe(20000);
    expect(player.demo.seasonScores['season-01'].bird).toBe(20000);
    expect(finishGame(player, 'session-1', 9999)).toBeNull();
  });
  it('claims a mission only once per day and season', () => {
    const player = finishedSample();
    player.demo.config.missionTarget = 1;
    expect(player.demo.missionCounts[dayKey(player)]).toBe(1);
    const next = claimMission(player)!;
    expect(currentPass(next).xp).toBe(200);
    expect(claimMission(next)).toBeNull();
  });
  it('uses VIP as Pass access without a second purchase and prevents repeated claims', () => {
    const player = awardPassXp(sample(), 100); player.vipExpiresAt = Date.now() + 86_400_000;
    expect(hasPassAccess(player)).toBe(true);
    expect(buyPremium(player)).toBeNull();
    const next = claimPass(player, 'premium', 0)!;
    expect(next.masquePoints).toBe(player.masquePoints + 40);
    expect(claimPass(next, 'premium', 0)).toBeNull();
    expect(hasPassAccess({ ...player, vipExpiresAt: Date.now() - 1 })).toBe(false);
  });
  it('buys a single VIP Pass across seasons and preserves legacy season purchases', () => {
    const player = buyPremium({ ...sample(), masquePoints: 2000 })!;
    expect(player.vipExpiresAt).toBeGreaterThan(Date.now());
    expect(player.masquePoints).toBe(1010);
    player.demo.config.passAutomatic = false;
    player.demo.config.passSeasonId = 'loy-krathong';
    expect(hasPassAccess(player)).toBe(true);
    expect(currentPass(player).claims).toEqual([]);
    player.demo.config.passSeasonId = 'songkran';
    player.vipExpiresAt = null;
    player.demo.passes.songkran = { xp: 0, premium: true, claims: [] };
    expect(hasPassAccess(player)).toBe(true);
  });
  it('advances independent per-game missions through growing, repeatable goals', () => {
    let player = finishedSample();
    expect(gameMission(player, 'bird')).toMatchObject({ target: 1, count: 1 });
    player = claimMission(player, 'bird')!;
    expect(gameMission(player, 'bird')).toMatchObject({ target: 5, count: 1 });
    expect(claimMission(player, 'bird')).toBeNull();
    expect(gameMission(player, 'mole')).toMatchObject({ target: 1, count: 0 });
    player.demo.playCounts.bird = 5;
    player = claimMission(player, 'bird')!;
    expect(gameMission(player, 'bird').target).toBe(10);
    expect(currentPass(player).xp).toBe(50);
    expect(player.masquePoints).toBe(345);
    player.demo.playCounts.bird = 100;
    for (let index = 0; index < 4; index += 1) player = claimMission(player, 'bird')!;
    expect(gameMission(player, 'bird').target).toBe(150);
    player.demo.config.passSeasonId = 'loy-krathong';
    expect(gameMission(player, 'bird').target).toBe(150);
    savePlayer(player);
    expect(gameMission(loadPlayer(null), 'bird').target).toBe(150);
  });
  it('buys fixed AIS point packages and grants the first-pack bonus only once', () => {
    const player = sample(); player.aisPoints = 500;
    expect(pointPackReward(player, 'pocket')).toBe(3010);
    const first = buyPointPack(player, 'pocket')!;
    expect(first.aisPoints).toBe(401);
    expect(first.masquePoints).toBe(3330);
    const second = buyPointPack(first, 'pocket')!;
    expect(second.masquePoints).toBe(4840);
    expect(second.demo.pointPackClaims).toEqual(['pocket']);
    expect(buyPointPack({ ...player, aisPoints: 98 }, 'pocket')).toBeNull();
    expect(buyPointPack(player, 'unknown')).toBeNull();
    savePlayer(second);
    expect(pointPackReward(loadPlayer(null), 'pocket')).toBe(1510);
  });
  it('keeps lifetime scores after a season reset and guards ranking prizes', () => {
    const player = finishedSample();
    const next = claimRankingReward(player, 'bird')!;
    expect(claimRankingReward(next, 'bird')).toBeNull();
    next.demo.seasonScores['season-01'] = {};
    expect(getGameRanking('bird', 'weekly', next, 9999).find((row) => row.isCurrentPlayer)?.score).toBe(0);
    expect(getGameRanking('bird', 'allTime', next, 9999).find((row) => row.isCurrentPlayer)?.score).toBe(20000);
  });
  it('buys separate Arena tickets and spends one ticket, never Energy or MP, on Ranked entry', () => {
    const player = sample();
    expect(startBattle(player, 'bird')).toBeNull();
    expect(buyArenaTickets(player, 0)).toBeNull();
    expect(buyArenaTickets(player, 0.5)).toBeNull();
    expect(buyArenaTickets(player, 99)).toBeNull();
    const bought = buyArenaTickets(player, 1)!;
    expect(bought.masquePoints).toBe(290);
    expect(bought.demo.arenaTickets).toBe(1);
    expect(bought.gachaTickets).toBe(player.gachaTickets);
    bought.energy = 0;
    const entered = startBattle(bought, 'bird')!;
    expect(entered.energy).toBe(0);
    expect(entered.masquePoints).toBe(290);
    expect(entered.demo.arenaTickets).toBe(0);
    expect(entered.demo.battles).toEqual([]);
    expect(startBattle(entered, 'bird')).toBeNull();
    const session = entered.demo.sessions.at(-1)!;
    const finished = finishGame(entered, session.id, 20000)!;
    expect(finished.masquePoints).toBe(360);
    expect(finished.demo.profileXp).toBe(80);
    expect(finished.demo.achievements.map((badge) => badge.id)).toEqual(['first-finish', 'ranked-debut']);
    expect(finishGame(finished, session.id, 20000)).toBeNull();
  });
  it('keeps casual Energy pricing and records play-time only for an unfinished session', () => {
    const entered = beginGame(sample(), 'bird')!;
    expect(entered.energy).toBe(11);
    expect(entered.demo.arenaTickets).toBe(0);
    const session = entered.demo.sessions.at(-1)!;
    const timed = recordPlayTime(entered, session.id, 15_000);
    expect(timed.demo.playTimeMs.bird).toBe(15_000);
    expect(recordPlayTime(timed, session.id, 3_600_000)).toBe(timed);
    const finished = finishGame(timed, session.id, 20000)!;
    expect(recordPlayTime(finished, session.id, 1000)).toBe(finished);
    expect(finished.demo.playCounts.bird).toBe(1);
    expect(finished.masquePoints).toBe(320);
    expect(finished.demo.profileXp).toBe(40);
  });
  it('saves unlocked profile backgrounds and only owned frames and earned badges', () => {
    const original = finishedSample();
    expect(customizeProfile(original, { backgroundId: 'cloud-club', bio: '', badgeIds: [] }, null)).not.toBeNull();
    const player = original;
    const style = { backgroundId: 'cloud-club', bio: 'Hello', badgeIds: ['first-finish'] };
    expect(customizeProfile(player, { ...style, badgeIds: ['fake-top'] }, null)).toBeNull();
    expect(customizeProfile(player, style, 'sunrise')).toBeNull();
    const next = customizeProfile(player, style, null)!;
    savePlayer(next);
    expect(loadPlayer(null).demo.profile).toEqual(style);
    const ranked = claimRankingReward(player, 'bird')!;
    expect(ranked.demo.achievements.some((badge) => badge.seasonId === 'season-01')).toBe(true);
    ranked.demo.config.rankingSeasonId = 'season-02';
    expect(ranked.demo.achievements.some((badge) => badge.seasonId === 'season-01')).toBe(true);
  });
  it('rejects invalid admin config rather than corrupting live rules', () => {
    const player = sample();
    expect(validateConfig(player.demo.config)).toBeNull();
    player.demo.config.regenMinutes = 0;
    expect(validateConfig(player.demo.config)).not.toBeNull();
  });
  it('migrates old v2 players without discarding owned items or reward claims', () => {
    const player = sample();
    const { demo, ...legacy } = player;
    void demo;
    legacy.claimedRewards = ['free-1', 'vip-2'];
    legacy.battlePassXp = 230;
    localStorage.setItem('masquegame_center_v2', JSON.stringify(legacy));
    const next = loadPlayer(null);
    expect(next.id).toBe(player.id);
    expect(next.ownedPetIds).toEqual(player.ownedPetIds);
    expect(currentPass(next)).toMatchObject({ xp: 330, premium: false, claims: ['free-0', 'premium-1'] });
  });
  it('persists room arrangement and guest selection across reloads', () => {
    const player = sample();
    player.demo.room = { code: 'ABC123', name: 'Test Room', theme: 'water', private: true, guests: ['Luna · MOCK'], gameId: 'fruit', furniture: [{ id: 'sofa-1', kind: 'sofa', x: 2, y: 3 }], savedAt: Date.now() };
    savePlayer(player);
    expect(loadPlayer(null).demo.room).toEqual(player.demo.room);
  });
  it('purchases decor once without modifying the saved room', () => {
    const player = buyDecor(sample(), 'lamp')!;
    expect(player.masquePoints).toBe(295);
    expect(player.demo.ownedDecor).toContain('lamp');
    expect(player.demo.room).toBeNull();
    expect(buyDecor(player, 'lamp')).toBeNull();
  });
});