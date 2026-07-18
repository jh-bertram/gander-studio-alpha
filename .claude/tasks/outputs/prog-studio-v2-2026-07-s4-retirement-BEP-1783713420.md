# Jidoka Plan-Only Packet — prog-studio-v2-2026-07-s4-retirement-BE-1

<plan_packet>
  <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
  <agent>BEP#1</agent>
  <mode>plan</mode>

  <tooling_note>
This session's actual registered toolset is Read/Write/Edit/Bash only — no standalone Glob/Grep
tool exists here despite the skill spec naming them. To honor the plan-only intent (search/read,
never mutate) I used Bash strictly for read-only commands (grep -n / -l, ls, find, wc -l) — zero
writes, zero git, zero package installs. Flagging this tooling mismatch for the skill spec owner;
it does not change any finding below.
  </tooling_note>

  <files_read>
    <!-- Full-Read via Read tool -->
    <file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev1-PM-1783712130.md (both pages, full)</file>
    <file>packages/server/src/router.ts (full, 833 lines)</file>
    <file>packages/shared/src/schemas.ts (full, 471 lines)</file>
    <file>packages/server/src/parsers/planning-parser.ts (full, 265 lines)</file>
    <file>packages/server/src/parsers/agent-detail.ts (full, 248 lines)</file>
    <file>packages/server/src/env.ts (full, 46 lines)</file>
    <file>packages/shared/src/types.ts (full, 12 lines) — NOT a BE-1 context_file; read because grep flagged it</file>
    <file>tsconfig.base.json (full)</file>
    <file>packages/server/tsconfig.json (full)</file>
    <file>packages/server/package.json (full)</file>
    <file>package.json (root, full)</file>
    <file>packages/server/src/parsers/__tests__/program-dag-parser.test.ts (lines 195-204, targeted)</file>
    <!-- Grep/ls-inspected (targeted lines/headers only, via Bash — no Glob/Grep tool available) -->
    <file>packages/server/src/parsers/ (directory listing)</file>
    <file>packages/server/src/parsers/__tests__/ (directory listing + fixtures/ listing)</file>
    <file>packages/client/src/pages/ExportPage.tsx (grep: trpc.export.spawn, Loadout usage line 169)</file>
    <file>packages/client/src/pages/GraphPage.tsx (grep: trpc.connectivity.getGraph, connectivity strings)</file>
    <file>packages/client/src/pages/PlanningPage.tsx (grep: trpc.planning.list)</file>
    <file>packages/client/src/pages/ComposePage.tsx (grep: trpc.loadout.*, Loadout type usage)</file>
    <file>packages/client/src/store/canvas-store.ts (grep: LoadoutSchema/Loadout usage, lines 3,81,92,141,197)</file>
    <file>packages/server/src/parsers/__tests__/planning-parser.test.ts (grep: import header only)</file>
    <file>packages/client/src/components/detail/InventoryPanels.tsx (grep: "connectivity" string)</file>
    <file>packages/client/src/components/detail/RelationshipPanel.tsx (grep: "connectivity" strings)</file>
    <file>packages/client/src/constants/progression.ts (grep: "Connectivity" label)</file>
    <file>packages/client/src/store/__tests__/ui-store.test.ts (grep: AppMode literals — none found)</file>
    <file>packages/client/package.json (cat: test/build scripts)</file>
    <file>packages/shared/package.json (cat: no test script)</file>
  </files_read>

  <proposed_changes>

    <change file="packages/server/src/router.ts">
      <action>modify</action>
      <summary>Remove loadoutRouter, exportRouter, connectivityRouter, planningRouter bodies + their appRouter registrations + every now-dead top-level import/helper whose only call site was inside one of those four blocks.</summary>
      <estimated_lines>+0 / -330..345</estimated_lines>
      <edit_plan>
        <intent>Shrink appRouter to the 8 retained sub-routers + top-level health. Remove any symbol (import, local const, local function) whose sole consumer was a removed router block. Never touch guardPath, STUDIO_ROOT, or any body inside a retained router — all four are multi-consumer or belong to a retained procedure.</intent>
        <expected_diff_shape>4 full-block deletions (loadoutRouter ~lines 276-342; exportRouter ~lines 344-530; connectivityRouter incl. header comment ~lines 685-728; planningRouter incl. header comment ~lines 730-741) + 4-line trim inside the appRouter object (loadout/export/connectivity/planning registration lines) + shared-package import-list trim (drop LoadoutSchema, ExportInputSchema, ConnectivityGraphSchema, PlanningListInputSchema, PlanningListOutputSchema, type ConnectivityGraph from the ~9-32 import block) + drop the `parsePlanningBacklog` local-parser import (line 41) + shrink the `node:fs/promises` named-import list (drop unlink, copyFile, stat — retain writeFile, readFile, readdir, mkdir) + shrink the `./env.js` named-import list (drop LOADOUTS_DIR, EXPORT_BASE_DIR — retain GANDER_ROOT, SESSIONS_SOURCE_DIRS, SESSIONS_EDITS_DIR) + delete the now-dead `sanitizeName` helper (~lines 123-129) + delete the now-dead `ExportResultSchema` local const + its "Export schemas" header comment (~lines 161-171).</expected_diff_shape>
        <out_of_scope_check>PASS with one precision flag (not a violation): the packet's "RETAIN ConnectivityGraphSchema" instruction targets the schemas.ts DEFINITION + agent-detail.ts's independent import — it does NOT mean router.ts's own now-dead import-site of ConnectivityGraphSchema/type ConnectivityGraph must be preserved. That import becomes orphaned once connectivityRouter is deleted and should be dropped from router.ts specifically. Recommend the executing agent's completion_packet state this distinction explicitly so the auditor doesn't misread a router.ts import-trim as touching the protected schema.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/shared/src/schemas.ts">
      <action>modify</action>
      <summary>Remove LoadoutSchema, ExportInputSchema, and the 4-schema Planning block (PlanningItemSchema, PlanningSprintSchema, PlanningListInputSchema, PlanningListOutputSchema + their inferred types); leave the entire Connectivity* block (NodeType/EdgeType/NodeData/EdgeData/DeadReference/OrphanNode/OverCoupledNode/MissingEdge sub-schemas + ConnectivityNodeSchema/ConnectivityEdgeSchema/ConnectivityGraphSchema, ~lines 137-246) byte-identical.</summary>
      <estimated_lines>+0 / -58..62</estimated_lines>
      <edit_plan>
        <intent>Delete exactly the schema groups whose only importer (repo-wide, grep-verified this round) is a removed procedure or a removed parser. Do not touch any Connectivity*, Session*, Progression*, ProgramDag*, or Party/AgentDetail* schema.</intent>
        <expected_diff_shape>3 discrete deletion hunks: LoadoutSchema block (~lines 33-42), ExportInputSchema block (~lines 44-52), Planning block (~lines 272-317 incl. its section header comment).</expected_diff_shape>
        <out_of_scope_check>PASS — matches packet step 3 verbatim; ConnectivityGraphSchema protection independently re-confirmed against agent-detail.ts at HEAD this round (see verification note below).</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/shared/src/types.ts">
      <action>modify</action>
      <summary>NOT LISTED IN BE-1's context_files — added here because it is compile-blocking. Drop the `LoadoutSchema` import specifier and the `export type Loadout = z.infer&lt;typeof LoadoutSchema&gt;` line; leave Agent/Skill/Hook type exports untouched.</summary>
      <estimated_lines>+0 / -2</estimated_lines>
      <edit_plan>
        <intent>packages/shared/src/index.ts re-exports both schemas.ts AND types.ts (`export * from './schemas.js'; export * from './types.js';`). types.ts independently imports `LoadoutSchema` from schemas.ts to derive the `Loadout` type. Once schemas.ts's LoadoutSchema is deleted, types.ts's import becomes a dangling reference and `tsc --noEmit --project packages/shared/tsconfig.json` — the FIRST of the root `npm run lint`'s three sequential passes (shared → server → client) — fails before server/client are ever type-checked. This is a hard compile blocker, not a hygiene nit.</intent>
        <expected_diff_shape>2-line deletion inside a 12-line file (drop one import specifier, drop one export-type line).</expected_diff_shape>
        <out_of_scope_check>CONFLICT: this file is absent from BE-1's context_files, absent from the packet's numbered description, and absent from routing_notes' "Shared-file serialization" mutation-order table — yet it MUST change for BE-1's own stated success_criteria ("npm run lint (tsc ×3) clean") to be achievable. See conflicts_detected #1.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/server/src/parsers/planning-parser.ts">
      <action>delete</action>
      <summary>Whole-file deletion (265 lines) — sole importer (router.ts's planningRouter) removed in the same packet; zero other repo-wide importers (grep-confirmed).</summary>
      <estimated_lines>+0 / -265</estimated_lines>
      <edit_plan>
        <intent>Delete parser with its sole consumer, in the same commit-unit as its dedicated test file.</intent>
        <expected_diff_shape>file removal.</expected_diff_shape>
        <out_of_scope_check>PASS — matches packet step 4 verbatim.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/server/src/parsers/__tests__/planning-parser.test.ts">
      <action>delete</action>
      <summary>Whole-file deletion (141 lines) — the ONLY suite under src/parsers/__tests__ that imports parsePlanningBacklog / PlanningListOutputSchema; both being removed. Header-read confirms it self-generates tmp fixtures at runtime (tmpdir() + inline writeFile) and does not share any file under __tests__/fixtures/ — clean deletion, zero orphaned fixtures.</summary>
      <estimated_lines>+0 / -141</estimated_lines>
      <edit_plan>
        <intent>This is the vitest-surface item the task explicitly asks to enumerate: it is the unique to-be-deleted-parser test suite in the whole vitest run command (`vitest run src/parsers/__tests__`, per packages/server/package.json's "test" script). Deleting it WITH planning-parser.ts is how server vitest stays green — leaving it in place would fail vitest with a missing-module import error, not merely a lint warning.</intent>
        <expected_diff_shape>file removal.</expected_diff_shape>
        <out_of_scope_check>PASS — matches packet step 6's "server vitest green" requirement; step 4's "+ its __tests__" phrase names this file by implication (glob-confirmed as the only match).</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/server/src/env.ts">
      <action>none (verify-only)</action>
      <summary>Confirmed at HEAD: LOADOUTS_DIR is hard-required via requireEnv() (lines 21-24) and independently backs SESSIONS_EDITS_DIR's default (line 33) — a mechanism fully orthogonal to loadout.* procedures, which never gates on that computed default's *use*, only on the var's presence at startup. EXPORT_BASE_DIR has a soft default (line 28-29, '/tmp/gander-exports') so no startup check depends on it either. Removing loadout.*/export.spawn orphans NEITHER var NOR any startup check.</summary>
      <estimated_lines>+0 / -0</estimated_lines>
      <edit_plan>
        <intent>Verification-only, directly answering the task's item 2 (env-var orphan check).</intent>
        <expected_diff_shape>no diff.</expected_diff_shape>
        <out_of_scope_check>PASS — matches packet out_of_scope ("Do NOT remove/edit env vars") and success_criteria ("env.ts unchanged") exactly.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/server/src/parsers/agent-detail.ts">
      <action>none (verify-only — HARD PROTECTION re-confirmation)</action>
      <summary>Re-confirmed at HEAD: line 16 imports `{ AgentDetailSchema, ConnectivityGraphSchema }` from '@gander-studio/shared'; line 44 (inside `readConnectivityGraphSafe`) calls `ConnectivityGraphSchema.safeParse(parsed)` against a file it reads INLINE from `path.join(ganderRoot, 'docs', 'connectivity-graph.json')` (lines 39-49) — a read fully independent of the connectivity.getGraph tRPC procedure. `assembleAgentDetail` never calls any router procedure. No `parsers/connectivity*.ts` file exists on disk (directory-listing confirmed) — the packet's conditional "the separate connectivity parser, if any" resolves to: none exists; nothing to delete or retain there beyond the procedure itself.</summary>
      <estimated_lines>+0 / -0</estimated_lines>
      <edit_plan>
        <intent>Verification-only, directly answering the task's item 4 (ConnectivityGraphSchema protection re-confirmation).</intent>
        <expected_diff_shape>no diff.</expected_diff_shape>
        <out_of_scope_check>PASS — matches packet's CRITICAL hard-protection instruction exactly; independently corroborated by packages/client/src/components/detail/RelationshipPanel.tsx's own s3-era comments (lines 19-35), which explicitly document "NO connectivity.getGraph call, no trpc query in this file" — the retained client component derives relationship data purely from roster.getAgentDetail's `relationships` field, never from the removed procedure.</out_of_scope_check>
      </edit_plan>
    </change>

  </proposed_changes>

  <contracts_affected>
    <procedures_removed count="6">
      <procedure>loadout.list</procedure>
      <procedure>loadout.save</procedure>
      <procedure>loadout.delete</procedure>
      <procedure>export.spawn</procedure>
      <procedure>planning.list</procedure>
      <procedure>connectivity.getGraph</procedure>
    </procedures_removed>
    <procedures_retained count="18" note="independently counted from router.ts at HEAD: 24 total procedures pre-removal, 6 removed, 18 remain — MATCHES the PM packet's stated '24 → 18' claim exactly.">
      health, agent.list, agent.get, agent.save, skill.list, skill.get, skill.save, hook.list,
      session.list, session.get, session.getStats, session.saveEdit, session.aggregateStats, session.getRaw,
      progression.getLedger, program.getDag, roster.getParty, roster.getAgentDetail
    </procedures_retained>
    <schemas_removed_from_schemas_ts>
      LoadoutSchema, ExportInputSchema, PlanningItemSchema (+type PlanningItem), PlanningSprintSchema (+type PlanningSprint),
      PlanningListInputSchema (+type PlanningListInput), PlanningListOutputSchema (+type PlanningListOutput)
    </schemas_removed_from_schemas_ts>
    <schemas_retained_hard_protected>
      ConnectivityGraphSchema + its full private sub-schema tree (NodeTypeSchema, EdgeTypeSchema, ConnectivityNodeDataSchema,
      ConnectivityEdgeDataSchema, DeadReferenceSchema, OrphanNodeSchema, OverCoupledNodeSchema, MissingEdgeSchema,
      ConnectivityNodeSchema, ConnectivityEdgeSchema) — sole retained importer: packages/server/src/parsers/agent-detail.ts
    </schemas_retained_hard_protected>
    <additional_orphan_the_packet_did_not_enumerate>
      packages/shared/src/types.ts: `export type Loadout = z.infer&lt;typeof LoadoutSchema&gt;` (+ its import specifier) —
      dangling once LoadoutSchema is removed from schemas.ts; not named anywhere in the BE-1 packet.
    </additional_orphan_the_packet_did_not_enumerate>
    <local_router_ts_dead_code_not_in_shared_schemas>
      sanitizeName() helper (loadoutRouter's only caller), ExportResultSchema local const (exportRouter's only caller) —
      both become dead once their router blocks are removed; tsc will NOT error on either (noUnusedLocals is off
      repo-wide per tsconfig.base.json) but standards.md DRY/hygiene expects them pruned in the same edit.
    </local_router_ts_dead_code_not_in_shared_schemas>
  </contracts_affected>

  <assumptions_requiring_verification>
    <item>tsconfig.base.json sets `strict: true` but NOT `noUnusedLocals`/`noUnusedParameters` — confirmed by direct read. This means leftover dead imports/helpers (unlink/copyFile/stat, sanitizeName, ExportResultSchema) would NOT fail `npm run lint`'s tsc passes if the executing agent skips them; their removal is a standards.md DRY requirement, not a lint-gate requirement. Recommend the executing BE agent treat "drop now-unused top-level imports" (packet step 2) as covering the fs/promises and env.js destructure lists, and separately prune sanitizeName/ExportResultSchema as dead local code even though they are not literally "imports."</item>
    <item>Root `npm run lint` runs tsc in strict order: packages/shared → packages/server → packages/client (package.json line 8, confirmed by direct read). This is WHY the packages/shared/src/types.ts gap (see conflicts_detected #1) is a hard, first-pass compile blocker rather than a downstream one.</item>
    <item>router.ts's STUDIO_ROOT header comment (~lines 51-57) reads "Planning and program.md files live here" — becomes half-stale prose once planning.list is removed (program.md remains accurate). No SC in any packet (including DOCS-1, whose scope is CLAUDE.md/DESIGN.md/deferred-work.md only) owns this router.ts comment. Cosmetic-only, non-blocking; flagged so it isn't silently forgotten.</item>
    <item>packages/server/src/parsers/__tests__/program-dag-parser.test.ts lines 197-203 carry a documentation-only trailing comment referencing "router.ts exportRouter.spawn" as a security-guard precedent (no executable assertion). This file is explicitly out_of_scope for BE-1 ("Do NOT touch ... program routers/parsers"). The comment becomes stale prose post-removal but breaks nothing functionally. No packet in this sprint owns cleaning it up — flagged as a known, low-severity residual for a future pass, not a BE-1 blocker.</item>
    <item>packages/client has its own vitest unit-test suite independent of Playwright e2e (`npm test -w @gander-studio/client` → `vitest run`; 8 files under src/**/__tests__/*.test.ts, confirmed via find). NO packet in this entire 7-packet plan (FE-1 through DOCS-1) lists this client-vitest command in its success_criteria — every packet only gates on tsc lint + build + Playwright RUN. Grep-confirmed none of the 8 files reference loadout/export/planning/connectivity by name, so BE-1's removals specifically do not break them. This is a plan-wide observation (not a BE-1 file-scope gap) surfaced because it's adjacent to the task's "vitest surface" verification item — recommend the Critic/PM note it for the re-gate; does not block BE-1.</item>
  </assumptions_requiring_verification>

  <conflicts_detected>
    <conflict severity="HIGH" id="types-ts-scope-gap">
      packages/shared/src/types.ts is a required edit target for this packet (dangling LoadoutSchema import once
      schemas.ts's LoadoutSchema is removed — packages/shared/src/index.ts re-exports both files via `export *`)
      but is absent from BE-1's context_files, absent from its numbered description, and absent from routing_notes'
      "Shared-file serialization" mutation-order table. Left unedited, the FIRST of the 3 sequential `npm run lint`
      tsc passes (packages/shared) fails, which per the packet's own success_criteria ("npm run lint (tsc ×3) clean")
      blocks BE-1 from a clean completion — which transitively blocks DOCS-1 (declared dependency on BE-1).
      RECOMMENDATION: amend BE-1's context_files to add `packages/shared/src/types.ts`, or treat this plan_packet's
      finding as standing authorization for the executing BE agent to edit it as a necessary companion to the
      already-listed schemas.ts (same package, same shared-file-serialization bucket).
    </conflict>
    <conflict severity="LOW" id="router-ts-connectivity-import-precision">
      The packet's "RETAIN ConnectivityGraphSchema" instruction is terse enough that a literal reading could cause
      an over-cautious executing agent to leave router.ts's now-dead import of ConnectivityGraphSchema/type
      ConnectivityGraph (lines 19, 26) in place after deleting connectivityRouter. This is NOT what "retain" means —
      it means retain the schemas.ts DEFINITION and agent-detail.ts's INDEPENDENT import, not every import-site
      repo-wide. RECOMMENDATION: BE-1's completion_packet should explicitly state "router.ts's ConnectivityGraphSchema
      import-site removed (dead after connectivityRouter deletion); schemas.ts's definition + agent-detail.ts's
      independent import both untouched" so the auditor can distinguish a legitimate dead-import prune from a
      protected-schema violation.
    </conflict>
    <ordering_check result="NO CONFLICT FOUND">
      All 4 confirmed repo-wide trpc.* consumers of the removed procedures — ComposePage.tsx (trpc.loadout.list/
      save/delete, line 693/702/718), ExportPage.tsx (trpc.export.spawn, line 143), PlanningPage.tsx
      (trpc.planning.list, line 345), GraphPage.tsx (trpc.connectivity.getGraph, line 95) — are each deleted by a
      packet strictly preceding BE-1 in the serial dependency_order (FE-2, FE-3, FE-3, FE-4 respectively; BE-1 is
      last among code-editing packets). Grep confirms these 4 files are the COMPLETE set of trpc.* consumers
      repo-wide for the 4 removed router namespaces — no 5th consumer exists that any packet fails to cover.
    </ordering_check>
    <ordering_check result="NO CONFLICT FOUND">
      DOCS-1's independently-declared expectation ("Net procedure set 24 → 18") matches my own from-scratch count
      of router.ts at HEAD exactly (24 procedures pre-removal across 11 sub-routers + top-level health; 6 removed;
      18 retained across 8 sub-routers + health) — the packet's arithmetic is disk-accurate.
    </ordering_check>
  </conflicts_detected>

  <split_recommendation>
    <recommend>no</recommend>
    <rationale>
      One cohesive removal unit: one pre-removal scan feeding one coordinated edit set across 3 modified files
      (router.ts, schemas.ts, types.ts) + 2 whole-file deletions (planning-parser.ts + its test), verified by
      2 read-only checks (env.ts, agent-detail.ts). Total estimated diff is ~800 lines removed / 0 lines added —
      pure subtraction, no intermediate state has independent shippable value, and splitting router.ts's edits from
      schemas.ts's edits would leave a broken-compile intermediate with no benefit. Single-agent single-pass scope
      is appropriate; the one required amendment is adding packages/shared/src/types.ts to the context_files
      (conflict HIGH above), not splitting the packet.
    </rationale>
  </split_recommendation>

  <effort_estimate>
    <size>Small</size>
    <lines_removed_total>~795-810 (router.ts ~330-345, schemas.ts ~58-62, types.ts ~2, planning-parser.ts 265 whole-file, planning-parser.test.ts 141 whole-file)</lines_removed_total>
    <lines_added_total>0</lines_added_total>
    <files_touched>5 modified/deleted (router.ts modify, schemas.ts modify, types.ts modify, planning-parser.ts delete, planning-parser.test.ts delete) + 2 verify-only reads (env.ts, agent-detail.ts) = 7 files in scope</files_touched>
    <verification_commands>
      npm run lint (tsc --noEmit ×3: shared, server, client — client pass only succeeds because FE-2/FE-3/FE-CAT/FE-4
      already deleted every client trpc.* consumer per the confirmed serial ordering);
      npm test -w @gander-studio/server (== `vitest run src/parsers/__tests__`, now without planning-parser.test.ts);
      npm run build -w @gander-studio/client
    </verification_commands>
    <single_dispatch_feasible>yes — well within one BE turn, no BLOCK-to-split contingency needed (unlike FE-1's ~50-line net-new nav re-architecture, this packet is pure deletion with a small, mechanically-derivable edit set)</single_dispatch_feasible>
  </effort_estimate>

</plan_packet>
