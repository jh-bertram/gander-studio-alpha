---
type: handoff-brief
name: agent-improvement-handoff-p6-critic-eventlog
description: Ready-to-execute agent-improvement/HR brief for the gander session — constrain read-only review agents (esp. the Critic) from writing the event log, after CR#1 corrupted it during sprint gander-studio-p6-overview-polish.
source_incident: ~/projects/gander-studio-alpha/docs/project_log.md (p6-overview-polish INCIDENT entry) + docs/events/agent-events-2026-05-28.jsonl seq 4 (EVENT_LOG_GAP)
target_repo: ~/projects/gander
authored: 2026-05-29
---

# Handoff: constrain read-only agents from writing the event log (run from a `~/projects/gander` session)

## Why this is a handoff, not an in-place run

The incident happened in `gander-studio-alpha`, but **every actionable fix targets the `gander` repo**: the `critic.md` (and other agent) specs, the `~/.claude/hooks/`, `settings.json` deny-rails, the live `docs/agent-changelog.md`, and the `docs/agent-versions/` archives all live under `~/projects/gander/` (and `~/.claude/{agents,skills,hooks}` symlink into it). Running `/agent-improvement` from the studio session would write version archives + changelog into the *studio* tree and edit specs out-of-tree. Per the user CLAUDE.md "never quick-route `.claude/` work" rule, this is meta-work that must go through the full pipeline.

## What happened (the incident)

During sprint `gander-studio-p6-overview-polish` (2026-05-28), the **critic** subagent (CR#1) corrupted `docs/events/agent-events-2026-05-28.jsonl`: while appending its `CRITIQUE_BLOCK` event it did a read-then-**overwrite** `Write`, truncating the file and destroying seqs 5–108 (that day's S3/p5/early-p6 telemetry). Those events were uncommitted working-tree-only state → **unrecoverable from git** (HEAD held only seqs 1–3; no stash/reflog). CR#1 also left a bogus `seq:999` recovery marker pointing at `git show HEAD`, which didn't have the data. ORC reconciled the log to a clean monotonic sequence (1–4, 109–127) with an honest `EVENT_LOG_GAP` record at seq 4. A second-order symptom also surfaced: the `SubagentStop` hook auto-logs COMPLETEs at `last_seq+1` and **raced** with ORC's manually-logged SPAWN/gate events, producing seq collisions (115, 119, 120 each appeared twice) that ORC had to renumber at wrap.

Mitigation that already worked this sprint: when ORC re-spawned the critic (CR#2), the brief **explicitly forbade** touching `docs/events/` — and CR#2 complied. So a spec-level prohibition is effective; the durable fix is to bake it in.

## Root causes (two)

1. **Read-only review agents have `Write` and used it on shared telemetry.** The critic is "finds, never fixes," but its Agent-tool toolset includes `Write`. ORC and the `SubagentStop` hook are the only intended writers of `docs/events/`. The critic should never be logging its own events.
2. **The event-log append path is not truncation-safe** and is **race-prone** (manual ORC appends vs. hook auto-COMPLETE both computing `last_seq+1`).

## Procedure for the gander session

1. `cd ~/projects/gander`.
2. Read this brief + the source incident (absolute paths in frontmatter).
3. Route through the full pipeline (Critic → HR/system-health-monitor → audit-pipeline → archivist). The spec/hook edits are HR (system-health-monitor) territory; `/agent-improvement` archives-before-edit, version-bumps, and appends to `~/projects/gander/docs/agent-changelog.md`.
4. Verify current versions before bumping (the s3 handoff is also pending — coordinate if running both): check `critic.md` header version and the `subagent-autocomplete.sh` hook.

## Proposed changes (for the gander pipeline to validate, not prescriptive)

- **FIX-1 (spec, HIGH):** In `critic.md` — and audit/sweep other nominally read-only agents (archivist, dispatcher, researcher) — add an explicit prohibition: do NOT read-modify-write or append to `docs/events/**`; event logging is owned by ORC + the `SubagentStop` hook. State that the agent returns its verdict/output in its reply + its own output file only. (The critic ideally should not have `Write` to anything but its single output file; consider whether its toolset can be tightened.)
- **FIX-2 (deny-rail / hook, HIGH):** Add a structural guard so a subagent physically cannot clobber the event log — e.g. a `PreToolUse` hook (or `settings.json` deny entry) blocking `Write`/overwrite to `docs/events/*.jsonl` from any agent that isn't ORC/the autocomplete hook. This is the "harden the append path" piece; HR/system-health-monitor owns it.
- **FIX-3 (hook robustness, MEDIUM):** Make event-log writes append-only and collision-tolerant — re-read `max(seq)+1` atomically at append time, and have ORC stop manually logging COMPLETEs (let the hook own COMPLETE) to remove the manual-vs-hook race that caused the seq-115/119/120 collisions this sprint.
- **FIX-4 (deprecate sentinel, LOW):** Reaffirm that `seq:999` is a deprecated bad-sentinel (already noted resolved in event seq 2's note) — ensure no recovery tooling/agent re-introduces it.

## Acceptance

A future sprint's critic (or any read-only agent) cannot truncate or overwrite `docs/events/`; an attempt is blocked structurally (FIX-2) and prohibited by spec (FIX-1); the COMPLETE auto-log no longer collides with ORC events (FIX-3). Changelog entry + version bumps recorded in `~/projects/gander/docs/agent-changelog.md`.
