import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Flame, Rocket } from 'lucide-react';
import type { GameState, LandingSite, MiniGameGrade } from '../../types/game';
import { playCue } from '../../services/soundEngine';

interface LunarLanderGameProps {
  state: Readonly<GameState>;
  onComplete: (
    grade: MiniGameGrade,
    site: LandingSite,
    touchdownVelocity: number,
  ) => void;
  onClose: () => void;
}

interface DustParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface StarDot {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

interface LanderPhysics {
  alt: number;
  vDown: number;
  elapsed: number;
  particles: DustParticle[];
}

interface TouchdownOutcome {
  grade: MiniGameGrade;
  gentle: boolean;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const GROUND_BASE_Y = 626;
const ROCKET_X = CANVAS_WIDTH / 2;
const START_ALT = 100;
const MAX_ALT = 108;
const PX_PER_M_ALT = 4.95;
const LUNAR_GRAVITY = 1.45;
const RETRO_THRUST = 4.25;
const SAFE_SPEED_MAX = 4.5;
const MAX_VISUAL_SPEED = 9.5;
const MAX_PARTICLES = 72;

const STARS: readonly StarDot[] = Array.from({ length: 84 }, (_, idx) => ({
  x: ((idx * 173 + 29) % (CANVAS_WIDTH - 20)) + 10,
  y: ((idx * 101 + 17) % 440) + 12,
  size: idx % 7 === 0 ? 4 : idx % 3 === 0 ? 3 : 2,
  baseAlpha: 0.4 + ((idx * 19) % 50) / 100,
  twinkleSpeed: 1.4 + (idx % 5) * 0.65,
  phase: idx * 0.85,
}));

function createParticlePool(): DustParticle[] {
  return Array.from({ length: MAX_PARTICLES }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0.5,
    size: 5,
    color: '#FFD66B',
  }));
}

function spawnParticle(
  pool: DustParticle[],
  x: number,
  y: number,
  vx: number,
  vy: number,
  maxLife: number,
  size: number,
  color: string,
): void {
  for (const p of pool) {
    if (!p.active) {
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.life = maxLife;
      p.maxLife = maxLife;
      p.size = size;
      p.color = color;
      return;
    }
  }
}

function drawLanderScene(
  ctx: CanvasRenderingContext2D,
  phys: LanderPhysics,
  thrusting: boolean,
  landed: boolean,
): void {
  ctx.imageSmoothingEnabled = false;

  // Deep space sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#060B1A');
  skyGrad.addColorStop(0.65, '#132247');
  skyGrad.addColorStop(1, '#263C75');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Twinkling pixel stars
  for (const s of STARS) {
    const twinkle = 0.65 + 0.35 * Math.sin(phys.elapsed * s.twinkleSpeed + s.phase);
    ctx.fillStyle = `rgba(248, 250, 252, ${(s.baseAlpha * twinkle).toFixed(2)})`;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
  }

  // Slowly rotating pixel Earth in upper right sky
  const earthX = 180;
  const earthY = 128;
  ctx.save();
  ctx.beginPath();
  ctx.arc(earthX, earthY, 50, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(121, 200, 232, 0.22)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(earthX, earthY, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#2563EB';
  ctx.fill();
  ctx.clip();

  const shift = ((phys.elapsed * 7) % 80) - 40;
  ctx.fillStyle = '#9BD8A7';
  ctx.fillRect(Math.round(earthX - 20 + shift * 0.5), earthY - 24, 22, 16);
  ctx.fillRect(Math.round(earthX + 2 + shift * 0.5), earthY + 2, 20, 18);
  ctx.fillStyle = 'rgba(248, 250, 252, 0.7)';
  ctx.fillRect(Math.round(earthX - 26 - shift * 0.35), earthY - 10, 28, 6);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(earthX, earthY, 41, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(121, 200, 232, 0.75)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Golden Polar Sun glow on left ridge
  ctx.beginPath();
  ctx.arc(92, 496, 36, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD66B';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(92, 496, 56, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 214, 107, 0.22)';
  ctx.fill();

  // Distant moon mountain silhouettes
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_BASE_Y);
  ctx.lineTo(150, 520);
  ctx.lineTo(310, 572);
  ctx.lineTo(440, 534);
  ctx.lineTo(840, 536);
  ctx.lineTo(1000, 568);
  ctx.lineTo(1160, 514);
  ctx.lineTo(CANVAS_WIDTH, 540);
  ctx.lineTo(CANVAS_WIDTH, GROUND_BASE_Y);
  ctx.closePath();
  ctx.fill();

  // Lunar surface ground
  ctx.fillStyle = '#64748B';
  ctx.fillRect(0, GROUND_BASE_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_BASE_Y);
  ctx.fillStyle = '#475569';
  ctx.fillRect(0, GROUND_BASE_Y + 30, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_BASE_Y - 30);

  // Wide glowing green landing pad right in the center
  const padW = 360;
  const padLeft = ROCKET_X - padW / 2;
  ctx.fillStyle = 'rgba(155, 216, 167, 0.18)';
  ctx.fillRect(padLeft - 14, GROUND_BASE_Y - 18, padW + 28, 22);

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(padLeft, GROUND_BASE_Y - 8, padW, 22);
  ctx.fillStyle = '#9BD8A7';
  ctx.fillRect(padLeft + 12, GROUND_BASE_Y - 8, padW - 24, 10);

  // Blinking landing beacons
  const beaconBright = Math.sin(phys.elapsed * 6) > 0;
  ctx.fillStyle = beaconBright ? '#9BD8A7' : '#FFD66B';
  ctx.fillRect(padLeft - 8, GROUND_BASE_Y - 38, 12, 32);
  ctx.fillRect(padLeft + padW - 4, GROUND_BASE_Y - 38, 12, 32);
  ctx.fillStyle = beaconBright ? 'rgba(155, 216, 167, 0.45)' : 'rgba(255, 214, 107, 0.35)';
  ctx.beginPath();
  ctx.arc(padLeft - 2, GROUND_BASE_Y - 38, 18, 0, Math.PI * 2);
  ctx.arc(padLeft + padW + 2, GROUND_BASE_Y - 38, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9BD8A7';
  ctx.fillText('LANDING PAD', ROCKET_X, GROUND_BASE_Y + 46);
  ctx.textAlign = 'left';

  // Pooled exhaust & dust particles
  for (const p of phys.particles) {
    if (!p.active) continue;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // Big pixel rocket centered above the landing pad
  const rocketY = GROUND_BASE_Y - 40 - phys.alt * PX_PER_M_ALT;
  ctx.save();
  ctx.translate(ROCKET_X, Math.round(rocketY));

  if (thrusting && !landed) {
    const flicker = Math.sin(phys.elapsed * 48) * 12;
    const flameLen = 42 + flicker;

    ctx.fillStyle = '#F87171';
    ctx.beginPath();
    ctx.moveTo(-20, 24);
    ctx.lineTo(0, 24 + flameLen);
    ctx.lineTo(20, 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFD66B';
    ctx.beginPath();
    ctx.moveTo(-12, 24);
    ctx.lineTo(0, 24 + flameLen * 0.72);
    ctx.lineTo(12, 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(-5, 24, 10, Math.max(10, Math.round(flameLen * 0.35)));
  }

  // Rocket landing legs
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-22, 14);
  ctx.lineTo(-42, 34);
  ctx.moveTo(22, 14);
  ctx.lineTo(42, 34);
  ctx.stroke();

  ctx.fillStyle = '#FFD66B';
  ctx.fillRect(-52, 32, 20, 8);
  ctx.fillRect(32, 32, 20, 8);

  // Gold descent booster stage
  ctx.fillStyle = '#FFD66B';
  ctx.fillRect(-30, -8, 60, 26);
  ctx.fillStyle = '#D97706';
  ctx.fillRect(-30, 12, 60, 7);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(-12, 18, 24, 8);

  // Crisp chalk cabin + blue window visor
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(-22, -44, 44, 36);
  ctx.fillStyle = '#263C75';
  ctx.fillRect(-14, -34, 28, 16);
  ctx.fillStyle = '#79C8E8';
  ctx.fillRect(-10, -30, 12, 8);

  // Nose cone & flag antenna
  ctx.fillStyle = '#F87171';
  ctx.beginPath();
  ctx.moveTo(-22, -44);
  ctx.lineTo(0, -70);
  ctx.lineTo(22, -44);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Giant Visual Speed Meter on Right Side of Canvas
  const barX = 1130;
  const barY = 96;
  const barW = 68;
  const barH = 440;
  const safeRatio = SAFE_SPEED_MAX / MAX_VISUAL_SPEED;
  const safeH = Math.round(barH * safeRatio);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(barX - 42, barY - 46, 154, barH + 74);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(barX - 42, barY - 46, 154, barH + 74);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPEED', barX + barW / 2, barY - 14);

  // Green safe zone (top half) & Yellow fast zone (bottom half)
  ctx.fillStyle = 'rgba(155, 216, 167, 0.35)';
  ctx.fillRect(barX, barY, barW, safeH);
  ctx.strokeStyle = '#9BD8A7';
  ctx.lineWidth = 3;
  ctx.strokeRect(barX, barY, barW, safeH);

  ctx.fillStyle = 'rgba(255, 214, 107, 0.25)';
  ctx.fillRect(barX, barY + safeH, barW, barH - safeH);
  ctx.strokeStyle = '#FFD66B';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY + safeH, barW, barH - safeH);

  // Safe / Fast Labels inside bar
  ctx.fillStyle = '#9BD8A7';
  ctx.font = 'bold 16px Nunito, sans-serif';
  ctx.fillText('SAFE', barX + barW / 2, barY + safeH / 2 + 6);
  ctx.fillStyle = '#FFD66B';
  ctx.fillText('FAST', barX + barW / 2, barY + safeH + (barH - safeH) / 2 + 6);

  // Current speed marker
  const clampedV = Math.max(0, Math.min(MAX_VISUAL_SPEED, phys.vDown));
  const markerY = barY + (clampedV / MAX_VISUAL_SPEED) * barH;
  const inGreen = phys.vDown <= SAFE_SPEED_MAX;

  ctx.fillStyle = inGreen ? '#9BD8A7' : '#FFD66B';
  ctx.fillRect(barX - 12, Math.round(markerY - 8), barW + 24, 16);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  ctx.strokeRect(barX - 12, Math.round(markerY - 8), barW + 24, 16);

  ctx.fillStyle = inGreen ? '#9BD8A7' : '#FFD66B';
  ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
  ctx.fillText(inGreen ? 'GENTLE ✓' : 'HOLD THRUST', barX + barW / 2, barY + barH + 22);
  ctx.textAlign = 'left';
}

export const LunarLanderGame: React.FC<LunarLanderGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [thrustingUi, setThrustingUi] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<TouchdownOutcome | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physRef = useRef<LanderPhysics>({
    alt: START_ALT,
    vDown: 2.8,
    elapsed: 0,
    particles: createParticlePool(),
  });
  const thrustRef = useRef<boolean>(false);
  const spaceHeldRef = useRef<boolean>(false);
  const blockSpaceConfirmRef = useRef<boolean>(false);
  const outcomeRef = useRef<TouchdownOutcome | null>(null);
  const lastCueRef = useRef<number>(0);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleConfirmWin = useCallback(() => {
    if (!outcomeRef.current) return;
    playCue('confirm');
    onComplete(outcomeRef.current.grade, 'sunlit_ridge', 1.2);
  }, [onComplete]);

  useEffect(() => {
    if (outcome !== null) {
      continueBtnRef.current?.focus();
    }
  }, [outcome]);

  // Keyboard controls: Escape closes, Space/ArrowUp/W thrusts during flight
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
        return;
      }

      const k = e.key.toLowerCase();
      if (e.code === 'Space' || k === 'arrowup' || k === 'w') {
        if (outcomeRef.current !== null) {
          if (e.code === 'Space' && (blockSpaceConfirmRef.current || e.repeat)) {
            e.preventDefault();
          }
          return;
        }
        e.preventDefault();
        if (e.code === 'Space') {
          spaceHeldRef.current = true;
        }
        thrustRef.current = true;
        setThrustingUi(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.code === 'Space' || k === 'arrowup' || k === 'w') {
        if (e.code === 'Space') {
          spaceHeldRef.current = false;
          if (blockSpaceConfirmRef.current) {
            blockSpaceConfirmRef.current = false;
            e.preventDefault();
          }
        }
        thrustRef.current = false;
        setThrustingUi(false);
      }
    };

    const clearThrust = () => {
      thrustRef.current = false;
      spaceHeldRef.current = false;
      blockSpaceConfirmRef.current = false;
      setThrustingUi(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearThrust);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearThrust);
    };
  }, [onClose]);

  // 60fps animation & descent loop (zero per-frame setState)
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;

      const phys = physRef.current;
      phys.elapsed += dt;

      if (outcomeRef.current === null) {
        phys.vDown += LUNAR_GRAVITY * dt;
        if (thrustRef.current) {
          phys.vDown -= RETRO_THRUST * dt;
          if (now - lastCueRef.current > 165) {
            playCue('thruster');
            lastCueRef.current = now;
          }
        }
        phys.vDown = Math.max(-2.6, Math.min(MAX_VISUAL_SPEED, phys.vDown));
        phys.alt = Math.min(MAX_ALT, phys.alt - phys.vDown * dt);

        const rocketY = GROUND_BASE_Y - 40 - phys.alt * PX_PER_M_ALT;
        if (thrustRef.current && phys.alt > 1) {
          spawnParticle(
            phys.particles,
            ROCKET_X + (Math.random() - 0.5) * 18,
            rocketY + 34,
            (Math.random() - 0.5) * 55,
            110 + Math.random() * 80,
            0.25,
            6,
            Math.random() > 0.4 ? '#FFD66B' : '#F87171',
          );
        }

        if (phys.alt < 26 && thrustRef.current) {
          for (let i = 0; i < 2; i++) {
            const dir = i % 2 === 0 ? -1 : 1;
            spawnParticle(
              phys.particles,
              ROCKET_X + (Math.random() - 0.5) * 32,
              GROUND_BASE_Y - 6,
              dir * (55 + Math.random() * 110),
              -(22 + Math.random() * 48),
              0.46,
              6,
              '#CBD5E1',
            );
          }
        }

        if (phys.alt <= 0) {
          phys.alt = 0;
          thrustRef.current = false;
          setThrustingUi(false);
          if (spaceHeldRef.current) {
            blockSpaceConfirmRef.current = true;
          }

          const gentle = phys.vDown <= SAFE_SPEED_MAX;
          const nextOutcome: TouchdownOutcome = {
            grade: gentle ? 'gold' : 'silver',
            gentle,
          };
          outcomeRef.current = nextOutcome;

          // Celebratory touchdown sparkles
          for (let i = 0; i < 28; i++) {
            const angle = (Math.PI * 2 * i) / 28;
            const spd = 70 + Math.random() * 150;
            spawnParticle(
              phys.particles,
              ROCKET_X,
              GROUND_BASE_Y - 24,
              Math.cos(angle) * spd,
              Math.sin(angle) * spd - 60,
              0.75,
              7,
              i % 2 === 0 ? '#9BD8A7' : '#FFD66B',
            );
          }

          playCue('success');
          setOutcome(nextOutcome);
        }
      }

      for (const p of phys.particles) {
        if (!p.active) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 80 * dt;
        p.life -= dt;
        if (p.life <= 0) p.active = false;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawLanderScene(ctx, phys, thrustRef.current, outcomeRef.current !== null);
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col gap-3 bg-[#0F172A] border-2 border-[#79C8E8]/50 rounded-2xl p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Moon Rocket Landing"
    >
      {/* Clean Top Bar: Title + 1 short instruction + SKIP */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#FFD66B] p-1.5 text-[#0F172A]">
              <Rocket className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#F8FAFC] sm:text-xl">
              Moon Rocket Landing
            </h2>
          </div>
          <span className="font-display text-base font-extrabold text-[#FFD66B] sm:text-lg">
            Hold SPACE or button to slow down!
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playCue('confirm');
            onComplete('silver', 'sunlit_ridge', 1.2);
          }}
          className="shrink-0 rounded-xl border border-[#79C8E8]/50 bg-[#1E293B] px-3.5 py-1.5 font-display text-sm font-extrabold text-[#79C8E8] transition-colors hover:bg-[#79C8E8] hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
        >
          SKIP →
        </button>
      </div>

      {/* 16:9 Canvas Stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-[#79C8E8]/35 bg-[#060B1A]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="pixelated aspect-video max-h-full max-w-full object-contain"
        />
      </div>

      {/* Giant Kid-Friendly Hold Thrust Button */}
      <div className="flex shrink-0 justify-center">
        <button
          type="button"
          onPointerDown={() => {
            thrustRef.current = true;
            setThrustingUi(true);
          }}
          onPointerUp={() => {
            thrustRef.current = false;
            setThrustingUi(false);
          }}
          onPointerLeave={() => {
            thrustRef.current = false;
            setThrustingUi(false);
          }}
          onPointerCancel={() => {
            thrustRef.current = false;
            setThrustingUi(false);
          }}
          className={`flex w-full max-w-md touch-none select-none items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-display text-lg font-extrabold shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-[#FFD66B] ${
            thrustingUi
              ? 'scale-[0.98] bg-[#F87171] text-[#0F172A]'
              : 'bg-[#FFD66B] text-[#0F172A] hover:brightness-95'
          }`}
        >
          <Flame className="h-6 w-6" />
          🔥 THRUST / SLOW DOWN
        </button>
      </div>

      {/* Celebratory Overlay on Touchdown */}
      {outcome !== null && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#0F172A]/90 p-6 text-center backdrop-blur-sm">
          <div className="font-display text-4xl font-extrabold text-[#FFD66B] sm:text-5xl">
            GREAT JOB! 🎉
          </div>
          <div className="font-display text-2xl font-bold text-[#9BD8A7] sm:text-3xl">
            SAFE TOUCHDOWN! 🚀
          </div>
          <button
            ref={continueBtnRef}
            type="button"
            onKeyDown={(e) => {
              if (e.code === 'Space' && blockSpaceConfirmRef.current) {
                e.preventDefault();
              } else if (e.repeat) {
                e.preventDefault();
              }
            }}
            onClick={handleConfirmWin}
            className="mt-2 rounded-2xl bg-[#9BD8A7] px-10 py-4 font-display text-2xl font-extrabold text-[#0F172A] shadow-[0_0_28px_rgba(155,216,167,0.75)] transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#F8FAFC]"
          >
            CONTINUE →
          </button>
        </div>
      )}
    </div>
  );
};
