# Task Output: gander-studio-p3-002

**Task:** Base Directory input on ExportPage
**Agent:** FE
**Date:** 2026-03-16

---

## Deliverables

### Files Modified

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/constants/export.ts` | +4 | Added `BASE_PATH_PATTERN` constant |
| `packages/client/src/pages/ExportPage.tsx` | +63 net | Added Base Directory field, updated state, validation, mutation, hint text |

---

## BASE_PATH_PATTERN constant

Added to `packages/client/src/constants/export.ts`:

```ts
// Base directory (absolute path) validation pattern
export const BASE_PATH_PATTERN = /^\//;
```

This validates that the base path, when non-empty, begins with `/`. It is imported into `ExportPage.tsx` and used only via the named constant — no inline regex in the component.

---

## canExport Gating

The `canExport` boolean now includes `!isBasePathInvalid`:

```ts
const isBasePathInvalid =
  basePath.length > 0 && !BASE_PATH_PATTERN.test(basePath);

const canExport =
  !isLoadoutEmpty &&
  targetDirName.length > 0 &&
  !isDirNameInvalid &&
  !isBasePathInvalid &&
  exportStatus !== 'loading';
```

- When `basePath` is empty: `isBasePathInvalid` is `false`, so the field has no effect on `canExport`.
- When `basePath` is non-empty but does not start with `/`: `isBasePathInvalid` is `true`, disabling the Export button.
- When `basePath` is non-empty and valid: `isBasePathInvalid` is `false`, no gating effect.

---

## Mutation Call Update

`handleExport` conditionally includes `targetBasePath`:

```ts
exportMutation.mutate({
  loadout,
  targetDirName,
  includeStandards,
  ...(basePath.length > 0 ? { targetBasePath: basePath } : {}),
});
```

When `basePath` is empty, `targetBasePath` is not included in the payload (not passed as `undefined`, simply omitted), which aligns with the optional field in `ExportInputSchema`.

---

## Hint Text Update

The Target Directory hint paragraph now conditionally renders:

- **When `basePath` is non-empty and valid:** `{basePath}/{dirname}/.claude/`
- **Otherwise (empty or invalid base):** `Files will be written to EXPORT_BASE_DIR/{dirname}/.claude/`

The `isBasePathInvalid` flag ensures the hint only shows the base path when the value is genuinely valid — an invalid base path in the base field still shows the fallback EXPORT_BASE_DIR hint.

---

## A11Y

New Base Directory field uses the same pattern as Target Directory:

- `useId()` for `basePathId`, `basePathErrorId`, `basePathHintId`
- `aria-invalid="true"` on `<Input>` when value is non-empty and invalid
- `aria-describedby` pointing to error paragraph when invalid, hint paragraph otherwise
- `role="alert"` on the inline error paragraph
- Semantic `<label>` with `htmlFor={basePathId}`

---

## Constant Audit

Grep for raw hex in modified files:

- `ExportPage.tsx`: 0 matches
- `constants/export.ts`: 0 matches

No DRY violations. `BASE_PATH_PATTERN` used in one place in the component, imported from constants — not duplicated.

---

## Lint

```
npm run lint
→ exit code 0 (all three packages pass tsc --noEmit)
```

---

## No Changes to router.ts or schemas.ts

Confirmed: this task modifies only client-side files. `packages/server/src/router.ts` and `packages/shared/src/schemas.ts` were modified by P3-001 (already in working tree before this task) and were not touched by this implementation.

---

## ui_packet

```xml
<ui_packet>
  <components_created>
    packages/client/src/pages/ExportPage.tsx (modified — Base Directory field added)
    packages/client/src/constants/export.ts (modified — BASE_PATH_PATTERN added)
  </components_created>
  <state_hydration_map>
    basePath (local useState) → exportMutation.mutate({ targetBasePath }) when non-empty and valid
    isBasePathInvalid (derived) → aria-invalid, error paragraph, canExport gate
    Hint text in Target Directory field reads basePath from local state to compute display path
  </state_hydration_map>
  <a11y_verification>
    useId() for basePathId / basePathErrorId / basePathHintId — matches targetDirId pattern
    aria-invalid="true" on Input when isBasePathInvalid
    aria-describedby points to error paragraph (role="alert") or hint paragraph
    Label associated via htmlFor
    Keyboard navigation: standard text input, no custom handlers needed
    Contrast: error text uses var(--redb), hint uses var(--wm) — existing tokens with WCAG AA compliance
  </a11y_verification>
  <design_tokens_used>
    var(--fb) — label and hint font
    var(--fm) — input font
    var(--sfm) — input background
    var(--redb) — error border and error text
    var(--wm) — label and hint color
    All tokens match the Target Directory field exactly
  </design_tokens_used>
  <integration_status>SUCCESS — ExportInputSchema.targetBasePath is optional string, field omits key when empty, passes value when valid</integration_status>
  <e2e_spec>TIER_1_ONLY — no new page or surface, this is an additional field on an existing page</e2e_spec>
</ui_packet>
```
