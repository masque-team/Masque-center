<script lang="ts">
  import { ArrowLeft, Coins, Crown, Gift, Sparkles } from '@lucide/svelte';
  import { POINT_PACKS } from '../data/config';
  import { pointPackReward } from '../services/walletService';
  import type { PlayerState } from '../types';
  let { player, embedded = false, onBuy, onBack }: { player: PlayerState; embedded?: boolean; onBuy: (id: string) => void; onBack?: () => void } = $props();
</script>

<section class="space-y-4 pb-4" aria-label="เติม Masque Points">
  {#if !embedded}<div class="flex items-center gap-3"><button class="grid size-11 shrink-0 place-items-center rounded-lg border border-white bg-white/80 text-indigo-700 active:scale-95" title="กลับ" aria-label="กลับจากหน้าเติมแต้ม" onclick={onBack}><ArrowLeft size={22} /></button><div><h1 class="text-xl font-bold text-[#30256c]">เติม Masque Points</h1><p class="text-xs text-[#7b87a0]">Point Shop</p></div></div>{/if}
  <div class="grid grid-cols-2 gap-3" aria-label="ยอดแต้ม">
    <div class="flex min-w-0 items-center gap-2 rounded-lg border border-white bg-white/80 p-3"><span class="grid size-9 shrink-0 place-items-center rounded-full border-2 border-emerald-200 bg-emerald-600 text-[9px] font-bold text-white">AIS</span><div class="min-w-0"><small class="block text-[10px] text-[#71839a]">AIS Points</small><strong class="block truncate text-xl tabular-nums text-[#30256c]">{player.aisPoints.toLocaleString()}</strong></div></div>
    <div class="flex min-w-0 items-center gap-2 rounded-lg border border-white bg-white/80 p-3"><span class="grid size-9 shrink-0 place-items-center rounded-full border-2 border-amber-200 bg-amber-400 font-bold text-amber-900">M</span><div class="min-w-0"><small class="block text-[10px] text-[#71839a]">Masque Points</small><strong class="block truncate text-xl tabular-nums text-[#30256c]">{player.masquePoints.toLocaleString()}</strong></div></div>
  </div>
  <div class="relative flex min-h-32 items-center overflow-hidden rounded-lg border border-sky-200 bg-sky-100/85 p-4">
    <div class="relative z-10 w-2/3"><span class="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700"><Sparkles size={13} />FIRST TOP-UP</span><h2 class="mt-1 text-2xl font-bold leading-tight text-[#3d2c8a]">โบนัสครั้งแรก <span class="text-amber-500">×2</span></h2><p class="mt-2 text-[10px] text-[#597e98]">ต่อแพ็กเกจ · โบนัสเพิ่มเติมตามที่ระบุ</p></div>
    <img class="pointer-events-none absolute -right-4 bottom-0 h-36 w-40 object-contain" src="assets/points/royal.png" alt="กองคริสตัลและเหรียญ Masque" />
  </div>
  <div class="flex items-center justify-between gap-2"><h2 class="flex items-center gap-1.5 text-sm font-bold text-[#30256c]"><Crown size={18} class="text-amber-500" />เลือกแพ็กเกจ</h2><span class="text-[9px] text-[#71839a]">ชำระด้วย AIS Points · DEMO</span></div>
  <div class="grid grid-cols-3 gap-2 sm:gap-3">
    {#each POINT_PACKS as pack (pack.id)}
      {@const first = !player.demo.pointPackClaims.includes(pack.id)}
      <article class={['relative flex min-w-0 flex-col items-center rounded-lg border-2 p-2 pt-5 text-center shadow-sm', pack.id === 'pocket' || pack.id === 'royal' ? 'border-amber-300 bg-amber-50/90' : 'border-white bg-white/85']}>
        {#if pack.id === 'pocket' || pack.id === 'royal'}<span class="absolute -top-2.5 inset-x-1 mx-auto w-fit rounded-md bg-[#8562dc] px-2 py-1 text-[9px] font-semibold text-white">{pack.id === 'royal' ? 'คุ้มสุด' : 'ยอดนิยม'}</span>{/if}
        {#if first}<span class="absolute top-5 right-1 z-10 rotate-6 rounded-md bg-rose-500 px-1 py-1 text-[8px] font-bold leading-tight text-white">ครั้งแรก<br /><span class="text-sm">×2</span></span>{/if}
        <img class="h-24 w-full object-contain" src={`assets/points/${pack.art}.png`} alt={`แพ็ก ${pack.points.toLocaleString()} Masque Points`} />
        <strong class="mt-1 text-xl font-bold leading-none tabular-nums text-[#30256c]">{pack.points.toLocaleString()}</strong><span class="mt-1 text-[8px] font-semibold text-[#61558f]">Masque Points</span>
        <span class="my-2 flex min-h-6 items-center justify-center gap-1 text-[9px] font-semibold text-rose-500"><Gift size={12} />+{pack.bonus.toLocaleString()}</span>
        <button class="mt-auto grid min-h-12 w-full content-center rounded-md bg-[#138b89] px-1 text-white shadow-sm transition-transform active:scale-95 disabled:bg-[#9ebbbf] motion-reduce:transition-none" disabled={player.aisPoints < pack.cost} onclick={() => onBuy(pack.id)} aria-label={`ซื้อแพ็ก ${pack.points} ด้วย ${pack.cost} AIS Points`}><strong class="text-base leading-tight">{pack.cost}</strong><small class="text-[8px]">AIS Points</small></button>
        <span class="mt-2 text-[8px] tabular-nums text-[#71839a]">รับ {pointPackReward(player, pack.id).toLocaleString()} MP</span>
      </article>
    {/each}
  </div>
  <p class="flex items-center justify-center gap-1 text-[10px] text-[#71839a]"><Coins size={12} />ข้อมูลจำลอง · ไม่ได้หัก AIS Points จริง</p>
</section>