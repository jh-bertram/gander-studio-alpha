# CLAUDE.md — Gander Studio

Local-first web app for browsing an agent team's roster (party home + per-agent drill-down + full-roster catalog) and reviewing sprint sessions, XP progression, and program history.

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
| `GANDER_ROOT` | Yes | Path to the gander project root to browse |
| `LOADOUTS_DIR` | Yes | Still required at startup (env.ts `requireEnv`); the loadout feature itself was removed in `prog-studio-v2-2026-07-s4-retirement` (BE-1) — this var now only anchors `SESSIONS_EDITS_DIR`'s default path (`{LOADOUTS_DIR}/../sessions-edits`) |
| `EXPORT_BASE_DIR` | No | **Deprecated/unused** — `export.spawn` was removed in `prog-studio-v2-2026-07-s4-retirement` (BE-1); the env var is still read by `env.ts` (default: `/tmp/gander-exports`) but has no live consumer |
| `SERVER_PORT` | No | Server port (default: `3001`) |
| `SESSIONS_EDITS_DIR` | No | Directory where session markdown edits are saved (default: absolute-normalized path adjacent to `LOADOUTS_DIR`) |
| `SESSIONS_SOURCE_DIRS` | No | Comma-delimited list of root directories to scan for post-mortems (default: `GANDER_ROOT`) |

See `.env.example` for reference.

## Architecture

```
packages/
├── shared/src/schemas.ts    — Zod schemas (Agent, Skill, Hook, Session, Connectivity, Program, Progression, Party, AgentDetail)
├── server/src/
│   ├── router.ts            — 18 tRPC procedures
│   ├── env.ts               — Environment config
│   └── parsers/             — File system parsers for agents, agent roles, skills, hooks, sessions, events, stats, party/roster, program, progression
└── client/src/
    ├── pages/               — PartyPage, AgentDetailPage, RosterCatalogPage, ProgressionPage, ProgramDagPage, sessions/ (SessionsRouter, SessionListPage, SessionDetailPage)
    ├── store/               — Zustand stores (ui-store, session-store, analyzeStore)
    ├── components/          — UI components + Shadcn primitives
    ├── constants/           — Design tokens, navigation, per-page constants
    ├── hooks/               — Data fetching hooks
    └── globals.css          — FF7 Remake Intergrade design tokens + Shadcn base
```

## Surfaces

| Surface | AppMode | Page Component |
|---------|---------|-----------------|
| Party (home) | `party` (default) | PartyPage — 6-agent-cap home roster grid + persistent "View Full Roster" CTA |
| Agent Detail | `agent-detail` | AgentDetailPage — per-agent stat bars, inventory panels, relationship graph (reached via a party card) |
| Roster Catalog | `catalog` | RosterCatalogPage — full 13-role catalog, uncapped (reached only via the party-home "View Full Roster" CTA) |
| Sessions | `sessions` | SessionsRouter → SessionListPage / SessionDetailPage — sprint post-mortem viewer + editor |
| Progression | `progression` | ProgressionPage — XP ledger timeline |
| Programs | `programs` | ProgramDagPage — program DAG viewer |

Navigation: global `SubmenuRail` (4 items — Roster→`party`, Sessions, Progression, Programs; `role="navigation"` `aria-label="Main navigation"`), hoisted into `AppShell.tsx` so it renders on every surface as a persistent 240px left rail at ≥640px viewport width. Below 640px it folds into `BottomTabBar` (`role="tablist"`, `role="tab"` per item, same `RAIL_ITEMS` source, same `aria-label="Main navigation"`) — exactly one "Main navigation" landmark is visible at any viewport width, never zero. `agent-detail` and `catalog` are not rail destinations: `agent-detail` is reached via a party-member card; `catalog` is reached only via the persistent "View Full Roster" CTA on the populated party home. The v1 9-tab `BottomTabBar`/`NAV_ITEMS` config is retired.

## Design Language

FF7 Remake Intergrade — Mako Teal primary palette. Design tokens are CSS custom properties in `globals.css :root`, mapped to Tailwind via `tailwind.config.ts`.

## Code Conventions

- TypeScript strict mode; no `any` without justification
- Every API boundary validated with Zod; infer types via `z.infer<typeof Schema>`
- Files: `kebab-case.ts`, Components: `PascalCase.tsx`, functions: `camelCase`
- Commits: Conventional Commits (`feat`, `fix`, `refactor`, `chore`)

## tRPC Procedures

18 procedures across 8 routers (agent, skill, hook, session, progression, program, roster, + top-level `health`) — derived by counting `t.procedure` entries in `packages/server/src/router.ts` at HEAD, 2026-07-10:

```
health                    GET  → 'ok'
agent.list                GET  → Agent[]
agent.get                 GET  → Agent
agent.save                MUT  → { success, filePath }
skill.list                GET  → Skill[]
skill.get                 GET  → Skill
skill.save                MUT  → { success, filePath }
hook.list                 GET  → Hook[]
session.list               GET  → { sessions: Session[], skipped: number }
session.get                GET  → Session (with events)
session.getStats           GET  → SessionStats
session.saveEdit           MUT  → { success, filePath }
session.aggregateStats     GET  → SessionStats (rolled up across sessionIds)
session.getRaw              GET  → { content, editedFilePath? }
progression.getLedger        GET  → ProgressionEntry[]
program.getDag                 GET  → ProgramDag[] (per programId)
roster.getParty                 GET  → PartyStats
roster.getAgentDetail             GET  → AgentDetail
```

`loadout.*`, `export.spawn`, `connectivity.getGraph`, and `planning.list` were removed in `prog-studio-v2-2026-07-s4-retirement` (BE-1) along with their client surfaces (Browse/Compose/Edit/Export/Planning). `ConnectivityGraphSchema` is retained in `packages/shared/src/schemas.ts` even though the `connectivity.getGraph` procedure was removed — it still has an active consumer: `packages/server/src/parsers/agent-detail.ts` imports it (line 16) and `safeParse`s the on-disk connectivity graph with it (line 44) to build the Agent Detail page's materia and relationship layers. This is why BE-1 pruned only `router.ts`'s dead import-site while keeping the schema definition and the `agent-detail.ts` import intact.

## Known Issues

- `npm audit --omit=dev`: 21 vulnerabilities (2 low, 10 moderate, 9 high) in production dependencies after reclassifying 7 build-tooling packages to devDependencies in `prog-studio-vision-2026-06-s5-DELETE`. Full audit (including devDeps): 23 vulns — 2 criticals in `serialize-javascript` via `workbox-build` (build-time only, no runtime exposure).
- Max production JS chunk: 407.00 kB (gzip 120.62 kB), `index-*.js` — re-measured via a fresh `npm run build -w @gander-studio/client`, 2026-07-10 (post s2/s3/s4 route-level code-splitting of PartyPage, AgentDetailPage, RosterCatalogPage, and ProgramDagPage via `React.lazy` in `ModeContent.tsx`). No Vite chunk-size warning emitted (well under both Vite's default 500 kB limit and the project's 1,000 kB QA gate). Supersedes the stale "~700KB" figure and DEFERRED-V2S2-2 (resolved by this measurement — see `docs/deferred-work.md`).
- `--redb` contrast: `#cf3c3c` at 4.07:1 on `--void` is below WCAG AA for normal text — tracked as DEFERRED-006.
