import { useMemo } from 'react';
import type { Agent, Skill, Hook } from '@gander-studio/shared';
import { trpc } from '../trpc';
import { useBrowseStore } from '../store/browse-store';

export interface BrowseData {
  agents:    Agent[];
  skills:    Skill[];
  hooks:     Hook[];
  isLoading: boolean;
  error:     unknown;
}

/** Normalise a model string to opus/sonnet/haiku bucket for filtering. */
function normaliseModel(model: string): 'opus' | 'sonnet' | 'haiku' | 'other' {
  const lower = model.toLowerCase();
  if (lower.includes('opus'))   return 'opus';
  if (lower.includes('sonnet')) return 'sonnet';
  if (lower.includes('haiku'))  return 'haiku';
  return 'other';
}

export function useBrowseData(): BrowseData {
  const { typeFilter, tierFilter, modelFilter, search } = useBrowseStore();

  const agentsQ = trpc.agent.list.useQuery(undefined, { enabled: typeFilter === 'all' || typeFilter === 'agents' });
  const skillsQ = trpc.skill.list.useQuery(undefined, { enabled: typeFilter === 'all' || typeFilter === 'skills' });
  const hooksQ  = trpc.hook.list.useQuery(undefined,  { enabled: typeFilter === 'all' || typeFilter === 'hooks'  });

  const isLoading = agentsQ.isLoading || skillsQ.isLoading || hooksQ.isLoading;
  const error = agentsQ.error ?? skillsQ.error ?? hooksQ.error ?? null;

  const needle = search.trim().toLowerCase();

  const agents = useMemo<Agent[]>(() => {
    const raw = agentsQ.data ?? [];
    return raw.filter((a) => {
      if (tierFilter  !== 'all' && a.tier !== tierFilter) return false;
      if (modelFilter !== 'all' && normaliseModel(a.model) !== modelFilter) return false;
      if (needle && !a.name.toLowerCase().includes(needle) && !a.description.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [agentsQ.data, tierFilter, modelFilter, needle]);

  const skills = useMemo<Skill[]>(() => {
    const raw = skillsQ.data ?? [];
    return raw.filter((s) => {
      if (needle && !s.name.toLowerCase().includes(needle) && !s.description.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [skillsQ.data, needle]);

  const hooks = useMemo<Hook[]>(() => {
    const raw = hooksQ.data ?? [];
    return raw.filter((h) => {
      if (needle && !h.matcher.toLowerCase().includes(needle) && !h.command.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [hooksQ.data, needle]);

  return { agents, skills, hooks, isLoading, error };
}
