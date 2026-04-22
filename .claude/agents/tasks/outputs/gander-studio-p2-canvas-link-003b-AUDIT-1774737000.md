# Audit Result — gander-studio-p2-canvas-link-003b

## Verdict: FAIL (SA — Standards)

Stopped at first failure per protocol. QA and SX not executed.

---

## 1. Standards Check (SA)

### canvas.ts — PASS

<audit_review>
  <target_file>packages/client/src/constants/canvas.ts</target_file>
  <status>PASS</status>
  <violations>None</violations>
</audit_review>

49 new named constant exports. All naming follows SCREAMING_SNAKE_CASE convention. OscillatorType annotations are correct. File is kebab-case. No functions or color helpers (per file header rule). Clean.

---

### useLinkSound.ts — PASS

<audit_review>
  <target_file>packages/client/src/hooks/useLinkSound.ts</target_file>
  <status>PASS</status>
  <violations>None</violations>
</audit_review>

- All Hz, gain, and ADSR values imported from canvas.ts constants — no magic numbers.
- SSR guard (`typeof window === 'undefined'`) present in all three exported functions.
- `AudioContext` created lazily in `ensureAudioContext()`, not at module load.
- `linearRampToValueAtTime` used in `stopApproach` for click-free release.
- `0.020` and `0.010` buffer offsets are Web Audio API implementation details, not design tokens — acceptable.
- `/1000` divisors are ms-to-seconds conversion — standard idiom, not magic numbers.
- File naming: kebab-case. Functions: camelCase. Exports: named functions.

---

### MateriaCanvas.tsx — FAIL

<audit_review>
  <target_file>packages/client/src/components/compose/MateriaCanvas.tsx</target_file>
  <status>FAIL</status>
  <violations>
    <issue line="48-82">
      <rule>standards.md — No hardcoded values; use named exports from constants</rule>
      <severity>CRITICAL</severity>
      <description>
        The MATERIA_CANVAS_KEYFRAMES template string contains 20+ hardcoded numeric literals
        for box-shadow parameters. canvas.ts already exports ORB_SHADOW_INSET_BLOOM_BLUR_PX (8),
        ORB_SHADOW_INSET_BLOOM_OPACITY (0.22), ORB_SHADOW_INSET_DEPTH_BLUR_PX (10), and
        ORB_SHADOW_INSET_DEPTH_OPACITY (0.55) — but these constants are NOT interpolated into
        the keyframe string. Instead, the raw values appear as literals repeated 6 times each.

        Additional unexternalized values:
        - Line 53: scale(1.06) translateY(-6px) — intermediate keyframe with no constant
        - Lines 57-60: orb-link-flash outer glow blur/spread at 15% (28px 10px), 45% (20px 6px),
          100% (14px 3px) — no constants
        - Lines 57-60: ring widths 3px, 2px — no constants
        - Lines 57-60, 65, 80: inset shadow offsets 2px 3px, -3px -4px — no constants

        The task receipt item 8 explicitly requires: "All Hz, gain, ADSR, animation timing values
        are named exports from canvas.ts — no magic numbers inline." The timing values (durations
        like ORB_ATTRACT_DURATION_MS) are correctly imported. The box-shadow numeric parameters
        are not.
      </description>
      <remediation>
        1. Add new named exports to canvas.ts for every hardcoded value in the keyframe string:
           - ORB_ATTRACT_SCALE_MID (1.06), ORB_ATTRACT_TRANSLATE_MID_PX (6)
           - ORB_LINK_FLASH_GLOW_15_BLUR (28), ORB_LINK_FLASH_GLOW_15_SPREAD (10)
           - ORB_LINK_FLASH_GLOW_45_BLUR (20), ORB_LINK_FLASH_GLOW_45_SPREAD (6)
           - ORB_LINK_FLASH_GLOW_100_BLUR (14), ORB_LINK_FLASH_GLOW_100_SPREAD (3)
           - ORB_LINK_FLASH_RING_15_PX (3), ORB_LINK_FLASH_RING_45_PX (2), ORB_LINK_FLASH_RING_100_PX (2)
           - ORB_SHADOW_INSET_BLOOM_X (2), ORB_SHADOW_INSET_BLOOM_Y (3)
           - ORB_SHADOW_INSET_DEPTH_X (-3), ORB_SHADOW_INSET_DEPTH_Y (-4)
        2. Interpolate existing constants ORB_SHADOW_INSET_BLOOM_BLUR_PX, ORB_SHADOW_INSET_BLOOM_OPACITY,
           ORB_SHADOW_INSET_DEPTH_BLUR_PX, ORB_SHADOW_INSET_DEPTH_OPACITY into the template string
           (they are already imported — just not used).
        3. Replace all rgba(255,255,255,${OPACITY}) and rgba(0,0,0,${OPACITY}) patterns with
           the interpolated constants.
      </remediation>
    </issue>
  </violations>
</audit_review>

---

### materia-canvas-proximity.spec.ts — NOT EVALUATED (stopped at first SA failure)

### Receipt Checklist Status

| # | Item | Status |
|---|------|--------|
| 1 | .orb-attracted on target during drag | PASS — line 484, applyOrbAttracted on nearestId (not change.id) |
| 2 | .orb-attracted removed on drag-end, release class for 400ms | PASS — lines 187-195, removeOrbAttracted with setTimeout(ORB_ATTRACT_RELEASE_MS) |
| 3 | .orb-link-flashing on both nodes at addEdge, .orb-linked after 400ms | PASS — lines 197-208, applyOrbLinkFlash with setTimeout(DURATION+BUFFER) |
| 4 | useLinkSound.ts exports playApproach, stopApproach, playLink | PASS — lines 70, 119, 148 |
| 5 | AudioContext lazy + SSR guard | PASS — ensureAudioContext at line 51; SSR guard in all 3 functions |
| 6 | playLink called at addEdge | PASS — line 434 in addEdgeWithEffects |
| 7 | stopApproach uses linearRampToValueAtTime | PASS — line 130 |
| 8 | All values named exports, no magic numbers | **FAIL** — see violation above |
| 9 | CSS in scoped style block | PASS — line 589, style tag inside MateriaCanvasInner |
| 10 | spec file exists | PASS — file exists at expected path |
| 11 | No modifications to server/shared/canvas-store/MateriaNode | INFO — server/shared diffs exist in working tree but are from prior tasks, not 003b. canvas-store.ts and MateriaNode.tsx have no diffs. PASS for 003b scope. |
| 12 | tsc --noEmit passes | PASS — npm run lint exited 0 |

---

## 2. Functional Tests (QA) — NOT EXECUTED

Stopped at SA FAIL per protocol.

## 3. Security Scan (SX) — NOT EXECUTED

Stopped at SA FAIL per protocol.

---

## Required Fix

FE#3 must externalize all hardcoded numeric values in the MATERIA_CANVAS_KEYFRAMES template string
(MateriaCanvas.tsx lines 48-82) to named constants in canvas.ts, then interpolate them. See
remediation details in the SA violation above.

After fix: re-run this audit from SA on MateriaCanvas.tsx, then proceed to QA (Tier 1 smoke + Tier 2 spec) and SX.
