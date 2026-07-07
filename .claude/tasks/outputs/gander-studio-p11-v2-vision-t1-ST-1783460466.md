<statistical_report>
  <task_id>gander-studio-p11-v2-vision-t1</task_id>
  <dataset>Gander Studio v2 vision — session-data inventory + candidate new-stats catalog, derived from
docs/events/*.jsonl (22 files), docs/after-actions/*.md (3 files), docs/sprint-reports/*.md (2 files),
docs/agent-logs/**/*.md (232 files), docs/programs/*/program.md (2 files), docs/agent-changelog.md,
docs/deferred-work.md, and packages/server/src/parsers/*.ts + packages/shared/src/schemas.ts (read-only,
for the STEP A DRY baseline). Cross-project corpora (~/projects/gander, ~/projects/broadn-web-view)
counted read-only per packet allowance.</dataset>
  <n_records>546 valid EventLogEntry-schema-conformant lines across 22 JSONL files (547 total non-empty
lines; 1 line — HCG_RESOLVED, agent-events-2026-03-28.jsonl seq 7 — fails schema validation, missing
agent_id, flagged not counted). 134 distinct task_ids. 25 skill-invocation rows + 3 after-action docs.
71-line agent-changelog.md (5 improvement sessions). 2 program.md files (7 seams + 0 seams).</n_records>

  <data_quality_flags>
    <flag>
      <issue>Auditor/Gate role has 3 distinct literal agent_id prefixes for the same functional role
across the corpus's history: AUDITOR, AUD, AU.</issue>
      <affected_records>118 of 546 valid events (21.6%)</affected_records>
      <action_taken>Flagged, not silently merged. v1's session-stats.ts does NOT canonicalize these
(aggregates by literal agent_id). Any per-role rollup candidate in this report states explicitly
where a merged "AU" figure is used (session-data-inventory.md §2.1, §5.2 appendix).</action_taken>
    </flag>
    <flag>
      <issue>One event (ev=HCG_RESOLVED) has no agent_id field and fails EventLogEntrySchema.safeParse;
readEventLogEntries silently drops it (console.warn, never thrown).</issue>
      <affected_records>1 of 547 raw lines (0.2%)</affected_records>
      <action_taken>Flagged in report §2.3 and §4; excluded from all per-agent tallies; not fabricated
around.</action_taken>
    </flag>
    <flag>
      <issue>docs/after-actions/*.md YAML frontmatter tagging (gap_classes/recurring_tags) present in
only 1 of 3 sampled files (gander-studio-p10-deferred-smalls.md).</issue>
      <affected_records>2 of 3 after-action docs (67%)</affected_records>
      <action_taken>Flagged as a data-shape caveat on the §2.6 candidate (protocol-gap recurrence
tagging) — classified AVAILABLE-NOW-WITH-CAVEAT, not silently normalized to a clean frontmatter-only
read.</action_taken>
    </flag>
    <flag>
      <issue>DI (listed in DESIGN.md's Role/Materia Colors table as a Meta-agent role code) has zero
occurrences in the 546-event corpus and no corresponding spec file in ~/.claude/agents/*.md (12 files
exist, not 13).</issue>
      <affected_records>0 observed instances</affected_records>
      <action_taken>No value fabricated. Sample-data appendix marks DI explicitly as "0 (no corpus
occurrences)" rather than inventing a plausible number, per out-of-scope constraint.</action_taken>
    </flag>
    <flag>
      <issue>docs/agent-logs/ST/ had only 1 prior file before this dispatch — the ST role is a
near-founding data point in this project's corpus.</issue>
      <affected_records>n/a (self-observation)</affected_records>
      <action_taken>Noted honestly in the sample-data appendix rather than padding a richer historical
ST track record that doesn't exist.</action_taken>
    </flag>
  </data_quality_flags>

  <findings>
    <finding>
      <claim>Studio v1 already computes 6 of ~29 real on-disk event types by name (SPAWN, COMPLETE,
CRITIQUE_PASS, CRITIQUE_BLOCK, AUDIT_PASS, AUDIT_FAIL) via computeSessionStats; the remaining 23 types
(BACKFILL_SCAN, RESUME, GHOST_CONFIRMED, NOTE, COMMIT, REQVAL_PASS, POST_MORTEM, etc.) pass through
session.get's raw feed but are aggregated/named nowhere.</claim>
      <method>Exhaustive tally of the ev field across all 546 valid events in 22 JSONL files; diff
against the 6 event types named in packages/server/src/parsers/session-stats.ts.</method>
      <confidence>Exact count, not estimated (n=546 events, 29 distinct ev values verified).</confidence>
      <caveat>The Fable ORC-EVAL §2 item 3 estimated "~25" event types; the verified corpus count is
29 — corrected upward in the report.</caveat>
    </finding>
    <finding>
      <claim>AUDIT_PASS/AUDIT_FAIL and CRITIQUE_PASS/CRITIQUE_BLOCK events carry the gate-agent's
(auditor's/critic's) agent_id, not the implementer's — so v1's per-agent audit_passes/audit_fails/
critique_* counters answer "how many audits did this auditor render," not "how many times was this
implementer's work failed." A backward-look attribution (most recent non-gate-role SPAWN in the same
task_id family) recovers per-implementer first-pass rate: BE 9/9 (100%), FE 22/35 (63%), WF 6/7 (86%)
under a task_id-exact grouping (a stricter/undercounting proxy for the real sprintRoot-based grouping
v1's session-slug-match.ts already implements).</claim>
      <method>Backward-look correlation over ts-sorted events within task_id groups; cross-validated
against qualitative prose in docs/after-actions/prog-studio-vision-2026-06.md §5 ("backend-engineer …
4/4 PASS … cleanest implementer record" / "frontend-engineer … locus of all 3 runtime/integration
misses").</method>
      <confidence>Exact counts from a one-off python aggregation script over the real corpus (n=71
audit-verdict events; 18/71 unattributed under the stricter exact-task_id grouping — a known
undercount vs. the sprintRoot-based grouping a production implementation should use).</confidence>
      <caveat>This is a sampling-time verification, not a shipped implementation. A production version
should reuse session-slug-match.ts's sprintRoot()/matchesSlug() boundary-anchored grouping rather than
exact task_id string match, to reduce the 18/71 unattributed cases.</caveat>
    </finding>
    <finding>
      <claim>Tokens/cost has NO durable, systematic data source anywhere in the corpus. DEFERRED-P9-1
confirms EventLogEntrySchema has no token field. A second, independent confirmation: exactly one
sprint-report (prog-studio-sessions-2026-05-s1-backend-report.md) contains real historical token
numbers (507,141-token wave total), but its own text states these were hand-reconstructed from
ephemeral <usage> blocks visible only to that one spawning session — not from the JSONL log, not
reproducible for any other sprint.</claim>
      <method>Direct grep + read of docs/deferred-work.md (DEFERRED-P9-1 exact text) and
docs/sprint-reports/*.md (both files).</method>
      <confidence>Definitive — schema inspection (packages/shared/src/schemas.ts EventLogEntrySchema
has no tokens field) plus the sprint-report's own explicit "TOKEN_GAP" admission.</confidence>
      <caveat>Per STEP C mandate, no candidate stat in the report presents tokens/cost as AVAILABLE-NOW;
the one real historical figure is presented only as flavor context, explicitly labeled
historical/one-off/needs-schema-extension, and excluded from the per-agent sample-data appendix
table.</caveat>
    </finding>
    <finding>
      <claim>Cross-project data-source scope is already PARTIALLY baseline: .env's
SESSIONS_SOURCE_DIRS already spans gander + gander-studio-alpha (2 of 3 candidate project corpora).
broadn-web-view (12 event-log files, 2 after-actions — counted only) is not in the configured set —
extending coverage there is a config change (SESSIONS_SOURCE_DIRS), not a schema change, for
ROLE-level participation stats. INSTANCE-level cross-project identity (proving a specific agent
invocation is the same contributor across projects) needs a new stable-identity field
(NEEDS-SCHEMA-EXTENSION) since agent_id ordinals reset per sprint/session.</claim>
      <method>Read packages/server/src/env.ts + .env to confirm SESSIONS_SOURCE_DIRS resolution; ls/wc
counts of sibling-project docs/events and docs/after-actions directories (read-only per packet
allowance, not read line-by-line).</method>
      <confidence>Exact file counts (26 event files + 43 after-actions in gander; 12 event files + 2
after-actions in broadn-web-view).</confidence>
      <caveat>This candidate's feasibility is genuinely split (role-level vs instance-level) rather than
a single tag — both halves are stated explicitly in the report rather than rounded to one label.</caveat>
    </finding>
  </findings>

  <design_implications>
FF7-stat-metaphor candidates proposed as non-binding leads for the UI designer (t3), each tied to a
corpus-verified candidate stat: first-pass audit rate → "Guard"/accuracy-style bar; ghost/stall rate →
inverse-scaled "Stamina" bar; skill invocation value-rate → "Materia mastery/AP" indicator (ties
directly into the human's own materia↔skills/hooks analogy that t3 owns); agent spec version-bump
history (docs/agent-changelog.md) → "Ability learned" log entries complementing the EXISTING (baseline)
Progression ledger's new_capabilities/levels_advanced fields; program-DAG seam/fan-in density → "Party
formation/bond" indicator; event-type coverage gap → not a bar, an IA note (widen whatever
timeline/battle-log surface v2 keeps); tokens/cost → "MP" bar ONLY IF explicitly labeled "projected /
needs schema extension" per DEFERRED-P9-1 — never rendered as real data. Full detail + rationale in
docs/v2-vision/session-data-inventory.md §5.1.

A SAMPLE-DATA appendix (§5.2 of the deliverable) gives real roster codes (PM, ORC, CR, AU, UI, DI, HR,
RA, ST, AR, BE, FE, DS per DESIGN.md's Role/Materia table) with corpus-sampled or directly-computed
values (spawns/completes/ghost counts/first-pass rates) for the strongest candidates — DI is marked
explicitly zero-occurrence rather than fabricated, and no tokens/cost value is included in the per-agent
table (per STEP C).
  </design_implications>

  <reacquisition_request>None. All context files named in the packet (context_files block) existed and
were readable; no data source was missing or malformed in a way that blocked analysis. The one malformed
record found (HCG_RESOLVED missing agent_id) is a data-quality flag within the existing corpus, not a
reacquisition need.</reacquisition_request>

  <generated_files>
docs/v2-vision/session-data-inventory.md (deliverable — 320 lines, 6 named sections: §1 v1-baseline,
§2 candidate-new-stats catalog with 10 candidates each carrying name/source/derivation/feasibility,
§3 tokens/cost forced NEEDS-SCHEMA-EXTENSION citing DEFERRED-P9-1, §4 data quality flags, §5
design_implications (FF7 metaphors + sample-data appendix), §6 provenance)
docs/agent-logs/ST/gander-studio-p11-v2-vision-t1.md (3-stage checkpoint log)
docs/agent-logs/ST/latest.md (overwritten copy per checkpoint protocol)
No packages/* files modified. No writes to docs/events/*.jsonl. No stat implementation, UI, or mockup
produced (out of scope per packet, deferred to t3/t4).
  </generated_files>
</statistical_report>
