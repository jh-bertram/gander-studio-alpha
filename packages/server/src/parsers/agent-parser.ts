import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { AgentSchema } from '@gander-studio/shared';
import type { Agent } from '@gander-studio/shared';

/**
 * Resilient frontmatter extractor.
 * gray-matter / js-yaml fails on unquoted values containing ": " (colon-space),
 * which appears in agent description fields (e.g. "veto power: a FAIL result").
 * This fallback reads each frontmatter line as key: rest-of-line, treating the
 * entire remainder as a string value — no YAML mapping interpretation.
 */
function parseFrontmatterFallback(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const [, frontmatter, body] = match;
  const data: Record<string, string> = {};
  for (const line of (frontmatter ?? '').split('\n')) {
    const colonIdx = line.indexOf(': ');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 2).trim();
    if (key) data[key] = value;
  }
  return { data, content: body ?? '' };
}

export async function parseAgentFile(filePath: string): Promise<Agent> {
  const raw = await readFile(filePath, 'utf-8');

  let data: Record<string, unknown>;
  let content: string;
  try {
    ({ data, content } = matter(raw));
  } catch {
    // Fallback for agent files with colons in unquoted YAML values
    const fallback = parseFrontmatterFallback(raw);
    data = fallback.data;
    content = fallback.content;
  }

  // Normalize tools: handles both "Read, Write" (comma-string) and ["Read", "Write"] (YAML list)
  let tools: string[] = [];
  if (typeof data.tools === 'string') {
    tools = data.tools.split(',').map((t: string) => t.trim()).filter(Boolean);
  } else if (Array.isArray(data.tools)) {
    tools = data.tools.map(String);
  }

  // Normalize communicates_with: handles both "be, fe" (comma-string) and ["be", "fe"] (YAML list)
  let communicates_with: string[] | undefined;
  if (typeof data.communicates_with === 'string') {
    const parsed = data.communicates_with.split(',').map((s: string) => s.trim()).filter(Boolean);
    communicates_with = parsed.length > 0 ? parsed : undefined;
  } else if (Array.isArray(data.communicates_with)) {
    communicates_with = data.communicates_with.map(String).filter(Boolean);
    if (communicates_with.length === 0) communicates_with = undefined;
  }

  return AgentSchema.parse({
    name: data.name ?? '',
    description: data.description ?? '',
    tools,
    model: data.model ?? 'sonnet',
    version: data.version,
    tier: data.tier ?? 'optional',
    communicates_with,
    body: content.trim(),
    filePath,
  });
}

export async function parseAllAgents(ganderRoot: string): Promise<Agent[]> {
  const agentsDir = join(ganderRoot, '.claude', 'agents');
  const files = (await readdir(agentsDir)).filter(f => f.endsWith('.md'));
  const results = await Promise.allSettled(files.map(f => parseAgentFile(join(agentsDir, f))));
  const agents: Agent[] = [];
  results.forEach((result, i) => {
    const filePath = join(agentsDir, files[i] ?? '');
    if (result.status === 'rejected') {
      console.error('[agent-parser] failed to parse agent file:', filePath, result.reason);
      return;
    }
    const agent = result.value;
    if (agent.name.trim() === '') {
      console.error('[agent-parser] skipped agent with empty name:', filePath);
      return;
    }
    agents.push(agent);
  });
  return agents;
}
