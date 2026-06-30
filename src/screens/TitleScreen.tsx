import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <p className="text-title text-primary font-bold tracking-tight text-center">COWHORSE</p>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.25 }}
        className="w-full max-w-xs mt-12"
      >
        <button type="button" onClick={handleStart} className="btn-primary">
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

      {/* GitHub footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.25 }}
        className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5"
      >
        <a
          href="https://github.com/mikannse"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors duration-150"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-caption">Author: mikannse</span>
        </a>
      </motion.footer>

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
                <li>结局可保存为人生简历海报。</li>
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
