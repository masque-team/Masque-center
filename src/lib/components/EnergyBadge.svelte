<script lang="ts">
  import { Zap } from '@lucide/svelte';
  import { ENERGY_CONFIG } from '../data/config';

  let { energy, vipActive, countdown = '', onRefill }: {
    energy: number;
    vipActive: boolean;
    countdown?: string;
    onRefill: () => void;
  } = $props();
</script>

<button class="energy-badge" class:vip={vipActive} onclick={onRefill}
  title={vipActive ? 'VIP · Energy ไม่จำกัด' : `Energy ${energy}/${ENERGY_CONFIG.max}${energy < ENERGY_CONFIG.max ? ` · +1 ใน ${countdown}` : ''}`}
  aria-label={vipActive ? 'Energy ไม่จำกัด' : `Energy ${energy}/${ENERGY_CONFIG.max} · เติมพลังงาน`}
  style={`--energy-fill:${vipActive ? 100 : energy / ENERGY_CONFIG.max * 100}%`}>
  <span><Zap size={12} fill="currentColor" /><b>{vipActive ? '∞' : `${energy}/${ENERGY_CONFIG.max}`}</b></span>
</button>

<style>
  .energy-badge { display: grid; place-items: center; width: 48px; height: 48px; flex: 0 0 auto; padding: 3px; border: 2px solid #fff; border-radius: 50%; color: #2078b4; background: conic-gradient(#48bce9 var(--energy-fill), #dce8f2 0); box-shadow: 0 3px 0 #bdd0e6; cursor: pointer; }
  .energy-badge > span { display: grid; place-items: center; align-content: center; width: 100%; height: 100%; border-radius: 50%; background: #fff; }
  b { font-size: 10px; font-weight: 900; line-height: 1.1; }
  .vip { color: #a16a05; background: conic-gradient(#ffc546 100%, #fff0c2 0); box-shadow: 0 3px 0 #dfb552; }
  .vip b { font-size: 20px; line-height: 0.8; }
  button:focus-visible { outline: 3px solid #7a5ce0; outline-offset: 3px; }
</style>