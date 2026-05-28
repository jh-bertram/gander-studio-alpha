<plan_critique>
  <plan_id>prog-studio-sessions-2026-05-s1-backend</plan_id>
  <status>BLOCK</status>

  <!--
    Prior-block verification: ALL 8 CR#1 challenges (B1, B2, B3, W1-W5) are genuinely
    resolved in rev1. Detail is in the trailing <prior_challenge_verification> block.
    Not re-litigated. The two BLOCKERs below are NEW, introduced by the W3 configurable-
    source-dirs scope the human authorized — they are exactly the surface CR#1 had not
    reviewed.
  -->

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t4</task_ref>
      <description>
The new SESSIONS_SOURCE_DIRS scope assumes every file under `${root}/docs/post-mortems/*.md`
across ALL configured roots carries the same YAML frontmatter shape the gander post-mortems use.
That assumption is false for the single most likely second root a user will add: the studio repo itself.

Empirical evidence:
- gander post-mortems (the default + only-by-default root) HAVE YAML frontmatter — confirmed:
  `/home/jhber/projects/gander/docs/post-mortems/gander-p5-obsidian-l0-l1.md` line 3 `sprint: gander-p5-obsidian-l0-l1`, line 4 `date:`, line 6 `gap_classes:`, line 19 `status: written`.
- studio post-mortems (the obvious second root — `program.md` goal says "particularly-formatted
  markdowns in OUR folders", plural) have NO frontmatter at all. Confirmed:
  `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p2-agent-cards.md`
  lines 1-6 use `# Post-Mortem: <slug>` H1 + `**Date:** 2026-04-04` bold lines. A grep for
  `^(sprint|sprint_id|type|date|gap_classes|status):` across the studio post-mortems dir returns ZERO matches.

Failure chain when a user sets `SESSIONS_SOURCE_DIRS` to include the studio repo (the entire point of
making it configurable):
1. `parseSessionFile` runs gray-matter on a frontmatter-less file → `data` is `{}` → `sprint`, `date`,
   `gap_classes`, `status` are all `undefined`.
2. t1's `SessionSchema` declares `sprint` (z.string()), `date` (z.string()), `status` (z.string()),
   `gap_classes` (z.array(z.string())) as REQUIRED, non-optional fields (see t1 description bullet 3).
3. t2b step 7 / SC6 mandates `SessionSchema.parse()` before returning → it THROWS on every studio file.
4. t4's `session.list` description (FILE 2.a) specifies "parse each with parseSessionFile(...), merge
   results across all source roots" with NO per-file try/catch. One un-parseable file in any added root
   throws out of the whole `session.list` call → the entire Sessions list page returns an error, not a
   partial list.

This is the same silent-substitution-vs-hard-fail-loud tension the team keeps hitting, inverted: here
the failure is loud-but-total (one bad file kills the list) where the existing `loadout.list` precedent
(router.ts lines 154-164) is per-file `safeParse` + skip-malformed. The new code diverges from the
established in-tree pattern.

The W3 human decision was "make source configurable." Shipping a parser that throws on the most likely
configured source defeats the decision.
      </description>
      <required_revision>
Two coupled fixes, both stated as constraints (no prescriptive code):
1. t2b: `parseSessionFile` must tolerate frontmatter-absent / partial-frontmatter post-mortems WITHOUT
   throwing. Decide and document the policy: either (a) make `sprint`/`date`/`gap_classes`/`status`
   `.optional()` (or `.default(...)`) in t1's SessionSchema and derive a fallback `id` from the filename
   when `sprint` frontmatter is absent, OR (b) keep them required but have `parseSessionFile` synthesize
   them from the H1/bold-line studio format. Add a t2b fixture using the studio frontmatter-less format
   (e.g. a copy of `gander-studio-p2-agent-cards.md`) with an explicit test asserting it parses without
   throwing. This is a FOURTH distinct format the W5 fixture set must cover — frontmatter shape, not just
   Section-2 table shape.
2. t4: `session.list` must isolate per-file parse failures the way `loadout.list` does
   (router.ts lines 154-164: per-entry try/safeParse, skip-on-failure, never let one file abort the list).
   State this as a constraint and point BE at the existing `loadout.list` pattern; do not write the snippet.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t4</task_ref>
      <description>
t4 `session.list` (FILE 2.a) specifies: "merge results across all source roots, deduplicate by session id".
With multiple configured roots this silently drops sessions and renders the new `source_root` field useless
for its own purpose.

Mechanism:
- The session `id` is derived from the `sprint` frontmatter slug (t2b step 2). When `sprint` frontmatter is
  absent (NEW-1 above) the id falls back to filename, so two roots that each contain a same-named file
  (e.g. both a gander checkout and a gander-worktree, or two project repos that both ran a sprint named
  `smoke-fixture-...`) produce the SAME id.
- "deduplicate by session id" keeps the first and silently discards the second. Which one wins depends on
  `SESSIONS_SOURCE_DIRS` array order — non-deterministic from the user's point of view.
- `source_root` was added precisely to tag provenance, but dedup keys on `id` ALONE, so `source_root`
  cannot break the tie. The discarded session vanishes with no warning.

This is the silent-substitution-as-graceful-degradation pattern called out in
`gander-studio-p4-proximity-edge-hardening.md` §5 (the recurring pattern) and §6 G1: "the instinct to make
the feature work no matter what keeps inventing variations of the same anti-pattern." A session present on
disk is silently absent from the list; no unit test against a single-root fixture will catch it.
      </description>
      <required_revision>
t4: change the dedup key for `session.list` from `id` alone to the composite `(source_root, id)` — two
files in two different roots are distinct sessions and BOTH must appear. State the constraint: "Sessions
are unique per (source_root, id) tuple; do not collapse same-id sessions from different roots." If the PM
wants true within-a-single-root dedup (same file globbed twice), key that on the resolved absolute filePath,
not on id. Either way `source_root` must participate in the identity. Add a t4 (or t3) SC asserting that two
fixture roots containing a same-id post-mortem yield TWO entries from `session.list`, not one.
      </required_revision>
    </challenge>

  </challenges>

  <warnings>
    <!-- Non-blocking; surfaced to PM. -->
    <warning>
      <type>OVERSCOPED</type>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t4</task_ref>
      <note>
t4 now touches 4 distinct files (env.ts, router.ts, .env.example, CLAUDE.md) at ~140 LOC, grown from ~120
when W3 folded SESSIONS_SOURCE_DIRS in. The deterministic 4-file BLOCKER rule is FE-scoped; t4 is BE, so it
does not mechanically fire — but router.ts alone is ~120 LOC (4 procedures + multi-root glob + dedup +
saveEdit stub) and the two doc files plus a new Zod-parsed env var are real additional contexts. PM's own
risk_flags row 4 already pre-authorized a t4b split if BE finds it too large. Recommendation: pre-commit to
splitting t4 into t4a (env.ts SESSIONS_EDITS_DIR + SESSIONS_SOURCE_DIRS + .env.example + CLAUDE.md docs,
~35 LOC) and t4b (router.ts session.* namespace, ~120 LOC, audit gate). This also isolates the env-parsing
audit surface from the procedure-wiring audit surface. If the PM declines, accept the risk explicitly so the
human sees the trade-off. Note: the two NEW BLOCKERs above land their fixes in t4's router code and t2b's
parser anyway, so a t4 split is the natural moment to absorb them.
      </note>
    </warning>
  </warnings>

  <audit_risk_forecast>
Top items most likely to fail audit even after the two BLOCKERs are fixed:

1. **Single-root fixture blindness.** Every fixture in t2b and t3 is copied from ONE source root and tests
   run against ONE configured root. The multi-root code paths (cross-root merge, (source_root,id) identity,
   per-file parse isolation) will have no fixture exercising them, so SA/QA can pass green while the multi-root
   behavior is untested. The auditor must require at least one test that configures TWO fixture roots and
   asserts merge + dedup behavior — otherwise the entire configurable-scope feature ships unverified. Same
   audit-blindspot class as `gander-studio-p2-agent-cards.md` HCG-2 (all gates green, runtime broken).

2. **Frontmatter-shape coverage.** Even with the t2b fix, the auditor should spot-check `parseSessionFile`
   against a real frontmatter-less studio post-mortem on disk, not just a curated fixture, before signing off.
   The studio's own `docs/post-mortems/` is the live regression corpus.

These are content-bugs-not-type-bugs: tsc passes, single-root unit tests pass, the multi-root feature is broken.
  </audit_risk_forecast>

  <prior_challenge_verification>
All 8 CR#1 challenges verified genuinely resolved (not re-litigated; recorded for the orchestrator's audit trail):

- B1 (ev z.enum→z.string()): RESOLVED. t1 desc bullet 1 mandates z.string() with explicit no-enum rationale;
  t1 out_of_scope forbids z.enum; SC3 greps for z.string(); t3 SC6/SC7 assert AUDIT_PASS/AUDIT_FAIL parse as
  regression guards. The gander JSONL corpus genuinely contains the open ev set CR#1 found.
- B2 (audit/critique field conflation): RESOLVED via option (a). AgentActivitySchema carries critique_passes /
  critique_blocks (CRITIQUE_*) AND audit_passes / audit_fails (AUDIT_*); SessionStatsSchema carries total_* for
  all four. Field names are byte-identical across t1 (def + SC4), t2b (desc bullet 5 + SC7), t3 (desc + SC10),
  and t4 (schema refs). This is a genuine single-source-of-truth coupling, not three drifting copies — the
  re-check focus item is satisfied.
- B3 (SESSIONS_EDITS_DIR absolute): RESOLVED. t4 FILE 1.1 constraint-only, path.resolve(LOADOUTS_DIR) before
  default, SC10 requires auditor to confirm absolute. Generalizes correctly to N roots: SESSIONS_SOURCE_DIRS
  applies path.resolve to EACH entry (t4 FILE 1.2). B3 generalization verified.
- W1 (t2 overscope): RESOLVED. t2 split into t2a (config-only, no audit gate) + t2b (parser+tests+fixtures,
  audit gate). agent_count 5→6; dependency chain t1→t2a→t2b→t3→t4→t5.
- W2 (vitest install): RESOLVED. pre_dispatch_note has ORC run `npm install --save-dev vitest -w
  @gander-studio/server` + grep-confirm before t2a; t2a is verify-only with halt-and-surface if absent.
  Confirmed vitest is NOT yet in packages/server/package.json devDependencies — the preinstall is genuinely required.
- W3 (source scope): RESOLVED per human CONFIGURABLE decision. SESSIONS_SOURCE_DIRS, comma-delimited,
  path.resolve per entry, default=[path.resolve(GANDER_ROOT)] (preserves GANDER_ROOT-only read behavior when
  unset), Zod validation at boundary (z.array(z.string().min(1))). NOTE: this resolution is what introduced
  the two NEW BLOCKERs above — the scope itself is correctly wired; its interaction with real-world file
  shapes is the gap.
- W4 (duplicated guard snippets): RESOLVED. t4 FILE 2.d and t5 STEP 1 are both constraint-only and reference
  the existing guardPath helper (router.ts L22-31, confirmed present). No prescriptive guard snippets remain.
  No new recipe-vs-problem-naming drift introduced (re-check focus item satisfied).
- W5 (fixture coverage): RESOLVED. t2b SC3 ≥4 fixtures; SC4 names 3 distinct Section-2 layouts; SC8 makes
  layout (b) tolerance contractual. (NEW-1 adds a needed 4th frontmatter-SHAPE dimension on top of this.)
  </prior_challenge_verification>

  <post_mortem_patterns_checked>
Read / re-consulted:
- `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md`
  §5 (silent-substitution-as-graceful-degradation recurring pattern), §6 G1/G3/G4 — directly grounds NEW-1 and NEW-2.
- `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p2-agent-cards.md`
  §4 C4 (OVERSCOPED file-count split), §6 — grounds the t4 OVERSCOPED warning + the all-gates-green audit blindspot.
- `/home/jhber/projects/gander-studio-alpha/docs/agent-changelog.md` (4-file BLOCKER FE-scope; recipe-vs-problem-naming).
- `/home/jhber/.claude/rules/standards.md` (Zod at boundary, DRY, strict mode).
- Source of truth re-read: `packages/shared/src/schemas.ts` (SessionSchema fields confirmed non-optional),
  `packages/server/src/env.ts` (EXPORT_BASE_DIR optional-with-default pattern; LOADOUTS_DIR requireEnv),
  `packages/server/src/router.ts` (guardPath L22-31 confirmed; loadout.list per-file safeParse precedent L154-164),
  `packages/server/package.json` (gray-matter ^4.0.3 present; vitest absent),
  live frontmatter shapes in both `/home/jhber/projects/gander/docs/post-mortems/` (HAS frontmatter) and
  `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/` (NO frontmatter) — empirical basis for NEW-1.
Recurrence-declaration check: PM declared 3 <recurring_pattern> elements; MISSING_RECURRENCE_DECLARATION does not apply.
  </post_mortem_patterns_checked>
</plan_critique>
