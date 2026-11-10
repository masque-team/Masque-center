import { currentCheckinStreak, getAchievementProgress } from './achievementService';
import type { PlayerState } from '../types';

export interface HudNotificationItem {
  id: string;
  kind: 'mission' | 'checkin' | 'achievement';
  title: string;
  subtitle?: string;
  before: number;
  after: number;
  target: number;
  xp: number;
  rewardText?: string;
  badgeId?: string;
}

export const HUD_LIMIT = 3;
export const HUD_STAGGER = 520;
export const HUD_DURATION = 3400;

export function achievementHud(before: PlayerState, after: PlayerState, at: number): HudNotificationItem[] {
  const previous = getAchievementProgress(before, at);
  return getAchievementProgress(after, at).flatMap((item) => {
    const old = previous.find((entry) => entry.definition.id === item.definition.id)!;
    if (item.progress <= old.progress && (old.unlocked || !item.unlocked)) return [];
    return [{
      id: crypto.randomUUID(), kind: 'achievement' as const, title: item.definition.title,
      before: old.progress, after: item.progress, target: item.definition.target, xp: 0,
      badgeId: item.unlocked ? item.definition.id : undefined,
      rewardText: item.unlocked && !old.unlocked ? 'เหรียญตราใหม่' : undefined,
    }];
  });
}

export function checkinHud(before: PlayerState, after: PlayerState, at: number): HudNotificationItem {
  const unlockedPetBox = !before.demo.achievements.some((item) => item.id === 'checkin-streak-7')
    && after.demo.achievements.some((item) => item.id === 'checkin-streak-7');
  return {
    id: crypto.randomUUID(), kind: 'checkin', title: 'เช็กอินประจำวันสำเร็จ!',
    before: Math.min(7, currentCheckinStreak(before, at)),
    after: Math.min(7, currentCheckinStreak(after, at)), target: 7, xp: 0,
    rewardText: `+${after.energy - before.energy} Energy${unlockedPetBox ? ' & Pet Box' : ''}`,
  };
}

// Keep absolute start times across reactive queue updates, so existing cards never restart.
export function hudStartTimes(ids: string[], previous: Map<string, number>, now: number, reduced: boolean): Map<string, number> {
  const starts = new Map<string, number>();
  ids.forEach((id, index) => {
    const preceding = starts.get(ids[index - 1]);
    const slot = starts.get(ids[index - HUD_LIMIT]);
    starts.set(id, previous.get(id) ?? Math.max(
      now,
      preceding === undefined ? now : preceding + (reduced ? 0 : HUD_STAGGER),
      slot === undefined ? now : slot + HUD_DURATION + (reduced ? 0 : 200),
    ));
  });
  return starts;
}
