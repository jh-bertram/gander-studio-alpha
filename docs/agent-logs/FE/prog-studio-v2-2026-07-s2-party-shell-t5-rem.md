## [STAGE 1] RECEIVED
- **From:** ORC (remediation dispatch)
- **At:** 2026-07-08T03:32:26Z
- **Task ID:** prog-studio-v2-2026-07-s2-party-shell-t5-rem
- **Message received:**
  > <remediation_request>
  >   <task_id>prog-studio-v2-2026-07-s2-party-shell-t5-rem</task_id>
  >   <attempt_number>1</attempt_number>
  >   <failing_check>QA (Bundle Size Gate)</failing_check>
  >   <specific_issue>AUD#5 verdict (.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t5-AUD-1783477019.md): production main chunk dist/assets/index-*.js = 1,035.70 kB, over the hard 1000 kB threshold. t5's PAGE_MAP wiring is the sole/first importer of PartyPage (0 refs at HEAD before t5), so the wiring is what pulls the party module subtree into the main chunk.</specific_issue>
  >   <required_fix>Route-level code-split in t5's own file scope: const PartyPage = React.lazy(() => import('../pages/PartyPage')) + a Suspense boundary in packages/client/src/components/ModeContent.tsx (fallback: the design-spec loading treatment — shimmer-box class per the W2 mapping — so the lazy gap renders the spec's loading state, not a blank). Bring the main chunk back under 1000 kB. Alternative (only if lazy is unworkable): manualChunks vendor split. Do NOT take the human-deferral path — the fix is cheap.</required_fix>
  > </remediation_request>
  >
  > ## Authorized file scope
  > packages/client/src/components/ModeContent.tsx ONLY (the lazy const + Suspense live there). If other PAGE_MAP pages would equally benefit, note it in the packet but do NOT convert them (one-packet scope).
  >
  > NOTE: the working tree also carries FE#7's t3-rem changes (PartyMemberCard.tsx + the party e2e spec) — already implemented, audit in flight. Build against the tree as-is; do not touch those files.
  >
  > Verify (record verbatim): npm run build -w @gander-studio/client — report the NEW main-chunk size (must be < 1000 kB) and the new party chunk size; npm run lint x3; npm test -w @gander-studio/client; re-run the party e2e spec headless — all 19 must stay green under lazy loading.
  >
  > ## Out of Scope
  > Everything else; NO git commit. …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-08T03:35:00Z
- **Components to build:** None new. Single file modified:
  `packages/client/src/components/ModeContent.tsx` — convert the static `PartyPage` import to
  `React.lazy(() => import('../pages/PartyPage'))`, add a `Suspense` boundary around
  `<ActivePage />`, and a `ModeContentFallback` component using `ShimmerBox` (existing
  `components/ui/shimmer-box.tsx`) per the W2 Skeleton -> shimmer-box mapping.
- **State design:** No new state. `activeMode` selector unchanged.
- **tRPC wiring:** None (no tRPC calls in this file).
- **A11Y plan:** Fallback carries `aria-busy="true"` + `sr-only` "Loading…" text, matching the
  existing `PartyGridSkeleton` pattern in `PartyPage.tsx`. No new interactive elements, no new
  click handlers — keyboard-equivalent audit and focus-trap preflight N/A.
- **Verification plan:** build (chunk sizes), lint x3, vitest, party e2e spec headless.
### Checkpoint — 03:40:00
- Wrote `packages/client/src/components/ModeContent.tsx` (83 lines, was 61). Constant audit: 0 raw hex, 0 duplicated magic numbers introduced. Next: run build/lint/test/e2e verification.

## [STAGE 3] INTERRUPTED
- **At:** 2026-07-08T03:39:01.844120+00:00
- **Detected by:** agent-stop-checkpoint hook (session ended without Stage 3)
- **Action required:** Re-dispatch FE#8 (canonical: FE#8) for task `prog-studio-v2-2026-07-s2-party-shell-t5-rem`.
  Read `docs/agent-logs/FE/latest.md` before starting — skip completed checkpoints.

**SUPERSEDED** — the stop-hook fired mid-tool-call-sequence (between build and verification
steps, no actual session gap); same agent turn continued and completed all verification below.
No re-dispatch occurred or was needed.

### Checkpoint — 03:55:00
- Ran `npm run build -w @gander-studio/client` twice (reproducible): main chunk
  `dist/assets/index-*.js` = 1,025.44 kB (down from AUD#5's 1,035.70 kB, delta -10.26 kB),
  new `dist/assets/PartyPage-*.js` = 12.06 kB (gzip 4.18 kB) split out cleanly.
  **Main chunk is STILL over the 1000 kB gate by 25.44 kB.** Root-caused via
  `grep -rl "reactflow\|@dagrejs/dagre\|chart.js" src/pages` → GraphPage.tsx and
  ProgramDagPage.tsx both statically import react-flow (large lib), both still in PAGE_MAP's
  static imports. The lazy-split of PartyPage removed exactly what it could (its own ~10-12 kB
  subtree); the remaining ~1025 kB is pre-existing app weight (react-flow, dagre, chart.js,
  etc. across Graph/Programs/Compose/Sessions pages already statically bundled), independent of
  Party. The project's Known-Issues "~700 kB" figure (CLAUDE.md, last touched commit ccf13a6,
  2026-06-20) is stale — the app has grown substantially since then across unrelated sprints.
  Did NOT expand file scope to fix the remaining gap (would require touching
  `vite.config.ts` for manualChunks, or lazy-loading GraphPage/ProgramDagPage/ComposePage —
  all explicitly out of the authorized "ModeContent.tsx ONLY" / "do NOT convert them
  (one-packet scope)" scope). Flagging for ORC rescope per Task Boundary Compliance.
- Ran `npm run lint` (chains 3 tsc --noEmit projects: shared, server, client) → exit 0.
- Ran `npm test -w @gander-studio/client` (vitest) → 6 files, 37 tests passed.
- Ran `npx playwright test tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts --reporter=list`
  headless → 19/19 passed, no spec timing adjustments needed (lazy chunk resolves well within
  existing 8-10s `toBeVisible` timeouts on localhost).
- Constant/style/dedup/JSON.parse/keyboard-equivalent audits on the modified file: all clean
  (0 matches in every grep — no new interactive elements, no JSON.parse, no inline style
  conflicts, no raw hex).

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T04:05:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |---|---|---|
  | `packages/client/src/components/ModeContent.tsx` | 83 (was 61) | React.lazy + Suspense for PartyPage, ShimmerBox fallback |
- **Lint:** exit 0 (3x tsc --noEmit, shared/server/client)
- **Vitest:** 6 files / 37 tests passed
- **E2E:** 19/19 passed, no spec edits needed
- **Bundle gate:** main chunk 1,025.44 kB — improved from 1,035.70 kB but STILL over the 1000 kB
  hard gate. Authorized single-file fix is necessary-but-insufficient; root cause is pre-existing
  app weight (react-flow/dagre in GraphPage + ProgramDagPage, both statically imported),
  unrelated to Party. Escalating to ORC rather than expanding scope.
