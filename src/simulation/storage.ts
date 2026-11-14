import type {
  ChoiceId,
  ClockSpeed,
  CompoundingFlags,
  CrewExpression,
  Day3Allocation,
  Day4StormProtocol,
  Day5MedicalProtocol,
  Day6RoverObjective,
  Day7Stage,
  DayNumber,
  DecisionRecord,
  EndingId,
  FarmingMode,
  GameState,
  LandingSite,
  MiddayAnomalyState,
  MiniGameId,
  MissionLogEntry,
  OnBaseCrewId,
  PrimaryResources,
  RoomId,
  ScreenStage,
  ShiftPhase,
  SpecialistAssignment,
  SpecialistRuntimeState,
  SubResources,
} from '../types/game';

export const STORAGE_KEY = 'mission_control_save_v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isDayNumber(value: unknown): value is DayNumber {
  return (
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5 ||
    value === 6 ||
    value === 7
  );
}

function isShiftPhase(value: unknown): value is ShiftPhase {
  return value === 'morning' || value === 'midday' || value === 'evening';
}

function isScreenStage(value: unknown): value is ScreenStage {
  return (
    value === 'opening_cutscene' ||
    value === 'tutorial' ||
    value === 'gameplay' ||
    value === 'ending_cutscene' ||
    value === 'debrief'
  );
}

function isClockSpeed(value: unknown): value is ClockSpeed {
  return value === 0 || value === 1 || value === 2;
}

function isCrewExpression(value: unknown): value is CrewExpression {
  return (
    value === 'normal' ||
    value === 'happy' ||
    value === 'worried' ||
    value === 'surprised' ||
    value === 'focused' ||
    value === 'alert' ||
    value === 'concerned'
  );
}

function isSpecialistAssignment(value: unknown): value is SpecialistAssignment {
  return value === 'station' || value === 'resting';
}

function isOnBaseCrewId(value: unknown): value is OnBaseCrewId {
  return (
    value === 'albaraa' ||
    value === 'omar' ||
    value === 'taha' ||
    value === 'yassin' ||
    value === 'sayed'
  );
}

function isRoomId(value: unknown): value is RoomId {
  return (
    value === 'comms_room' ||
    value === 'control_room' ||
    value === 'science_lab' ||
    value === 'main_habitat' ||
    value === 'power_station' ||
    value === 'medbay' ||
    value === 'greenhouse' ||
    value === 'robotics_bay'
  );
}

function isMiniGameId(value: unknown): value is MiniGameId {
  return (
    value === 'lunar_lander' ||
    value === 'greenhouse' ||
    value === 'power_grid' ||
    value === 'radiation' ||
    value === 'medbay' ||
    value === 'rover_surface'
  );
}

function isEndingId(value: unknown): value is EndingId {
  return (
    value === 'SCIENTIFIC_BREAKTHROUGH' ||
    value === 'MISSION_ACCOMPLISHED' ||
    value === 'CRITICAL_SURVIVAL' ||
    value === 'MISSION_FAILURE'
  );
}

function isDay7Stage(value: unknown): value is Day7Stage {
  return (
    value === 'part_a_degraded' ||
    value === 'part_b_blackout' ||
    value === 'part_c_stage1' ||
    value === 'part_c_stage2' ||
    value === 'part_c_stage3' ||
    value === 'part_d_recovery'
  );
}

function isLandingSite(value: unknown): value is LandingSite {
  return value === 'sunlit_ridge' || value === 'crater_shadow';
}

function isFarmingMode(value: unknown): value is FarmingMode {
  return value === 'active_pumps' || value === 'capillary_ponds';
}

function isDay3Allocation(value: unknown): value is Day3Allocation {
  return (
    value === 'essential_heating' ||
    value === 'battery_storage' ||
    value === 'overclock_regulators'
  );
}

function isDay4Protocol(value: unknown): value is Day4StormProtocol {
  return value === 'max_shielding' || value === 'partial_shielding';
}

function isDay5Protocol(value: unknown): value is Day5MedicalProtocol {
  return value === 'full_rest' || value === 'rationed_split_shift';
}

function isDay6Objective(value: unknown): value is Day6RoverObjective {
  return value === 'crater_ice_extraction' || value === 'comms_solar_maintenance';
}

function isChoiceId(value: unknown): value is ChoiceId {
  return (
    value === '1A_sunlit_ridge' ||
    value === '1B_crater_shadow' ||
    value === '2A_active_pumps' ||
    value === '2B_capillary_ponds' ||
    value === '3A_essential_heating' ||
    value === '3B_battery_storage' ||
    value === '3C_overclock_regulators' ||
    value === '4A_max_shielding' ||
    value === '4B_partial_shielding' ||
    value === '5A_full_rest' ||
    value === '5B_rationed_split_shift' ||
    value === '6A_crater_ice' ||
    value === '6B_comms_maintenance' ||
    value === '7_1A_rover_bus_tap' ||
    value === '7_1B_manual_bypass' ||
    value === '7_2A_medbay_o2_divert' ||
    value === '7_2B_seal_greenhouse' ||
    value === '7_3A_phased_array_lock' ||
    value === '7_3B_emergency_beacon'
  );
}

function isPrimaryResources(value: unknown): value is PrimaryResources {
  if (!isRecord(value)) return false;
  return (
    isFiniteInRange(value.lifeSupport, 0, 100) &&
    isFiniteInRange(value.power, 0, 100) &&
    isFiniteInRange(value.shielding, 0, 100) &&
    isFiniteInRange(value.crewReadiness, 0, 100)
  );
}

function isSubResources(value: unknown): value is SubResources {
  if (!isRecord(value)) return false;
  return (
    isFiniteInRange(value.crewHealth, 0, 100) &&
    isFiniteInRange(value.crewFatigue, 0, 100) &&
    isFiniteInRange(value.medicalSupplies, 0, 100) &&
    isFiniteInRange(value.foodAndSupplies, 0, 100) &&
    isFiniteInRange(value.waterAvailability, 0, 100) &&
    isFiniteInRange(value.roverBattery, 0, 100) &&
    typeof value.scienceScore === 'number' &&
    Number.isFinite(value.scienceScore) &&
    value.scienceScore >= 0
  );
}

function isSpecialistRuntimeState(
  value: unknown,
  expectedId: OnBaseCrewId,
): value is SpecialistRuntimeState {
  if (!isRecord(value)) return false;
  return (
    value.id === expectedId &&
    isFiniteInRange(value.fatigue, 0, 100) &&
    isSpecialistAssignment(value.assignment) &&
    typeof value.forcedRest === 'boolean' &&
    isCrewExpression(value.expression)
  );
}

function isSpecialistsRecord(
  value: unknown,
): value is Record<OnBaseCrewId, SpecialistRuntimeState> {
  if (!isRecord(value)) return false;
  return (
    isSpecialistRuntimeState(value.albaraa, 'albaraa') &&
    isSpecialistRuntimeState(value.omar, 'omar') &&
    isSpecialistRuntimeState(value.taha, 'taha') &&
    isSpecialistRuntimeState(value.yassin, 'yassin') &&
    isSpecialistRuntimeState(value.sayed, 'sayed')
  );
}

function isCompoundingFlags(value: unknown): value is CompoundingFlags {
  if (!isRecord(value)) return false;
  return (
    (value.landingSite === null || isLandingSite(value.landingSite)) &&
    typeof value.hardLandingPenaltyApplied === 'boolean' &&
    (value.farmingMode === null || isFarmingMode(value.farmingMode)) &&
    typeof value.activePumpsStalled === 'boolean' &&
    (value.day3Allocation === null || isDay3Allocation(value.day3Allocation)) &&
    typeof value.hardwareFaultRisk === 'boolean' &&
    typeof value.unbufferedStormOverloadTriggered === 'boolean' &&
    (value.day4Protocol === null || isDay4Protocol(value.day4Protocol)) &&
    typeof value.crisisResilience === 'boolean' &&
    (value.day5Protocol === null || isDay5Protocol(value.day5Protocol)) &&
    typeof value.relayReinforced === 'boolean' &&
    (value.day6Objective === null || isDay6Objective(value.day6Objective))
  );
}

function isPrimaryMeterKey(value: unknown): value is keyof PrimaryResources {
  return (
    value === 'lifeSupport' ||
    value === 'power' ||
    value === 'shielding' ||
    value === 'crewReadiness'
  );
}

function isMiddayAnomalyState(value: unknown): value is MiddayAnomalyState {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    isDayNumber(value.day) &&
    isRoomId(value.roomId) &&
    isOnBaseCrewId(value.specialistId) &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    isPrimaryMeterKey(value.affectedMeter) &&
    typeof value.resolved === 'boolean' &&
    typeof value.ignoredPenaltyApplied === 'boolean'
  );
}

function isDecisionRecord(value: unknown): value is DecisionRecord {
  if (!isRecord(value)) return false;
  return (
    isDayNumber(value.day) &&
    (value.stage === undefined || value.stage === 1 || value.stage === 2 || value.stage === 3) &&
    isChoiceId(value.choiceId) &&
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    isRecord(value.immediateDeltas) &&
    typeof value.compoundingNote === 'string' &&
    typeof value.timestampMinutes === 'number' &&
    Number.isFinite(value.timestampMinutes)
  );
}

function isLogCategory(value: unknown): value is MissionLogEntry['category'] {
  return (
    value === 'system' ||
    value === 'decision' ||
    value === 'minigame' ||
    value === 'anomaly' ||
    value === 'comms' ||
    value === 'nasa'
  );
}

function isMissionLogEntry(value: unknown): value is MissionLogEntry {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    isDayNumber(value.day) &&
    isShiftPhase(value.shift) &&
    isLogCategory(value.category) &&
    typeof value.title === 'string' &&
    typeof value.detail === 'string' &&
    isPrimaryResources(value.primarySnapshot)
  );
}

function isDay7StagesCompleted(
  value: unknown,
): value is GameState['day7StagesCompleted'] {
  if (!isRecord(value)) return false;
  return (
    typeof value.stage1 === 'boolean' &&
    typeof value.stage2 === 'boolean' &&
    typeof value.stage3 === 'boolean'
  );
}

function isValidGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false;
  if (value.version !== 1) return false;
  if (!isScreenStage(value.screenStage)) return false;
  if (!isDayNumber(value.day)) return false;
  if (!isShiftPhase(value.shift)) return false;
  if (!isFiniteInRange(value.clockMinutes, 0, 1440)) return false;
  if (!isClockSpeed(value.clockSpeed)) return false;
  if (!isPrimaryResources(value.primary)) return false;
  if (!isSubResources(value.sub)) return false;
  if (!isSpecialistsRecord(value.specialists)) return false;
  if (!isCompoundingFlags(value.flags)) return false;
  if (typeof value.commsBlackout !== 'boolean') return false;
  if (!isDay7Stage(value.day7Stage)) return false;
  if (typeof value.rosterConfirmedForDay !== 'boolean') return false;
  if (typeof value.signatureMiniGameCompletedForDay !== 'boolean') return false;
  if (value.anomaly !== null && !isMiddayAnomalyState(value.anomaly)) return false;
  if (typeof value.eveningDecisionCompletedForDay !== 'boolean') return false;
  if (!isDay7StagesCompleted(value.day7StagesCompleted)) return false;
  if (!Array.isArray(value.decisions) || !value.decisions.every(isDecisionRecord)) return false;
  if (!Array.isArray(value.logs) || !value.logs.every(isMissionLogEntry)) return false;
  if (value.activeMiniGame !== null && !isMiniGameId(value.activeMiniGame)) return false;
  if (value.ending !== null && !isEndingId(value.ending)) return false;
  if (value.abortReason !== null && typeof value.abortReason !== 'string') return false;
  if (!isFiniteInRange(value.tutorialStep, 0, 10)) return false;
  if (typeof value.tutorialCompleted !== 'boolean') return false;
  if (typeof value.muted !== 'boolean') return false;
  return true;
}

function resolveDefaultStorage(): Storage | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function saveGameState(
  state: Readonly<GameState>,
  storage?: Pick<Storage, 'setItem'>,
): void {
  const target = storage ?? resolveDefaultStorage();
  if (!target) return;
  try {
    target.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private-browsing exceptions cleanly
  }
}

export function loadGameState(
  storage?: Pick<Storage, 'getItem'>,
): GameState | null {
  const target = storage ?? resolveDefaultStorage();
  if (!target) return null;
  try {
    const raw = target.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidGameState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSavedGameState(
  storage?: Pick<Storage, 'removeItem'>,
): void {
  const target = storage ?? resolveDefaultStorage();
  if (!target) return;
  try {
    target.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage access errors cleanly
  }
}
