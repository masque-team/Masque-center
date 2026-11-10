<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowLeft, Plus, Zap, ExternalLink, RotateCcw } from '@lucide/svelte';
  let { url, name, playerName, portrait, energy, onexit, onprofile, onshop }: { url: string; name: string; playerName: string; portrait: string; energy: number; onexit: () => void; onprofile: () => void; onshop: () => void } = $props();
  let loading = $state(true);
  let failed = $state(false);
  let version = $state(0);
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
    return () => clearTimeout(loadTimer);
  });
</script>

<section class="fixed inset-0 z-30 mx-auto flex max-w-[480px] flex-col bg-black" aria-label={`เกม${name}`}>
  <header class="flex shrink-0 items-center justify-between gap-2 bg-black px-3 pb-3 pt-[max(12px,env(safe-area-inset-top))] text-ink">
    <div class="flex min-w-0 items-center gap-2">
      <button class="icon-button" title="ย้อนกลับ" aria-label="ย้อนกลับ" onclick={onexit}><ArrowLeft size={25} strokeWidth={3} /></button>
      <button class="flex h-10 min-w-0 items-center gap-2 rounded-full bg-[#fcf8ff] pr-5" aria-label="ดูโปรไฟล์" onclick={onprofile}>
        <img src={portrait} alt="" class="h-12 w-12 shrink-0 rounded-full border-[3px] border-white bg-[#e7d9ff] object-cover object-top" /><strong class="max-w-[72px] truncate text-base">{playerName}</strong>
      </button>
    </div>
    <button class="flex h-10 shrink-0 items-center gap-1 rounded-full bg-[#eee5ff] pl-2 pr-1.5 text-left" aria-label="เติมพลังงาน" onclick={onshop}>
      <Zap class="energy-art" size={27} /><span><span class="block text-[9px] leading-3">พลังงาน</span><strong class="text-base leading-4">{energy}/12</strong></span><span class="ml-1 grid h-6 w-6 place-items-center rounded-full bg-violet text-white"><Plus size={19} strokeWidth={3} /></span>
    </button>
  </header>
  <div class="relative min-h-0 flex-1">
    {#key version}<iframe src={url} title={name} class="absolute inset-0 h-full w-full border-0" allow="autoplay; fullscreen; gamepad" referrerpolicy="strict-origin-when-cross-origin" onload={() => { clearTimeout(loadTimer); loading = false; }} onerror={() => { clearTimeout(loadTimer); loading = false; failed = true; }}></iframe>{/key}
    {#if loading}<div class="pointer-events-none absolute inset-0 grid place-content-center bg-[#f4ebff] text-[#7b30be]" role="status">กำลังเปิดเกม…</div>{/if}
    {#if failed}<div class="absolute inset-0 grid place-content-center gap-5 bg-[#f4ebff] p-6 text-center"><p>เปิดเกมไม่ได้ กรุณาลองอีกครั้ง</p><button class="gloss" onclick={reload}><RotateCcw size={20} />โหลดใหม่</button><a class="soft-button" href={url} target="_blank" rel="noopener noreferrer"><ExternalLink size={20} />เปิดเกมแยก</a></div>{/if}
  </div>
</section>