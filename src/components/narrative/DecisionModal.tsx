import React, { useMemo, useState } from 'react';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import { CREW_PROFILES } from '../../data/crewProfiles';
import { DAILY_SCENARIOS } from '../../data/dailyScenarios';
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
 * and game rule when referenced externally.
 */
export const NasaDataBadge: React.FC<NasaDataBadgeProps> = ({ day }) => {
  const dataset = VERIFIED_NASA_DATASETS[day];
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

const SHORT_NASA_FACTS: Record<DayNumber, string> = {
  1: 'NASA LRO shows South Pole peaks stay sunny while deep craters trap ancient ice!',
  2: 'NASA ISS Veggie grows space lettuce using water wicks that climb without electric pumps!',
  3: 'Sharp lunar dust clings to solar panels, so stored battery power saves missions overnight!',
  4: 'NASA satellites warn bases when solar flares shoot radiation storms toward the Moon!',
  5: 'NASA Human Research shows restful sleep keeps astronauts calm and prevents costly errors!',
  6: 'NASA Artemis rovers scout cold crater shadows for frozen water used as air and rocket fuel!',
  7: 'Solar blasts can block Earth radio, so Moon crews keep backup power and dishes ready!',
};

interface CompactChoiceCard {
  id: string;
  icon: string;
  title: string;
  summary: string;
  deltas: ResourceDeltas;
  accent: 'sky' | 'amber' | 'mint' | 'purple';
  onSelect: () => void;
}

interface MeterPill {
  key: string;
  icon: string;
  label: string;
  delta: number;
}

function getChoiceIcon(choiceId: ChoiceId): string {
  switch (choiceId) {
    case '1A_sunlit_ridge':
      return '☀️';
    case '1B_crater_shadow':
      return '🌑';
    case '2A_active_pumps':
      return '⚡';
    case '2B_capillary_ponds':
      return '🌱';
    case '3A_essential_heating':
      return '🔥';
    case '3B_battery_storage':
      return '🔋';
    case '3C_overclock_regulators':
      return '⚙️';
    case '4A_max_shielding':
      return '🛡️';
    case '4B_partial_shielding':
      return '⚠️';
    case '5A_full_rest':
      return '🎬';
    case '5B_rationed_split_shift':
      return '🔬';
    case '6A_crater_ice':
      return '🧊';
    case '6B_comms_maintenance':
      return '📡';
    case '7_1A_rover_bus_tap':
    case '7_2A_medbay_o2_divert':
    case '7_3A_phased_array_lock':
      return '📡';
    case '7_1B_manual_bypass':
    case '7_2B_seal_greenhouse':
    case '7_3B_emergency_beacon':
      return '🛡️';
    default: {
      const _exhaustive: never = choiceId;
      return _exhaustive;
    }
  }
}

function buildDeltaPills(deltas: ResourceDeltas): MeterPill[] {
  const specs: Array<{ key: keyof ResourceDeltas; icon: string; label: string }> = [
    { key: 'power', icon: '⚡', label: 'Power' },
    { key: 'lifeSupport', icon: '💧', label: 'Air' },
    { key: 'shielding', icon: '🛡️', label: 'Shield' },
    { key: 'crewReadiness', icon: '😊', label: 'Morale' },
    { key: 'scienceScore', icon: '🔬', label: 'Science' },
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
  if (pills.length === 0) {
    const fallbackSpecs: Array<{ key: keyof ResourceDeltas; icon: string; label: string }> = [
      { key: 'waterAvailability', icon: '💧', label: 'Water' },
      { key: 'foodAndSupplies', icon: '🌿', label: 'Food' },
      { key: 'medicalSupplies', icon: '🩺', label: 'Medkits' },
      { key: 'roverBattery', icon: '🔋', label: 'Rover' },
    ];
    for (const spec of fallbackSpecs) {
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
  }
  return pills.slice(0, 4);
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
  const [showNasaFact, setShowNasaFact] = useState(false);

  const featuredCrewId = FEATURED_CREW_BY_DAY[state.day];
  const crewProfile = CREW_PROFILES[featuredCrewId];
  const scenario = DAILY_SCENARIOS[state.day];
  const isDay7 = state.day === 7;
  const isBlackout = isDay7 && state.commsBlackout;

  const cards: CompactChoiceCard[] = useMemo(() => {
    if (!isDay7) {
      const filteredOptions: DecisionOptionSpec[] = scenario.options
        .filter((opt) => opt.choiceId !== '3C_overclock_regulators')
        .slice(0, 2);

      return filteredOptions.map((opt) => ({
        id: opt.choiceId,
        icon: getChoiceIcon(opt.choiceId),
        title: opt.label,
        summary: opt.shortSummary,
        deltas: opt.immediateDeltas,
        accent: opt.badgeColor,
        onSelect: () => {
          const completedDay = state.day;
          soundEngine.playCue('confirm');
          dispatch({ kind: 'APPLY_EVENING_DECISION', choiceId: opt.choiceId });
          dispatch({ kind: 'ADVANCE_SHIFT' });
          if (onDecisionComplete) {
            onDecisionComplete(completedDay);
          } else {
            onClose();
          }
        },
      }));
    }

    const canTapRover = state.sub.roverBattery >= 30;
    const canDivertO2 = state.sub.medicalSupplies >= 20;

    const beaconDeltas: ResourceDeltas = {
      power:
        (canTapRover ? 15 : 5) +
        (state.flags.relayReinforced ? 10 : -15),
      lifeSupport: (canTapRover ? 5 : 0) + (canDivertO2 ? 15 : 5),
      shielding: (canTapRover ? 0 : state.flags.hardwareFaultRisk ? -8 : 0) + (state.flags.relayReinforced ? 10 : 5),
      crewReadiness: canTapRover
        ? canDivertO2
          ? 10 + (state.flags.crisisResilience ? 5 : 0)
          : -8
        : -10,
      scienceScore: (canDivertO2 ? 10 : -5) + (state.flags.relayReinforced ? 15 : 10),
    };

    const shelterDeltas: ResourceDeltas = {
      power: 0,
      lifeSupport: 5,
      shielding: 5 + (state.flags.hardwareFaultRisk ? -8 : 0),
      crewReadiness: -13,
      scienceScore: -5,
    };

    return [
      {
        id: 'day7_card_a',
        icon: '📡',
        title: 'Launch Science Beacon',
        summary: 'Boost full array power for maximum science.',
        deltas: beaconDeltas,
        accent: 'sky',
        onSelect: () => {
          soundEngine.playCue('confirm');
          const s1: ChoiceId = canTapRover ? '7_1A_rover_bus_tap' : '7_1B_manual_bypass';
          const s2: ChoiceId = canDivertO2 ? '7_2A_medbay_o2_divert' : '7_2B_seal_greenhouse';
          const s3: ChoiceId = '7_3A_phased_array_lock';
          dispatch({ kind: 'APPLY_DAY7_STAGE_DECISION', stage: 1, choiceId: s1 });
          dispatch({ kind: 'APPLY_DAY7_STAGE_DECISION', stage: 2, choiceId: s2 });
          dispatch({ kind: 'APPLY_DAY7_STAGE_DECISION', stage: 3, choiceId: s3 });
          dispatch({ kind: 'ADVANCE_SHIFT' });
          if (onDecisionComplete) {
            onDecisionComplete(7);
          } else {
            onClose();
          }
        },
      },
      {
        id: 'day7_card_b',
        icon: '🛡️',
        title: 'Safe Shelter Mode',
        summary: 'Save cabin power and hold steady safely.',
        deltas: shelterDeltas,
        accent: 'mint',
        onSelect: () => {
          soundEngine.playCue('confirm');
          dispatch({
            kind: 'APPLY_DAY7_STAGE_DECISION',
            stage: 1,
            choiceId: '7_1B_manual_bypass',
          });
          dispatch({
            kind: 'APPLY_DAY7_STAGE_DECISION',
            stage: 2,
            choiceId: '7_2B_seal_greenhouse',
          });
          dispatch({
            kind: 'APPLY_DAY7_STAGE_DECISION',
            stage: 3,
            choiceId: '7_3B_emergency_beacon',
          });
          dispatch({ kind: 'ADVANCE_SHIFT' });
          if (onDecisionComplete) {
            onDecisionComplete(7);
          } else {
            onClose();
          }
        },
      },
    ];
  }, [dispatch, isDay7, onClose, onDecisionComplete, scenario.options, state.day, state.flags.crisisResilience, state.flags.hardwareFaultRisk, state.flags.relayReinforced, state.sub.medicalSupplies, state.sub.roverBattery]);

  const questionText = isDay7
    ? 'Earth radio is out! Pick how our Moon base handles Day 7.'
    : scenario.eveningPrompt;

  const accentClasses: Record<CompactChoiceCard['accent'], { border: string; badge: string; btn: string }> = {
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

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/80 backdrop-blur-sm p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-modal-question"
    >
      <div className="w-full max-w-3xl rounded-3xl bg-[#0F172A] border-2 border-[#79C8E8]/60 shadow-2xl p-5 sm:p-6 flex flex-col gap-4">
        {/* Top Header: Crew Avatar + 1 Short Question */}
        <div className="flex items-center gap-4 rounded-2xl bg-[#1E293B] border border-slate-700 p-3.5">
          <div
            className="p-1.5 rounded-2xl bg-[#0F172A] border-2 shrink-0"
            style={{ borderColor: crewProfile.accentColor }}
          >
            <CrewAvatar
              crewId={featuredCrewId}
              expression={isDay7 ? 'alert' : 'focused'}
              size="md"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#79C8E8]">
              DAY {state.day} CHOICE • {crewProfile.name}
            </span>
            <h2
              id="decision-modal-question"
              className="text-xl font-bold text-[#F8FAFC] leading-snug mt-0.5"
              style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
            >
              {questionText}
            </h2>
          </div>
        </div>

        {/* Strictly 2 Big Side-by-Side Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => {
            const theme = accentClasses[card.accent];
            const pills = buildDeltaPills(card.deltas);
            return (
              <div
                key={card.id}
                className={`rounded-2xl bg-[#11192E] border-2 ${theme.border} p-4 flex flex-col justify-between gap-4 transition-colors`}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-12 h-12 rounded-2xl ${theme.badge} flex items-center justify-center text-3xl shrink-0`}
                      aria-hidden="true"
                    >
                      {card.icon}
                    </span>
                    <h3
                      className="text-xl font-extrabold text-[#F8FAFC] leading-tight"
                      style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
                    >
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-sm font-bold text-slate-200 leading-snug">
                    {card.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pills.map((pill) => {
                      const positive = pill.delta > 0;
                      return (
                        <span
                          key={pill.key}
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border flex items-center gap-1 ${
                            positive
                              ? 'bg-[#9BD8A7]/15 border-[#9BD8A7]/50 text-[#9BD8A7]'
                              : 'bg-[#F87171]/15 border-[#F87171]/50 text-[#F87171]'
                          }`}
                        >
                          <span aria-hidden="true">{pill.icon}</span>
                          <span>
                            {pill.label} {positive ? `+${pill.delta}` : pill.delta}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={card.onSelect}
                  className={`w-full py-3.5 px-4 rounded-xl text-base font-extrabold tracking-wide shadow-md cursor-pointer transition-colors ${theme.btn}`}
                  style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
                >
                  CHOOSE THIS →
                </button>
              </div>
            );
          })}
        </div>

        {/* Compact Optional 1-Sentence NASA Fact Drawer */}
        {showNasaFact ? (
          <div className="rounded-xl bg-[#11192E] border border-[#FFD66B]/40 px-4 py-2.5 text-sm font-bold text-slate-100 flex items-center gap-2">
            <span aria-hidden="true">🛰️</span>
            <span>{SHORT_NASA_FACTS[state.day]}</span>
          </div>
        ) : null}

        {/* Bottom Footer: Ask Earth Control + Optional Tiny NASA Fact Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundEngine.playCue(isBlackout ? 'static_burst' : 'radio_ping');
              onOpenAiAdvisor();
            }}
            className={`px-4 py-2 rounded-xl border text-sm font-extrabold flex items-center gap-2 cursor-pointer transition-colors ${
              isBlackout
                ? 'bg-[#2A1119] border-[#F87171]/80 text-[#F87171] hover:bg-[#381621]'
                : 'bg-[#1E293B] border-[#79C8E8]/50 text-[#79C8E8] hover:bg-slate-800'
            }`}
          >
            <span aria-hidden="true">{isBlackout ? '⚡' : '📞'}</span>
            <span>
              {isBlackout
                ? 'RADIO BLACKOUT! Earth is offline—you decide!'
                : 'Ask Earth Control (1-Sentence Hint)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playCue('click');
              setShowNasaFact((prev) => !prev);
            }}
            aria-expanded={showNasaFact}
            className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-800 border border-slate-600 text-xs font-extrabold text-[#FFD66B] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span aria-hidden="true">📡</span>
            <span>{showNasaFact ? 'Hide NASA Fact' : 'NASA Fact'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
