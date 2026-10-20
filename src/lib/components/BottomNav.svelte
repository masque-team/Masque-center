<script lang="ts">
  import { ChartNoAxesColumnIncreasing, Gamepad2, Gift, Heart, UsersRound } from '@lucide/svelte';
  import type { Page } from '../types';

  let { page }: { page: Page } = $props();
</script>

<nav class="bottom-nav" aria-label="เมนูหลัก">
  <a class:active={page === 'home'} href="#home" aria-current={page === 'home' ? 'page' : undefined}>
    <Gamepad2 size={20} strokeWidth={2.2} /><span>เกม</span>
  </a>
  <a class:active={page === 'rewards'} href="#rewards" aria-current={page === 'rewards' ? 'page' : undefined}>
    <Gift size={20} strokeWidth={2.2} /><span>รางวัล</span>
  </a>
  <a class:active={page === 'ranking'} href="#ranking" aria-current={page === 'ranking' ? 'page' : undefined}>
    <ChartNoAxesColumnIncreasing size={20} strokeWidth={2.2} /><span>อันดับ</span>
  </a>
  <a class:active={page === 'avatar'} href="#avatar" aria-current={page === 'avatar' ? 'page' : undefined}>
    <Heart size={20} strokeWidth={2.2} /><span>คอลเลกชัน</span>
  </a>
  <a class:active={page === 'room'} href="#room" aria-current={page === 'room' ? 'page' : undefined}>
    <UsersRound size={20} strokeWidth={2.2} /><span>เพื่อน</span>
  </a>
</nav>