export type SoundCueId =
  | 'click'
  | 'confirm'
  | 'footstep'
  | 'dust_sweep'
  | 'thruster'
  | 'water_flow'
  | 'bubble'
  | 'radar_ping'
  | 'radio_ping'
  | 'alarm'
  | 'alert'
  | 'static_burst'
  | 'success'
  | 'abort'
  | 'hover'
  | 'ui_click'
  | 'meter_up'
  | 'meter_down'
  | 'alarm_cme'
  | 'comms_static'
  | 'victory_fanfare'
  | 'solar_flare'
  | 'power_overload'
  | 'frost_freeze'
  | 'shutter_lock'
  | 'co2_hiss'
  | 'choice_impact'
  | 'crew_cheer'
  | 'crew_shiver';

export type CanonicalTrackId = 'exploration' | 'crisis' | 'cutscene' | 'silence';

export type AmbientTrackId =
  | CanonicalTrackId
  | 'lunar_hum'
  | 'solar_storm';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface AudioGraph {
  ctx: AudioContext;
  musicGain: GainNode;
  sfxGain: GainNode;
  compressor: DynamicsCompressorNode;
  masterGain: GainNode;
}

interface TrackPattern {
  bpm: number;
  bass: ReadonlyArray<number | null>;
  lead: ReadonlyArray<number | null>;
  leadType: OscillatorType;
  leadFilterHz: number;
  bassType: OscillatorType;
  bassFilterHz: number;
  padChords: Readonly<Record<number, readonly number[]>>;
  padSteps: number;
  padType: OscillatorType;
  padFilterHz: number;
  kickSteps: ReadonlySet<number>;
  hatSteps: ReadonlySet<number>;
}

const DEFAULT_MUSIC_GAIN = 0.32;
const DEFAULT_SFX_GAIN = 0.55;
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SEC = 0.12;
const MUTE_RAMP_TIME_CONSTANT_SEC = 0.025;
const PATTERN_STEPS = 32;

const EXPLORATION_PATTERN: TrackPattern = {
  bpm: 98,
  bass: [
    48, null, 48, null, 55, null, 48, null,
    50, null, 50, null, 57, null, 50, null,
    45, null, 45, null, 52, null, 45, null,
    41, null, 41, null, 48, null, 43, null,
  ],
  lead: [
    72, null, 76, 79, null, 83, 79, null,
    74, null, 78, 81, null, 79, 76, null,
    69, null, 72, 76, null, 79, 76, null,
    65, null, 69, 72, null, 74, 76, null,
  ],
  leadType: 'square',
  leadFilterHz: 1450,
  bassType: 'triangle',
  bassFilterHz: 420,
  padChords: {
    0: [60, 64, 67],
    8: [62, 66, 69],
    16: [57, 60, 64],
    24: [53, 57, 60],
  },
  padSteps: 8,
  padType: 'sine',
  padFilterHz: 950,
  kickSteps: new Set([0, 8, 16, 24]),
  hatSteps: new Set([4, 12, 20, 28]),
};

const CRISIS_PATTERN: TrackPattern = {
  bpm: 128,
  bass: [
    45, null, 45, 45, 45, null, 45, null,
    41, null, 41, 41, 41, null, 41, null,
    43, null, 43, 43, 43, null, 43, null,
    40, null, 40, 43, 40, null, 43, null,
  ],
  lead: [
    69, 72, 76, 81, 76, 72, 69, 76,
    65, 69, 72, 77, 72, 69, 65, 72,
    67, 71, 74, 79, 74, 71, 67, 74,
    64, 68, 71, 76, 71, 68, 64, 71,
  ],
  leadType: 'square',
  leadFilterHz: 1750,
  bassType: 'sawtooth',
  bassFilterHz: 520,
  padChords: {
    0: [57, 60, 64],
    8: [53, 57, 60],
    16: [55, 59, 62],
    24: [52, 56, 59],
  },
  padSteps: 8,
  padType: 'triangle',
  padFilterHz: 850,
  kickSteps: new Set([0, 4, 8, 12, 16, 20, 24, 28]),
  hatSteps: new Set([2, 6, 10, 14, 18, 22, 26, 30]),
};

const CUTSCENE_PATTERN: TrackPattern = {
  bpm: 110,
  bass: [
    48, null, null, null, 48, null, 55, null,
    43, null, null, null, 43, null, 50, null,
    41, null, null, null, 41, null, 48, null,
    43, null, null, null, 50, null, 55, null,
  ],
  lead: [
    72, null, null, 79, null, null, 77, null,
    76, null, 74, null, 76, null, 79, null,
    81, null, null, 79, null, null, 76, null,
    72, null, 74, null, 79, null, null, null,
  ],
  leadType: 'triangle',
  leadFilterHz: 2100,
  bassType: 'triangle',
  bassFilterHz: 460,
  padChords: {
    0: [60, 64, 67],
    8: [55, 59, 62],
    16: [53, 57, 60],
    24: [55, 59, 62],
  },
  padSteps: 8,
  padType: 'sawtooth',
  padFilterHz: 880,
  kickSteps: new Set([0, 8, 16, 24]),
  hatSteps: new Set([4, 12, 20, 28]),
};

let muted = false;
let currentTrack: CanonicalTrackId = 'silence';
let desiredTrack: Exclude<CanonicalTrackId, 'silence'> | null = null;
let hasGestureUnlock = false;
let audioGraph: AudioGraph | null = null;
let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let currentStep = 0;
let nextNoteTime = 0;
let lastThrusterMs = -1000;
let unlockListenersAttached = false;
const activeMusicVoices = new Set<() => void>();

function normalizeTrackId(track: AmbientTrackId): CanonicalTrackId {
  switch (track) {
    case 'lunar_hum':
    case 'exploration':
      return 'exploration';
    case 'solar_storm':
    case 'crisis':
      return 'crisis';
    case 'cutscene':
      return 'cutscene';
    case 'silence':
      return 'silence';
    default: {
      const _exhaustive: never = track;
      return _exhaustive;
    }
  }
}

function getTrackPattern(track: Exclude<CanonicalTrackId, 'silence'>): TrackPattern {
  switch (track) {
    case 'exploration':
      return EXPLORATION_PATTERN;
    case 'crisis':
      return CRISIS_PATTERN;
    case 'cutscene':
      return CUTSCENE_PATTERN;
    default: {
      const _exhaustive: never = track;
      return _exhaustive;
    }
  }
}

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function varyPitch(baseHz: number, spread = 0.06): number {
  return baseHz * (1 - spread / 2 + Math.random() * spread);
}

function getAudioContextConstructor(): (typeof AudioContext) | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (typeof window.AudioContext === 'function') {
    return window.AudioContext;
  }
  if (typeof window.webkitAudioContext === 'function') {
    return window.webkitAudioContext;
  }
  return null;
}

const UNLOCK_EVENTS: readonly ('pointerdown' | 'click' | 'touchstart' | 'keydown')[] = [
  'pointerdown',
  'click',
  'touchstart',
  'keydown',
];

function hasBrowserUserActivation(): boolean {
  if (typeof navigator === 'undefined' || !('userActivation' in navigator)) {
    return false;
  }
  const activation = navigator.userActivation;
  return Boolean(activation && (activation.isActive || activation.hasBeenActive));
}

function handleGestureUnlock(): void {
  unlock();
}

function attachUnlockListeners(): void {
  if (unlockListenersAttached || typeof window === 'undefined') {
    return;
  }
  if (typeof window.addEventListener !== 'function') {
    return;
  }
  for (const eventName of UNLOCK_EVENTS) {
    window.addEventListener(eventName, handleGestureUnlock, {
      capture: true,
      passive: true,
    });
  }
  unlockListenersAttached = true;
}

function detachUnlockListeners(): void {
  if (!unlockListenersAttached || typeof window === 'undefined') {
    return;
  }
  if (typeof window.removeEventListener === 'function') {
    for (const eventName of UNLOCK_EVENTS) {
      window.removeEventListener(eventName, handleGestureUnlock, { capture: true });
    }
  }
  unlockListenersAttached = false;
}

function ensureAudioGraph(): AudioGraph | null {
  if (audioGraph) {
    return audioGraph;
  }
  const Ctor = getAudioContextConstructor();
  if (!Ctor) {
    return null;
  }

  try {
    const ctx = new Ctor();
    const musicGain = ctx.createGain();
    const sfxGain = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    const masterGain = ctx.createGain();

    musicGain.gain.value = DEFAULT_MUSIC_GAIN;
    sfxGain.gain.value = DEFAULT_SFX_GAIN;
    masterGain.gain.value = muted ? 0 : 1;

    compressor.threshold.value = -18;
    compressor.knee.value = 16;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.18;

    musicGain.connect(compressor);
    sfxGain.connect(compressor);
    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    audioGraph = {
      ctx,
      musicGain,
      sfxGain,
      compressor,
      masterGain,
    };
    return audioGraph;
  } catch {
    return null;
  }
}

function stopActiveMusicVoices(ctx: AudioContext): void {
  const stopCallbacks = Array.from(activeMusicVoices);
  activeMusicVoices.clear();
  for (const stopVoice of stopCallbacks) {
    try {
      stopVoice();
    } catch {
      // Ignore already stopped voice nodes
    }
  }
  void ctx;
}

function clearScheduler(): void {
  if (schedulerTimer !== null) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  if (audioGraph) {
    stopActiveMusicVoices(audioGraph.ctx);
  }
}

interface MusicNoteOptions {
  graph: AudioGraph;
  freq: number;
  startTime: number;
  durationSec: number;
  type: OscillatorType;
  peakGain: number;
  attackSec: number;
  sustainRatio: number;
  filterHz: number;
}

function scheduleMusicVoice(opts: MusicNoteOptions): void {
  const {
    graph,
    freq,
    startTime,
    durationSec,
    type,
    peakGain,
    attackSec,
    sustainRatio,
    filterHz,
  } = opts;
  const { ctx, musicGain } = graph;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, freq), startTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterHz, startTime);

  const safeAttack = Math.min(attackSec, durationSec * 0.45);
  const decayEnd = Math.min(durationSec * 0.75, safeAttack + 0.07);
  const sustainGain = Math.max(0.0001, peakGain * sustainRatio);
  const endTime = startTime + durationSec;

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + safeAttack);
  gain.gain.exponentialRampToValueAtTime(sustainGain, startTime + decayEnd);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(musicGain);

  const cleanup = () => {
    activeMusicVoices.delete(forceStop);
    try {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    } catch {
      // Ignore already disconnected nodes
    }
  };

  const forceStop = () => {
    activeMusicVoices.delete(forceStop);
    try {
      const now = ctx.currentTime;
      gain.gain.setTargetAtTime(0.0001, now, 0.012);
      osc.stop(now + 0.03);
    } catch {
      // Ignore already stopped oscillator
    }
  };

  activeMusicVoices.add(forceStop);
  osc.onended = cleanup;
  osc.start(startTime);
  osc.stop(endTime + 0.02);
}

function schedulePercussion(
  graph: AudioGraph,
  kind: 'kick' | 'hat',
  startTime: number,
): void {
  const { ctx, musicGain } = graph;
  if (kind === 'kick') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, startTime);
    osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.08);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.16, startTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);

    osc.connect(gain);
    gain.connect(musicGain);

    const cleanup = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    };
    osc.onended = cleanup;
    osc.start(startTime);
    osc.stop(startTime + 0.11);
    return;
  }

  const durationSec = 0.04;
  const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    channel[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(5200, startTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.045, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(musicGain);

  src.onended = () => {
    try {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  };
  src.start(startTime);
  src.stop(startTime + durationSec + 0.01);
}

function schedulePatternStep(
  graph: AudioGraph,
  pattern: TrackPattern,
  step: number,
  stepTime: number,
  stepSec: number,
): void {
  const bassMidi = pattern.bass[step];
  if (bassMidi !== null && bassMidi !== undefined) {
    scheduleMusicVoice({
      graph,
      freq: midiToHz(bassMidi),
      startTime: stepTime,
      durationSec: stepSec * 1.7,
      type: pattern.bassType,
      peakGain: 0.24,
      attackSec: 0.01,
      sustainRatio: 0.55,
      filterHz: pattern.bassFilterHz,
    });
  }

  const leadMidi = pattern.lead[step];
  if (leadMidi !== null && leadMidi !== undefined) {
    scheduleMusicVoice({
      graph,
      freq: midiToHz(leadMidi),
      startTime: stepTime,
      durationSec: stepSec * 1.35,
      type: pattern.leadType,
      peakGain: 0.14,
      attackSec: 0.012,
      sustainRatio: 0.45,
      filterHz: pattern.leadFilterHz,
    });
  }

  const padChord = pattern.padChords[step];
  if (padChord !== undefined) {
    const padDur = stepSec * pattern.padSteps * 0.96;
    for (const midi of padChord) {
      scheduleMusicVoice({
        graph,
        freq: midiToHz(midi),
        startTime: stepTime,
        durationSec: padDur,
        type: pattern.padType,
        peakGain: 0.055,
        attackSec: 0.06,
        sustainRatio: 0.72,
        filterHz: pattern.padFilterHz,
      });
    }
  }

  if (pattern.kickSteps.has(step)) {
    schedulePercussion(graph, 'kick', stepTime);
  }
  if (pattern.hatSteps.has(step)) {
    schedulePercussion(graph, 'hat', stepTime);
  }
}

function runLookaheadTick(graph: AudioGraph): void {
  if (muted || currentTrack === 'silence' || graph.ctx.state !== 'running') {
    return;
  }

  const pattern = getTrackPattern(currentTrack);
  const stepSec = 60 / pattern.bpm / 4;

  if (nextNoteTime < graph.ctx.currentTime - 0.15) {
    nextNoteTime = graph.ctx.currentTime + 0.02;
  }

  while (nextNoteTime < graph.ctx.currentTime + SCHEDULE_AHEAD_SEC) {
    schedulePatternStep(graph, pattern, currentStep, nextNoteTime, stepSec);
    nextNoteTime += stepSec;
    currentStep = (currentStep + 1) % PATTERN_STEPS;
  }
}

function startLookaheadScheduler(graph: AudioGraph): void {
  clearScheduler();
  if (muted || currentTrack === 'silence' || graph.ctx.state !== 'running') {
    return;
  }
  currentStep = 0;
  nextNoteTime = graph.ctx.currentTime + 0.01;
  runLookaheadTick(graph);
  schedulerTimer = setInterval(() => {
    if (audioGraph) {
      runLookaheadTick(audioGraph);
    }
  }, LOOKAHEAD_MS);
}

function playSfxTone(
  graph: AudioGraph,
  startFreq: number,
  endFreq: number,
  durationSec: number,
  type: OscillatorType,
  peakGain: number,
  startOffsetSec = 0,
  lowpassHz?: number,
): void {
  const { ctx, sfxGain } = graph;
  const startTime = ctx.currentTime + startOffsetSec;
  const endTime = startTime + durationSec;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, startFreq), startTime);
  if (endFreq !== startFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), endTime);
  }

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.018, durationSec * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  if (lowpassHz !== undefined) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowpassHz, startTime);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    osc.onended = () => {
      try {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    };
  } else {
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    };
  }

  osc.start(startTime);
  osc.stop(endTime + 0.02);
}

interface NoiseBurstOptions {
  graph: AudioGraph;
  durationSec: number;
  volume: number;
  filterType: BiquadFilterType;
  startHz: number;
  endHz?: number;
  q?: number;
  startOffsetSec?: number;
}

function playSfxNoise(opts: NoiseBurstOptions): void {
  const {
    graph,
    durationSec,
    volume,
    filterType,
    startHz,
    endHz,
    q = 1,
    startOffsetSec = 0,
  } = opts;
  const { ctx, sfxGain } = graph;
  const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    channel[i] = Math.random() * 2 - 1;
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  const startTime = ctx.currentTime + startOffsetSec;
  const endTime = startTime + durationSec;
  filter.frequency.setValueAtTime(Math.max(20, startHz), startTime);
  if (endHz !== undefined && endHz !== startHz) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(20, endHz), endTime);
  }
  filter.Q.setValueAtTime(q, startTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + Math.min(0.012, durationSec * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);

  src.onended = () => {
    try {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    } catch {
      // Ignore cleanup errors
    }
  };
  src.start(startTime);
  src.stop(endTime + 0.01);
}

export function unlock(): void {
  hasGestureUnlock = true;
  attachUnlockListeners();
  const graph = ensureAudioGraph();
  if (!graph) {
    return;
  }

  if (graph.ctx.state === 'suspended') {
    void graph.ctx
      .resume()
      .then(() => {
        if (audioGraph && audioGraph.ctx.state === 'running') {
          detachUnlockListeners();
          if (!muted && desiredTrack !== null && schedulerTimer === null) {
            currentTrack = desiredTrack;
            startLookaheadScheduler(audioGraph);
          }
        }
      })
      .catch(() => undefined);
  }

  if (graph.ctx.state === 'running') {
    detachUnlockListeners();
    if (!muted && desiredTrack !== null && schedulerTimer === null) {
      currentTrack = desiredTrack;
      startLookaheadScheduler(graph);
    }
  }
}

export function playSfx(cue: SoundCueId): void {
  if (muted || (!hasGestureUnlock && audioGraph === null)) {
    return;
  }
  const graph = ensureAudioGraph();
  if (!graph) {
    return;
  }
  if (graph.ctx.state === 'suspended') {
    unlock();
  }

  switch (cue) {
    case 'click':
    case 'ui_click': {
      const startFreq = varyPitch(660, 0.06);
      playSfxTone(graph, startFreq, startFreq * 0.74, 0.045, 'triangle', 0.14);
      break;
    }
    case 'hover': {
      const startFreq = varyPitch(880, 0.05);
      playSfxTone(graph, startFreq, startFreq * 1.09, 0.028, 'sine', 0.07);
      break;
    }
    case 'confirm':
    case 'meter_up': {
      playSfxTone(graph, 523.25, 659.25, 0.09, 'sine', 0.18, 0);
      playSfxTone(graph, 783.99, 783.99, 0.14, 'triangle', 0.16, 0.075);
      break;
    }
    case 'meter_down': {
      playSfxTone(graph, 440, 260, 0.12, 'triangle', 0.15, 0);
      break;
    }
    case 'footstep': {
      const base = varyPitch(145, 0.14);
      playSfxTone(graph, base, base * 0.45, 0.06, 'sine', 0.16);
      playSfxNoise({
        graph,
        durationSec: 0.045,
        volume: 0.09,
        filterType: 'bandpass',
        startHz: varyPitch(920, 0.14),
        q: 1.5,
      });
      break;
    }
    case 'dust_sweep': {
      const startHz = varyPitch(880, 0.16);
      playSfxNoise({
        graph,
        durationSec: 0.13,
        volume: 0.15,
        filterType: 'bandpass',
        startHz,
        endHz: startHz * 2.4,
        q: 1.8,
      });
      break;
    }
    case 'thruster': {
      const nowMs = Date.now();
      if (nowMs - lastThrusterMs < 75) {
        return;
      }
      lastThrusterMs = nowMs;
      playSfxNoise({
        graph,
        durationSec: 0.095,
        volume: 0.16,
        filterType: 'lowpass',
        startHz: varyPitch(430, 0.1),
      });
      playSfxTone(graph, varyPitch(88, 0.08), 64, 0.085, 'sawtooth', 0.07, 0, 260);
      break;
    }
    case 'water_flow': {
      const base = varyPitch(340, 0.08);
      playSfxTone(graph, base, base * 1.75, 0.14, 'sine', 0.14, 0);
      playSfxTone(graph, base * 1.45, base * 2.15, 0.12, 'triangle', 0.1, 0.055);
      break;
    }
    case 'bubble': {
      const base = varyPitch(430, 0.18);
      playSfxTone(graph, base, base * 2.25, 0.075, 'sine', 0.15);
      break;
    }
    case 'radar_ping':
    case 'radio_ping': {
      const base = varyPitch(1320, 0.04);
      playSfxTone(graph, base, base * 1.33, 0.08, 'sine', 0.16, 0);
      playSfxTone(graph, base * 1.33, base * 1.33, 0.12, 'sine', 0.11, 0.085);
      break;
    }
    case 'alarm':
    case 'alert':
    case 'alarm_cme': {
      playSfxTone(graph, 740, 540, 0.14, 'sawtooth', 0.14, 0, 1800);
      playSfxTone(graph, 740, 540, 0.14, 'sawtooth', 0.14, 0.18, 1800);
      break;
    }
    case 'static_burst':
    case 'comms_static': {
      playSfxNoise({
        graph,
        durationSec: 0.22,
        volume: 0.18,
        filterType: 'lowpass',
        startHz: 2500,
        endHz: 1100,
      });
      break;
    }
    case 'success':
    case 'victory_fanfare': {
      playSfxTone(graph, 523.25, 523.25, 0.1, 'triangle', 0.17, 0);
      playSfxTone(graph, 659.25, 659.25, 0.1, 'triangle', 0.17, 0.085);
      playSfxTone(graph, 783.99, 783.99, 0.12, 'triangle', 0.17, 0.17);
      playSfxTone(graph, 1046.5, 1046.5, 0.24, 'sine', 0.2, 0.255);
      break;
    }
    case 'abort': {
      playSfxTone(graph, 440, 220, 0.24, 'sawtooth', 0.14, 0, 1200);
      playSfxTone(graph, 330, 165, 0.34, 'triangle', 0.15, 0.25);
      break;
    }
    case 'solar_flare': {
      playSfxTone(graph, 72, 42, 0.42, 'sawtooth', 0.16, 0, 240);
      playSfxNoise({
        graph,
        durationSec: 0.45,
        volume: 0.16,
        filterType: 'bandpass',
        startHz: 320,
        endHz: 2600,
        q: 3.2,
        startOffsetSec: 0.04,
      });
      playSfxTone(graph, 440, 1280, 0.28, 'triangle', 0.1, 0.08, 2800);
      break;
    }
    case 'power_overload': {
      playSfxTone(graph, 120, 58, 0.24, 'sawtooth', 0.14, 0, 460);
      playSfxTone(graph, 1520, 320, 0.08, 'square', 0.13, 0.05, 3200);
      playSfxNoise({
        graph,
        durationSec: 0.08,
        volume: 0.15,
        filterType: 'highpass',
        startHz: 2800,
        startOffsetSec: 0.05,
      });
      playSfxTone(graph, 180, 52, 0.12, 'triangle', 0.18, 0.14);
      break;
    }
    case 'frost_freeze': {
      playSfxNoise({
        graph,
        durationSec: 0.36,
        volume: 0.14,
        filterType: 'bandpass',
        startHz: 1800,
        endHz: 650,
        q: 2.2,
      });
      playSfxTone(graph, varyPitch(1567.98, 0.04), 1567.98, 0.18, 'sine', 0.12, 0.02);
      playSfxTone(graph, varyPitch(2093.0, 0.04), 2093.0, 0.22, 'sine', 0.11, 0.08);
      playSfxTone(graph, varyPitch(2637.02, 0.04), 2637.02, 0.24, 'triangle', 0.08, 0.14);
      break;
    }
    case 'shutter_lock': {
      playSfxNoise({
        graph,
        durationSec: 0.16,
        volume: 0.14,
        filterType: 'bandpass',
        startHz: 950,
        endHz: 420,
        q: 2.5,
      });
      playSfxTone(graph, 240, 140, 0.15, 'sawtooth', 0.1, 0, 620);
      playSfxTone(graph, 115, 38, 0.14, 'sine', 0.22, 0.14);
      playSfxTone(graph, 520, 390, 0.05, 'triangle', 0.12, 0.18);
      break;
    }
    case 'co2_hiss': {
      playSfxNoise({
        graph,
        durationSec: 0.34,
        volume: 0.17,
        filterType: 'highpass',
        startHz: 3200,
        endHz: 1900,
        q: 1.1,
      });
      playSfxTone(graph, 130, 360, 0.32, 'triangle', 0.11, 0.04, 900);
      break;
    }
    case 'choice_impact': {
      playSfxTone(graph, 310, 180, 0.055, 'square', 0.11, 0, 1200);
      playSfxTone(graph, 261.63, 261.63, 0.34, 'triangle', 0.14, 0.045, 1600);
      playSfxTone(graph, 392.0, 392.0, 0.34, 'triangle', 0.12, 0.06, 2000);
      playSfxTone(graph, 523.25, 523.25, 0.36, 'sine', 0.13, 0.075);
      playSfxTone(graph, 659.25, 659.25, 0.38, 'sine', 0.1, 0.09);
      break;
    }
    case 'crew_cheer': {
      const f1 = varyPitch(659.25, 0.04);
      const f2 = varyPitch(987.77, 0.04);
      playSfxTone(graph, f1, f1, 0.1, 'triangle', 0.15, 0);
      playSfxTone(graph, f2, 1046.5, 0.18, 'sine', 0.17, 0.085);
      break;
    }
    case 'crew_shiver': {
      playSfxTone(graph, 340, 315, 0.06, 'sine', 0.12, 0);
      playSfxTone(graph, 315, 340, 0.06, 'sine', 0.12, 0.055);
      playSfxTone(graph, 332, 305, 0.06, 'sine', 0.11, 0.11);
      playSfxTone(graph, 305, 275, 0.09, 'triangle', 0.1, 0.165);
      playSfxNoise({
        graph,
        durationSec: 0.14,
        volume: 0.07,
        filterType: 'bandpass',
        startHz: 1400,
        endHz: 900,
        q: 1.5,
        startOffsetSec: 0.02,
      });
      break;
    }
    default: {
      const _exhaustive: never = cue;
      return _exhaustive;
    }
  }
}

export function playCue(cue: SoundCueId): void {
  playSfx(cue);
}

export function startAmbientLoop(track: AmbientTrackId): void {
  const normalized = normalizeTrackId(track);
  const unchanged = normalized === currentTrack;
  currentTrack = normalized;
  desiredTrack = normalized === 'silence' ? null : normalized;

  if (normalized === 'silence') {
    clearScheduler();
    return;
  }

  attachUnlockListeners();
  if (!hasGestureUnlock && audioGraph === null && !hasBrowserUserActivation()) {
    return;
  }

  const graph = ensureAudioGraph();
  if (!graph) {
    return;
  }

  if (unchanged && schedulerTimer !== null) {
    return;
  }

  if (graph.ctx.state === 'suspended') {
    void graph.ctx
      .resume()
      .then(() => {
        if (audioGraph && audioGraph.ctx.state === 'running') {
          detachUnlockListeners();
          if (!muted && desiredTrack !== null && schedulerTimer === null) {
            currentTrack = desiredTrack;
            startLookaheadScheduler(audioGraph);
          }
        }
      })
      .catch(() => undefined);
    return;
  }

  detachUnlockListeners();
  if (!muted) {
    startLookaheadScheduler(graph);
  }
}

export function setAmbientTrack(track: AmbientTrackId): void {
  startAmbientLoop(track);
}

export function stopAmbientLoop(): void {
  currentTrack = 'silence';
  desiredTrack = null;
  clearScheduler();
}

export function setMuted(nextMuted: boolean): void {
  muted = nextMuted;
  if (audioGraph) {
    const targetGain = nextMuted ? 0 : 1;
    audioGraph.masterGain.gain.setTargetAtTime(
      targetGain,
      audioGraph.ctx.currentTime,
      MUTE_RAMP_TIME_CONSTANT_SEC,
    );
  }

  if (nextMuted) {
    clearScheduler();
  } else if (
    desiredTrack !== null &&
    (hasGestureUnlock || audioGraph !== null || hasBrowserUserActivation())
  ) {
    startAmbientLoop(desiredTrack);
  }
}

export function isMuted(): boolean {
  return muted;
}

export function isSoundMuted(): boolean {
  return muted;
}

export function getCurrentTrack(): CanonicalTrackId {
  return currentTrack;
}

attachUnlockListeners();
