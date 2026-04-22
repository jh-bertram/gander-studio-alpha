# Post-Mortem: gander-studio-p2-canvas-link

**Date:** 2026-03-30
**Project:** `~/projects/gander-studio-alpha`
**Duration:** 2026-03-28T00:00Z → 2026-03-30T02:00Z (~54 hours wall-clock, 3 sessions)
**Final State:** All 7 tasks delivered and audited PASS; 17/17 requirements covered; human confirmed all four features working in browser.

---

## 1. Original Request

**Human (2026-03-28):** Add canvas link/connection functionality to Gander Studio — persistent connections between canvas nodes, glassy 3D orb nodes, magnetic snap animation during drag, Web Audio link sound, and a LoadoutListPanel showing the canvas contents as a navigable tree.

**Brief file:** `.claude/agents/tasks/outputs/gander-studio-p2-canvas-link-PM-1743120000.md`

**Scope at intake:**
- `LoadoutSchema` had no `connections` field — edges were not saved or restored
- `AgentSchema` had no `communicates_with` field — peer relationships not tracked
- `MateriaNode.tsx` was a flat CSS circle (`backgroundColor` + `boxShadow` only)
- `MateriaCanvas.tsx` had proximity auto-link at drag-end but no animation, no sound, no list panel
- `EDGE_GLOW` token existed in `canvas.ts` but was not applied to edges
- `ComposePage.tsx` built save payload without connections; loaded without restoring edges
- `agent-parser.ts` did not read `communicates_with`; `router.ts` did not write it

**Skill invoked:** `dispatch-task`

---

## 2. Agent Activity Log

### Planning — PM#0 + Critic (CR#1, CR#2)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 1 | 2026-03-28T00:00Z | SPAWN | PM#0 | Initial decomposition |
| 2 | 2026-03-28T00:10Z | COMPLETE | PM#0 | 3-task plan (001, 002, 003) |
| 3 | 2026-03-28T00:05Z | SPAWN | CR#1 | Plan critique |
| 4 | 2026-03-28T00:06Z | CRITIQUE_BLOCK | CR#1 | 5 BLOCKERs, 2 WARNINGs |
| 5 | 2026-03-28T00:15Z | SPAWN | CR#2 | Revised plan critique |
| 6 | 2026-03-28T00:20Z | CRITIQUE_PASS | CR#2 | 7-task plan approved |

**Feedback loops:** 1 (plan required full revision before implementation started)

**Root cause of CRITIQUE_BLOCK:** PM#0 repeated an overscoping pattern previously identified in P1 (post-mortem `gander-studio-p1-materia-canvas.md §2`). The Critic explicitly cited the P1 precedent. Task 003 packed 6 independent units into one FE turn; Task 001 crossed the client/server boundary in a single BE turn. Five BLOCKERs forced a complete restructure:

- **C1:** Task 003 overscoped 6x → split into 003a / 003b / 003c
- **C2:** Task 001 crossed client/server boundary → split into 001a (BE) / 001b (FE)
- **C3:** Web Audio autoplay policy unverified → mandatory RA pre-flight (003-RA) added; 003b blocked on its dossier
- **C4:** No Playwright Tier 2 in FE success criteria → named spec file required in every FE task
- **C5:** `communicates_with` as YAML array silently fails the fallback parser → explicit comma-split normalization required with round-trip test

**Deviation from PM brief:** Scope expanded from 3 tasks to 7. This was correct — the Critic prevented a repeat of the P1 failure mode where an overscoped FE turn produced a 3-cycle audit gauntlet.

---

### Wave 1 — 001a (BE#1), 002 (UI#1), 003-RA (RA#1)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 4 | 2026-03-28T20:40Z | SPAWN | BE#1 | Schema + parser + router |
| 5 | 2026-03-28T20:43Z | SPAWN | UI#1 | Design spec (5 surfaces) |
| 6 | 2026-03-28T21:28Z | SPAWN | RA#1 | Web Audio autoplay research |
| 10 | 2026-03-28T20:50Z | COMPLETE | BE#1 | |
| 11 | 2026-03-28T20:55Z | COMPLETE | UI#1 | |
| 13 | 2026-03-28T21:45Z | COMPLETE | RA#1 | |
| 8 | 2026-03-28T00:38Z | AUDIT_PASS | AUD#1 | 001a audit pass |
| 9 | 2026-03-28T00:40Z | AUDIT_PASS | AUD#2 | 002 audit pass |

**Feedback loops:** 0 — all three first-pass.

**Note:** 003-RA is research-only; no audit gate. Its Q1/Q2/Q3 findings were applied verbatim to 003b's implementation brief.

---

### Wave 2 — 001b (FE#1), 003a (FE#2)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 10 | 2026-03-28T21:41Z | SPAWN | FE#1 | canvas-store + ComposePage wiring |
| 11 | 2026-03-28T21:41Z | SPAWN | FE#2 | Glassy orb CSS + edge glow |
| 12 | 2026-03-28T21:50Z | COMPLETE | FE#1 | |
| 19 | 2026-03-28T22:05Z | COMPLETE | FE#2 | |
| — | 2026-03-29T00:01Z | AUDIT_PASS | AUD#3 | 001b audit pass |
| — | 2026-03-29T00:01Z | AUDIT_PASS | AUD#4 | 003a audit pass |

**Feedback loops:** 0 — both first-pass.

Session break occurred after Wave 2. 001b and 003a were complete but not yet audited at session end. Session resumed and audits ran at the start of the next session. No work was lost.

---

### Wave 3 — 003b (FE#3)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 16 | 2026-03-30T03:17Z | SPAWN | FE#3 | Proximity animation + Web Audio sound |
| 17 | 2026-03-30T03:25Z | COMPLETE | FE#3 | |
| 18 | 2026-03-30T03:29Z | AUDIT_FAIL | AUD#5 | SA FAIL — magic numbers in MATERIA_CANVAS_KEYFRAMES |
| 11 | 2026-03-29T00:36Z | COMPLETE | FE#3 | Remediation: constants extracted and interpolated |
| 12 | 2026-03-30T03:36Z | AUDIT_PASS | AUD#5 | Attempt 2 — SA/QA/SX all PASS |

**Feedback loops:** 1

**Root cause of AUDIT_FAIL:** FE#3 correctly exported 49 new named constants to `canvas.ts`, and imported several existing `ORB_SHADOW_INSET_*` constants — but wrote the `MATERIA_CANVAS_KEYFRAMES` template string using raw numeric literals instead of interpolating those constants. The auditor found 20+ violations: box-shadow blur/spread values (28px, 10px, 20px, 6px, 14px, 3px), ring widths (3px, 2px), inset offsets (2px, 3px, -3px, -4px), and the intermediate keyframe transform `scale(1.06) translateY(-6px)`.

This is a **scan-completeness failure**: the agent verified that constants were exported from `canvas.ts` but did not verify that every numeric appearing in the generated CSS string was also interpolated from those constants. The receipt checklist phrased the rule as "all animation timing values" — FE#3 interpreted "timing" narrowly (ms durations) and excluded box-shadow pixel values.

**Deviation from PM brief:** None — remediation was in-scope work, not new scope.

---

### Wave 4 — HCG-1 + 003c (FE#4)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 7 | 2026-03-28T00:35Z | HCG_RESOLVED | Human | Layout = TREE (agents as roots, peers as children) |
| 22 | 2026-03-30T00:01Z | SPAWN | FE#4 | LoadoutListPanel + three-column wiring |
| 23 | 2026-03-30T00:45Z | COMPLETE | FE#4 | |
| 24 | 2026-03-30T01:30Z | AUDIT_PASS | AUD#3 | 003c — 3/3 Playwright tests passed |

**Feedback loops:** 0 — first-pass.

---

## 3. Post-Delivery: Runtime Bugs

None. Human confirmed all four features (glassy orbs, magnetic snap, link sound, LoadoutListPanel) working in browser after sprint close. No post-delivery bugs reported.

---

## 4. QA Gap Analysis

**Current QA protocol:** Auditor runs SA (code standards, naming, no magic numbers) → QA (tsc + Playwright Tier 1 smoke + Tier 2 spec if exists) → SX (OWASP, no injection vectors, no secrets). Each check stops at first failure.

**What this caught:**
- 003b SA: 20+ hardcoded numeric literals in `MATERIA_CANVAS_KEYFRAMES` — caught before QA ran, preventing a false-pass on runtime behavior

**What this missed:**
- Nothing post-delivery — clean sprint from audit's perspective
- The 003b failure was caught by audit (correct), but the root cause (narrow interpretation of "timing values" in receipt checklist) was a brief-writing gap, not an audit gap

**Recommendations:**
- Receipt checklist item wording: "All Hz, gain, ADSR, animation timing values as named exports" should be broadened to "All numeric literals in CSS strings (px, %, opacity, Hz, ms, gain) exported from canvas.ts — no raw numbers in template strings". The word "timing" invited the narrow read.
- Pre-submission grep step: FE agents working on template-string CSS blocks should self-grep for raw numeric patterns (`\d+px`, `\d+\.\d+`, `rgba\(`) in their generated strings before submitting. This would have caught the 003b failure at self-check rather than audit.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM#0 | 1 | 0% (plan) | CRITIQUE_BLOCK — overscoped same pattern as P1 |
| CR#1/CR#2 | 2 critiques | — | Caught 5 BLOCKERs; revised plan was sound |
| BE#1 | 001a | 100% | Clean; comma-split normalization correct on both parser paths |
| UI#1 | 002 | 100% | All 5 surfaces; no code; numeric specs clean |
| RA#1 | 003-RA | n/a | Q1/Q2/Q3 answered with sources; dossier applied verbatim to 003b brief |
| FE#1 | 001b | 100% | Canvas-store + ComposePage wiring clean |
| FE#2 | 003a | 100% | Glassy orb + 18 constants — first-pass |
| FE#3 | 003b | 0% → 100% | SA fail (constant interpolation in template string); clean remediation |
| FE#4 | 003c | 100% | LoadoutListPanel tree layout + 22 constants — first-pass |

**Overall first-pass rate (auditable tasks):** 5/6 = 83%

**Most impactful single agent action:** CR#1's CRITIQUE_BLOCK at the plan stage. The initial 3-task PM plan was the exact overscoping pattern from P1 — catching it before any implementation started prevented what would have been a multi-cycle audit gauntlet on a 6-unit FE task. All five blockers were legitimate; the revised 7-task plan shipped cleanly.

**Recurring failure pattern:** PM overscoping. PM#0 produced an overscoped plan in P1 and again in P2. In both sprints the Critic blocked it. The Critic is functioning as intended, but the PM is not learning from prior post-mortems — the P1 post-mortem explicitly documented this failure mode, yet PM#0 repeated it.

---

## 6. Protocol Gaps Identified

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| PM overscoping is a recurring pattern (P1 + P2) | Requires Critic block in every sprint; 1 planning cycle wasted per sprint | Add a pre-decomposition constraint to the PM agent spec: "Read the most recent post-mortem before producing any decomposition. If it identifies an overscoping pattern, treat the suggested task sizes as an upper bound." |
| "Timing values" in receipt checklist invited narrow interpretation | 003b SA fail — 20+ violations, 1 remediation cycle | Replace "timing values" with "all numeric literals in CSS strings" in the FE agent's self-check protocol and in the canvas.ts rule in standards.md |
| FE agents do not self-grep CSS template strings for raw numerics | Pre-audit failures not self-caught | Add to FE agent spec: before submitting any task that introduces a CSS template string, run `grep -nP '\d+px|\d+\.\d+|rgba\(' <file>` and verify every match is interpolated from a named constant |
| Session-spanning audits (001b, 003a audited next session) | Low risk here, but cross-session audit gaps could miss context | Checkpoint should record "COMPLETE but not yet audited" state explicitly — already done, but flag in auditor brief that these are cross-session audits |

---

## 7. Final Deliverable State

**App/Service:** `~/projects/gander-studio-alpha`
**Build:** tsc clean (all packages); bundle 878 kB (advisory note only — no gate)
**Runtime:** Human-confirmed working — glassy orbs, magnetic snap, link sound, LoadoutListPanel tree view

**Features delivered:**
- **Connection persistence:** `LoadoutSchema.connections` persists canvas edges across save/load; `AgentSchema.communicates_with` persisted to/from agent frontmatter
- **Glassy 3D orbs:** `MateriaNode.tsx` replaced flat circle with radial-gradient sphere, specular highlight child div, `--orb-color` injection, box-shadow depth layers
- **Edge glow:** Animated edges with `EDGE_GLOW` filter applied in `toRFEdge`
- **Magnetic snap animation:** `orb-attracted` / `orb-attracted-release` CSS classes applied via direct DOM `classList` manipulation during drag (ReactFlow re-render churn avoidance); `@keyframes orb-attract` in scoped style block
- **Link flash:** `orb-link-flashing` → `orb-linked` transition at edge creation
- **Web Audio link sound:** `useLinkSound.ts` — lazy single `AudioContext`, `playApproach` / `stopApproach` (sine, 220Hz), `playLink` ker-chink (triangle 880Hz + sine 1320Hz harmonic); all parameters in `canvas.ts`
- **LoadoutListPanel:** 240px tree-layout right panel; agents as root items, connected peers as indented children (16px extra indent); `rfInstance.fitView` on row click; keyboard nav + `aria-label`

**Key contracts:**
- `canvas.ts` is the single source of truth for all numeric design tokens — 64+ named exports as of sprint close; never add magic numbers to component files
- `useLinkSound.ts` is a module-level export (not a React hook) — `playApproach` / `stopApproach` / `playLink` are plain functions; swap to `AudioBufferSourceNode` if audio file assets become available
- `communicates_with` frontmatter is serialized as comma-delimited string (`"be, fe"`), not YAML array; parser handles both forms for backward compatibility
- `LoadoutListPanel` is co-located in `MateriaCanvas.tsx` — not a separate file
- Proximity threshold: `CANVAS_PROXIMITY_THRESHOLD_PX = 60` in `canvas.ts:12`; snap animation parameters at lines 72–100
