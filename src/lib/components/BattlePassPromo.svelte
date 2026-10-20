<script lang="ts">
  import { ArrowRight, Crown, Gift, UsersRound, Zap } from '@lucide/svelte';
  import GameButton from './GameButton.svelte';
  import { BATTLE_PASS, VIP_PACKAGES } from '../data/config';
  import type { PlayerState } from '../types';

  let { player, level, xp, completed, vipActive, vipUntil, onOpen, onShop, onRoom }: {
    player: PlayerState;
    level: number;
    xp: number;
    completed: boolean;
    vipActive: boolean;
    vipUntil: string;
    onOpen: () => void;
    onShop: () => void;
    onRoom: () => void;
  } = $props();

  let claimable = $derived(
    BATTLE_PASS.freeRewards.filter((_, index) => level >= index + 1 && !player.claimedRewards.includes(`free-${index + 1}`)).length
      + (vipActive ? BATTLE_PASS.vipRewards.filter((_, index) => level >= index + 1 && !player.claimedRewards.includes(`vip-${index + 1}`)).length : 0),
  );
  let startCost = $derived(Math.min(...VIP_PACKAGES.map((pack) => pack.cost)));
</script>

<section class="pass" class:vip={vipActive} aria-label="Battle Pass & VIP">
  <span class="glow" aria-hidden="true"></span>
  <div class="head">
    <span class="orb"><b>{level}</b><small>LV</small></span>
    <div class="info">
      <div class="top-row">
        <h3><Crown size={16} fill="currentColor" />Battle Pass · VIP</h3>
        {#if claimable > 0}
          <span class="ready"><Gift size={12} />รับได้ {claimable}</span>
        {:else}
          <span class="track" class:on={vipActive}>{vipActive ? `VIP · ถึง ${vipUntil}` : 'Free Track'}</span>
        {/if}
      </div>
      <div class="xp" role="progressbar" aria-label="Battle Pass XP" aria-valuemin="0" aria-valuemax="100" aria-valuenow={xp}>
        <span class="fill" style={`width:${xp}%`}></span>
        <em>{completed ? 'จบซีซันแล้ว' : `${xp}/100 XP · ซีซัน 01`}</em>
      </div>
    </div>
  </div>

  <div class="vip-bar">
    <div class="perks">
      <span><Zap size={12} fill="currentColor" />Energy ∞</span>
      <span><Crown size={12} fill="currentColor" />{vipActive ? 'ปลดล็อก VIP แล้ว' : `VIP เริ่ม ${startCost} MP`}</span>
    </div>
    <div class="actions">
      <button class="sub-btn" onclick={vipActive ? onRoom : onShop}>
        {#if vipActive}<UsersRound size={13} />ห้องเพื่อน{:else}<Crown size={13} fill="currentColor" />เปิด VIP{/if}
      </button>
      <GameButton variant={vipActive ? 'gold' : 'purple'} size="sm" onclick={onOpen}>
        ไปหน้า Pass <ArrowRight size={13} />
      </GameButton>
    </div>
  </div>
</section>

<style>
  .pass { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 9px; padding: 11px 12px; overflow: hidden; border: 2.5px solid #fff; border-radius: 22px; background: linear-gradient(145deg, #ebe3ff 0%, #d6c8ff 55%, #c5e5ff 100%); box-shadow: 0 7px 0 -3px #8a72dc, 0 12px 20px rgb(80 55 170 / 20%); isolation: isolate; }
  .pass.vip { background: linear-gradient(145deg, #fff4c6 0%, #ffe29e 52%, #e2d0ff 100%); box-shadow: 0 7px 0 -3px #d9a73a, 0 12px 20px rgb(200 140 30 / 22%); }
  .glow { position: absolute; z-index: -1; top: -32px; right: -20px; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgb(255 255 255 / 80%), transparent 70%); pointer-events: none; }

  .head { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .orb { display: grid; place-items: center; align-content: center; width: 46px; height: 46px; flex: 0 0 auto; border: 2.5px solid #fff; border-radius: 15px; color: #fff; background: linear-gradient(160deg, #b79cff, #6a4fd6); box-shadow: 0 3px 0 #4a30a8; line-height: 1; }
  .vip .orb { color: #6b3f00; background: linear-gradient(160deg, #fff09a, #ffb42b); box-shadow: 0 3px 0 #c4770d; }
  .orb b { font-size: 19px; font-weight: 900; }
  .orb small { font-size: 8.5px; font-weight: 900; opacity: 0.85; letter-spacing: 0.4px; }

  .info { min-width: 0; flex: 1; display: grid; gap: 5px; }
  .top-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 0; }
  h3 { display: inline-flex; align-items: center; gap: 4px; margin: 0; color: #2b2468; font-size: 15.5px; font-weight: 900; white-space: nowrap; }
  h3 :global(svg) { color: #f2a912; flex: 0 0 auto; }
  .track { padding: 2px 8px; border: 1.5px solid #fff; border-radius: 99px; color: #5a46b8; background: rgb(255 255 255 / 72%); font-size: 10.5px; font-weight: 900; white-space: nowrap; }
  .track.on { color: #7a4a00; background: #fff3c4; }
  .ready { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border: 1.5px solid #fff; border-radius: 99px; color: #fff; background: linear-gradient(135deg, #ff9a5a, #ff5f5f); font-size: 10.5px; font-weight: 900; white-space: nowrap; animation: nudge 1.8s ease-in-out infinite; }

  .xp { position: relative; height: 18px; overflow: hidden; border-radius: 99px; background: rgb(255 255 255 / 74%); box-shadow: inset 0 2px 3px rgb(80 55 170 / 20%); }
  .fill { position: absolute; inset: 0 auto 0 0; border-radius: inherit; background: linear-gradient(90deg, #a98bff, #6f9bff, #5fd0ff); transition: width 0.6s ease; }
  .vip .fill { background: linear-gradient(90deg, #ffc83d, #ff9636, #b58cff); }
  .xp em { position: absolute; inset: 0; display: grid; place-items: center; color: #2b2468; font-size: 10.5px; font-style: normal; font-weight: 900; text-shadow: 0 0 4px #fff, 0 0 4px #fff; }

  .vip-bar { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding-top: 7px; border-top: 1.5px dashed rgb(255 255 255 / 75%); min-width: 0; flex-wrap: wrap; }
  .perks { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; min-width: 0; }
  .perks span { display: inline-flex; align-items: center; gap: 3px; padding: 3px 7px; border-radius: 99px; color: #4b389c; background: rgb(255 255 255 / 62%); font-size: 11px; font-weight: 800; white-space: nowrap; }
  .vip .perks span { color: #6e4500; background: rgb(255 255 255 / 70%); }
  .perks span :global(svg) { color: #e89a0c; }

  .actions { display: flex; align-items: center; gap: 6px; margin-left: auto; flex: 0 0 auto; }
  .sub-btn { display: inline-flex; align-items: center; gap: 4px; min-height: 36px; padding: 0 10px; border: 2px solid #fff; border-radius: 13px; color: #5a3fc8; background: rgb(255 255 255 / 82%); box-shadow: 0 3px 0 rgb(90 65 180 / 22%); font: inherit; font-size: 12px; font-weight: 900; cursor: pointer; white-space: nowrap; }
  .sub-btn:active { transform: translateY(2px); }
  .sub-btn :global(svg) { color: #e89a0c; }

  @keyframes nudge { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
  @media (prefers-reduced-motion: reduce) { .ready { animation: none; } .fill { transition: none; } }
  @media (max-width: 350px) { h3 { font-size: 14px; } .orb { width: 42px; height: 42px; } .sub-btn { padding: 0 8px; font-size: 11px; } }
</style>
