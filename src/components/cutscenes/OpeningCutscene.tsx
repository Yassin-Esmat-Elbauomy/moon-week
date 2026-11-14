import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BASE_CANVAS_HEIGHT,
  BASE_CANVAS_WIDTH,
  drawCutsceneFrame,
} from '../../assets/proceduralPixelArt';
import { playCue, startAmbientLoop, stopAmbientLoop, unlock } from '../../services/soundEngine';
import type { GameState } from '../../types/game';

export interface OpeningCutsceneProps {
  state: Readonly<GameState>;
  onComplete: () => void;
  onSkip?: () => void;
}

interface OpeningSceneCopy {
  readonly badge: string;
  readonly line: string;
}

const OPENING_SCENES: readonly OpeningSceneCopy[] = [
  {
    badge: '1 / 4 • DEEP SPACE APPROACH',
    line: 'Orion races toward the Moon! Earth Flight Lead Abdul radios across a 2.6-second space delay.',
  },
  {
    badge: '2 / 4 • SOUTH POLE DILEMMA',
    line: 'Pick bright solar ridges or icy crater shadows! All six crew specialists are ready to team up.',
  },
  {
    badge: '3 / 4 • SPACESUIT & LIFE SUPPORT',
    line: 'Keep O2/CO2 air clean, Solar kW strong, and Water Shield mSv safe inside Moon Base Artemis.',
  },
  {
    badge: '4 / 4 • FINAL DESCENT',
    line: 'Fire landing thrusters and stay under 3.0 m/s for a safe Day 1 touchdown!',
  },
];

export const OpeningCutscene: React.FC<OpeningCutsceneProps> = ({
  state,
  onComplete,
  onSkip,
}) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneIndexRef = useRef(0);
  const sceneSecRef = useRef(0);
  const totalSecRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  stateRef.current = state;
  sceneIndexRef.current = sceneIndex;

  useEffect(() => {
    startAmbientLoop('cutscene');
    playCue('radio_ping');
    return () => {
      stopAmbientLoop();
    };
  }, []);

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
            'opening',
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

  const handleSkip = useCallback(() => {
    unlock();
    playCue('click');
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  }, [onComplete, onSkip]);

  const playSceneCue = useCallback((idx: number) => {
    if (idx === 0) playCue('radio_ping');
    else if (idx === 1) playCue('crew_cheer');
    else if (idx === 2) playCue('bubble');
    else playCue('thruster');
  }, []);

  const handleNext = useCallback(() => {
    unlock();
    if (sceneIndex >= OPENING_SCENES.length - 1) {
      playCue('success');
      onComplete();
      return;
    }

    const nextIdx = sceneIndex + 1;
    playSceneCue(nextIdx);
    sceneSecRef.current = 0;
    setSceneIndex(nextIdx);
  }, [onComplete, playSceneCue, sceneIndex]);

  const handleSelectScene = useCallback(
    (idx: number) => {
      unlock();
      playSceneCue(idx);
      sceneSecRef.current = 0;
      setSceneIndex(idx);
    },
    [playSceneCue],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleSkip();
      } else if (event.key === 'Enter' || event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft' && sceneIndex > 0) {
        event.preventDefault();
        handleSelectScene(sceneIndex - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handleSelectScene, handleSkip, sceneIndex]);

  const currentScene = OPENING_SCENES[sceneIndex] ?? OPENING_SCENES[0];
  const isFinalScene = sceneIndex >= OPENING_SCENES.length - 1;

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
            onClick={handleSkip}
            className="rounded-xl border-2 border-slate-600/80 bg-[#0F172A]/90 px-4 py-2 font-display text-sm font-bold tracking-wider text-slate-200 shadow-lg backdrop-blur-sm transition-colors duration-150 hover:border-[#79C8E8] hover:text-white active:scale-95"
          >
            SKIP →
          </button>
        </div>

        {/* Clean Floating Bottom Card (<= 2 Short Sentences + Single Primary Button) */}
        <div className="absolute bottom-4 inset-x-4 sm:inset-x-10 z-20 flex justify-center">
          <div className="w-full max-w-4xl rounded-2xl border-2 border-[#79C8E8]/55 bg-[#0F172A]/92 px-5 py-4 sm:px-7 sm:py-4 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
              <div className="flex items-center gap-3" aria-label="Cutscene progress">
                <div className="flex items-center gap-1.5">
                  {OPENING_SCENES.map((scene, idx) => (
                    <button
                      key={scene.badge}
                      type="button"
                      aria-label={`Scene ${idx + 1}`}
                      onClick={() => handleSelectScene(idx)}
                      className={`h-2.5 rounded-full transition-[width,background-color] ${
                        idx === sceneIndex
                          ? 'w-8 bg-[#FFD66B] shadow-[0_0_10px_rgba(255,214,107,0.75)]'
                          : 'w-2.5 bg-slate-600 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-display text-xs font-bold tracking-wider text-[#79C8E8]">
                  {currentScene ? currentScene.badge : ''}
                </span>
              </div>
              <p className="font-display text-lg sm:text-xl font-bold text-[#F8FAFC] leading-snug">
                {currentScene ? currentScene.line : ''}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className={`shrink-0 rounded-xl px-6 py-3.5 font-display text-base sm:text-lg font-extrabold tracking-wide text-[#0F172A] shadow-lg transition-transform duration-150 hover:brightness-110 active:scale-95 ${
                isFinalScene
                  ? 'bg-[#9BD8A7] shadow-[0_0_24px_rgba(155,216,167,0.55)]'
                  : 'bg-[#FFD66B] shadow-[0_0_24px_rgba(255,214,107,0.5)]'
              }`}
            >
              {isFinalScene ? 'START DAY 1 →' : 'NEXT →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
