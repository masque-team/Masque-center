<script lang="ts">
  import { Crown, Gem, Sparkles, Star } from '@lucide/svelte';
  import { rarityOf } from '../data/rarity';

  let { rarity, size = 'sm' }: { rarity: string; size?: 'sm' | 'md' } = $props();
  let style = $derived(rarityOf(rarity));
  let iconSize = $derived(size === 'md' ? 13 : 11);
</script>

<span class={`chip ${size}`} style={`--ink:${style.ink};--top:${style.top};--bottom:${style.bottom}`}>
  {#if rarity === 'Legendary'}<Crown size={iconSize} fill="currentColor" />
  {:else if rarity === 'VIP'}<Crown size={iconSize} fill="currentColor" />
  {:else if rarity === 'Epic'}<Gem size={iconSize} fill="currentColor" />
  {:else if rarity === 'Rare'}<Sparkles size={iconSize} fill="currentColor" />
  {:else}<Star size={iconSize} fill="currentColor" />{/if}
  {style.label}
</span>

<style>
  .chip { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px 2px 5px; border: 1.5px solid #fff; border-radius: 99px; color: var(--ink); background: linear-gradient(180deg, var(--top), var(--bottom)); box-shadow: 0 2px 4px rgb(60 40 140 / 20%); font-size: 10px; font-weight: 900; letter-spacing: 0.3px; line-height: 1.3; white-space: nowrap; }
  .md { padding: 3px 10px 3px 8px; font-size: 12px; }
</style>
