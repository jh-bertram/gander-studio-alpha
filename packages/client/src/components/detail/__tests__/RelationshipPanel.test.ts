import { describe, it, expect } from 'vitest';
import { formatTargetLabel, computeStarLayout, buildRelationshipGraph } from '../RelationshipPanel';
import type { RelationshipEdge } from '@gander-studio/shared';

// Tests the extracted pure helpers, not a rendered component — this repo's vitest.config.ts is
// `environment: 'node'` (no jsdom), and React Flow requires a DOM/canvas runtime it doesn't
// provide, so RelationshipPanel's JSX/RF-canvas rendering is exercised by the t5 Playwright e2e
// spec instead. formatTargetLabel/computeStarLayout/buildRelationshipGraph are the exact
// mechanical source of every node/edge RF renders — verifying them here is equivalent to
// verifying the graph-shape output (SC(a): edge count == relationships.length, never hardcoded).

describe('formatTargetLabel', () => {
  it('derives a basename and strips a known spec extension', () => {
    expect(formatTargetLabel('.claude/agents/pm.md')).toBe('pm');
  });

  it('strips ts/tsx/json extensions too', () => {
    expect(formatTargetLabel('packages/client/src/foo.tsx')).toBe('foo');
    expect(formatTargetLabel('a/b/c.json')).toBe('c');
  });

  it('falls back to the raw string when there is no separator or extension', () => {
    expect(formatTargetLabel('orchestrator')).toBe('orchestrator');
  });

  it('handles an empty string without throwing', () => {
    expect(formatTargetLabel('')).toBe('');
  });
});

describe('computeStarLayout', () => {
  it('zero targets: center sits at y=0 (no fan)', () => {
    const layout = computeStarLayout(0);
    expect(layout.center).toEqual({ x: 0, y: 0 });
    expect(layout.targets).toHaveLength(0);
  });

  it('N targets: center is vertically mid-way against the leaf column, one position per target', () => {
    const layout = computeStarLayout(3);
    expect(layout.targets).toHaveLength(3);
    expect(layout.center.y).toBe((layout.targets[2]?.y ?? 0) / 2);
    // every target shares the same x (single-column LR fan)
    const xs = new Set(layout.targets.map((t) => t.x));
    expect(xs.size).toBe(1);
  });
});

describe('buildRelationshipGraph', () => {
  const relationships: RelationshipEdge[] = [
    { target: '.claude/agents/pm.md', edgeType: 'spawns', confidence: 'DETECTED' },
    { target: '.claude/agents/critic.md', edgeType: 'communicates_with', confidence: 'INFERRED' },
  ];

  it('one center node + one node per relationships[] entry (not deduped by target)', () => {
    const { nodes } = buildRelationshipGraph('ORC', relationships);
    expect(nodes).toHaveLength(relationships.length + 1);
    expect(nodes[0]?.data.kind).toBe('center');
    expect(nodes[0]?.data.label).toBe('ORC');
    expect(nodes.filter((n) => n.data.kind === 'target')).toHaveLength(relationships.length);
  });

  it('edge count always equals relationships.length — never hardcoded', () => {
    const { edges } = buildRelationshipGraph('ORC', relationships);
    expect(edges).toHaveLength(relationships.length);
  });

  it('zero relationships → zero edges, only the center node', () => {
    const { nodes, edges } = buildRelationshipGraph('ORC', []);
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
  });

  it('DETECTED vs INFERRED edges carry visually distinguishable style (solid vs dashed)', () => {
    const { edges } = buildRelationshipGraph('ORC', relationships);
    const detected = edges[0];
    const inferred = edges[1];
    expect((detected?.style as Record<string, unknown> | undefined)?.strokeDasharray).toBeUndefined();
    expect((inferred?.style as Record<string, unknown> | undefined)?.strokeDasharray).toBe('5,5');
  });

  it('every edge references an existing source/target node id', () => {
    const { nodes, edges } = buildRelationshipGraph('ORC', relationships);
    const ids = new Set(nodes.map((n) => n.id));
    for (const edge of edges) {
      expect(ids.has(edge.source)).toBe(true);
      expect(ids.has(edge.target)).toBe(true);
    }
  });
});
