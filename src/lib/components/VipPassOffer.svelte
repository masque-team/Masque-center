<script lang="ts">
  import { Check, ChevronDown, Clock3, Crown, Sparkles, TriangleAlert, Zap } from '@lucide/svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import GameButton from './GameButton.svelte';
  import RewardIcon from './RewardIcon.svelte';
  import PassArtwork from './PassArtwork.svelte';
  import { passBenefitMilestones, vipOffer } from '../services/passService';
  import { PASS_RULES } from '../services/battlePassService';
  import { currentSeason, hasPassAccess } from '../services/demoService';
  import type { PlayerState } from '../types';

  let { player, packageId, now, onSelect, onConfirm, onTopUp, onClose }: {
    player: PlayerState; packageId: string; now: number;
    onSelect: (id: string) => void; onConfirm: () => void; onTopUp: () => void; onClose: () => void;
  } = $props();

  let offer = $derived(vipOffer(player, packageId, now));
  let plans = $derived(player.demo.config.vipPlans.filter((plan) => {
    const candidate = vipOffer(player, plan.id, now);
    return !!candidate && candidate.eligible && (!candidate.active || candidate.boosted);
  }));
  let basePlanCost = $derived(player.demo.config.vipPlans.find((plan) => (plan.startLevel ?? 1) === 1)?.cost ?? 0);
  let milestones = $derived(passBenefitMilestones(player, now));
  let levelThirty = $derived(milestones.find((item) => item.level === 30));
  let season = $derived(currentSeason(player, now));
  let existingTrack = $derived(!offer?.active && hasPassAccess(player, now));
  let short = $derived(Math.max(0, (offer?.cost ?? 0) - player.masquePoints));
  let pending = $derived(offer && (!existingTrack || offer.boosted) ? season.premium.slice(0, Math.min(50, offer.levelAfter)).map((reward, index) => ({ reward, index })).filter((item) => !player.demo.passes[season.id]?.claims.includes(`premium-${item.index}`)) : []);
  let pendingEnergy = $derived(pending.filter((item) => item.reward.type === 'energy').reduce((total, item) => total + (item.reward.amount ?? 0), 0));
  let pendingPoints = $derived(pending.filter((item) => item.reward.type === 'points').reduce((total, item) => total + (item.reward.amount ?? 0), 0));
  let pendingTickets = $derived(pending.filter((item) => item.reward.type === 'ticket').reduce((total, item) => total + (item.reward.amount ?? 0), 0));
  let highlights = $derived(pending.filter((item) => ['avatar', 'pet', 'wing', 'frame', 'background'].includes(item.reward.type)).slice(-4));
</script>

{#if offer}
  <section class="space-y-3.5 text-left text-[#344b67]" data-testid="vip-pass-offer">
    <!-- Royal Banner Header -->
    <header class="relative isolate overflow-hidden rounded-2xl border-2 border-white bg-gradient-to-br from-[#fff7d6] via-[#ffeaa3] to-[#e9f4ff] p-3.5 pr-22 shadow-[0_4px_0_#dfc176]">
      <span class="pointer-events-none absolute top-1/2 right-2 h-20 w-20 -translate-y-1/2 drop-shadow-[0_4px_8px_rgba(140,90,10,0.28)]">
        <PassArtwork kind={offer.boosted ? 'boost' : 'crest'} />
      </span>
      <span class="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white/90 px-2 py-0.5 text-[9px] font-black text-[#8f5400]">
        <Sparkles size={11} class="text-amber-500" />MASQUE ROYAL VIP PASS
      </span>
      <h2 class="mt-1 text-xl font-black leading-tight text-[#352b73]">
        {offer.active ? 'อัปเกรดเลเวล VIP Pass' : 'เลือกแพ็กเกจ VIP Pass'}
      </h2>
      <p class="mt-1 text-[10px] font-bold leading-relaxed text-[#6b5b3e]">
        {offer.active && player.vipExpiresAt
          ? `VIP ใช้งานถึง ${new Date(player.vipExpiresAt).toLocaleDateString('th-TH')} · อัปเกรดข้ามเลเวลทันทีโดยไม่เพิ่มวัน VIP`
          : 'ปลดล็อกรางรางวัล VIP 50 ขั้น + สิทธิพิเศษเข้าเกมฟรีตลอด 30 วัน'}
      </p>
    </header>

    <!-- Package Selection Cards -->
    {#if plans.length}
      <div
        class={['grid gap-2 pt-1', plans.length === 3 ? 'grid-cols-3' : 'grid-cols-2']}
        role="radiogroup"
        aria-label={offer.active ? 'เลือกอัปเกรดเลเวล Pass' : 'เลือกแพ็ก VIP Pass'}
      >
        {#each plans as plan (plan.id)}
          {@const candidate = vipOffer(player, plan.id, now)}
          {#if candidate}
            {@const selected = plan.id === packageId}
            {@const gained = Math.max(0, candidate.levelAfter - candidate.level)}
            {@const extraCost = candidate.active ? candidate.cost : Math.max(0, plan.cost - basePlanCost)}
            <button
              class={[
                'relative flex min-w-0 flex-col items-center rounded-2xl border-2 px-2 pt-4 pb-2.5 text-center transition-[transform,border-color,box-shadow] duration-150 active:translate-y-0.5 disabled:opacity-40 motion-reduce:transition-none',
                selected
                  ? 'border-amber-400 bg-gradient-to-b from-[#fffdf2] via-[#fff5cc] to-[#ffe699] shadow-[0_5px_0_#d99f2b,0_8px_16px_rgba(180,130,30,0.24)]'
                  : 'border-[#dce8f5] bg-[#f8fbff] shadow-[0_3px_0_#cfdeee]',
              ]}
              role="radio"
              aria-checked={selected}
              aria-label={candidate.boosted ? `VIP Pass LV.${plan.startLevel}` : 'VIP Pass ปกติ'}
              disabled={!candidate.eligible}
              onclick={() => onSelect(plan.id)}
            >
              <span
                class={[
                  'absolute -top-2.5 inset-x-1 mx-auto w-fit rounded-full border border-white px-2 py-0.5 text-[8px] font-black text-white shadow-2xs',
                  plan.startLevel === 30 ? 'bg-gradient-to-r from-[#ff7a29] to-[#e63e6d]' : candidate.boosted ? 'bg-[#ed9c61]' : 'bg-[#4ea4cc]',
                ]}
              >
                {candidate.boosted ? `+${gained} LV BOOST` : 'STANDARD'}
              </span>
              <span class="my-1 block h-16 w-full drop-shadow-[0_3px_5px_rgba(120,80,20,0.22)]">
                <PassArtwork kind={candidate.boosted ? 'boost' : 'standard'} />
              </span>
              <strong class="text-xs font-black text-[#352b73]">
                {candidate.boosted ? `ข้ามไป LV.${plan.startLevel}` : 'แพ็ก LV.1'}
              </strong>
              <span class="mt-0.5 min-h-7 text-[8px] font-bold leading-tight text-[#786a52]">
                {candidate.boosted
                  ? `+${(gained * PASS_RULES.xpPerLevel).toLocaleString()} XP · ${candidate.active ? `ส่วนต่าง ${extraCost.toLocaleString()}` : `รวม ${plan.cost.toLocaleString()}`}`
                  : `ไม่ลดเลเวล · ${PASS_RULES.days} วัน`}
              </span>
              <span class="mt-2 flex w-full items-center justify-between border-t border-amber-200/70 pt-1.5">
                <strong class="inline-flex items-center gap-1 text-[11px] font-black tabular-nums text-[#6d4200]">
                  <CurrencyIcon kind="points" size={13} />
                  {candidate.cost.toLocaleString()}
                </strong>
                <span
                  class={[
                    'grid size-4.5 place-items-center rounded-full border',
                    selected ? 'border-amber-500 bg-amber-500 text-white' : 'border-[#cfdaea] bg-white',
                  ]}
                >
                  {#if selected}<Check size={11} strokeWidth={3.5} />{/if}
                </span>
              </span>
            </button>
          {/if}
        {/each}
      </div>
    {/if}

    <!-- 3 Key Metrics Strip -->
    <div class="grid grid-cols-3 gap-2 rounded-2xl border-2 border-white bg-[#f3f8ff] p-2.5 text-center shadow-inner">
      <div class="rounded-xl bg-white/90 p-2">
        <Clock3 size={15} class="mx-auto mb-0.5 text-sky-500" />
        <strong class="block text-xs font-black text-[#2e3d59]">{offer.active ? 'คงวันเดิม' : `${offer.plan.durationDays} วัน`}</strong>
        <small class="text-[8px] font-bold text-[#7f90a6]">{offer.active ? 'ไม่ขยายวัน VIP' : 'อายุสิทธิ์ VIP'}</small>
      </div>
      <div class="rounded-xl bg-white/90 p-2">
        <div class="mx-auto mb-0.5 w-fit"><CurrencyIcon kind="energyPotion" size={16} /></div>
        <strong class="block text-xs font-black text-[#2e3d59]">{player.demo.config.energyMax + player.demo.config.vipEnergyBonus} MAX</strong>
        <small class="text-[8px] font-bold text-[#7f90a6]">เพดาน +{player.demo.config.vipEnergyBonus}</small>
      </div>
      <div class="rounded-xl bg-white/90 p-2">
        <Crown size={15} class="mx-auto mb-0.5 text-amber-500" fill="currentColor" />
        <strong class="block text-xs font-black text-[#2e3d59]">LV.{offer.levelAfter}</strong>
        <small class="text-[8px] font-bold text-[#7f90a6]">เลเวลหลังซื้อ</small>
      </div>
    </div>

    <!-- Perks List -->
    <div class="space-y-1.5 rounded-2xl border border-[#e3ecf7] bg-white/90 p-3 text-[11px] font-semibold text-[#3f536e]">
      <p class="flex items-center gap-2"><Check size={15} class="shrink-0 text-emerald-600" strokeWidth={3} />{player.demo.config.vipFreeEntry ? 'เกมทั่วไปเข้าเล่นฟรี ไม่หัก Energy (Ranked ใช้ตั๋วตามปกติ)' : 'สิทธิ์เข้าเกมตามกติกาปกติ'}</p>
      <p class="flex items-center gap-2"><Zap size={15} class="shrink-0 text-amber-500" fill="currentColor" />เพดาน Energy เพิ่มเป็น {player.demo.config.energyMax + player.demo.config.vipEnergyBonus} · ฟื้น +1 ทุก {player.demo.config.regenMinutes} นาที</p>
      <p class="flex items-center gap-2"><Crown size={15} class="shrink-0 text-purple-600" fill="currentColor" />ปลดล็อกของรางวัลช่อง VIP Track ทุกเลเวลในซีซัน</p>
      <p class="flex items-center gap-2"><CurrencyIcon kind="petGachaTicket" size={16} />รับคูปองสุ่มกาชาโบนัสทันที: <b>{offer.active ? 0 : offer.plan.bonusTickets ?? 0} ใบ</b></p>
      <p class="flex items-center gap-2"><Clock3 size={15} class="shrink-0 text-sky-600" />ใช้สิทธิ์ได้ถึง {new Date(offer.expiresAt).toLocaleDateString('th-TH')}</p>
    </div>

    {#if existingTrack && offer.active && offer.boosted}
      <p class="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-sky-800">
        มีสิทธิ์ช่อง VIP ซีซันนี้แล้ว · การอัปเกรดเพิ่มเลเวล Pass และปลดล็อกรางวัลตาม XP โดยไม่เพิ่มวัน VIP
      </p>
    {:else if existingTrack}
      <p class="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-sky-800">
        มีสิทธิ์ช่อง VIP ซีซันนี้แล้ว · รางวัลที่ปลดล็อกกดรับในหน้า Pass
      </p>
    {:else if !offer.active && !offer.boosted && levelThirty}
      <p class="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-sky-800">
        เมื่อเล่นถึง LV.30 รับจากช่อง VIP เพิ่มอีก <strong>{levelThirty.vipEnergy} Energy</strong>, {levelThirty.vipPoints.toLocaleString()} MP และคูปองกาชา {levelThirty.vipTickets} ใบ
      </p>
    {/if}

    <!-- Instant Unlock Rewards Preview -->
    {#if (offer.boosted || !offer.active) && pending.length > 0}
      <section class="space-y-2 rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-[#fffdf4] to-[#fff3cc] p-3" aria-label="รางวัลที่ปลดล็อกหลังซื้อ">
        <div class="flex items-center justify-between">
          <h3 class="flex items-center gap-1 text-xs font-black text-[#7a4b00]">
            <Sparkles size={13} class="text-amber-500" />ปลดล็อกทันที {pending.length} ขั้น VIP ให้กดรับ!
          </h3>
          <span class="rounded-full bg-amber-400/25 px-2 py-0.5 text-[9px] font-black text-[#855200]">ถึง LV.{Math.min(50, offer.levelAfter)}</span>
        </div>
        <div class="flex flex-wrap gap-2 text-[11px] font-black">
          {#if pendingEnergy > 0}
            <span class="inline-flex items-center gap-1 rounded-lg border border-white bg-white/90 px-2 py-1 text-sky-800">
              <CurrencyIcon kind="energyPotion" size={14} />+{pendingEnergy} Energy
            </span>
          {/if}
          {#if pendingPoints > 0}
            <span class="inline-flex items-center gap-1 rounded-lg border border-white bg-white/90 px-2 py-1 text-amber-800">
              <CurrencyIcon kind="points" size={14} />+{pendingPoints.toLocaleString()} MP
            </span>
          {/if}
          {#if pendingTickets > 0}
            <span class="inline-flex items-center gap-1 rounded-lg border border-white bg-white/90 px-2 py-1 text-rose-700">
              <CurrencyIcon kind="petGachaTicket" size={14} />ตั๋วกาชา +{pendingTickets}
            </span>
          {/if}
        </div>
        {#if highlights.length}
          <div class="grid grid-cols-4 gap-2 pt-1">
            {#each highlights as item (item.index)}
              <div class="grid min-w-0 justify-items-center gap-1 rounded-xl border border-white bg-white/85 p-1.5">
                <RewardIcon type={item.reward.type} itemId={item.reward.itemId} size={38} />
                <small class="line-clamp-2 text-center text-[8px] font-bold text-[#4a3b75]">{item.reward.title}</small>
              </div>
            {/each}
          </div>
        {/if}
        <p class="text-[9px] font-semibold leading-relaxed text-[#947b4f]">* กดรับรางวัลที่ปลดล็อกได้ในหน้า Pass · ของซ้ำชดเชยเป็น MP ตามกติกา</p>
      </section>
    {/if}

    {#if !offer.active || offer.boosted}
      <details class="rounded-xl border border-[#e5ebf2] bg-white/70 px-3 py-2">
        <summary class="flex min-h-8 cursor-pointer items-center justify-between text-xs font-extrabold text-[#4b5e78]">
          ตารางรางวัล Energy สะสมตามเลเวล<ChevronDown size={15} />
        </summary>
        <table class="mt-2 w-full text-center text-[10px]">
          <thead class="text-[#8795a8]">
            <tr><th class="py-1.5 font-bold">ถึง LV.</th><th class="font-bold">ฟรีสะสม</th><th class="font-bold text-amber-700">VIP เพิ่มอีก</th></tr>
          </thead>
          <tbody>
            {#each milestones as row (row.level)}
              <tr class="border-t border-[#edf0f5]">
                <th class="py-1.5 font-extrabold">{row.level}</th>
                <td>{row.freeEnergy}</td>
                <td class="font-extrabold text-amber-700">+{row.vipEnergy}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </details>
    {/if}

    <!-- Sticky Purchase Footer -->
    <footer class="sticky bottom-0 space-y-2 border-t-2 border-white bg-[#fcfbff]/95 pt-3 pb-1 backdrop-blur-md">
      {#if offer.active && !offer.boosted}
        <p class="text-center text-xs font-bold text-[#6b8795]">
          VIP Pass ใช้งานถึง {new Date(offer.expiresAt).toLocaleDateString('th-TH')} · เลือกอัปเกรดเลเวล Pass ได้ด้านบน
        </p>
        <GameButton block variant="ghost" onclick={onClose}>ปิดหน้าต่าง</GameButton>
      {:else}
        <div class="flex items-center justify-between gap-2 rounded-xl bg-[#f5f0ff] px-3 py-2">
          <div class="flex items-center gap-1.5">
            <CurrencyIcon kind="points" size={22} />
            <strong class="text-lg font-black tabular-nums text-[#4b2e83]">{offer.cost.toLocaleString()} <span class="text-xs">MP</span></strong>
          </div>
          <span class="text-right text-[10px] font-extrabold tabular-nums text-[#6e7f96]">
            ยอดของคุณ: <b class="text-[#352b73]">{player.masquePoints.toLocaleString()} MP</b>
          </span>
        </div>
        {#if short > 0}
          <p class="flex items-center gap-1 text-[10px] font-extrabold text-rose-600" role="status">
            <TriangleAlert size={13} />แต้มไม่พอ ขาดอีก {short.toLocaleString()} MP
          </p>
        {/if}
        <div class="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-2">
          <GameButton variant="ghost" size="md" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton
            block
            variant="gold"
            label={`${offer.active ? 'อัปเกรด' : 'ซื้อ'} VIP Pass LV.${offer.plan.startLevel ?? 1} · ${offer.cost.toLocaleString()} MP`}
            disabled={short > 0 || !offer.eligible}
            onclick={onConfirm}
          >
            <Crown size={16} fill="currentColor" />
            {offer.active ? `อัปเกรดเป็น LV.${offer.plan.startLevel}` : `ซื้อแพ็ก LV.${offer.plan.startLevel ?? 1}`}
          </GameButton>
        </div>
        {#if short > 0}
          <GameButton block size="sm" variant="mint" onclick={onTopUp}>
            <CurrencyIcon kind="points" size={15} />เติม Masque Points
          </GameButton>
        {/if}
      {/if}
    </footer>
  </section>
{/if}
