# Requirements Coverage Report — gander-studio-p4-proximity-edge-hardening

**Generated:** 2026-04-28T02:39:10Z
**Sprint:** gander-studio-p4-proximity-edge-hardening
**Reviewer:** ORC#0 (requirements-validate skill, Step 3.5)

---

## Source brief

Original human request: bundle 5 auditor advisories from the just-shipped proximity-edge-fix sprint (commit `edf6621`) plus 2 carried-forward advisories from prior sprints into a single hardening sprint. No new features, no behavior changes — test rigor + code hygiene only.

PM brief: `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-rev2-1777340068.md`

---

## Requirement list

```xml
<requirement_list>
  <requirement id="R-001" type="explicit">A1 — Replace test.skip and isVisible-early-return silent-skip fallbacks with hard waitFor in materia-canvas.spec.ts (4 sites: lines ~99-103, ~119-125, ~155-159, ~172-176).</requirement>
  <requirement id="R-002" type="explicit">A2 — Replace `expect(postDragEdgeCount).toBeGreaterThanOrEqual(0)` (tautology) with `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)`.</requirement>
  <requirement id="R-003" type="explicit">A3 — Add agent↔skill proximity test exercising sprint-p3 success criterion (3) symmetrically.</requirement>
  <requirement id="R-004" type="explicit">A4 — Add link-sound assertion paired with DOM-edge assertion. Per post-mortem G6: DOM-primary, sound-secondary, must not be sound-as-sole-proxy.</requirement>
  <requirement id="R-005" type="explicit">A5 — Extract duplicated HANDLE_STYLE / CARD_HANDLE_STYLE CSS literals to a shared module per DRY.</requirement>
  <requirement id="R-006" type="explicit">A6 — Delete dead `META_AGENTS.has(lower)` branch in constants/compose.ts (unreachable because COMMAND_AGENTS intercepts first).</requirement>
  <requirement id="R-007" type="explicit">A7 — Pass an explicit role argument to `getMateriaColor` in `buildPaletteItemStyle` (currently 2-param call).</requirement>
  <requirement id="R-008" type="constraint">No behavior change visible to the end user. Tests must continue to pass; rendered colors must not change.</requirement>
  <requirement id="R-009" type="constraint">Lint clean across all 3 packages (`tsc --noEmit` per workspace).</requirement>
  <requirement id="R-010" type="constraint">Bundle size: main JS chunk under 1000 kB (gate from prior sprint).</requirement>
  <requirement id="R-011" type="constraint">Audit independence — Critic gate REQUIRED; no single-domain quick-route shortcut.</requirement>
  <requirement id="R-012" type="constraint">A4 must address post-mortem G6 explicitly (paired DOM + side-effect assertion, DOM ordered first).</requirement>
</requirement_list>
```

---

## Coverage

```xml
<requirements_coverage_report>
  <task_id>gander-studio-p4-proximity-edge-hardening</task_id>
  <generated>2026-04-28T02:39:10Z</generated>
  <overall_status>COVERED</overall_status>

  <coverage>
    <item id="R-001" status="COVERED">
      <requirement>A1 — Replace silent-skip fallbacks with hard waitFor.</requirement>
      <evidence>
        Verified by AUDITOR#3 (post-rem1 audit). Strict helpers `locateAgentPaletteItem` and `locateSkillPaletteItem` in `packages/client/src/tests/compose/materia-canvas.spec.ts` lines 58 and 71 use `waitFor({ state: 'visible', timeout: 5000 })` with NO fallback. Greps confirm: `palette-item-agent-` returns 0, `palette-item-skill-` returns 0, no `test.skip` or `if (!...isVisible) return` patterns remain. Originally-broken zero-match selector at lines 99/154 has been replaced. Runtime: all 9 spec tests PASS against valid GANDER_ROOT (post-env-fix).
      </evidence>
    </item>

    <item id="R-002" status="COVERED">
      <requirement>A2 — Replace tautology with `toBe(initialEdgeCount + 1)`.</requirement>
      <evidence>
        Verified by AUDITOR#1 receipt-checks (which carry forward to AUDITOR#3). The exact text `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)` is present in `materia-canvas.spec.ts`; conditional `if (postDragEdgeCount > 0)` wrapper removed; firstEdge/dataId assertions are unconditional.
      </evidence>
    </item>

    <item id="R-003" status="COVERED">
      <requirement>A3 — Add agent↔skill proximity test.</requirement>
      <evidence>
        Test "agent↔skill proximity drop renders a .react-flow__edge element" exists in the proximity describe block, uses both `locateAgentPaletteItem` (Agents h3 landmark) and `locateSkillPaletteItem` (Skills h3 landmark), asserts `edgeCount > 0`. Runtime PASS confirmed by AUDITOR#3 with corrected GANDER_ROOT (12 agents + 24 skills available). DOM-presence assertion qualifies as Tier-2 evidence per Step 2.5.
      </evidence>
    </item>

    <item id="R-004" status="COVERED">
      <requirement>A4 — Link-sound + DOM-edge paired assertion.</requirement>
      <evidence>
        Test "edge creation fires link sound and renders DOM edge element" exists. `addInitScript` patches `AudioParam.prototype.setValueAtTime` BEFORE `gotoCompose`, filtering oscillator setValueAtTime calls to `LINK_PRIMARY_FREQ_HZ` (880) and `LINK_SECONDARY_FREQ_HZ` (1320) only — `playApproach` 220 Hz oscillators are excluded. Constants imported from `../../constants/canvas` (no bare 880/1320 in test source). DOM assertion `expect(edgeCount).toBe(1)` runs FIRST; audio assertion `expect(linkOscCount).toBe(2)` runs SECOND. Runtime PASS confirmed by AUDITOR#3.
      </evidence>
    </item>

    <item id="R-005" status="COVERED">
      <requirement>A5 — Extract HANDLE_STYLE to shared module.</requirement>
      <evidence>
        New file `packages/client/src/components/compose/handle-style.ts` exports `INVISIBLE_HANDLE_STYLE: React.CSSProperties` with exactly 9 properties matching the prior literals byte-identically (verified by AUDITOR#2 against commit edf6621). Both `MateriaNode.tsx` and `CardNode.tsx` import `INVISIBLE_HANDLE_STYLE` from `./handle-style` and use it for both Handle elements; local `HANDLE_STYLE` and `CARD_HANDLE_STYLE` consts removed. Committed at `c380956`.
      </evidence>
    </item>

    <item id="R-006" status="COVERED">
      <requirement>A6 — Delete dead META_AGENTS branch.</requirement>
      <evidence>
        In `packages/client/src/constants/compose.ts`: line 79 `if (META_AGENTS.has(lower)) return 'var(--mp)';` deleted; line 11 un-aliased `META_AGENTS,` import removed; line 7 alias `META_AGENTS as COMMAND_AGENTS` and line 12 `META_FRAGMENTS,` preserved. AUDITOR#2 verified greps: `^  META_AGENTS,$` returns 0; `^  META_FRAGMENTS,$` returns 1; `META_AGENTS.has(lower)` returns 0. Comment added explaining the alias relationship. Committed at `c380956`.
      </evidence>
    </item>

    <item id="R-007" status="COVERED">
      <requirement>A7 — Pass explicit role to getMateriaColor.</requirement>
      <evidence>
        In `MateriaCanvas.tsx` `buildPaletteItemStyle`: `paletteRole` const computed as `'specialist'` for agents, `'skill'` for skills; passed as third arg to `getMateriaColor`. No duplicate `AgentRole` import. AUDITOR#2 traced both branches and confirmed rendered colors unchanged (`var(--mg)` for agents, `var(--mb)` for skills, identical before and after). Committed at `c380956`.
      </evidence>
    </item>

    <item id="R-008" status="COVERED">
      <requirement>No behavior change visible to end user. Tests continue to pass. Rendered colors unchanged.</requirement>
      <evidence>
        Static: AUDITOR#2 traced color output for A7 (unchanged) and verified handle-style byte-identity for A5. Runtime: 9/9 spec tests pass (proximity flows still work). 13 unrelated e2e failures confirmed pre-existing via baseline-stash methodology by both audit passes (zero regressions attributable to this sprint). Bundle size unchanged at 881.67 kB.
        <runtime_check>Step 4.5 (FE human verification) will provide the final eyes-on-canvas check before sprint close — flagging this for surface confirmation that proximity-link, drag-and-drop, and color rendering still feel right in the browser.</runtime_check>
      </evidence>
    </item>

    <item id="R-009" status="COVERED">
      <requirement>Lint clean across all 3 packages.</requirement>
      <evidence>
        `tsc --noEmit` exit 0 across `packages/shared`, `packages/server`, `packages/client` — confirmed by both FE-002 packet and AUDITOR#2/AUDITOR#3 re-runs.
      </evidence>
    </item>

    <item id="R-010" status="COVERED">
      <requirement>Bundle size under 1000 kB.</requirement>
      <evidence>
        `npm run build -w @gander-studio/client` reports main JS chunk at 881.67 kB (under 1000 kB SA gate). Reported by FE-002 packet, verified by AUDITOR#2.
      </evidence>
    </item>

    <item id="R-011" status="COVERED">
      <requirement>Critic gate REQUIRED — no single-domain quick-route.</requirement>
      <evidence>
        Event log seqs 9 (PM#1), 10 (CR#1 BLOCK), 12 (PM#2), 13 (CR#2 BLOCK), 15 (PM#3 narrow), 16 (CR#3 PASS). Three Critic rounds (round 3 was human-authorized override after CR#2 found a flaw in CR#1's own option-(b) recipe). Auditors AUDITOR#1 (FE-001), AUDITOR#2 (FE-002), AUDITOR#3 (FE-001 re-audit) were all separate subagent invocations from the implementing FE agents — full audit independence preserved.
      </evidence>
    </item>

    <item id="R-012" status="COVERED">
      <requirement>A4 must address post-mortem G6 — DOM-primary, sound-secondary.</requirement>
      <evidence>
        A4 test body in `materia-canvas.spec.ts`: `expect(edgeCount).toBe(1)` (DOM-primary) appears textually BEFORE `expect(linkOscCount).toBe(2)` (audio-secondary). The frequency-discriminated spy at `AudioParam.prototype.setValueAtTime` (filtering to LINK_PRIMARY_FREQ_HZ and LINK_SECONDARY_FREQ_HZ only, excluding APPROACH_FREQ_HZ at 220 Hz) eliminates the false-positive failure mode CR#2 originally caught (raw oscillator count would have been 3, not 2). Both assertions run at runtime — verified by AUDITOR#3 PASS.
      </evidence>
    </item>
  </coverage>

  <summary>
    <covered_count>12</covered_count>
    <partial_count>0</partial_count>
    <missing_count>0</missing_count>
  </summary>

  <requires_human_visual>true</requires_human_visual>
  <human_visual_scope>R-008 surface confirmation — proximity link, drag-and-drop, role-coded card colors, palette rendering. Standard FE Step 4.5 browser walkthrough.</human_visual_scope>

  <notes>
    - Sprint required 3 Critic rounds (cap is 2; round 3 was human-authorized after CR#2 identified an arithmetic bug in CR#1's own recommendation, not a PM execution failure).
    - One AUDIT FAIL on FE-001 surfaced a fallback anti-pattern in the implementer's helper that violated G6 in the running dev environment. Remediation succeeded after the env's GANDER_ROOT was corrected from `/home/jhber/projects/gander-studio-alpha` (empty) to `/home/jhber/projects/gander` (12 agents, 24 skills). The .env fix was a session-local change — the file is not git-tracked.
    - All 7 advisories addressed and committed across 2 commits: `c380956` (FE-002, source hygiene) and `f970935` (FE-001, spec hardening).
  </notes>
</requirements_coverage_report>
```

---

## Routing decision

**overall_status = COVERED.** No gap_fill_request needed. Proceed to:

1. Step 4: Archivist for both task completions.
2. Step 4.5: Human visual verification (R-008 surface check + standard FE step).
3. Step 5: Final report.
