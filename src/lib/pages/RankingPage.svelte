<script lang="ts">
  import { Trophy } from '@lucide/svelte';
  import Leaderboard from '../components/Leaderboard.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import type { GameId, PlayerState, RankingPeriod } from '../types';

  let { player, gameId = $bindable(), period = $bindable(), scores }: {
    player: PlayerState;
    gameId: GameId;
    period: RankingPeriod;
    scores: Record<GameId, number>;
  } = $props();
</script>

<div class="page-stack">
  <PageTitle eyebrow="GAME TOURNAMENT" title="Ranking" subtitle="อันดับแยกตามเกม · ตัวอย่างข้อมูล">
    {#snippet icon()}<Trophy size={26} fill="currentColor" />{/snippet}
  </PageTitle>
  <Leaderboard bind:gameId bind:period {player} currentScore={scores[gameId]} />
</div>
