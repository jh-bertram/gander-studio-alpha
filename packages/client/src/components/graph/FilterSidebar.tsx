import React from 'react';
import { NODE_TYPE_COLORS, NODE_TYPES_LIST, EDGE_TYPES_LIST } from '../../constants/graph';

interface FilterSidebarProps {
  nodeFilters: Set<string>;
  edgeFilters: Set<string>;
  onToggleNode: (nodeType: string) => void;
  onToggleEdge: (edgeType: string) => void;
  onReset: () => void;
}

const SECTION_HEADER_STYLE: React.CSSProperties = {
  fontFamily: 'var(--fh)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  color: 'var(--mt)',
  textTransform: 'uppercase',
  marginBottom: '8px',
  paddingBottom: '4px',
  borderBottom: '1px solid var(--bd)',
};

const TOGGLE_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 6px',
  borderRadius: 'var(--r)',
  cursor: 'pointer',
  transition: 'background 0.12s',
};

/**
 * Filter sidebar for the Graph page.
 * 7 node-type toggles + 9 edge-type toggles + DETECTED/INFERRED legend + reset.
 * No Shadcn primitives — plain HTML elements with explicit FF7 Mako CSS tokens.
 *
 * Edge types rendered (all 9, from EDGE_TYPES_LIST):
 *   spawns
 *   references_skill
 *   invokes_skill
 *   triggers_hook
 *   imports_ref
 *   improves_agent
 *   improves_skill
 *   evaluated_by
 *   communicates_with
 */
export default function FilterSidebar({
  nodeFilters,
  edgeFilters,
  onToggleNode,
  onToggleEdge,
  onReset,
}: FilterSidebarProps): React.ReactElement {
  const allEnabled =
    NODE_TYPES_LIST.every((t) => nodeFilters.has(t)) &&
    EDGE_TYPES_LIST.every((t) => edgeFilters.has(t));

  return (
    <aside
      role="complementary"
      aria-label="Graph filters"
      style={{
        width: '232px',
        flexShrink: 0,
        height: '100%',
        overflowY: 'auto',
        background: 'var(--sf)',
        borderLeft: '1px solid var(--bd)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* NODE TYPES section */}
      <section role="group" aria-labelledby="node-types-heading">
        <h3 id="node-types-heading" style={SECTION_HEADER_STYLE}>
          Node Types
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {NODE_TYPES_LIST.map((nodeType) => {
            const checked = nodeFilters.has(nodeType);
            return (
              <label
                key={nodeType}
                style={{
                  ...TOGGLE_ROW_STYLE,
                  color: checked ? 'var(--w)' : 'var(--wm)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.background = 'var(--nav-active-bg)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.background = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleNode(nodeType)}
                  aria-label={`Toggle ${nodeType} nodes`}
                  style={{
                    accentColor: 'var(--mt)',
                    width: '14px',
                    height: '14px',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                />
                {/* Colored dot */}
                <span
                  aria-hidden="true"
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: NODE_TYPE_COLORS[nodeType] ?? 'var(--mt)',
                    boxShadow: '0 0 5px currentColor',
                    flexShrink: 0,
                    opacity: checked ? 1 : 0.4,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--fb)',
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {nodeType}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* EDGE TYPES section */}
      <section
        role="group"
        aria-labelledby="edge-types-heading"
        style={{ marginTop: '16px' }}
      >
        <h3 id="edge-types-heading" style={SECTION_HEADER_STYLE}>
          Edge Types
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {EDGE_TYPES_LIST.map((edgeType) => {
            const checked = edgeFilters.has(edgeType);
            return (
              <label
                key={edgeType}
                style={{
                  ...TOGGLE_ROW_STYLE,
                  color: checked ? 'var(--w)' : 'var(--wm)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.background = 'var(--nav-active-bg)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.background = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleEdge(edgeType)}
                  aria-label={`Toggle ${edgeType} edges`}
                  style={{
                    accentColor: 'var(--mt)',
                    width: '14px',
                    height: '14px',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--fb)',
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {edgeType}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* CONFIDENCE legend */}
      <section aria-labelledby="confidence-heading" style={{ marginTop: '16px' }}>
        <h3 id="confidence-heading" style={SECTION_HEADER_STYLE}>
          Confidence
        </h3>
        {/* DETECTED row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 0',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: '24px',
              height: '2px',
              background: 'var(--mt)',
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--fb)',
                fontSize: '11px',
                color: 'var(--w)',
              }}
            >
              DETECTED
            </div>
            <div
              style={{
                fontFamily: 'var(--fb)',
                fontSize: '10px',
                color: 'var(--wm)',
              }}
            >
              confirmed source match
            </div>
          </div>
        </div>
        {/* INFERRED row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 0',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: '24px',
              height: '0',
              borderTop: '2px dashed var(--mt)',
              opacity: 0.5,
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--fb)',
                fontSize: '11px',
                color: 'var(--wd)',
              }}
            >
              INFERRED
            </div>
            <div
              style={{
                fontFamily: 'var(--fb)',
                fontSize: '10px',
                color: 'var(--wm)',
              }}
            >
              heuristic estimate
            </div>
          </div>
        </div>
      </section>

      {/* RESET FILTERS button */}
      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset all filters to default"
          aria-disabled={allEnabled}
          disabled={allEnabled}
          style={{
            width: '100%',
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid var(--mtd)',
            borderRadius: 'var(--r)',
            color: 'var(--mt)',
            fontFamily: 'var(--fb)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: allEnabled ? 'default' : 'pointer',
            opacity: allEnabled ? 0.38 : 1,
            pointerEvents: allEnabled ? 'none' : 'auto',
          }}
          onMouseEnter={(e) => {
            if (!allEnabled) {
              const btn = e.currentTarget;
              btn.style.background = 'var(--nav-active-bg)';
              btn.style.borderColor = 'var(--mt)';
              btn.style.color = 'var(--w)';
            }
          }}
          onMouseLeave={(e) => {
            if (!allEnabled) {
              const btn = e.currentTarget;
              btn.style.background = 'transparent';
              btn.style.borderColor = 'var(--mtd)';
              btn.style.color = 'var(--mt)';
            }
          }}
        >
          Reset Filters
        </button>
      </div>
    </aside>
  );
}
