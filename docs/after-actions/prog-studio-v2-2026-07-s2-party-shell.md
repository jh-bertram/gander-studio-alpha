---
type: post-mortem
sprint: prog-studio-v2-2026-07-s2-party-shell
date: 2026-07-08
head_sha: dbc4b87
gap_classes:
  - bundle-gate-latent-weight-attribution
  - stale-doc-baseline-as-gate-premise
  - primitive-behavioral-default-collision
  - destructive-git-op-shared-uncommitted-tree
  - subagentstop-complete-miss
  - archivist-paraphrase-drift
  - commit-before-verdict-test-only-packet
  - recurring
recurring_tags:
  - subagentstop-complete-miss
  - archivist-paraphrase-drift
related_sprints:
  - "[[prog-studio-v2-2026-07-s1-data-layer]]"
  - "[[prog-studio-v2-2026-07]]"
  - "[[gander-studio-p11-v2-vision]]"
status: written
---

# After-Action: prog-studio-v2-2026-07-s2-party-shell — v2 Party Shell (First v2 Surface)

**Date:** 2026-07-08
**Project:** `/home/jhber/projects/gander-studio-alpha`
**Duration:** ~3h 6m (PM_PREFLIGHT seq 22 @ 2026-07-08T01:09:25Z → AR#1 COMPLETE seq 67 @ 04:15:26Z; AA#1 spawned seq 68). All events in a single UTC file (`agent-events-2026-07-08.jsonl` seq 22–68) — no midnight span this time; `seq` authoritative, ORC-shell (`+00:00`) and hook (`Z`) clocks mixed as usual.
**Final State:** **First v2 surface shipped.** Tier-1 sibling of `prog-studio-v2-2026-07`: the FF7 party screen is the app's new DEFAULT route, live-wired to s1's `roster.getParty` — PartyPage + useParty hook, PartyMemberCard (with RoleTag + Popover quick-peek), PortraitFrame, StatBar, materiaTint helper, SubmenuRail, selectedAgentCode store contract, RAIL_ITEMS constants, and a 19-test Tier-2 e2e regression gate. 6 FE packets + 3 remediation rounds; 8 audit verdicts (7 PASS, 1 genuine FAIL — AUD#5's bundle gate); 1 HIGH runtime defect found ONLY by the t6 e2e gate (focus/popover oscillation) and remediated; REQVAL Mode B **COVERED 15/15** with `requires_human_visual=true`. Status **DONE-PENDING-4.5** (human browser check outstanding). 7 durability commits (`7359da5`/`b9dffa9`/`82c2400`/`2c23c7e`/`87dc529`/`3a6a277`/`dbc4b87`) + ceremony `0a0536e` on `feat/studio-sessions-feed-agentstats`, **NOT pushed** — the recorded per-sprint push opt-in gates on Step 4.5 completing first.

---

## 1. Original Request

**Human (2026-07-07, program kickoff):** Ratified the p11 v2-vision package ("this design looks great") and authorized the multi-sprint v2 rebuild, with the per-sprint guarded-push opt-in ("push this sprint") and program continuation ("let's keep it moving"). This sibling executes **tier 1**: build the v2 shell and party-screen home — a new default `'party'` AppMode rendering the FF7 party screen (asset-free portraits, StatBars, card-hover Popover quick-peek, side submenu rail Roster/Sessions/Progression/Programs), live-wired to s1's `roster.getParty`. The PM's `verbatim_deliverable_audit` consumes all three human phrases (design approval → packets t2/t3/t4; push → routing_notes `push_opt_in`, ORC Layer-2 action; continuation → execution proceeds).

**Brief files:** `docs/programs/prog-studio-v2-2026-07/sprints/prog-studio-v2-2026-07-s2-party-shell/orchestrator_brief.md` (5 sprint SCs; consumes seam `s1-to-s2-party-schema`; owns `s2-to-s3-nav-contract` + `s2-to-s4-nav-shell`), decomposed as `.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md` (6 FE packets, {t1 ∥ t2} → t3 → t4 → t5 → t6), amended post-PASS as `...-amend-PM-1783474258.md` (W1–W5 warning resolutions).

**Scope at intake:** s1 delivered the entire data layer (schemas + `roster.getParty`/`getAgentDetail`, live-verified); nothing of the v2 client existed. This sprint is client-only: no server/shared edits, no globals.css writes (reference-by-name), BottomTabBar untouched (s4 owns removal — both nav surfaces coexist), rail page-local and hoistable (s4 lifts it).

**Skill invoked:** dispatch-task pipeline (pm-preflight → PM → Critic PASS + 5 WARNINGs → **warning-resolution amendment** (first use this program, outside Critic round caps per Step 1.5) → env-preflight → staged FE waves with rolling audits + rolling per-packet commits → remediation chains → REQVAL Mode B → commit-packet close → archivist).

---

## 2. Agent Activity Log

Seq references: `docs/events/agent-events-2026-07-08.jsonl` seq 22–68.

### Phase 1: Plan gate — PM → Critic PASS+5W → warning-resolution amendment → env preflight (seq 22–29)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 22 | 01:09:25 | PM_PREFLIGHT | ORC#0 | Physical-path workaround required AGAIN (3rd consecutive sprint); checklist now sources the s1 after-action incl. the archivist-paraphrase-drift tag |
| 23→24 | 01:09:25 | SPAWN→COMPLETE | PM#0 | 6-packet FE decomposition with 5 load-bearing pre-write findings (compiler-exhaustive PAGE_MAP coupling isolated in t5; Shadcn primitives verified NOT installed; globals.css written by no packet; rail page-local/hoistable; ui-store t1→t5 serialized per s1 G4); 6 `<recurring_pattern>` dispositions; every codebase-shape claim phrased **verify-then-implement** (s1 G1 applied); sc-precheck delegated to ORC, **0 findings** |
| 25→26 | 01:24:16 | SPAWN→CRITIQUE_PASS | CR#1 | **PASS + 5 WARNINGs** (W1 DRY materia-tint idiom ×2 files; W2 spec-primitive substitution needs a recorded mapping; W3 t6 side-effect-proxy + viewport hazards; W4 t3 coupling optional split; W5 two undeclared interim UX limitations) + 8 disk-verified RATIFICATIONS (R-1 brief-over-spec on BottomTabBar, R-2 substitution correct incl. the memorized FF7-collision gotcha, R-3 rail mount, R-7 `trpc.roster` exposure confirmed at router.ts:829) |
| 27→28 | 01:30:58 | SPAWN→COMPLETE | PM#0 (amend) | **warning_resolution_request — first exercise of the Step-1.5 amendment branch this program**: all 5 WARNINGs resolved WITHOUT re-decomposition — W1→single `materiaTint` helper + t3 must_not_contain (ORC grep: 0 `color-mix` in t3 files); W2→verbatim Card→PartyMemberCard / Badge→RoleTag / Progress→StatBar / Skeleton→shimmer-box / Alert→error-state mapping in t2/t3/t4 packets, marked Critic-RATIFIED; W3→t6 SCs replaced (destination-surface DOM markers, explicit `page.setViewportSize(390)`); W4→ACCEPT-with-rationale; W5→risk flags R-9/R-5b surfaced at REQVAL as human-acceptance items |
| 29 | 01:34:16 | NOTE | ORC#0 | **env_preflight PASS**: trpc/health ok; agent.list 256KB + skill.list 697KB non-empty; `roster.getParty` members present; dev server bg on :3001 with GANDER_ROOT (s1's "/health lives on the tRPC path" forward-note consumed correctly) |

### Phase 2: FE waves with rolling audits and rolling per-packet commits (seq 30–50)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 30/31→32/33 | 01:34:16 | SPAWN×2→COMPLETE×2 | FE#1 (t1), FE#2 (t2) | Parallel pair, disjoint files (G4-safe): t1 selectedAgentCode contract + RAIL_ITEMS; t2 PortraitFrame + StatBar + the W1 `materiaTint` single-source helper |
| 35/36→37/38 | 01:44–01:48 | SPAWN→AUDIT_PASS ×2 | AUD#1 (t1), AUD#2 (t2) | First-pass PASS both; durability commits `7359da5`/`b9dffa9` @ 01:58:42 |
| 34→39 | 01:44→01:58 | SPAWN→COMPLETE | FE#3 (t3) | PartyMemberCard (incl. RoleTag, controlled Popover quick-peek) + SubmenuRail + a blocking `vitest.config.ts` resolve-alias infra fix (disclosed, ORC-sanctioned) |
| 41→42 | 01:58→02:02 | SPAWN→AUDIT_PASS | AUD#3 (t3) | First-pass PASS; alias infra fix adjudicated in-scope/non-behavioral (exact vite.config.ts mirror); 27/27 vitest re-run; commit `82c2400` @ 02:09:47. **The card's focus defect was invisible to this static audit** (see §3/§4) |
| 40→43 | 01:58→02:09 | SPAWN→COMPLETE | FE#4 (t4) | PartyPage (loading/empty/error+Retry/default) + useParty; **verify-then-implement executed**: live curl of `roster.getParty` (13-member envelope) BEFORE writing the hook (R-7 discharged) |
| 45→47 | 02:09→02:16 | SPAWN→AUDIT_PASS | AUD#4 (t4) | First-pass PASS; commit `2c23c7e` @ 02:16:59 |
| 44→46 | 02:09→02:13 | SPAWN→COMPLETE | FE#5 (t5) | Wiring packet: `'party'` AppMode + default flip + PAGE_MAP entry (atomic, compiler-exhaustive) — the sprint's first-importer integration point |
| 48→50 | 02:16→02:48 | SPAWN→COMPLETE | FE#6 (t6) | **The e2e gate packet**: 19-test Tier-2 spec against LIVE data; found the HIGH focus-oscillation defect (documented via `test.fail()`, not papered over) + the pre-existing 390px header overflow (scoped out + routed); cleaned up its own 8 debug spec files |
| 49→52 | 02:16→02:55 | SPAWN→**AUDIT_FAIL** | AUD#5 (t5) | **The sprint's one genuine audit FAIL**: QA Bundle Size Gate — main chunk **1,035.70 kB > 1,000 kB**; SA PASS / SX SECURE; typed `single_remediation_target` (React.lazy code-split in t5's own file) |

### Phase 3: Remediation chains — t3-rem (HIGH defect) and t5-rem×2 (bundle gate) (seq 51–63)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 51→53 | 02:49→03:31 | SPAWN→COMPLETE | FE#7 (t3-rem) | Dispatched on t6's HIGH flag (before AUD#5's FAIL even landed). Root-caused BOTH base-ui defaults inside node_modules source: `initialFocus` auto-resolving true for keyboard opens (PopoverPopup.js:84-90) AND hardcoded `role="dialog"` granting the empty popup `tabindex="0"` (FloatingFocusManager.js:93-112 — a NEW regression its first-pass fix introduced, caught in its own verification). Fix: 2 additive props (`initialFocus={false}` + `role="presentation"`); strengthened the e2e test into a hard regression guard (3.2s sustained focus, blurCount===0, Enter→DOM consequence) |
| 55→56 | 03:32→03:38 | SPAWN→AUDIT_PASS | AUD#6 (t3-rem) | +30/-0 additive-only confirmed; assertion STRENGTHENING (not weakening) verified test-by-test; e2e re-run ×2 |
| 54→57 | 03:32→03:40 | SPAWN→COMPLETE | FE#8 (t5-rem) | Prescribed fix implemented correctly (lazy PartyPage + Suspense/ShimmerBox) — chunk 1,035.70→**1,025.44 kB, still over the gate**. Diagnosed the real cause: the "~700 kB" Known-Issues baseline is 3 weeks stale (last touched `ccf13a6`, 2026-06-20); pre-existing react-flow importers are the weight; PartyPage's own subtree is only ~12 kB. **Correctly refused to expand scope**; flagged back to ORC for rescope |
| 58→59 | 03:40→03:53 | SPAWN→COMPLETE | FE#9 (t5-rem2) | Extended the split to GraphPage/ProgramDagPage/ComposePage → main chunk **756.80 kB, PASS** (243.2 kB headroom); controlled before/after revert proved the 8 pre-existing compose-surface e2e failures unrelated. **Incident: an initial diagnostic `git stash` swept the ENTIRE uncommitted multi-agent tree** — caught immediately via the file-change reminder, reversed with `git stash pop`, zero loss; switched to Edit/backup-file round-trips (§6 G3) |
| 60→61 | 03:54→03:59 | SPAWN→AUDIT_PASS | AUD#7 (t5 family re-audit) | Full re-audit of t5+rem1+rem2 combined diff (exactly 2 files); all three gates re-run first-hand; bundle gate CLEARED; flagged the stale CLAUDE.md baseline for s4 (do-not-edit-inline) |
| — | 04:00:40 | commit ×3 | ORC | `87dc529` (t3-rem), `3a6a277` (t5 family), `dbc4b87` (t6 spec) — note `dbc4b87` landed BEFORE AUD#8's verdict (§6 G6) |
| 62→63 | 04:00→04:04 | SPAWN→AUDIT_PASS | AUD#8 (t6) | Quality audit of the COMMITTED spec (runtime already re-verified by AUD#6 ×2 + AUD#7 ×1): Check A clean (zero skip/only/fail/soft/try-catch), W3 marker compliance per destination, overflow-scoping adjudicated LEGITIMATE-and-ROUTED, independent headless re-run 19/19 (41.6s, exit 0) |

### Phase 4: Close — REQVAL → archive → after-action (seq 64–68)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 64→65 | 04:05→04:12 | SPAWN→COMPLETE (backfill) | RV#1 | **COVERED 15/15** (5 brief SCs + §5-note-1 amendment + 5 declared outputs + 4 invariants/seams) with file:line evidence; `requires_human_visual=true` → DONE-PENDING-4.5; HA-1/HA-2 (W5 interim limitations) staged for human acceptance. **COMPLETE hook-missed — the validator class, 3rd consecutive sprint** — ORC backfilled inline with output confirmed on disk (§6 G4) |
| — | 04:12:03–:18 | commit_record + ceremony | ORC (commit-packet) | Record documents all 7 durability commits (task:/Audit: PASS trailers, secret grep CLEAN, per-packet scope PASS); ceremony `0a0536e` stages coordination artifacts only (51 files: outputs, verdicts, event log, agent logs, deferred-work V2S2-1/-2, task-registry, checkpoint) |
| 66→67 | 04:12→04:15 | SPAWN→COMPLETE | AR#1 | archive_entry appended (`docs/project_log.md` lines 2424–2522) — narrative accurate, but the commit inventory drifted (§4, §6 G5) |
| 68 | 04:15:40 | SPAWN | AA#1 | this after-action |

**Feedback loops:** 3 remediation rounds across 2 chains — (1) t3-rem: 1 round (FE#7→AUD#6 PASS) for the e2e-discovered HIGH defect; (2) t5-rem: 2 rounds (FE#8 insufficient-by-scope → FE#9 → AUD#7 family PASS) for the bundle gate. Plus the plan-stage warning-resolution round (5 W → amendment, no BLOCK, no re-decomposition). The remediation glob returns 3 files — all accounted for above; no hidden cycles.

**Root cause of failure(s):** AUD#5's FAIL was **latent-weight attribution** — t5's one-line `import PartyPage` was merely the first importer that pulled the party subtree into the entry chunk of a bundle that was ALREADY ~1,025 kB from pre-existing react-flow importers, hidden behind a 3-week-stale "~700 kB" doc baseline (§6 G1). The HIGH keyboard defect was **third-party behavioral defaults colliding with a controlled-open pattern** — base-ui's auto initialFocus + forced `role="dialog"` (§6 G2). Neither was an implementer misreading a packet.

**Deviation from PM brief:** none of substance. One disclosed, sanctioned infra fix (t3's vitest alias); one packet-vs-committed-artifact divergence in the CORRECT direction — the t6 FE packet describes test #5 as a `test.fail()` known defect, while the committed spec (post-t3-rem) is STRONGER: a hard-passing regression guard. Both AUD#8 and REQVAL recorded this explicitly so it cannot be misread as drift — this is the flag-then-strengthen pattern working as designed, not a gap.

---

## 3. Post-Delivery: Runtime Bugs (if any)

None post-close as of this writing — and the sprint is deliberately NOT fully closed: **DONE-PENDING-4.5** holds until the human browser check. The sprint's one HIGH runtime defect was found IN-sprint by its own t6 e2e gate:

**Reporter:** FE#6 (t6 e2e gate packet) — not a human, not an auditor.
**Error:** keyboard focus on a PartyMemberCard oscillates BUTTON ↔ `DIV[role=dialog]` every ~40–50 ms indefinitely; Enter/Space lands on whichever element holds focus at that instant — reliable on a fresh page, failing under realistic load (~15 preceding tests in the worker). A real keyboard or screen-reader user pausing between Tab and Enter risks the keypress doing nothing.
**Detected:** during t6 authoring (seq 50), via a `focusin` listener + `document.activeElement` sampling; documented in-spec with `test.fail()` so the suite stayed honest while the defect was tracked.
**Root cause:** `PartyMemberCard` controls `open={isPeeking}` itself, but base-ui's PopoverPopup default `initialFocus` resolver returns true for keyboard opens → FloatingFocusManager moves DOM focus into the button-less popup → trigger `onBlur` → close → focus returns → `onFocus` → reopen. A self-driven loop entirely made of library DEFAULTS. The first-pass fix (`initialFocus={false}` alone) exposed the second default: the popup's hardcoded `role="dialog"` grants it `tabindex="0"` when it has no tabbable children, inserting a phantom Tab stop between cards.
**Fix applied:** `87dc529` — two additive props on `<PopoverContent>` (`initialFocus={false}` + `role="presentation"`, the latter also correct a11y: the peek duplicates the card's own aria-label) + the e2e test strengthened into a sustained-focus/zero-blur regression guard.
**Why agents did not catch this (before t6):** five static audits legitimately could not — the auditor MCP set is read-only (no interaction primitives), and per the p10-G3 doctrine interaction-class SCs are FE-owned via CLI Playwright. The defect only manifests under keyboard-driven focus timing at runtime. **This sprint is the doctrine's validation case: the e2e-gate-as-packet caught what 5 static audits could not.** The residual gap is upstream: nothing warned t3's author that base-ui primitives carry focus/role behavioral defaults hostile to controlled quick-peek patterns (§6 G2).

Open at close (declared, human-owned): HA-1 rail collapse/expand deferred to s4; HA-2 reload-only return-to-party path for the s2 window; HA-3 the Step 4.5 browser check itself (dual-width screenshots staged). Pre-existing 390px header/ModeContent overflow (~16px) confirmed NOT from this sprint's code, routed as DEFERRED-V2S2-1.

---

## 4. QA Gap Analysis

**Current QA protocol:** pm-preflight pattern extraction → Critic plan gate (sc-precheck + disk-verified ratifications) → warning-resolution amendment branch → env-preflight before the FE wave → per-packet static audit (SA/QA/SX v2.0) with rolling per-packet durability commits → FE-owned CLI-Playwright e2e gate as its own packet (t6) → family re-audit after multi-round remediation → REQVAL Mode B → commit-packet close.

**What this caught:**
- **The t6 e2e gate found the sprint's only HIGH defect — the load-bearing catch.** Every layer that touched PartyMemberCard statically (FE#3's own checks, AUD#3's full review) passed it; only driving real keyboard focus against the running app exposed the oscillation. FE#6 also refused the easy out: it pinned the defect with `test.fail()` + reproduction + root-cause direction instead of picking a convenient fast-path timing that would have gone green.
- **AUD#5's bundle FAIL was genuine and precisely attributed** — it verified t5's import is the sole/first importer of PartyPage (0 refs at HEAD), rejected the completion packet's "cumulative t1–t5, not this packet" framing, and issued a typed single remediation target in the exact file t5 owns.
- **FE#8's boundary discipline turned an insufficient fix into a diagnosis.** It implemented the prescribed fix, measured it short (1,025.44 kB), root-caused the stale baseline (react-flow importers accumulated since `ccf13a6`), and flagged back for rescope instead of silently touching out-of-scope files. FE#9 then proved its own change harmless with a controlled before/after revert of the 8 pre-existing e2e failures.
- **The warning-resolution amendment made all 5 Critic WARNINGs enforceable, and all 5 held downstream:** W1's `materiaTint` single-sourcing (grep-verified 0 re-inlined idioms), W2's substitution mapping (REQVAL R-007 adjudicated pre-ratified, no fidelity FAIL), W3's DOM-marker + explicit-viewport rules (AUD#8 verified per destination), W5's interim limitations surfaced as HA items instead of being "discovered" at close.
- **AUD#6 audited the remediation for assertion-weakening** — verified the fixed test asserts strictly MORE than the original and that no other assertion was loosened to achieve green.
- **AUD#8's Check A and overflow-scoping adjudication** — confirmed the committed spec carries zero masking annotations and that scoping overflow checks to `[data-testid="party-page"]` matches W3's literal wording while the pre-existing global overflow is ROUTED (deferred-work V2S2-1), not swallowed.
- **s1's contracts were consumed correctly:** the envelope interpretation (§5 note 1) drove useParty returning `{members, diagnostics, activityAnchor}` with the diagnostics footnote asserted against live data; the G4 shared-writer rule serialized ui-store t1→t5 — zero cross-task file bundling needed at commit time this sprint.

**What this missed (process-shape; the shipped surface is defect-remediated):**
- **Nobody saw the bundle gate approaching before AUD#5 tripped it.** The Known-Issues "~700 kB" baseline was 18 days stale; the real pre-party entry chunk was ~1,025 kB — the gate was effectively already breached at HEAD, invisibly. The PM planned a first-importer wiring packet (t5) with no gate-proximity check; AUD#5 initially reasoned from the stale doc figure ("passed at ~700 kB") until FE#8 measured the truth. One `npm run build` at plan time — a measured citation in exactly the s1-G1 style the plan applied everywhere else — would have converted a 2-round remediation chain into a planned deliverable (§6 G1).
- **Nothing warned about third-party behavioral defaults.** The memorized FF7/Shadcn gotcha covers token/visual collisions; base-ui's focus-management and role defaults are the same failure family (library defaults vs project intent) in behavioral form, and no checklist item, packet note, or FE-spec rule prompted checking `initialFocus`/`useRole` semantics before wiring a controlled popover (§6 G2).
- **`git stash` was one reminder away from destroying 3 hours of uncommitted multi-agent work.** FE#9's stash was legitimate-looking diagnostics, and recovery was flawless — but the operation class (whole-tree mutation of shared uncommitted state) is not on any forbidden/confirm-first list the agents carry (§6 G3).
- **The SubagentStop validator-class miss fired again exactly as predicted** — RV#1's COMPLETE, 3rd consecutive sprint, fix still unlanded in the gander batch. One miss out of ~13 auto-loggable completions; every FE/PM COMPLETE auto-logged correctly (§6 G4).
- **The archive entry drifted again — 3rd consecutive archivist sighting, one sprint after AR#2's s1 correction addendum, and WITH the drift tag in the pm-preflight checklist.** See the precision verdict below (§6 G5).
- **`dbc4b87` (t6 spec) was committed before its own audit verdict existed** — disclosed and mitigated, but a commit-packet trigger deviation (§6 G6).

**Archive-entry precision verdict (parent-requested):** **NOT clean — drifted, but the drift is confined to the commit inventory + one deliverable characterization; the narrative layer is accurate.** Verified correct against artifacts: the remediation narrative and all three bundle figures (1,035.70/1,025.44/756.80 kB), the ~40–50 ms oscillation figure, the fix mechanism, 19 e2e tests, REQVAL 15/15 + requires_human_visual, 21 spawns (PM×2/CR×1/FE×9/AUD×8/RV×1 — recount matches), 0 ghosts, 1 backfill, all cited code paths exist on disk, CR timestamp exact, deferrals complete. Drifted: (a) **"Commits (5 total)"** while listing 7 items — actual: 7 durability + 1 ceremony; (b) **`0a0536e` mischaracterized twice** — as "Ceremony commit … stitching t1–t4 + remediation rounds" (it contains coordination artifacts only, zero code; the rem code is in `87dc529`/`3a6a277`) and as parent-program "ceremony pre-staging" in dependencies (the program ceremony is `290de04`); (c) **`87dc529` (t3-rem) omitted from the commit list**, its fix folded into the t3 commit's parenthetical — a reader would conclude `82c2400` contains the focus fix (it does not); (d) t5 commit item omits `ui-store.ts` (the commit touches 2 files); (e) **"materia-tint.ts (color indexer, Zod-validated input)" — fabricated characterization**: the file contains no Zod anywhere and is a color-mix string helper, not an indexer; (f) "First-pass rate: 6/8" whose own parenthetical enumerates five tasks — no consistent denominator yields 6/8 (audit-verdict basis: 7/8; packet basis: 5/6). Improvement over s1 acknowledged: no fabricated file paths this time — the drift class migrated from paths (which the AR now Glob-verifies) to commit-inventory facts (which it re-narrates from memory). A correction addendum (AR#2 pattern, as in s1) is recommended; the mechanical fix is §6 G5 / §9 row 4.

**Recurring-class table:**

| Class | This sprint | Prior sightings | Status |
|-------|-------------|-----------------|--------|
| subagentstop-complete-miss (validator subclass) | 1 miss: RV#1, backfilled inline (seq 65) | s1: RV#1 + BE#2 day-rollover; p11: RV named as the class origin | RECURRING — 3rd consecutive; fix queued in the gander hook batch (s1 §9 row 2), still unlanded (§6 G4) |
| archivist-paraphrase-drift | Commit-inventory drift: wrong count, ceremony misdescribed ×2, rem commit omitted, one fabricated characterization ("Zod-validated") | s1 §6 G5: fabricated paths (corrected by AR#2, seq 19–20); p11 §4 watch item | RECURRING — 3rd consecutive, mutated form: paths now Glob-verified, commit facts still re-narrated (§6 G5) |
| primitive-defaults-vs-project-intent | base-ui behavioral defaults (initialFocus, role="dialog") caused the HIGH defect | Memorized S2 gotcha: Shadcn token defaults → invisible text (visual form of the same family) | FAMILY EXTENSION — behavioral subclass newly named (§6 G2) |
| pm-preflight symlink misresolution | Physical-path workaround required again (seq 22) | s1, p11 §6 G1 (fix proposed, unlanded) | RECURRING — 3rd consecutive worked-around sprint |
| stale-doc-baseline-as-gate-premise | "~700 kB" Known-Issues figure 18 days stale masked an already-breached gate | New (related to s1 G1's unmeasured-fact class: a doc citation is not a measurement) | NEW class named (§6 G1) |

---

## 5. Agent Performance Summary

Token accounting: no sprint report exists for this slug and COMPLETE events carry no `tokens` field — per-agent token attribution unavailable this sprint, not omitted.

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM#0 | 1 decomposition + 1 amendment | 100% (PASS, no BLOCK) | First BLOCK-free plan gate of the program; s1's G1/G4 lessons visibly applied (verify-then-implement phrasing throughout; ui-store serialization); the amendment converted all 5 WARNINGs into enforced SCs in one bounded round. Gap: no bundle/gate-proximity awareness for the first-importer wiring packet (§6 G1) |
| CR#1 | 1 round | 100% | 5 real WARNINGs — every one materialized downstream as an enforced control; 8 disk-verified ratifications (incl. pre-legitimizing the substitution against the memorized collision gotcha) removed the audit-fidelity landmines it forecast |
| FE#1 (t1) / FE#2 (t2) | 2 | 100% audit | Clean parallel pair; t2's materiaTint helper became the sprint's DRY anchor (0 re-inlined idioms verified) |
| FE#3 (t3) | 1 | 100% audit / defect at runtime | Card + rail well-built and audit-clean — but shipped the HIGH focus defect no static layer could see; disclosed the vitest alias infra fix properly |
| FE#4 (t4) | 1 | 100% | Live-curl verify-then-implement before writing useParty (R-7 discharged with a measurement, the s1 discipline propagating) |
| FE#5 (t5) | 1 | 0% (AUD#5 FAIL) | The wiring itself was correct (SA PASS, compiler-exhaustive proof held); the FAIL was the gate trip. Its "cumulative t1–t5" framing understated t5's causal role — AUD#5 rejected that correctly, though FE#8 later proved the deeper truth was the stale baseline |
| FE#6 (t6) | 1 | 100% | **Most impactful implementer of the sprint**: authored the 19-test gate, found + honestly pinned the HIGH defect (test.fail(), reproduction, root-cause direction), scoped-and-routed the pre-existing overflow, cleaned up its own debug files |
| FE#7 (t3-rem) | 1 | 100% | Exemplary remediation: node_modules-source-level root cause of BOTH defaults; caught its own first-pass fix's new regression mid-verification (scoped stash bisect + throwaway debug spec); strengthened the test rather than merely passing it |
| FE#8 (t5-rem) | 1 | fix insufficient, conduct correct | Implemented the prescribed fix, measured it short, root-caused the stale baseline, refused scope expansion, flagged for rescope — the correct behavior when a remediation prescription is under-scoped |
| FE#9 (t5-rem2) | 1 | 100% (gate PASS) | 756.80 kB with controlled-revert proof of non-regression — but the whole-tree `git stash` (caught, reversed, zero loss) is the sprint's closest near-miss (§6 G3) |
| AUD#1–#8 | 8 verdicts | 7 PASS / 1 genuine FAIL | AUD#5's typed FAIL + single remediation target; AUD#7's full family re-audit with first-hand gate re-runs; AUD#6's anti-weakening review; AUD#8's independent 19/19 re-run + Check A. All four static passes over PartyMemberCard were legitimate given the read-only MCP toolset |
| RV#1 | 1 | COVERED 15/15 | Per-item file:line evidence; consumed both e2e runs as Step-2.5 runtime proof; staged HA-1/HA-2/HA-3 for the human; pre-recorded the packet-vs-spec divergence and the git-stash incident as after-action material. COMPLETE hook-missed (validator class), backfilled |
| AR#1 | 1 | n/a | Narrative + numbers layer accurate; commit inventory drifted (§4 verdict, §6 G5) |

**First-pass rate: 5/6 packets passed audit on first submission (t5 the exception); 4/6 were defect-free on first submission** (t3's HIGH defect was invisible to its audit and surfaced at t6). Both remediation chains converged: 3 rem rounds, 2 successful fixes, 1 correctly-escalated insufficiency.

**Most impactful single agent action:** FE#6's decision to instrument `document.activeElement` over time instead of accepting the intermittent pass — it converted "flaky test" into a diagnosed HIGH a11y defect with a reproduction, and the resulting strengthened regression guard is now the standing proof the fix holds. Runner-up: FE#8's stale-baseline diagnosis, which reframed the entire bundle FAIL from "t5's bug" to "the repo's hidden debt" and produced this sprint's most reusable planning insight (§6 G1).

**Recurring failure pattern:** defaults and baselines nobody re-measured — a 3rd-party library's default focus/role behavior (G2) and a stale doc baseline treated as a gate premise (G1) are the same shape: **an unverified inherited assumption doing load-bearing work.** The sprint's own verify-then-implement discipline (applied to codebase shapes) needs extending to library behavior and doc-cited numbers.

---

## 6. Protocol Gaps Identified

> Code-not-prompt check applied to each row below.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| **G1 — Bundle-gate latent-weight attribution: the first importer of a subtree pays for all pre-existing weight, and a stale doc baseline hid the approaching gate.** The Known-Issues "~700 kB" figure (last true ~2026-06-20, `ccf13a6`) was 18 days stale; the real pre-party entry chunk was ~1,025 kB — over the auditor's 1,000 kB gate BEFORE this sprint. Nobody measured at plan time; AUD#5 initially reasoned from the doc figure; the gate then fired at t5 (1,035.70 kB) because t5's `import PartyPage` was the first packet to integrate new weight — and its remediation ended up paying down OTHER sprints' accumulated react-flow debt (FE#8 measured PartyPage's own subtree at ~12 kB). | A 2-round remediation chain (FE#8+FE#9, ~28 min + 2 audits) for what one plan-time `npm run build` would have surfaced as a known cost; the FAIL was initially misattributed to t5's own code; the eventual fix (756.80 kB) is good but unplanned scope. | **PM/plan rule (route to HR / gander, pm.md + dispatch-task):** any packet that is the FIRST importer of a new subtree into the app entry (wiring/integration packets) must carry a **gate-proximity check** — the measured current main-chunk size + headroom as a citation (s1-G1 style), not a doc quotation. Companion: **doc-baseline refresh cadence** — a Known-Issues figure older than the last sprint that touched the relevant surface may not be cited as a gate premise without re-measurement (CLAUDE.md baseline refresh is already queued as DEFERRED-V2S2-2 for s4). |
| **G2 — Third-party primitive BEHAVIORAL defaults caused the sprint's one HIGH defect — the memorized token-collision gotcha's family, extended from visual to behavioral.** base-ui's PopoverPopup defaults `initialFocus` to true for keyboard opens and hardcodes `role="dialog"` (which grants an empty popup `tabindex="0"`); wired into a controlled-open quick-peek, these defaults produced a self-driven focus oscillation (~40–50 ms cycle) breaking keyboard selection. The memorized S2 gotcha ("Shadcn defaults collide with FF7 tokens → invisible text") is the same class — library defaults vs project intent — but no note covers focus/role behavior, so t3 had no prompt to check. | HIGH a11y defect shipped past 5 static layers; found only by the e2e gate; 1 remediation round + the first-pass fix itself introduced a second default-driven regression (the phantom tab stop) before FE#7 caught it in verification. | Two-part: (a) **FE spec note (route to HR / gander, frontend-engineer.md):** before wiring any third-party primitive into a controlled-open, focus-sensitive, or non-modal pattern, READ its default focus-management and role semantics (initialFocus/autoFocus, useRole/forced roles, focus-trap) and override explicitly — defaults are written for the modal-dialog case; (b) **extend the memorized gotcha** (studio-alpha memory `project_shadcn_ff7_token_collision.md`) from token defaults to behavioral defaults so the checklist item surfaces at plan/implement time. §9 row 2, eval §10 row 2. |
| **G3 — `git stash` transiently swept the whole uncommitted multi-agent tree (FE#9); the operation class is absent from the destructive-ops list.** Mid-diagnosis, FE#9 ran a bare `git stash`, which — because the sprint's entire in-flight work is deliberately uncommitted until post-audit (NO-COMMIT boundary) — stashed every agent's work, not just its own file. Caught immediately via the file-change reminder, reversed with `git stash pop`, zero loss, and FE#9 self-corrected to Edit/backup round-trips. But standards.md's human-owned mutator list (`reset --hard`, `clean -f`, …) does not name `git stash`, and the guarded-push hook doesn't cover it. | Near-miss only — yet the worst case (stash conflict, pop failure, or a follow-on operation before the pop) would have destroyed ~3 hours of unaudited, uncommitted work from 6+ agents with no durability commit to fall back on for the in-flight packets. | **Code-not-prompt: standards.md Git Workflow (route via §9 row 1, human ratification):** add `git stash` (all variants) to the forbidden-without-explicit-confirmation list for pipeline agents, with the stated rationale (multi-agent uncommitted trees make whole-tree mutations destructive-by-default); prescribe the FE#9 alternative (file-scoped backup/Edit round-trips, or `git stash push -- <file>` at most, as FE#7 used). Candidate hard guard: extend the PreToolUse Bash hook to warn/deny bare `git stash` when the working tree has >N modified files. |
| **G4 — SubagentStop COMPLETE-miss, validator class, 3rd consecutive sprint (RV#1).** Exactly as p11 predicted and s1 re-predicted: the Mode-B REQVAL general-purpose spawn's COMPLETE was not auto-logged; ORC backfilled inline (seq 65) with the output confirmed on disk. Every other auto-loggable COMPLETE this sprint (9 FE, 1 PM, 1 AR) landed correctly, and no day-rollover occurred. | One manual backfill; observability held via ORC vigilance for the 3rd sprint running. The class is now 3-for-3 on Mode-B REQVAL spawns — a fully deterministic, predicted failure that still requires a human-in-the-loop workaround. | No new fix needed — **land the one already queued**: the s1 §9 row 2 gander hook batch (validator class + day-rollover class + self-test fixtures). This row exists to escalate priority: three consecutive identical sightings of a specified, unlanded fix is the definition of improvement debt. |
| **G5 — Archivist drift, 3rd consecutive sighting, mutated: paths now verified, commit inventory now re-narrated wrong.** The s2 entry states "Commits (5 total)" over a 7-item list (actual: 7+ceremony); describes ceremony `0a0536e` as "stitching t1–t4 + remediation rounds" (it is code-free coordination staging) AND attaches it to the parent program in dependencies (that ceremony is `290de04`); omits `87dc529` (t3-rem) from the commit list, folding the fix into t3's commit; drops `ui-store.ts` from the t5 commit; and characterizes materia-tint.ts as "Zod-validated" (no Zod in the file). All of this despite AR#1's own Stage-3 log claiming "7 commits verbatim per ORC facts" — and despite the s1 correction addendum (AR#2, seq 19–20) plus the drift tag riding this sprint's pm-preflight checklist. The path-verification discipline s1 demanded DID land behaviorally (all cited paths exist); the drift moved to the artifact class the AR does not mechanically verify. | The durable record misstates which commit contains the HIGH-defect fix and what the ceremony commit is — precisely the provenance a future engineer greps for when bisecting. Prompt-level admonitions ("no paraphrasing") demonstrably do not fix this class: three sprints, three forms. | **Code-not-prompt (route to HR / gander, archivist.md — escalates s1 §9 row 4):** commit inventories in archive entries must be **copied verbatim from the commit_record's `<commits>` block** (sha, subject, task/audit trailers) with counts computed from the copied list — never re-narrated; any commit characterization beyond the copied fields requires a Read of the commit diff (the AR has Read; `git show` facts can be supplied by ORC in the input facts). Add the correction addendum for THIS entry (AR#2 pattern) to the next session's queue. Eval: §10 row 3. |
| **G6 — LOW: the t6 spec commit (`dbc4b87`, 04:00:40) landed before its packet's audit verdict (AUD#8 spawned the same tick, PASS 04:04:30) — a commit-packet trigger deviation.** Mitigated and disclosed: the spec's runtime behavior had already been independently executed green three times (AUD#6 ×2, AUD#7 ×1), and AUD#8 explicitly framed itself as a quality audit of the committed artifact. But commit-packet's contract is "use after the packet's audit PASS," and had AUD#8 FAILed, the defective spec would already be in history, requiring a follow-up commit and breaking the per-packet commit↔verdict correspondence the trailers assert. | None materialized (AUD#8 passed clean). Risk is to the audit-trail invariant, not the code: `dbc4b87`'s `Audit: PASS` trailer was written before the verdict existed. | **commit-packet note (route to HR / gander):** batch-committing after a family re-audit is fine for packets whose verdicts exist; a packet still awaiting its own verdict must either be held out of the batch (~4 min cost here) or its commit body must explicitly record the pre-verdict rationale and the prior independent runs relied upon. |

**Adjudicated NOT-a-gap (recorded so it is not miscounted later):** the t6 FE packet describes test #5 as a `test.fail()` known defect while the committed spec is the post-t3-rem STRONGER version (hard regression guard, 511 lines vs the packet's 503). The divergence direction is correct — packet-time honesty about a defect, then strengthening at remediation — and both AUD#8 and REQVAL pre-recorded it. This is the flag-then-strengthen pattern working; no fix wanted.

---

## 7. Final Deliverable State

**App/Service:** `/home/jhber/projects/gander-studio-alpha` (branch `feat/studio-sessions-feed-agentstats`; durability commits `7359da5` t1 / `b9dffa9` t2 / `82c2400` t3 / `2c23c7e` t4 / `87dc529` t3-rem / `3a6a277` t5+rem1+rem2 / `dbc4b87` t6 + ceremony `0a0536e`; **NOT pushed** — the human's "push this sprint" opt-in is recorded, but the Layer-2 gate sequences the guarded auto-push after Step 4.5; if 4.5 passes, ORC may run `git push origin feat/studio-sessions-feed-agentstats`, else it remains human-owned).
**Build:** `npm run lint` (tsc ×3) clean at every packet and re-verified at AUD#7/AUD#8; client vitest 37/37 (6 files); production build main entry chunk **756.80 kB** (gzip 227.18), 243.2 kB under the 1 MB gate, with PartyPage/GraphPage/ProgramDagPage/ComposePage split to lazy chunks; zero server/shared changes.
**Runtime:** Tier-2 e2e 19/19 green on THREE independent runs (FE#6 authoring 43.8s; AUD#6 re-runs; AUD#8 41.6s) against live `roster.getParty` (13 real members). **DONE-PENDING-4.5**: human browser check outstanding; dual-width screenshots staged at `packages/client/test-results/party-shell-screenshots/{desktop-1280,mobile-390}.png`.

**Features delivered (all client — the first v2 surface):**
- `packages/client/src/store/ui-store.ts`: `selectedAgentCode`/`setSelectedAgentCode` (seam `s2-to-s3-nav-contract`, ephemeral) + `'party'` first member of the 10-member AppMode union + **party as the DEFAULT route** (partialize still persists only `muted`, so hydrate always lands on party).
- `packages/client/src/constants/navigation.ts`: `RAIL_ITEMS` (Roster→browse interim / Sessions / Progression / Programs, typed against AppMode); `NAV_ITEMS` untouched (both nav surfaces coexist until s4).
- `packages/client/src/components/party/`: `materia-tint.ts` (the W1 single-source `materiaTint(token, pct)` color-mix helper — the raw idiom exists in exactly one file), `PortraitFrame.tsx` (asset-free gradient portrait, monogram, no glow), `StatBar.tsx` (progressbar aria incl. the N/A-with-reason variant), `PartyMemberCard.tsx` (single-tab-stop card, RoleTag, controlled Popover quick-peek with the G2 fix: `initialFocus={false}` + `role="presentation"`), `SubmenuRail.tsx` (self-contained, hoistable, `hidden lg:flex`), `__tests__/` (StatBar + PartyMemberCard view-model units).
- `packages/client/src/pages/PartyPage.tsx` + `hooks/useParty.ts`: live envelope consumption (`{members, diagnostics, activityAnchor}` per program.md §5 note 1), four mutually-exclusive states (loading = 6 shimmer skeletons, empty + Browse CTA, error + Retry-that-refetches, default ≤6 cards in server order), unobtrusive diagnostics footnote when counts are non-zero.
- `packages/client/src/components/ModeContent.tsx`: route-level code-splitting — PartyPage + the three react-flow importers lazy on one shared Suspense/ShimmerBox boundary (`aria-busy` + sr-only label).
- `packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` (511 lines, 19 tests): the sprint's standing regression gate — live default-route render, per-card composition, popover hover+keyboard, sustained-focus/zero-blur guard, W3 destination-marker rail nav, aria-current interim state, diagnostics footnote (drift-safe regex), mocked loading/empty/error via route interception, BottomTabBar 9-tab no-regression, computed-style legibility, dual-viewport overflow + screenshots.

**Key contracts the next engineer (s3-drilldowns, s4-retirement planning) needs:**
- **`s2-to-s3-nav-contract` is LIVE but interim-pointed:** card click sets `selectedAgentCode(code)` then `setActiveMode('browse')`; the Roster rail item also maps to `'browse'`. s3 introduces the agent-detail mode and REPOINTS both (comments mark the interim mappings). The store contract itself is final.
- **`s2-to-s4-nav-shell`:** SubmenuRail reads only `useUIStore` + `RAIL_ITEMS` and mounts page-locally in PartyPage behind `hidden lg:flex` — s4's hoist is a mount move, not a rewrite. Known consequences until then: no rail item ever shows `aria-current` on the party surface (asserted as correct), HA-2 reload-only return-to-party, HA-1 no collapse/expand.
- **The bundle now has ~243 kB of gate headroom, not ~300 kB of nominal slack** — and CLAUDE.md's "~700 kB" Known-Issues line is stale (real: 756.80 kB post-split); refresh is DEFERRED-V2S2-2 (s4 docs scope). Any future first-importer wiring packet should re-measure (§6 G1).
- **base-ui Popover in controlled-open mode requires explicit `initialFocus`/`role` overrides** (§6 G2) — s3's drilldown surfaces will hit the same defaults if they use popover/dialog primitives.
- Pre-existing 390px global header/main overflow (~16px, `Header.tsx`/ModeContent fixed padding) is DEFERRED-V2S2-1 → s4 responsive scope; the party surface itself is clean at 390.
- The W2 substitution mapping (Card→PartyMemberCard, Badge→RoleTag, Progress→StatBar, Skeleton→shimmer-box, Alert→error-state) is Critic-RATIFIED and recorded in the file headers — do not "restore" raw Shadcn primitives (memorized collision gotcha).

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `prog-studio-v2-2026-07-s2-party-shell`

**xp_gained:**
- surface: Skills | delta: dispatch-task's warning-resolution amendment branch exercised for the first time this program — 5 Critic WARNINGs converted to enforced SCs/practices in one bounded round without re-decomposition, and all 5 held downstream
- surface: Skills | delta: e2e-gate-as-packet (t6) validated the p10-G3 CLI-Playwright-ownership doctrine — the gate caught a HIGH keyboard defect that 5 static audits legitimately could not see
- surface: Agents | delta: remediation-conduct maturity — FE#8 refused scope expansion and diagnosed the stale-baseline root cause instead of forcing a fix; FE#7 caught its own first-pass fix's new regression during verification and strengthened the failing test rather than passing it
- surface: Rules | delta: two new named gap classes with mechanical fixes — bundle-gate latent-weight attribution (first importer pays for all pre-existing weight) and primitive behavioral-default collision (the memorized token-collision gotcha extended to focus/role behavior)

**levels_advanced:**
- First v2 SURFACE shipped (s1 was data-only): party screen live as the default route against real corpus data, with a standing 19-test regression gate run green by three independent executors
- The program's seam machinery held under load: s1's envelope note, G4 serialization rule, and specFile contracts were all consumed correctly by a sibling sprint with zero seam defects

**new_capabilities:**
- FF7 party-screen shell: default `'party'` route, live roster cards (portrait/stat-bars/quick-peek/selection), submenu rail, selected-agent store seam, route-level code-splitting (main chunk 756.80 kB), and a Tier-2 e2e gate as durable regression infrastructure

```jsonl
{"sprint_id":"prog-studio-v2-2026-07-s2-party-shell","xp_gained":[{"surface":"Skills","delta":"warning-resolution amendment branch first exercised: 5 Critic WARNINGs converted to enforced SCs in one bounded round, all 5 held downstream"},{"surface":"Skills","delta":"e2e-gate-as-packet validated the p10-G3 CLI-Playwright doctrine — caught a HIGH keyboard defect 5 static audits could not see"},{"surface":"Agents","delta":"remediation-conduct maturity: FE#8 refused scope expansion and diagnosed the stale-baseline root cause; FE#7 caught its own fix's new regression mid-verification and strengthened the test"},{"surface":"Rules","delta":"two new named gap classes with mechanical fixes: bundle-gate latent-weight attribution (first importer pays for pre-existing weight) and primitive behavioral-default collision (token-collision gotcha extended to focus/role behavior)"}],"levels_advanced":["first v2 SURFACE shipped: party screen live as default route against real corpus data, with a standing 19-test regression gate run green by three independent executors","program seam machinery held under load: s1 envelope note, G4 serialization, and specFile contracts consumed by a sibling with zero seam defects"],"new_capabilities":["FF7 party-screen shell: default party route, live roster cards (portrait/stat-bars/quick-peek/selection), submenu rail, selected-agent store seam, route-level code-splitting (main 756.80 kB), Tier-2 e2e gate as durable regression infrastructure"]}
```

---

## 8. Skill-Use Analysis

> This section is hone's primary input. Run `hone` after this post-mortem if any table below has rows.

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| pm-preflight | 1 | PARTIAL_VALUE | ORC | 2026-07-08 (s1) | Checklist demonstrably consumed (PM's 6 recurring_pattern dispositions map 1:1 to it; s1 G1/G4 both visibly applied in the plan) — but the physical-path symlink workaround was required for the THIRD consecutive sprint (seq 22); and the checklist carried the archivist-drift tag yet the drift recurred anyway (prompt-level tags don't fix that class — §6 G5) |
| dispatch-task (warning-resolution branch, Step 1.5) | 1 | VALUABLE | ORC/PM | NEVER | First exercise this program: CR PASS + 5 WARNINGs routed to a PM amendment outside Critic round caps — no re-decomposition, no packet/dependency changes, and every resolution materialized as an enforced SC or recorded practice downstream (W1 grep-verified, W2 REQVAL-pre-adjudicated, W3 AUD#8-verified, W5 → HA items). The branch is proven |
| sc-locked-value-consistency | 1 | VALUABLE | ORC | NEVER | 0 findings (report on disk); the plan authored no locked-value or diff-gated SCs by design — precheck-clean at authorship for the second consecutive sprint |
| jidoka | 0 (not run) | NOT_TRIGGERED | ORC | NEVER | No skip-adjudication NOTE was event-logged this sprint (s1 logged one at its seq 46) — a minor process-visibility regression, though the mitigation (verify-then-implement phrasing on every codebase claim + CR disk ratifications) was the s1-G1 alternative working as intended. The two facts nobody verified (bundle baseline, base-ui defaults) are outside jidoka's current pre-read remit — they were runtime/doc facts, not packet corpus-fact assertions |
| assign-agents / env-preflight | 1 + 1 | VALUABLE | ORC | NEVER | env-preflight (seq 29) validated trpc health + non-empty agent/skill lists + `roster.getParty` members before the FE wave — first live-API FE sprint of the program, clean; s1's "/health lives on the tRPC path" forward-note consumed correctly. Expectation manifest receipt items later consumed verbatim by AUD#8's coverage-vs-manifest check |
| audit-pipeline | 8 verdicts | VALUABLE | ORC | NEVER | 7 PASS / 1 genuine FAIL. Value stories: AUD#5's typed FAIL with single_remediation_target + first-importer attribution; AUD#7's family re-audit re-running all gates first-hand; AUD#6's anti-weakening review of the strengthened test; AUD#8's independent 19/19 re-run + Check A. Known limit reconfirmed: the read-only MCP set cannot see interaction-class defects — by design, covered by the FE-owned gate |
| requirements-validate (Mode B) | 1 | VALUABLE | ORC | NEVER | COVERED 15/15 with file:line evidence; Step 2.5 consumed two independent e2e runs as runtime proof; staged HA-1/HA-2/HA-3 so the human accepts interim limitations knowingly; pre-recorded the git-stash incident and the packet-vs-spec divergence for this after-action. COMPLETE hook-missed (validator class, §6 G4) |
| commit-packet | 7 durability + 1 ceremony | PARTIAL_VALUE | ORC | NEVER | Rolling per-packet commits (t1/t2 @01:58, t3 @02:09, t4 @02:16, batch @04:00) kept durability current through a long remediation tail; secret grep CLEAN; **zero cross-task file bundling needed** — the s1-G4 serialization rule (ui-store t1→t5) worked, all packet files disjoint. Deduction: `dbc4b87` committed before its packet's verdict existed (§6 G6) |
| log-event (inline composition) | ~47 events, 1 UTC file | VALUABLE | ORC | NEVER | Monotonic seq 22–68, typed events, informative SPAWN notes (the remediation-cause notes at seq 51/54/58 made this after-action's timeline reconstruction trivial); RV#1's backfill composed inline as the COMPLETE itself with provenance note — cleaner than s1's separate-backfill pattern |
| after-action | 1 | VALUABLE | AA | NEVER | this document |

### 8b. Obsolescence Candidates

| Skill | Consecutive non-value sprints | Evidence | Recommended action |
|-------|------------------------------|----------|--------------------|
| _none_ | — | — | — |

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| pm-preflight | Physical-path invocation workaround required for the 3rd consecutive sprint; the `pwd -P`/`readlink -f` fix (p11 §9 row 1) remains unlanded | BROKEN_TOOL_REF — known, specified, unlanded | FIX_TOOL_REF: escalate in the gander batch; three consecutive workarounds |
| commit-packet | ORC batch-committed three packets after AUD#7's family re-audit, including t6 whose own verdict did not yet exist; the skill's trigger ("after audit PASS on the packet") has no guidance for mixed batches at a family-re-audit boundary | AMBIGUOUS_STEP — the family-re-audit + test-only-packet case is unaddressed | CLARIFY per §6 G6: hold not-yet-verdicted packets out of the batch, or require a pre-verdict rationale in the commit body |
| jidoka | Skip happened silently (no adjudication NOTE event), unlike s1; and the sprint's two costly unverified facts (doc baseline, library behavioral defaults) sit outside jidoka's packet-fact remit entirely | AMBIGUOUS_STEP — skip-logging not mandated; pre-read remit scoped to packet corpus-facts only | CLARIFY: require the skip NOTE always; consider extending the s1-proposed corpus-probe rider to cover gate premises (measured build size) for wiring packets — overlaps §9 row 3, prefer the PM-rule fix there |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|--------------------------|---------------------|
| _none_ — the gate-proximity check is a PM packet rule (§9 row 3), the primitive-defaults check is an FE spec note (§9 row 2), and the commit-inventory rule is an archivist spec edit (§9 row 4); no multi-step deterministic ORC ritual emerged | — | — | — |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| _none_ | — | — |

### Hand-off to hone

Post-mortem Section 8 complete. 10 skills logged. 0 obsolescence candidates, 3 content-quality candidates (pm-preflight, commit-packet, jidoka), 0 new skill candidates, 0 drift candidates. Run the `hone` skill to act on these findings.

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

> Cross-reference: rule proposals targeting standards.md feed the quarterly HR review per .claude/rules/standards.md ## Rule-Improvement Loop.
> Cross-reference: CLAUDE.md proposals require human ratification before HR applies them — see projects/gander/CLAUDE.md ## CLAUDE.md Delta-Proposal Process.

| Target file | Proposed change | Priority | Rationale |
|-------------|----------------|----------|-----------|
| `.claude/rules/standards.md` → Git Workflow (Push & Shared-State Mutators) (gander repo; HUMAN RATIFICATION required — affects what agents may run) | Add **`git stash` (all variants)** to the forbidden-without-explicit-confirmation mutator list for pipeline agents, with rationale: under the NO-COMMIT boundary the working tree holds every in-flight agent's uncommitted work, so whole-tree stash is destructive-by-default. Permit at most file-scoped `git stash push -- <file>` with declared intent; prescribe Edit/backup-file round-trips as the default isolation technique. Companion hard guard candidate: PreToolUse Bash hook warns/denies bare `git stash` when the tree has many modified files. | HIGH | §6 G3: FE#9's bare stash transiently swept the entire multi-agent tree (caught + reversed, zero loss). The class is exactly `reset --hard`/`clean -f`-shaped and is currently unlisted. |
| `.claude/agents/frontend-engineer.md` (gander repo; route to HR via full pipeline) + studio-alpha memory note `project_shadcn_ff7_token_collision.md` (extend, don't replace) | **Primitive-behavioral-defaults gotcha:** before wiring any third-party primitive (popover/dialog/menu/tooltip) into a controlled-open, focus-sensitive, or non-modal pattern, read and explicitly override its default focus management (initialFocus/autoFocus/focus-trap) and role semantics (useRole/forced role="dialog") — library defaults assume the modal-dialog case. Memory note extension: the FF7/Shadcn TOKEN collision and this BEHAVIORAL collision are one family — primitive defaults vs project intent. | HIGH | §6 G2: the sprint's only HIGH defect was pure library defaults (auto initialFocus + forced dialog role → focus oscillation + phantom tab stop); the first-pass fix exposed the second default. s3's drilldowns will reuse these primitives. |
| `.claude/agents/pm.md` + `.claude/skills/dispatch-task/SKILL.md` (gander repo; route to HR) | **Gate-proximity rule for first-importer wiring packets:** any packet that first imports a new subtree into the app entry must carry the measured current main-chunk size + gate headroom as a citation (run the build; state the number), and a doc-cited baseline (Known-Issues etc.) older than the last sprint touching that surface may NOT serve as a gate premise without re-measurement. | HIGH | §6 G1: an 18-day-stale "~700 kB" baseline hid an already-breached gate; the FAIL was misattributed to t5 until FE#8 measured; one plan-time build would have made the code-split a planned deliverable instead of a 2-round remediation. |
| `.claude/agents/archivist.md` (gander repo; route to HR — escalates s1 §9 row 4) | **Commit-inventory verbatim rule:** archive-entry commit lists must be copied verbatim from the commit_record `<commits>` block (sha/subject/trailers), counts computed from the copied list; any characterization of a commit's contents beyond those fields requires reading the diff or the ORC-supplied stat. Pair with the s1 path-verification + UTC multi-file rules (partially effective: paths were verified this sprint; the inventory was not). | HIGH (escalated) | §6 G5: third consecutive drift sighting in a mutated form — wrong count, ceremony misdescribed twice, the t3-rem commit omitted, one fabricated "Zod-validated" characterization — one sprint after a correction addendum and with the drift tag in the preflight checklist. |
| `~/.claude/hooks/subagent-autocomplete.sh` (gander hook batch — re-escalation of s1 §9 row 2, no new content) | Land the validator-class + day-rollover fixes with self-test fixtures. | HIGH | §6 G4: validator class now 3-for-3 on Mode-B REQVAL spawns; fully specified since p11. |

---

## 10. Eval Gap Proposals

| Agent / Skill | Gap description | Suggested eval | Priority |
|---------------|----------------|----------------|----------|
| project-manager (wiring packets) | Nothing checks that a first-importer/wiring packet states measured bundle headroom (§6 G1) | Fixture plan with a wiring packet citing only a doc baseline for bundle state → expect the Critic gate (or pm-preflight extension) to flag the missing measured citation; calibrate against this sprint's t5 packet as the canonical negative | HIGH |
| frontend-engineer (primitive defaults) | No check that FE reads/overrides third-party focus/role defaults before controlled-open wiring (§6 G2) | Fixture: controlled popover opened on keyboard focus using a primitive with auto-initialFocus defaults → expect explicit initialFocus/role handling or a flagged verification note; canonical positive = FE#7's node_modules-source root-cause; canonical negative = t3's original wiring | HIGH |
| archivist (commit inventory) | No check catches re-narrated commit inventories diverging from the commit_record (§6 G5) | Fixture close-out supplying a commit_record with N commits incl. a rem commit + a code-free ceremony → assert the entry copies the block verbatim, count == N, ceremony not described as containing code; this sprint's entry is the canonical failure case | HIGH |
| Bash-guard hooks (destructive ops) | No guard exercises the bare-`git stash`-on-dirty-multi-agent-tree path (§6 G3) | Fixture: working tree with 10+ modified files across multiple "owners" → PreToolUse hook denies/warns on bare `git stash`, permits `git stash push -- <single-file>`; expected to fail until the §9 row 1 guard lands | MEDIUM |
| commit-packet | The family-re-audit batch path can commit a not-yet-verdicted packet with an `Audit: PASS` trailer (§6 G6) | Fixture: 3-packet batch where one packet's verdict is absent → expect the skill to hold that packet out or demand a pre-verdict rationale; calibrate on the dbc4b87 sequence | LOW |

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — manual observations only. (Application-code sprint; no `.claude/` agent/skill/rule/hook nodes changed.)

Manual observations:
- **No fabricated paths entered the durable record this sprint** — an s1→s2 improvement: every file path in the archive entry Glob-resolves (the drift moved to commit-inventory facts instead, §6 G5). The one dead-ish reference is semantic, not path-level: the entry points readers at `0a0536e`/the t3 commit for content that actually lives in `290de04`/`87dc529` respectively.
- **New standing runtime-gate node:** `packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` is now referenced as evidence by AUD#5/#6/#7/#8, REQVAL, and the commit record — the first e2e artifact in this repo serving as a cross-verdict evidence hub. It encodes live corpus expectations (13 roster codes, non-zero diagnostics) via drift-safe regexes, so corpus growth won't rot it.
- **Cross-sprint contract chain resolves at every hop:** brief seams → ui-store/navigation seam comments (`s2-to-s3-nav-contract`, `s2-to-s4-nav-shell`) → REQVAL R-009/R-015 evidence → s3/s4 planning inputs. program.md §5 note 1 is cited by useParty and asserted at runtime (diagnostics footnote).
- **Doc-node staleness is itself a connectivity hazard:** CLAUDE.md Known-Issues → auditor gate premise was a live (wrong) edge this sprint (§6 G1); DEFERRED-V2S2-2 tracks the refresh. Consumers should treat Known-Issues figures as pointers to re-measure, not as measurements.
- All packet/audit/REQVAL/commit artifacts cross-reference by exact on-disk path and all resolve (verified while authoring this document).
