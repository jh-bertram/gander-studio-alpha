# Archive — gander-studio-p2-agent-cards

```xml
<archive_entry>
  <timestamp>2026-04-04T00:00:00Z</timestamp>
  <task_id>gander-studio-p2-agent-cards</task_id>
  <event_type>SPRINT_COMPLETE</event_type>
  <rationale>
    Sprint gander-studio-p2-agent-cards delivered agent role classification and CardNode surface replacement of orchestrator orb. Five tasks across five waves, all audited to pass on first submission. Requirements validation: 35 COVERED, 1 PARTIAL (proximity edge regression HCG-2). Verdict: PARTIAL_PASS.

    ARCHITECTURAL DECISIONS:

    (1) AGENT ROLE CLASSIFICATION (DS-001): Introduced AgentRole type and four agent classification Sets (META_AGENTS, SPECIALIST_AGENTS, GATE_AGENTS, EXTERNAL_AGENTS) in packages/client/src/constants/agent-roles.ts. Four corresponding *_FRAGMENTS arrays enable name-based role derivation. CanvasNode now carries role: AgentRole field. LoadoutSchema extended with optional cardTitle (backwards-compatible). Alternative (storing role in loadout JSON only) rejected because runtime classification during load is cleaner and allows color derivation without parsing. deriveRole() function implements fallback chain: named Sets → fragments → 'specialist' default. This enables getMateriaColor() fast-path on role value instead of name-based Set membership checks.

    (2) CARDNODE SURFACE (FE-001b): CardNode component renders a 900×700px card with teal header bar (var(--sf) background, var(--my) teal text, crown glyph), inline editable title, and border-radius 8px. Replaced the orchestrator orb that previously occupied the central canvas space. Title edit via click → type → blur or Enter; Escape cancels. All interactions keyboard-accessible (tabIndex, aria-label, ARIA-compliant input). No raw px/color values in code — all interpolated from named constants (CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_HEADER_HEIGHT_PX, CARD_BORDER_RADIUS_PX). Alternative (standalone modal) rejected because CardNode must be a positioned React Flow node on the canvas for spatial consistency with agent orbs.

    (3) MATERIACANVAS REDESIGN (FE-002): CardNode registered as node type 'card' in NODE_TYPES with CardNodeRenderer. toRFNode emits type:'card' for orchestrator nodes with position offset by (CARD_WIDTH_PX/2, CARD_HEIGHT_PX/2) so top-left corner aligns to center point. Other node types unchanged. role: AgentRole threaded from CanvasNode through toRFNode to MateriaNodeData.role, enabling role-based color in getMateriaColor fast-path. Proximity linking code preserved — snap attraction and link sound untouched. Known issue: proximity link edge does not render after snap; sound plays but no RF edge visible. Root cause TBD — likely drop handler doesn't call addEdge or RF edges state doesn't sync from store. Needs investigation in next sprint (HCG-2 tracking).

    (4) LOADOUTLISTPANEL REWRITE (FE-003): Panel now shows card header (non-interactive, aria-label="Card: {cardTitle}"), then agent roots with connected-skill children, then unconnected skills. Tree layout (agents at root, skills indented 16px per level) shows agent-to-peer relationships. Role-based dot colors via getMateriaColor(node.name, node.type, node.role). Heading text "Loadout". Panel hidden below 640px viewport width. All nodes keyboard-navigable with role=button, tabIndex=0, aria-label, Enter/Space for selection → fitView. No Playwright coverage gap — spec updated with 3 new tests (card header non-interactive, agent rows as roots, unconnected section).

    ADVISORY CARRIED FORWARD:

    (1) MateriaPalette getMateriaColor 2-param call at line 592: This is a legacy call from the glassy-orb sprint (P2-003b) that uses getMateriaColor(name, type) without the new role parameter. It still works because the fallback chain defaults correctly, but it should be audited and updated if role-based coloring is desired for that palette node. Consider for P3 tech debt pass.

    (2) Dead-code META_AGENTS branch in compose.ts: Line 23 aliases COMMAND_AGENTS = META_AGENTS, but the COMMAND_AGENTS naming is stale (predates agent-roles.ts refactor). Both point to the same Set. This branch is still functional but should be cleaned up in a refactoring pass to use AgentRole enum or explicit Set names only.

    NO POST-DELIVERY BUGS: All five tasks passed audit on first submission. Requirements validation 35/36 COVERED (1 PARTIAL on HCG-2 proximity edge). Human confirmed CardNode renders, title edit works, tree layout displays correctly, all colors apply per role.
  </rationale>
  <dependencies>
    gander-studio-p2-canvas-link (prior sprint: proximity snap, link sound, tree panel baseline);
    agent-improvement-2026-03-30-1.md (protocol hardening from prior post-mortems);
    FE#3 remediation cycle from canvas-link sprint (constant interpolation audit tightening)
  </dependencies>
  <retention_keys>
    packages/client/src/constants/agent-roles.ts — AgentRole type, META_AGENTS, SPECIALIST_AGENTS, GATE_AGENTS, EXTERNAL_AGENTS Sets, *_FRAGMENTS arrays, deriveRole(name, context) function;
    packages/client/src/components/compose/CardNode.tsx — 900×700px card, header (36px height), inline title edit, zero magic numbers;
    packages/client/src/constants/canvas.ts — CARD_WIDTH_PX (900), CARD_HEIGHT_PX (700), CARD_HEADER_HEIGHT_PX (36), CARD_BORDER_RADIUS_PX (8);
    packages/shared/src/schemas.ts — LoadoutSchema.cardTitle: z.string().optional();
    packages/client/src/store/canvas-store.ts — CanvasNode.role: AgentRole, deriveRole fallback chain, cardTitle: string, INITIAL_ORCHESTRATOR role: 'meta';
    packages/client/src/pages/ComposePage.tsx — getMateriaColor(name, type, role) with role fast-path switch;
    packages/client/src/components/compose/MateriaCanvas.tsx — CardNode registration as type 'card', toRFNode orchestrator → card branch, role threading through MateriaNodeData, LoadoutListPanel tree render with agent roots + connected skills + unconnected section, card header non-interactive, fitView on node select;
    packages/client/tests/e2e/card-node-title-edit.spec.ts — 3 tests: render, inline edit, keyboard cancel;
    packages/client/tests/e2e/loadout-list-panel.spec.ts — 6 tests (original 3 + new 3): tree render, keyboard nav, select fitView, card header non-interactive, agent roots, unconnected skills;
    Known issue HCG-2: proximity link edge regression — sound plays, no edge renders. Root cause TBD. addEdge and toRFEdge code present but edge doesn't appear at runtime. Likely drop handler doesn't trigger addEdge or RF edges state not syncing. Needs fix before PASS verdict.
    Advisory 1: MateriaPalette getMateriaColor 2-param call line 592 — legacy, still works, should audit for role parameter update.
    Advisory 2: Dead-code COMMAND_AGENTS alias in compose.ts line 23 — points to META_AGENTS, should clean up to explicit Set names.
    Verdict: PARTIAL_PASS due to HCG-2 proximity edge regression.
  </retention_keys>
</archive_entry>
```

## Sprint Summary

**Name:** gander-studio-p2-agent-cards  
**Date:** 2026-04-04  
**Status:** PARTIAL_PASS

### Delivered

| Task | Description | Result |
|------|-------------|--------|
| DS-001 | agent-roles.ts, AgentRole type, 4 Sets + fragments, CanvasNode.role, LoadoutSchema.cardTitle | AUDITED PASS |
| FE-001a | CARD_* constants, getMateriaColor role fast-path, compose.ts import refactor | AUDITED PASS |
| FE-001b | CardNode component, inline title edit, keyboard-accessible, card-node-title-edit.spec.ts | AUDITED PASS |
| FE-002 | MateriaCanvas redesign, CardNode registration, role threading, toRFNode orchestrator→card | AUDITED PASS |
| FE-003 | LoadoutListPanel rewrite, card header non-interactive, tree layout, role dots, loadout-list-panel.spec.ts (6 tests) | AUDITED PASS |

### Known Issue

**HCG-2 (Proximity edge regression):** Link sound plays but no edge renders on canvas after proximity linking. Root cause TBD — likely drop handler doesn't call addEdge or RF edges state doesn't sync. Needs investigation in next sprint.

### Requirements

35 COVERED, 1 PARTIAL, 0 MISSING. Verdict: PARTIAL_PASS.
