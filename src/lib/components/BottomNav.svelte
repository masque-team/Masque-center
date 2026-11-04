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
  class="fixed right-1/2 bottom-0 z-20 grid w-full max-w-[460px] translate-x-1/2 grid-cols-5 rounded-t-[26px] border-t-[3px] border-white bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(255,251,240,0.98)_55%,rgba(226,243,255,0.99)_100%)] px-2 pt-[6px] pb-[calc(7px+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgb(30_70_130_/_18%),inset_0_2px_0_#fff] backdrop-blur-[12px]"
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
      class={[
        'relative grid min-h-14 justify-items-center gap-0.5 pt-px font-extrabold [-webkit-tap-highlight-color:transparent] transition-colors duration-150 focus-visible:rounded-2xl focus-visible:outline-[3px_solid_#2b8fd6] focus-visible:outline-offset-[-3px] motion-reduce:transition-none',
        isActive ? 'text-[#1e4b7a]' : 'text-[#6c84a3] hover:text-[#2a5485]',
      ]}
      href={tab.href}
      aria-current={isActive ? 'page' : undefined}
    >
      <span
        class={[
          'relative grid h-9.5 w-12.5 place-items-center rounded-[18px] [transition:transform_0.22s_cubic-bezier(0.3,1.6,0.5,1),background_0.15s_ease,box-shadow_0.15s_ease] motion-reduce:transition-none',
          isActive
            ? '-translate-y-[6px] border-2 border-white bg-[linear-gradient(165deg,#fff2a1_0%,#ffd24c_46%,#38bdf8_100%)] text-[#1d3b66] shadow-[0_4px_0_#c78916,0_7px_14px_rgb(40_95_165_/_28%)]'
            : 'border border-transparent bg-white/50 active:scale-[0.92]',
        ]}
      >
        <Icon size={tab.id === 'hub' ? 25 : 20} strokeWidth={tab.id === 'hub' ? 2.8 : 2.5} />
      </span>
      <span class={['text-[10.5px] leading-[1.05] tracking-[0.01em] whitespace-nowrap', isActive ? 'font-black text-[#1c3d6e]' : 'font-extrabold']}>
        {tab.label}
      </span>
    </a>
  {/each}
</nav>
