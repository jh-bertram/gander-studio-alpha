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

## Sprint: gander-studio-p5-overview-ux (2026-05-28)

### DEFERRED-005 — App-wide FF7 token contrast budget below WCAG AA — ✅ DONE (2026-06-20)

**Resolution:** Fixed in sprint `prog-studio-vision-2026-06-s1-token-root-fix`. Raised `--wm` alpha 0.38→0.55 (worst-case 5.06:1 on --sfh, AA PASS). Lightened `--mt` #5499b5→#6db0c8 (5.38:1 on --sfh for normal text, 8.12:1 on --void for UI components, both AA PASS). Remapped all stock Shadcn @layer base light tokens to FF7 var() references — fixes invisible text in all ui/* primitives (input, textarea, dialog, button). Contrast gate spec: `packages/client/tests/e2e/prog-studio-vision-s1-contrast-smoke.spec.ts`.
**Source:** AUDITOR#5 non-blocking advisory during p5-t4 audit.
**What it is:** Muted `--wm` label text (~3.49:1) and active `--mt` button text (~4.14:1) on dark surfaces fall below WCAG AA 4.5:1. This is NOT a regression from p5 — the new overview UI reused the identical token idiom already present in the unmodified AgentStatPanel/AgentStatTable/SessionPicker.
**Proposed fix:** A platform-level token pass (e.g. bump `--wm` alpha ~0.38→0.55, lighten `--mt` for text use) so the whole app clears AA. Cross-cutting; out of scope for a feature sprint.
**Why deferred:** Pre-existing, app-wide, not introduced here. Warrants its own dedicated contrast-remediation sprint rather than a piecemeal fix.
