import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../engine/useGameStore';
import type { AttributeKey } from '../types';

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  money: '金',
  energy: '体',
  skill: '能',
  connections: '脉',
  mentalHealth: '心',
};

const ATTRIBUTE_COLORS: Record<AttributeKey, string> = {
  money: 'bg-secondary',
  energy: 'bg-accent',
  skill: 'bg-sticker-teal',
  connections: 'bg-sticker-pink',
  mentalHealth: 'bg-primary',
};

export default function AttributeBar() {
  const [expanded, setExpanded] = useState(false);
  const attributes = useGameStore((s) => s.attributes);

  return (
    <div
      className="sticky top-0 z-20 bg-surface border-b-2 border-foreground h-14 flex items-center px-4 cursor-pointer select-none"
      onClick={() => setExpanded((v) => !v)}
      role="button"
      aria-expanded={expanded}
      aria-label="属性栏，点击展开"
    >
      <div className="flex-1 flex items-center justify-between gap-2">
        {Object.entries(attributes).map(([key, value]) => {
          const attrKey = key as AttributeKey;
          const isMental = attrKey === 'mentalHealth';
          const mentalWarning = isMental && value <= 30;
          return (
            <div key={key} className="flex flex-col items-center gap-0.5 min-w-[44px]">
              <span className="text-caption text-muted font-sans">{ATTRIBUTE_LABELS[attrKey]}</span>
              <span
                className={`text-label font-mono font-medium ${
                  mentalWarning ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {value}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 left-0 right-0 bg-surface border-b-2 border-foreground px-4 py-3 overflow-hidden"
          >
            <div className="space-y-2">
              {Object.entries(attributes).map(([key, value]) => {
                const attrKey = key as AttributeKey;
                const isMental = attrKey === 'mentalHealth';
                const fillColor =
                  isMental && value <= 30 ? 'bg-destructive' : ATTRIBUTE_COLORS[attrKey];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-caption text-muted w-6 text-center">
                      {ATTRIBUTE_LABELS[attrKey]}
                    </span>
                    <div className="flex-1 h-2 bg-border rounded-sm overflow-hidden">
                      <motion.div
                        className={`h-full rounded-sm ${fillColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                    <span className="text-caption font-mono w-8 text-right">{value}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
