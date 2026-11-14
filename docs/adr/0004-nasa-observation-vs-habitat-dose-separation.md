# Separation of NASA Satellite Observations from Internal Habitat Dose

Every NASA dataset record in `src/data/nasaVerifiedData.ts` (`NASA DONKI`, `NASA OSDR Veggie/PONDS`, `NASA LRO`) is structured into three distinct fields—`satelliteObservation`, `scientificInterpretation`, and `gameSimulationRule`—and rendered through `<NasaDataBadge />`.

## Consequences

- Prevents the scientific misconception that raw solar flare X-ray flux or satellite proton flux equals internal lunar habitat radiation dose, while grounding every daily trade-off in real historical NASA records with automatic offline fallback when `api.nasa.gov` is unreachable.
