# AUD#7 Verdict — prog-studio-v2-2026-07-s3-drilldowns-t3-rem2

Auditing FE#8's focus-timing remediation of the t5-found defect (base-ui `initialFocus`
resolved via queueMicrotask BEFORE the async-loaded `<Textarea>` mounts → focus fell back to
the Cancel button on every cold-cache open). Single-file scope: `ReviseSpecAction.tsx`.

## SA notes (evidence)
- Function-form `initialFocus={() => textareaRef.current ?? false}` verified against the actual
  vendored contract in `node_modules/@base-ui/react/floating-ui-react/components/FloatingFocusManager.js`:
  the resolver runs `typeof fn === 'function' ? fn(openType) : fn`, and `resolvedInitialFocus === false`
  early-returns with NO tabbable fallback. So `false` ⇒ base-ui does nothing (never lands on Cancel);
  a live element ⇒ base-ui focuses it. The `.d.ts` types `initialFocus` as
  `boolean | RefObject | ((openType) => boolean | HTMLElement | null | void)`. The fix is contract-sound.
- Once-per-open guard is correct: reset `useEffect` on `!open` (L99-103) clears `hasFocusedOnOpenRef`
  only on close; the focus `useLayoutEffect` (L105-116, keyed `[open, isLoading, loadError]`) fires at
  most once per open and is gated on `!hasFocusedOnOpenRef.current && textareaRef.current`. It structurally
  cannot steal focus mid-edit: a post-save re-render leaves open/isLoading/loadError unchanged (no re-fire)
  and even if it fired, the guard blocks. `useLayoutEffect` commits focus pre-paint (no focus-jump frame).
- No reducer/buffer change: `revise-spec-buffer.ts` untouched (still untracked, belongs to t3);
  `bufferReducer`/`dispatch` usage unchanged. Fix is scoped to focus management only.
- Prior adjudications intact: explicit `role="dialog"`/`aria-modal="true"` (L177-178) retained;
  rem1 `--redb` contrast-token accent bars (L209, L245) untouched.
- Scope: exactly one file on disk carries the rem2 delta (function-form initialFocus + ref + two effects).

## QA notes (independent third run — RUN, not read)
- `npx playwright test` both spec files headless (:3001 up, playwright auto-managed :5173):
  **27/27 passed (31.7s)**, including PROOF 3a (`toBeFocused()` on open) which was the failing
  assertion in t5. No flakes, no regressions in the other 26.
- `npm run lint` (tsc --noEmit ×3 packages): exit 0, clean.
- Buffer suite `revise-spec-buffer.test.ts`: 6/6 passed — confirms no reducer/buffer-logic impact.

## SX notes
- Presentational/focus-only change. No new secrets, no API/input-validation boundary, no auth surface,
  no DOM sink. Adds a ref + two effects invoking `.focus()`. No security surface.

<audit_verdict schema_version="2.0">
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t3-rem2</task_id>
  <auditor_spawn>
    <agent_id>AUD#7</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#8</independent_from>
  </auditor_spawn>
  <inputs>
    <input sha256="f28f38350aba1c2def4f86bb1f347a8408e79ca68109dbb6bc263d5f33fc4bb0">packages/client/src/components/detail/ReviseSpecAction.tsx</input>
    <input sha256="5773b7ae5b87ebd902c0ab82e926d94f042404aff5a2d1d3d234cbcf639a92f1">.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t3-rem2-FE-1783492278.md</input>
    <input sha256="62b4921568cf1581126c5588e3edabfe442f5bf9679a20ed80a7584885608e63">packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts</input>
  </inputs>
  <sa status="PASS">
    <target_file>packages/client/src/components/detail/ReviseSpecAction.tsx</target_file>
    <violations/>
    <notes>Function-form initialFocus verified against base-ui FloatingFocusManager.js source: false ⇒ early-return, no Cancel fallback; live element ⇒ focused. Once-per-open guard (reset on !open + useLayoutEffect gated on hasFocusedOnOpenRef) cannot steal focus mid-edit. No reducer/buffer change. role/aria-modal + rem1 --redb contrast intact.</notes>
  </sa>
  <qa status="PASS">
    <test_coverage>e2e 27 passed, 0 failed; unit(buffer) 6 passed, 0 failed; lint(tsc ×3) exit 0</test_coverage>
    <playwright>
      <tier>2</tier>
      <tests_run>27</tests_run>
      <passed>27</passed>
      <failed>0</failed>
      <notes>Independent third run (FE ran twice). Both spec files headless; PROOF 3a toBeFocused() on open now PASSES.</notes>
    </playwright>
    <defects/>
  </qa>
  <sx status="SECURE">
    <threat_level>LOW</threat_level>
    <findings/>
    <notes>Presentational/focus-only; no secrets, input-validation boundary, auth, or DOM sink introduced.</notes>
  </sx>
  <overall_status>PASS</overall_status>
</audit_verdict>
