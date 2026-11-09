import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const base = process.env.UX_BASE_URL ?? 'http://localhost:5173/maque-center/';
const output = process.env.UX_OUTPUT_DIR;
const key = 'masquegame_center_v2';
const browser = await chromium.launch({ headless: true });
let views = 0;
const results = [];
const assets = new Set();
const images = new Set();
const failures = [];

async function run(width) {
  // Every run owns a new context: never reset or change an existing player's save.
  const context = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: 'no-preference', isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.request().resourceType() === 'image' && response.url().startsWith(base)) images.add(response.url());
    if (response.status() >= 400 && response.url().startsWith(base) && /\.(png|webp|svg|jpe?g)(\?|$)/i.test(response.url())) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  const url = (hash = '') => `${base}?name=${encodeURIComponent('QA ผู้เล่นชื่อยาวมากABCDEFGHIJKLMNOPQRSTUVWXYZ')}#${hash}`;
  const state = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
  const fixture = async (patch) => {
    await page.evaluate(({ key, patch }) => {
      const current = JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify({
        ...current, ...patch, demo: { ...current.demo, ...patch.demo },
      }));
    }, { key, patch });
    await page.reload();
    await page.locator('.app-frame').waitFor();
  };
  const route = async (hash, rendered = hash.split('/')[0], heading) => {
    await page.goto(url(hash));
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', rendered);
    await expect(page).toHaveURL(url(hash));
    const expectedHeading = heading === 'กิจกรรม & ความคืบหน้า' ? 'เลือกเกมที่อยากเล่น' : heading === 'ร้านค้าแลกรางวัล' ? 'ร้านค้า' : heading;
    if (expectedHeading) await expect(page.getByRole('heading', { name: expectedHeading, exact: true })).toBeVisible();
    else assert.ok(await page.locator('h1,h2').count(), `Missing unique heading: ${hash}`);
  };
  const layout = async (name) => {
    await page.evaluate(async () => { await document.fonts.ready; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: overflow ${name}`);
    const broken = await page.locator('img').evaluateAll((images) => images
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.src));
    assert.deepEqual(broken, [], `${width}: broken images on ${name}`);
    (await page.locator('img').evaluateAll((elements) => elements.map((image) => image.currentSrc || image.src))).forEach((value) => images.add(value));
    const backgrounds = await page.locator('*').evaluateAll((elements) => [...new Set(elements.flatMap((element) =>
      [...getComputedStyle(element).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((match) => match[1]),
    ))]);
    backgrounds.filter((value) => !value.startsWith('data:')).forEach((value) => assets.add(value));
    const navTargets = await page.locator('nav[aria-label="เมนูหลัก"] a').evaluateAll((links) => links.map((link) => {
      const tab = link.getBoundingClientRect();
      const icon = link.querySelector('svg').getBoundingClientRect();
      return !!link.getAttribute('aria-label')
        && tab.width >= 44 && tab.height >= 44
        && Math.abs(icon.width - icon.height) < 1;
    }));
    if (name === 'entry' || name.startsWith('game/')) {
      assert.equal(navTargets.length, 0, `${name} should not render player navigation`);
    } else {
      assert.ok(navTargets.length === 5 && navTargets.every(Boolean), `${width}: navigation target or accessible label ${name}`);
    }
    const simpleNav = await page.locator('nav.bottom-nav').evaluateAll((navs) => navs.every((nav) => {
      const bounds = nav.getBoundingClientRect();
      const style = getComputedStyle(nav);
      return bounds.left >= 0 && innerWidth - bounds.right <= 1
        && Math.abs(bounds.width - Math.min(innerWidth, 460)) <= 1
        && innerHeight - bounds.bottom <= 1
        && style.backgroundColor === 'rgba(255, 255, 255, 0.96)' && style.borderTopWidth === '1px'
        && style.pointerEvents === 'auto' && nav.querySelectorAll('.nav-label').length === 0
        && [...nav.querySelectorAll('a')].every((link) => getComputedStyle(link).pointerEvents === 'auto');
    }));
    if (name !== 'entry' && !name.startsWith('game/')) assert.ok(simpleNav, `${width}: Instagram-style bottom navigation layout ${name}`);
    const campaignGeometry = await page.locator('.campaign-visual-wrap').evaluateAll((banners) => banners.every((banner) => {
      const image = banner.querySelector('img');
      const category = banner.querySelector('.campaign-category-pill').getBoundingClientRect();
      const copy = banner.querySelector('.campaign-hero-copy').getBoundingClientRect();
      const bounds = banner.getBoundingClientRect();
      return getComputedStyle(image).objectFit === 'cover'
        && category.bottom < copy.top
        && [...banner.querySelectorAll('.campaign-top-badges svg')].every((icon) => {
          const box = icon.getBoundingClientRect();
          return Math.abs(box.width - box.height) < 1;
        })
        && category.right <= bounds.right;
    }));
    assert.ok(campaignGeometry, `${width}: squeezed campaign artwork or overlapping badges ${name}`);
    const homeOrder = await page.locator('.home-dashboard').evaluateAll((dashboards) => dashboards.every((dashboard) => {
      const selectors = ['.ais-promo', '.pass-row', '.checkin-row', '.games-section', '.campaign-section[aria-label="เทศกาล"]', '.campaign-section[aria-label="การแข่งขัน"]'];
      const sections = selectors.map((selector) => dashboard.querySelector(selector)?.getBoundingClientRect());
      return dashboard.firstElementChild.matches('.ais-promo')
        && sections.every((section) => section && section.width > 0)
        && sections.slice(1).every((section, index) => sections[index].bottom <= section.top);
    }));
    assert.ok(homeOrder, `${width}: Home must order promotion, Pass, check-in, games, festivals and competitions`);
    assert.deepEqual(errors, [], `Runtime errors at ${name}`);
    views++;
  };
  const close = async () => {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
  };
  const save = async () => {
    await page.getByRole('button', { name: 'บันทึกและปิดหน้าต่าง' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  };
  try {
    await page.goto(base);
    await expect(page.locator('#entry-title')).toBeVisible();
    await layout('entry');
    await page.getByRole('button', { name: 'เริ่มการผจญภัยเลย' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await page.getByRole('textbox').fill('QA Entry');
    await page.getByRole('button', { name: 'เริ่มการผจญภัยเลย' }).click();
    await expect(page.getByRole('heading', { name: 'เลือกตัวละคร', exact: true })).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'ตัวละครที่มี' }).getByRole('radio')).toHaveCount(1);
    await page.getByRole('button', { name: 'ยืนยันตัวละคร' }).click();
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'hub');
    await page.goto(url());
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'hub');
    assert.equal(new URL(page.url()).hash, '#hub');
    // Explicit, isolated wallet/ownership fixture; no activity or customer URL creates AIS.
    const initial = await state();
    assert.equal(initial.aisPoints, 0);
    const ownedAvatar = initial.demo.config.shop.find((item) => item.kind === 'avatar' && !initial.ownedAvatarIds.includes(item.itemId));
    const ownedPet = initial.demo.config.shop.find((item) => item.kind === 'pet' && !initial.ownedPetIds.includes(item.itemId));
    await fixture({
      aisPoints: 2000, energy: 15,
      ownedAvatarIds: [...initial.ownedAvatarIds, ownedAvatar.itemId],
      ownedPetIds: [...initial.ownedPetIds, ownedPet.itemId],
      demo: { frames: ['meadow'], frameId: 'meadow', achievements: [{ id: 'first-finish', title: 'First Finish', at: Date.now() }] },
    });
    const regular = [
      ['hub', 'hub', 'Game Hub'], ['home', 'home', 'เลือกเกมที่อยากเล่น'],
      ['shop', 'shop', 'ร้านค้า'], ['rewards', 'rewards', 'Masque Pass'],
      ['profile', 'profile', 'โปรไฟล์ของฉัน'], ['ranking', 'ranking', 'Ranking'],
      ['achievements', 'achievements', 'เช็กอินต่อเนื่อง'], ['missions', 'missions', 'Pass Missions'],
      ['campaigns', 'campaigns', 'Campaigns'], ['inventory', 'inventory', 'Inventory'],
      ['history', 'history', 'History'], ['vip', 'shop', 'ร้านค้า'],
    ];
    for (const [hash, rendered, heading] of regular) {
      await route(hash, rendered, heading);
      if (hash === 'profile') {
        const profile = await state();
        await expect(page.locator('.scenic-header.profile-expanded')).toBeVisible();
        await expect(page.locator('.scenic-avatar')).toHaveAttribute('src', `assets/world/actors/avatars-${profile.avatarId}.webp`);
        if (profile.petId) await expect(page.locator('.scenic-pet')).toHaveAttribute('src', `assets/world/actors/pets-${profile.petId}.webp`);
        await expect(page.locator('.profile-tools button')).toHaveCount(4);
        await expect.poll(async () => {
          const sceneBounds = await page.locator('.scenic-header').boundingBox();
          const avatarBounds = await page.locator('.scenic-avatar').boundingBox();
          return sceneBounds.height >= 300 && avatarBounds.height > 150;
        }).toBe(true);
      }
      if (hash === 'shop') {
        await expect(page.getByRole('tab', { name: 'พลังงาน' })).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('.energy-pack')).toHaveCount(6);
      }
      if (hash === 'vip') await expect(page.getByRole('tab', { name: 'สมาชิก VIP' })).toHaveAttribute('aria-selected', 'true');
      if (hash === 'rewards') {
        await expect(page.locator('[aria-label="ซีซัน Pass"] img[alt="Nyx"]')).toBeVisible();
        await expect(page.locator('[aria-label="ซีซัน Pass"] .nyx-breathe')).toHaveCSS('animation-name', 'nyx-breathe');
        const nyxSize = await page.locator('[aria-label="ซีซัน Pass"] img[alt="Nyx"]').evaluate((image) => {
          const bounds = image.getBoundingClientRect();
          return { width: bounds.width, height: bounds.height };
        });
        assert.ok(nyxSize.width >= 90 && nyxSize.height >= 150, `${width}: Nyx should be a prominent season reward`);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await expect(page.locator('[aria-label="ซีซัน Pass"] .nyx-breathe')).toHaveCSS('animation-name', 'none');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }
      await layout(hash);
      await page.getByRole('link', { name: 'GAME', exact: true }).click();
      await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'hub');
      await expect(page.locator('.scenic-header')).not.toHaveClass(/profile-expanded/);
    }
    await route('home', 'home', 'เลือกเกมที่อยากเล่น');
    const homePlayer = await state();
    await expect(page.locator('.scenic-avatar')).toHaveAttribute('src', `assets/world/actors/avatars-${homePlayer.avatarId}.webp`);
    if (homePlayer.petId) {
      await expect(page.locator('.scenic-pet')).toHaveAttribute('src', `assets/world/actors/pets-${homePlayer.petId}.webp`);
    }
    await page.getByRole('button', { name: `เล่น ${initial.demo.config.games[0].name}` }).click();
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'detail');
    await route('home', 'home', 'เลือกเกมที่อยากเล่น');
    // Enter at the season overview even at MAX; jumping to the current tier is opt-in.
    const beforePassNavigation = await state();
    const seasonId = await page.evaluate(async ({ base, key }) => {
      const { currentSeason } = await import(new URL('src/lib/services/demoService.ts', base).href);
      return currentSeason(JSON.parse(localStorage.getItem(key))).id;
    }, { base, key });
    for (const xp of [0, 1000, 5000]) {
      await fixture({ demo: { passes: { ...beforePassNavigation.demo.passes, [seasonId]: { xp, claims: [], premium: false } } } });
      await page.getByRole('link', { name: 'Battle Pass', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Masque Pass', exact: true })).toBeVisible();
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => scrollY), 0, `Pass auto-scrolled at ${xp} XP`);
      await layout(`pass-entry/${xp}`);
      if (xp > 0) {
        await page.getByRole('button', { name: 'ไปเลเวลปัจจุบัน', exact: true }).click();
        await expect.poll(() => page.locator('[data-current="true"]').evaluate((target) => {
          const row = target.getBoundingClientRect();
          const nav = document.querySelector('nav[aria-label="เมนูหลัก"]').getBoundingClientRect();
          return row.top >= 138 && row.bottom <= nav.top;
        })).toBe(true);
        assert.ok(await page.evaluate(() => scrollY > 500));
        await page.getByRole('tab', { name: /ภารกิจสะสม XP/ }).click();
        await page.getByRole('tab', { name: /รางวัล 50 เลเวล/ }).click();
        await expect(page.locator('[aria-label="รางรางวัล"]')).toBeVisible();
      }
      await page.getByRole('link', { name: 'HOME', exact: true }).click();
      await page.getByRole('link', { name: 'Battle Pass', exact: true }).click();
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => scrollY), 0, 'Re-entering Pass skipped its overview');
      await page.reload();
      await page.getByRole('heading', { name: 'Masque Pass', exact: true }).waitFor();
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => scrollY), 0, 'Reloading Pass skipped its overview');
      await page.getByRole('link', { name: 'GAME', exact: true }).click();
    }
    await fixture({ demo: { passes: beforePassNavigation.demo.passes } });
    await route('achievements', 'achievements', 'เช็กอินต่อเนื่อง');
    const checkinGeometry = await page.locator('section[aria-label="Daily check-in and streak"]').evaluate((section) => {
      const badge = section.querySelector('span.size-9').getBoundingClientRect();
      const head = section.querySelector('.checkin .head');
      const copy = head.querySelector('.copy').getBoundingClientRect();
      const gift = head.querySelector('.gift').getBoundingClientRect();
      return { badgeWidth: badge.width, badgeHeight: badge.height, copyWidth: copy.width, giftWidth: gift.width, giftHeight: gift.height };
    });
    assert.ok(Math.abs(checkinGeometry.badgeWidth - checkinGeometry.badgeHeight) < 0.01, 'Check-in icon was squeezed');
    assert.ok(Math.abs(checkinGeometry.giftWidth - checkinGeometry.giftHeight) < 0.01);
    assert.ok(checkinGeometry.copyWidth >= 120, 'Check-in copy squeezed into a narrow column');
    await layout('checkin-artwork');
    for (const campaign of initial.demo.config.campaigns) {
      await route(`campaign/${campaign.id}`, 'campaign', campaign.title);
      await layout(`campaign/${campaign.id}`);
      if (campaign.launchMode === 'external' && !campaign.externalUrl) {
        await expect(page.getByRole('button', { name: 'เร็ว ๆ นี้', exact: true })).toBeDisabled();
      }
      await page.getByRole('button', { name: 'รวมแคมเปญ' }).click();
      await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'campaigns');
    }
    for (const game of initial.demo.config.games.filter((game) => game.published !== false)) {
      await route(`detail/${game.id}`, 'detail');
      await layout(`detail/${game.id}`);
      await expect(page.locator('.page-shell .heading')).toHaveCount(0);
      await page.getByRole('button', { name: new RegExp(`เริ่มเล่น ${game.name}`) }).click();
      await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'game');
      const sessionUrl = page.url();
      assert.equal(new URL(sessionUrl).hash.split('?')[0], `#game/${game.id}`);
      assert.ok(new URLSearchParams(new URL(sessionUrl).hash.split('?')[1]).get('session'));
      await expect(page.getByRole('region', { name: `เกม ${game.name}`, exact: true })).toBeVisible();
      await expect(page.locator('iframe')).toHaveAttribute('src', new URL(game.url).href);
      const entered = await state();
      await page.reload();
      await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'game');
      assert.equal(page.url(), sessionUrl);
      assert.equal((await state()).energy, entered.energy, 'Reload charged Energy twice');
      assert.equal((await state()).demo.sessions.length, entered.demo.sessions.length);
      await layout(`game/${game.id}`);
      await page.getByRole('button', { name: 'กลับหน้าเกม', exact: true }).click();
      await expect(page.getByRole('button', { name: new RegExp(`เริ่มเล่น ${game.name}`) })).toBeVisible();
    }
    // Unsupported Gemini URLs must never masquerade as successfully tested pages.
    for (const invalid of ['game', 'season', 'game-detail/mole', 'play/mole', 'campaign/camp-1', 'detail/unknown']) {
      await page.goto(url(invalid));
      await expect(page).toHaveURL(url('hub'));
      await expect(page.getByRole('heading', { name: 'Game Hub', exact: true })).toBeVisible();
      await expect(page.getByRole('status')).toContainText('ไม่พบหน้านี้');
    }
    const beforeInvalid = await state();
    await page.goto(url('game/mole?session=missing'));
    await expect(page).toHaveURL(url('detail/mole'));
    assert.equal((await state()).energy, beforeInvalid.energy);
    assert.equal((await state()).demo.sessions.length, beforeInvalid.demo.sessions.length);
    for (const alias of ['wallet', 'points', 'gacha']) {
      await page.goto(url(alias));
      await expect(page).toHaveURL(url('shop'));
      await expect(page.getByRole('heading', { name: 'ร้านค้า', exact: true })).toBeVisible();
    }
    for (const alias of ['world', 'room', 'battle', 'avatar']) {
      await page.goto(url(alias));
      await expect(page).toHaveURL(url('hub'));
    }

    // Four floating tools: actual items, ownership guards, equip, removal and persistence.
    await route('profile', 'profile', 'โปรไฟล์ของฉัน');
    const tools = ['ปรับแต่งตัวละคร Avatar', 'ปรับแต่งสัตว์เลี้ยงคู่หู Pet', 'ปรับแต่งกรอบรูปโปรไฟล์', 'ปรับแต่งเหรียญตราและของตกแต่งห้อง'];
    for (const name of tools) {
      await page.getByRole('button', { name, exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(1);
      await layout(`profile-sheet/${name}`);
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      await close();
      await expect(page.getByRole('button', { name, exact: true })).toBeFocused();
    }
    await page.getByRole('button', { name: tools[0], exact: true }).click();
    for (const name of ['ตัวละคร', 'คู่หู', 'กรอบรูป', 'ตรา/ฉาก']) {
      await page.getByRole('dialog').getByRole('button', { name, exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(1);
    }
    await close();
    await page.getByRole('button', { name: tools[0], exact: true }).click();
    const avatarCards = page.getByRole('dialog').locator('button[aria-label^="ตัวละคร "]');
    const lockedAvatar = avatarCards.filter({ hasText: 'ล็อกอยู่' }).first();
    const beforePreview = await state();
    await lockedAvatar.click();
    assert.equal((await state()).avatarId, beforePreview.avatarId);
    assert.deepEqual((await state()).ownedAvatarIds, beforePreview.ownedAvatarIds);
    await save();
    assert.equal((await state()).avatarId, beforePreview.avatarId);
    await page.getByRole('button', { name: tools[0], exact: true }).click();
    await page.getByRole('dialog').locator('button[aria-label^="ตัวละคร "]').filter({ hasText: 'สวมใส่' }).first().click();
    const avatarId = (await state()).avatarId;
    assert.notEqual(avatarId, beforePreview.avatarId);
    await save();
    await page.getByRole('button', { name: tools[1], exact: true }).click();
    const beforePetPreview = await state();
    await page.getByRole('dialog').locator('button[aria-label^="สัตว์เลี้ยง "]').filter({ hasText: 'ล็อกอยู่' }).first().click();
    assert.equal((await state()).petId, beforePetPreview.petId);
    assert.deepEqual((await state()).ownedPetIds, beforePetPreview.ownedPetIds);
    await page.getByRole('dialog').locator('button[aria-label^="สัตว์เลี้ยง "]').filter({ hasText: 'เลือกใช้' }).first().click();
    const petId = (await state()).petId;
    await save();
    await page.getByRole('button', { name: tools[2], exact: true }).click();
    await page.getByRole('button', { name: /กรอบรูป Ocean Tide/ }).click();
    assert.equal((await state()).demo.frameId, 'meadow');
    assert.deepEqual((await state()).demo.frames, ['meadow']);
    await save();
    await page.getByRole('button', { name: tools[2], exact: true }).click();
    await page.getByRole('button', { name: /ไม่ใส่กรอบ/ }).click();
    await expect(page.locator('.sheet-card .avatar-frame-wrap').first()).toHaveAttribute('data-frame', 'none');
    await save();
    await page.reload();
    assert.equal((await state()).demo.frameId, null);
    assert.equal((await state()).avatarId, avatarId);
    assert.equal((await state()).petId, petId);
    await expect(page.locator('header .frame-ring')).toHaveCount(0);
    await page.getByRole('button', { name: tools[2], exact: true }).click();
    await page.getByRole('button', { name: /กรอบรูป Meadow Sprout/ }).click();
    await save();
    await page.reload();
    await expect(page.locator('.scenic-header.profile-expanded')).toBeVisible();
    await expect(page.locator('.profile-tools')).toBeVisible();
    await expect(page.locator('header .thumb')).toHaveAttribute('data-frame', 'meadow');
    await page.getByRole('button', { name: tools[3], exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: /First Finish/ }).click();
    await page.getByRole('dialog').getByRole('textbox').fill('สวัสดีเพื่อน ๆ');
    await save();
    await page.reload();
    assert.ok((await state()).demo.profile.badgeIds.includes('first-finish'));
    assert.equal((await state()).demo.profile.bio, 'สวัสดีเพื่อน ๆ');
    await expect(page.locator('.scenic-header.profile-expanded')).toBeVisible();
    await expect(page.locator('.scenic-avatar')).toBeVisible();
    await expect(page.locator('.scenic-pet')).toBeVisible();
    await expect(page.locator('.room-stage')).toHaveCount(0);
    // Route changes must tear down the sheet and restore scrolling.
    await page.getByRole('button', { name: tools[0], exact: true }).click();
    await page.evaluate(() => { location.hash = '#ranking'; });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');

    // VIP is Shop-only, opens without debit, confirms exactly once.
    await route('rewards', 'rewards', 'Masque Pass');
    assert.equal(await page.locator('.vip-product-card').count(), 0);
    await route('vip', 'shop', 'ร้านค้าแลกรางวัล');
    const beforeVip = await state();
    const plan = beforeVip.demo.config.vipPlans[0];
    await page.locator('.vip-product-card').first().click();
    await expect(page.getByTestId('vip-pass-offer')).toBeVisible();
    assert.equal((await state()).aisPoints, beforeVip.aisPoints);
    await layout('vip-detail');
    await page.getByRole('button', { name: new RegExp(`แลก ${plan.label}`) }).click({ clickCount: 2 });
    await expect.poll(async () => (await state()).aisPoints).toBe(beforeVip.aisPoints - plan.cost);
    const vip = await state();
    assert.equal(vip.aisPoints, beforeVip.aisPoints - plan.cost);
    assert.ok(Math.abs(vip.vipExpiresAt - Date.now() - plan.durationDays * 86400000) < 10000);
    assert.equal(Object.values(vip.demo.passes).some((pass) => pass.premium), false);
    await close();
    await route('rewards', 'rewards', 'Masque Pass');
    const beforePremium = await state();
    await page.getByRole('button', { name: /^ปลดล็อก · / }).click();
    await expect(page.getByRole('dialog')).toContainText('50 เลเวล');
    const premiumRewards = page.getByRole('dialog').getByRole('region', { name: 'รางวัลเด่น Premium Pass' });
    await expect(premiumRewards).toBeVisible();
    await expect(premiumRewards).toContainText('Nyx');
    await expect(premiumRewards).toContainText('LV.50');
    await expect(premiumRewards).toContainText('รางวัลครบทุกเลเวล');
    assert.ok(await premiumRewards.locator('[aria-label="ไอเทมเด่นใน Premium Pass"] > div').count() > 0);
    assert.equal((await state()).aisPoints, beforePremium.aisPoints);
    await page.getByRole('button', { name: 'ปลดล็อก Premium Pass', exact: true }).click({ clickCount: 2 });
    const premium = await state();
    assert.equal(premium.aisPoints, beforePremium.aisPoints - beforePremium.demo.config.premiumPrice);
    assert.ok(Object.values(premium.demo.passes).some((pass) => pass.premium));
    assert.equal(premium.vipExpiresAt, vip.vipExpiresAt);
    await route('detail/mole', 'detail');
    await expect(page.getByRole('button', { name: /^เริ่มเล่น/ })).toBeVisible();
    await page.getByRole('button', { name: /^เริ่มเล่น/ }).click();
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'game');
    assert.equal(new URL(page.url()).hash.split('?')[0], '#game/mole');
    assert.equal((await state()).energy, vip.energy, 'VIP normal entry was charged');
    await expect(page.locator('.scene-back')).toBeVisible();
    await expect(page.locator('.screen .top, .screen .info')).toHaveCount(0);
    const gameFrame = await page.locator('.stage').evaluate((element) => {
      const style = getComputedStyle(element);
      return { radius: style.borderRadius, border: style.borderTopWidth };
    });
    assert.deepEqual(gameFrame, { radius: '18px', border: '4px' });
    await page.getByRole('button', { name: 'Simulate Finish', exact: true }).click();
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'detail');
    await expect(page.getByRole('region', { name: 'สรุปผลเกม' })).toBeVisible();
    await expect(page.locator('.result-art img')).toHaveAttribute('src', 'assets/ui-redesign/gameflow/mole-gameover-victory.jpg');
    await expect(page.locator('.result-score')).toHaveText(/^[\d,]+$/);
    const finished = await state();
    await expect(page.locator('.hud-card:visible')).toHaveCount(0);
    await page.getByRole('button', { name: 'กลับหน้าหลัก', exact: true }).click();
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'home');
    await expect(page.locator('.hud-card').first()).toBeVisible();
    const maxCards = await page.evaluate(async () => {
      let max = 0;
      const seen = new Set();
      let changed = false;
      let emptySince;
      const lastWidths = new Map();
      const until = performance.now() + 30000;
      while (performance.now() < until) {
        const cards = [...document.querySelectorAll('.hud-card')];
        if (cards.length) emptySince = undefined;
        else if (seen.size) {
          emptySince ??= performance.now();
          if (performance.now() - emptySince > 800) break;
        }
        max = Math.max(max, cards.length);
        for (const card of cards) {
          const label = card.getAttribute('aria-label');
          seen.add(label);
          const fill = card.querySelector('.hud-bar-fill');
          const width = fill.getBoundingClientRect().width;
          if (lastWidths.has(label) && Math.abs(lastWidths.get(label) - width) > 0.1) changed = true;
          lastWidths.set(label, width);
        }
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      return { max, seen: seen.size, changed, remaining: document.querySelectorAll('.hud-card').length };
    });
    assert.ok(maxCards.max <= 4 && maxCards.max > 0, JSON.stringify(maxCards));
    assert.ok(maxCards.seen > 3, 'Overflow HUD notifications were lost');
    assert.ok(maxCards.changed, 'Progress bars did not animate Before to After');
    assert.equal(maxCards.remaining, 0, 'HUD did not drain');
    assert.equal((await state()).aisPoints, premium.aisPoints, 'Gameplay minted AIS');
    await page.reload();
    assert.equal((await state()).demo.profileXp, finished.demo.profileXp);
    assert.deepEqual((await state()).demo.missionClaims, finished.demo.missionClaims);
    assert.equal(await page.locator('.hud-card').count(), 0);
    await route('ranking', 'ranking', 'Ranking');
    await page.getByRole('tab', { name: initial.demo.config.games.find((game) => game.id === 'mole').name, exact: true }).click();
    await page.getByRole('tab', { name: 'ใกล้ฉัน', exact: true }).click();
    await expect(page.locator('li.mine .avatar-frame-wrap')).toHaveAttribute('data-frame', 'meadow');

    // Day-7 actual claim, real mission XP, route changes during animation and no replay.
    await route('home', 'home', 'เลือกเกมที่อยากเล่น');
    const dates = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
    await fixture({ checkinDates: dates });
    const beforeCheckin = await state();
    await page.locator('.checkin-row .feature-action').click();
    const checkedIn = await state();
    assert.equal(checkedIn.aisPoints, beforeCheckin.aisPoints);
    assert.equal(checkedIn.demo.gachaBoxes.pet, beforeCheckin.demo.gachaBoxes.pet + 1);
    assert.equal(checkedIn.demo.achievements.filter((item) => item.id === 'checkin-streak-7').length, 1);
    await expect(page.locator('.checkin-row .feature-action')).toBeDisabled();
    await expect(page.locator('.hud-card').filter({ hasText: 'เช็กอินประจำวันสำเร็จ!' })).toBeVisible();
    await expect(page.locator('.hud-card').filter({ hasText: 'Pet Box' })).toBeVisible();
    // Hash navigation retains a draining presentation queue, without another service invocation.
    await page.evaluate(() => { location.hash = '#missions'; });
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'missions');
    await expect(page.locator('.hud-card')).toHaveCount(0, { timeout: 18000 });
    assert.deepEqual((await state()).demo.missionClaims, checkedIn.demo.missionClaims);
    await page.reload();
    assert.equal((await state()).demo.gachaBoxes.pet, checkedIn.demo.gachaBoxes.pet);
    assert.deepEqual((await state()).demo.passes, checkedIn.demo.passes);
    assert.equal(await page.locator('.hud-card').count(), 0);

    // Product details: Energy, cosmetic/frame, both boxes and Campaign Ticket packs.
    await route('shop', 'shop', 'ร้านค้าแลกรางวัล');
    await page.getByRole('tab', { name: 'พลังงาน', exact: true }).click();
    const firstEnergyPack = (await state()).demo.config.energyPacks[0];
    await page.getByRole('button', { name: `ซื้อพลังงาน ${firstEnergyPack.energy} หน่วย ราคา ${firstEnergyPack.cost} AIS Point`, exact: true }).click();
    const energyBefore = await state();
    await layout('energy-detail');
    await page.getByRole('dialog').getByRole('button', { name: 'เติมพลังงาน', exact: true }).click({ clickCount: 2 });
    const energyAfter = await state();
    assert.equal(energyAfter.aisPoints, energyBefore.aisPoints - energyBefore.demo.config.energyPacks[0].cost);
    assert.equal(energyAfter.energy, energyBefore.energy + energyBefore.demo.config.energyPacks[0].energy);
    await close();
    await page.getByRole('tab', { name: 'ไอเทม & สุ่ม', exact: true }).click();
    const shopTicketPack = (await state()).demo.config.campaignTicketPacks[0];
    const ticketStateBeforeShopPurchase = await state();
    await expect(page.getByRole('region', { name: 'บัตรเข้าอีเวนต์' })).toBeVisible();
    await page.getByRole('button', { name: `ซื้อ ${shopTicketPack.quantity} Campaign Tickets · ${shopTicketPack.cost} AIS Point`, exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText(shopTicketPack.label);
    assert.equal((await state()).aisPoints, ticketStateBeforeShopPurchase.aisPoints);
    assert.equal((await state()).demo.campaignTickets, ticketStateBeforeShopPurchase.demo.campaignTickets);
    await page.getByRole('button', { name: 'แลกตั๋วแข่งขัน', exact: true }).click({ clickCount: 2 });
    const ticketStateAfterShopPurchase = await state();
    assert.equal(ticketStateAfterShopPurchase.aisPoints, ticketStateBeforeShopPurchase.aisPoints - shopTicketPack.cost);
    assert.equal(ticketStateAfterShopPurchase.demo.campaignTickets, ticketStateBeforeShopPurchase.demo.campaignTickets + shopTicketPack.quantity);
    assert.equal(ticketStateAfterShopPurchase.demo.history[0].kind, 'purchase');
    await close();
    for (const kind of ['pet', 'avatar']) {
      const name = kind === 'pet' ? 'Pet Gacha Box' : 'Avatar Gacha Box';
      const before = await state();
      await page.getByRole('button', { name: new RegExp(`^${name} `) }).first().click();
      await expect(page.getByRole('dialog').getByRole('heading', { name, exact: true })).toBeVisible();
      assert.equal((await state()).aisPoints, before.aisPoints);
      await layout(`${kind}-box-detail`);
      await page.getByRole('button', { name: 'แลกและเปิดกล่อง', exact: true }).click({ clickCount: 2 });
      await expect(page.getByRole('dialog').getByRole('heading', { name: /ผล/ })).toBeVisible();
      assert.equal((await state()).aisPoints, before.aisPoints - before.demo.config.gachaCost);
      assert.equal((await state()).demo.gachaBoxes[kind], before.demo.gachaBoxes[kind]);
      await close();
    }
    const beforeCancelledDraw = await state();
    await page.locator('article').filter({ hasText: 'Pet Gacha Box' }).getByRole('button', { name: /เปิดกล่องที่มี/ }).click();
    await page.evaluate(() => { location.hash = '#history'; });
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'history');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    assert.deepEqual((await state()).demo.gachaBoxes, beforeCancelledDraw.demo.gachaBoxes);
    await route('shop', 'shop', 'ร้านค้าแลกรางวัล');
    await page.getByRole('tab', { name: 'ไอเทม & สุ่ม', exact: true }).click();
    const catalog = await page.evaluate(async (base) => {
      const { AVATARS, PETS, WINGS, PROFILE_FRAMES } = await import(new URL('src/lib/data/config.ts', base).href);
      return { avatar: AVATARS, pet: PETS, wing: WINGS, frame: PROFILE_FRAMES };
    }, base);
    for (const product of (await state()).demo.config.shop) {
      const meta = catalog[product.kind].find((item) => item.id === product.itemId);
      assert.ok(meta, `Missing product metadata ${product.id}`);
      const before = await state();
      await page.locator(`article[data-product-id="${product.id}"]`).getByRole('button').first().click();
      await expect(page.getByRole('dialog').getByRole('heading', { name: meta.name, exact: true })).toBeVisible();
      await expect(page.getByRole('dialog')).toContainText(`${product.cost.toLocaleString()} AIS Point`);
      assert.equal((await state()).aisPoints, before.aisPoints);
      await layout(`product/${product.id}`);
      await close();
    }
    for (const kind of ['avatar', 'pet', 'wing']) {
      const before = await state();
      const owned = kind === 'avatar' ? before.ownedAvatarIds : kind === 'pet' ? before.ownedPetIds : before.demo.wings;
      const product = before.demo.config.shop.find((item) => item.kind === kind && !owned.includes(item.itemId));
      assert.ok(product, `No locked ${kind} purchase fixture`);
      const meta = catalog[kind].find((item) => item.id === product.itemId);
      await page.locator(`article[data-product-id="${product.id}"]`).getByRole('button').first().click();
      await page.getByRole('dialog').getByRole('button', { name: kind === 'wing' ? 'แลกไอเทม' : 'แลกเข้าคอลเลกชัน', exact: true }).click({ clickCount: 2 });
      const after = await state();
      assert.equal(after.aisPoints, before.aisPoints - product.cost);
      const newOwned = kind === 'avatar' ? after.ownedAvatarIds : kind === 'pet' ? after.ownedPetIds : after.demo.wings;
      assert.equal(newOwned.filter((id) => id === product.itemId).length, 1);
      assert.equal(after.demo.history[0].kind, 'purchase');
      await close();
      await route('inventory', 'inventory', 'Inventory');
      await expect(page.locator('main').getByText(meta.name, { exact: false })).toBeVisible();
      await layout(`inventory/${kind}-purchase`);
      await page.reload();
      assert.equal((await state()).aisPoints, after.aisPoints);
      await route('shop', 'shop', 'ร้านค้าแลกรางวัล');
      await page.getByRole('tab', { name: 'ไอเทม & สุ่ม', exact: true }).click();
    }
    await page.getByRole('button', { name: 'กรอบรูปสะสม', exact: true }).click();
    const frameBefore = await state();
    await page.locator('article').filter({ hasText: 'Ocean Tide' }).locator('button').first().click();
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Ocean Tide', exact: true })).toBeVisible();
    assert.equal((await state()).aisPoints, frameBefore.aisPoints);
    await page.getByRole('button', { name: 'แลกกรอบรูป', exact: true }).click({ clickCount: 2 });
    const frameAfter = await state();
    assert.ok(frameAfter.demo.frames.includes('ocean'));
    assert.equal(frameAfter.demo.frames.filter((id) => id === 'ocean').length, 1);
    assert.equal(frameAfter.demo.history[0].kind, 'purchase');
    await close();
    await route('campaigns', 'campaigns', 'Campaigns');
    const ticketsBefore = await state();
    await page.getByRole('button', { name: /^ซื้อ .*Campaign Tickets/ }).first().click();
    assert.equal((await state()).aisPoints, ticketsBefore.aisPoints);
    await page.getByRole('button', { name: 'แลกตั๋วแข่งขัน', exact: true }).click({ clickCount: 2 });
    const ticketsAfter = await state();
    assert.equal(ticketsAfter.demo.campaignTickets, ticketsBefore.demo.campaignTickets + ticketsBefore.demo.config.campaignTicketPacks[0].quantity);
    assert.equal(ticketsAfter.aisPoints, ticketsBefore.aisPoints - ticketsBefore.demo.config.campaignTicketPacks[0].cost);
    assert.equal(ticketsAfter.demo.history[0].kind, 'purchase');
    await page.goto(url('game/mole?mode=campaign&campaign=starlight-sprint'));
    await expect(page).toHaveURL(url('campaign/starlight-sprint'));
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'campaign');
    await expect(page.getByRole('dialog')).toContainText('ใช้ 1 Ticket');
    assert.equal((await state()).demo.campaignTickets, ticketsAfter.demo.campaignTickets);
    await close();
    await route('campaign/starlight-sprint', 'campaign', 'Starlight Sprint');
    await page.getByRole('button', { name: /เข้าเล่น.*Ticket/ }).first().click();
    await expect(page.getByRole('dialog')).toContainText('ใช้ 1 Ticket');
    await expect(page.getByRole('dialog')).toContainText(`คงเหลือ ${ticketsAfter.demo.campaignTickets}`);
    assert.equal((await state()).demo.campaignTickets, ticketsAfter.demo.campaignTickets);
    await layout('campaign-entry');
    await page.getByRole('button', { name: 'เข้าร่วมการแข่งขัน', exact: true }).click({ clickCount: 2 });
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'game');
    const campaignEntered = await state();
    assert.equal(campaignEntered.demo.campaignTickets, ticketsAfter.demo.campaignTickets - 1, 'VIP must still pay a Ticket');
    assert.equal(campaignEntered.energy, ticketsAfter.energy);
    await page.reload();
    assert.equal((await state()).demo.campaignTickets, campaignEntered.demo.campaignTickets);
    await page.getByRole('button', { name: 'Simulate Finish', exact: true }).click();
    await expect(page).toHaveURL(/#campaign\/starlight-sprint$/);
    assert.ok(Object.keys((await state()).demo.campaignScores['starlight-sprint']).length > 0);
    const beforeSettlement = await state();
    await fixture({ demo: { config: {
      ...beforeSettlement.demo.config,
      campaigns: beforeSettlement.demo.config.campaigns.map((campaign) => campaign.id === 'starlight-sprint'
        ? { ...campaign, endAt: Date.now() - 1 } : campaign),
    } } });
    const settled = await state();
    assert.equal(settled.aisPoints, beforeSettlement.aisPoints);
    assert.equal(settled.demo.history.filter((entry) => entry.id === 'settlement:starlight-sprint').length, 1);
    await page.reload();
    const settledAgain = await state();
    assert.equal(settledAgain.energy, settled.energy);
    assert.deepEqual(settledAgain.demo.frames, settled.demo.frames);
    assert.equal(settledAgain.demo.history.filter((entry) => entry.id === 'settlement:starlight-sprint').length, 1);
    const unread = settledAgain.demo.notifications.filter((notification) => !notification.viewed);
    for (const notification of unread) {
      await expect(page.getByRole('dialog').getByRole('heading', { name: notification.title, exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect.poll(async () => (await state()).demo.notifications.find((item) => item.id === notification.id).viewed).toBe(true);
    }
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await route('home', 'home', 'เลือกเกมที่อยากเล่น');
    await page.getByRole('link', { name: 'SHOP', exact: true }).click();
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'shop');
    await expect(page.locator('.energy-pack')).toHaveCount(6);
    await page.getByRole('link', { name: 'HOME', exact: true }).click();
    await page.locator('.campaign-tile.festival').first().click();
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'campaign');
    await page.getByRole('link', { name: 'HOME', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'เลือกเกมที่อยากเล่น', exact: true })).toBeVisible();

    // Insufficient balances still allow viewing details, but never purchase.
    await fixture({ aisPoints: 0 });
    await route('vip', 'shop', 'ร้านค้าแลกรางวัล');
    await page.locator('.vip-product-card').first().click();
    await expect(page.getByRole('dialog').getByRole('button', { name: /^แลก VIP/ })).toBeDisabled();
    await close();
    await route('campaigns', 'campaigns', 'Campaigns');
    await page.getByRole('button', { name: /^ซื้อ .*Campaign Tickets/ }).first().click();
    await expect(page.getByRole('button', { name: 'แลกตั๋วแข่งขัน', exact: true })).toBeDisabled();
    await close();
    const beforeTicketEntry = await state();
    await fixture({ demo: {
      campaignTickets: 0,
      closedCampaigns: (beforeTicketEntry.demo.closedCampaigns ?? []).filter((id) => id !== 'starlight-sprint'),
      settledCampaigns: (beforeTicketEntry.demo.settledCampaigns ?? []).filter((id) => id !== 'starlight-sprint'),
      config: {
        ...beforeTicketEntry.demo.config,
        campaigns: beforeTicketEntry.demo.config.campaigns.map((campaign) => campaign.id === 'starlight-sprint'
          ? { ...campaign, startAt: Date.now() - 86400000, endAt: Date.now() + 86400000 } : campaign),
      },
    } });
    await route('campaign/starlight-sprint', 'campaign', 'Starlight Sprint');
    await page.getByRole('button', { name: /ต้องใช้ 1 Ticket/ }).first().click();
    await expect(page.getByRole('dialog')).toContainText('ใช้ 1 Ticket');
    await expect(page.getByRole('dialog')).toContainText('คงเหลือ 0');
    await expect(page.getByRole('button', { name: 'เข้าร่วมการแข่งขัน', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'ไปซื้อบัตรเข้าอีเวนต์', exact: true }).click();
    await expect(page.locator('.app-frame')).toHaveAttribute('data-page', 'shop');
    await expect(page.getByRole('region', { name: 'บัตรเข้าอีเวนต์' })).toBeVisible();
    assert.equal((await state()).demo.campaignTickets, 0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await route('shop', 'shop', 'ร้านค้าแลกรางวัล');
    await page.getByRole('tab', { name: 'ไอเทม & สุ่ม', exact: true }).click();
    await page.getByRole('tab', { name: 'ไอเทม & สุ่ม', exact: true }).click();
    await page.getByRole('button', { name: /^Pet Gacha Box / }).first().click();
    await expect(page.getByRole('button', { name: 'แลกและเปิดกล่อง', exact: true })).toBeDisabled();
    await close();
    assert.equal((await state()).aisPoints, 0);
    // Mount the real compiled component with the same optimized Svelte runtime as the app.
    // Destroy during animation: no delayed dismiss callback may survive teardown.
    const teardown = await page.evaluate(async (base) => {
      const { mount, unmount } = await import(new URL('node_modules/.vite/deps/svelte.js', base).href);
      const { default: Hud } = await import(new URL('src/lib/components/MissionProgressHud.svelte', base).href);
      const target = document.createElement('div');
      document.body.appendChild(target);
      let dismissed = 0;
      const app = mount(Hud, { target, props: {
        items: [{ id: 'teardown-qa', kind: 'mission', title: 'Teardown QA', before: 0, after: 1, target: 3, xp: 0 }],
        onDismiss: () => { dismissed++; },
      } });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const visible = target.querySelectorAll('.hud-card').length;
      await unmount(app);
      target.remove();
      await new Promise((resolve) => setTimeout(resolve, 3500));
      const reducedTarget = document.createElement('div');
      document.body.appendChild(reducedTarget);
      const reduced = mount(Hud, { target: reducedTarget, props: {
        items: [{ id: 'reduced-qa', kind: 'mission', title: 'Reduced QA', before: 0, after: 1, target: 1, xp: 0 }],
        motionReduced: true, onDismiss: () => { dismissed++; },
      } });
      await new Promise((resolve) => setTimeout(resolve, 100));
      const reducedWidth = reducedTarget.querySelector('.hud-bar-fill').style.width;
      const reducedAnimation = getComputedStyle(reducedTarget.querySelector('.hud-icon.complete')).animationName;
      await unmount(reduced);
      reducedTarget.remove();
      return { visible, dismissed, reducedWidth, reducedAnimation };
    }, base);
    assert.deepEqual(teardown, { visible: 1, dismissed: 0, reducedWidth: '100%', reducedAnimation: 'none' });
    if (output) {
      await mkdir(output, { recursive: true });
      await route('profile', 'profile', 'โปรไฟล์ของฉัน');
      await page.screenshot({ path: `${output}\\profile-${width}.png`, fullPage: true });
      await route('home', 'home', 'กิจกรรม & ความคืบหน้า');
      await page.screenshot({ path: `${output}\\home-${width}.png`, fullPage: true });
    }
    const fallbackContext = await browser.newContext({ viewport: { width, height: 800 } });
    try {
      await fallbackContext.addInitScript(() => {
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
          if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') return null;
          return getContext.call(this, kind, ...args);
        };
      });
      const fallbackPage = await fallbackContext.newPage();
      const expectedErrors = [];
      const runtimeErrors = [];
      fallbackPage.on('console', (message) => { if (message.text().includes('Error creating WebGL context')) expectedErrors.push(message.text()); });
      fallbackPage.on('pageerror', (error) => runtimeErrors.push(error.message));
      await fallbackPage.goto(url('profile'));
      await expect(fallbackPage.getByRole('heading', { name: 'โปรไฟล์ของฉัน', exact: true })).toBeVisible();
      await expect(fallbackPage.locator('.scenic-header.profile-expanded')).toBeVisible();
      await expect(fallbackPage.locator('.profile-tools')).toBeVisible();
      await expect(fallbackPage.locator('.room-stage')).toHaveCount(0);
      assert.deepEqual(expectedErrors, []);
      assert.deepEqual(runtimeErrors, []);
      if (output) await fallbackPage.screenshot({ path: `${output}\\profile-fallback-${width}.png`, fullPage: true });
    } finally {
      await fallbackContext.close();
    }
    for (const asset of new Set([...assets, ...images])) {
      if (!asset.startsWith(new URL(base).origin)) continue;
      const response = await page.request.get(asset);
      assert.ok(response.ok(), `Broken CSS background ${asset}`);
      assert.ok((response.headers()['content-type'] ?? '').startsWith('image/'), `Invalid CSS image ${asset}`);
    }
    assert.deepEqual(errors, []);
    results.push(`${width}px: routes, toolbar, ownership, purchases, HUD, campaign entry/CTA, reduced motion PASS`);
  } catch (error) {
    if (output) {
      await mkdir(output, { recursive: true });
      await page.screenshot({ path: `${output}\\failure-${width}.png`, fullPage: true });
    }
    console.error(`FAIL ${width}px ${page.url()}: ${error.message.split('Call log:')[0]}`);
    throw new Error(error.stack.split('\n').filter((line) => line.includes('verify-ux-redesign.mjs')).join('\n'), { cause: undefined });
  } finally {
    await context.close();
  }
}

try {
  for (const width of [320, 375, 430]) await run(width);
  assert.deepEqual(failures, []);
  console.log(JSON.stringify({ result: 'PASS', views, cssBackgrounds: assets.size, imageAssets: images.size, results }, null, 2));
} finally {
  await browser.close();
}
