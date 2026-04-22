# Task Output — gander-studio-p3-004

**Task:** Graceful EADDRINUSE message
**Agent:** BE
**Date:** 2026-03-16

---

## Summary

Wrapped the `server.listen(...)` call in `packages/server/src/server.ts` in a try/catch block. On `EADDRINUSE`, a human-readable message is written to stderr and the process exits with code 1. All other errors are re-thrown unchanged.

---

## Exact stderr message string

When port 3001 is already in use, the following is written to `process.stderr`:

```
✗ Port 3001 is already in use.
  Kill the existing process: lsof -ti:3001 | xargs kill -9
  Then run: npm run dev
```

The port number is interpolated from `SERVER_PORT` at runtime (respects `SERVER_PORT` env var overrides).

---

## Non-EADDRINUSE error propagation

The catch block is:

```typescript
} catch (err) {
  if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
    process.stderr.write(
      `✗ Port ${SERVER_PORT} is already in use.\n` +
      `  Kill the existing process: lsof -ti:${SERVER_PORT} | xargs kill -9\n` +
      `  Then run: npm run dev\n`
    );
    process.exit(1);
  }
  throw err;
}
```

Any error whose `.code` is not `'EADDRINUSE'` (e.g. `EACCES`, `ENOTFOUND`, unexpected Fastify plugin errors) falls through to `throw err`, re-throwing with the original stack trace intact. This preserves the existing behaviour for all non-port-conflict errors.

---

## Lint result

```
npm run lint
> tsc --noEmit --project packages/shared/tsconfig.json && \
  tsc --noEmit --project packages/server/tsconfig.json && \
  tsc --noEmit --project packages/client/tsconfig.json

(exit 0 — no errors)
```

All three packages typecheck clean. `NodeJS.ErrnoException` is available as a built-in Node.js global type — no import required.

---

## Runtime test result

**Test procedure:**

1. Terminal 1: `npm run dev` — server starts, listening on port 3001
2. Terminal 2 (with Terminal 1 running): `npm run dev` again

**Expected output on Terminal 2 stderr (instead of a raw Node/Fastify stack trace):**
```
✗ Port 3001 is already in use.
  Kill the existing process: lsof -ti:3001 | xargs kill -9
  Then run: npm run dev
```
Process exits with code 1.

**Sandbox note:** The agent sandbox blocked process-spawning Bash commands (`Permission denied`), preventing automated execution of the two-terminal test within this session. The TypeScript implementation is correct and typechecks clean. The logic is straightforward: `server.listen()` throws a rejection with `err.code === 'EADDRINUSE'` when the port is occupied — this is standard Fastify/Node.js behaviour, and the try/catch correctly intercepts it.

**Manual verification:** Run the two-terminal test above to confirm the formatted message appears (not a Fastify stack trace). The `process.stderr.write()` call bypasses any Fastify logger and writes directly to stderr, ensuring visibility even when the concurrently runner is active.

---

## Files changed

| File | Change |
|------|--------|
| `packages/server/src/server.ts` | Wrapped `server.listen()` in try/catch; EADDRINUSE → formatted stderr + exit(1); other errors re-thrown |

---

<completion_packet>
  <task_id>gander-studio-p3-004</task_id>
  <files_changed>packages/server/src/server.ts</files_changed>
  <zod_contract>N/A — no API boundary change; this is a startup error handler only</zod_contract>
  <test_traceback>
    npm run lint → EXIT 0 (all three packages clean).
    Runtime EADDRINUSE test: sandbox blocked process-spawning Bash; implementation typechecks correctly and logic is straightforward (try/catch on awaited server.listen, EADDRINUSE check, stderr write, process.exit(1), re-throw for all other codes).
    Manual two-terminal test required to confirm formatted message in output.
  </test_traceback>
  <critical_logic_notes>
    - process.stderr.write() is used instead of console.error() to avoid any potential buffering differences and make the intent explicit.
    - The port number is interpolated from SERVER_PORT so the message is accurate when a non-default port is configured.
    - The kill hint uses lsof -ti:{port} | xargs kill -9, which works on macOS and Linux.
    - Non-EADDRINUSE errors are re-thrown with `throw err` (not `throw new Error(...)`) to preserve the original stack trace.
    - No security concerns: no user input, no path manipulation, no API exposure.
  </critical_logic_notes>
</completion_packet>
