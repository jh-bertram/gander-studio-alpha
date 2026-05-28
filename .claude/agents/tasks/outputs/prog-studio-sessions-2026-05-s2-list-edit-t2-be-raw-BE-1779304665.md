# completion_packet — prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw

**Agent:** BE#1
**Task:** t2-be-raw — session.getRaw tRPC query
**Sprint:** prog-studio-sessions-2026-05-s2-list-edit

## Files Changed

- `packages/shared/src/schemas.ts` — added SessionRawInputSchema + SessionRawOutputSchema + inferred types
- `packages/server/src/router.ts` — imported SessionRawOutputSchema; added getRaw procedure to sessionRouter

## Zod Contract

### packages/shared/src/schemas.ts (additions)

```ts
export const SessionRawInputSchema = z.object({ id: z.string() });
export type SessionRawInput = z.infer<typeof SessionRawInputSchema>;

export const SessionRawOutputSchema = z.object({ content: z.string() });
export type SessionRawOutput = z.infer<typeof SessionRawOutputSchema>;
```

### session.getRaw procedure (router.ts)

Input: `z.object({ id: z.string() })`
Output: `SessionRawOutputSchema` → `{ content: string }`
Type: QUERY

Implementation mirrors session.get's inline readdir scan verbatim:
- Iterates SESSIONS_SOURCE_DIRS
- For each dir: reads `path.join(dir, 'docs', 'post-mortems')`, filters .md files
- Parses each with `parseSessionFile`
- Matches on `session.id === input.id || session.sprint === input.id`
- On first match: reads `session.filePath` (original source, never editedFilePath) via `readFile`
- NOT_FOUND thrown after exhausting all dirs
- INTERNAL_SERVER_ERROR thrown on file read failure
- Client input is `id` only — no filePath accepted from client

## Lint Result

```
npm run lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
[exit 0]
```

## Security Pre-flight

- Path traversal: `session.filePath` comes from `parseSessionFile` (on-disk parse result), NOT from client input. Client provides `id` only.
- No `startsWith(root)` without `path.sep` — no path guard required here since filePath is server-originated.
- File read error: throws INTERNAL_SERVER_ERROR with `err.message` as required by the spec.
- No hardcoded validation constants.
- DRY: inline readdir pattern is intentionally duplicated per PM plan ("mirror session.get's inline readdir scan verbatim"); no new duplicated helpers introduced.
