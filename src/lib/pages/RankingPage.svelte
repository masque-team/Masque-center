<script lang="ts">
  import { Trophy } from '@lucide/svelte';
  import Leaderboard from '../components/Leaderboard.svelte';
  import PageTitle from '../components/PageTitle.svelte';
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
  <PageTitle eyebrow="ALL-TIME HIGH SCORE" title="Ranking" subtitle="อันดับคะแนนสูงสุดแยกตามเกม · คะแนนเท่ากันตัดสินที่เวลาที่ทำได้ก่อน">
    {#snippet icon()}<Trophy size={26} fill="currentColor" />{/snippet}
  </PageTitle>
  <Leaderboard bind:gameId bind:period {player} currentScore={scores[gameId] ?? 0} />
</div>
