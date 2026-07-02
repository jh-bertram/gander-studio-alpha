<ui_packet>
  <task_id>gander-studio-p10-deferred-smalls-003</task_id>
  <components_created>
    NONE — no new component files. SOLE edit: packages/client/src/components/sessions/AgentTimeline.tsx (existing FF7TooltipPanel EXTENDED, not replaced, per DRY/out-of-scope constraint).
  </components_created>

  <extension_confirmation>
    FF7TooltipPanel (previously ~496-603, native SVG &lt;title&gt; already replaced by this panel in s4) was reused and extended in place. No new tooltip component was built. The panel's existing rows (agentId, edge label, seq, start offset, duration) are unchanged; five additions were layered on top of the existing structure:
    1. Exact spawn/complete timestamps — `new Date(bar.spawnTs).toLocaleTimeString()` and, for non-orphan bars, `new Date(bar.completeTs).toLocaleTimeString()`; orphan bars (`bar.isOrphan === true` / `completeTs === undefined`) render `completed: in progress`.
    2. `TooltipState.feedbackLoops: number` — display-local derivation, rendered as `loops: {tooltip.feedbackLoops}`. Code comment on both the interface field and the derivation site states this is NOT the SEAM-04 / session-stats.ts counter.
    3. `TooltipState.auditOutcome: 'pass'|'fail'|'mixed'|'none'` — derived from AUDIT_PASS/AUDIT_FAIL marker presence per the four-state mapping, rendered as `audit: {tooltip.auditOutcome}` with FF7 token coloring (pass=--mg, fail=--redb, mixed=--my, none=--wm).
    4. Panel root changed from `aria-hidden="true"` to `role="tooltip"` + `id="timeline-tooltip"`.
    5. Active bar `&lt;g&gt;` gains `aria-describedby="timeline-tooltip"` only while `tooltipState?.bar.agentId === bar.agentId` (undefined otherwise, via ternary — cleared on blur/mouseleave since state resets to null); existing `aria-label={barAriaLabel}` preserved verbatim (accessible NAME unchanged, panel is the accessible DESCRIPTION).
  </extension_confirmation>

  <stale_closure_compliance>
    feedbackLoops and auditOutcome are computed at the BAR-GROUP RENDER CALL SITE (inside the `bars.map(...)` callback, immediately after `const agentMarkers = markersByAgent.get(bar.agentId) ?? []` at ~line 1043), as row-local consts `rowFeedbackLoops` and `rowAuditOutcome`. These are passed as two new trailing arguments into an EXTENDED `showTooltip(bar, svgX, svgY, color, feedbackLoops, auditOutcome)` signature, called from both `onMouseEnter` and `onFocus` on the bar `&lt;g&gt;`.
    The `showTooltip` `useCallback(..., [])` (still empty-dep, ~lines 690-706) is UNCHANGED in kind — it remains a pure setter (`setTooltipState({ bar, svgX, svgY, roleColor: color, feedbackLoops, auditOutcome })`) and does NOT reference `markersByAgent` anywhere in its body. Verified by grep: `markersByAgent` appears only in the map-construction block (~line 833-837, well before showTooltip in the render, but irrelevant since showTooltip never closes over it) and in the row-local `agentMarkers` lookup at ~line 1043 — zero occurrences inside the showTooltip callback body.
  </stale_closure_compliance>

  <state_hydration_map>
    Pure client-side derivation, no BE/tRPC involvement. `events: EventLogEntry[]` prop (already loaded upstream) → `buildMarkers()` → `markersByAgent` Map (existing, unchanged) → row-local `agentMarkers` (existing, unchanged) → NEW: `rowFeedbackLoops`/`rowAuditOutcome` filtered/derived from `agentMarkers` at the bar-group call site → passed into `showTooltip()` → `setTooltipState()` → `TooltipState.feedbackLoops`/`.auditOutcome` → rendered in `FF7TooltipPanel`. `bar.spawnTs`/`bar.completeTs` were already on `AgentBar` (built by the existing `buildBars()`) — no new data plumbing, only new rendering of pre-existing fields.
  </state_hydration_map>

  <a11y_verification>
    - Panel root: `role="tooltip"` + `id="timeline-tooltip"` (grep -c 'role="tooltip"' == 1, confirmed after removing a duplicate string match from a doc comment).
    - Active bar `&lt;g&gt;`: `aria-describedby="timeline-tooltip"` conditionally set (`isActiveTooltipBar ? 'timeline-tooltip' : undefined`), where `isActiveTooltipBar = tooltipState?.bar.agentId === bar.agentId` — React omits the attribute entirely when the value is `undefined`, so it is absent on blur/mouseleave (tooltipState resets to null via `hideTooltip`).
    - `aria-label={barAriaLabel}` on the same `&lt;g&gt;` preserved byte-identical — accessible NAME unchanged; the tooltip is the accessible DESCRIPTION only.
    - Inner decorative elements (MateriaDot span, marker `&lt;g&gt;`s) retain their own `aria-hidden="true"` where they already had it — untouched.
    - Static grep coverage confirms the wiring; the runtime active-only toggle / no-double-announce assertion is flagged per SC#8 as an a11y-auditor runtime duty (Playwright), not claimed as verified here — FE toolset has no browser to run this turn.
  </a11y_verification>

  <design_tokens_used>
    var(--sfh), var(--bdb), var(--rl), var(--fm), var(--wd), var(--w), var(--bd), var(--wm), var(--mt), var(--mg), var(--my), var(--redb), var(--gt) — all pre-existing tokens already used by this panel; no new tokens introduced, no raw hex added.
  </design_tokens_used>

  <style_conflict_check>NONE</style_conflict_check>

  <constant_audit>
    Raw hex grep on AgentTimeline.tsx: 0 matches. Inline-style/Tailwind conflict grep: 0 matches (this file uses inline style objects exclusively, pre-existing pattern, no Tailwind classes on the touched elements). Unguarded onClick-on-span/div/li/a grep: 0 matches (no onClick added; only onMouseEnter/onFocus/onMouseLeave/onBlur on an already-focusable `&lt;g tabIndex={0} role="img"&gt;`). JSON.parse grep: 0 matches (no external data parsing introduced).
  </constant_audit>

  <verification>
    - `npx tsc --noEmit --project packages/shared/tsconfig.json` → clean, no output (exit 0).
    - `npx tsc --noEmit --project packages/server/tsconfig.json` → clean, no output (exit 0).
    - `npx tsc --noEmit --project packages/client/tsconfig.json` → clean, no output (exit 0).
    - `npm run build -w @gander-studio/client` → passed: "✓ 2497 modules transformed... ✓ built in 10.26s" (tsc && vite build both succeeded; PWA precache generated).
    - SC#3 grep: `new Date(bar.spawnTs)` present (line ~525); `new Date(bar.completeTs` present (line ~529); orphan path renders "in progress" for the completion line.
    - SC#4 grep: `feedbackLoops` appears in TooltipState interface (line 116), destructure (520), render (626), and derivation-related comment/param (690-704) — 7 hits across interface/call-site/render roles; display-local comment present at the interface field and above the showTooltip callback.
    - SC#5/SC#6: `auditOutcome` typed `'pass'|'fail'|'mixed'|'none'` in TooltipState; derived from AUDIT_PASS/AUDIT_FAIL markers at the bar-group call site (`hasAuditPass`/`hasAuditFail` from row-local `agentMarkers`); `grep -n 'markersByAgent'` shows zero occurrences inside the showTooltip useCallback body (only in the map-build block ~833-837 and the row-local agentMarkers lookup ~1043).
    - SC#7: `grep -c 'role="tooltip"'` == 1; `grep -c 'aria-describedby'` == 4 (>=1 satisfied — 1 JSX attribute + 3 comment/doc mentions); `aria-label={barAriaLabel}` still present on the bar g; panel root no longer carries `aria-hidden="true"` (changed to role="tooltip").
    - SC#9: `git diff --stat packages/client/package.json` → no diff (this task touched only AgentTimeline.tsx; package.json changes belong to no packet — confirmed empty).
    - SC#10: `data-testid="timeline-tooltip"` present on the panel root (line ~540) — unchanged selector preserved.
    - SC#11: raw hex grep on the file → 0 matches.
    - SC#12: existing e2e data-testid selectors (`timeline-tooltip`, `agent-timeline-svg`, `timeline-bar-{agentId}`, `timeline-bar-rect-{agentId}`, `timeline-marker-*`, `timeline-playhead`, `agent-timeline-scroller`, `timeline-label-{agentId}`) are all byte-identical, untouched by this edit — no regression to existing specs.
  </verification>

  <out_of_scope_respected>
    No edits to globals.css, session-stats.ts, SEAM-06 marker encoding (evColor/evLabel/MarkerShape unchanged), or zoom/axis/scroll logic. No auditor-identity plumbing added. No new npm dependency (package.json untouched by this task). No untracked scratch e2e specs touched. No git commit run.
  </out_of_scope_respected>

  <integration_status>SUCCESS — pure client-side extension of an existing component; no BE dependency, no mocked contract needed.</integration_status>
</ui_packet>
