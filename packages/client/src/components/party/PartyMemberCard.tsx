import { useEffect, useRef, useState } from 'react';
import type { PartyMember, PartyStatBar } from '@gander-studio/shared';
import { cn } from '../../lib/utils';
import PortraitFrame from './PortraitFrame';
import StatBar from './StatBar';
import { materiaTint } from './materia-tint';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';

// docs/v2-vision/v2-design-spec.md <component_hierarchy> PartyMemberCard + <interactions>.
//
// Spec-primitive→substitute mapping (amendment W2, Critic-RATIFIED, not a fidelity deviation):
//   Card     → PartyMemberCard  (THIS component, custom, FF7-tokened)
//   Badge    → RoleTag          (THIS file, custom, FF7-tokened — see RoleTag below)
//   Progress → StatBar          (t2, custom new_pattern_proposal)
//   Skeleton → shimmer-box      (existing components/ui/shimmer-box.tsx — t4 consumes)
//   Alert    → error-state      (existing components/ui/error-state.tsx — t4 consumes)
// Rationale (stated once, centrally): components/ui/ contains only {button, popover, dialog,
// select, input, textarea, shimmer-box, error-state} — none of the five spec-named Shadcn
// primitives are installed, and installing raw Shadcn primitives collides with the FF7 Mako token
// system (memorized S2 gotcha: Shadcn defaults → invisible text). CR#1 disk-verified this
// substitution and ratified it — DRY + collision-avoidance, not a fidelity shortfall.

// "Short hover delay" per spec <states> card-hover — matches base-ui Popover's own OPEN_DELAY
// default (node_modules/@base-ui/react/popover/utils/constants.js) so no new magic number is
// invented. Keyboard focus opens the quick-peek immediately (no delay) since focus is already an
// explicit, deliberate user action.
const POPOVER_HOVER_DELAY_MS = 300;

// DESIGN.md Border Radius table: "Small elements (badges, chips, inputs)" = 6px = --radius-sm.
// No identically-named runtime CSS var exists for this size (StatBar precedent, t2). Single source
// in this file.
const ROLE_TAG_RADIUS_PX = '6px';

// StatBar fillToken mapping (packet requirement — documented once, consumed by the JSX below):
//   Activity → member.materiaColorKey   Stamina → '--mg' (success-semantic, DESIGN.md Color Tokens)
//   Accuracy → member.materiaColorKey
// normalized/reason for each bar are data-driven from member.stats (matched by label) — N/A is
// never special-cased per role here (server already encodes it via normalized: null + reason).
const STAT_FILL_TOKEN_STAMINA = '--mg';

export interface PartyMemberCardProps {
  member: PartyMember;
  onSelect: (code: string) => void;
}

function findStat(stats: PartyStatBar[], label: string): PartyStatBar | undefined {
  return stats.find((s) => s.label === label);
}

function statReadoutText(stat: PartyStatBar | undefined): string {
  if (!stat || stat.normalized === null) {
    return 'not applicable';
  }
  return `${stat.normalized}%`;
}

// Pure, testable — the exact aria_requirements contract:
// "{agent code}, {role category}. Activity {n}%, Stamina {n}%, Accuracy {n}% or not applicable."
export function buildCardAriaLabel(member: PartyMember): string {
  const activity = findStat(member.stats, 'Activity');
  const stamina = findStat(member.stats, 'Stamina');
  const accuracy = findStat(member.stats, 'Accuracy');
  return (
    `${member.code}, ${member.roleCategory}. ` +
    `Activity ${statReadoutText(activity)}, ` +
    `Stamina ${statReadoutText(stamina)}, ` +
    `Accuracy ${statReadoutText(accuracy)}.`
  );
}

function formatAsOfDate(ts: string | null): string {
  if (ts === null) {
    return 'no recorded activity';
  }
  return new Date(ts).toLocaleString();
}

interface RoleTagProps {
  roleCategory: PartyMember['roleCategory'];
  materiaColorKey: string;
}

// Badge substitute (W2 mapping) — DESIGN.md "Role / type tag" Component Rule verbatim: color =
// materia token, background = materiaTint(token, 12), border = materiaTint(token, 25), no solid
// fill. Tints are imported from t2's single-source alpha-tint helper (amendment W1 dedup) — the
// underlying CSS mixing function is not re-inlined anywhere in this file.
function RoleTag({ roleCategory, materiaColorKey }: RoleTagProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '12px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: ROLE_TAG_RADIUS_PX,
        color: `var(${materiaColorKey})`,
        background: materiaTint(materiaColorKey, 12),
        border: `1px solid ${materiaTint(materiaColorKey, 25)}`,
      }}
    >
      {roleCategory}
    </span>
  );
}

export default function PartyMemberCard({ member, onSelect }: PartyMemberCardProps) {
  const [isPeeking, setIsPeeking] = useState(false);
  const [isBordered, setIsBordered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  function handleMouseEnter() {
    setIsBordered(true);
    hoverTimeoutRef.current = setTimeout(() => setIsPeeking(true), POPOVER_HOVER_DELAY_MS);
  }

  function handleMouseLeave() {
    setIsBordered(false);
    if (hoverTimeoutRef.current !== null) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsPeeking(false);
  }

  function handleFocus() {
    setIsBordered(true);
    setIsPeeking(true);
  }

  function handleBlur() {
    setIsBordered(false);
    setIsPeeking(false);
  }

  function handleClick() {
    onSelect(member.code);
  }

  const activity = findStat(member.stats, 'Activity');
  const stamina = findStat(member.stats, 'Stamina');
  const accuracy = findStat(member.stats, 'Accuracy');

  return (
    <Popover open={isPeeking}>
      <PopoverTrigger
        className={cn('tab-item flex w-full flex-col gap-3 text-left')}
        aria-label={buildCardAriaLabel(member)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        style={{
          padding: '16px',
          background: 'var(--sf)',
          border: `1px solid ${isBordered ? 'var(--bdb)' : 'var(--bd)'}`,
          borderRadius: 'var(--radius)',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
      >
        <PortraitFrame code={member.code} materiaColorKey={member.materiaColorKey} portraitSeed={member.portraitSeed} />
        <div className="flex items-center justify-between gap-2">
          <span style={{ fontFamily: 'var(--fm)', fontSize: '16px', color: 'var(--w)' }}>{member.code}</span>
          <RoleTag roleCategory={member.roleCategory} materiaColorKey={member.materiaColorKey} />
        </div>
        <div className="flex flex-col gap-2">
          <StatBar label="Activity" normalized={activity?.normalized ?? null} fillToken={member.materiaColorKey} reason={activity?.reason} />
          <StatBar label="Stamina" normalized={stamina?.normalized ?? null} fillToken={STAT_FILL_TOKEN_STAMINA} reason={stamina?.reason} />
          <StatBar label="Accuracy" normalized={accuracy?.normalized ?? null} fillToken={member.materiaColorKey} reason={accuracy?.reason} />
        </div>
      </PopoverTrigger>
      <PopoverContent
        style={{
          background: 'var(--sfm)',
          border: '1px solid var(--bdb)',
          borderRadius: 'var(--rl)',
          padding: '10px 12px',
          minWidth: '200px',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--wm)',
            margin: '0 0 6px 0',
          }}
        >
          As of {formatAsOfDate(member.lastActivityTs)}
        </p>
        <div className="flex flex-col gap-1">
          {member.stats.map((stat) => (
            <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--wd)' }}>{stat.label}</span>
              <span style={{ fontSize: '12px', color: 'var(--w)' }}>{stat.raw === null ? 'N/A' : stat.raw}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
