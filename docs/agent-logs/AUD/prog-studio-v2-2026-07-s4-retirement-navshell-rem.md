# AUD log — prog-studio-v2-2026-07-s4-retirement-navshell-rem

## Stage 1 — RECEIVED
- from: ORC (parent)
- at: 2026-07-10
- task_id: prog-studio-v2-2026-07-s4-retirement-navshell-rem
- prompt (excerpt): Single-defect BLOCKER remediation of deterministic red on s3-drilldowns.spec.ts:362 (agent-detail keyboard-operability). FE#4 REJECTED AUD#3's rail attribution, root-caused first-row-fixture-coupling: openAgentDetail(page,0) opens most-recently-active agent; orchestrator (26 rels) needs 55 Tab presses > fixed 40 bound. Fix: bound = Math.max(40, rfFocusableCount+20) measured live. Spec only (+20/-2).

## Stage 2 — PLAN (audit order: SA -> QA -> SX, stop at first FAIL)
1. packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts (SA: diff scope + assertion-strength)
2. packages/server/src/parsers/party-roster.ts (QA: verify byActivityRecencyDesc live sort)
3. packages/client/src/components/.../RelationshipPanel.tsx (QA: uncapped node/edge render)
4. packages/client/src/AppShell.tsx (QA: DOM order Header->Rail->ModeContent)
5. Re-run s3-drilldowns spec serial + npm run lint (QA)
6. SX: confirm test-only change, no product code touched

### Checkpoint — 02:xx - Reviewed s3-drilldowns.spec.ts. SA: pass. QA: pass. SX: secure.
### Checkpoint — verified party-roster.ts (live sort), RelationshipPanel.tsx (uncapped), AppShell.tsx (rail precedes ModeContent).

## Stage 3 — COMPLETE
- Verdict: PASS (SA=PASS, QA=PASS, SX=SECURE)
- FE#4 root cause (fixture-coupling + uncapped graph) VERIFIED; AUD#3 rail attribution DISPROVEN.
- Diff = spec only, +20/-2. lint EXIT 0. spec 8/8 serial. Assertion still fails on genuine a11y break (not vacuous).
- required_fixes: NONE
