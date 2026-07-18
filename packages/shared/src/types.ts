import type { z } from 'zod';
import type {
  AgentSchema,
  SkillSchema,
  HookSchema,
} from './schemas.js';

export type Agent = z.infer<typeof AgentSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Hook = z.infer<typeof HookSchema>;
