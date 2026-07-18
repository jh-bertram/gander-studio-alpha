# FE Output — prog-studio-v2-2026-07-s5-integration-t4

Task: two documentation actions in `docs/deferred-work.md` only (PROGRAM SC-5 / residue item 4,
per `prog-studio-v2-2026-07-s5-integration-PM-1784347058.md` local labels SC-4a..SC-4d, crosswalked
in `prog-studio-v2-2026-07-s5-integration-amend1-PM-1784348182.md`).

<completion_packet>
  <task_id>prog-studio-v2-2026-07-s5-integration-t4</task_id>
  <status>COMPLETE</status>

  <tag_chosen>
DEFERRED-V2S1-3 — chosen to continue the existing `V2S1-*` series (DEFERRED-V2S1-1, DEFERRED-V2S1-2)
already ledgered under `## Sprint: prog-studio-v2-2026-07-s1-data-layer`, since the party-stats
Accuracy metric originates from s1's data-layer work. Verified non-colliding against the full
existing tag census read from `docs/deferred-work.md` this turn: DEFERRED-001..006, -P7-1, -P9-1,
-P10-1, -V2S1-1, -V2S1-2, -V2S2-1, -V2S2-2, -V2S3-1, -V2S3-2, -V2S4-1.
  </tag_chosen>

  <entry_a_accuracy_family_grouping quoted="verbatim">
### DEFERRED-V2S1-3 — party-stats Accuracy metric's sprintRoot-family grouping can cross-resolve a same-role FAIL/PASS across different tasks (accepted approximation)

**Source:** prog-studio-v2-2026-07-s5-integration residue item 4a (skein-surfaced; unledgered until this entry).
**What it is:** The party-stats "Accuracy" stat (`accuracy-first-pass` derivation, `PartyMemberCard.tsx`) is computed by `computePartyDerivations`'s attribution-flip algorithm in `packages/server/src/parsers/party-stats.ts`. Events are grouped into families via `familyKeyFor()` (party-stats.ts:96-106), which reuses `sprintRoot()` — the SAME boundary-anchored grouping key `session-slug-match.ts` uses for session synthesis/dedup — not the exact `task_id`. Within a family, an `AUDIT_FAIL` for a given role opens an unresolved-fail marker for that role that any LATER `AUDIT_PASS` for the same role in the SAME family resolves, per the algorithm's own doc comment (party-stats.ts:108-132). Because the grouping key is the family (sprintRoot cluster), not the individual task_id, a `FAIL` on task A and a `PASS` on task B can cross-resolve each other as long as both A and B carry the same canonicalized role and the same sprintRoot family — even though A and B are different tasks.
**Why deferred:** This is a known, accepted approximation, not a defect: sprintRoot-family grouping is deliberate DRY reuse of an already-established grouping key (see the party-stats.ts:97-99 comment), and tightening it to exact-task_id resolution would require re-deriving task-to-task audit lineage that the corpus does not currently expose distinctly from family membership. Out of scope for the s5 integration mop-up sprint (docs-only packet; no `party-stats.ts` code change authorized here).
**Schedule as:** Small BE packet on `party-stats.ts`'s attribution-flip algorithm — either (a) accept the family-level approximation permanently and document it in `session-data-inventory.md` §2.1 as intentional, or (b) tighten resolution to same-task_id (or a stricter same-task-family-instance key) if a future corpus exposes reliable task-to-task audit lineage.
  </entry_a_accuracy_family_grouping>

  <entry_b_cross_repo_flag quoted="verbatim">
## Cross-repo reflect-pass intake flags

Items that belong to the `gander` control-plane repo (`/home/jhber/projects/gander/`), not to
`gander-studio-alpha`. Recorded here ONLY as a durable handoff flag for the gander-side
reflect/agent-improvement pass, which PULLs sibling-project artifacts as read-only evidence. These
items are NOT editable from this repo — do not attempt a fix here.

- **FLAG (cross-repo, do-not-fix-here): guarded-push docs-vs-installed-rail contradiction** — owned
  by the gander-side reflect/agent-improvement pass; surfaced from
  `prog-studio-v2-2026-07-s5-integration` (residue 4b). Not editable from `gander-studio-alpha`.
  </entry_b_cross_repo_flag>

  <sc_verification>
    <sc id="SC-4a" status="PASS">
`grep -ci 'accuracy' docs/deferred-work.md` = 2 (>=1). New entry contains "sprintRoot-family" /
"sprintRoot family" AND "cross-resolve" ("can cross-resolve" in the title, "cross-resolve each
other" in the body). New `### DEFERRED-V2S1-3` block present with Source/What it is/Why deferred/
Schedule as format matching DEFERRED-006 / DEFERRED-V2S4-1 model. Tag non-colliding (see tag_chosen).
    </sc>
    <sc id="SC-4b" status="PASS">
`grep -ci 'guarded-push' docs/deferred-work.md` = 1 (>=1). Flag line contains "cross-repo" and
"do-not-fix-here" literally: `FLAG (cross-repo, do-not-fix-here): guarded-push docs-vs-installed-rail
contradiction`.
    </sc>
    <sc id="SC-4c" status="PASS">
`git diff -- docs/deferred-work.md` is 100% additive (all `+` lines in the hunk bodies, zero `-`
deletions) — confirmed by direct diff read, quoted in the agent log
(`docs/agent-logs/FE/prog-studio-v2-2026-07-s5-integration-t4.md`). No file under
`/home/jhber/projects/gander/` was opened, read-to-edit, or modified — this agent's tool-call
history (Read/Write/Edit/Bash) touched exactly one project file: `docs/deferred-work.md` (plus this
agent's own log files under `docs/agent-logs/FE/` and its designated output file).
NOTE — shared working tree caveat: `git diff --name-only HEAD` run at completion time also lists
`packages/client/src/AppShell.tsx`, `packages/server/src/parsers/__tests__/program-dag-parser.test.ts`,
`packages/server/src/router.ts`, and `docs/v2-vision/v2-design-spec.md`. These are sibling task
**t3**'s concurrent edits in the same shared working tree (Wave-1 parallel dispatch per the PM
decomposition — t1/t2/t3/t4 all run in parallel, file-disjoint). They are NOT edits made by this
task (t4); t4's own edit surface is `docs/deferred-work.md` only, as required.
    </sc>
    <sc id="SC-4d" status="PASS">
No residue-1 (ui safe-focus wrapper) cross-reference was added anywhere in either new entry — t1 is
in scope this sprint per the packet's explicit instruction, so the optional cross-reference is
correctly omitted.
    </sc>
  </sc_verification>

  <out_of_scope_confirmation>
- No file under `/home/jhber/projects/gander/**` was opened, read-to-edit, or modified.
- No attempt was made to FIX the guarded-push contradiction — flag-only, per SC-4b/SC-4c.
- The optional residue-1 cross-reference was NOT added.
- No existing `docs/deferred-work.md` entry was reformatted, deleted, or reworded — pure append at
  two sites (after DEFERRED-V2S1-2, and at end-of-file).
- No other file was touched by this task (dialog.tsx/ReviseSpecAction.tsx are t1's; RelationshipPanel.tsx
  is t2's; AppShell.tsx/router.ts/program-dag-parser.test.ts/v2-design-spec.md are t3's).
  </out_of_scope_confirmation>

  <checkpoint_protocol_log>docs/agent-logs/FE/prog-studio-v2-2026-07-s5-integration-t4.md (Stage 1/2/3 complete; latest.md mirrored)</checkpoint_protocol_log>
</completion_packet>
