<script lang="ts">
  import { Zap } from '@lucide/svelte';

  let { energy, vipActive, countdown = '', onRefill, max = 15 }: {
    energy: number;
    vipActive: boolean;
    countdown?: string;
    max?: number;
    onRefill: () => void;
  } = $props();

  let recharging = $derived(energy < max && Boolean(countdown));
</script>

<button
  class="energy-badge"
  class:vip={vipActive}
  onclick={onRefill}
  title={`${vipActive ? 'VIP · ' : ''}Energy ${energy}/${max}${recharging ? ` · +1 ใน ${countdown}` : ''}`}
  aria-label={`Energy ${energy}/${max}${recharging ? ` · ฟื้น +1 ใน ${countdown}` : ''} · เติมพลังงาน`}
  style={`--energy-fill:${Math.min(100, (energy / Math.max(1, max)) * 100)}%`}
>
  <span class="dial" aria-hidden="true">
    <span class="inner">
      <Zap size={12} fill="currentColor" />
    </span>
  </span>
  <span class="readout">
    <b>{energy}/{max}</b>
    <small>{recharging ? `+1 ${countdown}` : vipActive ? 'VIP MAX' : 'เต็ม'}</small>
  </span>
</button>

<style>
  .energy-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 44px;
    flex: 0 0 auto;
    padding: 4px 8px 4px 5px;
    border: 2px solid #fff;
    border-radius: 15px;
    color: #1668a8;
    background: linear-gradient(180deg, #ffffff 0%, #eaf6ff 100%);
    box-shadow: 0 3px 0 #b3d2eb, 0 5px 10px rgb(35 75 130 / 10%);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.1s ease;
  }
  .energy-badge:active {
    transform: translateY(2px);
  }
  .dial {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: conic-gradient(#38bdf8 var(--energy-fill), #d8e8f4 0);
  }
  .inner {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
  }
  .readout {
    display: grid;
    text-align: left;
    line-height: 1.05;
    gap: 1px;
  }
  b {
    color: #163b68;
    font-size: 11.5px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  small {
    color: #4f7296;
    font-size: 8.5px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .vip {
    color: #9e6200;
    background: linear-gradient(180deg, #fffef6 0%, #fff2c6 100%);
    box-shadow: 0 3px 0 #dfb552, 0 5px 10px rgb(180 125 20 / 14%);
  }
  .vip .dial {
    background: conic-gradient(#f59e0b var(--energy-fill), #fde68a 0);
  }
  .vip b {
    color: #5c3400;
  }
  .vip small {
    color: #8f5806;
  }
  button:focus-visible {
    outline: 3px solid #2b8fd6;
    outline-offset: 2px;
  }

  @media (max-width: 360px) {
    .energy-badge {
      height: 40px;
      gap: 4px;
      padding: 3px 6px 3px 4px;
      border-radius: 13px;
    }
    .dial {
      width: 26px;
      height: 26px;
    }
    .inner {
      width: 19px;
      height: 19px;
    }
    b {
      font-size: 10.5px;
    }
    small {
      font-size: 7.5px;
    }
  }
</style>
