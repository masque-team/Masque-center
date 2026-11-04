import { CAMPAIGNS } from '../data/campaigns';
import type { Campaign, GameId, PlayerState, RankingEntry } from '../types';
import { demoNow, grantReward } from './demoService';

const CAMPAIGN_FIXTURES: Record<string, RankingEntry[]> = {
  'lantern-festival:bird': [
    { playerId: 'alice', displayName: 'Alice', score: 14200, achievedAt: Date.UTC(2026, 10, 1, 8) },
    { playerId: 'bob', displayName: 'Bob', score: 11800, achievedAt: Date.UTC(2026, 10, 2, 9) },
  ],
  'lantern-festival:memory': [
    { playerId: 'alice', displayName: 'Alice', score: 22, achievedAt: Date.UTC(2026, 10, 1, 8) },
    { playerId: 'bob', displayName: 'Bob', score: 18, achievedAt: Date.UTC(2026, 10, 2, 9) },
  ],
  'starlight-sprint:run': [
    { playerId: 'alice', displayName: 'Alice', score: 8100, achievedAt: Date.UTC(2026, 10, 1, 8) },
    { playerId: 'bob', displayName: 'Bob', score: 6900, achievedAt: Date.UTC(2026, 10, 2, 9) },
  ],
  'starlight-sprint:mole': [
    { playerId: 'alice', displayName: 'Alice', score: 2600, achievedAt: Date.UTC(2026, 10, 1, 8) },
    { playerId: 'bob', displayName: 'Bob', score: 2100, achievedAt: Date.UTC(2026, 10, 2, 9) },
  ],
};

export function campaignById(id: string): Campaign | undefined {
  return CAMPAIGNS.find((campaign) => campaign.id === id);
}

export function beginCampaignGame(player: PlayerState, campaignId: string, gameId: GameId): PlayerState | null {
  const campaign = campaignById(campaignId);
  if (!campaign || !campaign.gameIds.includes(gameId) || player.demo.closedCampaigns?.includes(campaignId)) return null;
  if (!player.demo.config.games.some((game) => game.id === gameId && game.published !== false)) return null;
  const tickets = player.demo.campaignTickets ?? 0;
  if (campaign.entry === 'ticket' && tickets < campaign.ticketCost) return null;
  const session = { id: crypto.randomUUID(), gameId, mode: 'campaign' as const, campaignId, startedAt: demoNow(player), finished: false, reward: { points: 0, xp: 40 } };
  return {
    ...player,
    demo: {
      ...player.demo,
      campaignTickets: campaign.entry === 'ticket' ? tickets - campaign.ticketCost : tickets,
      sessions: [...player.demo.sessions, session].slice(-100),
    },
  };
}

export function getCampaignRanking(campaignId: string, gameId: GameId, player: PlayerState): RankingEntry[] {
  const key = `${campaignId}:${gameId}`;
  const entries = (CAMPAIGN_FIXTURES[key] ?? []).map((entry) => ({ ...entry }));
  const best = player.demo.campaignScores?.[campaignId]?.[gameId];
  if (best) entries.push({ playerId: player.id, displayName: player.displayName, score: best.score, achievedAt: best.achievedAt, isCurrentPlayer: true });
  return entries.sort((left, right) => right.score - left.score || (left.achievedAt ?? Number.MAX_SAFE_INTEGER) - (right.achievedAt ?? Number.MAX_SAFE_INTEGER));
}

export function finalizeCampaign(player: PlayerState, campaignId: string): PlayerState | null {
  const campaign = campaignById(campaignId);
  if (!campaign || player.demo.settledCampaigns?.includes(campaignId)) return null;
  let next = player;
  const awarded: string[] = [];
  for (const gameId of campaign.gameIds) {
    const ranking = getCampaignRanking(campaignId, gameId, next);
    const rank = ranking.findIndex((entry) => entry.isCurrentPlayer) + 1;
    if (!rank) continue;
    const tier = campaign.rewards.find((reward) => rank >= reward.fromRank && rank <= reward.toRank);
    if (!tier) continue;
    for (const reward of tier.rewards) {
      next = grantReward(next, reward);
      awarded.push(`${gameId}: ${reward.title}`);
    }
  }
  const at = demoNow(player);
  const detail = awarded.length ? awarded.join(' · ') : 'ไม่มีรางวัลตามอันดับในรอบนี้';
  const notification = { id: `campaign:${campaignId}`, title: `สรุปผล ${campaign.title}`, detail, viewed: false, at };
  return {
    ...next,
    demo: {
      ...next.demo,
      closedCampaigns: [...new Set([...(next.demo.closedCampaigns ?? []), campaignId])],
      settledCampaigns: [...new Set([...(next.demo.settledCampaigns ?? []), campaignId])],
      notifications: [notification, ...(next.demo.notifications ?? []).filter((item) => item.id !== notification.id)],
      history: [{ id: `settlement:${campaignId}`, kind: 'reward' as const, title: `รางวัล ${campaign.title}`, detail, at }, ...(next.demo.history ?? [])].slice(0, 250),
    },
  };
}

export function markNotificationViewed(player: PlayerState, id: string): PlayerState {
  return {
    ...player,
    demo: { ...player.demo, notifications: (player.demo.notifications ?? []).map((item) => item.id === id ? { ...item, viewed: true } : item) },
  };
}
