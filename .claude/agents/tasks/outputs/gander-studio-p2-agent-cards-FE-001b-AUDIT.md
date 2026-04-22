# Audit — gander-studio-p2-agent-cards-FE-001b

**Auditor:** AUDITOR#1  
**Date:** 2026-04-04  
**Verdict:** **FAIL — SA violation (a11y)**

---

## 1. Standards Check (SA)

### CardNode.tsx

<audit_review>
  <target_file>packages/client/src/components/compose/CardNode.tsx</target_file>
  <status>FAIL</status>
  <violations>
    <issue line="98-105">
      <rule>Accessibility (A11Y) — All interactive elements must be keyboard-navigable</rule>
      <severity>CRITICAL</severity>
      <description>The title display span (lines 98-105) triggers edit mode via onClick but has no tabIndex, role="button", or onKeyDown handler. Keyboard-only users cannot enter edit mode. The standards require all interactive elements to be keyboard-navigable.</description>
      <remediation>Add tabIndex={0}, role="button", and an onKeyDown handler to the span that calls handleSpanClick() on Enter or Space keypress. Specifically:
        - Add `role="button"` to the span
        - Add `tabIndex={0}` to the span
        - Add `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSpanClick(); } }}` to the span
      </remediation>
    </issue>
  </violations>
</audit_review>

### canvas.ts

<audit_review>
  <target_file>packages/client/src/constants/canvas.ts</target_file>
  <status>PASS</status>
  <violations>None — new constants CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_HEADER_HEIGHT_PX, CARD_BORDER_RADIUS_PX are SCREAMING_SNAKE_CASE and correctly placed.</violations>
</audit_review>

### card-node-title-edit.spec.ts

<audit_review>
  <target_file>packages/client/tests/e2e/card-node-title-edit.spec.ts</target_file>
  <status>PASS</status>
  <violations>None — 3 tests present with correct selectors and test names.</violations>
</audit_review>

**SA stopped at first FAIL. The a11y violation on the span must be fixed before QA and SX proceed.**

---

## 2. Functional Tests (QA) — BLOCKED

Not executed. SA FAIL must be resolved first.

Preliminary checklist (from static read):
- [x] `data-testid="card-node"` on outer div (line 135)
- [x] `data-testid="card-title-display"` on span (line 99)
- [x] `data-testid="card-title-input"` on input (line 85)
- [x] `aria-label="Edit card title"` on input (line 86)
- [x] Crown glyph present in title display (line 103)
- [x] Escape cancels without saving (cancelEdit restores cardTitle, line 49-52)
- [x] blur and Enter both commit (commitEdit called on blur line 91, Enter line 55-56)
- [x] useCanvasStore called for cardTitle and setCardTitle (lines 113-114)
- [x] 3 Playwright tests in spec file
- [x] No changes to MateriaCanvas.tsx (git diff empty)
- [x] No raw hex values in CardNode.tsx
- [x] All numeric px values traced to named constants
- [x] Lint passes clean

<test_report>
  <task_id>gander-studio-p2-agent-cards-FE-001b</task_id>
  <status>BLOCKED — SA FAIL</status>
  <test_coverage>lint PASS (typecheck all 3 packages)</test_coverage>
  <playwright>
    <tier>SKIPPED — SA FAIL</tier>
    <tests_run>0</tests_run>
    <passed>0</passed>
    <failed>0</failed>
  </playwright>
  <defects>
    <bug>
      <description>Title display span is not keyboard-navigable — missing tabIndex, role, and onKeyDown</description>
      <steps_to_reproduce>Tab through the CardNode UI; the title span cannot receive focus and cannot be activated via keyboard</steps_to_reproduce>
      <severity>BLOCKER</severity>
    </bug>
  </defects>
</test_report>

---

## 3. Security Scan (SX) — BLOCKED

Not executed. SA FAIL must be resolved first.

Preliminary (static): No dangerouslySetInnerHTML, no eval, no innerHTML, no hardcoded secrets. User input (title string) is handled via controlled React state — no injection vector identified.

---

## Required Fixes

1. **CardNode.tsx lines 98-105:** Add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler to the `<span data-testid="card-title-display">` that triggers `handleSpanClick()` on Enter or Space key.

After the fix, resubmit for re-audit. QA (Tier 1 + Tier 2 Playwright) and SX will run on the corrected code.
