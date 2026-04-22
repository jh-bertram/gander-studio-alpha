import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { writeFile, readFile, readdir, unlink, mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { GANDER_ROOT, LOADOUTS_DIR, EXPORT_BASE_DIR } from './env.js';
import { parseAllAgents } from './parsers/agent-parser.js';
import { parseAllSkills } from './parsers/skill-parser.js';
import { parseAllHooks } from './parsers/hook-parser.js';
import {
  AgentSchema,
  SkillSchema,
  LoadoutSchema,
  ExportInputSchema,
} from '@gander-studio/shared';

const t = initTRPC.create();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function sanitizeName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9_-]/g, '');
  if (clean.length === 0) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Name contains no valid characters' });
  }
  return clean;
}

// ---------------------------------------------------------------------------
// Export schemas
// ---------------------------------------------------------------------------

// ExportInputSchema is imported from @gander-studio/shared

const ExportResultSchema = z.object({
  targetPath: z.string(),
  plannedFiles: z.array(z.string()),
  loadoutSummary: z.string(),
});

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

const loadoutRouter = t.router({
  list: t.procedure.query(async () => {
    try {
      const entries = await readdir(LOADOUTS_DIR);
      const jsonFiles = entries.filter(e => e.endsWith('.json'));
      const loadouts: z.infer<typeof LoadoutSchema>[] = [];
      for (const file of jsonFiles) {
        try {
          const raw = await readFile(path.join(LOADOUTS_DIR, file), 'utf8');
          const parsed = LoadoutSchema.safeParse(JSON.parse(raw));
          if (parsed.success) {
            loadouts.push(parsed.data);
          }
        } catch {
          // skip malformed files
        }
      }
      return loadouts;
    } catch {
      // LOADOUTS_DIR doesn't exist or unreadable
      return [];
    }
  }),

  save: t.procedure
    .input(LoadoutSchema)
    .mutation(async ({ input }) => {
      const sanitized = sanitizeName(input.name);
      if (sanitized.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Loadout name is empty after sanitization',
        });
      }

      const createdAt = input.createdAt || new Date().toISOString();
      const payload: z.infer<typeof LoadoutSchema> = { ...input, createdAt };

      await mkdir(LOADOUTS_DIR, { recursive: true });
      const filePath = path.join(LOADOUTS_DIR, `${sanitized}.json`);
      await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
      return { success: true as const, name: sanitized };
    }),

  delete: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const sanitized = sanitizeName(input.name);
      if (sanitized.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Loadout name is empty after sanitization',
        });
      }

      const filePath = path.join(LOADOUTS_DIR, `${sanitized}.json`);
      try {
        await unlink(filePath);
      } catch {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Loadout '${sanitized}' not found`,
        });
      }
      return { success: true as const };
    }),
});

const exportRouter = t.router({
  spawn: t.procedure
    .input(ExportInputSchema)
    .output(ExportResultSchema)
    .mutation(async ({ input }) => {
      if (input.targetBasePath !== undefined) {
        const resolved = path.resolve(input.targetBasePath);
        if (resolved !== input.targetBasePath || !resolved.startsWith('/')) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'targetBasePath must be an absolute normalised path' });
        }
      }
      const targetPath = path.join(input.targetBasePath ?? EXPORT_BASE_DIR, input.targetDirName);
      const { loadout } = input;

      // Track (sourcePath, destPath) pairs alongside plannedFiles
      const filePairs: Array<[string, string]> = [];
      const plannedFiles: string[] = [];

      // agent .md files — skip orchestrator.md (written as CLAUDE.md separately)
      const agents = await parseAllAgents(GANDER_ROOT);
      for (const agentName of loadout.agents) {
        const agent = agents.find(a => a.name === agentName);
        if (agent) {
          if (path.basename(agent.filePath) === 'orchestrator.md') continue;
          const rel = path.relative(GANDER_ROOT, agent.filePath);
          const destPath = path.join(targetPath, rel);
          filePairs.push([agent.filePath, destPath]);
          plannedFiles.push(destPath);
        }
      }

      // skill SKILL.md files
      const skills = await parseAllSkills(GANDER_ROOT);
      for (const skillName of loadout.skills) {
        const skill = skills.find(s => s.name === skillName);
        if (skill) {
          const rel = path.relative(GANDER_ROOT, skill.filePath);
          const destPath = path.join(targetPath, rel);
          filePairs.push([skill.filePath, destPath]);
          plannedFiles.push(destPath);
        }
      }

      // hook files
      const hooks = await parseAllHooks(GANDER_ROOT);
      for (const hookPath of loadout.hooks) {
        const hook = hooks.find(h => h.filePath === hookPath);
        if (hook) {
          const rel = path.relative(GANDER_ROOT, hook.filePath);
          const destPath = path.join(targetPath, rel);
          filePairs.push([hook.filePath, destPath]);
          plannedFiles.push(destPath);
        }
      }

      // special files: standards.md only (settings.json and CLAUDE.md are handled separately below)
      const specialFiles: Array<[string, string]> = [];
      if (input.includeStandards) {
        specialFiles.push([
          path.join(GANDER_ROOT, '.claude', 'rules', 'standards.md'),
          path.join(targetPath, '.claude', 'rules', 'standards.md'),
        ]);
      }

      // Check special files exist before adding to plan
      for (const [src, dest] of specialFiles) {
        try {
          await stat(src);
          filePairs.push([src, dest]);
          plannedFiles.push(dest);
        } catch {
          // source absent — skip silently
        }
      }

      // Create target directory
      await mkdir(targetPath, { recursive: true });

      // Copy each file; skip ENOENT silently and remove from plannedFiles
      const copiedFiles: string[] = [];
      for (const [sourcePath, destPath] of filePairs) {
        try {
          await mkdir(path.dirname(destPath), { recursive: true });
          await copyFile(sourcePath, destPath);
          copiedFiles.push(destPath);
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to copy file during export',
            });
          }
          // ENOENT: source vanished between plan and copy — skip silently
        }
      }

      // --- p2-001: Filter and rewrite settings.json ---
      // Shape mirrors hook-parser.ts Settings/SettingsHooks interfaces; cast is safe for the
      // same reason hook-parser.ts uses it: we own the source file and validate field-by-field.
      interface SettingsHookEntry { type: string; command: string }
      interface SettingsHooks {
        [event: string]: Array<{ matcher: string; hooks: SettingsHookEntry[] }>;
      }
      interface SettingsShape { hooks?: SettingsHooks; [key: string]: unknown }

      const srcSettingsPath = path.join(GANDER_ROOT, '.claude', 'settings.json');
      try {
        const rawSettings = await readFile(srcSettingsPath, 'utf8');
        const settings = JSON.parse(rawSettings) as SettingsShape;
        const { hooks: srcHooks, ...otherKeys } = settings;
        const loadoutHookPaths = new Set(loadout.hooks);

        const filteredHooks: SettingsHooks = {};
        for (const [event, matchers] of Object.entries(srcHooks ?? {})) {
          const filteredMatchers = matchers
            .map(matcherEntry => ({
              ...matcherEntry,
              hooks: matcherEntry.hooks.filter(h => {
                const srcHookPath = h.command.replace(/^bash\s+/, '');
                return loadoutHookPaths.has(srcHookPath);
              }),
            }))
            .filter(m => m.hooks.length > 0);

          if (filteredMatchers.length > 0) {
            filteredHooks[event] = filteredMatchers.map(matcherEntry => ({
              ...matcherEntry,
              hooks: matcherEntry.hooks.map(h => {
                const srcHookPath = h.command.replace(/^bash\s+/, '');
                const rel = path.relative(GANDER_ROOT, srcHookPath);
                const destHookPath = path.join(targetPath, rel);
                return { ...h, command: `bash ${destHookPath}` };
              }),
            }));
          }
        }

        const destSettingsPath = path.join(targetPath, '.claude', 'settings.json');
        await mkdir(path.dirname(destSettingsPath), { recursive: true });
        const outSettings: SettingsShape = { ...otherKeys, hooks: filteredHooks };
        await writeFile(destSettingsPath, JSON.stringify(outSettings, null, 2), 'utf8');
        copiedFiles.push(destSettingsPath);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to process settings.json during export',
          });
        }
        // settings.json absent — skip silently
      }

      // --- p2-002: Write orchestrator.md content as CLAUDE.md ---
      const orchestratorSrcPath = path.join(GANDER_ROOT, '.claude', 'agents', 'orchestrator.md');
      let orchestratorContent: string;
      try {
        orchestratorContent = await readFile(orchestratorSrcPath, 'utf8');
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'orchestrator.md not found in GANDER_ROOT — cannot generate CLAUDE.md',
        });
      }
      const destClaudeMdPath = path.join(targetPath, 'CLAUDE.md');
      await writeFile(destClaudeMdPath, orchestratorContent, 'utf8');
      copiedFiles.push(destClaudeMdPath);

      const loadoutSummary =
        `Loadout: ${loadout.name}\n` +
        `Agents (${loadout.agents.length}): ${loadout.agents.join(', ')}\n` +
        `Skills (${loadout.skills.length}): ${loadout.skills.join(', ')}\n` +
        `Hooks (${loadout.hooks.length}): ${loadout.hooks.join(', ')}\n` +
        `Created: ${loadout.createdAt}`;

      return { targetPath, plannedFiles: copiedFiles, loadoutSummary };
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
  loadout: loadoutRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
