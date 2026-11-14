# Moon Week — NASA Lunar Adventure

An educational 7-day lunar base simulation and interactive science adventure for ages 7–12, built with React, TypeScript, Tailwind CSS, HTML5 Canvas pixel art, and Web Audio procedural synthesis.

## Play Online

- **Live Game**: https://yassin-esmat-elbauomy.github.io/moon-week/

## Features

- **7-Day Connected Story**: Sequential daily chapters (`Sol 1`–`Sol 7`) where earlier engineering choices alter the base layout, crew reactions, midday obstacles, and ending paths.
- **Interactive NASA Science**: Plain-language mission briefings and 6 hands-on lunar physics simulations (landing thrust, microgravity capillary watering, solar dust/load balancing, X-class proton shielding, `CO2` scrubbing & circadian spectra, and Moon Rover crater exploration).
- **4 Alternative Endings**: *Scientific Breakthrough*, *Mission Accomplished*, *Critical Survival*, and *Safe Abort Rescue*, plus an interactive What-If Choice Simulator in the Mission Debrief.
- **Additional Info Library**: In-game guide covering astronaut spacesuit layers, essential lunar base systems, and real NASA mission datasets.

## Local Development

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — Start the local Vite dev server
- `npm run typecheck` — Run TypeScript type checking (`tsc --noEmit`)
- `npm test -- --run` — Run Vitest unit tests
- `npm run build` — Type-check and build the production bundle into `dist/`
