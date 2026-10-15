<script lang="ts">
  import { Crown, Medal, Trophy } from '@lucide/svelte';
  import { GAMES } from '../data/games';
  import { getGameRanking } from '../services/rankingService';
  import type { GameId, PlayerState, RankingPeriod } from '../types';

  let {
    gameId = $bindable(),
    period = $bindable(),
    player,
    currentScore,
    compact = false,
  }: {
    gameId: GameId;
    period: RankingPeriod;
    player: PlayerState;
    currentScore: number;
    compact?: boolean;
  } = $props();

  let activeTab = $state<'top' | 'near'>('top');
  let rows = $derived(getGameRanking(gameId, period, player, currentScore));
  let myPosition = $derived(rows.findIndex((entry) => entry.isCurrentPlayer));
  let displayedRows = $derived.by(() => {
    if (compact || activeTab === 'top') return rows.slice(0, compact ? 3 : 6);
    return rows.slice(Math.max(0, myPosition - 2), myPosition + 3);
  });
</script>

<section class:compact class="leaderboard-panel" aria-label="Leaderboard">
  {#if !compact}
    <div class="leaderboard-controls">
      <label class="game-select-label" for="ranking-game">เกม</label>
      <select id="ranking-game" value={gameId} onchange={(event) => (gameId = event.currentTarget.value as GameId)}>
        {#each GAMES as game (game.id)}<option value={game.id}>{game.name}</option>{/each}
      </select>
      <div class="period-switch" aria-label="ช่วงเวลา">
        <button class:selected={period === 'weekly'} aria-pressed={period === 'weekly'} onclick={() => (period = 'weekly')}>รายสัปดาห์</button>
        <button class:selected={period === 'allTime'} aria-pressed={period === 'allTime'} onclick={() => (period = 'allTime')}>ตลอดกาล</button>
      </div>
    </div>
    <div class="ranking-tabs" role="tablist" aria-label="มุมมองอันดับ">
      <button class:selected={activeTab === 'top'} role="tab" aria-selected={activeTab === 'top'} onclick={() => (activeTab = 'top')}>Top Players</button>
      <button class:selected={activeTab === 'near'} role="tab" aria-selected={activeTab === 'near'} onclick={() => (activeTab = 'near')}>Near Me</button>
      <span class="my-rank-chip">My Rank <b>#{myPosition + 1}</b></span>
    </div>
  {/if}
  <div class="ranking-list">
    {#each displayedRows as entry, index (entry.playerId)}
      {@const rank = activeTab === 'near' && !compact ? Math.max(0, myPosition - 2) + index + 1 : index + 1}
      <div class:my-row={entry.isCurrentPlayer} class="ranking-row">
        <span class:gold-rank={rank === 1} class:silver-rank={rank === 2} class:bronze-rank={rank === 3} class="rank-number">
          {#if rank === 1}<Trophy size={16} fill="currentColor" />{:else if rank === 2 || rank === 3}<Medal size={16} />{:else}{rank}{/if}
        </span>
        <span class="rank-name">{entry.displayName}{#if entry.isCurrentPlayer}<small>คุณ</small>{/if}</span>
        <strong class="rank-score">{entry.score.toLocaleString('en-US')}</strong>
      </div>
    {/each}
  </div>
  {#if !compact}<p class="ranking-disclaimer"><Crown size={13} /> คะแนนเป็นตัวอย่างแยกตามเกม ยังไม่เชื่อมต่อคะแนนจริง</p>{/if}
</section>