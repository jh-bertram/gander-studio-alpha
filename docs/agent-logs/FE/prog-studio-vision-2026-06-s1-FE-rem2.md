## [STAGE 3] COMPLETE
- **At:** 2026-06-20T00:05:00Z
- **Deliverables:**
  | File | Lines changed | Notes |
  |---|---|---|
  | `packages/client/tests/e2e/prog-studio-vision-s1-contrast-smoke.spec.ts` | ~20 net new | BASE URL fixed, parseColor extended, comment corrected |
  | `packages/client/tests/e2e/zz-probe.spec.ts` | blanked | ORC diagnostic leftover; rm sandbox-denied, blanked |
  | `packages/client/tests/e2e/zz-probe2.spec.ts` | blanked | FE-rem2 diagnostic probe; blanked |
- **Playwright result:** 6/6 passed (8.1s)
- **Lint:** exit 0
- **Constant audit:** 0 matches (no raw hex in TS files, no duplicated literals)

### Checkpoint — 00:04:00
- Wrote `prog-studio-vision-s1-contrast-smoke.spec.ts` (BASE URL + parseColor fix). Constant audit: 0 matches. Next: lint.

## [STAGE 2] PLAN
- **At:** 2026-06-20T00:01:00Z
- **Root causes identified:**
  1. `BASE = 'http://localhost:3001'` — spec targets the tRPC API server, not the Vite client (5173). All CSS is missing; body color is browser default black.
  2. Test 2 (Input): after navigating to API server, `click('text=EDIT')` finds nothing on a JSON page → timeout.
  3. Test 3 (Muted-foreground): `--wm` CSS var returns `""` on API JSON page → `toContain('0.55')` fails on empty string.
  4. Test 6 (Token integrity): `parseColor(bodyColor)` gets `rgb(0,0,0)` from default browser style on API JSON page → channels = 0, not > 0.9.
- **Fix plan:**
  - Change `BASE` from `http://localhost:3001` to `http://localhost:5173`
  - Add `parseColor` hex `#rrggbb`/`#rgb` support (defensive — `--mt`, `--sfh`, `--sf` are hex vars)
  - The spec comment says "DO NOT run against bare Vite client port 5173" — this comment is wrong (confirmed by ORC probe: all tokens resolve correctly at 5173). Update comment.
  - Delete zz-probe2.spec.ts (created during diagnosis) and zz-probe.spec.ts (ORC leftover)
- **Files modified:** `packages/client/tests/e2e/prog-studio-vision-s1-contrast-smoke.spec.ts` (BASE URL fix + parseColor hex support)
- **Files deleted:** `packages/client/tests/e2e/zz-probe.spec.ts`, `packages/client/tests/e2e/zz-probe2.spec.ts`

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** prog-studio-vision-2026-06-s1-FE-rem2
- **Message received:**
  > TEST-ONLY defect fix for prog-studio-vision-s1-contrast-smoke.spec.ts. 4 of 6 tests fail due to spec bugs (authored without running). The contrast is verified correct. Fix: proper navigation, parseColor handling hex + rgb, no weakening. Delete zz-probe.spec.ts. Lint must pass. Output path: .claude/agents/tasks/outputs/prog-studio-vision-2026-06-s1-FE-rem2-{unix_ts}.md …[truncated]
