# 12: v2 Mini-Games Visual, Audio & Zero-Scroll Polish

**What to build:** Upgrade all 6 interactive mini-games (`LunarLanderGame.tsx`, `GreenhouseMiniGame.tsx`, `PowerGridMiniGame.tsx`, `RadiationMiniGame.tsx`, `MedbayMiniGame.tsx`, `RoverSurfaceMiniGame.tsx`) to fit cleanly inside a zero-scroll `16:9` dark NASA cockpit overlay (`#0F172A`/`#1E293B`/`#F8FAFC`), remove subtitles/walls of text, upgrade canvases to crisp 60fps pixel-art animation, and wire rich tactile SFX cues.

**Scope:** `src/components/minigames/LunarLanderGame.tsx`, `src/components/minigames/GreenhouseMiniGame.tsx`, `src/components/minigames/PowerGridMiniGame.tsx`, `src/components/minigames/RadiationMiniGame.tsx`, `src/components/minigames/MedbayMiniGame.tsx`, `src/components/minigames/RoverSurfaceMiniGame.tsx`

**Blocked by:** 09: v2 Procedural Chiptune Music Engine & Zero-Subtitle Kid-Friendly Copy

**Status:** resolved

- [x] Every mini-game replaces bright `bg-white`/`bg-slate-50` blocks with cohesive dark NASA-kid cockpit surfaces (`#0F172A`, `#1E293B`, `#F8FAFC`, `#79C8E8`, `#FFD66B`, `#9BD8A7`, `#A995E8`, `#F87171`) and fits inside `max-h-[90vh]` on `1280×720` and `1440×900` screens with zero page scrolling
- [x] Mini-game headers, goals, and result banners eliminate all subtitles and condense prompts to 1–2 short kid-friendly lines while preserving all gameplay mechanics, Auto-Assist/Manual Override paths, and NASA tooltips
- [x] Canvas-backed mini-games (`LunarLanderGame`, `RadiationMiniGame`, `RoverSurfaceMiniGame`) plus animated visual panels in `GreenhouseMiniGame`, `PowerGridMiniGame`, and `MedbayMiniGame` run smoothly at 60fps (`imageSmoothingEnabled = false`, responsive thruster flames, electrostatic sparks, capillary shimmer, solar storm waves, pulse waveforms, crater ice glint, and rover dust trails)
- [x] Actions trigger matching varied SFX (`thruster`, `dust_sweep`, `water_flow`, `bubble`, `radar_ping`, `alarm`, `confirm`, `success`)
- [x] Zero `as` casts or per-frame `setState` bottlenecks introduced; `npx tsc --noEmit` and `npx vitest run` pass cleanly
