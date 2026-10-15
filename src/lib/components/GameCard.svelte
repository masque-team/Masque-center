<script lang="ts">
  import { ArrowUpRight, Crown, Play, Sparkles } from '@lucide/svelte';
  import type { Game } from '../types';

  let { game, passActive, index, onclick }: {
    game: Game;
    passActive: boolean;
    index: number;
    onclick: () => void;
  } = $props();

  function useFallback(event: Event): void {
    const image = event.currentTarget;
    if (!(image instanceof HTMLImageElement)) return;
    if (image.dataset.fallbackTried !== 'true') {
      image.dataset.fallbackTried = 'true';
      image.src = game.fallbackCover;
    } else {
      image.hidden = true;
    }
  }
</script>

<button class:rank-card={passActive} class="game-card" style={`--card-index:${index}`} onclick={onclick} aria-label={`เล่นเกม ${game.name}`}>
  <span class="cover-wrap">
    <img src={`images/${game.cover}`} alt={`ภาพปกเกม ${game.name}`} loading="lazy" onerror={useFallback} />
    <span class="cover-shade"></span>
    <span class="game-badge"><Sparkles size={11} fill="currentColor" />{game.badge}</span>
    {#if passActive}<span class="rank-tag"><Crown size={11} fill="currentColor" />RANK ON</span>{:else}<span class="free-tag">FREE PLAY</span>{/if}
    <span class="play-fab"><Play size={17} fill="currentColor" /></span>
  </span>
  <span class="game-card-copy">
    <span class="game-card-title">{game.name}</span>
    <span class="game-card-desc">{game.description}</span>
    <span class="game-card-genre">{game.genre}<ArrowUpRight size={13} /></span>
  </span>
</button>