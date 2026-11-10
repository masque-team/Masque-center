<script lang="ts">
  import { House, Play, Trophy } from '@lucide/svelte';
  import GameButton from '../components/GameButton.svelte';
  import type { Game, PlayerState } from '../types';

  let { game, player, score, bestScore, onReplay, onHome }: {
    game: Game;
    player: PlayerState;
    score: number;
    bestScore: number;
    onReplay: () => void;
    onHome: () => void;
  } = $props();

  let artwork = $derived(game.id === 'mole'
    ? 'assets/ui-redesign/gameflow/mole-gameover-victory.jpg'
    : game.cover ? `images/${game.cover}` : 'assets/ui-redesign/gameflow/mole-gameover-victory.jpg');
</script>

<section class="game-over" aria-label="สรุปผลเกม">
  <div class="result-art">
    <img src={artwork} alt="ฉลองจบเกม" />
  </div>
  <div class="result-card">
    <span class="player-name">{player.displayName}</span>
    <h1>คะแนนรอบนี้</h1>
    <strong class="result-score">{score.toLocaleString('en-US')}</strong>
    <div class="result-best">
      <Trophy size={21} fill="currentColor" />
      <b>สถิติสูงสุด</b>
      <strong>{Math.max(score, bestScore).toLocaleString('en-US')}</strong>
      <small>คะแนน</small>
    </div>
  </div>
  <GameButton variant="purple" size="lg" block onclick={onReplay}>
    <Play size={19} fill="currentColor" /> เล่นอีกครั้ง <span class="energy-cost">⚡ 1 Energy</span>
  </GameButton>
  <GameButton variant="ghost" size="lg" block onclick={onHome}>
    <House size={19} fill="currentColor" /> กลับหน้าหลัก
  </GameButton>
</section>

<style>
  .game-over { display: grid; gap: 12px; padding: 2px 2px 16px; }
  .result-art { overflow: hidden; aspect-ratio: 1.55; border: 2px solid #fff; border-radius: 22px; background: #e4f4ff; box-shadow: 0 4px 0 #b8cbe2; }
  .result-art img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
  .result-card { display: grid; justify-items: center; gap: 2px; padding: 11px 12px; border: 2px solid #fff; border-radius: 20px; background: linear-gradient(160deg, #fff 0%, #fff8eb 100%); box-shadow: 0 4px 0 #e7d8c6; text-align: center; }
  .player-name { padding: 3px 20px; border-radius: 99px; color: #4a2473; background: #f0ddff; font-size: 15px; font-weight: 1000; }
  h1 { margin: 3px 0 0; color: #2f1a4d; font-size: 17px; font-weight: 1000; }
  .result-score { color: #6712bd; font-size: 52px; font-weight: 1000; line-height: 1.08; text-shadow: 0 3px 0 #dfc7ff; font-variant-numeric: tabular-nums; }
  .result-best { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; margin-top: 5px; padding-top: 8px; border-top: 1px solid #dcc5f6; color: #5b4080; font-size: 11px; }
  .result-best :global(svg) { color: #f2ae19; }
  .result-best strong { color: #35145f; font-size: 18px; font-variant-numeric: tabular-nums; }
  .result-best small { color: #78688e; }
  .energy-cost { display: block; margin-top: -3px; font-size: 10px; font-weight: 800; }
  @media (max-width: 350px) { .game-over { gap: 9px; } .result-score { font-size: 44px; } .result-card { padding: 8px; } }
</style>