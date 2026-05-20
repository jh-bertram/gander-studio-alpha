// CRITICAL: GANDER_ROOT and LOADOUTS_DIR must be set explicitly. No process.cwd() fallback.
// If absent, startup fails immediately with a clear error.
import path from 'node:path';
import { z } from 'zod';

function requireEnv(name: string, hint: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} env var is required. ${hint}\nSee .env.example for reference.`
    );
  }
  return value;
}

export const GANDER_ROOT: string = requireEnv(
  'GANDER_ROOT',
  'Set it to the path of your gander project root.\nExample: GANDER_ROOT=/home/user/projects/gander'
);

export const LOADOUTS_DIR: string = requireEnv(
  'LOADOUTS_DIR',
  'Set it to the path where loadouts should be stored.\nExample: LOADOUTS_DIR=./loadouts'
);

export const SERVER_PORT = Number(process.env.SERVER_PORT ?? '3001');

export const EXPORT_BASE_DIR: string =
  process.env.EXPORT_BASE_DIR ?? '/tmp/gander-exports';

export const SESSIONS_EDITS_DIR: string = process.env.SESSIONS_EDITS_DIR
  ? path.resolve(process.env.SESSIONS_EDITS_DIR)
  : path.resolve(path.resolve(LOADOUTS_DIR), '../sessions-edits');

const _rawSessionsSourceDirs = process.env.SESSIONS_SOURCE_DIRS
  ? process.env.SESSIONS_SOURCE_DIRS
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => path.resolve(s))
  : [path.resolve(GANDER_ROOT)];

export const SESSIONS_SOURCE_DIRS: string[] = z
  .array(z.string().min(1))
  .parse(_rawSessionsSourceDirs);
