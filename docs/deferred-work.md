# Deferred Work

Items surfaced during sprints but explicitly deferred for a future sprint.

---

## Sprint: gander-studio-p9-sessions-feed-agentstats (2026-06-30)

### DEFERRED-P9-1 — Tokens-per-agent stats not implemented

`EventLogEntrySchema` carries no token-count field; token data is not present in the JSONL event log. Tokens-per-agent aggregation is deferred until the event schema is extended with a `tokens` field (or an alternative source is identified).

---

## Sprint: prog-studio-vision-2026-06-s5 (2026-06-20)

### DEFERRED-006 — `--redb` used as text color below WCAG AA (app-wide, pre-existing)

**Source:** DELETE stage s5 contrast audit (prog-studio-vision-2026-06-s5-DELETE).
**What it is:** `--redb: #cf3c3c` has a true contrast ratio of **4.07:1** against `--void` (#070d0c) — below the WCAG AA threshold of 4.5:1 for normal text. The annotation was previously recorded as "~4.8:1 AA" in globals.css line ~215 and DESIGN.md DR-A/DR-B; both corrected in s5-DELETE. The hex value itself is unchanged. `--redb` is assigned to Shadcn's `--destructive` token and used in error/destructive UI surfaces app-wide.
**Why deferred:** Pre-existing, app-wide; correcting it requires a color decision (lighten `--redb` to clear AA, or restrict its use to non-text contexts such as borders/icons). Out of scope for a cleanup sprint.
**Schedule as:** Token-pass sprint alongside any future contrast remediation work. Lighten `--redb` to approximately `#e05555` (≥4.5:1 on `--void`) or split into `--redb-text`/`--redb-bg` variants.

---

## Sprint: gander-studio-p7-graph-viz (2026-05-30)

### DEFERRED-P7-1 — Remove or wire up dead-code `Sidebar.tsx` — ✅ DONE (2026-05-30)

**Resolution:** Removed in `09c632d` (task `gander-studio-p7-1-sidebar-removal`) — confirmed orphaned (zero imports), audited PASS (lint ×3 + client build clean), committed. BottomTabBar remains the sole nav surface.

**Source:** Auditor (AUD#2) advisory during p7-t3-fe — non-blocking.
**What:** `packages/client/src/components/Sidebar.tsx` renders nav items as `<a role="button">Graph</a>` but is **not mounted** in the live `AppShell` (which uses `BottomTabBar` with `<button role="tab">`). It is dead code in the render path. The p7 e2e originally targeted it by mistake (`getByRole('button', {name:/graph/i})`), causing the AUD#2 FAIL; the fix switched the spec to `role="tab"`.
**Why deferred:** Removal is out of scope for the graph-viz sprint and would be an independent change. Left in place to avoid scope creep.
**Schedule as:** Small FE cleanup — remove `Sidebar.tsx` (and any stale imports) OR intentionally wire it back into the shell; then grep the e2e suite for any other spec targeting the dead nav surface.

---

## Sprint: prog-studio-sessions-2026-05-s3-analyze (2026-05-28)

### DEFERRED-002 — AgentTimeline x-axis zoom control (+/-) — ✅ DONE (2026-06-20)

**Resolution:** Shipped in `3de2202` (`feat(sessions): add x-axis zoom (+/-) control to AgentTimeline`, task `gander-studio-p5-overview-ux` p5-t3). zoomLevel state (1.0 default, clamped [0.25, 4.0], ×1.5 per step) scales the time axis; +/- control strip uses FF7 tokens (white glyphs, 13.2:1 contrast); buttons disable at bounds; aria-live zoom-% label. Spec: `packages/client/tests/e2e/agent-timeline-zoom.spec.ts` (3 tests, PASS). Audit: PASS (SA+QA+SX, AUDITOR#3).

**Source:** Human idea at S3 Step 4.5 ("maybe an x-axis zoom button (+/-)").
**What it will do:** A +/- control on the AgentTimeline that scales the time-axis content width (zoom in to spread compressed bars; zoom out to overview). Pairs naturally with the horizontal scroll already shipped in `824c23e` — zoom changes `contentWidth`, scroll handles overflow.
**Why deferred:** S3 shipped readable scroll + adaptive units, which covers the core legibility need. Interactive zoom is an enhancement, not a gap.
**Schedule as:** Small FE packet on AgentTimeline.tsx (+ e2e for the zoom interaction).

### DEFERRED-003 — Rich hover/focus tooltip on timeline bars

**Source:** Human idea at S3 Step 4.5 ("hover over the bars shows additional information").
**What it will do:** Replace the native SVG `<title>` tooltip with a styled HTML overlay tooltip showing more per-bar detail (full edge_label, exact spawn/complete timestamps, duration, feedback-loop count, audit attribution for that agent). The UI spec already sketched a `FocusTooltipOverlay` (absolutely-positioned div, role="tooltip") as an optional element — this realizes it.
**Why deferred:** Current bars carry an accessible `<title>` + `aria-label` (agent_id, edge_label, seq, duration), which satisfies S3's SC. The richer overlay is an enhancement.
**Schedule as:** FE packet on AgentTimeline.tsx; reuse the `FocusTooltipOverlay` sketch from `s3-t1-ui-spec-UI-1779932400.md`.

### DEFERRED-004 — event-log slug matcher `includes` over-match guard (advisory)

**Source:** BE#2 routing note during the `s3-t7` gap-fill.
**What it is:** `parseEventLogFiles` (event-log-parser.ts:65-66) matches by `task_id.startsWith(slug) || task_id.includes(slug)`. With the current corpus the slugs are specific enough, but a short/generic sprint slug could substring-match an unrelated sprint's task_id.
**Why deferred:** Not a defect for current data; tightening it (e.g. anchor to `task_id === slug || task_id.startsWith(slug + '-')`) is a robustness improvement.
**Schedule as:** Tiny BE packet on event-log-parser.ts + a unit test in `packages/server/src/parsers/__tests__/`.

---

## Sprint: gander-studio-p2-agent-cards

### DEFERRED-001 — Plain-text appearance config file

**Original request:** "Add a plain-text appearance config file."
**Status:** Deferred by human (HCG-1, 2026-04-01). Not lost — tracked here.

**What it will do when scheduled:**
- Create `appearance.config.json` at project root exposing key visual constants from `canvas.ts`
- Add `config.appearance` GET tRPC procedure to `router.ts` — reads + parses the JSON file, returns typed response
- Add tRPC query hook on client
- On app init, merge server-returned config over default constants

**Why deferred:** Fully orthogonal to the visual redesign in this sprint. Requires new server endpoint, file I/O, and runtime config injection — better validated in its own sprint.

**Schedule as:** Standalone sprint with DS + BE + FE wave.

## Sprint: gander-studio-p5-overview-ux (2026-05-28)

### DEFERRED-005 — App-wide FF7 token contrast budget below WCAG AA — ✅ DONE (2026-06-20)

**Resolution:** Fixed in sprint `prog-studio-vision-2026-06-s1-token-root-fix`. Raised `--wm` alpha 0.38→0.55 (worst-case 5.06:1 on --sfh, AA PASS). Lightened `--mt` #5499b5→#6db0c8 (5.38:1 on --sfh for normal text, 8.12:1 on --void for UI components, both AA PASS). Remapped all stock Shadcn @layer base light tokens to FF7 var() references — fixes invisible text in all ui/* primitives (input, textarea, dialog, button). Contrast gate spec: `packages/client/tests/e2e/prog-studio-vision-s1-contrast-smoke.spec.ts`.
**Source:** AUDITOR#5 non-blocking advisory during p5-t4 audit.
**What it is:** Muted `--wm` label text (~3.49:1) and active `--mt` button text (~4.14:1) on dark surfaces fall below WCAG AA 4.5:1. This is NOT a regression from p5 — the new overview UI reused the identical token idiom already present in the unmodified AgentStatPanel/AgentStatTable/SessionPicker.
**Proposed fix:** A platform-level token pass (e.g. bump `--wm` alpha ~0.38→0.55, lighten `--mt` for text use) so the whole app clears AA. Cross-cutting; out of scope for a feature sprint.
**Why deferred:** Pre-existing, app-wide, not introduced here. Warrants its own dedicated contrast-remediation sprint rather than a piecemeal fix.

## p9 — synthetic-session under-collapse (accepted tradeoff, Critic-ratified)
Some sprints with descriptive/non-standard sub-task suffixes synthesize as multiple cards instead of
one (e.g. `gander-meta-xfolder-improve` + `-agentimprove` + `-hone`; `gander-meta-output-path-relocate`
+ `-t1t2`; `gander-meta-chronicle-skill` + `-firstrun`). `sprintRoot`'s right-strip only removes
recognized noise segments (agent codes, `t\d+`/`s\d+`/numeric sub-ids, ceremony words, dates,
timestamps); descriptive words like `firstrun`/`agentimprove` are kept, so they form their own root.
This is deliberate under-suppression: no duplicate ids, no noise, and broadening the strip set risks
OVER-suppressing genuinely distinct sprints (CR-rev2 ruling). Cosmetic only. Revisit only with a
corpus-wide sprint-id taxonomy, not ad-hoc suffix additions.

---

## Sprint: gander-studio-p10-deferred-smalls (2026-07-02)

### DEFERRED-P10-1 — s3-t3-timeline.spec.ts pre-existing tests fail: fixture sessions aged out of session.list's limit-50 window

**Source:** FE#3 during `gander-studio-p10-deferred-smalls-003-gap2` (runtime a11y gate closure). Root cause traced to `packages/client/src/hooks/useSessions.ts` + `packages/server/src/session-list.ts`.
**What:** The 5 pre-existing tests in `packages/client/tests/e2e/s3-t3-timeline.spec.ts` pin fixture sessions dated 2026-05-06 / late-May. `session.list` returns a hardcoded `limit: 50` date-descending window, so as newer sessions accumulate the pinned fixtures fall out of the list and the tests fail against a live dev environment — a data-staleness defect, NOT a regression from the p10 tooltip change (the 4 new p10 a11y tests pass green in the same file, same run).
**Why deferred:** Out of scope for packet 003-gap2 (hard constraint: no src edits); pre-existing.
**Schedule as:** Small BE/FE packet — either (a) make the pinned fixtures discoverable via a stable query (fetch by session id instead of scanning the list), (b) raise/parameterize the limit for test environments, or (c) refresh the pinned fixture ids. Decide against how the suite is meant to age.

## Sprint: prog-studio-v2-2026-07-s1-data-layer (2026-07-08)

### DEFERRED-V2S1-1 — No durable workflow-usage ledger (abilities always empty)

`AgentDetailSchema.abilities` (workflows) is contracted empty-with-note (program.md §5 note 2): base-plan portability makes workflow orchestration throwaway scaffolding, so no durable per-agent workflow-usage source exists. Candidate fix: a workflow-usage ledger appended at Workflow-accelerant close (same schema-extension family as DEFERRED-P9-1). Until then s3 renders an honest "no recorded abilities" state.

### DEFERRED-V2S1-2 — QualityStatSchema lacks a `reason` field

N/A reasons currently route via dataQualityNotes; a typed `reason` on QualityStatSchema is a small s3-adjacent extension (REQVAL note 3).

## Sprint: prog-studio-v2-2026-07-s2-party-shell (2026-07-08)

### DEFERRED-V2S2-1 — 390px global header/main horizontal overflow (~16px, pre-existing)

Header.tsx/ModeContent.tsx fixed 28px padding overflows the document at 390px width (t6 bounding-rect probe; PartyPage itself is flush). Route to s4 (nav/shell redesign scope).

### DEFERRED-V2S2-2 — CLAUDE.md Known-Issues bundle baseline stale

Says "~700KB"; reality: 1,025 kB pre-split, 756.80 kB after the s2 route-level code-split (PartyPage/GraphPage/ProgramDagPage/ComposePage now lazy). Update in s4's docs pass.
