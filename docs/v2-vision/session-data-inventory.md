# Session Data Inventory + Candidate New-Stats Catalog — Gander Studio v2 Vision

**Task:** `gander-studio-p11-v2-vision-t1` | **Author:** ST#1 (statistician) | **Date:** 2026-07-07
**Purpose:** ground the v2 "review the team" vision in what the on-disk corpus can actually yield,
distinguishing what v1 already surfaces (DRY baseline) from genuinely new, corpus-verified candidate
stats. Every candidate below was checked against real files on disk — none are invented from
assumption.

---

## 1. What v1 already surfaces (DRY baseline)

Studio v1 ships five parser families under `packages/server/src/parsers/` plus the shared
`packages/shared/src/schemas.ts` contracts. This is the baseline; **STEP B below does not
re-propose any of it.**

| Parser / surface | tRPC procedure | What it computes today |
|---|---|---|
| `event-log-parser.ts` | (feeds `session.get`) | Reads all `docs/events/agent-events-*.jsonl`, validates each line against `EventLogEntrySchema` (`seq, ts, ev, task_id, agent_id, parent_id?, edge_label?, output_files?`), returns the raw, untouched event list for a session. `ev` is an unconstrained `z.string()`, so **every** event type that validates passes through to `session.get` — the raw feed is not artificially narrowed. |
| `session-stats.ts` (`computeSessionStats`) | `session.getStats` | Per-session totals AND a per-agent `AgentActivity` roll-up: `spawns, completes, feedback_loops, critique_passes, critique_blocks, audit_passes, audit_fails, files_touched, wall_clock_ms`. Only **6 of the ~29 real on-disk `ev` values** (§2.3 below) are named/counted: `SPAWN, COMPLETE, CRITIQUE_PASS, CRITIQUE_BLOCK, AUDIT_PASS, AUDIT_FAIL`. `feedback_loops` is a documented (SEAM-04) forward-look: a `SPAWN` immediately following a `CRITIQUE_BLOCK`/`AUDIT_FAIL` for the same task, attributed to the **spawned** agent. `wall_clock_ms` is first-ts-to-last-ts span, both session-level and per-agent. |
| `aggregate-stats.ts` (`aggregateSessionStats`) | `session.aggregateStats` | Sums `SessionStats` across multiple sessions, merging per-agent totals by `agent_id`. |
| `session-synthesis.ts` | (feeds `session.list`) | Synthesizes `Session` objects straight from the event log for sprints that have no after-action doc yet, using the same `computeSessionStats` path — so "documentless" sprints are not invisible. |
| `session-parser.ts` | `session.get`/`session.list` | Parses after-action markdown (frontmatter + ≥3 tolerated agent-activity table layouts) into the same `Session`/`AgentActivity` shape, so doc-backed and event-log-only sessions share one contract. |
| `progression-parser.ts` | `progression.getLedger` | Parses `docs/progression-ledger.md`'s fenced `jsonl` blocks into `ProgressionEntry{ sprint_id, xp_gained[{surface, delta}], levels_advanced[], new_capabilities[] }` — an XP/level-up ledger, already game-metaphor-shaped. |
| `program-dag-parser.ts` | `program.getDag` | Parses `docs/programs/*/program.md` into nodes (`sprint, tier, status?, dependsOn`), edges (`dependency`), and `seams` (`artifact, format?, contract?`) — already renders program structure as a DAG (React Flow + dagre). |
| connectivity (inline in `router.ts`) | `connectivity.getGraph` | Reads a static `docs/connectivity-graph.json` (nodes/edges with `DETECTED`/`INFERRED` confidence + `dataSource`) — agent/skill/hook wiring, not derived live from the event log. |
| `planning-parser.ts` | `planning.list` | Reads `docs/deferred-work.md` (`DEFERRED-NNN` items) + `docs/task-registry.md` (sprint rows) as a backlog list. |

**Two important attribution nuances confirmed by sampling raw events** (relevant baseline detail,
not a gap): `AUDIT_PASS`/`AUDIT_FAIL` events carry the **auditor's** `agent_id` (e.g.
`AUDIT_FAIL AUDITOR#1 gander-studio-p1-materia-canvas PM audit_review FAIL`), and
`CRITIQUE_PASS`/`CRITIQUE_BLOCK` carry the **critic's** `agent_id`. So v1's per-agent
`audit_passes`/`audit_fails`/`critique_*` counters answer "how many audits/critiques did this
gate-agent render," not "how many times was this implementer's work failed." This is exactly why
SEAM-04's `feedback_loops` had to be defined as a *forward*-look (next SPAWN after the gate event)
rather than reading the gate event's own `agent_id` — and it is the seam STEP B's strongest new
candidate (§2.1) exploits.

**Cross-project scope already configured:** `.env` sets
`SESSIONS_SOURCE_DIRS=/home/jhber/projects/gander,/home/jhber/projects/gander-studio-alpha` — v1's
Sessions/stats surfaces already span **2 of 3** available sibling-project corpora. `~/projects/broadn-web-view`
(12 event-log files, 2 after-actions — counted, not read line-by-line; read-only per packet note) is
**not** in the configured set today (see §2.7).

---

## 2. Candidate new stats (corpus-verified)

Every candidate below was checked against a real file/glob (cited) and, where a number is quoted, that
number was computed from the sampled data — never estimated from memory. Feasibility tags are exactly
`AVAILABLE-NOW` or `NEEDS-SCHEMA-EXTENSION` per the packet; two candidates below (§2.4, §2.7) have a
genuinely split feasibility because the stat bundles a computable part and a schema-gapped part — each
split is called out explicitly rather than rounded to a single tag.

### 2.1 Per-implementer audit first-pass rate (attribution flip)
- **Source:** `docs/events/agent-events-*.jsonl` (all 22 files sampled, incl. in-flight `2026-07-07`).
- **Derivation:** Group events by `task_id` (a production version should use the same `sprintRoot`/
  `matchesSlug` boundary-anchored grouping `session-slug-match.ts` already uses — DRY reuse, not a new
  grouping rule). Within a group sorted by `ts`, track the most recent `SPAWN` whose role is not a
  gate role (`AUDITOR`/`AUD`/`AU`/`CR`/`ORC`); attribute the next `AUDIT_PASS`/`AUDIT_FAIL` to that
  implementer role. A task's audit is "first-pass" if no `AUDIT_FAIL` preceded its eventual
  `AUDIT_PASS` in the same family. This is the mirror-image of the existing `feedback_loops`
  derivation (forward-look) — this one looks backward to find who was *being* audited, which v1 never
  computes (v1's `audit_passes`/`audit_fails` are keyed to the auditor, per §1).
- **Sampled result (exact-`task_id` grouping, a stricter/undercounting proxy for the real
  `sprintRoot`-based version — 18 of 71 corpus-wide audit events landed `(unattributed)` under this
  simpler grouping):** `BE`: 9/9 first-pass (100%); `FE`: 22/35 first-pass (63%), 7 attributed fails,
  6 pass-after-fail; `WF` (Workflow-accelerant tag): 6/7 (86%). These cross-validate the prose in
  `docs/after-actions/prog-studio-vision-2026-06.md` §5 ("backend-engineer … 4/4 PASS, 0 regressions
  … Cleanest implementer record" / "frontend-engineer … locus of all 3 runtime/integration misses").
- **Feasibility: AVAILABLE-NOW.**

### 2.2 Ghost/stall rate per agent role
- **Source:** `docs/events/agent-events-*.jsonl`, `ev == "GHOST_CONFIRMED"` (7 occurrences corpus-wide).
- **Derivation:** `count(GHOST_CONFIRMED) / count(SPAWN)` grouped by role prefix. Unlike audit events,
  `GHOST_CONFIRMED`'s own `agent_id` **is** the stalled agent directly (sampled: `BE#1`, `BE#3`,
  `FE#rem1`, `FE#rem2`, `UI#1`, `BE#4`, `WF#3-s1`) — no attribution heuristic needed.
- **Sampled result:** `BE`: 3/16 spawns (18.8%); `FE`: 2/46 (4.3%); `UI`: 1/6 (16.7%); `WF`: 1/10
  (10%). The BE figure lines up with `docs/after-actions/gander-studio-p9-sessions-feed-agentstats.md`
  §5 ("BE (normal spawn) | 4 attempts | ~25% … BE#1/#3/#4 stalled").
- **Feasibility: AVAILABLE-NOW.**

### 2.3 Event-type coverage / "invisible event" audit
- **Source:** `docs/events/agent-events-*.jsonl`, distinct `ev` values across all 22 files.
- **Derivation:** tally `set(ev)` and diff against the 6 values `computeSessionStats` names.
- **Sampled result:** **29 distinct `ev` values** are present on disk (not the "~25" the Fable
  ORC-EVAL §2 estimated — verified count, corrected upward): `SPAWN(195), COMPLETE(161),
  AUDIT_PASS(63), BACKFILL_SCAN(45), CRITIQUE_BLOCK(15), CRITIQUE_PASS(10), AUDIT_FAIL(10),
  RESUME(9), GHOST_CONFIRMED(7), NOTE(4), COMMIT(3), REQVAL_PASS(3), POST_MORTEM(3),
  ENV_PREFLIGHT(2), REQVAL_COVERED(2), PM_PREFLIGHT(2), REVISION(1), HCG_RESOLVED(1),
  CHECKPOINT(1), REQUIREMENTS_COVERED(1), REQUIREMENTS_PARTIAL_PASS(1), ENV_FIX(1),
  AGENT_IMPROVEMENT(1), HONE_SESSION(1), VERIFY_FAIL(1), DISPATCH_HALT(1), EVENT_LOG_GAP(1),
  SPRINT_VERIFIED(1), PAUSE(1)`. **23 of 29** are counted by no current parser. `session.get` does
  return them in the raw feed (per §1), so the gap is presentation/aggregation, not data absence.
- **Data-quality finding (not a stat, a flag — see §4):** one real line (`HCG_RESOLVED`,
  `agent-events-2026-03-28.jsonl`) has **no `agent_id` field** (it uses `resolved_by` instead) and
  therefore **fails `EventLogEntrySchema.safeParse`** — `readEventLogEntries` silently drops it
  (`console.warn`, never thrown). This event type is invisible twice over: uncounted AND
  schema-rejected.
- **Feasibility: AVAILABLE-NOW** (schema already accepts every `ev` string; this is an aggregation/
  presentation gap, not a data gap) — except the one malformed `HCG_RESOLVED` line, which needs a
  schema tolerance fix (optional `agent_id`, or a `resolved_by` fallback) before it can be counted;
  everything else in this candidate is available today.

### 2.4 Plan-gate (Critic) block rate
- **Source:** `docs/events/agent-events-*.jsonl`, `ev` in `{CRITIQUE_PASS, CRITIQUE_BLOCK}`.
- **Derivation:** `count(CRITIQUE_BLOCK) / count(CRITIQUE_BLOCK + CRITIQUE_PASS)`, corpus-wide or
  scoped to a sprintRoot family. Same attribution-flip nuance as §2.1 applies (the event's `agent_id`
  is the Critic, not the blocked PM/plan) — a full per-PM-decomposition version needs the same
  backward-look; the corpus-wide aggregate does not.
- **Sampled result:** 15 blocks / 25 total = **60% corpus-wide block rate** — consistent with
  `prog-studio-vision-2026-06.md` §5 ("critic | 5 plan gates | BLOCKED 4/5, all substantive").
- **Feasibility: AVAILABLE-NOW** (corpus-wide aggregate); per-PM attribution needs the same
  backward-look heuristic as §2.1 (still AVAILABLE-NOW, just not yet demonstrated at that grain here).

### 2.5 Skill invocation value-rate across sprints ("skill trust score")
- **Source:** `docs/after-actions/*.md` §8a "Skill Invocation Log" tables (all 3 files:
  `gander-studio-p10-deferred-smalls.md`, `gander-studio-p9-sessions-feed-agentstats.md`,
  `prog-studio-vision-2026-06.md`).
- **Derivation:** parse the `| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |` table
  (present in all 3, one-per-after-action) and tally the `Outcome` column
  (`VALUABLE`/`PARTIAL_VALUE`/`NOT_TRIGGERED`) per skill, across sprints. Same resilient-multi-layout
  parsing lesson `session-parser.ts` already applies to agent-activity tables (DRY pattern to reuse).
- **Sampled result:** 25 skill-invocation rows tallied across 3 files, 22 distinct skill names cited
  (recurring backbone skills like `audit-pipeline`, `log-event`, `commit-packet`, `after-action`
  appear in multiple sprints). Outcome distribution: **22 VALUABLE, 2 PARTIAL_VALUE, 1
  NOT_TRIGGERED** (88% VALUABLE).
- **Feasibility: AVAILABLE-NOW, with a small-n caveat** — only 3 after-action docs exist in this
  project (per the dispatch-time catalog sync check), so a "skill trust score" is directionally real
  but statistically thin; it will get more reliable as the corpus grows.

### 2.6 Protocol-gap recurrence tagging
- **Source:** `docs/after-actions/*.md` YAML frontmatter `gap_classes`/`recurring_tags` (present in
  **only 1 of 3** files — `gander-studio-p10-deferred-smalls.md`) + §6 "Protocol Gaps Identified"
  prose tables (present in all 3).
- **Derivation:** count distinct gap-class tags across sprints; e.g. the "SubagentStop COMPLETE-miss"
  family recurs across all 3 sampled after-actions under different named sub-classes (decorated/
  meta-agent miss, cross-project attribution miss, project-attribution miss) — a genuine recurring
  pattern only visible by reading all three §6 sections together, which no current surface does.
- **Feasibility: AVAILABLE-NOW, with a data-shape caveat** — frontmatter tagging is inconsistent
  (1/3 files), so a real implementation needs prose text-matching as a fallback, not a pure
  frontmatter read (documented as a data_quality_flag, §4).

### 2.7 Cross-project role participation
- **Source:** `~/projects/gander/docs/events/*.jsonl` (26 files, counted), `~/projects/gander/docs/after-actions/*.md`
  (43 files, counted), `~/projects/broadn-web-view/docs/events/*.jsonl` (12 files, counted),
  `~/projects/broadn-web-view/docs/after-actions/*.md` (2 files, counted) — READ-ONLY cross-project
  evidence per the packet's explicit allowance; not read line-by-line (out of this task's remit —
  counted via `ls`/`wc` only).
- **Derivation:** role-prefix (`PM`/`FE`/`BE`/`CR`/`AU`/...) `SPAWN`/`COMPLETE` tallies summed across
  sibling-project JSONL corpora, using the same `role_of()` prefix-extraction as within-studio (§2.1–2.2).
- **Feasibility — genuinely split:**
  - **ROLE-level** cross-project participation (e.g. "how many BE spawns has this role had across all
    3 projects") = **AVAILABLE-NOW-WITH-CAVEAT**: the data exists on disk today; `gander` is already
    in Studio's configured `SESSIONS_SOURCE_DIRS`, `broadn-web-view` is not — extending coverage is a
    **config change** (`.env`/`SESSIONS_SOURCE_DIRS`), not a schema change.
  - **INSTANCE-level** identity persistence (proving "this specific `FE#1` invocation in
    gander-studio-alpha is the same physical contributor as `FE#1` in gander") = **NEEDS-SCHEMA-EXTENSION**:
    `agent_id` ordinals (`FE#1`, `FE#2`, ...) reset per sprint/session and carry no stable identity
    field, so cross-project instance-level joins cannot be made reliable without a new field.

### 2.8 Program-DAG seam/fan-in density
- **Source:** `docs/programs/prog-studio-vision-2026-06/program.md` (5 sprint nodes, 7 seam rows:
  `SEAM-01` through `SEAM-07`), `docs/programs/prog-studio-sessions-2026-05/program.md` (0 seam rows —
  verified by direct count, not assumed).
- **Derivation:** `program-dag-parser.ts` already parses `nodes`/`edges`/`seams`; this candidate is a
  NEW aggregate VIEW on top of that already-parsed structure (fan-in/seam-density ranking), not a
  re-proposal of DAG rendering itself (already baseline, §1).
- **Sampled result:** in `prog-studio-vision-2026-06`, sprint `s1-token-root-fix` is the highest
  fan-out node — it is the `from_sprint` of 4 of the 7 seams (`SEAM-01/02/03/07`), i.e. it is the
  single foundation the other 4 sprints depend an artifact/contract handoff on.
- **Feasibility: AVAILABLE-NOW.**

### 2.9 Agent spec version-bump frequency & cause→effect trace
- **Source:** `docs/agent-changelog.md` (71 lines, verified by direct read).
- **Derivation:** parse the 5 `## agent-improvement-*`/`## hone-*` session headers, each with a
  "Post-mortems acted on" line and a `| File | Previous version | New version | Change |` table; tally
  bump counts per spec file and join each session to the post-mortem(s) that triggered it (the "cause"
  half the Fable ORC-EVAL §2 item 8 flagged as missing — the progression ledger already has the
  "effect" half: `new_capabilities`/`levels_advanced`).
- **Sampled result:** 5 improvement sessions total; per-file bump counts:
  `.claude/agents/frontend.md` ×6, `critic.md` ×5, `pm.md` ×4, `auditor.md` ×3, `orchestrator.md` ×2,
  plus 3 distinct skill-file bumps (`requirements-validate`, `dispatch-task`, `audit-pipeline`
  SKILL.md, each ×1 in this log).
- **Feasibility: AVAILABLE-NOW.**

### 2.10 Agent-log journal completion/interruption signal (cross-check for §2.2)
- **Source:** `docs/agent-logs/**/*.md` (232 files; per-role directories: `AUD`=60, `FE`=65, `CR`=34,
  `PM`=25, `BE`=24, `AR`=9, `UI`=9, `RA`=3, `DS`=2, `ST`=1 as of this sampling — **no `ORC` or `HR`
  directory exists**, an observation worth surfacing, not explaining, here).
- **Derivation:** the agent-log skill's own 3-stage protocol (RECEIVED → PLAN → COMPLETE-or-
  INTERRUPTED) is a second, independent signal for stall/interruption, complementary to
  `GHOST_CONFIRMED` (§2.2) — a stall could show up in one source and not the other.
- **Sampled result:** a heading-pattern grep sample found ~12 files matching an "INTERRUPTED"-headed
  Stage-3 block and ~81 matching a "COMPLETE"-headed block, out of 232 — **explicitly an
  under-count**, since heading punctuation is not standardized (em-dash vs hyphen, and this very log's
  own template text "COMPLETE or INTERRUPTED" matches neither simple pattern). Reported as an
  order-of-magnitude sample, not an exhaustive tally.
- **Feasibility: AVAILABLE-NOW-WITH-CAVEAT** — real signal, but a production parser needs the same
  resilient multi-pattern tolerance `session-parser.ts` already applies elsewhere, not a single regex.

---

## 3. Tokens/cost dimension — forced NEEDS-SCHEMA-EXTENSION

Per the packet's STEP C mandate: **any tokens-per-agent / cost / "MP"-style economics stat is
`NEEDS-SCHEMA-EXTENSION`, full stop.** `packages/shared/src/schemas.ts` `EventLogEntrySchema` has
fields `seq, ts, ev, task_id, agent_id, parent_id?, edge_label?, output_files?` — **no token field** —
and `docs/deferred-work.md` records this explicitly:

> **DEFERRED-P9-1 — Tokens-per-agent stats not implemented.** `EventLogEntrySchema` carries no
> token-count field; token data is not present in the JSONL event log. Tokens-per-agent aggregation
> is deferred until the event schema is extended with a `tokens` field (or an alternative source is
> identified).

A second, independent confirmation was found while sampling `docs/sprint-reports/*.md`: one report
(`prog-studio-sessions-2026-05-s1-backend-report.md`) contains **real historical token numbers**
(a "Wave total (Session 2, ORC#1-spawned agents): **507,141 tokens**" — `BE#1: 245,783`,
`AU#1: 206,956`, `AR#1: 54,402`) — but the report's own text confirms these were hand-reconstructed
**from live `<usage>` blocks visible only to that spawning session at the time**, explicitly NOT from
the durable JSONL log:

> "Auto-logged COMPLETE events in the JSONL do not carry a `tokens` field, so the figures above are
> reconstructed from the live `<usage>` blocks captured by ORC#1 this session… Future sessions should
> write `"tokens": N` into each COMPLETE event at spawn-return time to make this durable."

This is the exception that proves the rule: token data has existed exactly once, ephemerally, in one
manually-authored report — it is **not** a systematic, durable, queryable data source today. **No
candidate in §2 presents tokens/cost as AVAILABLE-NOW**, and the sample-data appendix below (§4)
follows the same rule: any MP/cost-style value is explicitly labeled projected/needs-schema-extension,
never rendered as a real number.

---

## 4. Data quality flags

| Issue | Affected records | Action taken |
|---|---|---|
| Auditor role has 3 different literal `agent_id` prefixes for the same functional Gate role across the corpus's history — `AUDITOR` (50 events), `AUD` (46 events), `AU` (22 events) | 118 of 546 valid events (21.6%) | **Flagged, not silently merged.** Any per-role rollup (§2.1, §2.2, §2.4) MUST canonicalize these three prefixes; v1's own `session-stats.ts` does **not** canonicalize (it aggregates by literal `agent_id`), so today's per-agent tables would show `AUDITOR#1` and `AUD#1` as unrelated rows even though they are the same functional role at different points in the project's history. Where this report presents a merged `AU` figure (§2.1, §4 appendix), the merge is stated explicitly. |
| One event (`HCG_RESOLVED`, `docs/events/agent-events-2026-03-28.jsonl`, seq 7) has no `agent_id` field — fails `EventLogEntrySchema.safeParse` | 1 of 547 raw lines (0.2%) | **Flagged, not counted in any per-agent stat.** `readEventLogEntries` silently drops it today (`console.warn`); confirmed by direct JSON-parse of the raw line (`resolved_by: "human"` present, `agent_id` absent). |
| `docs/after-actions/*.md` frontmatter tagging (`gap_classes`/`recurring_tags`) is present in only 1 of 3 sampled files | 2 of 3 after-action docs (67%) | **Flagged as a data-shape caveat on §2.6**, not silently normalized — a real recurrence-tagging stat needs a prose-fallback parser, not a frontmatter-only read. |
| `docs/programs/prog-studio-sessions-2026-05/program.md` has 0 seam rows (verified by direct count) | 1 of 2 program.md files | Reported as-is in §2.8 — not assumed to be a parsing miss; not investigated further (out of this task's remit; PM/BE call if it matters for v2). |
| The `ST` agent role has only **1** file in `docs/agent-logs/ST/` prior to this task (i.e., this dispatch is close to the founding data point for the role in this project's corpus) | n/a (self-observation) | Noted for honesty in the sample-data appendix (§5) rather than fabricating a richer historical ST track record. |
| `DI` (listed in DESIGN.md's Role/Materia Colors table, "Meta agents: UI, DI, HR") has **zero** occurrences in the 546-event corpus and no corresponding file in `~/.claude/agents/*.md` (12 agent spec files exist, not 13) | n/a | **No value fabricated for DI** in the sample-data appendix — explicitly marked "no corpus occurrences; DESIGN.md-listed role code, not observed on disk" rather than inventing a plausible number. |

---

## 5. Design implications (non-binding, for the UI designer)

### 5.1 FF7-stat-metaphor candidates

These are leads, not decisions — t3 owns the actual mapping and may adopt, adapt, or reject any of
these.

| Candidate stat (from §2) | Suggested FF7 metaphor | Why |
|---|---|---|
| §2.1 Per-implementer audit first-pass rate | **"Guard" / accuracy-style stat bar** | A high first-pass rate reads like a character that rarely gets hit — a defensive stat, not an offensive one. |
| §2.2 Ghost/stall rate | **"Stamina" bar (inverse-scaled)** | A stalled task is a character running out of action/HP mid-battle; low stall rate = full stamina. |
| §2.5 Skill invocation value-rate | **"Materia mastery / AP" indicator** | Ties directly into the human's own game-side↔agent-side analogy (materia ↔ skills/hooks, per t3's remit) — a skill's cross-sprint VALUABLE rate is exactly a materia's "AP toward next level" feel. |
| §2.9 Agent spec version-bump history | **"Ability learned" log entries** | Complements the *existing* (baseline, §1) Progression `new_capabilities`/`levels_advanced` fields — `agent-changelog.md` supplies the missing "cause" (which post-mortem triggered the ability) that the ledger's "effect" side lacks. |
| §2.8 Program-DAG seam/fan-in density | **"Party formation / bond" indicator** | A sprint with many outgoing seams (like `s1-token-root-fix`, §2.8) is the "anchor" party member other members depend on — a relationship indicator more than a bar. |
| §2.3 Event-type coverage | **(not a bar — an IA note)** | 23 of 29 real event types are invisible to any current parser; this argues for widening whatever "battle log / timeline" surface v2 keeps, not a new stat bar per se. |
| §3 Tokens/cost | **"MP" bar — MUST render "projected / needs schema extension"** | The natural FF7 metaphor for cost is MP, but per DEFERRED-P9-1 (§3) this MUST NOT be rendered as a real, available-now bar. If v2 includes an MP-style bar at all, it needs a visible aspirational/projected label — never real-looking data. |

### 5.2 SAMPLE-DATA appendix (real roster codes, real corpus-sampled/estimated values)

Roster codes per `DESIGN.md`'s Role/Materia Colors table (`PM, ORC, CR, AU/AUDITOR, UI, DI, HR, RA,
ST, AR, BE, FE, DS`). Values below are **sampled or directly computed from the corpus read for this
report** (§2, §4) — where a value could not be computed or observed, that is stated explicitly rather
than invented. `AU` below is the canonicalized merge of `AUDITOR`+`AUD`+`AU` prefixes per the §4 flag.

| Agent code | Role (DESIGN.md) | Spawns (corpus, all 22 event files) | Completes | Ghost/stall count | First-pass audit rate (§2.1, exact-task_id grouping) | Notes |
|---|---|---|---|---|---|---|
| `FE` | Impl | 46 | 53 | 2 | 22/35 = 63% | Highest event volume in the corpus; also the role most-cited for runtime/integration misses in after-action prose (§2.1). |
| `BE` | Impl | 16 | 17 | 3 | 9/9 = 100% | Cleanest first-pass record of any implementer role sampled; also highest ghost-rate at 18.8% (3/16) — both real, both from the same corpus. |
| `DS` | Impl | 1 | 2 | 0 | n/a (0 audits observed for this role in the sample) | Smallest footprint of the three Impl roles — 3 total events corpus-wide. |
| `PM` | Command | 25 | 23 | 0 | n/a (PM is not directly audit-gated; see §2.4 for the plan-gate analog) | |
| `ORC` | Command | 3 | 8 | 0 | n/a | Most of ORC's corpus footprint (95 total events) is administrative event types (`BACKFILL_SCAN`, `PM_PREFLIGHT`, `COMMIT`, ...) outside the 6 baseline-counted types — see §2.3. |
| `RA` | Intel | 3 | 2 | 0 | n/a | Smallest footprint sampled; 5 total events corpus-wide. |
| `ST` | Intel | 1 | 0 | 0 | n/a | **This report is close to the founding data point for ST in this project's corpus** (1 prior `docs/agent-logs/ST/` file) — flagged honestly per §4, not padded. |
| `AR` | Intel | 15 | 22 | 0 | n/a | |
| `UI` | Meta | 6 | 7 | 1 | n/a | 16.7% ghost rate (1/6) — real, from the p9 after-action's documented UI stall event. |
| `DI` | Meta | **0 (no corpus occurrences)** | — | — | — | Listed in DESIGN.md's Materia table but has no corresponding `~/.claude/agents/*.md` spec file and zero observed `agent_id` instances in 546 sampled events — see §4. No value fabricated. |
| `HR` | Meta | 3 | 3 | 0 | n/a | |
| `CR` | Gate | 25 | 6 | 0 | n/a (CR renders gate verdicts; see §2.4 for the block-rate stat) | Corpus-wide plan-gate block rate: 15 blocks / 25 total = 60% (§2.4). |
| `AU` (merged AUDITOR+AUD+AU) | Gate | 38 | 7 | 0 | n/a (AU renders audit verdicts; see §2.1 for the per-implementer flip) | 118 total events across the 3 naming eras (§4); merge is a display-time canonicalization, not a corpus edit. |

**Tokens/cost — explicitly NOT included as a per-agent bar value above**, per §3. If the v2 mockup
wants an illustrative MP-style number for flavor, the only real historical figure in the entire corpus
is the one-off wave total from `prog-studio-sessions-2026-05-s1-backend-report.md`
(`BE#1: 245,783`, `AU#1: 206,956`, `AR#1: 54,402` tokens) — and if used at all, it MUST carry a
"historical/one-off, not durable — needs schema extension" label, not be presented as a live,
per-sprint, per-agent stat.

---

## 6. Provenance (on-disk paths sampled)

- `docs/events/agent-events-*.jsonl` — **all 22 files**, including the in-flight
  `agent-events-2026-07-07.jsonl` for this very sprint (INCLUDED deliberately: it is real on-disk data
  as of read-time, not fabricated; its 1 `CRITIQUE_BLOCK` row is part of the §2.4 corpus-wide tally).
- `docs/after-actions/*.md` — all 3 files (`gander-studio-p10-deferred-smalls.md`,
  `gander-studio-p9-sessions-feed-agentstats.md`, `prog-studio-vision-2026-06.md`), §5/§6/§8a sections.
- `docs/agent-logs/**/*.md` — 232 files, directory-level counts + heading-pattern sample (§2.10).
- `docs/sprint-reports/*.md` — both files (`gander-studio-p2-agent-cards-report.md`,
  `prog-studio-sessions-2026-05-s1-backend-report.md`).
- `docs/programs/prog-studio-vision-2026-06/program.md`, `docs/programs/prog-studio-sessions-2026-05/program.md`.
- `docs/agent-changelog.md` (71 lines, read in full), `docs/deferred-work.md` (DEFERRED-P9-1 read in full).
- `packages/server/src/parsers/*.ts` (all 12 files), `packages/shared/src/schemas.ts` — read for §1.
- `.env` / `packages/server/src/env.ts` — read to confirm `SESSIONS_SOURCE_DIRS` scope (§1, §2.7).
- `DESIGN.md` — Role/Materia Colors table + Decision Record (idealized vs runtime token names).
- `.claude/agents/tasks/outputs/gander-studio-meta-fable-eval-ORC-EVAL-1781056770.md` — §2, §3, §5
  (leads used as starting points, each independently re-verified against disk before inclusion above;
  the "~25 event types" estimate in §2 item 3 was corrected to the verified 29 in §2.3).
- `~/.claude/agents/*.md` (symlinked to `~/projects/gander/.claude/agents/`) — 12 files, directory
  listing only, to verify the DI role has no spec file (§4).
- `~/projects/gander/docs/events/*.jsonl` (26 files), `~/projects/gander/docs/after-actions/*.md`
  (43 files), `~/projects/broadn-web-view/docs/events/*.jsonl` (12 files),
  `~/projects/broadn-web-view/docs/after-actions/*.md` (2 files) — counted only (READ-ONLY
  cross-project evidence, §2.7).
