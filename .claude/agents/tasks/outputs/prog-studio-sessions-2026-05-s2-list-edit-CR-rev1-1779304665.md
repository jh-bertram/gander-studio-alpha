<plan_critique>
  <plan_id>prog-studio-sessions-2026-05-s2-list-edit (rev1)</plan_id>
  <status>PASS</status>

  <round1_resolution_verification>
    All 2 BLOCKERS and 5 WARNINGS from round 1 are resolved. Verified against disk, not prose:

    BLOCKER 1 (ASSUMPTION — ModeContent dispatch): RESOLVED.
      ModeContent.tsx:7-12 confirms a zero-prop component-map (`PAGE_MAP[activeMode]` → `<ActivePage />`,
      no props) — exactly as rev1 describes. Option B correctly encoded: SessionsRouter.tsx (zero-prop,
      store-driven) is the single owner of the list/detail switch (t3b, lines 382-391); PAGE_MAP gets ONE
      new entry `sessions: SessionsRouter` with all existing entries byte-identical and no conditional
      escape hatch (t3b lines 405-417, must_not_contain at 471). SessionDetailPage is zero-prop and reads
      selectedSessionId from the store (t5a lines 691-694; out_of_scope at 762 forbids an id prop). Router
      ownership is assigned to exactly one packet (t3b). No reappearance of the round-1 blocker — escalation
      trigger NOT fired.

    BLOCKER 2 (OVERSCOPED — 4+-file FE rule): RESOLVED.
      Per-packet SOURCE-file counts: t3a=3 (ui-store, navigation, constants/sessions), t3b=3 (SessionsRouter
      + 2 stubs + ModeContent — see WARNING A below on the literal count), t4a=2, t4b=1, t5a=1, t5b=2, t6a=2,
      t6b=1. The e2e spec is exempted as a co-located test deliverable, and that lens is now stated
      EXPLICITLY for the auditor in dependency_order (lines 1167-1172). Every FE packet ≤3 source files.

    WARNING 1 (--ms): RESOLVED. --ms is absent from globals.css; --mp (#9b59b6) is confirmed present
      (globals.css:28 — plan says :29, harmless off-by-one) and is distinct from the four existing nav dots
      (--mt/--my/--mg/--mb per navigation.ts:10-13). t3a sets dotColor: 'var(--mp)' as the PRIMARY (not
      "fallback") instruction (lines 292-296). --ms removed from t1's token list.

    WARNING 2 (t2 collectSessions conflation): RESOLVED. session.get (router.ts:422-447) is confirmed an
      inline readdir loop over SESSIONS_SOURCE_DIRS that does NOT call collectSessions and returns on first
      id-OR-sprint match. t2 rev1 now says "mirror session.get's inline readdir scan VERBATIM (NOT
      collectSessions)" (lines 178-204) with id-OR-sprint matching stated. collectSessions explicitly
      excluded (out_of_scope 242, must_not_contain 261).

    WARNING 3 (Table tab): RESOLVED per human decision. t5b is the agent-activity table with the 9 columns
      (lines 812-818); the SC5 "seq/ts/agent/event" wording is documented as a brief-level artifact and the
      auditor is instructed not to fail for absent seq/ts/event columns (t5b lines 819-821; REQVAL flag at
      1231-1237; risk_flag SC5_COLUMN_WORDING_ARTIFACT at 1345-1350).

    WARNING 4 (no-remount check): RESOLVED. t5a asserts no-remount via DOM/state identity (stable
      data-testid="sessions-detail-page" + unchanged header text across Overview→Table→Overview), explicitly
      NOT network-request counting (lines 722-727; must_not_contain 783).

    WARNING 5 (e2e naming): RESOLVED. Renamed to
      packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts everywhere
      (t4b creates it, t5a/t5b/t6b extend it; dependency_order 1161-1165).
  </round1_resolution_verification>

  <new_split_soundness>
    Dependency chain (t1,t2 parallel → t3a→t3b→t4a→t4b→t5a→t5b→t6a→t6b): acyclic, no missing deps.
    Stub/replace handshakes are consistent:
      - t3b creates a minimal session-store.ts stub exporting useSessionStore returning { selectedSessionId }
        (lines 419-428); t4a REPLACES it with the full store using the SAME export name so SessionsRouter's
        import stays valid (lines 498, 515-516). The stub's surface (selectedSessionId only) covers exactly
        what t3b's SessionsRouter reads; t4a adds activeTab/editBuffer/etc. before t5a (first reader of
        activeTab) runs. Handshake is sound.
      - t3b creates SessionListPage/SessionDetailPage stubs (data-testids) → replaced by t4b/t5a.
      - t5a renders OverviewTab/TableTab/Editor stub panels → replaced by t5b/t6b.
      - t4b creates the e2e spec → extended t5a→t5b→t6b. Single-writer-per-wave serialization enforced by
        the dependency chain (dependency_order 1161-1165). create→extend→update→complete ordering consistent.
    BE contract checks: saveEdit output {success, filePath} (router.ts:486) matches t6a/t6b's data.filePath
      access (line 944) and {id, content} mutate input (line 1012). Textarea is a NAMED export `{ Textarea }`
      (textarea.tsx:25), consistent with t6b's named-import phrasing. session.getRaw {content:string} matches
      useSessionRaw's data.content access.
    SC coverage: SC1–SC10 all mapped (verbatim_deliverable_audit 1408-1462; expectation_manifest). No SC
      unmapped after the re-split.
    Over-serialization note (cost, not blocker): see WARNING B.
  </new_split_soundness>

  <challenges>

    <challenge>
      <type>OVERSCOPED</type>
      <severity>WARNING</severity>
      <task_ref>t3b-router-scaffold</task_ref>
      <description>
        t3b literally creates/touches 4 source files: SessionsRouter.tsx, SessionListPage.tsx stub,
        SessionDetailPage.tsx stub, ModeContent.tsx — plus a 5th if the session-store.ts stub is created
        (lines 419-428). The plan's own count says "3 files" by treating the two page stubs as one unit
        and not counting the session-store stub. By the strict mechanical 4-file-count rule that produced
        round-1 BLOCKER 2, t3b is at or over the line. It does NOT rise to a BLOCKER here because every file
        is a trivial scaffold (a ~15-line wrapper, two ~3-line placeholder divs, a 2-line PAGE_MAP edit, a
        5-line interface stub) — there is no substantive logic crossing cognitive contexts, which is the
        actual harm the rule guards against. But the PM's "3 files" label is an undercount the auditor may
        challenge.
      </description>
      <required_revision>
        Either (a) state the count honestly as 4-5 trivial scaffold files and justify the exception on the
        "all stubs/1-line edits, no substantive logic" basis the round-1 critique already accepted for the
        old t3, OR (b) move the session-store.ts stub into t4a's surface (t4a creates it fresh rather than
        replacing a t3b stub) and accept that t3b + t4a must then be audited as a pair so tsc passes — the
        plan already contemplates this at lines 421-423. Non-blocking; just make the count and the chosen
        lint-passes-when strategy explicit so the auditor applies the same lens.
      </required_revision>
    </challenge>

    <challenge>
      <type>DEPENDENCY</type>
      <severity>WARNING</severity>
      <task_ref>t6a-editor-hooks</task_ref>
      <description>
        t6a's declared dependency is t5b-tabs-overview-table (line 961), justified as "ensures the full
        stack is in place." t6a's ACTUAL code dependencies are only session-store.ts (t4a) and the t2
        getRaw/saveEdit contracts — it imports neither OverviewTab nor TableTab nor SessionDetailPage. The
        t5a→t5b→t6a links serialize hook-file creation behind tab-component work that is independent of it.
        This is over-serialization: a cost (longer critical path), not a correctness defect. The shared e2e
        spec does force t6b to run after t5b (t6b appends to the spec t5b last touched), so the SERIALIZATION
        is not eliminable for t6b — but t6a (two new hook files, no spec touch) could run as early as after
        t4a.
      </description>
      <required_revision>
        Optional. If sprint wall-clock matters, repoint t6a's dependency to t4a (its real dependency) and
        keep t6b dependent on both t6a and t5b (spec serialization). If the strict linear chain is preferred
        for simplicity/auditing, leave as-is and note that t6a is intentionally serialized for pipeline
        simplicity, not data dependency. No blocker either way.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>t2-be-raw</task_ref>
      <description>
        t2 instructs "mirror session.get's inline readdir scan" and lists session.get in context_files —
        correct. But the rev1 prose paraphrase (lines 186-189) says "Iterate SESSIONS_SOURCE_DIRS ... readdir,
        filter .md files" without naming the docs/post-mortems subdir join. The real session.get reads
        path.join(dir, 'docs', 'post-mortems') (router.ts:427), NOT the dir root. A BE agent who follows the
        paraphrase literally instead of copying session.get's actual loop would readdir the wrong directory
        and the real-corpus smoke would return NOT_FOUND for every id. The "VERBATIM" directive plus the
        source reference mitigate this, so it is a WARNING, not a blocker.
      </description>
      <required_revision>
        Add one clause to t2: "the per-dir scan path is path.join(dir, 'docs', 'post-mortems') exactly as
        session.get does (router.ts:427) — do NOT readdir the dir root." This removes the only ambiguity in
        the otherwise-correct VERBATIM instruction.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    Most likely to fail audit even if executed well:
    1. t2 getRaw scan path. If the BE agent reads SESSIONS_SOURCE_DIRS roots instead of the
       docs/post-mortems subdir (router.ts:427), the auditor's real-corpus smoke (SC, t2 line 229-230)
       returns NOT_FOUND and the packet fails despite clean lint. Pre-empted by WARNING above; the auditor
       smoke is the right gate to catch it.
    2. SC5 column wording — the seq/ts/event vs agent-activity-table mismatch is a documented false-FAIL
       trap; the REQVAL briefing (lines 1231-1237) must actually reach the auditor before the t5b audit,
       or a literal read fails t5b for "missing" columns.
    3. List→detail render seam (per gander-studio-p2-agent-cards §3 HCG-2): the no-remount + row-click e2e
       (t5a lines 716-727) asserts the detail-page DOM testid AFTER a real row click — good. Auditor should
       confirm the row-click handler actually fires setSelectedSessionId and the SessionsRouter store-read
       re-renders to the detail DOM (not just that the store mutated). The plan asserts DOM presence, which
       is the correct guard; verify it runs end-to-end.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Read/consulted for this re-review:
    - docs/post-mortems/prog-studio-sessions-2026-05-s1-backend.md (the two carried-forward patterns —
      "BE inline commit" and "plan named codebase-facts without on-disk verification" — are both addressed
      in rev1; I independently re-verified the codebase facts (ModeContent, --mp, session.get scan,
      saveEdit/getRaw contracts, textarea export) against disk rather than trusting the plan's claims).
    - docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md (§6 G3 recipe-vs-problem-naming —
      applied: the t2 scan-path WARNING names the problem and cites router.ts:427 rather than prescribing
      the full loop; §3 side-effect-as-proxy — confirmed t5a asserts detail-page DOM, not just store state).
    - Cross-referenced gander-studio-p2-agent-cards §5+§6 G1 (4+-file FE BLOCKER) — round-1 BLOCKER 2 is
      resolved; the residual t3b file-count is a WARNING (trivial scaffold), not a recurrence of the
      substantive-logic-across-4-files pattern.
    Escalation trigger (two-round Critic cap): NEITHER round-1 blocker reappears unresolved. No escalation.
  </post_mortem_patterns_checked>
</plan_critique>
