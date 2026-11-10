import type { Game } from '../types';

const GAME_ORIGIN = 'https://masque-lab.adldigitalservice.com';

export const GAMES: Game[] = [
  {
    id: 'bird',
    name: 'สัตว์บินถลาลม',
    description: 'บินฝ่าอุปสรรค ทำคะแนนให้สูงที่สุด',
    genre: 'Arcade',
    badge: 'ใหม่',
    editorialTag: 'new',
    displayOrder: 1,
    url: `${GAME_ORIGIN}/myroom/bird/`,
    cover: 'bird.png',
    fallbackCover: `${GAME_ORIGIN}/game-center/bird.png`,
  },
  {
    id: 'mole',
    name: 'ตีไอต้าวตุ่นเด้ง',
    description: 'ตีตุ่นให้ไว เก็บคะแนนแข่งกัน',
    genre: 'Reaction',
    badge: 'ฮิต',
    editorialTag: 'pick',
    displayOrder: 2,
    url: `${GAME_ORIGIN}/myroom/mole-v3/`,
    cover: 'mole.png',
    fallbackCover: `${GAME_ORIGIN}/game-center/mole.png`,
  },
  {
    id: 'run',
    name: 'สัตว์วิ่งตะลุยเมือง',
    description: 'วิ่งหลบสิ่งกีดขวางให้ได้ไกล',
    genre: 'Runner',
    badge: 'ท้าทาย',
    editorialTag: 'new',
    displayOrder: 3,
    url: `${GAME_ORIGIN}/minigame/aniirun/`,
    cover: 'run.png',
    fallbackCover: `${GAME_ORIGIN}/game-center/run.png`,
  },
  {
    id: 'fruit',
    name: 'ฟันผลไม้เปรี้ยง',
    description: 'ฟันผลไม้ ทำคอมโบให้ต่อเนื่อง',
    genre: 'Action',
    badge: 'สายแอ็กชัน',
    editorialTag: 'pick',
    displayOrder: 4,
    url: `${GAME_ORIGIN}/myroom/fruitninja/`,
    cover: 'ninja.png',
    fallbackCover: `${GAME_ORIGIN}/game-center/fn.png`,
  },
  {
    id: 'timber',
    name: 'สัตว์ชนพุ่งปังปัง',
    description: 'เกมสไตล์ Timberman เปลี่ยนตัวละครเป็นกวาง',
    genre: 'Arcade',
    badge: 'เล่นเพลิน',
    displayOrder: 5,
    url: `${GAME_ORIGIN}/myroom/game/timberdear/`,
    cover: 'timber.png',
    fallbackCover: `${GAME_ORIGIN}/game-center/tbd.png`,
  },
  {
    id: 'duck',
    name: 'ล่าฝุงเป็ดป่วน',
    description: 'เล็งเป็ดให้แม่น ทำคะแนนให้สูง',
    genre: 'Shooter',
    badge: 'เล็งให้แม่น',
    displayOrder: 6,
    url: `${GAME_ORIGIN}/myroom/shooting-duck/`,
    cover: 'duck.png',
    fallbackCover: `${GAME_ORIGIN}/game-center/sd.png`,
  },
  {
    id: 'memory',
    name: 'สัตว์จับคู่สู้สุดใจ',
    description: 'จับคู่ภาพสัตว์ที่เหมือนกันให้ครบทุกคู่',
    genre: 'Memory',
    badge: 'แนะนำ',
    featured: true,
    editorialTag: 'hot',
    displayOrder: 7,
    url: `${GAME_ORIGIN}/minigame/memonrycard/`,
    cover: 'mem.png',
  },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((game) => [game.id, game])) as Record<Game['id'], Game>;

export let catalogFromFile = false;

export function parseGameCatalog(value: unknown): Game[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 32) throw new Error('games.json must contain 1 to 32 games');
  const ids = new Set<string>();
  for (const game of value) {
    if (!game || typeof game !== 'object' || typeof game.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(game.id) || ids.has(game.id)) throw new Error('Invalid or duplicate game id');
    ids.add(game.id);
    if (typeof game.name !== 'string' || !game.name.trim() || game.name.length > 100 || typeof game.description !== 'string' || typeof game.genre !== 'string' || !game.genre.trim() || game.genre === 'all' || typeof game.badge !== 'string') throw new Error(`Invalid details for game ${game.id}`);
    try { if (!['http:', 'https:'].includes(new URL(game.url).protocol)) throw new Error(); } catch { throw new Error(`Invalid URL for game ${game.id}`); }
    if (game.cover !== undefined && (typeof game.cover !== 'string' || !/^[a-zA-Z0-9_.-]+$/.test(game.cover))) throw new Error(`Invalid cover for game ${game.id}`);
    if (game.fallbackCover !== undefined) { try { if (!['http:', 'https:'].includes(new URL(game.fallbackCover).protocol)) throw new Error(); } catch { throw new Error(`Invalid fallback cover for game ${game.id}`); } }
    if (game.published !== undefined && typeof game.published !== 'boolean' || game.featured !== undefined && typeof game.featured !== 'boolean' || game.displayOrder !== undefined && (!Number.isSafeInteger(game.displayOrder) || game.displayOrder < 0) || game.editorialTag !== undefined && !['hot', 'new', 'pick'].includes(game.editorialTag)) throw new Error(`Invalid options for game ${game.id}`);
  }
  if (!value.some((game) => game.published !== false)) throw new Error('At least one game must be published');
  return value as Game[];
}

export async function loadGameCatalog(): Promise<void> {
  const response = await fetch(`${import.meta.env.BASE_URL}games.json`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load games.json (HTTP ${response.status})`);
  const games = parseGameCatalog(await response.json());
  GAMES.splice(0, GAMES.length, ...games);
  for (const id of Object.keys(GAME_BY_ID)) delete GAME_BY_ID[id];
  Object.assign(GAME_BY_ID, Object.fromEntries(games.map((game) => [game.id, game])));
  catalogFromFile = true;
}