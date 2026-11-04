<script lang="ts">
  import type { Snippet } from 'svelte';

  let { eyebrow, title, subtitle, icon, action }: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    icon?: Snippet;
    action?: Snippet;
  } = $props();
</script>

<header class="title-card">
  {#if icon}<span class="badge" aria-hidden="true">{@render icon()}</span>{/if}
  <div class="copy">
    {#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
    <h1>{title}</h1>
    {#if subtitle}<p class="sub">{subtitle}</p>{/if}
  </div>
  {#if action}<div class="action">{@render action()}</div>{/if}
</header>

<style>
  .title-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 2.5px solid #fff;
    border-radius: 22px;
    background: linear-gradient(135deg, rgb(255 255 255 / 95%) 0%, rgb(255 250 235 / 92%) 55%, rgb(228 244 255 / 95%) 100%);
    box-shadow: 0 5px 0 #bed6eb, 0 10px 18px rgb(35 75 130 / 12%);
  }
  .badge {
    display: grid;
    place-items: center;
    width: 50px;
    height: 50px;
    flex: 0 0 auto;
    border: 2.5px solid #fff;
    border-radius: 17px;
    color: #704200;
    background: linear-gradient(160deg, #fff3a8 0%, #ffd24c 55%, #f5a623 100%);
    box-shadow: 0 4px 0 #c7810c, 0 6px 12px rgb(180 115 10 / 24%);
  }
  .copy { min-width: 0; flex: 1; }
  .eyebrow {
    margin: 0;
    color: #0284c7;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.8px;
  }
  h1 {
    margin: 1px 0 0;
    color: var(--g-ink);
    font-size: 22px;
    font-weight: 900;
    line-height: 1.15;
    text-shadow: 0 1.5px 0 #fff;
  }
  .sub {
    margin: 2px 0 0;
    color: var(--g-muted);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.35;
  }
  .action { flex: 0 0 auto; }
</style>
