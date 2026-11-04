<script lang="ts">
  import { ArrowRight, Crown, Sparkles, Star } from '@lucide/svelte';
  import GameButton from '../components/GameButton.svelte';

  let { onEnter }: { onEnter: (name: string) => void } = $props();
  let name = $state('');
  let error = $state('');

  function submit() {
    const displayName = name.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!displayName) { error = 'ใส่ชื่อที่อยากให้แสดงในเกมก่อนนะ'; return; }
    onEnter(displayName);
  }
</script>

<main class="entry min-h-dvh overflow-hidden px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#1f305e]">
  <div class="entry-art" style:--entry-background={`url("${import.meta.env.BASE_URL}assets/entry/entry-island.png")`} aria-hidden="true"></div>
  <div class="relative mx-auto flex min-h-[calc(100dvh_-_40px)] w-full max-w-[460px] flex-col">
    <header class="flex items-center justify-between gap-2 rounded-2xl border-2 border-white/90 bg-white/85 px-3 py-2 shadow-[0_4px_0_#a6d4f2,0_8px_18px_rgba(14,116,184,0.14)] backdrop-blur-md">
      <img class="h-9 w-36 object-contain object-left" src="assets/brand/masque-game-center-logo.png" alt="Masque Game Center" />
      <span class="inline-flex items-center gap-1 rounded-full border border-[#ffe28a] bg-gradient-to-r from-[#fff8db] to-[#ffe699] px-2.5 py-1 text-[10px] font-black tracking-wide text-[#8c5300] shadow-xs">
        <Crown size={12} /> MYAIS WORLD
      </span>
    </header>
    <div class="flex flex-1 flex-col justify-end pb-3 pt-6">
      <section class="entry-panel" aria-labelledby="entry-title">
        <span class="eyebrow"><Sparkles size={13} />YOUR FANTASY ARCADE STARTS HERE</span>
        <h1 id="entry-title">ยินดีต้อนรับสู่เกาะลอยฟ้า!<br /><span>ให้เราเรียกคุณว่าอะไรดีคะ?</span></h1>
        <p class="intro">ตั้งชื่อนักผจญภัยของคุณสำหรับรอบนี้ เล่นเกมสะสมคะแนน ปลดล็อก Chibi Avatar และรางวัลมากมายได้ทันที</p>
        <form class="mt-4 grid gap-3" onsubmit={(event) => { event.preventDefault(); submit(); }}>
          <label class="grid gap-1.5 text-xs font-black text-[#1f305e]" for="player-name">
            <span class="flex items-center gap-1"><Star size={13} class="text-[#d98b00]" /> ชื่อในเกม (Display Name)</span>
            <input id="player-name" bind:value={name} maxlength="40" autocomplete="nickname" placeholder="เช่น มะลิ, ลูมิน่า, SkyHero" aria-describedby={error ? 'name-error' : 'name-hint'} oninput={() => error = ''} />
          </label>
          {#if error}<p id="name-error" class="text-xs font-extrabold text-rose-600" role="alert">{error}</p>{:else}<p id="name-hint" class="text-[11px] font-bold text-[#526c9c]">ชื่อนี้ใช้แสดงบนกระดานจัดอันดับและหน้าโปรไฟล์</p>{/if}
          <GameButton type="submit" block size="lg" variant="gold">เริ่มการผจญภัยเลย<ArrowRight size={18} /></GameButton>
        </form>
        <p class="disclaimer">DEMO MODE · จำลองการใช้ AIS Points ภายในเครื่องโดยไม่หักคะแนนจริง</p>
      </section>
    </div>
  </div>
</main>

<style>
  .entry { position: relative; isolation: isolate; background: linear-gradient(180deg, #bce6ff 0%, #dff3ff 48%, #fff8e7 100%); }
  .entry-art { position: absolute; inset: 0 0 auto; height: min(68dvh, 580px); background: linear-gradient(180deg, rgb(188 230 255 / 4%) 40%, #eaf6ff 92%, #fff8e7 100%), var(--entry-background) center 36% / cover no-repeat; }
  .entry-panel {
    padding: 20px 18px 16px;
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
  .disclaimer { margin: 12px 0 0; color: #647ea8; font-size: 10px; font-weight: 800; text-align: center; }
  @media (orientation: landscape) and (max-height: 500px) and (min-width: 600px) { .entry { display: none; } }
</style>
