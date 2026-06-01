<plan_critique>
  <plan_id>gander-studio-p5b-progression-viz</plan_id>
  <status>PASS</status>

  <challenges>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>p5b-002-be</task_ref>
      <description>
The BE packet contradicts itself on ENOENT (file-not-found) behavior. The description
(line 141) and SC6 mandate: "If ENOENT: throw TRPCError NOT_FOUND". But the test spec
SC7 case 5 says "File-not-found returns empty array OR throws — whichever the
implementation does." An implementer can satisfy SC7 with a test that asserts an empty
array, which directly violates SC6's mandated throw. The auditor then sees a green test
that contradicts the required behavior. This is the connectivityRouter precedent: it
throws NOT_FOUND on ENOENT (router.ts:609). The packet should pin one behavior.
      </description>
      <required_revision>
Rewrite SC7 case 5 to remove the "or throws" optionality: "File-not-found: getLedger
throws a TRPCError with code NOT_FOUND (matching connectivityRouter:609) — the test
asserts the thrown code, not an empty array." Align the test expectation with SC6.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>SPRINT</task_ref>
      <description>
The plan states the live ledger "currently has 5 entries" (UI packet line 51; BE packet
line 127; routing_notes line 343). On-disk verification of
/home/jhber/projects/gander/docs/progression-ledger.md shows SIX entries — a Phase 5
block "agent-improvement-2026-06-01-capability-preflight" was appended 2026-06-01 (today),
after the PM's read. This is the exact "verified type but not current value" class the PM
declared it was guarding against (prog-studio-sessions §6 G1; p7 §2). It is NON-BREAKING
here: the two sprint_ids the FE e2e asserts on (gander-meta-progression-design,
gander-progression-p1-analyzer) are both still present and unaffected. But the BE happy-path
test that hardcodes an expected entry count must use 6 (or assert >=N, not ==5), and any UI
copy referencing "5 entries" is stale.
      </description>
      <required_revision>
Update the entry-count reference from 5 to 6 in the UI and BE packets, OR — better —
instruct both agents to assert ">=1" / ">=N" rather than an exact count, since the ledger
is append-only and grows every sprint (a hardcoded ==count test is a guaranteed future
false-FAIL). No re-plan required; a one-line note suffices.
      </required_revision>
    </challenge>

    <challenge>
      <type>OVERSCOPED</type>
      <severity>WARNING</severity>
      <task_ref>p5b-003-fe</task_ref>
      <description>
p5b-003-fe touches 6 files: 2 created (ProgressionPage.tsx, constants/progression.ts),
3 modified (ui-store.ts, ModeContent.tsx, navigation.ts), 1 e2e spec authored. This trips
the surface count in the mandatory-split rule. However, the 3 modifies are verified
one-line edits each (ui-store.ts:3 add a union member; ModeContent.tsx:17-style add one
PAGE_MAP line + one import; navigation.ts add one NAV_ITEMS object), and this is the exact
structural twin of p7's GraphPage FE task, which shipped clean in a single agent turn
(commit ccad6df; p7 §7). The 4-file BLOCKER rule targets NEW components spread across
distinct cognitive contexts; here the cognitive load is one new page + a mechanical
nav-registration triad with a documented precedent. NOT split-blocked, but flagged so PM
can confirm the ~120-line estimate holds. If the ProgressionPage render logic plus the
per-surface rollup aggregation pushes the page component itself past ~50 new lines, the
page should split from its constants in a follow seam.
      </description>
      <required_revision>
No mandatory split. PM should confirm the ProgressionPage component body stays within the
50-line new-code commit limit on its own; if the per-surface rollup + sprint list + states
exceed it, pre-declare a split seam (aggregation/rollup helper in progression.ts vs. the
page JSX). Surface this estimate to ORC for the commit-packet gate.
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
1. The 8-value Surface enum verbatim copy is the single most likely SA-audit landmine
   (PM risk_flags agrees). The auditor must diff the studio-repo SurfaceSchema against
   contract §4 char-for-char — note "CLAUDE.md" contains a dot and is easy to mistype as a
   key, and the order must match. The contract §4 enum is the authority.
2. BE error-mode: the §3 parsing algorithm SKIPS malformed JSONL entries (console.warn),
   but the connectivityRouter precedent the BE packet tells the agent to mirror THROWS
   INTERNAL_SERVER_ERROR on validation failure (router.ts:622). These are deliberately
   different (per-entry skip vs. whole-file reject). The agent could over-copy the
   connectivity throw-on-invalid pattern and break the §3 skip contract. Auditor should
   verify a single malformed line does NOT abort the whole getLedger response.
3. FE e2e: per p7 §4/§6 GAP-2, the spec is authored-not-run and the live Playwright pass is
   the auditor's job. The role="tab" selector (SC6) is correct and matches the live
   BottomTabBar (role="tab", BottomTabBar.tsx:30) — the dead-code Sidebar.tsx that caused
   p7's false match is confirmed removed (commit 09c632d). Low risk this round.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
Read docs/post-mortems/gander-studio-p7-graph-viz.md in full. GAP-1 (grep-c on bare
TS-interface field token): all 7 grep SCs in p5b-003-fe verified against the real files —
every one targets a value-pattern (quoted string literal, `progression: Progression`
key-value assignment, `progression.getLedger` call expression, hex regex, role selector,
sprint_id literal). None match a bare `fieldname:` interface declaration line. GAP-1
genuinely avoided. GAP-2 (dead-code Sidebar.tsx selector absorption): Sidebar.tsx confirmed
removed (09c632d); FE e2e correctly uses role="tab" against the live BottomTabBar. GAP-3
(read-only/implementing agents self-writing docs/events/*.jsonl): no packet instructs any
agent to write the event log; clean. Also cross-checked the contract
(~/.claude/refs/progression-ledger-schema.md v1.0.0) — BE packet references §3/§4 by
pointer and instructs verbatim copy, does NOT restate the schema; contract-drift rule
honored. Verified all 4 AppMode call-graph sites against the live source: ui-store.ts:3,
ModeContent.tsx:11-18, navigation.ts:9-16, BottomTabBar.tsx:25 (reads NAV_ITEMS
dynamically, no direct edit needed) — PM's call-graph is accurate.
  </post_mortem_patterns_checked>
</plan_critique>
