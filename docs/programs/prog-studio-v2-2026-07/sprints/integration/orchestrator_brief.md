# Integration Sprint Orchestrator Brief — prog-studio-v2-2026-07

program_id: prog-studio-v2-2026-07
generated: 2026-07-11T18:10:40Z
generated_by: skein

## Context

The v2 rebuild program delivered all four sibling sprints (data layer → party shell → drill-downs → retirement) with per-sprint human verification, and skein found **all 5 integration seams STITCHED at HEAD `dcfede7`** — no seam repair is required and the shipped app is internally consistent. This brief exists because skein's conservative threshold fired on residue, not on seams: eight small unowned items and one unratified success-criterion amendment survived program close with no owner anywhere. It is a **mop-up and sign-off sprint, not a repair sprint** — the human may legitimately decline it entirely or fold the items into `docs/deferred-work.md` instead of dispatching. Scope discipline: the 7 human-ratified deferrals (DEFERRED-V2S1-1/2, -P9-1, -V2S2-1, -V2S3-1/2, -V2S4-1) are ALREADY ledgered with schedule-as instructions and are NOT in scope here; the 14 gander-side process items in the skein report's third residue table are owned by the planned reflect/agent-improvement pass run from the gander repo and are NOT in scope here.

## Unstitched Seams

None. All 5 seams verified STITCHED with file:line evidence at HEAD — see `docs/programs/prog-studio-v2-2026-07/skein-report.md` § Integration Seam Status.

## Seams Blocked by Upstream Failure

None. All four siblings closed DONE; no seam carries INTEGRATION_NEEDED.

## Drift Items Requiring Resolution

1. **s4 SC-5 amendment sign-off (drift register row 20 — the only open cross-sibling drift).** The brief's SC-5 read "Full e2e suite green"; PM amend1 rewrote it pipeline-internally to "KEEP-suites green (32/32) + zero NEW regressions vs the fresh 115g/67r baseline at `6c58f40`" because the literal SC was unsatisfiable against the ~30%-red legacy corpus (44-red pre-existing floor, classified in `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-BASELINE-red.txt`). REQVAL validated the amended form and the human's 2026-07-11 4.5 walkthrough accepted the delivered state, but the SC rewrite itself was never explicitly human-signed. **Action: present the amendment to the human for explicit ratify/reject — no code work.** If ratified, note it in the s4 after-action addendum trail; the baseline files (`...-BASELINE-{green,red}.txt`, 115g/67r @ `6c58f40`) become the authoritative regression reference for future sprints.

## Residue Items

1. **[medium, FE] ui Dialog/Popover safe-focus wrapper** (origin s3). Build a `packages/client/src/components/ui/` Dialog/Popover wrapper hard-defaulting the safe focus pattern — function-form `initialFocus` resolving `ref.current ?? false`, optional post-mount `focusOnReady`. Reference implementation: FE#8's rem2 fix inside `ReviseSpecAction.tsx`. Today `packages/client/src/components/ui/dialog.tsx` has no `initialFocus` handling, so every future dialog with an async-mounted focus target re-derives the s2/s3 base-ui behavioral-default defect (class went 0-for-2 on prompt-level prevention — this closes it in code).
2. **[low, FE] RelationshipPanel half-width check** (origin s3/p12). RF layout constants in `RelationshipPanel.tsx` (untouched since `54dbef8`) were tuned for full width and now render in a half-width `md:grid-cols-2` cell. p12's audit verified a visible node+edge structurally; pixel-level cramping/legibility inspection was explicitly not done. Re-tune the constants or record an explicit accept.
3. **[low, hygiene] Comment/debris sweep** (origin s4). One packet: delete empty `packages/client/src/components/{browse,edit,graph}/` dirs and pre-existing `quickcheck{,2}.mjs` scratch files; fix stale comments at `AppShell.tsx:6-9` (pre-FE-1b "9-tab fallback" text), `packages/server/src/parsers/__tests__/program-dag-parser.test.ts:197-203` (cites removed `exportRouter.spawn`), `docs/v2-vision/v2-design-spec.md:324` (retired rail aria-label "Party screen submenus"), and the stale `router.ts` STUDIO_ROOT comment.
4. **[low, docs] Two ledger additions** (origin s1). Add `docs/deferred-work.md` rows for (a) the party-stats Accuracy family-grouping approximation (sprintRoot family grouping can cross-resolve a same-role fail from task A with a pass from task B — documented accepted approximation, currently unledgered) and (b) optionally cross-reference item 1 above if not executed. Separately FLAG (do not fix here) the guarded-push docs-vs-installed-rail contradiction to the gander-side reflect pass — it is cross-repo and not this sprint's to edit.

## Success Criteria for Integration Sprint

1. SC-5 amendment explicitly ratified or rejected by the human, decision recorded (drift item 1).
2. A `ui/` Dialog (and Popover if applicable) wrapper exists hard-defaulting the safe focus pattern; `ReviseSpecAction.tsx` migrated to consume it; existing dialog e2e tests (incl. the s3 absorption suite 8/8) stay green (residue 1).
3. RelationshipPanel verified legible at half width with either re-tuned constants or a recorded explicit accept (residue 2).
4. Hygiene sweep complete: named dirs/files removed, all four stale comments corrected; `npm run lint` ×3 packages + client build green (residue 3).
5. `docs/deferred-work.md` carries the Accuracy-approximation row; the guarded-push contradiction is flagged in the reflect-pass intake, not edited here (residue 4).
