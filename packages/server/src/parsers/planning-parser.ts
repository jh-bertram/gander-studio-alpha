/**
 * planning-parser.ts
 *
 * Parses two Markdown source files from the gander-studio-alpha repo:
 *   - docs/deferred-work.md  → DEFERRED-NNN items (deferred | done)
 *   - docs/task-registry.md  → sprint rows (sprint-goal | sprint-task)
 *
 * Returns a PlanningListOutput grouped by sprint.
 * Uses Promise.allSettled-and-skip: if either file fails to read, the other
 * still produces results and skipped is incremented.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { PlanningListOutput, PlanningSprint, PlanningItem } from '@gander-studio/shared';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Deduplicate sprint entries, merging items lists */
function mergeSprintMaps(
  maps: Map<string, PlanningSprint>[],
): PlanningSprint[] {
  const merged = new Map<string, PlanningSprint>();
  for (const m of maps) {
    for (const [key, sprint] of m) {
      const existing = merged.get(key);
      if (existing) {
        existing.items.push(...sprint.items);
      } else {
        merged.set(key, { ...sprint, items: [...sprint.items] });
      }
    }
  }
  return Array.from(merged.values());
}

// ─── deferred-work.md parser ─────────────────────────────────────────────────

/**
 * Parses docs/deferred-work.md.
 *
 * Format: grouped under "## Sprint: <sprint-id>" headings;
 * each item is "### DEFERRED-NNN — <title>" optionally with "✅ DONE" marker.
 * "**Schedule as:**" line captures scheduleAs.
 */
function parseDeferredWork(content: string): Map<string, PlanningSprint> {
  const sprintMap = new Map<string, PlanningSprint>();
  let currentSprint = 'unknown';

  // Split into lines for linear parsing
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    // Sprint heading: ## Sprint: <id>
    const sprintMatch = /^##\s+Sprint:\s+(.+)$/.exec(line);
    if (sprintMatch) {
      currentSprint = sprintMatch[1]!.trim();
      if (!sprintMap.has(currentSprint)) {
        sprintMap.set(currentSprint, { sprint: currentSprint, items: [] });
      }
      i++;
      continue;
    }

    // Deferred item heading: ### DEFERRED-NNN — title (optionally "✅ DONE")
    const itemMatch = /^###\s+(DEFERRED-[\w-]+)\s+[—–-]+\s+(.+)$/.exec(line);
    if (itemMatch) {
      const id = itemMatch[1]!.trim();
      const rawTitle = itemMatch[2]!.trim();
      const isDone = rawTitle.includes('✅ DONE') || rawTitle.includes('✅ DONE');
      const title = rawTitle.replace(/—?\s*✅\s*DONE[^)]*\)?/g, '').trim();

      // Collect body lines until next ## or ### heading
      const bodyLines: string[] = [];
      let scheduleAs: string | undefined;
      let resolvedAt: string | undefined;
      i++;
      while (i < lines.length) {
        const bodyLine = lines[i]!;
        if (/^#{2,3}\s/.test(bodyLine)) break;

        // Extract "**Schedule as:**" value
        const scheduleMatch = /\*\*Schedule as:\*\*\s*(.+)$/.exec(bodyLine);
        if (scheduleMatch) {
          scheduleAs = scheduleMatch[1]!.trim();
        }

        // Extract resolution date from "✅ DONE (YYYY-MM-DD)"
        const resolvedMatch = /✅\s*DONE\s*\((\d{4}-\d{2}-\d{2})\)/.exec(bodyLine);
        if (!resolvedAt && resolvedMatch) {
          resolvedAt = resolvedMatch[1]!;
        }
        // Also check title line for date in parens
        if (!resolvedAt) {
          const titleDateMatch = /✅\s*DONE\s*\((\d{4}-\d{2}-\d{2})\)/.exec(rawTitle);
          if (titleDateMatch) resolvedAt = titleDateMatch[1]!;
        }

        bodyLines.push(bodyLine);
        i++;
      }

      // Ensure sprint entry exists (handles items before any sprint heading)
      if (!sprintMap.has(currentSprint)) {
        sprintMap.set(currentSprint, { sprint: currentSprint, items: [] });
      }
      const item: PlanningItem = {
        id,
        title,
        kind: isDone ? 'done' : 'deferred',
        body: bodyLines.join('\n').trim(),
        sprint: currentSprint,
        ...(scheduleAs !== undefined ? { scheduleAs } : {}),
        ...(resolvedAt !== undefined ? { resolvedAt } : {}),
      };
      sprintMap.get(currentSprint)!.items.push(item);
      continue;
    }

    i++;
  }

  return sprintMap;
}

// ─── task-registry.md parser ──────────────────────────────────────────────────

/**
 * Parses docs/task-registry.md.
 *
 * Format: "## Sprint: <id>" headings with "**Goal:**", "**Status:**" fields,
 * and "### Rollback Point" blocks with "commit: <sha>".
 */
function parseTaskRegistry(content: string): Map<string, PlanningSprint> {
  const sprintMap = new Map<string, PlanningSprint>();
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    // Sprint heading: ## Sprint: <id>
    const sprintMatch = /^##\s+Sprint:\s+(.+)$/.exec(line);
    if (sprintMatch) {
      const sprintId = sprintMatch[1]!.trim();
      let goal = '';
      let status = '';
      let rollbackCommit: string | undefined;

      // Scan ahead for **Goal:**, **Status:**, Rollback block
      i++;
      const goalBodyLines: string[] = [];
      while (i < lines.length) {
        const bl = lines[i]!;
        // Next sprint heading stops this sprint's block
        if (/^##\s+Sprint:/.test(bl)) break;

        const goalMatch = /^\*\*Goal:\*\*\s*(.*)$/.exec(bl);
        if (goalMatch) {
          goal = goalMatch[1]!.trim();
          i++;
          // Goal may span multiple lines until next ** field
          while (i < lines.length) {
            const gl = lines[i]!;
            if (/^\*\*/.test(gl) || /^#{2,3}\s/.test(gl) || gl.trim() === '') {
              break;
            }
            goal += ' ' + gl.trim();
            i++;
          }
          continue;
        }

        const statusMatch = /^\*\*Status:\*\*\s*(.+)$/.exec(bl);
        if (statusMatch) {
          status = statusMatch[1]!.trim();
          i++;
          continue;
        }

        // Rollback block
        if (/^###\s+Rollback Point/.test(bl)) {
          i++;
          while (i < lines.length) {
            const rl = lines[i]!;
            if (/^#{2,3}\s/.test(rl)) break;
            const commitMatch = /^commit:\s*([0-9a-f]{7,40})/.exec(rl);
            if (commitMatch) {
              rollbackCommit = commitMatch[1]!.trim();
            }
            goalBodyLines.push(rl);
            i++;
          }
          continue;
        }

        goalBodyLines.push(bl);
        i++;
      }

      const entry: PlanningSprint = {
        sprint: sprintId,
        goal: goal || undefined,
        status: status || undefined,
        items: [
          {
            id: sprintId,
            title: goal || sprintId,
            kind: 'sprint-goal',
            body: goalBodyLines.join('\n').trim(),
            sprint: sprintId,
            ...(rollbackCommit !== undefined ? { rollbackCommit } : {}),
          },
        ],
      };
      sprintMap.set(sprintId, entry);
      continue;
    }

    i++;
  }

  return sprintMap;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Parse planning data from the gander-studio-alpha repository root.
 * @param studioRoot - Absolute path to the gander-studio-alpha repo root.
 */
export async function parsePlanningBacklog(
  studioRoot: string,
): Promise<PlanningListOutput> {
  const deferredPath = join(studioRoot, 'docs', 'deferred-work.md');
  const registryPath = join(studioRoot, 'docs', 'task-registry.md');

  const results = await Promise.allSettled([
    readFile(deferredPath, 'utf-8'),
    readFile(registryPath, 'utf-8'),
  ]);

  let skipped = 0;
  const sprintMaps: Map<string, PlanningSprint>[] = [];

  const [deferredResult, registryResult] = results;

  if (deferredResult!.status === 'fulfilled') {
    sprintMaps.push(parseDeferredWork(deferredResult!.value));
  } else {
    skipped++;
  }

  if (registryResult!.status === 'fulfilled') {
    sprintMaps.push(parseTaskRegistry(registryResult!.value));
  } else {
    skipped++;
  }

  const sprints = mergeSprintMaps(sprintMaps);

  return { sprints, skipped };
}
