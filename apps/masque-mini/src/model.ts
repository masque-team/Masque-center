export const SAVE_KEY = 'masque_mini_v1';
export const REFILL_MS = 30 * 60 * 1000;
export const ENERGY_CAP = 12;
export const DAILY_ENERGY_REWARDS = [1, 1, 2, 2, 3, 3, 5] as const;
const DAY_MS = 24 * 60 * 60 * 1000;
export const packs = [
  { energy: 5, price: 5 },
  { energy: 12, price: 10 },
  { energy: 30, price: 20 },
] as const;

export const CHARACTERS = ['aqua', 'flora'] as const;
export type Character = typeof CHARACTERS[number];
export type GameId = 'mole' | 'memory' | 'fruit' | 'duck';
export interface Round { game: GameId; score: number; at: number; simulated?: boolean }
export interface Player {
  name: string;
  character: Character;
  selected: boolean;
  portrait: string;
  energy: number;
  points: number;
  refillAt: number;
  history: Round[];
  checkin: { day: number; lastClaimDay: number | null };
}

export function newPlayer(now = Date.now()): Player {
  return { name: '', character: 'aqua', selected: false, portrait: 'cat', energy: 8, points: 1250, refillAt: now + REFILL_MS, history: [], checkin: { day: 0, lastClaimDay: null } };
}

function thaiDay(now: number) {
  const date = new Date(now + 7 * 60 * 60 * 1000);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function dailyCheckin(player: Player, now = Date.now()) {
  const today = thaiDay(now);
  const last = player.checkin.lastClaimDay;
  const claimed = last !== null && last >= today;
  const day = claimed ? player.checkin.day : last === today - DAY_MS ? (player.checkin.day + 1) % DAILY_ENERGY_REWARDS.length : 0;
  return { day, claimed, reward: DAILY_ENERGY_REWARDS[day] };
}

export function claimDailyEnergy(player: Player, now = Date.now()): Player | null {
  const checkin = dailyCheckin(player, now);
  if (checkin.claimed) return null;
  const current = recover(player, now);
  const energy = current.energy + checkin.reward;
  if (!Number.isSafeInteger(energy)) return null;
  return { ...current, energy, refillAt: energy >= ENERGY_CAP ? now + REFILL_MS : current.refillAt, checkin: { day: checkin.day, lastClaimDay: thaiDay(now) } };
}

export function recover(player: Player, now = Date.now()): Player {
  if (player.energy >= ENERGY_CAP) return { ...player, refillAt: now + REFILL_MS };
  if (now < player.refillAt) return player;
  const units = Math.floor((now - player.refillAt) / REFILL_MS) + 1;
  const energy = Math.min(ENERGY_CAP, player.energy + units);
  return { ...player, energy, refillAt: energy === ENERGY_CAP ? now + REFILL_MS : player.refillAt + units * REFILL_MS };
}

export function spendEnergy(player: Player, now = Date.now()): Player | null {
  const current = recover(player, now);
  if (current.energy < 1) return null;
  return { ...current, energy: current.energy - 1, refillAt: current.energy >= ENERGY_CAP ? now + REFILL_MS : current.refillAt };
}

export function buyEnergy(player: Player, index: number, now = Date.now()): Player | null {
  const pack = packs[index];
  if (!pack || player.points < pack.price) return null;
  const current = recover(player, now);
  return { ...current, points: current.points - pack.price, energy: current.energy + pack.energy };
}

export function loadPlayer(raw: string | null, now = Date.now()): Player {
  try {
    if (!raw) return newPlayer(now);
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return newPlayer(now);
    const fresh = newPlayer(now);
    const checkin = saved.checkin;
    const validCheckin = checkin && Number.isInteger(checkin.day) && checkin.day >= 0 && checkin.day < DAILY_ENERGY_REWARDS.length && (checkin.lastClaimDay === null || Number.isSafeInteger(checkin.lastClaimDay) && checkin.lastClaimDay >= 0 && checkin.lastClaimDay % DAY_MS === 0);
    return recover({
      ...fresh,
      name: typeof saved.name === 'string' ? saved.name.slice(0, 20) : fresh.name,
      character: CHARACTERS.includes(saved.character) ? saved.character : 'aqua',
      selected: saved.selected === true,
      portrait: saved.portrait === 'blaze' || saved.portrait === 'mint' ? 'aqua' : typeof saved.portrait === 'string' && /^(cat|aqua|flora|data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+)$/.test(saved.portrait) && saved.portrait.length < 1500000 ? saved.portrait : 'cat',
      energy: Number.isSafeInteger(saved.energy) && saved.energy >= 0 ? saved.energy : fresh.energy,
      points: Number.isSafeInteger(saved.points) && saved.points >= 0 ? saved.points : fresh.points,
      refillAt: Number.isFinite(saved.refillAt) ? Math.min(saved.refillAt, now + REFILL_MS) : fresh.refillAt,
      history: Array.isArray(saved.history) ? saved.history.filter((round: Round) => ['mole', 'memory', 'fruit', 'duck'].includes(round?.game) && Number.isSafeInteger(round.score) && round.score >= 0 && Number.isFinite(round.at)).slice(0, 50) : [],
      checkin: validCheckin ? { day: checkin.day, lastClaimDay: checkin.lastClaimDay } : fresh.checkin,
    }, now);
  } catch { return newPlayer(now); }
}