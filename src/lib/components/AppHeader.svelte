<script lang="ts">
  import { Gamepad2, Sparkles } from '@lucide/svelte';
  import type { PlayerState } from '../types';

  let { player }: { player: PlayerState } = $props();
</script>

<header class="topbar">
  <a class="brand" href="#home" aria-label="MasqueGame หน้าหลัก">
    <span class="brand-mark"><Gamepad2 size={19} strokeWidth={2.6} /></span>
    <span>Masque<span class="brand-green">Game</span></span>
  </a>
  <div class="account-strip">
    <div class="points-pill" aria-label={`AIS Points ${player.aisPoints}`}>
      <span class="ais-mark">AIS</span>
      <span><small>AIS Points</small><strong>{player.aisPoints.toLocaleString('en-US')}</strong></span>
    </div>
    <div class="level-pill"><Sparkles size={13} /><span>LV.{player.level}</span></div>
  </div>
</header>