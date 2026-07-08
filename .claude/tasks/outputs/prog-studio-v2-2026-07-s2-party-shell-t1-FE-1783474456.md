# FE#1 Completion — prog-studio-v2-2026-07-s2-party-shell-t1

Task packet: `prog-studio-v2-2026-07-s2-t1` (PM decomposition ID; equivalent to the dispatched
task_id `prog-studio-v2-2026-07-s2-party-shell-t1`). Read together with the amendment
(`prog-studio-v2-2026-07-s2-party-shell-amend-PM-1783474258.md`, W1-W5). This packet is
store-contract + nav-constants foundation only — no components, no PartyPage, no AppMode/PAGE_MAP
wiring, no e2e, no server/shared, no git commit (all confirmed out of scope per packet).

## Commands run (verbatim)

```
$ npm run lint
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
(exit 0, no output)

$ cd packages/client && npx vitest run src/store/__tests__/ui-store.test.ts
 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  19:36:32
   Duration  183ms (transform 36ms, setup 0ms, import 60ms, tests 5ms, environment 0ms)
```

Re-ran `npm run lint` a second time after adding the test file — still exit 0, no output.

## git diff summary (both touched files, confirming untouched regions)

```diff
diff --git a/packages/client/src/constants/navigation.ts b/packages/client/src/constants/navigation.ts
+import { Users, FileClock, TrendingUp, GitBranch, type LucideIcon } from 'lucide-react';
 import type { AppMode } from '../store/ui-store';
 ... (NAV_ITEMS block: 0 lines changed)
+interface RailItemDef { label: string; mode: AppMode; icon: LucideIcon; }
+export const RAIL_ITEMS: RailItemDef[] = [ ... 4 items ... ];

diff --git a/packages/client/src/store/ui-store.ts b/packages/client/src/store/ui-store.ts
 interface UIState {
   ...
+  selectedAgentCode: string | null;
+  setSelectedAgentCode: (code: string | null) => void;
 }
 ... (AppMode union, initial activeMode, partialize: 0 lines changed)
+      selectedAgentCode: null,
+      setSelectedAgentCode: (code: string | null) => set({ selectedAgentCode: code }),
```

Full diff verified via `git diff -- packages/client/src/store/ui-store.ts packages/client/src/constants/navigation.ts` — `AppMode` union, initial `activeMode: 'browse'`, `partialize`, and `NAV_ITEMS` are byte-unchanged.

## SC-by-SC self-check

| Success Criterion (from t1 packet) | Result |
|---|---|
| `npm run lint` (tsc ×3) clean | PASS — exit 0, no output (run twice, before and after adding the test file) |
| `selectedAgentCode === null` initially; `setSelectedAgentCode('FE')` → reads `'FE'` | PASS — colocated vitest (`src/store/__tests__/ui-store.test.ts`, 3/3 green) exercises exactly this contract, plus a null-clear case |
| `RAIL_ITEMS` exports 4 items, order Roster/Sessions/Progression/Programs, lucide icon refs, `mode: AppMode` | PASS — 4 items in that exact order; icons `Users, FileClock, TrendingUp, GitBranch` verified present in installed `lucide-react@0.577.0` via a Node require check before writing; `mode` field typed as `AppMode` (tsc confirms — `RailItemDef.mode: AppMode`) |
| `NAV_ITEMS` byte-unchanged in behavior | PASS — git diff shows 0 lines changed in the `NAV_ITEMS` block |
| Do NOT touch `AppMode`/initial `activeMode`/`partialize` | PASS — git diff confirms all three untouched |
| Do NOT edit `NAV_ITEMS`/`BottomTabBar.tsx` | PASS — neither touched |
| Do NOT build the rail component (t3 owns) | PASS — no JSX/component authored |
| No raw hex color values | PASS — grep `#[0-9a-fA-F]{6}` on all 3 touched/created files: 0 matches |
| No server/shared edits | PASS — only `packages/client/**` touched |
| No git commit | PASS — no `git add`/`git commit` run |

## Amendment (W1-W5) applicability

- **W1** (materiaTint DRY helper): targets t2/t3 — not applicable to t1 (no color-mix/tint idiom in this packet).
- **W2** (spec-primitive→substitute mapping, Critic-RATIFIED): targets t2/t3/t4 (Card/Badge/Progress/Skeleton/Alert substitutes). t1 introduces no component and no Shadcn-adjacent primitive — the mapping table has nothing to attach to in this packet's deliverables. Noted per prompt instruction ("W2 mapping applies to your packet context") but recorded here as **not materially applicable** rather than reproduced verbatim against nothing.
- **W3** (t6 SC tightening): targets t6 only — not applicable.
- **W4** (t3 ACCEPT-WITH-RATIONALE): targets t3 only — not applicable.
- **W5** (sprint risk_flags R-9, R-5b): sprint-level, surfaced by ORC at REQVAL/Step 4.5 — not an FE deliverable.

## Environment

Dev server on :3001 confirmed still listening throughout (`lsof -i :3001 -sTCP:LISTEN`), not killed or restarted; no second instance started. This packet made no runtime/server-touching changes — pure client TS source + a colocated unit test.

---

<ui_packet>
  <components_created>NONE — this packet is pure store contract + nav constants (no JSX/components, per task scope). Files modified/created:
    - packages/client/src/store/ui-store.ts (modified, +8 lines net)
    - packages/client/src/constants/navigation.ts (modified, +18 lines net)
    - packages/client/src/store/__tests__/ui-store.test.ts (new, +23 lines — colocated vitest per SC "a colocated store vitest is acceptable")
  </components_created>
  <state_hydration_map>
    useUIStore (Zustand + persist, packages/client/src/store/ui-store.ts) gains a new ephemeral field:
      - selectedAgentCode: string | null (initial null)
      - setSelectedAgentCode: (code: string | null) => void
    This is the s2-to-s3-nav-contract seam: PartyMemberCard (t3) will call an onSelect prop; PartyPage (t4)
    wires onSelect to setSelectedAgentCode(code) + setActiveMode('browse') (interim, until s3 builds the
    dedicated roster/agent-detail surface). selectedAgentCode is NOT persisted — partialize still persists
    ONLY { muted: state.muted }, unchanged from before this packet. No server/tRPC data flows into this
    field; it is pure client-side selection state written by future components, not by t1.
    Separately, constants/navigation.ts gains RAIL_ITEMS: a static, non-store, non-hydrated array of 4
    { label, mode, icon } tuples consumed by SubmenuRail (t3) via useUIStore's existing activeMode/
    setActiveMode (unrelated to selectedAgentCode). No hydration logic in this packet — SubmenuRail (t3)
    owns the read-from-store wiring.
  </state_hydration_map>
  <a11y_verification>N/A — no JSX/interactive elements in this packet (pure .ts store + constants file + a
    unit test). RAIL_ITEMS carries lucide icon component references only, consumed for aria/keyboard
    wiring by SubmenuRail (t3), which owns that verification. Ran the required click-handler keyboard-
    equivalent grep (`<(span|div|li|a)[^>]*onClick=`) across both touched files: 0 matches (expected —
    no JSX present).</a11y_verification>
  <design_tokens_used>N/A — no colors/styling introduced. RAIL_ITEMS.icon holds lucide-react component
    references (Users, FileClock, TrendingUp, GitBranch), not styled/tokened values. Raw-hex grep on all
    3 touched/created files: 0 matches.</design_tokens_used>
  <style_conflict_check>NONE — no JSX/inline styles in this packet; grep for inline style attributes
    returned 0 matches across all 3 files.</style_conflict_check>
  <integration_status>LIVE — pure client store/constants additions, no external/server data dependency.
    selectedAgentCode is exercised end-to-end by a colocated vitest (3/3 green); RAIL_ITEMS is a static
    constant verified by tsc (mode field typed exhaustively against the CURRENT AppMode union) and by
    manual inspection of item count/order/icon presence (icons confirmed present in the installed
    lucide-react package via a Node require check before use).</integration_status>
</ui_packet>
