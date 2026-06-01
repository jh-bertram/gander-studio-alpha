import { ProgressionEntrySchema, type ProgressionEntry } from '@gander-studio/shared';

/**
 * Parse a progression ledger markdown string into validated ProgressionEntry objects.
 *
 * Algorithm (per ~/.claude/refs/progression-ledger-schema.md §3):
 * 1. Read line by line.
 * 2. Track ```jsonl fences.
 * 3. The first non-fence line inside a fence is parsed as JSON.
 * 4. Validate with ProgressionEntrySchema.safeParse — skip malformed entries (console.warn).
 * 5. sprint_id is ALWAYS read from inside the JSONL block — NEVER from the ### Sprint: header.
 */
export function parseLedgerContent(content: string): ProgressionEntry[] {
  const entries: ProgressionEntry[] = [];
  const lines = content.split('\n');
  let inJsonlFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inJsonlFence && line.trimEnd() === '```jsonl') {
      inJsonlFence = true;
      continue;
    }

    if (inJsonlFence) {
      if (line.trimEnd() === '```') {
        // Closing fence with no data line in between — empty block, skip.
        inJsonlFence = false;
        continue;
      }

      // This is the data line inside the fence.
      inJsonlFence = false;

      let parsed: unknown;
      try {
        parsed = JSON.parse(line);
      } catch {
        console.warn(`[progression-parser] Skipping malformed JSONL: ${line.slice(0, 80)}`);
        continue;
      }

      const result = ProgressionEntrySchema.safeParse(parsed);
      if (!result.success) {
        console.warn(`[progression-parser] Skipping invalid entry: ${result.error.message}`);
        continue;
      }

      entries.push(result.data);
    }
  }

  return entries;
}
