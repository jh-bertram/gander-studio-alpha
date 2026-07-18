// materiaTint — the SINGLE source of the materia-keyed alpha-tint idiom (amendment W1 dedup).
//
// `token` is a RUNTIME CSS custom-property NAME (e.g. '--mg'), never a hex literal — callers pass
// values straight from `PartyMember.materiaColorKey` (packages/shared/src/schemas.ts). Verified
// against the codebase's only existing dynamic-token color-mix precedent,
// `components/compose/MateriaNode.tsx`'s `color-mix(in srgb, var(--orb-color) ...)` gradient.
//
// Consumers: PortraitFrame.tsx (this package, 12% gradient stop) and PartyMemberCard's RoleTag
// (t3 — 12% bg / 25% border). No file other than this one may contain the raw `color-mix(...)`
// string literal.
export function materiaTint(token: string, pct: number): string {
  return `color-mix(in srgb, var(${token}) ${pct}%, transparent)`;
}
