import React, { useEffect, useRef, useState } from 'react';
import * as soundEngine from '../../services/soundEngine';
import type { DayNumber, EndingId, GameAction, GameState, JumpTarget } from '../../types/game';

export type HudDayStep =
  | 'chapter_intro'
  | 'morning_walk'
  | 'morning_intro'
  | 'morning_minigame'
  | 'midday_walk'
  | 'midday_intro'
  | 'midday_minigame'
  | 'decision'
  | 'day_complete'
  | 'walk'
  | 'intro'
  | 'minigame';

export interface TopHudProps {
  state: Readonly<GameState>;
  dispatch: (action: GameAction) => void;
  currentStep?: HudDayStep;
  displayDay?: DayNumber;
  onOpenStartMenu?: () => void;
  onRestartDay1?: () => void;
  onJumpDay?: (day: DayNumber) => void;
  onOpenInfoModal?: () => void;
  onPreviewEnding?: (ending: EndingId) => void;
  /** Legacy optional props kept for compatibility. */
  onOpenDrawer?: () => void;
  onOpenRoster?: () => void;
  onOpenLog?: () => void;
  onRestartTutorial?: () => void;
}

const DAY_LIST: readonly DayNumber[] = [1, 2, 3, 4, 5, 6, 7];

const DAY_TO_JUMP_TARGET: Record<DayNumber, JumpTarget> = {
  1: 'day_1',
  2: 'day_2',
  3: 'day_3',
  4: 'day_4',
  5: 'day_5',
  6: 'day_6',
  7: 'day_7_blackout',
};

const ENDING_PREVIEW_SHORTCUTS: ReadonlyArray<{
  ending: EndingId;
  jumpTarget: JumpTarget;
  icon: string;
  label: string;
  chipClass: string;
}> = [
  {
    ending: 'SCIENTIFIC_BREAKTHROUGH',
    jumpTarget: 'ending_scientific_breakthrough',
    icon: '🏆',
    label: 'Breakthrough',
    chipClass: 'border-[#FFD66B]/60 text-[#FFD66B] hover:bg-[#FFD66B]/15',
  },
  {
    ending: 'MISSION_ACCOMPLISHED',
    jumpTarget: 'ending_mission_accomplished',
    icon: '🚀',
    label: 'Accomplished',
    chipClass: 'border-[#9BD8A7]/60 text-[#9BD8A7] hover:bg-[#9BD8A7]/15',
  },
  {
    ending: 'CRITICAL_SURVIVAL',
    jumpTarget: 'ending_critical_survival',
    icon: '🛡️',
    label: 'Survival',
    chipClass: 'border-[#79C8E8]/60 text-[#79C8E8] hover:bg-[#79C8E8]/15',
  },
  {
    ending: 'MISSION_FAILURE',
    jumpTarget: 'ending_mission_failure',
    icon: '🛸',
    label: 'Safe Abort',
    chipClass: 'border-[#A995E8]/60 text-[#A995E8] hover:bg-[#A995E8]/15',
  },
];

interface MeterSpec {
  id: 'power' | 'lifeSupport' | 'shielding' | 'crewReadiness';
  icon: string;
  label: string;
  barClass: string;
  textClass: string;
  value: number;
}

function getBeatBadgeInfo(step: HudDayStep): { num: 1 | 2 | 3 | 4 | 5 | 6; label: string } {
  switch (step) {
    case 'chapter_intro':
      return { num: 1, label: '1. Event' };
    case 'morning_walk':
    case 'morning_intro':
    case 'walk':
    case 'intro':
      return { num: 2, label: '2. Morning' };
    case 'morning_minigame':
    case 'minigame':
      return { num: 3, label: '3. Lab Task' };
    case 'midday_walk':
    case 'midday_intro':
      return { num: 4, label: '4. Obstacle' };
    case 'midday_minigame':
      return { num: 5, label: '5. Fix Gear' };
    case 'decision':
    case 'day_complete':
      return { num: 6, label: '6. Choice' };
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

function getBaseStatusPills(state: Readonly<GameState>): Array<{
  id: string;
  text: string;
  pillClass: string;
}> {
  const sitePill =
    state.flags.landingSite === 'sunlit_ridge'
      ? {
          id: 'site',
          text: '☀️ Sun Peak',
          pillClass: 'border-[#FFD66B]/55 text-[#FFD66B] bg-[#FFD66B]/10',
        }
      : state.flags.landingSite === 'crater_shadow'
        ? {
            id: 'site',
            text: '🌑 Crater Rim',
            pillClass: 'border-[#79C8E8]/55 text-[#79C8E8] bg-[#79C8E8]/10',
          }
        : {
            id: 'site',
            text: '🛬 Approach',
            pillClass: 'border-slate-600 text-slate-300 bg-[#11192E]',
          };

  const shieldTempPill =
    state.day === 7 && state.commsBlackout
      ? {
          id: 'shield_temp',
          text: '⚡ Blackout',
          pillClass: 'border-[#F87171]/70 text-[#F87171] bg-[#F87171]/15',
        }
      : state.flags.day4Protocol === 'max_shielding'
        ? {
            id: 'shield_temp',
            text: '🛡️ Water-Wall',
            pillClass: 'border-[#79C8E8]/60 text-[#79C8E8] bg-[#79C8E8]/12',
          }
        : state.flags.day3Allocation === 'battery_storage'
          ? {
              id: 'shield_temp',
              text: '❄️ -160°C Frost',
              pillClass: 'border-[#79C8E8]/50 text-[#79C8E8] bg-[#1E293B]',
            }
          : state.flags.day3Allocation === 'overclock_regulators'
            ? {
                id: 'shield_temp',
                text: '⚡ Overclocked',
                pillClass: 'border-[#FFD66B]/60 text-[#FFD66B] bg-[#FFD66B]/12',
              }
            : state.day === 4
              ? {
                  id: 'shield_temp',
                  text: '☀️ X-Flare',
                  pillClass: 'border-[#F87171]/60 text-[#F87171] bg-[#F87171]/12',
                }
              : state.day === 6
                ? {
                    id: 'shield_temp',
                    text: '🧊 -200°C Rim',
                    pillClass: 'border-[#79C8E8]/55 text-[#79C8E8] bg-[#1E293B]',
                  }
                : {
                    id: 'shield_temp',
                    text: '🛡️ Nominal',
                    pillClass: 'border-[#9BD8A7]/45 text-[#9BD8A7] bg-[#11192E]',
                  };

  const crewPill =
    state.flags.activePumpsStalled || state.sub.crewFatigue >= 65
      ? {
          id: 'crew',
          text: '😰 Strained',
          pillClass: 'border-[#F87171]/60 text-[#F87171] bg-[#F87171]/12',
        }
      : state.flags.day3Allocation === 'battery_storage' && state.day >= 4 && !state.flags.crisisResilience
        ? {
            id: 'crew',
            text: '🥶 Chilled',
            pillClass: 'border-[#79C8E8]/55 text-[#79C8E8] bg-[#1E293B]',
          }
        : state.flags.crisisResilience || state.primary.crewReadiness >= 80
          ? {
              id: 'crew',
              text: '💪 Sharp Crew',
              pillClass: 'border-[#9BD8A7]/55 text-[#9BD8A7] bg-[#9BD8A7]/12',
            }
          : {
              id: 'crew',
              text: '🙂 Ready',
              pillClass: 'border-slate-600 text-slate-200 bg-[#11192E]',
            };

  return [sitePill, shieldTempPill, crewPill];
}

export const TopHud: React.FC<TopHudProps> = ({
  state,
  dispatch,
  currentStep = 'walk',
  displayDay,
  onOpenStartMenu,
  onRestartDay1,
  onJumpDay,
  onOpenInfoModal,
  onPreviewEnding,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        event.target instanceof Node &&
        !menuContainerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const shownDay = displayDay ?? state.day;
  const beatInfo = getBeatBadgeInfo(currentStep);
  const statusPills = getBaseStatusPills(state);

  const meters: MeterSpec[] = [
    {
      id: 'power',
      icon: '⚡',
      label: 'Power',
      barClass: 'bg-[#FFD66B]',
      textClass: 'text-[#FFD66B]',
      value: state.primary.power,
    },
    {
      id: 'lifeSupport',
      icon: '💧',
      label: 'Air',
      barClass: 'bg-[#79C8E8]',
      textClass: 'text-[#79C8E8]',
      value: state.primary.lifeSupport,
    },
    {
      id: 'shielding',
      icon: '🛡️',
      label: 'Shield',
      barClass: 'bg-[#A995E8]',
      textClass: 'text-[#A995E8]',
      value: state.primary.shielding,
    },
    {
      id: 'crewReadiness',
      icon: '😊',
      label: 'Morale',
      barClass: 'bg-[#9BD8A7]',
      textClass: 'text-[#9BD8A7]',
      value: state.primary.crewReadiness,
    },
  ];

  const handleToggleMute = () => {
    soundEngine.unlock();
    const nextMuted = !state.muted;
    soundEngine.setMuted(nextMuted);
    dispatch({ kind: 'SET_MUTED', muted: nextMuted });
    if (!nextMuted) {
      soundEngine.playCue('click');
    }
  };

  const handleJump = (day: DayNumber) => {
    soundEngine.playCue('click');
    setMenuOpen(false);
    if (onJumpDay) {
      onJumpDay(day);
      return;
    }
    dispatch({ kind: 'JUMP_TO_TARGET', target: DAY_TO_JUMP_TARGET[day] });
  };

  const handleRestartDay1 = () => {
    soundEngine.playCue('click');
    setMenuOpen(false);
    if (onRestartDay1) {
      onRestartDay1();
      return;
    }
    dispatch({ kind: 'START_NEW_MISSION' });
  };

  const handleOpenStart = () => {
    soundEngine.playCue('click');
    setMenuOpen(false);
    if (onOpenStartMenu) {
      onOpenStartMenu();
    }
  };

  const handleOpenInfo = () => {
    soundEngine.playCue('click');
    setMenuOpen(false);
    if (onOpenInfoModal) {
      onOpenInfoModal();
    }
  };

  const handlePreviewEnding = (ending: EndingId, jumpTarget: JumpTarget) => {
    soundEngine.playCue('click');
    setMenuOpen(false);
    if (onPreviewEnding) {
      onPreviewEnding(ending);
      return;
    }
    dispatch({ kind: 'JUMP_TO_TARGET', target: jumpTarget });
  };

  return (
    <header className="relative z-30 h-14 max-h-14 w-full shrink-0 bg-[#0B1222]/95 border-b-2 border-slate-700/80 px-2.5 lg:px-3.5 flex items-center justify-between gap-2 select-none">
      {/* Left: Day Badge + 6-Beat Step Pill + Live Base Status Pills */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div
          className="px-2.5 py-1 rounded-xl bg-[#1E293B] border border-[#79C8E8]/45 flex items-center gap-1.5 shadow-sm"
          style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
        >
          <span className="text-xs" aria-hidden="true">
            🌙
          </span>
          <span className="text-xs sm:text-sm font-extrabold tracking-wide text-[#F8FAFC] whitespace-nowrap">
            DAY {shownDay}/7
          </span>
        </div>

        {/* 6-Beat Compact Progress Pill */}
        <div
          className="hidden md:flex items-center gap-1.5 rounded-xl bg-[#11192E] border border-[#FFD66B]/45 px-2.5 py-1"
          aria-label={`Mission beat ${beatInfo.label}`}
        >
          <span className="text-xs font-extrabold text-[#FFD66B] whitespace-nowrap">
            {beatInfo.label}
          </span>
          <div className="hidden xl:flex items-center gap-0.5" aria-hidden="true">
            {([1, 2, 3, 4, 5, 6] as const).map((dot) => (
              <span
                key={dot}
                className={`h-1.5 w-2.5 rounded-full ${
                  dot < beatInfo.num
                    ? 'bg-[#9BD8A7]'
                    : dot === beatInfo.num
                      ? 'bg-[#FFD66B]'
                      : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Live Base Status Pills (Landing Site, Shield/Temp, Crew Condition) */}
        <div className="hidden lg:flex items-center gap-1" aria-label="Base status">
          {statusPills.map((pill) => (
            <span
              key={pill.id}
              className={`px-2 py-1 rounded-lg border text-[11px] font-extrabold whitespace-nowrap ${pill.pillClass}`}
            >
              {pill.text}
            </span>
          ))}
        </div>
      </div>

      {/* Center: 4 Compact Resource Bars */}
      <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0 max-w-xl">
        {meters.map((meter) => {
          const clamped = Math.max(0, Math.min(100, Math.round(meter.value)));
          const isLow = clamped < 30;
          return (
            <div
              key={meter.id}
              className={`flex-1 min-w-[68px] max-w-[132px] rounded-xl px-2 py-1 border bg-[#11192E]/90 ${
                isLow ? 'border-[#F87171]/80' : 'border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[11px] leading-tight mb-0.5">
                <span className="font-bold text-slate-100 whitespace-nowrap flex items-center gap-0.5">
                  <span aria-hidden="true">{meter.icon}</span>
                  <span className="hidden xl:inline">{meter.label}</span>
                </span>
                <span
                  className={`font-extrabold tabular-nums whitespace-nowrap ${
                    isLow ? 'text-[#F87171]' : meter.textClass
                  }`}
                >
                  {isLow ? '⚠' : ''}
                  {clamped}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    isLow ? 'bg-[#F87171]' : meter.barClass
                  }`}
                  style={{ width: `${clamped}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Mute + Compact Menu */}
      <div className="flex items-center gap-1.5 shrink-0" ref={menuContainerRef}>
        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={state.muted ? 'Unmute sound' : 'Mute sound'}
          className={`h-9 px-2.5 rounded-xl border text-sm font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
            state.muted
              ? 'bg-[#1E293B] border-slate-600 text-slate-300 hover:border-slate-400'
              : 'bg-[#1E293B] border-[#79C8E8]/50 text-[#79C8E8] hover:bg-slate-800'
          }`}
        >
          <span aria-hidden="true">{state.muted ? '🔇' : '🔊'}</span>
          <span className="sr-only">{state.muted ? 'Sound Off' : 'Sound On'}</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              soundEngine.playCue('click');
              setMenuOpen((prev) => !prev);
            }}
            aria-expanded={menuOpen}
            className="h-9 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-xs sm:text-sm font-extrabold text-[#F8FAFC] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span aria-hidden="true">⏸</span>
            <span>MENU</span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0F172A] border-2 border-[#79C8E8]/55 shadow-2xl p-3 z-50 flex flex-col gap-2">
              {onOpenStartMenu ? (
                <button
                  type="button"
                  onClick={handleOpenStart}
                  className="w-full py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-left text-xs font-extrabold text-[#F8FAFC] flex items-center gap-2 cursor-pointer"
                >
                  <span aria-hidden="true">🏠</span>
                  <span>Start Menu</span>
                </button>
              ) : null}

              {onOpenInfoModal ? (
                <button
                  type="button"
                  onClick={handleOpenInfo}
                  className="w-full py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-[#FFD66B]/45 text-left text-xs font-extrabold text-[#FFD66B] flex items-center gap-2 cursor-pointer"
                >
                  <span aria-hidden="true">📚</span>
                  <span>Additional Info</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleRestartDay1}
                className="w-full py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-left text-xs font-extrabold text-[#9BD8A7] flex items-center gap-2 cursor-pointer"
              >
                <span aria-hidden="true">🔄</span>
                <span>Restart Day 1</span>
              </button>

              <div className="pt-1.5 border-t border-slate-700/80">
                <p className="text-[11px] font-extrabold text-slate-300 mb-1.5 flex items-center gap-1">
                  <span aria-hidden="true">⚡</span>
                  <span>Jump to Day 1..7</span>
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {DAY_LIST.map((day) => {
                    const isCurrent = day === shownDay;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleJump(day)}
                        className={`h-7 rounded-lg text-xs font-extrabold cursor-pointer border transition-colors ${
                          isCurrent
                            ? 'bg-[#79C8E8] text-[#090D16] border-[#79C8E8]'
                            : 'bg-[#1E293B] text-[#F8FAFC] border-slate-600 hover:border-[#79C8E8]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-700/80">
                <p className="text-[11px] font-extrabold text-[#FFD66B] mb-1.5 flex items-center gap-1">
                  <span aria-hidden="true">🎬</span>
                  <span>Preview All 4 Endings</span>
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ENDING_PREVIEW_SHORTCUTS.map((item) => (
                    <button
                      key={item.ending}
                      type="button"
                      onClick={() => handlePreviewEnding(item.ending, item.jumpTarget)}
                      className={`py-1.5 px-2 rounded-lg bg-[#1E293B] border text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${item.chipClass}`}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
