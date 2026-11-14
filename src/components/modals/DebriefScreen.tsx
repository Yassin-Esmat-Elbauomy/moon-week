import React, { useMemo, useState } from 'react';
import { simulateWhatIfTimeline } from '../../simulation/engine';
import * as soundEngine from '../../services/soundEngine';
import type {
  ChoiceId,
  DayNumber,
  EndingId,
  GameAction,
  GameState,
  PrimaryResources,
} from '../../types/game';

export interface DebriefScreenProps {
  state: Readonly<GameState>;
  dispatch: (action: GameAction) => void;
  onPlayAgain?: () => void;
}

interface DayPairSpec {
  day: DayNumber;
  optionA: ChoiceId;
  optionB: ChoiceId;
  labelA: string;
  labelB: string;
}

const DAY_PAIR_SPECS: readonly DayPairSpec[] = [
  {
    day: 1,
    optionA: '1A_sunlit_ridge',
    optionB: '1B_crater_shadow',
    labelA: 'Sun Peak',
    labelB: 'Crater Rim',
  },
  {
    day: 2,
    optionA: '2A_active_pumps',
    optionB: '2B_capillary_ponds',
    labelA: 'Pumps',
    labelB: 'Water Tubes',
  },
  {
    day: 3,
    optionA: '3B_battery_storage',
    optionB: '3A_essential_heating',
    labelA: 'Save Power',
    labelB: 'Warm Pipes',
  },
  {
    day: 4,
    optionA: '4A_max_shielding',
    optionB: '4B_partial_shielding',
    labelA: 'Full Shield',
    labelB: 'Half Shield',
  },
  {
    day: 5,
    optionA: '5A_full_rest',
    optionB: '5B_rationed_split_shift',
    labelA: 'Movie Night',
    labelB: 'Extra Work',
  },
  {
    day: 6,
    optionA: '6A_crater_ice',
    optionB: '6B_comms_maintenance',
    labelA: 'Moon Ice',
    labelB: 'Fix Dish',
  },
  {
    day: 7,
    optionA: '7_3A_phased_array_lock',
    optionB: '7_3B_emergency_beacon',
    labelA: 'Science',
    labelB: 'Safe Mode',
  },
];

interface EndingVisualInfo {
  trophy: string;
  title: string;
  accentText: string;
  badgeBorder: string;
}

function getEndingVisual(ending: EndingId): EndingVisualInfo {
  switch (ending) {
    case 'SCIENTIFIC_BREAKTHROUGH':
      return {
        trophy: '🏆',
        title: '🌟 SUPER SCIENCE WIN!',
        accentText: 'text-[#FFD66B]',
        badgeBorder: 'border-[#FFD66B]/70',
      };
    case 'MISSION_ACCOMPLISHED':
      return {
        trophy: '🥇',
        title: '🚀 MISSION COMPLETE!',
        accentText: 'text-[#9BD8A7]',
        badgeBorder: 'border-[#9BD8A7]/70',
      };
    case 'CRITICAL_SURVIVAL':
      return {
        trophy: '🥈',
        title: '🛡️ SAFE SURVIVAL!',
        accentText: 'text-[#79C8E8]',
        badgeBorder: 'border-[#79C8E8]/70',
      };
    case 'MISSION_FAILURE':
      return {
        trophy: '🛸',
        title: '🛸 SAFE RESCUE POD!',
        accentText: 'text-[#A995E8]',
        badgeBorder: 'border-[#A995E8]/70',
      };
    default: {
      const _exhaustive: never = ending;
      return _exhaustive;
    }
  }
}

export const DebriefScreen: React.FC<DebriefScreenProps> = ({
  state,
  dispatch,
  onPlayAgain,
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
  const activeEnding: EndingId = whatIfResult
    ? whatIfResult.ending
    : (state.ending ?? 'MISSION_ACCOMPLISHED');
  const endingVisual = getEndingVisual(activeEnding);

  const getCurrentDayMode = (spec: DayPairSpec): 'A' | 'B' => {
    if (spec.day === 7) {
      const picked =
        overrides[73] ??
        state.decisions.find((d) => d.day === 7 && d.stage === 3)?.choiceId ??
        spec.optionA;
      return picked === spec.optionB ? 'B' : 'A';
    }
    const picked =
      overrides[spec.day] ??
      state.decisions.find((d) => d.day === spec.day)?.choiceId ??
      spec.optionA;
    return picked === spec.optionB ? 'B' : 'A';
  };

  const handleToggleDay = (spec: DayPairSpec) => {
    soundEngine.playCue('click');
    const currentMode = getCurrentDayMode(spec);
    const nextIsB = currentMode === 'A';
    setOverrides((prev) => {
      if (spec.day === 7) {
        return {
          ...prev,
          71: nextIsB ? '7_1B_manual_bypass' : '7_1A_rover_bus_tap',
          72: nextIsB ? '7_2B_seal_greenhouse' : '7_2A_medbay_o2_divert',
          73: nextIsB ? '7_3B_emergency_beacon' : '7_3A_phased_array_lock',
        };
      }
      return {
        ...prev,
        [spec.day]: nextIsB ? spec.optionB : spec.optionA,
      };
    });
  };

  const bars: Array<{ icon: string; label: string; value: number; colorClass: string }> = [
    { icon: '⚡', label: 'Power', value: activePrimary.power, colorClass: 'bg-[#FFD66B]' },
    { icon: '💧', label: 'Life Support', value: activePrimary.lifeSupport, colorClass: 'bg-[#79C8E8]' },
    { icon: '🛡️', label: 'Shield', value: activePrimary.shielding, colorClass: 'bg-[#A995E8]' },
    { icon: '😊', label: 'Crew Morale', value: activePrimary.crewReadiness, colorClass: 'bg-[#9BD8A7]' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#090D16] text-[#F8FAFC] flex items-center justify-center p-4 select-none">
      <div
        className={`w-full max-w-4xl rounded-3xl bg-[#0F172A] border-2 ${endingVisual.badgeBorder} shadow-2xl p-6 flex flex-col gap-5`}
      >
        {/* Top Trophy + Ending Title */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#11192E] border border-slate-700/80 px-5 py-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-[#1E293B] border-2 ${endingVisual.badgeBorder} flex items-center justify-center text-4xl shrink-0`}
              aria-hidden="true"
            >
              {endingVisual.trophy}
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                {hasOverrides ? '🧪 WHAT-IF TIMELINE PREVIEW' : '🌙 7-DAY MISSION SCORECARD'}
              </span>
              <h1
                className={`text-3xl font-extrabold tracking-tight ${endingVisual.accentText}`}
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                {endingVisual.title}
              </h1>
            </div>
          </div>

          {hasOverrides ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playCue('click');
                setOverrides({});
              }}
              className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-[#79C8E8]/60 text-xs font-extrabold text-[#79C8E8] cursor-pointer whitespace-nowrap"
            >
              ↩ Reset to My Run
            </button>
          ) : null}
        </div>

        {/* 4 Final Resource Bars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {bars.map((bar) => {
            const pct = Math.max(0, Math.min(100, Math.round(bar.value)));
            return (
              <div
                key={bar.label}
                className="rounded-2xl bg-[#11192E] border border-slate-700/80 p-3.5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-1 text-sm font-extrabold">
                  <span className="flex items-center gap-1.5 text-slate-100">
                    <span aria-hidden="true">{bar.icon}</span>
                    <span>{bar.label}</span>
                  </span>
                  <span className="tabular-nums text-[#F8FAFC]">{pct}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ${bar.colorClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Horizontal Day 1 -> Day 7 Choice Strip (What-If Toggle) */}
        <div className="rounded-2xl bg-[#11192E] border border-slate-700/80 p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-sm font-extrabold text-[#FFD66B] flex items-center gap-1.5"
              style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
            >
              <span aria-hidden="true">🎛️</span>
              <span>TAP ANY DAY TO TRY OTHER CHOICES!</span>
            </span>
            <span className="text-xs font-bold text-slate-300">
              See how the 4 bars change!
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {DAY_PAIR_SPECS.map((spec) => {
              const mode = getCurrentDayMode(spec);
              const isOverridden =
                spec.day === 7 ? overrides[73] !== undefined : overrides[spec.day] !== undefined;
              return (
                <button
                  key={spec.day}
                  type="button"
                  onClick={() => handleToggleDay(spec)}
                  className={`rounded-xl p-2 border-2 text-center flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                    isOverridden
                      ? 'bg-[#79C8E8]/15 border-[#79C8E8] text-[#F8FAFC]'
                      : 'bg-[#1E293B] border-slate-600 hover:border-[#FFD66B] text-[#F8FAFC]'
                  }`}
                >
                  <span className="text-[11px] font-extrabold text-slate-300">
                    DAY {spec.day}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${
                      mode === 'A'
                        ? 'bg-[#9BD8A7]/20 text-[#9BD8A7]'
                        : 'bg-[#FFD66B]/20 text-[#FFD66B]'
                    }`}
                  >
                    {mode}
                  </span>
                  <span className="text-[11px] font-bold leading-tight text-slate-200 truncate w-full">
                    {mode === 'A' ? spec.labelA : spec.labelB}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Big Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            className="py-4 px-5 rounded-2xl bg-[#9BD8A7] hover:bg-[#7fc98e] text-[#090D16] text-lg font-extrabold cursor-pointer shadow-lg shadow-[#9BD8A7]/20 transition-colors"
            style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
          >
            🔄 PLAY AGAIN
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playCue('click');
              dispatch({ kind: 'REPLAY_ENDING_CUTSCENE' });
            }}
            className="py-4 px-5 rounded-2xl bg-[#1E293B] hover:bg-slate-700 border-2 border-[#79C8E8]/60 text-[#F8FAFC] text-lg font-extrabold cursor-pointer transition-colors"
            style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
          >
            🎬 REPLAY ENDING
          </button>
        </div>
      </div>
    </div>
  );
};
