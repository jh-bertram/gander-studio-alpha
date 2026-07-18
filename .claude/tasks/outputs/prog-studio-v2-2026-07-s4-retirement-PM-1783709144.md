# PM Task Decomposition — prog-studio-v2-2026-07-s4-retirement

Terminal (tier-3) sprint of program prog-studio-v2-2026-07. FE+docs retirement: cut Compose/Export/Planning, remove absorbed Browse/Graph/Edit, remove the 9-tab BottomTabBar (SubmenuRail becomes sole nav), prune dead stores/components/routes + orphaned server procedures, update CLAUDE.md + DESIGN.md to v2 reality.

Adjacent artifacts: `sc-precheck-report.json` (this dir), PM log `docs/agent-logs/PM/prog-studio-v2-2026-07-s4-retirement.md`.

---

## Disk-verified ground facts (same-sprint citations, mechanical rule 1)

All enumerations below carry a 2026-07-10 disk citation — none are inherited-fact pointers:

- **AppMode union members** (derived from `ModeContent.tsx` PAGE_MAP + `navigation.ts` NAV_ITEMS, read 2026-07-10): `party | browse | compose | edit | export | sessions | graph | progression | planning | programs | agent-detail` (11). v2 KEEP set = `party, agent-detail, sessions, progression, programs` (5). REMOVE set = `browse, compose, edit, export, graph, planning` (6).
- **Pages on disk** (`packages/client/src/pages/*`, glob 2026-07-10): ComposePage, GraphPage, BrowsePage, ProgramDagPage, EditPage, PlanningPage, ExportPage, ProgressionPage, PartyPage, AgentDetailPage. Sessions pages live under `pages/sessions/` (ModeContent imports `SessionsRouter`).
- **Stores** (`packages/client/src/store/*`, glob 2026-07-10): browse-store, edit-store, analyzeStore, canvas-store, session-store, compose-store, ui-store. (CLAUDE.md's "session-picker" store name is STALE — no such file; a DOCS-1 correction.)
- **BottomTabBar** = `components/BottomTabBar.tsx`, renders `NAV_ITEMS` (9 entries) from `navigation.ts`. **SubmenuRail** = `components/party/SubmenuRail.tsx`, renders `RAIL_ITEMS` (Roster→party / Sessions / Progression / Programs, 4 entries). The s2-to-s4-nav-shell seam artifact.
- **PartyPage compile-break marker** (grep 2026-07-10): `TODO(s4-cut)` at PartyPage.tsx:205-209; `handleViewRoster()` calls `setActiveMode('browse')`; wired to `EmptyPartyState onViewRoster` (line 229) and the "View Full Roster" button (label line 173). When `'browse'` leaves the union this is a hard compile error.
- **s3 absorption proof**: `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` re-ran green 8/8 TODAY (p12 audit `.claude/tasks/outputs/gander-studio-p12-detail-statbox-grid-AUD-1783707678.md`). Seam s3-to-s4-absorption-proof precondition HOLDS.
- **AgentDetailPage** amended TODAY (commit 6aa859c, gander-studio-p12): 4 detail panels now in `grid grid-cols-1 gap-4 md:grid-cols-2`. Any packet touching it works from CURRENT HEAD.
- **No `INTERIM(` tags exist on disk** (grep of `tests/e2e`, 2026-07-10) — mechanical rule 2 is satisfied by explicit enumeration below, not by tag search.
- **Server tRPC consumer map** (grep `packages/client/src`, 2026-07-10):
  - `trpc.export.spawn` → ONLY `ExportPage.tsx` (CUT).
  - `trpc.loadout.list/save/delete` → ONLY `ComposePage.tsx` (CUT).
  - `trpc.planning.list` → ONLY `PlanningPage.tsx` (CUT).
  - `trpc.connectivity.getGraph` → ONLY `GraphPage.tsx` (ABSORB-delete). No v2 consumer — the drill-down relationship layer uses `roster.getAgentDetail` edges (seam s1-to-s3), not this procedure.
  - `trpc.agent.get/save` + `trpc.skill.get/save` → `components/detail/ReviseSpecAction.tsx` (v2 KEEP, spec-revision drill-down) AND `EditPage.tsx` (ABSORB-delete). **Retained** (live v2 consumer).
  - `trpc.agent.list/skill.list/hook.list` → `hooks/useBrowseData.ts` (Browse-delete), `ComposePage.tsx` (CUT), `EditPage.tsx` (Edit-delete). Lose all client consumers, but shared parsers stay (agent.get + roster).

---

## Server-procedure decision (brief output #3 — PM decides, Critic-gated)

**DECISION: DEPRECATE-BY-REMOVAL server-side.** Rationale (for the Critic gate): a retirement sprint whose SC#4 demands the procedure table "reflect v2 reality; stale references pruned" cannot leave dead endpoints documented or dormant; base-plan portability + the human's declutter mandate favor removal over retain-dormant.

- **REMOVE (BE-1):** `export.spawn`, `loadout.list/save/delete`, `planning.list`, `connectivity.getGraph` — each tied 1:1 to a CUT/absorbed surface with ZERO v2 consumer (disk-verified above). Remove each procedure plus its EXCLUSIVELY-used schema/parser/helper, gated by a pre-removal dead-reference + coupling scan.
- **RETAIN:** `agent.get/save`, `skill.get/save` (live: ReviseSpecAction); all `session.*`, `progression.getLedger`, `program.getDag`, `roster.getParty/getAgentDetail`; and the shared parsers `parseAllAgents/Skills/Hooks` + connectivity parser wherever a retained procedure still imports them.
- **RETAIN (flagged sub-decision):** `agent.list`, `skill.list`, `hook.list` — orphaned of client consumers after FE-2/FE-4, but their parsers are retained anyway and the DEFERRED "13-role full-roster catalog" feature (see below) is the natural future re-consumer. Removing them is near-zero declutter value with churn; recommend RETAIN. **Critic: confirm retain-vs-remove.**
- **OUT OF SCOPE (BE-1):** env-var removal. `LOADOUTS_DIR` still backs the `SESSIONS_EDITS_DIR` default (per CLAUDE.md env table); `EXPORT_BASE_DIR` becomes unused but removing it risks env validation. Retain env.ts; DOCS-1 notes EXPORT_BASE_DIR as deprecated-unused.

Net procedure set after BE-1: 24 → 18 (health, agent×3, skill×3, hook.list, session×6, progression.getLedger, program.getDag, roster×2 across 8 routers). DOCS-1 DERIVES the count from post-BE-1 `router.ts`, never hardcodes.

---

<task_decomposition task_id="prog-studio-v2-2026-07-s4-retirement" agent_count="6">
  <task_packets>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
NAV-SHELL CUTOVER (Wave 0). Remove the 9-tab BottomTabBar so the v2 SubmenuRail is the SOLE nav surface. Steps:
1. PRECONDITION (seam s2-to-s4-nav-shell): open `components/party/SubmenuRail.tsx` and confirm RAIL_ITEMS covers Roster(→party)/Sessions/Progression/Programs and that AppShell renders SubmenuRail. If the rail does NOT already cover all four KEEP routes, emit BLOCKED — do not delete BottomTabBar.
2. Delete `components/BottomTabBar.tsx`.
3. In `constants/navigation.ts`: grep for every importer of `NAV_ITEMS` first (confirm BottomTabBar is the sole importer); then remove the `NAV_ITEMS` array + `NavItemDef` interface + now-unused lucide imports. RETAIN `RAIL_ITEMS` + `RailItemDef` unchanged.
4. In `AppShell.tsx`: remove the BottomTabBar import + its render site; verify SubmenuRail remains the nav and the grid/layout still composes (build the client and eyeball no layout regression in the packet notes).
5. e2e (mechanical rule 2): the BottomTabBar removal legitimately falsifies any assertion that the 9-tab bar / its tabs exist. Grep `tests/e2e` for `BottomTabBar`, `role="tablist"`, `role="tab"`, tab labels ('Browse','Compose','Export','Graph','Planning'), and 9-tab counts. In `gander-studio-p1-fe-shell.spec.ts`, `layout-sidebar-removal.spec.ts`, and `prog-studio-v2-2026-07-s2-party-shell.spec.ts` UPDATE (do not delete) those assertions to the SubmenuRail reality. Any spec whose ENTIRE purpose is the 9-tab bar is deleted; a spec that also covers KEEP nav is updated.
DESIGN.md is present at repo root — no new visual tokens are introduced (removal only); `design_system_source: DESIGN_MD`.
      </description>
      <success_criteria>
- `components/BottomTabBar.tsx` deleted; `grep -rn "BottomTabBar" packages/client/src` returns nothing.
- `NAV_ITEMS` removed from navigation.ts; `grep -rn "NAV_ITEMS" packages/client/src` returns nothing; `RAIL_ITEMS` unchanged (byte-identical to HEAD except no incidental edits).
- SubmenuRail is the only nav surface; all 4 KEEP routes (party/sessions/progression/programs) reachable via the rail in a running dev build (state in packet notes).
- `npm run lint` (tsc ×3) clean; `npm run build -w @gander-studio/client` passing.
- Playwright suite green after this wave: surface-only 9-tab specs removed, KEEP-nav specs updated to rail; NO red spec left for a later packet.
      </success_criteria>
      <context_files>
packages/client/src/components/BottomTabBar.tsx
packages/client/src/constants/navigation.ts
packages/client/src/AppShell.tsx
packages/client/src/components/party/SubmenuRail.tsx
packages/client/tests/e2e/gander-studio-p1-fe-shell.spec.ts
packages/client/tests/e2e/layout-sidebar-removal.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts
DESIGN.md
      </context_files>
      <dependencies>none (first wave)</dependencies>
      <out_of_scope>
- Do NOT touch the AppMode union (ui-store.ts) or PAGE_MAP (ModeContent.tsx) — surface deletions are FE-2/3/4. The 6 cut surfaces remain compilable-but-nav-unreachable after this wave; that is the intended interim state.
- Do NOT remove or edit FF7 tokens in globals.css (program invariant: tokens canonical). NAV_ITEMS dotColor tokens (--my/--mg/--mb/--mr…) stay in globals.css.
- Do NOT delete `prog-studio-v2-2026-07-s3-drilldowns.spec.ts` or s2 party-card/quick-peek assertions — only nav-shell assertions.
- Do NOT modify SubmenuRail behavior (no rail collapse/expand — that inheritance is DEFERRED this sprint).
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave; a handful of spec-assertion edits)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>confirmation SubmenuRail covers all 4 KEEP routes (seam precondition)</item>
          <item>list of e2e specs deleted vs updated with the falsified-assertion each update addresses</item>
          <item>lint ×3 + client build result</item>
        </must_contain>
        <must_not_contain>
          <item>any edit to ui-store.ts AppMode union or ModeContent.tsx PAGE_MAP</item>
          <item>removed globals.css tokens</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, `grep BottomTabBar` + `grep NAV_ITEMS` empty, Playwright green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
CUT-SURFACE DELETION (Wave 1) — COMPOSE (the heaviest single surface: page + materia-canvas subtree + 2 stores + 5 e2e specs). This is one logical deletion unit bounded by the Compose surface. Steps:
1. Delete `pages/ComposePage.tsx`.
2. Delete stores `store/compose-store.ts` and `store/canvas-store.ts` — but FIRST grep every importer of each; if any retained surface (party/agent-detail/sessions/progression/programs) imports them, emit BLOCKED and report. (Expected: only Compose imports them.)
3. Delete Compose-only components (the materia-canvas node/edge/orb components). Grep each candidate component's importers; delete only those with zero retained-surface importer. Enumerate every file deleted in the packet.
4. AppMode↔PAGE_MAP (compiler-exhaustive invariant): remove `'compose'` from the AppMode union in `store/ui-store.ts`; the compiler will flag the stale PAGE_MAP entry — remove the `compose:` line + the `ComposePage` React.lazy import from `components/ModeContent.tsx`.
5. e2e: delete the Compose-surface specs WITH the surface: `gander-studio-p1-compose-fe.spec.ts`, `gander-studio-p2-canvas-link-003a.spec.ts`, `materia-canvas-proximity.spec.ts`, `card-node-title-edit.spec.ts`, `loadout-list-panel.spec.ts`. Confirm each targets Compose/loadout-canvas before deleting (grep its describe/title).
Client-side references to `trpc.loadout.*` (list/save/delete) vanish with ComposePage — this un-blocks BE-1's server removal.
      </description>
      <success_criteria>
- ComposePage, compose-store, canvas-store, and all Compose-only components deleted; `grep -rn "ComposePage\|compose-store\|canvas-store\|useComposeStore\|useCanvasStore" packages/client/src` returns nothing.
- `'compose'` removed from AppMode union; PAGE_MAP has no `compose` entry; no `trpc.loadout.` reference remains in client src.
- The 5 named Compose e2e specs deleted; no other spec references Compose.
- `npm run lint` (tsc ×3) clean; `npm run build -w @gander-studio/client` passing; Playwright green.
      </success_criteria>
      <context_files>
packages/client/src/pages/ComposePage.tsx
packages/client/src/store/compose-store.ts
packages/client/src/store/canvas-store.ts
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/tests/e2e/gander-studio-p1-compose-fe.spec.ts
packages/client/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts
packages/client/tests/e2e/materia-canvas-proximity.spec.ts
packages/client/tests/e2e/card-node-title-edit.spec.ts
packages/client/tests/e2e/loadout-list-panel.spec.ts
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1</dependencies>
      <out_of_scope>
- Do NOT touch `store/browse-store.ts`, `edit-store.ts`, `analyzeStore.ts` — those are FE-4.
- Do NOT touch server code (router/schemas/parsers) — loadout procedure removal is BE-1.
- Do NOT remove other union members ('export','planning','browse','edit','graph') — only 'compose' this wave.
- Do NOT touch FF7 tokens.
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>explicit list of every file deleted (page, stores, components, specs) with the importer-scan result justifying each</item>
          <item>lint ×3 + build + Playwright results</item>
        </must_contain>
        <must_not_contain>
          <item>edits to browse/edit/analyze stores or non-Compose surfaces</item>
          <item>server-side edits</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, compose greps empty, Playwright green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-3</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
CUT-SURFACE DELETION (Wave 2) — EXPORT + PLANNING (two light CUT surfaces; one deletion unit bounded by the remaining CUT verdict). Steps:
1. Delete `pages/ExportPage.tsx` and `pages/PlanningPage.tsx`.
2. Grep for Export-only / Planning-only components (Export form inputs, planning backlog rows) and delete those with zero retained-surface importer; enumerate.
3. AppMode↔PAGE_MAP: remove `'export'` and `'planning'` from the AppMode union (`store/ui-store.ts`); remove the `export:` and `planning:` PAGE_MAP entries + imports in `components/ModeContent.tsx`.
4. e2e: delete surface specs WITH the surface: `gander-studio-p1-export-fe.spec.ts`, `prog-studio-vision-s2-d1-export.spec.ts` (verify it targets the Export SURFACE, not a session export), `prog-studio-vision-s3-planning.spec.ts`. Confirm each describe/title before deleting.
Client refs to `trpc.export.spawn` and `trpc.planning.list` vanish here — un-blocking BE-1.
CAUTION: `prog-studio-vision-s2-d2-edit-save.spec.ts` covers SESSION markdown save (KEEP) — do NOT delete it here or in FE-4.
      </description>
      <success_criteria>
- ExportPage + PlanningPage + their exclusive components deleted; `grep -rn "ExportPage\|PlanningPage" packages/client/src` returns nothing.
- `'export'` and `'planning'` removed from AppMode union; no `export`/`planning` PAGE_MAP entries; no `trpc.export.spawn` / `trpc.planning.list` reference in client src.
- The 3 named Export/Planning specs deleted; session-edit-save spec untouched and green.
- `npm run lint` (tsc ×3) clean; client build passing; Playwright green.
      </success_criteria>
      <context_files>
packages/client/src/pages/ExportPage.tsx
packages/client/src/pages/PlanningPage.tsx
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/tests/e2e/gander-studio-p1-export-fe.spec.ts
packages/client/tests/e2e/prog-studio-vision-s2-d1-export.spec.ts
packages/client/tests/e2e/prog-studio-vision-s3-planning.spec.ts
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-2</dependencies>
      <out_of_scope>
- Do NOT touch browse/edit/graph surfaces or their stores — FE-4.
- Do NOT delete session-related specs (edit-save, session-buffer, timeline) — those are KEEP surfaces.
- Do NOT touch server code (export/planning procedure removal is BE-1).
- Do NOT touch FF7 tokens.
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>files deleted + importer-scan justification each</item>
          <item>confirmation the session-edit-save spec was NOT touched</item>
          <item>lint ×3 + build + Playwright results</item>
        </must_contain>
        <must_not_contain>
          <item>edits to browse/edit/graph surfaces</item>
          <item>server-side edits</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, export/planning greps empty, Playwright green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-4</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
ABSORB-SURFACE DELETION (Wave 3) — BROWSE + GRAPH + EDIT. HARD ORDER (absorption-before-cut): this wave may proceed ONLY because s3's absorption proof is green — CITE `prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (green 8/8 today) in the packet before deleting. Steps:
1. Delete `pages/BrowsePage.tsx`, `pages/GraphPage.tsx`, `pages/EditPage.tsx`.
2. Delete `hooks/useBrowseData.ts` (Browse-only). Delete stores `store/browse-store.ts` and `store/edit-store.ts` after grepping importers — CRITICAL: confirm `components/detail/ReviseSpecAction.tsx` and `AgentDetailPage.tsx` do NOT import edit-store (ReviseSpecAction uses trpc.agent/skill directly per its header). Investigate `store/analyzeStore.ts` consumers: grep its importers; if its only importers are Browse/Graph (being deleted), delete it too; if any retained surface imports it, RETAIN and note. Do not assume — the grep decides.
3. AppMode↔PAGE_MAP: remove `'browse'`, `'edit'`, `'graph'` from the AppMode union (`store/ui-store.ts`); remove the `browse`/`edit`/`graph` PAGE_MAP entries + the `GraphPage` React.lazy import in `components/ModeContent.tsx`.
4. COMPILE-BREAK FIX (s3 inheritance a — CTA re-point). Removing `'browse'` from the union makes `PartyPage.tsx` line ~209 `setActiveMode('browse')` a hard compile error (TODO(s4-cut) marker). Work from CURRENT HEAD (AgentDetailPage/PartyPage were amended 2026-07-10, commit 6aa859c — line numbers may have shifted). Resolve the empty-party-state "View Full Roster" CTA by re-pointing `handleViewRoster` to a VALID retained mode (recommend removing the CTA entirely from EmptyPartyState, since its v1 destination — the Browse catalog — no longer exists and the "13-role full-roster catalog" destination is DEFERRED/out-of-scope this sprint). Do NOT invent a new full-roster surface. State the chosen resolution in the packet.
5. Delete Browse/Graph/Edit-only components after importer-scan (verify no drill-down/relationship component reuse — RelationshipPanel is a KEEP detail component and must be retained).
6. e2e: delete surface specs WITH the surface: `gander-studio-p1-browse-fe.spec.ts`, `gander-studio-p1-edit-fe.spec.ts`, `graph-page.spec.ts`. UPDATE (do not delete) any inherited assertion that the party "View Full Roster" CTA navigates to browse — this wave legitimately falsifies it (mechanical rule 2; the retained-CTA browse test is INTERIM(s4-cut) by definition). Grep the s2 party-shell spec + any CTA test for a browse-navigation assertion and update it to the chosen resolution.
7. VERIFY the s3 absorption spec + s2 party-card/quick-peek specs stay GREEN — this wave must not break them.
      </description>
      <success_criteria>
- BrowsePage, GraphPage, EditPage, useBrowseData, browse-store, edit-store deleted; analyzeStore deleted-or-retained per its importer scan (state which); `grep -rn "BrowsePage\|GraphPage\|EditPage\|useBrowseData\|browse-store\|edit-store" packages/client/src` returns nothing.
- `'browse'`, `'edit'`, `'graph'` removed from AppMode union; no browse/edit/graph PAGE_MAP entries; no `trpc.connectivity.getGraph` reference in client src.
- PartyPage compiles: `handleViewRoster`/`setActiveMode('browse')` resolved (re-pointed or CTA removed); no `'browse'` string-literal mode reference remains (`grep -rn "'browse'\|\"browse\"" packages/client/src` returns nothing).
- s3 absorption e2e (`prog-studio-v2-2026-07-s3-drilldowns.spec.ts`) cited green and STILL green after this wave; s2 party-card/quick-peek specs green.
- Browse/Graph/Edit surface specs deleted; the CTA-navigation assertion updated.
- `npm run lint` (tsc ×3) clean; client build passing; full Playwright suite green.
      </success_criteria>
      <context_files>
packages/client/src/pages/BrowsePage.tsx
packages/client/src/pages/GraphPage.tsx
packages/client/src/pages/EditPage.tsx
packages/client/src/hooks/useBrowseData.ts
packages/client/src/store/browse-store.ts
packages/client/src/store/edit-store.ts
packages/client/src/store/analyzeStore.ts
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/pages/PartyPage.tsx
packages/client/src/components/detail/ReviseSpecAction.tsx
packages/client/src/components/detail/RelationshipPanel.tsx
packages/client/tests/e2e/gander-studio-p1-browse-fe.spec.ts
packages/client/tests/e2e/gander-studio-p1-edit-fe.spec.ts
packages/client/tests/e2e/graph-page.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts
DESIGN.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-3</dependencies>
      <out_of_scope>
- Do NOT delete or refactor `components/detail/*` KEEP components (ReviseSpecAction, RelationshipPanel, AgentDetail panels) — Edit and Graph value is ABSORBED there and must remain live.
- Do NOT build a new full-roster / 13-role catalog surface (DEFERRED — see risk_flags). The CTA fix is re-point-or-remove only.
- Do NOT touch AgentDetailPage's statbox grid layout (commit 6aa859c) beyond what the compile-break fix strictly requires (it should require none).
- Do NOT retire ROSTER_AGENT_NAME_BY_CODE / touch AgentDetailSchema (DEFERRED-V2S3-1 — DEFERRED this sprint).
- Do NOT touch FF7 tokens; do NOT touch server code.
      </out_of_scope>
      <estimated_new_lines>0-15 net-new (deletion wave; the CTA fix is a small edit/removal)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>citation of s3 absorption spec green (absorption-before-cut)</item>
          <item>analyzeStore delete-or-retain decision with importer-scan evidence</item>
          <item>the chosen handleViewRoster/CTA resolution and confirmation PartyPage compiles</item>
          <item>the CTA-navigation e2e assertion update</item>
          <item>lint ×3 + build + full Playwright results incl. s3/s2 specs still green</item>
        </must_contain>
        <must_not_contain>
          <item>deletion of any components/detail/* KEEP component</item>
          <item>a new full-roster catalog surface</item>
          <item>AgentDetailSchema / ROSTER_AGENT_NAME_BY_CODE edits</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, browse/graph/edit greps empty, PartyPage compiles, s3+s2 specs green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
      <assigned_to>backend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
SERVER-PROCEDURE RETIREMENT (per the PM decision above; Critic-gated). Remove the tRPC procedures whose CUT/absorbed client surfaces are now deleted, plus their EXCLUSIVELY-used schemas/parsers/helpers. Runs AFTER FE-2/FE-3/FE-4 so no client `trpc.*` reference to a removed procedure survives to break the AppRouter type.
1. PRE-REMOVAL SCAN (SC-gating). For each removal candidate — `export.spawn`, `loadout.list/save/delete`, `planning.list`, `connectivity.getGraph` — grep every importer of its procedure, its input/output Zod schema, its parser, and any helper it uses (e.g. `sanitizeName`, `parsePlanningBacklog`, `ExportInputSchema`, `LoadoutSchema`, `ConnectivityGraphSchema`). Build a retain-set: any schema/parser/helper still imported by a RETAINED procedure stays. CRITICAL couplings to verify: (a) does `parsers/agent-detail.ts` (assembleAgentDetail) import the connectivity parser or `ConnectivityGraphSchema` for its relationship edges? If yes, RETAIN that parser/schema and remove only the `connectivity.getGraph` procedure. (b) `parseAllAgents/Skills/Hooks` are imported by `agent.get`/`skill.get`/roster — RETAIN them.
2. In `router.ts`: remove the `export.spawn` procedure + the `exportRouter`; remove `loadoutRouter` (list/save/delete); remove `planning.list` + `planningRouter`; remove `connectivity.getGraph` + `connectivityRouter` (only if scan confirms no retained importer of the procedure). Remove each from the `appRouter` composition. Remove the now-unused top-level imports.
3. In `packages/shared/src/schemas.ts`: remove schemas EXCLUSIVELY used by removed procedures (ExportInputSchema, ExportResultSchema is local to router, LoadoutSchema, PlanningListInput/OutputSchema, ProgramGetDag stays [program retained], ConnectivityGraphSchema ONLY IF no retained importer). Do not remove any schema still imported elsewhere.
4. Delete `parsers/planning-parser.ts` + its `__tests__` (Planning fully cut). For `parsers/connectivity*`: retain if agent-detail imports it, else delete with tests.
5. RETAIN (do NOT remove): `agent.list/get/save`, `skill.list/get/save`, `hook.list`, all `session.*`, `progression.getLedger`, `program.getDag`, `roster.getParty/getAgentDetail`, and env.ts unchanged.
6. Run server vitest (`vitest run src/parsers/__tests__`) + tsc ×3 lint; both green.
Server-procedure decision is flagged for the Critic gate — the retain-set and the connectivity coupling are the two review-critical items.
      </description>
      <success_criteria>
- Pre-removal scan documented: for each of the 4 removal targets, the importer-scan result and the resulting retain-set.
- `export.spawn`, `loadout.*`, `planning.list`, `connectivity.getGraph` removed from `router.ts` + `appRouter`; `grep -n "export:\|loadout:\|planning:\|connectivity:" packages/server/src/router.ts` shows only removals consistent with the decision.
- Exclusively-used schemas/parsers/helpers removed; NO schema/parser still imported by a retained procedure is removed (verified — lint would catch a dangling import).
- RETAINED procedures intact: `agent.*`, `skill.*`, `hook.list`, `session.*`, `progression.getLedger`, `program.getDag`, `roster.*` all present; `ReviseSpecAction`'s `agent.get/save` + `skill.get/save` still resolve.
- `npm run lint` (tsc ×3) clean; server vitest green; client build passing (AppRouter type change breaks nothing — FE waves already removed client refs).
- env.ts unchanged (LOADOUTS_DIR retained for SESSIONS_EDITS_DIR default).
      </success_criteria>
      <context_files>
packages/server/src/router.ts
packages/shared/src/schemas.ts
packages/server/src/parsers/planning-parser.ts
packages/server/src/parsers/agent-detail.ts
packages/server/src/env.ts
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-2, prog-studio-v2-2026-07-s4-retirement-FE-3, prog-studio-v2-2026-07-s4-retirement-FE-4</dependencies>
      <out_of_scope>
- Do NOT remove `agent.list/skill.list/hook.list` (retained per decision — flag to Critic if you disagree; do not remove unilaterally).
- Do NOT remove or edit env vars (env.ts stays; LOADOUTS_DIR backs SESSIONS_EDITS_DIR default).
- Do NOT touch `parseAllAgents/Skills/Hooks` (retained: agent.get/skill.get/roster).
- Do NOT touch roster/session/progression/program routers or their parsers.
- Do NOT git commit (return a completion_packet; ORC commits post-audit).
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>the pre-removal scan table (target → importers → retain-set)</item>
          <item>explicit connectivity-parser coupling finding (retained vs deleted, with evidence)</item>
          <item>final retained-procedure list (for DOCS-1 to consume)</item>
          <item>lint ×3 + server vitest + client build results</item>
        </must_contain>
        <must_not_contain>
          <item>removal of any schema/parser imported by a retained procedure</item>
          <item>env-var edits</item>
          <item>an inline git commit</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, server vitest green, client build passing, removed-procedure greps consistent with decision</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-DOCS-1</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>NORMAL</priority>
      <description>
DOCS TO v2 REALITY. Update the two project docs to reflect the post-retirement state. Runs LAST (after all code waves + BE-1) so it describes reality, not intent. Single owner of both files (no shared-file split).
1. `CLAUDE.md` (repo root):
   - **Surfaces table** — remove Browse/Compose/Edit/Export/Graph/Planning rows; retain Sessions/Progression/Programs; ADD Party (`party`, default, PartyPage) and Agent Detail (`agent-detail`, AgentDetailPage). Verify each retained row against the actual PAGE_MAP in `components/ModeContent.tsx` at HEAD.
   - **Navigation line** — replace "BottomTabBar (role=tablist, 9 tabs…)" with the SubmenuRail reality (Roster→party / Sessions / Progression / Programs; agent-detail reached via party card). Confirm against `constants/navigation.ts` RAIL_ITEMS.
   - **tRPC procedures table + "22 procedures across 10 routers" heading** — rewrite to the ACTUAL post-BE-1 set. DERIVE the count and router list by grepping `t.procedure` and sub-routers in `packages/server/src/router.ts` at HEAD (do NOT hardcode 18/8 from this brief — read the file). Remove the deprecated rows (loadout.*, export.spawn, connectivity.getGraph, planning.list) consistent with BE-1's completion_packet (which lists the retained set).
   - **Architecture tree** — fix `pages/` (remove deleted pages; add PartyPage/AgentDetailPage/sessions/), `store/` (remove compose/canvas/browse/edit[/analyze if deleted]; the "session-picker" name is STALE — correct to the actual store files), `parsers/` (remove planning[/connectivity if deleted]).
   - **Known Issues bundle line** — the "~700KB" baseline is STALE (DEFERRED-V2S2-2 / s3 inheritance d). Re-measure from the FE-4 client build output and update, OR replace with the current gate status; state the source of the new number in the packet.
   - **Env table** — note EXPORT_BASE_DIR is now unused/deprecated (export removed); keep LOADOUTS_DIR (still backs SESSIONS_EDITS_DIR default).
2. `DESIGN.md` (repo root): append a Decision Record for the v2 IA — the 9→5 surface consolidation, BottomTabBar retirement, SubmenuRail as sole nav. No new visual tokens (`design_system_source: DESIGN_MD`); this is a structural/IA decision record, not a token change. Follow the existing DESIGN.md decision-record format.
      </description>
      <success_criteria>
- CLAUDE.md surfaces table lists exactly the 5 KEEP/v2 surfaces (Party, Agent Detail, Sessions, Progression, Programs) — no Compose/Export/Browse/Graph/Edit/Planning rows; `grep -n "Compose\|Export\|Browse\|Graph\|Edit\|Planning" CLAUDE.md` shows only historical/known-issue prose, not surface/route rows.
- Navigation description reflects SubmenuRail (no "9 tabs"/"BottomTabBar" as the live nav).
- tRPC procedure table matches `router.ts` at HEAD; no `export.spawn`/`loadout.`/`connectivity.getGraph`/`planning.list` rows; roster.getParty/getAgentDetail present; the router/procedure counts are derived from the file, not this brief.
- Architecture tree store/page/parser lists match disk (deleted entries gone; "session-picker" corrected).
- Bundle-size baseline updated with a stated source; EXPORT_BASE_DIR noted as deprecated-unused.
- DESIGN.md carries a v2-IA decision record; no new token entries added.
      </success_criteria>
      <context_files>
/home/jhber/projects/gander-studio-alpha/CLAUDE.md
/home/jhber/projects/gander-studio-alpha/DESIGN.md
packages/server/src/router.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/constants/navigation.ts
(BE-1 completion_packet — final retained-procedure list, provided by ORC)
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1, prog-studio-v2-2026-07-s4-retirement-FE-2, prog-studio-v2-2026-07-s4-retirement-FE-3, prog-studio-v2-2026-07-s4-retirement-FE-4, prog-studio-v2-2026-07-s4-retirement-BE-1</dependencies>
      <out_of_scope>
- Do NOT edit code — docs only.
- Do NOT add new FF7 or design tokens to DESIGN.md (IA decision record only).
- Do NOT hardcode a procedure count from this brief — derive from router.ts at HEAD.
- Do NOT document the DEFERRED items (rail collapse, 13-role catalog, ROSTER_AGENT_NAME_BY_CODE) as done; if referenced, mark them deferred.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>the updated surfaces table + navigation description + procedure table (as diffs or full sections)</item>
          <item>the source of the new bundle-size number</item>
          <item>the DESIGN.md v2-IA decision record text</item>
        </must_contain>
        <must_not_contain>
          <item>any code edit</item>
          <item>new design/FF7 token definitions</item>
          <item>a hardcoded procedure count not derived from router.ts</item>
        </must_not_contain>
        <success_signal>CLAUDE.md + DESIGN.md reflect disk reality; procedure table matches router.ts at HEAD; no stale surface rows</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    FE-1 (nav shell) → FE-2 (Compose) → FE-3 (Export+Planning) → FE-4 (Browse+Graph+Edit; absorption-before-cut, PartyPage compile-break fix) → BE-1 (server procedure removal) → DOCS-1 (docs)
    All packets are SERIAL — no two run in parallel. Rationale: FE-2/3/4 all mutate the shared nav files ui-store.ts (AppMode union) + ModeContent.tsx (PAGE_MAP); parallel writes would clobber. FE-1 removes NAV_ITEMS first so FE-2/3/4 need not touch navigation.ts. BE-1 must follow all FE waves (client trpc refs gone before AppRouter type changes). DOCS-1 last (describes final reality). lint ×3 + client build green is a per-packet SC (program invariant: green after EVERY removal wave, not only sprint end).
  </dependency_order>

  <routing_notes>
    ## Recurring-pattern preflight (Step 0.5 — mandatory enumeration)
    Source: docs/after-actions/prog-studio-v2-2026-07-s3-drilldowns.md §6 (most recent; s2/s1 gaps pre-extracted in the brief's prior_sprint_gaps + pm_preflight_checklist, treated as canonical excerpt per budget rule).
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">plan-time-unverified-inherited-fact (RECURRING, 3rd form): PM quoted the s2 AA §7 "both" under-count as ground truth → CR#1 BLOCK. AVOIDED: every enumeration in this plan (union members, pages, stores, trpc consumers, e2e specs) carries a same-sprint 2026-07-10 disk citation (glob/grep/read); the s3-close inheritance list and DEFERRED items were re-verified against SESSION-CHECKPOINT §Open at Close and deferred-work, not quoted from the after-action alone.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">primitive-behavioral-default-collision (RECURRING, 2nd behavioral): initialFocus resolution-timing vs async mount. ACCEPTED-LOW-RISK: this retirement sprint deletes surfaces; the only surviving Dialog/Popover primitives are the KEEP drill-down's ReviseSpecAction (untouched) and s2's card-hover Popover (untouched). No packet modifies a base-ui primitive; FE-4 is explicitly forbidden from touching components/detail/* behavior. If a compile-break fix incidentally touches EmptyPartyState focus, FE#8 rem2's function-form initialFocus + post-mount effect is the reference pattern (noted in FE-4).</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">subagentstop-complete-miss (validator subclass, RECURRING 4th consecutive): ORC-side. ACKNOWLEDGED — ORC must verify each spawned agent's COMPLETE event is logged and backfill inline if the SubagentStop hook misses (esp. the validator/REQVAL close-out).</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">archivist-paraphrase-drift (RECURRING 4th sighting, 3rd mutation): AR-side. ACKNOWLEDGED — the archivist must copy identifiers/defects/commit inventory VERBATIM from artifacts (Glob-confirm paths); no PM-side action, but this plan's disk-cited enumerations give the AR verbatim source material.</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">OVERSCOPED: "≤2 independent files per domain; split 3+." APPLIED with the deletion-wave exemption the checklist itself grants ("a DELETION wave over many files is one logical unit — bound each deletion packet by surface"). Each FE packet is bounded by SURFACE/verdict: FE-1=nav-shell, FE-2=Compose (its own packet BECAUSE it is the heaviest — canvas subtree + 2 stores + 5 specs), FE-3=Export+Planning (two light CUTs), FE-4=Browse+Graph+Edit (ABSORB verdict). BE-1=server-retirement unit. Each FE agent is licensed to BLOCK-for-split if a wave proves too large.</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">DRY: reuse before re-implement. APPLIED — this is a deletion sprint (no new helpers). The one dedup opportunity (ROSTER_AGENT_NAME_BY_CODE sanctioned-duplication, DEFERRED-V2S3-1) is DEFERRED with rationale (see risk_flags) rather than folded in, to keep the terminal retirement sprint tight.</recurring_pattern>

    ## Server-procedure decision (FLAGGED FOR CRITIC GATE — brief output #3)
    DECISION: deprecate-by-removal. REMOVE export.spawn / loadout.* / planning.list / connectivity.getGraph (zero v2 consumers, disk-verified). RETAIN agent.get/save + skill.get/save (live: ReviseSpecAction), agent.list/skill.list/hook.list (retained; future 13-role-catalog re-consumer + parsers stay anyway), all session/progression/program/roster procedures, env.ts. Full rationale + retain-set in the "Server-procedure decision" section above. Critic-critical review items: (1) the connectivity-parser coupling in assembleAgentDetail (BE-1 scan-gated), (2) the retain-vs-remove call on the three catalog list procedures.

    ## Shared-file serialization
    append_serialization / shared-mutation order: {ui-store.ts[AppMode union]: [FE-2, FE-3, FE-4], ModeContent.tsx[PAGE_MAP]: [FE-2, FE-3, FE-4], navigation.ts[NAV_ITEMS]: [FE-1]}. Enforced via the strictly-serial dependency_order — each wave re-reads the shared file fresh from disk (post-prior-wave HEAD).

    ## prior_approved_tasks (sequential single-file context for the auditor)
    ui-store.ts, ModeContent.tsx, and navigation.ts are each touched by multiple s4 waves and were last authored by s2/s3 (party AppMode, agent-detail mode, lazy PAGE_MAP imports, RAIL_ITEMS, aria-current-at-home). The auditor should treat prior-wave/prior-sprint committed additions to these files (e.g. the AgentDetailPage statbox grid at commit 6aa859c, s3 RAIL_ITEMS Roster→party mapping, s2 party mode) as ALREADY-APPROVED, not as out-of-scope modifications introduced by an s4 packet.

    ## DESIGN.md status
    PRESENT at repo root (/home/jhber/projects/gander-studio-alpha/DESIGN.md). Included in every UI-touching packet (FE-1, FE-4) and updated by DOCS-1. No new visual tokens introduced (retirement) — design_system_source: DESIGN_MD for all packets; DOCS-1 appends an IA decision record only.

    ## Critic relevance
    Most relevant Critic probes: (1) the server-procedure decision + connectivity coupling; (2) absorption-before-cut ordering (FE-4 must cite s3 green); (3) compiler-exhaustive AppMode↔PAGE_MAP per wave; (4) the DEFERRED-vs-human-"plus the s3 inheritances" reconciliation (see risk_flags — reconcile BEFORE dispatch, not at REQVAL).

    ## Step 4.5 / final gate
    Human browser walkthrough at Step 4.5 is the program's final pre-skein gate (ORC/human-owned, not a packet). Push is human-owned (guarded model). Full e2e sweep green is a per-wave SC culminating after FE-4/BE-1.

    ## sc-precheck
    No Bash in the PM toolset — the mechanical sc-locked-value-consistency script was not run. A manual self-lint per Steps 7.5/7.8 was performed and written to `sc-precheck-report.json` (this dir): verdict PASS, no locked-value SCs (deletion sprint), field-token count brittleness avoided by derive-not-hardcode (DOCS-1). Recommend ORC/Critic run the mechanical script as backstop; expected findings: none.
  </routing_notes>

  <risk_flags>
    - **verbatim-vs-scope conflict (RECONCILE BEFORE DISPATCH, per Step 7.6):** the human said "plus the s3 inheritances listed in context." Two of those inheritances are FEATURES/refactors, not retirement, and are DEFERRED by this plan — surface to the human up front rather than letting them first appear at REQVAL:
        · (b) rail collapse/expand (HA-1) — DEFERRED: a rail ENHANCEMENT, not covered by the human's retirement verbs; s2 shipped the rail, collapse/expand is additive.
        · (e) 13-role full-roster catalog entry — OUT OF SCOPE: building a new full-catalog surface is a feature, not a cut. The FE-4 CTA compile-break fix re-points/removes the dead "View Full Roster" affordance rather than building its destination.
        · DEFERRED-V2S3-1 (retire ROSTER_AGENT_NAME_BY_CODE via AgentDetailSchema extension) — DEFERRED: an additive BE schema extension + FE refactor; folding a schema change into the terminal retirement sprint expands blast radius past the "FE+docs" framing and risks the final pre-skein gate. Recommend a dedicated follow-up.
        · DEFERRED-V2S3-2 (--mg-on---sfh contrast_pairs row) — DEFERRED: conditional ("if ever used as text"), a design-pass item.
      Inheritances (a) CTA re-point [FE-4] and (d) stale CLAUDE.md baseline [DOCS-1] ARE addressed this sprint. (c) 390px header overflow [DEFERRED-V2S2-1] is DEFERRED (pre-existing responsive bug; BottomTabBar removal may incidentally reduce header pressure but the fix is separate). ORC: confirm the human accepts (b)/(c)/(e)/DEFERRED-V2S3-1/2 remaining deferred, or re-scope.
    - **analyzeStore.ts ownership unknown:** its consumer set was not resolved within read budget; FE-4 is gated to grep importers and delete-or-retain on evidence (not assumption). If it is neither Browse/Graph-tied nor retained-surface-tied, ORC may need to route a clarification.
    - **connectivity-parser coupling:** whether assembleAgentDetail reuses the connectivity parser/ConnectivityGraphSchema for relationship edges was not read within budget; BE-1's scan is the gate. Removing the schema/parser while agent-detail imports it would break a KEEP surface — SC-gated.
    - **AgentDetailPage HEAD drift:** amended TODAY (commit 6aa859c). FE-4's PartyPage compile-break fix and any detail-adjacent grep must work from CURRENT HEAD, not s3-era line numbers (brief ground fact).
    - **s2 party-shell / s3 drilldowns specs outlive their sprints:** FE-1 (nav assertions) and FE-4 (CTA-navigation assertion) legitimately falsify inherited assertions and are authorized to update them IN THE SAME PACKET; the s3 absorption spec must remain GREEN (seam) — never deleted or weakened.
    - **Base-plan portability:** all packets are plain file edits/deletions; no Workflow-tool dependency. (Invariant honored.)
    - **DEFERRED-006 / --redb contrast:** untouched (out of scope); pre-existing.
  </risk_flags>
</task_decomposition>

---

## Verbatim Deliverable Audit (Step 7 — mandatory block)

<verbatim_deliverable_audit>
  <phrase text="kick off s4"><addressed task="all — decomposition produced"/></phrase>
  <phrase text="retire the CUT surfaces (Compose, Export, Planning)"><addressed task="FE-2 (Compose), FE-3 (Export+Planning), BE-1 (their server procedures)"/></phrase>
  <phrase text="remove the absorbed v1 surfaces (Browse, Graph, Edit)"><addressed task="FE-4"/></phrase>
  <phrase text="now that s3's drill-downs carry their value"><addressed task="FE-4 (cites s3 absorption e2e green; absorption-before-cut hard order)"/></phrase>
  <phrase text="remove the 9-tab BottomTabBar"><addressed task="FE-1"/></phrase>
  <phrase text="in favor of the v2 rail"><addressed task="FE-1 (SubmenuRail becomes sole nav)"/></phrase>
  <phrase text="prune dead stores/components/routes"><addressed task="FE-1 (NAV_ITEMS/BottomTabBar), FE-2 (compose/canvas stores+components), FE-3 (export/planning components), FE-4 (browse/edit[/analyze] stores+components+modes), BE-1 (server routes)"/></phrase>
  <phrase text="update project docs (CLAUDE.md surfaces + tRPC tables, DESIGN.md) to v2 reality"><addressed task="DOCS-1"/></phrase>
  <phrase text="plus the s3 inheritances listed in context — (a) View-Full-Roster CTA re-point"><addressed task="FE-4 (compile-break fix)"/></phrase>
  <phrase text="s3 inheritance (b) Roster rail collapse/expand"><deferred reason="rail ENHANCEMENT, not a retirement verb; flagged in risk_flags for pre-dispatch human reconciliation"/></phrase>
  <phrase text="s3 inheritance (c) 390px header overflow"><deferred reason="pre-existing responsive bug DEFERRED-V2S2-1; not a surface retirement; separate fix"/></phrase>
  <phrase text="s3 inheritance (d) stale CLAUDE.md bundle baseline"><addressed task="DOCS-1 (bundle line re-measured; surfaces/procedure tables rewritten)"/></phrase>
  <phrase text="s3 inheritance (e) 13-role catalog entry"><out_of_scope reason="building a new full-roster catalog surface is a feature, not a cut; FE-4 re-points/removes the dead CTA instead of building its destination; flagged for reconciliation"/></phrase>
  <phrase text="DEFERRED-V2S3-1 (retire ROSTER_AGENT_NAME_BY_CODE via schema extension)"><deferred reason="additive BE AgentDetailSchema extension + FE refactor; expands terminal retirement sprint blast radius; recommend dedicated follow-up; flagged in risk_flags"/></phrase>
  <phrase text="DEFERRED-V2S3-2 (--mg on --sfh contrast_pairs row)"><deferred reason="conditional design-pass item ('if ever used as text'); next design pass"/></phrase>
  <phrase text="export/loadout server procedures — retained vs deprecated (PM decides, Critic gate)"><addressed task="BE-1 (DECISION: deprecate-by-removal; retain-set + connectivity coupling flagged for Critic)"/></phrase>
</verbatim_deliverable_audit>

---

## Expectation Manifest

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s4-retirement</sprint_id>
  <generated>2026-07-10</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-1-{ts}.md</expected_file>
      <blocks>FE-2, FE-3, FE-4, DOCS-1</blocks>
      <receipt_check>
        <item>SubmenuRail sole-nav coverage confirmed (seam precondition)</item>
        <item>grep BottomTabBar + grep NAV_ITEMS empty</item>
        <item>lint ×3 + build passing; Playwright green (nav specs updated, not left red)</item>
        <item>no ui-store/ModeContent edits (union/PAGE_MAP untouched this wave)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-2-{ts}.md</expected_file>
      <blocks>FE-3, FE-4, BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>file-deletion list with importer-scan justification</item>
        <item>'compose' removed from union; PAGE_MAP compose entry gone; no trpc.loadout ref in client</item>
        <item>lint ×3 + build passing; Playwright green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-3</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-3-{ts}.md</expected_file>
      <blocks>FE-4, BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>ExportPage+PlanningPage deleted; 'export'/'planning' removed from union/PAGE_MAP</item>
        <item>session-edit-save spec NOT touched (confirmed)</item>
        <item>no trpc.export.spawn / trpc.planning.list in client; lint ×3 + build + Playwright green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-4</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-4-{ts}.md</expected_file>
      <blocks>BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>s3 absorption spec cited green + still green after wave (absorption-before-cut)</item>
        <item>analyzeStore delete-or-retain decision with evidence</item>
        <item>PartyPage compiles; handleViewRoster/CTA resolved; no 'browse' literal remains</item>
        <item>components/detail/* KEEP components untouched; no new catalog surface; no AgentDetailSchema edit</item>
        <item>lint ×3 + build + full Playwright green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-BE-1-{ts}.md</expected_file>
      <blocks>DOCS-1</blocks>
      <receipt_check>
        <item>pre-removal scan table (target → importers → retain-set)</item>
        <item>connectivity-parser coupling finding (retain/delete + evidence)</item>
        <item>final retained-procedure list present (DOCS-1 input)</item>
        <item>retained procedures intact (agent.get/save, skill.get/save resolve for ReviseSpecAction)</item>
        <item>env.ts unchanged; lint ×3 + server vitest + client build green; no inline commit</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-DOCS-1</task_id>
      <agent>FE#5</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-DOCS-1-{ts}.md</expected_file>
      <blocks>NONE (terminal; feeds Step 4.5 walkthrough + skein)</blocks>
      <receipt_check>
        <item>surfaces table = 5 v2 surfaces only; nav = SubmenuRail; procedure table matches router.ts at HEAD (derived, not hardcoded)</item>
        <item>architecture tree matches disk (session-picker corrected); bundle baseline updated with stated source</item>
        <item>DESIGN.md v2-IA decision record present; no new tokens; no code edits</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

---

## COMPLETE
Primary output: `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-PM-1783709144.md`
Adjacent: `.claude/tasks/outputs/sc-precheck-report.json`
6 task_packets (FE-1..FE-4, BE-1, DOCS-1), all inline (no stubs). Reads used: 8/8 (at cap; decomposition complete, no budget_exceeded). No consultation needed.
