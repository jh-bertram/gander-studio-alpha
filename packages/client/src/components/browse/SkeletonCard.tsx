/** Loading placeholder — matches AgentCard height (~130px). */
export default function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="skeleton-shimmer"
      style={{
        background:   'var(--sfm)',
        border:       '1px solid var(--bd)',
        borderRadius: 'var(--rl)',
        height:       '130px',
      }}
    />
  );
}
