<script lang="ts">
  import { ArrowLeft, Crown, Gift, Sparkles } from '@lucide/svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import { POINT_PACKS } from '../data/config';
  import { pointPackReward } from '../services/walletService';
  import type { PlayerState } from '../types';
  let { player, embedded = false, onBuy, onBack }: { player: PlayerState; embedded?: boolean; onBuy: (id: string) => void; onBack?: () => void } = $props();
</script>

<section class="space-y-4 pb-4" aria-label="เติม Masque Points">
  {#if !embedded}
    <div class="flex items-center gap-3">
      <button
        class="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-white bg-white/90 text-indigo-700 shadow-[0_3px_0_#c7d7eb] transition-transform active:translate-y-0.5 active:scale-95"
        title="กลับ"
        aria-label="กลับจากหน้าเติมแต้ม"
        onclick={onBack}
      >
        <ArrowLeft size={22} />
      </button>
      <div>
        <h1 class="text-xl font-extrabold text-[#30256c]">เติม Masque Points</h1>
        <p class="text-xs font-semibold text-[#6e7b9b]">Point Shop · แลก AIS Points เป็นเหรียญเกม</p>
      </div>
    </div>
  {/if}

  <div class="grid grid-cols-2 gap-3" aria-label="ยอดแต้ม">
    <div class="flex min-w-0 items-center gap-2.5 rounded-2xl border-2 border-white bg-gradient-to-br from-white via-[#f4fff8] to-[#dff9ec] p-3 shadow-[0_4px_0_#bde2d0]">
      <span class="grid size-10 shrink-0 place-items-center">
        <CurrencyIcon kind="aisPoints" size={38} />
      </span>
      <div class="min-w-0">
        <small class="block text-[10px] font-bold text-[#3f7a63]">AIS Points</small>
        <strong class="block truncate text-xl font-black tabular-nums text-[#1e4e3d]">{player.aisPoints.toLocaleString()}</strong>
      </div>
    </div>

    <div class="flex min-w-0 items-center gap-2.5 rounded-2xl border-2 border-white bg-gradient-to-br from-white via-[#fffdf2] to-[#ffefc2] p-3 shadow-[0_4px_0_#e6cf94]">
      <span class="grid size-10 shrink-0 place-items-center">
        <CurrencyIcon kind="points" size={38} />
      </span>
      <div class="min-w-0">
        <small class="block text-[10px] font-bold text-[#8c6418]">Masque Points</small>
        <strong class="block truncate text-xl font-black tabular-nums text-[#30256c]">{player.masquePoints.toLocaleString()}</strong>
      </div>
    </div>
  </div>

  <div class="relative flex min-h-34 items-center overflow-hidden rounded-2xl border-2 border-white bg-gradient-to-r from-[#dff2ff] via-[#fff5db] to-[#ffe4ef] p-4 shadow-[0_5px_0_#c6d8ec]">
    <div class="relative z-10 w-[64%]">
      <span class="inline-flex items-center gap-1 rounded-full border border-white bg-white/85 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-700 shadow-xs">
        <Sparkles size={12} class="text-amber-500" />FIRST TOP-UP BONUS
      </span>
      <h2 class="mt-1.5 text-2xl font-black leading-tight text-[#3d2c8a]">
        โบนัสครั้งแรก <span class="text-amber-500 drop-shadow-[0_1px_0_#fff]">×2</span>
      </h2>
      <p class="mt-1 text-[11px] font-semibold text-[#566b8c]">รับเหรียญ Masque Points คูณสองทันทีในครั้งแรกของแต่ละแพ็ก!</p>
    </div>
    <img
      class="pointer-events-none absolute -right-2 -bottom-1 h-36 w-38 object-contain drop-shadow-[0_6px_10px_rgba(80,50,140,0.24)]"
      src="assets/points/royal.png"
      alt="หีบสมบัติ Masque Points"
    />
  </div>

  <div class="flex items-center justify-between gap-2 pt-1">
    <h2 class="flex items-center gap-1.5 text-sm font-extrabold text-[#30256c]">
      <Crown size={18} class="text-amber-500" />เลือกแพ็กเกจเหรียญ Masque
    </h2>
    <span class="rounded-full bg-white/75 px-2.5 py-0.5 text-[9px] font-bold text-[#6c7b96]">ชำระด้วย AIS Points · DEMO</span>
  </div>

  <div class="grid grid-cols-3 gap-2.5 sm:gap-3">
    {#each POINT_PACKS as pack (pack.id)}
      {@const first = !player.demo.pointPackClaims.includes(pack.id)}
      {@const isHighlight = pack.id === 'pocket' || pack.id === 'royal'}
      <article
        class={[
          'relative flex min-w-0 flex-col items-center rounded-2xl border-2 p-2.5 pt-5 text-center transition-transform duration-150 hover:-translate-y-0.5',
          isHighlight
            ? 'border-amber-300 bg-gradient-to-b from-[#fffdf4] via-[#fff7da] to-[#ffecb8] shadow-[0_5px_0_#e2be68]'
            : 'border-white bg-gradient-to-b from-white via-[#f9fcff] to-[#eef5ff] shadow-[0_5px_0_#c8d8ec]',
        ]}
      >
        {#if isHighlight}
          <span class="absolute -top-2.5 inset-x-1 mx-auto w-fit rounded-full border border-white bg-gradient-to-r from-[#8f65ee] to-[#6340c6] px-2.5 py-0.5 text-[9px] font-extrabold text-white shadow-xs">
            {pack.id === 'royal' ? '👑 คุ้มสุด' : '🔥 ยอดนิยม'}
          </span>
        {/if}

        {#if first}
          <span class="absolute top-3.5 right-1 z-10 rotate-6 rounded-lg border border-white bg-gradient-to-b from-[#ff5e7e] to-[#e11d48] px-1.5 py-0.5 text-[8px] font-black leading-tight text-white shadow-[0_2px_0_#9f1239]">
            ครั้งแรก<br /><span class="text-xs">×2</span>
          </span>
        {/if}

        <div class="relative my-0.5 grid h-24 w-full place-items-center">
          <img
            class="h-23 w-full object-contain drop-shadow-[0_5px_8px_rgba(70,45,130,0.22)]"
            src={`assets/points/${pack.art}.png`}
            alt={`แพ็ก ${pack.points.toLocaleString()} Masque Points`}
          />
        </div>

        <strong class="mt-1 flex items-center justify-center gap-1 text-lg font-black leading-none tabular-nums text-[#30256c]">
          <CurrencyIcon kind="points" size={16} />
          {pack.points.toLocaleString()}
        </strong>
        <span class="mt-0.5 text-[8px] font-bold text-[#685c96]">Masque Points</span>

        <span class="my-1.5 inline-flex min-h-5 items-center justify-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-extrabold text-rose-600">
          <Gift size={11} />+{pack.bonus.toLocaleString()} โบนัส
        </span>

        <button
          class="mt-auto flex min-h-11 w-full flex-col items-center justify-center rounded-xl border border-white/80 bg-gradient-to-b from-[#20b593] to-[#11846b] px-1 py-1 text-white shadow-[0_3px_0_#0b5c4a] transition-transform active:translate-y-0.5 active:scale-95 disabled:border-slate-200 disabled:from-[#b5c9c8] disabled:to-[#96adaf] disabled:shadow-[0_2px_0_#7e9496] motion-reduce:transition-none"
          disabled={player.aisPoints < pack.cost}
          onclick={() => onBuy(pack.id)}
          aria-label={`ซื้อแพ็ก ${pack.points} ด้วย ${pack.cost} AIS Points`}
        >
          <span class="flex items-center gap-1">
            <CurrencyIcon kind="aisPoints" size={15} />
            <strong class="text-sm font-black leading-tight tabular-nums">{pack.cost}</strong>
          </span>
          <small class="text-[8px] font-bold opacity-95">AIS Points</small>
        </button>

        <span class="mt-1.5 text-[8px] font-bold tabular-nums text-[#63748d]">
          รับรวม {pointPackReward(player, pack.id).toLocaleString()} MP
        </span>
      </article>
    {/each}
  </div>

  <p class="flex items-center justify-center gap-1.5 pt-1 text-[10px] font-semibold text-[#6b7c95]">
    <CurrencyIcon kind="aisPoints" size={14} />ข้อมูลจำลอง · ไม่ได้หัก AIS Points จริง
  </p>
</section>
