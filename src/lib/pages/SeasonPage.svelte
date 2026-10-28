<script lang="ts">
  import { Check, Clock3, Crown, Gift, Infinity, Sparkles, Target, Trophy } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import PassRewardTrack from '../components/PassRewardTrack.svelte';
  import PassArtwork from '../components/PassArtwork.svelte';
  import { AVATARS, PASS_ARTWORK, WINGS } from '../data/config';
  import { PASS_RULES, passProgress } from '../services/battlePassService';
  import { currentPass, currentSeason, dailyPassMission, gameMission, hasPassAccess, nextPassBonus, weeklyPassMission } from '../services/demoService';
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
</script>

<div class="space-y-4 pb-6 text-[#2d4161]" data-testid="monthly-pass">
  <section class="relative isolate flex min-h-[204px] items-center overflow-hidden border-y-2 border-white bg-[#dff2fc]/85 px-3 py-4" aria-label="ซีซัน Pass">
    {#if PASS_ARTWORK.banner}<img class="absolute inset-0 -z-10 h-full w-full object-cover" src={PASS_ARTWORK.banner} alt="" />{/if}
    <div class="relative z-10 w-[60%]"><span class="mb-1 block h-11 w-14"><PassArtwork kind="crest" /></span><p class="flex items-center gap-1 text-[9px] font-bold text-[#5598b3]">{player.demo.config.passAutomatic === false ? 'DEMO PREVIEW' : 'SEASON PASS · 30 DAYS'}</p><h1 class="mt-1 text-[25px] font-bold leading-tight text-[#3d397c]">Masque Pass</h1><p class="mt-1 break-words text-[11px] font-semibold text-[#547c98]">{season.name}</p><span class="mt-3 inline-flex items-center gap-1 rounded-md border border-white bg-white/90 px-2 py-1 text-[10px] text-[#6b7f95]"><Clock3 size={12} />เหลือ {Math.floor(remaining / 86_400_000)} วัน {Math.floor(remaining / 3_600_000) % 24} ชม.</span></div>
    <div class="pointer-events-none absolute right-0 bottom-5 h-44 w-[43%]">{#if finalAvatar}{#if finalWing}<img class="absolute inset-0 h-full w-full scale-125 object-contain" src={finalWing.imagePath} alt="" />{/if}<span class="relative block h-full w-full"><AssetPortrait src={finalAvatar.imagePath} alt={finalAvatar.name} placeholder={finalAvatar.placeholder} kind="avatar" /></span>{:else if finalReward}<span class="grid h-full w-full place-items-center"><RewardIcon type={finalReward.type} itemId={finalReward.itemId} size={96} /></span>{:else}<span class="relative block h-full w-full"><AssetPortrait src={hero.imagePath} alt={hero.name} placeholder={hero.placeholder} kind="avatar" /></span>{/if}</div>
    <span class="absolute right-2 bottom-2 flex max-w-[46%] items-center gap-1 rounded-md border border-white bg-[#fff2c9]/95 px-2 py-1 text-[8px] font-semibold text-[#a06e20]"><Crown size={11} />LV.{season.premium.length} · {finalReward?.title}</span>
  </section>

  <section class="flex items-center gap-3 border-b border-white px-1 pb-4" aria-label="เลเวล Pass">
    <div class="relative grid size-16 shrink-0 place-content-center justify-items-center rounded-lg border-2 border-white bg-[#ede5ff] text-[#6651a4] shadow-[0_4px_0_#c7bbe9]"><small class="text-[8px] font-bold">{progress.complete ? 'BONUS' : 'LEVEL'}</small><strong class="text-[26px] font-bold leading-none tabular-nums">{progress.level}</strong></div>
    <div class="min-w-0 flex-1 space-y-2"><div class="flex items-baseline justify-between gap-2 text-[10px]"><strong class="text-[#685799]">{progress.mainLevel}/50 ขั้นหลัก</strong><span class="tabular-nums text-[#8795a8]">{pass.xp.toLocaleString()} XP</span></div><progress class="h-3 w-full border border-white accent-sky-600" value={progress.withinLevel} max={100} aria-label="XP สู่เลเวลถัดไป"></progress><span class="block text-[9px] text-[#7b8fa1]">อีก {100 - progress.withinLevel} XP → LV.{progress.level + 1}</span></div>
  </section>

  {#if plan}
    <section class="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border-2 border-white bg-[#fff3cb]/95 py-3 pr-3 pl-[66px] shadow-[0_4px_0_#e8c67d]" aria-label="VIP Pass 30 วัน">
      <span class="absolute top-1/2 left-1 block h-14 w-14 -translate-y-1/2"><PassArtwork kind="crest" /></span>
      <div class="min-w-0">
        <h2 class="text-[13px] font-bold text-[#8f6524]">{vipActive ? 'VIP Pass กำลังใช้งาน' : 'VIP Pass · 30 วัน'}</h2>
        <p class="mt-1 text-[9px] text-[#866b3a]">{player.demo.config.vipFreeEntry ? 'เกมทั่วไปเข้าไม่หัก Energy' : 'ใช้ Energy ตามปกติ'} · MAX +{player.demo.config.vipEnergyBonus} · ของรางวัล VIP Track</p>
        <small class="block text-[8px] text-[#a58b5e]">{vipActive && player.vipExpiresAt ? `ใช้ได้ถึง ${new Date(player.vipExpiresAt).toLocaleDateString('th-TH')} · ซื้อแพ็กใหม่ได้เมื่อหมดอายุ` : 'แพ็ก LV.1 / LV.20 / LV.30'}</small>
      </div>
      {#if vipActive}<span class="rounded-full border border-white bg-white/80 px-2 py-1 text-[9px] font-bold text-[#8f6524]">ACTIVE</span>{:else}<GameButton size="sm" variant="gold" onclick={() => onVip(plan.id)}>เลือกแพ็ก</GameButton>{/if}
    </section>
  {/if}

  <div class="sticky top-[76px] z-20 grid grid-cols-2 gap-1 rounded-lg border-2 border-white bg-[#e7f2fc]/95 p-1 pb-2 backdrop-blur-md" role="tablist" aria-label="หมวด Pass">{#each [{ id: 'rewards' as const, label: 'รางวัล', icon: Gift }, { id: 'missions' as const, label: 'ภารกิจ', icon: Target }] as item (item.id)}<button class={['flex min-h-11 items-center justify-center gap-2 rounded-md text-xs font-semibold transition-[transform,background-color] duration-150 active:translate-y-0.5 motion-reduce:transition-none', tab === item.id ? 'bg-[#63a9ca] text-white shadow-[0_3px_0_#3d82a6]' : 'text-[#7b8fa1]']} role="tab" aria-selected={tab === item.id} onclick={() => { tab = item.id; }}><item.icon size={16} />{item.label}</button>{/each}</div>

  {#if tab === 'rewards'}
    <h2 class="text-sm font-bold">รางวัล 50 เลเวล</h2>
    {#if progress.complete}<section class="flex items-center gap-3 rounded-lg border border-sky-200 bg-white/85 p-3" aria-label="โบนัสหลังเลเวล 50"><RewardIcon type={bonus.reward.type} size={44} /><div class="min-w-0 flex-1"><h2 class="flex items-center gap-1 text-xs font-bold"><Infinity size={14} />โบนัส LV.{bonus.level}</h2><p class="mt-1 text-[10px] text-[#7b8fa1]">{bonus.reward.title} · {bonus.level * 100} XP</p></div><GameButton size="sm" disabled={!bonus.ready} onclick={onBonus}>รับโบนัส</GameButton></section>{/if}
    {#if milestone && !progress.complete}<div class="flex items-center gap-3 border-y border-amber-100 bg-white/65 px-2 py-3"><RewardIcon type={milestone.type} itemId={milestone.itemId} size={44} /><div class="min-w-0"><small class="text-[9px] font-semibold text-amber-600">NEXT MILESTONE · LV.{nextMilestone}</small><strong class="block break-words text-xs">{milestone.title}</strong></div></div>{/if}
    {#key season.id}<PassRewardTrack {player} {season} xp={pass.xp} claims={pass.claims} {premium} level={progress.level} {available} {onClaim} {onClaimAll} />{/key}
  {:else}
    <section class="grid gap-3" aria-label="ภารกิจ Pass">
      {#each [{ id: daily.id, title: 'ประจำวัน', description: `เล่นจบ ${daily.target} รอบ`, count: daily.count, target: daily.target, xp: daily.xp, action: () => onMission(), icon: Target }, { id: weekly.id, title: 'ประจำสัปดาห์', description: `เล่นต่างกัน ${weekly.target} เกม`, count: weekly.games.length, target: weekly.target, xp: weekly.xp, action: onWeekly, icon: Trophy }] as mission (mission.id)}
        {@const claimed = player.demo.missionClaims.includes(mission.id)}
        <article class="space-y-3 rounded-lg border border-white bg-white/85 p-3"><div class="flex items-center gap-2"><mission.icon size={23} class="text-sky-600" /><div><h2 class="text-sm font-bold">{mission.title} · {mission.description}</h2><p class="text-[10px] text-[#7b8fa1]">+{mission.xp} Pass XP</p></div></div><progress class="h-1.5 w-full accent-sky-600" max={mission.target} value={mission.count} aria-label={mission.title}></progress><div class="flex items-center justify-between gap-2"><span class="text-xs tabular-nums">{Math.min(mission.count, mission.target)} / {mission.target}</span>{#if claimed}<span class="flex items-center gap-1 text-xs text-sky-700"><Check size={14} />รับแล้ว</span>{:else}<GameButton size="sm" variant={mission.count >= mission.target ? 'gold' : 'ghost'} onclick={() => mission.count >= mission.target ? mission.action() : onPlay()}>{mission.count >= mission.target ? 'รับ XP' : 'ไปเล่น'}</GameButton>{/if}</div></article>
      {/each}
    </section>
    <h2 class="flex items-center gap-1 text-sm font-bold"><Sparkles size={16} />ภารกิจรายเกม</h2>
    <div class="space-y-3" aria-label="ภารกิจรายเกม">{#each player.demo.config.games.filter((game) => game.published !== false) as game (game.id)}{@const mission = gameMission(player, game.id)}<article class="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-3 rounded-lg border border-white bg-white/80 p-3"><img class="h-12 w-12 rounded-md bg-white object-contain" src={`images/${game.cover}`} alt="" /><div class="min-w-0"><h3 class="text-xs font-bold leading-snug">{game.name}</h3><p class="mt-1 text-[10px] text-[#7b8fa1]">จบ {mission.target} รอบ · +{mission.xp} XP · +{mission.points} MP</p><progress class="mt-2 h-1.5 w-full accent-sky-600" max={mission.target} value={mission.count} aria-label={`ภารกิจ ${game.name}`}></progress><div class="mt-2 flex items-center justify-between gap-2"><span class="text-xs tabular-nums">{Math.min(mission.count, mission.target)} / {mission.target}</span><GameButton size="sm" variant={mission.count >= mission.target ? 'gold' : 'ghost'} onclick={() => mission.count >= mission.target ? onMission(game.id) : onPlay(game.id)}>{mission.count >= mission.target ? 'รับรางวัล' : 'ไปเล่น'}</GameButton></div></div></article>{/each}</div>
  {/if}
</div>