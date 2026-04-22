# Gander Studio — Project Log

Temporal knowledge graph for the gander-studio-alpha project. Maintained by the Archivist (AR).
Each entry records a task completion, architectural decision, or sprint state snapshot with rationale.

---

<archive_entry>
  <timestamp>2026-03-16T10:00:30Z</timestamp>
  <task_id>gander-studio-p2-p3-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>
    P2 and P3 sprints delivered export loop correctness fixes, app self-containment, and three UX/parser
    robustness improvements. Two recurring protocol failures surfaced:

    (1) PM must read source files before writing investigation tasks. In P3, the PM assumed code-auditor
    invisibility was caused by the tier-filter default without reading browse-store.ts. The store already
    defaulted tierFilter to 'all', making the diagnosis wrong. The Critic caught this and corrected it,
    adding one planning revision cycle. Alternatives considered: none recorded — the PM simply did not
    check. Lesson: for any task containing an investigation step, PM pre-flight must include reading the
    referenced source file.

    (2) Auditor QA must call the live API after BE fixes. The Promise.allSettled fix for agent-parser.ts
    passed static code review and direct function invocation, but tsx watch failed to hot-reload the
    running server. The running process continued executing old Promise.all code, silently dropping
    code-auditor from responses. This was only detectable via a live curl to the tRPC endpoint — a step
    absent from the auditor's QA checklist. Fix: auditor QA for BE server-side tasks must include
    curl http://localhost:3001/trpc/{procedure} verification; if unreachable, verdict is UNVERIFIED
    (not PASS).

    (3) tsx watch hot-reload is not guaranteed. Server file changes require kill-and-restart to take
    effect reliably. This is now a documented protocol requirement, not an assumption.

    (4) Bash sandbox denial in background agents. BE#2 and BE#3 could not run npm run lint during
    their turns. Lint was manually verified by the orchestrator. Background agents dispatched for
    lint-critical tasks require a foreground lint pass or manual verification step.

    The export loop correctness architecture (orchestrator.md as CLAUDE.md, Promise.allSettled parser,
    path.resolve guard, shared ExportInputSchema) is now stable and tested.
  </rationale>
  <dependencies>
    gander-studio-p2 (export loop fixes, GANDER_ROOT self-containment, orchestrator CLAUDE.md);
    gander-studio-p3 (base-path picker P3-002, agent parser resilience P3-003ab, port conflict UX P3-004,
    schema migration P3-001);
    initial alpha release commit 514ac87
  </dependencies>
  <retention_keys>
    docs/post-mortems/gander-studio-p2-p3.md;
    protocol gaps: PM pre-flight source read before investigation tasks;
    auditor QA must curl live tRPC endpoint after BE server-side fixes;
    tsx watch hot-reload not guaranteed — kill-and-restart required for server file changes;
    Bash sandbox denial in background agents — lint-critical tasks need foreground pass;
    key contracts: CLAUDE.md in export = raw content of GANDER_ROOT/.claude/agents/orchestrator.md;
    path guard: path.resolve(targetBasePath) === targetBasePath and startsWith('/');
    agent parser: Promise.allSettled with stderr logging for parse failures;
    tRPC base URL: http://localhost:3001/trpc/{procedure};
    app entry: npm run dev requires .env with GANDER_ROOT and LOADOUTS_DIR
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-16T10:15:45Z</timestamp>
  <task_id>gander-studio-p1-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>
    P1 sprint (materia canvas) delivered interactive canvas drag-and-drop mechanics and visual composition
    layer. Post-mortem identified four protocol gaps that allowed issues to ship:

    (1) CR WARNINGs lack enforcement — both CR#2 warnings (state mutation in handlers, unvalidated JSON.parse)
    were shipped as-is because the CR system marks them as advisory, not blocking. The audit pipeline has no
    escalation path: warnings do not halt the task. Recommendation: CR WARNINGs must either become CR BLOCKERs
    (enforced) or be removed; advisory warnings have zero impact on task outcomes.

    (2) Orchestrator fixing runtime bugs inline instead of routing to implementing agents — when canvas-c
    drag-drop interactions failed in QA, the orchestrator debugged and fixed them directly rather than
    routing the reproduction case back to the FE agent. No protocol exists requiring this delegation.
    Orchestrator role is coordination, not implementation; bugs belong to their owning agents for fix,
    verification, and audit responsibility.

    (3) Interactive task coverage gap — canvas-c drag-drop interactions lack Playwright test coverage for
    new interaction flows. Snapshot tests caught rendering regressions but not interaction state transitions.
    FE QA checklist must require Playwright coverage for any new user interaction (drag, drop, keyboard
    navigation, focus traps).

    (4) FE pre-flight gap — JSON.parse on external data (loadout imports, export re-imports) is not wrapped
    in try-catch + schema validation at FE boundaries. The app silently fails on malformed JSON instead of
    surfacing an error to the user. FE pre-flight must require: (a) try-catch around JSON.parse, (b) Zod
    schema validation, (c) user-facing error message on failure.

    All four gaps are process/protocol failures, not code quality issues. The sprint delivered working
    functionality but with insufficient safeguards for future maintenance.
  </rationale>
  <dependencies>
    gander-studio-p1 (materia canvas, interactive drag-drop, composition view);
    CR system design (WARNINGs vs BLOCKERs — see P1 audit results);
    canvas-c component (packages/client/src/components/compose/canvas-c.tsx);
    export/import flow (ComposePage, ExportPage)
  </dependencies>
  <retention_keys>
    docs/post-mortems/gander-studio-p1-materia-canvas.md;
    protocol gaps to fix before P2:
      1. CR WARNINGs must be enforced (BLOCKER) or removed; no advisory warnings in audit pipeline
      2. Orchestrator must route bugs to owning agents, not fix inline — establish delegation protocol
      3. FE interactive tasks require Playwright coverage for new interaction flows (drag, drop, keyboard)
      4. FE pre-flight: JSON.parse on external data must be wrapped in try-catch + Zod validation + user error
    key files: canvas-store.ts (state mutation in handlers), canvas-c.tsx (drag-drop interactions),
    ComposePage.tsx (loadout import), ExportPage.tsx (export re-import);
    tRPC validation: all API input validated at server boundary, but FE import/export handlers lack matching
    client-side validation before JSON.parse
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-17T00:00:00Z</timestamp>
  <task_id>agent-improvement-2026-03-17-1</task_id>
  <event_type>AGENT_IMPROVEMENT</event_type>
  <rationale>
    Acted on 4 protocol gaps identified in post-mortems gander-studio-p2-p3.md and gander-studio-p1-materia-canvas.md.
    Changed 4 files to close these gaps:

    (1) CR CRITIQUE_PASS WARNINGs enforcement — Previously advisory only. Updated audit-pipeline skill and critic spec
    to require explicit PM acknowledgement before dispatch when WARNINGs are present. WARNINGs are now blocking feedback
    that must be reviewed and cleared before task can proceed.

    (2) Orchestrator Step 4.5 bug-fix delegation — Added explicit prohibition against fixing runtime bugs inline.
    Orchestrator must always spawn a targeted agent task with clear reproduction steps and debugging scope. This ensures
    bug ownership, audit responsibility, and traceability remain with the implementing agent.

    (3) FE/Auditor/Critic Playwright Tier 2 requirement — Updated to require Playwright Tier 2 test coverage for any
    new interactive flows on existing surfaces (not just new surfaces). Canvas-c drag-drop, form interactions, modal
    focus traps, and keyboard navigation now require explicit test coverage as part of FE task completion.

    (4) FE pre-flight JSON.parse validation — All client-side JSON.parse on external data (loadout imports, export
    re-imports) must now be wrapped in try-catch + Zod schema validation + user-facing error message. Enforced in
    ComposePage and ExportPage import handlers.

    No unresolved gaps remain — all P2+P3 gap items were already captured in agent specs and have been incorporated.
  </rationale>
  <dependencies>
    gander-studio-p2-p3.md (post-mortem identifying gaps 1-2);
    gander-studio-p1-materia-canvas.md (post-mortem identifying gaps 3-4);
    audit-pipeline skill; critic agent spec; frontend agent spec; auditor agent spec
  </dependencies>
  <retention_keys>
    docs/agent-improvements/agent-improvement-2026-03-17-1.md;
    docs/agent-changelog.md;
    Updated specs: .claude/agents/critic.md, .claude/agents/frontend.md, .claude/agents/auditor.md, .claude/skills/audit-pipeline.md;
    CR CRITIQUE_PASS WARNINGs now block dispatch and require PM acknowledgement;
    Orchestrator Step 4.5 explicitly forbids inline bug fixes — must spawn targeted agent task;
    FE Playwright coverage now required for new interactions on existing surfaces, not just new surfaces;
    FE pre-flight must wrap JSON.parse in try-catch + Zod validation + user error for external data;
    all gaps from post-mortems now incorporated into protocol
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-30T21:15:00Z</timestamp>
  <task_id>gander-studio-p2-canvas-link-003c</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>
    Wave 4 final task — LoadoutListPanel component and three-column canvas wiring complete and audited pass on first attempt.

    DESIGN DECISION (HCG-1): Tree layout adopted for node list. Agents appear as root items; connected peers render
    as indented children (16px additional left-padding). This provides visual hierarchy showing agent-to-peer relationships
    without flattening the UI. Confirmed by human before FE#4 dispatch. Alternative (flat list) rejected because it loses
    the semantic structure of the loadout.

    COMPONENT ARCHITECTURE: LoadoutListPanel co-located inside MateriaCanvas.tsx rather than a separate file. This follows
    the pattern established in P1 (canvas-c.tsx as single-file surface) — all canvas-related components stay together to
    reduce import/export complexity and maintain clear module boundaries.

    STYLING & INTERACTIVITY:
    - Colors: getMateriaColor() applied to tree node dots (agent green, skill purple, hook blue, etc.)
    - Keyboard access: role=button, tabIndex=0, aria-label per node, Enter/Space triggers selection
    - Selection: onSelectNode calls rfInstance.fitView({ nodes: [{ id }], duration: 400, padding: 0.5 })
    - Responsive: panel hidden at max-width 640px via scoped @media rule in <style> block (inline styles cannot carry
      media queries, so class-based approach used)
    - Panel width: LIST_PANEL_WIDTH_PX = 240px

    NAMING & EXPORTS: 22 LIST_* named constants appended to packages/client/src/constants/canvas.ts for consistency
    with existing PALETTE_* and CANVAS_* patterns.

    TESTING: Playwright Tier 2 spec created (loadout-list-panel.spec.ts) with 3 test cases covering tree render, keyboard
    navigation, and selection fitView. All 3 passed on first run during QA.

    RATIONALE FOR CO-LOCATION: The 003b decision (direct DOM classList for animation classes, avoiding React re-renders)
    established that canvas components benefit from staying close to the canvas surface. LoadoutListPanel does not use
    that pattern (it doesn't animate), but it does share the same principle: keeping all canvas UI in one file reduces
    the cognitive load of understanding how the three columns (Palette, Canvas, List) interact.

    NO AUDIT REWORK: First-time pass on SA, QA, SX gates. No remediation loops. Audit confidence high — all checklist
    items (accessibility, Zod validation, Playwright coverage, responsive behavior) met.
  </rationale>
  <dependencies>
    gander-studio-p2-canvas-link-001a (palette panel wiring, column flex layout);
    gander-studio-p2-canvas-link-003b (DOM-based animation classes, canvas stability precedent);
    gander-studio-p2-canvas-link (sprint definition, requirements: tree layout, keyboard access, fitView on select);
    packages/client/src/components/compose/MateriaCanvas.tsx (parent wiring container)
  </dependencies>
  <retention_keys>
    packages/client/src/components/compose/MateriaCanvas.tsx — LoadoutListPanel component (lines ~850–950);
    packages/client/src/constants/canvas.ts — LIST_PANEL_WIDTH_PX, LIST_NODE_PADDING_PX, LIST_ITEM_HEIGHT_PX, LIST_* exports;
    packages/client/tests/e2e/loadout-list-panel.spec.ts — Tier 2 test suite (3/3 passing);
    tree layout: agents as root, peers as indented children (16px padding per level);
    fitView params: { nodes: [{ id }], duration: 400, padding: 0.5 };
    responsive: hidden at max-width 640px via @media rule;
    accessibility: role=button, tabIndex, aria-label, Enter/Space navigation;
    no animation patterns — panel is static UI, unlike 003b's animated orbs;
    P2 canvas-link sprint now 7/7 complete, all audited pass, requirements validation 17/17 COVERED
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-30T02:00:00Z</timestamp>
  <task_id>gander-studio-p2-canvas-link-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>
    P2 canvas-link sprint delivered 7 tasks across 4 waves and 3 sessions: persistent connections (schema + parser + router
    + client wiring), glassy 3D orb nodes (CSS sphere with specular highlights), edge glow animation, magnetic snap attraction
    with release keyframes, Web Audio link sound (approach sine, link ker-chink with harmonics), and LoadoutListPanel tree layout.
    Final state: all 7 tasks delivered, all audited PASS, all 17 requirements COVERED, human confirmed all four features working
    in browser. Zero post-delivery runtime bugs.

    KEY FINDINGS:

    (1) RECURRING PM OVERSCOPING PATTERN (P1 + P2): PM#0 produced an overscoped initial decomposition identical to the failure mode
    documented in P1 post-mortem. The initial plan packed 6 independent FE units into one task (003) and crossed the BE/FE boundary
    in another (001). Critic CR#1 explicitly cited the P1 precedent and issued 5 BLOCKERs. This forced a complete restructure:
    3 tasks → 7 tasks. The revised plan shipped cleanly. Root cause: PM did not read the P1 post-mortem before decomposing.
    Lesson learned: PM agent spec requires a mandatory pre-decomposition read of the most recent post-mortem; if that post-mortem
    identifies an overscoping pattern, treat its suggested task sizes as an upper bound.

    (2) FE CONSTANT INTERPOLATION INTERPRETATION GAP (003b audit fail): FE#3 correctly exported 49 new named constants to canvas.ts
    and imported existing ORB_SHADOW_INSET_* constants, but wrote the MATERIA_CANVAS_KEYFRAMES template string using 20+ raw numeric
    literals (28px, 10px, 20px, 6px, 14px, 3px, ring widths, inset offsets, intermediate scale/translateY). The receipt checklist
    rule "all animation timing values" was interpreted narrowly by FE#3 (ms durations only, excluding px values). Auditor caught
    this on SA; one remediation cycle fixed it. Root cause: receipt checklist wording invited a narrow read. Lesson learned: replace
    "timing values" with "all numeric literals in CSS strings (px, %, opacity, Hz, ms, gain) exported from canvas.ts — no raw
    numbers in template strings". Also add pre-submission self-check: FE agents must grep CSS template strings for raw numeric
    patterns before submitting.

    (3) AUDIT PROTOCOL STRENGTH: The 003b failure was caught by SA (code standards), preventing it from shipping with 20+ magic
    numbers. No post-audit bugs escaped. The existing audit pipeline (SA → QA → SX) is robust for catching constant interpolation
    gaps, magic numbers, and type errors.

    (4) SESSION-SPANNING AUDIT STATE: 001b and 003a completed in Session 1 but were not yet audited at session break. Audits ran
    at the start of Session 2 with no loss of context. The checkpoint system (tracking "COMPLETE but not yet audited" state) worked
    correctly. No protocol change required.

    AGENT PERFORMANCE:
    - PM#0: 0% first-pass (overscoped); Critic forced revision. Pattern repeats from P1.
    - CR#1/CR#2: Caught 5 BLOCKERs on initial plan; revised plan was sound. High-value gate.
    - BE#1: 100% first-pass (schema + parser + router clean).
    - UI#1: 100% first-pass (design spec for 5 surfaces, numeric values clean).
    - RA#1: Research-only (Web Audio autoplay findings applied verbatim to 003b).
    - FE#1: 100% first-pass (canvas-store + ComposePage wiring).
    - FE#2: 100% first-pass (glassy orb CSS + 18 named constants).
    - FE#3: 0% → 100% (SA fail on constant interpolation; clean remediation, 1 cycle).
    - FE#4: 100% first-pass (LoadoutListPanel tree layout + 22 named constants + Playwright coverage).

    Overall first-pass rate on auditable tasks: 5/6 = 83%.

    RETENTION KEYS FOR NEXT SPRINT:
    (1) PM must read most recent post-mortem before any new decomposition. If prior sprint shows overscoping pattern, task sizes
        become upper bounds.
    (2) Receipt checklist for FE: "All numeric literals in CSS strings" not "timing values". Pre-submission self-grep required
        for template strings.
    (3) canvas.ts is the single source of truth for all design tokens (64+ named exports). Never add magic numbers to component files.
    (4) communicates_with in agent frontmatter: comma-delimited string ("be, fe"), not YAML array. Parser accepts both for backward
        compatibility.
    (5) Web Audio usage: playApproach/stopApproach (sine 220Hz), playLink (triangle 880Hz + sine 1320Hz harmonic). All parameters
        in canvas.ts. Swap to AudioBufferSourceNode if audio files become available.
    (6) Proximity threshold: CANVAS_PROXIMITY_THRESHOLD_PX = 60px. Snap animation params at canvas.ts lines 72–100.
    (7) LoadoutListPanel tree layout: agents as roots, connected peers as indented children (16px per level). Co-located in MateriaCanvas.tsx.
  </rationale>
  <dependencies>
    gander-studio-p2-canvas-link (sprint definition, 7 tasks, 4 waves);
    gander-studio-p1-materia-canvas.md (P1 post-mortem identifying PM overscoping pattern, cited by Critic CR#1);
    Critic CRITIQUE_BLOCK (forced 3-task plan → 7-task plan);
    FE#3 remediation cycle (constant interpolation in MATERIA_CANVAS_KEYFRAMES)
  </dependencies>
  <retention_keys>
    docs/post-mortems/gander-studio-p2-canvas-link.md;
    PROTOCOL GAPS TO FIX:
      1. PM agent spec must require pre-decomposition read of most recent post-mortem; if overscoping pattern is identified,
         treat suggested task sizes as upper bounds (P1+P2 show this repeats).
      2. Replace "timing values" in FE receipt checklist with "all numeric literals in CSS strings (px, %, opacity, Hz, ms, gain)".
      3. Add to FE agent spec: pre-submission self-grep for CSS template strings — verify every numeric is interpolated from
         named constant, not hardcoded.
    KEY CONTRACTS:
      - canvas.ts is single source of truth for all design tokens (64+ named exports); never add magic numbers to components.
      - communicates_with in agent YAML: comma-delimited string ("be, fe"), not array; parser handles both.
      - LoadoutPanel tree: agents as roots, peers as indented children (16px). Panel width 240px, hidden below 640px.
      - Web Audio: playApproach (sine 220Hz), playLink (triangle 880Hz + sine 1320Hz). See canvas.ts for all params.
      - Proximity snap: CANVAS_PROXIMITY_THRESHOLD_PX = 60px; snap animation params at canvas.ts:72–100.
      - MateriaNode: radial-gradient sphere + specular highlight + 6 box-shadow layers; --orb-color injection per agent type.
    FIRST-PASS RATE: 5/6 auditable tasks (83%). Only 003b (FE#3) failed SA on first attempt; 1 remediation cycle fixed it.
    ZERO POST-DELIVERY BUGS: Human confirmed all 4 features (glassy orbs, magnetic snap, link sound, tree panel) working in browser.
    ALL REQUIREMENTS COVERED: 17/17 requirement validation passed after all tasks audited.
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-30T23:45:00Z</timestamp>
  <task_id>agent-improvement-2026-03-30-1</task_id>
  <event_type>AGENT_IMPROVEMENT</event_type>
  <rationale>
    Acted on 3 protocol gaps identified in post-mortem `gander-studio-p2-canvas-link.md`. Changed 2 agent specification files across 3 targeted edits to close recurring pattern failures:

    (1) PM OVERSCOPING PATTERN (P1 + P2 recurring): PM#0 produced overscoped decompositions in two consecutive sprints despite explicit documentation of the pattern in the P1 post-mortem. The Critic was forced to issue blocking revisions both times, wasting one planning cycle per sprint. Root cause: PM did not read the prior post-mortem before decomposing. Fix: Added step 0 to Task Decomposition Pattern in pm.md — mandatory pre-decomposition read of the most recent post-mortem. If that post-mortem identifies an overscoping pattern, treat the suggested task sizes as an upper bound for any single agent turn in the new sprint. This addresses the root cause mechanically rather than by memory. (pm.md 1.0.0 → 1.0.1)

    (2) FE CONSTANT AUDIT NARROW INTERPRETATION (003b SA failure): Receipt checklist phrased the constant rule as "animation timing values"; FE#3 read this narrowly as ms durations only and excluded 20+ raw px values in box-shadow offsets, blur radius, spread radius, opacity fractions, and ring widths. The auditor caught this on SA, forcing one remediation cycle. Root cause: "timing values" is ambiguous and invited the wrong scope boundary. Fix: Expanded the Constant Usage Audit note in frontend.md to explicitly state: "all CSS numeric literals (px, %, opacity, Hz, gain) are in-scope — not just ms 'timing values'." Clarified that px values in box-shadow, border-widths, translate amounts, and ANY CSS template literal are covered by the constant audit requirement. (frontend.md 1.1.2 → 1.1.3)

    (3) FE MISSING PRE-SUBMISSION SELF-GREP FOR CSS NUMERICS (003b auditor-caught): FE agents had no grep step to self-catch raw numerics inside CSS template strings before submission. The 003b failure (20+ violations) was caught only by the auditor rather than self-caught. This delays feedback by one cycle and risks shipping if auditor misses a case. Fix: Added explicit CSS template string numeric grep step to FE pre-submission checklist: `grep -nP '\d+px|\d+\.\d+|rgba\('` to catch raw literals in keyframes, box-shadows, and computed style strings. FE agents now run this scan on every `.ts`/`.tsx` file containing backtick CSS blocks before issuing their ui_packet, enabling self-catch before audit. (frontend.md 1.1.3 → 1.1.4)

    NO UNRESOLVED GAPS: All three protocol gaps from the post-mortem have been addressed in agent specifications. The fourth identified gap (session-spanning audit state on 001b, 003a) was assessed as low-risk; the existing checkpoint protocol already surfaces this state accurately.

    RETENTION: These changes follow the pattern from the prior improvement session (agent-improvement-2026-03-17-1), which addressed 4 gaps from P1+P2 post-mortems. This session continues the protocol hardening effort by addressing the highest-leverage recurring patterns (PM overscoping, FE boundary interpretation) that have now appeared twice in consecutive sprints.
  </rationale>
  <dependencies>
    gander-studio-p2-canvas-link.md (post-mortem identifying gaps 1-3; Section 6 "Recurring PM Overscoping Pattern", Section 6 "FE Constant Interpolation Interpretation Gap", Section 4 "FE Pre-flight Gap");
    gander-studio-p1-materia-canvas.md (prior documented overscoping pattern that P2 repeated);
    agent-improvement-2026-03-17-1.md (prior improvement session addressing P1+P2 gaps in CR, orchestrator, FE/auditor specs);
    FE#3 remediation cycle (003b SA failure, constant interpolation in MATERIA_CANVAS_KEYFRAMES)
  </dependencies>
  <retention_keys>
    docs/agent-improvements/agent-improvement-2026-03-30-1.md (full change log);
    docs/agent-changelog.md (aggregate spec version history);
    .claude/agents/pm.md version 1.0.1 — added step 0: read most recent post-mortem before decomposing; if overscoping pattern identified, treat task-size examples as upper bounds;
    .claude/agents/frontend.md version 1.1.3 — clarified constant audit scope: all CSS numeric literals (px, %, opacity, Hz, gain), not just ms durations;
    .claude/agents/frontend.md version 1.1.4 — added CSS template string self-grep before ui_packet: `grep -nP '\d+px|\d+\.\d+|rgba\('`;
    pattern: recurring PM overscoping (P1 + P2) now mitigated by mandatory post-mortem read + upper-bound constraint;
    pattern: FE constant interpretation (003b SA fail) now mitigated by explicit scope clarification + pre-submission self-grep;
    next improvement review trigger: monitor PM step 0 adoption in next sprint — if pattern repeats, escalate to harder constraint (max-task-count rule).
  </retention_keys>
</archive_entry>

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
