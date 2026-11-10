<script lang="ts">
  import { ArrowLeft, ArrowRight, Check, Crown, Lock, Sparkles, Star } from '@lucide/svelte';
  import GameButton from '../components/GameButton.svelte';
  import { AVATARS } from '../data/config';

  let { ownedAvatarIds, selectedAvatarId, onEnter }: {
    ownedAvatarIds: string[];
    selectedAvatarId: string;
    onEnter: (name: string, avatarId: string) => void;
  } = $props();
  let name = $state('');
  let error = $state('');
  let step = $state<'name' | 'avatar'>('name');
  let confirmedName = $state('');
  let selectedOverride = $state<string | null>(null);
  let selected = $derived(selectedOverride ?? selectedAvatarId);
  let selectedAvatar = $derived(AVATARS.find((avatar) => avatar.id === selected) ?? AVATARS[0]);
  let availableAvatars = $derived(AVATARS.filter((avatar) => ownedAvatarIds.includes(avatar.id)));

  function submit(): void {
    const displayName = name.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!displayName) { error = 'ใส่ชื่อที่อยากให้แสดงในเกมก่อนนะ'; return; }
    confirmedName = displayName;
    step = 'avatar';
  }

  function confirmAvatar(): void {
    if (!ownedAvatarIds.includes(selected)) return;
    onEnter(confirmedName, selected);
  }
</script>

<main class="entry min-h-dvh overflow-x-hidden px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#1f305e]">
  <div class="entry-art" style:--entry-background={`url("${import.meta.env.BASE_URL}assets/entry/entry-island.png")`} aria-hidden="true"></div>
  <div class="relative mx-auto flex min-h-[calc(100dvh_-_40px)] w-full max-w-[460px] flex-col" class:picker={step === 'avatar'}>
    <header class="flex items-center justify-between gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-3 py-2 shadow-[0_4px_0_#a6d4f2,0_8px_18px_rgba(14,116,184,0.14)] backdrop-blur-md">
      {#if step === 'avatar'}
        <button class="back" type="button" aria-label="กลับไปใส่ชื่อ" onclick={() => (step = 'name')}><ArrowLeft size={18} /></button>
      {/if}
      <img class="h-9 w-36 object-contain object-left" src="assets/brand/masque-game-center-logo.png" alt="Masque Game Center" />
      <span class="inline-flex items-center gap-1 rounded-full border border-[#ffe28a] bg-gradient-to-r from-[#fff8db] to-[#ffe699] px-2.5 py-1 text-[10px] font-black tracking-wide text-[#8c5300] shadow-xs">
        <Crown size={12} /> SKY ARCADE
      </span>
    </header>
    <div class="entry-content flex flex-1 flex-col justify-end pb-3 pt-6" class:selecting={step === 'avatar'}>
      {#if step === 'name'}
      <section class="entry-panel" aria-labelledby="entry-title">
        <span class="eyebrow"><Sparkles size={13} />YOUR FANTASY ARCADE STARTS HERE</span>
        <h1 id="entry-title">ยินดีต้อนรับสู่เกาะลอยฟ้า!<br /><span>ให้เราเรียกคุณว่าอะไรดีคะ?</span></h1>
        <p class="intro">ตั้งชื่อนักผจญภัยของคุณ เล่นเกมสะสมคะแนน ปลดล็อกตัวละครและของรางวัลมากมายได้ทันที</p>
        <form class="mt-4 grid gap-3" onsubmit={(event) => { event.preventDefault(); submit(); }}>
          <label class="grid gap-1.5 text-xs font-black text-[#1f305e]" for="player-name">
            <span class="flex items-center gap-1"><Star size={13} class="text-[#d98b00]" /> ชื่อในเกม (Display Name)</span>
            <input id="player-name" bind:value={name} maxlength="40" autocomplete="nickname" placeholder="เช่น มะลิ, ลูมิน่า, SkyHero" aria-describedby={error ? 'name-error' : 'name-hint'} oninput={() => error = ''} />
          </label>
          {#if error}<p id="name-error" class="text-xs font-extrabold text-rose-600" role="alert">{error}</p>{:else}<p id="name-hint" class="text-[11px] font-bold text-[#526c9c]">ชื่อนี้ใช้แสดงบนกระดานจัดอันดับและหน้าโปรไฟล์</p>{/if}
          <GameButton type="submit" block size="lg" variant="gold">เริ่มการผจญภัยเลย<ArrowRight size={18} /></GameButton>
        </form>
      </section>
      {:else}
        <section class="avatar-panel" aria-labelledby="avatar-title">
          <div class="picker-heading">
            <span class="eyebrow"><Sparkles size={13} />ขั้นตอนที่ 2 · {confirmedName}</span>
            <h1 id="avatar-title">เลือกตัวละคร</h1>
            <p>เลือกตัวละครที่จะออกเดินทางไปกับคุณ</p>
          </div>
          <div class="avatar-preview" aria-label={`ตัวละคร ${selectedAvatar.name}`}>
            <span class="preview-glow" aria-hidden="true"></span>
            <img src={`assets/world/actors/avatars-${selectedAvatar.id}.webp`} alt={selectedAvatar.name} />
            <strong>{selectedAvatar.name}</strong>
          </div>
          <div class="avatar-options" role="radiogroup" aria-label="ตัวละครที่มี">
            {#each availableAvatars as avatar (avatar.id)}
              <button
                type="button"
                class="avatar-option"
                class:selected={selected === avatar.id}
                role="radio"
                aria-checked={selected === avatar.id}
                onclick={() => (selectedOverride = avatar.id)}
              >
                <img src={`assets/world/actors/avatars-${avatar.id}.webp`} alt="" />
                <span>{avatar.name}</span>
                {#if selected === avatar.id}<i aria-hidden="true"><Check size={14} strokeWidth={3} /></i>{/if}
              </button>
            {/each}
          </div>
          {#if AVATARS.some((avatar) => !ownedAvatarIds.includes(avatar.id))}
            <p class="locked-note"><Lock size={13} /> ตัวละครอื่นปลดล็อกได้ในร้านค้า</p>
          {/if}
          <GameButton block size="lg" variant="purple" onclick={confirmAvatar}>ยืนยันตัวละคร<ArrowRight size={18} /></GameButton>
        </section>
      {/if}
    </div>
  </div>
</main>

<style>
  .entry { position: relative; isolation: isolate; background: linear-gradient(180deg, #d6c6ff 0%, #f5edff 48%, #fff8e7 100%); }
  .entry-art { position: absolute; inset: 0 0 auto; height: min(68dvh, 580px); background: linear-gradient(180deg, rgb(188 230 255 / 4%) 40%, #eaf6ff 92%, #fff8e7 100%), var(--entry-background) center 36% / cover no-repeat; }
  .picker { min-height: calc(100dvh - 40px); }
  .back { display: grid; place-items: center; width: 38px; height: 38px; flex: 0 0 auto; border: 1.5px solid #fff; border-radius: 12px; color: #6920bb; background: #f2e8ff; }
  .picker header > img { margin-right: auto; margin-left: 4px; }
  .entry-content.selecting { justify-content: center; padding-top: 16px; }
  .entry-panel {
    padding: 20px 18px 18px;
    border: 3px solid #ffffff;
    border-radius: 26px;
    background: linear-gradient(180deg, rgb(255 253 247 / 96%) 0%, rgb(240 249 255 / 96%) 100%);
    box-shadow: 0 7px 0 #9bcdf0, 0 18px 38px rgb(20 68 122 / 22%), inset 0 2px 0 #ffffff;
    backdrop-filter: blur(14px);
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1.5px solid #bae6fd;
    background: linear-gradient(90deg, #e0f2fe, #fff9db);
    color: #0369a1;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.04em;
  }
  h1 { margin: 10px 0 0; color: #1f305e; font-size: clamp(23px, 6.4vw, 28px); font-weight: 900; line-height: 1.2; }
  h1 span { color: #0284c7; }
  .intro { margin: 7px 0 0; color: #4f6899; font-size: 12.5px; font-weight: 700; line-height: 1.5; }
  input {
    width: 100%;
    min-height: 50px;
    padding: 0 14px;
    border: 2.5px solid #bae6fd;
    border-radius: 16px;
    color: #1f305e;
    background: #ffffff;
    box-shadow: inset 0 2px 4px rgb(14 116 184 / 8%), 0 2px 0 #d8effc;
    font-size: 15px;
    font-weight: 800;
  }
  input:focus { border-color: #0ea5e9; outline: 3px solid rgb(14 165 233 / 22%); }
  .avatar-panel { display: grid; gap: 12px; padding: 16px 14px; border: 2px solid #fff; border-radius: 24px; background: rgb(255 253 250 / 94%); box-shadow: 0 6px 0 #c6a9ec, 0 14px 28px rgb(75 42 130 / 18%); backdrop-filter: blur(12px); }
  .picker-heading { text-align: center; }
  .picker-heading .eyebrow { border-color: #dfcdf8; color: #6722ac; background: #f4edff; }
  .picker-heading h1 { margin-top: 7px; color: #35145f; font-size: 24px; }
  .picker-heading p { margin: 3px 0 0; color: #756587; font-size: 12px; font-weight: 700; }
  .avatar-preview { position: relative; display: grid; justify-items: center; align-content: end; height: min(32dvh, 230px); min-height: 170px; overflow: hidden; border: 1.5px solid #e6d9f7; border-radius: 20px; background: linear-gradient(180deg, #e9f4ff 0%, #f4edff 70%, #fff6db 100%); }
  .preview-glow { position: absolute; bottom: 17px; width: 150px; height: 35px; border-radius: 50%; background: #b7a0e9; filter: blur(13px); opacity: 0.45; }
  .avatar-preview img { position: relative; z-index: 1; width: auto; height: calc(100% - 34px); max-width: 62%; object-fit: contain; filter: drop-shadow(0 5px 5px rgb(39 35 65 / 25%)); animation: preview-bob 2.8s ease-in-out infinite; }
  .avatar-preview strong { position: relative; z-index: 2; width: 100%; padding: 5px 8px; color: #4a2473; background: rgb(255 255 255 / 82%); font-size: 12px; font-weight: 900; text-align: center; }
  .avatar-options { display: flex; justify-content: center; gap: 8px; overflow-x: auto; padding: 1px 2px 6px; }
  .avatar-option { position: relative; display: grid; justify-items: center; gap: 3px; width: 68px; height: 78px; flex: 0 0 auto; padding: 4px; border: 1.5px solid #e2d9ec; border-radius: 14px; color: #5e5072; background: #fff; font-size: 9px; font-weight: 900; }
  .avatar-option.selected { border: 2px solid #9a36e6; color: #5d1ba3; background: #f6efff; box-shadow: 0 2px 0 #7023ba; }
  .avatar-option img { width: auto; height: 50px; max-width: 48px; object-fit: contain; }
  .avatar-option span { overflow: hidden; max-width: 100%; text-overflow: ellipsis; white-space: nowrap; }
  .avatar-option i { position: absolute; top: -5px; right: -5px; display: grid; place-items: center; width: 20px; height: 20px; border: 1px solid #fff; border-radius: 50%; color: #fff; background: #8d2ae1; }
  .locked-note { display: inline-flex; align-items: center; justify-content: center; gap: 4px; margin: -4px 0 0; color: #78688e; font-size: 10px; font-weight: 800; }
  @keyframes preview-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @media (prefers-reduced-motion: reduce) { .avatar-preview img { animation: none; } }
  @media (orientation: landscape) and (max-height: 500px) and (min-width: 600px) { .entry { display: none; } }
</style>
