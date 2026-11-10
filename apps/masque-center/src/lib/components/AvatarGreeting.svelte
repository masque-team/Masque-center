<script lang="ts">
  import { onMount } from 'svelte';
  import { MessageCircleHeart, Sparkles } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import { AVATARS, PETS } from '../data/config';

  let {
    avatarId,
    petId = null,
    displayName,
    energy,
    energyMax,
    checkedIn,
    vipActive,
    onAvatarClick,
  }: {
    avatarId: string;
    petId?: string | null;
    displayName: string;
    energy: number;
    energyMax: number;
    checkedIn: boolean;
    vipActive: boolean;
    onAvatarClick?: () => void;
  } = $props();

  let line = $state(0);
  let popKey = $state(0);
  let avatar = $derived(AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0]);
  let pet = $derived(petId ? PETS.find((item) => item.id === petId) : undefined);

  let greetings = $derived([
    checkedIn
      ? `${displayName} วันนี้เช็กอินแล้ว เก่งมากเลย! พร้อมเล่นเกมกันหรือยังคะ? ✨`
      : `${displayName} วันนี้แวะเช็กอินรับ +Energy ก่อนเริ่มเล่นกันไหมคะ? 🎁`,
    energy <= 2
      ? `Energy เหลือ ${energy}/${energyMax} แล้วนะคะ แวะพักหรือเติมพลังได้เลย ⚡`
      : `ตอนนี้มี Energy ${energy}/${energyMax} พร้อมลุยเกมโปรดหรือยังคะ? 🎮`,
    `${displayName} อยากเริ่มจากเกมไหน ให้ฉันกับ ${pet?.name ?? 'คู่หู'} ช่วยเชียร์ไหมคะ? 💫`,
    vipActive
      ? 'สมาชิก VIP พร้อมลุยเกมปกติได้เลยนะคะ ส่วนอีเวนต์อาจใช้ Ticket ค่ะ 👑'
      : 'ลองแวะดูแคมเปญวันนี้ไหมคะ เผื่อมีกิจกรรมที่ถูกใจ! 🏆',
  ]);

  function nextLine() {
    line = (line + 1) % greetings.length;
    popKey += 1;
  }

  onMount(() => {
    const timer = window.setInterval(nextLine, 9_500);
    return () => window.clearInterval(timer);
  });
</script>

<section class="comic-stage" aria-label="ข้อความทักทายจาก Avatar" aria-live="polite">
  <button
    type="button"
    class="chara-stand"
    onclick={onAvatarClick}
    title="แตะเพื่อแต่งตัว Avatar"
    aria-label={`แต่งตัว ${avatar.name}`}
  >
    <span class="pedestal" aria-hidden="true"></span>
    <span class="chara-body">
      <AssetPortrait
        src={avatar.imagePath}
        alt={avatar.name}
        placeholder={avatar.placeholder}
        kind="avatar"
        loading="eager"
      />
    </span>
    {#if pet}
      <span class="chara-pet">
        <AssetPortrait
          src={pet.imagePath}
          alt={pet.name}
          placeholder={pet.placeholder}
          kind="pet"
        />
      </span>
    {/if}
  </button>

  <button
    type="button"
    class="speech-wrap"
    onclick={nextLine}
    title="แตะเพื่อคุยกับ Avatar"
    aria-label={`คุยกับ ${avatar.name}: ${greetings[line]}`}
  >
    {#key popKey}
      <div class="comic-bubble">
        <span class="tail-outer" aria-hidden="true"></span>
        <span class="tail-inner" aria-hidden="true"></span>

        <div class="speaker-tag">
          <MessageCircleHeart size={12} class="shrink-0 text-rose-500" />
          <span class="speaker-name">{avatar.name}</span>
          <small class="recipient">ถึง {displayName}</small>
        </div>

        <p class="dialogue">{greetings[line]}</p>

        <span class="tap-hint">
          <Sparkles size={11} />
          <span>แตะเพื่อคุยต่อ</span>
        </span>
      </div>
    {/key}
  </button>
</section>

<style>
  .comic-stage {
    position: relative;
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    padding: 0;
    overflow: visible;
  }
  .chara-stand {
    position: relative;
    height: 116px;
    width: 96px;
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.3, 1.6, 0.5, 1);
  }
  .chara-stand::before {
    position: absolute;
    inset: 18px 4px 4px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgb(162 211 255 / 38%), transparent 72%);
    content: '';
  }
  .chara-stand:active {
    transform: scale(0.94);
  }
  .pedestal {
    position: absolute;
    bottom: 3px;
    left: 10px;
    right: 10px;
    height: 11px;
    border-radius: 50%;
    background: rgb(70 105 145 / 16%);
    filter: blur(3px);
  }
  .chara-body {
    position: absolute;
    inset: 0 8px 6px 0;
    display: block;
    filter: drop-shadow(0 4px 6px rgba(60, 40, 130, 0.24));
    animation: chara-bob 3.2s ease-in-out infinite;
  }
  .chara-pet {
    position: absolute;
    right: -4px;
    bottom: 4px;
    width: 44px;
    height: 48px;
    filter: drop-shadow(0 3px 4px rgba(60, 40, 130, 0.28));
    animation: chara-bob 2.6s ease-in-out infinite reverse;
  }
  .speech-wrap {
    position: relative;
    min-width: 0;
    border: 0;
    background: transparent;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }
  .comic-bubble {
    position: relative;
    margin-left: 5px;
    padding: 10px 12px 9px;
    border: 1px solid rgb(255 255 255 / 94%);
    border-radius: 22px 24px 22px 18px;
    background: rgb(255 255 255 / 84%);
    box-shadow: 0 8px 20px rgb(24 68 115 / 11%);
    backdrop-filter: blur(8px);
    animation: bubble-pop 280ms cubic-bezier(0.28, 1.55, 0.5, 1) both;
  }
  .speech-wrap:active .comic-bubble {
    transform: translateY(2px) scale(0.985);
    box-shadow: 0 4px 12px rgb(24 68 115 / 11%);
  }
  /* Comic pointer tail pointing left toward the Avatar's face */
  .tail-outer {
    position: absolute;
    left: -14px;
    top: 34px;
    width: 0;
    height: 0;
    border-top: 9px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 14px solid rgb(255 255 255 / 94%);
  }
  .tail-inner {
    position: absolute;
    left: -10px;
    top: 35px;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 12px solid rgb(255 255 255 / 84%);
  }
  .speaker-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    min-width: 0;
    margin-bottom: 4px;
    padding: 2px 8px 2px 6px;
    border: 1.5px solid #fde68a;
    border-radius: 99px;
    background: linear-gradient(90deg, #fffbeb, #e0f2fe);
    font-size: 10px;
    font-weight: 900;
    color: #0369a1;
  }
  .speaker-tag small {
    font-size: 9px;
    font-weight: 800;
    color: #92400e;
  }
  .speaker-name, .recipient {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dialogue {
    margin: 0;
    font-size: clamp(11px, 3.2vw, 13px);
    font-weight: 800;
    line-height: 1.4;
    color: #1f305e;
    overflow-wrap: anywhere;
  }
  .tap-hint {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin-top: 5px;
    font-size: 9px;
    font-weight: 800;
    color: #0284c7;
  }
  @keyframes bubble-pop {
    from {
      opacity: 0.5;
      transform: scale(0.92) translateX(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateX(0);
    }
  }
  @keyframes chara-bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .chara-body, .chara-pet, .comic-bubble {
      animation: none;
    }
  }
  @media (max-width: 350px) {
    .comic-stage { grid-template-columns: 82px minmax(0, 1fr); gap: 5px; padding: 6px; }
    .chara-stand { width: 82px; height: 104px; }
    .chara-pet { right: -2px; width: 38px; height: 42px; }
    .comic-bubble { margin-left: 3px; padding: 9px 8px 7px; border-radius: 18px; }
    .speaker-tag { gap: 3px; padding-right: 6px; font-size: 9px; }
    .speaker-tag small { font-size: 8px; }
    .dialogue { font-size: 11px; }
    .tap-hint { font-size: 8px; }
  }
</style>
