## [STAGE 3] COMPLETE
- **At:** 2026-06-20T00:11:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/components/sessions/AgentTimeline.tsx` | 1105 | 236 insertions, 16 deletions |
  | `packages/client/src/constants/browse.ts` | 43 | READ-ONLY — byte-unchanged |
- **Lint:** tsc --noEmit exit 0 (no errors)
- **Constant audit:** 0 raw hex matches; 0 @keyframes definitions; 0 `any` usages

### Checkpoint — 00:11:00
- Wrote `packages/client/src/components/sessions/AgentTimeline.tsx` (1105 lines). Constant audit: 0 matches. All 4 juice items delivered. Next: write output packet.

## [STAGE 2] PLAN
- **At:** 2026-06-20T00:05:00Z
- **Components to build:** AgentTimeline.tsx (modify only)
- **State design:**
  - `useUIStore` for `prefersReducedMotion` — use primitive selector via `window.matchMedia` in a `useEffect` (no Zustand store read for this; CSS handles suppression via globals.css `@media`)
  - Local state: `nowTs` (number, updated by setInterval) for live playhead position
  - `zoomLevel` and `containerWidth` preserved unchanged
  - No new Zustand object-selector patterns — all existing selectors are local state or primitives
- **tRPC wiring:** None — pure presentation
- **A11Y plan:**
  - FF7 tooltip replaces native `<title>` on bar group; each `g[role=img]` retains `aria-label`
  - Tooltip panel: `role="tooltip"` + `id` wired via `aria-describedby` on the bar group
  - Visually-hidden fallback text element preserves accessible name when tooltip not rendered
  - All existing keyboard-focusable groups (`tabIndex={0}`) preserved
  - Playhead: `aria-hidden="true"` (decorative indicator, not interactive)
  - Marching-ants orphan rect: gets `className="timeline-orphan-march"` (CSS animation)
  - Bar rects: get `className="timeline-bar-enter"` + `style={{ '--bar-index': rowIndex }}`

**Changes to make:**
1. Import `AGENT_MATERIA`, `DEFAULT_MATERIA` from `../constants/browse`
2. Add `roleColor(agentId)` helper mapping agent prefix → materia color
3. Add `NOW_INTERVAL_MS = 5000` constant + `nowTs` local state + `setInterval` effect
4. Add `TooltipState` local state (`{ bar: AgentBar; x: number; y: number } | null`)
5. `handleBarMouseEnter/Leave/Focus/Blur` → stable named functions (not inline lambdas)
6. In bar render: apply role color as `fill`, add `className="timeline-bar-enter"` + `style={{ '--bar-index': rowIndex }}`
7. Orphan bar rect: add `className="timeline-orphan-march"` (removes stroke animation from JSX attr)
8. Remove `<title>` from bar groups; add `aria-describedby` pointing to tooltip id
9. Render FF7 tooltip panel (absolute-positioned `<div>`) when `tooltipState !== null`
10. Render live 'now' playhead line at `nowTs` if within axis range, `className="timeline-playhead"`
11. Wrap SVG scroll container in `position:relative` for tooltip absolute positioning

## [STAGE 1] RECEIVED
- **From:** ORC (prog-studio-vision-2026-06 sprint)
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** s4-p4
- **Message received:**
  > s4-p4: juice the AgentTimeline on the s3 substrate. Make REAL edits to packages/client/src/components/sessions/AgentTimeline.tsx ONLY. DEPENDS ON s4-p1. Role-colored bars/markers from AGENT_MATERIA palette (unknown prefix -> DEFAULT_MATERIA / var(--wm)); marching-ants orphan stroke + staggered entrance + live 'now' playhead (classes from globals.css p1); FF7 tooltip panel replacing native <title> with accessible name (aria-label / visually-hidden) PRESERVED. No @keyframes in component. browse.ts READ-ONLY consume — do NOT modify browse.ts. PRESERVE RIGHT_PAD=48 no-clip, DEFERRED-002 zoom clamp (0.25-4.0), all s3 ev-type markers, s3 legibility SC. Stable Zustand selectors only. Legibility SC: bars/labels readable, AA contrast, no clipping. Write packet to /home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/prog-studio-vision-2026-06-s4-timeline-{ts}.md…[truncated]
