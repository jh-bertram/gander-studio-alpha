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
