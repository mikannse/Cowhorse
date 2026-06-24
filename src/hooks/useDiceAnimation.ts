import { useEffect, useState } from 'react';
import type { DiceResult } from '../types';

type DicePhase = 'idle' | 'rolling' | 'settled';

export interface DiceAnimationState {
  phase: DicePhase;
  displayedValue: number;
}

export function useDiceAnimation(
  active: boolean,
  result: DiceResult | undefined
): DiceAnimationState {
  const [phase, setPhase] = useState<DicePhase>('idle');
  const [displayedValue, setDisplayedValue] = useState(1);

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }

    setPhase('rolling');
    let counter = 0;
    const rollInterval = setInterval(() => {
      setDisplayedValue(Math.floor(Math.random() * 6) + 1);
      counter += 1;
      if (counter >= 10) {
        clearInterval(rollInterval);
        setDisplayedValue(result?.value ?? 1);
        setPhase('settled');
      }
    }, 80);

    return () => clearInterval(rollInterval);
  }, [active, result]);

  return { phase, displayedValue };
}
