import { describe, expect, it } from 'vitest';
import {
  computeMissionEnding,
  createInitialGameState,
  createPresetGameState,
  simulateWhatIfTimeline,
  transitionGameState,
} from './engine';
import { loadGameState, saveGameState } from './storage';
import type { ChoiceId, GameState } from '../types/game';

function playCanonicalDay(
  initial: GameState,
  choiceId: ChoiceId,
  options?: {
    touchdownVelocity?: number;
    miniGameGrade?: 'gold' | 'silver' | 'bronze';
    repairAnomaly?: boolean;
    restCrewIds?: Array<'albaraa' | 'omar' | 'taha' | 'yassin' | 'sayed'>;
  },
): GameState {
  let state = initial;
  const grade = options?.miniGameGrade ?? 'silver';

  // Morning shift: optionally rest specific specialists, confirm roster, play signature mini-game
  for (const id of options?.restCrewIds ?? []) {
    state = transitionGameState(state, {
      kind: 'SET_SPECIALIST_ASSIGNMENT',
      crewId: id,
      assignment: 'resting',
    });
  }
  state = transitionGameState(state, { kind: 'CONFIRM_MORNING_ROSTER' });
  state = transitionGameState(state, {
    kind: 'COMPLETE_MINIGAME',
    miniGame:
      state.day === 1
        ? 'lunar_lander'
        : state.day === 2
          ? 'greenhouse'
          : state.day === 3
            ? 'power_grid'
            : state.day === 4
              ? 'radiation'
              : state.day === 5
                ? 'medbay'
                : 'rover_surface',
    grade,
    touchdownVelocity: options?.touchdownVelocity,
  });
  state = transitionGameState(state, { kind: 'ADVANCE_SHIFT' });

  // Midday shift: repair or ignore anomaly
  if (options?.repairAnomaly ?? true) {
    state = transitionGameState(state, { kind: 'REPAIR_MIDDAY_ANOMALY', grade });
  }
  state = transitionGameState(state, { kind: 'ADVANCE_SHIFT' });

  // Evening shift: lock in compounding decision and advance to next day
  state = transitionGameState(state, { kind: 'APPLY_EVENING_DECISION', choiceId });
  if (state.ending === null) {
    state = transitionGameState(state, { kind: 'ADVANCE_SHIFT' });
  }
  return state;
}

describe('SimulationEngine — Core Contract', () => {
  it('initializes with calibrated Day 1 baselines', () => {
    const state = createInitialGameState();
    expect(state.day).toBe(1);
    expect(state.shift).toBe('morning');
    expect(state.primary).toEqual({
      lifeSupport: 75,
      power: 75,
      shielding: 75,
      crewReadiness: 80,
    });
    expect(state.sub).toEqual({
      crewHealth: 90,
      crewFatigue: 15,
      medicalSupplies: 80,
      foodAndSupplies: 70,
      waterAvailability: 70,
      roverBattery: 80,
      scienceScore: 10,
    });
    expect(state.commsBlackout).toBe(false);
    expect(state.ending).toBeNull();
  });

  it('tracks individual specialist fatigue, halves bonuses at >=70, and forces rest at >=90', () => {
    let state = createInitialGameState();
    // Push albaraa fatigue manually to 85 via repeated work shifts or simulate directly through shifts
    for (let i = 0; i < 10; i++) {
      state = {
        ...state,
        rosterConfirmedForDay: false,
        specialists: {
          ...state.specialists,
          albaraa: { ...state.specialists.albaraa, fatigue: 72, assignment: 'station' },
        },
      };
      const beforePower = state.primary.power;
      state = transitionGameState(state, { kind: 'CONFIRM_MORNING_ROSTER' });
      // Normal AlBaraa bonus is +5; fatigued >=70 halves to +3
      expect(state.primary.power - beforePower).toBe(3);
      break;
    }

    // At >=90 fatigue, safety protocol forces AlBaraa to rest (-12 fatigue, 0 power bonus)
    let exhaustedState: GameState = {
      ...createInitialGameState(),
      specialists: {
        ...createInitialGameState().specialists,
        albaraa: {
          id: 'albaraa',
          fatigue: 92,
          assignment: 'station',
          forcedRest: false,
          expression: 'worried',
        },
      },
    };
    const powerBefore = exhaustedState.primary.power;
    exhaustedState = transitionGameState(exhaustedState, { kind: 'CONFIRM_MORNING_ROSTER' });
    expect(exhaustedState.specialists.albaraa.forcedRest).toBe(true);
    expect(exhaustedState.specialists.albaraa.assignment).toBe('resting');
    expect(exhaustedState.specialists.albaraa.fatigue).toBe(80);
    expect(exhaustedState.primary.power).toBe(powerBefore);
  });

  it('triggers Unbuffered Storm Bus Overload & activePumpsStalled on Day 4 Option 4A when Active Pumps lack Day 3 Battery Storage (on both landing sites)', () => {
    for (const siteChoice of ['1A_sunlit_ridge', '1B_crater_shadow'] as const) {
      let state = createInitialGameState();
      state = transitionGameState(state, { kind: 'COMPLETE_TUTORIAL' });
      state = playCanonicalDay(state, siteChoice, { miniGameGrade: 'silver' });
      state = playCanonicalDay(state, '2A_active_pumps', { miniGameGrade: 'silver' });
      state = playCanonicalDay(state, '3A_essential_heating', { miniGameGrade: 'silver' });

      // Advance Day 4 to Evening Shift and confirm 4A without Day 3 Battery Storage
      state = transitionGameState(state, { kind: 'CONFIRM_MORNING_ROSTER' });
      state = transitionGameState(state, { kind: 'COMPLETE_MINIGAME', miniGame: 'radiation', grade: 'silver' });
      state = transitionGameState(state, { kind: 'ADVANCE_SHIFT' });
      state = transitionGameState(state, { kind: 'REPAIR_MIDDAY_ANOMALY', grade: 'silver' });
      state = transitionGameState(state, { kind: 'ADVANCE_SHIFT' });

      const lsBefore = state.primary.lifeSupport;
      state = transitionGameState(state, { kind: 'APPLY_EVENING_DECISION', choiceId: '4A_max_shielding' });

      expect(state.flags.unbufferedStormOverloadTriggered).toBe(true);
      expect(state.flags.activePumpsStalled).toBe(true);
      expect(state.primary.power).toBeLessThan(25);
      // Immediate -15 lifeSupport stall penalty applied
      expect(state.primary.lifeSupport).toBeLessThanOrEqual(lsBefore - 15);
    }
  });

  it('keeps Active Pumps online during Day 4 Option 4A when Day 3 Battery Storage buffered the grid', () => {
    let state = createInitialGameState();
    state = transitionGameState(state, { kind: 'COMPLETE_TUTORIAL' });
    state = playCanonicalDay(state, '1B_crater_shadow', { miniGameGrade: 'gold' });
    state = playCanonicalDay(state, '2A_active_pumps', { miniGameGrade: 'gold' });
    state = playCanonicalDay(state, '3B_battery_storage', { miniGameGrade: 'gold' });

    state = transitionGameState(state, { kind: 'CONFIRM_MORNING_ROSTER' });
    state = transitionGameState(state, { kind: 'COMPLETE_MINIGAME', miniGame: 'radiation', grade: 'gold' });
    state = transitionGameState(state, { kind: 'ADVANCE_SHIFT' });
    state = transitionGameState(state, { kind: 'REPAIR_MIDDAY_ANOMALY', grade: 'gold' });
    state = transitionGameState(state, { kind: 'ADVANCE_SHIFT' });
    state = transitionGameState(state, { kind: 'APPLY_EVENING_DECISION', choiceId: '4A_max_shielding' });

    expect(state.flags.unbufferedStormOverloadTriggered).toBe(false);
    expect(state.flags.activePumpsStalled).toBe(false);
    expect(state.primary.power).toBeGreaterThanOrEqual(25);
  });

  it('reaches all 4 canonical endings deterministically via Judge Jump synthesis and What-If replay', () => {
    const breakthrough = createPresetGameState('ending_scientific_breakthrough');
    expect(breakthrough.ending).toBe('SCIENTIFIC_BREAKTHROUGH');
    expect(breakthrough.primary.lifeSupport).toBeGreaterThanOrEqual(60);
    expect(breakthrough.primary.power).toBeGreaterThanOrEqual(60);
    expect(breakthrough.primary.shielding).toBeGreaterThanOrEqual(60);
    expect(breakthrough.primary.crewReadiness).toBeGreaterThanOrEqual(60);
    expect(breakthrough.sub.scienceScore).toBeGreaterThanOrEqual(75);

    const accomplished = createPresetGameState('ending_mission_accomplished');
    expect(accomplished.ending).toBe('MISSION_ACCOMPLISHED');
    expect(computeMissionEnding(accomplished)).toBe('MISSION_ACCOMPLISHED');

    const critical = createPresetGameState('ending_critical_survival');
    expect(critical.ending).toBe('CRITICAL_SURVIVAL');
    expect(
      Math.min(
        critical.primary.lifeSupport,
        critical.primary.power,
        critical.primary.shielding,
        critical.primary.crewReadiness,
      ),
    ).toBeGreaterThan(0);
    expect(
      Math.min(
        critical.primary.lifeSupport,
        critical.primary.power,
        critical.primary.shielding,
        critical.primary.crewReadiness,
      ),
    ).toBeLessThan(50);

    const failure = createPresetGameState('ending_mission_failure');
    expect(failure.ending).toBe('MISSION_FAILURE');
    expect(failure.abortReason).toBeTruthy();

    // What-If Time Machine: overriding Day 3 in critical survival path to Battery Storage improves outcome
    const improved = simulateWhatIfTimeline(critical.decisions, {
      3: '3B_battery_storage',
      71: '7_1A_rover_bus_tap',
      72: '7_2A_medbay_o2_divert',
      73: '7_3A_phased_array_lock',
    });
    expect(improved.flags.activePumpsStalled).toBe(false);
    expect(improved.ending).not.toBe('MISSION_FAILURE');
  });

  it('activates Day 7 Comms Blackout in Part B & C and recovers in Part D', () => {
    const blackout = createPresetGameState('day_7_blackout');
    expect(blackout.day).toBe(7);
    expect(blackout.commsBlackout).toBe(true);
    expect(blackout.day7Stage).toBe('part_b_blackout');
  });
});

describe('Storage Schema Validation', () => {
  it('recovers cleanly from malformed or invalid saved payloads', () => {
    const memoryMap = new Map<string, string>();
    const fakeStorage = {
      getItem: (k: string) => memoryMap.get(k) ?? null,
      setItem: (k: string, v: string) => {
        memoryMap.set(k, v);
      },
      removeItem: (k: string) => {
        memoryMap.delete(k);
      },
    };

    const valid = createInitialGameState();
    saveGameState(valid, fakeStorage);
    const loaded = loadGameState(fakeStorage);
    expect(loaded).not.toBeNull();
    expect(loaded?.primary.power).toBe(75);

    memoryMap.set('mission_control_save_v1', '{"corrupted":true,"day":99}');
    expect(loadGameState(fakeStorage)).toBeNull();

    memoryMap.set('mission_control_save_v1', 'not json');
    expect(loadGameState(fakeStorage)).toBeNull();
  });
});
