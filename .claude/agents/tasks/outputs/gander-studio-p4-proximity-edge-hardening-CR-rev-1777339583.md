<plan_critique>
  <plan_id>gander-studio-p4-proximity-edge-hardening (rev1)</plan_id>
  <status>BLOCK</status>

  <challenges>
    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-studio-p4-proximity-edge-hardening-FE-001</task_ref>
      <description>
NEW BLOCKER (not in CR#1's critique). The A4 audio assertion `expect(oscCount).toBe(2)` will FAIL deterministically every CI run because CR#1's option (b) recipe was technically wrong — it missed the playApproach call that fires during the drag itself.

Production mechanics, verified line-by-line in MateriaCanvas.tsx:

1. unlock canvas click → `handleCanvasMouseDown` (line 851-859) calls `playApproach` then `stopApproach`. Counter: +1.
2. PM's reset: `__oscCreateCount = 0`.
3. dragNodeOntoTarget begins; `mouse.move` over 10 steps generates RF position changes. `handleNodesChange` line 773 (`change.dragging === true`) computes nearest node; on first entry into `CANVAS_PROXIMITY_THRESHOLD_PX` (line 792), the `prevAttracted !== nearestId` branch (line 793) fires `playApproach()` at line 804 → **+1 oscillator** (useLinkSound.ts line 77).
4. `mouse.up` → `change.dragging === false` (line 819) calls `stopApproach()` (line 824) — this does NOT create new oscillators (it just schedules stop on the existing one and nulls refs). Then `addEdgeWithEffects` (line 834) → `playLink()` (line 751) → **+2 oscillators** (primaryOsc line 154 + secondaryOsc line 180).
5. Final `__oscCreateCount` = 0 + 1 + 2 = **3**, not 2.

PM acknowledged this in `<risk_flags>` ("its 1 oscillator would make the count 3 (not 2)"), but framed it as a possibility ("if this occurs"). It is not conditional. The proximity-entry IS the trigger that immediately precedes the drop-and-link sequence — there is no scenario in which the test's drop-onto-card-node fires playLink without first crossing the proximity threshold and firing playApproach. The `=== 2` assertion will fail every time.

Root cause: CR#1's option (b) recipe assumed counter reset between unlock-click and drag was sufficient to isolate playLink, but did not account for `handleNodesChange`'s playApproach call (line 804) firing during the drag itself. PM faithfully implemented an incorrect recipe.
      </description>
      <required_revision>
Switch to CR#1's option (a) — instrument `playLink` directly. Concretely:

1. Drop the AudioContext.prototype.createOscillator proxy and `__oscCreateCount` entirely. Replace with a `__playLinkCount` window counter.
2. Approach: import the module, monkey-patch `playLink` via `addInitScript`, OR (simpler, no ESM-mutation needed) attach a counter inside `playLink` itself behind a test-only window flag.

Cleanest Playwright recipe (no production code change needed): use `page.addInitScript` to override the bound module reference at the call site is not possible since `playLink` is imported by name. Instead, instrument the *audible side-effect* uniquely produced by `playLink`: the secondary oscillator at `LINK_SECONDARY_FREQ_HZ` (1320 Hz). PM should:

```ts
await page.addInitScript(() => {
  (window as any).__linkOscFreqs = [];
  const origCreate = AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator = function(...args: any[]) {
    const osc = origCreate.apply(this, args as []) as OscillatorNode;
    const origSetValue = osc.frequency.setValueAtTime.bind(osc.frequency);
    osc.frequency.setValueAtTime = function(value: number, time: number) {
      (window as any).__linkOscFreqs.push(value);
      return origSetValue(value, time);
    };
    return osc;
  };
});
```

Then assert: `expect((freqs as number[]).filter(f => f === 880 || f === 1320).length).toBe(2)` — the 880 Hz primary + 1320 Hz secondary uniquely identify a single playLink call regardless of how many playApproach (440 Hz, per APPROACH_FREQ_HZ) calls preceded.

Alternatively, the simpler fix: change the assertion from `=== 2` to `>= 2` AND assert that frequencies 880 and 1320 are both present in a captured-frequencies array, which uniquely proves playLink fired exactly once. Either way, removing the brittle exact-count is required.

Update SC#4 to: "audio assertion uses a frequency-based filter that uniquely identifies playLink (880 Hz + 1320 Hz both present)" instead of "uses === 2 (exact)".
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
With the A4 oscillator-counter blocker fixed, the residual risks are unchanged from CR#1's forecast: A5 inline literals (auditor-blessed but DRY-tension) and A4's coverage gap if frequency assertion isn't tight. No new audit landmines introduced by PM#2's revisions. BLOCKERs 1 and 2 are cleanly resolved — the A1 four-site fix and the line-11 import correction are correctly stated, mirrored across description/SC/risk_flags/must_not_contain, and grep-verifiable.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
- docs/post-mortems/gander-studio-p2-agent-cards.md — §3 (HCG-2 proximity edge), §6 G6 (sound-as-proxy-for-success). The A4 test still satisfies G6 (DOM assertion remains primary, runs first), but the secondary audio assertion as written would produce a false-FAIL audit, not a false-PASS. Still a blocker because SC#6 ("npx playwright test exits 0") cannot be met.
- docs/agent-changelog.md — Frontend 1.6.0 Side-Effect-As-Proxy rule is upheld in spirit; the implementation needs the recipe fix.
- .claude/rules/standards.md — DRY, A11Y, no-inline-numeric-literals: no new violations introduced by PM#2.
- Prior CR#1 critique: BLOCKERs 1 and 2 cleanly resolved (verified against source). WARNING 2 (addInitScript rationale) and WARNING 3 (A5 deferral) cleanly resolved. WARNING 1 (oscillator counter) implemented per the recipe but the recipe was technically wrong — escalating because the fix that makes the test pass was not specified by CR#1.
  </post_mortem_patterns_checked>

  <escalation_note>
This is round 2 of 2 in the Critic cap. Per protocol, BLOCK on round 2 must escalate to human. Recommend the human:

1. Decide between option (a) frequency-based filter (most precise) vs. option (a-simpler) `>= 2` with frequency-presence assertion.
2. Authorize PM#3 to make the targeted A4 fix without reopening BLOCKERs 1, 2, or WARNINGs 2-3 (those are resolved).
3. Note that CR#1's option (b) recipe itself was the source of this blocker — PM#2 implemented faithfully. This is a Critic-spec deficit, not a PM execution failure.
  </escalation_note>
</plan_critique>
