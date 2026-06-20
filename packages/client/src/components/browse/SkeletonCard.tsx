/**
 * Loading placeholder — matches AgentCard height (~130px).
 * Uses .skeleton-shimmer class (defined in globals.css by s4-p1).
 * Inline `background` is intentionally omitted so the shimmer gradient
 * from the class can render; reduced-motion falls back to `background: var(--sfm)`
 * via the @media block in globals.css.
 */
export default function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="skeleton-shimmer"
      style={{
        border:       '1px solid var(--bd)',
        borderRadius: 'var(--rl)',
        height:       '130px',
      }}
    />
  );
}
