# MiniGame2 Final Functional Regression Review

Date: 2026-11-04
Design baseline: local commit `3a12476` (Gemini/Argon Visual Refinement Round 2).
Initial working tree: clean, `main` ahead of origin by 7 commits.
Delivery: local commit only; no push. See Git history for this report's commit.

## Result

| Area | Result |
| --- | --- |
| Frontend functional regression | PASS after fixes below |
| Automated tests | PASS: 85 tests, baseline 71 |
| Svelte/TypeScript check | PASS: 0 errors, 0 warnings |
| Production build | PASS: 4,256 modules; existing Three.js chunk-size advisory |
| Mobile browser regression | PASS: 87 route/width views at 320/375/430px |
| Design/assets/animations/Profile room preservation | PASS; no rebuild or asset replacement |
| Official AIS/myAIS icon provenance | NOT VERIFIED: Brand Verification Pending |
| Live myAIS payments/WebView and remote-game result integrity | NOT VERIFIED; frontend demo only |

No unresolved blocking frontend failure was observed in the exercised flows.
This is not production certification or an assertion that every remote game's internals were tested.

## Confirmed Findings And Fixes

1. Day-7 UI promised a Pet Box while the Achievement definition granted Energy +5. Changed the definition to one Pet Gacha Box; kept the canonical Badge/claim ledger and separate Pass XP. Tested grant, History, opening, reload and repeated-event idempotence.
2. New Year countdown recomputed `now + 11 days`, so it never decreased, and advertised Celestial rewards with no matching grant. Retained the fourth artwork/card/CTA as an explicit season-mission preview, linked to real missions and the actual season end. No invented Campaign or reward table was added.
3. External Campaign with no reward configuration displayed a fallback Pet Box reward. It now states that no prize is announced. Upcoming/ended CTAs use detail actions; missing external URLs remain non-launchable and free of resource charges.
4. Frame acquisition labels claimed unconfigured Achievement/Top-1/seasonal rewards. Corrected labels to actual Shop/Pass/Campaign channels; did not create unapproved rewards.
5. Frame equip checked only inventory membership, not catalog validity; missing old frame fields were not normalized. Added catalog guards to equip/purchase and safe migration of absent/invalid equipped frames. Verified all five IDs, ownership/rewards/purchases and persistence.
6. Pass header/track displayed 0% at MAX and artificial progress at zero. Added display percentage to the existing progression helper; MAX is 100%, zero is 0%, with XP/level/cap rules unchanged.
7. Campaigns with no earned prize (including an unrelated external placeholder) queued misleading reward-credit popups. Suppressed empty Campaign prize notifications, retained settlement History and made shared notification copy neutral. Genuine grants/notifications remain once-only.
8. Achievement navbar text exceeded its own tab at 320px. Reduced only fixed label typography, retaining icons/layout; measured every label within its tab at all three widths.
9. Purchase testing had no permitted balance fixture. Added an explicitly developer-only myAIS snapshot import in Demo Studio, with numeric limits and development guards. It replaces a QA wallet snapshot, never grants a game reward or writes a reward receipt. No customer top-up or URL seed was restored.

## Browser Evidence

- General matrix: Hub, Home, Shop, Achievement, Pass, Missions, Profile, normal Ranking, Campaign list, all three configured Campaign details, VIP, Inventory and History at each width: 45 views.
- Game matrix: all seven Game Detail and session Player routes at each width: 42 views. Configured iframe URLs were unchanged. Back returns correctly; session reload/reuse does not charge again.
- No document horizontal overflow or uncaught application error in those matrices. Checked screenshots of Home 320px, Missions 375px and Profile 430px. Navbar text bounds also measured independently of document overflow.
- Empty hash opens Hub; Home bottom link and explicit deep links work. All four dashboard CTAs reach their correct destination; external placeholder button is disabled and leaves Energy/Ticket/AIS unchanged.
- Prepared a six-day Check-in fixture, claimed day seven: Energy 15 -> 18, one Pet Box, one streak Badge, AIS unchanged. Reload retained one Box; opening consumed it and created History. Success and Achievement notification dialogs closed correctly.
- Purchased five frames in Shop: AIS 1000 -> 950 -> 870 -> 790 -> 570 -> 410. Equipped Celestial, saved/reloaded; Profile/Header retained it. Locked Krathong preview did not replace the equipped frame. Badge pin persisted using the same earned Badge collection.
- Normal Ranking mock podium displayed Celestial/Sunrise/Krathong. Current-player row used the saved Celestial frame, not a rank-assigned bot frame. Campaign rows also use current Profile state.
- Frame files exist at their configured paths; all five 512x512 images have alpha 0 at the center, leaving Avatar art visible.
- All nine Daily/Weekly/Season x Free/VIP/Premium filter combinations checked. VIP purchase debited 50, unlocked VIP missions only; Premium stayed locked. Separate Premium purchase debited 200 without XP gain.
- At XP 1000, claimed 10 Free rewards with no AIS gain. Purchased Premium separately and claimed 10 retroactive Premium rewards; reload preserved 20 claims and disabled Claim All. MAX header and track both report 100.
- Ticket pack debited 100 AIS and added five Campaign Tickets. Confirmed entry consumed one ticket, no Energy; reload did not consume another. Simulated result remained in Campaign+Game scores, not normal all-time scores.
- Expired Campaign scenario automatically settled once: one settlement History record/notification, same AIS and reward balance after reload. Calendar rollover created a new season with XP 0 and one Pass settlement notice.
- Profile canvas: 25/25 sampled points nontransparent at each width, screenshot framing and pointer response inspected. Forced WebGL creation failure showed visible 2.5D Avatar/Pet fallback. The Three.js console error during that forced failure was expected, not an uncaught app failure.
- Held an iframe request to simulate a stalled host: fallback appeared, Retry issued a second request without charging Energy, and Back worked. This tests launcher controls, not actual remote gameplay.
- Production preview: `#admin` redirected to `#hub`; no fixture heading/button, and `?aispoint=999999` left balance at 0. No Three.js chunk loaded on Hub; it loaded only on Profile, whose canvas/assets rendered. Temporary preview was stopped and task config removed.

## Automated Coverage

`npm test`: 85/85 across two existing test files. Added coverage for five frame grants/purchases/equips/persistence, legacy/invalid frame state, default hash/deep links, Campaign CTA/countdowns, all mission periods/entitlements, development snapshot guard, Pass percentages and Campaign tie-breaking/game isolation. Extended existing Day-7, no-AIS-mint and settlement-notification assertions.

`npm run check`: 0 errors, 0 warnings. Svelte MCP reported no issues in touched components (optional existing-style suggestions only).

`npm run build`: successful. Main JS about 449 kB; lazy Three.js chunk about 733 kB. Vite's standard >500 kB chunk advisory remains; no dependency upgrade or renderer rewrite was performed.

## NOT VERIFIED And Production Recommendations

- **Brand Verification Pending:** the current AIS coin is hand-authored SVG rasterized by `scripts/generate-round2-assets.mjs`, not an asset with demonstrated AIS approval. Colors, a P/leaf symbol and a myAIS badge do not establish authenticity. Obtain official artwork, provenance and usage rules from the AIS brand team; replace only the currency asset after approval.
- No real myAIS SDK/SSO/WebView wallet synchronization, authorization, transaction receipts, atomic debits, refunds, anti-cheat or trusted result submission exists. Server-authoritative balances/inventory/claim receipts are required before production. Browser storage and development guards are not security boundaries.
- Actual gameplay and result/continue integration inside each remote host were not certified. Launcher URL, simulated result, stalled-host fallback/retry and return behavior were tested separately.
- Physical Android/iOS WebViews, device GPU/memory budgets, accessibility assistive technologies and network recovery/refunds need real-device testing. Preserve lazy loading and profile renderer disposal; optimize Three.js only against measured budgets.
- The fourth New Year card remains a season preview. Marketing must supply a real event schedule/reward contract before it is represented as a live standalone Campaign. Bot frames are mock presentation, not automatic ranking prizes.
- Historical players who already earned the seven-day Badge under the previous Energy reward keep their existing claim. No automatic replay/backfill was invented; any retrospective Box compensation needs an explicit versioned receipt/migration policy and product approval.
- Final production prices, odds, mission/reward tables and asset licenses remain subject to approval. Do not push this local review commit without the user's instruction.