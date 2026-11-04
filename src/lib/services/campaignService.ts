import type { Campaign, GameId, PlayerState, RankingEntry } from '../types';
import { demoNow, grantReward } from './demoService';
import { CAMPAIGNS } from '../data/campaigns';

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

export function campaignById(id: string, campaigns: Campaign[] = CAMPAIGNS): Campaign | undefined {
  return campaigns.find((campaign) => campaign.id === id);
}

export function getCampaignStatus(campaign: Campaign, now: number): 'upcoming' | 'live' | 'ended' {
  if (now < campaign.startAt) return 'upcoming';
  if (now >= campaign.endAt) return 'ended';
  return 'live';
}

export function campaignRankingGame(campaign: Campaign, selected: GameId | null): GameId | undefined {
  return selected && campaign.gameIds.includes(selected) ? selected : campaign.gameIds[0];
}

export function buyCampaignTicketPack(player: PlayerState, packId: string): PlayerState | null {
  const pack = player.demo.config.campaignTicketPacks.find((item) => item.id === packId);
  if (!pack || !Number.isSafeInteger(pack.quantity) || pack.quantity < 1 || !Number.isSafeInteger(pack.cost) || pack.cost < 0 || player.aisPoints < pack.cost) return null;
  return {
    ...player,
    aisPoints: player.aisPoints - pack.cost,
    demo: { ...player.demo, campaignTickets: (player.demo.campaignTickets ?? 0) + pack.quantity },
  };
}

export function beginCampaignGame(player: PlayerState, campaignId: string, gameId: GameId): PlayerState | null {
  const campaign = player.demo.config.campaigns.find((item) => item.id === campaignId);
  if (!campaign || getCampaignStatus(campaign, demoNow(player)) !== 'live' || campaign.entry === 'external' || campaign.launchMode === 'external' || !campaign.gameIds.includes(gameId) || player.demo.closedCampaigns?.includes(campaignId) || player.demo.settledCampaigns?.includes(campaignId)) return null;
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
  const campaign = player.demo.config.campaigns.find((item) => item.id === campaignId);
  if (!campaign?.gameIds.includes(gameId)) return [];
  const key = `${campaignId}:${gameId}`;
  const entries = (CAMPAIGN_FIXTURES[key] ?? []).map((entry) => ({ ...entry }));
  const best = player.demo.campaignScores?.[campaignId]?.[gameId];
  if (best) entries.push({ playerId: player.id, displayName: player.displayName, score: best.score, achievedAt: best.achievedAt, isCurrentPlayer: true });
  return entries.sort((left, right) => right.score - left.score || (left.achievedAt ?? Number.MAX_SAFE_INTEGER) - (right.achievedAt ?? Number.MAX_SAFE_INTEGER));
}

export function finalizeCampaign(player: PlayerState, campaignId: string, force = false, at = demoNow(player)): PlayerState | null {
  const campaign = player.demo.config.campaigns.find((item) => item.id === campaignId);
  if (!campaign || player.demo.settledCampaigns?.includes(campaignId)) return null;
  if (!force && getCampaignStatus(campaign, at) !== 'ended') return null;
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

export function settleExpiredCampaigns(player: PlayerState, now = demoNow(player)): PlayerState {
  let next = player;
  for (const campaign of player.demo.config.campaigns) {
    if (getCampaignStatus(campaign, now) !== 'ended' || next.demo.settledCampaigns?.includes(campaign.id)) continue;
    next = finalizeCampaign(next, campaign.id, false, now) ?? next;
  }
  return next;
}

export function markNotificationViewed(player: PlayerState, id: string): PlayerState {
  return {
    ...player,
    demo: { ...player.demo, notifications: (player.demo.notifications ?? []).map((item) => item.id === id ? { ...item, viewed: true } : item) },
  };
}
