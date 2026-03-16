import { useBrowseStore, type TypeFilter, type TierFilter, type ModelFilter } from '../../store/browse-store';
import { SEGMENT_HOVER_BG } from '../../constants/browse';

// ---- Segment button primitives ----------------------------------------

interface SegmentProps<T extends string> {
  value:    T;
  current:  T;
  label:    string;
  disabled?: boolean;
  onSelect: (v: T) => void;
}

function Segment<T extends string>({ value, current, label, disabled = false, onSelect }: SegmentProps<T>) {
  const isActive = value === current;
  return (
    <button
      type="button"
      aria-pressed={isActive}
      disabled={disabled}
      onClick={() => onSelect(value)}
      style={{
        fontFamily:     'var(--fm)',
        fontSize:       '10px',
        letterSpacing:  '0.08em',
        padding:        '3px 9px',
        borderRadius:   'var(--r)',
        border:         'none',
        cursor:         disabled ? 'default' : 'pointer',
        background:     isActive ? 'var(--mt)' : 'transparent',
        color:          isActive ? 'var(--void)' : 'var(--wd)',
        fontWeight:     isActive ? 600 : 400,
        opacity:        disabled ? 0.35 : 1,
        pointerEvents:  disabled ? 'none' : 'auto',
        transition:     'background 0.12s, color 0.12s',
      }}
      onMouseEnter={(e) => {
        if (!isActive && !disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = SEGMENT_HOVER_BG;
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--w)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--wd)';
        }
      }}
      className="segment-btn"
    >
      {label}
    </button>
  );
}

// ---- SegmentGroup wrapper -----------------------------------------------

interface SegmentGroupProps {
  label:    string;
  disabled?: boolean;
  children: React.ReactNode;
}

function SegmentGroup({ label, disabled = false, children }: SegmentGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '2px',
        border:        '1px solid var(--bd)',
        borderRadius:  'var(--r)',
        padding:       '2px',
        opacity:       disabled ? 0.35 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {children}
    </div>
  );
}

// ---- FilterBar ----------------------------------------------------------

export default function FilterBar() {
  const {
    typeFilter,  setTypeFilter,
    tierFilter,  setTierFilter,
    modelFilter, setModelFilter,
    search,      setSearch,
  } = useBrowseStore();

  const agentsOnly = typeFilter === 'agents';

  return (
    <div
      role="search"
      aria-label="Browse filters"
      style={{
        display:    'flex',
        flexWrap:   'wrap',
        alignItems: 'center',
        gap:        '10px',
        marginBottom: '20px',
      }}
    >
      {/* Type filter */}
      <SegmentGroup label="Type filter">
        {(['all', 'agents', 'skills', 'hooks'] as TypeFilter[]).map((v) => (
          <Segment
            key={v}
            value={v}
            current={typeFilter}
            label={v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
            onSelect={setTypeFilter}
          />
        ))}
      </SegmentGroup>

      {/* Tier filter — only meaningful for agents */}
      <SegmentGroup label="Tier filter" disabled={!agentsOnly}>
        {(['all', 'core', 'impl', 'optional'] as TierFilter[]).map((v) => (
          <Segment
            key={v}
            value={v}
            current={tierFilter}
            label={v === 'all' ? 'All' : v}
            onSelect={setTierFilter}
            disabled={!agentsOnly}
          />
        ))}
      </SegmentGroup>

      {/* Model filter — only meaningful for agents */}
      <SegmentGroup label="Model filter" disabled={!agentsOnly}>
        {(['all', 'opus', 'sonnet', 'haiku'] as ModelFilter[]).map((v) => (
          <Segment
            key={v}
            value={v}
            current={modelFilter}
            label={v === 'all' ? 'All' : v}
            onSelect={setModelFilter}
            disabled={!agentsOnly}
          />
        ))}
      </SegmentGroup>

      {/* Search */}
      <input
        type="search"
        aria-label="Search agents, skills, and hooks"
        placeholder="search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          fontFamily:    'var(--fm)',
          fontSize:      '11px',
          color:         'var(--wd)',
          background:    'transparent',
          border:        '1px solid var(--bd)',
          borderRadius:  'var(--r)',
          padding:       '4px 8px',
          outline:       'none',
          width:         '160px',
          letterSpacing: '0.04em',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--mt)';
          e.currentTarget.style.boxShadow = '0 0 0 2px var(--mt)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--bd)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

