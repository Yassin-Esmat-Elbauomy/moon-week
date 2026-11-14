---
name: game-ui-hud-ergonomics
description: Zero-scroll 16:9 desktop viewport layout, strict HUD clutter budget, zero-subtitles copy rules for ages 7-12, and high-contrast NASA-kid palette tokens. Use when modifying App shell, TopHud, ResourceDrawer, TutorialSpotlight, Narrative/Modal dialogs, DebriefScreen, mini-game overlays, or scenario/crew text.
---

# Game UI & HUD Ergonomics (Ages 7–12)

Keep MISSION CONTROL locked inside a crisp, zero-scroll 16:9 desktop cockpit with minimal on-screen chrome, instant readability for children aged 7–12, zero subtitles, and dark NASA-kid contrast.

## Zero-Scroll 16:9 Viewport Contract

- Lock the root app shell to **`h-screen w-screen overflow-hidden select-none`** with centered `16:9` stage framing (`aspect-video max-h-full max-w-full`).
- Fit every screen and overlay inside `1280×720`, `1366×768`, `1440×900`, and `1920×1080` desktop viewports with **zero document scrollbars** (`document.documentElement.scrollHeight <= window.innerHeight` and `scrollWidth <= window.innerWidth`).
- Never use `min-h-screen` page stacks that push headers, pills, and docks off the bottom fold; position compact HUD strips and contextual action cards cleanly **over** or tightly docked inside the 16:9 stage.
- Structure dense dialogs (`DecisionModal`, `DebriefScreen`, `AiAdvisorModal`, `CrewRosterModal`, `MissionLogModal`, mini-games) as **compact stepped tabs, cards, or 2-column horizontal cockpit layouts** capped within `max-h-[88vh]` rather than tall scrollable documents.

## Strict HUD Clutter Budget

- **Single Compact Top Bar (`<= 56px` height)**: Display only:
  1. `Day` + `Clock` + `Shift` pill
  2. The **4 Primary Resource Meters** (`Power`, `O2`, `Radiation Shielding`, `Crew Morale`) with icon + short label + clear `%` / bar
  3. Audio Mute toggle
  4. **One compact Menu popover button** (which expands `Sub-Resources Drawer`, `Crew Roster`, `Mission Log`, `Earth Uplink`, `Tutorial`, `Judge / Classroom Jump`, and `Reset`)
- **Zero Redundant Bars**: Remove extra quick-walk pill strips, verbose directive header banners above the map, and stacked bottom room-button grids. Let players walk directly on the cutaway base map and click a room or walk near it to pop open **1 sleek floating Room Action Card** (room icon + 1–2 direct actions like `Assign` / `Fix` / `Talk`).

## Zero-Subtitles & Age 7–12 Copy Budget

- **Strictly Zero Subtitles / Sublabels**: Remove all subtitle fields, card subheaders, meter sublabels, taglines, and explanatory secondary lines under titles (`"A Little Space Adventure..."`, meter hint strings, day subtitles, modal subtitles).
- **1–2 Short Lines Max**: Trim every briefing, crew greeting, tutorial bubble, decision choice description, and ending summary to **1–2 crisp, active-voice sentences** readable by ages 7–12.
- **Preserve Scientific & Domain Integrity (`GLOSSARY.md` + ADR-0004)**:
  - Use exact canonical terms (`Mission Commander`, `Specialist`, `Earth Mission Control Uplink`, `Primary Resource Meter`, `Sub-Resource Metric`, `Mission Day`, `Shift`, `Midday Anomaly`, `Comms Blackout`).
  - Keep `<NasaDataBadge />`'s 3 distinct boxes (**Observation**, **Meaning**, **Game Rule**) intact and crisp—1 punchy sentence per box, never merged.

## High-Contrast Dark NASA Cockpit Palette

Unify every cutscene, HUD bar, map card, mini-game console, and modal (including Debrief & Roster) under high-contrast dark surfaces—replace blinding `bg-white` / pale-slate sheets:

| Token | Hex | Use |
|---|---|---|
| Deep Space | `#0F172A` (`lunarNavy`) | Viewport backdrop & deep canvas frame |
| Panel Slate | `#1E293B` | HUD bars, modals, Room Action Card (`bg-slate-800/95` + subtle glowing border) |
| Crisp Chalk | `#F8FAFC` | Primary text (maintain `>= 4.5:1` contrast) |
| Sky Cyan | `#79C8E8` | Comms, water, active focus rings |
| Solar Yellow | `#FFD66B` | Power, highlights, primary CTAs on `#0F172A` text |
| Bio Mint | `#9BD8A7` | O2, hydroponics, safe confirmations |
| Cosmic Purple | `#A995E8` | Science, Earth Uplink, tutorial accents |
| Alert Coral | `#F87171` | Low resources, Midday Anomaly, Blackout warning |

Never use color alone for state—always pair status colors with clear icons and short words (`LOW`, `OK`, `LOCKED`). Every clickable element must be a native `<button>` or keyboard-focusable control with visible focus ring.

## Completion Checklist

- [ ] Zero document/window scrollbars across Opening Cutscene, Tutorial, Map, all 6 Mini-Games, all Modals, Ending Cutscene, and Debrief at `1280×720` and `1440×900`.
- [ ] Top HUD sits in a single compact row (`4 Primary Meters` + `Day/Shift` + `Mute` + `Menu` popover).
- [ ] Zero subtitles or sublabels appear anywhere in the DOM or data specs.
- [ ] Every text block fits in 1–2 short kid-friendly lines while honoring `GLOSSARY.md` and ADR-0004.
- [ ] All modals and mini-game panels use consistent `#0F172A` / `#1E293B` / `#F8FAFC` dark high-contrast cockpit styling.
