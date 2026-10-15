import type { PassPackage, PlayerState } from '../types';
import { currentDayKey } from './playerService';

export const DAILY_FREE_SECONDS = 60 * 60;
export const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

export const PASS_PACKAGES: PassPackage[] = [
  { id: 'daily', label: 'Daily Pass', durationDays: 1, cost: 1 },
  { id: 'weekly', label: 'Weekly Pass', durationDays: 7, cost: 5, bestValue: true },
];

export function isPassActive(expiredAt: number | null, now = Date.now()): boolean {
  return expiredAt !== null && expiredAt > now;
}

export function freeSecondsRemaining(player: PlayerState, date = new Date()): number {
  if (player.freeDate !== currentDayKey(date)) return DAILY_FREE_SECONDS;
  return Math.max(0, DAILY_FREE_SECONDS - player.freeUsedSeconds);
}

export function extendPass(player: PlayerState, packageInfo: PassPackage, now = Date.now()): PlayerState {
  const startAt = Math.max(now, player.passExpiredAt ?? 0);
  return {
    ...player,
    aisPoints: player.aisPoints - packageInfo.cost,
    passExpiredAt: startAt + packageInfo.durationDays * DAY_MILLISECONDS,
  };
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function formatPassRemaining(expiredAt: number, now = Date.now()): string {
  const remaining = Math.max(0, expiredAt - now);
  const days = Math.floor(remaining / DAY_MILLISECONDS);
  const hours = Math.floor((remaining % DAY_MILLISECONDS) / 3_600_000);
  const minutes = Math.ceil((remaining % 3_600_000) / 60_000);
  return days > 0 ? `${days} วัน ${hours} ชม.` : `${hours} ชม. ${minutes} นาที`;
}