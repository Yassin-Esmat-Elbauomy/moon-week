import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HeartPulse } from 'lucide-react';
import type { GameState, MiniGameGrade, OnBaseCrewId } from '../../types/game';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import { playCue } from '../../services/soundEngine';

interface MedbayMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

const CREW_ORDER: readonly { id: OnBaseCrewId; label: string }[] = [
  { id: 'albaraa', label: 'AlBaraa' },
  { id: 'omar', label: 'Omar' },
  { id: 'taha', label: 'Taha' },
  { id: 'yassin', label: 'Yassin' },
  { id: 'sayed', label: 'Sayed' },
];

const TARGET_TAPS = 4;

export const MedbayMiniGame: React.FC<MedbayMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [taps, setTaps] = useState<number>(0);
  const [sparklePop, setSparklePop] = useState<string>('');
  const [won, setWon] = useState<boolean>(false);

  const heartRef = useRef<HTMLDivElement | null>(null);
  const heartPosRef = useRef<number>(50);
  const tapsRef = useRef<number>(0);
  const wonRef = useRef<boolean>(false);
  const blockSpaceConfirmRef = useRef<boolean>(false);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (won) {
      continueBtnRef.current?.focus();
    }
  }, [won]);

  // 60fps slow-moving golden heart marker (zero per-frame setState)
  useEffect(() => {
    let rafId = 0;
    const startTs = performance.now();

    const tick = (now: number) => {
      const elapsedSec = (now - startTs) / 1000;
      const pct = 50 + Math.sin(elapsedSec * 2.1) * 42;
      heartPosRef.current = pct;
      if (heartRef.current) {
        heartRef.current.style.left = `${pct}%`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const triggerCheerTap = useCallback((fromSpaceKey = false) => {
    if (wonRef.current) return;

    const inGreenZone = heartPosRef.current >= 30 && heartPosRef.current <= 70;
    const nextTaps = tapsRef.current + 1;
    tapsRef.current = nextTaps;
    setTaps(nextTaps);
    setSparklePop(inGreenZone ? 'DOUBLE SPARKLES! ✨💛✨' : 'CHEER +1! 💚');

    if (nextTaps >= TARGET_TAPS) {
      wonRef.current = true;
      if (fromSpaceKey) {
        blockSpaceConfirmRef.current = true;
      }
      playCue('success');
      setWon(true);
    } else {
      playCue(inGreenZone ? 'confirm' : 'bubble');
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
        return;
      }
      if (e.code === 'Space') {
        if (wonRef.current) {
          if (blockSpaceConfirmRef.current || e.repeat) {
            e.preventDefault();
          }
          return;
        }
        e.preventDefault();
        if (!e.repeat) {
          triggerCheerTap(true);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && blockSpaceConfirmRef.current) {
        blockSpaceConfirmRef.current = false;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onClose, triggerCheerTap]);

  return (
    <div
      className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col gap-4 bg-[#0F172A] border-2 border-[#79C8E8]/50 rounded-2xl p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Cheer Up Crew"
    >
      {/* Clean Top Bar: Title + 1 short instruction + SKIP */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#9BD8A7] p-1.5 text-[#0F172A]">
              <HeartPulse className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#F8FAFC] sm:text-xl">
              Cheer Up Crew
            </h2>
          </div>
          <span className="font-display text-base font-extrabold text-[#9BD8A7] sm:text-lg">
            Tap 4 times to cheer up crew!
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

      {/* Single Clean Crew Cheer-Up Stage */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-between gap-4 rounded-2xl border-2 border-[#79C8E8]/25 bg-[#1E293B]/60 p-4 sm:p-6">
        {/* Crew Portraits Jumping with Joy */}
        <div className="flex w-full items-center justify-center gap-3 sm:gap-6">
          {CREW_ORDER.map((member, idx) => {
            const cheering = won || idx < taps;
            return (
              <div
                key={member.id}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-2.5 transition-transform duration-200 ${
                  cheering
                    ? '-translate-y-2 border-[#9BD8A7] bg-[#0F172A] shadow-[0_0_20px_rgba(155,216,167,0.35)]'
                    : 'border-slate-700 bg-[#0F172A]'
                }`}
              >
                <CrewAvatar
                  crewId={member.id}
                  expression={cheering ? 'happy' : 'concerned'}
                  size="md"
                />
                <span className="font-display text-xs font-extrabold text-[#F8FAFC] sm:text-sm">
                  {member.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Hearts + Sparkle Pop */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-transform ${
                  idx < taps
                    ? 'scale-110 border-[#9BD8A7] bg-[#9BD8A7]/25'
                    : 'border-slate-600 bg-[#0F172A] opacity-55'
                }`}
              >
                {idx < taps ? '💚' : '🤍'}
              </span>
            ))}
          </div>
          <div className="h-6 font-display text-base font-extrabold text-[#FFD66B]">
            {sparklePop || `Cheers: ${taps} / ${TARGET_TAPS}`}
          </div>
        </div>

        {/* Horizontal Target Bar with Slow-Moving Golden Heart */}
        <div className="relative h-16 w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-[#79C8E8]/50 bg-[#0F172A]">
          <div
            className="absolute top-0 bottom-0 border-x-2 border-[#9BD8A7] bg-[#9BD8A7]/25"
            style={{ left: '30%', width: '40%' }}
          />
          <div
            ref={heartRef}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-4xl drop-shadow-[0_0_12px_rgba(255,214,107,0.9)]"
            style={{ left: '50%' }}
          >
            💛
          </div>
        </div>

        {/* Giant Tap Button */}
        <button
          type="button"
          onClick={() => triggerCheerTap(false)}
          className="w-full max-w-md rounded-2xl bg-[#9BD8A7] px-8 py-4 font-display text-xl font-extrabold text-[#0F172A] shadow-[0_0_24px_rgba(155,216,167,0.45)] transition-transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#FFD66B]"
        >
          💚 CHEER UP CREW! (SPACE)
        </button>
      </div>

      {/* Celebratory Overlay */}
      {won && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#0F172A]/90 p-6 text-center backdrop-blur-sm">
          <div className="font-display text-4xl font-extrabold text-[#FFD66B] sm:text-5xl">
            GREAT JOB! 🎉
          </div>
          <div className="font-display text-2xl font-bold text-[#9BD8A7] sm:text-3xl">
            CREW HAPPY! 😊
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
