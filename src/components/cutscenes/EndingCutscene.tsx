import React, { useCallback, useEffect, useRef } from 'react';
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

interface EndingCopy {
  readonly line: string;
  readonly accentBorderClass: string;
  readonly buttonClass: string;
}

function getEndingCopy(ending: EndingId): EndingCopy {
  switch (ending) {
    case 'SCIENTIFIC_BREAKTHROUGH':
      return {
        line: 'Amazing work! You led a legendary Moon mission!',
        accentBorderClass: 'border-[#FFD66B]/70',
        buttonClass: 'bg-[#FFD66B] shadow-[0_0_26px_rgba(255,214,107,0.55)]',
      };
    case 'MISSION_ACCOMPLISHED':
      return {
        line: 'Mission accomplished! Every astronaut is safe and proud!',
        accentBorderClass: 'border-[#9BD8A7]/70',
        buttonClass: 'bg-[#9BD8A7] shadow-[0_0_26px_rgba(155,216,167,0.55)]',
      };
    case 'CRITICAL_SURVIVAL':
      return {
        line: 'What a storm! Your Moon base survived together!',
        accentBorderClass: 'border-[#79C8E8]/70',
        buttonClass: 'bg-[#79C8E8] shadow-[0_0_26px_rgba(121,200,232,0.55)]',
      };
    case 'MISSION_FAILURE':
      return {
        line: 'Rescue pod launched! Every astronaut is completely safe.',
        accentBorderClass: 'border-[#FFD66B]/65',
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneSecRef = useRef(0);
  const totalSecRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const endingRef = useRef(ending);

  stateRef.current = state;
  endingRef.current = ending;

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
            0,
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
        event.preventDefault();
        handleOpenScore();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleOpenScore]);

  const copy = getEndingCopy(ending);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#090D16] flex items-center justify-center select-none">
      <div className="relative w-full h-full max-w-[177.78vh] max-h-[56.25vw] aspect-video flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={BASE_CANVAS_WIDTH}
          height={BASE_CANVAS_HEIGHT}
          className="h-full w-full pixelated block rounded-none sm:rounded-2xl border border-slate-700/70 shadow-2xl"
        />

        {/* Celebratory Bottom Card (1 Short Sentence + 1 Big Glowing Button) */}
        <div className="absolute bottom-5 inset-x-4 sm:inset-x-10 z-20 flex justify-center">
          <div
            className={`w-full max-w-3xl rounded-2xl border-2 ${copy.accentBorderClass} bg-[#0F172A]/92 px-5 py-4 sm:px-7 sm:py-5 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4`}
          >
            <p className="font-display text-xl sm:text-2xl font-bold text-[#F8FAFC] text-center sm:text-left leading-snug">
              {copy.line}
            </p>

            <button
              type="button"
              onClick={handleOpenScore}
              className={`shrink-0 rounded-xl px-6 py-3.5 font-display text-base sm:text-lg font-extrabold tracking-wide text-[#0F172A] shadow-lg transition hover:brightness-110 active:scale-95 ${copy.buttonClass}`}
            >
              SEE MY SCORE →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
