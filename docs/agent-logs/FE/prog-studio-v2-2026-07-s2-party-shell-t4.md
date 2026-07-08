## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-07-08T01:59:09Z
- **Task ID:** prog-studio-v2-2026-07-s2-party-shell-t4
- **Message received:**
  > You are FE#4 executing task packet `prog-studio-v2-2026-07-s2-party-shell-t4` — PartyPage + the useParty data hook.
  >
  > Your contract is TWO files read together (packet prevails; amendment overrides on amended points):
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md → <task_packet> t4 ONLY
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-amend-PM-1783474258.md (W2 mapping applies; W5 risk notes are ORC's, not yours)
  >
  > Upstream on disk (consume): t1 store/constants; t2 primitives; t3 components/party/{PartyMemberCard,SubmenuRail}. Data: trpc.roster.getParty.useQuery — VERIFY-THEN-IMPLEMENT (R-7): confirm the typed client exposes roster.* (trpc.ts createTRPCReact<AppRouter>; CR#1 verified router.ts:829 includes roster — re-verify, then implement; if broken, FLAG and stop, don't fix server code). The procedure returns the PartyStatsSchema ENVELOPE {members, diagnostics, activityAnchor} per docs/programs/prog-studio-v2-2026-07/program.md §5 note 1 — consume members for cards, surface diagnostics as the spec's unobtrusive data-quality affordance.
  > Design contract: docs/v2-vision/v2-design-spec.md — page layout (rail mounted page-local per plan R-3, hidden below lg), header, ALL FOUR states: loading (shimmer-box per W2 mapping), empty, error with Retry (re-issues the query), default. FF7 tokens explicit everywhere (collision gotcha); contrast_pairs canonical.
  > Live check: dev server IS RUNNING on :3001 (do not kill/restart). After wiring, load the Vite client if practical (npm run dev client-side or vite build) — at minimum verify the query path with a typed compile + your own smoke (curl the procedure; confirm shape matches your hook's expectations). Record what you ran.
  >
  > Verify: npm run lint (tsc ×3) + npm test -w @gander-studio/client (existing 27 green); record outputs verbatim.
  >
  > …[truncated]

## [STAGE 3] INTERRUPTED
- **At:** 2026-07-08T02:03:05.122202+00:00
- **Detected by:** agent-stop-checkpoint hook (session ended without Stage 3)
- **Action required:** Re-dispatch FE#4 (canonical: FE#4) for task `prog-studio-v2-2026-07-s2-party-shell-t4`.
  Read `docs/agent-logs/FE/latest.md` before starting — skip completed checkpoints.

## [STAGE 2] PLAN
- **At:** 2026-07-08T02:12:00Z
- **Components to build:**
  - `packages/client/src/hooks/useParty.ts` — wraps `trpc.roster.getParty.useQuery()`, returns `{ data, isLoading, isError, error, refetch }` typed via `z.infer<typeof PartyStatsSchema>` (import `PartyStats` from `@gander-studio/shared`; no re-declared local shape).
  - `packages/client/src/pages/PartyPage.tsx` — default export. Composes: `PartyScreenHeader` (h1 PageTitle + `--mt` 2x18px rule + ScopeSummary), responsive 2-col layout (`SubmenuRail` hidden below `lg`, `PartyGrid` main column), 4 mutually-exclusive PartyGrid states (loading/empty/error/default), diagnostics footnote. Exports pure helpers `derivePartyGridState`, `formatScopeSummary`, `computeMostRecentActivityTs`, `formatPartyError` for a colocated unit test (mirrors StatBar's `computeStatBarViewModel` pattern — vitest is `environment: node`, no RTL/jsdom, `.test.ts` glob only).
  - `packages/client/src/pages/__tests__/PartyPage.test.ts` — vitest for the 4 pure helpers (state selection precedence, scope-summary formatting, error-message formatting).
- **State design:** No new store slice (t1 already added `selectedAgentCode`/`setSelectedAgentCode`; t5 not dispatched yet so `AppMode`/`PAGE_MAP` untouched — PartyPage exists unrouted this packet, per out-of-scope). Local component state: none needed (query state drives everything). `onSelect` wiring: `setSelectedAgentCode(code)` + `setActiveMode('browse')` (R-4 interim).
- **tRPC wiring:** `trpc.roster.getParty.useQuery()` — VERIFY-THEN-IMPLEMENT (R-7) confirmed via (a) static grep of `packages/server/src/router.ts` (line 829 `roster: rosterRouter`, line 789 `getParty: t.procedure.output(PartyStatsSchema).query(...)`, no input) and (b) a live curl against the running :3001 dev server returning a real 13-member envelope with non-zero `diagnostics.invalidLineCount`(1)/`uncountedEventTypes`(27) — both diagnostics-nonzero and default-grid states independently live-verifiable. Client `trpc.ts` is `createTRPCReact<AppRouter>()` off `@gander-studio/server`'s exported `AppRouter` type, so `roster.getParty` is automatically on the typed proxy — no server/shared edit needed. NOT broken; proceeding to implement.
- **A11Y plan:** header `<h1>` (PageTitle, non-interactive, spec keyboard_flow skip); EmptyPartyState `role="status"` + `<h2>` heading + `aria-hidden` icon + CTA button; ErrorPartyState reuses `components/ui/error-state.tsx`'s own `role="alert"` root (verified: takes `error: unknown`, displays a string error verbatim — so I format the exact spec message string client-side and pass it as a string) + composed `<Button variant="outline">` Retry (ErrorState has no Retry slot — confirmed by reading the file; composing per packet instruction); loading state `aria-busy="true"` + `sr-only` label wrapper (mirrors `BrowsePage`'s `SkeletonGrid` convention) built from `components/ui/shimmer-box.tsx` (verified API: `style`/`srLabel`/`className`/`aria-busy`/`data-testid`); default state's `PartyMemberCard` (t3) is already a single focusable element with composite aria-label — nothing further needed; `SubmenuRail` (t3) already `role="navigation"`.

### Checkpoint — 02:15:00
- Wrote `packages/client/src/hooks/useParty.ts` (34 lines). Constant audit: 0 raw-hex matches. Next: write PartyPage.tsx.
### Checkpoint — 02:24:00
- Wrote `packages/client/src/pages/PartyPage.tsx` (241 lines). Constant audit: 0 raw-hex matches (all colors via `var(--token)`); pixel literals (`240px`, `16px`, `14px`, `6px`, `2px`, `18px`, `8px`, `10px`, `48px`, `24px`, `32px`, `360px`) each appear once or are the documented DESIGN.md type-scale/spacing values reused verbatim from t2/t3 precedent — no duplicated magic number introduced. Next: write colocated vitest for the 4 exported pure helpers.
### Checkpoint — 02:27:00
- Wrote `packages/client/src/pages/__tests__/PartyPage.test.ts` (91 lines). Constant audit: 0 raw-hex matches (fixture-only file, no color tokens). Next: run tsc ×3 + vitest; live curl re-verify; constant/style/JSON.parse/click-handler audits; write ui_packet.

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T02:35:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |---|---|---|
  | `packages/client/src/hooks/useParty.ts` | 40 | wraps `trpc.roster.getParty.useQuery()`, returns `{ data, isLoading, isError, error, refetch }` typed via `PartyStats` (`z.infer<typeof PartyStatsSchema>`) |
  | `packages/client/src/pages/PartyPage.tsx` | 245 | default export; header + rail mount (hidden below `lg`) + 4-state PartyGrid + diagnostics footnote; 4 exported pure helpers |
  | `packages/client/src/pages/__tests__/PartyPage.test.ts` | 97 | vitest for the 4 pure helpers (10 cases) |
- **Lint:** `npm run lint` (tsc ×3: shared, server, client) — exit 0, no output (clean).
- **Build:** `npm run build --workspace=@gander-studio/client` (`tsc && vite build`) — exit 0, 2497 modules transformed, no errors.
- **Vitest:** `npm test -w @gander-studio/client` — 6 test files, 37 passed (37), 0 failed.
- **Constant audit:** 0 raw-hex matches across all 3 files; 0 `color-mix` re-inlines (correctly deferred to t2's `materiaTint`, unused here since PartyPage/useParty consume tokens directly via `var(--token)`, never derive tints).
- **Style-conflict audit:** 0 — every element uses either `className` (layout: flex/grid/gap/hidden/lg:flex) or `style` (tokens: color/background/border/padding/typography), never both for the same CSS property.
- **Click-handler audit:** 0 matches for `onClick` on bare span/div/li/a — only `<Button>` (native `<button>` via base-ui) carries interaction.
- **JSON.parse audit:** 0 matches (no external data parsing in this packet).
- **Live verification:** curled the running `:3001` dev server directly (`curl http://localhost:3001/trpc/roster.getParty`) — confirmed 13-member envelope, `diagnostics: {invalidLineCount:1, uncountedEventTypes:27, ...}`, `activityAnchor:159`; both diagnostics-nonzero and default-grid states are live-exercisable against real data. Server dev instance was NOT restarted.

