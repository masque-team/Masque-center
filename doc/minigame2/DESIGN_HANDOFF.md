# MiniGame2 — Complete UX/UI Redesign & Interaction Refinement Handoff

**Role:** Senior Game UX/UI Designer, Game UI Engineer & Frontend Developer  
**Repository:** `Masque-center`  
**Status:** Complete UX/UI Redesign & Interaction Refinement — Ready for Final Copilot Regression

---

## 1. Summary of UX/UI Problems Found (สรุปปัญหา UX/UI ที่ตรวจพบจากมุมมองผู้เล่นจริง)

จากการตรวจสอบทุกหน้าจอบนมือถือ (`320px`, `375px`, `430px`) ในมุมมองผู้เล่นที่เข้าใช้งานครั้งแรก พบประเด็นสำคัญดังนี้:
- **ข้อความอธิบายล้นและมีภาษาฝั่งนักพัฒนาปะปน (Excessive & Developer-Facing Copy):** มีข้อความอย่าง `"ไม่แจก AIS Point"`, `"AIS Point สะสมจาก myAIS"`, `"3D ROOM · ลากเพื่อหมุนมุมกล้อง"`, `"DEMO MODE"`, `"ราคาเดโม"`, `"MOCK STORE"` และการคำนวณตัวเลขก่อน/หลังที่ซ้ำซ้อน (`คงเหลือ 7 → 6 ใบ`, `หลังเติม 13/15`) กระจายอยู่ในหน้าปกติของผู้เล่น
- **ความสูงและสมดุลสายตาของ Global Header ไม่เท่ากัน (Inconsistent Header Optical Alignment):** ปุ่มแจ้งเตือนและป้ายคะแนน AIS Point ดูเล็กกว่าแถบโปรไฟล์และแถบ Energy รวมถึงมีป้ายคำอธิบาย `myAIS` และไอคอนถุงช้อปปิ้งซ้อนอยู่ทำให้รกบนจอ `320px`
- **การจัดกลุ่มแคมเปญบนหน้า Home ยังมีตัวควบคุมซ้ำซ้อน:** มีแถบปุ่มภาพย่อ 4 ช่องซ้อนกับจุดบอกสไลด์ (`carousel-dot`) และยังไม่ได้แยกหมวดหมู่ระหว่าง **เทศกาลตามฤดูกาล (Festival / Seasonal Event)** กับ **ทัวร์นาเมนต์แข่งขัน (Competitive Campaign)** ให้สแกนง่าย
- **การแต่งตัวละครและโปรไฟล์ในห้อง 3D ค้นหายาก:** ผู้เล่นต้องเลื่อนลงไปหาในส่วนล่างของหน้าจอและมีข้อความป้าย `"3D ROOM · ลากเพื่อหมุนมุมกล้อง"` บังมุมขวาบนของฉาก
- **การขายแพ็กเกจสมาชิก VIP ปะปนอยู่ในหน้า Battle Pass และใช้ไอคอนเดียวกับ AIS Point:** ทำให้ผู้เล่นสับสนระหว่างสิทธิ์สมาชิกตามเวลา (VIP), สิทธิ์ปลดล็อกสายรางวัลซีซัน (Premium Pass) และสกุลเงินแลกซื้อ (AIS Point)
- **ความคืบหน้าภารกิจ (Mission Progress) แสดงผลเป็นหน้าต่าง Modal ขนาดใหญ่ขวางหน้าจอ:** เมื่อเช็กอินรายวันหรือเล่นเกมจบ จะเด้ง Dialog ทับทั้งหน้าจอแทนที่จะเป็น HUD แจ้งเตือนแบบเกมมือถือที่ลื่นไหล
- **หน้าต่างยืนยันการใช้ตั๋วแข่งขัน (Campaign Ticket) มีข้อความยาวเกินจำเป็น:** แสดงสมการลบเลขและคำเตือนราคาเดโมแทนที่จะแสดงสั้นกระชับพร้อมปุ่มเข้าร่วมทันที

---

## 2. Content and Text Removed or Simplified (ข้อความที่ตัดออกและปรับให้กระชับเป็นธรรมชาติ)

ปรับปรุงข้อความภาษาไทยสำหรับผู้เล่นให้สั้น ชัดเจน และตัดข้อความส่วนเกินออกทั้งหมด:
- ตัด `"ไม่แจก AIS Point"` และ `"โดยไม่แจก AIS Point"` ออกจาก `DailyCheckinCard.svelte` และ `AchievementPage.svelte`
- ตัด `"AIS Point สะสมจาก myAIS"`, `"REDEEM WITH myAIS POINTS · DEMO"`, `"ยอด myAIS ปัจจุบัน"` ออกจาก `AppHeader.svelte`, `ShopPage.svelte`, `VipPassOffer.svelte`, `ModalHost.svelte`, `MiniGamePages.svelte`, และ `CurrencyIcon.svelte`
- ตัดป้าย `"3D ROOM · ลากเพื่อหมุนมุมกล้อง"` และ `"2.5D SHOWCASE"` ออกจากมุมขวาบนของ `ProfileRoom3D.svelte`
- ตัดข้อความฝั่งเทคนิค/เดโม เช่น `"DEMO MODE · จำลองการใช้ AIS Points..."` (`EntryPage.svelte`), `"ราคาเดโม"` (`config.ts`, `ShopPage.svelte`), `"DEMO OFFER"` / `"DURATION · DEMO"` (`VipPassOffer.svelte`), `"DEMO PREVIEW"` / `"CALENDAR MONTH SEASON"` (`SeasonPage.svelte`), `"Preview เฉพาะในแพลตฟอร์ม"` (`GameDetailPage.svelte`), `"legacy demo"` (`GameScreen.svelte`), และ `"mock players"` / `"ข้อมูลตัวอย่าง"` (`RankingPage.svelte`, `Leaderboard.svelte`)
- ตัดการแสดงผลคำนวณยอดก่อน/หลังที่ซ้ำซ้อน เช่น `7 → 6 ใบ` หรือ `หลังเติม 13/15` ออกจากป้ายสินค้าและหน้าต่างยืนยัน

---

## 3. Global Header Redesign (การออกแบบแถบส่วนหัวใหม่ให้เป็นระบบเดียวกัน)

อัปเกรด `src/lib/components/AppHeader.svelte` และ `src/lib/components/EnergyBadge.svelte`:
- **Unified Control Height & Radius:** กำหนดความสูงมาตรฐานเดียวกันที่ `44px` (`40px` บนหน้าจอแคบ `<= 360px`) มุมโค้งและขอบขาว 2px พร้อมเงา 2.5D ที่สอดคล้องกันทั้ง 4 ส่วน:
  1. **Player Pill:** แสดง `AvatarFrame` + ชื่อผู้เล่น (รองรับ `text-overflow: ellipsis` อย่างปลอดภัย) + ป้าย `LV.` หรือป้ายทอง `VIP`
  2. **Energy Pill (`EnergyBadge.svelte`):** รวมวงแหวนนับเวลาฟื้นฟู (`conic-gradient`), ขวดพลังงาน, ตัวเลข `energy/max` และเวลานับถอยหลัง `+1` ไว้ในแถบเดียวที่อ่านง่าย
  3. **Notification Button:** ปุ่มไอคอนกระดิ่งขนาด `42×44px` (`36×40px` บนจอ `320px`) พร้อมจุดแจ้งเตือนสีแดงเมื่อมีรายการใหม่
  4. **AIS Point Pill:** แสดงเฉพาะ **ไอคอนเหรียญ AIS Point แท้ + ยอดคงเหลือ** (เช่น โลโก้ + `800`) โดยไม่มีคำว่า `myAIS` หรือไอคอนถุงช้อปปิ้งซ้อนทับ

---

## 4. Home Campaign & Activity Dashboard Reorganization (การจัดระเบียบหน้า Home ใหม่)

อัปเดต `src/App.svelte` (`#home`) และ `src/lib/services/homeService.ts`:
- **Default Entry คงอยู่ที่แท็บ Game (`#hub`)** และรวมสถิติคะแนนสูงสุดกับจำนวนรอบเล่นไว้ในการ์ดเกมของ `GameCard.svelte` โดยตรง (นำกล่องขาวแยกชิ้นใต้การ์ดออก)
- **Coherent Campaign Showcase บนหน้า `#home`:**
  - แสดง **Featured Campaign Card** 1 รายการเด่น พร้อมป้ายหมวดหมู่ ป้ายสถานะ เวลานับถอยหลัง รางวัลเด่น และตัวควบคุมจุดบอกสไลด์เพียงชุดเดียว (นำแถบปุ่มภาพย่อ 4 ช่องที่ซ้ำซ้อนออก) รองรับการเลื่อนอัตโนมัติที่หยุดเมื่อผู้เล่นแตะ/โฟกัส และเคารพ `prefers-reduced-motion`
  - จัดกลุ่มการ์ดแคมเปญด้านล่างแยกเป็น 2 หมวดหมู่ชัดเจน:
    1. **เทศกาลตามฤดูกาล (Festival / Seasonal Event):** *Lantern Festival* และ *Loy Krathong Festival*
    2. **ทัวร์นาเมนต์แข่งขัน (Competitive Campaign):** *Game Championship: Starlight Sprint* และ *New Year Sky Festival (Season Challenge)*
- **แยกส่วนสถานะผู้เล่นออกจากกันอย่างเป็นระเบียบ:**
  - **Daily Check-in** (`DailyCheckinCard.svelte`)
  - **VIP Status** (แสดงตรามงกุฎ `vipCrest` และเชื่อมต่อไปยัง `#vip` ในหน้า Shop) และ **Battle Pass Level/XP**
  - **Achievement Updates** และ **Collectible Frame Showcase**

---

## 5. Profile 3D Room Floating Customization Controls (แถบเครื่องมือลอยสำหรับแต่งตัวในห้อง 3D)

อัปเดต `src/lib/components/ProfileRoom3D.svelte` และ `src/lib/pages/ProfileShowcase.svelte`:
- **รักษาฉาก Three.js 3D Room เดิมไว้ครบถ้วน** พร้อมนำข้อความอธิบาย `"3D ROOM · ลากเพื่อหมุนมุมกล้อง"` ออก
- **เพิ่ม Floating Customization Toolbar แนวตั้งด้านซ้ายของห้อง 3D (`.room-toolbar`):**
  1. **ตัวละคร (`Avatar`)** — เปิดแผ่นเลือกตัวละครทั้งหมด แสดงตัวละครที่มีและตัวที่ล็อก พร้อมพรีวิวและสวมใส่ทันที
  2. **คู่หู (`Pet`)** — เปิดแผ่นเลือกสัตว์เลี้ยงคู่หูทั้งหมด พร้อมปุ่มถอดคู่หูและพรีวิว
  3. **กรอบรูป (`Frame`)** — เปิดแผ่นเลือกกรอบรูปสะสม 5 ระดับความหายาก (`Common`, `Rare`, `Epic`, `Legendary`, `Seasonal`) พร้อมบันทึกอัตโนมัติเมื่อเลือกกรอบที่เป็นเจ้าของ
  4. **ตรา/ฉาก (`Badge & Decorations`)** — เปิดแผ่นปักเหรียญตราเกียรติยศ (สูงสุด 3 ชิ้น), สวมใส่ปีก (`Wings`), เปลี่ยนฉากห้อง 3D (`Room Theme`) และแก้ไขข้อความแนะนำตัว (`Bio`)
- ผู้เล่นสามารถปรับแต่งโปรไฟล์ได้โดยตรงจากในห้อง 3D โดยไม่ต้องเลื่อนลงไปค้นหาในคลังด้านล่าง พร้อมคงส่วนสถิติการเล่น คลังไอเทม และเหรียญตราไว้ครบถ้วน

---

## 6. Shop & VIP Purchase Experience (การย้าย VIP สู่ร้านค้าและการแสดงรายละเอียดสินค้า)

อัปเดต `src/lib/pages/ShopPage.svelte`, `src/lib/components/VipPassOffer.svelte`, `src/lib/components/ModalHost.svelte`, และ `src/lib/components/CurrencyIcon.svelte`:
- **VIP เป็นสินค้าใน Shop เท่านั้น:**
  - Deep link `#vip` นำทางเข้าสู่หน้า `#shop` แท็บ **สมาชิก VIP** โดยตรง
  - ออกแบบการ์ดสินค้า VIP ทั้ง 3 แพ็กเกจ (**VIP 6 ชั่วโมง**, **VIP 1 วัน**, **VIP 3 วัน**) ให้เป็น Product Card ที่ชัดเจน มีภาพตราสัญลักษณ์ ระยะเวลา สิทธิประโยชน์ และราคา AIS Point
  - เมื่อแตะที่การ์ดสินค้า จะเปิดหน้าต่าง **VIP Product Detail (`VipPassOffer.svelte`)** แสดงภาพอาร์ตเวิร์กขนาดใหญ่ รายละเอียดสิทธิประโยชน์ วันหมดอายุ/การบวกเวลาต่อท้าย ราคา และปุ่มยืนยันการแลก (ไม่ตัดแต้มทันทีจากการแตะการ์ด)
- **แยกระบบไอคอนชัดเจน (`vipCrest` vs `aisPoints`):**
  - เพิ่มไอคอน `vipCrest` (มงกุฎทองประดับอัญมณี) ใน `CurrencyIcon.svelte` สำหรับใช้แทนสถานะและหมวดหมู่ VIP ทุกจุด
  - เหรียญ `aisPoints` ใช้แสดงเป็นสกุลเงินสำหรับแลกซื้อเท่านั้น
- **Product Detail Sheets สำหรับสินค้าทุกหมวดใน Shop (`ModalHost.svelte`):**
  - การแตะสินค้าใด ๆ ใน Shop (กรอบรูปสะสม, ตัวละคร, สัตว์เลี้ยง, ปีก, กล่องสุ่ม Gacha Box, แพ็กเกจเติม Energy) จะเปิดหน้าต่างรายละเอียดสินค้าที่แสดงภาพขนาดใหญ่ คำอธิบาย ระดับความหายาก สถานะการเป็นเจ้าของ ราคา และปุ่มแลกซื้อหลักเพียงปุ่มเดียว

---

## 7. Battle Pass Separation from VIP Sales (หน้า Battle Pass เฉพาะเรื่องซีซันและภารกิจ)

อัปเดต `src/lib/pages/SeasonPage.svelte`:
- **นำปุ่มขายแพ็กเกจสมาชิก VIP (`VIP 6 ชั่วโมง`, `VIP 1 วัน`, `VIP 3 วัน`) ออกจากหน้า Battle Pass ทั้งหมด**
- คงไว้เฉพาะองค์ประกอบของ Battle Pass:
  - แบนเนอร์ซีซันและรางวัลสูงสุดประจำซีซัน
  - เลเวลปัจจุบันและแถบความคืบหน้า XP
  - การ์ดปลดล็อก **Premium Pass** (ซึ่งเปิดหน้าต่างรายละเอียด `premium-pass-confirm` ก่อนยืนยัน)
  - รางรางวัล **Free Track** และ **Premium Track** 30 เลเวล (`PassRewardTrack.svelte`)
  - แท็บ **ภารกิจสะสม XP** ที่กรองได้ทั้ง `รายวัน / รายสัปดาห์ / ตลอดซีซัน` และ `ทั่วไป (Free) / โบนัส VIP / Premium Pass` (หากภารกิจโบนัส VIP ล็อกอยู่ จะมีปุ่มลัดพาไปดูแพ็กเกจ VIP ที่หน้า Shop)

---

## 8. Animated Mission Progress HUD Design (ระบบแจ้งเตือนความคืบหน้าภารกิจแบบเคลื่อนไหว)

สร้างคอมโพเนนต์ใหม่ `src/lib/components/MissionProgressHud.svelte` และเชื่อมต่อใน `src/App.svelte`:
- แทนที่หน้าต่าง Modal ขนาดใหญ่หลังกดเช็กอินรายวันหรือจบเกม (`Simulate Finish`) ด้วย **Animated HUD Notifications** ขนาดกะทัดรัดที่มุมซ้ายบนของหน้าจอ:
  1. เลื่อนเข้าจากด้านซ้ายทีละรายการตามลำดับ (`520ms` stagger)
  2. แสดงไอคอนภารกิจ ชื่อภารกิจ และตัวเลขความคืบหน้า (`before/target → after/target`)
  3. แถบ Progress Bar วิ่งเพิ่มขึ้นอย่างนุ่มนวลจากค่าเดิมไปยังค่าใหม่ (`cubic-bezier(0.22, 1, 0.36, 1)`)
  4. เมื่อภารกิจครบเป้าหมาย จะแสดงเอฟเฟกต์สำเร็จพร้อมป้าย `+XP` หรือรางวัลที่ได้รับ
  5. ซ้อนกันได้สูงสุด 3 รายการและปิดตัวเองอัตโนมัติเมื่อผู้เล่นอ่านจบ (หรือแตะเพื่อปิดทันที) พร้อมรองรับ `prefers-reduced-motion`

---

## 9. Campaign Ticket UX Simplification (การลดความซับซ้อนของหน้าต่างใช้ตั๋วแข่งขัน)

อัปเดต `src/lib/components/ModalHost.svelte` (`campaign-entry-confirm`) และ `src/App.svelte`:
- แทนที่ข้อความยืนยันแบบยาว (`ใช้ Campaign Ticket 1 ใบ · คงเหลือ 7 → 6 ใบ · ไม่ใช้ Energy · ราคา Ticket เป็น Demo`) ด้วยหน้าต่างยืนยันที่กระชับ ชัดเจน:
  - ชื่อเกมและชื่อแคมเปญ
  - ไอคอนตั๋วแข่งขัน พร้อมข้อความ **`ใช้ 1 Ticket`**
  - ยอดตั๋วปัจจุบัน **`คงเหลือ X`**
  - ปุ่มหลัก **`เข้าร่วมการแข่งขัน`**

---

## 10. Responsive & Automated Verification Results (ผลการตรวจสอบบนขนาดหน้าจอมือถือและชุดทดสอบ)

- **`npm run check` (`svelte-check --tsconfig ./tsconfig.json`):** `0 errors and 0 warnings`
- **`npm test` (`vitest run --exclude apps/**`):** ผ่านครบ `2 test files, 85 tests passed (85)`
- **`npm run build` (`svelte-check && vite build`):** สร้าง Production bundle สำเร็จ (`dist/`) โดยแยก `three.module` เป็น Lazy-loaded chunk สำหรับหน้า Profile
- **Browser Responsive Inspection (`320px`, `375px`, `430px`):**
  - ตรวจสอบครบทุก Route (`#hub`, `#home`, `#shop`, `#vip`, `#rewards`, `#missions`, `#achievements`, `#profile`, `#ranking`, `#campaigns`, `#campaign/starlight-sprint`, `#detail/mole`, `#history`, `#inventory`)
  - **Horizontal Overflow:** `0` ในทุกความกว้างหน้าจอ (`320px`, `375px`, `430px`)
  - **Broken Images:** `0`
  - **Removed Clutter Text Check:** ไม่พบข้อความต้องห้าม (`"ไม่แจก AIS Point"`, `"AIS Point สะสมจาก myAIS"`, `"3D ROOM · ลากเพื่อหมุนมุมกล้อง"`, `"DEMO MODE"`, `"ราคาเดโม"`, `"DEMO OFFER"`) บนหน้าจอผู้เล่นอีกต่อไป
