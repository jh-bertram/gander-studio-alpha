import path from 'node:path';

/**
 * Subdirectories (relative to a source root) scanned for session documents.
 * Transition window: `post-mortems` is the legacy location; `after-actions` is
 * the current location after the post-mortem skill was renamed to after-action.
 * Read-side tooling globs BOTH per the project's documented convention.
 */
export const SESSION_DOC_SUBDIRS = ['docs/post-mortems', 'docs/after-actions'] as const;

/** Absolute candidate session-doc directories for a given source root. */
export function sessionDocDirs(sourceRoot: string): string[] {
  return SESSION_DOC_SUBDIRS.map((sub) => path.join(sourceRoot, sub));
}
