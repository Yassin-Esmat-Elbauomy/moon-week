import React, { useEffect, useMemo } from 'react';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import { CREW_PROFILES } from '../../data/crewProfiles';
import { DAILY_SCENARIOS, DAY7_STAGE_SPECS, getDynamicStoryRipple } from '../../data/dailyScenarios';
import { VERIFIED_NASA_DATASETS } from '../../data/nasaVerifiedData';
import * as soundEngine from '../../services/soundEngine';
import type {
  ChoiceId,
  DayNumber,
  DecisionOptionSpec,
  GameAction,
  GameState,
  OnBaseCrewId,
  ResourceDeltas,
} from '../../types/game';

export interface NasaDataBadgeProps {
  day: DayNumber;
  compact?: boolean;
  onTermClick?: (termKey: string) => void;
}

/**
 * Preserved export (ADR-0004) separating satellite observation, scientific interpretation,
 * and game simulation rule so external space flux is never conflated with internal habitat dose.
 */
export const NasaDataBadge: React.FC<NasaDataBadgeProps> = ({
  day,
  compact = false,
  onTermClick,
}) => {
  const dataset = VERIFIED_NASA_DATASETS[day];

  if (compact) {
    return (
      <div className="rounded-2xl bg-[#11192E] border border-[#79C8E8]/40 px-2.5 py-1.5 text-[11px] text-slate-200 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-extrabold text-[#79C8E8] tracking-wide uppercase text-[10px] truncate">
            🛰️ {dataset.source} • {dataset.datasetTitle}
          </span>
          <span className="font-mono text-[10px] text-slate-400 shrink-0">
            {dataset.recordId}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
          <div className="rounded-xl bg-[#0B1222] border border-[#79C8E8]/35 px-2 py-1">
            <p className="font-extrabold text-[#79C8E8] uppercase text-[10px]">
              1. Satellite Observation
            </p>
            <p className="text-slate-200 leading-tight mt-0.5">{dataset.satelliteObservation}</p>
          </div>
          <div className="rounded-xl bg-[#0B1222] border border-[#FFD66B]/35 px-2 py-1">
            <p className="font-extrabold text-[#FFD66B] uppercase text-[10px]">
              2. Scientific Meaning
            </p>
            <p className="text-slate-200 leading-tight mt-0.5">{dataset.scientificInterpretation}</p>
          </div>
          <div className="rounded-xl bg-[#0B1222] border border-[#9BD8A7]/35 px-2 py-1">
            <p className="font-extrabold text-[#9BD8A7] uppercase text-[10px]">
              3. Base Simulation Rule
            </p>
            <p className="text-slate-200 leading-tight mt-0.5">{dataset.gameSimulationRule}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#11192E] border border-[#79C8E8]/40 p-3 text-xs text-slate-200 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-extrabold text-[#79C8E8]">{dataset.source}</span>
        <span className="font-mono text-[11px] text-slate-400">{dataset.recordId}</span>
      </div>
      <div>
        <p className="font-extrabold text-[#79C8E8] uppercase">1. Satellite Observation</p>
        <p>{dataset.satelliteObservation}</p>
      </div>
      <div>
        <p className="font-extrabold text-[#FFD66B] uppercase">2. Scientific Interpretation</p>
        <p>{dataset.scientificInterpretation}</p>
      </div>
      <div>
        <p className="font-extrabold text-[#9BD8A7] uppercase">3. Game Simulation Rule</p>
        <p>{dataset.gameSimulationRule}</p>
      </div>
      {onTermClick ? (
        <div className="pt-1 flex flex-wrap gap-1.5">
          {dataset.rawMetrics.slice(0, 2).map((metric) => (
            <button
              key={metric.label}
              type="button"
              onClick={() => onTermClick(metric.label)}
              className="px-2 py-0.5 rounded-md bg-[#1E293B] border border-slate-600 text-[10px] font-bold text-[#79C8E8] hover:border-[#FFD66B] cursor-pointer"
            >
              {metric.label}: {metric.value}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const FEATURED_CREW_BY_DAY: Record<DayNumber, OnBaseCrewId> = {
  1: 'albaraa',
  2: 'sayed',
  3: 'taha',
  4: 'taha',
  5: 'omar',
  6: 'yassin',
  7: 'albaraa',
};

interface ChoiceVisualMeta {
  icon: string;
  baseImpact: string;
  crewImpact: string;
  endingHint: string;
  isRisky?: boolean;
}

function getChoiceVisualMeta(
  choiceId: ChoiceId,
  state: Readonly<GameState>,
): ChoiceVisualMeta {
  switch (choiceId) {
    case '1A_sunlit_ridge':
      return {
        icon: '☀️',
        baseImpact: 'Base: Extra Solar Wings (+6 Power/day)',
        crewImpact: 'Crew: Open Sky (-10 Storm Shield)',
        endingHint: 'Path: High kW for Active Pumps & Labs',
      };
    case '1B_crater_shadow':
      return {
        icon: '🌑',
        baseImpact: 'Base: Crater Rock Berm & Ice Rim',
        crewImpact: 'Crew: +10 Storm Shield, -4 Power/day',
        endingHint: 'Path: Safer Radiation & Water Surplus',
      };
    case '2A_active_pumps':
      return {
        icon: '⚡',
        baseImpact: 'Base: Powered Hydroponic Loops (-8 kW/day)',
        crewImpact: 'Crew: Fast Greens (+8 Air & Food/day)',
        endingHint: 'Path: Stalls if Power drops below 25%',
      };
    case '2B_capillary_ponds':
      return {
        icon: '🌱',
        baseImpact: 'Base: 0 kW Capillary Wicking Blocks',
        crewImpact: 'Crew: Hand Tending (+8 Fatigue/day)',
        endingHint: 'Path: Saves kW, Needs Fatigue Rotation',
      };
    case '3A_essential_heating':
      return {
        icon: '🔥',
        baseImpact: 'Base: Warm Cabins, Rover Capped at 55%',
        crewImpact: 'Crew: Cozy Quarters (+5 Morale)',
        endingHint: 'Path: No Battery Buffer for Sol 4 Storm',
      };
    case '3B_battery_storage':
      return {
        icon: '🔋',
        baseImpact: 'Base: 100% Rover & Storm Battery Bank',
        crewImpact: 'Crew: Frosty Rooms (+15 Fatigue Sol 4)',
        endingHint: 'Path: Top Science & Storm Buffer',
      };
    case '3C_overclock_regulators':
      return {
        icon: '⚙️',
        baseImpact: 'Base: Overdriven Bus (+Sol 7 Fault Risk)',
        crewImpact: 'Crew: High Strain (+15 Fatigue, -10 Morale)',
        endingHint: 'Path: Risky Surge — Hurts Sol 7 Power',
        isRisky: true,
      };
    case '4A_max_shielding': {
      const overload =
        state.flags.farmingMode === 'active_pumps' &&
        state.flags.day3Allocation !== 'battery_storage';
      return {
        icon: '🛡️',
        baseImpact: overload
          ? 'Base: Bus Overload! Active Pumps Stall'
          : 'Base: Shimmering H2O Water-Wall Dome',
        crewImpact: 'Crew: Internal mSv Safely Blocked',
        endingHint: overload
          ? 'Warning: Power drops below 25%!'
          : 'Path: Protects Crew & Science Output',
        isRisky: overload,
      };
    }
    case '4B_partial_shielding':
      return {
        icon: '⚠️',
        baseImpact: 'Base: Half Shutters Save -15 kW Today',
        crewImpact: 'Crew: Radiation Strain (-10 Medkits Sol 5)',
        endingHint: 'Path: Survival Risk — Cuts Shield & Health',
        isRisky: true,
      };
    case '5A_full_rest':
      return {
        icon: '🌙',
        baseImpact: 'Base: 600 nm Amber Rest Lights (-8 Shield pause)',
        crewImpact: 'Crew: Deep Recovery (+Crisis Resilience)',
        endingHint: 'Path: Boosts Sol 7 Morale (+5)',
      };
    case '5B_rationed_split_shift':
      return {
        icon: '🔬',
        baseImpact: 'Base: Night Lab Scopes Active (+10 Science)',
        crewImpact: 'Crew: Saves Medkits, Lingering Fatigue',
        endingHint: 'Path: -8 Morale Entering Sol 7',
      };
    case '6A_crater_ice':
      return {
        icon: '🧊',
        baseImpact: 'Base: +25 Water Tank, Relay Left Unserviced',
        crewImpact: 'Crew: Heavy -45% Rover Drain',
        endingHint: 'Path: Huge +25 Science Score Boost',
      };
    case '6B_comms_maintenance':
      return {
        icon: '📡',
        baseImpact: 'Base: Emergency S-Band Relay Reinforced',
        crewImpact: 'Crew: Clean Solar & Shield Check',
        endingHint: 'Path: Unlocks +10 kW Sol 7 Dish Lock',
      };
    case '7_1A_rover_bus_tap':
      return {
        icon: '🔋',
        baseImpact: 'Base: Rover Auxiliary Bus Linked (+15 kW)',
        crewImpact: 'Crew: Clean Air & Zero Extra Fatigue',
        endingHint: 'Stage 1: Strongest Power Rescue',
      };
    case '7_1B_manual_bypass':
      return {
        icon: '🔧',
        baseImpact: state.flags.hardwareFaultRisk
          ? 'Base: Sol 3 Overclock Fault (-8 Shield!)'
          : 'Base: Hand-Wired Junction (+5 kW)',
        crewImpact: 'Crew: Heavy Exhaustion (+10 Fatigue)',
        endingHint: 'Stage 1: Spares Rover Battery',
        isRisky: state.flags.hardwareFaultRisk,
      };
    case '7_2A_medbay_o2_divert':
      return {
        icon: '🫧',
        baseImpact: 'Base: Greenhouse O2 Loop Restored (+15 Air)',
        crewImpact: state.flags.crisisResilience
          ? 'Crew: Crisis Resilience (+15 Morale!)'
          : 'Crew: Calmer Breathing (+10 Morale)',
        endingHint: 'Stage 2: +10 Science Breakthrough Boost',
      };
    case '7_2B_seal_greenhouse':
      return {
        icon: '🚪',
        baseImpact: 'Base: Outer Plant Bay Sealed (-15 Food)',
        crewImpact: 'Crew: Rationed Air (-8 Morale)',
        endingHint: 'Stage 2: Saves Medkits, -5 Science',
        isRisky: true,
      };
    case '7_3A_phased_array_lock':
      return {
        icon: '📡',
        baseImpact: state.flags.relayReinforced
          ? 'Base: Reinforced Dish Lock (+10 kW!)'
          : 'Base: Heavy Array Draw (-15 kW)',
        crewImpact: 'Crew: Earth Uplink Restored Fast',
        endingHint: state.flags.relayReinforced
          ? 'Stage 3: +15 Science Breakthrough Lock!'
          : 'Stage 3: +10 Science, Watch Low Power',
        isRisky: !state.flags.relayReinforced && state.primary.power < 30,
      };
    case '7_3B_emergency_beacon':
      return {
        icon: '🛟',
        baseImpact: 'Base: Low-Power Pulse (-5 kW)',
        crewImpact: 'Crew: Safe Steady Recovery (+5 Morale)',
        endingHint: 'Stage 3: Reliable Safe Ending Finish',
      };
    default: {
      const _exhaustive: never = choiceId;
      return _exhaustive;
    }
  }
}

function getEffectiveDeltas(
  state: Readonly<GameState>,
  opt: DecisionOptionSpec,
): ResourceDeltas {
  const { choiceId, immediateDeltas } = opt;

  if (choiceId === '4A_max_shielding') {
    const siteMod =
      state.flags.landingSite === 'crater_shadow'
        ? 10
        : state.flags.landingSite === 'sunlit_ridge'
          ? -10
          : 0;
    const overload =
      state.flags.farmingMode === 'active_pumps' &&
      state.flags.day3Allocation !== 'battery_storage';
    if (overload) {
      const raw = Math.min(state.primary.power - 45, 20);
      const targetPower =
        state.primary.power >= 35 ? Math.max(10, raw) : Math.max(0, raw);
      return {
        shielding: 15 + siteMod,
        crewReadiness: 5,
        power: targetPower - state.primary.power,
        lifeSupport: state.flags.activePumpsStalled ? 0 : -15,
      };
    }
    return {
      shielding: 15 + siteMod,
      crewReadiness: 5,
      power: -25,
    };
  }

  if (choiceId === '4B_partial_shielding') {
    const siteMod =
      state.flags.landingSite === 'crater_shadow'
        ? 10
        : state.flags.landingSite === 'sunlit_ridge'
          ? -10
          : 0;
    return {
      ...immediateDeltas,
      shielding: -20 + siteMod,
    };
  }

  if (choiceId === '7_1B_manual_bypass') {
    return {
      ...immediateDeltas,
      shielding: state.flags.hardwareFaultRisk ? -8 : 0,
    };
  }

  if (choiceId === '7_2A_medbay_o2_divert') {
    return {
      ...immediateDeltas,
      crewReadiness: 10 + (state.flags.crisisResilience ? 5 : 0),
    };
  }

  if (choiceId === '7_3A_phased_array_lock') {
    return state.flags.relayReinforced
      ? { power: 10, shielding: 10, scienceScore: 15 }
      : { power: -15, shielding: 5, scienceScore: 10 };
  }

  return immediateDeltas;
}

interface MeterPill {
  key: string;
  icon: string;
  label: string;
  delta: number;
}

function buildDeltaPills(deltas: ResourceDeltas): MeterPill[] {
  const specs: Array<{ key: keyof ResourceDeltas; icon: string; label: string }> = [
    { key: 'power', icon: '⚡', label: 'Power' },
    { key: 'waterAvailability', icon: '💧', label: 'Water' },
    { key: 'lifeSupport', icon: '🫧', label: 'O2/Air' },
    { key: 'shielding', icon: '🛡️', label: 'Shield' },
    { key: 'crewReadiness', icon: '😊', label: 'Morale' },
    { key: 'scienceScore', icon: '🔬', label: 'Science' },
    { key: 'foodAndSupplies', icon: '🌿', label: 'Food' },
    { key: 'medicalSupplies', icon: '🩺', label: 'Medkits' },
    { key: 'roverBattery', icon: '🔋', label: 'Rover' },
    { key: 'crewHealth', icon: '❤️', label: 'Health' },
    { key: 'crewFatigue', icon: '😓', label: 'Fatigue' },
  ];

  const pills: MeterPill[] = [];
  for (const spec of specs) {
    const val = deltas[spec.key];
    if (typeof val === 'number' && val !== 0) {
      pills.push({
        key: spec.key,
        icon: spec.icon,
        label: spec.label,
        delta: val,
      });
    }
  }
  return pills.slice(0, 5);
}

export interface DecisionModalProps {
  state: Readonly<GameState>;
  dispatch: (action: GameAction) => void;
  onClose: () => void;
  onOpenAiAdvisor: () => void;
  onDecisionComplete?: (completedDay: DayNumber) => void;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  state,
  dispatch,
  onClose,
  onOpenAiAdvisor,
  onDecisionComplete,
}) => {
  const isDay7 = state.day === 7;
  const isBlackout = isDay7 && state.commsBlackout;
  const activeDay7Stage: 1 | 2 | 3 = !state.day7StagesCompleted.stage1
    ? 1
    : !state.day7StagesCompleted.stage2
      ? 2
      : 3;

  const scenario = DAILY_SCENARIOS[state.day];
  const stageSpec = DAY7_STAGE_SPECS[activeDay7Stage];

  const featuredCrewId: OnBaseCrewId = isDay7
    ? activeDay7Stage === 1
      ? 'albaraa'
      : activeDay7Stage === 2
        ? 'sayed'
        : 'taha'
    : FEATURED_CREW_BY_DAY[state.day];
  const crewProfile = CREW_PROFILES[featuredCrewId];
  const storyRipple = getDynamicStoryRipple(state);

  const activeOptions: readonly DecisionOptionSpec[] = useMemo(() => {
    if (!isDay7) {
      return scenario.options;
    }
    return stageSpec.options;
  }, [isDay7, scenario.options, stageSpec.options]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        soundEngine.playCue('click');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelectOption = (opt: DecisionOptionSpec) => {
    if (opt.requires && !opt.requires.check(state)) {
      soundEngine.playCue('alert');
      return;
    }

    const meta = getChoiceVisualMeta(opt.choiceId, state);
    if (opt.choiceId === '3B_battery_storage') {
      soundEngine.playCue('frost_freeze');
    } else if (opt.choiceId === '3C_overclock_regulators' || meta.isRisky) {
      soundEngine.playCue('power_overload');
    } else {
      soundEngine.playCue('choice_impact');
    }

    if (!isDay7) {
      const completedDay = state.day;
      dispatch({ kind: 'APPLY_EVENING_DECISION', choiceId: opt.choiceId });
      dispatch({ kind: 'ADVANCE_SHIFT' });
      if (onDecisionComplete) {
        onDecisionComplete(completedDay);
      } else {
        onClose();
      }
      return;
    }

    dispatch({
      kind: 'APPLY_DAY7_STAGE_DECISION',
      stage: activeDay7Stage,
      choiceId: opt.choiceId,
    });

    if (activeDay7Stage === 3) {
      dispatch({ kind: 'ADVANCE_SHIFT' });
      if (onDecisionComplete) {
        onDecisionComplete(7);
      } else {
        onClose();
      }
    }
  };

  const questionText = isDay7 ? stageSpec.prompt : scenario.eveningPrompt;

  const accentClasses: Record<
    DecisionOptionSpec['badgeColor'],
    { border: string; badge: string; btn: string }
  > = {
    sky: {
      border: 'border-[#79C8E8]/60 hover:border-[#79C8E8]',
      badge: 'bg-[#79C8E8]/15 text-[#79C8E8]',
      btn: 'bg-[#79C8E8] hover:bg-[#5eb8dc] text-[#090D16]',
    },
    amber: {
      border: 'border-[#FFD66B]/60 hover:border-[#FFD66B]',
      badge: 'bg-[#FFD66B]/15 text-[#FFD66B]',
      btn: 'bg-[#FFD66B] hover:bg-[#f2c44c] text-[#090D16]',
    },
    mint: {
      border: 'border-[#9BD8A7]/60 hover:border-[#9BD8A7]',
      badge: 'bg-[#9BD8A7]/15 text-[#9BD8A7]',
      btn: 'bg-[#9BD8A7] hover:bg-[#7fc98e] text-[#090D16]',
    },
    purple: {
      border: 'border-[#A995E8]/60 hover:border-[#A995E8]',
      badge: 'bg-[#A995E8]/15 text-[#A995E8]',
      btn: 'bg-[#A995E8] hover:bg-[#937de0] text-[#090D16]',
    },
  };

  const gridColsClass =
    activeOptions.length >= 3
      ? 'grid-cols-1 md:grid-cols-3 gap-2.5'
      : 'grid-cols-1 md:grid-cols-2 gap-3';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/82 backdrop-blur-sm p-3 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-modal-question"
    >
      <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-3xl bg-[#0F172A] border-2 border-[#79C8E8]/60 shadow-2xl p-3 sm:p-3.5 flex flex-col gap-2">
        {/* Top Header: Crew Avatar + Prompt + Story Ripple */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#1E293B] border border-slate-700 px-3 py-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-1 rounded-2xl bg-[#0F172A] border-2 shrink-0"
              style={{ borderColor: crewProfile.accentColor }}
            >
              <CrewAvatar
                crewId={featuredCrewId}
                expression={isDay7 ? 'alert' : 'focused'}
                size="sm"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#79C8E8]">
                  Sol {state.day} Decision • {crewProfile.name}
                </span>
                <span className="text-[11px] font-bold text-[#A995E8] truncate">
                  • {storyRipple}
                </span>
              </div>
              <h2
                id="decision-modal-question"
                className="text-base sm:text-lg font-extrabold text-[#F8FAFC] leading-snug mt-0.5"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                {questionText}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playCue('click');
              onClose();
            }}
            aria-label="Close decision modal"
            className="w-8 h-8 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-600 text-slate-300 hover:text-[#F8FAFC] font-extrabold text-sm cursor-pointer shrink-0 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Day 7 Sequential 3-Stage Stepper */}
        {isDay7 ? (
          <div
            className="grid grid-cols-3 gap-2"
            aria-label="Sol 7 autonomous recovery stages"
          >
            {([1, 2, 3] as const).map((stageNum) => {
              const spec = DAY7_STAGE_SPECS[stageNum];
              const isDone =
                stageNum === 1
                  ? state.day7StagesCompleted.stage1
                  : stageNum === 2
                    ? state.day7StagesCompleted.stage2
                    : state.day7StagesCompleted.stage3;
              const isActive = stageNum === activeDay7Stage && !isDone;
              return (
                <div
                  key={stageNum}
                  className={`rounded-xl px-2.5 py-1.5 border text-xs font-extrabold flex items-center justify-between gap-1.5 ${
                    isDone
                      ? 'bg-[#9BD8A7]/15 border-[#9BD8A7]/60 text-[#9BD8A7]'
                      : isActive
                        ? 'bg-[#FFD66B]/15 border-[#FFD66B] text-[#FFD66B]'
                        : 'bg-[#11192E] border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="truncate">
                    {isDone ? '✓ ' : `${stageNum}. `}
                    {spec.title}
                  </span>
                  <span className="text-[10px] uppercase shrink-0">
                    {isDone ? 'Done' : isActive ? 'Now' : 'Next'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Restored 3-Box NASA Data Badge Strip (ADR-0004) */}
        <NasaDataBadge day={state.day} compact />

        {/* Option Cards (2 cards normally, 3 cards on Day 3) */}
        <div className={`grid ${gridColsClass} min-h-0`}>
          {activeOptions.map((opt) => {
            const theme = accentClasses[opt.badgeColor];
            const meta = getChoiceVisualMeta(opt.choiceId, state);
            const effectiveDeltas = getEffectiveDeltas(state, opt);
            const pills = buildDeltaPills(effectiveDeltas);
            const requirementUnmet = opt.requires ? !opt.requires.check(state) : false;

            return (
              <div
                key={opt.choiceId}
                className={`rounded-2xl bg-[#11192E] border-2 ${
                  requirementUnmet
                    ? 'border-slate-700 opacity-75'
                    : meta.isRisky
                      ? 'border-[#F87171]/70 hover:border-[#F87171]'
                      : theme.border
                } p-2.5 flex flex-col justify-between gap-1.5 transition-colors`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-xl ${theme.badge} flex items-center justify-center text-lg shrink-0`}
                        aria-hidden="true"
                      >
                        {meta.icon}
                      </span>
                      <h3
                        className="text-sm sm:text-base font-extrabold text-[#F8FAFC] leading-tight"
                        style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
                      >
                        {opt.label}
                      </h3>
                    </div>

                    {opt.requires ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                          requirementUnmet
                            ? 'bg-[#F87171]/15 border-[#F87171]/70 text-[#F87171]'
                            : 'bg-[#9BD8A7]/15 border-[#9BD8A7]/60 text-[#9BD8A7]'
                        }`}
                      >
                        {requirementUnmet ? `🔒 ${opt.requires.label}` : `✓ ${opt.requires.label}`}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs font-bold text-slate-200 leading-tight">
                    {opt.shortSummary}
                  </p>

                  {/* Base Impact & Crew Impact Badges */}
                  <div
                    className={`grid gap-1 text-[11px] font-bold ${
                      activeOptions.length >= 3 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                    }`}
                  >
                    <div className="rounded-lg bg-[#0B1222] border border-slate-700/80 px-2 py-1 text-[#79C8E8] leading-tight">
                      🏗️ {meta.baseImpact}
                    </div>
                    <div className="rounded-lg bg-[#0B1222] border border-slate-700/80 px-2 py-1 text-[#FFD66B] leading-tight">
                      👩‍🚀 {meta.crewImpact}
                    </div>
                  </div>

                  {/* Visual Metric Impact Pills */}
                  <div className="flex flex-wrap gap-1">
                    {pills.map((pill) => {
                      const isFatigue = pill.key === 'crewFatigue';
                      const good = isFatigue ? pill.delta < 0 : pill.delta > 0;
                      return (
                        <span
                          key={pill.key}
                          className={`px-1.5 py-0.5 rounded-md text-[10.5px] font-extrabold border flex items-center gap-1 ${
                            good
                              ? 'bg-[#9BD8A7]/15 border-[#9BD8A7]/50 text-[#9BD8A7]'
                              : 'bg-[#F87171]/15 border-[#F87171]/50 text-[#F87171]'
                          }`}
                        >
                          <span aria-hidden="true">{pill.icon}</span>
                          <span>
                            {pill.label} {pill.delta > 0 ? `+${pill.delta}` : pill.delta}
                          </span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Ending Path Hint */}
                  <div className="text-[11px] font-bold text-[#A995E8] leading-tight">
                    🧭 {meta.endingHint}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={requirementUnmet}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full py-2 px-3 rounded-xl text-sm font-extrabold tracking-wide shadow-md transition-colors ${
                    requirementUnmet
                      ? 'bg-slate-800 text-slate-400 border border-slate-600 cursor-not-allowed'
                      : `${theme.btn} cursor-pointer`
                  }`}
                  style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
                >
                  {requirementUnmet
                    ? `LOCKED (${opt.requires?.label ?? 'Requirement Unmet'})`
                    : isDay7
                      ? `LOCK STAGE ${activeDay7Stage} →`
                      : 'CHOOSE THIS →'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Footer: Earth Uplink + Live Readiness Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundEngine.playCue(isBlackout ? 'comms_static' : 'radio_ping');
              onOpenAiAdvisor();
            }}
            className={`px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer transition-colors ${
              isBlackout
                ? 'bg-[#2A1119] border-[#F87171]/80 text-[#F87171] hover:bg-[#381621]'
                : 'bg-[#1E293B] border-[#79C8E8]/50 text-[#79C8E8] hover:bg-slate-800'
            }`}
          >
            <span aria-hidden="true">{isBlackout ? '⚡' : '📞'}</span>
            <span>
              {isBlackout
                ? 'COMMS BLACKOUT — Inspect Static Screen'
                : 'Ask Abdul — Earth Uplink (2.6s Delay)'}
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold text-slate-200">
            <span className="px-2.5 py-1 rounded-lg bg-[#11192E] border border-slate-700">
              💧 Water: {Math.round(state.sub.waterAvailability)}%
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#11192E] border border-slate-700">
              🔋 Rover: {Math.round(state.sub.roverBattery)}%
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#11192E] border border-slate-700">
              🩺 Medkits: {Math.round(state.sub.medicalSupplies)}%
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#11192E] border border-[#A995E8]/50 text-[#A995E8]">
              🔬 Science: {Math.round(state.sub.scienceScore)} / 75
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
