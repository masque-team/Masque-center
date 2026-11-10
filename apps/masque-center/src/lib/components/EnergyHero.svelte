<script lang="ts">
  import { Clock3, Crown, Zap } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import GameButton from './GameButton.svelte';
  import { AVATARS, PETS } from '../data/config';
  import { energyCapacity } from '../services/energyService';
  import type { PlayerState } from '../types';

  let { player, vipActive, countdown, onRefill, onVip }: {
    player: PlayerState;
    vipActive: boolean;
    countdown: string;
    onRefill: () => void;
    onVip: () => void;
  } = $props();

  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === player.petId));
  let isVipLook = $derived(vipActive || avatar.rarity === 'VIP');
  let max = $derived(energyCapacity(player, vipActive));
  let percent = $derived(Math.min(100, (player.energy / max) * 100));
  let full = $derived(player.energy >= max);
</script>

<section class="hero" class:vip={vipActive} aria-label="Energy">
  <span class="spark s1" aria-hidden="true">✦</span>
  <span class="spark s2" aria-hidden="true">✧</span>
  <span class="cloud c1" aria-hidden="true"></span>

  <div class="mascot" class:vip={isVipLook} aria-hidden="true">
    {#if isVipLook}<span class="mascot-aura"></span>{/if}
    <AssetPortrait src={avatar.imagePath} alt="" placeholder={avatar.placeholder} kind="avatar" loading="eager" className="hero-avatar" />
    {#if pet}<AssetPortrait src={pet.imagePath} alt="" placeholder={pet.placeholder} kind="pet" loading="eager" className="hero-pet" />{/if}
  </div>

  <h1>{vipActive ? 'VIP พร้อมเข้าเกม!' : full ? 'พลังเต็ม ลุยเลย!' : 'พร้อมลุยหรือยัง?'}</h1>

  <div class="energy">
    <div class="row">
      <span class="bolt"><Zap size={20} fill="currentColor" /></span>
      <div class="count">
        <b class:vip-number={vipActive}>{player.energy}</b><small>/{max}</small>
      </div>
      <span class="timer">
        {#if full}พลังเต็ม
        {:else}<Clock3 size={13} />+1 ใน {countdown}{/if}
      </span>
    </div>

    <div class="row controls">
      <div class="bar" role="progressbar" aria-label="Energy" aria-valuemin="0" aria-valuemax={max} aria-valuenow={Math.min(max, player.energy)}>
        <span class="fill" style={`width:${percent}%`}></span>
      </div>
      <GameButton variant="gold" size="sm" label="เติม Energy" onclick={onRefill}><Zap size={14} fill="currentColor" />เติม</GameButton>
      {#if vipActive}
        <GameButton variant="ghost" size="sm" label="VIP Benefits" onclick={onVip}><Crown size={14} fill="currentColor" />VIP</GameButton>
      {:else}
        <GameButton variant="purple" size="sm" label="เปิด VIP Pass" onclick={onVip}><Crown size={14} fill="currentColor" />VIP</GameButton>
      {/if}
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
    margin-top: 4px;
    padding: 10px 10px 12px;
    overflow: hidden;
    border: 2.5px solid #fff;
    border-radius: 24px;
    background: linear-gradient(150deg, #bfe6ff 0%, #d9ccff 55%, #f1d7ff 100%);
    box-shadow: 0 9px 0 -4px #a995e6, 0 14px 22px rgb(80 60 170 / 22%);
    isolation: isolate;
    animation: hero-in 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }
  .hero.vip { background: linear-gradient(150deg, #fff3bf 0%, #ffe0a0 45%, #e6d3ff 100%); box-shadow: 0 9px 0 -4px #e2b24f, 0 14px 26px rgb(210 150 40 / 30%); }

  .cloud { position: absolute; z-index: -1; top: 14px; left: -14px; width: 74px; height: 26px; border-radius: 99px; background: rgb(255 255 255 / 70%); }
  .cloud::before { content: ''; position: absolute; top: -12px; left: 14px; width: 28px; height: 28px; border-radius: 50%; background: inherit; }
  .spark { position: absolute; z-index: -1; color: #fff; text-shadow: 0 0 8px rgb(255 255 255 / 90%); animation: twinkle 2.6s ease-in-out infinite; }
  .s1 { top: 9px; left: 52%; font-size: 15px; }
  .s2 { top: 34px; left: 40%; font-size: 11px; animation-delay: 1s; }

  .mascot { position: absolute; z-index: 0; top: 2px; right: 8px; width: 96px; height: 86px; pointer-events: none; }
  .mascot-aura { position: absolute; inset: -6px 6px 4px; border-radius: 50%; background: radial-gradient(circle, rgb(255 245 170 / 95%) 0%, rgb(255 195 45 / 55%) 50%, transparent 72%); box-shadow: 0 0 22px rgb(255 200 50 / 75%); }
  .mascot :global(.hero-avatar) { width: 100%; height: 100%; background: transparent; filter: drop-shadow(0 4px 5px rgb(70 50 140 / 28%)); animation: hero-bob 3.2s ease-in-out infinite; }
  .mascot.vip :global(.hero-avatar) { filter: drop-shadow(0 0 10px rgb(255 240 150 / 95%)) drop-shadow(0 0 18px rgb(255 185 35 / 70%)) drop-shadow(0 4px 5px rgb(70 50 140 / 28%)); }
  .mascot :global(.hero-avatar img) { object-fit: cover; object-position: 50% 6%; }
  .mascot :global(.hero-pet) { position: absolute; right: 60px; bottom: 6px; width: 38px; height: 38px; background: transparent; filter: drop-shadow(0 3px 4px rgb(70 50 140 / 30%)); }

  h1 { display: flex; align-items: center; min-height: 46px; margin: 0; padding: 0 108px 0 4px; color: #2b2468; font-size: 19px; font-weight: 900; line-height: 1.2; text-shadow: 0 2px 0 rgb(255 255 255 / 70%); }

  .energy { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 9px 10px 8px; border: 2px solid #fff; border-radius: 18px; background: rgb(255 255 255 / 90%); box-shadow: 0 5px 12px rgb(80 60 170 / 14%); }
  .row { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .bolt { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border: 2px solid #fff; border-radius: 12px; color: #fff; background: linear-gradient(160deg, #5fd0ff, #2b8ff0); box-shadow: 0 3px 0 #1c68be; }
  .count { display: flex; align-items: baseline; gap: 2px; color: #2b2468; }
  .count b { font-size: 26px; font-weight: 900; line-height: 1; }
  .count small { color: #8077b8; font-size: 13px; font-weight: 800; }
  .vip-number { color: #d68a14; font-size: 32px !important; text-shadow: 0 0 12px rgb(255 200 80 / 80%); }
  .timer { display: inline-flex; align-items: center; justify-content: flex-end; gap: 4px; min-width: 0; margin-left: auto; padding: 5px 9px; border-radius: 99px; color: #5a46b8; background: #efeaff; font-size: 12px; font-weight: 800; white-space: nowrap; }
  .vip .timer { color: #8a5a06; background: #fff0c2; }

  .controls { align-items: center; }
  .bar { position: relative; flex: 1; min-width: 0; height: 14px; overflow: hidden; border-radius: 99px; background: #dcd4f5; box-shadow: inset 0 2px 3px rgb(70 50 140 / 22%); }
  .fill { position: relative; display: block; height: 100%; overflow: hidden; border-radius: inherit; background: linear-gradient(90deg, #4fb6ff, #7a8cff 60%, #b58cff); box-shadow: inset 0 2px 0 rgb(255 255 255 / 45%); transition: width 0.7s cubic-bezier(0.2, 0.9, 0.3, 1); }
  .fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgb(255 255 255 / 55%) 50%, transparent 70%); transform: translateX(-100%); animation: shine 2.8s ease-in-out infinite; }
  .vip .fill { background: linear-gradient(90deg, #ffcf4d, #ff9f3d, #ffd96b); }

  @keyframes hero-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: none; } }
  @keyframes hero-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes twinkle { 0%, 100% { opacity: 0.35; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }
  @keyframes shine { 0%, 55% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  @media (prefers-reduced-motion: reduce) {
    .hero, .mascot :global(.hero-avatar), .spark, .fill::after { animation: none; }
    .fill { transition: none; }
  }
  @media (max-width: 340px) {
    h1 { padding-right: 92px; font-size: 17px; }
    .mascot { width: 84px; height: 78px; }
    .count b { font-size: 23px; }
    .timer { padding: 4px 7px; font-size: 11px; }
    .controls { gap: 6px; }
  }
</style>
