import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  Radio,
  Snowflake,
} from 'lucide-react';
import type { GameState, MiniGameGrade } from '../../types/game';
import { playCue } from '../../services/soundEngine';

interface RoverSurfaceMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

type StageId = 'drive' | 'dish';

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

interface Boulder {
  x: number;
  y: number;
  r: number;
}

interface FrostTrap {
  id: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
}

interface SparkParticle {
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

interface RoverSim {
  elapsed: number;
  rover: Vec2;
  heading: number;
  target: Vec2 | null;
  crystals: IceCrystal[];
  treads: TreadMark[];
  particles: SparkParticle[];
  battery: number; // 20..100
  frostLevel: number; // 0..1
  trapHits: number;
  stageTransitionTimer: number;
  mastMeters: number; // 2..12 m
  dishDeg: number; // 0..65 deg above horizontal
  lockHoldSec: number;
}

const MAP_WIDTH = 1280;
const MAP_HEIGHT = 720;
const BASE_ROVER_SPEED = 460;
const CRYSTAL_COUNT = 4;

const INITIAL_CRYSTALS: readonly Vec2[] = [
  { x: 240, y: 180 },
  { x: 1030, y: 175 },
  { x: 310, y: 555 },
  { x: 1040, y: 540 },
];

const BOULDERS: readonly Boulder[] = [
  { x: 460, y: 235, r: 44 },
  { x: 825, y: 265, r: 46 },
  { x: 540, y: 515, r: 42 },
  { x: 840, y: 500, r: 44 },
];

const FROST_TRAPS: readonly FrostTrap[] = [
  { id: 1, x: 410, y: 375, rx: 92, ry: 62 },
  { id: 2, x: 760, y: 170, rx: 86, ry: 56 },
  { id: 3, x: 740, y: 565, rx: 95, ry: 60 },
];

function createCrystals(): IceCrystal[] {
  return INITIAL_CRYSTALS.map((pos, idx) => ({
    id: idx + 1,
    x: pos.x,
    y: pos.y,
    collected: false,
  }));
}

function createParticlePool(): SparkParticle[] {
  return Array.from({ length: 72 }, () => ({
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

function spawnBurst(pool: SparkParticle[], x: number, y: number, color: string, count: number): void {
  let spawned = 0;
  for (const s of pool) {
    if (!s.active) {
      const ang = (Math.PI * 2 * spawned) / count + Math.random() * 0.35;
      const spd = 80 + Math.random() * 170;
      s.active = true;
      s.x = x;
      s.y = y;
      s.vx = Math.cos(ang) * spd;
      s.vy = Math.sin(ang) * spd;
      s.maxLife = 0.55;
      s.life = 0.55;
      s.color = color;
      spawned += 1;
      if (spawned >= count) return;
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

function isInsideFrostTrap(x: number, y: number): boolean {
  for (const tr of FROST_TRAPS) {
    const nx = (x - tr.x) / tr.rx;
    const ny = (y - tr.y) / tr.ry;
    if (nx * nx + ny * ny <= 1) return true;
  }
  return false;
}

function drawDriveStage(ctx: CanvasRenderingContext2D, sim: RoverSim): void {
  ctx.imageSmoothingEnabled = false;

  // Crater floor background with sunlit rim glow on left
  ctx.fillStyle = '#253248';
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  const sunRim = ctx.createLinearGradient(0, 0, 320, 0);
  sunRim.addColorStop(0, 'rgba(255, 214, 107, 0.22)');
  sunRim.addColorStop(1, 'rgba(255, 214, 107, 0)');
  ctx.fillStyle = sunRim;
  ctx.fillRect(0, 0, 340, MAP_HEIGHT);

  // Dark -200°C Frost Shadow Traps
  for (const tr of FROST_TRAPS) {
    ctx.save();
    ctx.translate(tr.x, tr.y);
    ctx.fillStyle = 'rgba(8, 15, 38, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 0, tr.rx, tr.ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#79C8E8';
    ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('-200°C TRAP', 0, 6);
    ctx.restore();
  }
  ctx.textAlign = 'left';

  // Jagged Lunar Boulders
  for (const b of BOULDERS) {
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.fillRect(b.x - 16, b.y - 12, 24, 16);
  }

  // Wheel tracks
  for (const t of sim.treads) {
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

  // Target guide ring
  if (sim.target) {
    const pulse = 22 + Math.sin(sim.elapsed * 8) * 5;
    ctx.beginPath();
    ctx.arc(sim.target.x, sim.target.y, pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 214, 107, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // 4 Ice Core Deposits
  for (const crystal of sim.crystals) {
    if (crystal.collected) continue;
    ctx.save();
    ctx.translate(crystal.x, crystal.y);

    const haloR = 42 + Math.sin(sim.elapsed * 5 + crystal.id) * 5;
    ctx.beginPath();
    ctx.arc(0, 0, haloR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(121, 200, 232, 0.22)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(121, 200, 232, 0.85)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#79C8E8';
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(22, 0);
    ctx.lineTo(0, 26);
    ctx.lineTo(-22, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // Sparkles
  for (const s of sim.particles) {
    if (!s.active) continue;
    ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
    ctx.fillStyle = s.color;
    ctx.fillRect(Math.round(s.x - 4), Math.round(s.y - 4), 8, 8);
  }
  ctx.globalAlpha = 1;

  // Pixel Moon Rover with Wheel Freeze Frost Tint
  ctx.save();
  ctx.translate(Math.round(sim.rover.x), Math.round(sim.rover.y));
  ctx.rotate(sim.heading);

  const frosted = sim.frostLevel > 0.25;
  ctx.fillStyle = frosted ? '#79C8E8' : '#0F172A';
  ctx.fillRect(-28, -28, 16, 10);
  ctx.fillRect(12, -28, 16, 10);
  ctx.fillRect(-28, 18, 16, 10);
  ctx.fillRect(12, 18, 16, 10);

  ctx.fillStyle = '#FFD66B';
  ctx.fillRect(-24, -18, 48, 36);
  ctx.fillStyle = '#263C75';
  ctx.fillRect(-14, -12, 26, 24);
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(14, -9, 12, 18);
  ctx.fillStyle = '#9BD8A7';
  ctx.fillRect(24, -5, 7, 10);
  ctx.restore();

  // Top-Left Ice Counter
  const collected = sim.crystals.filter((c) => c.collected).length;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(20, 18, 250, 54);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 18, 250, 54);
  ctx.fillStyle = '#79C8E8';
  ctx.font = 'bold 23px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    collected >= CRYSTAL_COUNT ? 'ICE CORES 4/4 ✓' : `ICE CORES: ${collected} / ${CRYSTAL_COUNT}`,
    36,
    53,
  );

  // Top-Right Live Battery & Wheel Freeze Meter
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(884, 18, 376, 68);
  ctx.strokeStyle = sim.frostLevel > 0.25 ? '#38BDF8' : '#9BD8A7';
  ctx.lineWidth = 3;
  ctx.strokeRect(884, 18, 376, 68);

  ctx.fillStyle = sim.frostLevel > 0.25 ? '#38BDF8' : '#9BD8A7';
  ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    sim.frostLevel > 0.25 ? 'WHEELS FROSTED (-200°C)! SLOW' : 'WHEELS WARM ✓ | BATTERY:',
    902,
    44,
  );
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(902, 54, 280, 18);
  ctx.fillStyle = sim.battery < 40 ? '#F87171' : '#9BD8A7';
  ctx.fillRect(902, 54, Math.round(280 * (sim.battery / 100)), 18);
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 16px Nunito, sans-serif';
  ctx.fillText(`${Math.round(sim.battery)}%`, 1192, 69);
}

function drawDishStage(ctx: CanvasRenderingContext2D, sim: RoverSim): { aligned: boolean } {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#070E22';
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Twinkling stars
  for (let i = 0; i < 48; i++) {
    const sx = (i * 197 + 40) % MAP_WIDTH;
    const sy = (i * 83 + 20) % 420;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.65)';
    ctx.fillRect(sx, sy, i % 4 === 0 ? 3 : 2, i % 4 === 0 ? 3 : 2);
  }

  // Crater valley floor + Towering Jagged Rocky Ridge blocking line-of-sight!
  const ridgePeakX = 620;
  const ridgePeakY = 250;
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(0, 580);
  ctx.lineTo(390, 580);
  ctx.lineTo(525, 365);
  ctx.lineTo(ridgePeakX, ridgePeakY);
  ctx.lineTo(745, 420);
  ctx.lineTo(940, 240);
  ctx.lineTo(MAP_WIDTH, 240);
  ctx.lineTo(MAP_WIDTH, MAP_HEIGHT);
  ctx.lineTo(0, MAP_HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Dark crater shadow label on left
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fillRect(42, 608, 360, 44);
  ctx.fillStyle = '#79C8E8';
  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.fillText('CRATER SHADOW FLOOR (-200°C)', 58, 637);

  // Rocky Ridge warning badge
  ctx.fillStyle = '#F87171';
  ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ROCKY CRATER RIDGE', ridgePeakX, ridgePeakY - 16);
  ctx.textAlign = 'left';

  // High-Gain Base S-Band Relay Tower on upper-right sunlit ridge
  const towerX = 1090;
  const towerY = 138;
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(towerX - 10, towerY, 20, 104);
  ctx.fillStyle = '#FFD66B';
  ctx.beginPath();
  ctx.arc(towerX, towerY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(towerX, towerY, 34 + Math.sin(sim.elapsed * 5) * 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#9BD8A7';
  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BASE S-BAND RELAY', towerX, towerY - 46);
  ctx.textAlign = 'left';

  // Rover parked at bottom of crater valley
  const rx = 215;
  const ry = 532;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(rx - 52, ry + 26, 26, 22);
  ctx.fillRect(rx + 26, ry + 26, 26, 22);
  ctx.fillStyle = '#FFD66B';
  ctx.fillRect(rx - 58, ry - 4, 116, 36);
  ctx.fillStyle = '#263C75';
  ctx.fillRect(rx - 38, ry - 18, 76, 16);

  // Telescoping S-Band Mast (2m..12m -> 35..345px tall)
  const mastPx = 35 + ((sim.mastMeters - 2) / 10) * 310;
  const dishX = rx;
  const dishY = ry - 18 - mastPx;

  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(dishX - 6, dishY, 12, mastPx);

  // Tilting Parabolic Dish
  const rad = (-sim.dishDeg * Math.PI) / 180;
  ctx.save();
  ctx.translate(dishX, dishY);
  ctx.rotate(rad);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 28, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();
  ctx.fillStyle = '#FFD66B';
  ctx.fillRect(8, -4, 14, 8);
  ctx.restore();

  // Compute actual line-of-sight beam intersection with Rocky Ridge!
  const beamDirX = Math.cos(rad);
  const beamDirY = Math.sin(rad);
  const tToRidge = (ridgePeakX - dishX) / (beamDirX || 0.001);
  const beamYAtRidge = dishY + beamDirY * tToRidge;

  const tToTower = (towerX - dishX) / (beamDirX || 0.001);
  const beamYAtTower = dishY + beamDirY * tToTower;

  const clearsRidge = beamYAtRidge < ridgePeakY - 12;
  const hitsTower = Math.abs(beamYAtTower - towerY) <= 84;
  const aligned = clearsRidge && hitsTower;

  // Draw S-Band radio cone
  const endX = clearsRidge ? towerX : ridgePeakX;
  const endY = clearsRidge ? dishY + beamDirY * tToTower : beamYAtRidge;

  ctx.strokeStyle = aligned ? '#9BD8A7' : clearsRidge ? '#FFD66B' : '#F87171';
  ctx.lineWidth = aligned ? 6 : 4;
  ctx.setLineDash(aligned ? [] : [12, 8]);
  ctx.beginPath();
  ctx.moveTo(dishX, dishY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);

  if (aligned) {
    // Traveling data packets along S-Band beam!
    for (let i = 0; i < 6; i++) {
      const p = (sim.elapsed * 0.95 + i / 6) % 1;
      const px = dishX + (towerX - dishX) * p;
      const py = dishY + (towerY - dishY) * p;
      ctx.fillStyle = '#9BD8A7';
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (!clearsRidge) {
    ctx.fillStyle = '#F87171';
    ctx.beginPath();
    ctx.arc(ridgePeakX, Math.max(ridgePeakY, beamYAtRidge), 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top-Left Telemetry Alignment Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(28, 22, 520, 102);
  ctx.strokeStyle = aligned ? '#9BD8A7' : '#79C8E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 22, 520, 102);

  ctx.fillStyle = aligned ? '#9BD8A7' : clearsRidge ? '#FFD66B' : '#F87171';
  ctx.font = 'bold 23px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    aligned
      ? 'S-BAND LOCKED! TRANSMITTING DATA...'
      : clearsRidge
        ? 'RIDGE CLEARED — AIM DISH AT TOWER!'
        : 'BLACKOUT: RAISE MAST ABOVE RIDGE!',
    48,
    58,
  );
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 19px Nunito, sans-serif';
  ctx.fillText(
    `MAST: ${sim.mastMeters.toFixed(1)} m   |   TILT: ${Math.round(sim.dishDeg)}°`,
    48,
    92,
  );

  // Lock progress bar
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(48, 104, 480, 10);
  ctx.fillStyle = '#9BD8A7';
  ctx.fillRect(48, 104, Math.round(480 * Math.min(1, sim.lockHoldSec / 1.4)), 10);

  return { aligned };
}

export const RoverSurfaceMiniGame: React.FC<RoverSurfaceMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [stage, setStage] = useState<StageId>('drive');
  const [collectedUi, setCollectedUi] = useState<number>(0);
  const [dishUi, setDishUi] = useState<{ mast: number; deg: number }>({ mast: 3.5, deg: 24 });
  const [won, setWon] = useState<boolean>(false);
  const [earnedGrade, setEarnedGrade] = useState<MiniGameGrade>('gold');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<StageId>('drive');
  const wonRef = useRef<boolean>(false);
  const lastFrostSfxRef = useRef<number>(0);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  const keysRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const simRef = useRef<RoverSim>({
    elapsed: 0,
    rover: { x: 140, y: 370 },
    heading: 0,
    target: null,
    crystals: createCrystals(),
    treads: createTreadPool(),
    particles: createParticlePool(),
    battery: 100,
    frostLevel: 0,
    trapHits: 0,
    stageTransitionTimer: 0,
    mastMeters: 3.5,
    dishDeg: 24,
    lockHoldSec: 0,
  });

  useEffect(() => {
    if (won) {
      continueBtnRef.current?.focus();
    }
  }, [won]);

  const driveToNearestCrystal = useCallback(() => {
    if (wonRef.current || stageRef.current !== 'drive') return;
    const sim = simRef.current;
    let best: IceCrystal | null = null;
    let bestDist = Infinity;
    for (const c of sim.crystals) {
      if (c.collected) continue;
      const d = Math.hypot(c.x - sim.rover.x, c.y - sim.rover.y);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    if (best) {
      sim.target = { x: best.x, y: best.y };
      playCue('click');
    }
  }, []);

  const adjustMast = useCallback((deltaM: number) => {
    const sim = simRef.current;
    sim.mastMeters = Math.max(2, Math.min(12, sim.mastMeters + deltaM));
    setDishUi({ mast: sim.mastMeters, deg: sim.dishDeg });
    playCue('click');
  }, []);

  const adjustTilt = useCallback((deltaDeg: number) => {
    const sim = simRef.current;
    sim.dishDeg = Math.max(0, Math.min(60, sim.dishDeg + deltaDeg));
    setDishUi({ mast: sim.mastMeters, deg: sim.dishDeg });
    playCue('click');
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
        return;
      }
      if (wonRef.current) return;

      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') {
        e.preventDefault();
        keysRef.current.up = true;
        simRef.current.target = null;
      } else if (k === 's' || k === 'arrowdown') {
        e.preventDefault();
        keysRef.current.down = true;
        simRef.current.target = null;
      } else if (k === 'a' || k === 'arrowleft') {
        e.preventDefault();
        keysRef.current.left = true;
        simRef.current.target = null;
      } else if (k === 'd' || k === 'arrowright') {
        e.preventDefault();
        keysRef.current.right = true;
        simRef.current.target = null;
      } else if (e.code === 'Space' && !e.repeat && stageRef.current === 'drive') {
        e.preventDefault();
        driveToNearestCrystal();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keysRef.current.up = false;
      else if (k === 's' || k === 'arrowdown') keysRef.current.down = false;
      else if (k === 'a' || k === 'arrowleft') keysRef.current.left = false;
      else if (k === 'd' || k === 'arrowright') keysRef.current.right = false;
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

  // 60fps Loop
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    let treadDist = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;

      const sim = simRef.current;
      sim.elapsed += dt;

      if (!wonRef.current) {
        if (stageRef.current === 'drive') {
          const rover = sim.rover;
          const inTrap = isInsideFrostTrap(rover.x, rover.y);
          if (inTrap) {
            if (sim.frostLevel < 0.25) {
              sim.trapHits += 1;
            }
            sim.frostLevel = Math.min(1, sim.frostLevel + dt * 3.0);
            sim.battery = Math.max(20, sim.battery - 12 * dt);
            if (now - lastFrostSfxRef.current > 700) {
              playCue('frost_freeze');
              lastFrostSfxRef.current = now;
            }
          } else {
            sim.frostLevel = Math.max(0, sim.frostLevel - dt * 1.4);
            sim.battery = Math.min(100, sim.battery + 4 * dt);
          }

          const speed = BASE_ROVER_SPEED * (1 - sim.frostLevel * 0.45);
          let vx = 0;
          let vy = 0;
          if (keysRef.current.left) vx -= 1;
          if (keysRef.current.right) vx += 1;
          if (keysRef.current.up) vy -= 1;
          if (keysRef.current.down) vy += 1;

          if (vx !== 0 || vy !== 0) {
            const len = Math.hypot(vx, vy);
            const dx = (vx / len) * speed * dt;
            const dy = (vy / len) * speed * dt;
            rover.x = Math.max(44, Math.min(MAP_WIDTH - 44, rover.x + dx));
            rover.y = Math.max(94, Math.min(MAP_HEIGHT - 44, rover.y + dy));
            sim.heading = Math.atan2(vy, vx);
            treadDist += Math.hypot(dx, dy);
          } else if (sim.target) {
            const tx = sim.target.x - rover.x;
            const ty = sim.target.y - rover.y;
            const dist = Math.hypot(tx, ty);
            if (dist <= 16) {
              rover.x = sim.target.x;
              rover.y = sim.target.y;
              sim.target = null;
            } else {
              const step = Math.min(dist, speed * dt);
              rover.x += (tx / dist) * step;
              rover.y += (ty / dist) * step;
              sim.heading = Math.atan2(ty, tx);
              treadDist += step;
            }
          }

          // Smooth boulder push-out so rover never sticks
          for (const b of BOULDERS) {
            const dx = rover.x - b.x;
            const dy = rover.y - b.y;
            const d = Math.hypot(dx, dy);
            const minD = b.r + 28;
            if (d < minD && d > 0.01) {
              rover.x = b.x + (dx / d) * minD;
              rover.y = b.y + (dy / d) * minD;
            }
          }

          if (treadDist >= 24) {
            treadDist = 0;
            spawnTread(sim.treads, rover.x, rover.y, sim.heading);
          }

          // Drill ice cores
          for (const c of sim.crystals) {
            if (!c.collected && Math.hypot(rover.x - c.x, rover.y - c.y) <= 60) {
              c.collected = true;
              spawnBurst(sim.particles, c.x, c.y, '#79C8E8', 16);
              playCue('confirm');
              const count = sim.crystals.filter((item) => item.collected).length;
              setCollectedUi(count);
              if (count >= CRYSTAL_COUNT) {
                sim.stageTransitionTimer = 0.85;
                playCue('radio_ping');
              }
            }
          }

          if (sim.crystals.every((c) => c.collected)) {
            sim.stageTransitionTimer -= dt;
            if (sim.stageTransitionTimer <= 0) {
              stageRef.current = 'dish';
              setStage('dish');
              setDishUi({ mast: sim.mastMeters, deg: sim.dishDeg });
            }
          }
        } else {
          // Stage 2: Smooth keyboard mast/dish adjustment
          let changed = false;
          if (keysRef.current.up) {
            sim.mastMeters = Math.min(12, sim.mastMeters + 4.8 * dt);
            changed = true;
          }
          if (keysRef.current.down) {
            sim.mastMeters = Math.max(2, sim.mastMeters - 4.8 * dt);
            changed = true;
          }
          if (keysRef.current.left) {
            sim.dishDeg = Math.min(60, sim.dishDeg + 34 * dt);
            changed = true;
          }
          if (keysRef.current.right) {
            sim.dishDeg = Math.max(0, sim.dishDeg - 34 * dt);
            changed = true;
          }
          if (changed) {
            setDishUi({ mast: sim.mastMeters, deg: sim.dishDeg });
          }
        }
      }

      for (const t of sim.treads) {
        if (!t.active) continue;
        t.life -= dt;
        if (t.life <= 0) t.active = false;
      }

      for (const s of sim.particles) {
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
          if (stageRef.current === 'drive') {
            drawDriveStage(ctx, sim);
          } else {
            const { aligned } = drawDishStage(ctx, sim);
            if (!wonRef.current) {
              if (aligned) {
                sim.lockHoldSec += dt;
                if (sim.lockHoldSec >= 1.4) {
                  wonRef.current = true;
                  const grade: MiniGameGrade = sim.trapHits <= 1 ? 'gold' : 'silver';
                  setEarnedGrade(grade);
                  playCue('success');
                  setWon(true);
                }
              } else {
                sim.lockHoldSec = Math.max(0, sim.lockHoldSec - dt * 0.8);
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

  const handleCanvasPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (wonRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = ((e.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const py = ((e.clientY - rect.top) / rect.height) * MAP_HEIGHT;
    const sim = simRef.current;

    if (stageRef.current === 'drive') {
      let snapped: IceCrystal | null = null;
      let bestDist = 90;
      for (const c of sim.crystals) {
        if (c.collected) continue;
        const d = Math.hypot(c.x - px, c.y - py);
        if (d < bestDist) {
          bestDist = d;
          snapped = c;
        }
      }
      sim.target = snapped
        ? { x: snapped.x, y: snapped.y }
        : {
            x: Math.max(44, Math.min(MAP_WIDTH - 44, px)),
            y: Math.max(94, Math.min(MAP_HEIGHT - 44, py)),
          };
      playCue('click');
    } else {
      // Stage 2: Left side drags/sets mast height; right side aims dish toward pointer
      const dishX = 215;
      const clampedPy = Math.max(130, Math.min(480, py));
      if (px < 450) {
        const mastPx = Math.max(35, Math.min(345, 514 - clampedPy));
        sim.mastMeters = Math.max(2, Math.min(12, 2 + ((mastPx - 35) / 310) * 10));
      } else {
        const mastPx = 35 + ((sim.mastMeters - 2) / 10) * 310;
        const dishY = 514 - mastPx;
        const desiredDeg = (-Math.atan2(py - dishY, Math.max(80, px - dishX)) * 180) / Math.PI;
        if (Number.isFinite(desiredDeg)) {
          sim.dishDeg = Math.max(0, Math.min(60, desiredDeg));
        }
      }
      setDishUi({ mast: sim.mastMeters, deg: sim.dishDeg });
    }
  };

  return (
    <div
      className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col gap-2.5 bg-[#0F172A] border-2 border-[#79C8E8]/55 rounded-2xl p-3 sm:p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Crater Rover & S-Band Relay"
    >
      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#79C8E8] p-1.5 text-[#0F172A]">
              {stage === 'drive' ? (
                <Compass className="h-5 w-5" />
              ) : (
                <Radio className="h-5 w-5" />
              )}
            </div>
            <h2 className="font-display text-base font-bold text-[#F8FAFC] sm:text-lg">
              Crater Rover &amp; Dish
            </h2>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#1E293B] px-2.5 py-1 text-xs font-extrabold">
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'drive'
                  ? 'bg-[#79C8E8] text-[#0F172A]'
                  : 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
              }`}
            >
              {stage === 'drive' ? '1: Drill Crater Ice' : '1: Ice Drilled ✓'}
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'dish' && !won
                  ? 'bg-[#FFD66B] text-[#0F172A]'
                  : won
                    ? 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
                    : 'text-slate-400'
              }`}
            >
              2: Clear Shadow Blackout
            </span>
          </div>

          <span className="font-display text-sm font-extrabold text-[#79C8E8] sm:text-base">
            {stage === 'drive'
              ? 'Steer around -200°C traps & boulders to drill 4 ice cores!'
              : 'Raise mast above the rocky ridge & aim dish at the Relay Tower!'}
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
          onPointerDown={handleCanvasPointer}
          onPointerMove={(e) => {
            if (e.buttons > 0 && stageRef.current === 'dish') {
              handleCanvasPointer(e);
            }
          }}
          className="pixelated aspect-video max-h-full max-w-full block cursor-pointer touch-none"
        />
      </div>

      {/* Bottom Controls */}
      {stage === 'drive' ? (
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-[#1E293B] px-4 py-2.5 font-display text-sm font-extrabold text-[#79C8E8] sm:text-base">
            <Snowflake className="h-5 w-5" />
            {collectedUi} / {CRYSTAL_COUNT} Ice Drilled
          </div>

          <button
            type="button"
            onClick={driveToNearestCrystal}
            className="flex flex-1 max-w-md items-center justify-center gap-2 rounded-xl bg-[#79C8E8] px-6 py-2.5 font-display text-base font-extrabold text-[#0F172A] shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#FFD66B]"
          >
            <Compass className="h-5 w-5" />
            AUTO-DRIVE TO ICE (SPACE)
          </button>
        </div>
      ) : (
        <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => adjustMast(1.5)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#FFD66B] py-2.5 font-display text-sm font-extrabold text-[#0F172A] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#F8FAFC]"
          >
            <ArrowUp className="h-4 w-4" />
            Mast + ({dishUi.mast.toFixed(0)}m)
          </button>

          <button
            type="button"
            onClick={() => adjustMast(-1.5)}
            className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-slate-600 bg-[#1E293B] py-2.5 font-display text-sm font-extrabold text-slate-200 hover:border-[#FFD66B] focus:outline-none focus:ring-2 focus:ring-[#FFD66B]"
          >
            <ArrowDown className="h-4 w-4" />
            Mast -
          </button>

          <button
            type="button"
            onClick={() => adjustTilt(5)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#79C8E8] py-2.5 font-display text-sm font-extrabold text-[#0F172A] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#F8FAFC]"
          >
            <ArrowLeft className="h-4 w-4" />
            Aim Up ({Math.round(dishUi.deg)}°)
          </button>

          <button
            type="button"
            onClick={() => adjustTilt(-5)}
            className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#79C8E8]/50 bg-[#1E293B] py-2.5 font-display text-sm font-extrabold text-[#79C8E8] hover:bg-[#79C8E8]/20 focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
          >
            Aim Down
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Visual Science Completion Card ("Science Proved!") */}
      {won && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[#0F172A]/95 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border-2 border-[#9BD8A7]/60 bg-[#1E293B] p-5 text-center shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#9BD8A7] px-3 py-0.5 font-display text-xs font-extrabold uppercase text-[#0F172A]">
                Science Proved!
              </span>
              <span className="rounded-full bg-[#FFD66B] px-3 py-0.5 font-display text-xs font-extrabold uppercase text-[#0F172A]">
                {earnedGrade.toUpperCase()} · S-BAND LINK CLEAR
              </span>
            </div>

            <h3 className="font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
              ICE CORES DRILLED &amp; RELAY RESTORED!
            </h3>

            <svg
              viewBox="0 0 560 132"
              className="w-full max-w-lg rounded-xl border border-[#79C8E8]/35 bg-[#0F172A]"
              aria-hidden="true"
            >
              {/* Rover on left in crater */}
              <polygon points="0,110 180,110 270,58 340,110 560,110 560,132 0,132" fill="#334155" />
              <rect x="64" y="88" width="44" height="18" rx="4" fill="#FFD66B" />
              <line x1="86" y1="88" x2="86" y2="34" stroke="#E2E8F0" strokeWidth="4" />
              <circle cx="86" cy="34" r="6" fill="#79C8E8" />
              {/* S-band beam clearing ridge */}
              <line x1="86" y1="34" x2="470" y2="32" stroke="#9BD8A7" strokeWidth="3" strokeDasharray="6 4" />
              <circle cx="470" cy="32" r="10" fill="#FFD66B" />
              <text x="270" y="102" textAnchor="middle" fill="#F87171" fontSize="11" fontWeight="700">
                Ridge Blocked Low Signals
              </text>
              <text x="280" y="22" textAnchor="middle" fill="#9BD8A7" fontSize="12" fontWeight="700">
                High Mast S-Band Clears Shadow Blackout!
              </text>
            </svg>

            <p className="max-w-lg text-sm font-bold text-slate-200">
              Dark -200°C shadows freeze rover wheels and drain batteries, while an elevated S-band mast restores clear line-of-sight!
            </p>

            <button
              ref={continueBtnRef}
              type="button"
              onKeyDown={(e) => {
                if (e.repeat) e.preventDefault();
              }}
              onClick={() => {
                playCue('confirm');
                onComplete(earnedGrade);
              }}
              className="rounded-xl bg-[#9BD8A7] px-8 py-3 font-display text-xl font-extrabold text-[#0F172A] shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#F8FAFC]"
            >
              CONTINUE →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
