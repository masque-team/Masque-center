<script lang="ts">
  import { Zap } from '@lucide/svelte';

  let { energy, vipActive, countdown = '', onRefill, max = 12 }: {
    energy: number;
    vipActive: boolean;
    countdown?: string;
    max?: number;
    onRefill: () => void;
  } = $props();
</script>

<button class="energy-badge" class:vip={vipActive} onclick={onRefill}
  title={`${vipActive ? 'VIP · ' : ''}Energy ${energy}/${max}${energy < max && countdown ? ` · +1 ใน ${countdown}` : ''}`}
  aria-label={`Energy ${energy}/${max}${energy < max && countdown ? ` · ฟื้น +1 ใน ${countdown}` : ''} · เติมพลังงาน`}
  style={`--energy-fill:${Math.min(100, energy / max * 100)}%`}>
  <span class="dial"><span class="inner"><Zap size={12} fill="currentColor" /><b>{energy}/{max}</b></span></span>
  {#if energy < max && countdown}<small>+1 {countdown}</small>{/if}
</button>

<style>
  .energy-badge { display: grid; grid-template-rows: 42px 10px; justify-items: center; align-content: center; gap: 1px; width: 58px; height: 58px; flex: 0 0 auto; padding: 2px; border: 2px solid #fff; border-radius: 17px; color: #2078b4; background: #eff8fc; box-shadow: 0 3px 0 #bdd0e6; cursor: pointer; }
  .dial { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; background: conic-gradient(#48bce9 var(--energy-fill), #dce8f2 0); }
  .inner { display: grid; place-items: center; align-content: center; width: 34px; height: 34px; border-radius: 50%; background: #fff; }
  b { font-size: 10px; font-weight: 900; line-height: 1.1; }
  small { color: #5d7785; font-size: 7px; font-weight: 800; line-height: 1; white-space: nowrap; }
  .vip { color: #a16a05; background: #fff7df; box-shadow: 0 3px 0 #dfb552; }
  .vip .dial { background: conic-gradient(#ffc546 var(--energy-fill), #fff0c2 0); }
  .vip small { color: #946815; }
  button:focus-visible { outline: 3px solid #7a5ce0; outline-offset: 3px; }
</style>