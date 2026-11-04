<script lang="ts">
  import { AVATARS, PROFILE_FRAMES } from '../data/config';
  import AssetPortrait from './AssetPortrait.svelte';

  let {
    avatarId = 'mali',
    frameId = null,
    size = 'md',
    level = undefined,
    rank = undefined,
    showRarity = false,
  }: {
    avatarId?: string;
    frameId?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    level?: number;
    rank?: number;
    showRarity?: boolean;
  } = $props();

  const avatar = $derived(AVATARS.find((entry) => entry.id === avatarId) ?? AVATARS[0]);
  const frame = $derived(frameId ? PROFILE_FRAMES.find((entry) => entry.id === frameId) ?? null : null);
</script>

<div
  class="avatar-frame-wrap size-{size}"
  data-frame={frame?.id ?? 'none'}
  data-rarity={frame?.rarity ?? 'Default'}
  title={frame ? `${avatar.name} · ${frame.name} (${frame.rarity})` : avatar.name}
>
  <div class="avatar-frame-core">
    <div class="avatar-inner-clip">
      <AssetPortrait
        src={avatar.imagePath}
        alt={avatar.name}
        placeholder={avatar.placeholder}
        kind="avatar"
        className="avatar-frame-portrait"
        style={`--avatar-color:${avatar.color}`}
      />
    </div>
    {#if frame}
      <img
        class="avatar-frame-overlay"
        src={frame.imagePath}
        alt={frame.name}
        loading="lazy"
        decoding="async"
      />
    {/if}
  </div>

  {#if level !== undefined}
    <span class="avatar-frame-badge level-pill">Lv.{level}</span>
  {/if}
  {#if rank !== undefined && rank <= 3}
    <span class="avatar-frame-badge rank-pill rank-{rank}">#{rank}</span>
  {/if}
  {#if showRarity && frame}
    <span class="avatar-frame-rarity" style="--rarity-color: {frame.color}">{frame.rarity}</span>
  {/if}
</div>

<style>
  .avatar-frame-wrap {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
  }

  .avatar-frame-core {
    position: relative;
    width: var(--af-size, 52px);
    height: var(--af-size, 52px);
    display: grid;
    place-items: center;
    border-radius: 50%;
  }

  .size-xs { --af-size: 38px; --af-inner: 28px; }
  .size-sm { --af-size: 46px; --af-inner: 34px; }
  .size-md { --af-size: 58px; --af-inner: 42px; }
  .size-lg { --af-size: 76px; --af-inner: 55px; }
  .size-xl { --af-size: 96px; --af-inner: 68px; }

  .avatar-inner-clip {
    width: var(--af-inner, 42px);
    height: var(--af-inner, 42px);
    border-radius: 50%;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at 30% 25%, #fff9eb, #e9def8);
    box-shadow: inset 0 2px 4px rgba(45, 29, 75, 0.18);
    z-index: 1;
  }

  .avatar-frame-wrap[data-frame='none'] .avatar-inner-clip {
    width: calc(var(--af-size) - 6px);
    height: calc(var(--af-size) - 6px);
    border: 2.5px solid rgba(255, 255, 255, 0.92);
    box-shadow: 0 3px 8px rgba(67, 43, 104, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.8);
  }

  .avatar-inner-clip :global(.avatar-frame-portrait img) {
    object-fit: cover;
    object-position: 50% 10%;
  }

  .avatar-frame-overlay {
    position: absolute;
    inset: -5%;
    width: 110%;
    height: 110%;
    object-fit: contain;
    pointer-events: none;
    z-index: 2;
    filter: drop-shadow(0 3px 6px rgba(34, 20, 62, 0.28));
  }

  .avatar-frame-wrap[data-rarity='Legendary'] .avatar-frame-overlay {
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.65)) drop-shadow(0 3px 6px rgba(34, 20, 62, 0.35));
    animation: framePulse 2.8s ease-in-out infinite;
  }

  .avatar-frame-wrap[data-rarity='Epic'] .avatar-frame-overlay {
    filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.45)) drop-shadow(0 3px 5px rgba(34, 20, 62, 0.28));
  }

  .avatar-frame-wrap[data-rarity='Seasonal'] .avatar-frame-overlay {
    filter: drop-shadow(0 0 7px rgba(244, 63, 94, 0.45)) drop-shadow(0 3px 5px rgba(34, 20, 62, 0.28));
  }

  .avatar-frame-badge {
    position: absolute;
    z-index: 3;
    font-size: 0.62rem;
    font-weight: 900;
    line-height: 1;
    padding: 2px 5px;
    border-radius: 999px;
    white-space: nowrap;
    box-shadow: 0 2px 5px rgba(27, 17, 48, 0.28);
  }

  .level-pill {
    bottom: -2px;
    right: -2px;
    background: linear-gradient(135deg, #432b68, #2a1847);
    color: #fff8dc;
    border: 1.5px solid #ffd86e;
  }

  .rank-pill {
    top: -3px;
    left: -3px;
    background: linear-gradient(135deg, #ffe066, #f59f00);
    color: #3b2200;
    border: 1.5px solid #fff;
  }

  .rank-pill.rank-2 {
    background: linear-gradient(135deg, #e9ecef, #adb5bd);
    color: #212529;
  }

  .rank-pill.rank-3 {
    background: linear-gradient(135deg, #f8c291, #e58e26);
    color: #3d1e00;
  }

  .avatar-frame-rarity {
    margin-top: 3px;
    font-size: 0.62rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 1px 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.92);
    color: #3a2359;
    border: 1px solid var(--rarity-color, #b39aeb);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  @keyframes framePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
</style>
