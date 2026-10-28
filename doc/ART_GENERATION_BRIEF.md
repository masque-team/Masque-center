# Masque Game Center: PNG Production Brief

## Delivery Rules

- Deliver individual PNG files, not a contact sheet, collage or screenshot of a UI.
- Transparent assets must contain real alpha transparency, not a checkerboard or white backdrop.
- Use sRGB. Keep the original canvas size and transparent margins across every variant.
- Original cute chibi fantasy art, polished game illustration, crisp silhouettes and readable at mobile size.
- Palette: sky blue, coral pink, white and warm gold. No green-dominated or purple-dominated theme.
- Light from upper left; consistent outlines and soft shading. No watermark, signatures or UI borders.
- Keep labels, prices, numbers, player names and buttons OUT of the artwork. The app draws these as text.
- Logos are the exception: supply a clean symbol version and a separate wordmark version.
- Source PNGs go under `art-source/`, NEVER `dist/`. The build replaces `dist/`.
- `public/` holds deployable art. Optimized WebP may be derived from PNG originals after review.
- Do not overwrite current assets until dimensions, alignment and transparency have been checked.

## GPT Batch Prompts: 10 Separate Images

There are 28 planned outputs below: the 25 core assets in Priority 1 and Priority 2, two
optional Gacha upgrades, and a symbol-only brand mark requested alongside the Game Center logo.
Run the three prompts one at a time. Each prompt asks for up to 10 individual image files, never
one combined sheet. If the image tool cannot return separate files, ask it to render them one by
one within that batch. The four Pass images already installed in `public/assets/pass/` are not
included and must NOT be regenerated.

For every prompt, attach the named existing Avatar, Pet or wing references from `public/assets/`
when requested. Save the original PNGs at `art-source/<listed subfolder>/<exact filename>`; do not
put source art in `dist/`. These are source/delivery paths, not a promise that every image is
already wired to the runtime. After review, update the relevant asset mapping before copying or
optimizing files into `public/assets/` and rebuilding.

Important for Batch 2 and Batch 3: `scripts/optimize-art.mjs` only processes numbered names such
as `mali-1.png` and maps their number through a fixed order. It will silently ignore descriptive
names like `mali-default.png`, `mali-festival.png` or `pudding.png`; do NOT run `npm run art` on
these batches. Avatar and Pet images also need explicit runtime IDs/mapping, and outfit variants
are future art until the UI exposes them. Keep these originals in `art-source/` until that
integration is planned. Gacha files stay optional until `GACHA_ARTWORK` is mapped.

### Batch 1: Brand, Entry, Profile and Currency (10)

```text
Generate exactly these 10 ORIGINAL production-ready Masque Game Center image assets as 10
separate downloadable PNG files. Never make a contact sheet, collage, sprite sheet, multi-panel
image or screenshot. Use the exact relative filenames below; do not print filenames on artwork.
If you cannot return 10 separate files in one response, generate them sequentially and stop only
after all 10 are delivered. Do not invent extra variants.

Shared art direction: polished cute chibi fantasy mobile game illustration, clean confident
silhouettes, soft painted shading, consistent light from upper left. Palette is sky blue, coral
pink, ivory white and warm gold. Avoid green-dominated, purple-dominated, dark or muddy palettes.
Use original designs only: no copyrighted characters or logos, no watermark or signature.
Transparent assets need genuine alpha transparency, never a checkerboard baked into the image.
Use sRGB and exact canvas sizes. Do not trim or change the requested canvas. No UI, cards, buttons,
prices, player names or decorative text. Text is allowed only on the two wordmarks below, and must
match the exact spelling requested.

01. brand/masque-game-center-logo.png
1600x640 PNG, real transparent alpha. Exact wording: MASQUE GAME CENTER. Create an original
friendly rounded game wordmark in sky blue with restrained coral and gold accents. Include one
small original feather/mask-inspired emblem to the left of the words. Keep all lettering fully
inside the canvas with 8 percent clear padding. Spell every word exactly; no subtitle or slogan.

02. brand/masque-game-center-symbol.png
512x512 PNG, real transparent alpha. Create only the same small feather/mask emblem used beside
the Batch 1 Game Center wordmark. No letters or words. Center it with 12 percent padding and make
its silhouette readable at 48px. Match the wordmark's blue, coral, ivory and warm-gold colors.

03. brand/masque-vease-logo.png
1600x640 PNG, real transparent alpha. Exact wording: MASQUE VEASE. Match the Game Center wordmark
family, rounded letter treatment and light upper-left shading, but make the emblem feel like a
welcoming little town with a canal/roof motif. Keep all text inside 8 percent clear padding. Exact
spelling only; no slogan or extra text.

04. entry/entry-island.png
1440x2560 portrait PNG, opaque continuous background. A welcoming miniature fantasy island
town with coral-roofed arcade, sky-blue atelier, ivory walkways, turquoise canal and one small
bridge. Clear open sky in the upper 25 percent for a logo; keep the lower center quiet and low
detail for a name-entry form. No people, Pet, lettering, logo, panel or UI.

05. profile/canal-day.png
1600x1000 opaque PNG. Sunny canal-town profile environment with ivory paving, soft blue water,
coral roofs and warm daylight. Leave the middle 40 percent open and uncluttered for a full-body
Avatar overlay. Keep upper corners low-detail for badge overlays. No characters, words or UI.

06. profile/cloud-club.png
1600x1000 opaque PNG. Bright sky-club terrace with soft clouds, sky-blue architecture, ivory
stone and restrained warm-gold trim. Leave the middle 40 percent open floor for a full-body
Avatar; keep upper corners quiet. No characters, words, floating orbs or UI.

07. profile/atelier-dusk.png
1600x1000 opaque PNG. A gentle coral-pink evening atelier courtyard with ivory stone, blue
shadows and warm window light. Keep the middle 40 percent clear for a full-body Avatar and keep
upper corners low-detail for badges. No people, words, dark purple cast or UI.

08. currency/arena-ticket.png
512x512 PNG, real transparent alpha. One compact coral-and-warm-gold fantasy admission ticket
with an original crossed-swords emblem. Center with 10 percent padding; clear bold silhouette at
32px. No letters, price, number, quantity, background or extra ticket.

09. currency/pet-gacha-ticket.png
512x512 PNG, real transparent alpha. One sky-blue-and-gold Pet Gacha ticket with an original
paw emblem. It must look clearly different from the coral Ranked ticket. Center with 10 percent
padding; readable at 32px. No letters, price, number, quantity, background or extra ticket.

10. currency/masque-point.png
512x512 PNG, real transparent alpha. One polished warm-gold coin with a simple original feather
or masquerade-inspired emblem. Center with 10 percent padding and a clean rim; readable at 32px.
No currency symbol, letters, digits, shine burst outside the coin or background.

Before delivery, verify there are exactly 10 individual files with the exact names, canvas sizes
and alpha rules above. If a wordmark is misspelled, redo that file instead of adding corrected
text as a second line.
```

### Batch 2: Badges and Four Avatar Outfits (10)

Attach the current Avatar reference files from `public/assets/avatars/`: `mali.webp` for all three
Mali outfits, and `nami.webp` for Nami. Generate the three Mali outputs from the SAME identity,
camera, body proportions and pose.

```text
Generate exactly these 10 ORIGINAL production-ready Masque mobile-game PNG assets as 10 separate
downloadable files. No collage, contact sheet, sprite sheet, multi-panel image or extra variant.
Use the exact relative filenames. If the tool cannot return separate files, generate sequentially
until all 10 are delivered.

Shared style for badges: polished cute fantasy game illustration, crisp readable silhouettes,
soft upper-left lighting, sky blue/coral/ivory/warm gold; not green-heavy or purple-heavy. Badges
are isolated objects on genuine transparent alpha, centered, no watermark, no background and no
baked text, digits, season name or UI.

01. badges/first-finish.png
512x512 PNG, alpha. A small silver-and-ivory finish medal with one clear finish-flag emblem.
Centered with 10 percent padding, readable at 32px.

02. badges/ranked-debut.png
512x512 PNG, alpha. A coral-and-warm-gold shield medal with an original crossed-swords emblem.
Distinct from the Ranked ticket; centered with 10 percent padding, readable at 32px.

03. badges/explorer.png
512x512 PNG, alpha. A sky-blue compass medal with a simple gold pointer and ivory details.
Centered with 10 percent padding, readable at 32px.

04. badges/season-top-1.png
512x512 PNG, alpha. A premium gold trophy crest with a broad clear silhouette. No rank number,
season name or lettering; the app adds rank text. Center with 10 percent padding.

05. badges/season-top-2.png
512x512 PNG, alpha. Use the exact trophy silhouette and camera from season-top-1, rendered in
silver and ivory with restrained sky-blue accents. No number or lettering.

06. badges/season-top-3.png
512x512 PNG, alpha. Use the exact trophy silhouette and camera from season-top-1, rendered in
warm bronze/coral with ivory accents. No number or lettering.

Shared character rules for files 07-10: use the attached current Avatar image as the identity
reference. Preserve that character's face, skin, hair and recognizable features. One full-body
front-facing slight 3/4 chibi character per image, same camera, scale and neutral pose across all
four. Exactly 1024x1024 PNG, real transparent alpha; centered x=512, feet baseline y=940, head top
around y=100, at least 60px safe edge padding. Show the whole head, hands and shoes. No Pet, wings,
aura, floor shadow, background, lettering or baked shadow. Do not trim the canvas.

07. avatars/mali-default.png
Attach `public/assets/avatars/mali.webp`. Same Mali identity in her simple signature everyday
outfit. Keep the back attachment point at x=512,y=563 clear for separately rendered wings.

08. avatars/mali-festival.png
Attach the same `mali.webp` reference. Same Mali face, hair, body, camera and pose as
mali-default; change only the clothes to a cheerful coral-and-sky festival outfit. Keep the back
attachment point at x=512,y=563 clear. No wings.

09. avatars/mali-ranked.png
Attach the same `mali.webp` reference. Same Mali face, hair, body, camera and pose as
mali-default; change only to a sporty sky/coral Ranked outfit. Keep the back attachment point
clear. No wings, weapon or equipment in hand.

10. avatars/nami-default.png
Attach `public/assets/avatars/nami.webp`. Preserve Nami's exact identity and make one full-body
reference outfit using the shared 1024x1024 character canvas and alignment rules above. No wings.

Verify all 10 are separate files with real alpha. Overlay the three Mali images before approval:
their face size, feet baseline, body position and back attachment point must align exactly.
```

### Batch 3: Remaining Avatar, Wings, Pets and Gacha (8)

Attach current references from `public/assets/avatars/luna.webp`, `public/assets/pets/`, and
`public/assets/wings/` for the matching named assets. Do not invent a replacement identity where
a reference is supplied.

```text
Generate exactly these 8 ORIGINAL production-ready Masque mobile-game PNG assets as 8 separate
downloadable files. Do not combine them into a collage, contact sheet, sprite sheet or multi-panel
image. Use each exact relative filename below. If only one image can be returned at a time, render
the eight sequentially and stop after the last file.

Shared style: polished cute chibi fantasy-game illustration, crisp silhouettes, clean soft-painted
shading and consistent upper-left lighting. Sky blue, coral, ivory and warm gold; avoid green- or
purple-dominated art. Genuine alpha for all requested assets. No watermark, signatures, UI, words,
prices, labels or extra objects. Use sRGB and keep the exact untrimmed canvas.

01. avatars/luna-default.png
Attach `public/assets/avatars/luna.webp` as identity reference. One full-body front-facing slight
3/4 chibi Luna in her reference outfit. Preserve face, skin, hair and proportions. 1024x1024 PNG,
real alpha, center x=512, feet baseline y=940, head top around y=100, at least 60px edge padding.
Show complete head, hands and shoes. No Pet, wings, aura, floor shadow or text. Do not trim.

02. wings/sky-feather.png
Attach the current `public/assets/wings/sky-feather.png` as a style reference. One symmetrical
pair of white feathers with sky-blue shading and silver edges, viewed front-on to sit BEHIND a
chibi Avatar. 1024x1024 PNG, true alpha. Attachment center x=512,y=563; tips within x=70..954 and
y=170..800; keep the middle clear for a body. No character, aura, shadow, text or background.

03. wings/sunrise-seraph.png
Attach the current `public/assets/wings/sunrise-seraph.png` as a style reference. One symmetrical
pair of ivory-and-gold seraph wings with restrained coral jewel accents, same camera, silhouette
scale and attachment center as sky-feather. 1024x1024 PNG, true alpha, anchor x=512,y=563, tips
within x=70..954 and y=170..800. Keep center clear. No character, aura, text or background.

04. pets/pudding.png
Attach `public/assets/pets/pudding.webp` as identity reference. One full-body Pudding, preserving
the same species, face and colors. 1024x1024 PNG, real alpha, feet baseline y=940, center x=512,
at least 60px safe padding. No wings, aura, shadow, floor, background or text.

05. pets/cloud.png
Attach `public/assets/pets/cloud.webp` as identity reference. One full-body Cloud, preserving the
same species, face and colors. Use the same pet camera, scale and canvas alignment as Pudding:
1024x1024 PNG, real alpha, feet baseline y=940, center x=512, at least 60px padding. No wings,
aura, shadow, floor, background or text.

06. pets/frostwing.png
Attach `public/assets/pets/frostwing.webp` as identity reference. One full-body Frostwing,
preserving its recognizable owl-like identity, face and color design. Use the same pet camera,
scale and canvas alignment as Pudding: 1024x1024 PNG, real alpha, feet baseline y=940, center
x=512, at least 60px padding. No separate wings, aura, shadow, floor, background or text.

07. gacha/pet-gacha-machine.png
One compact tabletop capsule machine, front slight 3/4 view, 1024x1024 PNG with true alpha. Use
sky-blue/coral/ivory and restrained gold with upper-left light. Keep the whole machine within 60px
of the canvas. Center a large empty clear-glass display globe around x=512,y=400, roughly 420px
tall, so the app can overlay a live Pet portrait. Include a lower prize chute and a side knob. No
Pet or capsules inside the globe, no lettering, prices, coins, ticket counts or background.

08. gacha/gacha-capsule.png
One large readable two-part toy capsule, front slight 3/4 view. 512x512 PNG with true alpha,
12 percent padding, horizontal center seam, sky-blue upper shell and coral/ivory lower shell with
one small gold clasp. Glossy plastic highlights, upper-left lighting. No Pet, lettering, numbers,
rarity mark, background, extra capsule or UI.

Before delivery, confirm exactly eight individual files, matching filenames and dimensions,
transparent alpha, no clipped edges and no reference character identity drift.
```

The symbol-only logo and both Gacha images are optional improvements to existing fallbacks. Do
not let them block work on the 25 core priority assets. The two optional Pass assets, optional
moon-moth wings and modular Avatar rig later in this brief are intentionally excluded from these
three batches.

## Current Request: Game-Style Pass Art

These four supplied images are now installed in `public/assets/pass/` and active in the Pass/shop
UI. The tickets and crest replace the earlier wing/Lucide placeholders; the key art remains a
background layer with live interface text and reward art over it.

### First Batch: Four Images

| Priority | Exact Filename | Canvas | Alpha | Composition / Use |
| --- | --- | --- | --- | --- |
| 1 | `vip-ticket-standard.png` | 1024 x 1024 | Yes | One sky-blue/ivory VIP admission ticket, original gold crown emblem, white feather edges, slight 3/4 view; package selector |
| 2 | `vip-ticket-boost.png` | 1024 x 1024 | Yes | Same family and angle, upgraded gold/coral ticket bundle with small wing accents and a crystal; NO digits; LV.30 badge comes from UI |
| 3 | `season-crest.png` | 512 x 512 | Yes | Original gold crown/wing season crest, compact readable silhouette; Pass banner and membership strip |
| 4 | `season-keyart.png` | 1600 x 720 | No | Sunny sky/coral arcade-town terrace, quiet left 60% for text, open right for live reward Avatar; NO characters, UI or lettering |

The two tickets must share one approved master: same object scale, attachment/visual center,
lighting, camera and padding. Keep the whole ticket inside x=110..914 and y=110..914 on the
1024px canvas. Do NOT trim. They display at about 96px high on mobile, so avoid tiny filigree.
The crest displays around 48-72px; use a broad silhouette, not text or hairline detail.

Deliver originals to `art-source/pass/`. Reviewed deployable files belong in
`public/assets/pass/` in MGC. Do NOT put them into `dist/` or the MV project.

### Mapping In The App

`PASS_ARTWORK` in `src/lib/data/config.ts` maps the supplied files like this:

```ts
standard: 'assets/pass/vip-ticket-standard.png',
boost: 'assets/pass/vip-ticket-boost.png',
crest: 'assets/pass/season-crest.png',
banner: 'assets/pass/season-keyart.png',
```

`PassArtwork.svelte` handles the ticket/crest preview and fallback. The banner remains
an environment layer: the app overlays the actual LV.50 reward character and live labels.
Disabled/selected/owned states, prices, days, level badges and buttons remain rendered by UI.

### Optional Second Batch

These are NOT wired into the first preview and should wait until the first four pass review:

| Filename | Canvas | Alpha | Spec |
| --- | --- | --- | --- |
| `reward-pedestal.png` | 1024 x 512 | Yes | Low sky-white/gold reward plinth, top landing surface at y=230, empty above, no item or lettering |
| `level-node-frame.png` | 512 x 512 | Yes | Small gold/ivory medallion frame, EMPTY transparent middle 50% for a dynamic level number, no digits or crown crossing the center |

### Copyable Pass Prompts

Attach the approved standard ticket when generating the boost variant.

```text
Create one ORIGINAL production-ready chibi mobile fantasy game inventory illustration.
Asset: vip-ticket-standard.png. Exactly 1024x1024 PNG, real transparent alpha.
One luxurious sky-blue and ivory admission ticket, original warm-gold crown emblem,
small white feather edges, slightly tilted 3/4 view, clean dimensional bevels,
polished soft painted shading, light from upper left. Center the complete object
with identical 110px safe margins on all sides. Crisp readable silhouette at 96px.
No text, letters, digits, prices, "VIP" label, buttons, scenery, background,
checkerboard, watermark, extra objects, copyrighted game logos or contact sheet.
```

```text
Use the attached approved standard Pass ticket as the exact visual-family reference.
Asset: vip-ticket-boost.png. Exactly 1024x1024 PNG, real transparent alpha.
An upgraded warm-gold/coral admission ticket bundle with subtle ivory wing accents
and one small sky-blue crystal. Same camera, upper-left lighting, object scale,
center and 110px safe margins as the standard. More premium, but still readable
at 96px. No text, letters, digits, "30", "LV", prices, badges, scenery,
background, checkerboard, watermark, existing game logo or collage.
```

```text
Asset: season-crest.png. Exactly 512x512 PNG with real transparent alpha.
One original friendly fantasy game season emblem: broad warm-gold crown,
short ivory wings, a single sky-blue jewel, clean raised bevels and soft painted
upper-left lighting. Compact balanced silhouette, centered with 12 percent padding.
Readable at 48px. No text, numbers, banners with writing, game logos, background,
checkerboard, watermark or multiple variations in the same file.
```

```text
Asset: season-keyart.png. Exactly 1600x720 PNG, full continuous environment image.
Original polished cute fantasy arcade-town terrace in soft daylight: sky-blue
canal details, coral roofs, ivory stone and restrained gold decorations.
Keep the left 60 percent quiet and low-detail for live interface text; keep the
right side open so the app can overlay a full-body reward Avatar. No characters,
pets, tickets, loot, text, logo, cards, buttons, borders, watermark or split panels.
Not green-heavy, not purple-heavy, not dark, not blurred, no bokeh/orb decoration.
```

### Pass Art Review

- Preview both tickets side by side at 96px before approving style consistency.
- Check alpha against light sky and a dark checkerboard; no baked opaque backdrop.
- Check all edges remain inside the canvas; no clipped feathers or tiny unreadable text.
- Deliver four separate exact filenames, not one combined image.
- Reject fake painted level numbers/prices. All product terms stay editable in code.

## Recommended Next: Pet Gacha Art

The Gacha screen now has a CSS-built machine and uses the existing Pet portraits. These two
transparent assets are optional art upgrades, not blockers; the UI has a fallback until the
files are delivered.

| Priority | Exact Filename | Canvas | Alpha | Composition / Use |
| --- | --- | --- | --- | --- |
| 1 | `pet-gacha-machine.png` | 1024 x 1024 | Yes | Compact sky-blue/coral/ivory capsule machine, front 3/4 view; empty clear display globe for the live Pet portrait to overlay |
| 2 | `gacha-capsule.png` | 512 x 512 | Yes | One two-part plastic capsule with a clean center seam; spins over the Pet while drawing and in result reveal |

Keep the machine within 60px of the 1024px canvas. Its display globe should be centered around
x=512, y=400 and occupy roughly 420px vertically; do not paint a Pet or capsules inside that
window. The app overlays the currently previewed Pet there. The single capsule should have
about 12% padding and remain readable at 40px. Keep labels, rarity, price, ticket count and
odds as live UI text, not painted into either PNG.

Originals go in `art-source/gacha/`; reviewed runtime files go in MGC `public/assets/gacha/`.
The optional `GACHA_ARTWORK` mapping in `src/lib/data/config.ts` is currently null:

```ts
machine: 'assets/gacha/pet-gacha-machine.png',
capsule: 'assets/gacha/gacha-capsule.png',
```

### Copyable Pet Gacha Prompts

```text
Create one ORIGINAL production-ready cute mobile fantasy game capsule vending machine.
Asset: pet-gacha-machine.png. Exactly 1024x1024 PNG with real transparent alpha.
One compact tabletop machine, front slight 3/4 view, polished dimensional bevels,
upper-left soft painted light. Use sky blue, coral pink, ivory and restrained warm gold.
Keep the entire machine within 60px of the canvas edges. Center a large EMPTY clear-glass
display globe around x=512,y=400, roughly 420px tall, with a quiet center so the app can
overlay a live Pet portrait. Include a simple lower prize chute and one visible side knob.
No Pet, no capsules inside the globe, no text, letters, prices, coins, ticket counts,
rarity labels, buttons with writing, background, checkerboard, watermark or UI screenshot.
```

```text
Create one ORIGINAL production-ready mobile fantasy game gacha capsule.
Asset: gacha-capsule.png. Exactly 512x512 PNG with real transparent alpha.
One large readable two-part toy capsule, front slight 3/4 view, a distinct horizontal
center seam, sky-blue upper shell and coral/ivory lower shell with one small warm-gold
clasp. Clean glossy plastic highlights and soft upper-left lighting. Center with 12 percent
padding. No Pet, no text, letters, numbers, rarity marks, background, checkerboard,
watermark, multiple capsules or contact sheet.
```

## Priority 1: Entry, Profile and Inventory

| Filename | Size | Alpha | Use / Composition |
| --- | --- | --- | --- |
| `brand/masque-game-center-logo.png` | 1600 x 640 | Yes | Main Game Center wordmark, centered, 8% padding |
| `brand/masque-vease-logo.png` | 1600 x 640 | Yes | Town wordmark, same family as main logo |
| `entry/entry-island.png` | 1440 x 2560 | No | Portrait island town, open sky in upper 25%, quiet lower center for a name form |
| `profile/canal-day.png` | 1600 x 1000 | No | Sunny canal town, unoccupied center for the player's Avatar |
| `profile/cloud-club.png` | 1600 x 1000 | No | Sky terrace, blue and white clouds, open central floor |
| `profile/atelier-dusk.png` | 1600 x 1000 | No | Pink evening atelier courtyard, open central floor |
| `currency/arena-ticket.png` | 512 x 512 | Yes | Coral/gold admission ticket with crossed-swords symbol, NO text or quantity |
| `currency/pet-gacha-ticket.png` | 512 x 512 | Yes | Sky/gold ticket with paw symbol, visibly different from Ranked ticket |
| `currency/masque-point.png` | 512 x 512 | Yes | Gold coin, simple original Masque emblem |
| `badges/first-finish.png` | 512 x 512 | Yes | Small silver medal with a finish flag |
| `badges/ranked-debut.png` | 512 x 512 | Yes | Coral/gold shield with crossed swords |
| `badges/explorer.png` | 512 x 512 | Yes | Sky blue compass medal |
| `badges/season-top-1.png` | 512 x 512 | Yes | Gold trophy crest, no baked season name |
| `badges/season-top-2.png` | 512 x 512 | Yes | Silver trophy crest, same silhouette |
| `badges/season-top-3.png` | 512 x 512 | Yes | Bronze trophy crest, same silhouette |

Start with the main logo, entry background, three profile backgrounds and Ranked ticket.
Other images are polish, not blockers. Standard controls continue to use Lucide icons.

### Already Supplied

- Memory game's supplied logo is preserved at `public/images/mem.png`.
- It is shown uncropped on the catalog and detail page. Do not regenerate or rename it.
- Current profile backgrounds reuse existing town illustrations as placeholders.
- The filenames in the table are the FINAL art handoff, not a claim that those files already exist.
- When final backgrounds arrive, map them in `PROFILE_BACKGROUNDS` in `src/lib/data/config.ts`.
- Entry and badge art need integration after delivery; the current app does not pretend missing PNGs exist.

## Priority 2: Full-Body Characters and Wearable Wings

Use FULL-BODY outfits first. The current system swaps a complete Avatar image; it is not a paper-doll rig.
Generate the complete character in each outfit, leaving wings and magical effects on separate layers.

### Avatar Master Canvas

- PNG 1024 x 1024, real alpha, one character per file.
- Front-facing slight 3/4 chibi view. Entire head, hands and shoes visible.
- Same camera, scale, head-to-body ratio and pose for every outfit of one character.
- Feet baseline at y = 940; body centered at x = 512; head top around y = 100.
- Back attachment anchor: x = 512, y = 563. Do not move this between variants.
- Keep at least 60px padding; never crop a hand, ear, hat or shoe.
- No pet, wings, aura, background, floor shadow or lettering baked into the character.
- Use a supplied current Avatar as the identity reference. Do not change face/skin/hair arbitrarily.

| Filename | Art |
| --- | --- |
| `avatars/mali-default.png` | Mali, reference outfit |
| `avatars/mali-festival.png` | Same Mali, coral/sky festival outfit |
| `avatars/mali-ranked.png` | Same Mali, sporty Ranked outfit, no wings |
| `avatars/nami-default.png` | Nami, identity reference |
| `avatars/luna-default.png` | Luna, identity reference |

Do not generate all ten characters before the first three Mali files pass an overlay alignment test.
Current legacy World images are trimmed automatically; normalize them or adapt their anchors before
mixing the new master canvases with legacy art. A matching filename alone does not guarantee alignment.

### Wings

- PNG 1024 x 1024, alpha; a symmetrical pair in the same image, NO character.
- Attachment center at (512, 563), matching the Avatar back anchor.
- Spread to x = 70..954, y = 170..800. Keep the very center relatively clear for the body.
- Export `wings/sky-feather.png`: white feathers with sky blue shading and silver edges.
- Export `wings/sunrise-seraph.png`: ivory/gold feathers with subtle coral jewel accents.
- Optional later: `wings/moon-moth.png`, rose/silver fantasy moth wings, not neon purple.
- PNG demo wings already exist under `public/assets/wings/`; these are programmatic illustrations,
  not images from an AI generation service. `npm run art:cosmetics` regenerates and OVERWRITES them.
- Final painted replacements should retain the names and anchors. Do not run that generator over finals.

### Pets

- PNG 1024 x 1024, alpha, full body, feet baseline y = 940, center x = 512.
- One animal, no text, no wings or aura baked in. Keep its reference identity.
- First files: `pets/pudding.png`, `pets/cloud.png`, `pets/frostwing.png`.
- Rarity aura is rendered by the engine: Rare = blue, Epic = pink, Legendary = gold.
- Pets currently have rarity, not individual XP/levels. Do not invent pet-level labels in the art.

## Priority 3: Modular Head / Body Rig (Later)

Only start this after choosing a modular dress-up system. It is NOT implemented by swapping arbitrary
independently generated heads and bodies. Every part must be traced/aligned to ONE approved master.

Keep every layer on the SAME untrimmed 1024 x 1024 canvas:

1. `rig/mali/base-body.png`: skin/body, no head/hair/outfit.
2. `rig/mali/head.png`: face/head; neck pivot at (512, 390).
3. `rig/mali/hair-back.png` and `rig/mali/hair-front.png`.
4. `rig/mali/outfit-default.png`, `outfit-festival.png`, `outfit-ranked.png`.
5. `rig/mali/shoes-default.png` and `shoes-festival.png`.
6. `rig/mali/hand-front.png` when an outfit needs an overlapping hand.
7. `rig/mali/accessory-head.png`, optional headwear, same head pivot.

Back-to-front order: aura -> rear hair -> wings -> base body -> outfit -> head -> front hair ->
front hand -> head accessory. Avoid duplicated skin at the neck seam and baked shadows across layers.

Ask for the layered source document as well as exported PNGs. Reject parts if the head size,
neck width, shoulder angle or camera differs. Animation needs an additional rig/sprite-sheet spec;
these static layers do not automatically provide a walk cycle.

## Copyable Prompts

### Shared Style Prefix

```text
Create one original production-ready mobile fantasy game art asset. Polished cute chibi illustration,
clean confident outlines, carefully painted soft shading, consistent upper-left lighting, readable
silhouette at small scale. Palette of sky blue, coral pink, ivory white and warm gold. Not green-heavy,
not purple-heavy. No copyrighted characters, no watermark, no UI mockup, no collage, no extra assets.
Follow the exact canvas, padding, alpha and attachment-anchor specification below.
```

### Entry Background

```text
[Use the shared style prefix.]
Portrait 1440x2560 PNG. A welcoming miniature island town with coral-roofed arcade, sky-blue atelier,
white stone walkways, turquoise canal and a small bridge. Clear architectural forms, soft daylight,
no people, no text, no logo. Open sky in the upper quarter for a logo; keep the lower central region
quiet for an interactive name-entry form. A single continuous scene, not divided panels. Solid image,
no transparency. Filename: entry-island.png.
```

### Main Wordmark

```text
[Use the shared style prefix.]
1600x640 PNG with real transparent alpha. Exact words: "MASQUE GAME CENTER".
Original playful rounded game lettering, sky-blue primary letters with coral and restrained gold
accents, compact wing/masquerade-inspired emblem, crisp contour, no background or banner panel.
Keep all letters fully visible with 8 percent clear margins. Also deliver a symbol-only transparent
version without text. Filename: masque-game-center-logo.png.
```

### Profile Background

```text
[Use the shared style prefix.]
1600x1000 PNG, no alpha. Theme: [Canal Day / Cloud Club / Atelier Dusk]. Environmental illustration
for a personalized player profile. Keep the middle 40 percent empty of people or foreground objects
so a full-body Avatar can stand there. Low-detail edges in upper corners for earned achievement
stickers. No character, badges, lettering, labels, border or UI. Filename: [profile filename].
```

### Full-Body Outfit

```text
[Use the shared style prefix and attach the approved Mali reference.]
One complete full-body Mali character in [default/festival/ranked] outfit. Preserve exact identity,
facial features, camera, pose and body proportions from the reference. 1024x1024 transparent PNG.
Center x512; feet y940; head top y100; back attachment anchor x512,y563. No wings, aura, shadow,
pet, floor or background. All hands and shoes visible. Do not crop or auto-trim the canvas.
Filename: mali-[outfit].png.
```

### Wings

```text
[Use the shared style prefix.]
One symmetrical pair of [sky-blue feather / ivory-gold seraph] fantasy wings only, viewed front-on
to sit BEHIND a chibi Avatar. 1024x1024 PNG with real transparent alpha. Central attachment at
x512,y563. Keep the center clear for the Avatar torso; wing tips within x70..954 and y170..800.
No character, face, text, aura, drop shadow or background. Retain the full canvas without trimming.
Filename: [sky-feather/sunrise-seraph].png.
```

### Ranked Ticket / Achievement Badge

```text
[Use the shared style prefix.]
One [coral-gold admission ticket with crossed swords / achievement medal described in the table].
512x512 PNG, true transparent alpha, object centered with 10 percent padding, readable at 32px.
No price, digits, season name or text. No surrounding UI. Filename: [exact table filename].
```

## Acceptance Checklist

- PNG decodes, sRGB, expected size, correct alpha; no checkerboard baked in.
- Every asset is a separate correctly named file, lowercase ASCII, hyphenated.
- Check logos at 160px width, tickets/badges at 32px and characters on light/dark backgrounds.
- Overlay two outfits and wings to confirm unchanged feet and attachment positions.
- Preview profile scenes at 320, 390, 430 and desktop widths; text remains rendered by the app.
- Do not generate decorative button backgrounds, rasterized prices, progress bars or player names.
- Magical auras are engine effects, not additional large PNGs or bloom postprocessing passes.