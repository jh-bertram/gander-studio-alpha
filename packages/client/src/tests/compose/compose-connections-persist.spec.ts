/**
 * compose-connections-persist.spec.ts
 *
 * Verifies that canvas connections (edges) survive a save/load round-trip.
 * These tests exercise the canvas-store directly — no browser required.
 * task_id: gander-studio-p2-canvas-link-001b
 */

import { test, expect } from '@playwright/test';
import { useCanvasStore, selectLoadoutPayload } from '../../store/canvas-store';

// Reset the store to initial state before each test.
test.beforeEach(() => {
  useCanvasStore.getState().resetCanvas();
});

test('loadFromLoadout with connections restores edges into canvas store', () => {
  useCanvasStore.getState().loadFromLoadout({
    name: 'test-loadout',
    agents: ['orchestrator', 'backend'],
    skills: ['dispatch-task'],
    hooks: [],
    connections: [
      { source: 'orchestrator', target: 'backend' },
      { source: 'backend', target: 'dispatch-task' },
    ],
    createdAt: new Date().toISOString(),
  });

  const state = useCanvasStore.getState();
  expect(state.edges).toHaveLength(2);
  expect(state.edges.some(e => e.source === 'orchestrator' && e.target === 'backend')).toBe(true);
  expect(state.edges.some(e => e.source === 'backend' && e.target === 'dispatch-task')).toBe(true);
});

test('selectLoadoutPayload returns connections matching the restored edges', () => {
  useCanvasStore.getState().loadFromLoadout({
    name: 'test-loadout',
    agents: ['orchestrator', 'backend'],
    skills: [],
    hooks: [],
    connections: [{ source: 'orchestrator', target: 'backend' }],
    createdAt: new Date().toISOString(),
  });

  const payload = selectLoadoutPayload(useCanvasStore.getState());
  expect(payload.connections).toHaveLength(1);
  expect(payload.connections[0]).toEqual({ source: 'orchestrator', target: 'backend' });
});

test('connections referencing missing nodes are silently skipped', () => {
  useCanvasStore.getState().loadFromLoadout({
    name: 'test-loadout',
    agents: ['orchestrator', 'backend'],
    skills: [],
    hooks: [],
    connections: [
      { source: 'orchestrator', target: 'backend' },
      { source: 'orchestrator', target: 'nonexistent-agent' }, // should be skipped
    ],
    createdAt: new Date().toISOString(),
  });

  const state = useCanvasStore.getState();
  expect(state.edges).toHaveLength(1);
  expect(state.edges[0]).toMatchObject({ source: 'orchestrator', target: 'backend' });
});
