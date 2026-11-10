<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'gold',
    size = 'md',
    disabled = false,
    type = 'button',
    block = false,
    label,
    onclick,
    children,
  }: {
    variant?: 'gold' | 'purple' | 'mint' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    block?: boolean;
    label?: string;
    onclick?: () => void;
    children?: Snippet;
  } = $props();
</script>

<button class={`gbtn ${variant} ${size}`} class:block {disabled} {type} aria-label={label} {onclick}>
  <span class="face">{@render children?.()}</span>
</button>

<style>
  .gbtn {
    --edge: #c7810c;
    --top: #fff2a6;
    --mid: #ffd452;
    --bottom: #f6ad1b;
    --ink: #5c3600;
    position: relative;
    display: inline-flex;
    min-width: 0;
    padding: 0 0 4px;
    border: 0;
    border-radius: 16px;
    background: var(--edge);
    box-shadow: 0 6px 14px rgb(35 65 120 / 20%);
    color: var(--ink);
    font: inherit;
    font-weight: 900;
    cursor: pointer;
    touch-action: manipulation;
    transition: transform 0.08s ease, padding 0.08s ease, filter 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .face {
    position: relative;
    display: inline-flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    border: 2px solid rgb(255 255 255 / 90%);
    border-radius: 14px;
    background: linear-gradient(180deg, var(--top) 0%, var(--mid) 48%, var(--bottom) 100%);
    box-shadow: inset 0 2px 0 rgb(255 255 255 / 80%), inset 0 -2px 0 rgb(0 0 0 / 6%);
    white-space: normal;
    text-align: center;
    overflow-wrap: anywhere;
  }
  .gbtn:hover:not(:disabled) { filter: brightness(1.03); }
  .gbtn:active:not(:disabled) { transform: translateY(3px); padding-bottom: 1px; }
  .gbtn:disabled { filter: saturate(0.25); opacity: 0.58; cursor: not-allowed; }
  .block { display: flex; width: 100%; }
  .gbtn:focus-visible { outline: 3px solid #fff; outline-offset: 2px; box-shadow: 0 0 0 5px #38bdf8; }

  .sm { min-height: 42px; }
  .sm .face { padding: 0 12px; font-size: 12px; }
  .md { min-height: 46px; }
  .md .face { padding: 0 16px; font-size: 13px; }
  .lg { min-height: 54px; border-radius: 18px; }
  .lg .face { padding: 0 20px; border-radius: 16px; font-size: 16px; }

  /* Sky-Royal Fantasy Variant (replaces harsh dark purple with luminous Sky-Cobalt) */
  .purple {
    --edge: #1e5f99;
    --top: #7dd3fc;
    --mid: #38bdf8;
    --bottom: #0284c7;
    --ink: #ffffff;
  }
  .purple .face { text-shadow: 0 1.5px 0 rgb(12 58 105 / 55%); }

  /* Mint-Aqua Variant */
  .mint {
    --edge: #157a6e;
    --top: #72efdd;
    --mid: #2ec4b6;
    --bottom: #189ab4;
    --ink: #ffffff;
  }
  .mint .face { text-shadow: 0 1.5px 0 rgb(12 75 70 / 50%); }

  /* Ivory Cream Ghost Variant */
  .ghost {
    --edge: #b8cfe3;
    --top: #ffffff;
    --mid: #fffdf7;
    --bottom: #eaf4fc;
    --ink: #24436c;
    box-shadow: 0 4px 10px rgb(35 75 130 / 12%);
  }
</style>
