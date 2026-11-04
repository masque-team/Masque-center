import { MOCK_RANKINGS } from '../data/mockRankings';
import type { GameId, PlayerState, RankingEntry, RankingPeriod } from '../types';

export function getGameRanking(
  gameId: GameId,
  _period: RankingPeriod,
  player: PlayerState,
  currentScore: number,
): RankingEntry[] {
  const entries = (MOCK_RANKINGS[gameId] ?? []).map((entry, index) => ({
    ...entry,
    achievedAt: entry.achievedAt ?? Date.UTC(2026, 0, 1, 0, 0, index),
  }));
  entries.push({
    playerId: player.id,
    displayName: player.displayName,
    score: player.demo.scores[gameId] ?? currentScore,
    achievedAt: player.demo.scoreTimes?.[gameId] ?? Number.MAX_SAFE_INTEGER,
    isCurrentPlayer: true,
  });
  return entries.sort((left, right) => right.score - left.score || (left.achievedAt ?? Number.MAX_SAFE_INTEGER) - (right.achievedAt ?? Number.MAX_SAFE_INTEGER));
}