<script lang="ts">
  import { Mail, Crown } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import EnergyBadge from './EnergyBadge.svelte';
  import { AVATARS, PETS, PROFILE_FRAMES } from '../data/config';
  import { energyCapacity } from '../services/energyService';
  import type { PlayerState } from '../types';

  let { player, vipActive = false, hasUnread = false, countdown = '', onRefill, onShop, onProfile, onHistory }: {
    player: PlayerState;
    vipActive?: boolean;
    hasUnread?: boolean;
    countdown?: string;
    onRefill: () => void;
    onShop: () => void;
    onProfile: () => void;
    onHistory: () => void;
  } = $props();

  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === player.petId));
  let frame = $derived(player.demo.frameId ? PROFILE_FRAMES.find((item) => item.id === player.demo.frameId) ?? null : null);
  let isVipLook = $derived(vipActive || avatar.rarity === 'VIP');
</script>

<header class="bar">
  <button class="player" class:vip={isVipLook} onclick={onProfile} aria-label={`โปรไฟล์ของ ${player.displayName}`}>
    <span class="thumb" data-frame={player.demo.frameId}>
      <AssetPortrait src={avatar.imagePath} alt="" placeholder={avatar.placeholder} kind="avatar" loading="eager" className="thumb-img" style={`--avatar-color:${avatar.color}`} />
      {#if frame}
        <img class="frame-ring" src={frame.imagePath} alt="" aria-hidden="true" />
      {/if}
      {#if pet}
        <span class="pet"><AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" /></span>
      {/if}
    </span>
    <span class="who">
      <strong class="flex items-center gap-1">
        <span class="truncate">{player.displayName}</span>
        {#if vipActive}<Crown size={11} class="shrink-0 text-amber-500" fill="currentColor" />{/if}
      </strong>
      <small>LV.{player.level}{vipActive ? ' · VIP' : ''}</small>
    </span>
  </button>

  <EnergyBadge energy={player.energy} {vipActive} max={energyCapacity(player, vipActive)} {countdown} {onRefill} />

  <button class="history" class:has-unread={hasUnread} onclick={onHistory} aria-label="ประวัติและแจ้งเตือน" title="ประวัติและแจ้งเตือน">
    <Mail size={17} strokeWidth={2.4} />
    {#if hasUnread}<span class="unread" aria-label="รายการใหม่"></span>{/if}
  </button>

  <button class="wallet" onclick={onShop} aria-label={`AIS Point ${player.aisPoints}`} title="ร้านค้าแลกรางวัล">
    <span class="coin" aria-hidden="true"><CurrencyIcon kind="aisPoints" size={24} /></span>
    <strong>{player.aisPoints.toLocaleString('en-US')}</strong>
  </button>
</header>

<style>
  .bar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto auto;
    align-items: center;
    gap: 6px;
    min-height: 52px;
  }
  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  button:focus-visible {
    outline: 3px solid #2b8fd6;
    outline-offset: 2px;
  }

  /* Unified 44px Control System */
  .player {
    display: flex;
    align-items: center;
    gap: 7px;
    justify-self: stretch;
    min-width: 0;
    height: 44px;
    padding: 3px 9px 3px 4px;
    border: 2px solid #fff;
    border-radius: 15px;
    background: linear-gradient(180deg, #ffffff 0%, #eaf6ff 100%);
    box-shadow: 0 3px 0 #b3d2eb, 0 5px 10px rgb(35 75 130 / 10%);
    text-align: left;
    transition: transform 0.1s ease;
  }
  .player:active {
    transform: translateY(2px);
  }
  .player.vip {
    background: linear-gradient(180deg, #fffef6 0%, #fff2c6 100%);
    box-shadow: 0 3px 0 #dfb552, 0 5px 10px rgb(180 125 20 / 14%);
  }

  .thumb {
    position: relative;
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
  }
  .thumb :global(.thumb-img) {
    width: 34px;
    height: 34px;
    border: 2px solid #fff;
    border-radius: 50%;
    background: var(--avatar-color);
    box-shadow: 0 0 0 1.5px #5ac2fa;
  }
  .frame-ring {
    position: absolute;
    inset: -3px;
    width: calc(100% + 6px);
    height: calc(100% + 6px);
    object-fit: contain;
    pointer-events: none;
    z-index: 2;
    filter: drop-shadow(0 1px 3px rgba(34, 20, 62, 0.25));
  }
  .player.vip .thumb :global(.thumb-img) {
    border-color: #fff8d6;
    box-shadow: 0 0 0 2px #ffbe30;
  }
  .thumb :global(.thumb-img img) {
    object-fit: cover;
    object-position: 50% 6%;
  }
  .pet {
    position: absolute;
    bottom: -3px;
    right: -4px;
    z-index: 3;
    width: 18px;
    height: 20px;
    filter: drop-shadow(0 1px 2px rgba(30, 60, 110, 0.35));
  }

  .who {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 1px;
    line-height: 1.05;
  }
  .who strong {
    overflow: hidden;
    color: #163b68;
    font-size: 12.5px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .who small {
    color: #4f7296;
    font-size: 9.5px;
    font-weight: 800;
    white-space: nowrap;
  }

  .history {
    position: relative;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
    border: 2px solid #fff;
    border-radius: 15px;
    color: #1668a8;
    background: linear-gradient(180deg, #ffffff 0%, #eaf6ff 100%);
    box-shadow: 0 3px 0 #b3d2eb, 0 5px 10px rgb(35 75 130 / 10%);
    transition: transform 0.1s ease;
  }
  .history:active {
    transform: translateY(2px);
  }
  .history.has-unread {
    background: linear-gradient(180deg, #fffef6 0%, #fff2c6 100%);
    color: #8f5806;
    box-shadow: 0 3px 0 #dfb552;
  }
  .unread {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 11px;
    height: 11px;
    border: 2px solid #fff;
    border-radius: 50%;
    background: #f43f5e;
    box-shadow: 0 0 6px #f43f5e;
  }

  .wallet {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    justify-self: end;
    height: 44px;
    padding: 4px 10px 4px 6px;
    border: 2px solid #fff;
    border-radius: 15px;
    background: linear-gradient(180deg, #f8fff0 0%, #e4f8c8 100%);
    box-shadow: 0 3px 0 #7dc42b, 0 5px 10px rgb(68 128 15 / 12%);
    transition: transform 0.1s ease;
  }
  .wallet:active {
    transform: translateY(2px);
  }
  .coin {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
  }
  .wallet strong {
    color: #1f4d00;
    font-size: 12.5px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  @media (max-width: 360px) {
    .bar {
      gap: 4px;
      min-height: 46px;
    }
    .player {
      height: 40px;
      padding: 2px 6px 2px 3px;
      gap: 5px;
      border-radius: 13px;
    }
    .thumb, .thumb :global(.thumb-img) {
      width: 30px;
      height: 30px;
    }
    .who strong {
      font-size: 11.5px;
    }
    .who small {
      font-size: 8.5px;
    }
    .history {
      width: 40px;
      height: 40px;
      border-radius: 13px;
    }
    .wallet {
      height: 40px;
      gap: 4px;
      padding: 3px 7px 3px 5px;
      border-radius: 13px;
    }
    .coin {
      width: 21px;
      height: 21px;
    }
    .wallet strong {
      font-size: 11.5px;
    }
  }
</style>
