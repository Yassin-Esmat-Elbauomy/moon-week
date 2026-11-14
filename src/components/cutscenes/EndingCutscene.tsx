import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BASE_CANVAS_HEIGHT,
  BASE_CANVAS_WIDTH,
  drawCutsceneFrame,
} from '../../assets/proceduralPixelArt';
import { playCue, startAmbientLoop, stopAmbientLoop, unlock } from '../../services/soundEngine';
import type { EndingId, GameState } from '../../types/game';

export interface EndingCutsceneProps {
  state: Readonly<GameState>;
  ending: EndingId;
  onOpenDebrief: () => void;
}

interface EndingSceneCopy {
  readonly badge: string;
  readonly line: string;
}

interface EndingPresentation {
  readonly scenes: readonly [EndingSceneCopy, EndingSceneCopy, EndingSceneCopy];
  readonly accentBorderClass: string;
  readonly accentTextClass: string;
  readonly dotActiveClass: string;
  readonly buttonClass: string;
}

function buildEndingPresentation(
  ending: EndingId,
  state: Readonly<GameState>,
): EndingPresentation {
  const siteNote =
    state.flags.landingSite === 'sunlit_ridge'
      ? 'Your sunlit ridge arrays stayed bright all week!'
      : state.flags.landingSite === 'crater_shadow'
        ? 'Your crater camp tapped glowing lunar water ice!'
        : 'Moon Base Artemis stood tall above Shackleton Crater!';

  const harvestOrRoverNote =
    state.flags.day6Objective === 'crater_ice_extraction'
      ? `Yassin's rover hauled pure crater ice cores (${state.sub.scienceScore} science pts)!`
      : !state.flags.activePumpsStalled && state.flags.farmingMode !== null
        ? `Sayed's greenhouse fed the crew (${state.sub.scienceScore} science pts)!`
        : `Al-Baraa and Omar kept systems humming (${state.sub.scienceScore} science pts)!`;

  const shieldNote =
    state.flags.day4Protocol === 'max_shielding'
      ? 'Your Water-Wall Dome blocked the X-class solar flare!'
      : state.flags.day3Allocation === 'battery_storage'
        ? 'Cold battery-saving nights kept power alive through the storm!'
        : 'Every crew mate stood together when the solar storm struck!';

  switch (ending) {
    case 'SCIENTIFIC_BREAKTHROUGH':
      return {
        scenes: [
          {
            badge: '1 / 3 • GOLDEN DAWN',
            line: `Scientific Breakthrough! ${siteNote}`,
          },
          {
            badge: '2 / 3 • LUNAR DISCOVERIES',
            line: harvestOrRoverNote,
          },
          {
            badge: '3 / 3 • EARTH UPLINK SALUTE',
            line: 'Taha beamed every breakthrough to Abdul at Mission Control — legendary job, Commander!',
          },
        ],
        accentBorderClass: 'border-[#FFD66B]/75',
        accentTextClass: 'text-[#FFD66B]',
        dotActiveClass: 'bg-[#FFD66B] shadow-[0_0_10px_rgba(255,214,107,0.75)]',
        buttonClass: 'bg-[#FFD66B] shadow-[0_0_26px_rgba(255,214,107,0.55)]',
      };
    case 'MISSION_ACCOMPLISHED':
      return {
        scenes: [
          {
            badge: '1 / 3 • STEADY OUTPOST',
            line: `Mission Accomplished! ${siteNote}`,
          },
          {
            badge: '2 / 3 • CREW READY',
            line: harvestOrRoverNote,
          },
          {
            badge: '3 / 3 • NEXT CREW ARRIVES',
            line: 'Abdul confirmed Earth radio lock as the relief Orion ship lands safely beside you!',
          },
        ],
        accentBorderClass: 'border-[#9BD8A7]/75',
        accentTextClass: 'text-[#9BD8A7]',
        dotActiveClass: 'bg-[#9BD8A7] shadow-[0_0_10px_rgba(155,216,167,0.75)]',
        buttonClass: 'bg-[#9BD8A7] shadow-[0_0_26px_rgba(155,216,167,0.55)]',
      };
    case 'CRITICAL_SURVIVAL':
      return {
        scenes: [
          {
            badge: '1 / 3 • STORM SURVIVED',
            line: `What a close call! ${shieldNote}`,
          },
          {
            badge: '2 / 3 • TEAMWORK RECOVERY',
            line: 'Omar cleared the air while Taha and Yassin restored Moon Base after blackout!',
          },
          {
            badge: '3 / 3 • RELIEF TOUCHDOWN',
            line: 'Abdul cheers from Earth Control as fresh supplies touch down safely!',
          },
        ],
        accentBorderClass: 'border-[#79C8E8]/75',
        accentTextClass: 'text-[#79C8E8]',
        dotActiveClass: 'bg-[#79C8E8] shadow-[0_0_10px_rgba(121,200,232,0.75)]',
        buttonClass: 'bg-[#79C8E8] shadow-[0_0_26px_rgba(121,200,232,0.55)]',
      };
    case 'MISSION_FAILURE':
      return {
        scenes: [
          {
            badge: '1 / 3 • SAFETY FIRST',
            line: 'Base limits reached zero — Earth Lead Abdul triggered the safe automated rescue call!',
          },
          {
            badge: '2 / 3 • CREW BOARDING',
            line: 'Every astronaut boarded the Orion ascent pod calmly with full spacesuit safety.',
          },
          {
            badge: '3 / 3 • ALL CREW SAFE',
            line: 'All six specialists returned safely to orbit — ready to try Moon Week again!',
          },
        ],
        accentBorderClass: 'border-[#F87171]/75',
        accentTextClass: 'text-[#F87171]',
        dotActiveClass: 'bg-[#FFD66B] shadow-[0_0_10px_rgba(255,214,107,0.75)]',
        buttonClass: 'bg-[#FFD66B] shadow-[0_0_26px_rgba(255,214,107,0.5)]',
      };
    default: {
      const _exhaustive: never = ending;
      return _exhaustive;
    }
  }
}

export const EndingCutscene: React.FC<EndingCutsceneProps> = ({
  state,
  ending,
  onOpenDebrief,
}) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneIndexRef = useRef(0);
  const sceneSecRef = useRef(0);
  const totalSecRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const endingRef = useRef(ending);

  stateRef.current = state;
  endingRef.current = ending;
  sceneIndexRef.current = sceneIndex;

  useEffect(() => {
    setSceneIndex(0);
    sceneSecRef.current = 0;
  }, [ending]);

  useEffect(() => {
    startAmbientLoop('cutscene');
    playCue(ending === 'MISSION_FAILURE' ? 'abort' : 'victory_fanfare');
    return () => {
      stopAmbientLoop();
    };
  }, [ending]);

  useEffect(() => {
    let rafId = 0;

    const renderLoop = (now: number) => {
      const prev = lastFrameRef.current ?? now;
      const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
      lastFrameRef.current = now;

      sceneSecRef.current += dt;
      totalSecRef.current += dt;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawCutsceneFrame(
            ctx,
            endingRef.current,
            sceneIndexRef.current,
            Math.floor(sceneSecRef.current * 60),
            stateRef.current,
            totalSecRef.current * 1000,
          );
        }
      }

      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);
    return () => {
      window.cancelAnimationFrame(rafId);
      lastFrameRef.current = null;
    };
  }, []);

  const handleOpenScore = useCallback(() => {
    unlock();
    playCue('confirm');
    onOpenDebrief();
  }, [onOpenDebrief]);

  const handleSelectScene = useCallback(
    (idx: number) => {
      unlock();
      if (ending === 'MISSION_FAILURE') {
        playCue(idx === 1 ? 'thruster' : 'radio_ping');
      } else {
        playCue(idx === 2 ? 'crew_cheer' : 'radar_ping');
      }
      sceneSecRef.current = 0;
      setSceneIndex(idx);
    },
    [ending],
  );

  const handleNext = useCallback(() => {
    unlock();
    if (sceneIndex >= 2) {
      playCue('confirm');
      onOpenDebrief();
      return;
    }
    const nextIdx = sceneIndex + 1;
    handleSelectScene(nextIdx);
  }, [handleSelectScene, onOpenDebrief, sceneIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleOpenScore();
      } else if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft' && sceneIndex > 0) {
        event.preventDefault();
        handleSelectScene(sceneIndex - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handleOpenScore, handleSelectScene, sceneIndex]);

  const presentation = useMemo(() => buildEndingPresentation(ending, state), [ending, state]);
  const currentScene = presentation.scenes[sceneIndex] ?? presentation.scenes[0];
  const isFinalScene = sceneIndex >= presentation.scenes.length - 1;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#090D16] flex items-center justify-center select-none">
      <div className="relative w-full h-full max-w-[177.78vh] max-h-[56.25vw] aspect-video flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={BASE_CANVAS_WIDTH}
          height={BASE_CANVAS_HEIGHT}
          className="h-full w-full pixelated block rounded-none sm:rounded-2xl border border-slate-700/70 shadow-2xl"
        />

        {/* Top-Right Skip Control */}
        <div className="absolute top-4 right-5 z-20">
          <button
            type="button"
            onClick={handleOpenScore}
            className="rounded-xl border-2 border-slate-600/80 bg-[#0F172A]/90 px-4 py-2 font-display text-sm font-bold tracking-wider text-slate-200 shadow-lg backdrop-blur-sm transition-colors duration-150 hover:border-[#79C8E8] hover:text-white active:scale-95"
          >
            SKIP →
          </button>
        </div>

        {/* Clean Floating Bottom Card (3-Scene Reactive Epilogue + Single Action Button) */}
        <div className="absolute bottom-4 inset-x-4 sm:inset-x-10 z-20 flex justify-center">
          <div
            className={`w-full max-w-4xl rounded-2xl border-2 ${presentation.accentBorderClass} bg-[#0F172A]/92 px-5 py-4 sm:px-7 sm:py-4 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4`}
          >
            <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
              <div className="flex items-center gap-3" aria-label="Ending scene progress">
                <div className="flex items-center gap-1.5">
                  {presentation.scenes.map((scene, idx) => (
                    <button
                      key={scene.badge}
                      type="button"
                      aria-label={`Ending scene ${idx + 1}`}
                      onClick={() => handleSelectScene(idx)}
                      className={`h-2.5 rounded-full transition-[width,background-color] ${
                        idx === sceneIndex
                          ? `w-8 ${presentation.dotActiveClass}`
                          : 'w-2.5 bg-slate-600 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
                <span className={`font-display text-xs font-bold tracking-wider ${presentation.accentTextClass}`}>
                  {currentScene.badge}
                </span>
              </div>
              <p className="font-display text-lg sm:text-xl font-bold text-[#F8FAFC] leading-snug">
                {currentScene.line}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className={`shrink-0 rounded-xl px-6 py-3.5 font-display text-base sm:text-lg font-extrabold tracking-wide text-[#0F172A] shadow-lg transition-transform duration-150 hover:brightness-110 active:scale-95 ${presentation.buttonClass}`}
            >
              {isFinalScene ? 'OPEN MISSION DEBRIEF →' : 'NEXT →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
