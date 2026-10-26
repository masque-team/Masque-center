import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { customizeProfile, loadPlayer, parseAisPointSeed, savePlayer } from './playerService';
import { nextRefillIn, refreshEnergy, refillEnergy, spendGameEnergy } from './energyService';
import { beginGame, buyDecor, buyPremium, claimMission, claimPass, claimRankingReward, currentPass, dayKey, finishGame, ledger, recordPlayTime, startBattle, validateConfig } from './demoService';
import { drawPet } from './petService';
import { buyArenaTickets, equipWings, exchangeAisPoints, purchaseShopItem } from './walletService';
import { getGameRanking } from './rankingService';
import { purchaseVip } from './passService';
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
  it('supports name and AIS test query inputs without persisting the login name', () => {
    expect(parseAisPointSeed('125')).toBe(125);
    expect(parseAisPointSeed('-1')).toBeNull();
    const player = loadPlayer('Demo One', 125, true);
    expect(player.displayName).toBe('Demo One');
    expect(player.aisPoints).toBe(125);
    expect(JSON.parse(localStorage.getItem('masquegame_center_v2')!).displayName).toBe('Guest Player');
    expect(loadPlayer(null).displayName).toBe('Guest Player');
    expect(loadPlayer('Demo Two').displayName).toBe('Demo Two');
  });
  it('allows purchased overflow and pauses free regeneration above cap', () => {
    const next = refillEnergy(sample(), 8, 70)!;
    expect(next.energy).toBe(20);
    expect(next.masquePoints).toBe(250);
    expect(refreshEnergy(next, Date.now() + 3_600_000).energy).toBe(20);
    expect(nextRefillIn(next)).toBe(0);
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
  it('expires VIP without affecting free/vip ranking fairness', () => {
    const next = purchaseVip(sample(), 'five-day')!;
    expect(spendGameEnergy(next)!.energy).toBe(12);
    expect(spendGameEnergy(next, next.vipExpiresAt! + 1)!.energy).toBe(11);
    expect(getGameRanking('bird', 'allTime', next, 0)).toEqual(getGameRanking('bird', 'allTime', { ...next, vipExpiresAt: null }, 0));
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
    const { wings, wingId, ...legacyDemo } = player.demo;
    localStorage.setItem('masquegame_center_v2', JSON.stringify({ ...player, petId: null, demo: { ...legacyDemo, config: { ...player.demo.config, shop: player.demo.config.shop.filter((item) => item.kind !== 'wing') } } }));
    const restored = loadPlayer(null);
    expect(restored.demo.wings).toEqual([]);
    expect(restored.demo.wingId).toBeNull();
    expect(restored.demo.config.shop.filter((item) => item.kind === 'wing')).toHaveLength(2);
    expect(restored.petId).toBeNull();
    expect(restored.masquePoints).toBe(player.masquePoints);
  });
});
describe('progression and duplicate protection', () => {
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
    expect(player.demo.missionCounts[dayKey(player)]).toBe(1);
    const next = claimMission(player)!;
    expect(currentPass(next).xp).toBe(100);
    expect(claimMission(next)).toBeNull();
  });
  it('keeps Premium independent from VIP and prevents repeated reward claims', () => {
    const player = sample(); player.vipExpiresAt = Date.now() + 86_400_000;
    expect(claimPass(player, 'premium', 0)).toBeNull();
    const next = claimPass(buyPremium(player)!, 'premium', 0)!;
    expect(claimPass(next, 'premium', 0)).toBeNull();
    expect(buyPremium(next)).toBeNull();
  });
  it('keeps pass ownership and claims separate across seasons', () => {
    const player = buyPremium(sample())!;
    player.demo.config.passSeasonId = 'loy-krathong';
    expect(currentPass(player).premium).toBe(false);
    expect(currentPass(player).claims).toEqual([]);
    player.demo.config.passSeasonId = 'songkran';
    expect(currentPass(player).premium).toBe(true);
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
  it('saves profile backgrounds and only owned frames and earned badges', () => {
    const player = finishedSample();
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
    expect(currentPass(next)).toMatchObject({ xp: 230, premium: false, claims: ['free-0', 'premium-1'] });
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