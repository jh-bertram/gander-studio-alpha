# CR Log — prog-studio-vision-2026-06-s5-cleanup-docs

## Stage 1: RECEIVED
- Adversarial review of s5 cleanup plan (DELETE/MERGE/RECONCILE/DOCS).
- ORC priorities: SEAM-05 over-deletion; behavior-changing merges (findSessionById, ErrorState);
  role-color call-path enumeration grounded vs assumed; CLAUDE.md count (22). BLOCK only on real
  over-deletion or behavior-changing merge.

## Stage 2: PLAN
Six dimensions. Files read: standards.md, p7-graph-viz post-mortem, router.ts, schemas.ts,
compose-store.ts, agent-roles.ts, compose.ts, browse.ts, canvas-store.ts, MateriaNode.tsx,
DESIGN.md (DR-A/DR-B), ErrorState x4 (BrowsePage/SessionListPage/SessionDetailPage/AnalyzeTab),
sessions.ts (SESSION_TABS), accordion.tsx, deferred-work.md, globals.css redb sites.

## Findings
- DEPENDENCY: DELETE→DOCS ordering on deferred-work.md must be serial (advisory).
- tRPC count = 22 VERIFIED against router.ts (PM correct; brief's 20 is stale).
- SEAM-05: only addAgent/addSkill/addHook dead (verified). removeAgent/removeSkill/loadLoadout/
  resetLoadout/setLoadoutName/removeHook LIVE — PM preserves them. OK.
- Schemas: SessionRawInput/AggregateStatsInput type aliases dead (verified word-boundary);
  *Schema exports LIVE (router.ts 16,18,580,613). PM preserves schemas. OK.
- OVER-DELETION FOUND: SESSION_TABS is LIVE (SessionDetailPage 2,118,119,137,141,235); no placeholder
  entries exist. "SESSION_TABS placeholder machinery" misclassified. BLOCKER.
- BEHAVIOR-CHANGE FOUND: AnalyzeErrorState fallback msg differs ('Failed to load analysis data.')
  vs other 3 ('An unexpected error occurred.'). Naive 4→1 merge regresses Analyze. BLOCKER.
- ROLE-COLOR under-enumerated: PM missed archivist (--mg, should --mb), dispatcher (--my, should
  --mp), HR (fragment→--mr, should --mp). role drives color only, not behavior. WARNING + audit risk.
- findSessionById merge: 3 loops genuinely non-identical; helper {session,dir} preserves getRaw guard. OK.
- redb 4.8:1 overclaim = exactly 3 live sites (verified). OK.
- accordion.tsx self-contained dead. git rm safe. Geist live via --font-sans:239 — PM R7 guard covers.
- recurring_pattern declared by PM (line 361). No MISSING_RECURRENCE_DECLARATION.
- No sc-precheck-report.json on disk; PM surfaced ORC must generate (script in gander repo). Advisory.

## Stage 3: COMPLETE — verdict BLOCK (2 BLOCKERs)
