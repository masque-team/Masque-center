<script lang="ts">
  import { Crown, Gamepad2, House, ShoppingBag, Trophy } from '@lucide/svelte';
  import type { Page } from '../types';

  let { page }: { page: Page } = $props();

  const TABS = [
    { id: 'home', href: '#home', label: 'HOME', icon: House },
    { id: 'shop', href: '#shop', label: 'SHOP', icon: ShoppingBag },
    { id: 'hub', href: '#hub', label: 'GAME', icon: Gamepad2 },
    { id: 'rewards', href: '#rewards', label: 'Battle Pass', icon: Crown },
    { id: 'achievements', href: '#achievements', label: 'Achievement', icon: Trophy },
  ] as const;
</script>

<nav
  class="bottom-nav"
  aria-label="เมนูหลัก"
>
  {#each TABS as tab (tab.id)}
    {@const Icon = tab.icon}
    {@const isActive =
      page === tab.id ||
      (page === 'missions' && tab.id === 'rewards') ||
      (page === 'detail' && tab.id === 'hub') ||
      ((page === 'campaigns' || page === 'campaign' || page === 'ranking') && tab.id === 'hub') ||
      (page === 'vip' && tab.id === 'shop')}
    <a
      class="nav-tab"
      class:active={isActive}
      href={tab.href}
      aria-label={tab.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <span class="nav-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      </span>
    </a>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    z-index: 20;
    bottom: 0;
    left: 50%;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0;
    width: min(100%, 460px);
    min-height: calc(54px + env(safe-area-inset-bottom, 0px));
    padding: 3px 5px env(safe-area-inset-bottom, 0px);
    border-top: 1px solid rgb(226 232 240 / 92%);
    background: rgb(255 255 255 / 96%);
    box-shadow: 0 -3px 14px rgb(25 55 95 / 8%);
    backdrop-filter: blur(16px);
    transform: translateX(-50%);
    pointer-events: auto;
  }
  .nav-tab {
    position: relative;
    display: grid;
    place-items: center;
    min-width: 0;
    min-height: 48px;
    padding: 2px;
    border: 0;
    border-radius: 12px;
    color: #475569;
    background: transparent;
    pointer-events: auto;
    -webkit-tap-highlight-color: transparent;
    transition: color 160ms ease, background-color 160ms ease;
  }
  .nav-tab.active {
    color: #172554;
  }
  .nav-icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    color: inherit;
    transition: transform 160ms ease;
  }
  .active .nav-icon {
    transform: translateY(-1px);
  }
  .nav-icon :global(svg) { flex-shrink: 0; width: 20px; height: 20px; }
  .nav-tab.active::after {
    position: absolute;
    right: calc(50% - 3px);
    bottom: 1px;
    width: 6px;
    height: 3px;
    border-radius: 99px;
    background: #16233c;
    content: '';
  }
  .nav-tab:focus-visible { outline: 3px solid #0284c7; outline-offset: -2px; }
  .nav-tab:active .nav-icon { transform: scale(0.9); }
  @media (hover: hover) {
    .nav-tab:hover:not(.active) {
      color: #0284c7;
      background: #f8fafc;
    }
  }
  @media (prefers-reduced-motion: reduce) { .nav-tab, .nav-icon { transition: none; } }
</style>
