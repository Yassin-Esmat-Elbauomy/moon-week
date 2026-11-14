# 03: NASA Verified Data, Scenarios, Earth Control Uplink, and Sound Engine

**What to build:** Implement the `NasaDataRepository` (live DONKI fetcher with 2.5s timeout + verified embedded `DONKI`, `OSDR Veggie/PONDS`, and `LRO` datasets separating satellite observations from habitat dose per ADR-0004), full Day 1–7 crew dialogues and daily scenarios, the diegetic `EarthControlUplink` (`Abd-Elrahman Ahmad` with `COMMS_BLACKOUT_ACTIVE` hard service guard per ADR-0002), and the procedural Web Audio `SoundEngine`.

**Blocked by:** 01: Project Scaffold and Domain Types, 02: Deterministic Simulation Engine and Schema-Validated Storage

**Status:** resolved

- [ ] `vitest` proves `queryEarthControl()` throws `COMMS_BLACKOUT_ACTIVE` during Day 7 blackout even if a custom adapter is injected
- [ ] Offline fallback resolves complete `satelliteObservation`, `scientificInterpretation`, and `gameSimulationRule` records for all 7 Mission Days
- [ ] All 6 Specialists (`AlBaraa`, `Omar`, `Taha`, `Yassin`, `Sayed`, `Abd-Elrahman`) have rich Day 1–7 contextual dialogues and scientific glossary tooltips
