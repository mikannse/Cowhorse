import { useCallback, useMemo, useRef } from 'react';
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
  handleChoice: (index: number) => void;
  memeReaction: string | null;
  setMemeReaction: (value: string | null) => void;
}

const ENDING_EVENT_ID = 'ending_reached';

export function useNarrative(): UseNarrativeResult {
  const navigate = useNavigate();
  const currentEventId = useGameStore((s) => s.currentEventId);
  const storeDiceResult = useGameStore((s) => s.diceResult);
  const memeReactionRef = useRef<string | null>(null);

  const currentEvent = useMemo(() => {
    if (!currentEventId) return eventsById.get('event_not_found')!;
    return eventsById.get(currentEventId) ?? eventsById.get('event_not_found')!;
  }, [currentEventId]);

  const visibleChoices = useMemo(() => {
    const snapshot = selectSnapshot(useGameStore.getState());
    return getVisibleChoices(currentEvent, snapshot);
  }, [currentEvent, storeDiceResult]);

  const handleChoice = useCallback(
    (index: number) => {
      const store = useGameStore.getState();
      const choices = getVisibleChoices(currentEvent, selectSnapshot(store));
      const choice = choices[index];
      if (!choice) return;

      store.applyEffect(choice.effects);

      if (currentEvent.memeCheck) {
        const snapshot = selectSnapshot(store);
        const meme = evaluateMeme(snapshot, currentEvent.memeCheck);
        if (meme.value !== 0) {
          store.applyEffect([
            { target: 'mentalHealth', value: meme.value, label: '梗力' },
          ]);
          memeReactionRef.current =
            meme.outcome === 'correct' ? '😎 接住了！' : '😬 冷场了…';
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
    [currentEvent, navigate]
  );

  const memeReaction = memeReactionRef.current;

  return {
    currentEvent,
    visibleChoices,
    handleChoice,
    memeReaction,
    setMemeReaction: (v) => {
      memeReactionRef.current = v;
    },
  };
}
