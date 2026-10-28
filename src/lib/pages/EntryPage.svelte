<script lang="ts">
  import { ArrowRight, Sparkles } from '@lucide/svelte';
  import GameButton from '../components/GameButton.svelte';

  let { aisPointSeed, onEnter }: { aisPointSeed: number | null; onEnter: (name: string) => void } = $props();
  let name = $state('');
  let error = $state('');

  function submit() {
    const displayName = name.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!displayName) { error = 'ใส่ชื่อที่อยากให้แสดงในเกมก่อนนะ'; return; }
    onEnter(displayName);
  }
</script>

<main class="entry min-h-dvh overflow-hidden px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] text-[#24485f]">
  <div class="entry-art" style:--entry-background={`url("${import.meta.env.BASE_URL}assets/entry/entry-island.png")`} aria-hidden="true"></div>
  <div class="relative mx-auto flex min-h-[calc(100dvh_-_42px)] w-full max-w-[460px] flex-col">
    <header class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2"><img class="h-10 w-40 object-contain object-left" src="assets/brand/masque-game-center-logo.png" alt="Masque Game Center" /><small class="text-[10px] text-[#607f91]">MYAIS DEMO WORLD</small></header>
    <div class="flex flex-1 flex-col justify-end pb-4">
      <section class="entry-panel" aria-labelledby="entry-title">
        <span class="eyebrow"><Sparkles size={14} />YOUR ADVENTURE STARTS HERE</span>
        <h1 id="entry-title">มาเล่นกัน<br /><span>เรียกคุณว่าอะไรดี?</span></h1>
        <p class="intro">ชื่อตัวละครนี้ใช้เฉพาะรอบที่เปิดอยู่ ไม่ต้องสมัครหรือตั้งรหัสผ่าน</p>
        <form class="mt-6 grid gap-3" onsubmit={(event) => { event.preventDefault(); submit(); }}>
          <label class="grid gap-2 text-sm font-semibold" for="player-name">ชื่อในเกม
            <input id="player-name" bind:value={name} maxlength="40" autocomplete="nickname" placeholder="เช่น มะลิ" aria-describedby={error ? 'name-error' : 'name-hint'} oninput={() => error = ''} />
          </label>
          {#if error}<p id="name-error" class="text-xs font-semibold text-rose-700" role="alert">{error}</p>{:else}<p id="name-hint" class="text-xs text-[#668394]">ไม่บันทึกชื่อไว้หลังปิดหน้านี้</p>{/if}
          {#if aisPointSeed !== null}<p class="seed-note">AIS seed: {aisPointSeed.toLocaleString()} · ใช้เมื่อสร้าง Player ใหม่หรือ Reset</p>{/if}
          <GameButton type="submit" block size="lg" variant="purple">เข้า Game Center<ArrowRight size={18} /></GameButton>
        </form>
        <p class="disclaimer">DEMO · ไม่เชื่อมต่อ AIS Points หรือบัญชีจริง</p>
      </section>
    </div>
  </div>
</main>

<style>
  .entry { position: relative; isolation: isolate; background: linear-gradient(180deg, #d9eff7, #edf0f8 58%, #f7edf0); }
  .entry-art { position: absolute; inset: 0 0 auto; height: min(67dvh, 580px); background: linear-gradient(180deg, rgb(218 241 249 / 8%) 35%, #e9eff7 100%), var(--entry-background) center 48% / cover; }
  .entry-panel { padding: 22px 19px 17px; border: 1px solid rgb(255 255 255 / 85%); border-radius: 10px; background: rgb(250 253 254 / 94%); box-shadow: 0 18px 60px rgb(43 82 103 / 12%); backdrop-filter: blur(16px); }
  .eyebrow { display: flex; align-items: center; gap: 6px; color: #387f9c; font-size: 10px; font-weight: 800; }
  h1 { margin: 13px 0 0; color: #24485f; font-size: 31px; font-weight: 800; line-height: 1.18; }
  h1 span { color: #55839a; }
  .intro { max-width: 32ch; margin: 9px 0 0; color: #607f91; font-size: 13px; line-height: 1.55; }
  input { width: 100%; min-height: 52px; padding: 0 14px; border: 1px solid #cfdee6; border-radius: 8px; color: #24485f; background: #fff; font-size: 16px; }
  input:focus { border-color: #387f9c; outline: 3px solid rgb(56 127 156 / 18%); }
  .seed-note { margin: 0; color: #8a620d; font-size: 12px; font-weight: 700; }
  .disclaimer { margin: 15px 0 0; color: #8298a3; font-size: 10px; text-align: center; }
  @media (orientation: landscape) and (max-height: 500px) and (min-width: 600px) { .entry { display: none; } }
</style>