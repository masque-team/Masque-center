<script lang="ts">
  import { Coins, Ticket, Zap } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import { AVATARS, PETS } from '../data/config';

  let { type, itemId, size = 52 }: {
    type: 'energy' | 'points' | 'ticket' | 'avatar' | 'pet';
    itemId?: string;
    size?: number;
  } = $props();

  let avatar = $derived(type === 'avatar' ? AVATARS.find((item) => item.id === itemId) : undefined);
  let pet = $derived(type === 'pet' ? PETS.find((item) => item.id === itemId) : undefined);
</script>

<span class={`icon ${type}`} style={`--s:${size}px`}>
  {#if avatar}
    <AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" className="icon-art avatar-art" style={`--avatar-color:${avatar.color}`} />
  {:else if pet}
    <AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" className="icon-art" style={`--pet-color:${pet.color}`} />
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
  .icon :global(.icon-art) { width: 100%; height: 100%; background: transparent; }
  .icon :global(.avatar-art img) { object-fit: cover; object-position: 50% 8%; }
</style>
