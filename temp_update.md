# Agent Team Hierarchy Update (2026-04-02)

## The agent team is now globally available — no setup needed in this project.

### What changed

The Gander agent team (agents, skills, rules) is now symlinked into `~/.claude/`, making it available to every project on this machine automatically:

```
~/.claude/agents  →  ~/projects/gander/.claude/agents
~/.claude/skills  →  ~/projects/gander/.claude/skills
~/.claude/rules   →  ~/projects/gander/.claude/rules
```

You no longer need to copy or symlink agent files into this project's `.claude/` directory. Claude Code reads the global `~/.claude/` for every session.

### Project-level overrides

If this project needs a project-specific agent (e.g., a different `frontend.md` for a non-standard stack), place it in `.claude/agents/` here. Local files take precedence over the global team. Everything else inherits from Gander automatically.

### New additions relevant to this project (UI work)

- **`generate-design` skill** — run this before any sprint with new UI surfaces to bootstrap `DESIGN.md` at this app's root. It scans your existing palette/constants files and asks you to confirm before writing.
- **`DESIGN.md` pattern** — agents now check for `apps/gander-studio-alpha/DESIGN.md` (or similar app root) before producing design specs. If absent, PM will flag it in `<risk_flags>`. Run `/generate-design` to create it.
- **`design-system.md`** — canonical format spec at `.claude/rules/design-system.md`. Defines token categories, component rules, and agent responsibilities.

### Source of truth

Edit the team at `~/projects/gander/`. Changes propagate here immediately.

Delete this file once you've noted the change.
