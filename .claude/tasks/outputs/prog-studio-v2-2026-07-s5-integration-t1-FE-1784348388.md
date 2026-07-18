# FE Output — prog-studio-v2-2026-07-s5-integration-t1

Task: Build the safe-focus default into the shared `ui/` Dialog wrapper and migrate its sole
consumer (`ReviseSpecAction.tsx`) to it. task_id confirmed = `prog-studio-v2-2026-07-s5-integration-t1`
(matches the prompt's task_id — no scope drift into t2/t3/t4).

## Files changed

- `packages/client/src/components/ui/use-dialog-safe-focus.ts` (NEW, 44 lines) — `useDialogSafeFocus`
  hook: reset-on-close `useEffect` + once-per-open deterministic `useLayoutEffect`, extracted from
  ReviseSpecAction's inline block.
- `packages/client/src/components/ui/dialog.tsx` (98 → 132 lines, +34) — `DialogContent` gains
  `focusTargetRef` / `focusOnReady` / `open` props and hard-defaults `initialFocus`.
- `packages/client/src/components/detail/ReviseSpecAction.tsx` (305 → 283 lines, -22) — migrated to
  consume the wrapper API; inline focus block removed.

## Wrapper default-focus API

`DialogContent` (in `packages/client/src/components/ui/dialog.tsx`) now accepts three new optional
props, in addition to everything it already forwarded to `DialogPrimitive.Popup`:

- **`focusTargetRef?: React.RefObject<HTMLElement | null>`** — the ultimate focus target inside the
  dialog (e.g. a `<Textarea>` ref). When supplied *without* an explicit `initialFocus`, the wrapper
  computes:
  ```ts
  const resolvedInitialFocus =
    initialFocus ?? (focusTargetRef ? () => focusTargetRef.current ?? false : undefined);
  ```
  and passes `resolvedInitialFocus` as `initialFocus` to `DialogPrimitive.Popup`. This is the
  function-form default resolving `ref.current ?? false` required by SC-1a. Passing an explicit
  `initialFocus` prop opts out of the default (caller wins).
- **`focusOnReady?: boolean`** — true once `focusTargetRef`'s element is ready to receive focus
  (e.g. `!isLoading && !loadError`). Combined with `open`, this drives the deterministic
  once-per-open `useLayoutEffect` fallback via the new `useDialogSafeFocus` hook (SC-1b): base-ui
  resolves `initialFocus` on a single synchronous microtask right after open, BEFORE any
  async-mounted child exists, so a bare ref is null on that tick for a cold open. The hook is the
  deterministic path that focuses `focusTargetRef.current` exactly once per open the moment it
  actually exists, and resets the once-per-open guard on close so the next open can focus again —
  it never yanks focus away from a user mid-edit once the initial focus has landed.
- **`open?: boolean`** — the same controlled `open` value passed to the parent `<Dialog
  open={...}>`. Only needed to drive `focusOnReady`'s once-per-open reset on close; omit if
  `focusOnReady` isn't used.

`DialogContent` calls `useDialogSafeFocus(focusTargetRef, focusOnReady, open)` internally — the hook
itself (`use-dialog-safe-focus.ts`) is co-located with the wrapper per the packet's "You own the exact
prop API and file placement" latitude.

## ReviseSpecAction migration confirmed

The inline `initialFocus={() => textareaRef.current ?? false}` (was line 179) and the hand-rolled
`hasFocusedOnOpenRef` ref + reset-`useEffect` + focus-`useLayoutEffect` block (was lines 97, 99–103,
105–116) have been REMOVED and replaced by:

```tsx
const readyToFocus = !isLoading && !loadError;
...
<DialogContent
  role="dialog"
  aria-modal="true"
  open={open}
  focusTargetRef={textareaRef}
  focusOnReady={readyToFocus}
  finalFocus={triggerRef}
  ...
>
```

`grep -c 'hasFocusedOnOpenRef' packages/client/src/components/detail/ReviseSpecAction.tsx` = **0**
(baseline 5 occurrences — the PM's cited 3 code sites at lines 97/110/114 plus one comment mention at
94 and one reset-effect line at 101, all removed). `useLayoutEffect` import also dropped from
ReviseSpecAction since the logic moved into the wrapper's hook. `finalFocus={triggerRef}` is
unchanged (explicit, not part of the default — out of scope per the packet).

Observable behavior preserved: cold-open focus lands on the textarea once loaded (verified — PROOF 3a
in s3-drilldowns, see e2e section below); `finalFocus` returns focus to the trigger on close
(unchanged, still explicit); focus is not yanked mid-edit after a save (the `focusOnReady`
once-per-open guard has the same semantics as the original `hasFocusedOnOpenRef` guard).

## Popover decision: ACCEPT (ii) — evidence-backed, zero consumers

```
$ grep -rn "from '@/components/ui/popover'" packages/client/src --include="*.tsx" --include="*.ts"
(no output — zero consumers)
```

`ui/popover.tsx` has ZERO consumers in the codebase (grep re-verified this turn, matches the PM's
ground fact). No async-focus Popover consumer exists to protect today, and the packet's out_of_scope
explicitly forbids inventing a speculative Popover consumer to justify code. Per the packet's
sanctioned path (ii): recording this evidence-backed ACCEPT — Popover safe-focus is
not-currently-applicable and is deferred until a Popover gains an async-mounted focus target.
`grep -c 'initialFocus' packages/client/src/components/ui/popover.tsx` = 0 (unchanged, no code
written to popover.tsx).

## e2e result (baseline-relative, per s5 baseline artifacts — NOT an absolute "full suite green" claim)

Ran from `packages/client` per the environment notes (`npx playwright test`), with dev servers already
running (API :3001, Vite :5173).

- **s3-drilldowns suite (t1's functional guard, PROOF 3a exercises the revise-dialog focus path):**
  `npx playwright test tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` → **8 passed / 8 total**
  — matches baseline-green 8/8 exactly. Reran after the baseline-bisect stash/pop cycle below and
  reconfirmed 8/8 green.
- **Full suite:** 82 passed / 43 failed — matches the s5 baseline counts (82 green / 43 red) exactly.
- **Non-count-matching detail (investigated, not a regression):** two individual tests swapped identity
  vs the baseline-red list while the totals stayed 82/43:
  - `s2-d4-prose-slug.spec.ts:133` (baseline-red) PASSED in my run — an improvement/flake in the
    opposite direction; not investigated further since a baseline-red test passing is not a
    regression risk.
  - `s2-d3-session-buffer.spec.ts:151` ("D3: saveEdit mutation body carries B's session id") was
    baseline-GREEN but FAILED in my full-suite run — this is a NEW failure not on the baseline-red
    list, so per standards.md it required the stash-A/B baseline-bisect receipt before any
    "pre-existing" label:

  **Baseline-bisect receipt (self-scoped, per standards.md exception — stashed only the 3 files this
  task touched, never the whole tree):**
  ```
  $ git stash push -u -m "FE-t1-baseline-bisect-self-scoped" -- \
      packages/client/src/components/ui/dialog.tsx \
      packages/client/src/components/detail/ReviseSpecAction.tsx \
      packages/client/src/components/ui/use-dialog-safe-focus.ts
  Saved working directory and index state ...

  $ npx playwright test tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts
  ...
    2) D3: saveEdit mutation body carries B's session id (not A's) at mutation boundary
       Error: expect(locator).toBeVisible() failed
       Locator: getByTestId('sessions-detail-page')
  2 failed (identical failure on baseline code, dialog.tsx reverted to 98-line pre-t1 state)

  $ git stash pop
  ... (my 3 files restored exactly; confirmed via grep initialFocus=5, ?? false=1, hasFocusedOnOpenRef=0)

  $ npx playwright test tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts
  ... same 2 failed, identical error/locator
  ```
  Failure reproduces on baseline (stash-out) with my diff removed → **baseline-red / pre-existing**,
  NOT induced by t1. The failing spec (`prog-studio-vision-s2-d3-session-buffer.spec.ts`) has zero
  references to `revise`/`dialog`/`ReviseSpecAction` — it exercises the unrelated Sessions
  list→detail→Editor-tab flow, and fails on `sessions-detail-page` visibility after a row click,
  consistent with a session-fixture/row-order flake class (unrelated to this task's Dialog/focus
  scope). Labeling this pre-existing is backed by the stash-A/B receipt above, per
  standards.md/the packet's requirement.

## Lint + build

```
$ npx tsc --noEmit --project packages/shared/tsconfig.json   → exit 0
$ npx tsc --noEmit --project packages/server/tsconfig.json   → exit 0
$ npx tsc --noEmit --project packages/client/tsconfig.json   → exit 0
$ npm run build -w @gander-studio/client                     → success
    dist/assets/index-BeHerxsM.js   407.00 kB │ gzip: 120.63 kB   (max chunk, unchanged from
    documented baseline; no new Vite chunk-size warning)
```

## Constant / style / a11y audits (all required pre-packet checks)

- Raw hex grep (`#[0-9a-fA-F]{6}`) across all 3 touched files: 0 matches.
- Inline style/Tailwind conflict grep: 0 matches (no `style="..."` string attributes were added; the
  existing `style={{...}}` object props in ReviseSpecAction are pre-existing and untouched by this
  migration).
- Function-body dedup: no repeated inline handler bodies introduced.
- Click-handler keyboard-equivalent audit (`<span|div|li|a ... onClick=`): 0 matches across all 3
  files.
- `JSON.parse` audit: 0 matches across all 3 files.
- Focus-trap visibility filter: N/A — this task extends `initialFocus`/`focusOnReady`, not a
  Tab/Shift+Tab focus-trap `querySelectorAll` cycle; no new focus-trap function was written.

<ui_packet>
  <components_created>
    packages/client/src/components/ui/use-dialog-safe-focus.ts (new hook, 44 lines)
  </components_created>
  <components_modified>
    packages/client/src/components/ui/dialog.tsx (DialogContent: +focusTargetRef/+focusOnReady/+open props, hard-defaults initialFocus)
    packages/client/src/components/detail/ReviseSpecAction.tsx (migrated to wrapper API; inline hasFocusedOnOpenRef block removed)
  </components_modified>
  <state_hydration_map>
    No BE data flow changes. Focus-guard state (previously a component-scoped useRef in
    ReviseSpecAction) now lives inside the useDialogSafeFocus hook, instantiated per DialogContent
    mount, driven by client-local open/isLoading/loadError state already sourced from
    trpc.agent.get/skill.get queries (unchanged data flow).
  </state_hydration_map>
  <a11y_verification>
    role="dialog" aria-modal="true" preserved on DialogContent (explicit in ReviseSpecAction,
    unchanged). finalFocus={triggerRef} return-to-trigger behavior preserved unchanged. Keyboard
    a11y regression guard: s3-drilldowns "a11y: detail page is keyboard-operable — Tab reaches the
    revise trigger, Enter activates it" test passes 8/8 (see e2e section). No new interactive
    elements requiring keyboard handlers were introduced. Click-handler keyboard-equivalent grep: 0
    matches (no unguarded onClick on non-button/anchor elements).
  </a11y_verification>
  <design_tokens_used>NONE — this is a behavior-only focus refactor; no visual/token changes were made to dialog.tsx or ReviseSpecAction.tsx (existing var(--*) FF7 tokens in ReviseSpecAction's style props are untouched).</design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <wrapper_default_focus_api>
    DialogContent gains focusTargetRef (RefObject<HTMLElement|null>), focusOnReady (boolean), and
    open (boolean) props. When focusTargetRef is supplied without an explicit initialFocus, the
    wrapper defaults initialFocus to `() => focusTargetRef.current ?? false` (SC-1a: grep -c
    'initialFocus' dialog.tsx = 5, grep -c '?? false' dialog.tsx = 1, both baseline 0). focusOnReady
    + open drive the useDialogSafeFocus hook's deterministic once-per-open useLayoutEffect fallback
    (SC-1b), co-located at packages/client/src/components/ui/use-dialog-safe-focus.ts.
  </wrapper_default_focus_api>
  <revise_spec_action_migration>
    CONFIRMED. grep -c 'hasFocusedOnOpenRef' packages/client/src/components/detail/ReviseSpecAction.tsx
    = 0 (baseline 5). Inline initialFocus prop and the hand-rolled ref/reset-effect/layout-effect
    block are fully removed, replaced by focusTargetRef={textareaRef} + focusOnReady={readyToFocus}
    + open={open} passed to the wrapper. finalFocus={triggerRef} unchanged (explicit, out of the
    default's scope).
  </revise_spec_action_migration>
  <popover_decision>
    ACCEPT (ii) — evidence-backed. grep -rn "from '@/components/ui/popover'" packages/client/src
    returns zero results (re-verified this turn). No async-focus Popover consumer exists to protect
    today; Popover safe-focus is not-currently-applicable, deferred until a Popover gains an
    async-mounted focus target. No code written to popover.tsx (grep -c 'initialFocus'
    popover.tsx = 0).
  </popover_decision>
  <e2e_result>
    Baseline-relative (NOT an absolute "full suite green" claim). s3-drilldowns suite (t1's
    functional guard): 8 passed / 8 total, matches baseline-green 8/8 exactly (reconfirmed after
    baseline-bisect stash/pop). Full suite: 82 passed / 43 failed, matches s5 baseline counts
    (82 green / 43 red) exactly. One individual-test identity swap within the same totals was
    investigated: s2-d3-session-buffer.spec.ts:151 was baseline-green but failed in my run; a
    self-scoped stash-A/B baseline-bisect receipt (see body above) reproduced the identical failure
    on baseline code with my diff stashed out, confirming BASELINE-RED / pre-existing, not induced
    by t1. Zero NEW regressions attributable to this task.
  </e2e_result>
  <lint_and_build>
    tsc --noEmit x3 (shared/server/client): all exit 0. npm run build -w @gander-studio/client:
    success, max chunk 407.00 kB (unchanged from documented baseline, no new Vite chunk-size
    warning).
  </lint_and_build>
  <e2e_spec>TIER_1_ONLY — no new component/page/interactive surface was created; this is a
    behavior-only focus-handling refactor of an existing Dialog wrapper and its sole consumer. The
    pre-existing s3-drilldowns Tier-2 spec already covers the revise-dialog interaction (PROOF 3a)
    and was extended-guard-verified above, not newly authored.
  </e2e_spec>
  <focus_trap_visibility_filter_confirmed>N/A — this task extends initialFocus/focusOnReady, not a Tab/Shift+Tab focus-trap querySelectorAll cycle; no getFocusableElements-style function was written or modified.</focus_trap_visibility_filter_confirmed>
  <integration_status>SUCCESS</integration_status>
</ui_packet>
