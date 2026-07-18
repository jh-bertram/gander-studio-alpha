<plan_critique>
  <plan_id>prog-studio-v2-2026-07-s1-data-layer</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>prog-studio-v2-2026-07-s1-data-layer-t4</task_ref>
      <description>
t4 assumes the code→agent-spec mapping is derivable from disk and forbids a hardcoded map:
"Derive the code→spec mapping from disk (parseAllAgents(ganderRoot) — match each spec to its role
code; do NOT assume a hardcoded name map)". This is unimplementable — no disk field links a ROSTER
code to a spec. Verified:
- `AgentSchema` (packages/shared/src/schemas.ts:4-14) carries `name` ('frontend-engineer',
  'code-auditor', 'critic', 'db-specialist', 'archivist'...), `filePath`, `tools` — but NO 2-letter
  role-code field. parseAllAgents cannot yield 'FE'/'AU'/'CR' from a spec.
- The connectivity graph edges (gander/docs/connectivity-graph.json, edges[] from line 1796) are
  keyed by spec FILE PATH (source: '.claude/agents/auditor.md') with `type` in
  {references_skill, invokes_skill, triggers_hook, spawns, ...} — NOT by role code.
- The event log agent_ids use codes ('FE#1','AU#1'), which appear NOWHERE in the specs or the graph.
- Initials-derivation does not save it: 'db-specialist'→DS and 'frontend-engineer'→FE happen to work,
  but 'code-auditor'→CA≠AU, 'critic'→C≠CR, 'archivist'→A≠AR, 'ui-designer'→UD≠UI,
  'researcher'→R≠RA, 'orchestrator'→O≠ORC. There is no reliable rule.

Consequence: following the packet literally, t4 cannot match any code to a spec, so `equipment`
(spec.tools), `materia` (edges where source==spec path) and `relationships` (spawns/communicates_with
edges) come back EMPTY + a dataQualityNote for ALL 13 agents — not just DI. SC4 and the entire
`s1-to-s3-agentdetail-schema` seam ship hollow; only roster metadata + event-derived qualityStats
would be populated. This is the app's silent-under-delivery class dressed as "graceful fallback."
The PM half-flagged it (risk_flags: "may need a small documented map") but the packet instruction
actively steers the BE away from the only viable solution.
      </description>
      <required_revision>
Give t4 a sanctioned, single-source code→spec mapping and delete the contradictory "do NOT assume a
hardcoded name map" clause. Preferred: extend t1's `ROSTER` (already an acknowledged static catalog —
"DI has zero corpus so it CANNOT be derived from data — embedded verbatim") with a per-code spec
identifier (e.g. `specName: 'frontend-engineer'` and/or `specPath: '.claude/agents/frontend.md'`) for
the 12 codes that have a spec; DI stays spec-less → the existing no-spec dataQualityNote path. Then
t4 resolves code→spec via ROSTER (matching parseAllAgents `name`/`filePath` and connectivity node/edge
source paths against that identifier). Update t1 SC4 to assert the new ROSTER field is present for the
12 spec-backed codes, and t4 SC2/SC4 to assert materia/equipment/relationships are non-empty for at
least one real spec-backed agent (e.g. AU or FE) against a fixture — so an all-empty result FAILS
rather than passing as "graceful."
      </required_revision>
    </challenge>

    <challenge>
      <type>DEPENDENCY</type>
      <severity>WARNING</severity>
      <task_ref>SPRINT</task_ref>
      <description>
The binding seam `s1-to-s2-party-schema` (orchestrator_brief line 24) states "procedure
roster.getParty → PartyMember[] sorted by activity recency." The PM changed the return to a
`PartyStatsSchema = {members, diagnostics, activityAnchor}` envelope (t1/t3), justified inline as G5
resolution #1 (citing the seam ALSO names `PartyStatsSchema`, SC3's "surfaced diagnostics" requirement,
and the in-codebase `session.list {sessions, skipped}` precedent). This is a coherent reading — the
seam naming PartyStatsSchema as an owned contract is otherwise orphaned by a bare-array interpretation,
and s2 will import the real schema this sprint defines, so runtime breakage risk is low. But the seam
text is BINDING and program-manifest seam amendments are ORC-owned, not PM-owned. Two residual risks:
(a) s2 could be decomposed against the literal "PartyMember[]" seam and expect `.data` to be an array;
(b) a strict REQVAL reading of SC1 ("returns PartyMember[]") could mark PARTIAL against an envelope.
      </description>
      <required_revision>
Not a code change to this sprint. ORC records a one-line seam-interpretation note in the program
manifest / s2 orchestrator_brief: `roster.getParty` returns `PartyStatsSchema`, and the seam's
"PartyMember[] sorted by activity recency" refers to its `.members` field/ordering. Ensures s2
planning and REQVAL validate against the envelope, not the bare array. PM should surface this to ORC
in the dispatch handoff.
      </required_revision>
    </challenge>

    <challenge>
      <type>SCOPE_DRIFT</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s1-data-layer-t4</task_ref>
      <description>
The seam `s1-to-s3-agentdetail-schema` names `abilities` (workflows with provenance paths) as a
deliverable field. t4 correctly determines no durable per-agent workflow source exists on disk
(`.claude/agents/tasks/workflows/*` is throwaway scaffolding per standards.md; connectivity node types
carry no `workflow`) and returns `abilities:[]` + a surfaced dataQualityNote. This is honest and the
right anti-fabrication posture — but it means the `abilities` seam field is structurally empty for
every agent this sprint, so s3's Abilities drilldown UI will render empty across the board. The PM
flagged this in risk_flags; it is not consultation-blocked.
      </description>
      <required_revision>
Surface to ORC/human before s3 is planned: confirm whether `abilities` should (a) remain a
reserved-empty slot this sprint (current plan — acceptable), or (b) map to an alternative durable
source (e.g. workflow-type skills). No change to t4's implementation required; this is an expectation
alignment so s3 does not plan a populated Abilities panel against an always-empty field.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
1. **Hollow getAgentDetail (the BLOCKER's audit face).** Even after the mapping fix, the auditor's QA
   must verify `equipment`/`materia`/`relationships` are non-empty for at least one real spec-backed
   agent — an all-empty-but-noted result will otherwise pass as "graceful silent-empty handling" while
   actually delivering nothing. Ensure the t4 fixture asserts populated materia/equipment for a known
   agent (AU or FE), not just the DI no-spec path.
2. **Attribution-flip gate-role canonicalization.** t2 excludes gate roles (AU/CR/ORC) as the audited
   implementer via `canonicalizeRole(roleOf(...))`. Confirm the fixture exercises a multi-instance
   same-role case (e.g. FE#1 and FE#2 in one family both rolling to FE) so instance-suffix stripping is
   proven, not just gate≠implementer — roleOf covers the mechanism (t1 SC4) but no t2 fixture asserts it
   end-to-end through the flip.
3. **DRY / no-hardcoded-corpus-number discipline** is well guarded (activityAnchor measured live, no
   locked 46) — low risk, but the auditor will grep party-roster.ts for stray literals.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
Read: gander-studio-p11-v2-vision.md (most recent) §4/§5/§6 — recurring class is subagentstop-complete-miss
(hook/ORC-owned, not in this plan's control) + prose-rule-bypass (defended); §6 G5 spec-internal-
inconsistency directly relevant and the PM pre-addressed it via declared G5 canonical-section resolutions.
Consulted session-data-inventory.md §2.1/§2.2/§2.3/§4 (attribution flip, ghost rate, event coverage, DI
zero-corpus + AU/AUD/AUDITOR 3-prefix flag). PM declared 4 <recurring_pattern> elements (Step 0.5) — the
MISSING_RECURRENCE_DECLARATION block does NOT apply. sc-precheck report attached (0 findings); no
MISSING_SC_PRECHECK_REPORT block. Jidoka-lite codebase facts VERIFIED on disk: matchesSlug/sprintRoot exist
(session-slug-match.ts:14,72); readEventLogEntries/parseEventLogFiles exist and rosterRouter absent (clean
insertion point); SESSIONS_SOURCE_DIRS comma-split multi-root confirmed (env.ts:35-45, router iterates);
connectivity read at router.ts:692 (GANDER_ROOT/docs/connectivity-graph.json); fixture 2026-03-28.jsonl
seq7 HCG_RESOLVED confirmed (resolved_by present, agent_id absent) — matches the malformed-line claim; the
"12 specs / DI has none" fact holds and is the very fact that exposes the code→spec BLOCKER.
  </post_mortem_patterns_checked>
</plan_critique>

CRITIQUE_BLOCK
