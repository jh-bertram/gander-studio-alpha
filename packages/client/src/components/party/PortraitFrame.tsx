import type { LucideIcon } from 'lucide-react';
import { Sword, ShieldCheck, Compass, Sparkles, Crown } from 'lucide-react';
import { materiaTint } from './materia-tint';

// docs/v2-vision/v2-design-spec.md <portrait_treatment>. Spec-primitive→substitute mapping
// (amendment W2, Critic-RATIFIED, not a fidelity deviation): components/ui/ has no installed
// Shadcn Card/Badge/Progress/Skeleton/Alert; raw Shadcn primitives collide with FF7 Mako tokens
// (memorized S2 gotcha → invisible text). PortraitFrame is a custom, FF7-tokened leaf — it has no
// direct spec-primitive counterpart of its own (the portrait is bespoke chrome inside the
// PartyMemberCard/`<Card>`-substitute t3 builds), so this file does not itself substitute a named
// Shadcn primitive; it is recorded here only so the mapping's rationale is visible everywhere a
// party/ component references it.

const PORTRAIT_MONOGRAM_MAX_CHARS = 3;

// Asset-free by construction (no photographic/illustrated image, ever). portraitSeed drives which
// diagonal the two-stop gradient runs, so same-materia cards (e.g. two Impl agents on --mg) stay
// visually distinct without any image asset — still exactly the corner-to-corner gradient the spec
// describes, just varying which pair of corners.
const GRADIENT_DIRECTIONS = ['to bottom right', 'to bottom left', 'to top right', 'to top left'] as const;

// Role-representative flourish icon, keyed by the materia token itself rather than a separate
// roleCategory prop — DESIGN.md Decision Record B fixes a 1:1 materiaColorKey↔roleCategory
// bijection (--mg=Impl, --my=Command, --mb=Intel, --mp=Meta, --mr=Gate) for PartyMember-shaped
// data, so PortraitFrame stays a minimal, prop-driven leaf per its declared signature
// `{ code, materiaColorKey, portraitSeed }` (no roleCategory field). Unknown tokens render no icon
// — the flourish is explicitly optional per spec.
const ROLE_ICON_BY_MATERIA_TOKEN: Record<string, LucideIcon> = {
  '--mg': Sword,
  '--my': Crown,
  '--mb': Compass,
  '--mp': Sparkles,
  '--mr': ShieldCheck,
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export interface PortraitFrameProps {
  code: string;
  materiaColorKey: string;
  portraitSeed: string;
}

export default function PortraitFrame({ code, materiaColorKey, portraitSeed }: PortraitFrameProps) {
  const direction = GRADIENT_DIRECTIONS[hashSeed(portraitSeed) % GRADIENT_DIRECTIONS.length];
  const RoleIcon = ROLE_ICON_BY_MATERIA_TOKEN[materiaColorKey];
  const monogram = code.slice(0, PORTRAIT_MONOGRAM_MAX_CHARS).toUpperCase();

  return (
    <div
      className="relative flex aspect-square w-full items-center justify-center overflow-hidden"
      style={{
        borderRadius: 'var(--radius)', // DESIGN.md Decision Record A: --radius (10px) matches --radius-md
        background: `linear-gradient(${direction}, ${materiaTint(materiaColorKey, 12)}, var(--sfh))`,
        border: `2px solid var(${materiaColorKey})`,
        // No box-shadow anywhere — Constitution forbids glow shadows.
      }}
    >
      <span
        style={{
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--w)',
        }}
      >
        {monogram}
      </span>
      {RoleIcon ? (
        <RoleIcon
          aria-hidden="true"
          size={16}
          className="absolute bottom-1 right-1"
          style={{ opacity: 0.5, color: 'var(--w)' }}
        />
      ) : null}
    </div>
  );
}
