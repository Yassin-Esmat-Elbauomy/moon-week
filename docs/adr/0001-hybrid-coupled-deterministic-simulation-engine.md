# Hybrid Coupled Deterministic Simulation Engine

We model the four Primary Resource Meters (`lifeSupport`, `power`, `shielding`, `crewReadiness`) and seven Sub-Resource Metrics as explicit state fields governed by a pure, deterministic reducer (`src/simulation/engine.ts`) with a 4-step Start-of-Day tick and post-action invariants, rather than pure derived averages or uncoupled flat numbers.

## Considered Options

- **Strictly Derived Composites**: Computing `lifeSupport` and `crewReadiness` purely as averages of their sub-resources makes it impossible to apply the exact per-choice delta tables in `Main Prompt.md` Section 8 where events specify distinct immediate deltas to both levels simultaneously.
- **Uncoupled Flat Meters**: Treating Primary and Sub-Resource meters as completely independent causes the Top HUD and Resource Drawer to drift out of sync when specialists accumulate fatigue during Morning Shifts or when water/food reserves run critically low.
- **Hybrid Coupled State with Post-Action Invariants (Chosen)**: Respects exact scripted deltas on Evening Decisions without double-counting, couples Morning Shift specialist fatigue and Start-of-Day sub-resource scarcity cliffs (`< 30` water/food, `< 50` health, `> 65` fatigue) into Primary Meters, and evaluates `activePumpsStalled` (`power < 25`) and `MISSION_FAILURE` (`any primary <= 0`) after every state transition.

## Consequences

- `src/simulation/engine.ts` has zero UI, DOM, or AI dependencies and can replay any `DecisionRecord[]` sequence deterministically to power both the `"Judge / Classroom Jump"` state synthesizer and the Debrief Screen's interactive `"What-If" Decision Time Machine`.
