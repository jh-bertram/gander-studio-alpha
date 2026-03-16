// ─────────────────────────────────────────────────────────────────────────────
// Export mode constants — all magic values live here, never inline in components
// ─────────────────────────────────────────────────────────────────────────────

// Duration of the "Exported ✓" success flash on the export button (ms)
export const EXPORT_SUCCESS_DURATION_MS = 2000;

// Target directory name validation pattern
export const TARGET_DIR_PATTERN = /^[a-zA-Z0-9_-]+$/;

// ─── Stat chip backgrounds ────────────────────────────────────────────────────
// Agents chip — var(--mg) green family
export const AGENTS_CHIP_BG = 'rgba(76,175,125,0.12)';
export const AGENTS_CHIP_BD = 'rgba(76,175,125,0.3)';

// Skills chip — var(--mb) blue family
export const SKILLS_CHIP_BG = 'rgba(74,144,217,0.12)';
export const SKILLS_CHIP_BD = 'rgba(74,144,217,0.3)';

// Hooks chip — var(--mo) orange family
export const HOOKS_CHIP_BG = 'rgba(232,145,77,0.12)';
export const HOOKS_CHIP_BD = 'rgba(232,145,77,0.3)';
