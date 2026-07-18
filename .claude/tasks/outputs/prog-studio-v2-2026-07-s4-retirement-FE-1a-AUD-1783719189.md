# AUDIT VERDICT — prog-studio-v2-2026-07-s4-retirement-FE-1a

**Auditor:** AUD#1 (parent ORC#0) · independent from FE#1 (implementer).
**Verdict:** PASS — SA=PASS, QA=PASS, SX=SECURE. The serial s4-retirement chain is UNBLOCKED; FE-1b may dispatch.

## Envelope-selection note (why legacy three-block, not the v2.0 typed wrapper)
This task_id's first SPAWN is 2026-07-10 (post the 2026-05-28 cutover). The deterministic envelope
rule would normally select the v2.0 `<audit_verdict schema_version="2.0">` wrapper. It is NOT emitted
here because the v2.0 apparatus is not deployed in gander-studio-alpha: this project's
`.claude/skills/audit-pipeline/SKILL.md` is the pre-cutover legacy version and contains NO
`## Output Schema (v2.0)` section (read this turn — absent), and there are no v2.0 substrate-checkers
(commit-packet substrate-check / requirements-validate) in this project that would consume/refuse the
typed wrapper. Emitting `<provenance_marker>audit-pipeline@2.0.0</provenance_marker>` would assert a
version/contract not present in this repo (a false provenance claim). The local ORC pipeline consumes
the legacy three-block format, which the dispatch prompt also requests. This is product-FE work
(studio app source), NOT a `.claude/agents|skills|rules` meta-agent edit, so the Meta-Agent
Independence Rule does not trigger INDETERMINATE. If studio-alpha adopts the v2.0 schema, re-emit.

## Auditor spawn attestation (narrative)
- agent_id: AUD#1
- parent: ORC#0
- independent_from: FE#1

---

<audit_review>
  <target_file>packages/client/src/AppShell.tsx, packages/client/src/globals.css, packages/client/src/pages/PartyPage.tsx, packages/client/src/components/party/SubmenuRail.tsx</target_file>
  <status>PASS</status>
  <violations>
    <!-- No standards violations. Evidence below. -->
    <!--
      SCOPE: `git diff --name-only -- packages/client/src/` returns EXACTLY the 4 enumerated files;
             nothing else touched. Out-of-scope files confirmed zero-diff:
             constants/navigation.ts (NAV_ITEMS intact), components/BottomTabBar.tsx (untouched),
             store/ui-store.ts (AppMode union untouched), components/ModeContent.tsx (PAGE_MAP untouched),
             packages/client/tests + packages/client/src/tests (no e2e spec touched).
      TOKENS: FF7 discipline held — added CSS uses var(--sf), var(--bd); SubmenuRail active styling
             uses var(--mt)/var(--sfh)/var(--wm). Raw-hex scan of added lines = 0 matches. No new tokens.
      GRID:  `.app-shell` base grid unchanged ("hd"/"mn", 1-col mobile-first). ≥640px @media block
             re-templates to columns `240px 1fr` / areas `"hd hd" "rl mn"`, reusing the EXISTING 640px
             breakpoint (no new breakpoint value). Header gridArea:'hd' + ModeContent gridArea:'mn'
             preserved; rail wrapper gets grid-area:rl. All area names resolve; BottomTabBar is
             position:fixed (outside grid flow) — grid change does not disturb it.
      TS/CONV: no `any` introduced; no new types needed (pure JSX/CSS hoist). Orphaned
             RAIL_COLUMN_WIDTH_PX constant correctly removed with its sole consumer. Stale plan-R-3
             comment reconciled to reflect the global hoist. aria-label "Party screen submenus" →
             "Main navigation" (grep for old label = 0 matches). Mount order Header→SubmenuRail→
             ModeContent→BottomTabBar matches the packet's load-bearing DOM-order requirement.
      A11Y:  role="navigation" retained; rail items remain native <Button> (keyboard-focusable),
             aria-current="page" on active. No non-button onClick introduced.
    -->
  </violations>
</audit_review>

<test_report>
  <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1a</task_id>
  <status>PASS</status>
  <test_coverage>lint (tsc x3) PASS; production build PASS; live-render smoke PASS. e2e suite intentionally EXCLUDED from this packet's gate per the FE-1a/FE-1b split (hoist-caused reds are FE-1b's classification duty) — not failed on.</test_coverage>
  <playwright>
    <tier>1</tier>
    <tests_run>1</tests_run>
    <passed>1</passed>
    <failed>0</failed>
    <playwright_output>Navigated http://localhost:5173/?nocache=47 (dev server already running) → 200, title "GANDER STUDIO". Snapshot at desktop width (default ≥640px viewport) confirms BOTH nav landmarks present: navigation "Main navigation" (hoisted SubmenuRail: Roster/Sessions/Progression/Programs, 4 items) rendered OUTSIDE &lt;main&gt; as a global sibling of ModeContent; AND tablist "Main navigation" (BottomTabBar, 9 tabs — fallback intact). DOM order banner→navigation→main→tablist matches required mount order. Console: 1 error = favicon.ico 404 only (benign missing static asset, pre-existing, NOT a JS runtime error / Uncaught / unhandled rejection) — not a QA FAIL.</playwright_output>
  </playwright>
  <defects>
    <!-- No blocking or minor defects. -->
    <!--
      SELF-RUN GATES (never trusted claimed exit codes):
        `npm run lint` (tsc shared→server→client) → EXIT 0, clean.
        `npm run build -w @gander-studio/client` → 2510 modules transformed, built in 53.11s.
          Largest chunk index-B_vSSe1V.js = 758.49 kB — UNDER the 1000 kB bundle gate. This is the
          pre-existing React+tRPC+Zustand main bundle already tracked in CLAUDE.md Known Issues.
      LIVE-RENDER / NON-PARTY-SURFACE reasoning: activeMode is NOT persisted (ui-store partialize
        persists only `muted`; resets to 'party' on hydrate) and the MCP Playwright set is READ-ONLY
        (cannot click to switch to Sessions). The gate's intent — prove the rail is NOT party-scoped —
        is nonetheless satisfied structurally: the rail is rendered unconditionally in AppShell as a
        sibling of ModeContent (the ONLY mode-gated element), so it renders identically on every
        surface by construction; the live snapshot confirms it sits outside &lt;main&gt;. This is a
        structural invariant already visible on the default surface, NOT genuinely interaction-gated
        behavior, so no §2.3(b) hand-back / INDETERMINATE is warranted.
      Accepted transient duplicate-nav (both landmarks carry "Main navigation" at ≥640px) is the
        DOCUMENTED interim state resolved by FE-1b — not a defect this packet.
    -->
  </defects>
</test_report>

<security_audit>
  <status>SECURE</status>
  <threat_level>LOW</threat_level>
  <findings>
    <!-- No vulnerabilities. Pure client-side layout/nav-shell hoist. -->
    <!--
      Added-line scans (all 0 matches): dangerouslySetInnerHTML; <input>/<form>/eval()/fetch()/
      innerHTML/new Function/localStorage./document.cookie; http(s) URLs / api-key / secret / token /
      password. No new interactive handlers or data-flow: SubmenuRail continues to read
      activeMode/setActiveMode from the existing Zustand store (contract unchanged); only its mount
      location and one aria-label string changed. No BE data path touched, no network surface added.
    -->
  </findings>
</security_audit>

---
**Remediation required:** NONE. All gates green. FE-1b is cleared to dispatch.
