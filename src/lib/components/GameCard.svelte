<script lang="ts">
  import { Play, Users, Zap } from '@lucide/svelte';
  import GameTag from './GameTag.svelte';
  import { ENERGY_CONFIG } from '../data/config';
  import type { Game } from '../types';

  let { game, vipActive, energyCost = ENERGY_CONFIG.costPerGame, index, onclick }: { game: Game; vipActive: boolean; energyCost?: number; index: number; onclick: () => void } = $props();
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
  <span class="cover" class:logo={game.id === 'memory'}>
    {#if game.cover}
      <img src={`images/${game.cover}`} alt="" loading={index < 2 ? 'eager' : 'lazy'} decoding="async" onerror={useFallback} />
    {:else}
      <span class="pairs" aria-hidden="true">
        <i class="pc a">?</i><i class="pc b">♥</i><i class="pc c">♥</i><i class="pc d">?</i>
      </span>
    {/if}
    {#if game.editorialTag}<span class="tag-slot"><GameTag tag={game.editorialTag} /></span>{/if}
    <span class="online-slot"><Users size={10} />{((game.onlineBase ?? 1200) + (index + 1) * 7).toLocaleString()}</span>
    <span class="go" aria-hidden="true"><Play size={16} fill="currentColor" /></span>
  </span>
  <span class="info">
    <strong>{game.name}</strong>
    <span class="meta">
      <span class="genre">{game.genre}</span>
      <span class="cost"><Zap size={11} fill="currentColor" />{vipActive ? 'ฟรี' : energyCost}</span>
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
    border-radius: 22px;
    background: #9bcdf0;
    box-shadow: 0 8px 16px rgb(24 92 160 / 16%);
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.1s ease, padding 0.1s ease;
    animation: card-in 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) both;
    animation-delay: calc(var(--i) * 55ms + 120ms);
  }
  .card:active { transform: translateY(3px); padding-bottom: 1px; }
  .card:focus-visible { outline: 3px solid #0ea5e9; outline-offset: 2px; }

  .cover { position: relative; display: block; aspect-ratio: 1 / 0.86; overflow: hidden; border: 2.5px solid #fff; border-bottom: 0; border-radius: 20px 20px 0 0; background: linear-gradient(145deg, #86d4f5, #38bdf8); }
  .cover img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: 50% 42%; }
  .cover.logo { background: #fffdf7; }
  .cover.logo img { object-fit: contain; object-position: center; }
  .tag-slot { position: absolute; top: 8px; left: 7px; }
  .online-slot {
    position: absolute;
    top: 8px;
    right: 7px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 7px;
    border-radius: 99px;
    border: 1.5px solid rgb(255 255 255 / 85%);
    background: rgb(15 42 82 / 64%);
    backdrop-filter: blur(6px);
    color: #f0f9ff;
    font-size: 9.5px;
    font-weight: 900;
  }
  .go { position: absolute; right: 7px; bottom: 7px; display: grid; place-items: center; width: 31px; height: 31px; border: 2px solid #fff; border-radius: 12px; color: #6b3d00; background: linear-gradient(180deg, #fff09a, #ffb42b); box-shadow: 0 3px 0 #c4770d, 0 5px 8px rgb(40 20 0 / 30%); }

  .pairs { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-content: center; padding: 12px 20px; background: radial-gradient(circle at 70% 20%, #ffe9a0 0 10%, transparent 11%), linear-gradient(150deg, #7fd3f3, #38bdf8 70%, #93c5fd); }
  .pc { display: grid; place-items: center; min-height: 40px; border: 2px solid #fff; border-radius: 10px; font-size: 20px; font-style: normal; font-weight: 900; box-shadow: 0 3px 0 rgb(20 68 130 / 30%); }
  .pc.a, .pc.d { color: #fff; background: linear-gradient(160deg, #38bdf8, #0284c7); }
  .pc.b, .pc.c { color: #ff6f8e; background: #fffdf7; }
  .pc.a { transform: rotate(-6deg); }
  .pc.d { transform: rotate(5deg); }

  .info { display: grid; gap: 4px; padding: 8px 10px 9px; border: 2.5px solid #fff; border-top: 0; border-radius: 0 0 19px 19px; background: linear-gradient(180deg, #fffdf7, #f0f9ff); }
  strong { overflow: hidden; color: #1f305e; font-size: 13.5px; font-weight: 900; line-height: 1.25; text-overflow: ellipsis; white-space: nowrap; }
  .meta { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .genre { color: #0284c7; font-size: 11px; font-weight: 800; }
  .cost { display: inline-flex; align-items: center; gap: 2px; padding: 2px 7px; border-radius: 99px; border: 1px solid #fde68a; color: #8a5a06; background: #fff4c2; font-size: 10.5px; font-weight: 900; }

  @keyframes card-in { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .card { animation: none; } }
  @media (max-width: 340px) { strong { font-size: 13px; } .pairs { padding: 10px 14px; } }
</style>
