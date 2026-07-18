# Task Decomposition — prog-studio-v2-2026-07-s2-party-shell

**PM#0** | task_id: `prog-studio-v2-2026-07-s2-party-shell` | generated: 2026-07-07
Primary output for ORC. All packets are **frontend** (client-only). 6 packets, dependency-ordered
with one parallel pair (t1 ∥ t2).

---

## Pre-write findings (load-bearing; drove the partition)

1. **Compiler-exhaustive coupling.** `packages/client/src/components/ModeContent.tsx` declares
   `PAGE_MAP: Record<AppMode, React.ComponentType>`. Adding `'party'` to the `AppMode` union in
   `store/ui-store.ts` therefore forces a matching `PAGE_MAP['party']` key or `tsc` fails. The
   AppMode addition + PAGE_MAP entry + default-route flip MUST land atomically **and** `PartyPage`
   must already exist. → these three edits are isolated in the final wiring packet (t5), which
   depends on the PartyPage packet (t4).
2. **Named Shadcn primitives are not installed.** `components/ui/` contains only `button`,
   `popover`, `dialog`, `select`, `input`, `textarea`, `shimmer-box`, `error-state`. The spec names
   `<Card> <Badge> <Progress> <Skeleton> <Alert>`. Per DRY + the FF7/Shadcn collision gotcha
   (memorized S2 bug — raw Shadcn tokens → invisible text), the plan REUSES `shimmer-box` (loading),
   `error-state` (error), `popover`, `button`, and builds PartyMemberCard / StatBar / RoleTag as
   **custom FF7-tokened components** rather than installing collision-prone raw primitives. This is
   an interpretation of the spec — flagged for Critic ratification in `<risk_flags>`.
3. **`globals.css` is not written by any packet.** Every state class the spec reuses
   (`.skeleton-shimmer`/`shimmer` keyframe, `.tab-item:focus-visible`, `--nav-active-bg`, all FF7
   tokens) already exists. Decision Record C single-writer contract → reference-by-name only. No
   globals.css shared-file serialization needed.
4. **Rail mounts inside PartyPage this sprint, not the global shell.** Mounting the rail in
   `AppShell.tsx` (global) would require either rewriting the `.app-shell` grid (globals.css
   single-writer risk) or shifting every v1 surface right (regression risk vs constraint 2). The
   rail is built as a **self-contained, hoistable component**; s4 (its declared seam consumer)
   lifts it into the shell when it removes BottomTabBar. Flagged.
5. **Two ui-store writers, serialized.** t1 adds the selected-agent contract (non-breaking); t5 adds
   `'party'` + default flip (breaking-if-alone, atomic with PAGE_MAP). Explicit
   `append_serialization: {ui-store.ts: [t1 → t5]}`; t5 re-reads fresh; dep chain t1→t3→t4→t5
   guarantees t1 audit PASS before t5 dispatches (G4).

---

<task_decomposition task_id="prog-studio-v2-2026-07-s2-party-shell" agent_count="6">
<task_packets>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s2-t1</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
Foundation seam: the selected-agent store contract (s2-to-s3-nav-contract, store half) and the rail
navigation constants (s2-to-s4-nav-shell, constants half). NON-BREAKING additions only.

(A) `packages/client/src/store/ui-store.ts` — add to `UIState` and the store:
    - `selectedAgentCode: string | null` (initial `null`)
    - `setSelectedAgentCode: (code: string | null) => void`
    Do NOT touch the `AppMode` union, the initial `activeMode` value, or `partialize` in this packet
    (those are t5's atomic wiring). `selectedAgentCode` is ephemeral — leave `partialize` persisting
    ONLY `muted`, unchanged.

(B) `packages/client/src/constants/navigation.ts` — add a NEW exported constant `RAIL_ITEMS`
    (do not alter `NAV_ITEMS`). Shape mirrors the spec's SubmenuRail (submenu_structure): an ordered
    array of 4 items, each `{ label, mode, icon }` where `icon` is a lucide-react component reference:
    - Roster      → mode `'browse'`  (INTERIM: s3 introduces a dedicated roster/agent-detail mode;
                                       Browse is today's agent-catalog surface Roster absorbs),
                    lucide `Users`
    - Sessions    → mode `'sessions'`,     lucide `FileClock`
    - Progression → mode `'progression'`,  lucide `TrendingUp`
    - Programs    → mode `'programs'`,      lucide `GitBranch`
    Add a one-line comment on the Roster row marking the interim `'browse'` mapping for s3.
  </description>
  <success_criteria>
- `npm run lint` (tsc --noEmit ×3) clean after the changes.
- `useUIStore.getState().selectedAgentCode === null` and `setSelectedAgentCode('FE')` then reading
  the store yields `'FE'` (assert via a small vitest test OR the t6 e2e; a colocated store vitest is
  acceptable).
- `RAIL_ITEMS` exports 4 items in the order Roster, Sessions, Progression, Programs, each with a
  lucide icon reference and a `mode` that is a member of the CURRENT `AppMode` union (`browse`,
  `sessions`, `progression`, `programs`) — verified by `tsc` typing the `mode` field as `AppMode`.
- `NAV_ITEMS` byte-unchanged in behavior (BottomTabBar unaffected).
  </success_criteria>
  <context_files>
packages/client/src/store/ui-store.ts
packages/client/src/constants/navigation.ts
docs/v2-vision/v2-design-spec.md  (submenu_structure + component_hierarchy SubmenuItem icons)
  </context_files>
  <dependencies>NONE</dependencies>
  <out_of_scope>
- Do NOT add `'party'` to `AppMode`, change the initial `activeMode`, or edit `partialize` (t5 owns).
- Do NOT edit `NAV_ITEMS` or `BottomTabBar.tsx`.
- Do NOT build the rail component here (t3 owns SubmenuRail); this packet is constants + store only.
- No server/shared edits.
  </out_of_scope>
  <estimated_new_lines>~22</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>selectedAgentCode + setSelectedAgentCode added to UIState and store implementation</item>
      <item>RAIL_ITEMS constant with the 4 items typed against AppMode</item>
      <item>integration_status LIVE (pure client additions, no external data)</item>
    </must_contain>
    <must_not_contain>
      <item>any change to the AppMode union or initial activeMode</item>
      <item>any edit to NAV_ITEMS, BottomTabBar, or partialize</item>
      <item>raw hex color values</item>
    </must_not_contain>
    <success_signal>tsc ×3 clean; store getters/setters present; RAIL_ITEMS length 4 correctly ordered</success_signal>
  </output_expected>
  <output_path>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t1-FE-{unix_ts}.md</output_path>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s2-t2</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
Leaf visual primitives (pure, prop-driven, no data fetch, no store). Two new files under
`packages/client/src/components/party/`:

(A) `PortraitFrame.tsx` — asset-free portrait per spec portrait_treatment. Props:
    `{ code: string; materiaColorKey: string; portraitSeed: string }`. Square region radius
    `--radius-md`, two-stop linear gradient from a 0.12-alpha tint of the role materia token at one
    corner to `--sfh` at the opposite corner; 2px solid full-saturation `var(--{materiaColorKey})`
    border; centered 2–3-letter monogram (`--w`, 2xl/22px, weight 600). One optional lucide role
    icon bottom-right, 50% opacity, `aria-hidden="true"`. NO box-shadow / glow (Constitution forbids).
    VERIFY-THEN-IMPLEMENT the alpha-tint mechanism: derive `rgba(materia, 0.12)` WITHOUT introducing
    raw hex — use `color-mix(in srgb, var(--{token}) 12%, transparent)` OR whatever existing tint
    utility `components/browse/AgentCard.tsx` already uses; confirm which by inspecting AgentCard
    before writing. `materiaColorKey` arrives as a runtime token NAME (e.g. `'--mg'`), never a hex.

(B) `StatBar.tsx` — the spec's `<new_pattern_proposal name="StatBar">` (this is the `<Progress>`
    equivalent; do NOT install a Shadcn Progress primitive). Props:
    `{ label: string; normalized: number | null; fillToken: string; valueLabel?: string; reason?: string }`.
    - Track: background `--sfh`, radius `--radius-sm`, 6px height. Filled segment width `normalized%`
      in `var(--{fillToken})`.
    - Label above (`sm`, `--wd`); numeric readout inline right-aligned (`sm`, `--w`) = `{normalized}%`
      (or `valueLabel` when provided).
    - When `normalized === null`: render 0-width track and replace the readout with
      `"N/A — {reason}"` caption in `--wm` — NEVER a bare `0%`.
    - a11y: `role="progressbar"` + `aria-valuenow`/`aria-valuemin="0"`/`aria-valuemax="100"` +
      `aria-label="{label}: {normalized}%"` when not null; when null, OMIT `aria-valuenow` and set
      `aria-label="{label}: not applicable, {reason}"`.
    - Do NOT render any feasibility tag / "projected" chrome (spec: feasibility is doc-only, not
      end-user chrome; and no projected stat renders this sprint).

(C) Colocated vitest `StatBar.test.tsx` (or `packages/client/tests/unit/StatBar.test.tsx` per repo
    convention — verify where existing client unit tests live) covering: value → correct width% and
    progressbar aria; `null` → N/A caption text present, no `aria-valuenow`, `aria-label` carries the
    reason. This is the pure-logic vitest required by constraint 8.
  </description>
  <success_criteria>
- `npm run lint` (tsc ×3) clean; both components default-or-named-export cleanly and render in
  isolation (a trivial mount test compiles).
- StatBar vitest green: (a) `normalized=63` → element with `role="progressbar"`, `aria-valuenow="63"`,
  visible `63%`; (b) `normalized=null, reason="not audit-gated"` → text `N/A — not audit-gated`
  present, NO `aria-valuenow` attribute, `aria-label` contains `not applicable` and the reason.
- No raw hex color literals anywhere in either file (colors via `var(--token)` / token-mapped
  Tailwind / `color-mix` on tokens) — ORC greps `#[0-9a-fA-F]{6}` in the two files, expects 0
  matches outside provenance comments.
- PortraitFrame emits no `box-shadow` glow.
  </success_criteria>
  <context_files>
docs/v2-vision/v2-design-spec.md  (portrait_treatment; data_viz_modules StatBar; states statbar-not-applicable; tokens; accessibility_spec.contrast_pairs)
packages/shared/src/schemas.ts  (PartyStatBarSchema lines 392-400 — the exact stat shape StatBar props mirror)
packages/client/src/components/browse/AgentCard.tsx  (DRY reference for existing card token/tint conventions — inspect before choosing the tint mechanism; do not modify)
packages/client/src/globals.css  (reference the named tokens/radii only — do NOT modify)
  </context_files>
  <dependencies>NONE  (parallel with t1)</dependencies>
  <out_of_scope>
- No data fetching, no tRPC, no store access — these are pure prop-driven leaves.
- Do NOT install any Shadcn primitive (Card/Badge/Progress/Skeleton/Alert). StatBar IS the Progress
  replacement.
- Do NOT render feasibility/"projected" tags.
- Do NOT modify globals.css, AgentCard, or any existing file.
- No server/shared edits.
  </out_of_scope>
  <estimated_new_lines>~135 (PortraitFrame ~45, StatBar ~55, test ~35). JUSTIFICATION for >100: two
  atomically-small leaf primitives plus a colocated unit test; each is a single cohesive component
  and splitting further would create sub-30-line packets and push the sprint past the 6-packet
  ceiling. File-count guard (≤2 source files) is satisfied.</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>PortraitFrame.tsx and StatBar.tsx under components/party/</item>
      <item>StatBar null → "N/A — {reason}" branch with aria-label variant</item>
      <item>vitest results (green) for the StatBar cases</item>
      <item>tint mechanism chosen + which existing file it was verified against</item>
    </must_contain>
    <must_not_contain>
      <item>raw hex color values in color positions</item>
      <item>box-shadow glow on the portrait</item>
      <item>any Shadcn Progress/Card import; any feasibility tag chrome</item>
    </must_not_contain>
    <success_signal>tsc ×3 clean; StatBar vitest green; no-hex grep clean</success_signal>
  </output_expected>
  <output_path>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t2-FE-{unix_ts}.md</output_path>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s2-t3</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
The two interactive composed components. Two new files under `packages/client/src/components/party/`:

(A) `PartyMemberCard.tsx` — composes PortraitFrame + 3× StatBar + an inline RoleTag pill + a
    hover/focus Popover quick-peek. Props: `{ member: PartyMember; onSelect: (code: string) => void }`
    (store-agnostic — receives the select callback; PartyPage wires it in t4). Structure per spec
    component_hierarchy:
    - Whole card is ONE focusable/clickable target: a native `<button>` or `role="link"` element
      (never a bare clickable div), `aria-label` = `"{code}, {roleCategory}. Activity {n}%, Stamina
      {n}%, Accuracy {n}% or not applicable."` (compose from the member's stats).
    - RoleTag: inline pill, color = `var(--{materiaColorKey})`, background = 0.12-alpha tint, border
      = 0.25-alpha tint, no solid fill (same tint mechanism t2 established). Text = roleCategory.
    - StatBar mapping (fillToken per bar): Activity → `member.materiaColorKey`; Stamina → `'--mg'`;
      Accuracy → `member.materiaColorKey`. Feed each bar `normalized`/`reason` from the matching
      `member.stats[]` entry (match by `label`). N/A is data-driven (server sends `normalized:null` +
      `reason` for non-Impl Accuracy) — do not special-case per role in the card.
    - States: card-hover (border `--bd` → `--bdb`, no glow); card-focus-visible (reuse
      `.tab-item:focus-visible` — 2px `--mt`, offset 2px); card-active-pressed (reuse
      `--nav-active-bg` wash). Reuse existing classes/tokens by NAME.
    - Popover quick-peek (REUSE `components/ui/popover.tsx`): on hover/focus-visible after a short
      delay, show each stat's exact raw values and the member's `lastActivityTs` ("as of" date).
      Surface `--sfm` popover token. NO feasibility tags. (Carry-in: p11 AUD#4.)
    - Click / Enter → `onSelect(member.code)`.

(B) `SubmenuRail.tsx` — self-contained, hoistable nav rail (s2-to-s4-nav-shell component). Reads
    `useUIStore` (`activeMode`, `setActiveMode`) directly (mirrors BottomTabBar's pattern) and maps
    `RAIL_ITEMS` (from t1). Vertical rail of Shadcn-ghost-style `<Button>` items (REUSE
    `components/ui/button.tsx` with explicit FF7 tokens). `role="navigation"`
    `aria-label="Party screen submenus"`. Active item: left `2px solid var(--mt)` +
    `background: var(--nav-active-bg)` (submenu-item-active state). Each item: lucide icon + label,
    keyboard-focusable, focus ring via `.tab-item:focus-visible`. Click → `setActiveMode(item.mode)`.
    Desktop-only visibility is applied where it MOUNTS (t4 wraps it with the responsive container);
    the rail itself renders its items unconditionally.
  </description>
  <success_criteria>
- `npm run lint` (tsc ×3) clean; both components compile and render with a typed mock `PartyMember`.
- PartyMemberCard renders as a single native interactive element (button/anchor) — assert one
  interactive tab stop per card in t6 e2e; `aria-label` includes code, roleCategory, and all three
  stat readouts (or "not applicable").
- RoleTag renders with token color + alpha-tint bg/border, no solid fill, no raw hex.
- SubmenuRail renders 4 items in RAIL_ITEMS order with `role="navigation"` and the documented
  aria-label; clicking each item calls `setActiveMode` with the mapped mode (asserted in t6).
- Card hover/focus surfaces the Popover quick-peek containing raw stat values + `lastActivityTs`
  (asserted in t6). No box-shadow glow on hover.
- No raw hex literals in either file (ORC grep clean).
  </success_criteria>
  <context_files>
docs/v2-vision/v2-design-spec.md  (component_hierarchy; states card-hover/focus/active + submenu-item-active; interactions; aria_requirements; keyboard_flow)
packages/client/src/components/party/PortraitFrame.tsx  (from t2)
packages/client/src/components/party/StatBar.tsx  (from t2)
packages/client/src/components/ui/popover.tsx
packages/client/src/components/ui/button.tsx
packages/client/src/constants/navigation.ts  (RAIL_ITEMS from t1)
packages/client/src/store/ui-store.ts  (activeMode/setActiveMode)
packages/client/src/components/BottomTabBar.tsx  (DRY reference for the store-driven nav pattern — do not modify)
packages/shared/src/schemas.ts  (PartyMember type)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s2-t1, prog-studio-v2-2026-07-s2-t2</dependencies>
  <out_of_scope>
- Do NOT mount either component in AppShell or PartyPage (t4 mounts them); no shell/grid edits.
- Do NOT read/write `selectedAgentCode` inside PartyMemberCard — it takes `onSelect` prop (t4 wires
  the store). SubmenuRail may read the store for activeMode/setActiveMode only.
- Do NOT edit navigation.ts, ui-store.ts, BottomTabBar, or globals.css.
- Do NOT render a cost/MP bar or any feasibility "projected" tag.
- No new Shadcn primitives; no server/shared edits.
  </out_of_scope>
  <estimated_new_lines>~180 (PartyMemberCard ~110, SubmenuRail ~70). JUSTIFICATION for >100:
  PartyMemberCard is a single indivisible aria/keyboard/popover contract (splitting the portrait,
  stat bars, roletag, and popover into separate packets would fracture one focusable interactive
  unit); SubmenuRail is the second, distinct interactive primitive. File-count guard (≤2 source
  files, two DISTINCT components) is satisfied; a further split would exceed the 6-packet ceiling.</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>PartyMemberCard.tsx (single interactive element, full aria-label, Popover quick-peek)</item>
      <item>SubmenuRail.tsx (role=navigation, RAIL_ITEMS-driven, submenu-item-active state)</item>
      <item>StatBar fillToken mapping documented (Activity/Accuracy=materia, Stamina=--mg)</item>
    </must_contain>
    <must_not_contain>
      <item>bare clickable div for the card; box-shadow glow</item>
      <item>direct selectedAgentCode access inside the card; any shell/grid mount</item>
      <item>raw hex; feasibility/cost chrome</item>
    </must_not_contain>
    <success_signal>tsc ×3 clean; components render with mock; no-hex grep clean</success_signal>
  </output_expected>
  <output_path>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t3-FE-{unix_ts}.md</output_path>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s2-t4</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
The Party page: composition, live data fetch, ALL spec states, header, diagnostics affordance, rail
mount. Two new files:

(A) `packages/client/src/hooks/useParty.ts` — data-fetch hook wrapping `roster.getParty`.
    VERIFY-THEN-IMPLEMENT: confirm the client tRPC proxy exposes `trpc.roster.getParty.useQuery`
    (roster router landed in s1; the client `AppRouter` type should pick it up automatically — inspect
    an existing data hook, e.g. under `hooks/` or how a sessions page fetches, to match the repo's
    react-query pattern). If `roster` is NOT exposed on the client proxy, STOP and FLAG a schema/type
    gap (do NOT edit server/shared). Return `{ data, isLoading, isError, refetch }` where `data` is
    the `PartyStats` envelope `{ members, diagnostics, activityAnchor }`.

(B) `packages/client/src/pages/PartyPage.tsx` (default export — ModeContent imports default) —
    composes the surface:
    - PartyScreenHeader (inline): PageTitle "Party Screen" (h1; `lg`, weight 600, `--w`, preceded by
      the 2px×18px `--mt` vertical rule) + ScopeSummary (`xs`, `--wm`, uppercase 0.12em):
      "{members.length}-agent roster · updated {most-recent member.lastActivityTs, formatted}".
    - Responsive 2-column layout: SubmenuRail (from t3) as the LEFT column, visible on `lg`+ only
      (`hidden lg:flex` or equivalent — the rail is NOT rendered on mobile; BottomTabBar, untouched,
      covers small-viewport nav this sprint); PartyGrid as the main column
      (3-col `lg`, 2-col `md`, 1-col `sm`; gap `space-4`; page padding `space-6` desktop / `space-4`
      mobile). Inherit the existing AppShell content container width — NO new max-width token.
    - PartyGrid renders exactly one of the mutually-exclusive states:
      * loading (query pending): 6 skeleton placeholder cards — REUSE `components/ui/shimmer-box.tsx`
        and/or `components/browse/SkeletonCard.tsx` (verify their API first; do NOT install a Shadcn
        Skeleton). No page-level spinner.
      * empty (`members.length === 0`): EmptyPartyState — `role="status"`, lucide `Users` (`--wm`
        tint), heading "No Active Party Members Yet" (`lg`,`--w`), body "No agent activity found in
        the configured session sources for this window." (`sm`,`--wd`), CTA `<Button variant="default">`
        "View Full Roster" → `setActiveMode('browse')`.
      * error (query error): ErrorPartyState — `role="alert"`, REUSE `components/ui/error-state.tsx`
        (verify it supports a message + a Retry action; if it lacks a Retry slot, compose with
        `ui/button.tsx`). Left-border accent `--redb`, message "Couldn't load party data — {error}.",
        `<Button variant="outline">` "Retry" → `refetch()`.
      * default: `members.slice(0, 6)` mapped to `PartyMemberCard`, `onSelect={(code) => {
        setSelectedAgentCode(code); setActiveMode('browse'); }}` (INTERIM: sets the s3 selected-agent
        contract and routes to the interim Roster surface; s3 repoints to the dedicated agent-detail
        route). Which 6 members and their order are server-owned (s1 sorts by activity recency); FE
        renders what it is given, capped at 6.
    - Diagnostics affordance (program.md §5 note 1): an UNOBTRUSIVE `xs`/`--wm` footnote below the
      grid, rendered only when `diagnostics.invalidLineCount > 0 || diagnostics.uncountedEventTypes >
      0`, reading e.g. "data quality: {invalidLineCount} unparsed lines · {uncountedEventTypes}
      uncounted event types". Non-blocking, non-modal.
  </description>
  <success_criteria>
- `npm run lint` (tsc ×3) clean; client build passing.
- With the dev server up and `roster.getParty` returning live non-empty data, PartyPage renders the
  default state: up to 6 PartyMemberCards, the header title + scope summary, and the desktop rail
  (asserted headless in t6; this packet's own check is a manual/dev-server render confirmation +
  build pass).
- All four PartyGrid states are reachable and correct (loading skeleton, empty w/ CTA→browse, error
  w/ Retry→refetch, default) — the STATE LOGIC is unit-testable here; the rendered-interaction
  assertions are owned by t6.
- Diagnostics footnote appears only when invalid/uncounted counts are non-zero; is `xs`/`--wm`; does
  not obstruct the grid.
- No raw hex; all colors via FF7 tokens (ORC grep clean on PartyPage.tsx + useParty.ts).
- `useParty` returns the `{ members, diagnostics, activityAnchor }` envelope typed via
  `z.infer<typeof PartyStatsSchema>` (no re-declared local shape).
- integration_status: LIVE by packet close (MOCKED intermediate documented if s1 env not up at start).
  </success_criteria>
  <context_files>
docs/v2-vision/v2-design-spec.md  (states loading/empty/error; layout + responsive; header/ScopeSummary; sample_data_appendix; legibility)
packages/shared/src/schemas.ts  (PartyStatsSchema envelope lines 402-425)
packages/client/src/components/party/PartyMemberCard.tsx  (from t3)
packages/client/src/components/party/SubmenuRail.tsx  (from t3)
packages/client/src/components/ui/shimmer-box.tsx  (verify API; reuse for skeletons)
packages/client/src/components/browse/SkeletonCard.tsx  (verify API; candidate skeleton reuse)
packages/client/src/components/ui/error-state.tsx  (verify API; reuse for error state)
packages/client/src/components/ui/button.tsx
packages/client/src/store/ui-store.ts  (setActiveMode; setSelectedAgentCode from t1)
packages/client/src/hooks/  (inspect an existing data hook for the tRPC react-query pattern)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s2-t3</dependencies>
  <out_of_scope>
- Do NOT edit AppShell.tsx, ModeContent.tsx, or ui-store's AppMode/default (t5 owns wiring). PartyPage
  is authored now but only becomes reachable after t5 adds the PAGE_MAP entry.
- Do NOT install Shadcn Skeleton/Alert; reuse shimmer-box/error-state.
- Do NOT modify BottomTabBar or globals.css. Do NOT render a cost/MP bar.
- Do NOT edit server/shared. If `roster` is not on the client tRPC proxy, FLAG (don't fix here).
- Do NOT add a "Party/Home" affordance to the rail (spec's 4 rail items only).
  </out_of_scope>
  <estimated_new_lines>~150 (PartyPage ~120, useParty ~30). JUSTIFICATION for >100: a page that hosts
  four mutually-exclusive states + header + rail mount + diagnostics footnote is the single largest
  view file by nature; extracting each state into its own component would balloon the file count well
  past ≤2 and duplicate the container. Hook kept minimal. File-count guard satisfied (page + its hook,
  coupled).</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>PartyPage.tsx default export composing all 4 states + header + desktop rail mount + diagnostics footnote</item>
      <item>useParty.ts consuming roster.getParty, returning the PartyStats envelope typed via z.infer</item>
      <item>onSelect wiring: setSelectedAgentCode(code) + setActiveMode('browse') interim</item>
      <item>integration_status LIVE (or documented MOCKED intermediate)</item>
    </must_contain>
    <must_not_contain>
      <item>edits to AppShell/ModeContent/AppMode/globals.css/BottomTabBar</item>
      <item>re-declared PartyStats shape (must use z.infer)</item>
      <item>Shadcn Skeleton/Alert install; raw hex; cost bar</item>
    </must_not_contain>
    <success_signal>tsc ×3 clean; build passing; dev-server render shows live cards + all states reachable</success_signal>
  </output_expected>
  <output_path>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t4-FE-{unix_ts}.md</output_path>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s2-t5</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>BLOCKER</priority>
  <description>
Atomic shell wiring — makes `'party'` the DEFAULT route. These three edits MUST land together (the
`AppMode`↔`PAGE_MAP` compiler-exhaustive invariant). RE-READ `ui-store.ts` fresh from disk first
(t1 already modified it — this is the SECOND, serialized writer per G4).

(A) `packages/client/src/store/ui-store.ts`:
    - Add `'party'` to the `AppMode` union type (make it the FIRST member for readability, or append —
      either is fine).
    - Change the initial `activeMode` from `'browse'` to `'party'`.
    - Update the `partialize` comment that currently says "activeMode must reset to 'browse' on
      hydrate" → "'party'". (partialize STILL persists only `muted`; do not persist activeMode.)
    - Leave t1's `selectedAgentCode`/`setSelectedAgentCode` intact.

(B) `packages/client/src/components/ModeContent.tsx`:
    - `import PartyPage from '../pages/PartyPage';`
    - Add `party: PartyPage,` to `PAGE_MAP` (this satisfies the `Record<AppMode, ...>` exhaustiveness
      the new union member demands).

No other files. BottomTabBar and its `NAV_ITEMS` remain untouched (9 tabs, s4 owns removal). AppShell
untouched (rail is mounted inside PartyPage per t4).
  </description>
  <success_criteria>
- `npm run lint` (tsc ×3) clean — specifically, `PAGE_MAP` is exhaustive over the widened `AppMode`
  union (this is the compiler proof that the union+map landed atomically).
- On a fresh load with cleared persisted store, `useUIStore.getState().activeMode === 'party'` and
  ModeContent renders `PartyPage` (asserted headless in t6; build pass is this packet's own gate).
- Client build passing.
- BottomTabBar still renders its existing 9 `NAV_ITEMS` and every existing surface (browse, compose,
  edit, export, sessions, graph, progression, planning, programs) still routes with no regression
  (t6 asserts a couple of existing routes still switch).
- `selectedAgentCode` contract from t1 is unchanged and present.
  </success_criteria>
  <context_files>
packages/client/src/store/ui-store.ts  (re-read fresh — 2nd serialized writer)
packages/client/src/components/ModeContent.tsx
packages/client/src/pages/PartyPage.tsx  (from t4 — the default export being wired)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s2-t4</dependencies>
  <out_of_scope>
- Do NOT edit NAV_ITEMS, BottomTabBar, AppShell, navigation.ts, or globals.css.
- Do NOT alter t1's selectedAgentCode fields or t4's PartyPage.
- Do NOT add a 'roster' AppMode (s3 owns it); Roster rail item stays mapped to 'browse'.
- No server/shared edits.
  </out_of_scope>
  <estimated_new_lines>~15</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>'party' added to AppMode union AND to PAGE_MAP (atomic)</item>
      <item>initial activeMode changed to 'party'; partialize comment updated</item>
      <item>confirmation tsc exhaustiveness passes</item>
    </must_contain>
    <must_not_contain>
      <item>any edit to NAV_ITEMS/BottomTabBar/AppShell/navigation.ts/globals.css</item>
      <item>a new 'roster' AppMode; persisting activeMode</item>
      <item>regression to existing PAGE_MAP entries</item>
    </must_not_contain>
    <success_signal>tsc ×3 clean with exhaustive PAGE_MAP; build passing; default route = party</success_signal>
  </output_expected>
  <output_path>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t5-FE-{unix_ts}.md</output_path>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s2-t6</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
Runtime gates — FE owns ALL interaction-class SCs via CLI Playwright (constraint 5; the auditor MCP
set has no interaction primitives). ONE new Tier-2 e2e spec:
`packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts`.

Manage the dev-server lifecycle (or reuse ORC's running server — record the exact commands used;
GANDER_ROOT + LOADOUTS_DIR must be set so `roster.getParty` returns live data). Run via
`npx playwright test` from `packages/client` with `playwright.config.ts`. Cover:

1. DEFAULT ROUTE: on fresh load (cleared storage), the party screen renders — PageTitle "Party
   Screen" visible, ≥1 PartyMemberCard with a visible agent code, up to 6 cards.
2. RAIL NAV (SC4): clicking the SubmenuRail "Sessions", "Progression", "Programs" items switches
   `activeMode` / renders the corresponding surface. (Roster→browse interim may be asserted too, but
   the binding SC is the three KEEP surfaces.)
3. POPOVER QUICK-PEEK (carry-in p11 AUD#4): hover/focus a card → the Popover appears showing raw
   stat values + the as-of date.
4. STATES: assert the default state; drive loading (intercept/delay the roster.getParty response →
   6 skeletons), empty (route-mock zero members → `role="status"` + CTA), and error (route-mock
   failure → `role="alert"` + Retry that refetches). Use Playwright route interception for the
   mocked states so the live path stays the default assertion.
5. A11Y KEYBOARD (carry-in): Tab order = rail items (Roster, Sessions, Progression, Programs) → cards
   in DOM order; each card is a SINGLE tab stop and is a native interactive element (button/anchor);
   focus-visible ring present. `PartyMemberCard` exposes the documented composite `aria-label`;
   StatBars expose progressbar aria (or the N/A aria variant).
6. LEGIBILITY (SC2): no clipped/overlapping text on the party surface at desktop + mobile widths
   (assert no horizontal overflow on the grid container; screenshot capture for human adjudication at
   Step 4.5). Spot-check that rendered text colors resolve to spec contrast_pairs pairings (foreground
   token over the expected surface token) — the contrast_pairs table is CANONICAL.
7. NO REGRESSION (SC4): BottomTabBar still shows its 9 tabs; switching to at least two existing
   surfaces (e.g. sessions, programs) via BottomTabBar still works.

Record every command run (server start, playwright invocation) and the headless pass/fail in the
completion packet.
  </description>
  <success_criteria>
- The spec file exists at the named path and `npx playwright test <spec>` is GREEN headless.
- Assertions 1–7 above are all present and passing; the three KEEP rail destinations and the popover
  and the keyboard tab order are explicitly asserted (these are the interaction SCs no static audit
  can prove).
- The mocked loading/empty/error states are each driven and asserted via route interception; the
  default assertion uses LIVE `roster.getParty` data.
- Commands to reproduce (server lifecycle + playwright) are recorded in the packet.
- `npm run lint` (tsc ×3) still clean (the spec compiles under the client tsconfig/e2e setup).
  </success_criteria>
  <context_files>
packages/client/playwright.config.ts
packages/client/tests/e2e/gander-studio-p9-sessions-feed-agentstats-t5.spec.ts  (recent Tier-2 pattern reference)
packages/client/tests/e2e/layout-sidebar-removal.spec.ts  (nav-switch assertion reference)
docs/v2-vision/v2-design-spec.md  (states; keyboard_flow; aria_requirements; accessibility_spec.contrast_pairs)
packages/client/src/pages/PartyPage.tsx  (selectors/roles under test — from t4)
packages/client/src/components/party/  (PartyMemberCard/SubmenuRail roles + aria — from t3)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s2-t5</dependencies>
  <out_of_scope>
- Do NOT modify any source component/page/store to make a test pass — if a real defect surfaces,
  FLAG it back for the owning packet's remediation (no test-driven source edits here).
- Do NOT edit playwright.config.ts unless a project setup gap blocks the run (FLAG first).
- Do NOT push, commit, or run shared-state mutators. No server/shared edits.
  </out_of_scope>
  <estimated_new_lines>~160 (single e2e spec). JUSTIFICATION for >100: this is a test artifact (not
  shipped codebase surface area) and it is the sole runtime-gate owner for the sprint's entire
  interaction/a11y/state/legibility SC set — consolidating them in one spec keeps server lifecycle
  and fixtures single-sourced. File-count guard satisfied (1 file).</estimated_new_lines>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>e2e spec file at packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts</item>
      <item>green headless run output + reproduce commands (server + playwright)</item>
      <item>explicit assertions for rail nav (3 KEEP), popover, keyboard tab order, all 4 states, no-regression</item>
    </must_contain>
    <must_not_contain>
      <item>edits to source components/pages/store to pass a test</item>
      <item>TIER_1_ONLY / skipped interaction assertions</item>
      <item>push/commit actions</item>
    </must_not_contain>
    <success_signal>playwright green headless; spec file exists; all 7 assertion groups present</success_signal>
  </output_expected>
  <output_path>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t6-FE-{unix_ts}.md</output_path>
</task_packet>

</task_packets>

<dependency_order>
  <!-- Parallel pair, then a serial spine. -->
  t1 (store contract + rail constants)      [no deps]   ─┐
  t2 (PortraitFrame + StatBar leaves)        [no deps]   ─┤  (t1 ∥ t2 — DISJOINT files, safe parallel)
                                                          ▼
  t3 (PartyMemberCard + SubmenuRail)   DEPENDS ON t1, t2
                                                          ▼
  t4 (PartyPage + useParty)            DEPENDS ON t3
                                                          ▼
  t5 (AppMode+PAGE_MAP+default wiring) DEPENDS ON t4   [2nd ui-store writer; serialized after t1]
                                                          ▼
  t6 (Playwright Tier-2 runtime gates) DEPENDS ON t5

  Linear-with-one-parallel-pair: {t1 ∥ t2} → t3 → t4 → t5 → t6.
</dependency_order>

<routing_notes>
  <!-- Step 0.5 recurring-pattern preflight. Source §6 tables pre-extracted into the brief's
       pm_preflight_checklist + prior_sprint_gaps (budget discipline: brief excerpts are the
       canonical excerpt to avoid re-reading 3 after-actions). Enumerated below with disposition. -->
  <recurring_pattern source="prog-studio-v2-2026-07-s1-data-layer.md §6 G1">Plan-time corpus-fact
    assertions must carry a measured citation or be phrased verify-then-implement.
    DISPOSITION — AVOIDED: every codebase-shape assumption is phrased verify-then-implement — the
    tint mechanism (t2, "inspect AgentCard first"), the reused shimmer-box/error-state/SkeletonCard
    APIs (t4, "verify their API first"), the client tRPC roster exposure (t4, "confirm the proxy
    exposes roster.getParty; FLAG if not"), and the existing data-hook pattern (t4). No packet
    asserts an unverified shape as fact.</recurring_pattern>
  <recurring_pattern source="prog-studio-v2-2026-07-s1-data-layer.md §6 G4">Do not parallel-dispatch
    two writers of one file, and do not dispatch the next writer while that file's audit is in flight.
    DISPOSITION — AVOIDED: only two packets write a shared existing file (`ui-store.ts`: t1 then t5).
    They are serialized t1→t5 (transitively via t1→t3→t4→t5, so t1 audit PASS precedes t5 dispatch);
    t5 re-reads fresh. All party components are NEW, disjoint files. t1 ∥ t2 touch DISJOINT files
    (ui-store+navigation vs components/party leaves) so parallelizing them does not violate G4.</recurring_pattern>
  <recurring_pattern source="gander-studio-p11-v2-vision.md §6 G5 (p11 class)">When two sections of one
    contract conflict, the packet must declare which is canonical.
    DISPOSITION — DECLARED: contrast_pairs table is CANONICAL over the spec's states prose (brief +
    AUD#4 advisory) — stated in t2/t6. Spec prevails over the mockup. Spec-vs-BRIEF conflict
    (mobile BottomTabBar fold): the BRIEF (constraint 2, BottomTabBar untouched) prevails over the
    spec's "grow BottomTabBar to 5 tabs" — see risk_flags.</recurring_pattern>
  <recurring_pattern source="brief pm_preflight_checklist: OVERSCOPED">≤2 independent files per domain
    per packet. DISPOSITION — HONORED: every packet touches ≤2 distinct source files (component
    families counted as coupled). t2/t3/t4 exceed 100 net lines and each carries an inline
    >100-line justification per the FE rule; the harder file-count guard is met throughout.</recurring_pattern>
  <recurring_pattern source="brief pm_preflight_checklist: DRY">Name the existing component/store/hook
    each new piece extends. DISPOSITION — NAMED: shimmer-box + browse/SkeletonCard (loading),
    error-state (error), ui/popover + ui/button (interactive primitives), BottomTabBar (store-nav
    pattern reference), browse/AgentCard (card token/tint conventions), existing hooks/ (tRPC
    react-query pattern). Spec-named Shadcn Card/Badge/Progress/Skeleton/Alert are NOT installed —
    reuse-or-build-custom decision documented (see risk_flags R-2).</recurring_pattern>
  <recurring_pattern source="brief pm_preflight_checklist: subagentstop-complete-miss">Every packet
    names its exact Output Path. DISPOSITION — DONE: each packet carries an
    `.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t{N}-FE-{unix_ts}.md` output_path; ORC backfills
    the ts at spawn (step 3.7).</recurring_pattern>

  <!-- sc-precheck delegation (constraint 7). -->
  sc_precheck: DELEGATED TO ORC per constraint 7 (PM has no Bash this dispatch). This plan authors NO
  diff-gated-against-HEAD SCs (constraint 6). The only grep-style SCs are ABSENCE checks (no-raw-hex
  on new files) and are ORC-run; no field-count/`grep -c "field:"` SCs and no locked-value greps are
  present, so the SC-locked-value-consistency defect classes do not apply. ORC should still run
  sc-precheck over this decomposition and attach `sc-precheck-report.json` before Critic per the
  standing backstop.

  <!-- Foreground/runtime-gate flags. -->
  runtime_gate_owner: t6 (FE) owns ALL interaction/a11y/state/legibility SCs via CLI Playwright
  (headless) — the auditor MCP set has no interaction primitives (p10 G3 default routing).
  env_preflight: ORC runs `health` + `roster.getParty` non-empty BEFORE the FE wave (constraint 5);
  GANDER_ROOT + LOADOUTS_DIR must be exported so live data flows. Dev server (:3001 server + :5173
  client) must be up for t4's live render and t6's live default assertion; t6 manages/records the
  server lifecycle or reuses ORC's.

  <!-- append_serialization (G4). -->
  append_serialization:
    ui-store.ts: [prog-studio-v2-2026-07-s2-t1, prog-studio-v2-2026-07-s2-t5]  (t1 first; t5 re-reads fresh; t5 dispatch gated on t1 audit PASS)
  (No other existing file is written by more than one packet. navigation.ts: t1 only. ModeContent.tsx:
  t5 only. globals.css: NO packet writes it — reference existing classes/tokens by name.)

  <!-- Human push opt-in. -->
  push_opt_in: The human's verbatim "push this sprint" is an explicit per-sprint guarded-auto-push
  opt-in (standards.md Git Workflow, Layer-2). ORC executes `git push origin {feature-branch}` ONLY
  after full audit PASS + REQVAL COVERED (Layer-2 gate). Layer-1 hook still forbids main/force/bare.
  Not a packet deliverable — an ORC post-sprint action; noted so it is not lost.

  <!-- Critic relevance. -->
  critic_focus: (1) the reuse-vs-install Shadcn interpretation (R-2); (2) the rail-mounted-in-PartyPage
  scoping vs spec's global-shell rail (R-3); (3) spec-vs-brief BottomTabBar reconciliation (R-1);
  (4) the interim Roster→browse + card-click→browse mappings (R-4). All are DECLARED, not silent.

  <!-- DESIGN.md status. -->
  design_md: v2-design-spec.md sets `<design_system_source>DESIGN_MD</design_system_source>` and traces
  every token to a named DESIGN.md entry; contrast_pairs canonical. This is the binding design contract
  (no separate app-root DESIGN.md re-check needed — the spec is the ratified manifest for this surface).

  <!-- prior_approved additions (sequential-single-file note). -->
  prior_approved_tasks: ui-store.ts already carries s4-p1's `muted`/`toggleMuted` "suppression
  foundation" fields and the partialize contract from prior sprints — these are PRE-EXISTING and must
  NOT be flagged as out-of-scope when t1/t5 touch the file. navigation.ts already carries the 9-item
  NAV_ITEMS for BottomTabBar — pre-existing, untouched by this sprint.
</routing_notes>

<risk_flags>
  <flag id="R-1" severity="MEDIUM">SPEC-vs-BRIEF conflict (declared). The design spec's mobile
    fallback folds the 4 submenus into BottomTabBar "grown to 5 tabs (Party + 4)". The BRIEF
    constraint 2 says BottomTabBar is UNTOUCHED (s4 owns removal/redesign). RESOLUTION: brief prevails
    — this sprint keeps BottomTabBar at its existing 9 tabs and renders the rail desktop-only; the
    spec's tab-fold is DEFERRED to s4. Critic/ORC: ratify that "BottomTabBar untouched" outranks the
    spec's mobile-nav prose here.</flag>
  <flag id="R-2" severity="MEDIUM">Spec names Shadcn primitives (`Card/Badge/Progress/Skeleton/Alert`)
    that are NOT installed in `components/ui/`. INTERPRETATION: reuse existing shimmer-box (Skeleton),
    error-state (Alert), popover, button; build PartyMemberCard/StatBar/RoleTag as custom FF7-tokened
    components. Rationale: DRY + the memorized FF7/Shadcn collision gotcha (raw Shadcn tokens →
    invisible text). If ORC/human instead want the raw primitives installed + explicitly re-tokenized,
    that is a scope change — flag now rather than after build.</flag>
  <flag id="R-3" severity="MEDIUM">RAIL MOUNT scope (declared). The rail is mounted inside PartyPage
    (desktop-only) this sprint, NOT hoisted into the global AppShell. Rationale: global mount would
    require a globals.css `.app-shell` grid rewrite (single-writer risk) or a right-shift of every v1
    surface (regression risk vs constraint 2). The rail is built self-contained/hoistable; s4 (its
    declared seam consumer) lifts it globally when it removes BottomTabBar. SC4 (rail navigates to the
    3 KEEP surfaces) is satisfied either way.</flag>
  <flag id="R-4" severity="LOW">INTERIM navigation mappings (declared). Roster rail item → `'browse'`
    and PartyMemberCard click → `setSelectedAgentCode(code)` + `setActiveMode('browse')`. No dedicated
    roster/agent-detail mode exists until s3 (which owns repointing these). Honest interim; the
    selected-agent store contract (the real s3 seam deliverable) is set correctly regardless.</flag>
  <flag id="R-5" severity="LOW">RETURN-TO-PARTY gap (declared). Because BottomTabBar is untouched (no
    'party' tab) and the rail is party-only, once a user navigates away there is no in-app control to
    return to the party home this sprint (reload lands on it as default). Not an SC; the full nav
    redesign (rail hoist + home affordance) is s4's job. Surfaced so it is a known interim limitation,
    not a discovered defect at REQVAL.</flag>
  <flag id="R-6" severity="LOW">FEASIBILITY chrome reconciliation (declared). Carry-in says "any
    cost/MP display labeled projected"; spec says feasibility is doc-only (no UI tag) and no cost bar
    renders. RESOLUTION: StatBar renders NO feasibility tag (spec prevails for this card); the carry-in
    is satisfied vacuously (nothing projected renders). All s1 party stats are feasibility 'available'.</flag>
  <flag id="R-7" severity="LOW">CLIENT tRPC roster exposure UNVERIFIED at plan time (t4 verify-then-
    implement). The roster router landed server-side in s1; the client `AppRouter` type should surface
    `trpc.roster.getParty.useQuery` automatically, but this was not read at plan time (client-only
    constraint + budget). t4 confirms it and FLAGS a type gap rather than editing server/shared if
    absent.</flag>
  <flag id="R-8" severity="LOW">SIX-card selection/order is SERVER-owned (s1 sorts members by activity
    recency; the spec's sample appendix curates 6 by spawns — a different sort). FE renders
    `members.slice(0,6)` in server order. If the human expects the exact appendix 6 in appendix order,
    that is an s1/server concern, not FE — flagged so a card-order mismatch isn't misattributed to t4.</flag>
</risk_flags>
</task_decomposition>

---

## Verbatim Deliverable Audit

<verbatim_deliverable_audit>
  <!-- Part A: the sibling brief's 5 sprint-level Success Criteria (brief lines 43-47). -->
  <phrase text="SC1 — default route renders the party screen with s1 LIVE data (MOCKED intermediate documented)">
    <addressed task="prog-studio-v2-2026-07-s2-t4"/>  <!-- live fetch + render -->
    <addressed task="prog-studio-v2-2026-07-s2-t5"/>  <!-- 'party' as DEFAULT route -->
    <addressed task="prog-studio-v2-2026-07-s2-t6"/>  <!-- headless assertion of default+live -->
  </phrase>
  <phrase text="SC2 — every rendered text pair is an AA-pass contrast_pairs row; no clipped/overlapping text (legibility, screenshot + Playwright)">
    <addressed task="prog-studio-v2-2026-07-s2-t2"/>  <!-- token-only colors; no-hex; contrast_pairs canonical -->
    <addressed task="prog-studio-v2-2026-07-s2-t6"/>  <!-- legibility/overflow assertion + screenshot for Step 4.5 -->
  </phrase>
  <phrase text="SC3 — all spec states: loading, empty, error(+Retry), default, hover/focus/active; popover quick-peek works">
    <addressed task="prog-studio-v2-2026-07-s2-t3"/>  <!-- hover/focus/active + popover on the card -->
    <addressed task="prog-studio-v2-2026-07-s2-t4"/>  <!-- loading/empty/error(+Retry)/default in PartyPage -->
    <addressed task="prog-studio-v2-2026-07-s2-t6"/>  <!-- drives + asserts every state -->
  </phrase>
  <phrase text="SC4 — rail navigates to the three KEEP surfaces; BottomTabBar untouched (s4 owns removal)">
    <addressed task="prog-studio-v2-2026-07-s2-t1"/>  <!-- RAIL_ITEMS mapping to keep surfaces -->
    <addressed task="prog-studio-v2-2026-07-s2-t3"/>  <!-- SubmenuRail component -->
    <addressed task="prog-studio-v2-2026-07-s2-t5"/>  <!-- BottomTabBar/NAV_ITEMS untouched, verified -->
    <addressed task="prog-studio-v2-2026-07-s2-t6"/>  <!-- rail-nav + no-regression assertions -->
  </phrase>
  <phrase text="SC5 — npm run lint ×3 clean; client build passing; e2e green headless; human browser check at Step 4.5">
    <addressed task="prog-studio-v2-2026-07-s2-t5"/>  <!-- build passing + tsc exhaustive -->
    <addressed task="prog-studio-v2-2026-07-s2-t6"/>  <!-- e2e green headless + screenshot for human Step 4.5 -->
    <!-- every packet carries a tsc ×3 SC; ORC runs the human browser check at close (Step 4.5) -->
  </phrase>

  <!-- Part B: human_request verbatim phrase coverage (Step 7). -->
  <phrase text="'this design looks great to me' (design approval)">
    <addressed task="prog-studio-v2-2026-07-s2-t2"/>  <!-- v2-design-spec.md is the binding contract across all packets; approval ratifies it -->
    <addressed task="prog-studio-v2-2026-07-s2-t3"/>
    <addressed task="prog-studio-v2-2026-07-s2-t4"/>
  </phrase>
  <phrase text="'push this sprint'">
    <out_of_scope reason="Push is an ORC post-audit guarded-auto-push action, not an FE packet deliverable. The phrase is the explicit per-sprint push opt-in (standards Git Workflow Layer-2); ORC pushes the feature branch after full audit PASS + REQVAL COVERED. Recorded in routing_notes push_opt_in so it is not dropped."/>
  </phrase>
  <phrase text="'let's keep it moving' (proceed with execution)">
    <addressed task="prog-studio-v2-2026-07-s2-t1"/>  <!-- decomposition delivered; execution proceeds under the standard pipeline -->
  </phrase>
</verbatim_deliverable_audit>

---

## Expectation Manifest

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s2-party-shell</sprint_id>
  <generated>2026-07-07T00:00:00Z</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s2-t1</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t1-FE-*.md</expected_file>
      <blocks>prog-studio-v2-2026-07-s2-t3, prog-studio-v2-2026-07-s2-t5</blocks>
      <receipt_check>
        <item>selectedAgentCode + setSelectedAgentCode present; AppMode/default/partialize UNTOUCHED</item>
        <item>RAIL_ITEMS length 4, ordered Roster/Sessions/Progression/Programs, modes typed AppMode</item>
        <item>tsc ×3 clean; NAV_ITEMS unchanged</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s2-t2</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t2-FE-*.md</expected_file>
      <blocks>prog-studio-v2-2026-07-s2-t3</blocks>
      <receipt_check>
        <item>PortraitFrame.tsx + StatBar.tsx under components/party/; StatBar vitest green</item>
        <item>StatBar null → "N/A — {reason}" + aria-label variant (no aria-valuenow)</item>
        <item>no raw hex; no box-shadow glow; no Shadcn Progress import</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s2-t3</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t3-FE-*.md</expected_file>
      <blocks>prog-studio-v2-2026-07-s2-t4</blocks>
      <receipt_check>
        <item>PartyMemberCard is a single native interactive element with composite aria-label; Popover quick-peek present</item>
        <item>SubmenuRail role=navigation, RAIL_ITEMS-driven, submenu-item-active state</item>
        <item>card takes onSelect prop (no direct selectedAgentCode access); no shell mount; no raw hex</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s2-t4</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t4-FE-*.md</expected_file>
      <blocks>prog-studio-v2-2026-07-s2-t5</blocks>
      <receipt_check>
        <item>PartyPage.tsx default export; all 4 states + header + desktop rail mount + diagnostics footnote</item>
        <item>useParty uses roster.getParty, returns the PartyStats envelope via z.infer (no re-declared shape)</item>
        <item>onSelect wires setSelectedAgentCode + setActiveMode('browse'); integration_status LIVE (or MOCKED documented)</item>
        <item>no AppShell/ModeContent/AppMode/globals.css edits; no raw hex; build passing</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s2-t5</task_id>
      <agent>FE#5</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t5-FE-*.md</expected_file>
      <blocks>prog-studio-v2-2026-07-s2-t6</blocks>
      <receipt_check>
        <item>'party' in AppMode union AND PAGE_MAP (atomic, tsc-exhaustive); initial activeMode='party'; partialize comment updated</item>
        <item>ui-store re-read fresh (2nd serialized writer); t1's selectedAgentCode intact</item>
        <item>NAV_ITEMS/BottomTabBar/AppShell/navigation.ts/globals.css untouched; build passing; no regression to existing PAGE_MAP entries</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s2-t6</task_id>
      <agent>FE#6</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-t6-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>e2e spec at packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts; green headless</item>
        <item>assertions present: default+live, rail nav (3 KEEP), popover, keyboard tab order, all 4 states, no-regression, legibility/overflow</item>
        <item>reproduce commands (server lifecycle + playwright) recorded; NOT TIER_1_ONLY; no source edits to pass tests</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
