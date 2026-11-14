---
name: web-audio-chiptune-music
description: Zero-dependency Web Audio API lookahead chiptune and synthwave music sequencer, ADSR envelopes, master safety compressor/limiter, first-gesture AudioContext unlock, and varied tactile SFX cues. Use when building or upgrading src/services/soundEngine.ts or wiring music and sound effects across cutscenes, map gameplay, and mini-games.
---

# Web Audio Procedural Chiptune & SFX

Deliver expressive, kid-friendly chiptune/synthwave background music and crisp tactile sound effects using only the browser Web Audio API—zero external audio assets, zero clipping, and zero crashes in offline or Vitest Node environments.

## Audio Bus Graph & Headroom Safety

Route all synthesis into clean gain buses feeding a safety compressor before `audioCtx.destination`:

```text
[Music Voices: Bass, Lead, Pad, Soft Perc] --> musicGain --\
                                                            +--> DynamicsCompressorNode --> masterGain --> destination
[SFX One-Shots: UI, Gameplay, Alerts]     --> sfxGain   --/
```

- Configure the compressor as a gentle protective ceiling (`threshold = -18`, `knee = 16`, `ratio = 4`, `attack = 0.005`, `release = 0.18`) so stacked chords + alarms never clip.
- Keep `musicGain` balanced cleanly underneath SFX (`~0.24` vs `sfxGain ~0.55`) so footsteps, pings, and alerts remain crystal clear.
- Ramp gain changes smoothly (`gain.setTargetAtTime(target, ctx.currentTime, 0.025)`) on mute toggles and track transitions—never snap gain abruptly from `0` to `1` or back without smoothing.

## First-Gesture Unlock & Environment Guard

- Guard browser globals (`typeof window === 'undefined'` or missing `AudioContext` / `webkitAudioContext`) so server builds and Vitest Node runs never throw.
- Lazily instantiate the singleton `AudioContext`, register lightweight one-time global unlock listeners (`pointerdown`, `keydown`) calling `ctx.resume()`, and auto-start the queued ambient track as soon as the browser unlocks audio.
- Never allow multiple overlapping sequencer `setInterval` timers on rapid track changes—track one active timer ID and clear/reset cleanly before starting a new track.

## Lookahead 16th-Note Music Sequencer

Never schedule Web Audio oscillators directly from JS timer firing times (`setInterval` jitters noticeably). Instead:

- Tick a `25ms` lookahead scheduler loop with `scheduleAheadTime = 0.12` seconds.
- Advance `nextNoteTime` strictly in musical `audioCtx.currentTime` increments (`stepSec = (60 / bpm) / 4`), scheduling every note inside `[ctx.currentTime, ctx.currentTime + scheduleAheadTime]` using exact `startTime` arguments.
- Clamp `nextNoteTime` cleanly (`if (nextNoteTime < ctx.currentTime - 0.15) nextNoteTime = ctx.currentTime + 0.02`) if the tab was backgrounded.

## Distinct Kid-Friendly Lunar Themes

Compose 16–32 step looping patterns across 3 musical tracks matching MISSION CONTROL's state:

1. **`exploration` / `ambient`** (`~100–106 BPM`): Bright, curious space-station synthwave in C Major / Lydian — warm triangle bassline, bubbly square/sine arpeggio lead (soft low-pass filter sweep), and sustained quiet pad chords.
2. **`crisis` / `storm`** (`~124–128 BPM`): Urgent yet fun arcade tension in A Minor — driving 8th-note pulse bass, brisk alarm-tinted arpeggio, subtle filtered noise shaker for solar storms, Midday Anomalies, and Day 7 Blackout.
3. **`cutscene` / `victory`** (`~92 BPM`): Uplifting heroic fanfare progression — wide fifth intervals, bright shimmer arpeggios, warm brass-filtered saw pad for Opening Cutscene and successful Ending Cutscene.

## ADSR Envelopes & Anti-Fatigue Tactile SFX

- Shape every note and SFX node cleanly (`attack` `0.005–0.04s`, `decay`, `sustain`, exponential/linear release ending slightly above `0.0001`), calling `osc.stop(end + 0.02)` and `onended` disconnect so nodes never leak.
- **Anti-repetition variation**: Apply subtle pitch randomization (`* (0.97 + Math.random() * 0.06)`) on frequent cues (`footstep`, `hover`, `bubble`, `dust_sweep`) so rapid play sounds lively instead of robotic.
- Support rich domain cues beyond basic clicks: `click`, `confirm`, `footstep`, `dust_sweep`, `thruster`, `water_flow`, `bubble`, `radar_ping`, `alarm`, `static_burst`, `success`, `abort`.

## Completion Checklist

- [ ] `soundEngine` builds and runs silently without throwing in Node/Vitest environments lacking `AudioContext`.
- [ ] First click or keypress anywhere in the app unlocks `AudioContext` and begins the active music track smoothly.
- [ ] Lookahead sequencer drives multi-voice `exploration`, `crisis`, and `cutscene` themes without timer leaks or drift.
- [ ] `DynamicsCompressorNode` + `setTargetAtTime` envelopes eliminate clicks, pops, and clipping across overlapping cues.
- [ ] All interactive controls, walking steps, and mini-game actions play appropriate tactile SFX and obey `Mute`.
