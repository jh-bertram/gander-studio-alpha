import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { EventLogEntrySchema } from '@gander-studio/shared';
import type { EventLogEntry } from '@gander-studio/shared';
import { matchesSlug } from '../session-slug-match.js';

/**
 * List agent-events-*.jsonl files (absolute paths) in eventsDir. Returns []
 * when the directory is missing/unreadable. Private helper shared by
 * `readEventLogEntries` and `readEventLogEntriesWithDiagnostics` — the ONLY
 * piece of logic the two readers share (their per-line handling differs:
 * warn-and-drop vs. count-and-sample, which is why the loop bodies are not
 * also merged — see prog-studio-v2-2026-07-s1-data-layer-t2 out_of_scope:
 * `readEventLogEntries` must remain byte-for-byte behaviorally unchanged,
 * including its console.warn side effects, for other callers).
 */
async function listEventLogFiles(eventsDir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(eventsDir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => /^agent-events-.*\.jsonl$/.test(name))
    .map((name) => path.join(eventsDir, name));
}

/**
 * Low-level JSONL reader: reads all agent-events-*.jsonl files from eventsDir
 * and returns every line that validates against EventLogEntrySchema. Result is
 * UNSORTED (no slug filter). Malformed or schema-invalid lines are skipped with
 * console.warn — never thrown.
 *
 * Exported for reuse by session-synthesis.ts (which needs all entries to build
 * synthetic sessions without re-scanning disk per slug).
 */
export async function readEventLogEntries(eventsDir: string): Promise<EventLogEntry[]> {
  const jsonlFiles = await listEventLogFiles(eventsDir);

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
        console.warn(
          `event-log-parser: skipping malformed JSON line in ${filePath}: ${trimmed.slice(0, 80)}`,
        );
        continue;
      }

      const result = EventLogEntrySchema.safeParse(parsed);
      if (!result.success) {
        console.warn(
          `event-log-parser: skipping invalid entry in ${filePath}: ${result.error.message}`,
        );
        continue;
      }

      validated.push(result.data);
    }
  }

  return validated;
}

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
  const all = await readEventLogEntries(eventsDir);

  const filtered = all.filter((entry) => {
    if (!matchesSlug(entry.task_id, sprintSlug)) return false;
    if (dateRange) {
      return entry.ts >= dateRange.from && entry.ts <= dateRange.to;
    }
    return true;
  });

  return filtered.sort((a, b) => a.seq - b.seq);
}

/** Truncation length for invalidLineSamples entries (observability, not a full dump). */
const INVALID_LINE_SAMPLE_MAX_CHARS = 200;
/** Cap on the number of raw-line samples retained per directory (avoids unbounded growth). */
const INVALID_LINE_SAMPLE_MAX_COUNT = 10;

/**
 * Diagnostic-carrying sibling of `readEventLogEntries` (prog-studio-v2-2026-07-s1-data-layer-t2,
 * §2.3 / silent-empty-forbidden). Reads all agent-events-*.jsonl files in eventsDir exactly like
 * `readEventLogEntries`, but instead of `console.warn`-and-drop on a malformed-JSON or
 * schema-invalid line, it COUNTS the line and retains a truncated sample — the invalid-line class
 * is surfaced, never silently absorbed into a count of zero.
 *
 * `readEventLogEntries` and `parseEventLogFiles` are UNCHANGED (see `listEventLogFiles` above) —
 * this is a fully additive new export; no existing caller is affected.
 */
export async function readEventLogEntriesWithDiagnostics(eventsDir: string): Promise<{
  entries: EventLogEntry[];
  totalRawLines: number;
  validEntries: number;
  invalidLineCount: number;
  invalidLineSamples: string[];
}> {
  const jsonlFiles = await listEventLogFiles(eventsDir);

  const entries: EventLogEntry[] = [];
  let totalRawLines = 0;
  let invalidLineCount = 0;
  const invalidLineSamples: string[] = [];

  const recordInvalid = (trimmed: string): void => {
    invalidLineCount++;
    if (invalidLineSamples.length < INVALID_LINE_SAMPLE_MAX_COUNT) {
      invalidLineSamples.push(trimmed.slice(0, INVALID_LINE_SAMPLE_MAX_CHARS));
    }
  };

  for (const filePath of jsonlFiles) {
    let raw: string;
    try {
      raw = await readFile(filePath, 'utf-8');
    } catch {
      // Unreadable file: not counted as raw lines (mirrors readEventLogEntries's silent skip —
      // this is an fs-availability issue, not a line-shape issue this diagnostic targets).
      continue;
    }

    const lines = raw.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      totalRawLines++;

      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        recordInvalid(trimmed);
        continue;
      }

      const result = EventLogEntrySchema.safeParse(parsed);
      if (!result.success) {
        recordInvalid(trimmed);
        continue;
      }

      entries.push(result.data);
    }
  }

  return {
    entries,
    totalRawLines,
    validEntries: entries.length,
    invalidLineCount,
    invalidLineSamples,
  };
}
