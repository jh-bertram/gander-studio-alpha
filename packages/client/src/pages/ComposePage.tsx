import React, { useState, useCallback, useRef, useMemo, Component, type ReactNode, type ErrorInfo } from 'react';
import type { z } from 'zod';
import type { LoadoutSchema } from '@gander-studio/shared';
import { trpc } from '../trpc';
import { useComposeStore } from '../store/compose-store';
import { useCanvasStore } from '../store/canvas-store';
import MateriaCanvas from '../components/compose/MateriaCanvas';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../components/ui/popover';
import {
  SAVE_SUCCESS_DURATION_MS,
  POPOVER_MAX_HEIGHT_PX,
  WARNING_CHIP_BG,
  WARNING_CHIP_BD,
  REMOVE_HOVER_BG,
  SLOT_ITEM_DIVIDER,
  SAVED_LOADOUT_HOVER_BG,
  POPOVER_BOX_SHADOW,
  NAME_INPUT_FOCUS_GLOW,
  INVALID_INPUT_BORDER,
  getMateriaColor,
} from '../constants/compose';

// ─── Inferred types ───────────────────────────────────────────────────────────
type Loadout = z.infer<typeof LoadoutSchema>;

// ─── Focus/blur outline handlers (shared across all interactive elements) ─────
function handleFocusOutline(e: React.FocusEvent<HTMLElement>): void {
  e.currentTarget.style.outline = '2px solid var(--mt)';
  e.currentTarget.style.outlineOffset = '2px';
}

function handleBlurOutline(e: React.FocusEvent<HTMLElement>): void {
  e.currentTarget.style.outline = 'none';
  e.currentTarget.style.outlineOffset = '0';
}

// ─────────────────────────────────────────────────────────────────────────────
// CanvasErrorBoundary — catches runtime errors in MateriaCanvas so the rest
// of the compose page remains functional and the user sees a clear message.
// ─────────────────────────────────────────────────────────────────────────────
interface CanvasErrorBoundaryState { error: Error | null }
class CanvasErrorBoundary extends Component<{ children: ReactNode }, CanvasErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error): CanvasErrorBoundaryState {
    return { error };
  }
  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[MateriaCanvas error]', error, info.componentStack);
  }
  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: 'var(--redb)', background: 'var(--sfm)', border: '1px solid var(--red)', borderRadius: 8, fontSize: 13 }}>
          <strong>Canvas failed to load:</strong> {this.state.error.message}
          <br /><span style={{ color: 'var(--wm)', fontSize: 11 }}>Check the browser console for details.</span>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MateriaDot
// ─────────────────────────────────────────────────────────────────────────────
interface MateriaDotProps {
  name: string;
  type: 'agent' | 'skill' | 'hook';
}

function MateriaDot({ name, type }: MateriaDotProps) {
  const color = getMateriaColor(name, type);
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        flexShrink: 0,
        backgroundColor: color,
        boxShadow: `0 0 4px ${color}`,
      }}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SlotItem
// ─────────────────────────────────────────────────────────────────────────────
interface SlotItemProps {
  name: string;
  type: 'agent' | 'skill' | 'hook';
  onRemove: () => void;
  isSaving: boolean;
}

function SlotItem({ name, type, onRemove, isSaving }: SlotItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      role="listitem"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 0',
        borderBottom: `1px dashed ${SLOT_ITEM_DIVIDER}`,
      }}
    >
      <MateriaDot name={name} type={type} />
      <span
        style={{
          fontFamily: 'var(--fb)',
          fontSize: '12.5px',
          color: 'var(--w)',
          flex: 1,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
        disabled={isSaving}
        style={{
          width: '22px',
          height: '22px',
          flexShrink: 0,
          marginLeft: 'auto',
          color: hovered ? 'var(--redb)' : 'var(--wm)',
          background: hovered ? REMOVE_HOVER_BG : 'transparent',
          fontSize: '14px',
          opacity: isSaving ? 0.5 : 1,
          pointerEvents: isSaving ? 'none' : 'auto',
          outline: 'none',
          transition: 'color 0.12s, background 0.12s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={handleFocusOutline}
        onBlur={handleBlurOutline}
      >
        ×
      </Button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SlotGroup — hooks only (agents/skills now live on MateriaCanvas)
// ─────────────────────────────────────────────────────────────────────────────
interface SlotGroupProps {
  label: 'HOOKS';
  type: 'hook';
  items: string[];
  onRemove: (name: string) => void;
  isSaving: boolean;
}

function SlotGroup({ label, type, items, onRemove, isSaving }: SlotGroupProps) {
  const emptyText = 'No hooks selected';

  const count = items.length;
  const countColor = count > 0 ? 'var(--mt)' : 'var(--wm)';

  return (
    <div style={{ gap: '6px', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid var(--bd)',
          paddingBottom: '4px',
          marginBottom: '4px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--fh)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--wm)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--fm)',
            fontSize: '10px',
            color: countColor,
          }}
        >
          {count}
        </span>
      </div>

      <ul
        role="list"
        aria-label={`Selected ${label.toLowerCase()}`}
        aria-live="polite"
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
      >
        {items.length === 0 ? (
          <li
            role="listitem"
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--wm)',
              fontStyle: 'italic',
              padding: '8px 0',
              listStyle: 'none',
            }}
          >
            {emptyText}
          </li>
        ) : (
          items.map((name) => (
            <SlotItem
              key={name}
              name={name}
              type={type}
              onRemove={() => onRemove(name)}
              isSaving={isSaving}
            />
          ))
        )}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ValidationWarnings
// ─────────────────────────────────────────────────────────────────────────────
interface ValidationWarningsProps {
  warnings: string[];
}

function ValidationWarnings({ warnings }: ValidationWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '8px 0',
      }}
    >
      {warnings.map((msg, i) => (
        <div
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: WARNING_CHIP_BG,
            border: `1px solid ${WARNING_CHIP_BD}`,
            borderRadius: 'var(--r)',
            padding: '4px 8px',
            fontFamily: 'var(--fb)',
            fontSize: '11px',
            color: 'var(--my)',
            width: 'fit-content',
            maxWidth: '100%',
          }}
        >
          {msg}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SaveErrorCard
// ─────────────────────────────────────────────────────────────────────────────
interface SaveErrorCardProps {
  message: string;
  onDismiss: () => void;
}

function SaveErrorCard({ message, onDismiss }: SaveErrorCardProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onDismiss();
  }, [onDismiss]);

  return (
    <div
      role="alert"
      onClick={onDismiss}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Save failed. Click or press Escape to dismiss."
      style={{
        borderLeft: '3px solid var(--redb)',
        background: 'var(--sfm)',
        borderRadius: 'var(--rl)',
        padding: '10px 14px',
        marginTop: '8px',
        cursor: 'pointer',
        outline: 'none',
      }}
      onFocus={handleFocusOutline}
      onBlur={handleBlurOutline}
    >
      <div
        style={{
          fontFamily: 'var(--fm)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'var(--redb)',
          marginBottom: '4px',
        }}
      >
        SAVE FAILED
      </div>
      <div
        style={{
          fontFamily: 'var(--fb)',
          fontSize: '12px',
          color: 'var(--wd)',
          lineHeight: 1.5,
        }}
      >
        {message}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LoadoutControls (Save / Load / New bar)
// ─────────────────────────────────────────────────────────────────────────────
interface LoadoutControlsProps {
  name: string;
  isSaving: boolean;
  saveSuccess: boolean;
  savedLoadouts: Loadout[];
  loadoutsLoading: boolean;
  onSave: () => void;
  onLoad: (loadout: Loadout) => void;
  onDelete: (name: string) => void;
  onNew: () => void;
}

function LoadoutControls({
  name,
  isSaving,
  saveSuccess,
  savedLoadouts,
  loadoutsLoading,
  onSave,
  onLoad,
  onDelete,
  onNew,
}: LoadoutControlsProps) {
  const saveDisabled = !name.trim() || isSaving;

  let saveLabel = 'Save Loadout';
  if (isSaving) saveLabel = 'Saving...';
  if (saveSuccess) saveLabel = 'Saved ✓';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderTop: '1px solid var(--bd)',
        paddingTop: '12px',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      {/* Save button */}
      <Button
        size="sm"
        variant="default"
        disabled={saveDisabled}
        aria-disabled={saveDisabled}
        aria-label={isSaving ? 'Saving loadout' : 'Save Loadout'}
        data-testid="save-button"
        onClick={onSave}
        style={{
          background: 'var(--mt)',
          color: 'var(--void)',
          fontFamily: 'var(--fb)',
          fontSize: '12px',
          borderRadius: 'var(--r)',
          opacity: saveDisabled ? (isSaving ? 0.6 : 0.4) : 1,
          cursor: saveDisabled ? 'not-allowed' : 'pointer',
          boxShadow: saveDisabled ? 'none' : undefined,
          outline: 'none',
        }}
        onFocus={handleFocusOutline}
        onBlur={handleBlurOutline}
      >
        {saveLabel}
      </Button>

      {/* Load popover */}
      <Popover>
        <PopoverTrigger
          style={{
            borderColor: 'var(--bd)',
            color: 'var(--wd)',
            background: 'transparent',
            fontFamily: 'var(--fb)',
            fontSize: '12px',
            border: '1px solid var(--bd)',
            borderRadius: 'var(--r)',
            padding: '3px 10px',
            cursor: 'pointer',
            outline: 'none',
            height: '28px',
          }}
          onFocus={handleFocusOutline}
          onBlur={handleBlurOutline}
        >
          Load
        </PopoverTrigger>
        <PopoverContent
          style={{
            background: 'var(--sfh)',
            border: '1px solid var(--bdb)',
            borderRadius: 'var(--rl)',
            padding: '10px 0',
            minWidth: '240px',
            maxWidth: '320px',
            boxShadow: POPOVER_BOX_SHADOW,
            zIndex: 50,
          }}
        >
          <div
            id="popover-header"
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--wm)',
              padding: '0 12px 6px 12px',
              borderBottom: '1px solid var(--bd)',
              marginBottom: '4px',
            }}
          >
            SAVED LOADOUTS
          </div>
          <ul
            role="list"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              maxHeight: `${POPOVER_MAX_HEIGHT_PX}px`,
              overflowY: 'auto',
            }}
          >
            {loadoutsLoading ? (
              <li
                role="listitem"
                style={{
                  fontFamily: 'var(--fb)',
                  fontSize: '12px',
                  color: 'var(--wm)',
                  fontStyle: 'italic',
                  padding: '8px 12px',
                }}
              >
                Loading...
              </li>
            ) : savedLoadouts.length === 0 ? (
              <li
                role="listitem"
                style={{
                  fontFamily: 'var(--fb)',
                  fontSize: '12px',
                  color: 'var(--wm)',
                  fontStyle: 'italic',
                  padding: '8px 12px',
                }}
              >
                No saved loadouts
              </li>
            ) : (
              savedLoadouts.map((lo) => (
                <SavedLoadoutRow
                  key={lo.name}
                  loadout={lo}
                  onLoad={() => onLoad(lo)}
                  onDelete={() => onDelete(lo.name)}
                />
              ))
            )}
          </ul>
        </PopoverContent>
      </Popover>

      {/* New button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onNew}
        style={{
          color: 'var(--wm)',
          fontFamily: 'var(--fb)',
          fontSize: '12px',
          marginLeft: 'auto',
          outline: 'none',
        }}
        onFocus={handleFocusOutline}
        onBlur={handleBlurOutline}
      >
        New
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SavedLoadoutRow
// ─────────────────────────────────────────────────────────────────────────────
interface SavedLoadoutRowProps {
  loadout: Loadout;
  onLoad: () => void;
  onDelete: () => void;
}

function SavedLoadoutRow({ loadout, onLoad, onDelete }: SavedLoadoutRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      role="listitem"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        background: hovered ? SAVED_LOADOUT_HOVER_BG : 'transparent',
        transition: 'background 0.12s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          fontFamily: 'var(--fm)',
          fontSize: '12px',
          color: 'var(--wd)',
          flex: 1,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {loadout.name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Load ${loadout.name}`}
        onClick={onLoad}
        style={{
          width: '20px',
          height: '20px',
          fontSize: '12px',
          color: 'var(--wm)',
          outline: 'none',
        }}
        onFocus={handleFocusOutline}
        onBlur={handleBlurOutline}
      >
        ↓
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${loadout.name}`}
        onClick={onDelete}
        style={{
          width: '20px',
          height: '20px',
          fontSize: '12px',
          color: 'var(--wm)',
          outline: 'none',
        }}
        onFocus={handleFocusOutline}
        onBlur={handleBlurOutline}
      >
        ×
      </Button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useValidationWarnings — pure derivation, no side effects
// ─────────────────────────────────────────────────────────────────────────────
function useValidationWarnings(
  agents: string[],
  skills: string[],
  hooks: string[],
  name: string,
  nameDirty: boolean,
): string[] {
  const warnings: string[] = [];
  const hasItems = agents.length + skills.length + hooks.length > 0;

  if (!hasItems) {
    warnings.push('⚠ No agents selected — loadout is empty');
  } else {
    const hasCommand = agents.some(
      a => a === 'orchestrator' || a === 'project-manager',
    );
    if (!hasCommand) {
      warnings.push('⚠ No orchestrator or project-manager selected — no command agent');
    }
    const hasAuditor = agents.some(a => a === 'auditor' || a === 'code-auditor' || a === 'critic');
    if (hasItems && !hasAuditor) {
      warnings.push('⚠ Auditor recommended for verification workflows');
    }
  }

  if (hasItems && !name.trim() && nameDirty) {
    warnings.push('⚠ Loadout name is required to save');
  }

  return warnings;
}

// ─────────────────────────────────────────────────────────────────────────────
// ComposePage — main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ComposePage() {
  const {
    currentLoadout,
    removeHook,
    setLoadoutName,
    loadLoadout,
    resetLoadout,
  } = useComposeStore();

  // Canvas store wiring.
  // Subscribe only to stable primitive references (s.nodes is the same array ref until mutated).
  // Derive agent/skill name arrays via useMemo — keeps them OUT of useSyncExternalStore's
  // snapshot comparison, which React 19 enforces strictly (new object each call = infinite loop).
  const canvasNodes = useCanvasStore(s => s.nodes);
  const canvasEdges = useCanvasStore(s => s.edges);
  const canvasLoadFromLoadout = useCanvasStore(s => s.loadFromLoadout);
  const canvasReset = useCanvasStore(s => s.resetCanvas);

  const canvasAgents = useMemo(
    () => canvasNodes.filter(n => n.type === 'agent').map(n => n.name),
    [canvasNodes],
  );
  const canvasSkills = useMemo(
    () => canvasNodes.filter(n => n.type === 'skill').map(n => n.name),
    [canvasNodes],
  );

  // tRPC queries
  const agentsQuery  = trpc.agent.list.useQuery();
  const skillsQuery  = trpc.skill.list.useQuery();
  const loadoutsQuery = trpc.loadout.list.useQuery();

  const savedLoadouts = loadoutsQuery.data ?? [];

  // Save mutation
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveMutation = trpc.loadout.save.useMutation({
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError(null);
      loadoutsQuery.refetch();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        setSaveSuccess(false);
      }, SAVE_SUCCESS_DURATION_MS);
    },
    onError: (err) => {
      setSaveError(err.message ?? 'Unknown error');
    },
  });

  // Delete mutation
  const deleteMutation = trpc.loadout.delete.useMutation({
    onSuccess: () => {
      loadoutsQuery.refetch();
    },
  });

  const isSaving = saveMutation.isPending;

  // Name dirty tracking
  const [nameDirty, setNameDirty] = useState(false);

  // Validation — agents/skills from canvas-store, hooks/name from compose-store
  const warnings = useValidationWarnings(
    canvasAgents,
    canvasSkills,
    currentLoadout.hooks,
    currentLoadout.name,
    nameDirty,
  );

  // Handlers
  const handleSave = useCallback(async () => {
    const name = currentLoadout.name.trim();
    if (!name) { setNameDirty(true); return; }
    try {
      await saveMutation.mutateAsync({
        name,
        agents: canvasAgents,
        skills: canvasSkills,
        hooks: currentLoadout.hooks,          // hooks still from compose-store
        connections: canvasEdges.map(e => ({ source: e.source, target: e.target })),
        createdAt: new Date().toISOString(),
      });
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    }
  }, [currentLoadout.name, currentLoadout.hooks, canvasAgents, canvasSkills, canvasEdges, saveMutation]);

  const handleLoad = useCallback((lo: Loadout) => {
    loadLoadout({ name: lo.name, agents: [], skills: [], hooks: lo.hooks });
    canvasLoadFromLoadout(lo);
    setNameDirty(false);
    setSaveError(null);
  }, [loadLoadout, canvasLoadFromLoadout]);

  const handleDelete = useCallback(
    (name: string) => {
      deleteMutation.mutate({ name });
    },
    [deleteMutation],
  );

  const handleNew = useCallback(() => {
    resetLoadout();
    canvasReset();
    setNameDirty(false);
    setSaveError(null);
    setSaveSuccess(false);
  }, [resetLoadout, canvasReset]);

  // Name input invalid styling: show only after first blur + name empty + has items
  const hasItems = canvasAgents.length + canvasSkills.length + currentLoadout.hooks.length > 0;
  const showInvalidName = nameDirty && !currentLoadout.name.trim() && hasItems;

  return (
    <>
      {/* Pulse keyframe — injected once inline to avoid a separate CSS file */}
      <style>{`
        @keyframes gs-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <div
        data-testid="compose-page"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: '100%',
        }}
      >
        {/* Page header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
          <h2
            style={{
              fontFamily: 'var(--fh)',
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--w)',
              textShadow: 'var(--title-glow)',
              margin: 0,
            }}
          >
            COMPOSE
          </h2>
          <p
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              color: 'var(--wm)',
              margin: 0,
            }}
          >
            Build and save agent loadouts
          </p>
        </div>

        {/* ── LoadoutBuilder ── */}
        <div
          className="loadout-builder"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--sf)',
            border: '1px solid var(--bd)',
            borderRadius: 'var(--rl)',
            padding: '16px',
          }}
        >
          {/* Loadout name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
            <label
              htmlFor="loadout-name-input"
              style={{
                fontFamily: 'var(--fb)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--wm)',
                display: 'block',
                marginBottom: '5px',
              }}
            >
              LOADOUT NAME
            </label>
            <Input
              id="loadout-name-input"
              type="text"
              placeholder="loadout-name"
              value={currentLoadout.name}
              onChange={(e) => setLoadoutName((e.target as HTMLInputElement).value)}
              onBlur={() => setNameDirty(true)}
              disabled={isSaving}
              aria-invalid={showInvalidName}
              style={{
                fontFamily: 'var(--fm)',
                fontSize: '13px',
                color: 'var(--w)',
                background: 'var(--sfm)',
                border: showInvalidName
                  ? `1px solid ${INVALID_INPUT_BORDER}`
                  : '1px solid var(--bd)',
                borderRadius: 'var(--r)',
                height: '32px',
                padding: '0 10px',
                letterSpacing: '0.06em',
                opacity: isSaving ? 0.7 : 1,
                pointerEvents: isSaving ? 'none' : 'auto',
                outline: 'none',
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = 'var(--bdb)';
                (e.target as HTMLInputElement).style.boxShadow = NAME_INPUT_FOCUS_GLOW;
              }}
              onBlurCapture={(e) => {
                if (!showInvalidName) {
                  (e.target as HTMLInputElement).style.borderColor = 'var(--bd)';
                }
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
          </div>

          {/* MateriaCanvas — explicit height avoids height:100% chain failure */}
          <div style={{ height: 520, minHeight: 520, flexShrink: 0 }}>
            <CanvasErrorBoundary>
              <MateriaCanvas
                availableAgents={(agentsQuery.data ?? []).map(a => ({ name: a.name, filePath: a.filePath }))}
                availableSkills={(skillsQuery.data ?? []).map(s => ({ name: s.name, filePath: s.filePath }))}
                isSaving={isSaving}
              />
            </CanvasErrorBoundary>
          </div>

          {/* Hooks slot */}
          <div style={{ flexShrink: 0 }}>
            <SlotGroup
              label="HOOKS"
              type="hook"
              items={currentLoadout.hooks}
              onRemove={removeHook}
              isSaving={isSaving}
            />
          </div>

          {/* Validation warnings */}
          <ValidationWarnings warnings={warnings} />

          {/* Save/Load/New controls */}
          <LoadoutControls
            name={currentLoadout.name}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
            savedLoadouts={savedLoadouts}
            loadoutsLoading={loadoutsQuery.isLoading}
            onSave={handleSave}
            onLoad={handleLoad}
            onDelete={handleDelete}
            onNew={handleNew}
          />

          {/* Save error card */}
          {saveError && (
            <SaveErrorCard message={saveError} onDismiss={() => setSaveError(null)} />
          )}
        </div>
      </div>
    </>
  );
}
