# FE ui_packet — prog-studio-v2-2026-07-s3-drilldowns-t1

Materia / Equipment / Abilities inventory panels (Browse-absorption lane) per REV2 PM plan
(`.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md` → t1).

```xml
<ui_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t1</task_id>

  <files_created>
    <file path="packages/client/src/components/detail/InventoryPanels.tsx" lines="303">
      Exports MateriaPanel, EquipmentPanel, AbilitiesPanel + shared ProvenanceChip primitive.
      Internal helpers: PanelShell (panel chrome), InventoryRow (shared row chrome, backs
      ProvenanceChip and the Equipment tool row), HonestEmptyState / AbilitiesEmptyState /
      NoteList (empty-state rendering), MateriaSubList (Skills/Hooks sub-lists),
      matchingNotes (dataQualityNotes regex filter, panel-scoped).
    </file>
  </files_created>

  <components_created>
    <component>MateriaPanel (packages/client/src/components/detail/InventoryPanels.tsx) — renders Skills + Hooks sub-lists from materia:{skills,hooks}</component>
    <component>EquipmentPanel (same file) — renders tools from equipment[]</component>
    <component>AbilitiesPanel (same file) — renders workflows from abilities[]; contracted-empty default path built first-class</component>
    <component>ProvenanceChip (same file, exported per SC(a)) — shared provenancePath row used by Materia sub-lists and AbilitiesPanel</component>
  </components_created>

  <state_hydration_map>
    No client state / store slice — all three panels are pure presentational components. Props
    are sliced directly from AgentDetailSchema (packages/shared/src/schemas.ts :460-471):
    MateriaPanel receives {skills, hooks} = AgentDetail.materia plus AgentDetail.dataQualityNotes;
    EquipmentPanel receives AgentDetail.equipment + dataQualityNotes; AbilitiesPanel receives
    AgentDetail.abilities + dataQualityNotes. No trpc/useQuery call anywhere in this file — t4a
    (page assembly, out of this task's scope) owns the roster.getAgentDetail fetch and passes the
    slices down as props. Verified against the live server parser
    (packages/server/src/parsers/agent-detail.ts) that the exact dataQualityNote strings emitted
    ("no agent spec on disk for code...", "...not found via parseAllAgents...", "connectivity
    graph unavailable on disk...", "no durable per-agent workflow source on disk; abilities
    intentionally empty (program.md §5 note 2)") match the regex patterns each panel filters on
    (MATERIA_NOTE_PATTERN / EQUIPMENT_NOTE_PATTERN / ABILITIES_NOTE_PATTERN), so panel-scoped note
    surfacing is not a guess — it traces to the real, on-disk note text.
  </state_hydration_map>

  <a11y_verification>
    - Each panel is a &lt;section aria-labelledby={headingId}&gt; landmark region carrying the
      packet-mandated stable data-testid (detail-materia-panel / detail-equipment-panel /
      detail-abilities-panel).
    - Heading hierarchy: h2 panel title ("Materia"/"Equipment"/"Abilities") + h3 sub-list titles
      ("Skills"/"Hooks" inside Materia) — no skipped levels within this component's own subtree
      (final page-level h1/h2 placement is t4a's responsibility, out of this task's scope).
      Sub-list/panel-title headings deliberately carry NO uppercase/letter-spacing — DESIGN.md's
      Typography rule reserves the 0.12em uppercase tracking idiom for xs-size LABELS only,
      "never on body or heading text"; only the xs (10px) support-copy caption and the panel's xs
      readouts use that treatment.
    - Row lists use role="list"/role="listitem" (Skills, Hooks, Equipment tools, Abilities rows).
    - All three empty states (HonestEmptyState for Skills/Hooks/Equipment,
      AbilitiesEmptyState for Abilities) use role="status" so assistive tech announces the honest
      empty message without requiring focus to move there manually (EmptyPartyState precedent,
      PartyPage.tsx :161).
    - Decorative icons (Gem, Wrench, Zap, and the per-panel header icon) all carry
      aria-hidden="true" — the panel's own h2/h3 text already carries the accessible name.
    - No click handlers / interactive elements exist in this file (out_of_scope: no page
      assembly, no nav) — the Click-Handler Keyboard-Equivalent Audit grep
      (`grep -nE "&lt;(span|div|li|a)[^&gt;]*onClick=" InventoryPanels.tsx`) returned 0 matches, so
      no keyboard-equivalent gap exists to remediate.
    - All images/icons: none are raster images; lucide-react icons are the only icon source
      (DESIGN.md constitution: "Icons from lucide-react only").
  </a11y_verification>

  <design_tokens_used>
    --sf (panel/card surface bg), --sfh (neutral row bg — Equipment tool rows, non-accented
    ability rows), --bd (default border), --w (primary text — panel titles, row primary text),
    --wd (secondary text — empty-state message body, sub-list h3 titles), --wm (muted text —
    provenancePath readout, xs support-copy captions, dataQualityNotes), --mt (decorative panel
    header icon accent), --mb (Skills chip accent — v2-design-spec.md &lt;tokens&gt; "Intel-role
    materia...Skills chip color"), --mo (Hooks chip accent — v2-design-spec.md &lt;tokens&gt;
    "Hooks materia (used in Roster drill-down chips...)"), --fm (monospace font for provenancePath
    readouts), var(--radius) (panel corner radius). Abilities/workflow rows use NO materia accent
    token (neutral InventoryRow path) — v2-design-spec.md's &lt;tokens&gt; table has no
    design-decision-recorded color for abilities/workflows, and DESIGN.md's Constitution forbids
    changing/inventing role-color meaning without a design decision record, so this was left
    neutral rather than guessed. design_system_source: DESIGN_MD.
  </design_tokens_used>

  <empty_state_inventory>
    <panel name="Materia — Skills sub-list">Independent honest empty state ("No recorded skills for this agent.") rendered via HonestEmptyState when materia.skills is empty; visible, role="status", never null/display:none.</panel>
    <panel name="Materia — Hooks sub-list">Independent honest empty state ("No recorded hooks for this agent.") when materia.hooks is empty; same treatment.</panel>
    <panel name="Materia — panel-level dataQualityNotes">Surfaced ONCE beneath both sub-lists (not duplicated per sub-list, since skills/hooks share the same underlying connectivity-graph/agent-lookup source and would otherwise repeat an identical note twice) whenever a matching note is present.</panel>
    <panel name="Equipment">Honest empty state ("No recorded tools for this agent.") + matching dataQualityNote(s) when equipment is empty; visible, role="status".</panel>
    <panel name="Abilities">Honest empty state ("No recorded abilities for this agent.") is the CONTRACTED DEFAULT render path this sprint (program.md §5 note 2) — built as a first-class state (dedicated Zap icon + message, distinct from the terser sub-list empty treatment) rather than an afterthought, plus the always-present "abilities intentionally empty" dataQualityNote.</panel>
  </empty_state_inventory>

  <lint_output>
npm run lint (tsc --noEmit across shared → server → client): exit 0, no diagnostics printed.

$ npm run lint
&gt; lint
&gt; tsc --noEmit --project packages/shared/tsconfig.json &amp;&amp; tsc --noEmit --project packages/server/tsconfig.json &amp;&amp; tsc --noEmit --project packages/client/tsconfig.json

(no output — clean across all three packages)
  </lint_output>

  <vitest_output>
npm test -w @gander-studio/client:

$ npm test -w @gander-studio/client
&gt; @gander-studio/client@0.1.0 test
&gt; vitest run

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client

 Test Files  6 passed (6)
      Tests  37 passed (37)
   Start at  23:41:11
   Duration  916ms (transform 310ms, setup 0ms, import 871ms, tests 76ms, environment 1ms)

No new test file was authored for this component (the packet's context_files/estimated_new_lines
scope this task to InventoryPanels.tsx alone — "1 new file"). Pre-existing suite (37 tests, 6
files, includes PartyMemberCard.test.ts / StatBar.test.ts) is unaffected — 0 regressions.
  </vitest_output>

  <constant_audit>
    Ran on the one file created (packages/client/src/components/detail/InventoryPanels.tsx):
    - raw hex `grep -rn "#[0-9a-fA-F]{6}"`: 0 matches.
    - inline style/Tailwind property-overlap grep: 0 matches.
    - onClick on span/div/li/a without tabIndex/role/onKeyDown: 0 matches (file has zero onClick handlers).
    - JSON.parse: 0 matches.
    - repeated style-mutation pattern grep (`style\.` / duplicate lines): 0 matches.
    No pre-existing violations encountered in files touched (only 1 file touched, newly created).
  </constant_audit>

  <style_conflict_check>NONE</style_conflict_check>

  <focus_trap_visibility_filter_confirmed>N/A — no dialog/modal/popover in this task's scope.</focus_trap_visibility_filter_confirmed>

  <e2e_spec>TIER_1_ONLY — this task adds a new presentational surface (three panels) but ships
    no interactive flow (no click/drag/drop handlers, no modal trigger, no async user action);
    the panels are pure prop-driven rendering, consumed by t4a's page assembly and proven end to
    end by t5's Tier-2 Playwright suite
    (packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts, out of this task's
    scope per the packet's dependency graph — t5 depends on t4a/t4b, not t1 directly, but consumes
    t1's exact empty-state copy and testids as context_files). No e2e spec authored by t1 itself.
  </e2e_spec>

  <sc_self_check>
    <sc id="a" status="PASS">InventoryPanels.tsx exports MateriaPanel, EquipmentPanel, AbilitiesPanel, and ProvenanceChip (a single shared implementation, wrapping the also-shared InventoryRow — used by Equipment tool rows too, so provenance-row markup is never duplicated).</sc>
    <sc id="b" status="PASS">Every panel/sub-list renders a visible (role="status") honest empty state, never null/display:none, when its slice is empty; matching dataQualityNote(s) are surfaced (Materia: once at panel level covering both sub-lists; Equipment/Abilities: within their own single empty state) — regex-matched against the actual on-disk note strings from agent-detail.ts.</sc>
    <sc id="c" status="PASS">Materia (Skills/Hooks) and Abilities rows render name + provenancePath via ProvenanceChip; Equipment rows render only `tool` via InventoryRow with no `secondary` (no fabricated path) — EquipmentSchema has no provenance field, confirmed at schemas.ts :427.</sc>
    <sc id="d" status="PASS">All colors are FF7 runtime CSS custom properties (--sf/--sfh/--bd/--w/--wd/--wm/--mt/--mb/--mo/--fm) or materiaTint() — 0 raw hex. Every text/background pairing traces to a docs/v2-vision/v2-design-spec.md &lt;contrast_pairs&gt; row at AA or better (--w/--sf 17.8:1 AAA; --w/--sfh ≈13.0:1 AAA worst-case bound; --wd/--sf 9.6:1 AAA; --wm/--sfh 5.06:1 AA binding worst case, satisfied since no background used here is lighter than --sfh).</sc>
    <sc id="e" status="PASS">`npm run lint` clean across all three packages (exit 0, verbatim above).</sc>
  </sc_self_check>

  <task_boundary_check>
    task_id in this packet (prog-studio-v2-2026-07-s3-drilldowns-t1) matches the task_id assigned
    in the spawn prompt. No page assembly, no AppMode/routing/PAGE_MAP edit, no StatBar/qualityStats
    rendering, no trpc query, no nav re-point was performed — all out_of_scope items honored. No
    git stash, no git commit issued.
  </task_boundary_check>

  <integration_status>MOCKED — data is 100% prop-driven per the packet's design (page/t4a is the
    data-fetch owner, not this task); no live roster.getAgentDetail wiring exists yet since t4a has
    not run. Component shapes are typed directly against the real AgentDetailSchema
    (packages/shared/src/schemas.ts) — not an invented/approximate shape — so no schema drift risk
    once t4a wires real data through these props.</integration_status>
</ui_packet>
```
