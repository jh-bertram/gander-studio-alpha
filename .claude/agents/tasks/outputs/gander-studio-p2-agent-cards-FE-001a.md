# ui_packet — gander-studio-p2-agent-cards-FE-001a

## Files Modified

| File | Change |
|------|--------|
| `packages/client/src/constants/canvas.ts` | Appended 4 card dimension constants |
| `packages/client/src/constants/compose.ts` | Replaced 5 local Set declarations with imports from agent-roles.ts; replaced getMateriaColor with role-fast-path version |
| `packages/client/src/components/compose/MateriaNode.tsx` | Added AgentRole import; added `role?: AgentRole` to props; passed role to getMateriaColor |

---

## Checklist

- [x] CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_HEADER_HEIGHT_PX, CARD_BORDER_RADIUS_PX added to canvas.ts
- [x] compose.ts has no locally-declared Sets (all imported from agent-roles.ts)
- [x] getMateriaColor has optional `role?: AgentRole` third param with fast-path switch
- [x] getMateriaColor('orchestrator', 'agent') with no role still returns 'var(--my)' (COMMAND_AGENTS = META_AGENTS includes 'orchestrator')
- [x] MateriaNode.tsx has `role?: AgentRole` in props and passes it to getMateriaColor
- [x] No raw hex values added
- [x] No MateriaCanvas.tsx changes
- [x] npm run lint PASS (zero errors)

---

## npm run lint output

```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
```

Exit code: 0 (zero errors)

---

## grep output — no local Set declarations in compose.ts

```
grep -n "const.*= new Set" packages/client/src/constants/compose.ts
```

(no output — zero matches confirmed)

---

## Constant audit

- Ran `grep -n "#[0-9a-fA-F]{6}"` on all three modified files.
- Only match: a comment in canvas.ts line 59 documenting the rgba encoding of `--my`. This is a pre-existing approved exception — not introduced by this task.
- No new raw hex values introduced.

---

## Integration notes

- Aliasing rationale preserved from brief: `META_AGENTS as COMMAND_AGENTS` expands orchestrator/project-manager/dispatcher → yellow. `EXTERNAL_AGENTS as INTEL_AGENTS` maps researcher/statistician/ui-designer → blue. `GATE_AGENTS` direct import includes system-health-monitor → red. Un-aliased `META_AGENTS` in name-path handles legacy backwards-compat.
- All existing callers of getMateriaColor without a role argument continue to work unchanged (role parameter is optional).
- e2e_spec: TIER_1_ONLY — no new UI surface created in this task.
