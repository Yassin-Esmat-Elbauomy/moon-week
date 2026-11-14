# 04: Procedural Pixel Art Renderer and Opening/Ending Cutscenes

**What to build:** Build `ProceduralPixelRenderer` with automatic `public/assets/` PNG override lookup (ADR-0003), generating crisp head-only space-helmet template portraits across all 7 expressions for all 6 Specialists, the animated 4-scene `OpeningCutscene` (including the 1.3s Earth-Moon radio wave), and the 4 animated `EndingCutscene` sequences (including kid-safe Automated Safe Abort).

**Blocked by:** 01: Project Scaffold and Domain Types, 02: Deterministic Simulation Engine and Schema-Validated Storage

**Status:** resolved

- [ ] Head-only helmet avatars render cleanly for all 6 Specialists × 7 expressions with zero broken images and instant PNG override support
- [ ] Opening Cutscene and all 4 Ending Cutscenes support `Next Scene`, `Pause`, `Skip Cutscene`, and `Replay Cutscene`
