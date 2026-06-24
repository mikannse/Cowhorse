import type { GameStateSnapshot, MemeCheck } from '../types';
import { evaluateCondition } from '../utils/conditions';

export type MemeOutcome = 'correct' | 'wrong' | 'none';

export interface MemeEvaluation {
  outcome: MemeOutcome;
  value: number;
}

export function evaluateMeme(
  state: GameStateSnapshot,
  memeCheck: MemeCheck
): MemeEvaluation {
  if (evaluateCondition(state, memeCheck.correctTiming)) {
    return { outcome: 'correct', value: memeCheck.buff };
  }
  if (evaluateCondition(state, memeCheck.wrongTiming)) {
    return { outcome: 'wrong', value: -memeCheck.debuff };
  }
  return { outcome: 'none', value: 0 };
}
