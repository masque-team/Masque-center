<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'gold',
    size = 'md',
    disabled = false,
    block = false,
    label,
    onclick,
    children,
  }: {
    variant?: 'gold' | 'purple' | 'mint' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    block?: boolean;
    label?: string;
    onclick?: () => void;
    children?: Snippet;
  } = $props();
</script>

<button class={`gbtn ${variant} ${size}`} class:block {disabled} aria-label={label} {onclick}>
  <span class="face">{@render children?.()}</span>
</button>

<style>
  .gbtn {
    --edge: #c98712;
    --top: #ffe48a;
    --bottom: #ffb92e;
    --ink: #6b4300;
    position: relative;
    display: inline-flex;
    min-width: 0;
    padding: 0 0 4px;
    border: 0;
    border-radius: 15px;
    background: var(--edge);
    box-shadow: 0 6px 12px rgb(60 40 120 / 22%);
    color: var(--ink);
    font: inherit;
    font-weight: 900;
    cursor: pointer;
    touch-action: manipulation;
    transition: transform 0.08s ease, padding 0.08s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .face {
    display: inline-flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    border: 1.5px solid rgb(255 255 255 / 75%);
    border-radius: 13px;
    background: linear-gradient(180deg, var(--top), var(--bottom));
    box-shadow: inset 0 2px 0 rgb(255 255 255 / 55%);
    white-space: nowrap;
  }
  .gbtn:active:not(:disabled) { transform: translateY(3px); padding-bottom: 1px; }
  .gbtn:disabled { filter: saturate(0.3); opacity: 0.62; cursor: not-allowed; }
  .block { display: flex; width: 100%; }
  .gbtn:focus-visible { outline: 3px solid #fff; outline-offset: 2px; box-shadow: 0 0 0 5px #7a5ce0; }

  .sm { min-height: 44px; }
  .sm .face { padding: 0 12px; font-size: 12px; }
  .md { min-height: 46px; }
  .md .face { padding: 0 16px; font-size: 13px; }
  .lg { min-height: 54px; border-radius: 17px; }
  .lg .face { padding: 0 20px; border-radius: 15px; font-size: 16px; }

  .purple { --edge: #4b32a8; --top: #a78bfa; --bottom: #7a5ce0; --ink: #fff; }
  .purple .face { text-shadow: 0 1px 0 rgb(60 30 130 / 55%); }
  .mint { --edge: #198a63; --top: #7ee8b4; --bottom: #2fc48a; --ink: #fff; }
  .mint .face { text-shadow: 0 1px 0 rgb(10 90 60 / 45%); }
  .ghost { --edge: #cfc6ee; --top: #fff; --bottom: #f1ecff; --ink: #5a3fc0; box-shadow: 0 4px 9px rgb(90 70 160 / 12%); }
</style>
