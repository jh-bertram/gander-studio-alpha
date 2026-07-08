---
type: post-mortem
sprint: prog-studio-v2-2026-07-s3-drilldowns
date: 2026-07-08
head_sha: 44f01d0
gap_classes:
  - postmortem-as-ground-truth
  - primitive-behavioral-default-collision
  - cross-spec-interim-assertion-unmarked
  - subagentstop-complete-miss
  - archivist-paraphrase-drift
  - recurring
recurring_tags:
  - subagentstop-complete-miss
  - archivist-paraphrase-drift
  - primitive-behavioral-default-collision
  - plan-time-unverified-inherited-fact
related_sprints:
  - "[[prog-studio-v2-2026-07-s2-party-shell]]"
  - "[[prog-studio-v2-2026-07]]"
  - "[[gander-studio-p11-v2-vision]]"
status: written
---

# After-Action: prog-studio-v2-2026-07-s3-drilldowns — v2 Drill-Downs (Browse/Graph/Edit Absorption)

**Date:** 2026-07-08
**Project:** `/home/jhber/projects/gander-studio-alpha`
**Duration:** ~2h 10m (PM#0 SPAWN seq 74 @ 2026-07-08T04:49:34Z → AR#1 COMPLETE seq 124 @ 06:59:27Z; AA#1 spawned seq 123). Single UTC file (`agent-events-2026-07-08.jsonl` seq 74–124); `seq` authoritative, ORC-shell (`+00:00`) and hook (`Z`) clocks mixed as usual.
**Final State:** **Third v2 sprint shipped — the drill-down layer that absorbs Browse, Graph, and Edit.** Tier-2 sibling of `prog-studio-v2-2026-07`: AgentDetailPage (new `'agent-detail'` AppMode, lazy-from-birth, 19.79 kB chunk; main 757.76 kB < 1 MB gate, measured at the wiring packet per s2-G1), Materia/Equipment/Abilities inventory panels with provenance + honest-empty states, RelationshipPanel (RF star graph, Handle-compliant, DETECTED/INFERRED triple-encoded), ReviseSpecAction dialog (Edit absorption via existing save procedures, target-keyed contamination-guarded buffer), nav re-points (card→agent-detail; Roster rail→party; View-Full-Roster CTA deliberately retains `'browse'` + s4 TODO), and the 8-test absorption-proof e2e spec — the `s3-to-s4` seam artifact. Plan gate took **3 Critic rounds** (2 distinct disk-verified BLOCKers). The gates caught **two real defects in-sprint**: AUD#3's SA contrast FAIL (the app's historically human-caught legibility class, caught by the AUDITOR first for the first time) and t5's e2e catching the initialFocus pre-mount defect (second base-ui behavioral-default recurrence, one level deeper than s2's). Combined e2e gate (19 s2 + 8 s3 tests) **27/27 green ×4 independent post-remediation runs**; REQVAL Mode B **COVERED 14/14** with `requires_human_visual=true`. Status **DONE-PENDING-4.5**. Six durability commits (`474d686`/`54dbef8`/`0a30289`/`d7f669f`/`8f9cc76`/`44f01d0`) + planning ceremony `86d2fd0` + close ceremony `68ec6e1` on `feat/studio-sessions-feed-agentstats`, **NOT pushed** (human-owned; prior push covered only through `581ccfa`, seq 73).

---

## 1. Original Request

**Human (2026-07-07/08, program continuation):** Execute the s3-drilldowns sibling of the ratified v2 program — detail views absorbing Browse (inventory), Graph (relationships), and Edit (spec revision) into the party-screen drill-down, per the p11 v2-vision package. Planning was authorized ahead of s2's Step-4.5 confirmation (PM SPAWN seq 74 note: "planning-only ahead of s2 4.5 confirmation; implementation dispatch gated on human OK"); the human then confirmed s2's browser check AND ratified three s3 design decisions in one pass (seq 87, "ok ×3"): (1) 6-agent homescreen retained (13-role catalog deferred to s4), (2) View-Full-Roster CTA retains browse until s4, (3) Roster rail = party-home affordance carrying aria-current at home.

**Brief files:** `docs/programs/prog-studio-v2-2026-07/sprints/prog-studio-v2-2026-07-s3-drilldowns/orchestrator_brief.md` (5 sprint SCs; consumes `s2-to-s3-nav-contract`; owns `provides_to: [s4-retirement]` — the absorption-proof seam), decomposed as `...-PM-1783486174.md` (r0), revised as `...-rev-PM-1783487343.md` (rev1, post-BLOCK) and `...-rev2-PM-1783488067.md` (rev2, post-BLOCK-new → CR#3 PASS). Final shape: 6 FE packets, `{t1∥t2∥t3}→t4a→t4b→t5`.

**Scope at intake:** s1's data layer (`roster.getAgentDetail` live) and s2's party shell (default route, cards, rail, `selectedAgentCode` seam) both existed; no detail surface did. Client-only sprint: no server/shared/schema changes (R-014), reuse existing `agent.get/save`+`skill.get/save`, three interim `'browse'` nav targets to resolve, cross-sprint edits to the s2 e2e spec strictly enumerated.

**Skill invoked:** dispatch-task pipeline (PM r0 → CR#1 **BLOCK** → rev1 → CR#2 **BLOCK-new** → rev2 → CR#3 **PASS** → planning ceremony → human 4.5-confirm gate → staged FE waves with rolling audits → 2 remediation chains → batch durability commits → REQVAL Mode B → commit-packet close → archivist).

---

## 2. Agent Activity Log

Seq references: `docs/events/agent-events-2026-07-08.jsonl` seq 74–124.

### Phase 1: Plan gate — 3 Critic rounds, 2 distinct disk-verified BLOCKers (seq 74–86)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 74→75 | 04:49→05:01 | SPAWN→COMPLETE | PM#0 (r0) | 6-packet decomposition, spawned planning-only ahead of the s2 4.5 gate. Preamble asserted "**Both** interim 'browse' targets shipped by s2 are re-pointed" — quoting the s2 after-action §7 handoff instead of disk-verifying (§6 G1). routing_notes carried 6 recurring_pattern dispositions incl. s2-G1 (bundle measured at wiring), s2-G2 (explicit focus/role on the dialog), s2-G3 (no stash), s1-G1 (verify-then-implement on unread claims) |
| 76→77 | 05:01→05:08 | SPAWN→**CRITIQUE_BLOCK** | CR#1 | **BLOCKER (disk-verified): THREE browse targets, not two** — `handleViewRoster` (PartyPage.tsx:206, the empty-state "View Full Roster" CTA, regression-tested at s2 spec L364-398) uncounted → t4b SC(c) UNSATISFIABLE as written. Explicitly traced the miscount to the s2 post-mortem §7 line 213 "both" — "the plan inherited that miscount instead of verifying on disk (exactly the s1-G1 class the PM claims to honor)" |
| 78→79 | 05:09→05:16 | SPAWN→COMPLETE | PM#0 (rev1) | Enumerated all three targets; decision matrix: handleSelect→`'agent-detail'`, Roster rail→`'party'`, handleViewRoster DELIBERATELY retains `'browse'` + s4 TODO (semantic target is the deferred 13-role catalog); t4b SCs rescoped to satisfiable |
| 80→81 | 05:16→05:20 | SPAWN→**CRITIQUE_BLOCK** | CR#2 | **NEW blocker (same-blocker-twice check explicitly run — CR#1's does NOT survive):** the Roster→`'party'` re-point falsifies the s2 aria-current invariant test (s2 spec L313-325 asserts count 0, rationale comment claims "activeMode==='party' never matches a RAIL_ITEMS mode") — t5 authorized only TWO s2 touches, so a green suite was structurally impossible (§6 G3). Plus 1 WARNING: t4a context_files cited a dead path (`components/party/party-roster.ts` — it's a SERVER parser; real StatBar N/A contract at StatBar.tsx:29/:51) |
| 82→83 | 05:21→05:27 | SPAWN→COMPLETE | PM#0 (rev2) | Authorized-touch list TWO→**THREE named s2-spec changes + must_not_contain forbids a FOURTH**; L364-398 CTA test explicitly protected; aria-current semantic change declared as an intended, human-visible UX side-effect (ratification item); t4a context path corrected. Only SC change is a TIGHTENING |
| 84→85 | 05:27→05:29 | SPAWN→CRITIQUE_PASS | CR#3 | PASS; third-order scan of the s2 spec confirmed no additional coupling beyond the three authorized changes (tab-order, KEEP-clicks, BottomTabBar all independent of Roster.mode); sc-precheck 0 findings ×3 rounds |
| 86 | 05:30 | BACKFILL_SCAN | ORC#0 | Auto-fire scan clean (checked=0); planning ceremony `86d2fd0` @ 05:30:09Z stages the 3-round plan corpus |

### Phase 2: Human gate, then FE waves with rolling audits (seq 87–119)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 87 | 05:34:09 | NOTE | ORC#0 | **s2 Step 4.5 CONFIRMED ("ok ×3") — s2 fully DONE; the same pass RATIFIES s3's three design decisions** (6-agent homescreen / retained CTA / Roster-rail-as-party-home) — implementation dispatch unlocked |
| 88/89/90→91/92/93 | 05:34→05:46 | SPAWN×3→COMPLETE×3 | FE#1 (t1), FE#2 (t2), FE#3 (t3) | Parallel triple, disjoint files: t1 InventoryPanels (Materia/Equipment/Abilities + ProvenanceChip + honest-empty first-class states); t2 RelationshipPanel (RF star, BOTH Handles per node mirroring GraphNode, triple-encoded confidence); t3 ReviseSpecAction + target-keyed reducer buffer (6 contamination-guard unit tests) |
| 95/96/97 | 05:47 | SPAWN×3 | AUD#1/#2/#3 | Parallel audits; FE#4 (t4a) spawned same tick (seq 94) |
| 98/99 | 05:50–05:51 | AUDIT_PASS ×2 | AUD#2, AUD#1 | First-pass PASS both. AUD#2 adjudicated the 298-vs-95-line overage SCOPE-FAITHFUL and forward-flagged `VISUAL_BLINDSPOT_KNOWN`: t5 MUST assert a VISIBLE `.react-flow__edge`, not canvas-mount (consumed verbatim by AUD#8's seam checks) |
| 100 | 05:54:35 | **AUDIT_FAIL** | AUD#3 (t3) | **The headline catch: SA FAIL, CRITICAL ×2 — `--redb` (#e05555) error TEXT on the `--sfh` (#1a3530) dialog surface = 3.51:1 < WCAG AA 4.5:1** (ReviseSpecAction L161/L187), untraceable to any contrast_pairs row (spec AA-verifies --redb only against --void at 5.22:1). QA/SX of the same packet PASS (contamination reducer traced end-to-end; explicit focus/role adjudicated PASS). Typed remediation: --redb demoted to border accent, text --w/--wd |
| 101→104→107 | 05:58→06:05 | COMPLETE→SPAWN→AUDIT_PASS | FE#4/AUD#4 (t4a) | AgentDetailPage + `'agent-detail'` union + lazy PAGE_MAP entry; **bundle measured at the wiring packet: 757.76 kB main + 19.79 kB lazy detail chunk (s2-G1 honored)**; live_api probes FE/DI/ZZZ; `ROSTER_AGENT_NAME_BY_CODE` 12-entry map adjudicated SANCTIONED SMALL DUPLICATION (AgentDetailSchema carries no `name`/`specFile`; all 12 entries disk-verified; BE follow-up deferred → V2S3-1) |
| 102→106→109→112 | 05:58→06:09 | rem chain 1 | FE#7 (t3-rem), AUD#5 | Contrast fix: text →`--w` (13.16:1 AAA on --sfh, traces to an EXPLICIT contrast_pairs row), --redb/--mg demoted to 3px borderLeft accents (≥3:1 non-text); pre-emptively fixed the advisory --mg pairing too. AUD#5 recomputed all ratios first-hand from live globals.css hex; reducer/test files sha256-verified byte-identical (no regression possible) |
| 103→105→110→111 | 05:58→06:09 | t4b chain | FE#5, AUD#6 | Nav re-points: handleSelect→agent-detail, Roster rail→party, CTA retained+TODO. AUD#6 correctly attributed the working-tree's 4-file diff (2 = upstream t4a), noted the s2 spec KNOWN-EXPECTED red until t5's authorized updates |
| 108→113 | 06:05→06:30 | SPAWN→COMPLETE | FE#6 (t5) | **The e2e gate packet, 2nd sprint running:** new 8-test absorption-proof spec (414 lines) + exactly the three authorized s2 edits (git-diff verified); live-data survey (curl) drove position-deterministic card selection + the DI route-mock design. **Found the sprint's second real defect: PROOF 3a `toBeFocused()` FAILS — 26/27** — root-caused to node_modules source (FloatingFocusManager.js:397-420): `initialFocus={textareaRef}` resolves in a queueMicrotask BEFORE the async-loaded Textarea mounts → focus deterministically lands on the Cancel button on every cold open. Kept the assertion (packet's own "explicit focus proof" language), flagged out-of-scope, supplied a remediation sketch. Also ran the full 182-test suite documentation-only: 125/182, all 57 failures classified pre-existing/environmental |
| 114→115→116→118 | 06:31→06:44 | rem chain 2 | FE#8 (t3-rem2), AUD#7 | Fix per sketch (a) + refinement: function-form `initialFocus={() => textareaRef.current ?? false}` (cache-hit path free) + once-per-open `useLayoutEffect` deterministic focus post-mount. 27/27 ×2 runs. AUD#7 verified the function-form contract against the vendored base-ui source (`false` ⇒ early-return, no Cancel fallback) and ran the independent third 27/27 |
| 117→119 | 06:40→06:46 | SPAWN→AUDIT_PASS | AUD#8 (t5) | Check A clean (the `.catch()` at L379 adjudicated a poll-guard, assertion unconditional); `three_change_discipline verdict="EXACTLY-THREE-CONFIRMED"` by git diff (22+/12-, three hunks, CTA test untouched = sole browse-page ref); **independent solo run 27/27 (31.1s) — after the shared :5173 Vite dev server crashed mid-run under 2-worker parallel load concurrent with AUD#7's run (net::ERR_CONNECTION_REFUSED); restarted Vite, re-ran solo, clean** (§6 adjudicated environmental) |

### Phase 3: Close — batch commits → REQVAL → archive → after-action (seq 120–124)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| — | 06:47:48 | commit ×6 | ORC (commit-packet) | All six durability commits landed as one batch AFTER the last verdict (06:46:49) — **no commit-before-verdict this sprint (s2-G6 did not recur)**, but rolling per-packet durability was abandoned: t1/t2 sat audit-PASSed-but-uncommitted ~57 min (§8 commit-packet row) |
| 120→121 | 06:47→06:54 | SPAWN→COMPLETE (backfill) | RV#1 | **COVERED 14/14** (5 brief SCs + program constraints + rev2 plan constraints incl. the three-change discipline R-011 and the G2-class R-013) with file:line + commit evidence; both in-sprint defects cited as closed; HA-1/2/3 recorded RATIFIED (seq 87), HA-4 (Step 4.5) BLOCKING → DONE-PENDING-4.5. **COMPLETE hook-missed — validator class, 4th consecutive sprint** — ORC backfilled inline (§6 G4) |
| — | 06:54:22–:38 | commit_record + ceremony | ORC (commit-packet) | Record schema 2.0, 6 commits with task:/Audit: PASS trailers, secret grep CLEAN — but its `<subject>` fields are ABBREVIATED re-typings of the actual git subjects (§6 G5 upstream link); ceremony `68ec6e1` stages coordination artifacts only |
| 122→124 | 06:54→06:59 | SPAWN→COMPLETE | AR#1 | archive_entry appended (`docs/project_log.md` lines 2611–2706) — **commit inventory transcribed VERBATIM from the commit_record for the first time (the s2 §9 fix WORKING for its target class); narrative layer drifted anyway** (§4 verdict, §6 G5) |
| 123 | 06:54:50 | SPAWN | AA#1 | this after-action |

**Feedback loops:** 2 plan-gate revision rounds (both BLOCKers real, both disk-verified, each resolved in exactly one revision — CR#2's same-blocker-twice check confirmed no re-block) + 2 implementation remediation rounds across one family (t3): rem1 contrast (FE#7→AUD#5 PASS, 1 round), rem2 focus (FE#8→AUD#7 PASS, 1 round). The remediation glob returns 2 file pairs — all accounted for; no hidden cycles.

**Root cause of failure(s):** AUD#3's FAIL was a **design-token pairing never verified against the new surface** — --redb had been AA-verified against --void (and lightened for exactly that pairing in p10's 4b8fb5c), but t3 put it on --sfh, a lighter surface with no contrast_pairs row; the binding SC(e) traceability clause made this mechanically catchable and the auditor caught it. The t5-found HIGH-class defect was **base-ui behavioral defaults, second recurrence, one level deeper**: t3 FOLLOWED the s2-G2 rule (explicit `initialFocus`/`role`/`aria-modal` — AUD#3 adjudicated the props PASS), but the library resolves `initialFocus` once, pre-mount, in a microtask — an explicit ref to an async-mounted element is structurally null at resolution time. The plan-gate failures were both **inherited-assertion classes**: an after-action handoff treated as ground truth (G1) and a predecessor spec's interim state asserted as invariant (G3).

**Deviation from PM brief:** none of substance. The one near-miss — AgentDetailSchema lacking `name`/`specFile` — was resolved client-side via the AUD#4-sanctioned 12-entry map with a deferred BE packet, rather than an unauthorized schema change (correct boundary conduct). t5's full-suite documentation run (55 pre-existing failures classified, zero fixed) was disclosed, in-scope-as-documentation, and is exactly the honest posture the packet demanded.

---

## 3. Post-Delivery: Runtime Bugs (if any)

None post-close as of this writing — and the sprint is deliberately NOT fully closed: **DONE-PENDING-4.5** holds until the human browser walkthrough (REQVAL HA-4, blocking). Both real defects were found and fixed IN-sprint by the gates:

**Defect 1 — contrast (found by AUD#3, the static SA gate).** `--redb` error text on the `--sfh` dialog surface, 3.51:1 vs AA 4.5:1, both error paragraphs (ReviseSpecAction L161/L187). This is the app's historical **human-caught** class (the memorized invisible-text gotcha; DEFERRED-006's --redb-on---void was also a human-era catch) — this sprint is the first time the AUDITOR caught it before any human or runtime gate, because the v2 design spec's binding contrast_pairs traceability clause (t3 SC(e)) turned "looks dim" into a mechanically checkable citation requirement. Fixed in rem1 (`--w` text + --redb border accent per DESIGN.md's Error-state rule); AUD#5 recomputed every ratio first-hand.

**Defect 2 — initialFocus pre-mount (found by FE#6's t5 e2e gate).** On every cold open of the revise dialog, focus landed on the **Cancel button** instead of the editor: base-ui resolves `initialFocus` once in a queueMicrotask immediately on open, before the async tRPC load mounts the Textarea, then falls back to `focusableElements[0]`. Deterministic, not flaky — and invisible to all five static audits that had passed the dialog's focus props as explicitly-and-correctly set. A keyboard user's next keystroke lands on Cancel — a dismissal-adjacent hazard. Fixed in rem2 (function-form initialFocus + once-per-open post-mount `useLayoutEffect`); 27/27 ×4 runs since. **Second consecutive sprint in which the e2e-gate-as-packet caught the sprint's worst defect after static layers legitimately could not** — and second base-ui behavioral-default recurrence (§6 G2).

Open at close (declared, human-owned): HA-4 Step 4.5 walkthrough (suggested path staged in the REQVAL report); s4 inheritances — CTA re-point when `'browse'` leaves the union, rail collapse/expand, 390px header overflow, stale CLAUDE.md baselines, 13-role catalog entry; DEFERRED-V2S3-1 (retire `ROSTER_AGENT_NAME_BY_CODE` via schema extension), DEFERRED-V2S3-2 (--mg-on---sfh contrast_pairs row if ever used as text).

---

## 4. QA Gap Analysis

**Current QA protocol:** PM decomposition with recurring-pattern dispositions → Critic plan gate with disk-verified challenges + same-blocker-twice check (2 BLOCK rounds this sprint) → sc-precheck per round → human ratification gate before implementation dispatch → per-packet static audit (SA/QA/SX v2.0) → FE-owned CLI-Playwright e2e gate as its own packet (t5) → per-defect remediation with independent re-audit → batch durability commits → REQVAL Mode B → commit-packet close → archivist.

**What this caught:**
- **CR#1's inherited-under-count BLOCK (disk-verified).** The plan quoted the s2 after-action's "both browse targets"; the Critic counted three on disk, proved t4b's SC unsatisfiable as written, and — critically — named the inheritance chain: the s2 post-mortem §7 handoff itself under-counted. A plan defect caught before any agent burned time on an impossible SC.
- **CR#2's invariant-collision BLOCK (new, not a re-block).** The rail-to-'party' resolution falsified an s2 e2e assertion t5 wasn't authorized to touch — a cross-task contradiction that would have surfaced as an unfixable red suite at the sprint's last packet. CR#2 also ran the same-blocker-twice check explicitly and documented that CR#1's blocker did not survive, keeping the 3-round chain honest.
- **AUD#3's contrast FAIL — the first auditor-caught instance of the app's historically human-caught legibility class.** Precise: measured ratio, both line numbers, the missing contrast_pairs row, and a typed remediation that rem1 implemented verbatim. The v2 spec's traceability clause is what made this catchable — a token pairing without an AA row is a violation even before anyone judges how it looks.
- **The t5 e2e gate caught the focus defect five static passes could not** — and FE#6 refused the easy outs: kept the failing assertion (26/27) rather than weakening it, root-caused into node_modules source, and classified all 57 full-suite failures rather than hand-waving them.
- **The three-change discipline on cross-sprint files held end-to-end:** rev2 authorized exactly three named s2-spec edits and forbade a fourth; FE#6 delivered exactly three hunks; AUD#8 verified "EXACTLY-THREE-CONFIRMED" by git diff; REQVAL re-verified as R-011. The protected L364-398 CTA test survives as the sole intentional browse-page reference.
- **AUD#2's forward-flag pattern worked:** its VISUAL_BLINDSPOT_KNOWN recommendation ("t5 must assert a VISIBLE edge, count > 0") was consumed verbatim by t5's PROOF 2 and checked off by AUD#8's seam_quality_checks — an audit-to-audit contract across packets.
- **AUD#4's sanctioned-duplication adjudication** turned a potential silent hack into a documented, disk-verified, deferral-tracked decision (all 12 map entries checked against real frontmatter; non-derivability proven; BE follow-up filed).
- **Boundary conduct under pressure:** FE#6 flagged-not-fixed an out-of-scope defect; FE#8 touched exactly one authorized file; nobody ran `git stash` (s2-G3 held); no commit preceded its verdict (s2-G6 did not recur).

**What this missed (process-shape; the shipped surface is defect-remediated):**
- **The plan gate cost 2 rounds on defects that were both *inherited assertions*.** The PM disk-verified codebase claims per s1-G1 — but quoted the s2 after-action's enumeration without the same discipline (G1), and nobody (PM r0, CR#1) modeled the s2 spec's aria-current test as a coupled invariant until CR#2 (G3). ~27 minutes and 4 extra plan-gate spawns for facts one file-read and one spec-grep would have settled at r0.
- **The s2-G2 prompt-level rule was followed and still insufficient.** Explicit focus props were set, audited, and passed — the defect lived in the library's *resolution timing*, one level below the rule's vocabulary. Prompt-level guidance demonstrably cannot keep up with this class; it needs a code artifact (§6 G2).
- **The archivist drifted again — 4th consecutive sighting — in the layer the verbatim mandate doesn't cover.** See the precision verdict below.
- **The validator-class hook miss fired again exactly as predicted** — RV#1's COMPLETE, 4th consecutive sprint, fix still unlanded in the gander batch (§6 G4).
- **No env-preflight event for s3's live-API FE waves** (s2's dev server was still up and s2's preflight had validated it; AUD#4/AUD#6 ran their own live probes; t5 curl-surveyed) — worked out, but the skill's trigger condition ("before any FE wave against a live API") was technically unmet without an adjudication note (§8).
- Minor: RV#1 and AR#1 self-stamped artifact timestamps drift hours from event-log time (REQVAL `<generated>` 01:20:00Z, AR Stage-1 22:17:00Z vs actual ~06:54Z) — the event log remains authoritative; cosmetic but grep-hostile.

**Archive-entry precision verdict (parent-requested):** **SPLIT — the s2 §9 row-4 fix WORKED for its target class; the drift survived by migrating layers again.** Verified correct against artifacts: the `<commits>` block is **byte-identical to the commit_record's** (6 entries, full shas, count correct, ceremony correctly excluded, `commit_verification_note` present) — AR#1's "VERBATIM from XML source; no paraphrase drift" attestation is TRUE for the inventory, breaking the 3-sprint commit-fact drift streak. Also correct: 23-spawn census (recount matches: PM×3/CR×3/FE×8/AUD×8/RV×1), 27/27 ×4 runs, REQVAL 14/14, the three human ratifications, open_at_close/deferral lists, 3-cycle review narrative. **Drifted (all in the synthesis layer):** (a) dependencies name the s2 sibling **`prog-studio-v2-2026-07-s2-dashboard-core`** — a **fabricated slug** (actual: `-s2-party-shell`; "dashboard-core" appears nowhere outside the AR's own outputs) — and call it "parent sprint" (it is a sibling); (b) the contrast-defect rationale is wrong on three counts: cites **`#cf3c3c`** (actual --redb is #e05555 since 4b8fb5c), says the defect was in "**disabled buttons**" (actual: the two error-TEXT paragraphs), and describes the remediation as verifying that p10's lightened --redb "applies to the disabled states" (backwards — the *lightened* value is what fails on --sfh; the actual fix demoted --redb to a border accent and switched text to --w); (c) the focus-defect finder is misattributed — "**AUT#8** finding in t5" in the rationale and "FAIL (**AUD#7** e2e...)" in the audit_trail (actual: FE#6's t5 gate found it; AUD#7 never issued a FAIL — no such event exists); (d) upstream weak link: the commit_record the AR faithfully copied had itself **abbreviated the commit subjects** (e.g. `44f01d0` actual: "test(v2-detail): add absorption-proof e2e gate + three authorized s2 updates" → recorded: "test(v2-detail): absorption-proof e2e gate") — verbatim-from-a-paraphrase. The mechanical fix pattern is validated; it must now be extended to narrative-layer facts and to the record's own generation (§6 G5, §9 row 5). A correction addendum (AR#2 pattern) is recommended for (a)–(c).

**Recurring-class table:**

| Class | This sprint | Prior sightings | Status |
|-------|-------------|-----------------|--------|
| plan-time-unverified-inherited-fact | PM quoted the s2 AA §7 "both" under-count as ground truth → CR#1 BLOCK | s1 §6 G1 (corpus-fact citations); s2 §6 G1 (stale doc baseline as gate premise) | RECURRING, 3rd form — the class keeps mutating to whatever fact-source the rule doesn't yet name (§6 G1) |
| primitive-behavioral-default-collision | initialFocus RESOLUTION TIMING vs async mount — with the s2-G2 rule FOLLOWED (explicit props set and audited) | s2 §6 G2 (auto initialFocus + forced role → oscillation); memorized S2 token gotcha (visual form) | RECURRING, 2nd behavioral — prompt-rule insufficient; code artifact needed (§6 G2) |
| cross-spec-interim-assertion-unmarked | s2 spec asserted an interim nav state ("never matches 'party'") as an invariant; s3's ratified design legitimately broke it → CR#2 BLOCK | s2 §7 declared the state a "known consequence" but the spec encoded it as timeless | NEW class named (§6 G3) |
| subagentstop-complete-miss (validator subclass) | 1 miss: RV#1, ORC backfilled inline (seq 121, note says "4th recurrence") | s1, s2 (RV each time); p11 class origin | RECURRING — **4th consecutive**; fully-specified fix still unlanded (§6 G4) |
| archivist-paraphrase-drift | Commit inventory VERBATIM (fix working); drift migrated to narrative: fabricated sibling slug, wrong defect story, misattributed finder | s1 (fabricated paths → Glob fix); s2 (commit inventory → verbatim fix); p11 watch item | RECURRING — 4th sighting, 3rd mutation: each mechanical fix holds and the drift moves to the next unverified layer (§6 G5) |
| e2e-gate-as-packet catches what static cannot | t5 found the focus defect after 5 clean static passes | s2 t6 (focus oscillation) — doctrine's validation case | PATTERN CONFIRMED ×2 — now the program's load-bearing runtime gate (§8) |

---

## 5. Agent Performance Summary

Token accounting: no sprint report exists for this slug and COMPLETE events carry no `tokens` field — per-agent token attribution unavailable this sprint, not omitted.

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM#0 | 1 decomposition + 2 revisions | r0 BLOCKed, rev1 BLOCKed-new, rev2 PASS | Both revisions were single-round, surgical, and TIGHTENED SCs rather than weakening them; rev2's nav-decision block (retain-CTA rationale, aria-current side-effect declaration) is model quality. The r0 defect was one un-verified quotation (§6 G1) — everything the PM personally read was cited correctly |
| CR#1/#2/#3 | 3 rounds | 2 BLOCK + 1 PASS, all correct | **The plan gate earned its cost:** two real, distinct, disk-verified blockers (file:line mechanisms both times), an explicit same-blocker-twice adjudication, and a third-order coupling scan at PASS. CR#1's tracing of the miscount to the s2 post-mortem is the sprint's sharpest single piece of analysis |
| FE#1 (t1) / FE#2 (t2) | 2 | 100% audit | Clean parallel pair; t2's Handle-compliant star + triple-encoded confidence survived the RF-invisible-edges gotcha by construction |
| FE#3 (t3) | 1 | 0% audit (AUD#3 SA FAIL) / 2 defects total | The buffer/reducer core was excellent (contamination guard traced end-to-end, 6/6 units) — but shipped both sprint defects: an unrowed token pairing and the pre-mount focus hazard (the latter invisible to its own checks AND its audit) |
| FE#4 (t4a) | 1 | 100% | Composition-only assembly; measured the bundle at the wiring packet (s2-G1 applied); disclosed the name-map with a non-derivability argument AUD#4 could verify rather than a silent hack |
| FE#5 (t4b) | 1 | 100% | Exact 2-file re-point; the s4 TODO marker + deliberate-retain comment are the seam bookkeeping s4 will need |
| FE#6 (t5) | 1 | 100% (AUD#8 PASS) | **Most impactful implementer:** 8-test seam artifact, exactly-three authorized s2 edits, live-data survey, the focus-defect find with node_modules-level root cause + remediation sketch, and honest classification of 57 pre-existing failures. Kept the failing assertion at 26/27 rather than shipping a green lie |
| FE#7 (t3-rem) | 1 | 100% | Contrast fix traced to an EXPLICIT contrast_pairs row (rejected the "same-ballpark" --wd row on the reasoning that an inexact row was the original failure class); pre-emptively resolved the --mg advisory |
| FE#8 (t3-rem2) | 1 | 100% | Implemented FE#6's sketch with a genuine improvement (function-form covering the cache-hit path) and a once-per-open guard that structurally cannot steal mid-edit focus; 27/27 ×2 |
| AUD#1–#8 | 8 verdicts | 7 PASS / 1 genuine FAIL | AUD#3's FAIL is the sprint headline; AUD#2's forward-flag → AUD#8 consumption is a new audit-to-audit contract pattern; AUD#5 recomputed ratios first-hand + sha256-proved no-regression; AUD#7 verified the fix against vendored library source; AUD#8 survived a mid-run Vite crash with a clean restart-and-solo recovery |
| RV#1 | 1 | COVERED 14/14 | Adjudicated "any roster agent" against the ratified 6-of-13 scope with the capability/entry-point distinction (R-012); staged the HA walkthrough script; pre-recorded both defects for this after-action. COMPLETE hook-missed (4th), backfilled |
| AR#1 | 1 | n/a | Commit inventory verbatim (fix working); narrative layer drifted — fabricated sibling slug + wrong defect story (§4 verdict, §6 G5) |

**First-pass rate: 5/6 packets passed audit on first submission (t3 the exception); 5/6 were defect-free on first submission** (t3 carried both defects). All remediation rounds (2) converged in one round each. Plan gate: 1/3 rounds passed (by design — both BLOCKs were correct).

**Most impactful single agent action:** AUD#3 failing t3 on measured contrast. It moved the app's most persistent defect class (illegible text — historically caught by the human at Step 4.5 or later) from the human's screen into the pipeline's static gate, validating the v2 spec's binding contrast_pairs traceability as the mechanism. Runner-up: FE#6's decision to keep PROOF 3a failing at 26/27 — the assertion's honesty is what forced rem2 and produced the ×4-green regression guard.

**Recurring failure pattern:** **inherited assertions doing load-bearing work without re-verification** — an after-action's enumeration (G1), a predecessor spec's interim invariant (G3), a library's internal resolution timing beneath explicitly-set props (G2), and an archivist's synthesis-layer "knowledge" (G5) are all the same shape at four different layers. The countermeasure that keeps working is making the assertion *mechanically checkable at the point of use* (contrast rows, three-change git-diff discipline, verbatim blocks); the countermeasure that keeps failing is prompt-level admonition.

---

## 6. Protocol Gaps Identified

> Code-not-prompt check applied to each row below.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| **G1 — Post-mortem-as-ground-truth: the PM quoted the s2 after-action §7 handoff ("both interim 'browse' targets") instead of disk-verifying, inheriting the s2 document's own under-count.** The s1-G1 rule ("corpus facts need measured citations or verify-then-implement phrasing") was honored for every claim the PM framed as a *codebase* fact — but a fact quoted from a retrospective document slipped past the rule's vocabulary, exactly as s2's stale doc baseline did one sprint earlier. CR#1 caught it on disk and named the inheritance. | One full plan-gate round: ~27 min, 2 extra spawns (PM rev1 + CR#2), and t4b briefly carried an unsatisfiable SC. Third consecutive sprint in which an *unverified inherited fact* cost a gate round — the class mutates to whatever source the rule doesn't name. | **PM rule generalization (route to HR / gander, pm.md + pm-preflight):** the s1-G1 citation discipline covers ANY load-bearing enumerable fact regardless of source — codebase reads, doc baselines (s2-G1), **and facts quoted from after-actions/handoffs/seam notes**: a retrospective's "Key contracts" is a POINTER to re-verify, never a measurement. Mechanical form: any plan-preamble enumeration ("both", "all three", "the only") over repo state must carry a same-sprint disk citation. Companion (after-action SKILL.md): §7 "Key contracts" handoff bullets should carry file:line citations and an explicit "re-verify before citing" convention. §9 row 1. |
| **G2 — base-ui behavioral defaults, SECOND recurrence — with the s2-G2 rule FOLLOWED.** t3 set `initialFocus`/`role`/`aria-modal` explicitly (must_not_contain forbade default reliance; AUD#3 adjudicated the props correct) — and the HIGH-class defect shipped anyway, because base-ui resolves `initialFocus` ONCE in a pre-mount microtask, so an explicit ref to async-loaded content is structurally null at resolution time and focus falls back to Cancel. The rule's vocabulary ("set the props explicitly") sits one level above where the defect class actually lives (resolution timing vs content lifecycle). | Second consecutive sprint with a HIGH-class keyboard/focus defect from the same library family; found only by the e2e gate; 1 remediation round. Prompt-level notes are now 0-for-2 at preventing this class. | **Code-not-prompt (route to HR / gander + studio FE follow-up):** (a) **build a `components/ui` wrapper** (Dialog/Popover) that hard-defaults the safe pattern — function-form `initialFocus` resolving `ref.current ?? false` + an optional `focusOnReady` post-mount effect (FE#8's rem2 is the reference implementation) — so packet authors consume the wrapper instead of re-deriving the fix; (b) extend `frontend-engineer.md`'s primitive-defaults note from "set focus/role props explicitly" to "explicit props do NOT suffice when the focus target mounts async — use the wrapper / function-form"; (c) extend the memorized gotcha note (`project_shadcn_ff7_token_collision.md`) a second time: token defaults → behavioral defaults → **resolution-timing semantics**. §9 row 2, eval §10 row 2. |
| **G3 — Cross-spec invariant coupling: s2's e2e spec encoded an INTERIM nav state as a timeless invariant, and s3's ratified design legitimately falsified it.** The s2 test asserted aria-current count 0 with a rationale comment claiming `'party'` "never matches a RAIL_ITEMS mode" — true only while the Roster item pointed at the interim 'browse' target that s2's own §7 said s3 would re-point. Nothing in the spec distinguished contract-assertions (Roster rail EXISTS, is keyboard-reachable) from snapshot-assertions (Roster currently maps to 'browse'), so the successor plan had no mechanical way to know which assertions its ratified changes would break. CR#2 caught the collision; the fix required a third authorized s2-spec touch. | One full plan-gate round (~13 min, 2 spawns); without CR#2, the collision would have surfaced at t5 as a red suite the packet was forbidden to fix — the worst possible discovery point. This hazard grows with every sprint that leaves a standing spec behind (s2, s3 now both do; s4 inherits both). | **Convention, code-adjacent (route to HR / gander, FE spec + e2e-gate packet template):** e2e specs that outlive their sprint must **mark each assertion INVARIANT vs INTERIM** — an `// INTERIM(s3-nav-contract): ...` comment tag naming the owning seam/sprint on any assertion encoding a state a declared successor will change (the s2 spec's own comments already carried the facts; they lacked the machine-greppable tag). Successor PMs then grep for `INTERIM(` in inherited specs at plan time (a pm-preflight line-item), turning "which s2 tests does my design break?" into a deterministic search instead of a Critic save. Apply retroactively to the s3 spec's own interim assertions (the retained-CTA browse-page test is INTERIM(s4-cut) by definition). §9 row 3. |
| **G4 — SubagentStop COMPLETE-miss, validator class, 4th consecutive sprint (RV#1).** Identical signature: the Mode-B REQVAL general-purpose spawn's COMPLETE not auto-logged; ORC backfilled inline (seq 121) with the output on disk. Every other auto-loggable COMPLETE this sprint (8 FE, 3 PM, 1 AR) landed correctly. | One manual backfill; observability held via ORC vigilance for the 4th sprint running. The class is 4-for-4 on Mode-B REQVAL spawns — a deterministic, predicted, fully-specified failure whose fix has now been queued through three after-actions. | **No new analysis — LAND THE FIX.** This row escalates s1 §9 row 2 / s2 §9 row 5 to maximum priority: four consecutive identical sightings of a specified, unlanded fix is no longer improvement debt, it is a standing falsification of the "hooks auto-log COMPLETEs" claim in CLAUDE.md's observability section. If the gander batch cannot land promptly, interim mitigation: dispatch-task adds a mandatory ORC checklist line "verify RV COMPLETE logged; backfill inline" (already de-facto practice — write it down). §9 row 4. |
| **G5 — Archivist drift, 4th sighting, 3rd mutation: the commit-inventory verbatim fix WORKED; the drift migrated to the narrative/synthesis layer.** This sprint's entry copies the `<commits>` block byte-exactly (streak broken — the s2 §9 row-4 mandate is validated) but: fabricates a sibling slug (`s2-dashboard-core` for `s2-party-shell`, also mislabeling it "parent sprint"); re-narrates the contrast defect wrongly on three counts (#cf3c3c hex, "disabled buttons", a backwards remediation story crediting the p10 --redb lightening); and misattributes the focus-defect finder twice ("AUT#8", "FAIL (AUD#7 e2e)" — no such FAIL event exists; FE#6's gate found it). Upstream weak link discovered: the commit_record itself ABBREVIATED the git subjects, so even perfect AR transcription reproduces a paraphrase. | The durable record misnames the sprint's own sibling and misdescribes both defects' mechanics and provenance — precisely what a future engineer greps when studying this program. Pattern across 4 sightings is now unambiguous: each layer we make mechanically-copyable stops drifting; every layer left to free synthesis drifts. | **Extend the verbatim/citation discipline one layer up (route to HR / gander, archivist.md + commit-packet SKILL.md — escalates s2 §9 row 4):** (a) archive-entry `dependencies`/sibling identifiers must be COPIED from program.md / the brief / the ORC facts block, never recalled; (b) every defect characterization in `rationale`/`audit_trail` must trace to a named artifact the AR read (audit verdict, event-log reason field) — the event log's AUDIT_FAIL `reason` strings are ideal copy sources and were available verbatim; (c) commit-packet must emit `<subject>` as verbatim `git log --format=%s` output, making the record's commits block byte-comparable to git. Queue an AR#2-pattern correction addendum for THIS entry's (a)–(c) drifts. Eval: §10 row 1. |

**Adjudicated NOT-a-gap (recorded so they are not miscounted later):**
- **AUD#8's Vite crash under 2-worker parallel contention** — the shared :5173 dev server died mid-run while AUD#7 and AUD#8 both drove full e2e suites concurrently (spawned the same tick, 06:40:35); AUD#8 restarted Vite, re-ran solo, 27/27 clean, and documented the sequence. Environmental, recovery correct, evidence uncompromised (the solo run is the verdict basis). Ops note only: when two audits both carry e2e re-run duties, stagger them or point them at dedicated servers — a scheduling nicety, not a protocol gap.
- **s2-G6 (commit-before-verdict) did NOT recur** — all six durability commits (06:47:48) post-date the last verdict (AUD#8, 06:46:49); every `Audit: PASS` trailer was true when written.
- **s2-G3 (git stash) did NOT recur** — no stash by any agent (FE packets attest explicitly); the batch-commit exposure window it implies is tracked as a §8 commit-packet note instead.

---

## 7. Final Deliverable State

**App/Service:** `/home/jhber/projects/gander-studio-alpha` (branch `feat/studio-sessions-feed-agentstats`; durability commits `474d686` t1 / `54dbef8` t2 / `0a30289` t3+rem1+rem2 / `d7f669f` t4a / `8f9cc76` t4b / `44f01d0` t5, + ceremonies `86d2fd0` (planning) and `68ec6e1` (close); **NOT pushed** — the human's prior push covered through `581ccfa` (seq 73); s3 publication is human-owned pending Step 4.5).
**Build:** `npm run lint` (tsc ×3) clean at every packet and re-verified at each audit; client vitest 54/54 (8 files, incl. 6 new buffer-contamination cases + 9 RelationshipPanel helper cases); production build main chunk **757.76 kB** (gzip 227.54) < 1 MB gate with **242 kB headroom**, AgentDetailPage a separate 19.79 kB lazy chunk (lazy-from-birth, s2-G1 honored); zero server/shared changes (R-014 verified by git log --stat across all six commits).
**Runtime:** combined e2e gate (19 s2 + 8 s3 tests) **27/27 green ×4 independent post-remediation runs** (FE#8 ×2, AUD#7 ×1, AUD#8 solo ×1) against live data (13 real roster members). **DONE-PENDING-4.5**: human walkthrough staged (REQVAL HA-4 script: card → detail panels/provenance/edges/legend → revise dialog focus-lands-in-editor → Escape → back-to-party → Roster rail highlight).

**Features delivered (all client — the drill-down layer):**
- `packages/client/src/pages/AgentDetailPage.tsx` + `'agent-detail'` AppMode member + lazy PAGE_MAP entry (`ModeContent.tsx`): header (PortraitFrame/RoleTag/StatBar reuse via materiaTint), four mutually-exclusive page states (no-selection short-circuits the query / loading aria-busy / error role=alert / default), DataQualityNotes section, Back-to-party affordance.
- `packages/client/src/components/detail/InventoryPanels.tsx` (t1): MateriaPanel (skills+hooks), EquipmentPanel (tools), AbilitiesPanel — provenance chips on rows; **honest-empty is a first-class rendered state** ("No recorded abilities for this agent." — abilities is contracted-empty for every agent per program.md §5 note 2, asserted directly by the e2e).
- `packages/client/src/components/detail/RelationshipPanel.tsx` (t2): RF v12 star graph — BOTH `<Handle>`s on every node (the memorized invisible-edges gotcha honored by construction), DETECTED/INFERRED **triple-encoded** (accent bar + solid/dashed edge + text legend), client-side `formatTargetLabel` over raw connectivity node ids.
- `packages/client/src/components/detail/ReviseSpecAction.tsx` + `revise-spec-buffer.ts` (t3+rem1+rem2): Edit absorption via existing `agent.get/save`+`skill.get/save` — target-keyed reducer buffer (TARGET_CHANGED unconditionally wipes; key-guarded LOADED/EDITED; A→B contamination structurally disproven at the network-intercepted payload level), explicit dialog focus/role incl. the G2 fix (function-form initialFocus + once-per-open post-mount focus), error/status text at AA+ (--w on --sfh, 13.16:1; --redb/--mg as border accents only).
- Nav re-points (t4b): card click → `agent-detail`; Roster rail → `party` (now legitimately aria-current on party home — human-ratified); `handleViewRoster` **deliberately retains `'browse'`** with an s4 TODO marker.
- `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (414 lines, 8 tests): **the `s3-to-s4` absorption-proof seam artifact** — PROOF 1 Browse / PROOF 2 Graph (visible-edge, count>0) / PROOF 3a+3b Edit (explicit-focus + buffer regression with network-boundary save intercept), back-to-party, DI honest-empty (getParty-only mock, getAgentDetail real), keyboard operability, heading structure. Plus exactly three authorized s2-spec updates.

**Key contracts the next engineer (s4-retirement — the final sibling) needs:**
- **s4 may now cut Browse/Graph/Edit against the seam artifact:** the brief's `provides_to: [s4-retirement]` contract is satisfied — all three absorbed values are runtime-proven by the s3 spec. Keep it green through the cut.
- **s4 inheritances (consolidated at REQVAL):** re-point `handleViewRoster` when `'browse'` leaves the AppMode union (it becomes a compile break — the TODO marker at PartyPage.tsx:205-209 carries the obligation); rail collapse/expand (HA-1, from s2); 390px header overflow (DEFERRED-V2S2-1); stale CLAUDE.md baselines (bundle line still says "~700KB"; surfaces/routes tables predate v2 — DEFERRED-V2S2-2); 13-role catalog entry point (the CTA's true destination).
- **The legacy e2e corpus is ~30% red BY DESIGN:** 55 pre-existing failures in untouched files, largely rooted in s2's Browse→Party default-route change (older specs assume BASE_URL lands on Browse). t5's classification (its packet, "Classification of the 57 full-suite failures") is the reference list — s4's retirement scope should delete or re-point these specs alongside their surfaces; until then, do NOT read full-suite red as regression.
- **`ROSTER_AGENT_NAME_BY_CODE` (AgentDetailPage.tsx:40) is sanctioned duplication with a drift hazard** — retire via a BE packet adding `agentName`/`specFile` to AgentDetailSchema (DEFERRED-V2S3-1); unmapped codes degrade to an honest no-revise fallback, never a 404 dialog.
- **INTERIM assertions now exist in the s3 spec too:** the retained-CTA test asserts `browse-page` (INTERIM until s4-cut). Apply the G3 marking convention before s4 plans against it.
- The s2 spec's three updated assertions are the new nav contract: card-Enter → `agent-detail-page`; Roster rail → `party-page` with aria-current="page" count 1 accessible-name "Roster"; CTA → `browse-page` (protected, sole browse reference).

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `prog-studio-v2-2026-07-s3-drilldowns`

**xp_gained:**
- surface: Agents | delta: the auditor caught the app's historically human-caught legibility class for the first time (AUD#3 measured-contrast SA FAIL) — the v2 spec's binding contrast_pairs traceability made illegible-text a static-gate defect
- surface: Skills | delta: e2e-gate-as-packet confirmed ×2 sprints — t5 caught the initialFocus pre-mount defect after five clean static passes, and the flag→rem→independent-triple-verify chain closed it in one round
- surface: Agents | delta: Critic plan-gate depth — two distinct disk-verified BLOCKers (inherited under-count; cross-spec invariant collision) each resolved in one revision, with an explicit same-blocker-twice adjudication keeping the 3-round chain honest
- surface: Rules | delta: three-change authorized-touch discipline on cross-sprint files proven end-to-end (PM enumerates → FE delivers exactly → AUD#8 git-diff verifies → REQVAL re-verifies) — the keeper pattern for editing predecessor specs
- surface: Agents | delta: archivist commit-inventory verbatim mandate validated (byte-exact copy, streak broken) — while exposing that drift migrates to whatever layer is left to free synthesis

**levels_advanced:**
- Drill-down layer live: Browse/Graph/Edit absorption runtime-proven by a standing seam artifact — s4 (the final sibling) may now retire the absorbed surfaces against it
- The program's inherited-assumption defect class is now named across all three sightings (codebase facts → doc baselines → after-action quotes), with a generalized rule proposed

**new_capabilities:**
- Agent detail views: lazy `'agent-detail'` route, inventory panels with provenance + honest-empty states, RF relationship star graph, revise-spec dialog with contamination-guarded buffer and deterministic focus, nav re-points with declared s4 hand-offs, and an 8-test absorption-proof e2e gate (27/27 combined, ×4 runs)

```jsonl
{"sprint_id":"prog-studio-v2-2026-07-s3-drilldowns","xp_gained":[{"surface":"Agents","delta":"auditor caught the historically human-caught legibility class for the first time (AUD#3 measured-contrast SA FAIL) via binding contrast_pairs traceability"},{"surface":"Skills","delta":"e2e-gate-as-packet confirmed x2 sprints: t5 caught the initialFocus pre-mount defect after five clean static passes; flag->rem->triple-verify closed it in one round"},{"surface":"Agents","delta":"Critic plan-gate depth: two distinct disk-verified BLOCKers each resolved in one revision, with explicit same-blocker-twice adjudication"},{"surface":"Rules","delta":"three-change authorized-touch discipline on cross-sprint files proven end-to-end — the keeper pattern for editing predecessor specs"},{"surface":"Agents","delta":"archivist commit-inventory verbatim mandate validated (byte-exact, streak broken); drift shown to migrate to the free-synthesis layer"}],"levels_advanced":["drill-down layer live: Browse/Graph/Edit absorption runtime-proven by a standing seam artifact — s4 may retire the absorbed surfaces against it","inherited-assumption defect class named across all three sightings (codebase facts -> doc baselines -> after-action quotes) with a generalized rule proposed"],"new_capabilities":["agent detail views: lazy agent-detail route, inventory panels with provenance + honest-empty, RF relationship star graph, contamination-guarded revise-spec dialog with deterministic focus, nav re-points with declared s4 hand-offs, 8-test absorption-proof e2e gate (27/27 combined, x4 runs)"]}
```

---

## 8. Skill-Use Analysis

> This section is hone's primary input. Run `hone` after this post-mortem if any table below has rows.

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| pm-preflight | consumed, run not evidenced | PARTIAL_VALUE | ORC | 2026-07-08 (s2) | The PM's routing_notes cite pm_preflight tokens (OVERSCOPED, DRY) and carry 6 recurring_pattern dispositions sourced from the s1/s2 after-actions — the checklist demonstrably shaped the plan (s2-G1/G2/G3 all visibly applied). But NO PM_PREFLIGHT event was logged this sprint (s2 logged one at its seq 22), so neither a fresh run nor the symlink-workaround status (3 prior sprints) can be confirmed from the record — a process-visibility regression. And the checklist again failed to immunize against the drift classes it named (archivist row rode the checklist in s2 and the class recurred here in mutated form — prompt-level tags don't fix it) |
| dispatch-task (revision loop, Step 1.5) | 2 BLOCK rounds | VALUABLE | ORC/PM | 2026-07-08 (s2) | The multi-round path worked exactly as designed: distinct blockers, bounded single-round revisions, same-blocker-twice check run and documented, SCs only ever tightened. Contrast with s2 (PASS+5W amendment branch) — both Step-1.5 branches now exercised and proven this program |
| sc-locked-value-consistency | 3 (r0, rev1, rev2) | VALUABLE | ORC | 2026-07-08 (s2) | 0 findings all three rounds (reports on disk); precheck-clean at authorship for the third consecutive sprint |
| jidoka | 0 (not run) | NOT_TRIGGERED | ORC | NEVER | No skip-adjudication NOTE event again (2nd sprint). Both plan blockers were disk-fact classes a jidoka pre-read might have surfaced — but both were caught by the Critic's own disk verification at nearly the same cost, and the sprint's modify-existing-spec surface (the s2 e2e spec) is arguably skip condition territory. Mandate the skip NOTE; the deeper fix is G1/G3's mechanical rules, not more pre-read rounds |
| env-preflight | 0 (not run) | NOT_TRIGGERED | ORC | NEVER | s3's FE waves ran against the live API with no s3 preflight event — mitigated de facto (s2's validated dev server still up; AUD#4/AUD#6 live probes; FE#6's curl survey) but the skill's trigger condition was unmet without an adjudication note. Cheap fix: a one-line "env-preflight carried from same-session s2 run (seq 29)" NOTE would have made the reuse explicit |
| audit-pipeline | 8 verdicts | VALUABLE | ORC | 2026-07-08 (s2) | 7 PASS / 1 genuine FAIL. Value stories: AUD#3's contrast FAIL (headline); AUD#2's VISUAL_BLINDSPOT forward-flag consumed by AUD#8's seam checks (new audit-to-audit contract pattern); AUD#4's sanctioned-duplication adjudication with disk-verified non-derivability; AUD#5's sha256 no-regression proof; AUD#7's vendored-source contract verification; AUD#8's three-change git-diff verification + clean crash recovery |
| requirements-validate (Mode B) | 1 | VALUABLE | ORC | 2026-07-08 (s2) | COVERED 14/14 with file:line+commit evidence; the "any roster agent" adjudication against the ratified 6-of-13 scope (capability vs entry-point distinction) is exactly the judgment call the gate exists for; HA walkthrough script staged. COMPLETE hook-missed (validator class, §6 G4) |
| commit-packet | 6 durability + 2 ceremonies | PARTIAL_VALUE | ORC | 2026-07-08 (s2) | Scope discipline clean (per-packet stages, trailers, secret grep CLEAN) and no commit-before-verdict (s2-G6 fixed in practice). Two deductions: (a) rolling per-packet durability (s2's model) was abandoned — all six commits batched at 06:47:48, leaving t1/t2 audit-PASSed-but-uncommitted ~57 min in a multi-agent tree (the exposure class s2-G3 was about); (b) the commit_record's `<subject>` fields are abbreviated re-typings of the git subjects — the verbatim chain's source is itself a paraphrase (§6 G5(d), 8c row) |
| log-event (inline composition) | ~51 events, 1 UTC file | VALUABLE | ORC | 2026-07-08 (s2) | Monotonic seq 74–124; the SPAWN reason notes (seq 78 CR#1 blocker, seq 102 contrast fix spec, seq 114 focus defect) again made timeline reconstruction trivial — and the AUDIT_FAIL `reason` field was accurate enough to expose the archive entry's drift by comparison. RV backfill composed inline with provenance note (4th-recurrence tag included) |
| after-action | 1 | VALUABLE | AA | 2026-07-08 (s2) | this document — including the parent-requested archivist-precision verdict (§4) |

### 8b. Obsolescence Candidates

| Skill | Consecutive non-value sprints | Evidence | Recommended action |
|-------|------------------------------|----------|--------------------|
| _none_ | — | — | — |

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| commit-packet | commit_record `<subject>` fields abbreviated vs actual `git log --format=%s` output (all 6 this sprint, e.g. 44f01d0 losing "+ three authorized s2 updates") — downstream verbatim-transcription consumers inherit the paraphrase | AMBIGUOUS_STEP — the record schema doesn't state that subject must be captured verbatim from git | CLARIFY per §6 G5(c): emit subjects from `git log --format=%s`, never re-typed; makes the commits block byte-comparable to git |
| pm-preflight | Consumed without a logged PM_PREFLIGHT event — run/workaround status unverifiable from the record; and its drift-class tags again failed to prevent the tagged class (prompt-level ceiling reconfirmed) | AMBIGUOUS_STEP — event-logging of the preflight run isn't mandated when the checklist is carried/assembled inline | CLARIFY: always log the PM_PREFLIGHT (or a carried-from note); route the drift classes to code fixes (§9) instead of checklist tags |
| env-preflight | Skipped for a live-API FE sprint on an implicit "server still up from s2" rationale, unrecorded | AMBIGUOUS_STEP — no same-session-reuse provision in the skill | CLARIFY: permit explicit reuse of a same-session preflight via a NOTE event citing the original seq; absent that, run it (it's three curls) |
| jidoka | Second consecutive silent skip (no adjudication NOTE) | AMBIGUOUS_STEP — skip-logging still not mandated (s2 8c carried this same row) | CLARIFY (escalate s2's row): require the skip NOTE always |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|--------------------------|---------------------|
| _none new_ — the INTERIM-marking convention (G3) is a spec convention + pm-preflight line-item, the ui-wrapper (G2) is a code artifact, and the verbatim extensions (G5) are agent/skill spec edits; no multi-step deterministic ORC ritual emerged | — | — | — |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| _none_ | — | — |

### Hand-off to hone

Post-mortem Section 8 complete. 10 skills logged. 0 obsolescence candidates, 4 content-quality candidates (commit-packet, pm-preflight, env-preflight, jidoka), 0 new skill candidates, 0 drift candidates. Run the `hone` skill to act on these findings.

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

> Cross-reference: rule proposals targeting standards.md feed the quarterly HR review per .claude/rules/standards.md ## Rule-Improvement Loop.
> Cross-reference: CLAUDE.md proposals require human ratification before HR applies them — see projects/gander/CLAUDE.md ## CLAUDE.md Delta-Proposal Process.

| Target file | Proposed change | Priority | Rationale |
|-------------|----------------|----------|-----------|
| `.claude/agents/pm.md` + `.claude/skills/pm-preflight/SKILL.md` (gander repo; route to HR) | **Generalize the s1-G1 citation rule to ALL inherited fact sources:** load-bearing enumerable facts (counts, "both/all/only" claims, lists) must carry a same-sprint disk citation regardless of source — codebase reads, doc baselines (s2-G1), **and facts quoted from after-actions/handoffs/seam notes** (a retrospective's "Key contracts" is a pointer to re-verify, never a measurement). Companion in `after-action/SKILL.md`: §7 handoff bullets carry file:line citations + a "re-verify before citing" convention. | HIGH | §6 G1: the PM inherited the s2 post-mortem's own §7 under-count ("both" of three browse targets) → CR#1 BLOCK; third consecutive sprint lost a gate round to an unverified inherited fact, each time from a source the rule didn't yet name. |
| `.claude/agents/frontend-engineer.md` (gander repo; route to HR) + studio-alpha follow-up packet (components/ui wrapper) + memory note `project_shadcn_ff7_token_collision.md` (extend again) | **Escalate s2 §9 row 2 from prompt to code:** build a `components/ui` Dialog/Popover wrapper hard-defaulting the safe focus pattern (function-form `initialFocus` resolving `ref.current ?? false` + optional post-mount `focusOnReady` effect — FE#8's rem2 is the reference implementation); FE spec note upgraded to "explicit focus props do NOT suffice when the target mounts async — resolution is a one-shot pre-mount microtask; use the wrapper/function-form"; memory note extended: token defaults → behavioral defaults → **resolution-timing semantics**. | HIGH | §6 G2: second consecutive HIGH-class base-ui focus defect — this time WITH the s2 rule followed (explicit props set, audited, passed). Prompt-level guidance is 0-for-2 on this class; s4 and every future dialog surface will hit it again. |
| `.claude/agents/frontend-engineer.md` (e2e-gate packet conventions) + `.claude/skills/pm-preflight/SKILL.md` (gander repo; route to HR) | **INVARIANT-vs-INTERIM assertion marking for cross-sprint e2e specs:** any assertion encoding a state a declared successor sprint will change carries a greppable `// INTERIM({seam-or-sprint}): ...` tag; successor PMs grep inherited specs for `INTERIM(` at plan time (pm-preflight line-item). Apply retroactively to the s2/s3 specs' known interim assertions (retained-CTA browse-page test = INTERIM(s4-cut)). | HIGH | §6 G3: s2's spec asserted an interim nav state as a timeless invariant ("never matches 'party'"); s3's ratified design legitimately broke it → CR#2 BLOCK; without the Critic, the collision surfaces as an unfixable red suite at the final packet. The hazard compounds with every standing spec the program leaves behind. |
| `~/.claude/hooks/subagent-autocomplete.sh` (gander hook batch — re-escalation of s1 §9 row 2 / s2 §9 row 5, no new content) | Land the validator-class + day-rollover fixes with self-test fixtures; interim mitigation if the batch stalls again: a mandatory dispatch-task ORC checklist line "verify RV COMPLETE logged; backfill inline". | HIGH (4th escalation) | §6 G4: 4-for-4 on Mode-B REQVAL spawns — a deterministic, predicted, fully-specified failure now standing-falsifying CLAUDE.md's auto-log claim. |
| `.claude/agents/archivist.md` + `.claude/skills/commit-packet/SKILL.md` (gander repo; route to HR — escalates s2 §9 row 4) | **Extend the verbatim/citation discipline to the narrative layer and to the record's generation:** (a) sibling/sprint identifiers in archive entries copied from program.md/brief/ORC facts, never recalled; (b) defect characterizations in rationale/audit_trail must trace to a read artifact (audit verdict; event-log AUDIT_FAIL `reason` strings are canonical copy sources); (c) commit-packet emits `<subject>` verbatim from `git log --format=%s`. Queue an AR#2-pattern correction addendum for this sprint's entry (fabricated `s2-dashboard-core` slug; wrong contrast story; misattributed focus-defect finder). | HIGH | §6 G5: 4th drift sighting, 3rd mutation — the commit-inventory verbatim fix WORKED (byte-exact this sprint), proving the mechanism; every layer left to free synthesis still drifts. |

---

## 10. Eval Gap Proposals

| Agent / Skill | Gap description | Suggested eval | Priority |
|---------------|----------------|----------------|----------|
| archivist (narrative layer) | Nothing checks that synthesis-layer facts (sibling slugs, defect attributions, defect mechanics) trace to supplied artifacts (§6 G5) | Fixture close-out with an ORC facts block + commit_record + event log containing an AUDIT_FAIL reason → assert the entry's sprint identifiers all appear in the inputs (no novel slugs), the defect narrative string-matches the reason/verdict source, and the finder attribution matches the event log; this sprint's entry (s2-dashboard-core / disabled-buttons / AUT#8) is the canonical failure case | HIGH |
| frontend-engineer (async-content focus) | No check that dialog/popover wiring handles async-mounted focus targets (§6 G2 — explicit props alone pass the s2-era check and still fail) | Fixture: controlled dialog whose focus target mounts after an async load, `initialFocus` given as a plain ref → expect the function-form/wrapper pattern or a flagged verification note; canonical negative = t3's original `initialFocus={textareaRef}`; canonical positive = FE#8's rem2 | HIGH |
| project-manager (inherited facts) | Nothing checks that plan-preamble enumerations over repo state carry same-sprint disk citations when sourced from retrospectives (§6 G1) | Fixture plan quoting a prior after-action's "both X" handoff without a disk citation → expect pm-preflight/Critic-gate flag; calibrate on this sprint's r0 preamble as the canonical negative | MEDIUM |
| e2e-gate packets (INTERIM marking) | No check that cross-sprint spec assertions encoding successor-owned states carry the INTERIM tag (§6 G3) | Fixture spec with an assertion contradicting a declared successor seam and no `INTERIM(` tag → expect flag; the s2 aria-current test as authored is the canonical negative | MEDIUM |
| commit-packet (subject fidelity) | Nothing verifies commit_record subjects equal `git log --format=%s` (§6 G5(d)) | Fixture repo with known subjects → assert byte-equality of every `<subject>`; this sprint's record (6/6 abbreviated) is the canonical failure case | LOW |

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — manual observations only. (Application-code sprint; no `.claude/` agent/skill/rule/hook nodes changed.)

Manual observations:
- **One dead identifier entered the durable record:** the archive entry's dependency `prog-studio-v2-2026-07-s2-dashboard-core` resolves to nothing anywhere in the repo (actual sibling: `-s2-party-shell`) — a semantic dead-ref a grep-driven reader will chase. Correction addendum queued (§6 G5). All FILE paths in the entry resolve (the s1 Glob discipline still holding).
- **The seam chain resolves at every hop:** brief `provides_to: [s4-retirement]` → the s3 spec (self-documenting as the seam artifact) → AUD#8 seam_quality_checks → REQVAL R-010 → this document's §7. The three-change discipline additionally leaves the s2 spec's edit provenance reconstructible from the AUD#8 diff description alone.
- **Audit-to-audit forward reference worked as an edge:** AUD#2's VISUAL_BLINDSPOT_KNOWN flag names its consumer ("RECOMMENDATION for the t5 audit") and AUD#8 discharges it by id — a citable cross-verdict contract pattern worth repeating.
- **55 legacy e2e specs are now dangling references to retired-by-design routes** (s2's default-route change): not rot to fix piecemeal — an s4 retirement-scope inventory (t5's classification list is the input).
- **Soft mismatch edge:** commit_record `<subject>` ≠ `git log %s` for all six commits — any tool byte-comparing the record to git will false-flag; §9 row 5(c) removes the class.
- All packet/audit/REQVAL/commit artifacts cross-reference by exact on-disk path and all resolve (verified while authoring this document).
