import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import constants from '../content/constants.json';
import { useGameStore } from '../engine/useGameStore';

function formatTimestamp(date = new Date()): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function MomentsFeed() {
  const moments = useGameStore((s) => s.momentsFeed);
  const clearMoments = useGameStore((s) => s.clearMoments);

  const moment = moments[moments.length - 1];

  const [replyCount, setReplyCount] = useState(0);

  useEffect(() => {
    if (!moment) {
      setReplyCount(0);
      return;
    }
    const count = Math.min(
      moment.replyPool.length,
      Math.max(
        constants.moments.repliesPerPost.min,
        Math.floor(Math.random() * (constants.moments.repliesPerPost.max + 1))
      )
    );
    setReplyCount(count);
  }, [moment?.templateId]);

  useEffect(() => {
    if (!moment) return;
    const timer = setTimeout(() => clearMoments(), 6000);
    return () => clearTimeout(timer);
  }, [moment, clearMoments]);

  const replies = useMemo(() => {
    if (!moment) return [];
    return moment.replyPool.slice(0, replyCount);
  }, [moment, replyCount]);

  return (
    <AnimatePresence>
      {moment && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 bg-surface rounded-t-2xl shadow-sheet max-h-[80vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="朋友圈"
        >
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-label font-bold text-primary">
                我
              </div>
              <div>
                <p className="text-label font-bold text-foreground">我</p>
                <p className="text-caption text-muted">{formatTimestamp()}</p>
              </div>
            </div>

            <p className="text-body text-foreground">{moment.text}</p>

            {replies.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                {replies.map((reply, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-border shrink-0" />
                    <span className="text-body text-foreground">{reply}</span>
                  </div>
                ))}
              </div>
            )}

            <button type="button" onClick={() => clearMoments()} className="btn-primary mt-2">
              继续
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
