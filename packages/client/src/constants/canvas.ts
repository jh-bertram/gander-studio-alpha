// ─────────────────────────────────────────────────────────────────────────────
// Canvas constants — all magic values for the Materia Canvas live here.
// Do NOT add functions or color helpers here; use getMateriaColor from compose.ts.
// ─────────────────────────────────────────────────────────────────────────────

// Orb dimensions
export const ORB_SIZE_PX = 56;                        // default orb diameter
export const ORB_SIZE_ORCHESTRATOR_PX = 68;           // orchestrator is 20% larger
export const ORB_LABEL_OFFSET_PX = 10;                // gap between orb bottom and label top

// Proximity linking
export const CANVAS_PROXIMITY_THRESHOLD_PX = 60;      // max center-to-center px for drop-on-top link

// Edge styling
export const EDGE_STROKE_COLOR = 'var(--mt)';
export const EDGE_STROKE_WIDTH = 2;
export const EDGE_GLOW = '0 0 6px rgba(84,153,181,0.5)';  // teal glow — matches --gt family
export const EDGE_FILTER = 'drop-shadow(0px 0px 4px var(--bdb))';

// Canvas layout radii (must match canvas-store.ts values — keep in sync)
export const AGENT_RING_RADIUS_PX = 220;
export const SKILL_RING_RADIUS_PX = 380;

// Z-indexes
export const Z_CANVAS_NODE = 10;
export const Z_CANVAS_EDGE = 5;
export const Z_PALETTE = 20;

// Palette
export const PALETTE_WIDTH_PX = 200;
export const PALETTE_SEARCH_DEBOUNCE_MS = 150;

// ─────────────────────────────────────────────────────────────────────────────
// Glassy orb gradient stops
// ─────────────────────────────────────────────────────────────────────────────
export const ORB_GRADIENT_LIGHT_STOP = '0%';
export const ORB_GRADIENT_MID_STOP = '40%';
export const ORB_GRADIENT_DARK_STOP = '72%';
export const ORB_GRADIENT_DEEPEST_STOP = '100%';

// Specular highlight child div
export const ORB_HIGHLIGHT_TOP_PX = 8;
export const ORB_HIGHLIGHT_LEFT_PX = 8;
// rgba white values are approved exceptions: encoding --w with per-stop opacity
// for gradient stops; var(--w) cannot carry per-stop opacity inside a gradient.
export const ORB_HIGHLIGHT_GRADIENT =
  'radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.00) 100%)';

// Box-shadow numeric values
export const ORB_SHADOW_RIM_BLUR_PX = 10;
export const ORB_SHADOW_RIM_SPREAD_PX = 2;
export const ORB_SHADOW_AMBIENT_BLUR_PX = 20;
export const ORB_SHADOW_AMBIENT_SPREAD_PX = 4;
export const ORB_SHADOW_INSET_BLOOM_BLUR_PX = 8;
export const ORB_SHADOW_INSET_BLOOM_OPACITY = 0.22;
export const ORB_SHADOW_INSET_DEPTH_BLUR_PX = 10;
export const ORB_SHADOW_INSET_DEPTH_OPACITY = 0.55;

// Orchestrator outer rim box-shadow — encodes --my (#e8c840 = rgb(232,200,64)) with opacity.
// rgba inline is an approved exception: directly encoding --my with per-layer opacity.
export const ORB_SHADOW_ORC_RIM_1 = '0 0 10px 2px rgba(232,200,64,0.65)';
export const ORB_SHADOW_ORC_RIM_2 = '0 0 22px 6px rgba(232,200,64,0.25)';

// Hover state
export const ORB_HOVER_TRANSITION_MS = 150;
export const ORB_HOVER_RIM_SPREAD_PX = 4;
export const ORB_HOVER_AMBIENT_SPREAD_PX = 6;

// ─────────────────────────────────────────────────────────────────────────────
// Surface 2 — Magnetic Snap animation timing
// ─────────────────────────────────────────────────────────────────────────────
export const ORB_ATTRACT_DURATION_MS = 320;
export const ORB_ATTRACT_RELEASE_MS = 400;
export const ORB_ATTRACT_SCALE_PEAK = 1.08;
export const ORB_ATTRACT_TRANSLATE_PX = 8;
export const ORB_ATTRACT_SHADOW_BLUR_1 = 16;
export const ORB_ATTRACT_SHADOW_SPREAD_1 = 5;
export const ORB_ATTRACT_SHADOW_BLUR_2 = 32;
export const ORB_ATTRACT_SHADOW_SPREAD_2 = 8;

// Surface 2 — Attract keyframe intermediate stop (65%)
export const ORB_ATTRACT_SCALE_MID = 1.06;
export const ORB_ATTRACT_TRANSLATE_MID_PX = 6;

// Surface 3 — Link Flash animation timing
export const ORB_LINK_FLASH_DURATION_MS = 350;
export const ORB_LINK_FLASH_BUFFER_MS = 50;  // total: 400ms before applying .orb-linked

// Link flash glow blur/spread per keyframe stop
export const ORB_LINK_FLASH_GLOW_15_BLUR = 28;
export const ORB_LINK_FLASH_GLOW_15_SPREAD = 10;
export const ORB_LINK_FLASH_GLOW_45_BLUR = 20;
export const ORB_LINK_FLASH_GLOW_45_SPREAD = 6;
export const ORB_LINK_FLASH_GLOW_100_BLUR = 14;
export const ORB_LINK_FLASH_GLOW_100_SPREAD = 3;

// Link flash ring widths (border ring at each keyframe stop)
export const ORB_LINK_FLASH_RING_15_PX = 3;
export const ORB_LINK_FLASH_RING_45_PX = 2;
export const ORB_LINK_FLASH_RING_100_PX = 2;

// Inset shadow offsets (x, y in px)
export const ORB_SHADOW_INSET_BLOOM_X = 2;
export const ORB_SHADOW_INSET_BLOOM_Y = 3;
export const ORB_SHADOW_INSET_DEPTH_X = -3;
export const ORB_SHADOW_INSET_DEPTH_Y = -4;

// ─────────────────────────────────────────────────────────────────────────────
// Surface 5 — Sound parameters (Web Audio)
// ─────────────────────────────────────────────────────────────────────────────

// Approach tone
export const APPROACH_OSC_TYPE: OscillatorType = 'sine';
export const APPROACH_FREQ_HZ = 220;
export const APPROACH_GAIN_ATTACK_MS = 40;
export const APPROACH_GAIN_SUSTAIN = 0.12;
export const APPROACH_GAIN_RELEASE_MS = 80;
export const APPROACH_FILTER_CUTOFF_HZ = 600;

// Ker-chink link tone (primary)
export const LINK_PRIMARY_OSC_TYPE: OscillatorType = 'triangle';
export const LINK_PRIMARY_FREQ_HZ = 880;
export const LINK_PRIMARY_GAIN_ATTACK_MS = 2;
export const LINK_PRIMARY_GAIN_PEAK = 0.55;
export const LINK_PRIMARY_GAIN_DECAY_MS = 80;
export const LINK_PRIMARY_GAIN_SUSTAIN = 0.18;
export const LINK_PRIMARY_GAIN_RELEASE_MS = 420;

// Ker-chink link tone (secondary / harmonic)
export const LINK_SECONDARY_OSC_TYPE: OscillatorType = 'sine';
export const LINK_SECONDARY_FREQ_HZ = 1320;
export const LINK_SECONDARY_GAIN_ATTACK_MS = 2;
export const LINK_SECONDARY_GAIN_PEAK = 0.22;
export const LINK_SECONDARY_GAIN_DECAY_MS = 40;
export const LINK_SECONDARY_GAIN_SUSTAIN = 0.06;
export const LINK_SECONDARY_GAIN_RELEASE_MS = 280;

// Cleanup
export const LINK_CLEANUP_AFTER_MS = 900;

// ─────────────────────────────────────────────────────────────────────────────
// Surface 4 — LoadoutListPanel
// ─────────────────────────────────────────────────────────────────────────────
export const LIST_PANEL_WIDTH_PX = 240;
export const LIST_ROW_MIN_HEIGHT_PX = 32;
export const LIST_ROW_PADDING_BLOCK_PX = 6;
export const LIST_ROW_PADDING_INLINE_PX = 8;
export const LIST_ROW_GAP_PX = 8;
export const LIST_ROW_BORDER_RADIUS_PX = 4;
export const LIST_ROW_MARGIN_BOTTOM_PX = 2;
export const LIST_DOT_SIZE_PX = 10;
export const LIST_HEADING_FONT_SIZE_PX = 10;
export const LIST_HEADING_MARGIN_BOTTOM_PX = 8;
export const LIST_NAME_FONT_SIZE_PX = 12;
export const LIST_CONNECTION_FONT_SIZE_PX = 10;
export const LIST_CONNECTION_PADDING_LEFT_PX = 18;
export const LIST_CONNECTION_MARGIN_TOP_PX = 2;
export const LIST_CHILD_INDENT_PX = 24;
export const LIST_EMPTY_FONT_SIZE_PX = 11;
export const LIST_EMPTY_PADDING_PX = 8;
export const LIST_TRANSITION_DURATION_MS = 100;

// ─────────────────────────────────────────────────────────────────────────────
// Surface 6 — Agent Card dimensions
// ─────────────────────────────────────────────────────────────────────────────
export const CARD_WIDTH_PX = 900;
export const CARD_HEIGHT_PX = 700;
export const CARD_HEADER_HEIGHT_PX = 36;
export const CARD_BORDER_RADIUS_PX = 8;
