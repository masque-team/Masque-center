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

<header class="title">
  {#if icon}<span class="badge" aria-hidden="true">{@render icon()}</span>{/if}
  <div class="copy">
    {#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
    <h1>{title}</h1>
    {#if subtitle}<p class="sub">{subtitle}</p>{/if}
  </div>
  {#if action}<div class="action">{@render action()}</div>{/if}
</header>

<style>
  .title { display: flex; align-items: center; gap: 11px; padding: 4px 2px 0; }
  .badge { display: grid; place-items: center; width: 50px; height: 50px; flex: 0 0 auto; border: 2.5px solid #fff; border-radius: 17px; color: #fff; background: linear-gradient(160deg, #a78bfa, #6a4fd6); box-shadow: 0 4px 0 #4b32a8, 0 8px 14px rgb(80 55 170 / 28%); }
  .copy { min-width: 0; flex: 1; }
  .eyebrow { margin: 0; color: #8a7fc4; font-size: 10px; font-weight: 900; letter-spacing: 0.9px; }
  h1 { margin: 1px 0 0; color: var(--g-ink); font-size: 26px; font-weight: 900; line-height: 1.1; text-shadow: 0 2px 0 #fff; }
  .sub { margin: 3px 0 0; color: var(--g-muted); font-size: 13px; font-weight: 700; line-height: 1.35; }
  .action { flex: 0 0 auto; }
</style>
