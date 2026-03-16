import { useRef } from 'react';
import { useBrowseData } from '../hooks/useBrowseData';
import { useBrowseStore } from '../store/browse-store';
import FilterBar from '../components/browse/FilterBar';
import AgentCard from '../components/browse/AgentCard';
import SkillCard from '../components/browse/SkillCard';
import HookCard from '../components/browse/HookCard';
import SkeletonCard from '../components/browse/SkeletonCard';
import DrilldownPanel, { type DrilldownItem } from '../components/browse/DrilldownPanel';

// ---- Page title labels --------------------------------------------------

const PAGE_TITLES: Record<string, string> = {
  all:    'All Materia',
  agents: 'Agent Roster',
  skills: 'Skill Inventory',
  hooks:  'System Hooks',
};

// ---- Grid style factories -----------------------------------------------

const AGENT_GRID_STYLE: React.CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
  gap:                 '14px',
  marginBottom:        '32px',
};

const SKILL_GRID_STYLE: React.CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
  gap:                 '12px',
  marginBottom:        '32px',
};

const HOOK_GRID_STYLE: React.CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
  gap:                 '12px',
  marginBottom:        '32px',
};

// ---- PageTitle component ------------------------------------------------

function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily:    'var(--fh)',
        fontSize:      '17px',
        fontWeight:    500,
        letterSpacing: '0.1em',
        marginBottom:  '18px',
        paddingBottom: '9px',
        borderBottom:  '1px solid var(--bd)',
        display:       'flex',
        alignItems:    'center',
        gap:           '10px',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width:        '3px',
          height:       '18px',
          background:   'var(--mt)',
          boxShadow:    'var(--gt)',
          borderRadius: '2px',
          display:      'inline-block',
          flexShrink:   0,
        }}
      />
      {children}
    </div>
  );
}

// ---- SkeletonGrid -------------------------------------------------------

function SkeletonGrid() {
  return (
    <div
      aria-busy="true"
      style={AGENT_GRID_STYLE}
    >
      <span className="sr-only">Loading agents, skills, and hooks...</span>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ---- ErrorState ---------------------------------------------------------

function ErrorState({ error }: { error: unknown }) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unexpected error occurred.';

  return (
    <div
      role="alert"
      style={{
        borderLeft:   '3px solid var(--redb)',
        background:   'var(--sfm)',
        borderRadius: 'var(--rl)',
        padding:      '14px 18px',
      }}
    >
      <div
        style={{
          fontFamily:    'var(--fm)',
          fontSize:      '10px',
          color:         'var(--redb)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight:    700,
          marginBottom:  '6px',
        }}
      >
        LOAD ERROR
      </div>
      <div
        style={{
          fontFamily: 'var(--fm)',
          fontSize:   '12px',
          color:      'var(--wd)',
        }}
      >
        {message}
      </div>
    </div>
  );
}

// ---- EmptyState ---------------------------------------------------------

function EmptyState() {
  return (
    <div
      aria-live="polite"
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '60px 20px',
        gap:            '16px',
      }}
    >
      <div
        aria-hidden="true"
        className="empty-pulse"
        style={{
          width:        '40px',
          height:       '40px',
          borderRadius: '50%',
          background:   'var(--mt)',
          animation:    'pulse-opacity 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          fontFamily:    'var(--fh)',
          fontSize:      '16px',
          letterSpacing: '0.06em',
          color:         'var(--wd)',
        }}
      >
        No materia found
      </div>
      <div
        style={{
          fontFamily: 'var(--fm)',
          fontSize:   '12px',
          color:      'var(--wm)',
        }}
      >
        Adjust your filters
      </div>
    </div>
  );
}

// ---- BrowsePage ---------------------------------------------------------

export default function BrowsePage() {
  const { agents, skills, hooks, isLoading, error } = useBrowseData();
  const { typeFilter, selectedItem, setSelectedItem } = useBrowseStore();

  // Refs map for restoring focus when DrilldownPanel closes
  const cardRefMap = useRef<Map<string, HTMLElement>>(new Map());

  const showAgents = typeFilter === 'all' || typeFilter === 'agents';
  const showSkills = typeFilter === 'all' || typeFilter === 'skills';
  const showHooks  = typeFilter === 'all' || typeFilter === 'hooks';

  const noResults =
    !isLoading &&
    !error &&
    (showAgents ? agents.length === 0 : true) &&
    (showSkills ? skills.length === 0 : true) &&
    (showHooks  ? hooks.length  === 0 : true);

  // Resolve selectedItem → DrilldownItem by looking up entity data
  let drilldownItem: DrilldownItem | null = null;
  const triggerRef = useRef<HTMLElement | null>(null);

  if (selectedItem) {
    if (selectedItem.type === 'agent') {
      const found = agents.find((a) => a.name === selectedItem.name);
      if (found) drilldownItem = { type: 'agent', data: found };
    } else if (selectedItem.type === 'skill') {
      const found = skills.find((s) => s.name === selectedItem.name);
      if (found) drilldownItem = { type: 'skill', data: found };
    } else if (selectedItem.type === 'hook') {
      const found = hooks.find((h) => h.matcher === selectedItem.name);
      if (found) drilldownItem = { type: 'hook', data: found };
    }
  }

  function handleClose() {
    setSelectedItem(null);
  }

  const pageTitle = PAGE_TITLES[typeFilter] ?? 'All Materia';

  return (
    <div data-testid="browse-page">
      <PageTitle>{pageTitle}</PageTitle>

      <FilterBar />

      {isLoading && <SkeletonGrid />}

      {!isLoading && error != null && <ErrorState error={error} />}

      {!isLoading && error == null && (
        <>
          {showAgents && agents.length > 0 && (
            <div style={AGENT_GRID_STYLE} aria-label="Agents">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.name}
                  agent={agent}
                />
              ))}
            </div>
          )}

          {showSkills && skills.length > 0 && (
            <div style={SKILL_GRID_STYLE} aria-label="Skills">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.name}
                  skill={skill}
                />
              ))}
            </div>
          )}

          {showHooks && hooks.length > 0 && (
            <div style={HOOK_GRID_STYLE} aria-label="Hooks">
              {hooks.map((hook) => (
                <HookCard
                  key={hook.matcher}
                  hook={hook}
                />
              ))}
            </div>
          )}

          {noResults && <EmptyState />}
        </>
      )}

      {drilldownItem && (
        <DrilldownPanel
          item={drilldownItem}
          onClose={handleClose}
          triggerRef={triggerRef}
        />
      )}
    </div>
  );
}
