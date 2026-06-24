import { create } from 'zustand';
import type { GameStore, GameStoreState, Stage } from '../types';
import { applyEffects } from '../utils/effects';

export const DEFAULT_ATTRIBUTES = {
  money: 50,
  energy: 60,
  skill: 50,
  connections: 40,
  mentalHealth: 70,
};

export const INITIAL_STAGE: Stage = 'undergrad';

function createInitialState(): GameStoreState {
  return {
    attributes: { ...DEFAULT_ATTRIBUTES },
    currentStage: INITIAL_STAGE,
    currentEventId: '',
    visitedEvents: new Set(),
    eventHistory: [],
    diceResult: undefined,
    currentRoute: undefined,
    pendingDice: false,
    momentsFeed: [],
    lonelyMoment: null,
    endingId: null,
  };
}

export const useGameStore = create<GameStore>((set) => ({
  ...createInitialState(),

  startGame: () => {
    const fresh = createInitialState();
    fresh.currentEventId = 'undergrad_start';
    fresh.visitedEvents.add('undergrad_start');
    fresh.eventHistory.push({
      eventId: 'undergrad_start',
      stage: fresh.currentStage,
      timestamp: Date.now(),
    });
    set(fresh);
  },

  navigateTo: (eventId) => {
    set((state) => {
      const visited = new Set(state.visitedEvents);
      visited.add(eventId);
      const history = [
        ...state.eventHistory,
        { eventId, stage: state.currentStage, timestamp: Date.now() },
      ];
      return {
        currentEventId: eventId,
        visitedEvents: visited,
        eventHistory: history,
      };
    });
  },

  applyEffect: (effects) => {
    set((state) => {
      const result = applyEffects(state.attributes, effects);
      const mentalHealthDepleted = result.attributes.mentalHealth <= 0;
      return {
        attributes: result.attributes,
        endingId: mentalHealthDepleted ? 'mental_breakdown' : state.endingId,
      };
    });
  },

  setDiceResult: (result) => {
    set({ diceResult: result, pendingDice: false });
  },

  clearDiceResult: () => {
    set({ diceResult: undefined, pendingDice: false });
  },

  addMoment: (moment) => {
    set((state) => ({ momentsFeed: [...state.momentsFeed, moment] }));
  },

  clearMoments: () => {
    set({ momentsFeed: [] });
  },

  setLonelyMoment: (text) => {
    set({ lonelyMoment: text });
  },

  setEnding: (endingId) => {
    set({ endingId });
  },

  setStage: (stage) => {
    set({ currentStage: stage });
  },

  setCurrentRoute: (route) => {
    set({ currentRoute: route });
  },

  resetGame: () => {
    set(createInitialState());
  },
}));

export function selectSnapshot(state: GameStore): import('../types').GameStateSnapshot {
  return {
    attributes: state.attributes,
    currentStage: state.currentStage,
    currentEventId: state.currentEventId,
    visitedEvents: state.visitedEvents,
    eventHistory: state.eventHistory,
    diceResult: state.diceResult,
    currentRoute: state.currentRoute,
  };
}
