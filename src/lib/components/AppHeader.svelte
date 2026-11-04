<script lang="ts">
  import { Mail, Crown, ShoppingBag } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import EnergyBadge from './EnergyBadge.svelte';
  import { AVATARS, PETS, PROFILE_FRAMES } from '../data/config';
  import { energyCapacity } from '../services/energyService';
  import type { PlayerState } from '../types';

  let { player, vipActive = false, hasUnread = false, countdown = '', onRefill, onShop, onProfile, onHistory }: { player: PlayerState; vipActive?: boolean; hasUnread?: boolean; countdown?: string; onRefill: () => void; onShop: () => void; onProfile: () => void; onHistory: () => void } = $props();
  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === player.petId));
  let frame = $derived(player.demo.frameId ? PROFILE_FRAMES.find((item) => item.id === player.demo.frameId) ?? null : null);
  let isVipLook = $derived(vipActive || avatar.rarity === 'VIP');
</script>

<header class="bar">
  <button class="player" class:vip={isVipLook} onclick={onProfile} aria-label={`Avatar ของ ${player.displayName}`}>
    <span class="thumb" data-frame={player.demo.frameId}>
      <AssetPortrait src={avatar.imagePath} alt="" placeholder={avatar.placeholder} kind="avatar" loading="eager" className="thumb-img" style={`--avatar-color:${avatar.color}`} />
      {#if frame}
        <img class="frame-ring" src={frame.imagePath} alt="" aria-hidden="true" />
      {/if}
      <span class="lv">{player.level}</span>
      {#if pet}<span class="pet"><AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" /></span>{/if}
    </span>
    <span class="who">
      <strong class="flex items-center gap-1">
        <span class="truncate">{player.displayName}</span>
        {#if vipActive}<Crown size={12} class="shrink-0 text-amber-500" fill="currentColor" />{/if}
      </strong>
      <small>LV.{player.level}{vipActive ? ' · VIP' : ''}</small>
    </span>
  </button>

  <EnergyBadge energy={player.energy} {vipActive} max={energyCapacity(player, vipActive)} {countdown} {onRefill} />

  <button class="history" class:has-unread={hasUnread} onclick={onHistory} aria-label="History and notifications" title="History and notifications">
    <Mail size={18} />
    {#if hasUnread}<span class="unread" aria-label="รายการใหม่"></span>{/if}
  </button>

  <button class="wallet" onclick={onShop} aria-label={`AIS Point จาก myAIS · ยอด ${player.aisPoints}`} title="AIS Points สะสมจาก myAIS · แตะเพื่อไปหน้าร้านค้า">
    <span class="coin" aria-hidden="true"><CurrencyIcon kind="aisPoints" size={28} /></span>
    <span class="wallet-text">
      <small class="ais-micro">myAIS</small>
      <strong>{player.aisPoints.toLocaleString('en-US')}</strong>
    </span>
    <span class="shop-badge" aria-hidden="true"><ShoppingBag size={13} strokeWidth={2.6} /></span>
  </button>
</header>

<style>
  .bar { display: grid; grid-template-columns: minmax(0, 1fr) auto auto auto; align-items: center; gap: 7px; min-height: 58px; }
  .pet { position: absolute; bottom: -3px; left: -5px; z-index: 3; width: 24px; height: 27px; filter: drop-shadow(0 2px 3px rgba(30, 60, 110, 0.35)); }
  button { font: inherit; color: inherit; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
  button:focus-visible { outline: 3px solid #2b8fd6; outline-offset: 2px; }

  .player {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-self: start;
    min-width: 0;
    max-width: 100%;
    padding: 3px 10px 3px 3px;
    border: 2px solid #fff;
    border-radius: 99px;
    background: linear-gradient(180deg, #ffffff 0%, #f2f9ff 100%);
    box-shadow: 0 3px 0 #bed6eb, 0 5px 10px rgb(35 75 130 / 12%);
    text-align: left;
    transition: transform 0.1s ease;
  }
  .player:active { transform: translateY(2px); }
  .player.vip {
    background: linear-gradient(180deg, #fffef7 0%, #fff3cc 100%);
    box-shadow: 0 3px 0 #dfb456, 0 5px 12px rgb(180 125 20 / 18%);
  }
  .thumb { position: relative; flex: 0 0 auto; width: 42px; height: 42px; }
  .thumb :global(.thumb-img) {
    width: 42px;
    height: 42px;
    border: 2.5px solid #fff;
    border-radius: 50%;
    background: var(--avatar-color);
    box-shadow: 0 0 0 2px #5ac2fa, 0 3px 6px rgb(35 75 130 / 22%);
  }
  .frame-ring {
    position: absolute;
    inset: -4px;
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    object-fit: contain;
    pointer-events: none;
    z-index: 2;
    filter: drop-shadow(0 2px 4px rgba(34, 20, 62, 0.28));
  }
  .player.vip .thumb :global(.thumb-img) {
    border-color: #fff8d6;
    box-shadow: 0 0 0 2.5px #ffbe30, 0 0 12px rgb(255 200 50 / 75%);
  }
  .thumb :global(.thumb-img img) { object-fit: cover; object-position: 50% 6%; }
  .lv {
    position: absolute;
    right: -4px;
    bottom: -3px;
    z-index: 3;
    display: grid;
    place-items: center;
    min-width: 19px;
    height: 19px;
    padding: 0 4px;
    border: 1.5px solid #fff;
    border-radius: 99px;
    color: #fff;
    background: linear-gradient(160deg, #38bdf8, #0284c7);
    font-size: 10px;
    font-weight: 900;
    line-height: 1;
    box-shadow: 0 2px 0 #0369a1;
  }
  .who { display: grid; min-width: 0; gap: 1px; }
  .who strong { overflow: hidden; color: #1f305e; font-size: 13.5px; font-weight: 900; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
  .who small { color: #52739c; font-size: 10.5px; font-weight: 800; }

  .history {
    position: relative;
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 2px solid #fff;
    border-radius: 15px;
    color: #1e5f99;
    background: linear-gradient(180deg, #ffffff 0%, #e3f4ff 100%);
    box-shadow: 0 3px 0 #a8cbe8, 0 5px 10px rgb(35 75 130 / 12%);
    transition: transform 0.1s ease;
  }
  .history:active { transform: translateY(2px); }
  .history.has-unread {
    background: linear-gradient(180deg, #fffdf4 0%, #ffefc2 100%);
    color: #8a5200;
    box-shadow: 0 3px 0 #dfb456;
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
    box-shadow: 0 0 8px #f43f5e;
  }

  .wallet {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    justify-self: end;
    min-height: 44px;
    padding: 3px 5px 3px 4px;
    border: 2px solid #fff;
    border-radius: 99px;
    background: linear-gradient(180deg, #f8fff0 0%, #e4f8c8 100%);
    box-shadow: 0 3px 0 #7dc42b, 0 6px 12px rgb(68 128 15 / 16%);
    transition: transform 0.1s ease;
  }
  .wallet:active { transform: translateY(2px); box-shadow: 0 1px 0 #7dc42b; }
  .coin { display: grid; place-items: center; width: 28px; height: 28px; }
  .wallet-text { display: grid; text-align: left; line-height: 1; gap: 1px; }
  .ais-micro { color: #3d7d00; font-size: 8.5px; font-weight: 900; letter-spacing: 0.02em; }
  .wallet strong { color: #1f4d00; font-size: 13px; font-weight: 900; font-variant-numeric: tabular-nums; }
  .shop-badge {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border: 1.5px solid #fff;
    border-radius: 50%;
    color: #fff;
    background: linear-gradient(160deg, #73c214, #4b9400);
    box-shadow: 0 2px 0 #366b00;
  }

  @media (max-width: 350px) {
    .bar { gap: 4px; }
    .player { padding-right: 7px; gap: 5px; }
    .wallet { gap: 3px; padding-right: 4px; }
    .wallet strong, .who strong { font-size: 12px; }
    .ais-micro { display: none; }
    .history { width: 38px; height: 38px; }
  }
</style>
