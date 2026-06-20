/**
 * program-dag-parser.ts
 *
 * Parses docs/programs/{program-id}/program.md files from the gander-studio-alpha repo.
 *
 * Each program.md MUST contain:
 *   - YAML frontmatter with program_id and a title H1 below it
 *   - "## Sprint Roster" section with a markdown table:
 *       | sprint_id | goal | depends_on |
 *   - "Topological tiers:" bullet section:
 *       - Tier N: `sprint_id_1`, `sprint_id_2`
 *   - "## Integration Seams" section with a markdown table:
 *       | seam_id | from_sprint | to_sprint | artifact | format | contract |
 *
 * Uses Promise.allSettled-and-skip: malformed/missing files are skipped, not 500d.
 * Tested against BOTH real program.md files:
 *   - prog-studio-sessions-2026-05
 *   - prog-studio-vision-2026-06
 */
import { readFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  ProgramDag,
  ProgramDagNode,
  ProgramDagEdge,
  ProgramDagSeam,
} from '@gander-studio/shared';

// ─── Markdown table parser ────────────────────────────────────────────────────

/**
 * Parse a GitHub-Flavored Markdown pipe table.
 * Returns an array of row-objects keyed by trimmed header names.
 * Returns [] if the text doesn't contain a valid table.
 */
function parseMarkdownTable(text: string): Record<string, string>[] {
  const lines = text.split('\n');
  const tableLines: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableLines.push(trimmed);
    } else if (inTable) {
      // End of table block
      break;
    }
  }

  if (tableLines.length < 2) return [];

  // Row 0 = headers, Row 1 = separator, Row 2+ = data
  const parseRow = (row: string): string[] =>
    row
      .slice(1, -1) // strip leading/trailing |
      .split('|')
      .map((cell) => cell.trim());

  const headers = parseRow(tableLines[0]!);
  // Skip separator row (index 1)
  const rows: Record<string, string>[] = [];
  for (let i = 2; i < tableLines.length; i++) {
    const cells = parseRow(tableLines[i]!);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

// ─── Section extractor ────────────────────────────────────────────────────────

/**
 * Extract the text content of a markdown section starting with a given
 * heading (any level ##). Returns content up to the next same-or-higher heading.
 */
function extractSection(content: string, heading: string): string {
  const headingPattern = new RegExp(
    `^#{1,3}\\s+${escapeRegex(heading)}\\s*$`,
    'im',
  );
  const match = headingPattern.exec(content);
  if (!match) return '';

  const start = match.index + match[0].length;
  // Find next heading of same or higher level
  const nextHeading = /^#{1,3}\s/m.exec(content.slice(start));
  const end = nextHeading ? start + nextHeading.index : content.length;
  return content.slice(start, end).trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Tier parser ─────────────────────────────────────────────────────────────

/**
 * Parse "Topological tiers:" bullet section.
 * Lines like "- Tier 0: `sprint_a`, `sprint_b`" or "- Tier 1: `sprint_c`"
 * Returns a Map<sprint_id, tier_number>.
 */
function parseTiers(content: string): Map<string, number> {
  const tierMap = new Map<string, number>();
  const tiersSection = extractSection(content, 'Dependency DAG');
  const source = tiersSection || content;

  const tierLineRe = /^[-*]\s+Tier\s+(\d+):\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = tierLineRe.exec(source)) !== null) {
    const tierNum = parseInt(m[1]!, 10);
    // Extract sprint IDs — may be wrapped in backticks or separated by commas
    const sprintPart = m[2]!;
    const sprintIds = sprintPart
      .split(/[,]+/)
      .map((s) => s.replace(/`/g, '').trim())
      .filter((s) => s.length > 0);
    for (const sid of sprintIds) {
      tierMap.set(sid, tierNum);
    }
  }
  return tierMap;
}

// ─── Single program.md parser ─────────────────────────────────────────────────

function parseProgramId(content: string, filePath: string): string {
  const m = /^program_id:\s*(.+)$/m.exec(content);
  if (m) return m[1]!.trim();
  // Fallback: derive from directory name
  const parts = filePath.split('/');
  const programDir = parts[parts.length - 2] ?? 'unknown';
  return programDir;
}

function parseProgramTitle(content: string): string {
  // Look for first H1 after the frontmatter fence
  const afterFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '');
  const h1 = /^#\s+(.+)$/m.exec(afterFrontmatter);
  return h1 ? h1[1]!.trim() : 'Unknown Program';
}

/**
 * Parse a single program.md file into a ProgramDag.
 * Throws on malformed content (caller uses allSettled to skip).
 */
function parseProgramMd(content: string, filePath: string): ProgramDag {
  const programId = parseProgramId(content, filePath);
  const title = parseProgramTitle(content);

  // ── Sprint Roster table ──────────────────────────────────────────────────
  const rosterSection = extractSection(content, 'Sprint Roster');
  const rosterRows = parseMarkdownTable(rosterSection);

  if (rosterRows.length === 0) {
    throw new Error(`No Sprint Roster table found in ${filePath}`);
  }

  // ── Tier map ─────────────────────────────────────────────────────────────
  const tierMap = parseTiers(content);

  // ── Build nodes ──────────────────────────────────────────────────────────
  const nodes: ProgramDagNode[] = rosterRows.map((row) => {
    // Header names may have backticks or spaces; try multiple key forms
    const sprintId =
      (row['sprint_id'] ?? row['sprint_id '] ?? '').replace(/`/g, '').trim();
    const goal = (row['goal'] ?? '').trim();
    const dependsOnRaw = (row['depends_on'] ?? '').trim();

    const dependsOn =
      dependsOnRaw === '(none)' || dependsOnRaw === ''
        ? []
        : dependsOnRaw
            .split(/[,\s]+/)
            .map((s) => s.replace(/`/g, '').trim())
            .filter((s) => s.length > 0);

    const tier = tierMap.get(sprintId) ?? 0;

    return {
      id: sprintId,
      type: 'sprint' as const,
      position: { x: 0, y: 0 },
      data: {
        label: sprintId,
        goal,
        tier,
        dependsOn,
      },
    };
  });

  // ── Build edges (one per depends_on relationship) ─────────────────────────
  const edges: ProgramDagEdge[] = [];
  for (const node of nodes) {
    for (const dep of node.data.dependsOn) {
      edges.push({
        id: `${dep}-->${node.id}`,
        source: dep,
        target: node.id,
        type: 'dependency' as const,
      });
    }
  }

  // ── Integration Seams table ───────────────────────────────────────────────
  const seamsSection = extractSection(content, 'Integration Seams');
  const seamsRows = parseMarkdownTable(seamsSection);

  const seams: ProgramDagSeam[] = seamsRows
    .map((row): ProgramDagSeam | null => {
      const seam_id = (row['seam_id'] ?? '').replace(/`/g, '').trim();
      if (!seam_id) return null;
      return {
        seam_id,
        from_sprint: (row['from_sprint'] ?? '').trim(),
        to_sprint: (row['to_sprint'] ?? '').trim(),
        artifact: (row['artifact'] ?? '').trim(),
        format: (row['format'] ?? '').trim() || undefined,
        contract: (row['contract'] ?? '').trim() || undefined,
      };
    })
    .filter((s): s is ProgramDagSeam => s !== null);

  return {
    programId,
    title,
    nodes,
    edges,
    seams,
    skipped: 0,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Glob docs/programs/{program-id}/program.md inside the studio root and parse each file.
 * Uses Promise.allSettled-and-skip: malformed files are skipped, not 500d.
 *
 * @param studioRoot - Absolute path to the gander-studio-alpha repo root.
 * @param programId  - Optional: filter to a single program_id.
 */
export async function parseProgramDags(
  studioRoot: string,
  programId?: string,
): Promise<ProgramDag[]> {
  const programsDir = join(studioRoot, 'docs', 'programs');

  // Collect all program.md file paths
  let filePaths: string[];
  try {
    const iterator = glob('*/program.md', { cwd: programsDir });
    filePaths = [];
    for await (const entry of iterator) {
      filePaths.push(join(programsDir, entry));
    }
  } catch {
    // docs/programs does not exist or unreadable — return empty
    return [];
  }

  if (filePaths.length === 0) return [];

  const results = await Promise.allSettled(
    filePaths.map(async (fp) => {
      const content = await readFile(fp, 'utf-8');
      return parseProgramMd(content, fp);
    }),
  );

  const dags: ProgramDag[] = [];
  let totalSkipped = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      dags.push(result.value);
    } else {
      totalSkipped++;
    }
  }

  // Filter by programId if requested
  const filtered = programId
    ? dags.filter((d) => d.programId === programId)
    : dags;

  // Attach aggregate skipped count to the first DAG (or return synthetic stub)
  if (totalSkipped > 0 && filtered.length > 0) {
    filtered[0] = { ...filtered[0]!, skipped: totalSkipped };
  }

  return filtered;
}
