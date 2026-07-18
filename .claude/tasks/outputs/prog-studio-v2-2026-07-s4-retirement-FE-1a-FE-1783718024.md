# FE-1a ui_packet — prog-studio-v2-2026-07-s4-retirement-FE-1a

Task ID confirmed matches prompt: `prog-studio-v2-2026-07-s4-retirement-FE-1a`. Scope: hoist SubmenuRail into the global AppShell as the primary navigation (Wave 0a, additive-only). No consolidation with FE-1b was performed or considered necessary — the split boundary (hoist vs. retire+fold+migrate) was followed verbatim per the PM rev3 packet.

```xml
<ui_packet>
  <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1a</task_id>

  <components_created>
    <!-- No new components; this is a hoist of an existing component out of a page and into the global shell. -->
  </components_created>

  <components_modified>
    <item>packages/client/src/AppShell.tsx — imports and renders &lt;SubmenuRail/&gt; globally, wrapped in a new `.app-shell-rail` container. DOM order: Header, SubmenuRail-wrapper, ModeContent, BottomTabBar (load-bearing for FE-1b's locator work per packet instruction).</item>
    <item>packages/client/src/globals.css — `.app-shell` base grid unchanged (`"hd" "mn"`, mobile-first, 1-col). New `.app-shell-rail { display: none; }` rule (hidden below 640px, no rail column at base). New `@media (min-width: 640px)` block re-templates `.app-shell` to `grid-template-columns: 240px 1fr; grid-template-areas: "hd hd" "rl mn";` and sets `.app-shell-rail { display: block; grid-area: rl; ... }`. Reuses the existing 640px breakpoint value (globals.css:120's max-width:640px block) in the opposite (min-width) direction, per the packet's explicit instruction — no new breakpoint value introduced anywhere.</item>
    <item>packages/client/src/pages/PartyPage.tsx — removed the `SubmenuRail` import, removed the page-local `hidden lg:flex` rail-mount wrapper (was ~lines 222-224), removed the now-orphaned `RAIL_COLUMN_WIDTH_PX` constant (its sole consumer was the removed wrapper), reconciled the plan-R-3 comment block to state the rail is now globally hoisted by FE-1a. The former rail-adjacent content div is now the page's sole content child (unwrapped from the removed `flex gap-6` row).</item>
    <item>packages/client/src/components/party/SubmenuRail.tsx — `aria-label` changed from "Party screen submenus" to "Main navigation" (line 31); `role="navigation"` unchanged.</item>
  </components_modified>

  <grid_retemplate_summary>
Base (mobile-first, &lt;640px): `.app-shell` stays `display:grid; grid-template-columns:1fr; grid-template-rows:auto 1fr; grid-template-areas:"hd" "mn";` — UNCHANGED from pre-FE-1a. `.app-shell-rail` is `display:none` at base, so the rail is not visible/laid-out below 640px this packet (BottomTabBar remains the sole visible nav at that width — the &lt;640px fold that would make the rail's 4 items reachable via a mobile-form is explicitly deferred to FE-1b; this packet does not implement it, matching out_of_scope item 4 of the FE-1a packet).
≥640px (new `@media (min-width: 640px)` block): `.app-shell` becomes `grid-template-columns: 240px 1fr; grid-template-areas: "hd hd" "rl mn";` — Header now spans both columns (full-width top bar, its inline `gridArea:'hd'` is unchanged, just now matches a 2-cell area name), the rail occupies the new `rl` area (left column, 240px, DESIGN.md "Collapsible sidebar" open-width, no collapse/expand behavior — fixed width per packet instruction), and ModeContent keeps its inline `gridArea:'mn'` unchanged, now in the right column. `.app-shell-rail` becomes `display:block; grid-area:rl;` with `overflow-y:auto`, `padding:24px 12px`, `background:var(--sf)`, `border-right:1px solid var(--bd)`. BottomTabBar remains `position:fixed` (outside grid flow, per packet note) at all widths — unaffected by this grid change.
  </grid_retemplate_summary>

  <state_hydration_map>
No new state. SubmenuRail continues to read `activeMode`/`setActiveMode` from the existing `useUIStore` Zustand store (contract unchanged) — the only change is where it is mounted in the component tree (AppShell, global) rather than where it reads state from. No BE data flows into this change; it is a pure client-side layout/nav-shell hoist.
  </state_hydration_map>

  <a11y_verification>
    <item>SubmenuRail: `role="navigation"` retained; `aria-label` corrected from "Party screen submenus" (a stale page-scoped label, inaccurate now that the rail is global) to "Main navigation" — accurately describes its new global role.</item>
    <item>Keyboard reachability: no new interactive elements were introduced. Each rail item remains a real Shadcn `&lt;Button&gt;` (already keyboard-focusable, native `button` semantics, `aria-current="page"` on the active item) — unaffected by the hoist. The rail's position in the DOM moved (page-local → AppShell-global) but its internal markup/keyboard model is byte-identical except the one aria-label string.</item>
    <item>Interim accepted duplicate (documented, NOT fixed this packet per packet instruction): at ≥640px both the hoisted SubmenuRail (`role="navigation"`, `aria-label="Main navigation"`) and the still-present BottomTabBar (`role="tablist"`, `aria-label="Main navigation"`) carry the identical accessible name simultaneously. This is the explicitly accepted transient state the packet calls out ("both the hoisted rail and the still-present BottomTabBar carry 'Main navigation' at ≥640px"); FE-1b resolves it by folding BottomTabBar to a &lt;640px-only form, making the two mutually exclusive per viewport.</item>
    <item>No zero-nav state at any width: below 640px only BottomTabBar (role=tablist, 9 tabs, NAV_ITEMS) is visible; at/above 640px both BottomTabBar and the rail are visible. Nav is never absent.</item>
  </a11y_verification>

  <design_tokens_used>
    <item>--sf (rail surface background, `.app-shell-rail` at ≥640px) — cited spec token line 247 ("Card / SubmenuRail surface" token) in v2-design-spec.md; already defined in globals.css `:root` (`#0d1a18`).</item>
    <item>--bd (rail's right border) — pre-existing token, already used elsewhere in the codebase (e.g. PartyPage's skeleton card border).</item>
    <item>No new tokens introduced. No raw hex values written anywhere in the diff (constant-audit grep confirmed 0 matches in the new CSS block and all touched .tsx files).</item>
  </design_tokens_used>

  <style_conflict_check>NONE — grepped all touched files for string-form `style="..."` attributes overlapping a Tailwind class on the same element; zero matches. All inline styling in the touched files uses JSX `style={{...}}` object syntax (React inline-style objects), and no touched element carries both a conflicting Tailwind utility class and a JS style object for the same CSS property.</style_conflict_check>

  <click_handler_keyboard_audit>NONE — grepped touched .tsx files for `&lt;(span|div|li|a)[^&gt;]*onClick=`; zero matches. No new interactive elements were introduced by this hoist (SubmenuRail's existing `&lt;Button&gt;`-based items are unchanged markup, already keyboard-native).</click_handler_keyboard_audit>

  <json_parse_audit>NONE — grepped touched files for `JSON.parse`; zero matches. This packet touches no external-data parsing paths.</json_parse_audit>

  <rail_global_verification>
Non-Playwright verification, per this dispatch's explicit ORC instruction ("Do NOT run the e2e suite... a quick manual sanity check via curl that the dev server still serves is fine but not required"). Two independent proofs, both from a real production build (`npm run build -w @gander-studio/client`, vite v6.4.1, 2510 modules transformed, exit 0):
    <proof kind="build-artifact-grep">
`grep -l "Main navigation" packages/client/dist/assets/*.js` → matches only `index-B_vSSe1V.js`, the app's MAIN EAGER entry chunk (contains AppShell/Header/BottomTabBar — everything not behind `React.lazy`). The string "Main navigation" appears TWICE in that chunk (once from the now-global SubmenuRail, once from BottomTabBar's pre-existing label). It appears ZERO times in `PartyPage-v_ARC0u4.js` (PartyPage's own lazy-loaded chunk) — proving the rail's aria-label string is no longer bundled with the party page specifically; it now ships with the shell that is present on every route (Sessions, Progression, Programs, etc. all load the same eager `index-B_vSSe1V.js` entry chunk that now contains the rail). `grep -rl "Party screen submenus" packages/client/dist/` → zero matches anywhere in the built output.
    </proof>
    <proof kind="static-code-proof">
`AppShell.tsx` renders `&lt;SubmenuRail/&gt;` as an unconditional sibling of `&lt;ModeContent/&gt;` (which is the ONLY component gated on `activeMode`/`PAGE_MAP`) — the rail's mount is not inside any per-mode branch, so by construction it renders identically regardless of which surface (`party`, `sessions`, `progression`, `programs`, `agent-detail`, etc.) is active. Its only conditional is the CSS `.app-shell-rail` display rule (viewport-width-gated, not route-gated).
    </proof>
    <dev_server_sanity_check>`curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/` → 200 (dev server, already running from an earlier session, still serves the app after the edit — confirms no dev-server-breaking syntax error).</dev_server_sanity_check>
  </rail_global_verification>

  <hoist_caused_red_classification_handoff>
No `npx playwright test` RUN was performed this packet (explicit ORC override for this dispatch — see rail_global_verification above; FE-1a's gate is lint×3 + build + rail-globally-present per this turn's instructions, not full e2e). Consequently NO classification-by-actual-RUN is available to hand to FE-1b from this packet's own execution. Static prediction, for FE-1b's convenience (NOT a substitute for FE-1b running its own `npx playwright test` against post-FE-1a HEAD, which FE-1b's packet already requires as its baseline-comparison step):
    <likely-hoist-caused-red>layout-sidebar-removal.spec.ts — likely breaks on any grid-single-column-at-desktop or tablist-only-at-1200px assertion, since the ≥640px grid now has a rail column and the rail is a second `role="navigation"` landmark alongside the `role="tablist"` BottomTabBar.</likely-hoist-caused-red>
    <likely-hoist-caused-red>gander-studio-p1-fe-shell.spec.ts — likely breaks on any assertion that the rail is PartyPage-scoped/absent-on-non-party-surfaces, since it is now present everywhere.</likely-hoist-caused-red>
    <likely-hoist-caused-red>prog-studio-v2-2026-07-s2-party-shell.spec.ts — likely breaks on its shared rail-nav-name helper (was "Party screen submenus", now "Main navigation") and/or its "9 tabs" viewport-count assertion if it runs at ≥640px where both nav surfaces are now present.</likely-hoist-caused-red>
This list is a prediction from static code inspection, explicitly named in the PM packet's own §"Hoist-caused (from FE-1a)" floor list — FE-1b's packet already names these three specs and owns confirming/classifying them against a real RUN. FE-1a is NOT asserting these are the complete or confirmed set; FE-1b's own `npx playwright test` RUN at post-FE-1a HEAD is the source of truth.
  </hoist_caused_red_classification_handoff>

  <lint_evidence>
`npm run lint` (workspace root, runs `tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json`) — exit 0, zero output (clean, no errors across all 3 packages).
  </lint_evidence>

  <build_evidence>
`npm run build -w @gander-studio/client` (`tsc && vite build`) — succeeded. Output tail:
```
vite v6.4.1 building for production...
transforming...
✓ 2510 modules transformed.
rendering chunks...
computing gzip size...
dist/assets/index-B_vSSe1V.js  758.49 kB │ gzip: 227.66 kB
✓ built in 1m 21s
PWA v1.2.0
mode      generateSW
precache  18 entries (1090.58 KiB)
files generated
  dist/sw.js
  dist/workbox-7a79b53c.js
```
Standalone re-confirm (`cd packages/client && npx tsc`) — exit 0, zero errors.
  </build_evidence>

  <out_of_scope_confirmation>
`git diff --stat` on the following files (all packet-protected) shows ZERO diff, confirmed untouched:
    <item>packages/client/src/constants/navigation.ts (NAV_ITEMS unmodified, still present)</item>
    <item>packages/client/src/components/BottomTabBar.tsx (untouched, still renders the 9-tab NAV_ITEMS fallback nav)</item>
    <item>packages/client/src/store/ui-store.ts (AppMode union untouched)</item>
    <item>packages/client/src/components/ModeContent.tsx (PAGE_MAP untouched)</item>
    <item>packages/client/tests/ and packages/client/src/tests/ (no e2e spec file touched — zero diff on both directories)</item>
No collapse/expand implemented (rail renders at fixed 240px, no new interaction). No new breakpoint value introduced (reused 640px). No git commit/add/stash performed.
  </out_of_scope_confirmation>

  <integration_status>SUCCESS — pure client-side layout/nav-shell hoist, no BE dependency, no mocked data. Lint ×3 clean, build green, rail-globally-present proven via build-artifact grep + static-code proof, all out-of-scope files confirmed zero-diff.</integration_status>
</ui_packet>
```

## Files touched (absolute paths)
- `/home/jhber/projects/gander-studio-alpha/packages/client/src/AppShell.tsx`
- `/home/jhber/projects/gander-studio-alpha/packages/client/src/globals.css`
- `/home/jhber/projects/gander-studio-alpha/packages/client/src/pages/PartyPage.tsx`
- `/home/jhber/projects/gander-studio-alpha/packages/client/src/components/party/SubmenuRail.tsx`

## Agent log
- `/home/jhber/projects/gander-studio-alpha/docs/agent-logs/FE/prog-studio-v2-2026-07-s4-retirement-FE-1a.md` (Stage 1/2/3 complete)
- `/home/jhber/projects/gander-studio-alpha/docs/agent-logs/FE/latest.md` (synced)
