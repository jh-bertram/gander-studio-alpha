/**
 * Shared slug/root matching for session dedup and synthesis grouping.
 * Single source of truth for:
 *  - matchesSlug  (reused by parseEventLogFiles — no behavior change)
 *  - sprintRoot   (grouping key for synthesis and dedup)
 *  - isDocumented (the single dedup predicate; suffix-agnostic)
 */

// ---------------------------------------------------------------------------
// matchesSlug — the startsWith||includes predicate inlined in event-log-parser
// ---------------------------------------------------------------------------

/** Returns true when taskId matches a sprint slug (prefix or substring). */
export function matchesSlug(taskId: string, slug: string): boolean {
  return taskId.startsWith(slug) || taskId.includes(slug);
}

// ---------------------------------------------------------------------------
// sprintRoot internals
// ---------------------------------------------------------------------------

const AGENT_CODES = new Set([
  'fe', 'be', 'ds', 'ra', 'hr', 'aud', 'audit', 'auditor',
  'ui', 'cr', 'pm', 'arc', 'orc', 'eval', 'qa', 'sa', 'sx',
]);

const CEREMONY_WORDS = new Set(['postmortem', 'archive', 'remediation']);

// Sub-id patterns: t\d+, s\d+, rev\d+, rem\d+, amend\d+, or bare number with optional letter
const SUB_ID_RE = /^(t\d+|s\d+|rev\d+|rem\d+|amend\d+|\d+[a-z]?)$/;

// Unix timestamp: 10+ consecutive digits
const UNIX_TS_RE = /^\d{10,}$/;

// Phase token: p followed by one or more digits — NEVER stripped
const PHASE_RE = /^p\d+$/;

/**
 * Returns true when `seg` is a trailing-noise segment that should be
 * right-stripped to arrive at the sprint root. A `p\d+` phase token is
 * never noise regardless of other rules.
 */
function isNoiseSegment(seg: string): boolean {
  if (!seg) return true; // empty segment from double-hyphen or trailing hyphen
  if (PHASE_RE.test(seg)) return false; // NEVER strip a p\d+ phase token
  if (AGENT_CODES.has(seg)) return true;
  if (CEREMONY_WORDS.has(seg)) return true;
  if (SUB_ID_RE.test(seg)) return true;
  if (UNIX_TS_RE.test(seg)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// sprintRoot
// ---------------------------------------------------------------------------

/**
 * Derives the canonical sprint root for grouping / dedup. Returns null when
 * the task_id is denylisted or fails the positive shape gate.
 *
 * Algorithm:
 *  a. Lowercase.
 *  b. DENYLIST: exact 'system' | 'session-resume'; starts 'hone-' | 'agent-improvement-';
 *     ends '-proposed' → return null.
 *  c. Right-strip trailing noise segments (agent codes, sub-ids, ceremony words,
 *     unix timestamps). NEVER strip a p\d+ token. Stop at first descriptive segment.
 *  d. POSITIVE SHAPE GATE: root must contain '-p\d+', start with 'prog-', or
 *     start with 'gander-meta-' with at least one descriptive segment beyond 'gander-meta'.
 *     Anything else → return null.
 *  e. Return root.
 */
export function sprintRoot(taskId: string): string | null {
  const id = taskId.toLowerCase();

  // (b) DENYLIST
  if (id === 'system' || id === 'session-resume') return null;
  if (id.startsWith('hone-') || id.startsWith('agent-improvement-')) return null;
  if (id.endsWith('-proposed')) return null;

  // (c) Right-strip trailing noise segments
  const segs = id.split('-').filter((s) => s.length > 0);
  while (segs.length > 1 && isNoiseSegment(segs[segs.length - 1]!)) {
    segs.pop();
  }
  const root = segs.join('-');

  // (d) POSITIVE SHAPE GATE
  const hasPhaseToken = /-p\d+/.test(root);
  const startsWithProg = root.startsWith('prog-');
  // gander-meta-<descriptive>: requires at least 3 segments (gander, meta, <slug>)
  const isGanderMeta = root.startsWith('gander-meta-') && segs.length > 2;

  if (!hasPhaseToken && !startsWithProg && !isGanderMeta) return null;

  // (e) Return
  return root;
}

// ---------------------------------------------------------------------------
// isDocumented — the single dedup predicate
// ---------------------------------------------------------------------------

/**
 * Returns true when taskId is covered by a doc-backed session.
 *
 * Two equivalent paths (either triggers documented=true):
 *  1. Boundary-prefix: taskId === docId OR taskId.startsWith(docId + '-')
 *     (suffix-agnostic; suppresses -postmortem, -s5-…, sub-ids, dates uniformly)
 *  2. sprintRoot equality: sprintRoot(taskId) !== null &&
 *     sprintRoot(taskId) === sprintRoot(docId) for some doc
 *     (handles date-suffixed doc ids like gander-foo-p5-2026-06-23 vs gander-foo-p5-BE-001)
 *
 * @param taskId   the event-log task_id to check
 * @param docIds   ids of all doc-backed sessions collected so far
 * @param docRoots sprintRoot of each doc-backed id, pre-computed (null entries excluded)
 */
export function isDocumented(
  taskId: string,
  docIds: string[],
  docRoots: string[],
): boolean {
  // Path 1: boundary-prefix match against full doc id
  for (const docId of docIds) {
    if (taskId === docId || taskId.startsWith(docId + '-')) return true;
  }

  // Path 2: sprintRoot equality
  const taskRoot = sprintRoot(taskId);
  if (taskRoot !== null) {
    for (const docRoot of docRoots) {
      if (taskRoot === docRoot) return true;
    }
  }

  return false;
}
