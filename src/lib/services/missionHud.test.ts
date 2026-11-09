import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { achievementHud, checkinHud, hudStartTimes, HUD_DURATION, HUD_LIMIT } from './missionHud';
import { loadPlayer } from './playerService';
import { claimDailyCheckin } from './achievementService';
import { awardPassXp, beginGame, currentPass, finishGame, ledger, processAchievementEvent, progressMissions } from './demoService';

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-04T10:00:00Z'));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('redesign mission presentation', () => {
  it('uses the consecutive streak rather than lifetime check-in count', () => {
    const before = loadPlayer('QA', true);
    before.checkinDates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'];
    const after = claimDailyCheckin(before)!;
    expect(checkinHud(before, after, Date.now())).toMatchObject({ before: 0, after: 1, xp: 0 });
    expect(checkinHud(before, after, Date.now()).rewardText).not.toContain('Pet Box');
  });
  it('announces the Day-7 box only when it was actually granted', () => {
    const before = loadPlayer('QA', true);
    before.checkinDates = ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03'];
    const after = processAchievementEvent(claimDailyCheckin(before)!, { type: 'daily_checkin' });
    expect(checkinHud(before, after, Date.now())).toMatchObject({ before: 6, after: 7 });
    expect(checkinHud(before, after, Date.now()).rewardText).toContain('Pet Box');
    expect(checkinHud(after, after, Date.now()).rewardText).not.toContain('Pet Box');
  });
  it('does not advertise XP at the Pass cap', () => {
    const full = awardPassXp(loadPlayer('QA', true), 5000);
    const after = progressMissions(full, 'checkin');
    expect(after.demo.recentMissionEvents!.every((event) => event.xp === 0)).toBe(true);
    expect(currentPass(after).xp).toBe(5000);
  });
  it('reports the actual XP delta when only part of a reward fits', () => {
    const almost = awardPassXp(loadPlayer('QA', true), 4995);
    const after = progressMissions(almost, 'checkin');
    expect(after.demo.recentMissionEvents!.reduce((sum, item) => sum + item.xp, 0)).toBe(5);
    expect(currentPass(after).xp - currentPass(almost).xp).toBe(5);
  });
  it('presents Achievement progress independently from Pass XP without mutating state', () => {
    const before = loadPlayer('QA', true);
    const started = beginGame(before, 'bird')!;
    const after = finishGame(started, started.demo.sessions.at(-1)!.id, 100)!;
    const saved = JSON.stringify(after);
    const notifications = achievementHud(before, after, Date.now());
    expect(notifications.some((item) => item.badgeId === 'first-finish')).toBe(true);
    expect(notifications.some((item) => item.title === 'นักเล่นเกมตัวยง' && item.after === 1)).toBe(true);
    expect(notifications.every((item) => item.xp === 0)).toBe(true);
    expect(JSON.stringify(after)).toBe(saved);
    expect(achievementHud(after, after, Date.now())).toEqual([]);
    expect(finishGame(after, started.demo.sessions.at(-1)!.id, 100)).toBeNull();
  });
  it('classifies all AIS debits as purchases, including boxes, frames and tickets', () => {
    const before = loadPlayer('QA', true);
    before.aisPoints = 100;
    for (const label of ['แลก Pet Box', 'แลกไอเทมเข้าคอลเลกชัน', 'แลกตั๋วแข่งขัน']) {
      expect(ledger(before, { ...before, aisPoints: 50 }, label).demo.history![0].kind).toBe('purchase');
    }
  });
});

describe('bounded HUD scheduling', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  it('stagger-enters every notification without dropping overflow', () => {
    const times = hudStartTimes(ids, new Map(), 100, false);
    expect(times.size).toBe(ids.length);
    expect(times.get('b')! - times.get('a')!).toBe(520);
    for (let index = HUD_LIMIT; index < ids.length; index++) {
      expect(times.get(ids[index])!).toBeGreaterThan(times.get(ids[index - HUD_LIMIT])! + HUD_DURATION);
    }
  });
  it('preserves active timing when a notification is dismissed or appended', () => {
    const times = hudStartTimes(ids, new Map(), 100, false);
    const updated = hudStartTimes([...ids.slice(1), 'h'], times, 800, false);
    expect(updated.get('b')).toBe(times.get('b'));
    expect(updated.has('a')).toBe(false);
    expect(updated.has('h')).toBe(true);
  });
  it('bounds reduced-motion notifications and does not add slide delays', () => {
    const times = hudStartTimes(ids, new Map(), 100, true);
    expect([...times.values()].slice(0, HUD_LIMIT)).toEqual([100, 100, 100]);
    expect(times.get('d')).toBe(100 + HUD_DURATION);
  });
  it('clears retained scheduling state when the queue drains', () => {
    expect(hudStartTimes([], hudStartTimes(ids, new Map(), 0, false), 9999, false).size).toBe(0);
  });
});
