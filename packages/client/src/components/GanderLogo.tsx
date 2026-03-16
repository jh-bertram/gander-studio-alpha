export default function GanderLogo() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="26"
      height="26"
      aria-hidden="true"
      style={{ color: 'var(--mt)', display: 'block' }}
    >
      <polygon
        points="16,3 29,10 29,22 16,29 3,22 3,10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Spokes: center (16,16) to each vertex */}
      <line x1="16" y1="16" x2="16" y2="3" stroke="currentColor" strokeWidth="0.8" />
      <line x1="16" y1="16" x2="29" y2="10" stroke="currentColor" strokeWidth="0.8" />
      <line x1="16" y1="16" x2="29" y2="22" stroke="currentColor" strokeWidth="0.8" />
      <line x1="16" y1="16" x2="16" y2="29" stroke="currentColor" strokeWidth="0.8" />
      <line x1="16" y1="16" x2="3" y2="22" stroke="currentColor" strokeWidth="0.8" />
      <line x1="16" y1="16" x2="3" y2="10" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="16" cy="16" r="5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
