import type { CSSProperties, ReactElement } from 'react';

interface Props {
  /**
   * Style overrides applied on top of the shared shimmer base styles.
   * Callers supply layout-specific properties (height, width, borderRadius,
   * margin, flex, etc.); the shimmer gradient + animation are always applied.
   */
  style?: CSSProperties;
  /** Screen-reader label for the loading state. */
  srLabel?: string;
  className?: string;
  /** Additional aria/data attributes forwarded to the root div. */
  'aria-busy'?: boolean | 'true' | 'false';
  'data-testid'?: string;
}

const SHIMMER_BASE: CSSProperties = {
  background:     'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
  backgroundSize: '200% 100%',
  animation:      'shimmer 1.4s ease-in-out infinite',
};

/**
 * Single-sourced shimmer skeleton block.
 * Renders a div with the shared shimmer gradient + animation.
 * Callers supply layout-specific styles (height, width, borderRadius, etc.)
 * via the `style` prop — merged on top of SHIMMER_BASE.
 */
export default function ShimmerBox({
  style,
  srLabel,
  className,
  'aria-busy': ariaBusy,
  'data-testid': dataTestId,
}: Props): ReactElement {
  return (
    <div
      className={className}
      aria-busy={ariaBusy}
      data-testid={dataTestId}
      style={{ ...SHIMMER_BASE, ...style }}
    >
      {srLabel && <span className="sr-only">{srLabel}</span>}
    </div>
  );
}
