# FE#3 Completion Packet — prog-studio-v2-2026-07-s2-t3 (PartyMemberCard + SubmenuRail)

Task packet: `prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md` → `<task_packet>` t3
Amendment: `prog-studio-v2-2026-07-s2-party-shell-amend-PM-1783474258.md` — W1, W2, W4 applied.

<ui_packet>
  <components_created>
packages/client/src/components/party/PartyMemberCard.tsx (213 lines)
packages/client/src/components/party/SubmenuRail.tsx (60 lines)
packages/client/src/components/party/__tests__/PartyMemberCard.test.ts (42 lines — pure buildCardAriaLabel unit tests, not required by t3's success_criteria but added following t2's computeStatBarViewModel precedent)
  </components_created>

  <infra_fix_note>
`packages/client/vitest.config.ts` — added `resolve.alias` (mirrors `vite.config.ts` exactly:
`'@': path.resolve(__dirname, './src')`). Root cause: any vitest test that transitively imports a
`components/ui/*` file (which all use the `@/lib/utils` alias) fails module resolution, because
`vitest.config.ts` had no alias config while `vite.config.ts` does. This is the first packet whose
own colocated test (importing PartyMemberCard.tsx → components/ui/popover.tsx) exercises that
path — a pre-existing test-infra gap, not a t1/t2/other-packet-owned file. Fix is non-behavioral
(test-time module resolution only) and was necessary to make my own required verification
("existing 24 tests stay green") pass with the new test added — without it, the new test suite
fails to even load, at 24/25 files (not a clean run). Flagging explicitly since this is outside my
named two files, in case ORC/Critic wants it split into its own tiny follow-up record; no other
packet in this sprint owns or touches vitest.config.ts.
  </infra_fix_note>

  <spec_substitution_mapping_w2>
Recorded verbatim in both PartyMemberCard.tsx and SubmenuRail.tsx header comments (Critic-RATIFIED,
CR#1 disk-verified — not a fidelity deviation):
  Card     → PartyMemberCard  (custom, FF7-tokened)
  Badge    → RoleTag          (custom, FF7-tokened, defined inline in PartyMemberCard.tsx)
  Progress → StatBar          (t2, custom new_pattern_proposal)
  Skeleton → shimmer-box      (existing components/ui/shimmer-box.tsx — t4 consumes)
  Alert    → error-state      (existing components/ui/error-state.tsx — t4 consumes)
Rationale (stated once per file): components/ui/ contains only {button, popover, dialog, select,
input, textarea, shimmer-box, error-state} — none of the five spec-named Shadcn primitives are
installed; installing raw Shadcn primitives collides with the FF7 Mako token system (memorized S2
gotcha: Shadcn defaults → invisible text).
  </spec_substitution_mapping_w2>

  <statbar_filltoken_mapping>
Activity → member.materiaColorKey | Stamina → '--mg' (STAT_FILL_TOKEN_STAMINA constant,
success-semantic per DESIGN.md Color Tokens) | Accuracy → member.materiaColorKey. normalized/reason
for each bar are looked up from `member.stats[]` by `label` (findStat helper) — N/A is entirely
data-driven (server sends normalized:null + reason); no per-role special-casing in the card.
  </statbar_filltoken_mapping>

  <state_hydration_map>
PartyMemberCard is store-agnostic: receives `member: PartyMember` (typed via
`z.infer<PartyMemberSchema>`, packages/shared/src/schemas.ts) and `onSelect: (code: string) => void`
as props — no direct store read/write (per out_of_scope: "Do NOT read/write selectedAgentCode
inside PartyMemberCard"). The click handler calls `onSelect(member.code)`; t4 (PartyPage, not this
packet) is the seam that wires `onSelect={(code) => { setSelectedAgentCode(code);
setActiveMode('browse'); }}` against `useUIStore`'s `selectedAgentCode`/`setSelectedAgentCode`
(t1's contract, verified present and untouched on disk before starting).

SubmenuRail reads `useUIStore()` directly for `activeMode` (to derive each item's active/inactive
styling + `aria-current`) and `setActiveMode` (called on click with `item.mode`, sourced from
`RAIL_ITEMS`, t1's constant) — mirrors BottomTabBar.tsx's existing store-read pattern verbatim, no
new store fields added, no store file touched by this packet.
  </state_hydration_map>

  <a11y_verification>
PartyMemberCard:
- Whole card is ONE native `<button>` element (base-ui `PopoverTrigger`, `nativeButton` default —
  verified against node_modules/@base-ui/react/button/Button.js: renders 'button' via
  useRenderElement) — never a bare clickable div/span. Single tab stop; Enter/Space activate the
  click handler via native button semantics (no custom onKeyDown needed for activation).
- `aria-label` = pure `buildCardAriaLabel(member)`: "{code}, {roleCategory}. Activity {n%|not
  applicable}, Stamina {n%|not applicable}, Accuracy {n%|not applicable}." — exact contract from
  design_spec accessibility_spec.aria_requirements. Unit-tested (3 cases: all-populated,
  single-N/A, missing-stat-entry).
- Popover quick-peek: opens on hover after a 300ms delay (matches base-ui Popover's own OPEN_DELAY
  default — no invented magic number) OR immediately on keyboard focus (onFocus/onBlur), driven by
  a manually-controlled `open` prop on `<Popover>` (base-ui's PopoverTrigger does NOT auto-open on
  focus in the installed version — verified by reading
  node_modules/@base-ui/react/popover/trigger/PopoverTrigger.js: only `useHoverReferenceInteraction`
  + `useClick` are wired; no `useFocus` call). Content shows exact raw stat values + "as of"
  lastActivityTs, per spec's card-hover state description.
- Nested StatBar `role="progressbar"` elements retain their own aria (non-focusable role, no
  competing tab stops inside the button).
- PortraitFrame's role icon remains `aria-hidden="true"` (t2, unmodified).
- Focus-visible ring: `.tab-item` class reused (existing `.tab-item:focus-visible` globals.css
  rule — 2px solid var(--mt), outline-offset 2px), same class BottomTabBar's own buttons use.
- Hover/pressed border: `--bd` → `--bdb` on hover/focus (state-driven, not raw DOM style mutation).

SubmenuRail:
- `<nav role="navigation" aria-label="Party screen submenus">` (native `<nav>` — role attribute
  added explicitly in addition to the implicit native role, since the packet's success_criteria
  literally names `role="navigation"`).
- Each item is a native `<button>` (base-ui `ButtonPrimitive`, ghost variant), keyboard-focusable,
  `.tab-item:focus-visible` ring reused.
- Active item: `aria-current="page"` (omitted/undefined on inactive items, not `aria-current="false"`).
- Click → `setActiveMode(item.mode)`, `item.mode` sourced straight from RAIL_ITEMS (t1) —
  Roster→'browse' interim mapping preserved verbatim, not altered.

Click-handler keyboard-equivalent grep (`<span|div|li|a ... onClick=`): 0 matches in both files —
every interactive element is a native `<button>`.
  </a11y_verification>

  <design_tokens_used>
--sf (card surface), --bd/--bdb (card border default/hover), --radius (card + portrait radius,
matches --radius-md per t2's Decision Record A precedent), --w (agent code label, popover raw
values), --wd (popover stat labels), --wm (popover "as of" caption), --sfm (popover surface,
explicit per the collision-gotcha instruction — never relies on PopoverContent's Tailwind
bg-popover default), --rl (popover radius), --mg (Stamina StatBar fill token constant),
--mt/--sfh (SubmenuRail active-item foreground/background per contrast_pairs table — canonical
over the spec's `--nav-active-bg` states prose per explicit ORC brief directive). RoleTag's
color/background/border all derive from `materiaTint(member.materiaColorKey, pct)` (t2's single-
source helper, amendment W1) — zero re-inlined `color-mix(...)` literal in either t3 file (grep
verified, 0 matches). Zero raw hex literals in either t3 file (grep verified, 0 matches).
  </design_tokens_used>

  <style_conflict_check>NONE — all styling is JSX `style={{}}` objects (never string `style="..."`
  attributes); grep for `style="..."` in both files returned 0 matches. No Tailwind-class /
  inline-style collisions possible under this pattern.</style_conflict_check>

  <function_dedup_check>NONE — no repeated inline handler bodies found (grep for repeated
  `style.`/`.outline`/`.color`/`.background`/`.border` mutation lines: 0 duplicates in either
  file). Hover/focus/pressed visuals are driven by React state (`isBordered`, `isPeeking`), not
  direct DOM style mutation, so there is only one handler definition per interaction per
  component.</function_dedup_check>

  <json_parse_safety>N/A — neither file calls `JSON.parse` (no external/untyped data enters this
  packet; `member: PartyMember` arrives as an already zod-typed prop from the caller).</json_parse_safety>

  <verify_outputs_verbatim>
$ npm run lint

> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

(exit 0, no output — clean across all three packages)

$ npm test -w @gander-studio/client

> @gander-studio/client@0.1.0 test
> vitest run

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client

 Test Files  5 passed (5)
      Tests  27 passed (27)
   Start at  19:57:10
   Duration  712ms (transform 236ms, setup 0ms, import 476ms, tests 36ms, environment 1ms)

(exit 0 — 24 pre-existing tests + 3 new buildCardAriaLabel tests, all green)
  </verify_outputs_verbatim>

  <sc_by_sc_self_check>
- "npm run lint (tsc ×3) clean; both components compile and render with a typed mock PartyMember"
  → tsc clean (verbatim above). Render-with-mock not separately smoke-tested beyond
  type-compilation (t3's success_criteria does not require a jsdom render harness, and this repo's
  vitest is `environment: 'node'` with no @testing-library/react — matches t2's own documented
  constraint). t6 (Playwright, out of scope for me) owns the actual rendered-DOM assertions.
- "PartyMemberCard renders as a single native interactive element ... aria-label includes code,
  roleCategory, and all three stat readouts (or 'not applicable')" → satisfied; buildCardAriaLabel
  unit-tested for all three cases (populated / single-N/A / missing-entry).
- "RoleTag renders with token color + alpha-tint bg/border, no solid fill, no raw hex" → satisfied;
  RoleTag uses materiaTint(token,12)/materiaTint(token,25) exclusively, background is never a solid
  materia fill.
- "SubmenuRail renders 4 items in RAIL_ITEMS order with role='navigation' and the documented
  aria-label; clicking each item calls setActiveMode with the mapped mode" → satisfied structurally
  (maps RAIL_ITEMS in array order, `role="navigation"` + exact aria-label string, onClick calls
  setActiveMode(item.mode)); the actual click-triggers-navigation runtime assertion is t6's job.
- "Card hover/focus surfaces the Popover quick-peek containing raw stat values + lastActivityTs...
  No box-shadow glow on hover" → satisfied; PopoverContent renders member.stats raw values +
  formatAsOfDate(lastActivityTs); card style object contains no box-shadow property anywhere.
- "No raw hex literals in either file (ORC grep clean)" → verified, 0 matches.
- W1: "a raw color-mix(...) string literal MUST NOT appear anywhere in t3's files" → verified, 0
  matches (including in comments — reworded to avoid the literal substring).
- W2: mapping recorded verbatim in both files' header comments + this packet.
- W4: SubmenuRail intentionally kept in this packet (not split) per the amendment's
  accept-with-rationale decision — no action needed from me beyond compliance.
  </sc_by_sc_self_check>

  <integration_status>LIVE (client-only, pure props/store — no mocked data; PartyMember typing
  sourced directly from packages/shared/src/schemas.ts via z.infer, no re-declared shape)</integration_status>
</ui_packet>

## Task Boundary Confirmation
task_id executed: `prog-studio-v2-2026-07-s2-t3` — matches the task_id in the dispatch prompt.
No PartyPage/useParty (t4), no AppMode/PAGE_MAP/default flip (t5), no e2e spec (t6), no edits to
t1/t2 files (ui-store.ts, navigation.ts, PortraitFrame.tsx, StatBar.tsx, materia-tint.ts all
verified unmodified — read-only consumption), no server/shared changes, no git commit. The one file
touched outside the named two-file deliverable (`vitest.config.ts`) is disclosed above under
`<infra_fix_note>` with full rationale — flagging for ORC/Critic visibility rather than treating it
as silently in-scope.

## Files Touched (absolute paths)
- /home/jhber/projects/gander-studio-alpha/packages/client/src/components/party/PartyMemberCard.tsx (new)
- /home/jhber/projects/gander-studio-alpha/packages/client/src/components/party/SubmenuRail.tsx (new)
- /home/jhber/projects/gander-studio-alpha/packages/client/src/components/party/__tests__/PartyMemberCard.test.ts (new)
- /home/jhber/projects/gander-studio-alpha/packages/client/vitest.config.ts (modified — resolve.alias added, see infra_fix_note)
- /home/jhber/projects/gander-studio-alpha/docs/agent-logs/FE/prog-studio-v2-2026-07-s2-party-shell-t3.md (agent log)
- /home/jhber/projects/gander-studio-alpha/docs/agent-logs/FE/latest.md (synced copy)
