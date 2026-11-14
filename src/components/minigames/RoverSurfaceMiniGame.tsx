import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Compass, Snowflake } from 'lucide-react';
import type { GameState, MiniGameGrade } from '../../types/game';
import { playCue } from '../../services/soundEngine';

interface RoverSurfaceMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

interface Vec2 {
  x: number;
  y: number;
}

interface IceCrystal {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface IceSparkle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface TreadMark {
  active: boolean;
  x: number;
  y: number;
  angle: number;
  life: number;
  maxLife: number;
}

const MAP_WIDTH = 1280;
const MAP_HEIGHT = 720;
const ROVER_SPEED = 560;
const CRYSTAL_COUNT = 5;

const INITIAL_CRYSTALS: readonly Vec2[] = [
  { x: 250, y: 190 },
  { x: 640, y: 145 },
  { x: 1030, y: 205 },
  { x: 330, y: 545 },
  { x: 960, y: 535 },
];

function createCrystals(): IceCrystal[] {
  return INITIAL_CRYSTALS.map((pos, idx) => ({
    id: idx + 1,
    x: pos.x,
    y: pos.y,
    collected: false,
  }));
}

function createSparklePool(): IceSparkle[] {
  return Array.from({ length: 64 }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0.5,
    color: '#79C8E8',
  }));
}

function createTreadPool(): TreadMark[] {
  return Array.from({ length: 48 }, () => ({
    active: false,
    x: 0,
    y: 0,
    angle: 0,
    life: 0,
    maxLife: 2.2,
  }));
}

function spawnCrystalBurst(pool: IceSparkle[], x: number, y: number): void {
  let spawned = 0;
  for (const s of pool) {
    if (!s.active) {
      const angle = (Math.PI * 2 * spawned) / 14 + Math.random() * 0.3;
      const spd = 80 + Math.random() * 170;
      s.active = true;
      s.x = x;
      s.y = y;
      s.vx = Math.cos(angle) * spd;
      s.vy = Math.sin(angle) * spd;
      s.maxLife = 0.55;
      s.life = 0.55;
      s.color = spawned % 2 === 0 ? '#79C8E8' : '#F8FAFC';
      spawned += 1;
      if (spawned >= 14) return;
    }
  }
}

function spawnTread(pool: TreadMark[], x: number, y: number, angle: number): void {
  for (const t of pool) {
    if (!t.active) {
      t.active = true;
      t.x = x;
      t.y = y;
      t.angle = angle;
      t.maxLife = 2.2;
      t.life = 2.2;
      return;
    }
  }
}

function drawRoverScene(
  ctx: CanvasRenderingContext2D,
  rover: Vec2,
  heading: number,
  target: Vec2 | null,
  crystals: IceCrystal[],
  treads: TreadMark[],
  sparkles: IceSparkle[],
  elapsed: number,
  collected: number,
): void {
  ctx.imageSmoothingEnabled = false;

  // Shackleton Crater Moon Surface
  ctx.fillStyle = '#253248';
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Soft decorative craters (non-blocking!)
  const decorCraters: readonly { x: number; y: number; r: number }[] = [
    { x: 160, y: 380, r: 62 },
    { x: 520, y: 320, r: 46 },
    { x: 840, y: 330, r: 58 },
    { x: 1120, y: 420, r: 68 },
    { x: 640, y: 585, r: 52 },
  ];
  for (const c of decorCraters) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Wheel tracks
  for (const t of treads) {
    if (!t.active) continue;
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.angle);
    ctx.globalAlpha = Math.max(0, (t.life / t.maxLife) * 0.5);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-5, -18, 9, 5);
    ctx.fillRect(-5, 13, 9, 5);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // Target guide ring when driving toward a clicked crystal
  if (target) {
    const pulse = 24 + Math.sin(elapsed * 8) * 5;
    ctx.beginPath();
    ctx.arc(target.x, target.y, pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 214, 107, 0.75)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // 5 Big Sparkling Blue Ice Crystals
  for (const crystal of crystals) {
    if (crystal.collected) continue;
    ctx.save();
    ctx.translate(crystal.x, crystal.y);

    const haloR = 46 + Math.sin(elapsed * 5 + crystal.id) * 6;
    ctx.beginPath();
    ctx.arc(0, 0, haloR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(121, 200, 232, 0.22)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(121, 200, 232, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Big blue crystal diamond
    ctx.fillStyle = '#79C8E8';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(26, 0);
    ctx.lineTo(0, 30);
    ctx.lineTo(-26, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner bright ice facet
    ctx.fillStyle = '#BAE6FD';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(12, 0);
    ctx.lineTo(0, 16);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();

    // Animated sparkle star
    if (Math.sin(elapsed * 6 + crystal.id * 1.7) > 0) {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-2, -12, 4, 24);
      ctx.fillRect(-12, -2, 24, 4);
    }

    ctx.restore();
  }

  // Ice scoop sparkles
  for (const s of sparkles) {
    if (!s.active) continue;
    ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
    ctx.fillStyle = s.color;
    ctx.fillRect(Math.round(s.x - 4), Math.round(s.y - 4), 8, 8);
  }
  ctx.globalAlpha = 1;

  // Pixel Moon Rover
  ctx.save();
  ctx.translate(Math.round(rover.x), Math.round(rover.y));
  ctx.rotate(heading);

  // 4 rugged wheels
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(-28, -28, 16, 10);
  ctx.fillRect(12, -28, 16, 10);
  ctx.fillRect(-28, 18, 16, 10);
  ctx.fillRect(12, 18, 16, 10);

  // Gold rover body + solar deck
  ctx.fillStyle = '#FFD66B';
  ctx.fillRect(-24, -18, 48, 36);
  ctx.fillStyle = '#263C75';
  ctx.fillRect(-14, -12, 26, 24);

  // Front headlights & scoop mast
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(14, -9, 12, 18);
  ctx.fillStyle = '#9BD8A7';
  ctx.fillRect(24, -5, 7, 10);
  ctx.restore();

  // Top-left crystal counter pill on canvas
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(20, 18, 220, 50);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 18, 220, 50);
  ctx.fillStyle = '#79C8E8';
  ctx.font = 'bold 24px Fredoka, Nunito, sans-serif';
  ctx.fillText(`ICE: ${collected} / ${CRYSTAL_COUNT}`, 38, 51);
}

export const RoverSurfaceMiniGame: React.FC<RoverSurfaceMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [collectedUi, setCollectedUi] = useState<number>(0);
  const [won, setWon] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const roverRef = useRef<Vec2>({ x: 640, y: 380 });
  const headingRef = useRef<number>(0);
  const targetRef = useRef<Vec2 | null>(null);
  const crystalsRef = useRef<IceCrystal[]>(createCrystals());
  const treadsRef = useRef<TreadMark[]>(createTreadPool());
  const sparklesRef = useRef<IceSparkle[]>(createSparklePool());
  const keysRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const wonRef = useRef<boolean>(false);
  const blockSpaceConfirmRef = useRef<boolean>(false);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (won) {
      continueBtnRef.current?.focus();
    }
  }, [won]);

  const driveToNearestCrystal = useCallback((fromSpaceKey = false) => {
    if (wonRef.current) return;
    let best: IceCrystal | null = null;
    let bestDist = Infinity;
    for (const c of crystalsRef.current) {
      if (c.collected) continue;
      const d = Math.hypot(c.x - roverRef.current.x, c.y - roverRef.current.y);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    if (best) {
      targetRef.current = { x: best.x, y: best.y };
      if (fromSpaceKey) {
        blockSpaceConfirmRef.current = true;
      }
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') {
        e.preventDefault();
        keysRef.current.up = true;
        targetRef.current = null;
      } else if (k === 's' || k === 'arrowdown') {
        e.preventDefault();
        keysRef.current.down = true;
        targetRef.current = null;
      } else if (k === 'a' || k === 'arrowleft') {
        e.preventDefault();
        keysRef.current.left = true;
        targetRef.current = null;
      } else if (k === 'd' || k === 'arrowright') {
        e.preventDefault();
        keysRef.current.right = true;
        targetRef.current = null;
      } else if (e.code === 'Space') {
        if (wonRef.current) {
          if (blockSpaceConfirmRef.current || e.repeat) {
            e.preventDefault();
          }
          return;
        }
        e.preventDefault();
        if (!e.repeat) {
          driveToNearestCrystal(true);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keysRef.current.up = false;
      else if (k === 's' || k === 'arrowdown') keysRef.current.down = false;
      else if (k === 'a' || k === 'arrowleft') keysRef.current.left = false;
      else if (k === 'd' || k === 'arrowright') keysRef.current.right = false;
      else if (e.code === 'Space' && blockSpaceConfirmRef.current) {
        blockSpaceConfirmRef.current = false;
        e.preventDefault();
      }
    };

    const clearKeys = () => {
      keysRef.current = { up: false, down: false, left: false, right: false };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, [driveToNearestCrystal, onClose]);

  // 60fps Rover Loop (zero per-frame setState)
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    let elapsed = 0;
    let treadDist = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;
      elapsed += dt;

      if (!wonRef.current) {
        const rover = roverRef.current;
        let vx = 0;
        let vy = 0;

        if (keysRef.current.left) vx -= 1;
        if (keysRef.current.right) vx += 1;
        if (keysRef.current.up) vy -= 1;
        if (keysRef.current.down) vy += 1;

        if (vx !== 0 || vy !== 0) {
          const len = Math.hypot(vx, vy);
          const dx = (vx / len) * ROVER_SPEED * dt;
          const dy = (vy / len) * ROVER_SPEED * dt;
          rover.x = Math.max(40, Math.min(MAP_WIDTH - 40, rover.x + dx));
          rover.y = Math.max(40, Math.min(MAP_HEIGHT - 40, rover.y + dy));
          headingRef.current = Math.atan2(vy, vx);
          treadDist += Math.hypot(dx, dy);
        } else if (targetRef.current) {
          const tx = targetRef.current.x - rover.x;
          const ty = targetRef.current.y - rover.y;
          const dist = Math.hypot(tx, ty);
          if (dist <= 16) {
            rover.x = targetRef.current.x;
            rover.y = targetRef.current.y;
            targetRef.current = null;
          } else {
            const step = Math.min(dist, ROVER_SPEED * dt);
            rover.x += (tx / dist) * step;
            rover.y += (ty / dist) * step;
            headingRef.current = Math.atan2(ty, tx);
            treadDist += step;
          }
        }

        if (treadDist >= 24) {
          treadDist = 0;
          spawnTread(treadsRef.current, rover.x, rover.y, headingRef.current);
        }

        // Scoop any crystal within generous 58px radius
        let newlyCollected = false;
        for (const c of crystalsRef.current) {
          if (!c.collected && Math.hypot(rover.x - c.x, rover.y - c.y) <= 58) {
            c.collected = true;
            newlyCollected = true;
            spawnCrystalBurst(sparklesRef.current, c.x, c.y);
            playCue('confirm');
          }
        }

        if (newlyCollected) {
          const count = crystalsRef.current.filter((c) => c.collected).length;
          setCollectedUi(count);
          if (count >= CRYSTAL_COUNT) {
            wonRef.current = true;
            targetRef.current = null;
            playCue('success');
            setWon(true);
          }
        }
      }

      for (const t of treadsRef.current) {
        if (!t.active) continue;
        t.life -= dt;
        if (t.life <= 0) t.active = false;
      }

      for (const s of sparklesRef.current) {
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
          const collectedCount = crystalsRef.current.filter((c) => c.collected).length;
          drawRoverScene(
            ctx,
            roverRef.current,
            headingRef.current,
            targetRef.current,
            crystalsRef.current,
            treadsRef.current,
            sparklesRef.current,
            elapsed,
            collectedCount,
          );
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleCanvasClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (wonRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const clickX = ((e.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const clickY = ((e.clientY - rect.top) / rect.height) * MAP_HEIGHT;

    // Snap generously onto any uncollected ice crystal near the click
    let snapped: IceCrystal | null = null;
    let bestDist = 90;
    for (const c of crystalsRef.current) {
      if (c.collected) continue;
      const d = Math.hypot(c.x - clickX, c.y - clickY);
      if (d < bestDist) {
        bestDist = d;
        snapped = c;
      }
    }

    targetRef.current = snapped
      ? { x: snapped.x, y: snapped.y }
      : {
          x: Math.max(40, Math.min(MAP_WIDTH - 40, clickX)),
          y: Math.max(40, Math.min(MAP_HEIGHT - 40, clickY)),
        };
    playCue('click');
  };

  return (
    <div
      className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col gap-3 bg-[#0F172A] border-2 border-[#79C8E8]/50 rounded-2xl p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Moon Ice Hunt"
    >
      {/* Clean Top Bar: Title + 1 short instruction + SKIP */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#79C8E8] p-1.5 text-[#0F172A]">
              <Compass className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#F8FAFC] sm:text-xl">
              Moon Ice Hunt
            </h2>
          </div>
          <span className="font-display text-base font-extrabold text-[#79C8E8] sm:text-lg">
            Click all 5 glowing blue ice crystals!
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
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-[#79C8E8]/35 bg-[#1E293B]">
        <canvas
          ref={canvasRef}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          onPointerDown={handleCanvasClick}
          className="pixelated aspect-video max-h-full max-w-full cursor-pointer touch-none object-contain"
        />
      </div>

      {/* Bottom Counter & Easy Auto-Drive Button */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-[#1E293B] px-5 py-3 font-display text-base font-extrabold text-[#79C8E8]">
          <Snowflake className="h-5 w-5" />
          🧊 {collectedUi} / {CRYSTAL_COUNT} Ice
        </div>

        <button
          type="button"
          onClick={() => driveToNearestCrystal(false)}
          className="flex flex-1 max-w-md items-center justify-center gap-2 rounded-xl bg-[#79C8E8] px-6 py-3 font-display text-base font-extrabold text-[#0F172A] shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#FFD66B]"
        >
          🧊 GO TO NEXT CRYSTAL (SPACE)
        </button>
      </div>

      {/* Celebratory Overlay */}
      {won && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#0F172A]/90 p-6 text-center backdrop-blur-sm">
          <div className="font-display text-4xl font-extrabold text-[#FFD66B] sm:text-5xl">
            GREAT JOB! 🎉
          </div>
          <div className="font-display text-2xl font-bold text-[#9BD8A7] sm:text-3xl">
            5/5 ICE SCOOPED! 🧊
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
