<script lang="ts">
  import { untrack } from 'svelte';
  import { ArrowLeft, ArrowLeftRight, Bell, Search, UserRound, Grid2X2, House, Gift, QrCode, Package, Store, Smartphone, Globe, CreditCard, Wallet, Shield, CircleHelp, Tv, Gamepad2, Pencil, ChevronRight, X, Signal, ReceiptText, Send, Coins, Check } from '@lucide/svelte';
  import Popup from './Popup.svelte';

  let { name, portrait, points, onsavename, onstart, initialScreen = 'home' }: { name: string; portrait: string; points: number; onsavename: (name: string) => void; onstart: () => void; initialScreen?: 'home' | 'zone' } = $props();
  let screen = $state<'home' | 'zone'>(untrack(() => initialScreen));
  let more = $state(false);
  let nameDialog = $state<'entry' | 'edit' | null>(null);
  let nameDraft = $state('');
  let pointsDialog = $state(false);
  let moreDialog = $state<HTMLDialogElement>();
  const zoneImages = ['assets/myais/game-zone-banner.webp', 'assets/myais/free-games-banner.webp', 'assets/myais/minigame-entry.webp'];

  $effect(() => {
    if (more && moreDialog && !moreDialog.open) moreDialog.showModal();
  });
  const homeTiles = [
    { label: 'จ่าย/เติมเงิน', icon: CreditCard }, { label: 'ดูบิล', icon: ReceiptText },
    { label: 'เช็กเน็ต/โทร', icon: Smartphone }, { label: 'แพ็กเสริม', icon: Package },
    { label: 'myNetwork', icon: Signal }, { label: 'สิทธิพิเศษส่วนตัว', icon: Gift },
    { label: 'Online Store', icon: Store },
  ];
  const moreTiles = [
    { label: 'โรมมิ่ง & โทรไปต่างประเทศ', icon: Globe }, { label: 'ช่วยเหลือ', icon: CircleHelp },
    { label: 'เปิดใช้ซิม', icon: Smartphone }, { label: 'ลุ้นเสิร์ช', icon: Gift },
    { label: 'เปลี่ยนเป็นรายเดือน', icon: ReceiptText }, { label: 'ย้ายมา AIS', icon: Smartphone },
    { label: 'AIS PLAY', icon: Tv }, { label: 'เกมโซน', icon: Gamepad2 },
    { label: 'ประกัน', icon: Shield }, { label: 'ออมเงินกับ กอช.', icon: Wallet },
    { label: 'AIS ID', icon: UserRound }, { label: 'สมัครเน็ตบ้าน', icon: Signal },
    { label: 'จองคิวที่สาขา', icon: Store }, { label: 'CLIX', icon: Send },
    { label: 'อัปเดตผู้ใช้งานซิม', icon: UserRound },
  ];

  function openName(mode: 'entry' | 'edit') {
    nameDraft = mode === 'entry' ? '' : name;
    nameDialog = mode;
  }

  function saveName(event: SubmitEvent) {
    event.preventDefault();
    const value = nameDraft.trim();
    if (!value) return;
    onsavename(value);
    if (nameDialog === 'entry') { screen = 'zone'; more = false; }
    nameDialog = null;
    window.scrollTo({ top: 0 });
  }
</script>

<svelte:head>
  {#if more || nameDialog === 'entry' || screen === 'zone'}
    {#each zoneImages as source (source)}<link rel="preload" as="image" href={source} />{/each}
  {/if}
</svelte:head>

<main class="ais-shell" class:ais-zone={screen === 'zone'}>
  {#if screen === 'home'}
    <header class="ais-greeting">
      <div class="ais-user-icon"><UserRound size={27} strokeWidth={1.7} /></div>
      <div><small>สวัสดี</small><h1>คุณ masque</h1></div>
      <div class="ais-header-icons"><Search size={20} /><span class="ais-bell"><Bell size={20} /><i>3</i></span><span class="ais-mascot">AIS</span></div>
    </header>
    <section class="ais-account" aria-label="บัญชีของฉัน">
      <div class="ais-account-line"><span class="ais-fibre">AIS<br /><b>FIBRE</b></span><strong>880-XXX-5824</strong><span class="ais-switch"><ArrowLeftRight size={20} /></span></div>
      <div class="ais-account-options"><div>เอไอเอส ไฟเบอร์ทรี<br /><small>ดูสิทธิประโยชน์</small><ChevronRight size={16} /></div><div class="ais-pink"><span class="ais-p">P</span><span>85 คะแนน<br /><small>20 คะแนน สิ้นสุด: 30 ...</small></span><ChevronRight size={16} /></div></div>
      <div class="ais-bill"><div>599.00 บาท<small>กำหนดชำระ: 15 พ.ย. 2569</small></div><button disabled class="ais-lime">จ่ายบิล</button></div>
      <div class="ais-clix"><Send size={20} /><strong>CLIX</strong><span>CLIX Bank<br /><small>ธนาคารที่รู้ใจคุณ</small></span><ChevronRight size={18} /></div>
    </section>
    <section class="ais-promo" aria-label="สิทธิพิเศษ"><small>สิทธิพิเศษสำหรับลูกค้า AIS</small><strong>ความสุขที่เลือกได้<br /><span>ให้ทุกวันพิเศษกว่าเดิม</span></strong><div class="ais-promo-art"><img src="assets/myais/phone-promotion.webp" alt="สมาร์ตโฟน" width="400" height="400" decoding="async" /></div><span>AIS Privileges</span></section>
    <div class="ais-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <section class="ais-tiles ais-home-tiles" aria-label="บริการ">
      {#each homeTiles as tile (tile.label)}<button disabled><tile.icon size={29} strokeWidth={1.3} /><span>{tile.label}</span></button>{/each}
      <button class="ais-more-button" onclick={() => { more = true; }}><span class="ais-new">ใหม่</span><Grid2X2 size={29} strokeWidth={1.3} /><span>เพิ่มเติม</span></button>
    </section>
    <h2 class="ais-services-title">บริการออนไลน์</h2>
    <div class="ais-online"><div><CreditCard size={22} />เติมเงินออนไลน์</div><div><Gift size={22} />สิทธิพิเศษสำหรับคุณ</div></div>
    <nav class="ais-nav" aria-label="เมนู myAIS">
      {#each [{ label: 'หน้าหลัก', icon: House }, { label: 'สิทธิพิเศษ', icon: Gift }, { label: 'สแกน', icon: QrCode }, { label: 'แพ็กเกจ', icon: Package }, { label: 'โปรไฟล์', icon: UserRound }] as item (item.label)}<button disabled class:ais-active={item.label === 'หน้าหลัก'} class:ais-scan={item.label === 'สแกน'}><item.icon size={24} strokeWidth={1.6} /><span>{item.label}</span></button>{/each}
    </nav>
  {:else}
    <header class="ais-zone-header"><button class="ais-back" aria-label="กลับหน้า myAIS" title="กลับหน้า myAIS" onclick={() => { screen = 'home'; }}><ArrowLeft size={21} /></button><h1>เกมโซน</h1><button class="ais-points" onclick={() => { pointsDialog = true; }} aria-label="ดู AIS Point"><img src="assets/currency/ais-point.webp" alt="" />{points.toLocaleString()} AIS Point</button></header>
    <div class="ais-zone-account"><span class="ais-fibre">AIS<br /><b>FIBRE</b></span><strong>880-XXX-5824</strong></div>
    <section class="ais-zone-banner" aria-label="กิจกรรมเกม"><img src={zoneImages[0]} alt="" width="960" height="536" decoding="async" fetchpriority="high" /><div><span>AIS GAMING</span><strong>สนุกได้ทุกวัน</strong></div></section>
    <div class="ais-dots" aria-hidden="true"><i></i><i></i><i></i></div>
    <section class="ais-game-section" aria-labelledby="free-games-heading">
      <div class="ais-section-label"><h2 id="free-games-heading"><Gamepad2 size={22} />เล่นเกมฟรี</h2><CircleHelp size={15} /><span class="ais-coins"><Coins size={15} />0 คอยน์</span></div>
      <div class="ais-free-art"><img src={zoneImages[1]} alt="เล่นเกมไม่อั้น มากกว่า 40 เกมส์" width="960" height="340" decoding="async" /></div>
      <div class="ais-name-bar"><button onclick={() => openName('edit')} aria-label="เปลี่ยนชื่อผู้เล่น"><img src={portrait} alt="" /><strong>{name}</strong><Pencil size={16} /></button><button disabled class="ais-checkin">เช็กอินและเล่นเกม</button></div>
    </section>
    <section class="ais-game-section ais-mini-section" aria-label="minigame2">
      <img class="ais-entry-image" src={zoneImages[2]} alt="minigame2 สนุกกับมินิเกม ตีตุ่น จับคู่ ฟันผลไม้ และยิงเป็ด" width="852" height="557" decoding="async" />
      <button class="ais-entry-start" onclick={onstart} aria-label="เริ่มเล่นเกม" title="เริ่มเล่นเกม"></button>
    </section>
  {/if}

  {#if more}
    <dialog bind:this={moreDialog} class="ais-more-sheet" aria-label="เพิ่มเติม" oncancel={() => { more = false; }} onclose={() => { more = false; }}>
      <div class="ais-sheet-handle"></div>
      <header><h2>เพิ่มเติม</h2><button aria-label="ปิดเมนูเพิ่มเติม" title="ปิด" onclick={() => { more = false; }}><X size={24} /></button></header>
      <div class="ais-tiles ais-more-tiles">{#each moreTiles as tile (tile.label)}<button disabled={tile.label !== 'เกมโซน'} onclick={() => openName('entry')} class:ais-game-zone-button={tile.label === 'เกมโซน'}>{#if tile.label === 'เกมโซน'}<span class="ais-new">ใหม่</span>{/if}<tile.icon size={30} strokeWidth={1.2} /><span>{tile.label}</span></button>{/each}</div>
      <button disabled class="ais-lime ais-edit-menu">แก้ไขเมนู<Pencil size={17} /></button>
    </dialog>
  {/if}
</main>

{#if nameDialog}
  <Popup title={nameDialog === 'entry' ? 'ตั้งชื่อผู้เล่น' : 'เปลี่ยนชื่อผู้เล่น'} onclose={() => { nameDialog = null; }}>
    <form onsubmit={saveName}>
      <UserRound size={42} class="mx-auto mb-3 text-violet" />
      <h2 class="mb-5 text-center text-2xl font-semibold">{nameDialog === 'entry' ? 'ตั้งชื่อผู้เล่น' : 'เปลี่ยนชื่อผู้เล่น'}</h2>
      <label class="block text-sm text-muted">ชื่อผู้เล่น<input class="mt-2 block w-full rounded-lg border border-[#d6b8ff] bg-white px-3 py-3 text-base text-ink" bind:value={nameDraft} maxlength="20" required placeholder="ชื่อของคุณ" autocomplete="nickname" /></label>
      <button type="submit" class="gloss mt-5 w-full" disabled={!nameDraft.trim()}><Check size={18} />{nameDialog === 'entry' ? 'ยืนยันชื่อ' : 'บันทึกชื่อ'}</button>
    </form>
  </Popup>
{/if}
{#if pointsDialog}
  <Popup title="AIS Point" onclose={() => { pointsDialog = false; }}><img src="assets/currency/ais-point.webp" alt="" class="mx-auto h-16 w-16" /><h2 class="mt-3 text-center text-xl font-semibold">AIS Point</h2><strong class="my-5 block text-center text-4xl text-violet">{points.toLocaleString()}</strong><button class="gloss w-full" onclick={() => { pointsDialog = false; }}>ตกลง</button></Popup>
{/if}

<style>
  .ais-shell { position: relative; min-height: 100dvh; padding: max(20px, env(safe-area-inset-top)) 14px 100px; color: #f5f5f5; background: linear-gradient(135deg, #242424, #191919 68%, #242424); font-size: 13px; font-weight: 300; }
  .ais-shell button:disabled { opacity: 1; cursor: default; }
  .ais-greeting { display: flex; align-items: center; gap: 10px; padding: 0 0 17px; }
  .ais-user-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 50%; background: #565656; color: #f6f6f6; }
  .ais-greeting small { color: #ddd; font-size: 12px; }
  .ais-greeting h1 { font-size: 22px; font-weight: 400; line-height: 1.2; }
  .ais-header-icons { display: flex; align-items: center; gap: 20px; margin-left: auto; }
  .ais-bell { position: relative; }
  .ais-bell i { position: absolute; top: -4px; right: -3px; width: 12px; height: 12px; border-radius: 50%; background: #e74959; font-size: 8px; text-align: center; font-style: normal; }
  .ais-mascot { color: #b6df36; font-size: 17px; font-weight: 500; font-style: italic; }
  .ais-account { overflow: hidden; border-radius: 15px; background: linear-gradient(125deg, #3c3c3c, #2d2d2d); }
  .ais-account-line { display: flex; align-items: center; gap: 8px; padding: 10px 11px 9px; }
  .ais-fibre { display: flex; width: 35px; height: 35px; flex-shrink: 0; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #cef358; border-radius: 50%; background: white; color: #85a62d; font-size: 8px; font-style: italic; line-height: 1; }
  .ais-fibre b { font-size: 7px; color: #777; }
  .ais-account-line > strong { font-size: 13px; font-weight: 400; }
  .ais-switch { display: grid; width: 38px; height: 38px; margin-left: auto; place-items: center; border-radius: 8px; background: #555965; }
  .ais-account-options { display: grid; grid-template-columns: 1.03fr 1fr; gap: 7px; padding: 0 10px; }
  .ais-account-options > div { position: relative; display: flex; min-height: 43px; align-items: center; gap: 6px; padding: 6px 7px; border: 1px solid #595959; border-radius: 8px; font-size: 10px; background: #252525; }
  .ais-account-options > div:first-child { display: block; padding-right: 17px; }
  .ais-account-options :global(svg) { margin-left: auto; flex-shrink: 0; }
  .ais-account-options > div:first-child :global(svg) { position: absolute; top: 12px; right: 3px; }
  .ais-account-options small { font-size: 8px; }
  .ais-account-options .ais-pink { background: #f00b9e; border-color: #f00b9e; }
  .ais-p { display: grid; width: 23px; height: 23px; flex-shrink: 0; place-items: center; border: 3px solid #ffbce9; border-radius: 50%; background: white; color: #f62c9d; font-weight: 600; }
  .ais-bill { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px 9px; font-size: 14px; }
  .ais-bill small { display: block; margin-top: 3px; color: #ccc; font-size: 10px; }
  .ais-lime { display: flex; align-items: center; justify-content: center; gap: 7px; border-radius: 6px; background: #d3f75b; padding: 5px 20px; color: #253500; }
  .ais-clix { display: flex; align-items: center; gap: 5px; padding: 7px 12px; background: linear-gradient(100deg, #a4fffa, #0adbd8); color: #07364b; }
  .ais-clix > span { margin-left: auto; text-align: right; line-height: 1.1; font-size: 11px; }
  .ais-clix small { font-size: 8px; }
  .ais-promo { position: relative; display: flex; height: 183px; flex-direction: column; align-items: flex-start; justify-content: center; margin-top: 10px; overflow: hidden; border-radius: 14px; background: #edf5ee; padding: 18px; color: #27392e; }
  .ais-promo > small { z-index: 1; width: 48%; color: #518340; font-size: 10px; }
  .ais-promo > strong { z-index: 1; max-width: 53%; margin-top: 7px; font-size: 20px; font-weight: 500; line-height: 1.3; }
  .ais-promo > strong span { font-size: 12px; font-weight: 400; }
  .ais-promo-art { position: absolute; inset: 0 0 0 41%; overflow: hidden; }
  .ais-promo-art img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
  .ais-promo-art::after { position: absolute; inset: 0; content: ''; background: linear-gradient(90deg, #edf5ee, #edf5ee00 35%); }
  .ais-promo > span { position: absolute; z-index: 1; left: 18px; bottom: 13px; font-size: 9px; color: #6b837a; }
  .ais-dots { display: flex; justify-content: center; gap: 5px; margin: 8px 0 10px; }
  .ais-dots i { width: 5px; height: 5px; border-radius: 50%; background: #676767; }
  .ais-dots i:first-child { background: white; }
  .ais-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 5px; }
  .ais-tiles button { position: relative; display: flex; min-width: 0; min-height: 79px; flex-direction: column; align-items: center; justify-content: center; gap: 7px; border-radius: 5px; background: linear-gradient(135deg, #363636, #2e2e2e); padding: 7px 3px; }
  .ais-tiles button > span:not(.ais-new) { max-width: 100%; font-size: 11px; line-height: 1.3; text-align: center; overflow-wrap: anywhere; }
  .ais-tiles .ais-more-button { background: #393939; }
  .ais-new { position: absolute; top: 3px; right: 3px; padding: 2px 4px; border-radius: 3px; background: #ff7b32; color: white; font-size: 8px; line-height: 1; }
  .ais-services-title { margin: 15px 0 10px; font-size: 19px; font-weight: 400; }
  .ais-online { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .ais-online > div { display: flex; align-items: center; gap: 7px; min-height: 54px; padding: 9px; border-radius: 6px; background: #e7f8e9; color: #2e6b35; font-size: 10px; }
  .ais-nav { position: fixed; z-index: 20; bottom: 0; left: 50%; display: grid; width: 100%; max-width: 480px; transform: translateX(-50%); grid-template-columns: repeat(5, 1fr); min-height: 71px; padding: 10px 6px max(10px, env(safe-area-inset-bottom)); border-top: 1px solid #ffffff08; background: #2b2b2bf5; backdrop-filter: blur(12px); }
  .ais-nav button { display: flex; align-items: center; flex-direction: column; gap: 5px; color: #ddd; font-size: 10px; }
  .ais-nav .ais-active { color: #d3f75b; }
  .ais-nav .ais-scan { position: relative; margin-top: -20px; padding-top: 11px; }
  .ais-nav .ais-scan::before { position: absolute; z-index: -1; top: 0; left: 50%; width: 50px; height: 50px; transform: translateX(-50%); border: 1px solid #464646; border-radius: 50%; background: #3a3a3a; content: ''; }
  .ais-more-sheet { position: fixed; top: auto; bottom: 0; left: 50%; width: 100%; max-width: 480px; max-height: 88dvh; margin: 0; overflow-y: auto; transform: translateX(-50%); border: 1px solid #ffffff0a; border-bottom: 0; border-radius: 24px 24px 0 0; padding: 9px 14px max(25px, env(safe-area-inset-bottom)); background: linear-gradient(130deg, #3a3a3a, #262626); color: #f5f5f5; }
  .ais-more-sheet::backdrop { background: #000b; }
  .ais-sheet-handle { width: 40px; height: 4px; margin: 0 auto 9px; border-radius: 5px; background: #666; }
  .ais-more-sheet > header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; font-size: 19px; }
  .ais-more-sheet > header button { display: grid; width: 38px; height: 38px; place-items: center; }
  .ais-more-tiles button { min-height: 83px; background: #ffffff04; }
  .ais-more-tiles .ais-game-zone-button { background: #ffffff05; }
  .ais-edit-menu { width: 100%; margin-top: 24px; min-height: 43px; font-size: 14px; }
  .ais-zone { background: radial-gradient(ellipse 500px 220px at 0 0, #13435a 0, #322337 45%, #1c1c1e 100%); padding-bottom: 16px; }
  .ais-zone-header { display: flex; align-items: center; gap: 7px; min-height: 49px; }
  .ais-back { display: grid; width: 27px; height: 38px; flex-shrink: 0; place-items: center; }
  .ais-zone-header h1 { font-size: 18px; }
  .ais-points { display: flex; align-items: center; gap: 5px; margin-left: auto; padding: 7px 9px; border-radius: 18px; background: #494949; font-size: 10px; }
  .ais-points img { width: 22px; height: 22px; object-fit: contain; }
  .ais-zone-account { display: flex; align-items: center; gap: 8px; margin: 7px 0 16px; padding: 6px 9px; border-radius: 12px; background: #ffffff28; }
  .ais-zone-account strong { font-weight: 400; }
  .ais-zone-banner { position: relative; height: 116px; margin: 0 4px; overflow: hidden; border-radius: 10px; background: #173a53; }
  .ais-zone-banner > img { width: 100%; height: 100%; object-fit: cover; }
  .ais-zone-banner > div { position: absolute; right: 9px; bottom: 9px; padding: 3px 8px; border-radius: 5px; background: #131829ba; text-align: right; }
  .ais-zone-banner span { display: block; font-size: 9px; color: #d3f75b; }
  .ais-zone-banner strong { font-size: 18px; }
  .ais-game-section { margin-top: 20px; }
  .ais-section-label { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .ais-section-label h2 { display: flex; align-items: center; gap: 4px; color: white; font-size: 17px; font-weight: 600; text-shadow: 0 2px #6c16f6, 2px 0 #6c16f6, -2px 0 #6c16f6, 0 -2px #6c16f6; }
  .ais-coins { display: flex; align-items: center; gap: 3px; margin-left: auto; padding: 5px 7px; border-radius: 5px; background: #b08c16; color: #211b05; font-size: 11px; }
  .ais-free-art { width: 100%; overflow: hidden; border-radius: 13px 13px 0 0; }
  .ais-free-art img { display: block; width: 100%; height: auto; }
  .ais-name-bar { display: flex; gap: 5px; align-items: center; min-height: 47px; padding: 5px; border: 3px solid #987aff; border-top: 0; border-radius: 0 0 12px 12px; background: white; color: #333; }
  .ais-name-bar > button:first-child { display: flex; min-width: 0; flex: 1; align-items: center; gap: 6px; padding: 0 3px; text-align: left; }
  .ais-name-bar img { width: 31px; height: 31px; flex-shrink: 0; border-radius: 50%; object-fit: cover; object-position: top; }
  .ais-name-bar strong { overflow: hidden; flex: 1; white-space: nowrap; text-overflow: ellipsis; font-weight: 400; }
  .ais-checkin { flex-shrink: 0; border-radius: 5px; padding: 7px; background: linear-gradient(110deg, #32baff, #9e35f6); color: white; font-size: 11px; }
  .ais-mini-section { position: relative; margin: 18px -7px 0; }
  .ais-entry-image { display: block; width: 100%; height: auto; aspect-ratio: 852 / 557; }
  .ais-entry-start { position: absolute; left: 28.9%; top: 82.3%; width: 41.5%; height: 13%; border: 0; border-radius: 999px; background: transparent; }
  .ais-entry-start:hover { box-shadow: 0 0 14px #a441ff85; }
  .ais-entry-start:focus-visible { outline: 3px solid #d5f75b; outline-offset: 3px; }
  @media (max-width: 350px) { .ais-shell { padding-right: 10px; padding-left: 10px; } .ais-header-icons { gap: 13px; } .ais-tiles button > span:not(.ais-new) { font-size: 9px; } .ais-more-tiles button { min-height: 76px; } }
</style>