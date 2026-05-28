<plan_critique>
  <plan_id>prog-studio-sessions-2026-05-s1-backend</plan_id>
  <status>PASS</status>

  <!--
    Re-review scope: verify the 2 NEW BLOCKERs from CR#2 (NEW-1 format-heterogeneity,
    NEW-2 dedup identity) are resolved, and scrutinize the surface the format-tolerance
    decision introduced in rev2 (relaxed SessionSchema + dual-format parser). The 8 CR#1
    challenges and their resolutions are NOT re-litigated (verified resolved in CR#2).

    Verdict: both CR#2 BLOCKERs are genuinely resolved. The new surface is sound. No
    BLOCKER. Two non-blocking WARNINGs and an audit-risk forecast below.
  -->

  <challenges>
    <!-- No BLOCKER and no WARNING-severity challenge rises to the <challenge> bar.
         Non-blocking observations are in <warnings>. -->
  </challenges>

  <warnings>

    <warning>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t2b</task_ref>
      <note>
Format-B `sprint`/`id` derivation from the H1 line is NOT slug-safe for the real studio
corpus. The t2b H1 regex `/^# Post-Mortem:\s*(.+)$/m` captures everything after the colon.
Empirically (grep `^# Post-Mortem:` across `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/`):
  - gander-studio-p4-proximity-edge-hardening.md → `gander-studio-p4-proximity-edge-hardening` (clean slug — the chosen fixture)
  - gander-studio-p2-p3.md → `Gander Studio P2 + P3` (PROSE title, spaces + `+`)
  - gander-studio-p1-materia-canvas.md → `Gander Studio P1 — Materia Canvas` (PROSE title, em-dash)
  - gander-studio-p2-canvas-link.md / gander-studio-p2-agent-cards.md → clean slugs

This does NOT break the NEW-1 BLOCKER fix: SessionSchema accepts any z.string() so no throw,
and the negative test (SC12) still passes. But it has two real downstream consequences the
auditor should be aware of:
  1. `session.get` (t4b input `{ id: z.string() }`) matches on parsed `sprint`/`id`. A caller
     cannot guess `Gander Studio P2 + P3` as an id; the file becomes effectively un-gettable by id.
  2. The NEW-2 composite dedup key `(source_root, id)` uses this prose-or-slug `id`. Identity
     stability now depends on the H1 author's formatting, not a normalized slug.
The chosen Format-B fixture (gander-studio-p4) happens to have a clean-slug H1, so a green t2b
test suite will NOT exercise the prose-title case. This is a single-fixture blindspot of the same
class as the gander-studio-p2-agent-cards.md HCG-2 (all gates green, real corpus broken).
      </note>
      <suggested_revision>
Add one sentence to t2b's Format-B derivation rule: when deriving `id` from the H1 (or the
filename fallback), normalize to a slug (lowercase, non-alphanumerics → `-`, collapse repeats)
so `id` is stable regardless of H1 prose. Note: `sprint` (the display string) may keep the raw
H1 value, but `id` — which feeds `session.get` lookup and the `(source_root, id)` dedup key —
should be the normalized slug. Optionally swap or add the prose-title fixture (gander-studio-p1-
materia-canvas.md, H1 `Gander Studio P1 — Materia Canvas`) so a test exercises non-slug H1
derivation. This is a hardening warning, not a blocker — the BLOCKER fixes stand.
      </suggested_revision>
    </warning>

    <warning>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t4b</task_ref>
      <note>
Return-shape consistency across the session.* namespace is left under-specified. t4b makes
`session.list` return a list-envelope `{ sessions: SessionSchema[], skipped: number }` (correct —
the skip count is properly typed in an envelope, not bolted onto SessionSchema). But `session.get`
returns bare `SessionSchema` and `session.getStats` returns bare `SessionStatsSchema`. That is a
defensible design (list has a fleet-level skip count; single-item gets do not). The risk is only
that S2 (the FE consumer sprint) will infer the client types from these shapes; an undocumented
mix of "list returns envelope, get returns bare object" is a footgun the FE will hit at integration
time, not now. This is forward-looking, not a defect in S1.
      </note>
      <suggested_revision>
Add one line to t4b stating the deliberate shape contract: `session.list` returns the
`{ sessions, skipped }` envelope; `session.get`/`session.getStats` return the bare object. This
makes the asymmetry an explicit decision in the completion packet rather than an implicit one S2
discovers by reading the router. No code change required.
      </suggested_revision>
    </warning>

  </warnings>

  <cr2_blocker_verification>
Both CR#2 BLOCKERs verified genuinely resolved (not re-litigated; recorded for the audit trail):

- NEW-1 (format-heterogeneity) — RESOLVED, both parts:
  * Schema part (t1): SessionSchema now declares `gap_classes: z.array(z.string()).default([])`,
    `status: z.string().optional()`, `type: z.string().optional()`. SC6/SC7 grep-verify the
    relaxation. `sprint`/`date`/`id`/`filePath`/`source_root` remain required (t1 out_of_scope
    bullet 7 explicitly forbids relaxing those). `.default([])` matches an existing in-tree
    convention (LoadoutSchema.connections, schemas.ts L40), so the auditor will not flag it as novel.
  * Parser part (t2b): `parseSessionFile` is now genuinely dual-format. Detection keys on whether
    gray-matter returns recognized frontmatter keys (Format A) vs. empty data (Format B). Field
    derivation is enumerated for BOTH paths with explicit fallbacks (no-H1 → filename stem;
    no-Date → filename date component → empty string). I confirmed Format-A files
    (gander-p5-obsidian-l0-l1.md) carry BOTH frontmatter AND the H1/`**Date:**` body markers; the
    detection order (frontmatter-first) means Format-A files never mis-route to the body-derivation
    path. The mandatory 5th fixture (gander-studio-p4-proximity-edge-hardening.md) is confirmed
    frontmatter-less (L1 H1, L2 `**Date:** 2026-04-28`, no `---`). SC5-SC7 assert it parses to a
    valid Session with `gap_classes === []` and `status === undefined`. SC12 adds the negative
    "matches neither format → filename fallback, no throw" test.
  * Router part (t4b): `session.list` wraps each file parse in per-file try/catch matching the
    `loadout.list` precedent. I verified that precedent at router.ts L150-169 (outer try → []
    on unreadable dir; inner per-file try { safeParse; push } catch { skip }). t4b SC4 requires
    the auditor to confirm per-file isolation; SC5 requires `skipped` be surfaced. The skip count
    lives in a typed list-envelope (z.object), not as an untyped add-on — correct.

- NEW-2 (dedup identity) — RESOLVED: dedup key changed from `id` alone to composite
  `(source_root, id)`. Within-root dedup (same file globbed twice via symlink) keys on resolved
  absolute filePath. t4b SC6 requires the auditor to confirm neither id-only collapse nor a
  cross-root collapse. t4b SC7 adds the multi-root integration test: two fixture roots each with
  `foo.md` → assert TWO distinct Session entries. The test is mandated self-contained (risk_flag 4:
  fixtures/root-a/, fixtures/root-b/, not live GANDER_ROOT). This directly closes the silent-drop
  hole and exercises the multi-root path that single-root fixtures could not.
  </cr2_blocker_verification>

  <new_surface_scrutiny>
The format-tolerance decision (relaxed schema + dual-format parser) is the surface most likely to
introduce a fresh regression. Findings:

1. Schema-relaxation downstream impact — SAFE. The only consumers of session-level fields are
   t2b's agent-table counting (reads the `ev` COLUMN of Section-2 tables, never `status`/`gap_classes`)
   and t3's `computeSessionStats(session, events)` (reads `session.id` only; all counting is over the
   `events` array by `ev`). Neither reads `status` or `gap_classes`, so `undefined`/`[]` from a
   frontmatter-less file never reach any stats arithmetic. The relaxation cannot mislead the stats.

2. Format-B fallback safety — SAFE (with the slug-normalization warning above as a hardening, not a
   correctness, item). No-H1 and no-Date both have defined non-throwing fallbacks; the negative test
   pins the contract.

3. Skip-count typing — CORRECT. Typed Zod envelope, not bolted onto SessionSchema.

4. Lockstep preserved — CONFIRMED. `ev: z.string()` (t1 SC3; t3 SC6/SC7 AUDIT_PASS/AUDIT_FAIL
   regression guards) and the four count fields (critique_passes / critique_blocks / audit_passes /
   audit_fails) are byte-identical across t1 SC4, t2b SC10, t3 SC10. No regression from earlier rounds.

5. Prescriptive-recipe drift — NONE. The t2b derivation regexes are field-extraction SPECS for a
   deterministic markdown format with explicit fallbacks, not an untraceable algorithmic recipe in a
   domain the Critic cannot statically verify (contrast the oscillator-counting recipe from
   proximity-edge §6 G3). Parser, router, and guard remain constraint-only and reference the existing
   in-tree helpers (loadout.list pattern, guardPath). No new recipe-vs-problem-naming drift.
  </new_surface_scrutiny>

  <audit_risk_forecast>
Top items most likely to surface at audit even though the plan is sound:

1. Prose-title H1 derivation (WARNING 1). The chosen Format-B fixture has a clean-slug H1, so the
   t2b suite will be green while the real studio corpus contains prose H1s (`Gander Studio P2 + P3`,
   `Gander Studio P1 — Materia Canvas`). If `id` is left un-normalized, `session.get` by id and the
   `(source_root, id)` dedup key both inherit prose instability. The auditor should spot-check
   `parseSessionFile` against a prose-H1 studio post-mortem on disk (the live corpus is the
   regression set), per t4b risk_flag 7.

2. Multi-root + frontmatter-shape coverage is the right gate and is now mandated (t4b SC7 multi-root
   test; t2b SC5-SC7 Format-B test). The auditor must confirm these two tests actually run under
   `npm test` and exercise TWO configured roots / a frontmatter-less file respectively — a green
   single-root run is insufficient (same all-gates-green-runtime-broken class as
   gander-studio-p2-agent-cards HCG-2).

Neither is a blocker; both are content-not-type risks the auditor should treat as named watch items.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
Read / re-consulted this round:
- /home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md
  — §5 L143 silent-substitution-as-graceful-degradation (recurring); confirmed Format-B representative
  (L1 H1 + L2 `**Date:**`, no frontmatter). Grounds NEW-1/NEW-2.
- /home/jhber/projects/gander/docs/post-mortems/gander-p5-obsidian-l0-l1.md — Format-A representative;
  confirmed YAML frontmatter (type/sprint/date/gap_classes/status) AND body H1 + `**Date:**` both
  present, validating t2b's frontmatter-first detection order.
- /home/jhber/projects/gander-studio-alpha/docs/agent-changelog.md — pm 1.5.0 recurring-pattern
  enumeration mandate (PM declared 3 <recurring_pattern> → MISSING_RECURRENCE_DECLARATION N/A);
  critic 1.4.1 recipe-vs-problem-naming; critic 1.4.0 4-file FE BLOCKER (t4 is BE, not triggered).
- /home/jhber/.claude/rules/standards.md — Zod at every API boundary (skip-count envelope is typed),
  DRY (constraint-only guards reference guardPath), strict mode.
- Source of truth re-read: packages/shared/src/schemas.ts (SessionSchema not yet present; t1 append-only;
  .default([]) convention at L40), packages/server/src/router.ts (loadout.list per-file precedent
  L150-169; guardPath L22-31), packages/server/src/env.ts (EXPORT_BASE_DIR optional-with-default L26-27;
  requireEnv pattern), live H1 shapes across studio docs/post-mortems/ (prose vs slug — basis for WARNING 1).
Prior 8 CR#1 challenges + their rev1 resolutions were verified by CR#2 and are NOT re-litigated here.
  </post_mortem_patterns_checked>
</plan_critique>
