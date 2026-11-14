import { DAILY_SCENARIOS, DAY7_STAGE_SPECS } from '../data/dailyScenarios';
import { ON_BASE_CREW_IDS } from '../data/crewProfiles';
import type {
  ChoiceId,
  CompoundingFlags,
  Day7Stage,
  DayNumber,
  DecisionRecord,
  EndingId,
  GameAction,
  GameState,
  JumpTarget,
  MiniGameGrade,
  MiniGameId,
  MissionLogEntry,
  OnBaseCrewId,
  PrimaryResources,
  ResourceDeltas,
  SpecialistRuntimeState,
  SubResources,
  WhatIfResult,
} from '../types/game';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function clampResources(
  primary: PrimaryResources,
  sub: SubResources,
): { primary: PrimaryResources; sub: SubResources } {
  return {
    primary: {
      lifeSupport: clamp(primary.lifeSupport, 0, 100),
      power: clamp(primary.power, 0, 100),
      shielding: clamp(primary.shielding, 0, 100),
      crewReadiness: clamp(primary.crewReadiness, 0, 100),
    },
    sub: {
      crewHealth: clamp(sub.crewHealth, 0, 100),
      crewFatigue: clamp(sub.crewFatigue, 0, 100),
      medicalSupplies: clamp(sub.medicalSupplies, 0, 100),
      foodAndSupplies: clamp(sub.foodAndSupplies, 0, 100),
      waterAvailability: clamp(sub.waterAvailability, 0, 100),
      roverBattery: clamp(sub.roverBattery, 0, 100),
      scienceScore: Math.max(0, Math.round(sub.scienceScore)),
    },
  };
}

function computeMeanFatigue(
  specialists: Record<OnBaseCrewId, SpecialistRuntimeState>,
): number {
  let sum = 0;
  for (const id of ON_BASE_CREW_IDS) {
    sum += specialists[id].fatigue;
  }
  return Math.round(sum / ON_BASE_CREW_IDS.length);
}

function shiftAllSpecialistFatigue(
  specialists: Record<OnBaseCrewId, SpecialistRuntimeState>,
  delta: number,
): Record<OnBaseCrewId, SpecialistRuntimeState> {
  if (delta === 0) {
    return specialists;
  }
  const updated: Record<OnBaseCrewId, SpecialistRuntimeState> = {
    albaraa: { ...specialists.albaraa },
    omar: { ...specialists.omar },
    taha: { ...specialists.taha },
    yassin: { ...specialists.yassin },
    sayed: { ...specialists.sayed },
  };
  for (const id of ON_BASE_CREW_IDS) {
    const nextFatigue = clamp(updated[id].fatigue + delta, 0, 100);
    updated[id] = {
      ...updated[id],
      fatigue: nextFatigue,
      expression:
        nextFatigue >= 90
          ? 'worried'
          : nextFatigue >= 70
            ? 'concerned'
            : updated[id].expression,
    };
  }
  return updated;
}

function applyDeltas(state: Readonly<GameState>, deltas: ResourceDeltas): GameState {
  const nextSpecialists =
    deltas.crewFatigue !== undefined && deltas.crewFatigue !== 0
      ? shiftAllSpecialistFatigue(state.specialists, deltas.crewFatigue)
      : state.specialists;

  const meanFatigue =
    deltas.crewFatigue !== undefined && deltas.crewFatigue !== 0
      ? computeMeanFatigue(nextSpecialists)
      : state.sub.crewFatigue;

  const clamped = clampResources(
    {
      lifeSupport: state.primary.lifeSupport + (deltas.lifeSupport ?? 0),
      power: state.primary.power + (deltas.power ?? 0),
      shielding: state.primary.shielding + (deltas.shielding ?? 0),
      crewReadiness: state.primary.crewReadiness + (deltas.crewReadiness ?? 0),
    },
    {
      crewHealth: state.sub.crewHealth + (deltas.crewHealth ?? 0),
      crewFatigue: meanFatigue,
      medicalSupplies: state.sub.medicalSupplies + (deltas.medicalSupplies ?? 0),
      foodAndSupplies: state.sub.foodAndSupplies + (deltas.foodAndSupplies ?? 0),
      waterAvailability: state.sub.waterAvailability + (deltas.waterAvailability ?? 0),
      roverBattery: state.sub.roverBattery + (deltas.roverBattery ?? 0),
      scienceScore: state.sub.scienceScore + (deltas.scienceScore ?? 0),
    },
  );

  return {
    ...state,
    primary: clamped.primary,
    sub: clamped.sub,
    specialists: nextSpecialists,
  };
}

function makeLog(
  state: Readonly<GameState>,
  category: MissionLogEntry['category'],
  title: string,
  detail: string,
): MissionLogEntry {
  return {
    id: `log-d${state.day}-${state.shift}-${state.logs.length + 1}`,
    day: state.day,
    shift: state.shift,
    category,
    title,
    detail,
    primarySnapshot: { ...state.primary },
  };
}

function findAbortReason(primary: PrimaryResources): string | null {
  if (primary.lifeSupport <= 0) {
    return 'Life Support reserves dropped to 0% — automated safety protocols triggered an early crew ascent.';
  }
  if (primary.power <= 0) {
    return 'Base Power reserves dropped to 0% — automated safety protocols triggered an early crew ascent.';
  }
  if (primary.shielding <= 0) {
    return 'Radiation Protection (Shielding) dropped to 0% — automated safety protocols triggered an early crew ascent.';
  }
  if (primary.crewReadiness <= 0) {
    return 'Crew Readiness dropped to 0% — automated safety protocols ordered an immediate medical return ascent.';
  }
  return null;
}

function runPostActionInvariants(state: Readonly<GameState>): GameState {
  let next: GameState = state;

  // Step 1: Post-action Active Pump Stall check (Days 2–7)
  if (
    next.day >= 2 &&
    next.flags.farmingMode === 'active_pumps' &&
    !next.flags.activePumpsStalled &&
    next.primary.power < 25
  ) {
    next = applyDeltas(next, { lifeSupport: -15, foodAndSupplies: -15 });
    next = {
      ...next,
      flags: {
        ...next.flags,
        activePumpsStalled: true,
      },
      specialists: {
        ...next.specialists,
        albaraa: { ...next.specialists.albaraa, expression: 'alert' },
        sayed: { ...next.specialists.sayed, expression: 'alert' },
      },
    };
    next = {
      ...next,
      logs: [
        ...next.logs,
        makeLog(
          next,
          'system',
          'Active Hydroponic Pumps Stalled!',
          'Base Power dropped below 25%, tripping Greenhouse circulation breakers (Active Pumps stalled) for -15 Life Support and -15 Food & Supplies.',
        ),
      ],
    };
  }

  // Step 2: Clamp all meters cleanly
  const clamped = clampResources(next.primary, next.sub);
  next = {
    ...next,
    primary: clamped.primary,
    sub: clamped.sub,
  };

  // Step 3: Post-action Zero-Resource Safe Abort check
  const abortMessage = findAbortReason(next.primary);
  if (abortMessage !== null && next.ending !== 'MISSION_FAILURE') {
    next = {
      ...next,
      ending: 'MISSION_FAILURE',
      abortReason: abortMessage,
      activeMiniGame: null,
      commsBlackout: false,
      screenStage: next.screenStage === 'debrief' ? 'debrief' : 'ending_cutscene',
    };
    next = {
      ...next,
      logs: [
        ...next.logs,
        makeLog(next, 'system', 'Automated Safe Abort Triggered', abortMessage),
      ],
    };
  }

  return next;
}

function createDefaultSpecialists(): Record<OnBaseCrewId, SpecialistRuntimeState> {
  return {
    albaraa: {
      id: 'albaraa',
      fatigue: 15,
      assignment: 'station',
      forcedRest: false,
      expression: 'normal',
    },
    omar: {
      id: 'omar',
      fatigue: 15,
      assignment: 'station',
      forcedRest: false,
      expression: 'normal',
    },
    taha: {
      id: 'taha',
      fatigue: 15,
      assignment: 'station',
      forcedRest: false,
      expression: 'normal',
    },
    yassin: {
      id: 'yassin',
      fatigue: 15,
      assignment: 'station',
      forcedRest: false,
      expression: 'normal',
    },
    sayed: {
      id: 'sayed',
      fatigue: 15,
      assignment: 'station',
      forcedRest: false,
      expression: 'normal',
    },
  };
}

function createEmptyFlags(): CompoundingFlags {
  return {
    landingSite: null,
    hardLandingPenaltyApplied: false,
    farmingMode: null,
    activePumpsStalled: false,
    day3Allocation: null,
    hardwareFaultRisk: false,
    unbufferedStormOverloadTriggered: false,
    day4Protocol: null,
    crisisResilience: false,
    day5Protocol: null,
    relayReinforced: false,
    day6Objective: null,
  };
}

export function createInitialGameState(): GameState {
  const primary: PrimaryResources = {
    lifeSupport: 75,
    power: 75,
    shielding: 75,
    crewReadiness: 80,
  };
  const sub: SubResources = {
    crewHealth: 90,
    crewFatigue: 15,
    medicalSupplies: 80,
    foodAndSupplies: 70,
    waterAvailability: 70,
    roverBattery: 80,
    scienceScore: 10,
  };

  return {
    version: 1,
    screenStage: 'opening_cutscene',
    day: 1,
    shift: 'morning',
    clockMinutes: 360,
    clockSpeed: 1,
    primary,
    sub,
    specialists: createDefaultSpecialists(),
    flags: createEmptyFlags(),
    commsBlackout: false,
    day7Stage: 'part_a_degraded',
    rosterConfirmedForDay: false,
    signatureMiniGameCompletedForDay: false,
    anomaly: null,
    eveningDecisionCompletedForDay: false,
    day7StagesCompleted: {
      stage1: false,
      stage2: false,
      stage3: false,
    },
    decisions: [],
    logs: [
      {
        id: 'log-d1-init',
        day: 1,
        shift: 'morning',
        category: 'system',
        title: 'Sol 1 Arrival — Shackleton Approach',
        detail:
          'Mission Commander assumed control of Lunar South Pole Outpost alpha. Earth Control uplink active at 1.3s one-way light-time delay.',
        primarySnapshot: { ...primary },
      },
    ],
    activeMiniGame: null,
    ending: null,
    abortReason: null,
    tutorialStep: 0,
    tutorialCompleted: false,
    muted: false,
  };
}

export function formatClockTime(clockMinutes: number): string {
  const total = Math.max(0, Math.floor(clockMinutes));
  const hours = Math.floor(total / 60) % 24;
  const mins = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function computeMissionEnding(state: Readonly<GameState>): EndingId {
  if (
    state.abortReason !== null ||
    state.primary.lifeSupport <= 0 ||
    state.primary.power <= 0 ||
    state.primary.shielding <= 0 ||
    state.primary.crewReadiness <= 0
  ) {
    return 'MISSION_FAILURE';
  }
  const minPrimary = Math.min(
    state.primary.lifeSupport,
    state.primary.power,
    state.primary.shielding,
    state.primary.crewReadiness,
  );
  if (minPrimary >= 60 && state.sub.scienceScore >= 75) {
    return 'SCIENTIFIC_BREAKTHROUGH';
  }
  if (minPrimary >= 50) {
    return 'MISSION_ACCOMPLISHED';
  }
  return 'CRITICAL_SURVIVAL';
}

function getGradeMeterBonus(grade: MiniGameGrade): { primaryDelta: number; scienceDelta: number } {
  switch (grade) {
    case 'gold':
      return { primaryDelta: 5, scienceDelta: 3 };
    case 'silver':
      return { primaryDelta: 3, scienceDelta: 1 };
    case 'bronze':
      return { primaryDelta: 1, scienceDelta: 0 };
    default: {
      const _exhaustive: never = grade;
      return _exhaustive;
    }
  }
}

function getMiniGamePrimaryMeter(miniGame: MiniGameId): keyof PrimaryResources {
  switch (miniGame) {
    case 'lunar_lander':
    case 'power_grid':
      return 'power';
    case 'greenhouse':
      return 'lifeSupport';
    case 'radiation':
    case 'rover_surface':
      return 'shielding';
    case 'medbay':
      return 'crewReadiness';
    default: {
      const _exhaustive: never = miniGame;
      return _exhaustive;
    }
  }
}

function handleConfirmMorningRoster(state: Readonly<GameState>): GameState {
  if (state.rosterConfirmedForDay) {
    return state;
  }

  const oldMeanFatigue = state.sub.crewFatigue;
  const nextSpecialists: Record<OnBaseCrewId, SpecialistRuntimeState> = {
    albaraa: { ...state.specialists.albaraa },
    omar: { ...state.specialists.omar },
    taha: { ...state.specialists.taha },
    yassin: { ...state.specialists.yassin },
    sayed: { ...state.specialists.sayed },
  };

  let deltaLS = 0;
  let deltaPower = 0;
  let deltaShielding = 0;
  let deltaReadiness = 0;
  let deltaHealth = 0;
  let deltaFood = 0;
  let deltaRover = 0;
  let deltaScience = 0;
  const forcedRestNames: string[] = [];

  for (const id of ON_BASE_CREW_IDS) {
    const spec = nextSpecialists[id];

    // Safety protocol forces rest at >= 90 fatigue
    if (spec.fatigue >= 90) {
      const nextFatigue = clamp(spec.fatigue - 12, 0, 100);
      nextSpecialists[id] = {
        ...spec,
        assignment: 'resting',
        forcedRest: true,
        fatigue: nextFatigue,
        expression: 'worried',
      };
      forcedRestNames.push(id);
      continue;
    }

    if (spec.assignment === 'resting') {
      const nextFatigue = clamp(spec.fatigue - 12, 0, 100);
      nextSpecialists[id] = {
        ...spec,
        forcedRest: false,
        fatigue: nextFatigue,
        expression: 'happy',
      };
      continue;
    }

    // Working on station
    const isHalfOutput = spec.fatigue >= 70;
    const scale = (amount: number): number => (isHalfOutput ? Math.ceil(amount / 2) : amount);

    switch (id) {
      case 'albaraa':
        deltaPower += scale(5);
        break;
      case 'omar':
        deltaReadiness += scale(5);
        deltaHealth += scale(4);
        break;
      case 'taha':
        deltaShielding += scale(4);
        deltaScience += scale(4);
        break;
      case 'yassin':
        deltaRover += scale(8);
        deltaShielding += scale(3);
        break;
      case 'sayed':
        deltaLS += scale(5);
        deltaFood += scale(4);
        deltaScience += scale(5);
        break;
      default: {
        const _exhaustive: never = id;
        void _exhaustive;
      }
    }

    const workFatigue =
      id === 'sayed' && state.flags.farmingMode === 'capillary_ponds' ? 10 : 6;
    const nextFatigue = clamp(spec.fatigue + workFatigue, 0, 100);
    nextSpecialists[id] = {
      ...spec,
      forcedRest: false,
      fatigue: nextFatigue,
      expression: nextFatigue >= 70 ? 'concerned' : 'focused',
    };
  }

  const newMeanFatigue = computeMeanFatigue(nextSpecialists);
  const deltaMeanFatigue = newMeanFatigue - oldMeanFatigue;
  const fatigueReadinessCoupling = Math.round(-0.5 * deltaMeanFatigue);

  let next: GameState = {
    ...state,
    specialists: nextSpecialists,
    rosterConfirmedForDay: true,
  };

  next = applyDeltas(next, {
    lifeSupport: deltaLS,
    power: deltaPower,
    shielding: deltaShielding,
    crewReadiness: deltaReadiness + fatigueReadinessCoupling,
    crewHealth: deltaHealth,
    foodAndSupplies: deltaFood,
    roverBattery: deltaRover,
    scienceScore: deltaScience,
  });

  next = {
    ...next,
    sub: {
      ...next.sub,
      crewFatigue: newMeanFatigue,
    },
    logs: [
      ...next.logs,
      makeLog(
        next,
        'system',
        `Sol ${next.day} Morning Duty Roster Locked`,
        forcedRestNames.length > 0
          ? `Station bonuses applied. Safety protocol forced rest for exhausted crew (${forcedRestNames.join(', ')}).`
          : 'All specialist station assignments confirmed for Morning Shift.',
      ),
    ],
  };

  return runPostActionInvariants(next);
}

function handleStartOfDayTick(state: Readonly<GameState>): GameState {
  let next: GameState = state;
  const notes: string[] = [];

  // Step 3a: Multi-day Compounding Modifiers
  if (next.flags.landingSite === 'sunlit_ridge') {
    next = applyDeltas(next, { power: 6 });
    notes.push('Sunlit Ridge solar arrays (+6 Power)');
  } else if (next.flags.landingSite === 'crater_shadow') {
    next = applyDeltas(next, { power: -4 });
    notes.push('Crater Shadow reduced sunlight (-4 Power)');
  }

  if (next.day >= 3) {
    if (next.flags.farmingMode === 'active_pumps' && !next.flags.activePumpsStalled) {
      next = applyDeltas(next, { power: -8, lifeSupport: 8, foodAndSupplies: 8 });
      notes.push('Active Hydroponics (-8 Power, +8 Life Support, +8 Food)');
    } else if (next.flags.farmingMode === 'capillary_ponds' && next.day <= 6) {
      next = applyDeltas(next, {
        lifeSupport: 3,
        crewFatigue: 8,
        crewReadiness: -6,
      });
      notes.push('Capillary PONDS tending (+3 Life Support, +8 Fatigue, -6 Readiness)');
    }
  }

  if (next.flags.day3Allocation === 'battery_storage') {
    if (next.day === 4) {
      next = applyDeltas(next, { crewFatigue: 15 });
      notes.push('Cold overnight cabin from Sol 3 Battery priority (+15 Crew Fatigue)');
    } else if (next.day === 5) {
      next = applyDeltas(next, { crewHealth: -6 });
      notes.push('Chilled cabin strain entering Medbay Sol 5 (-6 Crew Health)');
    }
  }

  if (next.day === 5 && next.flags.day4Protocol === 'partial_shielding') {
    next = applyDeltas(next, { medicalSupplies: -10 });
    notes.push('Sol 4 radiation exposure medical response (-10 Medical Supplies)');
  }

  if (next.day === 7) {
    if (next.flags.day5Protocol === 'full_rest' && next.flags.crisisResilience) {
      next = applyDeltas(next, { crewReadiness: 5 });
      notes.push('Sol 5 Full Rest Crisis Resilience (+5 Crew Readiness)');
    } else if (next.flags.day5Protocol === 'rationed_split_shift') {
      next = applyDeltas(next, { crewReadiness: -8 });
      notes.push('Lingering split-shift fatigue (-8 Crew Readiness)');
    }
  }

  // Step 3b: Sub-Resource Cliff Coupling
  if (next.sub.waterAvailability < 30 || next.sub.foodAndSupplies < 30) {
    next = applyDeltas(next, { lifeSupport: -5 });
    notes.push('Low water/food scarcity strain (-5 Life Support)');
  } else if (next.sub.waterAvailability >= 75 && next.sub.foodAndSupplies >= 75) {
    next = applyDeltas(next, { lifeSupport: 2 });
    notes.push('Healthy water & food surplus (+2 Life Support)');
  }

  if (next.sub.crewHealth < 50) {
    next = applyDeltas(next, { crewReadiness: -5 });
    notes.push('Crew medical strain (-5 Crew Readiness)');
  }

  if (next.sub.crewFatigue > 65) {
    next = applyDeltas(next, { crewReadiness: -5 });
    notes.push('Elevated crew exhaustion (-5 Crew Readiness)');
  }

  if (notes.length > 0) {
    next = {
      ...next,
      logs: [
        ...next.logs,
        makeLog(next, 'system', `Sol ${next.day} 06:00 Compounding Update`, notes.join('; ')),
      ],
    };
  }

  return runPostActionInvariants(next);
}

function enterMiddayShift(state: Readonly<GameState>): GameState {
  let next: GameState = state;
  if (!next.rosterConfirmedForDay) {
    next = handleConfirmMorningRoster(next);
    if (next.ending === 'MISSION_FAILURE') {
      return next;
    }
  }

  const scenario = DAILY_SCENARIOS[next.day];
  const isDay7 = next.day === 7;
  next = {
    ...next,
    shift: 'midday',
    clockMinutes: 720,
    commsBlackout: isDay7 ? true : next.commsBlackout,
    day7Stage: isDay7 ? 'part_b_blackout' : next.day7Stage,
    anomaly: {
      ...scenario.anomaly,
      resolved: false,
      ignoredPenaltyApplied: false,
    },
  };

  if (isDay7) {
    next = {
      ...next,
      logs: [
        ...next.logs,
        makeLog(
          next,
          'comms',
          'COMMS BLACKOUT ACTIVE — Loss of Signal',
          'Solar radio burst noise severed Earth Mission Control uplink (Earth Comms Blackout active). Crew must operate autonomously!',
        ),
      ],
    };
  }

  return next;
}

function enterEveningShift(state: Readonly<GameState>): GameState {
  let next: GameState = state;

  // Apply -8 Primary penalty if Midday Anomaly was left unrepaired
  const pendingAnomaly = next.anomaly;
  if (pendingAnomaly && !pendingAnomaly.resolved && !pendingAnomaly.ignoredPenaltyApplied) {
    const meter = pendingAnomaly.affectedMeter;
    const penaltyDeltas: ResourceDeltas = { [meter]: -8 };
    next = applyDeltas(next, penaltyDeltas);
    next = {
      ...next,
      anomaly: {
        ...pendingAnomaly,
        ignoredPenaltyApplied: true,
      },
      logs: [
        ...next.logs,
        makeLog(
          next,
          'anomaly',
          `Unrepaired Anomaly: ${pendingAnomaly.title}`,
          `Left unrepaired at end of Midday Shift (-8 ${meter}).`,
        ),
      ],
    };
    next = runPostActionInvariants(next);
    if (next.ending === 'MISSION_FAILURE') {
      return next;
    }
  }

  const isDay7 = next.day === 7;
  const enteringDay7Stage1FirstTime =
    isDay7 &&
    next.shift !== 'evening' &&
    !next.day7StagesCompleted.stage1 &&
    next.day7Stage !== 'part_c_stage1';

  next = {
    ...next,
    shift: 'evening',
    clockMinutes: 1020,
    day7Stage: isDay7 ? 'part_c_stage1' : next.day7Stage,
  };

  // Compounding crisis strike upon entering Day 7 Part C Stage 1
  if (enteringDay7Stage1FirstTime) {
    const crisisNotes: string[] = [];
    if (next.flags.hardwareFaultRisk) {
      next = applyDeltas(next, { power: -10 });
      crisisNotes.push('Sol 3 Overclock fault surged main bus (-10 Power)');
    }
    if (next.flags.activePumpsStalled) {
      next = applyDeltas(next, { lifeSupport: -8 });
      crisisNotes.push('Stalled Hydroponics reduced biosphere O2 (-8 Life Support)');
    }
    if (crisisNotes.length > 0) {
      next = {
        ...next,
        logs: [
          ...next.logs,
          makeLog(
            next,
            'system',
            'Sol 7 Compounding Crisis Impact',
            crisisNotes.join('; '),
          ),
        ],
      };
      next = runPostActionInvariants(next);
    }
  }

  return next;
}

function findChoiceSpec(day: DayNumber, choiceId: ChoiceId) {
  const scenarioOption = DAILY_SCENARIOS[day].options.find((opt) => opt.choiceId === choiceId);
  if (scenarioOption) {
    return scenarioOption;
  }
  for (const stage of [1, 2, 3] as const) {
    const found = DAY7_STAGE_SPECS[stage].options.find((opt) => opt.choiceId === choiceId);
    if (found) {
      return found;
    }
  }
  return null;
}

function applyDay1To6EveningDecision(
  state: Readonly<GameState>,
  choiceId: ChoiceId,
): GameState {
  if (state.eveningDecisionCompletedForDay) {
    return state;
  }

  const spec = findChoiceSpec(state.day, choiceId);
  const title = spec?.label ?? choiceId;
  const summary = spec?.shortSummary ?? '';
  const compoundingNote = spec?.compoundingSummary ?? '';

  let next: GameState = state;
  let appliedDeltas: ResourceDeltas = spec?.immediateDeltas ?? {};

  switch (choiceId) {
    case '1A_sunlit_ridge': {
      next = {
        ...next,
        flags: { ...next.flags, landingSite: 'sunlit_ridge' },
      };
      appliedDeltas = { power: 10, waterAvailability: -10, lifeSupport: -5 };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '1B_crater_shadow': {
      next = {
        ...next,
        flags: { ...next.flags, landingSite: 'crater_shadow' },
      };
      appliedDeltas = { power: -10, waterAvailability: 15, lifeSupport: 10 };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '2A_active_pumps': {
      next = {
        ...next,
        flags: { ...next.flags, farmingMode: 'active_pumps' },
      };
      appliedDeltas = {
        power: -10,
        waterAvailability: -10,
        foodAndSupplies: 15,
        lifeSupport: 10,
        scienceScore: 10,
      };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '2B_capillary_ponds': {
      next = {
        ...next,
        flags: { ...next.flags, farmingMode: 'capillary_ponds' },
      };
      appliedDeltas = {
        power: 0,
        waterAvailability: -5,
        foodAndSupplies: 6,
        lifeSupport: 5,
        scienceScore: 10,
      };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '3A_essential_heating': {
      next = {
        ...next,
        flags: { ...next.flags, day3Allocation: 'essential_heating' },
        sub: {
          ...next.sub,
          roverBattery: Math.min(next.sub.roverBattery, 55),
        },
      };
      appliedDeltas = { lifeSupport: 10, crewReadiness: 5, power: -10 };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '3B_battery_storage': {
      next = {
        ...next,
        flags: { ...next.flags, day3Allocation: 'battery_storage' },
        sub: {
          ...next.sub,
          roverBattery: 100,
        },
      };
      appliedDeltas = {
        power: 15,
        scienceScore: 20,
        lifeSupport: -12,
        crewReadiness: -8,
      };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '3C_overclock_regulators': {
      next = {
        ...next,
        flags: {
          ...next.flags,
          day3Allocation: 'overclock_regulators',
          hardwareFaultRisk: true,
        },
      };
      appliedDeltas = {
        power: 10,
        lifeSupport: 5,
        scienceScore: 10,
        crewFatigue: 15,
        crewReadiness: -10,
      };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '4A_max_shielding': {
      const siteShieldMod =
        next.flags.landingSite === 'crater_shadow'
          ? 10
          : next.flags.landingSite === 'sunlit_ridge'
            ? -10
            : 0;
      const isUnbufferedStormOverload =
        next.flags.farmingMode === 'active_pumps' &&
        next.flags.day3Allocation !== 'battery_storage';

      if (isUnbufferedStormOverload) {
        const rawOverloaded = Math.min(next.primary.power - 45, 20);
        const overloadedPower =
          next.primary.power >= 35
            ? Math.max(10, rawOverloaded)
            : Math.max(0, rawOverloaded);
        const powerDelta = overloadedPower - next.primary.power;

        appliedDeltas = {
          shielding: 15 + siteShieldMod,
          crewReadiness: 5,
          power: powerDelta,
        };
        next = {
          ...next,
          flags: {
            ...next.flags,
            day4Protocol: 'max_shielding',
            unbufferedStormOverloadTriggered: true,
          },
        };
        next = applyDeltas(next, appliedDeltas);
      } else {
        appliedDeltas = {
          shielding: 15 + siteShieldMod,
          crewReadiness: 5,
          power: -25,
        };
        next = {
          ...next,
          flags: {
            ...next.flags,
            day4Protocol: 'max_shielding',
          },
        };
        next = applyDeltas(next, appliedDeltas);
      }
      break;
    }
    case '4B_partial_shielding': {
      const siteShieldMod =
        next.flags.landingSite === 'crater_shadow'
          ? 10
          : next.flags.landingSite === 'sunlit_ridge'
            ? -10
            : 0;
      appliedDeltas = {
        power: -10,
        scienceScore: 15,
        shielding: -20 + siteShieldMod,
        crewReadiness: -15,
        crewHealth: -12,
      };
      next = {
        ...next,
        flags: { ...next.flags, day4Protocol: 'partial_shielding' },
      };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '5A_full_rest': {
      appliedDeltas = {
        crewHealth: 20,
        crewFatigue: -30,
        crewReadiness: 25,
        medicalSupplies: -25,
        lifeSupport: -5,
        shielding: -8,
      };
      next = {
        ...next,
        flags: {
          ...next.flags,
          day5Protocol: 'full_rest',
          crisisResilience: true,
        },
      };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '5B_rationed_split_shift': {
      appliedDeltas = {
        crewHealth: 8,
        crewFatigue: -10,
        crewReadiness: 8,
        medicalSupplies: -5,
        scienceScore: 10,
      };
      next = {
        ...next,
        flags: {
          ...next.flags,
          day5Protocol: 'rationed_split_shift',
          crisisResilience: false,
        },
      };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '6A_crater_ice': {
      appliedDeltas = {
        waterAvailability: 25,
        lifeSupport: 15,
        scienceScore: 25,
        power: -15,
        roverBattery: -45,
      };
      next = {
        ...next,
        flags: {
          ...next.flags,
          day6Objective: 'crater_ice_extraction',
          relayReinforced: false,
        },
      };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    case '6B_comms_maintenance': {
      appliedDeltas = {
        power: 15,
        shielding: 10,
        scienceScore: 5,
        roverBattery: -25,
      };
      next = {
        ...next,
        flags: {
          ...next.flags,
          day6Objective: 'comms_solar_maintenance',
          relayReinforced: true,
        },
      };
      next = applyDeltas(next, appliedDeltas);
      break;
    }
    default:
      return state;
  }

  const record: DecisionRecord = {
    day: next.day,
    choiceId,
    title,
    summary,
    immediateDeltas: appliedDeltas,
    compoundingNote,
    timestampMinutes: next.clockMinutes,
  };

  next = {
    ...next,
    eveningDecisionCompletedForDay: true,
    decisions: [...next.decisions, record],
    logs: [
      ...next.logs,
      makeLog(next, 'decision', `Sol ${next.day} Decision: ${title}`, compoundingNote || summary),
    ],
  };

  return runPostActionInvariants(next);
}

function applyDay7StageDecision(
  state: Readonly<GameState>,
  stage: 1 | 2 | 3,
  choiceId: ChoiceId,
): GameState {
  const stageSpec = DAY7_STAGE_SPECS[stage];
  const optionSpec = stageSpec.options.find((o) => o.choiceId === choiceId);
  if (!optionSpec) {
    return state;
  }

  if (stage === 1 && state.day7StagesCompleted.stage1) return state;
  if (stage === 2 && state.day7StagesCompleted.stage2) return state;
  if (stage === 3 && state.day7StagesCompleted.stage3) return state;

  // Enforce explicit stage resource preconditions
  if (optionSpec.requires && !optionSpec.requires.check(state)) {
    return state;
  }

  let next: GameState = state;
  let deltas: ResourceDeltas = optionSpec.immediateDeltas;
  let nextStage: Day7Stage = next.day7Stage;

  switch (choiceId) {
    case '7_1A_rover_bus_tap': {
      deltas = { roverBattery: -35, power: 15, lifeSupport: 5 };
      next = applyDeltas(next, deltas);
      nextStage = 'part_c_stage2';
      break;
    }
    case '7_1B_manual_bypass': {
      deltas = {
        power: 5,
        crewReadiness: -10,
        crewFatigue: 10,
        shielding: next.flags.hardwareFaultRisk ? -8 : 0,
      };
      next = applyDeltas(next, deltas);
      nextStage = 'part_c_stage2';
      break;
    }
    case '7_2A_medbay_o2_divert': {
      deltas = {
        medicalSupplies: -20,
        lifeSupport: 15,
        crewReadiness: 10 + (next.flags.crisisResilience ? 5 : 0),
        scienceScore: 10,
      };
      next = applyDeltas(next, deltas);
      nextStage = 'part_c_stage3';
      break;
    }
    case '7_2B_seal_greenhouse': {
      deltas = {
        lifeSupport: 5,
        foodAndSupplies: -15,
        crewReadiness: -8,
        scienceScore: -5,
      };
      next = applyDeltas(next, deltas);
      nextStage = 'part_c_stage3';
      break;
    }
    case '7_3A_phased_array_lock': {
      deltas = next.flags.relayReinforced
        ? { power: 10, shielding: 10, scienceScore: 15 }
        : { power: -15, shielding: 5, scienceScore: 10 };
      next = applyDeltas(next, deltas);
      nextStage = 'part_d_recovery';
      break;
    }
    case '7_3B_emergency_beacon': {
      deltas = { power: -5, shielding: 5, crewReadiness: 5, scienceScore: 0 };
      next = applyDeltas(next, deltas);
      nextStage = 'part_d_recovery';
      break;
    }
    default:
      return state;
  }

  const record: DecisionRecord = {
    day: 7,
    stage,
    choiceId,
    title: optionSpec.label,
    summary: optionSpec.shortSummary,
    immediateDeltas: deltas,
    compoundingNote: optionSpec.compoundingSummary,
    timestampMinutes: next.clockMinutes,
  };

  const completedFlags = {
    stage1: stage === 1 ? true : next.day7StagesCompleted.stage1,
    stage2: stage === 2 ? true : next.day7StagesCompleted.stage2,
    stage3: stage === 3 ? true : next.day7StagesCompleted.stage3,
  };

  const recoveredComms = stage === 3;

  next = {
    ...next,
    day7Stage: nextStage,
    day7StagesCompleted: completedFlags,
    eveningDecisionCompletedForDay: recoveredComms,
    commsBlackout: recoveredComms ? false : next.commsBlackout,
    decisions: [...next.decisions, record],
    logs: [
      ...next.logs,
      makeLog(
        next,
        recoveredComms ? 'comms' : 'decision',
        `Sol 7 Stage ${stage}: ${optionSpec.label}`,
        recoveredComms
          ? `${optionSpec.compoundingSummary} Carrier wave restored — Abdul back online!`
          : optionSpec.compoundingSummary,
      ),
    ],
  };

  next = runPostActionInvariants(next);

  if (recoveredComms && next.ending === null) {
    next = {
      ...next,
      ending: computeMissionEnding(next),
    };
  }

  return next;
}

export function transitionGameState(
  state: Readonly<GameState>,
  action: GameAction,
): GameState {
  switch (action.kind) {
    case 'START_NEW_MISSION':
      return createInitialGameState();

    case 'FINISH_OPENING_CUTSCENE':
      return {
        ...state,
        screenStage: state.tutorialCompleted ? 'gameplay' : 'tutorial',
        tutorialStep: 0,
      };

    case 'SET_TUTORIAL_STEP':
      return {
        ...state,
        tutorialStep: clamp(action.step, 0, 5),
      };

    case 'COMPLETE_TUTORIAL':
      return {
        ...state,
        screenStage: 'gameplay',
        tutorialCompleted: true,
        tutorialStep: 5,
      };

    case 'RESTART_TUTORIAL':
      return {
        ...state,
        screenStage: 'tutorial',
        tutorialStep: 0,
      };

    case 'SET_CLOCK_SPEED':
      return {
        ...state,
        clockSpeed: action.speed,
      };

    case 'TICK_CLOCK': {
      if (
        state.screenStage !== 'gameplay' ||
        state.clockSpeed === 0 ||
        state.activeMiniGame !== null ||
        state.ending !== null
      ) {
        return state;
      }
      const delta = Math.max(0, action.deltaMinutes);
      const shiftCeiling =
        state.shift === 'morning' ? 720 : state.shift === 'midday' ? 1020 : 1320;
      const nextMinutes = Math.min(shiftCeiling, state.clockMinutes + delta);
      if (nextMinutes === state.clockMinutes) {
        return state;
      }
      return {
        ...state,
        clockMinutes: nextMinutes,
      };
    }

    case 'SET_SPECIALIST_ASSIGNMENT': {
      const current = state.specialists[action.crewId];
      if (action.assignment === 'station' && current.fatigue >= 90) {
        return {
          ...state,
          specialists: {
            ...state.specialists,
            [action.crewId]: {
              ...current,
              assignment: 'resting',
              forcedRest: true,
              expression: 'worried',
            },
          },
        };
      }
      return {
        ...state,
        specialists: {
          ...state.specialists,
          [action.crewId]: {
            ...current,
            assignment: action.assignment,
            forcedRest: false,
            expression: action.assignment === 'resting' ? 'happy' : 'normal',
          },
        },
      };
    }

    case 'CONFIRM_MORNING_ROSTER':
      return handleConfirmMorningRoster(state);

    case 'OPEN_MINIGAME':
      return {
        ...state,
        activeMiniGame: action.miniGame,
      };

    case 'COMPLETE_MINIGAME': {
      const shouldReward =
        state.day < 7
          ? !state.signatureMiniGameCompletedForDay
          : state.shift === 'morning'
            ? !state.signatureMiniGameCompletedForDay
            : state.shift === 'evening';

      let next: GameState = {
        ...state,
        activeMiniGame: null,
        signatureMiniGameCompletedForDay:
          state.shift === 'morning' ? true : state.signatureMiniGameCompletedForDay,
      };

      if (action.miniGame === 'lunar_lander') {
        if (action.landingSite) {
          next = {
            ...next,
            flags: { ...next.flags, landingSite: action.landingSite },
          };
        }
        if (
          action.touchdownVelocity !== undefined &&
          action.touchdownVelocity >= 3.0 &&
          !next.flags.hardLandingPenaltyApplied
        ) {
          next = applyDeltas(next, { shielding: -10 });
          next = {
            ...next,
            flags: { ...next.flags, hardLandingPenaltyApplied: true },
            logs: [
              ...next.logs,
              makeLog(
                next,
                'minigame',
                'Hard Touchdown Shock (>= 3.0 m/s)',
                `Descent speed of ${action.touchdownVelocity.toFixed(1)} m/s stressed landing struts (-10 Shielding).`,
              ),
            ],
          };
        }
      }

      if (shouldReward) {
        const { primaryDelta, scienceDelta } = getGradeMeterBonus(action.grade);
        const meter = getMiniGamePrimaryMeter(action.miniGame);
        const extraScience = Math.max(0, Math.round(action.bonusScience ?? 0));
        next = applyDeltas(next, {
          [meter]: primaryDelta,
          scienceScore: scienceDelta + extraScience,
        });
        next = {
          ...next,
          logs: [
            ...next.logs,
            makeLog(
              next,
              'minigame',
              `Station Console (${action.miniGame}) — ${action.grade.toUpperCase()}`,
              `Earned +${primaryDelta} ${meter} and +${scienceDelta + extraScience} Science Score.`,
            ),
          ],
        };
      }

      return runPostActionInvariants(next);
    }

    case 'REPAIR_MIDDAY_ANOMALY': {
      if (!state.anomaly || state.anomaly.resolved) {
        return state;
      }
      const { primaryDelta, scienceDelta } = getGradeMeterBonus(action.grade);
      const meter = state.anomaly.affectedMeter;
      let next = applyDeltas(state, {
        [meter]: primaryDelta,
        scienceScore: scienceDelta,
      });
      next = {
        ...next,
        anomaly: {
          ...state.anomaly,
          resolved: true,
        },
        logs: [
          ...next.logs,
          makeLog(
            next,
            'anomaly',
            `Repaired: ${state.anomaly.title}`,
            `Completed repair (${action.grade.toUpperCase()}): +${primaryDelta} ${meter}, +${scienceDelta} Science Score.`,
          ),
        ],
      };
      return runPostActionInvariants(next);
    }

    case 'APPLY_EVENING_DECISION': {
      if (action.choiceId.startsWith('7_1')) {
        return applyDay7StageDecision(state, 1, action.choiceId);
      }
      if (action.choiceId.startsWith('7_2')) {
        return applyDay7StageDecision(state, 2, action.choiceId);
      }
      if (action.choiceId.startsWith('7_3')) {
        return applyDay7StageDecision(state, 3, action.choiceId);
      }
      return applyDay1To6EveningDecision(state, action.choiceId);
    }

    case 'ADVANCE_DAY7_SUBSTAGE': {
      if (state.day !== 7) {
        return state;
      }
      if (action.stage === 'part_b_blackout') {
        return enterMiddayShift(state);
      }
      if (action.stage === 'part_c_stage1') {
        return enterEveningShift(state);
      }
      if (action.stage === 'part_d_recovery') {
        const recovered: GameState = {
          ...state,
          day7Stage: 'part_d_recovery',
          commsBlackout: false,
          eveningDecisionCompletedForDay: true,
        };
        return {
          ...recovered,
          ending: recovered.ending ?? computeMissionEnding(recovered),
        };
      }
      return {
        ...state,
        day7Stage: action.stage,
      };
    }

    case 'APPLY_DAY7_STAGE_DECISION':
      return applyDay7StageDecision(state, action.stage, action.choiceId);

    case 'ADVANCE_SHIFT': {
      if (state.ending === 'MISSION_FAILURE') {
        return state;
      }
      if (state.shift === 'morning') {
        return enterMiddayShift(state);
      }
      if (state.shift === 'midday') {
        return enterEveningShift(state);
      }
      // Evening -> next day morning (Days 1–6) or Ending Cutscene (Day 7)
      if (state.day < 7) {
        const nextDayNum = state.day + 1;
        const nextDay: DayNumber =
          nextDayNum === 2
            ? 2
            : nextDayNum === 3
              ? 3
              : nextDayNum === 4
                ? 4
                : nextDayNum === 5
                  ? 5
                  : nextDayNum === 6
                    ? 6
                    : 7;

        const nextState: GameState = {
          ...state,
          day: nextDay,
          shift: 'morning',
          clockMinutes: 360,
          rosterConfirmedForDay: false,
          signatureMiniGameCompletedForDay: false,
          anomaly: null,
          eveningDecisionCompletedForDay: false,
          day7Stage: nextDay === 7 ? 'part_a_degraded' : state.day7Stage,
        };
        return handleStartOfDayTick(nextState);
      }

      // Day 7 evening -> Ending Cutscene
      const finalEnding = state.ending ?? computeMissionEnding(state);
      return {
        ...state,
        commsBlackout: false,
        day7Stage: 'part_d_recovery',
        ending: finalEnding,
        screenStage: 'ending_cutscene',
      };
    }

    case 'TRIGGER_ENDING_FROM_CUTSCENE': {
      if (state.screenStage === 'ending_cutscene') {
        return {
          ...state,
          screenStage: 'debrief',
        };
      }
      const computed = state.ending ?? computeMissionEnding(state);
      return {
        ...state,
        commsBlackout: false,
        day7Stage: 'part_d_recovery',
        ending: computed,
        screenStage: 'ending_cutscene',
      };
    }

    case 'OPEN_DEBRIEF':
      return {
        ...state,
        ending: state.ending ?? computeMissionEnding(state),
        screenStage: 'debrief',
      };

    case 'REPLAY_ENDING_CUTSCENE':
      return {
        ...state,
        ending: state.ending ?? computeMissionEnding(state),
        screenStage: 'ending_cutscene',
      };

    case 'JUMP_TO_TARGET':
      return createPresetGameState(action.target);

    case 'SET_MUTED':
      return {
        ...state,
        muted: action.muted,
      };

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

interface ReplayDayConfig {
  choiceId: ChoiceId;
  grade?: MiniGameGrade;
  touchdownVelocity?: number;
  repairAnomaly?: boolean;
  restCrewIds?: OnBaseCrewId[];
}

function runReplayDay(
  state: Readonly<GameState>,
  config: ReplayDayConfig,
): GameState {
  if (state.ending === 'MISSION_FAILURE') {
    return state;
  }

  const grade: MiniGameGrade = config.grade ?? 'silver';
  let next: GameState = state;

  // Auto-rest exhausted crew or explicitly requested crew
  for (const id of ON_BASE_CREW_IDS) {
    const shouldRest =
      (config.restCrewIds && config.restCrewIds.includes(id)) ||
      next.specialists[id].fatigue >= 70;
    next = transitionGameState(next, {
      kind: 'SET_SPECIALIST_ASSIGNMENT',
      crewId: id,
      assignment: shouldRest ? 'resting' : 'station',
    });
  }

  next = transitionGameState(next, { kind: 'CONFIRM_MORNING_ROSTER' });
  if (next.ending === 'MISSION_FAILURE') return next;

  const scenario = DAILY_SCENARIOS[next.day];
  next = transitionGameState(next, {
    kind: 'COMPLETE_MINIGAME',
    miniGame: scenario.signatureMiniGame,
    grade,
    touchdownVelocity: config.touchdownVelocity,
  });
  if (next.ending === 'MISSION_FAILURE') return next;

  next = transitionGameState(next, { kind: 'ADVANCE_SHIFT' });
  if (next.ending === 'MISSION_FAILURE') return next;

  if (config.repairAnomaly ?? true) {
    next = transitionGameState(next, { kind: 'REPAIR_MIDDAY_ANOMALY', grade });
    if (next.ending === 'MISSION_FAILURE') return next;
  }

  next = transitionGameState(next, { kind: 'ADVANCE_SHIFT' });
  if (next.ending === 'MISSION_FAILURE') return next;

  if (next.day < 7) {
    next = transitionGameState(next, {
      kind: 'APPLY_EVENING_DECISION',
      choiceId: config.choiceId,
    });
    if (next.ending === 'MISSION_FAILURE') return next;

    next = transitionGameState(next, { kind: 'ADVANCE_SHIFT' });
  }

  return next;
}

function runReplayDay7(
  state: Readonly<GameState>,
  stageChoices: { stage1: ChoiceId; stage2: ChoiceId; stage3: ChoiceId },
  grade: MiniGameGrade = 'silver',
  repairAnomaly = true,
): GameState {
  if (state.ending === 'MISSION_FAILURE') {
    return state;
  }
  let next: GameState = state;

  for (const id of ON_BASE_CREW_IDS) {
    const shouldRest = next.specialists[id].fatigue >= 70;
    next = transitionGameState(next, {
      kind: 'SET_SPECIALIST_ASSIGNMENT',
      crewId: id,
      assignment: shouldRest ? 'resting' : 'station',
    });
  }

  next = transitionGameState(next, { kind: 'CONFIRM_MORNING_ROSTER' });
  if (next.ending === 'MISSION_FAILURE') return next;

  next = transitionGameState(next, {
    kind: 'COMPLETE_MINIGAME',
    miniGame: DAILY_SCENARIOS[7].signatureMiniGame,
    grade,
  });
  if (next.ending === 'MISSION_FAILURE') return next;

  next = transitionGameState(next, { kind: 'ADVANCE_SHIFT' });
  if (next.ending === 'MISSION_FAILURE') return next;

  if (repairAnomaly) {
    next = transitionGameState(next, { kind: 'REPAIR_MIDDAY_ANOMALY', grade });
    if (next.ending === 'MISSION_FAILURE') return next;
  }

  next = transitionGameState(next, { kind: 'ADVANCE_SHIFT' });
  if (next.ending === 'MISSION_FAILURE') return next;

  // Stage 1
  const s1Choice =
    stageChoices.stage1 === '7_1A_rover_bus_tap' && next.sub.roverBattery < 30
      ? '7_1B_manual_bypass'
      : stageChoices.stage1;
  next = transitionGameState(next, {
    kind: 'APPLY_DAY7_STAGE_DECISION',
    stage: 1,
    choiceId: s1Choice,
  });
  if (next.ending === 'MISSION_FAILURE') return next;

  // Stage 2
  const s2Choice =
    stageChoices.stage2 === '7_2A_medbay_o2_divert' && next.sub.medicalSupplies < 20
      ? '7_2B_seal_greenhouse'
      : stageChoices.stage2;
  next = transitionGameState(next, {
    kind: 'APPLY_DAY7_STAGE_DECISION',
    stage: 2,
    choiceId: s2Choice,
  });
  if (next.ending === 'MISSION_FAILURE') return next;

  // Stage 3
  next = transitionGameState(next, {
    kind: 'APPLY_DAY7_STAGE_DECISION',
    stage: 3,
    choiceId: stageChoices.stage3,
  });

  if (next.ending !== 'MISSION_FAILURE') {
    next = transitionGameState(next, { kind: 'ADVANCE_SHIFT' });
  }

  return next;
}

const DEFAULT_REPLAY_CHOICES: {
  day1: ChoiceId;
  day2: ChoiceId;
  day3: ChoiceId;
  day4: ChoiceId;
  day5: ChoiceId;
  day6: ChoiceId;
  stage1: ChoiceId;
  stage2: ChoiceId;
  stage3: ChoiceId;
} = {
  day1: '1A_sunlit_ridge',
  day2: '2A_active_pumps',
  day3: '3A_essential_heating',
  day4: '4A_max_shielding',
  day5: '5A_full_rest',
  day6: '6B_comms_maintenance',
  stage1: '7_1A_rover_bus_tap',
  stage2: '7_2A_medbay_o2_divert',
  stage3: '7_3A_phased_array_lock',
};

export function simulateWhatIfTimeline(
  baseHistory: DecisionRecord[],
  overrides: Record<number, ChoiceId>,
): WhatIfResult {
  const fromHistory = (day: DayNumber, stage?: 1 | 2 | 3): ChoiceId | undefined => {
    const found = baseHistory.find((rec) =>
      stage !== undefined ? rec.day === 7 && rec.stage === stage : rec.day === day,
    );
    return found?.choiceId;
  };

  const choices: Record<1 | 2 | 3 | 4 | 5 | 6, ChoiceId> = {
    1: overrides[1] ?? fromHistory(1) ?? DEFAULT_REPLAY_CHOICES.day1,
    2: overrides[2] ?? fromHistory(2) ?? DEFAULT_REPLAY_CHOICES.day2,
    3: overrides[3] ?? fromHistory(3) ?? DEFAULT_REPLAY_CHOICES.day3,
    4: overrides[4] ?? fromHistory(4) ?? DEFAULT_REPLAY_CHOICES.day4,
    5: overrides[5] ?? fromHistory(5) ?? DEFAULT_REPLAY_CHOICES.day5,
    6: overrides[6] ?? fromHistory(6) ?? DEFAULT_REPLAY_CHOICES.day6,
  };
  const stageChoices = {
    stage1: overrides[71] ?? fromHistory(7, 1) ?? DEFAULT_REPLAY_CHOICES.stage1,
    stage2: overrides[72] ?? fromHistory(7, 2) ?? DEFAULT_REPLAY_CHOICES.stage2,
    stage3: overrides[73] ?? fromHistory(7, 3) ?? DEFAULT_REPLAY_CHOICES.stage3,
  };

  let state = transitionGameState(createInitialGameState(), { kind: 'COMPLETE_TUTORIAL' });
  const daySnapshots: WhatIfResult['daySnapshots'] = [];

  for (const day of [1, 2, 3, 4, 5, 6] as const) {
    if (state.ending === 'MISSION_FAILURE') {
      break;
    }
    const chosen = choices[day];
    state = runReplayDay(state, { choiceId: chosen, grade: 'silver' });
    const latest = state.decisions[state.decisions.length - 1];
    daySnapshots.push({
      day,
      choiceId: latest?.choiceId ?? chosen,
      title: latest?.title ?? chosen,
      primary: { ...state.primary },
      scienceScore: state.sub.scienceScore,
      note:
        state.ending === 'MISSION_FAILURE'
          ? state.abortReason ?? 'Safe Abort triggered'
          : latest?.compoundingNote ?? '',
    });
  }

  if (state.ending !== 'MISSION_FAILURE') {
    state = runReplayDay7(state, stageChoices, 'silver', true);
    const latest = state.decisions[state.decisions.length - 1];
    daySnapshots.push({
      day: 7,
      choiceId: latest?.choiceId ?? stageChoices.stage3,
      title: 'Sol 7 Autonomous Recovery',
      primary: { ...state.primary },
      scienceScore: state.sub.scienceScore,
      note:
        state.ending === 'MISSION_FAILURE'
          ? state.abortReason ?? 'Safe Abort triggered'
          : latest?.compoundingNote ?? 'Sol 7 Autonomous Recovery Completed',
    });
  }

  const finalEnding = state.ending ?? computeMissionEnding(state);
  return {
    finalPrimary: { ...state.primary },
    finalSub: { ...state.sub },
    flags: { ...state.flags },
    ending: finalEnding,
    abortReason: state.abortReason,
    daySnapshots,
  };
}

export function createPresetGameState(target: JumpTarget): GameState {
  const base = createInitialGameState();

  switch (target) {
    case 'opening_cutscene':
      return base;

    case 'tutorial':
      return {
        ...base,
        screenStage: 'tutorial',
        tutorialStep: 0,
      };

    case 'day_1_landing':
      return {
        ...base,
        screenStage: 'gameplay',
        tutorialCompleted: true,
        activeMiniGame: 'lunar_lander',
      };

    case 'day_1':
      return {
        ...base,
        screenStage: 'gameplay',
        tutorialCompleted: true,
      };

    case 'minigame_lunar_lander':
      return {
        ...base,
        screenStage: 'gameplay',
        tutorialCompleted: true,
        activeMiniGame: 'lunar_lander',
      };

    case 'day_2': {
      let s = transitionGameState(base, { kind: 'COMPLETE_TUTORIAL' });
      s = runReplayDay(s, { choiceId: '1A_sunlit_ridge', grade: 'silver' });
      return s;
    }

    case 'minigame_greenhouse': {
      const s = createPresetGameState('day_2');
      return { ...s, activeMiniGame: 'greenhouse' };
    }

    case 'day_3': {
      let s = createPresetGameState('day_2');
      s = runReplayDay(s, { choiceId: '2A_active_pumps', grade: 'silver' });
      return s;
    }

    case 'minigame_power_grid': {
      const s = createPresetGameState('day_3');
      return { ...s, activeMiniGame: 'power_grid' };
    }

    case 'day_4': {
      let s = createPresetGameState('day_3');
      s = runReplayDay(s, { choiceId: '3A_essential_heating', grade: 'silver' });
      return s;
    }

    case 'minigame_radiation': {
      const s = createPresetGameState('day_4');
      return { ...s, activeMiniGame: 'radiation' };
    }

    case 'day_5': {
      let s = transitionGameState(base, { kind: 'COMPLETE_TUTORIAL' });
      s = runReplayDay(s, { choiceId: '1B_crater_shadow', grade: 'gold' });
      s = runReplayDay(s, { choiceId: '2A_active_pumps', grade: 'gold' });
      s = runReplayDay(s, { choiceId: '3B_battery_storage', grade: 'gold' });
      s = runReplayDay(s, { choiceId: '4A_max_shielding', grade: 'gold' });
      return s;
    }

    case 'minigame_medbay': {
      const s = createPresetGameState('day_5');
      return { ...s, activeMiniGame: 'medbay' };
    }

    case 'day_6': {
      let s = createPresetGameState('day_5');
      s = runReplayDay(s, { choiceId: '5A_full_rest', grade: 'gold' });
      return s;
    }

    case 'minigame_rover_surface': {
      const s = createPresetGameState('day_6');
      return { ...s, activeMiniGame: 'rover_surface' };
    }

    case 'day_7_blackout': {
      let s = createPresetGameState('day_6');
      s = runReplayDay(s, { choiceId: '6B_comms_maintenance', grade: 'gold' });
      s = transitionGameState(s, { kind: 'CONFIRM_MORNING_ROSTER' });
      s = transitionGameState(s, {
        kind: 'COMPLETE_MINIGAME',
        miniGame: 'rover_surface',
        grade: 'gold',
      });
      s = transitionGameState(s, { kind: 'ADVANCE_SHIFT' });
      return s;
    }

    case 'ending_scientific_breakthrough': {
      let s = transitionGameState(base, { kind: 'COMPLETE_TUTORIAL' });
      s = runReplayDay(s, { choiceId: '1B_crater_shadow', grade: 'gold' });
      s = runReplayDay(s, { choiceId: '2A_active_pumps', grade: 'gold' });
      s = runReplayDay(s, { choiceId: '3B_battery_storage', grade: 'gold' });
      s = runReplayDay(s, { choiceId: '4A_max_shielding', grade: 'gold' });
      s = runReplayDay(s, { choiceId: '5A_full_rest', grade: 'gold' });
      s = runReplayDay(s, { choiceId: '6B_comms_maintenance', grade: 'gold' });
      s = runReplayDay7(
        s,
        {
          stage1: '7_1A_rover_bus_tap',
          stage2: '7_2A_medbay_o2_divert',
          stage3: '7_3A_phased_array_lock',
        },
        'gold',
        true,
      );
      return s;
    }

    case 'ending_mission_accomplished': {
      let s = transitionGameState(base, { kind: 'COMPLETE_TUTORIAL' });
      // Sunlit Ridge + Capillary PONDS + Essential Heating + Max Shielding + Full Rest + Comms Maint
      // Rotating Sayed & Taha into rest shifts under PONDS keeps all 4 primary >= 50 while Science Score < 75
      s = runReplayDay(s, { choiceId: '1A_sunlit_ridge', grade: 'silver' });
      s = runReplayDay(s, { choiceId: '2B_capillary_ponds', grade: 'silver' });
      s = runReplayDay(s, { choiceId: '3A_essential_heating', grade: 'silver' });
      s = runReplayDay(s, {
        choiceId: '4A_max_shielding',
        grade: 'silver',
        restCrewIds: ['sayed', 'taha'],
      });
      s = runReplayDay(s, {
        choiceId: '5A_full_rest',
        grade: 'silver',
        restCrewIds: ['sayed', 'taha'],
      });
      s = runReplayDay(s, {
        choiceId: '6B_comms_maintenance',
        grade: 'silver',
        restCrewIds: ['sayed', 'taha'],
      });
      s = runReplayDay7(
        s,
        {
          stage1: '7_1A_rover_bus_tap',
          stage2: '7_2B_seal_greenhouse',
          stage3: '7_3B_emergency_beacon',
        },
        'silver',
        true,
      );
      return s;
    }

    case 'ending_critical_survival': {
      let s = transitionGameState(base, { kind: 'COMPLETE_TUTORIAL' });
      // Demonstrates Unbuffered Storm Bus Overload + Hardware Fault Risk while staying > 0 on all 4 primary meters
      s = runReplayDay(s, {
        choiceId: '1A_sunlit_ridge',
        grade: 'silver',
        touchdownVelocity: 3.4,
      });
      s = runReplayDay(s, { choiceId: '2A_active_pumps', grade: 'silver' });
      s = runReplayDay(s, { choiceId: '3C_overclock_regulators', grade: 'silver' });
      s = runReplayDay(s, { choiceId: '4A_max_shielding', grade: 'silver' });
      s = runReplayDay(s, { choiceId: '5B_rationed_split_shift', grade: 'silver' });
      s = runReplayDay(s, { choiceId: '6A_crater_ice', grade: 'silver' });
      s = runReplayDay7(
        s,
        {
          stage1: '7_1B_manual_bypass',
          stage2: '7_2B_seal_greenhouse',
          stage3: '7_3B_emergency_beacon',
        },
        'bronze',
        false,
      );
      return s;
    }

    case 'ending_mission_failure': {
      let s = transitionGameState(base, { kind: 'COMPLETE_TUTORIAL' });
      const restEngineer: OnBaseCrewId[] = ['albaraa'];
      s = runReplayDay(s, {
        choiceId: '1B_crater_shadow',
        grade: 'bronze',
        repairAnomaly: false,
        restCrewIds: restEngineer,
      });
      s = runReplayDay(s, {
        choiceId: '2A_active_pumps',
        grade: 'bronze',
        repairAnomaly: false,
        restCrewIds: restEngineer,
      });
      s = runReplayDay(s, {
        choiceId: '3A_essential_heating',
        grade: 'bronze',
        repairAnomaly: false,
        restCrewIds: restEngineer,
      });
      s = runReplayDay(s, {
        choiceId: '4A_max_shielding',
        grade: 'bronze',
        repairAnomaly: false,
        restCrewIds: restEngineer,
      });
      return s;
    }

    default: {
      const _exhaustive: never = target;
      return _exhaustive;
    }
  }
}
