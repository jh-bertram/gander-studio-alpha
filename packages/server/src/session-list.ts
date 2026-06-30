import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseSessionFile } from './parsers/session-parser.js';
import { synthesizeSessions } from './parsers/session-synthesis.js';
import { sessionDocDirs } from './session-dirs.js';
import { sprintRoot } from './session-slug-match.js';
import type { Session } from '@gander-studio/shared';

/**
 * Collect and deduplicate sessions across multiple source roots.
 *
 * Dedup strategy:
 *  - Composite key `source_root + "::" + id` prevents cross-root collapse of
 *    same-named post-mortems (two roots each containing foo.md → 2 entries).
 *  - Within-root duplicates (same resolved absolute filePath, e.g. symlinks)
 *    are deduped on the absolute filePath string.
 *
 * Doc-backed sessions are collected first, then synthetic sessions derived from
 * docs/events/*.jsonl (for sprints with no after-action doc) are appended.
 * Both join the date-descending sort before the limit is applied.
 *
 * Per-file errors are caught and counted in `skipped` — they never abort the list.
 *
 * Exported so that session-list.test.ts can call it directly without tRPC plumbing
 * and without depending on the module-load-time SESSIONS_SOURCE_DIRS constant.
 */
export async function collectSessions(
  sourceDirs: string[],
  limit: number,
): Promise<{ sessions: Session[]; skipped: number }> {
  const seenCompositeKeys = new Set<string>();
  const seenFilePaths = new Set<string>();
  const sessions: Session[] = [];
  let skipped = 0;

  // --- Pass 1: doc-backed sessions (existing path) ---
  for (const dir of sourceDirs) {
    for (const docDir of sessionDocDirs(dir)) {
      let entries: string[];
      try {
        entries = await readdir(docDir);
      } catch {
        // directory absent or unreadable — skip this candidate dir silently
        continue;
      }

      const mdFiles = entries.filter((e) => e.endsWith('.md'));

      for (const file of mdFiles) {
        const absoluteFilePath = path.join(docDir, file);

        // Within-root dedup: skip if we already saw this resolved path (e.g. symlinks)
        if (seenFilePaths.has(absoluteFilePath)) {
          continue;
        }
        seenFilePaths.add(absoluteFilePath);

        let session: Session;
        try {
          session = await parseSessionFile(absoluteFilePath, dir);
        } catch {
          skipped++;
          continue;
        }

        // Cross-root dedup uses composite key (source_root, id)
        const compositeKey = `${session.source_root}::${session.id}`;
        if (seenCompositeKeys.has(compositeKey)) {
          continue;
        }
        seenCompositeKeys.add(compositeKey);

        sessions.push(session);
      }
    }
  }

  // --- Build dedup data for synthesis ---
  // docIds: full id of every doc-backed session collected above
  const docIds = sessions.map((s) => s.id);
  // docRoots: sprintRoot of each doc id (null entries excluded)
  const docRoots = sessions
    .map((s) => sprintRoot(s.id))
    .filter((r): r is string => r !== null);

  // --- Pass 2: synthetic sessions from event logs ---
  for (const dir of sourceDirs) {
    let synthetics: Session[];
    try {
      synthetics = await synthesizeSessions(dir, docIds, docRoots);
    } catch {
      // synthesis failure is non-fatal — just skip this root
      continue;
    }

    for (const s of synthetics) {
      const compositeKey = `${s.source_root}::${s.id}`;
      if (seenCompositeKeys.has(compositeKey)) {
        continue;
      }
      seenCompositeKeys.add(compositeKey);
      sessions.push(s);
    }
  }

  // Sort by date descending, then apply limit
  sessions.sort((a, b) => {
    if (b.date > a.date) return 1;
    if (b.date < a.date) return -1;
    return 0;
  });

  return { sessions: sessions.slice(0, limit), skipped };
}
