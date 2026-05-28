<commit_manifest>
  <task_id>prog-studio-sessions-2026-05-s1-backend-t4b</task_id>
  <generated>2026-05-20T18:26:40Z</generated>
  <commits>
    <commit>
      <sha>ae16993</sha>
      <subject>feat(server): add session tRPC router with multi-root list</subject>
      <staged_paths>
        <path>packages/server/src/router.ts</path>
        <path>packages/server/src/session-list.ts</path>
        <path>packages/server/src/parsers/__tests__/session-list.test.ts</path>
      </staged_paths>
      <audit_trailer>PASS</audit_trailer>
      <note>SA PASS / QA PASS / SX SECURE. Both original BLOCKER fixes verified: NEW-1b per-file try/catch + surfaced skipped count; NEW-2 composite (source_root,id) dedup (multi-root test: 2 roots same-named foo.md → 2 distinct entries). Auditor empirically rejected ../../etc/passwd and a sibling-prefix attack against the saveEdit guard (dual path.resolve). WARNING-2 response-shape asymmetry documented in code + commit. Only the import line modified among existing procedures (1 deletion). 30 tests pass.</note>
      <packet_source>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t4b-BE-1779301306.md</packet_source>
    </commit>
  </commits>
</commit_manifest>
