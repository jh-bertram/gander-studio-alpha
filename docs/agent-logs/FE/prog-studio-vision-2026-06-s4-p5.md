## [STAGE 3] COMPLETE
- **At:** 2026-06-20T20:17:45Z
- **Deliverables:**

| File | Lines | Notes |
|---|---|---|
| `packages/client/src/pages/ProgressionPage.tsx` | 500 | Full character-sheet rewrite; XpBar + useCountUp + level-up-flash |

- **Lint:** Deferred to auditor (sibling agents editing concurrently per brief)
- **Constant audit:** 0 raw hex matches; SURFACE_COLORS tokens only; `var(--my)` for gold; no `@keyframes` in component file (count=0 confirmed)
- **Render-loop probe:** No Zustand selector used (no audio on this page); `useMemo` returns stable primitives; `useCountUp` uses local `useState`/`useRef` only — no per-frame re-subscription to any store
- **A11Y:** XP bars carry `role="progressbar"` with `aria-valuenow/min/max/label`; `SprintEntry` keeps `role="listitem"` + `tabIndex=0` + extracted `onEntryFocus`/`onEntryBlur` named handlers; `h2` semantics restored for section headings
- **Style conflict check:** NONE — no Tailwind classes used (pure inline styles matching existing page conventions)
- **Reduced-motion:** `prefersReducedMotion()` gates count-up rAF (final value instantly) and XP bar CSS transition (`transition: 'none'`); `level-up-flash` reduced-motion suppression already in globals.css `.level-up-flash { animation: none; background: transparent }`

### Checkpoint — 20:17:45
- Wrote `packages/client/src/pages/ProgressionPage.tsx` (500 lines). Constant audit: 0 raw hex found. `@keyframes` count: 0. No render loop (no store selector used). Next: write output packet.

## [STAGE 2] PLAN
- **At:** 2026-06-20T20:15:00Z
- **Components to build:**
  - `packages/client/src/pages/ProgressionPage.tsx` — full rewrite of existing file with:
    1. `XpBar` component-local subcomponent: proportional fill bar with count-up animation
    2. `SprintEntry` enhanced: `level-up-flash` CSS class applied when `levels_advanced.length > 0`
    3. `ProgressionPage`: updated surface summary grid with XP bars + count-up totals
  - `packages/client/src/constants/progression.ts` — add `MAX_XP_PER_SURFACE` or similar if needed (likely not — bars will be relative to the max in the dataset)
- **State design:**
  - NO new Zustand state; `useUIStore.getState()` not needed here (no audio)
  - `prefers-reduced-motion` detected via `window.matchMedia('(prefers-reduced-motion: reduce)')` in a `useEffect` ref check
  - Count-up: `useRef` for RAF handle, `useState` for displayed count — component-local only
  - XP total per surface computed via existing `surfaceCounts` useMemo
- **tRPC wiring:** Existing `trpc.progression.getLedger.useQuery()` — no change
- **A11Y plan:**
  - XP bars: `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax`, `aria-label` with surface name
  - Count-up values: `aria-live="off"` (value announced on mount completion via ref)
  - `level-up-flash` class applied to SprintEntry wrapper div
  - All interactive `div[role=listitem]` keep existing `tabIndex=0` + focus/blur handlers
- **Constant audit:** No raw hex; SURFACE_COLORS tokens only; `var(--my)` for gold elements

## [STAGE 1] RECEIVED
- **From:** orchestrator (prog-studio-vision-2026-06 s4-juice-pass)
- **At:** 2026-06-20T20:14:33Z
- **Task ID:** s4-p5
- **Message received:**
  > s4-p5: turn ProgressionPage into a character sheet. Make REAL edits to packages/client/src/pages/ProgressionPage.tsx ONLY (+ a component-local child if needed). Add (behind p1 mute/reduced-motion guards): XP bars, a count-up animation (JS/requestAnimationFrame, component-local; under reduced-motion show final values instantly), and a 'LEVEL UP' gold flash on entry.levels_advanced (use p1's level-up-flash keyframe class). Data flows via trpc.progression.getLedger — no new persistence. Stable Zustand selectors only. Legibility SC: XP units/values readable, no clipping, AA contrast. Do NOT edit globals.css. Do NOT run full npm run lint while sibling agents edit concurrently; the auditor lints after. Do NOT edit globals.css (p1 owns all keyframes — reference them by class). Write packet to /home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/prog-studio-vision-2026-06-s4-progression-{ts}.md …[truncated]
