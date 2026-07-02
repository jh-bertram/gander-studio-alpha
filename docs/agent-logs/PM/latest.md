# PM latest — see gander-studio-p9-sessions-feed-agentstats.md for full log
task_id: gander-studio-p9-sessions-feed-agentstats
stage: COMPLETE (rev2 — targeted t1a amendment after Critic re-gate)

6 task packets (t2, t1a, t1b, t3, t4, t5). rev2 scope = t1a ONLY (other 5 verified correct, unchanged):
- Dedup now SUFFIX-AGNOSTIC: isDocumented = boundary-prefix on full doc id OR sprintRoot equality.
  Fixes prog-studio-vision-2026-06-postmortem duplicate-shadow on the one real doc.
- Synthesis gated by sprintRoot: DENYLIST (system/session-resume/hone-*/agent-improvement-*/*-PROPOSED)
  + POSITIVE shape gate (-p{N} OR prog- OR gander-meta-) + right-strip grouping of sub-tasks.
- Tests now use REAL corpus shapes (a-g) incl. a LIVE-corpus assertion counting synthetic sessions.
Decomposition: .claude/tasks/outputs/gander-studio-p9-sessions-feed-agentstats-PM-1782010000.md
Order: t2->t1a->t1b; t3 parallel; t4(<-t1a,t1b,t3); t5(<-t2,t3). t4||t5 file-disjoint.
Open flag for next Critic: shape gate admits gander-meta-* (PM interpretation of Critic note) — for ratification.
