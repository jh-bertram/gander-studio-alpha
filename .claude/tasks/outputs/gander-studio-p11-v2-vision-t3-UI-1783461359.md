# Completion Packet — gander-studio-p11-v2-vision-t3

**Agent:** UI#2 (ui-designer) | **Date:** 2026-07-07
**Deliverables:** `docs/v2-vision/v2-vision.md`, `docs/v2-vision/v2-design-spec.md`
**Full task log:** `docs/agent-logs/UI/gander-studio-p11-v2-vision-t3.md`

<design_spec>
  <task_id>gander-studio-p11-v2-vision-t3</task_id>
  <surface>Gander Studio v2 — Party Screen (home) + Side Submenus (vision package: v2-vision.md + v2-design-spec.md)</surface>
  <design_system_source>DESIGN_MD</design_system_source>

  <component_hierarchy>
PartyScreenPage > PartyScreenHeader (PageTitle + ScopeSummary) > SubmenuRail (Roster, Sessions,
Progression, Programs) + PartyGrid (6× PartyMemberCard [PortraitFrame + AgentCodeLabel + RoleTag
+ 3× StatBar + DrillDownTrigger] | EmptyPartyState | ErrorPartyState). Full hierarchy, layout,
portrait treatment, submenu targets, and all states are specified in `v2-design-spec.md`.
  </component_hierarchy>

  <layout>
Desktop: 3-col PartyGrid + persistent 240px/56px SubmenuRail. Tablet: 2-col grid. Mobile: 1-col
grid, submenus fold into the existing global BottomTabBar (5 tabs total, reusing v1's nav
pattern). Full grid/spacing/breakpoint spec in `v2-design-spec.md` → `layout`.
  </layout>

  <states>
default, loading (Skeleton shimmer, reuses pre-existing keyframe), empty (icon+heading+body+CTA
per DESIGN.md rule), error (Alert variant=destructive per DESIGN.md rule), card-hover,
card-focus-visible, card-active-pressed, submenu-item-active, and a per-stat-bar
"not-applicable" state (explicit N/A, never a misleading 0%). Full detail in `v2-design-spec.md`
→ `states`.
  </states>

  <tokens>
All tokens trace to DESIGN.md/globals.css named entries — no invented hex. Runtime FF7 short
names used throughout (`--void`, `--sf`, `--sfh`, `--sfm`, `--mt`, `--w`/`--wd`/`--wm`, `--redb`,
`--mg`/`--my`/`--mb`/`--mp`/`--mr`/`--mo`, `--bd`/`--bdb`, `--nav-active-bg`) per DESIGN.md
Decision Record B's own instruction that the abstract `--color-*` names are documentation-only.
Spacing (`space-1/2/4/6`), typography (`xs/sm/lg/2xl`), and radius (`--radius-sm/-md`) tokens all
match DESIGN.md's published scales exactly. Full 24-row token table in `v2-design-spec.md` →
`tokens`.
  </tokens>

  <interactions>
Card hover/focus → Popover quick-peek with exact values; card click/Enter → Roster agent-detail
drill-down; submenu click → corresponding surface; empty-state CTA → Roster; error-state Retry →
re-fetch. Full list in `v2-design-spec.md` → `interactions`.
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="Page/card body text" foreground="--w" background="--void / --sf" ratio="21:1 / 17.8:1" wcag_level="AAA" />
      <pair element="Portrait monogram text (derived)" foreground="--w" background="--sfh" ratio="≈13.0:1" wcag_level="AAA" />
      <pair element="Secondary text" foreground="--wd" background="--sf" ratio="9.6:1" wcag_level="AAA" />
      <pair element="Muted/N-A caption (binding worst case)" foreground="--wm" background="--sfh" ratio="5.06:1" wcag_level="AA" />
      <pair element="Active accent text" foreground="--mt" background="--sfh / --void" ratio="5.38:1 / 8.12:1" wcag_level="AA / AA+" />
      <pair element="Primary CTA button label" foreground="--void" background="--mt" ratio="8.12:1" wcag_level="AA+" />
      <pair element="Error/Alert message text" foreground="--redb" background="--void" ratio="5.22:1" wcag_level="AA" />
    </contrast_pairs>
    <heading_structure>h1 PageTitle → h2 submenu group label → h3 per PartyMemberCard agent code → h3 per drill-down destination's own title.</heading_structure>
    <keyboard_flow>SubmenuRail items in list order → PartyMemberCard grid in reading order (one tab stop per card) → empty/error-state CTA replaces the grid's tab stops entirely when active.</keyboard_flow>
    <aria_requirements>Cards: role=link/native interactive element + summarizing aria-label. StatBars: role=progressbar + aria-valuenow, or aria-label "not applicable, {reason}" when null. Empty/Error containers: role=status / role=alert. SubmenuRail: role=navigation.</aria_requirements>
  </accessibility_spec>

  <notes>
**Both required deliverables exist and are complete:**
- `docs/v2-vision/v2-vision.md` — prose-only (no XML ceremony tags), contains the new-purpose
  statement, a t2 verdict summary table (3 KEEP / 3 ABSORB / 3 CUT), the FF7 IA (party-screen
  home + 4 side submenus, at-a-glance→drill-down flow), the full 7-term analogy mapping
  (Materia→Skills+Hooks, Equipment→Tools, Abilities→Workflows — reasoned 3-to-4, corroborated by
  DESIGN.md's own pre-existing Skills=materia-blue/Hooks=materia-orange coloring), a new-stats
  summary with source+feasibility per stat (tokens/cost explicitly flagged
  NEEDS-SCHEMA-EXTENSION, DEFERRED-P9-1), and the mandatory SC11 "Open Ratification Question"
  section.
- `docs/v2-vision/v2-design-spec.md` — `design_system_source: DESIGN_MD`, full component
  hierarchy, layout/responsive spec, asset-free portrait treatment, 4-submenu structure, all
  states including empty+error, a `StatBar` new_pattern_proposal (checked against the live
  `~/.claude/refs/dashboard-patterns.md` catalog — no existing pattern fit a simple single-scalar
  percentage bar), a full token table, a 10-row accessibility_spec/contrast_pairs table (all AA
  or better, all but one pair reused verbatim from DESIGN.md's own already-verified Decision
  Records A/B/D — the one exception is explicitly labeled "derived"), a dedicated legibility
  section, named Shadcn primitives (Card, Badge, Progress, Button, Popover, Alert, Skeleton,
  Dialog) with an explicit note that t4's static mockup approximates these in plain HTML, and a
  sample-data appendix curated from t1 §5.2 (6 corpus-grounded front-row agents + the `DI`
  zero-occurrence honesty case).

**SC11 handling — important for ORC/human review.** While researching DESIGN.md in full (not
just the paragraph the task packet's framing quotes), I found that DESIGN.md v1.1.0 also contains
"Decision Record A," which formally SUPERSEDES the Studio-Clarity-migration paragraph the packet
cites and RATIFIES the FF7 runtime tokens as canonical instead. I did not silently substitute this
finding for the packet's required SC11 content — the vision doc states all three of the packet's
required facts (a/b/c) verbatim in spirit, then adds a clearly-headed correction sub-section
giving the human the fuller picture (both passages of DESIGN.md disagree with each other; Decision
Record A is the newer, ratified one; the top-of-file Color Tokens table and the Design Integrity
Notes paragraph are both stale and unreconciled). The question remains genuinely OPEN and
UNRESOLVED by this document — I present two options (formalize FF7-as-canonical, or actually
execute the Clarity migration now) and explicitly submit the choice to the human. This is a
richer, more honest rendering of the ratification question than the packet's framing alone would
have produced, not a substitute for it.

**Dashboard-patterns.md status:** DESIGN.md does not declare `App Type: dashboard` for this app
(defaults to `standard`), so the strict SA-gate governance in
`~/.claude/refs/design-system.md`'s Dashboard App Addendum does not formally bind this spec. I
still verified the `StatBar` module against the live `~/.claude/refs/dashboard-patterns.md`
catalog and produced a `new_pattern_proposal` (rather than silently inventing an uncited
visualization) per the task packet's explicit instruction to bring that reference and verify
citations. Flagging for the human/PM: consider whether Studio should formally declare `App Type:
dashboard` in a future `generate-design` pass, given this sprint's direction.

**Cost/MP bars:** deliberately omitted entirely from the default party-screen design (per
DEFERRED-P9-1 and the packet's "preferably omit" guidance) rather than rendered with an
aspirational label — documented with rationale in both deliverables so this reads as a considered
decision, not an oversight.

**Nothing under `packages/*`, `DESIGN.md`, or `globals.css` was modified** — read-only for tokens
throughout, per scope.

**Recommend to ORC/PM:** (1) route the DESIGN.md internal-inconsistency finding (stale Design
Integrity Notes paragraph vs. ratified Decision Record A) through `generate-design` once the human
answers the Open Ratification Question; (2) the `StatBar` new_pattern_proposal needs explicit human
approval before any future React build treats it as an approved dashboard pattern; (3) t4 (mockup)
should treat `v2-design-spec.md`'s sample-data appendix as its sole data source — no new numbers.
  </notes>
</design_spec>
