import type { ReactElement } from 'react';

interface Props {
  error: unknown;
  /**
   * Fallback message rendered when `error` is not an Error instance or string.
   * Defaults to 'An unexpected error occurred.' — pass a custom string for
   * domain-specific cold-path messaging (e.g. AnalyzeTab).
   */
  fallbackMessage?: string;
}

/**
 * Shared error banner used by BrowsePage, SessionListPage, SessionDetailPage,
 * and AnalyzeTab. Renders a left-border alert box with a LOAD ERROR label and
 * the resolved error message.
 *
 * AnalyzeTab passes fallbackMessage='Failed to load analysis data.' to preserve
 * its domain-specific cold-path copy (MERGE SC6).
 */
export default function ErrorState({
  error,
  fallbackMessage = 'An unexpected error occurred.',
}: Props): ReactElement {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : fallbackMessage;

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
