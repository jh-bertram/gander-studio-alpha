# prog-studio-v2-2026-07-s2-party-shell-t3-rem — FE remediation output

## Summary

Fixed the keyboard-focus popover oscillation defect in `PartyMemberCard.tsx` diagnosed by
FE#6's t6 e2e gate. The fix required **two** additive props on the existing `<PopoverContent>`
call site (no structural rewrite):

```tsx
<PopoverContent
  initialFocus={false}
  role="presentation"
  style={{ ... }}
>
```

## Fix approach chosen, and why (vs. the spec's quick-peek intent)

The remediation request offered three options. I picked a combination of options 1 and 2
(re-numbered here) because they are the most faithful to the design spec's stated intent that
the quick-peek is a **passive, non-interactive info display** (`docs/v2-vision/v2-design-spec.md`
`<state name="card-hover">`: "a `<Popover>` quick-peek may appear showing the card's exact stat
values and their as-of date" — no interactive elements, confirmed by reading the popup's JSX,
which is just a `<p>` + stat rows).

**Part 1 — `initialFocus={false}`.** Traced the defect to `@base-ui/react`'s `PopoverPopup`
(`node_modules/@base-ui/react/popover/popup/PopoverPopup.js:84-90`), whose default `initialFocus`
resolver returns `true` for keyboard-triggered opens. `FloatingFocusManager`
(`.../floating-ui-react/components/FloatingFocusManager.js:389-421`) then programmatically moves
DOM focus into the popup on open. Because `PartyMemberCard` fully controls `open={isPeeking}`
itself (bypassing base-ui's own hover/focus interaction plumbing), the manager is never
`disabled` for a keyboard-focus open, so every keyboard focus triggered: focus moves into the
(button-less) popup → trigger's `onBlur` fires → `isPeeking=false` → popover closes → focus
returns to trigger → `onFocus` refires → reopens. Sustained self-driven oscillation.
`initialFocus={false}` ("Do not move focus") is base-ui's own documented, first-class mechanism
for exactly this case — confirmed the focus-effect returns early with zero DOM focus movement
when this prop resolves to `false` (`FloatingFocusManager.js:403`).

**Part 2 — `role="presentation"` (found during verification, not in the original diagnosis).**
Applying `initialFocus={false}` alone fixed the oscillation but introduced a **new regression**
in a separate, pre-existing, in-scope test: "keyboard tab order... proves no nested tab stops
inside a card." Root cause: base-ui's Popover hardcodes `role="dialog"` on the popup via
`floating-ui-react`'s `useRole()` (no public override on `PopoverRoot` — verified by reading
`popover/root/PopoverRoot.js:104`, `(0, _floatingUiReact.useRole)(floatingRootContext)` called
with no `role` override argument, so it defaults to `'dialog'`). `FloatingFocusManager`'s
`handleTabIndex()` (`FloatingFocusManager.js:93-112`) grants `tabindex="0"` to any floating
element whose `role` contains "dialog" AND has zero tabbable children — exactly our peek's
shape — turning the (contentless) popup into an unwanted native Tab stop between one card and
the next. `role="presentation"` overrides the merged `role` attribute (verified this is a
supported customization path, not an internals hack: `PopoverPopupProps extends
BaseUIComponentProps<'div', PopoverPopupState>`, and `node_modules/@base-ui/react/merge-props/
mergeProps.js`'s `mergeProps`/`mergePropsN` apply consumer props — ours — as the rightmost/
overriding layer). With `role="presentation"`, `handleTabIndex()`'s dialog-role branch no
longer matches, no `tabindex` is ever assigned, and a `<div>` without a `tabindex` attribute is
not native-Tab-reachable. `role="presentation"` is also independently correct on accessibility
grounds: the peek duplicates information already exposed via the card's own single, comprehensive
`aria-label` (`buildCardAriaLabel`), so it needs no accessibility-tree presence of its own.

Both changes live entirely inside the authorized file (`PartyMemberCard.tsx`); `components/ui/
popover.tsx` (out of scope) was read but not modified — `PopoverContent` already forwards
arbitrary `PopoverPrimitive.Popup` props via `{...props}` spread, so no wrapper change was
needed.

## Files modified

1. `packages/client/src/components/party/PartyMemberCard.tsx` (+30/-0) — the fix, on the
   `<PopoverContent>` call site, with an inline rationale comment.
2. `packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` (~+20/-19) —
   - Removed `test.fail()` and the stale KNOWN-DEFECT comment block on the "whole-card is
     keyboard-operable" test.
   - Renamed the test to describe the fixed behavior and strengthened it: it now instruments a
     `blur` counter on the card trigger BEFORE focusing it, holds keyboard focus for a 3.2s
     sustained window (exceeding the diagnosis's "still cycling after 3+ seconds" observation
     point), asserts `firstCard` is still focused and the blur counter is `0` (the oscillation's
     direct fingerprint), THEN presses Enter and asserts the DOM-visible consequence
     (`browse-page` testid becomes visible) — pairing the side-effect probe with a DOM-presence
     assertion per the Side-Effect-As-Proxy pairing rule.
3. `packages/client/src/components/party/__tests__/PartyMemberCard.test.ts` — **not touched**.
   The fix does not change `buildCardAriaLabel` or any other view-model logic this file covers
   (confirmed by reading the file); the remediation_request's own conditional ("only if your fix
   changes the aria-label/view-model logic") does not apply.

## Regression found and fixed mid-verification (full trace in
`docs/agent-logs/FE/prog-studio-v2-2026-07-s2-party-shell-t3-rem.md`)

Verification is not just "run the suite once and read pass/fail" — a first-pass fix
(`initialFocus={false}` alone) passed the target test but silently broke a DIFFERENT,
pre-existing, in-scope test in the same spec file. I bisected with `git stash push --
PartyMemberCard.tsx` (confirming the pre-fix component passed "keyboard tab order" and the
first-pass fix broke it), traced the root cause via source reading + a throwaway
`document.activeElement`-logging debug spec (created in `/tmp/.../scratchpad/`, run, then moved
out of `tests/e2e/` before finishing — never part of the deliverable), and added the
`role="presentation"` override to fix it without touching the target test's assertions.

## Reproduce commands + verbatim outputs (summarized; full raw logs held in scratchpad, referenced
here since they exceed reasonable inline length)

### 1. Isolated party-shell spec (19 tests) — run twice, both green

```
$ npx playwright test tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts --reporter=list
Running 19 tests using 1 worker
  ✓ 1..19 (all 19 tests)
  19 passed (38.4s)
```

Repeated the specific regression-guard test 3× (`--repeat-each=3`) to rule out timing flakiness
given the original defect's own timing-dependence:

```
$ npx playwright test tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts -g "whole-card is keyboard-operable" --repeat-each=3 --reporter=list
  3 passed (18.6s)
```

### 2. Full `npx playwright test` (174 tests, whole client e2e suite) — run twice

Run 1 (only `initialFocus={false}` applied, before the `role="presentation"` fix):
`54 failed, 120 passed` — includes the NOW-DIAGNOSED "keyboard tab order" regression.

Run 2 (both fixes applied):
`56 failed, 118 passed` — `prog-studio-v2-2026-07-s2-party-shell.spec.ts:248` (keyboard tab
order) is ABSENT from the fail list (fixed, confirmed). The other 54-56 failures are
**pre-existing and unrelated** to this diff:

- Present in BOTH full-suite runs, spanning completely unrelated surfaces (agent-timeline-zoom,
  card-node-title-edit, browse/compose/edit/export FE, loadout-list-panel, materia-canvas-
  proximity, overview-aggregate, p6-t1-timeline-buffer, prog-studio-sessions-2026-05-s2-list-
  edit-fe, prog-studio-vision-s2/s3/s4, s3-t2/t3/t4/t5a) — none touch Party/PartyMemberCard.
- Failure-set MEMBERSHIP CHURNS between the two runs (e.g.
  `prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts:184` failed in run 1 but passed in run
  2; `...:251`, `...:383`, `prog-studio-vision-s2-d3-session-buffer.spec.ts:59`,
  `prog-studio-vision-s4-render-loop.spec.ts:127` failed in run 2 but not run 1) — proving this
  is pre-existing suite flakiness (parallel-worker contention / fixture-data availability), not
  a deterministic regression from this diff.
- Root-caused: many of these tests depend on fixture session data
  (`gander-p3-team-report-v1.2`) that does not exist anywhere under the configured
  `SESSIONS_SOURCE_DIRS` (`/home/jhber/projects/gander,/home/jhber/projects/gander-studio-
  alpha`) in this environment — confirmed via `find / -iname "*gander-p3-team-report*"`
  returning zero results. A separately re-run of the 3 files whose membership changed between
  runs (`--workers=1`, serial) produced YET ANOTHER different failure pattern (7 failed / 17
  passed) — reinforcing this is pre-existing environmental flakiness, not something my 2-file
  diff could plausibly cause.

### 3. `npm run lint` × 3 (root, typechecks all 3 workspaces)

```
$ npm run lint   (×3, run sequentially)
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
```
Exit code 0, all three runs, no output (clean typecheck).

### 4. `npm test -w @gander-studio/client` (vitest)

```
 Test Files  6 passed (6)
      Tests  37 passed (37)
   Duration  2.05s
```

## Oscillation probe scenario — confirmed fixed deterministically

The sustained-focus regression-guard test (§Files modified, item 2) directly reproduces FE#6's
diagnosed scenario: focus the card, hold focus for 3.2s (past the "still cycling after 3+
seconds" observation window), assert zero blur events fired and focus is still on the card, then
press Enter and assert the DOM-visible consequence. Passed on first run and on a 3×
`--repeat-each` rerun — deterministic, not timing-luck.

## Constant / style / a11y audits (required pre-packet checks)

- Raw hex grep: 0 matches introduced by this diff (one pre-existing `#ffffff` comment reference
  at spec line ~458, inside the untouched "legibility spot-check" test — not part of this diff).
- Inline `style="..."` attribute conflict grep: 0 matches (file uses `style={{...}}` object
  props exclusively, consistent with pre-existing pattern).
- Click-handler keyboard-equivalent audit (`<span|div|li|a onClick=`): 0 matches — no new
  elements of this shape were added.
- `JSON.parse` grep: 0 matches in either modified file.
- Function-body deduplication: no new repeated inline handlers introduced (single new comment +
  2 props on one existing element).

## Out-of-scope note

`packages/client/src/components/ui/popover.tsx` was read (to confirm `PopoverContent` forwards
arbitrary props) but NOT modified — it is not in the authorized file scope for this remediation,
and no change to it was needed since the fix is fully expressible via props at the
`PartyMemberCard.tsx` call site.

No git commit was made (per NO-COMMIT boundary). No files outside the authorized scope were
modified — `git status` shows pre-existing, unrelated modifications to `ModeContent.tsx` and
`ui-store.ts` from other in-flight work in this branch; neither was touched by this task.
