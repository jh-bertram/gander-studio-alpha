import path from 'node:path';
import { SessionSchema } from '@gander-studio/shared';
import type { Session } from '@gander-studio/shared';
import { readEventLogEntries } from './event-log-parser.js';
import { computeSessionStats } from './session-stats.js';
import { sprintRoot, isDocumented } from '../session-slug-match.js';

/**
 * Synthesize Session objects from docs/events/*.jsonl for a source root,
 * excluding any sprint already covered by a doc-backed session.
 *
 * Capability A — enumerate + filter:
 *   Read all agent-events-*.jsonl under <sourceRoot>/docs/events/ once.
 *   Collect distinct task_ids. Drop any where isDocumented() is true OR
 *   sprintRoot() is null (denylisted / fails shape gate).
 *
 * Capability B — group + build:
 *   Group surviving task_ids by sprintRoot(). For each group build ONE synthetic
 *   Session: id/sprint = root, date = earliest event ts date, filePath = '',
 *   has_after_action = false, agents populated via computeSessionStats.
 *
 * @param sourceRoot  absolute path to the project root (e.g. /home/user/projects/gander)
 * @param docIds      ids of all doc-backed sessions already collected
 * @param docRoots    sprintRoot() of each doc id (null entries excluded by caller)
 */
export async function synthesizeSessions(
  sourceRoot: string,
  docIds: string[],
  docRoots: string[],
): Promise<Session[]> {
  // Capability A: read all entries once
  const eventsDir = path.join(sourceRoot, 'docs', 'events');
  const allEntries = await readEventLogEntries(eventsDir);

  // Collect distinct task_ids
  const taskIds = new Set(allEntries.map((e) => e.task_id));

  // Filter: drop documented or non-sprint (null sprintRoot)
  const survivingIds: string[] = [];
  for (const tid of taskIds) {
    if (isDocumented(tid, docIds, docRoots)) continue;
    if (sprintRoot(tid) === null) continue;
    survivingIds.push(tid);
  }

  // Capability B: group by sprintRoot
  const groups = new Map<string, string[]>();
  for (const tid of survivingIds) {
    const root = sprintRoot(tid)!; // non-null guaranteed by filter above
    const existing = groups.get(root);
    if (existing) {
      existing.push(tid);
    } else {
      groups.set(root, [tid]);
    }
  }

  // Build one synthetic Session per group
  const results: Session[] = [];

  for (const [root, _tids] of groups.entries()) {
    // All entries whose sprintRoot matches this group root
    const groupEvents = allEntries.filter((e) => sprintRoot(e.task_id) === root);

    // Date = date portion of the earliest event ts
    const sortedByTs = [...groupEvents].sort((a, b) => a.ts.localeCompare(b.ts));
    const date = sortedByTs.length > 0 ? (sortedByTs[0]!.ts.slice(0, 10)) : '1970-01-01';

    // Build a minimal stub for computeSessionStats (only id is used in its output)
    const stub = SessionSchema.parse({
      id: root,
      sprint: root,
      date,
      filePath: '',
      source_root: sourceRoot,
      has_after_action: false,
      gap_classes: [],
      agents: [],
      events: groupEvents,
    });

    const stats = computeSessionStats(stub, groupEvents);

    // Build the final synthetic session with populated agents
    const synthetic = SessionSchema.parse({
      id: root,
      sprint: root,
      date,
      filePath: '',
      source_root: sourceRoot,
      has_after_action: false,
      gap_classes: [],
      agents: stats.agents,
      events: groupEvents,
    });

    results.push(synthetic);
  }

  return results;
}
