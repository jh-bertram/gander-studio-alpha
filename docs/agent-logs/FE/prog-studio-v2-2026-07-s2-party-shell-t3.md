## [STAGE 1] RECEIVED
- **From:** ORC (via PM decomposition prog-studio-v2-2026-07-s2-party-shell)
- **At:** 2026-07-08T01:44:34Z
- **Task ID:** prog-studio-v2-2026-07-s2-t3
- **Message received:**
  > You are FE#3 executing task packet `prog-studio-v2-2026-07-s2-party-shell-t3` — PartyMemberCard + SubmenuRail.
  >
  > Your contract is TWO files read together (packet prevails; amendment overrides on amended points):
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md → <task_packet> t3 ONLY
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-amend-PM-1783474258.md — W1 binds you: import materiaTint from components/party/materia-tint.ts; your files must contain ZERO color-mix literals (ORC greps, expects 0). W2: record the spec-substitute mapping (Card→PartyMemberCard, Badge→RoleTag, etc., Critic-RATIFIED) in your completion packet. W4: SubmenuRail stays in this packet (accepted-with-rationale).
  >
  > Upstream on disk (consume): t1 — store/ui-store.ts selectedAgentCode contract + constants/navigation.ts RAIL_ITEMS; t2 — components/party/{PortraitFrame,StatBar,materia-tint}. Design contract: docs/v2-vision/v2-design-spec.md (card layout, whole-card link affordance, Popover quick-peek content, hover/focus/active states, rail geometry; contrast_pairs CANONICAL). Existing popover primitive: verify components/ui/popover.tsx exists and apply FF7 tokens EXPLICITLY on its content (the collision gotcha — never rely on primitive defaults).
  >
  > Card requirements per packet: whole-card interactive (click sets selectedAgentCode — the s3 click-through seam; keyboard operable, proper role/aria), hover Popover quick-peek (p11 carry-in), RoleTag using materiaTint, StatBars from t2. Rail: RAIL_ITEMS-driven, active-item styling per contrast_pairs (--mt on --sfh — the table is canonical over the spec's states prose), aria-current.
  >
  > Verify: npm run lint (tsc ×3) + npm test -w @gander-studio/client (existing 24 tests stay green; add pure-logic tests if your packet requires); record outputs verbatim. Dev server on :3001 running — do not touch it. …[truncated]

## [STAGE 3] INTERRUPTED
- **At:** 2026-07-08T01:48:22.283500+00:00
- **Detected by:** agent-stop-checkpoint hook (session ended without Stage 3)
- **Action required:** Re-dispatch FE#3 (canonical: FE#3) for task `prog-studio-v2-2026-07-s2-party-shell-t3`.
  Read `docs/agent-logs/FE/latest.md` before starting — skip completed checkpoints.

## [RE-DISPATCH NOTE]
- **At:** 2026-07-08T01:56:21Z
- On re-entry, `latest.md` showed only Stage 1 RECEIVED + the hook's INTERRUPTED marker; no
  `components/party/PartyMemberCard.tsx` or `SubmenuRail.tsx` existed on disk (only t2's
  PortraitFrame/StatBar/materia-tint were present). No prior progress to resume — proceeded from
  Stage 2 fresh.

## [STAGE 2] PLAN
- **At:** 2026-07-08T01:56:21Z
- **Components to build:**
  - `packages/client/src/components/party/PartyMemberCard.tsx` (whole-card interactive button,
    RoleTag sub-component, Popover quick-peek)
  - `packages/client/src/components/party/SubmenuRail.tsx` (RAIL_ITEMS-driven nav rail)
- **State design:** No new Zustand slices. PartyMemberCard is store-agnostic (props: `member`,
  `onSelect`); local component state only (`isPeeking`, `isBordered` + a hover-delay timeout ref).
  SubmenuRail reads `useUIStore` (`activeMode`, `setActiveMode`) directly, mirroring
  BottomTabBar's pattern — no new store fields.
- **tRPC wiring:** None (t3 is pure prop-driven / store-read-only; data fetch is t4's `useParty`).
- **A11Y plan:**
  - PartyMemberCard: native `<button>` (via base-ui `PopoverTrigger`, `nativeButton` default),
    single tab stop, composite `aria-label` built by pure `buildCardAriaLabel()`, Enter/Space
    activate natively (no custom onKeyDown needed). Popover quick-peek opens on
    hover-after-short-delay (300ms, base-ui's own OPEN_DELAY) OR immediately on keyboard focus,
    via a manually-controlled `open` prop (base-ui's `PopoverTrigger` does not auto-open on focus
    in the installed version — verified against `node_modules/@base-ui/react/popover/trigger/*`).
  - SubmenuRail: `<nav role="navigation" aria-label="Party screen submenus">`, 4 `<Button>` items
    (native `<button>` via base-ui `ButtonPrimitive`), `aria-current="page"` on the active item,
    `.tab-item:focus-visible` reused for the focus ring.
  - Verified via grep: zero `<span|div|li|a onClick=`, zero raw hex, zero `color-mix` literal.

### Checkpoint — 01:50:00
- Wrote `packages/client/src/components/party/PartyMemberCard.tsx` (~210 lines). Constant audit:
  0 raw-hex matches, 0 color-mix matches (comment reworded to avoid the literal substring per W1's
  strict 0-match grep). Next: SubmenuRail.tsx.

### Checkpoint — 01:51:00
- Wrote `packages/client/src/components/party/SubmenuRail.tsx` (~60 lines). Constant audit: 0
  raw-hex, 0 color-mix. Next: tsc + vitest verification.

### Checkpoint — 01:52:00
- `npm run lint` (tsc x3): clean, exit 0.
- `npm test -w @gander-studio/client`: FAILED — added colocated
  `components/party/__tests__/PartyMemberCard.test.ts` (pure `buildCardAriaLabel` test, matching
  t2's `computeStatBarViewModel` precedent) transitively imports `components/ui/popover.tsx`,
  which uses the `@/lib/utils` alias. `vitest.config.ts` had no `resolve.alias` (unlike
  `vite.config.ts`), so the alias failed to resolve under vitest's node environment — a
  pre-existing test-infra gap, first exposed because no prior test transitively touched
  `components/ui/*`. Switched `cn` imports in both new files to relative paths
  (`../../lib/utils`) — did not fully resolve the issue since `popover.tsx` itself (an existing,
  out-of-scope file) also uses the alias.
- Fixed root cause: added `resolve.alias` to `packages/client/vitest.config.ts`, mirroring
  `vite.config.ts`'s existing alias exactly (non-behavioral, test-infra-only, not owned by any
  other in-flight packet per the plan's `append_serialization` notes).
- Re-ran: `npm run lint` clean (exit 0); `npm test -w @gander-studio/client` → 5 files / 27 tests
  passed (24 existing + 3 new `buildCardAriaLabel` cases).
- Final constant-usage / style-conflict / click-handler / JSON.parse audits: all 0 matches (clean).

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T01:56:21Z
- **Deliverables:**

| File | Lines | Notes |
|---|---|---|
| `packages/client/src/components/party/PartyMemberCard.tsx` | 213 | Whole-card native `<button>` (PopoverTrigger), RoleTag sub-component, Popover quick-peek, StatBar×3 wiring |
| `packages/client/src/components/party/SubmenuRail.tsx` | 60 | RAIL_ITEMS-driven nav rail, aria-current, contrast_pairs-canonical active styling |
| `packages/client/src/components/party/__tests__/PartyMemberCard.test.ts` | 42 | Pure `buildCardAriaLabel` unit tests (3 cases) |
| `packages/client/vitest.config.ts` | +9 (net) | Added `resolve.alias` mirroring `vite.config.ts` — unblocks any test transitively importing `components/ui/*` |

- **Lint:** `npm run lint` (tsc x3) — exit 0, clean.
- **Vitest:** `npm test -w @gander-studio/client` — 5 test files / 27 tests passed (24 pre-existing + 3 new).
- **Constant audit:** raw-hex 0 matches; `color-mix` 0 matches in both t3 files (W1 satisfied);
  onClick-on-non-button 0 matches; JSON.parse 0 matches (N/A — no external parsing in this
  packet); inline `style="..."` string attrs 0 matches (all styling is JSX `style={{}}` objects).
