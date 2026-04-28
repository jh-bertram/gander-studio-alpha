# PM Log — gander-studio-p4-proximity-edge-hardening (rev2)

**Agent:** PM#3
**Sprint:** gander-studio-p4-proximity-edge-hardening
**Task:** Targeted A4 oscillator-counting revision only

---

## Stage 1 — RECEIVED

Received narrow_revision_request: fix only A4's oscillator-counting strategy in FE-001. All other tasks (A1–A3, A5–A7, FE-002) copy verbatim. Authorization: human-authorized third Critic round (protocol cap is 2).

Files read:
- `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-rev-1777336319.md` — PM#2 plan
- `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-CR-rev-1777339583.md` — CR#2 critique
- `packages/client/src/constants/canvas.ts` — confirmed: APPROACH_FREQ_HZ=220, LINK_PRIMARY_FREQ_HZ=880, LINK_SECONDARY_FREQ_HZ=1320
- `packages/client/src/hooks/useLinkSound.ts` lines 75-204 — confirmed frequency set sites:
  - playApproach: `osc.frequency.setValueAtTime(APPROACH_FREQ_HZ, ...)` → 220 Hz
  - playLink primary: `primaryOsc.frequency.setValueAtTime(LINK_PRIMARY_FREQ_HZ, now)` → 880 Hz
  - playLink secondary: `secondaryOsc.frequency.setValueAtTime(LINK_SECONDARY_FREQ_HZ, now)` → 1320 Hz

---

## Stage 2 — PLAN

Approach: frequency-discriminated spy via `AudioParam.prototype.setValueAtTime` proxy.

The `osc.frequency` property is an `AudioParam`. All three oscillators call `osc.frequency.setValueAtTime(value, time)`. Patching `AudioParam.prototype.setValueAtTime` globally intercepts all three calls. Filtering by value (880 or 1320) increments `__linkOscCount` only for `playLink` oscillators, ignoring the 220 Hz approach tone.

Constant injection strategy: import constant values from canvas.ts at the top of the spec file, then inject into the `addInitScript` via string interpolation in a template literal (since `addInitScript` receives a function that runs in browser context, not Node context, so module imports are not directly available). The test source reads the constants from canvas.ts; the browser-side script uses the resolved numeric values. This avoids duplicating magic numbers in test source while correctly scoping the browser-side script.

Changes confined to: A4 description block and A4-related success criteria in FE-001. All other content verbatim from PM#2.

---

## Stage 3 — COMPLETE

Output written to: `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-rev2-1777340068.md`
