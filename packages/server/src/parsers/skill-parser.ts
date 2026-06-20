import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { SkillSchema } from '@gander-studio/shared';
import type { Skill } from '@gander-studio/shared';

export async function parseAllSkills(ganderRoot: string): Promise<Skill[]> {
  const skillsDir = join(ganderRoot, '.claude', 'skills');
  const entries = await readdir(skillsDir, { withFileTypes: true });
  const skillDirs = entries.filter(e => e.isDirectory());

  // allSettled-and-skip: one bad SKILL.md must not 500 the whole list
  const results = await Promise.allSettled(
    skillDirs.map(async (dir) => {
      const filePath = join(skillsDir, dir.name, 'SKILL.md');
      const raw = await readFile(filePath, 'utf-8');
      const { data, content } = matter(raw);
      return SkillSchema.parse({
        name: data.name ?? dir.name,
        description: data.description ?? '',
        body: content.trim(),
        filePath,
      });
    })
  );

  const skills: Skill[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      skills.push(result.value);
    }
    // rejected: skip silently (malformed SKILL.md — one bad file does not 500)
  }
  return skills;
}
