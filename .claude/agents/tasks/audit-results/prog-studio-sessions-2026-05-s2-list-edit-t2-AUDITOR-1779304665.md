# Audit — t2-be-raw (session.getRaw) — prog-studio-sessions-2026-05-s2-list-edit

Auditor: AUDITOR#1 | Date: 2026-05-20 | Verdict: **PASS**
SA: PASS | QA: PASS | SX: SECURE

## audit_review (SA)
```xml
<audit_review>
  <target_files>packages/shared/src/schemas.ts, packages/server/src/router.ts</target_files>
  <status>PASS</status>
  <scope_check>
    git diff HEAD under packages/ touches ONLY router.ts + schemas.ts.
    SessionSchema NOT modified (diff inserts SessionRawInput/OutputSchema AFTER it).
    session.list / get / getStats / saveEdit unchanged (no diff hunks in those ranges).
  </scope_check>
  <findings>
    - Zod boundary: SessionRawInputSchema = z.object({id:z.string()}), SessionRawOutputSchema = z.object({content:z.string()}); both with z.infer types. Correct <Entity>InputSchema / <Entity>OutputSchema naming. PASS.
    - .output(SessionRawOutputSchema) bound on the procedure. .input uses inline z.object({id}) — consistent with sibling get/getStats/saveEdit inline-input convention (not a DRY violation; established pattern). SessionRawInputSchema exported but unused by router — harmless, available to client.
    - TypeScript strict: no unjustified `any`. Casts (err as Error) match codebase convention.
    - No hardcoded secrets. No string-interpolated FS path from client input — readFile target is session.filePath (on-disk parsed), input.id only used for equality match.
    - kebab-case files / conventional structure preserved.
    - Reads session.filePath (original source), NOT editedFilePath — matches packet claim and inline comment.
    - TRPCError re-throw guard (L533 `if (err instanceof TRPCError) throw err`) correctly prevents the inner INTERNAL_SERVER_ERROR (L525) from being swallowed by the outer catch's `continue`.
    - Scan path path.join(dir,'docs','post-mortems') — identical to session.get (L428). Confirmed by smoke (scanning `dir` directly would return empty; got 14870-char content).
  </findings>
  <violations>(none)</violations>
</audit_review>
```

## test_report (QA)
```xml
<test_report>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw</task_id>
  <status>PASS</status>
  <lint>tsc --noEmit x3 (shared, server, client) — exit 0, no diagnostics.</lint>
  <test_coverage>server unit/integration — 4 files, 35 passed, 0 failed (vitest run, 632ms).</test_coverage>
  <playwright><tier>SKIPPED — BE task (no ui_packet)</tier></playwright>
  <real_corpus_smoke>
    Throwaway tsx caller against this repo's docs/post-mortems/ (6 files), SESSIONS_SOURCE_DIRS=repo root. Script removed post-run; tree clean.
    REAL id=gander-studio-p1-materia-canvas filePath=.../docs/post-mortems/gander-studio-p1-materia-canvas.md
    TEST1 valid-id        => PASS (content len=14870, startsWith "# Post-Mortem"=true)
    TEST1b sprint-match   => PASS (id-OR-sprint match works)
    TEST2 bogus-id        => PASS (code=NOT_FOUND)
  </real_corpus_smoke>
  <defects>(none)</defects>
</test_report>
```

### Quoted output
```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
(exit 0 — no output)
```
```
> @gander-studio/server@0.1.0 test
> vitest run src/parsers/__tests__
 Test Files  4 passed (4)
      Tests  35 passed (35)
   Duration  632ms
```

## security_audit (SX)
```xml
<security_audit>
  <status>SECURE</status>
  <threat_level>LOW</threat_level>
  <path_traversal>
    Client supplies id only; readFile path = session.filePath (server-derived from on-disk parse), never input.
    Probes (all returned NOT_FOUND, no escape, no /etc/passwd leak):
      ../../../../etc/passwd  => NOT_FOUND
      ../../../etc/passwd     => NOT_FOUND
      %2e%2e%2fetc%2fpasswd   => NOT_FOUND
      /etc/passwd             => NOT_FOUND
    A traversal id simply fails the id===input.id / sprint===input.id equality check -> falls through to NOT_FOUND. No FS access driven by input string.
  </path_traversal>
  <dependencies>No package.json / lockfile change. npm audit posture unchanged. No new dependency.</dependencies>
  <findings>
    <observation severity="LOW" blocking="false">
      <location>packages/server/src/router.ts:525-528</location>
      <description>INTERNAL_SERVER_ERROR branch returns raw (err as Error).message, which for a Node fs failure would include the absolute filePath. Siblings (export.spawn L312/L370/L383) use static non-leaking messages, so this is a parity deviation. NOT a privilege-boundary leak: the absolute path is session.filePath, already part of SessionSchema and returned to the client by session.get / session.list. The branch only fires on a genuine fs race (file matched in readdir+parse, then unreadable on the subsequent read). Optional hardening: use a static message e.g. 'Failed to read session source file'. Not required for close.</description>
    </observation>
  </findings>
</security_audit>
```

## Verdict
**PASS** — SA PASS, QA PASS, SX SECURE. Code matches the completion_packet exactly (mirrors session.get scan, id-OR-sprint, reads filePath not editedFilePath, NOT_FOUND + INTERNAL_SERVER_ERROR branches, TRPCError re-throw before outer continue, client input id only). One non-blocking LOW security/style note recorded for optional follow-up. No remediation_request.
