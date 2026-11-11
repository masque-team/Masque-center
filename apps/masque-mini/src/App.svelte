<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowLeft, ChevronDown, ChevronRight, Plus, Zap, Clock3, Gamepad2, House, ShoppingBag, UserRound, ImagePlus, Check, Copy, Pencil, Play, Trophy, ClipboardList, History, Star, Volume2, Target, X, Upload, CalendarDays, CheckCircle2 } from '@lucide/svelte';
  import Stage from './Stage.svelte';
  import Popup from './Popup.svelte';
  import GameRound from './GameRound.svelte';
  import MyAis from './MyAis.svelte';
  import { buyEnergy, CHARACTERS, claimDailyEnergy, dailyCheckin, DAILY_ENERGY_REWARDS, loadPlayer, newPlayer, packs, recover, SAVE_KEY, spendEnergy, type Character, type GameId, type Player } from './model';
  import { games, demoRankings, displayedPlayCount, rankingPeriods, samplePlayerScore, publicAssetUrl, characterImage, characterNames, portraitImage } from './catalog';

  type Page = 'home' | 'shop' | 'profile' | 'edit' | 'detail' | 'ranking';
  type Modal = 'rules' | 'empty' | 'purchase' | 'history' | 'exit' | null;
  let player = $state<Player>(newPlayer());
  let ready = $state(false);
  let inMyAis = $state(true);
  let aisScreen = $state<'home' | 'zone'>('home');
  let page = $state<Page>('home');
  let previousPage: 'home' | 'shop' = 'home';
  let modal = $state<Modal>(null);
  let choosing = $state(true);
  let characterDraft = $state<Character>('aqua');
  let portraitDraft = $state('cat');
  let editTab = $state<'character' | 'portrait'>('character');
  let selectedGame = $state<GameId>('mole');
  let game = $derived(games.find((item) => item.id === selectedGame)!);
  let gameBackdrop = $derived(publicAssetUrl(game.id === 'mole' ? 'assets/ui-redesign/gameflow/mole-intro-hero.webp' : game.cover, import.meta.env.BASE_URL));
  let selectedPack = $state(0);
  let playing = $state(false);
  let roundScore = $state<number | null>(null);
  let roundSimulated = $state(false);
  let showResult = $state(false);
  let replayButton = $state<HTMLButtonElement>();
  let roundVersion = $state(0);
  let startAfterRules = $state(false);
  let leaving = $state(false);
  let entering = $state(false);
  let tabPhase = $state<'lowering' | 'rising' | null>(null);
  let toast = $state('');
  let now = $state(Date.now());
  let uploadInput = $state<HTMLInputElement>();
  let viewportHeight = $state(0);
  let scrollTop = $state(0);
  let stageHeight = $state(0);
  let sheetHeight = $state(0);
  let moreGamesBelow = $derived(ready && !inMyAis && !choosing && !playing && page === 'home' && !tabPhase && !leaving && !entering && scrollTop + viewportHeight < stageHeight + sheetHeight - 34);
  let transitionTimer: ReturnType<typeof setTimeout>;
  let toastTimer: ReturnType<typeof setTimeout>;
  let navigationVersion = $state(0);
  let exitDestination = $state<Page>('detail');
  let rankingMonth = $state(0);
  let periods = $derived(rankingPeriods(now));
  let rankingPeriod = $derived(periods[rankingMonth] ?? periods[0]);
  let best = $derived(Math.max(0, ...player.history.filter((round) => round.game === selectedGame).map((round) => round.score)));
  let periodRounds = $derived(player.history.filter((round) => round.game === selectedGame && round.at >= rankingPeriod.start && round.at < rankingPeriod.end));
  let periodBest = $derived(Math.max(0, ...periodRounds.map((round) => round.score)));
  let rankingScore = $derived(periodRounds.length ? periodBest : samplePlayerScore(selectedGame, rankingMonth));
  let rankings = $derived([
    ...demoRankings(selectedGame, rankingMonth),
    { id: 'player', name: player.name, portrait: player.portrait, score: rankingScore, isPlayer: true },
  ].sort((first, second) => second.score - first.score));
  let playerRank = $derived(rankings.findIndex((entry) => entry.isPlayer) + 1);
  let seconds = $derived(Math.max(0, Math.ceil((player.refillAt - now) / 1000)));
  let countdown = $derived(`${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`);
  let checkin = $derived(dailyCheckin(player, now));
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

  $effect(() => {
    if (showResult) replayButton?.focus();
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

  function enterFromMyAis() {
    characterDraft = player.character;
    choosing = true;
    page = 'home';
    inMyAis = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function returnToGameZone() {
    aisScreen = 'zone';
    inMyAis = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function selectCharacter() {
    player = { ...player, character: characterDraft, selected: true };
    choosing = false;
  }

  function openEditor() {
    characterDraft = player.character;
    portraitDraft = player.portrait;
    editTab = 'character';
    navigate('edit');
  }

  function saveProfile() {
    player = { ...player, character: characterDraft, portrait: portraitDraft };
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
    roundScore = null;
    roundSimulated = false;
    showResult = false;
    playing = true;
  }

  function receiveScore(score: number, simulated = false) {
    if (roundScore !== null) return;
    roundScore = score;
    roundSimulated = simulated;
    player = { ...player, history: [{ game: selectedGame, score, at: Date.now(), simulated }, ...player.history].slice(0, 50) };
  }

  function openResult() {
    if (roundScore === null) receiveScore(1200, true);
    showResult = true;
  }

  function replay() {
    const next = spendEnergy(player);
    if (!next) { modal = 'empty'; return; }
    player = next;
    roundScore = null;
    roundSimulated = false;
    showResult = false;
    roundVersion++;
  }

  function finishRound() {
    playing = false;
    showResult = false;
    navigate('home');
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

  function claimCheckin() {
    const time = Date.now();
    const reward = dailyCheckin(player, time).reward;
    const next = claimDailyEnergy(player, time);
    if (!next) return;
    player = next;
    notify(`รับพลังงาน ${reward} หน่วยแล้ว`);
  }

  function closeModal() {
    modal = null;
  }

  function scrollToGames() {
    document.querySelector('.mini-game-card:last-child')?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
</script>

<svelte:window bind:innerHeight={viewportHeight} bind:scrollY={scrollTop} />

<div class="app-shell relative mx-auto min-h-dvh max-w-[480px] overflow-x-clip bg-[#f7f5fb] shadow-[0_0_80px_#1c123c20]" class:tab-switching={tabPhase !== null}>
  {#if !ready}
    <div class="grid min-h-dvh place-content-center text-violet">Masque Play</div>
  {:else if inMyAis}
    <MyAis name={player.name} portrait={portraitImage(player.portrait)} points={player.points} initialScreen={aisScreen} onsavename={(name) => { player = { ...player, name }; }} onstart={enterFromMyAis} />
  {:else if choosing}
    <main class="character-selection">
      <header class="selection-header">
        <button class="icon-button" aria-label="กลับเกมโซน" title="กลับเกมโซน" onclick={returnToGameZone}><ArrowLeft size={25} strokeWidth={3} /></button>
        <div class="selection-profile"><img src={portraitImage(player.portrait)} alt="" /><strong>{player.name}</strong></div>
      </header>
      <div class="selection-character"><Stage character={characterDraft} full /></div>
      <section class="selection-panel">
        <h1>เลือกตัวละครที่แสดงบนหน้าโปรไฟล์</h1>
        <div class="selection-choices" aria-label="เลือกตัวละคร">
          {#each characters as character (character)}
            <button class="choice selection-choice" class:selection-selected={characterDraft === character} aria-label={characterNames[character]} aria-pressed={characterDraft === character} onclick={() => { characterDraft = character; }}>
              <img src={portraitImage(character)} alt={characterNames[character]} />
              {#if characterDraft === character}<span class="selection-check"><Check size={22} strokeWidth={4} /></span>{/if}
            </button>
          {/each}
        </div>
        <p>กดตกลงเพื่อบันทึกตัวละคร</p>
        <button class="gloss selection-confirm" aria-label="ยืนยันตัวละคร" onclick={selectCharacter}>ตกลง</button>
      </section>
    </main>
  {:else}
    {#if !playing}
      <header class="absolute left-0 right-0 top-0 z-10 flex items-start justify-between gap-2 px-3 pt-[max(14px,env(safe-area-inset-top))]" class:bg-black={page === 'ranking'} class:pb-3={page === 'ranking'}>
        <div class="flex min-w-0 items-center gap-2">
          <button class="icon-button" title={page === 'home' ? 'กลับเกมโซน' : 'ย้อนกลับ'} aria-label={page === 'home' ? 'กลับเกมโซน' : 'ย้อนกลับ'} onclick={() => page === 'home' ? returnToGameZone() : navigate(page === 'edit' ? 'profile' : page === 'ranking' ? 'detail' : previousPage === page ? 'home' : previousPage)}><ArrowLeft size={25} strokeWidth={3} /></button>
          <button class="flex h-12 min-w-0 items-center gap-2 rounded-full bg-[#fcf8ff] pr-5 text-left shadow-sm" onclick={() => navigate('profile')} aria-label="ดูโปรไฟล์">
            <img class="h-[54px] w-[54px] shrink-0 rounded-full border-[3px] border-white bg-[#e7d9ff] object-cover object-top" src={portraitImage(player.portrait)} alt="" />
            <span class="min-w-0"><strong class="block max-w-[90px] truncate text-lg leading-5">{player.name}</strong>{#if page === 'home' || page === 'shop'}<span class="text-[10px]">ดูโปรไฟล์ &gt;</span>{/if}</span>
          </button>
        </div>
        {#if page === 'shop'}
          <div class="flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#fcf8ff] px-3"><img src="assets/currency/ais-point.webp" alt="" class="h-8 w-8 object-contain" /><span><span class="block text-[10px] font-medium leading-3">AIS Point</span><strong class="text-xl leading-5">{formatter.format(player.points)}</strong></span></div>
        {:else}
          <button class="flex h-12 shrink-0 items-center gap-1 rounded-full bg-[#eee5ff] py-1 pl-2 pr-1.5 text-left" aria-label="เติมพลังงาน" onclick={() => navigate('shop')}>
            <Zap class="energy-art" size={29} /><span><span class="block text-[10px] leading-3">พลังงาน</span><strong class="text-lg leading-5">{player.energy}/12</strong></span><span class="ml-1 grid h-6 w-6 place-items-center rounded-full bg-violet text-white shadow-sm"><Plus size={19} strokeWidth={3} /></span>
          </button>
        {/if}
      </header>

      {#if page === 'home' || page === 'shop' || page === 'profile' || page === 'edit'}
        <div bind:clientHeight={stageHeight} class:main-stage={page === 'home' || page === 'shop'} class:profile-stage={fullStage} class:edit-stage={editStage}><Stage character={displayCharacter} full={fullStage} backdrop={page === 'home' || page === 'shop'} /></div>
        {#if page === 'profile'}
          <main class="profile-content relative z-[3] flex flex-col items-center justify-end gap-5 px-8" class:sheet-leaving={leaving}>
            <button class="soft-button border-0 bg-[#e9ceff] text-lg font-semibold" onclick={copyId}>ID: M8Q7K2<Copy size={18} /></button>
            <button class="gloss w-full text-2xl" onclick={openEditor}><Pencil size={23} class="fill-white" />แก้ไขโปรไฟล์</button>
          </main>
        {:else}
          {#key navigationVersion}
            <main bind:clientHeight={sheetHeight} class="sheet" class:sheet-leaving={leaving} class:sheet-entering={entering} class:tab-lowered={tabPhase === 'lowering'} class:tab-rising={tabPhase === 'rising'} inert={tabPhase !== null || leaving}>
              <div class="mx-auto mb-3 h-1 w-9 rounded-full bg-[#ddcdec]" aria-hidden="true"></div>
              {#if page === 'home'}
                <section class="daily-checkin" aria-label="เช็กอินรายวัน">
                  <div class="checkin-header">
                    <h2>เช็กอินรายวัน</h2><span class="checkin-progress">วันที่ {checkin.day + 1} จาก 7</span>
                  </div>
                  <ol class="checkin-days" aria-label="รางวัลพลังงาน 7 วัน">
                    {#each DAILY_ENERGY_REWARDS as reward, index (index)}
                      {@const claimed = index < checkin.day || index === checkin.day && checkin.claimed}
                      <li>
                        <button class="checkin-day" class:checkin-today={index === checkin.day} class:checkin-done={claimed} disabled={index !== checkin.day || checkin.claimed} onclick={claimCheckin} aria-label={`วันที่ ${index + 1} พลังงาน ${reward} หน่วย${claimed ? ' รับแล้ว' : index === checkin.day ? ' วันนี้' : ' รอรับ'}`}>
                          <span class="checkin-day-label">วันที่ {index + 1}</span><Zap size={22} class="energy-art" /><strong class="checkin-reward">+{reward} พลังงาน</strong><span class="checkin-status">{#if claimed}<Check size={10} />{/if}{claimed ? 'รับแล้ว' : index === checkin.day ? 'วันนี้' : 'รอรับ'}</span>
                        </button>
                      </li>
                    {/each}
                  </ol>
                </section>
                <section class="energy-panel p-3" aria-label="พลังงานของฉัน">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2"><Zap size={58} class="energy-art shrink-0" strokeWidth={1.5} /><div><h1 class="text-lg font-semibold leading-6">พลังงานของฉัน</h1><p class="text-[#6b4c9a]"><strong class="text-4xl font-semibold text-ink">{player.energy}</strong><span class="text-2xl font-semibold">/12</span></p></div></div>
                    <button class="gloss min-h-10! whitespace-nowrap px-3! text-sm" onclick={() => navigate('shop')}><Plus size={19} class="rounded-full bg-white text-violet" />เติมพลังงาน</button>
                  </div>
                  <div class="mt-2 grid grid-cols-12 gap-1" aria-label={`${player.energy} จาก 12 หน่วย`}>
                    {#each Array(12) as _, index (index)}<span class="flex aspect-square items-center justify-center rounded-[7px] border" class:energy-refilling={player.energy < 12 && index === player.energy} aria-label={player.energy < 12 && index === player.energy ? 'กำลังฟื้นพลังงาน' : undefined} class:border-[#f5a500]={index < player.energy} class:bg-[#ffd642]={index < player.energy} class:border-[#d3bcec]={index >= player.energy} class:bg-[#ddccee]={index >= player.energy}><Zap size={17} fill={index < player.energy ? '#f5a500' : '#b29acb'} color={index < player.energy ? '#ee8d00' : '#b29acb'} /></span>{/each}
                  </div>
                  <div class="mt-3 grid grid-cols-[1fr_1.13fr] items-center gap-2 text-[#69439a]">
                    <p class="flex items-center gap-1 text-xs"><Clock3 size={21} class="shrink-0" />{player.energy >= 12 ? 'พลังงานเต็มแล้ว' : 'ฟื้นพลังงานอีก'}{#if player.energy < 12}<strong class="text-ink">{countdown}</strong>{/if}</p>
                    <p class="border-l border-[#b994d9] pl-3 text-[10px] leading-4">ฟื้น 1 พลังงานทุก 30 นาที สูงสุด 12<br />เล่น 1 รอบใช้ 1 พลังงาน</p>
                  </div>
                </section>
                <h2 class="section-heading mb-4 mt-5"><span class="game-heading-icon" aria-hidden="true"><Gamepad2 size={29} strokeWidth={2.2} class="fill-none" /></span>เลือกเกมที่อยากเล่น</h2>
                <div class="grid grid-cols-2 gap-3">
                  {#each games as item (item.id)}
                    <button class="game-cover mini-game-card" onclick={() => { selectedGame = item.id; navigate('detail'); }}>
                      <img src={item.cover} alt="" class="mini-game-cover" />
                      <span class="mini-game-info"><strong class="mini-game-title">{item.name}</strong><span class="mini-game-count"><span>เล่นแล้วทั้งหมด</span><strong>{formatter.format(displayedPlayCount(item.id, player.history.filter((round) => round.game === item.id).length))} รอบ</strong></span></span>
                      <ChevronRight class="mini-game-arrow" size={20} />
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
                    <div class="inventory-grid character-grid">
                      {#each characters as character (character)}
                        <button class="choice inventory-choice" class:choice-selected={characterDraft === character} aria-label={characterNames[character]} aria-pressed={characterDraft === character} onclick={() => { characterDraft = character; }}>
                          <img src={portraitImage(character)} alt="" />
                          <span class="inventory-label">{character === player.character ? 'ใช้งานอยู่' : characterDraft === character ? 'เลือกแล้ว' : characterNames[character]}</span>
                          {#if characterDraft === character}<CheckCircle2 size={22} class="absolute right-0 top-0 rounded-full bg-violet text-white" />{/if}
                        </button>
                      {/each}
                    </div>
                  {:else}
                    <input bind:this={uploadInput} type="file" accept="image/png,image/jpeg,image/webp" class="hidden" onchange={uploadPortrait} aria-label="อัปโหลดรูปโปรไฟล์" />
                    <div class="inventory-grid">
                      <button class="choice inventory-choice bg-[#eadbff]!" onclick={() => uploadInput?.click()}><span class="inventory-upload"><ImagePlus size={36} class="text-violet" /></span><span class="inventory-label">อัปโหลดรูป</span></button>
                      {#each ['cat', ...characters] as portrait (portrait)}
                        <button class="choice inventory-choice" class:choice-selected={portraitDraft === portrait} aria-pressed={portraitDraft === portrait} aria-label={portrait === 'cat' ? 'รูปเริ่มต้น' : characterNames[portrait as Character]} onclick={() => { portraitDraft = portrait; }}><img src={portraitImage(portrait)} alt="" /><span class="inventory-label">{portrait === player.portrait ? 'ใช้งานอยู่' : portraitDraft === portrait ? 'เลือกแล้ว' : portrait === 'cat' ? 'รูปเริ่มต้น' : characterNames[portrait as Character]}</span>{#if portraitDraft === portrait}<CheckCircle2 size={20} class="absolute right-0 top-0 rounded-full bg-violet text-white" />{/if}</button>
                      {/each}
                    </div>
                    {#if portraitDraft.startsWith('data:')}<div class="mt-4 flex items-center justify-center gap-3 text-sm text-muted"><img src={portraitDraft} alt="รูปที่อัปโหลด" class="h-14 w-14 rounded-full object-cover" />รูปที่เลือก<Check size={20} class="text-violet" /></div>{/if}
                  {/if}
                </div>
                <button class="gloss mt-5 w-full text-xl" onclick={saveProfile}><Check size={22} />ตกลง</button>
              {/if}
            </main>
          {/key}
        {/if}
      {:else if page === 'detail'}
        <main class="game-scenery min-h-dvh pb-7 pt-[76px]" style={`--game-art: url('${gameBackdrop}')`} class:sheet-leaving={leaving}>
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
        <main class="ranking-page min-h-dvh px-3 pb-5 pt-[74px]" style={`--game-art: url('${gameBackdrop}')`} class:sheet-leaving={leaving}>
          <section class="ranking-showcase">
            <div class="ranking-heading">
              <div class="ranking-game-mark"><img src={game.cover} alt="" /><Trophy size={64} class="fill-[#ffd74c] text-[#e7a500]" /></div>
              <h1 class="ranking-title">อันดับ<span>{game.name}</span></h1>
              <p class="ranking-round">รอบปัจจุบัน</p>
            <label class="ranking-period"><CalendarDays size={17} /><select aria-label="รอบอันดับ" bind:value={rankingMonth}>{#each periods as period (period.offset)}<option value={period.offset}>{period.label}</option>{/each}</select></label>
              <p class="mt-2 text-center text-xs font-medium text-[#532475]">จัดอันดับจากคะแนนสูงสุดต่อรอบ</p>
            </div>
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
          </section>
          <section class="ranking-table" aria-label="อันดับผู้เล่น">
            <div class="mb-1 grid grid-cols-[44px_1fr_96px] rounded-full bg-[#ffedc9] p-2 text-center text-xs font-semibold"><span>อันดับ</span><span>ผู้เล่น</span><span>คะแนนสูงสุด</span></div>
            <ol start="4" class="space-y-1" aria-label={`อันดับ${game.name}`}>
              {#each rankings.slice(3) as entry, index (entry.id)}
                <li value={index + 4} class="ranking-row" class:ranking-self={entry.isPlayer}>
                  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eee0ff] font-semibold">{index + 4}</span>
                  <img src={portraitImage(entry.portrait)} alt="" class="h-10 w-10 shrink-0 rounded-full bg-[#f0e5ff] object-cover object-top" />
                  <strong class="min-w-0 flex-1 truncate text-base">{entry.name}</strong>
                  <strong class="shrink-0 text-xl">{formatter.format(entry.score)}</strong>
                </li>
              {/each}
            </ol>
          </section>
          <div class="my-ranking-bar" aria-label="อันดับของฉัน">
            <span class="shrink-0 rounded-full bg-[#ead1ff] px-2 py-1 font-semibold">อันดับของฉัน</span>
            <img src={portraitImage(player.portrait)} alt="" class="h-9 w-9 shrink-0 rounded-full border-2 border-white bg-[#eee0ff] object-cover object-top" />
            {#if playerRank > 0}
              <span class="shrink-0 font-semibold">อันดับ {playerRank}</span><strong class="ml-auto text-lg">{formatter.format(rankingScore)}</strong>
            {:else}<strong class="ml-auto text-[#7139a5]">ยังไม่มีคะแนน</strong>{/if}
          </div>
        </main>
      {/if}

      {#if page === 'home' || page === 'shop'}
        <nav class="main-nav fixed bottom-0 left-1/2 z-20 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-2 rounded-t-[25px] border-t border-white bg-[#ffffffed] px-7 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-2px_16px_#34204d09] backdrop-blur-md" aria-label="เมนูหลัก" aria-busy={tabPhase !== null}>
          {#if moreGamesBelow}<button class="more-games-button" aria-label="ดูเกมเพิ่มเติม" title="ดูเกมเพิ่มเติม" onclick={scrollToGames}><ChevronDown size={20} strokeWidth={2.5} /></button>{/if}
          {#each [{ id: 'home' as const, label: 'Home', icon: House }, { id: 'shop' as const, label: 'Shop', icon: ShoppingBag }] as item (item.id)}
            <button class="relative flex min-h-[57px] flex-col items-center justify-center text-[#8d8796]" class:text-violet={page === item.id} disabled={tabPhase !== null || leaving || entering} aria-current={page === item.id ? 'page' : undefined} onclick={() => navigate(item.id)}><item.icon size={28} strokeWidth={page === item.id ? 2.5 : 2} /><span class="text-sm font-semibold">{item.label}</span>{#if page === item.id}<span class="absolute -bottom-1 h-1 w-12 rounded-full bg-violet"></span>{/if}</button>
          {/each}
        </nav>
      {/if}
    {:else}
      <div inert={showResult}>
        {#key roundVersion}
          <GameRound url={game.url} gameId={selectedGame} name={game.name} playerName={player.name} portrait={portraitImage(player.portrait)} energy={player.energy} onexit={openResult} onprofile={() => requestExit('profile')} onshop={() => requestExit('shop')} onscore={receiveScore} />
        {/key}
      </div>
      {#if showResult}
        <div class="round-result" role="dialog" aria-modal="true" aria-labelledby="result-title" tabindex="-1">
          <div class="result-content">
            <Trophy size={52} class="result-trophy" />
            <h1 id="result-title">จบเกม</h1>
            <img class="result-character" src={characterImage(player.character)} alt={characterNames[player.character]} />
            <div class="result-card">
              <p class="result-name">{player.name}</p>
              <p class="result-label">คะแนนรอบนี้</p>
              <strong class="result-score">{formatter.format(roundScore ?? 1200)}</strong>
              {#if roundSimulated}<p class="result-demo">คะแนนจำลอง บันทึกในประวัติและอันดับแล้ว</p>{/if}
              <div class="result-best"><Trophy size={44} class="result-trophy" /><div>สถิติสูงสุด{#if !player.history.some((round) => round.game === selectedGame)} <span>(ตัวอย่าง)</span>{/if}<strong>{formatter.format(player.history.some((round) => round.game === selectedGame) ? best : 1800)} <span>คะแนน</span></strong></div></div>
            </div>
            <button bind:this={replayButton} class="gloss result-replay" onclick={replay}><span><Play size={25} fill="currentColor" />เล่นอีกครั้ง</span><small><Zap size={17} class="energy-art" />พลังงาน 1 หน่วย</small></button>
            <button class="soft-button result-home" onclick={finishRound}><House size={23} />กลับหน้าหลัก</button>
          </div>
        </div>
      {/if}
    {/if}
  {/if}

  {#if modal}
    <Popup title={modal === 'rules' ? `กติกา${game.name}` : modal === 'purchase' ? 'ยืนยันการแลกพลังงาน' : modal === 'history' ? 'ประวัติการเล่น' : modal === 'exit' ? 'ออกจากเกม' : 'พลังงานหมด'} onclose={closeModal}>
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
        <button class="gloss w-full text-xl" onclick={() => { playing = false; showResult = false; navigate('shop'); }}><Plus size={26} />เติมพลังงาน</button>
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
        <ol class="max-h-[45dvh] space-y-2 overflow-auto">{#each player.history.filter((round) => round.game === selectedGame) as round (round)}<li class="flex justify-between gap-3 rounded-lg bg-[#f0e3ff] p-3 text-xs"><span>{dateFormatter.format(round.at)}{#if round.simulated}<span class="block text-muted">คะแนนจำลอง</span>{/if}</span><strong class="shrink-0 text-base text-violet">{formatter.format(round.score)}</strong></li>{/each}</ol>
        <button class="gloss mt-5 w-full" onclick={closeModal}>ตกลง</button>
      {:else if modal === 'exit'}
        <h2 class="mt-5 text-center text-2xl font-semibold">ออกจากเกม?</h2><p class="my-5 text-center text-sm text-muted">คะแนนที่เกมยังไม่ส่งจะไม่ถูกบันทึก<br />พลังงานที่ใช้ไปจะไม่ถูกคืน</p>
        <button class="gloss w-full" onclick={() => { playing = false; modal = null; navigate(exitDestination); }}>ออกจากเกม</button><button class="soft-button mt-3 w-full" onclick={closeModal}>เล่นต่อ</button>
      {/if}
    </Popup>
  {/if}

  {#if toast}<div role="status" class="fixed bottom-24 left-1/2 z-50 w-max max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-[#2b1646ed] px-5 py-3 text-center text-sm text-white shadow-lg">{toast}</div>{/if}
</div>

<style>
  .round-result { position: fixed; inset: 0; z-index: 40; display: flex; justify-content: center; overflow-y: auto; padding: max(12px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom)); background: #100b22a8; backdrop-filter: blur(5px); }
  .result-content { display: flex; width: min(100%, 430px); min-height: min-content; flex-direction: column; align-items: center; justify-content: center; margin: auto; text-align: center; }
  :global(.result-trophy) { color: #e69b00; fill: #ffc72f; filter: drop-shadow(0 3px 1px #813f00); }
  .result-content h1 { margin: 0; color: #ffc52d; font-size: clamp(38px, 8vh, 60px); font-weight: 800; line-height: 1; text-shadow: 0 3px #8d008e, 0 6px #4e155b, 2px 0 #85217a, -2px 0 #85217a; }
  .result-character { width: min(72%, 290px); height: clamp(140px, 30dvh, 290px); object-fit: contain; object-position: center bottom; margin-bottom: -12px; }
  .result-card { width: 100%; padding: 0 22px 14px; border: 2px solid #e6d9cd; border-radius: 30px; background: #fffcf5f2; box-shadow: 0 4px 0 #7e604633; }
  .result-name { position: relative; width: fit-content; min-width: 46%; max-width: 90%; overflow: hidden; margin: -18px auto 5px; padding: 3px 20px; border-radius: 999px; background: #d3a2f5; font-size: 22px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
  .result-label { font-size: 23px; font-weight: 700; }
  .result-score { display: block; color: #870ed9; font-size: clamp(42px, 10vh, 76px); line-height: 1; text-shadow: 0 3px white; overflow-wrap: anywhere; }
  .result-demo { color: #765c8e; font-size: 12px; }
  .result-best { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 12px; padding-top: 8px; border-top: 2px solid #ca92ed; text-align: left; font-weight: 600; }
  .result-best strong { display: block; font-size: 26px; line-height: 1.1; }
  .result-best span { color: #9e88b6; font-size: 14px; }
  .result-replay, .result-home { width: 90%; margin-top: 12px; }
  .result-replay { flex-direction: column; gap: 0; font-size: 25px; line-height: 1.2; }
  .result-replay span, .result-replay small { display: flex; align-items: center; justify-content: center; gap: 6px; }
  .result-replay small { width: 80%; border-top: 1px solid #ffffff80; font-size: 14px; }
  .result-home { background: #fffafc; border: 2px solid #ae62f4; font-size: 20px; font-weight: 700; }
  .app-shell.tab-switching { height: 100dvh; overflow: hidden; }
  .main-stage { position: relative; height: 236px; }
  .main-stage :global(.actor) { top: 68px; height: 450px; width: 76%; }
  .main-stage + .sheet { min-height: calc(100dvh - 210px); }
  .more-games-button { position: absolute; top: -18px; left: 50%; display: grid; width: 44px; height: 32px; transform: translateX(-50%); place-items: center; border: 1px solid #dbc4f7; border-radius: 999px; background: #fffaff; color: #7800ff; box-shadow: 0 2px 8px #69439a24; }
  .profile-stage { position: absolute; inset: 0; }
  .profile-stage :global(.stage) { position: absolute; inset: 0; width: 100%; height: 100%; min-height: 0; }
  .profile-stage :global(.stage-art) { object-fit: cover; object-position: center; }
  .profile-stage :global(.actor) { height: min(calc(80% - 82px), calc(100% - 240px)); }
  .profile-content { min-height: 100dvh; padding-bottom: max(28px, env(safe-area-inset-bottom)); background: transparent; }
  .sheet.tab-lowered { transform: translateY(28px); opacity: 0; pointer-events: none; transition: transform .13s ease-in, opacity .13s ease-in; }
  .sheet.tab-rising { animation: tab-rise .19s cubic-bezier(.2, .75, .3, 1) both; }
  .main-nav button:disabled { opacity: 1; }
  @keyframes tab-rise { from { transform: translateY(28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .game-heading-icon { display: grid; width: 42px; height: 36px; flex-shrink: 0; place-items: center; border: 1px solid #cfa2ff; border-radius: 12px; color: white; background: linear-gradient(160deg, #c377ff, #8b24eb 48%, #6100c8); box-shadow: inset 0 2px 1px #ffffff80, inset 0 -2px 1px #5100a3, 0 2px 0 #49059a; }
  .mini-game-card { position: relative; display: grid; min-width: 0; grid-template-columns: clamp(42px, 13vw, 64px) minmax(0, 1fr) 20px; align-items: center; gap: 6px; padding: 8px; text-align: left; }
  .mini-game-cover { width: 100%; aspect-ratio: 1; border-radius: 9px; object-fit: cover; }
  .mini-game-info { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
  .mini-game-title { min-width: 0; font-size: 15px; line-height: 1.3; }
  .mini-game-count { display: flex; min-width: 0; flex-direction: column; align-items: flex-start; gap: 1px; color: #74638e; font-size: 9px; line-height: 1.4; white-space: nowrap; }
  .mini-game-count strong { color: #7800ff; font-size: 11px; font-weight: 600; }
  .mini-game-card :global(.mini-game-arrow) { border-radius: 50%; background: #ece3ff; color: #7800ff; }
  @media (max-width: 359px) { .mini-game-card { grid-template-columns: 42px minmax(0, 1fr) 16px; gap: 5px; padding: 6px; } .mini-game-title { font-size: 13px; } .mini-game-count { font-size: 8px; } .mini-game-count strong { font-size: 10px; } }
  .ranking-page { padding-bottom: calc(108px + env(safe-area-inset-bottom)); background: #faf2df; }
  .my-ranking-bar { position: fixed; z-index: 20; left: 50%; bottom: max(12px, env(safe-area-inset-bottom)); display: flex; width: calc(100% - 24px); max-width: 456px; min-height: 64px; align-items: center; gap: 8px; transform: translateX(-50%); padding: 8px 12px; border: 3px solid #b365f3; border-radius: 999px; background: #fffaf2f5; color: #28133f; font-size: 12px; box-shadow: 0 3px 0 #dfb387, 0 6px 22px #50206824; backdrop-filter: blur(8px); }
  .daily-checkin { margin: 0 0 12px; padding: 10px 7px 9px; border: 1px solid #d8bbed; border-radius: 17px; background: linear-gradient(125deg, #f1e5ff, #f9f1ff 65%, #ead9fc); box-shadow: inset 0 2px 2px #fff, 0 2px 0 #d8b8f0; }
  .checkin-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 3px 8px; }
  .checkin-header h2 { border-left: 4px solid #ad31f3; padding-left: 7px; color: #32134f; font-size: 16px; font-weight: 600; line-height: 1.3; }
  .checkin-progress { color: #927ca4; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .checkin-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; list-style: none; }
  .checkin-days li { min-width: 0; }
  .checkin-day { position: relative; display: flex; width: 100%; min-width: 0; min-height: 82px; flex-direction: column; align-items: center; justify-content: space-between; gap: 3px; padding: 3px 1px; border: 1px solid #dfcaf3; border-radius: 9px; color: #532180; background: linear-gradient(#fbf5ff, #ebddfa); box-shadow: inset 0 1px 1px white, 0 2px 0 #d9c3ea; }
  .checkin-day:disabled { opacity: 1; cursor: default; }
  .checkin-day:not(:disabled):hover { filter: brightness(1.07); }
  .checkin-day:not(:disabled):active { transform: translateY(1px); }
  .checkin-day-label { width: 100%; border-radius: 5px; padding: 2px 0; background: #e1c5f8; font-size: 8px; font-weight: 600; line-height: 1; text-align: center; white-space: nowrap; }
  .checkin-reward { font-size: 7px; font-weight: 600; line-height: 1.2; white-space: nowrap; }
  .checkin-status { display: flex; width: 100%; min-height: 15px; align-items: center; justify-content: center; gap: 1px; border-radius: 999px; background: #ddbbf6; font-size: 8px; font-weight: 500; line-height: 1; white-space: nowrap; }
  .checkin-days .checkin-today { border-color: #c447ff; background: linear-gradient(#fff4cb, #fff5e1 65%, #eddaff); box-shadow: 0 0 0 1px #d477fa, 0 2px 0 #b266e6; }
  .checkin-today .checkin-day-label { background: #ffe6a6; }
  .checkin-today .checkin-status { background: linear-gradient(#c257ff, #8200ee); color: white; }
  .checkin-done .checkin-status { background: linear-gradient(#67df66, #24a943); color: white; }
  .ranking-showcase { position: relative; margin: 0 -12px; padding: 16px 12px 12px; background: linear-gradient(#efffffaa, #f5ffe2b3 58%, #99c34b85), var(--game-art) center / cover; }
  .ranking-heading { position: relative; text-align: center; }
  .ranking-game-mark { display: flex; width: fit-content; align-items: center; gap: 9px; margin: 0 auto; }
  .ranking-game-mark img { width: 60px; height: 60px; border: 3px solid #fff5ce; border-radius: 14px; object-fit: cover; box-shadow: 0 3px 8px #60401626; }
  .ranking-title { margin-top: 8px; color: #683046; font-size: 32px; font-weight: 700; line-height: 1.3; text-align: center; text-shadow: 0 2px 0 #fff8e9; }
  .ranking-title span { color: #722ba6; }
  .ranking-round { width: fit-content; margin: 6px auto 0; padding: 2px 24px; border-radius: 999px; background: linear-gradient(#c392ef, #9457d8); color: white; font-size: 17px; font-weight: 600; box-shadow: inset 0 1px 1px white; }
  .ranking-table { position: relative; margin-top: -4px; padding: 9px; border: 2px solid #fffaf2; border-radius: 22px; background: #fff8ebf5; }
  .ranking-row { display: flex; min-height: 58px; align-items: center; gap: 9px; padding: 7px 9px; border: 1px solid #efdec8; border-radius: 17px; background: #fffdf5; box-shadow: 0 2px 3px #a3722c08; }
  .ranking-row.ranking-self { border-color: #d7b4f7; background: linear-gradient(110deg, #ecd2ff, #e3c0fc); }
  .ranking-period { display: flex; width: fit-content; max-width: 100%; align-items: center; gap: 7px; margin: 12px auto 0; padding: 8px 12px; border: 1px solid #d5c0ee; border-radius: 999px; background: white; color: #552880; }
  .ranking-period select { min-width: 0; padding-right: 8px; background: transparent; color: inherit; font: inherit; font-size: 14px; cursor: pointer; }
  .inventory-grid { --tile-size: clamp(76px, calc((100vw - 56px) / 3 - 8px), 104px); display: grid; grid-template-columns: repeat(3, var(--tile-size)); justify-content: center; gap: 12px; margin-inline: auto; }
  .inventory-grid.character-grid { grid-template-columns: repeat(2, var(--tile-size)); }
  .inventory-choice { display: grid; width: var(--tile-size); height: calc(var(--tile-size) + 28px); grid-template-rows: minmax(0, 1fr) 24px; min-width: 0; padding: 0; overflow: hidden; }
  .inventory-choice img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .inventory-label { display: block; overflow: hidden; padding-inline: 3px; background: #e9d8ff; color: #642c94; font-size: 10px; line-height: 24px; white-space: nowrap; text-overflow: ellipsis; }
  .inventory-upload { display: grid; place-items: center; }
  .energy-refilling { animation: energy-recover 1.4s ease-in-out infinite; }
  @keyframes energy-recover { 0%, 100% { background-color: #ddccee; box-shadow: none; } 50% { background-color: #ffdd53; box-shadow: 0 0 7px #f5bb4c80; } }
  @media (prefers-reduced-motion: reduce) { .energy-refilling { animation: none; background-color: #ffe49a; border-color: #e4a618; } }
  .ranking-podium { display: grid; grid-template-columns: 1fr 1.15fr 1fr; align-items: end; gap: 5px; height: 222px; margin: 10px 0 0; padding: 0 5px; list-style: none; }
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
  .character-selection { position: relative; min-height: 100dvh; background: #f7f4fb; }
  .selection-header { position: absolute; z-index: 5; top: max(14px, env(safe-area-inset-top)); left: 14px; right: 14px; display: flex; align-items: center; gap: 10px; }
  .selection-profile { display: flex; min-width: 0; height: 42px; align-items: center; gap: 9px; border-radius: 999px; background: #fcf8ff; padding-right: 24px; }
  .selection-profile img { width: 50px; height: 50px; border: 3px solid white; border-radius: 50%; object-fit: cover; }
  .selection-profile strong { max-width: 150px; overflow: hidden; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
  .selection-character :global(.stage) { height: clamp(280px, 57dvh, 590px); min-height: 0; }
  .selection-character :global(.stage-art) { object-fit: cover; }
  .selection-character :global(.actor) { top: 72px; height: calc(80% - 72px); width: 80%; object-fit: contain; object-position: center bottom; }
  .selection-panel { position: relative; z-index: 3; display: flex; min-height: calc(100dvh - clamp(280px, 57dvh, 590px) + 24px); flex-direction: column; align-items: center; gap: 20px; margin-top: -24px; padding: 26px 22px max(24px, env(safe-area-inset-bottom)); border-radius: 28px 28px 0 0; background: #f7f4fb; }
  .selection-panel h1 { color: #703c9d; font-size: 18px; font-weight: 600; line-height: 1.4; text-align: center; }
  .selection-panel p { color: #a16bd2; font-size: 14px; font-weight: 500; text-align: center; }
  .selection-choices { display: grid; width: min(100%, 260px); grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; padding: 5px; }
  .selection-choice { aspect-ratio: 1; padding: 4px; border-radius: 22px; }
  .selection-choice img { width: 100%; height: 100%; border-radius: 16px; object-fit: cover; }
  .selection-selected { border: 3px solid #ffd63e; box-shadow: 0 0 0 2px #9e20f2, inset 0 0 0 2px #fff3bf, 0 3px 9px #9a44dc30; }
  .selection-check { position: absolute; right: -4px; bottom: -4px; display: grid; width: 34px; height: 34px; place-items: center; border: 3px solid white; border-radius: 50%; background: #8309df; color: white; box-shadow: 0 0 0 2px #edbd35; }
  .selection-confirm { width: 100%; min-height: 52px; font-size: 24px; }
  @media (max-height: 700px) { .selection-character :global(.stage) { height: 50dvh; } .selection-panel { min-height: calc(50dvh + 24px); gap: 12px; padding-top: 20px; } .selection-choices { max-width: 216px; } }
  .edit-stage :global(.stage) { height: 310px; }
  .edit-stage :global(.actor) { top: 65px; height: 230px; width: 65%; object-fit: contain; object-position: center bottom; }
  .edit-stage :global(.platform) { opacity: 1; bottom: 8px; width: 62%; left: 19%; }
  @media (max-width: 359px) { :global(.game-cover) { gap: 5px; padding: 5px; } :global(.game-cover strong) { font-size: 14px; } :global(.game-cover > svg) { width: 16px; } }
</style>