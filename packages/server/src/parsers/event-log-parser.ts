import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { EventLogEntrySchema } from '@gander-studio/shared';
import type { EventLogEntry } from '@gander-studio/shared';

/**
 * Read all agent-events-*.jsonl files from eventsDir, validate each line
 * against EventLogEntrySchema, filter by sprintSlug and optional dateRange,
 * and return sorted by seq ascending.
 *
 * Malformed or schema-invalid lines are skipped with console.warn — never thrown.
 * Because ev is z.string(), every well-formed JSONL line with any ev value parses.
 */
export async function parseEventLogFiles(
  eventsDir: string,
  sprintSlug: string,
  dateRange?: { from: string; to: string },
): Promise<EventLogEntry[]> {
  let entries: string[];
  try {
    entries = await readdir(eventsDir);
  } catch {
    return [];
  }

  const jsonlFiles = entries
    .filter(name => /^agent-events-.*\.jsonl$/.test(name))
    .map(name => path.join(eventsDir, name));

  const validated: EventLogEntry[] = [];

  for (const filePath of jsonlFiles) {
    let raw: string;
    try {
      raw = await readFile(filePath, 'utf-8');
    } catch {
      console.warn(`event-log-parser: could not read file ${filePath}`);
      continue;
    }

    const lines = raw.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        console.warn(`event-log-parser: skipping malformed JSON line in ${filePath}: ${trimmed.slice(0, 80)}`);
        continue;
      }

      const result = EventLogEntrySchema.safeParse(parsed);
      if (!result.success) {
        console.warn(`event-log-parser: skipping invalid entry in ${filePath}: ${result.error.message}`);
        continue;
      }

      validated.push(result.data);
    }
  }

  const filtered = validated.filter(entry => {
    const slugMatch =
      entry.task_id.startsWith(sprintSlug) || entry.task_id.includes(sprintSlug);
    if (!slugMatch) return false;

    if (dateRange) {
      return entry.ts >= dateRange.from && entry.ts <= dateRange.to;
    }

    return true;
  });

  return filtered.sort((a, b) => a.seq - b.seq);
}
