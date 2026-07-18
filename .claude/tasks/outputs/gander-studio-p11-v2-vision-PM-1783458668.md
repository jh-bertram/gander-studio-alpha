<task_decomposition task_id="gander-studio-p11-v2-vision" agent_count="4">

<!--
  SPRINT CLASS: DESIGN-PHASE. No changes to packages/*. All deliverables under docs/v2-vision/
  and .claude/tasks/outputs/. Exit gate = human ratification of the v2 direction (ORC Step 4.5-analog).
  4 packets: (t1 ST inventory) + (t2 UI v1-critique) run parallel → (t3 UI v2-vision+spec) → (t4 FE mockup).
-->

<task_packets>

<task_packet>
  <task_id>gander-studio-p11-v2-vision-t1</task_id>
  <assigned_to>statistician</assigned_to>
  <priority>HIGH</priority>
  <description>
Produce a session-data inventory + candidate new-stats catalog for the Gander Studio v2 vision. The
v2 purpose has shifted from composing/preparing loadouts (now largely automated) toward REVIEWING the
team — stats, contributions, and past performance. Your job: determine what the on-disk logs/artifacts
can yield about agent/team performance that Studio v1 does NOT already surface, and catalog those
candidate stats so the UI designer can build an "at-a-glance" review surface on top of them.

Work in this order (the DRY-baseline step is mandatory before proposing anything new):

STEP A — Inventory what v1 ALREADY surfaces. Studio's server already ships parsers for events, stats,
sessions, progression, and connectivity (packages/server/src/parsers/). From CLAUDE.md's tRPC table
and the surfaces list, enumerate the stats/metrics v1 already exposes (e.g. per-agent feedback_loops,
files_touched, wall-clock, session synthesis, XP ledger, connectivity graph). This is the baseline —
do NOT re-propose anything already surfaced. State the baseline explicitly.

STEP B — Catalog CANDIDATE NEW STATS the corpus can yield that v1 does not surface. Draw from the real
on-disk corpus (sample it — do not invent from assumption; your remit forbids silent use of unverified
data). For EACH candidate stat, record four fields:
  - name (what the stat measures)
  - source (the on-disk file/class it derives from — cite the actual path glob you sampled)
  - derivation (how it is computed from that source)
  - feasibility: AVAILABLE-NOW (data exists in current corpus) vs NEEDS-SCHEMA-EXTENSION (no data source yet)
Candidate territory the Fable ORC-EVAL §2 flagged as under-exploited (use as leads, verify against disk):
after-actions corpus (§4 recurring patterns, §6 protocol gaps, §8 skill outcomes → per-agent quality/
recurrence signals); agent version history (agent-changelog.md → cause→effect of spec bumps);
audit/critique outcome rates from event lifecycle types (AUDIT_FAIL/AUDIT_PASS/CRITIQUE_BLOCK/GHOST_CONFIRMED/
RESUME — the timeline shows only 2 of ~25 event types); first-pass audit rate per agent; ghost/stall rate;
program-DAG participation; cross-project contribution (sibling projects have parallel docs/events + after-actions).

STEP C — Address the token/cost dimension explicitly. Per DEFERRED-P9-1 the EventLogEntrySchema carries
NO token field and the JSONL event log has no token data — so any tokens-per-agent / cost / "MP-style"
economics stat MUST be classified NEEDS-SCHEMA-EXTENSION with DEFERRED-P9-1 cited. Do not present a
cost/economics stat as available-now.

STEP D — design_implications (FF7-stat-metaphor candidates for UI routing). For the strongest candidate
stats, suggest an FF7 character-sheet stat metaphor (e.g. HP/MP/Strength/Level/EXP-bar) as a NON-binding
design lead the UI designer may adopt. Also emit a small SAMPLE-DATA appendix: for a handful of REAL agent
codes from the 13-agent roster (PM, ORC, CR, AU/AUDITOR, UI, DI, HR, RA, ST, AR, BE, FE, DS — see DESIGN.md
Role/Materia table), give plausible realistic values for the top candidate stats, sampled/estimated from
the real corpus you read. This appendix seeds the party-screen mockup with grounded, non-fabricated numbers.

This is analysis only. You produce findings + design_implications; you do NOT implement features, routes,
or UI, and you do NOT touch packages/*.
  </description>
  <success_criteria>
SC1. Deliverable file exists at docs/v2-vision/session-data-inventory.md (statistical_report form; markdown OK).
SC2. Contains a clearly-headed "what v1 already surfaces" baseline section naming the existing parser
     coverage (events, stats, sessions, progression, connectivity) — the DRY baseline.
SC3. Contains a "candidate new stats" catalog section in which EVERY candidate carries all four fields:
     name, source (a cited on-disk path/glob), derivation, and a feasibility tag of exactly
     AVAILABLE-NOW or NEEDS-SCHEMA-EXTENSION.
SC4. The tokens/cost dimension is present and classified NEEDS-SCHEMA-EXTENSION with an explicit
     reference to DEFERRED-P9-1 (or the "event schema has no token field" fact).
SC5. Contains a design_implications section proposing FF7-stat-metaphor candidates for at least the
     top candidate stats, and a SAMPLE-DATA appendix giving realistic values for real roster agent codes.
SC6. Provenance: the report cites the specific on-disk files/dir-globs it sampled (at minimum
     docs/events/*.jsonl, docs/after-actions/*.md, and one of docs/agent-logs/ or docs/sprint-reports/).
(No SC asserts a specific stat COUNT — per constraint 6 the report must EXIST with these named sections,
 not hit a pre-measured number.)
  </success_criteria>
  <context_files>
docs/events/agent-events-*.jsonl (22 files confirmed on disk 2026-07-07 — SPAWN/COMPLETE/lifecycle events; NO token field)
docs/after-actions/*.md (3 studio: prog-studio-vision-2026-06, gander-studio-p9-*, gander-studio-p10-* — §4/§6/§8 structured retros)
docs/agent-logs/ (228 files across PM/CR/BE/FE/UI/DS/RA/AR/AUD — 3-stage task journals)
docs/sprint-reports/ (2 files); docs/task-registry.md; docs/project_log.md; docs/programs/*/program.md (2 DAGs)
docs/deferred-work.md (DEFERRED-P9-1 tokens gap — already read by PM; relevant lines: the p9 section)
.claude/agents/tasks/outputs/gander-studio-meta-fable-eval-ORC-EVAL-1781056770.md (§2 under-exploited data-source leads)
DESIGN.md (Role/Materia Colors table — the 13-agent roster codes for the sample-data appendix)
NOTE: ~/projects/gander and ~/projects/broadn-web-view have parallel docs/events + docs/after-actions trees — READ-ONLY cross-project evidence if you assess cross-project contribution stats.
  </context_files>
  <dependencies>NONE (runs parallel with t2)</dependencies>
  <out_of_scope>
- Do NOT modify anything under packages/* (no parsers, no schemas, no routes) — this is a design-phase inventory.
- Do NOT implement a stat, a UI, or a mockup. You produce a report only. UI treatment is t3's job; the mockup is t4's.
- Do NOT fabricate stat values. Sample the real corpus; if a data source is missing/malformed, record it as
  a reacquisition note or NEEDS-SCHEMA-EXTENSION — never silently invent a number.
- Do NOT re-propose stats v1 already surfaces (that is the point of the STEP A baseline).
  </out_of_scope>
  <output_expected>
    <tag>statistical_report</tag>
    <must_contain>
      <item>v1-already-surfaces baseline section (existing parser coverage)</item>
      <item>candidate-new-stats catalog with name/source/derivation/feasibility per candidate</item>
      <item>tokens/cost classified NEEDS-SCHEMA-EXTENSION citing DEFERRED-P9-1</item>
      <item>design_implications: FF7-stat-metaphor candidates + sample-data appendix for real roster codes</item>
      <item>cited on-disk provenance paths</item>
    </must_contain>
    <must_not_contain>
      <item>any edit to packages/* files</item>
      <item>fabricated stat values with no cited source</item>
      <item>a stat presented as available-now when its data source does not exist (e.g. tokens)</item>
    </must_not_contain>
    <success_signal>docs/v2-vision/session-data-inventory.md exists with all five named sections and cited provenance</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>gander-studio-p11-v2-vision-t2</task_id>
  <assigned_to>ui-designer</assigned_to>
  <priority>HIGH</priority>
  <description>
Produce a critical, per-surface assessment of Studio v1, measured against the NEW v2 purpose. The human
asked us to "consider what's working with our current idea, with a critical eye" — v1 has grown "larger
than originally envisioned" and its "presentation and organization has become a bit complicated." Your
job is the keep/absorb/cut triage that feeds the v2 information architecture.

v1 has 9 surfaces (from CLAUDE.md): Browse (/), Compose, Edit, Export, Sessions (List+Detail), Graph,
Progression, Planning, Programs. Navigation is a 9-tab BottomTabBar.

The measuring stick is the v2 purpose SHIFT: v1 leaned toward COMPOSING/PREPARING loadouts for project
work (now largely automated); v2 leans toward REVIEWING the team — stats, contributions, and past
performance (observability/retrospective). Judge each surface against "does this serve reviewing the
team's performance at a glance, with drill-down?" — not against its original compose-era rationale.

For EACH of the 9 surfaces, render a verdict:
  - KEEP — carries forward largely as-is into v2 (serves the review purpose)
  - ABSORB — its value folds into another v2 surface / the party-screen drill-down (name the target)
  - CUT — compose-era scaffolding that the automated-workflow shift makes vestigial for v2's review focus
Give a one-to-three-sentence rationale per verdict tied to the review purpose.

Use the Fable ORC-EVAL synthesis as EVIDENCE for structural observations only — surface sprawl (§2:
"7 viewers" with weak cross-linking), silent-empty classes, redundancy/drift ledger (§4), the
concentration of "juice" in Compose with none propagated to observability surfaces (§3), and §5's
finding that the human frames the product as a playful game-replay REVIEW viewer and declutters
aggressively (density is a product requirement; default to grouped/aggregated with drill-down). Do NOT
re-audit code or re-verify the ORC-EVAL's bug ledger — those bugs were already fixed by
prog-studio-vision-2026-06; you are doing a DESIGN critique, not a code audit.

This is a critique document, not the v2 design. Do not design the party screen here (that is t3).
  </description>
  <success_criteria>
SC1. Deliverable file exists at docs/v2-vision/v1-critique.md.
SC2. A per-surface verdict is present for EACH of the 9 named surfaces (Browse, Compose, Edit, Export,
     Sessions, Graph, Progression, Planning, Programs), each tagged exactly one of KEEP / ABSORB / CUT
     with a rationale. (An ABSORB verdict names its absorption target.)
SC3. The document states, up front, the v2 review/observability purpose lens it is judging against
     (review team performance over compose/prepare), so each verdict is measured against the new purpose.
SC4. References the Fable ORC-EVAL structural observations (surface sprawl / weak cross-linking /
     density-as-requirement / juice-only-in-Compose) as design evidence — without re-auditing code.
     (No count-locked SC beyond the fixed, verified-on-disk fact of 9 surfaces.)
  </success_criteria>
  <context_files>
CLAUDE.md (repo root — Surfaces table, tRPC Procedures table; already read by PM)
.claude/agents/tasks/outputs/gander-studio-meta-fable-eval-ORC-EVAL-1781056770.md (§2 leverage gaps, §3 juice, §4 redundancy, §5 cross-cutting themes — structural evidence)
DESIGN.md (present at repo root — the v1 design language you are critiquing; set design_system_source: DESIGN_MD)
docs/after-actions/gander-studio-p9-sessions-feed-agentstats.md (current state of the Sessions surface)
  </context_files>
  <dependencies>NONE (runs parallel with t1)</dependencies>
  <out_of_scope>
- Do NOT design the v2 party screen, IA, or the analogy mapping here — that is t3. This packet is the
  critical triage of v1 ONLY.
- Do NOT re-audit or re-verify code / bugs. The ORC-EVAL bug ledger is already fixed and merged; use it
  only for its STRUCTURAL observations.
- Do NOT modify packages/* or DESIGN.md. Output is a new critique doc under docs/v2-vision/.
- Do NOT propose implementation work or a rebuild plan — implementation is a deferred follow-up program.
  </out_of_scope>
  <output_expected>
    <tag>design_spec</tag>
    <must_contain>
      <item>per-surface KEEP/ABSORB/CUT verdict for all 9 surfaces with rationale</item>
      <item>explicit statement of the v2 review-purpose lens</item>
      <item>ORC-EVAL structural observations cited as design evidence</item>
    </must_contain>
    <must_not_contain>
      <item>v2 party-screen design (belongs to t3)</item>
      <item>code-level bug re-audit or re-verification</item>
      <item>any edit to packages/* or DESIGN.md</item>
    </must_not_contain>
    <success_signal>docs/v2-vision/v1-critique.md exists with a verdict for each of the 9 surfaces measured against the review purpose</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>gander-studio-p11-v2-vision-t3</task_id>
  <assigned_to>ui-designer</assigned_to>
  <priority>HIGH</priority>
  <description>
Produce the v2 vision package: the human-readable vision document AND the structured design_spec the
mockup (t4) will implement. This is the core design deliverable — it synthesizes t1 (new-stats catalog)
and t2 (v1 critique) into a coherent FF7-game-menu design for a team-REVIEW surface.

The human's design direction (verbatim intent): the FF7 video game menu layout. "Immediately you are
greeted by your top or active 'players', with the essential stats indicated with bars and a nice little
dramatic portrait. And then a few submenus listed on the side with more details about various components."
And develop the analogy: "how the equipment, materia, abilities influences the character which compare to
how skills and hooks and workflows and tools influence the agent." Focus: "something that shows important
information at a glance, allowing the user to dig deeper into more assets."

Produce TWO coupled files (same author, same IA — kept in one packet deliberately; see PM routing note):

FILE 1 — docs/v2-vision/v2-vision.md — the human-readable vision document (markdown, readable end-to-end,
NO XML ceremony). It ties together, in prose a human can read start-to-finish:
  (a) The NEW-PURPOSE statement: v2 is for REVIEWING the team — stats, contributions, past performance
      (observability/retrospective) — a shift away from v1's compose/prepare-for-work focus (now automated).
  (b) A short summary of the v1 critique verdicts from t2 (what carries forward, what's absorbed, what's cut).
  (c) The FF7 MENU INFORMATION ARCHITECTURE: the "party screen" home (top/active agents greeted immediately,
      dramatic portrait + essential stats as bars, at a glance) plus the side submenu list for drilling into
      components/assets. Describe the at-a-glance→drill-down flow.
  (d) The ANALOGY MAPPING — a table mapping the game-side concepts to the agent-side concepts. You MUST use
      the human's exact terms on both sides. Game side (verbatim): equipment, materia, abilities. Agent side
      (verbatim): skills, hooks, workflows, tools. Develop what each mapping means (e.g. which agent concept
      is the "materia" that slots into an agent to change its behavior, etc.) — a mapping that is 3 game
      concepts to 4 agent concepts, so make the correspondence explicit and reasoned rather than forced 1:1.
  (e) The NEW-STATS CATALOG from t1, summarized so each surfaced stat carries its data source and feasibility
      (available-now vs needs-schema-extension) — so the human sees which party-screen bars are real-data-backed
      today vs aspirational (call out the tokens/cost NEEDS-SCHEMA-EXTENSION gap per DEFERRED-P9-1).

FILE 2 — docs/v2-vision/v2-design-spec.md — the structured design_spec t4 implements. Token-first
(design_system_source: DESIGN_MD; trace every token to a named DESIGN.md / globals.css entry — no raw hex
outside the FF7 scales; propose a new token if a value is missing). It must specify:
  - The party-screen layout (portrait + stat-bars per party member; how many members shown; grid/list geometry).
  - How a "dramatic portrait" is rendered WITHOUT external image assets (the mockup is self-contained: e.g. a
    stylized agent-code monogram in a materia-colored frame, or an inline-SVG silhouette — pick and specify).
  - The side submenu structure (which submenus, what each drills into — driven by the IA above).
  - ALL states: specify the empty state and the error state for the party surface (your remit requires all states).
  - accessibility_spec → contrast_pairs: for each foreground/background token pair used for text, record the
    pair and its WCAG AA verdict (>=4.5:1 for normal text). (Note the standing FF7 contrast context: --wm/--mt
    were remediated in prog-studio-vision-s1; --redb text is DEFERRED-006 — do not spec red text below AA.)
  - Named Shadcn primitives for the EVENTUAL v2 React build (Button/Card/Progress/Popover/Dialog as applicable),
    with a note that the t4 static mockup APPROXIMATES these in plain HTML/CSS (no React/Shadcn in the mockup).
  - A SAMPLE-DATA appendix (lift from t1's appendix): real roster agent codes + realistic stat values the
    mockup renders verbatim, so t4 has one authoritative, corpus-grounded data source.

Legibility is a first-class requirement here (the human's escaped-defect class is always legibility — readable
units, no clipping, contrast, density). Budget a legibility line in the spec.

Describe-don't-prescribe: specify structure, tokens, states, and behavior; do not hand-write the mockup's code.
  </description>
  <success_criteria>
SC1. docs/v2-vision/v2-vision.md exists and is human-readable markdown with NO XML ceremony — a content
     check finds none of these ceremony tags present: "&lt;task_packet", "&lt;design_spec", "&lt;success_criteria",
     "&lt;statistical_report" (the vision doc is prose, not a machine packet).
SC2. v2-vision.md contains the new-purpose statement (review/observability over compose/prepare).
SC3. v2-vision.md contains an FF7 menu IA section describing the party-screen home AND the side submenu list.
SC4. v2-vision.md contains the analogy mapping referencing ALL SEVEN of the human's verbatim terms:
     equipment, materia, abilities (game side) AND skills, hooks, workflows, tools (agent side).
SC5. v2-vision.md contains a new-stats catalog summary where surfaced stats carry a data source and a
     feasibility note, and explicitly flags the tokens/cost NEEDS-SCHEMA-EXTENSION gap (DEFERRED-P9-1).
SC6. v2-vision.md summarizes the t2 v1-critique verdicts (keep/absorb/cut).
SC7. docs/v2-vision/v2-design-spec.md exists and declares design_system_source: DESIGN_MD.
SC8. v2-design-spec.md specifies the party-screen layout, the portrait treatment (asset-free), the side
     submenu structure, and BOTH an empty state and an error state for the party surface.
SC9. v2-design-spec.md contains an accessibility_spec with a contrast_pairs block recording a WCAG AA
     verdict for each text token pair used (no specific ratio value is locked by this SC — the block must
     exist with per-pair AA verdicts).
SC10. v2-design-spec.md includes a sample-data appendix (real roster codes + realistic values) for t4 to render.
  </success_criteria>
  <context_files>
docs/v2-vision/session-data-inventory.md (t1 output — the new-stats catalog + FF7-metaphor design_implications + sample-data)
docs/v2-vision/v1-critique.md (t2 output — the keep/absorb/cut verdicts to summarize)
DESIGN.md (present at repo root — FF7 token system, Role/Materia colors, component rules; design_system_source: DESIGN_MD)
packages/client/src/globals.css (FF7 runtime tokens — --void, --sf, --sfh, --mt, --w, --wm, materia-* — for exact token names/values)
~/.claude/refs/dashboard-patterns.md (REQUIRED for this dashboard/at-a-glance sprint — verify pattern citations against the live library)
CLAUDE.md (repo root — Surfaces + Design Language sections)
  </context_files>
  <dependencies>gander-studio-p11-v2-vision-t1, gander-studio-p11-v2-vision-t2</dependencies>
  <out_of_scope>
- Do NOT write the mockup HTML/CSS/JS — that is t4. You specify; t4 implements.
- Do NOT modify packages/* or DESIGN.md or globals.css. Read them for tokens; propose new tokens in the
  spec doc if needed (do not edit the source token files).
- Do NOT plan or schedule the v2 implementation program — implementation is a deferred follow-up pending
  human ratification of this vision. Keep to the design package.
- Do NOT drop any of the human's seven analogy terms; do NOT force a 1:1 mapping where the correspondence
  is 3-game-to-4-agent — reason it explicitly instead.
  </out_of_scope>
  <output_expected>
    <tag>design_spec</tag>
    <must_contain>
      <item>v2-vision.md: new-purpose, v1-critique summary, FF7 IA (party + submenus), 7-term analogy mapping, stats catalog w/ source+feasibility</item>
      <item>v2-design-spec.md: party-screen layout, asset-free portrait treatment, submenu structure, empty+error states</item>
      <item>accessibility_spec with contrast_pairs (per-pair WCAG AA verdicts)</item>
      <item>design_system_source: DESIGN_MD with tokens traced to named entries</item>
      <item>sample-data appendix (real roster codes + realistic values) for t4</item>
    </must_contain>
    <must_not_contain>
      <item>raw hex/px outside the FF7 scales (use tokens; propose a token if missing)</item>
      <item>hand-written mockup code (t4's job)</item>
      <item>XML ceremony tags inside v2-vision.md (it is a human-readable prose doc)</item>
      <item>any edit to packages/*, DESIGN.md, or globals.css</item>
    </must_not_contain>
    <success_signal>both docs/v2-vision/v2-vision.md and docs/v2-vision/v2-design-spec.md exist; vision doc is prose with all 7 analogy terms; spec carries contrast_pairs + sample-data appendix</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>gander-studio-p11-v2-vision-t4</task_id>
  <assigned_to>frontend-engineer</assigned_to>
  <priority>NORMAL</priority>
  <description>
Build the tangible v2 mockup: ONE self-contained static HTML file that renders the FF7 "party-screen"
concept from t3's design_spec. This is a DESIGN ARTIFACT, not app code — it lives under docs/v2-vision/,
never touches packages/*, and has no build step, no framework, no external/CDN requests.

Deliverable: docs/v2-vision/mockup/party-screen.html — a single file with ALL CSS and JS inline. It must
open directly via a file:// URL in a browser with no server and no network. Implement t3's v2-design-spec
faithfully — you are realizing the spec, not redesigning it. If the spec has a gap, flag it in your
completion packet rather than improvising a redesign.

What it must render (per the spec, per the human's direction):
  - The PARTY SCREEN home: your top/active agents greeted immediately — each as a "party member" card with
    a dramatic portrait (rendered asset-free per the spec's portrait treatment — e.g. stylized agent-code
    monogram in a materia-colored frame or inline SVG; NO external images) and essential stats shown as BARS.
  - A side SUBMENU list (per the spec's IA) suggesting drill-down into components/assets.
  - Realistic SAMPLE DATA drawn from t3's sample-data appendix (which sources t1) — real agent codes from
    the 13-agent roster (PM, ORC, CR, AU, UI, DI, HR, RA, ST, AR, BE, FE, DS) and real stat categories.
    Do not fabricate new numbers; use the appendix values.
  - The FF7 Mako-Teal palette from globals.css / DESIGN.md, defined as CSS custom properties in an inline
    :root block (the file is self-contained, so it declares its own palette using the FF7 token values).

The mockup is a design artifact, so the app-level DESIGN.md rules that assume a React/Shadcn build (e.g.
"lucide-react only, no inline SVG") DO NOT bind this static file — you MAY use inline SVG for portraits/icons
since you cannot import lucide-react without a build. This does not relax the app-level rule; it is scoped
to this artifact only.
  </description>
  <success_criteria>
SC1. Deliverable file exists at docs/v2-vision/mockup/party-screen.html (create docs/v2-vision/mockup/ if absent).
SC2. Self-contained: a content check finds ZERO external resource loads — no occurrence of the patterns
     src="http, href="http, @import, or cdn. (a network-loading external reference). Inline SVG xmlns
     namespace URIs (http://www.w3.org/2000/svg) are permitted and are NOT external loads — the check
     targets resource loads, not namespace declarations.
SC3. Console-clean render: the auditor loads file://{absolute path to party-screen.html} via MCP navigate
     and the browser console shows no errors (MCP navigate + console; no interaction primitives required).
SC4. Party screen renders (MCP snapshot / screenshot adjudication): multiple agent "party member" cards
     are visible, each with a portrait element, an agent code, and at least one stat BAR; a side submenu
     list is present.
SC5. Contains at least 3 distinct real roster agent codes (from PM/ORC/CR/AU/UI/DI/HR/RA/ST/AR/BE/FE/DS) —
     a floor, not an exact count (the party screen shows a subset of "top/active" agents).
SC6. Inline styling defines the FF7 palette as CSS custom properties in a :root within a &lt;style&gt; block
     (dark-mode FF7 Mako-Teal aesthetic), and stat bars are present as bar/progress markup (e.g. a
     width-driven bar element or role="progressbar").
(No diff-gated SC against HEAD per constraint 2 — all checks are file-existence / content / MCP-render on
 the sprint's own new file. All SCs are within the auditor's MCP set: navigate/snapshot/console/screenshot.)
  </success_criteria>
  <context_files>
docs/v2-vision/v2-design-spec.md (t3 output — the spec you implement, incl. layout, portrait treatment, states, sample-data appendix)
docs/v2-vision/v2-vision.md (t3 output — the IA narrative, for context on the at-a-glance→drill-down intent)
docs/v2-vision/session-data-inventory.md (t1 output — sample-data / roster values if the appendix points back to it)
DESIGN.md (FF7 token system + Role/Materia colors — the palette to inline)
packages/client/src/globals.css (exact FF7 token hex values to hardcode inline — READ ONLY, do not edit)
  </context_files>
  <dependencies>gander-studio-p11-v2-vision-t3</dependencies>
  <estimated_new_lines>
~350-600 (single self-contained HTML file: inline FF7-palette CSS + party-screen markup + minimal JS + sample data).
JUSTIFICATION FOR KEEPING WHOLE (per >100-line rule): constraint 3 MANDATES exactly ONE self-contained static
HTML file with no build step and no external files — splitting into multiple files is prohibited by the brief.
This is a single indivisible design artifact, not app-code modules; the line count is inherent to inlining all
CSS/JS/data. No split possible without violating the constraint.
  </estimated_new_lines>
  <out_of_scope>
- Do NOT modify anything under packages/* (no app code, no components, no globals.css). This is a docs/ artifact.
- Do NOT add a build step, npm dependency, bundler config, or framework import. One plain .html file, inline only.
- Do NOT load ANY external resource: no CDN, no web fonts over the network, no external images, no external
  scripts/styles. Portraits are asset-free (inline SVG / CSS / monograms per the spec).
- Do NOT redesign the spec. Implement t3 faithfully; flag spec gaps in the completion packet instead of improvising.
- Do NOT wire this into the app router or the Studio nav — it is a standalone mockup file.
  </out_of_scope>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>path docs/v2-vision/mockup/party-screen.html and confirmation it opens via file:// with no network</item>
      <item>list of real roster agent codes rendered + confirmation values came from the t3/t1 sample-data appendix</item>
      <item>note on portrait treatment used (asset-free method)</item>
      <item>any spec gaps encountered (flagged, not silently redesigned)</item>
    </must_contain>
    <must_not_contain>
      <item>any external/CDN resource reference (src=/href= to http, @import, cdn.)</item>
      <item>edits to packages/* or globals.css</item>
      <item>a build step, framework import, or multi-file split</item>
      <item>fabricated stat values not drawn from the sample-data appendix</item>
    </must_not_contain>
    <success_signal>docs/v2-vision/mockup/party-screen.html exists, loads console-clean via file:// (MCP navigate), snapshot shows party-member cards with portraits + stat bars + a side submenu, no external requests</success_signal>
  </output_expected>
</task_packet>

</task_packets>

<verbatim_deliverable_audit>
  <!-- Every noun/verb phrase from the human_request mapped to addressed / deferred / out_of_scope. Critic inspects this block. -->
  <phrase text="rebuild of gander studio / rebuild v2 now">
    <deferred reason="Sprint is DESIGN-PHASE (ORC-locked): produces the v2 vision package + mockup only; the actual rebuild/implementation is a follow-up program pending human ratification. Verbatim-vs-locked conflict surfaced in risk_flags for ORC reconciliation." />
  </phrase>
  <phrase text="larger than originally envisioned / presentation and organization has become a bit complicated">
    <addressed task="gander-studio-p11-v2-vision-t2" />
  </phrase>
  <phrase text="make a completely new design that is more user focused">
    <addressed task="gander-studio-p11-v2-vision-t3" />
  </phrase>
  <phrase text="FF7 video game menu layout">
    <addressed task="gander-studio-p11-v2-vision-t3" />
  </phrase>
  <phrase text="immediately greeted by your top or active players">
    <addressed task="gander-studio-p11-v2-vision-t3" />
    <addressed task="gander-studio-p11-v2-vision-t4" />
  </phrase>
  <phrase text="essential stats indicated with bars">
    <addressed task="gander-studio-p11-v2-vision-t1" />
    <addressed task="gander-studio-p11-v2-vision-t4" />
  </phrase>
  <phrase text="a nice little dramatic portrait">
    <addressed task="gander-studio-p11-v2-vision-t3" />
    <addressed task="gander-studio-p11-v2-vision-t4" />
  </phrase>
  <phrase text="a few submenues listed on the side with more details about various components">
    <addressed task="gander-studio-p11-v2-vision-t3" />
    <addressed task="gander-studio-p11-v2-vision-t4" />
  </phrase>
  <phrase text="analogies: equipment, materia, abilities → skills, hooks, workflows, tools influence the agent">
    <addressed task="gander-studio-p11-v2-vision-t3" />
  </phrase>
  <phrase text="consider what's working with our current idea, with a critical eye">
    <addressed task="gander-studio-p11-v2-vision-t2" />
  </phrase>
  <phrase text="shows important information at a glance, allowing the user to dig deeper into more assets">
    <addressed task="gander-studio-p11-v2-vision-t3" />
    <addressed task="gander-studio-p11-v2-vision-t4" />
  </phrase>
  <phrase text="new information that we can gather from our sessions that we haven't considered before">
    <addressed task="gander-studio-p11-v2-vision-t1" />
  </phrase>
  <phrase text="focus is less on preparing to work on a project with gander, which is more automated now">
    <addressed task="gander-studio-p11-v2-vision-t3" />
    <addressed task="gander-studio-p11-v2-vision-t2" />
  </phrase>
  <phrase text="focus on reviewing the stats and contributions of the team as is and how they have performed prior">
    <addressed task="gander-studio-p11-v2-vision-t1" />
    <addressed task="gander-studio-p11-v2-vision-t3" />
  </phrase>
</verbatim_deliverable_audit>

<dependency_order>
  <!-- t1 (ST inventory) and t2 (UI v1-critique) are independent → run in PARALLEL.
       t3 (UI v2-vision + design_spec) consumes BOTH t1 and t2.
       t4 (FE static mockup) consumes t3.
       Exit: ORC assembles the package (t1+t2+t3 docs + t4 mockup) and presents it for human ratification
       (Step 4.5-analog). No implementation tasks — v2 build is a deferred follow-up program. -->
  (gander-studio-p11-v2-vision-t1 || gander-studio-p11-v2-vision-t2) → gander-studio-p11-v2-vision-t3 → gander-studio-p11-v2-vision-t4 → [ORC ratification-package report]
</dependency_order>

<routing_notes>

  <!-- ===== Step 0.5 recurring-pattern preflight (Critic mechanically inspects these) ===== -->
  <recurring_pattern source="gander-studio-p10-deferred-smalls.md §6 (via brief pm_preflight)">OVERSCOPED — pack no more than 2 independent files per domain per packet.</recurring_pattern>
  <!-- How avoided: t1/t2/t4 are single-file deliverables. t3 produces 2 files (v2-vision.md + v2-design-spec.md)
       but they are COUPLED (same author, same IA/analogy — not independent logic), and per the p9 after-action §5
       spec/planning agents (incl. UI-designer) did NOT stall (only edit-heavy bg agents did). Keeping t3 whole
       preserves coherence between the human-readable narrative and the structured spec; splitting would risk
       narrative/spec divergence and serialize two UI spawns for no benefit. Accepted whole with this rationale. -->

  <recurring_pattern source="brief pm_preflight (DRY)">DRY — inventory existing implementations before proposing new.</recurring_pattern>
  <!-- How avoided: t1 STEP A mandates a baseline inventory of what v1 ALREADY surfaces (existing parsers:
       events/stats/sessions/progression/connectivity) BEFORE cataloging new stats. t2 measures verdicts
       against existing surfaces. No new stat may re-propose an already-surfaced metric. -->

  <recurring_pattern source="gander-studio-p9-*.md §6 G1 + p10 §6 G4 (via brief)">background-subagent-bash-denied / edit-heavy background-async Agent stall (RECURRING).</recurring_pattern>
  <!-- How avoided: t1 (ST — may need shell aggregation over JSONL) and t4 (FE — edit-heavy, writes the HTML
       file) are flagged FOREGROUND-ONLY below. Do NOT dispatch them via background resume (Bash auto-denied)
       and prefer the sanctioned execution-substrate fallback ladder if a fresh foreground spawn stalls. -->

  <recurring_pattern source="p10 §6 G5 (via brief)">subagentstop-complete-miss — SubagentStop hook may miss COMPLETEs (RECURRING).</recurring_pattern>
  <!-- How avoided: every packet's Output Path is named exactly; agents write their deliverable to docs/v2-vision/
       AND their completion packet to the .claude/tasks/outputs/ path ORC assigns. ORC runs the COMPLETE backfill
       at Step 3.7. -->

  <recurring_pattern source="p10 §6 G2 (via brief)">Self-defeating SC — a whole-file count-0 grep contradicting an instruction that requires emitting the token.</recurring_pattern>
  <!-- How avoided: NO SC in this plan forbids a token another instruction requires. Self-contained-file SC2 (t4)
       does NOT use a bare-"http" count-0 (which would false-fail on legitimate inline-SVG xmlns namespace URIs);
       it targets external RESOURCE-LOAD patterns only (src="http, href="http, @import, cdn.) and explicitly
       exempts namespace URIs. All ST/UI SCs are existence/named-section content checks, not count-0 greps on
       required content. Manual satisfiability lint (Step 7.5) applied to every locked-line SC. -->

  <recurring_pattern source="ORC-EVAL §5 (studio escaped-defect class, cross-cutting)">RECURRING legibility class — every human-caught escaped defect at Step 4.5 was legibility (invisible/compressed/clipped), never a logic bug; every new visualization surface must budget a legibility SC up front.</recurring_pattern>
  <!-- How honored: t3's v2-design-spec MUST carry an accessibility_spec → contrast_pairs (WCAG AA per pair,
       SC9) and a legibility line; t4's mockup is verified via MCP navigate+console(clean)+snapshot render, so a
       rendered-but-illegible surface is caught before the ratification gate. -->

  <!-- Sibling-project sources (gander-meta-ratified-apply-p1, gander-meta-aas-batch-p1) were read for §6 gaps
       per Step 0.5; their gaps are control-plane rule-application residuals (DEFERRED-AAS-1..4, ghost SPAWNs,
       resolver qualifications) that do NOT bind this studio UI design-phase sprint — recorded as reviewed,
       not binding. -->

  <!-- ===== pm_preflight_acknowledgement (brief requires these entries) ===== -->
  <pm_preflight_acknowledgement>
    - OVERSCOPED: acknowledged — ≤2 files/domain honored; t3's 2 files are coupled with documented rationale.
    - DRY: acknowledged — t1 STEP A baselines existing parser/stat coverage before proposing new stats.
    - background-subagent-bash-denied: acknowledged — t1 (ST) and t4 (FE) flagged foreground-only.
    - subagentstop-complete-miss: acknowledged — every packet names its exact Output Path; ORC backfills at Step 3.7.
    - sc_precheck delegated to ORC (see below).
  </pm_preflight_acknowledgement>

  <!-- ===== sc-precheck delegation (constraint 8) ===== -->
  <sc_precheck_delegation>
    PM has NO Bash tool. SCs above are DRAFT. ORC must run the sc-locked-value-consistency precheck
    (.claude/skills/sc-locked-value-consistency, §"pm-preflight Step 2.5") against this decomposition and
    attach sc-precheck-report.json BEFORE the Critic gate. PM applied the manual Step-7.5 satisfiability lint
    (no count-0 grep forbids a required token; t4 SC2 exempts inline-SVG xmlns namespace URIs). Note: several
    SCs (t3 SC1, t4 SC2) reference angle-bracket/quote tokens as content patterns to DETECT — these are
    detection targets, not locked frontmatter values, so they are not VERBATIM_DELIVERABLE self-contradictions.
  </sc_precheck_delegation>

  <!-- ===== DESIGN.md status (UI sprint) ===== -->
  <design_md_status>
    DESIGN.md PRESENT at /home/jhber/projects/gander-studio-alpha/DESIGN.md (v1.1.0, 2026-06-20, "Studio
    Clarity" semantic --color-* tokens + legacy FF7 runtime tokens coexisting). Included in context_files for
    every UI (t2, t3) and FE (t4) packet. UI Designer (t2, t3) MUST set design_system_source: DESIGN_MD and
    trace all tokens to named entries. FF7 runtime token exact values live in packages/client/src/globals.css
    (--void/--sf/--sfh/--mt/--w/--wm/--materia-*) — provided to t3/t4 for the palette. See risk_flags for the
    FF7-vs-Clarity direction tension the vision must resolve for human ratification.
  </design_md_status>

  <!-- ===== execution-substrate / foreground routing ===== -->
  <foreground_only>
    t1 (statistician — may run shell aggregation over 22 JSONL logs) and t4 (frontend — edit-heavy, writes the
    HTML file) MUST be FRESH FOREGROUND spawns. Do NOT route via background resume (Bash auto-denied, p10 G4)
    and do NOT expect edit-heavy background agents to complete (p9 G1). If a fresh foreground spawn stalls, use
    the sanctioned fallback ladder (fresh spawn → Workflow accelerant if available → human-chosen ORC-direct,
    audit gate always runs). t2/t3 (UI-designer, spec-only, no edits) run fine on the normal path per p9 §5.
  </foreground_only>

  <!-- ===== shared-file / append serialization ===== -->
  <append_serialization>NONE — each packet writes a DISTINCT file under docs/v2-vision/ (session-data-inventory.md,
    v1-critique.md, v2-vision.md + v2-design-spec.md, mockup/party-screen.html). No two packets append to a
    shared ledger; no serialization hazard. Working-tree ceremony debt (modified 2026-07-02 jsonl, untracked
    legacy outputs) is untouched by this sprint (constraint 2: no diff-gated SCs against HEAD).</append_serialization>

  <!-- ===== auditor capability constraint (p10 G3) ===== -->
  <auditor_capability>
    The auditor's MCP Playwright set has NO interaction primitives (navigate/snapshot/console/wait/screenshot/
    close only). t4's mockup SCs are deliberately load/render/console-clean + content-grep ONLY — no
    interaction-class SC. Auditor loads file://{abs path}/party-screen.html via MCP navigate, checks console
    clean, adjudicates the party-screen render via snapshot/screenshot, and runs content checks (external-load
    absence, roster codes present, stat-bars present). All within the auditor's set.
  </auditor_capability>

  <!-- ===== relevant critics / gates ===== -->
  <critics_and_gates>
    Critic plan-gate: probe (a) the FF7-vs-Clarity token direction (risk_flags R1), (b) verbatim-vs-locked
    "rebuild now" scope (risk_flags R2), (c) that the ST report's stat feasibility is corpus-grounded not
    aspirational. Exit gate = HUMAN RATIFICATION of the v2 direction (design-sprint Step 4.5-analog): ORC
    assembles the 5 deliverable files into a ratification-package report; NO implementation tasks are planned.
  </critics_and_gates>

  <!-- ===== observability / event log ===== -->
  <event_log_note>PM did NOT write to docs/events/ (no Bash; overwriting the jsonl is a known corruption hazard —
    Critic once corrupted it). PM COMPLETE is auto-logged by the SubagentStop hook / ORC backfill (Step 3.7).</event_log_note>

</routing_notes>

<risk_flags>
  <risk id="R1" severity="HIGH">
    FF7-vs-Studio-Clarity token direction tension. DESIGN.md v1.1.0 has moved toward "Studio Clarity" semantic
    --color-* tokens with a STATED FF7→Clarity migration direction ("legacy tokens should be removed file-by-file"),
    while the human AND constraint 3 explicitly want the FF7 Mako-Teal game-menu aesthetic for v2. The v2 vision
    (t3) must resolve this: v2 leans INTO the FF7 identity, which may mean re-embracing/retaining the FF7 runtime
    tokens rather than continuing the Clarity migration. This is a design-DIRECTION decision that belongs in the
    human ratification gate — flag it explicitly in the vision doc so the human ratifies the palette direction, not
    just the layout.
  </risk>
  <risk id="R2" severity="MEDIUM">
    Verbatim-vs-locked conflict (Step 7.6). Human said "rebuild v2 now" / "we rebuild v2 now"; the ORC-locked
    DESIGN-PHASE scope produces the vision package + mockup ONLY and defers the actual rebuild to a follow-up
    program pending ratification. ORC should reconcile this with the human up front — confirm they understand
    this sprint delivers the DESIGN + tangible mockup, and that implementation is the next (ratification-gated)
    program — rather than the conflict first surfacing at the close-out gate.
  </risk>
  <risk id="R3" severity="MEDIUM">
    Tokens/cost dimension has NO data source (DEFERRED-P9-1: event schema has no token field). Any FF7 "MP" /
    cost / economics stat metaphor is aspirational and MUST be marked NEEDS-SCHEMA-EXTENSION, not rendered as a
    real available-now bar. Enforced by t1 SC4 and t3 SC5. Watch that the mockup (t4) does not imply cost data
    exists — if it shows an MP-style bar, the spec/appendix must label it aspirational.
  </risk>
  <risk id="R4" severity="LOW">
    Sample-data realism / provenance. The mockup's numbers are ILLUSTRATIVE design data (drawn from t1's
    corpus-grounded appendix via t3), not a validating eval/test fixture — so the heavy Step-2.7 corpus-provenance
    audit gate is NOT imposed. But t1 must SAMPLE the real corpus and cite the paths it read (SC6); if t1 fabricates
    numbers with no source, the whole party-screen loses its "real team" grounding. The ST out_of_scope forbids
    silent fabrication.
  </risk>
  <risk id="R5" severity="LOW">
    Static-artifact vs app-DESIGN.md rule collision. DESIGN.md forbids inline SVG ("lucide-react only") for the
    APP, but the self-contained mockup cannot import lucide-react without a build — so it may use inline SVG for
    portraits/icons. This is scoped to the artifact and does NOT relax the app rule. t4 SC2's external-load check
    deliberately exempts inline-SVG xmlns namespace URIs so it does not false-fail legitimate inline SVG.
  </risk>
  <risk id="R6" severity="LOW">
    Legibility escaped-defect class (ORC-EVAL §5) — every defect the human catches at review is legibility, never
    logic. Mitigated by t3 SC9 (contrast_pairs WCAG AA) + legibility line, and t4 render/console verification. If
    the mockup renders text on low-contrast FF7 surfaces (esp. red-on-void per DEFERRED-006), it will be the class
    of defect the human catches at the ratification gate — spec must not place normal text below AA.
  </risk>
</risk_flags>

</task_decomposition>

<expectation_manifest>
  <sprint_id>gander-studio-p11-v2-vision</sprint_id>
  <generated>2026-07-07T21:15:00Z</generated>
  <assignments>
    <assignment>
      <task_id>gander-studio-p11-v2-vision-t1</task_id>
      <agent>ST#1</agent>
      <expected_tag>statistical_report</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p11-v2-vision-t1-ST-*.md (completion packet) + deliverable docs/v2-vision/session-data-inventory.md</expected_file>
      <blocks>gander-studio-p11-v2-vision-t3</blocks>
      <receipt_check>
        <item>docs/v2-vision/session-data-inventory.md exists</item>
        <item>v1-already-surfaces baseline section present (DRY)</item>
        <item>candidate stats each carry source + derivation + AVAILABLE-NOW|NEEDS-SCHEMA-EXTENSION</item>
        <item>tokens/cost classified NEEDS-SCHEMA-EXTENSION citing DEFERRED-P9-1</item>
        <item>design_implications + sample-data appendix with real roster codes present</item>
        <item>cited on-disk provenance paths present (no fabricated values)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p11-v2-vision-t2</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p11-v2-vision-t2-UI-*.md (completion packet) + deliverable docs/v2-vision/v1-critique.md</expected_file>
      <blocks>gander-studio-p11-v2-vision-t3</blocks>
      <receipt_check>
        <item>docs/v2-vision/v1-critique.md exists</item>
        <item>verdict present for all 9 surfaces, each KEEP|ABSORB|CUT + rationale</item>
        <item>v2 review-purpose lens stated up front</item>
        <item>ORC-EVAL structural observations cited (no code re-audit)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p11-v2-vision-t3</task_id>
      <agent>UI#2</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p11-v2-vision-t3-UI-*.md (completion packet) + deliverables docs/v2-vision/v2-vision.md + docs/v2-vision/v2-design-spec.md</expected_file>
      <blocks>gander-studio-p11-v2-vision-t4</blocks>
      <receipt_check>
        <item>docs/v2-vision/v2-vision.md exists, prose, no XML ceremony tags</item>
        <item>all 7 analogy terms present (equipment, materia, abilities / skills, hooks, workflows, tools)</item>
        <item>new-purpose + FF7 IA (party + submenus) + stats catalog w/ source+feasibility + t2 verdict summary</item>
        <item>docs/v2-vision/v2-design-spec.md exists; design_system_source: DESIGN_MD</item>
        <item>party layout + asset-free portrait + submenu structure + empty state + error state</item>
        <item>accessibility_spec contrast_pairs with per-pair WCAG AA verdicts</item>
        <item>sample-data appendix (real roster codes + realistic values) for t4</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p11-v2-vision-t4</task_id>
      <agent>FE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p11-v2-vision-t4-FE-*.md (completion packet) + deliverable docs/v2-vision/mockup/party-screen.html</expected_file>
      <blocks>NONE (last node before ORC ratification-package report)</blocks>
      <receipt_check>
        <item>docs/v2-vision/mockup/party-screen.html exists (single self-contained file)</item>
        <item>no external resource loads (src="http/href="http/@import/cdn. absent; inline-SVG xmlns exempt)</item>
        <item>loads console-clean via file:// (auditor MCP navigate+console)</item>
        <item>snapshot shows party-member cards w/ portraits + stat bars + side submenu</item>
        <item>>=3 real roster agent codes; values sourced from t3/t1 sample-data appendix (not fabricated)</item>
        <item>inline :root FF7 palette + stat-bar markup present</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
