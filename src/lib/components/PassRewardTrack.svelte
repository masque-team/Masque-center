<script lang="ts">
  import { onMount } from 'svelte';
  import { Check, CheckCheck, Crown, Gift, LocateFixed, LockKeyhole } from '@lucide/svelte';
  import GameButton from './GameButton.svelte';
  import RewardIcon from './RewardIcon.svelte';
  import { ownsPassReward } from '../services/demoService';
  import type { DemoSeason, PlayerState } from '../types';

  let { player, season, xp, claims, premium, level, available, onClaim, onClaimAll }: {
    player: PlayerState; season: DemoSeason; xp: number; claims: string[]; premium: boolean; level: number;
    onClaim: (index: number, track: 'free' | 'premium') => void;
    available: number; onClaimAll: () => void;
  } = $props();
  let path = $state<HTMLDivElement>();
  let toolbar = $state<HTMLDivElement>();
  function behavior(): ScrollBehavior { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'; }
  function current(smooth = true) {
    const target = path?.querySelector<HTMLElement>('[data-current="true"]');
    if (!target) return;
    window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - 142 - (toolbar?.getBoundingClientRect().height ?? 100)), behavior: smooth ? behavior() : 'instant' });
  }
  onMount(() => {
    const frame = requestAnimationFrame(() => { if (level > 1) current(false); });
    return () => cancelAnimationFrame(frame);
  });
</script>

<section class="relative min-w-0" aria-label="เส้นทางรางวัล Pass">
  <div bind:this={toolbar} class="sticky top-[140px] z-10 space-y-2 border-y-2 border-white bg-[#e8f3fc]/95 px-2 pt-2 backdrop-blur-md" aria-label="ควบคุมเส้นทาง Pass">
    <div class="flex min-h-10 items-center justify-between gap-2">
      <div class="min-w-0 flex-1"><strong class="block text-xs tabular-nums text-[#4f4792]">LV.{level} <span class="text-[10px] font-normal text-[#8b98a9]">/ {season.free.length}</span></strong><span class="text-[9px] tabular-nums text-[#8b98a9]">{xp % 100} / 100 XP</span></div>
      <button class="grid size-10 shrink-0 place-items-center rounded-md border border-white bg-white text-sky-700 transition-transform active:scale-95 motion-reduce:transition-none" title={`ไปเลเวลปัจจุบัน ${level}`} aria-label="ไปเลเวลปัจจุบัน" onclick={() => current()}><LocateFixed size={18} /></button>
      <button class="flex min-h-10 shrink-0 items-center gap-1 rounded-md border border-white bg-white px-2 text-[10px] font-semibold text-sky-700 disabled:opacity-40" disabled={available === 0} onclick={onClaimAll}><CheckCheck size={14} />รับทั้งหมด{available ? ` (${available})` : ''}</button>
    </div>
    <progress class="block h-1 w-full accent-sky-600" value={xp % 100} max={100} aria-label="XP ในเลเวลปัจจุบัน"></progress>
    <div class="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-2 py-2 text-center text-[10px] font-semibold"><span class="flex items-center justify-center gap-1 text-sky-700"><Gift size={14} />ฟรี</span><span class="text-[9px] text-[#8b98a9]">LV.</span><span class="flex items-center justify-center gap-1 text-amber-700"><Crown size={14} />VIP</span></div>
  </div>
  <div bind:this={path} class="w-full min-w-0" role="region" aria-label="รางรางวัล">
    {#each season.free as freeReward, index (index)}
      {@const tier = index + 1}
      {@const reached = xp >= tier * 100}
      {@const currentTier = tier === Math.max(1, Math.min(season.free.length, level))}
      <div class="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-stretch gap-x-2" data-current={currentTier} data-tier={tier}>
        {#each [{ track: 'free' as const, reward: freeReward }, { track: 'premium' as const, reward: season.premium[index] }] as cell (cell.track)}
          {@const done = claims.includes(`${cell.track}-${index}`)}
          {@const vipLocked = cell.track === 'premium' && !premium}
          <article class={['my-2 grid min-w-0 justify-items-center rounded-lg border-2 p-2 text-center', tier % 5 === 0 ? 'grid-rows-[72px_32px_14px_44px] border-[#f2cd7a] bg-[#fff7d9]/95 shadow-[0_4px_0_#dfb65e]' : cell.track === 'premium' ? 'grid-rows-[56px_32px_14px_44px] border-[#efdba8] bg-[#fffaf0]/95 shadow-[0_3px_0_#e5d3b1]' : 'grid-rows-[56px_32px_14px_44px] border-white bg-[#f7fcff]/95 shadow-[0_3px_0_#c8dce9]', currentTier ? 'ring-2 ring-amber-300/70' : '']} style:grid-column={cell.track === 'free' ? 1 : 3} style:grid-row={1} aria-label={`LV.${tier} ${cell.track === 'free' ? 'Free' : 'VIP'} ${cell.reward.title}`}>
            <div class="self-center"><RewardIcon type={cell.reward.type} itemId={cell.reward.itemId} size={tier % 5 === 0 ? 58 : 46} /></div>
            <strong class="line-clamp-2 self-center break-words text-[11px] font-semibold leading-4 text-[#40516e]">{cell.reward.title}</strong>
            <small class="text-[8px] text-[#9ba7b6]">{!done && ownsPassReward(player, cell.reward) ? `ของซ้ำ +${player.demo.config.duplicatePoints} MP` : tier % 5 === 0 ? 'ของเด่น' : ''}</small>
            {#if done}<span class="flex h-11 items-center gap-1 text-[10px] text-sky-600"><Check size={14} />รับแล้ว</span>{:else if !reached || vipLocked}<span class={['flex h-11 items-center gap-1 text-[9px]', vipLocked ? 'text-amber-600' : 'text-[#9ba7b6]']}><LockKeyhole size={12} />{vipLocked ? 'VIP Pass' : `LV.${tier}`}</span>{:else}<GameButton size="sm" variant={cell.track === 'premium' ? 'gold' : 'purple'} label={`รับ LV.${tier} ${cell.track === 'free' ? 'Free' : 'VIP'}`} onclick={() => onClaim(index, cell.track)}>รับ</GameButton>{/if}
          </article>
        {/each}
        <div class="relative col-start-2 row-start-1 grid content-center justify-items-center gap-1" aria-current={currentTier ? 'step' : undefined}>
          <span class="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#d5e0ed]" aria-hidden="true"></span>
          <span class="absolute top-0 left-1/2 w-0.5 -translate-x-1/2 bg-sky-400" style:height={`${Math.min(100, Math.max(0, (xp / 100 - index - 0.5) * 100))}%`} aria-hidden="true"></span>
          <span class={['relative z-[1] grid size-9 place-items-center rounded-full border-[3px] text-xs font-bold tabular-nums', currentTier ? 'border-amber-300 bg-[#fff5d5] text-amber-800' : reached ? 'border-white bg-sky-500 text-white' : 'border-white bg-[#e6edf6] text-[#8292a8]']}>{tier}</span>
          <span class="relative z-[1] rounded bg-[#eef4ff] px-1 py-0.5 text-[8px] tabular-nums text-[#94a2b5]">{tier * 100} XP</span>
        </div>
      </div>
    {/each}
  </div>
</section>