<ui_packet>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-t6a-editor-hooks</task_id>
  <agent_id>FE</agent_id>

  <files_created>
    - `packages/client/src/hooks/useSessionRaw.ts` (46 lines) — NEW
  </files_created>

  <files_verified_unchanged>
    - `packages/client/src/hooks/useSessionSave.ts` (34 lines) — existed from prior partial run; verified correct against spec; no changes made
  </files_verified_unchanged>

  <components_created>
    No React components. Data-layer hooks only.
    - packages/client/src/hooks/useSessionSave.ts — wraps trpc.session.saveEdit.useMutation()
    - packages/client/src/hooks/useSessionRaw.ts — wraps trpc.session.getRaw.useQuery()
  </components_created>

  <state_hydration_map>
    useSessionSave:
      - trpc.session.saveEdit.useMutation() → onSuccess(data): setLastSaveResult({ filePath: data.filePath }), setLastSaveError(null)
      - onError(err): setLastSaveError(err.message ?? String(err)); editBuffer is never touched

    useSessionRaw:
      - trpc.session.getRaw.useQuery({ id: id ?? '' }, { enabled: !!id }) → data.content
      - useEffect keyed on query.data:
          setOriginalContent(data.content)  — always
          setEditBuffer(data.content)       — only when editBuffer === '' (SC6 guard)
  </state_hydration_map>

  <sc6_confirmation>
    CONFIRMED. useSessionRaw checks `if (editBuffer === '')` before calling setEditBuffer.
    If the buffer already contains user edits, setEditBuffer is NOT called. Original content
    is always updated so diff/revert operations have the correct baseline.
  </sc6_confirmation>

  <sc7_confirmation>
    CONFIRMED. useSessionSave.onError sets lastSaveError only. editBuffer is explicitly NOT
    cleared. The comment `// editBuffer intentionally NOT cleared — SC7 requirement.` is
    present in the file.
  </sc7_confirmation>

  <a11y_verification>
    N/A — data-layer hooks only. No JSX, no interactive elements.
  </a11y_verification>

  <design_tokens_used>
    None — no UI output.
  </design_tokens_used>

  <style_conflict_check>NONE</style_conflict_check>

  <lint_result>
    Command: npm run lint (from repo root)
    Output: tsc --noEmit on shared + server + client — all clean
    Exit code: 0
    (Initial run produced TS2322 on Error | null vs TRPCClientErrorLike — fixed by using `unknown` for error return type, matching the pattern in useSessions.ts. Second run: exit 0.)
  </lint_result>

  <constant_audit>
    0 matches — no raw hex, no rgba, no inline style conflicts, no JSON.parse, no click-handler keyboard gaps (no JSX in either file).
  </constant_audit>

  <e2e_spec>TIER_1_ONLY — no new UI surface; data hooks only</e2e_spec>

  <integration_status>
    SUCCESS. Both hooks wire to confirmed tRPC procedures:
    - trpc.session.saveEdit — confirmed in packages/server/src/router.ts line 485
    - trpc.session.getRaw — confirmed in packages/server/src/router.ts line 503
    - SessionRawOutputSchema ({ content: string }) confirmed in packages/shared/src/schemas.ts line 104
    - Store setters (setOriginalContent, setEditBuffer, setLastSaveResult, setLastSaveError) confirmed in packages/client/src/store/session-store.ts
  </integration_status>

  <data_contract_verified>
    Grepped packages/shared/src/schemas.ts for SessionRawOutputSchema:
    Line 104: `export const SessionRawOutputSchema = z.object({ content: z.string() });`
    Field used in hook: `query.data.content` — confirmed correct.
  </data_contract_verified>
</ui_packet>
