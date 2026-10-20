<script lang="ts">
  import { Coins, Crown, Gamepad2, ShoppingBag, Sparkles } from '@lucide/svelte';
  import type { PlayerState } from '../types';

  let { player, onShop }: { player: PlayerState; onShop: () => void } = $props();
</script>

<header class="topbar">
  <a class="brand" href="#home" aria-label="MasqueGame หน้าหลัก">
    <span class="brand-mark"><Gamepad2 size={19} strokeWidth={2.6} /></span>
    <span>Masque<span class="brand-green">Game</span></span>
  </a>
  <div class="player-strip">
    <span class="player-avatar">🧑🏻‍🚀</span>
    <span class="player-copy"><strong>{player.displayName}</strong><small><Sparkles size={10} /> LV.{player.level}</small></span>
  </div>
  <div class="account-strip">
    <div class="points-pill" aria-label={`Masque Points ${player.masquePoints}`}>
      <span class="ais-mark"><Coins size={14} /></span>
      <span><small>MP</small><strong>{player.masquePoints.toLocaleString('en-US')}</strong></span>
    </div>
    <button class="shop-icon" aria-label="เปิด Shop" title="Shop" onclick={onShop}><ShoppingBag size={17} /></button>
  </div>
</header>