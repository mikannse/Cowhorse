import endingsJson from '../content/endings.json';
import type { Ending, GameStateSnapshot } from '../types';
import { evaluateCondition } from './conditions';

const endings = endingsJson as unknown as Ending[];

export interface ResolvedEnding {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'route' | 'hidden';
}

export function evaluateEnding(state: GameStateSnapshot): ResolvedEnding {
  for (const ending of endings) {
    if (evaluateCondition(state, ending.condition)) {
      return {
        id: ending.id,
        title: ending.title,
        description: ending.description,
        rarity: ending.rarity,
      };
    }
  }
  const fallback = endings.find((e) => e.id === 'stable_retirement');
  if (fallback) {
    return {
      id: fallback.id,
      title: fallback.title,
      description: fallback.description,
      rarity: fallback.rarity,
    };
  }
  return {
    id: 'unknown',
    title: '未完待续',
    description: '你的故事还没有被写完。',
    rarity: 'common',
  };
}

export function getEndingById(id: string): ResolvedEnding | undefined {
  const found = endings.find((e) => e.id === id);
  if (!found) return undefined;
  return {
    id: found.id,
    title: found.title,
    description: found.description,
    rarity: found.rarity,
  };
}
