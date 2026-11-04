<script lang="ts">
  import { Coins, Swords, Ticket, Zap } from '@lucide/svelte';
  import { CURRENCY_ARTWORK } from '../data/config';

  let { kind, size = 22, className = '', showBrandBadge = false }: {
    kind: 'points' | 'aisPoints' | 'arenaTicket' | 'petGachaTicket' | 'energyPotion' | 'campaignTicket';
    size?: number;
    className?: string;
    showBrandBadge?: boolean;
  } = $props();
  let failed = $state(false);
  let src = $derived(CURRENCY_ARTWORK[kind]);
</script>

{#if showBrandBadge && kind === 'aisPoints'}
  <span class="ais-brand-pill {className}" title="AIS Points สะสมจาก myAIS">
    {#if failed}
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="29" fill="#ffffff" stroke="#73c214" stroke-width="4" />
        <circle cx="32" cy="32" r="23" fill="#63b50c" />
        <path d="M 38 14 C 52 14, 56 32, 42 46 C 48 34, 45 20, 38 14 Z" fill="#e4007f" />
        <text x="30" y="42" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="30" fill="#ffffff">P</text>
      </svg>
    {:else}
      <img class="inline-block shrink-0 object-contain" {src} width={size} height={size} alt="AIS Point" onerror={() => { failed = true; }} />
    {/if}
    <span class="ais-brand-label">myAIS Points</span>
  </span>
{:else if failed}
  {#if kind === 'aisPoints'}
    <svg class={`inline-block shrink-0 ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="#ffffff" stroke="#73c214" stroke-width="4" />
      <circle cx="32" cy="32" r="23" fill="#63b50c" />
      <path d="M 38 14 C 52 14, 56 32, 42 46 C 48 34, 45 20, 38 14 Z" fill="#e4007f" />
      <text x="30" y="42" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="30" fill="#ffffff">P</text>
    </svg>
  {:else if kind === 'points'}<Coins {size} class={className} />{:else if kind === 'arenaTicket'}<Swords {size} class={className} />{:else if kind === 'energyPotion'}<Zap {size} fill="currentColor" class={className} />{:else}<Ticket {size} class={className} />{/if}
{:else}
  <img
    class={`inline-block shrink-0 object-contain ${kind === 'aisPoints' ? 'drop-shadow-[0_2px_4px_rgba(64,138,0,0.28)]' : 'drop-shadow-[0_2px_3px_rgba(60,35,120,0.22)]'} ${className}`}
    {src}
    width={size}
    height={size}
    alt=""
    aria-hidden="true"
    onerror={() => { failed = true; }}
  />
{/if}

<style>
  .ais-brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px 2px 4px;
    border-radius: 999px;
    background: linear-gradient(135deg, #f3fde6, #e1f8c5);
    border: 1.5px solid #76c818;
    color: #245900;
    font-size: 0.68rem;
    font-weight: 900;
    line-height: 1;
    box-shadow: 0 2px 4px rgba(56, 118, 0, 0.12);
  }
  .ais-brand-label {
    letter-spacing: 0.01em;
  }
</style>
