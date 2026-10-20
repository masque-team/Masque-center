<script lang="ts">
  import { ShoppingBag, Crown, Gamepad2, Globe, Sparkles } from '@lucide/svelte';
  import type { Page } from '../types';

  let { page }: { page: Page } = $props();

  const TABS = [
    { id: 'home', href: '#home', label: 'เกม', icon: Gamepad2 },
    { id: 'world', href: '#world', label: 'World', icon: Globe },
    { id: 'shop', href: '#shop', label: 'Shop', icon: ShoppingBag },
    { id: 'rewards', href: '#rewards', label: 'Pass', icon: Crown },
    { id: 'avatar', href: '#avatar', label: 'Avatar', icon: Sparkles },
  ] as const;
</script>

<nav class="dock" aria-label="เมนูหลัก">
  {#each TABS as tab (tab.id)}
    {@const Icon = tab.icon}
    <a class:active={page === tab.id || (page === 'detail' && tab.id === 'home')} href={tab.href} aria-current={page === tab.id || (page === 'detail' && tab.id === 'home') ? 'page' : undefined}>
      <span class="pill"><Icon size={21} strokeWidth={2.4} /></span>
      <span class="label">{tab.label}</span>
    </a>
  {/each}
</nav>

<style>
  .dock {
    position: fixed;
    right: 50%;
    bottom: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    width: min(100%, 460px);
    padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px));
    transform: translateX(50%);
    border-top: 2.5px solid #fff;
    border-radius: 22px 22px 0 0;
    background: linear-gradient(180deg, #fff, #f1ecff);
    box-shadow: 0 -6px 18px rgb(80 55 170 / 16%);
  }
  a { position: relative; display: grid; justify-items: center; gap: 2px; min-height: 54px; padding-top: 2px; color: #9a90c8; font-weight: 800; -webkit-tap-highlight-color: transparent; transition: color 0.15s ease; }
  a:focus-visible { outline: 3px solid #7a5ce0; outline-offset: -3px; border-radius: 16px; }
  .pill { display: grid; place-items: center; width: 46px; height: 34px; border-radius: 17px; transition: transform 0.18s cubic-bezier(0.3, 1.6, 0.5, 1), background 0.15s ease; }
  .label { font-size: 11px; line-height: 1; white-space: nowrap; }
  a.active { color: #5a3fc0; }
  a.active .pill { color: #fff; background: linear-gradient(160deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8, 0 5px 10px rgb(90 60 200 / 30%); transform: translateY(-3px); }
  a:active .pill { transform: scale(0.92); }
  @media (prefers-reduced-motion: reduce) { .pill { transition: none; } }
</style>
