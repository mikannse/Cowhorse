import type {
  AndCondition,
  AttributeCondition,
  Condition,
  DiceCondition,
  GameStateSnapshot,
  MajorCondition,
  NotCondition,
  OrCondition,
  StageCondition,
  VisitedCondition,
} from '../types';

function evaluateAttributeCondition(
  state: GameStateSnapshot,
  condition: AttributeCondition
): boolean {
  const value = state.attributes[condition.attr];
  switch (condition.operator) {
    case 'lt':
      return value < condition.value;
    case 'gt':
      return value > condition.value;
    case 'lte':
      return value <= condition.value;
    case 'gte':
      return value >= condition.value;
    case 'eq':
      return value === condition.value;
    default:
      return false;
  }
}

function evaluateStageCondition(state: GameStateSnapshot, condition: StageCondition): boolean {
  return state.currentStage === condition.stage;
}

function evaluateDiceCondition(state: GameStateSnapshot, condition: DiceCondition): boolean {
  if (!state.diceResult) return false;
  const value = state.diceResult.value;
  return value >= condition.min && value <= condition.max;
}

function evaluateVisitedCondition(state: GameStateSnapshot, condition: VisitedCondition): boolean {
  return state.visitedEvents.has(condition.eventId);
}

function evaluateMajorCondition(state: GameStateSnapshot, condition: MajorCondition): boolean {
  if (state.major === null) return false;
  return Array.isArray(condition.major)
    ? condition.major.includes(state.major)
    : state.major === condition.major;
}

function evaluateAndCondition(state: GameStateSnapshot, condition: AndCondition): boolean {
  return condition.conditions.every((c) => evaluateCondition(state, c));
}

function evaluateOrCondition(state: GameStateSnapshot, condition: OrCondition): boolean {
  return condition.conditions.some((c) => evaluateCondition(state, c));
}

function evaluateNotCondition(state: GameStateSnapshot, condition: NotCondition): boolean {
  return !evaluateCondition(state, condition.condition);
}

export function evaluateCondition(state: GameStateSnapshot, condition: Condition): boolean {
  switch (condition.type) {
    case 'attribute':
      return evaluateAttributeCondition(state, condition);
    case 'stage':
      return evaluateStageCondition(state, condition);
    case 'dice':
      return evaluateDiceCondition(state, condition);
    case 'visited':
      return evaluateVisitedCondition(state, condition);
    case 'major':
      return evaluateMajorCondition(state, condition);
    case 'and':
      return evaluateAndCondition(state, condition);
    case 'or':
      return evaluateOrCondition(state, condition);
    case 'not':
      return evaluateNotCondition(state, condition);
    default:
      return false;
  }
}
