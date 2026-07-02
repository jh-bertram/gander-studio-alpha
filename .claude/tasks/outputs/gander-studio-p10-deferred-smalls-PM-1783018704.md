<task_decomposition task_id="gander-studio-p10-deferred-smalls" agent_count="3">

  <task_packets>

    <!-- ============================================================ -->
    <!-- DEFERRED-003 — rich hover/focus tooltip on AgentTimeline bars -->
    <!-- ============================================================ -->
    <task_packet>
      <task_id>gander-studio-p10-deferred-smalls-003</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>NORMAL</priority>
      <description>
Enrich the EXISTING `FF7TooltipPanel` in `packages/client/src/components/sessions/AgentTimeline.tsx` (the native SVG `<title>` was ALREADY replaced by this panel in s4 — do NOT build a new tooltip; reuse and extend the one at lines ~496-603). The panel today renders: agentId, edge label, seq, relative start offset, duration. Add the following and wire proper tooltip a11y:

1. EXACT TIMESTAMPS. In addition to the existing relative offset, render the exact spawn timestamp from `bar.spawnTs` and the exact complete timestamp from `bar.completeTs` (both are epoch-ms numbers already on `AgentBar`). Format with a `Date` (e.g. `new Date(bar.spawnTs).toLocaleTimeString()` or ISO). For orphan bars (`bar.isOrphan === true`, `completeTs === undefined`) render the completion line as "in progress". Keep the existing relative-offset and duration lines (do not remove existing info).

2. FEEDBACK-LOOP COUNT (display-local). Extend `TooltipState` with a numeric field (e.g. `feedbackLoops: number`). Compute it at `showTooltip` call time from THAT agent's markers already available in the render loop (`agentMarkers` / `markersByAgent`), as the count of markers whose `ev` is `'AUDIT_FAIL'` or `'CRITIQUE_BLOCK'`. Render it in the panel body (e.g. `loops: {n}`). Add a code comment stating this is a DISPLAY-LOCAL derivation for the tooltip only and is NOT the authoritative SEAM-04 / session-stats feedback-loop counter (do not import from or modify session-stats.ts).

3. AUDIT OUTCOME (attribution from available marker data). Extend `TooltipState` with an audit-outcome field derived from that agent's markers: `'pass'` if an `AUDIT_PASS` marker exists and no `AUDIT_FAIL`; `'fail'` if `AUDIT_FAIL` and no `AUDIT_PASS`; `'mixed'` if both; `'none'` if neither. Render it (e.g. `audit: pass`). NOTE: auditor IDENTITY (which auditor performed the audit) is NOT surfaced on `AgentMarker` (fields are agentId, ev, ts, seq, edgeLabel only) — do NOT add data-plumbing to surface it; outcome-from-available-markers is the deliverable. (Auditor-identity display is flagged out-of-scope for this sprint — see risk_flags.)

4. ACCESSIBLE TOOLTIP WIRING (role="tooltip"). Change the `FF7TooltipPanel` ROOT element from `aria-hidden="true"` to `role="tooltip"` with a stable `id` (e.g. `id="timeline-tooltip"`). On the bar `<g>` that currently triggers the panel (the `g[role="img"]` at lines ~1024-1034), add `aria-describedby="timeline-tooltip"` while that bar is the active/hovered/focused bar (i.e. when `tooltipState?.bar.agentId === bar.agentId`). PRESERVE the existing `aria-label={barAriaLabel}` on that `<g>` (accessible NAME stays on aria-label; the tooltip becomes the accessible DESCRIPTION). Inner decorative spans in the panel (MateriaDot etc.) may keep their own `aria-hidden="true"`.

Use existing FF7 CSS tokens already in the panel (`var(--sfh)`, `var(--bdb)`, `var(--wm)`, `var(--mt)`, `var(--mg)`, `var(--my)`, etc.). Do not introduce raw hex. Do not add any new npm dependency.
      </description>
      <success_criteria>
1. `tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json` — all clean.
2. `npm run build -w @gander-studio/client` passes (tsc && vite build).
3. Exact timestamps rendered: `grep -n "new Date(bar.spawnTs)" AND "new Date(bar.completeTs" AgentTimeline.tsx` both present inside FF7TooltipPanel; orphan path renders "in progress".
4. Feedback-loop count: `grep -c "'AUDIT_FAIL'" AgentTimeline.tsx` and `grep -c "'CRITIQUE_BLOCK'" AgentTimeline.tsx` show a filter/derivation in the tooltip data path; `TooltipState` interface contains a numeric feedback-loops field; the panel renders it. A code comment naming it "display-local" (not SEAM-04) is present.
5. Audit outcome: `TooltipState` contains an audit-outcome field derived from `AUDIT_PASS`/`AUDIT_FAIL` markers; panel renders an `audit:` line.
6. a11y wiring: `grep -c 'role="tooltip"' AgentTimeline.tsx` == 1 (on the panel root); `grep -c 'aria-describedby' AgentTimeline.tsx` >= 1 (on the active bar g); the bar `<g>` still carries `aria-label={barAriaLabel}` (grep confirms preserved).
7. `aria-hidden="true"` no longer present on the FF7TooltipPanel ROOT div (it now has role="tooltip"); inner decorative spans may retain aria-hidden.
8. `packages/client/package.json` `dependencies` block unchanged (no new dependency).
9. `data-testid="timeline-tooltip"` still present on the panel (existing e2e selector preserved — no regression).
      </success_criteria>
      <context_files>
packages/client/src/components/sessions/AgentTimeline.tsx  (SOLE edit target — FF7TooltipPanel at ~496-603; TooltipState at ~107-113; showTooltip/hideTooltip at ~645-654; bar-group render at ~1020-1067; markersByAgent at ~776-781)
DESIGN.md  (design source of truth — Constitution + Color Tokens; read-only reference for token names)
</context_files>
      <dependencies>NONE (parallel with 004 and 006; disjoint files)</dependencies>
      <estimated_new_lines>55</estimated_new_lines>
      <out_of_scope>
- Do NOT edit globals.css (that is DEFERRED-006 / packet 006) — no token value or comment changes here.
- Do NOT add auditor-IDENTITY plumbing (surfacing which auditor audited) — data not on AgentMarker; deferred.
- Do NOT import from, call, or modify session-stats.ts / SEAM-04 feedback-loop counting — feedback count here is display-local only.
- Do NOT change the SEAM-06 marker encoding table, evColor/evLabel/MarkerShape, or the zoom/axis/scroll logic.
- Do NOT delete, commit, or modify the untracked pre-existing scratch e2e specs (packages/client/tests/e2e/debug-*.spec.ts, zz-*.spec.ts).
- Do NOT add a new npm dependency.
      </out_of_scope>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>Confirmation the existing FF7TooltipPanel was extended (not replaced) — DRY reuse</item>
          <item>The four added elements: exact spawn/complete timestamps, display-local feedback-loop count, audit outcome, role="tooltip" + aria-describedby wiring with aria-label preserved</item>
          <item>tsc clean + client build passing confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex color values (all colors via var(--*) tokens)</item>
          <item>Any new npm dependency</item>
          <item>Edits to globals.css, session-stats.ts, or the SEAM-06 marker encoding</item>
        </must_not_contain>
        <success_signal>tsc --noEmit clean across all three packages, client build passing, grep checks 3-9 all satisfied in AgentTimeline.tsx</success_signal>
      </output_expected>
    </task_packet>

    <!-- ============================================================ -->
    <!-- DEFERRED-004 — event-log slug matcher over-match guard + test -->
    <!-- ============================================================ -->
    <task_packet>
      <task_id>gander-studio-p10-deferred-smalls-004</task_id>
      <assigned_to>backend-engineer</assigned_to>
      <priority>NORMAL</priority>
      <description>
Tighten the slug matcher to anchored matching and prove it with unit tests. IMPORTANT — the over-match logic is NOT inline in event-log-parser.ts (the ORC ground-fact "lines 65-66" is stale). It lives in `packages/server/src/session-slug-match.ts`, function `matchesSlug` (line 15):

  export function matchesSlug(taskId: string, slug: string): boolean {
    return taskId.startsWith(slug) || taskId.includes(slug);
  }

The `.includes(slug)` (and unbounded `.startsWith`) let a short/generic slug substring-match an unrelated sprint (e.g. slug `gander-studio-p2` over-matches task_id `gander-studio-p20-bar`; slug `gander` over-matches `some-task-with-gander-in-it`).

CHANGE 1 — anchor the predicate:

  export function matchesSlug(taskId: string, slug: string): boolean {
    return taskId === slug || taskId.startsWith(slug + '-');
  }

This aligns `matchesSlug` with the existing boundary-prefix semantics already used by `isDocumented` (Path 1, line 124). The ONLY production caller is `parseEventLogFiles` (event-log-parser.ts line 85) — do not edit that file; it consumes `matchesSlug` unchanged. Verified callers (grep): event-log-parser.ts (production), session-list.test.ts (test). No other production consumer.

CHANGE 2 — fix the EXISTING stale assertion (same-file fix propagation). `packages/server/src/parsers/__tests__/session-list.test.ts` has a `describe('matchesSlug — unit', ...)` block (lines ~204-213). Line ~209 currently asserts the substring OVER-match as desired behaviour:
    expect(matchesSlug('some-task-with-gander-in-it', 'gander')).toBe(true);
Flip it to `.toBe(false)` (the guard now rejects it) and update that test's `it(...)` description to describe over-match REJECTION rather than substring acceptance. Verify the other existing assertions still hold under anchoring:
  - line ~206 `matchesSlug('gander-studio-p2-foo-FE-001','gander-studio-p2-foo')` → still true (startsWith slug+'-').
  - line ~212 `matchesSlug('system','gander-studio-p2-foo')` → still false.

CHANGE 3 — extend the SAME `matchesSlug — unit` describe block (DRY — do NOT create a new test file) with guard assertions proving the fix, at minimum:
  - exact match: `matchesSlug('gander-studio-p10','gander-studio-p10')` → true
  - boundary-prefix: `matchesSlug('gander-studio-p10-deferred-smalls-004','gander-studio-p10')` → true
  - phase over-match guard: `matchesSlug('gander-studio-p20-bar','gander-studio-p2')` → false (the p2-vs-p20 case)
  - generic-substring guard: `matchesSlug('some-task-with-gander-in-it','gander')` → false (this is the flipped Change-2 assertion; ensure it is asserted as false)
      </description>
      <success_criteria>
1. `matchesSlug` in session-slug-match.ts now reads `taskId === slug || taskId.startsWith(slug + '-')`; `grep -c '.includes(slug)' session-slug-match.ts` == 0 (old substring branch removed).
2. `npm test -w @gander-studio/server` (vitest run src/parsers/__tests__) passes GREEN — all assertions including the flipped line-209 assertion and the new guard assertions.
3. New guard assertions present in the `matchesSlug — unit` describe block covering: exact match (true), boundary-prefix slug+'-' (true), p2-vs-p20 phase over-match (false), generic-substring over-match (false).
4. The stale assertion `matchesSlug('some-task-with-gander-in-it','gander')` now asserts `.toBe(false)` with an updated `it(...)` description.
5. `tsc --noEmit` clean across all three packages.
6. Only `session-slug-match.ts` and `session-list.test.ts` are modified — `git diff --name-only` shows exactly those two files. event-log-parser.ts, router.ts, and other callers are byte-identical to HEAD.
      </success_criteria>
      <context_files>
packages/server/src/session-slug-match.ts  (matchesSlug at line 14-16 — edit target; leave sprintRoot/isDocumented untouched)
packages/server/src/parsers/__tests__/session-list.test.ts  (matchesSlug — unit describe at ~204-213 — edit target; fix line ~209 + extend)
packages/server/src/parsers/event-log-parser.ts  (read-only — the single production caller, line 85; do NOT edit)
packages/server/package.json  (read-only — test script: "test": "vitest run src/parsers/__tests__")
</context_files>
      <dependencies>NONE (parallel with 003 and 006; disjoint files)</dependencies>
      <out_of_scope>
- Do NOT modify sprintRoot or isDocumented in session-slug-match.ts.
- Do NOT edit event-log-parser.ts, router.ts, or any other matchesSlug/parseEventLogFiles consumer.
- Do NOT create a new test file — extend the existing `matchesSlug — unit` describe block in session-list.test.ts.
- Do NOT touch slug-and-saveedit.test.ts or other unrelated tests.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>The anchored matchesSlug predicate (=== slug || startsWith(slug + '-'))</item>
          <item>Confirmation the stale line-209 over-match assertion was flipped to false + description updated</item>
          <item>New guard assertions incl. the p2-vs-p20 case</item>
          <item>vitest GREEN output for @gander-studio/server</item>
        </must_contain>
        <must_not_contain>
          <item>A newly-created standalone test file (must extend the existing describe block)</item>
          <item>Edits to event-log-parser.ts, router.ts, sprintRoot, or isDocumented</item>
        </must_not_contain>
        <success_signal>vitest run passes green; tsc clean x3; git diff --name-only == exactly session-slug-match.ts + session-list.test.ts</success_signal>
      </output_expected>
    </task_packet>

    <!-- ============================================================ -->
    <!-- DEFERRED-006 — --redb below WCAG AA remediation             -->
    <!-- ============================================================ -->
    <task_packet>
      <task_id>gander-studio-p10-deferred-smalls-006</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>NORMAL</priority>
      <description>
Remediate the below-AA `--redb` token. It is the ledger-ratified contrast fix — the target value and the WCAG math below are a PRE-RATIFIED spec (deferred-work ledger DEFERRED-006 default: lighten-in-place). You are IMPLEMENTING a ratified spec, not authoring a new design decision.

CURRENT STATE (verified on disk):
- globals.css line 21: `--redb: #cf3c3c;` — 4.07:1 on `--void` (#070d0c) — below AA 4.5:1 for normal text.
- globals.css line 357: `--destructive: var(--redb); /* #cf3c3c — 4.07:1 on --void (BELOW AA for normal text; see DEFERRED-006) */`
- `--redb` is also consumed as a GRAPHICAL marker color in AgentTimeline.tsx (SEAM-06 AUDIT_FAIL/FAIL + legend). Graphical objects need ≥3:1 only — the new value clears that. The `--destructive → var(--redb)` MAPPING is unchanged; only the source value + annotations move.

CHANGE 1 — globals.css value: set `--redb: #e05555;` (line 21). Update the line-357 annotation comment to the TRUE post-fix ratio and AA-pass status, e.g. `/* #e05555 — 5.22:1 on --void (AA for normal text; DEFERRED-006 resolved) */`. The word "below AA" must not remain on that line.

WCAG VERIFICATION (embed in your packet; this is the mechanical SC):
Method = WCAG 2.x relative luminance. Per channel c∈{R,G,B}: cs=c/255; cl = cs/12.92 if cs≤0.03928 else ((cs+0.055)/1.055)^2.4. L = 0.2126·Rl + 0.7152·Gl + 0.0722·Bl. Contrast = (Llight+0.05)/(Ldark+0.05).
- `--void` #070d0c → L ≈ 0.003601.
- OLD `--redb` #cf3c3c → L ≈ 0.168181 → contrast = (0.168181+0.05)/(0.003601+0.05) = 4.070:1 (confirms the recorded 4.07 — method valid).
- NEW `--redb` #e05555 (R=224,G=85,B=85) → Rl≈0.74540, Gl=Bl≈0.090846 → L ≈ 0.230004 → contrast = (0.230004+0.05)/(0.003601+0.05) = 0.280004/0.053601 = **5.22:1** (PASS AA ≥4.5:1). Re-derive and confirm this number in your packet's contrast_pairs.

CHANGE 2 — DESIGN.md doc-sync (same-value propagation; grep shows `#cf3c3c` at 3 sites + one `4.07:1` site):
- line 33 (Color Tokens table `--color-error`): `#cf3c3c` → `#e05555`.
- line 183 (Decision Record A `--destructive` row Contrast Note): update hex + "4.07:1 … below AA" → "5.22:1 … AA (DEFERRED-006 resolved)".
- line 325 (Decision Record B Contrast Pair Summary, Destructive row): `#cf3c3c … 4.07:1 … below AA` → `#e05555 … 5.22:1 … AA`.
- Append a short `## Decision Record D — DEFERRED-006 --redb Contrast Remediation (p10, 2026-07-02)` recording: old #cf3c3c/4.07:1, new #e05555/5.22:1 on --void, the method above, and that #e05555 is the ledger-ratified lighten-in-place target. Include a contrast_pairs entry.

CHANGE 3 — regression guard on the OTHER --redb usage (multi-use token). Grep for `--destructive-foreground` (and any destructive/error pairing that uses `--redb`/`--destructive` as a BACKGROUND with light text). If such a foreground exists and `--destructive` is used as a background, verify the foreground-on-#e05555 pairing does NOT drop below its prior WCAG tier; record it in contrast_pairs. If it REGRESSES below AA, STOP and flag to ORC — do NOT ship a fix that trades one AA failure for another. (Lightening --redb improves text-on-dark, the DEFERRED-006 target, but can lower white-text-on-red-background contrast.)
      </description>
      <success_criteria>
1. globals.css: `grep -c '#e05555' globals.css` >= 1 AND `--redb: #e05555;` present; `grep -c '#cf3c3c' globals.css` == 0.
2. globals.css line-357 annotation states the new ratio (~5.22:1) and AA (not "below AA"): `grep -c 'below AA' globals.css` == 0.
3. Contrast math for #e05555 on #070d0c re-derived in the packet == ≥4.5:1 (≈5.22:1); method + intermediate luminances shown.
4. DESIGN.md doc-sync: `grep -c '#cf3c3c' DESIGN.md` == 0 AND `grep -c '4.07:1' DESIGN.md` == 0; `#e05555` and `5.22:1` present at the three updated sites; a `Decision Record D` heading for DEFERRED-006 exists.
5. Regression guard executed: destructive-as-background foreground pairing (if any) checked and recorded in contrast_pairs, OR explicit confirmation `--redb`/`--destructive` is used only as text/graphical color (no light-text-on-red-bg pairing). No pairing left below AA.
6. `tsc --noEmit` clean across all three packages (confirms no accidental .ts edit) AND `npm run build -w @gander-studio/client` passes (Tailwind/vite compiles globals.css).
7. Only `--redb`'s value + its annotations + the four DESIGN.md sites changed. `--red` (#a12d2d), `--mr` (#e74c3c), `--materia-red`, and the `--destructive: var(--redb)` mapping are unchanged. No other token value modified.
      </success_criteria>
      <context_files>
packages/client/src/globals.css  (edit: line 21 --redb value; line 357 --destructive annotation. Leave --red/--mr and the var(--redb) mapping intact)
DESIGN.md  (edit: line 33 Color Tokens; line 183 Decision Record A; line 325 Decision Record B; append Decision Record D)
</context_files>
      <dependencies>NONE (parallel with 003 and 004; disjoint files — 003 edits AgentTimeline.tsx which only CONSUMES var(--redb), no file conflict)</dependencies>
      <estimated_new_lines>18</estimated_new_lines>
      <out_of_scope>
- Do NOT change `--red` (#a12d2d), `--mr` (#e74c3c), `--materia-red`, or any non-`--redb` token value.
- Do NOT change the `--destructive: var(--redb)` mapping — only the source `--redb` value + comments.
- Do NOT edit AgentTimeline.tsx (that is DEFERRED-003 / packet 003) — the marker color change propagates automatically via the token.
- Do NOT introduce a new token variant (--redb-text/--redb-bg) — ledger default is lighten-in-place; the split-variant option was explicitly the non-default.
- Do NOT delete, commit, or modify untracked scratch e2e specs.
      </out_of_scope>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>contrast_pairs entry proving #e05555 on #070d0c ≥ 4.5:1 (≈5.22:1) with method shown</item>
          <item>globals.css value + annotation update; DESIGN.md four-site doc-sync incl. Decision Record D</item>
          <item>regression-guard result for the destructive-background pairing (or confirmation it is text-only)</item>
        </must_contain>
        <must_not_contain>
          <item>Any change to --red, --mr, --materia-red, or the --destructive→var(--redb) mapping</item>
          <item>A new --redb-* token variant</item>
          <item>Remaining #cf3c3c or 4.07:1 in globals.css or DESIGN.md</item>
        </must_not_contain>
        <success_signal>tsc clean x3 + client build passing; grep SCs 1,2,4 satisfied; contrast math confirmed ≥4.5:1; regression guard recorded</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    <!-- All three packets are file-disjoint and independent → fully parallel. -->
    gander-studio-p10-deferred-smalls-003 (FE)  ∥  gander-studio-p10-deferred-smalls-004 (BE)  ∥  gander-studio-p10-deferred-smalls-006 (FE)
    Each gated by its own audit (SA + QA + SX PASS).
    GATE-TEST (close-blocking, packet 004): `npm test -w @gander-studio/server` must run GREEN — a static audit cannot prove the new unit assertions pass; ORC/auditor confirms the actual vitest run, not just file presence.
  </dependency_order>

  <routing_notes>
    <!-- ===== PM Preflight acknowledgements (4) ===== -->
    - OVERSCOPED (ack): each packet ≤ 2 independent files per domain. 003 = 1 file (AgentTimeline.tsx). 004 = 2 files (session-slug-match.ts + session-list.test.ts). 006 = 2 files (globals.css + DESIGN.md). No 3+-file packet; no split required.
    - DRY (ack): 003 EXTENDS the existing FF7TooltipPanel (no new tooltip/overlay component) — searched AgentTimeline.tsx, the panel + TooltipState + showTooltip already exist. 004 EXTENDS the existing `matchesSlug — unit` describe block (no new test file) and reuses the existing matchesSlug function. 006 edits an existing token (no new variant). The legacy FocusTooltipOverlay sketch (`s3-t1-ui-spec-UI-1779932400.md`) was searched via glob in BOTH output dirs — NOT FOUND; not needed, since the live FF7TooltipPanel supersedes it.
    - aas-3-legacy-envelope (ack): auditor briefs must use the CURRENT audit-pipeline envelope (SA/QA/SX). No legacy audit format requested anywhere in this decomposition.
    - subagentstop-complete-miss (ack): every Output Path uses the plain `{task_id}-{AGENT_CODE}-{unix_ts}.md` shape (e.g. `gander-studio-p10-deferred-smalls-003-FE-{unix_ts}.md`). Any re-spawn appends a suffix to the TASK_ID segment (`-rem`, `-gap`), never between AGENT_CODE and timestamp. NOTE: no spawn prompt in this sprint cites an upstream agent's outputs/*.md path above its own Output Path block (firstmatch-miskey avoidance).

    <!-- ===== Recurring-pattern preflight (Step 0.5) ===== -->
    - Relying on the brief's pre-extracted `prior_sprint_gaps` (p9 after-action + pm-preflight) as the canonical recurrence extract, per the tool-call-budget rule (pre-extracted context is canonical; do not re-fetch). Two of three ORC ground facts were stale, forcing real-source reads (12 total, over soft-8) — declared under budget note below.
    <recurring_pattern source="gander-studio-p9 (via brief prior_sprint_gaps)">OVERSCOPED: task packet ≤ 2 independent files per domain; 3+ → split.</recurring_pattern> — AVOIDED: max 2 files/packet (see OVERSCOPED ack).
    <recurring_pattern source="gander-studio-p9 (via brief prior_sprint_gaps)">DRY: search for existing implementations before authoring new helper/component.</recurring_pattern> — AVOIDED: all three packets extend existing code (FF7TooltipPanel / matchesSlug + existing test block / existing token).
    <recurring_pattern source="gander-studio-p9 (via brief prior_sprint_gaps)">subagentstop-complete-miss: Output Path naming discipline.</recurring_pattern> — AVOIDED: plain shape enforced (see ack).
    <recurring_pattern source="gander-studio-p9 (via brief prior_sprint_gaps)">aas-3-legacy-envelope: current audit envelope only.</recurring_pattern> — AVOIDED (see ack).

    <!-- ===== Stale-ground-fact surfaces (RE-2/RE-3) ===== -->
    - DEFERRED-003 ground fact STALE: the native SVG `<title>` was ALREADY replaced by `FF7TooltipPanel` in s4 (AgentTimeline.tsx lines ~496-603, ~1020-1067). Packet 003 is scoped as ENRICHMENT of the existing panel (add exact timestamps, display-local feedback-loop count, audit outcome, role="tooltip"+aria-describedby), NOT a from-scratch build. This is the DRY-correct interpretation.
    - DEFERRED-004 ground fact STALE: the over-match predicate is NOT inline in event-log-parser.ts lines 65-66 — it was refactored into `session-slug-match.ts` `matchesSlug` (line 15), called by parseEventLogFiles. Additionally, an EXISTING test (session-list.test.ts line ~209) ASSERTS the substring over-match as desired behaviour and MUST be flipped to the guard — same-file fix propagation (RE-4). Packet 004 handles both.
    - Server test infra CONFIRMED present: vitest (`"test": "vitest run src/parsers/__tests__"`), existing tests session-list.test.ts + slug-and-saveedit.test.ts using describe/expect/.toBe. The brief's "no server test infra?" uncertainty is resolved — extend existing vitest suite (no Playwright/node-test fallback needed).

    <!-- ===== DEFERRED-006 owner decision (remit note for ORC/Critic ratification) ===== -->
    - Packet 006 assigned to frontend-engineer, NOT ui-designer, to keep the sprint at the mandated 3 packets (one per DEFERRED item). Rationale: the design DECISION (target value + contrast target) is PRE-RATIFIED by the deferred-work ledger (lighten-in-place, #e05555), so FE is IMPLEMENTING a ratified spec (embedded verbatim + contrast math in the packet), not defining one — consistent with FE's "consume specs, don't define" remit and with prior sprints where FE (Records A/B/C p2/p3) implemented globals.css token values while the decision records were UI-authored. FE additionally doc-syncs DESIGN.md numeric references + appends a record-of-applied-change Decision Record D (mechanical, not a novel design choice). IF ORC prefers a UI-Designer-authored decision record, that is a one-packet add (UI decides+records → FE applies) — flagged for your call, but not required.

    <!-- ===== Append-serialization ===== -->
    - No two packets write the same file (003→AgentTimeline.tsx; 004→session-slug-match.ts + session-list.test.ts; 006→globals.css + DESIGN.md). No shared-ledger appends within the sprint. No serialization needed. All parallel.

    <!-- ===== SC-locked-value lint (Step 7.5) ===== -->
    - Manual locked-value SC self-lint performed: 006's grep SCs anchor on VALUES (`#e05555` present / `#cf3c3c` == 0 / `4.07:1` == 0 / `below AA` == 0) — all satisfiable by faithful execution of the ledger-locked value; no SC forbids a character the locked value contains. 004's grep SCs anchor on the predicate text, not a bare key. 003's grep SCs anchor on quoted ev-value strings (`'AUDIT_FAIL'`) and role="tooltip", not bare field keys (Step 7.8).
    - NOTE (tooling limitation): this PM's toolset is Read/Write/Glob/Grep — NO Bash. The mechanical `sc-locked-value-consistency` precheck script (Step 7.5 backstop, which requires Bash) could NOT be run here. ORC should run the sc-precheck against this decomposition before dispatch, per the Critic gate requirement. Manual lint above is the interim assurance.

    <!-- ===== Which critics/auditors are most relevant ===== -->
    - 003: QA (tooltip renders new fields; no e2e-selector regression) + SX/QA a11y (role="tooltip" + aria-describedby with aria-label preserved — this is an a11y ARCHITECTURE change from the prior aria-hidden decorative panel; verify no name/description regression).
    - 004: QA (vitest GREEN incl. flipped + new assertions) + SA (only two files touched).
    - 006: SA/QA WCAG contrast verification (re-derive 5.22:1) + the destructive-background regression guard.
    - Budget note: 12 reads used (soft cap 8). Over-cap justified: 2 of 3 ORC ground facts were stale, requiring real-source verification of session-slug-match.ts, the matchesSlug call-graph, and the existing test assertions — without which packets 003/004 would have shipped broken investigation paths (RE-2/RE-3). Decomposition COMPLETE, not truncated.
  </routing_notes>

  <verbatim_deliverable_audit>
    <phrase text="Drain the three open, unblocked deferred-work items"><addressed task="gander-studio-p10-deferred-smalls-003, -004, -006"/></phrase>
    <phrase text="DEFERRED-003 (rich hover/focus tooltip on AgentTimeline bars)"><addressed task="gander-studio-p10-deferred-smalls-003"/></phrase>
    <phrase text="DEFERRED-004 (event-log slug matcher over-match guard + unit test)"><addressed task="gander-studio-p10-deferred-smalls-004"/></phrase>
    <phrase text="DEFERRED-006 (--redb token below WCAG AA for normal text — remediate)"><addressed task="gander-studio-p10-deferred-smalls-006"/></phrase>
    <phrase text="do we have things to do in various places? let's do them all"><addressed task="gander-studio-p10-deferred-smalls-003, -004, -006 (all three studio-alpha unblocked items decomposed)"/></phrase>
    <phrase text="these are the studio-alpha items"><addressed task="scope confined to gander-studio-alpha; DEFERRED-P9-1 and DEFERRED-001 explicitly excluded per brief"/></phrase>
    <phrase text="rich hover/focus tooltip — sub-field: exact spawn/complete timestamps"><addressed task="gander-studio-p10-deferred-smalls-003"/></phrase>
    <phrase text="rich hover/focus tooltip — sub-field: feedback-loop count"><addressed task="gander-studio-p10-deferred-smalls-003 (display-local derivation from markers)"/></phrase>
    <phrase text="rich hover/focus tooltip — sub-field: audit attribution"><addressed task="gander-studio-p10-deferred-smalls-003 (audit OUTCOME from available markers)"/></phrase>
    <phrase text="rich hover/focus tooltip — sub-field: auditor IDENTITY (who audited)"><out_of_scope reason="auditor identity is not surfaced on AgentMarker (fields: agentId,ev,ts,seq,edgeLabel); adding data-plumbing exceeds a small-sprint bounded item — flagged for a follow-up if the ledger requires named-auditor display"/></phrase>
    <phrase text="over-match guard — unit test"><addressed task="gander-studio-p10-deferred-smalls-004 (extends existing matchesSlug — unit vitest block; GATE-TEST requires green run)"/></phrase>
  </verbatim_deliverable_audit>

  <risk_flags>
    - GROUND-FACT STALE x2 (surfaced above): DEFERRED-003 tooltip already exists (enrichment, not build); DEFERRED-004 logic is in session-slug-match.ts not event-log-parser.ts, and an existing test asserts the over-match and must be flipped. Both handled — but ORC should confirm the enrichment scope for 003 matches ledger intent (the ledger text was paraphrased by ORC, not read verbatim by PM).
    - A11Y ARCHITECTURE CHANGE (003): switching FF7TooltipPanel from `aria-hidden="true"` (decorative) to `role="tooltip"` + `aria-describedby` changes the accessible tree. This is the correct accessible-tooltip pattern and an improvement, but the prior code explicitly chose aria-hidden to avoid regression — the a11y auditor must confirm the bar's accessible NAME (aria-label) is preserved and the tooltip content is announced as DESCRIPTION only (no double-announce, no name loss).
    - DESTRUCTIVE-BACKGROUND REGRESSION (006): lightening `--redb` from #cf3c3c→#e05555 raises text-on-dark contrast (the DEFERRED-006 target, 4.07→5.22:1) but LOWERS the contrast of any light foreground rendered ON a `--destructive` red BACKGROUND (e.g. white-text destructive button). Packet 006 SC #5 requires checking `--destructive-foreground` and halting-to-flag if that pairing regresses below AA. ORC/auditor: do not accept 006 if the regression guard was skipped.
    - FEEDBACK-LOOP SEMANTICS (003): the tooltip's feedback-loop count is DISPLAY-LOCAL (derived from in-component markers) and is intentionally decoupled from the authoritative SEAM-04/session-stats counter (per the existing code comment at AgentTimeline.tsx line 45-46). If the two counts diverge for edge cases, that is expected — the tooltip is a per-agent glance, not the stats source of truth. Flagged so the auditor does not treat a divergence as a defect.
    - DEFERRED-006 OWNER (remit): FE assigned (not UI Designer) to hold 3-packet budget; the design decision is ledger-pre-ratified. If Critic deems FE-authoring-a-Decision-Record a remit violation, escalate for a UI+FE two-packet split of 006 (raises count to 4).
    - SC-PRECHECK NOT RUN (tooling): PM has no Bash; the mechanical sc-locked-value precheck script could not run. Manual lint done; ORC must run the script pre-dispatch (Critic gate requirement).
  </risk_flags>

</task_decomposition>

<expectation_manifest>
  <sprint_id>gander-studio-p10-deferred-smalls</sprint_id>
  <generated>2026-07-02T19:05:00Z</generated>
  <assignments>
    <assignment>
      <task_id>gander-studio-p10-deferred-smalls-003</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p10-deferred-smalls-003-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>Confirms FF7TooltipPanel EXTENDED (not replaced) — DRY reuse</item>
        <item>role="tooltip" + aria-describedby present AND bar aria-label preserved (a11y not regressed)</item>
        <item>exact spawn/complete timestamps + display-local feedback-loop count + audit outcome all rendered</item>
        <item>tsc clean x3 + client build passing; no new dependency; timeline-tooltip testid preserved</item>
        <item>no edits to globals.css / session-stats.ts</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p10-deferred-smalls-004</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p10-deferred-smalls-004-BE-*.md</expected_file>
      <blocks>NONE (but GATE-TEST close-blocking: vitest must run green)</blocks>
      <receipt_check>
        <item>matchesSlug anchored (=== slug || startsWith(slug + '-')); .includes removed</item>
        <item>stale line-209 assertion flipped to false + description updated</item>
        <item>new guard assertions incl. p2-vs-p20 case</item>
        <item>npm test -w @gander-studio/server GREEN (actual run, not just file presence)</item>
        <item>git diff --name-only == exactly session-slug-match.ts + session-list.test.ts</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p10-deferred-smalls-006</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p10-deferred-smalls-006-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>--redb: #e05555 in globals.css; #cf3c3c count == 0; annotation shows ~5.22:1 AA (no "below AA")</item>
        <item>contrast_pairs proves #e05555 on #070d0c ≥ 4.5:1 (≈5.22:1) with method</item>
        <item>DESIGN.md: #cf3c3c==0, 4.07:1==0, Decision Record D present</item>
        <item>destructive-background regression guard executed + recorded (or confirmed text-only)</item>
        <item>--red/--mr/--materia-red + --destructive mapping untouched; tsc clean x3 + client build passing</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
