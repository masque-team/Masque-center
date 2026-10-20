<script lang="ts">
  import { Play, Zap } from '@lucide/svelte';
  import GameTag from './GameTag.svelte';
  import { ENERGY_CONFIG } from '../data/config';
  import type { Game } from '../types';

  let { game, vipActive, onclick }: { game: Game; vipActive: boolean; onclick: () => void } = $props();
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

<button class="featured" {onclick} aria-label={`เล่น ${game.name}`}>
  <span class="art">
    {#if game.cover}<img src={`images/${game.cover}`} alt="" loading="eager" fetchpriority="high" onerror={useFallback} />{/if}
    <span class="shade"></span>
    <span class="glints" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i></span>
    <span class="top">
      <GameTag tag={game.editorialTag ?? 'hot'} size="lg" />
      <span class="cost"><Zap size={13} fill="currentColor" />{vipActive ? '∞' : ENERGY_CONFIG.costPerGame}</span>
    </span>
  </span>

  <span class="bar">
    <span class="copy">
      <span class="kicker">เกมแนะนำวันนี้</span>
      <strong>{game.name}</strong>
      <span class="desc">{game.description}</span>
    </span>
    <span class="play"><span class="play-face"><Play size={18} fill="currentColor" />PLAY</span></span>
  </span>
</button>

<style>
  .featured {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0;
    overflow: hidden;
    border: 3px solid #fff;
    border-radius: 26px;
    background: linear-gradient(180deg, #5a3fc8, #3a2590);
    box-shadow: 0 0 0 2.5px #f6c453, 0 9px 0 -3px #b9871c, 0 16px 28px rgb(90 60 20 / 30%), 0 0 26px rgb(255 205 90 / 45%);
    color: #fff;
    text-align: left;
    cursor: pointer;
    isolation: isolate;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.12s ease;
    animation: pop-in 0.5s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }
  .featured:active { transform: translateY(3px) scale(0.99); }
  .featured:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }

  .art { position: relative; display: block; height: clamp(150px, 46vw, 190px); overflow: hidden; background: #7a5ce0; }
  .art img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: 50% 40%; animation: drift 9s ease-in-out infinite alternate; }
  .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgb(36 22 90 / 30%) 0%, transparent 28%, transparent 78%, rgb(58 37 144 / 70%) 100%); }
  .glints i { position: absolute; color: #fff7c2; font-style: normal; text-shadow: 0 0 10px #ffd34d; animation: twinkle 2.4s ease-in-out infinite; }
  .glints i:nth-child(1) { top: 24%; right: 10%; font-size: 20px; }
  .glints i:nth-child(2) { top: 60%; left: 7%; font-size: 14px; animation-delay: 0.8s; }
  .glints i:nth-child(3) { top: 14%; left: 42%; font-size: 12px; animation-delay: 1.5s; }

  .top { position: absolute; top: 10px; right: 10px; left: 10px; display: flex; align-items: flex-start; justify-content: space-between; }
  .top :global(.tag) { animation: sticker 2.4s ease-in-out infinite; }
  .cost { display: inline-flex; align-items: center; gap: 3px; padding: 5px 10px; border: 1.5px solid rgb(255 255 255 / 80%); border-radius: 99px; color: #fff4c4; background: rgb(40 24 100 / 62%); font-size: 12px; font-weight: 900; }

  .bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px 14px 14px; background: linear-gradient(180deg, #5a3fc8, #4a31a8); }
  .copy { display: grid; min-width: 0; gap: 1px; }
  .kicker { color: #ffe68a; font-size: 11px; font-weight: 900; letter-spacing: 0.4px; }
  strong { overflow: hidden; font-size: clamp(18px, 5.2vw, 22px); font-weight: 900; line-height: 1.2; text-overflow: ellipsis; text-shadow: 0 2px 0 rgb(30 15 80 / 60%); white-space: nowrap; }
  .desc { overflow: hidden; color: #e4dcff; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }

  .play { flex: 0 0 auto; padding-bottom: 5px; border-radius: 17px; background: #c4770d; box-shadow: 0 7px 14px rgb(20 10 60 / 40%); transition: transform 0.08s ease, padding 0.08s ease; }
  .play-face { position: relative; display: inline-flex; align-items: center; gap: 6px; min-height: 50px; padding: 0 18px 0 14px; overflow: hidden; border: 2px solid #fff8d2; border-radius: 15px; color: #6b3d00; background: linear-gradient(180deg, #fff09a, #ffb42b); box-shadow: inset 0 2px 0 rgb(255 255 255 / 60%); font-size: 18px; font-weight: 900; letter-spacing: 0.5px; animation: pulse 2s ease-in-out infinite; }
  .play-face::after { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 35%, rgb(255 255 255 / 70%) 50%, transparent 65%); transform: translateX(-120%); animation: sweep 3s ease-in-out infinite; }
  .featured:active .play { transform: translateY(3px); padding-bottom: 2px; }

  @keyframes pop-in { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: none; } }
  @keyframes drift { from { transform: scale(1); } to { transform: scale(1.05); } }
  @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  @keyframes sticker { 0%, 100% { transform: rotate(-3deg) scale(1); } 50% { transform: rotate(-1deg) scale(1.06); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
  @keyframes sweep { 0%, 50% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
  @media (prefers-reduced-motion: reduce) {
    .featured, .art img, .glints i, .top :global(.tag), .play-face, .play-face::after { animation: none; }
  }
  @media (max-width: 340px) {
    .play-face { min-height: 46px; padding: 0 12px 0 10px; font-size: 15px; }
    .bar { gap: 6px; padding-left: 12px; }
  }
</style>
