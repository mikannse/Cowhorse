import type { DiceResult } from '../types';

const MIN_MODIFIER = -3;
const MAX_MODIFIER = 3;

export function rollDice(rawModifier = 0): DiceResult {
  const modifier = Math.max(MIN_MODIFIER, Math.min(MAX_MODIFIER, rawModifier));
  const rawValue = Math.floor(Math.random() * 6) + 1;
  const value = Math.max(1, Math.min(6, rawValue + modifier));
  return {
    value,
    success: value >= 4,
    modifier,
  };
}

export function cappedModifier(rawModifier: number): number {
  return Math.max(MIN_MODIFIER, Math.min(MAX_MODIFIER, rawModifier));
}
