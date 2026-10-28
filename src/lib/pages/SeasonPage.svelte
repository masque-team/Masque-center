<script lang="ts">
  import { Check, Crown, Gift, LockKeyhole, Target, Waves, Flame } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import { AVATARS } from '../data/config';
  import { currentPass, currentSeason, dayKey, gameMission } from '../services/demoService';
  import type { GameId, PlayerState } from '../types';
  let { player, vipActive = false, onClaim, onPremium, onVip, onMission, onPlay }: {
    player: PlayerState; onClaim: (index: number, track: 'free' | 'premium') => void;
    vipActive?: boolean; onPremium?: () => void; onVip?: (id: string) => void; onMission: (id?: GameId) => void; onPlay: (id?: GameId) => void;
  } = $props();
  let tab = $state<'rewards' | 'missions'>('rewards');
  let pass = $derived(currentPass(player));
  let premium = $derived(vipActive || pass.premium);
  let season = $derived(currentSeason(player));
  let totalXp = $derived(season.free.length * 100);
  let level = $derived(Math.min(season.free.length, Math.floor(pass.xp / 100) + 1));
  let today = $derived(dayKey(player));
  let count = $derived(player.demo.missionCounts[today] ?? 0);
  let claimed = $derived(player.demo.missionClaims.includes(`${season.id}-${today}`));
  let hero = $derived(AVATARS.find((avatar) => avatar.id === (season.theme === 'water' ? 'aqua' : 'luna')) ?? AVATARS[0]);
</script>

<div class="page-stack">
  <PageTitle eyebrow="COLLECT THE SEASON" title="VIP Pass" subtitle={season.name}>{#snippet icon()}<Crown size={26} />{/snippet}</PageTitle>
  <section class="relative isolate flex min-h-52 items-center overflow-hidden border-y border-white/80 bg-white/35 p-4">
    <div class="z-10 w-3/5">
      <span class="inline-flex items-center gap-1 text-xs font-semibold text-sky-700">{#if season.theme === 'water'}<Waves size={14} />{:else}<Flame size={14} />{/if}DEMO SEASON PREVIEW</span>
      <h2 class="mt-2 text-2xl font-bold leading-tight">{season.name}</h2>
      <p class="mt-2 text-xs text-[var(--g-muted)]">{season.starts} / {season.ends}</p>
      <span class="mt-3 inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 text-xs font-bold">{#if premium}<Crown size={13} />VIP PASS{:else}FREE PASS{/if}</span>
    </div>
    <div class="absolute right-0 bottom-0 h-52 w-40"><AssetPortrait src={hero.imagePath} alt={hero.name} placeholder={hero.placeholder} kind="avatar" /></div>
  </section>
  <div class="grid grid-cols-2 gap-3" aria-label="ซื้อ VIP Pass">
    {#each player.demo.config.vipPlans as plan (plan.id)}<article class="grid content-start gap-2 rounded-lg border border-amber-200 bg-white/80 p-3"><h3 class="flex items-center gap-1 text-sm font-bold"><Crown size={15} class="text-amber-500" />VIP Pass {plan.durationDays} วัน</h3><span class="text-[10px] text-[var(--g-muted)]">รางวัล VIP ทุกซีซัน{player.demo.config.vipUnlimited ? ' · Energy ไม่จำกัด' : ''}</span><strong class="text-lg text-indigo-800">{plan.cost} MP</strong><GameButton size="sm" variant="gold" disabled={player.masquePoints < plan.cost} onclick={() => onVip ? onVip(plan.id) : onPremium?.()}>{vipActive ? 'ต่ออายุ' : 'เปิด VIP Pass'}</GameButton></article>{/each}
  </div>
  {#if vipActive && player.vipExpiresAt}<p class="text-center text-xs text-amber-800">VIP ถึง {new Date(player.vipExpiresAt).toLocaleDateString('th-TH')}</p>{/if}
  <div class="space-y-2"><div class="flex items-baseline justify-between"><strong>Tier {level} / {season.free.length}</strong><span class="text-xs">{pass.xp} / {totalXp} Pass XP</span></div><progress class="h-2 w-full accent-sky-600" max={totalXp} value={pass.xp} aria-label="Season XP"></progress></div>
  <div class="grid grid-cols-2 gap-1 rounded-lg bg-white/40 p-1" aria-label="หมวด Battle Pass">
    {#each [{ id: 'rewards' as const, label: 'รางวัล', icon: Gift }, { id: 'missions' as const, label: 'ภารกิจ', icon: Target }] as item (item)}<button class="flex min-h-11 items-center justify-center gap-2 rounded-md text-sm font-semibold" class:bg-white={tab === item.id} aria-pressed={tab === item.id} onclick={() => tab = item.id}><item.icon size={17} />{item.label}</button>{/each}
  </div>
  {#if tab === 'rewards'}
    <div class="grid grid-cols-[28px_1fr_1fr] gap-2 text-center text-xs font-bold"><span>LV</span><span>FREE</span><span class="text-amber-700">VIP PASS</span></div>
    <div class="space-y-3">
      {#each season.free as reward, index (index)}
        <div class="grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)] items-stretch gap-2"><span class="flex items-center justify-center text-sm font-bold">{index + 1}</span>
          {#each [{ track: 'free' as const, reward }, { track: 'premium' as const, reward: season.premium[index] }] as cell (cell)}
            {@const done = pass.claims.includes(`${cell.track}-${index}`)}
            {@const locked = pass.xp < index * 100 || (cell.track === 'premium' && !premium)}
            <article class="flex min-h-40 min-w-0 flex-col items-center justify-between gap-2 rounded-lg border border-white bg-white/60 p-2 text-center" class:opacity-60={locked}>
              <RewardIcon type={cell.reward.type} itemId={cell.reward.itemId} size={46} /><strong class="text-xs leading-snug">{cell.reward.title}</strong>
              {#if done}<span class="flex h-9 items-center gap-1 text-xs text-sky-700"><Check size={14} />รับแล้ว</span>{:else if locked}<span class="flex h-9 items-center gap-1 text-xs text-[var(--g-muted)]"><LockKeyhole size={13} />{cell.track === 'premium' && !premium ? 'VIP Pass' : `${index * 100} XP`}</span>{:else}<GameButton size="sm" variant={cell.track === 'premium' ? 'gold' : 'purple'} onclick={() => onClaim(index, cell.track)}>รับรางวัล</GameButton>{/if}
            </article>
          {/each}
        </div>
      {/each}
    </div>
  {:else}
    <div class="space-y-3" aria-label="ภารกิจรายเกม">
      {#each player.demo.config.games.filter((game) => game.published !== false) as game (game.id)}
        {@const mission = gameMission(player, game.id)}
        <article class="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-3 rounded-lg border border-white bg-white/80 p-3"><img class="h-14 w-14 rounded-md bg-white object-contain" src={`images/${game.cover}`} alt="" /><div class="min-w-0"><h3 class="text-sm font-bold leading-snug">{game.name}</h3><p class="mt-1 text-[10px] text-[var(--g-muted)]">จบ {mission.target} รอบ · +{mission.xp} XP · +{mission.points} MP</p><progress class="mt-2 h-1.5 w-full accent-sky-600" max={mission.target} value={mission.count} aria-label={`ภารกิจ ${game.name}`}></progress><div class="mt-2 flex items-center justify-between gap-2"><span class="text-xs tabular-nums">{Math.min(mission.count, mission.target)} / {mission.target}</span><GameButton size="sm" variant={mission.count >= mission.target ? 'gold' : 'ghost'} onclick={() => mission.count >= mission.target ? onMission(game.id) : onPlay(game.id)}>{mission.count >= mission.target ? 'รับรางวัล' : 'ไปเล่น'}</GameButton></div></div></article>
      {/each}
    </div>
    <section class="space-y-4 border-y border-white py-4"><div class="flex items-center gap-3"><Target size={28} class="text-sky-600" /><div><h2 class="font-bold">เล่นจบ {player.demo.config.missionTarget} เกม</h2><p class="text-xs text-[var(--g-muted)]">ประจำวัน · +{player.demo.config.missionXp} Pass XP</p></div></div><progress class="h-2 w-full accent-sky-600" max={player.demo.config.missionTarget} value={count} aria-label="ความคืบหน้าภารกิจ"></progress>
      <div class="flex items-center justify-between"><span class="text-sm">{Math.min(count, player.demo.config.missionTarget)} / {player.demo.config.missionTarget}</span>{#if claimed}<span class="flex items-center gap-1 text-sm"><Check size={16} />รับแล้ววันนี้</span>{:else if count >= player.demo.config.missionTarget}<GameButton size="sm" onclick={onMission}>รับ XP</GameButton>{:else}<GameButton size="sm" onclick={onPlay}>ไปเล่นเกม</GameButton>{/if}</div>
    </section>
  {/if}
</div>