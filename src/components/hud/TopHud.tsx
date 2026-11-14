import React, { useEffect, useRef, useState } from 'react';
import * as soundEngine from '../../services/soundEngine';
import type { DayNumber, GameAction, GameState, JumpTarget } from '../../types/game';

export type HudDayStep = 'walk' | 'intro' | 'minigame' | 'decision' | 'day_complete';

export interface TopHudProps {
  state: Readonly<GameState>;
  dispatch: (action: GameAction) => void;
  currentStep?: HudDayStep;
  displayDay?: DayNumber;
  onOpenStartMenu?: () => void;
  onRestartDay1?: () => void;
  onJumpDay?: (day: DayNumber) => void;
  onOpenInfoModal?: () => void;
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

interface MeterSpec {
  id: 'power' | 'lifeSupport' | 'shielding' | 'crewReadiness';
  icon: string;
  label: string;
  barClass: string;
  textClass: string;
  value: number;
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

  const activeStepIndex: 1 | 2 | 3 =
    currentStep === 'walk' || currentStep === 'intro'
      ? 1
      : currentStep === 'minigame'
        ? 2
        : 3;

  const shownDay = displayDay ?? state.day;

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
      label: 'Life Support',
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
      label: 'Crew Morale',
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

  const stepItems: Array<{ num: 1 | 2 | 3; label: string }> = [
    { num: 1, label: '1. Meet Crew' },
    { num: 2, label: '2. Mini-Game' },
    { num: 3, label: '3. Choice' },
  ];

  return (
    <header className="relative z-30 h-14 w-full shrink-0 bg-[#0B1222]/95 border-b-2 border-slate-700/80 px-3 lg:px-4 flex items-center justify-between gap-2 select-none">
      {/* Left: Moon Week Badge + Day Badge + 3-Step Linear Progress Pill */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="hidden lg:inline-flex px-2.5 py-1.5 rounded-xl bg-[#11192E] border border-[#FFD66B]/50 items-center gap-1.5 shadow-sm"
          style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
        >
          <span className="text-xs" aria-hidden="true">
            🌙
          </span>
          <span className="text-xs font-extrabold tracking-wide text-[#FFD66B] whitespace-nowrap">
            MOON WEEK
          </span>
        </div>

        <div
          className="px-2.5 py-1.5 rounded-xl bg-[#1E293B] border border-[#79C8E8]/40 flex items-center gap-1.5 shadow-sm"
          style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
        >
          <span className="text-sm font-extrabold tracking-wide text-[#F8FAFC] whitespace-nowrap">
            DAY {shownDay} / 7
          </span>
        </div>

        <nav
          aria-label="Daily mission steps"
          className="hidden xl:flex items-center gap-1 bg-[#11192E] border border-slate-700/80 rounded-xl px-2 py-1"
        >
          {stepItems.map((step, index) => {
            const isActive = activeStepIndex === step.num;
            const isCompleted =
              activeStepIndex > step.num ||
              (step.num === 3 && currentStep === 'day_complete');
            return (
              <React.Fragment key={step.num}>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#79C8E8]/20 text-[#79C8E8] border border-[#79C8E8]/60'
                      : isCompleted
                        ? 'text-[#9BD8A7]'
                        : 'text-slate-400'
                  }`}
                >
                  {isCompleted ? <span aria-hidden="true">✓</span> : null}
                  <span>{step.label}</span>
                </span>
                {index < stepItems.length - 1 ? (
                  <span className="text-slate-500 text-xs font-bold" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: 4 Big Colored Resource Bars */}
      <div className="flex-1 flex items-center justify-center gap-2 min-w-0 max-w-2xl">
        {meters.map((meter) => {
          const clamped = Math.max(0, Math.min(100, Math.round(meter.value)));
          const isLow = clamped < 30;
          return (
            <div
              key={meter.id}
              className={`flex-1 min-w-[88px] max-w-[154px] rounded-xl px-2.5 py-1 border bg-[#11192E]/90 ${
                isLow ? 'border-[#F87171]/80' : 'border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-xs leading-tight mb-1">
                <span className="font-bold text-slate-100 whitespace-nowrap flex items-center gap-1">
                  <span aria-hidden="true">{meter.icon}</span>
                  <span className="hidden md:inline">{meter.label}</span>
                </span>
                <span
                  className={`font-extrabold tabular-nums whitespace-nowrap ${
                    isLow ? 'text-[#F87171]' : meter.textClass
                  }`}
                >
                  {isLow ? '⚠ ' : ''}
                  {clamped}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
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
      <div className="flex items-center gap-2 shrink-0" ref={menuContainerRef}>
        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={state.muted ? 'Unmute sound' : 'Mute sound'}
          className={`h-9 px-3 rounded-xl border text-sm font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
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
            className="h-9 px-3.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-sm font-extrabold text-[#F8FAFC] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span aria-hidden="true">⏸</span>
            <span>MENU</span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0F172A] border-2 border-[#79C8E8]/50 shadow-2xl p-3 z-50 flex flex-col gap-2">
              {onOpenStartMenu ? (
                <button
                  type="button"
                  onClick={handleOpenStart}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-left text-sm font-extrabold text-[#F8FAFC] flex items-center gap-2 cursor-pointer"
                >
                  <span aria-hidden="true">🏠</span>
                  <span>Start Menu</span>
                </button>
              ) : null}

              {onOpenInfoModal ? (
                <button
                  type="button"
                  onClick={handleOpenInfo}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-[#FFD66B]/45 text-left text-sm font-extrabold text-[#FFD66B] flex items-center gap-2 cursor-pointer"
                >
                  <span aria-hidden="true">📚</span>
                  <span>Additional Info</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleRestartDay1}
                className="w-full py-2.5 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-left text-sm font-extrabold text-[#9BD8A7] flex items-center gap-2 cursor-pointer"
              >
                <span aria-hidden="true">🔄</span>
                <span>Restart Day 1</span>
              </button>

              <div className="pt-1 border-t border-slate-700/80">
                <p className="text-xs font-extrabold text-slate-300 mb-1.5 flex items-center gap-1">
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
                        className={`h-8 rounded-lg text-xs font-extrabold cursor-pointer border transition-colors ${
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
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
