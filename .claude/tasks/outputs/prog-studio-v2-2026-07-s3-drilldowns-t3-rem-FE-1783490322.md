# prog-studio-v2-2026-07-s3-drilldowns-t3-rem — FE remediation output

## Diff summary

File: `packages/client/src/components/detail/ReviseSpecAction.tsx` (234 → 271 lines, +37/-6)

1. Added two module-level constants (following the file's existing `DIALOG_MAX_WIDTH_PX` /
   `EDITOR_MIN_HEIGHT_PX` pixel-constant convention):
   ```ts
   const ACCENT_BORDER_PX = 3;
   const ACCENT_PADDING_LEFT_PX = 10;
   ```
2. Load-error `<p role="alert">` (was line 161): text color changed `var(--redb)` → `var(--w)`;
   added `borderLeft: '3px solid var(--redb)'` + `paddingLeft: '10px'`. `--redb` is now an accent
   only, never the text color.
3. Save-error `<p role="alert">` (was line 187): identical treatment — text `var(--w)`,
   `--redb` left-border accent.
4. "Saved" confirmation `<p role="status">` (was line 192): text color changed `var(--mg)` →
   `var(--w)`; added `borderLeft: '3px solid var(--mg)'` + `paddingLeft: '10px'`. This addresses
   the auditor's advisory note pre-emptively (the previous `--mg`-on-`--sfh` text pairing was
   numerically AA at 4.85:1 but had no `contrast_pairs` row; it's now an accent-only usage like
   the error states, and doesn't need a text-pairing row at all).

No other lines changed. No new imports, no state changes, no tRPC changes.

## New contrast pairs used, with ratios

| Element | Foreground | Background | Ratio | Traces to |
|---|---|---|---|---|
| Load-error message text | `--w` (#ffffff) | `--sfh` (#1a3530) | ≈13.0:1 | `v2-design-spec.md` contrast_pairs line 290 ("Portrait monogram text ... on `--sfh`", AAA) — same `--w`/`--sfh` pair, so the ratio is identical regardless of element description |
| Save-error message text | `--w` (#ffffff) | `--sfh` (#1a3530) | ≈13.0:1 | same row as above |
| "Saved" status text | `--w` (#ffffff) | `--sfh` (#1a3530) | ≈13.0:1 | same row as above |

`--w` was chosen over `--wd` because the `contrast_pairs` table has an **explicit** row for `--w`
on `--sfh` (line 290), but only an indirect row for `--wd` — the published `--wd` row (line 291)
is against `--sf`, not `--sfh`. Given AUD#3 failed precisely because no `--redb`-on-`--sfh` row
existed, I picked the option that traces to an *exact* row rather than a "same-ballpark" one, to
avoid a repeat of the same failure class.

`--redb` (error) and `--mg` ("Saved") are now used exclusively as `borderLeft` accents — never as
text `color` — matching DESIGN.md's Error state Component Rule ("left-border accent
`--color-error`", DESIGN.md line 113).

## Verification (verbatim)

### `npm run lint` — run 1
```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

exit code: 0
```

### `npm run lint` — run 2
```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

exit code: 0
```

### `npm run lint` — run 3
```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

exit code: 0
```

### `npm test -w @gander-studio/client -- --run src/components/detail/__tests__/revise-spec-buffer.test.ts`
```
 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  00:01:56
   Duration  261ms (transform 37ms, setup 0ms, import 48ms, tests 5ms, environment 0ms)
```
All 6 buffer tests green (t3's SC3-guard reducer tests, unaffected by this style-only change).

### grep for remaining `--redb` text usage
```bash
$ grep -n "color: 'var(--redb)'" packages/client/src/components/detail/ReviseSpecAction.tsx
(no output — 0 matches)

$ grep -n "redb" packages/client/src/components/detail/ReviseSpecAction.tsx
175:              borderLeft: `${ACCENT_BORDER_PX}px solid var(--redb)`,
211:              borderLeft: `${ACCENT_BORDER_PX}px solid var(--redb)`,
```
Confirmed: 0 remaining `--redb` text-color usages; both `--redb` references are `borderLeft`
accents, matching the required fix.

### Additional pre-flight greps (constant audit / style-conflict / click-handler / JSON.parse)
```bash
$ grep -rn "#[0-9a-fA-F]\{6\}" packages/client/src/components/detail/ReviseSpecAction.tsx
(0 matches)

$ grep -n 'style="[^"]*\(overflow\|display\|position\|flex\|padding\|margin\|color\|background\|border\)' packages/client/src/components/detail/ReviseSpecAction.tsx
(0 matches — file uses JSX object-literal `style={{...}}`, never string `style="..."` attrs)

$ grep -nE "<(span|div|li|a)[^>]*onClick=" packages/client/src/components/detail/ReviseSpecAction.tsx
(0 matches)

$ grep -n "JSON.parse" packages/client/src/components/detail/ReviseSpecAction.tsx
(0 matches)
```

## Authorized scope compliance

Only `packages/client/src/components/detail/ReviseSpecAction.tsx` was touched, per the
remediation's authorized file scope. `v2-design-spec.md` was read for the `contrast_pairs`
reference table but **not edited** (per the required_fix's explicit instruction not to edit it).
No git stash, no git commit performed.

## Advisory note for the design-doc maintainer (not actioned here — out of scope)

The remediation offered two options for the "Saved" pairing: switch to an AA-rowed text pair, or
keep `--mg` and flag the missing row. I took the stronger option (switched `--mg` to an
accent-only role, text now `--w`/`--sfh` which IS rowed) — so there is no longer an unrowed
`--mg`-on-`--sfh` **text** pairing in this file. No new `contrast_pairs` row is needed as a
result of this remediation. Flagging only for completeness: if `--mg` is ever reintroduced as
text color elsewhere on `--sfh`, that pairing would still need a `contrast_pairs` row added to
`v2-design-spec.md` by its maintainer.

<ui_packet>
  <components_created>NONE (remediation of existing component only)</components_created>
  <state_hydration_map>Unchanged — no state or data-flow changes; style-only remediation of packages/client/src/components/detail/ReviseSpecAction.tsx</state_hydration_map>
  <a11y_verification>
    Error-state Component Rule (DESIGN.md line 113) now correctly applied: --redb and --mg are
    left-border accents only (3px solid), never text color. Text color in all three status/error
    <p> elements is --w on --sfh, which traces to an explicit AA(AAA)-rated contrast_pairs row
    (v2-design-spec.md line 290, ~13.0:1). role="alert" / role="status" unchanged from prior
    implementation (no ARIA regression). No keyboard-navigation or focus-trap changes in this
    remediation.
  </a11y_verification>
  <design_tokens_used>--redb (border accent only), --mg (border accent only), --w (text, newly applied), --sfh (surface, unchanged), --fb, --fm (fonts, unchanged)</design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <integration_status>SUCCESS — remediation applied within authorized file scope (ReviseSpecAction.tsx only); v2-design-spec.md not edited per instruction; lint 3/3 exit 0; vitest 6/6 buffer tests green; grep confirms 0 remaining --redb text-color usages</integration_status>
</ui_packet>
