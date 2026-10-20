<script lang="ts">
  import { ArrowRight, Check, Crown, UsersRound, Zap } from '@lucide/svelte';
  import GameButton from './GameButton.svelte';
  import { VIP_PACKAGES } from '../data/config';

  let { vipActive, vipUntil, onShop, onRoom }: {
    vipActive: boolean;
    vipUntil: string;
    onShop: () => void;
    onRoom: () => void;
  } = $props();

  let startCost = $derived(Math.min(...VIP_PACKAGES.map((pack) => pack.cost)));
</script>

<section class="vip" class:active={vipActive} aria-label="VIP Pass">
  <span class="crown" aria-hidden="true"><Crown size={30} fill="currentColor" /></span>
  <div class="body">
    <h3>{vipActive ? 'VIP กำลังใช้งาน' : 'VIP Pass 5 / 7 วัน'}</h3>
    <p class="sub">{vipActive ? `สิทธิ์ถึง ${vipUntil}` : `เริ่มต้น ${startCost} MP · ราคาตัวอย่าง`}</p>
    <ul>
      <li><Zap size={12} fill="currentColor" />Energy ∞</li>
      <li><Check size={12} strokeWidth={3.5} />รางวัล VIP</li>
      <li><Check size={12} strokeWidth={3.5} />ภารกิจ VIP</li>
    </ul>
  </div>
  <div class="cta">
    <GameButton variant="gold" size="sm" onclick={onShop}>{vipActive ? 'ต่ออายุ' : 'ดูแพ็กเกจ'} <ArrowRight size={14} /></GameButton>
    <button class="room" onclick={onRoom}><UsersRound size={14} />เล่นกับเพื่อน</button>
  </div>
</section>

<style>
  .vip { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 11px; padding: 13px 12px 12px; overflow: hidden; border: 2.5px solid #fff; border-radius: 22px; background: linear-gradient(135deg, #5a3fc8, #8a5ce0 55%, #c48af0); box-shadow: 0 8px 0 -3px #3b2590, 0 13px 22px rgb(70 40 160 / 32%); color: #fff; }
  .vip::before { content: ''; position: absolute; top: -40px; right: -30px; width: 150px; height: 150px; border-radius: 50%; background: radial-gradient(circle, rgb(255 220 120 / 55%), transparent 68%); }
  .vip.active { background: linear-gradient(135deg, #e0a227, #f6c453 55%, #ffe08a); box-shadow: 0 8px 0 -3px #a8741a, 0 13px 22px rgb(190 130 20 / 32%); color: #5b3a00; }
  .crown { display: grid; place-items: center; align-self: start; width: 54px; height: 54px; border: 3px solid #fff; border-radius: 18px; color: #7a4a00; background: linear-gradient(160deg, #fff09a, #ffb42b); box-shadow: 0 4px 0 #c4770d, 0 0 16px rgb(255 205 90 / 60%); animation: float 3s ease-in-out infinite; }
  .body { position: relative; min-width: 0; }
  h3 { margin: 0; font-size: 17px; font-weight: 900; text-shadow: 0 2px 0 rgb(40 20 100 / 35%); }
  .active h3 { text-shadow: 0 1px 0 rgb(255 255 255 / 50%); }
  .sub { margin: 1px 0 6px; color: #eadcff; font-size: 12px; font-weight: 700; }
  .active .sub { color: #7a5200; }
  ul { display: flex; flex-wrap: wrap; gap: 5px; margin: 0; padding: 0; list-style: none; }
  li { display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 99px; background: rgb(255 255 255 / 22%); font-size: 11px; font-weight: 800; }
  .active li { background: rgb(255 255 255 / 55%); }
  .cta { position: relative; display: flex; grid-column: 1 / -1; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; }
  .cta > :global(.gbtn) { flex: 1; }
  .room { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 40px; padding: 0 12px; border: 2px solid rgb(255 255 255 / 70%); border-radius: 14px; color: inherit; background: rgb(255 255 255 / 16%); font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; touch-action: manipulation; }
  .room:active { transform: translateY(2px); }
  .room:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
  @keyframes float { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-4px) rotate(3deg); } }
  @media (prefers-reduced-motion: reduce) { .crown { animation: none; } }
  @media (max-width: 340px) { .crown { width: 46px; height: 46px; } h3 { font-size: 15px; } .room { padding: 0 9px; font-size: 11px; } }
</style>
