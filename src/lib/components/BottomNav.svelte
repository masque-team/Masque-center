<script lang="ts">
  import { ChartNoAxesColumnIncreasing, Gamepad2, Ticket } from '@lucide/svelte';

  let { page }: { page: 'home' | 'pass' | 'ranking' | 'game' } = $props();
</script>

<nav class="bottom-nav" aria-label="เมนูหลัก">
  <a class:active={page === 'home'} href="#home" aria-current={page === 'home' ? 'page' : undefined}>
    <Gamepad2 size={20} strokeWidth={2.2} /><span>เกม</span>
  </a>
  <a class:active={page === 'pass'} href="#pass" aria-current={page === 'pass' ? 'page' : undefined}>
    <Ticket size={20} strokeWidth={2.2} /><span>Pass</span>
  </a>
  <a class:active={page === 'ranking'} href="#ranking" aria-current={page === 'ranking' ? 'page' : undefined}>
    <ChartNoAxesColumnIncreasing size={20} strokeWidth={2.2} /><span>อันดับ</span>
  </a>
</nav>