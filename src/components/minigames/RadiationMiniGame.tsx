import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import type { GameState, MiniGameGrade } from '../../types/game';
import { playCue } from '../../services/soundEngine';

interface RadiationMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

interface SolarFireball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bounced: boolean;
  done: boolean;
}

interface ShieldSpark {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface StarDot {
  x: number;
  y: number;
  size: number;
  phase: number;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const PADDLE_WIDTH = 280;
const PADDLE_HEIGHT = 24;
const PADDLE_Y = 586;
const PADDLE_SPEED = 780;
const TARGET_BLOCKED = 5;
const WIN_DURATION_SEC = 12;

const STARS: readonly StarDot[] = Array.from({ length: 64 }, (_, idx) => ({
  x: ((idx * 197 + 31) % (CANVAS_WIDTH - 24)) + 12,
  y: ((idx * 109 + 19) % 520) + 12,
  size: idx % 5 === 0 ? 4 : 2,
  phase: idx * 0.7,
}));

const SPAWN_LANES: readonly number[] = [340, 640, 940, 480, 800, 260, 1020, 600];

function createSparkPool(): ShieldSpark[] {
  return Array.from({ length: 56 }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0.45,
    color: '#79C8E8',
  }));
}

function spawnShieldSparks(
  pool: ShieldSpark[],
  x: number,
  y: number,
  color: string,
  count: number,
): void {
  let spawned = 0;
  for (const p of pool) {
    if (!p.active) {
      const angle = -Math.PI * Math.random();
      const spd = 90 + Math.random() * 190;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd;
      p.maxLife = 0.45;
      p.life = 0.45;
      p.color = color;
      spawned += 1;
      if (spawned >= count) return;
    }
  }
}

function drawStormScene(
  ctx: CanvasRenderingContext2D,
  paddleX: number,
  fireballs: SolarFireball[],
  sparks: ShieldSpark[],
  elapsed: number,
  blocked: number,
): void {
  ctx.imageSmoothingEnabled = false;

  // Deep space sky
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#050918');
  grad.addColorStop(0.75, '#0F1B3A');
  grad.addColorStop(1, '#1E293B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Twinkling stars
  for (const s of STARS) {
    const alpha = 0.45 + 0.45 * Math.sin(elapsed * 2.2 + s.phase);
    ctx.fillStyle = `rgba(248, 250, 252, ${alpha.toFixed(2)})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }

  // Glowing Lunar Base Dome at bottom
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 650, CANVAS_WIDTH, 70);
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH / 2, 666, 220, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH / 2, 666, 220, Math.PI, 0);
  ctx.stroke();

  ctx.fillStyle = '#9BD8A7';
  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LUNAR BASE', CANVAS_WIDTH / 2, 646);
  ctx.textAlign = 'left';

  // Wide Glowing Magnetic Shield Paddle
  const pLeft = Math.round(paddleX - PADDLE_WIDTH / 2);
  ctx.fillStyle = 'rgba(121, 200, 232, 0.22)';
  ctx.fillRect(pLeft - 12, PADDLE_Y - 12, PADDLE_WIDTH + 24, PADDLE_HEIGHT + 24);

  ctx.fillStyle = '#2563EB';
  ctx.fillRect(pLeft, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillStyle = '#79C8E8';
  ctx.fillRect(pLeft + 6, PADDLE_Y + 4, PADDLE_WIDTH - 12, PADDLE_HEIGHT - 8);
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(pLeft + 24, PADDLE_Y + 7, PADDLE_WIDTH - 48, 5);

  ctx.strokeStyle = '#9BD8A7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(paddleX, PADDLE_Y + 28, PADDLE_WIDTH * 0.56, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Big Slow Red Solar Fireballs
  for (const fb of fireballs) {
    if (fb.done) continue;
    const pulse = 1 + 0.1 * Math.sin(elapsed * 10 + fb.id);

    ctx.fillStyle = fb.bounced ? 'rgba(155, 216, 167, 0.35)' : 'rgba(248, 113, 113, 0.35)';
    ctx.beginPath();
    ctx.arc(fb.x, fb.y, fb.radius * 1.45 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = fb.bounced ? '#9BD8A7' : '#EF4444';
    ctx.beginPath();
    ctx.arc(fb.x, fb.y, fb.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = fb.bounced ? '#F8FAFC' : '#FFD66B';
    ctx.beginPath();
    ctx.arc(fb.x, fb.y, fb.radius * 0.52, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shield deflection sparks
  for (const s of sparks) {
    if (!s.active) continue;
    ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
    ctx.fillStyle = s.color;
    ctx.fillRect(Math.round(s.x - 3), Math.round(s.y - 3), 7, 7);
  }
  ctx.globalAlpha = 1;

  // Big clear canvas counter
  ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
  ctx.fillRect(20, 18, 260, 52);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 18, 260, 52);
  ctx.fillStyle = '#9BD8A7';
  ctx.font = 'bold 24px Fredoka, Nunito, sans-serif';
  ctx.fillText(`BLOCKED: ${Math.min(TARGET_BLOCKED, blocked)} / ${TARGET_BLOCKED}`, 38, 52);
}

export const RadiationMiniGame: React.FC<RadiationMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [blockedUi, setBlockedUi] = useState<number>(0);
  const [won, setWon] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paddleXRef = useRef<number>(CANVAS_WIDTH / 2);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const wonRef = useRef<boolean>(false);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (won) {
      continueBtnRef.current?.focus();
    }
  }, [won]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') {
        e.preventDefault();
        keysRef.current.left = true;
      } else if (k === 'arrowright' || k === 'd') {
        e.preventDefault();
        keysRef.current.right = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keysRef.current.left = false;
      else if (k === 'arrowright' || k === 'd') keysRef.current.right = false;
    };

    const clearKeys = () => {
      keysRef.current = { left: false, right: false };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, [onClose]);

  // 60fps Solar Storm Shield Loop (zero per-frame setState)
  useEffect(() => {
    const fireballs: SolarFireball[] = [];
    const sparks = createSparkPool();
    let rafId = 0;
    let lastTs = performance.now();
    let elapsed = 0;
    let nextSpawn = 0.25;
    let spawnCount = 0;
    let blockedCount = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;
      elapsed += dt;

      if (!wonRef.current) {
        if (keysRef.current.left) {
          paddleXRef.current -= PADDLE_SPEED * dt;
        }
        if (keysRef.current.right) {
          paddleXRef.current += PADDLE_SPEED * dt;
        }
        const minX = PADDLE_WIDTH / 2 + 16;
        const maxX = CANVAS_WIDTH - PADDLE_WIDTH / 2 - 16;
        paddleXRef.current = Math.max(minX, Math.min(maxX, paddleXRef.current));

        if (elapsed >= nextSpawn) {
          const laneX = SPAWN_LANES[spawnCount % SPAWN_LANES.length] ?? CANVAS_WIDTH / 2;
          fireballs.push({
            id: spawnCount + 1,
            x: laneX,
            y: -30,
            vx: 0,
            vy: 175 + (spawnCount % 3) * 18,
            radius: 28,
            bounced: false,
            done: false,
          });
          spawnCount += 1;
          nextSpawn = elapsed + 1.65;
        }

        for (const fb of fireballs) {
          if (fb.done) continue;
          fb.x += fb.vx * dt;
          fb.y += fb.vy * dt;

          if (
            !fb.bounced &&
            fb.vy > 0 &&
            fb.y + fb.radius >= PADDLE_Y - 10 &&
            fb.y - fb.radius <= PADDLE_Y + PADDLE_HEIGHT &&
            Math.abs(fb.x - paddleXRef.current) <= PADDLE_WIDTH / 2 + fb.radius
          ) {
            fb.bounced = true;
            fb.vy = -380;
            fb.vx = (fb.x - paddleXRef.current) * 1.8;
            blockedCount += 1;
            setBlockedUi(blockedCount);
            playCue('water_flow');
            spawnShieldSparks(sparks, fb.x, PADDLE_Y, '#9BD8A7', 16);
          }

          if (fb.y < -60 || fb.y > 670) {
            if (!fb.bounced && fb.y > 650) {
              spawnShieldSparks(sparks, fb.x, 645, '#79C8E8', 8);
            }
            fb.done = true;
          }
        }

        if (blockedCount >= TARGET_BLOCKED || elapsed >= WIN_DURATION_SEC) {
          wonRef.current = true;
          playCue('success');
          setWon(true);
        }
      }

      for (const s of sparks) {
        if (!s.active) continue;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0) s.active = false;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawStormScene(ctx, paddleXRef.current, fireballs, sparks, elapsed, blockedCount);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const movePaddleFromPointer = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const minX = PADDLE_WIDTH / 2 + 16;
    const maxX = CANVAS_WIDTH - PADDLE_WIDTH / 2 - 16;
    paddleXRef.current = Math.max(minX, Math.min(maxX, x));
  };

  return (
    <div
      className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col gap-3 bg-[#0F172A] border-2 border-[#79C8E8]/50 rounded-2xl p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Solar Storm Shield"
    >
      {/* Clean Top Bar: Title + 1 short instruction + SKIP */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#79C8E8] p-1.5 text-[#0F172A]">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#F8FAFC] sm:text-xl">
              Solar Storm Shield
            </h2>
          </div>
          <span className="font-display text-base font-extrabold text-[#79C8E8] sm:text-lg">
            Move the shield to block 5 fireballs!
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

      {/* 16:9 Canvas Stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-[#79C8E8]/35 bg-[#050918]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerMove={(e) => movePaddleFromPointer(e.clientX)}
          onPointerDown={(e) => movePaddleFromPointer(e.clientX)}
          className="pixelated aspect-video max-h-full max-w-full cursor-ew-resize touch-none object-contain"
        />
      </div>

      {/* Simple Left / Right Buttons + Blocked Counter */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <button
          type="button"
          onPointerDown={() => {
            keysRef.current.left = true;
          }}
          onPointerUp={() => {
            keysRef.current.left = false;
          }}
          onPointerLeave={() => {
            keysRef.current.left = false;
          }}
          onPointerCancel={() => {
            keysRef.current.left = false;
          }}
          onClick={(e) => {
            if (e.detail === 0) {
              paddleXRef.current = Math.max(PADDLE_WIDTH / 2 + 16, paddleXRef.current - 95);
            }
          }}
          className="flex flex-1 touch-none select-none items-center justify-center gap-2 rounded-xl border-2 border-[#79C8E8] bg-[#1E293B] py-3 font-display text-base font-extrabold text-[#79C8E8] hover:bg-[#79C8E8]/20 focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
        >
          <ArrowLeft className="h-5 w-5" />
          ◀ LEFT
        </button>

        <div className="rounded-xl bg-[#1E293B] px-5 py-3 font-display text-base font-extrabold text-[#9BD8A7]">
          🛡️ {Math.min(TARGET_BLOCKED, blockedUi)} / {TARGET_BLOCKED}
        </div>

        <button
          type="button"
          onPointerDown={() => {
            keysRef.current.right = true;
          }}
          onPointerUp={() => {
            keysRef.current.right = false;
          }}
          onPointerLeave={() => {
            keysRef.current.right = false;
          }}
          onPointerCancel={() => {
            keysRef.current.right = false;
          }}
          onClick={(e) => {
            if (e.detail === 0) {
              paddleXRef.current = Math.min(
                CANVAS_WIDTH - PADDLE_WIDTH / 2 - 16,
                paddleXRef.current + 95,
              );
            }
          }}
          className="flex flex-1 touch-none select-none items-center justify-center gap-2 rounded-xl border-2 border-[#79C8E8] bg-[#1E293B] py-3 font-display text-base font-extrabold text-[#79C8E8] hover:bg-[#79C8E8]/20 focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
        >
          RIGHT ▶
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Celebratory Overlay */}
      {won && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#0F172A]/90 p-6 text-center backdrop-blur-sm">
          <div className="font-display text-4xl font-extrabold text-[#FFD66B] sm:text-5xl">
            GREAT JOB! 🎉
          </div>
          <div className="font-display text-2xl font-bold text-[#9BD8A7] sm:text-3xl">
            STORM BLOCKED! 🛡️
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
