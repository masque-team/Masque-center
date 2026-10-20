# MasqueGame

เกมมือถือสำหรับ myAIS WebView รวม 7 เกม เล่นฟรีด้วย Energy หรือปลดล็อก VIP Benefits, Battle Pass rewards, Masque Points และ Avatar & Pets

<p align="center">
	<img src="public/images/bird.png" alt="ภาพปกเกมสัตว์บินถลาลม" width="420" />
</p>

<p align="center"><strong>Svelte 5 · TypeScript · Vite · Tailwind CSS 4</strong><br />Mobile-first · Static SPA · No backend</p>

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
> เกมสัตว์จับคู่สู้สุดใจยังไม่มีภาพปกใน assets จึงใช้ไอคอนการ์ดจับคู่แทน

## ฟีเจอร์

- **Energy** เริ่มต้น 12 หน่วย ใช้ 1 หน่วยต่อการเข้าเกม และฟื้น 1 หน่วยทุก 30 นาที
- **VIP Pass** มีแพ็กเกจ Mock 5 และ 7 วัน ซื้อด้วย Masque Points พร้อม Energy ไม่จำกัดและ VIP Benefits
- **Battle Pass** มี Free/VIP reward tracks, missions, XP progression และ reward claims แบบจำลอง
- **Shop** แลก 1 AIS Point เป็น 10 Masque Points และเติม Energy หรือซื้อ VIP ด้วย Masque Points
- **Avatar & Pets** เลือกตัวละครทั้งตัว, pet collection, equip และ pet gacha แบบ Mock
- **Ranking** แยกตาม Game ID พร้อมตัวเลือก Weekly/All-Time; Free และ VIP จัดอันดับได้เท่ากัน
- **Friends Room** สร้างห้อง/ใส่รหัส/เริ่มเกมเป็น UI Mock ไม่มี multiplayer backend
- **Game Player** เปิดเกมผ่าน iframe มี loading state, fallback, ทางเลือกเปิดแท็บใหม่ และปุ่มกลับหน้า Home
- **Mobile-first** รองรับหน้าจอ 320–430px, safe area, bottom navigation และหน้าจอแนวนอน

## Mock Testing

- `?name=Mint` ตั้งชื่อผู้เล่น โดยไม่รีเซ็ตยอดที่บันทึกไว้
- `?name=Somchai&aispoint=100` ใช้ AIS Points เป็น seed เฉพาะตอนสร้าง Mock Player ใหม่ (เพดาน 1,000,000)
- `?name=Somchai&aispoint=100&resetMock=1` รีเซ็ต Mock Player และลบ `resetMock` ออกจาก URL โดยคง hash route ไว้

## Avatar & Pet Assets

วางภาพตาม path ที่ประกาศใน `src/lib/data/config.ts`:

- `public/assets/avatars/mali.png`, `nami.png`, `luna.png`, `mali-vip.png`
- `public/assets/pets/pudding.png`, `cloud.png`, `mochi.png`, `sprout.png`

ถ้ายังไม่มีไฟล์ UI จะแสดง placeholder อัตโนมัติ; Avatar Stage ใช้ `AssetPortrait` แยกจากโครงหน้าจอเพื่อรองรับการเปลี่ยน viewer ในอนาคต

## เริ่มพัฒนา

ต้องมี Node.js และ npm ติดตั้งไว้แล้ว

```sh
npm install
npm run dev
npm run check
npm run build
```

Vite dev server ใช้ base path `/maque-center/` เช่น `http://localhost:5173/maque-center/` เมื่อ build สำเร็จ ไฟล์สำหรับ deploy จะอยู่ใน `dist/`.

## Deploy

นำ **เนื้อหาภายใน `dist/`** ไปวางใน directory บนเว็บเซิร์ฟเวอร์ที่ให้บริการ URL นี้:

**https://masque-lab.adldigitalservice.com/maque-center/**

Build กำหนด asset base เป็น `/maque-center/` แล้ว และใช้ hash navigation เพื่อให้เปิดแต่ละหน้าใน static hosting ได้โดยไม่ต้องตั้ง backend routing

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
public/assets/avatars/ # ภาพ Avatar (optional; placeholder หากไม่มีไฟล์)
public/assets/pets/    # ภาพ Pet (optional; placeholder หากไม่มีไฟล์)
```

## ขอบเขต Prototype

ชื่อผู้เล่น, Player ID, Level, AIS Points, Masque Points, Energy, VIP expiration, rewards, Avatar และ Pet เก็บใน `localStorage` key `masquegame_center_v2` เท่านั้น State จากระบบเดิมจะไม่ถูกนำเข้ามาปะปน Ranking, missions, XP, check-in, gacha, exchange และ VIP transactions เป็น Mock ทั้งหมด คะแนนไม่ได้รับหรือยืนยันจาก iframe และไม่มีการเชื่อมต่อ AIS จริง จึงใช้ทดสอบ UI/UX เท่านั้น ไม่สามารถยืนยันสิทธิ์หรือทำธุรกรรมจริงได้