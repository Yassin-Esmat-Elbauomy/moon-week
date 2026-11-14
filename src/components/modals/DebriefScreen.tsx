import React, { useMemo, useState } from 'react';
import { simulateWhatIfTimeline } from '../../simulation/engine';
import * as soundEngine from '../../services/soundEngine';
import type {
  ChoiceId,
  DayNumber,
  EndingId,
  GameAction,
  GameState,
  JumpTarget,
  PrimaryResources,
} from '../../types/game';

export interface DebriefScreenProps {
  state: Readonly<GameState>;
  dispatch: (action: GameAction) => void;
  onPlayAgain?: () => void;
  onPreviewEnding?: (ending: EndingId) => void;
}

interface ChoiceOptionMeta {
  choiceId: ChoiceId;
  shortLabel: string;
  baseEffect: string;
  crewEffect: string;
}

interface DayCausalSpec {
  day: DayNumber;
  topic: string;
  options: readonly ChoiceOptionMeta[];
}

const DAY_CAUSAL_SPECS: readonly DayCausalSpec[] = [
  {
    day: 1,
    topic: 'Landing Site',
    options: [
      {
        choiceId: '1A_sunlit_ridge',
        shortLabel: '☀️ Sun Peak',
        baseEffect: '+6 kW/day solar array',
        crewEffect: '-10 Sol 4 storm cover',
      },
      {
        choiceId: '1B_crater_shadow',
        shortLabel: '🌑 Crater Rim',
        baseEffect: '+10 Shield rock berm & ice',
        crewEffect: '-4 kW/day in shadows',
      },
    ],
  },
  {
    day: 2,
    topic: 'Garden Pipes',
    options: [
      {
        choiceId: '2A_active_pumps',
        shortLabel: '⚡ Electric Pumps',
        baseEffect: 'Lush crops (+8 Air/Food)',
        crewEffect: 'Stalls if Power < 25%',
      },
      {
        choiceId: '2B_capillary_ponds',
        shortLabel: '🌱 Capillary Wicks',
        baseEffect: '0 kW passive PONDS tubes',
        crewEffect: '+8 Fatigue/day tending',
      },
    ],
  },
  {
    day: 3,
    topic: 'Dust & Power',
    options: [
      {
        choiceId: '3B_battery_storage',
        shortLabel: '🔋 Bank Battery',
        baseEffect: 'Buffers Sol 4 storm + 100% Rover',
        crewEffect: 'Frost walls & +15 Fatigue',
      },
      {
        choiceId: '3A_essential_heating',
        shortLabel: '🔥 Warm Cabins',
        baseEffect: 'Cozy rooms (55% Rover cap)',
        crewEffect: 'No Sol 4 storm buffer',
      },
      {
        choiceId: '3C_overclock_regulators',
        shortLabel: '⚙️ Overclock Bus',
        baseEffect: 'Sparking conduits (+10 kW)',
        crewEffect: 'Sol 7 -10 kW fault risk',
      },
    ],
  },
  {
    day: 4,
    topic: 'Solar Storm',
    options: [
      {
        choiceId: '4A_max_shielding',
        shortLabel: '🛡️ Water-Wall',
        baseEffect: 'Cyan dome & sealed shutters',
        crewEffect: '-25 kW surge (safe mSv)',
      },
      {
        choiceId: '4B_partial_shielding',
        shortLabel: '⚠️ Half Shield',
        baseEffect: 'Saves kW, warning lights',
        crewEffect: '-12 Health & -10 Medkits',
      },
    ],
  },
  {
    day: 5,
    topic: 'CO2 & Sleep',
    options: [
      {
        choiceId: '5A_full_rest',
        shortLabel: '🌙 600nm Full Rest',
        baseEffect: 'Clean O2 sparkles (-25 Medkits)',
        crewEffect: 'Sharp (+5 Sol 7 Morale)',
      },
      {
        choiceId: '5B_rationed_split_shift',
        shortLabel: '🔬 Split Shift',
        baseEffect: '+10 Science & saves Medkits',
        crewEffect: '-8 Sol 7 Morale fatigue',
      },
    ],
  },
  {
    day: 6,
    topic: 'Rover Sortie',
    options: [
      {
        choiceId: '6A_crater_ice',
        shortLabel: '🧊 Drill Ice',
        baseEffect: 'Ice canisters (+25 Water/Sci)',
        crewEffect: 'Relay left unreinforced',
      },
      {
        choiceId: '6B_comms_maintenance',
        shortLabel: '📡 Fix Relay',
        baseEffect: 'Upgraded dish & clean solar',
        crewEffect: '+10 kW in Sol 7 Stage 3',
      },
    ],
  },
  {
    day: 7,
    topic: 'Blackout Rescue',
    options: [
      {
        choiceId: '7_3A_phased_array_lock',
        shortLabel: '📡 Phased Lock',
        baseEffect: 'Full dish & Rover bus tap',
        crewEffect: '+15 Science carrier lock',
      },
      {
        choiceId: '7_3B_emergency_beacon',
        shortLabel: '🛡️ Safe Beacon',
        baseEffect: 'Low-watt backup signal',
        crewEffect: 'Gentle -5 kW & +5 Morale',
      },
    ],
  },
];

interface EndingCardSpec {
  id: EndingId;
  jumpTarget: JumpTarget;
  trophy: string;
  title: string;
  rule: string;
  accentText: string;
  borderClass: string;
  activeBgClass: string;
}

const ALL_ENDING_CARDS: readonly EndingCardSpec[] = [
  {
    id: 'SCIENTIFIC_BREAKTHROUGH',
    jumpTarget: 'ending_scientific_breakthrough',
    trophy: '🏆',
    title: 'Scientific Breakthrough',
    rule: 'All 4 meters >= 60% and Science >= 75',
    accentText: 'text-[#FFD66B]',
    borderClass: 'border-[#FFD66B]/75',
    activeBgClass: 'bg-[#FFD66B]/12',
  },
  {
    id: 'MISSION_ACCOMPLISHED',
    jumpTarget: 'ending_mission_accomplished',
    trophy: '🚀',
    title: 'Mission Accomplished',
    rule: 'All 4 meters >= 50% (crew safe & steady)',
    accentText: 'text-[#9BD8A7]',
    borderClass: 'border-[#9BD8A7]/75',
    activeBgClass: 'bg-[#9BD8A7]/12',
  },
  {
    id: 'CRITICAL_SURVIVAL',
    jumpTarget: 'ending_critical_survival',
    trophy: '🛡️',
    title: 'Critical Survival',
    rule: 'All 4 meters > 0%, at least one < 50%',
    accentText: 'text-[#79C8E8]',
    borderClass: 'border-[#79C8E8]/75',
    activeBgClass: 'bg-[#79C8E8]/12',
  },
  {
    id: 'MISSION_FAILURE',
    jumpTarget: 'ending_mission_failure',
    trophy: '🛸',
    title: 'Safe Abort Rescue',
    rule: 'Any primary meter hit 0% (crew rescued)',
    accentText: 'text-[#A995E8]',
    borderClass: 'border-[#A995E8]/75',
    activeBgClass: 'bg-[#A995E8]/12',
  },
];

function findEndingCard(ending: EndingId): EndingCardSpec {
  return ALL_ENDING_CARDS.find((card) => card.id === ending) ?? ALL_ENDING_CARDS[1]!;
}

export const DebriefScreen: React.FC<DebriefScreenProps> = ({
  state,
  dispatch,
  onPlayAgain,
  onPreviewEnding,
}) => {
  const [overrides, setOverrides] = useState<Record<number, ChoiceId>>({});

  const hasOverrides = Object.keys(overrides).length > 0;

  const whatIfResult = useMemo(() => {
    if (!hasOverrides) return null;
    return simulateWhatIfTimeline(state.decisions, overrides);
  }, [hasOverrides, overrides, state.decisions]);

  const activePrimary: PrimaryResources = whatIfResult
    ? whatIfResult.finalPrimary
    : state.primary;
  const activeScience: number = whatIfResult
    ? whatIfResult.finalSub.scienceScore
    : state.sub.scienceScore;
  const activeEnding: EndingId = whatIfResult
    ? whatIfResult.ending
    : (state.ending ?? 'MISSION_ACCOMPLISHED');
  const achievedEnding: EndingId = state.ending ?? 'MISSION_ACCOMPLISHED';
  const activeCard = findEndingCard(activeEnding);

  const getActiveChoiceForDay = (spec: DayCausalSpec): ChoiceId => {
    if (spec.day === 7) {
      return (
        overrides[73] ??
        state.decisions.find((d) => d.day === 7 && d.stage === 3)?.choiceId ??
        spec.options[0]!.choiceId
      );
    }
    return (
      overrides[spec.day] ??
      state.decisions.find((d) => d.day === spec.day)?.choiceId ??
      spec.options[0]!.choiceId
    );
  };

  const handleCycleDayChoice = (spec: DayCausalSpec) => {
    soundEngine.playCue('click');
    const currentChoice = getActiveChoiceForDay(spec);
    const currentIdx = spec.options.findIndex((opt) => opt.choiceId === currentChoice);
    const nextOption = spec.options[(currentIdx + 1) % spec.options.length] ?? spec.options[0]!;

    setOverrides((prev) => {
      if (spec.day === 7) {
        const useScience = nextOption.choiceId === '7_3A_phased_array_lock';
        return {
          ...prev,
          71: useScience ? '7_1A_rover_bus_tap' : '7_1B_manual_bypass',
          72: useScience ? '7_2A_medbay_o2_divert' : '7_2B_seal_greenhouse',
          73: nextOption.choiceId,
        };
      }
      return {
        ...prev,
        [spec.day]: nextOption.choiceId,
      };
    });
  };

  const handleWatchEnding = (ending: EndingId, jumpTarget: JumpTarget) => {
    soundEngine.playCue('confirm');
    if (onPreviewEnding) {
      onPreviewEnding(ending);
      return;
    }
    if (ending === achievedEnding && !hasOverrides) {
      dispatch({ kind: 'REPLAY_ENDING_CUTSCENE' });
      return;
    }
    dispatch({ kind: 'JUMP_TO_TARGET', target: jumpTarget });
  };

  const bars: Array<{ icon: string; label: string; value: number; colorClass: string }> = [
    { icon: '⚡', label: 'Power', value: activePrimary.power, colorClass: 'bg-[#FFD66B]' },
    { icon: '💧', label: 'Air', value: activePrimary.lifeSupport, colorClass: 'bg-[#79C8E8]' },
    { icon: '🛡️', label: 'Shield', value: activePrimary.shielding, colorClass: 'bg-[#A995E8]' },
    { icon: '😊', label: 'Morale', value: activePrimary.crewReadiness, colorClass: 'bg-[#9BD8A7]' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#090D16] text-[#F8FAFC] flex items-center justify-center p-3 select-none">
      <div
        className={`w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-3xl bg-[#0F172A] border-2 ${activeCard.borderClass} shadow-2xl p-4 flex flex-col gap-3`}
      >
        {/* Top Banner + Live Primary Resource Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#11192E] border border-slate-700/80 px-4 py-2.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl bg-[#1E293B] border-2 ${activeCard.borderClass} flex items-center justify-center text-2xl shrink-0`}
              aria-hidden="true"
            >
              {activeCard.trophy}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                  {hasOverrides ? '🧪 WHAT-IF TIMELINE PREVIEW' : '🌙 7-DAY MISSION DEBRIEF'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#A995E8]/20 border border-[#A995E8]/50 text-[11px] font-extrabold text-[#A995E8]">
                  🔬 Science {activeScience}
                </span>
              </div>
              <h1
                className={`text-xl sm:text-2xl font-extrabold tracking-tight truncate ${activeCard.accentText}`}
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                {activeCard.title}
              </h1>
            </div>
          </div>

          {/* Compact 4 Final Resource Bars */}
          <div className="flex items-center gap-2 flex-wrap">
            {bars.map((bar) => {
              const pct = Math.max(0, Math.min(100, Math.round(bar.value)));
              return (
                <div
                  key={bar.label}
                  className="w-24 rounded-xl bg-[#0F172A] border border-slate-700/80 px-2.5 py-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                    <span className="text-slate-200">
                      {bar.icon} {bar.label}
                    </span>
                    <span className="tabular-nums text-[#F8FAFC]">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ${bar.colorClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {hasOverrides ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCue('click');
                  setOverrides({});
                }}
                className="px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-[#79C8E8]/60 text-xs font-extrabold text-[#79C8E8] cursor-pointer whitespace-nowrap"
              >
                ↩ Reset Run
              </button>
            ) : null}
          </div>
        </div>

        {/* Main 2-Column Cockpit: Left = 4 Alternative Endings | Right = Causal Choice Chain + What-If */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 flex-1 overflow-hidden">
          {/* Left Column: All 4 Alternative Ending Cards + Watch Ending Buttons */}
          <section
            aria-label="Alternative Mission Endings"
            className="lg:col-span-5 rounded-2xl bg-[#11192E] border border-slate-700/80 p-3 flex flex-col gap-2 min-h-0"
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-sm font-extrabold uppercase tracking-wider text-[#FFD66B]"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                🎬 4 Alternative Endings
              </h2>
              <span className="text-[11px] font-bold text-slate-400">
                Watch any ending!
              </span>
            </div>

            <div className="flex flex-col gap-2 flex-1 justify-between">
              {ALL_ENDING_CARDS.map((card) => {
                const isAchieved = card.id === achievedEnding;
                const isWhatIfTarget = hasOverrides && card.id === activeEnding;
                const isHighlighted = isAchieved || isWhatIfTarget;

                return (
                  <div
                    key={card.id}
                    className={`rounded-xl border-2 px-3 py-2 flex items-center justify-between gap-2.5 transition-colors ${
                      isHighlighted
                        ? `${card.borderClass} ${card.activeBgClass}`
                        : 'border-slate-700/80 bg-[#0F172A]/85'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0" aria-hidden="true">
                        {card.trophy}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-sm font-extrabold truncate ${card.accentText}`}>
                            {card.title}
                          </span>
                          {isAchieved ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#9BD8A7] text-[#090D16] text-[10px] font-extrabold uppercase">
                              Achieved
                            </span>
                          ) : null}
                          {isWhatIfTarget && !isAchieved ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#79C8E8] text-[#090D16] text-[10px] font-extrabold uppercase">
                              What-If
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] font-bold text-slate-300 truncate">
                          {card.rule}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleWatchEnding(card.id, card.jumpTarget)}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 border border-[#79C8E8]/55 text-[11px] font-extrabold text-[#F8FAFC] cursor-pointer whitespace-nowrap"
                    >
                      Watch Ending
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Column: Day 1-7 Causal Choice Chain + Interactive What-If Choice Simulator */}
          <section
            aria-label="Causal Choice Chain and What-If Simulator"
            className="lg:col-span-7 rounded-2xl bg-[#11192E] border border-slate-700/80 p-3 flex flex-col gap-2 min-h-0"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                className="text-sm font-extrabold uppercase tracking-wider text-[#79C8E8]"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                🔗 How Your Choices Shaped Base &amp; Crew
              </h2>
              <span className="text-[11px] font-extrabold text-[#FFD66B]">
                Tap any Day to test What-If!
              </span>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 justify-between">
              {DAY_CAUSAL_SPECS.map((spec) => {
                const currentChoice = getActiveChoiceForDay(spec);
                const meta =
                  spec.options.find((opt) => opt.choiceId === currentChoice) ?? spec.options[0]!;
                const isOverridden =
                  spec.day === 7 ? overrides[73] !== undefined : overrides[spec.day] !== undefined;

                return (
                  <div
                    key={spec.day}
                    className={`rounded-xl border px-2.5 py-1.5 flex items-center justify-between gap-2 transition-colors ${
                      isOverridden
                        ? 'bg-[#79C8E8]/12 border-[#79C8E8]'
                        : 'bg-[#0F172A]/85 border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-11 text-center py-0.5 rounded-lg bg-[#1E293B] border border-slate-600 text-[11px] font-extrabold text-slate-200">
                        DAY {spec.day}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCycleDayChoice(spec)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold cursor-pointer whitespace-nowrap transition-colors ${
                          isOverridden
                            ? 'bg-[#79C8E8] text-[#090D16] border-[#79C8E8]'
                            : 'bg-[#1E293B] hover:border-[#FFD66B] text-[#FFD66B] border-slate-600'
                        }`}
                      >
                        {meta.shortLabel} ↻
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 flex items-center justify-end gap-2 text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-[#1E293B] text-[#79C8E8] truncate">
                        🏠 {meta.baseEffect}
                      </span>
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#1E293B] text-[#9BD8A7] truncate">
                        👩‍🚀 {meta.crewEffect}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Bottom Action Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playCue('confirm');
              if (onPlayAgain) {
                onPlayAgain();
              } else {
                dispatch({ kind: 'START_NEW_MISSION' });
              }
            }}
            className="py-3 px-5 rounded-2xl bg-[#9BD8A7] hover:bg-[#7fc98e] text-[#090D16] text-base font-extrabold cursor-pointer shadow-lg shadow-[#9BD8A7]/20 transition-colors"
            style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
          >
            🔄 PLAY AGAIN
          </button>

          <button
            type="button"
            onClick={() => handleWatchEnding(activeEnding, activeCard.jumpTarget)}
            className="py-3 px-5 rounded-2xl bg-[#1E293B] hover:bg-slate-700 border-2 border-[#79C8E8]/60 text-[#F8FAFC] text-base font-extrabold cursor-pointer transition-colors"
            style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
          >
            🎬 WATCH {hasOverrides ? 'WHAT-IF' : 'MY'} ENDING
          </button>
        </div>
      </div>
    </div>
  );
};
