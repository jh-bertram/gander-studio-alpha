# Gander Studio v2 Vision — From Composing to Reviewing the Team

**Sprint:** `gander-studio-p11-v2-vision-t3` | **Author:** UI Designer (UI#2) | **Date:** 2026-07-07
**Synthesizes:** `docs/v2-vision/session-data-inventory.md` (t1 — new-stats catalog) and `docs/v2-vision/v1-critique.md` (t2 — v1 keep/absorb/cut triage)
**Companion document:** `docs/v2-vision/v2-design-spec.md` — the structured spec the mockup implements

This document is a design vision, not a decision record. It proposes a direction; it does not
authorize anything to be built, and it explicitly does not decide the one open question flagged
in its final section.

---

## The New Purpose

Studio v1 was built for a moment when a human manually assembled a loadout before starting
project work: browse a catalog of agents, skills, and hooks; drag pieces onto a canvas; edit
their specs; export the result. That moment has passed. Loadout preparation is now largely
automated, and the human has said so directly: less time spent preparing to work with Gander,
more time spent understanding how the team has actually performed.

Studio v2's purpose is a review surface, not a workbench. Its job is to answer, at a glance,
"how did my team do?" — and to let the human dig into any individual number until the answer is
as detailed as they want it to be. Every design decision in this document is judged against that
question, not against the compose-era rationale that shaped v1.

## What v1 Taught Us

`v1-critique.md` (t2) triaged all nine of Studio v1's existing surfaces against the review-purpose
lens above. The result is a clean split, and it is not close to even:

| Verdict | Surfaces | Why |
|---|---|---|
| **KEEP** | Sessions (List + Detail), Progression, Programs | These three surfaces' entire content is *what already happened* — per-sprint post-mortems, an XP/level-up ledger, and a multi-sprint program DAG. They are already review surfaces; v2 does not need to reinvent them, only to connect them better. |
| **ABSORB** | Browse → the party-screen roster/drill-down; Edit → the agent-detail "revise this spec" action; Graph → the same roster drill-down's relationship layer | These carry real, useful reference data (who's on the team, what they carry, how they connect, how to revise a spec) but none of it is performance history on its own. They become drill-down content inside a review surface rather than competing top-level tabs. |
| **CUT** | Compose, Export, Planning | All three exist to prepare or schedule *future* work — exactly the half of the product the human says is now automated. Nothing review-relevant is lost by removing them. |

That is a structural halving of the top-level surface count — nine tabs down to, at most, one
home plus four submenus — which directly answers the human's own complaint that the app has
grown "larger than originally envisioned" and become complicated to navigate. t2 also flagged
that Sessions, being both the most purpose-aligned surface and the most recently hardened one,
is the strongest existing candidate to anchor (or directly feed) the new home screen. This vision
takes that lead: the party screen is a fast, aggregated snapshot; Sessions remains the place you
go to read the full battle report behind any given number.

## The FF7 Menu: Party Screen + Side Submenus

The human's direction was specific and worth quoting directly: "Immediately you are greeted by
your top or active players, with the essential stats indicated with bars and a nice little
dramatic portrait. And then a few submenus listed on the side with more details about various
components." That single sentence is the whole v2 information architecture. It has two halves —
an at-a-glance home, and a drill-down side rail — and this vision keeps them exactly that
separate.

### The Party Screen (home)

The home screen is not a dashboard of everything; it is a party roster. It shows the roster's
**front row** — the six most active agent roles in the corpus by combined spawn/complete volume
(`FE`, `PM`, `AU`, `AR`, `BE`, `CR`, per the sample-data appendix in the design spec) — as a grid
of party-member cards. Six is a deliberate choice, not a round number: six cards fit in a 3-column
grid without scrolling on a standard viewport, which keeps the screen glanceable instead of
turning it into another dense table. The other seven roster codes (including `DI`, which the
corpus has literally never seen spawn — see the stats catalog below) are one click away in the
Roster submenu, not hidden, just not competing for the first five seconds of attention.

Each party-member card carries exactly three things, echoing the human's own list: a dramatic
portrait (rendered without any image asset — see the design spec for the exact treatment), an
agent code, and a small, fixed set of essential stat bars. Three bars per card, not ten — density
management is a product requirement here, not a nice-to-have (t2's ORC-EVAL citation makes this
point explicitly: the human "declutters aggressively"). Where a bar's underlying stat genuinely
does not apply to a given role (for example, "first-pass audit rate" has no meaning for a Gate
role that renders audits rather than receiving them), the bar shows an explicit "not applicable"
state rather than a misleading zero.

### The Side Submenus

Four submenus, all mapped directly from t2's verdicts:

1. **Roster** — the full 13-role catalog (absorbing Browse), where clicking any agent opens its
   detail: which skills and hooks it carries (its "equipment and materia" — see the analogy
   below), its connectivity to other agents and skills (absorbing Graph), its version history,
   and a "revise this spec" action (absorbing Edit) that opens the same editor v1 shipped, now
   reached from the context of a performance review rather than as a standalone catalog tool.
2. **Sessions** — unchanged from v1: the per-sprint post-mortem list and detail view. This is
   where "at a glance" becomes "as detailed as you want" — every stat bar on the party screen
   traces back to events this surface already renders in full.
3. **Progression** — unchanged from v1: the XP/level-up ledger timeline, now cross-linked from an
   agent's Roster detail so a spec revision and the ledger entry it produced sit next to each
   other instead of in two disconnected tabs.
4. **Programs** — unchanged from v1: the multi-sprint program DAG, showing which sprints an agent
   role has participated in across a delivered or in-flight program.

That is the whole at-a-glance-to-drill-down flow: the party screen answers "who's active and how
are they doing" in one screen; the four submenus answer "tell me everything" about any entity the
party screen surfaced.

## The Analogy: Equipment, Materia, Abilities → Skills, Hooks, Workflows, Tools

The human asked for this analogy explicitly: "how the equipment, materia, abilities influences the
character which compares to how skills and hooks and workflows and tools influence the agent." The
game side has three concepts; the agent side has four. Forcing a 1:1 correspondence would either
drop a term or invent a false equivalence, so this vision reasons through the mapping instead:

| Game concept | Agent concept(s) | Why |
|---|---|---|
| **Materia** | **Skills** (active) and **Hooks** (passive) | Materia orbs are slotted, swappable, masterable units of capability — you choose which ones to equip, and they level up with use (AP). That splits naturally into two agent-side behaviors: a **Skill** is something an agent deliberately *invokes* to produce a specific outcome (like casting a spell a materia grants) and can be tracked for a "trust score" across sprints (t1 §2.5 — directly analogous to materia mastery/AP). A **Hook** fires automatically on a lifecycle event without being chosen in the moment (`PreToolUse`, `SubagentStop`) — the agent-side equivalent of a *support* materia, the kind that silently modifies behavior (Counter, HP↔MP link) rather than being cast on demand. Notably, DESIGN.md's own Role/Materia Colors table already encodes half of this split independently of this document: **Skills are tagged materia-blue and Hooks are tagged materia-orange** — the design system already treats them as materia-class objects, not as agents.|
| **Equipment** | **Tools** | Equipment (weapons, armor, accessories) is the base gear every character carries regardless of which materia is slotted — it determines what raw actions are physically on the table. **Tools** (Read, Write, Bash, Grep, the MCP tool set, …) play the identical role for an agent: the base action-verb allowlist that exists independently of which skills or hooks happen to be assigned. Neither equipment nor tools get a "materia rainbow" color in the design system — a small, telling detail that reinforces they're a different category of thing from the slotted, colorful capability units. |
| **Abilities** | **Workflows** | Abilities are not something a character *carries* — they are the emergent battle-menu that results from combining equipment and materia (a Limit Break, a linked-materia combo like All+Cure). A **Workflow** is the same kind of thing on the agent side: not a stored asset, but an orchestrated composition of tools, skills, and hooks toward one outcome. You don't "equip" a workflow any more than you equip an ability — it's what happens when the pieces you do carry get sequenced together. |

Three game concepts, four agent concepts, one clean reasoned mapping — no term dropped, no term
forced into a slot it doesn't fit.

## New Stats for the Party Screen (grounded in the real corpus)

`session-data-inventory.md` (t1) sampled the real on-disk corpus — 22 event-log files, all 3
after-action docs, 232 agent-log journals, the agent changelog, and more — before proposing
anything new, and it explicitly did not re-propose anything v1 already surfaces (spawns,
completes, feedback loops, files touched, wall-clock time, XP ledger, connectivity graph, program
DAG). Of the new candidates t1 catalogued, the party screen leans on the two that are
strongest, cleanest, and most directly "essential stat bar" material:

| Stat | Source | Feasibility |
|---|---|---|
| **Per-implementer first-pass audit rate** (t1 §2.1) — did this agent's work clear audit without a prior fail, attributed to the *implementer* rather than the *auditor* (a genuine attribution flip from what v1's existing counters track) | `docs/events/agent-events-*.jsonl`, all 22 files, corpus-wide sample: `BE` 9/9 (100%), `FE` 22/35 (63%) | **AVAILABLE-NOW** |
| **Ghost/stall rate** (t1 §2.2) — how often an agent role spawns and never completes | `docs/events/agent-events-*.jsonl`, `GHOST_CONFIRMED` events (7 corpus-wide) | **AVAILABLE-NOW** |

Two more candidates from t1's catalog are real and worth knowing about, but did not make the
default party-screen card — they're better suited to the Roster/Progression drill-downs than to a
three-bar-per-card home screen: **skill invocation value-rate** (t1 §2.5, a "materia mastery"
signal directly reinforcing the analogy above) and **agent spec version-bump history** (t1 §2.9,
the "ability learned" log entries that pair naturally with Progression's existing XP ledger). Both
are flagged for the design spec's drill-down layer, not dropped.

**The tokens/cost gap.** t1 was explicit, per its packet's mandate: any tokens-per-agent, cost, or
"MP-style" economics stat is **NEEDS-SCHEMA-EXTENSION**, full stop (DEFERRED-P9-1 — the event log's
`EventLogEntrySchema` carries no token field; the one place real token numbers exist in the entire
corpus is a single hand-reconstructed historical sprint report, not a durable, queryable source).
The natural FF7 metaphor for cost is an MP bar, and it is tempting — but this vision deliberately
**omits an MP bar from the party screen** rather than rendering one that looks real but isn't. If
tokens-per-agent ever becomes a durable, schema-backed stat, an MP bar is an easy, well-motivated
future addition; until then, showing nothing is more honest than showing a number nobody can trust.

## Open Ratification Question — FF7 Identity vs. the Studio Clarity Migration

This section names a palette-direction tension that this vision does **not** resolve. It is
submitted to the human for ratification — not decided by this sprint, this document, or the
designer who wrote it.

**(a)** DESIGN.md v1.1.0's "Design Integrity Notes" section states a migration direction in plain
language: "Studio Clarity replaces [the legacy FF7 tokens] with semantic `--color-*` tokens...
legacy tokens should be removed file-by-file as components are updated." Read at face value, that
is a ratified plan to retire the FF7 runtime tokens (`--void`, `--sf`, `--mt`, …) in favor of new
semantic names (`--color-bg`, `--color-surface`, `--color-primary`, …).

**(b)** This v2 vision leans *into* the FF7 identity, not away from it. The party screen above is
not a superficial reskin — the entire product concept (party screens, materia, drill-down
submenus) is the FF7 game-menu metaphor, and the accompanying design spec names FF7 runtime
tokens (`--void`, `--sf`, `--sfh`, `--mt`, the six materia colors, `--w`/`--wd`/`--wm`, `--redb`)
as its literal, load-bearing vocabulary. If the migration described in (a) is read as the
currently binding direction, v2's FF7-forward identity would reverse it — or, at minimum, carve
out a scope exception for the new party-screen surfaces.

**(c)** Whether Studio v2 should formally re-embrace the FF7 runtime token system as canonical,
resume the Studio Clarity migration and re-skin v2 in the new semantic tokens instead, or split
the difference (FF7 for the game-flavored party screen, Clarity for administrative surfaces like
raw Sessions detail) is **submitted to the human for ratification**. It is not decided by this
sprint, by the design spec that accompanies this document, or by the designer.

### A correction the human should see before deciding

Reading DESIGN.md in full — not just the Design Integrity Notes paragraph quoted in (a) — surfaces
a complication worth knowing about before ratifying anything. The same file, same version
(v1.1.0), also contains **Decision Record A**, dated the same day as the Design Integrity Notes
text (2026-06-20), whose status line reads: *"RATIFIED — supersedes the Studio Clarity migration
direction for this token set."* Its Supersession Statement is direct: *"The Studio Clarity
migration is formally superseded... [the Design Integrity Notes] may not [be] treat[ed]... as a
currently-active directive."* Decision Record A's own reasoning: at the time it was written,
roughly 102 component and constant usage sites already referenced FF7 runtime tokens directly, and
the `--color-*` semantic names had (and still have) zero CSS usage sites anywhere in the codebase.
The Clarity migration described in (a) was written down, never executed, and was later formally
reversed by a ratified decision record within the same document.

So the honest state of play is: **two passages inside the same DESIGN.md disagree with each
other**, and the newer, explicitly-ratified one (Decision Record A) has not been reconciled back
into the older paragraph or into the top-of-file Color Tokens table, both of which still describe
the semantic `--color-*` system as if it were live. Given that, this vision's FF7-forward stance
reads less like a reversal of a currently-binding migration and more like an extension of a
direction DESIGN.md already ratified once — but the stale, unretracted paragraph is still sitting
in the file, which is itself worth the human's attention independent of what v2 does. There is
also a smaller wrinkle worth flagging: even the abstract Color Tokens table's own `--color-primary`
value (`#4a8fa8`) no longer matches the current runtime `--mt` value (`#6db0c8`, lightened by
Decision Record B's contrast remediation after the table was written) — so the two systems have
drifted in more than just name.

**What is actually being submitted to the human, precisely:** whether v2's party-screen surfaces
(and, if the human likes the direction, the rest of Studio) should use the FF7 runtime token names
directly as their canonical, documented vocabulary — formalizing what Decision Record A already
made true at the CSS layer — or whether the human wants to actually execute the Studio Clarity
semantic-token migration now, per Decision Record A's own closing instruction ("future sprints...
must author a new decision record and a phased component-migration plan"). Note that, today, the
two choices render *identically* — the Shadcn `@layer base` remap already routes the semantic
Shadcn tokens through `var(--mt)` and friends — so this is presently closer to a
naming/documentation-hygiene decision than a visual one. It stops being purely cosmetic the moment
either side starts assigning new hex values under one name and not the other, which is exactly why
it needs a ratification decision now rather than a default. Recommend routing the DESIGN.md-hygiene
cleanup (reconciling the stale paragraph and the top Color Tokens table with whatever the human
decides) through `generate-design` once this question is answered.

---

*This document and its companion, `docs/v2-vision/v2-design-spec.md`, are a design proposal only.
No implementation work is authorized by either file. The next step, per the sprint's dependency
order, is a static mockup (t4) realizing the design spec, followed by human ratification of the
whole package — including the question above.*
