<warning_resolution_request task_id="prog-studio-sessions-2026-05-s2-list-edit">

Your revised plan PASSED the Critic (CR#2: CRITIQUE_PASS, 0 blockers). Three WARNING-level items
remain. Return a compact `<plan_amendment>` addressing each — do NOT re-emit the full
task_decomposition, do NOT add/remove/reorder packets (a reorder would re-trigger the Critic gate).
SC-level tightenings, out_of_scope additions, and risk acknowledgements only.

Read: `.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-CR-rev1-1779304665.md`
(the 3 warnings in full). Your rev1 plan is at
`.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-rev1-1779304665.md`.

<warning id="1" task="t3b">
The plan labels t3b "3 source files" but it literally touches 4-5 trivial scaffold files
(SessionsRouter.tsx + SessionListPage stub + SessionDetailPage stub + ModeContent.tsx PAGE_MAP entry,
possibly + session-store stub). The trivial-scaffold exception is legitimate but the undercount may
draw an auditor challenge.
**Resolution:** State t3b's file count HONESTLY in the amendment (e.g. "t3b: 4 scaffold files — 1
new component + 2 one-line stub pages + 1 one-line PAGE_MAP entry; all trivial scaffold, no
substantive logic; trivial-scaffold exception to the ≤3-source-file lens, stated for the auditor").
Confirm where the session-store STUB is created (t3b or t4a) so the t4a "replace stub" handshake is
unambiguous.
</warning>

<warning id="2" task="t6a">
t6a is serialized behind t5b but its real dependency is only t4a (it adds two hook files, touches no
tab/shell). This is wall-clock cost, not a correctness issue.
**Resolution — ACKNOWLEDGE, do NOT reorder.** Dispatch is FOREGROUND sequential (ORC audits +
commits one packet at a time), so the DAG ordering imposes no real wall-clock penalty here — t6a
would run after t5b regardless of the declared edge. Record a risk acknowledgement that the t6a→t5b
edge is conservative/serialized-by-convenience and accepted. (Reordering the edge would re-trigger the
Critic gate for zero practical benefit under foreground dispatch.)
</warning>

<warning id="3" task="t2">
t2's prose paraphrase of session.get's scan omits the directory join. session.get reads from
`path.join(dir, 'docs', 'post-mortems')` (router.ts:427) for each source dir, not `dir` directly. A
literal paraphrase reading would readdir the wrong directory and fail the real-corpus smoke.
**Resolution:** Add one clause to t2's description naming the subdir: getRaw's inline scan iterates
SESSIONS_SOURCE_DIRS and for each reads `path.join(dir, 'docs', 'post-mortems')`, exactly as
session.get does (router.ts:422-447). Keep the "mirror session.get verbatim" directive.
</warning>

## Output Path
Write your `<plan_amendment>` to:
.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-amend-1779304665.md
</warning_resolution_request>
