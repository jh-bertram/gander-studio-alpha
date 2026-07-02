# CR rev2 — gander-studio-p9-sessions-feed-agentstats (SCOPED: t1a only)

## Stage 1 — RECEIVED
Terminal scoped re-review. Only t1a changed since rev1. Judge ONLY t1a dedup/synthesis corpus-correctness (4 items). PASS if item 2 acceptable; do not hunt new scope.

## Stage 2 — PLAN
Read: revised PM decomposition (t1a), prior CR-rev1. Verify against REAL corpus:
1. doc-shadow kill (prog-studio-vision-2026-06-postmortem)
2. boundary-prefix over-suppression (p3 vs p3-proximity-edge-fix)
3. denylist + shape gate (system/agent-improvement/PROPOSED; admit gander-meta-*)
4. tests a–g real-shaped + live-corpus assertion

## Checkpoints
- Item 1: CONFIRMED killed. `prog-studio-vision-2026-06-postmortem`.startsWith(`prog-studio-vision-2026-06-`)=true → isDocumented → suppressed. Event real at agent-events-2026-06-20.jsonl:43.
- Item 2: Named trigger (bare doc `gander-studio-p3`) does NOT exist. Real p3 doc = `gander-studio-p2-p3.md` → id `gander-studio-p2-p3` (toSlug of filename stem). It does NOT boundary-prefix `gander-studio-p3-proximity-edge-fix` and shares no sprintRoot. p3 (sprintRoot→`gander-studio-p3`) and p3-proximity-edge-fix (sprintRoot→`gander-studio-p3-proximity-edge-fix`, `fix` descriptive) synthesize as DISTINCT roots. NO false-collapse on the real corpus. Over-suppression is latent only for an unconventional bare-phase doc id (real after-action naming always carries a descriptive slug). ACCEPTABLE.
- Item 3: CONFIRMED. Real noise ids system/session-resume/agent-improvement-*/hone-*/gander-p8-...-PROPOSED all → null via denylist (runs before shape gate). gander-meta-* admitted via gate (ORC-ratified). Denylist-before-gate correctly rejects PROPOSED-on-real-phase.
- Item 4: Tests a–g real-shaped; live (g) over real two-root config asserts no dup ids + no noise + shape-gate pass — catches item 1/3 regressions.
- NEW (non-blocking): combined-phase doc `gander-studio-p2-p3` does NOT suppress `gander-studio-p3*` events → synthetic `gander-studio-p3` card co-exists with the doc card. UNDER-suppression (inverse of item 2). No dup id, real sprint, debatable-acceptable. WARNING only.

## Stage 3 — COMPLETE
Verdict: PASS. Item 2 acceptable (latent, not real). One WARNING surfaced (combined p2-p3 doc under-suppression). Output written.
