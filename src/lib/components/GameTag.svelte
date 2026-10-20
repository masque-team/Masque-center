<script lang="ts">
  import { Flame, Sparkles, Star } from '@lucide/svelte';
  import type { EditorialGameTag } from '../types';

  let { tag, size = 'sm' }: { tag: EditorialGameTag; size?: 'sm' | 'lg' } = $props();

  const LABELS: Record<EditorialGameTag, string> = { hot: 'HOT', new: 'NEW', pick: 'PICK' };
  let iconSize = $derived(size === 'lg' ? 16 : 12);
</script>

<span class={`tag ${tag} ${size}`}>
  {#if tag === 'hot'}<Flame size={iconSize} fill="currentColor" />
  {:else if tag === 'new'}<Sparkles size={iconSize} fill="currentColor" />
  {:else}<Star size={iconSize} fill="currentColor" />{/if}
  {LABELS[tag]}
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 9px 4px 7px;
    border: 2px solid #fff;
    border-radius: 11px 15px 12px 14px;
    box-shadow: 0 4px 9px rgb(40 30 90 / 30%), inset 0 1px 0 rgb(255 255 255 / 45%);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.4px;
    line-height: 1;
    transform: rotate(-3deg);
    text-shadow: 0 1px 0 rgb(0 0 0 / 22%);
  }
  .lg { padding: 7px 13px 7px 10px; font-size: 15px; border-radius: 13px 18px 14px 17px; }
  .hot { color: #fff; background: linear-gradient(135deg, #ffb347, #ff5f3d); }
  .new { color: #fff; background: linear-gradient(135deg, #a58cf5, #4fcfa8); }
  .pick { color: #6b4300; background: linear-gradient(135deg, #fff08f, #ffc02e); text-shadow: 0 1px 0 rgb(255 255 255 / 60%); }
</style>
