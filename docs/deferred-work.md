# Deferred Work

Items surfaced during sprints but explicitly deferred for a future sprint.

---

## Sprint: gander-studio-p2-agent-cards

### DEFERRED-001 — Plain-text appearance config file

**Original request:** "Add a plain-text appearance config file."
**Status:** Deferred by human (HCG-1, 2026-04-01). Not lost — tracked here.

**What it will do when scheduled:**
- Create `appearance.config.json` at project root exposing key visual constants from `canvas.ts`
- Add `config.appearance` GET tRPC procedure to `router.ts` — reads + parses the JSON file, returns typed response
- Add tRPC query hook on client
- On app init, merge server-returned config over default constants

**Why deferred:** Fully orthogonal to the visual redesign in this sprint. Requires new server endpoint, file I/O, and runtime config injection — better validated in its own sprint.

**Schedule as:** Standalone sprint with DS + BE + FE wave.
