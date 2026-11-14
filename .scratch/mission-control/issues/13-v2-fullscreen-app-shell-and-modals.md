# 13: v2 Full-Screen 16:9 App Shell, Dark Cockpit Modals & Zero-Scroll Debrief

**What to build:** Lock `src/App.tsx` and `src/index.css` into a zero-scroll 16:9 desktop viewport (`h-screen w-screen overflow-hidden`), remove redundant directive banners above the canvas, wire adaptive background music tracks + global first-gesture audio unlock, and overhaul `DialoguePanel.tsx`, `DecisionModal.tsx`, `AiAdvisorModal.tsx`, `CrewRosterModal.tsx`, `MissionLogModal.tsx`, and `DebriefScreen.tsx` onto high-contrast dark NASA-kid panels with zero subtitles and compact 1–2 line copy.

**Scope:** `src/App.tsx`, `src/index.css`, `src/components/narrative/DialoguePanel.tsx`, `src/components/narrative/DecisionModal.tsx`, `src/components/modals/AiAdvisorModal.tsx`, `src/components/modals/CrewRosterModal.tsx`, `src/components/modals/MissionLogModal.tsx`, `src/components/modals/DebriefScreen.tsx`

**Blocked by:** 09: v2 Procedural Chiptune Music Engine & Zero-Subtitle Kid-Friendly Copy, 10: v2 Widescreen 16:9 Pixel Art Engine & Animated Cutscenes, 11: v2 Zero-Scroll Cockpit HUD, Interactive Map & Tutorial, 12: v2 Mini-Games Visual, Audio & Zero-Scroll Polish

**Status:** resolved

- [x] Root container in `App.tsx` and `index.css` locks every stage (`opening_cutscene`, `playing`, `ending_cutscene`, `debrief`, plus all modals and mini-games) to `h-screen w-screen overflow-hidden` with centered 16:9 stage framing and zero document scrollbars at `1280×720`, `1366×768`, `1440×900`, and `1920×1080`
- [x] `App.tsx` removes the bulky directive banner above the map, switches procedural music automatically (`cutscene` for intro/ending, `crisis` during Day 4/Day 7 Blackout/Midday Anomaly/low primary meter alerts, `exploration` otherwise), and attaches first-gesture `AudioContext` unlock
- [x] `DialoguePanel` and `DecisionModal` remove all subtitles, tighten copy to 1–2 punchy kid-friendly lines, preserve `<NasaDataBadge />` 3-part ADR-0004 attribution (`Observation` / `Meaning` / `Game Rule`) + Active vs Capillary visualizer on dark `#1E293B`/`#F8FAFC` surfaces, and fit comfortably without scrolling
- [x] `DebriefScreen` converts from a tall scrolling `min-h-screen` `bg-white` page into a crisp dark `#0F172A`/`#1E293B` zero-scroll tabbed 16:9 cockpit (`Overview`, `Day 1–7 Chain`, `"What-If" Time Machine`) with zero subtitles and live trajectory recalculation
- [x] `AiAdvisorModal`, `CrewRosterModal`, and `MissionLogModal` match the dark high-contrast palette, fit cleanly inside `max-h-[86vh]`, preserve `COMMS_BLACKOUT_ACTIVE` static screen on Day 7 Part B & C, and pass all `vitest`, `tsc --noEmit`, `npm run build`, and live Playwright viewport/scroll verification checks
