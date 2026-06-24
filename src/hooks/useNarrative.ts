import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsById } from '../content/events';
import { getRandomEncounter, getVisibleChoices, isValidStageTransition, resolveNextEvent, STORY_RETURN } from '../engine/eventEvaluator';
import { evaluateMeme } from '../engine/memeEvaluator';
import { selectSnapshot, useGameStore } from '../engine/useGameStore';
import type { Choice, GameEvent } from '../types';
import { evaluateEnding } from '../utils/endings';

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
  const [memeReaction, setMemeReaction] = useState<string | null>(null);

  const currentEvent = useMemo(() => {
    if (!currentEventId) return eventsById.get('event_not_found')!;
    return eventsById.get(currentEventId) ?? eventsById.get('event_not_found')!;
  }, [currentEventId]);

  const visibleChoices = useMemo(() => {
    const snapshot = selectSnapshot(useGameStore.getState());
    return getVisibleChoices(currentEvent, snapshot);
  }, [currentEvent, storeDiceResult]);

  // Trigger lonelyMoment overlay when current event defines one
  useEffect(() => {
    if (currentEvent.lonelyMoment) {
      useGameStore.getState().setLonelyMoment(currentEvent.lonelyMoment);
    }
  }, [currentEvent.lonelyMoment, currentEvent.id]);

  const handleChoice = useCallback(
    (index: number) => {
      const store = useGameStore.getState();
      const choices = getVisibleChoices(currentEvent, selectSnapshot(store));
      const choice = choices[index];
      if (!choice) return;

      // Apply choice effects, then re-fetch state
      store.applyEffect(choice.effects);
      let fresh = useGameStore.getState();

      if (currentEvent.memeCheck) {
        const meme = evaluateMeme(selectSnapshot(fresh), currentEvent.memeCheck);
        if (meme.value !== 0) {
          store.applyEffect([{ target: 'mentalHealth', value: meme.value, label: '梗力' }]);
          fresh = useGameStore.getState();
          setMemeReaction(meme.outcome === 'correct' ? '😎 接住了！' : '😬 冷场了…');
        }
      }

      if (fresh.endingId) {
        navigate('/ending');
        return;
      }

      // Resolve __return_to_story__ sentinel to the saved story return target
      const effectiveNextId =
        choice.nextEventId === STORY_RETURN
          ? fresh.storyReturnEventId || choice.nextEventId
          : choice.nextEventId;

      const nextEvent = resolveNextEvent(eventsById, effectiveNextId, selectSnapshot(fresh));
      const isEndingTransition = nextEvent.id === ENDING_EVENT_ID || nextEvent.stage === 'ending';

      if (isEndingTransition) {
        const ending = evaluateEnding(selectSnapshot(fresh));
        fresh.setEnding(ending.id);
        navigate('/ending');
        return;
      }

      // Random encounter injection (cross-cutting side events)
      const encounter = getRandomEncounter(eventsById, selectSnapshot(fresh));
      if (encounter) {
        // Save the intended story target so encounters can return to it
        fresh.setStoryReturnEventId(nextEvent.id);
        if (encounter.stage !== currentEvent.stage && isValidStageTransition(fresh.currentStage, encounter.stage)) {
          fresh.setStage(encounter.stage);
          if (encounter.moment) {
            fresh.addMoment(encounter.moment);
          }
        }
        fresh.navigateTo(encounter.id);
        return;
      }

      // No encounter — proceed along the main storyline
      if (nextEvent.stage !== currentEvent.stage && isValidStageTransition(fresh.currentStage, nextEvent.stage)) {
        fresh.setStage(nextEvent.stage);
        if (nextEvent.moment) {
          fresh.addMoment(nextEvent.moment);
        }
      }

      fresh.navigateTo(nextEvent.id);
    },
    [currentEvent, navigate]
  );

  return {
    currentEvent,
    visibleChoices,
    handleChoice,
    memeReaction,
    setMemeReaction,
  };
}
