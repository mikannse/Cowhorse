import type { Choice, EventId, GameEvent, GameStateSnapshot } from '../types';
import { evaluateCondition } from '../utils/conditions';

export function getVisibleChoices(
  event: GameEvent,
  state: GameStateSnapshot
): Choice[] {
  return event.choices.filter((choice) =>
    choice.condition ? evaluateCondition(state, choice.condition) : true
  );
}

export function isEventAvailable(
  event: GameEvent,
  state: GameStateSnapshot
): boolean {
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
