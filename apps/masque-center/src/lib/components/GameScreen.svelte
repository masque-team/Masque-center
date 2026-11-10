<script lang="ts">
  import { CircleAlert, ExternalLink, LoaderCircle, RotateCcw, Sparkles } from '@lucide/svelte';
  import GameButton from './GameButton.svelte';
  import type { Game, PlayerState } from '../types';

  let { game, player, sessionId, loading, fallback, version, onLoad, onError, onReload, onFinish, finished }: {
    game: Game;
    player: PlayerState;
    sessionId: string;
    loading: boolean;
    fallback: boolean;
    version: number;
    onLoad: () => void;
    onError: () => void;
    onReload: () => void;
    onFinish: () => void;
    finished: boolean;
  } = $props();
  let session = $derived(player.demo.sessions.find((session) => session.gameId === game.id && session.id === sessionId));
  let ranked = $derived(session?.mode === 'ranked');
  let hostedUrl = $derived.by(() => { const url = new URL(game.url); if (ranked) url.searchParams.set('mode', 'ranked'); return url.href; });
</script>

<main class="screen">
  <div class="screen-backdrop" aria-hidden="true">
    <img src="assets/ui-redesign/header/header-banner.jpg" alt="" />
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
  .screen { position: relative; z-index: 20; display: flex; flex-direction: column; width: 100%; height: calc(100dvh - 104px - env(safe-area-inset-top, 0px)); min-height: 0; max-height: calc(100dvh - 104px - env(safe-area-inset-top, 0px)); margin-top: -14px; padding-top: 8px; overflow: hidden; border-top: 2px solid rgb(255 255 255 / 88%); border-radius: 24px 24px 0 0; background: #5a8d42; box-shadow: 0 -6px 18px rgb(22 45 20 / 26%); }
  .screen-backdrop { position: absolute; z-index: 0; inset: 0; overflow: hidden; pointer-events: none; }
  .screen-backdrop::after { position: absolute; inset: 0; background: linear-gradient(180deg, rgb(43 75 32 / 12%), rgb(29 65 29 / 32%)); content: ''; }
  .screen-backdrop img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center bottom; }
  .stage { position: relative; z-index: 1; display: flex; flex: 1 1 auto; min-height: 0; margin: 0 8px 8px; overflow: hidden; border: 4px solid #527d34; border-radius: 18px; background: #e9e3f2; box-shadow: 0 3px 0 #365c27; }
  .stage iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; border-radius: 12px; background: #d7e9fc; }
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
