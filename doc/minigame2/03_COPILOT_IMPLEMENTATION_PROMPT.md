# Copilot coding prompt — MiniGame2 all-screen Frontend Demo

> **Copy everything inside the prompt block** into your coding agent (GitHub Copilot, GPT-backed Copilot, Codex, etc.) **inside the existing local Masque-center workspace**. This prompt is a reusable baseline; always follow newer explicit user decisions and the implementation state recorded in `COPILOT_HANDOFF.md`.

## Prompt (ready to paste)

```text
Project: MiniGame2 (new product direction), inside the EXISTING Masque-center local repository.

Your mission: IMPLEMENT a functional, clickable frontend-only demo containing the full customer-visible scope through M3, based on the new MiniGame2 requirements. Do NOT build a backend or database and do NOT replace existing playable games.

FIRST, read and follow these docs in order:
1. doc/minigame2/00_READ_FIRST.md
2. doc/minigame2/01_PRODUCT_REQUIREMENTS.md
3. doc/minigame2/02_FRONTEND_DEMO_SPEC.md
4. doc/minigame2/04_ACCEPTANCE_AND_OPEN_ITEMS.md

Canonical original sources: MiniGame2 Google Sheet backlog and the linked full-requirements sections in FigJam (URLs in 00). The new backlog is primary scope; latest explicitly confirmed product decisions refine it. The old ROADMAP.md, README.md, previous UI spec and code are implementation context only, not business-rule authority.

PRE-FLIGHT:
- Inspect the CURRENT LOCAL WORKING TREE (uncommitted changes may be newer than GitHub).
- Describe existing architecture, pages, stores, routes, services, game config and legacy features.
- Confirm the actual stack from package.json: Svelte 5 + Vite + TS + Tailwind 4. DO NOT migrate to SvelteKit just because an older plan mentioned it.
- Identify what already works, what needs to change, what is hidden legacy, and what is genuinely missing.
- Create a short implementation checklist. Then implement, rather than stopping after planning.
- Keep all 7 game catalog IDs, URLs, existing iframe launching behavior, query params (?name=... & ?aispoint=...), deploy base paths and valid local saves.

IMPORTANT PRODUCT RULES:
- All normal games: Energy 1 per entry; VIP exempts NORMAL game entry only. VIP does not cover revive/continue or campaign tickets, and never unlocks Premium Pass rewards.
- Normal Energy MAX 15; active VIP Energy MAX 30. Both regenerate +1 per 30 minutes below the active cap. Purchases/prizes may overflow; do not clamp grant balances. VIP waives normal-game entry only; continue/revive costs 1 Energy and Campaign Ticket is not waived.
- VIP activates immediately; renew while active by adding bought time to old expiry. The demo exposes configurable 6-hour/1-day/3-day duration and AIS Point examples; capacity, entry waiver and regeneration are fixed rules.
- Battle Pass is by CALENDAR MONTH, not old rolling 30-day epoch. Free/Premium share XP/level; Premium purchased late unlocks eligible earlier reward levels, but never gives instant XP. Premium rewards require Premium entitlement, NOT VIP.
- Missions are Free / VIP / Premium, grouped Daily / Weekly / Season. Locked premium/vip missions are visible. On game end show animated mission progress; completed mission XP automatically credits once. Pass level rewards require manual claim while active, with once-only end-season automatic settlement for eligible unclaimed items.
- Rank: HIGH SCORE (never cumulative). Normal game leaderboard is all-time; Campaign leaderboard is separate per campaign AND game. Equal score: earlier achiever wins.
- Campaign gifts: gift button in Ranking opens tier preview; Campaigns have mock `startAt`/`endAt`; after end they auto-award rank prizes once, next app open shows a reward popup, and History records it. Ticket packs use mock AIS Points and are separate from Ranked tickets. Player pages cannot finalize; Developer Studio may force settlement for tests only.
- History: separate tabs Game sessions/counts, AIS Point mock purchases/transactions, Rewards.
- Profile: 2D character art on a simple 3D plane in a room/background; do not build Vease World.
- Hide, do not delete, out-of-scope Vease World, Battle Arena, Private Room and similar features from normal MiniGame2 navigation.

SCOPE / UNKNOWN RULES:
- The MiniGame2 frontend demo uses AIS Point only in customer flows. Preserve legacy MP values/services for old saves but do not display, spend, award or convert them in the demo. Production AIS Point/API/billing policy remains open.
- Production game count/M1 rollout, Campaign Ticket SKU/scope/refunds and campaign URLs still need approval. The demo provides configurable AIS ticket packs and mock timing; do not present them as production contracts.
- Do not invent definitive production pricing, mission XP, badge lists, reward top-N counts or ranking payouts. VIP cap 30 and free normal entry are confirmed; cooldown reductions are not approved. Use labeled demo configurations and fixtures.
- FULL product admin, real anti-cheat, real SSO, real AIS Point transactions and persistent multiplayer are future scope only. No new server, DB, SDK or real payments.

IMPLEMENTATION:
1. Add and wire all main customer-facing pages: Home, Game Hub, Game Detail/Pre-game, Game Player/Results, Ranking, Campaign, Shop, VIP Promotion, Battle Pass, Missions, Inventory/Gacha, Profile/Avatar, History/Notifications.
2. Reuse existing Svelte components/services. Prefer minimal additive, typed changes to existing DemoState and migrations. Preserve legacy localStorage save and write tests for new rules. If a full refactor is unavoidable, justify it before doing it.
3. Make every visible action functional (mock purchase, reward grant, claim, equip, check-in, play, simulate finish, open gift preview, advance mock campaign time/use Developer Studio settlement, switch season, open history); changes must reflect globally in UI and history.
4. Favor Tailwind CSS for styling and clear component states. Keep placeholders until later design pass. Do not create a giant new art system or unnecessary 3D engine right now.
5. Hide obsolete user-facing MP exchange, Ranked Ticket/coupon cabinet, ranked Battle, World/Room and duplicate VIP/Pass representations while preserving legacy services/files where practical.
6. Add reproducible dev-only scenarios to test Energy overflow, VIP renewal, Premium retroactive claims, mission overlays, ranking ties, campaign settlement popup, month change, and History. Dev controls must not appear in the customer nav.
7. Work through all M1–M3 pages; do not stop after Home/Profile. If a requirement is OPEN, use a reversible demo fixture, label it, and log it rather than blocking completion.

QUALITY:
- Run npm run check, npm test, npm run build.
- Add tests for scoring/tie/period separation, Energy regen/overflow, VIP renewal, battle pass month reset & entitlement, mission auto XP, auto rank grant exactly once, notification dismissal and history.
- Check portrait widths 320, 375, 430px, safe area, navigation and game iframe back/reload.
- No dead-end buttons, fake "production-connected" claims, broken import/asset path, or unrelated feature removal.
- Do not write deployment code/backend or actually charge AIS Points.

WORKFLOW:
- Implement the whole functional UI before handing over to Gemini/Argon for graphics.
- Commit logical checkpoints LOCALLY if available; do not push automatically unless I request it.
- When done, CREATE doc/minigame2/COPILOT_HANDOFF.md summarizing: completed screens/flows, mock mechanics, tests/results, changed key files, where visuals/placeholders need improvement, open blockers, and the commit hash if present.
- The Gemini/Argon agent will subsequently inspect and improve the SAME project files directly; it may create graphics, styling and optional lightweight Three.js profile room. You need not screenshot every page or send asset mappings.
- Afterwards I will send it back to Copilot for review/bug fixes. Preserve rules across the visual pass.

Start by inspecting files and making the implementation checklist; then proceed with actual code changes and report results.
```

## After Copilot finishes

Do **not** have Gemini design all pages blindly from a separate text-only draft. Give Gemini/Argon the **local working project plus `doc/minigame2/COPILOT_HANDOFF.md`** and a short instruction:

> Inspect the running MiniGame2 frontend and improve UI/UX, in-place Tailwind styles, graphics, animations and the profile room while keeping every button, route, mock service, entitlement and test behavior intact. Keep source/assets modular and editable. When done, report changed files/visual decisions for Copilot's final verification.

Final reviewer: Copilot inspects Gemini's source diffs, runs tests/build and repairs any behavior broken by presentation changes.
