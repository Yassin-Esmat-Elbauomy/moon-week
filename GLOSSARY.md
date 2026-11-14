# Mission Control

A 2D top-down pixel-art lunar outpost simulation and junior astronaut trainer where a Mission Commander leads a six-specialist crew across a 7-day mission at the Lunar South Pole, balancing coupled engineering resources grounded in real NASA data.

## Language

### Roles & Entities

**Mission Commander**:
The player-controlled leader who walks the lunar base, assigns daily specialist shifts, operates station consoles, and locks in permanent mission decisions.
_Avoid_: Player avatar, 7th specialist, astronaut bot

**Specialist**:
One of the six named crew members (`AlBaraa Mohammad`, `Omar Badr`, `Taha Yasin`, `Yassin Esmat`, `Sayed Mostafa`, `Abd-Elrahman Ahmad`) with a dedicated station, domain specialty, and seven facial expression states. Five specialists operate inside the lunar base; Abd-Elrahman operates remotely from Earth Mission Control.
_Avoid_: NPC, helper, generic crewman

**Earth Mission Control Uplink**:
The remote telemetry and advisory channel manned by Communications Officer Abd-Elrahman Ahmad on Earth, operating with an authentic 1.3-second one-way (2.6-second round-trip) light-time delay on Days 1–6 and severed during the Day 7 Comms Blackout.
_Avoid_: AI chatbot, LLM assistant, hint button

### Simulation & Resources

**Primary Resource Meter**:
One of the four top-level 0–100 stability bars displayed on the Main HUD: `Life Support`, `Power`, `Radiation Protection (Shielding)`, and `Crew Readiness`. If any Primary Resource Meter reaches `0`, automated safety protocols trigger an immediate `MISSION_FAILURE` Safe Abort.
_Avoid_: Global health bar, main stat

**Sub-Resource Metric**:
One of the seven granular state variables tracked in the expandable Resource Drawer: `Crew Health`, `Crew Fatigue` (0–100, lower is better), `Medical Supplies`, `Food & Supplies`, `Water Availability`, `Rover Battery`, and `Science Score` (0–100+, uncapped).
_Avoid_: Secondary stat, hidden variable

**Specialist Fatigue**:
An individual 0–100 exhaustion score tracked per on-base Specialist (`+6` when assigned to a station shift, `+10` for manual capillary tending, `-12` when resting in Crew Quarters). Exceeding `70` halves that Specialist's station output; reaching `90` forces mandatory rest. Global `Crew Fatigue` is the mean of the five on-base Specialists.
_Avoid_: Stamina, energy points

### Daily Loop & Causality

**Mission Day**:
One of the seven scripted lunar operational cycles (`Day 1` through `Day 7`), running on a real-time shift clock from `06:00` to `22:00` (`16` in-game hours = `~8` real minutes at `1x` speed).
_Avoid_: Level, stage, turn

**Shift**:
One of the three daily operational phases within a Mission Day: **Morning Shift (`06:00–12:00`)** for crew duty roster assignment and station checks, **Midday Shift (`12:00–17:00`)** for subsystem anomaly inspection and repair, and **Evening Shift (`17:00–22:00`)** for the daily Compounding Decision and Mission Log.
_Avoid_: Sub-turn, time slot

**Midday Anomaly**:
A physical subsystem fault that spawns in a specific base room during the Midday Shift and inflicts a `-8` Primary Resource penalty if left unrepaired when the shift ends.
_Avoid_: Random event, bug

**Compounding Decision**:
The permanent Evening Shift engineering trade-off whose immediate deltas, daily resource modifiers, and causal state flags (`activePumpsStalled`, `hardwareFaultRisk`, `crisisResilience`, `relayReinforced`) persist across subsequent Mission Days.
_Avoid_: Dialogue choice, quiz answer

**Unbuffered Storm Bus Overload**:
The deterministic Day 4 power crisis triggered when a Commander operating Active Pumping Hydroponics selects Maximum Water-Wall Shielding without having banked Battery Storage on Day 3, dropping `Power` below `25` (`min(power - 45, 20)`) and causing an immediate **Active Pump Stall** (`activePumpsStalled = true`).
_Avoid_: Random power failure, RNG blackout

**Comms Blackout**:
The Day 7 Part B and Part C crisis state (`commsBlackout = true`) triggered by solar radio burst interference, which severs contact with Abd-Elrahman Ahmad and enforces a service-level lockout (`COMMS_BLACKOUT_ACTIVE`) on the Earth Mission Control Uplink.
_Avoid_: UI disabled state, offline mode
