---
name: game-dev-canvas-animation
description: 60fps HTML5 Canvas 2D pixel-art animation, sprite state machines, 4-frame walk cycles, particle systems, living cutscenes, and crisp 1280x720 16:9 viewport scaling. Use when updating or building TopDownLunarBase, proceduralPixelArt, OpeningCutscene, EndingCutscene, or mini-game canvases.
---

# Game-Dev Canvas & Pixel-Art Animation

Build smooth, expressive 60fps 2D pixel-art scenes in HTML5 Canvas inside a locked `1280×720` (16:9) viewport without sacrificing crisp pixels, frame pacing, or React responsiveness.

## Canvas Resolution & Crisp Scaling

- Target a logical internal canvas buffer of **`1280×720`** (16:9 widescreen) for primary maps, cutscenes, and hero mini-game canvases.
- Disable anti-aliasing on every frame context before drawing sprites (`ctx.imageSmoothingEnabled = false`) and apply CSS `image-rendering: pixelated;` (`.pixelated`) on the `<canvas>`.
- Fit the `<canvas>` cleanly inside the zero-scroll container using `w-full h-full object-contain` (or an `aspect-video` stage constrained by `max-h-full max-w-full`).
- Map pointer events (`click`, `pointermove`) from CSS pixels back to logical canvas coordinates with `getBoundingClientRect()`:

```ts
const rect = canvas.getBoundingClientRect();
const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
```

## 60fps Loop Architecture Off React State

- Drive rendering with `requestAnimationFrame` and a clamped delta time:
  `const dt = Math.min((now - lastTime) / 1000, 0.05);`
- Store continuous animation state (avatar coordinates, velocity, walk phase, particle pools, star offsets, blink timers, camera shake) in mutable refs or plain engine objects—never call React `setState` every animation frame.
- Trigger React state updates only on discrete events (entering/leaving a room hitbox, changing cutscene beat, ending a mini-game, or throttled HUD readouts at `<= 10 Hz`).
- Always return a cleanup function that cancels `requestAnimationFrame` and detaches keyboard/pointer listeners.

## Sprite State Machine & 4-Frame Walk Cycle

Model animated crew sprites with explicit state (`'idle' | 'walk' | 'work' | 'rest' | 'alert'`) and facing (`'down' | 'up' | 'left' | 'right'`), handling union switches exhaustively with `never`.

- **4-frame walk cycle**: Advance `walkPhase += speed * dt` while moving and map `Math.floor(walkPhase) % 4` cleanly to `0` (left foot forward + `-1px` bob), `1` (passing neutral), `2` (right foot forward + `-1px` bob), `3` (passing neutral). Snap `walkPhase = 0` when velocity reaches zero.
- **Dust puffs**: Emit small pale-regolith pixel puffs (`alpha` fading `0.65 -> 0`, drifting upward/back `0.35s`) when stepping on exterior regolith or sprint transitions; reuse/cap particle arrays (`max 64`) so GC stays quiet.
- **Idle life**: Give stationary portraits and on-map specialists independent randomized blink timers (`2.5s–5.5s` interval, `110ms` blink) and subtle `1px` breathing bob (`Math.sin(t * 2.2)`) so scenes never look frozen.

## Living Cutscenes & Base Atmosphere

Keep every primary canvas alive with subtle multi-layer motion anchored to `1280×720`:

- **Parallax starfields**: 3 depth layers scrolling/twinkling at different speeds.
- **Rotating Earth limb**: Slowly drifting cloud/continent bands plus soft cyan atmospheric rim halo.
- **Dynamic machinery**: Spinning radar dish sweeps, pulsing hydroponic water lines and grow-lamp glow, drifting dust motes, rover wheel tread ticks, and oscillating solar plasma waves during solar storm or alert states.
- **Audio-visual sync**: Emit throttled cue triggers (`footstep` on stride frames `0` and `2`, `thruster` burst particles on flame active, `water_flow` shimmer on valve open).

## PNG Override Seam Compatibility (ADR-0003)

- Keep `public/assets/avatars/<crewId>/<expression>.png` image override lookup intact for all 6 Specialists × 7 expressions (`neutral`, `happy`, `worried`, `alert`, `tired`, `scientist`, `helmet`).
- Apply subtle CSS/Canvas breathing and blink-overlay accents consistently whether rendering the procedural Canvas helmet head or a PNG override, keeping head-only helmet framing intact.

## Completion Checklist

- [ ] Primary map, cutscene, and hero mini-game canvases run at `1280×720` (16:9) with `imageSmoothingEnabled = false`.
- [ ] `requestAnimationFrame` loops clamp `dt`, avoid per-frame React `setState`, and cancel cleanly on unmount.
- [ ] Pointer click/drag hit-testing scales accurately across window resizes via `getBoundingClientRect()`.
- [ ] Walking, portraits, machinery, stars, Earth limb, and plasma hazards animate continuously at 60fps.
- [ ] Zero `as` type casts; exhaustive `never` checks on sprite/animation enums; existing avatar override tests/paths stay green.
