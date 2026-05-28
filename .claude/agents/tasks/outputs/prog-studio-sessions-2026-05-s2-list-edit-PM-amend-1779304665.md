<plan_amendment sprint_id="prog-studio-sessions-2026-05-s2-list-edit" generated="2026-05-20T00:00:00Z">

  <!-- W1 — t3b: honest file count + session-store stub handshake -->
  <amendment id="W1" task="t3b" kind="sc_tightening">
    <change>
      Add to t3b description and routing notes:

      t3b touches 4 scaffold files, not 3:
        1. `SessionsRouter.tsx` — new component (~30 lines, tab-list + outlet)
        2. `SessionListPage.tsx` — one-line stub page (`<div>sessions list</div>`)
        3. `SessionDetailPage.tsx` — one-line stub page (`<div>session detail</div>`)
        4. `ModeContent.tsx` — one-line PAGE_MAP entry wiring sessions route

      All four are trivial scaffold; no substantive logic lives in any of them.
      Trivial-scaffold exception to the ≤3-source-file implementation-weight lens, stated
      explicitly for the auditor.

      Session-store stub handshake (t3b → t4a):
        t3b creates `src/store/session-store.ts` as a STUB — exports only the store
        interface shape and a placeholder `useSessionStore` hook returning typed empty
        state. No real fetch logic. t4a replaces this stub wholesale with the real Zustand
        store wired to tRPC hooks. The t4a brief must reference "replace the t3b stub at
        session-store.ts" as its first line item.
    </change>
  </amendment>

  <!-- W2 — t6a: dependency edge acknowledged as conservative/serialized-by-convenience -->
  <amendment id="W2" task="t6a" kind="risk_acknowledgement">
    <change>
      Add to risk_flags:

      The declared t6a → t5b edge is conservative. t6a's real dependency is only t4a
      (it adds two hook files and touches no tab/shell surface). The t5b edge was added
      for belt-and-suspenders serialization, not for a correctness constraint.

      This is accepted as-is. Dispatch is foreground sequential (ORC audits and commits
      one packet at a time), so the DAG ordering imposes no real wall-clock penalty —
      t6a would execute after t5b regardless of the declared edge. Reordering the edge
      would re-trigger the Critic gate for zero practical benefit under this dispatch
      model.
    </change>
  </amendment>

  <!-- W3 — t2: explicit subdir join in getRaw scan description -->
  <amendment id="W3" task="t2" kind="sc_tightening">
    <change>
      Add one clause to t2 description, immediately after the "mirror session.get
      verbatim" directive:

      "getRaw's inline scan iterates SESSIONS_SOURCE_DIRS and for each dir reads
      `path.join(dir, 'docs', 'post-mortems')` — not `dir` directly — exactly as
      session.get does (router.ts:422-447). The readdir call targets the post-mortems
      subdirectory; scanning `dir` directly will produce an empty result on a real
      corpus and must not be implemented."

      The "mirror session.get verbatim" directive stands unchanged alongside this
      clarifying clause.
    </change>
  </amendment>

</plan_amendment>
