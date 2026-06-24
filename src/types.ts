export type AttributeKey = 'money' | 'energy' | 'skill' | 'connections' | 'mentalHealth';

export interface Attributes {
  money: number;
  energy: number;
  skill: number;
  connections: number;
  mentalHealth: number;
}

export type Stage =
  | 'undergrad'
  | 'graduation'
  | 'postgrad'
  | 'work'
  | 'gap'
  | 'firstJob'
  | 'retirement'
  | 'ending';

export type EventId = string;

export type AttributeOperator = 'lt' | 'gt' | 'lte' | 'gte' | 'eq';

export interface AttributeCondition {
  type: 'attribute';
  attr: AttributeKey;
  operator: AttributeOperator;
  value: number;
}

export interface StageCondition {
  type: 'stage';
  stage: Stage;
}

export interface DiceCondition {
  type: 'dice';
  min: number;
  max: number;
}

export interface VisitedCondition {
  type: 'visited';
  eventId: EventId;
}

export interface AndCondition {
  type: 'and';
  conditions: Condition[];
}

export interface OrCondition {
  type: 'or';
  conditions: Condition[];
}

export interface NotCondition {
  type: 'not';
  condition: Condition;
}

export type Condition =
  | AttributeCondition
  | StageCondition
  | DiceCondition
  | VisitedCondition
  | AndCondition
  | OrCondition
  | NotCondition;

export interface GameEffect {
  target: AttributeKey;
  value: number;
  label?: string;
}

export interface Choice {
  text: string;
  effects: GameEffect[];
  nextEventId: EventId;
  condition?: Condition;
}

export interface MemeCheck {
  memeId: string;
  correctTiming: Condition;
  wrongTiming: Condition;
  buff: number;
  debuff: number;
}

export interface MomentTemplate {
  templateId: string;
  text: string;
  replyPool: string[];
}

export interface GameEvent {
  id: EventId;
  stage: Stage;
  text: string;
  choices: Choice[];
  condition?: Condition;
  diceRoll?: boolean;
  memeCheck?: MemeCheck;
  moment?: MomentTemplate;
  lonelyMoment?: string;
}

export interface DiceResult {
  value: number;
  success: boolean;
  modifier: number;
}

export interface EventLog {
  eventId: EventId;
  stage: Stage;
  choiceIndex?: number;
  timestamp: number;
}

export interface Ending {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'route' | 'hidden';
  condition: Condition;
}

export interface GameStateSnapshot {
  attributes: Attributes;
  currentStage: Stage;
  currentEventId: EventId;
  visitedEvents: Set<EventId>;
  eventHistory: EventLog[];
  diceResult?: DiceResult;
  currentRoute?: string;
}

export interface GameStoreState extends GameStateSnapshot {
  pendingDice: boolean;
  momentsFeed: MomentTemplate[];
  lonelyMoment: string | null;
  endingId: string | null;
}

export type GameStoreActions = {
  startGame: () => void;
  navigateTo: (eventId: EventId) => void;
  applyEffect: (effects: GameEffect[]) => void;
  setDiceResult: (result: DiceResult) => void;
  clearDiceResult: () => void;
  addMoment: (moment: MomentTemplate) => void;
  clearMoments: () => void;
  setLonelyMoment: (text: string | null) => void;
  setEnding: (endingId: string | null) => void;
  setStage: (stage: Stage) => void;
  setCurrentRoute: (route: string) => void;
  resetGame: () => void;
};

export type GameStore = GameStoreState & GameStoreActions;
