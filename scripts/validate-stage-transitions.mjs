/**
 * Stage Transition Validator
 *
 * Scans all event JSON files under src/content/events/ and checks that every
 * choice.nextEventId transition is legal according to the stage graph defined
 * in src/engine/eventEvaluator.ts.
 *
 * Run: node scripts/validate-stage-transitions.mjs
 * Integrated: npm run build (runs validate:stages before tsc)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// ── 1. Read the valid transition table from eventEvaluator.ts ──────────────
const evaluatorPath = path.join(root, 'src/engine/eventEvaluator.ts');
const evaluatorSrc = fs.readFileSync(evaluatorPath, 'utf-8');

const transitionMatch = evaluatorSrc.match(
  /VALID_STAGE_TRANSITIONS[\s\S]*?Record<Stage,\s*Stage\[\]>\s*=\s*(\{[\s\S]*?\n\});/
);
if (!transitionMatch) {
  console.error('❌ Could not parse VALID_STAGE_TRANSITIONS from eventEvaluator.ts');
  process.exit(1);
}

// SAFETY: eval() here executes a statically-extracted object literal from the
// project's OWN source file (eventEvaluator.ts) at build time on the developer's
// local machine. No user input, network data, or third-party content is involved.
// The input is a plain object `{ key: [...] }` — no function calls or dynamic expressions.
let transitions;
try {
  transitions = eval('(' + transitionMatch[1] + ')');
} catch {
  console.error('❌ Failed to evaluate VALID_STAGE_TRANSITIONS');
  process.exit(1);
}

// ── 2. Load all events from JSON files ─────────────────────────────────────
const eventsDir = path.join(root, 'src/content/events');

/** Recursively find all .json files in a directory */
function findAllJson(dir) {
  let result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result = result.concat(findAllJson(full));
    } else if (entry.name.endsWith('.json')) {
      result.push(full);
    }
  }
  return result;
}

const eventsById = new Map();
for (const filePath of findAllJson(eventsDir)) {
  let events;
  try {
    events = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`❌ Failed to parse ${path.relative(root, filePath)}: ${err.message}`);
    process.exit(1);
  }
  for (const event of events) {
    if (!event.id || !event.stage) {
      console.error(`❌ Event missing "id" or "stage" in ${path.relative(root, filePath)}`);
      process.exit(1);
    }
    if (eventsById.has(event.id)) {
      console.error(`❌ Duplicate event id: ${event.id}`);
      process.exit(1);
    }
    eventsById.set(event.id, { ...event, file: path.relative(root, filePath) });
  }
}

// ── 3. Validate every choice.nextEventId against the transition table ──────
let errors = 0;
const sentinelPattern = /^__.*__$/;  // Runtime-resolved sentinels

for (const [id, event] of eventsById) {
  for (const choice of event.choices || []) {
    const nextId = choice.nextEventId;
    if (!nextId) continue;

    // Skip runtime-resolved sentinels
    if (nextId === '__return_to_story__') continue;
    if (sentinelPattern.test(nextId)) continue;

    // ending_reached is a special terminal event — always allowed
    if (nextId === 'ending_reached') continue;

    const target = eventsById.get(nextId);
    if (!target) {
      console.error(`❌ ${id} → ${nextId}: target event not found`);
      errors++;
      continue;
    }

    // Same-stage transitions are always allowed
    if (event.stage === target.stage) continue;

    const allowed = transitions[event.stage] || [];
    if (!allowed.includes(target.stage)) {
      console.error(
        `❌ ${id} (${event.stage}) → ${nextId} (${target.stage}): illegal stage transition`
      );
      errors++;
    }
  }
}

// ── 4. Report ──────────────────────────────────────────────────────────────
if (errors > 0) {
  console.error(`\n${errors} illegal transition(s) found. Fix them before building.`);
  process.exit(1);
} else {
  console.log('✅ All stage transitions are valid.');
}
