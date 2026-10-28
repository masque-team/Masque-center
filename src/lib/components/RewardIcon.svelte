<script lang="ts">
  import { Award, Coins, Frame, Image as ImageIcon, Swords, Ticket, Zap } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import { AVATARS, BADGE_ARTWORK, PETS, PROFILE_BACKGROUNDS, WINGS } from '../data/config';
  import type { DemoReward } from '../types';

  let { type, itemId, size = 52 }: {
    type: DemoReward['type'];
    itemId?: string;
    size?: number;
  } = $props();

  let avatar = $derived(type === 'avatar' ? AVATARS.find((item) => item.id === itemId) : undefined);
  let pet = $derived(type === 'pet' ? PETS.find((item) => item.id === itemId) : undefined);
  let wing = $derived(type === 'wing' ? WINGS.find((item) => item.id === itemId) : undefined);
  let background = $derived(type === 'background' ? PROFILE_BACKGROUNDS.find((item) => item.id === itemId) : undefined);
  let currencyKind: 'points' | 'arenaTicket' | 'petGachaTicket' | undefined = $derived(type === 'points' ? 'points' : type === 'arena-ticket' ? 'arenaTicket' : type === 'ticket' ? 'petGachaTicket' : undefined);
  let badgeArtwork = $derived(type === 'badge' ? BADGE_ARTWORK[itemId ?? ''] : undefined);
</script>

<span class={`icon ${type}`} style={`--s:${size}px`}>
  {#if avatar}
    <AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" className="icon-art avatar-art" style={`--avatar-color:${avatar.color}`} />
  {:else if pet}
    <AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" className="icon-art" style={`--pet-color:${pet.color}`} />
  {:else if wing}<img class="h-full w-full object-contain" src={wing.imagePath} alt={wing.name} />
  {:else if background}<img class="h-full w-full object-cover" src={background.imagePath} alt={background.name} />
  {:else if badgeArtwork}<img class="h-full w-full object-contain" src={badgeArtwork} alt="" />
  {:else if currencyKind}<CurrencyIcon kind={currencyKind} size={size * 0.72} />
  {:else if type === 'frame'}<Frame size={size * 0.5} />
  {:else if type === 'badge'}<Award size={size * 0.5} />
  {:else if type === 'arena-ticket'}<Swords size={size * 0.5} />
  {:else if type === 'background'}<ImageIcon size={size * 0.5} />
  {:else if type === 'energy'}<Zap size={size * 0.5} fill="currentColor" />
  {:else if type === 'ticket'}<Ticket size={size * 0.5} />
  {:else}<Coins size={size * 0.5} />{/if}
</span>

<style>
  .icon { display: grid; place-items: center; width: var(--s); height: var(--s); flex: 0 0 auto; overflow: hidden; border: 2px solid #fff; border-radius: 16px; color: #fff; box-shadow: 0 3px 0 rgb(60 40 140 / 28%); }
  .energy { background: linear-gradient(160deg, #5fd0ff, #2b8ff0); }
  .points { color: #7a4a00; background: linear-gradient(160deg, #fff09a, #ffb42b); }
  .ticket { background: linear-gradient(160deg, #ff9fc2, #c06ae8); }
  .avatar, .pet { background: linear-gradient(160deg, #efe8ff, #cdbdf7); }
  .wing, .frame, .background, .badge, .arena-ticket { color: #947123; background: #fff1c7; }
  .icon :global(.icon-art) { width: 100%; height: 100%; background: transparent; }
  .icon :global(.avatar-art img) { object-fit: cover; object-position: 50% 8%; }
</style>
