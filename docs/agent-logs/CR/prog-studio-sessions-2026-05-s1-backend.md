# CR Log — prog-studio-sessions-2026-05-s1-backend (rev2 re-review, CR#3)

## Stage 1 — RECEIVED
- ts: 2026-05-20 (rev2 re-review)
- Round history: CR#1 BLOCK (8, resolved) → rev1 → CR#2 BLOCK (NEW-1 format-heterogeneity, NEW-2 dedup) + WARNING (t4 overscoped) → rev2.
- Mandate: verify 2 new BLOCKERs resolved AND scrutinize new surface (relaxed schema + dual-format parser). No re-litigation of resolved challenges.

## Stage 2 — PLAN
Read all 7 packets + routing_notes + manifest. Focused-scrutiny checklist set: NEW-1a parser dual-format fallback safety; NEW-1a schema-relaxation downstream impact; NEW-1b router robustness; NEW-2 dedup; skip-count typing; lockstep; prescriptive-recipe drift.

## Empirical confirmations
- loadout.list precedent router.ts L150-169: outer try (dir→[]) + inner per-file try{safeParse;push}catch{skip}. EXACT precedent t4b cites. PM "~148-170" accurate.
- guardPath router.ts L22-31: path.resolve both sides, `!==root && !startsWith(root+sep)`. EXACT precedent t4b/t5 cite.
- schemas.ts: SessionSchema not yet present (t1 creates). .default([]) already in-tree (LoadoutSchema.connections L40). t1 append-only, SC11 enforces 0 removed.
- env.ts: EXPORT_BASE_DIR optional-with-default (L26-27); GANDER_ROOT/LOADOUTS_DIR requireEnv. t4a references this correctly.
- Format B (gander-studio-p4): L1 `# Post-Mortem: <slug>` H1, L2 `**Date:** 2026-04-28`, NO frontmatter. t2b H1 regex /^# Post-Mortem:\s*(.+)$/m captures exactly the asserted slug. CONFIRMED.
- Format A (gander-p5-obsidian-l0-l1): YAML frontmatter (type/sprint/date/gap_classes/status) AND ALSO H1+bold-Date (L22-23). KEY: Format A files contain BOTH markers. t2b detection keys on gray-matter data non-empty → Format A path → uses frontmatter, ignores body markers. No contamination. CONFIRMED.
- proximity-edge §5 L143: silent-substitution-as-graceful-degradation recurring pattern. Grounds NEW-1/NEW-2 correctly.
- changelog: recurring-pattern declaration mandatory (pm 1.5.0); PM declared 3 <recurring_pattern>. MISSING_RECURRENCE_DECLARATION N/A.

## Dimension checkpoints
- DEPENDENCY: chain t1→t2a→t2b→t3→t4a→t4b→t5. t4a (env) before t4b (router imports env vars). t4b imports parsers from t2b+t3. t5 hardens t4b's router. Order correct. PASS.
- MISSING_RESEARCH: no new external API. gray-matter already in pkg (risk_flag verifies). No RA needed. PASS.
- OVERSCOPED: t4 split into t4a (~35 LOC, 3 files, no gate) + t4b (~130 LOC, router only). BE not FE so 4-file deterministic rule N/A; split resolves CR#2 warning. t2b/t3 multi-file but parser+test natural seam, audit-gated. Acceptable. PASS.
- ASSUMPTION: NEW-1 schema relaxation — verified downstream (below). PASS.
- AUDIT_RISK: skip-count typing, lockstep — verified (below). PASS w/ forecast.
- SCOPE_DRIFT: format-tolerance is human-authorized this round. No drift. PASS.

## NEW-surface scrutiny results (heart of this re-review)
1. Schema relaxation downstream: status/type optional, gap_classes default([]). Consumers:
   - t2b counting reads ev COLUMN of Section-2 tables, NOT status/gap_classes. undefined status irrelevant. SAFE.
   - t3 computeSessionStats(session, events) counts EVENTS by ev, reads session.id only. Does NOT read session.status/gap_classes. undefined/[] never reach stats math. SAFE.
   No consumer misled. PASS.
2. Format-B derivation robustness: no-H1 → filename stem (path.basename). no-Date → filename date component → empty string (z.string() accepts). Negative test SC12 covers no-H1/no-frontmatter → valid Session no throw. Fallbacks defined and safe. PASS.
3. Skip-count typing: t4b SC defines wrapper z.object({sessions: z.array(SessionSchema), skipped: z.number()}) OR explicit top-level skipped field — Zod, NOT untyped add-on. Lives in list-envelope, not SessionSchema. CORRECT.
4. Lockstep: ev z.string() (t1 SC3, t3 SC6/7 regression guards) + 4 count fields byte-identical across t1(SC4)/t2b(SC10)/t3(SC10). NOT regressed. PASS.
5. Prescriptive-recipe drift: t2b derivation rules state regexes as field-derivation constraints WITH fallbacks; parser/router/guard constraint-only + reference existing helpers. Regexes are field-spec for a deterministic format, not untraceable algorithmic recipe. No drift. PASS.

## Stage 3 — COMPLETE
Verdict: PASS. Both CR#2 BLOCKERs (NEW-1, NEW-2) genuinely resolved. New surface (relaxed schema + dual-format parser) scrutinized — no new blocker. Two non-blocking WARNINGs surfaced (return-shape consistency for session.get/getStats vs list envelope; H1-capture-includes-trailing-tokens edge). Audit-risk forecast: multi-root + frontmatter-shape coverage already addressed by t4b SC7 + t2b SC5-7.
Output: /home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-CR-rev2-1779297684.md
