# Husky Firewall

A fast-paced retro cyberpunk network defense arcade game built with clean, modular, zero-dependency HTML5 Canvas, CSS, and synthesized Web Audio API sound effects.

## Gameplay

Pilot the glowing cyber-shield paddle along the bottom perimeter to defend your network:

- **Good Data Packets (Green):** Catch them with your shield for **+10 points** (or **+20 / +40 points** with Overdrive & Overclock) and build your live combo streak.
- **Malware Bugs (Red):** Intercept and deflect them with your shield before they breach the bottom firewall line. Each breach costs **1 of your 3 firewall lives** and resets your combo streak.
- **Boss Glitch (Magenta/Crimson):** Appears every **500 points** and splits into **two smaller malware bugs** launched upward when blocked!
- **Overclock Orbs (Gold):** Catch occasional power-up orbs to widen your cyber-shield paddle and activate a **2x score multiplier for 8 seconds**.
- **Hosford AI & Digital Citizenship Checkpoints:** Every **30 seconds**, the game timer and falling objects pause completely for a multiple-choice question tailored for Hosford Middle Schoolers covering deepfakes, AI hallucinations, strong passwords, digital footprint, copyright/fair use, and cyberbullying (**+100 points** for a right answer, **-25 points** for a wrong answer), followed by a **2-second resume countdown** before action restarts.
- **Difficulty Modes:** Choose **Chill** (`0.72x` speed), **Normal** (`1.0x` speed), or **Overdrive** (`1.35x` speed, `2x` base points) on the Start Screen.
- **Wave Progression:** Every **100 points** advances the wave and increases incoming traffic speed.
- **Persistent High Score:** Automatically saved in browser `localStorage`.

## Controls

| Action | Input |
| --- | --- |
| Move Cyber-Shield | `←` / `→` Arrow keys, `A` / `D`, or Mouse / Touch drag |
| Pause / Resume | `P` key or Pause button |
| Mute / Unmute SFX | `M` key or SFX button |
| Start / Play Again | Click button or press `Space` / `Enter` |

## Project Structure

- `index.html` — Semantic cabinet layout, live HUD, Canvas stage, and Start / Pause / Game Over overlays.
- `style.css` — Cyberpunk dark navy (`#061a22`), teal (`#1f7a99`), and neon cyan (`#7cc9e8`) styling with responsive layout and subtle CRT scanlines.
- `game.js` — Frame-rate independent HTML5 Canvas loop, HiDPI scaling, difficulty modes, Boss Glitch splitting, 30-second quiz checkpoints, collisions, particle FX, and controls.
- `questions.js` — Curated, shuffled bank of 25 middle-school AI & Digital Citizenship multiple-choice scenarios for Hosford Huskies (non-repeating per game).
- `audio.js` — Pure Web Audio API retro chiptune sound synthesizer (packet catch, malware deflection, Overclock fanfare, wave-up chime, breach alarm, and game over melody).
- `README.md` — Game overview and quickstart instructions.

## Running Locally

No build tools or npm packages are required. Open `index.html` directly in any modern browser, or start a local preview server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
