# Archivist Output: gander-studio-p2-agent-cards Post-Mortem Archive

**Task ID:** gander-studio-p2-agent-cards-postmortem  
**Agent:** AR (Archivist)  
**Timestamp:** 2026-04-27T12:00:00Z  
**Status:** COMPLETE

## Summary

Post-mortem for sprint gander-studio-p2-agent-cards has been archived. The sprint delivered CardNode surface and agent role classification (35/36 requirements COVERED; 1 PARTIAL on proximity edge regression HCG-2).

## Archive Entry

The following `<archive_entry>` has been appended to `docs/project_log.md`:

```xml
<archive_entry>
  <timestamp>2026-04-27T12:00:00Z</timestamp>
  <task_id>gander-studio-p2-agent-cards-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>
    Post-mortem on completed sprint gander-studio-p2-agent-cards (2026-03-30T00:00Z → 2026-04-04T06:25Z, 5.3 days, 3 sessions, 5 implementation tasks). Verdict confirmed: PARTIAL_PASS (35/36 requirements COVERED, 1 PARTIAL on HCG-2 proximity edge regression). Post-mortem analysis surfaced 6 protocol gaps and 2 skill drift candidates, plus 1 content-quality candidate for requirements-validate.

    KEY FINDINGS:

    (1) PM OVERSCOPING PATTERN RECURS (G1): Same 4-files-into-1-task error documented in canvas-link post-mortem (§5, C2). PM#0 v1 packed CardNode creation + 4 design constants + getMateriaColor signature change + MateriaNode prop change into FE-001, forcing critic CR#1 to issue 5 BLOCKERs and 3 WARNINGs. PM revised 3 times (G1 requires 2 full PM-revise → Critic re-block cycles, 2.5h wall-clock). Root cause: despite agent-improvement-2026-03-30-1.md documenting the overscoping pattern and PM.md 1.0.1 mandating pre-decomposition post-mortem read, the PM did not read the canvas-link post-mortem before decomposing. This indicates the feedback loop from post-mortem-into-PM-prompt is not closing. **Lesson:** Mandatory post-mortem read is ineffective without enforcement — PM agent needs a deterministic `pm-preflight.sh` hook that greps the 3 most recent post-mortems for OVERSCOPED patterns and surfaces them as a checklist before decomposition, not as a prose suggestion.

    (2) VERBATIM DELIVERABLE OMISSION (G2): PM#0 v1 silently dropped the human's stated "appearance config file" deliverable (noted in brief overview). Critic CR#1 caught this as C1 SCOPE_DRIFT. Root cause: PM parsed the human's request as a vague narrative ("update colors") rather than extracting nouns/verbs and mapping them to tasks. Alternative considered: defer it with explicit rationale. This was correct, but omission without a deferred block invited the block. **Lesson:** dispatch-task skill needs a `verbatim-deliverable-check` script at Step 1 that parses nouns/verbs from the human brief and requires the PM brief to include each in a task or a `<deferred>` block.

    (3) A11Y CLICK-HANDLER-WITHOUT-KEYBOARD (G3): FE-001b delivered CardNode.tsx with a title-edit `<span onClick=...>` lacking keyboard equivalent (`tabIndex`, `role="button"`, `onKeyDown`). Auditor SA gate caught it on first read (AUDIT_FAIL); FE#2 remediated in 1 cycle (~2h). Root cause: FE#2 performed a visual click-test but did not conduct a keyboard-only walkthrough. **Lesson:** Deterministic grep for this pattern can self-catch it before audit. Add a `PreToolUse:Edit` hook on FE agent that runs `grep -nP 'onClick=' on all .tsx files in diff and fails COMPLETE if any non-button/anchor element lacks a sibling `tabIndex` and `onKeyDown`. This is a code-not-prompt opportunity (G3).

    (4) NODE_TYPES / toRFNode EDGE-RENDERING REGRESSION (G4, ROOT CAUSE OF HCG-2): FE-002 wave modified toRFNode to branch on ORCHESTRATOR_ID returning type:'card'. Audit gates all passed (SA, QA, SX); requirements-validate marked 35/36 as COVERED. But at human visual check (post-delivery), proximity-link edge did not render after snap, though sound played. Post-mortem analysis: Playwright spec in proximity-link.spec.ts asserts on playLink() firing and state mutation, not on the rendered `.react-flow__edge` DOM element. The edge-creation code is present but may not execute (drop handler missing addEdge call) or may not sync to RF state. No audit gate detects visual-only regressions. **Lessons:** (a) Add explicit `.react-flow__edge` assertion to proximity-link.spec.ts post-snap (FE follow-up); (b) Add auditor checklist rule: any diff touching NODE_TYPES, toRFNode, toRFEdge requires a DOM-assertion Playwright test, not just store-state verification (G4).

    (5) AUDIT GATES DO NOT RUN DEV SERVER (G5): Audit pipeline runs lint + Playwright headless. It does not launch the dev server and visually verify rendered output. HCG-2 would have been caught by visual smoke (launch dev, proximity snap, screenshot edges). Alternative considered: add Tier 3 smoke to audit pipeline. This is a heavy lift but necessary for any edge-rendering, z-order, or off-canvas positioning bugs to be visible. Defer to future sprint but document as a known blindspot (G5).

    (6) SOUND-AS-PROXY-FOR-SUCCESS ANTI-PATTERN (G6): proximity-link.spec.ts asserts playLink() fires as proxy for "edge created." When node-type registration changed in FE-002, the sound emission remained decoupled from the edge render. Spec rule: when asserting a side effect (sound, network call, store mutation), also assert the primary user-visible effect (rendered DOM element) (G6).

    SKILL DRIFT & CONTENT-QUALITY CANDIDATES:

    (A) convention-detect not invoked: Skill was defined but not auto-triggered at dispatch-task Step 0.5. Sprint conventions inherited from canvas-link without re-detection. Recommendation: make convention-detect mandatory in dispatch-task flow (drift candidate).

    (B) requirements-validate produced PARTIAL_PASS by static-only verification: Skill correctly identified HCG-2 as PARTIAL but did not catch it by running the app — human visual check found it. Skill currently does traceability only, no runtime verification. When a criterion describes runtime behavior (renders, plays, navigates), skill should spawn a Playwright smoke or surface as REQUIRES_HUMAN_VISUAL (content-quality candidate).

    (C) audit-pipeline lacks Tier 3 visual smoke: Drift candidate. Add explicit note that pipeline cannot catch visual-only regressions; any diff touching NODE_TYPES, canvas rendering, or edge creation needs supplemental manual visual check or Tier 3 automated smoke.

    NEW SKILL CANDIDATES:

    - `pm-preflight` (LOW effort): Grep 3 recent post-mortems for OVERSCOPED / SCOPE_DRIFT patterns; surface checklist before PM dispatch (addresses G1).
    - `react-flow-render-smoke` (MEDIUM effort): Launch dev server, run Playwright snapshot on canvas + edges after proximity snap; diff against baseline (addresses G4/G5).

    AGENT PERFORMANCE:

    | Agent | First-pass | Notes |
    |-------|-----------|-------|
    | PM#0  | 0% (3 BLOCKER cycles) | Overscoping recurrence; pattern not internalized despite prior post-mortem. |
    | CR#1  | 100% (5 BLOCKERs correct) | High-value gate; caught all overscoping issues + logic regression (5-color to 3-color). |
    | DS#1  | 100% | Clean schema + role classification. |
    | FE#1  | 100% | Constants + getMateriaColor signature. |
    | FE#2  | 0% → 100% (SA fail: a11y click handler, 1 remediation) | Keyboard-navigation oversight; auditor caught. |
    | FE#3  | 100% | NODE_TYPES registration + CardNode. Post-delivery HCG-2 regression attributed to this wave, but regression not visible at audit (G4 gap). |
    | FE#4  | 100% | LoadoutListPanel tree layout + Playwright coverage. |
    | AUDITOR (×6) | 100% accuracy | FE-001b FAIL was correct; all PASS verdicts correct. 1 post-delivery regression not caught (G4 gap, not auditor fault). |
    | requirements-validate | PARTIAL | Static-only verification; did not catch HCG-2 by running app (content-quality gap). |

    OVERALL FIRST-PASS RATE: 5/7 auditable agents = 71%. PM contributed 0%, FE#2 failed SA, others clean.

    PATTERN ANALYSIS: PM overscoping (identical to canvas-link C2) recurred despite agent-improvement-2026-03-30-1.md §1 explicitly adding PM.md step 0 "mandatory pre-decomposition read." This indicates mandatory prose steps are insufficient — deterministic hooks (pm-preflight.sh) are required. Recommendation for next improvement session: escalate PM overscoping from prose-based to hook-based enforcement.

    SUMMARY OF 6 PROTOCOL GAPS:
    - G1: PM overscoping recurs; needs pm-preflight.sh deterministic hook, not prose instruction
    - G2: Verbatim deliverable omission; needs verbatim-deliverable-check script in dispatch-task
    - G3: A11y click-handler-without-keyboard; needs PreToolUse:Edit grep hook on FE agent
    - G4: NODE_TYPES changes break edge rendering with no audit signal; needs DOM-assertion spec update + auditor rule
    - G5: Audit gates don't run dev server; visual regressions invisible. Defer Tier 3 smoke but document blindspot
    - G6: Sound-as-proxy-for-success spec anti-pattern; needs spec authoring rule in standards.md
  </rationale>
  <dependencies>
    gander-studio-p2-agent-cards (sprint completion, tasks DS-001, FE-001a/b, FE-002, FE-003, 5 audit waves);
    gander-studio-p2-canvas-link.md (prior post-mortem documenting C2 overscoping pattern);
    agent-improvement-2026-03-30-1.md (attempt to fix overscoping via PM.md prose; did not prevent recurrence);
    proximity-link.spec.ts (Playwright spec asserts on sound, not edge DOM);
    FE-001b AUDIT_FAIL (keyboard-navigation a11y violation);
    FE-002 NODE_TYPES changes (origin of HCG-2 edge-rendering regression)
  </dependencies>
  <retention_keys>
    docs/post-mortems/gander-studio-p2-agent-cards.md (full post-mortem with 8 sections);
    6 protocol gaps identified (G1–G6), ranked by impact:
      G1: PM overscoping pattern (P1, P2 recurring) — needs pm-preflight.sh hook not prose
      G2: Verbatim deliverable omission — needs verbatim-deliverable-check script
      G3: A11y click-handler-without-keyboard — needs PreToolUse:Edit grep hook
      G4: NODE_TYPES / toRFNode change breaks edge rendering — needs DOM-assertion spec + auditor rule
      G5: Audit gates don't run dev server — visual regressions invisible, defer Tier 3 smoke
      G6: Sound-as-proxy-for-success spec anti-pattern — needs standards.md rule
    1 content-quality candidate: requirements-validate (static-only, needs runtime verification option)
    2 new skill candidates: pm-preflight (LOW effort, addresses G1), react-flow-render-smoke (MEDIUM effort, addresses G4/G5)
    2 drift candidates: convention-detect (not auto-invoked), audit-pipeline (lacks Tier 3 visual smoke)
    HCG-2 proximity edge regression: sound plays, no edge renders. Root cause: likely drop handler doesn't call addEdge or RF edges state not syncing. Needs investigation. Posted to /home/jhber/.claude/projects/-home-jhber-projects-gander-studio-alpha/memory/project_proximity_edge_bug.md
    Key contract change: FE-001b keyboard-inaccessible span remediated with role="button", tabIndex={0}, onKeyDown handlers. Pattern now part of accessibility checklist.
    PM.md Step 0 "mandatory post-mortem read" was added in agent-improvement-2026-03-30-1 but did not prevent overscoping recurrence — prose instruction insufficient. Next improvement needs code-not-prompt enforcement (pm-preflight.sh hook).
  </retention_keys>
</archive_entry>
```

## Key Findings from Post-Mortem

### Protocol Gaps Identified (G1–G6)

| Gap | Severity | Issue | Proposed Fix |
|-----|----------|-------|--------------|
| G1 | CRITICAL | PM overscoping recurs despite prose instruction | Deterministic `pm-preflight.sh` hook to grep post-mortems |
| G2 | HIGH | Verbatim deliverable silently dropped | `verbatim-deliverable-check` script in dispatch-task |
| G3 | MEDIUM | A11y click-handler-without-keyboard | `PreToolUse:Edit` grep hook on FE agent |
| G4 | HIGH | NODE_TYPES changes break edge rendering invisibly | DOM-assertion spec update + auditor rule |
| G5 | MEDIUM | Audit gates don't run dev server | Defer Tier 3 smoke, document blindspot |
| G6 | MEDIUM | Sound-as-proxy-for-success anti-pattern | Spec authoring rule in standards.md |

### Skill Opportunities

**Content-Quality Candidate:**
- `requirements-validate`: Currently static-only; should spawn Playwright smoke for runtime behaviors

**New Skill Candidates:**
- `pm-preflight` (LOW effort): Grep 3 recent post-mortems for overscoping patterns; surface checklist before PM dispatch
- `react-flow-render-smoke` (MEDIUM effort): Launch dev server, run Playwright snapshot on canvas edges after proximity snap

**Drift Candidates:**
- `convention-detect`: Not auto-triggered; should be mandatory in dispatch-task flow
- `audit-pipeline`: Lacks Tier 3 visual smoke; needs explicit note that visual regressions are invisible to current gates

### HCG-2 Proximity Edge Regression

- **Issue:** Sound plays after proximity snap, but no React Flow edge renders
- **Detection:** Post-delivery human visual check (not caught by audit gates)
- **Root Cause:** Likely either (a) drop handler doesn't call `addEdge`, or (b) RF edges state not syncing from store
- **Requires:** Investigation in next sprint; FE follow-up with DOM-assertion Playwright test

## Files Written

- **docs/project_log.md**: Archive entry appended
- **.claude/agents/tasks/outputs/gander-studio-p2-agent-cards-postmortem-AR-2026-04-27T120000Z.md**: This output file

---

**Archive complete. Post-mortem documented and available for next improvement session.**
