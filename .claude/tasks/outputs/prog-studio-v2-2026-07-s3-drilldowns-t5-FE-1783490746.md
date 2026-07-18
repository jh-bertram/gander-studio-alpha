# FE#6 — prog-studio-v2-2026-07-s3-drilldowns-t5

Tier-2 e2e gate: the three absorption proofs (s3->s4 seam artifact) + the THREE authorized
s2-spec updates. Contract: `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md`
→ `<task_packet>` t5 ONLY.

## Deliverable 1 — new spec (the seam artifact)

`packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (NEW, 414 lines, 8 tests).

### Assertion inventory mapped to the 3 absorption proofs + sprint SCs

| Test | Proof / SC | Assertions |
|---|---|---|
| `PROOF 1 — Browse absorption` | Browse absorption; SC1 | `agent-detail-page` reached via card click; `detail-materia-panel`/`detail-equipment-panel`/`detail-abilities-panel` all visible; Abilities honest empty state visible directly (abilities is contracted-empty for every agent); Materia/Equipment rows show a `role="listitem"` row OR their honest-empty text (structural, no locked count) |
| `PROOF 2 — Graph absorption` | Graph absorption; SC2 | `detail-relationship-panel` visible; `.react-flow` visible; `.react-flow__edge` **first edge `toBeVisible()`** (AUD#2 VISUAL_BLINDSPOT guard — not just DOM presence) + `count > 0` (never hardcoded); `relationship-confidence-legend` visible containing "Detected"/"Inferred"; per-node confidence marker visible and matches `/^(DETECTED|INFERRED)$/` (structural enum match, not a hardcoded value) |
| `PROOF 3a — Edit absorption (save round-trip)` | Edit absorption; SC3 | `revise-spec-trigger` opens `[role="dialog"][aria-modal="true"]` (explicit role/aria-modal, literal DOM attrs); textarea located via `aria-label^="Markdown editor for "`; **`toBeFocused()` on open** (explicit-focus proof — **FAILS, see Defect below**); token-collision computed-style guard (color not transparent, color != background) on the editor; types a marker, clicks Save; `agent.save` intercepted **before** the click via `page.route` (never reaches disk), asserts `capturedSaves.length > 0`; "Saved" status visible |
| `PROOF 3b — Edit absorption buffer regression` | SC3 (buffer-contamination regression) | Opens agent A's dialog, types a marker, Escape-closes, asserts `dialogA` hidden AND `triggerA` refocused (finalFocus round-trip); returns to party, opens a **different** card (agent B); asserts B's `aria-label` name != A's captured name; asserts B's textarea does **not** contain A's marker; types B's own marker, intercepts `agent.save` (registered before any navigation), clicks Save, asserts the captured payload's `name` field (extracted via the `{"0": {...}}` httpBatchLink shape, reusing the `prog-studio-vision-s2-d1-export` precedent) equals B's name and **not** A's name |
| `back-to-party` | Back-to-party affordance | `detail-back` has accessible name "Back to party"; click returns to `party-page` |
| `DI honest-empty detail` | 6-of-13 reachability / honest-empty capability | Forces DI into the party grid via a `page.route` mock of `roster.getParty` ONLY (the s2 suite's own empty/loading/error mocking technique) — the subsequent `roster.getAgentDetail(DI)` call is **real/unmocked**; asserts all 3 inventory panels visible with their honest-empty text; asserts `revise-spec-trigger` has **zero** count (DI has no spec) and the "No spec on disk to revise for this role." fallback is visible; asserts the real dataQualityNotes note text is surfaced (`.first()`, since it legitimately renders 3x — Materia panel, Equipment panel, and the page-level DataQualityNotes section) |
| `a11y: keyboard operability` | a11y keyboard pass | Focuses `detail-back`, bounded Tab-loop (≤40 presses) proves `revise-spec-trigger` is reachable without an exact-stop-count assertion (RF `Controls` buttons add a data-independent-but-count-variable number of stops); Enter opens the dialog, Escape closes it; `detail-back` Enter returns to `party-page` |
| `a11y: heading structure` | a11y of the detail page | Asserts `Materia`/`Equipment`/`Abilities`/`Relationships` `role="heading"` all present (structural — panel titles are fixed by the components, not data-derived); scans all `h1`-`h6` under `agent-detail-page` and asserts no level ever jumps by more than 1 (no skip) |

### Live-data survey used to design the spec (curl :3001, verbatim, 2026-07-08)

```
roster.getParty top-6-by-activity (PARTY_GRID_DISPLAY_CAP=6): AU, HR, ORC, PM, CR, AR
  (all 13 members present; DI ranks 12th of 13 — outside the display cap)
Every one of AU/HR/ORC/PM/CR/AR: >=1 relationship (DETECTED), >=1 skill, >=1 hook,
  >=1 equipment row, ROSTER_AGENT_NAME_BY_CODE hit (revise trigger renders), abilities: []
roster.getAgentDetail(DI): equipment/materia/abilities/relationships all [];
  dataQualityNotes = [
    "no agent spec on disk for code DI (ROSTER.specFile is null)",
    "no durable per-agent workflow source on disk; abilities intentionally empty (program.md §5 note 2)",
    "First-pass audit rate is not applicable to role category 'Meta' (attribution:'gate-renderer')"
  ]
```
This is why PROOF 1/2/3a/3b safely use "first card" / "second card" (position-deterministic,
not code-deterministic per the PM plan's e2e-determinism risk_flag) and why the DI test
route-mocks `roster.getParty` rather than depending on DI's real activity rank.

## Deliverable 2 — the three authorized s2-spec changes

`packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` — `git diff` verified to
contain **exactly** these three named changes, nothing else (22 insertions / 12 deletions, 1 file):

1. **(i) Card-Enter destination marker** (was ~L241): `whole-card is keyboard-operable...` test's
   final assertion `browse-page` → `agent-detail-page`; "routes to Browse" comment rewritten.
2. **(ii) Rail-Roster destination marker** (was ~L305-311): test renamed
   `'rail: Roster (interim) click lands on the Browse destination marker'` →
   `'rail: Roster click lands on the party-home destination marker'`; assertion `browse-page` →
   `party-page`; preceding comment rewritten to state the s3 nav-contract resolution.
3. **(iii) L313-325 aria-current invariant** — REWRITTEN (not just re-pointed, per CR#2 FIX 1):
   old test asserted `[aria-current="page"]` count `0` on the rail with a rationale that
   `activeMode==='party'` never matches a RAIL_ITEMS mode. That premise is now false (Roster maps
   to `'party'`). New test (`'rail: Roster carries aria-current="page" on the party surface...'`)
   asserts count `1` and that the current item's accessible name is `'Roster'`; the rationale
   comment is rewritten to explain the semantic-correctness of Roster reading as current on the
   party home (SubmenuRail's `isActive`→`aria-current` logic is unmodified — the re-point alone
   causes this to legitimately fire).

**L364-398 ("View Full Roster" CTA test, asserts `browse-page`) — verified UNCHANGED.** Confirmed
against current `PartyPage.tsx`: `handleViewRoster` still calls `setActiveMode('browse')` with the
s4 TODO comment (t4b's deliberate-retain decision) — no fourth change was made or needed.

## Verbatim reproduce-commands + outputs

### `npx playwright test` — both spec files, headless (post-fix)

Run TWICE (once before the full-suite run, once after) for reproducibility confidence — identical
result both times:

```
$ cd packages/client && npx playwright test tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts --reporter=list
Running 27 tests using 2 workers
  26 passed
  1 failed:
    tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts:158:1 › PROOF 3a — Edit absorption:
    revise dialog opens with explicit role/aria-modal + focus, edits save via the real mutation
    (mocked at the network boundary)
```

### `npm run lint` (all 3 packages)

```
$ npm run lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
(exit 0, no output — clean)
```

### Full suite (`npx playwright test`, no filter, documentation-only run)

```
$ cd packages/client && npx playwright test --reporter=list
Running 182 tests using 2 workers
  ...
  57 failed
  125 passed (8.4m)
```

**Classification of the 57 full-suite failures (all pre-existing / not introduced by t5):**

- **1 = the flagged genuine t3 defect** (`PROOF 3a`, see below) — also present in the isolated
  2-file gate, reproducible.
- **1 = an environmental flake**, `prog-studio-v2-2026-07-s2-party-shell.spec.ts:250` —
  `keyboard tab order: rail items in RAIL_ITEMS order, then party cards in DOM order`. This test
  is **untouched** by any of the 3 authorized s2 edits (it sits at L248-271, before my L239/305/
  313 edits). It failed only under the full 182-test / 2-worker parallel load
  (`toBeFocused` timeout after Playwright's built-in retries). **Re-ran the isolated 2-file gate
  a second time immediately after the full-suite run: this test passed cleanly, matching its
  first isolated run.** Two clean isolated passes + one failure only under maximum system
  contention is the signature of a resource-contention timing flake, not a functional
  regression — especially since t4b's Roster→'party' re-point (the only nearby recent change)
  alters a `mode` string comparison, not DOM structure or tab order.
- **55 = pre-existing failures in files t5 never touched** (`gander-studio-p1-browse-fe`,
  `gander-studio-p1-edit-fe`, `gander-studio-p1-fe-shell`, `gander-studio-p2-canvas-link-003a`,
  `materia-canvas-proximity`, `agent-timeline-zoom`, `card-node-title-edit`, `loadout-list-panel`,
  `overview-aggregate`, `p6-t1-timeline-buffer`, `prog-studio-vision-*`, `s3-t2/t3/t4/t5a-*`,
  etc). A large subset share one root cause visible in the failure text: **the default landing
  route changed from Browse to Party in the s2 sprint**, breaking older specs' assumption that
  `BASE_URL` lands on Browse by default (e.g. `gander-studio-p1-browse-fe.spec.ts:3` — "browse
  page loads and shows page title" fails because the app now lands on the party surface). The
  remainder are unrelated fixture/contrast/timing specs (SVG timeline geometry, table sort,
  contrast checks) with no connection to the party/agent-detail surfaces t5 tests. **Zero of
  these 55 touch `packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` or
  `prog-studio-v2-2026-07-s3-drilldowns.spec.ts`.**

## GENUINE DEFECT FLAGGED — blocks one assertion, out of FE#6 (t5) scope to fix

**`PROOF 3a` — `revise dialog` textarea is not focused on open.** Root-caused via a throwaway
Playwright probe (never committed — moved to scratchpad): after clicking `revise-spec-trigger`,
`document.activeElement` is the dialog's **Cancel** button, not the textarea.

**Root cause** (`node_modules/@base-ui/react/floating-ui-react/components/FloatingFocusManager.js`
:397-420): `initialFocus={textareaRef}` (`ReviseSpecAction.tsx` :145) is resolved inside a
`queueMicrotask` fired from a `useIsoLayoutEffect` keyed on `[disabled, open, floatingFocusElement, ...]`
— it runs **once**, synchronously after the dialog opens, **before** the async
`trpc.agent.get`/`skill.get` query resolves. `ReviseSpecAction.tsx` only mounts
`<Textarea ref={textareaRef}>` after `!isLoading` (`isLoading` is `true` on every cold open), so
`textareaRef.current` is `null` at resolution time. Base-ui falls back to
`focusableElements[0] || floatingFocusElement` — the first tabbable element in DOM order, which is
the Cancel `DialogClose` button. Reproduces deterministically on every cold-cache open (confirmed
across 2 runs, non-flaky) — this is not a race that "usually" works, it structurally can never
land on the textarea for a first-time open of any target.

**Why this is out of scope for FE#6/t5:** `ReviseSpecAction.tsx` is t3's file; t5's out_of_scope
explicitly forbids modifying source components ("report defects back, do not fix inline").

**Why the assertion was kept (not weakened):** the task packet's own DELIVERABLE 1 language is
"dialog opens with the editor focused (**explicit focus proof** — assert the editor/textarea is
focused, not the body)" — this is the literal proof t5 exists to deliver. Weakening or removing
the assertion would silently hide a real, reproducible a11y regression (the s2 AA §6 G2 defect
class this sprint's binding "explicit focus" language was written to prevent).

**Remediation sketch (not implemented — for t3's remediation, not built here):** resolve
`initialFocus` via the function form (`(openType) => ...`) returning `false` while `isLoading`,
paired with a `useEffect` on `!isLoading` that calls `textareaRef.current?.focus()` once the field
mounts — OR keep the `<Textarea>` always mounted (toggle `hidden`/`readOnly` instead of a
conditional unmount) so `textareaRef.current` exists at the microtask-resolution instant.

**Everything downstream of this one assertion is unaffected:** `PROOF 3b`'s Escape/return-focus
assertion (`finalFocus={triggerRef}`) passes — that's a separate effect, unaffected by the
initial-focus bug — and the buffer-contamination regression + save-payload-targets-B assertions
both pass cleanly.

## Constant / style / a11y audits

<style_conflict_check>NONE</style_conflict_check>

- **Raw-hex grep** on both touched files: 1 match, `prog-studio-v2-2026-07-s2-party-shell.spec.ts:468`
  — `// --w (#ffffff) per contrast_pairs AAA pairing...` — a **pre-existing comment**, in a section
  of the file I did not touch (the "legibility spot-check" test, untouched by any of the 3
  authorized changes). Documented per the pre-existing-violation carve-out; not blocking.
- **Inline-style/Tailwind conflict grep:** 0 matches (test files, no JSX authored).
- **Click-handler keyboard-equivalent grep** (`<span|div|li|a ... onClick=`): 0 matches.
- **`JSON.parse` grep:** 0 matches.
- **Function-body-dedup scan** (`onFocus`/`onBlur`/`onClick`/`onChange`/`onKeyDown`): 0 matches —
  these are Playwright spec files, no JSX event handlers authored.

## Files touched (absolute paths)

- `/home/jhber/projects/gander-studio-alpha/packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (NEW)
- `/home/jhber/projects/gander-studio-alpha/packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` (EDITED — 3 named changes only, `git diff` verified)

No `src/` file was read-write touched by t5 (verified via `git status --porcelain` — all `src/`
changes on disk belong to t1-t4b, pre-existing before this task started).

No `git commit` / `git add` / `git stash` was run (per boundary).

## `npm run lint` (all 3 packages, verbatim)

```
$ npm run lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
(exit 0 — no output, clean across all 3 packages)
```

## Scope confirmation

Task_id in this packet (`prog-studio-v2-2026-07-s3-drilldowns-t5`) matches the task_id assigned in
the spawn prompt. No `-infra`/consolidated/other-task_id work was performed. No task-boundary
violation to flag.

---

```xml
<ui_packet>
  <components_created>
    packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts (NEW, 8 tests)
    packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts (EDITED — exactly 3
      authorized named changes: card-Enter marker, rail-Roster marker, aria-current invariant
      rewrite; L364-398 CTA test and all other assertions confirmed unchanged via git diff)
  </components_created>
  <state_hydration_map>
    N/A — e2e-test-only task, no client state/store files touched. Verified upstream (t1-t4b)
    hydration chain consumed by the new spec: PartyPage.handleSelect -> setSelectedAgentCode +
    setActiveMode('agent-detail') -> ModeContent PAGE_MAP (React.lazy) -> AgentDetailPage ->
    trpc.roster.getAgentDetail(code) (real/live) -> header (StatBar) + t1 InventoryPanels +
    t2 RelationshipPanel + t3 ReviseSpecAction, all prop-driven from the single query result.
  </state_hydration_map>
  <a11y_verification>
    Explicit role="dialog"/aria-modal="true" asserted via literal DOM attribute selector (not
    inferred). Focus-on-open asserted (FAILS — genuine t3 defect, flagged, not fixed).
    Escape-closes-and-returns-focus-to-trigger asserted (PASSES). Keyboard Tab-reachability to
    the revise trigger + Enter-activation + Enter-activation of Back-to-party all asserted and
    PASS. Heading-level-skip scan (h1-h6, no jump > 1) + all 4 panel headings present, PASS.
    Token-collision computed-style guard on the revise editor (color != background, color not
    transparent) PASSES. aria-current="page" semantics on the Roster rail item verified via the
    rewritten s2 invariant (accessible name "Roster", count 1).
  </a11y_verification>
  <design_tokens_used>
    N/A — no component/styling code authored; test-only task. Verified (not authored) that t1-t4b's
    components under test use FF7 runtime tokens (var(--w), var(--mt), etc.) via prior file reads;
    no raw hex introduced by t5 in either touched file (1 pre-existing raw-hex comment noted below,
    untouched code path).
  </design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <integration_status>
    PARTIAL — SUCCESS for both deliverables' test coverage and the s2-spec edits (26/27 green,
    reproduced twice); ONE assertion (PROOF 3a explicit-focus-on-open) fails due to a genuine,
    reproducible upstream defect in t3's ReviseSpecAction.tsx (base-ui initialFocus ref resolves
    before the async-loaded Textarea mounts) — flagged for t3 remediation, NOT fixed here (out of
    t5's file scope). All other proofs (Browse, Graph, Edit buffer-regression + save-payload
    targeting, back-to-party, DI honest-empty, both a11y tests) are SUCCESS against live/real
    trpc data. Full 182-test suite run (documentation-only) is 125/182 passed; the 57 failures are
    entirely pre-existing/environmental (1 known t3 defect + 1 confirmed-non-reproducing flake in
    an untouched test + 55 failures in files t5 never touched, largely rooted in s2's Browse->Party
    default-route change). Pre-existing non-blocking finding: 1 raw-hex value in a comment at s2
    spec L468, in code t5 did not touch.
  </integration_status>
</ui_packet>
```
