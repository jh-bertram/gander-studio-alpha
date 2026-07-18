# Studio v1 Critique — KEEP / ABSORB / CUT Triage

**Task:** `gander-studio-p11-v2-vision-t2`
**Author:** UI Designer (UI#1)
**Scope:** Critical triage of Studio v1's 9 existing surfaces, measured against the v2 purpose. This is a
critique document that feeds the v2 information architecture (t3) — it is **not** the v2 design itself, and
it does **not** re-audit or re-verify any code-level bug.

---

## The v2 Review-Purpose Lens (read this first)

Every verdict below is measured against a single question:

> **Does this surface serve REVIEWING the team's stats, contributions, and past performance — at a glance,
> with drill-down — or does it serve COMPOSING/PREPARING a loadout for upcoming project work?**

Studio v1 was built around the second half of that question: browse a catalog, drag agents/skills/hooks
onto a canvas, edit their specs, export the result. That workflow's premise — that a human manually
assembles a loadout before starting project work — is what the human has now automated. Studio v2's stated
purpose is the first half: **an at-a-glance review of how the team (and each agent) has actually performed**,
with the ability to dig into any surfaced number.

A surface is judged on what it does for that review purpose **today**, not on the compose-era rationale it
was originally built to serve. A surface that was a correct answer to "how do I prepare a project?" can
still be the wrong surface for "how did my team do?" — that reclassification, not a functionality re-audit,
is the entire content of this document.

---

## Method / Provenance

This critique draws on:
- `CLAUDE.md` (repo root) — the 9-surface table and tRPC procedure list, verified current.
- `.claude/agents/tasks/outputs/gander-studio-meta-fable-eval-ORC-EVAL-1781056770.md` — the Fable
  recon/synthesis, used **only** for its structural sections (§2 leverage gaps, §3 juice concentration, §4
  redundancy/drift ledger, §5 cross-cutting themes). Its confirmed-defect ledger (D1–D8) is **not** re-cited
  here: those bugs (dead Export, stub Edit-save, editor cross-session contamination, invisible ExportPage
  inputs, silent-empty slug matching, etc.) were already fixed and merged by `prog-studio-vision-2026-06` —
  re-auditing them is explicitly out of scope for this task.
- `docs/after-actions/gander-studio-p9-sessions-feed-agentstats.md` — the current (post-fix) state of the
  Sessions surface, since it is the surface most directly implicated by the review-purpose shift.
- `DESIGN.md` (v1.1.0, 2026-06-20) — read for `design_system_source: DESIGN_MD` compliance. This document
  introduces no new visual tokens (it is a structural triage, not a layout spec); the FF7-vs-Studio-Clarity
  palette tension DESIGN.md carries is explicitly t3's SC11, not this task's concern.

---

## Structural Evidence Cited (ORC-EVAL, design evidence only)

Four structural observations from the ORC-EVAL synthesis recur through the verdicts below:

1. **Surface sprawl / weak cross-linking (§2).** The app exploits "~5 of ~15" on-disk data sources through
   7+ largely independent viewers with "no cross-surface entity linking — the joins that would turn 7
   viewers into one explorable world." Several v1 surfaces exist as standalone catalogs/graphs precisely
   because nothing links them to the data that would make them review-relevant.
2. **Juice concentrated entirely in Compose (§3).** "Delight is concentrated entirely in the Compose
   canvas... None of it has propagated to the observability surfaces." The one surface with real
   interaction craft is also the one surface a review-first product needs least.
3. **Redundancy / drift ledger (§4).** Multiple parallel implementations of the same concept (role→color
   classification, per-agent aggregation, formatting helpers) accumulated across surfaces that grew
   independently — direct evidence of "larger than originally envisioned."
4. **Density-as-requirement, review-as-replay (§5).** "The human frames the product as a playful
   game-replay viewer... and declutters aggressively... density management is a product requirement." This
   is the standing instruction this triage optimizes toward: fewer, denser, drill-down-capable surfaces —
   not more tabs.

---

## Per-Surface Verdicts

### 1. Browse (`/`) — **ABSORB**
**Target:** the v2 party-screen roster + per-agent equipment/materia drill-down.

Browse's card grid is a compose-era catalog — "which agent/skill/hook could I select for a build." Under
the review lens its actual payload (the roster, and each agent's declared skill/hook loadout) is exactly the
"who's on the team, what do they carry" data a party screen needs; it just needs to be reframed as a
drill-down rather than a selection tool. ORC-EVAL §2.9 additionally notes Browse already covers only 3 of 7
`.claude` subresource types, evidence it under-delivers even on its own original catalog terms.

### 2. Compose — **CUT**

Compose is the compose-era surface by name and function: a drag-drop canvas for manually assembling a
loadout before project work. The v2 purpose statement says that workflow is "now largely automated," which
removes Compose's reason to exist as a top-level tab. ORC-EVAL §3 shows Compose is also where essentially
all of the app's visual delight lives, with none of it propagated outward — a signal that its *interaction
language* (glassy materia orbs, magnetic snap) is a design lead worth a future look, but that is a t3
decision, not a reason to retain the composing workflow itself.

### 3. Edit — **ABSORB**
**Target:** Progression's agent-detail drill-down, as a "revise this agent's spec" action.

Edit is a freestanding markdown editor for agent/skill specs — another compose/prepare tool. ORC-EVAL §2.8
names `agent-changelog.md` ("cause → effect of spec bumps") as "the missing half of Progression": the
review-relevant use of editing is revising a spec *in response to* a performance review just surfaced, not
editing in the abstract. That pairing argues for the edit action living inside the agent-detail drill-down
where the history is already on screen, not as an independent top-level catalog tool.

### 4. Export — **CUT**

Export packages a manually-composed loadout for use in an external project — the terminal step of the
compose pipeline. With loadout preparation now automated, there is nothing left to export in a review-first
product; this is the most purely compose-only surface of the nine.

### 5. Sessions (List + Detail) — **KEEP**

Sessions already *is* the surface the v2 purpose statement describes verbatim: per-sprint post-mortems,
event-log-synthesized stats, and role-aware per-agent contribution cards
(`docs/after-actions/gander-studio-p9-sessions-feed-agentstats.md`). It is also the most recently and
heavily invested-in surface in the app's history — a dedicated fix phase (p8) plus a full feed/role-aware
rebuild and adaptive wall-clock formatting (p9) — because it is the review surface. v2 should anchor on
Sessions, not replace it; if anything it is the strongest candidate to become (or feed) the party-screen home
itself.

### 6. Graph — **ABSORB**
**Target:** the same party-screen equipment/materia drill-down Browse feeds (as the relationship/connectivity
layer within it).

Graph renders static agent/skill/hook connectivity — structurally useful, but it is not itself performance
or history data. ORC-EVAL §2.10 names precisely this gap: "no cross-surface entity linking — the joins that
would turn 7 viewers into one explorable world." Graph's best use under the review lens is as the
relationship layer inside an agent's drill-down (which materia/equipment this agent carries, and how it
connects to others) rather than a standalone top-level tab competing for at-a-glance attention.

### 7. Progression — **KEEP**

The XP ledger timeline is literally "how the team has performed prior" — squarely the v2 purpose. ORC-EVAL
§3.4 flags that it currently under-delivers on presentation (no character-sheet juice: XP bars, count-up,
level-up treatment) and §2.8 flags its missing agent-changelog half, but neither is a keep/cut question —
the surface and its underlying data are core review material. Both gaps are enhancement leads for t3, not
grounds to cut or absorb it.

### 8. Planning — **CUT**

Planning surfaces the backlog (`deferred-work.md`) and sprint scheduling (`task-registry.md`) — explicitly
forward-looking "what should we prepare to work on next" content, exactly the half of the product the v2
purpose statement calls "now largely automated" and de-prioritized. Its one retrospective sliver (per-sprint
status) duplicates data Sessions already synthesizes from the event log, so cutting it loses nothing
review-relevant.

### 9. Programs — **KEEP**

Programs renders the multi-sprint program DAG — roster, `depends_on`, tiers, and integration seams for a
delivered or in-flight program. That is genuine participation/contribution history across a program, not a
scheduling tool. ORC-EVAL §2.2 originally flagged program DAGs as a completely unrendered "Agent OS" gap
("`program-map.html` lives outside the app"); this surface exists specifically to close that gap and should
carry forward as one of the review surfaces. (ORC-EVAL §2.10's cross-linking gap applies here too — a t3
IA concern, not a keep/cut question.)

---

## Verdict Summary

| # | Surface | Verdict | Target (ABSORB only) |
|---|---------|---------|------------------------|
| 1 | Browse | ABSORB | party-screen roster + agent equipment/materia drill-down |
| 2 | Compose | CUT | — |
| 3 | Edit | ABSORB | Progression agent-detail drill-down (spec-revision action) |
| 4 | Export | CUT | — |
| 5 | Sessions (List+Detail) | **KEEP** | — |
| 6 | Graph | ABSORB | party-screen equipment/materia drill-down (relationship layer) |
| 7 | Progression | **KEEP** | — |
| 8 | Planning | CUT | — |
| 9 | Programs | **KEEP** | — |

**Totals: 3 KEEP, 3 ABSORB, 3 CUT.**

All 3 CUTs (Compose, Export, Planning) are the surfaces whose primary function is preparing/scheduling
future work — precisely the half of the product the human says is now automated. All 3 ABSORBs (Browse,
Edit, Graph) are reference/structural surfaces that carry no performance history of their own; their data
is real and worth keeping, but as drill-down content inside the review surfaces, not as competing top-level
tabs. The 3 KEEPs (Sessions, Progression, Programs) are, not coincidentally, the only three v1 surfaces
whose core content is *what already happened* — stats, contributions, and past performance.

This is a structural halving of the top-level surface count (9 → at most 3, with 2 absorption targets
folding into their drill-downs), which directly answers the human's complaint that the app has grown
"larger than originally envisioned" and that "presentation and organization has become a bit complicated" —
consistent with ORC-EVAL §5's finding that the human declutters aggressively and treats density management
as a product requirement, not a nice-to-have. The specific shape of the resulting IA (party-screen layout,
submenu structure, which surface becomes the "home") is t3's design job, not this document's.

---

## Notes for t3

- This document intentionally stops at verdicts + rationale. It does not propose a component hierarchy,
  page layout, or navigation structure — that is `gander-studio-p11-v2-vision-t3`'s scope.
- Two ABSORB targets (Browse, Graph) converge on the same drill-down family (per-agent equipment/materia
  detail) — t3 may choose to treat them as one merged drill-down rather than two, but that is t3's call.
- Sessions (KEEP) is flagged as the strongest existing candidate to anchor or feed the v2 "party screen"
  home, given it is both the most purpose-aligned and the most recently hardened surface — a lead for t3,
  not a decision made here.
