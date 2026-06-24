import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../engine/useGameStore';

export default function TitleScreen() {
  const navigate = useNavigate();
  const startGame = useGameStore((s) => s.startGame);
  const [showAbout, setShowAbout] = useState(false);

  const handleStart = () => {
    startGame();
    navigate('/game');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -6 }}
        animate={{ scale: 1, opacity: 1, rotate: -2 }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative bg-surface border-2 border-foreground rounded-xl px-8 py-6 shadow-card"
      >
        {/* Tape accent */}
        <div className="absolute -top-2 -left-4 w-16 h-1.5 bg-tape rotate-[5deg]" />
        <h1 className="text-hero text-foreground tracking-tight">社畜模拟器</h1>
        <p className="text-title text-primary font-bold tracking-tight text-center">
          COWHORSE
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.25 }}
        className="text-body text-foreground text-center max-w-[280px] mt-8"
      >
        从大四到退休，你打算怎么活？
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.25 }}
        className="mt-3"
      >
        <span className="inline-block bg-tape/40 text-foreground text-caption font-bold px-3 py-1 rounded rotate-[2deg]">
          15-20 分钟一局
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.25 }}
        className="w-full max-w-xs mt-12"
      >
        <button
          type="button"
          onClick={handleStart}
          className="btn-primary"
        >
          开始游戏
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.25 }}
        type="button"
        onClick={() => setShowAbout(true)}
        className="mt-4 text-body text-muted underline underline-offset-4 hover:text-primary focus-ring rounded"
      >
        玩法说明
      </motion.button>

      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={() => setShowAbout(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25 }}
              className="bg-surface w-full max-w-md rounded-t-2xl p-6 shadow-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-title text-foreground mb-3">玩法说明</h2>
              <ul className="space-y-2 text-body text-foreground">
                <li>阅读事件文本，做出你的选择。</li>
                <li>每个选择会影响金钱、体力、能力、人脉和心态五项属性。</li>
                <li>心态归零会立即触发结局。</li>
                <li>某些重要事件需要掷命运骰子，结果决定可选路线。</li>
                <li>一局约 15-20 分钟，结局可保存为人生简历海报。</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                className="btn-primary mt-6"
              >
                知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
