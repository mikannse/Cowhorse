import { create } from 'zustand';
import type { GameStore, GameStoreState, Stage } from '../types';
import { applyEffects } from '../utils/effects';
import { isValidStageTransition } from './eventEvaluator';

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
    major: null,
    pendingDice: false,
    momentsFeed: [],
    lonelyMoment: null,
    endingId: null,
    storyReturnEventId: undefined,
    encounterCooldown: 0,
  };
}

export const useGameStore = create<GameStore>((set) => ({
  ...createInitialState(),

  startGame: () => {
    const fresh = createInitialState();
    fresh.currentEventId = 'choose_major';
    fresh.visitedEvents.add('choose_major');
    fresh.eventHistory.push({
      eventId: 'choose_major',
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
        // Decrement encounter cooldown each time we navigate to a new event
        encounterCooldown: Math.max(0, state.encounterCooldown - 1),
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
    set((state) => {
      // Enforce validated stage transitions per CLAUDE.md architecture:
      // "Stage transitions are validated: isValidStageTransition() enforces
      //  the legal transition graph. Invalid jumps are silently rejected."
      if (!isValidStageTransition(state.currentStage, stage)) {
        console.warn(
          `[CowHorse] Invalid stage transition: ${state.currentStage} → ${stage} (rejected)`
        );
        return {};
      }
      return { currentStage: stage };
    });
  },

  setCurrentRoute: (route) => {
    set({ currentRoute: route });
  },

  setStoryReturnEventId: (eventId) => {
    set({ storyReturnEventId: eventId });
  },

  setMajor: (major) => {
    set({ major });
  },

  setEncounterCooldown: (value) => {
    set({ encounterCooldown: value });
  },

  resetGame: () => {
    set(createInitialState());
  },
}));

export function selectSnapshot(state: GameStore): import('../types').GameStateSnapshot {
  return {
    attributes: { ...state.attributes },
    currentStage: state.currentStage,
    currentEventId: state.currentEventId,
    visitedEvents: new Set(state.visitedEvents),
    eventHistory: [...state.eventHistory],
    diceResult: state.diceResult ? { ...state.diceResult } : undefined,
    currentRoute: state.currentRoute,
    storyReturnEventId: state.storyReturnEventId,
    major: state.major,
    encounterCooldown: state.encounterCooldown,
  };
}
