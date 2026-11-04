<script lang="ts">
  import { ArrowLeft, CircleAlert, ExternalLink, LoaderCircle, RotateCcw, Sparkles } from '@lucide/svelte';
  import GameButton from './GameButton.svelte';
  import EnergyBadge from './EnergyBadge.svelte';
  import { energyCapacity } from '../services/energyService';
  import type { Game, PlayerState } from '../types';

  let { game, player, sessionId, vipActive, countdown, loading, fallback, version, onBack, onLoad, onError, onReload, onRefill, onFinish, finished }: {
    game: Game;
    player: PlayerState;
    sessionId: string;
    vipActive: boolean;
    countdown: string;
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
  let campaign = $derived(session?.mode === 'campaign');
  let hostedUrl = $derived.by(() => { const url = new URL(game.url); if (ranked) url.searchParams.set('mode', 'ranked'); return url.href; });
</script>

<main class="screen">
  <header class="top">
    <button class="back" onclick={onBack} aria-label="กลับหน้าเกม"><ArrowLeft size={21} strokeWidth={2.8} /></button>
    <div class="copy">
      <strong>{game.name}</strong>
      <small>{player.displayName} · LV.{player.level}</small>
    </div>
    <EnergyBadge energy={player.energy} {vipActive} countdown={countdown} max={energyCapacity(player, vipActive)} {onRefill} />
  </header>
  <div class="info">
    <span>{ranked ? 'RANKED MODE' : campaign ? 'CAMPAIGN · ใช้ 1 Ticket' : vipActive && player.demo.config.vipFreeEntry ? 'VIP · เข้าเล่นฟรี 0 Energy' : `ใช้ ${player.demo.config.energyCost} Energy ต่อรอบ`}</span>
    <a href={hostedUrl} target="_blank" rel="noopener noreferrer" aria-label="เปิดเกมในแท็บใหม่"><ExternalLink size={16} /></a>
  </div>
  <section class="stage" aria-label={`เกม ${game.name}`}>
    {#key version}<iframe src={hostedUrl} title={game.name} allow="autoplay; fullscreen; gamepad" loading="eager" referrerpolicy="strict-origin-when-cross-origin" onload={onLoad} onerror={onError}></iframe>{/key}
    {#if loading && !fallback}
      <div class="overlay">
        <div class="loader-card">
          <LoaderCircle size={36} class="spin text-[#0284c7]" />
          <strong>กำลังเปิดประตูสู่เกม...</strong>
          <span>{game.name}</span>
        </div>
      </div>
    {/if}
    {#if fallback}
      <div class="overlay">
        <div class="loader-card">
          <CircleAlert size={34} class="text-amber-500" />
          <strong>เกมอาจไม่รองรับการเปิดในหน้าต่างนี้</strong>
          <p>ลองเปิดเกมแยก หรือกดโหลดใหม่อีกครั้ง หรือกด Simulate Finish ด้านล่างเพื่อทดสอบผลลัพธ์</p>
          <div class="actions">
            <a class="open" href={hostedUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />เปิดเกมแยก</a>
            <GameButton variant="ghost" size="sm" onclick={onReload}><RotateCcw size={15} />โหลดใหม่</GameButton>
          </div>
        </div>
      </div>
    {/if}
  </section>
  <div class="finish-fab">
    <GameButton variant="gold" size="sm" disabled={finished} label={finished ? 'บันทึกผลแล้ว' : 'Simulate Finish'} onclick={onFinish}>
      <Sparkles size={14} />{finished ? 'บันทึกผลแล้ว' : 'Simulate Finish'}
    </GameButton>
  </div>
</main>

<style>
  .screen { position: relative; display: flex; flex-direction: column; width: 100%; height: 100dvh; min-height: 100dvh; max-height: 100dvh; overflow: hidden; background: #0c356a; }
  .top { z-index: 2; display: flex; flex: 0 0 auto; align-items: center; gap: 10px; min-height: calc(60px + env(safe-area-inset-top, 0px)); padding: calc(8px + env(safe-area-inset-top, 0px)) 10px 8px; color: #1f305e; background: linear-gradient(180deg, #fffdf7 0%, #e0f2fe 100%); border-bottom: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgb(15 52 106 / 18%); }
  .back { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto; border: 2px solid #ffffff; border-radius: 14px; color: #0284c7; background: #f0f9ff; box-shadow: 0 3px 0 #9bcdf0; }
  .back:active { transform: translateY(2px); box-shadow: none; }
  .copy { min-width: 0; flex: 1; display: grid; }
  .copy strong { overflow: hidden; font-size: 15.5px; font-weight: 900; line-height: 1.2; color: #1f305e; text-overflow: ellipsis; white-space: nowrap; }
  .copy small { overflow: hidden; color: #0284c7; font-size: 11.5px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
  .info { display: flex; flex: 0 0 auto; align-items: center; justify-content: space-between; min-height: 34px; padding: 2px 10px 2px 14px; color: #783f00; background: linear-gradient(90deg, #fffbeb, #e0f2fe); border-bottom: 1.5px solid #fff; font-size: 11.5px; font-weight: 800; }
  .info a { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; color: #0284c7; }
  .stage { position: relative; display: flex; flex: 1 1 auto; min-height: 0; overflow: hidden; background: #d9effc; }
  .stage iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #d7e9fc; }
  .finish-fab { position: absolute; right: 12px; bottom: max(12px, env(safe-area-inset-bottom, 0px)); z-index: 4; }
  .overlay { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; background: linear-gradient(180deg, #cfeeff 0%, #eaf6ff 55%, #fff8e7 100%); }
  .loader-card { display: flex; flex-direction: column; align-items: center; gap: 6px; max-width: 320px; padding: 22px 20px; border: 3px solid #fff; border-radius: 24px; background: rgba(255, 253, 247, 0.94); box-shadow: 0 6px 0 #9bcdf0, 0 14px 28px rgba(20, 76, 145, 0.16); }
  .overlay strong { color: #1f305e; font-size: 16px; font-weight: 900; }
  .overlay span, .overlay p { margin: 0; color: #4f6899; font-size: 12.5px; font-weight: 700; line-height: 1.45; }
  .overlay :global(.spin) { animation: spin 1.1s linear infinite; }
  .actions { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
  .open { display: inline-flex; align-items: center; gap: 6px; min-height: 42px; padding: 0 14px; border: 2px solid #fff; border-radius: 14px; color: #fff; background: linear-gradient(180deg, #4fd1ff, #0284c7); box-shadow: 0 3px 0 #0369a1; font-size: 12.5px; font-weight: 900; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
