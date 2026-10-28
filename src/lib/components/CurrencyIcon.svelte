<script lang="ts">
  import { Coins, Swords, Ticket } from '@lucide/svelte';
  import { CURRENCY_ARTWORK } from '../data/config';

  let { kind, size = 22, className = '' }: {
    kind: 'points' | 'arenaTicket' | 'petGachaTicket';
    size?: number;
    className?: string;
  } = $props();
  let failed = $state(false);
  let src = $derived(CURRENCY_ARTWORK[kind]);
</script>

{#if failed}
  {#if kind === 'points'}<Coins {size} class={className} />{:else if kind === 'arenaTicket'}<Swords {size} class={className} />{:else}<Ticket {size} class={className} />{/if}
{:else}
  <img class={`inline-block shrink-0 object-contain ${className}`} {src} width={size} height={size} alt="" aria-hidden="true" onerror={() => { failed = true; }} />
{/if}