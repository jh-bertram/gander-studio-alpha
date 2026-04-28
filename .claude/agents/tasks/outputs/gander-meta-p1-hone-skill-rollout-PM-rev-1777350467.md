# PM Revised Output — gander-meta-p1-hone-skill-rollout

**Task ID:** gander-meta-p1-hone-skill-rollout
**PM instance:** PM#0 (revision 1)
**Date:** 2026-04-28
**Trigger:** Critic BLOCK — 3 BLOCKERs + 1 WARNING

---

<revision_notes>
BLOCKER-001 (dispatch-task step renumber chain): HR-002 description now specifies a
3-edit renumber sequence in this order: (1) Edit 3a-pre renames the EXISTING
"## Step 0.8: Name Confirmation" to "## Step 0.9: Name Confirmation"; (2) Edit 3a
renames "## Step 0.7: Scry (Optional)" to "## Step 0.8: Scry (Optional)"; (3) Edit 3b
inserts the new "## Step 0.7: PM Preflight" section. Verified by reading dispatch-task
SKILL.md: Scry body (lines 166-192) contains no self-reference to "Step 0.7"; Name
Confirmation body (lines 196-210) contains no self-reference to "Step 0.8". No
additional body-text updates needed beyond heading renames.

BLOCKER-002 (SC9 tautology): SC9 replaced entirely with 5 anchored heading grep checks:
  - grep -E '^## Step 0.7: PM Preflight' returns 1
  - grep -E '^## Step 0.8: Scry' returns 1
  - grep -E '^## Step 0.9: Name Confirmation' returns 1
  - grep -E '^## Step 0.7: Scry' returns 0 (old heading gone)
  - grep -E '^## Step 0.8: Name Confirmation' returns 0 (old heading gone)

BLOCKER-003 (broken regex): SC5 recipe now uses literal [<>] character class. SC8 now
has an explicit shell recipe (per-file awk+grep loop with literal [<>]).

WARNING (Edit 3b insertion ambiguity): Edit 3b now specifies the exact verbatim anchor
text from line 162 of the file. The new Step 0.7 inserts after the post-mortem root
cause paragraph that ends "...Critic remediation rounds for this class of error are now
structurally avoidable." and before the (now-renumbered) "## Step 0.8: Scry (Optional)"
heading.

ADVISORY (Tier-1 placement rationale): Added explicit <rationale> block in HR-001's
task packet description for the silent-substitution-detect Tier-1 architectural choice.
</revision_notes>

---

<task_decomposition task_id="gander-meta-p1-hone-skill-rollout" agent_count="2">
  <task_packets>

    <task_packet>
      <task_id>gander-meta-p1-hone-skill-rollout-HR-001</task_id>
      <assigned_to>HR (system-health-monitor)</assigned_to>
      <priority>HIGH</priority>
      <description>
Create 4 new SKILL.md files in the gander skills catalog. Each file must live at:
  /home/jhber/projects/gander/.claude/skills/{name}/SKILL.md

The 4 skills are specified below with their full required content. Write each file
exactly. Frontmatter rules: `description:` must be a single-line YAML scalar (no `|` or `>`),
under 1,024 characters, no XML tags (no `&lt;` or `&gt;` characters), no angle-bracket
placeholders — use curly-brace `{placeholder}` form inside YAML values. Third-person phrasing.
Front-load the primary use case in the first 80 characters. Include 3–6 trigger phrases
in `when_to_use:`.

---

SKILL 1: env-preflight
Path: /home/jhber/projects/gander/.claude/skills/env-preflight/SKILL.md

Source evidence:
- gander-studio-p4-proximity-edge-hardening §8d: "Pre-flight env validation before FE wave dispatch (curl health + curl agent.list/skill.list non-empty) — LOW effort"
- §6 G4: "For any FE task that runs Playwright against a live dev server, PM must add a pre-flight env-validation step: enumerate required env vars (GANDER_ROOT, etc.), run a minimal liveness check (curl health + curl agent.list | jq length > 0), and fail-fast if env is broken."
- Integration: invoked from assign-agents Step 1.6 for any sprint whose expectation_manifest includes FE tasks with live-API dependencies.

Required frontmatter fields:
  name: env-preflight
  description: (single-line, ≤1024 chars, third-person, front-loaded, no angle-brackets)
  version: 1.0.0
  when_to_use: (trigger phrases)

Required body sections:
  ## Why This Exists
    Explain the GANDER_ROOT misconfiguration root cause from p4 sprint: the original
    silent-skip in proximity-link tests absorbed the empty agent.list response; when
    tests went strict, the env failure surfaced inside the audit gate (after a
    remediation round) rather than at planning/dispatch time. A pre-flight check at
    assign-agents Step 1.6 would have surfaced the broken env before any FE agent
    was spawned.

  ## When To Use
    Trigger: any sprint whose expectation_manifest includes at least one FE task
    whose success criteria reference Playwright tests against a live dev server
    (e.g., agent.list, skill.list, or any tRPC endpoint).
    Skip: back-end-only or meta-agent-only sprints (no live API dependency).

  ## Procedure
    Step 1: Identify the server base URL (default: http://localhost:3001).
    Step 2: curl {server}/health — expect HTTP 200. If non-200 or connection refused,
      halt and emit env_preflight_fail: "dev server unreachable at {url}" to ORC.
    Step 3: curl {server}/trpc/agent.list?batch=1 — parse response; verify the result
      array is non-empty (jq '.[] | .result.data | length > 0'). If empty or parse
      error, halt with env_preflight_fail: "agent.list returned empty — GANDER_ROOT
      may be misconfigured".
    Step 4: curl {server}/trpc/skill.list?batch=1 — same non-empty check.
    Step 5: If all three checks pass, emit env_preflight_pass to ORC and proceed.
      Include the agent count and skill count in the pass message.

  ## Failure Handling
    On any failure, surface to ORC with:
      - Which check failed (health / agent.list / skill.list)
      - The raw curl response (truncated to 200 chars)
      - A concrete remediation hint (e.g., "verify GANDER_ROOT in .env points to a
        directory whose .claude/agents/ contains agent .md files")
    ORC must resolve the env issue before dispatching any FE agents. Do not work
    around the failure by re-running with fallback values.

  ## Shell Recipes
    # Health check
    curl -sf http://localhost:3001/health || echo "FAIL: health"

    # Agent list non-empty
    AGENT_COUNT=$(curl -sf "http://localhost:3001/trpc/agent.list?batch=1" \
      | jq -r '.[0].result.data | length') && \
    [ "$AGENT_COUNT" -gt 0 ] && echo "agents: $AGENT_COUNT" || echo "FAIL: agent.list empty"

    # Skill list non-empty
    SKILL_COUNT=$(curl -sf "http://localhost:3001/trpc/skill.list?batch=1" \
      | jq -r '.[0].result.data | length') && \
    [ "$SKILL_COUNT" -gt 0 ] && echo "skills: $SKILL_COUNT" || echo "FAIL: skill.list empty"

---

SKILL 2: silent-substitution-detect
Path: /home/jhber/projects/gander/.claude/skills/silent-substitution-detect/SKILL.md

Source evidence:
- gander-studio-p4-proximity-edge-hardening §8d: "Detect 'silent-substitution-as-graceful-degradation' patterns in newly-added test code (greps for fallback patterns, swallowed errors, || defaults that mask failure) — MEDIUM effort"
- §5 Recurring failure pattern: "Silent-substitution-as-graceful-degradation appeared three times in this sprint — original sprint p3 silent-skip (the advisory), FE#1's Agents→Skills fallback (the audit FAIL), and the GANDER_ROOT env (broken-by-default-but-masked)."
- §6 G1: "Add a silent-substitution-check to the FE agent's pre-COMPLETE checklist: greps for || fallback, if (!.*) {.*return;}, try {} catch { return fallback } patterns in newly-added test code."
- Integration: invoked by audit-pipeline as a Tier-1 sub-check (runs inside the SA gate on FE diffs).

ARCHITECTURAL RATIONALE FOR TIER-1 PLACEMENT:
The post-mortem (§6 G1) proposed either a Stop hook on the FE agent or a Tier-3
sub-rule under audit-pipeline. This plan places silent-substitution-detect as a
Tier-1 SA-gate sub-check instead. Rationale:

  (a) Stop hook on FE: would require FE agents to self-police before emitting their
      packet. The failure class this skill addresses is precisely that FE agents do
      not notice silent substitution at write time. A self-check at the agent level
      relies on the same judgment that failed. Moving the check to the auditor's
      SA gate makes it an independent verification layer.

  (b) Tier-3 sub-rule under audit-pipeline: Tier-3 runs after SA and QA. A silent
      substitution in a test file may cause a QA check to produce a false PASS
      (the test "passes" because the fallback masked the real behavior). Running
      the check at Tier-1 (before SA) ensures the auditor sees the substitution
      before any QA assertion is trusted.

  (c) Tier-1 SA-gate (chosen): earliest possible independent verification point.
      Runs before any test results are examined. Blocks the sprint before standards
      check even begins. If the skill later reverts to Stop-hook design, the skill
      body will need a placement note update but the grep patterns and output format
      remain identical — the refactoring cost is one description edit.

This rationale should be recorded in the skill body under ## Why This Exists or
as a ## Architecture Note section so the next hone sprint that revisits placement
has the decision trail.

Required frontmatter fields:
  name: silent-substitution-detect
  description: (single-line, ≤1024 chars, third-person, front-loaded, no angle-brackets)
  version: 1.0.0
  when_to_use: (trigger phrases)

Required body sections:
  ## Why This Exists
    Explain the three-way pattern from p4: (1) the test.skip silent-skip that masked
    a selector bug for multiple sprints; (2) FE#1's Agents→Skills fallback helper
    that renamed the test "orchestrator vs agent" but exercised orchestrator vs skill;
    (3) the GANDER_ROOT env that was broken-by-default but masked by the empty-array
    fallback. All three shared the same structural signature: a code path that returns
    a "good enough" value when the primary path fails, making the failure invisible.

    Include a ## Architecture Note (or subsection) recording the Tier-1 placement
    rationale above (why not Stop hook, why not Tier-3).

  ## When To Use
    Trigger: audit-pipeline SA gate for any FE diff. Runs automatically on any diff
    that adds or modifies .spec.ts, .test.ts, or .tsx/.ts files.
    Also trigger phrases: "check for silent fallbacks", "detect swallowed errors",
    "scan for graceful degradation anti-patterns", "audit test robustness".
    Skip: pure documentation changes, CSS-only diffs, non-JS/TS files.

  ## Pattern Definitions
    The following patterns are considered silent substitutions:

    PATTERN 1 — Fallback-on-falsy (|| default):
      Grep: /\|\|[[:space:]]*\[/ or /\|\|[[:space:]]*(null|undefined|''|""|0|false)\b/
      in test/source additions. Flag: "|| fallback masks primary-path failure".
      Exception: intentional defaults in config files with a // INTENTIONAL comment.

    PATTERN 2 — Early-return-on-missing:
      Grep: /if\s*\(!\s*\w+\)\s*(return|continue)/
      Flag: "early return swallows absent value — hard-fail instead".

    PATTERN 3 — Empty catch:
      Grep: /catch\s*\([^)]*\)\s*\{[^}]*\}/  (catch body that contains no throw/log)
      Or more specifically: /catch\s*\([^)]*\)\s*\{\s*(return|resolve)\(/
      Flag: "catch block returns fallback value — swallows error".

    PATTERN 4 — Null-coalescing default that swallows error:
      Grep: /\?\?[[:space:]]*(null|\[\]|\{\}|''|""|0|false)\b/ in test assertions
      Flag: "?? default may mask primary-path failure in assertion context".

    PATTERN 5 — Test-skip / conditional skip:
      Grep: /test\.skip|it\.skip|describe\.skip|xit\b|xdescribe\b/
      Flag: "skipped test silently passes — convert to hard-fail or remove".

  ## Severity Classification
    BLOCKER: PATTERN 5 (test.skip — always blocks audit PASS)
    BLOCKER: PATTERN 3 (empty catch returning a value in test code)
    WARNING: PATTERN 1, 2, 4 (severity depends on assertion context; flag with
      file:line and the matched text; auditor decides whether to escalate to BLOCKER
      based on whether the fallback could mask a regression)

  ## Output Format
    Emit one finding per match:

    silent_substitution_finding:
      pattern: {PATTERN_1 | PATTERN_2 | PATTERN_3 | PATTERN_4 | PATTERN_5}
      file: {path}
      line: {N}
      matched_text: {the specific matched substring — ≤120 chars}
      severity: {BLOCKER | WARNING}
      recommendation: {one sentence — what to do instead}

    If zero findings: emit silent_substitution_clear (no patterns detected in diff).

  ## Shell Recipe (for auditor use)
    # Run against newly added lines in the diff (git diff HEAD -- *.ts *.tsx | grep '^+' | grep -v '^+++')
    git diff HEAD -- '*.spec.ts' '*.test.ts' '*.ts' '*.tsx' \
      | grep '^+' | grep -v '^+++' \
      | grep -nE '\|\|[[:space:]]*\[|\|\|[[:space:]]*(null|undefined|'\'''\''|""|0|false)' \
      && echo "PATTERN_1 found" || true
    git diff HEAD -- '*.spec.ts' '*.test.ts' '*.ts' '*.tsx' \
      | grep '^+' | grep -v '^+++' \
      | grep -nE 'test\.skip|it\.skip|describe\.skip|xit\b|xdescribe\b' \
      && echo "PATTERN_5 found" || true

---

SKILL 3: pm-preflight
Path: /home/jhber/projects/gander/.claude/skills/pm-preflight/SKILL.md

Source evidence:
- gander-studio-p2-agent-cards §8d: "PM brief pre-flight against recent post-mortem patterns (overscoping, scope-drift, missing Playwright spec) — LOW effort (grep + checklist); would have prevented 2 critic-block rounds."
- §6 G1: "Add a deterministic pm-preflight.sh script that runs before PM emits its task_decomposition: greps the most recent 3 post-mortems for OVERSCOPED | SCOPE_DRIFT rows and surfaces them as a checklist the PM must explicitly tick."
- Integration: invoked as dispatch-task Step 0.7 (between Step 0.6 PM Context Preflight and the existing Scry step — which becomes Step 0.8).

Required frontmatter fields:
  name: pm-preflight
  description: (single-line, ≤1024 chars, third-person, front-loaded, no angle-brackets)
  version: 1.0.0
  when_to_use: (trigger phrases)

Required body sections:
  ## Why This Exists
    Explain the p2 root cause: PM#0 packed 4 independent units into a single FE-001
    task across 4 files (same overscoping pattern from canvas-link sprint); PM#0 also
    silently dropped the "appearance config file" deliverable from the human request.
    Two Critic-block rounds resulted. The overscoping pattern had been documented in
    the canvas-link post-mortem and the agent-changelog, but PM did not read recent
    post-mortems before decomposing — it applied training-data defaults instead.
    pm-preflight forces that read at the top of every decomposition cycle.

  ## When To Use
    Trigger: automatically at dispatch-task Step 0.7, before PM decomposition, for
    every sprint. This is not opt-in — every PM brief must pass through pm-preflight.
    Also trigger phrases: "run pm preflight", "check post-mortem patterns", "pre-flight
    the plan", "what patterns should PM watch for".
    Skip: only for data-terminal sprints (RA or ST is the executor; no PM decomposition
    follows) or single-agent remediation loops.

  ## Procedure
    Step 1: Identify the 3 most recent post-mortems.
      bash: ls -t /home/jhber/projects/gander/docs/post-mortems/*.md | head -3
      Also check: ls -t /home/jhber/projects/gander-studio-alpha/docs/post-mortems/*.md | head -3
      Use the 3 most recent across both directories.

    Step 2: Extract protocol gap rows from each post-mortem.
      For each file, extract section 6 rows:
        awk '/^## 6\. Protocol Gaps|^## 6\. Protocol/ {p=1; next} /^## [0-9]/ {p=0} p' {file}
      Record: (a) gap label, (b) suggested fix, (c) whether the fix is categorized
      as affecting PM, ORC, or FE.

    Step 3: Extract CRITIQUE_BLOCK root causes from each post-mortem.
      Grep for: OVERSCOPED|SCOPE_DRIFT|ASSUMPTION|DRY|AUDIT_RISK|VERBATIM_DELIVERABLE
      Record each token with its source file.

    Step 4: Produce a pm_preflight_checklist.
      Format the checklist as an XML block for insertion into the orchestrator_brief:

      pm_preflight_checklist:
        source_post_mortems: [{list of 3 files used}]
        recurring_patterns:
          - pattern: OVERSCOPED
            description: {specific finding from post-mortem, ≤60 chars}
            pm_check: "Each task packet must have ≤2 independent files per domain. If a task packs 3+ files with independent logic, split it."
          - pattern: SCOPE_DRIFT
            description: {specific finding}
            pm_check: "Every noun/verb from the human request must appear in a task packet as addressed, deferred-with-rationale, or explicitly out-of-scope. No silent drops."
          - pattern: AUDIT_RISK
            description: {specific finding}
            pm_check: "Any interactive UI surface must have a named Playwright spec in success_criteria. No 'visual verification only' without a spec file path."
          [add one entry per token found in Step 3; skip if zero tokens found for a pattern]
        acknowledgement_required: true

    Step 5: Surface the checklist to ORC.
      ORC inserts the pm_preflight_checklist verbatim into the PM's orchestrator_brief
      under a section heading "## PM Preflight Checklist". The PM must explicitly
      acknowledge each item in its routing_notes before returning task_decomposition.

  ## Output
    Produces a pm_preflight_checklist XML block. ORC includes it in the PM's brief.
    If zero recurring patterns are found in the 3 post-mortems, emit an empty checklist
    with a note: "No recurring protocol gap patterns found in the 3 most recent post-mortems."

---

SKILL 4: react-flow-render-smoke
Path: /home/jhber/projects/gander/.claude/skills/react-flow-render-smoke/SKILL.md

Source evidence:
- gander-studio-p2-agent-cards §8d: "Visual-rendering smoke after NODE_TYPES / toRFNode / toRFEdge changes — MEDIUM effort. Note: audit-pipeline 1.3.1 already emits pipeline_integrity: VISUAL_BLINDSPOT_KNOWN for diffs matching NODE_TYPES|EDGE_TYPES|toRFNode|toRFEdge|createPortal|z-index|position: — this skill would be the structural fix."
- §3 HCG-2 root cause: proximity-edge regression shipped despite all gates green. No Playwright assertion on rendered .react-flow__edge DOM element. The link-sound assertion became decoupled from edge rendering when node types changed.
- §4 recommendation 2: "Auditor checklist gains a NODE_TYPES_VISUAL_CHECK rule: any diff that touches NODE_TYPES, toRFNode, or toRFEdge requires a Playwright assertion on rendered edge or node DOM presence."
- Integration: invoked by audit-pipeline when an FE diff matches NODE_TYPES|EDGE_TYPES|toRFNode|toRFEdge|createPortal|z-index|position:

Required frontmatter fields:
  name: react-flow-render-smoke
  description: (single-line, ≤1024 chars, third-person, front-loaded, no angle-brackets)
  version: 1.0.0
  when_to_use: (trigger phrases)

Required body sections:
  ## Why This Exists
    Explain the HCG-2 regression: FE-002 registered CardNode in NODE_TYPES and
    branched toRFNode for the orchestrator — both changes passed SA + QA (headless
    Playwright) + SX. No spec asserted that .react-flow__edge was present in the DOM
    after a proximity snap. The link-sound assertion was the proxy for "edge created",
    and that proxy decoupled from reality once the node-type registration moved.
    Headless Playwright cannot detect that no edge renders while addEdge continues
    to fire. This skill runs headed Playwright to assert DOM presence of the
    affected visuals, closing the audit blindspot that audit-pipeline 1.3.1 flags
    as VISUAL_BLINDSPOT_KNOWN.

  ## When To Use
    Trigger: automatically by audit-pipeline when an FE diff matches any of:
      NODE_TYPES, EDGE_TYPES, toRFNode, toRFEdge, createPortal, z-index, position:
    Also trigger phrases: "react flow render smoke", "visual smoke test", "check edge
    renders", "verify node renders", "NODE_TYPES smoke", "visual blindspot check".
    Skip: when the diff touches none of the trigger tokens (pure logic / non-render change).

  ## Procedure
    Step 1: Parse the diff for trigger tokens.
      git diff HEAD -- '*.tsx' '*.ts' | grep -E 'NODE_TYPES|EDGE_TYPES|toRFNode|toRFEdge|createPortal|z-index|position:'
      If no matches: emit react_flow_smoke_skip: "no render-impacting tokens in diff".

    Step 2: Identify the affected surface.
      From the matched lines, determine:
        (a) Are node types affected? (NODE_TYPES, toRFNode) → smoke node DOM presence
        (b) Are edge types affected? (EDGE_TYPES, toRFEdge) → smoke edge DOM presence
        (c) Are z-index / portal / position tokens affected? → smoke layer ordering

    Step 3: Confirm dev server is running.
      curl -sf http://localhost:3001/health || halt with "dev server not running —
      invoke env-preflight first".

    Step 4: Run headed Playwright assertions.
      For (a) node types: assert presence of .react-flow__node elements for each
        node type that was touched or registered. Minimum: at least one node of the
        affected type must be visible in the DOM after loading a fixture loadout.
      For (b) edge types: load a fixture loadout that exercises the affected edge
        relationship (e.g., perform a proximity snap or load a pre-saved loadout with
        edges); assert .react-flow__edge is present in the DOM and its count >= 1.
      For (c) z-index/portal: assert the affected element is not hidden behind another
        layer (use offsetParent !== null or bounding-box checks).

    Step 5: Emit result.
      react_flow_smoke_pass: list of DOM assertions that passed (element: {selector},
        count: {N}, visible: true).
      react_flow_smoke_fail: list of failing assertions with selector, expected, actual.
        On fail, audit-pipeline SA gate is FAIL — the implementing agent must add a
        DOM assertion to the relevant spec and verify the element renders.

  ## Playwright Integration Notes
    - Launch with headed=true (npx playwright test --headed) or use
      page.setViewportSize + a visible browser context.
    - The dev server must be running on http://localhost:3001 before this skill runs.
    - For proximity-edge checks: use the drag-to-snap interaction sequence documented
      in materia-canvas.spec.ts. Do not substitute a store-state assertion — store
      mutation does not confirm render.
    - Assertion selector for edges: '.react-flow__edge' (not a data-testid).
    - Assertion selector for nodes: '.react-flow__node[data-id="{id}"]'.

  ## Output Format
    react_flow_smoke_result:
      trigger_tokens_found: [{list of matched tokens}]
      assertions_run: {N}
      assertions_passed: {N}
      assertions_failed: {N}
      findings: [{list of react_flow_smoke_pass or react_flow_smoke_fail entries}]
      verdict: {PASS | FAIL}

---

After creating all 4 files, append a changelog block to:
  /home/jhber/projects/gander/docs/agent-changelog.md

The block must use session ID format: `## gander-meta-p1-new-skills` and list all 4 new files.
Format exactly:

## gander-meta-p1-new-skills
**Date:** 2026-04-28
**Post-mortems acted on:** gander-studio-p4-proximity-edge-hardening.md (§8d), gander-studio-p2-agent-cards.md (§8d)

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/skills/env-preflight/SKILL.md` | (new) | 1.0.0 | New skill: pre-flight env validation — curl health + agent.list + skill.list non-empty before FE wave dispatch; halts on failure |
| `.claude/skills/silent-substitution-detect/SKILL.md` | (new) | 1.0.0 | New skill: grep-based Tier-1 audit sub-check detecting fallback patterns, empty catches, test.skip, and || defaults masking failure in test/source diffs |
| `.claude/skills/pm-preflight/SKILL.md` | (new) | 1.0.0 | New skill: extracts recurring protocol-gap patterns from 3 most recent post-mortems and produces a pm_preflight_checklist for PM's orchestrator_brief |
| `.claude/skills/react-flow-render-smoke/SKILL.md` | (new) | 1.0.0 | New skill: headed Playwright DOM-presence assertions for node/edge renders triggered by NODE_TYPES/toRFNode/toRFEdge/createPortal diff tokens |

The final byte of docs/agent-changelog.md after append must be `|\n`.
      </description>
      <success_criteria>
SC1: /home/jhber/projects/gander/.claude/skills/env-preflight/SKILL.md exists and contains valid YAML frontmatter (name, description, version: 1.0.0, when_to_use). Verify: python3 -c "import yaml; yaml.safe_load(open('/home/jhber/projects/gander/.claude/skills/env-preflight/SKILL.md').read().split('---')[1])" exits 0.

SC2: /home/jhber/projects/gander/.claude/skills/silent-substitution-detect/SKILL.md exists with valid frontmatter and version: 1.0.0.

SC3: /home/jhber/projects/gander/.claude/skills/pm-preflight/SKILL.md exists with valid frontmatter and version: 1.0.0.

SC4: /home/jhber/projects/gander/.claude/skills/react-flow-render-smoke/SKILL.md exists with valid frontmatter and version: 1.0.0.

SC5: All 4 description: fields are single-line YAML scalars with no angle-bracket characters.
  Verify (BLOCKER-003 fix — literal character class):
    for f in env-preflight silent-substitution-detect pm-preflight react-flow-render-smoke; do
      awk '/^description:/{print; exit}' /home/jhber/projects/gander/.claude/skills/$f/SKILL.md | grep -c '[<>]'
    done
  Each must return 0. (The character class [&lt;&gt;] in the prior plan was HTML-encoded and could not match literal angle-bracket bytes. This recipe uses the literal [<>] class.)

SC6: All 4 description: fields are under 1,024 characters.
  Verify: for f in env-preflight silent-substitution-detect pm-preflight react-flow-render-smoke; do awk '/^description:/{print; exit}' /home/jhber/projects/gander/.claude/skills/$f/SKILL.md | wc -c; done — each must be ≤ 1024.

SC7: docs/agent-changelog.md contains the string "gander-meta-p1-new-skills" and all 4 new skill paths. Verify: grep -c "env-preflight/SKILL.md" /home/jhber/projects/gander/docs/agent-changelog.md returns 1.

SC8: No angle-bracket characters in any of the 4 description: frontmatter fields.
  Verify (BLOCKER-003 fix — explicit recipe with literal character class):
    for f in env-preflight silent-substitution-detect pm-preflight react-flow-render-smoke; do
      awk '/^description:/{print; exit}' /home/jhber/projects/gander/.claude/skills/$f/SKILL.md | grep -c '[<>]'
    done
  Each must return 0.

SC9: Each new SKILL.md body contains the sections "## Why This Exists", "## When To Use", "## Procedure" (or "## Shell Recipe" / "## Output Format" equivalent). Verify:
  for f in env-preflight silent-substitution-detect pm-preflight react-flow-render-smoke; do
    grep -c "## Why This Exists" /home/jhber/projects/gander/.claude/skills/$f/SKILL.md
    grep -c "## When To Use" /home/jhber/projects/gander/.claude/skills/$f/SKILL.md
  done
  Each must return ≥1.

SC10: silent-substitution-detect SKILL.md body contains an architecture/placement rationale section (either "## Architecture Note" or a rationale paragraph within "## Why This Exists") explaining the Tier-1 choice over Stop-hook and Tier-3 alternatives.
  Verify: grep -c "Stop hook\|Tier-3\|Tier 3\|Stop-hook" /home/jhber/projects/gander/.claude/skills/silent-substitution-detect/SKILL.md returns ≥1.

SC11: All 4 description: fields do not use block scalar form.
  Verify: for f in env-preflight silent-substitution-detect pm-preflight react-flow-render-smoke; do
    awk '/^description:/{print; exit}' /home/jhber/projects/gander/.claude/skills/$f/SKILL.md | grep -cE '^description:[[:space:]]*[|>]'
  done — each must return 0.
      </success_criteria>
      <context_files>
        /home/jhber/projects/gander/docs/agent-improvements/hone-2026-04-27-5.md
        /home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md
        /home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p2-agent-cards.md
        /home/jhber/projects/gander/.claude/skills/hone/SKILL.md
        /home/jhber/projects/gander/docs/agent-changelog.md
      </context_files>
      <dependencies>NONE (Wave 0)</dependencies>
      <out_of_scope>
        - Do NOT modify any existing SKILL.md files (assign-agents, audit-pipeline, dispatch-task). Those are HR-002's scope.
        - Do NOT create archive copies of existing skills. That is HR-002's scope.
        - Do NOT modify any agent .md files (hr.md, auditor.md, etc.).
        - Do NOT modify application source code.
        - Do NOT version-bump any existing skill.
        - Do NOT use angle-bracket form in any frontmatter description: value. Use curly-brace {placeholder} form for metavariables in YAML fields. Angle-bracket XML references are acceptable in skill body prose and fenced code blocks but never inside YAML frontmatter values.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>files_created: list of 4 new SKILL.md paths</item>
          <item>changelog_appended: confirmed with session ID gander-meta-p1-new-skills</item>
          <item>frontmatter_valid: confirmation that all 4 files pass yaml.safe_load</item>
          <item>descriptions_verbatim: the actual text of all 4 description: field values (so auditor can review inline without re-reading 4 files)</item>
          <item>sc10_architecture_note: confirm silent-substitution-detect body contains Tier-1 placement rationale</item>
        </must_contain>
        <must_not_contain>
          <item>edits to existing SKILL.md files</item>
          <item>angle-bracket characters in any description: frontmatter value</item>
          <item>block scalar (| or >) in any description: frontmatter value</item>
        </must_not_contain>
        <success_signal>All 4 skill files exist on disk, frontmatter parses cleanly, descriptions pass literal [&lt;&gt;] character check (grep -c '[&lt;&gt;]' returns 0 for each), changelog updated, silent-substitution-detect body contains Tier-1 rationale.</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>gander-meta-p1-hone-skill-rollout-HR-002</task_id>
      <assigned_to>HR (system-health-monitor)</assigned_to>
      <priority>HIGH</priority>
      <description>
Update 3 existing SKILL.md files to integrate the 4 new skills. Follow hone Step 5
(archive, edit, version bump) for each file. Execute in this order:
  1. env-preflight integration into assign-agents (no other skill depends on this ordering)
  2. silent-substitution-detect + react-flow-render-smoke integration into audit-pipeline
  3. pm-preflight integration into dispatch-task

---

CHANGE 1: assign-agents SKILL.md
File: /home/jhber/projects/gander/.claude/skills/assign-agents/SKILL.md

Current version: 1.3.0 (stored as HTML comment in the body, not in frontmatter)

Archive step (hone Step 5b):
  mkdir -p /home/jhber/projects/gander/docs/agent-versions/skills/assign-agents
  cp /home/jhber/projects/gander/.claude/skills/assign-agents/SKILL.md \
     /home/jhber/projects/gander/docs/agent-versions/skills/assign-agents/v1.3.0-2026-04-28.md
  cmp {source} {archive}  -- must show no difference before editing

Version bump: 1.3.0 → 1.4.0 (MINOR — new gate added).

Edits required (three logical changes, three Edit calls):

Edit 1a — Add a `version: 1.4.0` field to the YAML frontmatter block.
The frontmatter currently has: name, description, when_to_use (no version field).
Insert `version: 1.4.0` as the last line before the closing `---`.

Edit 1b — Add a new Step 1.6 section after the existing Step 1.5 "Catalog Re-Glob Check" section.
The existing Step 1.5 ends with the post-mortem root cause note. After that note's closing
paragraph, insert a blank line and then the following section verbatim:

---
## Step 1.6: Env Preflight (FE-with-Live-API Sprints)

For any sprint whose `<expectation_manifest>` includes at least one FE task whose success
criteria reference Playwright tests against a live dev server — identifiable by the presence
of `agent.list`, `skill.list`, or any tRPC endpoint in the task's `<receipt_check>` items —
invoke the `env-preflight` skill before dispatching the FE wave.

The `env-preflight` skill runs three checks in sequence:
1. `curl {server}/health` — HTTP 200 required
2. `curl {server}/trpc/agent.list` — non-empty result array required
3. `curl {server}/trpc/skill.list` — non-empty result array required

**If env_preflight_fail is returned:** halt FE wave dispatch. Surface the failure to ORC with
the specific check that failed and the remediation hint. Do not spawn FE agents against a
broken environment — the silent-skip anti-pattern (where tests "pass" because the env
returns empty arrays) is what this step prevents.

**If env_preflight_pass is returned:** proceed to Step 2. Log the agent and skill counts from
the pass message to the event log as a note on the existing SPAWN event for the first FE agent.

**Skip condition:** no FE tasks in the sprint, or all FE tasks are purely static (no live API
calls in success criteria). If in doubt, run — env-preflight is fast and read-only.

Full procedure: `.claude/skills/env-preflight/SKILL.md`.

---

Edit 1c — Remove the HTML comment `<!-- version: 1.3.0 -->` from the body (it has been
migrated to the frontmatter as version: 1.4.0 in Edit 1a).

---

CHANGE 2: audit-pipeline SKILL.md
File: /home/jhber/projects/gander/.claude/skills/audit-pipeline/SKILL.md

Current version: 1.3.1 (in frontmatter)

Archive step (hone Step 5b):
  mkdir -p /home/jhber/projects/gander/docs/agent-versions/skills/audit-pipeline
  cp /home/jhber/projects/gander/.claude/skills/audit-pipeline/SKILL.md \
     /home/jhber/projects/gander/docs/agent-versions/skills/audit-pipeline/v1.3.1-2026-04-28.md
  cmp {source} {archive}

Version bump: 1.3.1 → 1.4.0 (MINOR — two new gates).

Edits required (two logical changes, two Edit calls):

Edit 2a — Add silent-substitution-detect as a Tier-1 sub-check.
In the existing Step 2 "Procedure" section, after the bullet point that says:
  "2. The auditor runs three checks in sequence: Standards → QA → Security..."
and before the "Known blindspot" paragraph, add the following sub-check as a new
numbered step 2.1:

---
**2.1 Silent-Substitution Sub-Check (Tier 1 — SA gate).** For any FE diff,
before proceeding to the main SA → QA → SX sequence, invoke the
`silent-substitution-detect` skill on the diff. The skill greps newly-added or
modified `.spec.ts`, `.test.ts`, `.ts`, and `.tsx` files for fallback patterns that
mask failure: `||` defaults, empty `catch` blocks returning a value, `test.skip`,
early-return-on-absent, and `??` defaults in assertion contexts.

If `silent_substitution_finding` entries are returned with severity BLOCKER
(test.skip, empty-catch-returns-value), the SA gate is FAIL before the standards
check runs — return the finding directly as a `<remediation_request>` to the
implementing agent. WARNING-severity findings are included in the SA report but do
not block if the auditor determines the fallback is intentional and documented.

If `silent_substitution_clear` is returned, proceed to the SA → QA → SX sequence
normally.

Skip this sub-check for non-FE diffs (BE, DS, HR, meta-agent work).

Full procedure: `.claude/skills/silent-substitution-detect/SKILL.md`.

---

Edit 2b — Replace the "pending sprint scoping" advisory in the VISUAL_BLINDSPOT_KNOWN paragraph.
The current text to replace is:
  "Tier 3 visual smoke is the structural fix; pending sprint scoping."
Replace with:
  "Tier 3 visual smoke is the structural fix; invoke `react-flow-render-smoke` for any FE
  diff that matches these tokens. Full procedure: `.claude/skills/react-flow-render-smoke/SKILL.md`."

---

CHANGE 3: dispatch-task SKILL.md
File: /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md

Current version: 1.7.0 (in frontmatter)

Archive step (hone Step 5b):
  mkdir -p /home/jhber/projects/gander/docs/agent-versions/skills/dispatch-task
  cp /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md \
     /home/jhber/projects/gander/docs/agent-versions/skills/dispatch-task/v1.7.0-2026-04-28.md
  cmp {source} {archive}

Version bump: 1.7.0 → 1.8.0 (MINOR — new step inserted).

Edits required (4 logical changes, 4 Edit calls). EXECUTE IN THIS ORDER — order matters because
Edit 3a-pre and Edit 3a both modify heading numbers and must complete before Edit 3b inserts:

Edit 3a-pre — Rename the EXISTING "## Step 0.8: Name Confirmation (Naming-Novel Sprints)"
to "## Step 0.9: Name Confirmation (Naming-Novel Sprints)".
This heading is at line 194 of the pre-edit file (verified).
Change only the step number in the heading; no other content in the Name Confirmation section
changes. The Name Confirmation body contains no self-reference to "Step 0.8" — no body text
update is needed.
Old: `## Step 0.8: Name Confirmation (Naming-Novel Sprints)`
New: `## Step 0.9: Name Confirmation (Naming-Novel Sprints)`

Edit 3a — Rename "## Step 0.7: Scry (Optional)" to "## Step 0.8: Scry (Optional)".
This heading is at line 164 of the pre-edit file (verified).
Change only the step number in the heading; no other content in the Scry section changes.
The Scry body (lines 166-192) contains no self-reference to "Step 0.7" — no body text update
is needed.
Old: `## Step 0.7: Scry (Optional)`
New: `## Step 0.8: Scry (Optional)`

Edit 3b — Insert a new "## Step 0.7: PM Preflight (Automatic)" section after Step 0.6 and
before the now-renumbered Step 0.8 Scry heading.

EXACT INSERTION ANCHOR (verbatim from line 162 of the pre-edit file):
  After the paragraph that reads:
    "(Post-mortem root cause: `gander-p4-dashboard-language` §6 Gap 2 — third recurrence of PM citing agent constraints that contradict the live spec. Critic remediation rounds for this class of error are now structurally avoidable.)"
  And before the line:
    "## Step 0.8: Scry (Optional)"   ← (this heading is already renamed by Edit 3a above)

Insert one blank line, then the following section verbatim (use literal angle-bracket characters
in the body prose for XML block references — do NOT use HTML entities in the file content):

---
## Step 0.7: PM Preflight (Automatic)

**Required before every PM decomposition.** The `pm-preflight` skill reads the 3 most
recent post-mortems across the active project's `docs/post-mortems/` directories,
extracts recurring protocol-gap pattern tokens (OVERSCOPED, SCOPE_DRIFT, AUDIT_RISK,
VERBATIM_DELIVERABLE, ASSUMPTION, DRY), and produces a `<pm_preflight_checklist>` the PM
consumes verbatim.

**How to invoke:** after Step 0.6 (PM Context Preflight extraction is complete), invoke
the `pm-preflight` skill. Pass the resulting `pm_preflight_checklist` verbatim into the
PM's `<orchestrator_brief>` under a `## PM Preflight Checklist` heading. The PM must
explicitly acknowledge each checklist item in its `<routing_notes>` before returning
`task_decomposition`.

**Why automatic:** two consecutive sprints (canvas-link, gander-studio-p2-agent-cards)
surfaced the same overscoping pattern in PM despite post-mortem documentation. The pattern
recurs because PM does not read prior post-mortems at decomposition time — it applies
training defaults. pm-preflight eliminates the "PM should have known" failure class by
placing the extracted evidence in front of PM before it writes a single task packet.

**Skip rule:** only for data-terminal sprints (RA or ST is the executor; no PM decomposition
follows) or single-agent remediation loops after audit FAIL.

Full procedure: `.claude/skills/pm-preflight/SKILL.md`.

---

Edit 3d — Version bump in frontmatter.
Change `version: 1.7.0` to `version: 1.8.0` in the dispatch-task SKILL.md frontmatter.

---

After all 3 existing skill edits are complete and versions bumped, append a second
changelog block to /home/jhber/projects/gander/docs/agent-changelog.md:

## hone-2026-04-27-5-integration
**Date:** 2026-04-28
**Post-mortems acted on:** gander-studio-p4-proximity-edge-hardening.md (§8d), gander-studio-p2-agent-cards.md (§8d)

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/skills/assign-agents/SKILL.md` | 1.3.0 | 1.4.0 | Added Step 1.6 env-preflight hook — halts FE wave dispatch if health/agent.list/skill.list checks fail; migrated version from HTML comment to frontmatter |
| `.claude/skills/audit-pipeline/SKILL.md` | 1.3.1 | 1.4.0 | Added Step 2.1 silent-substitution-detect Tier-1 sub-check for FE diffs; replaced VISUAL_BLINDSPOT_KNOWN "pending" advisory with active react-flow-render-smoke invocation |
| `.claude/skills/dispatch-task/SKILL.md` | 1.7.0 | 1.8.0 | Added Step 0.7 pm-preflight (automatic before every PM decomposition); renumbered prior Step 0.7 Scry to Step 0.8; renumbered prior Step 0.8 Name Confirmation to Step 0.9 |

Append this block after the HR-001 changelog block (which ends with the 4-new-skills table).
The final byte of docs/agent-changelog.md after append must be `|\n`.

SERIALIZATION NOTE: HR-001 appends the gander-meta-p1-new-skills block first. HR-002 must
re-read docs/agent-changelog.md fresh from disk before appending, to avoid clobbering
HR-001's append. Confirm HR-001's block is present before appending.
      </description>
      <success_criteria>
SC1: Archive copies exist and pass cmp byte-for-byte:
  /home/jhber/projects/gander/docs/agent-versions/skills/assign-agents/v1.3.0-2026-04-28.md
  /home/jhber/projects/gander/docs/agent-versions/skills/audit-pipeline/v1.3.1-2026-04-28.md
  /home/jhber/projects/gander/docs/agent-versions/skills/dispatch-task/v1.7.0-2026-04-28.md
  Verify: for each, cmp {source_before_edit} {archive} exits 0.

SC2: assign-agents frontmatter contains `version: 1.4.0` (not in comment).
  Verify: awk '/^---$/{n++; if(n==2)exit} /version:/{print}' /home/jhber/projects/gander/.claude/skills/assign-agents/SKILL.md | grep "1.4.0"

SC3: assign-agents body contains "## Step 1.6" and references "env-preflight".
  Verify: grep -c "Step 1.6" /home/jhber/projects/gander/.claude/skills/assign-agents/SKILL.md returns ≥1.
  Verify: grep -c "env-preflight" /home/jhber/projects/gander/.claude/skills/assign-agents/SKILL.md returns ≥1.

SC4: assign-agents body does NOT contain the old HTML comment for version 1.3.0.
  Verify: grep -c "<!-- version: 1.3.0" /home/jhber/projects/gander/.claude/skills/assign-agents/SKILL.md returns 0.

SC5: audit-pipeline frontmatter contains `version: 1.4.0`.
  Verify: awk '/^---$/{n++; if(n==2)exit} /version:/{print}' /home/jhber/projects/gander/.claude/skills/audit-pipeline/SKILL.md | grep "1.4.0"

SC6: audit-pipeline body contains "Step 2.1" and "silent-substitution-detect".
  Verify: grep -c "2.1" /home/jhber/projects/gander/.claude/skills/audit-pipeline/SKILL.md returns ≥1.
  Verify: grep -c "silent-substitution-detect" /home/jhber/projects/gander/.claude/skills/audit-pipeline/SKILL.md returns ≥1.

SC7: audit-pipeline body contains "react-flow-render-smoke" and does NOT contain "pending sprint scoping".
  Verify: grep -c "react-flow-render-smoke" /home/jhber/projects/gander/.claude/skills/audit-pipeline/SKILL.md returns ≥1.
  Verify: grep -c "pending sprint scoping" /home/jhber/projects/gander/.claude/skills/audit-pipeline/SKILL.md returns 0.

SC8: dispatch-task frontmatter contains `version: 1.8.0`.
  Verify: grep "version:" /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md | head -1 | grep "1.8.0"

SC9 (BLOCKER-001 + BLOCKER-002 fix — replaces prior tautological SC9):
  Verify the complete renumber chain using anchored heading checks:

  # New Step 0.7 PM Preflight is present:
  grep -cE '^## Step 0.7: PM Preflight' /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md
  # Must return 1

  # Scry is now Step 0.8:
  grep -cE '^## Step 0.8: Scry' /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md
  # Must return 1

  # Name Confirmation is now Step 0.9:
  grep -cE '^## Step 0.9: Name Confirmation' /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md
  # Must return 1

  # Old Step 0.7 Scry heading is gone:
  grep -cE '^## Step 0.7: Scry' /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md
  # Must return 0

  # Old Step 0.8 Name Confirmation heading is gone:
  grep -cE '^## Step 0.8: Name Confirmation' /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md
  # Must return 0

  All 5 checks must pass for SC9 to pass.

SC10: dispatch-task body contains "pm-preflight".
  Verify: grep -c "pm-preflight" /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md returns ≥1.

SC11: docs/agent-changelog.md contains "hone-2026-04-27-5-integration" and references all 3 modified skills.
  Verify: grep -c "hone-2026-04-27-5-integration" /home/jhber/projects/gander/docs/agent-changelog.md returns 1.

SC12: docs/agent-changelog.md still contains "gander-meta-p1-new-skills" (HR-001's append not clobbered).
  Verify: grep -c "gander-meta-p1-new-skills" /home/jhber/projects/gander/docs/agent-changelog.md returns 1.

SC13: The changelog entry for dispatch-task mentions BOTH the Scry renumber (0.7 → 0.8) AND the Name Confirmation renumber (0.8 → 0.9).
  Verify: grep -A5 "dispatch-task" /home/jhber/projects/gander/docs/agent-changelog.md | grep -c "Step 0.9" returns ≥1.
      </success_criteria>
      <context_files>
        /home/jhber/projects/gander/.claude/skills/assign-agents/SKILL.md
        /home/jhber/projects/gander/.claude/skills/audit-pipeline/SKILL.md
        /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md
        /home/jhber/projects/gander/.claude/skills/hone/SKILL.md
        /home/jhber/projects/gander/docs/agent-changelog.md
        /home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md
        /home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p2-agent-cards.md
        /home/jhber/projects/gander/.claude/agents/tasks/outputs/gander-meta-p1-hone-skill-rollout-HR-001-*.md
      </context_files>
      <dependencies>gander-meta-p1-hone-skill-rollout-HR-001 (Wave 1 — the 4 new skill files must exist before this task edits the 3 existing skills to reference them)</dependencies>
      <out_of_scope>
        - Do NOT create new SKILL.md files — that is HR-001's scope.
        - Do NOT modify any agent .md files (hr.md, auditor.md, etc.).
        - Do NOT modify application source code.
        - Do NOT change any content in the existing steps of assign-agents, audit-pipeline, or dispatch-task beyond the specific insertions/replacements described above.
        - Do NOT rename or restructure any section heading in dispatch-task beyond the two specific renames (Step 0.7 Scry → Step 0.8 and Step 0.8 Name Confirmation → Step 0.9) and the new Step 0.7 insertion.
        - Do NOT modify the 4 new SKILL.md files created by HR-001.
        - Do NOT modify the Scry body text (only the heading number changes).
        - Do NOT modify the Name Confirmation body text (only the heading number changes).
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>files_modified: list of 3 modified SKILL.md paths with old/new version numbers</item>
          <item>archives_created: list of 3 archive paths under docs/agent-versions/skills/</item>
          <item>cmp_verification: confirmation that each archive matches its source pre-edit</item>
          <item>changelog_appended: confirmation that hone-2026-04-27-5-integration block was appended after the HR-001 block</item>
          <item>sc9_verification: output of all 5 anchored grep checks (counts for each heading pattern)</item>
        </must_contain>
        <must_not_contain>
          <item>edits to any of the 4 new skill files (those are HR-001's output)</item>
          <item>edits to any agent .md files</item>
          <item>the string "pending sprint scoping" in audit-pipeline SKILL.md</item>
          <item>both "## Step 0.7: Scry" AND "## Step 0.8: Scry" present simultaneously (old heading must be gone)</item>
          <item>both "## Step 0.8: Name Confirmation" AND "## Step 0.9: Name Confirmation" present simultaneously (old heading must be gone)</item>
        </must_not_contain>
        <success_signal>All 13 SCs above pass; 3 archive files exist; 3 existing SKILL.md files contain their new version numbers and integration references; dispatch-task has exactly one Step 0.7 (PM Preflight), one Step 0.8 (Scry), one Step 0.9 (Name Confirmation); changelog contains both sprint blocks in the correct order.</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    Wave 0: gander-meta-p1-hone-skill-rollout-HR-001 (create 4 new skills + changelog block 1)
    Wave 1: gander-meta-p1-hone-skill-rollout-HR-002 (update 3 existing skills + changelog block 2)
    HR-002 DEPENDS ON HR-001 (AUDIT PASS)
  </dependency_order>

  <routing_notes>
    1. Both packets are routed to HR (system-health-monitor). HR is the correct and only appropriate agent for .claude/skills/ writes.

    2. Audit note for HR-001 and HR-002: audit-pipeline 1.3.1's Step 2.5 Meta-Agent Independence Rule will flag the sprint's event log if all SPAWN/COMPLETE entries share the same parent agent_id. The auditor MUST acknowledge this in its audit output as `pipeline_integrity: META_AGENT_SPRINT_ACKNOWLEDGED` rather than downgrading to INDETERMINATE, since this is a sanctioned meta-agent sprint (all 7 tasks in the human request are .claude/skills/ writes, and the human explicitly authorized it). The auditor should verify the written content (SKILL.md files) rather than the event log independence signal.

    3. Changelog append serialization: HR-001 appends the gander-meta-p1-new-skills block. HR-002 must re-read the file before appending hone-2026-04-27-5-integration. The dependency (HR-002 depends on HR-001 AUDIT PASS) serializes these writes. No race condition is possible given the sequential dependency.

    4. The assign-agents Step 1.5 numbering: the existing Step 1.5 is "Catalog Re-Glob Check". The new env-preflight hook is Step 1.6 — it does NOT replace or renumber Step 1.5. This is a pure addition after Step 1.5.

    5. The dispatch-task renumber chain: HR-002 must execute the 4 edits in the specified order. Edit 3a-pre FIRST (rename Step 0.8 Name Confirmation → Step 0.9), Edit 3a SECOND (rename Step 0.7 Scry → Step 0.8), Edit 3b THIRD (insert new Step 0.7 PM Preflight after the anchor paragraph at line 162). Edit 3d (version bump) can be any time. Executing in any other order risks having two Step 0.8 headings simultaneously in the file during intermediate state (though each Edit is atomic, the intent is to never have a semantically ambiguous heading state persist in a committed write).

    6. DESIGN.md: absent (meta-agent sprint, no UI surfaces). No DESIGN.md check required.

    7. Description quality risk note (see risk_flags): HR must write descriptions independently. The PM has provided description-content structure in the task packet body, but HR should compose the actual description text to satisfy the quality criteria (third-person, front-loaded use case, 3–6 trigger phrases, ≤1024 chars, no angle-brackets). HR-001's completion_packet MUST include the drafted descriptions verbatim (SC item: descriptions_verbatim) so the auditor can review them inline without re-reading 4 files.

    8. Cross-file step-number references: orchestrator.md may reference "Step 0.7 Scry" or similar by number. The Critic previously flagged this as an audit risk. This sprint's HR-002 task is explicitly scoped to dispatch-task only. If orchestrator.md or other files contain "Step 0.7 Scry" references, those are out-of-scope for this sprint and should be filed as a follow-up task. The auditor should not FAIL HR-002 for stale cross-file references unless they are in the 3 files explicitly in scope (assign-agents, audit-pipeline, dispatch-task).
  </routing_notes>

  <risk_flags>
    1. DESCRIPTION QUALITY RISK: All 4 new skills have descriptions that must satisfy hone's description-quality criteria after first draft. The most likely failure mode is over-precision (descriptions that are too narrow and fail to trigger on adjacent patterns) or under-precision (too many trigger phrases producing false-positive invocations). HR-001 must include descriptions_verbatim in its completion_packet for inline auditor review.

    2. ASSIGN-AGENTS VERSION IN HTML COMMENT: The current assign-agents version (1.3.0) is in an HTML comment, not frontmatter. HR-002 Edit 1a adds the frontmatter field. HR-002 Edit 1c removes the comment. If the HTML comment removal introduces unexpected whitespace or merges with an adjacent line, the file's YAML frontmatter may still be valid but the body structure could shift. The Critic should verify that removing the comment line from the body does not corrupt surrounding content.

    3. DISPATCH-TASK RENUMBER ORDERING RISK: The 3-edit renumber chain (Edit 3a-pre, 3a, 3b) must be executed in sequence. Executing Edit 3a (Scry 0.7 → 0.8) before Edit 3a-pre (Name Confirmation 0.8 → 0.9) would temporarily produce two Step 0.8 headings. HR-002 must follow the specified order. SC9 with its 5 anchored checks will catch any final-state violation regardless of intermediate state.

    4. AUDIT META-AGENT INDEPENDENCE RULE: audit-pipeline 1.3.1 Step 2.5 will detect that this sprint ran in meta-agent mode and emit pipeline_integrity: WARNING. This is expected and correct — the auditor must acknowledge it (not downgrade to INDETERMINATE) because the sprint is human-authorized meta-agent work. Confirm the audit output contains an explicit acknowledgement line.

    5. NEW SKILL DIRECTORY CREATION: Each of the 4 new skills requires creating a new directory (/home/jhber/projects/gander/.claude/skills/{name}/). The Write tool will create the directory if it doesn't exist, but HR should verify the directories are not symlinks from another path.

    6. CROSS-FILE STEP NUMBER STALE REFERENCES: orchestrator.md or other files may reference "Step 0.7 Scry" by number after the rename. These are out-of-scope for this sprint (only dispatch-task, assign-agents, audit-pipeline are in scope for HR-002). If the auditor finds stale references outside the 3 in-scope files, those should be noted as follow-up items, not audit FAILs.

    7. EDIT 3B BODY USES LITERAL ANGLE-BRACKETS: The new Step 0.7 PM Preflight body text references XML block names like `&lt;pm_preflight_checklist&gt;`, `&lt;orchestrator_brief&gt;`, `&lt;routing_notes&gt;`. When HR-002 writes the actual file content, these must use literal `&lt;` and `&gt;` characters (not HTML entities) because they appear in the skill body prose, not in YAML frontmatter. HR-002 must not confuse the "no angle-brackets in YAML description:" rule with the body prose, which freely uses XML notation.
  </risk_flags>

</task_decomposition>

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>gander-meta-p1-hone-skill-rollout</sprint_id>
  <generated>2026-04-28T00:00:00Z</generated>
  <assignments>

    <assignment>
      <task_id>gander-meta-p1-hone-skill-rollout-HR-001</task_id>
      <agent>HR#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-meta-p1-hone-skill-rollout-HR-001-*.md</expected_file>
      <wave>0</wave>
      <blocks>gander-meta-p1-hone-skill-rollout-HR-002</blocks>
      <receipt_check>
        <item>files_created field present and lists 4 paths (env-preflight, silent-substitution-detect, pm-preflight, react-flow-render-smoke SKILL.md)</item>
        <item>changelog_appended field confirms gander-meta-p1-new-skills block written</item>
        <item>frontmatter_valid field confirms yaml.safe_load passes for all 4 files</item>
        <item>descriptions_verbatim field present with the actual text of all 4 description: values</item>
        <item>sc10_architecture_note field confirms silent-substitution-detect body contains Tier-1 rationale</item>
        <item>no files_modified entries for existing skill files (assign-agents, audit-pipeline, dispatch-task)</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-meta-p1-hone-skill-rollout-HR-002</task_id>
      <agent>HR#2</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-meta-p1-hone-skill-rollout-HR-002-*.md</expected_file>
      <wave>1</wave>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>files_modified field lists 3 paths with old/new version pairs: assign-agents 1.3.0→1.4.0, audit-pipeline 1.3.1→1.4.0, dispatch-task 1.7.0→1.8.0</item>
        <item>archives_created field lists 3 archive paths under docs/agent-versions/skills/</item>
        <item>cmp_verification confirms byte-for-byte archive match before edits</item>
        <item>changelog_appended confirms hone-2026-04-27-5-integration block written after HR-001 block</item>
        <item>sc9_verification field present with output of all 5 anchored grep checks (each showing the return count)</item>
        <item>no new skill files in files_created (those are HR-001's scope)</item>
      </receipt_check>
    </assignment>

  </assignments>
</expectation_manifest>
```
