# FE#4 Completion Packet — prog-studio-v2-2026-07-s2-party-shell-t4

Task: PartyPage + useParty data hook.
Contract read: `prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md` (`<task_packet>` t4) TOGETHER
WITH `prog-studio-v2-2026-07-s2-party-shell-amend-PM-1783474258.md` (W2 mapping applies to this
packet; W5 risk notes are ORC's per the brief, not restated here).

<ui_packet>
  <components_created>
    /home/jhber/projects/gander-studio-alpha/packages/client/src/hooks/useParty.ts (40 lines)
    /home/jhber/projects/gander-studio-alpha/packages/client/src/pages/PartyPage.tsx (245 lines)
    /home/jhber/projects/gander-studio-alpha/packages/client/src/pages/__tests__/PartyPage.test.ts (97 lines, colocated vitest for the 4 exported pure helpers)
  </components_created>

  <state_hydration_map>
    trpc.roster.getParty.useQuery() [useParty.ts]
      → { data: PartyStats | undefined, isLoading, isError, error, refetch } [PartyData]
      → PartyPage: state = derivePartyGridState({ isLoading, isError, members: data?.members })
        - state === 'loading'  → PartyGridSkeleton (6 shimmer-box placeholder cards, aria-busy + sr-only)
        - state === 'error'    → ErrorPartyState (formatPartyError(error) into ErrorState + composed Retry Button → refetch())
        - state === 'empty'    → EmptyPartyState (role="status", CTA → setActiveMode('browse'))
        - state === 'default'  → data.members.slice(0, 6) → PartyMemberCard[] (onSelect → setSelectedAgentCode(code) + setActiveMode('browse'), R-4 interim)
      → PartyScreenHeader consumes data?.members (all members, NOT the sliced 6) for
        formatScopeSummary → "{n}-agent roster · updated {most-recent lastActivityTs formatted}"
        (ScopeSummary renders only once `data` exists — omitted during initial load / hard error)
      → Diagnostics footnote: rendered when (state === 'default' || state === 'empty') AND
        data.diagnostics.invalidLineCount > 0 OR data.diagnostics.uncountedEventTypes > 0
        — unobtrusive xs/--wm text below the grid (program.md §5 note 1 affordance)
      → useUIStore: setActiveMode, setSelectedAgentCode consumed directly (no new store slice —
        t1's selectedAgentCode contract and pre-existing setActiveMode reused as-is)
    No local component state — the query result + derived pure functions drive every branch.
  </state_hydration_map>

  <a11y_verification>
    - PageTitle: semantic `<h1>`, non-interactive (spec keyboard_flow: skipped in tab order — no
      interactive element inside it), preceded by an aria-hidden 2px×18px `--mt` vertical rule
      (DESIGN.md "Page title" Component Rule verbatim, no box-shadow glow).
    - EmptyPartyState: `role="status"` (announces without requiring focus move, per
      aria_requirements), `<h2>` heading (no skipped-level risk — no h2 renders elsewhere on this
      page since no visible "Submenus" group label is used), lucide `Users` icon `aria-hidden="true"`,
      CTA is a real `<Button>` (native `<button>` via base-ui primitive).
    - ErrorPartyState: reuses `components/ui/error-state.tsx`'s own `role="alert"` root (verified by
      reading the file — it sets `role="alert"` and displays a string `error` prop verbatim); Retry
      is a real `<Button variant="outline">` (ErrorState has no built-in Retry slot — composed
      per the packet's own fallback instruction, confirmed by reading the file before choosing this
      path).
    - Loading state: wrapper `aria-busy="true"` + `<span className="sr-only">Loading party
      roster…</span>` (mirrors BrowsePage's SkeletonGrid convention exactly); individual skeleton
      cards are `aria-hidden="true"` (decorative placeholders, the sr-only label is the single
      accessible announcement).
    - Default state: PartyMemberCard (t3) is already a single native interactive element per card
      with a composite aria-label — nothing added or altered here (out of scope, t3 owns it).
    - SubmenuRail (t3) — already `role="navigation"` `aria-label="Party screen submenus"`; mounted
      here inside a `hidden lg:flex` wrapper. On mobile the wrapper is `display:none`, which
      correctly removes the rail from the tab sequence (no manual tabIndex management needed) —
      BottomTabBar (untouched) covers small-viewport nav this sprint per plan R-1/R-3.
    - Tab-order verification (static): DOM order is rail-wrapper THEN content-column, matching the
      spec's keyboard_flow (SubmenuRail items → PartyMemberCard grid) without any manual tabIndex
      juggling. Rendered-focus assertions are t6's job (Tier-2 e2e, out of scope here).
    - Click-handler keyboard-equivalent audit: `grep -nE "<(span|div|li|a)[^>]*onClick="
      PartyPage.tsx` → 0 matches (only `<Button>` carries onClick).
    - Contrast: every text pairing added here traces to a `contrast_pairs` row already in the spec
      (PageTitle `--w`/`--void`≈21:1 AAA; ScopeSummary `--wm`/surface ≥5.06:1 AA; empty-state body
      `--wd`/surface 9.6:1 AAA; empty-state CTA `--void`/`--mt` 8.12:1 AA+; error message `--redb`/
      `--void` 5.22:1 AA via ErrorState's existing styling, unmodified). No new pairing invented.
  </a11y_verification>

  <design_tokens_used>
    --mt (PageTitle rule, active-nav reference — consumed indirectly via SubmenuRail/t3), --w
    (PageTitle text, empty/loading card text, monogram — via t2/t3), --wd (empty-state body), --wm
    (ScopeSummary, diagnostics footnote, empty-state icon tint), --sf (skeleton card background),
    --bd (skeleton card border), --sfh/--sfm (via shimmer-box/popover, unmodified), --radius
    (skeleton card + portrait radius reference), --redb (error accent, via unmodified error-state.tsx).
    Typography: DESIGN.md type scale `lg` (16px, PageTitle/empty heading), `xs` (10px, ScopeSummary +
    diagnostics footnote), `sm` (12px, empty-state body) — all cited from DESIGN.md's own table, no
    freshly-invented sizes. Spacing: Tailwind `gap-6`/`gap-4`/`gap-3`/`gap-2` map 1:1 to DESIGN.md
    `space-6`/`space-4`/`space-3`/`space-2`. Zero raw hex literals (grep-verified, 0 matches).

    <spec_primitive_substitution_mapping>
      (amendment W2, Critic-RATIFIED — not a fidelity deviation; recorded verbatim per must_contain)
      Card     → PartyMemberCard  (t3, custom, FF7-tokened; consumed here, not built here)
      Badge    → RoleTag          (t3, custom, FF7-tokened; consumed here)
      Progress → StatBar          (t2, custom new_pattern_proposal; consumed here via PartyMemberCard)
      Skeleton → shimmer-box      (existing components/ui/shimmer-box.tsx — THIS packet consumes it
                                    directly for the 6 loading-placeholder cards)
      Alert    → error-state      (existing components/ui/error-state.tsx — THIS packet consumes it,
                                    composed with ui/button.tsx for the Retry action since ErrorState
                                    has no built-in Retry slot)
      Rationale (stated once, centrally, matching t2/t3's identical comment): components/ui/ contains
      only {button, popover, dialog, select, input, textarea, shimmer-box, error-state} — none of the
      five spec-named Shadcn primitives are installed, and installing raw Shadcn primitives collides
      with the FF7 Mako token system (memorized S2 gotcha: Shadcn defaults → invisible text). CR#1
      disk-verified this substitution and ratified it — DRY + collision-avoidance, not a fidelity
      shortfall.
    </spec_primitive_substitution_mapping>
  </design_tokens_used>

  <style_conflict_check>NONE — every JSX element uses either `className` (Tailwind layout utilities:
  flex/flex-col/grid/gap-N/hidden/lg:flex/items-center) or `style={{...}}` (FF7 tokens: color,
  background, border, padding, typography, width/flexShrink on the rail wrapper), never both for the
  same CSS property on the same element. Manually reviewed all 20 styled elements in PartyPage.tsx;
  0 overlaps.</style_conflict_check>

  <integration_status>LIVE. VERIFY-THEN-IMPLEMENT (R-7) confirmed BEFORE writing any code:
    (1) static grep of `packages/server/src/router.ts` — line 829 `roster: rosterRouter`, line
        788-793 `getParty: t.procedure.output(PartyStatsSchema).query(...)`, no input;
    (2) `packages/client/src/trpc.ts` types its proxy `createTRPCReact<AppRouter>()` off the SAME
        `AppRouter` export from `@gander-studio/server`, so `trpc.roster.getParty` is automatically
        available client-side — no server/shared edit was needed or made;
    (3) live curl against the ALREADY-RUNNING `:3001` dev server (not restarted):
        `curl -s http://localhost:3001/trpc/roster.getParty` returned a real 13-member envelope
        (`{"result":{"data":{"members":[...13 items...],"diagnostics":{"totalRawLines":1779,
        "validEntries":1778,"invalidLineCount":1,"invalidLineSamples":[...],
        "distinctEventTypes":33,"uncountedEventTypes":27},"activityAnchor":159}}}`), confirming the
        `PartyStatsSchema` envelope shape matches `useParty`'s expectations exactly, AND that the
        diagnostics-footnote branch (invalidLineCount=1, uncountedEventTypes=27, both >0) is
        exercisable against real corpus data today, not just a synthetic fixture.
    roster was NOT broken; implementation proceeded as planned, no FLAG needed.
    PartyPage is authored but UNROUTED this packet (t5 owns PAGE_MAP wiring) — matches out-of-scope.
  </integration_status>
</ui_packet>

## Verify — commands + verbatim output

### `npm run lint` (tsc ×3)
```
$ npm run lint

> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
```
(exit 0, no diagnostics printed — clean across all three packages)

### `npm test -w @gander-studio/client`
```
$ npm test -w @gander-studio/client

> @gander-studio/client@0.1.0 test
> vitest run

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client

 Test Files  6 passed (6)
      Tests  37 passed (37)
   Start at  20:05:43
   Duration  942ms (transform 341ms, setup 0ms, import 940ms, tests 105ms, environment 1ms)
```
Note: the brief cited "existing 27 green" as the pre-t4 baseline (after t1/t2/t3 landed their own
colocated tests: `ui-store.test.ts`, `StatBar.test.ts`, `PartyMemberCard.test.ts`, plus prior-sprint
suites). This packet's own `PartyPage.test.ts` adds 10 new cases across 4 exported pure helpers
(`derivePartyGridState` ×4, `computeMostRecentActivityTs` ×2, `formatScopeSummary` ×2,
`formatPartyError` ×2), bringing the total to 37 — all green, 0 failures, 0 skipped.

### Production build (additional verification beyond the required gate)
```
$ npm run build --workspace=@gander-studio/client

> @gander-studio/client@0.1.0 build
> tsc && vite build

vite v6.4.1 building for production...
✓ 2497 modules transformed.
✓ built in 5.50s
```
(exit 0 — the client package's own `tsc` step and full Vite production build both pass with the
two new files present, even though PartyPage is not yet imported/routed by ModeContent.)

### Live smoke of `roster.getParty` (server NOT restarted, existing :3001 instance)
```
$ curl -s http://localhost:3001/trpc/health
{"result":{"data":"ok"}}

$ curl -s "http://localhost:3001/trpc/roster.getParty"
{"result":{"data":{"members":[ ...13 members... ],
  "diagnostics":{"totalRawLines":1779,"validEntries":1778,"invalidLineCount":1,
    "invalidLineSamples":[...],"distinctEventTypes":33,"uncountedEventTypes":27},
  "activityAnchor":159}}}
```
Confirmed shape matches `PartyStatsSchema` exactly (members[], diagnostics{...}, activityAnchor) —
this is the same object `useParty()`'s `data` field will receive once PartyPage is routed (t5).

## Verify-then-implement note (R-7)

Per the packet's explicit instruction, the client tRPC roster exposure was re-verified BEFORE writing
`useParty.ts`, not assumed from CR#1's prior citation:
- Re-read `packages/server/src/router.ts:788-829` directly (not just trusted the CR#1 line-number
  citation) — confirmed `rosterRouter.getParty` exists, `.output(PartyStatsSchema)`, no input, and is
  mounted at `appRouter.roster` (line 829).
- Re-read `packages/client/src/trpc.ts` — confirmed `createTRPCReact<AppRouter>()` imports `AppRouter`
  as a TYPE from `@gander-studio/server`, meaning any router change on the server side (including the
  `roster` router) is automatically reflected in the client's typed proxy with zero client-side
  wiring — `trpc.roster.getParty.useQuery()` was available and correctly typed on first write, no
  compile error, no FLAG needed.
- Live-curled the actual running server (not a mock) to confirm runtime behavior matches the static
  type, closing the loop between "the types compile" and "the endpoint actually returns this shape."

## W2 spec-primitive→substitute mapping (recorded per amendment, targets t2/t3/t4)

See `<spec_primitive_substitution_mapping>` inside the `<design_tokens_used>` block above — recorded
verbatim per the amendment's `must_contain_add` for t4, so REQVAL's "spec says `<Skeleton>`/`<Alert>` —
are they used?" question is pre-adjudicated ACCEPTABLE rather than raised as a fidelity FAIL.

## SC-by-SC self-check (against t4's own `<success_criteria>`)

1. **`npm run lint` (tsc ×3) clean; client build passing.** — PASS (verbatim output above; both the
   isolated `tsc --noEmit` lint gate and the full `tsc && vite build` production build are clean).
2. **With the dev server up and live non-empty `roster.getParty` data, PartyPage renders the default
   state (up to 6 cards, header + scope summary, desktop rail); asserted headless in t6; this
   packet's own check is manual/dev-server + build-pass confirmation.** — PARTIAL BY DESIGN: PartyPage
   is unrouted this packet (t5 owns PAGE_MAP; explicitly out of scope for t4 to wire), so an actual
   in-browser navigation to the surface is not possible yet. Satisfied via: (a) live curl confirming
   the exact data shape the default-state branch consumes, (b) tsc + vite build passing with the file
   present, (c) the extracted `derivePartyGridState`/`formatScopeSummary` pure-logic vitest coverage.
   The full rendered-interaction assertion is t6's explicit job per the dependency chain.
3. **All four PartyGrid states are reachable and correct; state logic is unit-testable here.** — PASS.
   `derivePartyGridState` is unit-tested for all 4 precedence combinations (loading-over-error,
   error-over-empty/default, empty-vs-default on member count). Rendered-interaction assertions
   (route-mocked loading/empty/error) are t6's job per the dependency chain, as stated in this SC.
4. **Diagnostics footnote appears only when invalid/uncounted counts are non-zero; xs/--wm; does not
   obstruct the grid.** — PASS. Condition `(state === 'default' || state === 'empty') && data &&
   (invalidLineCount > 0 || uncountedEventTypes > 0)`; live data today has `invalidLineCount=1,
   uncountedEventTypes=27` — both true, footnote will render; styled `10px`/`var(--wm)`, block-level
   `<p>` below the grid/empty-state block, not absolutely positioned, cannot obstruct.
5. **No raw hex; all colors via FF7 tokens (grep clean on PartyPage.tsx + useParty.ts).** — PASS
   (grep verified, 0 matches, recorded in the Stage 3 log).
6. **`useParty` returns the envelope typed via `z.infer<typeof PartyStatsSchema>` (no re-declared
   local shape).** — PASS. `PartyData.data: PartyStats | undefined` where `PartyStats` is imported
   directly from `@gander-studio/shared` (`export type PartyStats = z.infer<typeof
   PartyStatsSchema>;` in `packages/shared/src/schemas.ts`) — zero local re-declaration.
7. **integration_status: LIVE by packet close (MOCKED intermediate documented if s1 env not up at
   start).** — PASS, LIVE from the start; the s1 env (`:3001` dev server, `GANDER_ROOT`/
   `SESSIONS_SOURCE_DIRS`) was already up per the task prompt ("dev server IS RUNNING on :3001 — do
   not kill/restart"); no MOCKED intermediate was ever needed.

## Out-of-scope compliance confirmation

- Did NOT edit `AppShell.tsx`, `ModeContent.tsx`, `store/ui-store.ts` (`AppMode`/`PAGE_MAP`/default —
  t5 owns), `BottomTabBar.tsx`, `globals.css`, or any t1/t2/t3 file
  (`navigation.ts`, `components/party/{PortraitFrame,StatBar,materia-tint,PartyMemberCard,
  SubmenuRail}.tsx`). Verified via `git status` before writing (see below) and by only ever using
  `Read` (never `Edit`/`Write`) on those files during this session.
- No Shadcn Skeleton/Alert install — reused `shimmer-box.tsx` and `error-state.tsx` exactly as
  instructed.
- No cost/MP bar rendered anywhere.
- No git commit, no git add, no push — deliverables are the two source files + one test file +
  this packet only.

```
$ git status --short packages/client/src packages/shared packages/server
?? packages/client/src/components/party/PartyMemberCard.tsx      (t3, pre-existing, untouched)
?? packages/client/src/components/party/SubmenuRail.tsx          (t3, pre-existing, untouched)
?? packages/client/src/components/party/__tests__/PartyMemberCard.test.ts  (t3, pre-existing, untouched)
?? packages/client/src/hooks/useParty.ts                         (THIS packet)
?? packages/client/src/pages/PartyPage.tsx                       (THIS packet)
?? packages/client/src/pages/__tests__/                          (THIS packet)
```
Zero `M` (modified) entries anywhere in the three packages — confirming no existing tracked file
(t1's `ui-store.ts`/`navigation.ts`, t2's already-committed primitives, or any other tracked source)
was touched. The `??` t3 entries are PartyMemberCard/SubmenuRail's own pre-existing untracked
deliverables (read-only inputs to this packet, not written by it); t1/t2's files do not appear at all
because they are already committed to the branch and unmodified.

## Task ID confirmation

Executed task_id: `prog-studio-v2-2026-07-s2-party-shell-t4` — matches the task_id in the spawn
prompt exactly. No `t5` (AppMode/PAGE_MAP/default flip) or `t6` (e2e) work was performed; both are
explicitly out of scope per the brief and were not touched.
