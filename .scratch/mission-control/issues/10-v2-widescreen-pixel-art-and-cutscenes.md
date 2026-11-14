# 10: v2 Widescreen 16:9 Pixel Art Engine & Animated Cutscenes

**What to build:** Upgrade `src/assets/proceduralPixelArt.ts` from `960×580`/`960×480` to crisp `1280×720` (16:9) 60fps Canvas 2D pixel art (following `.agents/skills/game-dev-canvas-animation/SKILL.md` and `game-engine`), and overhaul `src/components/cutscenes/OpeningCutscene.tsx` and `src/components/cutscenes/EndingCutscene.tsx` into zero-scroll full-viewport 16:9 animated cutscenes with zero subtitles and punchy 1–2 line captions.

**Scope:** `src/assets/proceduralPixelArt.ts`, `src/components/cutscenes/OpeningCutscene.tsx`, `src/components/cutscenes/EndingCutscene.tsx`

**Blocked by:** 09: v2 Procedural Chiptune Music Engine & Zero-Subtitle Kid-Friendly Copy

**Status:** resolved

- [x] Primary base map renderer and cutscene canvases run at native `1280×720` (16:9) with `ctx.imageSmoothingEnabled = false` and crisp CSS `.pixelated` scaling (`w-full h-full object-contain`)
- [x] `ProceduralPixelRenderer` drives continuous 60fps delta-time animations (`walk` 4-frame stride cycle with head bob and fading regolith dust puffs, blinking/breathing head-only helmet portraits, parallax starfields, rotating Earth limb with atmosphere glow, solar plasma storm waves, spinning S-Band radar sweeps, and pulsing hydroponic grow-lights/water lines)
- [x] All 42 head-only Specialist helmet portraits (`6 Specialists × 7 expressions`) keep ADR-0003 `public/assets/avatars/<crewId>/<expression>.png` override lookup intact
- [x] `OpeningCutscene` and all 4 `EndingCutscene` paths fill an `h-screen w-screen overflow-hidden` 16:9 stage with sleek floating playback controls (`Next`, `Pause`, `Skip`, `Replay`), `'cutscene'` music integration, rocket/radio/celebration SFX, zero subtitles, and 1–2 crisp lines per beat
- [x] Zero `as` casts or per-frame React `setState` leaks; `npx tsc --noEmit` and `npx vitest run` pass cleanly
