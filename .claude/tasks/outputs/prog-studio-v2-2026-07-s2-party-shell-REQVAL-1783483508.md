# Requirements Coverage Report — prog-studio-v2-2026-07-s2-party-shell

**RV#1** | Mode B (spawned subagent execution) | generated 2026-07-07
Sources (Step 1): sibling brief `docs/programs/prog-studio-v2-2026-07/sprints/prog-studio-v2-2026-07-s2-party-shell/orchestrator_brief.md` (5 sprint SCs, PRIMARY) + `program.md` §5 note 1 (envelope/diagnostics amendment) + PM plan `-PM-1783472965.md` + amendment `-amend-PM-1783474258.md` (W1–W5).
Evidence (Step 2): committed working tree (commits `7359da5`, `b9dffa9`, `82c2400`, `87dc529`, `2c23c7e`, `3a6a277`, `dbc4b87` — all deliverable paths clean in git status), 8 audit verdicts (t1/t2/t3/t3-rem/t4/t5-initial-FAIL/t5-reaudit/t6), 6 FE packets + 3 remediation packets.
Step 2.5 (runtime verification): the Tier-2 e2e suite is DOM-presence-asserting throughout (no side-effect-only proxies; W3 destination-surface DOM markers), green 19/19 on two independent runs — FE#9's authoring run (43.8s, exit 0) and AUD#8's independent headless re-run (41.6s, exit 0). Spec assertions are cited per-item below.

<requirements_coverage_report>
  <task_id>prog-studio-v2-2026-07-s2-party-shell</task_id>
  <generated>2026-07-07T00:00:00Z</generated>
  <overall_status>COVERED</overall_status>
  <requires_human_visual>true</requires_human_visual>

  <requirement_list>
    <requirement id="R-001" type="success_criterion">SC1 — Dev-server default route renders the party screen with s1 live data (integration_status LIVE by sprint close; MOCKED intermediates documented).</requirement>
    <requirement id="R-002" type="success_criterion">SC2 — Every rendered text pair is an AA-pass row of the spec's contrast_pairs; no clipped/overlapping text (legibility, screenshot-adjudicated + CLI Playwright).</requirement>
    <requirement id="R-003" type="success_criterion">SC3 — All spec states implemented: loading, empty, error (with Retry), default, hover/focus/active; popover quick-peek works.</requirement>
    <requirement id="R-004" type="success_criterion">SC4 — Rail navigates to the three KEEP surfaces; BottomTabBar untouched (s4 owns removal).</requirement>
    <requirement id="R-005" type="success_criterion">SC5 — npm run lint ×3 clean; client build passing; e2e green headless; human browser check at Step 4.5.</requirement>
    <requirement id="R-006" type="explicit">program.md §5 note 1 — s2 consumes the PartyStats ENVELOPE: `members` for cards, `diagnostics` for an unobtrusive data-quality affordance.</requirement>
    <requirement id="R-007" type="explicit">Brief Outputs — PartyPage + party-card / StatBar / portrait / submenu-rail components under packages/client/src/components/party/.</requirement>
    <requirement id="R-008" type="explicit">Brief Outputs — 'party' AppMode as DEFAULT route; PAGE_MAP entry; rail navigation constants; BottomTabBar remains — both nav surfaces coexist this sprint.</requirement>
    <requirement id="R-009" type="explicit">Brief Outputs — Selected-agent store contract (Zustand) for s3 click-through (s2-to-s3-nav-contract).</requirement>
    <requirement id="R-010" type="explicit">Brief Outputs — Card-hover Popover quick-peek (carry-in obligation from p11 AUD#4).</requirement>
    <requirement id="R-011" type="explicit">Brief Outputs — Playwright Tier-2 e2e: party renders live data, rail navigates to Sessions/Progression/Programs, popover on hover, a11y keyboard pass; FE owns the runtime gates via CLI Playwright.</requirement>
    <requirement id="R-012" type="constraint">Invariant — FF7 tokens canonical: no raw hex in color positions; contrast_pairs AA table canonical.</requirement>
    <requirement id="R-013" type="constraint">Invariant — AppMode∪PAGE_MAP compiler-exhaustive; Zod-inferred types only (no re-declared shapes).</requirement>
    <requirement id="R-014" type="constraint">Invariant — vitest (pure logic) + Playwright Tier 2 both present and green.</requirement>
    <requirement id="R-015" type="constraint">Seams — s2-to-s3-nav-contract and s2-to-s4-nav-shell owned and named explicitly in deliverables (rail self-contained/hoistable for the s4 lift).</requirement>
  </requirement_list>

  <coverage>
    <item id="R-001" status="COVERED">
      <requirement>SC1 — default route renders the party screen with s1 LIVE data</requirement>
      <evidence>Static: packages/client/src/store/ui-store.ts:21 (`activeMode: 'party'` initial; :31 partialize never persists activeMode); packages/client/src/components/ModeContent.tsx:17,30-31 (lazy PartyPage wired as PAGE_MAP.party); packages/client/src/hooks/useParty.ts:29 (`trpc.roster.getParty.useQuery()`, PartyStats envelope via @gander-studio/shared z.infer type). integration_status LIVE: t4 FE packet (-t4-FE-1783475922.md L104-120) — verify-then-implement confirmed server router (router.ts:788-793) + live curl against the running :3001 returned a real 13-member envelope BEFORE the hook was written. Runtime (Step 2.5, DOM-presence): tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts:110-136 (fresh load + localStorage.clear → "Party Screen" heading visible, 3≤cards≤6, ≥3 distinct real aria-label codes, 3 progressbars on first card) and :138-161 (per-card portrait/code/3-statbar composition). Green 19/19 twice (FE#9 + AUD#8 independent).</evidence>
    </item>

    <item id="R-002" status="COVERED">
      <requirement>SC2 — AA contrast_pairs pairings; no clipped/overlapping text</requirement>
      <evidence>Machine half: spec.ts:450-475 computed-style legibility spot-check (title resolves to rgb(255,255,255)=--w per contrast_pairs AAA row; RoleTag's materiaTint/color-mix output non-transparent AND distinguishable from its own background — guards both the color-mix-unsupported and the Shadcn/FF7 collision failure classes); spec.ts:482-510 no-horizontal-overflow + column-count assertions at BOTH 1280 and 390 (explicit page.setViewportSize per W3), grid-container-scoped; all colors token-only (audits t1–t5 ran the no-hex greps — e.g. t2 AUD hex-grep clean; SubmenuRail.tsx:21-24 documents the contrast_pairs-canonical active-item pairing --mt on --sfh 5.38:1 chosen OVER the states prose per the AUD#4 advisory). Screenshot evidence for adjudication delivered at both widths (test-results/party-shell-screenshots/desktop-1280.png + mobile-390.png), visually reviewed in the t6 packet. FINAL screenshot adjudication is the Step 4.5 human gate — flagged via requires_human_visual (this is the SC's own named verification method, not a delivery gap).</evidence>
    </item>

    <item id="R-003" status="COVERED">
      <requirement>SC3 — loading/empty/error(+Retry)/default + hover/focus/active states; popover quick-peek works</requirement>
      <evidence>Static: packages/client/src/pages/PartyPage.tsx:47-60 (pure mutually-exclusive state derivation), :224-233 (one-of-four render), :129-156 (6-skeleton loading reusing shimmer-box), :158-177 (empty role="status" + View Full Roster CTA), :179-188 (error reusing error-state + Retry→refetch); PartyMemberCard.tsx:119-145,161-168 (hover border --bd→--bdb no glow, focus/blur, click), 152-239 (controlled Popover quick-peek: raw stat values + "As of {lastActivityTs}", --sfm surface). Runtime (DOM-presence, route-interception for mocked states so live stays the default path): spec.ts:346-362 (loading: aria-busy grid, exactly 6 skeletons, resolves to live default), :364-399 (empty: role=status + heading + CTA click → browse-page testid), :401-419 (error: role=alert + "Couldn't load party data" + unroute + Retry → live cards), :168-193 (hover AND keyboard-focus popover with Activity/Stamina/Accuracy raw values + as-of date). Focus-state correctness hardened by t3-rem (commit 87dc529, AUD#6 PASS): initialFocus={false} + role="presentation" killed the focus-oscillation; regression-guarded at spec.ts:210-242 (3.2s sustained focus, zero blur events, deterministic Enter→browse).</evidence>
    </item>

    <item id="R-004" status="COVERED">
      <requirement>SC4 — rail navigates to the three KEEP surfaces; BottomTabBar untouched</requirement>
      <evidence>Static: constants/navigation.ts:29-36 (RAIL_ITEMS: Roster→browse interim-commented, Sessions, Progression, Programs — typed AppMode); NAV_ITEMS :10-20 byte-identical 9 items (untouched); SubmenuRail.tsx:31-58 (role="navigation" aria-label="Party screen submenus", RAIL_ITEMS-driven, active state --mt/--sfh + 2px left border). Runtime (W3-tightened destination DOM MARKERS, not activeMode proxies): spec.ts:278-311 — Sessions click → sessions-list-page testid; Progression click → "PROGRESSION LEDGER" heading; Programs click → .react-flow__pane/terminal-state marker; Roster interim → browse-page testid. No-regression: spec.ts:426-444 — tablist still renders exactly 9 tabs; BottomTabBar switching to Sessions and Programs still lands on their markers; render-loop console guard clean.</evidence>
    </item>

    <item id="R-005" status="COVERED">
      <requirement>SC5 — lint ×3 clean; client build passing; e2e green headless; human browser check at Step 4.5</requirement>
      <evidence>lint: AUD#7 (-t5-reaudit-AUD-1783482847.md L80) `npm run lint` (tsc --noEmit ×3) exit 0, independently re-run; also verbatim in the t6 FE packet. build: AUD#7 L68-79 — bundle gate CLEARED, entry chunk 756.80 kB (gzip 227.18) vs 1,035.70 kB at the original t5 FAIL — 243.2 kB under the 1000 kB hard gate, chunk table reproduced exactly (PartyPage/GraphPage/ProgramDagPage/ComposePage split to lazy chunks, ModeContent.tsx:17-28). e2e: 19 passed/0 failed headless, twice (FE#9 43.8s; AUD#8 independent 41.6s, exit 0), reproduce commands recorded in the t6 packet (server reuse w/ GANDER_ROOT + npx playwright test invocation). vitest: 37 passed/0 failed at AUD#7. The fourth conjunct — human browser check — is by construction a Step 4.5 close-out act sequenced AFTER this gate: the sprint is in the verified state that check requires, and requires_human_visual=true makes it BLOCKING before DONE (see human_acceptance_items).</evidence>
    </item>

    <item id="R-006" status="COVERED">
      <requirement>program.md §5 note 1 — envelope consumption: members for cards, diagnostics for a data-quality affordance</requirement>
      <evidence>useParty.ts:23-26 returns the full `{ members, diagnostics, activityAnchor }` PartyStats envelope (never a bare array); PartyPage.tsx:209-212,235-240 — unobtrusive xs/--wm footnote "data quality: {n} unparsed lines · {n} uncounted event types", rendered only when invalidLineCount>0 || uncountedEventTypes>0, non-modal, below the grid. Runtime: spec.ts:332-339 asserts the footnote visible against LIVE data (invalidLineCount=1, uncountedEventTypes=27 at write time; regex-matched so corpus drift can't break it).</evidence>
    </item>

    <item id="R-007" status="COVERED">
      <requirement>PartyPage + party components under components/party/</requirement>
      <evidence>Committed files: packages/client/src/components/party/{PortraitFrame.tsx, StatBar.tsx, materia-tint.ts (W1 single-source tint helper), PartyMemberCard.tsx (incl. RoleTag), SubmenuRail.tsx, __tests__/{StatBar.test.ts, PartyMemberCard.test.ts}} + packages/client/src/pages/PartyPage.tsx + packages/client/src/hooks/useParty.ts. Commits b9dffa9 (t2), 82c2400 (t3), 87dc529 (t3-rem), 2c23c7e (t4). W2 spec-primitive→substitute mapping (Card→PartyMemberCard, Badge→RoleTag, Progress→StatBar, Skeleton→shimmer-box, Alert→error-state) recorded verbatim in every party/ file + PartyPage, marked Critic-RATIFIED — pre-adjudicated ACCEPTABLE, not a fidelity deviation.</evidence>
    </item>

    <item id="R-008" status="COVERED">
      <requirement>'party' AppMode DEFAULT; PAGE_MAP entry; rail nav constants; both nav surfaces coexist</requirement>
      <evidence>ui-store.ts:4 ('party' first member of AppMode union), :21 (initial activeMode 'party'), :30-32 (partialize comment updated, still persists only muted); ModeContent.tsx:30-41 (PAGE_MAP Record&lt;AppMode,...&gt; with party key — compiler-exhaustive proof); navigation.ts:29-36 (RAIL_ITEMS) alongside untouched NAV_ITEMS (9 items) — coexistence asserted at runtime by spec.ts:426-444. Commits 7359da5 (t1) + 3a6a277 (t5 family). AUD#7 re-verified the atomic union+map landing and t1's fields intact after the second serialized writer.</evidence>
    </item>

    <item id="R-009" status="COVERED">
      <requirement>Selected-agent store contract (Zustand) for s3 click-through</requirement>
      <evidence>ui-store.ts:12-15,25-26 — `selectedAgentCode: string | null` (initial null) + `setSelectedAgentCode`, seam-named comment "s2-to-s3-nav-contract", ephemeral (excluded from partialize). Wired: PartyPage.tsx:197-203 — card onSelect → setSelectedAgentCode(code) + setActiveMode('browse') (INTERIM destination per ratified R-4; the store contract — the real s3 seam deliverable — is set correctly regardless). PartyMemberCard stays store-agnostic (onSelect prop, PartyMemberCard.tsx:41-44) per packet contract. Runtime consequence asserted: spec.ts:237-241 (Enter → browse-page marker visible).</evidence>
    </item>

    <item id="R-010" status="COVERED">
      <requirement>Card-hover Popover quick-peek (carry-in p11 AUD#4)</requirement>
      <evidence>PartyMemberCard.tsx:152-239 — reuses components/ui/popover.tsx; 300ms hover delay (documented constant matching base-ui's own OPEN_DELAY), immediate on keyboard focus; content = every stat's exact raw value + "As of {lastActivityTs}" on the --sfm surface; zero interactive children. Runtime: spec.ts:168-182 (hover → popover with Activity/Stamina/Accuracy raw values + as-of date) and :184-192 (keyboard focus → immediate). t3-rem (AUD#6 PASS) made the focus path deterministic — the carry-in closes VERIFIED, not just present.</evidence>
    </item>

    <item id="R-011" status="COVERED">
      <requirement>Playwright Tier-2 e2e — live render, rail nav, popover, a11y keyboard pass; FE-owned runtime gates</requirement>
      <evidence>packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts (19 tests, commit dbc4b87) — SC coverage map in the file header L14-22; a11y keyboard pass at :248-271 (Tab order rail₁..₄ → card₁ → card₂ directly, proving single tab stop per card) + :138-161 (zero nested interactive descendants; composite aria-label regex `{CODE}, {role}. Activity …, Stamina …, Accuracy ….`) + StatBar progressbar aria (StatBar.tsx:86-90 incl. the N/A variant omitting aria-valuenow, unit-tested 3/3 in StatBar.test.ts per t2 AUD). Green 19/19 twice; reproduce commands (server lifecycle + playwright + lint) recorded verbatim in the t6 packet. No side-effect-only assertions: the one side-effect probe (blur-count instrumentation, :219-234) is PAIRED with its DOM consequence per the Side-Effect-As-Proxy pairing rule.</evidence>
    </item>

    <item id="R-012" status="COVERED">
      <requirement>No raw hex; FF7 tokens canonical; contrast_pairs AA</requirement>
      <evidence>All color positions across the 9 delivered source files use var(--token), token-mapped classes, or materiaTint() (color-mix over tokens — single-sourced in materia-tint.ts:11-13 per W1; t3 files contain no re-inlined color-mix literal). Audits ran the no-hex greps (t2 AUD hex-grep 0 matches; t3/t4 AUD PASS on the same must_not_contain). Non-color px literals (6px radii) carry DESIGN.md provenance comments (StatBar.tsx:18-21, PartyMemberCard.tsx:29-32) — not color-position hex. No box-shadow glow anywhere (PortraitFrame.tsx:62 explicit; hover state is border-color only).</evidence>
    </item>

    <item id="R-013" status="COVERED">
      <requirement>AppMode∪PAGE_MAP compiler-exhaustive; Zod-inferred types only</requirement>
      <evidence>ModeContent.tsx:30 — `PAGE_MAP: Record&lt;AppMode, React.ComponentType&gt;` over the widened 10-member union; AUD#7 L52: "removing the 'party' key would not compile; tsc ×3 clean confirms exhaustiveness". Types: useParty.ts:1 imports PartyStats from @gander-studio/shared (z.infer of PartyStatsSchema — no re-declared local shape, per t4 must_not_contain, AUD#4-verified); PartyMemberCard.tsx:2 imports PartyMember/PartyStatBar the same way.</evidence>
    </item>

    <item id="R-014" status="COVERED">
      <requirement>vitest (pure logic) + Playwright Tier 2 both green</requirement>
      <evidence>components/party/__tests__/StatBar.test.ts — 3/3 green covering value→width/aria and null→"N/A — {reason}"/no-aria-valuenow/aria-label-carries-reason (t2 AUD L55-62, workspace 24 passed at AUD#2); __tests__/PartyMemberCard.test.ts added by t3 (workspace suite 37 passed/0 failed at AUD#7). Pure-logic extraction pattern (computeStatBarViewModel, derivePartyGridState, buildCardAriaLabel, formatScopeSummary) keeps the contracts node-env-testable. Tier-2 e2e per R-011.</evidence>
    </item>

    <item id="R-015" status="COVERED">
      <requirement>Seams s2-to-s3-nav-contract + s2-to-s4-nav-shell owned and named</requirement>
      <evidence>s2-to-s3 (store half): ui-store.ts:12-13 seam-named comment + the selectedAgentCode contract (R-009); s3's consumption path (card click sets code + navigates) live. s2-to-s4: navigation.ts:28 seam-named comment (RAIL_ITEMS constants half) + SubmenuRail built self-contained/hoistable (SubmenuRail.tsx reads only useUIStore + RAIL_ITEMS; page-local mount isolated to PartyPage.tsx:219-221 behind `hidden lg:flex` per ratified R-3, so s4's lift is a mount move, not a rewrite). Both seams named in the ui_packets per the brief's requirement.</evidence>
    </item>
  </coverage>

  <summary>
    <covered_count>15</covered_count>
    <partial_count>0</partial_count>
    <missing_count>0</missing_count>
  </summary>

  <human_acceptance_items>
    <!-- Amendment W5 — KNOWN, DECLARED interim limitations for the human to knowingly ACCEPT at
         Step 4.5. These are NOT coverage gaps: no s2 SC requires either behavior, both were
         Critic-ratified at plan time, and both have a named s4 owner. -->
    <item id="HA-1" source="W5 flag R-9">SubmenuRail collapse/expand DEFERRED to s4. The spec's 240px↔56px collapse interaction is not built; the rail renders at a single fixed 240px width (PartyPage.tsx:33-34, provenance-commented). s4 (the rail-hoist consumer) owns it.</item>
    <item id="HA-2" source="W5 flag R-5b">NO return-to-party nav affordance this sprint. Party IS the default route (reload returns to it), but BottomTabBar gains no party tab until s4 and the rail is page-local (unmounts on any rail click) — so there is no in-app control to return to the party home. The human must knowingly accept the reload-only return path for the s2 window; the fix (rail hoist + home affordance / party tab) is s4's job.</item>
    <item id="HA-3" source="Step 4.5 gate">HUMAN BROWSER VERIFICATION REQUIRED BEFORE DONE (requires_human_visual=true). Machine evidence covers DOM presence, computed-style spot-checks, overflow, and state reachability — it cannot adjudicate visual aesthetics, glanceability, or the FF7 feel, and SC2's own verification method names screenshot adjudication. Dual-width screenshots are staged at packages/client/test-results/party-shell-screenshots/{desktop-1280,mobile-390}.png; the live default route is one `npm run dev` away.</item>
  </human_acceptance_items>

  <notes>
    - Requirement basis: 15 items extracted (5 brief SCs + 1 program §5 note-1 amendment + 5 declared
      outputs + 4 binding invariants/seams) — well above the 3-item underspecification floor; the
      brief was well-specified.
    - ROUTED PRE-EXISTING DEFECT (not this sprint's gap) #1: at 390px the GLOBAL header/ModeContent
      overflow the document by ~16px (fixed 28px side padding in pre-existing Header.tsx/ModeContent
      shell chrome). Confirmed pre-existing and independent of anything t1–t6 built (t6 packet,
      mobile screenshot review); e2e correctly scopes SC2 overflow checks to the party surface.
      Routed to s4 (nav-shell/responsive scope).
    - ROUTED PRE-EXISTING DOC DRIFT #2: CLAUDE.md Known Issues still cites a "~700KB" main-bundle
      baseline. Reality: ~1,025 kB pre-split, 756.80 kB post-split (AUD#7 measured). Routed to s4
      docs scope (AUD#7 flagged, do-not-edit-inline).
    - AFTER-ACTION MATERIAL: FE#9's transient git-stash incident during the sprint was caught and
      fully reversed with zero loss — process note for the after-action, no deliverable impact.
    - PACKET-vs-SPEC DIVERGENCE (correct direction): the t6 FE packet predates the t3-rem fix — it
      documented the focus-oscillation defect via a test.fail() expected-failure annotation. The
      COMMITTED spec post-t3-rem is STRONGER: that test is now a hard-passing regression guard
      (3.2s sustained-focus, zero-blur, deterministic Enter; spec.ts:199-242). AUD#8 audited and
      independently re-ran the committed (stronger) spec, 19/19. No action needed; recorded so the
      divergence is not misread as drift.
    - MINOR DOCUMENTED CONSEQUENCE of ratified R-3 (page-local rail): no rail item ever shows
      aria-current="page" while mounted (activeMode==='party' matches no RAIL_ITEMS mode) —
      asserted as the correct current state at spec.ts:313-325; naturally resolves at the s4 hoist.
    - PUSH OPT-IN standing: per plan routing_notes, the human's "push this sprint" authorizes ORC's
      guarded feature-branch auto-push only AFTER this gate + Step 4.5; surfaced so it is not lost.
    - Audit trail: t1/t2/t3/t4 PASS; t3-rem PASS (AUD#6); t5 initial FAIL (bundle gate 1,035.70 kB)
      → rem1+rem2 → AUD#7 family re-audit PASS (756.80 kB); t6 PASS (AUD#8, independent 19/19 re-run).
  </notes>
</requirements_coverage_report>
