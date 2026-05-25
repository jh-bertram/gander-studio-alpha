import type { ChangeEvent } from 'react';
import type { Session } from '@gander-studio/shared';
import { Textarea } from '../../../components/ui/textarea';
import { useSessionRaw } from '../../../hooks/useSessionRaw';
import { useSessionSave } from '../../../hooks/useSessionSave';
import { useSessionStore } from '../../../store/session-store';

interface Props {
  session: Session;
}

export default function EditorTab({ session }: Props) {
  // Seed editBuffer and originalContent from the server on mount.
  // SC6: useSessionRaw only writes editBuffer when the buffer is currently
  // empty — it never overwrites unsaved user edits already in the store.
  const { isLoading: rawLoading, error: rawError } = useSessionRaw(session.id);

  const editBuffer      = useSessionStore((s) => s.editBuffer);
  const originalContent = useSessionStore((s) => s.originalContent);
  const lastSaveResult  = useSessionStore((s) => s.lastSaveResult);
  const lastSaveError   = useSessionStore((s) => s.lastSaveError);
  const setEditBuffer     = useSessionStore((s) => s.setEditBuffer);
  const setLastSaveResult = useSessionStore((s) => s.setLastSaveResult);

  const { mutate, isLoading: saveLoading } = useSessionSave();

  const isDirty          = editBuffer !== originalContent;
  const isSaveDisabled   = !isDirty || saveLoading;
  const isRevertDisabled = !isDirty;

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    setEditBuffer(e.target.value);
    // Clear stale success message when user resumes editing (SC6).
    setLastSaveResult(null);
  }

  function handleSave(): void {
    mutate({ id: session.id, content: editBuffer });
  }

  function handleRevert(): void {
    setEditBuffer(originalContent);
  }

  return (
    <div
      data-testid="editor-tab"
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '72px' }}
    >

      {/* Save target / success affordance */}
      <div
        aria-live="polite"
        style={{
          fontFamily:    'var(--fm)',
          fontSize:      '11px',
          color:         lastSaveResult ? 'var(--mt)' : 'var(--wd)',
          letterSpacing: '0.03em',
        }}
      >
        {lastSaveResult
          ? `Saved to: ${lastSaveResult.filePath}`
          : `Save target: ${session.id}.md`}
      </div>

      {/* Loading skeleton while raw content is being fetched */}
      {rawLoading && (
        <div
          aria-busy="true"
          style={{
            height:         '200px',
            borderRadius:   'var(--rl)',
            background:     'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
            backgroundSize: '200% 100%',
            animation:      'shimmer 1.4s ease-in-out infinite',
          }}
        >
          <span className="sr-only">Loading session content…</span>
        </div>
      )}

      {/* Raw-fetch error state */}
      {!rawLoading && rawError != null && (
        <div
          role="alert"
          style={{
            borderLeft:   '3px solid var(--redb)',
            background:   'var(--sfm)',
            borderRadius: 'var(--rl)',
            padding:      '10px 14px',
            fontFamily:   'var(--fm)',
            fontSize:     '12px',
            color:        'var(--redb)',
          }}
        >
          {rawError instanceof Error ? rawError.message : String(rawError)}
        </div>
      )}

      {/* Textarea editor — only rendered when content is available */}
      {!rawLoading && rawError == null && (
        <Textarea
          aria-label="Session markdown editor"
          value={editBuffer}
          onChange={handleChange}
          rows={24}
          style={{
            fontFamily:  'var(--fm)',
            fontSize:    '12px',
            resize:      'vertical',
            color:       'var(--w)',
            background:  'var(--sfm)',
            border:      '1px solid var(--bd)',
            padding:     '10px 12px',
            caretColor:  'var(--mt)',
          }}
        />
      )}

      {/* Action buttons */}
      {!rawLoading && rawError == null && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            data-testid="save-edit-button"
            disabled={isSaveDisabled}
            onClick={handleSave}
            aria-label="Save session edit"
            style={{
              background:    isSaveDisabled ? 'var(--sfm)' : 'var(--mt)',
              color:         isSaveDisabled ? 'var(--wm)' : 'var(--sfb)',
              border:        '1px solid var(--bd)',
              borderRadius:  'var(--rl)',
              fontFamily:    'var(--fb)',
              fontSize:      '12px',
              fontWeight:    600,
              letterSpacing: '0.06em',
              padding:       '6px 16px',
              cursor:        isSaveDisabled ? 'not-allowed' : 'pointer',
              opacity:       isSaveDisabled ? 0.55 : 1,
              transition:    'background 120ms, color 120ms, opacity 120ms',
            }}
          >
            {saveLoading ? 'Saving…' : 'Save edit'}
          </button>

          <button
            data-testid="revert-button"
            disabled={isRevertDisabled}
            onClick={handleRevert}
            aria-label="Revert to original content"
            style={{
              background:    'none',
              color:         isRevertDisabled ? 'var(--wm)' : 'var(--wd)',
              border:        '1px solid var(--bd)',
              borderRadius:  'var(--rl)',
              fontFamily:    'var(--fb)',
              fontSize:      '12px',
              fontWeight:    400,
              letterSpacing: '0.04em',
              padding:       '6px 16px',
              cursor:        isRevertDisabled ? 'not-allowed' : 'pointer',
              opacity:       isRevertDisabled ? 0.55 : 1,
              transition:    'color 120ms, opacity 120ms',
            }}
          >
            Revert to original
          </button>
        </div>
      )}

      {/* Inline save-error alert — SC7: editBuffer is NOT cleared on error */}
      {lastSaveError != null && (
        <div
          role="alert"
          style={{
            borderLeft:   '3px solid var(--redb)',
            background:   'var(--sfm)',
            borderRadius: 'var(--rl)',
            padding:      '10px 14px',
            fontFamily:   'var(--fm)',
            fontSize:     '12px',
            color:        'var(--redb)',
          }}
        >
          {lastSaveError}
        </div>
      )}
    </div>
  );
}
