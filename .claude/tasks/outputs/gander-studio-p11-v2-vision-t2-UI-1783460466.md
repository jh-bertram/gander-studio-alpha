# Completion Packet — gander-studio-p11-v2-vision-t2

**Agent:** UI#1 (ui-designer)
**Task:** `gander-studio-p11-v2-vision-t2` — critical KEEP/ABSORB/CUT triage of Studio v1's 9 surfaces
measured against the v2 review-purpose lens.
**Deliverable:** `/home/jhber/projects/gander-studio-alpha/docs/v2-vision/v1-critique.md`
**Agent log:** `docs/agent-logs/UI/gander-studio-p11-v2-vision-t2.md` (Stage 1/2/3 complete)

---

<design_spec>
  <task_id>gander-studio-p11-v2-vision-t2</task_id>
  <surface>Studio v1 — 9-surface KEEP/ABSORB/CUT triage (pre-v2-vision critique document, not a rendered UI)</surface>
  <design_system_source>DESIGN_MD</design_system_source>

  <review_purpose_lens>
    Stated up front in the deliverable: every verdict is measured against "does this surface serve REVIEWING
    the team's stats, contributions, and past performance — at a glance, with drill-down — or does it serve
    COMPOSING/PREPARING a loadout for upcoming project work (now largely automated)?" Surfaces are judged on
    what they do for that review purpose TODAY, not their original compose-era rationale.
  </review_purpose_lens>

  <orc_eval_structural_evidence source=".claude/agents/tasks/outputs/gander-studio-meta-fable-eval-ORC-EVAL-1781056770.md">
    <observation ref="§2">Surface sprawl / weak cross-linking — "~5 of ~15" on-disk data sources exploited
      through 7+ independent viewers with "no cross-surface entity linking — the joins that would turn 7
      viewers into one explorable world."</observation>
    <observation ref="§3">Juice concentrated entirely in Compose — "Delight is concentrated entirely in the
      Compose canvas... None of it has propagated to the observability surfaces."</observation>
    <observation ref="§4">Redundancy / drift ledger — multiple parallel implementations of the same concept
      (role→color, per-agent aggregation, formatting helpers) accumulated as surfaces grew independently.</observation>
    <observation ref="§5">Density-as-requirement / review-as-replay framing — "The human frames the product
      as a playful game-replay viewer... and declutters aggressively... density management is a product
      requirement."</observation>
    <usage_note>Cited for STRUCTURAL observations only. The ORC-EVAL confirmed-defect ledger (D1–D8) was
      NOT re-cited or re-verified — those bugs are already fixed and merged by prog-studio-vision-2026-06,
      per the task packet's explicit out-of-scope instruction.</usage_note>
  </orc_eval_structural_evidence>

  <surface_verdicts>
    <verdict surface="Browse" route="/" tag="ABSORB" target="v2 party-screen roster + per-agent equipment/materia drill-down">
      Compose-era catalog of agents/skills/hooks for selection; its payload (roster + each agent's loadout)
      maps directly onto a party-screen roster + equipment drill-down. ORC-EVAL §2.9: covers only 3 of 7
      `.claude` subresource types even on its own catalog terms.
    </verdict>
    <verdict surface="Compose" tag="CUT">
      The compose-era surface by name and function — manual loadout assembly, now automated per the v2
      purpose statement. ORC-EVAL §3: 100% of the app's visual delight lives here and never propagated
      outward; its interaction language is a design lead for t3, not a reason to keep the workflow.
    </verdict>
    <verdict surface="Edit" tag="ABSORB" target="Progression agent-detail drill-down (spec-revision action)">
      Freestanding markdown editor for specs — a prepare-tool. ORC-EVAL §2.8 names agent-changelog.md as
      "the missing half of Progression" (cause→effect of spec bumps), arguing edit-in-response-to-review
      belongs inside the agent-detail drill-down, not as an independent top-level tab.
    </verdict>
    <verdict surface="Export" tag="CUT">
      Terminal step of the compose pipeline (package a manually-composed loadout). Nothing left to export
      once loadout prep is automated — the most purely compose-only surface of the nine.
    </verdict>
    <verdict surface="Sessions (List+Detail)" tag="KEEP">
      Already IS the v2 purpose surface verbatim: event-log-synthesized post-mortem feed + role-aware
      per-agent contribution cards (docs/after-actions/gander-studio-p9-sessions-feed-agentstats.md). Most
      recently and heavily invested-in surface in the app's history (p8 fix + p9 rebuild + wallclock
      formatting). Flagged as the strongest lead to anchor/feed the v2 party-screen home.
    </verdict>
    <verdict surface="Graph" tag="ABSORB" target="same party-screen equipment/materia drill-down Browse feeds (relationship layer)">
      Static connectivity reference, not performance/history data. ORC-EVAL §2.10 names exactly this gap
      ("no cross-surface entity linking... one explorable world") — best use is as the relationship layer
      inside an agent's drill-down, not a standalone top-level tab.
    </verdict>
    <verdict surface="Progression" tag="KEEP">
      "How the team has performed prior" — squarely the v2 purpose. ORC-EVAL §3.4 (needs character-sheet
      juice) and §2.8 (missing agent-changelog half) are enhancement leads for t3, not keep/cut questions.
    </verdict>
    <verdict surface="Planning" tag="CUT">
      Backlog (deferred-work.md) + sprint scheduling (task-registry.md) — forward-looking prep content,
      exactly the automated-and-deprioritized half of the product. Its retrospective sliver duplicates data
      Sessions already synthesizes, so nothing review-relevant is lost.
    </verdict>
    <verdict surface="Programs" tag="KEEP">
      Multi-sprint program DAG (roster/depends_on/tiers/integration seams) = genuine participation/
      contribution history, not a scheduling tool. ORC-EVAL §2.2 originally flagged program DAGs as a fully
      unrendered gap; this surface exists specifically to close it.
    </verdict>
  </surface_verdicts>

  <triage_summary>
    3 KEEP (Sessions, Progression, Programs — the only 3 v1 surfaces whose core content is "what already
    happened"), 3 ABSORB (Browse, Edit, Graph — reference/structural surfaces folding into drill-downs), 3
    CUT (Compose, Export, Planning — prepare/schedule-future-work surfaces). Structural halving of top-level
    surface count (9 → at most 3 tabs + drill-downs) directly answers the human's "larger than originally
    envisioned / presentation and organization has become a bit complicated" complaint, consistent with
    ORC-EVAL §5's density-as-requirement finding.
  </triage_summary>

  <component_hierarchy>Not applicable — this task is a critique/triage document, not a rendered UI. No
    component hierarchy is specified here; the v2 party-screen component hierarchy is t3's deliverable.</component_hierarchy>
  <layout>Not applicable for this task (no layout was in scope; see out_of_scope).</layout>
  <states>Not applicable for this task (no interactive surface produced).</states>
  <tokens>None introduced — this is a structural triage, not a visual spec. DESIGN.md v1.1.0 was read and
    confirmed present to satisfy design_system_source: DESIGN_MD; no color/typography/spacing tokens were
    needed or applied.</tokens>
  <interactions>Not applicable for this task.</interactions>

  <accessibility_spec>
    <contrast_pairs>None — no rendered surface produced by this task.</contrast_pairs>
    <heading_structure>N/A (markdown document, not an app page).</heading_structure>
    <keyboard_flow>N/A.</keyboard_flow>
    <aria_requirements>N/A.</aria_requirements>
  </accessibility_spec>

  <notes>
    DESIGN.md is present (v1.1.0, 2026-06-20) at the repo root; design_system_source is DESIGN_MD per the
    task packet's instruction, though this document carries no visual tokens (it precedes the visual spec,
    which is t3's job). DESIGN.md's line-~123 FF7-vs-Studio-Clarity ratified-migration tension was observed
    in passing during context-gathering but is explicitly OUT OF SCOPE here — it is t3's SC11 to surface as
    an Open Ratification Question, not resolved or even discussed in this triage.

    Rationale for the two convergent ABSORB targets (Browse, Graph both folding into a party-screen
    equipment/materia drill-down): both are structural/reference data with no performance history of their
    own (a roster catalog and a connectivity graph, respectively); under the review-purpose lens neither
    earns a top-level "at a glance" slot, but both are exactly the kind of "dig deeper into assets" content
    the human explicitly wants available via drill-down. Left as a single named target family rather than
    forcing them into two distinct destinations, since t3 (not this task) owns the final IA shape.

    Sessions is flagged as KEEP with an additional lead (not a decision): given it is both the most
    purpose-aligned and the most recently hardened surface in the app, it is the strongest existing
    candidate to become or feed the v2 party-screen home. This is offered to t3 as evidence, not prescribed.

    No design-token gaps were found requiring a `generate-design` recommendation — this task did not need
    any DESIGN.md token beyond confirming its presence/version for source compliance.
  </notes>
</design_spec>
