<script lang="ts">
  import { onMount } from 'svelte';
  import { Check, ChevronLeft, ChevronRight, Crown, Gift, LocateFixed, LockKeyhole } from '@lucide/svelte';
  import GameButton from './GameButton.svelte';
  import RewardIcon from './RewardIcon.svelte';
  import { ownsPassReward } from '../services/demoService';
  import type { DemoSeason, PlayerState } from '../types';

  let { player, season, xp, claims, premium, level, onClaim }: {
    player: PlayerState; season: DemoSeason; xp: number; claims: string[]; premium: boolean; level: number;
    onClaim: (index: number, track: 'free' | 'premium') => void;
  } = $props();
  let rail = $state<HTMLDivElement>();
  let left = $state(0);
  let width = $state(0);
  let maximum = $state(0);
  const COLUMN = 112;
  const LABEL = 48;
  let first = $derived(Math.min(season.free.length, Math.floor(left / COLUMN) + 1));
  let last = $derived(Math.min(season.free.length, Math.max(first, Math.ceil((left + Math.max(0, width - LABEL)) / COLUMN))));
  function measure() {
    if (!rail) return;
    left = rail.scrollLeft; width = rail.clientWidth; maximum = rail.scrollWidth - rail.clientWidth;
  }
  function behavior(): ScrollBehavior { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'; }
  function step(direction: number) {
    rail?.scrollBy({ left: direction * Math.max(COLUMN, Math.floor((width - LABEL) / COLUMN) * COLUMN), behavior: behavior() });
  }
  function current(smooth = true) {
    if (!rail) return;
    const target = Math.max(1, Math.min(season.free.length, level));
    rail.scrollTo({ left: Math.max(0, (target - 1) * COLUMN - Math.max(0, (rail.clientWidth - LABEL - COLUMN) / 2)), behavior: smooth ? behavior() : 'instant' });
    measure();
  }
  onMount(() => {
    const observer = new ResizeObserver(measure);
    if (rail) observer.observe(rail);
    const frame = requestAnimationFrame(() => current(false));
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  });
</script>

<section class="min-w-0 space-y-3" aria-label="เส้นทางรางวัล Pass">
  <div class="flex min-h-11 items-center justify-between gap-2">
    <span class="min-w-0 text-[11px] font-semibold tabular-nums text-[#73849b]">LV.{first}–{last} <span class="text-[#a2afbf]">/ {season.free.length}</span></span>
    <div class="flex shrink-0 items-center gap-1">
      <button class="grid size-10 place-items-center rounded-md border border-white bg-white/85 text-sky-700 transition-transform active:scale-95 motion-reduce:transition-none" title={`ไปเลเวลปัจจุบัน ${level}`} aria-label="ไปเลเวลปัจจุบัน" onclick={() => current()}><LocateFixed size={18} /></button>
      <button class="grid size-10 place-items-center rounded-md border border-white bg-white/85 text-[#596d88] transition-transform active:scale-95 disabled:opacity-30 motion-reduce:transition-none" title="รางวัลก่อนหน้า" aria-label="รางวัลก่อนหน้า" disabled={left <= 1} onclick={() => step(-1)}><ChevronLeft size={18} /></button>
      <button class="grid size-10 place-items-center rounded-md border border-white bg-white/85 text-[#596d88] transition-transform active:scale-95 disabled:opacity-30 motion-reduce:transition-none" title="รางวัลถัดไป" aria-label="รางวัลถัดไป" disabled={left >= maximum - 1} onclick={() => step(1)}><ChevronRight size={18} /></button>
    </div>
  </div>
  <div bind:this={rail} class="relative w-full min-w-0 overflow-x-auto overscroll-x-contain border-y border-white bg-[#eff5ff]/80 pb-2 [scrollbar-width:thin] [scrollbar-color:#b9c9de_transparent]" role="region" aria-label="รางรางวัล" onscroll={measure}>
    <div class="grid w-max grid-rows-[160px_58px_160px]" style:grid-template-columns={`${LABEL}px repeat(${season.free.length}, ${COLUMN}px)`}>
      <div class="sticky left-0 z-10 col-start-1 row-start-1 flex flex-col items-center justify-center gap-2 border-r border-amber-200 bg-[#fff1c8] text-amber-800"><Crown size={20} /><strong class="text-[10px]">VIP</strong>{#if !premium}<LockKeyhole size={12} />{/if}</div>
      <div class="sticky left-0 z-10 col-start-1 row-start-2 grid place-items-center border-r border-white bg-[#edf3fb] text-[9px] font-semibold text-[#899ab0]">LV.</div>
      <div class="sticky left-0 z-10 col-start-1 row-start-3 flex flex-col items-center justify-center gap-2 border-r border-sky-100 bg-[#edf8ff] text-sky-700"><Gift size={20} /><strong class="text-[10px]">ฟรี</strong></div>
      {#each season.free as freeReward, index (index)}
        {@const tier = index + 1}
        {@const reached = xp >= tier * 100}
        {@const currentTier = tier === Math.max(1, Math.min(50, level))}
        <div class="relative grid content-center justify-items-center gap-0.5" style:grid-column={index + 2} style:grid-row={2} aria-current={currentTier ? 'step' : undefined}>
          <span class="absolute inset-x-0 top-[17px] h-1 bg-[#d5e0ed]" aria-hidden="true"></span>
          <span class="absolute top-[17px] left-0 h-1 bg-sky-400" style:width={`${Math.min(100, Math.max(0, (xp / 100 - index - 0.5) * 100))}%`} aria-hidden="true"></span>
          <span class={['relative z-[1] grid size-8 place-items-center rounded-full border-[3px] text-xs font-bold tabular-nums', currentTier ? 'border-amber-300 bg-[#fff5d5] text-amber-800' : reached ? 'border-white bg-sky-500 text-white' : 'border-white bg-[#dce6f1] text-[#8292a8]']}>{tier}</span>
          <span class="text-[8px] tabular-nums text-[#94a2b5]">{tier * 100} XP</span>
        </div>
        {#each [{ track: 'premium' as const, reward: season.premium[index] }, { track: 'free' as const, reward: freeReward }] as cell (cell.track)}
          {@const done = claims.includes(`${cell.track}-${index}`)}
          {@const vipLocked = cell.track === 'premium' && !premium}
          <article class={['m-1 grid min-w-0 grid-rows-[52px_32px_12px_44px] justify-items-center rounded-md border px-1.5 py-1 text-center', tier % 5 === 0 ? 'border-amber-300 bg-[#fff9e8]' : cell.track === 'premium' ? 'border-amber-100 bg-[#fffdf5]' : 'border-white bg-white', currentTier ? 'ring-2 ring-amber-300/70' : '']} style:grid-column={index + 2} style:grid-row={cell.track === 'premium' ? 1 : 3} aria-label={`LV.${tier} ${cell.track === 'free' ? 'Free' : 'VIP'} ${cell.reward.title}`}>
            <RewardIcon type={cell.reward.type} itemId={cell.reward.itemId} size={46} />
            <strong class="line-clamp-2 self-center break-words text-[10px] font-semibold leading-4 text-[#40516e]">{cell.reward.title}</strong>
            <small class="text-[8px] text-[#9ba7b6]">{!done && ownsPassReward(player, cell.reward) ? `ของซ้ำ +${player.demo.config.duplicatePoints} MP` : tier % 5 === 0 ? 'MILESTONE' : ''}</small>
            {#if done}<span class="flex h-11 items-center gap-1 text-[10px] text-sky-600"><Check size={14} />รับแล้ว</span>{:else if !reached || vipLocked}<span class={['flex h-11 items-center gap-1 text-[9px]', vipLocked ? 'text-amber-600' : 'text-[#9ba7b6]']}><LockKeyhole size={12} />{vipLocked ? 'VIP Pass' : `LV.${tier}`}</span>{:else}<GameButton size="sm" variant={cell.track === 'premium' ? 'gold' : 'purple'} label={`รับ LV.${tier} ${cell.track === 'free' ? 'Free' : 'VIP'}`} onclick={() => onClaim(index, cell.track)}>รับ</GameButton>{/if}
          </article>
        {/each}
      {/each}
    </div>
  </div>
</section>