# Husky Firewall — Project Rules & Standards

This document defines the architecture, visual design standards, and strict dependency rules for **Husky Firewall**. Follow these rules for all future updates and contributions.

## 1. Zero External Dependencies Rule

- **Never add external `npm` dependencies**, `package.json`, `node_modules`, bundlers, transpilers, or CDN-loaded JS/CSS libraries.
- The game must run **instantly** in any modern browser using pure vanilla HTML5, CSS3, JavaScript, Canvas 2D, and the built-in Web Audio API—both over a simple static server (`python3 -m http.server`) and directly from local files (`index.html`).
- **No external media assets required:** Sound effects must be synthesized procedurally via the Web Audio API in `audio.js`, and icons/emblems should use inline SVG or Canvas rendering.

## 2. File Structure

Keep the codebase clean, modular, and separated by responsibility inside this project folder:

- `index.html` — Semantic cabinet layout, HUD counters, Canvas stage, and overlays (Start Screen with difficulty selector, Pause, Hosford Quiz Checkpoint, and Game Over).
- `style.css` — Cyberpunk styling, responsive layout, CRT scanline polish, button/overlay states, and accessibility focus indicators.
- `game.js` — Frame-rate independent HTML5 Canvas game loop, HiDPI scaling, difficulty tuning (Chill / Normal / Overdrive), falling entities (Good Data Packets, Malware Bugs, Boss Glitch splitter, Overclock Orbs), 30-second quiz scheduling with complete freeze & 2-second resume countdown, particle/popup effects, input handling, and `localStorage` persistence.
- `audio.js` — Pure Web Audio API retro chiptune sound synthesizer (`window.HuskyAudio`) and mute persistence.
- `questions.js` — Shuffled bank of 25 middle-school AI & Digital Citizenship multiple-choice scenarios (`window.HUSKY_QUESTIONS`) tailored for Hosford Middle School students.
- `README.md` — Player overview, controls, and local quickstart instructions.
- `PROJECT_RULES.md` — This standards document.

> Load scripts via classic `<script defer>` tags in `index.html` (`audio.js`, `questions.js`, `game.js`) so the project works seamlessly without requiring a bundler or module CORS server.

## 3. Color Palette & Visual Theme

All UI elements and Canvas visuals must adhere to the **Husky Firewall** cyberpunk network-defense theme:

### Core Brand Palette
| Role | Name | Hex | Usage |
| --- | --- | --- | --- |
| Primary Background | Dark Navy | `#061a22` | Main canvas, cabinet frame, overlay cards |
| Deep Background | Deep Navy | `#031016` | Page gradient depth and perimeter sub-floor |
| Structural Accent | Teal | `#1f7a99` | Borders, grid lines, button fills, shield depth |
| Primary Highlight | Neon Cyan | `#7cc9e8` | Titles, cyber-shield paddle, HUD accents, active glows |
| Bright Highlight | Ice Cyan | `#c7f0ff` / `#b6e9ff` | Active text highlights, shield rim, countdown numerals |

### Semantic Arcade Accents
| Element | Color | Hex |
| --- | --- | --- |
| Good Data Packet / Chill / Correct Answer | Neon Green | `#39ff88` |
| Malware Bug / Breach / Wrong Answer | Alert Red | `#ff3b5c` |
| Boss Glitch / Split Mini-Bugs | Glitch Magenta | `#ff2a85` |
| Overclock Orb / Overdrive / High Score | Cyber Gold | `#ffd166` |

## 4. Gameplay & Educational Standards

- **Fairness & Accessibility:** Support Left/Right arrows, `A`/`D`, mouse move/drag, and touch drag (`touch-action: none`). Maintain keyboard shortcuts (`P` Pause, `M` Mute, `1`–`4` Quiz choices, `Space`/`Enter` start/continue) and clear ARIA roles/labels.
- **Complete Quiz Freeze:** When a 30-second AI & Digital Citizenship modal opens, freeze all falling objects and timers completely, and run a 2-second countdown before resuming gameplay.
- **Middle-School Appropriate Content:** Keep all questions in `questions.js` clear, encouraging, age-appropriate for grades 6–8 at Hosford, and non-repeating within the same game session.
