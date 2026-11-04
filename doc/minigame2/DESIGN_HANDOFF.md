# MiniGame2 — Visual Refinement Round 2 Design Handoff

**Role:** Senior Game UI/UX Designer, Game Graphic Artist & Frontend Developer  
**Repository:** `Masque-center`  
**Status:** Visual Refinement Round 2 Complete — Ready for Final Copilot Review

---

## 1. หน้าจอที่ปรับดีไซน์ใหม่ (Screens Redesigned)

### 1.1 Home — Campaign Dashboard (`#home`) & Default Entry (`#hub`)
- **Default Entry (`#hub`):** เมื่อเปิดแอปโดยไม่มี Hash Route (`window.location.hash` ว่าง) ระบบจะเปิดแท็บ **Game (`#hub`)** เป็นหน้าเริ่มต้น เพื่อให้ผู้เล่นเข้าเล่นเกมได้ทันที และสามารถสลับมากดแท็บ **Home (`#home`)** เพื่อดู Campaign Dashboard ได้ทุกเมื่อ โดยยังคงรักษา Deep Links ที่ระบุ Route มาแล้ว (`#home`, `#shop`, `#rewards`, `#achievements`, `#missions`, `#profile`, `#ranking`, `#campaigns`, `#campaign/:id`, `#detail/:id`, `#game/:id`) ทุกประการ
- **สิ่งที่นำออกจากหน้า `#home`:**
  - นำ `FeaturedGameCard` (การ์ด HOT Game ขนาดใหญ่) ออก
  - นำข้อความแบนเนอร์ `Game Center / Masque Kingdom Demo` ที่ซ้ำซ้อนออก
  - นำกล่องบทสนทนาตัวละครกลางหน้า (`AvatarGreeting`) ที่ไม่เกี่ยวข้องกับกิจกรรมออก
- **สิ่งที่เพิ่มใน `#home` (Campaign Dashboard):**
  - **Featured Campaign Carousel (4 กิจกรรม):** แสดง Key Visual แตกต่างกันตามธีม (*Lantern Festival*, *Game Championship: Starlight Sprint*, *Loy Krathong Festival*, และ *New Year Sky Festival*) พร้อมป้ายสถานะ (`LIVE EVENT`, `LIVE TOURNAMENT`, `PARTNER EVENT`, `LIMITED EVENT`), Countdown เวลาคงเหลือ, Reward Preview พร้อมไอคอนรางวัล และปุ่ม CTA
  - **Compact Daily Check-in:** แถบเช็กอินรายวันแบบกระชับ ใช้ State `checkinDates` ร่วมกับหน้า Achievement
  - **Player Status Cards (2-Column Grid):**
    - การ์ด **VIP Status** แสดงสถานะ Active/Inactive, สิทธิ์เข้าเกมปกติฟรี (0 Energy), Energy Cap `30` และเวลาคงเหลือ (`vipRemainingLabel`)
    - การ์ด **Battle Pass Status** แสดงชื่อซีซัน, เลเวลปัจจุบัน (`LV.x`), แถบ XP Progress (`withinLevel/100 XP`) และสถานะ Free/Premium Track
  - **Achievement Updates:** แสดงเหรียญตราที่ปลดล็อกล่าสุด (สูงสุด 3 เหรียญ กดเพื่อไปปักหมุดใน Profile) หรือแสดงความคืบหน้าของ Milestone ถัดไป
  - **Collectible Cosmetics Event Banner:** แบนเนอร์โปรโมตกรอบโปรไฟล์สะสม 5 ระดับและการอวดโฉมบน Ranking พร้อมปุ่มลัดไปยัง `#profile`, `#ranking`, และ `#missions`

### 1.2 Achievement & Daily Check-in (`#achievements`)
- รักษาระบบ `achievementService.ts` ที่แยกออกจาก Battle Pass Missions อย่างสมบูรณ์ และไม่มีการแจก AIS Point จากกิจกรรมใด ๆ
- อัปเกรด `DailyCheckinCard.svelte` และ `AchievementPage.svelte`:
  - เพิ่ม **Day-7 Collectible Milestone Showcase** แสดงภาพกล่องสุ่ม `assets/gacha/pet-box.webp` คู่กับเหรียญตรา `assets/badges/checkin-streak-7.png` และแถบความคืบหน้า `streak/7 วัน`
  - เพิ่มตัวกรองสถานะ (`ทั้งหมด`, `ปลดล็อกแล้ว`, `กำลังสะสม`)
  - อัปเกรดการ์ด Achievement ให้แสดง Badge Artwork ครบทั้ง 11 รายการ พร้อม Progress Bar, Reward Preview Pill และ **Unlock Inspection Card** ที่มีเอฟเฟกต์แสงรัศมีหมุน (`animate-spin`) เมื่อคลิกดูรายละเอียดเหรียญตรา

### 1.3 Battle Pass — Mission Filter Redesign (`#missions`)
- ออกแบบตัวกรองภารกิจใหม่แทนปุ่ม 6 แท็บเดิม:
  - **Primary Filter (Segmented Control):** สลับช่วงเวลา `Daily (รายวัน)` / `Weekly (รายสัปดาห์)` / `Season (ตลอดซีซัน)` พร้อมตัวเลขสรุปจำนวนภารกิจที่สำเร็จ (`done/total`)
  - **Secondary Filter (Entitlement Tier Cards):** แถบการ์ด 3 ใบสำหรับ `Free` / `VIP` / `Premium` แสดงไอคอน 2.5D, ผลรวม XP (`+XP`), สถานะปลดล็อกหรือแม่กุญแจ (`Locked State`) ชัดเจน
  - **Entitlement Status Banner:** แบนเนอร์แจ้งสิทธิ์ของกลุ่มที่เลือก พร้อมปุ่มลัดไปเปิด VIP (`#vip`) หรือปลดล็อก Premium Pass (`#rewards`) เมื่อดูภารกิจที่ยังล็อกอยู่
  - การ์ดภารกิจแสดงไอคอนตามประเภท, ป้าย `+XP`, แถบ Progress Bar และสถานะ `COMPLETED` โดยไม่เปลี่ยน Logic การคำนวณ XP

### 1.4 Profile — 3D Room & Collectible Frames (`#profile`)
- รักษา `ProfileRoom3D.svelte` (ห้อง 3D Three.js พร้อม 2.5D Fallback), สถิติการเล่นเกม และระบบปักหมุดเหรียญตรา (Pinned Badges สูงสุด 3 ชิ้น) ไว้ครบถ้วน
- เพิ่มมุมมอง **AvatarFrame Identity Overlay** บนมุมซ้ายล่างของห้อง 3D
- ออกแบบ **Collectible Profile Frames 5 ระดับความหายาก** (`Common`, `Rare`, `Epic`, `Legendary`, `Seasonal`) พร้อม Preview กราฟิก, ป้าย Rarity, แหล่งที่มาของรางวัล (Battle Pass, Campaign, Achievement, Shop) และปุ่มเลือกสวมใส่ (`Equip`) หรือถอดกรอบรูป

### 1.5 Ranking — Showcase Profile Frames (`#ranking` & Campaign Leaderboard)
- ใช้คอมโพเนนต์ `AvatarFrame.svelte` ร่วมกันทั้งใน `#profile`, `#ranking` (`Leaderboard.svelte`) และตารางอันดับในหน้า `#campaign/:id` (`MiniGamePages.svelte`):
  - **Top 1:** สวมกรอบระดับ **Legendary** (`celestial` — Celestial Sovereign)
  - **Top 2:** สวมกรอบระดับ **Epic** (`sunrise` — Sunrise Royal Crest)
  - **Top 3:** สวมกรอบระดับ **Seasonal** (`krathong` — Loy Krathong Lotus)
  - **อันดับ 4 ขึ้นไป:** สวมกรอบระดับ **Rare / Common** (`ocean` / `meadow`)
  - **ผู้เล่นปัจจุบัน (`isCurrentPlayer`):** อ่านค่ากรอบรูปจริงจาก `player.demo.frameId` และอ่านอวตารจริงจาก `player.avatarId`
- จัดวางกรอบรูปให้พอดีกับ Podium และแถว Leaderboard โดยไม่บดบังชื่อผู้เล่นหรือคะแนน

### 1.6 AIS Point — Authentic Branding
- ออกแบบและแทนที่ `public/assets/currency/ais-point.png` ด้วยไอคอน **AIS Points** ที่อ้างอิงอัตลักษณ์ myAIS อย่างเป็นทางการ (เหรียญ 2.5D สีเขียว AIS `#73C212` พร้อมใบไม้บนตัวอักษร `P` สีขาว และแถบโค้งสีชมพูมาเจนต้า `#EC008C`)
- อัปเดต `CurrencyIcon.svelte` ให้เป็น Reusable Component รองรับทั้งโหมดไอคอนและโหมดป้าย `myAIS` (`showBrandBadge`) สำหรับใช้ใน `AppHeader.svelte`, `ShopPage.svelte`, `VipPassOffer.svelte`, `ModalHost.svelte`, และ `MiniGamePages.svelte`
- ปรับปุ่ม AIS Points บน Header ให้ใช้ไอคอนถุงช้อปปิ้ง (`ShoppingBag`) แทนเครื่องหมาย `+` และนำปุ่ม "เติม AIS Point" ออกจากหน้าต่างยืนยันการซื้อใน `ModalHost.svelte` เพื่อตอกย้ำว่า AIS Point เป็นคะแนนสะสมจาก myAIS สำหรับแลกสิทธิ์เท่านั้น

---

## 2. Assets ใหม่หรือที่แก้ไข (New & Updated Assets)

| หมวดหมู่ | ไฟล์ Asset | รายละเอียด |
| --- | --- | --- |
| **Currency Branding** | `public/assets/currency/ais-point.png`<br>`art-source/currency/ais-point.png` | ไอคอนเหรียญ AIS Points 2.5D สีเขียว myAIS + ใบไม้บนตัว `P` + แถบโค้งสีชมพูมาเจนต้า |
| **Campaign Key Visual** | `public/assets/campaigns/new-year-festival.webp` | ภาพ Key Visual 16:9 ธีมเทศกาลปีใหม่ลอยฟ้า (New Year Sky Festival) สไตล์ 2.5D Casual Fantasy |
| **Collectible Frames (5 Tiers)** | `public/assets/frames/frame-meadow.webp` (Common)<br>`public/assets/frames/frame-ocean.webp` (Rare)<br>`public/assets/frames/frame-sunrise.webp` (Epic)<br>`public/assets/frames/frame-celestial.webp` (Legendary)<br>`public/assets/frames/frame-krathong.webp` (Seasonal) | กรอบรูปโปรไฟล์สะสม 5 ระดับความหายาก พร้อมลวดลายอัญมณี มงกุฎ ปีก และดอกบัวกระทง |
| **Achievement Badges** | `public/assets/badges/games-played-50.png`<br>`public/assets/badges/games-played-100.png`<br>`public/assets/badges/checkin-streak-7.png`<br>`public/assets/badges/all-game-genres.png`<br>`public/assets/badges/high-score-10000.png`<br>`public/assets/badges/campaign-joins-3.png`<br>`public/assets/badges/campaign-completed-1.png` | เหรียญตรา Achievement สไตล์ 2.5D Medallion ครบทั้ง 11 รายการใน `ACHIEVEMENT_DEFINITIONS` |

---

## 3. ไฟล์ที่แก้ไขและเพิ่มใหม่ (Modified & Added Files)

- `src/lib/components/AvatarFrame.svelte` *(ใหม่)* — Reusable Avatar + Collectible Frame component สำหรับ Profile, Ranking, Header, Shop และ Modal
- `src/lib/components/CurrencyIcon.svelte` — อัปเดตไอคอน AIS Point และเพิ่ม `showBrandBadge`
- `src/lib/components/AppHeader.svelte` — แสดงกรอบรูปที่สวมใส่บน Avatar มุมซ้ายบน และเปลี่ยนปุ่ม AIS Points ให้เป็นปุ่มเปิด Shop
- `src/lib/components/RewardIcon.svelte` — รองรับการแสดงภาพกรอบรูป (`type === 'frame'`) และเหรียญตรา (`type === 'badge'`)
- `src/lib/components/DailyCheckinCard.svelte` — เพิ่มป้ายกำกับ Day-7 Bonus (`7D BONUS`) และปรับขนาดให้กระชับบน Dashboard
- `src/lib/components/Leaderboard.svelte` — แสดง `AvatarFrame` บน Podium Top 1–3 และรายการอันดับทั้งหมด โดยอ่านกรอบรูปจริงของผู้เล่นจาก `player.demo.frameId`
- `src/lib/components/VipPassOffer.svelte` — เพิ่มข้อความอธิบายการใช้คะแนนสะสมจาก myAIS
- `src/lib/components/ModalHost.svelte` — แสดง `AvatarFrame` ในหน้าต่างยืนยันการซื้อ, แสดงแหล่งที่มาของคะแนน myAIS และนำปุ่มเติม AIS Point ออก
- `src/App.svelte` — เปลี่ยน Default Entry เมื่อไม่มี Hash เป็น `#hub` และออกแบบหน้า `#home` ใหม่เป็น Campaign Dashboard
- `src/lib/pages/AchievementPage.svelte` — เพิ่ม Day-7 Collectible Showcase, ตัวกรองสถานะ และ Unlock Inspection Animation
- `src/lib/pages/MiniGamePages.svelte` — ออกแบบ `#missions` ใหม่ด้วย Segmented Control + Entitlement Tier Cards, อัปเกรด `#campaigns` / `#campaign/:id` ด้วย Key Visual และ `AvatarFrame` บน Leaderboard
- `src/lib/pages/ProfileShowcase.svelte` — เพิ่ม Collectible Frame Gallery 5 ระดับความหายาก พร้อมป้ายแหล่งที่มาและปุ่ม Equip โดยรักษา `ProfileRoom3D.svelte`
- `src/lib/pages/ShopPage.svelte` — แสดงกรอบโปรไฟล์ 5 ระดับในแท็บ Cosmetics และเพิ่มแบนเนอร์อธิบายการใช้คะแนนจากแอป myAIS
- `src/lib/pages/AdminPage.svelte` — รองรับการตั้งค่าราคากรอบรูปทั้งหมดใน Demo Studio
- `src/lib/data/config.ts` — เพิ่ม `PROFILE_FRAMES`, อัปเดต `BADGE_ARTWORK` ครบ 11 รายการ และเพิ่ม `new-year-festival` ใน `CAMPAIGN_ARTWORK`
- `src/lib/services/demoService.ts` & `src/lib/services/playerService.ts` — รองรับ Frame ID ทั้ง 5 ระดับ (`meadow`, `ocean`, `sunrise`, `celestial`, `krathong`) ใน `shop`, `validateConfig` และ `grantReward`
- `src/app.css` — เพิ่มสไตล์ `[data-frame=...]`, `.btn-gold-3d` และ Keyframes สำหรับเอฟเฟกต์การ์ด
- `scripts/generate-round2-assets.mjs` *(ใหม่)* — สคริปต์สร้างและแปลงไฟล์กราฟิก 2.5D สำหรับ Round 2

---

## 4. ผลการตรวจสอบ (Verification Results)

- **`npm run check` (`svelte-check --tsconfig ./tsconfig.json`):** ผ่าน `0 errors and 0 warnings`
- **`npm test` (`vitest run`):** ผ่านครบทั้ง `2 test files, 71 tests passed`
- **`npm run build` (`svelte-check && vite build`):** ผ่านสมบูรณ์ สร้าง Production bundle ใน `dist/` เรียบร้อย
- **การตรวจสอบขนาดหน้าจอมือถือ (`320px`, `375px`, `430px`):**
  - ตรวจสอบหน้า `#hub` (Default Entry), `#home` (Campaign Dashboard), `#achievements`, `#rewards`, `#missions`, `#profile`, `#ranking`, `#campaigns`, `#campaign/lantern-festival`, `#shop`, และ `#vip`
  - ไม่มีอาการล้นแนวนอน (`horizontal overflow = 0`) และปุ่มกด/ตัวกรองทั้งหมดใช้งานได้สะดวกบนหน้าจอมือถือ

---

## 5. สิ่งที่ส่งต่อให้ Copilot ตรวจสอบหรือปรับ Config ต่อ (Items for Copilot Review)

1. **Default Route (`#hub` vs `#home`):**
   - ปัจจุบันเมื่อเปิดแอปโดยไม่มี Hash (`window.location.hash` ว่าง) `src/App.svelte` จะตั้งค่า `page = 'hub'` ตามข้อกำหนด Round 2 ("เมื่อเปิดแอปโดยไม่มี Hash Route ให้แสดงแท็บ Game เป็นหน้าเริ่มต้น และผู้เล่นสามารถกดแท็บ Home เพื่อดู Dashboard ทีหลัง")
   - หากมี E2E test เดิมที่คาดหวังว่าเปิด URL เปล่าแล้วต้องเจอ `#home` ทันที ให้ปรับ E2E test ให้ตรวจ `#hub` เป็นหน้าแรก หรือระบุ `#home` ใน URL
2. **Day-7 Check-in Streak Reward Config (`checkin-streak-7` ใน `achievementService.ts`):**
   - เพื่อรักษา Unit Test เดิม (`src/lib/services/demoService.test.ts` บรรทัดที่ 363 ที่ตรวจว่าเช็กอินครบ 7 วันบวก Energy `+5`) เราจึงไม่แก้ `ACHIEVEMENT_DEFINITIONS` ใน `src/lib/services/achievementService.ts` โดยตรง แต่แสดง **Day-7 Collectible Showcase (Pet Gacha Box + 7-Day Streak Badge)** ใน UI ของ `AchievementPage.svelte`
   - หาก Copilot ต้องการเปลี่ยนรางวัลใน `ACHIEVEMENT_DEFINITIONS` ของ `checkin-streak-7` จาก `{ title: 'Energy +5', type: 'energy', amount: 5 }` เป็น `{ title: 'Pet Gacha Box', type: 'gacha-box', amount: 1, boxKind: 'pet' }` สามารถปรับแก้ใน `achievementService.ts` พร้อมอัปเดต Assertion ใน `demoService.test.ts` ได้ทันที
3. **New Year Sky Festival Campaign (`new-year-festival`):**
   - เพิ่มภาพ `public/assets/campaigns/new-year-festival.webp` และแสดงเป็นการ์ดที่ 4 ใน Featured Campaign Carousel บนหน้า `#home` โดยผูก CTA ไปยังหน้า `#missions` เพื่อไม่ให้กระทบจำนวน `CAMPAIGNS` ใน `src/lib/data/campaigns.ts` ที่ผูกกับ Demo Studio / Unit Tests
   - หากต้องการให้ `new-year-festival` เป็น Campaign เต็มรูปแบบใน `CAMPAIGNS` สามารถเพิ่มเข้า `src/lib/data/campaigns.ts` โดยใช้ `CAMPAIGN_ARTWORK['new-year-festival']` ที่เตรียมไว้แล้วได้ทันที

---

## 6. ข้อจำกัดที่ยังเหลือ (Remaining Limitations)

- การเชื่อมต่อคะแนน AIS Point จริงผ่าน myAIS SDK / WebView Bridge และระบบตัดแต้มฝั่ง Backend ยังคงเป็น Local Mock ตามขอบเขตของ Frontend Demo
- แคมเปญประเภท External (`loy-krathong`) ยังคงแสดงสถานะกิจกรรมพาร์ตเนอร์ตาม Safety Policy จนกว่าจะมี URL จริงจากระบบ Production
