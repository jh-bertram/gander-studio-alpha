<orchestrator_brief>
<task_id>prog-studio-sessions-2026-05-s2-list-edit</task_id>
<program_id>prog-studio-sessions-2026-05</program_id>
<sprint>S2 of 3 — Sessions List + Viewer + Markdown Editor (FE, additive)</sprint>

<preamble>
The `<agent_remits>` block below is auto-extracted verbatim from the live agent specs.
Treat it as authoritative — do NOT infer an agent's remit from prior sprints or training
defaults. The `<project_conventions>` and `<s1_published_contract>` blocks are pre-extracted
so you do NOT need to re-read schemas.ts / router.ts / the client tree. Read only the files
named in <reference_files> and STOP (see <pm_budget>).
</preamble>

<task>
Decompose S2 into ≤ 6 atomic task packets. Add a top-level "Sessions" mode to the studio
client: a list page, a detail page with tabs (Overview / Table / Editor + a reserved disabled
"Analyze" slot for S3), and a save-to-new-folder markdown editor. Purely additive — existing
Browse / Compose / Edit / Export pages must remain unchanged.

The full approved sprint brief is at:
docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s2-list-edit/orchestrator_brief.md
Its Goal, Outputs, Cross-Sprint Invariants, Success Criteria, Routing Hints, and Notes for the
PM are AUTHORITATIVE. The success criteria (SC1–SC10) and out-of-scope list are reproduced in
<sprint_success_criteria> below; map every packet to the SCs it satisfies.
</task>

<critical_seam_finding priority="BLOCKER-for-plan">
**The S1 session contract exposes NO raw markdown body.** `SessionSchema` (see
<s1_published_contract>) has fields {id, sprint, date, gap_classes, status, type, title,
filePath, editedFilePath, source_root, agents[], events[]} — there is NO `body`/`content`/`raw`
field. `session.get` returns this parsed object; `session.saveEdit({id, content})` only WRITES.
There is no read path for the original markdown text.

SC6 requires the Editor tab to "pre-fill with the original source markdown" and offer
"revert to original." A browser CANNOT read the filesystem, and program invariant + the
`s1-to-s2` seam rule forbid re-implementing backend parsing/IO in the client.

**Therefore S2 is NOT pure-FE.** You must include a small precursor backend-engineer (BE)
packet that extends the S1 contract to expose the raw markdown — recommended: add a
`session.getRaw({ id }) → { content: string }` tRPC procedure (read-only, same source-dir
scan + NOT_FOUND semantics as session.get), with input/output Zod schemas. The Editor tab's
data hook consumes that. Order it as Wave 0 (BE) → FE waves depend on it. Flag this in
<risk_flags> and cite it in the BE packet's rationale. Do NOT have FE read the FS or duplicate
the parser. If you believe an alternative resolution is better (e.g., defer pre-fill), state it
explicitly in <risk_flags> for the Critic + human to weigh — but SC6 as written needs the read path.
</critical_seam_finding>

<convention_reconciliations>
The convention scan (docs/project-conventions.md — read it; it's 1 read) surfaced deviations
between the S2 brief's proposed file list and the live codebase. Apply the LIVE convention:
1. **Stores are kebab-case.** Brief says `sessionStore.ts`; the convention is `session-store.ts`.
2. **Pages are FLAT PascalCase** under `pages/` (BrowsePage.tsx, …). The brief proposes a nested
   `pages/sessions/` + `tabs/` subtree. Nesting is acceptable for a multi-surface mode, but it is
   a structural deviation — make a deliberate call (recommend a `pages/sessions/` subdir since the
   mode has 1 list + 1 detail + 4 tab components; document it) and keep it consistent.
3. **Nav registration touches TWO files.** `constants/navigation.ts` (NAV_ITEMS) AND
   `store/ui-store.ts` (the `AppMode` union type). Adding mode 'sessions' requires editing AppMode.
   NavItemDef today is `{ mode, label, dotColor }` — it has NO tab/placeholder fields. The tabbed
   sub-structure (overview/table/editor + reserved analyze {placeholder:true}) is net-new; give it
   a home (recommend `constants/sessions.ts`). Invariant 3: ONE nav-mode declaration, S3 only flips
   the analyze placeholder — design the slot so S3 needs a single-field edit.
4. **No Shadcn tabs/tooltip/toast primitives exist** (only accordion/button/dialog/input/popover/
   select/textarea). Build tabs from buttons+conditional render, tooltip via title attr or popover,
   save confirmation inline — do NOT add heavy new dependencies. SC5's table is plain sortable HTML.
5. **list-vs-get envelope asymmetry.** `session.list` → `{ sessions, skipped }`; `session.get`/
   `getStats` → bare object. The data hooks must unwrap list's envelope but not get/getStats.
</convention_reconciliations>

<s1_published_contract source="packages/shared/src/schemas.ts + packages/server/src/router.ts, verbatim">
// SCHEMAS (packages/shared/src/schemas.ts) — import TYPES via z.infer; never redefine client-side.
EventLogEntrySchema = { seq:number, ts:string, ev:string, task_id:string, agent_id:string,
                        parent_id?:string, edge_label?:string, output_files?:string[] }
AgentActivitySchema = { agent_id:string, spawns:number, completes:number, feedback_loops:number,
                        critique_passes:number, critique_blocks:number, audit_passes:number,
                        audit_fails:number, wall_clock_ms?:number }
SessionSchema = { id:string, sprint:string, date:string, gap_classes:string[](default []),
                  status?:string, type?:string, title?:string, filePath:string,
                  editedFilePath?:string, source_root:string,
                  agents:AgentActivity[], events:EventLogEntry[] }   // NB: no raw body field
SessionStatsSchema = { session_id:string, total_spawns:number, total_completes:number,
                       total_feedback_loops:number, total_critique_passes:number,
                       total_critique_blocks:number, total_audit_passes:number,
                       total_audit_fails:number, agents:AgentActivity[], wall_clock_ms?:number,
                       event_count:number }
Exported types: Session, AgentActivity, EventLogEntry, SessionStats (all z.infer).

// tRPC PROCEDURES (packages/server/src/router.ts, sessionRouter)
session.list   input { limit:number(1..100, default 50) }  output { sessions:Session[], skipped:number }   QUERY
session.get    input { id:string }                          output Session (bare)                            QUERY  (id matches session.id OR session.sprint; throws NOT_FOUND)
session.getStats input { id:string }                        output SessionStats (bare)                       QUERY  (throws NOT_FOUND)
session.saveEdit input { id:string, content:string }        output { success:boolean, filePath:string }      MUTATION (throws FORBIDDEN on path traversal)
// Client tRPC: import { trpc } from '../trpc'  → trpc.session.list.useQuery({limit}), etc. createTRPCReact<AppRouter>.
// Env (S1, already wired): SESSIONS_EDITS_DIR (save target), SESSIONS_SOURCE_DIRS (scan roots, default [GANDER_ROOT]).
</s1_published_contract>

<cross_sprint_invariants source="program.md, verbatim">
1. Session Zod schema lives in packages/shared/src/schemas.ts; types via z.infer. Do NOT redefine schemas in the client.
2. Save-to-new-folder: every save goes through session.saveEdit. Never write to source ${GANDER_ROOT} from the client. UI shows the destination folder.
3. Nav registration owner: this sprint owns the Sessions mode declaration. S3 edits the same file to fill Analyze — coordinate via the placeholder:true flag.
4. Design tokens — every color/spacing/typography references globals.css custom properties. No new ad-hoc hex values.
5. TypeScript strict — all components fully typed; no `any` without justification.
</cross_sprint_invariants>

<sprint_success_criteria source="S2 brief, verbatim — map each packet to the SCs it satisfies">
SC1 Nav mode registered (Sessions appears alongside Browse/Compose/Edit/Export; routes to list; existing pages unchanged).
SC2 List loads (session.list; one row per session: sprint slug, date, status, gap_classes summary; empty + error states).
SC3 Detail loads (session.get; tab nav Overview/Table/Editor without remounting the data fetch).
SC4 Overview tab (frontmatter fields + top-line summary: agent count, feedback-loop count, status; Mako Teal tokens only).
SC5 Table tab (parsed agent activity as sortable HTML table: sort by seq/ts/agent/event; keyboard-navigable; WCAG AA).
SC6 Editor tab (Textarea bound to markdown body via session-store; "Save edit" → session.saveEdit; surfaces destination path; pre-fills original source; revert-to-original).  ← needs the raw-content read path (see critical_seam_finding)
SC7 Save flow (success shows toast/confirmation with absolute path under SESSIONS_EDITS_DIR; failure surfaces server error and does NOT lose the unsaved buffer).
SC8 Analyze slot reserved (disabled tab, tooltip "Coming in S3"; S3 only flips placeholder:false + supplies component).
SC9 Lint + type clean (npm run lint).
SC10 Manual smoke (Step 4.5): list loads, detail tabs work, save round-trips, no console errors; existing pages still load.

OUT OF SCOPE: analysis viz/timeline/charts/picker (S3); markdown preview rendering; diff view; proximity-edge regression (carry-forward).
</sprint_success_criteria>

<routing_hints source="S2 brief">
- UI Designer first (small spec: list + detail + tab layout; cite ~/.claude/refs/dashboard-patterns.md by name; do NOT excerpt token values inline — prompt-vs-contract drift rule).
- BE precursor packet (raw-content read path) BEFORE the FE editor packet (see critical_seam_finding).
- FE split into ~2 packets (list + detail-shell; then tabs + save flow).
- Audit pipeline after each implementing packet. Foreground dispatch. Step 4.5 human verification REQUIRED.
- Suggested ≤6 packets: (a) UI design spec, (b) BE raw-content procedure, (c) nav scaffold + routing, (d) list page + data hook, (e) detail shell + tabs, (f) editor + save flow + reserved Analyze slot + smoke. Combine where atomic; split where a packet exceeds ~2 independent files of logic per the OVERSCOPED check below.
</routing_hints>

<agent_remits source="auto-extracted from .claude/agents/*.md at 2026-05-20">
  <agent name="pm" version="1.6.1">
Core Responsibilities: decompose into smallest independent units (one owner, unambiguous verification, failure doesn't block many tasks). Context guarding: each agent gets only what it needs. Static content embedding rule: any static content the implementer cannot derive from the codebase must be embedded verbatim in the packet or written to a context file listed in <context_files>; do NOT inline large tables in the dispatch prompt. Gate enforcement: no task complete until auditor PASS. The PM does NOT write code, design components, or route packets (ORC routes). The PM does NOT escalate to the human directly (via ORC). Deliverable: a complete <task_decomposition>.
  </agent>
  <agent name="ui-designer" version="2.3.0">
Constraints: token-first (never raw hex / off-scale px / off-scale font; flag + propose a token if missing). Use Shadcn primitives by default; name them explicitly; custom only when no primitive exists (NOTE: no tabs/tooltip/toast primitive exists here). Describe don't prescribe (size/variant, not className). ALL states must be specified (happy + empty + error). Verify WCAG AA contrast for every fg/bg token pair; record in <contrast_pairs>. For dashboard sprints include ~/.claude/refs/dashboard-patterns.md; verify pattern-citation names against the live catalog.
  </agent>
  <agent name="frontend" version="1.6.0">
Task Boundary Compliance: implement ONLY what your task_id authorizes; do not consolidate Critic-split tasks; if consolidation seems warranted emit BLOCKED to ORC, don't decide unilaterally; confirm task_id matches before emitting ui_packet. Domain Boundaries: FE consumes data contracts, does not define them — need server data ⇒ ask PM to have BE produce a Zod schema first; if absent, build against a typed mock and mark integration MOCKED. When a <design_spec> exists, implement it faithfully; flag spec gaps rather than improvising.
  </agent>
</agent_remits>

<pm_preflight_checklist>
source_post_mortems:
  - gander-studio-alpha/docs/post-mortems/prog-studio-sessions-2026-05-s1-backend.md (same program, S1)
  - gander/docs/post-mortems/gander-p7-obsidian-l2-l3.md
  - gander/docs/post-mortems/gander-p6-moirai-skein-skills.md
  - (FE precedent also consulted) gander-studio-alpha/docs/post-mortems/gander-studio-p2-agent-cards.md
recurring_patterns:
  - pattern: OVERSCOPED
    description: "agent-cards G1: PM packed 4 independent files into one FE task (recurs from canvas-link)"
    pm_check: "Each task packet ≤ 2 independent files of logic per domain. The 4 tab components are independent — do not pack all tabs into one packet if that exceeds the bound; split detail-shell from the heavier tabs."
  - pattern: SCOPE_DRIFT
    description: "agent-cards G2: PM silently dropped the human-named 'appearance config file' deliverable"
    pm_check: "Every SC (SC1–SC10) and every named Output file must map to a packet as addressed / deferred-with-rationale / explicit out-of-scope. No silent drops. Especially: SC8 reserved Analyze slot, SC7 buffer-preserved-on-failure."
  - pattern: VERBATIM_DELIVERABLE
    description: "p7 + agent-cards: human-named deliverables must appear by name in a packet"
    pm_check: "The reserved Analyze slot {id:'analyze',placeholder:true} and the destination-path UI affordance are named deliverables — name them in packets."
  - pattern: AUDIT_RISK
    description: "agent-cards G4/G5/G6: interactive UI / visual regressions ship clean without DOM-asserting Playwright specs"
    pm_check: "Every interactive surface (tab switching, sortable table, save flow) needs a named Playwright assertion on user-visible DOM in success_criteria — not sound/proxy. Name the e2e spec path (tests/e2e/prog-studio-sessions-2026-05-s2-*.spec.ts)."
  - pattern: ASSUMPTION
    description: "p6 GapB / p7 Gap1: prompt-vs-contract drift — briefs restating contract values that should be referenced"
    pm_check: "Cite dashboard-patterns.md and globals.css by path; do NOT excerpt token hex/values inline in packets. Cite the S1 contract from <s1_published_contract> rather than re-deriving."
  - pattern: DRY
    description: "agent-cards: reuse before reimplement; invariant 1 (no client schema redefinition)"
    pm_check: "Reuse existing trpc client, store pattern (browse-store), and hook pattern (useBrowseData). Import Session types via z.infer from @gander-studio/shared. No client-side schema or parser duplication."
acknowledgement_required: true
</pm_preflight_checklist>

<pm_budget>
  <reads_cap>8</reads_cap>
  <halt_clause>If decomposition incomplete at the read cap, write progress + emit <budget_exceeded> + return. Do not continue silently.</halt_clause>
  <retry_rule>No prior PM timeout for this sprint. The reference files are pre-named below; read those and stop — the contract/conventions/remits are already excerpted above to avoid extra reads.</retry_rule>
</pm_budget>

<reference_files note="read these and STOP — ≤8 total">
1. docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s2-list-edit/orchestrator_brief.md  (authoritative sprint brief)
2. docs/project-conventions.md  (client conventions — already summarized in <convention_reconciliations>)
3. packages/client/src/constants/navigation.ts  (nav registration target)
4. packages/client/src/store/ui-store.ts  (AppMode union)
5. packages/client/src/hooks/useBrowseData.ts  (data-hook + trpc pattern to mirror)
6. packages/client/src/pages/BrowsePage.tsx  (page convention to mirror)
(Do NOT re-read schemas.ts / router.ts — excerpted verbatim in <s1_published_contract>.)
</reference_files>

<deliverable>
Return a <task_decomposition> with ≤6 <task_packet> blocks. Each packet: task_id suffix, owner
agent, dependencies (wave order), context_files, success_criteria (mapping to SC#), estimated_new_lines,
and the named Playwright spec where applicable. Include <routing_notes> with a
pm_preflight_acknowledgement for EACH pattern token above, and <risk_flags> that name the
critical_seam_finding resolution you chose.
</deliverable>

## Output Path
Write your primary output (the <task_decomposition>) to:
.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-1779304665.md
</orchestrator_brief>
