# Task Decomposition — prog-studio-v2-2026-07-s5-integration (PM)

Source brief: `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-ORCBRIEF-1784347058.md`
Primary requirement source: `docs/programs/prog-studio-v2-2026-07/sprints/integration/orchestrator_brief.md`
Scope: SC-2..SC-5 (residue items 1–4). SC-1 already discharged (human-ratified 2026-07-18).

<task_decomposition task_id="prog-studio-v2-2026-07-s5-integration" agent_count="4">

<task_packets>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- t1 — SC-2 / residue 1: ui Dialog (+ Popover if applicable) safe-focus wrapper -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<task_packet>
  <task_id>prog-studio-v2-2026-07-s5-integration-t1</task_id>
  <assigned_to>frontend-engineer</assigned_to>
  <priority>NORMAL</priority>
  <description>
Build the safe-focus DEFAULT into the shared `ui/` Dialog wrapper so future dialogs with an
async-mounted focus target do not re-derive the s2/s3 base-ui focus defect, then migrate the sole
consumer (`ReviseSpecAction.tsx`) to consume the wrapper's default instead of its inline copy.

**Verified-on-disk ground facts (PM read all files this turn — cite these, do not re-derive):**
- `packages/client/src/components/ui/dialog.tsx` is 98 lines. `DialogContent` (lines 30–51) is a
  `forwardRef` that spreads `...props` straight onto `<DialogPrimitive.Popup>`. It has ZERO
  `initialFocus` / `focusOnReady` / `?? false` handling today — base-ui's default open-focus
  behavior is fully in effect (grep for `initialFocus` in dialog.tsx returns nothing).
- Reference safe-focus implementation lives INLINE in `ReviseSpecAction.tsx`:
    * line 179 — `initialFocus={() => textareaRef.current ?? false}` passed to `<DialogContent>`.
    * line 180 — `finalFocus={triggerRef}`.
    * lines 97, 99–103, 105–116 — the deterministic post-mount fallback: `hasFocusedOnOpenRef`
      (ref, line 97), a reset `useEffect` on `open` (99–103), and a `useLayoutEffect`
      (105–116) that focuses `textareaRef.current` exactly once per open when
      `open && !isLoading && !loadError && !hasFocusedOnOpenRef.current && textareaRef.current`.
    * The t3-rem2 comment (lines 85–96) documents WHY: base-ui resolves `initialFocus` on a single
      synchronous microtask right after open, BEFORE the async `trpc.agent.get/skill.get` query
      resolves and the `<Textarea>` mounts, so `textareaRef.current` is null on that tick and
      base-ui falls back to the first tabbable element (Cancel). The `useLayoutEffect` is the
      deterministic path that focuses the textarea once it actually exists.
- Consumer census (PM grep this turn, `from '@/components/ui/dialog'` / `ui/popover'` under
  `packages/client/src`): `ui/dialog` has EXACTLY ONE consumer — `ReviseSpecAction.tsx:12`.
  `ui/popover` (`packages/client/src/components/ui/popover.tsx`, 60 lines, `PopoverContent`
  forwards props to `PopoverPrimitive.Popup`, no focus handling) has ZERO consumers.

**Dialog wrapper (required):** Add a hard-default to the `ui/dialog` wrapper that reproduces the
reference pattern so a caller gets safe focus for free:
  (a) a function-form `initialFocus` DEFAULT resolving `<focus-target-ref>.current ?? false` when
      the caller supplies a focus-target ref and does not pass an explicit `initialFocus`;
  (b) an OPTIONAL post-mount `focusOnReady` mechanism (the deterministic `useLayoutEffect` +
      once-per-open guard) that focuses the target once a caller-supplied "ready" condition is
      true — encapsulating the boilerplate currently inlined at ReviseSpecAction 97/99–103/105–116.
You own the exact prop API and file placement (a new focus hook/helper co-located with the wrapper
is acceptable). The behavior contract, not the prop names, is what SC-1a/SC-1b check.

**ReviseSpecAction migration (required):** Migrate `ReviseSpecAction.tsx` to consume the wrapper's
default-focus API. The inline `initialFocus={() => textareaRef.current ?? false}` (line 179) and the
hand-rolled `hasFocusedOnOpenRef` / reset-effect / `useLayoutEffect` focus block (97, 99–103,
105–116) must be REPLACED by the wrapper API, not left duplicated alongside it. Observable behavior
(cold-open focus lands on the textarea once loaded; `finalFocus` returns to the trigger; focus is
not yanked mid-edit after a save) must be preserved.

**Popover (decision-with-evidence — NOT a forced code change):** `ui/popover` has zero consumers
(grep-verified above), so no async-focus Popover consumer exists to protect today. Do EITHER:
  (i) add the SAME default-focus handling to `popover.tsx` symmetrically (future-proofing), OR
  (ii) record an explicit evidence-backed ACCEPT in your ui_packet: cite the zero-consumer grep and
       state that Popover safe-focus is not-currently-applicable and is deferred until a Popover
       gains an async-mounted focus target.
Both discharge SC-2's "and Popover if applicable" clause. Do not invent a speculative Popover
consumer to justify code.
  </description>
  <success_criteria>
SC-1a (Dialog default present — locked-value grep, verified-on-disk baseline):
  `grep -c 'initialFocus' packages/client/src/components/ui/dialog.tsx` >= 1  (baseline = 0, PM-read)
  AND the wrapper defaults `initialFocus` to a function-form resolving `?? false`
  (`grep -c '?? false' packages/client/src/components/ui/dialog.tsx` >= 1, baseline = 0)
  when a focus-target ref is supplied without an explicit `initialFocus`.
SC-1b (focusOnReady present): the wrapper exposes an optional post-mount focus mechanism (a
  `useLayoutEffect`-based once-per-open focus keyed on a caller "ready" condition) — evidenced by
  the wrapper source containing the deterministic focus effect (auditor reads the wrapper).
SC-1c (consumer migrated): `ReviseSpecAction.tsx` no longer carries BOTH the inline
  `initialFocus={() => textareaRef.current ?? false}` string AND a local `hasFocusedOnOpenRef`
  focus `useLayoutEffect`; instead it passes the focus target + ready condition to the wrapper.
  Mechanical: `grep -c 'hasFocusedOnOpenRef' packages/client/src/components/detail/ReviseSpecAction.tsx`
  == 0 after migration (baseline = 3 occurrences, PM-read lines 97/110/114), replaced by the wrapper API.
SC-1d (Popover clause discharged): EITHER popover.tsx gains the same default-focus handling
  (`grep -c 'initialFocus' packages/client/src/components/ui/popover.tsx` >= 1), OR the ui_packet
  records the zero-consumer ACCEPT with the grep citation.
SC-1e (e2e — baseline-relative, NOT absolute): running the e2e corpus from `packages/client`,
  ZERO NEW regressions vs the s5 baseline artifacts
  (`.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-green.txt` /
  `...-baseline-red.txt`): any spec listed green in the baseline stays green; a spec already red in
  the baseline is not a regression. In particular the s3 absorption suite
  `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` passes at its
  baseline-green count (SC-2 target: 8/8) and `prog-studio-vision-s1-contrast-smoke.spec.ts` stays
  at its baseline-green count. (Exact baseline counts are READ FROM the artifacts at audit time —
  not hardcoded here; the baseline was in-progress at plan time.)
SC-1f (lint + build): the canonical 3-package typecheck passes —
  `tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json`
  — AND `npm run build -w @gander-studio/client` succeeds with no new Vite chunk-size warning.
  </success_criteria>
  <context_files>
packages/client/src/components/ui/dialog.tsx  (98 lines — wrapper target; verified-on-disk)
packages/client/src/components/ui/popover.tsx  (60 lines — Popover decision target; verified-on-disk)
packages/client/src/components/detail/ReviseSpecAction.tsx  (reference impl + migration target; verified-on-disk)
DESIGN.md  (repo root, refreshed 2026-07-11 — mandatory for FE per constraint)
.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-green.txt  (s5 baseline, read at audit time)
.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-red.txt  (s5 baseline, read at audit time)
  </context_files>
  <dependencies>NONE (Wave 1)</dependencies>
  <out_of_scope>
EXPLICITLY OUT OF SCOPE:
- Do NOT introduce new tRPC procedures, Zod schema changes, or new routes (sprint constraint).
- Do NOT change ReviseSpecAction's save/load logic, the revise-spec-buffer reducer, or any dialog
  visual styling / FF7 tokens — this is a focus-behavior refactor only.
- Do NOT invent a Popover consumer to justify Popover code; zero consumers exist.
- Do NOT touch RelationshipPanel.tsx, AppShell.tsx, router.ts, program-dag-parser.test.ts,
  v2-design-spec.md, or deferred-work.md — those belong to t2/t3/t4.
- Do NOT relabel any pre-existing e2e red as "pre-existing" without the baseline-bisect receipt
  discipline (standards.md → Verification & SC Authoring); the s5 baseline artifacts are the control.
  </out_of_scope>
  <estimated_new_lines>~55 (wrapper focus hook/default ~35–45 added to dialog.tsx or a co-located helper; ReviseSpecAction migration is roughly net-neutral-to-negative as the inline boilerplate moves into the wrapper). Under 100; whole packet retained.</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>The wrapper's default-focus API (prop name(s) + the function-form initialFocus default + the focusOnReady mechanism) described.</item>
      <item>Confirmation ReviseSpecAction migrated: inline initialFocus + hasFocusedOnOpenRef block removed, replaced by wrapper API.</item>
      <item>Popover decision: (i) symmetric popover.tsx support OR (ii) evidence-backed ACCEPT citing the zero-consumer grep.</item>
      <item>e2e result phrased baseline-relative vs the s5 baseline artifacts, with the s3-drilldowns suite count called out.</item>
      <item>lint x3 + client build result.</item>
    </must_contain>
    <must_not_contain>
      <item>New tRPC procedures, Zod schemas, or routes.</item>
      <item>Raw hex color values or FF7-token edits (behavior-only refactor).</item>
      <item>An absolute "full e2e suite green" claim (must be baseline-relative).</item>
      <item>A "pre-existing failure" label without a stash-A/B baseline receipt.</item>
    </must_not_contain>
    <success_signal>dialog.tsx carries the function-form initialFocus default (`?? false` present); ReviseSpecAction no longer references hasFocusedOnOpenRef; s3-drilldowns suite green at 8/8; zero NEW regressions vs s5 baseline; lint x3 + client build pass.</success_signal>
  </output_expected>
</task_packet>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- t2 — SC-3 / residue 2: RelationshipPanel half-width legibility decision       -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<task_packet>
  <task_id>prog-studio-v2-2026-07-s5-integration-t2</task_id>
  <assigned_to>frontend-engineer</assigned_to>
  <priority>NORMAL</priority>
  <description>
Verify `RelationshipPanel.tsx` renders legibly at HALF width (it sits inside a `md:grid-cols-2`
half-width cell on AgentDetailPage; its layout constants were tuned when it was full width and were
never pixel-inspected at half width — p12's audit only confirmed a node+edge structurally). This is
a DECISION-WITH-EVIDENCE task: it legitimately ends in EITHER a constant re-tune OR a recorded
explicit ACCEPT. Do not force a code change.

**Verified-on-disk ground facts (PM read the whole file this turn — cite, do not re-derive):**
- Current layout constants in `packages/client/src/components/detail/RelationshipPanel.tsx`:
    * `RELATIONSHIP_NODE_WIDTH = 180`   (line 41)
    * `NODE_HORIZONTAL_GAP = 220`       (line 42)
    * `NODE_VERTICAL_GAP = 76`          (line 43)
    * `CANVAS_HEIGHT_PX = 240`          (line 44)
- The ReactFlow canvas uses `fitView` (line 211), so the star-fan graph auto-scales to fit the
  container. At half width, a wide `NODE_HORIZONTAL_GAP` (220) + node width (180) forces fitView to
  zoom OUT, which is the specific mechanism that can shrink node labels below legibility — that is
  the thing to inspect.
- RF v12 GOTCHA (documented in the file header, lines 26–35): custom nodes MUST keep BOTH a target
  `<Handle>` (Position.Left) and a source `<Handle>` (Position.Right) or edges silently fail to
  render. A re-tune MUST NOT remove or relocate these Handles.

**Task:** Load AgentDetailPage in the running dev environment (Vite :5173 / API :3001, both up per
the brief) for an agent that HAS relationships, observe RelationshipPanel at the `md:grid-cols-2`
half-width breakpoint (>= 768px viewport so the two-column layout is active), and capture evidence
(a screenshot AND/OR measured rendered node-box + label dimensions at half width). Then decide:
  - RE-TUNE: adjust ONLY the layout constants above (e.g. reduce `NODE_HORIZONTAL_GAP` and/or
    `RELATIONSHIP_NODE_WIDTH` so fitView does not over-shrink), keep the Handles intact, and capture
    re-inspection evidence showing improved legibility; OR
  - ACCEPT: record an explicit accept with the evidence artifact showing labels are already legible
    at half width (node label text readable, confidence badge/legend readable).
  </description>
  <success_criteria>
SC-2a (decision recorded): the ui_packet states DECISION = RETUNE or ACCEPT, unambiguously.
SC-2b (evidence cited): the ui_packet cites a concrete evidence artifact — a screenshot path under
  `.claude/tasks/outputs/` OR measured rendered dimensions (node-box px width + label font
  legibility at the half-width breakpoint). A bare assertion with no artifact FAILS this SC.
SC-2c (if RETUNE): `git diff packages/client/src/components/detail/RelationshipPanel.tsx` changes
  ONLY the four layout constants (lines 41–44) — header-safe grep:
  `git diff HEAD -- packages/client/src/components/detail/RelationshipPanel.tsx | grep -c '^+[^+]'`
  equals the number of constant lines re-tuned, and `... | grep -c '^-[^-]'` equals the same count;
  no `<Handle>`, JSX, helper, or edge-building line is in the diff. If DECISION = ACCEPT, the diff is
  empty (`git diff --quiet -- .../RelationshipPanel.tsx`).
SC-2d (regressions — only if RETUNE): lint x3 (canonical 3-package tsc) + `npm run build -w
  @gander-studio/client` pass, and ZERO NEW e2e regressions vs the s5 baseline artifacts
  (`...-e2e-baseline-green.txt` / `...-red.txt`). If DECISION = ACCEPT with no code change, note
  that lint/build/e2e are unaffected (no diff) — no re-run required.
  </success_criteria>
  <context_files>
packages/client/src/components/detail/RelationshipPanel.tsx  (299 lines — verified-on-disk; constants at 41–44, fitView at 211, Handles at 149/187)
DESIGN.md  (repo root, refreshed 2026-07-11 — mandatory for FE)
.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-green.txt  (only if RETUNE)
.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-red.txt  (only if RETUNE)
  </context_files>
  <dependencies>NONE (Wave 1 — file-disjoint from t1/t3/t4)</dependencies>
  <out_of_scope>
EXPLICITLY OUT OF SCOPE:
- Do NOT remove, relocate, or restyle the `<Handle>` elements (RF v12 edge-render gotcha).
- Do NOT change the star-layout ALGORITHM, edge/label styling, the confidence legend, or
  `formatTargetLabel` / `buildRelationshipGraph` logic — a re-tune touches ONLY the four layout
  constants at lines 41–44.
- Do NOT change AgentDetailPage's `md:grid-cols-2` grid itself (that is the layout contract, not
  this panel's concern).
- Do NOT touch dialog.tsx / ReviseSpecAction (t1), the hygiene files (t3), or docs (t4).
- Do NOT force a code change if the ACCEPT evidence shows legibility is already adequate.
  </out_of_scope>
  <estimated_new_lines>0 (ACCEPT) to ~4 (RETUNE — four constant re-values). Under 100.</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>DECISION = RETUNE | ACCEPT (unambiguous).</item>
      <item>Evidence artifact citation (screenshot path or measured half-width dimensions).</item>
      <item>If RETUNE: old→new constant values + confirmation Handles/JSX untouched + lint/build/e2e-baseline result.</item>
    </must_contain>
    <must_not_contain>
      <item>A decision with no evidence artifact.</item>
      <item>Any diff outside the four layout constants (if RETUNE).</item>
      <item>Removal/relocation of `<Handle>` elements.</item>
    </must_not_contain>
    <success_signal>ui_packet carries DECISION + evidence artifact; if RETUNE, diff confined to lines 41–44 and lint/build/e2e-baseline green; if ACCEPT, zero diff.</success_signal>
  </output_expected>
</task_packet>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- t3 — SC-4 / residue 3: hygiene comment sweep + dir-enumeration + verify-absent -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<task_packet>
  <task_id>prog-studio-v2-2026-07-s5-integration-t3</task_id>
  <assigned_to>frontend-engineer</assigned_to>
  <priority>NORMAL</priority>
  <description>
Mechanical hygiene sweep (one packet, single "stale-comment" fix class — sanctioned by the brief's
OVERSCOPED exception to enumerate all four cited comment locations in one packet). Correct four
stale comments, ENUMERATE deletion targets for ORC (do NOT delete), and VERIFY-ABSENT the
non-existent scratch files.

**DELETION-RAIL ROUTING (MANDATORY — do NOT run `rm` / `find -delete` / `node -e fs.*` / any
filesystem-delete side-door).** The `rm` deny-rail + standards.md §Security Baseline
(deletion-rail integrity, s4 §6 G2 provenance) forbid side-doors. Your job is to ENUMERATE deletion
targets in this packet's output; ORC executes the removals post-enumeration (`rmdir` for empty
dirs). If any enumeration or edit is permission-denied, SURFACE it in your packet — never route
around it.

**(A) Stale-comment corrections — four cited locations (ORC-verified ground facts, brief item 6;
NOT PM-read this turn — READ each file's current text FIRST, then correct):**
  a. `packages/client/src/AppShell.tsx` (comment ~lines 6–9): currently claims the 9-tab
     `BottomTabBar` "stays mounted as fallback nav this packet (FE-1b retires it…)". STALE post-FE-1b:
     `BottomTabBar` is now the `<640px` rail form (per CLAUDE.md §Surfaces — "Below 640px it folds
     into BottomTabBar"), the 9-tab fallback is retired. Rewrite the comment to describe the shipped
     reality (BottomTabBar = the `<640px` fold of the same RAIL_ITEMS nav, not a retired 9-tab
     fallback).
  b. `packages/server/src/parsers/__tests__/program-dag-parser.test.ts` (comment ~line 197–203):
     says "the actual guard is in router.ts exportRouter.spawn". STALE — `exportRouter.spawn` was
     removed in s4 BE-1. Correct/remove the reference so it no longer cites `exportRouter.spawn`.
  c. `docs/v2-vision/v2-design-spec.md` (line ~324): SubmenuRail `aria-label="Party screen submenus"`.
     STALE — the shipped aria-label is `"Main navigation"` (CLAUDE.md §Surfaces). Correct to the
     shipped value.
  d. `packages/server/src/router.ts` (STUDIO_ROOT comment ~lines 45–47): says "Planning and
     program.md files live here". The "Planning" reference is STALE (`planning.list` retired in s4);
     `program.md` files remain live via `program.getDag`. Correct the comment so it references only
     the live `program.md` role, not "Planning".

**(B) Deletion-target ENUMERATION for ORC (do NOT delete — list only):**
  - THREE confirmed-empty dirs (ORC-verified ls, brief item 4):
      `packages/client/src/components/browse/`
      `packages/client/src/components/edit/`
      `packages/client/src/components/graph/`
    (NOTE: the brief's deletion-rail paragraph says "the two empty dirs" but ground-fact item 4 and
    the skein residue both enumerate THREE — browse/edit/graph. Enumerate all THREE; the "two" is a
    slip. See risk_flags.) These are empty dirs (git does not track empty dirs) → ORC removes via
    `rmdir`; there are no tracked files to `git rm`.
  - If you discover any OTHER in-scope debris while sweeping, enumerate it too (path + why + tracked?
    so ORC picks `git rm` vs `rmdir`). Do not expand scope beyond genuine debris.

**(C) VERIFY-ABSENT (do NOT invent a deletion):**
  - `quickcheck.mjs` / `quickcheck2.mjs` DO NOT EXIST anywhere in the repo (ORC-verified repo-wide
    find, brief item 5). RECORD the verify-absent evidence
    (`find . -name 'quickcheck*.mjs'` returns nothing) in your packet. Do NOT author a deletion for
    files that do not exist.
  </description>
  <success_criteria>
SC-3a (AppShell comment corrected — locked-value grep): after edit, the AppShell.tsx header comment
  no longer describes BottomTabBar as a retired "9-tab" fallback nav. Mechanical:
  `grep -c '9-tab' packages/client/src/AppShell.tsx` == 0 (agent confirms this exact stale token,
  read from the current file, is the one being removed; if the current phrasing differs, agent
  states the exact removed phrase in the packet). Corrected comment describes the `<640px` fold.
SC-3b (test comment corrected — locked-value grep, clean token):
  `grep -c 'exportRouter.spawn' packages/server/src/parsers/__tests__/program-dag-parser.test.ts` == 0.
SC-3c (design-spec comment corrected — locked-value grep, clean token):
  `grep -c 'Party screen submenus' docs/v2-vision/v2-design-spec.md` == 0, and the corrected line
  references `Main navigation`.
SC-3d (router comment corrected — locked-value grep): the STUDIO_ROOT comment no longer references
  "Planning". Mechanical: `grep -c 'Planning and program.md' packages/server/src/router.ts` == 0
  (agent confirms the exact current stale phrase read from the file); corrected comment references
  only the live program.md role.
SC-3e (enumeration present): the completion_packet enumerates the THREE empty dirs
  (browse/edit/graph) as `rmdir` targets for ORC, plus any additional debris found, each tagged
  tracked (git rm) vs empty-dir (rmdir). No `rm`/`find -delete`/fs-API deletion was performed by the
  agent (packet contains no such command output).
SC-3f (verify-absent recorded): the packet records `find . -name 'quickcheck*.mjs'` (or equivalent)
  returning nothing, matching ORC ground-fact item 5. No deletion authored for the non-existent files.
SC-3g (post-ORC-removal state — checked at GATE-AUDIT, AFTER GATE-ORC-DELETE): the three enumerated
  dirs are absent — `ls packages/client/src/components/` shows no `browse/`, `edit/`, `graph/`.
SC-3h (no regression from comment/dir edits): lint x3 (canonical 3-package tsc) + `npm run build -w
  @gander-studio/client` pass (comments are ignored by tsc, so this is a guard that no accidental
  code change slipped in), and ZERO NEW e2e regressions vs the s5 baseline artifacts.
  </success_criteria>
  <context_files>
packages/client/src/AppShell.tsx  (comment ~6–9 — ORC-verified stale, NOT PM-read; read current text first)
packages/server/src/parsers/__tests__/program-dag-parser.test.ts  (comment ~197–203 — ORC-verified stale)
docs/v2-vision/v2-design-spec.md  (line ~324 — ORC-verified stale)
packages/server/src/router.ts  (STUDIO_ROOT comment ~45–47 — ORC-verified stale)
DESIGN.md  (repo root, refreshed 2026-07-11 — carried for FE per constraint; not itself edited)
.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-green.txt
.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-red.txt
  </context_files>
  <dependencies>NONE for the agent's work (Wave 1, file-disjoint). SC-3g is verified at GATE-AUDIT, which runs after GATE-ORC-DELETE.</dependencies>
  <out_of_scope>
EXPLICITLY OUT OF SCOPE:
- Do NOT run any deletion command (`rm`, `find -delete`, `node -e fs.unlink/rm`, `rmdir` by the
  agent). ENUMERATE only; ORC executes removals. Surface any permission denial — never side-door it.
- Do NOT change any CODE at the comment sites — correct comment TEXT only. No logic, no test
  assertions, no schema, no procedures.
- Do NOT invent a deletion for `quickcheck{,2}.mjs` — they do not exist; verify-absent only.
- Do NOT edit `/home/jhber/projects/gander/**` — the guarded-push contradiction (t4/residue 4b) is
  cross-repo flag-only and is NOT this packet.
- Do NOT touch dialog.tsx/ReviseSpecAction (t1), RelationshipPanel.tsx (t2), or deferred-work.md (t4).
  </out_of_scope>
  <estimated_new_lines>~0 net (four in-place comment rewrites; no additions). Under 100.</estimated_new_lines>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>Four corrected comments, each with the exact stale phrase removed and the corrected text, per file.</item>
      <item>Enumeration of the THREE empty dirs (browse/edit/graph) as rmdir targets for ORC + any additional debris.</item>
      <item>Verify-absent evidence for quickcheck{,2}.mjs.</item>
      <item>lint x3 + client build result; e2e baseline-relative note.</item>
    </must_contain>
    <must_not_contain>
      <item>Any agent-performed deletion command output (rm/find-delete/fs-API/rmdir).</item>
      <item>Code/logic/test-assertion changes at the comment sites.</item>
      <item>An authored deletion for the non-existent quickcheck files.</item>
      <item>Any edit under /home/jhber/projects/gander/.</item>
    </must_not_contain>
    <success_signal>All four stale tokens grep to 0 in their files; three empty dirs enumerated for ORC; quickcheck verify-absent recorded; lint x3 + build pass; zero NEW e2e regressions.</success_signal>
  </output_expected>
</task_packet>

<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- t4 — SC-5 / residue 4: deferred-work ledger row + cross-repo reflect flag     -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<task_packet>
  <task_id>prog-studio-v2-2026-07-s5-integration-t4</task_id>
  <assigned_to>frontend-engineer</assigned_to>
  <priority>NORMAL</priority>
  <description>
Two documentation actions in `docs/deferred-work.md` (gander-studio-alpha, in-scope to edit), plus a
FLAG-ONLY handoff for a cross-repo item that must NOT be fixed here.

**Verified-on-disk ground facts (PM read `docs/deferred-work.md` this turn):** the ledger uses
per-sprint `##` section headers with `###` entry headers keyed `DEFERRED-<TAG>`, and a
**Source / What it is / Why deferred / Schedule as** body block (see e.g. DEFERRED-006 lines 17–22,
DEFERRED-V2S4-1 lines 150–155). Match that existing format for the new row.

**(A) Add the party-stats Accuracy family-grouping approximation row (SC-5 required).** Add a
deferred-work entry documenting the accepted approximation: the party-stats **Accuracy** metric
groups by **sprintRoot family**, and family grouping can cross-resolve a same-role FAIL from task A
with a PASS from task B — a documented accepted approximation, currently UNLEDGERED. Give it a stable
tag (e.g. `DEFERRED-V2S1-3` or `DEFERRED-ACCURACY-FAMILY` — pick a non-colliding tag; the ledger's
existing tags are DEFERRED-001..006, -P7-1, -P9-1, -P10-1, -V2S1-1/2, -V2S2-1/2, -V2S3-1/2,
-V2S4-1) under the appropriate sprint section (origin s1), with the Source/What/Why/Schedule block.
  - OPTIONAL per the skein brief: cross-reference residue item 1 (the ui safe-focus wrapper) only if
    t1 was NOT executed. t1 IS in scope this sprint, so this optional cross-reference is NOT needed —
    do not add it (t1 closes the item in code).

**(B) FLAG-ONLY: guarded-push docs-vs-installed-rail contradiction (SC-5 required, cross-repo, do
NOT fix here).** The guarded-push documentation vs. the installed push rail have a contradiction that
belongs to the gander-side reflect/agent-improvement pass (it is cross-repo; the fix lives in
`/home/jhber/projects/gander/**`, which this sprint must NOT edit). RECORD a durable, clearly-marked
handoff flag so the gander reflect pass (which PULLs sibling-project artifacts as read-only evidence)
can pick it up. Add a clearly-labeled subsection to `docs/deferred-work.md` — e.g. a
`## Cross-repo reflect-pass intake flags` section — containing a one-entry flag:
  `FLAG (cross-repo, do-not-fix-here): guarded-push docs-vs-installed-rail contradiction — owned by
  the gander-side reflect/agent-improvement pass; surfaced from prog-studio-v2-2026-07-s5-integration
  (residue 4b). Not editable from gander-studio-alpha.`
This satisfies "flagged in the reflect-pass intake, not edited here." Do NOT open, read-to-edit, or
modify any file under `/home/jhber/projects/gander/`.
  </description>
  <success_criteria>
SC-4a (Accuracy row present — containment check, NOT a count-0 grep since deferred-work.md is an
  append-only historical ledger): after edit, `docs/deferred-work.md` contains a new entry that
  mentions BOTH the party-stats **Accuracy** metric AND **sprintRoot family** grouping cross-resolving
  a same-role FAIL/PASS across tasks. Mechanical: `grep -ci 'accuracy' docs/deferred-work.md` >= 1
  AND the new entry contains "sprintRoot family" (or "family grouping") + "cross-resolve" (or
  "cross-resolves") — auditor confirms the new `### DEFERRED-...` block exists with the
  Source/What/Why/Schedule format and a non-colliding tag.
SC-4b (reflect-pass flag present — containment check): `docs/deferred-work.md` contains the
  cross-repo handoff flag. Mechanical: `grep -ci 'guarded-push' docs/deferred-work.md` >= 1 AND the
  flag line contains "cross-repo" AND "do-not-fix-here" (or "not editable"/"reflect-pass intake").
SC-4c (no gander edit — scope containment): `git status` / `git diff` shows ZERO changes under
  `/home/jhber/projects/gander/` and no new files there; the only file changed by this packet is
  `docs/deferred-work.md`. Mechanical: `git diff --name-only HEAD` for this packet lists only
  `docs/deferred-work.md`.
SC-4d (optional cross-ref NOT added): the packet does NOT add the residue-1 cross-reference (t1 is in
  scope). Auditor confirms no "not executed" cross-ref to the safe-focus wrapper was added.
  </success_criteria>
  <context_files>
docs/deferred-work.md  (177 lines — verified-on-disk; format model at DEFERRED-006 lines 17–22 and DEFERRED-V2S4-1 lines 150–155)
  </context_files>
  <dependencies>NONE (Wave 1 — sole editor of deferred-work.md; no shared-file race with t1/t2/t3).</dependencies>
  <out_of_scope>
EXPLICITLY OUT OF SCOPE:
- Do NOT edit, read-to-edit, or create any file under `/home/jhber/projects/gander/**` — the
  guarded-push contradiction is FLAG-ONLY and cross-repo.
- Do NOT attempt to FIX the guarded-push contradiction (no rail edits, no docs reconciliation) — flag
  only, per SC-5.
- Do NOT add the optional residue-1 cross-reference (t1 executes the item this sprint).
- Do NOT re-tune, delete, or reformat existing deferred-work.md entries — APPEND the new row + flag
  section only (historical ledger; preserve prior rows verbatim).
- Do NOT touch dialog.tsx/ReviseSpecAction (t1), RelationshipPanel.tsx (t2), or the hygiene files (t3).
  </out_of_scope>
  <estimated_new_lines>~18 (one DEFERRED entry block + a short cross-repo flag subsection). Under 100.</estimated_new_lines>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>The new Accuracy family-grouping deferred-work entry (tag + Source/What/Why/Schedule block), quoted.</item>
      <item>The cross-repo reflect-pass guarded-push flag entry, quoted.</item>
      <item>Confirmation zero files under /home/jhber/projects/gander/ were touched (git diff --name-only).</item>
    </must_contain>
    <must_not_contain>
      <item>Any edit/creation under /home/jhber/projects/gander/.</item>
      <item>An attempt to fix (not merely flag) the guarded-push contradiction.</item>
      <item>The optional residue-1 cross-reference.</item>
      <item>Reformatting/deletion of existing ledger entries.</item>
    </must_not_contain>
    <success_signal>deferred-work.md carries the Accuracy family-grouping row + the cross-repo guarded-push flag; git diff --name-only lists only docs/deferred-work.md.</success_signal>
  </output_expected>
</task_packet>

</task_packets>

<dependency_order>
Wave 1 (all four PARALLEL — file-disjoint, no shared-file writes, no inter-task dependency):
  - prog-studio-v2-2026-07-s5-integration-t1  (FE — Dialog/Popover safe-focus wrapper + ReviseSpecAction migration)
  - prog-studio-v2-2026-07-s5-integration-t2  (FE — RelationshipPanel half-width decision-with-evidence)
  - prog-studio-v2-2026-07-s5-integration-t3  (FE — hygiene comment sweep + dir enumeration + verify-absent)
  - prog-studio-v2-2026-07-s5-integration-t4  (FE — deferred-work ledger row + cross-repo reflect flag)

GATE-ORC-DELETE (ORC-executed, after t3 returns; deletion-rail routing):
  - ORC executes `rmdir packages/client/src/components/{browse,edit,graph}` for the THREE dirs t3
    enumerated (empty dirs; no `git rm` needed). ORC surfaces any denial to the human. No agent
    performs the deletion.

GATE-AUDIT (code-auditor, after Wave 1 + GATE-ORC-DELETE):
  - SA + QA + SX over all four packets' deliverables. Verifies SC-3g (post-removal dir absence) here,
    AFTER GATE-ORC-DELETE. All SCs PASS required to close (gate enforcement is non-negotiable).

Note: the Critic gate runs on THIS decomposition (pre-execution, ORC-orchestrated) BEFORE Wave 1
dispatch — it is not a task packet.
</dependency_order>

<routing_notes>

<pm_preflight_acknowledgement>
Format: pattern / acknowledged / application. Source: pm-preflight-1784346820.md + brief §PM Preflight Checklist.
All patterns acknowledged; load-bearing ones carry a concrete application, cross-project background/observability
patterns are acknowledged as ORC-side or N/A to a lean, same-session-dispatched docs/FE mop-up (no background
fan-out, no meta-agent spawn, no eval gate, no jidoka in this plan).

-- Sprint-salient (brief-named) --
- G1 (output-path-block drift on RESUME dispatches) / acknowledged / ORC-side: every SPAWN brief this
  sprint must carry the literal `## Output Path` block with a concrete pre-registered timestamp
  (not `{ts}`). PM-side: no resume dispatch is planned; flag to ORC as noted.
- G2 (deny-rail workarounds by deletion-wave agents) / acknowledged / DIRECTLY ADDRESSED: t3 routes ALL
  deletions through ORC — the agent ENUMERATES (browse/edit/graph dirs), ORC executes `rmdir`; t3's
  <out_of_scope> forbids `rm`/`find -delete`/`node -e fs.*`/agent-`rmdir` and mandates surfacing denials.
  This deletion-rail routing IS the structural answer to the s4 §6 G2 recurrence.
- G3 (SubagentStop COMPLETE-miss, validator class) / acknowledged / ORC-side observability: if a
  REQVAL/validator runs, ORC watches for the auto-log miss and backfills. Not PM-actionable.
- G4 (SendMessage-resumed COMPLETEs never auto-log) / acknowledged / ORC-side: no multi-round
  SendMessage resume is planned in this decomposition; ORC backfills any resumed-agent COMPLETE.
- G5 (auditor causal-attribution evidence discipline) / acknowledged / APPLIED to GATE-AUDIT brief:
  any foreign e2e-test failure the auditor labels "pre-existing"/"flake" must carry the baseline-bisect
  receipt against the s5 baseline artifacts (stash A/B), and any carry-forward flag must meet the same
  evidence bar as the finding. t1/t2/t3 SCs are already baseline-relative to remove ambiguity.
- G6 / plan-time-unverified-inherited-fact (a PRECONDITION escaping citation discipline) / acknowledged /
  APPLIED: every structural precondition in every packet is tagged either `verified-on-disk` (PM read
  the file this turn: dialog.tsx, popover.tsx, ReviseSpecAction.tsx, RelationshipPanel.tsx,
  deferred-work.md, the consumer grep) OR `ORC-verified (brief item N), NOT PM-read` (the four stale
  comments, the three empty dirs, quickcheck-absent, the e2e baseline). No packet asserts an
  unqualified inherited fact; t3 additionally instructs the agent to READ each comment's current text
  before editing.

-- Declared recurring tags (recurring_tags frontmatter) --
- output-path-brief-discipline / acknowledged / ORC-side brief hygiene (concrete Output-Path block per spawn).
- subagentstop-complete-miss / acknowledged / ORC-side observability (auto-log miss backfill).
- sendmessage-resume-complete-miss / acknowledged / ORC-side; no resume dispatch planned.
- deny-rail-integrity-positive / acknowledged / t3's deletion-rail routing preserves the rail (enumerate→ORC).
- background-spawn-turn-stall / acknowledged / N/A: these four are foreground same-session Agent-tool
  dispatches, not background fan-out; if ORC uses background spawns it watches for the stall + nudges.
- background-toolset-variance / acknowledged / N/A-to-plan: ORC must attach Read+Grep+Glob to the
  auditor spawn (t3 SCs rely on grep); flag to ORC as an audit-spawn toolset note.
- subagent-fanout-race / acknowledged / N/A: no packet spawns its own helper; each writes one output.
- ghost-tombstone-false-positive / acknowledged / ORC-side: allow output-file write to settle before
  reading COMPLETE state.
- meta-agent-complete-miss / acknowledged / N/A: no meta-agent (this is app-code + docs, not a
  `.claude/` spec edit); the code-auditor spawn is a normal audit, but ORC still watches its COMPLETE.
- eval-run-gate-debt / acknowledged / N/A: no agent/skill spec is behaviorally changed → no eval-run gate applies.
- p-suffix-code-fold / acknowledged / ORC-side: no jidoka planner P-suffix codes in this plan.
- spawn-log-collision / acknowledged / ORC-side: distinct task_ids t1..t4 + distinct pre-registered
  timestamps per spawn prevent expected_output collisions.

-- gander2-p1-genesis / gander-meta-staged-batch-p1 §6 rows (G7–G18) --
- G7 background-spawn-turn-stall, G8 subagent-fanout-race, G9 ghost-tombstone-false-positive,
  G10 meta-agent-complete-miss, G11 background-toolset-variance, G12 amendment-application-by-convention,
  G13 audit-brief Output-Path omission, G14 eval-run-gate-not-enforced, G15 ORC SPAWN-logging defect,
  G16 (positive) deny-rail-held-zero-side-doors, G17 SubagentStop P-suffix fold, G18 run-preflight
  §6-extraction degenerate-descriptions / ALL acknowledged / cross-project background-execution &
  ORC-observability patterns from meta/genesis sprints — none is PM-decomposition-actionable for a
  4-packet foreground docs/FE mop-up. G16 is the POSITIVE precedent t3's deletion-rail routing extends.
  G12 (amendment-by-convention): if this plan is amended, PM will edit the decomposition in place, not
  leave scope in an `<unchanged>` block. G13/G15: ORC brief hygiene (concrete Output-Path + non-colliding
  SPAWN filenames) — flag to ORC as noted.
</pm_preflight_acknowledgement>

<recurring_pattern source="prog-studio-v2-2026-07-s4-retirement.md §6 G2">deny-rail workarounds by deletion-wave agents (3 instances, 1 undisclosed) — AVOIDED: t3 enumerates deletion targets and routes execution to ORC; no agent runs any delete command; denials surfaced not side-doored.</recurring_pattern>
<recurring_pattern source="prog-studio-v2-2026-07-s4-retirement.md §6 G6">plan-time-unverified-inherited-fact (precondition escaped citation) — AVOIDED: every precondition tagged verified-on-disk or ORC-verified-not-PM-read; no unqualified inherited fact.</recurring_pattern>
<recurring_pattern source="pm-preflight recurring_tags">deny-rail-integrity-positive — REINFORCED: this sprint's deletion-rail routing is a positive continuation, not a recurrence of the negative class.</recurring_pattern>

<routing>
- ROSTER NOTE (surfaced per brief's agent_remits instruction): the brief's <agent_remits> block quoted
  ONLY project-manager, critic, frontend-engineer, and code-auditor. frontend-engineer is the sole
  quoted IMPLEMENTER, so all four packets are assigned to it. t3's comment fixes span client
  (AppShell.tsx) + server (router.ts, program-dag-parser.test.ts) + docs (v2-design-spec.md), and t4
  is pure-docs — these touch files outside frontend-engineer's usual client remit. I am NOT asserting
  the remit covers this implicitly: I surface it here. The brief's OVERSCOPED exception explicitly
  sanctions all four comment locations in ONE packet as a single mechanical fix class, and no other
  implementer was quoted. If ORC prefers, it may route t3's server-file comments and/or t4's docs edit
  to a backend/docs owner — the packets are file-disjoint and independently routable. Absent that, FE
  owns all four (mechanical comment/docs edits, no domain logic).
- MERGE OPTION (considered, not taken): the brief permits merging the two doc/comment-only items
  (t3 + t4) into one packet within OVERSCOPED limits. I kept them SEPARATE for single-fix-class audit
  clarity (t3 = stale-comment class + dir-enumeration; t4 = ledger-addition class + cross-repo flag)
  and because they are file-disjoint (zero added critical-path latency from separation). ORC MAY merge
  t3+t4 if it prefers three spawns; both are docs/comment-only and mechanically mergeable.
- CRITIC RELEVANCE: the highest-value Critic challenges for this plan are OVERSCOPED (t3's 4-location
  cross-domain sweep — mitigated by the brief's explicit exception) and SCOPE_DRIFT (t4's cross-repo
  flag must not become a gander edit — mitigated by SC-4c). AUDIT_RISK is low (baseline-relative SCs).
- AUDITOR TOOLSET: attach Read + Grep + Glob to the code-auditor spawn — t3 SCs are grep-based
  (background-toolset-variance guard).
- DESIGN.md: present at repo root (refreshed 2026-07-11). Carried in <context_files> for t1, t2, t3
  (all FE). No new tokens/surfaces introduced (behavior refactor + comment/docs only), so
  design_system_source = DESIGN_MD; no generate-design needed.
- BASELINE ARTIFACTS: suite-green SCs are baseline-relative to
  `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-{green,red}.txt` (ORC
  capturing at HEAD f2164bb; in-progress at plan time). The auditor reads the exact green/red counts
  FROM the artifacts at audit time — the plan does not hardcode them. If the artifacts are not yet
  written when an SC-1e/2d/3h check runs, ORC must confirm capture completed first.
- SHARED-FILE APPEND: no shared-file write races — t4 is the sole editor of deferred-work.md; each of
  t1/t2/t3/t4 writes a disjoint file set. No append serialization needed.
- PRIOR-APPROVED-TASKS: N/A — no sequential single-file wave (all packets file-disjoint, single wave).
- SC-PRECHECK: PM has no Bash; ORC will run `sc-locked-value-consistency` against this decomposition
  and attach `sc-precheck-report.json` before the Critic gate. Locked-value provenance for the
  precheck: SC-1a/1c (dialog.tsx `initialFocus`/`?? false` baseline 0, ReviseSpecAction
  `hasFocusedOnOpenRef` baseline 3) are VERIFIED-ON-DISK (PM read). SC-3b (`exportRouter.spawn`) and
  SC-3c (`Party screen submenus`) are clean unambiguous tokens but ORC-verified-NOT-PM-read (brief item
  6b/6c). SC-3a (`9-tab`) and SC-3d (`Planning and program.md`) are ORC-cited paraphrases NOT PM-read —
  t3 instructs the agent to read the current exact text and state the removed phrase; the grep token
  may need the agent's confirmed exact substring. SC-4a/4b are CONTAINMENT checks (historical-ledger
  exception — deferred-work.md is append-only), not count-0 greps.
</routing>
</routing_notes>

<risk_flags>
1. BRIEF-INTERNAL DISCREPANCY (surfaced): the deletion-rail paragraph says "the two empty dirs" but
   ground-fact item 4 (ls-verified) and the skein residue both enumerate THREE — browse/edit/graph.
   Resolved in favor of the ls-verified THREE (t3 enumerates all three). ORC/human confirm if "two"
   was intentional.
2. LOCKED-VALUE NOT PM-READ (budget): the four stale-comment exact strings (AppShell 9-tab / router
   Planning are paraphrases; program-dag-parser exportRouter.spawn / design-spec "Party screen
   submenus" are clean tokens) are ORC-verified (brief item 6) but NOT PM-read. t3 mitigates by
   requiring the agent to read each file's current text first and state the exact removed phrase; the
   SC greps for the ORC-cited stale token's absence. If the current phrasing differs from the brief's
   paraphrase, the agent's stated exact substring governs.
3. E2E BASELINE IN-PROGRESS: the s5 baseline artifacts were being captured at plan time. All
   suite-green SCs are phrased relative to those artifacts (read at audit time); exact green/red counts
   are NOT hardcoded. If the s3 absorption suite is below 8/8 in the baseline-green file, that is a
   pre-existing condition to surface (SC-2 target 8/8 assumes baseline-green 8/8) — not caused by t1.
4. CROSS-REPO FLAG SCOPE (SCOPE_DRIFT guard): t4's guarded-push flag must be RECORDED in
   gander-studio-alpha (deferred-work.md) only; SC-4c mechanically forbids any edit under
   /home/jhber/projects/gander/. The gander reflect pass PULLs sibling after-actions/docs as read-only
   evidence, so an in-repo flag is the correct handoff channel.
5. POPOVER "IF APPLICABLE" (OVERSCOPED guard): ui/popover has ZERO consumers (grep-verified). t1 does
   NOT force speculative Popover code — the ACCEPT-with-evidence path is sanctioned. Risk: an agent
   over-builds symmetric Popover support; mitigated by SC-1d allowing either path.
6. CROSS-DOMAIN OWNER (routing): t3 (client+server+docs comments) + t4 (docs) assigned to the sole
   quoted implementer (frontend-engineer). Surfaced in <routing> for ORC ratification rather than
   asserting the remit implicitly; ORC may re-route to a backend/docs owner (packets are
   file-disjoint and independently routable).
7. DELETION-GATE ORDERING: SC-3g (empty dirs absent) is only satisfiable AFTER GATE-ORC-DELETE runs.
   The auditor must not FAIL t3 for still-present dirs BEFORE ORC executes the rmdir — the dependency
   order pins GATE-AUDIT after GATE-ORC-DELETE.
8. DIALOG MIGRATION BEHAVIORAL EQUIVALENCE (AUDIT_RISK): t1 replaces ReviseSpecAction's hand-rolled
   deterministic focus block with the wrapper's focusOnReady. The cold-open-lands-on-textarea behavior
   is subtle (async query timing); the s3 absorption suite 8/8 (SC-1e) is the regression guard —
   ensure the auditor actually runs that suite, not just lint/build.
</risk_flags>

</task_decomposition>

<verbatim_deliverable_audit>
Every noun/verb phrase from the human_request + the SC-2..SC-5 requirement set, mapped to a packet,
a deferral, or explicit out-of-scope.

<phrase text="Execute the prog-studio-v2-2026-07 integration mop-up sprint"><addressed task="all (t1–t4)"/></phrase>
<phrase text="PRIMARY REQUIREMENT SOURCE = integration/orchestrator_brief.md Residue Items + Success Criteria"><addressed task="t1–t4 (SC-2→t1, SC-3→t2, SC-4→t3, SC-5→t4)"/></phrase>
<phrase text="SC-1 (SC-5 amendment ratify/reject) is ALREADY DISCHARGED"><out_of_scope reason="human-ratified 2026-07-18, recorded in s4-retirement after-action §Addendum; no code/PM work — excluded per brief scope adjustment"/></phrase>
<phrase text="Remaining scope is exactly SC-2..SC-5 (residue items 1–4)"><addressed task="t1–t4 (one packet per residue item)"/></phrase>
<phrase text="SC-2: ui/ Dialog (and Popover if applicable) wrapper hard-defaulting the safe focus pattern"><addressed task="t1 (SC-1a/1b Dialog default; SC-1d Popover decision-with-evidence)"/></phrase>
<phrase text="function-form initialFocus resolving ref.current ?? false"><addressed task="t1 (SC-1a — `?? false` present in dialog.tsx)"/></phrase>
<phrase text="optional post-mount focusOnReady"><addressed task="t1 (SC-1b — focusOnReady mechanism)"/></phrase>
<phrase text="ReviseSpecAction.tsx migrated to consume it"><addressed task="t1 (SC-1c — hasFocusedOnOpenRef removed, wrapper API consumed)"/></phrase>
<phrase text="existing dialog e2e tests (incl. s3 absorption suite 8/8) stay green"><addressed task="t1 (SC-1e — baseline-relative, s3-drilldowns 8/8)"/></phrase>
<phrase text="SC-3: RelationshipPanel verified legible at half width"><addressed task="t2 (SC-2a/2b decision-with-evidence)"/></phrase>
<phrase text="either re-tuned constants or a recorded explicit accept"><addressed task="t2 (SC-2c RETUNE diff / ACCEPT zero-diff, both evidence-backed)"/></phrase>
<phrase text="SC-4: hygiene sweep — named dirs/files removed"><addressed task="t3 (SC-3e enumeration for ORC; SC-3g post-ORC-removal absence) + GATE-ORC-DELETE"/></phrase>
<phrase text="all four stale comments corrected"><addressed task="t3 (SC-3a AppShell, SC-3b program-dag-parser test, SC-3c v2-design-spec, SC-3d router.ts)"/></phrase>
<phrase text="quickcheck{,2}.mjs (verify-absent, do not invent deletion)"><addressed task="t3 (SC-3f verify-absent recorded)"/></phrase>
<phrase text="empty browse/edit/graph dirs"><addressed task="t3 (SC-3e enumerates THREE dirs) — brief 'two' discrepancy flagged (risk 1)"/></phrase>
<phrase text="npm run lint x3 packages + client build green"><addressed task="t1 SC-1f, t2 SC-2d, t3 SC-3h (canonical 3-package tsc + client build)"/></phrase>
<phrase text="SC-5: docs/deferred-work.md carries the Accuracy-approximation row"><addressed task="t4 (SC-4a containment check)"/></phrase>
<phrase text="party-stats Accuracy family-grouping approximation (sprintRoot family cross-resolves FAIL/PASS)"><addressed task="t4 (SC-4a)"/></phrase>
<phrase text="optionally cross-reference item 1 if not executed"><out_of_scope reason="t1 IS executed this sprint → optional cross-ref not needed; SC-4d confirms it is NOT added"/></phrase>
<phrase text="guarded-push docs-vs-installed-rail contradiction flagged in reflect-pass intake, not edited here"><addressed task="t4 (SC-4b flag present; SC-4c no gander edit) — FLAG-ONLY cross-repo"/></phrase>
<phrase text="Deletion-rail routing: agents enumerate, ORC executes"><addressed task="t3 (deletion-rail routing) + GATE-ORC-DELETE node"/></phrase>
<phrase text="suite-green SCs baseline-relative to s5 baseline artifacts"><addressed task="t1 SC-1e, t2 SC-2d, t3 SC-3h (relative to e2e-baseline-{green,red}.txt)"/></phrase>
<phrase text="7 human-ratified deferrals (DEFERRED-V2S1-1/2, -P9-1, -V2S2-1, -V2S3-1/2, -V2S4-1)"><out_of_scope reason="already ledgered with schedule-as instructions; brief constraint excludes them"/></phrase>
<phrase text="14 gander-side process items"><out_of_scope reason="owned by the gander-repo reflect/agent-improvement pass; not this sprint"/></phrase>
<phrase text="No new tRPC procedures / schema changes / new routes"><addressed task="all packets' out_of_scope forbid procedures/schemas/routes (constraint honored)"/></phrase>
</verbatim_deliverable_audit>

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s5-integration</sprint_id>
  <generated>plan-time (pre-baseline-artifact-completion)</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s5-integration-t1</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t1-FE-*.md</expected_file>
      <blocks>NONE (Wave 1 sibling to t2/t3/t4; feeds GATE-AUDIT)</blocks>
      <receipt_check>
        <item>dialog.tsx carries function-form initialFocus default (`?? false` present)</item>
        <item>ReviseSpecAction no longer references hasFocusedOnOpenRef (migrated to wrapper)</item>
        <item>Popover clause discharged (symmetric support OR zero-consumer ACCEPT with grep citation)</item>
        <item>e2e result baseline-relative (s3-drilldowns 8/8); NOT an absolute "full suite green" claim</item>
        <item>lint x3 + client build pass</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s5-integration-t2</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t2-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>DECISION = RETUNE | ACCEPT (unambiguous)</item>
        <item>Evidence artifact cited (screenshot path or measured half-width dimensions)</item>
        <item>If RETUNE: diff confined to the four layout constants (lines 41–44); Handles intact; lint/build/e2e-baseline green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s5-integration-t3</task_id>
      <agent>FE#3</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t3-FE-*.md</expected_file>
      <blocks>GATE-ORC-DELETE (ORC needs t3's enumeration to rmdir the three dirs)</blocks>
      <receipt_check>
        <item>Four stale tokens grep to 0 in their files (exact removed phrase stated where paraphrased)</item>
        <item>THREE empty dirs (browse/edit/graph) enumerated as rmdir targets for ORC + any extra debris</item>
        <item>quickcheck{,2}.mjs verify-absent recorded; NO authored deletion for them</item>
        <item>NO agent-performed deletion command output (rm/find-delete/fs-API/rmdir)</item>
        <item>lint x3 + build pass; e2e baseline-relative note</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s5-integration-t4</task_id>
      <agent>FE#4</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t4-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>New Accuracy family-grouping deferred-work entry present (containment) with Source/What/Why/Schedule block + non-colliding tag</item>
        <item>Cross-repo guarded-push reflect-pass flag present (containment)</item>
        <item>git diff --name-only lists ONLY docs/deferred-work.md — zero edits under /home/jhber/projects/gander/</item>
        <item>Optional residue-1 cross-ref NOT added</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
