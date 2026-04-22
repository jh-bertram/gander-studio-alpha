// ─────────────────────────────────────────────────────────────────────────────
// CardNode — rectangular card surface for the Materia Canvas.
// Rendered as a standalone React component; React Flow registration is FE-002.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvas-store';
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  CARD_HEADER_HEIGHT_PX,
  CARD_BORDER_RADIUS_PX,
} from '../../constants/canvas';

// Header inline padding (px) — not shared with any other component, defined once here.
const HEADER_PADDING_INLINE_PX = 12;

// Card border width (px) — standard 1px border, named for audit compliance.
const CARD_BORDER_WIDTH_PX = 1;

// Title font properties
const TITLE_FONT_SIZE_PX = 13;

// Crown prefix glyph — Unicode heavy black chess queen
const CROWN_GLYPH = '\u265B';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: editable title
// ─────────────────────────────────────────────────────────────────────────────

interface EditableTitleProps {
  cardTitle: string;
  setCardTitle: (title: string) => void;
}

function EditableTitle({ cardTitle, setCardTitle }: EditableTitleProps): React.ReactElement {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cardTitle);

  function handleSpanClick(): void {
    setDraft(cardTitle);
    setEditing(true);
  }

  function commitEdit(): void {
    setCardTitle(draft);
    setEditing(false);
  }

  function cancelEdit(): void {
    setDraft(cardTitle);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  const titleStyle: React.CSSProperties = {
    color: 'var(--my)',
    fontSize: TITLE_FONT_SIZE_PX,
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none',
  };

  const inputStyle: React.CSSProperties = {
    color: 'var(--my)',
    fontSize: TITLE_FONT_SIZE_PX,
    fontWeight: 600,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0,
    width: '100%',
  };

  if (editing) {
    return (
      <input
        data-testid="card-title-input"
        aria-label="Edit card title"
        style={inputStyle}
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <span
      data-testid="card-title-display"
      role="button"
      tabIndex={0}
      style={titleStyle}
      onClick={handleSpanClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSpanClick(); } }}
    >
      {CROWN_GLYPH} {cardTitle}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CardNode
// ─────────────────────────────────────────────────────────────────────────────

export function CardNode(): React.ReactElement {
  const cardTitle = useCanvasStore((s) => s.cardTitle);
  const setCardTitle = useCanvasStore((s) => s.setCardTitle);

  const outerStyle: React.CSSProperties = {
    width: CARD_WIDTH_PX,
    height: CARD_HEIGHT_PX,
    background: 'var(--sfm)',
    border: `${CARD_BORDER_WIDTH_PX}px solid var(--bdb)`,
    borderRadius: CARD_BORDER_RADIUS_PX,
    position: 'relative',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    height: CARD_HEADER_HEIGHT_PX,
    background: 'var(--sf)',
    display: 'flex',
    alignItems: 'center',
    paddingInline: HEADER_PADDING_INLINE_PX,
  };

  return (
    <div data-testid="card-node" style={outerStyle}>
      <div style={headerStyle}>
        <EditableTitle cardTitle={cardTitle} setCardTitle={setCardTitle} />
      </div>
    </div>
  );
}

export default CardNode;
