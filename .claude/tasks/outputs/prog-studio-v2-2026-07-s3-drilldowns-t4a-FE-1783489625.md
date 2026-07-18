# FE Output — prog-studio-v2-2026-07-s3-drilldowns-t4a

AgentDetailPage assembly + lazy route wiring (REV2 plan, CR#3-passed).

<ui_packet>
  <components_created>
    - packages/client/src/pages/AgentDetailPage.tsx (NEW, 271 lines, default export)
      - root data-testid `agent-detail-page`
      - sub-components (all module-local, not separately exported): `DetailRoleTag`,
        `BackToPartyButton` (data-testid `detail-back`, accessible name "Back to party"),
        `AgentDetailHeader`, `DataQualityNotes`, `DetailLoadingState`, `DetailErrorState`,
        `NoSelectionState`
      - pure exported helper `deriveAgentDetailState` (mirrors `derivePartyGridState` precedent —
        state derivation lives outside JSX for testability)
    - packages/client/src/store/ui-store.ts (MODIFIED, +1/-1) — `'agent-detail'` added to the
      `AppMode` union
    - packages/client/src/components/ModeContent.tsx (MODIFIED, +6) — `React.lazy` import +
      `PAGE_MAP['agent-detail']` entry on the existing shared Suspense boundary
  </components_created>

  <state_hydration_map>
    `useUIStore(s => s.selectedAgentCode)` (nullable, s2's ephemeral seam, not persisted) drives
    `trpc.roster.getAgentDetail.useQuery({ code: selectedAgentCode ?? '' }, { enabled: selectedAgentCode !== null })`
    (router.ts:794-810, verified — input `{code:string}`, output `AgentDetailSchema`, throws
    NOT_FOUND on unknown code, surfaced via the existing error state with no special-casing needed
    since `selectedAgentCode` is never persisted across reload). `useUIStore(s => s.setActiveMode)`
    is wired one-way to the Back-to-party button (`setActiveMode('party')`) — no other store writes
    from this page. `AgentDetail` fields flow straight through as props to the already-audited t1
    panels (`skills`/`hooks`/`equipment`/`abilities` + `dataQualityNotes`), t2's `RelationshipPanel`
    (`code`+`relationships`), and t3's `ReviseSpecAction` (`target: {type:'agent', name}` — see
    integration_status for the name-derivation note). `qualityStats[]` maps 1:1 to reused `StatBar`
    instances with `fillToken=detail.materiaColorKey` and **no `reason` prop passed** (StatBar's
    own optional-default satisfies SC(b) — verified live: DI's "First-pass audit rate" quality stat
    returns `normalized:null` and rendered via StatBar with zero code changes to StatBar.tsx).
  </state_hydration_map>

  <a11y_verification>
    - Back-to-party is a real `<Button>` (BaseUI `<button>` under the hood) with
      `aria-label="Back to party"` + `data-testid="detail-back"` — no span/div+onClick pattern, so
      no keyboard-equivalent gap (grep-verified: 0 matches for `<(span|div|li|a)...onClick=` in
      this packet's files).
    - `AgentDetailHeader` uses a semantic `<header>`; `DataQualityNotes` is a labelled `<section>`
      (`aria-labelledby`) + `<h2>` + `<ul>`/`<li>` list, never a plain unlabelled div dump.
    - `DetailLoadingState`: `aria-busy="true"` root + `sr-only` "Loading agent detail…" label,
      mirrors `PartyGridSkeleton`'s established pattern.
    - `DetailErrorState`: delegates to the existing `ErrorState` primitive (`role="alert"`,
      s2-audited) + a `Retry` button.
    - `NoSelectionState`: `role="status"` (non-error, informational) + the Back-to-party button so
      a direct-landing user with no selection is never stuck.
    - `StatBar` reused as-is (already carries `role="progressbar"` + `aria-valuenow`/`aria-label`,
      s2-audited) — this packet passes it zero new props that would change its a11y surface.
    - No new `role="dialog"`/popover/floating primitive introduced in this packet (t3's
      `ReviseSpecAction` dialog focus handling is that packet's already-audited scope, consumed
      unmodified) — the Focus-Trap Pre-Flight section does not apply here.
    - Color pairings: only reused tokens (`--w`, `--wd`, `--wm`, `--sf`, `--bd`, materiaTint-derived
      role-tag tints) — no new token/text pairing introduced beyond what t1/t2/t3/StatBar/PortraitFrame
      already established and traced to contrast_pairs.
  </a11y_verification>

  <design_tokens_used>
    `--w`, `--wd`, `--wm`, `--sf`, `--bd`, `--radius`, `--fm` (all via `var(--token)` references,
    zero raw hex — grep-confirmed 0 matches for `#[0-9a-fA-F]{6}` across all 3 touched files).
    `materiaTint(token, pct)` reused (not re-inlined) for `DetailRoleTag`'s bg/border, mirroring
    `PartyMemberCard`'s private `RoleTag` treatment exactly (that component is unexported, so this
    page mirrors its DESIGN.md-sourced "Role / type tag" Component Rule locally rather than
    reaching into PartyMemberCard.tsx's internals). `PORTRAIT_SIZE_PX`/`ROLE_TAG_RADIUS_PX` are
    named local constants (no unlabeled magic numbers repeated inline).
    design_system_source: DESIGN_MD
  </design_tokens_used>

  <style_conflict_check>NONE — 0 inline `style="..."` string attributes in any touched file; all
  styling uses `style={{...}}` object form (project convention) or Tailwind utility classes, with
  no property overlap between the two on any single element.</style_conflict_check>

  <e2e_spec>TIER_1_ONLY — Tier-2 Playwright authorship is explicitly chartered to t5 in the REV2
  plan (a separate packet depending on BOTH t4a and t4b: "Author the Tier-2 Playwright e2e that IS
  the s3→s4 absorption-proof seam artifact"). This packet's own boundary states "the page may be
  unreachable-by-click this packet; that's correct" — PartyPage's `handleSelect`/Roster-rail are not
  yet re-pointed to `'agent-detail'` (t4b's scope), so a real click-driven Playwright flow cannot
  reach this page until t4b lands. Writing a partial spec now would either require non-UI store
  manipulation to force navigation (not a genuine e2e proof) or duplicate t5's already-scoped,
  CR-reviewed three-absorption-proof spec — both are scope violations of the task boundary. Capability
  was instead verified via a live `roster.getAgentDetail` curl against the running :3001 dev server
  for both a party code (FE) and a non-party code (DI), confirmed against this page's render-path
  code (see integration_status).</e2e_spec>

  <sc_self_check>
    (a) Header (portrait+code+role) + qualityStats via reused StatBar + 3 inventory panels (t1) +
        RelationshipPanel (t2) + ReviseSpecAction (t3, or honest fallback) + dataQualityNotes
        section + Back-to-party affordance calling setActiveMode('party') — all present, code-
        reviewed line-by-line in AgentDetailPage.tsx: PASS
    (b) qualityStats N/A handled with NO reason prop passed to StatBar (StatBar's own optional
        default 'reason not provided' used, StatBar.tsx untouched); N/A rationale surfaced via
        dataQualityNotes section: PASS
    (c) getAgentDetail resolves ANY valid ROSTER code — live-verified via curl for FE (party) and
        DI (non-party, specFile:null): both return valid AgentDetail JSON, DI's empty
        lists/dataQualityNotes shape matches this page's honest-empty-state render path exactly
        (no UI entry point added for the 7 non-party roles, per boundary): PASS
    (d) 'agent-detail' added to AppMode union; `npm test -w @gander-studio/client` — 54/54 passed
        incl. `store/__tests__/ui-store.test.ts` (no regression): PASS
    (e) ModeContent PAGE_MAP routes 'agent-detail' to a React.lazy AgentDetailPage on the existing
        shared Suspense boundary; build output confirms a separate `AgentDetailPage-*.js` chunk
        (19.61 kB) NOT folded into the main chunk: PASS
    (f) DI (empty-spec analog — specFile:null) renders honest empty states + all 3 dataQualityNotes,
        no crash — verified against live curl response + component render-path code review: PASS
    (g) `npm run build -w @gander-studio/client` succeeded; main chunk `index-CNMygk6v.js` =
        757.76 kB (< 1000 kB gate; baseline 756.80 kB, delta +0.96 kB from the AppMode/PAGE_MAP
        registration edits only): PASS — see chunk table below
    (h) `npm run lint` (tsc --noEmit x3, shared→server→client) exit 0: PASS
  </sc_self_check>

  <bundle_gate_measurement>
    | Chunk | Size (post-build) | Note |
    |---|---|---|
    | dist/assets/index-CNMygk6v.js (main) | 757.76 kB (gzip 227.54 kB) | baseline 756.80 kB → +0.96 kB delta (AppMode union member + PAGE_MAP entry only) |
    | dist/assets/index-0AupM6Ae.js | 178.66 kB (gzip 58.03 kB) | unchanged vendor/shared chunk |
    | dist/assets/index-Dk8x1_8A.js | 42.63 kB (gzip 15.54 kB) | unchanged |
    | dist/assets/ComposePage-0V5QhqqJ.js | 28.88 kB (gzip 8.96 kB) | pre-existing lazy chunk, unchanged |
    | dist/assets/AgentDetailPage-NBEJmUQ3.js | 19.61 kB (gzip 5.89 kB) | **NEW — this packet's lazy chunk (t1+t2+t3+t4a composed)** |
    | dist/assets/GraphPage-DzpBAheD.js | 11.53 kB (gzip 3.44 kB) | pre-existing lazy chunk, unchanged |
    | dist/assets/ProgramDagPage-Z8WMrbCk.js | 8.94 kB (gzip 2.74 kB) | pre-existing lazy chunk, unchanged |
    | dist/assets/PartyPage-ArCKx8mg.js | 7.87 kB (gzip 2.83 kB) | pre-existing lazy chunk, unchanged |
    | dist/assets/StatBar-B30O4986.js | 4.28 kB (gzip 1.73 kB) | pre-existing lazy chunk, unchanged |

    **Gate: main chunk 757.76 kB < 1000 kB — PASS, 242.24 kB headroom remaining.**
  </bundle_gate_measurement>

  <integration_status>
    SUCCESS, with ONE flagged non-blocking gap (documented in code + this packet, not silently
    guessed):

    `AgentDetailSchema` carries no `agent.name` (front-matter slug) or `specFile` field, but
    `ReviseSpecAction`'s `target.name` must equal the EXACT `Agent.name` value that
    `agent.get`/`agent.save` match on (`agents.find(a => a.name === input.name)`, router.ts:190-194
    and :239-244, verified). I checked on disk: this value is **not derivable from `code` by any
    formula** — e.g. `database.md -> db-specialist`, `hr.md -> system-health-monitor`,
    `pm.md -> project-manager`, `auditor.md -> code-auditor`. Per the Data-Contract Pre-Flight
    doctrine (verify before writing, don't guess), I did NOT scrape agent body prose (confirmed this
    is unreliable — several role files, e.g. `ui-designer.md`/`auditor.md`/`orchestrator.md`, do not
    consistently embed `(CODE)` in their opening sentence) or invent a schema field. Instead I added
    a small, explicitly-commented `ROSTER_AGENT_NAME_BY_CODE` map (12 entries, `DI` excluded since
    `ROSTER.specFile` is `null` for it — no spec exists to revise) that mirrors the server's
    `agent-role.ts` ROSTER **only for this one UI-wiring purpose**. When a code has no map entry
    (currently only DI), the page renders an honest "No spec on disk to revise for this role."
    message instead of opening a dialog that would always 404 — consistent with this sprint's
    honest-empty-state doctrine used throughout t1/t2.

    **Recommended follow-up (not in this packet's scope — no schema/server file touched):** add an
    `agentName: string | null` (or `specFile: string | null`) field to `AgentDetailSchema` /
    `assembleAgentDetail` so this client-side duplication can be retired. Flagging for ORC/PM to
    route to a small BE packet if desired; not a blocker for t4a's SCs (a)-(h), all of which are
    satisfied as measured above.

    All three inventory panels (t1), the relationship panel (t2), and the revise action (t3) were
    consumed exactly as authored — zero modifications to any upstream file. `PartyPage.tsx` and
    `navigation.ts` (t4b's exclusive scope) were not touched (git status confirms).
  </integration_status>
</ui_packet>
