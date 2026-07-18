// prog-studio-v2-2026-07-s3-drilldowns-t3 — target-keyed editor buffer for ReviseSpecAction.
//
// CONTAMINATION GUARD (SC3, binding — the historical `useEditStore` cross-target buffer bug
// class this packet exists to regression-guard against): every action carries the `key` it was
// issued for. TARGET_CHANGED unconditionally wipes content to '' — it NEVER seeds the new
// buffer from the previous state, so agent A's typed text can never survive a switch to agent
// B by construction (not by convention). CONTENT_LOADED / CONTENT_EDITED additionally guard on
// `action.key === state.targetKey` before applying — a stale response (e.g. a slow agent.get
// resolving after the user already switched targets) or a stray edit event queued just before a
// target switch is silently dropped rather than merged into the live buffer. This reducer is a
// pure function specifically so the A->B lifecycle is unit-testable without rendering React
// (vitest.config.ts is `environment: 'node'`, no DOM — see __tests__/revise-spec-buffer.test.ts).

export interface ReviseTarget {
  type: 'agent' | 'skill';
  name: string;
}

export function targetKey(target: ReviseTarget): string {
  return `${target.type}:${target.name}`;
}

export interface BufferState {
  targetKey: string;
  content: string;
  loadedContent: string;
  isDirty: boolean;
}

export const INITIAL_BUFFER: BufferState = {
  targetKey: '',
  content: '',
  loadedContent: '',
  isDirty: false,
};

export type BufferAction =
  | { type: 'TARGET_CHANGED'; key: string }
  | { type: 'CONTENT_LOADED'; key: string; content: string }
  | { type: 'CONTENT_EDITED'; key: string; content: string };

export function bufferReducer(state: BufferState, action: BufferAction): BufferState {
  switch (action.type) {
    case 'TARGET_CHANGED':
      if (action.key === state.targetKey) return state;
      // Always reset to a blank buffer on target change — never carries the prior target's
      // content forward, structurally (no code path copies `state.content` here).
      return { targetKey: action.key, content: '', loadedContent: '', isDirty: false };

    case 'CONTENT_LOADED':
      if (action.key !== state.targetKey) return state; // stale load for a target we've left
      return { ...state, content: action.content, loadedContent: action.content, isDirty: false };

    case 'CONTENT_EDITED':
      if (action.key !== state.targetKey) return state; // stray edit after a target switch
      return { ...state, content: action.content, isDirty: action.content !== state.loadedContent };

    default:
      return state;
  }
}
