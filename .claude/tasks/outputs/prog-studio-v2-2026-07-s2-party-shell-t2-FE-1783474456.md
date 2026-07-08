# Completion Packet — prog-studio-v2-2026-07-s2-party-shell-t2

**Agent:** FE#2 | **Task ID:** `prog-studio-v2-2026-07-s2-party-shell-t2` (≡ `prog-studio-v2-2026-07-s2-t2` in the PM decomposition packet)
**Contract:** PM packet `prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md` (t2 section) + amendment `prog-studio-v2-2026-07-s2-party-shell-amend-PM-1783474258.md` (W1 deliverable addition, W2 mapping requirement)

---

## Files Created

| File | Lines | Purpose |
|---|---|---|
| `packages/client/src/components/party/materia-tint.ts` | 13 | **W1 amendment deliverable.** Shared `materiaTint(token: string, pct: number): string` helper — the SINGLE source of the `color-mix(in srgb, var(${token}) ${pct}%, transparent)` alpha-tint idiom. |
| `packages/client/src/components/party/PortraitFrame.tsx` | 84 | Asset-free portrait frame leaf. |
| `packages/client/src/components/party/StatBar.tsx` | 109 | StatBar leaf (the spec's `<new_pattern_proposal>` Progress replacement) + exported pure `computeStatBarViewModel`. |
| `packages/client/src/components/party/__tests__/StatBar.test.ts` | 38 | Colocated vitest — 3 green tests against `computeStatBarViewModel`. |

No other files touched. `git status` confirms scope: only the new `components/party/` directory plus my own agent-log file. (`navigation.ts` and `ui-store.ts` diffs visible in the working tree belong to the parallel sibling FE#1 t1 packet, not this one.)

---

## Verify-Then-Implement Findings (load-bearing)

**Tint mechanism** — inspected `components/browse/AgentCard.tsx` first, per packet instruction. It has **no** per-role alpha-tint mechanism: the MateriaDot uses a solid `materia.color`, and the file's `rgba(...)` constants (`MODEL_TAG_BG` etc., in `constants/browse.ts`) are fixed, non-role tints for unrelated fixed-category tags — not a reusable dynamic-token utility. Cross-checked `components/compose/MateriaNode.tsx`, which DOES use `color-mix(in srgb, var(--orb-color) ...)` against a dynamically-set CSS custom property — the only existing codebase precedent for tinting an arbitrary runtime token name. Chose `color-mix(in srgb, var(${token}) ${pct}%, transparent)` (the packet's own primary suggested mechanism), matching that precedent, and extracted it once into `materia-tint.ts` per amendment W1.

**Radius tokens** — `--radius-md`/`--radius-sm` (DESIGN.md Border Radius table) have no identically-named runtime CSS var in `globals.css`. DESIGN.md Decision Record A explicitly states `--radius: 0.625rem (10px) — matches --radius-md`, so PortraitFrame's frame radius uses `var(--radius)` on that documented mapping. No equivalent Decision Record entry exists for `--radius-sm` (6px); used the literal `6px` (DESIGN.md's own Border Radius table value, verbatim — no invented number) for StatBar's track radius, extracted to a local named constant (`STAT_BAR_TRACK_RADIUS_PX`) rather than repeated inline.

**Vitest infra** — read `packages/client/vitest.config.ts` before writing the test: `environment: 'node'`, `include: ['src/**/__tests__/**/*.test.ts']` (glob literally excludes `.test.tsx`), and `devDependencies` has no `@testing-library/react`/jsdom. There is no way to render StatBar's JSX and assert on a live DOM under this repo's actual test setup. Per the "logic belongs in custom hooks/pure functions, not JSX" design-system rule, I extracted `computeStatBarViewModel` as a pure, exported function that is the exact mechanical source of every prop the JSX renders (`aria-valuenow`, `aria-label`, fill `width%`, visible readout text) and wrote `StatBar.test.ts` (note: `.ts`, not `.tsx`, so the include glob actually picks it up) against that function. Confirmed green: `npm test -w @gander-studio/client` → 24/24 passed, 3 of them the new StatBar cases.

**PortraitFrame prop signature has no `roleCategory`** — the spec's role-representative flourish icon (Sword/ShieldCheck/Compass/Sparkles/Crown) is keyed by role, but the packet's declared `PortraitFrameProps` is `{ code, materiaColorKey, portraitSeed }` only. DESIGN.md Decision Record B fixes a 1:1 `materiaColorKey ↔ roleCategory` bijection (`--mg`=Impl, `--my`=Command, `--mb`=Intel, `--mp`=Meta, `--mr`=Gate) for `PartyMember`-shaped data, so I derived the icon from `materiaColorKey` directly rather than requesting an extra prop — keeps PortraitFrame a minimal leaf exactly matching its declared signature. Unknown/unmapped tokens render no icon (the flourish is explicitly optional per spec).

**`portraitSeed` usage** — the design spec doesn't prescribe a specific mechanical use for this schema field beyond "deterministic, asset-free seed." I used it to deterministically pick one of 4 gradient diagonal directions (`to bottom right/left`, `to top right/left`), so two cards sharing the same `materiaColorKey` (e.g. two Impl-role agents both on `--mg`) remain visually distinct without any image asset — still exactly the spec's "two-stop linear gradient... corner to opposite corner," only varying which pair of corners. Flagging this interpretation for Critic/REQVAL visibility since it is not literally spelled out in the spec text.

---

## W2 — Spec-Primitive → Substitute Mapping (Critic-RATIFIED, recorded per amendment)

```
Card     → PartyMemberCard  (t3, custom, FF7-tokened)
Badge    → RoleTag          (t3, custom, FF7-tokened)
Progress → StatBar          (THIS packet — custom new_pattern_proposal)
Skeleton → shimmer-box      (existing components/ui/shimmer-box.tsx)
Alert    → error-state      (existing components/ui/error-state.tsx)
```

Rationale (stated once, centrally, also inline as a comment atop `StatBar.tsx`): `components/ui/` contains only `{button, popover, dialog, select, input, textarea, shimmer-box, error-state}` — none of the five spec-named Shadcn primitives are installed, and installing raw Shadcn primitives collides with the FF7 Mako token system (memorized S2 gotcha: Shadcn defaults → invisible text). CR#1 disk-verified this substitution and ratified it. This is DRY + collision-avoidance, not a fidelity shortfall. `StatBar` in this packet directly satisfies the `Progress → StatBar` row — no Shadcn `<Progress>` import anywhere in these files (grep-confirmed).

---

## design_tokens_used (every token traced)

| Token | Where | Source |
|---|---|---|
| `var(--radius)` | PortraitFrame frame `borderRadius` | DESIGN.md Decision Record A ("matches `--radius-md`") |
| `materiaTint(materiaColorKey, 12)` → `color-mix(in srgb, var(${materiaColorKey}) 12%, transparent)` | PortraitFrame gradient near stop | spec `<portrait_treatment>` 0.12-alpha tint; runtime materia token passed in as prop, never a literal name here |
| `var(--sfh)` | PortraitFrame gradient far stop; StatBar track background | spec `<tokens>` "Portrait gradient far stop" / "Track: background `--sfh`" |
| `var(${materiaColorKey})` | PortraitFrame 2px border (full saturation) | spec `<portrait_treatment>` Border |
| `var(--w)` | PortraitFrame monogram + role-icon color; StatBar non-N/A readout | spec `<tokens>` "Primary body text" |
| `var(--wd)` | StatBar label text | spec `<data_viz_modules>` "Label renders above the bar (`sm`, `--wd`)" |
| `var(--wm)` | StatBar N/A readout color | spec `<states name="statbar-not-applicable">` |
| `var(${fillToken})` | StatBar filled segment | runtime materia/semantic token passed in as prop (Activity/Accuracy=materiaColorKey, Stamina=`--mg`, per t3's mapping) |
| `22px` / `600` | PortraitFrame monogram size/weight | DESIGN.md type scale `2xl`, spec `<tokens>` "Monogram size/weight" |
| `12px` | StatBar label + readout font-size | DESIGN.md type scale `sm` |
| `6px` (×2, named constants) | StatBar track height + track radius | spec `<data_viz_modules>` Visualization Rule ("6px height"); DESIGN.md Border Radius table `--radius-sm` (no runtime CSS var minted — see Verify-Then-Implement above) |

No raw hex anywhere in the four files (grep `#[0-9a-fA-F]{6}` → 0 matches). No Tailwind-mapped color utility was needed beyond layout (`aspect-square`, `flex`, `relative`, `overflow-hidden`, `absolute`, `gap-1`, `items-center`, `justify-between`) — every color/paint value goes through a `var(--*)` token or the `materiaTint`/`fillToken` runtime-token indirection.

---

## a11y_verification

- **StatBar** (`role="progressbar"`): `aria-valuemin={0}`, `aria-valuemax={100}` always present; `aria-valuenow` present (equal to `normalized`) only when `normalized !== null` — omitted (via React's `undefined`-prop-drops-the-attribute behavior) when `normalized === null`, exactly per spec's Accessibility Contract. `aria-label` = `"{label}: {normalized}%"` when not null, `"{label}: not applicable, {reason}"` when null. Verified by the `computeStatBarViewModel` vitest cases (both branches).
- **PortraitFrame** decorative role-flourish icon: `aria-hidden="true"` (pure flourish; the enclosing `PartyMemberCard` — t3 — owns the card's own composite `aria-label`, per the packet's aria_requirements which are scoped to the card, not this leaf).
- **No interactive elements in this packet** — neither component has an `onClick`/keyboard handler (pure, prop-driven, non-interactive leaves per t2's explicit "no data fetching, no tRPC, no store access" scope). The Click-Handler Keyboard-Equivalent Audit grep (`<(span|div|li|a)[^>]*onClick=`) returns 0 matches in both files — there is nothing to remediate.
- **Contrast**: every color pairing used here (`--w`/`--wd`/`--wm` on `--sf`/`--sfh`/`--void`) traces to a row in the spec's canonical `<contrast_pairs>` table (all AA or better) — no new pairing introduced.

---

## style_conflict_check

**NONE.** Manual review of both components: `PortraitFrame.tsx` uses `className` only for layout (`relative flex aspect-square w-full items-center justify-center overflow-hidden`, and `absolute bottom-1 right-1` on the icon) and `style` only for paint (`borderRadius`, `background`, `border`) plus, on the icon, `opacity`/`color`. No property appears in both a Tailwind class and an inline style on the same element. `StatBar.tsx` uses `className` only for flex layout (`flex flex-col gap-1`, `flex items-center justify-between`) and `style` only for typography/paint/sizing on elements that carry no conflicting Tailwind class. No animation-state overflow toggling in either file (not applicable — no collapse/expand here).

---

## Lint output (verbatim)

```
$ npm run lint

> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

(exit 0, no output — clean across all three packages)
```

## Vitest output (verbatim, verbose reporter, client package)

```
$ npx vitest run --reporter=verbose   # run from packages/client

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client

 ✓ src/utils/__tests__/session-metrics.test.ts (10 tests)
 ✓ src/utils/__tests__/group-agents.test.ts (8 tests)
 ✓ src/store/__tests__/ui-store.test.ts (3 tests)   [sibling t1 packet's test — pre-existing at run time]
 ✓ src/components/party/__tests__/StatBar.test.ts
   ✓ computeStatBarViewModel — StatBar pattern spec + statbar-not-applicable state > normalized=63 → correct fill width, aria-valuenow, and visible readout
   ✓ computeStatBarViewModel — StatBar pattern spec + statbar-not-applicable state > normalized=null + reason → N/A caption, no aria-valuenow, aria-label carries the reason
   ✓ computeStatBarViewModel — StatBar pattern spec + statbar-not-applicable state > valueLabel overrides the visible readout but not the aria-label percentage

 Test Files  4 passed (4)
      Tests  24 passed (24)
   Start at  19:41:21
   Duration  484ms (transform 154ms, setup 0ms, import 223ms, tests 31ms, environment 0ms)
```

Command run as specified in the brief (`npm test -w @gander-studio/client`) also confirmed: `4 passed / 24 passed`, identical result.

---

## Constant/Audit greps (verbatim results)

```
$ grep -n "#[0-9a-fA-F]\{6\}" packages/client/src/components/party/PortraitFrame.tsx packages/client/src/components/party/StatBar.tsx packages/client/src/components/party/materia-tint.ts packages/client/src/components/party/__tests__/StatBar.test.ts
(no matches — exit 1)

$ grep -n "box-shadow\|boxShadow" packages/client/src/components/party/PortraitFrame.tsx packages/client/src/components/party/StatBar.tsx
packages/client/src/components/party/PortraitFrame.tsx:62:        // No box-shadow anywhere — Constitution forbids glow shadows.
(only a comment; zero actual box-shadow/boxShadow style properties)

$ grep -rln "color-mix" packages/client/src/components/party/
packages/client/src/components/party/materia-tint.ts
(exactly one file — the single-source contract holds)

$ grep -n "from '.*ui/progress\|from '.*ui/card'" packages/client/src/components/party/*.tsx
(no matches)

$ grep -nE "<(span|div|li|a)[^>]*onClick=" packages/client/src/components/party/PortraitFrame.tsx packages/client/src/components/party/StatBar.tsx
(no matches — exit 1; neither component has any onClick handler)

$ grep -n "JSON\.parse" packages/client/src/components/party/*.tsx packages/client/src/components/party/*.ts
(no matches — exit 1)
```

---

## SC-by-SC Self-Check (against t2's `<success_criteria>` + W1/W2 amendments)

| SC | Status |
|---|---|
| `npm run lint` (tsc ×3) clean; both components mount-compile trivially | PASS — tsc exit 0; both default-export cleanly, `StatBar.test.ts` imports `computeStatBarViewModel` from `StatBar.tsx` with no type errors |
| StatBar vitest green: value → progressbar aria + width%; null → N/A caption, no aria-valuenow, aria-label has reason | PASS — both required cases green (plus a bonus `valueLabel` case) |
| No raw hex in either file | PASS — grep 0 matches |
| PortraitFrame emits no box-shadow glow | PASS — no `boxShadow`/`box-shadow` style property anywhere (only an explanatory comment) |
| W1: `materiaTint` helper exists, exported, PortraitFrame consumes it; no re-inlined `color-mix` literal outside the helper | PASS — `materia-tint.ts` is the sole `color-mix` source (grep-confirmed); PortraitFrame imports and calls it |
| W2: spec-primitive→substitute mapping recorded verbatim + Critic-RATIFIED rationale | PASS — recorded above and as an inline comment atop `StatBar.tsx` |

---

## integration_status

**LIVE** — these are pure, prop-driven, dependency-free leaf components; there is no external data source to mock or integrate against. `materiaColorKey`/`fillToken`/stat values arrive as props matching `PartyStatBarSchema`/`PartyMemberSchema` shapes (t4 wires the live `roster.getParty` data through t3's `PartyMemberCard` into these leaves — outside this packet's scope).

<ui_packet>
  <components_created>
    packages/client/src/components/party/materia-tint.ts (W1 shared helper)
    packages/client/src/components/party/PortraitFrame.tsx
    packages/client/src/components/party/StatBar.tsx
    packages/client/src/components/party/__tests__/StatBar.test.ts
  </components_created>
  <state_hydration_map>
    None — pure prop-driven leaves, no store/tRPC access. Props mirror packages/shared/src/schemas.ts
    PartyMemberSchema (code, materiaColorKey, portraitSeed) and PartyStatBarSchema (label, normalized,
    reason) shapes; t4's useParty hook is the eventual live-data source, wired through t3's
    PartyMemberCard (both out of this packet's scope).
  </state_hydration_map>
  <a11y_verification>
    StatBar: role="progressbar", aria-valuemin=0/aria-valuemax=100 always present, aria-valuenow
    present only when normalized !== null (omitted via React undefined-prop-drop when null),
    aria-label = "{label}: {normalized}%" or "{label}: not applicable, {reason}" — both branches
    covered by the colocated vitest. PortraitFrame role-flourish icon: aria-hidden="true" (decorative;
    card-level aria-label is t3's responsibility). No interactive elements in this packet (no
    onClick/keyboard handlers) — Click-Handler Keyboard-Equivalent Audit grep returns 0 matches, nothing
    to remediate. All color pairings trace to the spec's canonical contrast_pairs table.
  </a11y_verification>
  <design_tokens_used>
    var(--radius) [Decision Record A -> --radius-md], materiaTint(token,12) -> color-mix(in srgb,
    var(token) 12%, transparent) [portrait gradient near stop], var(--sfh) [gradient far stop / StatBar
    track bg], var(${materiaColorKey}) [portrait border, full saturation], var(--w) [monogram, role
    icon, StatBar non-N/A readout], var(--wd) [StatBar label], var(--wm) [StatBar N/A readout],
    var(${fillToken}) [StatBar fill segment, runtime token prop], 22px/600 [DESIGN.md 2xl monogram],
    12px [DESIGN.md sm label/readout], 6px x2 named constants [StatBar track height + --radius-sm
    track radius, no runtime CSS var exists for --radius-sm so DESIGN.md's literal value is used].
    Zero raw hex (grep-confirmed).
  </design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <integration_status>LIVE — pure prop-driven leaves, no external data dependency to mock</integration_status>
</ui_packet>
