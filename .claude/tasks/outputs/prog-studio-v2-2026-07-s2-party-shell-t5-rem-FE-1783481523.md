# FE Output — prog-studio-v2-2026-07-s2-party-shell-t5-rem (attempt 1)

## Summary

Implemented the authorized single-file remediation: route-level code-split of `PartyPage` via
`React.lazy` + `Suspense` in `packages/client/src/components/ModeContent.tsx`, with a
`ShimmerBox`-based fallback per the W2 Skeleton→shimmer-box design-spec mapping.

**Result: the fix is correctly implemented and reduces the main chunk, but does NOT bring it
under the 1000 kB gate on its own.** Main chunk went from 1,035.70 kB (AUD#5) → 1,025.44 kB
(this build) — a genuine 10.26 kB reduction matching PartyPage's own extracted chunk
(12.06 kB / gzip 4.18 kB) — but it remains **25.44 kB over the hard 1000 kB threshold**.

Root cause (verified, not guessed): the AUD's premise that the bundle was "~700 kB pre-sprint"
is stale. `GraphPage.tsx` and `ProgramDagPage.tsx` both statically import react-flow
(a large library) and remain in `PAGE_MAP`'s static imports — that pre-existing weight,
accumulated across many unrelated sprints since the Known-Issues note was last updated
(commit `ccf13a6`, 2026-06-20), is the majority of the current ~1025 kB main chunk, independent
of Party. PartyPage's own subtree was only ever ~10-12 kB.

Per Task Boundary Compliance and the explicit "ModeContent.tsx ONLY" / "do NOT convert them
(one-packet scope)" authorized-scope constraint, I did **not** expand scope to fix the
remaining gap (would require touching `vite.config.ts` for `manualChunks`, or lazy-loading
GraphPage/ProgramDagPage/ComposePage, all out of this packet's authorized file scope). I am
flagging this back to ORC for a rescope decision rather than unilaterally consolidating
additional work into this remediation.

## Files modified

- `packages/client/src/components/ModeContent.tsx` (61 → 83 lines)
  - `PartyPage` import converted from static to `React.lazy(() => import('../pages/PartyPage'))`
  - Added `Suspense` boundary around `<ActivePage />`
  - Added `ModeContentFallback` component (ShimmerBox-based, `aria-busy="true"`, `sr-only` label)
  - No other files touched. No git commit performed.

## Verification (verbatim)

### Build — `npm run build -w @gander-studio/client` (run twice, reproducible)

```
dist/registerSW.js                     0.13 kB
dist/manifest.webmanifest              0.35 kB
dist/index.html                        0.52 kB │ gzip:   0.33 kB
dist/assets/index-BINhGFJE.css        37.52 kB │ gzip:   7.86 kB
dist/assets/PartyPage-DaTFuqHp.js     12.06 kB │ gzip:   4.18 kB
dist/assets/index-ja9Pvy8U.js      1,025.44 kB │ gzip: 313.81 kB

(!) Some chunks are larger than 500 kB after minification.
```

- **Main chunk before (AUD#5):** 1,035.70 kB
- **Main chunk after (this build):** 1,025.44 kB — improvement of 10.26 kB, **still over the
  1000 kB gate by 25.44 kB**
- **New party chunk:** 12.06 kB (gzip 4.18 kB) — cleanly split, confirms PartyPage's own
  subtree was small; the gate breach is a pre-existing, unrelated bundle-weight problem.

### Lint — `npm run lint` (chains 3x `tsc --noEmit`: shared, server, client)

```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
```
Exit code: 0 (all three projects clean, no output = no errors)

### Vitest — `npm test -w @gander-studio/client`

```
 Test Files  6 passed (6)
      Tests  37 passed (37)
   Start at  21:37:20
   Duration  2.01s
```

### E2E — `npx playwright test tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts --reporter=list` (headless, packages/client, API server on :3001 already up, Vite dev server auto-started by Playwright's `webServer` config)

```
Running 19 tests using 1 worker
  ✓ 1-19 (all 19 tests) ... 19 passed (43.4s)
```

**No spec timing adjustments were needed.** Lazy chunk load resolves well within the spec's
existing 8-10s `toBeVisible` timeouts on localhost; no test required an `await`/timeout change.

## Mandatory pre-flight audits (this file only)

- Raw hex colors: 0 matches
- Inline `style="..."` / Tailwind conflicts: 0 matches (no string `style="..."` attributes;
  JSX style objects used do not duplicate any Tailwind class on the same element)
- `<span|div|li|a ... onClick=>` keyboard-equivalent audit: 0 matches (no new interactive
  elements added)
- `JSON.parse`: 0 matches
- Repeated inline function bodies: none introduced

<ui_packet>
  <components_created>NONE — modified existing packages/client/src/components/ModeContent.tsx only</components_created>
  <state_hydration_map>No change. activeMode selector from useUIStore drives PAGE_MAP lookup as before; PartyPage's own data hydration (useParty hook -> roster.getParty tRPC) is unchanged and untouched by this packet.</state_hydration_map>
  <a11y_verification>Suspense fallback (ModeContentFallback) carries aria-busy="true" and an sr-only "Loading…" label, consistent with PartyPage's own internal PartyGridSkeleton pattern. No new interactive elements were added — keyboard-equivalent audit and focus-trap preflight are N/A for this packet.</a11y_verification>
  <design_tokens_used>var(--radius) via ShimmerBox style prop (existing shared component, no new tokens introduced, no raw hex).</design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <integration_status>PENDING — the authorized single-file fix (React.lazy + Suspense for PartyPage) is correctly implemented, verified, and does reduce the main chunk by 10.26 kB (1,035.70 kB -> 1,025.44 kB), but the QA Bundle Size Gate (hard 1000 kB threshold) STILL FAILS: main chunk remains 25.44 kB over. Root cause verified: GraphPage.tsx and ProgramDagPage.tsx statically import react-flow and remain in PAGE_MAP's static imports; the project's "~700 kB" Known-Issues baseline (CLAUDE.md, commit ccf13a6, 2026-06-20) is stale relative to the app's current size — the bulk of the 1025 kB main chunk predates and is unrelated to this sprint's Party work. Per the explicit "ModeContent.tsx ONLY" / "do NOT convert them (one-packet scope)" authorized-scope constraint, I did not expand scope to lazy-load GraphPage/ProgramDagPage or touch vite.config.ts for manualChunks. Recommend ORC dispatch a new, explicitly-scoped remediation packet (either manualChunks vendor split in vite.config.ts, or lazy-loading GraphPage/ProgramDagPage/ComposePage) to close the remaining gap, or obtain a human-ratified >1MB deferral if that is preferred over further code-splitting.</integration_status>
</ui_packet>
