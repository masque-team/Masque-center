<script lang="ts">
  import { Play, Zap } from '@lucide/svelte';
  import GameTag from './GameTag.svelte';
  import { ENERGY_CONFIG } from '../data/config';
  import type { Game } from '../types';

  let { game, vipActive, index, onclick }: { game: Game; vipActive: boolean; index: number; onclick: () => void } = $props();
  let fallbackTried = $state(false);

  function useFallback(event: Event): void {
    const image = event.currentTarget;
    if (!(image instanceof HTMLImageElement)) return;
    if (game.fallbackCover && !fallbackTried) {
      fallbackTried = true;
      image.src = game.fallbackCover;
    } else {
      image.hidden = true;
    }
  }
</script>

<button class="card" style={`--i:${index}`} {onclick} aria-label={`เล่น ${game.name}`}>
  <span class="cover">
    {#if game.cover}
      <img src={`images/${game.cover}`} alt="" loading={index < 2 ? 'eager' : 'lazy'} decoding="async" onerror={useFallback} />
    {:else}
      <span class="pairs" aria-hidden="true">
        <i class="pc a">?</i><i class="pc b">♥</i><i class="pc c">♥</i><i class="pc d">?</i>
      </span>
    {/if}
    {#if game.editorialTag}<span class="tag-slot"><GameTag tag={game.editorialTag} /></span>{/if}
    <span class="go" aria-hidden="true"><Play size={16} fill="currentColor" /></span>
  </span>
  <span class="info">
    <strong>{game.name}</strong>
    <span class="meta">
      <span class="genre">{game.genre}</span>
      <span class="cost"><Zap size={12} fill="currentColor" />{vipActive ? '∞' : ENERGY_CONFIG.costPerGame}</span>
    </span>
  </span>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 0 0 4px;
    overflow: hidden;
    border: 0;
    border-radius: 20px;
    background: #cfc3f2;
    box-shadow: 0 8px 14px rgb(70 50 150 / 18%);
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.1s ease, padding 0.1s ease;
    animation: card-in 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) both;
    animation-delay: calc(var(--i) * 55ms + 120ms);
  }
  .card:active { transform: translateY(3px); padding-bottom: 1px; }
  .card:focus-visible { outline: 3px solid #7a5ce0; outline-offset: 2px; }

  .cover { position: relative; display: block; aspect-ratio: 1 / 0.86; overflow: hidden; border: 2.5px solid #fff; border-bottom: 0; border-radius: 18px 18px 0 0; background: linear-gradient(145deg, #86d4f5, #8a7ee3); }
  .cover img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: 50% 42%; }
  .tag-slot { position: absolute; top: 8px; left: 7px; }
  .go { position: absolute; right: 7px; bottom: 7px; display: grid; place-items: center; width: 30px; height: 30px; border: 2px solid #fff; border-radius: 11px; color: #6b3d00; background: linear-gradient(180deg, #fff09a, #ffb42b); box-shadow: 0 3px 0 #c4770d, 0 5px 8px rgb(40 20 0 / 30%); }

  .pairs { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-content: center; padding: 12px 20px; background: radial-gradient(circle at 70% 20%, #ffe9a0 0 10%, transparent 11%), linear-gradient(150deg, #7fd3f3, #8c7fe6 70%, #c18cf0); }
  .pc { display: grid; place-items: center; min-height: 40px; border: 2px solid #fff; border-radius: 10px; font-size: 20px; font-style: normal; font-weight: 900; box-shadow: 0 3px 0 rgb(60 40 140 / 35%); }
  .pc.a, .pc.d { color: #fff; background: linear-gradient(160deg, #a78bfa, #6a4fd6); }
  .pc.b, .pc.c { color: #ff6f8e; background: #fff; }
  .pc.a { transform: rotate(-6deg); }
  .pc.d { transform: rotate(5deg); }

  .info { display: grid; gap: 4px; padding: 8px 10px 8px; border-radius: 0 0 16px 16px; background: linear-gradient(180deg, #fff, #f6f2ff); }
  strong { overflow: hidden; color: #2b2468; font-size: 14px; font-weight: 900; line-height: 1.25; text-overflow: ellipsis; white-space: nowrap; }
  .meta { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .genre { color: #7a6fc0; font-size: 11px; font-weight: 800; }
  .cost { display: inline-flex; align-items: center; gap: 2px; padding: 2px 7px; border-radius: 99px; color: #8a5a06; background: #fff0c2; font-size: 11px; font-weight: 900; }

  @keyframes card-in { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .card { animation: none; } }
  @media (max-width: 340px) { strong { font-size: 13px; } .pairs { padding: 10px 14px; } }
</style>
