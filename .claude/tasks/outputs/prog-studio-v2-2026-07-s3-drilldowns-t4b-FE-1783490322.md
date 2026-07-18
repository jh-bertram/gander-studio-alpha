# FE Output — prog-studio-v2-2026-07-s3-drilldowns-t4b

Task: nav re-points (SCs a-e). Contract: rev2 PM plan `<task_packet>` t4b ONLY
(`.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md`).

## Diff summary

`git diff --stat`:
```
 packages/client/src/constants/navigation.ts |  7 ++++---
 packages/client/src/pages/PartyPage.tsx     | 11 +++++++----
 2 files changed, 11 insertions(+), 7 deletions(-)
```

### PartyPage.tsx
```diff
   function handleSelect(code: string) {
-    // INTERIM (amendment R-4): routes to today's agent-catalog surface until s3 lands the
-    // dedicated roster/agent-detail mode. The store contract (setSelectedAgentCode) is the
-    // real s3 seam deliverable and is set correctly regardless of the interim destination.
+    // s3 nav-contract resolution (t4b): routes to the dedicated agent-detail drill-down,
+    // registered as an AppMode + lazy PAGE_MAP entry by t4a. setSelectedAgentCode remains the
+    // seam that scopes AgentDetailPage's getAgentDetail query to the clicked card.
     setSelectedAgentCode(code);
-    setActiveMode('browse');
+    setActiveMode('agent-detail');
   }

+  // TODO(s4-cut): re-point "View Full Roster" when BrowsePage is deleted — 'browse' leaves the
+  // AppMode union, so this must retarget the 13-role roster catalog (or 'party'). Deferred-work
+  // pointer: prog-studio-v2 s4 Browse-cut packet. (nav-contract retain decision, s3.)
   function handleViewRoster() {
     setActiveMode('browse');
   }
```

### navigation.ts
```diff
 export const RAIL_ITEMS: RailItemDef[] = [
-  // INTERIM: Roster maps to 'browse' (today's agent-catalog surface) until s3
-  // introduces a dedicated roster/agent-detail mode.
-  { label: 'Roster', mode: 'browse', icon: Users },
+  // s3 nav-contract resolution (t4b): Roster now maps to 'party' — the party-home affordance.
+  // This is the intended target; SubmenuRail's isActive→aria-current logic legitimately marks
+  // Roster as current while on the party home (human-ratified aria-current-at-home semantic).
+  { label: 'Roster', mode: 'party', icon: Users },
   { label: 'Sessions', mode: 'sessions', icon: FileClock },
```

## Verification — verbatim

### `npm run lint` (chains shared → server → client `tsc --noEmit` via `&&`, satisfies lint ×3 in one script invocation)
```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

EXIT_CODE=0
```

### `npm test -w @gander-studio/client`
```
> @gander-studio/client@0.1.0 test
> vitest run

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client

 Test Files  8 passed (8)
      Tests  54 passed (54)
   Start at  00:00:32
   Duration  1.23s (transform 778ms, setup 0ms, import 1.52s, tests 87ms, environment 1ms)

EXIT_CODE=0
```

### `grep -n "browse" packages/client/src/pages/PartyPage.tsx`
```
205:  // TODO(s4-cut): re-point "View Full Roster" when BrowsePage is deleted — 'browse' leaves the
209:    setActiveMode('browse');
```
Both matches are the deliberately-retained `handleViewRoster` CTA — line 205 is its own s4 TODO
comment referencing the word 'browse'; line 209 is the actual retained `setActiveMode('browse')`
call. `handleSelect` no longer contains 'browse'. Matches SC(c)/(d).

### `grep -n "browse" packages/client/src/constants/navigation.ts`
```
11:  { mode: 'browse', label: 'Browse', dotColor: 'var(--mt)' },
```
This is `NAV_ITEMS` (the BottomTabBar's separate top-level Browse tab) — out of scope for t4b,
not part of the party/rail nav path, and untouched. `RAIL_ITEMS`' Roster item now shows `mode:
'party'` with **zero** remaining `'browse'` occurrences in `RAIL_ITEMS`. Matches SC(b)/(d).

## SC self-check

- **(a)** `handleSelect` sets `setActiveMode('agent-detail')`, retains `setSelectedAgentCode(code)`;
  stale INTERIM comment replaced with a comment describing the t4a-registered destination. MET.
- **(b)** `RAIL_ITEMS` Roster item `mode` is `'party'` (was `'browse'`); label unchanged (`'Roster'`).
  MET.
- **(c)** `handleViewRoster` destination unchanged — still `setActiveMode('browse')`; carries an s4
  TODO marker (code comment + deferred-work pointer to the s4 Browse-cut packet), wording per the
  packet's literal template. MET.
- **(d)** The only remaining `'browse'` target in the party/rail nav path is the deliberately-
  retained `handleViewRoster` CTA — confirmed by grep above (`handleSelect` and the `RAIL_ITEMS`
  Roster item no longer target `'browse'`; the `navigation.ts` `NAV_ITEMS` Browse tab is a separate,
  out-of-scope surface). MET.
- **(e)** `npm run lint` clean across shared/server/client (single chained script, exit 0). MET.

## Notes

- Upstream `t4a` confirmed already landed: `ui-store.ts` `AppMode` union includes `'agent-detail'`
  (verified read-only before editing); `ModeContent`/`ui-store.ts` NOT touched by this packet, per
  scope.
- `SubmenuRail.tsx`'s `isActive → aria-current="page"` logic (`:33/:40`) was read for context ONLY
  — not modified. Re-pointing Roster to `'party'` causes it to legitimately mark `aria-current="page"`
  on the party home; this is the intended, human-ratified nav side-effect described in the packet.
- e2e spec (`prog-studio-v2-2026-07-s2-party-shell.spec.ts`) was **NOT run and NOT edited** — it is
  t5's authorized scope (three named assertion updates: card-Enter marker, Roster-rail marker,
  L313-325 aria-current invariant). The s2 spec is now **expected to FAIL** on the two re-pointed
  destination markers (card click → `agent-detail-page` instead of `browse-page`; Roster rail click
  → `party-page` instead of `browse-page`) and on the aria-current invariant until t5 lands its
  rewrite. This is expected per the rev2 plan's dependency ordering (`t4a → t4b → t5`) and is not a
  regression introduced by t4b.
- No `git stash`, no `git commit` performed.

<ui_packet>
  <files_modified>
    <file path="packages/client/src/pages/PartyPage.tsx">handleSelect re-pointed to setActiveMode('agent-detail') (retains setSelectedAgentCode); stale INTERIM comment replaced; handleViewRoster destination retained as 'browse' with an s4 TODO marker (comment + deferred-work pointer) added above it</file>
    <file path="packages/client/src/constants/navigation.ts">RAIL_ITEMS Roster item mode re-pointed 'browse' → 'party' (label unchanged); stale INTERIM comment replaced with the nav-contract-resolution rationale</file>
  </files_modified>
  <components_created>NONE — nav re-point only, no new components (per packet scope)</components_created>
  <state_hydration_map>No new state. Consumes existing useUIStore setActiveMode/setSelectedAgentCode (unmodified). 'agent-detail' AppMode member confirmed already landed by upstream t4a (verified read-only in ui-store.ts before editing); this packet does not touch ui-store.ts, ModeContent.tsx, or PAGE_MAP.</state_hydration_map>
  <a11y_verification>No new interactive elements introduced. SubmenuRail's existing isActive→aria-current="page" mechanism (SubmenuRail.tsx :33/:40) is unmodified; re-pointing RAIL_ITEMS Roster.mode to 'party' causes that existing logic to legitimately emit aria-current="page" on the Roster rail item while on the party home — the documented, human-ratified intended side-effect. No focus/keyboard-handling changes were made (handleSelect/handleViewRoster are pre-existing callback bodies invoked by PartyMemberCard/Button, both already keyboard-operable, unmodified here).</a11y_verification>
  <design_tokens_used>NONE new — no styling/token changes in this packet (pure nav-target re-point + comments).</design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <constant_audit>0 matches — raw hex, JSON.parse, unguarded onClick-without-keyboard-equivalent, and inline style-string/Tailwind conflicts all grepped clean on both modified files.</constant_audit>
  <verification>
    <lint>npm run lint (chains shared→server→client tsc --noEmit via &amp;&amp;) — exit 0, clean, ×3 satisfied in one script</lint>
    <tests>npm test -w @gander-studio/client — 8 test files, 54 tests, all passed, exit 0</tests>
    <browse_grep_partypage>2 matches, both the deliberately-retained handleViewRoster CTA (TODO comment text + the actual setActiveMode('browse') call) — matches SC(c)/(d)</browse_grep_partypage>
    <browse_grep_navigation>1 match at NAV_ITEMS (BottomTabBar's separate Browse tab, out of scope); RAIL_ITEMS Roster item confirmed re-pointed to 'party' with zero remaining 'browse' occurrences in RAIL_ITEMS — matches SC(b)/(d)</browse_grep_navigation>
  </verification>
  <sc_self_check>
    <sc id="a">MET — handleSelect sets setActiveMode('agent-detail'), retains setSelectedAgentCode; stale comment updated</sc>
    <sc id="b">MET — RAIL_ITEMS Roster item mode is 'party' (label unchanged)</sc>
    <sc id="c">MET — handleViewRoster destination unchanged ('browse'); carries s4 TODO marker (comment + deferred-work pointer)</sc>
    <sc id="d">MET — only remaining 'browse' target in party/rail path is the retained handleViewRoster CTA (confirmed by grep)</sc>
    <sc id="e">MET — npm run lint clean ×3 (single chained script, exit 0)</sc>
  </sc_self_check>
  <e2e_spec>NOT_RUN_NOT_EDITED — t5 owns packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts (three authorized assertion updates). Per task instructions, the s2 spec's card-click and Roster-rail destination markers plus the L313-325 aria-current invariant are EXPECTED TO FAIL until t5 lands its rewrite — this is expected/dependency-ordered (t4a→t4b→t5), not a t4b regression.</e2e_spec>
  <integration_status>SUCCESS — both files edited exactly as specified in the rev2 PM plan's t4b task_packet; no scope creep (no AppMode/ModeContent/ui-store/e2e edits); lint and vitest both clean; grep verification confirms exactly one remaining 'browse' target (the deliberately-retained CTA) in the party/rail nav path.</integration_status>
</ui_packet>
