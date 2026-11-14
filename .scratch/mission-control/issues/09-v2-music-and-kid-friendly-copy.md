# 09: v2 Procedural Chiptune Music Engine & Zero-Subtitle Kid-Friendly Copy

**What to build:** Upgrade `src/services/soundEngine.ts` into a full multi-voice Web Audio API lookahead sequencer (following `.agents/skills/web-audio-chiptune-music/SKILL.md` and `audio-design`) plus varied tactile SFX cues, and streamline `src/types/game.ts`, `src/data/dailyScenarios.ts`, and `src/data/crewProfiles.ts` to remove all subtitles and tighten copy to 1–2 crisp kid-friendly sentences (ages 7–12) while keeping `GLOSSARY.md` terms and NASA data intact.

**Scope:** `src/services/soundEngine.ts`, `src/services/soundEngine.test.ts`, `src/data/dailyScenarios.ts`, `src/data/crewProfiles.ts`, `src/types/game.ts` (plus updating any stale `.subtitle` reference in `src/components/narrative/DecisionModal.tsx` so `tsc --noEmit` stays green).

**Blocked by:** None

**Status:** resolved

- [x] `SoundEngine` routes dedicated `musicGain` and `sfxGain` buses into a `DynamicsCompressorNode` safety limiter before `masterGain` -> `destination`
- [x] Lookahead 16th-step scheduler (`audioCtx.currentTime`) plays 3 distinct kid-friendly multi-voice themes (`exploration`, `crisis`, `cutscene` with bass, arpeggio lead, soft pad, and light pulse percussion) and switches cleanly without overlapping timers or clicks
- [x] Global first-gesture `AudioContext` unlock (`pointerdown`/`keydown`) starts active music automatically on interaction, `setMuted` ramps cleanly via `setTargetAtTime`, and offline/Node headless checks never throw
- [x] Varied tactile SFX cues (`click`, `confirm`, `footstep`, `dust_sweep`, `thruster`, `water_flow`, `bubble`, `radar_ping`, `alarm`, `static_burst`, `success`, `abort`) apply subtle pitch variation on repeated actions to avoid robotic fatigue
- [x] `DailyScenarioSpec` and `StageCrisisSpec` (`src/types/game.ts`, `src/data/dailyScenarios.ts`) remove `subtitle` completely, and all briefings, options, and `src/data/crewProfiles.ts` greetings/advice read cleanly in 1–2 short active sentences for ages 7–12 using canonical `GLOSSARY.md` terms
- [x] Zero `as` casts or `console.log` statements introduced; `npx tsc --noEmit` and `npx vitest run` (including `src/services/soundEngine.test.ts` behavior tests) pass cleanly
