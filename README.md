# MasqueGame

เกมมือถือสำหรับ myAIS WebView รวม 7 เกม เล่นฟรีด้วย Energy หรือปลดล็อก VIP Benefits, Battle Pass rewards, Masque Points และ Avatar & Pets

<p align="center">
	<img src="public/images/bird.png" alt="ภาพปกเกมสัตว์บินถลาลม" width="420" />
</p>

<p align="center"><strong>Svelte 5 · TypeScript · Vite · Tailwind CSS 4</strong><br />Mobile-first · Static SPA · No backend</p>

## Two Frontends, One Repository

ใช้ Git/repo และ root `package-lock.json` เดียวกันผ่าน npm workspaces แต่ build/deploy แยกกัน:

| ส่วน | ตำแหน่ง | หน้าที่ |
| --- | --- | --- |
| MGC | root `src/` | เกม, เงิน, บัตร, Inventory, Profile, กาชา และ save |
| MV | `apps/masque-vease/` | มุมใกล้ Avatar/Pet, ห้องแต่งตัว และเมือง Three.js |
| Protocol | `packages/vease-protocol/` | ชนิดข้อความและตัวตรวจ payload ของทั้งสอง FE |

MGC เปิด MV ผ่าน iframe ไม่ import renderer ของ MV; MV ไม่อ่าน/เขียน save ของ MGC และไม่รับยอดเงิน/บัตร ใช้ `READY -> INIT -> ACK` ก่อนเริ่ม ส่ง state/โหมดด้วย `postMessage` และตรวจ origin, source window, version และ payload การเปลี่ยนชุดผ่าน ownership validation ของ MGC แบบทั้งชุด

## เกมในแคตตาล็อก

| **ARCADE** | **REACTION** | **RUNNER** |
|:---:|:---:|:---:|
| <img src="public/images/bird.png" alt="สัตว์บินถลาลม" width="180" /><br /><strong>สัตว์บินถลาลม</strong><br />[เล่นเกม](https://masque-lab.adldigitalservice.com/myroom/bird/) | <img src="public/images/mole.png" alt="ตีไอต้าวตุ่นเด้ง" width="180" /><br /><strong>ตีไอต้าวตุ่นเด้ง</strong><br />[เล่นเกม](https://masque-lab.adldigitalservice.com/myroom/mole-v3/) | <img src="public/images/run.png" alt="สัตว์วิ่งตะลุยเมือง" width="180" /><br /><strong>สัตว์วิ่งตะลุยเมือง</strong><br />[เล่นเกม](https://masque-lab.adldigitalservice.com/myroom/game/run/) |
| **ACTION** | **ARCADE · DEER EDITION** | **SHOOTER** |
| <img src="public/images/ninja.png" alt="ฟันผลไม้เปรี้ยง" width="180" /><br /><strong>ฟันผลไม้เปรี้ยง</strong><br />[เล่นเกม](https://masque-lab.adldigitalservice.com/myroom/fruitninja/) | <img src="public/images/timber.png" alt="สัตว์ชนพุ่งปังปัง" width="180" /><br /><strong>สัตว์ชนพุ่งปังปัง</strong><br />[เล่นเกม](https://masque-lab.adldigitalservice.com/myroom/game/timberdear/) | <img src="public/images/duck.png" alt="ล่าฝุงเป็ดป่วน" width="180" /><br /><strong>ล่าฝุงเป็ดป่วน</strong><br />[เล่นเกม](https://masque-lab.adldigitalservice.com/myroom/shooting-duck/) |
| **MEMORY** |  |  |
| **สัตว์จับคู่สู้สุดใจ**<br />จับคู่ภาพสัตว์ให้ครบทุกคู่<br />[เล่นเกม](https://masque-lab.adldigitalservice.com/mygame/memonrycard/) |  |  |

> ภาพปกอ้างอิงจาก `public/images/` และเกม Timber เป็นเกมสไตล์ Timberman ที่เปลี่ยนตัวละครเป็นกวาง
>
> เกมสัตว์จับคู่สู้สุดใจใช้โลโก้ที่ได้รับใน `public/images/mem.png` แสดงเต็มภาพโดยไม่ครอป; เก็บต้นฉบับนอก `dist/` เพื่อไม่ให้หายเมื่อ build

## ฟีเจอร์

- **Energy** เป็นยอดตัวเลขสะสมสำหรับทุกคน ฟื้น 1 หน่วยทุก 30 นาทีถึงเพดานปัจจุบัน: ฟรี 12 / VIP 18 (โบนัส MAX +6 ปรับได้ใน Studio) ซื้อหรือรับรางวัลเกินเพดานได้ ไม่ฟื้นเพิ่มขณะเต็ม และไม่ตัดยอดเมื่อ VIP หมดอายุ
- **VIP Pass** การ์ดแสดงซื้อ VIP หรือซื้อเวลาเพิ่มตามสถานะ ไม่เปลี่ยนเป็นปุ่มเติมแต้มเมื่อยอดไม่พอ กดแล้วเลือกแพ็ก/ดูราคา/สิทธิ์ใน popup เดิม: ปกติ 30 วัน 990 MP เริ่มอย่างน้อย LV.1 หรือ VIP + LV.30 ราคา 1,990 MP สำหรับผู้ยังไม่มี VIP และยังไม่ถึง LV.30; ราคาเดโมปรับใน Studio ได้
- **ซื้อเวลาเพิ่ม** ผู้มี VIP เห็นเฉพาะแพ็กปกติ ต่อ 30 วันจากวันหมดอายุเดิม คง XP/claims/เลเวลทั้งหมด ไม่รับ LV.30 ซ้ำ ส่วนผู้หมด VIP แล้วเลือกแพ็กได้ตามเงื่อนไขเดิม แพ็กเร่งตั้ง XP อย่างน้อย 3,000 ของซีซันปัจจุบัน ไม่บวก 30 เลเวลทับและไม่เปลี่ยนเลเวลโปรไฟล์
- **ผลประโยชน์ก่อนจ่าย** popup แสดงวันหมดอายุหลังซื้อ, เข้าเกม 0 Energy, MAX ฟื้นพลัง +6 ตาม config, ของแถมตอนซื้อ และจำนวน Energy/MP/ตั๋วที่ปลดล็อกให้กดรับ คำนวณจาก reward table จริง มีตาราง Energy สะสมที่ LV.1/10/20/30/50 ยอดเหล่านี้ไม่เติมเข้า Energy ทันที สิทธิ์รางวัลเก่าไม่ถูกโฆษณาให้ซื้อซ้ำ
- **Pass / Missions** ซีซันอัตโนมัติรอบละ 30 วัน, 50 เลเวลหลัก (100 XP/เลเวล), Free/VIP tracks และ claims แยกตามรอบ ปุ่มรับทั้งหมดเก็บของที่ปลดล็อกได้ครั้งเดียว; หลักไมล์มี Avatar, Pet, ปีก, กรอบ, พื้นหลัง, บัตร Ranked และป้ายจบซีซัน ของซ้ำชดเชย MP ตาม config
- **Bonus Levels** หลัง LV.50 ยังเก็บ XP ต่อได้ ทุกเลเวลโบนัสรับ 10 MP ยกเว้นเลเวลที่หาร 5 ลงตัวเป็นตั๋วกาชา 1 ใบ ไม่แจก cosmetic หายากแบบไม่จำกัด
- **ภารกิจ** รายวันเริ่มต้นจบ 3 รอบรับ 200 XP, รายสัปดาห์เล่นต่างกัน 4 เกมรับ 500 XP และรายเกมเป้าสะสม 1/5/10/20/50/100/... รับ MP/XP เป้ารายเกมไม่รีเซ็ตตามซีซัน ส่วนรายวัน/รายสัปดาห์แยกตามรอบป้องกันรับซ้ำ
- **Shop / Point Shop** แท็บของขาย/เติมแต้ม/Energy อยู่ตำแหน่งเดิม ไม่มีร้าน VIP ซ้ำ ปุ่ม + ข้างยอด MP เปิด `#points` โดยตรง เลือกแพ็ก 99/199/299/499/699/999 AIS Points ไม่มีช่องแลกจำนวนเอง โบนัส x2 ครั้งแรกคิดเฉพาะแต้มหลักและจำแยกต่อแพ็ก; ธุรกรรมยังเป็นเดโมในเครื่อง
- **Avatar & Pets** แต่งตัวจาก Avatar; ปุ่มลอยรูปอุ้งเท้าเปิด `#gacha` แยกจากห้องแต่งตัว มีตั๋ว/MP และผลสุ่มแบบ Mock
- **Ranking** แยก Game ID และ Lifetime/Season พร้อมรางวัล MP สำหรับ Top 3 แบบจำลอง รับครั้งเดียวต่อเกม/Season; Free และ VIP ใช้กติกาเดียวกัน
- **Battle Arena** ซื้อบัตรเข้า Ranked ด้วย MP (เริ่มต้น 30 MP/ใบ) แล้วใช้ 1 ใบเข้าเกม ไม่หัก Energy/MP ตอนเข้าและไม่หักบัตรซ้ำเมื่อ reload session เดิม; จบ Ranked เดโมได้ 70 MP/80 EXP เทียบกับ Casual 40 EXP; ส่ง `mode=ranked` ให้ URL เกม แต่โฮสต์ยังต้องรองรับโหมด/ผลยืนยันเอง
- **Masque Vease / World** เมือง 3D แนวตั้งด้วย Three.js พร้อมบ้าน/ร้านค้า คลอง สะพาน น้ำพุ และตัวละคร 2D billboard แตะพื้นเพื่อเดินด้วย A* อ้อมสิ่งกีดขวาง ไม่มี joystick แตะอาคารเพื่อเปิดเมนูร้าน/เลือกเกม พร้อมกล้องตามตัวละคร, ซูม/หมุน, แผนที่, Emote/Chat และผู้เล่นจำลอง 6 คน
- **My Profile / My Space** เปลี่ยนพื้นหลัง, bio, กรอบรูปโปรไฟล์ และปักผลงานที่ปลดล็อกสูงสุด 3 ป้าย; แสดงเกมที่เล่นบ่อย ชั่วโมงเล่นที่เปิดหน้าเกมไว้จริง และประวัติ Top Season; กระเป๋ารวมบัตร Ranked/ตั๋วกาชา, Avatar, Pet, ปีก และกรอบรูป พร้อมใช้ของจากคลังได้
- **Game Player** เปิด iframe URL เดิม มี Loading/Retry/Fallback และ Simulate Finish สำหรับบันทึกคะแนน/EXP จำลอง รีเฟรช Session เดิมไม่เสีย Energy ซ้ำ
- **Demo Studio** ปรับ Economy, VIP Plans/Bonuses, Catalog, Mission, Pass/Ranking Seasons, Reward Tables, Gacha Weights, ราคาบัตร Ranked, รางวัลจบ Ranked และ World พร้อมนาฬิกาจำลอง/Reset
- **Mobile-first** ออกแบบแนวตั้ง 320–430px พร้อม safe area และ bottom navigation; ไม่ทำ layout แนวนอนสำหรับเมือง

## Entry & Mock Testing

### Energy Admission And Continue Rules

| ผู้เล่น | ค่าเข้า Casual | เล่นต่อหลังตาย (เตรียมไว้) | เพดานฟื้นเริ่มต้น |
| --- | --- | --- | --- |
| ฟรี | 1 Energy | 1 Energy | 12 |
| VIP | 0 Energy | 1 Energy | 18 |

Ranked ยังคงใช้บัตร 1 ใบ ไม่ใช้ Energy ตอนเข้า ทั้งฟรีและ VIP ค่าเล่นต่ออยู่ใน `continueEnergyCost` และมี `spendContinueEnergy` แยกจาก `spendGameEnergy` แล้ว แต่ยังไม่มีปุ่ม resume, iframe message handler หรือการสั่งเกมให้เล่นต่อ เพราะเกมภายนอกยังไม่รองรับ ไม่ควรเรียกหักก่อนผู้เล่นยืนยันคำขอที่เกมรองรับจริง

Config ใช้ `vipFreeEntry`, `vipEnergyBonus`, `continueEnergyCost` แทนความหมายเดิมของ `vipUnlimited` ตัว loader ย้าย save เก่าและแก้เวลา regen ที่เคยถูกพักถึงวันหมด VIP โดยรักษา Energy/วัน VIP เดิมไว้ การซื้อ/ต่ออายุไม่เติมพลังให้เต็มทันที และไม่รีเซ็ตเวลาที่ฟื้นค้างไว้เมื่อยังไม่เต็ม

- เข้าแอปโดยไม่ใส่ `name` จะแสดงหน้าเริ่มเกม ให้กรอกชื่อก่อน ชื่อนี้อยู่ใน memory ของ session และไม่บันทึกใน `localStorage`; reload จะกลับมาหน้านี้
- `?name=Mint` ข้ามหน้าเริ่มเกมและใช้ชื่อนี้ใน session โดยไม่รีเซ็ตยอดหรือบันทึกชื่อ
- ผู้เล่น Mock ใหม่/Reset เริ่มด้วย 1,000 AIS Points; save เดิมรักษายอดที่บันทึกไว้
- `?name=Somchai&aispoint=100` ใช้ AIS Points เป็น seed เมื่อสร้าง Mock Player ใหม่ (เพดาน 1,000,000)
- `?name=Somchai&aispoint=100&resetMock=1` รีเซ็ต Mock Player แล้วลบ `resetMock` ออกจาก URL โดยคง hash route ไว้
- `?aispoint=100` แสดง seed บนหน้าเริ่มเกม; การ seed จะมีผลเมื่อสร้าง Player ใหม่หรือใช้ `resetMock=1`

## Avatar & Pet Assets

Artwork Batch 1/2/3 ทั้ง 28 ภาพติดตั้งแล้ว: โลโก้/ฉาก Entry/profile, currency/badges, Luna/Nami/Mali outfits, Pets, wings และ Gacha machine/capsule. PNG ต้นฉบับอยู่ใน `art-source/`; runtime อยู่ใน `public/assets/` และ MV มีสำเนา Avatar/Pet WebP กับ wings ที่ใช้ในเมือง

`PASS_ARTWORK` และ `GACHA_ARTWORK` ใน `src/lib/data/config.ts` ชี้ไปยังภาพที่ติดตั้งแล้ว รายชื่อไฟล์, ขนาด, alpha, จุดยึดและ prompt อยู่ใน [ART_GENERATION_BRIEF.md](doc/ART_GENERATION_BRIEF.md). Batch 2/3 ใช้ชื่อ PNG แบบ descriptive ซึ่ง `scripts/optimize-art.mjs` จะข้ามเงียบ ๆ; Avatar/Pet WebP ชุดนี้จึงแปลงและ map แยกไว้แล้ว อย่ารัน optimizer แบบ numbered ทับต้นฉบับ และ `npm run art:cosmetics` จะเขียนทับ wing PNG final

Mali Festival, Mali Ranked และ Nami เป็น Avatar สินค้าใน Shop; wardrobe ใช้ภาพเต็มตัว ไม่ใช่ระบบ paper-doll แยกชิ้น เดโมใหม่สวม Pudding ให้เดินตามในเมือง ส่วน save เก่าที่ถอด Pet ไว้จะไม่ถูกสวมทับ

## เริ่มพัฒนา

ใช้ Node.js 22.12+ หรือ Node.js 24 และ npm ที่รองรับ workspaces รัน `npm install` จาก root ครั้งเดียว บน Windows ที่บล็อก npm.ps1 ใช้ `npm.cmd`

```sh
npm install
npm run dev
npm run check
npm test
npm run build
```

เปิดอีก terminal แล้วรัน `npm run dev:mv` สำหรับ MV ที่ `http://localhost:5174/` ส่วน MGC อยู่ที่ `http://localhost:5173/maque-center/` ต้องเปิดทั้งสอง dev server เพื่อใช้งาน iframe; หาก MV ไม่พร้อมจะแสดง Retry โดยหน้าเกม/Shop ยังเปิดได้

คำสั่ง MV จาก root: `npm run test:mv`, `npm run check:mv`, `npm run build:mv` ใช้ `VITE_VEASE_URL` ใน MGC เมื่อต้องเปลี่ยน URL/พอร์ต MV แล้ว restart dev server; production ที่ไม่ตั้งค่านี้ใช้โฟลเดอร์ข้างกัน `../masque-vease/` บน origin เดียวกัน

## Deploy

นำ **เนื้อหาภายใน `dist/`** ไปวางใน directory บนเว็บเซิร์ฟเวอร์ที่ให้บริการ URL นี้:

**https://masque-lab.adldigitalservice.com/masque-gamecenter/masque-center/**

Production asset base คือ `/masque-gamecenter/masque-center/` ส่วน dev ยังใช้ `/maque-center/` เดิม ใช้ hash navigation ไม่ต้องเพิ่ม backend routing วางเนื้อหาทั้งหมดของแต่ละ `dist` โดยไม่สร้างโฟลเดอร์ `dist` ซ้อนบนเซิร์ฟ

MV build แยกด้วย `npm run build:mv`; นำเนื้อหา `apps/masque-vease/dist/` ไปวางที่ `/masque-gamecenter/masque-vease/` ไม่ใช่ทับไฟล์ MGC ทั้งสองโฟลเดอร์อยู่ข้างกันใน `nginx/html/masque-gamecenter/` และไม่ต้องตั้ง `.env` สำหรับโครงสร้างนี้ หลังอัปโหลดให้ hard refresh เพื่อโหลด HTML/asset ชุดใหม่

ถ้าเปลี่ยนที่วาง ให้ตั้ง `VITE_PUBLIC_BASE` ของแต่ละ FE แล้ว build ใหม่ ถ้าโฮสต์ MV อีก origin ให้ตั้ง `VITE_VEASE_URL` ใน MGC และ `VITE_ALLOWED_PARENT_ORIGINS` ใน MV (origin คั่นด้วย comma ไม่มี path/trailing slash); `VITE_GAME_CENTER_URL` ใช้เปลี่ยนปลายทางกลับจาก MV แบบ standalone ตัวแปร VITE เป็น public config ไม่ใช่ secret และ `.env.example` เป็นตัวอย่าง override ที่ comment ไว้เพื่อไม่ทับค่า default โดยไม่ตั้งใจ

## โครงสร้างหลัก

```text
src/
├── App.svelte
├── app.css
├── main.ts
└── lib/
		├── components/   # Header, navigation, game/pass/ranking UI
		├── data/         # Game catalog และ mock rankings
		├── services/     # Player, pass และ ranking logic
		└── types/        # TypeScript models
public/images/        # ภาพปกเกม
public/assets/avatars/ # Avatar WebP และ Mali outfit variants
public/assets/pets/    # Pet WebP
public/assets/badges/  # Badge artwork
public/assets/brand/   # Game Center / Vease logos
public/assets/currency/# MP and ticket icons
public/assets/entry/   # Entry island background
public/assets/gacha/   # Pet Gacha machine/capsule
public/assets/profile/ # Profile backgrounds
```

## ขอบเขต Prototype

ข้อมูลเดโม, Wallet, Sessions, Scores, Seasons, Inventory, การแต่งโปรไฟล์ และ Admin Config ใช้ `localStorage` key `masquegame_center_v2` ร่วมกัน แต่ชื่อเข้าเกมไม่ถูกบันทึก ข้อมูล v2 เดิมย้าย schema โดยรักษา Ownership/Claim และข้อมูลห้องเก่าไว้ แม้ route `#room` เปลี่ยนเป็นแต่งโปรไฟล์แล้ว Profile EXP เป็นความคืบหน้าแสดงผลเท่านั้น ไม่เพิ่มความสามารถในเกม

ไม่มี Backend, Authentication, Multiplayer หรือ AIS integration จริง ผล iframe ไม่ได้รับการตรวจสอบ ปุ่ม Simulate Finish สร้างคะแนน/รางวัลตัวอย่างเท่านั้น แชต/ผู้เล่นอื่นเป็นข้อมูลจำลอง ไม่เชื่อมข้ามอุปกรณ์ เวลาเล่นนับเฉพาะ session ที่หน้าเกมโหลดแล้วและแท็บ visible ไม่คำนวณเวลาย้อนหลังของ save เก่า ไม่ใช่ระบบ anti-cheat หรือเวลาที่เกมภายนอกยืนยัน เกมภายนอกอาจมีข้อจำกัดเครือข่ายหรือ iframe ของโฮสต์

Pass ใช้รอบ UTC คงที่ 30 วันนับจาก epoch 2026-01-01 (เช่น 2026-10-28 ถึง 2026-11-27 โดยสิ้นสุดแบบ exclusive) ทุกคนใช้หน้าต่างเวลาเดียวกัน Studio เลือก theme/reward template และปิดสวิตช์รอบจริงเพื่อทดสอบ Preview ได้; วันที่ใน template ใช้เฉพาะ Preview ส่วน Ranking Season ยังเป็นอิสระ เมื่อเปลี่ยนรอบจะเริ่ม XP/claims ใหม่ แต่เลเวลโปรไฟล์ ของที่มี และวัน VIP คงเดิม ยังเป็นนาฬิกา/ข้อมูลในเครื่อง ไม่ใช่ระบบตรวจผลเกมหรือเวลาที่เชื่อถือจาก backend

Migration เก็บ pass records เดิมและคัดลอกสิทธิ์/claims ไปยังรอบแรกของแต่ละ template; เพิ่ม XP 100 ครั้งเดียวเพื่อชดเชยเลเวลเริ่มต้นเดิมที่เปิด tier แรกตั้งแต่ 0 XP ไม่หักวัน VIP หรือคืนของที่เคยได้รับ พื้นหลังเดิมยังใช้ได้ ส่วนผู้เล่นใหม่เริ่ม Canal Day แล้วปลดล็อกพื้นหลังอื่นจาก Pass

## Demo Walkthrough

1. เปิด `/maque-center/?name=Demo&aispoint=100&resetMock=1` จะเห็น 7 เกม, Energy, Wallet และ Profile EXP
2. เช็กอิน แล้วตรวจรางวัลที่หน้า Wallet
3. เปิดเกม กดเริ่ม ลองรีเฟรช แล้วใช้ **Simulate Finish**; Energy หักครั้งเดียวและคะแนน/EXP อัปเดต
4. เปิด Ranking สลับ Season/Lifetime ดูคะแนนของตนเอง รางวัล Top 3 ใช้ MP เท่านั้น
5. กด + ข้าง MP เพื่อเปิดแพ็กเติมแต้ม ลองซื้อแพ็กเดิมซ้ำเพื่อตรวจว่าโบนัสครั้งแรกไม่ซ้ำ; Shop → Energy ซื้อได้เกินเพดาน Regen
6. กดซื้อ VIP Pass ดูแพ็กปกติ/LV.30 และตารางผลประโยชน์ก่อนจ่าย ถ้าแต้มไม่พอเติมผ่าน Point Shop แล้วกลับมาแพ็กเดิมโดยยังต้องยืนยันซื้ออีกครั้ง ผู้มี VIP กดซื้อเวลาเพิ่มแล้วตรวจวันหมดอายุใหม่กับเลเวลที่คงเดิม
7. ซื้อ Avatar/ปีกแล้วไป Avatar & Pets เพื่อสวม; กรอบรูปเลือกที่ My Space → แต่งโปรไฟล์ เลือก Pet ในเมืองได้จากปุ่มรูปอุ้งเท้า
8. ที่ Pass → ภารกิจ เล่นเกมหนึ่งรอบ รับ MP/XP แล้วตรวจเป้ารายเกมเปลี่ยน 1 เป็น 5; เล่นครบ 3 รอบรับรายวัน และต่างกัน 4 เกมรับรายสัปดาห์ รางวัลเป็นทางเดินแนวตั้งต่อเนื่อง 1–50: ฟรีซ้าย, VIP ขวา, เส้นเลเวลอยู่กลาง ใช้ scroll หน้าเว็บปกติ ไม่มี scroll ซ้อน แถบ XP/รับทั้งหมด/ไปเลเวลปัจจุบันติดด้านบน และของเด่นทุก 5 เลเวลมีภาพใหญ่ขึ้น
9. เปิด Demo Studio → Seasons เปลี่ยน Pass Season/Ranking ID หรือ Reset Ranking; Lifetime และ Pass Season อื่นยังอยู่
10. ซื้อบัตรเข้า Ranked ที่ Shop แล้วเปิด Battle เลือกเกม ยืนยันใช้บัตร 1 ใบ เข้าหน้าเกมจริง ใช้ Simulate Finish เพื่อทดสอบรางวัลเดโมและ Match History
11. เปิด Vease แล้วแตะพื้นเพื่อเดินตามจุดหมาย ตัวละครจะหาเส้นทางอ้อมบ้าน/คลองผ่านสะพาน แตะ Masque Arcade เพื่อเลือกเกม แตะ Point Market/Atelier/Pavilion/Clubhouse เพื่อเปิดหน้าที่เกี่ยวข้อง แผนที่เลือกเดินไปหน้าร้านได้ พร้อม Emote/Chat และโปรไฟล์ MOCK
12. เปิด Profile ดูสถิติ/กระเป๋า/ผลงาน; My Space (`#room`) เปลี่ยนพื้นหลังและ bio ปักป้ายที่ปลดล็อกแล้ว บันทึกและ refresh เพื่อตรวจ persistence
13. เปิด Studio → Reset Demo → ยืนยัน เพื่อคืนข้อมูลตัวอย่างเริ่มต้น

ใช้ **เติมทุนจำลอง** ใน Studio เมื่อต้องการนำเสนอหลายรายการต่อเนื่อง การเปลี่ยน Admin Config ต้องกด **บันทึกการตั้งค่า** ก่อนจึงมีผลต่อผู้เล่น ปุ่ม Reset, ซื้อแพ็กแต้ม และซื้อ VIP Pass ใช้ Popup ยืนยันกลาง ภาพแพ็กคริสตัลเป็น PNG ที่สร้างด้วย `npm run art:points` ไม่ใช่ AI image generation; คำสั่งนี้เขียนทับภาพแพ็กตัวอย่างเท่านั้น

## Verification

Reward-track presentation references the Free/Premium progression model in the [official VALORANT Battlepass FAQ](https://support.riotgames.com/en-us/valorant/gameplay/battlepass-faq). Masque uses its own artwork and a portrait-friendly vertical path with aligned Free/Level/VIP columns; no external game assets are bundled and the 30-day economy is unchanged by this UI refinement. Claiming a reward preserves the page position.

`npm test` ตรวจ MGC 41 tests รวมแพ็กเริ่ม LV.1/LV.30, ซื้อเวลาเพิ่มไม่ลดเลเวล, ตัวเลขผลประโยชน์จากตารางจริง, VIP Energy และระบบ Pass/Economy เดิม ส่วน `npm run test:mv` ตรวจ MV 15 tests รวม A*, origin/source, route/focus allowlist และขนาด iframe ใช้ `npm run check` / `npm run check:mv` ตรวจ types และ `npm run build` / `npm run build:mv` ตรวจ production bundles แยกกัน

## Masque Vease

MV อยู่ใน `apps/masque-vease` ของ repo เดิม ดู [MV README](apps/masque-vease/README.md) ไม่มี backend/multiplayer เพิ่ม และไม่แก้หรือเชื่อม runtime ไปยัง Gatherfall

- หน้าเมนูใช้ `backdrop` เป็นฉากเมืองเต็มพื้นที่ใต้ UI โปร่งใส เลือกมุมร้านด้วย `FOCUS`; Home มี Avatar/เช็กอินด้านบน และให้เกมแนะนำอยู่ในจอแรก `#avatar` ใช้ `wardrobe` และ `#world` ใช้ `town` พร้อมเมนูล่างที่ไม่หาย
- `src/lib/components/VeaseFrame.svelte` เป็น iframe bridge ของ MGC ใช้ iframe เดิมเปลี่ยนโหมด พักการวาดเมื่อพ้นจอ/แท็บ hidden และถอด MV เมื่อเข้าเกมจริง; wardrobe ส่งขนาดเนื้อหากลับเพื่อลด scroll ซ้อน
- `apps/masque-vease/src/lib/world/veaseWorld.ts` สร้างเมือง/ป้ายชื่อ CanvasTexture/NPC; `portraitScene.ts` แสดงตัวละครระยะใกล้ด้วย renderer เบา ไม่มี bloom; `town.ts` เป็น A*/collision/layout
- `WALK_TO` สั่งเดินไป building ID คำสั่งใหม่ยกเลิกเส้นทางเก่าและตอบ `ARRIVED` พร้อมสถานะ cancelled การเลือกเมนูเดินที่ 4.5 หน่วย/วินาทีแล้วซูมตัวละครหน้าตึก 3D เมื่อถึงที่ ส่วนแตะเดินปกติใช้ความเร็วเดิม รองรับ reduced motion และ timeout 15 วินาที
- เมืองมีหน้าต่างไฟ โคม ไฟเฉพาะจุด และประกายแบบ Points ไม่ใช้ bloom; backdrop จำกัดประมาณ 30fps และซ่อนป้ายชื่อ/ป้ายอาคารเพื่อลดความรก ไม่ใช่การรับประกัน FPS ทุกอุปกรณ์
- สร้าง artwork ใหม่ในเครื่องด้วย `npm run art:world` ผ่าน Sharp: facade/roof/paving WebP, ภาพบ้านสำหรับแผนที่ และภาพตัวละครที่ trim transparency จาก assets เดิม เก็บใน `public/assets/world/`; ไม่ใช่ภาพจาก AI image-generation service
- ภาพที่ MV deploy อยู่ใน `apps/masque-vease/public/assets/` หลังเปลี่ยนภาพจาก art scripts ที่ root ให้คัดลอกไฟล์ที่เปลี่ยนไปยัง MV ด้วย แต่ละ FE มี assets ของตัวเอง ไม่โหลดข้าม dev server
- ต้องรองรับ WebGL 2; มีหน้า Retry เมื่อเปิด WebGL ไม่สำเร็จ ภาพคน/สัตว์เลี้ยงเป็นภาพ 2D พร้อม idle/walk bounce ไม่ใช่โมเดล 3D หรือ skeletal animation
- คนอื่นทั้งหมดเป็น MOCK และ Chat อยู่ในเครื่อง ป้ายชื่อวาดบน sprite ใน WebGL canvas ไม่สร้าง DOM element ต่อเฟรม แตะพื้นหรือเลือกอาคารจากแผนที่เพื่อเดินตามเส้นทางจริง ไม่ teleport; เปิดเมนูจะหยุดเดิน มีวงจุดหมายบนพื้นและปฏิเสธจุดที่เดินไม่ได้
- แตะอาคารจะเปิดเมนูใช้งานก่อน: Arcade เลือกหนึ่งในเกมเดิม 7 เกมแล้วไปหน้า Detail (ยังไม่หัก Energy), ร้าน/อาคารอื่นเปิด Shop, Wardrobe, Room, Pass หรือ Battle มีปุ่มเดินไปหน้าร้านเป็นตัวเลือกรอง
- WebView host ควรล็อก orientation เป็น portrait; หน้าเว็บใช้กรอบแนวตั้งบนเดสก์ท็อปและข้อความให้หมุนเครื่องบนมือถือแนวนอน ไม่อาศัย browser orientation-lock API ที่บังคับไม่ได้ทุกอุปกรณ์
- ตรวจภาพและ canvas pixels บนจอแนวตั้ง พร้อมจำกัด pixel ratio และ batch geometry เพื่อลด draw calls