<script lang="ts">
  import { BadgeCheck, CalendarCheck, ChevronRight, Flame, LockKeyhole, Medal, Trophy } from '@lucide/svelte';
  import DailyCheckinCard from '../components/DailyCheckinCard.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import { ACHIEVEMENT_DEFINITIONS, currentCheckinStreak, getAchievementProgress } from '../services/achievementService';
  import type { PlayerState } from '../types';

  let { player, now, checkinReward, checkinDays, checkedIn, onCheckin, onNavigate }: {
    player: PlayerState;
    now: number;
    checkinReward: number;
    checkinDays: { label: string; done: boolean; today: boolean }[];
    checkedIn: boolean;
    onCheckin: () => void;
    onNavigate: (route: string) => void;
  } = $props();

  let selectedId = $state<string | null>(null);
  let achievements = $derived(getAchievementProgress(player, now));
  let unlockedCount = $derived(achievements.filter((item) => item.unlocked).length);
  let streak = $derived(currentCheckinStreak(player, now));
  let selected = $derived(achievements.find((item) => item.definition.id === selectedId) ?? null);
  let catalogIds = $derived(new Set(ACHIEVEMENT_DEFINITIONS.map((item) => item.id)));
  let legacyBadges = $derived(player.demo.achievements.filter((badge) => !catalogIds.has(badge.id)));

  function statusLabel(status: string): string {
    if (status === 'unlocked') return 'Unlocked';
    if (status === 'completed') return 'Completed';
    if (status === 'in-progress') return 'In Progress';
    return 'Locked';
  }
</script>

<div class="page-stack pb-8 text-[#1f305e]">
  <PageTitle eyebrow="LIFETIME COLLECTION" title="Achievement" subtitle="เช็กอิน สะสมเป้าหมาย และเก็บ Badge โดยไม่รีเซ็ตตามซีซัน">
    {#snippet icon()}<Trophy size={26} />{/snippet}
  </PageTitle>

  <section class="card-25d space-y-3 p-3.5" aria-label="Daily check-in and streak">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2"><CalendarCheck size={19} class="text-sky-700" /><div><h2 class="text-sm font-black">Daily Check-in</h2><p class="text-[10px] text-[#526c9c]">สถานะเดียวกับ Home · รับ AIS Point วันละครั้ง</p></div></div>
      <span class="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff0c2] px-2.5 py-1 text-[10px] font-black text-[#925b00]"><Flame size={13} />{streak} วันติด</span>
    </div>
    <DailyCheckinCard reward={checkinReward} days={checkinDays} claimed={checkedIn} onClaim={onCheckin} />
    <div class="grid grid-cols-7 gap-1" aria-label="รางวัลเช็กอินต่อเนื่อง">
      {#each Array.from({ length: 7 }, (_, index) => index + 1) as day (day)}
        <div class={['grid min-h-14 content-center justify-items-center gap-0.5 rounded-xl border border-white text-center', streak >= day ? 'bg-[#e0f2fe] text-[#075985]' : 'bg-white/65 text-[#64748b]']}>
          <strong class="text-[10px]">วันที่ {day}</strong>
          <small class="text-[9px]">{day === 7 ? 'Badge +5 Energy' : `+${checkinReward} AIS`}</small>
        </div>
      {/each}
    </div>
    <p class="text-[10px] text-[#64748b]">ต่อเนื่องครบ 7 วันปลดล็อก Achievement และรับ Energy เพิ่ม · รางวัลเช็กอินและ Achievement ใช้ ledger แยกกัน</p>
  </section>

  <section class="space-y-3" aria-label="Achievement list">
    <div class="flex items-end justify-between gap-3">
      <div><h2 class="text-base font-black">Achievement List</h2><p class="text-[10px] text-[#526c9c]">ความคืบหน้าสะสมระยะยาว · {unlockedCount}/{achievements.length} ปลดล็อกแล้ว</p></div>
      <BadgeCheck size={22} class="shrink-0 text-amber-500" />
    </div>
    {#each achievements as item (item.definition.id)}
      {@const status = statusLabel(item.status)}
      {@const percent = Math.min(100, Math.round(item.progress / Math.max(1, item.definition.target) * 100))}
      <article class="card-25d grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2.5 p-3">
        <span class={['grid size-12 place-items-center rounded-2xl border-2 border-white', item.unlocked ? 'bg-gradient-to-b from-[#fff1a8] to-[#ffc74b] text-[#7c4a00] shadow-[0_3px_0_#c98a1e]' : 'bg-[#e8f4fc] text-[#5684a0]']}>
          <RewardIcon type="badge" itemId={item.definition.id} size={34} />
        </span>
        <div class="min-w-0 space-y-1">
          <div class="flex flex-wrap items-center gap-1.5"><h3 class="text-xs font-black">{item.definition.title}</h3><span class={['rounded-full px-2 py-0.5 text-[8px] font-black', item.unlocked ? 'bg-[#dcfce7] text-[#166534]' : item.status === 'in-progress' ? 'bg-[#e0f2fe] text-[#075985]' : 'bg-[#f1f5f9] text-[#64748b]']}>{status}</span></div>
          <p class="text-[10px] text-[#526c9c]">{item.definition.description}</p>
          <div class="flex items-center gap-2"><progress class="h-1.5 min-w-0 flex-1 accent-sky-600" value={item.progress} max={item.definition.target} aria-label={`${item.definition.title} progress`}></progress><small class="shrink-0 text-[9px] font-bold tabular-nums">{item.progress}/{item.definition.target}</small></div>
          <small class="block text-[9px] font-bold text-[#8a5a06]">รางวัล: {item.definition.reward?.title ?? 'Profile Badge'}</small>
        </div>
        <button class="grid size-9 place-items-center rounded-xl border border-white bg-white/80 text-sky-800" aria-label={`ดูรายละเอียด ${item.definition.title}`} aria-expanded={selectedId === item.definition.id} onclick={() => selectedId = selectedId === item.definition.id ? null : item.definition.id}><ChevronRight size={17} class={selectedId === item.definition.id ? 'rotate-90' : ''} /></button>
      </article>
    {/each}
  </section>

  {#if selected}
    <section class="card-25d space-y-2 border-2 border-amber-200 p-3.5" aria-label={`รายละเอียด ${selected.definition.title}`}>
      <div class="flex items-start gap-3"><RewardIcon type="badge" itemId={selected.definition.id} size={48} /><div class="min-w-0 flex-1"><p class="text-[9px] font-black uppercase tracking-wide text-amber-700">{statusLabel(selected.status)}</p><h2 class="text-sm font-black">{selected.definition.title}</h2><p class="text-xs text-[#526c9c]">{selected.definition.description}</p></div><button class="min-h-9 px-2 text-xs font-bold text-sky-800" onclick={() => selectedId = null} aria-label="ปิดรายละเอียด">ปิด</button></div>
      <p class="text-xs">ความคืบหน้า {selected.progress}/{selected.definition.target} · {selected.definition.reward?.title ?? 'Profile Badge'}</p>
      {#if selected.unlocked}<GameButton size="sm" variant="ghost" onclick={() => onNavigate('profile')}>เลือก Badge ใน Profile</GameButton>{/if}
    </section>
  {/if}

  <section class="space-y-3" aria-label="Badge Collection">
    <div class="flex items-end justify-between gap-3"><div><h2 class="text-base font-black">Badge Collection</h2><p class="text-[10px] text-[#526c9c]">Badge ที่ปลดล็อกจะอยู่ใน Profile โดยอัตโนมัติ</p></div><Medal size={22} class="text-amber-600" /></div>
    <div class="grid grid-cols-3 gap-2">
      {#each achievements as item (item.definition.id)}
        <button class={['grid min-h-24 content-center justify-items-center gap-1 rounded-2xl border-2 border-white p-2 text-center shadow-[0_3px_0_#b9d8ec]', item.unlocked ? 'bg-gradient-to-b from-[#fff9df] to-[#ffedb5]' : 'bg-white/60 opacity-75']} aria-label={`${item.unlocked ? 'Badge unlocked' : 'Badge locked'} · ${item.definition.title}`} onclick={() => selectedId = item.definition.id}>
          {#if item.unlocked}<RewardIcon type="badge" itemId={item.definition.id} size={42} />{:else}<LockKeyhole size={28} class="text-[#7a91a8]" />{/if}
          <strong class="line-clamp-2 text-[9px] font-black">{item.definition.title}</strong>
          <small class="text-[8px] font-bold">{item.unlocked ? 'Unlocked' : item.definition.description}</small>
        </button>
      {/each}
      {#each legacyBadges as badge (badge.id)}
        <button class="grid min-h-24 content-center justify-items-center gap-1 rounded-2xl border-2 border-white bg-gradient-to-b from-[#fff9df] to-[#ffedb5] p-2 text-center shadow-[0_3px_0_#b9d8ec]" aria-label={`Badge unlocked · ${badge.title}`} onclick={() => onNavigate('profile')}>
          <RewardIcon type="badge" itemId={badge.id} size={42} />
          <strong class="line-clamp-2 text-[9px] font-black">{badge.title}</strong>
          <small class="text-[8px] font-bold">{badge.seasonId ?? 'Unlocked'}</small>
        </button>
      {/each}
    </div>
    <GameButton block size="sm" variant="ghost" onclick={() => onNavigate('profile')}>จัดการ Badge ที่แสดงบน Profile</GameButton>
  </section>
</div>