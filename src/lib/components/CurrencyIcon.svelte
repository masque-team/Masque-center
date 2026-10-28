<script lang="ts">
  import { Coins, Swords, Ticket, Zap } from '@lucide/svelte';
  import { CURRENCY_ARTWORK } from '../data/config';

  let { kind, size = 22, className = '' }: {
    kind: 'points' | 'aisPoints' | 'arenaTicket' | 'petGachaTicket' | 'energyPotion';
    size?: number;
    className?: string;
  } = $props();
  let failed = $state(false);
  let src = $derived(CURRENCY_ARTWORK[kind]);
</script>

{#if failed}
  {#if kind === 'points' || kind === 'aisPoints'}<Coins {size} class={className} />{:else if kind === 'arenaTicket'}<Swords {size} class={className} />{:else if kind === 'energyPotion'}<Zap {size} fill="currentColor" class={className} />{:else}<Ticket {size} class={className} />{/if}
{:else}
  <img class={`inline-block shrink-0 object-contain drop-shadow-[0_2px_3px_rgba(60,35,120,0.22)] ${className}`} {src} width={size} height={size} alt="" aria-hidden="true" onerror={() => { failed = true; }} />
{/if}
