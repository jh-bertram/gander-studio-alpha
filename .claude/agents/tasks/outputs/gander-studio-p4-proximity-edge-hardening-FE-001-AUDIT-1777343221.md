# AUDIT — gander-studio-p4-proximity-edge-hardening-FE-001

- **Auditor:** AUDITOR#1
- **Task ID:** gander-studio-p4-proximity-edge-hardening-FE-001
- **Generated:** 2026-04-27 (unix 1777343221)
- **Verdict:** **FAIL** — 1 BLOCKER (semantic test-name mismatch from `locateFirstPaletteItem` fallback) + 1 cleanup-required (debug scratch files)

---

## Aggregate Verdict

| Gate | Status | Notes |
|------|--------|-------|
| SA (Standards) | **PASS** | All receipt-check greps pass; tsc exits 0; constants imported correctly; no bare magic numbers; no production source modified by FE-001. |
| QA (Functionality) | **FAIL** | G6 violation: test name says `orchestrator↔agent` but the implementation silently falls back to a skill node when the Agents section is empty (current env). The A3 test named `agent↔skill` becomes `skill↔skill` for the same reason. This is the silent-skip anti-pattern A1 was designed to eliminate. + 9/9 spec passes; tier-1 smoke clean. |
| SX (Security) | **SECURE** | Test-only file; no auth surfaces, no input handling, no secrets. The `addInitScript` patches a browser-side global only inside the Playwright page context. |

**Overall: FAIL.** The locateFirstPaletteItem Agents→Skills silent fallback violates G6 and contradicts the task packet's explicit "hard-fail loud, not silent skip" philosophy (A1 rationale + risk_flag in PM packet about skill items waitFor failing loud). Two scratch debug files must also be removed before sprint close.

---

## Receipt-Check Manifest (all 12 items)

| # | Item | Result |
|---|------|--------|
| 1 | Zero `test.skip()` in proximity describe block | PASS — `grep -c 'test\.skip'` returns 0 |
| 2 | `grep -c 'palette-item-agent-' …spec.ts` → 0 | PASS — 0 |
| 3 | `grep -c '__oscCreateCount' …spec.ts` → 0 | PASS — 0 |
| 4 | `grep -c 'AudioParam.prototype.setValueAtTime' …spec.ts` ≥ 1 | PASS — 4 |
| 5 | `grep -c 'palette-item-skill-' …spec.ts` → 0 | PASS — 0 |
| 6 | A2 line: `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)` | PASS — line 219 |
| 7 | A3 test "agent↔skill proximity drop…" present | PRESENT — line 233 (but see Concern #2 — semantic mismatch) |
| 8 | A4 test with both DOM-edge and link-sound assertions; DOM first | PASS — line 341 (DOM `toBe(1)`) precedes line 348 (audio `toBe(2)`) |
| 9 | `LINK_PRIMARY_FREQ_HZ` & `LINK_SECONDARY_FREQ_HZ` imported from `../../constants/canvas`; no bare 880/1320 in source | PASS — imports at lines 3-4; bare-number scan finds only comment/doc references at lines 281, 282, 291, 335, 344 (all in comments — not source identifiers) |
| 10 | `addInitScript` precedes `gotoCompose` in A4 test | PASS — addInitScript at line 293, gotoCompose at line 310 |
| 11 | Audio assertion uses `__linkOscCount === 2` (exact, not `>=2`) | PASS — line 348: `expect(linkOscCount).toBe(2)` |
| 12 | `grep -c 'AudioContext.prototype.createOscillator'` → 0 | PASS — 0 |

All 12 receipt-check items pass.

---

## SA — Standards Audit

```xml
<audit_review>
  <target_file>packages/client/src/tests/compose/materia-canvas.spec.ts</target_file>
  <status>PASS</status>
  <violations/>
</audit_review>
```

Notes:
- TypeScript strict types respected: helper signatures correctly union `string | Locator`, no implicit any, no unjustified `any`.
- The `(window as unknown as { __linkOscCount: number })` casts are the standard idiom for typing test-injected globals — acceptable.
- Constants imported from canvas.ts; no magic numbers in the test source (the integers 880, 1320, 220 appear only in comment text, never as code identifiers — `grep -nE '\b(880|1320)\b'` confirms all 5 hits are inside `//` comments).
- File size: 361 lines, within +154 net (within the +150 estimate). Helpers (locateFirstPaletteItem, locateSecondPaletteItem) are co-located in the spec rather than a separate module — acceptable for test-only utilities.
- No DRY violations. The two helpers handle distinct cases (first-of-any-section vs second-of-Skills).

---

## QA — Functional Tests

```xml
<test_report>
  <task_id>gander-studio-p4-proximity-edge-hardening-FE-001</task_id>
  <status>FAIL</status>
  <test_coverage>e2e — 9 passed, 0 failed (materia-canvas.spec.ts only)</test_coverage>
  <playwright>
    <tier>1+2 — spec-targeted run completed; tier-1 smoke implicit (page renders, no console errors test included as test #2)</tier>
    <tests_run>9</tests_run>
    <passed>9</passed>
    <failed>0</failed>
    <playwright_output>9 passed (27.7s) — exit 0</playwright_output>
  </playwright>
  <defects>
    <bug>
      <description>BLOCKER (G6 — "test asserts what its name says"). The test at line 143 is named `orchestrator↔agent proximity drop renders a .react-flow__edge element`, but its locator helper `locateFirstPaletteItem()` (lines 56-77) silently falls back from the Agents h3 section to the Skills h3 section when no agent items are present. In the current GANDER_ROOT (gander-studio-alpha itself), `agent.list` returns []; verified live: curl http://localhost:3001/trpc/agent.list → `{"result":{"data":[]}}`. The test therefore exercises an `orchestrator↔skill` interaction, not `orchestrator↔agent`. The same silent fallback affects the A3 test at line 233 named `agent↔skill proximity drop` — its first item is also fallback-to-Skills, making it `skill↔skill` in practice. This is exactly the silent-skip anti-pattern that A1 was created to eliminate (the original `if (!isVisible) test.skip()` masked the broken selector; the new fallback masks the empty Agents section with a Skills substitute and a passing assertion that does not match the test name). The PM task packet was explicit: "If no skill items exist in the palette (empty GANDER_ROOT), firstSkillItem.waitFor will fail loudly after 5000ms per A1 philosophy (hard fail, not silent skip)." FE-001 implemented the exact opposite philosophy for the Agents case.</description>
      <steps_to_reproduce>1. Read test name at line 143. 2. Trace `locateFirstPaletteItem` at lines 56-77. 3. Note the early-return at lines 65-67 when Agents section is empty, falling through to Skills items. 4. Run `curl http://localhost:3001/trpc/agent.list` → returns []. 5. Conclude: in this environment, the test asserts `orchestrator↔skill`, not `orchestrator↔agent`.</steps_to_reproduce>
      <severity>BLOCKER</severity>
    </bug>
    <bug>
      <description>Two debug scratch files are left in the working tree from FE-001's investigation: `packages/client/tests/e2e/debug-selector.spec.ts` and `packages/client/tests/e2e/debug-selector2.spec.ts`. Both contain a single anonymous `expect(...)` smoke check and console.log diagnostic dumps about palette DOM structure — clearly investigation artifacts. Neither is listed in FE-001's `<files_modified>` deliverable. They will be picked up by `npx playwright test` (the default config globs `tests/e2e/**`) and run on every CI execution, polluting test output with diagnostic logs.</description>
      <steps_to_reproduce>ls packages/client/tests/e2e/debug-selector*.spec.ts → 2 files present. Read either: contains `console.log` calls, no real assertions.</steps_to_reproduce>
      <severity>MINOR</severity>
    </bug>
  </defects>
</test_report>
```

### Concern-by-concern responses (from audit brief)

**1. Receipt-check items.** All 12 pass. See manifest table above.

**2. `locateFirstPaletteItem` Skills fallback — BLOCKER, not STYLE.**

The audit brief asks: "Is this a STYLE issue (rename test) or a BLOCKER (semantic mismatch)?" The answer is BLOCKER, for three reasons:

a) The fallback is **the exact same anti-pattern A1 was designed to remove**. A1 removed silent `test.skip()` on a missing element. The new fallback is a silent substitute-different-element-and-pass — same outcome (test never fails when the Agents section is missing), worse cosmetics (the test name suggests it's actually testing the Agents path).

b) **The PM packet explicitly told FE-001 to hard-fail loud.** Quoting the task packet (FE-001 description, A3 section): "If no skill items exist in the palette (empty GANDER_ROOT), `firstSkillItem.waitFor` will fail loudly after 5000ms per A1 philosophy (hard fail, not silent skip)." The packet's general A1 direction was: "no conditional branches for 'agent not visible' remain in the proximity describe block. The flow is: landmark waitFor → dragTo → waitFor node → proceed with assertions." The fallback violates that direction by introducing a *new* conditional branch (`if (agentCount > 0)`) at the helper level.

c) **G6 violation.** The post-mortem rule "the test must assert what its name says" applies directly: `orchestrator↔agent proximity drop` does not assert what its name says when Agents is empty, because the path under test is actually skill-typed. The brief asks me to enforce G6; I do.

**Remediation route options** (FE-001's choice):
- **Option A — make the test environment match the test name.** Add a beforeAll/setup that points the test at a GANDER_ROOT containing agent files (or seeds the agent.list mock), so that the Agents h3 selector finds items. Restore the strict Agents-only landmark selector in the helper. This is the "fail loud" path.
- **Option B — rename tests to match what they actually assert.** Drop the agent/skill type-coding from test names: `'two-node proximity drop renders a .react-flow__edge element'` and `'three-node proximity drop renders a .react-flow__edge element'` (or similar). Document in a comment that the proximity-edge logic is type-agnostic. Keep the fallback but make it explicit and not a hidden masking behavior.
- **Option A is preferred** because it preserves type coverage (orchestrator↔agent is a real semantic case worth testing, and the orchestrator is a CardNode while agent is a MateriaNode — different DOM components — so type does matter even though edge logic doesn't). Option B forfeits that coverage.

**3. Debug scratch files.** Required cleanup. Delete:
- `packages/client/tests/e2e/debug-selector.spec.ts`
- `packages/client/tests/e2e/debug-selector2.spec.ts`

Both are untracked in git (no need to revert; just `rm`). Neither is referenced from any other test or production source. They contain a single trivial `expect(true).toBe(true)` or `expect(h3Count).toBeGreaterThan(0)` and are clearly investigation noise.

**4. Pre-existing failure baseline (13 vs 17).** Out of scope for this AUD — the FE-001 spec file run produced 9/9, exit 0, and FE-001 did not touch any other test file (verified by `git diff --stat HEAD` listing only `packages/client/src/tests/compose/materia-canvas.spec.ts` among test files). The 13-vs-17 discrepancy is FE-002's auditor's problem; if FE-002's production-source changes broke 4 additional e2e specs, that's the FE-002 audit's call. I did not rerun the full e2e suite to compute a current count, because (a) this audit is FE-001-scoped and (b) the FE-001 deliverable is verified passing in isolation.

**5. G6 compliance for A4.** PASS. The DOM-edge assertion at line 341 (`expect(edgeCount).toBe(1)`) precedes the audio assertion at line 348 (`expect(linkOscCount).toBe(2)`). The test name `'edge creation fires link sound and renders DOM edge element'` lists "renders DOM edge element" second, which is slightly suboptimal phrasing but acceptable — the DOM is the primary effect and the assertion ordering reflects that. (A more rigorously G6-aligned name would be `'edge creation renders DOM edge element and fires link sound'`, but this is STYLE, not BLOCKER.)

**6. No production-source modifications by FE-001.** PASS. `git diff --stat HEAD` shows production source diffs only in CardNode.tsx, MateriaNode.tsx, MateriaCanvas.tsx, and constants/compose.ts (plus new file handle-style.ts). All four are unambiguously FE-002 territory: CardNode/MateriaNode show `INVISIBLE_HANDLE_STYLE` import + removal of local `*_HANDLE_STYLE` consts (A5); compose.ts shows META_AGENTS un-aliased import removal + dead-branch deletion (A6). FE-001's only diff is `materia-canvas.spec.ts`, as claimed in the packet.

---

## SX — Security Audit

```xml
<security_audit>
  <status>SECURE</status>
  <threat_level>LOW</threat_level>
  <findings/>
</security_audit>
```

This is a Playwright spec file — no production attack surface. The `addInitScript` patches `AudioParam.prototype.setValueAtTime` only inside the Playwright-controlled browser context (does not persist across browsers, does not affect production). The test reads palette DOM and triggers drag interactions — no auth flow, no data ingestion, no secrets, no external network calls. `npm audit` is unchanged from baseline (no new dependencies).

---

## Required Remediation Before Sprint Close

**BLOCKER — fix before re-audit:**

1. Resolve the `locateFirstPaletteItem` Skills fallback semantic mismatch. Choose one:
   - **Preferred (A):** Restore strict Agents-only landmark in the helper and make the test environment expose agent files (point GANDER_ROOT at a directory with `.claude/agents/*.md`, or seed the agent.list mock). The test must fail loud when Agents is empty, per the task packet's stated philosophy.
   - **Acceptable (B):** Rename the tests to describe what they actually assert. Specifically:
     - Line 143: `'orchestrator↔agent proximity drop renders a .react-flow__edge element'` → `'orchestrator↔node proximity drop renders a .react-flow__edge element'` (orchestrator is invariant; the dropped node may be agent or skill).
     - Line 233: `'agent↔skill proximity drop renders a .react-flow__edge element'` → `'two-node proximity drop renders a .react-flow__edge element'` (both items come from the palette via the same fallback chain).
     - Add a co-located comment explaining the rationale and the type-agnosticism of the proximity-edge mechanism.

**MUST CLEAN before sprint close (cleanup, not a hard re-audit gate but blocks sprint close):**

2. Delete the two debug scratch files:
   ```
   rm packages/client/tests/e2e/debug-selector.spec.ts
   rm packages/client/tests/e2e/debug-selector2.spec.ts
   ```

---

## Files Reviewed

- /home/jhber/projects/gander-studio-alpha/packages/client/src/tests/compose/materia-canvas.spec.ts (361 lines, primary deliverable)
- /home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-FE-001-FE-1777340680.md (FE#1 packet)
- /home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-rev2-1777340068.md (PM#3 packet)
- /home/jhber/projects/gander-studio-alpha/docs/agent-logs/FE/gander-studio-p4-proximity-edge-hardening-FE-001.md (FE#1 log)
- /home/jhber/projects/gander-studio-alpha/packages/client/tests/e2e/debug-selector.spec.ts (scratch — flagged)
- /home/jhber/projects/gander-studio-alpha/packages/client/tests/e2e/debug-selector2.spec.ts (scratch — flagged)
- git status / git diff against HEAD (scope verification)
- live tRPC `agent.list` and `skill.list` calls (fallback-justification verification)
