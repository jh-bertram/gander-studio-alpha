## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-07-08T02:10:07Z
- **Task ID:** prog-studio-v2-2026-07-s2-t5
- **Message received:**
  > You are FE#5 executing task packet `prog-studio-v2-2026-07-s2-party-shell-t5` — the ATOMIC nav wiring: 'party' into the AppMode union + PAGE_MAP + the default-route flip. Small, surgical, BLOCKER-priority. Your contract (packet prevails; amendment for context): .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md → <task_packet> t5 ONLY; .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-amend-PM-1783474258.md. Exactly this, atomically (one lint-verified change-set): (1) packages/client/src/store/ui-store.ts — add 'party' to the AppMode union AND flip the default activeMode to 'party' (you are the SECOND serialized ui-store writer after t1 — its audit is closed; do not touch selectedAgentCode or partialize semantics beyond what the packet states); (2) packages/client/src/pages/... — PAGE_MAP in ModeContent.tsx gains the party→PartyPage entry (the compiler forces it once the union grows — that error-driven completion IS the design). BottomTabBar remains untouched and must keep working for all 9 existing tabs (no party tab this sprint — party is reachable as the default route; W5/R-5b known-interim). Verify: npm run lint (tsc ×3) clean — the compiler-exhaustiveness proof; npm test -w @gander-studio/client (37/37 stay green); confirm via the running dev servers if practical (client vite not started by you — a vite build suffices: npm run build). Record outputs verbatim. Dev server :3001 running — do not touch. …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-08T02:12:00Z
- **Components to build:** none new — this is atomic wiring only.
  - `packages/client/src/store/ui-store.ts` — widen `AppMode` union with `'party'` (first member); flip initial `activeMode` to `'party'`; update `partialize` comment. Leave `selectedAgentCode`/`setSelectedAgentCode`/`muted`/`toggleMuted` untouched.
  - `packages/client/src/components/ModeContent.tsx` — import `PartyPage` from `../pages/PartyPage`; add `party: PartyPage,` to `PAGE_MAP`.
- **State design:** No new state slices. `activeMode: AppMode` initial value changes from `'browse'` to `'party'`. No change to persist/partialize behavior beyond the comment (still persists only `muted`).
- **tRPC wiring:** None (pure wiring task).
- **A11Y plan:** N/A — no new interactive elements; PartyPage's own a11y was verified in t3/t4 packets.
- **Verification plan:** `npm run lint` (tsc x3), `npm test -w @gander-studio/client` (expect 37/37 stay green, includes t1's 3 new ui-store vitest cases and t2's StatBar cases), `npm run build`.

### Checkpoint — 02:14:30
- Edited `packages/client/src/store/ui-store.ts` (3 line-level changes: AppMode union +'party' first member, initial activeMode 'browse'→'party', partialize comment 'browse'→'party'). Constant audit: N/A (no literals introduced beyond the existing string-literal union pattern). Next: edit ModeContent.tsx.
### Checkpoint — 02:14:45
- Edited `packages/client/src/components/ModeContent.tsx` (2 line-level changes: import PartyPage, add `party: PartyPage,` to PAGE_MAP). Constant audit: N/A. Next: run npm run lint / test / build.

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T02:16:00Z
- **Deliverables:**

| File | Lines changed | Notes |
|------|------|-------|
| `packages/client/src/store/ui-store.ts` | 3 lines modified (net 0 new/removed, all in-place edits) | AppMode union +'party' (first member); initial activeMode 'browse'→'party'; partialize comment updated |
| `packages/client/src/components/ModeContent.tsx` | 2 lines added | import PartyPage; PAGE_MAP gains party: PartyPage |

- **Lint:** exit 0 (`npm run lint` — tsc --noEmit x3, all three projects clean; PAGE_MAP exhaustiveness over widened AppMode union proven by successful compile)
- **Test:** exit 0 (`npm test -w @gander-studio/client` — 37/37 passed, 6 test files)
- **Build:** exit 0 (`npm run build` — tsc && vite build succeeded, dist artifacts generated)
- **Constant audit:** 0 matches (no raw hex, no JSON.parse, no inline-style/Tailwind conflicts, no unguarded click handlers in either modified file)
- **Scope check:** git status confirms exactly 2 files modified by this task; BottomTabBar.tsx, navigation.ts, globals.css confirmed untouched (empty status output)
