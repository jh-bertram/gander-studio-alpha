# Requirements Coverage Report — prog-studio-v2-2026-07-s5-integration

Validator: RV#1 (Mode B — spawned subagent execution, independent context; sprint has 4
implementing task packets and one requirement required interpretation against a rail-denial
event, both Mode-B triggers). Skill: requirements-validate v1.1.6, Steps 1–4.

**Requirement sources (priority order used):**
1. PRIMARY (S7 verbatim intake): `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-human-request.md` — scope = program SC-2..SC-5 of the skein brief.
2. Program SC text: `docs/programs/prog-studio-v2-2026-07/sprints/integration/orchestrator_brief.md` §Success Criteria items 2–5.
3. PM decomposition + amendment (crosswalk authority): `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-PM-1784347058.md` + `...-amend1-PM-1784348182.md`.

**Crosswalk discipline:** all traceability below routes through the amend1 `<sc_crosswalk>`
(t1→PROGRAM SC-2, t2→SC-3, t3→SC-4, t4→SC-5). No local "SC-Nx" label was string-matched to a
program SC number. Program SC-1 is DISCHARGED pre-sprint (human-ratified 2026-07-18) and is NOT
re-validated here; its record was existence-verified — `docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md:348`
`## Addendum — SC-5 Amendment Human Ratification (2026-07-18)` is present on disk.

## Step 1 — Extracted Requirements

<requirement_list>
  <requirement id="R-001" type="success_criterion"><!-- program SC-2, clause 1 (residue 1) -->
    A `ui/` Dialog (and Popover if applicable) wrapper exists hard-defaulting the safe focus
    pattern — function-form `initialFocus` resolving `ref.current ?? false`, optional post-mount
    `focusOnReady`.
  </requirement>
  <requirement id="R-002" type="success_criterion"><!-- program SC-2, clause 2 -->
    `ReviseSpecAction.tsx` migrated to consume the wrapper (inline copy removed, behavior preserved).
  </requirement>
  <requirement id="R-003" type="success_criterion"><!-- program SC-2, clause 3 (runtime) -->
    Existing dialog e2e tests (incl. the s3 absorption suite 8/8) stay green.
  </requirement>
  <requirement id="R-004" type="success_criterion"><!-- program SC-3 (residue 2, runtime) -->
    RelationshipPanel verified legible at half width with either re-tuned constants or a recorded
    explicit accept.
  </requirement>
  <requirement id="R-005" type="success_criterion"><!-- program SC-4, clause 1 (residue 3) -->
    Hygiene sweep: named dirs/files removed (empty `packages/client/src/components/{browse,edit,graph}/`
    dirs; `quickcheck{,2}.mjs` scratch files).
  </requirement>
  <requirement id="R-006" type="success_criterion"><!-- program SC-4, clause 2 -->
    All four stale comments corrected (AppShell.tsx 6–9; program-dag-parser.test.ts 197–203;
    v2-design-spec.md ~324; router.ts STUDIO_ROOT comment) — per amend1 WARNING 4, the test-file
    fix must rewrite the whole 197–203 block coherently, not just the token.
  </requirement>
  <requirement id="R-007" type="success_criterion"><!-- program SC-4, clause 3 -->
    `npm run lint` ×3 packages + client build green.
  </requirement>
  <requirement id="R-008" type="success_criterion"><!-- program SC-5, clause 1 (residue 4a) -->
    `docs/deferred-work.md` carries the party-stats Accuracy family-grouping approximation row
    (sprintRoot family cross-resolving a same-role FAIL/PASS across tasks), ledger-format-conformant,
    non-colliding tag.
  </requirement>
  <requirement id="R-009" type="success_criterion"><!-- program SC-5, clause 2 (residue 4b) -->
    The guarded-push docs-vs-installed-rail contradiction is flagged in the reflect-pass intake,
    NOT edited here (cross-repo; no fix attempted from this repo).
  </requirement>
  <requirement id="R-010" type="constraint"><!-- brief scope-discipline paragraph + packet constraints -->
    Scope discipline: the 7 human-ratified deferrals and the 14 gander-side process items stay OUT
    of scope; zero edits under `/home/jhber/projects/gander/`; no new tRPC procedures, Zod schemas,
    or routes.
  </requirement>
</requirement_list>

## Steps 2 / 2.5 — Evidence Mapping and Runtime Verification

All file-level claims below were re-verified on disk by this validator (Read/Grep/Bash), not
packet-trusted, in addition to the auditor's independent verification (AUDIT_PASS v2.0,
`.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-AUD-1784349688.md`).

<requirements_coverage_report>
  <task_id>prog-studio-v2-2026-07-s5-integration</task_id>
  <generated>2026-07-18T04:59:59Z</generated>
  <overall_status>PARTIAL</overall_status>

  <coverage>
    <item id="R-001" status="COVERED">
      <requirement>ui/ Dialog (and Popover if applicable) wrapper hard-defaulting the safe focus pattern (function-form initialFocus resolving ref.current ?? false; optional post-mount focusOnReady).</requirement>
      <evidence>
        Validator-verified on disk: `packages/client/src/components/ui/dialog.tsx:61-62` —
        `const resolvedInitialFocus = initialFocus ?? (focusTargetRef ? () => focusTargetRef.current ?? false : undefined)`,
        passed to `DialogPrimitive.Popup` at :69 (grep initialFocus=5, `?? false`=1; PM-verified baseline was 0/0).
        `packages/client/src/components/ui/use-dialog-safe-focus.ts` (44 lines, validator-read in full):
        reset-on-close `useEffect` (:26-30) + once-per-open deterministic `useLayoutEffect` (:32-43)
        guarded by `hasFocusedOnOpenRef` — the focusOnReady mechanism, wired into `DialogContent` at
        dialog.tsx:59. Popover clause discharged via the sanctioned ACCEPT (ii) path: zero consumers
        (t1 packet grep, re-verified: `popover.tsx` grep initialFocus=0, unchanged), evidence-backed
        accept recorded in t1 ui_packet `<popover_decision>` — t1-FE-1784348388.md:207-213.
      </evidence>
    </item>

    <item id="R-002" status="COVERED">
      <requirement>ReviseSpecAction.tsx migrated to consume the wrapper.</requirement>
      <evidence>
        Validator-verified: `grep -c 'hasFocusedOnOpenRef' packages/client/src/components/detail/ReviseSpecAction.tsx` = 0
        (baseline 5); wrapper API consumed at ReviseSpecAction.tsx:156-157
        (`focusTargetRef={textareaRef}` / `focusOnReady={readyToFocus}`); remaining `initialFocus`/
        `focusOnReady` mentions at :49/:90 are explanatory comments, not the inline prop (matches
        auditor per-file review). `finalFocus={triggerRef}` preserved (explicit, out of default scope).
        Behavior preservation covered by R-003's live run.
      </evidence>
    </item>

    <item id="R-003" status="COVERED">
      <requirement>Existing dialog e2e tests (incl. the s3 absorption suite 8/8) stay green.</requirement>
      <evidence>
        RUNTIME criterion (Step 2.5) — satisfied by a live auditor-run execution, not file evidence:
        AUD-1784349688.md &lt;playwright tier="2"&gt; — auditor ran
        `npx playwright test tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` from
        `packages/client` → observed **8 passed / 8 total** (21.9s), matching s5 baseline-green 8/8.
        Spec path: `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts`; PROOF 3a
        (spec :158) exercises the revise-dialog cold-open focus path — a DOM-interaction assertion,
        not a side-effect proxy — so this run is the real functional guard for the t1 focus
        migration (amend1 WARNING 3 mandatory-execution binding was honored). Additionally the
        auditor's authoritative SERIAL full-suite run: 84 passed / 41 failed vs baseline 82g/43r,
        with comm-reconciled red-key sets → ZERO green→red regressions (two baseline-red tests now
        green). Implementer flake claims (s2-d3-session-buffer:151, s2-party-shell:252) were
        adjudicated by the auditor's serial run — both deterministically green serially, neither
        induced by t1/t2.
      </evidence>
    </item>

    <item id="R-004" status="COVERED">
      <requirement>RelationshipPanel verified legible at half width with either re-tuned constants or a recorded explicit accept.</requirement>
      <evidence>
        DECISION = RETUNE, recorded unambiguously (t2-FE-1784348388.md §DECISION). Validator-verified
        on disk: `RelationshipPanel.tsx:41-42` — `RELATIONSHIP_NODE_WIDTH = 150`,
        `NODE_HORIZONTAL_GAP = 150` (old 180/220); `NODE_VERTICAL_GAP = 76` and
        `CANVAS_HEIGHT_PX = 240` unchanged; RF v12 `&lt;Handle&gt;` elements intact at :149 (target)
        and :187 (source). RUNTIME/visual criterion (Step 2.5): screenshot evidence exists and was
        independently viewed by the auditor —
        `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t2-PM-typical-halfwidth.png`
        (labels + DETECTED badge + legend legible post-retune) and `...-t2-ORC-worstcase-halfwidth.png`
        (validator confirmed both files on disk, 14122/21923 bytes); quantified measurements: fitView
        scale 0.735→0.98, effective label font ~8.08px→~10.78px at half width, 0/26 labels truncated
        (ORC corpus). DOM-level coverage: s3-drilldowns PROOF 2 (spec :125, visible RF edge + legend)
        green in the auditor's 8/8 run. The final human visual check happens at Step 4.5 regardless
        (see notes) — evidence bar for COVERED is met; this is not a REQUIRES_HUMAN_VISUAL gap.
      </evidence>
    </item>

    <item id="R-005" status="PARTIAL">
      <requirement>Hygiene sweep: named dirs/files removed.</requirement>
      <evidence>
        What exists: t3 discharged its enumerate-only obligation in full — the THREE empty dirs
        (`browse/`, `edit/`, `graph/`) enumerated as `rmdir` targets for ORC with emptiness evidence
        (t3-FE-1784348388.md §B), zero deletion commands run by any agent; `quickcheck{,2}.mjs`
        verify-absent recorded (§C: `find . -name 'quickcheck*.mjs'` → nothing) and auditor-confirmed
        — the named FILES clause is fully discharged (nothing existed to remove; no deletion was
        invented). ORC attempted GATE-ORC-DELETE and surfaced the denial correctly (event log
        verbatim, seq 18, `docs/events/agent-events-2026-07-18.jsonl`: "GATE-ORC-DELETE: rmdir DENIED
        by permission rail... NO side-door attempted... routed to HUMAN").
      </evidence>
      <gap>
        REQUIRES_HUMAN — the "named dirs removed" END-STATE is not yet true on disk: validator-run
        `ls packages/client/src/components/` at report time still lists `browse`, `edit`, `graph`.
        Verbatim known-deferred statement (supplied per spawn brief): program SC-4's "named dirs
        removed" sub-clause is PENDING-HUMAN-EXECUTION — ORC's `rmdir` of
        `packages/client/src/components/{browse,edit,graph}` was DENIED by the permission rail
        (event seq 18, `docs/events/agent-events-2026-07-18.jsonl`) and routed to the human per the
        deletion-rail-integrity standard; t3 discharged its enumerate-only obligation and the removal
        has zero git-commit impact (empty dirs are untracked).
        Exact command for the human:
        `rmdir /home/jhber/projects/gander-studio-alpha/packages/client/src/components/browse /home/jhber/projects/gander-studio-alpha/packages/client/src/components/edit /home/jhber/projects/gander-studio-alpha/packages/client/src/components/graph`
        CLASSIFICATION RATIONALE: the SC text is a state-of-the-world criterion ("removed"), not a
        process criterion — the correct routing of the denial satisfies the deletion-rail-integrity
        STANDARD but does not make the required state true, so COVERED would be a false positive.
        PARTIAL with a REQUIRES_HUMAN gap is the honest disposition. The gap_fill owner is
        HUMAN-at-Step-4.5, NOT an implementing agent: re-routing to an agent would demand the agent
        either hit the same rail or side-door it — the exact protocol violation the standard forbids.
      </gap>
    </item>

    <item id="R-006" status="COVERED">
      <requirement>All four stale comments corrected (incl. amend1 SC-3b whole-block coherence).</requirement>
      <evidence>
        Validator-verified on disk, all four token greps = 0 AND corrected text read directly:
        (a) `packages/client/src/AppShell.tsx:6-10` — grep '9-tab'=0; rewritten header describes
        BottomTabBar as the &lt;640px fold of the same RAIL_ITEMS nav, "NOT a retired fallback nav".
        (b) `packages/server/src/parsers/__tests__/program-dag-parser.test.ts:197-202` — grep
        'exportRouter.spawn'=0 AND (amend1 two-part check, part ii) the whole block rewritten as
        "(historical) export.spawn containment guard — REMOVED", citing s4 BE-1; no sentence presents
        the removed guard as live. (c) `docs/v2-vision/v2-design-spec.md:324` — grep 'Party screen
        submenus'=0; line now reads `aria-label="Main navigation"`. (d) `packages/server/src/router.ts:45-47`
        — grep 'Planning and program.md'=0; STUDIO_ROOT comment now references only the live
        `program.md` role. Corrected block texts quoted verbatim in t3-FE-1784348388.md §A.
      </evidence>
    </item>

    <item id="R-007" status="COVERED">
      <requirement>npm run lint ×3 packages + client build green.</requirement>
      <evidence>
        AUD-1784349688.md &lt;gate_checks&gt; — auditor RE-RAN (not packet-trusted): canonical
        3-package tsc (shared/server/client) all exit 0; `npm run build -w @gander-studio/client`
        success, max chunk `index-BMKtIo8a.js` 407.00 kB (gzip 120.62 kB), no Vite chunk-size
        warning, under the 1 MB per-chunk gate. Corroborated independently in all three
        code-touching packets (t1 §Lint+build, t2 §SC-2d, t3 §verification).
      </evidence>
    </item>

    <item id="R-008" status="COVERED">
      <requirement>docs/deferred-work.md carries the Accuracy family-grouping approximation row.</requirement>
      <evidence>
        Validator-verified on disk: `docs/deferred-work.md:124` — `### DEFERRED-V2S1-3 — party-stats
        Accuracy metric's sprintRoot-family grouping can cross-resolve a same-role FAIL/PASS across
        different tasks (accepted approximation)`, with the Source / What it is / Why deferred /
        Schedule as body block (:126-129) matching the ledger's existing entry format; mentions
        Accuracy (grep -ci = 2), sprintRoot-family grouping, and cross-resolve of a same-role
        FAIL/PASS across tasks. Tag verified non-colliding against the full existing tag census
        (t4-FE-1784348388.md &lt;tag_chosen&gt;). Append-only; no prior row reformatted (auditor SA
        per-file review).
      </evidence>
    </item>

    <item id="R-009" status="COVERED">
      <requirement>Guarded-push contradiction flagged in the reflect-pass intake, not edited here.</requirement>
      <evidence>
        Validator-verified on disk: `docs/deferred-work.md:187` — `## Cross-repo reflect-pass intake
        flags` section; :194 — `**FLAG (cross-repo, do-not-fix-here): guarded-push
        docs-vs-installed-rail contradiction**` owned by the gander-side reflect/agent-improvement
        pass, surfaced from this sprint (residue 4b). "Not edited here" honored: zero files under
        `/home/jhber/projects/gander/` changed (t4 packet SC-4c + auditor gate_checks: "No file under
        /home/jhber/projects/gander/ changed"); no fix attempted — flag only. The in-repo flag is the
        correct handoff channel (the gander reflect pass PULLs sibling-project artifacts read-only).
      </evidence>
    </item>

    <item id="R-010" status="COVERED">
      <requirement>Scope discipline: 7 ratified deferrals + 14 gander-side process items untouched; no gander-repo edits; no new tRPC procedures/Zod schemas/routes.</requirement>
      <evidence>
        AUD-1784349688.md &lt;sx&gt;: "No new tRPC procedure / Zod schema / route / user-input
        boundary (router.ts diff is comment-only...)"; &lt;gate_checks&gt;: sprint edit surface
        confined to the four packets' declared files, no gander-repo change, no package.json/lock
        change. Diff scope: focus refactor (t1) + two layout constants (t2) + comment text (t3) +
        ledger append (t4) — none touches a ledgered deferral's subject or a gander-side process
        item. All four packets carry explicit out_of_scope confirmations.
      </evidence>
    </item>
  </coverage>

  <summary>
    <covered_count>9</covered_count>
    <partial_count>1</partial_count>
    <missing_count>0</missing_count>
  </summary>

  <notes>
    1. SC-1 precondition check (not re-validated per spawn brief): the ratification record EXISTS —
       `docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md:348` "## Addendum — SC-5 Amendment
       Human Ratification (2026-07-18)".
    2. Crosswalk: all mappings routed via amend1's authoritative table (t1→SC-2, t2→SC-3, t3→SC-4,
       t4→SC-5); no local SC-label string-matching was used.
    3. R-004 human walkthrough: legibility is ultimately a human-visual judgment. The evidence bar
       for COVERED is met (measured px dimensions + two screenshots + auditor visual confirmation +
       green DOM-assertion suite), but ORC should surface the two half-width screenshots
       (`...-t2-PM-typical-halfwidth.png`, `...-t2-ORC-worstcase-halfwidth.png`) in the Step-4.5
       human walkthrough, which happens regardless per the sprint plan.
    4. Out-of-scope findings surfaced by t2, correctly NOT acted on and NOT coverage gaps:
       (a) the width-INDEPENDENT ORC 26-node vertical-overflow / minZoom-0.5-floor condition
       (pre-existing, requires canvas-height or algorithm change — candidate for a future
       deferred-work row); (b) the empty untracked `packages/client/.claude/tasks/outputs/` dir left
       by t2's evidence script (its rmdir was rail-denied and correctly surfaced, not side-doored) —
       the human may fold its removal into the same rmdir pass as R-005.
    5. No brief-underspecification flag: 10 requirements extracted (≥3).
    6. Step 2.6 (stochastic-outcome): not applicable — no SC in this set asserts a stochastic
       outcome; the e2e criteria are baseline-relative deterministic gates and were adjudicated
       serially by the auditor.
  </notes>

  <requires_human_visual>false</requires_human_visual>
</requirements_coverage_report>

## Step 4 — Routing

overall_status = PARTIAL → one gap_fill_request. Per the skill, this does NOT re-open the auditor
(AUDIT_PASS stands; the gap is not a code-quality failure — it is a rail-gated human-owned
removal). Deviation from the skill's BE|FE|DS owner enum, justified: assigning an implementing
agent would require that agent to either hit the same permission-rail denial or side-door it —
the exact class the deletion-rail-integrity standard (standards.md §Security Baseline,
human-ratified 2026-07-12) forbids. The sanctioned owner is the HUMAN at Step 4.5.

<gap_fill_request>
  <task_id>prog-studio-v2-2026-07-s5-integration-gap-R-005</task_id>
  <priority>BLOCKER</priority>
  <agent>HUMAN (Step 4.5 — deletion-rail-integrity routing; NOT an implementing agent)</agent>
  <requirement_id>R-005</requirement_id>
  <requirement_text>Hygiene sweep complete: named dirs/files removed (program SC-4, residue 3).</requirement_text>
  <gap>The three enumerated empty dirs are still on disk. Human executes:
  `rmdir /home/jhber/projects/gander-studio-alpha/packages/client/src/components/browse /home/jhber/projects/gander-studio-alpha/packages/client/src/components/edit /home/jhber/projects/gander-studio-alpha/packages/client/src/components/graph`
  (optionally also `rmdir /home/jhber/projects/gander-studio-alpha/packages/client/.claude/tasks/outputs` and its now-empty parents for t2's transient debris, per notes item 4b).
  Zero git-commit impact: empty dirs are untracked. After execution, SC-3g / the SC-4 sub-clause closes with no re-audit needed beyond an `ls` confirmation.</gap>
  <already_present>t3's full enumeration with emptiness evidence (t3-FE-1784348388.md §B); the quickcheck{,2}.mjs verify-absent record (§C); all four comment corrections; lint×3 + build green; ORC's correctly-surfaced rail denial (event seq 18, 2026-07-18). Nothing for an agent to redo.</already_present>
</gap_fill_request>

Sprint-close condition: R-005 reaches COVERED when the human runs the rmdir above (or explicitly
accepts the dirs remaining, which would be a recorded human decision superseding the SC text).
All other 9 requirements are COVERED now.
