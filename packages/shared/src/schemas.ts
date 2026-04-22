import { z } from 'zod';

// Agent — parsed from .claude/agents/*.md frontmatter + body
export const AgentSchema = z.object({
  name: z.string(),
  description: z.string(),
  tools: z.array(z.string()),
  model: z.string(),
  version: z.string().optional(),
  tier: z.enum(['core', 'impl', 'optional']).default('optional'),
  communicates_with: z.array(z.string()).optional(),
  body: z.string(),
  filePath: z.string(),
});

// Skill — parsed from .claude/skills/*/SKILL.md
export const SkillSchema = z.object({
  name: z.string(),
  description: z.string(),
  body: z.string(),
  filePath: z.string(),
});

// Hook — parsed from .claude/hooks/*.sh + settings.json
export const HookSchema = z.object({
  event: z.enum(['PreToolUse', 'PostToolUse', 'Stop']),
  matcher: z.string(),
  filePath: z.string(),
  command: z.string(),
  body: z.string(),
});

// Loadout — user-composed selection of agents, skills, hooks
export const LoadoutSchema = z.object({
  name: z.string(),
  agents: z.array(z.string()),
  skills: z.array(z.string()),
  hooks: z.array(z.string()),
  createdAt: z.string(),
  connections: z.array(z.object({ source: z.string(), target: z.string() })).default([]),
  cardTitle: z.string().optional(),
});

// ExportInputSchema — input for export.spawn procedure
export const ExportInputSchema = z.object({
  loadout: LoadoutSchema,
  targetDirName: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid directory name'),
  includeStandards: z.boolean().default(false),
  targetBasePath: z.string().optional(),
});
