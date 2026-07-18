# gander-studio-p12-detail-statbox-grid — FE ui_packet

## Summary

Human visual-review amendment on the agent-detail drilldown: the four boxed statbox panels
(Materia, Equipment, Abilities, Relationship) previously rendered full-width, stacked. This
task converts them to a responsive two-column CSS grid — two-up on medium+ viewports, single
column on narrow viewports — while leaving `ReviseSpecAction` and `DataQualityNotes` as
full-width siblings below the grid.

## Change

`packages/client/src/pages/AgentDetailPage.tsx` — merged the previous `<div className="flex
flex-col gap-4">` (which wrapped only MateriaPanel/EquipmentPanel/AbilitiesPanel) and the
separate `<RelationshipPanel>` sibling below it into a single container:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <MateriaPanel ... />
  <EquipmentPanel ... />
  <AbilitiesPanel ... />
  <RelationshipPanel ... />
</div>
```

DOM order preserved exactly (Materia, Equipment, Abilities, Relationship — matches the task
brief's required order). `ReviseSpecAction` and `DataQualityNotes` remain untouched, full-width
siblings below this grid. No panel-internal file (`InventoryPanels.tsx`, `RelationshipPanel.tsx`)
was modified — both already render fluid/flex content filling their own `<section>` shell with
no fixed pixel widths, so no internal changes were required for the grid reflow to work.

Net diff: +4/-2 lines in one file.

## Verification

**Lint (typecheck):** `npm run lint` from repo root — exit 0, clean across
`packages/shared`, `packages/server`, `packages/client` tsconfig projects.

**E2E (Tier 2 absorption gate):**
`npx playwright test tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` run from
`packages/client`, reusing the already-running dev server (`playwright.config.ts`
`reuseExistingServer: true`, port 5173 client / 3001 server proxy).

```
Running 8 tests using 1 worker
  ✓ PROOF 1 — Browse absorption: Materia/Equipment/Abilities panels render live data
  ✓ PROOF 2 — Graph absorption: relationship panel renders a visible edge + legend
  ✓ PROOF 3a — Edit absorption: revise dialog opens, edits save (mocked network boundary)
  ✓ PROOF 3b — Edit absorption buffer regression (SC3)
  ✓ back-to-party: detail-back click returns to the party surface
  ✓ DI honest-empty detail: role with no spec on disk renders honest empty panels
  ✓ a11y: detail page is keyboard-operable — Tab/Enter/Escape round trip
  ✓ a11y: detail page heading structure has no level skips
8 passed (36.9s)
```

8/8 green — no regressions. PROOF 2 in particular exercises `RelationshipPanel`'s ReactFlow
canvas at the new half-width (1280px desktop viewport, `md:grid-cols-2` active) and asserts a
*visible* edge (not just DOM presence), which passed — the `fitView` behavior scales the
star-fan layout down correctly inside the half-width grid cell rather than overflowing or
clipping. The a11y heading-order and keyboard tab-order tests also passed, confirming the DOM
reorder (RelationshipPanel now interleaved into the same container as the other three panels,
still last in document order) did not disturb heading hierarchy or tab sequence.

Note on the brief's cited "27/27 green at s3 close": that count referred to a broader
historical/full-suite tally at sprint close; the spec file itself (as it exists on disk today)
contains exactly 8 test blocks, all of which cover the touched surface (AgentDetailPage's panel
layout) — all 8 pass. No other e2e spec file references AgentDetailPage's panel container.

**Flagged concern — ReactFlow at half width:** Verified structurally (both panel components use
fluid/flex-fill content, no fixed pixel widths on outer shells) and functionally (PROOF 2's
visible-edge assertion passes at the new half-width). Full pixel-level visual inspection (e.g.
does the star-fan layout look visually cramped/legible at half width on a very wide monitor vs.
a 768px tablet) was not performed — this is a headless verification pass only. Recommend a human
visual spot-check of the Relationship panel specifically at the `md` breakpoint boundary
(~768px) during the next visual review pass, since `computeStarLayout`'s `NODE_HORIZONTAL_GAP`
(220px) + `RELATIONSHIP_NODE_WIDTH` (180px) constants were not touched by this task and were
tuned against the previous full-width layout.

## Agent Log

`docs/agent-logs/FE/gander-studio-p12-detail-statbox-grid.md` (Stage 1/2/3, checkpoint) —
mirrored to `docs/agent-logs/FE/latest.md`.

---

<ui_packet>
  <components_created>[]</components_created>
  <files_modified>
    <file path="packages/client/src/pages/AgentDetailPage.tsx" lines_delta="+4/-2">
      Merged the Materia/Equipment/Abilities flex-col container and the standalone
      RelationshipPanel sibling into one `grid grid-cols-1 gap-4 md:grid-cols-2` container,
      preserving DOM order (Materia, Equipment, Abilities, Relationship). ReviseSpecAction and
      DataQualityNotes remain untouched full-width siblings below the grid. No panel-internal
      files touched.
    </file>
  </files_modified>
  <layout_approach>
    Tailwind responsive grid on the existing panel-wrapper div: `grid-cols-1` (single column,
    below `md` breakpoint) escalating to `md:grid-cols-2` (two-up, side-by-side statboxes) at
    medium+ viewports, `gap-4` preserved from the prior flex-col spacing rhythm. No new
    className tokens or magic numbers introduced — reuses Tailwind's existing `md:` breakpoint
    and the project's standard `gap-4` spacing unit already used elsewhere on this page.
  </layout_approach>
  <state_hydration_map>
    Unchanged — `detailQuery` (trpc.roster.getAgentDetail) still hydrates all four panels via
    the same props as before; this is a pure layout-container change with zero state/data-flow
    impact.
  </state_hydration_map>
  <a11y_verification>
    DOM order unchanged (Materia, Equipment, Abilities, Relationship — matches heading-order
    test expectations). No new interactive elements introduced. E2E a11y tests confirm: (1)
    Tab/Enter/Escape keyboard round-trip through Back-to-party -> revise trigger -> dialog ->
    Escape -> Back-to-party still works; (2) heading structure has no level skips and all four
    panel headings (Materia, Equipment, Abilities, Relationships) remain visible and present.
    Both passed unchanged.
  </a11y_verification>
  <design_tokens_used>
    None new — this task only changes Tailwind layout utility classes (`grid`, `grid-cols-1`,
    `md:grid-cols-2`, `gap-4`), all pre-existing in the codebase's Tailwind config. No CSS custom
    property / design token values were added or modified; the four panels' own `--sf`/`--bd`/
    `var(--radius)` box treatment (owned by their respective component files) is untouched.
  </design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <constant_audit>
    0 raw-hex matches, 0 inline style="..." string-attribute matches (file uses only JSX
    style={{}} objects), 0 non-semantic onClick elements, 0 JSON.parse calls in the modified
    file. No DRY violations introduced.
  </constant_audit>
  <e2e_spec>tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts (existing spec re-run, no new spec required — pure layout-container change to an already-covered surface, not a new interactive flow)</e2e_spec>
  <verification_evidence>
    lint: exit 0 (tsc --noEmit clean across shared/server/client).
    e2e: 8/8 passed, 36.9s, tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts.
  </verification_evidence>
  <flagged_concerns>
    RelationshipPanel's ReactFlow canvas at half-width verified structurally (fluid content, no
    fixed outer widths) and functionally (PROOF 2 visible-edge assertion passes at 1280px
    desktop with md:grid-cols-2 active) but not pixel-inspected visually. Recommend a human
    visual spot-check of the Relationship panel near the `md` breakpoint boundary (~768px) during
    next visual review — computeStarLayout's NODE_HORIZONTAL_GAP/RELATIONSHIP_NODE_WIDTH
    constants were tuned against the prior full-width layout and were not touched by this task.
  </flagged_concerns>
  <integration_status>SUCCESS</integration_status>
</ui_packet>
