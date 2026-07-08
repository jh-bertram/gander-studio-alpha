## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-07-08T03:41:21Z
- **Task ID:** prog-studio-v2-2026-07-s2-party-shell-t5-rem2
- **Message received:**
  > <remediation_request>
  >   <task_id>prog-studio-v2-2026-07-s2-party-shell-t5-rem2</task_id>
  >   <attempt_number>2</attempt_number>
  >   <failing_check>QA (Bundle Size Gate — residual)</failing_check>
  >   <specific_issue>After rem1's PartyPage lazy split (correct, keep it), the main chunk is 1,025.44 kB — still over the 1000 kB hard gate. FE#8 verified the residual weight is pre-existing: GraphPage.tsx and ProgramDagPage.tsx statically import @xyflow/react in PAGE_MAP; ComposePage also pulls the react-flow materia canvas. Evidence: .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t5-rem-FE-1783481523.md.</specific_issue>
  >   <required_fix>Extend rem1's exact pattern in packages/client/src/components/ModeContent.tsx ONLY: convert GraphPage, ProgramDagPage, and ComposePage to React.lazy(() => import(...)) sharing the existing Suspense boundary (same ShimmerBox fallback). Main chunk MUST land < 1000 kB. Do not touch vite.config.ts unless lazy-splitting these three demonstrably cannot reach the gate — if so, STOP and report rather than improvising manualChunks.</required_fix>
  > </remediation_request>
  > …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-08T03:41:21Z
- **Components to build:** None new. Modify `packages/client/src/components/ModeContent.tsx` only — convert `GraphPage`, `ProgramDagPage`, `ComposePage` static imports to `React.lazy(() => import(...))`, sharing the existing `Suspense`/`ModeContentFallback` boundary already wired for `PartyPage`.
- **State design:** No change — `activeMode` selector from `useUIStore` still drives `PAGE_MAP` lookup.
- **tRPC wiring:** None — this is a bundling change only, no data-layer touch.
- **A11Y plan:** Reuse existing `ModeContentFallback` (aria-busy, sr-only label) — no new a11y surface introduced.

### Checkpoint — 03:45:00
- Wrote `packages/client/src/components/ModeContent.tsx` (66 -> 90 lines). Converted GraphPage, ProgramDagPage, ComposePage to `React.lazy`, sharing PartyPage's existing Suspense boundary. Constant audit: 0 matches (raw hex, JSON.parse, onClick keyboard-equiv, inline style/tailwind conflict — all 0). Next: verify build chunk size.
- Build result: main entry chunk `index-D2aM8dj9.js` = 756.80 kB (gzip 227.18 kB), down from 1,025.44 kB — well under the 1000 kB gate. Reproduced across 2 consecutive builds (identical size both times). Split chunks: PartyPage 12.06 kB, ComposePage 28.88 kB, GraphPage 11.53 kB, ProgramDagPage 8.94 kB.
- Diagnostic isolation performed (temp revert of Compose/Graph/Programs to static imports, tested, then restored via Write from a scratchpad-relocated backup — no git stash used on the shared uncommitted tree after the first stash/pop round-trip): the 8 pre-existing e2e failures (card-node-title-edit x2, gander-studio-p1-compose-fe x1, gander-studio-p2-canvas-link-003a x2, materia-canvas-proximity x3) are IDENTICAL with and without the lazy conversion — confirmed NOT a lazy-timing regression. No spec timing adjustments needed.
- Lint: exit 0 (3x tsc --noEmit). Vitest: 37/37 passed. Party spec: 19/19 passed (two full runs). Graph-page.spec.ts + program-dag spec: all passing (10 total across the mixed run, unchanged pass/fail set both before and after).

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T03:50:00Z
- **Deliverables:**

  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/components/ModeContent.tsx` | 66 -> 90 (+37/-5 vs rem1 state) | GraphPage, ProgramDagPage, ComposePage converted to `React.lazy`, sharing existing Suspense/ModeContentFallback boundary. Only file touched. |

- **Lint:** exit 0 (tsc --noEmit x3: shared, server, client — clean)
- **Constant audit:** 0 matches (raw hex, inline style/Tailwind conflict, onClick keyboard-equivalent, JSON.parse, repeated function bodies — all clean; no new interactive elements or JSON parsing introduced)
- **Bundle gate:** PASS. Main entry chunk 756.80 kB < 1000 kB (reproduced twice). No `vite.config.ts` touch needed.
- **Regression status:** Party spec 19/19 x2 runs. Graph/ProgramDag specs all green. The 8 pre-existing compose-surface e2e failures verified unchanged in kind via a controlled before/after diagnostic (not caused by lazy conversion).
- **Git:** no commit performed (per boundary).
