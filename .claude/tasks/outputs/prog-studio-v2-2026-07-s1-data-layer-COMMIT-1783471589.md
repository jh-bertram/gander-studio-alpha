<commit_record schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s1-data-layer</task_id>
  <generated>2026-07-08T00:46:29+00:00</generated>
  <provenance_marker>commit-packet@2.0.0</provenance_marker>
  <inputs>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t1-BE-1783467894.md" sha256="ce4331dce68f3839…"/>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t2-BE-1783468376.md" sha256="66d8b5a975be0280…"/>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t3-BE-1783469229.md" sha256="d2f2d49c0c9c27e6…"/>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t4-BE-1783469923.md" sha256="2e37ea41b756671f…"/>
    <audit_verdict path=".claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t1-AUD-1783468376.md" sha256="6c91578a014c52d1…"/>
    <audit_verdict path=".claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t2-AUD-1783469229.md" sha256="8bcd524e0dbb209d…"/>
    <audit_verdict path=".claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t3-AUD-1783469923.md" sha256="0d97dc52ffc9063c…"/>
    <audit_verdict path=".claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t4-AUD-1783470877.md" sha256="7070e5e7adf3496e…"/>
  </inputs>
  <branch_type>two-commit</branch_type>
  <preflight_checks>
    <secret_pattern_grep>CLEAN</secret_pattern_grep>
    <pre_stage_scope_check>PASS (per-packet scoped adds; router.ts cross-task bundling t3/t4 documented in both commit bodies per the Cross-Task File Bundling rule)</pre_stage_scope_check>
    <out_of_packet_classification><path status="benign-orchestration" reason="ceremony commit follows"/></out_of_packet_classification>
  </preflight_checks>
  <commits>
    <commit><sha>b7714862b4c3300069844c6548ebf295824bf63d</sha><subject>feat(v2-data): add v2 party/agent-detail Zod schemas + canonical ROSTER catalog</subject><staged_paths><path>packages/shared/src/schemas.ts</path><path>packages/server/src/parsers/agent-role.ts</path><path>packages/server/src/parsers/__tests__/agent-role.test.ts</path></staged_paths><trailers><task>prog-studio-v2-2026-07-s1-data-layer-t1</task><audit>PASS</audit></trailers></commit>
    <commit><sha>ab0c00eb0edc3aa35f6e762250f68405edb33ee8</sha><subject>feat(v2-data): add event derivations</subject><staged_paths><path>packages/server/src/parsers/event-log-parser.ts</path><path>packages/server/src/parsers/party-stats.ts</path><path>tests+fixtures</path></staged_paths><trailers><task>prog-studio-v2-2026-07-s1-data-layer-t2</task><audit>PASS</audit></trailers></commit>
    <commit><sha>bd281c32ed496318bbf573a117f213894c4bb777</sha><subject>feat(v2-data): add party assembly + roster.getParty (router bundled w/ t4 share)</subject><staged_paths><path>packages/server/src/parsers/party-roster.ts</path><path>packages/server/src/router.ts</path><path>tests+fixtures</path></staged_paths><trailers><task>prog-studio-v2-2026-07-s1-data-layer-t3</task><audit>PASS</audit></trailers></commit>
    <commit><sha>73a78f4755c4aa5836da97e5017f619a1c82cf40</sha><subject>feat(v2-data): add agent-detail assembly + roster.getAgentDetail</subject><staged_paths><path>packages/server/src/parsers/agent-detail.ts</path><path>packages/server/src/parsers/__tests__/agent-detail.test.ts</path></staged_paths><trailers><task>prog-studio-v2-2026-07-s1-data-layer-t4</task><audit>PASS</audit></trailers></commit>
  </commits>
</commit_record>
