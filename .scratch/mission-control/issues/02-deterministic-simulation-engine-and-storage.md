# 02: Deterministic Simulation Engine and Schema-Validated Storage

**What to build:** Implement the pure deterministic `SimulationEngine` (`createInitialGameState`, `createPresetGameState`, `transitionGameState`, `simulateWhatIfTimeline`, `computeMissionEnding`) and schema-validated `localStorage` persistence (`mission_control_save_v1`) following ADR-0001, tested first via `vitest` for all 4 ending trajectories, Specialist fatigue rules, and the Day 4 Unbuffered Storm Bus Overload trap.

**Blocked by:** 01: Project Scaffold and Domain Types

**Status:** resolved

- [ ] All 4 canonical Ending paths (`SCIENTIFIC_BREAKTHROUGH`, `MISSION_ACCOMPLISHED`, `CRITICAL_SURVIVAL`, `MISSION_FAILURE`) pass deterministic assertions
- [ ] Day 4 Unbuffered Storm Bus Overload (`power < 25` -> `activePumpsStalled`) fires on both landing sites when Active Pumps lack Day 3 Battery Storage, and stays online when Battery Storage was chosen
- [ ] Post-action Safe Abort (`any primary <= 0` -> `MISSION_FAILURE`) fires immediately after any transition
- [ ] Corrupted or stale `localStorage` payloads safely reset instead of throwing
