## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-07-08T01:34:44Z
- **Task ID:** prog-studio-v2-2026-07-s2-party-shell-t2
- **Message received:**
  > **Working directory:** /home/jhber/projects/gander-studio-alpha
  >
  > ## Output Path
  > Write your primary output to:
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t2-FE-1783474456.md
  > Record this path in output_files of your COMPLETE event.
  >
  > ## Task
  > You are FE#2 executing task packet `prog-studio-v2-2026-07-s2-party-shell-t2` — the leaf primitives: PortraitFrame + StatBar (+ the W1 materiaTint helper + StatBar vitest).
  >
  > Your contract is TWO files read together (packet prevails; amendment overrides on amended points):
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md → <task_packet> t2 ONLY
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-amend-PM-1783474258.md — W1 IS YOUR DELIVERABLE ADDITION: export a shared materiaTint(token, pct) helper returning the color-mix idiom (colocated components/party/materia-tint.ts preferred); PortraitFrame consumes it; NO re-inlined color-mix literal outside the helper. W2: record the spec-substitute mapping (Progress→StatBar etc., Critic-RATIFIED) in your completion packet.
  >
  > Design contract: docs/v2-vision/v2-design-spec.md (StatBar pattern spec, portrait treatment, contrast_pairs CANONICAL); consume s1 data shapes from packages/shared/src/schemas.ts (PartyStatBarSchema: {label, raw, normalized 0-100, derivation, feasibility} — N/A states exist). FF7 tokens EXPLICIT on every element (memorized Shadcn/FF7 collision gotcha — never rely on primitive defaults); no raw hex (tokens via var(--*) / Tailwind mappings).
  >
  > Verify: npm run lint (tsc ×3) + client vitest (npm test -w @gander-studio/client — your StatBar unit tests must RUN); record outputs verbatim. Dev server on :3001 is running — do not touch it.
  >
  > ## Out of Scope
  > No card/rail (t3), no page/hook (t4), no nav wiring (t5), no e2e (t6), no store changes (t1 owns ui-store), no server/shared changes, NO git commit.
  > …[truncated]

## [STAGE 3] INTERRUPTED
- **At:** 2026-07-08T01:38:01.234335+00:00
- **Detected by:** agent-stop-checkpoint hook (session ended without Stage 3)
- **Action required:** Re-dispatch FE#2 (canonical: FE#2) for task `prog-studio-v2-2026-07-s2-party-shell-t2`.
  Read `docs/agent-logs/FE/latest.md` before starting — skip completed checkpoints.

## [RE-DISPATCH NOTE]
- **At:** 2026-07-08T01:45:00Z
- Read `docs/agent-logs/FE/latest.md` per protocol: it currently holds FE#1's (t1) COMPLETE log, not
  mine — t1 and t2 run in parallel (disjoint files) and both write the shared `latest.md` pointer;
  FE#1 finished and overwrote it after my Stage-1 write. `git status`/`ls` confirm
  `packages/client/src/components/party/` does not exist yet — no t2 deliverable was written before
  the INTERRUPTED marker fired, so there is nothing to skip. Proceeding from Stage 2 fresh.

## [STAGE 2] PLAN
- **At:** 2026-07-08T01:45:10Z
- **Components to build:**
  - `packages/client/src/components/party/materia-tint.ts` — W1 shared helper, `materiaTint(token, pct)` → `color-mix(in srgb, var(${token}) ${pct}%, transparent)`. Sole source of the color-mix idiom.
  - `packages/client/src/components/party/PortraitFrame.tsx` — asset-free square portrait frame (gradient via materiaTint, 2px full-saturation border, centered monogram, optional role-flourish icon derived from materiaColorKey via DESIGN.md Decision Record B's fixed token↔role bijection since the prop signature has no separate roleCategory field).
  - `packages/client/src/components/party/StatBar.tsx` — pure `computeStatBarViewModel()` (exported, testable) + the presentational component consuming it. Progressbar track/fill + label/readout row per pattern spec; N/A branch per statbar-not-applicable state.
  - `packages/client/src/components/party/__tests__/StatBar.test.ts` — tests `computeStatBarViewModel` directly (NOT `.tsx`/rendered-DOM — verified `vitest.config.ts` first: `environment: 'node'`, `include: ['src/**/__tests__/**/*.test.ts']` — no jsdom, no @testing-library/react dep, and the glob literally excludes `.test.tsx`. Extracting the pure view-model function is the only way to satisfy "StatBar vitest must RUN" under this repo's actual test infra — consistent with the "logic in hooks/pure functions, not JSX" design-system rule).
- **State design:** No store access (pure prop-driven leaves per out-of-scope). No local component state needed (no hover-delay logic lives here — that's t3's PartyMemberCard/Popover).
- **tRPC wiring:** None (t2 out of scope).
- **A11Y plan:** StatBar track: `role="progressbar"`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-valuenow` present only when `normalized !== null`, `aria-label` = `"{label}: {normalized}%"` or `"{label}: not applicable, {reason}"`. PortraitFrame role-flourish icon: `aria-hidden="true"` (decorative only, monogram carries no separate accessible name at this leaf level — PartyMemberCard/t3 owns the card's own composite `aria-label`).
- **Tint mechanism verify-then-implement:** inspected `components/browse/AgentCard.tsx` first (per packet instruction) — it has NO per-role alpha-tint mechanism (solid `materia.color` dot; unrelated fixed `rgba()` constants in `constants/browse.ts` for non-role tags). Cross-checked `components/compose/MateriaNode.tsx`, which DOES use the dynamic-token `color-mix(in srgb, var(--orb-color) ...)` idiom against a runtime CSS custom property — the only existing precedent for tinting an arbitrary runtime token name. Chose `color-mix(in srgb, var(${token}) ${pct}%, transparent)` (packet's own primary suggested mechanism), matching this precedent, extracted once into `materia-tint.ts` per W1.
- **Radius token verify-then-implement:** `--radius-md`/`--radius-sm` (DESIGN.md Border Radius table) have no identically-named runtime CSS var. DESIGN.md Decision Record A explicitly states `--radius: 0.625rem (10px) — matches --radius-md` — used `var(--radius)` for PortraitFrame's frame radius on that explicit documented mapping. No equivalent Decision Record entry exists for `--radius-sm` (6px); used the literal `6px` (matching DESIGN.md's own Border Radius table value verbatim, same treatment AgentCard.tsx already gives to literal px values for radii/spacing that have no runtime CSS var) for StatBar's track radius, extracted to a local named constant (not repeated raw).

### Checkpoint — 01:47:30
- Wrote `packages/client/src/components/party/materia-tint.ts` (13 lines). Sole `color-mix(...)` idiom source (W1). Constant audit: 0 raw hex matches. Next: PortraitFrame.tsx.
### Checkpoint — 01:49:10
- Wrote `packages/client/src/components/party/PortraitFrame.tsx` (77 lines). Consumes `materiaTint` for the 12% gradient stop; no re-inlined color-mix; `var(--radius)` frame radius; 2px full-saturation `var(${materiaColorKey})` border; no box-shadow. Constant audit: 0 raw hex matches, 0 inline-style/Tailwind conflicts (className carries only layout utilities — aspect-square/relative/flex/overflow — none overlap the style-object properties), 0 bare-div/span onClick (no click handler at all — pure presentational leaf), 0 JSON.parse. Next: StatBar.tsx.
### Checkpoint — 01:51:40
- Wrote `packages/client/src/components/party/StatBar.tsx` (105 lines). Exports `computeStatBarViewModel` (pure, testable) + default presentational component. Progressbar aria wired per spec (aria-valuenow omitted when null); N/A caption "N/A — {reason}" never a bare 0%. No Shadcn Progress import. Constant audit: 0 raw hex matches, 0 inline-style/Tailwind conflicts, 0 onClick on non-interactive elements (static display only), 0 JSON.parse. STAT_BAR_TRACK_RADIUS_PX/HEIGHT_PX/LABEL_FONT_SIZE_PX extracted as named constants (each value used ≥2 times in the file). Next: StatBar.test.ts.
### Checkpoint — 01:53:05
- Wrote `packages/client/src/components/party/__tests__/StatBar.test.ts` (34 lines). 3 tests against `computeStatBarViewModel` (value case, null+reason case, valueLabel-override case). Next: run npm run lint + vitest.
### Checkpoint — 01:55:00
- `npm run lint` → exit 0, clean, no output (tsc ×3: shared → server → client).
- `npm test -w @gander-studio/client` → 4 test files, 24 tests, all passed (3 new StatBar tests among them, verified individually via `--reporter=verbose`).
- Constant/audit greps re-run on all 4 files post-write: raw hex `0`, box-shadow (real property, not comment) `0`, color-mix outside materia-tint.ts `0`, Shadcn Progress/Card import `0`, non-button onClick `0`, JSON.parse `0`. Inline-style/Tailwind conflict manual review: no className+style property overlap in either component. No repeated inline function bodies (no event handlers in either file).
- `git status` confirms scope: only `packages/client/src/components/party/` (new dir) + this log touched by me; `navigation.ts`/`ui-store.ts` diffs belong to the parallel FE#1 (t1) packet, not mine.

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T01:56:00Z
- **Deliverables:**

| File | Lines | Notes |
|---|---|---|
| `packages/client/src/components/party/materia-tint.ts` | 13 | W1 shared `materiaTint(token, pct)` helper — sole color-mix source |
| `packages/client/src/components/party/PortraitFrame.tsx` | 84 | Asset-free portrait frame; consumes `materiaTint`; no box-shadow |
| `packages/client/src/components/party/StatBar.tsx` | 109 | `computeStatBarViewModel` (pure/exported) + presentational component; W2 mapping comment |
| `packages/client/src/components/party/__tests__/StatBar.test.ts` | 38 | 3 tests, all green |

- **Lint:** exit 0 (`tsc --noEmit` ×3), clean.
- **Vitest:** 24/24 passed, including the 3 required StatBar cases.
- **Constant audit:** 0 raw hex, 0 real box-shadow, color-mix isolated to materia-tint.ts, 0 style/Tailwind conflicts, 0 non-button onClick, 0 JSON.parse.
- **Scope confirmation:** task_id `prog-studio-v2-2026-07-s2-party-shell-t2` (≡ `prog-studio-v2-2026-07-s2-t2` in the PM decomposition) matches the task executed. No card/rail/page/hook/nav/e2e/store work performed.
