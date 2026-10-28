<script lang="ts">
  import { ArrowLeft, CircleAlert, ExternalLink, LoaderCircle, RotateCcw } from '@lucide/svelte';
  import GameButton from './GameButton.svelte';
  import EnergyBadge from './EnergyBadge.svelte';
  import { energyCapacity } from '../services/energyService';
  import type { Game, PlayerState } from '../types';

  let { game, player, sessionId, vipActive, loading, fallback, version, onBack, onLoad, onError, onReload, onRefill, onFinish, finished }: {
    game: Game;
    player: PlayerState;
    sessionId: string;
    vipActive: boolean;
    loading: boolean;
    fallback: boolean;
    version: number;
    onBack: () => void;
    onLoad: () => void;
    onError: () => void;
    onReload: () => void;
    onRefill: () => void;
    onFinish: () => void;
    finished: boolean;
  } = $props();
  let session = $derived(player.demo.sessions.find((session) => session.gameId === game.id && session.id === sessionId));
  let ranked = $derived(session?.mode === 'ranked');
  let hostedUrl = $derived.by(() => { const url = new URL(game.url); if (ranked) url.searchParams.set('mode', 'ranked'); return url.href; });
</script>

<main class="screen">
  <header class="top">
    <button class="back" onclick={onBack} aria-label="กลับหน้าเกม"><ArrowLeft size={22} strokeWidth={2.8} /></button>
    <div class="copy"><strong>{game.name}</strong><small>{player.displayName} · LV.{player.level}</small></div>
    <EnergyBadge energy={player.energy} {vipActive} max={energyCapacity(player, vipActive)} {onRefill} />
  </header>
  <div class="info">
    <span>{ranked ? 'RANKED · ใช้บัตรเข้า 1 ใบ · ไม่ใช้ Energy' : vipActive && player.demo.config.vipFreeEntry ? 'VIP · เข้าเกมไม่เสีย Energy' : `ใช้ ${player.demo.config.energyCost} Energy ต่อการเข้าเล่น`}</span>
    <a href={hostedUrl} target="_blank" rel="noopener noreferrer" aria-label="เปิดเกมในแท็บใหม่"><ExternalLink size={17} /></a>
  </div>
  <section class="stage" aria-label={`เกม ${game.name}`}>
    {#key version}<iframe src={hostedUrl} title={game.name} allow="autoplay; fullscreen; gamepad" loading="eager" referrerpolicy="strict-origin-when-cross-origin" onload={onLoad} onerror={onError}></iframe>{/key}
    {#if loading && !fallback}
      <div class="overlay"><LoaderCircle size={34} class="spin" /><strong>กำลังเปิดเกม</strong><span>{game.name}</span></div>
    {/if}
    {#if fallback}
      <div class="overlay">
        <CircleAlert size={30} />
        <strong>เกมอาจไม่รองรับการเปิดในหน้าต่างนี้</strong>
        <p>ลองเปิดเกมแยก หรือโหลดใหม่อีกครั้ง</p>
        <div class="actions">
          <a class="open" href={hostedUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />เปิดเกมแยก</a>
          <GameButton variant="ghost" size="sm" onclick={onReload}><RotateCcw size={15} />โหลดใหม่</GameButton>
        </div>
      </div>
    {/if}
  </section>
  <footer class="flex shrink-0 items-center justify-between gap-2 bg-white p-3 pb-[max(12px,env(safe-area-inset-bottom))]"><span class="text-[11px] font-semibold text-sky-700">DEMO · ไม่ใช่คะแนนยืนยัน</span><GameButton size="sm" disabled={finished} onclick={onFinish}>{finished ? 'บันทึกผลแล้ว' : 'Simulate Finish'}</GameButton></footer>
</main>

<style>
  .screen { display: flex; flex-direction: column; width: 100%; height: 100dvh; min-height: 100dvh; max-height: 100dvh; overflow: hidden; background: #3a2590; }
  .top { z-index: 2; display: flex; flex: 0 0 auto; align-items: center; gap: 10px; min-height: calc(60px + env(safe-area-inset-top, 0px)); padding: calc(8px + env(safe-area-inset-top, 0px)) 10px 8px; color: #fff; background: linear-gradient(110deg, #5a3fc8, #8a5ce0); box-shadow: 0 5px 14px rgb(30 15 80 / 35%); }
  .back { display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 auto; border: 2px solid rgb(255 255 255 / 80%); border-radius: 15px; color: #fff; background: rgb(255 255 255 / 20%); box-shadow: 0 3px 0 rgb(40 20 110 / 40%); }
  .back:active { transform: translateY(2px); box-shadow: none; }
  .copy { min-width: 0; flex: 1; display: grid; }
  .copy strong { overflow: hidden; font-size: 16px; font-weight: 900; line-height: 1.2; text-overflow: ellipsis; text-shadow: 0 2px 0 rgb(30 15 80 / 45%); white-space: nowrap; }
  .copy small { overflow: hidden; color: #e4dcff; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
  .info { display: flex; flex: 0 0 auto; align-items: center; justify-content: space-between; min-height: 36px; padding: 2px 10px 2px 14px; color: #5a46b8; background: #efeaff; font-size: 12px; font-weight: 800; }
  .info a { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; color: #6a4fd6; }
  .stage { position: relative; display: flex; flex: 1 1 auto; min-height: 0; overflow: hidden; background: #d9e9fa; }
  .stage iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #d7e9fc; }
  .overlay { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 24px; text-align: center; background: linear-gradient(150deg, #bfe6ff, #dcd2ff 60%, #f1d7ff); color: #5a3fc0; }
  .overlay strong { color: #2b2468; font-size: 17px; font-weight: 900; }
  .overlay span, .overlay p { margin: 0; color: #7d74b4; font-size: 13px; font-weight: 700; }
  .overlay :global(.spin) { animation: spin 1.1s linear infinite; }
  .actions { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
  .open { display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border: 2px solid #fff; border-radius: 15px; color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 4px 0 #4b32a8; font-size: 13px; font-weight: 900; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
