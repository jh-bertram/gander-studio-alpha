# Skein Reconciliation Report — prog-studio-v2-2026-07

Generated: 2026-07-11T18:10:40Z
Program manifest: docs/programs/prog-studio-v2-2026-07/program.md
Reconciled at HEAD: `dcfede7` on `feat/studio-sessions-feed-agentstats` (pushed)
Method: 4 sibling readers + 5 seam verifiers (read-only fan-out, run `wf_5b9aedbe-fbe`); every seam claim carries file:line evidence verified at HEAD.

## Executive Summary

All 4 sibling sprints reached DONE with per-sprint human 4.5 verification (s1 2026-07-08; s2 "ok ×3" 2026-07-08; s3 "love the drilldown" 2026-07-10; s4 "okay looks good" 2026-07-11), and **all 5 integration seams are STITCHED** — no seam repair is needed and program success criterion 5 is satisfied. The drift register holds 26 rows, of which 24 are ratified, auditor-upheld, or resolved in-program; the 2 open rows are the s4 SC-5 rewrite (needs explicit human sign-off) and one stale comment. The residue register holds 7 human-ratified deferrals (no action required), 8 small unowned items (1 medium, 7 low), and 14 consolidated gander-side process items already owned by the planned reflect pass. Recommendation: **NEEDS_INTEGRATION** on the skill's conservative threshold — the integration brief is a small, optional mop-up/sign-off packet; "no action needed" is a legitimate human response.

## Sibling Sprint Outcomes

| sprint_id | status | seam_items | drift_items | residue_items |
|---|---|---|---|---|
| prog-studio-v2-2026-07-s1-data-layer | DONE (head `73a78f4`) | 2 (from: seams 1, 2) | 8 | 5 (3 ratified-deferral, 2 unowned) |
| prog-studio-v2-2026-07-s2-party-shell | DONE (head `dbc4b87`; 4.5 confirmed 2026-07-08) | 3 (to: 1; from: 3, 4) | 5 | 2 (2 ratified-deferral) |
| prog-studio-v2-2026-07-s3-drilldowns | DONE (head `44f01d0`; 4.5 confirmed 2026-07-10; post-close p12 amendment `6aa859c`) | 3 (to: 2, 3; from: 5) | 7 | 4 (2 ratified-deferral, 2 unowned) |
| prog-studio-v2-2026-07-s4-retirement | DONE (head `a7e4b96`; 4.5 confirmed 2026-07-11) | 2 (to: 4, 5) | 6 | 4 (4 unowned, all low/cosmetic) |
| *program-wide (gander control plane)* | — | — | — | 14 (all HANDED-OUTSIDE-PROGRAM → reflect pass) |

Ratified deferrals carried by multiple siblings (s4 re-ledgered the s1/s2/s3 items) are counted once, at their origin sibling.

## Integration Seam Status

| seam_id | from_sprint | to_sprint | status | notes |
|---|---|---|---|---|
| s1-to-s2-party-schema | s1-data-layer | s2-party-shell | **STITCHED** | `PartyStatsSchema` envelope `{members, diagnostics, activityAnchor}` at `packages/shared/src/schemas.ts:345-356`; `roster.getParty` bound `.output(PartyStatsSchema)` at `router.ts:448-452`; recency-desc sort at `parsers/party-roster.ts:127-134`; s2 consumes `members` (`PartyPage.tsx:250-252`) AND `diagnostics` (data-quality footnote, `PartyPage.tsx:234-237,262-267`). Nullable raw/normalized + `reason` is an additive data-honesty extension, consumed cleanly as N/A (`PartyMemberCard.tsx:51-54`). |
| s1-to-s3-agentdetail-schema | s1-data-layer | s3-drilldowns | **STITCHED** | `AgentDetailSchema` at `schemas.ts:392-403` with attribution-side enum (`:388`); `roster.getAgentDetail` input `{code}` output-bound at `router.ts:453-469`; `abilities: []` per ratified amendment (`parsers/agent-detail.ts:243`) with surfaced note (`:214`); s3 renders the honest empty state (`InventoryPanels.tsx:274,290-291`) and `dataQualityNotes` globally + per-panel (`AgentDetailPage.tsx:271`; `InventoryPanels.tsx:32`). |
| s2-to-s3-nav-contract | s2-party-shell | s3-drilldowns | **STITCHED** | `'agent-detail'` in the 6-member AppMode union (`ui-store.ts:10`) with compiler-exhaustive `PAGE_MAP` (`ModeContent.tsx:36,41`); card click sets `selectedAgentCode` then mode (`PartyPage.tsx:209-215`) — store field name matches the s2 ui_packet contract exactly (`ui-store.ts:20-21`); back-navigation via `BackToPartyButton` (`AgentDetailPage.tsx:221-231`) AND the Roster rail item → `'party'` (`navigation.ts:20`; `SubmenuRail.tsx:40-41`). |
| s2-to-s4-nav-shell | s2-party-shell | s4-retirement | **STITCHED** | Rail global from AppShell (`AppShell.tsx:14-18`), `aria-label="Main navigation"` (`SubmenuRail.tsx:31`); `RAIL_ITEMS` = exactly Roster/Sessions/Progression/Programs (`navigation.ts:16-24`); BottomTabBar is the ratified `<640px` fold of the same source (`BottomTabBar.tsx:1,32-33,49-56`; `globals.css:101-122` — exactly one nav landmark at any width); `NAV_ITEMS` has zero live references; no CUT-surface routes remain. |
| s3-to-s4-absorption-proof | s3-drilldowns | s4-retirement | **STITCHED** | 8-test absorption spec tracked at HEAD (`tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts`); s4 re-verified 8/8 green AT cut time — independent AUD live re-run 32/0 with explicit precondition citation (`.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-4-AUD-1783747734.md:63`); the `:362` fixture-coupled keyboard test was remediated (`c7121b9`) and audited green BEFORE the FE-4 deletion wave — the absorption-before-cut hard order held. All three absorbed capabilities live in `AgentDetailPage.tsx:251-263`; CUT surfaces fully deleted (18 procedures at `router.ts:476`). |

## Drift Register

Resolution key: RATIFIED = explicit human sign-off · AUD-UPHELD = auditor-adjudicated deviation, recorded by REQVAL · RESOLVED = closed by a later sibling in-program · OPEN = no resolution on record.

| # | origin | contract field | declared → actual | severity | cross-sibling | resolution |
|---|---|---|---|---|---|---|
| 1 | s1 | `roster.getParty` return shape | bare `PartyMember[]` → `PartyStatsSchema` envelope `{members, diagnostics, activityAnchor}` | medium | yes | RATIFIED (program.md §5 note 1) |
| 2 | s1 | `abilities` list | workflows w/ provenance → `abilities: []` + surfaced dataQualityNote; honest empty state downstream | medium | yes | RATIFIED (§5 note 2; DEFERRED-V2S1-1) |
| 3 | s1 | `triggers_hook` edge direction | agent-as-source → bidirectional endpoint match (corpus measured 102/102 hook→agent) | medium | yes | AUD-UPHELD (AUD#4; REQVAL note 1 — s3 inherits knowingly) |
| 4 | s1 | `attributedAudits` Accuracy denominator | fail-then-pass only → full inventory §2.1 basis incl. orphaned-fail (22+6+7=35 worked) | low | yes | AUD-UPHELD (AUD#2 MATCHES; REQVAL note 2) |
| 5 | s1 | code→spec mapping mechanism | derive-from-disk mandated → static 13-entry ROSTER catalog (CR#1 proved derivation impossible; disk-verified 12/12) | low | no | CRITIC-PROVEN (maintenance-liability constant, documented) |
| 6 | s2 | Roster rail target | implicit → interim `'browse'`, no aria-current at party during s2 window | low | yes | RATIFIED (s2-4.5); RESOLVED by s3 t4b (`navigation.ts:17-20`) |
| 7 | s2 | card click → agent-detail | direct → interim `'browse'` mapping (mode didn't exist yet); store contract final | low | yes | RATIFIED; RESOLVED by s3 |
| 8 | s2 | SC1 full-roster render | 13 live members → ≤6-card homescreen cap + CTA | medium | yes | RATIFIED (s2-4.5); structurally resolved by s4 catalog |
| 9 | s2 | code-splitting remediation scope | t5's own file → extended to GraphPage/ProgramDagPage/ComposePage in `ModeContent.tsx` | low | yes | AUDIT-SANCTIONED (AUD#7 family re-audit PASS) |
| 10 | s2 | client-only scope | no build-infra → blocking `vitest.config.ts` alias fix | low | no | ORC-SANCTIONED; AUD#3 adjudicated in-scope |
| 11 | s3 | Step-4.5 close within pipeline | in-pipeline → p12 statbox-grid amendment delivered outside pipeline (direct-routed, audited, `6aa859c`) | medium | yes | RATIFIED (human-directed; s4 planned against post-p12 tree) |
| 12 | s3 | s2 aria-current e2e invariant | timeless count-0 → falsified by ratified Roster→party re-point; exactly-3 authorized s2-spec edits | medium | yes | RATIFIED + AUD#8 verified EXACTLY-THREE |
| 13 | s3 | interim CTA target resolution | all `'browse'` targets resolved → third target deliberately retained w/ s4 TODO | low | yes | RATIFIED; RESOLVED by s4 (`PartyPage.tsx:217`) |
| 14 | s3 | SC1 any-agent drill-down entry | any of 13 → 6-card entry cap (capability full, entry limited) | low | yes | RATIFIED (REQVAL R-012); RESOLVED by s4 catalog |
| 15 | s3 | Abilities panel data | real workflows w/ provenance → contracted-empty honest state, e2e-asserted | low | yes | RATIFIED (amendment d) |
| 16 | s3 | revise-target name source | from `AgentDetailSchema` → sanctioned 12-entry `ROSTER_AGENT_NAME_BY_CODE` client map | medium | yes | AUD-SANCTIONED (AUD#4); DEFERRED-V2S3-1 |
| 17 | s4 | BottomTabBar disposition | deleted → repurposed as rail's `<640px` fold of `RAIL_ITEMS` (9-tab `NAV_ITEMS` deleted instead) | medium | yes | RATIFIED (2026-07-10) |
| 18 | s4 | retirement-only scope | no new surfaces → net-new 13-role `'catalog'` AppMode via two CTAs | medium | yes | RATIFIED (2026-07-10, post-CR#1 reachability gap) |
| 19 | s4 | rail-already-global precondition | s2 hoisted (brief assertion) → FALSE on disk; s4 performed the full hoist itself | medium | yes | CR#1-CAUGHT; RATIFIED under the rail-hoist amendment |
| 20 | s4 | SC-5 "full e2e suite green" | full suite green → KEEP-suites green (32/32) + zero NEW regressions vs fresh 115g/67r baseline @ `6c58f40` | medium | yes | **OPEN** — PM amend1 pipeline rewrite, REQVAL-validated, de-facto accepted at 4.5, never explicitly human-signed |
| 21 | s4 | server procedure baseline | brief said 22 → disk had 24 → DEPRECATE-BY-REMOVAL to 18; `ConnectivityGraphSchema` retained for `parsers/agent-detail.ts` | low | yes | RATIFIED (2026-07-10; live-curl 404-proven) |
| 22 | s1 (seam 1) | stat-bar value nullability | 0-100 + raw required → nullable raw/normalized + `reason`; N/A rendering downstream | low | no | ADDITIVE — consumed cleanly, no shape break |
| 23 | s1 (seam 2) | dataQualityNote arity | singular note → `dataQualityNotes` array, surfaced globally + per-panel | low | yes | CONSISTENT with amendment (d) |
| 24 | s1 (seam 2) | equipment provenance | provenance on all lists → `EquipmentSchema {tool}` w/o provenancePath (tools aren't files) | low | no | DEFENSIBLE READING — consumed cleanly |
| 25 | s4 (seam 4) | AppShell comment accuracy | comments describe shipped state → stale FE-1a "9-tab fallback" comment at `AppShell.tsx:6-9` | low | no | **OPEN** — cosmetic; routed to mop-up brief |
| 26 | s3 (seam 5) | absorption spec quality at handoff | green as-handed → `:362` fixture-coupled keyboard test needed s4 remediation pre-cut (order held) | low | yes | RESOLVED in s4 (`c7121b9`, audited green before FE-4) |

## Residue Register

### Ratified deferrals (no action required — ledgered in `docs/deferred-work.md` with human authorization 2026-07-10)

| origin_sibling | target_domain | description | severity |
|---|---|---|---|
| s1 | data layer / gander workflow-usage ledger | DEFERRED-V2S1-1: `abilities` empty-with-note; candidate workflow-usage ledger appended at accelerant close | medium |
| s1 | shared schemas | DEFERRED-V2S1-2: `QualityStatSchema` lacks typed `reason`; N/A reasons ride dataQualityNotes | low |
| s1 (carrier; pre-program origin) | event schema | DEFERRED-P9-1: tokens/cost ships only as `TOKENS_PROJECTED_PLACEHOLDER` (feasibility `projected`); no token field in event schema | low |
| s2 | client layout (`Header.tsx`/`ModeContent.tsx`) | DEFERRED-V2S2-1: ~16px horizontal overflow at 390px width; no s4 packet authorized to touch it | low |
| s2 (ledgered as V2S4-1) | nav shell (`SubmenuRail.tsx`/`AppShell.tsx`) | DEFERRED-V2S4-1: rail fixed 240px, no collapse/expand (the `<640px` fold IS shipped) | low |
| s3 | BE schema (`AgentDetailSchema` + `assembleAgentDetail`) | DEFERRED-V2S3-1: retire the 12-entry client name map via `agentName`/`specFile` schema extension — note the map is 12 entries against the 13-role catalog (unmapped codes degrade to an honest no-revise fallback) | medium |
| s3 | design docs (`v2-design-spec.md`) | DEFERRED-V2S3-2: row `--mg` on `--sfh` (4.85:1) in contrast_pairs before any text uses the pair | low |

### Open, unowned (feed the integration brief)

| origin_sibling | target_domain | description | severity |
|---|---|---|---|
| s3 | client `components/ui` (FE) | Dialog/Popover wrapper hard-defaulting the safe focus pattern (function-form `initialFocus` → `ref.current ?? false`); fix lives only locally in `ReviseSpecAction.tsx` — every future dialog with an async-mounted focus target re-derives the defect (class is 0-for-2 on prompt-level prevention) | medium |
| s3 | client `RelationshipPanel` (FE) | RF layout constants tuned for full width now render in a half-width `md:grid-cols-2` cell (p12); structurally verified usable, pixel-level cramping inspection explicitly not done; in no ledger | low |
| s1 | party-stats Accuracy derivation | Family-grouping approximation (sprintRoot can cross-resolve same-role fail/pass across tasks in one family); documented accepted approximation, inherited knowingly by s2/s3 — but no ledger row, no owner | low |
| s1 | gander `standards.md` vs installed push rail | Guarded-push docs say opted-in feature-branch pushes are allowed; installed rail denied ORC's push twice (s1 close, program close) — docs-vs-rail reconciliation unowned | low |
| s4 | repo hygiene (`packages/client`) | Empty `components/{browse,edit,graph}/` dirs + pre-existing `quickcheck{,2}.mjs` scratch files — "safe to remove at next cleanup", no owner | low |
| s4 | server tests | `program-dag-parser.test.ts:197-203` doc-comment cites removed `exportRouter.spawn` | low |
| s4 | design docs / server comments | `v2-design-spec.md:324` names the retired rail aria-label ("Party screen submenus"); stale `router.ts` STUDIO_ROOT comment | low |
| s4 | client shell comments | Stale FE-1a comment at `AppShell.tsx:6-9` describing the pre-FE-1b 9-tab BottomTabBar | low |

### Handed outside the program (gander control plane — owner-of-record: the planned reflect/agent-improvement pass; NOT integration-sprint material)

| theme | description | severity |
|---|---|---|
| `subagent-autocomplete.sh` hook batch | SubagentStop validator-class COMPLETE-miss — **5th consecutive sprint**, fix fully specified since p11; plus NEW day-rollover subclass (s1) and NEW SendMessage-resume subclass (s4: 9 backfills, 1 stale-duplicate auto-log, 1 wrong-agent-id duplicate) | high |
| git-stash guard | s2 G3: bare `git stash` transiently swept the multi-agent uncommitted tree; add stash variants to forbidden mutator list + candidate hard guard (HUMAN RATIFICATION required) | high |
| PM corpus-fact-citation rule | The plan-time-unverified-fact class mutated through all four siblings (4th form: precondition/mount-state assertions); s4 §9 proposes the final generalization | medium |
| Archivist anti-drift | Verbatim/copy-from-artifact rules landed procedurally (s4 entry CLEAN, first in five) but the spec fix + regression eval remain unlanded | medium |
| Deny-rail deletion workarounds | Three agents independently routed around the `rm` deny-rail (`find -delete` ×2, `node fs.unlinkSync` ×1, one undisclosed until return) → sanctioned-deletion mechanism + pre-execution disclosure rule | medium |
| Output-Path block on RESUME | Upgrade PreToolUse:Agent hook WARN→DENY + canned RESUME-dispatch template | medium |
| Auditor causal-attribution | OBSERVATION vs ATTRIBUTION split in carry-forward blocks; "flake" claims need ≥2 clean isolated re-runs (AUD#3's disproven rail attribution cost a remediation round) | medium |
| Gate-proximity baselines | Wiring packets must cite measured current chunk size; stale doc figures may not serve as gate premises (s2's 2-round bundle remediation) | medium |
| `log-event` LAST_SEQ guard | Empty/absent-LAST_SEQ guard for first event of a new UTC file (s1's correct restart was shell-coercion luck) | low |
| `assign-agents` sequencing | Don't parallel-dispatch the next writer of a shared file with the audit of its current packet (s1 router.ts commit bundling) | low |
| `pm-preflight` symlink fix | Physical-path invocation worked around 3 consecutive sprints | low |
| INTERIM-vs-INVARIANT e2e tagging | Cross-sprint assertion marking + promote the CR#4 fresh-baseline recipe (s3 G-class; specific instances mooted by s4's cut) | low |
| Skill clarifications + eval backlog | commit-packet mixed-batch/pre-verdict rule, jidoka skip-NOTE, env-preflight reuse-NOTE, PM_PREFLIGHT event logging; ~10 eval fixtures proposed across s2/s4 §10 | low |
| Local skill version drift | studio-alpha's local `audit-pipeline` SKILL.md pre-dates the v2.0 envelope 9/10 auditors emitted anyway (s4 §8e) | low |

## Recommendation

**NEEDS_INTEGRATION** — integration brief written at `docs/programs/prog-studio-v2-2026-07/sprints/integration/orchestrator_brief.md`; human should review and decide whether to dispatch.

Honest framing of that verdict: **all 5 seams are STITCHED and the delivered app is internally consistent** — program success criteria 1–5 are met, and no seam repair of any kind is required. The recommendation fires on the skill's intentionally conservative threshold (cross-domain unowned residue exists, and drift row 20 lacks an explicit human sign-off). The brief is a small optional mop-up: one medium FE hardening item (ui Dialog focus-default wrapper), one FE visual check (RelationshipPanel at half width), a comment/debris hygiene sweep, two ledger additions, and one explicit sign-off request (s4's SC-5 amendment). Marking it "no action needed" — or folding the items into the deferred-work ledger — is a legitimate response. The 14 gander-side items are explicitly NOT in the brief; they route to the already-planned reflect/agent-improvement pass run from the gander repo.

Program status updated: `program.md` §7 → STITCHED (all 5 seams), reconciled 2026-07-11.
