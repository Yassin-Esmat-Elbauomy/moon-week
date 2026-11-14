# Diegetic Earth Mission Control Uplink and Service-Level Blackout

We frame the mission advisory system diegetically as the **Earth Mission Control Uplink** manned by Communications Officer Abd-Elrahman Ahmad (with a 1.3s one-way / 2.6s round-trip light-time delay) and enforce the Day 7 blackout via a hard service-level exception (`COMMS_BLACKOUT_ACTIVE`) inside `src/services/aiAdvisor.ts`.

## Consequences

- On Days 1–6, querying the advisor teaches the physics of Earth-Moon radio propagation (`2.6s` round-trip delay) and works offline via a deterministic local telemetry adapter (`LocalEarthControlTelemetryAdapter`) with an optional live LLM adapter.
- On Day 7 Part B & C (`day === 7 && commsBlackout === true`), `aiAdvisor.ts` throws `COMMS_BLACKOUT_ACTIVE` before any local or network advisory code can execute, ensuring the blackout is a genuine architectural guarantee rather than a cosmetic UI toggle.
