# UI Agent Log — gander-studio-p2-canvas-link-002

## [STAGE 1] RECEIVED
- ts: 2026-03-28T00:00:00Z
- task_id: gander-studio-p2-canvas-link-002
- agent_id: UI#1
- Summary: Five-surface design spec for Gander Studio canvas overhaul — glassy 3D CSS orb, magnetic snap animation, link flash/edge glow, LoadoutListPanel layout, Web Audio sound parameters.
- Context files to read: MateriaNode.tsx, MateriaCanvas.tsx, canvas.ts, globals.css

---

## [STAGE 2] PLAN

### Surfaces to spec
1. Glassy 3D CSS Orb — depth gradient, specular highlight child div, rim glow, inner shadow
2. Magnetic Snap Animation — orb-attract keyframe, .orb-attracted class, spring settle
3. Link Flash + Edge Glow — orb-link-flash keyframe, persistent linked ring, edge style object
4. LoadoutListPanel Layout — 240px right panel, all measurements
5. Web Audio Parameters — approach tone + ker-chink ADSR, numbers only

### Design decisions to resolve before writing

**Surface 1 — Orb**
- Existing MateriaNode uses `backgroundColor: getMateriaColor(name, type)` with `--gt` box-shadow
- New spec must introduce `--orb-color` custom property injected inline; the orb base will be a gradient using `--orb-color` rather than a flat backgroundColor
- Light source: top-left (standard glass sphere convention)
- Highlight: child div (not ::before/::after per constraint); must be positioned absolutely
- Existing `buildOrbShadow` does `var(--gt)` + optional inset for orchestrator; new spec supersedes this with layered box-shadow

**Surface 2 — Snap Animation**
- keyframe name locked to `orb-attract` per spec
- class name locked to `.orb-attracted`
- translateY(-8px) as default axis (upward pull) since actual direction applied by JS

**Surface 3 — Flash + Edge**
- keyframe name locked to `orb-link-flash`
- Persistent linked state ring: uses `--bdb` (stronger teal border) as a ring via box-shadow
- Edge style: existing EDGE_STROKE_COLOR = `var(--mt)`, EDGE_STROKE_WIDTH = 2 — spec upgrades to include filter drop-shadow
- Use `animated: true` on linked edges (React Flow dashed march animation)

**Surface 4 — LoadoutListPanel**
- Panel is 240px wide, right side
- Background: `var(--sfm)` (matches palette sidebar pattern)
- Border-left: `1px solid var(--bd)` (same as palette border-right pattern)
- Row structure: colored dot (10px) + label, connection indicator below

**Surface 5 — Web Audio**
- Approach tone: gentle sine wave rising, filtered — calming but noticeable
- Ker-chink: metallic click is sawtooth (short decay) + bell resonance is sine (longer decay)
- All values locked to exact numbers

### Tokens used
- `--mt` (#5499b5) — primary teal stroke / rim glow
- `--gt` (0 0 12px rgba(84,153,181,0.4)) — existing glow shadow
- `--bdb` (rgba(84,153,181,0.55)) — stronger border / linked ring
- `--void` (#070d0c) — canvas background
- `--sf` (#0d1a18) — darkest surface
- `--sfm` (#122420) — mid surface / panel background
- `--sfh` (#1a3530) — highlight surface
- `--bd` (rgba(84,153,181,0.25)) — standard border
- `--wd` (rgba(255,255,255,0.72)) — label text
- `--wm` (rgba(255,255,255,0.38)) — dim text
- `--w` (#ffffff) — white flash
- `--my` (#e8c840) — orchestrator yellow

**New token proposed:** `--orb-color` — injected inline per node, not a global; no globals.css change needed

---

## [STAGE 3] COMPLETE
- ts: 2026-03-28T00:10:00Z
- output: .claude/agents/tasks/outputs/gander-studio-p2-canvas-link-002-UI-1774730585.md
