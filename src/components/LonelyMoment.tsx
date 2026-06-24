import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../engine/useGameStore';

export default function LonelyMoment() {
  const text = useGameStore((s) => s.lonelyMoment);
  const setLonelyMoment = useGameStore((s) => s.setLonelyMoment);

  useEffect(() => {
    if (!text) return;
    const timer = setTimeout(() => setLonelyMoment(null), 4000);
    return () => clearTimeout(timer);
  }, [text, setLonelyMoment]);

  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/85 p-6"
          onClick={() => setLonelyMoment(null)}
          role="dialog"
          aria-modal="true"
          aria-live="polite"
        >
          <p className="text-title text-center text-surface leading-relaxed max-w-xs">
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
