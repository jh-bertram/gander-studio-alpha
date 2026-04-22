# BE Output — gander-studio-p2-canvas-link-001a

## Task
Extend shared Zod schemas with `connections` on LoadoutSchema and `communicates_with` on AgentSchema.
Update agent-parser.ts to parse communicates_with via comma-split normalization.
Update router.ts agentRouter.save to serialize communicates_with as comma-delimited frontmatter.

## Files Modified

1. `packages/shared/src/schemas.ts`
2. `packages/server/src/parsers/agent-parser.ts`
3. `packages/server/src/router.ts`

## Schema Changes

### AgentSchema (packages/shared/src/schemas.ts, line 11)
Added:
```typescript
communicates_with: z.array(z.string()).optional(),
```
Placed between `tier` and `body` fields. Because it is `.optional()`, existing agent files without this frontmatter key parse correctly — the field is absent (undefined) in the result.

### LoadoutSchema (packages/shared/src/schemas.ts, line 40)
Added:
```typescript
connections: z.array(z.object({ source: z.string(), target: z.string() })).default([]),
```
The `.default([])` means existing loadout JSON files that lack a `connections` key parse successfully — they receive an empty array.

## Parser Changes (packages/server/src/parsers/agent-parser.ts)

Added a `communicates_with` normalization block at lines 51-59, immediately after the existing `tools` normalization block (lines 43-49). The pattern is identical:

- If `data.communicates_with` is a string (gray-matter produced a comma-string, or parseFrontmatterFallback produced a raw line value), split on `,`, trim each element, filter empty strings. If result is empty array, set to `undefined`.
- If `data.communicates_with` is already an array (gray-matter parsed a YAML list), map to String, filter empty. If result is empty array, set to `undefined`.
- If absent: `communicates_with` remains `undefined` (the `let` initializer).

`communicates_with` is then passed into `AgentSchema.parse({...})`.

**Round-trip consistency:**

- `parseFrontmatterFallback` reads each line as `key: rest-of-line` (raw string). A line `communicates_with: be, fe, ds` produces `data.communicates_with = "be, fe, ds"` (string). The normalization block splits this to `["be", "fe", "ds"]`.
- `gray-matter` / js-yaml can parse the same line as either a string or a YAML sequence. Both branches are handled.
- `router.ts` serializes as `communicates_with: be, fe, ds\n` — a single comma-delimited line. This is what `parseFrontmatterFallback` will read back as a raw string, completing the round trip.

## Router Changes (packages/server/src/router.ts)

Added `communicatesLine` variable in `agentRouter.save` (lines 84-87):
```typescript
const communicatesLine =
  input.communicates_with && input.communicates_with.length > 0
    ? `communicates_with: ${input.communicates_with.join(', ')}\n`
    : '';
```
Appended `communicatesLine` to the content template after `tierLine` (line 97). When `communicates_with` is undefined or empty, the line is omitted entirely — preserving the existing file format for agents that don't use this field.

## Backward Compatibility

- `LoadoutSchema.parse({ name: "x", agents: [], skills: [], hooks: [], createdAt: "" })` — succeeds. The `connections` field has `.default([])`, so its absence in input is filled by Zod.
- `AgentSchema.parse({...})` without `communicates_with` — succeeds. The field is `.optional()`.
- All existing agent .md files are unaffected at read time: the parser produces `communicates_with = undefined`, which is valid per the schema.

## communicates_with Collision Check

Grep on `/home/jhber/projects/gander/.claude/agents/**/*.md` for `communicates_with`: **No matches found.** No existing agent files use this key. No collision risk.

## Build / Lint

> NOTE: Bash tool access was denied in this session. `npm run lint` could not be executed automatically.
> The changes are TypeScript-strict-compatible: all new fields are properly typed, no implicit `any`, no `as` casts. The `communicates_with` variable is explicitly typed as `string[] | undefined`. The `connections` field uses a fully-typed inline Zod object schema.
> Please run `npm run lint` from `/home/jhber/projects/gander-studio-alpha` to confirm. Expected result: PASSING.

## Security Pre-Flight

- No `path.join` or `fs.*` calls use user-supplied `communicates_with` or `connections` data.
- No raw `Error.message` forwarded from `fs.*` calls (no new fs operations added).
- No path manipulation introduced.
- All changes are pure data-schema and serialization logic.
