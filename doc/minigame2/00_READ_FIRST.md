# MiniGame2 — READ FIRST (requirements → frontend demo)

**Status:** Product scope + frontend-only implementation brief. **Updated:** 2026-11-04. **Audience:** coding agents, UX/visual agents, product reviewers.

> IMPORTANT: This is a NEW product direction layered onto an OLD working prototype. Do not treat the existing README, ROADMAP.md, or code defaults as approved MiniGame2 business rules. Preserve the existing application and game URLs. Do not implement backend, database, production payments, real AIS integration, or real anti-cheat.

## Read order (use exactly this order)

1. **[01_PRODUCT_REQUIREMENTS.md](./01_PRODUCT_REQUIREMENTS.md)** — what the real M1–M3 MiniGame2 product should do; what is confirmed versus open.
2. **[02_FRONTEND_DEMO_SPEC.md](./02_FRONTEND_DEMO_SPEC.md)** — what the all-M3 frontend prototype should simulate, show, and hide.
3. **[03_COPILOT_IMPLEMENTATION_PROMPT.md](./03_COPILOT_IMPLEMENTATION_PROMPT.md)** — ready-to-paste instructions for the coding agent.
4. **[04_ACCEPTANCE_AND_OPEN_ITEMS.md](./04_ACCEPTANCE_AND_OPEN_ITEMS.md)** — required checks, specific discrepancies, deferred decisions.
5. Existing repository files — code as the implementation baseline, **not** as policy authority.

## Canonical sources and precedence

1. **Primary scope:** [MiniGame2 Backlog spreadsheet](https://docs.google.com/spreadsheets/d/1xpwFzYSs1aRP6qDwJbyKe0Q0wESwZFoGGpOP34TI_4c/edit) `Backlog` + `Timeline&Milestone` (M1 around March 2027; M2 July 2027; M3 November 2027 — exact dates TBD).
2. **Latest explicit product decisions** from the November 4, 2026 requirement conversation, recorded here as **CONFIRMED**.
3. [Detailed Full Requirements on the existing FigJam](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=11213-12386), including the detailed cards for [player surfaces](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=11215-12397), [economy](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=11216-12425), [pass and missions](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=11217-12461), [campaigns](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=11219-12489), [flows/issues](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=11220-12525).
4. Existing [roadmap/matrix/flow on FigJam](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=11204-12157), then older `ROADMAP.md` and repository implementation.

**Conflict rule:** Spreadsheet defines which product capabilities belong to which milestone. Explicitly confirmed later clarifications refine behavior. A FigJam card or old prototype value **does not turn an unresolved detail into a confirmed decision**. If the sources conflict, record it in 04, do not silently guess.

## Meaning of status labels

- **CONFIRMED:** explicitly agreed product behavior or plainly stated in the new primary Backlog.
- **DEMO DEFAULT:** safe placeholder chosen only to make the frontend demo interactive; replaceable/configurable; not a production decision.
- **PROPOSED:** sensible UX/product option, pending approval.
- **OPEN:** must discuss; do not invent a production contract, permanent SKU/pricing, or backend API.
- **HIDDEN LEGACY:** code/function remains available for later, but not exposed in the MiniGame2 user journey.

## Scope boundary

**Product Full Requirements** may include admin, API, game SDK, persistent score, campaign settlement, wallet/ledger, and anti-cheat. They describe the desired future full system. **Current deliverable is FRONTEND DEMO ONLY**, complete clickable M1–M3 experience in the existing app, backed by mock data/local state. No server or persistent multi-user data. Do not claim simulated results are secure, authoritative, or available across devices.

Existing stack (verified in GitHub): **Svelte 5 + Vite + TypeScript + Tailwind CSS 4**, not SvelteKit. Respect existing root `src/`, `src/lib/pages`, `src/lib/services`, `src/lib/data`, `public/games.json`, `apps/masque-vease` and deployment base paths. Agents can improve implementation structure but should not migrate the app framework just because an earlier conversation mentioned SvelteKit.

## Handoff / workflow

1. **Copilot coding agent** inspects existing local files (which may be newer than GitHub), builds a functional frontend experience covering all planned pages through M3, and leaves design-friendly placeholders where necessary.
2. **Gemini/Argon visual agent** inspects the running app and modifies its UI/assets directly (including optional lightweight Three.js presentation), while preserving all business behavior and routes. No mandatory screenshot/asset-mapping relay.
3. **Copilot coding agent** reviews Gemini changes, fixes regressions, and runs checks. Commit checkpoints locally; pushing is optional unless requested.
4. Work in the *same local project*. Preserve existing 7 game integrations and all working mock actions. Do not delete legacy features just to hide them.

**IMPORTANT:** This document alone does not authorize implementation changes. The user's explicit November 4, 2026 functional-audit request authorizes the scoped frontend fixes and documentation updates; do not expand beyond that request.
