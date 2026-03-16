# Gander Studio

Local-first web app for browsing, composing, editing, and exporting Claude Code agent team loadouts.

## What it does

| Page | Purpose |
|------|---------|
| **Browse** | View all agents, skills, and hooks from a gander project. Filter by type, search by name, click any item to read its full definition. |
| **Compose** | Build a loadout — a named collection of agents, skills, and hooks. Add/remove items, name your loadout, save it to disk. |
| **Edit** | Open any agent or skill file in a split-pane markdown editor. Edit frontmatter fields (name, description, tools, model) and the body. Live markdown preview. Save writes back to the source file. |
| **Export** | Pick a saved loadout and a target directory name. Copies the selected agent `.md` files, skill `SKILL.md` files, and hook scripts into a new `.claude/` directory structure, ready to drop into any project. |

## Where it reads from

Everything is read from the project pointed to by `GANDER_ROOT`:

| Content | Source path |
|---------|-------------|
| Agents | `$GANDER_ROOT/.claude/agents/*.md` |
| Skills | `$GANDER_ROOT/.claude/skills/*/SKILL.md` |
| Hooks | `$GANDER_ROOT/.claude/settings.json` → `hooks` section; script files read from the paths listed there |

Agents and skills are parsed from their YAML frontmatter (`name`, `description`, `tools`, `model`, `version`, `tier`) plus markdown body. The parser includes a fallback for agent files with colons in unquoted YAML values.

## Where it writes to

| Action | Destination |
|--------|-------------|
| Save agent/skill edits | Back to the original file path in `$GANDER_ROOT` (in-place) |
| Save loadout | `$LOADOUTS_DIR/<name>.json` |
| Export loadout | `$EXPORT_BASE_DIR/<targetDirName>/.claude/agents/`, `.claude/skills/`, `.claude/hooks/` |

All write paths are validated to stay inside `GANDER_ROOT` or the configured directories — no path traversal.

## Setup

```bash
npm install

# Create a .env file (or export these vars):
GANDER_ROOT=/path/to/your/gander/project   # required
LOADOUTS_DIR=./loadouts                     # required
EXPORT_BASE_DIR=/tmp/gander-exports         # optional, default: /tmp/gander-exports
SERVER_PORT=3001                            # optional, default: 3001

npm run dev
# Server: http://localhost:3001
# Client: http://localhost:5173
```

See `.env.example` for a template.

## Stack

- **Server:** Node.js + tRPC + Zod (TypeScript strict)
- **Client:** React 19 + Tailwind CSS 3 + Shadcn/ui + Zustand
- **Build:** Vite 6 + VitePWA (installable, offline-capable)
- **Monorepo:** npm workspaces — `packages/shared`, `packages/server`, `packages/client`

## Commands

```bash
npm run dev      # start server + client concurrently
npm run build    # production build (client)
npm run lint     # typecheck all packages
npm audit        # dependency vulnerability scan
```

## Current state

Alpha. Core read/write/export loop works. Known gaps:

- Hook editing is read-only (browse only, no save)
- No undo/redo in the editor
- PWA icons are placeholder (generic "G" mark)
- 4 high-severity audit findings in `serialize-javascript` via `workbox-build` — build-time only, not exploitable at runtime
