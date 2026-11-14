import React, { useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import type { GameState, MiniGameGrade } from '../../types/game';
import { playCue } from '../../services/soundEngine';

interface PowerGridMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

interface PowerChannelSpec {
  id: 'solar' | 'battery' | 'dish';
  title: string;
  accentHex: string;
}

interface SparkDot {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

const POWER_CHANNELS: readonly PowerChannelSpec[] = [
  { id: 'solar', title: '☀️ Solar Wing', accentHex: '#FFD66B' },
  { id: 'battery', title: '🔋 Battery Pack', accentHex: '#9BD8A7' },
  { id: 'dish', title: '📡 Dish Heater', accentHex: '#79C8E8' },
];

function createSparkPool(): SparkDot[] {
  return Array.from({ length: 48 }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0.45,
    color: '#FFD66B',
  }));
}

export const PowerGridMiniGame: React.FC<PowerGridMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [levels, setLevels] = useState<number[]>([0, 0, 0]);
  const [won, setWon] = useState<boolean>(false);

  const sparkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<SparkDot[]>(createSparkPool());
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

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

  // 60fps electric spark particle canvas behind channels
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;

      const canvas = sparkCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (const s of sparksRef.current) {
            if (!s.active) continue;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.life -= dt;
            if (s.life <= 0) {
              s.active = false;
              continue;
            }
            ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
            ctx.fillStyle = s.color;
            ctx.fillRect(Math.round(s.x - 3), Math.round(s.y - 3), 7, 7);
          }
          ctx.globalAlpha = 1;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const spawnChannelSparks = (channelIdx: number, color: string) => {
    const originX = 160 + channelIdx * 320;
    const originY = 180;
    let spawned = 0;
    for (const s of sparksRef.current) {
      if (!s.active) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 90 + Math.random() * 190;
        s.active = true;
        s.x = originX + (Math.random() - 0.5) * 60;
        s.y = originY + (Math.random() - 0.5) * 40;
        s.vx = Math.cos(angle) * speed;
        s.vy = Math.sin(angle) * speed;
        s.maxLife = 0.48;
        s.life = 0.48;
        s.color = color;
        spawned += 1;
        if (spawned >= 14) return;
      }
    }
  };

  const handleChargeChannel = (index: number) => {
    if (won) return;
    const current = levels[index] ?? 0;
    if (current >= 100) return;

    const spec = POWER_CHANNELS[index];
    spawnChannelSparks(index, spec?.accentHex ?? '#FFD66B');
    const nextLevels = levels.map((val, idx) =>
      idx === index ? Math.min(100, val + 50) : val,
    );
    setLevels(nextLevels);

    if (nextLevels.every((val) => val >= 100)) {
      playCue('success');
      setWon(true);
    } else {
      playCue('meter_up');
    }
  };

  return (
    <div
      className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col gap-4 bg-[#0F172A] border-2 border-[#79C8E8]/50 rounded-2xl p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Charge the Base"
    >
      {/* Clean Top Bar: Title + 1 short instruction + SKIP */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#FFD66B] p-1.5 text-[#0F172A]">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#F8FAFC] sm:text-xl">
              Charge the Base
            </h2>
          </div>
          <span className="font-display text-base font-extrabold text-[#FFD66B] sm:text-lg">
            Click all 3 switches to power up!
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

      {/* Single Clean Power Switches Arena */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#79C8E8]/25 bg-[#1E293B]/60 p-4 sm:p-6">
        <canvas
          ref={sparkCanvasRef}
          width={960}
          height={360}
          className="pixelated pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        <div className="relative z-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {POWER_CHANNELS.map((channel, idx) => {
            const pct = levels[idx] ?? 0;
            const full = pct >= 100;

            return (
              <div
                key={channel.id}
                className={`flex flex-col justify-between gap-4 rounded-2xl border-2 p-4 transition-colors ${
                  full
                    ? 'border-[#9BD8A7] bg-[#0F172A] shadow-[0_0_24px_rgba(155,216,167,0.35)]'
                    : 'border-slate-600 bg-[#0F172A]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg font-extrabold text-[#F8FAFC]">
                    {channel.title}
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 font-display text-sm font-extrabold ${
                      full
                        ? 'bg-[#9BD8A7] text-[#0F172A]'
                        : 'bg-[#1E293B] text-[#FFD66B]'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                {/* Clickable Big Power Bar */}
                <button
                  type="button"
                  onClick={() => handleChargeChannel(idx)}
                  aria-label={`Fill ${channel.title}`}
                  className="relative h-24 w-full overflow-hidden rounded-xl border-2 border-slate-700 bg-[#1E293B] p-1 focus:outline-none focus:ring-2 focus:ring-[#FFD66B]"
                >
                  <div
                    className="h-full rounded-lg transition-[width] duration-200"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: full ? '#9BD8A7' : channel.accentHex,
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-extrabold text-[#F8FAFC] drop-shadow">
                    {full ? 'FULL POWER ✓' : `${pct}% / 100%`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChargeChannel(idx)}
                  disabled={full}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-3 font-display text-base font-extrabold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#F8FAFC] ${
                    full
                      ? 'bg-[#9BD8A7] text-[#0F172A]'
                      : 'bg-[#FFD66B] text-[#0F172A] hover:brightness-95'
                  }`}
                >
                  <Zap className="h-5 w-5" />
                  {full ? 'READY ✓' : '⚡ CHARGE UP!'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebratory Overlay on Completion */}
      {won && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#0F172A]/90 p-6 text-center backdrop-blur-sm">
          <div className="font-display text-4xl font-extrabold text-[#FFD66B] sm:text-5xl">
            GREAT JOB! 🎉
          </div>
          <div className="font-display text-2xl font-bold text-[#9BD8A7] sm:text-3xl">
            POWER READY! ⚡
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
