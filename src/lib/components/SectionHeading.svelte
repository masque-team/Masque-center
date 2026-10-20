<script lang="ts">
  import type { Snippet } from 'svelte';

  let { eyebrow, title, chip, icon }: { eyebrow?: string; title: string; chip?: string; icon?: Snippet } = $props();
</script>

<div class="heading">
  <div>
    {#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
    <h2>{#if icon}<span class="icon">{@render icon()}</span>{/if}{title}</h2>
  </div>
  {#if chip}<span class="chip">{chip}</span>{/if}
</div>

<style>
  .heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; margin: 0 2px 9px; }
  .eyebrow { margin: 0; color: #8a7fc4; font-size: 10px; font-weight: 900; letter-spacing: 0.8px; }
  h2 { display: flex; align-items: center; gap: 7px; margin: 1px 0 0; color: var(--g-ink, #2a2f63); font-size: 19px; font-weight: 900; line-height: 1.15; }
  .icon { display: inline-flex; color: #f08a3c; }
  .chip { padding: 5px 10px; border: 1.5px solid #fff; border-radius: 99px; color: #6a52c8; background: #ece6ff; box-shadow: 0 2px 6px rgb(90 70 160 / 14%); font-size: 11px; font-weight: 900; white-space: nowrap; }
</style>
