import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DiceResult } from '../types';
import { useDiceAnimation } from '../hooks/useDiceAnimation';

interface DiceRollProps {
  active: boolean;
  result?: DiceResult;
  onDismiss: () => void;
}

export default function DiceRoll({ active, result, onDismiss }: DiceRollProps) {
  const { phase, displayedValue } = useDiceAnimation(active, result);

  useEffect(() => {
    if (phase !== 'settled') return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, onDismiss]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onDismiss}
          role="dialog"
          aria-modal="true"
          aria-label="命运骰子"
        >
          <motion.div
            animate={
              phase === 'rolling'
                ? { x: [-4, 4, -4, 4, 0], rotate: [-5, 5, -5, 5, 0] }
                : { x: 0, rotate: 0 }
            }
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 bg-surface border-2 border-foreground rounded-xl flex items-center justify-center shadow-modal">
              <span className="text-hero font-mono">{displayedValue}</span>
            </div>
            {phase === 'settled' && result && (
              <div className="text-center">
                <p className="text-title text-on-primary font-bold">
                  命运骰子：{result.value}
                </p>
                <p
                  className={`text-body font-medium ${
                    result.success ? 'text-accent' : 'text-destructive'
                  }`}
                >
                  {result.success ? '✓ 命运眷顾' : '✗ 命运弄人'}
                </p>
                {result.modifier !== 0 && (
                  <p className="text-caption text-muted mt-1">
                    修正值：{result.modifier > 0 ? '+' : ''}
                    {result.modifier}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
