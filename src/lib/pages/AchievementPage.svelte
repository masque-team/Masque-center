<script lang="ts">
  import { BadgeCheck, CalendarCheck, ChevronRight, Flame, Gift, LockKeyhole, Medal, Sparkles, Trophy } from '@lucide/svelte';
  import DailyCheckinCard from '../components/DailyCheckinCard.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import { GACHA_ARTWORK } from '../data/config';
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
  let filterMode = $state<'all' | 'unlocked' | 'in-progress'>('all');
  let achievements = $derived(getAchievementProgress(player, now));
  let filteredAchievements = $derived(
    filterMode === 'unlocked'
      ? achievements.filter((item) => item.unlocked)
      : filterMode === 'in-progress'
        ? achievements.filter((item) => !item.unlocked)
        : achievements
  );
  let unlockedCount = $derived(achievements.filter((item) => item.unlocked).length);
  let streak = $derived(currentCheckinStreak(player, now));
  let day7Achievement = $derived(achievements.find((item) => item.definition.id === 'checkin-streak-7'));
  let selected = $derived(achievements.find((item) => item.definition.id === selectedId) ?? null);
  let catalogIds = $derived(new Set(ACHIEVEMENT_DEFINITIONS.map((item) => item.id)));
  let legacyBadges = $derived(player.demo.achievements.filter((badge) => !catalogIds.has(badge.id)));
  let pinnedBadgeIds = $derived(player.demo.profile?.badgeIds ?? []);

  function statusLabel(status: string): string {
    if (status === 'unlocked') return 'ปลดล็อกแล้ว';
    if (status === 'completed') return 'สำเร็จ';
    if (status === 'in-progress') return 'กำลังสะสม';
    return 'ล็อกอยู่';
  }
</script>

<div class="page-stack pb-8 text-[#1f305e]">
  <PageTitle eyebrow="ACHIEVEMENTS & CHECK-IN" title="ความสำเร็จ & เช็กอิน" subtitle="เช็กอินรายวันและสะสมเหรียญตราเกียรติยศ">
    {#snippet icon()}<Trophy size={26} />{/snippet}
  </PageTitle>

  <!-- 1. Daily Check-in & Day-7 Special Milestone -->
  <section class="card-25d space-y-3 p-3.5" aria-label="Daily check-in and streak">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="grid size-9 place-items-center rounded-xl border-2 border-white bg-[#e0f2fe] text-[#0284c7] shadow-2xs">
          <CalendarCheck size={19} />
        </span>
        <div>
          <h2 class="text-sm font-black">เช็กอินต่อเนื่อง</h2>
          <p class="text-[10.5px] font-bold text-[#526c9c]">รับพลังงานทุกวัน ครบ 7 วันรับกล่องสุ่มคู่หู</p>
        </div>
      </div>
      <span class="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-[#fff0c2] px-2.5 py-1 text-[10.5px] font-black text-[#925b00] shadow-2xs">
        <Flame size={13} fill="currentColor" /> {streak}/7 วัน
      </span>
    </div>

    <DailyCheckinCard reward={checkinReward} days={checkinDays} claimed={checkedIn} onClaim={onCheckin} />

    <!-- Day 7 Collectible Showcase Banner -->
    <div class="day7-showcase-card" class:unlocked={day7Achievement?.unlocked}>
      <div class="day7-art-cluster">
        <img class="day7-box-art" src={GACHA_ARTWORK.petBox ?? 'assets/gacha/pet-box.webp'} alt="Pet Gacha Box" />
        <img class="day7-badge-art" src="assets/badges/checkin-streak-7.png" alt="7-Day Streak Badge" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="rounded-full bg-[#ffe58f] px-2 py-0.5 text-[9px] font-black text-[#783f00]">
            <Gift size={10} class="inline" /> รางวัลเช็กอินครบ 7 วัน
          </span>
          {#if day7Achievement?.unlocked}
            <span class="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[9px] font-black text-[#166534]">รับแล้ว</span>
          {/if}
        </div>
        <strong class="mt-0.5 block text-xs font-black text-[#3b2200]">
          {day7Achievement?.definition.reward?.title ?? 'Pet Gacha Box'} + เหรียญตรา 7 วัน
        </strong>
        <p class="text-[10.5px] font-bold text-[#6e460c]">
          ปลดล็อกอัตโนมัติเมื่อเช็กอินติดต่อกันครบ 7 วัน
        </p>
      </div>
    </div>
  </section>

  <!-- 2. Achievement Unlock Inspection / Celebration Modal Banner (when selected) -->
  {#if selected}
    <section class="unlock-inspect-card" class:is-unlocked={selected.unlocked} aria-label={`รายละเอียด ${selected.definition.title}`}>
      <div class="unlock-rays" aria-hidden="true"></div>
      <div class="relative z-10 flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="unlock-badge-pedestal" class:unlocked={selected.unlocked}>
            <RewardIcon type="badge" itemId={selected.definition.id} size={62} />
            {#if selected.unlocked}
              <span class="unlock-sparkle-tag"><Sparkles size={11} /> ปลดล็อกแล้ว</span>
            {/if}
          </div>
          <div class="min-w-0">
            <span class={['inline-block rounded-full px-2.5 py-0.5 text-[9.5px] font-black', selected.unlocked ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#e0f2fe] text-[#075985]']}>
              {statusLabel(selected.status)}
            </span>
            <h2 class="mt-1 text-base font-black text-[#1f305e]">{selected.definition.title}</h2>
            <p class="text-xs font-bold text-[#526c9c]">{selected.definition.description}</p>
          </div>
        </div>
        <button class="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-black text-[#475569]" onclick={() => (selectedId = null)}>
          ปิด
        </button>
      </div>

      <div class="relative z-10 mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-white/90 bg-white/85 p-2.5">
        <div>
          <small class="block text-[9.5px] font-black text-[#64748b]">ความคืบหน้า</small>
          <strong class="text-sm font-black text-[#1f305e]">{selected.progress} / {selected.definition.target}</strong>
          <progress class="mt-1 h-2 w-full" value={selected.progress} max={selected.definition.target}></progress>
        </div>
        <div class="flex items-center gap-2 border-l border-slate-200 pl-2.5">
          {#if selected.definition.reward}
            <RewardIcon type={selected.definition.reward.type} itemId={selected.definition.reward.itemId} boxKind={selected.definition.reward.boxKind} size={36} />
          {/if}
          <div class="min-w-0">
            <small class="block text-[9.5px] font-black text-[#925b00]">รางวัล</small>
            <strong class="block truncate text-xs font-black text-[#5c3600]">{selected.definition.reward?.title ?? 'เหรียญตราเกียรติยศ'}</strong>
            <small class="block text-[9.5px] font-bold text-[#64748b]">+ เหรียญตราโปรไฟล์</small>
          </div>
        </div>
      </div>

      {#if selected.unlocked}
        <div class="relative z-10 mt-2.5 flex items-center justify-between gap-2">
          <span class="text-[11px] font-bold text-[#166534]">
            {pinnedBadgeIds.includes(selected.definition.id) ? '✓ ติดตั้งบนโปรไฟล์แล้ว' : 'พร้อมติดตั้งบนโปรไฟล์'}
          </span>
          <GameButton size="sm" variant="gold" onclick={() => onNavigate('profile')}>
            ติดตั้งบนโปรไฟล์
          </GameButton>
        </div>
      {/if}
    </section>
  {/if}

  <!-- 3. Achievement List with Segmented Filter -->
  <section class="space-y-3" aria-label="Achievement list">
    <div class="flex items-center justify-between gap-2">
      <div>
        <h2 class="text-base font-black">ภารกิจความสำเร็จ</h2>
        <p class="text-[10.5px] font-bold text-[#526c9c]">ปลดล็อกแล้ว {unlockedCount}/{achievements.length} รายการ</p>
      </div>
      <div class="flex rounded-full border-2 border-white bg-[#e4f2fe] p-0.5 shadow-2xs">
        {#each [{ id: 'all', label: 'ทั้งหมด' }, { id: 'unlocked', label: `ได้แล้ว (${unlockedCount})` }, { id: 'in-progress', label: 'กำลังทำ' }] as tab (tab.id)}
          <button
            class={['rounded-full px-2.5 py-1 text-[10px] font-black transition-all', filterMode === tab.id ? 'bg-[#0284c7] text-white shadow-xs' : 'text-[#476596]']}
            onclick={() => (filterMode = tab.id as typeof filterMode)}
          >
            {tab.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="space-y-2.5">
      {#each filteredAchievements as item (item.definition.id)}
        {@const status = statusLabel(item.status)}
        {@const percent = Math.min(100, Math.round(item.progress / Math.max(1, item.definition.target) * 100))}
        <article
          class="achievement-row-card"
          class:unlocked={item.unlocked}
          class:selected={selectedId === item.definition.id}
        >
          <button
            class="achievement-badge-slot"
            class:unlocked={item.unlocked}
            onclick={() => (selectedId = item.definition.id)}
            aria-label={`ดูเหรียญ ${item.definition.title}`}
          >
            <RewardIcon type="badge" itemId={item.definition.id} size={42} />
            {#if item.unlocked}
              <span class="mini-check"><BadgeCheck size={13} /></span>
            {/if}
          </button>

          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex flex-wrap items-center justify-between gap-1">
              <h3 class="truncate text-xs font-black text-[#1f305e]">{item.definition.title}</h3>
              <span class={['rounded-full px-2 py-0.5 text-[8.5px] font-black', item.unlocked ? 'bg-[#dcfce7] text-[#166534]' : item.status === 'in-progress' ? 'bg-[#e0f2fe] text-[#075985]' : 'bg-[#f1f5f9] text-[#64748b]']}>
                {status}
              </span>
            </div>
            <p class="text-[10.5px] font-bold text-[#526c9c]">{item.definition.description}</p>

            <div class="flex items-center gap-2">
              <progress class="h-2 min-w-0 flex-1" value={item.progress} max={item.definition.target} aria-label={`${item.definition.title} progress`}></progress>
              <small class="shrink-0 text-[10px] font-black tabular-nums text-[#0369a1]">{item.progress}/{item.definition.target} ({percent}%)</small>
            </div>

            <div class="flex items-center justify-between gap-2 pt-0.5">
              <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-[#fffbeb] px-2 py-0.5 text-[9.5px] font-black text-[#8a5200]">
                {#if item.definition.reward}
                  <RewardIcon type={item.definition.reward.type} itemId={item.definition.reward.itemId} boxKind={item.definition.reward.boxKind} size={16} />
                {/if}
                {item.definition.reward ? `${item.definition.reward.title} + เหรียญตรา` : 'เหรียญตราโปรไฟล์'}
              </span>
              <button
                class="inline-flex items-center gap-0.5 text-[10px] font-black text-[#0284c7]"
                aria-label={`ดูรายละเอียด ${item.definition.title}`}
                aria-expanded={selectedId === item.definition.id}
                onclick={() => (selectedId = selectedId === item.definition.id ? null : item.definition.id)}
              >
                รายละเอียด <ChevronRight size={13} class={selectedId === item.definition.id ? 'rotate-90 transition-transform' : 'transition-transform'} />
              </button>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </section>

  <!-- 4. Badge Collection Grid -->
  <section class="space-y-3" aria-label="Badge Collection">
    <div class="flex items-end justify-between gap-3">
      <div>
        <h2 class="text-base font-black">คอลเลกชันเหรียญตรา ({unlockedCount + legacyBadges.length})</h2>
        <p class="text-[10.5px] font-bold text-[#526c9c]">เลือกปักแสดงบนโปรไฟล์ได้สูงสุด 3 ชิ้น</p>
      </div>
      <Medal size={22} class="text-amber-600" />
    </div>
    <div class="grid grid-cols-3 gap-2.5">
      {#each achievements as item (item.definition.id)}
        {@const isPinned = pinnedBadgeIds.includes(item.definition.id)}
        <button
          class={[
            'badge-collection-tile',
            item.unlocked ? 'unlocked' : 'locked',
          ]}
          aria-label={`${item.unlocked ? 'Badge unlocked' : 'Badge locked'} · ${item.definition.title}`}
          onclick={() => (selectedId = item.definition.id)}
        >
          {#if isPinned}
            <span class="pinned-pill">ติดโปรไฟล์</span>
          {/if}
          <div class="badge-icon-holder" class:grayscale={!item.unlocked}>
            <RewardIcon type="badge" itemId={item.definition.id} size={46} />
            {#if !item.unlocked}
              <span class="lock-badge"><LockKeyhole size={12} /></span>
            {/if}
          </div>
          <strong class="line-clamp-1 text-[10px] font-black text-[#1f305e]">{item.definition.title}</strong>
          <small class="line-clamp-1 text-[8.5px] font-extrabold text-[#526c9c]">
            {item.unlocked ? 'ปลดล็อกแล้ว' : `${item.progress}/${item.definition.target}`}
          </small>
        </button>
      {/each}
      {#each legacyBadges as badge (badge.id)}
        <button
          class="badge-collection-tile unlocked"
          aria-label={`Badge unlocked · ${badge.title}`}
          onclick={() => onNavigate('profile')}
        >
          <div class="badge-icon-holder">
            <RewardIcon type="badge" itemId={badge.id} size={46} />
          </div>
          <strong class="line-clamp-1 text-[10px] font-black text-[#1f305e]">{badge.title}</strong>
          <small class="text-[8.5px] font-extrabold text-[#8a5200]">{badge.seasonId ?? 'Special Badge'}</small>
        </button>
      {/each}
    </div>
    <GameButton block size="sm" variant="gold" onclick={() => onNavigate('profile')}>
      จัดการเหรียญตราบนโปรไฟล์ ({pinnedBadgeIds.length}/3)
    </GameButton>
  </section>
</div>

<style>
  .day7-showcase-card {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 18px;
    border: 2px solid #fde68a;
    background: linear-gradient(135deg, #fffdf4 0%, #fff3c4 65%, #fde68a 100%);
    box-shadow: inset 0 1px 0 #fff, 0 3px 0 #dfc068;
  }
  .day7-showcase-card.unlocked {
    border-color: #86efac;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 55%, #fef08a 100%);
  }
  .day7-art-cluster {
    position: relative;
    width: 56px;
    height: 52px;
    flex-shrink: 0;
  }
  .day7-box-art {
    width: 46px;
    height: 46px;
    object-fit: contain;
    filter: drop-shadow(0 3px 5px rgba(120, 65, 0, 0.25));
  }
  .day7-badge-art {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 28px;
    height: 28px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .unlock-inspect-card {
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    border: 2.5px solid #fff;
    padding: 14px;
    background: linear-gradient(160deg, #fffdf5 0%, #e6f4ff 100%);
    box-shadow: 0 6px 0 #9ccbf0, 0 12px 24px rgba(30, 70, 130, 0.16);
  }
  .unlock-inspect-card.is-unlocked {
    background: linear-gradient(160deg, #fffef7 0%, #fff2c2 55%, #ffe082 100%);
    box-shadow: 0 6px 0 #dfb54c, 0 12px 26px rgba(180, 120, 10, 0.22);
  }
  .unlock-rays {
    position: absolute;
    top: -60px;
    left: -40px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: repeating-conic-gradient(from 0deg, rgba(255, 255, 255, 0.45) 0deg 15deg, transparent 15deg 30deg);
    animation: spinRays 16s linear infinite;
    pointer-events: none;
  }
  .unlock-badge-pedestal {
    position: relative;
    display: grid;
    place-items: center;
    padding: 4px;
    border-radius: 20px;
  }
  .unlock-badge-pedestal.unlocked {
    animation: popUnlock 0.45s cubic-bezier(0.2, 1.4, 0.4, 1);
  }
  .unlock-sparkle-tag {
    position: absolute;
    bottom: -6px;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 6px;
    border-radius: 999px;
    background: #16a34a;
    color: #fff;
    font-size: 8px;
    font-weight: 900;
    border: 1.5px solid #fff;
  }

  .achievement-row-card {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 12px;
    border-radius: 20px;
    border: 2px solid #fff;
    background: linear-gradient(180deg, #ffffff 0%, #f4faff 100%);
    box-shadow: 0 4px 0 #b8daf2, 0 6px 14px rgba(30, 75, 130, 0.08);
    transition: transform 0.15s ease;
  }
  .achievement-row-card.unlocked {
    background: linear-gradient(180deg, #fffef8 0%, #fff5d1 100%);
    box-shadow: 0 4px 0 #e2be62, 0 6px 14px rgba(170, 120, 20, 0.12);
  }
  .achievement-row-card.selected {
    outline: 2.5px solid #0284c7;
  }
  .achievement-badge-slot {
    position: relative;
    display: grid;
    place-items: center;
    width: 54px;
    height: 54px;
    flex-shrink: 0;
    border-radius: 18px;
    border: 2px solid #fff;
    background: #e8f4fc;
  }
  .achievement-badge-slot.unlocked {
    background: linear-gradient(160deg, #fff2ad, #ffc94d);
    box-shadow: 0 3px 0 #c98a1e;
  }
  .mini-check {
    position: absolute;
    right: -4px;
    bottom: -4px;
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #16a34a;
    color: #fff;
    border: 1.5px solid #fff;
  }

  .badge-collection-tile {
    position: relative;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 4px;
    min-height: 102px;
    padding: 10px 6px 8px;
    border-radius: 20px;
    border: 2px solid #fff;
    text-align: center;
    transition: transform 0.15s ease;
  }
  .badge-collection-tile:active { transform: translateY(2px); }
  .badge-collection-tile.unlocked {
    background: linear-gradient(180deg, #fffdf4 0%, #ffedb5 100%);
    box-shadow: 0 4px 0 #dfb858, 0 6px 12px rgba(160, 110, 20, 0.12);
  }
  .badge-collection-tile.locked {
    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    box-shadow: 0 3px 0 #cbd5e1;
    opacity: 0.85;
  }
  .badge-icon-holder {
    position: relative;
  }
  .lock-badge {
    position: absolute;
    right: -4px;
    bottom: -4px;
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #475569;
    color: #fff;
    border: 1.5px solid #fff;
  }
  .pinned-pill {
    position: absolute;
    top: 4px;
    right: 4px;
    padding: 1px 5px;
    border-radius: 999px;
    background: #0284c7;
    color: #fff;
    font-size: 7.5px;
    font-weight: 900;
  }

  @keyframes spinRays {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes popUnlock {
    0% { transform: scale(0.75); }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
</style>
