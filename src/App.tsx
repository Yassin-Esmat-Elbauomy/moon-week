import { useEffect, useReducer, useRef, useState } from 'react';
import {
  BASE_CANVAS_HEIGHT,
  BASE_CANVAS_WIDTH,
  drawCutsceneFrame,
} from './assets/proceduralPixelArt';
import { EndingCutscene } from './components/cutscenes/EndingCutscene';
import { OpeningCutscene } from './components/cutscenes/OpeningCutscene';
import { TopHud } from './components/hud/TopHud';
import { TopDownLunarBase } from './components/map/TopDownLunarBase';
import { GreenhouseMiniGame } from './components/minigames/GreenhouseMiniGame';
import { LunarLanderGame } from './components/minigames/LunarLanderGame';
import { MedbayMiniGame } from './components/minigames/MedbayMiniGame';
import { PowerGridMiniGame } from './components/minigames/PowerGridMiniGame';
import { RadiationMiniGame } from './components/minigames/RadiationMiniGame';
import { RoverSurfaceMiniGame } from './components/minigames/RoverSurfaceMiniGame';
import { AdditionalInfoModal } from './components/modals/AdditionalInfoModal';
import { AiAdvisorModal } from './components/modals/AiAdvisorModal';
import { DebriefScreen } from './components/modals/DebriefScreen';
import { DecisionModal } from './components/narrative/DecisionModal';
import { DialoguePanel } from './components/narrative/DialoguePanel';
import * as soundEngine from './services/soundEngine';
import {
  computeMissionEnding,
  createInitialGameState,
  transitionGameState,
} from './simulation/engine';
import { clearSavedGameState, loadGameState, saveGameState } from './simulation/storage';
import type {
  CrewId,
  DayNumber,
  GameState,
  JumpTarget,
  LandingSite,
  MiniGameGrade,
  MiniGameId,
  OnBaseCrewId,
} from './types/game';

export type LinearDayStep =
  | 'walk'
  | 'intro'
  | 'minigame'
  | 'decision'
  | 'day_complete';

interface DayFeaturedConfig {
  crewId: OnBaseCrewId;
  miniGame: MiniGameId;
}

const DAY_FEATURED_CONFIG: Record<DayNumber, DayFeaturedConfig> = {
  1: { crewId: 'albaraa', miniGame: 'lunar_lander' },
  2: { crewId: 'sayed', miniGame: 'greenhouse' },
  3: { crewId: 'taha', miniGame: 'power_grid' },
  4: { crewId: 'taha', miniGame: 'radiation' },
  5: { crewId: 'omar', miniGame: 'medbay' },
  6: { crewId: 'yassin', miniGame: 'rover_surface' },
  7: { crewId: 'albaraa', miniGame: 'power_grid' },
};

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

function deriveStepFromState(state: Readonly<GameState>): LinearDayStep {
  if (state.activeMiniGame !== null) {
    return 'minigame';
  }
  if (state.shift === 'evening' && !state.eveningDecisionCompletedForDay) {
    return 'decision';
  }
  return 'walk';
}

export function App() {
  const [state, dispatch] = useReducer(transitionGameState, undefined, () => {
    return loadGameState() ?? createInitialGameState();
  });

  const [showStartMenu, setShowStartMenu] = useState<boolean>(true);
  const [dayStep, setDayStep] = useState<LinearDayStep>(() =>
    deriveStepFromState(state),
  );
  const [completedDayNum, setCompletedDayNum] = useState<DayNumber>(1);
  const [activeDialogueCrew, setActiveDialogueCrew] = useState<CrewId | null>(null);
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState<boolean>(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const startCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTotalSecRef = useRef<number>(0);
  const startLastFrameRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const hasSavedProgress =
    state.screenStage !== 'opening_cutscene' ||
    state.day > 1 ||
    state.decisions.length > 0 ||
    state.tutorialCompleted;

  // Keep localStorage synced cleanly.
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // Keep muted flag synchronized with the procedural Web Audio engine.
  useEffect(() => {
    soundEngine.setMuted(state.muted);
  }, [state.muted]);

  // Auto-skip tutorial stage so the kid enters straight into Day 1 Step 1.
  useEffect(() => {
    if (!showStartMenu && state.screenStage === 'tutorial') {
      dispatch({ kind: 'COMPLETE_TUTORIAL' });
      setDayStep('walk');
    }
  }, [showStartMenu, state.screenStage]);

  // Keep procedural ambient soundtrack synced with the current stage.
  useEffect(() => {
    if (
      showStartMenu ||
      state.screenStage === 'opening_cutscene' ||
      state.screenStage === 'ending_cutscene' ||
      state.screenStage === 'debrief'
    ) {
      soundEngine.setAmbientTrack('cutscene');
      return;
    }
    if (state.day === 4 || state.day === 7) {
      soundEngine.setAmbientTrack('crisis');
      return;
    }
    soundEngine.setAmbientTrack('exploration');
  }, [showStartMenu, state.day, state.screenStage]);

  // Animate 60fps Start Menu background scenes using drawCutsceneFrame.
  useEffect(() => {
    if (!showStartMenu) return;

    let rafId = 0;
    const renderLoop = (now: number) => {
      const prev = startLastFrameRef.current ?? now;
      const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
      startLastFrameRef.current = now;
      startTotalSecRef.current += dt;

      const totalSec = startTotalSecRef.current;
      const sceneIdx = Math.floor(totalSec / 5) % 3;
      const sceneFrame = Math.floor((totalSec % 5) * 60);

      const canvas = startCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawCutsceneFrame(
            ctx,
            'opening',
            sceneIdx,
            sceneFrame,
            stateRef.current,
            totalSec * 1000,
          );
        }
      }

      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);
    return () => {
      window.cancelAnimationFrame(rafId);
      startLastFrameRef.current = null;
    };
  }, [showStartMenu]);

  const handleStartMenuPointerDown = () => {
    soundEngine.unlock();
    if (!state.muted) {
      soundEngine.setAmbientTrack('cutscene');
    }
  };

  const handleToggleStartMute = () => {
    soundEngine.unlock();
    const nextMuted = !state.muted;
    soundEngine.setMuted(nextMuted);
    dispatch({ kind: 'SET_MUTED', muted: nextMuted });
    if (!nextMuted) {
      soundEngine.setAmbientTrack('cutscene');
      soundEngine.playCue('click');
    }
  };

  const handlePlayNewGame = () => {
    soundEngine.unlock();
    soundEngine.playCue('confirm');
    clearSavedGameState();
    dispatch({ kind: 'START_NEW_MISSION' });
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setInfoModalOpen(false);
    setDayStep('walk');
    setShowStartMenu(false);
  };

  const handleContinueGame = () => {
    soundEngine.unlock();
    soundEngine.playCue('confirm');
    if (state.screenStage === 'tutorial') {
      dispatch({ kind: 'COMPLETE_TUTORIAL' });
    }
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setInfoModalOpen(false);
    setDayStep(deriveStepFromState(state));
    setShowStartMenu(false);
  };

  const handleJumpToDay = (day: DayNumber) => {
    soundEngine.unlock();
    soundEngine.playCue('confirm');
    dispatch({ kind: 'JUMP_TO_TARGET', target: DAY_TO_JUMP_TARGET[day] });
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setInfoModalOpen(false);
    setDayStep('walk');
    setShowStartMenu(false);
  };

  const handleRestartDay1FromHud = () => {
    soundEngine.unlock();
    soundEngine.playCue('confirm');
    clearSavedGameState();
    dispatch({ kind: 'JUMP_TO_TARGET', target: 'day_1' });
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setInfoModalOpen(false);
    setDayStep('walk');
  };

  const handleFinishOpeningCutscene = () => {
    soundEngine.playCue('confirm');
    dispatch({ kind: 'FINISH_OPENING_CUTSCENE' });
    dispatch({ kind: 'COMPLETE_TUTORIAL' });
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setDayStep('walk');
  };

  const handleTalkToCrew = () => {
    const featured = DAY_FEATURED_CONFIG[state.day];
    setActiveDialogueCrew(featured.crewId);
    setDayStep('intro');
  };

  const handleStartSignatureMiniGame = () => {
    const featured = DAY_FEATURED_CONFIG[state.day];
    setActiveDialogueCrew(null);
    dispatch({ kind: 'OPEN_MINIGAME', miniGame: featured.miniGame });
    setDayStep('minigame');
  };

  const handleMiniGameComplete = (
    miniGame: MiniGameId,
    grade: MiniGameGrade,
    extra?: { landingSite?: LandingSite; touchdownVelocity?: number },
  ) => {
    if (state.day < 7) {
      if (!state.rosterConfirmedForDay) {
        dispatch({ kind: 'CONFIRM_MORNING_ROSTER' });
      }
      dispatch({
        kind: 'COMPLETE_MINIGAME',
        miniGame,
        grade,
        ...(extra?.landingSite ? { landingSite: extra.landingSite } : {}),
        ...(typeof extra?.touchdownVelocity === 'number'
          ? { touchdownVelocity: extra.touchdownVelocity }
          : {}),
      });
      if (state.shift === 'morning') {
        dispatch({ kind: 'ADVANCE_SHIFT' });
        dispatch({ kind: 'REPAIR_MIDDAY_ANOMALY', grade });
        dispatch({ kind: 'ADVANCE_SHIFT' });
      } else if (state.shift === 'midday') {
        dispatch({ kind: 'REPAIR_MIDDAY_ANOMALY', grade });
        dispatch({ kind: 'ADVANCE_SHIFT' });
      }
    } else {
      if (!state.rosterConfirmedForDay) {
        dispatch({ kind: 'CONFIRM_MORNING_ROSTER' });
      }
      dispatch({
        kind: 'COMPLETE_MINIGAME',
        miniGame,
        grade,
      });
      if (state.shift === 'morning') {
        dispatch({ kind: 'ADVANCE_DAY7_SUBSTAGE', stage: 'part_b_blackout' });
        dispatch({ kind: 'REPAIR_MIDDAY_ANOMALY', grade });
        dispatch({ kind: 'ADVANCE_DAY7_SUBSTAGE', stage: 'part_c_stage1' });
      } else if (state.shift === 'midday') {
        dispatch({ kind: 'REPAIR_MIDDAY_ANOMALY', grade });
        dispatch({ kind: 'ADVANCE_DAY7_SUBSTAGE', stage: 'part_c_stage1' });
      }
    }
    setDayStep('decision');
  };

  const handleCloseMiniGame = () => {
    soundEngine.playCue('click');
    dispatch({ kind: 'OPEN_MINIGAME', miniGame: null });
    setDayStep('walk');
  };

  const handleDecisionComplete = (finishedDay: DayNumber) => {
    setAiAdvisorOpen(false);
    if (finishedDay < 7) {
      setCompletedDayNum(finishedDay);
      setDayStep('day_complete');
    } else {
      setDayStep('walk');
    }
  };

  // Initial Start Menu (never auto-start straight into cutscenes or gameplay)
  if (showStartMenu) {
    return (
      <div
        onPointerDown={handleStartMenuPointerDown}
        className="h-screen w-screen overflow-hidden relative bg-[#090D16] flex items-center justify-center text-[#F8FAFC] select-none p-3 sm:p-4"
      >
        {/* 60fps Live Animated Pixel-Art Canvas Background */}
        <canvas
          ref={startCanvasRef}
          width={BASE_CANVAS_WIDTH}
          height={BASE_CANVAS_HEIGHT}
          className="absolute inset-0 w-full h-full object-cover pixelated pointer-events-none"
          aria-hidden="true"
        />

        {/* Sleek Gradient Vignette for Foreground Readability */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#090D16]/65 via-[#090D16]/50 to-[#090D16]/85"
          aria-hidden="true"
        />

        {/* Top-Right Music Button with Animated Equalizer Bars */}
        <button
          type="button"
          onClick={handleToggleStartMute}
          onMouseEnter={() => soundEngine.playCue('hover')}
          className="absolute top-4 right-4 z-20 px-4 py-2 rounded-2xl bg-[#0F172A]/90 hover:bg-[#1E293B] border-2 border-[#79C8E8]/65 text-sm font-extrabold text-[#F8FAFC] flex items-center gap-2.5 cursor-pointer shadow-lg transition-transform duration-150 hover:scale-[1.02]"
        >
          <span aria-hidden="true">{state.muted ? '🔇' : '🔊'}</span>
          <span>{state.muted ? 'MUSIC OFF' : 'MUSIC ON'}</span>
          {!state.muted ? (
            <span className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
              <span className="w-1 h-full rounded-full bg-[#9BD8A7] eq-bar eq-bar-1" />
              <span className="w-1 h-full rounded-full bg-[#79C8E8] eq-bar eq-bar-2" />
              <span className="w-1 h-full rounded-full bg-[#FFD66B] eq-bar eq-bar-3" />
              <span className="w-1 h-full rounded-full bg-[#9BD8A7] eq-bar eq-bar-4" />
            </span>
          ) : null}
        </button>

        {/* Centered Sleek Start Card */}
        <div className="relative z-10 w-full max-w-xl rounded-3xl bg-[#0F172A]/92 border-2 border-[#79C8E8]/70 start-card-glow p-5 sm:p-6 flex flex-col items-center text-center gap-3.5 backdrop-blur-md">
          <div className="moon-float inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1E293B] border border-[#FFD66B]/70 text-xs font-extrabold uppercase tracking-widest text-[#FFD66B]">
            <span aria-hidden="true">🚀</span>
            <span>7-DAY NASA LUNAR ADVENTURE</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F8FAFC] drop-shadow"
              style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
            >
              🌙 MOON WEEK
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#79C8E8]">
              Run a Moon Base! Ages 7–12
            </p>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handlePlayNewGame}
              onMouseEnter={() => soundEngine.playCue('hover')}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#9BD8A7] hover:bg-[#7fc98e] text-[#090D16] text-2xl font-extrabold tracking-wide shadow-lg shadow-[#9BD8A7]/30 border-2 border-[#cef2d5] cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
              style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
            >
              ▶ PLAY GAME
            </button>

            {hasSavedProgress ? (
              <button
                type="button"
                onClick={handleContinueGame}
                onMouseEnter={() => soundEngine.playCue('hover')}
                className="w-full py-3 px-6 rounded-2xl bg-[#1E293B] hover:bg-slate-700 border-2 border-[#79C8E8]/70 text-[#F8FAFC] text-lg font-extrabold tracking-wide cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                ▶ CONTINUE (DAY {state.day})
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                soundEngine.unlock();
                soundEngine.playCue('click');
                setInfoModalOpen(true);
              }}
              onMouseEnter={() => soundEngine.playCue('hover')}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#1E293B] hover:bg-slate-700 border-2 border-[#FFD66B]/65 text-[#FFD66B] text-sm sm:text-base font-extrabold tracking-wide cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
              style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
            >
              📚 ADDITIONAL INFO (SUIT, MACHINES &amp; NASA DATA)
            </button>
          </div>

          {/* Compact Select Day 1..7 Quick-Jump Row */}
          <div className="w-full pt-2.5 border-t border-slate-700/80 flex flex-col items-center gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              SELECT DAY (1–7)
            </span>
            <div className="grid grid-cols-7 gap-2 w-full">
              {DAY_LIST.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleJumpToDay(day)}
                  onMouseEnter={() => soundEngine.playCue('hover')}
                  className="h-9 rounded-xl bg-[#1E293B] hover:bg-[#79C8E8] hover:text-[#090D16] border border-slate-600 hover:border-[#79C8E8] text-sm font-extrabold text-[#F8FAFC] cursor-pointer transition-transform duration-150 hover:scale-[1.04]"
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {infoModalOpen ? (
          <AdditionalInfoModal onClose={() => setInfoModalOpen(false)} />
        ) : null}
      </div>
    );
  }

  // Opening Cutscene
  if (state.screenStage === 'opening_cutscene') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#090D16]">
        <OpeningCutscene state={state} onComplete={handleFinishOpeningCutscene} />
      </div>
    );
  }

  // Ending Cutscene
  if (state.screenStage === 'ending_cutscene') {
    const resolvedEnding = state.ending ?? computeMissionEnding(state);
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#090D16]">
        <EndingCutscene
          state={state}
          ending={resolvedEnding}
          onOpenDebrief={() => dispatch({ kind: 'OPEN_DEBRIEF' })}
        />
      </div>
    );
  }

  // Scorecard Debrief Screen
  if (state.screenStage === 'debrief') {
    return (
      <DebriefScreen
        state={state}
        dispatch={dispatch}
        onPlayAgain={handlePlayNewGame}
      />
    );
  }

  // Gameplay Loop: Strict 1 -> 2 -> 3 -> 4 Linear Sequence
  const featured = DAY_FEATURED_CONFIG[state.day];
  const activeMiniGame = state.activeMiniGame ?? featured.miniGame;
  const isOverlayOpen = dayStep !== 'walk' || infoModalOpen;

  const renderMiniGameOverlay = () => {
    switch (activeMiniGame) {
      case 'lunar_lander':
        return (
          <LunarLanderGame
            state={state}
            onComplete={(grade, site, touchdownVelocity) =>
              handleMiniGameComplete('lunar_lander', grade, {
                landingSite: site,
                touchdownVelocity,
              })
            }
            onClose={handleCloseMiniGame}
          />
        );
      case 'greenhouse':
        return (
          <GreenhouseMiniGame
            state={state}
            onComplete={(grade) => handleMiniGameComplete('greenhouse', grade)}
            onClose={handleCloseMiniGame}
          />
        );
      case 'power_grid':
        return (
          <PowerGridMiniGame
            state={state}
            onComplete={(grade) => handleMiniGameComplete('power_grid', grade)}
            onClose={handleCloseMiniGame}
          />
        );
      case 'radiation':
        return (
          <RadiationMiniGame
            state={state}
            onComplete={(grade) => handleMiniGameComplete('radiation', grade)}
            onClose={handleCloseMiniGame}
          />
        );
      case 'medbay':
        return (
          <MedbayMiniGame
            state={state}
            onComplete={(grade) => handleMiniGameComplete('medbay', grade)}
            onClose={handleCloseMiniGame}
          />
        );
      case 'rover_surface':
        return (
          <RoverSurfaceMiniGame
            state={state}
            onComplete={(grade) => handleMiniGameComplete('rover_surface', grade)}
            onClose={handleCloseMiniGame}
          />
        );
      default: {
        const _exhaustive: never = activeMiniGame;
        return _exhaustive;
      }
    }
  };

  const dayCompleteBars: Array<{
    icon: string;
    label: string;
    value: number;
    colorClass: string;
  }> = [
    { icon: '⚡', label: 'Power', value: state.primary.power, colorClass: 'bg-[#FFD66B]' },
    {
      icon: '💧',
      label: 'Life Support',
      value: state.primary.lifeSupport,
      colorClass: 'bg-[#79C8E8]',
    },
    { icon: '🛡️', label: 'Shield', value: state.primary.shielding, colorClass: 'bg-[#A995E8]' },
    {
      icon: '😊',
      label: 'Crew Morale',
      value: state.primary.crewReadiness,
      colorClass: 'bg-[#9BD8A7]',
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#090D16] text-[#F8FAFC] select-none">
      <TopHud
        state={state}
        dispatch={dispatch}
        currentStep={dayStep}
        displayDay={dayStep === 'day_complete' ? completedDayNum : state.day}
        onOpenStartMenu={() => setShowStartMenu(true)}
        onRestartDay1={handleRestartDay1FromHud}
        onJumpDay={handleJumpToDay}
        onOpenInfoModal={() => setInfoModalOpen(true)}
      />

      <main className="flex-1 min-h-0 relative overflow-hidden">
        <TopDownLunarBase
          state={state}
          dispatch={dispatch}
          onTalkToCrew={handleTalkToCrew}
          onOpenMiniGame={() => {
            setActiveDialogueCrew(null);
            dispatch({ kind: 'OPEN_MINIGAME', miniGame: featured.miniGame });
            setDayStep('minigame');
          }}
          onOpenDecisionModal={() => {
            // Ignored during Step 1 so player completes Meet -> Mini-Game -> Choice in order.
          }}
          isOverlayOpen={isOverlayOpen}
        />

        {/* Step 2: Meet Today's Crew Mate */}
        {dayStep === 'intro' ? (
          <DialoguePanel
            state={state}
            crewId={activeDialogueCrew ?? featured.crewId}
            onClose={() => setDayStep('walk')}
            onStartMiniGame={handleStartSignatureMiniGame}
          />
        ) : null}

        {/* Step 3: Play Today's Signature Mini-Game */}
        {dayStep === 'minigame' ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/85 backdrop-blur-sm p-3 sm:p-4">
            {renderMiniGameOverlay()}
          </div>
        ) : null}

        {/* Step 4: 2-Card Choice Modal */}
        {dayStep === 'decision' ? (
          <DecisionModal
            state={state}
            dispatch={dispatch}
            onClose={() => setDayStep('walk')}
            onOpenAiAdvisor={() => setAiAdvisorOpen(true)}
            onDecisionComplete={handleDecisionComplete}
          />
        ) : null}

        {/* Compact Earth Control Radio Popup */}
        {aiAdvisorOpen ? (
          <AiAdvisorModal state={state} onClose={() => setAiAdvisorOpen(false)} />
        ) : null}

        {/* Celebratory Day Complete Transition Card */}
        {dayStep === 'day_complete' ? (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/80 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Day ${completedDayNum} complete`}
          >
            <div className="w-full max-w-xl rounded-3xl bg-[#0F172A] border-2 border-[#FFD66B]/75 shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center gap-5">
              <div className="flex flex-col items-center gap-1.5">
                <h2
                  className="text-3xl sm:text-4xl font-extrabold text-[#FFD66B]"
                  style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
                >
                  🌟 DAY {completedDayNum} COMPLETE!
                </h2>
                <p className="text-base font-bold text-slate-200">
                  Awesome commanding! Here is how your Moon base looks tonight:
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                {dayCompleteBars.map((bar) => {
                  const pct = Math.max(0, Math.min(100, Math.round(bar.value)));
                  return (
                    <div
                      key={bar.label}
                      className="rounded-2xl bg-[#11192E] border border-slate-700/80 p-3 flex flex-col gap-1.5 text-left"
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="flex items-center gap-1 text-slate-100">
                          <span aria-hidden="true">{bar.icon}</span>
                          <span>{bar.label}</span>
                        </span>
                        <span className="tabular-nums text-[#F8FAFC]">{pct}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${bar.colorClass}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playCue('confirm');
                  setDayStep('walk');
                }}
                className="w-full py-4 px-6 rounded-2xl bg-[#9BD8A7] hover:bg-[#7fc98e] text-[#090D16] text-xl font-extrabold tracking-wide shadow-lg shadow-[#9BD8A7]/25 cursor-pointer transition-colors"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                START DAY {completedDayNum + 1} →
              </button>
            </div>
          </div>
        ) : null}

        {infoModalOpen ? (
          <AdditionalInfoModal onClose={() => setInfoModalOpen(false)} />
        ) : null}
      </main>
    </div>
  );
}

export default App;
