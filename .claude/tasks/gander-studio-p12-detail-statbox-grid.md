# Task: gander-studio-p12-detail-statbox-grid

**Human request:** Step 4.5 feedback on prog-studio-v2-2026-07-s3-drilldowns — agent-detail drilldown stat boxes are full-width; make them half-width so two statboxes fit side-by-side per row (responsive: stack on narrow viewports).
**Agents spawned:** FE#1 (implementation), AUD#1 (audit-pipeline)
**Routing:** direct (ORC acting as PM — simple single-domain FE layout task; s3 sprint itself is closed DONE-PENDING-4.5, human visually accepted with this one amendment)

## Ground facts (verified-on-disk 2026-07-10)

- `packages/client/src/pages/AgentDetailPage.tsx:244-252` — MateriaPanel, EquipmentPanel, AbilitiesPanel stacked inside `<div className="flex flex-col gap-4">`, each rendering full-width.
- `packages/client/src/pages/AgentDetailPage.tsx:254` — RelationshipPanel rendered as its own full-width sibling.
- Panels are boxed sections: `--sf` background, `1px solid var(--bd)`, `var(--radius)`, 16px padding (`InventoryPanels.tsx:117-120`, `RelationshipPanel.tsx:268`).
- RelationshipPanel embeds a ReactFlow mini-canvas (`RelationshipPanel.tsx:207`) — width-sensitive content.
- E2E gate: `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (27/27 green at s3 close) must remain green.

## Success criteria

1. Agent-detail boxed panels lay out two-up (half-width) on desktop-width viewports; single column on narrow viewports.
2. No testid/aria regressions; s3 drilldowns e2e spec green; typecheck (`npm run lint`) green.
3. No commit by FE — ui_packet returned to ORC; ORC commits post-audit.
