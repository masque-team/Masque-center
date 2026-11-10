<script lang="ts">
  import { untrack } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { Check, Sparkles, Target, Trophy, X, Zap } from '@lucide/svelte';
  import { BADGE_ARTWORK, PASS_ARTWORK } from '../data/config';

  import { hudStartTimes, HUD_DURATION, HUD_LIMIT, type HudNotificationItem } from '../services/missionHud';

  let {
    items = [],
    motionReduced = false,
    hidden = false,
    onDismiss,
  }: {
    items: HudNotificationItem[];
    motionReduced?: boolean;
    hidden?: boolean;
    onDismiss: (id: string) => void;
  } = $props();

  let revealedIds = $state<string[]>([]);
  let filledIds = $state<string[]>([]);
  let scheduled = new Map<string, number>();

  $effect(() => {
    const at = Date.now();
    scheduled = hudStartTimes(items.map((item) => item.id), scheduled, at, motionReduced);
    const timers: number[] = [];
    untrack(() => {
      revealedIds = revealedIds.filter((id) => scheduled.has(id));
      filledIds = filledIds.filter((id) => scheduled.has(id));
    });
    items.forEach((item) => {
      const enterDelay = Math.max(0, scheduled.get(item.id)! - at);
      const fillDelay = Math.max(0, scheduled.get(item.id)! + (motionReduced ? 0 : 120) - at);
      const dismissDelay = Math.max(0, scheduled.get(item.id)! + HUD_DURATION - at);

      timers.push(window.setTimeout(() => {
        if (!revealedIds.includes(item.id)) {
          revealedIds = [...revealedIds, item.id];
        }
      }, enterDelay));

      timers.push(window.setTimeout(() => {
        if (!filledIds.includes(item.id)) {
          filledIds = [...filledIds, item.id];
        }
      }, fillDelay));

      timers.push(window.setTimeout(() => {
        onDismiss(item.id);
      }, dismissDelay));
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  });

  let visibleItems = $derived(items.filter((item) => revealedIds.includes(item.id)).slice(0, HUD_LIMIT));
</script>

{#if visibleItems.length > 0 && !hidden}
  <aside
    class="hud-layer"
    aria-live="polite"
    aria-label="ความคืบหน้าภารกิจ"
  >
    {#each visibleItems as item (item.id)}
      {@const isComplete = item.after >= item.target}
      {@const startPct = Math.min(100, Math.round((item.before / Math.max(1, item.target)) * 100))}
      {@const endPct = Math.min(100, Math.round((item.after / Math.max(1, item.target)) * 100))}
      {@const displayPct = filledIds.includes(item.id) || motionReduced ? endPct : startPct}
      <article
        class="hud-card"
        class:is-complete={isComplete}
        class:is-achievement={item.kind === 'achievement'}
        in:fly={{ x: motionReduced ? 0 : -240, duration: motionReduced ? 0 : 300 }}
        out:fade={{ duration: motionReduced ? 0 : 180 }}
        aria-label={`${item.title} ${item.before}/${item.target} ถึง ${item.after}/${item.target}`}
      >
        <button type="button" class="hud-dismiss" aria-label={`ปิดการแจ้งเตือน ${item.title}`} onclick={() => onDismiss(item.id)}><X size={12} /></button>
        <div class="hud-icon" class:complete={isComplete} class:reduced={motionReduced}>
          {#if item.kind === 'achievement' && item.badgeId}
            <img class="size-7 object-contain" src={BADGE_ARTWORK[item.badgeId] ?? BADGE_ARTWORK['first-finish']} alt="" />
          {:else if item.kind === 'checkin'}
            <Zap size={18} fill="currentColor" />
          {:else if isComplete}
            <Check size={18} strokeWidth={3.4} />
          {:else}
            <img class="size-6 object-contain" src={PASS_ARTWORK.crest ?? 'assets/pass/season-crest.png'} alt="" />
          {/if}
        </div>

        <div class="hud-body">
          <div class="hud-top">
            <strong class="hud-title">{item.title}</strong>
            <span class="hud-counter">
              {item.before}/{item.target} → <b>{item.after}/{item.target}</b>
            </span>
          </div>
          {#if item.subtitle}<p class="truncate text-[10px] font-bold text-[#526c9c]">{item.subtitle}</p>{/if}

          <div
            class="hud-bar-track"
            role="progressbar"
            aria-label={item.title}
            aria-valuemin={0}
            aria-valuemax={item.target}
            aria-valuenow={item.after}
          >
            <span
              class="hud-bar-fill"
              class:complete={isComplete}
              style:width={`${displayPct}%`}
            ></span>
          </div>

          <div class="hud-bottom">
            {#if isComplete}
              <span class="hud-complete-label">
                <Sparkles size={11} />
                {item.kind === 'achievement' ? 'ปลดล็อกเหรียญตราแล้ว' : 'ภารกิจสำเร็จ'}
              </span>
            {:else}
              <span class="hud-progress-label">
                <Target size={11} /> กำลังสะสมความคืบหน้า
              </span>
            {/if}

            {#if item.xp > 0}
              <span class="hud-xp-pill">+{item.xp} XP</span>
            {:else if item.rewardText}
              <span class="hud-xp-pill reward">{item.rewardText}</span>
            {:else if item.kind === 'achievement' && isComplete}
              <span class="hud-xp-pill reward"><Trophy size={10} /> เหรียญตราใหม่</span>
            {/if}
          </div>
        </div>
      </article>
    {/each}
  </aside>
{/if}

<style>
  .hud-layer {
    position: fixed;
    top: 66px;
    left: 50%;
    z-index: 65;
    display: flex;
    flex-direction: column;
    gap: 7px;
    width: 100%;
    max-width: 460px;
    padding: 0 12px;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .hud-card {
    position: relative;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 10px;
    width: min(100%, 336px);
    padding: 9px 11px;
    border-radius: 18px;
    border: 2px solid #ffffff;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.97) 0%, rgba(235, 247, 255, 0.97) 100%);
    box-shadow:
      0 4px 0 #8ec5ed,
      0 10px 22px rgba(18, 52, 102, 0.22);
    text-align: left;
    backdrop-filter: blur(8px);
    -webkit-tap-highlight-color: transparent;
  }

  .hud-dismiss {
    position: absolute;
    top: -6px;
    right: -6px;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 2px solid white;
    border-radius: 50%;
    background: #e0f2fe;
    color: #365a8a;
    pointer-events: auto;
    cursor: pointer;
  }

  .hud-card.is-complete {
    border-color: #fff6cc;
    background: linear-gradient(135deg, rgba(255, 253, 242, 0.98) 0%, rgba(255, 241, 184, 0.98) 100%);
    box-shadow:
      0 4px 0 #d99f26,
      0 10px 24px rgba(160, 105, 10, 0.26);
  }

  .hud-icon {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    border-radius: 13px;
    border: 2px solid #fff;
    background: linear-gradient(160deg, #e0f2fe, #bae6fd);
    color: #0284c7;
    box-shadow: 0 2px 0 #7dd3fc;
  }

  .hud-icon.complete {
    background: linear-gradient(160deg, #fde047, #f59e0b);
    color: #5c3400;
    box-shadow: 0 2px 0 #b45309;
    animation: hudPop 0.4s cubic-bezier(0.2, 1.4, 0.4, 1);
  }
  .hud-icon.complete.reduced { animation: none; }

  .hud-body {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 4px;
  }

  .hud-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
  }

  .hud-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 900;
    color: #163b68;
  }

  .hud-card.is-complete .hud-title {
    color: #5c3400;
  }

  .hud-counter {
    flex-shrink: 0;
    font-size: 10.5px;
    font-weight: 800;
    color: #4f7296;
    font-variant-numeric: tabular-nums;
  }

  .hud-counter b {
    font-weight: 900;
    color: #0284c7;
  }

  .hud-card.is-complete .hud-counter b {
    color: #92400e;
  }

  .hud-bar-track {
    height: 7px;
    width: 100%;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }

  .hud-bar-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #38bdf8, #0284c7);
    transition: width 650ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .hud-bar-fill.complete {
    background: linear-gradient(90deg, #22c55e, #f59e0b);
  }

  .hud-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  .hud-complete-label {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 900;
    color: #15803d;
  }

  .hud-progress-label {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 800;
    color: #52739c;
  }

  .hud-xp-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 1px 7px;
    border-radius: 999px;
    background: #16a34a;
    color: #ffffff;
    font-size: 10px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
  }

  .hud-xp-pill.reward {
    background: #d97706;
  }

  @keyframes hudPop {
    0% { transform: scale(0.75); }
    70% { transform: scale(1.12); }
    100% { transform: scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .hud-bar-fill {
      transition: none;
    }
    .hud-icon.complete {
      animation: none;
    }
  }
</style>
