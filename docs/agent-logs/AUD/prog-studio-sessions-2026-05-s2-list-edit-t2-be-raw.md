# AUD Log — prog-studio-sessions-2026-05-s2-list-edit / t2-be-raw

## Stage 1 — RECEIVED
- from: orchestrator
- at: 2026-05-20
- task_id: prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw
- prompt (first 800 chars): Auditing task t2-be-raw. BE#1 added session.getRaw tRPC query. Files: router.ts, schemas.ts. SessionRawOutputSchema + SessionRawInputSchema; session.getRaw ({id}->{content}) QUERY. Mirrors session.get inline readdir over path.join(dir,'docs','post-mortems'); id-OR-sprint match; reads filePath (original source) even if editedFilePath set; NOT_FOUND + INTERNAL_SERVER_ERROR branches; re-throws TRPCError before outer catch continue; client input is id only. Run full SA+QA+SX gate.

## Stage 2 — PLAN
Audit order (cheapest-first SA -> QA -> SX):
1. git diff HEAD -- packages/shared/src/schemas.ts (SA: schema naming, z.infer, boundary)
2. git diff HEAD -- packages/server/src/router.ts (SA: strict TS, path handling, scope)
3. Confirm diff touches ONLY router.ts + schemas.ts; SessionSchema/list/get/getStats/saveEdit untouched
4. QA: npm run lint; server test suite (vitest); real-corpus smoke for getRaw
5. SX: path traversal probe (../ in id); error-path-leak parity; no new deps

### Checkpoint — schemas.ts. SA: pass. (new schemas only, SessionSchema untouched, correct naming + z.infer)
### Checkpoint — router.ts. SA: pass. (getRaw mirrors session.get scan; reads filePath not editedFilePath; TRPCError re-throw guard correct; scope clean)

## Stage 3 — running QA gate (lint + tests + smoke)

### Checkpoint — QA. lint exit 0; 35/35 server tests pass; getRaw smoke PASS (valid id 14870 chars, sprint-match, bogus->NOT_FOUND). QA: pass.
### Checkpoint — SX. 4 traversal probes -> NOT_FOUND no escape; no new deps; lockfile unchanged. SECURE. (LOW note: getRaw L527 surfaces raw fs err.message vs export.spawn's static msgs; path already exposed via SessionSchema.filePath -> non-blocking parity style note.)

## Stage 3 — COMPLETE
VERDICT: PASS. SA: PASS | QA: PASS | SX: SECURE.
Non-blocking LOW: router.ts:527 INTERNAL_SERVER_ERROR returns raw (err as Error).message (may include abs path) vs sibling export.spawn static messages. Not a leak across a privilege boundary (filePath is already in session.get/list response contract). Optional hardening, not required for close.
