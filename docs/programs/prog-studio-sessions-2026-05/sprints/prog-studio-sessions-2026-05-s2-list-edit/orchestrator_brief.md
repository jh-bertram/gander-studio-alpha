---
type: orchestrator-brief
sprint_id: prog-studio-sessions-2026-05-s2-list-edit
program_id: prog-studio-sessions-2026-05
status: PLANNED
---

# Orchestrator Brief — S2: Sessions List + Viewer + Markdown Editor

## Sprint ID
`prog-studio-sessions-2026-05-s2-list-edit`

## Program ID
`prog-studio-sessions-2026-05`

## Goal

Add a top-level "Sessions" mode to the studio client with list, detail, and editor surfaces. The list page shows all sessions parsed by S1's backend. The detail page has tabbed views: Overview (frontmatter + summary stats), Table (sortable agent activity), Markdown Editor (basic textarea-based edit + save-to-new-folder). Reserves the "Analyze" tab slot for S3 to fill.

## Sibling Awareness

**Sibling sprints in this program:**
- `prog-studio-sessions-2026-05-s1-backend` — Backend + Parsers + Schemas. **Must complete before this sprint starts** (publishes Session schema and tRPC procedures).
- `prog-studio-sessions-2026-05-s2-list-edit` (this sprint).
- `prog-studio-sessions-2026-05-s3-analyze` — Analysis surface. **Will fill the "Analyze" tab slot this sprint reserves.**

**DAG edges involving this sprint:**
- Incoming: `s1-backend → s2-list-edit` (consumes Session schema + tRPC procedures + `SESSIONS_EDITS_DIR` env).
- Outgoing: `s2-list-edit → s3-analyze` (provides Sessions nav mode + reserved Analyze tab slot).

**Integration seams owned by this sprint:**
- `s2-to-s3-nav-slot` — Reserves `{ id: "analyze", label: "Analyze", placeholder: true }` in the Sessions mode's tab list. S3 swaps `placeholder: true → false` and binds the wired component path.

**Integration seams consumed by this sprint:**
- `s1-to-s2-session-schema` — Imports `SessionSchema` types via `z.infer` from `@gander-studio/shared`.
- `s1-to-s2-trpc-procs` — Calls `session.list`, `session.get`, `session.saveEdit` via the typed tRPC client; never re-implements parsing.
- `s1-to-s2-edits-dir` — `SESSIONS_EDITS_DIR` is configured in S1; this sprint surfaces the destination path as a "save target" UI affordance only.

## Inputs

- Backend contracts published by S1: `packages/shared/src/schemas.ts`, tRPC procedures, env config.
- Existing client conventions: `packages/client/src/pages/`, `packages/client/src/store/`, `packages/client/src/constants/navigation.*`, `packages/client/src/hooks/`.
- Existing design tokens: `packages/client/src/globals.css` (FF7 Remake Intergrade Mako Teal palette).
- Existing Shadcn primitives in `packages/client/src/components/ui/`.
- Reference: `~/.claude/refs/dashboard-patterns.md` (Mako Teal patterns).

## Outputs

Files this sprint creates or modifies:
- `packages/client/src/constants/navigation.ts` (or matching existing convention) — add the "Sessions" top-level mode with three tabs (`overview`, `table`, `editor`) plus the reserved `analyze` slot for S3.
- `packages/client/src/pages/sessions/SessionListPage.tsx` — list page.
- `packages/client/src/pages/sessions/SessionDetailPage.tsx` — detail shell with tab routing.
- `packages/client/src/pages/sessions/tabs/OverviewTab.tsx` — frontmatter + summary stats panel.
- `packages/client/src/pages/sessions/tabs/TableTab.tsx` — sortable agent activity table.
- `packages/client/src/pages/sessions/tabs/EditorTab.tsx` — basic markdown editor (textarea + save button).
- `packages/client/src/store/sessionStore.ts` — Zustand store for session list + selected session + edit buffer.
- `packages/client/src/hooks/useSessions.ts` — data-fetch hook wrapping `session.list` / `session.get`.
- `packages/client/src/hooks/useSessionSave.ts` — mutation hook wrapping `session.saveEdit`.

## Cross-Sprint Invariants

(verbatim from `program.md`)

1. Session Zod schema lives in `packages/shared/src/schemas.ts`; types via `z.infer`. **Do not redefine schemas in the client.**
2. Save-to-new-folder: every save call goes through `session.saveEdit`. Never write to the source `${GANDER_ROOT}` from the client. UI shows the destination folder so the user knows where edits land.
3. **Nav registration owner**: this sprint owns the Sessions mode declaration. S3 will edit the same file to fill the Analyze slot — coordinate via the `placeholder: true` flag.
4. Design tokens — every color, spacing, typography choice references `globals.css` custom properties. No new ad-hoc hex values.
5. TypeScript strict — all components fully typed; no `any` without justification.

## Success Criteria (Sprint-Level)

1. **Nav mode registered.** Top-level "Sessions" mode appears in the app shell alongside Browse / Compose / Edit / Export. Clicking it routes to `SessionListPage`. Existing pages unchanged (smoke regression).
2. **List loads.** `SessionListPage` calls `session.list` via tRPC and renders one row per session showing at minimum: sprint slug, date, status, gap_classes summary. Empty state and error state handled.
3. **Detail loads.** Selecting a row routes to `SessionDetailPage` and calls `session.get`. Tab navigation between Overview / Table / Editor works without remounting the data fetch.
4. **Overview tab.** Renders frontmatter fields plus a top-line summary (agent count, feedback-loop count, status). Layout uses Mako Teal token palette only.
5. **Table tab.** Renders parsed agent activity as a sortable HTML table (sort by seq, ts, agent, event). Keyboard-navigable; meets WCAG AA contrast.
6. **Editor tab.** Textarea (or Shadcn `Textarea`) bound to the session markdown body via `sessionStore`. A "Save edit" button calls `session.saveEdit` and surfaces the destination path on success. The editor pre-fills with the original source markdown; the user can revert to original.
7. **Save flow.** A successful save shows a toast/confirmation with the absolute path written under `SESSIONS_EDITS_DIR`. A failed save (path-traversal rejection from S1, missing dir, etc.) surfaces the server error message; the editor does not lose the unsaved buffer.
8. **Analyze slot reserved.** The Sessions tab list contains an "Analyze" entry rendered as a disabled tab with tooltip "Coming in S3" — verifies the slot exists and S3 only needs to flip `placeholder: false` and supply the component.
9. **Lint + type clean.** `npm run lint` clean.
10. **Manual smoke (Step 4.5).** Browser walkthrough confirms: list loads, detail tabs work, save round-trips, no console errors. Existing Browse / Compose / Edit / Export still load.

**Out of scope:**
- Any analysis visualization (timeline, charts, picker) — that's S3.
- Markdown preview rendering. The editor is plain-textarea-only this sprint; preview is a follow-up.
- Diff view between original and edited copy. Follow-up if useful.
- The proximity edge regression bug (carry-forward).

## Routing Hints

- **UI Designer first** (small spec for list + detail + tab layout — leverage existing dashboard patterns).
- **FE agent** (split into 2 packets: list + detail-shell, then tabs + save flow).
- **Audit pipeline** after each FE packet.
- **Foreground dispatch.**
- **Step 4.5 human verification** is REQUIRED — this is FE work.

## Notes for the PM

- Decompose into ≤ 6 task packets. Suggested: (a) UI design spec, (b) nav + routing scaffold, (c) list page + data hook, (d) detail shell + tabs, (e) editor + save flow, (f) reserved Analyze slot + smoke.
- Cite `~/.claude/refs/dashboard-patterns.md` for any pattern (Browse / Detail-tabbed) — do NOT excerpt token values inline (prompt-vs-contract drift rule).
- Run `convention-detect` at Step 0.5.
- Run `env-preflight` before any FE wave with live API dependency.
