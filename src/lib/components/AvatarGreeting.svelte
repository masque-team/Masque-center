<script lang="ts">
  import { onMount } from 'svelte';
  import { MessageCircleHeart, Sparkles } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import { AVATARS, PETS } from '../data/config';

  let {
    avatarId,
    petId = null,
    displayName,
    onAvatarClick,
  }: {
    avatarId: string;
    petId?: string | null;
    displayName: string;
    onAvatarClick?: () => void;
  } = $props();

  let line = $state(0);
  let popKey = $state(0);
  let avatar = $derived(AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0]);
  let pet = $derived(petId ? PETS.find((item) => item.id === petId) : undefined);

  const greetings = [
    'เป็นไงบ้างคะวันนี้? มาสะสมแต้มกันเถอะ! ✨',
    'วันนี้อยากเล่นเกมจับคู่กันไหมคะ? 🃏',
    'แวะเช็กอินรับ Masque Points ฟรีทุกวันเลยนะ! 🪙',
    'อยากลองหมุนตู้สุ่ม Avatar หรือ Pet ไหมคะ? 🎰',
    'ถ้าเหนื่อย พักเติม Energy ก่อนลุยต่อได้นะคะ ⚡',
    'วันนี้มาทำสถิติใหม่ในเกมโปรดกันค่ะ! 🏆',
  ];

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
          <span>{avatar.name}</span>
          <small>ถึง {displayName}</small>
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
    grid-template-columns: 98px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    padding: 4px 2px 2px;
  }
  .chara-stand {
    position: relative;
    height: 112px;
    width: 98px;
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.3, 1.6, 0.5, 1);
  }
  .chara-stand:active {
    transform: scale(0.94);
  }
  .pedestal {
    position: absolute;
    bottom: 3px;
    left: 10px;
    right: 10px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #fff;
    background: radial-gradient(circle, #ffe89e 0%, #9ad9f5 75%, #6cbbe3 100%);
    box-shadow: 0 3px 0 #5aa4cc, 0 5px 10px rgba(45, 90, 140, 0.22);
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
    margin-left: 8px;
    padding: 12px 14px 10px;
    border: 3px solid #3a2d78;
    border-radius: 22px 24px 22px 18px;
    background: linear-gradient(180deg, #ffffff 0%, #fffdf5 100%);
    box-shadow:
      0 5px 0 #3a2d78,
      0 8px 16px rgba(58, 45, 120, 0.18),
      inset 0 -3px 0 #f4ecff;
    animation: bubble-pop 280ms cubic-bezier(0.28, 1.55, 0.5, 1) both;
  }
  .speech-wrap:active .comic-bubble {
    transform: translateY(2px) scale(0.985);
    box-shadow: 0 3px 0 #3a2d78;
  }
  /* Comic pointer tail pointing left toward the Avatar's face */
  .tail-outer {
    position: absolute;
    left: -15px;
    top: 34px;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 11px solid transparent;
    border-right: 15px solid #3a2d78;
  }
  .tail-inner {
    position: absolute;
    left: -10px;
    top: 36px;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 12px solid #ffffff;
  }
  .speaker-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 4px;
    padding: 2px 8px 2px 6px;
    border: 1.5px solid #e5d8ff;
    border-radius: 99px;
    background: linear-gradient(90deg, #fff0f5, #f2edff);
    font-size: 10px;
    font-weight: 900;
    color: #462aa8;
  }
  .speaker-tag small {
    font-size: 9px;
    font-weight: 700;
    color: #7c72ad;
  }
  .dialogue {
    margin: 0;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.4;
    color: #2b2468;
  }
  .tap-hint {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin-top: 5px;
    font-size: 9px;
    font-weight: 800;
    color: #9687c9;
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
</style>
