import type { Attributes, GameEffect } from '../types';

export interface EffectResult {
  attributes: Attributes;
  changes: { target: keyof Attributes; delta: number; label?: string }[];
}

export function applyEffects(current: Attributes, effects: GameEffect[]): EffectResult {
  const next: Attributes = { ...current };
  const changes: EffectResult['changes'] = [];

  for (const effect of effects) {
    if (!(effect.target in next)) {
      console.warn(`[CowHorse] Invalid effect target: "${effect.target}" — skipping`);
      continue;
    }
    next[effect.target] += effect.value;
    changes.push({
      target: effect.target,
      delta: effect.value,
      label: effect.label,
    });
  }

  // Clamp values to a sane range; the exact bounds are content concerns.
  (Object.keys(next) as (keyof Attributes)[]).forEach((key) => {
    next[key] = Math.max(0, Math.min(100, next[key]));
  });

  return { attributes: next, changes };
}
