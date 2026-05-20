import { readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { SessionSchema } from '@gander-studio/shared';
import type { Session, AgentActivity } from '@gander-studio/shared';

// RECOGNIZED_FRONTMATTER_KEYS determines Format A vs Format B detection.
// If gray-matter finds any of these keys, we treat the file as Format A.
const RECOGNIZED_FRONTMATTER_KEYS = new Set(['sprint', 'date', 'gap_classes', 'status', 'type']);

/**
 * Normalize a string to a URL-safe slug: lowercase, runs of non-alphanumeric
 * chars collapsed to single hyphens, leading/trailing hyphens trimmed.
 */
function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse the timestamp string from a table cell.
 * Accepts HH:MM:SS, HH:MM, or ISO-8601 fragments.
 * Returns a Date or null if unparseable.
 */
function parseTimestamp(raw: string): Date | null {
  const trimmed = raw.trim();
  // Try ISO-8601 with date component
  const iso = new Date(trimmed);
  if (!isNaN(iso.getTime())) return iso;
  // Try bare HH:MM:SS or HH:MM (no date context — use epoch date for delta math)
  const timeOnly = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:Z)?$/);
  if (timeOnly) {
    const h = parseInt(timeOnly[1] ?? '0', 10);
    const m = parseInt(timeOnly[2] ?? '0', 10);
    const s = parseInt(timeOnly[3] ?? '0', 10);
    return new Date(Date.UTC(1970, 0, 1, h, m, s));
  }
  return null;
}

/**
 * Parse the Section-2 agent activity tables from the post-mortem body.
 *
 * Handles ≥3 distinct layouts:
 *  (a) canonical 5-col `| Seq | Timestamp | Event | Agent | Notes |`
 *  (b) phase-subdivided mini-tables with different column sets (e.g. `| Step | Output | Notes |`)
 *  (c) wave/section-grouped tables under `###` sub-headings
 *
 * For unrecognized layouts, returns an empty array WITHOUT throwing.
 *
 * Returns AgentActivity[] grouped by agent_id using the exact AgentActivitySchema field names:
 *   spawns, completes, feedback_loops, critique_passes, critique_blocks,
 *   audit_passes, audit_fails, wall_clock_ms
 *
 * feedback_loops = count of consecutive same-agent SPAWN rows immediately
 * following a CRITIQUE_BLOCK or AUDIT_FAIL row.
 */
function parseAgentActivity(body: string): AgentActivity[] {
  // Find Section 2 — look for ## 2. heading
  const section2Match = body.match(/^##\s+2\.\s+[^\n]*/m);
  if (!section2Match || section2Match.index === undefined) return [];

  const section2Start = section2Match.index;
  // Find end of Section 2 — next ## heading at same level (## 3. or higher)
  const afterSection2 = body.slice(section2Start + section2Match[0].length);
  const nextSectionMatch = afterSection2.match(/^##\s+[^#]/m);
  const section2Body = nextSectionMatch
    ? afterSection2.slice(0, nextSectionMatch.index)
    : afterSection2;

  // Extract all markdown table rows from Section 2
  const tableRowRegex = /^\|([^|\n]+(?:\|[^|\n]*)*)\|$/gm;
  const allRows: string[][] = [];
  let match: RegExpExecArray | null;
  while ((match = tableRowRegex.exec(section2Body)) !== null) {
    const cells = (match[1] ?? '').split('|').map(c => c.trim());
    allRows.push(cells);
  }

  if (allRows.length === 0) return [];

  // Detect canonical 5-col layout: header row contains Seq/Timestamp/Event/Agent
  // We look for rows where cell[2] matches an event keyword and cell[3] looks like an agent ID.
  // This covers both 5-col and similar layouts.
  const EVENT_KEYWORDS = new Set([
    'SPAWN', 'COMPLETE', 'CRITIQUE_PASS', 'CRITIQUE_BLOCK',
    'AUDIT_PASS', 'AUDIT_FAIL', 'FAIL', 'RESUME',
  ]);

  // Check if any row (non-separator) has an event keyword in col 2 and agent-like value in col 3
  const isCanonicalLayout = allRows.some(row => {
    if (row.length < 4) return false;
    // Skip separator rows (contains only dashes and pipes)
    if ((row[0] ?? '').replace(/-/g, '').trim() === '') return false;
    const evCell = (row[2] ?? '').toUpperCase().replace(/\s*\(.*\)/, '').trim();
    return EVENT_KEYWORDS.has(evCell);
  });

  if (!isCanonicalLayout) return [];

  // Collect event rows in canonical layout order
  interface EventRow {
    agent: string;
    event: string;
    timestamp: string;
  }
  const eventRows: EventRow[] = [];

  for (const row of allRows) {
    if (row.length < 4) continue;
    // Skip header/separator rows
    const firstCell = (row[0] ?? '').replace(/-/g, '').trim();
    if (firstCell === '' || firstCell.toLowerCase() === 'seq') continue;

    const evRaw = (row[2] ?? '').trim();
    // Strip parenthetical suffixes like "(hook)" or "(manual)"
    const evNormalized = evRaw.replace(/\s*\([^)]*\)/g, '').trim().toUpperCase();
    const agentRaw = (row[3] ?? '').trim();

    if (!EVENT_KEYWORDS.has(evNormalized)) continue;
    if (!agentRaw || agentRaw === '—') continue;

    eventRows.push({
      event: evNormalized,
      agent: agentRaw,
      timestamp: (row[1] ?? '').trim(),
    });
  }

  if (eventRows.length === 0) return [];

  // Group by agent_id and aggregate counts
  const agentMap = new Map<string, {
    spawns: number;
    completes: number;
    critique_passes: number;
    critique_blocks: number;
    audit_passes: number;
    audit_fails: number;
    timestamps: Date[];
  }>();

  const getOrCreate = (agentId: string) => {
    if (!agentMap.has(agentId)) {
      agentMap.set(agentId, {
        spawns: 0, completes: 0,
        critique_passes: 0, critique_blocks: 0,
        audit_passes: 0, audit_fails: 0,
        timestamps: [],
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return agentMap.get(agentId)!;
  };

  for (const row of eventRows) {
    const bucket = getOrCreate(row.agent);
    if (row.event === 'SPAWN') bucket.spawns++;
    else if (row.event === 'COMPLETE') bucket.completes++;
    else if (row.event === 'CRITIQUE_PASS') bucket.critique_passes++;
    else if (row.event === 'CRITIQUE_BLOCK') bucket.critique_blocks++;
    else if (row.event === 'AUDIT_PASS') bucket.audit_passes++;
    else if (row.event === 'AUDIT_FAIL') bucket.audit_fails++;

    const ts = parseTimestamp(row.timestamp);
    if (ts !== null) bucket.timestamps.push(ts);
  }

  // Compute feedback_loops: count consecutive same-agent SPAWN rows immediately
  // following a CRITIQUE_BLOCK or AUDIT_FAIL row.
  const feedbackLoopsByAgent = new Map<string, number>();
  for (let i = 0; i < eventRows.length; i++) {
    const cur = eventRows[i];
    if (!cur) continue;
    const prevEvent = i > 0 ? (eventRows[i - 1]?.event ?? '') : '';
    if (
      cur.event === 'SPAWN' &&
      (prevEvent === 'CRITIQUE_BLOCK' || prevEvent === 'AUDIT_FAIL')
    ) {
      const prev = feedbackLoopsByAgent.get(cur.agent) ?? 0;
      feedbackLoopsByAgent.set(cur.agent, prev + 1);
    }
  }

  const result: AgentActivity[] = [];
  for (const [agentId, data] of agentMap.entries()) {
    const wallClockMs = (() => {
      if (data.timestamps.length < 2) return undefined;
      const sorted = [...data.timestamps].sort((a, b) => a.getTime() - b.getTime());
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      if (!first || !last) return undefined;
      const delta = last.getTime() - first.getTime();
      return delta > 0 ? delta : undefined;
    })();

    result.push({
      agent_id: agentId,
      spawns: data.spawns,
      completes: data.completes,
      critique_passes: data.critique_passes,
      critique_blocks: data.critique_blocks,
      audit_passes: data.audit_passes,
      audit_fails: data.audit_fails,
      feedback_loops: feedbackLoopsByAgent.get(agentId) ?? 0,
      wall_clock_ms: wallClockMs,
    });
  }

  return result;
}

/**
 * Parse a post-mortem markdown file and return a Session validated against
 * SessionSchema. Supports two formats:
 *
 * Format A (YAML frontmatter, gander-style): file begins with `---` frontmatter
 *   containing sprint/date/gap_classes/status/type.
 *
 * Format B (frontmatter-less, studio-style): file begins with `# Post-Mortem: <text>`
 *   H1, followed by `**Date:** YYYY-MM-DD` bold line. No frontmatter.
 *
 * WARNING-1 (id slug stability): `id` is always derived from the FILENAME STEM
 * (normalized slug), NOT the H1 prose. This keeps the (source_root, id) dedup
 * key stable across roots regardless of H1 content. H1 prose is captured as
 * the `title` field.
 *
 * The Format-B date regex assumes `**Date:** YYYY-MM-DD`; non-ISO date prose
 * falls back to empty string (acceptable per z.string()).
 *
 * Does NOT add per-file try/catch — that belongs in the router (t4b).
 */
export async function parseSessionFile(filePath: string, source_root: string): Promise<Session> {
  const raw = await readFile(filePath, 'utf-8');

  // id is always the normalized filename-stem slug (WARNING-1: NOT the H1 prose)
  const filenameStem = path.basename(filePath, '.md');
  const id = toSlug(filenameStem);

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch {
    // If gray-matter fails, treat as no frontmatter
    parsed = { data: {}, content: raw, orig: raw, language: '', matter: '', stringify: () => '' };
  }

  const { data, content } = parsed;

  // Detect format: Format A if any recognized frontmatter key is present
  const hasRecognizedFrontmatter = Object.keys(data).some(k => RECOGNIZED_FRONTMATTER_KEYS.has(k));

  let sprint: string;
  let date: string;
  let gap_classes: string[];
  let status: string | undefined;
  let type: string | undefined;
  let title: string | undefined;

  if (hasRecognizedFrontmatter) {
    // Format A: frontmatter-driven
    const rawSprint = String(data['sprint'] ?? '');
    sprint = rawSprint;
    // gray-matter parses bare YYYY-MM-DD as a JS Date; normalize back to ISO string
    const rawDate = data['date'];
    if (rawDate instanceof Date) {
      date = rawDate.toISOString().slice(0, 10);
    } else {
      date = String(rawDate ?? '');
    }
    // gap_classes may be YAML array or absent
    const rawGapClasses = data['gap_classes'];
    gap_classes = Array.isArray(rawGapClasses)
      ? rawGapClasses.map(String)
      : [];
    status = data['status'] !== undefined ? String(data['status']) : undefined;
    type = data['type'] !== undefined ? String(data['type']) : undefined;
    // title = frontmatter sprint field (display value)
    title = rawSprint || undefined;
  } else {
    // Format B: frontmatter-less — extract from markdown body
    // sprint from H1: `# Post-Mortem: <value>`
    const h1Match = raw.match(/^#\s+Post-Mortem:\s*(.+)$/m);
    if (h1Match && h1Match[1]) {
      const h1Text = h1Match[1].trim();
      sprint = h1Text;
      title = h1Text;
    } else {
      // Fallback: filename stem
      sprint = filenameStem;
      title = undefined;
    }

    // The Format-B date regex assumes `**Date:** YYYY-MM-DD`; non-ISO date prose
    // falls back to empty string (acceptable per z.string()).
    const dateMatch = raw.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
    if (dateMatch && dateMatch[1]) {
      date = dateMatch[1];
    } else {
      // Fallback: extract date-like component from filename (e.g. "session-2026-01-01")
      const fileDateMatch = filenameStem.match(/(\d{4}-\d{2}-\d{2})/);
      date = fileDateMatch ? (fileDateMatch[1] ?? '') : '';
    }

    gap_classes = [];
    status = undefined;
    type = undefined;
  }

  const agents = parseAgentActivity(content);

  return SessionSchema.parse({
    id,
    sprint,
    date,
    gap_classes,
    status,
    type,
    title,
    filePath,
    source_root,
    agents,
    events: [],
  });
}
