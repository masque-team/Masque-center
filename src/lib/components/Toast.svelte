<script lang="ts">
  import { CheckCircle2 } from '@lucide/svelte';

  let { message }: { message: string } = $props();
</script>

{#if message}
  <div class="toast" role="status"><CheckCircle2 size={18} />{message}</div>
{/if}

<style>
  .toast { position: fixed; z-index: 80; right: 50%; bottom: calc(86px + env(safe-area-inset-bottom, 0px)); display: flex; align-items: center; gap: 7px; max-width: calc(100% - 24px); padding: 10px 16px 10px 12px; transform: translateX(50%); border: 2.5px solid #fff; border-radius: 99px; color: #fff; background: linear-gradient(180deg, #4fd6a0, #22b57d); box-shadow: 0 4px 0 #168a5f, 0 10px 18px rgb(20 80 60 / 30%); font-size: 13px; font-weight: 900; animation: toast-in 0.28s cubic-bezier(0.2, 1.3, 0.4, 1) both; }
  @keyframes toast-in { from { opacity: 0; transform: translate(50%, 14px) scale(0.9); } to { opacity: 1; transform: translateX(50%); } }
  @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }
</style>
