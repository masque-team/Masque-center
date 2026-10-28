<script lang="ts">
  import { Plus } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import EnergyBadge from './EnergyBadge.svelte';
  import { AVATARS, PETS } from '../data/config';
  import { energyCapacity } from '../services/energyService';
  import type { PlayerState } from '../types';

  let { player, vipActive = false, countdown = '', onRefill, onShop, onProfile }: { player: PlayerState; vipActive?: boolean; countdown?: string; onRefill: () => void; onShop: () => void; onProfile: () => void } = $props();
  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === player.petId));
  let isVipLook = $derived(vipActive || avatar.rarity === 'VIP');
</script>

<header class="bar">
  <button class="player" class:vip={isVipLook} onclick={onProfile} aria-label={`Avatar ของ ${player.displayName}`}>
    <span class="thumb" data-frame={player.demo.frameId}>
      <AssetPortrait src={avatar.imagePath} alt="" placeholder={avatar.placeholder} kind="avatar" loading="eager" className="thumb-img" style={`--avatar-color:${avatar.color}`} />
      <span class="lv">{player.level}</span>
      {#if pet}<span class="pet"><AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" /></span>{/if}
    </span>
    <span class="who">
      <strong>{player.displayName}</strong>
      <small>LV.{player.level}</small>
    </span>
  </button>

  <EnergyBadge energy={player.energy} {vipActive} max={energyCapacity(player, vipActive)} {countdown} {onRefill} />

  <button class="wallet" onclick={onShop} aria-label={`เติม Masque Points · ยอด ${player.masquePoints}`}>
    <span class="coin" aria-hidden="true"><CurrencyIcon kind="points" size={25} /></span>
    <strong>{player.masquePoints.toLocaleString('en-US')}</strong>
    <span class="plus" aria-hidden="true"><Plus size={16} strokeWidth={3.5} /></span>
  </button>
</header>

<style>
  .bar { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 10px; min-height: 58px; }
  .pet { position: absolute; bottom: -3px; left: -5px; width: 24px; height: 27px; filter: drop-shadow(0 2px 2px #8b75bb); }
  button { font: inherit; color: inherit; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
  button:focus-visible { outline: 3px solid #7a5ce0; outline-offset: 2px; }

  .player { display: flex; align-items: center; gap: 7px; justify-self: start; min-width: 0; max-width: 100%; padding: 0 9px 0 0; border: 0; border-radius: 99px; background: transparent; text-align: left; }
  .thumb { position: relative; flex: 0 0 auto; width: 44px; height: 44px; }
  .thumb :global(.thumb-img) { width: 44px; height: 44px; border: 2.5px solid #fff; border-radius: 50%; background: var(--avatar-color); box-shadow: 0 0 0 2px #f6c453, 0 4px 8px rgb(70 50 150 / 28%); }
  .player.vip .thumb :global(.thumb-img) { border-color: #fff6b8; box-shadow: 0 0 0 2.5px #ffbe30, 0 0 16px rgb(255 200 50 / 85%), 0 4px 8px rgb(70 50 150 / 28%); }
  .thumb :global(.thumb-img img) { object-fit: cover; object-position: 50% 6%; }
  .lv { position: absolute; right: -4px; bottom: -3px; display: grid; place-items: center; min-width: 19px; height: 19px; padding: 0 3px; border: 1.5px solid #fff; border-radius: 99px; color: #fff; background: linear-gradient(160deg, #a78bfa, #6a4fd6); font-size: 10px; font-weight: 900; line-height: 1; }
  .who { display: grid; min-width: 0; gap: 1px; }
  .who strong { overflow: hidden; color: #2b2468; font-size: 14px; font-weight: 900; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
  .who small { color: #8a7fc4; font-size: 11px; font-weight: 800; }


  .wallet { display: inline-flex; align-items: center; gap: 6px; justify-self: end; min-height: 44px; padding: 3px 4px 3px 4px; border: 2px solid #fff; border-radius: 99px; background: linear-gradient(180deg, #fff, #f1ecff); box-shadow: 0 3px 0 #cfc3f2, 0 6px 10px rgb(70 50 150 / 16%); }
  .wallet:active { transform: translateY(2px); box-shadow: 0 1px 0 #cfc3f2; }
  .coin { display: grid; place-items: center; width: 30px; height: 30px; border: 2px solid #fff8d2; border-radius: 50%; color: #7a4a00; background: linear-gradient(160deg, #ffe58a, #ffb42b); box-shadow: 0 2px 0 #c4770d; font-size: 15px; font-weight: 900; }
  .wallet strong { color: #2b2468; font-size: 14px; font-weight: 900; font-variant-numeric: tabular-nums; }
  .plus { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; color: #fff; background: linear-gradient(160deg, #a78bfa, #6a4fd6); box-shadow: 0 2px 0 #4b32a8; }

  @media (max-width: 420px) {
    .bar { gap: 8px; }
    .who strong { font-size: 13px; }
    .wallet { gap: 4px; }
    .wallet strong { font-size: 13px; }
  }
</style>
