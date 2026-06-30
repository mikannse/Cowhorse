# UX/UI Design — CowHorse

**Project:** CowHorse（社畜模拟器）
**Date:** 2026-06-24
**Scope:** Web-first narrative simulation game, mobile-first responsive, PWA-enabled.

## Design Concept

CowHorse looks like a scrapbook that got away from its owner: paper textures, taped-on labels, rough edges, and occasional loud geometric accents. The tone is satirical and meme-rich, but the structure stays clean so players can read long narrative text and make choices with one thumb.

## Design System Source of Truth

- **Global tokens and component specs:** `design-system/cowhorse/MASTER.md`
- **Page-specific overrides:**
  - `design-system/cowhorse/pages/title-screen.md`
  - `design-system/cowhorse/pages/game-screen.md`
  - `design-system/cowhorse/pages/ending-screen.md`

When implementing a screen, read the global MASTER first, then the matching page override.

## Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#FAFAF8` | Paper-like base |
| Surface | `#FFFFFF` | Cards, sheets |
| Foreground | `#1A1A1A` | Body text, headings |
| Muted | `#64748B` | Secondary text |
| Primary | `#EC4899` | CTAs, viral moments, focus rings |
| Secondary | `#F59E0B` | Comedy beats, highlights |
| Accent | `#2563EB` | Share actions, success |
| Destructive | `#DC2626` | Mental-health danger |
| Tape | `#FDE68A` | Sticker tape accents |
| Sticker Pink | `#FF71CE` | Memphis decorations |
| Sticker Teal | `#86CCCA` | Memphis decorations |

## Typography

- **Primary font:** Noto Sans SC (weights 400/500/700/900)
- **Fallback:** `"PingFang SC", "Microsoft YaHei", sans-serif`
- **System/meme voice:** JetBrains Mono
- Body text is never smaller than 16px; line-height ≥ 1.6 for Chinese.

## Screen Map

### TitleScreen (`/`)

- Logo sticker card rotated `-2deg` with tape accent.
- Tagline: "从大四到退休，你打算怎么活？"
- One primary CTA: "开始游戏".
- Secondary link to a gameplay explanation bottom sheet.

### GameScreen (`/game`)

- Fixed top AttributeBar (collapsible) + stage dots.
- Scrollable NarrativeBox with typewriter text and multi-voice visual treatments.
- Bottom ChoicePanel with 2-4 full-width choice buttons.
- Overlays: DiceRoll, MomentsFeed (WeChat-style bottom sheet), LonelyMoment (full-screen quiet text).

### EndingScreen (`/ending`)

- Ending title + description.
- Life Resume poster (9:16 portrait, paper texture, key choices + final attributes + ending sticker).
- Actions: save poster, share, replay.

## Key Interaction Principles

1. **One-thumb mobile:** all primary actions are reachable at the bottom of a 375px screen.
2. **No layout-shift feedback:** press states use translate + shadow reduction without moving surrounding content.
3. **Paper-first elevation:** hard offset shadows (`0 2px 0 #1A1A1A`) instead of soft drop shadows.
4. **Subtle decoration only:** geometric Memphis shapes and sticker rotations stay within `[-3deg, 3deg]` and never apply to interactive elements.
5. **Respect motion preferences:** all non-essential animation disables under `prefers-reduced-motion`.

## Accessibility Checklist

- [ ] Touch targets ≥ 44×44px.
- [ ] Body text ≥ 16px, line-height ≥ 1.6.
- [ ] Text contrast ≥ 4.5:1 on all backgrounds.
- [ ] Visible focus rings on all interactive elements.
- [ ] NarrativeBox uses `aria-live="polite"`.
- [ ] ChoicePanel buttons support arrow-key navigation.
- [ ] DiceRoll and LonelyMoment overlays trap focus and announce via live region.
- [ ] `prefers-reduced-motion` disables typewriter, dice shake, and sticker pop.

## Anti-Patterns

- Do not use emojis as structural icons; use SVG or simple shapes.
- Do not use glassmorphism, heavy blur, or AI purple/pink gradients.
- Do not make body text smaller than 16px on mobile.
- Do not rotate interactive elements.
- Do not allow horizontal scroll at 375px.

## Open Questions

None at this pass. If a future route or event type needs a new layout variant (e.g., a branching-major selection screen), add a page override in `design-system/cowhorse/pages/`.
