<task_decomposition task_id="gander-studio-p10-deferred-smalls" agent_count="3" revision="rev1 — addresses CR#1 CRITIQUE_BLOCK (CR-1783019352): 1 BLOCKER (006 SC#4 self-defeating) + 4 WARNINGS (003 SC#4 non-discriminating grep, 003 stale-closure constraint, 003 runtime a11y SC, 006 SC#2 case-sensitivity). SC-level amendments only; no re-partition.">

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

2. FEEDBACK-LOOP COUNT (display-local). Extend `TooltipState` with a numeric field named `feedbackLoops`. Render it in the panel body (e.g. `loops: {tooltip.feedbackLoops}`). Add a code comment stating this is a DISPLAY-LOCAL derivation for the tooltip only and is NOT the authoritative SEAM-04 / session-stats feedback-loop counter (do not import from or modify session-stats.ts).

3. AUDIT OUTCOME (attribution from available marker data). Extend `TooltipState` with an audit-outcome field named `auditOutcome` of type `'pass' | 'fail' | 'mixed' | 'none'`. Render it (e.g. `audit: {tooltip.auditOutcome}`). NOTE: auditor IDENTITY (which auditor performed the audit) is NOT surfaced on `AgentMarker` (fields: agentId, ev, ts, seq, edgeLabel only) — do NOT add data-plumbing to surface it; outcome-from-available-markers is the deliverable. (Auditor-identity display is out-of-scope this sprint — see risk_flags.)

4. **HARD CONSTRAINT — stale-closure avoidance (CR#1 W2).** Compute `feedbackLoops` and `auditOutcome` AT THE BAR-GROUP RENDER CALL SITE from that row's `agentMarkers` (the `const agentMarkers = markersByAgent.get(bar.agentId) ?? []` at line ~986, already in scope where `onMouseEnter`/`onFocus` fire, lines ~1030-1031). Derive: `feedbackLoops = agentMarkers.filter(m => m.ev === 'AUDIT_FAIL' || m.ev === 'CRITIQUE_BLOCK').length`; `auditOutcome` from presence of `AUDIT_PASS` / `AUDIT_FAIL` markers ('pass' if PASS and no FAIL; 'fail' if FAIL and no PASS; 'mixed' if both; 'none' if neither). Extend the `showTooltip` signature to ACCEPT these two computed values as new arguments. You MUST NOT reference `markersByAgent` (or recompute markers) INSIDE the existing `showTooltip` `useCallback(..., [])` at lines ~645-650 — that empty-dependency callback is defined before `markersByAgent` is built (line ~776, rebuilt every render) and would capture a stale first-render map. Pass the already-computed values in; keep `showTooltip` a pure setter.

5. ACCESSIBLE TOOLTIP WIRING (role="tooltip"). Change the `FF7TooltipPanel` ROOT element from `aria-hidden="true"` to `role="tooltip"` with a stable `id` (e.g. `id="timeline-tooltip"`). On the bar `<g>` that triggers the panel (`g[role="img"]` at lines ~1024-1034), add `aria-describedby="timeline-tooltip"` ONLY while that bar is the active bar (i.e. `tooltipState?.bar.agentId === bar.agentId`); absent on blur/mouseleave. PRESERVE the existing `aria-label={barAriaLabel}` on that `<g>` (accessible NAME stays on aria-label; the tooltip is the accessible DESCRIPTION). Inner decorative spans in the panel (MateriaDot etc.) may keep their own `aria-hidden="true"`.

Use existing FF7 CSS tokens already in the panel (`var(--sfh)`, `var(--bdb)`, `var(--wm)`, `var(--mt)`, `var(--mg)`, `var(--my)`, etc.). No raw hex. No new npm dependency.
      </description>
      <success_criteria>
1. `tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json` — all clean.
2. `npm run build -w @gander-studio/client` passes (tsc && vite build).
3. Exact timestamps rendered: `grep -n "new Date(bar.spawnTs)" AgentTimeline.tsx` AND `grep -n "new Date(bar.completeTs" AgentTimeline.tsx` both present inside FF7TooltipPanel; orphan path renders "in progress".
4. **(AMENDED per CR#1 W1 — discriminating check, not the pre-existing token grep.)** The `TooltipState` interface declares a numeric field `feedbackLoops` AND an `auditOutcome` field (`grep -n 'feedbackLoops' AgentTimeline.tsx` shows it in the `TooltipState` interface, the derivation call site, and the panel render — >=3 hits across those roles). A `// display-local … not SEAM-04` comment is present near the derivation. **AUDITOR DUTY (runtime, QA):** verify the panel body actually RENDERS a feedback-loop row and an audit-outcome row when a bar tooltip is shown — do NOT accept the bare presence of the strings `'AUDIT_FAIL'`/`'CRITIQUE_BLOCK'` as proof (those tokens pre-exist in evColor/evLabel/MarkerShape switches and doc comments).
5. Audit outcome derived from `AUDIT_PASS`/`AUDIT_FAIL` markers per the four-state mapping; `auditOutcome` typed `'pass'|'fail'|'mixed'|'none'`; panel renders an `audit:` line.
6. **Stale-closure constraint (CR#1 W2):** `feedbackLoops`/`auditOutcome` are computed at the bar-group call site from `agentMarkers` and passed into an EXTENDED `showTooltip` signature. `grep -n 'markersByAgent' AgentTimeline.tsx` shows NO occurrence inside the `showTooltip` `useCallback` body (lines ~645-650); the callback remains a pure setter. Auditor confirms the derivation reads `agentMarkers` (row-local), not a closed-over `markersByAgent`.
7. a11y static wiring: `grep -c 'role="tooltip"' AgentTimeline.tsx` == 1 (panel root); `grep -c 'aria-describedby' AgentTimeline.tsx` >= 1 (active bar g); the bar `<g>` still carries `aria-label={barAriaLabel}` (grep confirms preserved); `aria-hidden="true"` no longer on the FF7TooltipPanel ROOT div (inner decorative spans may retain it).
8. **(NEW per CR#1 W3 — runtime a11y assertion.)** RECOMMENDED and named as an explicit a11y-auditor duty: a Tier-2/a11y check (Playwright acceptable, may extend the existing timeline e2e spec) asserting that on bar focus the active `<g>` gains `aria-describedby="timeline-tooltip"` AND still exposes its original accessible name (aria-label unchanged); on blur, `aria-describedby` is absent. Grep cannot prove the active-only toggle, the name preservation, or absence of double-announce — the a11y auditor MUST verify these at runtime. (Not a mandatory-Playwright BLOCKER: the tooltip interaction pre-exists per SC#12; but the attribute toggle is new and must be runtime-verified.)
9. `packages/client/package.json` `dependencies` block unchanged (no new dependency).
10. `data-testid="timeline-tooltip"` still present on the panel (existing e2e selector preserved — no regression).
11. No raw hex introduced (all colors via `var(--*)` tokens).
12. Existing timeline tooltip interaction (`data-testid` e2e selectors) preserved — no regression to existing specs.
      </success_criteria>
      <context_files>
packages/client/src/components/sessions/AgentTimeline.tsx  (SOLE edit target — FF7TooltipPanel ~496-603; TooltipState ~107-113; showTooltip/hideTooltip useCallback ~645-654; markersByAgent build ~776-781; bar-group render + agentMarkers ~986, ~1020-1067)
DESIGN.md  (design source of truth — Constitution + Color Tokens; read-only reference for token names)
</context_files>
      <dependencies>NONE (parallel with 004 and 006; disjoint files)</dependencies>
      <estimated_new_lines>60</estimated_new_lines>
      <out_of_scope>
- Do NOT edit globals.css (that is DEFERRED-006 / packet 006) — no token value or comment changes here.
- Do NOT add auditor-IDENTITY plumbing (surfacing which auditor audited) — data not on AgentMarker; deferred.
- Do NOT import from, call, or modify session-stats.ts / SEAM-04 feedback-loop counting — feedback count here is display-local only.
- Do NOT reference `markersByAgent` inside the empty-dep `showTooltip` useCallback (stale-closure trap — compute at the call site).
- Do NOT change the SEAM-06 marker encoding table, evColor/evLabel/MarkerShape, or the zoom/axis/scroll logic.
- Do NOT delete, commit, or modify the untracked pre-existing scratch e2e specs (packages/client/tests/e2e/debug-*.spec.ts, zz-*.spec.ts).
- Do NOT add a new npm dependency.
      </out_of_scope>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>Confirmation the existing FF7TooltipPanel was extended (not replaced) — DRY reuse</item>
          <item>The four added elements: exact spawn/complete timestamps, display-local feedbackLoops, auditOutcome, role="tooltip"+aria-describedby (aria-label preserved)</item>
          <item>Explicit statement that feedbackLoops/auditOutcome are computed at the bar-group call site (agentMarkers) and passed into showTooltip — NOT inside the empty-dep useCallback</item>
          <item>tsc clean + client build passing confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex color values (all colors via var(--*) tokens)</item>
          <item>Any new npm dependency</item>
          <item>markersByAgent referenced inside the showTooltip useCallback body</item>
          <item>Edits to globals.css, session-stats.ts, or the SEAM-06 marker encoding</item>
        </must_not_contain>
        <success_signal>tsc --noEmit clean x3, client build passing, SCs 3-7 satisfied in AgentTimeline.tsx, and QA/a11y auditor runtime confirmation of the rendered rows + aria-describedby active-only toggle with aria-label preserved</success_signal>
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
Tighten the slug matcher to anchored matching and prove it with unit tests. IMPORTANT — the over-match logic is NOT inline in event-log-parser.ts (the ORC ground-fact "lines 65-66" is stale). It lives in `packages/server/src/session-slug-match.ts` (canonical path — NO `parsers/` segment; it is one level ABOVE parsers/, imported by parsers/event-log-parser.ts as `../session-slug-match.js`), function `matchesSlug` (line 15):

  export function matchesSlug(taskId: string, slug: string): boolean {
    return taskId.startsWith(slug) || taskId.includes(slug);
  }

The `.includes(slug)` (and unbounded `.startsWith`) let a short/generic slug substring-match an unrelated sprint (e.g. slug `gander-studio-p2` over-matches task_id `gander-studio-p20-bar`; slug `gander` over-matches `some-task-with-gander-in-it`).

CHANGE 1 — anchor the predicate:

  export function matchesSlug(taskId: string, slug: string): boolean {
    return taskId === slug || taskId.startsWith(slug + '-');
  }

This aligns `matchesSlug` with the boundary-prefix semantics already used by `isDocumented` (Path 1, line 124). The ONLY production caller is `parseEventLogFiles` (packages/server/src/parsers/event-log-parser.ts line 85) — do not edit that file; it consumes `matchesSlug` unchanged. Verified callers (grep): event-log-parser.ts (production) + session-list.test.ts (test). No other production consumer.

CHANGE 2 — fix the EXISTING stale assertion (same-file fix propagation). `packages/server/src/parsers/__tests__/session-list.test.ts` has a `describe('matchesSlug — unit', ...)` block (lines ~204-213). Line ~209 currently asserts the substring OVER-match as desired behaviour:
    expect(matchesSlug('some-task-with-gander-in-it', 'gander')).toBe(true);
Flip it to `.toBe(false)` (the guard now rejects it) and update that test's `it(...)` description to describe over-match REJECTION rather than substring acceptance. Verify the other existing assertions still hold under anchoring:
  - line ~206 `matchesSlug('gander-studio-p2-foo-FE-001','gander-studio-p2-foo')` → still true (startsWith slug+'-').
  - line ~212 `matchesSlug('system','gander-studio-p2-foo')` → still false.

CHANGE 3 — extend the SAME `matchesSlug — unit` describe block (DRY — do NOT create a new test file) with guard assertions proving the fix, at minimum:
  - exact match: `matchesSlug('gander-studio-p10','gander-studio-p10')` → true
  - boundary-prefix: `matchesSlug('gander-studio-p10-deferred-smalls-004','gander-studio-p10')` → true
  - phase over-match guard: `matchesSlug('gander-studio-p20-bar','gander-studio-p2')` → false (the p2-vs-p20 case)
  - generic-substring guard: `matchesSlug('some-task-with-gander-in-it','gander')` → false (this is the flipped Change-2 assertion; ensure it is asserted false)
      </description>
      <success_criteria>
1. `matchesSlug` in `packages/server/src/session-slug-match.ts` now reads `taskId === slug || taskId.startsWith(slug + '-')`; `grep -c '.includes(slug)' packages/server/src/session-slug-match.ts` == 0 (old substring branch removed).
2. `npm test -w @gander-studio/server` (vitest run src/parsers/__tests__) passes GREEN — all assertions incl. the flipped line-209 assertion and the new guard assertions.
3. New guard assertions present in the `matchesSlug — unit` describe block covering: exact match (true), boundary-prefix slug+'-' (true), p2-vs-p20 phase over-match (false), generic-substring over-match (false).
4. The stale assertion `matchesSlug('some-task-with-gander-in-it','gander')` now asserts `.toBe(false)` with an updated `it(...)` description.
5. `tsc --noEmit` clean across all three packages.
6. Only `packages/server/src/session-slug-match.ts` and `packages/server/src/parsers/__tests__/session-list.test.ts` are modified — `git diff --name-only` shows exactly those two files. event-log-parser.ts, router.ts, and other callers byte-identical to HEAD.
      </success_criteria>
      <context_files>
packages/server/src/session-slug-match.ts  (matchesSlug at line 14-16 — edit target; leave sprintRoot/isDocumented untouched. CANONICAL PATH — no parsers/ segment.)
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
Remediate the below-AA `--redb` token. It is the ledger-ratified contrast fix (deferred-work.md line 22: "Lighten --redb to approximately #e05555") — the target value and the WCAG math below are a PRE-RATIFIED spec. You are IMPLEMENTING a ratified spec + mechanical doc-sync, not authoring a new design decision.

CURRENT STATE (verified on disk):
- globals.css line 21: `--redb: #cf3c3c;` — 4.07:1 on `--void` (#070d0c) — below AA 4.5:1 for normal text.
- globals.css line 357: `--destructive: var(--redb); /* #cf3c3c — 4.07:1 on --void (BELOW AA for normal text; see DEFERRED-006) */`
- `--redb` is also consumed as a GRAPHICAL marker color in AgentTimeline.tsx (SEAM-06 AUDIT_FAIL/FAIL + legend). Graphical objects need ≥3:1 only — the new value clears that. The `--destructive → var(--redb)` MAPPING is unchanged; only the source value + annotations move.
- Destructive UI surface (confirmed by CR#1): the destructive button variant uses `text-destructive` on `bg-destructive/10` (red TEXT on a 10%-alpha tint) — NO white-on-solid-red pairing. Lightening --redb RAISES that text contrast — no regression (SC #5 guard resolves to "text/graphical only").

CHANGE 1 — globals.css value: set `--redb: #e05555;` (line 21). Update the line-357 annotation comment to the TRUE post-fix ratio and AA-pass status, e.g. `/* #e05555 — 5.22:1 on --void (AA for normal text; DEFERRED-006 resolved) */`.

WCAG VERIFICATION (embed in your packet; this is the mechanical SC):
Method = WCAG 2.x relative luminance. Per channel c∈{R,G,B}: cs=c/255; cl = cs/12.92 if cs≤0.03928 else ((cs+0.055)/1.055)^2.4. L = 0.2126·Rl + 0.7152·Gl + 0.0722·Bl. Contrast = (Llight+0.05)/(Ldark+0.05).
- `--void` #070d0c → L ≈ 0.003601.
- OLD `--redb` #cf3c3c → L ≈ 0.168181 → contrast = (0.168181+0.05)/(0.003601+0.05) = 4.070:1 (confirms recorded 4.07 — method valid).
- NEW `--redb` #e05555 (R=224,G=85,B=85) → Rl≈0.74540, Gl=Bl≈0.090846 → L ≈ 0.230004 → contrast = 0.280004/0.053601 = **5.22:1** (PASS AA ≥4.5:1). Re-derive and confirm in your packet's contrast_pairs.

CHANGE 2 — DESIGN.md doc-sync + historical Decision Record (three LIVE sites; grep shows `#cf3c3c` at lines 33/183/325, `4.07:1` at 183/325):
- line 33 (Color Tokens table `--color-error`): `#cf3c3c` → `#e05555`.
- line 183 (Decision Record A `--destructive` row Contrast Note): update hex + "4.07:1 … below AA" → "5.22:1 … AA (DEFERRED-006 resolved)".
- line 325 (Decision Record B Contrast Pair Summary, Destructive row): `#cf3c3c … 4.07:1 … below AA` → `#e05555 … 5.22:1 … AA`.
- Append `## Decision Record D — DEFERRED-006 --redb Contrast Remediation (p10, 2026-07-02)`. **A Decision Record is a changelog — it SHOULD preserve the superseded value verbatim.** DR-D records: old value `#cf3c3c` at 4.07:1 (below AA) → superseded by new `#e05555` at 5.22:1 on --void (AA); the method above; and that #e05555 is the ledger-ratified lighten-in-place target. Include a contrast_pairs entry. The old literals `#cf3c3c`/`4.07:1` appearing INSIDE DR-D is EXPECTED and permitted (see SC #4 historical-record exception) — they must NOT remain at the three live sites above.

CHANGE 3 — regression guard on other --redb usage. CR#1 pre-verified the only destructive surface is `text-destructive` on `bg-destructive/10` (text/graphical, no white-on-solid-red). Confirm this in your packet (grep the destructive button variant) and record it in contrast_pairs as "text/graphical only — lightening raises contrast, no regression." If you discover any pairing that uses `--redb`/`--destructive` as a solid BACKGROUND with light foreground text that drops below AA, STOP and flag to ORC — do NOT trade one AA failure for another.
      </description>
      <success_criteria>
1. globals.css: `grep -c '#e05555' globals.css` >= 1 AND `--redb: #e05555;` present; `grep -c '#cf3c3c' globals.css` == 0 (globals.css has no history-record exception — old value must be fully gone).
2. **(AMENDED per CR#1 W4 — anchor on new text, not the case-sensitive below-AA count.)** The line-357 annotation states the new ratio and resolved status: `grep -n '5.22:1' globals.css` present on the --destructive line AND `grep -in 'resolved' globals.css` present on that line; secondary `grep -ci 'below aa' globals.css` == 0 (case-insensitive, catches the uppercase "BELOW AA" the original case-sensitive grep missed).
3. Contrast math for #e05555 on #070d0c re-derived in the packet == ≥4.5:1 (≈5.22:1); method + intermediate luminances shown.
4. **(AMENDED per CR#1 BLOCKER — live-site update + historical-record exception, NOT whole-file count-0.)** DESIGN.md three LIVE sites updated: the Color Tokens `--color-error` row (line ~33), the Decision Record A `--destructive` Contrast Note (line ~183), and the Decision Record B Contrast Pair Summary Destructive row (line ~325) each now show `#e05555` (and, where a ratio is stated, `5.22:1` / AA) — none of these three sites retains `#cf3c3c` or `4.07:1`. A `## Decision Record D — DEFERRED-006 …` heading exists and records the remediation. **HISTORICAL-RECORD EXCEPTION:** `#cf3c3c` and `4.07:1` MAY appear ONLY inside the Decision Record D block (a changelog legitimately preserves the superseded value verbatim). Mechanical check: `grep -n '#cf3c3c\|4\.07:1' DESIGN.md` returns ONLY line numbers within the DR-D block (or none); any occurrence OUTSIDE DR-D is a FAIL. Positive check: `#e05555` and `5.22:1` present at/near lines 33/183/325.
5. Regression guard executed and recorded in contrast_pairs: destructive surface confirmed `text-destructive` on `bg-destructive/10` (text/graphical only, no white-on-solid-red) → no regression; OR, if any solid-red-background+light-text pairing found below AA, STOP-and-flag (do not ship).
6. `tsc --noEmit` clean across all three packages (confirms no accidental .ts edit) AND `npm run build -w @gander-studio/client` passes (Tailwind/vite compiles globals.css).
7. Only `--redb`'s value + its annotations + the four DESIGN.md sites (three live + DR-D append) changed. `--red` (#a12d2d), `--mr` (#e74c3c), `--materia-red`, and the `--destructive: var(--redb)` mapping unchanged. No other token value modified.
      </success_criteria>
      <context_files>
packages/client/src/globals.css  (edit: line 21 --redb value; line 357 --destructive annotation. Leave --red/--mr and the var(--redb) mapping intact)
DESIGN.md  (edit: line 33 Color Tokens; line 183 Decision Record A; line 325 Decision Record B; append Decision Record D — old literals permitted ONLY inside DR-D)
packages/client/src/components/ui/button.tsx  (read-only — confirm destructive variant is text-destructive on bg-destructive/10 for the CHANGE-3 regression guard)
</context_files>
      <dependencies>NONE (parallel with 003 and 004; disjoint files — 003 edits AgentTimeline.tsx which only CONSUMES var(--redb), no file conflict)</dependencies>
      <estimated_new_lines>20</estimated_new_lines>
      <out_of_scope>
- Do NOT change `--red` (#a12d2d), `--mr` (#e74c3c), `--materia-red`, or any non-`--redb` token value.
- Do NOT change the `--destructive: var(--redb)` mapping — only the source `--redb` value + comments.
- Do NOT edit AgentTimeline.tsx (that is DEFERRED-003 / packet 003) — the marker color change propagates automatically via the token.
- Do NOT introduce a new token variant (--redb-text/--redb-bg) — ledger default is lighten-in-place.
- Do NOT delete, commit, or modify untracked scratch e2e specs.
      </out_of_scope>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>contrast_pairs entry proving #e05555 on #070d0c ≥ 4.5:1 (≈5.22:1) with method shown</item>
          <item>globals.css value + annotation update; DESIGN.md three-live-site doc-sync + Decision Record D (historical old literals permitted inside DR-D only)</item>
          <item>regression-guard result confirming text-destructive on bg-destructive/10 (text/graphical only, no regression)</item>
        </must_contain>
        <must_not_contain>
          <item>Any change to --red, --mr, --materia-red, or the --destructive→var(--redb) mapping</item>
          <item>A new --redb-* token variant</item>
          <item>Remaining #cf3c3c or 4.07:1 in globals.css, or at the three DESIGN.md live sites (outside DR-D)</item>
        </must_not_contain>
        <success_signal>tsc clean x3 + client build passing; SC 1,2,4 satisfied; contrast math confirmed ≥4.5:1; DR-D present with historical values contained; regression guard recorded</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    <!-- All three packets are file-disjoint and independent → fully parallel. -->
    gander-studio-p10-deferred-smalls-003 (FE)  ∥  gander-studio-p10-deferred-smalls-004 (BE)  ∥  gander-studio-p10-deferred-smalls-006 (FE)
    Each gated by its own audit (SA + QA + SX PASS).
    GATE-TEST (close-blocking, packet 004): `npm test -w @gander-studio/server` must run GREEN — a static audit cannot prove the new unit assertions pass; ORC/auditor confirms the actual vitest run, not just file presence.
    RUNTIME-A11Y (packet 003): the aria-describedby active-only toggle + aria-label preservation is a runtime a11y-auditor duty (SC#8), not a grep — grep cannot prove active-only toggling or absence of double-announce.
  </dependency_order>

  <routing_notes>
    <!-- ===== Revision provenance ===== -->
    - rev1 addresses CR#1 CRITIQUE_BLOCK (CR-1783019352). Changes are SC-level amendments only — no re-partition (all three packets, owners, and file assignments unchanged). CR#1 explicitly confirmed: both ground-fact corrections CORRECT on disk; #e05555 = 5.22:1 verified independently; ledger-pre-ratified so FE-owns-006 is NOT a remit violation (risk-flag "DEFERRED-006 owner" RESOLVED — no UI packet); regression guard satisfiable (destructive = text on 10%-tint); GATE-TEST 004 satisfiable; recurrence declaration present; sc-precheck clean.
    - BLOCKER FIX (006 SC#4): adopted CR option (a). SC#4 now asserts the THREE LIVE sites are updated to #e05555/5.22:1 + DR-D exists, and PERMITS the old `#cf3c3c`/`4.07:1` literals ONLY inside DR-D (historical record). The grep target is live-sites/DR-D-containment, not a whole-file count-0. CHANGE-2 now explicitly records the old value in DR-D (a changelog should preserve superseded values verbatim).
    - WARNING FIXES: (W1) 003 SC#4 replaced non-discriminating token greps with the new `feedbackLoops`/`auditOutcome` field check + explicit QA runtime render duty. (W2) 003 CHANGE-4 hard constraint added — compute at bar-group call site from agentMarkers, extend showTooltip signature, never reference markersByAgent inside the empty-dep useCallback; SC#6 enforces. (W3) 003 SC#8 added — runtime a11y assertion (Playwright acceptable) for active-only aria-describedby + aria-label preservation, named as a11y-auditor duty. (W4) 006 SC#2 re-anchored on the new `5.22:1`/`resolved` annotation text + case-insensitive `below aa` grep.
    - PATH CORRECTION (on record): packet 004 canonical path is `packages/server/src/session-slug-match.ts` (NO `parsers/` segment; imported by parsers/event-log-parser.ts as `../session-slug-match.js`). All 004 references use this path.

    <!-- ===== PM Preflight acknowledgements (4) — unchanged, still hold ===== -->
    - OVERSCOPED (ack): 003 = 1 file, 004 = 2 files, 006 = 2 files. No 3+-file packet. CR#1 confirmed no mandatory split.
    - DRY (ack): 003 EXTENDS FF7TooltipPanel; 004 EXTENDS the existing matchesSlug + `matchesSlug — unit` describe block; 006 edits an existing token. Legacy FocusTooltipOverlay sketch NOT FOUND via glob (both dirs) — superseded by live FF7TooltipPanel.
    - aas-3-legacy-envelope (ack): current audit-pipeline envelope (SA/QA/SX) only.
    - subagentstop-complete-miss (ack): Output Paths use plain `{task_id}-{AGENT_CODE}-{unix_ts}.md`; re-spawns append to the TASK_ID segment (`-rem`/`-gap`), never between AGENT_CODE and timestamp.

    <!-- ===== Recurring-pattern preflight (Step 0.5) — unchanged ===== -->
    <recurring_pattern source="gander-studio-p9 (via brief prior_sprint_gaps)">OVERSCOPED: ≤2 files/domain/packet.</recurring_pattern> — AVOIDED (max 2 files/packet).
    <recurring_pattern source="gander-studio-p9 (via brief prior_sprint_gaps)">DRY: search existing before new.</recurring_pattern> — AVOIDED (all three extend existing code).
    <recurring_pattern source="gander-studio-p9 (via brief prior_sprint_gaps)">subagentstop-complete-miss: Output Path naming.</recurring_pattern> — AVOIDED.
    <recurring_pattern source="gander-studio-p9 (via brief prior_sprint_gaps)">aas-3-legacy-envelope: current envelope only.</recurring_pattern> — AVOIDED.

    <!-- ===== Stale-ground-fact surfaces (confirmed correct by CR#1) ===== -->
    - DEFERRED-003: native `<title>` already replaced by FF7TooltipPanel in s4 — 003 is ENRICHMENT (CR#1 confirmed AgentTimeline.tsx 496-603).
    - DEFERRED-004: over-match predicate is matchesSlug in session-slug-match.ts:14-15 (not event-log-parser.ts); session-list.test.ts:209 asserts the over-match true and must flip to false (CR#1 confirmed).
    - Server test infra: vitest confirmed; extend existing suite (no Playwright/node-test fallback).

    <!-- ===== Relevant critics/auditors ===== -->
    - 003: QA (RUNTIME render of the feedbackLoops + auditOutcome rows — not the bare token grep) + SX/QA a11y (RUNTIME: aria-describedby active-only toggle, aria-label/name preserved, no double-announce) + SA (single-file scope, stale-closure constraint honored).
    - 004: QA (vitest GREEN incl. flipped + new assertions) + SA (exactly two files touched).
    - 006: SA/QA WCAG contrast (re-derive 5.22:1) + DESIGN.md live-site vs DR-D-containment check (the BLOCKER) + destructive-surface regression confirmation.
    - Budget note: original decomposition used 12 reads (over soft-8, justified by 2 stale ground facts). This revision used 1 read (the CR critique) — no new source reads needed; amendments are SC-level.

    <!-- ===== SC-locked-value lint (Step 7.5) re-run on amended SCs ===== -->
    - 006 SC#4 no longer self-defeating: the DR-D historical literals are explicitly exempted from the count check (live-site/containment target). 006 SC#2 no longer vacuous: anchored on new `5.22:1`/`resolved` text + case-insensitive below-aa. 003 SC#4 no longer non-discriminating: anchored on the NEW `feedbackLoops`/`auditOutcome` field names + runtime render duty, not pre-existing ev-string tokens. No amended SC forbids a character the locked value contains.
    - Tooling note (unchanged): PM toolset is Read/Write/Glob/Grep — no Bash; the mechanical sc-locked-value precheck could not be run here. CR#1 reports the sc-precheck was run separately and is clean (16 cmds, 0 unsat) with the DR-D contradiction caught by the mandated manual fallback (now fixed). ORC should re-run sc-precheck on this rev before dispatch.
  </routing_notes>

  <verbatim_deliverable_audit>
    <phrase text="Drain the three open, unblocked deferred-work items"><addressed task="gander-studio-p10-deferred-smalls-003, -004, -006"/></phrase>
    <phrase text="DEFERRED-003 (rich hover/focus tooltip on AgentTimeline bars)"><addressed task="gander-studio-p10-deferred-smalls-003"/></phrase>
    <phrase text="DEFERRED-004 (event-log slug matcher over-match guard + unit test)"><addressed task="gander-studio-p10-deferred-smalls-004"/></phrase>
    <phrase text="DEFERRED-006 (--redb token below WCAG AA for normal text — remediate)"><addressed task="gander-studio-p10-deferred-smalls-006"/></phrase>
    <phrase text="do we have things to do in various places? let's do them all"><addressed task="gander-studio-p10-deferred-smalls-003, -004, -006 (all three studio-alpha unblocked items)"/></phrase>
    <phrase text="these are the studio-alpha items"><addressed task="scope confined to gander-studio-alpha; DEFERRED-P9-1 and DEFERRED-001 excluded per brief"/></phrase>
    <phrase text="rich tooltip — exact spawn/complete timestamps"><addressed task="gander-studio-p10-deferred-smalls-003"/></phrase>
    <phrase text="rich tooltip — feedback-loop count"><addressed task="gander-studio-p10-deferred-smalls-003 (display-local feedbackLoops from row-local agentMarkers)"/></phrase>
    <phrase text="rich tooltip — audit attribution"><addressed task="gander-studio-p10-deferred-smalls-003 (auditOutcome from available markers)"/></phrase>
    <phrase text="rich tooltip — auditor IDENTITY (who audited)"><out_of_scope reason="auditor identity not on AgentMarker (agentId,ev,ts,seq,edgeLabel); data-plumbing exceeds a bounded small-sprint item — flagged for follow-up if the ledger requires named-auditor display"/></phrase>
    <phrase text="over-match guard — unit test"><addressed task="gander-studio-p10-deferred-smalls-004 (extends existing vitest matchesSlug block; GATE-TEST requires green run)"/></phrase>
  </verbatim_deliverable_audit>

  <risk_flags>
    - RESOLVED (CR#1): DEFERRED-006 owner (FE, ledger-pre-ratified — no remit violation, no UI packet); destructive-background regression (destructive is text on 10%-tint — lightening raises contrast); both ground-fact corrections correct; #e05555=5.22:1; GATE-TEST 004 satisfiable.
    - A11Y ARCHITECTURE CHANGE (003): FF7TooltipPanel `aria-hidden="true"` → `role="tooltip"` + toggled `aria-describedby` is a genuine accessible-tree change. Now backed by SC#8 RUNTIME a11y assertion (auditor duty) — confirm aria-describedby is active-only, aria-label/name preserved, no double-announce. Grep alone insufficient.
    - STALE-CLOSURE (003): mitigated by CHANGE-4 hard constraint + SC#6 — feedbackLoops/auditOutcome computed at the bar-group call site from agentMarkers and passed into showTooltip; markersByAgent must not appear inside the empty-dep useCallback. Auditor verifies.
    - FEEDBACK-LOOP SEMANTICS (003): tooltip's feedbackLoops is DISPLAY-LOCAL (in-component markers), intentionally decoupled from the authoritative SEAM-04/session-stats counter (existing comment AgentTimeline.tsx:45-46). A divergence in edge cases is expected, not a defect — flagged so the auditor does not treat it as one.
    - DESIGN.md HISTORY vs SC (006): the fixed SC#4 now distinguishes live-site updates (old literals forbidden) from the DR-D historical record (old literals required). Auditor must apply the containment check (`#cf3c3c`/`4.07:1` only inside DR-D), not a whole-file count-0.
    - SC-PRECHECK (tooling): PM has no Bash; ORC should re-run the mechanical sc-precheck on this rev pre-dispatch (Critic gate requirement). Manual re-lint of amended SCs done above.
  </risk_flags>

</task_decomposition>

<expectation_manifest>
  <sprint_id>gander-studio-p10-deferred-smalls</sprint_id>
  <generated>2026-07-02T19:20:00Z</generated>
  <revision>rev1 — CR#1 amendments folded</revision>
  <assignments>
    <assignment>
      <task_id>gander-studio-p10-deferred-smalls-003</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p10-deferred-smalls-003-FE-*.md</expected_file>
      <blocks>NONE (RUNTIME-A11Y auditor duty per SC#8)</blocks>
      <receipt_check>
        <item>FF7TooltipPanel EXTENDED (not replaced) — DRY reuse</item>
        <item>TooltipState has feedbackLoops (numeric) + auditOutcome ('pass'|'fail'|'mixed'|'none'); both computed at bar-group call site from agentMarkers, passed into extended showTooltip; markersByAgent NOT referenced inside the empty-dep useCallback</item>
        <item>exact spawn/complete timestamps rendered; QA runtime-confirms the feedbackLoops + auditOutcome rows render (not bare token grep)</item>
        <item>role="tooltip" + aria-describedby active-only; aria-label/name preserved; a11y auditor runtime check done</item>
        <item>tsc clean x3 + client build passing; no new dependency; timeline-tooltip testid preserved; no edits to globals.css/session-stats.ts</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p10-deferred-smalls-004</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p10-deferred-smalls-004-BE-*.md</expected_file>
      <blocks>NONE (GATE-TEST close-blocking: vitest must run green)</blocks>
      <receipt_check>
        <item>matchesSlug anchored (=== slug || startsWith(slug + '-')); .includes removed; canonical path packages/server/src/session-slug-match.ts</item>
        <item>stale line-209 assertion flipped to false + description updated</item>
        <item>new guard assertions incl. p2-vs-p20 case</item>
        <item>npm test -w @gander-studio/server GREEN (actual run)</item>
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
        <item>--redb: #e05555 in globals.css; #cf3c3c count == 0 in globals.css; line-357 annotation shows 5.22:1 + resolved (not "below AA")</item>
        <item>contrast_pairs proves #e05555 on #070d0c ≥ 4.5:1 (≈5.22:1) with method</item>
        <item>DESIGN.md three live sites (33/183/325) → #e05555/5.22:1/AA; Decision Record D present; #cf3c3c/4.07:1 appear ONLY inside DR-D (containment check), not at live sites</item>
        <item>destructive-surface regression guard recorded (text-destructive on bg-destructive/10 — no regression)</item>
        <item>--red/--mr/--materia-red + --destructive mapping untouched; tsc clean x3 + client build passing</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
