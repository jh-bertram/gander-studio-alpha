# Plan Amendment — gander-studio-p5b-progression-viz
**PM#0 amendment | 2026-06-01**
**Resolves:** 3 Critic WARNINGs (AUDIT_RISK × 1, ASSUMPTION × 1, OVERSCOPED × 1)
**Prior plan file:** `.claude/agents/tasks/outputs/gander-studio-p5b-progression-viz-PM-1780338308.md`

This is a targeted amendment only. The full task decomposition (3 tasks, 2 waves) stands unchanged. No tasks are added, removed, or reordered.

---

<plan_amendment sprint_id="gander-studio-p5b-progression-viz">

  <!-- ================================================================== -->
  <!-- WARNING 1 — AUDIT_RISK (p5b-002-be): SC6 vs SC7 case-5 contradiction -->
  <!-- ================================================================== -->
  <resolution warning="WARNING_1" task_id="p5b-002-be" type="sc_correction">

    **Finding:** SC6 mandates `ENOENT → TRPCError NOT_FOUND`. SC7 test case-5 says
    "file-not-found returns empty array OR throws" — ambiguous; an implementer could
    write a green test that returns `[]` and violates the SC6 behavior.

    **Precedent verified (router.ts lines 605–611, connectivityRouter):**
    ```
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Connectivity graph not found — run the analyzer first' });
      }
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Operation failed' });
    }
    ```
    ENOENT throws `NOT_FOUND`. Any other fs error throws `INTERNAL_SERVER_ERROR`. This is the single pinned behavior.

    **Corrected SC7 (replaces the prior SC7 in p5b-002-be):**

    > SC7: Vitest tests exist and pass: `npm test -w @gander-studio/server` exits 0 with ≥5 test
    > cases covering all scenarios below. **Test case-5 MUST assert that a missing ledger file
    > causes the procedure to throw a TRPCError with code `NOT_FOUND` — NOT return an empty
    > array.** The empty-array behavior is forbidden; it contradicts SC6 and the connectivityRouter
    > precedent.
    >
    > Required test cases:
    > 1. Happy path: ≥2 well-formed JSONL entries are returned correctly.
    > 2. sprint_id from JSONL (not header): an entry where the header text differs from the JSONL
    >    `sprint_id` returns the JSONL value.
    > 3. Malformed JSON entry is skipped; valid subsequent entries are still returned.
    > 4. Empty `xp_gained` array is accepted and the entry is returned.
    > 5. File-not-found: the procedure throws a TRPCError with `code: 'NOT_FOUND'`
    >    (matches connectivityRouter at router.ts lines 608–609). Returning `[]` fails this test.

    **No other change to p5b-002-be.** SC6 (`ENOENT → NOT_FOUND`) is confirmed correct and stands.

  </resolution>

  <!-- ================================================================== -->
  <!-- WARNING 2 — ASSUMPTION (sprint-wide): "5 entries" count hardcoded  -->
  <!-- ================================================================== -->
  <resolution warning="WARNING_2" task_id="sprint-wide" type="sc_clarification">

    **Finding:** The live ledger now has ≥6 entries (a 6th entry
    `agent-improvement-2026-06-01-capability-preflight` was appended after the PM's initial read).
    No SC uses `== 5` or `== 6`, but the description prose in p5b-002-be says "5 real entries"
    and the FE e2e spec asserts specific sprint_id strings — both need hardening against future growth.

    **Clarification 1 — p5b-002-be description (informational update):**
    The sentence "5 real entries" in the BE description is now stale. BE agent should treat the
    live ledger as having **≥5 entries** (the exact count is append-only and grows). The parser
    must handle any count ≥0. No SC asserts an exact entry count — this is confirmed safe.

    **Clarification 2 — p5b-002-be SC7 (count guard, added to corrected SC7 above):**
    No count-equality assertion (`== N`) may appear in any test that counts ledger entries. All
    entry-count assertions in server tests must use `>=` (e.g., `expect(entries.length).toBeGreaterThanOrEqual(2)`
    for the happy-path test). This is now a hard requirement of SC7.

    **Clarification 3 — p5b-003-fe SC7 (e2e sprint_id strings confirmed still valid):**
    The three confirmed sprint_id strings embedded in SC7 —
    `gander-meta-progression-design`, `gander-progression-p1-analyzer`, `gander-studio-graph-viz` —
    are still present in the live ledger (the 6th entry does not remove any of them; the ledger is
    append-only). SC7 remains valid as written. No change required.

    **Added note to FE description:**
    The e2e spec MUST NOT assert an exact count of visible sprint entries. Use assertions of the
    form "at least one sprint entry is visible" (`≥1`) and "contains text matching a known sprint_id".
    Any `count === N` assertion on rendered entries is forbidden.

  </resolution>

  <!-- ================================================================== -->
  <!-- WARNING 3 — OVERSCOPED (p5b-003-fe): 6 files, 120 estimated lines  -->
  <!-- ================================================================== -->
  <resolution warning="WARNING_3" task_id="p5b-003-fe" type="accepted_risk_with_gate">

    **Finding:** The FE task touches 6 files, raising concern about the standards' "50 lines of
    new code" verification-gate requirement (Gander Code Standards § Git). The Critic noted that
    3 of the 6 files are one-line edits.

    **Accepted risk rationale (GraphPage-twin pattern):**
    The 6-file count is accepted as appropriate. File breakdown:
    - `ui-store.ts` — 1 line (union extension: `| 'progression'`)
    - `ModeContent.tsx` — 1–2 lines (PAGE_MAP entry + import)
    - `navigation.ts` — 1 line (NAV_ITEMS entry object)
    - `progression.ts` (new) — ~15–25 lines of constants (surface labels, color tokens)
    - `ProgressionPage.tsx` (new) — ~80–100 lines (the bulk of new code)
    - `progression.spec.ts` (new) — ~25–35 lines (e2e spec)

    The three one-line nav-registration edits are proven boilerplate from the GraphPage precedent.
    They are not overscoped; they are the minimum required to wire a new page. The true new-code
    surface is `ProgressionPage.tsx` plus the two supporting files.

    **Standards compliance — verification gate:**
    The implementing agent does NOT self-commit. All commits are made by the Orchestrator
    post-audit. The auditor gate (SA + QA + SX all PASS) IS the verification gate required by
    the standards for >50 lines of new code. `ProgressionPage.tsx` reaches the auditor before
    any commit is made, satisfying the standard.

    **Added SC to p5b-003-fe (modular cap):**

    > SC10: `ProgressionPage.tsx` does not exceed 150 lines. If the component body would exceed
    > 150 lines, the FE agent must extract at least one sub-component (e.g., `SprintEntry.tsx`
    > or `SurfaceSummary.tsx`) into the same `pages/` directory and import it. This keeps the
    > main page component readable and within the standards' spirit. Verify:
    > `wc -l packages/client/src/pages/ProgressionPage.tsx` returns ≤ 150.

    **No task split required.** The 6 files are disjoint (no shared-write conflict), the three
    nav-registration edits are one-line each, and the audit gate is the verification gate.

  </resolution>

</plan_amendment>

---

## Summary of SC changes by task

| Task | SC | Change type | Summary |
|---|---|---|---|
| p5b-002-be | SC7 | CORRECTED | Case-5 now mandates TRPCError NOT_FOUND (not empty array); adds count `>=` guard for all entry-count assertions |
| p5b-003-fe | FE description | CLARIFICATION | e2e must not assert exact entry count; use `≥1` form |
| p5b-003-fe | SC10 (new) | ADDED | ProgressionPage.tsx ≤ 150 lines; extract sub-component if exceeded |
| p5b-003-fe | 6-file scope | ACCEPTED RISK | Documented as GraphPage-twin pattern; audit gate = verification gate for >50-line standard |
