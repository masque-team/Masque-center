import type { Character, GameId } from './model';

export const games: { id: GameId; name: string; cover: string; url: string; action: string; warning: string; duration: number }[] = [
  { id: 'mole', name: 'ตีตุ่น', cover: 'assets/ui-redesign/games/game-mole-cover.jpg', url: 'https://masque-lab.adldigitalservice.com/myroom/mole-v3/', action: 'แตะตุ่นที่โผล่ขึ้นมาเพื่อเก็บคะแนน', warning: 'ระวังตีพลาด!', duration: 45 },
  { id: 'memory', name: 'จับคู่', cover: 'images/mem.png', url: 'https://masque-lab.adldigitalservice.com/minigame/memonrycard/', action: 'เปิดการ์ดและจับคู่ภาพที่เหมือนกัน', warning: 'จำตำแหน่งให้แม่น แล้วจับคู่ให้ครบ', duration: 60 },
  { id: 'fruit', name: 'ฟันผลไม้', cover: 'assets/ui-redesign/games/game-fruit-cover.jpg', url: 'https://masque-lab.adldigitalservice.com/myroom/fruitninja/', action: 'ปัดผ่านผลไม้เพื่อเก็บคะแนน', warning: 'ระวังอย่าโดนระเบิด!', duration: 60 },
  { id: 'duck', name: 'ยิงเป็ด', cover: 'assets/ui-redesign/games/game-duck-cover.jpg', url: 'https://masque-lab.adldigitalservice.com/myroom/shooting-duck/', action: 'เล็งแล้วแตะเป็ดเพื่อเก็บคะแนน', warning: 'เล็งให้แม่นก่อนยิง', duration: 60 },
];

export const gameLogos: Partial<Record<GameId, string>> = {
  memory: 'https://masque-lab.adldigitalservice.com/mygame/memonrycard/ui/logomain.png',
  duck: 'https://masque-lab.adldigitalservice.com/myroom/shooting-duck/images/Logo.png',
};

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

export function demoRankings(id: GameId) {
  return rankingPlayers.map((player, index) => ({
    ...player, id: `demo-${index}`, score: rankingScores[id][index], isPlayer: false,
  }));
}

export const characterNames: Record<Character, string> = { aqua: 'ผมฟ้า', flora: 'ผมทอง' };
export function characterImage(id: string) { return `assets/characters/${id}.webp`; }
export function characterBackground(id: Character) { return `assets/characters/${id}-stage.webp`; }
export function portraitImage(portrait: string) {
  return portrait === 'cat' ? 'assets/pets/mooncat.webp' : portrait.startsWith('data:') ? portrait : `assets/characters/${portrait}-portrait.webp`;
}