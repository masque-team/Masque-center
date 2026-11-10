<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowLeft, ChevronRight, Plus, Zap, Clock3, Gamepad2, House, ShoppingBag, UserRound, ImagePlus, Check, Copy, Pencil, Play, Trophy, ClipboardList, History, Star, Volume2, Target, X, Upload, CalendarDays, CheckCircle2 } from '@lucide/svelte';
  import Stage from './Stage.svelte';
  import Popup from './Popup.svelte';
  import GameRound from './GameRound.svelte';
  import MyAis from './MyAis.svelte';
  import { buyEnergy, CHARACTERS, loadPlayer, newPlayer, packs, recover, SAVE_KEY, spendEnergy, type Character, type GameId, type Player } from './model';
  import { games, demoRankings, characterImage, characterNames, portraitImage } from './catalog';

  type Page = 'home' | 'shop' | 'profile' | 'edit' | 'detail' | 'ranking';
  type Modal = 'rules' | 'empty' | 'purchase' | 'history' | 'result' | 'exit' | null;
  let player = $state<Player>(newPlayer());
  let ready = $state(false);
  let inMyAis = $state(true);
  let page = $state<Page>('home');
  let previousPage: 'home' | 'shop' = 'home';
  let modal = $state<Modal>(null);
  let choosing = $state(true);
  let characterDraft = $state<Character>('aqua');
  let portraitDraft = $state('cat');
  let nameDraft = $state('');
  let editTab = $state<'character' | 'portrait'>('character');
  let selectedGame = $state<GameId>('mole');
  let game = $derived(games.find((item) => item.id === selectedGame)!);
  let selectedPack = $state(0);
  let playing = $state(false);
  let roundScore = $state(0);
  let startAfterRules = $state(false);
  let leaving = $state(false);
  let entering = $state(false);
  let tabPhase = $state<'lowering' | 'rising' | null>(null);
  let toast = $state('');
  let now = $state(Date.now());
  let uploadInput = $state<HTMLInputElement>();
  let transitionTimer: ReturnType<typeof setTimeout>;
  let toastTimer: ReturnType<typeof setTimeout>;
  let navigationVersion = $state(0);
  let exitDestination = $state<Page>('detail');
  let best = $derived(Math.max(0, ...player.history.filter((round) => round.game === selectedGame).map((round) => round.score)));
  let rankings = $derived([
    ...demoRankings(selectedGame),
    ...(best > 0 ? [{ id: 'player', name: player.name, portrait: player.portrait, score: best, isPlayer: true }] : []),
  ].sort((first, second) => second.score - first.score));
  let playerRank = $derived(rankings.findIndex((entry) => entry.isPlayer) + 1);
  let seconds = $derived(Math.max(0, Math.ceil((player.refillAt - now) / 1000)));
  let countdown = $derived(`${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`);
  let fullStage = $derived(page === 'profile');
  let editStage = $derived(page === 'edit');
  let displayCharacter = $derived(editStage && editTab === 'character' ? characterDraft : player.character);
  const characters = CHARACTERS;
  const formatter = new Intl.NumberFormat('th-TH');
  const dateFormatter = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

  onMount(() => {
    try { player = loadPlayer(localStorage.getItem(SAVE_KEY)); } catch { player = newPlayer(); }
    choosing = !player.selected;
    characterDraft = player.character;
    ready = true;
    const tick = window.setInterval(() => { now = Date.now(); player = recover(player, now); }, 1000);
    return () => { window.clearInterval(tick); clearTimeout(transitionTimer); clearTimeout(toastTimer); };
  });

  $effect(() => {
    if (!ready) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); }
    catch { notify('บันทึกในเครื่องไม่ได้ กรุณาตรวจพื้นที่จัดเก็บ'); }
  });

  function notify(message: string) {
    toast = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast = ''; }, 3000);
  }

  function navigate(next: Page) {
    if (leaving || entering || tabPhase || next === page) return;
    modal = null;
    if (page === 'home' || page === 'shop') previousPage = page;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const switchingTabs = (page === 'home' || page === 'shop') && (next === 'home' || next === 'shop');
    if (switchingTabs) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (reduced) { page = next; navigationVersion++; return; }
      tabPhase = 'lowering';
      transitionTimer = setTimeout(() => {
        page = next;
        navigationVersion++;
        tabPhase = 'rising';
        transitionTimer = setTimeout(() => { tabPhase = null; }, 190);
      }, 130);
      return;
    }
    leaving = true;
    transitionTimer = setTimeout(() => {
      page = next;
      leaving = false;
      entering = true;
      navigationVersion++;
      window.scrollTo({ top: 0, behavior: 'instant' });
      transitionTimer = setTimeout(() => { entering = false; }, reduced ? 0 : 360);
    }, reduced ? 0 : 190);
  }

  function selectCharacter() {
    player = { ...player, character: characterDraft, selected: true };
    choosing = false;
  }

  function openEditor() {
    characterDraft = player.character;
    portraitDraft = player.portrait;
    nameDraft = player.name;
    editTab = 'character';
    navigate('edit');
  }

  function saveProfile() {
    player = { ...player, character: characterDraft, portrait: portraitDraft, name: nameDraft.trim() || player.name };
    navigate('profile');
    notify('บันทึกโปรไฟล์แล้ว');
  }

  async function uploadPortrait(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      notify('ใช้รูป JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB'); input.value = ''; return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      const size = Math.min(bitmap.width, bitmap.height);
      context.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 256, 256);
      bitmap.close();
      portraitDraft = canvas.toDataURL('image/webp', .82);
    } catch { notify('เปิดรูปนี้ไม่ได้ กรุณาเลือกรูปใหม่'); }
    input.value = '';
  }

  async function copyId() {
    try { await navigator.clipboard.writeText('M8Q7K2'); notify('คัดลอก ID แล้ว'); }
    catch { notify('ID ของคุณ: M8Q7K2'); }
  }

  function requestStart() {
    player = recover(player);
    if (player.energy < 1) { modal = 'empty'; return; }
    startAfterRules = true;
    modal = 'rules';
  }

  function beginRound() {
    if (!startAfterRules) { modal = null; return; }
    const next = spendEnergy(player);
    if (!next) { modal = 'empty'; return; }
    player = next;
    modal = null;
    playing = true;
  }

  function requestExit(destination: Page = 'detail') {
    exitDestination = destination;
    modal = 'exit';
  }

  function purchase() {
    const next = buyEnergy(player, selectedPack);
    if (!next) { notify('AIS Point ไม่พอสำหรับแพ็กนี้'); modal = null; return; }
    player = next;
    modal = null;
    notify(`เติมพลังงาน ${packs[selectedPack].energy} หน่วยแล้ว`);
  }

  function closeModal() {
    if (modal === 'result') { modal = null; navigate('home'); }
    else modal = null;
  }
</script>

<div class="app-shell relative mx-auto min-h-dvh max-w-[480px] overflow-x-clip bg-[#f7f5fb] shadow-[0_0_80px_#1c123c20]" class:tab-switching={tabPhase !== null}>
  {#if !ready}
    <div class="grid min-h-dvh place-content-center text-violet">Masque Play</div>
  {:else if inMyAis}
    <MyAis name={player.name} portrait={portraitImage(player.portrait)} points={player.points} onsavename={(name) => { player = { ...player, name }; }} onstart={() => { inMyAis = false; }} />
  {:else if choosing}
    <main class="selection-bg relative flex min-h-dvh flex-col items-center overflow-hidden px-6 pb-7 pt-10">
      <Star class="mb-[-12px] z-10 fill-[#ffda32] text-[#eba600] drop-shadow-lg" size={47} />
      <h1 class="selection-title w-full max-w-[350px] py-3 text-center text-[32px] font-bold">เลือกตัวละคร</h1>
      <p class="mt-4 flex items-center gap-2 text-xl font-semibold text-[#541591]"><Star size={18} class="fill-[#ffdb36] text-[#e2a000]" />เลือกสไตล์ที่เป็นคุณ<Star size={18} class="fill-[#ffdb36] text-[#e2a000]" /></p>
      <div class="selection-character relative -my-2 w-full flex-1"><Stage character={characterDraft} full pale /></div>
      <div class="z-10 -mt-2 grid w-full max-w-[360px] grid-cols-4 gap-3" aria-label="เลือกตัวละคร">
        {#each characters as character (character)}
          <button class="choice aspect-square w-full min-w-0" class:choice-selected={characterDraft === character} aria-label={characterNames[character]} aria-pressed={characterDraft === character} onclick={() => { characterDraft = character; }}>
            <img class="h-full w-full rounded-[12px] object-cover" src={portraitImage(character)} alt={characterNames[character]} />
            {#if characterDraft === character}<span class="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-violet p-1 text-white"><Check size={17} strokeWidth={4} /></span>{/if}
          </button>
        {/each}
      </div>
      <p class="my-5 flex items-center gap-2 text-sm text-[#784b9b]"><UserRound size={20} />ตัวละครจะแสดงบนหน้าโปรไฟล์</p>
      <button class="gloss w-full max-w-[360px] text-2xl" onclick={selectCharacter}><Star size={20} class="fill-[#ffe35a] text-[#ffe35a]" />ยืนยันตัวละคร<Star size={20} class="fill-[#ffe35a] text-[#ffe35a]" /></button>
    </main>
  {:else}
    {#if !playing}
      <header class="absolute left-0 right-0 top-0 z-10 flex items-start justify-between gap-2 px-3 pt-[max(14px,env(safe-area-inset-top))]" class:bg-black={page === 'ranking'} class:pb-3={page === 'ranking'}>
        <div class="flex min-w-0 items-center gap-2">
          {#if page !== 'home'}<button class="icon-button" title="ย้อนกลับ" aria-label="ย้อนกลับ" onclick={() => navigate(page === 'edit' ? 'profile' : page === 'ranking' ? 'detail' : previousPage === page ? 'home' : previousPage)}><ArrowLeft size={25} strokeWidth={3} /></button>{/if}
          <button class="flex h-12 min-w-0 items-center gap-2 rounded-full bg-[#fcf8ff] pr-5 text-left shadow-sm" onclick={() => navigate('profile')} aria-label="ดูโปรไฟล์">
            <img class="h-[54px] w-[54px] shrink-0 rounded-full border-[3px] border-white bg-[#e7d9ff] object-cover object-top" src={portraitImage(player.portrait)} alt="" />
            <span class="min-w-0"><strong class="block max-w-[90px] truncate text-lg leading-5">{player.name}</strong>{#if page === 'home' || page === 'shop'}<span class="text-[10px]">ดูโปรไฟล์ &gt;</span>{/if}</span>
          </button>
        </div>
        {#if page === 'shop'}
          <div class="flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#fcf8ff] px-3"><img src="assets/currency/ais-point.png" alt="" class="h-8 w-8 object-contain" /><span><span class="block text-[10px] font-medium leading-3">AIS Point</span><strong class="text-xl leading-5">{formatter.format(player.points)}</strong></span></div>
        {:else}
          <button class="flex h-12 shrink-0 items-center gap-1 rounded-full bg-[#eee5ff] py-1 pl-2 pr-1.5 text-left" aria-label="เติมพลังงาน" onclick={() => navigate('shop')}>
            <Zap class="energy-art" size={29} /><span><span class="block text-[10px] leading-3">พลังงาน</span><strong class="text-lg leading-5">{player.energy}/12</strong></span><span class="ml-1 grid h-6 w-6 place-items-center rounded-full bg-violet text-white shadow-sm"><Plus size={19} strokeWidth={3} /></span>
          </button>
        {/if}
      </header>

      {#if page === 'home' || page === 'shop' || page === 'profile' || page === 'edit'}
        <div class:main-stage={page === 'home' || page === 'shop'} class:profile-stage={fullStage} class:edit-stage={editStage}><Stage character={displayCharacter} full={fullStage} backdrop={page === 'home' || page === 'shop'} /></div>
        {#if page === 'profile'}
          <main class="relative z-[3] -mt-10 flex min-h-[24dvh] flex-col items-center gap-5 bg-[#070d3a] px-8 pb-8" class:sheet-leaving={leaving}>
            <button class="soft-button border-0 bg-[#e9ceff] text-lg font-semibold" onclick={copyId}>ID: M8Q7K2<Copy size={18} /></button>
            <button class="gloss w-full text-2xl" onclick={openEditor}><Pencil size={23} class="fill-white" />แก้ไขโปรไฟล์</button>
          </main>
        {:else}
          {#key navigationVersion}
            <main class="sheet" class:sheet-leaving={leaving} class:sheet-entering={entering} class:tab-lowered={tabPhase === 'lowering'} class:tab-rising={tabPhase === 'rising'} inert={tabPhase !== null || leaving}>
              <div class="mx-auto mb-3 h-1 w-9 rounded-full bg-[#ddcdec]" aria-hidden="true"></div>
              {#if page === 'home'}
                <section class="energy-panel p-3" aria-label="พลังงานของฉัน">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2"><Zap size={58} class="energy-art shrink-0" strokeWidth={1.5} /><div><h1 class="text-lg font-semibold leading-6">พลังงานของฉัน</h1><p class="text-[#6b4c9a]"><strong class="text-4xl font-semibold text-ink">{player.energy}</strong><span class="text-2xl font-semibold">/12</span></p></div></div>
                    <button class="gloss min-h-10! whitespace-nowrap px-3! text-sm" onclick={() => navigate('shop')}><Plus size={19} class="rounded-full bg-white text-violet" />เติมพลังงาน</button>
                  </div>
                  <div class="mt-2 grid grid-cols-12 gap-1" aria-label={`${player.energy} จาก 12 หน่วย`}>
                    {#each Array(12) as _, index (index)}<span class="flex aspect-square items-center justify-center rounded-[7px] border" class:border-[#f5a500]={index < player.energy} class:bg-[#ffd642]={index < player.energy} class:border-[#d3bcec]={index >= player.energy} class:bg-[#ddccee]={index >= player.energy}><Zap size={17} fill={index < player.energy ? '#f5a500' : '#b29acb'} color={index < player.energy ? '#ee8d00' : '#b29acb'} /></span>{/each}
                  </div>
                  <div class="mt-3 grid grid-cols-[1fr_1.13fr] items-center gap-2 text-[#69439a]">
                    <p class="flex items-center gap-1 text-xs"><Clock3 size={21} class="shrink-0" />{player.energy >= 12 ? 'พลังงานเต็มแล้ว' : 'ฟื้นพลังงานอีก'}{#if player.energy < 12}<strong class="text-ink">{countdown}</strong>{/if}</p>
                    <p class="border-l border-[#b994d9] pl-3 text-[10px] leading-4">ฟื้น 1 พลังงานทุก 30 นาที สูงสุด 12<br />เล่น 1 รอบใช้ 1 พลังงาน</p>
                  </div>
                </section>
                <h2 class="section-heading mb-4 mt-5"><span class="game-heading-icon" aria-hidden="true"><Gamepad2 size={29} strokeWidth={2.2} class="fill-none" /></span>เลือกเกมที่อยากเล่น</h2>
                <div class="grid grid-cols-2 gap-3">
                  {#each games as item (item.id)}
                    <button class="game-cover flex min-w-0 items-center gap-2 p-2 text-left" onclick={() => { selectedGame = item.id; navigate('detail'); }}>
                      <img src={item.cover} alt="" class="aspect-square w-[45%] shrink-0 rounded-[10px] object-cover" />
                      <span class="min-w-0 flex-1"><strong class="block whitespace-nowrap text-base leading-6">{item.name}</strong><span class="block text-[9px] text-muted">เล่นแล้วทั้งหมด</span><span class="block text-[11px] font-semibold text-violet">{formatter.format(player.history.filter((round) => round.game === item.id).length)} รอบ</span></span>
                      <ChevronRight class="-ml-1 shrink-0 rounded-full bg-[#ece3ff] text-violet" size={22} />
                    </button>
                  {/each}
                </div>
              {:else if page === 'shop'}
                <section class="energy-panel flex items-center justify-between gap-2 p-3">
                  <div class="flex items-center gap-2"><Zap size={58} class="energy-art shrink-0" /><div><h1 class="text-base font-semibold">พลังงานของฉัน</h1><p><strong class="text-4xl font-semibold">{player.energy}</strong><span class="text-2xl text-[#70518e]">/12</span></p></div></div>
                  <div class="flex items-center gap-2 border-l border-[#c6a9df] pl-3 text-[#725194]"><Clock3 size={26} /><p class="text-[11px]">{player.energy >= 12 ? 'พลังงานเต็มแล้ว' : 'ฟื้นพลังงานอีก'}<strong class="block text-xl text-ink">{player.energy >= 12 ? 'พร้อมเล่น' : countdown}</strong></p></div>
                </section>
                <h2 class="section-heading mt-5"><Zap size={28} class="energy-art" />เลือกแพ็กพลังงาน</h2>
                <p class="mb-5 ml-9 mt-1 text-sm text-muted">ใช้ AIS Point แลกพลังงาน</p>
                <div class="space-y-4">
                  {#each packs as pack, index (pack.energy)}
                    <article class="energy-panel relative flex items-center justify-between gap-2 px-3 py-5" class:ring-1={index === 1} class:ring-[#b38bdd]={index === 1}>
                      {#if index === 1}<span class="absolute -top-3 left-[26%] flex items-center gap-1 rounded-md bg-[#8d13d5] px-3 text-xs text-white"><Star size={15} class="fill-[#ffda32] text-[#ffda32]" />ยอดนิยม</span>{/if}
                      <div class="relative shrink-0"><Zap size={57} class="energy-art" strokeWidth={1.5} /><span class="absolute -bottom-1 -right-1 min-w-8 rounded-full border border-[#c96fff] bg-violet px-1 text-center text-lg font-bold text-white">{pack.energy}</span></div>
                      <div class="min-w-0 flex-1 border-l border-[#c6a9df] pl-2"><h3 class="text-base font-semibold leading-6">พลังงาน {pack.energy} หน่วย</h3><p class="text-xs text-muted">เพิ่มพลังงานทันที</p></div>
                      <button class="gloss min-h-11! shrink-0 px-3! text-sm" onclick={() => { selectedPack = index; modal = 'purchase'; }}>{pack.price} AIS Point</button>
                    </article>
                  {/each}
                </div>
              {:else if page === 'edit'}
                <div class="grid grid-cols-2 rounded-full border border-[#d6b8ff] bg-[#eee7fa] p-0.5" role="tablist" aria-label="แก้ไขโปรไฟล์">
                  <button class="flex min-h-11 items-center justify-center gap-1 rounded-full text-sm font-medium text-[#766087]" class:tab-active={editTab === 'character'} role="tab" aria-selected={editTab === 'character'} aria-controls="profile-panel" id="character-tab" onclick={() => { editTab = 'character'; }}><UserRound size={20} />เปลี่ยนตัวละคร</button>
                  <button class="flex min-h-11 items-center justify-center gap-1 rounded-full text-sm font-medium text-[#766087]" class:tab-active={editTab === 'portrait'} role="tab" aria-selected={editTab === 'portrait'} aria-controls="profile-panel" id="portrait-tab" onclick={() => { editTab = 'portrait'; }}><ImagePlus size={20} />เปลี่ยนรูปโปรไฟล์</button>
                </div>
                <div role="tabpanel" id="profile-panel" aria-labelledby={editTab === 'character' ? 'character-tab' : 'portrait-tab'}>
                  <h1 class="mb-5 mt-5 text-center text-sm font-medium text-[#7139a5]">{editTab === 'character' ? 'เลือกตัวละครที่แสดงบนหน้าโปรไฟล์' : 'เลือกรูปที่ต้องการใช้'}</h1>
                  {#if editTab === 'character'}
                    <div class="grid grid-cols-4 gap-2">
                      {#each characters as character (character)}
                        <button class="choice min-w-0 overflow-hidden" class:choice-selected={characterDraft === character} aria-label={characterNames[character]} aria-pressed={characterDraft === character} onclick={() => { characterDraft = character; }}>
                          <img src={portraitImage(character)} alt="" class="aspect-square w-full object-cover" />
                          <span class="block bg-[#e8d8ff] py-1 text-xs text-[#60308e]">{character === player.character ? 'ใช้งานอยู่' : characterDraft === character ? 'เลือกแล้ว' : characterNames[character]}</span>
                          {#if characterDraft === character}<CheckCircle2 size={22} class="absolute right-0 top-0 rounded-full bg-violet text-white" />{/if}
                        </button>
                      {/each}
                    </div>
                  {:else}
                    <input bind:this={uploadInput} type="file" accept="image/png,image/jpeg,image/webp" class="hidden" onchange={uploadPortrait} aria-label="อัปโหลดรูปโปรไฟล์" />
                    <div class="grid grid-cols-3 gap-2">
                      <button class="choice flex flex-col items-center justify-center gap-3 bg-[#eadbff]! p-1" onclick={() => uploadInput?.click()}><ImagePlus size={36} class="text-violet" /><span class="text-[10px] text-[#6328a5]">อัปโหลดรูป</span></button>
                      {#each ['cat', ...characters] as portrait (portrait)}
                        <button class="choice overflow-hidden" class:choice-selected={portraitDraft === portrait} aria-pressed={portraitDraft === portrait} aria-label={portrait === 'cat' ? 'รูปเริ่มต้น' : characterNames[portrait as Character]} onclick={() => { portraitDraft = portrait; }}><img src={portraitImage(portrait)} alt="" class="h-[93px] w-full object-cover object-top" /><span class="block whitespace-nowrap bg-[#e9d8ff] py-1 text-[10px] text-[#642c94]">{portrait === player.portrait ? 'ใช้งานอยู่' : portraitDraft === portrait ? 'เลือกแล้ว' : portrait === 'cat' ? 'รูปเริ่มต้น' : characterNames[portrait as Character]}</span>{#if portraitDraft === portrait}<CheckCircle2 size={20} class="absolute right-0 top-0 rounded-full bg-violet text-white" />{/if}</button>
                      {/each}
                    </div>
                    {#if portraitDraft.startsWith('data:')}<div class="mt-4 flex items-center justify-center gap-3 text-sm text-muted"><img src={portraitDraft} alt="รูปที่อัปโหลด" class="h-14 w-14 rounded-full object-cover" />รูปที่เลือก<Check size={20} class="text-violet" /></div>{/if}
                  {/if}
                </div>
                <label class="mx-auto mt-5 block max-w-[270px] text-xs text-muted">ชื่อผู้เล่น<input class="mt-1 block w-full rounded-lg border border-[#ddc5f5] bg-white px-3 py-2 text-base text-ink" bind:value={nameDraft} maxlength="20" /></label>
                <button class="gloss mt-5 w-full text-xl" onclick={saveProfile}><Check size={22} />ตกลง</button>
              {/if}
            </main>
          {/key}
        {/if}
      {:else if page === 'detail'}
        <main class="game-scenery min-h-dvh pb-7 pt-[76px]" style={`--game-art: url('${game.id === 'mole' ? 'assets/ui-redesign/gameflow/mole-intro-hero.jpg' : game.cover}')`} class:sheet-leaving={leaving}>
          <div class="relative flex h-[285px] flex-col items-center justify-start px-5 pt-4">
            <h1 class="sr-only">{game.name}</h1>
            <button class="absolute bottom-3 right-4 flex h-[65px] w-[65px] flex-col items-center justify-center rounded-[18px] bg-[#fffcf0] text-sm font-medium shadow-md" onclick={() => { modal = 'history'; }}><History size={29} class="text-[#8f36e8]" />ประวัติ</button>
          </div>
          <section class="relative mx-4 rounded-[25px] bg-[#fffdf9ed] px-5 pb-5 pt-9 shadow-[0_5px_15px_#8a63321a]">
            <h2 class="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#b16cf2] px-10 py-1 text-xl font-semibold text-white">วิธีเล่น</h2>
            <div class="flex items-center justify-center gap-4"><span class="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#f0e2ff]"><Target size={49} class="text-[#a457dd]" /></span><div><p class="text-lg font-semibold leading-6">{game.action}</p><p class="mt-1 font-semibold text-[#f54384]">{game.warning}</p><p class="mt-1 flex items-center gap-1 text-sm"><Clock3 size={17} class="text-[#f54384]" />{game.id === 'mole' ? 'รอบละ 45 วินาที' : 'จับเวลาในเกม'}</p></div></div>
          </section>
          <div class="mx-4 mt-3 grid grid-cols-[1.6fr_1fr_1fr] gap-2">
            <div class="flex items-center gap-2 rounded-[20px] bg-[#fffdf9] p-3 shadow-sm"><Trophy size={40} class="shrink-0 fill-[#ffca34] text-[#e6a10a]" /><div><p class="text-xs">สถิติสูงสุด</p><strong class="block text-2xl font-semibold leading-7">{formatter.format(best)}</strong><span class="text-xs text-muted">คะแนน</span></div></div>
            <button class="flex flex-col items-center justify-center gap-1 rounded-[20px] bg-[#fffdf9] p-3 shadow-sm" onclick={() => { startAfterRules = false; modal = 'rules'; }}><ClipboardList size={34} class="text-[#a456e5]" /><span class="text-base font-medium">กติกา</span></button>
            <button class="flex flex-col items-center justify-center gap-1 rounded-[20px] bg-[#fffdf9] p-3 shadow-sm" onclick={() => navigate('ranking')}><Trophy size={34} class="fill-[#ffce50] text-[#eca400]" /><span class="text-base font-medium">อันดับ</span></button>
          </div>
          <button class="gloss mx-auto mt-5 flex! w-[85%] flex-col! gap-0! py-3!" onclick={requestStart}><span class="flex items-center gap-3 text-3xl"><Play size={30} class="fill-white" />เริ่มเล่น</span><span class="mt-1 flex items-center gap-1 border-t border-white/30 pt-1 text-sm"><Zap size={18} class="energy-art" />ใช้พลังงาน 1 หน่วย</span></button>
          <p class="mt-3 text-center text-xs text-[#84639c]">พลังงานจะถูกหักเมื่อเริ่มเกม</p>
        </main>
      {:else if page === 'ranking'}
        <main class="game-scenery min-h-dvh px-3 pb-6 pt-24" style={`--game-art: url('${game.id === 'mole' ? 'assets/ui-redesign/gameflow/mole-intro-hero.jpg' : game.cover}')`} class:sheet-leaving={leaving}>
          <Trophy class="mx-auto fill-[#ffcf36] text-[#e89d00] drop-shadow-lg" size={64} />
          <h1 class="ranking-title mt-1 text-center text-3xl font-bold">อันดับ{game.name}</h1>
          <p class="selection-title mx-auto mt-2 w-fit px-6 py-1 text-lg font-semibold">รอบปัจจุบัน</p>
          <p class="mx-auto mt-2 flex w-fit items-center gap-1 rounded-full border border-[#edbc58] bg-[#fff9e9] px-3 py-1 text-xs"><CalendarDays size={15} />{new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(now)}</p>
          <p class="mt-1 text-center text-xs font-medium text-[#591b91]">จัดอันดับจากคะแนนสูงสุดต่อรอบ</p>
          <ol class="ranking-podium" aria-label="สามอันดับแรก">
            {#each [1, 0, 2] as position (position)}
              {@const entry = rankings[position]}
              <li class="podium-place" class:podium-first={position === 0} class:podium-second={position === 1} class:podium-third={position === 2} value={position + 1} aria-label={`อันดับ ${position + 1} ${entry.name} ${formatter.format(entry.score)} คะแนน`}>
                <img src={portraitImage(entry.portrait)} alt="" class="podium-portrait" />
                <div class="podium-base">
                  <span class="podium-medal">{position + 1}</span>
                  <strong class="podium-name">{entry.name}</strong>
                  <strong class="podium-score">{formatter.format(entry.score)}</strong>
                </div>
              </li>
            {/each}
          </ol>
          <section class="overflow-hidden rounded-[22px] bg-[#fffcf5f5] p-2" aria-label="อันดับผู้เล่น">
            <div class="mb-1 grid grid-cols-[44px_1fr_96px] rounded-full bg-[#ffedc9] p-2 text-center text-xs font-semibold"><span>อันดับ</span><span>ผู้เล่น</span><span>คะแนนสูงสุด</span></div>
            <ol start="4" class="space-y-1" aria-label={`อันดับ${game.name}`}>
              {#each rankings.slice(3) as entry, index (entry.id)}
                <li value={index + 4} class="flex items-center gap-2 rounded-[18px] border border-[#f5e6d8] bg-white/80 p-2" class:bg-[#edd3ff]={entry.isPlayer}>
                  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eee0ff] font-semibold">{index + 4}</span>
                  <img src={portraitImage(entry.portrait)} alt="" class="h-10 w-10 shrink-0 rounded-full bg-[#f0e5ff] object-cover object-top" />
                  <strong class="min-w-0 flex-1 truncate text-sm">{entry.name}{#if entry.isPlayer}<span class="ml-1 text-xs text-violet">(คุณ)</span>{/if}</strong>
                  <strong class="shrink-0 text-lg">{formatter.format(entry.score)}</strong>
                </li>
              {/each}
            </ol>
          </section>
          <div class="mt-3 flex min-h-16 items-center gap-2 rounded-full border-[3px] border-[#b365f3] bg-[#fffaf2] px-3 py-2 text-xs shadow-[0_3px_0_#dfb387]" aria-label="อันดับของฉัน">
            <span class="shrink-0 rounded-full bg-[#ead1ff] px-2 py-1 font-semibold">อันดับของฉัน</span>
            <img src={portraitImage(player.portrait)} alt="" class="h-9 w-9 shrink-0 rounded-full border-2 border-white bg-[#eee0ff] object-cover object-top" />
            {#if playerRank > 0}
              <span class="shrink-0 font-semibold">อันดับ {playerRank}</span><strong class="ml-auto text-lg">{formatter.format(best)}</strong>
            {:else}<strong class="ml-auto text-[#7139a5]">ยังไม่มีคะแนน</strong>{/if}
          </div>
        </main>
      {/if}

      {#if page === 'home' || page === 'shop'}
        <nav class="main-nav fixed bottom-0 left-1/2 z-20 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-2 rounded-t-[25px] border-t border-white bg-[#ffffffed] px-7 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-2px_16px_#34204d09] backdrop-blur-md" aria-label="เมนูหลัก" aria-busy={tabPhase !== null}>
          {#each [{ id: 'home' as const, label: 'Home', icon: House }, { id: 'shop' as const, label: 'Shop', icon: ShoppingBag }] as item (item.id)}
            <button class="relative flex min-h-[57px] flex-col items-center justify-center text-[#8d8796]" class:text-violet={page === item.id} disabled={tabPhase !== null || leaving || entering} aria-current={page === item.id ? 'page' : undefined} onclick={() => navigate(item.id)}><item.icon size={28} strokeWidth={page === item.id ? 2.5 : 2} /><span class="text-sm font-semibold">{item.label}</span>{#if page === item.id}<span class="absolute -bottom-1 h-1 w-12 rounded-full bg-violet"></span>{/if}</button>
          {/each}
        </nav>
      {/if}
    {:else}
      <GameRound url={game.url} name={game.name} playerName={player.name} portrait={portraitImage(player.portrait)} energy={player.energy} onexit={() => requestExit()} onprofile={() => requestExit('profile')} onshop={() => requestExit('shop')} />
    {/if}
  {/if}

  {#if modal}
    <Popup title={modal === 'rules' ? `กติกา${game.name}` : modal === 'result' ? 'จบเกม' : modal === 'purchase' ? 'ยืนยันการแลกพลังงาน' : modal === 'history' ? 'ประวัติการเล่น' : modal === 'exit' ? 'ออกจากเกม' : 'พลังงานหมด'} onclose={closeModal} dismissible={modal !== 'result'}>
      {#if modal === 'rules'}
        <img src={game.cover} alt="" class="mx-auto -mt-2 mb-3 h-24 w-24 rounded-[20px] object-cover" />
        <h2 class="text-center text-3xl font-bold">กติกา{game.name}</h2>
        <ul class="my-5 space-y-4 text-base font-medium">
          <li class="flex items-center gap-3"><Target size={28} class="shrink-0 text-[#f75e79]" />{game.action}</li>
          <li class="flex items-center gap-3"><Volume2 size={28} class="shrink-0 text-[#f5b400]" />{game.warning}</li>
          <li class="flex items-center gap-3"><Clock3 size={28} class="shrink-0 text-[#d65bbd]" />{game.id === 'mole' ? 'รอบละ 45 วินาที' : 'เวลาและคะแนนแสดงในเกม'}</li>
          <li class="flex items-center gap-3"><Zap size={28} class="energy-art shrink-0" />ใช้พลังงาน 1 หน่วยต่อรอบ</li>
        </ul>
        <button class="gloss w-full text-xl" onclick={beginRound}>{startAfterRules ? 'เข้าใจแล้ว เริ่มเกม' : 'เข้าใจแล้ว'}</button>
      {:else if modal === 'empty'}
        <Zap class="energy-art mx-auto" size={70} />
        <h2 class="mt-3 text-center text-3xl font-bold">พลังงานหมด</h2>
        <p class="mx-auto mt-3 w-fit rounded-full border border-[#c88df1] bg-[#e7c8ff] px-7 text-2xl font-bold">0/12</p>
        <p class="mt-4 text-center">ใช้พลังงาน 1 หน่วยเพื่อเริ่มเกม</p>
        <p class="mb-5 mt-2 flex items-center justify-center gap-2 text-sm"><Clock3 class="text-violet" size={22} />ฟื้นพลังงานอีก <strong>{countdown}</strong></p>
        <button class="gloss w-full text-xl" onclick={() => navigate('shop')}><Plus size={26} />เติมพลังงาน</button>
        <button class="soft-button mt-3 w-full" onclick={closeModal}>ปิด</button>
      {:else if modal === 'purchase'}
        <Zap class="energy-art mx-auto" size={68} />
        <h2 class="mt-3 text-center text-2xl font-semibold">แลกพลังงาน {packs[selectedPack].energy} หน่วย</h2>
        <div class="my-5 rounded-xl bg-[#eee0fb] px-4 py-3 text-sm"><p class="flex justify-between"><span>AIS Point ที่ใช้</span><strong>{packs[selectedPack].price}</strong></p><p class="mt-2 flex justify-between text-muted"><span>คงเหลือหลังแลก</span><strong>{formatter.format(Math.max(0, player.points - packs[selectedPack].price))}</strong></p></div>
        <button class="gloss w-full text-xl" disabled={player.points < packs[selectedPack].price} onclick={purchase}><Check size={22} />{player.points < packs[selectedPack].price ? 'AIS Point ไม่เพียงพอ' : 'ยืนยันการแลก'}</button>
        <button class="soft-button mt-3 w-full" onclick={closeModal}>ยกเลิก</button>
      {:else if modal === 'history'}
        <History size={42} class="mx-auto text-violet" /><h2 class="my-4 text-center text-2xl font-semibold">ประวัติ{game.name}</h2>
        {#if !player.history.some((round) => round.game === selectedGame)}<p class="py-8 text-center text-muted">ยังไม่มีประวัติการเล่น</p>{/if}
        <ol class="max-h-[45dvh] space-y-2 overflow-auto">{#each player.history.filter((round) => round.game === selectedGame) as round (round)}<li class="flex justify-between gap-3 rounded-lg bg-[#f0e3ff] p-3 text-xs"><span>{dateFormatter.format(round.at)}</span><strong class="shrink-0 text-base text-violet">{formatter.format(round.score)}</strong></li>{/each}</ol>
        <button class="gloss mt-5 w-full" onclick={closeModal}>ตกลง</button>
      {:else if modal === 'result'}
        <Trophy size={64} class="mx-auto fill-[#ffcf31] text-[#eaa100]" /><h2 class="text-center text-3xl font-bold text-[#9317d7]">จบเกม</h2>
        <img src={characterImage(player.character)} alt="" class="mx-auto -mb-5 mt-3 h-[170px] w-[160px] object-contain" />
        <div class="relative rounded-[20px] border border-[#e4d6c6] bg-white/70 p-4 text-center"><p class="mx-auto -mt-7 mb-3 w-fit rounded-full bg-[#d5a5ff] px-8 py-1 font-medium">{player.name}</p><p class="text-lg font-semibold">คะแนนรอบนี้</p><strong class="block text-6xl font-bold text-[#8d16cc] drop-shadow-sm">{formatter.format(roundScore)}</strong><div class="mt-4 flex items-center justify-center gap-3 border-t border-[#d5a5ee] pt-3"><Trophy size={32} class="fill-[#ffd43d] text-[#e0a20b]" /><div class="text-left text-xs">สถิติสูงสุด<strong class="block text-2xl font-semibold">{formatter.format(best)} <span class="text-xs text-muted">คะแนน</span></strong></div></div></div>
        <button class="gloss mt-4 w-full flex-col! gap-0!" onclick={requestStart}><span class="flex items-center gap-2 text-xl"><Play size={24} class="fill-white" />เล่นอีกครั้ง</span><span class="text-xs text-[#ffe359]">พลังงาน 1 หน่วย</span></button>
        <button class="soft-button mt-3 w-full" onclick={() => { modal = null; navigate('home'); }}><House size={21} />กลับหน้าหลัก</button>
      {:else if modal === 'exit'}
        <h2 class="mt-5 text-center text-2xl font-semibold">ออกจากเกม?</h2><p class="my-5 text-center text-sm text-muted">คะแนนรอบนี้จะไม่ถูกบันทึก<br />พลังงานที่ใช้ไปจะไม่ถูกคืน</p>
        <button class="gloss w-full" onclick={() => { playing = false; modal = null; navigate(exitDestination); }}>ออกจากเกม</button><button class="soft-button mt-3 w-full" onclick={closeModal}>เล่นต่อ</button>
      {/if}
    </Popup>
  {/if}

  {#if toast}<div role="status" class="fixed bottom-24 left-1/2 z-50 w-max max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-[#2b1646ed] px-5 py-3 text-center text-sm text-white shadow-lg">{toast}</div>{/if}
</div>

<style>
  .app-shell.tab-switching { height: 100dvh; overflow: hidden; }
  .main-stage { position: relative; height: 274px; }
  .sheet.tab-lowered { transform: translateY(28px); opacity: 0; pointer-events: none; transition: transform .13s ease-in, opacity .13s ease-in; }
  .sheet.tab-rising { animation: tab-rise .19s cubic-bezier(.2, .75, .3, 1) both; }
  .main-nav button:disabled { opacity: 1; }
  @keyframes tab-rise { from { transform: translateY(28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .game-heading-icon { display: grid; width: 42px; height: 36px; flex-shrink: 0; place-items: center; border: 1px solid #cfa2ff; border-radius: 12px; color: white; background: linear-gradient(160deg, #c377ff, #8b24eb 48%, #6100c8); box-shadow: inset 0 2px 1px #ffffff80, inset 0 -2px 1px #5100a3, 0 2px 0 #49059a; }
  .ranking-title { color: #ffce35; text-shadow: 2px 2px 0 #722548, -2px -2px 0 #722548, 0 4px 0 #722548; }
  .ranking-podium { display: grid; grid-template-columns: 1fr 1.15fr 1fr; align-items: end; gap: 3px; height: 236px; margin: 12px 0 4px; padding: 0 5px; list-style: none; }
  .podium-place { --podium-light: #ffe877; --podium-color: #ffbf00; --podium-dark: #d78a00; position: relative; min-width: 0; text-align: center; }
  .podium-second { --podium-light: #f2ebff; --podium-color: #c1afd9; --podium-dark: #8e78af; }
  .podium-third { --podium-light: #ffdbb9; --podium-color: #edac77; --podium-dark: #c4763c; }
  .podium-portrait { position: relative; z-index: 1; width: 76px; height: 76px; margin: 0 auto -8px; border: 3px solid var(--podium-light); border-radius: 50%; background: #e3c9ff; object-fit: cover; object-position: top; box-shadow: 0 0 0 2px var(--podium-color), 0 2px 6px #603a5b38; }
  .podium-first .podium-portrait { width: 88px; height: 88px; }
  .podium-base { position: relative; display: flex; height: 113px; flex-direction: column; align-items: center; justify-content: end; gap: 3px; padding: 28px 5px 10px; border: 2px solid var(--podium-light); border-radius: 50% 50% 12px 12px / 17% 17% 5px 5px; background: linear-gradient(90deg, var(--podium-dark), var(--podium-light) 25%, var(--podium-color) 65%, var(--podium-dark)); box-shadow: inset 0 3px 0 #ffffffa6, 0 3px 4px #7f532329; }
  .podium-first .podium-base { height: 139px; }
  .podium-third .podium-base { height: 103px; }
  .podium-medal { position: absolute; top: 4px; left: 50%; display: grid; width: 35px; height: 35px; transform: translateX(-50%); place-items: center; border: 2px solid var(--podium-light); border-radius: 50%; background: var(--podium-color); color: var(--podium-dark); font-size: 26px; font-weight: 700; line-height: 1; text-shadow: 0 1px 0 white; box-shadow: 0 2px 0 var(--podium-dark); }
  .podium-first .podium-medal { top: 10px; width: 43px; height: 43px; font-size: 32px; }
  .podium-name, .podium-score { display: block; width: 100%; overflow: hidden; border-radius: 999px; padding: 1px 4px; white-space: nowrap; text-overflow: ellipsis; font-size: 15px; line-height: 1.4; }
  .podium-name { background: #fff5dc; }
  .podium-score { color: white; background: linear-gradient(#c875f5, #8b13ce); box-shadow: inset 0 1px 1px #ffffff90; }
  .podium-first .podium-score { font-size: 19px; }
  .selection-character :global(.stage) { height: min(49dvh, 480px); min-height: 260px; }
  .selection-character :global(.actor) { top: 5%; height: 75%; width: 82%; object-fit: contain; object-position: center bottom; }
  .selection-character :global(.platform) { bottom: 5%; }
  .edit-stage :global(.stage) { height: 310px; }
  .edit-stage :global(.actor) { top: 65px; height: 230px; width: 65%; object-fit: contain; object-position: center bottom; }
  .edit-stage :global(.platform) { opacity: 1; bottom: 8px; width: 62%; left: 19%; }
  @media (max-width: 359px) { :global(.game-cover) { gap: 5px; padding: 5px; } :global(.game-cover strong) { font-size: 14px; } :global(.game-cover > svg) { width: 16px; } }
</style>