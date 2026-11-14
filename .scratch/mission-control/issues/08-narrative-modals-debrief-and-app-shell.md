# 08: Narrative Modals, Earth Control Uplink UI, Debrief Time Machine, and App Shell

**What to build:** Build `DialoguePanel` (with scientific tooltips and 1.3s/2.6s Earth light-time wave), `DecisionModal` (with `<NasaDataBadge />` and Active vs Capillary visualizer), `CrewRosterModal`, `MissionLogModal`, `AiAdvisorModal` (Earth Mission Control Uplink + Day 7 blackout static screen), `DebriefScreen` (Replay Ending Cutscene, Day 1–7 causal timeline, Interactive "What-If" Decision Time Machine, NASA Traceability Report), and wire everything together in `App.tsx`.

**Blocked by:** 03: NASA Verified Data, Scenarios, Earth Control Uplink, and Sound Engine, 04: Procedural Pixel Art Renderer and Opening/Ending Cutscenes, 05: Top HUD, Resource Drawer, and Interactive Spotlight Tutorial, 06: Interactive 3/4 Top-Down Cutaway Lunar Base Map, 07: Six Playable 2D Station Mini-Games and Midday Anomalies

**Status:** resolved

- [ ] Every visible button, modal, shift action, and tutorial step works end-to-end with zero dead UI
- [ ] Earth Mission Control Uplink renders 2.6s round-trip animation on Days 1–6 and locks out with `COMMS_BLACKOUT_ACTIVE` static screen on Day 7 Part B & C
- [ ] Debrief "What-If" Decision Time Machine recalculates Day 1–7 trajectories and endings live
- [ ] Full `vitest`, `tsc --noEmit`, `vite build`, and live browser checks pass cleanly
