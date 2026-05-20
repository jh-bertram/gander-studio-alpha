import path from 'node:path';

/**
 * validateSaveEditPath — pure path-containment guard for session edit saves.
 *
 * Policy notes:
 * - Nested ids (e.g. "subdir/session-ok") are ACCEPTED if the resolved target
 *   stays inside editsDir. path.join(editsDir, "subdir/session-ok.md") does
 *   stay inside editsDir, so no explicit rejection is added for slashes.
 * - Empty id ("") yields path.join(editsDir, ".md"), which is inside editsDir —
 *   ACCEPTED. Callers may add a separate non-empty validation on `id` if desired.
 * - Any id that escapes editsDir via "../" traversal (e.g. "../../etc/passwd")
 *   is REJECTED with an Error whose message contains "Path traversal detected".
 *
 * This is a PURE function — no filesystem reads or writes.
 *
 * @param id       Session id used to construct the filename (`${id}.md`).
 * @param editsDir Absolute or relative base directory for edit files.
 * @returns        The fully resolved absolute path to the target file.
 * @throws         Error if the resolved target escapes editsDir.
 */
export function validateSaveEditPath(id: string, editsDir: string): string {
  const safeBase = path.resolve(editsDir);
  const target = path.resolve(path.join(editsDir, `${id}.md`));

  if (target !== safeBase && !target.startsWith(safeBase + path.sep)) {
    throw new Error('Path traversal detected');
  }

  return target;
}
