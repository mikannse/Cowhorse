import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AttributeBar from '../components/AttributeBar';
import NarrativeBox from '../components/NarrativeBox';
import ChoicePanel from '../components/ChoicePanel';
import DiceRoll from '../components/DiceRoll';
import MomentsFeed from '../components/MomentsFeed';
import LonelyMoment from '../components/LonelyMoment';
import { useNarrative } from '../hooks/useNarrative';
import { useGameStore } from '../engine/useGameStore';
import { rollDice } from '../engine/diceRoller';
import stages from '../content/stages.json';
import type { Stage } from '../types';

function StageDots({ currentStage }: { currentStage: Stage }) {
  const currentOrder = stages.find((s) => s.id === currentStage)?.order ?? 0;
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {stages.map((stage) => {
        let state: 'past' | 'current' | 'future' = 'future';
        if (stage.order < currentOrder) state = 'past';
        else if (stage.order === currentOrder) state = 'current';
        return (
          <div
            key={stage.id}
            title={stage.label}
            className={`w-2 h-2 rounded-full ${
              state === 'past'
                ? 'bg-muted'
                : state === 'current'
                ? 'bg-primary'
                : 'bg-border'
            }`}
          />
        );
      })}
    </div>
  );
}

export default function GameScreen() {
  const {
    currentEvent,
    visibleChoices,
    handleChoice,
    memeReaction,
    setMemeReaction,
  } = useNarrative();

  const diceResult = useGameStore((s) => s.diceResult);
  const currentStage = currentEvent.stage;
  const needsDice = currentEvent.diceRoll === true;

  // Track per-event state with refs to avoid async effect race conditions
  const eventIdRef = useRef(currentEvent.id);
  const diceRolledRef = useRef(false);

  // Synchronously detect event changes, reset per-event state
  if (eventIdRef.current !== currentEvent.id) {
    eventIdRef.current = currentEvent.id;
    diceRolledRef.current = false;
  }

  const [diceActive, setDiceActive] = useState(false);

  const handleTextComplete = useCallback(() => {
    if (needsDice && !diceRolledRef.current) {
      diceRolledRef.current = true;
      const result = rollDice();
      useGameStore.getState().setDiceResult(result);
      setDiceActive(true);
    }
  }, [needsDice]);

  const handleDiceDismiss = useCallback(() => {
    setDiceActive(false);
  }, []);

  useEffect(() => {
    if (!memeReaction) return;
    const timer = setTimeout(() => setMemeReaction(null), 1200);
    return () => clearTimeout(timer);
  }, [memeReaction, setMemeReaction]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AttributeBar />
      <StageDots currentStage={currentStage} />

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <NarrativeBox text={currentEvent.text} onComplete={handleTextComplete} />

        <AnimatePresence>
          {memeReaction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 inline-block bg-secondary text-foreground text-label font-bold px-3 py-1 rounded rotate-[-2deg]"
            >
              {memeReaction}
            </motion.div>
          )}
        </AnimatePresence>

        {(!needsDice || diceRolledRef.current) && (
          <div className="mt-4">
            <ChoicePanel choices={visibleChoices} onChoose={handleChoice} />
          </div>
        )}
      </div>

      <DiceRoll
        active={diceActive}
        result={diceResult}
        onDismiss={handleDiceDismiss}
      />
      <MomentsFeed />
      <LonelyMoment />
    </div>
  );
}
