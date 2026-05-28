<revision_request task_id="prog-studio-sessions-2026-05-s2-list-edit" round="1">

The Critic returned **CRITIQUE_BLOCK** on your plan. Revise and re-emit a complete
`<task_decomposition>`. Address EVERY item below. Read your prior plan and the full critique
first, then revise.

<read_these note="≤6 reads — most context is in your prior plan + the critique">
1. .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-1779304665.md  (your prior plan)
2. .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-CR-1779304665.md  (the full critique — read every challenge + required_revision)
3. packages/client/src/components/ModeContent.tsx  (the REAL dispatch mechanism — see BLOCKER 1)
4. packages/client/src/globals.css  (real token names for the nav dot — see WARNING 1)
(The ORC brief, S1 contract, invariants, and SC list you already have from round 1 — do not re-read.)
</read_these>

<blocker id="1" type="ASSUMPTION">
ModeContent does NOT use switch/case. It uses a zero-prop component-map:
`PAGE_MAP[activeMode]` rendering `<ActivePage />` with NO props. Your t3 "add case 'sessions'"
and t4 "render <SessionDetailPage id={selectedSessionId}/>" are incompatible with this.

**REQUIRED RESOLUTION — adopt Critic Option B (cleanest, smallest blast radius):**
- Introduce a new store-driven wrapper component `SessionsRouter.tsx` (zero-prop) that reads
  `selectedSessionId` from `useSessionStore` and renders `<SessionListPage/>` when null, else
  `<SessionDetailPage/>` (the detail page reads its `id` from the store, NOT via prop).
- ModeContent's PAGE_MAP gets ONE new entry: `sessions: SessionsRouter` (keeps PAGE_MAP's
  zero-prop shape intact — no conditional escape hatch in ModeContent).
- SessionDetailPage takes NO `id` prop; it reads `selectedSessionId` from the store.
- State the PAGE_MAP-renders-zero-prop-components constraint in the affected packets so the FE
  agent knows it up front. Assign SessionsRouter ownership to the scaffold packet (t3).
</blocker>

<blocker id="2" type="OVERSCOPED">
The mandatory FE file-count rule (BLOCKER, no exception): no single FE task may touch 4+ distinct
SOURCE files. t4 (5 files), t5 (4), t6 (4) all violate it. The "small per file / cohesive unit"
justification is exactly what the rule rejects.

**REQUIRED RESOLUTION — split per the Critic's seams. The ≤6-packet guideline is SUPERSEDED;
the Orchestrator authorizes >6 packets to satisfy this rule. Do NOT pack to stay under 6.**
Apply this lens, stated explicitly in the revised plan for the auditor: **count SOURCE files only;
each FE packet ≤ 3 source files; the shared e2e spec slice is a co-located test deliverable of the
packet that owns the feature under test (not a 4th cognitive context).** With that lens:
- t4 → **t4a** (session-store.ts + useSessions.ts — state/data layer) and **t4b**
  (SessionListPage.tsx + SessionsRouter wiring + ModeContent PAGE_MAP entry + list e2e slice).
  t4b depends on t4a. (Note SessionsRouter may instead live in t3 as a stub — your call, but keep
  each packet ≤3 source files and name the owner.)
- t5 → **t5a** (SessionDetailPage.tsx shell + tab bar + tab-switch/Analyze e2e slice) and **t5b**
  (OverviewTab.tsx + TableTab.tsx). t5b depends on t5a.
- t6 → **t6a** (useSessionSave.ts + useSessionRaw.ts) and **t6b** (EditorTab.tsx + editor/save/
  revert/smoke e2e slice). t6b depends on t6a.
- Re-check t3 against the ≤3-source-file lens. With stubs + SessionsRouter it may exceed 3 source
  files; if so, split the stub/router creation from the constants/nav edits, or move the stubs into
  the packets that replace them. Keep every packet ≤3 source files.
Resulting waves grow to ~7-10 packets — that is expected and authorized.
</blocker>

<warning id="1">--ms token is INVENTED. Real Mako tokens: --mt --mg --my --mb --mp --mr --mo.
Set the Sessions nav dot to a real token — use `var(--mp)` (magenta/purple, distinct from the four
existing dots) or `var(--mo)`. Remove every "use --ms if it exists" phrasing and --ms from the t1 list.</warning>

<warning id="2">t2 conflates session.get with collectSessions. They are different paths. **Resolution:
mirror session.get's inline readdir scan verbatim** (return on first id-OR-sprint match, throw NOT_FOUND
otherwise), then read that match's filePath. Do NOT tell BE to "reuse collectSessions, same as session.get."
State that getRaw must use the SAME id-OR-sprint matching as session.get so the client `id` works identically.</warning>

<warning id="3" decision="HUMAN-RESOLVED">SC5 Table tab = **AGENT-ACTIVITY table** (human decision).
Columns: Agent ID, Spawns, Completes, Feedback Loops, Critique Passes, Critique Blocks, Audit Passes,
Audit Fails, Wall Clock (ms). Sortable by any column; default Agent ID asc. Record in the t5b packet
(and flag for REQVAL) that SC5's verbatim "sort by seq/ts/agent/event" is a brief-level wording artifact
from an event-log framing; the authoritative deliverable is the agent-activity table. The auditor must NOT
FAIL t5b for absent seq/ts/event columns. (Event-log table is explicitly NOT built this sprint.)</warning>

<warning id="4">No-remount check (SC3): do NOT assert via Playwright network-request counting (brittle
under react-query/batch link). Assert a DOM/state-identity signal instead — e.g. a stable
`data-testid="sessions-detail-page"` element identity persists across Overview→Table→Overview clicks,
or in-panel state is preserved. Put this in the t5a e2e slice.</warning>

<warning id="5">e2e spec naming: rename to the established convention
`packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` (the `-fe.spec.ts`
suffix). Update every packet that references the spec path. (t4b creates it; t5a + t6b extend it.)</warning>

<also_carry_forward>
Keep everything the Critic confirmed CORRECT: kebab-case session-store.ts; no new shadcn primitives
(tabs/tooltip/toast built from role=tablist/tab/tabpanel + title attr + inline confirmation; Textarea
primitive DOES exist and is used); Session types via z.infer from @gander-studio/shared (no client
redefinition); token-only colors; t2 reads filePath (original source) not editedFilePath (revert
semantics confirmed correct); BE returns completion_packet, no git commit; "Coming in S3" string and
tab labels live ONLY in constants/sessions.ts (DRY). Re-affirm the pm_preflight_acknowledgement block
for all 6 patterns and the risk_flags (carry the critical_seam_finding resolution forward).
</also_carry_forward>

## Output Path
Write your revised `<task_decomposition>` to:
.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-rev1-1779304665.md
</revision_request>
