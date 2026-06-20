// ─────────────────────────────────────────────────────────────────────────────
// useLinkSound — module-level Web Audio functions for Materia Canvas proximity
// and link events. Not a React hook; exported as plain functions.
//
// Lifecycle (per researcher dossier 003-RA):
//   - Single AudioContext, lazily created on first call after user gesture.
//   - Approach tone: single looping oscillator while proximity is active.
//   - Link tone: two-oscillator chord (primary + secondary) with ADSR, fire and forget.
//
// AudioContext sticky activation: AudioContext.resume() is called in
// ensureAudioContext(). The caller (MateriaCanvas) must call playApproach()
// inside an onMouseDown handler so the browser grants the audio policy unlock.
// Subsequent calls (mousemove, drag) will play immediately.
//
// s4-p1 SUPPRESSION FOUNDATION:
//   All audio functions gate on useUIStore.getState().muted at call-time.
//   Function signatures are UNCHANGED — existing callers (MateriaCanvas) are
//   not affected; they simply hear silence when muted.
// ─────────────────────────────────────────────────────────────────────────────

import {
  APPROACH_OSC_TYPE,
  APPROACH_FREQ_HZ,
  APPROACH_GAIN_ATTACK_MS,
  APPROACH_GAIN_SUSTAIN,
  APPROACH_GAIN_RELEASE_MS,
  APPROACH_FILTER_CUTOFF_HZ,
  LINK_PRIMARY_OSC_TYPE,
  LINK_PRIMARY_FREQ_HZ,
  LINK_PRIMARY_GAIN_ATTACK_MS,
  LINK_PRIMARY_GAIN_PEAK,
  LINK_PRIMARY_GAIN_DECAY_MS,
  LINK_PRIMARY_GAIN_SUSTAIN,
  LINK_PRIMARY_GAIN_RELEASE_MS,
  LINK_SECONDARY_OSC_TYPE,
  LINK_SECONDARY_FREQ_HZ,
  LINK_SECONDARY_GAIN_ATTACK_MS,
  LINK_SECONDARY_GAIN_PEAK,
  LINK_SECONDARY_GAIN_DECAY_MS,
  LINK_SECONDARY_GAIN_SUSTAIN,
  LINK_SECONDARY_GAIN_RELEASE_MS,
  LINK_CLEANUP_AFTER_MS,
  CHIME_ROOT_FREQ_HZ,
  CHIME_FIFTH_FREQ_HZ,
  CHIME_ROOT_OSC_TYPE,
  CHIME_FIFTH_OSC_TYPE,
  CHIME_ROOT_GAIN_PEAK,
  CHIME_FIFTH_GAIN_PEAK,
  CHIME_ATTACK_MS,
  CHIME_DECAY_MS,
  CHIME_SUSTAIN,
  CHIME_RELEASE_MS,
  CHIME_FIFTH_DELAY_MS,
  CHIME_CLEANUP_AFTER_MS,
  TICK_FREQ_HZ,
  TICK_OSC_TYPE,
  TICK_GAIN_PEAK,
  TICK_ATTACK_MS,
  TICK_RELEASE_MS,
  TICK_FILTER_CUTOFF_HZ,
  TICK_CLEANUP_AFTER_MS,
} from '../constants/canvas';
import { useUIStore } from '../store/ui-store';

// ─── Module-level audio state ─────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

// Approach oscillator refs — one active at a time
let approachOsc: OscillatorNode | null = null;
let approachGain: GainNode | null = null;
let approachFilter: BiquadFilterNode | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureAudioContext(): AudioContext {
  // SSR guard is handled at call-site, but defensive check here too
  if (audioCtx === null) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    // Non-blocking resume — future calls will play once resumed
    void audioCtx.resume();
  }
  return audioCtx;
}

// ─── playApproach ─────────────────────────────────────────────────────────────

/**
 * Start the approach tone (low-pass filtered sine). Idempotent — if the tone
 * is already playing, subsequent calls are a no-op. Must be called from a user
 * input handler to satisfy browser AudioContext activation policy.
 *
 * s4-p1: no-ops when muted. Signature unchanged.
 */
export function playApproach(): void {
  if (typeof window === 'undefined') return;
  // s4-p1 mute gate: read synchronously from store state (no subscription)
  if (useUIStore.getState().muted) return;

  const ctx = ensureAudioContext();

  // Already playing — don't restart
  if (approachOsc !== null) return;

  const osc = ctx.createOscillator();
  osc.type = APPROACH_OSC_TYPE;
  osc.frequency.setValueAtTime(APPROACH_FREQ_HZ, ctx.currentTime);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(APPROACH_FILTER_CUTOFF_HZ, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(
    APPROACH_GAIN_SUSTAIN,
    ctx.currentTime + APPROACH_GAIN_ATTACK_MS / 1000,
  );

  // Connect: osc → filter → gain → destination
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();

  approachOsc = osc;
  approachGain = gain;
  approachFilter = filter;

  osc.addEventListener('ended', () => {
    osc.disconnect();
    filter.disconnect();
    gain.disconnect();
    // Only null refs if they still point to this instance
    if (approachOsc === osc) approachOsc = null;
    if (approachGain === gain) approachGain = null;
    if (approachFilter === filter) approachFilter = null;
  });
}

// ─── stopApproach ─────────────────────────────────────────────────────────────

/**
 * Fade out and stop the approach tone with a click-free linear ramp.
 */
export function stopApproach(): void {
  if (typeof window === 'undefined') return;
  if (approachOsc === null || approachGain === null || audioCtx === null) return;

  const ctx = audioCtx;
  const osc = approachOsc;
  const gain = approachGain;

  const releaseEndSec = ctx.currentTime + APPROACH_GAIN_RELEASE_MS / 1000;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, releaseEndSec);

  // Stop slightly after the ramp completes to avoid click
  osc.stop(releaseEndSec + 0.020);

  // Null the approach refs immediately so playApproach() can restart
  approachOsc = null;
  approachGain = null;
  approachFilter = null;
}

// ─── playLink ─────────────────────────────────────────────────────────────────

/**
 * Fire-and-forget ker-chink link sound. Two-oscillator chord with full ADSR
 * envelopes. Creates fresh nodes per call; cleans up in 'ended' handlers and
 * a safety-net setTimeout at LINK_CLEANUP_AFTER_MS.
 *
 * s4-p1: no-ops when muted. Signature unchanged.
 */
export function playLink(): void {
  if (typeof window === 'undefined') return;
  // s4-p1 mute gate: read synchronously from store state (no subscription)
  if (useUIStore.getState().muted) return;

  const ctx = ensureAudioContext();
  const now = ctx.currentTime;

  // ── Primary oscillator (triangle 880 Hz) ────────────────────────────────
  const primaryOsc = ctx.createOscillator();
  primaryOsc.type = LINK_PRIMARY_OSC_TYPE;
  primaryOsc.frequency.setValueAtTime(LINK_PRIMARY_FREQ_HZ, now);

  const primaryGain = ctx.createGain();
  const primaryAttackEnd = now + LINK_PRIMARY_GAIN_ATTACK_MS / 1000;
  const primaryDecayEnd = primaryAttackEnd + LINK_PRIMARY_GAIN_DECAY_MS / 1000;
  const primaryReleaseEnd =
    primaryDecayEnd + LINK_PRIMARY_GAIN_RELEASE_MS / 1000;

  primaryGain.gain.setValueAtTime(0, now);
  primaryGain.gain.linearRampToValueAtTime(LINK_PRIMARY_GAIN_PEAK, primaryAttackEnd);
  primaryGain.gain.linearRampToValueAtTime(LINK_PRIMARY_GAIN_SUSTAIN, primaryDecayEnd);
  primaryGain.gain.linearRampToValueAtTime(0, primaryReleaseEnd);

  primaryOsc.connect(primaryGain);
  primaryGain.connect(ctx.destination);
  primaryOsc.start(now);
  primaryOsc.stop(primaryReleaseEnd + 0.010);

  primaryOsc.addEventListener('ended', () => {
    primaryOsc.disconnect();
    primaryGain.disconnect();
  });

  // ── Secondary oscillator (sine 1320 Hz) ─────────────────────────────────
  const secondaryOsc = ctx.createOscillator();
  secondaryOsc.type = LINK_SECONDARY_OSC_TYPE;
  secondaryOsc.frequency.setValueAtTime(LINK_SECONDARY_FREQ_HZ, now);

  const secondaryGain = ctx.createGain();
  const secondaryAttackEnd = now + LINK_SECONDARY_GAIN_ATTACK_MS / 1000;
  const secondaryDecayEnd = secondaryAttackEnd + LINK_SECONDARY_GAIN_DECAY_MS / 1000;
  const secondaryReleaseEnd =
    secondaryDecayEnd + LINK_SECONDARY_GAIN_RELEASE_MS / 1000;

  secondaryGain.gain.setValueAtTime(0, now);
  secondaryGain.gain.linearRampToValueAtTime(LINK_SECONDARY_GAIN_PEAK, secondaryAttackEnd);
  secondaryGain.gain.linearRampToValueAtTime(LINK_SECONDARY_GAIN_SUSTAIN, secondaryDecayEnd);
  secondaryGain.gain.linearRampToValueAtTime(0, secondaryReleaseEnd);

  secondaryOsc.connect(secondaryGain);
  secondaryGain.connect(ctx.destination);
  secondaryOsc.start(now);
  secondaryOsc.stop(secondaryReleaseEnd + 0.010);

  secondaryOsc.addEventListener('ended', () => {
    secondaryOsc.disconnect();
    secondaryGain.disconnect();
  });

  // ── Safety-net cleanup ───────────────────────────────────────────────────
  setTimeout(() => {
    try {
      primaryOsc.disconnect();
      primaryGain.disconnect();
    } catch {
      // Already disconnected — no-op
    }
    try {
      secondaryOsc.disconnect();
      secondaryGain.disconnect();
    } catch {
      // Already disconnected — no-op
    }
  }, LINK_CLEANUP_AFTER_MS);
}

// ─── playChime ────────────────────────────────────────────────────────────────

/**
 * Two-note ascending arpeggio (C5 + G5) for save/export success feedback.
 * Fire-and-forget. Gated by mute. Does not require a user gesture because
 * it is called from mutation callbacks (after the prior gesture that triggered
 * the save). If AudioContext is still suspended, the chime silently no-ops.
 *
 * s4-p6 wave-2: called from EditPage onSaveSuccess and ExportPage onSuccess.
 */
export function playChime(): void {
  if (typeof window === 'undefined') return;
  if (useUIStore.getState().muted) return;

  const ctx = ensureAudioContext();
  // If suspended (no prior gesture), skip silently — don't call resume() here
  // since we're not in a user input handler.
  if (ctx.state === 'suspended') return;

  const now = ctx.currentTime;

  // ── Root oscillator (sine C5) ────────────────────────────────────────────
  const rootOsc = ctx.createOscillator();
  rootOsc.type = CHIME_ROOT_OSC_TYPE;
  rootOsc.frequency.setValueAtTime(CHIME_ROOT_FREQ_HZ, now);

  const rootGain = ctx.createGain();
  const rootAttackEnd = now + CHIME_ATTACK_MS / 1000;
  const rootDecayEnd = rootAttackEnd + CHIME_DECAY_MS / 1000;
  const rootReleaseEnd = rootDecayEnd + CHIME_RELEASE_MS / 1000;

  rootGain.gain.setValueAtTime(0, now);
  rootGain.gain.linearRampToValueAtTime(CHIME_ROOT_GAIN_PEAK, rootAttackEnd);
  rootGain.gain.linearRampToValueAtTime(CHIME_SUSTAIN, rootDecayEnd);
  rootGain.gain.linearRampToValueAtTime(0, rootReleaseEnd);

  rootOsc.connect(rootGain);
  rootGain.connect(ctx.destination);
  rootOsc.start(now);
  rootOsc.stop(rootReleaseEnd + 0.010);

  rootOsc.addEventListener('ended', () => {
    rootOsc.disconnect();
    rootGain.disconnect();
  });

  // ── Fifth oscillator (triangle G5), delayed 80ms) ────────────────────────
  const fifthStartAt = now + CHIME_FIFTH_DELAY_MS / 1000;
  const fifthOsc = ctx.createOscillator();
  fifthOsc.type = CHIME_FIFTH_OSC_TYPE;
  fifthOsc.frequency.setValueAtTime(CHIME_FIFTH_FREQ_HZ, fifthStartAt);

  const fifthGain = ctx.createGain();
  const fifthAttackEnd = fifthStartAt + CHIME_ATTACK_MS / 1000;
  const fifthDecayEnd = fifthAttackEnd + CHIME_DECAY_MS / 1000;
  const fifthReleaseEnd = fifthDecayEnd + CHIME_RELEASE_MS / 1000;

  fifthGain.gain.setValueAtTime(0, fifthStartAt);
  fifthGain.gain.linearRampToValueAtTime(CHIME_FIFTH_GAIN_PEAK, fifthAttackEnd);
  fifthGain.gain.linearRampToValueAtTime(CHIME_SUSTAIN * 0.6, fifthDecayEnd);
  fifthGain.gain.linearRampToValueAtTime(0, fifthReleaseEnd);

  fifthOsc.connect(fifthGain);
  fifthGain.connect(ctx.destination);
  fifthOsc.start(fifthStartAt);
  fifthOsc.stop(fifthReleaseEnd + 0.010);

  fifthOsc.addEventListener('ended', () => {
    fifthOsc.disconnect();
    fifthGain.disconnect();
  });

  // ── Safety-net cleanup ───────────────────────────────────────────────────
  setTimeout(() => {
    try { rootOsc.disconnect(); rootGain.disconnect(); } catch { /* already gone */ }
    try { fifthOsc.disconnect(); fifthGain.disconnect(); } catch { /* already gone */ }
  }, CHIME_CLEANUP_AFTER_MS);
}

// ─── playTick ─────────────────────────────────────────────────────────────────

/**
 * Soft band-passed sine blip for UI state changes (e.g. GraphPage node hover,
 * filter toggles). Very quiet (gain peak 0.08). Gated by mute.
 * Fire-and-forget. Silently skips if AudioContext is suspended.
 *
 * s4-p6 wave-2: available for GraphPage and other interactive surfaces.
 */
export function playTick(): void {
  if (typeof window === 'undefined') return;
  if (useUIStore.getState().muted) return;

  const ctx = ensureAudioContext();
  if (ctx.state === 'suspended') return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = TICK_OSC_TYPE;
  osc.frequency.setValueAtTime(TICK_FREQ_HZ, now);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(TICK_FILTER_CUTOFF_HZ, now);

  const gain = ctx.createGain();
  const attackEnd = now + TICK_ATTACK_MS / 1000;
  const releaseEnd = attackEnd + TICK_RELEASE_MS / 1000;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(TICK_GAIN_PEAK, attackEnd);
  gain.gain.linearRampToValueAtTime(0, releaseEnd);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(releaseEnd + 0.010);

  osc.addEventListener('ended', () => {
    osc.disconnect();
    filter.disconnect();
    gain.disconnect();
  });

  // Safety-net cleanup
  setTimeout(() => {
    try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch { /* already gone */ }
  }, TICK_CLEANUP_AFTER_MS);
}
