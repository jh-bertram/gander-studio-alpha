# Task Output: gander-studio-p3-001 — ExportInputSchema migration + targetBasePath

## ExportInputSchema in packages/shared/src/schemas.ts

```ts
// ExportInputSchema — input for export.spawn procedure
export const ExportInputSchema = z.object({
  loadout: LoadoutSchema,
  targetDirName: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid directory name'),
  includeStandards: z.boolean().default(false),
  targetBasePath: z.string().optional(),
});
```

## Path-traversal guard in packages/server/src/router.ts (export.spawn)

```ts
if (input.targetBasePath !== undefined) {
  const resolved = path.resolve(input.targetBasePath);
  if (resolved !== input.targetBasePath || !resolved.startsWith('/')) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'targetBasePath must be an absolute normalised path' });
  }
}
const targetPath = path.join(input.targetBasePath ?? EXPORT_BASE_DIR, input.targetDirName);
```

## Lint pass confirmation

`npm run lint` completed with zero errors and zero warnings (exit code 0). All three package typechecks passed:
- `packages/shared/tsconfig.json` — PASS
- `packages/server/tsconfig.json` — PASS
- `packages/client/tsconfig.json` — PASS

## Inline ExportInputSchema removal confirmation

No inline `ExportInputSchema` definition remains in `packages/server/src/router.ts`. The comment block that previously held the inline definition now reads:

```
// Export schemas
// ExportInputSchema is imported from @gander-studio/shared
```

`ExportInputSchema` is imported from `@gander-studio/shared` at line 13 of router.ts.

## Files changed

- `packages/shared/src/schemas.ts` — Added `ExportInputSchema` export (lines 41–49)
- `packages/server/src/router.ts` — Removed inline schema, added import, added path-traversal guard, updated targetPath computation

<completion_packet>
  <task_id>gander-studio-p3-001</task_id>
  <files_changed>
    packages/shared/src/schemas.ts
    packages/server/src/router.ts
  </files_changed>
  <zod_contract>
export const ExportInputSchema = z.object({
  loadout: LoadoutSchema,
  targetDirName: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid directory name'),
  includeStandards: z.boolean().default(false),
  targetBasePath: z.string().optional(),
});
  </zod_contract>
  <test_traceback>
npm run lint → tsc --noEmit across all three packages → EXIT 0, no errors, no warnings.
  </test_traceback>
  <critical_logic_notes>
- targetBasePath guard uses path.resolve() equality check (not string.includes('..')), satisfying the task requirement for a robust normalisation-based check.
- Guard rejects relative paths (resolved !== input.targetBasePath) and non-absolute paths (!resolved.startsWith('/')).
- When targetBasePath is undefined, behaviour is unchanged: EXPORT_BASE_DIR is used as before.
- ExportInputSchema is now the single source of truth in @gander-studio/shared; server imports it alongside AgentSchema/SkillSchema/LoadoutSchema.
  </critical_logic_notes>
</completion_packet>
