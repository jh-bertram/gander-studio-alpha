import React, { useState, useCallback, useRef } from 'react';
import type { z } from 'zod';
import type { AgentSchema, SkillSchema, HookSchema, LoadoutSchema } from '@gander-studio/shared';
import { trpc } from '../trpc';
import { useComposeStore } from '../store/compose-store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../components/ui/popover';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion';
import {
  BROWSER_PANEL_WIDTH_PX,
  SAVE_SUCCESS_DURATION_MS,
  POPOVER_MAX_HEIGHT_PX,
  BROWSER_SKELETON_COUNT,
  WARNING_CHIP_BG,
  WARNING_CHIP_BD,
  REMOVE_HOVER_BG,
  SLOT_ITEM_DIVIDER,
  BROWSER_ITEM_HOVER_BG,
  SAVED_LOADOUT_HOVER_BG,
  POPOVER_BOX_SHADOW,
  NAME_INPUT_FOCUS_GLOW,
  INVALID_INPUT_BORDER,
  getMateriaColor,
} from '../constants/compose';

// ─── Inferred types ───────────────────────────────────────────────────────────
type Agent   = z.infer<typeof AgentSchema>;
type Skill   = z.infer<typeof SkillSchema>;
type Hook    = z.infer<typeof HookSchema>;
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
// Skeleton row
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonRow({ widthPct }: { widthPct: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: '30px',
        margin: '2px 12px',
        background: 'var(--sfm)',
        borderRadius: 'var(--r)',
        width: `${widthPct}%`,
        animation: 'gs-pulse 1.2s ease-in-out infinite',
      }}
    />
  );
}

const SKELETON_WIDTHS = [72, 60, 85, 68];

// ─────────────────────────────────────────────────────────────────────────────
// CountBadge
// ─────────────────────────────────────────────────────────────────────────────
function CountBadge({ count, loading, children }: { count?: number; loading: boolean; children?: React.ReactNode }) {
  let content: React.ReactNode;
  if (loading) {
    content = '—';
  } else if (children !== undefined) {
    content = children;
  } else {
    content = count ?? 0;
  }
  return (
    <span
      style={{
        fontFamily: 'var(--fm)',
        fontSize: '10px',
        color: 'var(--mt)',
        background: 'var(--sfm)',
        border: '1px solid var(--bd)',
        borderRadius: 'var(--r)',
        padding: '1px 5px',
        marginLeft: '6px',
      }}
    >
      {content}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BrowserItem
// ─────────────────────────────────────────────────────────────────────────────
interface BrowserItemProps {
  name: string;
  type: 'agent' | 'skill' | 'hook';
  isAdded: boolean;
  onAdd: () => void;
}

function BrowserItem({ name, type, isAdded, onAdd }: BrowserItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      role="listitem"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 12px',
        cursor: isAdded ? 'default' : 'default',
        transition: 'background 0.12s',
        background: hovered && !isAdded ? BROWSER_ITEM_HOVER_BG : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MateriaDot name={name} type={type} />
      <span
        style={{
          fontFamily: 'var(--fb)',
          fontSize: '12.5px',
          color: isAdded ? 'var(--wm)' : 'var(--wd)',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </span>
      {isAdded ? (
        <span
          role="img"
          aria-label={`${name} already in loadout`}
          style={{
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: 'auto',
            color: 'var(--mg)',
            fontSize: '14px',
            pointerEvents: 'none',
            opacity: 0.7,
          }}
        >
          ✓
        </span>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Add ${name}`}
          onClick={onAdd}
          style={{
            width: '22px',
            height: '22px',
            flexShrink: 0,
            marginLeft: 'auto',
            color: hovered ? 'var(--mt)' : 'var(--wm)',
            background: hovered ? 'var(--sfh)' : 'transparent',
            fontSize: '14px',
            outline: 'none',
          }}
          onFocus={handleFocusOutline}
          onBlur={handleBlurOutline}
        >
          +
        </Button>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BrowserSection
// ─────────────────────────────────────────────────────────────────────────────
interface BrowserSectionProps {
  label: 'AGENTS' | 'SKILLS' | 'HOOKS';
  items: Array<{ name: string; type: 'agent' | 'skill' | 'hook' }>;
  addedSet: Set<string>;
  loading: boolean;
  onAdd: (name: string, type: 'agent' | 'skill' | 'hook') => void;
  filteredCount?: number;
  totalCount?: number;
  isFirst: boolean;
}

function BrowserSection({
  label,
  items,
  addedSet,
  loading,
  onAdd,
  filteredCount,
  totalCount,
  isFirst,
}: BrowserSectionProps) {
  const searchActive = filteredCount !== undefined && totalCount !== undefined && filteredCount !== totalCount;
  const badgeText = loading ? '—' : searchActive ? `${filteredCount} of ${totalCount}` : String(items.length);

  // Hide section when search active and no results
  if (!loading && filteredCount === 0 && searchActive) return null;

  return (
    <div
      style={{
        padding: '8px 0 4px 0',
        borderTop: isFirst ? 'none' : '1px solid var(--bd)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px 4px 12px',
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
        <CountBadge loading={loading}>{badgeText}</CountBadge>
      </div>

      {loading ? (
        <div>
          {SKELETON_WIDTHS.slice(0, BROWSER_SKELETON_COUNT).map((w, i) => (
            <SkeletonRow key={i} widthPct={w} />
          ))}
        </div>
      ) : (
        <ul
          role="list"
          aria-label={`${label} items`}
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {items.map((item) => (
            <BrowserItem
              key={item.name}
              name={item.name}
              type={item.type}
              isAdded={addedSet.has(item.name)}
              onAdd={() => onAdd(item.name, item.type)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ItemBrowserBody — the scrollable content (reused in desktop & accordion)
// ─────────────────────────────────────────────────────────────────────────────
interface ItemBrowserBodyProps {
  agents: Agent[];
  skills: Skill[];
  hooks: Hook[];
  loading: boolean;
  searchValue: string;
  addedAgents: Set<string>;
  addedSkills: Set<string>;
  addedHooks: Set<string>;
  onAdd: (name: string, type: 'agent' | 'skill' | 'hook') => void;
  isSaving: boolean;
  style?: React.CSSProperties;
}

function ItemBrowserBody({
  agents,
  skills,
  hooks,
  loading,
  searchValue,
  addedAgents,
  addedSkills,
  addedHooks,
  onAdd,
  isSaving,
  style,
}: ItemBrowserBodyProps) {
  const q = searchValue.toLowerCase();
  const searchActive = q.length > 0;

  const filteredAgents = searchActive ? agents.filter(a => a.name.toLowerCase().includes(q)) : agents;
  const filteredSkills = searchActive ? skills.filter(s => s.name.toLowerCase().includes(q)) : skills;
  const filteredHooks  = searchActive ? hooks.filter(h => h.matcher.toLowerCase().includes(q)) : hooks;

  const agentItems = filteredAgents.map(a => ({ name: a.name, type: 'agent' as const }));
  const skillItems = filteredSkills.map(s => ({ name: s.name, type: 'skill' as const }));
  const hookItems  = filteredHooks.map(h => ({ name: h.matcher, type: 'hook' as const }));

  const totalMatches = filteredAgents.length + filteredSkills.length + filteredHooks.length;
  const noResults = searchActive && !loading && totalMatches === 0;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0',
        pointerEvents: isSaving ? 'none' : 'auto',
        ...style,
      }}
    >
      {noResults ? (
        <p
          style={{
            fontFamily: 'var(--fb)',
            fontSize: '12px',
            color: 'var(--wm)',
            textAlign: 'center',
            padding: '20px 12px',
            margin: 0,
          }}
        >
          No items match your search
        </p>
      ) : (
        <>
          <BrowserSection
            label="AGENTS"
            items={agentItems}
            addedSet={addedAgents}
            loading={loading}
            onAdd={onAdd}
            filteredCount={searchActive ? filteredAgents.length : undefined}
            totalCount={searchActive ? agents.length : undefined}
            isFirst
          />
          <BrowserSection
            label="SKILLS"
            items={skillItems}
            addedSet={addedSkills}
            loading={loading}
            onAdd={onAdd}
            filteredCount={searchActive ? filteredSkills.length : undefined}
            totalCount={searchActive ? skills.length : undefined}
            isFirst={false}
          />
          <BrowserSection
            label="HOOKS"
            items={hookItems}
            addedSet={addedHooks}
            loading={loading}
            onAdd={onAdd}
            filteredCount={searchActive ? filteredHooks.length : undefined}
            totalCount={searchActive ? hooks.length : undefined}
            isFirst={false}
          />
        </>
      )}
    </div>
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
// SlotGroup
// ─────────────────────────────────────────────────────────────────────────────
interface SlotGroupProps {
  label: 'AGENTS' | 'SKILLS' | 'HOOKS';
  type: 'agent' | 'skill' | 'hook';
  items: string[];
  onRemove: (name: string) => void;
  isSaving: boolean;
}

function SlotGroup({ label, type, items, onRemove, isSaving }: SlotGroupProps) {
  const emptyText =
    label === 'AGENTS' ? 'No agents selected' :
    label === 'SKILLS' ? 'No skills selected' :
    'No hooks selected';

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
    addAgent,
    removeAgent,
    addSkill,
    removeSkill,
    addHook,
    removeHook,
    setLoadoutName,
    loadLoadout,
    resetLoadout,
  } = useComposeStore();

  // tRPC queries
  const agentsQuery  = trpc.agent.list.useQuery();
  const skillsQuery  = trpc.skill.list.useQuery();
  const hooksQuery   = trpc.hook.list.useQuery();
  const loadoutsQuery = trpc.loadout.list.useQuery();

  const agents  = agentsQuery.data  ?? [];
  const skills  = skillsQuery.data  ?? [];
  const hooks   = hooksQuery.data   ?? [];
  const savedLoadouts = loadoutsQuery.data ?? [];
  const browserLoading = agentsQuery.isLoading || skillsQuery.isLoading || hooksQuery.isLoading;

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

  // Search
  const [search, setSearch] = useState('');

  // Name dirty tracking
  const [nameDirty, setNameDirty] = useState(false);

  // Sets for O(1) lookup
  const addedAgents = new Set(currentLoadout.agents);
  const addedSkills = new Set(currentLoadout.skills);
  const addedHooks  = new Set(currentLoadout.hooks);

  // Validation
  const warnings = useValidationWarnings(
    currentLoadout.agents,
    currentLoadout.skills,
    currentLoadout.hooks,
    currentLoadout.name,
    nameDirty,
  );

  // Handlers
  const handleAdd = useCallback(
    (name: string, type: 'agent' | 'skill' | 'hook') => {
      if (type === 'agent') addAgent(name);
      else if (type === 'skill') addSkill(name);
      else addHook(name);
    },
    [addAgent, addSkill, addHook],
  );

  const handleSave = useCallback(() => {
    if (!currentLoadout.name.trim() || isSaving) return;
    saveMutation.mutate({
      name: currentLoadout.name.trim(),
      agents: currentLoadout.agents,
      skills: currentLoadout.skills,
      hooks: currentLoadout.hooks,
      createdAt: new Date().toISOString(),
    });
  }, [currentLoadout, isSaving, saveMutation]);

  const handleLoad = useCallback(
    (lo: Loadout) => {
      loadLoadout({
        name: lo.name,
        agents: lo.agents,
        skills: lo.skills,
        hooks: lo.hooks,
      });
      setNameDirty(false);
      setSaveError(null);
    },
    [loadLoadout],
  );

  const handleDelete = useCallback(
    (name: string) => {
      deleteMutation.mutate({ name });
    },
    [deleteMutation],
  );

  const handleNew = useCallback(() => {
    resetLoadout();
    setNameDirty(false);
    setSaveError(null);
    setSaveSuccess(false);
  }, [resetLoadout]);

  // Name input invalid styling: show only after first blur + name empty + has items
  const hasItems = currentLoadout.agents.length + currentLoadout.skills.length + currentLoadout.hooks.length > 0;
  const showInvalidName = nameDirty && !currentLoadout.name.trim() && hasItems;

  // Total selected count for accordion badge
  const totalSelected = currentLoadout.agents.length + currentLoadout.skills.length + currentLoadout.hooks.length;

  // Browser body shared props
  const browserBodyProps: ItemBrowserBodyProps = {
    agents,
    skills,
    hooks,
    loading: browserLoading,
    searchValue: search,
    addedAgents,
    addedSkills,
    addedHooks,
    onAdd: handleAdd,
    isSaving,
  };

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

        {/* Two-panel area */}
        <div
          className="compose-panels"
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            flex: 1,
            minHeight: 0,
            alignItems: 'flex-start',
          }}
        >
          {/* ── ItemBrowser — desktop (hidden at sm via CSS) ── */}
          <div
            className="item-browser"
            style={{
              width: `${BROWSER_PANEL_WIDTH_PX}px`,
              flexShrink: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--sf)',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--rl)',
              overflow: 'hidden',
            }}
          >
            {/* Search */}
            <div
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--bd)',
                flexShrink: 0,
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Input
                  type="search"
                  placeholder="Search agents, skills, hooks..."
                  value={search}
                  onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
                  disabled={browserLoading || isSaving}
                  aria-label="Search agents, skills, and hooks"
                  style={{
                    fontFamily: 'var(--fb)',
                    fontSize: '12px',
                    color: 'var(--w)',
                    background: 'var(--sfm)',
                    border: '1px solid var(--bd)',
                    borderRadius: 'var(--r)',
                    height: '30px',
                    paddingLeft: '10px',
                    paddingRight: search.length > 0 ? '30px' : '10px',
                    width: '100%',
                    opacity: (browserLoading || isSaving) ? 0.5 : 1,
                    pointerEvents: (browserLoading || isSaving) ? 'none' : 'auto',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = 'var(--bdb)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = 'var(--bd)';
                  }}
                />
                {search.length > 0 && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--wm)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0',
                      lineHeight: 1,
                      outline: 'none',
                    }}
                    onFocus={handleFocusOutline}
                    onBlur={handleBlurOutline}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Browser content */}
            <ItemBrowserBody {...browserBodyProps} />
          </div>

          {/* ── ItemBrowser — mobile accordion (shown at sm via CSS) ── */}
          <div
            className="item-browser-accordion"
            style={{ display: 'none', width: '100%', flexShrink: 0 }}
          >
            <Accordion
              style={{
                background: 'var(--sf)',
                border: '1px solid var(--bd)',
                borderRadius: 'var(--rl)',
                overflow: 'hidden',
              }}
            >
              <AccordionItem value="browser">
                <AccordionTrigger
                  style={{
                    fontFamily: 'var(--fb)',
                    fontSize: '12px',
                    color: 'var(--wd)',
                    padding: '10px 12px',
                    outline: 'none',
                  }}
                >
                  <span>
                    AVAILABLE ITEMS
                    <CountBadge count={totalSelected} loading={false} />
                  </span>
                </AccordionTrigger>
                <AccordionContent
                  style={{
                    maxHeight: '240px',
                    overflowY: 'auto',
                  }}
                >
                  {/* Search in accordion */}
                  <div style={{ padding: '8px 12px 0', borderBottom: '1px solid var(--bd)' }}>
                    <Input
                      type="search"
                      placeholder="Search agents, skills, hooks..."
                      value={search}
                      onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
                      disabled={browserLoading || isSaving}
                      aria-label="Search agents, skills, and hooks"
                      style={{
                        fontFamily: 'var(--fb)',
                        fontSize: '12px',
                        color: 'var(--w)',
                        background: 'var(--sfm)',
                        border: '1px solid var(--bd)',
                        borderRadius: 'var(--r)',
                        height: '30px',
                        width: '100%',
                        marginBottom: '8px',
                      }}
                    />
                  </div>
                  <ItemBrowserBody {...browserBodyProps} style={{ flex: 'unset' }} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* ── LoadoutBuilder ── */}
          <div
            className="loadout-builder"
            style={{
              flex: 1,
              minWidth: 0,
              height: '100%',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

            {/* Slot groups */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: 0,
              }}
            >
              <SlotGroup
                label="AGENTS"
                type="agent"
                items={currentLoadout.agents}
                onRemove={removeAgent}
                isSaving={isSaving}
              />
              <SlotGroup
                label="SKILLS"
                type="skill"
                items={currentLoadout.skills}
                onRemove={removeSkill}
                isSaving={isSaving}
              />
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
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 640px) {
          .compose-panels {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .item-browser {
            display: none !important;
          }
          .item-browser-accordion {
            display: block !important;
            width: 100% !important;
          }
          .loadout-builder {
            width: 100% !important;
            height: auto !important;
          }
        }
        @media (max-width: 390px) {
          .compose-panels {
            gap: 12px !important;
          }
        }
      `}</style>
    </>
  );
}
