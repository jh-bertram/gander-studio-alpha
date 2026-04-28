# Archive Entry — gander-studio-p4-proximity-edge-hardening (Sprint Closure)

**Archivist:** AR#0  
**Generated:** 2026-04-28T02:55:00Z  
**Sprint:** gander-studio-p4-proximity-edge-hardening  

---

## Sprint Summary

**Goal:** Bundle 7 auditor advisories (5 from sprint p3 audit + 2 carried-forward from prior work) into a single hardening sprint. Test rigor + code hygiene; no behavior change.

**Status:** COMPLETE — all 7 advisories shipped and audit PASS. REQVAL coverage = COVERED (12/12 requirements).

**Deliverables:**
- FE-001 (spec hardening): committed at `f970935`
- FE-002 (source hygiene): committed at `c380956`

---

## Task Completions Logged

### FE-001 — Spec Hardening (Playwright Test Suite)
**Committed:** `f970935`  
**Audited by:** AUDITOR#3 (re-audit after AUDITOR#1 FAIL + FE#1-rem1 remediation)  
**Verdict:** PASS  

**Advisories addressed:**
- **A1:** Replaced broken `[data-testid^="palette-item-agent-"]` selector (matched zero elements) with Agents-section h3 landmark helper `locateAgentPaletteItem`. Removed all silent-skip fallbacks (`test.skip`, `if (!isVisible) return`) and replaced with strict `waitFor({ state: 'visible', timeout: 5000 })` at 4 sites.
- **A2:** Replaced tautology assertion `expect(postDragEdgeCount).toBeGreaterThanOrEqual(0)` with `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)`.
- **A3:** Added agent↔skill proximity test using both `locateAgentPaletteItem` and `locateSkillPaletteItem` helpers. Skills-section h3 landmark pattern (no type-prefix in skill testids).
- **A4:** Added link-sound + DOM-edge paired test with frequency-discriminated audio spy. Patches `AudioParam.prototype.setValueAtTime` to count oscillators set to LINK_PRIMARY_FREQ_HZ (880 Hz) and LINK_SECONDARY_FREQ_HZ (1320 Hz) only, filtering out APPROACH_FREQ_HZ (220 Hz). Constants imported from `constants/canvas.ts`; no bare numeric literals in test source. DOM assertion (expect edge count = 1) runs first; audio assertion (expect linkOscCount = 2) runs second, per post-mortem G6. addInitScript placed BEFORE page navigation.

**Evidence:**
- 9/9 tests in `materia-canvas.spec.ts` PASS (4 new proximity tests + 5 baseline guard tests)
- Zero `test.skip` calls remain in proximity describe block
- grep `palette-item-agent-` returns 0 (broken selector fully removed)
- grep `__oscCreateCount` returns 0 (old raw-count approach fully replaced)
- grep `AudioParam.prototype.setValueAtTime` returns ≥1 (frequency spy present)
- tsc --noEmit exit 0 across all 3 packages
- Bundle size 881.67 kB (under 1000 kB gate)

**Key Decision:** Environment configuration gap exposed. Dev `.env` had `GANDER_ROOT=/home/jhber/projects/gander-studio-alpha` (empty, no agents/skills subdirs). AUDITOR#1 reported FAIL due to silent fallback anti-pattern in FE#1's helper. Remediation: ORC corrected `.env` to `GANDER_ROOT=/home/jhber/projects/gander` (12 agents, 24 skills). Re-audit with corrected env: PASS. The .env change is session-local (file not git-tracked).

---

### FE-002 — Source Hygiene (Production Code)
**Committed:** `c380956`  
**Audited by:** AUDITOR#2  
**Verdict:** PASS  

**Advisories addressed:**
- **A5:** Extracted duplicated INVISIBLE_HANDLE_STYLE constant (9 properties, byte-identical literal from both MateriaNode.tsx and CardNode.tsx) to new `packages/client/src/components/compose/handle-style.ts`. Both components now import and use the shared constant. No behavior change (styles are property-order-independent; rendered output identical).
- **A6:** Deleted dead `if (META_AGENTS.has(lower)) return 'var(--mp)'` branch in `constants/compose.ts` line 79. Removed un-aliased import `META_AGENTS,` at line 11. Preserved aliased import `META_AGENTS as COMMAND_AGENTS` (line 7) which intercepts all META_AGENTS members. Preserved `META_FRAGMENTS,` (line 12) still in use.
- **A7:** Added explicit `role` parameter to `getMateriaColor` call in `buildPaletteItemStyle` (MateriaCanvas.tsx). Computes `paletteRole` as `'specialist'` for agents, `'skill'` for skills. Color output unchanged (role-based fast path returns identical CSS vars: `'var(--mg)'` for agents, `'var(--mb)'` for skills).

**Evidence:**
- handle-style.ts created with INVISIBLE_HANDLE_STYLE (9 properties)
- MateriaNode.tsx and CardNode.tsx both import and use INVISIBLE_HANDLE_STYLE
- grep `^  META_AGENTS,$` compose.ts returns 0 (line 11 removed)
- grep `^  META_FRAGMENTS,$` compose.ts returns 1 (line 12 preserved)
- grep `META_AGENTS.has(lower)` compose.ts returns 0 (dead branch removed)
- tsc --noEmit exit 0 across all 3 packages
- Build succeeds: main JS chunk = 881.67 kB (under 1000 kB)
- Playwright e2e: 31 passed, 13 failed (all pre-existing; zero regressions — verified via baseline-stash)

---

## Sprint-Level Architectural Decisions

### Decision 1: Frequency-Discriminated Audio Spy (A4 Resolution)

**Problem:** PM#1 and PM#2 proposed raw oscillator-count discrimination for A4. Counter was reset after unlock click and asserted `=== 2` after drag-commit. CR#2 traced actual audio call path: during drag, `MateriaCanvas.tsx` line 804 fires `playApproach()` (+1 oscillator at 220 Hz), then on commit, `addEdgeWithEffects` fires `playLink()` (+2 oscillators at 880 Hz and 1320 Hz). Raw count after all calls = 3, not 2. PM#2's proposed test would fail every CI run.

**Decision:** Switch from raw count to **frequency-discriminated spy** on `AudioParam.prototype.setValueAtTime`. Patch globally; increment counter only when frequency value === LINK_PRIMARY_FREQ_HZ (880) or LINK_SECONDARY_FREQ_HZ (1320). The 220 Hz approach tone is filtered out. Counter reset eliminated. Assertion: `__linkOscCount === 2` exactly.

**Rationale:** Isolates the link-sound effect from the approach-tone effect, eliminating false positives caused by drag-induced approach calls. More robust than raw oscillator counting. Constants injected via serialized args; no magic numbers in test source. Aligns with post-mortem G6 guidance (sound as secondary assertion, paired with primary DOM edge assertion).

**Alternatives considered:** (1) Reset counter mid-flow to exclude approach oscillators — violates test-clarity principle (side effects visible in test logic). (2) Spy on `playLink` function directly — breaks if audio module refactors the internal call site. (3) Use a higher-level audio-event listener — WebAudio API does not expose such listeners. Frequency spy was the cleanest solution.

**Carried forward:** This pattern is now recommended for future audio-as-side-effect tests in the codebase.

---

### Decision 2: Three-Round Critic Gate (Human-Authorized Override)

**Problem:** Critic round 1 (CR#1) proposed an option-(b) recipe for A4 that appeared correct but had an arithmetic error in its own logic (would create 3 oscillators, not 2). CR#2 caught this. PM#2 was prepared to replan from scratch.

**Decision:** PM#3 was issued as a **narrow revision** specifically to A4, not a full replan. This required a **third Critic round** to vet the frequency-spy replacement. Protocol cap is 2 Critic rounds; round 3 was **human-authorized** as a special case because CR#2 identified a Critic-own recipe flaw, not a PM/implementation failure.

**Rationale:** The flaw was in the Critic's option-(b) code recipe (its own domain), not in the PM's decomposition or the FE's implementation of a bad spec. Escalating to full-replan would have been procedurally correct but inefficient given the targeted nature of the fix. Human authorization allowed narrowing to the single advisory.

**System-health note:** This reveals a gap in the Critic spec: when the Critic gives a prescriptive code recipe, it should prefer "name the problem and point at the file" over "write the fix" in cases of high complexity (audio synthesis, test spies, etc.). Future Critic revisions may address this. This sprint did not resolve the gap — noted for future work.

---

### Decision 3: GANDER_ROOT Environment Configuration as Session-Local Fix

**Problem:** Dev `.env` had `GANDER_ROOT=/home/jhber/projects/gander-studio-alpha` (the project root itself, which contains no agents/skills subdirs). The agents and skills live in `~/.claude/projects/gander` (symlinked from `~/projects/gander`). AUDITOR#1 discovered that FE#1's landmark helpers would silently absorb zero-match selectors during the test run because the helpers included a fallback pattern (anti-pattern per G6). When AUDITOR#1 flagged the fallback violation, FE#1 remediated by making the helpers strict (no fallback). But with the wrong GANDER_ROOT, the helpers correctly failed, and FE#1's test environment was broken.

**Decision:** ORC corrected `.env` in the session to `GANDER_ROOT=/home/jhber/projects/gander` (actual path with populated agents/skills). This enabled FE#1-rem1 to pass AUDITOR#3 re-audit. The `.env` file is not git-tracked; the fix is session-local.

**Rationale:** The environment misconfiguration should have been caught during the FE-001 planning phase (PM pre-flight should verify that GANDER_ROOT points to a valid agent/skill directory). It was not. FE#1's strict test implementation exposed the gap. Fixing the environment allowed the tests to pass; the implementation was correct. No code change was needed; the environment was.

**Recommendation:** Add a pre-flight environment validation step to PM's task decomposition for FE work — verify `GANDER_ROOT` is a valid path with agents and skills subdirs before assigning FE-001.

---

## Requirements Coverage

All 12 requirements from the original request COVERED:

| Req | Advisory | Status | Evidence |
|-----|----------|--------|----------|
| R-001 | A1 — silent-skip removal | COVERED | Zero `test.skip`, zero `if (!isVisible) return`, 4 sites converted to hard waitFor |
| R-002 | A2 — tautology fix | COVERED | `toBe(initialEdgeCount + 1)` exact assertion confirmed |
| R-003 | A3 — agent↔skill test | COVERED | Test present, both landmarks used, runtime PASS |
| R-004 | A4 — sound + edge pair | COVERED | Frequency-discriminated spy, DOM-first assertion, runtime PASS |
| R-005 | A5 — deduplicate styles | COVERED | handle-style.ts extracted, 9 properties byte-identical |
| R-006 | A6 — dead-code removal | COVERED | Line 79 branch removed, line 11 import removed, line 7/12 preserved |
| R-007 | A7 — explicit role arg | COVERED | `getMateriaColor` call passes `paletteRole`, colors unchanged |
| R-008 | No behavior change | COVERED | Static trace + runtime: colors, handle styles, interaction flows unchanged |
| R-009 | Lint clean | COVERED | tsc --noEmit exit 0 across all 3 packages |
| R-010 | Bundle size < 1000 kB | COVERED | 881.67 kB confirmed |
| R-011 | Critic gate required | COVERED | 3-round Critic process (rounds 1, 2 BLOCK; round 3 PASS, human-authorized) |
| R-012 | A4 addresses post-mortem G6 | COVERED | DOM assertion first, audio second; frequency spy isolates link sound |

---

## Retained State for Next Session

Key facts to record in SESSION-CHECKPOINT after sprint closure:

1. **Audio test pattern (A4 result):** For future link-sound tests, use frequency-discriminated spy on `AudioParam.prototype.setValueAtTime` with serialized constant injection. This isolates link oscillators (880/1320 Hz) from approach oscillators (220 Hz).

2. **GANDER_ROOT gotcha:** Dev `.env` must point to the agents repo (with agents and skills subdirs), not gander-studio-alpha repo root. Add pre-flight validation to FE task specs.

3. **Critic system note:** Critic spec may benefit from preferring "name problem + point file" over "write code recipe" for complex domains (audio, test spies). Not addressed this sprint but worth tracking.

4. **Two commits:**
   - `c380956`: FE-002 (handle-style.ts extracted, dead branch removed, role arg added)
   - `f970935`: FE-001 (spec hardening: strict landmark helpers, A2-A4 assertions added)

---

## Files Modified

**FE-002 (c380956):**
- Created: `packages/client/src/components/compose/handle-style.ts`
- Modified: `MateriaNode.tsx`, `CardNode.tsx`, `constants/compose.ts`, `components/compose/MateriaCanvas.tsx`

**FE-001 (f970935):**
- Modified: `packages/client/src/tests/compose/materia-canvas.spec.ts`

---

## QA Audit Trail

| Task | Auditor | Verdict | Notes |
|------|---------|---------|-------|
| FE-001 initial | AUDITOR#1 | FAIL | BLOCKER 1 (fallback anti-pattern violates G6); BLOCKER 2 (debug files left) |
| FE-001 remediation | FE#1-rem1 | — | Removed fallbacks, deleted debug files, clarified env requirement |
| FE-001 re-audit | AUDITOR#3 | PASS | 9/9 spec tests pass (4 proximity tests + 5 guards); 13 pre-existing e2e failures unchanged |
| FE-002 | AUDITOR#2 | PASS | SA + QA + SX all clear; bundle under gate; zero regressions (baseline-stash verified) |

---

## Next Steps (Human Verification)

**Step 4.5 (pending):** Browser verification
- Verify proximity-link visual rendering in compose canvas
- Verify drag-and-drop still feels responsive
- Verify palette colors (agent cards green, skill cards blue) display correctly

**Step 5:** Final sprint report

---

**Archived by:** AR#0  
**Timestamp:** 2026-04-28T02:55:00Z
