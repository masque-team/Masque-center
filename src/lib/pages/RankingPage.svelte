<script lang="ts">
  import { Trophy } from '@lucide/svelte';
  import Leaderboard from '../components/Leaderboard.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import { getGameRanking } from '../services/rankingService';
  import type { GameId, PlayerState, RankingPeriod } from '../types';

  let { player, gameId = $bindable(), period = $bindable(), scores, onClaim: _onClaim }: {
    player: PlayerState;
    gameId: GameId;
    period: RankingPeriod;
    scores: Partial<Record<GameId, number>>;
    onClaim: (id: GameId) => void;
  } = $props();
</script>

<div class="page-stack">
  <PageTitle eyebrow="ALL-TIME HIGH SCORE" title="Ranking" subtitle="อันดับคะแนนสูงสุดแยกตามเกม · คะแนนเท่ากันผู้ทำได้ก่อนอยู่อันดับสูงกว่า">
    {#snippet icon()}<Trophy size={26} fill="currentColor" />{/snippet}
  </PageTitle>
  <div class="border-y border-white py-3"><strong class="text-sm">{player.demo.config.games.find((game) => game.id === gameId)?.name ?? gameId}</strong><p class="text-xs text-[var(--g-muted)]">Leaderboard ตลอดกาล · mock players</p></div>
  <Leaderboard bind:gameId bind:period {player} currentScore={scores[gameId] ?? 0} />
</div>
