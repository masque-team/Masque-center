<script lang="ts">
  import type { Snippet } from 'svelte';

  let { tone = 'white', padded = true, children }: {
    tone?: 'white' | 'lilac' | 'gold' | 'mint' | 'sky';
    padded?: boolean;
    children?: Snippet;
  } = $props();
</script>

<section class={`panel ${tone}`} class:padded>{@render children?.()}</section>

<style>
  .panel { min-width: 0; border: 2.5px solid #fff; border-radius: 22px; box-shadow: var(--g-card-shadow); }
  .padded { padding: 13px; }
  .white { background: linear-gradient(160deg, #fff, #f6f2ff); }
  .lilac { background: linear-gradient(150deg, #efe8ff, #d9ccff); }
  .gold { background: linear-gradient(150deg, #fff6cf, #ffe39a); box-shadow: 0 8px 0 -3px #e2b24f, 0 13px 20px rgb(200 140 30 / 22%); }
  .mint { background: linear-gradient(150deg, #effcf5, #d6f5e6); box-shadow: 0 8px 0 -3px #9fd9bb, 0 13px 20px rgb(40 120 100 / 16%); }
  .sky { background: linear-gradient(150deg, #eaf6ff, #cfe8ff); box-shadow: 0 8px 0 -3px #9cc6f2, 0 13px 20px rgb(60 110 190 / 16%); }
</style>
