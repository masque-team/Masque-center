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
  <div bind:this={toolbar} class="sticky top-[138px] z-10 space-y-2 rounded-2xl border-2 border-white bg-[#e8f3fc]/95 px-3 pt-2.5 pb-2 shadow-[0_4px_0_#c6d8ec] backdrop-blur-md" aria-label="ควบคุมเส้นทาง Pass">
    <div class="flex min-h-10 items-center justify-between gap-2">
      <div class="min-w-0 flex-1">
        <strong class="block text-xs font-black tabular-nums text-[#3f3782]">
          LV.{level} <span class="text-[10px] font-bold text-[#7c8da3]">/ {season.free.length}</span>
        </strong>
        <span class="text-[9px] font-bold tabular-nums text-[#6d8099]">{xp % 100} / 100 XP</span>
      </div>
      <button
        class="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-white bg-white text-sky-700 shadow-[0_2px_0_#c7daec] transition-transform active:scale-95 motion-reduce:transition-none"
        title={`ไปเลเวลปัจจุบัน ${level}`}
        aria-label="ไปเลเวลปัจจุบัน"
        onclick={() => current()}
      >
        <LocateFixed size={17} />
      </button>
      <button
        class="flex min-h-9 shrink-0 items-center gap-1 rounded-xl border-2 border-white bg-gradient-to-b from-[#65c2f5] to-[#3992c9] px-3 text-[10px] font-black text-white shadow-[0_2px_0_#246c9b] transition-transform active:scale-95 disabled:opacity-40"
        disabled={available === 0}
        onclick={onClaimAll}
      >
        <CheckCheck size={14} />รับทั้งหมด{available ? ` (${available})` : ''}
      </button>
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-white/90 p-0.5 shadow-inner" role="progressbar" aria-label="XP ในเลเวลปัจจุบัน" aria-valuemin="0" aria-valuemax="100" aria-valuenow={xp % 100}>
      <span class="block h-full rounded-full bg-gradient-to-r from-[#4facfe] to-[#7b68ee]" style:width={`${Math.max(4, xp % 100)}%`}></span>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-2 pt-0.5 text-center text-[10px] font-black">
      <span class="flex items-center justify-center gap-1 rounded-lg bg-white/75 py-1 text-sky-700"><Gift size={13} />FREE TRACK</span>
      <span class="text-[9px] text-[#7c8da3]">LV.</span>
      <span class="flex items-center justify-center gap-1 rounded-lg bg-[#fff3c4]/90 py-1 text-[#8f5700]"><Crown size={13} fill="currentColor" class="text-amber-500" />VIP TRACK</span>
    </div>
  </div>

  <div bind:this={path} class="mt-2 w-full min-w-0" role="region" aria-label="รางรางวัล">
    {#each season.free as freeReward, index (index)}
      {@const tier = index + 1}
      {@const reached = xp >= tier * 100}
      {@const currentTier = tier === Math.max(1, Math.min(season.free.length, level))}
      <div class="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-stretch gap-x-2" data-current={currentTier} data-tier={tier}>
        {#each [{ track: 'free' as const, reward: freeReward }, { track: 'premium' as const, reward: season.premium[index] }] as cell (cell.track)}
          {@const done = claims.includes(`${cell.track}-${index}`)}
          {@const vipLocked = cell.track === 'premium' && !premium}
          <article
            class={[
              'my-2 grid min-w-0 justify-items-center rounded-2xl border-2 p-2 text-center',
              tier % 5 === 0
                ? 'grid-rows-[72px_32px_14px_40px] border-[#f2cd7a] bg-gradient-to-b from-[#fffdf2] to-[#fff1be] shadow-[0_4px_0_#dfb65e]'
                : cell.track === 'premium'
                  ? 'grid-rows-[56px_32px_14px_40px] border-[#efdba8] bg-[#fffaf0]/95 shadow-[0_3px_0_#e5d3b1]'
                  : 'grid-rows-[56px_32px_14px_40px] border-white bg-[#f7fcff]/95 shadow-[0_3px_0_#c8dce9]',
              currentTier ? 'ring-2 ring-amber-400/80' : '',
            ]}
            style:grid-column={cell.track === 'free' ? 1 : 3}
            style:grid-row={1}
            aria-label={`LV.${tier} ${cell.track === 'free' ? 'Free' : 'VIP'} ${cell.reward.title}`}
          >
            <div class="self-center"><RewardIcon type={cell.reward.type} itemId={cell.reward.itemId} size={tier % 5 === 0 ? 58 : 46} /></div>
            <strong class="line-clamp-2 self-center break-words text-[11px] font-black leading-4 text-[#374863]">{cell.reward.title}</strong>
            <small class="text-[8px] font-bold text-[#8d9bab]">{!done && ownsPassReward(player, cell.reward) ? `ของซ้ำ +${player.demo.config.duplicatePoints} MP` : tier % 5 === 0 ? '★ รางวัลเด่น' : ''}</small>
            {#if done}
              <span class="inline-flex h-8 items-center gap-1 self-center rounded-full bg-emerald-50 px-2.5 text-[10px] font-black text-emerald-700"><Check size={13} strokeWidth={3} />รับแล้ว</span>
            {:else if !reached || vipLocked}
              <span class={['inline-flex h-8 items-center gap-1 self-center rounded-full px-2.5 text-[9px] font-extrabold', vipLocked ? 'bg-amber-100/80 text-amber-800' : 'bg-slate-100 text-[#8896a8]']}>
                <LockKeyhole size={11} />{vipLocked ? 'VIP Pass' : `LV.${tier}`}
              </span>
            {:else}
              <div class="w-full self-center">
                <GameButton block size="sm" variant={cell.track === 'premium' ? 'gold' : 'purple'} label={`รับ LV.${tier} ${cell.track === 'free' ? 'Free' : 'VIP'}`} onclick={() => onClaim(index, cell.track)}>รับเลย</GameButton>
              </div>
            {/if}
          </article>
        {/each}
        <div class="relative col-start-2 row-start-1 grid content-center justify-items-center gap-1" aria-current={currentTier ? 'step' : undefined}>
          <span class="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-[#d5e0ed]" aria-hidden="true"></span>
          <span class="absolute top-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-400 to-purple-500" style:height={`${Math.min(100, Math.max(0, (xp / 100 - index - 0.5) * 100))}%`} aria-hidden="true"></span>
          <span class={['relative z-[1] grid size-9 place-items-center rounded-full border-[3px] text-xs font-black tabular-nums shadow-xs', currentTier ? 'border-amber-400 bg-[#fff5d5] text-amber-800' : reached ? 'border-white bg-gradient-to-b from-[#5ac2fa] to-[#348bc7] text-white' : 'border-white bg-[#e6edf6] text-[#7c8ca3]']}>{tier}</span>
          <span class="relative z-[1] rounded-full border border-white bg-[#eef4ff] px-1.5 py-0.5 text-[8px] font-bold tabular-nums text-[#7c8ca3]">{tier * 100} XP</span>
        </div>
      </div>
    {/each}
  </div>
</section>
