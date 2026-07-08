import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../ui-store';

describe('useUIStore — selectedAgentCode contract (s2-to-s3-nav-contract)', () => {
  beforeEach(() => {
    useUIStore.setState({ selectedAgentCode: null });
  });

  it('initializes to null', () => {
    expect(useUIStore.getState().selectedAgentCode).toBeNull();
  });

  it('setSelectedAgentCode updates the store and is readable back', () => {
    useUIStore.getState().setSelectedAgentCode('FE');
    expect(useUIStore.getState().selectedAgentCode).toBe('FE');
  });

  it('setSelectedAgentCode(null) clears a prior selection', () => {
    useUIStore.getState().setSelectedAgentCode('FE');
    useUIStore.getState().setSelectedAgentCode(null);
    expect(useUIStore.getState().selectedAgentCode).toBeNull();
  });
});
