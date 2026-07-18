<plan_critique>
  <plan_id>prog-studio-v2-2026-07-s5-integration</plan_id>
  <status>PASS</status>

  <challenges>

    <challenge>
      <type>OVERSCOPED</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s5-integration-t3</task_ref>
      <description>t3 touches FOUR distinct files (verified this turn): packages/client/src/AppShell.tsx,
packages/server/src/router.ts, packages/server/src/parsers/__tests__/program-dag-parser.test.ts,
docs/v2-vision/v2-design-spec.md. The mandatory FE 4-file split trigger is literally met. I am NOT
issuing this as a BLOCKER because the rule's cognitive-context rationale (provenance
gander-studio-p2-agent-cards §5 — CardNode CREATION + constant additions + signature/prop CHANGES,
i.e. code authoring across 4 files) does not fire here: all four edits are comment-TEXT-only (zero
code, zero interdependency, single "stale-comment" fix class), the requirement brief explicitly
sanctioned "mechanical same-class comment fixes ... all 4 cited locations in one packet as a single
fix class," and SC-3h (lint x3 + build, comments are tsc-invisible) guards against accidental code
change. Blocking would force a split the brief author consciously authorized, for ~zero
regression-risk reduction.</description>
      <required_revision>No revision required. Optional: ORC may split t3 along the client/server/docs
seam (AppShell → one packet; router.ts + program-dag-parser.test.ts → one; v2-design-spec.md → one)
if it wants finer per-file audit granularity — the four edits are trivially file-disjoint. Surfaced
for conscious ratification, not correction.</required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>SPRINT</task_ref>
      <description>The PM numbers each packet's success criteria LOCALLY (t1 = SC-1a..SC-1f, t2 =
SC-2a..SC-2d, t3 = SC-3a..SC-3h, t4 = SC-4a..SC-4d), but the PROGRAM requirement numbering is
off-by-one from these prefixes: t1 discharges program SC-2, t2→SC-3, t3→SC-4, t4→SC-5 (per the
task-packet header comments and verbatim_deliverable_audit). Two collision hazards: (1) program SC-1
is DISCHARGED (human-ratified 2026-07-18), yet t1's criteria are prefixed "SC-1a/1b/1c" — an auditor
skimming for the discharged item could mis-associate. (2) An auditor verifying "did we satisfy
program SC-2?" who greps the packets for "SC-2" lands on t2's "SC-2a (decision recorded)" (which is
actually program SC-3), not t1. The verbatim_deliverable_audit crosswalk (SC-2→t1 ... SC-5→t4) is
correct and present, so intent is recoverable — this is a traceability hazard, not a functional
defect.</description>
      <required_revision>Optional: PM adds a one-line crosswalk header to each packet's
success_criteria block (e.g. t1: "criteria below discharge PROGRAM SC-2 / residue 1"), or renumber
the intra-packet labels to match the program SC. Not blocking.</required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s5-integration-t1</task_ref>
      <description>t1 replaces ReviseSpecAction's hand-rolled deterministic focus block
(hasFocusedOnOpenRef + reset useEffect + useLayoutEffect, verified this turn at lines 97/99-103/105-116)
with a wrapper focusOnReady mechanism. The cold-open-lands-on-textarea behavior is timing-subtle
(base-ui resolves initialFocus on one synchronous microtask before the async trpc query resolves and
the Textarea mounts). A lint+build PASS does NOT exercise this. The only functional guard is SC-1e's
s3-drilldowns suite — which I confirmed exists at 8/8 GREEN in the s5 baseline-green artifact (lines
41-48, zero s3-drilldowns entries in baseline-red), so the "8/8" assumption is sound. Risk is solely
that the auditor lint-only-passes t1 without running the suite.</description>
      <required_revision>GATE-AUDIT brief must explicitly require running
packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts (PROOF 3a at :158 exercises
the revise-dialog focus path) and confirming 8/8, not merely lint/build. PM risk_flag 8 already flags
this; ensure it reaches the audit spawn brief.</required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s5-integration-t3</task_ref>
      <description>SC-3b greps only for the token 'exportRouter.spawn' (verified this turn at
program-dag-parser.test.ts line 203). But the ENTIRE comment block lines 197-203 documents the
fully-removed export.spawn / EXPORT_BASE_DIR guard (per CLAUDE.md, export.spawn removed in s4 BE-1 and
EXPORT_BASE_DIR is deprecated/unused). An agent that deletes only line 203 satisfies SC-3b while
leaving lines 197-202 describing a removed feature — residual staleness passing a green SC. This is
NOT a plan defect: brief item 6b scoped the correction to line 203's citation only, and the PM
faithfully honored that scope. Surfaced as a forward note so the agent/auditor can optionally clean
the whole block rather than just the grepped line.</description>
      <required_revision>None required (in-scope-faithful). Optional: t3 agent may correct/remove the
whole 197-203 export.spawn documentation block as a single coherent edit rather than only line 203,
since the block as a whole is stale.</required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
Top forecast: (1) t1's focus-behavior refactor is the single item most likely to regress-silently if
the auditor lint-passes without running the s3-drilldowns suite — the async focus timing is invisible
to tsc/build. The suite exists at 8/8 baseline-green (verified), so a real run is a reliable guard; a
skipped run is the exposure. (2) The intra-packet SC-Nx labels being off-by-one from program SC
numbers (with program SC-1 discharged) is the most likely source of auditor traceability confusion at
sign-off. Neither blocks execution.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
Consulted via the PM's pm_preflight_acknowledgement + risk_flags mapping to
prog-studio-v2-2026-07-s4-retirement.md §6 (G1-G6): G2 deny-rail workarounds — structurally answered
by t3's enumerate→ORC deletion-rail routing (agent runs no rm/find-delete/fs-API/rmdir; denials
surfaced); G6 plan-time-unverified-inherited-fact — every packet precondition tagged verified-on-disk
or ORC-verified-not-PM-read, and I independently re-verified the load-bearing on-disk facts this turn
(dialog.tsx 98 lines/no initialFocus, popover.tsx zero focus handling, ReviseSpecAction focus block
97-116, RelationshipPanel constants 41-44, deferred-work.md ledger format, the three paraphrased grep
tokens all EXACT on-disk, s3-drilldowns 8/8 baseline-green). SC-precheck report attached (0 findings);
manual locked-value fallback scan performed — no SC contradicts its pinned deliverable. Recurrence
declaration present (3 recurring_pattern elements) — MISSING_RECURRENCE_DECLARATION does not fire.
  </post_mortem_patterns_checked>
</plan_critique>
