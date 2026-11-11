<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowLeft, Plus, Zap, ExternalLink, RotateCcw } from '@lucide/svelte';
  import { hostedGameScore, hostedGameUrl } from './catalog';
  import type { GameId } from './model';
  let { url, gameId, name, playerName, portrait, energy, onexit, onprofile, onshop, onscore }: { url: string; gameId: GameId; name: string; playerName: string; portrait: string; energy: number; onexit: () => void; onprofile: () => void; onshop: () => void; onscore: (score: number) => void } = $props();
  let loading = $state(true);
  let failed = $state(false);
  let version = $state(0);
  let hostedUrl = $derived(hostedGameUrl(url, playerName));
  let frame = $state<HTMLIFrameElement>();
  let loadTimer: ReturnType<typeof setTimeout>;

  function watchLoad() {
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => { loading = false; failed = true; }, 20000);
  }

  function reload() {
    loading = true;
    failed = false;
    version++;
    watchLoad();
  }

  onMount(() => {
    if (loading) watchLoad();
    function receive(event: MessageEvent) {
      if (event.origin !== new URL(url).origin || event.source !== frame?.contentWindow) return;
      const score = hostedGameScore(gameId, event.data);
      if (score !== null) onscore(score);
    }
    window.addEventListener('message', receive);
    return () => { clearTimeout(loadTimer); window.removeEventListener('message', receive); };
  });
</script>

<section class="fixed inset-0 z-30 mx-auto flex max-w-[480px] flex-col bg-black" aria-label={`เกม${name}`}>
  <header class="game-header">
    <div class="game-player-controls">
      <button class="icon-button game-back" title="ย้อนกลับ" aria-label="ย้อนกลับ" onclick={onexit}><ArrowLeft size={24} strokeWidth={3} /></button>
      <button class="player-pop" aria-label="ดูโปรไฟล์" onclick={onprofile}>
        <img src={portrait} alt="" /><strong>{playerName}</strong>
      </button>
    </div>
    <button class="flex h-10 shrink-0 items-center gap-1 rounded-full bg-[#eee5ff] pl-2 pr-1.5 text-left" aria-label="เติมพลังงาน" onclick={onshop}>
      <Zap class="energy-art" size={27} /><span><span class="block text-[9px] leading-3">พลังงาน</span><strong class="text-base leading-4">{energy}/12</strong></span><span class="ml-1 grid h-6 w-6 place-items-center rounded-full bg-violet text-white"><Plus size={19} strokeWidth={3} /></span>
    </button>
  </header>
  <div class="game-body relative min-h-0 flex-1">
    {#key version}<iframe bind:this={frame} src={hostedUrl} title={name} class="absolute inset-0 h-full w-full border-0" allow="autoplay; fullscreen; gamepad" referrerpolicy="strict-origin-when-cross-origin" onload={() => { clearTimeout(loadTimer); loading = false; }} onerror={() => { clearTimeout(loadTimer); loading = false; failed = true; }}></iframe>{/key}
    {#if loading}<div class="pointer-events-none absolute inset-0 grid place-content-center bg-[#f4ebff] text-[#7b30be]" role="status">กำลังเปิดเกม…</div>{/if}
    {#if failed}<div class="absolute inset-0 grid place-content-center gap-5 bg-[#f4ebff] p-6 text-center"><p>เปิดเกมไม่ได้ กรุณาลองอีกครั้ง</p><button class="gloss" onclick={reload}><RotateCcw size={20} />โหลดใหม่</button><a class="soft-button" href={hostedUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={20} />เปิดเกมแยก</a></div>{/if}
  </div>
</section>

<style>
  .game-header { position: relative; z-index: 2; display: flex; min-height: 64px; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 8px; padding: max(8px, env(safe-area-inset-top)) 12px 8px; background: #000; color: #190e46; }
  .game-player-controls { display: flex; min-width: 0; align-items: center; gap: 7px; }
  .game-back { width: 36px; height: 36px; }
  .player-pop { display: flex; min-width: 0; height: 42px; align-items: center; gap: 7px; padding-right: 14px; border-radius: 999px; background: #fcf8ff; box-shadow: inset 0 0 0 1px #ffffffb3; }
  .player-pop img { width: 48px; height: 48px; flex-shrink: 0; border: 3px solid white; border-radius: 50%; background: #e7d9ff; object-fit: cover; object-position: top; }
  .player-pop strong { max-width: 80px; min-width: 0; overflow: hidden; font-size: 16px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  .game-body { overflow: hidden; border-radius: 20px 20px 0 0; }
  @media (max-width: 359px) { .game-header { gap: 6px; padding-inline: 8px; } .game-player-controls { gap: 5px; } .player-pop { gap: 5px; padding-right: 9px; } .player-pop strong { max-width: 44px; font-size: 14px; } }
</style>