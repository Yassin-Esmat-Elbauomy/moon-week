# 01: Project Scaffold and Domain Types

**What to build:** Initialize the React 18 + TypeScript + Vite + Tailwind CSS project with `Fredoka` and `Nunito` fonts, Vitest configuration, and canonical TypeScript domain types matching `GLOSSARY.md` (`Mission Commander`, `Specialist`, `Primary Resource Meter`, `Sub-Resource Metric`, `Shift`, `Compounding Decision`, `Midday Anomaly`, `Comms Blackout`, `GameState`, `GameAction`, `JumpTarget`).

**Blocked by:** None (can start immediately)

**Status:** resolved

- [ ] `npm run typecheck` succeeds cleanly on strict TypeScript settings
- [ ] `vitest` executes cleanly as `npm test -- --run`
- [ ] All discriminated unions and domain interfaces encode illegal states out of existence without `any` or unsafe `as` casts
