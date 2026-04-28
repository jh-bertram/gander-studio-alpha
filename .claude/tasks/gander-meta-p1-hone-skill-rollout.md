# Task: gander-meta-p1-hone-skill-rollout

**Human request:** Create the 4 new skills surfaced by `hone-2026-04-27-5` §8d candidates (`env-preflight`, `silent-substitution-detect`, `pm-preflight`, `react-flow-render-smoke`) and wire them into the pipeline at their intended trigger points.

**Routing:** full pipeline (PM → Critic → HR → Auditor → Archivist) — meta-team work, mandatory per `~/.claude/CLAUDE.md`.

**Source documents:**
- `/home/jhber/projects/gander/docs/agent-improvements/hone-2026-04-27-5.md`
- `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md` §8d
- `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p2-agent-cards.md` §8d

**Target paths:**
- 4 new SKILL.md at `/home/jhber/projects/gander/.claude/skills/{env-preflight,silent-substitution-detect,pm-preflight,react-flow-render-smoke}/SKILL.md`
- 3 existing SKILL.md updated: `assign-agents`, `audit-pipeline`, `dispatch-task` (under `/home/jhber/projects/gander/.claude/skills/`)
- Archive copies under `/home/jhber/projects/gander/docs/agent-versions/skills/{name}/v{old}-2026-04-27.md` for the 3 modified skills
- Changelog appended at `/home/jhber/projects/gander/docs/agent-changelog.md`
- Project log appended at `/home/jhber/projects/gander/docs/project_log.md` (Archivist)

**Constraints:**
- Strict YAML frontmatter; `description` third-person, single-line, ≤1024 chars; no `>` block scalars
- Version bumps per `hone/SKILL.md` rules (MINOR for new gates / sub-checks / steps)
- `react-flow-render-smoke` must be created before `audit-pipeline`'s edit references it (single HR packet preferred)
- No retirement decisions
- Audit must address Meta-Agent Independence flag for HR work
