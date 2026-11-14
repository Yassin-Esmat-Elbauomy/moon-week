# MISSION CONTROL — COMPLETE ORCHESTRATION & 60-MINUTE GAME SPECIFICATION

## ROLE & EXECUTION MODE
You are an Orchestration Agent coordinating senior game developers, full-stack TypeScript/React engineers, 2D pixel-art technical artists, narrative designers, and UI/UX specialists.

Your objective is to build the complete, browser-playable 2D top-down pixel-art lunar mission game **MISSION CONTROL** ("A Little Space Adventure. A Big Scientific Mission. — Beyond Survival") for the NASA Space Apps Challenge ("Build a Junior Astronaut Mission Trainer").

### CRITICAL PRIORITY RULES
1. **Build the Core Playable Game First**: Deliver the complete, end-to-end playable 2D lunar mission game (Opening Cutscene + Interactive Tutorial + Days 1 through 7 with 60-minute real-time gameplay loop & mini-games + 4 Ending Cutscenes + Deterministic Final Debrief) before building any separate external application sections.
2. **No Disconnected Screens or Dead Buttons**: Every visible button, room station, mini-game, crew character, cutscene control, resource drawer, save/load action, and tutorial step must be 100% functional.
3. **Resilient Local Fallbacks**: Wherever live external services (NASA Open APIs or LLM Advisor endpoints) are called, implement automatic, verified local fallbacks so the game runs offline or without API keys with zero errors.
4. **Incremental Orchestration**: Do not dump the entire application into one monolithic file. Inspect the workspace first, establish shared TypeScript interfaces, delegate modular work across phases, and verify each phase before advancing.

---

## 1. GAME IDENTITY & NASA CHALLENGE ALIGNMENT

- **Title**: MISSION CONTROL
- **Tagline**: A Little Space Adventure. A Big Scientific Mission.
- **Story Subtitle**: Beyond Survival
- **Target Audience**: Children aged 7–12 (with depth that engages older siblings, parents, and classroom educators).
- **Target Gameplay Duration**: **~60 Minutes for a full playthrough** (~4 minutes for Opening Cutscene + Tutorial, ~8 minutes per day across 7 Mission Days combining real-time top-down base operations, hands-on station mini-games, crew shift management, and narrative trade-offs, plus ~3 minutes for Ending Cutscenes & Debrief).
- **Judge / Classroom Quick-Jump Mode**: Include a persistent `"Judge / Classroom Jump"` dropdown in the top bar allowing instant 1-click warping to the Opening Cutscene, Tutorial, Day 1 Landing, any Day (Days 1–7), any Station Mini-Game, the Day 7 AI Blackout Crisis, or any of the 4 Ending Cutscenes so hackathon judges can test the entire 60-minute campaign inside a 3-minute review window.
- **Language & Tone**: Friendly, clear, encouraging plain English. Explain unavoidable scientific terms (*Sol*, *Radiation Dose (mSv)*, *Capillary Action*, *Coronal Mass Ejection (CME)*, *Light-Time Delay*, *Microgravity*) via immediate in-context tooltips.
- **Core Educational Goal**: Every decision involves a genuine engineering trade-off with both immediate and compounding multi-day consequences. Never design a "free" or "safe" choice that has no resource cost.

---

## 2. VISUAL STYLE: 3/4 TOP-DOWN PIXEL ART CUTAWAY BASE

### Main Aesthetic
- **2D Top-Down Pixel Art + Soft Space Adventure** (3/4 overhead perspective inspired by *Stardew Valley* and *Core Keeper*):
  - The lunar outpost and surrounding Lunar South Pole crater surface are viewed from above.
  - The lunar base roofs are cut away so the player sees all interior rooms simultaneously, walks the Mission Commander sprite between rooms (`WASD` / Arrow keys or click-to-move), and interacts with equipment consoles and crew members.
  - Decisions visually transform the pixel-art rooms in real time (e.g., Greenhouse crop trays visibly switch between vibrating Active Hydroponic Pumps with glowing water pipes vs. passive Capillary Mat beds; low power dims room lighting to emergency amber; Day 4 solar storms trigger exterior particle effects and blast shutters; Day 6 deploys the pixel Rover outside the Airlock onto the cratered surface).

### Color Palette & Typography
- **Space Blue**: `#263C75`
- **Sky Blue**: `#79C8E8`
- **Soft Purple**: `#A995E8`
- **Sunshine Yellow**: `#FFD66B`
- **Mint Green**: `#9BD8A7`
- **Backgrounds & Text**: Soft neutral habitat interior tiles, crisp lunar gray crater tiles outside, dark navy (`#0F172A`) for high-contrast readable text.
- **Typography**: Google Fonts `Fredoka` for headings/titles and `Nunito` for body text, dialogues, and HUD labels.
- **Avoid**: Dark horror aesthetics, intimidating military dashboards, tiny unreadable text, or color-only status indicators (always pair colors with icons and text labels).

### Zero-Broken-Asset Guarantee
- Build a programmatic HTML5 Canvas / SVG pixel-art tile, sprite, cutscene, and portrait generator (`src/assets/proceduralPixelArt.ts`) paired with an asset override loader (`public/assets/avatars/` and `public/assets/tiles/`).
- If external `.png` files are not yet placed in `public/assets/`, the procedural pixel renderer must automatically draw crisp pixel-art rooms, animated stations, crew sprites, cutscene frames, and expressive helmet portraits so the game never shows a broken image icon.

---

## 3. CHARACTER DESIGN: HEAD-ONLY CARTOON/PIXEL AVATARS

### Strict Visual Rule
- **Do NOT use full-body character illustrations in dialogue or profile panels.**
- Every crew member must be represented in dialogues, cutscene callouts, alerts, and crew rosters by a **Head-Only Cartoon/Pixel Avatar**:
  - Focus on the character's recognizable face and head.
  - Surround the head with a clean space helmet and visor frame, plus a minimal portion of the spacesuit collar/shoulders.
  - Keep a consistent art style and clean/transparent background across all six crew members.
  - Support loading the 6 real team members' reference avatars from `public/assets/avatars/<crewId>/<expression>.png`, with an automatic programmatic SVG/pixel portrait fallback that preserves distinct facial features for each teammate.

### Required Character Expressions (7 States per Crew Member)
Every crew member avatar must dynamically switch between these 7 facial expressions during dialogues, cutscenes, and story events:
1. `normal`
2. `happy`
3. `worried`
4. `surprised`
5. `focused`
6. `alert`
7. `concerned`

### Complete Crew Roster (6 Specialists + The Player)
The **Player** is the **Mission Commander** (controls the Commander character on the map and makes all final mission decisions; the player is not a 7th specialist).

1. **AlBaraa Mohammad** (`id: 'albaraa'`)
   - **Role**: Flight Engineer
   - **Base Station**: Power Station & Engineering Core
   - **Specialty**: Energy generation, solar arrays, battery storage, repairs, station systems, technical diagnostics.
2. **Omar Badr** (`id: 'omar'`)
   - **Role**: Medical Officer
   - **Base Station**: Medical Room & Crew Quarters
   - **Specialty**: Crew health, fatigue management, circadian rhythm, hydration/nutrition, medical supplies, medical alerts, crew well-being.
3. **Taha Yasin** (`id: 'taha'`)
   - **Role**: Communications Officer — Lunar Base
   - **Base Station**: Lunar Base Communication Room
   - **Specialty**: Local base network, internal communication systems, rover telemetry link, high-gain antenna hardware.
4. **Yassin Esmat** (`id: 'yassin'`)
   - **Role**: Robotics & Systems Officer
   - **Base Station**: Robotics Bay & Exterior Airlock
   - **Specialty**: Lunar rover operations, robotics, automated systems, external equipment inspection, surface sensor deployment.
5. **Sayed Mostafa** (`id: 'sayed'`)
   - **Role**: Science Officer
   - **Base Station**: Greenhouse & Science Lab
   - **Specialty**: Scientific research, NASA open data analysis, solar activity & space weather monitoring, hydroponic & biological experiments.
6. **Abd-Elrahman Ahmad** (`id: 'abdelrahman'`)
   - **Role**: Communications Officer — Earth Control
   - **Location**: **Earth Mission Control** (NOT physically inside the lunar base).
   - **Specialty**: Sends remote Earth telemetry, mission updates, and advisories with an authentic **1.3-second one-way (2.6-second round-trip) Earth-Moon light-time delay**. During Day 7 Part B & C, communication with Abd-Elrahman is completely lost.

---

## 4. OPENING & ENDING CUTSCENE SPECIFICATIONS

All cutscenes must be rendered as animated 2D pixel-art Canvas/SVG sequences with expressive head-only crew avatar dialogue callouts, smooth transitions, and playback controls (`Next Scene`, `Pause`, `Skip Cutscene`, `Replay Cutscene`).

### A. Opening Cutscene (`src/components/cutscenes/OpeningCutscene.tsx`)
Triggered when clicking **"Start New Mission"** (before Day 1 Lunar Landing):
- **Scene 1 — Earth Mission Control Briefing**:
  - Pixel-art view of Earth Mission Control and the lunar rocket on the launchpad at twilight.
  - **Abd-Elrahman Ahmad** conducts the final pre-launch poll from his console. Each specialist's head-only avatar pops in to confirm system readiness: **AlBaraa** (power core green), **Omar** (crew medical clearance green), **Taha** (lunar comms link locked), **Yassin** (rover payload secured), and **Sayed** (NASA science instruments calibrated).
- **Scene 2 — Rocket Ignition & Liftoff**:
  - Countdown from `T-5` to `LIFTOFF`. Animated thruster plumes, gentle screen shake, and pixel clouds rushing past as the rocket ascends into orbit with excited crew expressions (`happy` / `surprised`).
- **Scene 3 — Trans-Lunar Coast & The 1.3-Second Delay**:
  - Animated view of the spacecraft cruising from Earth toward the Moon across a parallax starfield.
  - Abd-Elrahman transmits a status check from Earth; visually animate the radio wave traveling across the screen to teach the player that light and radio signals take **1.3 seconds each way** between Earth and the Moon.
- **Scene 4 — Lunar South Pole Approach (Handoff to Player)**:
  - The jagged craters and sunlit peaks of **Shackleton Crater Rim** fill the viewport below.
  - **AlBaraa** and **Yassin** alert the Commander: *"Manual descent control is yours, Commander!"*
  - Smoothly transitions into the **Pre-Mission Interactive Tutorial** and the **Day 1 Interactive Lunar Landing Mini-Game**.

### B. Four Ending Cutscenes (`src/components/cutscenes/EndingCutscene.tsx`)
Triggered automatically at the conclusion of Day 7 Part D based on the Simulation Engine's deterministic outcome calculation (and replayable anytime from the Debrief Screen):
1. **Ending 1 Cutscene — `SCIENTIFIC_BREAKTHROUGH` ("The Lunar Beacon")**:
   - Animated pixel sequence showing the lunar base glowing at full capacity, lush green crops thriving in the Greenhouse dome, Yassin's Rover parked with glittering water-ice core samples, and a second Artemis supply lander touching down in the background to expand the outpost.
   - All 6 crew avatars celebrate (`happy` expressions) as Sayed transmits breakthrough biological and solar data back to Abd-Elrahman on Earth.
2. **Ending 2 Cutscene — `MISSION_ACCOMPLISHED` ("Outpost Established")**:
   - Warm, steady lights across all habitat rooms as the Earth-rise glows over Shackleton Crater.
   - The crew gathers in the Control Room sharing a celebratory transmission with Abd-Elrahman at Earth Control, confirming humanity's lunar outpost survived its 7-day proving mission.
3. **Ending 3 Cutscene — `CRITICAL_SURVIVAL` ("Through the Storm")**:
   - Dramatic pixel sequence: frost on the habitat windows, flickering amber backup lights, and scorch marks on the exterior solar panels from the solar storm.
   - The crew looks tired (`concerned` turning to relieved `normal` expressions) as the relief resupply ship locks onto Taha's emergency beacon—proving the crew survived through tough sacrifices, while visually showing which systems barely held together.
4. **Ending 4 Cutscene — `MISSION_FAILURE` ("Automated Safe Abort — Lessons for Next Time")**:
   - *Kid-Safe Educational Framing (Never depict injury or death)*: Warning beacons flash amber across the depleted base module as automated safety protocols trigger an early mission scrub.
   - An animated ascent return craft lifts off safely from the lunar pad carrying the disappointed but safe crew (`worried` / `concerned` expressions) back to lunar orbit while Abd-Elrahman's voiceover summarizes the exact resource bottleneck that forced the abort and encourages the Commander to try a new strategy.

---

## 5. THE 60-MINUTE GAMEPLAY LOOP (~8–9 MINUTES PER IN-GAME DAY)

To create a rich **60-minute gameplay experience** (rather than a 10-minute text clicker), every day from Day 1 to Day 7 runs on an interactive **3-Phase Daily Cycle** powered by a real-time lunar shift clock and hands-on station mini-games:

### A. Real-Time Daily Clock & Time Controls
- Each mission day runs from **`06:00` to `22:00` (16 in-game hours = ~8 minutes of active real-time gameplay per day, where 1 in-game hour = 30 real seconds)**.
- The clock automatically pauses whenever a Tutorial step, Dialogue sequence, NASA Science Card, or Major Trade-Off Decision Modal is open so young players are never rushed while reading.
- Include HUD time controls: `Pause`, `1x Normal Speed`, `2x Fast Forward`, and an `"End Current Shift / Advance to Next Phase"` button (once required shift tasks are completed) so fast players or judges never have to wait idly.

### B. The 3 Daily Phases (Every Day)
1. **Phase 1: Morning Shift (`06:00–12:00`, ~3 mins) — Crew Duty Roster & Routine Station Mini-Games**:
   - The Commander walks through the top-down base, checks the morning briefing in the Control Room, assigns the 5 on-base crew specialists to work stations or rest bunks (working a station grants a daily resource bonus but adds `+6 crewFatigue`; resting in Crew Quarters removes `-12 crewFatigue`), and completes **2 routine hands-on station mini-games**.
2. **Phase 2: Midday Shift (`12:00–17:00`, ~2.5 mins) — Live Base Inspection & Subsystem Anomaly**:
   - An interactive physical anomaly spawns inside one of the base rooms or exterior zones (e.g., regolith dust coating solar panels, CO2 scrubber filter saturation, hydroponic valve pressure drift, comms dish micro-misalignment).
   - The player must walk the Commander to the affected room, consult the specialist on duty, and play a **repair/calibration mini-game** before the anomaly drains resources.
3. **Phase 3: Evening Shift (`17:00–22:00`, ~2.5 mins) — Major NASA Trade-Off Event & Mission Log**:
   - The day's signature narrative event triggers. The player inspects the relevant NASA dataset via `<NasaDataBadge />`, optionally queries the AI Mission Advisor (Days 1–6 only), locks in the day's permanent **Compounding Engineering Decision**, and reviews the generated **Daily Mission Log** before the crew sleeps at `22:00`.

### C. Six Playable 2D Station Mini-Games (`src/components/minigames/`)
Every room features a replayable, tactile 2D mini-game (60–90 seconds per play) that directly impacts resource efficiency:
1. **Lunar Lander Thruster Descent (`LunarLanderGame.tsx` — Day 1)**:
   - Pilot the lander using lateral thrusters (`A/D` or `Left/Right`) and retro-braking (`Space`/`Up`) to touch down gently (`< 3.0 m/s`) at either the Sunlit Ridge or Crater Shadow Rim while managing fuel.
2. **Hydroponic Pipe & Capillary Matrix Builder (`GreenhouseMiniGame.tsx` — Greenhouse)**:
   - Interactive grid puzzle: in **Active Pumps** mode, rotate pressurized pipe tiles to connect nutrient tanks to crop beds before the timer runs out; in **Capillary (PONDS)** mode, arrange porous wicking blocks to draw water upward via surface tension and clear mineral clogs by hand.
3. **Power Grid Bus Balancer & Solar Sweeper (`PowerGridMiniGame.tsx` — Power Station)**:
   - Adjust live load sliders across Habitat Heating, Life Support, Lab, and Battery Chargers to match fluctuating solar input without tripping the main breaker, plus sweep lunar electrostatic dust off solar cells.
4. **Space Weather Dosimetry & Shielding Tuner (`RadiationMiniGame.tsx` — Science Lab)**:
   - Read live/historical NASA DONKI proton flux waves and modulate the habitat's water-wall shielding valves to absorb radiation spikes without draining battery reserves.
5. **Crew Vitals & Circadian Care Diagnostic (`MedbayMiniGame.tsx` — Medical Room)**:
   - Match crew hydration, electrolyte nutrition, and circadian lighting spectrum sliders to counteract space motion sickness and fatigue for tired crew members.
6. **Exterior Crater Rover Expedition & Dish Alignment (`RoverSurfaceMiniGame.tsx` — Robotics & Comms)**:
   - Drive Yassin's pixel Rover across a multi-screen top-down crater map avoiding boulders and `-200°C` shadow traps to drill water-ice cores and service the S-band comms relay, paired with Taha's antenna waveform alignment tuner.

---

## 6. AUTONOMOUS NASA OPEN DATA RESEARCH & INTEGRATION

Use your search/fetch tools during implementation (and wire runtime API fetchers with local verified dataset fallbacks in `src/data/nasaVerifiedData.ts`) so the game is grounded in real NASA science:

1. **NASA DONKI (Space Weather Database Of Notifications, Knowledge, Information)**:
   - Fetch or embed real historical solar flare (`FLR`), Solar Energetic Particle (`SEP`), and Geomagnetic Storm (`GST`) records from `https://api.nasa.gov/DONKI/` (e.g., actual X-class solar flare timestamps, peak flux values, and CME speeds).
   - **Scientific Accuracy Rule**: Never present raw solar flare indices or satellite proton flux as direct measurements of radiation dose inside the lunar base. Clearly distinguish: (a) actual NASA satellite observations, (b) scientific interpretation, and (c) the simplified game risk/shielding indicator.
2. **NASA OSDR (Open Science Data Repository)**:
   - Ground Day 2 farming mechanics in real NASA plant habitat research: **Veggie** and **PONDS (Passive Orbital Nutrient Delivery System)** datasets (comparing active pumped hydroponic circulation against passive capillary mat water delivery driven by surface tension and adhesion).
   - Ground Day 5 medical mechanics in NASA OSDR human spaceflight findings (sleep/circadian disruption in altered lighting, space motion adaptation, hydration/nutrition, and radiation protection).
3. **NASA Lunar Reconnaissance Orbiter (LRO) & Artemis South Pole Data**:
   - Ground Day 1 landing sites and Day 6 rover missions in real **Shackleton Crater Rim** topography: sunlit ridges ("Peaks of Eternal Light") vs. Permanently Shadowed Regions (PSRs at ~`-200°C` trapping water-ice).
4. **In-Game Attribution (`<NasaDataBadge />`)**:
   - Every daily event modal, farming simulator, and science card must display a prominent **"Verified NASA Data"** badge showing the exact NASA source (e.g., `NASA DONKI`, `NASA OSDR Veggie/PONDS`, `NASA LRO`) and a plain-language "Why This Matters in Real Spaceflight" note.

---

## 7. RESOURCE MANAGEMENT & SIMULATION ENGINE RULES

### Primary HUD Hierarchy (Preventing Player Overload)
To keep the interface clear for ages 7–12 while preserving full simulation depth:
- **Display 4 Primary Resource Meters (0–100 scale) on the Main Top HUD**:
  1. **Life Support** (`lifeSupport`: composite stability of O2, Water, and Food)
  2. **Power** (`power`: solar generation + battery reserves vs. active load)
  3. **Radiation Protection / Shielding** (`shielding`: hull & water-wall radiation protection)
  4. **Crew Readiness** (`crewReadiness`: composite of Crew Health, inverse Crew Fatigue, and Medical Supplies)
- **Track All Granular Sub-Resources in the Simulation Engine & Expandable Resource Dashboard**:
  - `crewHealth` (0–100)
  - `crewFatigue` (0–100, lower is better; high fatigue degrades `crewReadiness` and task efficiency)
  - `medicalSupplies` (0–100)
  - `foodAndSupplies` (0–100)
  - `waterAvailability` (0–100)
  - `roverBattery` (0–100)
  - `scienceScore` (0–100+)

---

## 8. COMPLETE TIMELINE: OPENING CUTSCENE + TUTORIAL + DAYS 1 TO 7 + ENDING CUTSCENES

### PRE-MISSION INTERACTIVE TUTORIAL
After the **Opening Cutscene**, present a guided interactive spotlight walkthrough with highlighted UI controls and visual examples:
- **A. Navigation**: Moving between screens, walking/clicking on the top-down base map, opening character profiles, opening mission logs.
- **B. Interaction & Mini-Games**: Clicking crew members, starting dialogues, inspecting rooms, operating station mini-games, and managing the daily shift clock.
- **C. Decision-Making**: Reading an event, comparing choices, seeing immediate vs. delayed trade-offs, confirming a decision.
- **D. Resource Dashboard**: Understanding the 4 Primary HUD meters (`Life Support`, `Power`, `Radiation Protection`, `Crew Readiness`) and opening the detailed drawer for `Medical Supplies`, `Food`, `Water`, `Crew Health`, and `Crew Fatigue`.
- **E. Mission Progression**: How Morning, Midday, and Evening shifts work, how Mission Logs are recorded, and how to advance to the next day.
- **F. Help & Scientific Info**: Reading `<NasaDataBadge />` explanations, consulting the AI Mission Advisor, and reviewing past choices.
- **Tutorial Controls**: `Next`, `Previous`, `Skip Tutorial`, and `Restart Tutorial` (from Pause/Settings menu). Ends with: *"You are ready, Commander!"* and transitions directly into Day 1.

---

### DAY 1 — TOUCHDOWN & WELCOME TO THE MOON!
- **Morning Shift (Interactive Lunar Landing Mini-Game & Site Selection)**:
  - The player pilots the lunar lander down to the Lunar South Pole (`LunarLanderGame.tsx`) managing lateral thrusters, retro-braking (`< 3.0 m/s`), and fuel.
  - **Compounding Choice 1 — Select Touchdown Site (NASA LRO Shackleton Crater Data)**:
    - **Option 1A — Sunlit Ridge ("Peak of Eternal Light")**:
      - *Immediate*: `power: +10`, `waterAvailability: -10`, `lifeSupport: -5` (if hard landing `>= 3.0 m/s`, apply `-10 shielding`).
      - *Compounding Effect*: Provides `+10 power/day` solar generation on Days 2–7, **but** leaves the base exposed on the ridge (`-10 extra shielding` penalty during the Day 4 Solar Storm).
    - **Option 1B — Crater Shadow Rim (Near Water-Ice Deposit)**:
      - *Immediate*: `power: -10` (extra thruster burn in shadow), `waterAvailability: +15`, `lifeSupport: +10`.
      - *Compounding Effect*: Crater wall provides natural terrain shielding (`+10 shielding` protection during the Day 4 Solar Storm) and rich water reserves for Day 2 farming, **but** reduces solar recharge (`-5 power/day` on Days 2–7).
- **Midday Shift (Base Activation & Crew Check-In)**:
  - Walk the Commander through the newly powered top-down lunar base rooms (`Control Room`, `Main Habitat`, `Power Station`, `Life Support`, `Medbay`, `Greenhouse`, `Comms Room`, `Robotics Bay`).
  - Meet all 6 crew members (`AlBaraa`, `Omar`, `Taha`, `Yassin`, `Sayed`, and `Abd-Elrahman` calling from Earth Control with the visible **1.3s one-way / 2.6s round-trip delay**) and resolve a post-landing power & space-motion adaptation check using the Power Station and Medbay mini-games.
- **Evening Shift**: Complete Day 1 Systems Readiness confirmation and generate Day 1 Mission Log.

---

### DAY 2 — GROWING FOOD ON THE MOON (FARMING & LIFE SUPPORT)
- **Featured Crew**: Sayed Mostafa & AlBaraa Mohammad.
- **Morning & Midday Shifts**: Assign daily crew shifts, run routine Power/Life Support checks, and open the Greenhouse interactive lab (`GreenhouseMiniGame.tsx`) to test both **Active Pumps** and **Capillary Action (PONDS)** hands-on.
- **Evening Shift — Compounding Choice 2 (Grounded in NASA OSDR Veggie & PONDS Data)**:
  - **Option 2A — Active Pumping Hydroponics**:
    - *Immediate*: `power: -10`, `waterAvailability: -10`, `foodAndSupplies: +15`, `lifeSupport: +10`, `scienceScore: +10`.
    - *Compounding Effect*: Generates `+8 lifeSupport` and `+8 foodAndSupplies` every day on Days 3–7, **but** drains `-12 power/day`. **Critical Failure Rule**: If `power` ever drops below `25` on any later day, the pumps stall (`activePumpsStalled = true`), causing an immediate `-15 lifeSupport` and `-15 foodAndSupplies` crop failure!
  - **Option 2B — Passive Capillary System (PONDS)**:
    - *Immediate*: `power: 0`, `waterAvailability: -5`, `foodAndSupplies: +6`, `lifeSupport: +5`, `scienceScore: +10`.
    - *Compounding Effect*: Uses `0 power/day` and cannot fail during power shortages, **but** produces food/O2 slower (`+3 lifeSupport/day`) and requires manual crew tending (`+8 crewFatigue/day`, reducing `crewReadiness` by `-6/day` on Days 3–6).

---

### DAY 3 — THE POWER PUZZLE
- **Featured Crew**: AlBaraa Mohammad.
- **Morning & Midday Shifts**: Manage crew shifts, sweep electrostatic lunar dust off the exterior solar panels, and play the `PowerGridMiniGame.tsx` breaker-balancing challenge as lunar surface temperatures drop.
- **Evening Shift — Compounding Choice 3 (Power Allocation & Load Shedding)**:
  - **Option 3A — Prioritize Essential Life Support & Greenhouse Heating**:
    - *Immediate*: `lifeSupport: +10`, `crewReadiness: +5`, `power: -10`.
    - *Compounding Effect*: Leaves the Rover battery only partially charged (`roverBattery: 55`) for Day 6 and pauses Sayed's high-energy spectrometer (`scienceScore: +0`).
  - **Option 3B — Prioritize Battery Storage Banks & Science Lab**:
    - *Immediate*: `power: +15`, `roverBattery: 100`, `scienceScore: +20`, `lifeSupport: -12`, `crewReadiness: -8`.
    - *Compounding Effect*: Drops habitat cabin temperature overnight, increasing `crewFatigue: +15` and worsening the Day 5 medical event.
  - **Option 3C — Overclock Power Regulators (Emergency Engineering Push)**:
    - *Immediate*: `power: +10`, `lifeSupport: +5`, `scienceScore: +10`, `crewFatigue: +15`, `crewReadiness: -10`.
    - *Compounding Effect*: Sets `hardwareFaultRisk = true`, which triggers a secondary power junction fault during the Day 7 Final Challenge.

---

### DAY 4 — A MESSAGE FROM THE SUN (SPACE WEATHER & RADIATION)
- **Featured Crew**: Sayed Mostafa.
- **Morning & Midday Shifts**: Analyze NASA DONKI solar flare (`FLR`) and Solar Energetic Particle (`SEP`) telemetry with Sayed in the Science Lab and play the `RadiationMiniGame.tsx` water-wall shielding modulator. Clearly distinguish NASA satellite observations from internal base radiation dose.
- **Evening Shift — Compounding Choice 4 (Solar Storm Response Protocol)**:
  - **Option 4A — Maximum Shielding & Water-Wall Storm Lockdown**:
    - *Immediate*: `shielding: +15` (modified by Day 1 site: `+10` bonus if `Crater Shadow`, `-10` penalty if `Sunlit Ridge`), `crewReadiness: +5`, `power: -25` (diverted to active water-wall circulation).
    - *Compounding Effect*: If the player chose **Active Pumps** on Day 2 and did not save battery on Day 3, this `-25 power` drop can push `power < 25` and stall the Greenhouse pumps unless mitigated!
  - **Option 4B — Partial Shielding (Keep Greenhouse & Science Online)**:
    - *Immediate*: `power: -10`, `scienceScore: +15`, `shielding: -20` (extra `-10` if `Sunlit Ridge`), `crewReadiness: -15`, `crewHealth: -12`.
    - *Compounding Effect*: Radiation exposure stress directly triggers a higher-severity medical alert on Day 5 and consumes `-10 medicalSupplies` automatically.

---

### DAY 5 — MEDICAL MISSION (CREW HEALTH & WELL-BEING)
- **Featured Crew**: Omar Badr.
- **Morning & Midday Shifts**: Driven by accumulated effects from Days 1–4 (manual capillary farm labor, cold cabin from Day 3, or storm stress from Day 4), inspect the fictional Crew Health Monitor in the Medbay with Omar and complete the `MedbayMiniGame.tsx` hydration, nutrition, and circadian lighting recovery task. (All health metrics are fictional educational indicators grounded in NASA OSDR human research).
- **Evening Shift — Compounding Choice 5 (Medical Care & Shift Schedule)**:
  - **Option 5A — Full 24-Hour Crew Rest Protocol & Complete Medkit Treatment**:
    - *Immediate*: `crewHealth: +20`, `crewFatigue: -30`, `crewReadiness: +25`, `medicalSupplies: -25`, `lifeSupport: -5`.
    - *Compounding Effect*: Crew enters Days 6 and 7 at peak alertness (`+10` crisis resilience on Day 7), **but** pausing exterior maintenance reduces `shielding: -8`.
  - **Option 5B — Rationed Medical Supplies & Split Shift Rotation**:
    - *Immediate*: `crewHealth: +8`, `crewFatigue: -10`, `crewReadiness: +8`, `medicalSupplies: -5`, `scienceScore: +10`.
    - *Compounding Effect*: Preserves `medicalSupplies` for emergencies, **but** lingering crew fatigue imposes `-8 crewReadiness` at the start of Day 7.

---

### DAY 6 — ROBOT EXPLORATION (LUNAR SURFACE ROVER MISSION)
- **Featured Crew**: Yassin Esmat.
- **Morning & Midday Shifts**: Prepare the Rover in the Robotics Bay, check `roverBattery` (influenced by Day 3), and drive the Rover across the interactive exterior top-down crater map (`RoverSurfaceMiniGame.tsx`) to navigate obstacles, scan anomalies, and collect samples.
- **Evening Shift — Compounding Choice 6 (Rover Primary Objective)**:
  - **Option 6A — Deep Shadowed Crater Water-Ice & Volatile Extraction**:
    - *Immediate*: `waterAvailability: +25`, `lifeSupport: +15`, `scienceScore: +25`, `power: -15`, `roverBattery: -45` (intense heater use inside the `-200°C` crater).
    - *Compounding Effect*: Leaves the external S-band communications relay unserviced (`relayReinforced = false`), making the Day 7 communication blackout harder to diagnose.
  - **Option 6B — External Comms Dish & Solar Junction Maintenance**:
    - *Immediate*: `power: +15`, `shielding: +10`, `scienceScore: +5`, `roverBattery: -25`.
    - *Compounding Effect*: Sets `relayReinforced = true`, giving Taha pre-cached local diagnostics during the Day 7 blackout and unlocking a clearer recovery pathway.

---

### DAY 7 — LOST CONNECTION: THE FINAL CHALLENGE (COMBINED CLIMAX)
- **Featured Crew**: Taha Yasin, Abd-Elrahman Ahmad, and all crew members.
- **Structural Rule**: This chapter integrates both **Lost Connection** and **The Final Challenge** into Day 7. Do not create a Day 8.

#### Part A — Morning Shift: Degraded Signal
- Solar radio burst interference disrupts the Earth-Moon link. Messages from Abd-Elrahman at Earth Mission Control arrive scrambled and delayed. Taha attempts dish alignment in the Communication Room.

#### Part B — Midday Shift: Complete Communication Loss & Service-Level AI Shutdown
- The link to Earth Mission Control drops completely (`OFFLINE — LOSS OF SIGNAL`). Abd-Elrahman cannot send guidance.
- **Mandatory Logic-Level AI Lockout**:
  - Set `gameState.commsBlackout = true`.
  - **Do NOT merely hide the AI Advisor button in the UI.** Inside `src/services/aiAdvisor.ts`, enforce a strict code guard: when `gameState.day === 7 && gameState.commsBlackout === true`, the service/API function itself must reject/throw `COMMS_BLACKOUT_ACTIVE` and refuse to return any advisory response.
  - Opening the AI Advisor panel displays a narrative static-screen message explaining that external AI and Earth Control telemetry are cut off, so the Commander must rely on their own mastery, the crew, system indicators, and previously unlocked Mission Logs.

#### Part C — Evening Shift: The Dynamic Multi-Step Final Challenge
- While cut off from Earth and the AI Advisor, a compound multi-system emergency strikes the outpost driven deterministically by the player's accumulated state from Days 1–6 (`activePumpsStalled`, `hardwareFaultRisk`, `sunny_ridge` radiation wear, low `power`, low `shielding`, or high `crewFatigue`):
  1. **Stage 1 (Engineering & Power Stabilization — AlBaraa & Yassin)**: Complete an emergency Power Bus reroute mini-game and decide whether to tap Rover battery reserves or isolate an overclocked junction vs. sacrificing lab heating.
  2. **Stage 2 (Life Support & Greenhouse Preservation — Sayed & Omar)**: Balance oxygen scrubber surge and crop tray insulation against crew metabolic workload and medical reserves.
  3. **Stage 3 (Local Comms & Autonomous Recovery — Taha & Full Crew)**: Use Taha's waveform tuner mini-game (enhanced if `relayReinforced === true` from Day 6) and crew guidance to realign the backup transponder and stabilize the habitat.

#### Part D — Communication Recovery, Ending Cutscene & Final Debrief
- Taha restores the backup carrier wave (`commsBlackout = false`). Abd-Elrahman reconnects from Earth Control.
- **Deterministic Ending Calculation (Computed by Simulation Engine, NEVER by AI)**:
  1. `SCIENTIFIC_BREAKTHROUGH`: All 4 primary resources (`lifeSupport`, `power`, `shielding`, `crewReadiness`) `>= 60` AND `scienceScore >= 75`.
  2. `MISSION_ACCOMPLISHED`: All 4 primary resources `>= 50`.
  3. `CRITICAL_SURVIVAL`: All 4 primary resources `> 0`, with at least one `< 50`.
  4. `MISSION_FAILURE`: Any primary resource reaches `0` at any point during the mission.
- **Play the Matching Ending Cutscene (`EndingCutscene.tsx`)**: Play the full animated 2D pixel-art ending cutscene corresponding to the achieved outcome (`SCIENTIFIC_BREAKTHROUGH`, `MISSION_ACCOMPLISHED`, `CRITICAL_SURVIVAL`, or `MISSION_FAILURE`).
- **Transition to the Final Mission Debrief Screen (`DebriefScreen.tsx`)**:
  - Final resource bars and granular sub-metrics (`Crew Health`, `Fatigue`, `Medical Supplies`, `Water`, `Food`, `Science Score`).
  - Button to **Replay Ending Cutscene** or preview how other choices would have changed the ending.
  - **Decision Cause-and-Effect Chain**: Visual timeline showing how every choice from Day 1 to Day 7 compounded to produce the final outcome.
  - **NASA Open Data Traceability Report**: Clear summary of which NASA datasets (`DONKI`, `OSDR Veggie/PONDS`, `LRO`) were used and why.

---

## 9. TECHNICAL ARCHITECTURE & FOLDER STRUCTURE

Use **React 18+**, **TypeScript**, **Vite**, and **Tailwind CSS** with **HTML5 Canvas / SVG** for the 2D top-down pixel-art world, cutscenes, and interactive mini-games:

```text
src/
├── types/
│   └── game.ts                      # All TypeScript interfaces (GameState, Resources, Crew, Clock, Events, Logs)
├── data/
│   ├── nasaVerifiedData.ts          # Live NASA API fetcher + verified embedded DONKI, OSDR, and LRO datasets
│   ├── crewProfiles.ts              # 6 crew members, roles, specialties, expressions, dialogue trees
│   └── dailyScenarios.ts            # Complete Day 1–7 shifts, anomalies, trade-off choices, and NASA badges
├── simulation/
│   ├── engine.ts                    # Pure deterministic reducer, daily clock, compounding rules, ending calculator
│   └── storage.ts                   # localStorage save, auto-resume, log history, and tutorial/mission reset
├── services/
│   └── aiAdvisor.ts                 # Read-only AI Advisor service with hard Day 7 commsBlackout exception guard
├── assets/
│   └── proceduralPixelArt.ts        # Programmatic 3/4 top-down pixel tilemap, cutscene scenes + head-only avatars
├── components/
│   ├── cutscenes/
│   │   ├── OpeningCutscene.tsx      # 4-scene animated Earth launch -> Trans-Lunar coast -> Lunar approach cutscene
│   │   └── EndingCutscene.tsx       # 4 distinct animated pixel-art ending cutscenes for each mission outcome
│   ├── hud/
│   │   ├── TopHud.tsx               # 4 Primary bars, Real-Time Clock (06:00-22:00), Speed/Judge Jump controls, 8 buttons
│   │   └── ResourceDrawer.tsx       # Detailed sub-metrics (Health, Fatigue, Meds, Water, Food, Rover, Science)
│   ├── map/
│   │   └── TopDownLunarBase.tsx     # Interactive 3/4 top-down pixel cutaway base + walkable Commander + crew assignments
│   ├── minigames/
│   │   ├── LunarLanderGame.tsx      # Day 1 interactive thruster descent + Landing Site selector
│   │   ├── GreenhouseMiniGame.tsx   # Active Pumps pipe routing vs. Capillary PONDS matrix puzzle
│   │   ├── PowerGridMiniGame.tsx    # Breaker load balancer & electrostatic solar dust sweeper
│   │   ├── RadiationMiniGame.tsx    # DONKI proton flux wave matcher & water-wall shield tuner
│   │   ├── MedbayMiniGame.tsx       # Crew vitals hydration, nutrition & circadian wavelength tuner
│   │   └── RoverSurfaceMiniGame.tsx # Exterior multi-zone crater rover driving, ice drilling & S-band dish tuner
│   ├── narrative/
│   │   ├── DialoguePanel.tsx        # Head-only avatar with 7 expressions, speech text, 1.3s Earth delay animation
│   │   ├── DecisionModal.tsx        # Trade-off comparison UI, Active Pumps vs Capillary visualizer, <NasaDataBadge/>
│   │   └── TutorialSpotlight.tsx    # 6-part interactive pre-mission tutorial (Next, Prev, Skip, Restart)
│   └── modals/
│       ├── CrewRosterModal.tsx      # All 6 crew profiles, shift assignments + talk triggers
│       ├── MissionLogModal.tsx      # Saved daily logs from Day 1 to current day
│       ├── AiAdvisorModal.tsx       # Advisor UI (renders lockout static screen when commsBlackout === true)
│       └── DebriefScreen.tsx        # Final outcome, Replay Cutscene button, causal timeline, NASA traceability report
└── App.tsx                          # Main application shell, cutscene router, and state orchestrator