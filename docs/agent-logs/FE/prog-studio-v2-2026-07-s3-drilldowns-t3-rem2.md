## [STAGE 1] RECEIVED
- **From:** ORC (remediation dispatch, referencing FE#6 root-cause packet)
- **At:** 2026-07-08T06:31:37Z
- **Task ID:** prog-studio-v2-2026-07-s3-drilldowns-t3-rem2
- **Message received:**
  > <remediation_request>
  >   <task_id>prog-studio-v2-2026-07-s3-drilldowns-t3-rem2</task_id>
  >   <attempt_number>2 (on the t3 family; first attempt fixed contrast — this is a distinct defect found by t5's gate)</attempt_number>
  >   <failing_check>QA (runtime — t5's e2e assertion, non-flaky, root-caused)</failing_check>
  >   <specific_issue>packages/client/src/components/detail/ReviseSpecAction.tsx: initialFocus={textareaRef} is resolved by base-ui's FloatingFocusManager via queueMicrotask BEFORE the async-loaded Textarea mounts (content loads via tRPC after dialog open), so initial focus lands on the Cancel button. Root cause + remediation sketch: .claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md (FE#6's packet, "genuine defect" section — read it). The failing assertion lives in tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts.</specific_issue>
  >   <required_fix>Make initial focus deterministic: focus must land on the textarea once content is loaded (e.g., keep a mount-stable initialFocus target then programmatically focus the textarea in an effect keyed on the loaded state; or gate the Popup's initialFocus resolution on the loaded branch per FE#6's sketch). Keyboard users must land in the editor, not on Cancel. Do NOT weaken the t5 assertion — make it pass as written.</required_fix>
  > </remediation_request>
  >
  > Authorized file scope: packages/client/src/components/detail/ReviseSpecAction.tsx ONLY (the t5 spec is NOT authorized).
  > Verify: playwright ×2 runs, npm run lint ×3, npm test -w @gander-studio/client (buffer 6/6). Record verbatim. NO git stash, NO git commit.
  …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-08T06:35:00Z
- **Components to build:** none new — single edit to `packages/client/src/components/detail/ReviseSpecAction.tsx`
- **Root cause confirmed:** read FE#6 packet (`.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md`)
  and `node_modules/@base-ui/react/floating-ui-react/components/FloatingFocusManager.d.ts` /
  `dialog/popup/DialogPopup.d.ts` to confirm `initialFocus` supports a function form
  `(openType) => boolean | HTMLElement | null | void`.
- **Fix approach:** (1) `initialFocus={() => textareaRef.current ?? false}` — function form, catches
  the cache-hit fast path for free, otherwise "do nothing" instead of falling back to first-tabbable
  (Cancel). (2) New `hasFocusedOnOpenRef` + `useLayoutEffect` keyed on `[open, isLoading, loadError]`
  that calls `textareaRef.current.focus()` once the Textarea is actually mounted — deterministic,
  independent of base-ui's microtask timing. Reset via a companion `useEffect` on `!open` so it fires
  at most once per open and never steals focus from a user mid-edit.
- **State design:** no new state slices; one new `useRef<boolean>` (`hasFocusedOnOpenRef`), no store changes.
- **tRPC wiring:** unchanged — `trpc.agent.get` / `trpc.skill.get` (existing).
- **A11Y plan:** preserves explicit-focus-on-open requirement (s2 AA §6 G2); Tab-trap/finalFocus
  unaffected (untouched code paths).

### Checkpoint — 06:36:10
- Edited `packages/client/src/components/detail/ReviseSpecAction.tsx` (+34/-1 lines net). Constant
  audit: 0 matches (raw-hex / style-conflict / click-handler / JSON.parse all clean). Next: verify
  via lint ×3 + playwright ×2 + vitest.

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T06:40:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |---|---|---|
  | `packages/client/src/components/detail/ReviseSpecAction.tsx` | 305 (was 271) | initialFocus function form + deterministic focus-on-load effect |
- **Lint:** exit 0, ×3 runs, clean.
- **Constant audit:** 0 matches across raw-hex / style-conflict / click-handler-a11y / JSON.parse greps.
- **Playwright:** 27/27 green ×2 runs (both spec files), including previously-failing PROOF 3a.
- **Vitest:** `npm test -w @gander-studio/client` 54/54 (8 files); buffer suite isolated-run 6/6.
- **Output packet:** `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t3-rem2-FE-1783492278.md`
