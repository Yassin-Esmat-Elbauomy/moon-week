export type CrewId =
  | 'albaraa'
  | 'omar'
  | 'taha'
  | 'yassin'
  | 'sayed'
  | 'abdelrahman';

export type OnBaseCrewId = 'albaraa' | 'omar' | 'taha' | 'yassin' | 'sayed';

export type CrewExpression =
  | 'normal'
  | 'happy'
  | 'worried'
  | 'surprised'
  | 'focused'
  | 'alert'
  | 'concerned';

export type RoomId =
  | 'comms_room'
  | 'control_room'
  | 'science_lab'
  | 'main_habitat'
  | 'power_station'
  | 'medbay'
  | 'greenhouse'
  | 'robotics_bay';

export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ShiftPhase = 'morning' | 'midday' | 'evening';

export type ClockSpeed = 0 | 1 | 2;

export type ScreenStage =
  | 'opening_cutscene'
  | 'tutorial'
  | 'gameplay'
  | 'ending_cutscene'
  | 'debrief';

export type LandingSite = 'sunlit_ridge' | 'crater_shadow';
export type FarmingMode = 'active_pumps' | 'capillary_ponds';
export type Day3Allocation =
  | 'essential_heating'
  | 'battery_storage'
  | 'overclock_regulators';
export type Day4StormProtocol = 'max_shielding' | 'partial_shielding';
export type Day5MedicalProtocol = 'full_rest' | 'rationed_split_shift';
export type Day6RoverObjective = 'crater_ice_extraction' | 'comms_solar_maintenance';

export type ChoiceId =
  | '1A_sunlit_ridge'
  | '1B_crater_shadow'
  | '2A_active_pumps'
  | '2B_capillary_ponds'
  | '3A_essential_heating'
  | '3B_battery_storage'
  | '3C_overclock_regulators'
  | '4A_max_shielding'
  | '4B_partial_shielding'
  | '5A_full_rest'
  | '5B_rationed_split_shift'
  | '6A_crater_ice'
  | '6B_comms_maintenance'
  | '7_1A_rover_bus_tap'
  | '7_1B_manual_bypass'
  | '7_2A_medbay_o2_divert'
  | '7_2B_seal_greenhouse'
  | '7_3A_phased_array_lock'
  | '7_3B_emergency_beacon';

export type MiniGameId =
  | 'lunar_lander'
  | 'greenhouse'
  | 'power_grid'
  | 'radiation'
  | 'medbay'
  | 'rover_surface';

export type MiniGameGrade = 'gold' | 'silver' | 'bronze';

export type EndingId =
  | 'SCIENTIFIC_BREAKTHROUGH'
  | 'MISSION_ACCOMPLISHED'
  | 'CRITICAL_SURVIVAL'
  | 'MISSION_FAILURE';

export type SpecialistAssignment = 'station' | 'resting';

export interface PrimaryResources {
  lifeSupport: number;
  power: number;
  shielding: number;
  crewReadiness: number;
}

export interface SubResources {
  crewHealth: number;
  crewFatigue: number;
  medicalSupplies: number;
  foodAndSupplies: number;
  waterAvailability: number;
  roverBattery: number;
  scienceScore: number;
}

export interface ResourceDeltas {
  lifeSupport?: number;
  power?: number;
  shielding?: number;
  crewReadiness?: number;
  crewHealth?: number;
  crewFatigue?: number;
  medicalSupplies?: number;
  foodAndSupplies?: number;
  waterAvailability?: number;
  roverBattery?: number;
  scienceScore?: number;
}

export interface SpecialistRuntimeState {
  id: OnBaseCrewId;
  fatigue: number;
  assignment: SpecialistAssignment;
  forcedRest: boolean;
  expression: CrewExpression;
}

export interface CompoundingFlags {
  landingSite: LandingSite | null;
  hardLandingPenaltyApplied: boolean;
  farmingMode: FarmingMode | null;
  activePumpsStalled: boolean;
  day3Allocation: Day3Allocation | null;
  hardwareFaultRisk: boolean;
  unbufferedStormOverloadTriggered: boolean;
  day4Protocol: Day4StormProtocol | null;
  crisisResilience: boolean;
  day5Protocol: Day5MedicalProtocol | null;
  relayReinforced: boolean;
  day6Objective: Day6RoverObjective | null;
}

export interface MiddayAnomalyState {
  id: string;
  day: DayNumber;
  roomId: RoomId;
  specialistId: OnBaseCrewId;
  title: string;
  description: string;
  affectedMeter: keyof PrimaryResources;
  resolved: boolean;
  ignoredPenaltyApplied: boolean;
}

export interface DecisionRecord {
  day: DayNumber;
  stage?: 1 | 2 | 3;
  choiceId: ChoiceId;
  title: string;
  summary: string;
  immediateDeltas: ResourceDeltas;
  compoundingNote: string;
  timestampMinutes: number;
}

export interface MissionLogEntry {
  id: string;
  day: DayNumber;
  shift: ShiftPhase;
  category: 'system' | 'decision' | 'minigame' | 'anomaly' | 'comms' | 'nasa';
  title: string;
  detail: string;
  primarySnapshot: PrimaryResources;
}

export type Day7Stage = 'part_a_degraded' | 'part_b_blackout' | 'part_c_stage1' | 'part_c_stage2' | 'part_c_stage3' | 'part_d_recovery';

export interface GameState {
  version: 1;
  screenStage: ScreenStage;
  day: DayNumber;
  shift: ShiftPhase;
  /** Minutes elapsed since 00:00 on the current day (06:00 = 360, 22:00 = 1320). */
  clockMinutes: number;
  clockSpeed: ClockSpeed;
  primary: PrimaryResources;
  sub: SubResources;
  specialists: Record<OnBaseCrewId, SpecialistRuntimeState>;
  flags: CompoundingFlags;
  commsBlackout: boolean;
  day7Stage: Day7Stage;
  rosterConfirmedForDay: boolean;
  signatureMiniGameCompletedForDay: boolean;
  anomaly: MiddayAnomalyState | null;
  eveningDecisionCompletedForDay: boolean;
  day7StagesCompleted: {
    stage1: boolean;
    stage2: boolean;
    stage3: boolean;
  };
  decisions: DecisionRecord[];
  logs: MissionLogEntry[];
  activeMiniGame: MiniGameId | null;
  ending: EndingId | null;
  abortReason: string | null;
  tutorialStep: number;
  tutorialCompleted: boolean;
  muted: boolean;
}

export type JumpTarget =
  | 'opening_cutscene'
  | 'tutorial'
  | 'day_1_landing'
  | 'day_1'
  | 'day_2'
  | 'day_3'
  | 'day_4'
  | 'day_5'
  | 'day_6'
  | 'day_7_blackout'
  | 'minigame_lunar_lander'
  | 'minigame_greenhouse'
  | 'minigame_power_grid'
  | 'minigame_radiation'
  | 'minigame_medbay'
  | 'minigame_rover_surface'
  | 'ending_scientific_breakthrough'
  | 'ending_mission_accomplished'
  | 'ending_critical_survival'
  | 'ending_mission_failure';

export type GameAction =
  | { kind: 'START_NEW_MISSION' }
  | { kind: 'FINISH_OPENING_CUTSCENE' }
  | { kind: 'SET_TUTORIAL_STEP'; step: number }
  | { kind: 'COMPLETE_TUTORIAL' }
  | { kind: 'RESTART_TUTORIAL' }
  | { kind: 'TICK_CLOCK'; deltaMinutes: number }
  | { kind: 'SET_CLOCK_SPEED'; speed: ClockSpeed }
  | { kind: 'SET_SPECIALIST_ASSIGNMENT'; crewId: OnBaseCrewId; assignment: SpecialistAssignment }
  | { kind: 'CONFIRM_MORNING_ROSTER' }
  | { kind: 'OPEN_MINIGAME'; miniGame: MiniGameId | null }
  | {
      kind: 'COMPLETE_MINIGAME';
      miniGame: MiniGameId;
      grade: MiniGameGrade;
      landingSite?: LandingSite;
      touchdownVelocity?: number;
      bonusScience?: number;
    }
  | { kind: 'REPAIR_MIDDAY_ANOMALY'; grade: MiniGameGrade }
  | { kind: 'APPLY_EVENING_DECISION'; choiceId: ChoiceId }
  | { kind: 'ADVANCE_DAY7_SUBSTAGE'; stage: Day7Stage }
  | { kind: 'APPLY_DAY7_STAGE_DECISION'; stage: 1 | 2 | 3; choiceId: ChoiceId }
  | { kind: 'ADVANCE_SHIFT' }
  | { kind: 'TRIGGER_ENDING_FROM_CUTSCENE' }
  | { kind: 'OPEN_DEBRIEF' }
  | { kind: 'REPLAY_ENDING_CUTSCENE' }
  | { kind: 'JUMP_TO_TARGET'; target: JumpTarget }
  | { kind: 'SET_MUTED'; muted: boolean };

export interface WhatIfResult {
  finalPrimary: PrimaryResources;
  finalSub: SubResources;
  flags: CompoundingFlags;
  ending: EndingId;
  abortReason: string | null;
  daySnapshots: Array<{
    day: DayNumber;
    choiceId: ChoiceId;
    title: string;
    primary: PrimaryResources;
    scienceScore: number;
    note: string;
  }>;
}

export type NasaSourceTag = 'NASA DONKI' | 'NASA OSDR (Veggie/PONDS)' | 'NASA OSDR (Human Research)' | 'NASA LRO / Artemis';

export interface NasaScienceCardData {
  day: DayNumber;
  source: NasaSourceTag;
  datasetTitle: string;
  recordId: string;
  liveStatus: 'live' | 'verified_cache';
  satelliteObservation: string;
  scientificInterpretation: string;
  gameSimulationRule: string;
  whyThisMatters: string;
  rawMetrics: Array<{ label: string; value: string }>;
}

export interface ScientificTermDefinition {
  term: string;
  shortTitle: string;
  kidExplanation: string;
}

export interface CrewProfile {
  id: CrewId;
  name: string;
  role: string;
  stationName: string;
  roomId: RoomId | 'earth_control';
  specialty: string;
  accentColor: string;
  visorTint: string;
  isRemote: boolean;
  /** Template facial characteristics until real teammate portraits are supplied. */
  templateFeatures: {
    skinTone: string;
    hairColor: string;
    hairStyle: 'short_wave' | 'neat_crop' | 'curly_top' | 'spiky' | 'side_part' | 'fade';
    hasGlasses: boolean;
    facialHair: 'none' | 'light_stubble' | 'neat_beard';
  };
  dayDialogues: Record<DayNumber, { greeting: string; advice: string; expression: CrewExpression }>;
}

export interface DecisionOptionSpec {
  choiceId: ChoiceId;
  label: string;
  shortSummary: string;
  immediateDeltas: ResourceDeltas;
  compoundingSummary: string;
  requires?: {
    label: string;
    check: (state: Readonly<GameState>) => boolean;
  };
  badgeColor: 'sky' | 'amber' | 'mint' | 'purple';
}

export interface Day7StageSpec {
  stage: 1 | 2 | 3;
  title: string;
  featuredCrew: CrewId[];
  miniGame: MiniGameId;
  prompt: string;
  options: DecisionOptionSpec[];
}

export type StageCrisisSpec = Day7StageSpec;

export interface DailyScenarioSpec {
  day: DayNumber;
  title: string;
  featuredCrew: CrewId[];
  morningBriefing: string;
  signatureMiniGame: MiniGameId;
  anomaly: Omit<MiddayAnomalyState, 'resolved' | 'ignoredPenaltyApplied'>;
  eveningPrompt: string;
  options: DecisionOptionSpec[];
}
