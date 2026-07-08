// StatBar — docs/v2-vision/v2-design-spec.md <data_viz_modules> <new_pattern_proposal name="StatBar">.
//
// Spec-primitive→substitute mapping (amendment W2, Critic-RATIFIED, not a fidelity deviation):
//   Card     → PartyMemberCard  (t3, custom, FF7-tokened)
//   Badge    → RoleTag          (t3, custom, FF7-tokened)
//   Progress → StatBar          (THIS component — custom new_pattern_proposal)
//   Skeleton → shimmer-box      (existing components/ui/shimmer-box.tsx)
//   Alert    → error-state      (existing components/ui/error-state.tsx)
// Rationale (stated once, centrally): components/ui/ contains only {button, popover, dialog,
// select, input, textarea, shimmer-box, error-state} — none of the five spec-named Shadcn
// primitives are installed, and installing raw Shadcn primitives collides with the FF7 Mako token
// system (memorized S2 gotcha: Shadcn defaults → invisible text). CR#1 disk-verified this
// substitution and ratified it — DRY + collision-avoidance, not a fidelity shortfall.
//
// StatBar itself IS the Progress replacement — no Shadcn <Progress> import here.

const STAT_BAR_TRACK_HEIGHT_PX = '6px';
// DESIGN.md Border Radius table: "Small elements (badges, chips, inputs)" = 6px = --radius-sm.
// No identically-named runtime CSS var exists for this size (unlike --radius-md, which Decision
// Record A explicitly maps to the runtime --radius). Literal value, single source in this file.
const STAT_BAR_TRACK_RADIUS_PX = '6px';
const STAT_BAR_LABEL_FONT_SIZE_PX = '12px'; // DESIGN.md type scale: sm

export interface StatBarProps {
  label: string;
  normalized: number | null;
  fillToken: string;
  valueLabel?: string;
  reason?: string;
}

export interface StatBarViewModel {
  widthPct: number;
  ariaValueNow: number | undefined;
  ariaLabel: string;
  readout: string;
  isNotApplicable: boolean;
}

// Pure, testable derivation — the actual pattern-spec contract (statbar-not-applicable state +
// StatBar Accessibility Contract) lives here rather than in JSX, so it can be unit-tested without
// a DOM/rendering harness (this repo's vitest config is `environment: 'node'` with no
// @testing-library/react dependency — verified before writing the colocated test).
export function computeStatBarViewModel({
  label,
  normalized,
  valueLabel,
  reason,
}: Pick<StatBarProps, 'label' | 'normalized' | 'valueLabel' | 'reason'>): StatBarViewModel {
  if (normalized === null) {
    const reasonText = reason ?? 'reason not provided';
    return {
      widthPct: 0,
      ariaValueNow: undefined,
      ariaLabel: `${label}: not applicable, ${reasonText}`,
      readout: `N/A — ${reasonText}`,
      isNotApplicable: true,
    };
  }
  return {
    widthPct: normalized,
    ariaValueNow: normalized,
    ariaLabel: `${label}: ${normalized}%`,
    readout: valueLabel ?? `${normalized}%`,
    isNotApplicable: false,
  };
}

export default function StatBar({ label, normalized, fillToken, valueLabel, reason }: StatBarProps) {
  const vm = computeStatBarViewModel({ label, normalized, valueLabel, reason });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: STAT_BAR_LABEL_FONT_SIZE_PX, color: 'var(--wd)' }}>{label}</span>
        <span
          style={{
            fontSize: STAT_BAR_LABEL_FONT_SIZE_PX,
            color: vm.isNotApplicable ? 'var(--wm)' : 'var(--w)',
          }}
        >
          {vm.readout}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={vm.ariaValueNow}
        aria-label={vm.ariaLabel}
        style={{
          width: '100%',
          height: STAT_BAR_TRACK_HEIGHT_PX,
          borderRadius: STAT_BAR_TRACK_RADIUS_PX,
          background: 'var(--sfh)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${vm.widthPct}%`,
            height: '100%',
            background: `var(${fillToken})`,
          }}
        />
      </div>
    </div>
  );
}
