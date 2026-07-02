## [STAGE 1] RECEIVED
- **From:** Orchestrator (prog-studio-vision-2026-06)
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** prog-studio-vision-2026-06-s2-fix-broken-surfaces-t2
- **Message received:**
  > Fix D4 (slug) and D6 (saveEdit round-trip). Make REAL edits. D4: replace split(/\s+/)[0] case-sensitive matching with toSlug()/session.id case-insensitive matching at all 3 sites; add a zero-match guard+log; add a fixture proving a prose-H1 session yields non-zero events/stats. D6: getRaw round-trips edited content (prefer SESSIONS_EDITS_DIR/{id}.md when present, path-guarded) and/or populate editedFilePath; declare BOTH input AND output Zod schemas in schemas.ts (z.infer types); add write-then-read-back test. …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-06-20T00:01:00Z
- **Approach:**
  1. Verify current state: router.ts slug sites at :455/:499/:539, saveEdit at :504-515, getRaw at :552-572; schemas.ts SessionRawOutputSchema; session-parser.ts toSlug (not exported)
  2. D4 fix (router.ts): ADDITIVE — keep split(/\s+/)[0] as primarySlug, add fallback using session.id (already a lowercase slug from filename stem). If primarySlug yields 0 events, try session.id. Add guard log when primarySlug yields 0. Apply identically at all 3 sites (:455/:499/:539).
  3. D6 fix (router.ts): In getRaw, after locating the session, use validateSaveEditPath to get the edits-dir path, stat() it to check existence, and read that file instead of session.filePath if it exists. Wrap with same path guard. Export editedFilePath in response.
  4. D6 schema (schemas.ts): Update SessionRawOutputSchema to add optional editedFilePath field; update SessionRawOutput type via z.infer. The input schema SessionRawInputSchema already exists. Types already use z.infer.
  5. Tests: Add fixture for prose-H1 slug (D4) and write-then-read-back (D6) to event-log-parser.test.ts or a new router-slug.test.ts
  6. Verify no changes to session-parser.ts:171-185 (t3's territory), toSlug not needed as import since session.id is already the normalized slug

- **Files to create/modify:**
  - `packages/server/src/router.ts` — D4 additive slug fallback + guard log at 3 sites; D6 getRaw edits-dir prefer
  - `packages/shared/src/schemas.ts` — SessionRawOutputSchema: add optional editedFilePath
  - `packages/server/src/parsers/__tests__/slug-and-savedit.test.ts` — new tests (prose-H1 + write-then-read-back)

- **Dependencies / assumptions:**
  - session.id is toSlug(filenameStem) — verified in session-parser.ts:240
  - gander-studio-p2-p3.md is a prose-H1 Format B file — VERIFIED (H1: "# Post-Mortem: Gander Studio P2 + P3", no frontmatter)
  - validateSaveEditPath is a pure path guard, safe to call in getRaw — VERIFIED
  - SESSIONS_EDITS_DIR is accessible via env import — VERIFIED in router.ts:5
  - SessionRawOutputSchema is already in schemas.ts but only has { content } — needs editedFilePath added
  - The existing event-log fixture (agent-events-fixture.jsonl) uses task_id "prog-studio-sessions-2026-05-s1-backend-t3"; need separate fixture for prose-H1 test with task_id "gander-studio-p2-p3-..."

### Checkpoint — 10:36:00
- Wrote `packages/shared/src/schemas.ts` (added editedFilePath optional field to SessionRawOutputSchema). Next: D4 router fixes.

### Checkpoint — 10:36:10
- Wrote `packages/server/src/router.ts` (D4: extracted resolveSessionEvents helper with split/[0] primary + session.id fallback at all 3 sites; D6: getRaw prefers SESSIONS_EDITS_DIR via validateSaveEditPath; import SessionRawInputSchema; opaque error messages). Next: fixture + tests.

### Checkpoint — 10:36:20
- Wrote `packages/server/src/parsers/__tests__/fixtures/agent-events-gander-studio-p2-p3.jsonl` (8 matching + 1 unrelated). Next: tests.

### Checkpoint — 10:36:30
- Wrote `packages/server/src/parsers/__tests__/slug-and-saveedit.test.ts` (9 tests). All 76 server tests pass.

## [STAGE 3] COMPLETE
- **At:** 2026-06-20T10:36:21Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | packages/shared/src/schemas.ts | +7 | SessionRawOutputSchema updated with editedFilePath optional |
  | packages/server/src/router.ts | +42 net | resolveSessionEvents helper (DRY, 3 sites); getRaw prefers edits dir; SessionRawInputSchema imported |
  | packages/server/src/parsers/__tests__/fixtures/agent-events-gander-studio-p2-p3.jsonl | 9 lines | Prose-H1 fixture (8 matching seqs + 1 unrelated) |
  | packages/server/src/parsers/__tests__/slug-and-saveedit.test.ts | 125 lines | 9 tests: D4 (prose-H1 + no-regression) + D6 (round-trip) |
- **Lint / tests:** 76/76 server tests pass (vitest run packages/server/)
- **Open items:** none
