import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GAMES, GAME_BY_ID, loadGameCatalog, parseGameCatalog } from './games';
import { loadPlayer, savePlayer } from '../services/playerService';

const game = { id: 'new-game', name: 'New Game', description: 'Play', genre: 'Puzzle', badge: 'New', url: 'https://example.com/game/' };

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) });
});
afterEach(() => { vi.unstubAllGlobals(); });

describe('runtime game catalog', () => {
  it('rejects invalid entries without changing the catalog', () => {
    const previousIds = GAMES.map((entry) => entry.id);
    expect(() => parseGameCatalog([])).toThrow();
    expect(() => parseGameCatalog([game, game])).toThrow();
    expect(() => parseGameCatalog([{ ...game, id: '../admin' }])).toThrow();
    expect(() => parseGameCatalog([{ ...game, url: 'javascript:alert(1)' }])).toThrow();
    expect(() => parseGameCatalog([{ ...game, genre: 'all' }])).toThrow();
    expect(() => parseGameCatalog([{ ...game, published: false }])).toThrow();
    expect(GAMES.map((entry) => entry.id)).toEqual(previousIds);
  });

  it('loads added, updated and removed games for existing players without resetting progress', async () => {
    const player = loadPlayer('Player', 123, true);
    player.demo.scores.bird = 42;
    savePlayer(player);
    const fetchCatalog = vi.fn().mockResolvedValue({ ok: true, json: async () => [game, { ...game, id: 'hidden-game', published: false }] });
    vi.stubGlobal('fetch', fetchCatalog);
    await loadGameCatalog();
    expect(fetchCatalog).toHaveBeenCalledWith(expect.stringContaining('games.json'), { cache: 'no-store' });
    const restored = loadPlayer('Player');
    expect(restored.demo.config.games).toMatchObject([game, { id: 'hidden-game', published: false }]);
    expect(restored.demo.scores.bird).toBe(42);
    expect(restored.aisPoints).toBe(123);
    expect(GAME_BY_ID['new-game'].url).toBe(game.url);
    expect(GAME_BY_ID.bird).toBeUndefined();

    fetchCatalog.mockResolvedValue({ ok: true, json: async () => [{ ...game, url: 'https://example.com/updated/' }] });
    await loadGameCatalog();
    expect(loadPlayer('Player').demo.config.games).toMatchObject([{ ...game, url: 'https://example.com/updated/' }]);
  });
});