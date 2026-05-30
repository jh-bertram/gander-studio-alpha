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

// SessionRawInputSchema / SessionRawOutputSchema — for session.getRaw procedure
export const SessionRawInputSchema = z.object({ id: z.string() });
export type SessionRawInput = z.infer<typeof SessionRawInputSchema>;

export const SessionRawOutputSchema = z.object({ content: z.string() });
export type SessionRawOutput = z.infer<typeof SessionRawOutputSchema>;

// AggregateStatsInputSchema — input for session.aggregateStats procedure
export const AggregateStatsInputSchema = z.object({
  sessionIds: z.array(z.string()).min(1),
});
export type AggregateStatsInput = z.infer<typeof AggregateStatsInputSchema>;

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

// ---------------------------------------------------------------------------
// ConnectivityGraph — output of the connectivity analyzer (spec §4)
// Real-file nullability authority: /home/jhber/projects/gander/docs/connectivity-graph.json
// ---------------------------------------------------------------------------

const NodeTypeSchema = z.enum(['agent', 'skill', 'rule', 'ref', 'hook', 'eval', 'claudemd']);

const EdgeTypeSchema = z.enum([
  'spawns',
  'references_skill',
  'invokes_skill',
  'triggers_hook',
  'imports_ref',
  'improves_agent',
  'improves_skill',
  'evaluated_by',
  'communicates_with',
]);

// Node data — fields that the real analyzer emits as explicit null MUST be .nullable().optional()
// Verified 2026-05-30 against connectivity-graph.json (N=77 nodes):
//   tier:    ALL 13 agent nodes emit "tier": null  → .nullable().optional()
//   version: 1/13 agent nodes (database) emit "version": null → .nullable().optional()
//   skill.version: 6/38 skill nodes omit version key entirely (not null) → .optional() only
// All other optional fields are simply absent (key missing) when not applicable → .optional() only
const ConnectivityNodeDataSchema = z.object({
  label: z.string(),
  filePath: z.string(),
  nodeType: NodeTypeSchema,
  confidence: z.enum(['DETECTED', 'INFERRED']),
  // agent-specific: emitted as explicit null when not in frontmatter
  version: z.string().nullable().optional(),        // null on database agent; absent on skill/rule/ref nodes
  tier: z.string().nullable().optional(),           // null on ALL 13 agent nodes; absent on all other node types
  description: z.string().optional(),
  communicates_with: z.array(z.string()).optional(),
  // rule/ref-specific
  size_lines: z.number().optional(),
  // hook-specific
  event_type: z.string().optional(),
  matcher: z.string().optional(),
  // eval-specific
  agent_under_test: z.string().optional(),
  // claudemd-specific
  scope: z.enum(['user', 'project']).optional(),
});

export const ConnectivityNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  data: ConnectivityNodeDataSchema,
});

// Edge data — no fields emit explicit null in the real file (verified 2026-05-30)
const ConnectivityEdgeDataSchema = z.object({
  edgeType: EdgeTypeSchema,
  confidence: z.enum(['DETECTED', 'INFERRED']),
  dataSource: z.string(),
  rawMatch: z.string().optional(),
});

export const ConnectivityEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: EdgeTypeSchema,
  label: z.string().optional(),
  data: ConnectivityEdgeDataSchema,
});

// Diagnostic record schemas
const DeadReferenceSchema = z.object({
  edgeId: z.string(),
  source: z.string(),
  target: z.string(),
  edgeType: EdgeTypeSchema,
  dataSource: z.string(),
});

const OrphanNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
});

const OverCoupledNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  inDegree: z.number(),
  threshold: z.number(),
});

const MissingEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  reason: z.literal('declared_communicates_with_but_no_edge_detected'),
});

export const ConnectivityGraphSchema = z.object({
  generated: z.string(),
  gander_root: z.string(),
  schema_version: z.literal('1.0'),
  nodes: z.array(ConnectivityNodeSchema),
  edges: z.array(ConnectivityEdgeSchema),
  diagnostics: z.object({
    dead_references: z.array(DeadReferenceSchema),
    orphan_nodes: z.array(OrphanNodeSchema),
    over_coupled: z.array(OverCoupledNodeSchema),
    missing_edges: z.array(MissingEdgeSchema),
  }),
});
export type ConnectivityGraph = z.infer<typeof ConnectivityGraphSchema>;
