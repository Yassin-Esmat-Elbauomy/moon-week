# MISSION CONTROL — Beyond Survival (Specification)

Status: ready-for-agent

## Problem Statement

Children aged 7–12 (alongside siblings, parents, and educators) need an engaging, scientifically authentic 60-minute lunar mission trainer for the NASA Space Apps Challenge ("Build a Junior Astronaut Mission Trainer") that avoids shallow multiple-choice quizzes, disconnected screens, broken images, or intimidating military dashboards.

## Solution

**MISSION CONTROL** ("A Little Space Adventure. A Big Scientific Mission. — Beyond Survival") is a browser-playable 2D 3/4 top-down pixel-art lunar South Pole outpost simulation built with React 18, TypeScript, Vite, Tailwind CSS, and HTML5 Canvas/SVG. The player acts as the **Mission Commander**, leading six named **Specialists** across an Opening Cutscene, a 6-part Interactive Tutorial, seven **Mission Days** (each composed of Morning, Midday, and Evening **Shifts** on a `06:00–22:00` clock), six tactile station mini-games, verified NASA open data cards (`DONKI`, `OSDR Veggie/PONDS`, `LRO`), a diegetic **Earth Mission Control Uplink** manned by Abd-Elrahman Ahmad (with a 1.3s one-way / 2.6s round-trip light-time delay on Days 1–6 and a hard service-level **Comms Blackout** on Day 7 Part B & C), four animated Ending Cutscenes, a deterministic **Debrief Screen** with an interactive **"What-If" Decision Time Machine**, and a top-bar **Judge / Classroom Jump** switcher.

## User Stories

1. As a Mission Commander starting a campaign, I want to watch a 4-scene animated pixel-art Opening Cutscene showing Earth Mission Control's pre-launch poll, liftoff countdown, the 1.3-second Earth-Moon radio signal visualization, and Shackleton Crater approach, so that I understand the crew and light-time physics before landing.
2. As a young player, I want cutscene playback controls (`Next Scene`, `Pause`, `Skip Cutscene`, `Replay Cutscene`) so that I can watch at my own pace or skip ahead cleanly.
3. As a first-time player, I want a 6-part Interactive Spotlight Tutorial covering navigation, station mini-games, trade-off decisions, the 4 Primary Resource Meters vs. 7 Sub-Resource Metrics drawer, shift progression, and Earth Mission Control Uplink / NASA data cards, so that I feel confident operating the base.
4. As a Mission Commander on Day 1, I want to pilot the Lunar Lander (`< 3.0 m/s`) onto either the `Sunlit Ridge` or `Crater Shadow Rim` using NASA LRO topography so that my landing site creates permanent power and radiation shielding trade-offs.
5. As a Mission Commander during each Morning Shift (`06:00–12:00`), I want to walk the 3/4 top-down cutaway base (`WASD`/Arrows or click-to-walk), talk to my 5 on-base Specialists, and assign each Specialist to their station (`+6` fatigue, `+10` for Sayed under Capillary PONDS) or Crew Quarters rest (`-12` fatigue) so that rotating tired crew matters tactically.
6. As a Mission Commander during each Midday Shift (`12:00–17:00`), I want to walk to the room flashing a **Midday Anomaly** beacon and complete a snappy repair console so that I prevent an `-8` Primary Resource penalty.
7. As a Mission Commander during each Evening Shift (`17:00–22:00`), I want to inspect a `<NasaDataBadge />` separating real satellite observations from habitat risk, optionally query **Earth Mission Control Uplink** (with a 2.6s round-trip signal animation), and lock in the day's permanent **Compounding Decision**.
8. As a Mission Commander on Day 2, I want to experiment hands-on with both Active Pumping Hydroponics and Passive Capillary Mats (`PONDS`) in the Greenhouse mini-game before committing to a farming system whose power vs. crew-labor trade-offs persist on Days 3–7.
9. As a Mission Commander on Day 3, I want to sweep electrostatic dust off solar panels and balance 4 breaker load sliders, then decide between Essential Heating, Battery Storage Banks, or Overclocked Regulators.
10. As a Mission Commander on Day 4, I want to analyze NASA DONKI flare/SEP telemetry with Sayed, modulate water-wall shielding valves, and experience the deterministic **Unbuffered Storm Bus Overload** if I run Active Pumps without Day 3 Battery Storage.
11. As a Mission Commander on Day 5, I want to inspect Omar Badr's Medbay Vitals Monitor, tune hydration, electrolytes, and circadian LED spectrum, and choose between full 24h rest or rationed split shifts.
12. As a Mission Commander on Day 6, I want to drive Yassin's Rover across Shackleton Crater avoiding `-200°C` shadow traps to drill water-ice and align Taha's S-Band dish, choosing between deep ice extraction (`relayReinforced = false`) and comms relay maintenance (`relayReinforced = true`).
13. As a Mission Commander on Day 7 Part B & C, I want **Comms Blackout** to lock out Earth Mission Control at the service level (`COMMS_BLACKOUT_ACTIVE`) and test my mastery across a 3-Stage deterministic compound emergency (`7.1`, `7.2`, `7.3`) shaped by my Days 1–6 choices.
14. As a Mission Commander completing Day 7 (or hitting `0` on any Primary Resource Meter), I want to watch the matching animated Ending Cutscene (`SCIENTIFIC_BREAKTHROUGH`, `MISSION_ACCOMPLISHED`, `CRITICAL_SURVIVAL`, or kid-safe `MISSION_FAILURE` Safe Abort) and explore my Day 1–7 causal chain and an interactive **"What-If" Decision Time Machine** on the Debrief Screen.
15. As a hackathon judge or classroom teacher, I want a persistent **"Judge / Classroom Jump"** dropdown in the top bar that warps cleanly to the Opening Cutscene, Tutorial, Day 1 Landing, any Day 1–7, any of the 6 Mini-Games, the Day 7 Blackout Crisis, or any of the 4 Endings with deterministically synthesized logs and flags.
16. As a player with or without internet/API keys, I want all NASA datasets (`DONKI`, `OSDR`, `LRO`), Earth Mission Control telemetry advice, Web Audio sound effects, and procedural pixel-art rooms and 7-expression head-only space-helmet portraits to work cleanly offline with automatic PNG override support.

## Implementation Decisions

1. **Five Deep Modules (`codebase-design`)**:
   - `SimulationEngine`: Pure deterministic reducer with zero UI/DOM imports governing initial baselines (`75/75/75/80` primary; `90/15/80/70/70/80/10` sub), 4-step Start-of-Day tick, Morning Roster fatigue coupling, post-action `activePumpsStalled` (`power < 25`) and `MISSION_FAILURE` (`any primary <= 0`) invariants, canonical `createPresetGameState()` synthesis, and `simulateWhatIfTimeline()`.
   - `EarthControlUplink`: Enforces `if (state.day === 7 && state.commsBlackout === true) throw new Error('COMMS_BLACKOUT_ACTIVE')` before delegating to `LocalEarthControlTelemetryAdapter` or optional `LiveLlmEarthControlAdapter`.
   - `NasaDataRepository`: Live DONKI fetcher (`2.5s` timeout) falling back seamlessly to curated embedded NASA `DONKI`, `OSDR Veggie/PONDS`, and `LRO` datasets split into `satelliteObservation`, `scientificInterpretation`, and `gameSimulationRule`.
   - `ProceduralPixelRenderer`: Draws the `1280×720` (16:9) 3/4 cutaway lunar base (8 interior rooms + 2 exterior zones with real-time state mutations and 60fps sprite/machinery loops), animated Opening/Ending cutscenes, and 42 head-only helmet portraits (`6 Specialists × 7 expressions`) with automatic `public/assets/avatars/<crewId>/<expression>.png` override lookup.
   - `SoundEngine`: Zero-dependency Web Audio API lookahead synthesizer driving multi-voice procedural chiptune/synthwave music (`exploration`, `crisis`, `cutscene`), tactile SFX (`playCue`, `setAmbientTrack`, `setMuted`), safety compressor limiting, and first-gesture unlock.
2. **Calibrated Power Curve & Deterministic Ending Trajectories (ADR-0001)**:
   - Daily modifiers: `Sunlit Ridge (+6 power/day)`, `Crater Shadow (-4 power/day)`, `Active Pumps (-8 power/day)`.
   - Day 4 Option 4A **Unbuffered Storm Bus Overload**: When `farmingMode === 'active_pumps'` and `day3Choice !== 'battery_storage'`, `power` drops to `min(power - 45, 20)` (`< 25`), reliably stalling pumps on both landing sites unless Day 3 batteries buffered the grid.
3. **Persistence Boundary**: `localStorage` (`mission_control_save_v1`) validated with a strict runtime type guard on load so malformed or stale state falls back safely to a clean initial state.

## Testing Decisions

1. **Public Seams Tested via `vitest` (`principle-test-behavior-not-implementation`)**:
   - `SimulationEngine`: Test Day 1 baselines, Specialist fatigue thresholds (`>= 70` half bonus, `>= 90` forced rest), Day 4 Unbuffered Storm Bus Overload with vs. without Day 3 Battery Storage, all 4 canonical Ending trajectories (`SCIENTIFIC_BREAKTHROUGH`, `MISSION_ACCOMPLISHED`, `CRITICAL_SURVIVAL`, `MISSION_FAILURE`), `createPresetGameState()`, and `simulateWhatIfTimeline()`.
   - `EarthControlUplink`: Test `COMMS_BLACKOUT_ACTIVE` rejection on Day 7 blackout even with a custom adapter, and context-aware Earth Control reply with `2.6s` delay metadata on Days 1–6.
   - `NasaDataRepository`: Test offline fallback resilience and strict three-part scientific attribution fields across Days 1–7.
   - `SoundEngine`: Test safe Node/headless initialization (`AudioContext` absent), track switching, and mute state transitions without throwing.
   - `Storage`: Test round-trip save/load and graceful rejection of corrupted JSON.
2. **Build & Runtime Verification**:
   - Verify TypeScript compilation (`tsc --noEmit`), full Vite production bundle (`npm run build`), Vitest suite (`npm test`), and zero-scroll desktop viewport layout (`1280×720`, `1440×900`) across every game stage.

## v2 Overhaul Requirements (Full-Screen 16:9, Zero-Scroll, Zero-Subtitle, Procedural Music, 60fps Animation)

1. **Zero-Scroll 16:9 Desktop Viewport Shell**:
   - Lock the entire experience (Opening Cutscene, Interactive Tutorial, Gameplay Base Map, all 6 Mini-Games, Dialogue/Decision/Advisor/Roster/Mission Log modals, Ending Cutscene, and Debrief Screen) into a zero-scroll 16:9 desktop container (`h-screen w-screen overflow-hidden`) scaling primary `1280×720` canvases cleanly via `object-contain`.
   - Organize multi-section views (Debrief Screen, Tutorial, Crew Roster, Mini-Game steps) into compact horizontal columns, tabs, or paged cards capped cleanly inside the viewport so no document scrollbars appear at `1280×720`, `1366×768`, `1440×900`, or `1920×1080`.
2. **Clutter-Free Floating Cockpit HUD**:
   - Replace multi-row headers, redundant room shortcut pill bars, directive banners above the map, and tall bottom room docks with one compact single-row top HUD bar (`Day + Clock + Shift`, 4 Primary Resource Meters, `Mute`, and one `Menu` popover grouping `Sub-Resources`, `Crew Roster`, `Mission Log`, `Earth Mission Control Uplink`, `Tutorial`, `Judge / Classroom Jump`, and `Reset`).
   - Surface contextual room controls through one compact on-canvas floating Room Action Card (`1–2` primary actions) triggered by walking near or clicking a room on the base map.
3. **Zero-Subtitle Policy & Kid-Friendly Copy (Ages 7–12)**:
   - Remove all subtitles, meter sublabels, deck taglines, and secondary caption lines across scenario data, crew profiles, HUD meters, cutscenes, mini-games, and modals.
   - Keep all narrative briefings, dialogue, tutorial hints, decision choices, and debrief takeaways to 1–2 punchy, active-voice sentences tailored for ages 7–12 while preserving canonical `GLOSSARY.md` terms and ADR-0004's three-part `<NasaDataBadge />` separation (`Satellite Observation`, `Scientific Meaning`, `Game Rule` — each one crisp sentence).
   - Unify all HUD panels, dialogs, mini-games, and the Debrief Screen under the high-contrast dark NASA-kid palette (`#0F172A`, `#1E293B`, `#F8FAFC`, `#79C8E8`, `#FFD66B`, `#9BD8A7`, `#A995E8`, `#F87171`).
4. **Multi-Voice Procedural Music & Tactile SFX**:
   - Upgrade `SoundEngine` to a Web Audio API lookahead (`audioCtx.currentTime`) multi-voice sequencer generating distinct `exploration`, `crisis`, and `cutscene` themes (bass, arpeggio lead, warm pad, soft pulse percussion) routed with varied tactile SFX (`footstep`, `dust_sweep`, `thruster`, `water_flow`, `bubble`, `radar_ping`, `alarm`, `static_burst`, `success`, `abort`) through a `DynamicsCompressorNode` safety ceiling and automatic first-gesture `AudioContext` unlock.
5. **Widescreen `1280×720` Pixel Art & 60fps Canvas Animation**:
   - Upgrade base map, Opening/Ending cutscenes, and mini-game graphics to `1280×720` (16:9) crisp pixel art (`imageSmoothingEnabled = false`).
   - Animate continuously at 60fps via `requestAnimationFrame` clamped `dt` loops off React render state: 4-frame Commander/Specialist walk cycles + regolith dust puffs, blinking/breathing helmet portraits (preserving the ADR-0003 PNG override seam), multi-layer parallax twinkling stars, rotating Earth limb with atmosphere rim glow, animated station machinery (hydroponic lamps/flow, radar sweeps, solar storm plasma waves), and responsive mini-game particle/waveform effects.
6. **Code Quality & Type Discipline**:
   - Adhere strictly to repository TypeScript standards (zero `as` casts, `unknown` boundary guards, exhaustive `never` discriminant checks, zero `console.log` calls) and keep all v1 simulation, NASA attribution, Earth Control blackout, and persistence contracts passing.

## v3 Linear Kid-Friendly Overhaul (Ages 7–12, Zero Yapping)

1. **Linear Sequential Daily Flow**:
   - Replace parallel multi-room chores and shift guesswork with one clear guided sequence each day:
     **`Start Menu -> Meet 1 Featured Crew Mate -> Play 1 Easy Mini-Game -> Pick 1 of 2 Choice Cards -> Next Day`**.
   - Highlight exactly one featured Specialist per Mission Day (`Sol 1` Al-Baraa, `Sol 2` Sayed, `Sol 3` Taha, `Sol 4` Taha, `Sol 5` Dr. Omar, `Sol 6` Yassin, `Sol 7` Al-Baraa) with a golden floor trail on the base map and zero distracting side-menus.
2. **Zero-Yapping Word Limits & Kid-Friendly Copy**:
   - **Scenario Titles & Choice Labels**: `2–4 words` max (`Aim the Solar Panels`, `Sunlit Peak`, `Crater Rim`, etc.).
   - **Day Prompts, Anomaly Text, & Choice Summaries**: `<= 10–12 words` per line in plain, active English for ages 7–12; Days 1–6 strictly present **2 choice cards** (`3B_battery_storage` and `3A_essential_heating` on Sol 3).
   - **Crew Profiles & Day Dialogues**: Specialist specialties `<= 8 words`; each `dayDialogues[1..7]` greeting and advice `1 short sentence (<= 12 words)`.
   - **Earth Control Uplink (`Abd-Elrahman`)**: Suggested questions `<= 12 words`; replies and live Gemini prompts constrained to `1–2 short kid-friendly sentences (<= 18 words)` while keeping the Day 7 `COMMS_BLACKOUT_ACTIVE` lockout intact.
3. **Forgiving 15-Second Mini-Games**:
   - Every mini-game stays impossible to fail (`SKIP ->` always available; gentle success triggers `"GREAT JOB!"` + `CONTINUE ->`) with single-screen visuals and `<= 8 word` instructions.

## Out of Scope

- Multiplayer networking or server-side database accounts.
- Day 8+ scenarios or external separate applications before the core playable game is complete.
- Full-body character art in dialogues/rosters or any depiction of crew injury or death.
