## [STAGE 3] COMPLETE
- **At:** 2026-05-28T00:03:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/components/ModeContent.tsx` | 35 (net change: +3) | Split padding shorthand into 4 longhands; paddingBottom now 56px |
  | `packages/client/src/globals.css` | -5 net | Removed dead padding-bottom rule + dead mobile padding:16px |
- **Lint:** exit 0
- **Spec:** Tier-2 spec 3/3 passed (4.8s)
- **Constant audit:** 0 matches (no raw hex, no duplicate constants)
- **Style conflict check:** NONE (previous conflict was the bug; resolved)

### Checkpoint — 00:03:00
- Wrote `packages/client/src/components/ModeContent.tsx` (35 lines). Constant audit: 0 matches. Next: update globals.css.
- Wrote `packages/client/src/globals.css` (removed 5 lines). Constant audit: 0 matches. Next: run lint + spec.

## [STAGE 2] PLAN
- **At:** 2026-05-28T00:01:00Z
- **Components to build:** No new components — remediation only
- **Files to modify:**
  - `packages/client/src/components/ModeContent.tsx` — split inline `padding: '28px'` shorthand into `paddingTop`, `paddingLeft`, `paddingRight` (28px each) + `paddingBottom: '56px'` (overrides stylesheet, stays inline as single source of truth for all widths)
  - `packages/client/src/globals.css` — remove now-dead `#mode-content { padding-bottom: 56px }` rule (lines 101-104) and fix the mobile `@media (max-width: 640px)` `#mode-content { padding: 16px }` shorthand to also use `padding-bottom: 56px` — or since inline will own it fully, remove the stylesheet bottom padding rules entirely
- **Strategy:** Move ownership of `padding-bottom` fully to inline in ModeContent.tsx (56px at all widths). This makes the effective value deterministic regardless of any breakpoint cascade. Remove the now-dead CSS rules.
  - Desktop: `paddingTop/Left/Right: '28px'`, `paddingBottom: '56px'`
  - Mobile (≤640px): the CSS currently sets `padding: 16px` as shorthand. Since inline wins, inline already covers it. But to be complete and avoid confusion, apply the mobile-specific paddings as a responsive approach. However, ModeContent doesn't have responsive inline logic. Simplest: keep mobile breakpoint in CSS for `padding: 16px` but add `padding-bottom: 56px` there too to document intent (even though inline wins). Actually — if inline fully owns it, we don't need the CSS rule at all for bottom. Clean approach: remove `padding-bottom` from CSS entirely, own it only in inline.
- **State design:** N/A
- **tRPC wiring:** N/A
- **A11Y plan:** No change to interactive elements

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-05-28T00:00:00Z
- **Task ID:** p5-t1-sidebar-removal (remediation rem1)
- **Message received:**
  > Remediation request — task p5-t1-sidebar-removal (AUDIT FAILED, fix and re-audit). Passed SA and SX, but FAILED QA: live Tier-2 spec showed #mode-content has effective padding-bottom of 28px, not 56px, so the fixed 56px BottomTabBar still occludes the bottom of scrollable content. Root cause: ModeContent.tsx (~line 28) applies inline `padding: '28px'` shorthand which beats the stylesheet rule globals.css #mode-content { padding-bottom: 56px }. Fix: split inline padding into explicit paddingTop/paddingRight/paddingLeft (28px) and set paddingBottom to 56px inline. Reconcile mobile case — at ≤640px effective bottom padding must also be ≥56px. Keep consistent single source of truth. Remove dead CSS rule if ownership moves fully inline. Verify: npm run lint exit 0, Tier-2 spec passes 3/3…[truncated]
