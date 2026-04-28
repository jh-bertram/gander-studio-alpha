<plan_critique>
  <plan_id>gander-studio-p4-proximity-edge-hardening (rev2)</plan_id>
  <status>PASS</status>

  <challenges>
  </challenges>

  <a4_verification>
    Narrow re-verification of A4 only, per ORC instruction. Verified line-by-line against
    `packages/client/src/hooks/useLinkSound.ts` and `packages/client/src/constants/canvas.ts`.

    1. **Frequency discrimination is correct.**
       - constants/canvas.ts line 114: `APPROACH_FREQ_HZ = 220` ✓
       - constants/canvas.ts line 122: `LINK_PRIMARY_FREQ_HZ = 880` ✓
       - constants/canvas.ts line 131: `LINK_SECONDARY_FREQ_HZ = 1320` ✓
       - useLinkSound.ts line 79 (in `playApproach`): `osc.frequency.setValueAtTime(APPROACH_FREQ_HZ, ctx.currentTime)` — single call at 220 ✓
       - useLinkSound.ts line 156 (in `playLink`): `primaryOsc.frequency.setValueAtTime(LINK_PRIMARY_FREQ_HZ, now)` — 880 ✓
       - useLinkSound.ts line 182 (in `playLink`): `secondaryOsc.frequency.setValueAtTime(LINK_SECONDARY_FREQ_HZ, now)` — 1320 ✓
       - No other `setValueAtTime` calls in this file use 880 or 1320 as the value. Audited:
         · line 83: filter.frequency at 600 (APPROACH_FILTER_CUTOFF_HZ) — not 880/1320.
         · lines 86, 128, 129, 164, 190: gain.gain at 0 or current-gain-value (≤0.55) — not 880/1320.
         · `linearRampToValueAtTime` is a different method and is not intercepted by the
           `setValueAtTime` proxy, so its peak/sustain values do not pollute the count.
       - playApproach does not sweep through 880 or 1320 — it sets 220 once, then leaves the
         oscillator running. ✓

    2. **Proxy target is reachable.** `OscillatorNode.frequency` is an `AudioParam`; assigning
       to its `setValueAtTime` is a `AudioParam.prototype.setValueAtTime` call. Patching the
       prototype catches all instances. ✓ The `addInitScript` runs before any user JS and
       therefore before the lazy `new AudioContext()` in `ensureAudioContext`. ✓

    3. **Counter logic.** PM#3's recipe increments `__linkOscCount` only when `value === 880`
       or `value === 1320`. Per-call arithmetic:
       - One `playLink` call → exactly 2 increments (one at 880, one at 1320). ✓
       - One `playApproach` call → 0 increments (only sets 220). ✓
       - One `stopApproach` call → 0 increments (sets gain at current value, which is in
         [0, 0.12], never 880/1320). ✓
       - approach + link → 2. ✓
       - N approaches + 1 link → still 2 (approaches contribute 0). ✓

    4. **Assertion ordering (G6).** PM#3 places the DOM edge assertion (`expect(edgeCount).toBe(1)`)
       BEFORE the audio assertion (`expect(linkOscCount).toBe(2)`). Source: lines 280-287 of
       PM#3 output. SC#4 explicitly enforces the ordering. ✓

    5. **Constants imported, not hardcoded.** PM#3 imports `LINK_PRIMARY_FREQ_HZ` and
       `LINK_SECONDARY_FREQ_HZ` from `../../constants/canvas` and passes them as a serialized
       arg `{ primaryHz, secondaryHz }` into `addInitScript`. The browser-side function
       references the params, not free literals. SC#4 + must_not_contain explicitly forbid
       bare 880/1320 in test source. The recipe is concrete (full code block at lines 222-289
       of PM#3 output) — FE agent does not need to re-derive. ✓

    6. **No new BLOCKERs introduced elsewhere.** Spot-checked unchanged sections in PM#3
       output against CR#2's resolution attestations:
       - A1 (lines 54-83): Agents-section h3 landmark + waitFor at all 4 sites. Matches CR#2
         "BLOCKER 1 cleanly resolved".
       - A2 (lines 84-106): exact replacement `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)`.
       - A3 (lines 108-167): Skills-section h3 landmark mirrors A1; explicit warning against
         `palette-item-skill-`.
       - A5 (lines 367-407): handle-style.ts extraction preserves the 9 properties; identity
         requirement called out.
       - A6 (lines 411-435): line-11 un-aliased removal; line-7 alias and line-12 META_FRAGMENTS
         preserved. Matches CR#2 "BLOCKER 2 cleanly resolved".
       - A7 (lines 439-465): MateriaCanvas.tsx path; explicit role arg ('specialist'/'skill').
       No regression detected.
  </a4_verification>

  <audit_risk_forecast>
    A4's frequency-discriminated spy is now both correct and tightly scoped. The audit risk
    profile is unchanged from CR#2's forecast: A5 inline literals (`width: 1`, `'50%'`,
    `'translate(-50%, -50%)'`) remain inline in handle-style.ts per the auditor's original
    advisory — a future SA pass could flag these against agent-changelog 2026-03-30-1, but
    PM has explicitly deferred per A4 routing notes. No new audit landmines introduced by
    PM#3's narrow revision. Recommend ORC proceed to assign-agents for FE-001 + FE-002.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    - docs/post-mortems/gander-studio-p2-agent-cards.md §6 G6 (sound-as-proxy): satisfied —
      DOM edge assertion runs first; audio is secondary corroboration.
    - CR#2 critique (rev1): A4 oscillator-arithmetic blocker — confirmed resolved by switching
      from raw oscillator count to frequency-discriminated AudioParam.setValueAtTime spy.
    - .claude/rules/standards.md DRY: constants imported from canvas.ts, no magic numbers in
      test source. Compliant.
    - Source verification: useLinkSound.ts lines 79/156/182 + canvas.ts lines 114/122/131
      confirm the recipe arithmetic.
  </post_mortem_patterns_checked>

  <round_3_disposition>
    Round 3 of the Critic loop, human-authorized (cap is 2). Verdict: CRITIQUE_PASS scoped
    narrowly to A4. The A4 fix is correct, concretely specified, and source-verified.
    Unchanged sections (A1, A2, A3, A5, A6, A7, FE-002) carry forward without regression.
    The gate is closed — ORC may dispatch FE-001 and FE-002 in parallel.
  </round_3_disposition>
</plan_critique>
