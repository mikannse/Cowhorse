import { useEffect, useRef } from 'react';
import type { Choice } from '../types';

const TARGET_LABELS: Record<import('../types').AttributeKey, string> = {
  money: '金钱',
  energy: '体力',
  skill: '能力',
  connections: '人脉',
  mentalHealth: '心态',
};

interface ChoicePanelProps {
  choices: Choice[];
  onChoose: (index: number) => void;
  disabled?: boolean;
}

export default function ChoicePanel({ choices, onChoose, disabled }: ChoicePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const first = containerRef.current?.querySelector('button');
    if (first instanceof HTMLElement) {
      first.focus();
    }
  }, [choices]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3"
      role="group"
      aria-label="选择"
    >
      {choices.map((choice, index) => {
        const pills = choice.effects.map((effect, i) => {
          const sign = effect.value > 0 ? '+' : '';
          const label = effect.label ?? TARGET_LABELS[effect.target];
          return (
            <span
              key={i}
              className={`text-caption font-mono px-2 py-0.5 rounded ${
                effect.value >= 0
                  ? 'bg-primary/10 text-primary'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {`${sign}${effect.value} ${label}`}
            </span>
          );
        });

        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onChoose(index)}
            className="choice-button w-full flex items-center justify-between gap-3 text-left disabled:opacity-50 disabled:cursor-not-allowed focus-ring rounded-xl"
          >
            <span className="text-body leading-relaxed">{choice.text}</span>
            <span className="flex flex-wrap justify-end gap-1 shrink-0">{pills}</span>
          </button>
        );
      })}
    </div>
  );
}
