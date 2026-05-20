// stub — replaced by t4a
export interface SessionStore {
  selectedSessionId: string | null;
}

export const useSessionStore = (): SessionStore => ({
  selectedSessionId: null,
});
