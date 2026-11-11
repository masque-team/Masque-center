import type { Character, GameId } from './model';

export const games: { id: GameId; name: string; cover: string; url: string; action: string; warning: string; duration: number }[] = [
  { id: 'mole', name: 'ตีตุ่น', cover: 'assets/ui-redesign/games/game-mole-cover.webp', url: 'https://masque-lab.adldigitalservice.com/myroom/mole-v3/', action: 'แตะตุ่นที่โผล่ขึ้นมาเพื่อเก็บคะแนน', warning: 'ระวังตีพลาด!', duration: 45 },
  { id: 'memory', name: 'จับคู่', cover: 'images/mem.webp', url: 'https://masque-lab.adldigitalservice.com/minigame/memonrycard/', action: 'เปิดการ์ดและจับคู่ภาพที่เหมือนกัน', warning: 'จำตำแหน่งให้แม่น แล้วจับคู่ให้ครบ', duration: 60 },
  { id: 'fruit', name: 'ฟันผลไม้', cover: 'assets/ui-redesign/games/game-fruit-cover.webp', url: 'https://masque-lab.adldigitalservice.com/myroom/fruitninja/', action: 'ปัดผ่านผลไม้เพื่อเก็บคะแนน', warning: 'ระวังอย่าโดนระเบิด!', duration: 60 },
  { id: 'duck', name: 'ยิงเป็ด', cover: 'assets/ui-redesign/games/game-duck-cover.webp', url: 'https://masque-lab.adldigitalservice.com/myroom/shooting-duck/', action: 'เล็งแล้วแตะเป็ดเพื่อเก็บคะแนน', warning: 'เล็งให้แม่นก่อนยิง', duration: 60 },
];

export const gameLogos: Partial<Record<GameId, string>> = {
  memory: 'https://masque-lab.adldigitalservice.com/mygame/memonrycard/ui/logomain.png',
  duck: 'https://masque-lab.adldigitalservice.com/myroom/shooting-duck/images/Logo.png',
};

const gamePlayCounts: Record<GameId, number> = { mole: 12345, memory: 9842, fruit: 18760, duck: 7654 };
export function displayedPlayCount(id: GameId, localRounds = 0) { return gamePlayCounts[id] + localRounds; }

const rankingPlayers = [
  { name: 'เมย์', portrait: 'flora' },
  { name: 'บีม', portrait: 'aqua' },
  { name: 'เจ', portrait: 'cat' },
  { name: 'ฟ้า', portrait: 'flora' },
  { name: 'มิน', portrait: 'cat' },
  { name: 'นัท', portrait: 'aqua' },
  { name: 'พลอย', portrait: 'flora' },
];

const rankingScores: Record<GameId, number[]> = {
  mole: [2450, 2120, 1980, 1920, 1850, 1750, 1680],
  memory: [3600, 3340, 3100, 2880, 2650, 2420, 2200],
  fruit: [12800, 11500, 10800, 9600, 8750, 7900, 6800],
  duck: [4200, 3950, 3620, 3300, 2980, 2750, 2400],
};

export function demoRankings(id: GameId, monthOffset = 0) {
  return rankingPlayers.slice(0, 6).map((_, index) => ({
    ...rankingPlayers[(index + monthOffset) % rankingPlayers.length], id: `demo-${index}`, score: Math.round(rankingScores[id][index] * (1 - monthOffset * .08)), isPlayer: false,
  }));
}

export function samplePlayerScore(id: GameId, monthOffset = 0) {
  return Math.round((rankingScores[id][4] + rankingScores[id][5]) / 2 * (1 - monthOffset * .08));
}

export function rankingPeriods(now = Date.now()) {
  const date = new Date(now);
  const formatter = new Intl.DateTimeFormat('th-TH', { month: 'short', year: 'numeric' });
  return [0, 1, 2].map((offset) => {
    const start = new Date(date.getFullYear(), date.getMonth() - offset, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    return { offset, start: start.getTime(), end: end.getTime(), label: `1-${lastDay} ${formatter.format(start)}` };
  });
}

export function hostedGameUrl(url: string, playerName: string) {
  const hosted = new URL(url);
  if (playerName.trim()) hosted.searchParams.set('name', playerName.trim());
  return hosted.href;
}

export function hostedGameScore(game: GameId, data: unknown): number | null {
  if (game !== 'mole' || !data || typeof data !== 'object' || !('action' in data) || data.action !== 'endgame' || !('score' in data)) return null;
  return typeof data.score === 'number' && Number.isSafeInteger(data.score) && data.score >= 0 ? data.score : null;
}

export function publicAssetUrl(path: string, base: string) {
  const root = new URL(base, 'https://assets.local/');
  const asset = new URL(path, root);
  return asset.origin === root.origin ? asset.pathname + asset.search + asset.hash : asset.href;
}

export const characterNames: Record<Character, string> = { aqua: 'ผมฟ้า', flora: 'ผมทอง' };
export function characterImage(id: string) { return `assets/characters/${id}.webp`; }
export function characterBackground(id: Character) { return `assets/characters/${id}-stage.webp`; }
export function portraitImage(portrait: string) {
  return portrait === 'cat' ? 'assets/pets/mooncat.webp' : portrait.startsWith('data:') ? portrait : `assets/characters/${portrait}-portrait.webp`;
}