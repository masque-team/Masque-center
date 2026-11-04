<script lang="ts">
  import { Crown, Flag, Gamepad2, House, ShoppingBag } from '@lucide/svelte';
  import type { Page } from '../types';

  let { page }: { page: Page } = $props();

  const TABS = [
    { id: 'home', href: '#home', label: 'HOME', icon: House },
    { id: 'shop', href: '#shop', label: 'SHOP', icon: ShoppingBag },
    { id: 'hub', href: '#hub', label: 'GAME', icon: Gamepad2 },
    { id: 'rewards', href: '#rewards', label: 'Battle Pass', icon: Crown },
    { id: 'missions', href: '#missions', label: 'Mission', icon: Flag },
  ] as const;
</script>

<nav class="fixed right-1/2 bottom-0 z-20 grid w-full max-w-[460px] translate-x-1/2 grid-cols-5 border-t-[2.5px] border-white rounded-t-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,234,255,0.98))] px-2 pt-[5px] pb-[calc(6px+env(safe-area-inset-bottom,0px))] shadow-[0_-6px_20px_rgb(72_48_160_/_18%),inset_0_2px_0_#fff] backdrop-blur-[10px]" aria-label="เมนูหลัก">
  {#each TABS as tab (tab.id)}
    {@const Icon = tab.icon}
    {@const isActive = page === tab.id || (page === 'detail' && tab.id === 'hub')}
    <a class={['relative grid min-h-14 justify-items-center gap-0.5 pt-px font-extrabold [-webkit-tap-highlight-color:transparent] transition-colors duration-150 focus-visible:rounded-2xl focus-visible:outline-[3px_solid_#7a5ce0] focus-visible:outline-offset-[-3px] motion-reduce:transition-none', isActive ? 'text-[#462aa8]' : 'text-[#7c72ad]']} href={tab.href} aria-current={isActive ? 'page' : undefined}>
      <span class={['relative grid h-9 w-12 place-items-center rounded-[18px] [transition:transform_0.2s_cubic-bezier(0.3,1.6,0.5,1),background_0.15s_ease,box-shadow_0.15s_ease] motion-reduce:transition-none', isActive ? '-translate-y-[5px] border-[1.5px] border-[#fff6d6] bg-[linear-gradient(160deg,#ffdf7d_0%,#a584ff_48%,#6747d6_100%)] text-white shadow-[0_3px_0_#492ea3,0_6px_12px_rgb(90_60_200_/_34%)]' : 'active:scale-[0.92]']}>
        <Icon size={tab.id === 'hub' ? 26 : 21} strokeWidth={tab.id === 'hub' ? 2.8 : 2.4} />
      </span>
      <span class="text-[11px] leading-[1.05] tracking-[0.01em] whitespace-nowrap">{tab.label}</span>
    </a>
  {/each}
</nav>
