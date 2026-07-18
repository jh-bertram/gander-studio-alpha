## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-07-18T04:20:37Z
- **Task ID:** prog-studio-v2-2026-07-s5-integration-t1
- **Message received:**
  > You are FE#1 for task `prog-studio-v2-2026-07-s5-integration-t1` in `/home/jhber/projects/gander-studio-alpha`.
  >
  > ## Task
  > Build the safe-focus default into the shared `ui/` Dialog wrapper and migrate its sole consumer (`ReviseSpecAction.tsx`) to it. Your COMPLETE task packet — description, verified ground facts, success criteria SC-1a..SC-1f, context files, and EXPLICITLY OUT OF SCOPE — is the `<task_packet>` with your task_id in:
  >   `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-PM-1784347058.md`
  > Read that packet FIRST and follow it verbatim — it is the single source of truth for this task. Then read the amendment (SC-1e was tightened; the SC-label crosswalk is authoritative):
  >   `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-amend1-PM-1784348182.md`
  >
  > ## Environment notes
  > - Dev servers are ALREADY RUNNING: API :3001, Vite :5173 (Playwright `reuseExistingServer` will pick them up).
  > - e2e invocation: run from `packages/client` with plain `npx playwright test` (same invocation as the s5 baseline capture). Baseline artifacts (the regression control):
  >   `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-green.txt` (82 tests)
  >   `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-red.txt` (43 tests)
  >   Zero NEW regressions = every baseline-green spec stays green. Baseline-red specs are pre-existing, not yours — but never relabel a NEW failure "pre-existing" without the stash-A/B baseline-bisect receipt (standards.md).
  > - The s3-drilldowns suite is your functional guard: baseline-green 8/8; report your observed count.
  >
  > ## Task boundary
  > Your task_id is `prog-studio-v2-2026-07-s5-integration-t1` ONLY. Do not touch RelationshipPanel.tsx (t2), the hygiene comment files (t3), or deferred-work.md (t4). …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-18T04:24:00Z
- **Ground facts confirmed live (re-grepped, matches PM):**
  - `dialog.tsx`: `initialFocus` count = 0, `?? false` count = 0 (baseline confirmed)
  - `ReviseSpecAction.tsx`: `hasFocusedOnOpenRef` count = 5 (lines 94,97,101,110,114 — PM cited 3 of these; comment at 94 + reset at 101 also present, all 5 must go)
  - `ui/dialog` consumers: exactly ReviseSpecAction.tsx:12 (grep-confirmed)
  - `ui/popover` consumers: zero (grep-confirmed) — going with ACCEPT path (ii), no popover.tsx code change
  - e2e baseline: 82 green (incl. s3-drilldowns 8/8, 0 in red) — regression control
- **Components to build/modify:**
  - `packages/client/src/components/ui/use-dialog-safe-focus.ts` (NEW) — `useDialogSafeFocus(focusTargetRef, ready, open)` hook: reset-on-close `useEffect` + once-per-open `useLayoutEffect`, extracted from ReviseSpecAction's inline block.
  - `packages/client/src/components/ui/dialog.tsx` (MODIFY) — `DialogContent` gains `focusTargetRef` / `focusOnReady` / `open` props; defaults `initialFocus` to `() => focusTargetRef.current ?? false` when target supplied and no explicit `initialFocus`; calls `useDialogSafeFocus` internally.
  - `packages/client/src/components/detail/ReviseSpecAction.tsx` (MODIFY) — remove inline `hasFocusedOnOpenRef`/reset-effect/layout-effect block + explicit `initialFocus`; pass `focusTargetRef={textareaRef}`, `focusOnReady={!isLoading && !loadError}`, `open={open}` to `<DialogContent>`; keep `finalFocus={triggerRef}` explicit (unchanged, not in scope of the default).
- **State design:** No new Zustand/store state. Focus-guard state (`hasFocusedOnOpenRef`) moves from ReviseSpecAction's component scope into the new hook's internal `useRef`, instantiated per-`DialogContent`-mount.
- **tRPC wiring:** none touched (out of scope — behavior-only refactor).
- **A11Y plan:** Preserve existing `role="dialog"` `aria-modal="true"` on DialogContent (ReviseSpecAction passes these explicitly, unchanged). Preserve `finalFocus={triggerRef}` return-to-trigger behavior. No new interactive elements requiring keyboard handlers.
- **Popover decision:** ACCEPT (ii) — zero consumers grep-confirmed; no code change to popover.tsx; record evidence-backed ACCEPT in ui_packet.
- **e2e:** run `npx playwright test tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (t1's functional guard) and full suite from `packages/client`, compare vs baseline-green.txt (82) / baseline-red.txt (43).

### Checkpoint — 04:26:30
- Wrote `packages/client/src/components/ui/use-dialog-safe-focus.ts` (41 lines). New hook, no constant duplication (no raw literals). Next: modify dialog.tsx.
- Wrote `packages/client/src/components/ui/dialog.tsx` (modified DialogContent, +~35 net lines). Constant audit: 0 raw hex, 0 duplicated magic numbers. Next: migrate ReviseSpecAction.tsx.

### Checkpoint — 04:29:00
- Wrote `packages/client/src/components/detail/ReviseSpecAction.tsx` (migration: removed `hasFocusedOnOpenRef`/reset-effect/layout-effect block + inline `initialFocus`, added `readyToFocus` + wrapper props `open`/`focusTargetRef`/`focusOnReady`; net -18 lines). Constant audit: 0 raw hex, existing ACCENT_BORDER_PX/ACCENT_PADDING_LEFT_PX/DIALOG_MAX_WIDTH_PX/EDITOR_MIN_HEIGHT_PX constants untouched, no new duplicated literals introduced. Next: run grep audits, typecheck, build, e2e.

### Checkpoint — 04:35:00 — audits + verification
- Constant/style/JSON.parse/click-handler-keyboard audits: all 0 matches across the 3 files (dialog.tsx, use-dialog-safe-focus.ts, ReviseSpecAction.tsx).
- SC-1a: `initialFocus` count=5, `?? false` count=1 in dialog.tsx (baseline both 0). SC-1c: `hasFocusedOnOpenRef` count=0 in ReviseSpecAction.tsx (baseline 5, incl. 1 comment mention PM didn't count). SC-1d: popover.tsx `initialFocus` count=0, zero consumers reconfirmed — ACCEPT path.
- Canonical 3-package tsc: all 3 exit 0. `npm run build -w @gander-studio/client`: success, max chunk 407.00 kB (unchanged from documented baseline, no new Vite warning).
- e2e: s3-drilldowns 8/8 green (baseline 8/8). Full suite: 82 passed / 43 failed — matches baseline counts (82 green/43 red) exactly EXCEPT one swap: `s2-d4-prose-slug.spec.ts:133` (baseline-red) now passed (improvement/flake, not investigated further — not a regression), and `s2-d3-session-buffer.spec.ts:151` (baseline-green) failed in my run — NOT in baseline-red, so ran the required stash-A/B baseline-bisect receipt.
- **Baseline-bisect receipt:** self-scoped `git stash push -u -- dialog.tsx ReviseSpecAction.tsx use-dialog-safe-focus.ts` (NOT whole-tree; left docs/sibling-agent in-progress files untouched) → ran `npx playwright test tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts` on baseline code → 2 FAILED (same locator `sessions-detail-page` not visible, same error) → `git stash pop` restored my 3 files exactly → reran same spec with my diff applied → same 2 failures, identical error. Verdict: BASELINE-RED, reproduces without my change — pre-existing/flaky fixture-row test (unrelated to Dialog/ReviseSpecAction; test spec itself has zero references to revise/dialog), NOT induced by t1. Not attributable to this task; unrelated to t1's scope.
- Post-restore reconfirmation: `initialFocus`=5, `?? false`=1, `hasFocusedOnOpenRef`=0 all hold; s3-drilldowns rerun 8/8 green; tsc x3 all exit 0.

## [STAGE 3] COMPLETE
- **At:** 2026-07-18T04:40:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/components/ui/use-dialog-safe-focus.ts` | 44 (new) | `useDialogSafeFocus` hook — reset-on-close + once-per-open deterministic focus, extracted from ReviseSpecAction |
| `packages/client/src/components/ui/dialog.tsx` | 132 (was 98, +34) | `DialogContent` gains `focusTargetRef`/`focusOnReady`/`open` props; defaults `initialFocus` to `() => focusTargetRef.current ?? false` |
| `packages/client/src/components/detail/ReviseSpecAction.tsx` | 283 (was 305, -22) | Migrated to wrapper API; inline `hasFocusedOnOpenRef` block + explicit `initialFocus` removed |

- **Lint:** tsc x3 (shared/server/client) all exit 0. `npm run build -w @gander-studio/client` exit 0, max chunk 407.00 kB (no new warning).
- **Constant audit:** 0 raw hex matches, 0 duplicated magic numbers, 0 style-conflicts, 0 unguarded JSON.parse, 0 unguarded click-handlers across all 3 touched files.
- **e2e:** s3-drilldowns 8/8 green (baseline 8/8, MATCH). Full suite 82 passed / 43 failed (baseline 82/43, MATCH on count). One non-baseline-red failure (`s2-d3-session-buffer.spec.ts:151`) investigated via self-scoped stash-A/B baseline-bisect receipt — reproduces identically with my diff stashed out → BASELINE-RED / pre-existing, not induced by t1.
- **Task boundary:** confirmed task_id `prog-studio-v2-2026-07-s5-integration-t1` only. `git status` confirms zero touch to RelationshipPanel.tsx (t2), AppShell.tsx/router.ts/program-dag-parser.test.ts/v2-design-spec.md (t3), or deferred-work.md (t4) by this agent.
- **Output file written:** `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t1-FE-1784348388.md`
