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

// EventLogEntrySchema — one parsed JSONL event-log line
// ev is z.string() (not z.enum) — live corpus has open-ended event types
export const EventLogEntrySchema = z.object({
  seq: z.number(),
  ts: z.string(),
  ev: z.string(),
  task_id: z.string(),
  agent_id: z.string(),
  parent_id: z.string().optional(),
  edge_label: z.string().optional(),
  output_files: z.array(z.string()).optional(),
});
export type EventLogEntry = z.infer<typeof EventLogEntrySchema>;

// AgentActivitySchema — per-agent roll-up for one session
export const AgentActivitySchema = z.object({
  agent_id: z.string(),
  spawns: z.number(),
  completes: z.number(),
  feedback_loops: z.number(),
  critique_passes: z.number(),
  critique_blocks: z.number(),
  audit_passes: z.number(),
  audit_fails: z.number(),
  wall_clock_ms: z.number().optional(),
});
export type AgentActivity = z.infer<typeof AgentActivitySchema>;

// SessionSchema — top-level parsed session object
// gap_classes/.default([]) and status/type/.optional() allow frontmatter-less files to parse
export const SessionSchema = z.object({
  id: z.string(),
  sprint: z.string(),
  date: z.string(),
  gap_classes: z.array(z.string()).default([]),
  status: z.string().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  filePath: z.string(),
  editedFilePath: z.string().optional(),
  source_root: z.string(),
  agents: z.array(AgentActivitySchema),
  events: z.array(EventLogEntrySchema),
});
export type Session = z.infer<typeof SessionSchema>;

// SessionStatsSchema — aggregated stats for a session
export const SessionStatsSchema = z.object({
  session_id: z.string(),
  total_spawns: z.number(),
  total_completes: z.number(),
  total_feedback_loops: z.number(),
  total_critique_passes: z.number(),
  total_critique_blocks: z.number(),
  total_audit_passes: z.number(),
  total_audit_fails: z.number(),
  agents: z.array(AgentActivitySchema),
  wall_clock_ms: z.number().optional(),
  event_count: z.number(),
});
export type SessionStats = z.infer<typeof SessionStatsSchema>;
