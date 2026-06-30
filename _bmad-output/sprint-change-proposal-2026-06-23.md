---
title: Sprint Change Proposal
project: CowHorse
date: 2026-06-23
status: approved
change_scope: minor
---

# Sprint Change Proposal — Remove Game Save System

## 1. Issue Summary

**Problem:** Architecture decision proposed Zustand persist + IndexedDB game save system, but the game is designed as a one-session-per-playthrough experience. Players replay from the beginning to explore different routes — no mid-game saves needed.

**Discovery Context:** Found during Step 4 (Core Architectural Decisions) of the architecture workflow. User clarified the design intent before any implementation began.

**Type:** Misunderstanding of original requirements.

## 2. Impact Analysis

**Epic Impact:** N/A — No epics or stories have been created yet (architecture still in progress).

**Artifact Conflicts:**
- [x] Architecture document — decisions about game save/persist need removal
- [ ] PRD — N/A (PRD is a skeleton)
- [ ] UX — N/A (not yet created)

**Technical Impact:**
- Zustand persist middleware: remove from architecture
- IndexedDB integration: remove
- Save slot UI: remove
- Game flow: simplify to start → play → ending → replay

## 3. Recommended Approach

**Path:** Direct Adjustment — modify architecture decisions before they are finalized.

**Rationale:** Architecture is still in progress. Simply correct the relevant decisions before saving them to the document. No rollback or replan required.

**Risk Level:** Low

## 4. Detailed Change Proposals

### Proposal A: State Management — Session Only

| Before | After |
|--------|-------|
| Zustand 5 + persist middleware + IndexedDB | Zustand 5 — session-only, no persistence |
| Multi-slot save system | No save concept — one playthrough |
| Continue Game option | Only "New Game" option |

### Proposal B: Game Flow Simplification

**Before:** Start → Save → Continue → Ending → Load → Different Route
**After:** Start → Play Through → Ending/Exit → Life Resume → "Play Again" → Title

### Proposal C: Cross-Cutting Concerns

- Remove "Game state persistence" from cross-cutting concerns list
- Keep PWA support (for mobile add-to-homescreen, not offline sync)

## 5. Implementation Handoff

**Scope Classification:** Minor

**Handoff Recipient:** Architecture workflow (same session)

**Action:** Update architecture document decisions before finalizing and saving Step 4 content.
