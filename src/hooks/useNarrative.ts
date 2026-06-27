import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsById } from '../content/events';
import { getRandomEncounter, getVisibleChoices, isValidStageTransition, resolveNextEvent, STORY_RETURN } from '../engine/eventEvaluator';
import { evaluateMeme } from '../engine/memeEvaluator';
import { selectSnapshot, useGameStore } from '../engine/useGameStore';
import type { Choice, GameEvent, Major } from '../types';
import { evaluateEnding } from '../utils/endings';

export interface UseNarrativeResult {
  currentEvent: GameEvent;
  visibleChoices: Choice[];
  handleChoice: (index: number) => void;
  memeReaction: string | null;
  setMemeReaction: (value: string | null) => void;
}

const ENDING_EVENT_ID = 'ending_reached';
const MAJOR_ROUTE_SENTINEL = '__route_by_major__';
const EXAM_MAJOR_ROUTE_SENTINEL = '__exam_route_by_major__';
const EXAM_POSTGRAD_OUTCOME_SENTINEL = '__exam_postgrad_outcome_by_major__';
const CIVIL_MAJOR_ROUTE_SENTINEL = '__civil_route_by_major__';
const LIE_MAJOR_ROUTE_SENTINEL = '__lie_route_by_major__';

/**
 * Maps a major to the industry-specific job-intro event.
 * Falls back to generic 'job_waiting' (CS default) for unknown majors.
 */
function resolveMajorRoute(major: Major | null): string {
  switch (major) {
    case 'cs':
      return 'job_waiting';
    case 'law':
      return 'law_job_waiting';
    case 'med':
      return 'med_job_waiting';
    case 'finance':
      return 'finance_job_waiting';
    case 'eng':
      return 'eng_job_waiting';
    case 'art':
      return 'art_job_waiting';
    default:
      return 'job_waiting';
  }
}

/**
 * Maps a major to the major-specific exam intro event.
 */
function resolveMajorExamRoute(major: Major | null): string {
  switch (major) {
    case 'cs':
      return 'cs_exam_intro';
    case 'law':
      return 'law_exam_intro';
    case 'med':
      return 'med_exam_intro';
    case 'finance':
      return 'finance_exam_intro';
    case 'eng':
      return 'eng_exam_intro';
    case 'art':
      return 'art_exam_intro';
    default:
      return 'exam_intro';
  }
}

/**
 * Maps a major to the major-specific postgrad graduation outcome event.
 */
function resolveMajorPostgradOutcome(major: Major | null): string {
  switch (major) {
    case 'cs':
      return 'cs_postgrad_outcome';
    case 'finance':
      return 'finance_postgrad_outcome';
    case 'med':
      return 'med_postgrad_outcome';
    case 'eng':
      return 'eng_postgrad_outcome';
    case 'law':
      return 'law_postgrad_outcome';
    case 'art':
      return 'art_postgrad_outcome';
    default:
      return 'postgrad_graduation';
  }
}

/**
 * Maps a major to the major-specific civil service exam intro event.
 */
/**
 * Maps a major to the major-specific lie-flat intro event.
 */
function resolveMajorLieRoute(major: Major | null): string {
  switch (major) {
    case 'cs': return 'cs_lie_intro';
    case 'finance': return 'finance_lie_intro';
    case 'med': return 'med_lie_intro';
    case 'eng': return 'eng_lie_intro';
    case 'law': return 'law_lie_intro';
    case 'art': return 'art_lie_intro';
    default: return 'lie_intro';
  }
}

function resolveMajorCivilRoute(major: Major | null): string {
  switch (major) {
    case 'cs':
      return 'cs_civil_intro';
    case 'finance':
      return 'finance_civil_intro';
    case 'med':
      return 'med_civil_intro';
    case 'eng':
      return 'eng_civil_intro';
    case 'law':
      return 'law_civil_intro';
    case 'art':
      return 'art_civil_intro';
    default:
      return 'civil_intro';
  }
}

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

  // Trigger lonelyMoment overlay when current event defines one; clear it otherwise
  useEffect(() => {
    const store = useGameStore.getState();
    if (currentEvent.lonelyMoment) {
      store.setLonelyMoment(currentEvent.lonelyMoment);
    } else {
      store.setLonelyMoment(null);
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

      // Set major if the choice defines one (choose_major event)
      if (choice.setMajor) {
        fresh.setMajor(choice.setMajor);
        fresh = useGameStore.getState();
      }

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
      let effectiveNextId =
        choice.nextEventId === STORY_RETURN
          ? fresh.storyReturnEventId ?? choice.nextEventId
          : choice.nextEventId;

      // Resolve __route_by_major__ sentinel to an industry-specific event
      if (effectiveNextId === MAJOR_ROUTE_SENTINEL) {
        effectiveNextId = resolveMajorRoute(fresh.major);
      }

      // Resolve __exam_route_by_major__ sentinel to a major-specific exam intro
      if (effectiveNextId === EXAM_MAJOR_ROUTE_SENTINEL) {
        effectiveNextId = resolveMajorExamRoute(fresh.major);
      }

      // Resolve __exam_postgrad_outcome_by_major__ sentinel to a major-specific grad outcome
      if (effectiveNextId === EXAM_POSTGRAD_OUTCOME_SENTINEL) {
        effectiveNextId = resolveMajorPostgradOutcome(fresh.major);
      }

      // Resolve __civil_route_by_major__ sentinel to a major-specific civil intro
      if (effectiveNextId === CIVIL_MAJOR_ROUTE_SENTINEL) {
        effectiveNextId = resolveMajorCivilRoute(fresh.major);
      }

      // Resolve __lie_route_by_major__ sentinel to a major-specific lie-flat intro
      if (effectiveNextId === LIE_MAJOR_ROUTE_SENTINEL) {
        effectiveNextId = resolveMajorLieRoute(fresh.major);
      }

      const nextEvent = resolveNextEvent(eventsById, effectiveNextId, selectSnapshot(fresh));
      const isEndingTransition = nextEvent.id === ENDING_EVENT_ID || nextEvent.stage === 'ending';

      if (isEndingTransition) {
        // Transition to ending stage so evaluateEnding can match stage: 'ending' conditions
        fresh.setStage('ending');
        fresh = useGameStore.getState();
        const ending = evaluateEnding(selectSnapshot(fresh));
        fresh.setEnding(ending.id);
        navigate('/ending');
        return;
      }

      // Random encounter injection — skip for key story beats and during cooldown
      const canEncounter = !currentEvent.noEncounters && !currentEvent.id.startsWith('encounter_');
      const encounter = canEncounter
        ? getRandomEncounter(eventsById, selectSnapshot(fresh))
        : null;
      if (encounter) {
        // Save the intended story target so encounters can return to it
        fresh.setStoryReturnEventId(nextEvent.id);
        // Set cooldown so the next few events don't trigger another encounter
        fresh.setEncounterCooldown(3);
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
