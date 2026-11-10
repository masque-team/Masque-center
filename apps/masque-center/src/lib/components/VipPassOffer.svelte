<script lang="ts">
  import { Check, Clock3, Crown, Sparkles, TriangleAlert, Zap } from '@lucide/svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import GameButton from './GameButton.svelte';
  import { vipOffer } from '../services/passService';
  import type { PlayerState } from '../types';

  let { player, packageId, now, onSelect, onConfirm, onTopUp: _onTopUp, onClose }: {
    player: PlayerState; packageId: string; now: number;
    onSelect: (id: string) => void; onConfirm: () => void; onTopUp: () => void; onClose: () => void;
  } = $props();

  let offer = $derived(vipOffer(player, packageId, now));
  let plans = $derived(player.demo.config.vipPlans.filter((plan) => {
    const candidate = vipOffer(player, plan.id, now);
    return !!candidate && candidate.eligible;
  }));
  let short = $derived(Math.max(0, (offer?.cost ?? 0) - player.aisPoints));

  function durationLabel(days: number): string {
    return days < 1 ? `${Math.round(days * 24)} ชั่วโมง` : days === 1 ? '1 วัน' : `${days} วัน`;
  }
</script>

{#if offer}
  <section class="space-y-3.5 text-left text-[#344b67]" data-testid="vip-pass-offer">
    <!-- Large VIP Product Artwork & Package Summary -->
    <header class="relative isolate overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-br from-[#fff9db] via-[#ffeaa3] to-[#f7d774] p-4 shadow-[0_5px_0_#dfc176]">
      <div class="flex items-center gap-3.5">
        <div class="relative grid size-20 shrink-0 place-items-center rounded-2xl border-2 border-white bg-white/75 p-1.5 shadow-sm">
          <CurrencyIcon kind="vipCrest" size={58} />
        </div>
        <div class="min-w-0 flex-1">
          <span class="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white/92 px-2.5 py-0.5 text-[10px] font-black text-[#8f5400]">
            <CurrencyIcon kind="vipCrest" size={13} /> สมาชิกพิเศษ VIP
          </span>
          <h2 class="mt-1 text-xl font-black leading-tight text-[#352b73]">
            {offer.plan.label}
          </h2>
          <p class="mt-0.5 text-xs font-extrabold text-[#6b4c1b]">
            ระยะเวลาใช้งาน {durationLabel(offer.plan.durationDays)}
          </p>
        </div>
      </div>

      <p class="mt-2.5 rounded-xl bg-white/75 px-3 py-1.5 text-[11px] font-bold text-[#6b4c1b]">
        {offer.active && player.vipExpiresAt
          ? `มีสิทธิ์ VIP อยู่แล้ว · ซื้อเพิ่มจะบวกเวลาต่อจากเดิมถึง ${new Date(offer.expiresAt).toLocaleString('th-TH')}`
          : `เปิดใช้งานทันทีหลังแลก · ใช้ได้ถึง ${new Date(offer.expiresAt).toLocaleString('th-TH')}`}
      </p>
    </header>

    <!-- Duration Selector Strip -->
    {#if plans.length}
      <div
        class={['grid gap-2', plans.length === 3 ? 'grid-cols-3' : 'grid-cols-2']}
        role="radiogroup"
        aria-label="เลือกระยะเวลาแพ็กเกจ VIP"
      >
        {#each plans as plan (plan.id)}
          {@const candidate = vipOffer(player, plan.id, now)}
          {#if candidate}
            {@const selected = plan.id === packageId}
            <button
              type="button"
              class={[
                'relative flex min-w-0 flex-col items-center rounded-2xl border-2 px-2 py-2.5 text-center transition-all active:translate-y-0.5',
                selected
                  ? 'border-amber-400 bg-gradient-to-b from-[#fffdf2] via-[#fff5cc] to-[#ffe699] shadow-[0_4px_0_#d99f2b]'
                  : 'border-[#dce8f5] bg-[#f8fbff] shadow-[0_3px_0_#cfdeee]',
              ]}
              role="radio"
              aria-checked={selected}
              aria-label={`${plan.label} · ${durationLabel(plan.durationDays)}`}
              onclick={() => onSelect(plan.id)}
            >
              <CurrencyIcon kind="vipCrest" size={24} />
              <strong class="mt-1 text-xs font-black text-[#352b73]">{plan.label}</strong>
              <span class="text-[9.5px] font-bold text-[#6b5b3e]">{durationLabel(plan.durationDays)}</span>
              <span class="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-black tabular-nums text-[#245900]">
                <CurrencyIcon kind="aisPoints" size={13} />
                {candidate.cost.toLocaleString()}
              </span>
            </button>
          {/if}
        {/each}
      </div>
    {/if}

    <!-- Main Membership Benefits -->
    <div class="space-y-2 rounded-2xl border border-[#e3ecf7] bg-white/95 p-3.5 text-xs font-bold text-[#2e3d59]">
      <h3 class="flex items-center gap-1.5 text-xs font-black text-[#1f305e]">
        <Sparkles size={14} class="text-amber-500" /> สิทธิประโยชน์สมาชิก VIP
      </h3>
      <ul class="space-y-1.5 text-[11.5px]">
        <li class="flex items-center gap-2">
          <Check size={15} class="shrink-0 text-emerald-600" strokeWidth={3} />
          <span>เข้าเล่นโหมดเกมปกติฟรี <b>0 Energy</b> ไม่จำกัดรอบ</span>
        </li>
        <li class="flex items-center gap-2">
          <Zap size={15} class="shrink-0 text-sky-600" />
          <span>ขยายเพดานพลังงานสูงสุดเป็น <b>{player.demo.config.energyMax + player.demo.config.vipEnergyBonus} Energy</b></span>
        </li>
        <li class="flex items-center gap-2">
          <Crown size={15} class="shrink-0 text-amber-500" fill="currentColor" />
          <span>ปลดล็อกภารกิจโบนัสหมวด <b>VIP</b> เพื่อรับ XP Battle Pass เพิ่ม</span>
        </li>
        <li class="flex items-center gap-2 text-[#64748b]">
          <Clock3 size={15} class="shrink-0 text-slate-400" />
          <span>ไม่รวมการเล่นต่อเมื่อแพ้ (Continue), ตั๋วแข่งขัน และ Premium Pass</span>
        </li>
      </ul>
    </div>

    <!-- Purchase Footer -->
    <footer class="sticky bottom-0 space-y-2 border-t-2 border-white bg-[#fcfbff]/95 pt-3 pb-1 backdrop-blur-md">
      <div class="flex items-center justify-between gap-2 rounded-2xl border border-[#b9e682] bg-[#f4fce8] px-3.5 py-2.5">
        <div>
          <span class="block text-[10px] font-extrabold text-[#4b6b2c]">ราคาแพ็กเกจ</span>
          <div class="flex items-center gap-1.5">
            <CurrencyIcon kind="aisPoints" size={22} />
            <strong class="text-lg font-black tabular-nums text-[#245900]">{offer.cost.toLocaleString()}</strong>
            <span class="text-xs font-black text-[#245900]">AIS Point</span>
          </div>
        </div>
        <div class="text-right">
          <span class="block text-[10px] font-extrabold text-[#4b6b2c]">คงเหลือของคุณ</span>
          <strong class="text-sm font-black tabular-nums text-[#1f4d00]">{player.aisPoints.toLocaleString()}</strong>
        </div>
      </div>

      {#if short > 0}
        <p class="flex items-center gap-1 text-[11px] font-extrabold text-rose-600" role="status">
          <TriangleAlert size={14} /> คะแนนไม่พอ ขาดอีก {short.toLocaleString()} AIS Point
        </p>
      {/if}

      <div class="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2">
        <GameButton variant="ghost" size="md" onclick={onClose}>ปิด</GameButton>
        <GameButton
          block
          variant="gold"
          label={`แลก ${offer.plan.label} · ${offer.cost.toLocaleString()} AIS Point`}
          disabled={short > 0 || !offer.eligible}
          onclick={onConfirm}
        >
          <Crown size={16} fill="currentColor" />
          {offer.active ? `ต่ออายุ ${offer.plan.label}` : `แลก ${offer.plan.label}`}
        </GameButton>
      </div>
    </footer>
  </section>
{/if}
