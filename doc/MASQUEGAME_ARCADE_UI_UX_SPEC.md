# MasqueGame — Playful Arcade UI/UX Redesign Spec

**Project:** `masque-team/Masque-center`  
**Scope:** UI/UX redesign on the existing Svelte 5 + Vite + TypeScript frontend-only demo  
**Target:** Mobile portrait 320–430px and myAIS WebView  
**Core principle:** **Mock data, fully functional frontend interactions. No Backend / Database / real AIS API.**

> IMPORTANT FOR COPILOT: Read this entire document and inspect the current source code before editing. Improve the presentation of the EXISTING app; DO NOT rebuild the application from scratch or replace the economy/game logic. Preserve all seven real game URLs, iframe launcher, query parameter behavior, shared state, localStorage persistence and working frontend transactions.

## 1. Visual Direction — Playful Arcade

Transform the interface from an administrative dashboard with game cards into a **polished, colorful casual-mobile-game hub**.

- Retain recognizable **white, sky blue, lavender, mint, warm gold** visual language, but make the whole app feel like one cohesive game.
- Use playful but legible typography, prominent game illustrations/covers, sticker-style editorial tags, soft gradient cards, tasteful glows, progress effects, and consistent illustrations.
- Keep enough whitespace, especially around the primary action. Buttons and cards should be satisfying to tap; subtly animate press, unlock and reward events; support `prefers-reduced-motion`.
- Avoid dark/neon sci-fi or overly formal dashboard design. Don't add giant decorative sections that hide the playable games below the fold.
- Suggested corners 16–22px, friendly shadows, bold readable headings. Most ordinary Thai text >=12px, metadata preferably >=10–11px. Click/touch targets ~44px where practical.

## 2. Global Navigation

Use exactly **four primary bottom tabs**:

1. **เกม** — Home / game discovery
2. **รางวัล** — Battle Pass / quests / claims
3. **อันดับ** — Game-specific rankings
4. **Avatar** — Characters and pets

**Remove “เพื่อน” from Bottom Navigation.** Keep the existing Friends Room mock available through a secondary entry (e.g. game-specific optional action or VIP Benefits). **A normal tap on PLAY should still open the actual iframe promptly**, not force users to select a room first.

**Shop** opens from Masque Points balance / `+` in header or from VIP and refill buttons, not as a fifth primary tab.

Keep the four tabs visible consistently except while actually playing a game in the iframe.

## 3. Home Screen Layout & Priority

Order from top to bottom:

1. **Compact header:** player Avatar, name from `?name=Somchai`, player level, Masque Points balance and quick Shop `+` action. Long names truncate gracefully; balance must remain accessible.
2. **Compact cheerful Hero with Energy/VIP:** current energy `/12`, next regeneration countdown and refill/VIP CTA; premium `∞` presentation for VIP users with expiry info. Avoid an oversized welcome billboard.
3. **FEATURED GAME — full-width big card:** use a real existing game cover, tasteful dark gradient overlay for title contrast, HOT sticker, concise tagline and unmistakable `▶ PLAY` button.
4. **Game catalog:** smaller **two-column** cards with covers, title, genre/entry cost and selective editorial tags. Show all seven games; if a game is featured, it can be omitted from the normal grid to avoid needless duplication as long as it remains discoverable.
5. **Daily Check-in** and **Battle Pass** promotional cards with working claim/navigate actions, after the game selection (or after first row if that reads better).

The first screen on a 375px-wide phone should already show an obvious playable game, not only status banners.

### Rough wireframe

```text
┌───────────────────────────────────┐
│ [Avatar] Somchai Lv18   🪙 MP [+] │
├───────────────────────────────────┤
│ MASQUE GAME CENTER        mascot  │
│ ⚡ ENERGY    8/12    refill/VIP   │
│ ████████░░░░   +1 in 18:42      │
├───────────────────────────────────┤
│ 🔥 เกมแนะนำวันนี้                │
│ ┌───────────────────────────────┐ │
│ │   LARGE REAL GAME COVER       │ │
│ │ 🔥 HOT                        │ │
│ │ สัตว์บินถลาลม     [▶ PLAY]   │ │
│ └───────────────────────────────┘ │
│ 🎮 เกมทั้งหมด                   │
│ [HOT Game]       [NEW Game]      │
│ [PICK Game]      [Game]          │
│ [Game]           [NEW Game]      │
│ 🎁 Daily Check-in  [CLAIM]      │
│ 👑 Battle Pass  Lv3  [OPEN]     │
├───────────────────────────────────┤
│ เกม       รางวัล    อันดับ Avatar│
└───────────────────────────────────┘
```

## 4. Featured, HOT, NEW, PICK — Configurable Presentation

The existing `src/lib/data/games.ts` owns working game identifiers and URLs; **preserve every game ID, URL and cover path exactly**. Add *presentation-only* metadata as needed:

```ts
// Suggested additions, adapt to the existing Game type
featured?: boolean;             // only one featured card at a time
editorialTag?: 'hot' | 'new' | 'pick' | null;
displayOrder?: number;
```

Default manually curated mock configuration:

| Game ID | Appearance |
| --- | --- |
| `bird` | **FEATURED + HOT**, full-width large image |
| `mole` | HOT, ordinary card |
| `run` | NEW, ordinary card |
| `fruit` | PICK, ordinary card |
| `timber` | ordinary card |
| `duck` | ordinary card |
| `memory` | NEW, ordinary card with graceful cover fallback |

Game tags are **editorial mock labels** and must not imply real traffic/player-count metrics. Avoid putting too many layered tags on the same thumbnail. Make all tags centrally editable. Featured display must remain responsive at 320–430px.

When a player presses game PLAY: invoke the existing Energy/VIP entry logic and launch that game's **original URL in the existing iframe**, with back/reload/loading/fallback intact. Do not touch the game content or invent scores.

## 5. Shop — Actual Frontend Transactions, Playful Storefront

Redesign Shop from a generic form into a fun game store. Show two wallet balances prominently and separately:

- **AIS Points:** provided as a mock initial seed from the query parameter.
- **Masque Points:** in-app demo currency. **1 AIS Point = 10 Masque Points**.

Keep and visually improve: amount selector, expected MP conversion, confirmation, balance deduction/credit, energy refill packs, VIP packages for 5/7 days, VIP active/expiry status and insufficient-balance states.

Energy refill or VIP purchase must **actually deduct MP and update shared reactive frontend state and localStorage**. Any future item/avatar/skin Buy button must also grant ownership in FE state; otherwise mark it Coming Soon or leave it out. No success-only mock dialog.

## 6. Rewards — Game-style Battle Pass and Missions

- Beautiful season header, level orb, XP progress and complete state.
- Use a **progression / reward path** aesthetic, with distinct Free and VIP tracks and prize previews.
- Clear visual states: Claim / Claimed / Locked / VIP Locked, with ownership or wallet changes upon claiming.
- Show Daily quests with a **frontend-verifiable** completion state. For example, "enter a game once" can be tracked in local state. Do not automatically claim a best-score mission complete if iframe score is not integrated.
- Special VIP visual polish should feel rewarding but should not imply Free players are banned from rankings.

## 7. Ranking — Game Tournament Look

- A top-three podium with visually distinct gold/silver/bronze positions, character/icon portraits and example scores.
- Game selector for **individual games**, Weekly/All-Time control, My Rank, and scrolling list below.
- Free and VIP users may both rank. Scores remain **clearly identified as frontend mock data**; no combined cross-game leaderboard or real-time-score claims.

## 8. Avatar + Pet — Character Showcase & Gacha

- A full-body Avatar stage with the currently equipped Pet nearby, soft magical-game backdrop.
- Character selection = **replace the entire character**, not dress-up clothing/hats/equipment slots.
- Separate Avatar selection and Pet collection with rarity, Equipped / Owned / Locked UI.
- Gacha = fun reveal animation, rarity spotlight, new/duplicate outcome, ticket-first spending and wallet change; result actually added to collection.
- Use existing `AssetPortrait.svelte` and image paths from `src/lib/data/config.ts` and keep graceful placeholders until real final art is provided.
- **DO NOT ask Copilot to invent/generate final Avatar or Pet images in this implementation.** Dedicated cohesive art will be supplied later under `public/assets/avatars/` and `public/assets/pets/`.
- Organize character preview so it can someday be swapped for a 3D viewer, but don't implement 3D now.

## 9. Friends Room Placement

- Remove its fifth nav icon, but **preserve the existing mock functionality and direct route**.
- Add a subtle secondary action through a relevant game card/detail or VIP Benefits. A featured/normal game card's **main PLAY action must remain one-tap**.
- VIP may create a simulated room and copy invitation code; non-VIP sees upgrade state. Do not add true multiplayer, sockets or backend.

## 10. Whole-App UI Polish

Apply a cohesive design system to **all** screens, not just Home: Header, Shop, Rewards, Avatar/Pet, Ranking, Game Player header and all dialogs.

- Modals: consistent playful reward/purchase visuals, readable content, sticky/visible calls to action, proper blocked states.
- Animations: lightweight CSS/Svelte entrance, tap scale, coin/energy/reward feedback, Gacha reveal; respect reduced motion.
- Use consistent rarity hues, stickers, badges, iconography, wallet and VIP colors across pages.
- For the real game iframe, preserve as much playable viewport as possible; no persistent bottom nav over the game.
- Test widths 320 / 375 / 390 / 430px and short viewport heights; keyboard, scroll and mobile safe area should not obscure interactions.
- Do not let missing avatar/pet art cause layout shifts or broken images.

## 11. Demo Business Rules — KEEP

This is **frontend-only**, but **all meaningful UI actions must have real effects in shared browser state**:

- `?name=Somchai` updates display name.
- `?name=Somchai&aispoint=100` seeds a *new* mock player with 100 AIS Points, without resetting an existing balance on refresh.
- `?name=Somchai&aispoint=100&resetMock=1` resets the demo **once**, then strips `resetMock` from URL.
- Converting AIS → MP actually reduces AIS balance and increases MP at 1:10.
- Buying Energy or VIP actually costs MP and grants Energy or VIP access/expiry.
- Gacha uses ticket first, otherwise MP, and changes owned Pet state.
- Equipping a Pet/Avatar immediately changes the preview.
- Reward and check-in claims grant actual mocked wallet/inventory rewards and are one-time as applicable.
- Each valid game entry charges Energy **once** unless VIP, launches original iframe.
- Use shared frontend state + `localStorage`, preserving current keys and behavior where reasonable.
- **No Backend, DB, API, SSO, real AIS account/points integration, multiplayer or real game score feed**.

## 12. Implementation Notes for Copilot

Inspect existing source before editing:

- `src/App.svelte`, `src/app.css`
- `src/lib/data/games.ts`, `src/lib/data/config.ts`
- `src/lib/components/GameCard.svelte`, `BottomNav.svelte`, `AppHeader.svelte`, `AssetPortrait.svelte`
- Existing player/energy/wallet/pass/gacha/reward/room services

Recommended sequence:

1. Identify what UI to keep/refine, with a short plan.
2. Introduce sensible reusable tokens and selective components (FeaturedGameCard, GameTag etc.).
3. Redesign header, Home and game discovery; configure HOT/NEW/PICK and large Featured.
4. Reduce navigation to four tabs, keep Friends Room accessible secondarily.
5. Redesign Shop, Rewards, Avatar/Pet, Ranking and dialogs with the same game-like visual quality.
6. Verify **all** frontend transactions, query parameter behavior and seven iframe game launches.
7. Run `npm run check` and `npm run build`, fix errors and provide a summary.

Do not replace the framework, install heavyweight UI libraries merely for decoration, introduce a backend, remove the seventh game, change iframe URLs, or change the Vite base path `/maque-center/`.

## 13. Acceptance Criteria

- [ ] Whole app visually reads as a delightful game hub, not a dashboard.
- [ ] One **large, full-width Featured HOT** game card is visibly more prominent than other games.
- [ ] All seven games work; all editorial HOT/NEW/PICK tags are configurable mock data.
- [ ] Normal PLAY still directly launches original iframe and charges energy once.
- [ ] Bottom nav has **four** tabs; Friends Room still accessible elsewhere.
- [ ] Shop/Exchange, Energy, VIP, Check-in, Rewards and Gacha update shared FE state and balances properly.
- [ ] Avatar and Pet layouts gracefully display placeholders until cohesive art is provided later.
- [ ] Ranking clearly mock-labeled and game-specific.
- [ ] `?name`, `?aispoint`, `?resetMock=1` correctly work and persist after refresh.
- [ ] Thai copy legible; mobile safe areas, touch targets and 320–430px widths tested.
- [ ] `npm run check` and `npm run build` succeed.

---

## Copy-paste instruction for Copilot Agent

> Read `docs/MASQUEGAME_ARCADE_UI_UX_SPEC.md` in full, inspect the current repository, then implement its **Playful Arcade UI/UX redesign** in the existing Svelte 5 project. Prioritize a large Featured/HOT game card, configurable game tags and consistent game-style design across Home, Shop, Rewards, Avatar, Ranking and modals. Preserve all working frontend demo transactions, seven actual game URLs and iframe launcher, query seed/reset, and localStorage. Use four main bottom tabs. Do not add BE/DB, rewrite core business rules or generate final character art. Test mobile responsiveness and run `npm run check` and `npm run build`; report changes and results.
