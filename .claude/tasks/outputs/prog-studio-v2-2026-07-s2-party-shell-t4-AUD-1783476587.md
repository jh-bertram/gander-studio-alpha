# Audit Verdict — prog-studio-v2-2026-07-s2-party-shell-t4

Auditor working notes precede the typed block. Envelope selection: task_id first SPAWN =
2026-07-08T01:58:42Z (UTC) → POST-cutover (>= 2026-05-28) → v2.0 typed wrapper (mechanical,
date-governed). Provenance marker mandatory.

## Evidence excerpts
- LINT `npm run lint` (tsc --noEmit ×3 shared/server/client): exit 0, no diagnostics.
- VITEST `npm test -w @gander-studio/client`: 6 files, 37/37 passed (incl. PartyPage.test.ts —
  10 helper cases: derivePartyGridState ×4, computeMostRecentActivityTs ×2, formatScopeSummary ×2,
  formatPartyError ×2). 0 failed, 0 skipped.
- BUILD `npm run build -w @gander-studio/client`: exit 0, 2504 modules; main chunk
  dist/assets/index-*.js = 1,035.70 kB (gzip 316.30). See QA note QA-N1 (pre-existing/program-level).
- LIVE `curl :3001/trpc/roster.getParty`: 200, envelope {members[13], diagnostics{...}, activityAnchor}
  — shape matches PartyStatsSchema exactly (members[].{code,roleCategory,materiaColorKey,stats,...},
  diagnostics.{invalidLineCount,uncountedEventTypes,...}, activityAnchor). Hook expectations satisfied.
- VISUAL_BLINDSPOT_PRIMITIVE: PartyPage imports ui/* (Button, ErrorState, ShimmerBox). Shadcn semantic
  tokens are explicitly mapped to FF7 in globals.css (--primary→--mt, --primary-foreground→--void 8.12:1,
  --foreground→--w 21:1, --muted→--sfm, --border→--bd). No invisible-text blindspot. SATISFIED.
- Tier-1 Check A (silent-substitution): diagnostics.invalidLineCount/uncountedEventTypes SURFACED via
  showDiagnostics footnote (not swallowed); error/empty/loading/default are mutually exclusive in
  derivePartyGridState with react-query precedence loading>error>empty>default. See SA-N1.
- Scope: t5 wiring (ModeContent PAGE_MAP + ui-store AppMode/default) already on disk (M) — landed by
  FE#5 (seq 44 SPAWN / seq 46 COMPLETE) AFTER FE#4 completed; NOT a t4 scope leak (t4's 3 files remain
  untracked/unmodified). Observation ORC-O1 for orchestration awareness only.

<audit_verdict schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s2-party-shell-t4</task_id>
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <auditor_spawn>
    <agent_id>AUD#4</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#4</independent_from>
  </auditor_spawn>
  <inputs>
    <input path="packages/client/src/hooks/useParty.ts" sha256="bbe660cb9e94d0d02367d7a9b1268f50283738e05478420b69ab70c05683f01d"/>
    <input path="packages/client/src/pages/PartyPage.tsx" sha256="762bd4033bd488f51f55c696d95631cfc0f60a0fceaf9c501bd9a9459b8db31a"/>
    <input path="packages/client/src/pages/__tests__/PartyPage.test.ts" sha256="085695a98bca04b505fb652586799c9f12e5009d679c032177461caa19cb80d7"/>
  </inputs>

  <sa status="PASS">
    <target_file>packages/client/src/hooks/useParty.ts</target_file>
    <target_file>packages/client/src/pages/PartyPage.tsx</target_file>
    <target_file>packages/client/src/pages/__tests__/PartyPage.test.ts</target_file>
    <checks>
      <check name="z.infer envelope, no re-declared shape" result="PASS">PartyStats imported from
        @gander-studio/shared (z.infer&lt;typeof PartyStatsSchema&gt;); useParty wraps it in a PartyData
        return interface (hook-return wrapper, NOT a re-declaration of the envelope). SC6 met.</check>
      <check name="FF7 tokens explicit; zero raw hex" result="PASS">grep of #hex on both source files =
        0 matches. All colors via var(--w/--wm/--wd/--mt/--sf/--bd/--radius). SC5 met.</check>
      <check name="W2 spec-primitive substitution recorded verbatim" result="PASS">Card→PartyMemberCard,
        Badge→RoleTag, Progress→StatBar, Skeleton→shimmer-box, Alert→error-state + central FF7-collision
        rationale, marked Critic-RATIFIED — present verbatim in PartyPage header comment and packet.</check>
      <check name="VISUAL_BLINDSPOT_PRIMITIVE (ui/* imports)" result="PASS">Button/ErrorState/ShimmerBox
        consumed; Shadcn semantic tokens mapped to FF7 in globals.css (--primary→--mt,
        --primary-foreground→--void, --foreground→--w). No invisible-text risk.</check>
      <check name="diagnostics surfaced not swallowed" result="PASS">showDiagnostics footnote renders
        invalidLineCount + uncountedEventTypes when either &gt;0; xs/--wm, block-level below grid,
        non-obstructing. SC4 met.</check>
      <check name="4 grid states mutually exclusive" result="PASS">derivePartyGridState: loading&gt;error&gt;
        empty&gt;default single-select; consumed via 4 exclusive &amp;&amp; branches in JSX. SC3 met.</check>
      <check name="a11y" result="PASS">h1 title + aria-hidden rule; empty-state role=status + h2 + CTA
        Button; error reuses error-state role=alert + composed Retry Button; loading aria-busy + sr-only,
        decorative cards aria-hidden; rail hidden lg:flex removes from tab order at mobile; no non-button
        onClick.</check>
    </checks>
    <violations/>
    <notes>
      <note id="SA-N1" severity="LOW" non_blocking="true">derivePartyGridState maps members===undefined
        to 'empty' (same as members.length===0). Under react-query semantics the undefined-while-not-loading
        -not-error state is effectively unreachable (data is defined once settled), and the empty copy is
        neutral, so no user is misled and the load-bearing distinctions (loading/error/zero-members) are
        preserved. Check A's real target — diagnostics swallowing — does NOT occur. Non-blocking; note for
        future hardening only.</note>
    </notes>
  </sa>

  <qa status="PASS">
    <task_id>prog-studio-v2-2026-07-s2-party-shell-t4</task_id>
    <test_coverage>unit 37 passed, 0 failed (6 files; PartyPage.test.ts = 10 new helper cases)</test_coverage>
    <lint>tsc --noEmit ×3 (shared/server/client) exit 0, clean</lint>
    <build>vite build exit 0, 2504 modules — see QA-N1</build>
    <live_api>
      <procedure>roster.getParty</procedure>
      <result>200; envelope {members[13], diagnostics{invalidLineCount:1, uncountedEventTypes:27,...},
        activityAnchor} matches PartyStatsSchema — useParty expectations confirmed against live server.</result>
    </live_api>
    <playwright>
      <tier>SKIPPED</tier>
      <justification>Legitimate under audit-pipeline §2.3. t4 ships NO .spec.ts; adds NEW page/hook +
        NEW state consumers (setActiveMode/setSelectedAgentCode read, no existing selector rewired), so
        it is not a store-selector-rewire trigger. All interaction-class SCs (rail nav, popover, keyboard
        tab order, rendered loading/empty/error states) are t6's owned Tier-2 CLI-Playwright deliverable;
        the auditor MCP set is read-only and cannot drive them.</justification>
    </playwright>
    <defects/>
    <notes>
      <note id="QA-N1" severity="MEDIUM" non_blocking="true" scope="pre-existing / program-level">
        Bundle-size gate: main chunk dist/assets/index-*.js = 1,035.70 kB exceeds the 1000 kB auditor
        gate. ATTRIBUTION: this is a PRE-EXISTING, cumulative program-level condition (documented Known
        Issue; monolithic React + React Flow + tRPC + Zustand + 10 page surfaces vendor chunk), NOT a t4
        regression — t4 adds only a small page+hook and cannot resolve a vendor chunk (the gate's own
        remediation, dynamic-import/vendor-chunking via vite manualChunks, is outside t4's file scope).
        Blocking t4 would deadlock the sprint on an unfixable-within-scope item and punish the wrong task
        (scope-discipline + false-positive-avoidance). DISPOSITION: RAISED to ORC/PM as a dedicated
        follow-on chunking task; NON-BLOCKING to this verdict.</note>
    </notes>
  </qa>

  <sx status="SECURE">
    <threat_level>LOW</threat_level>
    <findings/>
    <checks>
      <check name="hardcoded secrets" result="PASS">grep (secret/token/apiKey/password/process.env/
        localStorage) on both files = 0 matches.</check>
      <check name="dangerous sinks" result="PASS">no dangerouslySetInnerHTML/innerHTML/eval/new Function;
        all text rendered as escaped JSX children.</check>
      <check name="error message leakage" result="PASS">formatPartyError surfaces only error.message
        (or String(error)) — no stack trace, no server-internal/secret exposure; roster.getParty is a
        no-input corpus read, so error strings are generic. Acceptable client-facing error copy.</check>
      <check name="new dependencies" result="PASS">no new deps introduced (imports: shared type, trpc,
        one tree-shaken lucide icon, local components).</check>
    </checks>
  </sx>

  <observations>
    <observation id="ORC-O1" audience="ORC" severity="INFO">t5 shell wiring (ModeContent PAGE_MAP entry
      party:PartyPage + ui-store AppMode 'party' union member + initial activeMode:'party') is already on
      disk (ModeContent.tsx/ui-store.ts show as M), landed by FE#5 (event-log seq 44 SPAWN / 46 COMPLETE)
      AFTER FE#4's completion. t4's three files remain untracked and unmodified — NOT a t4 out-of-scope
      leak. Flagged only for orchestration awareness that t5 ran ahead of t4's audit close.</observation>
  </observations>

  <overall_status>PASS</overall_status>
</audit_verdict>
