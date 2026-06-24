import type { Choice, EventId, GameEvent, GameStateSnapshot, Stage } from '../types';
import { evaluateCondition } from '../utils/conditions';

export const STORY_RETURN = '__return_to_story__';

/**
 * Valid stage transitions.
 * Maps each stage to the set of stages it can legitimately transition to.
 * Self-transitions (same → same) are always allowed and not listed here.
 */
export const VALID_STAGE_TRANSITIONS: Record<Stage, Stage[]> = {
  undergrad: ['graduation'],
  graduation: ['firstJob', 'postgrad', 'gap'],
  firstJob: ['work', 'gap'],
  postgrad: ['work', 'gap'],
  gap: ['work', 'firstJob', 'postgrad'],
  work: ['retirement', 'gap'],
  retirement: ['ending'],
  ending: [],
};

/**
 * Check whether a stage transition is valid according to the game's stage model.
 * A transition to the same stage is always allowed.
 */
export function isValidStageTransition(from: Stage, to: Stage): boolean {
  if (from === to) return true;
  const allowed = VALID_STAGE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function getVisibleChoices(event: GameEvent, state: GameStateSnapshot): Choice[] {
  return event.choices.filter((choice) =>
    choice.condition ? evaluateCondition(state, choice.condition) : true
  );
}

export function isEventAvailable(event: GameEvent, state: GameStateSnapshot): boolean {
  return event.condition ? evaluateCondition(state, event.condition) : true;
}

export function resolveNextEvent(
  eventsById: ReadonlyMap<EventId, GameEvent>,
  nextEventId: EventId,
  state: GameStateSnapshot
): GameEvent {
  const target = eventsById.get(nextEventId);
  if (target && isEventAvailable(target, state)) {
    return target;
  }
  const fallback = eventsById.get('event_not_found');
  if (fallback) return fallback;
  throw new Error(`Missing fallback event and unknown event id: ${nextEventId}`);
}

export function getInitialEvent(
  eventsById: ReadonlyMap<EventId, GameEvent>,
  state: GameStateSnapshot
): GameEvent {
  const target = eventsById.get('undergrad_start');
  if (target && isEventAvailable(target, state)) return target;
  const fallback = eventsById.get('event_not_found');
  if (fallback) return fallback;
  throw new Error('Missing initial event and fallback');
}

const ENCOUNTER_FIRE_CHANCE = 0.3;

export function getRandomEncounter(
  eventsById: ReadonlyMap<EventId, GameEvent>,
  state: GameStateSnapshot
): GameEvent | null {
  const candidates: GameEvent[] = [];
  for (const event of eventsById.values()) {
    if (
      event.id.startsWith('encounter_') &&
      event.stage === state.currentStage &&
      isEventAvailable(event, state)
    ) {
      candidates.push(event);
    }
  }
  if (candidates.length === 0) return null;
  if (Math.random() > ENCOUNTER_FIRE_CHANCE) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
