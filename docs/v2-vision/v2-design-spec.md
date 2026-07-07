# Gander Studio v2 — Party Screen Design Spec

**Task:** `gander-studio-p11-v2-vision-t3` | **Author:** UI Designer (UI#2) | **Date:** 2026-07-07
**Companion document:** `docs/v2-vision/v2-vision.md` (human-readable IA narrative, analogy mapping,
new-stats summary, and the Open Ratification Question this spec does not resolve)

This is the structured spec `gander-studio-p11-v2-vision-t4` implements as a static, self-contained
HTML mockup. It specifies structure, tokens, states, and behavior; it does not hand-write markup.
Token vocabulary follows the **runtime** FF7 token names (`globals.css` `:root` — `--void`, `--sf`,
`--mt`, `--mg`/`--my`/`--mb`/`--mp`/`--mr`/`--mo`, …), per DESIGN.md Decision Record B's own
instruction: "Any grep or pattern search for role colors in `.css`/`.tsx`/`.ts` files must match
against the runtime short names… the idealized `--materia-*` names are human documentation only."
Where this spec cites a resolved hex value, it is quoting the value already published against that
token name in DESIGN.md or `globals.css` — no new hex is introduced anywhere in this document.

<design_spec>
  <task_id>gander-studio-p11-v2-vision-t3</task_id>
  <surface>Gander Studio v2 — Party Screen (home) + Side Submenus</surface>
  <design_system_source>DESIGN_MD</design_system_source>

  <component_hierarchy>
PartyScreenPage
├── AppShell (existing global shell — BottomTabBar on mobile / SubmenuRail on desktop; not
│   redesigned here, only re-scoped to 5 destinations instead of 9)
├── PartyScreenHeader
│   ├── PageTitle ("Party Screen" — DESIGN.md "Page title" Component Rule: `lg` size, weight
│   │   600, color `--w`; preceded by a 2px×18px vertical rule in the runtime primary `--mt`)
│   └── ScopeSummary (`xs`, `--wm`, uppercase tracking 0.12em — "13-agent roster · updated
│       {last synthesized session date}")
├── SubmenuRail (Shadcn `<Button variant="ghost">` items in a vertical rail; desktop only —
│   see Responsive below for the mobile fallback)
│   ├── SubmenuItem "Roster"      (lucide `Users` icon)
│   ├── SubmenuItem "Sessions"    (lucide `FileClock` icon)
│   ├── SubmenuItem "Progression" (lucide `TrendingUp` icon)
│   └── SubmenuItem "Programs"    (lucide `GitBranch` icon)
├── PartyGrid (main content region — exactly one of the three mutually-exclusive states below
│   is rendered at a time)
│   ├── [default] 6× PartyMemberCard (Shadcn `<Card>`)
│   │   ├── PortraitFrame (custom, asset-free — see Portrait Treatment below)
│   │   ├── AgentCodeLabel (mono, `lg`, `--w`)
│   │   ├── RoleTag (Shadcn `<Badge>` — pill, materia-colored, reuses the existing DESIGN.md
│   │   │   "Role / type tag" Component Rule verbatim: color = materia token, background =
│   │   │   `rgba(materia, 0.12)`, border = `rgba(materia, 0.25)`, no solid fill)
│   │   ├── StatBar "Activity"  (Shadcn `<Progress>`, fill = agent's role materia color)
│   │   ├── StatBar "Stamina"   (Shadcn `<Progress>`, fill = `--mg` — reuses the existing
│   │   │   success-semantic color per DESIGN.md Color Tokens table role mapping, since a
│   │   │   healthy stamina bar is a positive/success signal regardless of the card's own role
│   │   │   color)
│   │   ├── StatBar "Accuracy"  (Shadcn `<Progress>` for Impl roles; explicit "N/A" text state
│   │   │   for all other roles — see States below)
│   │   └── DrillDownTrigger (whole card is a focusable, clickable target; Shadcn `<Popover>`
│   │       quick-peek on hover/focus-visible before commit to navigation)
│   ├── [empty] EmptyPartyState (replaces the 6-card grid entirely)
│   └── [error] ErrorPartyState (replaces the 6-card grid entirely; Shadcn
│       `<Alert variant="destructive">`)
└── (drill-down destinations reached via SubmenuItem or PartyMemberCard click — out of this
    surface's own scope, named for completeness only): AgentDetailRoute (Roster drill-down),
    SessionDetailPage (existing, unchanged), ProgressionPage (existing, unchanged),
    ProgramsPage (existing, unchanged)
  </component_hierarchy>

  <layout>
    <grid>
Desktop (≥1024px): PartyGrid is a 3-column grid (`repeat(3, 1fr)`), 6 cards → 2 rows, gap
`space-4` (16px). SubmenuRail occupies a fixed-width left column per the existing DESIGN.md
"Collapsible sidebar" Component Rule (open: 240px; collapsed: 56px, icons only; `width`
transition 200ms ease — reused verbatim, no new animation introduced).
Tablet (640–1023px): PartyGrid drops to 2 columns (3 rows), gap `space-4`. SubmenuRail behavior
unchanged.
Mobile (&lt;640px): PartyGrid drops to 1 column (6 rows). SubmenuRail is NOT rendered as a side
rail; its 4 items fold into the existing global `BottomTabBar` (`role="tablist"`), which grows
from its current tab set down to 5 destinations total (Party [home] + the 4 submenus) —
consistent with the app's existing bottom-tab navigation pattern rather than inventing a second
navigation mechanism for small viewports.
No new container max-width token is introduced — PartyScreenPage inherits the existing AppShell
content container width already used by every other v1 surface (DRY: no new breakpoint value).
    </grid>
    <spacing>
Page padding: `space-6` (24px) desktop, `space-4` (16px) mobile — DESIGN.md Spacing Scale.
Card padding: `space-4` (16px). Grid gap: `space-4` (16px). Gap between the 3 stat bars within
one card: `space-2` (8px). Gap between SubmenuRail items: `space-1` (4px). Gap between
PageTitle's vertical rule and its text: `space-2` (8px), matching the existing "Page title"
Component Rule's implied spacing.
    </spacing>
    <responsive>
      <breakpoint name="lg">3-column PartyGrid; SubmenuRail as a persistent left rail (240px open / 56px collapsed).</breakpoint>
      <breakpoint name="md">2-column PartyGrid; SubmenuRail unchanged from desktop behavior.</breakpoint>
      <breakpoint name="sm">1-column PartyGrid; SubmenuRail folds into the existing global BottomTabBar (5 tabs total, reusing the app's current bottom-tab pattern — no new nav mechanism).</breakpoint>
    </responsive>
  </layout>

  <portrait_treatment>
Asset-free by construction — no photographic or illustrated image of any kind, anywhere.
- **Frame:** a square region, radius `--radius-md` (10px, DESIGN.md Border Radius table),
  occupying roughly the top 40% of the card's height.
- **Background:** a two-stop linear gradient from `rgba({role-materia-token}, 0.12)` at one
  corner to `--sfh` (#1a3530) at the opposite corner. The 0.12 opacity figure is not invented for
  this spec — it is the exact tint opacity already established by DESIGN.md's "Role / type tag"
  Component Rule, reused here for visual consistency and, just as importantly, to keep the
  monogram text's effective background luminance close to `--sfh` (see Legibility below — this
  is why 0.12 was chosen over a bolder tint).
- **Border:** `2px solid var(--{role-materia-token})` at full saturation (e.g. `--mg` for an
  Impl-role card) — a bolder treatment than the tag pattern's 0.25-alpha border, deliberately,
  because a "dramatic portrait" frame is a hierarchy-bearing element (Bold Hierarchy principle),
  not a quiet metadata chip. This is a non-text, decorative border, so it is held to the WCAG
  non-text 3:1 threshold, not the 4.5:1 text threshold — see Accessibility below.
  **No `box-shadow` glow** of any kind — the Constitution explicitly forbids glow shadows; the
  "dramatic" effect comes entirely from color, gradient, and border, never from a glow.
- **Monogram:** the agent's 2–3 letter code, centered, `2xl` size (22px), weight 600, color
  `--w` (#ffffff) — see the Accessibility contrast_pairs table for the derived contrast of this
  exact pairing against the gradient's effective `--sfh`-equivalent background.
- **Optional flourish:** one lucide-react icon, role-representative (`Sword` for Impl,
  `ShieldCheck` for Gate, `Compass` for Intel, `Sparkles` for Meta, `Crown` for Command),
  positioned in the frame's bottom-right corner at 50% opacity, purely decorative,
  `aria-hidden="true"`. This is a react-build-only detail — Icons from lucide-react only, no
  inline SVG, per the Constitution — and does not bind t4's static mockup, which is exempted per
  its own packet (it cannot import lucide-react without a build) and may substitute inline SVG
  scoped to that artifact only.
  </portrait_treatment>

  <submenu_structure>
Four submenus, mapped 1:1 from `v1-critique.md`'s (t2) verdicts:
1. **Roster** (absorbs Browse + Graph). Drills into: the full 13-role catalog including roles
   with zero corpus activity (e.g. `DI` — explicitly labeled "no corpus occurrences observed",
   never silently hidden, per t1 §4's honesty finding); per-agent detail showing its equipped
   skills and hooks ("equipment and materia" — see the vision doc's analogy mapping) and its
   connectivity to other agents/skills (the former Graph surface, now a relationship panel
   inside this drill-down rather than a standalone tab); a "Revise this spec" action (absorbs
   Edit) opening the existing markdown editor from within the agent-detail context.
2. **Sessions** (KEEP, unchanged). Full per-sprint post-mortem list + detail — the "read the
   full battle report" surface every party-screen stat bar ultimately traces back to.
3. **Progression** (KEEP, unchanged). XP/level-up ledger timeline; cross-linked from an agent's
   Roster detail so a spec revision (agent-changelog) sits next to the ledger entry it produced.
4. **Programs** (KEEP, unchanged). Multi-sprint program DAG.
  </submenu_structure>

  <states>
    <state name="default">
As described in component_hierarchy: 6 party-member cards in a grid, submenu rail visible.
    </state>
    <state name="loading">
PartyGrid renders 6 `<Skeleton>` placeholder cards using the pre-existing `.skeleton-shimmer`
class (DESIGN.md "Loading state" Component Rule: Shadcn `<Skeleton>` shimmer for content areas,
no page-level spinner). Reuses the pre-existing `shimmer` keyframe verbatim — no new animation
introduced (Decision Record C's globals.css single-writer contract: wave-2 surfaces reference
classes by name only).
    </state>
    <state name="empty">
Triggered when the configured session sources yield zero SPAWN events in the current lookback
window. Per DESIGN.md's "Empty state" Component Rule (icon + heading + body + CTA, all four
required): lucide `Users` icon at `--wm` tint; heading "No Active Party Members Yet" (`lg`,
`--w`); body "No agent activity found in the configured session sources for this window." (`sm`,
`--wd`); CTA `<Button variant="default">` labeled "View Full Roster", routing to the Roster
submenu (which still renders the static 13-role catalog even with zero activity data).
    </state>
    <state name="error">
Triggered on a session/stats data-fetch or parse failure. Shadcn `<Alert variant="destructive">`
per DESIGN.md's "Error state" Component Rule — left-border accent `--redb` (#e05555), message
"Couldn't load party data — {error}.", paired with a `<Button variant="outline">` labeled
"Retry".
    </state>
    <state name="card-hover">
Card border transitions from `--bd` (rgba(84,153,181,0.25)) to `--bdb`
(rgba(84,153,181,0.55)) per the existing "Card" Component Rule ("on hover: border becomes 1px
solid `--color-border-active` — no box-shadow glow"). After a short hover delay, a
`<Popover>` quick-peek may appear showing the card's exact stat values and their "as of" date
(no feasibility tags in the runtime UI — feasibility is a documentation concept for this design
package, not end-user chrome).
    </state>
    <state name="card-focus-visible">
Visible focus ring using the existing `.tab-item:focus-visible` treatment (`2px solid var(--mt)`,
`outline-offset: 2px`) — reused verbatim rather than inventing a new focus treatment.
    </state>
    <state name="card-active-pressed">
Reuses the existing `--nav-active-bg` runtime token (`rgba(84,153,181,0.14)`, already defined in
`globals.css`) as a brief pressed-state background wash before navigation commits.
    </state>
    <state name="submenu-item-active">
Left `2px solid` border in the runtime primary (`--mt`) plus `background: var(--nav-active-bg)`
— identical to the existing "Nav item (sidebar)" Component Rule, unchanged.
    </state>
    <state name="statbar-not-applicable">
When a role-conditional stat has no meaning for a given card (currently: the "Accuracy" bar for
any role outside `BE`/`FE`/`DS`), the bar track renders at zero width with no percentage number,
replaced by the text "N/A — not audit-gated" in `--wm` on the card surface (`--sf`/`--sfh`) —
an explicit "no data" signal, never a misleading 0%.
    </state>
  </states>

  <data_viz_modules>
    <module name="StatBar (Activity / Stamina / Accuracy)">
      <new_pattern_proposal>
        <name>StatBar</name>
        <rationale>
No entry in `~/.claude/refs/dashboard-patterns.md`'s current catalog fits a simple single-scalar
percentage-fill bar. `SegmentedScaleBar` is the closest existing pattern but is built for a
multi-segment, named-range scale with a pin indicator (e.g. AQI Good→Hazardous) — over-specified
for a stat that is just "63% first-pass" with no segment boundaries. `RangeGauge` requires a
window min/max context that these agent stats don't have. This app's DESIGN.md does not declare
`App Type: dashboard` (defaults to `standard`), so the strict SA-gate governance in
`~/.claude/refs/design-system.md`'s Dashboard App Addendum does not formally bind this spec —
this proposal is offered voluntarily, per the task packet's explicit instruction to verify any
pattern citation against the live library rather than silently inventing a visualization.
        </rationale>
        <pattern_definition>
Purpose: Display a single scalar metric (0–100%, or an explicit N/A) as a horizontal fill bar
with a label and numeric readout, for compact "essential stat" display inside a card. Communicates
one number at a glance; makes no claim about a range, window, or multi-segment scale.

Inputs:
- `label` — string, the stat's name (e.g. "Activity", "Stamina", "Accuracy")
- `value` — number 0–100, or `null` to signal not-applicable
- `fill_token` — a design token name for the bar's fill color (materia role color, or a
  semantic success/error token for a directional stat)
- `value_label` (optional) — a pre-formatted display string when the raw percentage is not the
  most meaningful readout (e.g. "22/35" alongside "63%")

Visualization Rule: A track (background `--sfh`, radius `--radius-sm`, 6px height) with a filled
segment of width `value%` in `fill_token`. Label renders above the bar (`sm`, `--wd`); the numeric
value renders inline, right-aligned to the label (`sm`, `--w`). When `value` is `null`, render an
empty (0-width) track and replace the numeric value with a "N/A — {reason}" caption in `--wm`,
never a bare "0%".

Interaction Model: Static in the party-screen card. On card hover/focus, the enclosing
`<Popover>` quick-peek (see States → card-hover) may show the bar's exact source stat and its
as-of date. No scrubbing, no expansion of the bar itself — deeper detail lives in the Roster/
Sessions drill-down, not in an expanded version of this component.

Accessibility Contract:
- `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` when
  `value` is not null; when `value` is null, omit `aria-valuenow` and instead set
  `aria-label="{label}: not applicable, {reason}"`.
- `aria-label`: "{label}: {value}%" (or the not-applicable phrasing above).
- Color is never the sole differentiator: the label text and the numeric readout always
  accompany the fill color, so the bar is legible with color perception removed.
- Minimum bar-fill contrast against its track: 3:1 (WCAG non-text) — satisfied by every materia
  color against `--sfh`, consistent with those same colors' existing use as chart-series fills
  (`--mb`, `--mg` independently verified at 4.7:1/5.1:1 against the even-darker `--void`, per
  DESIGN.md Decision Record B).
        </pattern_definition>
      </new_pattern_proposal>
    </module>
  </data_viz_modules>

  <tokens>
    <token element="Page background" token="--void" value="#070d0c (DESIGN.md Decision Record A: Shadcn --background)" />
    <token element="Card / SubmenuRail surface" token="--sf" value="#0d1a18 (Decision Record A: Shadcn --card, --sidebar)" />
    <token element="Portrait gradient far stop / card-hover elevated regions" token="--sfh" value="#1a3530 (Decision Record A: Shadcn --secondary/--accent surface)" />
    <token element="Popover / quick-peek surface" token="--sfm" value="#122420 (Decision Record A: Shadcn --popover)" />
    <token element="Primary body text (monogram, page title, card values)" token="--w" value="#ffffff" />
    <token element="Secondary text (role subtitle, submenu labels)" token="--wd" value="rgba(255,255,255,0.72)" />
    <token element="Muted text (N/A captions, xs metadata, scope summary)" token="--wm" value="rgba(255,255,255,0.55)" />
    <token element="Primary accent (page-title rule, active submenu border, focus ring)" token="--mt" value="#6db0c8 (post-p3 lightened value; Decision Record B Target 2)" />
    <token element="Destructive / error text" token="--redb" value="#e05555 (Decision Record D, DEFERRED-006 resolved)" />
    <token element="Impl-role materia (BE, FE, DS); Stamina bar fill" token="--mg" value="#4caf7d" />
    <token element="Command-role materia (PM, ORC)" token="--my" value="#e8c840" />
    <token element="Intel-role materia (RA, ST, AR); Skills chip color" token="--mb" value="#4a90d9" />
    <token element="Meta-role materia (UI, DI, HR)" token="--mp" value="#9b59b6" />
    <token element="Gate-role materia (CR, AU); Hooks chip color reserved separately" token="--mr" value="#e74c3c" />
    <token element="Hooks materia (used in Roster drill-down chips, not on the party card)" token="--mo" value="#e8914d" />
    <token element="Default card border" token="--bd" value="rgba(84,153,181,0.25)" />
    <token element="Hover / active-input border" token="--bdb" value="rgba(84,153,181,0.55)" />
    <token element="Submenu active-item background" token="--nav-active-bg" value="rgba(84,153,181,0.14) (existing named runtime token, globals.css)" />
    <token element="Card / portrait-frame radius" token="--radius-md" value="10px (DESIGN.md Border Radius table)" />
    <token element="Small element radius (RoleTag pill, StatBar track)" token="--radius-sm" value="6px" />
    <token element="Card padding, grid gap" token="space-4" value="16px" />
    <token element="Stat-bar internal gap" token="space-2" value="8px" />
    <token element="Submenu item gap" token="space-1" value="4px" />
    <token element="Page padding desktop" token="space-6" value="24px" />
    <token element="Page padding mobile" token="space-4" value="16px" />
    <token element="Monogram size/weight" token="2xl" value="22px / weight 600" />
    <token element="Agent code / card title size" token="lg" value="16px" />
    <token element="Stat-bar label/value size" token="sm" value="12px" />
    <token element="N/A caption, scope summary, timestamps" token="xs" value="10px, letter-spacing 0.12em uppercase (xs-only rule, DESIGN.md Typography)" />
  </tokens>

  <interactions>
    <interaction trigger="Hover or keyboard-focus a PartyMemberCard" response="Border brightens (--bd → --bdb); after a short delay, a Popover quick-peek shows exact stat values and as-of date." />
    <interaction trigger="Click / Enter a PartyMemberCard" response="Navigates to that agent's Roster detail drill-down (equipment/materia inventory, connectivity, spec history, revise-spec action)." />
    <interaction trigger="Click a SubmenuRail item" response="Navigates to the corresponding submenu (Roster / Sessions / Progression / Programs); the item receives the submenu-item-active state." />
    <interaction trigger="Click the empty-state CTA" response="Navigates to Roster, which renders the full 13-role catalog even with zero measured activity." />
    <interaction trigger="Click Retry in the error state" response="Re-issues the underlying data fetch (session.aggregateStats / equivalent) without a full page reload." />
    <interaction trigger="Collapse/expand SubmenuRail (desktop)" response="Width animates 240px ↔ 56px via the existing 200ms ease CSS transition already defined for the Collapsible sidebar Component Rule — no new transition introduced." />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="Page title, card titles, monogram (baseline)" foreground="--w (#ffffff)" background="--void (#070d0c)" ratio="21:1" wcag_level="AAA" />
      <pair element="Card body text, agent code labels" foreground="--w (#ffffff)" background="--sf (#0d1a18)" ratio="17.8:1" wcag_level="AAA" />
      <pair element="Portrait monogram text (on the portrait's gradient background, worst-case bound)" foreground="--w (#ffffff)" background="--sfh (#1a3530)" ratio="≈13.0:1 (derived — see note)" wcag_level="AAA" />
      <pair element="Secondary text (role subtitle, ScopeSummary body)" foreground="--wd (rgba(255,255,255,0.72))" background="--sf (#0d1a18)" ratio="9.6:1" wcag_level="AAA" />
      <pair element="Muted / N/A caption text (binding worst case)" foreground="--wm (rgba(255,255,255,0.55))" background="--sfh (#1a3530)" ratio="5.06:1" wcag_level="AA" />
      <pair element="Muted / N/A caption text (lighter surfaces)" foreground="--wm (rgba(255,255,255,0.55))" background="--sfm / --sf / --void" ratio="~7.0:1 – ~8.3:1" wcag_level="AAA" />
      <pair element="Active submenu label, page-title rule accent text" foreground="--mt (#6db0c8)" background="--sfh (#1a3530)" ratio="5.38:1" wcag_level="AA" />
      <pair element="Primary accent text on page background" foreground="--mt (#6db0c8)" background="--void (#070d0c)" ratio="8.12:1" wcag_level="AA+" />
      <pair element="Empty-state CTA button label" foreground="--void (#070d0c)" background="--mt (#6db0c8)" ratio="8.12:1" wcag_level="AA+" />
      <pair element="Error-state Alert message text" foreground="--redb (#e05555)" background="--void (#070d0c)" ratio="5.22:1" wcag_level="AA" />
    </contrast_pairs>
    <heading_structure>
h1 "Party Screen" (PageTitle) → h2 per submenu section header if the submenu list is rendered
with visible group labels (e.g. "Submenus") → h3 per PartyMemberCard's agent code (each card is
a labelled region, not a bare div) → h3 per drill-down destination's own page title (unchanged
from each existing surface's current heading level). No heading level is skipped.
    </heading_structure>
    <keyboard_flow>
Tab order: PageTitle region (non-interactive, skipped) → SubmenuRail items in list order (Roster,
Sessions, Progression, Programs) → PartyMemberCard grid in DOM/reading order (left-to-right,
top-to-bottom across the 3-column grid) → empty/error-state CTA or Retry button when that state
is active (replaces the card grid's tab stops entirely, not appended after them). Each
PartyMemberCard is a single tab stop (the whole card is the interactive target, not each stat bar
individually) with `aria-label` summarizing the card's agent code and role.
    </keyboard_flow>
    <aria_requirements>
- Each PartyMemberCard: `role="link"` or a native `&lt;a&gt;`/`&lt;button&gt;` element (not a bare
  clickable `div`), `aria-label`="{agent code}, {role category}. Activity {n}%, Stamina {n}%,
  Accuracy {n}% or not applicable."
- Each StatBar: per the StatBar pattern's own Accessibility Contract above
  (`role="progressbar"` + `aria-valuenow`/min/max, or the not-applicable `aria-label` variant).
- PortraitFrame's decorative role icon: `aria-hidden="true"` (the monogram text already carries
  the accessible name; the icon is pure flourish).
- EmptyPartyState and ErrorPartyState containers: `role="status"` (empty) / `role="alert"`
  (error) so assistive tech announces the state change without requiring focus to move there
  manually.
- SubmenuRail: `role="navigation"` with `aria-label="Party screen submenus"`; on mobile, the
  BottomTabBar fallback keeps its existing `role="tablist"`/`role="tab"` pattern, unchanged.
    </aria_requirements>
  </accessibility_spec>

  <legibility>
No text anywhere on this surface renders below the WCAG AA 4.5:1 threshold for normal-size text —
every text pairing used above traces to a contrast_pairs row at AA or better, all of which reuse
values already WCAG-verified in DESIGN.md's own Decision Records rather than freshly-computed
numbers (the one exception, the portrait monogram pairing, is explicitly marked "derived" and
computed using DESIGN.md's own published `--sfh` luminance value and WCAG formula, not a new
color). No red-on-void body text is used for anything except the already-ratified Alert
destructive-message pairing (DEFERRED-006 resolved, 5.22:1). Minimum text size on this surface is
`xs` (10px), reserved strictly for N/A captions and the ScopeSummary metadata line per DESIGN.md's
"xs-size labels only" tracking rule — no essential stat readout (the numbers a user actually needs
to compare across cards) renders below `sm` (12px). Materia-color borders and stat-bar fills are
used only as non-text, decorative/data-encoding elements (WCAG non-text 3:1 floor), never as the
background behind body text, and the portrait gradient's materia tint is capped at the same 0.12
opacity already established by the Role/type tag pattern specifically so it cannot push the
monogram's effective background luminance meaningfully below `--sfh`. No stat bar ever collapses
to a bare unlabeled "0%" — the explicit N/A state exists precisely to prevent an unreadable or
misleading number from standing in for missing data.
  </legibility>

  <shadcn_primitives>
For the eventual v2 React build (t4's static mockup APPROXIMATES all of the below in plain
HTML/CSS/JS — no React or Shadcn import in that artifact, per its own packet):
- `<Card>` — PartyMemberCard, SubmenuRail container
- `<Badge>` — RoleTag pill
- `<Progress>` — the three StatBar instances per card
- `<Button>` — SubmenuItem (variant="ghost"), empty-state CTA (variant="default"), error-state
  Retry (variant="outline")
- `<Popover>` — card hover/focus quick-peek
- `<Alert variant="destructive">` — ErrorPartyState
- `<Skeleton>` — loading-state placeholder cards
- `<Dialog>` — reserved for the Roster drill-down's "Revise this spec" action (opens the existing
  markdown editor in a modal context rather than a full route, matching how Edit is being
  absorbed per the vision doc) — not used on the party-screen surface itself
  </shadcn_primitives>

  <sample_data_appendix>
Lifted and curated from `session-data-inventory.md` (t1) §5.2's sample-data appendix — the
authoritative source; nothing below is a new number. Curated to the 6 "front row" party members
this spec selects for the home screen (by corpus-wide spawns + completes, descending). `Activity`
is spawn count normalized against the corpus-wide max (`FE` = 46, the anchor for 100%). `Stamina`
is derived per t1 §2.2's own formula (`1 − ghost_count/spawn_count`). `Accuracy` is t1 §2.1's
first-pass audit rate, populated only for the three Impl roles (`BE`/`FE`/`DS`) — the only roles
t1 computed this stat for; all other roles render the explicit N/A state, not a placeholder
number.

| Agent | Role category | Materia token | Spawns (t1 §5.2) | Ghost/stall | Activity (bar) | Stamina (bar, derived) | Accuracy (bar) |
|---|---|---|---|---|---|---|---|
| `FE` | Impl | `--mg` | 46 | 2 | 100% (anchor) | ≈95.7% (1 − 2/46) | 63% (22/35 first-pass, t1 §2.1) |
| `PM` | Command | `--my` | 25 | 0 | ≈54% (25/46) | 100% | N/A — not audit-gated |
| `AU` (merged AUDITOR+AUD+AU, t1 §4) | Gate | `--mr` | 38 | 0 | ≈83% (38/46) | 100% | N/A — renders audits, not audited |
| `AR` | Intel | `--mb` | 15 | 0 | ≈33% (15/46) | 100% | N/A — not audit-gated |
| `BE` | Impl | `--mg` | 16 | 3 | ≈35% (16/46) | ≈81.2% (1 − 3/16) | 100% (9/9 first-pass, t1 §2.1) |
| `CR` | Gate | `--mr` | 25 | 0 | ≈54% (25/46) | 100% | N/A — renders plan-gate verdicts (see t1 §2.4 block rate, a related but distinct stat surfaced in the Roster drill-down, not this card) |

**Not on the front-row grid, but worth carrying forward as an honest example inside the Roster
submenu (t1 §4/§5.2):** `DI` (Meta role, listed in DESIGN.md's Role/Materia Colors table) has
**zero** observed corpus occurrences across all 546 sampled events and no corresponding
`~/.claude/agents/*.md` spec file. Its Roster card should read "No corpus occurrences observed"
rather than a fabricated or zero-filled stat row — this is the same honesty discipline t1 applied
in its own appendix, carried through into the UI rather than smoothed over.

**Tokens/cost:** deliberately absent from this appendix and from every party-member card, per the
vision doc's "New Stats" section — the only real historical token figures in the corpus (a
one-off wave total from `prog-studio-sessions-2026-05-s1-backend-report.md`) are explicitly
NOT rendered here, because DEFERRED-P9-1 means there is no durable, schema-backed source. If a
future sprint adds a schema-backed token field and someone wants an MP-style bar, it MUST carry a
visible "projected / needs schema extension" label per the packet's cost-labeling rule; this spec
avoids the question entirely by shipping with no cost bar in v1 of the party screen.
  </sample_data_appendix>

  <notes>
- **App Type not declared as dashboard.** DESIGN.md does not set `App Type: dashboard`
  (defaults to `standard`), so `~/.claude/refs/design-system.md`'s strict Dashboard App Addendum
  SA-gate does not formally bind this app. The `<new_pattern_proposal>` above for `StatBar` is
  offered anyway, per this task's explicit packet instruction to bring
  `~/.claude/refs/dashboard-patterns.md` as required context and verify any citation against the
  live library — treat it as a voluntary rigor practice, not proof this app is dashboard-typed.
  Recommend the human/PM consider whether Studio should formally declare `App Type: dashboard` in
  a future `generate-design` pass, given this sprint's direction toward stat-bar-dense surfaces.
- **Token vocabulary choice.** This spec names runtime FF7 short tokens (`--mt`, `--sf`, …), not
  the abstract `--color-*` names at the top of DESIGN.md, because DESIGN.md's own Decision Record
  B instructs exactly that ("idealized names are human documentation only… match against the
  runtime short names"). See the companion vision doc's Open Ratification Question section for
  the full FF7-vs-Clarity naming discussion this choice sits inside of — this spec's token choice
  is NOT a resolution of that question, only a reflection of what DESIGN.md itself currently
  instructs implementers to do.
- **No MP/cost bar.** Deliberately omitted from every card (see sample_data_appendix). This
  satisfies the packet's cost-labeling requirement vacuously — there is nothing to label because
  nothing is rendered — which the packet itself calls the preferred outcome over a labeled-but-
  present aspirational bar.
- **Accuracy semantics kept narrow and honest.** The Accuracy bar shows ONLY the literal t1 §2.1
  first-pass audit rate, and only for the three roles t1 actually computed it for (`BE`/`FE`/
  `DS`). It would have been tempting to stretch `CR`'s plan-gate block rate or `AU`'s audit
  volume into a same-shaped "accuracy" number for those cards, but t1 never computed those as the
  same metric — doing so here would misrepresent the source data. Those roles' analogous stats
  (block rate, audit-render volume) belong in the Roster drill-down as their own distinctly
  labeled bars in a future iteration, not smuggled into this card under a borrowed label.
- **Six front-row cards, not all thirteen.** A deliberate density decision, not a technical
  limit — see the vision doc's Party Screen section for the full rationale (glanceability, no
  scroll on a standard viewport, "declutters aggressively" per the ORC-EVAL evidence t2 cited).
- **Skill invocation value-rate (t1 §2.5) and spec version-bump history (t1 §2.9)** are real,
  corpus-verified AVAILABLE-NOW candidates this spec does NOT put on the default party card —
  they are earmarked for the Roster agent-detail drill-down (skills/materia mastery view) and the
  Progression cross-link (spec-revision "ability learned" log) respectively, both named in
  submenu_structure above. Flagging this explicitly so t4 and any future implementer know these
  were considered and intentionally deferred, not overlooked.
  </notes>
</design_spec>
