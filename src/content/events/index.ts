import type { GameEvent } from '../../types';
import civilExamJson from './civil-exam.json';
import commonJson from './common.json';
import jobHuntJson from './job-hunt.json';
import lieFlatJson from './lie-flat.json';
import postgradExamJson from './postgrad-exam.json';
import undergradJson from './undergrad.json';

const undergrad = undergradJson as unknown as GameEvent[];
const postgradExam = postgradExamJson as unknown as GameEvent[];
const jobHunt = jobHuntJson as unknown as GameEvent[];
const civilExam = civilExamJson as unknown as GameEvent[];
const lieFlat = lieFlatJson as unknown as GameEvent[];
const common = commonJson as unknown as GameEvent[];

export const allEvents: GameEvent[] = [
  ...undergrad,
  ...postgradExam,
  ...jobHunt,
  ...civilExam,
  ...lieFlat,
  ...common,
];

export const eventsById = new Map(allEvents.map((event) => [event.id, event]));

export function getEventById(id: string): GameEvent | undefined {
  return eventsById.get(id);
}
