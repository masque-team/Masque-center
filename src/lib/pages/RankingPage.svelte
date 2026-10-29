<script lang="ts">
  import { Trophy } from '@lucide/svelte';
  import Leaderboard from '../components/Leaderboard.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import GameButton from '../components/GameButton.svelte';
  import { getGameRanking } from '../services/rankingService';
  import type { GameId, PlayerState, RankingPeriod } from '../types';

  let { player, gameId = $bindable(), period = $bindable(), scores, onClaim }: {
    player: PlayerState;
    gameId: GameId;
    period: RankingPeriod;
    scores: Partial<Record<GameId, number>>;
    onClaim: (id: GameId) => void;
  } = $props();
  let claimed = $derived(player.demo.rankingClaims.includes(`${player.demo.config.rankingSeasonId}:${gameId}`));
  let score = $derived(player.demo.seasonScores[player.demo.config.rankingSeasonId]?.[gameId] ?? 0);
  let eligible = $derived(score > 0 && getGameRanking(gameId, 'weekly', player, score).findIndex((entry) => entry.isCurrentPlayer) < 3);
</script>

<div class="page-stack">
  <PageTitle eyebrow="GAME TOURNAMENT" title="Ranking" subtitle="อันดับแยกตามเกม · ตัวอย่างข้อมูล">
    {#snippet icon()}<Trophy size={26} fill="currentColor" />{/snippet}
  </PageTitle>
  <div class="flex flex-wrap items-center justify-between gap-3 border-y border-white py-3"><div><strong class="text-sm">{player.demo.config.rankingSeasonId}</strong><p class="text-xs text-[var(--g-muted)]">Top 3 · {player.demo.config.rankingPrize} MP · รางวัลจำลอง</p></div><GameButton size="sm" disabled={claimed || !eligible} onclick={() => onClaim(gameId)}>{claimed ? 'รับแล้ว' : 'รับรางวัล Season'}</GameButton></div>
  <Leaderboard bind:gameId bind:period {player} currentScore={scores[gameId] ?? 0} />
</div>
