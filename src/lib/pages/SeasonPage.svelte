<script lang="ts">
  import { Check, Clock3, Crown, Gift, Infinity, Sparkles, Target, Trophy } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import PassRewardTrack from '../components/PassRewardTrack.svelte';
  import { AVATARS } from '../data/config';
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
  let nextMilestone = $derived(Math.min(50, Math.ceil((progress.mainLevel + 1) / 5) * 5));
  let milestone = $derived(season[premium ? 'premium' : 'free'][nextMilestone - 1]);
  let available = $derived((['free', 'premium'] as const).reduce((count, track) => count + (track === 'premium' && !premium ? 0 : season[track].filter((_, index) => pass.xp >= (index + 1) * PASS_RULES.xpPerLevel && !pass.claims.includes(`${track}-${index}`)).length), 0));
  let plan = $derived(player.demo.config.vipPlans.find((item) => item.durationDays === 30 && (item.startLevel ?? 1) === 1) ?? player.demo.config.vipPlans[0]);
</script>

<div class="space-y-4 pb-6 text-[#2d4161]" data-testid="monthly-pass">
  <section class="relative isolate flex min-h-44 items-center overflow-hidden border-y border-white bg-white/60 px-3 py-4" aria-label="ซีซัน Pass">
    <div class="relative z-10 w-2/3"><p class="flex items-center gap-1 text-[10px] font-semibold text-sky-700"><Crown size={13} />{player.demo.config.passAutomatic === false ? 'DEMO PREVIEW' : '30-DAY SEASON'}</p><h1 class="mt-1 text-2xl font-bold">Masque Pass</h1><p class="mt-1 break-words text-xs font-semibold">{season.name}</p><span class="mt-3 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] text-[#6b7f95]"><Clock3 size={12} />เหลือ {Math.floor(remaining / 86_400_000)} วัน {Math.floor(remaining / 3_600_000) % 24} ชม.</span><p class="mt-2 text-[9px] text-[#7b8fa1]">{season.starts} ถึง {season.ends} · UTC</p></div>
    <div class="absolute right-0 bottom-0 h-44 w-32"><AssetPortrait src={hero.imagePath} alt={hero.name} placeholder={hero.placeholder} kind="avatar" /></div>
  </section>

  <section class="space-y-2 border-b border-white pb-4" aria-label="เลเวล Pass">
    <div class="flex items-end justify-between gap-2"><div><small class="text-[10px] text-[#7b8fa1]">{progress.complete ? 'BONUS LEVEL' : 'PASS LEVEL'}</small><strong class="ml-2 text-3xl font-bold tabular-nums text-[#4f4792]">{progress.level}</strong><span class="ml-1 text-xs text-[#8b98a9]">{progress.complete ? '+' : '/ 50'}</span></div><span class="text-xs tabular-nums">{pass.xp.toLocaleString()} XP</span></div>
    <progress class="h-2 w-full accent-sky-600" value={progress.withinLevel} max={100} aria-label="XP สู่เลเวลถัดไป"></progress><div class="flex justify-between gap-2 text-[10px] text-[#7b8fa1]"><span>อีก {100 - progress.withinLevel} XP → LV.{progress.level + 1}</span><span>{progress.mainLevel}/50 ขั้นหลัก</span></div>
  </section>

  {#if plan}<section class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-[#fff7da]/95 p-3" aria-label="VIP Pass 30 วัน"><div class="flex min-w-0 items-center gap-2"><Crown size={25} class="shrink-0 text-amber-500" /><div><h2 class="text-sm font-bold text-[#806020]">{vipActive ? 'VIP Pass กำลังใช้งาน' : 'VIP Pass 30 วัน'}</h2><p class="text-[10px] text-[#9b885c]">{player.demo.config.vipFreeEntry ? 'เข้าเกม 0 Energy · ' : ''}MAX Energy +{player.demo.config.vipEnergyBonus} · รางวัล VIP</p><small class="text-[9px] text-[#9b885c]">{vipActive && player.vipExpiresAt ? `ใช้ได้ถึง ${new Date(player.vipExpiresAt).toLocaleDateString('th-TH')}` : 'แพ็กปกติ / แพ็กเริ่ม LV.30'}</small></div></div><GameButton size="sm" variant="gold" onclick={() => onVip(plan.id)}>{vipActive ? 'ซื้อเวลาเพิ่ม' : 'ซื้อ VIP Pass'}</GameButton></section>{/if}

  <div class="sticky top-[76px] z-20 grid grid-cols-2 gap-1 rounded-lg border border-white bg-[#edf4ff]/95 p-1 backdrop-blur-md" role="tablist" aria-label="หมวด Pass">{#each [{ id: 'rewards' as const, label: 'รางวัล', icon: Gift }, { id: 'missions' as const, label: 'ภารกิจ', icon: Target }] as item (item.id)}<button class={['flex min-h-11 items-center justify-center gap-2 rounded-md text-xs font-semibold', tab === item.id ? 'bg-white text-indigo-800 shadow-sm' : 'text-[#7b8fa1]']} role="tab" aria-selected={tab === item.id} onclick={() => { tab = item.id; }}><item.icon size={16} />{item.label}</button>{/each}</div>

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