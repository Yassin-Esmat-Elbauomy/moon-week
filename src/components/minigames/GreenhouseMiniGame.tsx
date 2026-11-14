import React, { useEffect, useRef, useState } from 'react';
import { Droplets, Sprout } from 'lucide-react';
import type { GameState, MiniGameGrade } from '../../types/game';
import { playCue } from '../../services/soundEngine';

interface GreenhouseMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

const INITIAL_ROTATIONS: readonly number[] = [1, 1, 1, 1];

export const GreenhouseMiniGame: React.FC<GreenhouseMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [rotations, setRotations] = useState<number[]>(() => [...INITIAL_ROTATIONS]);
  const [won, setWon] = useState<boolean>(false);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);
  const flowCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const alignedFlags = rotations.map((rot) => rot % 2 === 0);
  const allAligned = alignedFlags.every(Boolean);

  // Continuous water flow from left Water Tank across consecutive aligned pipes
  const wetFlags: boolean[] = [];
  let flowOpen = true;
  for (const isAligned of alignedFlags) {
    if (flowOpen && isAligned) {
      wetFlags.push(true);
    } else {
      flowOpen = false;
      wetFlags.push(false);
    }
  }
  const wetCount = wetFlags.filter(Boolean).length;
  const wetCountRef = useRef<number>(wetCount);
  useEffect(() => {
    wetCountRef.current = wetCount;
  }, [wetCount]);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [onClose]);

  useEffect(() => {
    if (won) {
      continueBtnRef.current?.focus();
    }
  }, [won]);

  // 60fps flowing blue water droplets across connected pipes
  useEffect(() => {
    const droplets = Array.from({ length: 20 }, (_, idx) => ({
      offset: idx / 20,
      yOffset: ((idx % 3) - 1) * 6,
      size: idx % 2 === 0 ? 6 : 4,
    }));

    let rafId = 0;
    let lastTs = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;
      elapsed += dt;

      const canvas = flowCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const activePipes = wetCountRef.current;
          if (activePipes > 0) {
            const maxX = (activePipes / 4) * canvas.width;
            for (const d of droplets) {
              const x = ((d.offset + elapsed * 0.42) % 1) * canvas.width;
              if (x <= maxX) {
                const y = canvas.height / 2 + d.yOffset + Math.sin(elapsed * 8 + d.offset * 12) * 2;
                ctx.fillStyle = '#BAE6FD';
                ctx.fillRect(Math.round(x), Math.round(y - d.size / 2), d.size + 4, d.size);
              }
            }
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleRotatePipe = (index: number) => {
    if (won) return;
    playCue('bubble');
    const next = rotations.map((rot, idx) => (idx === index ? rot + 1 : rot));
    setRotations(next);

    if (next.every((rot) => rot % 2 === 0)) {
      playCue('success');
      setWon(true);
    }
  };

  return (
    <div
      className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col gap-4 bg-[#0F172A] border-2 border-[#79C8E8]/50 rounded-2xl p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Water the Plants"
    >
      {/* Clean Top Bar: Title + 1 short instruction + SKIP */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#9BD8A7] p-1.5 text-[#0F172A]">
              <Sprout className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#F8FAFC] sm:text-xl">
              Water the Plants
            </h2>
          </div>
          <span className="font-display text-base font-extrabold text-[#79C8E8] sm:text-lg">
            Click all 4 pipes so water flows!
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playCue('confirm');
            onComplete('silver');
          }}
          className="shrink-0 rounded-xl border border-[#79C8E8]/50 bg-[#1E293B] px-3.5 py-1.5 font-display text-sm font-extrabold text-[#79C8E8] transition-colors hover:bg-[#79C8E8] hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
        >
          SKIP →
        </button>
      </div>

      {/* Single Clean Pipeline Arena */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 rounded-2xl border-2 border-[#79C8E8]/25 bg-[#1E293B]/60 p-4 sm:p-6">
        <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
          {/* Left: Water Tank */}
          <div className="flex h-36 w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#79C8E8] bg-[#263C75] p-3 text-center shadow-[0_0_24px_rgba(121,200,232,0.3)] sm:h-40 sm:w-32">
            <Droplets className="h-10 w-10 text-[#79C8E8]" />
            <span className="font-display text-sm font-extrabold text-[#F8FAFC] sm:text-base">
              💧 Water Tank
            </span>
          </div>

          {/* Middle: 4 Big Glowing Pipe Tiles + Flowing Water Overlay */}
          <div className="relative flex-1">
            <div className="grid grid-cols-4 items-center gap-2 sm:gap-3">
              {rotations.map((rot, idx) => {
                const isAligned = Boolean(alignedFlags[idx]);
                const isWet = Boolean(wetFlags[idx]);
                const angleDeg = rot * 90;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRotatePipe(idx)}
                      aria-label={`Rotate pipe ${idx + 1}`}
                      className={`flex aspect-square w-full items-center justify-center rounded-2xl border-2 p-2 transition-colors focus:outline-none focus:ring-4 focus:ring-[#79C8E8] ${
                        isWet
                          ? 'border-[#79C8E8] bg-sky-950/90 shadow-[0_0_24px_rgba(121,200,232,0.45)]'
                          : isAligned
                            ? 'border-[#9BD8A7] bg-[#0F172A] shadow-[0_0_18px_rgba(155,216,167,0.3)]'
                            : 'border-[#FFD66B] bg-[#0F172A] shadow-[0_0_16px_rgba(255,214,107,0.25)] hover:bg-slate-900'
                      }`}
                    >
                      <svg
                        viewBox="0 0 80 80"
                        className="h-full w-full transition-transform duration-200"
                        style={{ transform: `rotate(${angleDeg}deg)` }}
                      >
                        <rect
                          x="0"
                          y="24"
                          width="80"
                          height="32"
                          rx="6"
                          fill={isWet ? '#263C75' : '#334155'}
                        />
                        <rect
                          x="0"
                          y="30"
                          width="80"
                          height="20"
                          fill={isWet ? '#79C8E8' : isAligned ? '#9BD8A7' : '#94A3B8'}
                        />
                        <rect x="0" y="20" width="8" height="40" rx="3" fill="#CBD5E1" />
                        <rect x="72" y="20" width="8" height="40" rx="3" fill="#CBD5E1" />
                      </svg>
                    </button>

                    <span
                      className={`rounded-full px-2.5 py-0.5 font-display text-xs font-extrabold ${
                        isWet
                          ? 'bg-[#79C8E8] text-[#0F172A]'
                          : isAligned
                            ? 'bg-[#9BD8A7] text-[#0F172A]'
                            : 'bg-[#FFD66B] text-[#0F172A]'
                      }`}
                    >
                      {isWet ? 'FLOW ✓' : isAligned ? 'READY ✓' : 'CLICK ↻'}
                    </span>
                  </div>
                );
              })}
            </div>

            <canvas
              ref={flowCanvasRef}
              width={640}
              height={80}
              className="pixelated pointer-events-none absolute left-0 right-0 top-[42%] h-10 w-full -translate-y-1/2"
            />
          </div>

          {/* Right: Space Plants */}
          <div
            className={`flex h-36 w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition-colors sm:h-40 sm:w-32 ${
              allAligned
                ? 'border-[#9BD8A7] bg-[#9BD8A7]/20 shadow-[0_0_28px_rgba(155,216,167,0.45)]'
                : 'border-slate-600 bg-[#0F172A]'
            }`}
          >
            <div className="text-3xl sm:text-4xl">
              {allAligned ? '🌸🌱🌺' : '🌱'}
            </div>
            <span className="font-display text-sm font-extrabold text-[#9BD8A7] sm:text-base">
              🌱 Space Plants
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2 font-display text-base font-bold text-[#79C8E8]">
          <span>Pipes Lined Up: {alignedFlags.filter(Boolean).length} / 4</span>
        </div>
      </div>

      {/* Celebratory Overlay on Completion */}
      {won && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#0F172A]/90 p-6 text-center backdrop-blur-sm">
          <div className="font-display text-4xl font-extrabold text-[#FFD66B] sm:text-5xl">
            GREAT JOB! 🎉
          </div>
          <div className="font-display text-2xl font-bold text-[#9BD8A7] sm:text-3xl">
            PLANTS WATERED! 🌱 🌸 🌺
          </div>
          <button
            ref={continueBtnRef}
            type="button"
            onKeyDown={(e) => {
              if (e.repeat) e.preventDefault();
            }}
            onClick={() => {
              playCue('confirm');
              onComplete('gold');
            }}
            className="mt-2 rounded-2xl bg-[#9BD8A7] px-10 py-4 font-display text-2xl font-extrabold text-[#0F172A] shadow-[0_0_28px_rgba(155,216,167,0.75)] transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#F8FAFC]"
          >
            CONTINUE →
          </button>
        </div>
      )}
    </div>
  );
};
