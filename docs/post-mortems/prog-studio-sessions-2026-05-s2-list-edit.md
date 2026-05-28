# Post-Mortem: Sessions S2 — List + Viewer + Markdown Editor
**Date:** 2026-05-25
**Project:** `~/projects/gander-studio-alpha`
**Duration:** Two sessions — 2026-05-20 (~2.5h active, seq 51–90) and 2026-05-25 resume (~3h, seq 91–112); first SPAWN 2026-05-20T19:18Z, last AUDIT_PASS 2026-05-25T21:19Z.
**Final State:** Sessions mode shipped — list page, detail shell with Overview/Table/Editor tabs + reserved disabled Analyze slot, and a save-to-new-folder markdown editor. All packets audited PASS and committed (10 commits on `main`, unpushed). One post-audit visual bug (invisible Editor textarea text) was caught at Step 4.5 human verification, fixed, and re-audited PASS. Formal requirements-validate + archivist close-out and the final human re-confirm of the contrast fix remain.

---

## 1. Original Request

**Human (2026-05-20, program S2 of `prog-studio-sessions-2026-05`):** Add a top-level "Sessions" mode to the studio client — a list page, a detail page with tabs (Overview / Table / Editor + a reserved disabled "Analyze" slot for S3), and a save-to-new-folder markdown editor. Purely additive: existing Browse / Compose / Edit / Export pages must remain unchanged.

**Brief file:** `.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-ORCBRIEF-1779304665.md` (authoritative sprint brief at `docs/programs/prog-studio-sessions-2026-05/sprints/.../orchestrator_brief.md`).

**Scope at intake:**
- Existed (from S1 backend): `session.list`/`get`/`getStats`/`saveEdit` tRPC procedures; `SessionSchema`, `AgentActivitySchema`, `EventLogEntrySchema`, `SessionStatsSchema`; `SESSIONS_EDITS_DIR`/`SESSIONS_SOURCE_DIRS` env.
- Needed: the entire client surface (nav mode, router, store, hooks, list page, detail shell, three tab components, editor save flow) + e2e coverage.
- **Critical seam (flagged at intake):** the S1 `SessionSchema` exposed no raw markdown `body`/`content`/`raw` field, but SC6 requires the Editor to pre-fill with original source markdown. This drove a BE addition (`session.getRaw`) inside S2.

**Success criteria:** SC1 nav mode · SC2 list · SC3 detail (no data-fetch remount on tab switch) · SC4 Overview · SC5 sortable Table · SC6 Editor pre-fill+save+revert · SC7 save flow (path shown; buffer preserved on failure) · SC8 reserved disabled Analyze · SC9 lint/type clean · SC10 manual smoke (Step 4.5).

**Skill invoked:** `dispatch-task` (PM → Critic → BE/UI/FE → Auditor pipeline); `resume-project` on 2026-05-25.

---

## 2. Agent Activity Log

### Plan & contract (2026-05-20) — (`...-s2-list-edit`)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 51–52 | 05-20 19:18–19:20 | SPAWN/COMPLETE | PM#1 | Initial decomposition |
| 53–54 | 05-20 19:27–19:32 | SPAWN/**CRITIQUE_BLOCK** | CR#1 | BLOCKER: t3/t4/t5/t6 over-scoped — an FE following them verbatim would block or improvise an incompatible refactor |
| 55–57 | 05-20 19:42–19:58 | SPAWN/SPAWN/**CRITIQUE_PASS** | PM#2, CR#2 | rev1: t4→t4a+t4b, t5→t5a+t5b, t6→t6a+t6b; t3 (6 files) acknowledged |
| 58 | 05-20 19:55 | SPAWN | PM#3 | Plan amendment (warning-resolution): t6a→t5b edge is conservative/serialized-by-convenience |

**Feedback loops:** 1 (plan-time). **Root cause:** original packets bundled multi-file FE work past the 3-file ceiling. **This is the model working as intended** — caught before a single line of code, the cheapest possible place.

### Implementation waves (2026-05-20)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 59–62 | 05-20 19:58–20:45 | SPAWN/COMPLETE | UI#1, BE#1 | t1 design spec; t2 `session.getRaw` BE |
| 63–64 | 05-20 20:08–20:10 | SPAWN/AUDIT_PASS | AU#1 | t2 PASS |
| 65–72 | 05-20 20:12–20:25 | FE+audit ×2 | FE#1/2, AU#2/3 | t3a nav-state PASS; t3b router-scaffold PASS (first-pass) |
| 73–78 | 05-20 20:25–20:39 | FE+audit ×2 | FE#3/4, AU#4/5 | t4a data-layer PASS; t4b list-page PASS (first-pass); ENV_PREFLIGHT pass (seq 79) |
| 81–87 | 05-20 20:40–20:52 | FE+audit | FE#5/5b, AU#6/7 | t5a detail-shell: **AUDIT_FAIL** (QA) → remediate → PASS |
| 88–90 | 05-20 20:52–20:58 | SPAWN | FE#6, AU#8 | t5b built; audit AU#8 spawned — **session interrupted here** |

**Feedback loops:** 1 (t5a). **Root cause of t5a fail:** the e2e asserted tab-panel stubs with `toBeVisible()`, but the stubs are zero-dimension placeholder divs (`data-testid=...-stub`); the correct matcher is `toBeAttached()`. Spec-only remediation.

### Resume + Wave 4 (2026-05-25)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 91 | 05-25 18:23 | RESUME | ORC#1 | Resumed at interrupted t5b audit |
| 92–97 | 05-25 18:24–18:49 | audit/FE/audit | AU#9, FE#7, AU#10 | t5b: **AUDIT_FAIL** (QA) → remediate → PASS |
| 98–99 | 05-25 18:58 | ENV_PREFLIGHT/SPAWN | ORC#1, FE#8 | t6a editor-hooks dispatched — **interrupted, no output returned** |
| 100–104 | 05-25 20:28–20:37 | RESUME/SPAWN/COMPLETE/audit | ORC#1, FE#9, AU#11 | t6a re-dispatched; FE#8 had partially written `useSessionSave.ts` (untracked), `useSessionRaw.ts` missing → completed → **PASS** |
| 105–108 | 05-25 20:40–20:54 | FE/audit | FE#10, AU#12 | t6b EditorTab + e2e (17/17) → **PASS** |
| 109–112 | 05-25 21:05–21:19 | **VERIFY_FAIL**/FE/audit | ORC#1, FE#11, AU#13 | Step 4.5 human smoke caught invisible textarea → contrast remediation → re-audit **PASS** |

**Feedback loops:** 3 (t5b QA fail; t6a interruption+partial-state recovery; t6b contrast post-verify). **Root cause of t5b fail:** the new e2e selected the *first* session row, which happened to be `gander-p7-obsidian-l2-l3` with `agents=0` → TableTab rendered its empty state, so the asserted "Agent ID" column header didn't exist. Fixture-dependent test. Spec-only remediation (select a row known to have agents).

**Deviation from PM brief:** None in scope. The only structural addition was BE `session.getRaw` (t2), which was anticipated at intake via the critical-seam finding, not a drift. `session.getRaw` was already committed in S1's tail (`530a2e3`).

---

## 3. Post-Delivery: Runtime Bugs (if any)

### Editor textarea text invisible (contrast collapse)

**Reporter:** Human, at Step 4.5 manual verification.
**Error:** Editor tab markdown text was the same color as the textarea background — appeared blank, legible only when selection-inverted (OS highlight). Save/revert/tabs/Analyze all functioned correctly.
**Detected:** 2026-05-25, after t6b had already passed full SA/QA/SX audit (seq 108).

**Root cause:** Token-system collision. The shared Shadcn `Textarea` primitive (`packages/client/src/components/ui/textarea.tsx`) defaults to Tailwind classes `bg-transparent text-foreground`. `globals.css` ships the **stock Shadcn light `:root`** (`--foreground: oklch(0.145 0 0)` ≈ black) alongside a `.dark` block, but the app paints surfaces with the **FF7 Mako dark palette** (`--sfm: #122420`). With the light `:root` active, `text-foreground` resolved to near-black over the dark teal surface → invisible. `EditorTab` passed only `fontFamily/fontSize/resize` and inherited the primitive's defaults. The sibling tabs (`OverviewTab`, `TableTab`) never hit this because they set FF7 tokens explicitly (`color: var(--wd)`/`var(--w)`) and never rely on `text-foreground`.

**Fix applied:** `54ede0b` — override the primitive on `EditorTab`'s `<Textarea>` with explicit FF7 tokens: `color: var(--w)` (#fff) on `background: var(--sfm)` (#122420) ≈ 10.5:1 contrast (WCAG AA), `border: var(--bd)`, `caretColor: var(--mt)`. Shared primitive left untouched (no blast radius on other consumers). Added an e2e regression test asserting computed `color !== backgroundColor` and a non-transparent background.

**Why agents did not catch this:** Three gates and a full audit all passed:
- **SA** checks "no raw hex / design tokens used" — passed precisely *because* the textarea used no color at all (it relied on the primitive's classes). The check has no notion of a token-system mismatch.
- **QA** e2e asserted the textarea `value` is non-empty — never asserted rendered contrast.
- **The auditor's manual SA review** read `text-foreground` as "uses a token" and did not trace that token to the wrong (Shadcn light) system.
- No visual/contrast smoke exists for ordinary components. `react-flow-render-smoke` closes the *React-Flow* visual blindspot only; a plain `<textarea>` matches none of its trigger tokens. The same class of bug (rendered-but-invisible) recurred outside RF's coverage.

---

## 4. QA Gap Analysis

**Current QA protocol:** Auditor runs SA (standards/naming/tokens/a11y grep) → QA (`npm run lint` + Playwright e2e + server vitest) → SX (secrets/injection). `react-flow-render-smoke` adds a real-browser DOM-presence assertion when RF trigger tokens appear in the diff.

**What this caught:**
- t5a: wrong Playwright matcher (`toBeVisible` on a zero-dimension stub) — QA, deterministically.
- t5b: fixture-dependent assertion (row with `agents=0`) — QA, deterministically.
- t6a/t6b: lint, contract correctness, SC6/SC7 structural guarantees (buffer-preserved-on-error verified by *absence* of `setEditBuffer` in error paths), path-traversal defense-in-depth on `saveEdit`.
- Plan-time over-scoping — Critic, before any code.

**What this missed:**
- **Rendered contrast** of a component consuming a Shadcn primitive (the invisible textarea) — no gate evaluates computed `color` vs `background-color` for non-RF components.
- **Token-system divergence** — nothing flags a component that imports a `ui/*` primitive but sets no explicit color/background, leaving it at the mercy of which token system `globals.css` has active.
- **e2e determinism** — the auditor proved (by stashing the scoped files back to HEAD) that the s2 spec is **flaky on unmodified `main`**: a list-render test always races, plus a rotating row-click/detail test. The "17/17"/"18/18" green runs reported by FE were partly luck. No gate measures flakiness (e.g., repeat-N runs).

**Recommendations:**
- Add a deterministic computed-style contrast assertion to the FE audit path (see §6 gap 1).
- Reconcile the Shadcn base tokens onto FF7 values in `globals.css` so primitives default correctly (see §6 gap 2) — the root fix, not per-component overrides.
- Add a test-hardening pass that replaces fixed timeouts with explicit "rows loaded"/"detail visible" waits and pins data-dependent assertions to deterministic fixtures.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|-----------------|-------|
| PM | 1 decomposition (+2 revs) | n/a (Critic-gated) | rev1 cleanly resolved the BLOCKER; amendment was a low-risk edge clarification |
| Critic | 2 reviews | n/a | BLOCK then PASS — caught the over-scope at the cheapest point |
| UI | t1 design spec | n/a (no audit gate) | Spec consumed by t5b/t6b |
| BE | t2 `session.getRaw` | 100% (1/1) | PASS first audit |
| FE | t3a,t3b,t4a,t4b,t5a,t5b,t6a,t6b | ~75% first-pass audit (6/8) | t5a + t5b failed first audit (both e2e, spec-only fixes); t6a interrupted twice (recovered); t6b passed audit but failed human verify (contrast) |
| Auditor | 13 audits | — | 3 FAILs all correctly diagnosed; **but passed t6b despite the invisible textarea** — the one miss |

**Most impactful single agent action:** The Critic's seq-54 BLOCK. Splitting t3/t4/t5/t6 before dispatch prevented an FE agent from improvising an incompatible refactor mid-wave — the difference between a clean wave and a multi-cycle remediation cascade.

**Recurring failure pattern:** Two of three audit fails (t5a, t5b) were **e2e tests coupled to incidental render/fixture state** rather than to behavior — wrong visibility matcher; first-row-has-no-agents. The pattern is "the test asserts against whatever the DOM/data happened to be," not "the test asserts the contract." Pairs with the §4 flakiness finding: the same spec is non-deterministic on HEAD.

---

## 6. Protocol Gaps Identified

> **Code-not-prompt check applied:** gaps 1, 3 are deterministic checks/hooks, not agent instructions — marked for HR.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| **1. No contrast/visual smoke for non-React-Flow components** | A fully-audited component shipped with invisible text; human caught it at Step 4.5 | Implement as a **deterministic Playwright sub-check** (skill, sibling to `react-flow-render-smoke`): for any FE diff adding a component that renders a Shadcn `ui/*` primitive, assert computed `color !== background-color` and background not transparent. Route to **HR/hone** (new skill `component-contrast-smoke`). |
| **2. Shadcn token system unreconciled with FF7 palette** | `globals.css` carries stock Shadcn light `:root`; any component relying on `text-foreground`/`bg-*` defaults renders wrong on the Mako dark surface — latent across every primitive | Reconcile: map Shadcn base tokens (`--foreground`,`--background`,`--input`,`--ring`,`--muted-foreground`) onto FF7 equivalents in `globals.css :root` so primitives default correctly. Route to a small **DS/FE follow-up**. (Until then, an SA-grep flagging "imports `ui/*` primitive without explicit color/background" is a cheap stopgap.) |
| **3. SubagentStop seq-integrity hook emits malformed COMPLETE events** | COMPLETE auto-logs showed `seq:999`, duplicate seqs (77,79), `00:xx` timestamps, and generic `agent_id` (`FE#1`); required manual normalization twice this session | Fix `~/.claude/hooks/subagent-autocomplete.sh` to read the last seq from the log + increment, stamp real UTC `ts`, and carry the corresponding SPAWN's `agent_id`. **Recurring — already flagged in S1 §6.** Route to **HR**, priority raised. |
| **4. Pre-existing e2e flakiness ungated** | s2 spec is non-deterministic on unmodified HEAD; green runs are partly luck; erodes trust in QA's e2e signal | Test-hardening task: replace fixed timeouts with explicit `await expect(rows).toHaveCount(>0)` / `detail visible` waits; pin row-selection tests to a fixture with agents. Optionally add a repeat-N flakiness gate to `audit-pipeline` for new specs. |
| **5. e2e tests coupled to incidental DOM/fixture state** | 2 of 3 audit fails (t5a matcher, t5b first-row) | FE/auditor checklist item: zero-dimension stubs use `toBeAttached`; data-dependent assertions select a deterministic fixture, never "first row." Low-effort spec-author guidance. |
| **6. `SESSIONS_EDITS_DIR` runtime output not gitignored** | `packages/server/sessions-edits/` appeared untracked after a save round-trip during Step 4.5 | Add `packages/server/sessions-edits/` (and the default edits dir) to `.gitignore`. Trivial. |

---

## 7. Final Deliverable State

**App/Service:** `~/projects/gander-studio-alpha` (client + server workspaces).
**Build:** `npm run lint` clean — `tsc --noEmit` across shared/server/client, exit 0.
**Runtime:** Confirmed working — Sessions list loads (16 sessions/0 skipped), tabs switch without data-fetch remount, Editor pre-fills/saves/reverts (human-confirmed functional at Step 4.5), Analyze disabled. Contrast fix applied + re-audited; final human visual re-confirm pending.

**Features delivered:**
- Top-level **Sessions** nav mode (alongside Browse/Compose/Edit/Export; existing pages untouched) — SC1.
- **List page** with per-session row (sprint/date/status/gap-classes), empty + error states — SC2.
- **Detail shell** with Overview/Table/Editor tabs + no-remount data fetch — SC3.
- **Overview** (frontmatter + agent/loop counts/status, Mako tokens) — SC4.
- **Table** (sortable, keyboard-navigable agent-activity table) — SC5.
- **Editor** (Textarea bound to store, pre-fill via `session.getRaw`, save via `session.saveEdit`, revert, inline "Saved to: {path}") — SC6/SC7.
- **Analyze** reserved, `aria-disabled` + `title="Coming in S3"` — SC8.
- Lint/type clean — SC9. Manual smoke — SC10 (functional pass; contrast bug found+fixed).

**Key contracts the next engineer needs:**
- `session.getRaw({ id }) → { content: string }` (`SessionRawOutputSchema`, schemas.ts:104; router.ts:503) — the editor pre-fill read path.
- `session.saveEdit({ id, content }) → { success, filePath }` — server builds the target path under `SESSIONS_EDITS_DIR` via `validateSaveEditPath()` (path-traversal guard → `FORBIDDEN`); client sends no paths.
- Store contract: `useSessionStore` exposes `editBuffer`/`originalContent`/`lastSaveResult`/`lastSaveError` + setters; `useSessionRaw` seeds `editBuffer` only when empty (SC6); `useSessionSave` never clears `editBuffer` on error (SC7).
- **Token caution for S3:** do not rely on Shadcn primitive color/background defaults — set FF7 tokens explicitly until gap 2 is fixed.

**Commits (10, on `main`, unpushed):** `530a2e3` (getRaw, S1 tail), `5a68221`, `fb7f6d0`, `32523c5`, `68558a9`, `fc775de`, `8932578`, `f6a864d`, `7fad3d3`, `54ede0b`.

**Remaining close-out:** requirements-validate (SC1–SC10 traceability) → archivist (log S2 DONE) → human push. Program: S2 done unblocks `/skein prog-studio-sessions-2026-05` once S3 resolves.

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| dispatch-task | 1 | VALUABLE | ORC | NEVER | Drove the full PM→Critic→FE→Auditor pipeline across both sessions |
| resume-project | 2 | VALUABLE | ORC | NEVER | Clean resume from interruption twice (t5b audit; t6a partial) — restored state without re-deriving |
| env-preflight | 2 | VALUABLE | ORC | NEVER | Confirmed server liveness before FE/e2e waves (seq 79, 98) |
| audit-pipeline | 13 | PARTIAL_VALUE | Auditor | NEVER | Caught 3 e2e fails + plan issues, but passed t6b with invisible text — see 8c |
| react-flow-render-smoke | 0 | NOT_TRIGGERED | Auditor | NEVER | Correctly skipped (no RF tokens) — but its *absence of a general analog* is the t6b gap; see 8d |
| commit-packet | 0 (manual equiv) | LOW_VALUE | ORC | NEVER | ORC committed via scoped `git add <paths>` directly rather than invoking the skill; outcome equivalent — see 8c |

### 8b. Obsolescence Candidates

| Skill | Consecutive non-value sprints | Evidence | Recommended action |
|-------|------------------------------|----------|--------------------|
| _(none)_ | — | — | — |

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|-----------------|--------------------|
| audit-pipeline | Passed t6b SA/QA/SX despite an invisible (contrast-failing) textarea; SA "tokens used" check has no contrast/visual dimension for non-RF components | AMBIGUOUS_STEP (SA treats "uses a token" as sufficient; no computed-style check) | CLARIFY + add a contrast sub-check hook (pairs with 8d) |
| commit-packet | Not invoked; ORC hand-rolled scoped staging instead | AMBIGUOUS_STEP (when ORC commits inline mid-resume, the skill's invocation point is unclear) | CLARIFY the resume/inline-commit entry point |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|---------------------------|----------------------|
| Real-browser computed-style assertion that a component's text is readable against its surface (color ≠ background, non-transparent bg) for non-React-Flow components | 1 (the bug that escaped) | MEDIUM | `component-contrast-smoke` |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|----------------|---------------|
| react-flow-render-smoke | Scoped to RF node/edge tokens, but the visual-blindspot class it was built to close (rendered-but-invisible) generalizes to any component; t6b proved the gap | Generalize its mandate (or spawn `component-contrast-smoke` per 8d) so the contrast/visibility check fires on any new rendered component, not only RF diffs |

### Hand-off to hone

Post-mortem Section 8 complete. 6 skills logged. 0 obsolescence candidates, 2 content-quality candidates, 1 new skill candidate, 1 drift candidate. Run the `hone` skill to act on these findings.
