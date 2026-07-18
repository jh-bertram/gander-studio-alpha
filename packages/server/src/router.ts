import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { writeFile, readFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { GANDER_ROOT, SESSIONS_SOURCE_DIRS, SESSIONS_EDITS_DIR } from './env.js';
import { parseAllAgents } from './parsers/agent-parser.js';
import { parseAllSkills } from './parsers/skill-parser.js';
import { parseAllHooks } from './parsers/hook-parser.js';
import {
  AgentSchema,
  SkillSchema,
  SessionSchema,
  SessionStatsSchema,
  SessionRawInputSchema,
  SessionRawOutputSchema,
  AggregateStatsInputSchema,
  ProgramGetDagInputSchema,
  ProgramGetDagOutputSchema,
  PartyStatsSchema,
  AgentDetailSchema,
  type ProgressionEntry,
  type SessionStats,
  type Session,
  type EventLogEntry,
  ProgressionEntrySchema,
} from '@gander-studio/shared';
import { parseSessionFile } from './parsers/session-parser.js';
import { parseEventLogFiles } from './parsers/event-log-parser.js';
import { computeSessionStats } from './parsers/session-stats.js';
import { collectSessions } from './session-list.js';
import { sessionDocDirs } from './session-dirs.js';
import { validateSaveEditPath } from './parsers/saveedit-guard.js';
import { aggregateSessionStats } from './parsers/aggregate-stats.js';
import { parseLedgerContent } from './parsers/progression-parser.js';
import { parseProgramDags } from './parsers/program-dag-parser.js';
import { fileURLToPath } from 'node:url';
import { synthesizeSessions } from './parsers/session-synthesis.js';
import { sprintRoot } from './session-slug-match.js';
import { assembleParty } from './parsers/party-roster.js';
import { assembleAgentDetail } from './parsers/agent-detail.js';

const t = initTRPC.create();

// ---------------------------------------------------------------------------
// Studio root — the gander-studio-alpha repo root (NOT GANDER_ROOT).
// program.md files live here, not in the agent gander repo.
// Resolves 3 levels up from packages/server/src/router.ts → repo root.
// ---------------------------------------------------------------------------
// router.ts lives at packages/server/src/router.ts
// dirname(router.ts) = packages/server/src → 3 levels up = studio root
const STUDIO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..', '..', '..',
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Scan SESSIONS_SOURCE_DIRS for a session matching `id` (by session.id or session.sprint).
 * Returns `{ session, dir }` when found, or `null` when not found.
 * Skips unparseable files silently (same as per-caller behaviour).
 */
async function findSessionById(
  id: string,
): Promise<{ session: Session; dir: string } | null> {
  for (const dir of SESSIONS_SOURCE_DIRS) {
    for (const docDir of sessionDocDirs(dir)) {
      let entries: string[];
      try {
        entries = await readdir(docDir);
      } catch {
        continue;
      }
      for (const file of entries.filter((e) => e.endsWith('.md'))) {
        const filePath = path.join(docDir, file);
        try {
          const session = await parseSessionFile(filePath, dir);
          if (session.id === id || session.sprint === id) {
            return { session, dir };
          }
        } catch {
          continue;
        }
      }
    }
  }

  // Synthesis fallthrough: no doc found — build synthetic from event logs if possible.
  const targetRoot = sprintRoot(id);
  if (targetRoot !== null) {
    for (const dir of SESSIONS_SOURCE_DIRS) {
      const synthetics = await synthesizeSessions(dir, [], []);
      const match = synthetics.find((s) => s.id === targetRoot);
      if (match) {
        return { session: match, dir };
      }
    }
  }

  return null;
}

function guardPath(filePath: string): void {
  const resolved = path.resolve(filePath);
  const root = path.resolve(GANDER_ROOT);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'filePath must be inside GANDER_ROOT',
    });
  }
}

/**
 * Resolve event-log entries for a session using a two-stage slug strategy:
 *
 *  1. PRIMARY: first whitespace-delimited token of session.sprint. Strips
 *     parenthetical title suffixes (e.g. "v1.2 (some-session)") while
 *     preserving dotted-version strings ("v1.2" ≠ "v1-2" after toSlug).
 *  2. FALLBACK: session.id (toSlug(filename-stem)) when primary yields 0 matches.
 *     Required for prose-H1 Format B sessions where sprint prose like
 *     "Gander Studio P2 + P3" produces primary="Gander" which never matches
 *     lowercase task_ids like "gander-studio-p2-p3-t1".
 *
 * Emits a console.warn when falling back so zero-match sessions are observable.
 */
async function resolveSessionEvents(
  eventsDir: string,
  session: { sprint: string; id: string },
  callerLabel: string,
): Promise<EventLogEntry[]> {
  const sprintSlug = session.sprint.split(/\s+/)[0];
  let events = await parseEventLogFiles(eventsDir, sprintSlug);
  if (events.length === 0 && session.id !== sprintSlug) {
    console.warn(
      `[${callerLabel}] sprintSlug "${sprintSlug}" matched 0 events for session "${session.id}"; ` +
      `retrying with session.id as slug fallback`,
    );
    events = await parseEventLogFiles(eventsDir, session.id);
  }
  return events;
}

// Maximum number of sessions to fetch when building an aggregate across all sessions.
// Large enough to span all known sessions; limits memory footprint for very large repos.
const AGGREGATE_LIMIT = 500;

/** Placeholder returned by getRaw for sessions with no after-action document (single-sourced). */
const NO_AFTER_ACTION_PLACEHOLDER =
  'No after-action document yet for {id} — synthesized from the event log.';

// ---------------------------------------------------------------------------
// Sub-routers
// ---------------------------------------------------------------------------

const agentRouter = t.router({
  list: t.procedure.query(async () => {
    return parseAllAgents(GANDER_ROOT);
  }),

  get: t.procedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const agents = await parseAllAgents(GANDER_ROOT);
      const agent = agents.find(a => a.name === input.name);
      if (!agent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Agent '${input.name}' not found`,
        });
      }
      return agent;
    }),

  save: t.procedure
    .input(AgentSchema)
    .mutation(async ({ input }) => {
      guardPath(input.filePath);

      const versionLine = input.version ? `version: ${input.version}\n` : '';
      const tierLine =
        input.tier !== 'optional' ? `tier: ${input.tier}\n` : '';
      const communicatesLine =
        input.communicates_with && input.communicates_with.length > 0
          ? `communicates_with: ${input.communicates_with.join(', ')}\n`
          : '';

      const content =
        `---\n` +
        `name: ${input.name}\n` +
        `description: ${input.description}\n` +
        `tools: ${input.tools.join(', ')}\n` +
        `model: ${input.model}\n` +
        versionLine +
        tierLine +
        communicatesLine +
        `---\n` +
        input.body;

      await writeFile(input.filePath, content, 'utf8');
      return { success: true as const, filePath: input.filePath };
    }),
});

const skillRouter = t.router({
  list: t.procedure.query(async () => {
    return parseAllSkills(GANDER_ROOT);
  }),

  get: t.procedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const skills = await parseAllSkills(GANDER_ROOT);
      const skill = skills.find(s => s.name === input.name);
      if (!skill) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Skill '${input.name}' not found`,
        });
      }
      return skill;
    }),

  save: t.procedure
    .input(SkillSchema)
    .mutation(async ({ input }) => {
      guardPath(input.filePath);

      const content =
        `---\n` +
        `name: ${input.name}\n` +
        `description: ${input.description}\n` +
        `---\n` +
        input.body;

      await writeFile(input.filePath, content, 'utf8');
      return { success: true as const, filePath: input.filePath };
    }),
});

const hookRouter = t.router({
  list: t.procedure.query(async () => {
    return parseAllHooks(GANDER_ROOT);
  }),
});

// ---------------------------------------------------------------------------
// Session sub-router
// ---------------------------------------------------------------------------
//
// WARNING-2 (response shape asymmetry):
//   session.list  → envelope: { sessions: Session[], skipped: number }
//   session.get   → bare Session object
//   session.getStats → bare SessionStats object
// This asymmetry is intentional: list needs the skipped count for FE observability
// while get/getStats return a single entity where no envelope is required.

const sessionRouter = t.router({
  // session.list — returns envelope { sessions, skipped } so callers know how many
  // files were unparseable (skipped > 0 signals data quality issues upstream).
  list: t.procedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }))
    .output(z.object({ sessions: z.array(SessionSchema), skipped: z.number() }))
    .query(async ({ input }) => {
      return collectSessions(SESSIONS_SOURCE_DIRS, input.limit);
    }),

  get: t.procedure
    .input(z.object({ id: z.string() }))
    .output(SessionSchema)
    .query(async ({ input }) => {
      const found = await findSessionById(input.id);
      if (!found) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Session '${input.id}' not found` });
      }
      const { session } = found;
      const eventsDir = path.join(session.source_root, 'docs', 'events');
      const events = await resolveSessionEvents(eventsDir, session, 'session.get');
      return { ...session, events };
    }),

  getStats: t.procedure
    .input(z.object({ id: z.string() }))
    .output(SessionStatsSchema)
    .query(async ({ input }) => {
      const found = await findSessionById(input.id);
      if (!found) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Session '${input.id}' not found` });
      }
      const { session: foundSession } = found;
      const eventsDir = path.join(foundSession.source_root, 'docs', 'events');
      const events = await resolveSessionEvents(eventsDir, foundSession, 'session.getStats');
      return computeSessionStats(foundSession, events);
    }),

  saveEdit: t.procedure
    .input(z.object({ id: z.string(), content: z.string() }))
    .output(z.object({ success: z.boolean(), filePath: z.string() }))
    .mutation(async ({ input }) => {
      // Resolve session first — unknown id → NOT_FOUND; doc-less → BAD_REQUEST.
      // Behavior change: previously accepted any id; now requires a known, doc-backed session.
      const found = await findSessionById(input.id);
      if (!found) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Session '${input.id}' not found` });
      }
      if (!found.session.has_after_action) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot edit a session with no after-action document',
        });
      }
      let target: string;
      try {
        target = validateSaveEditPath(input.id, SESSIONS_EDITS_DIR);
      } catch {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Path traversal detected' });
      }
      await mkdir(SESSIONS_EDITS_DIR, { recursive: true });
      await writeFile(target, input.content, 'utf8');
      return { success: true as const, filePath: target };
    }),

  // aggregateStats — rolls up SessionStats across a list of session IDs.
  // Returns a single SessionStats-shaped object whose total_* fields are sums
  // across the matched sessions. session_id is a synthetic join key.
  aggregateStats: t.procedure
    .input(AggregateStatsInputSchema)
    .output(SessionStatsSchema)
    .query(async ({ input }) => {
      const { sessions } = await collectSessions(SESSIONS_SOURCE_DIRS, AGGREGATE_LIMIT);
      const matched = sessions.filter((s) => input.sessionIds.includes(s.id));
      if (matched.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No sessions found matching the provided IDs`,
        });
      }

      // allSettled-and-skip: a single bad session file must not 500 the aggregate
      const perSessionSettled = await Promise.allSettled(
        matched.map(async (session) => {
          const eventsDir = path.join(session.source_root, 'docs', 'events');
          const events = await resolveSessionEvents(eventsDir, session, 'session.aggregateStats');
          return computeSessionStats(session, events);
        }),
      );
      const perSessionStats = perSessionSettled
        .filter((r): r is PromiseFulfilledResult<SessionStats> => r.status === 'fulfilled')
        .map((r) => r.value);

      // Explicit parse validates the flat shape before returning to the caller.
      return SessionStatsSchema.parse(aggregateSessionStats(perSessionStats, input.sessionIds));
    }),

  // getRaw — returns the raw markdown of a session file, preferring the edited
  // version in SESSIONS_EDITS_DIR when one exists (round-trip for saveEdit).
  // Client input: id only (never filePath — path-traversal prevention).
  // Priority: SESSIONS_EDITS_DIR/{id}.md (if present, path-guarded) > session.filePath (original).
  getRaw: t.procedure
    .input(SessionRawInputSchema)
    .output(SessionRawOutputSchema)
    .query(async ({ input }) => {
      const found = await findSessionById(input.id);
      if (!found) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Session '${input.id}' not found` });
      }
      const { session } = found;
      // Guard: doc-less sessions have no source file — return graceful placeholder (no 500).
      if (!session.has_after_action) {
        return {
          content: NO_AFTER_ACTION_PLACEHOLDER.replace('{id}', session.id),
          editedFilePath: undefined,
        };
      }
      // Prefer edit file in SESSIONS_EDITS_DIR when it exists (D6 round-trip).
      // Re-runs validateSaveEditPath to guard against path traversal.
      let editedFilePath: string | undefined;
      let content: string;
      try {
        const editTarget = validateSaveEditPath(session.id, SESSIONS_EDITS_DIR);
        const editContent = await readFile(editTarget, 'utf8');
        // Edit file exists and readable — use it
        content = editContent;
        editedFilePath = editTarget;
      } catch {
        // Edit file absent or unreadable — fall back to original source
        try {
          content = await readFile(session.filePath, 'utf8');
        } catch {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Operation failed',
          });
        }
      }
      return { content, editedFilePath };
    }),
});

// ---------------------------------------------------------------------------
// Program router
// ---------------------------------------------------------------------------

const programRouter = t.router({
  getDag: t.procedure
    .input(ProgramGetDagInputSchema)
    .output(ProgramGetDagOutputSchema)
    .query(async ({ input }) => {
      return parseProgramDags(STUDIO_ROOT, input.programId);
    }),
});

// ---------------------------------------------------------------------------
// Progression router
// ---------------------------------------------------------------------------

const progressionRouter = t.router({
  getLedger: t.procedure
    .output(z.array(ProgressionEntrySchema))
    .query(async (): Promise<ProgressionEntry[]> => {
      const ledgerPath = path.join(GANDER_ROOT, 'docs', 'progression-ledger.md');

      guardPath(ledgerPath);

      let raw: string;
      try {
        raw = await readFile(ledgerPath, 'utf8');
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code === 'ENOENT') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Progression ledger not found' });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Operation failed' });
      }

      return parseLedgerContent(raw);
    }),
});

// ---------------------------------------------------------------------------
// Roster router — v2 party/agent-detail contract (prog-studio-v2-2026-07).
// getParty (t3) ships here; getAgentDetail (t4) appends to this SAME router.
// ---------------------------------------------------------------------------

const rosterRouter = t.router({
  getParty: t.procedure
    .output(PartyStatsSchema)
    .query(async () => {
      return assembleParty(SESSIONS_SOURCE_DIRS.map((dir) => path.join(dir, 'docs', 'events')));
    }),
  getAgentDetail: t.procedure
    .input(z.object({ code: z.string() }))
    .output(AgentDetailSchema)
    .query(async ({ input }) => {
      try {
        return await assembleAgentDetail(
          input.code,
          GANDER_ROOT,
          SESSIONS_SOURCE_DIRS.map((dir) => path.join(dir, 'docs', 'events')),
        );
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('Unknown role code')) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Unknown role code' });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Operation failed' });
      }
    }),
});

// ---------------------------------------------------------------------------
// App router
// ---------------------------------------------------------------------------

export const appRouter = t.router({
  health: t.procedure.query(() => 'ok' as const),
  agent: agentRouter,
  skill: skillRouter,
  hook: hookRouter,
  session: sessionRouter,
  progression: progressionRouter,
  program: programRouter,
  roster: rosterRouter,
});

export type AppRouter = typeof appRouter;
