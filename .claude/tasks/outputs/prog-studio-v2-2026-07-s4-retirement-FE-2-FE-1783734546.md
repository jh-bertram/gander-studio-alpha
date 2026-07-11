# FE-2 Completion — prog-studio-v2-2026-07-s4-retirement (Compose surface deletion)

Task ID: `prog-studio-v2-2026-07-s4-retirement-FE-2`
Agent: FE#3
Plan of record: rev3 (`...-rev3-PM-1783715959.md`) FE-2 packet + amend3 (`...-amend3-PM-1783734397.md`, adds the reconcile orphan)

Agent log: `docs/agent-logs/FE/prog-studio-v2-2026-07-s4-retirement-FE-2.md` (+ `latest.md`)

---

<ui_packet>
  <components_created>NONE — deletion-only wave, 0 net-new components. Two 1-line-scope edits (AppMode union, ModeContent PAGE_MAP) + a scope-adjacent playwright.config.ts cleanup.</components_created>

  <files_deleted>
    <compose_source>
      - packages/client/src/pages/ComposePage.tsx (sole importer was ModeContent.tsx, edited this wave)
      - packages/client/src/store/compose-store.ts (importers: itself + ComposePage.tsx only; ExportPage.tsx's 3 "compose-store" text hits are comment-only, confirmed at L74/76/78 before deletion — matches the packet's "VERIFIED SAFE" claim exactly)
      - packages/client/src/components/compose/MateriaCanvas.tsx
      - packages/client/src/components/compose/MateriaNode.tsx
      - packages/client/src/components/compose/CardNode.tsx
      - packages/client/src/components/compose/handle-style.ts
      - packages/client/src/constants/compose.ts
      - (emptied and removed the now-empty `src/components/compose/` directory)
      All 5 component/constant files importer-scanned before deletion: every importer was either another file in this same deletion set, or one of the 2 src/tests/compose specs also deleted this wave. Surprising grep hits (GraphPage.tsx, BottomTabBar.tsx, useLinkSound.ts, materia-tint.ts) were verified line-by-line to be comment-only prose references ("same pattern as MateriaCanvas.tsx", etc.) — zero functional/compile coupling, confirmed by clean build.
    </compose_source>
    <compose_specs count="8">
      1. packages/client/tests/e2e/gander-studio-p1-compose-fe.spec.ts
      2. packages/client/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts
      3. packages/client/tests/e2e/materia-canvas-proximity.spec.ts
      4. packages/client/tests/e2e/card-node-title-edit.spec.ts
      5. packages/client/tests/e2e/loadout-list-panel.spec.ts
      6. packages/client/src/tests/compose/compose-connections-persist.spec.ts (tsc include:["src"] — load-bearing deletion)
      7. packages/client/src/tests/compose/materia-canvas.spec.ts (tsc include:["src"] — load-bearing deletion)
      8. packages/client/tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts (amend3 addition — whole-file delete; re-confirmed at execution time all 3 tests are CUT-coupled: 2x navigateToCompose()/materia-canvas assertions, 1x BrowsePage duplicate-key check with no import of any deleted module)
      (emptied and removed the now-empty `src/tests/compose/` directory)
    </compose_specs>
  </files_deleted>

  <appmode_pagemap_diff>
    - `packages/client/src/store/ui-store.ts`: `AppMode` union — removed `'compose'`. New union: `'party' | 'browse' | 'edit' | 'export' | 'sessions' | 'graph' | 'progression' | 'planning' | 'programs' | 'agent-detail'`. Every other member untouched (confirmed — no other union member removed, per out_of_scope).
    - `packages/client/src/components/ModeContent.tsx`: removed `const ComposePage = React.lazy(() => import('../pages/ComposePage'));` and its stale explanatory comment referencing Compose's react-flow weight; removed `compose: ComposePage,` from `PAGE_MAP`. The compiler forced this cleanup — `Record<AppMode, React.ComponentType>` would no longer typecheck against the union with a stray `compose:` key or a missing one; `npm run lint` confirms the fix is complete (tsc ×3 exit 0).
  </appmode_pagemap_diff>

  <state_hydration_map>N/A — deletion wave, no new client state. `useUIStore.activeMode` no longer has a `'compose'` member; `setActiveMode('compose')` is now a TypeScript compile error at any call site (none remain in client src, confirmed by grep).</state_hydration_map>

  <a11y_verification>N/A — deletion wave, no new interactive elements. Ran the required click-handler keyboard-equivalent grep (`<span|div|li|a ... onClick=`) against `ModeContent.tsx`: 0 matches.</a11y_verification>

  <design_tokens_used>N/A — no visual/token changes this wave. Raw-hex grep against all 3 modified files (ui-store.ts, ModeContent.tsx, playwright.config.ts): 0 matches.</design_tokens_used>

  <style_conflict_check>NONE</style_conflict_check>

  <retain_boundaries_confirmed>
    - `store/canvas-store.ts`: NOT deleted, NOT edited. Confirmed present on disk post-wave (`ls -la` timestamp unchanged from HEAD). Its importer scan shows `ExportPage.tsx` (FE-3's surface, still live) as a real functional importer (`import { useCanvasStore, selectLoadoutPayload } from '../store/canvas-store'`) — deleting it here would have broken FE-2's own lint SC, exactly as the packet warned. Belongs to FE-3.
    - `store/analyzeStore.ts`: untouched (not in any diff, not in files_deleted).
    - `constants/browse.ts`: untouched (not in any diff, not in files_deleted).
    - `constants/agent-roles.ts`: untouched (not in any diff, not in files_deleted) — its canvas-store import makes it FE-3's transitive-chain concern per the packet, not mine.
  </retain_boundaries_confirmed>

  <constant_audit>0 matches (hex / inline-style-conflict / onClick-a11y / JSON.parse) across all 3 files this wave modified (ui-store.ts, ModeContent.tsx, playwright.config.ts). No deleted file required an audit (deletion, not creation/modification of surviving code).</constant_audit>

  <lint_evidence>
`npm run lint` (tsc --noEmit ×3: shared → server → client, chained with &&) — EXIT 0, no diagnostics. Confirms the AppMode/PAGE_MAP compiler-forced cleanup is complete and no compose-family dangling import survives anywhere in the workspace.
  </lint_evidence>

  <build_evidence>
`npm run build -w @gander-studio/client` — EXIT 0. `vite build` succeeded; 2503 modules transformed. Notably **no ComposePage chunk is emitted** in the output manifest (previously a separate lazy chunk existed for it) — confirms dead-code elimination worked and no stray reference survives in the bundle graph. Main chunk 754.49 kB (pre-existing >500kB warning, unrelated to this wave — tracked in CLAUDE.md Known Issues).
  </build_evidence>

  <playwright_evidence>
Dev server was already live on :5173/:3001 (confirmed via `lsof` before running). Ran a targeted sample covering the FE-1b-migrated KEEP specs named in this packet's context + the s3-drilldowns absorption spec, per the task's "targeted... sample your packet names" instruction:
  - `tests/e2e/layout-sidebar-removal.spec.ts` (3/3 passed)
  - `tests/e2e/gander-studio-p1-fe-shell.spec.ts` (2/3 passed — 1 pre-existing baseline red, see below)
  - `tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` (all passed)
  - `tests/e2e/progression.spec.ts` (3/3 passed)
  - `tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (7/8 passed first pass — 1 flake, see below)

First parallel pass (2 workers): 34/36 passed, 2 failed. Both failures re-run in isolation for classification:
  1. `gander-studio-p1-fe-shell.spec.ts:15` ("app shell loads with header and Browse mode active") — **deterministic fail on isolated re-run too** (`browse-page` testid not found). Cross-checked against the t5 baseline report (`...-s3-drilldowns-t5-FE-1783490746.md` line 116): this exact spec file is named explicitly in the t5 55-pre-existing-failure list, root-caused there as "the default landing route changed from Browse to Party in the s2 sprint" — unrelated to Compose. CONFIRMED PRE-EXISTING, not introduced by this wave.
  2. `prog-studio-v2-2026-07-s3-drilldowns.spec.ts:362` ("a11y: detail page is keyboard-operable") — **passed cleanly on isolated single-worker re-run**. Matches the resource-contention-timing-flake pattern the t5 report documents for a sibling test in the same spec family (t5 report lines 105-113: "one failure only under maximum system contention... not a functional regression"). CONFIRMED FLAKE, not a new failure.

No NEW failure attributable to this wave's Compose deletion. Full-suite run not required this wave per the task instructions (final full reconciliation is FE-4's + BE-1's gate).
  </playwright_evidence>

  <conflict_report>
    <item severity="informational">
Pre-existing, out-of-scope comment-only text references to "MateriaCanvas"/"compose-store" survive in 4 files I am explicitly forbidden to touch this wave: `src/pages/GraphPage.tsx:2`, `src/hooks/useLinkSound.ts:11,17`, `src/components/BottomTabBar.tsx:14`, `src/pages/ExportPage.tsx:74,76,78`. These are prose comments only ("same pattern as MateriaCanvas.tsx", "dead compose-store actions for s5 deletion") with zero functional/compile coupling (confirmed by clean lint+build). The packet's literal SC grep (`grep -rn "ComposePage\|compose-store\|useComposeStore\|MateriaCanvas\|CardNode" packages/client/src`) is therefore NOT fully empty — these 7 residual comment-only lines remain, all in files named out_of_scope for FE-2 (`useLinkSound.ts` explicitly listed; `ExportPage.tsx` is FE-3's; `GraphPage.tsx` is FE-4's; `BottomTabBar.tsx` is FE-1a/1b's, already audit-PASSed). No improvised deletion/edit was made to these files. Cleanup of these stray comments belongs to FE-3/FE-4 when they touch their respective owning files, or to DOCS-1's final pass — flagging here per the hard-constraint instruction to record discoveries rather than improvise.
    </item>
    <item severity="informational">
`playwright.config.ts` was edited beyond the packet's literal enumeration — removed a dead `**/src/tests/compose/**/*.spec.ts` testMatch glob (and its explanatory comment) that pointed at the directory this wave emptied and removed. This is a 3-line subtractive cleanup strictly confined to artifacts I deleted this turn (not a new scope area); flagged for transparency rather than silently bundled.
    </item>
    <item severity="informational">
Two untracked scratch files (`packages/client/quickcheck.mjs`, `packages/client/quickcheck2.mjs`) are present in the working tree but were not created, read, or touched by this wave — pre-existing debris from a prior turn, noted for ORC awareness, not part of this packet's deliverable.
    </item>
  </conflict_report>

  <e2e_spec>TIER_1_ONLY — pure deletion wave, no new component/page/interactive-surface created. No Playwright spec authored this turn (8 existing specs deleted, 0 created).</e2e_spec>

  <integration_status>SUCCESS — all 15 enumerated files deleted per importer-scan verification, AppMode/PAGE_MAP cleanup compiler-forced and complete, canvas-store.ts/analyzeStore.ts/constants/browse.ts/agent-roles.ts all confirmed untouched (RETAIN boundaries honored), lint ×3 clean, build clean, targeted Playwright RUN shows zero new failures vs the t5 baseline. FE-3 is unblocked (canvas-store.ts, ExportPage.tsx, PlanningPage.tsx untouched and ready for its wave).</integration_status>
</ui_packet>
