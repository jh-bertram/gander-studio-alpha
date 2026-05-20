# Post-Mortem: Gander Studio P2 + P3
**Date:** 2026-03-16
**Project:** `~/projects/gander-studio-alpha/`
**Duration:** Single session — P2 planning through P3 E2E verification
**Final State:** Export loop fully functional; base-path picker live; all 13 agents parse correctly; port conflict message clean. One runtime issue (code-auditor visibility) required manual server kill after E2E — not caught by audit.

---

## 1. Original Request

**Human (2026-03-16):** Evaluate the app as-is and address known export loop bugs. Also raise architectural concern: app should be self-contained, not reach across directories for agent library.

**Brief files:**
- P2: `.claude/agents/tasks/outputs/gander-studio-p2-decompose-PM-1773960200.md`
- P3: `.claude/agents/tasks/outputs/gander-studio-p3-decompose-PM-1773960700.md`

**Scope at intake:**
- App code existed at `gander-studio-alpha/` as the initial alpha release
- Agent library lived in `~/projects/gander/` (cross-directory dependency)
- `GANDER_ROOT` pointed to gander project, not gander-studio-alpha itself
- No `.env` file — server would not start
- Export loop had 3 correctness bugs: wholesale settings.json copy (no hook filtering, stale paths), wrong CLAUDE.md content (gander project CLAUDE.md instead of orchestrator persona)

**Skill invoked:** Manual orchestration (P2); dispatch-task pattern (P3)

---

## 2. Agent Activity Log

### P2 — Export Loop Fixes (gander-studio-p2)

| Seq | Event | Agent | Notes |
|-----|-------|-------|-------|
| — | SPAWN | PM#0 | Decompose 4 export gaps |
| — | CRITIQUE_BLOCK | CR#1 | p2-002 scope inversion: "no orchestration content" is wrong intent |
| — | SPAWN | PM#0 | Revision: p2-002 rewritten to copy orchestrator.md as CLAUDE.md |
| — | COMPLETE | BE#1 | p2-001 + p2-002 sequential in one turn; lint clean |
| — | AUDIT_PASS | AUD#1 | All SA/QA/SX gates pass |
| — | ORC | — | .env created; agent library copied to gander-studio-alpha; GANDER_ROOT updated |

**Feedback loops:** 1 — PM's initial p2-002 spec inverted the human's intent. Critic correctly blocked.

**Root cause of p2-002 failure:** PM interpreted "generate a minimal CLAUDE.md" as a safe default without reading the human's architectural intent. The human explicitly stated "CLAUDE.md IS the orchestrator" in conversation — this was post-PM, pre-Critic context that the Critic correctly incorporated when given the full discussion transcript.

**Key design decision established:** `CLAUDE.md` = orchestrator persona (Zoey). `.claude/agents/*.md` = spawnable subagents. Export writes `orchestrator.md` content as `CLAUDE.md` in the target; orchestrator is filtered from `.claude/agents/` copy.

### P3 — Bugs from E2E Verification (gander-studio-p3)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 1 | 2026-03-16T00:02:30Z | CRITIQUE_BLOCK | CR#2 | 2 blockers: wrong Bug B diagnosis, underspecified path guard |
| 2 | 2026-03-16T00:00:05Z | COMPLETE | BE#1 | P3-001 schema migration + path guard |
| 3 | 2026-03-16T00:06:00Z | COMPLETE | BE#2 | P3-003a+b parser fix + auditor investigation |
| 4 | 2026-03-16T00:07:00Z | COMPLETE | BE#3 | P3-004 port conflict message |
| 5 | 2026-03-16T00:20:00Z | COMPLETE | FE#1 | P3-002 base directory input |
| 6 | 2026-03-16T00:30:13Z | AUDIT_PASS | AUD#1 | All 5 tasks PASS |

**Feedback loops:** 1 (planning only — CRITIQUE_BLOCK before any implementation started)

**Root cause of Blocker 1 (Bug B diagnosis):** PM assumed code-auditor was invisible due to the tier filter default. This was wrong — `browse-store.ts` already defaulted `tierFilter: 'all'`. PM did not read the browse store before writing the investigation steps. Critic read it and corrected the diagnosis.

**Root cause of Blocker 2 (path-traversal guard):** PM's success criterion said "must not contain `..` segments" — valid intent, underspecified mechanism. A `string.includes('..')` sole-check can be bypassed. Critic required the `path.resolve(x) === x` normalization pattern explicitly in the criterion, not just in risk_flags.

---

## 3. Post-Delivery: Runtime Bugs

### code-auditor Not Visible After P3-003b Fix

**Reporter:** Human (E2E browser verification, point 3)
**Error:** `code-auditor` card absent from Browse page after server restart
**Detected:** During human E2E walkthrough (P3-006), after P3-003b audit PASS

**Root cause:** `tsx watch` did not hot-reload `agent-parser.ts` after the `Promise.allSettled` fix was written. The server process was started before the fix landed and continued running old code. The `Promise.all` fail-fast behavior was silently dropping `code-auditor` from the response whenever another agent parse produced an unhandled rejection.

**Fix applied:** Killed stale server process (`lsof -ti:3001 | xargs kill -9`). Fresh server loaded updated `agent-parser.ts` and returned all 13 agents.

**Why agents did not catch this:** The P3-003b auditor verified correctness via static code analysis and direct `parseAllAgents()` invocation — both of which returned correct results. Neither check called the live tRPC endpoint (`/trpc/agent.list`) on the actually-running server. A running server returning 12 agents while the code reads 13 is only detectable via a live API call, not code review. The auditor's QA gate has no step that calls the live API.

---

## 4. QA Gap Analysis

**Current QA protocol:** Auditor reads modified source files, traces logic paths, and verifies behavioral claims made in completion packets. For BE tasks: traces code paths. For FE tasks: checks component logic and constants. SX: checks path traversal, npm audit.

**What this caught:**
- P3-001: Verified `path.resolve(x) === x` guard present in router.ts (code snippet confirmed)
- P3-002: Verified `BASE_PATH_PATTERN` in constants, not inline; `canExport` gating correct
- P3-003b: Verified `Promise.allSettled` present in agent-parser.ts; `AGENT_MATERIA['code-auditor']` confirmed in browse.ts
- P3-004: Verified try/catch and process.exit(1) for EADDRINUSE

**What this missed:**
- **Live server state:** Auditor confirmed code was correct but did not verify the running server was serving updated code. `tsx watch` failed to hot-reload — this discrepancy is only detectable by calling the live API, not by reading source files.
- **tsx watch reload guarantee:** No step in the audit protocol verifies that the dev server has reloaded after a file change. The assumption that `tsx watch` always hot-reloads is false.

**Recommendations:**
- Add to auditor QA checklist for BE tasks that modify server-side files: "After confirming code is correct, call the live tRPC endpoint (`curl http://localhost:3001/trpc/{procedure}`) and verify the response matches expected output. If the server is not running, note this and flag for human E2E verification."
- Add to E2E verification checklist (P-006 pattern): "Before starting browser walkthrough, confirm server PID matches the process started in this session (`lsof -ti:3001`). If a stale process is detected, kill and restart before testing."

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM | 2 sprints × 1 plan each | 0% first-pass (both blocked by Critic) | Both blocks were legitimate and correct calls |
| CR (Critic) | 2 sprints | N/A — veto role | CR#1 caught p2-002 inversion; CR#2 caught Bug B wrong diagnosis + underspecified guard |
| BE | P2: 1 task, P3: 3 tasks | 100% first-pass | All lint clean; one lint was manually verified after sandbox denied Bash |
| FE | P3: 1 task | 100% first-pass | Lint clean; A11Y patterns correct |
| AUD | P2: 1 audit, P3: 1 audit | 100% correct verdicts | P3 missed live-server state — a QA protocol gap, not an auditor error per se |

**Most impactful single agent action:** CR#1 blocking p2-002. The PM had written a spec that would have produced a CLAUDE.md with zero orchestration content — the opposite of the human's stated intent. A single Critic turn caught this before any BE agent wrote a line of code. Cost: one planning revision cycle. Benefit: prevented a shipped bug that would have silently broken every exported loadout's Claude session identity.

**Recurring failure pattern:** PM wrote plans without reading key referenced files before assigning investigation steps. In P2, the CLAUDE.md/orchestrator relationship required human input to surface. In P3, the tier-filter bug diagnosis required reading `browse-store.ts` (which the Critic did; the PM did not).

---

## 6. Protocol Gaps Identified

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| PM does not read referenced source files before writing investigation tasks | Led to wrong Bug B diagnosis (P3-003b) — Critic fix added one planning cycle | Add to `pm.md` pre-flight: "For any task that includes an investigation step, read the relevant source files before writing the investigation path. Do not write 'check X' if you haven't confirmed X is plausible by reading the file." |
| Auditor QA does not call live API after BE fixes | `code-auditor` post-delivery bug was missed — `Promise.allSettled` fix confirmed in code but not in running server | Add to `auditor.md` QA checklist: "For BE tasks modifying server-side files: call `curl http://localhost:3001/trpc/{procedure}` and verify the response. If server unreachable, flag as UNVERIFIED (not PASS) and require human E2E to confirm before sprint closes." |
| tsx watch hot-reload not guaranteed | Server silently ran stale code after agent-parser.ts was modified | Add to E2E verification template: "Step 0 — before testing: confirm running server loaded current code. Check `lsof -ti:3001` PID matches this session. If in doubt, kill and restart." |
| Bash permission denied in background agents | BE#2 (P3-003ab) and BE#3 (P3-004) could not run `npm run lint` — manual verification required | Note in orchestrator dispatch: "Background agents may be denied Bash execution. For lint-critical tasks, dispatch as foreground agents or run lint manually after each background agent completes." |

---

## 7. Final Deliverable State

**App:** `~/projects/gander-studio-alpha/`
**Build:** `npm run lint` exit 0 — all three packages typecheck clean
**Runtime:** Confirmed working after fresh server start

**Features delivered (P2):**
- Export generates filtered `settings.json` (selected hooks only, command paths rewritten to target)
- Export writes `orchestrator.md` content as `CLAUDE.md` in target — exported loadout opens as Zoey
- `orchestrator.md` filtered from `.claude/agents/` copy in export
- Agent library (13 agents + 17 skills) copied into `gander-studio-alpha/.claude/`
- `GANDER_ROOT` now points to `gander-studio-alpha` itself — fully self-contained

**Features delivered (P3):**
- Export page "Base Directory" input — per-export target path with `path.resolve()` guard
- `parseAllAgents` uses `Promise.allSettled` — single bad agent file no longer drops all agents
- Empty-name agents filtered at parser level with stderr logging
- Graceful `EADDRINUSE` message on port conflict (`lsof` hint + exit 1)
- `ExportInputSchema` moved to `packages/shared/src/schemas.ts`

**Key contracts:**
- tRPC endpoint: `http://localhost:3001/trpc/{procedure}`
- Export target: `{targetBasePath ?? EXPORT_BASE_DIR}/{targetDirName}/`
- Path guard: `path.resolve(targetBasePath) === targetBasePath && startsWith('/')`
- CLAUDE.md in export: full raw content of `GANDER_ROOT/.claude/agents/orchestrator.md`
- Agent parse: gray-matter primary, `parseFrontmatterFallback` on YAMLException; `Promise.allSettled` with stderr logging for parse failures
- `npm run dev`: requires `.env` with `GANDER_ROOT` and `LOADOUTS_DIR`; loaded via `node --env-file=.env`
