import { describe, expect, it } from 'vitest';
import { buyEnergy, CHARACTERS, loadPlayer, newPlayer, recover, REFILL_MS, spendEnergy } from './model';

describe('mini energy economy', () => {
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