import type { GameEvent } from '../../types';
import civilExamJson from './civil-exam.json';
import commonJson from './common.json';
import jobHuntJson from './job-hunt.json';
import lieFlatJson from './lie-flat.json';
import postgradExamJson from './postgrad-exam.json';
import undergradJson from './undergrad.json';
import artJson from './industry/art.json';
import csJson from './industry/cs.json';
import engJson from './industry/eng.json';
import financeJson from './industry/finance.json';
import lawJson from './industry/law.json';
import medJson from './industry/med.json';
import examCsJson from './exam-cs.json';
import examFinanceJson from './exam-finance.json';
import examMedJson from './exam-med.json';
import examEngJson from './exam-eng.json';
import examLawJson from './exam-law.json';
import examArtJson from './exam-art.json';
import civilCsJson from './civil-cs.json';
import civilFinanceJson from './civil-finance.json';
import civilMedJson from './civil-med.json';
import civilEngJson from './civil-eng.json';
import civilLawJson from './civil-law.json';
import civilArtJson from './civil-art.json';
import lieCsJson from './lie-cs.json';
import lieFinanceJson from './lie-finance.json';
import lieMedJson from './lie-med.json';
import lieEngJson from './lie-eng.json';
import lieLawJson from './lie-law.json';
import lieArtJson from './lie-art.json';
import returnsJson from './returns.json';

const undergrad = undergradJson as unknown as GameEvent[];
const postgradExam = postgradExamJson as unknown as GameEvent[];
const jobHunt = jobHuntJson as unknown as GameEvent[];
const civilExam = civilExamJson as unknown as GameEvent[];
const lieFlat = lieFlatJson as unknown as GameEvent[];
const common = commonJson as unknown as GameEvent[];
const csEvents = csJson as unknown as GameEvent[];
const financeEvents = financeJson as unknown as GameEvent[];
const medEvents = medJson as unknown as GameEvent[];
const engEvents = engJson as unknown as GameEvent[];
const lawEvents = lawJson as unknown as GameEvent[];
const artEvents = artJson as unknown as GameEvent[];
const examCsEvents = examCsJson as unknown as GameEvent[];
const examFinanceEvents = examFinanceJson as unknown as GameEvent[];
const examMedEvents = examMedJson as unknown as GameEvent[];
const examEngEvents = examEngJson as unknown as GameEvent[];
const examLawEvents = examLawJson as unknown as GameEvent[];
const examArtEvents = examArtJson as unknown as GameEvent[];
const civilCsEvents = civilCsJson as unknown as GameEvent[];
const civilFinanceEvents = civilFinanceJson as unknown as GameEvent[];
const civilMedEvents = civilMedJson as unknown as GameEvent[];
const civilEngEvents = civilEngJson as unknown as GameEvent[];
const civilLawEvents = civilLawJson as unknown as GameEvent[];
const civilArtEvents = civilArtJson as unknown as GameEvent[];
const lieCsEvents = lieCsJson as unknown as GameEvent[];
const lieFinanceEvents = lieFinanceJson as unknown as GameEvent[];
const lieMedEvents = lieMedJson as unknown as GameEvent[];
const lieEngEvents = lieEngJson as unknown as GameEvent[];
const lieLawEvents = lieLawJson as unknown as GameEvent[];
const lieArtEvents = lieArtJson as unknown as GameEvent[];
const returnEvents = returnsJson as unknown as GameEvent[];

export const allEvents: GameEvent[] = [
  ...undergrad,
  ...postgradExam,
  ...jobHunt,
  ...civilExam,
  ...lieFlat,
  ...common,
  ...csEvents,
  ...financeEvents,
  ...medEvents,
  ...engEvents,
  ...lawEvents,
  ...artEvents,
  ...examCsEvents,
  ...examFinanceEvents,
  ...examMedEvents,
  ...examEngEvents,
  ...examLawEvents,
  ...examArtEvents,
  ...civilCsEvents,
  ...civilFinanceEvents,
  ...civilMedEvents,
  ...civilEngEvents,
  ...civilLawEvents,
  ...civilArtEvents,
  ...lieCsEvents,
  ...lieFinanceEvents,
  ...lieMedEvents,
  ...lieEngEvents,
  ...lieLawEvents,
  ...lieArtEvents,
  ...returnEvents,
];

export const eventsById = new Map(allEvents.map((event) => [event.id, event]));

export function getEventById(id: string): GameEvent | undefined {
  return eventsById.get(id);
}
