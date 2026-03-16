import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { HookSchema } from '@gander-studio/shared';
import type { Hook } from '@gander-studio/shared';

// Shape of settings.json hooks section (validated at parse time)
interface SettingsHookEntry {
  type: string;
  command: string;
}
interface SettingsHooks {
  [event: string]: Array<{
    matcher: string;
    hooks: SettingsHookEntry[];
  }>;
}
interface Settings {
  hooks?: SettingsHooks;
}

const KNOWN_EVENTS = new Set(['PreToolUse', 'PostToolUse', 'Stop']);

export async function parseAllHooks(ganderRoot: string): Promise<Hook[]> {
  const settingsPath = join(ganderRoot, '.claude', 'settings.json');
  const raw = await readFile(settingsPath, 'utf-8');
  const settings = JSON.parse(raw) as Settings;

  const hooks: Hook[] = [];
  const hooksConfig = settings.hooks ?? {};

  for (const [event, matchers] of Object.entries(hooksConfig)) {
    // Validate event is a known type
    if (!KNOWN_EVENTS.has(event)) continue;

    for (const matcherEntry of matchers) {
      for (const hookEntry of matcherEntry.hooks) {
        // Extract script path from command: "bash /path/to/script.sh" -> "/path/to/script.sh"
        const scriptPath = hookEntry.command.replace(/^bash\s+/, '');
        let body = '';
        try {
          body = await readFile(scriptPath, 'utf-8');
        } catch {
          body = '# script file not found';
        }

        hooks.push(HookSchema.parse({
          event: event as Hook['event'],
          matcher: matcherEntry.matcher,
          filePath: scriptPath,
          command: hookEntry.command,
          body,
        }));
      }
    }
  }

  return hooks;
}
