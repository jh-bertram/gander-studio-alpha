import { useRef, useState, KeyboardEvent } from 'react';
import { CHIP_BG } from '@/constants/edit';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function commitChip(raw: string) {
    const trimmed = raw.trim().replace(/,$/, '').trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputVal('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitChip(inputVal);
    } else if (e.key === 'Backspace' && inputVal === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handleChange(raw: string) {
    if (raw.endsWith(',')) {
      commitChip(raw);
    } else {
      setInputVal(raw);
    }
  }

  function removeChip(tool: string) {
    onChange(value.filter((t) => t !== tool));
  }

  return (
    <div
      className="chip-list"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        minHeight: '32px',
        padding: '4px',
        background: 'var(--sf)',
        border: '1px solid var(--bd)',
        borderRadius: 'var(--r)',
        cursor: 'text',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tool) => (
        <span
          key={tool}
          className="chip"
          style={{
            background: CHIP_BG,
            border: '1px solid var(--bd)',
            borderRadius: 'var(--r)',
            padding: '1px 6px',
            fontFamily: 'var(--fm)',
            fontSize: '11px',
            color: 'var(--mt)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {tool}
          <button
            type="button"
            aria-label={`Remove ${tool}`}
            onClick={(e) => { e.stopPropagation(); removeChip(tool); }}
            style={{
              color: 'var(--wm)',
              fontSize: '12px',
              lineHeight: '1',
              cursor: 'pointer',
              padding: '0 2px',
              background: 'none',
              border: 'none',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--redb)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--wm)'; }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        placeholder={value.length === 0 ? 'add tool...' : ''}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: 'var(--fm)',
          fontSize: '12px',
          color: 'var(--w)',
          minWidth: '80px',
          flex: '1',
        }}
      />
    </div>
  );
}
