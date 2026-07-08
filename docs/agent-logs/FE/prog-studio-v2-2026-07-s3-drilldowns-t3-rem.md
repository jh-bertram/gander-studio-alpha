## [STAGE 1] RECEIVED
- **From:** ORC (remediation dispatch, post-AUD#3 FAIL)
- **At:** 2026-07-08T05:59:03Z
- **Task ID:** prog-studio-v2-2026-07-s3-drilldowns-t3-rem
- **Message received:**
  > <remediation_request>
  >   <task_id>prog-studio-v2-2026-07-s3-drilldowns-t3-rem</task_id>
  >   <attempt_number>1</attempt_number>
  >   <failing_check>SA (WCAG AA contrast)</failing_check>
  >   <specific_issue>AUD#3 verdict (.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t3-AUD-1783489625.md): the two error-message p elements in packages/client/src/components/detail/ReviseSpecAction.tsx (~lines 161, 187) render color: var(--redb) (#e05555) on the dialog surface background var(--sfh) (#1a3530) — measured 3.51:1 < 4.5:1 AA. The contrast_pairs table AA-verifies --redb text ONLY on --void (5.22:1); no --redb-on---sfh row exists, and the spec's binding rule requires every text pairing to trace to an AA row.</specific_issue>
  >   <required_fix>Apply DESIGN.md's Error-state Component Rule: --redb becomes the left-border/icon ACCENT; the error message TEXT renders in --w or --wd (13.16:1 / 9.6:1-class on --sfh — both AA rows). Do the same treatment for both error sites. ALSO (auditor advisory, fix while there): the "Saved" confirmation currently renders --mg on --sfh at 4.85:1 — numerically AA but unrowed; either switch its text to an AA-rowed pair (--w/--wd with an --mg accent) or keep --mg and NOTE in your packet that the pair needs a contrast_pairs row added to the spec (flag for the design-doc maintainer; do NOT edit v2-design-spec.md).</required_fix>
  > </remediation_request>
  > …[truncated — full prompt also specified authorized file scope (ReviseSpecAction.tsx ONLY), verification commands (lint x3, vitest buffer tests, grep for remaining --redb text usage), and NO git stash/commit.]

## [STAGE 2] PLAN
- **At:** 2026-07-08T05:59:03Z
- **Components to build:** none new — remediate `packages/client/src/components/detail/ReviseSpecAction.tsx` only
- **State design:** no state changes; style-only remediation
- **tRPC wiring:** unchanged
- **A11Y plan:** apply DESIGN.md's Error-state Component Rule (left-border accent `--redb`, message text `--w`) to both `role="alert"` `<p>` elements (load-error line ~161, save-error line ~187). Text color `--w` chosen over `--wd` because the spec's `contrast_pairs` table has an EXPLICIT row for `--w` on `--sfh` (≈13.0:1 AAA, line 290) but only an indirect row for `--wd` on `--sf` (9.6:1) — no `--wd`-on-`--sfh` row exists, so `--w` is the only choice that traces to an exact AA-rowed pair per the same binding rule that failed AUD#3. Apply the same left-border-accent treatment to the "Saved" `role="status"` text using `--mg` as the accent and `--w` as the text color, to pre-empt the auditor's advisory note. Extract the repeated `3px` border width / `10px` padding into named constants (`ACCENT_BORDER_PX`, `ACCENT_PADDING_LEFT_PX`) per this file's existing pixel-constant convention (`DIALOG_MAX_WIDTH_PX`, `EDITOR_MIN_HEIGHT_PX`).

### Checkpoint — 05:59:03
- Read `ReviseSpecAction.tsx` (234 lines), `docs/v2-vision/v2-design-spec.md` contrast_pairs table (lines 286-298), `DESIGN.md` Component Rules (Error state, line 113). Confirmed `--w` on `--sfh` has an explicit contrast_pairs row (≈13.0:1 AAA); `--wd` does not have a `--sfh` row. Next: apply edits.

### Checkpoint — 06:01:00
- Edited `ReviseSpecAction.tsx` (271 lines, +37/-6 net). Added `ACCENT_BORDER_PX`/`ACCENT_PADDING_LEFT_PX` constants; converted both `role="alert"` `<p>` text from `--redb` to `--w` + `borderLeft: 3px solid var(--redb)`; converted the `role="status"` "Saved" `<p>` from `--mg` text to `--w` text + `borderLeft: 3px solid var(--mg)` (pre-empts the auditor's advisory note on the unrowed `--mg`-on-`--sfh` pairing). Constant audit: grepped file for `color: 'var(--redb)'` — 0 matches (was 2). Grepped for `redb` overall — 2 matches, both `borderLeft` accent usages (expected). Grepped for raw hex, `JSON.parse`, string `style="..."` attrs, unguarded `<span|div|li|a onClick>` — 0 matches each (file uses JSX object-literal styles throughout, no click handlers added). Next: run verification (lint x3, vitest buffer tests).

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T06:03:00Z
- **Note:** a prior `## [STAGE 3] INTERRUPTED` marker was auto-appended by the agent-stop-checkpoint hook mid-session while work was still in progress (session did not actually end). Superseded by this COMPLETE stage — the interruption did not occur; all remediation work below completed in the same continuous session.
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/components/detail/ReviseSpecAction.tsx` | 271 (was 234, +37) | Error/status text `--redb`/`--mg` → `--w` (explicit contrast_pairs AA row on `--sfh`); `--redb`/`--mg` retained as left-border accent per DESIGN.md Error-state Component Rule |

- **Lint:** exit 0, exit 0, exit 0 (3/3 runs, `tsc --noEmit` across shared/server/client)
- **Vitest:** `revise-spec-buffer.test.ts` — 6 passed (6), 0 failed
- **Constant audit:** `color: 'var(--redb)'` — 0 matches (target: 0). `redb` overall — 2 matches, both border-accent. No raw hex, no `JSON.parse`, no string `style="..."`, no unguarded click handlers in file.
