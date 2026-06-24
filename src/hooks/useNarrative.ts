import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Choice, GameEvent } from '../types';
import { eventsById } from '../content/events';
import { evaluateMeme } from '../engine/memeEvaluator';
import { useGameStore, selectSnapshot } from '../engine/useGameStore';
import { evaluateEnding } from '../utils/endings';
import { getVisibleChoices } from '../engine/eventEvaluator';

export interface UseNarrativeResult {
  currentEvent: GameEvent;
  visibleChoices: Choice[];
  diceActive: boolean;
  setDiceActive: (value: boolean) => void;
  diceRolled: boolean;
  completeDiceRoll: () => void;
  handleChoice: (index: number) => void;
  memeReaction: string | null;
  setMemeReaction: (value: string | null) => void;
}

const ENDING_EVENT_ID = 'ending_reached';

export function useNarrative(): UseNarrativeResult {
  const navigate = useNavigate();
  const currentEventId = useGameStore((s) => s.currentEventId);

  const currentEvent = useMemo(() => {
    if (!currentEventId) return eventsById.get('event_not_found')!;
    return eventsById.get(currentEventId) ?? eventsById.get('event_not_found')!;
  }, [currentEventId]);

  const [diceActive, setDiceActive] = useState(false);
  const [diceRolled, setDiceRolled] = useState(false);
  const [memeReaction, setMemeReaction] = useState<string | null>(null);

  useEffect(() => {
    setDiceRolled(false);
    setDiceActive(false);
    setMemeReaction(null);

    if (currentEvent.lonelyMoment) {
      useGameStore.getState().setLonelyMoment(currentEvent.lonelyMoment);
    }
  }, [currentEvent]);

  const visibleChoices = useMemo(() => {
    if (currentEvent.diceRoll && !diceRolled) return [];
    const snapshot = selectSnapshot(useGameStore.getState());
    return getVisibleChoices(currentEvent, snapshot);
  }, [currentEvent, diceRolled]);

  const completeDiceRoll = useCallback(() => {
    setDiceRolled(true);
  }, []);

  const handleChoice = useCallback(
    (index: number) => {
      const store = useGameStore.getState();
      const choice = visibleChoices[index];
      if (!choice) return;

      store.applyEffect(choice.effects);

      if (currentEvent.memeCheck) {
        const snapshot = selectSnapshot(store);
        const meme = evaluateMeme(snapshot, currentEvent.memeCheck);
        if (meme.value !== 0) {
          store.applyEffect([
            { target: 'mentalHealth', value: meme.value, label: '梗力' },
          ]);
          setMemeReaction(
            meme.outcome === 'correct' ? '😎 接住了！' : '😬 冷场了…'
          );
        }
      }

      if (store.endingId) {
        navigate('/ending');
        return;
      }

      const nextEvent = eventsById.get(choice.nextEventId);
      const isEndingTransition =
        choice.nextEventId === ENDING_EVENT_ID || nextEvent?.stage === 'ending';

      if (isEndingTransition) {
        const snapshot = selectSnapshot(store);
        const ending = evaluateEnding(snapshot);
        store.setEnding(ending.id);
        navigate('/ending');
        return;
      }

      if (nextEvent && nextEvent.stage !== currentEvent.stage) {
        store.setStage(nextEvent.stage);
        if (nextEvent.moment) {
          store.addMoment(nextEvent.moment);
        }
      }

      store.navigateTo(choice.nextEventId);
    },
    [currentEvent, navigate, visibleChoices]
  );

  return {
    currentEvent,
    visibleChoices,
    diceActive,
    setDiceActive,
    diceRolled,
    completeDiceRoll,
    handleChoice,
    memeReaction,
    setMemeReaction,
  };
}
