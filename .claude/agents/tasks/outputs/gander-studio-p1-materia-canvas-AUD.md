# Audit Report — gander-studio-p1-materia-canvas

**Auditor:** AUDITOR#1
**Date:** 2026-03-16
**Overall Verdict:** FAIL

---

## SA Gate — Standards & Architecture

<audit_review task_id="gander-studio-p1-materia-canvas">
  <verdict>FAIL</verdict>
  <sa_findings>

### FAIL — JSON.parse without try/catch

**File:** `packages/client/src/components/compose/MateriaCanvas.tsx`
**Line:** 350

```typescript
const parsed = JSON.parse(raw) as { name: string; type: 'agent' | 'skill' };
```

`JSON.parse` is called without a try/catch block. If the drag dataTransfer contains malformed JSON (e.g., from a browser extension injecting drag events, or a non-palette drag source), this will throw an uncaught exception and crash the React component tree. The `as` type assertion also provides no runtime validation — the parsed object is not validated against a Zod schema or even checked for required properties before being used on line 355.

**Rule:** TypeScript strict mode / Zod at boundaries (standards.md)
**Severity:** CRITICAL
**Remediation:** Wrap lines 350-355 in a try/catch that silently returns on parse failure. Optionally, add a minimal Zod schema (`z.object({ name: z.string(), type: z.enum(['agent','skill']) })`) to validate the parsed payload before passing it to `addNode`. At minimum, the try/catch is required.

### INFO — Server/shared files show uncommitted modifications

**Files:** `packages/server/src/parsers/agent-parser.ts`, `packages/server/src/router.ts`, `packages/server/src/server.ts`, `packages/shared/src/schemas.ts`

These files show diffs vs HEAD. However, the modifications are from a different sprint (export improvements, EADDRINUSE handling, ExportInputSchema relocation) — NOT from the materia-canvas sprint. This is an INFO-level observation, not a blocking finding, since the materia-canvas sprint files do not modify server/shared code.

### PASS — All other SA checks

- [x] No raw hex color values in sprint files (grep confirmed: none found)
- [x] `getMateriaColor` imported from `constants/compose.ts` (MateriaNode.tsx:7, MateriaCanvas.tsx:30), NOT re-implemented in canvas.ts (grep confirmed: only comment reference)
- [x] `@xyflow/react/dist/style.css` import ONLY in MateriaCanvas.tsx:5 (grep confirmed: not in globals.css or main.tsx)
- [x] No tRPC calls in MateriaCanvas.tsx or MateriaNode.tsx (grep confirmed)
- [x] `selectLoadoutPayload` returns `hooks: []` always (canvas-store.ts:161)
- [x] Orchestrator cannot be removed: guard at canvas-store.ts:82 (`if (id === ORCHESTRATOR_ID) return`)
- [x] No duplicate `getMateriaColor` implementation (canvas.ts only has a comment referencing compose.ts)
- [x] All magic numbers extracted to constants in canvas.ts
- [x] `data-testid="compose-page"` preserved on ComposePage root div (line 751)
- [x] `data-testid="materia-canvas"` present on MateriaCanvas wrapper (line 365)
- [x] `data-testid="materia-palette"` present on palette sidebar (line 222)
- [x] `data-testid="palette-item-{name}"` pattern present on palette items (line 190)
- [x] `data-testid="materia-node-{name}"` present on MateriaNode root (line 101)
- [x] Accessibility: `aria-label` on remove buttons (MateriaNode.tsx:107), `role="button"` on palette items (MateriaCanvas.tsx:188), `tabIndex={0}` on palette items (MateriaCanvas.tsx:189)
- [x] WCAG AA contrast: node labels use `var(--wd)` on colored orbs (MateriaNode.tsx:67)
- [x] Permitted rgba values only: `rgba(84,153,181,0.5)` in canvas.ts:17 (EDGE_GLOW) and `rgba(232,200,64,0.25)` in MateriaNode.tsx:34 (orchestrator inner glow)
- [x] TypeScript strict mode compliance — no `any` without justification, proper type annotations throughout
- [x] No unused imports in ComposePage.tsx (React used as namespace for event types, useRef used for saveTimeoutRef)

  </sa_findings>
</audit_review>

---

## QA Gate — Functional Correctness

<test_report task_id="gander-studio-p1-materia-canvas">
  <verdict>PASS</verdict>
  <test_coverage>Spec file exists: packages/client/src/tests/compose/materia-canvas.spec.ts (4 tests)</test_coverage>
  <playwright>
    <tier>SKIPPED — SA FAIL stops pipeline before Playwright execution</tier>
  </playwright>
  <qa_findings>

All functional checks pass on static review:

- [x] `handleSave` (ComposePage.tsx:697-711) builds payload as `{ name (compose-store), agents (canvas-store via canvasPayload), skills (canvas-store via canvasPayload), hooks (compose-store), createdAt }` — matches LoadoutSchema
- [x] `handleLoad` (line 714-719) calls both `loadLoadout` (compose-store) and `canvasLoadFromLoadout` (canvas-store)
- [x] `handleNew` (line 728-734) calls both `resetLoadout` (compose-store) and `canvasReset` (canvas-store)
- [x] `loadFromLoadout` (canvas-store.ts:110) handles `agentCount === 0` edge case — skill ring stagger offset defaults to 0 (line 125)
- [x] `removeNode` guards orchestrator with early return (canvas-store.ts:82)
- [x] `addEdge` dedupes by source+target pair via `edgeId` (canvas-store.ts:98-99)
- [x] `addNode` dedupes by id (canvas-store.ts:77)
- [x] Proximity threshold uses `CANVAS_PROXIMITY_THRESHOLD_PX` from canvas.ts (MateriaCanvas.tsx:328)
- [x] `screenToFlowPosition` used for drop coordinate transform (MateriaCanvas.tsx:351)
- [x] `fitView` prop on ReactFlow (MateriaCanvas.tsx:385)
- [x] Canvas node drag-end position synced to canvas-store via `updateNodePosition` in `handleNodesChange` (MateriaCanvas.tsx:318)
- [x] Hooks slot UI still functional in ComposePage (lines 867-876)
- [x] No unused imports in ComposePage.tsx

  </qa_findings>
</test_report>

---

## SX Gate — Security

<security_audit task_id="gander-studio-p1-materia-canvas">
  <verdict>VULNERABLE</verdict>
  <threat_level>MEDIUM</threat_level>
  <findings>

### Finding 1 — Unvalidated JSON.parse in drop handler

<vulnerability>
  <type>INPUT_VALIDATION</type>
  <location>packages/client/src/components/compose/MateriaCanvas.tsx:350</location>
  <description>
    The drop handler calls `JSON.parse(raw)` on data from `e.dataTransfer.getData('application/materia-node')` without a try/catch. The result is then cast with `as` and used directly to create a canvas node (line 355). An attacker or misbehaving browser extension could inject arbitrary drag data that either (a) throws a parse error crashing the React tree, or (b) passes valid JSON with unexpected shape (e.g., `{ name: "<script>alert(1)</script>", type: "agent" }`) which would be rendered as a node label. While React auto-escapes JSX text content (mitigating XSS), the lack of schema validation means arbitrary strings can appear as node names and propagate to the save payload sent to the server.
  </description>
  <mitigation>
    1. Wrap lines 350-355 in a try/catch block, returning early on parse failure.
    2. Validate the parsed object with a Zod schema: `z.object({ name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/), type: z.enum(['agent', 'skill']) })`.
    3. This ensures only well-formed, expected payloads create canvas nodes.
  </mitigation>
</vulnerability>

### PASS — All other security checks

- [x] No `dangerouslySetInnerHTML` in any sprint file
- [x] No `eval` or `new Function` in any sprint file
- [x] `@xyflow/react` pinned to `^12.10.1` in packages/client/package.json
- [x] No hardcoded secrets or environment variables in client-side sprint files
- [x] No OWASP Top 10 patterns detected beyond the input validation issue above

  </findings>
</security_audit>

---

## Summary

| Gate | Verdict |
|------|---------|
| SA   | **FAIL** — JSON.parse without try/catch at MateriaCanvas.tsx:350 |
| QA   | PASS (static review; Playwright skipped due to SA FAIL) |
| SX   | **VULNERABLE** (MEDIUM) — same JSON.parse issue: no input validation on drop handler payload |

**Overall: FAIL**

**Required Fix:** Wrap `JSON.parse` at `packages/client/src/components/compose/MateriaCanvas.tsx:350` in a try/catch block. Validate the parsed payload shape before use (Zod schema preferred, but at minimum check `name` is a string and `type` is `'agent' | 'skill'`).

This is a single fix — both the SA and SX findings resolve to the same code location.
