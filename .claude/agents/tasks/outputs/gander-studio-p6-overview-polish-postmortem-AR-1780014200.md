# Archivist Output — gander-studio-p6-overview-polish-postmortem

**Task ID:** gander-studio-p6-overview-polish-postmortem  
**Agent:** AR#3  
**Timestamp:** 2026-05-29T00:37:39Z  
**Event Type:** POST_MORTEM archive_entry  

## Summary

Post-mortem archive entry appended to `docs/project_log.md` for the gander-studio-p6-overview-polish sprint. Two frontend-only visualization tweaks shipped with first-pass audit compliance. One critical tooling incident (Critic corrupting event log via unauthorized Write) surfaces two code-not-prompt protocol gaps requiring HR escalation.

## Archive Entry Content

The following XML archive_entry was appended to `docs/project_log.md` (line 1317–1449):

```xml
<archive_entry>
  <timestamp>2026-05-29T00:37:39Z</timestamp>
  <task_id>gander-studio-p6-overview-polish-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>
    Post-mortem on completed sprint gander-studio-p6-overview-polish (2026-05-28T23:28:09Z → 2026-05-29T00:23:03Z, ~55 min, 1 planning loop + 1 implementation wave). Two frontend-only visualization tweaks shipped: (1) timeline right-edge buffer folding padding inside the plot area (LEFT_PAD=48 inside plotAreaWidth, no SVG width change, preserving the documented short-session no-scroll invariant), and (2) overview agent-iteration grouping collapsing {CODE}#{n} into one card per base code with aggregated stats. Both tasks audited PASS on first submission (FE#1 + FE#2). Requirements validation: 4/4 COVERED. Verdict: PASS.

    HEADLINE FINDINGS:

    (1) **Mid-sprint tooling incident: Critic corrupted the event log.** CR#1 (a read-only review agent) executed a Read on the event log (`docs/events/agent-events-2026-05-28.jsonl`), then via a Write/overwrite call replaced the entire file with a modified version. This destroyed seqs 5–108 (unrecoverably — git has no prior snapshots). The incident was contained and reconciled via two ORC manual renumber passes, but it surfaced a catastrophic protocol gap: read-only agents must not have Write access to shared telemetry. Root cause: no hook/deny-rail prevents Write to `docs/events/*.jsonl`. Fix: GAP-1 routes to HR — implement a `PreToolUse:Write` or `settings.json` deny-rule blocking Write/overwrite to `docs/events/*.jsonl` from agents other than ORC + the SubagentStop autocomplete hook. Add spec prohibition in critic.md (and audit, dispatcher, researcher specs likewise). This is a code-not-prompt fix (structural guard, not prompt instruction).

    (2) **Event-log append race condition.** The SubagentStop hook auto-logs COMPLETE at `last_seq+1`, which collided with ORC's manually-logged SPAWN/gate events. Seqs 115, 119, 120 each appeared twice (duplicated). Manual renumber at wrap restored monotonicity. Root cause: ORC + hook both log to the same file without atomic coordination. Fix: GAP-2 routes to HR — ORC should stop manually logging COMPLETE (let hook own it); make appends atomically re-read `max(seq)+1` at write time, not at SPAWN time. Again, code-not-prompt fix (orchestrator.md behavioral change + hook implementation hardening).

    (3) **PM violates existing invariant without validation.** PM rev0 specified buffer as `svg width = contentWidth + RIGHT_PAD`, adding padding *outside* the SVG geometry. This violated the documented short-session invariant (`contentWidth = Math.max(containerWidth, …)` enforces no horizontal scroll on short sessions). Critic CR#1 blocked at plan gate; PM revised to fold padding inside (rev1 PASS). Root cause: PM reasoned about the *change* without validating against the *existing constraints* the code documents. This is a recurrence of p5 G1 ("invented API shape") — same pattern of constraint-blind planning. Fix: GAP-3 does not require code changes. PM task packets for existing-component modifications must cite the invariants/contracts the file documents and explicitly state how the change preserves each. Add to PM decomposition checklist. Next sprint should verify adoption.

    (4) **Visualization e2e used arithmetic proxies instead of geometry assertions.** Prior timeline e2e (s3/p5) used `svgWidth > scrollerWidth` and overflow-clipping heuristics instead of `boundingBox()` assertions. When FE#1 added the buffer work, `tAxisMax` overflow bug became observable (bar rendered past plot edge, previously clipped invisibly by overflow:hidden). The latent bug had shipped undetected in s3 + p5. Fix: GAP-4 codifies mandated spec practice: visualization e2e must use geometry boundingBox() assertions, not width arithmetic. FE#1 revised spec to use boundingBox and auditor verified with live assertions. No further action needed; captured as best practice.

    (5) **Scratch spec left in tests/e2e/.** FE#1 left a `debug_timeline.spec.ts` file in the audited test directory. ORC quarantined it to /tmp before audit (rm is deny-railed for agents). Not a blocker, but hygiene reminder: debug/scratch specs must be written outside tests/e2e/ or removed before COMPLETE. GAP-5 (minor). Update FE spec-hygiene section.

    AGENT PERFORMANCE:

    PM#1 rev0: 0% first-pass (blocked by Critic on invariant violation; correct revision target). PM#2 rev1: clean.
    CR#1: CRITIQUE_BLOCK (correct — short-session regression prevented); also caused GAP-1 event-log corruption.
    CR#2: CRITIQUE_PASS (targeted re-check after PM rev1; advised 2 non-blocking warnings).
    FE#1 (t1-timeline-buffer): 1/1 audit PASS. Bonus unbriefed tAxisMax overflow fix (verified correct, accepted). Minor: left scratch spec.
    FE#2 (t2-agent-grouping): 1/1 audit PASS. Pure utility + 8 unit + 3 e2e roster-agnostic. Byte-identical component guard held.
    AUD#1: Ran both tasks live; instrumented t2 fold path (73 raw agents → 15 base codes); verified tAxisMax non-regressive.
    AR#2 (first archivist run on p6): logged completion + the tooling incident.

    Recurring failure: PM plans that omit invariant validation (p5 G1 + p6 G3 = same root). Critic is currently the only gate catching this. Next mitigation: strengthen PM checklist or route to a separate constraint-audit step.

    NO POST-DELIVERY BUGS: Both tasks shipped clean; human verified in browser.

    SKILL FINDINGS: Post-mortem identifies 5 protocol gaps (GAP-1 through GAP-5). GAP-1 + GAP-2 are routed to HR (code-not-prompt fixes). GAP-3 is PM discipline (next sprint adoption check). GAP-4 is codified as best practice (no action). GAP-5 is minor hygiene reminder (update FE spec). Handoff brief docs/agent-improvements/handoff-p6-critic-eventlog-to-gander-2026-05-29.md documents GAP-1/GAP-2 findings for the gander session that owns the orchestrator/critic/settings specs.
  </rationale>
  <dependencies>
    gander-studio-p6-overview-polish (sprint: 2 FE tasks, Critic plan-gate loop, 1 tooling incident);
    gander-studio-p5-sessions-series (prior sprints s3, p5 shipping timeline e2e without boundingBox → latent tAxisMax bug);
    gander-studio-p5-postmortem (G1 constraint-blind planning identified; p6 G3 is recurrence);
    post-mortem file: docs/post-mortems/gander-studio-p6-overview-polish.md (full 8-section analysis by ORC);
    handoff brief: docs/agent-improvements/handoff-p6-critic-eventlog-to-gander-2026-05-29.md (GAP-1/GAP-2 escalation to gander HR)
  </dependencies>
  <retention_keys>
    docs/post-mortems/gander-studio-p6-overview-polish.md;
    GAP-1 (CRITICAL, code-not-prompt): Critic agent must not have Write access to docs/events/*.jsonl → implement PreToolUse:Write deny-rail in settings.json; add spec prohibition in critic.md, audit.md, dispatcher.md, researcher.md;
    GAP-2 (CRITICAL, code-not-prompt): Event-log append race (SubagentStop hook vs ORC manual logging) → ORC stops manually logging COMPLETE, hook owns it; make appends re-read max(seq)+1 atomically;
    GAP-3 (PM discipline): PM task packets must cite existing invariants and explicitly validate that changes preserve them. Add to PM decomposition checklist. Monitor p7 adoption.
    GAP-4 (codified best practice): Visualization e2e must use boundingBox() geometry assertions, not width arithmetic. Captured. No action.
    GAP-5 (minor hygiene): Scratch/debug specs must be outside tests/e2e/ or removed before COMPLETE. FE spec-hygiene reminder.
    Commits: 1b2439a (t1-timeline-buffer), 643a66a (t2-agent-grouping), 8f7903f (event-log recovery + bookkeeping), cf37023 (sprint closure), bc1d2e6 (gander handoff brief). All pushed.
    Key contracts: svg width = contentWidth (no-scroll invariant, never pad outside); plotAreaWidth = max(MIN_AREA, contentBarAreaActual − RIGHT_PAD) (pad inside); groupAgentsByBaseCode(agents) display-only utility; tAxisMax = max(maxComplete, maxSpawn) fixes latent overflow.
    Event-log incident: seqs 5–108 destroyed by CR#1 Write/overwrite; manually reconciled via two ORC renumber passes; no data loss beyond telemetry (no task artifacts affected). HR routes GAP-1/GAP-2 to prevent recurrence.
    Recurring pattern: PM constraint-blind planning (p5 G1 + p6 G3). Third intervention needed if p7 shows same pattern — escalate to hard constraint (max-file-count rule, mandatory invariant enumeration checklist).
  </retention_keys>
</archive_entry>
```

## Completion Status

- **Primary output written:** `docs/project_log.md` (archive_entry appended, lines 1317–1449)
- **Secondary output written:** `.claude/agents/tasks/outputs/gander-studio-p6-overview-polish-postmortem-AR-1780014200.md` (this file)
- **Archive entry timestamp:** 2026-05-29T00:37:39Z (from SPAWN event seq 129 in agent-events-2026-05-28.jsonl)
- **Chronological order verified:** Entry appended after prior entry closing tag (line 1315), maintaining append-only + chronological invariant

## Key Findings Summary

**Verdict:** PASS (2 FE tasks audited clean, 4/4 requirements COVERED)

**Critical Issues (routed to gander HR):**
- **GAP-1:** Critic has unauthorized Write access to `docs/events/*.jsonl` → corrupted seqs 5–108 unrecoverably. Requires `PreToolUse:Write` deny-rail + spec prohibition.
- **GAP-2:** Event-log append race between SubagentStop hook and ORC manual logging → seq duplicates. Requires atomicity fix + behavioral change to ORC.

**Discipline Issues (P6-specific, next sprint check):**
- **GAP-3:** PM rev0 violated documented short-session no-scroll invariant (same pattern as p5 G1). PM checklist must require invariant citation + validation for existing-component modifications.
- **GAP-4:** Prior timeline e2e used width arithmetic instead of boundingBox assertions → latent overflow bug lived undetected. Codified as best practice; FE#1 corrected.
- **GAP-5:** FE#1 left scratch spec in tests/e2e/. Minor hygiene reminder.

**Handoff:** docs/agent-improvements/handoff-p6-critic-eventlog-to-gander-2026-05-29.md documents GAP-1/GAP-2 for the gander session that owns infrastructure specs.
