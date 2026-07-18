import { describe, it, expect } from 'vitest';
import { bufferReducer, INITIAL_BUFFER, targetKey, type ReviseTarget } from '../revise-spec-buffer';

// Tests the extracted pure buffer reducer, not a rendered component — vitest.config.ts is
// `environment: 'node'` (no jsdom, glob excludes `.test.tsx`), matching the project convention
// (see PartyMemberCard.test.ts). This is the exact mechanism ReviseSpecAction.tsx wires into a
// useReducer to satisfy SC3's buffer-contamination regression guard.

const AGENT_A: ReviseTarget = { type: 'agent', name: 'FE' };
const AGENT_B: ReviseTarget = { type: 'agent', name: 'BE' };
const SKILL_X: ReviseTarget = { type: 'skill', name: 'after-action' };

describe('targetKey', () => {
  it('is stable per type+name pair and distinguishes agent from skill of the same name', () => {
    expect(targetKey(AGENT_A)).toBe('agent:FE');
    expect(targetKey({ type: 'skill', name: 'FE' })).toBe('skill:FE');
  });
});

describe('bufferReducer — A -> B switch (SC3 contamination guard)', () => {
  it('open A, load content, type text, switch to B: B never carries A\'s typed text', () => {
    let state = INITIAL_BUFFER;
    state = bufferReducer(state, { type: 'TARGET_CHANGED', key: targetKey(AGENT_A) });
    state = bufferReducer(state, { type: 'CONTENT_LOADED', key: targetKey(AGENT_A), content: 'A original spec' });
    state = bufferReducer(state, { type: 'CONTENT_EDITED', key: targetKey(AGENT_A), content: 'A original spec + typed junk' });
    expect(state.content).toBe('A original spec + typed junk');

    // Switch target to B — the buffer MUST reset, not carry the edited A content forward.
    state = bufferReducer(state, { type: 'TARGET_CHANGED', key: targetKey(AGENT_B) });
    expect(state.content).toBe('');
    expect(state.content).not.toContain('typed junk');
    expect(state.targetKey).toBe(targetKey(AGENT_B));

    state = bufferReducer(state, { type: 'CONTENT_LOADED', key: targetKey(AGENT_B), content: 'B original spec' });
    expect(state.content).toBe('B original spec');
    expect(state.content).not.toContain('typed junk');
  });

  it('TARGET_CHANGED to the same key is a no-op (does not wipe in-progress edits)', () => {
    let state = bufferReducer(INITIAL_BUFFER, { type: 'TARGET_CHANGED', key: targetKey(AGENT_A) });
    state = bufferReducer(state, { type: 'CONTENT_EDITED', key: targetKey(AGENT_A), content: 'mid-edit' });
    const before = state;
    state = bufferReducer(state, { type: 'TARGET_CHANGED', key: targetKey(AGENT_A) });
    expect(state).toBe(before);
    expect(state.content).toBe('mid-edit');
  });

  it('a stale CONTENT_LOADED for a target already left is dropped, not merged', () => {
    let state = bufferReducer(INITIAL_BUFFER, { type: 'TARGET_CHANGED', key: targetKey(AGENT_A) });
    state = bufferReducer(state, { type: 'TARGET_CHANGED', key: targetKey(AGENT_B) }); // user switched before A's query resolved
    const beforeStaleLoad = state;
    // A's slow agent.get finally resolves and dispatches CONTENT_LOADED for A — must be dropped.
    state = bufferReducer(state, { type: 'CONTENT_LOADED', key: targetKey(AGENT_A), content: 'late A content' });
    expect(state).toBe(beforeStaleLoad);
    expect(state.content).not.toBe('late A content');
  });

  it('a stray CONTENT_EDITED for a target already left is dropped, not merged', () => {
    let state = bufferReducer(INITIAL_BUFFER, { type: 'TARGET_CHANGED', key: targetKey(AGENT_A) });
    state = bufferReducer(state, { type: 'TARGET_CHANGED', key: targetKey(SKILL_X) });
    const beforeStrayEdit = state;
    state = bufferReducer(state, { type: 'CONTENT_EDITED', key: targetKey(AGENT_A), content: 'stray keystroke for A' });
    expect(state).toBe(beforeStrayEdit);
  });

  it('isDirty tracks divergence from the last loaded content, per target', () => {
    let state = bufferReducer(INITIAL_BUFFER, { type: 'TARGET_CHANGED', key: targetKey(AGENT_A) });
    state = bufferReducer(state, { type: 'CONTENT_LOADED', key: targetKey(AGENT_A), content: 'baseline' });
    expect(state.isDirty).toBe(false);
    state = bufferReducer(state, { type: 'CONTENT_EDITED', key: targetKey(AGENT_A), content: 'baseline + change' });
    expect(state.isDirty).toBe(true);
    state = bufferReducer(state, { type: 'CONTENT_EDITED', key: targetKey(AGENT_A), content: 'baseline' });
    expect(state.isDirty).toBe(false);
  });
});
