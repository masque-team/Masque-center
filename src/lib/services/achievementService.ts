import type { DemoReward, GameId, PlayerState, ProfileBadge } from '../types';

export type AchievementEvent =
  | { type: 'game_completed'; gameId: GameId }
  | { type: 'game_score_updated'; gameId: GameId; score: number }
  | { type: 'daily_checkin' }
  | { type: 'campaign_joined'; campaignId: string }
  | { type: 'campaign_completed'; campaignId: string };

type Metric = 'first-finish' | 'ranked-games' | 'games-played' | 'unique-games' | 'unique-genres' | 'checkin-streak' | 'high-score' | 'campaign-joins' | 'campaign-completions';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  metric: Metric;
  events: AchievementEvent['type'][];
  reward?: DemoReward;
}

export type AchievementStatus = 'locked' | 'in-progress' | 'completed' | 'unlocked';

export interface AchievementProgress {
  definition: AchievementDefinition;
  progress: number;
  unlocked: boolean;
  status: AchievementStatus;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: 'first-finish', title: 'First Finish', description: 'จบเกมครั้งแรก', target: 1, metric: 'first-finish', events: ['game_completed'] },
  { id: 'ranked-debut', title: 'Ranked Debut', description: 'จบเกม Ranked ครั้งแรก', target: 1, metric: 'ranked-games', events: ['game_completed'] },
  { id: 'explorer', title: '5-Game Explorer', description: 'เล่นเกมให้ครบ 5 เกม', target: 5, metric: 'unique-games', events: ['game_completed'] },
  { id: 'frequent-player', title: 'นักเล่นเกมตัวยง', description: 'เล่นเกมจบครบ 10 ครั้ง', target: 10, metric: 'games-played', events: ['game_completed'], reward: { title: 'Energy +3', type: 'energy', amount: 3 } },
  { id: 'games-played-50', title: 'เกมเมอร์ตัวจริง', description: 'เล่นเกมจบครบ 50 ครั้ง', target: 50, metric: 'games-played', events: ['game_completed'], reward: { title: 'Energy +5', type: 'energy', amount: 5 } },
  { id: 'games-played-100', title: 'ตำนานแห่งเกม', description: 'เล่นเกมจบครบ 100 ครั้ง', target: 100, metric: 'games-played', events: ['game_completed'], reward: { title: 'Pet Gacha Box', type: 'gacha-box', amount: 1, boxKind: 'pet' } },
  { id: 'checkin-streak-7', title: 'เช็กอินต่อเนื่อง 7 วัน', description: 'เช็กอินทุกวันติดต่อกัน 7 วัน', target: 7, metric: 'checkin-streak', events: ['daily_checkin'], reward: { title: 'Energy +5', type: 'energy', amount: 5 } },
  { id: 'all-game-genres', title: 'นักสำรวจทุกประเภท', description: 'เล่นเกมครบทุกประเภทใน Catalog', target: 1, metric: 'unique-genres', events: ['game_completed'] },
  { id: 'high-score-10000', title: 'ทำคะแนน 10,000', description: 'ทำ High Score เกมปกติถึง 10,000 คะแนน', target: 10_000, metric: 'high-score', events: ['game_score_updated'], reward: { title: 'AIS Point +50', type: 'points', amount: 50 } },
  { id: 'campaign-joins-3', title: 'นักล่า Campaign', description: 'เข้าร่วม Campaign 3 ครั้ง', target: 3, metric: 'campaign-joins', events: ['campaign_joined'], reward: { title: 'AIS Point +50', type: 'points', amount: 50 } },
  { id: 'campaign-completed-1', title: 'Campaign Finisher', description: 'ทำกิจกรรม Campaign จบ 1 ครั้ง', target: 1, metric: 'campaign-completions', events: ['campaign_completed'] },
];

function localDateKey(at: number): string {
  const date = new Date(at);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function previousDateKey(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return localDateKey(date.getTime());
}

export function currentCheckinStreak(player: PlayerState, at = Date.now()): number {
  const checkedIn = new Set(player.checkinDates);
  let date = localDateKey(at);
  if (!checkedIn.has(date)) date = previousDateKey(date);
  let streak = 0;
  while (checkedIn.has(date)) {
    streak += 1;
    date = previousDateKey(date);
  }
  return streak;
}

export function claimDailyCheckin(player: PlayerState, at = Date.now()): PlayerState | null {
  const date = localDateKey(at);
  if (player.checkinDates.includes(date)) return null;
  return {
    ...player,
    aisPoints: player.aisPoints + player.demo.config.checkinReward,
    checkinDates: [...player.checkinDates, date],
  };
}

function metricValue(player: PlayerState, metric: Metric, at: number): number {
  const playCounts = Object.values(player.demo.playCounts);
  const completedGames = playCounts.reduce<number>((total, count) => total + (count ?? 0), 0);
  const playedIds = new Set(Object.entries(player.demo.playCounts).filter(([, count]) => (count ?? 0) > 0).map(([id]) => id));
  const playedGenres = new Set(player.demo.config.games.filter((game) => playedIds.has(game.id)).map((game) => game.genre));
  const catalogGenres = new Set(player.demo.config.games.filter((game) => game.published !== false).map((game) => game.genre));
  switch (metric) {
    case 'first-finish': return completedGames;
    case 'ranked-games': return player.demo.sessions.filter((session) => session.mode === 'ranked' && session.finished).length;
    case 'games-played': return completedGames;
    case 'unique-games': return playedIds.size;
    case 'unique-genres': return playedGenres.size;
    case 'checkin-streak': return currentCheckinStreak(player, at);
    case 'high-score': return Math.max(0, ...Object.values(player.demo.scores).map((score) => score ?? 0));
    case 'campaign-joins': return player.demo.campaignJoinCount ?? 0;
    case 'campaign-completions': return player.demo.campaignCompletedCount ?? 0;
  }
}

export function getAchievementProgress(player: PlayerState, at = Date.now()): AchievementProgress[] {
  const unlocked = new Set(player.demo.achievements.map((badge) => badge.id));
  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const target = definition.metric === 'unique-genres'
      ? Math.max(1, new Set(player.demo.config.games.filter((game) => game.published !== false).map((game) => game.genre)).size)
      : definition.target;
    const resolvedDefinition = target === definition.target ? definition : { ...definition, target };
    const progress = Math.min(target, metricValue(player, definition.metric, at));
    const isUnlocked = unlocked.has(definition.id);
    const status: AchievementStatus = isUnlocked ? 'unlocked' : progress >= target ? 'completed' : progress > 0 ? 'in-progress' : 'locked';
    return { definition: resolvedDefinition, progress, unlocked: isUnlocked, status };
  });
}

export function evaluateAchievementEvent(
  player: PlayerState,
  event: AchievementEvent,
  at = Date.now(),
): { player: PlayerState; unlocked: AchievementDefinition[] } {
  const earned = new Set(player.demo.achievements.map((badge) => badge.id));
  const unlocked = getAchievementProgress(player, at)
    .filter(({ definition, progress }) => definition.events.includes(event.type) && progress >= definition.target && !earned.has(definition.id))
    .map(({ definition }) => definition);
  if (!unlocked.length) return { player, unlocked: [] };

  let next = player;
  for (const definition of unlocked) {
    const badge: ProfileBadge = { id: definition.id, title: definition.title, earnedAt: at };
    const rewardDetail = definition.reward ? ` · รางวัล ${definition.reward.title}` : ' · ได้รับ Badge';
    const notificationId = `achievement:${definition.id}`;
    next = {
      ...next,
      demo: {
        ...next.demo,
        achievements: [...next.demo.achievements.filter((item) => item.id !== badge.id), badge],
        history: [{ id: notificationId, kind: 'reward' as const, title: `Achievement · ${definition.title}`, detail: `ปลดล็อก Achievement · ${definition.description}${rewardDetail}`, at }, ...(next.demo.history ?? [])].slice(0, 250),
        notifications: [{ id: notificationId, title: `Achievement unlocked · ${definition.title}`, detail: `ปลดล็อก Achievement · ${definition.description}${rewardDetail}`, viewed: false, at }, ...(next.demo.notifications ?? []).filter((item) => item.id !== notificationId)],
      },
    };
  }
  return { player: next, unlocked };
}