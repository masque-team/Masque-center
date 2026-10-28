<script lang="ts">
  import { Check, Coins, Sparkles } from '@lucide/svelte';
  import GameButton from './GameButton.svelte';

  let { reward, days, claimed, onClaim, compact = false }: {
    reward: number;
    days: { label: string; done: boolean; today: boolean }[];
    claimed: boolean;
    onClaim: () => void;
    compact?: boolean;
  } = $props();
  let doneCount = $derived(days.filter((day) => day.done).length);
</script>

{#if compact}
  <section class="grid min-w-0 gap-2 rounded-lg border border-white bg-white/85 p-3" aria-label="เช็กอินรายวัน"><div class="flex items-center justify-between gap-2"><div class="min-w-0"><h3 class="!text-xs !text-[#365c7a]">เช็กอินรายวัน</h3><span class="text-[10px] font-semibold text-amber-700">+{reward} MP · {doneCount}/7 วัน</span></div><button class="flex min-h-9 shrink-0 items-center gap-1 rounded-md bg-[#5e55b3] px-2 text-[10px] font-semibold text-white disabled:bg-[#bcc7dc]" disabled={claimed} onclick={onClaim}>{#if claimed}<Check size={12} />รับแล้ว{:else}รับเลย{/if}</button></div><div class="grid grid-cols-7 gap-1">{#each days as day (day.label)}<span class={['grid h-7 place-items-center rounded text-[9px] font-semibold', day.done ? 'bg-sky-600 text-white' : day.today ? 'bg-amber-200 text-amber-900' : 'bg-sky-50 text-[#8296a7]']}>{#if day.done}<Check size={11} />{:else}{day.label}{/if}</span>{/each}</div></section>
{:else}
<section class="checkin" class:claimed aria-label="เช็กอินรายวัน">
  <span class="shine" aria-hidden="true"></span>
  <div class="head">
    <div class="gift" class:open={claimed} aria-hidden="true">
      <span class="lid"></span><span class="box"></span><span class="ribbon"></span><i>✦</i><i>✧</i>
    </div>
    <div class="copy">
      <div class="title-row">
        <h3>เช็กอินรายวัน</h3>
        <span class="streak"><Sparkles size={11} />{doneCount}/7 วัน</span>
      </div>
      <p>รับฟรี <b><Coins size={13} />+{reward} MP</b> ทุกวัน</p>
    </div>
    <GameButton variant={claimed ? 'ghost' : 'mint'} size="sm" disabled={claimed} onclick={onClaim}>
      {#if claimed}<Check size={15} strokeWidth={3.5} />รับแล้ว{:else}เช็กอิน{/if}
    </GameButton>
  </div>

  <ol class="days" aria-label="ประวัติเช็กอินสัปดาห์นี้">
    {#each days as day (day.label)}
      <li class:done={day.done} class:today={day.today} class:ready={day.today && !day.done}>
        <small class="lbl">{day.label}</small>
        <span class="stamp">
          {#if day.done}<Check size={14} strokeWidth={3.6} />{:else}<Coins size={12} />{/if}
        </span>
        <span class="amt">+{reward}</span>
      </li>
    {/each}
  </ol>
</section>
{/if}

<style>
  .checkin { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 9px; padding: 11px 11px 10px; overflow: hidden; border: 2.5px solid #fff; border-radius: 22px; background: linear-gradient(155deg, #fffdf6 0%, #eefcf4 52%, #e6f4ff 100%); box-shadow: 0 7px 0 -3px #9fd9bb, 0 12px 18px rgb(40 120 100 / 14%); isolation: isolate; }
  .shine { position: absolute; z-index: -1; top: -36px; right: -24px; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgb(255 235 160 / 60%), transparent 70%); pointer-events: none; }
  .head { display: flex; align-items: center; gap: 9px; min-width: 0; }
  .copy { min-width: 0; flex: 1; display: grid; gap: 2px; }
  .title-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  h3 { margin: 0; color: #1c5340; font-size: 15.5px; font-weight: 900; line-height: 1.15; }
  .streak { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border: 1.5px solid #fff; border-radius: 99px; color: #197a56; background: #d4f5e4; font-size: 10.5px; font-weight: 900; }
  p { display: flex; align-items: center; gap: 4px; margin: 0; color: #547d6e; font-size: 12px; font-weight: 700; }
  p b { display: inline-flex; align-items: center; gap: 3px; padding: 1px 7px; border-radius: 99px; color: #9a5f00; background: #fff0bf; font-weight: 900; }

  .gift { position: relative; width: 46px; height: 46px; flex: 0 0 auto; }
  .box { position: absolute; right: 3px; bottom: 2px; left: 3px; height: 26px; border: 2px solid #fff; border-radius: 6px 6px 8px 8px; background: linear-gradient(160deg, #ff9db8, #ff5f8f); box-shadow: 0 3px 0 #d63d6f; }
  .lid { position: absolute; z-index: 2; right: 1px; bottom: 24px; left: 1px; height: 12px; border: 2px solid #fff; border-radius: 6px; background: linear-gradient(160deg, #ffb4c8, #ff6f9c); box-shadow: 0 2px 0 #d63d6f; transition: transform 0.4s cubic-bezier(0.3, 1.5, 0.5, 1); transform-origin: left bottom; }
  .ribbon { position: absolute; z-index: 3; bottom: 2px; left: 50%; width: 9px; height: 35px; transform: translateX(-50%); background: linear-gradient(180deg, #ffe58a, #ffb92e); box-shadow: 0 0 0 1.5px #fff; }
  .gift i { position: absolute; z-index: 4; top: 1px; right: -1px; color: #ffd34d; font-style: normal; font-size: 12px; text-shadow: 0 0 6px #fff; animation: twinkle 2s ease-in-out infinite; }
  .gift i:nth-of-type(2) { top: 12px; left: -2px; right: auto; font-size: 9px; animation-delay: 0.9s; }
  .gift:not(.open) { animation: wiggle 2.8s ease-in-out infinite; }
  .gift.open .lid { transform: translate(4px, -7px) rotate(-22deg); }

  .days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; margin: 0; padding: 0; list-style: none; }
  li { display: grid; justify-items: center; gap: 2px; padding: 5px 2px 4px; border: 1.5px solid #e4ece8; border-radius: 13px; background: rgb(255 255 255 / 78%); transition: transform 0.2s ease; }
  .lbl { color: #7a889b; font-size: 10px; font-weight: 800; line-height: 1; }
  .stamp { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; color: #b58826; background: #fff3cc; border: 1.5px solid #ffe299; }
  .amt { color: #8c96a9; font-size: 9.5px; font-weight: 800; line-height: 1; }

  li.done { border-color: #b5ebd0; background: linear-gradient(180deg, #effcf5, #d5f6e5); }
  li.done .lbl { color: #1c6b4d; }
  li.done .stamp { color: #fff; border-color: #fff; background: linear-gradient(160deg, #62e3a6, #22b57d); box-shadow: 0 2px 0 #168a5f; }
  li.done .amt { color: #197a56; }

  li.today { border-color: #ffc23d; background: linear-gradient(180deg, #fffdf2, #ffefc2); box-shadow: 0 3px 0 -1px #e5b53d; }
  li.today .lbl { color: #9a5f00; font-weight: 900; }
  li.today .amt { color: #9a5f00; font-weight: 900; }
  li.ready { animation: pulse-tile 1.9s ease-in-out infinite; }
  li.ready .stamp { color: #7a4a00; border-color: #fff; background: linear-gradient(160deg, #ffe98a, #ffb42b); box-shadow: 0 2px 0 #c97f10; }

  @keyframes wiggle { 0%, 80%, 100% { transform: rotate(0); } 85% { transform: rotate(-7deg); } 92% { transform: rotate(7deg); } }
  @keyframes twinkle { 0%, 100% { opacity: 0.35; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  @keyframes pulse-tile { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
  @media (prefers-reduced-motion: reduce) { .gift, .gift i, li.ready { animation: none; } .lid { transition: none; } }
  @media (max-width: 340px) { .head { gap: 6px; } .gift { width: 40px; height: 40px; } .stamp { width: 21px; height: 21px; } h3 { font-size: 14.5px; } .amt { font-size: 9px; } }
</style>
