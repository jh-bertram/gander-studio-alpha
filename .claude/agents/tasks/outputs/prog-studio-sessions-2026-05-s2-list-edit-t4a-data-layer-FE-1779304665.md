# FE Output Packet — prog-studio-sessions-2026-05-s2-list-edit-t4a-data-layer

**Agent:** FE#3
**Task ID:** prog-studio-sessions-2026-05-s2-list-edit-t4a-data-layer
**Completed:** 2026-05-20T00:20:00Z

## Files Produced

| File | Action | Lines |
|------|--------|-------|
| `packages/client/src/store/session-store.ts` | REPLACED t3b stub | 38 |
| `packages/client/src/hooks/useSessions.ts` | NEW | 36 |

## Verification

- `npm run lint`: exit 0 (tsc --noEmit across shared + server + client all clean)
- Constant audit: 0 matches (no raw hex, rgba, conversion factors)
- No client-side schema redefinition (Session type imported from @gander-studio/shared)
- No JSX in either file
- No raw hex values
- File casing: session-store.ts (kebab-case — not sessionStore.ts)

## State Shape Delivered (session-store.ts)

```
sessions:          Session[]                        — default []
selectedSessionId: string | null                    — default null
activeTab:         string                           — default 'overview'
editBuffer:        string                           — default ''
originalContent:   string                           — default ''
lastSaveResult:    { filePath: string } | null      — default null
lastSaveError:     string | null                    — default null

setSelectedSessionId(id: string | null): void
setActiveTab(tab: string): void
setEditBuffer(content: string): void
setOriginalContent(content: string): void
setLastSaveResult(result: { filePath: string } | null): void
setLastSaveError(error: string | null): void
```

## Hook Contracts Delivered (useSessions.ts)

```
useSessions() → { sessions: Session[], isLoading: boolean, error: unknown }
  - trpc.session.list.useQuery({ limit: 50 })
  - Unwraps .sessions envelope (list returns { sessions, skipped })

useSessionDetail(id: string) → { session: Session | undefined, isLoading: boolean, error: unknown }
  - trpc.session.get.useQuery({ id })
  - Bare object — NO .sessions unwrap
```

---

```xml
<ui_packet>
  <files_created>
    packages/client/src/store/session-store.ts (REPLACED t3b stub — full Zustand store)
    packages/client/src/hooks/useSessions.ts (NEW)
  </files_created>
  <state_hydration_map>
    session-store.ts holds the canonical client-side session state. useSessions() fetches
    session.list (tRPC), unwraps the { sessions, skipped } envelope, and returns sessions[]
    for components to render. useSessionDetail(id) fetches session.get (bare object) for
    the detail view. Components write to the store via setters (selectedSessionId, activeTab,
    editBuffer, originalContent, lastSaveResult, lastSaveError). No server-side hydration
    in this layer — all reads are via tRPC useQuery.
  </state_hydration_map>
  <a11y_verification>
    Not applicable — data layer only. No JSX, no interactive elements, no ARIA roles.
    Accessibility requirements apply to t4b (SessionListPage) and t5a/t5b (detail/editor).
  </a11y_verification>
  <design_tokens_used>
    None — data layer only, no Tailwind or CSS.
  </design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <integration_status>
    SUCCESS — session.list and session.get procedures confirmed in server/src/router.ts.
    Session type confirmed in packages/shared/src/schemas.ts. Lint exits 0.
  </integration_status>
  <e2e_spec>TIER_1_ONLY — no new UI surface; data layer only</e2e_spec>
</ui_packet>
```
