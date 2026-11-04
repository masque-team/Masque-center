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
  .heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; margin: 0 2px 6px; }
  .eyebrow { margin: 0; color: #0284c7; font-size: 10px; font-weight: 900; letter-spacing: 0.8px; }
  h2 { display: flex; align-items: center; gap: 7px; margin: 1px 0 0; color: var(--g-ink, #1f305e); font-size: 19px; font-weight: 900; line-height: 1.15; text-shadow: 0 1px 0 #fff; }
  .icon { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; border: 1.5px solid #fff; background: linear-gradient(160deg, #fff2a6, #ffc83d); color: #7a4800; box-shadow: 0 2px 0 #d18e15; }
  .chip { padding: 4px 11px; border: 2px solid #fff; border-radius: 99px; color: #1e5f99; background: linear-gradient(180deg, #fffdf7, #e0f2fe); box-shadow: 0 3px 0 #b8d6ed; font-size: 11px; font-weight: 900; white-space: nowrap; }
</style>
