<audit_review>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-t6a-editor-hooks</task_id>
  <scope>
    packages/client/src/hooks/useSessionSave.ts (NEW)
    packages/client/src/hooks/useSessionRaw.ts  (NEW)
  </scope>

  <!-- ====================== 1. STANDARDS (SA) ====================== -->
  <standards target_file="packages/client/src/hooks/useSessionSave.ts" status="PASS">
    <violations/>
    <notes>
      - kebab/PascalCase N/A; camelCase hook name `useSessionSave` correct; file is data-layer .ts (no JSX) — correct extension.
      - Explicit typed return: { mutate: (input:{id:string;content:string})=>void; isLoading:boolean }. No `any`, no `as any`, no @ts-ignore.
      - Imports shared `trpc` from '../trpc' and shared `useSessionStore` from '../store/session-store' — no duplicate store creation (SC item 3).
      - No raw hex / rgba. No duplicated logic.
      - Contract: trpc.session.saveEdit output is { success:boolean, filePath:string } (router.ts:487). Hook reads data.filePath only — field exists, correct.
      - Store setter signatures match: setLastSaveResult({filePath:string}|null), setLastSaveError(string|null) (session-store.ts:17-18).
    </notes>
  </standards>

  <standards target_file="packages/client/src/hooks/useSessionRaw.ts" status="PASS">
    <violations/>
    <notes>
      - camelCase hook name `useSessionRaw` correct; .ts (no JSX) correct.
      - Explicit typed return: { isLoading:boolean; error:unknown }. `error: unknown` matches the established precedent in useSessions.ts:7/27 (no unjustified `any`; `unknown` is the standards-preferred type for external error data).
      - Imports shared `trpc` and shared `useSessionStore` — no duplicate store creation (SC item 3).
      - getRaw contract: input {id:z.string()} (router.ts:504), output SessionRawOutputSchema = { content:z.string() } (schemas.ts:104, router.ts:505). Hook reads query.data.content — field exists, correct.
      - { enabled: !!id } correctly gates the query; id ?? '' avoids passing null into the required string input.
      - No raw hex / rgba. The single eslint-disable on the effect dep array (line 40) is a justified, scoped, single-line disable matching the package's existing react-query v5 effect pattern (documented in the file's JSDoc).
      - This is a data-layer hook task: no NODE_TYPES/EDGE_TYPES/toRFNode/toRFEdge, no role=dialog/focus-trap, no Chart.js tooltip, no onClick on non-button elements, no createPortal/z-index. None of the FE SA render gates apply. No data.json key rename. No dashboard data-viz.
    </notes>
  </standards>

  <standards_summary status="PASS"/>

  <!-- ====================== 2. FUNCTIONALITY (QA) ====================== -->
  <test_report>
    <task_id>prog-studio-sessions-2026-05-s2-list-edit-t6a-editor-hooks</task_id>
    <status>PASS</status>
    <test_coverage>
      lint: `npm run lint` (repo root, tsc --noEmit x3) — exit code 0 (verified twice; second run captured true $? = 0).
      server unit/integration (vitest run src/parsers/__tests__): 4 files, 35 passed, 0 failed.
      Suite includes saveedit-security.test.ts (saveEdit path-traversal contract) and session-parser/session-list tests backing getRaw's source read — no regression in the contracts the hooks depend on.
    </test_coverage>
    <playwright>
      <tier>SKIPPED — data-layer React hooks; no new rendered UI surface, no NODE_TYPES/EDGE_TYPES/createPortal/z-index. Per task brief and e2e_spec=TIER_1_ONLY, e2e arrives in t6b.</tier>
      <tests_run>0</tests_run>
      <passed>0</passed>
      <failed>0</failed>
    </playwright>
    <sc6_verification>
      PASS. useSessionRaw.ts effect (lines 31-40): on query.data, setOriginalContent is called UNCONDITIONALLY (line 34); setEditBuffer is called ONLY inside `if (editBuffer === '')` (lines 37-39). User edits already present in the buffer are never overwritten. editBuffer initial value in store is '' (session-store.ts:25), so first load seeds correctly. Matches SC6 exactly.
    </sc6_verification>
    <sc7_verification>
      PASS. useSessionSave.ts onError (lines 24-27): sets lastSaveError = err.message ?? String(err); editBuffer is not referenced or cleared on any path. onSuccess (lines 20-23): sets lastSaveResult={filePath} and clears lastSaveError(null). Matches SC7 exactly. (Note: hook does not import setEditBuffer at all, so it is structurally incapable of clearing the buffer — strongest possible guarantee.)
    </sc7_verification>
    <defects/>
  </test_report>

  <!-- ====================== 3. SECURITY (SX) ====================== -->
  <security_audit>
    <status>SECURE</status>
    <threat_level>LOW</threat_level>
    <findings/>
    <notes>
      - No hardcoded secrets/credentials/tokens; no process.env, localStorage, document.*, window.location access.
      - No eval / Function / dangerouslySetInnerHTML / innerHTML.
      - No string-template interpolation into queries; inputs flow through tRPC+Zod (saveEdit input validated server-side; getRaw input validated server-side; saveEdit additionally guards path-traversal -> generic FORBIDDEN 'Path traversal detected', router.ts:493, so no filesystem path leaks into err.message).
      - Error handling: err.message is written to store state (lastSaveError) only — not logged, not transmitted, not rendered via innerHTML. No leak beyond store state (consistent with SC7 intent).
      - npm audit baseline unchanged (no new deps added by this task; pre-existing build-time-only workbox-build advisory is documented and out of scope).
    </notes>
  </security_audit>
</audit_review>

OVERALL VERDICT: SA=PASS  QA=PASS  SX=SECURE
