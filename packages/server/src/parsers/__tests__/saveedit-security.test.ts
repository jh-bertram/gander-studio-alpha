import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { validateSaveEditPath } from '../saveedit-guard.js';

// Pure security tests — NO filesystem writes (no writeFile/mkdir/writeFileSync/mkdirSync).
// All cases exercise validateSaveEditPath logic only.

const EDITS_DIR = '/tmp/test-edits';

describe('validateSaveEditPath — path traversal security', () => {
  // Case 1: classic traversal via "../../../" — must be blocked
  it('rejects id "../../../etc/passwd"', () => {
    expect(() => validateSaveEditPath('../../../etc/passwd', EDITS_DIR)).toThrow(
      'Path traversal detected',
    );
  });

  // Case 2: a clean id — must return a path INSIDE editsDir
  it('accepts id "session-ok" and returns a path inside editsDir', () => {
    const result = validateSaveEditPath('session-ok', EDITS_DIR);
    const safeBase = path.resolve(EDITS_DIR);
    expect(result.startsWith(safeBase + path.sep)).toBe(true);
    expect(result).toBe(path.join(safeBase, 'session-ok.md'));
  });

  // Case 3: shorter traversal — must be blocked
  it('rejects id "../../etc/hosts"', () => {
    expect(() => validateSaveEditPath('../../etc/hosts', EDITS_DIR)).toThrow(
      'Path traversal detected',
    );
  });

  // Case 4: nested id "subdir/session-ok".
  // Policy: ACCEPTED — path.resolve(editsDir, "subdir/session-ok.md") stays
  // inside editsDir, so the guard does not reject it.
  it('accepts id "subdir/session-ok" (nested path stays inside editsDir)', () => {
    const result = validateSaveEditPath('subdir/session-ok', EDITS_DIR);
    const safeBase = path.resolve(EDITS_DIR);
    expect(result.startsWith(safeBase + path.sep)).toBe(true);
  });

  // Case 5: empty id "".
  // Policy: ACCEPTED — path.join(editsDir, ".md") resolves to editsDir/.md,
  // which is inside editsDir. Callers should validate id is non-empty separately.
  it('accepts id "" (resolves to editsDir/.md, which is inside editsDir)', () => {
    const result = validateSaveEditPath('', EDITS_DIR);
    const safeBase = path.resolve(EDITS_DIR);
    expect(result.startsWith(safeBase + path.sep)).toBe(true);
    expect(result).toBe(path.join(safeBase, '.md'));
  });
});
