## [STAGE 1] RECEIVED
- **From:** ORC (remediation dispatch, originally triggered by FE#6's t6 e2e gate diagnosis)
- **At:** 2026-07-08T02:49:52Z
- **Task ID:** prog-studio-v2-2026-07-s2-party-shell-t3-rem
- **Message received:**
  > Working directory: /home/jhber/projects/gander-studio-alpha
  >
  > ## Output Path
  > Write your primary output to:
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t3-rem-FE-1783478966.md
  > Record this path in output_files of your COMPLETE event.
  >
  > <remediation_request>
  >   <task_id>prog-studio-v2-2026-07-s2-party-shell-t3-rem</task_id>
  >   <attempt_number>1</attempt_number>
  >   <failing_check>QA (runtime, found by t6's e2e gate — FE#6's diagnosis, HIGH)</failing_check>
  >   <specific_issue>PartyMemberCard.tsx: once a card is keyboard-focused, its Popover opens and base-ui auto-moves DOM focus into the popup's role="dialog" content, firing the card's onBlur → popover closes → focus returns to trigger → onFocus refires → popover reopens. Sustained oscillation (~40-50ms cycle, still cycling after 3+ seconds). Keyboard Tab+Enter selection is non-deterministic. Full reproduction evidence: .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t6-FE-1783477019.md → "Flagged defects" §1 (focusin timing probe).</specific_issue>
  >   <required_fix>Make keyboard focus stable: the quick-peek popover must open on hover and on keyboard focus WITHOUT stealing DOM focus from the card trigger (e.g. render the peek as a non-focus-stealing surface — role="tooltip"-style presentation, or configure the popover to not auto-focus its content on open (initialFocus/openOnFocus options), or gate onBlur so focus moving INTO the popup content does not close it (relatedTarget containment check)). Pick the approach most faithful to docs/v2-vision/v2-design-spec.md's quick-peek intent (a PEEK, not a dialog — it contains no interactive elements per the spec; if that holds, not moving focus at all is correct and simplest). Tab+Enter must deterministically set selectedAgentCode with a DOM-observable consequence.</required_fix>
  > </remediation_request>
  >
  > ## Authorized file scope (exactly these; the rem task_id authorizes crossing t3/t6 ownership)
  > 1. packages/client/src/components/party/PartyMemberCard.tsx — the fix.
  > 2. packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts — flip FE#6's test.fail() annotation to a normal passing assertion once fixed.
  > 3. packages/client/src/components/party/__tests__/PartyMemberCard.test.ts — only if fix changes aria-label/view-model logic those tests cover.
  >
  > Environment: API server running on :3001 (do not touch). Run FULL e2e suite headless, all 19+ green with annotation flipped, plus npm run lint x3 and npm test -w @gander-studio/client.
  >
  > ## Out of Scope
  > Everything else. NO git commit.
  > …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-08T02:52:00Z
- **Root cause confirmed by source inspection:** `@base-ui/react` Popover's `PopoverPopup`
  (`node_modules/@base-ui/react/popover/popup/PopoverPopup.js:84-90`) defaults
  `initialFocus` to a function that returns `true` for non-touch interactions, which
  `FloatingFocusManager` (`.../floating-ui-react/components/FloatingFocusManager.js:389-421`)
  resolves by moving DOM focus into the popup's first tabbable element or the popup container
  itself. Because `PartyMemberCard` fully controls `open={isPeeking}` itself (bypassing
  base-ui's own hover/focus interaction plumbing), the manager is never `disabled` for a
  keyboard-focus open (the `disabled: openReason === REASONS.triggerHover` short-circuit only
  covers base-ui's OWN hover interaction, not our external state control) — so on every
  keyboard focus, base-ui moves focus into the (button-less, text-only) popup, firing our
  `onBlur` → `isPeeking=false` → popover closes → focus returns to trigger → `onFocus` refires
  → reopens. Confirmed the fix path: `PopoverPopupProps.initialFocus` accepts `false` ("Do not
  move focus") and the focus-effect (`FloatingFocusManager.js:403`) returns early with no DOM
  focus movement at all when resolved value is `false`. `PopoverContent` (our wrapper,
  `components/ui/popover.tsx`, NOT in authorized scope, left untouched) already forwards
  arbitrary `PopoverPrimitive.Popup` props via `{...props}` spread, so the fix is a single
  additive prop on the `<PopoverContent>` call site inside `PartyMemberCard.tsx` — no other
  file needs a source change.
- **Design-spec fidelity check:** `docs/v2-vision/v2-design-spec.md` line 162-168 (`<state
  name="card-hover">`) describes the quick-peek as a passive value display ("showing the
  card's exact stat values and their as-of date") with no interactive elements — confirmed by
  reading `PartyMemberCard.tsx`'s `PopoverContent` JSX (a `<p>` + stat rows, zero buttons/
  inputs/links). Per the remediation prompt's own reasoning, "not moving focus at all is
  correct and simplest" — `initialFocus={false}` is the faithful, minimal fix.
- **Components to build/modify:**
  - `packages/client/src/components/party/PartyMemberCard.tsx` — add `initialFocus={false}`
    to the `<PopoverContent>` element (1-line diff).
  - `packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` — remove
    `test.fail()`, remove the stale KNOWN-DEFECT comment block, strengthen the test to hold
    keyboard focus for a sustained window (3.2s, exceeding the diagnosis's "still cycling
    after 3+ seconds" observation) while asserting zero `blur` events fired on the card and
    `toBeFocused()` still holds, THEN press Enter and assert the DOM-visible consequence
    (`browse-page` testid visible). Pairs a side-effect probe (blur-count) with a DOM-presence
    assertion per the Side-Effect-As-Proxy anti-pattern guidance.
- **State design:** No new state. `isPeeking`/`isBordered` local state in PartyMemberCard is
  unchanged; only the Popover's own internal DOM-focus-management behavior changes.
- **tRPC wiring:** None — no data-layer touch.
- **A11Y plan:** Card trigger remains the sole focusable/interactive element for the whole
  card (already true — no nested interactive elements in the popup content, confirmed above).
  Removing focus-stealing from the popup makes the a11y contract MORE correct, not less: a
  passive tooltip-like peek should never move DOM focus away from the element the user is
  actually interacting with. Verified no regression to the existing "hover reveals popover"
  or "keyboard focus reveals popover immediately" tests (both only assert visibility of the
  peek content, never assert where DOM focus sits after open — unaffected by this change).

### Checkpoint — 02:54:10
- Wrote `packages/client/src/components/party/PartyMemberCard.tsx` (+10/-0 lines: added
  `initialFocus={false}` prop + rationale comment on the `<PopoverContent>` call site).
  Constant audit: N/A (no new literal values introduced — `initialFocus={false}` is a
  base-ui prop, not a design-token or magic-number candidate). Next: strengthen and un-skip
  the e2e regression test.

### Checkpoint — 02:56:40
- Wrote `packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` (removed
  `test.fail()` + stale KNOWN-DEFECT comment block, added sustained-focus blur-count probe +
  DOM-consequence assertion; net ~+20/-19 lines within the pre-existing test). Constant audit:
  0 raw-hex matches; `3200`/`1000`/`8000` ms literals are Playwright timeout/wait values
  consistent with house style elsewhere in this file (`{ timeout: 10000 }` etc.) — not
  candidates for a named constant (single-use, test-local, not duplicated). Next: run full
  e2e suite + lint x3 + vitest.

### Investigation — REGRESSION found and fixed (03:05-03:20 approx)
Full isolated run of `prog-studio-v2-2026-07-s2-party-shell.spec.ts` (19 tests) with only
`initialFocus={false}` applied: 18 passed, 1 NEW failure — "keyboard tab order: rail items in
RAIL_ITEMS order, then party cards in DOM order" (a pre-existing, untouched test) — `Tab` from
card0 no longer landed on card1; `document.activeElement` was the POPUP `<div>` itself
(`role="dialog" tabindex="0"`). Bisected with `git stash push -- PartyMemberCard.tsx` (temporarily
reverting only the source fix, spec unchanged): the "keyboard tab order" test PASSED on the
pre-fix component and FAILED once `initialFocus={false}` was applied alone — confirmed a genuine
regression introduced by the first-pass fix, not a pre-existing flake. Root cause (traced via a
throwaway debug spec, `document.activeElement` logging, in `/tmp/.../scratchpad/debug-tab.spec.ts`
— moved out of `tests/e2e/` before finishing, never part of the deliverable): base-ui's Popover
hardcodes `role="dialog"` on the popup via `floating-ui-react`'s `useRole()` (no public override on
`PopoverRoot`), and `FloatingFocusManager`'s `handleTabIndex()` grants `tabindex="0"` to ANY
floating element whose `role` contains "dialog" AND has zero tabbable children — exactly our
peek's shape. `initialFocus={false}` only stops the one-time *programmatic* focus-on-open; it does
NOT remove the popup from the *native* Tab sequence, so Tab from card0 landed on the (contentless)
popup div instead of skipping to card1 — a real, user-facing dead tab stop, and precisely the class
of defect the pre-existing "no nested tab stops" test exists to catch. Fix (added, same file,
`<PopoverContent>` call site): `role="presentation"` — overriding the merged `role` attribute is a
documented `BaseUIComponentProps<'div', ...>` customization path (verified via
`node_modules/@base-ui/react/merge-props/mergeProps.js`: `mergeProps`/`mergePropsN` apply
right-to-left with the CONSUMER's `elementProps` merged last/rightmost, i.e. consumer overrides
win). With `role="presentation"`, `handleTabIndex()`'s dialog-role branch no longer matches, no
`tabindex` is ever assigned, and the div (having no `tabindex` attribute) is not native-Tab-
reachable — confirmed via the same debug probe: Tab from card0 now lands directly on card1.
Re-ran the isolated 19-test party-shell spec after the `role="presentation"` addition: 19/19 green
(see full-suite run logged in Stage 3 below for verbatim output).

*(Note: an automated "STAGE 3 INTERRUPTED" marker was appended here at 02:55:57Z by the
agent-stop-checkpoint hook mid-session, during the ~10-minute backgrounded Playwright full-suite
run — the session was still active throughout; work continued and completed normally. Superseded
by the real Stage 3 below.)*

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T03:35:00Z
- **Deliverables:**

  | File | Lines (diff) | Notes |
  |---|---|---|
  | `packages/client/src/components/party/PartyMemberCard.tsx` | +30/-0 | `initialFocus={false}` + `role="presentation"` on `<PopoverContent>`, with inline rationale comment |
  | `packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` | ~+20/-19 | `test.fail()` removed, stale KNOWN-DEFECT comment replaced with a FIXED note, test strengthened with a 3.2s sustained-focus blur-count probe + Enter→browse-page DOM assertion |
  | `packages/client/src/components/party/__tests__/PartyMemberCard.test.ts` | 0 (untouched) | Fix did not change aria-label/view-model logic; out of scope per remediation_request's own conditional |

- **Verification (verbatim summarized; full logs referenced in the ui_packet):**
  - Isolated `prog-studio-v2-2026-07-s2-party-shell.spec.ts`: **19/19 passed** (two full runs +
    a 3× repeat of the regression-guard test alone — all green, no flakiness observed in this
    file).
  - Full `npx playwright test` (174 tests, whole client e2e suite): party-shell's 19 tests all
    green in both full-suite runs; 54-56 pre-existing, unrelated failures present in BOTH runs
    (membership churns between runs — confirmed via bisection this is pre-existing worker-
    contention/missing-fixture-data flakiness, e.g. `SESSIONS_SOURCE_DIRS` has no
    `gander-p3-team-report-v1.2` fixture on disk — NOT caused by this diff).
  - `npm run lint` × 3: exit 0 all three runs.
  - `npm test -w @gander-studio/client` (vitest): 6 files / 37 tests passed.
- **Constant audit:** 0 raw-hex matches introduced by this diff (one pre-existing `#ffffff` hex
  reference exists in a comment at spec line ~458, in the untouched "legibility spot-check" test
  — not part of this diff, not touched).
- **Style conflict check:** 0 matches (no inline `style="..."` string-attribute usage added; all
  `style={{...}}` object props, consistent with the file's pre-existing pattern).
- **Click-handler keyboard audit:** 0 matches (no new `<span>/<div>/<li>/<a onClick>` elements
  added).
- **JSON.parse audit:** 0 matches in either modified file.
- **Regression found and fixed during verification:** the first-pass fix (`initialFocus={false}`
  alone) silently broke a separate, pre-existing, in-scope test ("keyboard tab order... no nested
  tab stops") by leaving the popup as a native, contentless Tab stop. Diagnosed via source
  inspection + a throwaway debug probe (removed before completion) and fixed with an additional
  `role="presentation"` override — see the Investigation entry above for the full trace. Both
  fixes together are minimal, additive, and scoped to the single `<PopoverContent>` call site.
