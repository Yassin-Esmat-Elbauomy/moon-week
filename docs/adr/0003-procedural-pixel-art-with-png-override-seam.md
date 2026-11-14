# Procedural Pixel Art Renderer with PNG Asset Override Seam

We render the 3/4 top-down cutaway lunar base, animated opening/ending cutscenes, and all 42 crew avatar states (6 specialists × 7 expressions in space helmets) procedurally via HTML5 Canvas and SVG (`src/assets/proceduralPixelArt.ts`), behind an asset resolution seam that automatically loads external `.png` overrides from `public/assets/` when present.

## Consequences

- Guarantees zero broken image icons out of the box while allowing real teammate portrait illustrations (`public/assets/avatars/<crewId>/<expression>.png`) to be dropped in at any time without changing component code.
