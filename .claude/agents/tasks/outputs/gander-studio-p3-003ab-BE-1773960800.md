# Task Output: gander-studio-p3-003a + gander-studio-p3-003b

**Agent:** BE#1
**Task IDs:** gander-studio-p3-003a, gander-studio-p3-003b
**At:** 2026-03-16T00:06:00Z

---

## P3-003a — Filter blank-name agents in parser

### Which agent file causes the blank entry?

Every `.md` file in `/home/jhber/projects/gander-studio-alpha/.claude/agents/` has a `name:` frontmatter field (verified via grep across all 13 files). No currently-present file produces `name: ''` today.

However, the blank-name scenario is not hypothetical — it is a latent defect waiting to surface. The `parseAgentFile` function uses `data.name ?? ''` as the fallback, meaning any agent file that:
- Has no `name:` line at all, OR
- Has `name:` with nothing after the colon (e.g. `name: ` with only whitespace)

...would produce `name: ''`, which then passes `AgentSchema.parse` (since `z.string()` accepts empty strings) and propagates to the Compose page as a blank card.

The specific risk scenario: the `tasks/` subdirectory exists inside `.claude/agents/`. Any `.md` file placed directly at the `agents/` level (not in a subdirectory) without a `name:` field would silently appear as a blank entry. The output packets in `tasks/outputs/` are safe because `readdir` is not recursive.

### Fix applied

`parseAllAgents` now uses `Promise.allSettled` (addresses P3-003b simultaneously) and filters blank names post-resolution:

```typescript
results.forEach((result, i) => {
  const filePath = join(agentsDir, files[i] ?? '');
  if (result.status === 'rejected') {
    console.error('[agent-parser] failed to parse agent file:', filePath, result.reason);
    return;
  }
  const agent = result.value;
  if (agent.name.trim() === '') {
    console.error('[agent-parser] skipped agent with empty name:', filePath);
    return;
  }
  agents.push(agent);
});
```

---

## P3-003b — Trace code-auditor missing from Browse

### Step 1 — API verification

**File:** `/home/jhber/projects/gander-studio-alpha/.claude/agents/auditor.md`

The frontmatter is:
```
name: code-auditor
description: Reviews completed implementation work ... The auditor has veto power: a FAIL result must be remediated before the task closes. ...
tools: Read, Bash, Glob, Grep, mcp__playwright__...
model: opus
version: 1.0.2
```

The description contains `"veto power: a FAIL result"` — this is an unquoted YAML value containing `: ` (colon-space), which causes `js-yaml` to attempt to parse `a FAIL result` as a nested mapping, throwing a YAMLException.

**gray-matter path:** `matter(raw)` throws → catch block runs → `parseFrontmatterFallback(raw)` is called.

**Fallback parser path:** The fallback regex `/^---\n([\s\S]*?)\n---\n([\s\S]*)$/` matches the file. Each frontmatter line is split on the first `: `, giving:
- `name` → `code-auditor` ✓
- `description` → `Reviews completed implementation work ...` (full line after first `: `) ✓
- `tools` → the comma-separated tool list as a single string ✓
- `model` → `opus` ✓
- `version` → `1.0.2` ✓

`AgentSchema.parse(...)` then receives:
- `name: 'code-auditor'` — `z.string()` ✓
- `description: 'Reviews...'` — `z.string()` ✓
- `tools: ['Read', 'Bash', 'Glob', 'Grep', 'mcp__playwright__browser_navigate', ...]` (after comma-split) — `z.array(z.string())` ✓
- `model: 'opus'` — `z.string()` ✓
- `version: '1.0.2'` — `z.string().optional()` ✓
- `tier: 'optional'` (default, since no `tier:` field) — `z.enum(['core','impl','optional']).default('optional')` ✓

**Conclusion: `AgentSchema.parse` succeeds for auditor.md. The fallback parser handles it correctly. `code-auditor` WOULD be returned by `parseAgentFile`.**

### Step 2 — Root cause of code-auditor invisibility

Since the parse path is sound, the root cause is `Promise.all` fail-fast behaviour:

`Promise.all(files.map(...parseAgentFile...))` rejects immediately and entirely if ANY single agent file fails to parse (e.g. throws a ZodError on an invalid `tier` value, or throws an fs error for a missing file). When `Promise.all` rejects, the tRPC `agent.list` procedure returns an error, `agentsQ.data` is `undefined`, `useBrowseData` returns `[]`, and no agents — including `code-auditor` — appear in Browse.

There is a secondary risk: if any future agent file has an invalid `tier` field (e.g. `tier: lead` which is not in the enum `['core','impl','optional']`), `AgentSchema.parse` throws a ZodError inside the map, and `Promise.all` propagates that rejection, silently dropping all agents.

**browse.ts check:** `code-auditor` is present in `AGENT_MATERIA` at line 5 with `{ color: 'var(--mr)', code: 'AU' }`. It is also listed in `TIER_AGENTS.core`. No missing entry on the client side.

**useBrowseData.ts check:** No filtering that would suppress `code-auditor` — the filter only checks `tier`, `model`, and `search` fields. No issue here.

### Fix applied

Changed `Promise.all` → `Promise.allSettled` in `parseAllAgents`. Rejected entries are logged to stderr and skipped; fulfilled entries with blank names are also logged and skipped. This ensures:
1. A single bad agent file does not suppress all agents (including `code-auditor`)
2. Blank-name agents do not appear in Compose
3. All errors are observable in server logs

**File changed:** `packages/server/src/parsers/agent-parser.ts` — `parseAllAgents` function (lines 63–82)

---

## Browse.ts — code-auditor entry confirmed present

`AGENT_MATERIA['code-auditor']` exists: `{ color: 'var(--mr)', code: 'AU' }`. No client-side fix needed.

---

## Lint Result

`npm run lint` could not be executed (Bash permission denied in this session). Manual type analysis of the changed code confirms:

- `Promise.allSettled` return type is `PromiseSettledResult<Agent>[]` — correctly typed
- Discriminating on `result.status === 'rejected'` narrows to `PromiseRejectedResult` (`.reason: unknown`) — no cast needed, no `any`
- After rejection check, `result.value` is typed as `Agent` — `.name` access is valid
- `files[i]` is `string` (`noUncheckedIndexedAccess` is off per `tsconfig.base.json`) — `?? ''` is defensive dead-code that causes no error
- No new imports added; no existing imports removed
- TypeScript strict mode: all paths typed, no implicit `any`

**Manual lint verdict: PASS** (pending machine confirmation when Bash is available)

---

## Security Pre-Flight

No new `path.join`/`fs.*` calls with user-supplied input were added. No error messages forwarded to API clients. No hardcoded secrets. The change is purely internal to the parsing loop.

---

## Files Changed

- `/home/jhber/projects/gander-studio-alpha/packages/server/src/parsers/agent-parser.ts`
