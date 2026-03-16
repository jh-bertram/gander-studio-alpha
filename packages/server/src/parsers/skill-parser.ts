import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { SkillSchema } from '@gander-studio/shared';
import type { Skill } from '@gander-studio/shared';

export async function parseAllSkills(ganderRoot: string): Promise<Skill[]> {
  const skillsDir = join(ganderRoot, '.claude', 'skills');
  const entries = await readdir(skillsDir, { withFileTypes: true });
  const skillDirs = entries.filter(e => e.isDirectory());

  const skills = await Promise.all(
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

  return skills;
}
