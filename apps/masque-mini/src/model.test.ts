import { describe, expect, it } from 'vitest';
import { buyEnergy, CHARACTERS, claimDailyEnergy, dailyCheckin, DAILY_ENERGY_REWARDS, loadPlayer, newPlayer, recover, REFILL_MS, spendEnergy } from './model';
import { demoRankings, displayedPlayCount, hostedGameScore, hostedGameUrl, publicAssetUrl, rankingPeriods, samplePlayerScore } from './catalog';

describe('mini energy economy', () => {
  it('preserves simulated round scores and their labels across reloads', () => {
    const player = { ...newPlayer(0), history: [{ game: 'mole' as const, score: 1200, at: 0, simulated: true }] };
    expect(loadPlayer(JSON.stringify(player), 0).history).toEqual(player.history);
  });
  it('starts without a preset player name and preserves a chosen name', () => {
    expect(newPlayer(0).name).toBe('');
    expect(loadPlayer(JSON.stringify({ ...newPlayer(0), name: 'masque' }), 0).name).toBe('masque');
  });
  it('offers only the blue and blonde characters and preserves their choices', () => {
    expect(CHARACTERS).toEqual(['aqua', 'flora']);
    for (const character of CHARACTERS) {
      const saved = { ...newPlayer(0), character, portrait: character, selected: true };
      const restored = loadPlayer(JSON.stringify(saved), 0);
      expect(restored.character).toBe(character);
      expect(restored.portrait).toBe(character);
      expect(restored.selected).toBe(true);
      expect(restored.energy).toBe(saved.energy);
    }
  });
  it('migrates inactive character choices without losing player data', () => {
    for (const character of ['blaze', 'mint']) {
      const saved = { ...newPlayer(0), name: 'masque', character, portrait: character, energy: 3, points: 55, selected: true, history: [{ game: 'mole', score: 100, at: 0 }] };
      expect(loadPlayer(JSON.stringify(saved), 0)).toMatchObject({ ...saved, character: 'aqua', portrait: 'aqua' });
    }
  });
  it('charges only a started round and rejects an empty balance', () => {
    const player = newPlayer(0);
    expect(spendEnergy(player, 0)?.energy).toBe(7);
    expect(player.energy).toBe(8);
    expect(spendEnergy({ ...player, energy: 0 }, 0)).toBeNull();
  });
  it('recovers offline units without losing a partial interval', () => {
    const player = recover(newPlayer(0), REFILL_MS * 2 + 1000);
    expect(player.energy).toBe(10);
    expect(player.refillAt).toBe(REFILL_MS * 3);
  });
  it('caps regeneration but preserves purchased overflow', () => {
    const player = buyEnergy(newPlayer(0), 2, 0)!;
    expect(player.energy).toBe(38);
    expect(player.points).toBe(1230);
    expect(recover(player, REFILL_MS * 100).energy).toBe(38);
    expect(spendEnergy({ ...player, energy: 12 }, 500)?.refillAt).toBe(500 + REFILL_MS);
  });
  it('rejects invalid packs and insufficient points', () => {
    expect(buyEnergy(newPlayer(0), 8, 0)).toBeNull();
    expect(buyEnergy({ ...newPlayer(0), points: 0 }, 0, 0)).toBeNull();
  });
  it('loads safely and keeps the new save independent', () => {
    expect(loadPlayer('{broken', 0)).toEqual(newPlayer(0));
    expect(loadPlayer('null', 0)).toEqual(newPlayer(0));
    expect(loadPlayer(JSON.stringify({ energy: -1, points: '100', character: 'unknown' }), 0).energy).toBe(8);
    expect(loadPlayer(JSON.stringify({ ...newPlayer(0), energy: 2 }), REFILL_MS).energy).toBe(3);
  });
});

describe('mini ranking periods', () => {
  it('accepts only valid scores from the known mole game message format', () => {
    expect(hostedGameScore('mole', { action: 'endgame', score: 1200 })).toBe(1200);
    expect(hostedGameScore('mole', { action: 'endgame', score: 0 })).toBe(0);
    for (const data of [null, {}, { action: 'loadgameComplete' }, { action: 'endgame', score: -1 }, { action: 'endgame', score: 1.5 }, { action: 'endgame', score: '1200' }, { action: 'endgame', score: Infinity }]) {
      expect(hostedGameScore('mole', data)).toBeNull();
    }
    expect(hostedGameScore('fruit', { action: 'endgame', score: 1200 })).toBeNull();
  });
  it('anchors CSS image URLs to the deployment base instead of the stylesheet folder', () => {
    const path = publicAssetUrl('assets/ui-redesign/games/game-fruit-cover.webp', '/masque-gamecenter/masque-mini1/');
    expect(new URL(path, 'https://masque-lab.adldigitalservice.com/masque-gamecenter/masque-mini1/assets/index.css').href).toBe('https://masque-lab.adldigitalservice.com/masque-gamecenter/masque-mini1/assets/ui-redesign/games/game-fruit-cover.webp');
    expect(publicAssetUrl('images/mem.webp', '/')).toBe('/images/mem.webp');
  });
  it('shows distinct nonzero sample play counts and adds local rounds', () => {
    const counts = ['mole', 'memory', 'fruit', 'duck'].map((id) => displayedPlayCount(id as 'mole' | 'memory' | 'fruit' | 'duck'));
    expect(counts.every((count) => count > 0)).toBe(true);
    expect(new Set(counts).size).toBe(4);
    expect(displayedPlayCount('mole', 3)).toBe(displayedPlayCount('mole') + 3);
  });
  it('offers the current month and two previous months with real month lengths', () => {
    const periods = rankingPeriods(new Date(2026, 10, 11).getTime());
    expect(periods.map((period) => period.label)).toEqual(['1-30 พ.ย. 2569', '1-31 ต.ค. 2569', '1-30 ก.ย. 2569']);
    expect(periods[0].end).toBe(new Date(2026, 11, 1).getTime());
  });
  it('handles year boundaries and leap years', () => {
    expect(rankingPeriods(new Date(2027, 0, 1).getTime())[1].start).toBe(new Date(2026, 11, 1).getTime());
    expect(rankingPeriods(new Date(2028, 1, 1).getTime())[0].label).toContain('1-29');
  });
  it('keeps per-month sample rankings distinct and sorted', () => {
    const current = demoRankings('mole');
    const previous = demoRankings('mole', 1);
    expect(previous).not.toEqual(current);
    expect(previous.map((entry) => entry.score)).toEqual([...previous.map((entry) => entry.score)].sort((first, second) => second - first));
  });
  it('provides a sixth-place player sample without writing a real score', () => {
    for (const id of ['mole', 'memory', 'fruit', 'duck'] as const) {
      const rankings = demoRankings(id);
      expect(rankings).toHaveLength(6);
      expect(samplePlayerScore(id)).toBeLessThan(rankings[4].score);
      expect(samplePlayerScore(id)).toBeGreaterThan(rankings[5].score);
      expect(samplePlayerScore(id, 1)).not.toBe(samplePlayerScore(id));
    }
  });
  it('forwards the myAIS name without dropping existing game URL parameters', () => {
    const url = new URL(hostedGameUrl('https://example.com/game/?mode=ranked#start', ' โฟล '));
    expect(url.searchParams.get('name')).toBe('โฟล');
    expect(url.searchParams.get('mode')).toBe('ranked');
    expect(url.hash).toBe('#start');
  });
});

describe('daily energy check-in', () => {
  const start = Date.UTC(2026, 10, 11, 5);
  const day = 24 * 60 * 60 * 1000;
  it('adds the visible energy reward once and preserves other player data', () => {
    const player = { ...newPlayer(start), energy: 12, name: 'masque' };
    const next = claimDailyEnergy(player, start)!;
    expect(next.energy).toBe(13);
    expect(next.name).toBe('masque');
    expect(next.points).toBe(player.points);
    expect(next.history).toEqual(player.history);
    expect(claimDailyEnergy(next, start + 1000)).toBeNull();
    expect(dailyCheckin(loadPlayer(JSON.stringify(next), start), start).claimed).toBe(true);
  });
  it('uses Thai midnight rather than the UTC date boundary', () => {
    const before = Date.UTC(2026, 10, 11, 16, 59, 59);
    const player = claimDailyEnergy(newPlayer(before), before)!;
    expect(dailyCheckin(player, before + 1000).day).toBe(1);
    expect(claimDailyEnergy(player, before + 1000)).not.toBeNull();
  });
  it('advances seven consecutive rewards and loops the next day', () => {
    let player = newPlayer(start);
    for (let index = 0; index < 7; index++) {
      expect(dailyCheckin(player, start + day * index).reward).toBe(DAILY_ENERGY_REWARDS[index]);
      player = claimDailyEnergy(player, start + day * index)!;
    }
    expect(dailyCheckin(player, start + day * 7).day).toBe(0);
  });
  it('restarts after a missed day and blocks clock rollback', () => {
    const player = claimDailyEnergy(newPlayer(start), start)!;
    expect(dailyCheckin(player, start + day * 2).day).toBe(0);
    expect(claimDailyEnergy(player, start - day)).toBeNull();
  });
  it('loads old saves and rejects malformed check-in state safely', () => {
    expect(loadPlayer(JSON.stringify({ energy: 3, points: 55 }), start)).toMatchObject({ energy: 3, points: 55, checkin: { day: 0, lastClaimDay: null } });
    expect(loadPlayer(JSON.stringify({ checkin: { day: 99, lastClaimDay: 'bad' } }), start).checkin).toEqual({ day: 0, lastClaimDay: null });
  });
});