# MiniGame2 - Final Functional and UX Regression

## Scope and baseline

- Reviewed Gemini redesign `4627cf4` against functional baseline `b123dc7`, including `FINAL_REVIEW.md`, `DESIGN_HANDOFF.md`, `COPILOT_HANDOFF.md`, routing and mission event flow.
- Initial worktree was clean. No reset, pull, commit or push was performed.
- Preserved Gemini's layouts, visual hierarchy, room renderer, game URLs and local-only architecture. No backend, billing or hosted-game protocol was invented.
- The referenced Gemini `verify-ux-redesign.mjs` was absent from the checkout. Added an executable Playwright regression runner rather than relying on its reported route/overflow results.
- This is a frontend regression result, not production integration certification.

## 1. Actual routes

Assertions check the final hash, rendered `data-page`, a unique heading/element and a real action. An HTTP success or lack of overflow is not treated as proof of the intended page.

| Route | Actual destination and coverage |
| --- | --- |
| Empty hash | Entry form for a new visitor, then `#hub`; returning visitor opens Game Hub |
| `#home` | Campaign dashboard; Check-in, actual player status, carousel and CTA |
| `#hub` | Game Hub; all seven configured published games |
| `#detail/:gameId` | Game Detail; heading, launch button and persisted session |
| `#game/:gameId?session=...` | Actual GameScreen, matching iframe URL, reload/back and session persistence |
| `#shop` | Shop with item, Energy and VIP tabs |
| `#vip` | Shop with VIP selected; the hash intentionally remains `#vip` |
| `#rewards` | Masque Pass, Free/Premium tracks and separate Premium purchase; no VIP packages |
| `#missions` | Pass Missions, separate from lifetime Achievements |
| `#achievements` | Achievement and Check-in page |
| `#profile` | Profile, floating editor and Three.js room/fallback |
| `#ranking` | Normal ranking and saved player appearance |
| `#campaigns` | Campaign list and ticket-pack product details |
| `#campaign/lantern-festival` | Configured seasonal campaign |
| `#campaign/starlight-sprint` | Configured competitive campaign |
| `#campaign/loy-krathong-external` | Configured external placeholder; disabled without a real destination |
| `#inventory`, `#history` | Owned collection/equip actions and Games/Purchases/Rewards |
| `#wallet`, `#points`, `#gacha` | Canonical redirect to `#shop` |
| `#world`, `#room`, `#battle`, `#avatar` | Canonical redirect to `#hub` |
| `#admin` | Development-only Studio; production redirects to Hub |
| `#game`, `#season`, `#game-detail/mole`, `#play/mole`, `#campaign/camp-1` | Unsupported, explicitly canonicalized to `#hub` with feedback, not falsely reported as successful destination tests |

A missing supplied session redirects to its Game Detail with feedback and **does not start/debit another round**. A campaign game link without a session opens the real campaign's confirmation before charging its ticket. Unknown campaigns are rejected.

## 2. Confirmed bugs fixed

| Area | Observed regression | Fix |
| --- | --- | --- |
| Profile stacking | At 320px, the editor's Save button was intercepted by bottom navigation. Its ancestor's backdrop/filter stacking context defeated a larger local z-index. | Portal the existing sheet to `document.body`; retain its design, trap focus, restore focus/scroll and close with Escape. |
| Profile previews | Selecting no frame fell back to the saved frame through nullish coalescing. Category changes could retain an unrelated preview. | Treat explicit null as no frame; reset preview on category change. Clicking the active sheet tab keeps it open. |
| Sheet lifecycle | Escape propagation prevented product dialogs closing; pending confirmation actions could survive navigation. | Shared focus/keyboard action; clear pending modal/confirmation state on route changes. |
| Routes | Unsupported redesign URLs silently displayed Hub; stale session links could charge a new round; campaign deep links bypassed visible confirmation. | Canonical URLs and explicit feedback; stale-session guard; route campaign entry through confirmation. |
| Gacha artwork | Product sheets loaded nonexistent pet/avatar banner images. | Reuse the canonical, existing box artwork. |
| Gacha navigation | A delayed reveal could survive leaving Shop. | Cancel the pending draw on navigation, preserve the purchased unopened box and inform the player. |
| VIP identity/layout | VIP reused Pass-ticket artwork; price/details could crowd at narrow width. | Use the crown asset and responsive wrapping without redesigning the cards. |
| Poor-player product access | Ticket details were inaccessible when the balance was insufficient. | Allow opening details; disable purchase confirmation and retain service validation. |
| HUD queue | Taking the last three entries dropped earlier notifications; timers were not fully cleaned up. | Bounded, staggered scheduling with retained absolute start times and teardown cleanup. |
| HUD input | Native touch testing found HUD cards intercepting the campaign swipe. | Make the presentation card pointer-transparent; only its dismiss control captures input. Hide HUD during gameplay and product dialogs. |
| Reward copy | Lifetime check-in count was presented as a consecutive streak; Day-7 box and capped XP could be advertised without a new award. | Derive the streak and reward text from before/after state; report actual awarded Pass XP, including partial/capped awards. |
| Achievement presentation | Incomplete progress claimed a new badge; a HUD unlock could later show a duplicate modal. | Present progress separately from completion, and acknowledge the already-presented unlock notification without granting another reward. |
| Purchase History | Frame/box/ticket exchanges using Thai labels could be recorded as Rewards. | Classify negative AIS deltas as purchases. |
| Copy accuracy | Premium detail claimed 30 levels/immediate rewards; Gacha guaranteed a cosmetic/fixed compensation; external/settlement copy overpromised rewards or exposed implementation language. | Use configured level count, manual-claim language, actual Gacha outcomes/compensation and conditional campaign rewards. |

## 3. Automated validation

| Command | Result |
| --- | --- |
| `npm.cmd run check` | PASS: 0 errors, 0 warnings |
| `npm.cmd test` | PASS: 95 tests, 3 files; baseline was 85 |
| `npm.cmd run build` | PASS: 4,262 modules |
| `npm.cmd run test:ux` | PASS: 204 screen checks across 320/375/430px; 73 image assets and 1 CSS background URL validated, including Home character greeting interactions |
| `git diff --check` | PASS |

The ten added unit tests cover consecutive streaks, actual Day-7 rewards, capped/partial Pass XP, pure Achievement presentation and duplicate finish rejection, purchase History, bounded/staggered scheduling, preserved timing, reduced motion and queue cleanup. Existing tests were not weakened or rewritten to pass.

Final browser result:

```json
{
  "result": "PASS",
  "views": 204,
  "cssBackgrounds": 1,
  "imageAssets": 73,
  "widths": [320, 375, 430]
}
```

`views` counts screen/detail/layout checkpoints, not 204 distinct routes. All three widths completed the entire interaction suite with no uncaught application runtime errors. The deliberately forced WebGL failure is handled by the fallback and is not reported as a successful WebGL render.

Production build retains the existing lazy Three.js chunk (732.83 kB) and its >500 kB advisory. Main JavaScript is approximately 494.75 kB after the pass-preview and navigation refinements. No renderer rewrite or eager Three.js import was introduced.

## 4. Browser interaction evidence

The runner uses separate Chromium contexts at **320, 375 and 430px**, touch input, long player names and an explicit isolated AIS/ownership fixture. It never resets an existing browser user's save or grants customer AIS through an activity.

### Routes and navigation

- All customer pages, all configured campaigns and all seven game detail/launcher flows.
- Final URL plus component and unique content assertions; invalid and legacy links have explicit redirect assertions.
- Actual navigation controls, iframe source, back/reload and no repeat session charge.
- Separate production-preview smoke check: admin guard, URL balances ignored, `#vip` selecting Shop VIP, lazy room/canvas and no uncaught runtime errors.

### Profile

- All four floating controls open real sheets; category switching leaves only one sheet.
- Actual owned/locked inventory, locked preview without ownership change, disabled locked Save.
- Avatar, Pet, frame removal/equip, badges and bio save; reload persistence.
- Matching saved avatar/frame in Profile, Header and Ranking.
- Keyboard trap, Escape, focus/scroll restoration and no navigation interception.
- Real room canvas drag; forced WebGL failure renders the existing fallback without an uncaught error.

### Products and purchases

- VIP, Energy, Campaign Tickets, both Gacha box types, every configured cosmetic product and collectible frame details.
- Heading, image/price/detail content and no AIS debit just from opening.
- Double-click purchase confirmation: one debit/ownership/history update.
- Representative Avatar, Pet and Wing purchases appear in Inventory and persist after reload.
- VIP duration, 30 Energy cap and free normal entry; VIP does not unlock Premium.
- Separate Premium confirmation/purchase and unchanged VIP expiry.
- Gacha draw cancelled by navigation preserves the paid unopened box and does not debit again.
- Zero-balance VIP, ticket and Gacha details remain viewable with disabled confirmation.

### HUD and duplicate rewards

- Actual Check-in, Day-7 box, simulated game completion, Achievement updates and multiple Pass mission progress/completion events.
- Sample real progress-bar widths over time; observe staggered display and no more than three visible cards.
- Queue auto-dismiss, route changes, no gameplay obstruction and no replayed XP/box after refresh.
- Mount the actual compiled HUD with the app's optimized Svelte runtime, unmount mid-animation, then wait beyond its lifetime: **zero delayed dismiss callbacks**.
- Reduced-motion HUD reaches the final bar value without completion animation; carousel does not auto-slide.
- Presentation helpers do not change balances, mission state or rewards. Existing reward services remain the authority.

### Campaigns

- Seasonal and competitive grouping, configured campaigns and separate season-mission preview.
- Indicator selection, timed auto-slide, native touch swipe, pause after interaction and reduced motion.
- Every carousel CTA goes to its actual campaign or Missions; no invented campaign URL.
- Ticket confirmation shows `ใช้ 1 Ticket` and actual remaining balance before charging.
- Double-confirm consumes one ticket, including for VIP; session reload consumes no second ticket.
- Simulated campaign result updates campaign scores; expiry settlement grants once only across reload and never mints AIS.
- Sequential unread settlement/Achievement notices are dismissed and acknowledged independently.

### Visual and asset QA

- Screen geometry, primary navigation label bounds, image decoding and runtime errors checked during the interaction matrix, not just at initial URL load.
- CSS background image URLs are collected and fetched as images as well as ordinary/lazy image assets.
- Long names use bounded truncation; locked items, disabled external CTA, empty states and low balances are exercised.
- Reviewed Home/Profile screenshots at the target narrow widths and the forced-room fallback. Preserved the redesigned colors, cards, room and floating toolbar.
- This is not a full WCAG contrast certification or a physical-device performance measurement.

## 5. Preserved functional invariants

- Activities do not mint AIS Point; purchases require an existing balance.
- Energy capacity remains normal 15 / active VIP 30. VIP covers normal entry, not Campaign Tickets or paid Continue.
- Premium Pass remains a separate entitlement; XP, level eligibility and manual claims remain authoritative.
- Day-7 Pet Box, frame ownership, History and Inventory remain persistent and once-only where applicable.
- Campaign entry, isolated rankings and once-only settlement remain intact.
- Normal ranking high-score/earliest-score tie-break and all seven configured game URLs were not changed.
- Existing Three.js room, lazy loading, drag and fallback were retained.

## 6. Reproduction

Use the development server for the full runner: it imports the actual compiled HUD and catalog through Vite. Production preview is a separate smoke check, not a substitute for this command.

```powershell
# Terminal 1
npm.cmd run dev -- --host 127.0.0.1

# Terminal 2
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run test:ux
```

Default QA URL is `http://localhost:5173/maque-center/`. Override with `$env:UX_BASE_URL` when using a different development origin. Optional `$env:UX_OUTPUT_DIR` writes Home/Profile/fallback screenshots and a screenshot on failure. Install Chromium with `npx.cmd playwright install chromium` if the chosen browser is missing.

## 7. Explicit limits and remaining integration work

- Real externally hosted game completion, Continue callbacks and score validation are **not verified end-to-end**: the existing app has no certified hosted-game result/Continue protocol. Tests cover launch/session behavior, existing service invariants and the explicit Simulate Finish path. They do not prove a real game will report its result.
- myAIS balance, SSO, billing, WebView lifecycle and external-event destinations still require their real integrations; no mock result is presented as integration success.
- No physical iOS/Android device, GPU performance, real-network load or official AIS asset-provenance certification was performed.
- Existing build chunk advisory remains. Dependency installation also reported existing audit advisories; dependency/security certification or unrelated upgrades were not part of this regression.
- Historical handoff/test counts describe their own commits. This report is the post-`4627cf4` frontend regression evidence; a passing build/unit suite alone is not its UX acceptance criterion.

## 8. Player screenshot follow-up: Pass entry, navigation and squeezed artwork

- Removed the Reward Track mount-time jump to the player's current tier. Opening/re-entering/reloading Battle Pass now starts at the season overview even at LV.50; the existing current-level button still performs an explicit, reduced-motion-aware jump.
- Refined Bottom Nav within the existing sky/gold theme: stable icon/label baselines, equal-sized touch areas, contained active styling instead of an oversized raised icon, readable non-overlapping labels, focus/pressed states and safe-area padding. Routes and active parent-tab mapping are unchanged.
- Reproduced the squeezed Check-in header icon on the shared 320px browser: it measured approximately **28 x 36px**. Preventing flex shrink restores **36 x 36px**. The gift remains **40 x 40px**.
- The narrow Check-in header had squeezed reward copy between the gift and action. On small screens its action now occupies a separate full-width row; larger screens retain an inline action. Shortened redundant copy and kept the Day-7 label on one line. No check-in/ownership/reward rules changed.
- Campaign artwork already used `object-fit: cover`, rather than a distorted fill. Matched its container to the source banner's 760:424 ratio and separated category/status/countdown chips into two tidy rows so text and clock/flame icons are not squeezed over the artwork.
- Visually rechecked the actual shared browser's MAX Pass overview, competitive campaign and Check-in card. The shared player's balance/save was not modified.
- Added browser assertions at 0/1,000/5,000 Pass XP for initial entry, re-entry and reload at scroll position zero, explicit tier navigation and reward/mission switching. Added minimum 44px navigation targets, square icon geometry, roomy Check-in copy and campaign badge/copy separation checks at all three mobile widths.
- Follow-up check remains 0 errors/warnings; all 95 unit tests and production build pass. Main JavaScript is approximately 484.59 kB; the unchanged lazy Three.js chunk advisory remains.
- Final browser rerun with no concurrent source edits: **204 checkpoints PASS**, 73 images and 1 CSS background at 320/375/430px. An intermediate run was interrupted by a destroyed navigation execution context during HUD sampling; the complete clean rerun passed without suppressing the error or weakening assertions.

## 9. Home priority follow-up

- Moved the existing daily Check-in and VIP/Battle Pass status cards to the very top of Home, before the campaign heading, featured carousel and event groups. Their appearance, state and handlers are unchanged; DOM order matches visual/keyboard order.
- Added a persistent browser assertion for Check-in -> player status -> campaign heading -> featured campaign order.
- Focused isolated Chromium checks passed at 320/375/430px: both top sections are visible in the first viewport, no horizontal overflow, VIP opens the Shop VIP tab and Battle Pass opens its real page, with no runtime errors.
- `npm.cmd run check`: 0 errors/warnings; `npm.cmd test`: 95/95 PASS; `git diff --check`: PASS. The earlier full 204-checkpoint result predates this reorder; this follow-up used focused interaction validation rather than claiming another full-suite run.
- The final 204-checkpoint run also verifies the player-specific Home greeting at all three widths.

## 10. Floating navigation follow-up

- Changed Bottom Nav from an edge-attached bar to an inset floating dock: 8px minimum side clearance, 10px bottom clearance plus device safe area, fully rounded corners and soft elevation.
- The selected gold icon lifts slightly within its tab without moving the label or shrinking the touch target. Existing routes, keyboard focus and reduced-motion behavior remain unchanged.
- Focused Chromium validation passed at 320/375/430px: floating bounds, label containment, square icons, minimum 44px targets, no overflow and all five navigation links/active states. Svelte check: 0 errors/warnings. Added dock-inset assertions to the persistent UX runner; no full-suite rerun claimed for this styling-only follow-up.
- The previous player refinement replaced the inset pills with separate floating cards. The latest visual follow-up below supersedes both designs with a full-width, single-surface icon bar inspired by Instagram navigation.

## 11. Energy potion icon & clean separated shop cards follow-up

- Replaced the lightning bolt icon inside `EnergyBadge.svelte`, Shop Energy status and refill modal CTA with the canonical `energyPotion` artwork (`CurrencyIcon kind="energyPotion"`).
- Simplified Shop Gacha Box and cosmetic product cards (`ShopPage.svelte`): removed the nested box-in-box container so each item presents as a clean floating showcase card with an independent action button beneath it, and removed the extra inner border box around Energy potion packs.
- Verified with `npm.cmd run check` (0 errors/warnings), `npm.cmd test` (95/95 PASS) and isolated Chromium checks across 320/375/430px.

## 12. Home avatar and pet greeting follow-up

- Added the equipped Avatar and optional equipped Pet together on Home, before Check-in and VIP/Battle Pass status. Portraits use the existing contained-image/fallback component; the 320px layout reserves space for the speech bubble and truncates long player names cleanly.
- The speech bubble offers tappable conversation lines based on the player's actual Check-in, Energy capacity and VIP status. Tapping the character opens Profile customization; the greeting interaction does not award currency, Energy or mission progress.
- The outer stage has no card border, backdrop or container shadow; only the speech bubble retains a soft, lightweight surface. Tapping the character opens Profile customization.

## 13. Pass purchase showcase and bottom navigation follow-up

- Enlarged the Season Pass final-reward artwork so the featured Nyx Avatar occupies more of the banner, has a dedicated glow and gently zooms in/out. The motion takes 5 seconds per cycle and is disabled by `prefers-reduced-motion`.
- The Premium Pass confirmation now previews the actual season rewards: Nyx as the final-level prize plus a horizontal strip of configured non-Energy reward highlights with their real level numbers. It reiterates that rewards unlock by XP and are manually claimed; opening the dialog does not deduct AIS Points. Existing confirm/purchase and insufficient-balance guards remain unchanged.
- Replaced the five floating navigation cards with one full-width, fixed bottom bar and five icon-only tabs inspired by Instagram's navigation. Accessible names remain on each link, touch targets remain at least 44px, and the page reserves space above the bar.
- Removed the redundant `ACHIEVEMENTS & CHECK-IN` / `ความสำเร็จ & เช็กอิน` title card from the Achievements page; the page starts directly at Check-in and badge content.
- Browser assertions verify the prominent Nyx artwork and reduced-motion behavior, the real Premium reward preview and no-spend-before-confirm behavior, the Home greeting/check-in order and the full-width navigation geometry at 320/375/430px.
- Nyx's portrait now has a subtle 5-second zoom-in/out loop on the Pass banner; the motion is disabled for `prefers-reduced-motion`. The browser suite verifies both motion states.
- Achievements route assertions now target the Check-in section heading instead of the removed page title. Check-in icon geometry accepts sub-hundredth-pixel browser rounding while still detecting actual distortion.
- Latest validation: `npm.cmd run check` (0 errors/warnings), `npm.cmd test` (95/95), `npm.cmd run build` (PASS) and `npm.cmd run test:ux` (204 checkpoints PASS at 320/375/430px).
