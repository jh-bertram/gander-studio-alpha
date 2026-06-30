export interface SessionTabDef {
  id: string;
  label: string;
  placeholder?: boolean;
}

export const SESSION_TABS: SessionTabDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'table',    label: 'Table' },
  { id: 'editor',   label: 'Editor' },
  { id: 'analyze',  label: 'Analyze' },
];

// Badge copy — single-sourced per UI-t3 design_spec §badge_copy.
// Rendered with textTransform:'uppercase' in CSS so the literal stays title-case.
export const SESSION_NO_DOC_BADGE = 'No after-action';

// Editor read-only notice copy for doc-less (synthetic) sessions.
export const SESSION_EDITOR_READONLY_MSG = 'No after-action document yet — read-only';
