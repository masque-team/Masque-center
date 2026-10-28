<script lang="ts">
  import { Check, Clock3, Crown, Gift, Infinity, Sparkles, Target, Trophy, Zap } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import PassRewardTrack from '../components/PassRewardTrack.svelte';
  import PassArtwork from '../components/PassArtwork.svelte';
  import { AVATARS, PASS_ARTWORK, WINGS } from '../data/config';
  import { PASS_RULES, passProgress } from '../services/battlePassService';
  import { currentPass, currentSeason, dailyPassMission, gameMission, hasPassAccess, nextPassBonus, weeklyPassMission } from '../services/demoService';
  import { vipOffer } from '../services/passService';
  import type { GameId, PlayerState } from '../types';

  let { player, now, vipActive = false, onClaim, onClaimAll, onBonus, onVip, onMission, onWeekly, onPlay }: {
    player: PlayerState; now: number; vipActive?: boolean;
    onClaim: (index: number, track: 'free' | 'premium') => void; onClaimAll: () => void; onBonus: () => void;
    onVip: (id: string) => void; onMission: (id?: GameId) => void; onWeekly: () => void;
    onPlay: (id?: GameId) => void;
  } = $props();
  let tab = $state<'rewards' | 'missions'>('rewards');
  let season = $derived(currentSeason(player, now));
  let pass = $derived(currentPass(player, now));
  let premium = $derived(hasPassAccess(player, now));
  let progress = $derived(passProgress(pass.xp));
  let remaining = $derived(Math.max(0, Date.parse(`${season.ends}T00:00:00Z`) - now));
  let daily = $derived(dailyPassMission(player, now));
  let weekly = $derived(weeklyPassMission(player, now));
  let bonus = $derived(nextPassBonus(player, now));
  let hero = $derived(AVATARS.find((avatar) => avatar.id === (season.theme === 'water' ? 'aqua' : 'luna')) ?? AVATARS[0]);
  let finalReward = $derived(season.premium[season.premium.length - 1]);
  let finalAvatar = $derived(finalReward?.type === 'avatar' ? AVATARS.find((avatar) => avatar.id === finalReward.itemId) : undefined);
  let finalWing = $derived(WINGS.find((wing) => wing.id === season.premium.filter((reward) => reward.type === 'wing').at(-1)?.itemId));
  let nextMilestone = $derived(Math.min(50, Math.ceil((progress.mainLevel + 1) / 5) * 5));
  let milestone = $derived(season[premium ? 'premium' : 'free'][nextMilestone - 1]);
  let available = $derived((['free', 'premium'] as const).reduce((count, track) => count + (track === 'premium' && !premium ? 0 : season[track].filter((_, index) => pass.xp >= (index + 1) * PASS_RULES.xpPerLevel && !pass.claims.includes(`${track}-${index}`)).length), 0));
  let plan = $derived(player.demo.config.vipPlans.find((item) => item.durationDays === 30 && (item.startLevel ?? 1) === 1) ?? player.demo.config.vipPlans[0]);
  let allOffers = $derived(player.demo.config.vipPlans.map((item) => ({ plan: item, offer: vipOffer(player, item.id, now) })).filter((entry) => entry.offer && entry.offer.eligible));
  let upgrades = $derived(player.demo.config.vipPlans.filter((item) => {
    const offer = vipOffer(player, item.id, now);
    return offer?.active && offer.boosted && offer.eligible;
  }));
</script>

<div class="space-y-4 pb-6 text-[#2d4161]" data-testid="monthly-pass">
  <!-- Hero Season Banner -->
  <section class="relative isolate flex min-h-[208px] items-center overflow-hidden rounded-2xl border-2.5 border-white bg-gradient-to-br from-[#dff3ff] via-[#eef8ff] to-[#f8e8ff] px-3.5 py-4 shadow-[0_7px_0_#b5cde6,0_12px_22px_rgba(45,75,130,0.16)]" aria-label="ซีซัน Pass">
    {#if PASS_ARTWORK.banner}<img class="absolute inset-0 -z-10 h-full w-full object-cover opacity-90" src={PASS_ARTWORK.banner} alt="" />{/if}
    <div class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-white/55 via-white/15 to-transparent"></div>
    <div class="relative z-10 w-[58%]">
      <div class="flex items-center gap-2">
        <span class="block h-11 w-12 shrink-0 drop-shadow-[0_3px_5px_rgba(120,80,10,0.28)]"><PassArtwork kind="crest" /></span>
        <span class="inline-flex items-center gap-1 rounded-full border border-white bg-[#e4f4ff]/95 px-2.5 py-0.5 text-[9px] font-black tracking-wide text-[#2a6f97] shadow-2xs">
          <Sparkles size={10} />{player.demo.config.passAutomatic === false ? 'DEMO PREVIEW' : 'SEASON PASS · 30 DAYS'}
        </span>
      </div>
      <h1 class="mt-1.5 text-[26px] font-black leading-none tracking-tight text-[#332973] drop-shadow-[0_2px_0_#fff]">Masque Pass</h1>
      <p class="mt-1 break-words text-xs font-extrabold text-[#3c6e91]">{season.name}</p>
      <span class="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-[#4f6782] shadow-[0_2px_0_#cde0f0]">
        <Clock3 size={12} class="text-sky-600" />เหลือ {Math.floor(remaining / 86_400_000)} วัน {Math.floor(remaining / 3_600_000) % 24} ชม.
      </span>
    </div>
    <div class="pointer-events-none absolute right-1 bottom-6 h-44 w-[44%]">
      <span class="absolute inset-4 rounded-full bg-amber-200/45 blur-xl"></span>
      {#if finalAvatar}
        {#if finalWing}<img class="absolute inset-0 h-full w-full scale-125 object-contain" src={finalWing.imagePath} alt="" />{/if}
        <span class="relative block h-full w-full drop-shadow-[0_6px_10px_rgba(65,35,120,0.28)]"><AssetPortrait src={finalAvatar.imagePath} alt={finalAvatar.name} placeholder={finalAvatar.placeholder} kind="avatar" /></span>
      {:else if finalReward}
        <span class="grid h-full w-full place-items-center"><RewardIcon type={finalReward.type} itemId={finalReward.itemId} size={96} /></span>
      {:else}
        <span class="relative block h-full w-full"><AssetPortrait src={hero.imagePath} alt={hero.name} placeholder={hero.placeholder} kind="avatar" /></span>
      {/if}
    </div>
    <span class="absolute right-2.5 bottom-2 flex max-w-[52%] items-center gap-1 rounded-full border-2 border-white bg-gradient-to-r from-[#fff6d1] to-[#ffdf85] px-2.5 py-0.5 text-[9px] font-black text-[#7d4900] shadow-[0_2px_0_#d49b2a]">
      <Crown size={11} class="shrink-0 text-amber-600" fill="currentColor" />
      <span class="truncate">LV.{season.premium.length} · {finalReward?.title}</span>
    </span>
  </section>

  <!-- Glossy 3D Level & XP Progress Card -->
  <section class="flex items-center gap-3 rounded-2xl border-2 border-white bg-white/90 p-3 shadow-[0_5px_0_#d3dff0]" aria-label="เลเวล Pass">
    <div class="relative grid size-16 shrink-0 place-content-center justify-items-center rounded-2xl border-2.5 border-white bg-gradient-to-b from-[#9f82ff] to-[#6847d6] text-white shadow-[0_4px_0_#482ca8,0_6px_12px_rgba(95,65,200,0.28)]">
      <small class="text-[8px] font-black tracking-wider text-purple-100">{progress.complete ? 'BONUS' : 'LEVEL'}</small>
      <strong class="text-[26px] font-black leading-none tabular-nums drop-shadow-[0_2px_0_rgba(40,18,105,0.5)]">{progress.level}</strong>
    </div>
    <div class="min-w-0 flex-1 space-y-1.5">
      <div class="flex items-baseline justify-between gap-2 text-xs">
        <strong class="font-black text-[#3b337a]">{progress.mainLevel}/50 ขั้นหลัก</strong>
        <span class="rounded-full bg-[#eef4fb] px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-[#5a718c]">{pass.xp.toLocaleString()} XP</span>
      </div>
      <div class="relative h-4 w-full overflow-hidden rounded-full border-2 border-white bg-[#dfe9f5] shadow-inner" role="progressbar" aria-label="XP สู่เลเวลถัดไป" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress.withinLevel}>
        <span class="block h-full rounded-full bg-gradient-to-r from-[#4facfe] via-[#7b68ee] to-[#f7b733] transition-all duration-300" style:width={`${ Math.max(6, progress.withinLevel) }%`}></span>
        <span class="pointer-events-none absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/45"></span>
      </div>
      <div class="flex items-center justify-between text-[10px] font-bold text-[#6e829a]">
        <span>อีก {100 - progress.withinLevel} XP → LV.{progress.level + 1}</span>
        <span class="text-[#8a5a10]">{progress.withinLevel}%</span>
      </div>
    </div>
  </section>

  <!-- Royal VIP Pass Showcase & Tier Upgrade Section -->
  {#if plan}
    <section class="vip-showcase relative overflow-hidden rounded-2xl border-2.5 border-white p-3.5 shadow-[0_7px_0_#dfb45b,0_12px_22px_rgba(190,135,30,0.18)]" aria-label="VIP Pass 30 วัน">
      <!-- Top Header inside VIP Card -->
      <div class="flex items-start gap-3">
        <div class="relative grid h-16 w-20 shrink-0 place-items-center rounded-xl border-2 border-white bg-gradient-to-b from-white/95 to-[#fff1be] p-1 shadow-[0_3px_0_#e2be6b]">
          <span class="block h-14 w-16 drop-shadow-[0_3px_5px_rgba(140,90,10,0.28)]">
            <PassArtwork kind={vipActive ? 'boost' : 'standard'} />
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center justify-between gap-1.5">
            <span class="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-[#fff8dc] px-2 py-0.5 text-[9px] font-black text-[#945800]">
              <Crown size={11} fill="currentColor" class="text-amber-500" />
              {vipActive ? 'ROYAL VIP ACTIVE' : 'SEASON VIP PASS · 30 วัน'}
            </span>
            {#if vipActive}
              <span class="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-500 px-2.5 py-0.5 text-[9px] font-black text-white shadow-2xs">
                <Check size={10} strokeWidth={3.5} /> ใช้งานอยู่
              </span>
            {/if}
          </div>
          <h2 class="mt-1 text-base font-black leading-tight text-[#4a2e00]">
            {vipActive ? 'สิทธิพิเศษ VIP Pass กำลังทำงาน' : 'ปลดล็อก VIP Pass รับรางวัลพรีเมียม'}
          </h2>
          <p class="mt-0.5 text-[10px] font-bold text-[#856224]">
            {vipActive && player.vipExpiresAt
              ? `ใช้ได้ถึง ${new Date(player.vipExpiresAt).toLocaleDateString('th-TH')} · อัปเกรดข้ามเลเวลเพิ่มได้ทันที`
              : 'ปลดล็อกรางรางวัล VIP ทั้ง 50 ขั้น พร้อมสิทธิพิเศษตลอด 30 วัน'}
          </p>
        </div>
      </div>

      <!-- VIP Perks Pills -->
      <div class="mt-2.5 grid grid-cols-3 gap-1.5">
        <div class="flex items-center gap-1.5 rounded-xl border border-white/90 bg-white/80 px-2 py-1.5 shadow-2xs">
          <Zap size={14} class="shrink-0 text-amber-500" fill="currentColor" />
          <div class="min-w-0 leading-tight">
            <strong class="block truncate text-[10px] font-black text-[#4a3208]">{player.demo.config.vipFreeEntry ? 'เข้าเกมฟรี' : 'พลังงานปกติ'}</strong>
            <small class="block truncate text-[8px] font-bold text-[#8c6e38]">ไม่หัก Energy</small>
          </div>
        </div>
        <div class="flex items-center gap-1.5 rounded-xl border border-white/90 bg-white/80 px-2 py-1.5 shadow-2xs">
          <CurrencyIcon kind="energyPotion" size={16} />
          <div class="min-w-0 leading-tight">
            <strong class="block truncate text-[10px] font-black text-[#4a3208]">MAX +{player.demo.config.vipEnergyBonus}</strong>
            <small class="block truncate text-[8px] font-bold text-[#8c6e38]">เพดาน {player.demo.config.energyMax + player.demo.config.vipEnergyBonus} หน่วย</small>
          </div>
        </div>
        <div class="flex items-center gap-1.5 rounded-xl border border-white/90 bg-white/80 px-2 py-1.5 shadow-2xs">
          <Crown size={14} class="shrink-0 text-purple-600" fill="currentColor" />
          <div class="min-w-0 leading-tight">
            <strong class="block truncate text-[10px] font-black text-[#4a3208]">VIP Track</strong>
            <small class="block truncate text-[8px] font-bold text-[#8c6e38]">รางวัลพรีเมียม</small>
          </div>
        </div>
      </div>

      <!-- Package Cards / Active Upgrade Cards -->
      {#if vipActive}
        {#if upgrades.length}
          <div class="mt-3 space-y-2 border-t border-amber-300/60 pt-2.5">
            <div class="flex items-center justify-between text-[10px] font-black text-[#7d5006]">
              <span class="flex items-center gap-1"><Sparkles size={12} class="text-amber-600" />อัปเกรดข้ามเลเวล Pass ทันที (ไม่เพิ่มวัน VIP)</span>
              <span>จ่ายเฉพาะส่วนต่าง</span>
            </div>
            <div class="grid grid-cols-2 gap-2.5">
              {#each upgrades as upgrade (upgrade.id)}
                {@const offer = vipOffer(player, upgrade.id, now)}
                {#if offer}
                  {@const gainedLevels = Math.max(0, offer.levelAfter - offer.level)}
                  <div class="relative flex flex-col justify-between rounded-xl border-2 border-white bg-gradient-to-b from-white via-[#fffdf6] to-[#ffefc2] p-2.5 shadow-[0_4px_0_#d9ab48]">
                    <div class="flex items-center justify-between gap-1">
                      <span class="rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#f24976] px-2 py-0.5 text-[8px] font-black text-white shadow-2xs">
                        BOOST +{gainedLevels} LV
                      </span>
                      <span class="text-[9px] font-extrabold text-[#9a6b1f]">+{(gainedLevels * PASS_RULES.xpPerLevel).toLocaleString()} XP</span>
                    </div>
                    <div class="my-1.5 flex items-center gap-2">
                      <span class="block h-11 w-14 shrink-0 drop-shadow-[0_2px_4px_rgba(140,85,10,0.25)]">
                        <PassArtwork kind="boost" />
                      </span>
                      <div class="min-w-0 leading-tight">
                        <strong class="block text-sm font-black text-[#3b296b]">ข้ามไป LV.{upgrade.startLevel}</strong>
                        <small class="block text-[9px] font-bold text-[#7f6a45]">ปลดล็อกรางวัลทันที</small>
                      </div>
                    </div>
                    <GameButton
                      block
                      size="sm"
                      variant="gold"
                      label={`อัปเกรด VIP Pass LV.${upgrade.startLevel} · ${offer.cost.toLocaleString()} MP`}
                      onclick={() => onVip(upgrade.id)}
                    >
                      <CurrencyIcon kind="points" size={15} />
                      <span>อัปเกรด · {offer.cost.toLocaleString()} MP</span>
                    </GameButton>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      {:else}
        <!-- Not Active Yet: Show the 3 VIP Tiers visually -->
        <div class="mt-3 space-y-2 border-t border-amber-300/60 pt-2.5">
          <div class="grid grid-cols-3 gap-2">
            {#each allOffers as { plan: tierPlan, offer: tierOffer } (tierPlan.id)}
              {#if tierOffer}
                {@const isBoost = tierOffer.boosted}
                <button
                  type="button"
                  class={[
                    'group relative flex flex-col items-center rounded-xl border-2 p-2 text-center transition-transform active:scale-95',
                    tierPlan.startLevel === 30
                      ? 'border-amber-400 bg-gradient-to-b from-[#fffdf0] to-[#ffe699] shadow-[0_4px_0_#d89b28]'
                      : 'border-white bg-white/90 shadow-[0_4px_0_#dec078]',
                  ]}
                  onclick={() => onVip(tierPlan.id)}
                >
                  <span class={[
                    'rounded-full px-1.5 py-0.5 text-[8px] font-black text-white',
                    tierPlan.startLevel === 30 ? 'bg-gradient-to-r from-[#ff7b29] to-[#e83e6b]' : isBoost ? 'bg-[#ed9c61]' : 'bg-[#4ea4cc]',
                  ]}>
                    {isBoost ? `BOOST LV.${tierPlan.startLevel}` : 'STANDARD LV.1'}
                  </span>
                  <span class="my-1 block h-11 w-14 transition-transform group-hover:scale-105">
                    <PassArtwork kind={isBoost ? 'boost' : 'standard'} />
                  </span>
                  <strong class="text-[11px] font-black text-[#3b296b]">
                    {isBoost ? `เริ่ม LV.${tierPlan.startLevel}` : 'แพ็ก LV.1'}
                  </strong>
                  <small class="text-[8px] font-bold text-[#856d43]">
                    {isBoost ? `+${Math.max(0, tierOffer.levelAfter - tierOffer.level)} เลเวลทันที` : 'คุ้มค่า · 30 วัน'}
                  </small>
                  <span class="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-amber-300/80 bg-[#fff4c2] py-1 text-[10px] font-black text-[#734400]">
                    <CurrencyIcon kind="points" size={13} />
                    {tierOffer.cost.toLocaleString()}
                  </span>
                </button>
              {/if}
            {/each}
          </div>
          <GameButton block size="md" variant="gold" onclick={() => onVip(plan.id)}>
            <Crown size={16} fill="currentColor" />
            <span>ดูรายละเอียด / เลือกแพ็ก VIP Pass</span>
          </GameButton>
        </div>
      {/if}
    </section>
  {/if}

  <!-- Mode Switch Tabs (Rewards / Missions) -->
  <div class="sticky top-[76px] z-20 grid grid-cols-2 gap-1.5 rounded-2xl border-2 border-white bg-[#e4effb]/95 p-1.5 shadow-[0_4px_0_#c6d8ec] backdrop-blur-md" role="tablist" aria-label="หมวด Pass">
    {#each [{ id: 'rewards' as const, label: 'รางวัล 50 เลเวล', icon: Gift }, { id: 'missions' as const, label: 'ภารกิจสะสม XP', icon: Target }] as item (item.id)}
      <button
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
    {#if progress.complete}
      <section class="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-white/90 p-3 shadow-[0_4px_0_#cbe0f2]" aria-label="โบนัสหลังเลเวล 50">
        <RewardIcon type={bonus.reward.type} size={46} />
        <div class="min-w-0 flex-1">
          <h2 class="flex items-center gap-1 text-xs font-black text-[#342e73]"><Infinity size={14} />โบนัส LV.{bonus.level}</h2>
          <p class="mt-0.5 text-[10px] font-bold text-[#6e829a]">{bonus.reward.title} · {bonus.level * 100} XP</p>
        </div>
        <GameButton size="sm" variant="gold" disabled={!bonus.ready} onclick={onBonus}>รับโบนัส</GameButton>
      </section>
    {/if}
    {#if milestone && !progress.complete}
      <div class="flex items-center gap-3 rounded-2xl border-2 border-white bg-gradient-to-r from-[#fffdf5] via-[#fff5d1] to-[#ffecb3] px-3 py-2.5 shadow-[0_4px_0_#e5c470]">
        <div class="grid size-13 shrink-0 place-items-center rounded-xl border border-amber-200 bg-white/90 p-1 shadow-xs">
          <RewardIcon type={milestone.type} itemId={milestone.itemId} size={42} />
        </div>
        <div class="min-w-0 flex-1">
          <small class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-black text-amber-800">
            <Sparkles size={10} /> NEXT MILESTONE · LV.{nextMilestone}
          </small>
          <strong class="mt-0.5 block break-words text-sm font-black text-[#3d316b]">{milestone.title}</strong>
        </div>
      </div>
    {/if}
    {#key season.id}<PassRewardTrack {player} {season} xp={pass.xp} claims={pass.claims} {premium} level={progress.level} {available} {onClaim} {onClaimAll} />{/key}
  {:else}
    <section class="grid gap-3" aria-label="ภารกิจ Pass">
      {#each [{ id: daily.id, title: 'ประจำวัน', description: `เล่นจบ ${daily.target} รอบ`, count: daily.count, target: daily.target, xp: daily.xp, action: () => onMission(), icon: Target }, { id: weekly.id, title: 'ประจำสัปดาห์', description: `เล่นต่างกัน ${weekly.target} เกม`, count: weekly.games.length, target: weekly.target, xp: weekly.xp, action: onWeekly, icon: Trophy }] as mission (mission.id)}
        {@const claimed = player.demo.missionClaims.includes(mission.id)}
        {@const pct = Math.min(100, Math.round((mission.count / Math.max(1, mission.target)) * 100))}
        <article class="space-y-2.5 rounded-2xl border-2 border-white bg-white/90 p-3.5 shadow-[0_4px_0_#d5e2f0]">
          <div class="flex items-center gap-2.5">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-600"><mission.icon size={22} /></span>
            <div class="min-w-0 flex-1">
              <h2 class="text-sm font-black text-[#2e3d59]">{mission.title} · {mission.description}</h2>
              <p class="text-[10px] font-extrabold text-amber-700">+{mission.xp} Pass XP</p>
            </div>
          </div>
          <div class="h-2.5 w-full overflow-hidden rounded-full bg-[#e3edf7] p-0.5">
            <span class="block h-full rounded-full bg-gradient-to-r from-[#4facfe] to-[#00c6ff]" style:width={`${pct}%`}></span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-extrabold tabular-nums text-[#5b708b]">{Math.min(mission.count, mission.target)} / {mission.target} รอบ</span>
            {#if claimed}
              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700"><Check size={14} />รับแล้ว</span>
            {:else}
              <GameButton size="sm" variant={mission.count >= mission.target ? 'gold' : 'ghost'} onclick={() => mission.count >= mission.target ? mission.action() : onPlay()}>
                {mission.count >= mission.target ? 'รับ XP' : 'ไปเล่น'}
              </GameButton>
            {/if}
          </div>
        </article>
      {/each}
    </section>
    <h2 class="flex items-center gap-1.5 pt-1 text-sm font-black text-[#332c6e]"><Sparkles size={16} class="text-amber-500" />ภารกิจรายเกม</h2>
    <div class="space-y-3" aria-label="ภารกิจรายเกม">
      {#each player.demo.config.games.filter((game) => game.published !== false) as game (game.id)}
        {@const mission = gameMission(player, game.id)}
        {@const pct = Math.min(100, Math.round((mission.count / Math.max(1, mission.target)) * 100))}
        <article class="grid grid-cols-[52px_minmax(0,1fr)] items-start gap-3 rounded-2xl border-2 border-white bg-white/90 p-3 shadow-[0_4px_0_#d5e2f0]">
          <img class="h-13 w-13 rounded-xl border border-sky-100 bg-white object-contain p-0.5" src={`images/${game.cover}`} alt="" />
          <div class="min-w-0">
            <h3 class="text-xs font-black leading-snug text-[#2e3d59]">{game.name}</h3>
            <p class="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6c7f96]">
              <span>จบ {mission.target} รอบ</span>
              <span>·</span>
              <span class="text-sky-700">+{mission.xp} XP</span>
              <span>·</span>
              <span class="inline-flex items-center gap-0.5 text-amber-700"><CurrencyIcon kind="points" size={12} />+{mission.points} MP</span>
            </p>
            <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#e3edf7]">
              <span class="block h-full rounded-full bg-gradient-to-r from-[#4facfe] to-[#7b68ee]" style:width={`${pct}%`}></span>
            </div>
            <div class="mt-2 flex items-center justify-between gap-2">
              <span class="text-xs font-extrabold tabular-nums text-[#5b708b]">{Math.min(mission.count, mission.target)} / {mission.target}</span>
              <GameButton size="sm" variant={mission.count >= mission.target ? 'gold' : 'ghost'} onclick={() => mission.count >= mission.target ? onMission(game.id) : onPlay(game.id)}>
                {mission.count >= mission.target ? 'รับรางวัล' : 'ไปเล่น'}
              </GameButton>
            </div>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>

<style>
  .vip-showcase {
    background:
      radial-gradient(circle at 12% 18%, rgb(255 255 255 / 75%), transparent 48%),
      linear-gradient(145deg, #fff8dc 0%, #ffebb0 52%, #ffe08c 100%);
  }
</style>
