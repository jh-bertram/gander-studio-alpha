# PM Plan Amendment (AMEND-3) — prog-studio-v2-2026-07-s4-retirement

SC-level enumeration addition per the coordinator's amend3 request. Single-file: assign the orphan spec `prog-studio-vision-2026-06-s5-reconcile.spec.ts` a deletion wave. No structural change, no new packet, no dependency change, agent_count unchanged (8), no Critic re-gate. **rev3 (`...-rev3-PM-1783715959.md`) + this amend3 together are the plan of record for assign-agents.**

Provenance: flagged as an ORPHAN by FE-1b's ui_packet (`...-FE-1b-FE-1783719780.md` §4B `<ORPHAN>`) AND by AUD#2 — not named in any wave's deletion/migration list, red post-NAV_ITEMS-retirement.

<plan_amendment task_id="prog-studio-v2-2026-07-s4-retirement" base_plan="prog-studio-v2-2026-07-s4-retirement-rev3-PM-1783715959.md" scope="SC-level-only / single-file enumeration">

  <amendment id="A1" target_packet="prog-studio-v2-2026-07-s4-retirement-FE-2" type="DEPENDENCY / deletion-enumeration">
    <disk_verification>
PM read `packages/client/tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts` in full (100 lines, 3 tests) 2026-07-10. ALL THREE tests target CUT surfaces — NO KEEP content, so the WHOLE FILE deletes (the coordinator's "also CUT-coupled ⇒ whole file deletes" branch):
  - Test 1 (L26-52, "archivist derives intel role producing --mb color token"): calls `navigateToCompose()` (clicks COMPOSE, non-defensive `waitFor` on `[data-testid="materia-canvas"]`, timeout 8000) — COMPOSE-canvas-coupled (FE-2 surface). Hard-reds post-NAV_ITEMS-retirement (COMPOSE tab gone → click skipped → materia-canvas waitFor times out).
  - Test 2 (L55-74, "meta-yellow token (--my) resolves correctly as control case"): same `navigateToCompose()` + asserts `[data-testid="materia-canvas"]` visible — COMPOSE-canvas-coupled (FE-2 surface).
  - Test 3 (L77-99, "BrowsePage renders without duplicate-key React warning for hooks"): navigates to the BROWSE tab (`text=BROWSE`), checks BrowsePage's hooks list for duplicate-key console warnings — BROWSE-coupled. Browse is an ABSORB/CUT surface deleted in FE-4 — NOT a KEEP surface. Its premise is already broken post-NAV_ITEMS-retirement (BROWSE tab gone). No extraction/migration needed; no KEEP owner.
No import of any deleted module (all navigation is by runtime `text=` locator), so whole-file deletion in FE-2 has ZERO compile impact even though BrowsePage/GraphPage survive until FE-4.
    </disk_verification>
    <change>
Add `packages/client/tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts` to FE-2's Compose-wave deletion list (WHOLE-FILE delete) AND to FE-2's `<context_files>`. FE-2 now deletes EIGHT specs (the seven amend-2 Compose specs + this reconcile orphan). Rationale for the FE-2 home: 2 of 3 tests die with the Compose surface FE-2 removes; the 3rd (Browse) is also CUT with no KEEP future, so deleting the obsolete file whole in the first wave that owns its majority coupling is correct — deferring the remnant to FE-4 would split a single-file delete across waves for no benefit.
    </change>
    <description_addendum>
FE-2 step 5 (e2e deletion) now enumerates EIGHT specs to delete WITH the Compose surface:
  1. packages/client/tests/e2e/gander-studio-p1-compose-fe.spec.ts
  2. packages/client/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts
  3. packages/client/tests/e2e/materia-canvas-proximity.spec.ts
  4. packages/client/tests/e2e/card-node-title-edit.spec.ts
  5. packages/client/tests/e2e/loadout-list-panel.spec.ts
  6. packages/client/src/tests/compose/compose-connections-persist.spec.ts
  7. packages/client/src/tests/compose/materia-canvas.spec.ts
  8. packages/client/tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts   ← ADDED (amend-3): whole-file delete; all 3 tests CUT-coupled (Compose ×2 + Browse ×1); provenance FE-1b §4B ORPHAN + AUD#2.
Delete the whole file (no test extraction — no test covers a KEEP surface); re-confirm at execution time that its only surface couplings are Compose (materia-canvas) and Browse (BROWSE tab).
    </description_addendum>
    <context_files_addendum>
packages/client/tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts
    </context_files_addendum>
    <success_criteria_addendum>
- `prog-studio-vision-2026-06-s5-reconcile.spec.ts` deleted whole (confirmed all 3 tests are CUT-coupled — Compose materia-canvas ×2 + Browse hooks ×1 — with no KEEP test to extract); the previously-orphaned red spec no longer appears in the Playwright RUN.
- Playwright RUN after FE-2 shows this orphan is gone (not counted as a new red vs the t5 list, and not left stranded for a later wave).
    </success_criteria_addendum>
    <receipt_check_addendum>
      <item>reconcile orphan spec deleted whole (Compose+Browse CUT-coupled, no KEEP extraction) — provenance FE-1b §4B + AUD#2 cited</item>
    </receipt_check_addendum>
  </amendment>

  <unchanged>
    All other rev3 packets, dependency_order (FE-1a → FE-1b → FE-2 → FE-3 → FE-CAT → FE-4 → BE-1 → DOCS-1, serial), SCs, out_of_scope, and the human-approved deferrals stand as written in rev3. agent_count = 8. No-stub status unchanged (8 task_packets, all inline in rev3). FE-1b's classification of this file as an ORPHAN (its §4B) is now resolved by this FE-2 assignment — no FE-1b change needed.
  </unchanged>

</plan_amendment>

---

## Scope self-check
Single-file enumeration addition to FE-2's existing deletion list + context_files + receipt_check. No task_packet added/removed, no owner reassigned, no dependency edge changed, no data-contract change, no Critic re-gate. Within the SC-level amendment envelope.

## COMPLETE (amend-3)
Amendment: `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-amend3-PM-1783734397.md`.
Plan of record = rev3 + amend3. Disk-verified: the reconcile spec's 3 tests are all CUT-coupled (Compose ×2, Browse ×1) → whole-file delete assigned to FE-2. FE-2 dispatch unblocked.
