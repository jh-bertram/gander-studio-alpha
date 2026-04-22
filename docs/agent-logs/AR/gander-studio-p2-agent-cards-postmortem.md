# Post-Mortem: gander-studio-p2-agent-cards

**Date:** 2026-04-04
**Project:** `~/projects/gander-studio-alpha`
**Duration:** Sprint opened 2026-04-01 · Requirements validation 2026-04-04
**Final State:** PARTIAL_PASS — 35/36 requirements covered; proximity edge regression unresolved; advisory items carried forward.

---

## 1. Sprint Summary

### What Shipped

| Task | Agent | Status | Notes |
|------|-------|--------|-------|
| DS-001 | DS#1 | PASS | agent-roles.ts created; CanvasNode.role + cardTitle in store; LoadoutSchema extended |
| FE-001a | FE#1 | PASS | CARD_* constants in canvas.ts; getMateriaColor role fast-path; MateriaNode role prop |
| FE-001b | FE#2 | PASS (after fix) | CardNode.tsx with inline title edit; card-node-title-edit.spec.ts |
| FE-002 | FE#3 | PASS | CardNode registered in NODE_TYPES; toRFNode card branch; zIndex layering |
| FE-003 | FE#4 | PASS | LoadoutListPanel rewritten — 5-role tree (agent roots + skill children + unconnected section) |

### What Didn't Ship

| Item | Disposition |
|------|-------------|
| Plain-text appearance config file | DEFERRED — HCG-1 human confirmed defer |
| Proximity edge regression | KNOWN BUG — link sound plays but no edge renders post-FE-002. Regression from canvas-link sprint. Filed as next-sprint work. |
| Dead-code META_AGENTS branch in compose.ts | Advisory — carried forward. CR-003 flagged it; not blocked for delivery. |
| MateriaPalette 2-param getMateriaColor call in ComposePage.tsx | Advisory — caller not updated this sprint; intentional color changes for dispatcher/ui-designer/system-health-monitor not noted in any acceptance criterion. |

---

## 2. What Went Well

**Planning waves 1, 2, and 4 were clean.** DS-001, FE-001a, FE-002, and FE-003 all passed audit first-pass. No SA violations, no QA failures, no SX issues. The DS-001 compose.ts isolation strategy (adopted in Revision 3 after CR-002 blocked the aliasing approach) was the right call — it eliminated the entire class of transient color regression risk.

**The Critic caught real, non-trivial bugs in both blocking rounds.** CR-001 caught a silent scope omission (appearance config not in plan), a color-collapse logic regression in the FE-001 getMateriaColor rewrite, task overscoping past the 50-line gate, and missing Playwright coverage on a new interactive surface. CR-002 traced the DS-001 aliasing plan through actual source code line by line, proved three specific agents would break (dispatcher → yellow instead of purple, system-health-monitor → red instead of purple, ui-designer → blue instead of purple), and exposed a direct contradiction in the task text (line 150 vs line 195). These were genuine implementation bugs, not procedural complaints. The Critic was doing the work of a second engineer reading a PR.

**Playwright Tier 2 coverage was present on every FE task.** The CR-001 blocker explicitly required named spec files. By dispatch, all three FE tasks had them. loadout-list-panel.spec.ts ended at 114 lines (minimum was 73). This is a direct improvement from the canvas-link sprint protocol gap (C4 from that post-mortem).

**HCG flow worked correctly for scope ambiguity.** The appearance config deferral (HCG-1) was documented with a DEFERRED task packet and tracked in docs/deferred-work.md. The color-system clarification (HCG-2) produced a confirmed 5-role table before decomposition continued. Neither question was answered silently.

**archivist reclassification was handled correctly.** CR-002 flagged that moving archivist from INTEL_AGENTS (blue) to EXTERNAL_AGENTS (purple) was an unconfirmed interpretation. PM-003 documented explicit rationale (internal file writes, not external codebase access) and moved archivist to SPECIALIST_AGENTS (green) instead. The final classification is defensible and documented.

---

## 3. What Went Wrong

### 3a. Two Critic Blocks Before Plan Passed

The plan required three critique rounds (CR-001 BLOCK, CR-002 BLOCK, CR-003 PASS with warnings). This is one block more than the canvas-link sprint (which had one CRITIQUE_BLOCK).

**CR-001 block:** Four BLOCKERs — scope omission (appearance config), color-collapse assumption, missing Playwright coverage, task overscoping. Standard planning failures, correctable by PM revision.

**CR-002 block:** One BLOCKER — the revised DS-001 aliasing strategy for compose.ts introduced color regressions for three specific agents. This was a new bug introduced by the PM revision itself: the "fix" for CR-001 BLOCKER-2 (color preservation) was a bridging strategy that broke three agents due to expanded Set membership in agent-roles.ts overlapping with the legacy getMateriaColor if-chain. The PM did not trace the aliasing through the actual compose.ts code before writing the revision.

### 3b. Audit FAIL on FE-001b (A11Y)

The title display span in CardNode.tsx triggered edit mode via onClick but had no `tabIndex`, `role="button"`, or `onKeyDown` handler. Keyboard-only users could not enter edit mode. This is a WCAG AA violation and was caught by the auditor's SA pass.

**The fix was straightforward** (three attributes on one element) and was applied inline by the Orchestrator rather than spawning a remediation agent. The auditor did not re-run independently — the Orchestrator verified the fix was applied and moved the sprint forward. This is a protocol deviation: the auditor should re-audit after any remediation, not the Orchestrator.

### 3c. Proximity Edge Regression Not Caught by Any Test

After FE-002 shipped, the link sound plays correctly when two orbs are brought into proximity and released, but no edge renders on the canvas. This is a regression: the canvas-link sprint delivered working edge rendering. The RV PARTIAL on criterion 33 ("Proximity link edge appears on canvas after proximity linking") is the only formal record of this bug.

No Playwright spec asserted that an edge element appears in the DOM after a proximity link event. The materia-canvas-proximity.spec.ts file exists in the repo but was not listed as a success criterion for FE-002, and the RV validator confirmed this gap explicitly.

---

## 4. Root Causes

### RC-1: PM revised the DS-001 compose.ts bridging plan without tracing through source code

**Failure:** CR-002 BLOCKER.

The PM-001 plan (pre-CR-001) defined getMateriaColor changes in FE-001. After CR-001 blocked this, PM-002 moved compose.ts aliasing into DS-001 as a bridge. The aliasing strategy imported new agent-roles.ts Sets using alias names that matched the old compose.ts local variable names — but the new Sets had expanded membership. The PM wrote the aliasing plan without running through the if-chain in compose.ts to check which agents would hit which branch.

The pattern here is the same one documented in p2-p3 post-mortem §5: "PM writing plans without reading referenced source files." The canvas-link post-mortem documented it as well. The Critic caught it by doing the trace manually. The PM should have done this trace first.

**The fix that worked:** DS-001 Revision 3 made compose.ts completely off-limits for DS-001. All compose.ts changes moved to FE-001a, eliminating the aliasing problem entirely. Simple boundary — no aliasing, no regression risk.

### RC-2: FE agent wrote an interactive span without keyboard handlers

**Failure:** FE-001b audit FAIL.

CardNode.tsx was a new interactive surface. The A11Y standards are explicit: all interactive elements must be keyboard-navigable. The FE agent added `onClick` to the title span but did not add `tabIndex`, `role="button"`, or `onKeyDown`. This is the same category of oversight as any other standards check — the agent ran `npm run lint` (which passes for this issue, since tsc does not enforce A11Y attributes) but did not self-check against the A11Y section of standards.md.

The CR-001 AUDIT_RISK forecast explicitly called out that CardNode.tsx was a new interactive surface. That forecast was about missing Playwright spec coverage, not A11Y — but the same logic applies. New interactive surfaces require extra standards scrutiny, and the brief did not flag A11Y checklist items for the title span specifically.

### RC-3: No Playwright assertion for edge DOM presence after proximity link

**Failure:** Proximity edge regression not caught.

The FE-002 task success criteria required preserving the "Proximity linking (drop-on-top) logic" and verified this by reading the MateriaCanvas.tsx code paths (CANVAS_PROXIMITY_THRESHOLD_PX, playApproach/stopApproach/playLink hooks unchanged). Code presence was verified. Runtime behavior — specifically whether the edge actually appears in the DOM — was not tested.

The existing materia-canvas-proximity.spec.ts exists but asserts only that the proximity sound fires (audio event) and the approach animation class appears. It does not assert that an RF edge node is present in the DOM after the drop. The regression in FE-002 is specifically in the edge creation path (addEdge store call or RF edges state sync), which runs after the sound/animation path. The tests cover the path that works; they do not cover the path that regressed.

The FE-002 task spec verified visual containment of orbs within the card (CR-001 WARNING-3 was addressed), but no success criterion required: "after drag-release at proximity threshold, at least one RF edge element is present in the DOM."

---

## 5. Recurring Failures

Comparing against `gander-studio-p2-canvas-link.md` and `gander-studio-p2-p3.md`:

### Pattern 1: PM producing plans without tracing logic through source files — THIRD SPRINT

| Sprint | Manifestation |
|--------|--------------|
| p2-p3 | PM wrote investigation steps referencing source files without reading them |
| p2-canvas-link | PM overscoped without reading the P1 post-mortem on overscoping |
| p2-agent-cards | PM wrote DS-001 aliasing strategy without tracing it through getMateriaColor if-chain |

The canvas-link post-mortem recommended: "Add a pre-decomposition constraint to the PM agent spec: read the most recent post-mortem before producing any decomposition." This was implemented (PM-003 documents reading source files). But the failure mode shifted: the PM reads the code to write the initial plan, then revises the plan under critique pressure without re-reading the affected code paths. The read-before-plan rule does not cover read-before-revision.

### Pattern 2: Audit FAIL on a new interactive surface — second time

| Sprint | Surface | Failure |
|--------|---------|---------|
| p2-canvas-link (003b) | MATERIA_CANVAS_KEYFRAMES template string | Raw numeric literals instead of named constants |
| p2-agent-cards (FE-001b) | CardNode.tsx title span | Missing A11Y keyboard navigation attributes |

Both failures are on new code, both are caught by the auditor's SA pass, both require remediation. Neither was caught by `npm run lint`. In both cases the FE agent checked the things it was prompted to check (constants in canvas-link; lint in agent-cards) but did not apply the full standards checklist to the specific element that failed.

### Pattern 3: Runtime behavior not covered by Playwright assertions — new this sprint, but predictable

The canvas-link post-mortem had zero post-delivery bugs. This sprint has one: the proximity edge regression. The gap is the same one that was masked in canvas-link by zero regressions — Playwright specs assert code-structure presence ("the function exists, the threshold constant is used") rather than end-to-end runtime behavior ("drag node A to within threshold of node B and verify an RF edge element exists in the DOM"). The canvas-link sprint got away without this because the edge-creation path was untouched. The agent-cards sprint modified toRFNode for the orchestrator node, changing how it maps to RF, and the existing edge-creation behavior was an implicit dependency that no spec covered.

---

## 6. Protocol Gaps

| Gap | Which Failure | Description |
|-----|--------------|-------------|
| **PM revision does not require re-reading affected code paths** | RC-1 (CR-002 BLOCK) | The existing rule is "read source files before decomposing." It does not apply to revisions. The CR-002 blocker was introduced by a revision, not the initial plan. PM agent spec must require: before revising any task that touches an existing function or file, re-read that function/file and trace the change through all callers. |
| **FE brief does not include A11Y self-checklist for interactive elements** | RC-2 (audit FAIL) | FE agent has a self-grep step for CSS numeric literals (from canvas-link post-mortem). There is no equivalent self-check for A11Y. When a brief introduces any element with onClick, the FE must verify: tabIndex, role, and onKeyDown are present if the element is not a native button or anchor. This check must appear in the brief's "before emitting" section. |
| **FE-002 success criteria did not include end-to-end edge assertion** | RC-3 (proximity regression) | Any task that modifies toRFNode, RF node type registration, or canvas store edge state must include a success criterion: "after simulated proximity link, at least one RF edge element is present in the DOM (Playwright selector: .react-flow__edge)." This covers the difference between code-path preservation and runtime behavior preservation. |
| **Auditor re-audit not enforced after Orchestrator inline fix** | Process deviation | FE-001b was fixed inline by the Orchestrator and marked PASS without a formal re-audit. Standards require the auditor to re-run SA/QA/SX after any remediation. The Orchestrator should not be the verifier of its own fixes. Inline fixes must go through at minimum a re-run of the SA gate by the Auditor agent. |
| **materia-canvas-proximity.spec.ts does not assert edge DOM presence** | RC-3 | The spec file exists and covers sound/animation. It was not updated in this sprint to add edge-presence assertions. Sprint success criteria for any task touching proximity logic should require that this spec asserts edge presence, not just sound/animation. |

---

## 7. Recommended Rule Changes

### Rule Change 1 — PM agent spec: revision trace requirement (RC-1)

**Add to PM agent spec, revision protocol section:**

> Before emitting any revision to a task that modifies an existing function or file, re-read the current implementation of that function/file (not from memory or a prior read — re-read at revision time). Then trace every change through all callers identified in the initial source scan. If the change alters Set membership or function signatures used in an if-chain or switch, enumerate each affected branch explicitly in the revision notes. A revision that cannot demonstrate this trace should not be emitted.

**Rationale:** RC-1 was caused by a revision (PM-002) that changed DS-001's compose.ts aliasing strategy without re-tracing the getMateriaColor if-chain. The read-before-plan rule already in spec did not cover revisions.

---

### Rule Change 2 — FE agent spec / brief template: A11Y self-check for onClick elements (RC-2)

**Add to FE agent spec, pre-submission checklist:**

> For every element in the implementation that has an onClick handler and is not a native `<button>` or `<a>`: verify that (1) `role="button"` is set, (2) `tabIndex={0}` is set, and (3) an `onKeyDown` handler fires the same action on Enter and Space. If any of these three are absent, fix before emitting. Document this check in the packet as: `A11Y self-check: [element name] — role, tabIndex, onKeyDown present: YES`.

**Add to brief template, "before emitting" section:**

> If the implementation introduces any `onClick` on a non-button, non-anchor element: A11Y self-check required (see FE agent spec). Include result in packet.

**Rationale:** The canvas-link post-mortem added a CSS numeric self-grep step. This rule adds the equivalent for A11Y. Both are SA-catchable violations that are not caught by tsc and that repeat across sprints.

---

### Rule Change 3 — FE brief template: end-to-end edge assertion for toRFNode / edge-path changes (RC-3)

**Add to FE brief template, success criteria section (conditional):**

> If this task modifies any of: `toRFNode`, `NODE_TYPES`, `addEdge`, canvas store edge state, or RF node type registration — add a Playwright success criterion: "After simulated proximity drag-and-release, at least one `.react-flow__edge` element is present in the DOM." Reference the existing `materia-canvas-proximity.spec.ts` and add this assertion if absent.

**Rationale:** The proximity edge regression was not caught because no spec covered end-to-end edge DOM presence. Code-path presence (addEdge called, toRFEdge defined) is not sufficient when the RF rendering pipeline can silently fail to reflect store state.

---

### Rule Change 4 — Orchestrator / Auditor protocol: no inline fix without re-audit (process)

**Add to dispatch-task protocol, audit gate section:**

> The Orchestrator must not self-verify remediation. If an audit FAIL is resolved by any agent (including the Orchestrator), the Auditor must be re-invoked to re-run at minimum the SA gate before the task is marked PASS. "Fixed inline" is not an audit outcome.

**Rationale:** FE-001b was fixed by the Orchestrator and marked PASS without a re-audit. The fix was correct, but the protocol deviation sets a precedent where the Orchestrator can bypass the audit gate. The audit gate exists precisely to catch cases where the "fix" introduces a new problem.

---

### Rule Change 5 — Critic spec: compose.ts aliasing as a named anti-pattern (advisory)

**Add to Critic spec, known anti-patterns section:**

> **Aliasing-via-import to preserve Set membership:** If a PM plan uses import aliasing (e.g., `import { NEW_SET as OLD_NAME }`) to bridge a renamed constant in a function that uses an if-chain or sequential Set checks — flag as ASSUMPTION BLOCKER. Require the PM to trace each Set's membership through every branch in the function and prove no agent shifts branches. Aliasing with expanded Sets is a color/behavior regression pattern observed in gander-studio-p2-agent-cards (2026-04-04).

**Rationale:** The CR-002 BLOCKER required the Critic to do manual per-agent tracing that the PM should have done. Naming this as a known anti-pattern makes the check explicit rather than requiring the Critic to derive it from first principles each time.

---

## 8. Final Deliverable State

**App/Service:** `~/projects/gander-studio-alpha`
**Build:** tsc clean (all packages); lint PASS
**Runtime:** CardNode renders on ComposePage canvas; inline title edit works; LoadoutListPanel shows 5-role tree layout; proximity link sound plays. Proximity edge regression present — edge does not render after proximity link.

**Features delivered:**
- **agent-roles.ts:** Single source of truth for AgentRole type and 5-role classification Sets + fragment arrays
- **CardNode.tsx:** Draggable canvas background card for orchestrator group; inline title edit (blur/Enter commit, Escape cancel); keyboard-accessible (tabIndex, role, onKeyDown added post-audit)
- **getMateriaColor role fast-path:** Role parameter adds O(1) color resolution before name-based fallback; all 5 roles return correct CSS var
- **LoadoutListPanel rewrite:** Agent nodes as roots, connected skills as children, unconnected skills section; getMateriaColor 3-arg call throughout
- **LoadoutSchema.cardTitle:** Optional field; backwards-compatible with existing saved loadouts

**Known issues carried forward:**
1. Proximity edge regression: sound plays but no edge renders. Suspected cause: FE-002 changes to toRFNode or RF node type registration broke the edge-creation path. Needs investigation. Fix target: next sprint.
2. Dead-code META_AGENTS branch in compose.ts: un-aliased META_AGENTS import and final Set-check branch are unreachable (CR-003 WARNING, not blocking). Should be cleaned in next sprint touching compose.ts.
3. ComposePage.tsx MateriaDot: 2-param getMateriaColor call means dispatcher/ui-designer/system-health-monitor render with updated role-based colors (yellow/blue/red instead of purple). Intentional per PM-003 rationale — but not documented in any acceptance criterion. Low visual impact, carry forward for awareness.
