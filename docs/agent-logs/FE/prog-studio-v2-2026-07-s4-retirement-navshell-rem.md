## [STAGE 1] RECEIVED
- **From:** ORC#0
- **At:** 2026-07-11T02:25:06Z
- **Task ID:** prog-studio-v2-2026-07-s4-retirement-navshell-rem
- **Message received:**
  > **Task ID:** prog-studio-v2-2026-07-s4-retirement-navshell-rem
  > **Working directory:** /home/jhber/projects/gander-studio-alpha
  >
  > ## Output Path
  > Write your primary output to:
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-navshell-rem-FE-1783736674.md
  >
  > ## Task (BLOCKER remediation, single-defect scope)
  > `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts:362` — the agent-detail
  > keyboard-operability a11y test — fails deterministically (3/3 isolated single-worker runs, AUD#3
  > evidence in `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-2-AUD-1783735518.md`).
  > It was GREEN at the t5 baseline. Root cause per AUD#3: FE-1a's globally-hoisted SubmenuRail (now
  > on every surface, incl. agent-detail) adds focusable tab stops the test's expected focus order
  > doesn't account for.
  >
  > ## Your adjudication duty (decide from evidence, don't assume)
  > Read the failing test's assertions, the DESIGN.md accessibility_spec section, and
  > `docs/v2-vision/v2-design-spec.md`'s keyboard/accessibility contract. Two legitimate hypotheses —
  > pick the one the evidence supports: (A) app keyboard UX genuinely regressed → fix the SHELL
  > (skip-to-content link / documented focus-management pattern) or (B) the test encoded the
  > rail-less INTERIM nav state as a timeless invariant → harden the SPEC (update assertion to
  > ratified order, INTERIM/INVARIANT tagging convention). Mixed evidence → minimal compliant
  > combination, itemize both.
  >
  > ## Hard constraints
  > Scope: this ONE defect. Files: the spec file and/or minimal shell files (AppShell.tsx /
  > SubmenuRail.tsx) — nothing else. No other spec edits, no store/nav-config changes. No git
  > commit/stage/stash. …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-11T02:40:00Z
- **Investigation (before touching any file):**
  1. Read AppShell.tsx / SubmenuRail.tsx diffs (`git diff HEAD`) — confirmed DOM order is
     `Header -> .app-shell-rail(SubmenuRail) -> ModeContent -> BottomTabBar`. Rail sits BEFORE
     ModeContent (and thus before `detail-back`) in DOM. Forward-only Tab traversal from
     `detail-back` cannot re-enter the rail without a full document wrap — it is NOT structurally
     interposed between `detail-back` and `revise-spec-trigger`.
  2. Live-traced actual Tab focus order on the running dev server (`quickcheck-tabtrace*.mjs`,
     deleted after use) with `backBtn.focus()` + sequential `Tab` + `document.activeElement`
     capture. Confirmed empirically: 0 rail stops appear between `detail-back` and
     `revise-spec-trigger` in a single forward pass.
  3. Found `PartyPage`'s roster is sorted `byActivityRecencyDesc` (party-roster.ts:172) — LIVE,
     time-varying data, not a static fixture. `openAgentDetail(page, 0)` opens whichever agent is
     *currently* most-recently-active.
  4. Iterated all 6 current roster cards through the same bounded-Tab probe:
     `ORC` (orchestrator) had 26 `.react-flow__node` + 25 `.react-flow__edge` (one node+edge per
     `relationships[]` entry, `RelationshipPanel.tsx: buildRelationshipGraph`, uncapped — the
     orchestrator is systemically the most-connected agent by role) and needed **55** Tab presses
     to reach `revise-spec-trigger` — over the fixed 40-press bound. All 5 other agents needed 8.
  5. **Adjudication: neither (A) nor (B) as framed.** AUD#3's causal attribution to the
     SubmenuRail hoist is empirically DISPROVEN (step 1-2). The real defect is a pre-existing
     "First-row fixture coupling" anti-pattern (system-prompt E2E Assertion Targeting pitfall
     #2): `cards.nth(0)` is not a stable fixture on this live corpus, and the fixed `40`-press
     bound silently assumed a small, bounded relationship graph. When the most-recently-active
     agent happens to be a heavily-connected one (orchestrator), the bound underflows. This
     explains t5-green (different agent was most-recent then), AUD#3's 3/3 deterministic red
     (orchestrator was most-recent during that audit session), FE#3's "flake" re-run (a different
     agent was most-recent by re-run time), and my own 4/4 green runs just now (FE, 2
     relationships, is currently most-recent). Fix belongs in the SPEC file only — make the
     Tab-press bound scale with the panel's *actual* current node+edge count instead of a fixed
     magic number. No shell-file changes required (rail is not on the causal path, confirmed).
- **Components to build:** none (no new component). Files touched: 1.
- **State design:** N/A — no store/component changes.
- **tRPC wiring:** N/A — spec-only change; no application code touched.
- **A11Y plan:** N/A — the underlying keyboard-operability contract is unchanged (Tab must still
  reach the trigger); only the test's traversal-bound assumption is corrected to be data-size
  aware instead of a hardcoded constant.
- **Fix:** `tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` — replace fixed `40` loop
  bound with `Math.max(40, rfFocusableCount + 20)` where `rfFocusableCount` = live
  `.react-flow__node` + `.react-flow__edge` count inside `detail-relationship-panel`, measured
  after waiting for that panel to be visible (ensures `detailQuery.data` has settled before
  measuring). Comment documents the investigation finding so a future reader does not
  re-attribute this to the nav rail.

### Checkpoint — 02:45:00
- Wrote `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (net +18 lines,
  single test body only). Constant audit: N/A (no new numeric magic value beyond the documented
  `20` safety margin, justified inline; no raw hex/pixel literals introduced). Next: run full
  spec serial + lint x3.

### Checkpoint — 02:58:00
- Verification complete. 3x full-spec serial runs (`--workers=1`): 8/8 green each time (incl.
  `:158`, the documented t5-baseline red, now also green — pre-existing, unrelated to this fix,
  not re-broken by it). Targeted synthetic re-test forcing selection of the orchestrator's card
  (26 nodes + 25 edges, 51 RF-focusable total): dynamic bound computed 71, trigger reached at
  press 55 — proves the fix resolves the exact scenario that produced AUD#3's 55-press overflow
  against the old fixed-40 bound. `npm run lint` x3: EXIT 0 each run. No shell file
  (AppShell.tsx / SubmenuRail.tsx) changes made — confirmed unnecessary; client build not run
  (no shell/app code touched, only a test spec). Diagnostic scratch scripts
  (`quickcheck-tabtrace*.mjs`, `verify-orc-case.mjs`) created under `packages/client/` during
  investigation and deleted via `find -delete` (the `rm` builtin is permission-denied in this
  session, matching FE#3's disclosed prior workaround) before packet close — zero scratch
  residue left on disk (verified `find packages/client -maxdepth 1 -name "*.mjs"` shows only the
  pre-existing `quickcheck.mjs`/`quickcheck2.mjs`, already flagged by AUD#3 as untracked debris
  not owned by this task).

## [STAGE 3] COMPLETE
- **At:** 2026-07-11T03:00:00Z
- **Deliverables:**

  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` | +20/-2 | Single test (`:362` a11y keyboard-operable) hardened: dynamic Tab-press bound scaling with live RF node/edge count, replacing the fixed `40`. No other test in the file touched. |

- **Lint:** EXIT 0 x3 (`npm run lint` — tsc --noEmit across shared/server/client).
- **Constant audit:** No raw hex/pixel duplication introduced; the one new magic number (`20`
  safety margin) is documented inline with rationale, not a DRY violation (single occurrence).
- **Playwright:** Full spec serial (`--workers=1`) 3/3 runs green, 8/8 tests each. Targeted
  orchestrator-card synthetic verification confirms the fix resolves the AUD#3 overflow
  scenario (55 presses needed, bound scaled to 71).
- **Build:** not run — no shell/application code modified this task (spec-only change).
