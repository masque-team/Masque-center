# MiniGame2 — Frontend-only Demo Implementation Spec (all M1–M3)

**Deliverable:** one **working, clickable, mobile portrait** frontend inside the existing Masque-center project. Reuse implementation; do not rebuild the seven games or add backend/DB. **This document is a demo translation, not an amendment to product rules.**

## 0. Implementation rules (non-negotiable)

1. Inspect the **local working tree** and read [00](./00_READ_FIRST.md) → [01](./01_PRODUCT_REQUIREMENTS.md) → this file → [04](./04_ACCEPTANCE_AND_OPEN_ITEMS.md). Local files may have changes not yet pushed.
2. Existing verified framework: **Svelte 5 + Vite + TypeScript + Tailwind CSS 4**, component-based `src/App.svelte`, `src/lib/pages`, `src/lib/components`, `src/lib/services`, `src/lib/data`; the `apps/masque-vease` workspace is unrelated and should not be extended.
3. **No Backend, API server, database, live AIS Point charging, external auth, live scoring security, or real multiplayer.** Use typed fixtures, in-memory state and existing localStorage mock where needed. Data may survive reload on a single browser but must never be described as multi-user persistence.
4. Preserve the **7 existing game URLs and iframe launcher**, Game Zone mock entry query params, production/development base paths, existing session and save formats, and working legacy features. Hide unsupported extras rather than delete their code.
5. **Build ALL planned customer-facing screens through M3 first, not just M1.** Feature milestones remain metadata for review; the demo should allow the whole journey to be exercised with appropriate mock fixtures.
6. Keep all visible CTAs useful. A button may perform a mock action, simulate a game result, or navigate to a complete mock screen; it may not lead to a dead end or silently change nothing.
7. Do not write a new engine, reusable platform SDK, real game backend, or new admin/backend stack. The design/graphics agent follows later; make functional UI first with current artwork/placeholder blocks.

## 1. Default navigation and pages

**Required customer-visible experiences (UX can choose tab hierarchy):**

| Screen / flow | Original milestone | Functional demo behavior |
|---|---:|---|
| Entry / Home | M1 | Accept `?name=...` and optional `?aispoint=...`; show compact identity/status, featured game/banner(s), daily check-in, shortcuts. |
| Game Hub / All games | M1–M2 | All 7 existing playable games, category filters, admin-ordered mock display, unobtrusive New/Hot/Hit tags, mocked online count/total plays. |
| Game Detail / Pre-game | M1–M2 | Game explanation, high score, leaderboard, skin/Power-up previews, play cost and confirmation. Start existing game iframe. |
| Game Player / Results | M1–M3 | Loading/back/retry, fake finish option when iframe integration unavailable; score/high-score record, mission progress overlay, result summary, optional continue/revive preview. |
| Shop | M1–M3 | Mock AIS Point display/purchase confirmations for Energy/VIP/Premium/cosmetics/pack/ticket/gacha as appropriate; entitlement or inventory updates reflected throughout. |
| Profile / Avatar room | M1–M2 | Player identity, appearance selectors, equipped frame/banner/badge/pet, VIP and Energy, history shortcut; 2D art on a plane in a simple 3D room (or lightweight CSS perspective placeholder until art pass). |
| VIP promotion / package | M2 | Multiple mock durations, active/expires state, purchase and renewal extends time; normal game entry waived, no Premium unlock. |
| Battle Pass / Reward track | M3 | Shared season XP + level; Free and Premium track; current eligibility and claim state; premium purchase retroactive; manual claim; end-season automatic fallback. |
| Mission center | M3 | Daily, Weekly, Season tabs; Free/VIP/Premium categories; visible locked missions + upsell; completion and animated progress after result. |
| Gacha / item inventory | M2–M3 | Configurable mock boxes/rates, draw → result → inventory, cosmetic equip/ownership; not a real paid random system. |
| Campaign (list/detail/game choice) | M1 | Mock free campaign + optional ticket-competition scenario; game-specific leaderboard, prize preview gift button, closure/result/popup. |
| Ranking | M1 | Per-game **all-time** normal scores, separate campaign per-game rankings, tie-earlier rule, current-player highlight and gift prize preview. |
| History / Notifications | Cross-cutting addition | Filter tabs: games, purchases/point mock logs, rewards. Envelope/badge or Profile shortcut. End-of-campaign prize/expired-season popup links to history. |

**UX discretion:** Primary bottom nav does not have to include 13 items. Use existing hierarchy, discoverable subroutes/shortcuts and a compact persistent header. Keep 320–430 px portrait, safe areas, touch hit targets, no obstructive overlays.

## 2. What must be hidden (keep implementations intact)

- Vease/3D World entry, World map, Private Room, Battle Arena and special ranked-ticket flow, separate friends/multiplayer features, unapproved MP exchange/MP-specific paid promotions.
- Do not remove code/assets or break direct legacy internal routes if they already exist; hide from MiniGame2 navigation/marketing and label as legacy.
- Legacy Shop and VIP text claiming **VIP unlocks Premium rewards**, VIP adds +6 natural energy cap, VIP shortens recharge, or current Pass is a personal 30-day subscription must be removed/corrected in MiniGame2 UI, not silently preserved.
- Existing developer/admin mock controls can remain as **dev-only** test tools (inaccessible to normal customer navigation). Do not build real admin APIs. Source settings fixtures can live in `src/lib/data`.

## 3. Demo data model / semantics (illustrative, adapt to existing types)

Prefer extending the existing `PlayerState` / `DemoState` with **additive fields + version-safe migration**, not introducing a competing global store. Suggested conceptual entities:

- `player`: mock ID, display name, profile/character ID, AIS Point mock balance, Energy balance and regen timestamp, VIP expiration, equipped cosmetics, inventory.
- `gameCatalog`: preserved game IDs, URLs, category and display order; editorial tag, onlineCount/plays mock; optional published flag.
- `playSession`: unique ID, game ID, normal/campaign context, startedAt, finishedAt/result, score, optional consumed Energy/ticket receipt. Prevent duplicate charges on reload or finish.
- `leaderboardKey`: `normal:<gameId>` or `campaign:<campaignId>:<gameId>`. Per-user best `{score, achievedAt}`. Sort score descending, achievedAt ascending.
- `campaign`: ID, image, title, start/end, included games, entrance policy, reward tier definitions, settlement status; demo-only clock or finalize action.
- `vip`: `expiresAt`; mock product options, activated immediately. VIP does **not** imply premium pass.
- `season`: ID + explicit start/end boundaries, level cap, XP threshold, Free/Premium rewards, mission catalogs. A **calendar month** rather than fixed epoch 30-day cycles.
- `passProgress`: `seasonId`, XP, premiumOwned, claimedRewardKeys; separate XP-grant event IDs to prevent repeat.
- `missions`: ID, entitlement free/vip/premium, period daily/weekly/season, trigger, target, current count, XP award, completedAt.
- `inventory`: owned cosmetic items, consumable balances and equipped IDs, reward receipt IDs.
- `history`: timestamped game-play, purchase and reward events; show player-facing friendly source, amounts and context.
- `notifications`: one-time popup queue for rank/season auto-grants; status viewed and link to History.

Keep explicit **demo-only** constants/config instead of pretending guessed prices/reward tables are production decisions. Reuse `src/lib/data/config.ts`, `public/games.json`, existing services where practicable. Avoid total rewrites to `App.svelte` or undocumented migration of `masquegame_center_v2`.

## 4. Exact behavior for key demo mechanics

### Energy

- Base cap 15, regen +1 per 30 minutes **only when below 15**. Recharge timing should not jump forward after previously holding overflow.
- Buying/claiming Energy adds the entire awarded quantity, even when greater than 15 (e.g., 20/15). Timer pauses while at or over 15.
- Start normal game: cost 1 unless VIP currently active. Continue/revive (when simulated): 1 additional Energy regardless of VIP.
- Cost is charged once per **confirmed new session**, not again on iframe refresh/back navigation; record a mock transaction/history event.

### VIP and mock Store

- Show 6-hour/1-day/3-day or other **demo-only** options (prices marked examples; configurable). Purchase immediately activates/re-extends `expiresAt = max(now, oldExpiresAt) + duration`.
- In the normal game launcher, VIP makes **entry cost 0**; VIP does not set Energy to infinity and does not cover Campaign Ticket or revive.
- A VIP player can run VIP missions and gain XP but never gains Premium rewards without purchasing the season's Premium pass.
- For AIS Point: simulate purchase entirely in memory/localStorage, decrement a **mock** balance, write mock purchase history; never call a billing API or claim real charge.
- **Currency policy is OPEN.** Prefer a user-facing mock AIS Point path in the new MiniGame2 UI, since the Backlog lists AIS Point Shop, while retaining legacy MP state/code privately. Do not delete MP support or decide real conversion ratios.

### Ranking

- Normal game high-score is all-time. Compare only personal best for a given leaderboard key. A lower repeat score cannot reduce best.
- On equal score across players, earlier `achievedAt` wins. Provide fixtures proving order.
- Campaign key separates both campaign and game. Do not combine game scores and do not import all-time bests into a newly created campaign.
- Gift button shows mock reward tier breakdown (rank 1, 2–3, 4–5 or a configurable 10/20); labels are examples, not locked.
- On campaign finalize/expiry, credit prizes once (including Energy overflow/cosmetics), add reward history, then queue one-time popup for the next open. Claiming popup does not grant again.

### Battle Pass and Missions

- Current season is **calendar-month-based**. Switching/advancing mock date to next month starts new XP, level, mission and track claim sets.
- Free/Premium tracks share **one XP level**. Buying Premium mid-season **does not add XP or level** but opens claims for achieved levels.
- Show three mission entitlement groups Free / VIP / Premium, each with Daily / Weekly / Season. Locked benefits stay visible with clear status and appropriate CTA.
- After a mock game result, animate mission bar changes for matched missions (e.g., `2/5 → 3/5`); when completed, award XP **automatically and once**.
- Reward-track items are **manually claimed** during active season; eligible unclaimed items auto-credited on season expiry once and shown in notification popup on next open. Do not auto-credit unowned Premium track.
- At the configured pass level cap, stop XP/level growth at MAX; do not reuse old bonus level MP logic unless explicitly approved. Dev tool can simulate date/XP but must be hidden from normal navigation.

### History

- A unified history experience; tabs/filters **Games / Purchases / Rewards** and optional All.
- Games: show per-game play counts and recent sessions with scores, mode/context.
- Purchases: purchase/point debit/energy top-up records; Rewards: rank/battle pass/check-in/gacha/achievement; show source/timestamp and item.
- Show an envelope/notification dot if unread rank/season popups exist; clicking should lead to popup/history, never a new unimplemented mailbox.

### Profile / 3D ambiance

- Character art is still **2D**, simply textured on a Three.js `PlaneGeometry` (or perspective layer if needed while awaiting the art pass). A simple room/backdrop and parallax/shadows create depth. Do **not** assert a true 3D avatar rig/VRM is implemented.
- Keep the 3D renderer optional/lazy for performance; do not start Vease World or force expensive 3D on every page. No new renderer library unless it demonstrably improves the specific profile.
- Allow cosmetic preview/equip with current assets; switchable ranking banner is distinct from campaign ad banner.

## 5. Demo fixtures for a complete walkthrough

Provide **at least** these reproducible states (via reset + developer-only scenario selector, existing Demo Studio or local fixtures):

1. New player with `?name=Mint&aispoint=100`, Energy 15/15 and no VIP/Premium.
2. After one normal game: Energy 14/15, score, game history and progressing mission.
3. Overflow: grant 20 Energy while at 14 → 34/15, no regen until below cap. (Amount is test-only.)
4. VIP active + 2 days left → purchase a 3-day demo package → ~5 days remaining, normal entry free; revive still costs 1.
5. Level 10 Free-only user → buy Premium → **can manually claim eligible Premium levels 1–10** without granting XP.
6. VIP active but Premium absent → VIP missions available, Premium rewards locked.
7. Equal high scores by Alice and Bob with earlier timestamp for Alice → Alice ranks first.
8. Campaign includes bird + memory → two separate rankings; normal bird all-time high score unaffected.
9. Campaign ends → configured prize auto-credited once, popup on next open, History reward record persists.
10. Battle Pass season changes → new progress starts at base, previous eligible unclaimed rewards auto-delivered and notification once.
11. Gacha box opened with mock purchase → prize visible in Inventory/History and equipped if cosmetic.
12. Existing hidden Vease/Battle/Room pages no longer appear in MiniGame2 standard navigation but their source remains.

## 6. Implementation phases INSIDE THE DEMO (not business milestones)

**Functional pass 1 — Route and visibility:** inspect and preserve code; hide extras; ensure all planned pages reachable; keep 7 game URLs, loading/back flows and local save.

**Functional pass 2 — Model + rules:** Energy, VIP, all-time/campaign ranking, Campaign prize settlement, calendar Battle Pass + missions, History. Keep services testable and mock transactions idempotent.

**Functional pass 3 — Content + interactions:** Shop/Gacha/Inventory/Profile, check-in, reward previews, mission overlay, test scenarios, card metrics/promotions.

**Functional pass 4 — Handoff:** run validation; write concise `doc/minigame2/COPILOT_HANDOFF.md` with implemented routes, unresolved visual assets, known gaps, test commands and commit hash. **No need to manually prepare screenshots; Gemini/Argon can inspect the running app/project.**

**Visual pass (later, separate agent):** Gemini/Argon explores the existing implementation, creates graphics and modifies Tailwind/CSS/Three.js presentation directly while preserving logic. **Verification pass:** Copilot checks and fixes regressions.

## 7. Testing and completion

- `npm run check`, `npm test`, `npm run build` at repository root; also check the untouched MV workspace only if shared changes affect it.
- Add/extend service tests for Energy cap/overflow/regeneration, VIP renewal, premium independence/retroactive claims, monthly reset/auto-claim, ranking tie-break, campaign separation/grant-once and History.
- Manually exercise 320 px, 375 px and 430 px portrait widths and the existing deployed WebView/iframe base-path assumptions.
- **Do not claim a full demo if any primary customer CTA is a dead button, hides a required screen, or gives mock rewards inconsistent with current shared state.**
- Do not push, create PRs, rewrite `README.md` or remove legacy code without the user's/agent's explicit follow-up instruction. The current task is **documentation**.
