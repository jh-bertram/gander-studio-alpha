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

<archive_entry>
  <timestamp>2026-04-27T12:00:00Z</timestamp>
  <task_id>gander-studio-p2-agent-cards-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>
    Post-mortem on completed sprint gander-studio-p2-agent-cards (2026-03-30T00:00Z → 2026-04-04T06:25Z, 5.3 days, 3 sessions, 5 implementation tasks). Verdict confirmed: PARTIAL_PASS (35/36 requirements COVERED, 1 PARTIAL on HCG-2 proximity edge regression). Post-mortem analysis surfaced 6 protocol gaps and 2 skill drift candidates, plus 1 content-quality candidate for requirements-validate.

    KEY FINDINGS:

    (1) PM OVERSCOPING PATTERN RECURS (G1): Same 4-files-into-1-task error documented in canvas-link post-mortem (§5, C2). PM#0 v1 packed CardNode creation + 4 design constants + getMateriaColor signature change + MateriaNode prop change into FE-001, forcing critic CR#1 to issue 5 BLOCKERs and 3 WARNINGs. PM revised 3 times (G1 requires 2 full PM-revise → Critic re-block cycles, 2.5h wall-clock). Root cause: despite agent-improvement-2026-03-30-1.md documenting the overscoping pattern and PM.md 1.0.1 mandating pre-decomposition post-mortem read, the PM did not read the canvas-link post-mortem before decomposing. This indicates the feedback loop from post-mortem-into-PM-prompt is not closing. **Lesson:** Mandatory post-mortem read is ineffective without enforcement — PM agent needs a deterministic `pm-preflight.sh` hook that greps the 3 most recent post-mortems for OVERSCOPED patterns and surfaces them as a checklist before decomposition, not as a prose suggestion.

    (2) VERBATIM DELIVERABLE OMISSION (G2): PM#0 v1 silently dropped the human's stated "appearance config file" deliverable (noted in brief overview). Critic CR#1 caught this as C1 SCOPE_DRIFT. Root cause: PM parsed the human's request as a vague narrative ("update colors") rather than extracting nouns/verbs and mapping them to tasks. Alternative considered: defer it with explicit rationale. This was correct, but omission without a deferred block invited the block. **Lesson:** dispatch-task skill needs a `verbatim-deliverable-check` script at Step 1 that parses nouns/verbs from the human brief and requires the PM brief to include each in a task or a `<deferred>` block.

    (3) A11Y CLICK-HANDLER-WITHOUT-KEYBOARD (G3): FE-001b delivered CardNode.tsx with a title-edit `<span onClick=...>` lacking keyboard equivalent (`tabIndex`, `role="button"`, `onKeyDown`). Auditor SA gate caught it on first read (AUDIT_FAIL); FE#2 remediated in 1 cycle (~2h). Root cause: FE#2 performed a visual click-test but did not conduct a keyboard-only walkthrough. **Lesson:** Deterministic grep for this pattern can self-catch it before audit. Add a `PreToolUse:Edit` hook on FE agent that runs `grep -nP 'onClick=' on all .tsx files in diff and fails COMPLETE if any non-button/anchor element lacks a sibling `tabIndex` and `onKeyDown`. This is a code-not-prompt opportunity (G3).

    (4) NODE_TYPES / toRFNode EDGE-RENDERING REGRESSION (G4, ROOT CAUSE OF HCG-2): FE-002 wave modified toRFNode to branch on ORCHESTRATOR_ID returning type:'card'. Audit gates all passed (SA, QA, SX); requirements-validate marked 35/36 as COVERED. But at human visual check (post-delivery), proximity-link edge did not render after snap, though sound played. Post-mortem analysis: Playwright spec in proximity-link.spec.ts asserts on playLink() firing and state mutation, not on the rendered `.react-flow__edge` DOM element. The edge-creation code is present but may not execute (drop handler missing addEdge call) or may not sync to RF state. No audit gate detects visual-only regressions. **Lessons:** (a) Add explicit `.react-flow__edge` assertion to proximity-link.spec.ts post-snap (FE follow-up); (b) Add auditor checklist rule: any diff touching NODE_TYPES, toRFNode, toRFEdge requires a DOM-assertion Playwright test, not just store-state verification (G4).

    (5) AUDIT GATES DO NOT RUN DEV SERVER (G5): Audit pipeline runs lint + Playwright headless. It does not launch the dev server and visually verify rendered output. HCG-2 would have been caught by visual smoke (launch dev, proximity snap, screenshot edges). Alternative considered: add Tier 3 smoke to audit pipeline. This is a heavy lift but necessary for any edge-rendering, z-order, or off-canvas positioning bugs to be visible. Defer to future sprint but document as a known blindspot (G5).

    (6) SOUND-AS-PROXY-FOR-SUCCESS ANTI-PATTERN (G6): proximity-link.spec.ts asserts playLink() fires as proxy for "edge created." When node-type registration changed in FE-002, the sound emission remained decoupled from the edge render. Spec rule: when asserting a side effect (sound, network call, store mutation), also assert the primary user-visible effect (rendered DOM element) (G6).

    SKILL DRIFT & CONTENT-QUALITY CANDIDATES:

    (A) convention-detect not invoked: Skill was defined but not auto-triggered at dispatch-task Step 0.5. Sprint conventions inherited from canvas-link without re-detection. Recommendation: make convention-detect mandatory in dispatch-task flow (drift candidate).

    (B) requirements-validate produced PARTIAL_PASS by static-only verification: Skill correctly identified HCG-2 as PARTIAL but did not catch it by running the app — human visual check found it. Skill currently does traceability only, no runtime verification. When a criterion describes runtime behavior (renders, plays, navigates), skill should spawn a Playwright smoke or surface as REQUIRES_HUMAN_VISUAL (content-quality candidate).

    (C) audit-pipeline lacks Tier 3 visual smoke: Drift candidate. Add explicit note that pipeline cannot catch visual-only regressions; any diff touching NODE_TYPES, canvas rendering, or edge creation needs supplemental manual visual check or Tier 3 automated smoke.

    NEW SKILL CANDIDATES:

    - `pm-preflight` (LOW effort): Grep 3 recent post-mortems for OVERSCOPED / SCOPE_DRIFT patterns; surface checklist before PM dispatch (addresses G1).
    - `react-flow-render-smoke` (MEDIUM effort): Launch dev server, run Playwright snapshot on canvas + edges after proximity snap; diff against baseline (addresses G4/G5).

    AGENT PERFORMANCE:

    | Agent | First-pass | Notes |
    |-------|-----------|-------|
    | PM#0  | 0% (3 BLOCKER cycles) | Overscoping recurrence; pattern not internalized despite prior post-mortem. |
    | CR#1  | 100% (5 BLOCKERs correct) | High-value gate; caught all overscoping issues + logic regression (5-color to 3-color). |
    | DS#1  | 100% | Clean schema + role classification. |
    | FE#1  | 100% | Constants + getMateriaColor signature. |
    | FE#2  | 0% → 100% (SA fail: a11y click handler, 1 remediation) | Keyboard-navigation oversight; auditor caught. |
    | FE#3  | 100% | NODE_TYPES registration + CardNode. Post-delivery HCG-2 regression attributed to this wave, but regression not visible at audit (G4 gap). |
    | FE#4  | 100% | LoadoutListPanel tree layout + Playwright coverage. |
    | AUDITOR (×6) | 100% accuracy | FE-001b FAIL was correct; all PASS verdicts correct. 1 post-delivery regression not caught (G4 gap, not auditor fault). |
    | requirements-validate | PARTIAL | Static-only verification; did not catch HCG-2 by running app (content-quality gap). |

    OVERALL FIRST-PASS RATE: 5/7 auditable agents = 71%. PM contributed 0%, FE#2 failed SA, others clean.

    PATTERN ANALYSIS: PM overscoping (identical to canvas-link C2) recurred despite agent-improvement-2026-03-30-1.md §1 explicitly adding PM.md step 0 "mandatory pre-decomposition read." This indicates mandatory prose steps are insufficient — deterministic hooks (pm-preflight.sh) are required. Recommendation for next improvement session: escalate PM overscoping from prose-based to hook-based enforcement.

    SUMMARY OF 6 PROTOCOL GAPS:
    - G1: PM overscoping recurs; needs pm-preflight.sh deterministic hook, not prose instruction
    - G2: Verbatim deliverable omission; needs verbatim-deliverable-check script in dispatch-task
    - G3: A11y click-handler-without-keyboard; needs PreToolUse:Edit grep hook on FE agent
    - G4: NODE_TYPES changes break edge rendering with no audit signal; needs DOM-assertion spec update + auditor rule
    - G5: Audit gates don't run dev server; visual regressions invisible. Defer Tier 3 smoke but document blindspot
    - G6: Sound-as-proxy-for-success spec anti-pattern; needs spec authoring rule in standards.md
  </rationale>
  <dependencies>
    gander-studio-p2-agent-cards (sprint completion, tasks DS-001, FE-001a/b, FE-002, FE-003, 5 audit waves);
    gander-studio-p2-canvas-link.md (prior post-mortem documenting C2 overscoping pattern);
    agent-improvement-2026-03-30-1.md (attempt to fix overscoping via PM.md prose; did not prevent recurrence);
    proximity-link.spec.ts (Playwright spec asserts on sound, not edge DOM);
    FE-001b AUDIT_FAIL (keyboard-navigation a11y violation);
    FE-002 NODE_TYPES changes (origin of HCG-2 edge-rendering regression)
  </dependencies>
  <retention_keys>
    docs/post-mortems/gander-studio-p2-agent-cards.md (full post-mortem with 8 sections);
    6 protocol gaps identified (G1–G6), ranked by impact:
      G1: PM overscoping pattern (P1, P2 recurring) — needs pm-preflight.sh hook not prose
      G2: Verbatim deliverable omission — needs verbatim-deliverable-check script
      G3: A11y click-handler-without-keyboard — needs PreToolUse:Edit grep hook
      G4: NODE_TYPES / toRFNode change breaks edge rendering — needs DOM-assertion spec + auditor rule
      G5: Audit gates don't run dev server — visual regressions invisible, defer Tier 3 smoke
      G6: Sound-as-proxy-for-success spec anti-pattern — needs standards.md rule
    1 content-quality candidate: requirements-validate (static-only, needs runtime verification option)
    2 new skill candidates: pm-preflight (LOW effort, addresses G1), react-flow-render-smoke (MEDIUM effort, addresses G4/G5)
    2 drift candidates: convention-detect (not auto-invoked), audit-pipeline (lacks Tier 3 visual smoke)
    HCG-2 proximity edge regression: sound plays, no edge renders. Root cause: likely drop handler doesn't call addEdge or RF edges state not syncing. Needs investigation. Posted to /home/jhber/.claude/projects/-home-jhber-projects-gander-studio-alpha/memory/project_proximity_edge_bug.md
    Key contract change: FE-001b keyboard-inaccessible span remediated with role="button", tabIndex={0}, onKeyDown handlers. Pattern now part of accessibility checklist.
    PM.md Step 0 "mandatory post-mortem read" was added in agent-improvement-2026-03-30-1 but did not prevent overscoping recurrence — prose instruction insufficient. Next improvement needs code-not-prompt enforcement (pm-preflight.sh hook).
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-04-27T14:30:00Z</timestamp>
  <task_id>agent-improvement-2026-04-27-1</task_id>
  <event_type>AGENT_IMPROVEMENT</event_type>
  <rationale>
    Acted on 4 of 6 protocol gaps identified in post-mortem `gander-studio-p2-agent-cards.md`. Changed 4 agent specification files (pm.md, critic.md, frontend.md, auditor.md) with 8 targeted edits to close recurring pattern failures and post-delivery regression gaps:

    (1) G1 — PM OVERSCOPING RECURRENCE (P1 + P2 + agent-cards): Prior improvement session (2026-03-30-1) added prose-only Step 0 "read most recent post-mortem" to PM agent spec, but the same overscoping pattern (4 files into 1 task) recurred in agent-cards FE-001, wasting 2+ planning cycles on Critic revisions. Root cause: prose instructions are bypassed when nothing mechanically enforces them. Fix: Escalated to structural enforcement. Added PM Step 0.5 requiring PM to emit one `<recurring_pattern>` XML element per row of Section 6 tables in the 3 most recent post-mortems, with explicit avoid/accept rationale for each identified pattern. Critic hardened OVERSCOPED dimension with deterministic 4+-file BLOCKER threshold for FE tasks (no escape hatch). Added recurring-pattern declaration enforcement: missing PM enumeration is now a `MISSING_RECURRENCE_DECLARATION` BLOCKER. This triples the enforcement surface: (a) PM must produce the XML enumeration, (b) Critic mechanically validates it exists, (c) Critic blocks if the enumeration is missing or incomplete. Version: pm.md 1.4.6 → 1.5.0; critic.md 1.3.1 → 1.4.0.

    (2) G2 — PM SILENT DELIVERABLE OMISSION: PM step 7 required noun/verb coverage in prose routing notes, but allowed free-text affirmation without structural verification. PM v1 confirmed coverage ("update colors in getMateriaColor") while silently omitting the human's stated "appearance config file" deliverable, which the Critic caught only by re-reading the original brief. Fix: Strengthened PM step 7 to require a literal `<verbatim_deliverable_audit>` XML block in written output with one `<phrase>` per noun/verb phrase extracted from the human's request, each mapping to `<addressed task=...>`, `<deferred reason=...>`, or `<out_of_scope reason=...>`. Affirmations without this block fail the completeness check. This ensures every deliverable noun is explicitly routed, not silently dropped. Included in pm.md 1.5.0 (combined with G1 edits into single MINOR bump).

    (3) G3 — A11Y CLICK-HANDLER-WITHOUT-KEYBOARD (FE-001b audit fail): FE delivered inline title-edit span with `onClick` handler lacking `tabIndex`, `role="button"`, and `onKeyDown` keyboard handlers — violations caught by auditor SA gate after implementation, costing ~2h remediation. Pattern is mechanical and detectable by grep: span/div/li elements with onClick but not on button/a elements, missing the three required a11y attributes. Fix: Added Click-Handler Keyboard-Equivalent Audit section to FE agent, requiring `grep -nE "<(span|div|li|a)[^>]*onClick="` on every modified .tsx file before ui_packet submission. Each match on non-button/anchor must have all three attributes. Added matching SA gate in auditor spec as defense in depth, so even if FE misses it, auditor blocks pre-delivery. Version: frontend.md 1.5.0 → 1.6.0; auditor.md 1.5.0 → 1.6.0. Post-mortem flagged this as a hook candidate; grep-in-prose lands the rule today; HR can convert to PreToolUse:Edit hook in a follow-up sprint.

    (4) G4 — NODE_TYPES CHANGE BREAKS EDGE RENDERING, NO AUDIT SIGNAL (HCG-2 root cause): FE-002 modified NODE_TYPES and toRFNode to register the orchestrator card, passing all audit gates (SA, QA, SX) and 35/36 requirements validation. However, proximity-link edge did not render post-snap at runtime, though sound played — a post-delivery regression invisible to the audit pipeline. Root cause chain: (a) Playwright spec asserted on playLink() callback and canvas store edge entry (side effects), not `.react-flow__edge` DOM presence (primary user-visible effect); (b) No audit gate detects visual-only regressions from NODE_TYPES/toRFNode changes; (c) Audit pipeline runs lint + headless Playwright, not visual dev-server smoke. Fix: Added React Flow NODE_TYPES/EDGE_TYPES/toRFNode/toRFEdge AUDIT_RISK rule to Critic requiring any plan touching these exports to mandate DOM-presence assertions in the spec (not side-effect proxies). Added "Side-Effect-As-Proxy Spec Anti-Pattern" section to FE spec with bad/good code examples, mandating that every side-effect assertion (sound, store mutation, callback) be paired with a DOM-presence assertion (`.react-flow__edge` for edges, `.react-flow__node` for nodes). Added React Flow rendering-registration SA gate to auditor: if diff matches NODE_TYPES|EDGE_TYPES|toRFNode|toRFEdge and spec has no `.react-flow__edge` or `.react-flow__node` matcher, SA FAIL. This captures the regression at three layers: (a) PM planning layer (Critic blocks plans without proper spec intent), (b) FE pre-submission layer (FE reviews spec for DOM assertions), (c) auditor SA layer (auditor double-checks on any RF changes). Version: critic.md 1.4.0 (combined with G1); frontend.md 1.6.0 (combined with G3); auditor.md 1.6.0 (combined with G3).

    GAPS NOT ADDRESSED:
    - G5 (Tier 3 visual smoke): Heavy lift requiring new tooling (Playwright visual regression, baseline screenshots, diff library). Post-mortem itself defers this. Documented as a known blindspot; surface to human for future sprint scoping.
    - G6 (Sound-as-proxy spec anti-pattern): Addressed indirectly via G4's "Side-Effect-As-Proxy" rule, which covers both side-effect proxies and sound-specific cases. Duplicating would create two contradicting authorities; folded into G4.

    SKILL FINDINGS ROUTED TO HONE:
    Post-mortem identifies 1 content-quality candidate (requirements-validate), 2 new skill candidates (pm-preflight shell script, react-flow-render-smoke Playwright smoke), and 2 drift candidates (convention-detect auto-invocation, audit-pipeline Tier 3 gap). These are out of agent-improvement scope — routed to human for next orchestration step.

    NO RESEARCH CONDUCTED: All four gaps were mechanically derivable from post-mortem evidence. No external best-practice lookup or third-party verification needed. All fixes trace directly to root-cause + counterfactual + suggested fix already documented in post-mortem Section 6.

    COMMIT STATUS: Changes to pm.md, critic.md, frontend.md, auditor.md pending — commit not yet verified. Will be included in a durability commit by the human or orchestrator commit-packet step.
  </rationale>
  <dependencies>
    gander-studio-p2-agent-cards.md (post-mortem identifying gaps G1–G6 with Section 6 root-cause tables);
    gander-studio-p2-canvas-link.md (prior post-mortem documenting C2 overscoping pattern, referenced by G1);
    agent-improvement-2026-03-30-1.md (prior prose-only fix for overscoping that proved insufficient);
    FE-001b AUDIT_FAIL (keyboard-navigation a11y violation, origin of G3);
    FE-002 NODE_TYPES changes (origin of HCG-2 edge-rendering regression, root of G4);
    pm.md spec file (1.4.6 baseline);
    critic.md spec file (1.3.1 baseline);
    frontend.md spec file (1.5.0 baseline);
    auditor.md spec file (1.5.0 baseline)
  </dependencies>
  <retention_keys>
    docs/agent-improvements/agent-improvement-2026-04-27-1.md (full change log with 8 edits);
    docs/agent-changelog.md (aggregate spec version history);
    Archived prior versions: docs/agent-versions/{pm,critic,frontend,auditor}/v{prior}-2026-04-27.md (for audit trail);
    4 gaps addressed: G1 (PM overscoping → Step 0.5 + Critic enforcement), G2 (deliverable omission → verbatim_deliverable_audit block), G3 (a11y click handler → grep + auditor gate), G4 (NODE_TYPES edge regression → side-effect-as-proxy spec rule + RF SA gate);
    2 gaps deferred: G5 (Tier 3 visual smoke, heavy lift, documented as blindspot), G6 (folded into G4 fix);
    3 gaps converted to hook candidates for HR: pm-preflight.sh (G1), verbatim-deliverable-check (G2), PreToolUse:Edit grep (G3);
    5 skill findings routed to hone: 1 content-quality, 2 new skill candidates, 2 drift candidates;
    Critical enforcement surfaces (defense in depth):
      - G1: PM Step 0.5 enumeration + Critic MISSING_RECURRENCE_DECLARATION block + Critic 4+-file BLOCKER for FE
      - G3: FE pre-submission grep + auditor SA gate
      - G4: Critic AUDIT_RISK on NODE_TYPES + FE side-effect-as-proxy spec section + auditor React Flow SA gate
    Next review trigger: after proximity-edge-fix sprint (HCG-2 followup) or 2 additional sprints. Monitor PM Step 0.5 adoption and FE pre-flight execution rate.
    Pattern: prose-only agent improvements have proven ineffective when repeated (G1 prose from 2026-03-30 recurred); structural XML blocks + mechanical Critic checks represent third intervention escalation.
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-04-27T16:45:00Z</timestamp>
  <task_id>hone-2026-04-27-1</task_id>
  <event_type>HONE_SESSION</event_type>
  <rationale>
    Hone session acting on 3 of 5 skill findings from post-mortem `gander-studio-p2-agent-cards.md` Section 5. Session name: hone-2026-04-27-1. Closed 3 Section 8 findings (1 content-quality, 2 skill drift) via skill specification updates. 2 additional findings escalated to human as new-skill candidates pending design review.

    (1) REQUIREMENTS-VALIDATE CONTENT-QUALITY (8c-content): Post-mortem § 5.B identified that requirements-validate performs static-only verification (reading specs, traceability checks, Zod schema coverage) without running the app. When criterion describes runtime behavior (renders, plays, navigates, transmits, snaps), skill outputs PARTIAL without executing the code path. HCG-2 proximity-edge regression (sound plays, no edge renders) was static-traceability COVERED but runtime FAILED — only caught at human visual check. Root cause: skill lacks provision for runtime verification when spec references a user-visible behavior. Fix: Enhanced skill spec requirements-validate.md with Step 2.5 "Runtime Behavior Verification" — when criterion explicitly references user-observable behavior (DOM render, audio play, canvas animation, mouse drag feedback), skill now (a) checks if Playwright spec exists with DOM-presence assertion for that behavior, (b) if spec lacks coverage, emits REQUIRES_HUMAN_VISUAL flag on PARTIAL verdict and recommends manual spot-check. This preserves static-traceability speed while surfacing gaps in runtime coverage to the human. Version: requirements-validate 1.0.2 → 1.1.0.

    (2) DISPATCH-TASK SKILL DRIFT (8e-drift): Post-mortem § 5.A identified convention-detect as a defined skill that should run at dispatch-task Step 0.5 (after input parsing, before task plan writing) but was never invoked in the agent-cards sprint. Convention-detect declares "Run at Step 0.5" in its spec, but dispatch-task Step 0 stops at Step 0.4 (generate tasks), Step 0.6 (routing), with no corresponding Step 0.5 slot. This is a contract drift: convention-detect's self-declared contract was out of sync with dispatch-task's actual step sequence. Fix: Added explicit Step 0.5 to dispatch-task spec flow: "Convention Detection (Automatic)" — runs convention-detect.sh on the project tree, emits a <conventions> XML block listing detected patterns (monorepo structure, Zod schemas on boundaries, YAML agent specs, tRPC routers), and threads conventions into task descriptions. This closes the gap where convention-detect defined its own insertion point without being wired into the caller's flow. Version: dispatch-task 1.5.0 → 1.6.0.

    (3) AUDIT-PIPELINE KNOWN-BLINDSPOT DOCUMENTATION (8e-drift): Post-mortem § 5.C identified audit-pipeline as lacking Tier 3 visual-rendering smoke (cannot detect z-order bugs, off-canvas regressions, edge-render failures). This is a capability gap, not a bug — the pipeline correctly states it cannot catch visual-only regressions (§ 5.C: "Audit gates don't run dev server"). Rather than attempt a heavy-lift tool-add in a hone session, skill spec was updated with explicit pipeline_integrity: VISUAL_BLINDSPOT_KNOWN flag. Step 5 now emits this flag on any SA/QA/SX pass that touches NODE_TYPES, canvas rendering, positioning, or z-index patterns. Recommendation surfaces: "human visual smoke recommended for FE diffs touching {portal, z-index, transform, position, overflow}" until a future sprint implements Tier 3 automated visual regression (heavy lift deferred). Version: audit-pipeline 1.3.0 → 1.3.1.

    NO SKILL RETIREMENTS: All 3 skills remain in active use. No specifications were removed or deprecated.

    NEW SKILL CANDIDATES ESCALATED (out of hone scope):
    Post-mortem § 5 identified 2 new skill candidates requiring design by human or skill-creator agent:
    - `pm-preflight.sh` (LOW effort): Grep 3 recent post-mortems for OVERSCOPED / SCOPE_DRIFT patterns; surface checklist before PM dispatch. Addresses agent-improvement G1. Ready for human design.
    - `react-flow-render-smoke` (MEDIUM effort): Playwright runner for NODE_TYPES diffs — launches dev server, captures baseline canvas state, runs proximity snap, diffs edges DOM post-snap, reports regression. Addresses agent-improvement G4 + post-mortem G5. Requires visual-regression baseline strategy (human design choice).

    RESEARCH TASKS SPAWNED: 0 — all skill updates mechanically derived from post-mortem § 5 evidence.

    RETENTION KEYS FOR NEXT IMPROVEMENT SESSION:
    - docs/agent-improvements/hone-2026-04-27-1.md (full change log, 3 spec updates)
    - docs/agent-changelog.md (updated versions: requirements-validate 1.1.0, dispatch-task 1.6.0, audit-pipeline 1.3.1)
    - Archived prior versions: docs/agent-versions/skills/{requirements-validate,dispatch-task,audit-pipeline}/v{prior}-2026-04-27.md
    - 3 Section 8 findings closed: 8c (requirements-validate runtime verification) + 8e-drift (dispatch-task Step 0.5, audit-pipeline blindspot doc)
    - 2 Section 8 findings routed to human: new skill pm-preflight (LOW) + new skill react-flow-render-smoke (MEDIUM)
    - Step 0.5 convention-detect contract now wired into dispatch-task Step 0.5 explicit slot
    - requirements-validate now emits REQUIRES_HUMAN_VISUAL on runtime-behavior PARTIAL gaps
    - audit-pipeline now emits pipeline_integrity: VISUAL_BLINDSPOT_KNOWN on NODE_TYPES / canvas diffs
  </rationale>
  <dependencies>
    gander-studio-p2-agent-cards.md (post-mortem § 5 identifying 5 skill findings, 8c + 8e slots);
    agent-improvement-2026-04-27-1.md (preceding agent-improvement session, agent specs hardening);
    convention-detect.md skill spec (declares Step 0.5 insertion point, now wired);
    requirements-validate.md (prior 1.0.2 version);
    dispatch-task.md (prior 1.5.0 version);
    audit-pipeline.md (prior 1.3.0 version)
  </dependencies>
  <retention_keys>
    docs/agent-improvements/hone-2026-04-27-1.md;
    docs/agent-changelog.md (aggregate skill version history);
    docs/agent-versions/skills/{requirements-validate,dispatch-task,audit-pipeline}/v{prior}-2026-04-27.md (archived baselines);
    3 skills modified:
      1. requirements-validate 1.0.2 → 1.1.0: Added Step 2.5 Runtime Behavior Verification — emits REQUIRES_HUMAN_VISUAL when criterion describes observable behavior but spec lacks DOM/audio/animation assertion
      2. dispatch-task 1.5.0 → 1.6.0: Added Step 0.5 "Convention Detection (Automatic)" — wires convention-detect.sh invocation into explicit step slot, threads <conventions> block into task descriptions
      3. audit-pipeline 1.3.0 → 1.3.1: Added pipeline_integrity: VISUAL_BLINDSPOT_KNOWN flag on NODE_TYPES/canvas/z-index diffs, documents known limitation (no dev-server visual smoke) and recommends human visual spot-check
    2 new-skill candidates routed to human:
      1. pm-preflight.sh (LOW effort, addresses agent-improvement G1)
      2. react-flow-render-smoke (MEDIUM effort, addresses agent-improvement G4/G5)
    0 retirement candidates
    0 research tasks spawned
    Closed Section 8 findings: 8c (content-quality), 8e-drift (2 slots)
    Remaining post-mortem findings for future work: new-skill design (2 candidates), Tier 3 visual smoke tooling (deferred), hook implementations (pm-preflight.sh, verbatim-deliverable-check, PreToolUse:Edit grep — 3 candidates pending HR escalation from agent-improvement-2026-04-27-1)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-04-28T02:55:00Z</timestamp>
  <task_id>gander-studio-p4-proximity-edge-hardening-FE-001</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>
    FE-001 hardened Playwright spec file (packages/client/src/tests/compose/materia-canvas.spec.ts) across 4 advisories addressing test rigor and post-mortem G6 (sound-as-proxy anti-pattern).

    A1 — BROKEN SELECTOR REPLACEMENT &amp; SILENT-SKIP REMOVAL: Replaced zero-match selector `[data-testid^="palette-item-agent-"]` (palette items use `palette-item-{name}`, no type prefix) with section-landmark helpers `locateAgentPaletteItem` and `locateSkillPaletteItem` using h3 heading filters. Removed all silent-skip fallbacks (`test.skip`, `if (!isVisible) return`) at 4 sites and replaced with strict `waitFor({ state: 'visible', timeout: 5000 })`. Tests now fail hard when palette is empty, not silently skip — aligns with G6 hard-fail principle.

    A2 — TAUTOLOGY ASSERTION REPLACEMENT: Replaced `expect(postDragEdgeCount).toBeGreaterThanOrEqual(0)` (always true) with `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)`. Removed conditional wrapper `if (postDragEdgeCount > 0) { ... }` — edge presence assertion now unconditional and deterministic.

    A3 — AGENT↔SKILL PROXIMITY TEST: Added new test exercising agent-to-skill proximity drop symmetrically (prior tests were agent-to-orchestrator-card only). Uses both landmark helpers; asserts `edgeCount > 0` (DOM-level, Tier 2).

    A4 — FREQUENCY-DISCRIMINATED AUDIO SPY &amp; DOM-EDGE PAIRED ASSERTION: Added test combining link-sound spy with DOM-edge assertion per post-mortem G6 (DOM primary, sound secondary, paired). Patched `AudioParam.prototype.setValueAtTime` globally to count oscillators set to LINK_PRIMARY_FREQ_HZ (880 Hz) and LINK_SECONDARY_FREQ_HZ (1320 Hz) only, filtering out APPROACH_FREQ_HZ (220 Hz) approach tone. Constants injected via serialized args; no magic numbers in test source. DOM assertion `expect(edgeCount).toBe(1)` runs first; audio assertion `expect(linkOscCount).toBe(2)` runs second. `addInitScript` placed BEFORE page navigation to ensure spy is installed before any audio context creation.

    ENVIRONMENT NOTE: Dev `.env` initially had `GANDER_ROOT=/home/jhber/projects/gander-studio-alpha` (empty, no agents/skills subdirs). AUDITOR#1 flagged silent-fallback anti-pattern violation; FE#1-rem1 remediation made helpers strict (no fallback). With corrected env (`GANDER_ROOT=/home/jhber/projects/gander`, 12 agents + 24 skills), AUDITOR#3 re-audit passed 9/9 spec tests. Environment fix is session-local (.env not git-tracked).

    ALTERNATIVES CONSIDERED FOR A4: (1) Raw oscillator-count reset-and-assert — proved wrong via CR#2 analysis (playApproach fires during drag, final count 3 not 2). (2) Spy on playLink function directly — brittle if audio module refactors. (3) Frequency-discriminated spy — selected. Isolates link oscillators from approach oscillators via `setValueAtTime` frequency argument, eliminates false positives, and is resilient to audio module implementation details.

    COMMITMENT: committed at `f970935`; audited PASS by AUDITOR#3.
  </rationale>
  <dependencies>
    gander-studio-p4-proximity-edge-hardening (sprint definition, task decomposition PM-rev2);
    post-mortem gander-studio-p2-agent-cards.md § 6 (G6: sound-as-proxy-for-success anti-pattern);
    constants/canvas.ts (LINK_PRIMARY_FREQ_HZ=880, LINK_SECONDARY_FREQ_HZ=1320, APPROACH_FREQ_HZ=220)
  </dependencies>
  <retention_keys>
    commit `f970935`: FE-001 spec hardening merged;
    landmark-helper pattern: h3.filter({ hasText: /^Agents$/i }).locator('..').locator('[data-testid^="palette-item-"]') — use for future palette item selection in Playwright tests;
    frequency-discriminated audio spy pattern: patch `AudioParam.prototype.setValueAtTime`, increment counter only for frequencies === LINK_PRIMARY_FREQ_HZ or === LINK_SECONDARY_FREQ_HZ; constants injected via serialized args to `page.addInitScript`; place spy BEFORE page navigation; use for future audio-side-effect tests;
    post-mortem G6 implementation: DOM assertion first, audio assertion second, paired not separate; frequency-discriminated spy is recommended pattern for link-sound tests;
    spec test names: "orchestrator↔agent proximity drop", "DOM .react-flow__edge count matches store edges", "agent↔skill proximity drop", "edge creation fires link sound and renders DOM edge element";
    environment coupling: GANDER_ROOT must point to agents repo with agents and skills subdirs; add pre-flight validation to FE task specs to catch this in planning phase (not audit phase)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-04-28T02:55:00Z</timestamp>
  <task_id>gander-studio-p4-proximity-edge-hardening-FE-002</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>
    FE-002 applied 3 production source hygiene fixes across 5 files, no behavior change. All changes committed at `c380956`.

    A5 — DEDUPLICATE INVISIBLE_HANDLE_STYLE CONSTANT: Extracted byte-identical 9-property CSS object (width, height, opacity, pointerEvents, top, left, transform, border, background) from both MateriaNode.tsx and CardNode.tsx into new `packages/client/src/components/compose/handle-style.ts`. Both components now import and use shared constant. Styles are property-order-independent for inline rendering; visual output identical before and after (byte-identity verified against commit edf6621).

    A6 — DELETE DEAD META_AGENTS BRANCH: In `constants/compose.ts`, removed unreachable `if (META_AGENTS.has(lower)) return 'var(--mp)'` branch at line 79 (COMMAND_AGENTS alias intercepts all META_AGENTS members first, making branch dead). Removed un-aliased import `META_AGENTS,` at line 11 (to-remove). Preserved aliased import `META_AGENTS as COMMAND_AGENTS` at line 7 (still used at line 75) and `META_FRAGMENTS,` at line 12 (still used at line 82). Added comment explaining alias relationship. Color behavior unchanged: COMMAND_AGENTS members still return `'var(--my)'` (meta yellow).

    A7 — EXPLICIT ROLE ARG TO getMateriaColor: In `MateriaCanvas.tsx` `buildPaletteItemStyle`, computed `paletteRole` const as `'specialist'` for agents, `'skill'` for skills, and passed as third arg to `getMateriaColor` call. No duplicate `AgentRole` import (already present). Color output verified identical: role-based fast path returns same CSS vars as prior name-based fallback (`'var(--mg)'` agents, `'var(--mb)'` skills).

    ALTERNATIVES CONSIDERED FOR A5: (1) Keep as separate literals in each component — violates DRY. (2) Extract to canvas.ts where all design tokens live — would introduce import chaining; co-locating in compose/handle-style.ts keeps component-related constants close to usage. (3) Export to a shared styles module — unnecessary indirection; static object export is cleaner.

    TESTING: Bundle completes at 881.67 kB (under 1000 kB gate). tsc --noEmit clean across all 3 packages. Playwright e2e baseline-stash verified: 31 passed, 13 failed pre-change; 31 passed, 13 failed post-change (identical failures, zero regressions).

    COMMITMENT: committed at `c380956`; audited PASS by AUDITOR#2.
  </rationale>
  <dependencies>
    gander-studio-p4-proximity-edge-hardening (sprint definition, task decomposition PM-rev2);
    commit edf6621 (prior proximity-edge-fix sprint, baseline for style identity verification)
  </dependencies>
  <retention_keys>
    commit `c380956`: FE-002 source hygiene merged;
    handle-style.ts pattern: 9-property CSSProperties object extracted to shared module for components using identical invisible-handle styles; co-location in `components/compose/handle-style.ts` keeps constant with related components (MateriaNode, CardNode);
    dead-code removal: when a condition guards a branch that is unreachable due to an earlier condition, delete the branch + any now-unused imports; add comment explaining why earlier condition makes branch dead;
    getMateriaColor explicit-role pattern: when optional `role` arg can be determined statically at call site (not user data), pass explicit value to enable role-based fast path and avoid name-based Set membership checks;
    bundle-size gate: main JS chunk must remain under 1000 kB per sprint-p2 SA constraint; current 881.67 kB leaves ~118 kB headroom for p5;
    baseline-stash methodology: for regression detection, stash all changes, run full test suite, pop stash, re-run on head with identical config; identical failure lists confirm zero regressions
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-04-28T02:55:00Z</timestamp>
  <task_id>gander-studio-p4-proximity-edge-hardening</task_id>
  <event_type>SPRINT_COMPLETE</event_type>
  <rationale>
    Sprint gander-studio-p4-proximity-edge-hardening completed: 7 auditor advisories (5 from sprint-p3 audit + 2 carried-forward from prior sprints) bundled into single test-rigor + code-hygiene sprint. All advisories shipped and audited PASS. Requirements validation: 12/12 COVERED.

    ARCHITECTURAL DECISIONS &amp; PATTERNS:

    (1) FREQUENCY-DISCRIMINATED AUDIO SPY (A4 decision, post-mortem G6 resolution): Replaced raw oscillator-count discrimination (which would fail CI due to playApproach drag-phase calls inflating count to 3 instead of expected 2) with frequency-selective spy on `AudioParam.prototype.setValueAtTime`. Spy increments `__linkOscCount` only for frequencies 880 Hz (LINK_PRIMARY_FREQ_HZ) and 1320 Hz (LINK_SECONDARY_FREQ_HZ), filtering out 220 Hz (APPROACH_FREQ_HZ) approach tone. Constants injected via serialized args to `page.addInitScript`; no magic numbers in test source. Spy installed BEFORE page navigation. This pattern is robust across audio module refactors (depends on frequency, not function name) and eliminates false-positive failures from drag-phase approach oscillators. Recommended for all future link-sound test assertions.

    (2) THREE-ROUND CRITIC GATE (human-authorized override): Critic round 1 proposed an option-(b) recipe for A4 that was found to have an arithmetic error in its own logic during CR#2. PM#2 would have escalated to full replan. Instead, PM#3 issued a narrow revision (A4 only), triggering a third Critic round (CR#3) to vet the frequency-spy replacement. Protocol cap is 2 rounds; round 3 required human authorization because the flaw was in the Critic's own recipe, not in PM/FE execution. This decision preserves efficiency when the flaw is localized to one advisory. SYSTEM HEALTH NOTE: This reveals a gap in the Critic spec — when giving prescriptive code recipes (especially for complex domains like audio synthesis or test spies), the Critic should prefer "name the problem and point at the file" over "write the fix". This sprint did not resolve the gap (out of scope) but documented it for future Critic spec revision.

    (3) SECTION LANDMARK PATTERN FOR PALETTE ITEM SELECTION: Replaced broken `[data-testid^="palette-item-agent-"]` selector (zero-match, palette items use no type prefix) with section-landmark pattern: `h3.filter({ hasText: /^Agents$/i }).locator('..').locator('[data-testid^="palette-item-"]')`. This technique scopes palette-item selection to a specific section via its heading, eliminating false negatives when multiple sections exist. Applied to both Agents (existing test fix) and Skills (new A3 test). Recommended pattern for future Playwright specs selecting items from repeated list sections.

    (4) ENVIRONMENT CONFIGURATION AS SESSION-LOCAL CONCERN: Dev `.env` had `GANDER_ROOT=/home/jhber/projects/gander-studio-alpha` (project root, no agents/skills), breaking landmark helpers during test execution. Correct path is `/home/jhber/projects/gander` (symlinked from `~/projects/gander`, contains 12 agents + 24 skills). ORC corrected `.env` mid-sprint (session-local, file not git-tracked). This reveals a gap in PM pre-flight: GANDER_ROOT validation should be a required check before FE task dispatch (prevent env misconfiguration from surfacing as test failures in audit). Recommendation: add environment checklist to PM task decomposition for FE work.

    CRITIC SYSTEM NOTE (for future meta-agent improvement): The Critic's prescribed option-(b) recipe in CR#1 turned out to be flawed (oscillator count arithmetic). This is a Critic-domain bug, not a PM/implementation failure. The protocol escalated to human override of the 2-round cap. Future Critic revisions may benefit from preferring problem statement + file pointers over prescriptive code recipes in complex domains (audio, React Flow internals, etc.), shifting verification burden from the Critic's code correctness to the implementing agent's problem-solving. Not a blocker (CR#3 validation caught it), but worth noting for system health.

    AUDIT OUTCOMES:
    - FE-001 initial audit: FAIL (AUDITOR#1 — fallback anti-pattern in helpers violates G6 principle)
    - FE-001 remediation: FE#1-rem1 removed fallbacks, strict helpers with hard `waitFor`, deleted debug files
    - FE-001 re-audit: PASS (AUDITOR#3 — 9/9 spec tests pass with corrected GANDER_ROOT; 13 pre-existing e2e failures unchanged, zero regressions)
    - FE-002 audit: PASS (AUDITOR#2 — SA + QA + SX all clear; bundle 881.67 kB; baseline-stash verified zero regressions)

    REQUIREMENTS COVERAGE: All 12 requirements from original request COVERED (R-001 through R-012). No gaps, no PARTIAL verdicts.

    TWO COMMITS:
    - `c380956`: FE-002 (handle-style.ts extracted; dead META_AGENTS branch removed; explicit role arg to getMateriaColor)
    - `f970935`: FE-001 (section-landmark selectors; silent-skip fallbacks removed; tautology assertion fixed; A3 agent↔skill test; A4 frequency-spy + DOM-edge paired test)
  </rationale>
  <dependencies>
    gander-studio-p2-agent-cards (sprint that introduced proximity-edge regression HCG-2);
    gander-studio-p3-proximity-edge-fix (sprint that shipped regression fix, surfaced 5 auditor advisories from post-audit);
    post-mortem gander-studio-p2-agent-cards.md (G4: NODE_TYPES edge-render regression lesson, G6: sound-as-proxy anti-pattern);
    agent-improvement-2026-04-27-1 (hardened Critic, FE, auditor specs per agent-cards post-mortem gaps)
  </dependencies>
  <retention_keys>
    docs/project_log.md entries: this sprint-complete entry, FE-001 task entry, FE-002 task entry;
    docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md (if created, will be populated by human post-session);
    frequency-discriminated audio spy pattern: recommended for all future link-sound Playwright tests; injected constants via serialized args; install spy BEFORE page navigation; 880/1320 Hz link frequencies, filter out 220 Hz approach frequency;
    section-landmark selector pattern: h3.filter({ hasText: /^SectionName$/i }).locator('..').locator('[data-testid^="prefix-"]') for selecting items from named list sections; applies to both new tests and existing broken selectors;
    GANDER_ROOT environment validation: add pre-flight checklist to PM task specs for FE work — verify GANDER_ROOT points to agents repo with agents/ and skills/ subdirs before dispatch;
    Critic spec gap: when giving prescriptive code recipes (especially complex domains), consider problem-statement + file-pointer approach instead; this allows implementing agent to solve creatively rather than execute potentially-flawed recipe;
    bundle-size gate: 881.67 kB current, ~118 kB headroom for next sprint under 1000 kB ceiling;
    AUDIT FAIL→REMEDIATION→PASS cycle (FE-001): Fallback anti-pattern in helpers (violates G6 hard-fail principle) → strict helpers + hard waitFor + debug cleanup → full audit pass;
    two-commit delivery: FE-002 source hygiene first (`c380956`), then FE-001 spec hardening (`f970935`);
    all 7 advisories closed across 2 task packets; 12/12 requirements covered
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-04-28T04:00:00Z</timestamp>
  <task_id>gander-studio-p4-proximity-edge-hardening-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>
    Gander Studio p4 sprint completed 2026-04-28: bundled 7 auditor advisories into single test-rigor + code-hygiene sprint. All advisories shipped across 2 commits (c380956 source-hygiene, f970935 spec-hardening) with full audit coverage (FE-001 initial FAIL→remediation→PASS, FE-002 first-pass PASS). Sprint closed clean after human browser verification. Post-mortem identified 6 protocol gaps and 4 skill findings (1 content-quality, 2 new-skill candidates, 1 drift).

    PROTOCOL GAPS (Section 6):
    (G1) SILENT-SUBSTITUTION-AS-GRACEFUL-DEGRADATION PATTERN RECURS: Silent-skip was advisory A1's target; FE#1 reintroduced fallback (Agents→Skills) violating the same G6 hard-fail principle A1 was meant to eliminate. AUDITOR#1 caught this in FE-001 initial audit (1 remediation cycle cost). Pattern appeared 3× in sprint (original p3 silent-skip, FE#1 fallback, GANDER_ROOT env). Root cause: fallback-as-graceful-degradation instinct overrides explicit principles in the brief. Fix: Add Stop hook on FE agent to grep for fallback patterns (`\|\| &lt;fallback&gt;`, `if (!.*) return &lt;fallback&gt;`, `try {} catch { return }`) in newly-added test code. Route to HR for hook implementation.

    (G2) PM DOES NOT PROPAGATE SPEC-LEVEL FIXES TO ALL SITES WITHIN THE SAME FILE: PM#1 applied A1's selector fix only to new A3 test, missed pre-existing tests at lines 99/154 in the same file. CR#1 caught it (1 full plan revision cost). The pre-existing tests had been "passing" because silent-skip absorbed their zero-match selectors; removing skip without fixing all selector instances would break them. Fix: Add same-file-propagation-check to PM's decomposition checklist: when an advisory cites a file fix, enumerate every existing instance and decide for each whether the fix applies. Agent-prompt change for PM, enforced via checklist line.

    (G3) CRITIC GIVES PRESCRIPTIVE CODE RECIPES WITH ARITHMETIC BUGS: CR#1's option-(b) recipe for A4 ("reset counter to 0, assert === 2") had its own arithmetic flaw — recipe author did not trace useLinkSound.ts to see that playApproach also fires during drag, making final count 3 not 2. PM#2 faithfully implemented the wrong recipe; CR#2 caught it (1 PM round + 1 CR round + human authorization cost). Root cause: Critic tried to write the fix rather than analyze the problem end-to-end. Fix: When Critic identifies a code-level fix in complex domains (audio synthesis, test spies, React Flow internals, scheduler logic), prefer "name the problem, point at the file, list the constraints" over "write the fix". Shift verification burden from Critic code-correctness to implementing agent problem-solving. Agent-prompt change for Critic, route to HR.

    (G4) PM DOES NOT PRE-FLIGHT ENVIRONMENTAL DEPENDENCIES: GANDER_ROOT was misconfigured (pointed to studio repo, not agents repo) before sprint start. Original silent-skip absorbed the broken env. When tests went strict (A1), env failure surfaced inside audit gate (~10 min diagnosis + 1 re-audit round) instead of planning gate. FE-001 Auditor flagged strict helpers with broken env; ORC diagnosed and fixed .env mid-sprint; AUDITOR#3 re-audit passed. Fix: For any FE task running Playwright against live dev server, PM must add pre-flight env-validation step: enumerate required env vars (GANDER_ROOT, LOADOUTS_DIR), run minimal liveness check (curl health + curl agent.list | jq length > 0), fail-fast if env broken. Code-not-prompt: implement as script invoked by assign-agents before FE wave dispatch. Route to HR.

    (G5) FE AGENTS LEAVE UNTRACKED SCRATCH FILES IN WORKING TREE: FE#1 left debug-selector.spec.ts and debug-selector2.spec.ts from investigation phase. Auditor caught cleanup item but it should have been caught at COMPLETE time. Files picked up by playwright test runner and emitted noise. Fix: Add working-tree-untracked-spec-check to FE pre-COMPLETE: git status --short should not show untracked .spec.ts files unless declared in &lt;files_modified&gt; or &lt;components_created&gt;. Code-not-prompt: implement as Stop hook on FE agent. Route to HR.

    (G6) ORC HAS NO SendMessage PRIMITIVE ON THIS HARNESS: Revision rounds spawn fresh PM/CR agents instead of continuing originals. Each fresh agent re-reads context, increasing token cost ~30% across 3 PM/CR rounds. Documented harness limitation — can't fix in spec. Workaround already in protocol: revision briefs include explicit &lt;prior_decomposition_path&gt; and &lt;critique_path&gt; so context is bridged via files. Acceptable as-is; mention in next system-health review if SendMessage-like primitive becomes available.

    SKILL FINDINGS (Section 8):

    (8c) CONTENT-QUALITY CANDIDATE — commit-packet: ORC ran git add + git commit directly, bypassing formal skill invocation. Skill spec provides template; ORC read it and executed inline. Skill description does not gate with hard artifact like assign-agents/requirements-validate do. Ambiguous whether inline execution satisfies contract or violates gating principle. Recommendation: Either (a) tighten spec to require formal invocation (matching assign-agents pattern: "ORC executing inline does not satisfy contract"), OR (b) accept inline execution and demote to documentation pattern. Decide via hone.

    (8d) NEW-SKILL CANDIDATES: Two patterns observed once this sprint, would apply to multiple prior sprints:
    - env-preflight (LOW effort): Pre-flight validation script for FE-against-live-API tasks — curl health + curl agent.list/skill.list non-empty. Invoked by assign-agents Step 1.5. Addresses G4.
    - silent-substitution-detect (MEDIUM effort): Grep-based analyzer for newly-added test code — detect fallback patterns, swallowed errors, || defaults masking failure. Addresses G1.

    (8e) DRIFT CANDIDATE — dispatch-task: ORC drove pipeline turn-by-turn rather than invoking meta-skill. Dispatch-task's composition value is unrealized; ORC reads it then executes constituent skills directly. Same gating issue as commit-packet. Either (a) gate meta-skill like assign-agents/requirements-validate, OR (b) demote to documentation pattern. Decide via hone.

    ARCHITECTURAL ACHIEVEMENTS:
    - Frequency-discriminated audio spy pattern for link-sound tests — injected constants, spy before page nav, frequency-filtered oscillator count
    - Section-landmark selector pattern for palette item selection via h3 heading scope
    - GANDER_ROOT environment requirement documented and validated
    - Three-round Critic gate (human-authorized override when flaw is in Critic recipe, not implementation)

    QUALITY GATES IN EFFECT: SA (Standards) + QA (Functional) + SX (Security) + CR plan-gate + REQVAL post-audit gate + human Step 4.5 visual verification. All 12 requirements COVERED. Zero runtime defects reached human; first audit cycle caught all deviations (FE-001 fallback anti-pattern, untracked debug files; GANDER_ROOT env surfaced as side-effect).
  </rationale>
  <dependencies>
    docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md (full post-mortem with section 6 &amp; 8 analysis);
    gander-studio-p4-proximity-edge-hardening (sprint task, 2-commit delivery);
    gander-studio-p4-proximity-edge-hardening-FE-001 (spec hardening task, frequency-spy + landmark selectors);
    gander-studio-p4-proximity-edge-hardening-FE-002 (source hygiene task, DRY extraction + dead code removal);
    agent-improvement-2026-04-27-1 (prior agent spec hardening, set stage for G3/G4 detection);
    gander-studio-p2-agent-cards.md post-mortem (G4 and G6 origin: NODE_TYPES edge-render regression, sound-as-proxy anti-pattern)
  </dependencies>
  <retention_keys>
    docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md (full post-mortem with all findings);
    commit c380956 (FE-002 durability: handle-style.ts DRY, dead META_AGENTS branch, explicit role arg);
    commit f970935 (FE-001 durability: section-landmark selectors, strict waitFor/helpers, A3 agent↔skill test, A4 frequency-spy + DOM-paired test);
    6 protocol gaps identified: G1 (silent-substitution pattern, FE Stop hook), G2 (same-file fix propagation, PM checklist), G3 (Critic prescriptive recipe flaws, Critic spec change), G4 (env pre-flight, assign-agents script), G5 (untracked spec files, FE Stop hook), G6 (SendMessage limitation, documented);
    4 skill findings: 1 content-quality (commit-packet gating), 2 new-skill candidates (env-preflight LOW, silent-substitution-detect MEDIUM), 1 drift candidate (dispatch-task meta-skill bypass);
    frequency-discriminated audio spy: LINK_PRIMARY_FREQ_HZ (880), LINK_SECONDARY_FREQ_HZ (1320), filter out APPROACH_FREQ_HZ (220); constants injected via serialized args; spy installed BEFORE page navigation; DOM assertion first, audio second;
    section-landmark selector pattern: h3.filter({ hasText: /^SectionName$/i }).locator('..').locator('[data-testid^="item-"]') for scoping item selection to named list sections;
    GANDER_ROOT must point to agents repo root (~/projects/gander), not studio repo (gander-studio-alpha);
    A1–A7 all delivered and audited PASS; FE-001 remediation required (fallback→strict helpers), GANDER_ROOT env correction required (session-local .env fix);
    two-agent workflow yielded highest quality: FE-002 shipped clean first-pass (AUDITOR#2 PASS), FE-001 required 1 remediation cycle (AUDITOR#1 FAIL→FE#1-rem1→AUDITOR#3 PASS);
    Critic three-round gate justified by human authorization (CR#1's option-(b) recipe bug, not PM/FE failure);
    All 12 requirements COVERED; zero regressions; 13 pre-existing e2e failures unchanged
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-04-28T13:35:00Z</timestamp>
  <task_id>agent-improvement-2026-04-28-1</task_id>
  <event_type>AGENT_IMPROVEMENT</event_type>
  <rationale>
    Acted on 2 of 6 protocol gaps identified in gander-studio-p4-proximity-edge-hardening post-mortem.
    These two gaps are agent-prompt-only fixes (no code/hook infrastructure required); the other four
    require dedicated HR sprints (hooks, scripts, settings.json wiring) and were deferred.

    **G2 — PM same-file fix propagation (ACTED)**
    Root cause: PM#1 propagated A1's selector-fix to the new A3 test but did not enumerate the
    pre-existing test sites at lines 99/154 in the same spec file. CR#1 caught it at plan-review time,
    forcing a full plan revision (PM#1 → PM#2). Cost: 1 CR round + 1 PM round.
    Fix: Added Step 5.5 to `.claude/agents/pm.md` (v1.5.0 → v1.5.1): "Same-file fix propagation.
    When an advisory cites a fix at a specific line, grep the entire file for the pattern and enumerate
    every existing instance in the task packet description."
    Mechanism: Checklist addition. Enforced at PM spec-read time, not gated by external artifact.

    **G3 — Critic prescriptive code recipes in complex domains (ACTED)**
    Root cause: CR#1 wrote an option-(b) recipe for A4 ("reset counter, assert === 2") without tracing
    useLinkSound.ts to see that playApproach also fires during drag. PM#2 implemented the recipe
    faithfully. CR#2 caught it (via source trace) after a wasted PM round + Critic round. Cost:
    1 PM round + 1 CR round + human authorization for 3rd Critic round (cap exceeded).
    Fix: Added "Recipe vs. problem-naming" guidance to `.claude/agents/critic.md` (v1.4.0 → v1.4.1)
    at the close of §AUDIT_RISK: "In complex domains (audio synthesis, test spies, scheduler/event-loop
    logic, React Flow internals, build-tool internals) prefer naming the problem and pointing at the file
    over writing a prescriptive recipe. Reserve recipes for domains the Critic has fully traced."
    Mechanism: Guidance insertion. Enforced at Critic spec-read time; effectiveness to be monitored over
    the next 2 sprints.

    **Deferred gaps (G1, G4, G5, G6) — rationale for deferral**
    - G1 (silent-substitution pattern, FE): Requires a Stop hook with regex/false-positive analysis.
    - G4 (env pre-flight before FE dispatch): Requires a script (~/.claude/scripts/env-preflight.sh)
      invoked by assign-agents, plus settings.json wiring.
    - G5 (untracked spec files): Requires a Stop hook checking `git status --short` for undeclared .spec.ts.
    - G6 (SendMessage harness limitation): Documented as acceptable; no action until Anthropic harness
      provides SendMessage primitive.

    Recommendation: Bundle G1, G4, G5 into single HR-led "team-hygiene-hooks" sprint covering new
    artifacts (~/.claude/hooks/fe-silent-substitution-check.sh, ~/.claude/hooks/fe-untracked-spec-check.sh,
    ~/.claude/scripts/env-preflight.sh) and settings.json wiring.

    **Outstanding hone-domain item**
    Post-mortem §8c identified a skill-drift candidate: commit-packet and dispatch-task gating. ORC bypassed
    commit-packet skill and executed inline (git add + git commit). dispatch-task skill was similarly bypassed
    in favor of invoking constituent skills individually. Recommendation: `hone` should decide whether to
    tighten both skills' gating (make them mandatory entry points with hard artifact checks) or demote them
    to documentation patterns. This decision sits outside scope of agent-improvement; requires PM/hone collaboration.
  </rationale>
  <dependencies>
    gander-studio-p4-proximity-edge-hardening (post-mortem source; all 6 gaps, all rationales);
    agent-improvement session rationale derives from post-mortem §6 G2 and G3 evidence chains;
    deferred gaps (G1/G4/G5) identified as "Code-not-prompt" in post-mortem §6 and tabled for HR;
    hone-domain item from post-mortem §8c and §8e (skill-drift and content-quality analysis)
  </dependencies>
  <retention_keys>
    docs/agent-improvements/agent-improvement-2026-04-28-1.md (full session report);
    docs/agent-changelog.md § agent-improvement-2026-04-28-1 (version bumps: PM 1.5.0→1.5.1, Critic 1.4.0→1.4.1);
    docs/agent-versions/pm/v1.5.0-2026-04-28.md (PM Step 5.5 spec);
    docs/agent-versions/critic/v1.4.0-2026-04-28.md (Critic recipe-vs-problem-naming guidance);
    4 deferred gaps (G1, G4, G5, G6) — recommend "team-hygiene-hooks" HR sprint scope;
    1 outstanding hone item: commit-packet and dispatch-task skill gating decision;
    G2/G3 fixes are prompt-text additions, enforced at agent spec-read time (not gated by external artifact);
    G2 mechanism: PM adds grep+enumerate step when fixing repeated patterns in same file;
    G3 mechanism: Critic prefers problem-naming in complex audio/test/scheduler/RF domains over prescriptive recipes;
    Effectiveness of G3 guidance to be monitored next 2 sprints — if no change, escalate to hard gate rule;
    Silent-substitution pattern (G1) recurred at 3 layers in p4 (orig advisory, FE fallback, env masking);
      if it recurs before hook implementation, escalate to BLOCKER status
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-05-20T18:35:35Z</timestamp>
  <task_id>prog-studio-sessions-2026-05-s1-backend</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>
    Sprint prog-studio-sessions-2026-05-s1-backend delivered backend data layer for Sessions mode across 7 packets (t1–t5 implementation, t2a scaffolding, plus implicit t2b/t3/t4a/t4b subdivisions). All 7 packets audited PASS, committed sequentially, and requirements-validated COVERED (13/13).

    DELIVERABLES (dual-format post-mortem parser + JSONL event-log parser + stats join):

    (t1) SCHEMAS: packages/shared/src/schemas.ts — EventLogEntrySchema, AgentActivitySchema, SessionSchema, SessionStatsSchema with full z.infer type definitions. ev field is z.string() (not union of literal strings) to accommodate real JSONL corpus format variations. gap_classes defaults to empty array; status/type/gander_root optional per dual-format tolerance. source_root required on SessionSchema, enabling multi-root scans. Commit d1c3408.

    (t2a) VITEST SCAFFOLD: packages/server vitest.config.ts + test script wired to npm run test. No audit gate applied (per scope); receipt-verified via live test runner invocation. Commit e36e22d.

    (t2b) SESSION-PARSER: session-parser.ts + 18 tests + 6 fixtures spanning both post-mortem formats (gander YAML-frontmatter + studio frontmatter-less prose). Dual-format tolerance built into parser: YAML frontmatter reads standard fields (id, title, gap_classes, status, type); absence of YAML defaults to empty frontmatter + derives title from H1 prose via WARNING-1 pattern. WARNING-1 (id=filename-stem slug, title=H1 prose) documented as intentional relaxation enabling loose post-mortem schema. Commit ef196bb.

    (t3) EVENT-LOG-PARSER + STATS: event-log-parser.ts (reads JSONL, parses z.string() ev regression guard via real corpus matching), session-stats.ts (joins parsed events into per-agent activity buckets + duration summaries), 9 tests, JSONL fixture with real agent-improvement events. z.string() ev field proven on real corpus — regression guard in place if schema ever tightens to union literals. Commit e39fd3f.

    (t4a) ENV + DOCS: env.ts (SESSIONS_EDITS_DIR, SESSIONS_SOURCE_DIRS with path.resolve for absolute paths), .env.example (template), CLAUDE.md (updated architecture docs). Absolute path resolution verified; cwd-drift edge case addressed (task runners and npm scripts may have different cwd; absolute paths required). Commit d85f3b5.

    (t4b) ROUTER + SESSION-LIST: router.ts (session.list, session.get, session.getStats, session.saveEdit procedures), session-list.ts collectSessions helper. session.list returns envelope {sessions, skipped} surfacing per-file robustness (NEW-1b: skipped count emitted for files that throw). composite key (source_root, id) dedup enabled via Set intersection (NEW-2: cross-root same-id post-mortems both appear, not silently dropped). Try/catch wrapping per file — one bad post-mortem doesn't break entire list. Multi-root scan test validates SESSIONS_SOURCE_DIRS split + aggregation. Commit ae16993.

    (t5) SAVEDIT-HARDENING: saveedit-guard.ts (validateSaveEditPath pure function), saveedit-security.test.ts (5 malicious test cases: path traversal via ../, sibling-prefix collision, absolute path bypass, symlink escape, double-encoding). Router session.saveEdit calls guard before any FS operation. SX empirically validated: all 5 attack vectors rejected. Commit f81ce01.

    ARCHITECTURAL DECISIONS &amp; RATIONALE:

    (1) CONFIGURABLE SOURCES (env var SESSIONS_SOURCE_DIRS): Human decision to enable multi-root scanning while preserving Invariant 2 (when unset, defaults to GANDER_ROOT, app remains self-contained). Alternative considered: hardcode GANDER_ROOT only — would prevent studio from cataloging its own post-mortems; rejected in favor of explicit env config. Sessions mode now unblocks S2 (list-edit UI) and S3 (analyze mode).

    (2) DUAL-FORMAT TOLERANCE: Parser reads both gander YAML-frontmatter and studio frontmatter-less post-mortems as first-class. Schema relaxation (gap_classes optional array default, status/type optional) enables loose post-mortem ingestion. WARNING-1 (id=filename-stem slug, title=H1 prose) is intentional pattern, not fallback. Alternative considered: strict schema, reject studio post-mortems — would fragment data sources; dual-format tolerance accepted at cost of loose parsing. This supports the broader Invariant 2 goal: studio becomes a tool for browsing gander's own session history as well as exporting loadouts.

    (3) PLAN-FACT CORRECTION (ORC revision): Initial plan's fixture gander-studio-p2-agent-cards.md was Format-B (frontmatter-less) and not in GANDER_ROOT. ORC substituted confirmed Format-A files in gander (gander-p2-hone-skill, gander-p7, gander-studio-p1, gander-p5) + added Format-B prose-H1 fixture (gander-studio-p2-p3.md), validating both parse paths. Revision cost: 1 PM plan round (rev1 → rev2) + 1 Critic round (CR#1 → CR#2).

    (4) TWO ORIGINAL BLOCKERS RESOLVED: CR#1 issued BLOCKERS on per-file robustness (parseSessionFile throws on Format-B) and dedup silence (cross-root same-id sessions dropped). ORC's rev2 plan addressed both: (a) per-file try/catch + skipped count envelope (NEW-1b), (b) composite-key dedup via (source_root, id) Set intersection (NEW-2). Both verified in t4b tests.

    (5) PROCESS DEVIATION (backend engineer inline commit): BE committed inline at 9e69360 (before audit gate). ORC audited HEAD (PASS), then amended commit to f81ce01 with proper trailers (task_id, requirements, etc). Recommendation recorded in memory: backend-engineer must return completion_packet only; orchestrator owns post-audit commits via commit-packet. This is a protocol improvement item, not a quality issue (code passed audit clean).

    AUDIT OUTCOMES (all SA PASS / QA PASS / SX SECURE):
    - t1 (schemas): AUDITOR PASS (d1c3408)
    - t2b (session-parser): AUDITOR PASS (ef196bb)
    - t3 (event-log): AUDITOR PASS (e39fd3f)
    - t4b (router): AUDITOR PASS (ae16993)
    - t5 (hardening): AUDITOR PASS (f81ce01)

    REQUIREMENTS VALIDATION: All 13 requirements COVERED (100%).

    CROSS-SPRINT CONTRACT PUBLISHED (for S2 list-edit + S3 analyze):
    - Import types: SessionSchema, AgentActivitySchema, EventLogEntrySchema, SessionStatsSchema via z.infer from packages/shared/src/schemas.ts
    - tRPC procedures: session.list (returns {sessions: Session[], skipped: number}), session.get(id), session.getStats(id), session.saveEdit(saveReq)
    - Env vars: SESSIONS_EDITS_DIR (absolute path for edited session writes), SESSIONS_SOURCE_DIRS (colon-sep list, defaults to GANDER_ROOT)
    - Per-file robustness: session.list surfaces skipped count; individual file parse errors do not block list operation
    - Path security: session.saveEdit path-validated via saveedit-guard before any FS write; 5 attack vectors rejected

    INTEGRATION TESTING: 35 server tests pass; npm run lint clean across all 3 packages; existing procedures (agent/skill/hook/loadout/export/health) untouched.

    RETENTION KEYS:
    - d1c3408 (t1 schemas), ef196bb (t2b parser), e39fd3f (t3 event-log), ae16993 (t4b router), f81ce01 (t5 hardening) — 5 core commits forming S1 BE layer
    - Dual-format post-mortem tolerance enables studio to ingest both gander (YAML-frontmatter) and studio (frontmatter-less H1-title) post-mortems
    - Configurable SESSIONS_SOURCE_DIRS (defaults GANDER_ROOT) preserves Invariant 2 while enabling multi-root scanning
    - Per-file try/catch robustness + skipped count (NEW-1b) resolves BLOCKER-1
    - Composite-key (source_root, id) dedup (NEW-2) resolves BLOCKER-2
    - saveedit-guard.ts pattern for path traversal hardening; 5-case security test covers precedent for future FS operations
    - env.ts absolute path resolution (path.resolve) required for cwd-drift safety across npm script runners
    - FE S2/S3 may assume session.list envelope {sessions, skipped}, session.get/getStats bare objects (note asymmetry for pagination/filtering design)
    - Process improvement: BE must return completion_packet; ORC owns commit-packet (inline commits bypass audit gate contract)
  </rationale>
  <dependencies>
    prog-studio-sessions-2026-05-s1-backend (sprint definition, plan rev2 after CR-PASS);
    ORC#1 session resumption (2026-05-20 RESUME event from SESSION-CHECKPOINT-2026-05-20.md);
    gander project at fd836d8 (clean rollback point before sprint wave);
    s2-list-edit-ui (next sprint, FE consumer of session.list/get/saveEdit);
    s3-analyze-mode (subsequent sprint, consumer of session.getStats + EventLogEntrySchema)
  </dependencies>
  <retention_keys>
    docs/project_log.md entries: this sprint-complete entry for prog-studio-sessions-2026-05-s1-backend;
    packages/shared/src/schemas.ts (SessionSchema, AgentActivitySchema, EventLogEntrySchema, SessionStatsSchema; z.infer types exported);
    packages/server/src/session-parser.ts (18 tests, dual-format YAML/H1 tolerance);
    packages/server/src/event-log-parser.ts + session-stats.ts (9 tests, JSONL corpus validation);
    packages/server/src/router.ts (session.list/get/getStats/saveEdit procedures, per-file try/catch + skipped envelope);
    packages/server/src/saveedit-guard.ts (validateSaveEditPath pure function, 5 SX test cases);
    packages/server/src/env.ts (SESSIONS_EDITS_DIR, SESSIONS_SOURCE_DIRS with path.resolve);
    Commits: d1c3408 (t1), e36e22d (t2a), ef196bb (t2b), e39fd3f (t3), d85f3b5 (t4a), ae16993 (t4b), f81ce01 (t5);
    NEW-1b: per-file robustness with skipped count in envelope resolves BLOCKER-1;
    NEW-2: composite-key dedup (source_root, id) resolves BLOCKER-2;
    WARNING-1: post-mortem id derived from filename stem, title from H1 prose (intentional, dual-format tolerance);
    Process note: BE#1 committed inline (9e69360); ORC audited + amended to f81ce01 with trailers; protocol improvement needed (BE returns packet, ORC commits);
    All 13 requirements COVERED; 35 server tests pass; npm run lint clean;
    S2/S3 contract: session.list envelope {sessions, skipped}; session.get/getStats bare objects; path security validated; multi-root scans enabled
  </retention_keys>
</archive_entry>
