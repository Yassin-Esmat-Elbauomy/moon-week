# 11: v2 Zero-Scroll Cockpit HUD, Interactive Map & Tutorial

**What to build:** Redesign `src/components/hud/TopHud.tsx`, `src/components/hud/ResourceDrawer.tsx`, `src/components/map/TopDownLunarBase.tsx`, and `src/components/narrative/TutorialSpotlight.tsx` (following `.agents/skills/game-ui-hud-ergonomics/SKILL.md` and `.agents/skills/game-dev-canvas-animation/SKILL.md`) into a clutter-free, zero-scroll 16:9 cockpit experience.

**Scope:** `src/components/hud/TopHud.tsx`, `src/components/hud/ResourceDrawer.tsx`, `src/components/map/TopDownLunarBase.tsx`, `src/components/narrative/TutorialSpotlight.tsx`

**Blocked by:** 09: v2 Procedural Chiptune Music Engine & Zero-Subtitle Kid-Friendly Copy, 10: v2 Widescreen 16:9 Pixel Art Engine & Animated Cutscenes

**Status:** resolved

- [x] `TopHud` fits in one compact floating top bar (`<= 56px` height) showing only `Day + Clock + Shift`, 4 Primary Resource Meters (`Power`, `Life Support`, `Shield`, `Crew Morale` — icon + short non-truncating label + `%`/bar with zero `sublabel` text), `Mute` toggle, and one `Menu` popover button housing `Sub-Resources`, `Crew Roster`, `Mission Log`, clickable `Earth Control` (even during Comms Blackout with glowing `LOS · BLACKOUT` badge), `Tutorial`, `Judge / Classroom Jump`, and `Reset`
- [x] `TopDownLunarBaseProps` accepts `isOverlayOpen?: boolean` (default `false`) to guard keyboard/pointer map controls and hide the floating Room Action Card/shortcut pills while overlays or drawers are open
- [x] `ResourceDrawer` opens as a compact dark NASA-slate floating overlay (`#0F172A`/`#1E293B`/`#F8FAFC`) displaying the 7 Sub-Resource Metrics and Specialist Fatigue without pushing viewport scroll
- [x] `TopDownLunarBase` renders the `1280×720` animated base canvas cleanly scaled to fill the stage without redundant Room Walk-To pill strips or oversized bottom room docks, remapping click/tap hit-testing accurately via `getBoundingClientRect()`
- [x] Commander & Specialist walking/idle loops run smoothly at 60fps in `requestAnimationFrame` with 4-frame walk cycles, regolith dust puffs, `'footstep'` cues, and one sleek floating on-canvas Room Action Card (`1–2` primary buttons) when standing near or clicking a room
- [x] `TutorialSpotlight` uses compact dark high-contrast floating bubbles (1–2 short kid-friendly lines per step, zero subtitles) positioned inside the `16:9` viewport without vertical scrolling
- [x] `npx tsc --noEmit` and `npx vitest run` pass cleanly with zero `as` casts
