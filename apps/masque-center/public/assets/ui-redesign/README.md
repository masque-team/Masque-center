# คู่มือการใช้งานรูปภาพและโครงสร้างการปรับโฉม UI (UI Redesign Assets & Integration Guide)

เอกสารนี้อธิบายรายการรูปภาพทั้งหมดที่จัดเตรียมไว้ในโฟลเดอร์โปรเจกต์ (`public/assets/ui-redesign/` และ `art-source/ui-redesign/`) พร้อมวิธีนำไปใช้งานในแต่ละหน้าจอเพื่อให้ได้ UI ตามภาพต้นแบบ (Reference Screenshots)

---

## 1. โครงสร้างโฟลเดอร์รูปภาพที่จัดวางไว้แล้วในโปรเจกต์

รูปภาพทั้งหมดถูกวางไว้ที่ `public/assets/ui-redesign/` (เรียกใช้งานในโค้ดผ่าน URL `assets/ui-redesign/...`) และสำเนาต้นฉบับอยู่ที่ `art-source/ui-redesign/` แบ่งตามหมวดหมู่ดังนี้:

```text
public/assets/ui-redesign/
├── header/
│   └── header-banner.jpg            # ฉากหลังแนวยาวเพียงฉากเดียว (ไม่มีตัวละครติดในภาพ เว้นที่โล่งตรงกลางไว้ให้วางตัวละครและสัตว์เลี้ยงของเกมเราเอง)
├── home/
│   ├── promo-ais-corgi.jpg          # แบนเนอร์โปรโมชัน AIS Point น้องหมาคอร์กี้ถือสายฟ้า
│   ├── icon-battle-pass.jpg         # ไอคอนตั๋วสีม่วงติดดาวทอง (การ์ด Battle Pass)
│   └── icon-daily-checkin.jpg       # ไอคอนปฏิทินสีม่วงพร้อมกล่องของขวัญ (การ์ดเช็คอินรายวัน)
├── games/
│   ├── game-mole-cover.jpg          # ปกเกม 3D: ตีตุ่น (NEW) แบบคลีนไม่มีตัวหนังสือทับ
│   ├── game-bird-cover.jpg          # ปกเกม 3D: นกบิน (HOT) แบบคลีนไม่มีตัวหนังสือทับ
│   ├── game-fruit-cover.jpg         # ปกเกม 3D: ฟันผลไม้ แบบคลีนไม่มีตัวหนังสือทับ
│   └── game-duck-cover.jpg          # ปกเกม 3D: ยิงเป็ด แบบคลีนไม่มีตัวหนังสือทับ
├── shop/
│   ├── energy-pack-pedestal.jpg     # แพ็กพลังงานสายฟ้าบนแท่นม่วง-ทอง (4 และ 8 หน่วย)
│   └── energy-pack-pouch.jpg        # แพ็กพลังงานถุงผ้าสีม่วงขลิบทองล้นด้วยสายฟ้า (12 หน่วย)
└── gameflow/
    ├── mole-intro-hero.jpg          # ภาพปก Hero หน้าก่อนเข้าเกม "ตีตุ่น ให้ทัน!"
    └── mole-gameover-victory.jpg    # ภาพฉลองชัยชนะหน้าจบเกม "จบเกม"
```

---

## 2. วิธีนำรูปไปใช้ในแต่ละส่วนของเกมให้เหมือนต้นแบบ

### ส่วนที่ 1: แถบ Header ด้านบน (ใช้ฉากหลัง `header-banner.jpg` ฉากเดียว + วางตัวละครและสัตว์เลี้ยงของเกมเราเอง)
**ไฟล์คอมโพเนนต์เป้าหมาย:** `src/lib/components/AppHeader.svelte` และ `src/App.svelte`

> **หลักการสำคัญ:** ด้านบนของทุกหน้าจอ (หน้าหลัก, หน้าร้านค้า, หน้าเล่นเกม) ใช้รูปฉากหลังเปล่าเพียงรูปเดียวคือ `assets/ui-redesign/header/header-banner.jpg` แล้วนำไฟล์ตัวละครและสัตว์เลี้ยงพื้นหลังโปร่งใสของเกมเราเอง (`public/assets/world/actors/`) มาวางซ้อนทับตรงกลางฉาก

#### แนวทางการประกอบเลเยอร์ (3-Layer Composition):
1. **Layer 1 — ฉากหลังเปล่า (`header-banner.jpg`)**:
   - ใช้ `assets/ui-redesign/header/header-banner.jpg` เป็นพื้นหลังความสูงประมาณ `145px - 165px` (`object-fit: cover; object-position: center bottom;`)
2. **Layer 2 — ตัวละครและสัตว์เลี้ยงของเกมเราเอง (วางซ้อนบนพื้นหญ้าตรงกลาง)**:
   - **ตัวละครผู้เล่น**: ดึงจาก `assets/world/actors/avatars-${player.avatarId}.webp` (ไฟล์ `.webp` พื้นหลังใสเต็มตัวที่มีอยู่ในโปรเจกต์แล้ว เช่น `avatars-mali.webp`, `avatars-aqua.webp` ฯลฯ)
   - **สัตว์เลี้ยงคู่หู**: ดึงจาก `assets/world/actors/pets-${player.petId}.webp` (ไฟล์ `.webp` พื้นหลังใสที่มีอยู่ในโปรเจกต์แล้ว เช่น `pets-pudding.webp`, `pets-mooncat.webp` ฯลฯ)
   - วางยืนคู่กันตรงกลางด้านล่างของฉาก พร้อมใส่ `filter: drop-shadow(0 4px 6px rgba(0,0,0,0.28))` เพื่อให้ดูยืนอยู่บนพื้นหญ้าจริง
3. **Layer 3 — แคปซูล UI ซ้าย-ขวา**:
   - **มุมซ้ายบน**: แคปซูลโปรไฟล์สีขาวขอบมน แสดงรูป Avatar วงกลม + ป้าย VIP + ชื่อผู้เล่น + ข้อความ `"ดูโปรไฟล์ >"`
   - **มุมขวาบน**: แคปซูลพลังงาน (`EnergyBadge.svelte`) แสดงไอคอนสายฟ้า `⚡ 8/12`, ปุ่ม `+` สีม่วง และแถบเวลานับถอยหลัง `+1 ใน 24:18`

```svelte
<!-- ตัวอย่างโค้ดสำหรับวางใน AppHeader.svelte -->
<header class="scenic-header">
  <!-- 1. รูปฉากหลังเปล่าเพียงฉากเดียว -->
  <img class="scenic-bg" src="assets/ui-redesign/header/header-banner.jpg" alt="" />

  <!-- 2. ตัวละครและสัตว์เลี้ยงของเกมเราเอง (เปลี่ยนตามที่ผู้เล่นสวมใส่อัตโนมัติ) -->
  <div class="stage-actors">
    <img
      class="actor-avatar"
      src={`assets/world/actors/avatars-${player.avatarId}.webp`}
      alt={player.displayName}
    />
    {#if player.petId}
      <img
        class="actor-pet"
        src={`assets/world/actors/pets-${player.petId}.webp`}
        alt=""
      />
    {/if}
  </div>

  <!-- 3. แคปซูล UI มุมซ้ายบน (โปรไฟล์) และ มุมขวาบน (พลังงาน) -->
  <div class="header-hud">
    <button class="profile-pill" onclick={onProfile}>
      <!-- Avatar + ชื่อ + ดูโปรไฟล์ > -->
    </button>
    <div class="energy-pill-wrap">
      <!-- Energy 8/12 + ปุ่ม + และเวลา +1 ใน 24:18 -->
    </div>
  </div>
</header>

<style>
  .scenic-header {
    position: relative;
    width: 100%;
    height: 156px;
    overflow: hidden;
  }
  .scenic-bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
  }
  .stage-actors {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: flex-end;
    gap: 4px;
    pointer-events: none;
    z-index: 2;
  }
  .actor-avatar {
    height: 96px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgba(15, 35, 10, 0.35));
  }
  .actor-pet {
    height: 62px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 3px 5px rgba(15, 35, 10, 0.35));
  }
  .header-hud {
    position: absolute;
    top: 10px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    z-index: 3;
  }
</style>
```

---

### ส่วนที่ 2: หน้าหลัก (Home Lobby)
**ไฟล์คอมโพเนนต์เป้าหมาย:** `src/App.svelte`, `src/lib/components/BattlePassPromo.svelte`, `src/lib/components/DailyCheckinCard.svelte`, `src/lib/components/GameCard.svelte`

1. **แผ่นเนื้อหาหลัก (Sheet Container)**:
   - ใช้พื้นหลังสีขาวอมม่วงอ่อน มุมบนโค้งมน (`border-radius: 26px 26px 0 0`) ซ้อนทับขอบล่างของฉาก Header เล็กน้อย (`margin-top: -14px`)
2. **แบนเนอร์โปรโมชัน AIS Point**:
   - ใช้รูป `assets/ui-redesign/home/promo-ais-corgi.jpg`
   - วางข้อความ `"AIS Point แลกพลังงานสุดคุ้ม"` และปุ่มสีม่วง `"แลกเลย >"`
3. **การ์ด Battle Pass**:
   - ใช้ไอคอน `assets/ui-redesign/home/icon-battle-pass.jpg` ทางซ้าย, หลอด EXP ตรงกลาง, และปุ่มสีม่วง `"ดู Pass >"` ทางขวา
4. **การ์ดเช็คอินรายวัน**:
   - ใช้ไอคอน `assets/ui-redesign/home/icon-daily-checkin.jpg` ทางซ้าย, จุดเช็คอิน 7 วันตรงกลาง, และปุ่มสีม่วง `"รับเลย >"` ทางขวา
5. **ตารางเกม 2 คอลัมน์ (Game Grid)**:
   - ด้านบนของการ์ดใส่รูปปก `assets/ui-redesign/games/game-*.jpg` ด้านล่างเป็นแถบขาวแสดงชื่อเกมทางซ้าย และปุ่มวงกลมสีม่วง `>` ทางขวา

---

### ส่วนที่ 3: หน้าร้านค้า (Shop Overlay Sheet)
**ไฟล์คอมโพเนนต์เป้าหมาย:** `src/lib/pages/ShopPage.svelte` และ `src/lib/components/PointShop.svelte`

- **โครงสร้างหน้าจอ**: แสดงเป็นแผ่นการ์ดโค้งมนด้านล่าง โดยด้านบนสุดยังคงแสดง **Scenic Header ฉากเดียวกัน (`header-banner.jpg` + ตัวละครและสัตว์เลี้ยงของเกมเรา)**
- **ตารางสินค้าพลังงาน 2 คอลัมน์ (6 แพ็กเกจ)**:
  - แพ็ก 4 หน่วย และ 8 หน่วย: ใช้รูป `assets/ui-redesign/shop/energy-pack-pedestal.jpg`
  - แพ็ก 12 หน่วย: ใช้รูป `assets/ui-redesign/shop/energy-pack-pouch.jpg`
  - แพ็ก 24, 48, 120 หน่วย: ใช้รูปหีบสมบัติใน `assets/points/chest.png`, `assets/points/treasure.png`, `assets/points/royal.png`

---

### ส่วนที่ 4: หน้าก่อนเข้าเกม & หน้าจบเกม (Game Entry & Game Over Flow)
**ไฟล์คอมโพเนนต์เป้าหมาย:** `src/lib/pages/GameDetailPage.svelte`, `src/lib/components/GameScreen.svelte`, `src/lib/components/ModalHost.svelte`

1. **หน้าก่อนเข้าเกม (Entry Screen)**:
   - ภาพ Hero กลางจอ: ใช้ `assets/ui-redesign/gameflow/mole-intro-hero.jpg` พร้อมป้ายชื่อเกม **"ตีตุ่น ให้ทัน!"**
   - การ์ด **"วิธีเล่น"**: กล่องสีขาวแสดงข้อความ `"แตะตุ่นเพื่อเก็บคะแนน ระวังตีพลาด! รอบละ 45 วินาที"`
   - แถบ 3 ช่องด้านล่าง: `สถิติสูงสุด` | `กติกา` | `อันดับ`
   - ปุ่มใหญ่ด้านล่างสุด: `"▶ เริ่มเล่น (⚡ ใช้พลังงาน 1 หน่วย)"`

2. **หน้าจบเกม (Game Over Screen)**:
   - ภาพ Hero กลางจอ: ใช้ `assets/ui-redesign/gameflow/mole-gameover-victory.jpg` (หรือวางตัวละครของผู้เล่นเอง `assets/world/actors/avatars-${player.avatarId}.webp` คู่กับถ้วยรางวัล)
   - การ์ดสรุปคะแนน: แสดงชื่อผู้เล่น, `"คะแนนรอบนี้"` ตัวเลขสีม่วงขนาดใหญ่, และ `"สถิติสูงสุด"`
   - ปุ่มกดด้านล่าง: `"▶ เล่นอีกครั้ง (⚡ พลังงาน 1 หน่วย)"` และ `"🏠 กลับหน้าหลัก"`

---

## 3. รายการรูปเพิ่มเติมที่สามารถ Gen เพิ่มได้ (พร้อม Prompt สำเร็จรูป)

| ชื่อไฟล์ปลายทาง | จุดที่ใช้งาน | Prompt สำหรับนำไป Gen |
| :--- | :--- | :--- |
| `games/game-run-cover.jpg` | ปกเกม "สัตว์วิ่ง" | `3D cute Corgi dog, baby Husky, and white bunny rabbit joyfully running a race together on an orange running track with a checkered finish line banner and colorful flags, mobile game card thumbnail art, no text --ar 16:9` |
| `games/game-clash-cover.jpg` | ปกเกม "สัตว์พุ่งชน" | `3D cute cartoon brown bull and cute fluffy pink-wool sheep charging head-to-head with a bright yellow comic impact burst between them on a sunny field, mobile game card thumbnail art, no text --ar 16:9` |
| `games/game-memory-cover.jpg` | ปกเกม "จับคู่" | `Two 3D cute square toast bread cards lying on a sparkling purple magical background with gold stars, one toast topped with a cute brown bear face and the other with a cute pink bunny face, mobile game card thumbnail art, no text --ar 16:9` |
| `games/game-fishing-cover.jpg` | ปกเกม "ตกปลา" | `3D cute shiny golden fish with big eyes jumping happily out of sparkling turquoise water towards a dangling fishing hook and wooden fishing rod, sunny green riverbank background, mobile game card thumbnail art, no text --ar 16:9` |
| `shop/energy-pack-chest.jpg` | หีบพลังงาน 24-120 หน่วย | `3D luxury royal purple and gold treasure chest topped with a golden crown, open and overflowing with bright glowing yellow lightning bolts and sparkles on a clean white background, mobile game shop icon, no text --ar 1:1` |
| `events/event-halloween-cat.jpg` | การ์ดเทศกาลฮาโลวีน | `3D cute white and grey kitten wearing a purple witch hat holding a glowing jack-o-lantern pumpkin candy bucket on a clean white background with sparkles, mobile game icon, no text --ar 1:1` |
| `events/event-christmas-cat.jpg` | การ์ดเทศกาลคริสต์มาส | `3D cute white and grey kitten wearing a red Santa hat holding a wrapped gift box next to a small decorated Christmas tree on a clean white background, mobile game icon, no text --ar 1:1` |
| `events/comp-treasure-cat.jpg` | การ์ดอีเวนต์ล่าสมบัติ | `3D cute adventurer kitten wearing an explorer hat opening a glowing golden treasure chest on a clean white background, mobile game icon, no text --ar 1:1` |
| `events/comp-mole-trophy.jpg` | การ์ดการแข่งขันตีตุ่น | `3D cute smiling brown mole wearing a red headband holding a shiny golden number 1 trophy cup on a clean white background, mobile game icon, no text --ar 1:1` |
