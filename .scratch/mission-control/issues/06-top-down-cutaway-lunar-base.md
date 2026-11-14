# 06: Interactive 3/4 Top-Down Cutaway Lunar Base Map

**What to build:** Build `TopDownLunarBase.tsx` (`960×580` canvas with 8 interior cutaway rooms + 2 exterior South Pole surface zones), supporting both `WASD`/Arrow walking and 1-click room/Specialist pathfinding, Morning Shift crew duty assignment (`Work` vs `Rest`), Midday Anomaly warning beacons, and real-time pixel visual mutations for landing site, farming mode (`active_pumps` vs `capillary_ponds` vs `activePumpsStalled`), low power amber lights, Day 4 solar storm shutters, Day 6 Rover deployment, and Day 7 static screens.

**Blocked by:** 02: Deterministic Simulation Engine and Schema-Validated Storage, 04: Procedural Pixel Art Renderer and Opening/Ending Cutscenes, 05: Top HUD, Resource Drawer, and Interactive Spotlight Tutorial

**Status:** resolved

- [ ] Mission Commander moves smoothly via `WASD`/Arrow keys and 1-click destination walking
- [ ] All 8 interior rooms and 5 on-base Specialists are clickable and show live status/expression cues
- [ ] Engineering decisions visibly transform the cutaway base in real time
