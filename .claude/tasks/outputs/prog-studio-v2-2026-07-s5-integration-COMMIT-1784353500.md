# Commit Record — prog-studio-v2-2026-07-s5-integration (Wave 1, per-packet durability)

<commit_record schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s5-integration</task_id>
  <generated>2026-07-18T14:45:00Z</generated>
  <provenance_marker>commit-packet@2.0.0</provenance_marker>

  <inputs>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t1-FE-1784348388.md" sha256="278e180099b25c05" task_id="prog-studio-v2-2026-07-s5-integration-t1"/>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t2-FE-1784348388.md" sha256="fd465913d69d5b45" task_id="prog-studio-v2-2026-07-s5-integration-t2"/>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t3-FE-1784348388.md" sha256="fec61ec6658d8567" task_id="prog-studio-v2-2026-07-s5-integration-t3"/>
    <completion_packet path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t4-FE-1784348388.md" sha256="08acb59233a5a50d" task_id="prog-studio-v2-2026-07-s5-integration-t4"/>
    <audit_verdict path=".claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-AUD-1784349688.md" sha256="5b602268202439bb"/>
  </inputs>

  <branch_type>two-commit</branch_type>

  <preflight_checks>
    <secret_pattern_grep>CLEAN (no .env/.env.*/.key/.pem/.secret paths in any staging set)</secret_pattern_grep>
    <pre_stage_scope_check>PASS — tracked-M union exactly = 4 packet staging sets + 8 orchestration-ceremony paths (checkpoint, registry, conventions, event log, 4x agent-log latest); ceremony paths staged in the preceding chore(orchestration) commit 1a61795, never in durability commits</pre_stage_scope_check>
    <import_closure_check>PASS — dialog.tsx imports NEW use-dialog-safe-focus.ts, which is IN the t1 staging set (Step 4a satisfied; the prog-studio-vision untracked-import class avoided)</import_closure_check>
    <out_of_packet_classification>
      <path status="benign-orchestration" reason="event log / task-registry / conventions stamp / checkpoints / agent-logs — sprint ceremony, committed in 1a61795"/>
    </out_of_packet_classification>
    <deviation_note>Packet file-list tag variant: FE packets declared staging sets via ui_packet-convention elements (components_created/components_modified, per-correction file= attributes, single-file scope statement) rather than the files_modified/files_created tags this skill's Deriving Files contract names. Sets were structured packet declarations (not prose inference), cross-confirmed by the audit verdict's reviewed scope and the expectation-manifest receipt checks. Schema-name drift (FE packet convention vs commit-packet contract) flagged for after-action §8/§9 intake.</deviation_note>
  </preflight_checks>

  <commits>
    <commit>
      <sha>9e8afc81c75b04eec47628afb47fee6be3152005</sha>
      <subject>feat(ui-dialog): safe-focus default wrapper + ReviseSpecAction migration</subject>
      <staged_paths>
        <path>packages/client/src/components/ui/use-dialog-safe-focus.ts</path>
        <path>packages/client/src/components/ui/dialog.tsx</path>
        <path>packages/client/src/components/detail/ReviseSpecAction.tsx</path>
      </staged_paths>
      <trailers><task>prog-studio-v2-2026-07-s5-integration-t1</task><audit>PASS</audit></trailers>
      <packet_source>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t1-FE-1784348388.md</packet_source>
    </commit>
    <commit>
      <sha>d67c7898c8c1b687b85dc650f93a06df24283c3b</sha>
      <subject>fix(relationship-panel): retune layout constants for half-width legibility</subject>
      <staged_paths>
        <path>packages/client/src/components/detail/RelationshipPanel.tsx</path>
      </staged_paths>
      <trailers><task>prog-studio-v2-2026-07-s5-integration-t2</task><audit>PASS</audit></trailers>
      <packet_source>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t2-FE-1784348388.md</packet_source>
    </commit>
    <commit>
      <sha>e70d6ef64e2fe1cb6ad1b48d63d6e89efbd43bb5</sha>
      <subject>docs(hygiene): correct four stale post-v2 comments</subject>
      <staged_paths>
        <path>packages/client/src/AppShell.tsx</path>
        <path>packages/server/src/parsers/__tests__/program-dag-parser.test.ts</path>
        <path>docs/v2-vision/v2-design-spec.md</path>
        <path>packages/server/src/router.ts</path>
      </staged_paths>
      <trailers><task>prog-studio-v2-2026-07-s5-integration-t3</task><audit>PASS</audit></trailers>
      <packet_source>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t3-FE-1784348388.md</packet_source>
    </commit>
    <commit>
      <sha>4d7665ccf199f3dc405f0a318b2ddf6c5530737c</sha>
      <subject>docs(deferred-work): DEFERRED-V2S1-3 Accuracy row + cross-repo reflect flag</subject>
      <staged_paths>
        <path>docs/deferred-work.md</path>
      </staged_paths>
      <trailers><task>prog-studio-v2-2026-07-s5-integration-t4</task><audit>PASS</audit></trailers>
      <packet_source>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t4-FE-1784348388.md</packet_source>
    </commit>
  </commits>

  <ceremony_commit sha="1a61795c67e7d148cddab81417ca885f45aeaa4b" subject="chore(orchestration): prog-studio-v2-2026-07-s5-integration wave-1 ceremony" note="precedes durability commits per Two-Commit Pattern; no Audit trailer by design"/>
</commit_record>
