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

See `.env.example` for reference.

## Architecture

```
packages/
├── shared/src/schemas.ts    — Zod schemas (Agent, Skill, Hook, Loadout, Export)
├── server/src/
│   ├── router.ts            — 12 tRPC procedures
│   ├── env.ts               — Environment config
│   └── parsers/             — File system parsers for agents, skills, hooks
└── client/src/
    ├── pages/               — BrowsePage, ComposePage, EditPage, ExportPage
    ├── store/               — Zustand stores (ui, browse, compose, edit)
    ├── components/          — UI components + Shadcn primitives
    ├── constants/           — Design tokens, navigation, per-page constants
    ├── hooks/               — Data fetching hooks
    └── globals.css          — FF7 Remake Intergrade design tokens + Shadcn base
```

## Design Language

FF7 Remake Intergrade — Mako Teal primary palette. Design tokens are CSS custom properties in `globals.css :root`, mapped to Tailwind via `tailwind.config.ts`.

## Code Conventions

- TypeScript strict mode; no `any` without justification
- Every API boundary validated with Zod; infer types via `z.infer<typeof Schema>`
- Files: `kebab-case.ts`, Components: `PascalCase.tsx`, functions: `camelCase`
- Commits: Conventional Commits (`feat`, `fix`, `refactor`, `chore`)

## tRPC Procedures

```
health           GET
agent.list       GET  → Agent[]
agent.get        GET  → Agent
agent.save       MUT  → { success, filePath }
skill.list       GET  → Skill[]
skill.get        GET  → Skill
skill.save       MUT  → { success, filePath }
hook.list        GET  → Hook[]
loadout.list     GET  → Loadout[]
loadout.save     MUT  → { success, name }
loadout.delete   MUT  → { success }
export.spawn     MUT  → { targetPath, plannedFiles, loadoutSummary }
```

## Known Issues

- `npm audit`: 4 high severity vulns in `serialize-javascript` via `workbox-build` (build-time only, no runtime exposure)
- Chunk size warning: main JS bundle ~700KB (includes React + tRPC + Zustand)
