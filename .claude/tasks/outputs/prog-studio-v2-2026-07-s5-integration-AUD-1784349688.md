# GATE-AUDIT Verdict — prog-studio-v2-2026-07-s5-integration (Wave 1, t1–t4)

Auditor: AUD#1 (distinct spawn from implementers FE#1–FE#4). Parent: ORC#0.
Sequence run: SA → QA → SX, over all four Wave-1 packets in one consolidated verdict.
HEAD at audit time: f2164bb (same commit as the s5 e2e baseline capture point).
Cutover: task_id first SPAWN 2026-07-18 (post-2026-05-28) → v2.0 typed envelope (mechanical, date-governed).

<audit_verdict schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s5-integration</task_id>
  <generated>2026-07-18T04:57:00Z</generated>
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>

  <inputs>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t1-FE-1784348388.md" sha256="278e180099b25c05" task_id="prog-studio-v2-2026-07-s5-integration-t1"/>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t2-FE-1784348388.md" sha256="fd465913d69d5b45" task_id="prog-studio-v2-2026-07-s5-integration-t2"/>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t3-FE-1784348388.md" sha256="fec61ec6658d8567" task_id="prog-studio-v2-2026-07-s5-integration-t3"/>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t4-FE-1784348388.md" sha256="08acb59233a5a50d" task_id="prog-studio-v2-2026-07-s5-integration-t4"/>
    <expectation_manifest path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-PM-1784347058.md" sha256="308c7c3ee37b3e54"/>
    <expectation_manifest path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-amend1-PM-1784348182.md" sha256="88114b3514363476"/>
    <expectation_manifest path="docs/task-registry.md" sha256="fdc8d5f9525b401f"/>
    <event_log path="docs/events/agent-events-2026-07-18.jsonl" entries_consumed="seq=10..19"/>
  </inputs>

  <reviewed_packets>
    <packet task_id="prog-studio-v2-2026-07-s5-integration-t1"/>
    <packet task_id="prog-studio-v2-2026-07-s5-integration-t2"/>
    <packet task_id="prog-studio-v2-2026-07-s5-integration-t3"/>
    <packet task_id="prog-studio-v2-2026-07-s5-integration-t4"/>
  </reviewed_packets>

  <tier1_subchecks provider="sa-subchecks">
    <frontmatter_parse status="N/A">No frontmatter-bearing spec files in scope (app-code + docs only; no .claude/ agent/skill/rule specs).</frontmatter_parse>
    <silent_substitution status="CLEAN">Grep-verified locked values match packet claims: dialog.tsx initialFocus=5/?? false=1 (baseline 0); ReviseSpecAction hasFocusedOnOpenRef=0 (baseline 5); four t3 stale tokens all grep 0. No substituted/paraphrased value passed off as the on-disk value.</silent_substitution>
    <optional_field_empty status="CLEAN">All packet output tags populated (ui_packet / completion_packet fields present and non-empty).</optional_field_empty>
    <pattern_coherence status="CLEAN">Check A (FE .ts/.tsx): dialog.tsx/hook/RelationshipPanel diffs are behavior/constant-only, no raw hex, no token edits, no unguarded onClick. Check B/D (.md): v2-design-spec + deferred-work edits are prose/ledger-format-coherent. PATTERN 0 (diff-scope sanity) clean.</pattern_coherence>
    <frontmatter_type_required status="N/A">No typed frontmatter artifacts in scope.</frontmatter_type_required>
  </tier1_subchecks>

  <sa status="PASS">
    <per_file_review file="packages/client/src/components/ui/dialog.tsx">
      <violations/>
      <notes>SC-1a PASS: DialogContent computes resolvedInitialFocus = initialFocus ?? (focusTargetRef ? () => focusTargetRef.current ?? false : undefined) and passes it to DialogPrimitive.Popup (grep initialFocus=5, ?? false=1). Caller-explicit initialFocus opts out (caller wins). SC-1b PASS: calls useDialogSafeFocus(focusTargetRef, focusOnReady, open). UI-primitive contrast/visual-blindspot judgment applied: change is behavior-only (focus props); no visual/token/hex change (grep 0), so no primitive-visual blindspot risk. New props are documented via JSDoc.</notes>
    </per_file_review>
    <per_file_review file="packages/client/src/components/ui/use-dialog-safe-focus.ts">
      <violations/>
      <notes>NEW hook (44 lines). SC-1b mechanism: reset-on-close useEffect + once-per-open deterministic useLayoutEffect guarded by hasFocusedOnOpenRef; focuses focusTargetRef.current exactly once per open when open&&ready&&ref.current, never re-focuses mid-edit. Faithful extraction of ReviseSpecAction's former inline block. kebab-case filename, typed params, no any.</notes>
    </per_file_review>
    <per_file_review file="packages/client/src/components/detail/ReviseSpecAction.tsx">
      <violations/>
      <notes>SC-1c PASS: grep hasFocusedOnOpenRef=0 (baseline 5); inline initialFocus prop string removed; migrated to focusTargetRef={textareaRef}+focusOnReady={readyToFocus}+open={open}. The two remaining 'initialFocus' hits (lines 87/89) are explanatory COMMENTS, not the inline prop. finalFocus={triggerRef} preserved (explicit, out of default scope).</notes>
    </per_file_review>
    <per_file_review file="packages/client/src/components/ui/popover.tsx">
      <violations/>
      <notes>SC-1d PASS: ACCEPT (ii) path. Zero consumers (grep of from '@/components/ui/popover' = 0), no code written (initialFocus=0). Evidence-backed accept is a sanctioned discharge of the "and Popover if applicable" clause; no speculative Popover consumer invented.</notes>
    </per_file_review>
    <per_file_review file="packages/client/src/components/detail/RelationshipPanel.tsx">
      <violations/>
      <notes>SC-2a/2b/2c PASS: DECISION=RETUNE. Diff header-safe grep +2/-2, confined to RELATIONSHIP_NODE_WIDTH 180→150 and NODE_HORIZONTAL_GAP 220→150 (lines 41–42). No &lt;Handle&gt;, JSX, helper, or edge-building line in diff — RF v12 Handles intact at 149/187. Evidence artifacts viewed by auditor: PM-typical-halfwidth.png (node labels "PM"/"orchestrator" + DETECTED badge + legend legible post-retune) and ORC-worstcase-halfwidth.png (26-node minZoom floor — the width-INDEPENDENT vertical-overflow condition FE#2 correctly flagged as pre-existing and out-of-scope, correctly NOT filed to deferred-work.md which is t4's domain). Measured dims cited (PM fitView 0.735→0.98, effective label ~8.1px→~10.78px).</notes>
    </per_file_review>
    <per_file_review file="packages/client/src/AppShell.tsx">
      <violations/>
      <notes>SC-3a PASS: grep '9-tab'=0. Header comment rewritten to shipped reality (BottomTabBar = &lt;640px fold of same RAIL_ITEMS nav, not a retired fallback). Diff is comment-text only (no non-comment code line in diff).</notes>
    </per_file_review>
    <per_file_review file="packages/server/src/parsers/__tests__/program-dag-parser.test.ts">
      <violations/>
      <notes>SC-3b PASS (amend1 two-part): (i) grep 'exportRouter.spawn'=0; (ii) block coherence — full 197-203 block rewritten to frame export.spawn/EXPORT_BASE_DIR as REMOVED/historical (cites s4 BE-1), no residual sentence presenting the removed guard as live. Comment-only diff; no assertion/logic change.</notes>
    </per_file_review>
    <per_file_review file="docs/v2-vision/v2-design-spec.md">
      <violations/>
      <notes>SC-3c PASS: grep 'Party screen submenus'=0; corrected line references aria-label="Main navigation" per CLAUDE.md §Surfaces. (Header-safe deletion grep undercounts because the edited line is a markdown "- " bullet; the token grep is the authoritative check and passes.)</notes>
    </per_file_review>
    <per_file_review file="packages/server/src/router.ts">
      <violations/>
      <notes>SC-3d PASS: grep 'Planning and program.md'=0; STUDIO_ROOT comment now references only the live program.md role. +1/-1 comment-text only; no procedure/schema change (confirmed no new API boundary in SX scan).</notes>
    </per_file_review>
    <per_file_review file="docs/deferred-work.md">
      <violations/>
      <notes>SC-4a PASS: new ### DEFERRED-V2S1-3 block (non-colliding tag) present with Source/What it is/Why deferred/Schedule-as format; mentions party-stats Accuracy + sprintRoot-family grouping + cross-resolve of same-role FAIL/PASS across tasks (grep accuracy=2). SC-4b PASS: "## Cross-repo reflect-pass intake flags" section with FLAG (cross-repo, do-not-fix-here): guarded-push docs-vs-installed-rail contradiction (grep guarded-push=1). SC-4d PASS: no residue-1 cross-reference added. Append-only; no prior ledger row reformatted.</notes>
    </per_file_review>
  </sa>

  <qa status="PASS">
    <gate_checks>
      lint x3 (canonical 3-package tsc: shared/server/client) — all exit 0 (auditor re-ran, not packet-trusted).
      npm run build -w @gander-studio/client — success; max chunk dist/assets/index-BMKtIo8a.js 407.00 kB (gzip 120.62 kB), well under the 1 MB per-chunk gate; no Vite chunk-size warning.
      SC-4c scope: only docs/deferred-work.md is t4's edit surface; the other changed app files (AppShell/router/program-dag-parser.test/v2-design-spec = t3; dialog/hook/ReviseSpecAction = t1; RelationshipPanel = t2) are Wave-1 siblings in the shared tree, not t4 edits. No file under /home/jhber/projects/gander/ changed. No package.json/lock change this sprint.
      SC-3g: DEFERRED-TO-HUMAN / PENDING-HUMAN-EXECUTION. components/{browse,edit,graph} are STILL PRESENT — ORC's GATE-ORC-DELETE rmdir was DENIED by the permission rail (event seq 18); per deletion-rail integrity the removal is routed to the human, NOT side-doored. This is NOT a t3 defect: t3 correctly ENUMERATED all three dirs as rmdir targets (packet section B) and ran ZERO deletion commands (SC-3e). SC-3f verify-absent for quickcheck{,2}.mjs confirmed by auditor (find returns nothing). This SC closes when the human executes the rmdir; audit passes all other SCs.
    </gate_checks>
    <playwright tier="2">
      amend1 W3 MANDATORY EXECUTION (auditor-run, not packet-trusted): npx playwright test tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts from packages/client → 8 passed / 8 total (21.9s), matching s5 baseline-green 8/8. This suite is the real functional guard: PROOF 3a (spec :158) exercises the t1 revise-dialog cold-open focus path; PROOF 2 (:125) exercises t2's RelationshipPanel edge+legend. Both green.

      Authoritative SERIAL full-suite run (npx playwright test --workers=1 from packages/client; dev servers verified up :5173/:3001, left running): 84 passed / 41 failed (8.8m). Baseline: 82 green / 43 red (125 total both). Reconciliation via comm of file:line:col red-key sets vs the s5 baseline artifacts:
        • comm -23 current-red vs baseline-red then ∩ baseline-green → EMPTY: ZERO green→red regressions (the definitive gate).
        • The single apparent "new red key" s3-t5a-integration.spec.ts:164:28 is a STACK-TRACE ARTIFACT (line 164 is the failing assertion inside the already-baseline-red test at :139:1), absent from baseline-green — not a distinct test, not a regression.
        • Net improvement: two baseline-RED tests are now GREEN (prog-studio-vision-s2-d3-session-buffer.spec.ts:64, prog-studio-vision-s2-d4-prose-slug.spec.ts:133).
    </playwright>
    <defects/>
    <flake_adjudications>
      FE#1 flake claim (s2-d3-session-buffer.spec.ts:151, baseline-GREEN, failed in FE#1's concurrent run):
        OBSERVATION (valid): the test failed in FE#1's run; FE#1 self-scoped stash A/B and observed the failure reproduce on stashed-out baseline.
        ATTRIBUTION: FE#1 labeled it "baseline-red / pre-existing." Auditor discriminating check = the authoritative SERIAL run → :151 is GREEN (0 in current-red; it is baseline-green). FE#1's stash A/B was itself executed CONCURRENTLY against the shared dev servers, so its "reproduced on baseline" receipt inherited the same cross-run interference; the "pre-existing/baseline-red" LABEL is therefore an UNVERIFIED-HYPOTHESIS (discriminating experiment to settle it — a SERIAL re-run — was not performed by FE#1). AUDITOR RESOLUTION: the failure was cross-run interference from concurrent shared-server execution; the test is deterministically GREEN serially. FE#1's bottom-line conclusion "not induced by t1" is CONFIRMED correct by the auditor's serial evidence.
      FE#2 flake claim (s2-party-shell.spec.ts:252, baseline-GREEN, failed 1-of-3 concurrent runs):
        OBSERVATION (valid): 1-of-3-run failure on a party-page focus-timing assertion (code path independent of RelationshipPanel.tsx, which does not render on the party page).
        ATTRIBUTION: "non-deterministic focus-timing flake under 2-worker parallel execution," backed by a 3× A/B showing the fail occurs with AND without the 2-constant diff applied. Auditor discriminating check = authoritative SERIAL run → :252 is GREEN. This CONFIRMS FE#2's flake attribution (parallel-execution timing flake; deterministically green serially) — cited discriminating check (A/B across the diff) is sufficient and corroborated by the serial run. NOT induced by t2.
    </flake_adjudications>
  </qa>

  <sx status="SECURE">
    <threat_level>LOW</threat_level>
    <findings>
      Diff scope is a focus-behavior refactor (t1), two RF layout constants (t2), comment-text (t3), and a docs-ledger append (t4). Added-line scan for secrets/injection sinks (password|secret|api_key|token|process.env|eval|dangerouslySetInnerHTML|exec|string-interp) across all changed app files → 0 matches. No new tRPC procedure / Zod schema / route / user-input boundary (router.ts diff is comment-only; grep for procedure|z.|input(|mutation|query in added lines = 0). No package.json / lockfile change → no new dependency surface. npm audit --omit=dev = 20 vulns (2 low, 9 moderate, 9 high) — the documented pre-existing known-issue baseline (CLAUDE.md §Known Issues records 21); NONE introduced by this sprint. OWASP Top-10 surface unchanged.
    </findings>
  </sx>

  <pipeline_integrity status="OK">
    <evidence>Event log seq 2–19 shows distinct role spawns under ORC#0: PM#0 (decomposition), CR#1 (CRITIQUE_PASS), FE#1–FE#4 (four distinct implementer spawns, seq 10–13), and AUD#1 (this audit, seq 19) — a real multi-agent pipeline, not single-agent/ORC-direct mode. Not a meta-agent sprint (app-code + docs; no .claude/ agent/skill/rule spec edits), so the Meta-Agent Independence Rule's INDETERMINATE trigger does not apply. The one UI primitive touched (dialog.tsx) changed behavior-only (no visual/token change) and is covered by the live s3-drilldowns run, so no VISUAL_BLINDSPOT_PRIMITIVE condition.</evidence>
  </pipeline_integrity>

  <ci status="N/A">
    <workflow_name>none — gh workflow list returned empty (no CI workflow configured for this project)</workflow_name>
    <head_sha>f2164bb</head_sha>
  </ci>

  <auditor_spawn>
    <agent_id>AUD#1</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#1,FE#2,FE#3,FE#4</independent_from>
  </auditor_spawn>

  <overall_status>PASS</overall_status>
  <!-- PASS: sa=PASS AND qa=PASS AND sx=SECURE AND ci=N/A (not FAIL) AND pipeline_integrity=OK.
       One residual HUMAN-owned action item (not an implementer defect, does not block the gate):
       SC-3g rmdir of components/{browse,edit,graph} is PENDING-HUMAN-EXECUTION per deletion-rail
       integrity (rail denial, event seq 18). ORC must track this to final sprint closure. -->
</audit_verdict>

## Open human-owned item (carry-forward, not a gate failure)
SC-3g — removal of the three empty dirs `packages/client/src/components/{browse,edit,graph}`
remains PENDING-HUMAN-EXECUTION. ORC's `rmdir` at GATE-ORC-DELETE was denied by the permission
rail (event seq 18); per deletion-rail integrity the action is routed to the human. t3's own
obligation (enumerate, run no deletion) is fully discharged. This is the sole open item before the
sprint's on-disk state fully matches SC-4/residue-3 intent.
