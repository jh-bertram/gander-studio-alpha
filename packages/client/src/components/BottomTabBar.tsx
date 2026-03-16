import { NAV_ITEMS } from '../constants/navigation';
import { useUIStore } from '../store/ui-store';

export default function BottomTabBar() {
  const { activeMode, setActiveMode } = useUIStore();

  return (
    <div
      role="tablist"
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: 'var(--sf)',
        borderTop: '1px solid var(--bd)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {NAV_ITEMS.map((tab) => {
        const active = activeMode === tab.mode;
        return (
          <button
            key={tab.mode}
            role="tab"
            aria-selected={active}
            onClick={() => setActiveMode(tab.mode)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${active ? 'var(--mt)' : 'transparent'}`,
              color: active ? 'var(--mt)' : 'var(--wm)',
              cursor: 'pointer',
              fontSize: '11px',
              transition: 'all 0.16s',
            }}
            className="tab-item"
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: tab.dotColor,
                color: tab.dotColor,
                boxShadow: '0 0 5px currentColor',
                flexShrink: 0,
              }}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
