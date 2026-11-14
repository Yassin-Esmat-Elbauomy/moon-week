import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SoundCueId } from './soundEngine';

interface RecordedTargetRamp {
  target: number;
  startTime: number;
  timeConstant: number;
}

interface RecordedFrequencySet {
  value: number;
  time: number;
}

class FakeAudioParam {
  public value: number;
  public readonly targetRamps: RecordedTargetRamp[] = [];
  public readonly valueSets: RecordedFrequencySet[] = [];
  public readonly linearRamps: RecordedFrequencySet[] = [];
  public readonly expRamps: RecordedFrequencySet[] = [];

  public constructor(initialValue = 0) {
    this.value = initialValue;
  }

  public setValueAtTime(value: number, time: number): this {
    this.value = value;
    this.valueSets.push({ value, time });
    return this;
  }

  public linearRampToValueAtTime(value: number, time: number): this {
    this.value = value;
    this.linearRamps.push({ value, time });
    return this;
  }

  public exponentialRampToValueAtTime(value: number, time: number): this {
    if (value <= 0) {
      throw new RangeError('exponentialRampToValueAtTime requires positive value');
    }
    this.value = value;
    this.expRamps.push({ value, time });
    return this;
  }

  public setTargetAtTime(target: number, startTime: number, timeConstant: number): this {
    this.value = target;
    this.targetRamps.push({ target, startTime, timeConstant });
    return this;
  }
}

class FakeAudioNode {
  public readonly connections: FakeAudioNode[] = [];
  public disconnected = false;

  public connect(destination: FakeAudioNode): FakeAudioNode {
    this.connections.push(destination);
    return destination;
  }

  public disconnect(): void {
    this.disconnected = true;
  }
}

class FakeGainNode extends FakeAudioNode {
  public readonly gain = new FakeAudioParam(1);
}

class FakeDynamicsCompressorNode extends FakeAudioNode {
  public readonly threshold = new FakeAudioParam(-24);
  public readonly knee = new FakeAudioParam(30);
  public readonly ratio = new FakeAudioParam(12);
  public readonly attack = new FakeAudioParam(0.003);
  public readonly release = new FakeAudioParam(0.25);
}

class FakeBiquadFilterNode extends FakeAudioNode {
  public type: BiquadFilterType = 'lowpass';
  public readonly frequency = new FakeAudioParam(350);
  public readonly Q = new FakeAudioParam(1);
}

class FakeOscillatorNode extends FakeAudioNode {
  public type: OscillatorType = 'sine';
  public readonly frequency = new FakeAudioParam(440);
  public readonly detune = new FakeAudioParam(0);
  public startedAt: number | null = null;
  public stoppedAt: number | null = null;
  public onended: (() => void) | null = null;

  public start(when = 0): void {
    this.startedAt = when;
  }

  public stop(when = 0): void {
    this.stoppedAt = when;
    if (this.onended) {
      this.onended();
    }
  }
}

class FakeAudioBuffer {
  public readonly length: number;
  public readonly sampleRate: number;
  private readonly data: Float32Array;

  public constructor(length: number, sampleRate: number) {
    this.length = length;
    this.sampleRate = sampleRate;
    this.data = new Float32Array(length);
  }

  public getChannelData(): Float32Array {
    return this.data;
  }
}

class FakeBufferSourceNode extends FakeAudioNode {
  public buffer: FakeAudioBuffer | null = null;
  public startedAt: number | null = null;
  public stoppedAt: number | null = null;
  public onended: (() => void) | null = null;

  public start(when = 0): void {
    this.startedAt = when;
  }

  public stop(when = 0): void {
    this.stoppedAt = when;
    if (this.onended) {
      this.onended();
    }
  }
}

class FakeDestinationNode extends FakeAudioNode {}

interface FakeAudioHarnesses {
  createdContexts: FakeAudioContext[];
  initialState: AudioContextState;
}

const audioHarness: FakeAudioHarnesses = {
  createdContexts: [],
  initialState: 'running',
};

class FakeAudioContext {
  public currentTime = 0;
  public sampleRate = 44100;
  public state: AudioContextState;
  public readonly destination = new FakeDestinationNode();

  public readonly gains: FakeGainNode[] = [];
  public readonly compressors: FakeDynamicsCompressorNode[] = [];
  public readonly filters: FakeBiquadFilterNode[] = [];
  public readonly oscillators: FakeOscillatorNode[] = [];
  public readonly bufferSources: FakeBufferSourceNode[] = [];
  public resumeCount = 0;

  public constructor() {
    this.state = audioHarness.initialState;
    audioHarness.createdContexts.push(this);
  }

  public async resume(): Promise<void> {
    this.resumeCount += 1;
    this.state = 'running';
  }

  public createGain(): FakeGainNode {
    const node = new FakeGainNode();
    this.gains.push(node);
    return node;
  }

  public createDynamicsCompressor(): FakeDynamicsCompressorNode {
    const node = new FakeDynamicsCompressorNode();
    this.compressors.push(node);
    return node;
  }

  public createBiquadFilter(): FakeBiquadFilterNode {
    const node = new FakeBiquadFilterNode();
    this.filters.push(node);
    return node;
  }

  public createOscillator(): FakeOscillatorNode {
    const node = new FakeOscillatorNode();
    this.oscillators.push(node);
    return node;
  }

  public createBuffer(_channels: number, length: number, sampleRate: number): FakeAudioBuffer {
    return new FakeAudioBuffer(length, sampleRate);
  }

  public createBufferSource(): FakeBufferSourceNode {
    const node = new FakeBufferSourceNode();
    this.bufferSources.push(node);
    return node;
  }
}

interface FakeWindowListenerRegistry {
  listeners: Map<string, Set<() => void>>;
  addEventListener: (eventName: string, cb: () => void) => void;
  removeEventListener: (eventName: string, cb: () => void) => void;
  dispatch: (eventName: string) => void;
  AudioContext: typeof FakeAudioContext;
}

function createFakeWindow(): FakeWindowListenerRegistry {
  const listeners = new Map<string, Set<() => void>>();
  return {
    listeners,
    addEventListener: (eventName: string, cb: () => void) => {
      const existing = listeners.get(eventName) ?? new Set<() => void>();
      existing.add(cb);
      listeners.set(eventName, existing);
    },
    removeEventListener: (eventName: string, cb: () => void) => {
      listeners.get(eventName)?.delete(cb);
    },
    dispatch: (eventName: string) => {
      const handlers = Array.from(listeners.get(eventName) ?? []);
      for (const handler of handlers) {
        handler();
      }
    },
    AudioContext: FakeAudioContext,
  };
}

describe('SoundEngine — Procedural Chiptune Sequencer & Tactile SFX', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    audioHarness.createdContexts = [];
    audioHarness.initialState = 'running';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('operates safely in headless Node/Vitest without AudioContext and tracks normalized track & mute state', async () => {
    const engine = await import('./soundEngine');

    expect(engine.getCurrentTrack()).toBe('silence');
    expect(engine.isMuted()).toBe(false);
    expect(engine.isSoundMuted()).toBe(false);

    expect(() => {
      engine.unlock();
      engine.startAmbientLoop('lunar_hum');
      expect(engine.getCurrentTrack()).toBe('exploration');
      engine.setAmbientTrack('solar_storm');
      expect(engine.getCurrentTrack()).toBe('crisis');
      engine.startAmbientLoop('cutscene');
      expect(engine.getCurrentTrack()).toBe('cutscene');
      engine.playSfx('footstep');
      engine.playCue('radar_ping');
      engine.setMuted(true);
      expect(engine.isMuted()).toBe(true);
      expect(engine.isSoundMuted()).toBe(true);
      engine.setMuted(false);
      expect(engine.isMuted()).toBe(false);
      engine.stopAmbientLoop();
      expect(engine.getCurrentTrack()).toBe('silence');
    }).not.toThrow();
  });

  it('wires musicGain (~0.32) & sfxGain (~0.55) -> DynamicsCompressorNode -> masterGain -> destination', async () => {
    const fakeWindow = createFakeWindow();
    vi.stubGlobal('window', fakeWindow);

    const engine = await import('./soundEngine');
    engine.unlock();
    engine.playSfx('confirm');

    const ctx = audioHarness.createdContexts[0];
    expect(ctx).toBeDefined();
    if (!ctx) return;

    expect(ctx.compressors.length).toBe(1);
    const compressor = ctx.compressors[0];
    expect(compressor).toBeDefined();
    if (!compressor) return;

    expect(compressor.threshold.value).toBeLessThanOrEqual(-12);
    expect(compressor.ratio.value).toBeGreaterThanOrEqual(2);

    // Expect musicGain, sfxGain, and masterGain connected into destination via compressor
    const musicGain = ctx.gains.find((g) => Math.abs(g.gain.value - 0.32) < 0.05);
    const sfxGain = ctx.gains.find((g) => Math.abs(g.gain.value - 0.55) < 0.05);
    const masterGain = ctx.gains.find((g) => g.connections.includes(ctx.destination));

    expect(musicGain).toBeDefined();
    expect(sfxGain).toBeDefined();
    expect(masterGain).toBeDefined();
    expect(musicGain?.connections).toContain(compressor);
    expect(sfxGain?.connections).toContain(compressor);
    expect(compressor.connections).toContain(masterGain);

    // No oscillator should bypass the mix buses directly to ctx.destination
    for (const osc of ctx.oscillators) {
      expect(osc.connections).not.toContain(ctx.destination);
    }
  });

  it('drives a 16th-note lookahead scheduler across exploration, crisis, and cutscene without overlapping timers', async () => {
    vi.useFakeTimers();
    const fakeWindow = createFakeWindow();
    vi.stubGlobal('window', fakeWindow);

    const engine = await import('./soundEngine');
    engine.startAmbientLoop('exploration');

    // No AudioContext should be constructed before user gesture
    expect(audioHarness.createdContexts.length).toBe(0);
    expect(engine.getCurrentTrack()).toBe('exploration');

    engine.unlock();

    const ctx = audioHarness.createdContexts[0];
    expect(ctx).toBeDefined();
    if (!ctx) return;

    expect(vi.getTimerCount()).toBe(1);
    const initialOscCount = ctx.oscillators.length;
    expect(initialOscCount).toBeGreaterThan(0);

    // Calling again with equivalent alias ('lunar_hum' -> 'exploration') should not multiply timers
    engine.setAmbientTrack('lunar_hum');
    expect(vi.getTimerCount()).toBe(1);

    // Advance audio time smoothly across two 16th-note boundaries (~0.153s/step at 98 BPM)
    ctx.currentTime += 0.16;
    vi.advanceTimersByTime(25);
    ctx.currentTime += 0.16;
    vi.advanceTimersByTime(25);
    expect(ctx.oscillators.length).toBeGreaterThan(initialOscCount);

    // Tab-background clamp: jumping far ahead schedules cleanly without a burst of catch-up notes
    const countBeforeJump = ctx.oscillators.length;
    ctx.currentTime += 30;
    vi.advanceTimersByTime(25);
    expect(ctx.oscillators.length - countBeforeJump).toBeLessThanOrEqual(8);

    // Verify lookahead scheduled timestamps are strictly non-negative and sequenced ahead
    const startedTimes = ctx.oscillators
      .map((osc) => osc.startedAt)
      .filter((t): t is number => t !== null);
    expect(Math.max(...startedTimes)).toBeGreaterThan(0);

    // Switching themes keeps exactly one active scheduler timer
    engine.startAmbientLoop('crisis');
    expect(engine.getCurrentTrack()).toBe('crisis');
    expect(vi.getTimerCount()).toBe(1);

    engine.startAmbientLoop('cutscene');
    expect(engine.getCurrentTrack()).toBe('cutscene');
    expect(vi.getTimerCount()).toBe(1);

    engine.stopAmbientLoop();
    expect(engine.getCurrentTrack()).toBe('silence');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('defers AudioContext creation until first pointerdown/keydown gesture and auto-starts queued music', async () => {
    vi.useFakeTimers();
    audioHarness.initialState = 'suspended';
    const fakeWindow = createFakeWindow();
    vi.stubGlobal('window', fakeWindow);

    const engine = await import('./soundEngine');
    engine.startAmbientLoop('cutscene');
    engine.playSfx('radar_ping');

    // Zero AudioContext instances or scheduler timers may exist prior to user gesture
    expect(audioHarness.createdContexts.length).toBe(0);
    expect(engine.getCurrentTrack()).toBe('cutscene');
    expect(vi.getTimerCount()).toBe(0);
    expect(fakeWindow.listeners.get('pointerdown')?.size ?? 0).toBeGreaterThan(0);
    expect(fakeWindow.listeners.get('keydown')?.size ?? 0).toBeGreaterThan(0);

    // Simulate first click gesture
    fakeWindow.dispatch('pointerdown');
    await Promise.resolve();
    await Promise.resolve();

    const ctx = audioHarness.createdContexts[0];
    expect(ctx).toBeDefined();
    if (!ctx) return;

    expect(audioHarness.createdContexts.length).toBe(1);
    expect(ctx.resumeCount).toBeGreaterThanOrEqual(1);
    expect(ctx.state).toBe('running');
    expect(ctx.oscillators.length).toBeGreaterThan(0);
    expect(vi.getTimerCount()).toBe(1);

    // Gesture listeners should clean up once unlocked
    expect(fakeWindow.listeners.get('pointerdown')?.size ?? 0).toBe(0);
    expect(fakeWindow.listeners.get('keydown')?.size ?? 0).toBe(0);
  });

  it('unlocks queued music cleanly via keyboard gesture as well', async () => {
    vi.useFakeTimers();
    const fakeWindow = createFakeWindow();
    vi.stubGlobal('window', fakeWindow);

    const engine = await import('./soundEngine');
    engine.startAmbientLoop('exploration');
    expect(audioHarness.createdContexts.length).toBe(0);

    fakeWindow.dispatch('keydown');
    expect(audioHarness.createdContexts.length).toBe(1);
    expect(engine.getCurrentTrack()).toBe('exploration');
    expect(vi.getTimerCount()).toBe(1);
  });

  it('ramps masterGain smoothly via setTargetAtTime on mute/unmute and suppresses SFX while muted', async () => {
    vi.useFakeTimers();
    const fakeWindow = createFakeWindow();
    vi.stubGlobal('window', fakeWindow);

    const engine = await import('./soundEngine');
    engine.unlock();
    engine.startAmbientLoop('exploration');

    const ctx = audioHarness.createdContexts[0];
    expect(ctx).toBeDefined();
    if (!ctx) return;

    const masterGain = ctx.gains.find((g) => g.connections.includes(ctx.destination));
    expect(masterGain).toBeDefined();
    if (!masterGain) return;

    engine.setMuted(true);
    expect(engine.isMuted()).toBe(true);
    expect(masterGain.gain.targetRamps.some((r) => r.target === 0 && r.timeConstant > 0)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);

    const oscCountWhileMuted = ctx.oscillators.length;
    engine.playSfx('click');
    expect(ctx.oscillators.length).toBe(oscCountWhileMuted);

    engine.setMuted(false);
    expect(engine.isMuted()).toBe(false);
    expect(masterGain.gain.targetRamps.some((r) => r.target === 1 && r.timeConstant > 0)).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('plays all tactile SFX cues and backward-compatible aliases with subtle pitch variation', async () => {
    const fakeWindow = createFakeWindow();
    vi.stubGlobal('window', fakeWindow);

    const engine = await import('./soundEngine');
    engine.unlock();

    const ctx = audioHarness.createdContexts[0];
    expect(ctx).toBeDefined();
    if (!ctx) return;

    const allCues: readonly SoundCueId[] = [
      'click',
      'confirm',
      'footstep',
      'dust_sweep',
      'thruster',
      'water_flow',
      'bubble',
      'radar_ping',
      'radio_ping',
      'alarm',
      'alert',
      'static_burst',
      'success',
      'abort',
      'ui_click',
      'meter_up',
      'meter_down',
      'alarm_cme',
      'comms_static',
      'victory_fanfare',
    ];

    for (const cue of allCues) {
      const before = ctx.oscillators.length + ctx.bufferSources.length;
      engine.playSfx(cue);
      const after = ctx.oscillators.length + ctx.bufferSources.length;
      expect(after).toBeGreaterThan(before);
    }

    // Repeated bubble calls should subtly vary pitch to prevent robotic repetition
    const observedStartFreqs = new Set<number>();
    for (let i = 0; i < 8; i++) {
      const idxBefore = ctx.oscillators.length;
      engine.playSfx('bubble');
      const osc = ctx.oscillators[idxBefore];
      if (osc && osc.frequency.valueSets[0]) {
        observedStartFreqs.add(Math.round(osc.frequency.valueSets[0].value * 100));
      }
    }
    expect(observedStartFreqs.size).toBeGreaterThan(1);
  });
});
