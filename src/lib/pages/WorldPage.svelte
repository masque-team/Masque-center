<script lang="ts">
  import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Camera, Crown, Globe, MapPin, MessageCircle, Send, Shirt, UsersRound } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import { AVATARS, PETS } from '../data/config';
  import type { PlayerState } from '../types';

  let { player, vipActive = false, onNavigate, onToast }: {
    player: PlayerState;
    vipActive?: boolean;
    onNavigate: (route: string) => void;
    onToast: (message: string) => void;
  } = $props();

  const EMOTES = ['👋', '😄', '❤️', '✨'];
  const STEP = 2.4;

  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === player.petId) ?? null);
  let isVipLook = $derived(vipActive || avatar.rarity === 'VIP');
  let x = $state(50);
  let y = $state(78);
  let petX = $state(40);
  let petY = $state(80);
  let facing = $state(1);
  let emote = $state('');
  let walking = $state(false);
  let moveTimer: ReturnType<typeof setInterval> | undefined;
  let emoteTimer: ReturnType<typeof setTimeout> | undefined;

  function step(dx: number, dy: number) {
    x = Math.min(90, Math.max(10, x + dx * STEP));
    y = Math.min(92, Math.max(58, y + dy * STEP * 0.6));
    if (dx) facing = dx > 0 ? 1 : -1;
    petX += (x - facing * 11 - petX) * 0.5;
    petY += (y + 2 - petY) * 0.5;
  }

  function hold(dx: number, dy: number) {
    release();
    walking = true;
    step(dx, dy);
    moveTimer = setInterval(() => step(dx, dy), 60);
  }

  function release() {
    if (moveTimer) clearInterval(moveTimer);
    moveTimer = undefined;
    walking = false;
  }

  function say(value: string) {
    emote = value;
    if (emoteTimer) clearTimeout(emoteTimer);
    emoteTimer = setTimeout(() => (emote = ''), 1700);
  }

  function onKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
    const map: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const move = map[event.key];
    if (!move) return;
    event.preventDefault();
    step(move[0], move[1]);
  }

  $effect(() => () => {
    release();
    if (emoteTimer) clearTimeout(emoteTimer);
  });
</script>

<svelte:window onkeydown={onKey} onblur={release} />

<div class="page-stack">
  <PageTitle eyebrow="DREAM ISLAND" title="World" subtitle="เดินเล่นกับตัวละครและสัตว์เลี้ยง">
    {#snippet icon()}<Globe size={26} />{/snippet}
  </PageTitle>

  <section class="scene" aria-label="พื้นที่ World ตัวอย่าง">
    <span class="sun" aria-hidden="true"></span>
    <span class="cloud c1" aria-hidden="true"></span><span class="cloud c2" aria-hidden="true"></span>
    <span class="hill h1" aria-hidden="true"></span><span class="hill h2" aria-hidden="true"></span>
    <span class="ground" aria-hidden="true"></span>
    <span class="tree t1" aria-hidden="true">🌳</span><span class="tree t2" aria-hidden="true">🌸</span><span class="tree t3" aria-hidden="true">🍄</span>
    <div class="tools">
      <button aria-label="แผนที่" onclick={() => onToast('แผนที่ เร็วๆ นี้')}><MapPin size={19} /></button>
      <button aria-label="ถ่ายรูป" onclick={() => onToast('ถ่ายรูป เร็วๆ นี้')}><Camera size={19} /></button>
    </div>
    <span class="tag"><i></i>พื้นที่ตัวอย่าง · เล่นคนเดียว</span>

    {#if pet}
      <span class="actor pet" style={`left:${petX}%;top:${petY}%;z-index:${Math.round(petY)}`}>
        <AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" className="actor-art" />
      </span>
    {/if}
    <span class="actor me" class:walking class:vip={isVipLook} style={`left:${x}%;top:${y}%;z-index:${Math.round(y)};--flip:${facing}`}>
      {#if emote}<b class="bubble">{emote}</b>{/if}
      {#if isVipLook}<span class="vip-ring" aria-hidden="true"></span><span class="vip-halo" aria-hidden="true"></span>{/if}
      <span class="body"><AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" loading="eager" className="actor-art" /></span>
      <em>{#if isVipLook}<Crown size={10} fill="currentColor" />{/if}{player.displayName}</em>
    </span>
  </section>

  <div class="controls">
    <div class="emotes" role="group" aria-label="อีโมจิ">
      {#each EMOTES as item}<button aria-label={`ส่ง ${item}`} onclick={() => say(item)}>{item}</button>{/each}
    </div>
    <div class="dpad" role="group" aria-label="ปุ่มเดิน">
      <button class="up" aria-label="เดินขึ้น" onpointerdown={() => hold(0, -1)} onpointerup={release} onpointerleave={release} onpointercancel={release}><ArrowUp size={20} strokeWidth={3} /></button>
      <button class="left" aria-label="เดินซ้าย" onpointerdown={() => hold(-1, 0)} onpointerup={release} onpointerleave={release} onpointercancel={release}><ArrowLeft size={20} strokeWidth={3} /></button>
      <button class="right" aria-label="เดินขวา" onpointerdown={() => hold(1, 0)} onpointerup={release} onpointerleave={release} onpointercancel={release}><ArrowRight size={20} strokeWidth={3} /></button>
      <button class="down" aria-label="เดินลง" onpointerdown={() => hold(0, 1)} onpointerup={release} onpointerleave={release} onpointercancel={release}><ArrowDown size={20} strokeWidth={3} /></button>
    </div>
  </div>

  <div class="chat">
    <MessageCircle size={18} />
    <input aria-label="ข้อความ World Chat" disabled placeholder="แชตจะเปิดเมื่อเชื่อมต่อระบบออนไลน์" />
    <span class="send"><Send size={16} /></span>
  </div>

  <div class="links">
    <GameButton variant="purple" size="md" block onclick={() => onNavigate('avatar')}><Shirt size={17} />เปลี่ยน Avatar / Pet</GameButton>
    <GameButton variant="ghost" size="md" block onclick={() => onNavigate('room')}><UsersRound size={17} />Friends Room</GameButton>
  </div>
</div>

<style>
  .scene { position: relative; height: 330px; overflow: hidden; border: 2.5px solid #fff; border-radius: 26px; background: linear-gradient(180deg, #7fc4ff 0%, #c4e4ff 52%, #ffe6f4 100%); box-shadow: var(--g-card-shadow); touch-action: none; }
  .sun { position: absolute; top: 24px; right: 26px; width: 48px; height: 48px; border-radius: 50%; background: radial-gradient(circle, #fff7b0, #ffd04a); box-shadow: 0 0 30px 8px rgb(255 220 100 / 60%); }
  .cloud { position: absolute; width: 74px; height: 24px; border-radius: 99px; background: #fff; opacity: 0.9; box-shadow: 22px -10px 0 4px #fff, 44px 0 0 0 #fff; animation: drift 24s linear infinite; }
  .c1 { top: 62px; left: -80px; } .c2 { top: 112px; left: -200px; animation-delay: -12s; transform: scale(0.7); }
  .hill { position: absolute; bottom: 90px; border-radius: 50% 50% 0 0; }
  .h1 { left: -12%; width: 70%; height: 90px; background: #a8e0a0; } .h2 { right: -16%; width: 74%; height: 120px; background: #8fd69a; }
  .ground { position: absolute; right: 0; bottom: 0; left: 0; height: 46%; background: linear-gradient(180deg, #8fdc8a, #5fc178); border-top: 3px solid rgb(255 255 255 / 60%); }
  .tree { position: absolute; font-size: 34px; filter: drop-shadow(0 3px 2px rgb(40 90 60 / 35%)); }
  .t1 { bottom: 150px; left: 6%; } .t2 { bottom: 140px; right: 8%; } .t3 { bottom: 26px; left: 12%; font-size: 24px; }
  .tools { position: absolute; top: 12px; left: 12px; z-index: 200; display: grid; gap: 7px; }
  .tools button { display: grid; place-items: center; width: 42px; height: 42px; border: 2.5px solid #fff; border-radius: 14px; color: #6a4fd6; background: linear-gradient(180deg, #fff, #ece6ff); box-shadow: 0 3px 0 #b7a6ee; }
  .tag { position: absolute; right: 12px; bottom: 10px; z-index: 200; display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; color: #fff; background: rgb(60 40 130 / 62%); font-size: 11px; font-weight: 800; }
  .tag i { width: 7px; height: 7px; border-radius: 50%; background: #ffd04a; }

  .actor { position: absolute; display: grid; justify-items: center; transform: translate(-50%, -100%); transition: left 0.08s linear, top 0.08s linear; }
  .me { width: 88px; }
  .body { position: relative; display: block; width: 88px; height: 118px; filter: drop-shadow(0 6px 4px rgb(30 70 50 / 35%)); transform: scaleX(var(--flip)); transform-origin: 50% 100%; }
  .me.vip .body { filter: drop-shadow(0 0 10px rgb(255 240 140 / 95%)) drop-shadow(0 0 20px rgb(255 185 35 / 75%)) drop-shadow(0 6px 4px rgb(30 70 50 / 35%)); }
  .vip-ring { position: absolute; bottom: -4px; width: 70px; height: 22px; border: 2px solid #fff3a6; border-radius: 50%; background: radial-gradient(ellipse, rgb(255 230 110 / 85%), rgb(255 180 30 / 40%) 60%, transparent 75%); box-shadow: 0 0 16px rgb(255 200 50 / 85%); pointer-events: none; }
  .vip-halo { position: absolute; top: 10px; width: 92px; height: 92px; border-radius: 50%; background: radial-gradient(circle, rgb(255 240 150 / 60%), transparent 70%); pointer-events: none; }
  .me.walking .body { animation: walk 0.34s ease-in-out infinite; }
  .pet { width: 50px; height: 62px; transition: left 0.28s ease-out, top 0.28s ease-out; filter: drop-shadow(0 4px 3px rgb(30 70 50 / 35%)); }
  .actor :global(.actor-art) { background: transparent; }
  .me em { position: absolute; bottom: -18px; display: inline-flex; align-items: center; gap: 3px; padding: 1px 9px; border-radius: 99px; color: #fff; background: rgb(60 40 130 / 70%); font-size: 11px; font-style: normal; font-weight: 800; white-space: nowrap; }
  .me.vip em { color: #6b3f00; border: 1.5px solid #fff; background: linear-gradient(180deg, #fff2a6, #ffc23d); box-shadow: 0 2px 6px rgb(180 110 0 / 40%); }
  .bubble { position: absolute; top: -26px; display: grid; place-items: center; min-width: 38px; height: 34px; padding: 0 8px; border: 2px solid #fff; border-radius: 14px; background: #fff; box-shadow: 0 3px 8px rgb(40 20 100 / 25%); font-size: 20px; animation: pop 0.3s cubic-bezier(0.2, 1.5, 0.4, 1) both; }

  .controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .emotes { display: grid; grid-template-columns: repeat(2, 52px); gap: 8px; }
  .emotes button { height: 52px; border: 2.5px solid #fff; border-radius: 17px; background: linear-gradient(180deg, #fff, #ece6ff); box-shadow: 0 4px 0 #b7a6ee; font-size: 24px; }
  .dpad { display: grid; grid-template-columns: repeat(3, 52px); grid-template-rows: repeat(3, 52px); gap: 4px; touch-action: none; }
  .dpad button { display: grid; place-items: center; border: 2.5px solid #fff; border-radius: 17px; color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 4px 0 #4b32a8; touch-action: none; user-select: none; }
  .dpad button:active { transform: translateY(3px); box-shadow: 0 1px 0 #4b32a8; }
  .up { grid-area: 1 / 2; } .left { grid-area: 2 / 1; } .right { grid-area: 2 / 3; } .down { grid-area: 3 / 2; }

  .chat { display: flex; align-items: center; gap: 8px; padding: 6px 7px 6px 12px; border: 2.5px solid #fff; border-radius: 99px; color: #9a90c8; background: #ece6ff; }
  .chat input { min-width: 0; flex: 1; border: 0; color: var(--g-ink); background: transparent; font-size: 13px; font-weight: 700; }
  .chat input::placeholder { color: #a79dd2; }
  .send { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; color: #fff; background: #c7bde9; }
  .links { display: grid; gap: 10px; }

  @keyframes walk { 0%, 100% { transform: scaleX(var(--flip)) translateY(0) rotate(0); } 50% { transform: scaleX(var(--flip)) translateY(-5px) rotate(2deg); } }
  @keyframes drift { to { transform: translateX(560px); } }
  @keyframes pop { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
  @media (prefers-reduced-motion: reduce) { .cloud, .me.walking .body, .bubble { animation: none; } .actor, .pet { transition: none; } }
</style>
