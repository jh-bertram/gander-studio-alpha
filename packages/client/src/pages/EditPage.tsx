import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/trpc';
import { useEditStore } from '@/store/edit-store';
import {
  SAVE_SUCCESS_DURATION_MS,
  PREVIEW_DEBOUNCE_MS,
  PANE_MIN_WIDTH_PX,
  FORM_EXPAND_VIEWPORT_THRESHOLD_PX,
  FILE_OPTION_HOVER_BG,
  COLLAPSE_TOGGLE_HOVER_BG,
  CHIP_BG,
  DROPDOWN_SHADOW,
  DIVIDER_HOVER_SHADOW,
} from '@/constants/edit';
import TagInput from '@/components/edit/TagInput';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { Agent, Skill } from '@gander-studio/shared';

// ─── Save stub ──────────────────────────────────────────────────────────────
function saveStub(): Promise<void> {
  console.warn('[EditPage] save stub — trpc.agent.save not yet implemented');
  return new Promise((resolve) => setTimeout(resolve, 300));
}

// ─── FilePicker ──────────────────────────────────────────────────────────────
interface FilePickerProps {
  selectedFile: { type: 'agent' | 'skill'; name: string } | null;
  isDirty: boolean;
  onSelect: (file: { type: 'agent' | 'skill'; name: string }) => void;
}

function FilePicker({ selectedFile, isDirty, onSelect }: FilePickerProps) {
  const { data: agents = [], isLoading: agentsLoading } = trpc.agent.list.useQuery();
  const { data: skills = [], isLoading: skillsLoading } = trpc.skill.list.useQuery();
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredAgents = agents.filter((a: Agent) =>
    a.name.toLowerCase().includes(filter.toLowerCase()),
  );
  const filteredSkills = skills.filter((s: Skill) =>
    s.name.toLowerCase().includes(filter.toLowerCase()),
  );

  const hasResults = filteredAgents.length > 0 || filteredSkills.length > 0;

  function handleSelect(type: 'agent' | 'skill', name: string) {
    onSelect({ type, name });
    setOpen(false);
    setFilter('');
  }

  return (
    <div
      className="file-picker"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 0',
        borderBottom: '1px solid var(--bd)',
        flexShrink: 0,
      }}
    >
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setTimeout(() => searchRef.current?.focus(), 50); }}>
        <PopoverTrigger
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select file to edit"
          style={{
            background: 'var(--sfm)',
            border: `1px solid var(--bd)`,
            borderRadius: 'var(--r)',
            padding: '6px 10px',
            height: '32px',
            fontFamily: selectedFile ? 'var(--fm)' : 'var(--fb)',
            fontStyle: selectedFile ? 'normal' : 'italic',
            fontSize: '12px',
            color: selectedFile ? 'var(--w)' : 'var(--wm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '220px',
            cursor: 'pointer',
          }}
          title={selectedFile?.name ?? undefined}
        >
          {isDirty && selectedFile && (
            <span
              className="dirty-dot"
              aria-hidden="true"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--mo)',
                boxShadow: '0 0 5px var(--mo)',
                flexShrink: 0,
              }}
            />
          )}
          <span className="fp-fname" style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedFile
              ? selectedFile.name
              : 'Select a file to edit...'}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--wm)', flexShrink: 0 }}>
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </PopoverTrigger>

        <PopoverContent
          role="listbox"
          aria-label="File list"
          style={{
            background: 'var(--sfm)',
            border: '1px solid var(--bdb)',
            borderRadius: 'var(--rl)',
            boxShadow: DROPDOWN_SHADOW,
            padding: '8px',
            minWidth: '280px',
          }}
        >
          <Input
            ref={searchRef}
            placeholder="Filter files..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter file list"
            style={{
              background: 'var(--sf)',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--r)',
              fontFamily: 'var(--fm)',
              fontSize: '12px',
              color: 'var(--w)',
              padding: '5px 10px',
              marginBottom: '8px',
              width: '100%',
              height: '30px',
            }}
          />

          {!hasResults && (agentsLoading || skillsLoading) && (
            <div style={{ fontFamily: 'var(--fb)', fontSize: '12px', color: 'var(--wm)', textAlign: 'center', padding: '12px 8px' }}>
              Loading...
            </div>
          )}

          {!hasResults && !agentsLoading && !skillsLoading && (
            <div className="fp-empty" style={{ fontFamily: 'var(--fb)', fontSize: '12px', color: 'var(--wm)', textAlign: 'center', padding: '12px 8px' }}>
              No files match
            </div>
          )}

          {filteredAgents.length > 0 && (
            <div className="fp-group">
              <div
                className="fp-group-label"
                style={{
                  fontFamily: 'var(--fb)',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  color: 'var(--wm)',
                  textTransform: 'uppercase',
                  padding: '4px 6px 2px',
                  borderBottom: '1px solid var(--bd)',
                  marginBottom: '4px',
                }}
              >
                Agents
              </div>
              {filteredAgents.map((agent: Agent) => {
                const isSelected = selectedFile?.type === 'agent' && selectedFile.name === agent.name;
                return (
                  <button
                    key={agent.name}
                    role="option"
                    aria-selected={isSelected}
                    className="fp-option"
                    onClick={() => handleSelect('agent', agent.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 'var(--r)',
                      fontFamily: 'var(--fm)',
                      fontSize: '12px',
                      color: isSelected ? 'var(--mt)' : 'var(--wd)',
                      background: isSelected ? 'var(--nav-active-bg)' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.background = FILE_OPTION_HOVER_BG; (e.currentTarget as HTMLButtonElement).style.color = 'var(--w)'; } }}
                    onMouseLeave={(e) => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--wd)'; } }}
                  >
                    {agent.name}
                  </button>
                );
              })}
            </div>
          )}

          {filteredSkills.length > 0 && (
            <div className="fp-group" style={{ marginTop: filteredAgents.length > 0 ? '8px' : '0' }}>
              <div
                className="fp-group-label"
                style={{
                  fontFamily: 'var(--fb)',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  color: 'var(--wm)',
                  textTransform: 'uppercase',
                  padding: '4px 6px 2px',
                  borderBottom: '1px solid var(--bd)',
                  marginBottom: '4px',
                }}
              >
                Skills
              </div>
              {filteredSkills.map((skill: Skill) => {
                const isSelected = selectedFile?.type === 'skill' && selectedFile.name === skill.name;
                return (
                  <button
                    key={skill.name}
                    role="option"
                    aria-selected={isSelected}
                    className="fp-option"
                    onClick={() => handleSelect('skill', skill.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 'var(--r)',
                      fontFamily: 'var(--fm)',
                      fontSize: '12px',
                      color: isSelected ? 'var(--mt)' : 'var(--wd)',
                      background: isSelected ? 'var(--nav-active-bg)' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.background = FILE_OPTION_HOVER_BG; (e.currentTarget as HTMLButtonElement).style.color = 'var(--w)'; } }}
                    onMouseLeave={(e) => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--wd)'; } }}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {selectedFile && (
        <span
          className="type-badge"
          style={{
            background: 'var(--nav-active-bg)',
            border: '1px solid var(--bd)',
            borderRadius: 'var(--r)',
            padding: '2px 7px',
            fontFamily: 'var(--fm)',
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: 'var(--mt)',
            textTransform: 'uppercase',
          }}
        >
          {selectedFile.type}
        </span>
      )}
    </div>
  );
}

// ─── FrontmatterForm ─────────────────────────────────────────────────────────
interface AgentFormValues {
  name: string;
  description: string;
  model: string;
  tools: string[];
  version: string;
  tier: 'core' | 'impl' | 'optional';
}

interface SkillFormValues {
  name: string;
  description: string;
}

interface FrontmatterFormProps {
  fileType: 'agent' | 'skill';
  agentValues: AgentFormValues;
  skillValues: SkillFormValues;
  onAgentChange: (values: AgentFormValues) => void;
  onSkillChange: (values: SkillFormValues) => void;
}

function FrontmatterForm({
  fileType,
  agentValues,
  skillValues,
  onAgentChange,
  onSkillChange,
}: FrontmatterFormProps) {
  const [expanded, setExpanded] = useState(
    typeof window !== 'undefined'
      ? window.innerHeight >= FORM_EXPAND_VIEWPORT_THRESHOLD_PX
      : true,
  );

  const formId = 'fm-fields';

  const summaryText =
    fileType === 'agent'
      ? `${agentValues.name} · ${agentValues.model} · ${agentValues.tier}`
      : `${skillValues.name} · ${skillValues.description.slice(0, 48)}${skillValues.description.length > 48 ? '...' : ''}`;

  const fieldStyle: React.CSSProperties = {
    background: 'var(--sf)',
    border: '1px solid var(--bd)',
    borderRadius: 'var(--r)',
    color: 'var(--w)',
    fontFamily: 'var(--fm)',
    fontSize: '12px',
    padding: '5px 10px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontFamily: 'var(--fb)',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: 'var(--wm)',
    marginBottom: '4px',
    display: 'block',
  };

  function addFieldFocus(e: React.FocusEvent<HTMLElement>) {
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--mt)';
    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--gt)';
  }
  function removeFieldFocus(e: React.FocusEvent<HTMLElement>) {
    (e.currentTarget as HTMLElement).style.borderColor = '';
    (e.currentTarget as HTMLElement).style.boxShadow = '';
  }

  return (
    <div
      className="fm-form"
      style={{
        background: 'var(--sfm)',
        borderRadius: 'var(--rl)',
        border: '1px solid var(--bd)',
        marginBottom: 0,
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        className="fm-toggle"
        aria-expanded={expanded}
        aria-controls={formId}
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          cursor: 'pointer',
          borderRadius: expanded ? 'var(--rl) var(--rl) 0 0' : 'var(--rl)',
          background: 'transparent',
          border: 'none',
          width: '100%',
          color: 'inherit',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = COLLAPSE_TOGGLE_HOVER_BG; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <span className="fm-summary" style={{ fontFamily: 'var(--fm)', fontSize: '11px', color: 'var(--wd)' }}>
          {summaryText}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: 'var(--wm)',
            transition: 'transform 150ms',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {expanded && (
        <fieldset
          id={formId}
          aria-label="File metadata"
          style={{
            border: 'none',
            padding: '0 12px 12px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px 12px',
            margin: 0,
          }}
        >
          <legend className="sr-only">File metadata</legend>

          {fileType === 'agent' ? (
            <>
              <div>
                <label htmlFor="fm-name" style={labelStyle}>Name</label>
                <input
                  id="fm-name"
                  type="text"
                  value={agentValues.name}
                  onChange={(e) => onAgentChange({ ...agentValues, name: e.target.value })}
                  onFocus={addFieldFocus}
                  onBlur={removeFieldFocus}
                  style={{ ...fieldStyle, height: '32px' }}
                />
              </div>

              <div>
                <label htmlFor="fm-model" style={labelStyle}>Model</label>
                <Select
                  value={agentValues.model}
                  onValueChange={(val) => { if (val) onAgentChange({ ...agentValues, model: val }); }}
                >
                  <SelectTrigger
                    id="fm-model"
                    style={{ ...fieldStyle, height: '32px' }}
                    onFocus={addFieldFocus}
                    onBlur={removeFieldFocus}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'var(--sfm)', border: '1px solid var(--bdb)', borderRadius: 'var(--rl)' }}>
                    <SelectItem value="claude-opus-4-5" style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--wd)' }}>opus</SelectItem>
                    <SelectItem value="claude-sonnet-4-5" style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--wd)' }}>sonnet</SelectItem>
                    <SelectItem value="claude-haiku-4-5" style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--wd)' }}>haiku</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label htmlFor="fm-description" style={labelStyle}>Description</label>
                <textarea
                  id="fm-description"
                  value={agentValues.description}
                  onChange={(e) => onAgentChange({ ...agentValues, description: e.target.value })}
                  onFocus={addFieldFocus}
                  onBlur={removeFieldFocus}
                  rows={2}
                  style={{ ...fieldStyle, minHeight: '52px', resize: 'none', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Tools</label>
                <TagInput
                  value={agentValues.tools}
                  onChange={(tools) => onAgentChange({ ...agentValues, tools })}
                />
              </div>

              <div>
                <label htmlFor="fm-version" style={labelStyle}>Version (optional)</label>
                <input
                  id="fm-version"
                  type="text"
                  value={agentValues.version}
                  placeholder="e.g. 1.2.0"
                  onChange={(e) => onAgentChange({ ...agentValues, version: e.target.value })}
                  onFocus={addFieldFocus}
                  onBlur={removeFieldFocus}
                  style={{ ...fieldStyle, height: '32px' }}
                />
              </div>

              <div>
                <label htmlFor="fm-tier" style={labelStyle}>Tier</label>
                <Select
                  value={agentValues.tier}
                  onValueChange={(val) => { if (val) onAgentChange({ ...agentValues, tier: val as 'core' | 'impl' | 'optional' }); }}
                >
                  <SelectTrigger
                    id="fm-tier"
                    style={{ ...fieldStyle, height: '32px' }}
                    onFocus={addFieldFocus}
                    onBlur={removeFieldFocus}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'var(--sfm)', border: '1px solid var(--bdb)', borderRadius: 'var(--rl)' }}>
                    <SelectItem value="core" style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--wd)' }}>core</SelectItem>
                    <SelectItem value="impl" style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--wd)' }}>impl</SelectItem>
                    <SelectItem value="optional" style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--wd)' }}>optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="fm-skill-name" style={labelStyle}>Name</label>
                <input
                  id="fm-skill-name"
                  type="text"
                  value={skillValues.name}
                  onChange={(e) => onSkillChange({ ...skillValues, name: e.target.value })}
                  onFocus={addFieldFocus}
                  onBlur={removeFieldFocus}
                  style={{ ...fieldStyle, height: '32px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label htmlFor="fm-skill-description" style={labelStyle}>Description</label>
                <textarea
                  id="fm-skill-description"
                  value={skillValues.description}
                  onChange={(e) => onSkillChange({ ...skillValues, description: e.target.value })}
                  onFocus={addFieldFocus}
                  onBlur={removeFieldFocus}
                  rows={2}
                  style={{ ...fieldStyle, minHeight: '52px', resize: 'none', lineHeight: '1.5' }}
                />
              </div>
            </>
          )}
        </fieldset>
      )}
    </div>
  );
}

// ─── SplitPane ────────────────────────────────────────────────────────────────
interface SplitPaneProps {
  content: string;
  previewContent: string;
  lineCount: number;
  onContentChange: (val: string) => void;
}

function SplitPane({ content, previewContent, lineCount, onContentChange }: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  function handleDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newLeft = ev.clientX - rect.left;
      const total = rect.width - 5; // subtract divider width
      const clamped = Math.max(PANE_MIN_WIDTH_PX, Math.min(newLeft, total - PANE_MIN_WIDTH_PX));
      setLeftWidth(clamped);
    }

    function onMouseUp() {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function handleEditorKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newVal = target.value.substring(0, start) + '  ' + target.value.substring(end);
      onContentChange(newVal);
      // restore cursor position after React re-render
      requestAnimationFrame(() => {
        target.selectionStart = start + 2;
        target.selectionEnd = start + 2;
      });
    }
  }

  const editorFlexBasis = leftWidth !== null ? `${leftWidth}px` : '50%';

  return (
    <div
      ref={containerRef}
      className="split-pane"
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        marginTop: '12px',
      }}
    >
      {/* Editor pane */}
      <div
        className="editor-pane"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: `0 0 ${editorFlexBasis}`,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <div
          className="pane-header"
          style={{
            height: '32px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            background: 'var(--sfm)',
            borderBottom: '1px solid var(--bd)',
            fontFamily: 'var(--fm)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--wm)',
          }}
        >
          <span>Markdown</span>
          <span>{lineCount} lines</span>
        </div>
        <textarea
          aria-label="Markdown editor"
          aria-multiline="true"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          onKeyDown={handleEditorKeyDown}
          spellCheck={false}
          style={{
            flex: 1,
            minHeight: 0,
            display: 'block',
            width: '100%',
            background: 'var(--sf)',
            color: 'var(--w)',
            fontFamily: 'var(--fm)',
            fontSize: '13px',
            lineHeight: '1.6',
            padding: '12px 14px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflowY: 'auto',
            tabSize: 2,
            wordWrap: 'break-word' as const,
            caretColor: 'var(--mt)',
          }}
        />
      </div>

      {/* Divider */}
      <div
        className="pane-divider"
        role="separator"
        aria-label="Drag to resize panes"
        onMouseDown={handleDividerMouseDown}
        style={{
          width: '5px',
          flexShrink: 0,
          background: 'var(--bd)',
          cursor: 'col-resize',
          position: 'relative',
          transition: 'background 0.1s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = 'var(--bdb)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = DIVIDER_HOVER_SHADOW;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = 'var(--bd)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--wm)',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          ⋮
        </span>
      </div>

      {/* Preview pane */}
      <div
        className="preview-pane"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <div
          className="pane-header"
          style={{
            height: '32px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            background: 'var(--sfm)',
            borderBottom: '1px solid var(--bd)',
            fontFamily: 'var(--fm)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--wm)',
          }}
        >
          <span>Preview</span>
        </div>
        <div
          role="region"
          aria-label="Markdown preview"
          aria-live="polite"
          className="preview-content"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '14px 18px',
            background: 'var(--sf)',
          }}
        >
          <ReactMarkdown>{previewContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// ─── SaveAsNewDialog ──────────────────────────────────────────────────────────
interface SaveAsNewDialogProps {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}

function SaveAsNewDialog({ open, currentName, onClose, onConfirm }: SaveAsNewDialogProps) {
  const [newName, setNewName] = useState(currentName ? `${currentName}-copy` : '');

  useEffect(() => {
    if (open) setNewName(currentName ? `${currentName}-copy` : '');
  }, [open, currentName]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        style={{
          background: 'var(--sfh)',
          border: '1px solid var(--bdb)',
          borderRadius: 'var(--rl)',
          color: 'var(--w)',
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--fh)', color: 'var(--w)', fontSize: '16px' }}>
            Save as New File
          </DialogTitle>
        </DialogHeader>

        <div>
          <label
            htmlFor="save-as-new-name"
            style={{
              fontSize: '10px',
              fontFamily: 'var(--fb)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--wm)',
              marginBottom: '6px',
              display: 'block',
            }}
          >
            New filename
          </label>
          <input
            id="save-as-new-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) { onConfirm(newName.trim()); } }}
            autoFocus
            style={{
              background: 'var(--sf)',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--r)',
              color: 'var(--w)',
              fontFamily: 'var(--fm)',
              fontSize: '12px',
              padding: '6px 10px',
              width: '100%',
              outline: 'none',
            }}
            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--mt)'; (e.currentTarget as HTMLInputElement).style.boxShadow = 'var(--gt)'; }}
            onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = ''; (e.currentTarget as HTMLInputElement).style.boxShadow = ''; }}
          />
        </div>

        <DialogFooter>
          <DialogClose
            style={{
              background: 'transparent',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--r)',
              color: 'var(--wd)',
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              padding: '4px 12px',
              cursor: 'pointer',
              height: '28px',
            }}
            onClick={onClose}
          >
            Cancel
          </DialogClose>
          <Button
            size="sm"
            disabled={!newName.trim()}
            onClick={() => { if (newName.trim()) onConfirm(newName.trim()); }}
            style={{ background: 'var(--mt)', color: 'var(--void)', fontFamily: 'var(--fb)', fontSize: '12px', fontWeight: '600', border: 'none' }}
          >
            Save as New
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── EditPage (main) ──────────────────────────────────────────────────────────
export default function EditPage() {
  const {
    selectedFile,
    isDirty,
    saveStatus,
    saveError,
    setSelectedFile,
    setIsDirty,
    setSaveStatus,
    setSaveError,
  } = useEditStore();

  const [content, setContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [agentValues, setAgentValues] = useState<AgentFormValues>({
    name: '',
    description: '',
    model: 'claude-sonnet-4-5',
    tools: [],
    version: '',
    tier: 'optional',
  });
  const [skillValues, setSkillValues] = useState<SkillFormValues>({
    name: '',
    description: '',
  });
  const [saveAsNewOpen, setSaveAsNewOpen] = useState(false);
  const saveSuccessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // tRPC queries for selected file
  const agentQuery = trpc.agent.get.useQuery(
    { name: selectedFile?.name ?? '' },
    { enabled: selectedFile?.type === 'agent' && !!selectedFile.name },
  );
  const skillQuery = trpc.skill.get.useQuery(
    { name: selectedFile?.name ?? '' },
    { enabled: selectedFile?.type === 'skill' && !!selectedFile.name },
  );

  const isLoading =
    (selectedFile?.type === 'agent' && agentQuery.isLoading) ||
    (selectedFile?.type === 'skill' && skillQuery.isLoading);

  // Populate form when data loads
  useEffect(() => {
    if (selectedFile?.type === 'agent' && agentQuery.data) {
      const a = agentQuery.data;
      setAgentValues({
        name: a.name,
        description: a.description,
        model: a.model,
        tools: a.tools,
        version: a.version ?? '',
        tier: a.tier,
      });
      setContent(a.body);
      setPreviewContent(a.body);
      setIsDirty(false);
    }
  }, [agentQuery.data, selectedFile?.type, setIsDirty]);

  useEffect(() => {
    if (selectedFile?.type === 'skill' && skillQuery.data) {
      const s = skillQuery.data;
      setSkillValues({
        name: s.name,
        description: s.description,
      });
      setContent(s.body);
      setPreviewContent(s.body);
      setIsDirty(false);
    }
  }, [skillQuery.data, selectedFile?.type, setIsDirty]);

  // Debounced preview update
  function handleContentChange(val: string) {
    setContent(val);
    setIsDirty(true);
    if (previewDebounceTimer.current) clearTimeout(previewDebounceTimer.current);
    previewDebounceTimer.current = setTimeout(() => {
      setPreviewContent(val);
    }, PREVIEW_DEBOUNCE_MS);
  }

  function handleAgentFormChange(vals: AgentFormValues) {
    setAgentValues(vals);
    setIsDirty(true);
  }

  function handleSkillFormChange(vals: SkillFormValues) {
    setSkillValues(vals);
    setIsDirty(true);
  }

  // Save handler
  const handleSave = useCallback(async () => {
    if (!selectedFile || saveStatus === 'saving') return;
    setSaveStatus('saving');
    setSaveError(null);
    try {
      await saveStub();
      setSaveStatus('saved');
      setIsDirty(false);
      if (saveSuccessTimer.current) clearTimeout(saveSuccessTimer.current);
      saveSuccessTimer.current = setTimeout(() => {
        setSaveStatus('idle');
      }, SAVE_SUCCESS_DURATION_MS);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSaveStatus('error');
      setSaveError(`Save failed: ${msg}`);
    }
  }, [selectedFile, saveStatus, setSaveStatus, setSaveError, setIsDirty]);

  // Ctrl/Cmd+S shortcut
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (selectedFile && isDirty) handleSave();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, isDirty, handleSave]);

  // beforeunload warning
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty && selectedFile) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes';
        return 'You have unsaved changes';
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, selectedFile]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (saveSuccessTimer.current) clearTimeout(saveSuccessTimer.current);
      if (previewDebounceTimer.current) clearTimeout(previewDebounceTimer.current);
    };
  }, []);

  const isSaving = saveStatus === 'saving';
  const canSave = !!selectedFile && isDirty && !isSaving;
  const fileName = selectedFile?.name ?? '';
  const lineCount = content ? content.split('\n').length : 0;

  return (
    <div
      data-testid="edit-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* FilePicker */}
      <FilePicker
        selectedFile={selectedFile}
        isDirty={isDirty}
        onSelect={(file) => {
          setSelectedFile(file);
          setIsDirty(false);
          setSaveStatus('idle');
          setSaveError(null);
        }}
      />

      {/* FrontmatterForm — only when file selected */}
      {selectedFile && !isLoading && (
        <FrontmatterForm
          fileType={selectedFile.type}
          agentValues={agentValues}
          skillValues={skillValues}
          onAgentChange={handleAgentFormChange}
          onSkillChange={handleSkillFormChange}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            marginTop: '12px',
            borderRadius: 'var(--r)',
            background: 'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }}
        />
      )}

      {/* Empty state */}
      {!selectedFile && (
        <div
          className="edit-empty"
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: 'var(--mg)',
              boxShadow: '0 0 5px var(--mg)',
              display: 'block',
            }}
          />
          <p style={{ fontFamily: 'var(--fh)', fontSize: '15px', color: 'var(--wd)', margin: 0 }}>
            Select a file to edit
          </p>
          <p style={{ fontFamily: 'var(--fb)', fontSize: '12px', color: 'var(--wm)', textAlign: 'center', maxWidth: '280px', margin: 0 }}>
            Choose an agent or skill file from the picker above
          </p>
        </div>
      )}

      {/* SplitPane — only when file loaded */}
      {selectedFile && !isLoading && (
        <SplitPane
          content={content}
          previewContent={previewContent}
          lineCount={lineCount}
          onContentChange={handleContentChange}
        />
      )}

      {/* ActionBar */}
      <div
        className="action-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0 0 0',
          borderTop: '1px solid var(--bd)',
          flexShrink: 0,
          marginTop: '8px',
          background: 'transparent',
        }}
      >
        {/* Status region */}
        <div
          role="status"
          aria-live="polite"
          className="status-region"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {saveStatus === 'saving' && (
            <>
              <span className="status-text" style={{ fontFamily: 'var(--fm)', fontSize: '11px', letterSpacing: '0.08em', color: 'var(--wm)' }}>
                Saving...
              </span>
              <Loader2
                aria-hidden="true"
                style={{ width: '14px', height: '14px', color: 'var(--wm)', animation: 'spin 1s linear infinite' }}
              />
            </>
          )}
          {saveStatus === 'saved' && (
            <span className="status-text" style={{ fontFamily: 'var(--fm)', fontSize: '11px', letterSpacing: '0.08em', color: 'var(--mg)' }}>
              Saved
            </span>
          )}
          {saveStatus === 'idle' && isDirty && selectedFile && (
            <span className="status-text" style={{ fontFamily: 'var(--fm)', fontSize: '11px', letterSpacing: '0.08em', color: 'var(--my)' }}>
              Unsaved changes
            </span>
          )}
          {saveStatus === 'error' && saveError && (
            <span className="save-error" style={{ fontFamily: 'var(--fb)', fontSize: '11px', color: 'var(--redb)' }}>
              {saveError}
            </span>
          )}
        </div>

        {/* Button group */}
        <div className="btn-group" style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            aria-label="Save as new file"
            disabled={!selectedFile || isSaving}
            onClick={() => setSaveAsNewOpen(true)}
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              borderColor: 'var(--bd)',
              color: 'var(--wd)',
              background: 'transparent',
            }}
          >
            Save as New
          </Button>
          <Button
            size="sm"
            aria-busy={isSaving}
            aria-disabled={!canSave}
            aria-label={fileName ? `Save changes to ${fileName}` : 'Save changes'}
            disabled={!canSave}
            onClick={handleSave}
            style={{
              background: 'var(--mt)',
              color: 'var(--void)',
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              fontWeight: '600',
              border: 'none',
              boxShadow: isDirty && !isSaving ? 'var(--dirty-pulse)' : 'none',
              opacity: isSaving ? 0.6 : undefined,
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Save As New Dialog */}
      <SaveAsNewDialog
        open={saveAsNewOpen}
        currentName={fileName}
        onClose={() => setSaveAsNewOpen(false)}
        onConfirm={(newName) => {
          setSaveAsNewOpen(false);
          console.warn(`[EditPage] save stub — trpc.agent.save not yet implemented (new name: ${newName})`);
          handleSave();
        }}
      />
    </div>
  );
}
