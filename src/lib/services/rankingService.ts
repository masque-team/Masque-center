import { MOCK_RANKINGS } from '../data/mockRankings';
import type { GameId, PlayerState, RankingEntry, RankingPeriod } from '../types';

export function getGameRanking(
  gameId: GameId,
  period: RankingPeriod,
  player: PlayerState,
  currentScore: number,
): RankingEntry[] {
  const multiplier = period === 'allTime' ? 3 : 1;
  const entries = (MOCK_RANKINGS[gameId] ?? []).map((entry) => ({
    ...entry,
    score: period === 'weekly' && player.demo.rankingResets.includes(player.demo.config.rankingSeasonId) ? 0 : entry.score * multiplier,
  }));
  entries.push({
    playerId: player.id,
    displayName: player.displayName,
    score: period === 'allTime' ? player.demo.scores[gameId] ?? currentScore : player.demo.seasonScores[player.demo.config.rankingSeasonId]?.[gameId] ?? 0,
    isCurrentPlayer: true,
  });
  return entries.sort((left, right) => right.score - left.score);
}