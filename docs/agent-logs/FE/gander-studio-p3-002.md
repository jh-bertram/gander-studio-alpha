## [STAGE 1] RECEIVED
- **From:** PM
- **At:** 2026-03-16T00:00:00Z
- **Task ID:** gander-studio-p3-002
- **Message received:**
  > P3-001 has landed. `ExportInputSchema` is now in `packages/shared/src/schemas.ts` and includes `targetBasePath: z.string().optional()`. Add a "Base Directory" text input to `ExportPage.tsx`, placed above the existing "Target Directory" field. Behaviour: Optional. When blank: do not include `targetBasePath` in the mutation call (or pass `undefined`). When filled with a valid absolute path: pass as `targetBasePath` in `exportMutation.mutate(...)`. Validation: non-empty value must start with `/`. If it doesn't, show an inline error and set `canExport` to false. Hint text: below "Target Directory", show `{targetBasePath}/{dirname}/.claude/` when base is valid and non-empty; otherwise keep the existing EXPORT_BASE_DIR text. Use `useId()` for the new input's label/error/hint IDs — match the same pattern as the existing `targetDirId`. Constants rule: Add `BASE_PATH_PATTERN` (the absolute-path regex) to `packages/client/src/constants/export.ts`, not inline in the component. Style: Match the existing "Target Directory" field exactly…[truncated]

### Checkpoint — 00:10:00
- Wrote `packages/client/src/constants/export.ts` (27 lines). Constant audit: 0 matches. Next: update ExportPage.tsx.

### Checkpoint — 00:15:00
- Wrote `packages/client/src/pages/ExportPage.tsx` (520 lines). Constant audit: 0 matches. Next: run lint.

## [STAGE 3] COMPLETE
- **At:** 2026-03-16T00:20:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/constants/export.ts` | 27 | Added BASE_PATH_PATTERN |
| `packages/client/src/pages/ExportPage.tsx` | 520 | Added Base Directory field, updated validation and mutation |

- **Lint:** exit code 0
- **Constant audit:** 0 raw hex values in modified files; BASE_PATH_PATTERN imported from constants, not inline

---

## [STAGE 2] PLAN
- **At:** 2026-03-16T00:00:00Z
- **Components to build:**
  - `packages/client/src/constants/export.ts` — add `BASE_PATH_PATTERN`
  - `packages/client/src/pages/ExportPage.tsx` — add Base Directory input field
- **State design:**
  - New local state: `basePath: string` (useState)
  - New validation derived state: `isBasePathInvalid: boolean`
  - `canExport` updated to also gate on `!isBasePathInvalid`
  - `handleExport` passes `targetBasePath: basePath || undefined`
  - Hint text for Target Directory updates to show `{basePath}/{dirname}/.claude/` when base is valid and non-empty
- **tRPC wiring:** `export.spawn` — already wired, just extends the mutation payload
- **A11Y plan:**
  - `useId()` for `basePathId`, `basePathErrorId`, `basePathHintId`
  - `aria-invalid` on Input when invalid
  - `aria-describedby` pointing to error or hint paragraph
  - `role="alert"` on error paragraph
