# Completion Packet — prog-studio-v2-2026-07-s2-t5 (party-shell atomic nav wiring)

FE#5 | task_id: `prog-studio-v2-2026-07-s2-t5` | BLOCKER priority

Contract: `.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md` (t5 task_packet)
+ `.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-amend-PM-1783474258.md` (no amendments
target t5 directly — W1-W5 target t2/t3/t4/t6/SPRINT only; t5 executed per the original packet verbatim).

---

## Diff summary

### (A) `packages/client/src/store/ui-store.ts` (2nd serialized writer, re-read fresh after t1)

```diff
-export type AppMode = 'browse' | 'compose' | 'edit' | 'export' | 'sessions' | 'graph' | 'progression' | 'planning' | 'programs';
+export type AppMode = 'party' | 'browse' | 'compose' | 'edit' | 'export' | 'sessions' | 'graph' | 'progression' | 'planning' | 'programs';
...
-      activeMode: 'browse',
+      activeMode: 'party',
...
-      // activeMode must reset to 'browse' on hydrate so navigation is always clean.
+      // activeMode must reset to 'party' on hydrate so navigation is always clean.
```

`selectedAgentCode` / `setSelectedAgentCode` (t1) and `muted` / `toggleMuted` (s4-p1) left byte-identical.
`partialize` still persists ONLY `muted` — activeMode is not persisted, comment updated to match the new
default per packet instruction.

### (B) `packages/client/src/components/ModeContent.tsx`

```diff
 import { useUIStore } from '../store/ui-store';
 import type { AppMode } from '../store/ui-store';
+import PartyPage from '../pages/PartyPage';
 import BrowsePage from '../pages/BrowsePage';
 ...
 const PAGE_MAP: Record<AppMode, React.ComponentType> = {
+  party: PartyPage,
   browse: BrowsePage,
   ...
```

`PartyPage` (t4's default export) is now reachable. No other lines in `ModeContent.tsx` touched — the
`.mode-enter` animation wrapper, `useUIStore` selector pattern, and grid-area styling are unchanged.

No other files modified. `BottomTabBar.tsx`, `constants/navigation.ts`, `globals.css` confirmed untouched
via `git status --porcelain` (empty output for all three).

---

## Verification — verbatim

### `npm run lint` (tsc --noEmit x3)

```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
```
Exit code: `0`. No errors emitted by any of the three `tsc` invocations. This is the compiler-exhaustiveness
proof: `PAGE_MAP: Record<AppMode, React.ComponentType>` in `ModeContent.tsx` type-checks against the
widened 10-member `AppMode` union with zero missing-key errors — the `party: PartyPage` entry satisfies
the `Record` exhaustiveness the union addition forces.

### `npm test -w @gander-studio/client`

```
> @gander-studio/client@0.1.0 test
> vitest run

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client

 Test Files  6 passed (6)
      Tests  37 passed (37)
   Start at  20:11:46
   Duration  896ms (transform 302ms, setup 0ms, import 854ms, tests 56ms, environment 1ms)
```
Exit code: `0`. 37/37 stayed green (includes t1's 3 ui-store vitest cases + t2's StatBar vitest cases).

### `npm run build`

```
> build
> npm run build -w @gander-studio/client

> @gander-studio/client@0.1.0 build
> tsc && vite build

vite v6.4.1 building for production...
transforming...
✓ 2504 modules transformed.
rendering chunks...
computing gzip size...
dist/registerSW.js                  0.13 kB
dist/manifest.webmanifest           0.35 kB
dist/index.html                     0.52 kB │ gzip:   0.33 kB
dist/assets/index-BINhGFJE.css     37.52 kB │ gzip:   7.86 kB
dist/assets/index-CGUldprg.js   1,035.70 kB │ gzip: 316.30 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 6.25s

PWA v1.2.0
mode      generateSW
precache  9 entries (1066.01 KiB)
files generated
  dist/sw.js
  dist/workbox-7a79b53c.js
```
Exit code: `0`. Build passing. The chunk-size warning is pre-existing (documented in project CLAUDE.md
"Known Issues" as a chunk-size warning; the absolute figure grew from ~700KB to ~1035KB across the s2
sprint's cumulative additions t1-t5, not solely this packet — out of scope for a nav-wiring task, noted
for visibility only, not a regression this packet introduced).

Client vite dev server was NOT started by this task (per instruction — :3001 server dev process was left
untouched; a production `vite build` was used as the build-pass gate per the packet's explicit fallback
instruction: "client vite not started by you — a vite build suffices").

---

## SC-by-SC self-check (packet success_criteria)

1. **`npm run lint` (tsc x3) clean — PAGE_MAP exhaustive over the widened AppMode union.**
   PASS — exit 0, verbatim output above, zero missing-key errors on the `Record<AppMode, ...>` map.

2. **On a fresh load with cleared persisted store, `useUIStore.getState().activeMode === 'party'` and
   ModeContent renders PartyPage.**
   Store-level: verified by source inspection — `activeMode: 'party'` is the literal initial state passed
   to `create<UIState>()`, and `partialize` does not persist `activeMode`, so any load (fresh or
   cleared-storage) resolves to `'party'` after zustand-persist hydration. `ModeContent`'s
   `PAGE_MAP['party']` resolves to `PartyPage` (imported, default export confirmed at
   `packages/client/src/pages/PartyPage.tsx:190`). Full headless/browser assertion of this behavior is
   t6's owned runtime gate (per plan `runtime_gate_owner: t6`) — not re-asserted here beyond source-level
   confirmation + the tsc compile proof, matching the packet's own framing ("asserted headless in t6;
   build pass is this packet's own gate").

3. **Client build passing.**
   PASS — `npm run build` exit 0, verbatim above.

4. **BottomTabBar still renders its existing 9 NAV_ITEMS and every existing surface still routes with no
   regression (t6 asserts a couple of existing routes still switch).**
   Source-level: `BottomTabBar.tsx` and `constants/navigation.ts` are byte-unchanged (confirmed via
   `git status --porcelain` — empty). `PAGE_MAP` retains all 9 pre-existing entries (`browse`, `compose`,
   `edit`, `export`, `sessions`, `graph`, `progression`, `planning`, `programs`) unmodified, `party` is
   purely additive as the 10th entry. Runtime route-switch assertion is t6's owned gate.

5. **`selectedAgentCode` contract from t1 is unchanged and present.**
   PASS — confirmed via diff: `selectedAgentCode: string | null`, `setSelectedAgentCode`, initial value
   `null`, and the setter implementation are all byte-identical to the file t1 delivered (no lines in that
   block appear in the diff).

---

## Out-of-scope confirmation

- No component/page/hook edits beyond the 2 files named in the packet.
- No e2e spec written (t6 owns runtime gates).
- `BottomTabBar.tsx` untouched (confirmed).
- No server/shared edits (confirmed — only 2 client files in the diff).
- No `git commit` run (per Git-Commit Boundary — ORC/commit-packet sequences the commit after audit PASS).
- No `'roster'` AppMode added; Roster rail item (t1's `RAIL_ITEMS`) stays mapped to `'browse'` as specified.
- Dev server on :3001 left untouched; not started/stopped/restarted by this task.

## Constant / DRY / a11y audits (required pre-packet checks)

- **Raw hex grep** (`#[0-9a-fA-F]{6}` in the 2 modified files): 0 matches.
- **Inline style / Tailwind conflict check**: 0 matches — no JSX/style attributes were added or modified
  in either file (ModeContent.tsx's existing `style={{...}}` block on `<main>` is untouched by this diff).
- **Click-handler keyboard-equivalent audit** (`<span|div|li|a ... onClick=`): 0 matches in either file.
- **JSON.parse external-data-safety check**: 0 matches in either file.
- **Function-body deduplication**: N/A — no new functions/handlers introduced; only a type-union literal,
  an object initializer field, an import statement, and a Record key were added.

---

<ui_packet>
  <components_created>NONE — this task wires an existing component (PartyPage, delivered by t4) into
    routing. No new component files were created.</components_created>
  <files_modified>
    <file path="packages/client/src/store/ui-store.ts">AppMode union +'party' (first member); initial
      activeMode 'browse'→'party'; partialize comment updated to reference 'party'. selectedAgentCode/
      setSelectedAgentCode/muted/toggleMuted untouched.</file>
    <file path="packages/client/src/components/ModeContent.tsx">import PartyPage; PAGE_MAP gains
      `party: PartyPage` as the new first entry (compiler-forced by the widened AppMode union — the
      error-driven completion was the design, and it type-checked cleanly on first pass since PartyPage
      already existed as a default export from t4).</file>
  </files_modified>
  <state_hydration_map>No new state added. `activeMode: AppMode` (zustand, non-persisted field) now
    initializes to `'party'` instead of `'browse'` on store creation and on every persist-hydrate cycle
    (partialize excludes activeMode from the persisted snapshot, so this holds across reloads). ModeContent
    reads `activeMode` via the existing primitive selector `useUIStore((s) => s.activeMode)` and resolves
    `PAGE_MAP[activeMode]` to `PartyPage` by default — no new subscription, no new store slice.</state_hydration_map>
  <a11y_verification>N/A for this packet — no new interactive elements, ARIA roles, or keyboard handlers
    were introduced. PartyPage's own a11y surface (aria-label composition on PartyMemberCard, StatBar
    progressbar roles, SubmenuRail role=navigation, focus-visible states) was verified in t3/t4 and is
    unaffected by this wiring change. Route-reachability of PartyPage (this packet's sole behavioral
    change) is asserted at the DOM/keyboard level by t6's Playwright spec.</a11y_verification>
  <design_tokens_used>NONE — no styling was touched. Zero raw hex literals introduced (grep-confirmed).</design_tokens_used>
  <style_conflict_check>NONE — no style/className attributes added or modified in either file.</style_conflict_check>
  <integration_status>LIVE — PartyPage (t4's live-data-fetching page component, already wired to
    `roster.getParty` via `useParty`) is now reachable as the default route. No mocking involved in this
    packet; it is a pure routing-table + default-state change on top of an already-live page.</integration_status>
</ui_packet>
