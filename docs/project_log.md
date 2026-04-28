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
