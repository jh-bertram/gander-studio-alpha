<plan_critique>
  <plan_id>gander-studio-p4-proximity-edge-hardening</plan_id>
  <status>BLOCK</status>

  <challenges>
    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-studio-p4-proximity-edge-hardening-FE-001</task_ref>
      <description>
A1 will break the two pre-existing proximity tests because the selector they
both use to look up the agent item is wrong, and PM's plan instructs the
implementer to keep that selector while merely upgrading the silent-skip into
a hard `waitFor`.

Concrete evidence:
  - `materia-canvas.spec.ts:99`  → `palette.locator('[data-testid^="palette-item-agent-"]').first()`
  - `materia-canvas.spec.ts:154` → `palette.locator('[data-testid^="palette-item-agent-"]').first()`
  - `MateriaCanvas.tsx:621`      → `data-testid={`palette-item-${item.name}`}` (NOT type-prefixed)

Palette items are `palette-item-{name}` for both agents AND skills (no
`agent-` / `skill-` infix). The two existing tests pass today only because
the selector matches zero elements and the silent-skip fallback at lines
100-103 / 155-159 (or the early-return at 119-125 / 172-176) absorbs the
miss. Audit advisory A1 was written precisely because that masking is
fragile.

PM correctly identified this exact pitfall for A3 ("CRITICAL: skill palette
items use data-testid='palette-item-{skill-name}' — do not use
[data-testid^='palette-item-skill-']") but did not propagate the correction
to A1's pre-existing sites. As written, A1 swaps `if (!isVisible) return`
for `await agentItem.waitFor({ state: 'visible', timeout: 5000 })` against
a selector that matches zero elements → both tests will TIMEOUT and FAIL.

This violates SC#7 ("npx playwright test exits 0 — all existing 7 tests
pass") deterministically.
      </description>
      <required_revision>
Add an explicit selector-correction step to A1 covering BOTH existing sites
(lines ~99 and ~154). Replace the type-prefixed selector with the same
Agents-section-landmark pattern PM defined for A3:

  const agentItem = palette
    .locator('h3').filter({ hasText: /^Agents$/i })
    .locator('..')
    .locator('[data-testid^="palette-item-"]')
    .first();
  await agentItem.waitFor({ state: 'visible', timeout: 5000 });

State this in A1's task description and add a 9th success criterion: "grep
-c 'palette-item-agent-' packages/client/src/tests/compose/materia-canvas.spec.ts → 0".
The Skills-section landmark in A3 should mirror the same shape for parity.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-studio-p4-proximity-edge-hardening-FE-002</task_ref>
      <description>
A6 line numbers are off by one for the import-cleanup step.

Verified against `packages/client/src/constants/compose.ts`:
  - Line 7  : `META_AGENTS as COMMAND_AGENTS,`
  - Line 11 : `META_AGENTS,`           ← the un-aliased import to remove
  - Line 12 : `META_FRAGMENTS,`         ← the import to PRESERVE

PM's brief says: "remove META_AGENTS from the named import on line 12 (be
careful not to remove META_FRAGMENTS — a different export)." Line 12 is
META_FRAGMENTS. An implementer who mechanically follows the line number
will delete the wrong import and break the META_FRAGMENTS fallback at
line 82 (`META_FRAGMENTS.some(...)`).

The warning text ("be careful not to remove META_FRAGMENTS") happens to
describe the *correct* outcome, but the line pointer points at exactly
that line — internally inconsistent.
      </description>
      <required_revision>
Correct the line reference in A6: "remove META_AGENTS from the named
import on line 11 (the bare un-aliased entry; do NOT touch line 12
META_FRAGMENTS)." Also add a success criterion: "grep -c '^  META_AGENTS,$'
packages/client/src/constants/compose.ts → 0 AND grep -c
'^  META_FRAGMENTS,$' = 1".
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p4-proximity-edge-hardening-FE-001</task_ref>
      <description>
A4's audio assertion (`__oscCreateCount >= 2`) does not uniquely attribute
oscillator creation to `playLink`. Reading `useLinkSound.ts`:
  - `playApproach` creates 1 oscillator on first call (line 77), only when
    `approachOsc === null` (line 75).
  - `stopApproach` nulls the ref (lines 136-138) so the next `playApproach`
    creates a fresh oscillator.
  - `handleCanvasMouseDown` in MateriaCanvas.tsx (line 851-859) calls
    `playApproach()` then `stopApproach()` on every canvas mousedown.
  - During proximity drag, the `handleNodesChange` proximity branch calls
    `playApproach()` again (line 804) on first entry into proximity radius.
  - `playLink` creates 2 oscillators (primaryOsc line 154, secondaryOsc
    line 180) when an edge is committed.

A drag that triggers approach + stop + approach + link will create
1 + 1 + 2 = 4 oscillators. A drag that only triggers approach (proximity
without commit) creates ≥ 2 oscillators *without `playLink` ever firing* —
exactly the post-mortem G6 decoupling failure mode.

The plan does pair with a DOM-edge assertion (G6 surface compliance) and
the DOM assertion runs first, so this is not a blocker. But the audio spy
adds no actual signal beyond the DOM assertion, and a future regression in
which the edge renders but `playLink` is never called would silently pass.
      </description>
      <required_revision>
Either:
(a) Strengthen the spy: instrument `playLink` directly via
    `window.__playLinkCount` (proxy a call counter onto a module-level
    function) so the assertion is `>= 1 link call`, not `>= 2 oscillators`;
    OR
(b) Reset `window.__oscCreateCount = 0` immediately AFTER the canvas
    mouse-down unlock click but BEFORE the drag, and assert
    `oscCount === 2` (exactly 2 oscillators from the single playLink call
    during the drag, before any subsequent approach can fire).
Add a one-line comment in the test explaining why the chosen counter
isolates the link side-effect. PM's discretion which to take, but the
current `>= 2` is a coverage gap dressed as an assertion.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p4-proximity-edge-hardening-FE-001</task_ref>
      <description>
A4's `addInitScript` strategy will install the proxy on
`AudioContext.prototype.createOscillator`, but the `audioCtx` singleton in
`useLinkSound.ts` is constructed via `new AudioContext()` (line 54). The
prototype proxy will catch this — confirmed safe.

However, the spy must run BEFORE the very first `new AudioContext()`, which
happens inside `ensureAudioContext()` on the FIRST call to either
`playApproach` or `playLink`. The first such call is in `handleCanvasMouseDown`
(MateriaCanvas.tsx line 857), which fires on user gesture, well after page
load. So `addInitScript` before navigation is sufficient — the spy is
registered on the prototype before any AudioContext is instantiated.

This is correct as planned. Flagging only because the brief does not state
the constraint explicitly, and an implementer who misreads "before
gotoCompose" as "before any user interaction" might place the script in the
wrong hook. Recommend explicit prose: "page.addInitScript runs before any
JS in the page, so the prototype proxy is registered before
ensureAudioContext() ever runs new AudioContext()."
      </description>
      <required_revision>
Add a one-sentence rationale to A4's description: "addInitScript injects the
proxy into the page's main world before any user JS runs, including before
the first ensureAudioContext() call inside handleCanvasMouseDown — this is
why the proxy on AudioContext.prototype.createOscillator catches all link
oscillator creations." No code change needed; clarification only.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p4-proximity-edge-hardening-FE-002</task_ref>
      <description>
A5 introduces `INVISIBLE_HANDLE_STYLE` in a new file
`packages/client/src/components/compose/handle-style.ts` exporting an
inline-numeric CSSProperties literal. The numeric values (`width: 1`,
`height: 1`, `top: '50%'`, `left: '50%'`, `transform: 'translate(-50%,
-50%)'`) are visual constants that, by standards.md DRY rule and the team's
"all CSS numeric literals in-scope" agent-changelog 2026-03-30-1, would
normally live in `packages/client/src/constants/canvas.ts` rather than
inline.

The auditor's STYLE advisory (audit doc lines 38-42) explicitly suggested
the colocation `.../components/compose/handle-style.ts`, so this is
auditor-blessed and unlikely to FAIL. But it sits in tension with the
broader "no inline numeric literals" rule applied during P2's canvas-link
sprint. A future SA pass may flag the `1`, `'50%'`, `'translate(-50%,
-50%)'` inline values.
      </description>
      <required_revision>
No required change to A5. Surface as a forecast: if the auditor flags inline
literals on the next pass, name them in `canvas.ts` (e.g.,
`HANDLE_ANCHOR_SIZE_PX = 1`, `HANDLE_ANCHOR_CENTER_PCT = '50%'`,
`HANDLE_ANCHOR_TRANSFORM = 'translate(-50%, -50%)'`) and reference them
from `handle-style.ts`. Optionally include this naming convention in A5
now to pre-empt remediation. PM's call.
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
1. The two BLOCKERs above (A1 selector and A6 line number) will produce
   playwright FAIL or build-error inside the audit gate respectively if not
   corrected pre-execution.
2. A4's audio assertion is the residual G6 risk: if a future regression
   makes `playLink` stop firing while approach sounds remain, the
   `>= 2` floor will pass without the link being exercised. Auditor may
   recommend tightening to a `=== 2` assertion bracketed by counter reset.
3. Sprint criterion compliance for A5 (`INVISIBLE_HANDLE_STYLE` byte-
   identical to current literals) is verifiable via grep — both source
   files currently have identical 9-property objects in the same key order;
   PM correctly enumerated the 9 properties in the brief.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
- `docs/post-mortems/gander-studio-p2-agent-cards.md` — §3 (HCG-2 proximity
  edge regression), §4 (QA gap), §6 G4 (NODE_TYPES/toRFNode requires
  DOM-presence Playwright), §6 G6 (sound-as-proxy-for-success). A4's
  DOM-primary / sound-secondary ordering complies with G6; the DOM
  assertion in A3 satisfies G4.
- `docs/agent-changelog.md` — confirmed FE 1.6.0 Side-Effect-As-Proxy
  rule, Critic 1.4.0 NODE_TYPES rule, Auditor 1.6.0 React Flow rendering-
  registration gate. None of these are violated by the plan.
- `.claude/rules/standards.md` — DRY rule, A11Y rule (not relevant since
  no new interactive elements), no-inline-numeric-literal posture from
  agent-changelog 2026-03-30-1. A5 sits adjacent to that posture but is
  auditor-blessed.
  </post_mortem_patterns_checked>
</plan_critique>