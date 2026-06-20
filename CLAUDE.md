# CLAUDE.md — Gander Studio

Local-first web app for browsing, composing, editing, and exporting Claude Code agent team loadouts.

## Stack

- **Server:** TypeScript + tRPC + Zod (strict mode)
- **Client:** React 19 + Tailwind CSS 3 + Shadcn/ui + Zustand
- **Build:** Vite 6 + VitePWA
- **Monorepo:** npm workspaces (`packages/shared`, `packages/server`, `packages/client`)

## Commands

```bash
npm install          # install all workspace dependencies
npm run dev          # start server (port 3001) + client (Vite) concurrently
npm run build        # production build (client only)
npm run lint         # typecheck all three packages
npm audit            # check for vulnerabilities
```

## Environment Variables

Required at runtime — set in `.env` or export before `npm run dev`:

| Variable | Required | Description |
|----------|----------|-------------|
| `GANDER_ROOT` | Yes | Path to the gander project root to browse/edit |
| `LOADOUTS_DIR` | Yes | Path for storing loadout JSON files |
| `EXPORT_BASE_DIR` | No | Export target directory (default: `/tmp/gander-exports`) |
| `SERVER_PORT` | No | Server port (default: `3001`) |
| `SESSIONS_EDITS_DIR` | No | Directory where session markdown edits are saved (default: absolute-normalized path adjacent to `LOADOUTS_DIR`) |
| `SESSIONS_SOURCE_DIRS` | No | Comma-delimited list of root directories to scan for post-mortems (default: `GANDER_ROOT`) |

See `.env.example` for reference.

## Architecture

```
packages/
├── shared/src/schemas.ts    — Zod schemas (Agent, Skill, Hook, Loadout, Export, Session, Connectivity, Planning, Program, Progression)
├── server/src/
│   ├── router.ts            — 22 tRPC procedures
│   ├── env.ts               — Environment config
│   └── parsers/             — File system parsers for agents, skills, hooks, sessions, events, stats, connectivity, planning, program, progression
└── client/src/
    ├── pages/               — BrowsePage, ComposePage, EditPage, ExportPage, SessionListPage, SessionDetailPage, GraphPage, ProgressionPage, PlanningPage, ProgramsPage
    ├── store/               — Zustand stores (ui, browse, compose, edit, canvas, session-picker)
    ├── components/          — UI components + Shadcn primitives
    ├── constants/           — Design tokens, navigation, per-page constants
    ├── hooks/               — Data fetching hooks
    └── globals.css          — FF7 Remake Intergrade design tokens + Shadcn base
```

## Surfaces

| Mode | Route | Page Component |
|------|-------|----------------|
| Browse | `/` (default) | BrowsePage — agent/skill/hook card grid |
| Compose | compose | ComposePage — React Flow materia canvas |
| Edit | edit | EditPage — markdown editor (agents/skills) |
| Export | export | ExportPage — export loadout to disk |
| Sessions | sessions | SessionListPage / SessionDetailPage — sprint post-mortem viewer + editor |
| Graph | graph | GraphPage — React Flow connectivity graph |
| Progression | progression | ProgressionPage — XP ledger timeline |
| Planning | planning | PlanningPage — backlog + sprint planning surface |
| Programs | programs | ProgramsPage — program DAG viewer |

Navigation: `BottomTabBar` (role="tablist", 9 tabs, role="tab" on each button).

## Design Language

FF7 Remake Intergrade — Mako Teal primary palette. Design tokens are CSS custom properties in `globals.css :root`, mapped to Tailwind via `tailwind.config.ts`.

## Code Conventions

- TypeScript strict mode; no `any` without justification
- Every API boundary validated with Zod; infer types via `z.infer<typeof Schema>`
- Files: `kebab-case.ts`, Components: `PascalCase.tsx`, functions: `camelCase`
- Commits: Conventional Commits (`feat`, `fix`, `refactor`, `chore`)

## tRPC Procedures

22 procedures across 10 routers (verified against `packages/server/src/router.ts`):

```
health                    GET  → 'ok'
agent.list                GET  → Agent[]
agent.get                 GET  → Agent
agent.save                MUT  → { success, filePath }
skill.list                GET  → Skill[]
skill.get                 GET  → Skill
skill.save                MUT  → { success, filePath }
hook.list                 GET  → Hook[]
loadout.list              GET  → Loadout[]
loadout.save              MUT  → { success, name }
loadout.delete            MUT  → { success }
export.spawn              MUT  → { targetPath, plannedFiles, loadoutSummary }
session.list              GET  → Session[]
session.get               GET  → Session (with events)
session.getStats          GET  → SessionStats
session.saveEdit          MUT  → { success, filePath }
session.aggregateStats    GET  → AggregateStats
session.getRaw            GET  → { content, filePath }
connectivity.getGraph     GET  → ConnectivityGraph
planning.list             GET  → PlanningListOutput
program.getDag            GET  → ProgramGetDagOutput
progression.getLedger     GET  → ProgressionEntry[]
```

## Known Issues

- `npm audit --omit=dev`: 21 vulnerabilities (2 low, 10 moderate, 9 high) in production dependencies after reclassifying 7 build-tooling packages to devDependencies in `prog-studio-vision-2026-06-s5-DELETE`. Full audit (including devDeps): 23 vulns — 2 criticals in `serialize-javascript` via `workbox-build` (build-time only, no runtime exposure).
- Chunk size warning: main JS bundle ~700KB (includes React + tRPC + Zustand)
- `--redb` contrast: `#cf3c3c` at 4.07:1 on `--void` is below WCAG AA for normal text — tracked as DEFERRED-006.
