<script lang="ts">
  import { CalendarCheck, Check, Clock3, Crown, Flame, Gift, Lock, ShieldCheck, Sparkles, Target, Trophy } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import PassRewardTrack from '../components/PassRewardTrack.svelte';
  import PassArtwork from '../components/PassArtwork.svelte';
  import { AVATARS, PASS_ARTWORK, WINGS } from '../data/config';
  import { PASS_RULES, passProgress } from '../services/battlePassService';
  import { currentPass, currentSeason, filterPassMissions, getMissions, hasPassAccess } from '../services/demoService';
  import type { PlayerState } from '../types';

  let { player, now, vipActive = false, onClaim, onClaimAll, onVip: _onVip, onPremium, onMissions }: {
    player: PlayerState; now: number; vipActive?: boolean;
    onClaim: (index: number, track: 'free' | 'premium') => void; onClaimAll: () => void;
    onVip: (id: string) => void;
    onPremium: () => void; onMissions: () => void;
  } = $props();

  let tab = $state<'rewards' | 'missions'>('rewards');
  let period = $state<'daily' | 'weekly' | 'season'>('daily');
  let entitlement = $state<'free' | 'vip' | 'premium'>('free');

  let season = $derived(currentSeason(player, now));
  let pass = $derived(currentPass(player, now));
  let premium = $derived(hasPassAccess(player, now));
  let progress = $derived(passProgress(pass.xp));
  let totalLevels = $derived(season.free.length);
  let remaining = $derived(Math.max(0, Date.parse(`${season.ends}T00:00:00Z`) - now));
  let hero = $derived(AVATARS.find((avatar) => avatar.id === (season.theme === 'water' ? 'aqua' : 'luna')) ?? AVATARS[0]);
  let finalReward = $derived(season.premium[season.premium.length - 1]);
  let finalAvatar = $derived(finalReward?.type === 'avatar' ? AVATARS.find((avatar) => avatar.id === finalReward.itemId) : undefined);
  let finalWing = $derived(WINGS.find((wing) => wing.id === season.premium.filter((reward) => reward.type === 'wing').at(-1)?.itemId));
  let nextMilestone = $derived(Math.min(totalLevels, Math.ceil((progress.mainLevel + 1) / 5) * 5));
  let milestone = $derived(season[premium ? 'premium' : 'free'][nextMilestone - 1]);
  let available = $derived((['free', 'premium'] as const).reduce((count, track) => count + (track === 'premium' && !premium ? 0 : season[track].filter((_, index) => pass.xp >= (index + 1) * PASS_RULES.xpPerLevel && !pass.claims.includes(`${track}-${index}`)).length), 0));

  let allMissions = $derived(getMissions(player, now));
  let filteredMissions = $derived(filterPassMissions(player, period, entitlement, now));

  function periodStats(targetPeriod: 'daily' | 'weekly' | 'season') {
    const items = allMissions.filter((m) => m.period === targetPeriod);
    const done = items.filter((m) => m.complete).length;
    return { total: items.length, done };
  }

  function entitlementStats(targetEntitlement: 'free' | 'vip' | 'premium') {
    const items = allMissions.filter((m) => m.period === period && m.entitlement === targetEntitlement);
    const done = items.filter((m) => m.complete).length;
    const totalXp = items.reduce((sum, m) => sum + m.xp, 0);
    const locked = (targetEntitlement === 'vip' && !vipActive) || (targetEntitlement === 'premium' && !pass.premium);
    return { total: items.length, done, totalXp, locked };
  }
</script>

<div class="space-y-4 pb-6 text-[#2d4161]" data-testid="monthly-pass">
  <!-- 1. Hero Season Banner -->
  <section class="relative isolate flex min-h-[246px] items-center overflow-hidden rounded-2xl border-2.5 border-white bg-gradient-to-br from-[#dff3ff] via-[#eef8ff] to-[#f8e8ff] px-3.5 py-4 shadow-[0_7px_0_#b5cde6,0_12px_22px_rgba(45,75,130,0.16)]" aria-label="ซีซัน Pass">
    {#if PASS_ARTWORK.banner}<img class="absolute inset-0 -z-10 h-full w-full object-cover opacity-90" src={PASS_ARTWORK.banner} alt="" />{/if}
    <div class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-white/55 via-white/15 to-transparent"></div>
    <div class="relative z-10 w-[58%]">
      <div class="flex items-center gap-2">
        <span class="block h-11 w-12 shrink-0 drop-shadow-[0_3px_5px_rgba(120,80,10,0.28)]"><PassArtwork kind="crest" /></span>
        <span class="inline-flex items-center gap-1 rounded-full border border-white bg-[#e4f4ff]/95 px-2.5 py-0.5 text-[9px] font-black tracking-wide text-[#2a6f97] shadow-2xs">
          <Sparkles size={10} /> SEASON BATTLE PASS
        </span>
      </div>
      <h1 class="mt-1.5 text-[26px] font-black leading-none tracking-tight text-[#332973] drop-shadow-[0_2px_0_#fff]">Masque Pass</h1>
      <p class="mt-1 break-words text-xs font-extrabold text-[#3c6e91]">{season.name}</p>
      <span class="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-[#4f6782] shadow-[0_2px_0_#cde0f0]">
        <Clock3 size={12} class="text-sky-600" />เหลือ {Math.floor(remaining / 86_400_000)} วัน {Math.floor(remaining / 3_600_000) % 24} ชม.
      </span>
    </div>
    <div class="pointer-events-none absolute right-0 bottom-5 h-56 w-[58%]">
      <span class="absolute inset-2 rounded-full bg-[radial-gradient(ellipse,_rgba(245,198,255,0.86)_0%,_rgba(255,221,128,0.45)_42%,_transparent_74%)] blur-lg"></span>
      {#if finalAvatar}
        {#if finalWing}<img class="absolute inset-0 h-full w-full scale-125 object-contain" src={finalWing.imagePath} alt="" />{/if}
        <span class="nyx-breathe relative block h-full w-full drop-shadow-[0_10px_18px_rgba(65,35,120,0.42)]"><AssetPortrait src={finalAvatar.imagePath} alt={finalAvatar.name} placeholder={finalAvatar.placeholder} kind="avatar" /></span>
      {:else if finalReward}
        <span class="grid h-full w-full place-items-center"><RewardIcon type={finalReward.type} itemId={finalReward.itemId} size={96} /></span>
      {:else}
        <span class="relative block h-full w-full"><AssetPortrait src={hero.imagePath} alt={hero.name} placeholder={hero.placeholder} kind="avatar" /></span>
      {/if}
    </div>

    <style>
      .nyx-breathe {
        animation: nyx-breathe 5s ease-in-out infinite;
        transform-origin: 50% 70%;
      }

      @keyframes nyx-breathe {
        0%, 100% { transform: scale(1.04); }
        50% { transform: scale(1.09); }
      }

      @media (prefers-reduced-motion: reduce) {
        .nyx-breathe { animation: none; }
      }
    </style>
    <span class="absolute right-2.5 bottom-2 flex max-w-[52%] items-center gap-1 rounded-full border-2 border-white bg-gradient-to-r from-[#fff6d1] to-[#ffdf85] px-2.5 py-0.5 text-[9px] font-black text-[#7d4900] shadow-[0_2px_0_#d49b2a]">
      <Crown size={11} class="shrink-0 text-amber-600" fill="currentColor" />
      <span class="truncate">LV.{season.premium.length} · {finalReward?.title}</span>
    </span>
  </section>

  <!-- 2. Level & Shared XP Progress + Premium Pass Upgrade Card -->
  <section class="space-y-3 rounded-2xl border-2 border-white bg-white/92 p-3.5 shadow-[0_5px_0_#d3dff0]" aria-label="เลเวล Pass และสิทธิ์ Premium">
    <div class="flex items-center gap-3">
      <div class="relative grid size-16 shrink-0 place-content-center justify-items-center rounded-2xl border-2.5 border-white bg-gradient-to-b from-[#9f82ff] to-[#6847d6] text-white shadow-[0_4px_0_#482ca8,0_6px_12px_rgba(95,65,200,0.28)]">
        <small class="text-[8px] font-black tracking-wider text-purple-100">{progress.complete ? 'MAX' : 'LEVEL'}</small>
        <strong class="text-[26px] font-black leading-none tabular-nums drop-shadow-[0_2px_0_rgba(40,18,105,0.5)]">{progress.level}</strong>
      </div>
      <div class="min-w-0 flex-1 space-y-1.5">
        <div class="flex items-baseline justify-between gap-2 text-xs">
          <strong class="font-black text-[#3b337a]">เลเวล {progress.mainLevel}/{totalLevels}</strong>
          <span class="rounded-full bg-[#eef4fb] px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-[#5a718c]">{pass.xp.toLocaleString()} XP สะสม</span>
        </div>
        <div class="relative h-4 w-full overflow-hidden rounded-full border-2 border-white bg-[#dfe9f5] shadow-inner" role="progressbar" aria-label="XP สู่เลเวลถัดไป" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress.percent}>
          <span class="block h-full rounded-full bg-gradient-to-r from-[#4facfe] via-[#7b68ee] to-[#f7b733] transition-all duration-300" style:width={`${progress.percent}%`}></span>
          <span class="pointer-events-none absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/45"></span>
        </div>
        <div class="flex items-center justify-between text-[10px] font-bold text-[#6e829a]">
          <span>{progress.complete ? 'ถึงเลเวลสูงสุดของซีซันแล้ว' : `อีก ${100 - progress.withinLevel} XP สู่ LV.${progress.level + 1}`}</span>
          <span class="text-[#8a5a10]">{progress.percent}%</span>
        </div>
      </div>
    </div>

    <!-- Dedicated Premium Battle Pass Entitlement Row (No VIP Sales here) -->
    <div class="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-amber-200 bg-gradient-to-r from-[#fffdf4] via-[#fff5cf] to-[#ffebb0] px-3.5 py-2.5">
      <div class="flex min-w-0 items-center gap-2.5">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl border border-white bg-white/85 p-1 shadow-2xs">
          <PassArtwork kind="crest" />
        </span>
        <div class="min-w-0">
          <h2 class="text-xs font-black text-[#4a2e00]">
            {pass.premium ? '✓ ปลดล็อกสายรางวัล Premium Pass แล้ว' : 'ปลดล็อกสายรางวัล Premium Pass'}
          </h2>
          <p class="text-[10.5px] font-bold text-[#7c5310]">
            {pass.premium
              ? 'กดรับรางวัลสาย Premium และทำภารกิจ XP พิเศษได้ตลอดซีซัน'
              : `รับรางวัลแถว Premium ทั้ง ${totalLevels} เลเวลย้อนหลังตาม XP และเปิดภารกิจ Premium`}
          </p>
        </div>
      </div>
      {#if pass.premium}
        <span class="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black text-white">
          <Check size={12} strokeWidth={3} /> เปิดใช้งานแล้ว
        </span>
      {:else}
        <GameButton size="sm" variant="gold" onclick={onPremium}>
          <CurrencyIcon kind="aisPoints" size={15} />
          ปลดล็อก · {player.demo.config.premiumPrice} AIS Point
        </GameButton>
      {/if}
    </div>
  </section>

  <!-- 3. Mode Switch Tabs (Rewards / Missions) -->
  <div class="sticky top-[76px] z-20 grid grid-cols-2 gap-1.5 rounded-2xl border-2 border-white bg-[#e4effb]/95 p-1.5 shadow-[0_4px_0_#c6d8ec] backdrop-blur-md" role="tablist" aria-label="หมวด Pass">
    {#each [{ id: 'rewards' as const, label: `รางวัล ${totalLevels} เลเวล`, icon: Gift }, { id: 'missions' as const, label: 'ภารกิจสะสม XP', icon: Target }] as item (item.id)}
      <button
        type="button"
        class={[
          'flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-black transition-[transform,background-color] duration-150 active:translate-y-0.5 motion-reduce:transition-none',
          tab === item.id
            ? 'bg-gradient-to-b from-[#58b4e3] to-[#3488b8] text-white shadow-[0_3px_0_#23648c]'
            : 'text-[#667d96] hover:bg-white/50',
        ]}
        role="tab"
        aria-selected={tab === item.id}
        onclick={() => { tab = item.id; }}
      >
        <item.icon size={16} />{item.label}
        {#if item.id === 'rewards' && available > 0}
          <span class="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9px] font-black text-white">{available}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if tab === 'rewards'}
    {#if milestone && !progress.complete}
      <div class="flex items-center gap-3 rounded-2xl border-2 border-white bg-gradient-to-r from-[#fffdf5] via-[#fff5d1] to-[#ffecb3] px-3 py-2.5 shadow-[0_4px_0_#e5c470]">
        <div class="grid size-13 shrink-0 place-items-center rounded-xl border border-amber-200 bg-white/90 p-1 shadow-xs">
          <RewardIcon type={milestone.type} itemId={milestone.itemId} size={42} />
        </div>
        <div class="min-w-0 flex-1">
          <small class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-black text-amber-800">
            <Sparkles size={10} /> รางวัลสำคัญถัดไป · LV.{nextMilestone}
          </small>
          <strong class="mt-0.5 block break-words text-sm font-black text-[#3d316b]">{milestone.title}</strong>
        </div>
      </div>
    {/if}
    {#key season.id}<PassRewardTrack {player} {season} xp={pass.xp} claims={pass.claims} {premium} level={progress.level} {available} {onClaim} {onClaimAll} />{/key}
  {:else}
    {@const currentEntitlementInfo = entitlementStats(entitlement)}
    <section class="space-y-3.5" aria-label="ภารกิจสะสม XP">
      <!-- Primary Filter: Segmented Control for Daily / Weekly / Season -->
      <div class="grid grid-cols-3 gap-1.5 rounded-2xl border-2 border-white bg-[#d8eeff] p-1.5 shadow-[0_4px_0_#abd4f2]" role="tablist" aria-label="ช่วงเวลาภารกิจ">
        {#each [
          { id: 'daily', label: 'รายวัน', Icon: CalendarCheck },
          { id: 'weekly', label: 'รายสัปดาห์', Icon: Flame },
          { id: 'season', label: 'ตลอดซีซัน', Icon: Trophy },
        ] as item (item.id)}
          {@const stat = periodStats(item.id as typeof period)}
          {@const active = period === item.id}
          <button
            type="button"
            role="tab"
            aria-selected={active}
            class={['flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-left transition-all', active ? 'bg-gradient-to-b from-[#0284c7] to-[#0369a1] text-white shadow-xs' : 'text-[#284b7a]']}
            onclick={() => (period = item.id as typeof period)}
          >
            <item.Icon size={15} />
            <div class="leading-tight">
              <strong class="block text-xs font-black">{item.label}</strong>
              <small class="block text-[9.5px] font-bold opacity-85">{stat.done}/{stat.total} สำเร็จ</small>
            </div>
          </button>
        {/each}
      </div>

      <!-- Secondary Filter: Entitlement Tier Cards for Free / VIP / Premium -->
      <div class="grid grid-cols-3 gap-2" role="tablist" aria-label="กลุ่มสิทธิ์ภารกิจ">
        {#each [
          { id: 'free', label: 'ทั่วไป (Free)', badge: 'ทุกคนทำได้', Icon: ShieldCheck },
          { id: 'vip', label: 'โบนัส VIP', badge: vipActive ? 'เปิดใช้งาน' : 'เฉพาะสมาชิก VIP', Icon: Crown },
          { id: 'premium', label: 'Premium Pass', badge: pass.premium ? 'เปิดใช้งาน' : 'เฉพาะ Premium', Icon: Sparkles },
        ] as tier (tier.id)}
          {@const info = entitlementStats(tier.id as typeof entitlement)}
          {@const selected = entitlement === tier.id}
          <button
            type="button"
            role="tab"
            aria-selected={selected}
            class={[
              'flex flex-col justify-between rounded-2xl border-2 p-2.5 text-left transition-all',
              selected ? 'border-[#0284c7] bg-white shadow-[0_3px_0_#7cc2eb]' : 'border-white bg-white/80',
              info.locked ? 'opacity-85' : '',
            ]}
            onclick={() => (entitlement = tier.id as typeof entitlement)}
          >
            <div class="flex items-center justify-between gap-1">
              <span class="grid size-6 place-items-center rounded-lg bg-sky-100 text-[#0284c7]">
                {#if info.locked}<Lock size={12} />{:else}<tier.Icon size={13} />{/if}
              </span>
              <span class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-black text-[#8a5200]">+{info.totalXp} XP</span>
            </div>
            <strong class="mt-1.5 block truncate text-xs font-black text-[#1f305e]">{tier.label}</strong>
            <small class="block truncate text-[9.5px] font-extrabold text-[#526c9c]">
              {info.locked ? `🔒 ${tier.badge}` : `✓ ${info.done}/${info.total} สำเร็จ`}
            </small>
          </button>
        {/each}
      </div>

      {#if currentEntitlementInfo.locked}
        <div class="flex items-center justify-between gap-2.5 rounded-2xl border-2 border-amber-300 bg-[#fffbeb] p-3">
          <div class="min-w-0 flex-1">
            <strong class="block text-xs font-black text-[#5c3400]">
              {entitlement === 'vip' ? 'ภารกิจโบนัสสำหรับสมาชิก VIP' : 'ภารกิจพิเศษสำหรับผู้ถือ Premium Pass'}
            </strong>
            <p class="text-[10.5px] font-bold text-[#7c4a03]">
              {entitlement === 'vip'
                ? 'สมัครสมาชิก VIP ได้ที่ร้านค้า Shop เพื่อรับ XP โบนัสและเข้าเล่นเกมปกติฟรี'
                : 'ปลดล็อก Premium Pass ด้านบนเพื่อสะสม XP พิเศษและรับรางวัลแถว Premium'}
            </p>
          </div>
          {#if entitlement === 'vip'}
            <a href="#vip" class="btn-gold-3d shrink-0 px-3 py-1.5 text-xs">ไปที่ Shop VIP</a>
          {:else}
            <GameButton size="sm" variant="gold" onclick={onPremium}>ปลดล็อก Premium</GameButton>
          {/if}
        </div>
      {/if}

      <div class="space-y-2.5">
        {#each filteredMissions as mission (mission.key)}
          {@const pct = Math.min(100, Math.round((mission.count / Math.max(1, mission.target)) * 100))}
          <article class={['flex items-center gap-3 rounded-2xl border-2 border-white bg-white/95 p-3 shadow-[0_4px_0_#b6d8f2]', mission.complete ? 'bg-emerald-50/90' : '', mission.locked ? 'opacity-75' : '']}>
            <div class="grid size-11 shrink-0 place-items-center rounded-xl border border-sky-100 bg-[#e8f5ff]">
              <img class="size-8 object-contain" src={mission.trigger === 'checkin' ? 'assets/badges/checkin-streak-7.png' : (PASS_ARTWORK.crest ?? 'assets/pass/season-crest.png')} alt="" />
            </div>
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h3 class="truncate text-sm font-black text-[#1f305e]">{mission.title}</h3>
                  <p class="text-xs font-bold text-[#526c9c]">{mission.description}</p>
                </div>
                <span class="shrink-0 rounded-full bg-[#fff3c4] px-2 py-0.5 text-[11px] font-black text-[#8a5200]">
                  +{mission.xp} XP
                </span>
              </div>
              <div class="flex items-center gap-2">
                <progress class="h-2.5 min-w-0 flex-1" value={mission.count} max={mission.target}></progress>
                <small class="shrink-0 text-xs font-black tabular-nums text-[#0369a1]">
                  {mission.count}/{mission.target}
                </small>
              </div>
            </div>
          </article>
        {/each}
      </div>

      <div class="text-center pt-1">
        <button type="button" class="text-xs font-black text-[#0284c7] underline" onclick={onMissions}>
          ดูหน้าภารกิจทั้งหมดแบบเต็มจอ
        </button>
      </div>
    </section>
  {/if}
</div>
