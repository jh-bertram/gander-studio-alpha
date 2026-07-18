# Plan Amendment 1 — prog-studio-v2-2026-07-s5-integration (PM)

Standalone addendum to `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-PM-1784347058.md`.
Read alongside it. Critic verdict: CRITIQUE_PASS, 0 BLOCKERs, 4 WARNINGs
(`.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-CR-1784347867.md`). This amendment is
SC-level ONLY — no structural change: agent_count stays 4 (t1–t4), no packet added/removed/reordered,
wave structure and dependency_order unchanged.

<plan_amendment scope="SC-tightening + out_of_scope + risk-acknowledgement only" structural_change="none" agent_count="4">

<!-- ═══ WARNING 1 — OVERSCOPED (t3): explicit risk acknowledgement, ORC-ratified KEEP ═══ -->
<amendment ref="t3" type="risk_acknowledgement" critique="OVERSCOPED / WARNING">
  <resolution>KEEP t3 as one packet — ORC-ratified. No split.</resolution>
  <acknowledgement>
The mandatory FE 4-file split trigger is LITERALLY met (t3 touches AppShell.tsx + router.ts +
program-dag-parser.test.ts + v2-design-spec.md). It is consciously accepted, not overlooked, because
the split rule's binding rationale does not apply to this packet:
- The split rule's cognitive-context provenance (gander-studio-p2-agent-cards §5) is CODE AUTHORING
  across 4 files — CardNode CREATION + constant additions + signature/prop CHANGES with cross-file
  interdependency. That is the load a single agent's context cannot hold across 4 files.
- t3 authors ZERO code. All four edits are comment-TEXT-only, mutually independent, and a single
  "stale-comment" fix class. There is no cross-file logic, no shared type, no build-order coupling —
  the failure mode the split rule guards (an agent losing track of interacting code across files) is
  structurally absent.
- The requirement brief EXPLICITLY sanctioned the exception: "mechanical same-class comment fixes,
  which may enumerate all 4 cited locations in one packet as a single fix class." Splitting would
  overturn a scope the brief author consciously authorized, for ~zero regression-risk reduction.
- SC-3h (lint x3 + client build; comments are tsc-invisible) mechanically guards against any
  accidental code change slipping into a comment-only sweep.
The Critic reached the same conclusion (downgraded to WARNING, "Blocking would force a split the brief
author consciously authorized, for ~zero regression-risk reduction"). ORC ratifies KEEP.
  </acknowledgement>
</amendment>

<!-- ═══ WARNING 2 — AUDIT_RISK (sprint-wide): intra-packet SC-label ↔ program-SC crosswalk ═══ -->
<amendment ref="SPRINT" type="sc_traceability" critique="AUDIT_RISK / WARNING">
  <resolution>
Add the authoritative crosswalk below. Intra-packet SC labels (SC-1a…, SC-2a…, etc.) are LOCAL to
each packet and are off-by-one from the PROGRAM success-criteria numbers. Program SC-1 is DISCHARGED
(human-ratified 2026-07-18) and is NOT re-verified this sprint — do NOT associate any t1 "SC-1x" label
with the discharged program SC-1. REQVAL and the auditor MUST trace via this table, not by grepping a
bare "SC-2"/"SC-1" string (which lands on the wrong packet).
  </resolution>
  <sc_crosswalk>
| Packet | Local SC labels        | Discharges PROGRAM SC | Residue item | Program SC text (abbrev) |
|--------|------------------------|-----------------------|--------------|--------------------------|
| —      | (already discharged)   | PROGRAM SC-1          | drift item 1 | SC-5 amendment ratify/reject — HUMAN-RATIFIED 2026-07-18, NOT in this sprint |
| t1     | SC-1a, 1b, 1c, 1d, 1e, 1f | PROGRAM SC-2       | residue 1    | ui Dialog(+Popover) safe-focus wrapper; ReviseSpecAction migrated; dialog e2e (s3 8/8) green |
| t2     | SC-2a, 2b, 2c, 2d      | PROGRAM SC-3          | residue 2    | RelationshipPanel legible at half width — re-tune OR recorded accept |
| t3     | SC-3a, 3b, 3c, 3d, 3e, 3f, 3g, 3h | PROGRAM SC-4 | residue 3    | Hygiene sweep — dirs/files removed, 4 stale comments corrected, lint x3 + build green |
| t4     | SC-4a, 4b, 4c, 4d      | PROGRAM SC-5          | residue 4    | deferred-work Accuracy row; guarded-push flagged (not edited) |
  </sc_crosswalk>
  <note>
The original PM file's `verbatim_deliverable_audit` already maps program SC-2→t1 … SC-5→t4 correctly;
this table is the reciprocal (local-label → program-SC) so the traceability is bidirectional and
grep-unambiguous. Auditor/REQVAL: verify "program SC-N satisfied?" via the packet in the SC column,
never by string-matching a local "SC-Nx" prefix.
  </note>
</amendment>

<!-- ═══ WARNING 3 — AUDIT_RISK (t1): GATE-AUDIT must actually RUN the s3-drilldowns suite ═══ -->
<amendment ref="t1" type="sc_tightening + gate_audit_instruction" critique="AUDIT_RISK / WARNING">
  <tightens>SC-1e (and the GATE-AUDIT brief for t1)</tightens>
  <resolution>
The t1 focus refactor is timing-subtle (base-ui resolves initialFocus on one synchronous microtask
BEFORE the async trpc query resolves and the Textarea mounts) and is INVISIBLE to lint/build. A
lint+build-only audit of t1 is an AUDIT GAP. Tighten SC-1e and bind the GATE-AUDIT brief:

  GATE-AUDIT (t1) — MANDATORY EXECUTION, not lint-only: the auditor MUST actually execute the
  s3-drilldowns e2e suite from `packages/client`:
      npx playwright test tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts
  and REPORT the observed pass count vs the s5 baseline-green 8/8. PROOF 3a (per the Critic's read,
  spec :158) exercises the revise-dialog focus path, so this run is the real functional guard for the
  focus migration. An auditor verdict for t1 that shows only lint/build PASS and does NOT report an
  observed s3-drilldowns run count is INCOMPLETE and must not close t1.
  The Critic independently confirmed the suite is 8/8 GREEN in the s5 baseline-green artifact (zero
  s3-drilldowns entries in baseline-red), so the 8/8 target is sound; the only exposure is a SKIPPED
  run. Observed count < 8 that reproduces on the baseline is pre-existing (baseline-bisect receipt
  required per standards.md); observed count < 8 that is green on baseline is INDUCED by t1 → FAIL.
  </resolution>
</amendment>

<!-- ═══ WARNING 4 — AUDIT_RISK (t3): SC-3b — rewrite the whole 197-203 block, not just the token ═══ -->
<amendment ref="t3" type="sc_tightening" critique="AUDIT_RISK / WARNING">
  <tightens>SC-3b + t3 <description> section (A)(b) + t3 must_contain</tightens>
  <resolution>
SC-3b as originally written greps only the `exportRouter.spawn` token (line 203), but the ENTIRE
comment block at `packages/server/src/parsers/__tests__/program-dag-parser.test.ts:197-203` documents
the fully-removed export.spawn / EXPORT_BASE_DIR guard (export.spawn removed in s4 BE-1;
EXPORT_BASE_DIR deprecated/unused per CLAUDE.md). Deleting only line 203 would satisfy the token grep
while leaving 197-202 describing a removed feature — residual staleness passing a green SC. Tighten:

  SC-3b (REVISED): after the edit, the 197-203 comment block must no longer describe
  `exportRouter.spawn` (or the removed export.spawn / EXPORT_BASE_DIR guard) as the actual/live guard.
  Two-part check — BOTH required:
    (i) token grep: `grep -c 'exportRouter.spawn' packages/server/src/parsers/__tests__/program-dag-parser.test.ts` == 0; AND
    (ii) block coherence: the surrounding 197-203 comment block is rewritten to reflect post-s4
         reality (no residual sentence presenting a removed export.spawn/EXPORT_BASE_DIR guard as
         current). The t3 agent MUST quote the corrected block text verbatim in its completion_packet
         so the auditor verifies block coherence, not just token absence.
  t3 <description>(A)(b): correct/remove the whole 197-203 export.spawn documentation block as one
  coherent edit, not only the line-203 citation.
  t3 must_contain: add "the corrected program-dag-parser.test.ts 197-203 block text, quoted verbatim."
This stays within the "stale-comment" fix class (still comment-TEXT-only; no code/assertion change) —
the packet's OVERSCOPED posture and out_of_scope are unaffected.
  </resolution>
</amendment>

<!-- ═══ Folded ORC ratifications (surfaced in the original PM file, now CLOSED) ═══ -->
<amendment ref="t3" type="ratification_closure">
  <closed_item id="THREE-DIRS">
Original risk_flag 1 (brief-internal "two empty dirs" vs ls-verified THREE browse/edit/graph):
RESOLVED — ORC ratifies THREE. t3 enumerates all three (`packages/client/src/components/{browse,edit,graph}/`)
for GATE-ORC-DELETE rmdir; the brief's "two" is a confirmed slip. Closed; no further action.
  </closed_item>
  <closed_item id="FE-OWNS-T3-T4">
Original routing note (cross-domain owner — t3 client+server+docs comments, t4 pure docs, assigned to
the sole quoted implementer frontend-engineer): RESOLVED — ORC ratifies FE keeps t3 AND t4; no split
to a backend/docs owner. The merge option (t3+t4 into one packet) is declined — packets stay separate
for single-fix-class audit clarity. Closed; no further action.
  </closed_item>
</amendment>

<!-- ═══ Unchanged scope (pin) ═══ -->
<unchanged>
All else in the original PM decomposition stands verbatim: task packets t1–t4, wave structure
(Wave 1 parallel → GATE-ORC-DELETE → GATE-AUDIT), deletion-rail routing, all other SCs
(SC-1a/1b/1c/1d/1f; SC-2a-2d; SC-3a/3c/3d/3e/3f/3g/3h; SC-4a-4d), out_of_scope blocks,
pm_preflight_acknowledgement, verbatim_deliverable_audit, expectation_manifest, and the remaining
risk_flags (2–8). This amendment adds a crosswalk table, tightens SC-1e's audit-execution binding and
SC-3b's block-coherence check, records the OVERSCOPED-KEEP acknowledgement, and closes two
ratifications. No packet was added, removed, reordered, or re-decomposed.
</unchanged>

</plan_amendment>
