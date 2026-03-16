import { NAV_ITEMS, type NavItemDef } from '../constants/navigation';
import { useUIStore } from '../store/ui-store';

interface NavItemProps extends NavItemDef {
  active: boolean;
  onClick: () => void;
}

function NavItem({ label, dotColor, active, onClick }: NavItemProps) {
  return (
    <a
      role="button"
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        padding: '6px 18px',
        fontSize: '12.5px',
        borderLeft: `2px solid ${active ? 'var(--mt)' : 'transparent'}`,
        background: active ? 'var(--nav-active-bg)' : undefined,
        color: active ? 'var(--w)' : 'var(--wd)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.16s',
      }}
      className="nav-item"
    >
      <span
        style={{
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          flexShrink: 0,
          backgroundColor: dotColor,
          color: dotColor,
          boxShadow: '0 0 5px currentColor',
        }}
      />
      {label}
    </a>
  );
}

export default function Sidebar() {
  const { activeMode, setActiveMode } = useUIStore();

  return (
    <nav
      aria-label="Main navigation"
      style={{
        gridArea: 'nv',
        width: '250px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        background: 'var(--sf)',
        borderRight: '1px solid var(--bd)',
        padding: '20px 0',
      }}
      className="sidebar"
    >
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            padding: '0 18px 6px',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--wm)',
            borderBottom: '1px solid var(--bd)',
            marginBottom: '6px',
          }}
        >
          Navigation
        </div>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.mode}
            {...item}
            active={activeMode === item.mode}
            onClick={() => setActiveMode(item.mode)}
          />
        ))}
      </div>
    </nav>
  );
}
