import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Lock, Radar, Shield } from 'lucide-react';
import type { GameState, MiniGameGrade } from '../../types/game';
import { playCue } from '../../services/soundEngine';

interface RadiationMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

type StageId = 'prep' | 'storm';

interface ShutterWindow {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  locked: boolean;
  slideProgress: number; // 0..1
}

interface RadarBlip {
  id: number;
  x: number;
  y: number;
  isFake: boolean;
  cleared: boolean;
}

interface ProtonBurst {
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

interface RadiationSim {
  elapsed: number;
  shutters: ShutterWindow[];
  blips: RadarBlip[];
  radarHint: string;
  stageTransitionTimer: number;
  shieldAngle: number; // -Math.PI * 0.85 .. -Math.PI * 0.15 (-Math.PI/2 = straight up)
  bursts: ProtonBurst[];
  sparks: ShieldSpark[];
  nextBurstAt: number;
  spawnIndex: number;
  blockedCount: number;
  doseMsv: number;
  stormTimer: number;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const DOME_CX = 640;
const DOME_CY = 655;
const SHIELD_ORBIT_R = 238;
const SHIELD_HALF_SPAN = 0.42; // generous ~48 degree shield arc
const MIN_ANGLE = -Math.PI * 0.87;
const MAX_ANGLE = -Math.PI * 0.13;
const TARGET_BLOCKED = 10;
const STORM_DURATION_SEC = 14.5;

const STARS: readonly StarDot[] = Array.from({ length: 68 }, (_, idx) => ({
  x: ((idx * 197 + 31) % (CANVAS_WIDTH - 24)) + 12,
  y: ((idx * 109 + 19) % 520) + 12,
  size: idx % 5 === 0 ? 4 : 2,
  phase: idx * 0.7,
}));

const BURST_ANGLES: readonly number[] = [
  -Math.PI * 0.72,
  -Math.PI * 0.5,
  -Math.PI * 0.28,
  -Math.PI * 0.62,
  -Math.PI * 0.38,
  -Math.PI * 0.78,
  -Math.PI * 0.22,
  -Math.PI * 0.52,
];

function createShutters(): ShutterWindow[] {
  return [
    { id: 1, x: 84, y: 170, w: 146, h: 250, locked: false, slideProgress: 0 },
    { id: 2, x: 252, y: 170, w: 146, h: 250, locked: false, slideProgress: 0 },
    { id: 3, x: 420, y: 170, w: 146, h: 250, locked: false, slideProgress: 0 },
  ];
}

function createRadarBlips(): RadarBlip[] {
  return [
    { id: 1, x: 830, y: 265, isFake: true, cleared: false },
    { id: 2, x: 1050, y: 315, isFake: false, cleared: false },
    { id: 3, x: 960, y: 455, isFake: true, cleared: false },
    { id: 4, x: 870, y: 410, isFake: false, cleared: false },
  ];
}

function createSparkPool(): ShieldSpark[] {
  return Array.from({ length: 72 }, () => ({
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

function spawnSparks(
  pool: ShieldSpark[],
  x: number,
  y: number,
  color: string,
  count: number,
): void {
  let spawned = 0;
  for (const p of pool) {
    if (!p.active) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 90 + Math.random() * 210;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(ang) * spd;
      p.vy = Math.sin(ang) * spd;
      p.maxLife = 0.46;
      p.life = 0.46;
      p.color = color;
      spawned += 1;
      if (spawned >= count) return;
    }
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, pool: ShieldSpark[]): void {
  for (const s of pool) {
    if (!s.active) continue;
    ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
    ctx.fillStyle = s.color;
    ctx.fillRect(Math.round(s.x - 4), Math.round(s.y - 4), 8, 8);
  }
  ctx.globalAlpha = 1;
}

function drawPrepStage(ctx: CanvasRenderingContext2D, sim: RadiationSim): void {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#070D20';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Left Panel: Habitat Glass Windows & Armored Shutters
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(46, 56, 556, 588);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 56, 556, 588);

  const lockedCount = sim.shutters.filter((s) => s.locked).length;
  ctx.fillStyle = lockedCount === 3 ? '#9BD8A7' : '#FFD66B';
  ctx.font = 'bold 26px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    lockedCount === 3
      ? '1. ALL GLASS SHUTTERS LOCKED ✓'
      : `1. CLICK WINDOWS TO LOCK (${lockedCount}/3)`,
    74,
    108,
  );

  ctx.fillStyle = '#CBD5E1';
  ctx.font = 'bold 18px Nunito, sans-serif';
  ctx.fillText('Close heavy water-wall shutters over open habitat glass!', 74, 140);

  for (const sh of sim.shutters) {
    // Open starry sky visible through glass
    ctx.fillStyle = '#050918';
    ctx.fillRect(sh.x, sh.y, sh.w, sh.h);

    // Stars & faint magenta solar ray glints through open window
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(sh.x + 18 + (i * 37) % 108, sh.y + 24 + (i * 53) % 190, 3, 3);
    }
    if (!sh.locked) {
      const pulse = 0.25 + 0.2 * Math.sin(sim.elapsed * 6 + sh.id);
      ctx.fillStyle = `rgba(244, 114, 182, ${pulse.toFixed(2)})`;
      ctx.fillRect(sh.x, sh.y, sh.w, sh.h);
    }

    // Sliding armored shutter panel
    const coverH = Math.round(sh.h * sh.slideProgress);
    if (coverH > 0) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(sh.x, sh.y, sh.w, coverH);
      ctx.fillStyle = '#79C8E8';
      ctx.fillRect(sh.x + 10, sh.y + 12, sh.w - 20, Math.max(0, coverH - 24));
      ctx.fillStyle = '#1E293B';
      for (let slat = 28; slat < coverH - 16; slat += 36) {
        ctx.fillRect(sh.x + 16, sh.y + slat, sh.w - 32, 8);
      }
    }

    ctx.strokeStyle = sh.locked ? '#9BD8A7' : '#FFD66B';
    ctx.lineWidth = 4;
    ctx.strokeRect(sh.x, sh.y, sh.w, sh.h);

    // Status pill at bottom of each window
    ctx.fillStyle = sh.locked ? '#9BD8A7' : '#FFD66B';
    ctx.fillRect(sh.x + 14, sh.y + sh.h + 16, sh.w - 28, 42);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sh.locked ? 'LOCKED ✓' : 'TAP TO LOCK', sh.x + sh.w / 2, sh.y + sh.h + 43);
    ctx.textAlign = 'left';
  }

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 18px Nunito, sans-serif';
  ctx.fillText('Water-filled shutters block solar protons outside the base.', 74, 540);

  // Right Panel: Space Weather Radar Scope
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(638, 56, 596, 588);
  ctx.strokeStyle = '#A995E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(638, 56, 596, 588);

  const fakeLeft = sim.blips.filter((b) => b.isFake && !b.cleared).length;
  ctx.fillStyle = fakeLeft === 0 ? '#9BD8A7' : '#A995E8';
  ctx.font = 'bold 26px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    fakeLeft === 0
      ? '2. SPACE RADAR CLEAN & LOCKED ✓'
      : `2. ZAP FAKE GLITCHES (${2 - fakeLeft}/2)`,
    666,
    108,
  );

  ctx.fillStyle = '#CBD5E1';
  ctx.font = 'bold 18px Nunito, sans-serif';
  ctx.fillText('Click the 2 jittery FAKE NOISE blips — keep REAL CME tracks!', 666, 140);

  // Radar circle scope
  const rcx = 936;
  const rcy = 368;
  const rRad = 186;
  ctx.fillStyle = '#06121E';
  ctx.beginPath();
  ctx.arc(rcx, rcy, rRad, 0, Math.PI * 2);
  ctx.fill();

  for (const ring of [62, 124, 186]) {
    ctx.strokeStyle = 'rgba(121, 200, 232, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rcx, rcy, ring, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(rcx - rRad, rcy);
  ctx.lineTo(rcx + rRad, rcy);
  ctx.moveTo(rcx, rcy - rRad);
  ctx.lineTo(rcx, rcy + rRad);
  ctx.stroke();

  // Spinning radar sweep sector
  const sweepAng = (sim.elapsed * 2.1) % (Math.PI * 2);
  ctx.fillStyle = 'rgba(155, 216, 167, 0.16)';
  ctx.beginPath();
  ctx.moveTo(rcx, rcy);
  ctx.arc(rcx, rcy, rRad, sweepAng - 0.45, sweepAng);
  ctx.closePath();
  ctx.fill();

  // Radar Blips (Fake jittery noise vs Real CME)
  for (const blip of sim.blips) {
    if (blip.cleared) continue;
    const jx = blip.isFake ? Math.sin(sim.elapsed * 32 + blip.id) * 5 : 0;
    const jy = blip.isFake ? Math.cos(sim.elapsed * 27 + blip.id) * 4 : 0;
    const bx = blip.x + jx;
    const by = blip.y + jy;

    if (blip.isFake) {
      ctx.fillStyle = 'rgba(248, 113, 113, 0.3)';
      ctx.beginPath();
      ctx.arc(bx, by, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F87171';
      ctx.beginPath();
      ctx.moveTo(bx, by - 16);
      ctx.lineTo(bx + 18, by + 14);
      ctx.lineTo(bx - 18, by + 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFD66B';
      ctx.font = 'bold 14px Fredoka, Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FAKE NOISE', bx, by + 32);
    } else {
      const pulse = 1 + 0.15 * Math.sin(sim.elapsed * 6 + blip.id);
      ctx.fillStyle = 'rgba(255, 214, 107, 0.25)';
      ctx.beginPath();
      ctx.arc(bx, by, 28 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9BD8A7';
      ctx.beginPath();
      ctx.arc(bx, by, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9BD8A7';
      ctx.font = 'bold 14px Fredoka, Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('REAL CME ✓', bx, by + 30);
    }
    ctx.textAlign = 'left';
  }

  // Radar status / hint line
  ctx.fillStyle = '#FFD66B';
  ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(sim.radarHint, rcx, 608);
  ctx.textAlign = 'left';

  drawParticles(ctx, sim.sparks);
}

function drawStormStage(ctx: CanvasRenderingContext2D, sim: RadiationSim): void {
  ctx.imageSmoothingEnabled = false;

  // Deep solar storm sky
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#120826');
  grad.addColorStop(0.55, '#19143A');
  grad.addColorStop(1, '#1E293B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (const s of STARS) {
    const alpha = 0.45 + 0.45 * Math.sin(sim.elapsed * 2.4 + s.phase);
    ctx.fillStyle = `rgba(248, 250, 252, ${alpha.toFixed(2)})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }

  // Blazing Sun Corona overhead shooting golden-magenta storm waves
  const sunY = -40;
  const corona = ctx.createRadialGradient(DOME_CX, sunY, 30, DOME_CX, sunY, 310);
  corona.addColorStop(0, 'rgba(255, 214, 107, 0.95)');
  corona.addColorStop(0.45, 'rgba(232, 121, 249, 0.35)');
  corona.addColorStop(1, 'rgba(232, 121, 249, 0)');
  ctx.fillStyle = corona;
  ctx.fillRect(DOME_CX - 320, 0, 640, 280);

  // Subtle magenta solar plasma arc lines
  ctx.strokeStyle = 'rgba(232, 121, 249, 0.28)';
  ctx.lineWidth = 3;
  for (let w = 0; w < 3; w++) {
    const rad = 110 + ((sim.elapsed * 90 + w * 95) % 260);
    ctx.beginPath();
    ctx.arc(DOME_CX, 16, rad, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }

  // Lunar surface + Protected Habitat Dome
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 650, CANVAS_WIDTH, 70);

  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(DOME_CX, DOME_CY, 152, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = sim.doseMsv >= 1.2 ? '#F87171' : '#79C8E8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(DOME_CX, DOME_CY, 152, Math.PI, 0);
  ctx.stroke();

  // Locked armored window shutters on the dome
  for (let w = -1; w <= 1; w++) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(DOME_CX + w * 56 - 18, DOME_CY - 82, 36, 26);
    ctx.fillStyle = '#79C8E8';
    ctx.fillRect(DOME_CX + w * 56 - 12, DOME_CY - 76, 24, 14);
  }

  ctx.fillStyle = '#9BD8A7';
  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HABITAT WATER-SHIELD DOME', DOME_CX, 636);
  ctx.textAlign = 'left';

  // Rotating Curved Water-Wall Shield Arc
  const startA = sim.shieldAngle - SHIELD_HALF_SPAN;
  const endA = sim.shieldAngle + SHIELD_HALF_SPAN;

  ctx.strokeStyle = 'rgba(121, 200, 232, 0.3)';
  ctx.lineWidth = 34;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(DOME_CX, DOME_CY, SHIELD_ORBIT_R, startA, endA);
  ctx.stroke();

  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(DOME_CX, DOME_CY, SHIELD_ORBIT_R, startA, endA);
  ctx.stroke();

  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(DOME_CX, DOME_CY, SHIELD_ORBIT_R - 4, startA + 0.05, endA - 0.05);
  ctx.stroke();
  ctx.lineCap = 'butt';

  // High-speed golden-magenta Solar Proton Bursts
  for (const b of sim.bursts) {
    if (b.done) continue;
    // Speed tail streak
    ctx.strokeStyle = b.bounced ? 'rgba(155, 216, 167, 0.7)' : 'rgba(232, 121, 249, 0.65)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - b.vx * 0.09, b.y - b.vy * 0.09);
    ctx.stroke();

    ctx.fillStyle = b.bounced ? 'rgba(155, 216, 167, 0.38)' : 'rgba(232, 121, 249, 0.38)';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = b.bounced ? '#9BD8A7' : '#E879F9';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = b.bounced ? '#F8FAFC' : '#FFD66B';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius * 0.52, 0, Math.PI * 2);
    ctx.fill();
  }

  drawParticles(ctx, sim.sparks);

  // Top-Left: Blocked Bursts & Remaining Storm Time
  const timeLeft = Math.max(0, Math.ceil(STORM_DURATION_SEC - sim.stormTimer));
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(24, 20, 316, 74);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(24, 20, 316, 74);
  ctx.fillStyle = '#9BD8A7';
  ctx.font = 'bold 22px Fredoka, Nunito, sans-serif';
  ctx.fillText(`DEFLECTED: ${Math.min(TARGET_BLOCKED, sim.blockedCount)} / ${TARGET_BLOCKED}`, 42, 50);
  ctx.fillStyle = '#FFD66B';
  ctx.font = 'bold 18px Nunito, sans-serif';
  ctx.fillText(`X-CLASS PROTON WAVE: ${timeLeft}s`, 42, 78);

  // Top-Right: Interior Habitat Dose (mSv) Meter
  const doseSafe = sim.doseMsv < 1.0;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(926, 20, 330, 82);
  ctx.strokeStyle = doseSafe ? '#9BD8A7' : '#F87171';
  ctx.lineWidth = 3;
  ctx.strokeRect(926, 20, 330, 82);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
  ctx.fillText(`HABITAT DOSE: ${sim.doseMsv.toFixed(2)} mSv`, 946, 48);

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(946, 62, 290, 22);
  const dosePct = Math.min(1, sim.doseMsv / 2.0);
  ctx.fillStyle = doseSafe ? '#9BD8A7' : '#F87171';
  ctx.fillRect(946, 62, Math.round(290 * dosePct), 22);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.strokeRect(946, 62, 290, 22);
}

export const RadiationMiniGame: React.FC<RadiationMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [stage, setStage] = useState<StageId>('prep');
  const [prepUi, setPrepUi] = useState<{ shutters: number; fakeLeft: number }>({
    shutters: 0,
    fakeLeft: 2,
  });
  const [blockedUi, setBlockedUi] = useState<number>(0);
  const [won, setWon] = useState<boolean>(false);
  const [earnedGrade, setEarnedGrade] = useState<MiniGameGrade>('gold');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<StageId>('prep');
  const wonRef = useRef<boolean>(false);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  const simRef = useRef<RadiationSim>({
    elapsed: 0,
    shutters: createShutters(),
    blips: createRadarBlips(),
    radarHint: 'Filter out the 2 red FAKE NOISE triangles!',
    stageTransitionTimer: 0,
    shieldAngle: -Math.PI / 2,
    bursts: [],
    sparks: createSparkPool(),
    nextBurstAt: 0.4,
    spawnIndex: 0,
    blockedCount: 0,
    doseMsv: 0.18,
    stormTimer: 0,
  });

  useEffect(() => {
    if (won) {
      continueBtnRef.current?.focus();
    }
  }, [won]);

  const checkPrepComplete = useCallback(() => {
    const sim = simRef.current;
    const lockedCount = sim.shutters.filter((s) => s.locked).length;
    const fakeLeft = sim.blips.filter((b) => b.isFake && !b.cleared).length;
    setPrepUi({ shutters: lockedCount, fakeLeft });
    if (lockedCount === 3 && fakeLeft === 0 && sim.stageTransitionTimer <= 0) {
      sim.radarHint = 'TRACK LOCKED! INCOMING X8.7 STORM!';
      sim.stageTransitionTimer = 0.95;
      playCue('solar_flare');
    }
  }, []);

  const lockNextShutter = useCallback(() => {
    const sim = simRef.current;
    const next = sim.shutters.find((s) => !s.locked);
    if (!next) return;
    next.locked = true;
    playCue('shutter_lock');
    spawnSparks(sim.sparks, next.x + next.w / 2, next.y + next.h / 2, '#79C8E8', 12);
    checkPrepComplete();
  }, [checkPrepComplete]);

  const filterNextFake = useCallback(() => {
    const sim = simRef.current;
    const fake = sim.blips.find((b) => b.isFake && !b.cleared);
    if (!fake) return;
    fake.cleared = true;
    playCue('static_burst');
    spawnSparks(sim.sparks, fake.x, fake.y, '#9BD8A7', 14);
    sim.radarHint = 'Fake radar glitch muted!';
    checkPrepComplete();
  }, [checkPrepComplete]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
        return;
      }
      if (wonRef.current) return;

      if (stageRef.current === 'prep') {
        if (e.code === 'Space' && !e.repeat) {
          e.preventDefault();
          const hasOpenShutter = simRef.current.shutters.some((s) => !s.locked);
          if (hasOpenShutter) lockNextShutter();
          else filterNextFake();
        }
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
  }, [filterNextFake, lockNextShutter, onClose]);

  // 60fps Loop
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;

      const sim = simRef.current;
      sim.elapsed += dt;

      if (!wonRef.current) {
        if (stageRef.current === 'prep') {
          for (const sh of sim.shutters) {
            if (sh.locked && sh.slideProgress < 1) {
              sh.slideProgress = Math.min(1, sh.slideProgress + dt * 3.8);
            }
          }
          if (sim.stageTransitionTimer > 0) {
            sim.stageTransitionTimer -= dt;
            if (sim.stageTransitionTimer <= 0) {
              stageRef.current = 'storm';
              setStage('storm');
              playCue('alarm_cme');
            }
          }
        } else {
          sim.stormTimer += dt;
          if (keysRef.current.left) {
            sim.shieldAngle -= 2.15 * dt;
          }
          if (keysRef.current.right) {
            sim.shieldAngle += 2.15 * dt;
          }
          sim.shieldAngle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, sim.shieldAngle));

          if (sim.stormTimer >= sim.nextBurstAt) {
            const ang = BURST_ANGLES[sim.spawnIndex % BURST_ANGLES.length] ?? -Math.PI / 2;
            const spawnR = 680;
            const sx = DOME_CX + Math.cos(ang) * spawnR;
            const sy = Math.max(-24, DOME_CY + Math.sin(ang) * spawnR);
            const speed = 265 + (sim.spawnIndex % 3) * 35;
            const dirX = DOME_CX - sx;
            const dirY = DOME_CY - sy;
            const len = Math.hypot(dirX, dirY) || 1;
            sim.bursts.push({
              id: sim.spawnIndex + 1,
              x: sx,
              y: sy,
              vx: (dirX / len) * speed,
              vy: (dirY / len) * speed,
              radius: 20,
              bounced: false,
              done: false,
            });
            sim.spawnIndex += 1;
            sim.nextBurstAt = sim.stormTimer + 1.15;
          }

          for (const b of sim.bursts) {
            if (b.done) continue;
            b.x += b.vx * dt;
            b.y += b.vy * dt;

            const dx = b.x - DOME_CX;
            const dy = b.y - DOME_CY;
            const dist = Math.hypot(dx, dy);

            if (!b.bounced && dist <= SHIELD_ORBIT_R + 22 && dist >= SHIELD_ORBIT_R - 26) {
              const burstAngle = Math.atan2(dy, dx);
              const diff = Math.abs(burstAngle - sim.shieldAngle);
              if (diff <= SHIELD_HALF_SPAN + 0.08) {
                b.bounced = true;
                const nx = dx / (dist || 1);
                const ny = dy / (dist || 1);
                b.vx = nx * 420;
                b.vy = ny * 420;
                sim.blockedCount += 1;
                sim.doseMsv = Math.max(0.15, sim.doseMsv - 0.04);
                setBlockedUi(sim.blockedCount);
                playCue('water_flow');
                spawnSparks(sim.sparks, b.x, b.y, '#9BD8A7', 16);
              }
            }

            if (!b.bounced && dist <= 148) {
              b.done = true;
              sim.doseMsv = Math.min(1.85, sim.doseMsv + 0.16);
              playCue('alert');
              spawnSparks(sim.sparks, b.x, b.y, '#F87171', 12);
            }

            if (b.y < -80 || b.x < -80 || b.x > CANVAS_WIDTH + 80 || b.y > CANVAS_HEIGHT + 40) {
              b.done = true;
            }
          }

          if (sim.blockedCount >= TARGET_BLOCKED || sim.stormTimer >= STORM_DURATION_SEC) {
            wonRef.current = true;
            const grade: MiniGameGrade = sim.doseMsv < 0.9 ? 'gold' : 'silver';
            setEarnedGrade(grade);
            playCue('success');
            setWon(true);
          }
        }
      }

      for (const s of sim.sparks) {
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
          if (stageRef.current === 'prep') {
            drawPrepStage(ctx, sim);
          } else {
            drawStormStage(ctx, sim);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (wonRef.current || stageRef.current !== 'storm') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const py = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    const ang = Math.atan2(Math.min(-25, py - DOME_CY), px - DOME_CX);
    simRef.current.shieldAngle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, ang));
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (wonRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const py = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    if (stageRef.current === 'storm') {
      const ang = Math.atan2(Math.min(-25, py - DOME_CY), px - DOME_CX);
      simRef.current.shieldAngle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, ang));
      return;
    }

    const sim = simRef.current;
    for (const sh of sim.shutters) {
      if (!sh.locked && px >= sh.x && px <= sh.x + sh.w && py >= sh.y && py <= sh.y + sh.h + 64) {
        sh.locked = true;
        playCue('shutter_lock');
        spawnSparks(sim.sparks, sh.x + sh.w / 2, sh.y + sh.h / 2, '#79C8E8', 12);
        checkPrepComplete();
        return;
      }
    }

    for (const blip of sim.blips) {
      if (!blip.cleared && Math.hypot(px - blip.x, py - blip.y) <= 52) {
        if (blip.isFake) {
          blip.cleared = true;
          playCue('static_burst');
          spawnSparks(sim.sparks, blip.x, blip.y, '#9BD8A7', 14);
          sim.radarHint = 'Fake satellite glitch muted!';
          checkPrepComplete();
        } else {
          playCue('radar_ping');
          sim.radarHint = 'Keep REAL CME! Zap the red FAKE NOISE!';
        }
        return;
      }
    }
  };

  return (
    <div
      className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col gap-2.5 bg-[#0F172A] border-2 border-[#79C8E8]/55 rounded-2xl p-3 sm:p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Solar Storm Radiation Shield"
    >
      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#79C8E8] p-1.5 text-[#0F172A]">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="font-display text-base font-bold text-[#F8FAFC] sm:text-lg">
              Solar Storm Shield
            </h2>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#1E293B] px-2.5 py-1 text-xs font-extrabold">
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'prep'
                  ? 'bg-[#FFD66B] text-[#0F172A]'
                  : 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
              }`}
            >
              {stage === 'prep' ? '1: Shutters & Radar' : '1: Secured ✓'}
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'storm' && !won
                  ? 'bg-[#E879F9] text-[#0F172A]'
                  : won
                    ? 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
                    : 'text-slate-400'
              }`}
            >
              2: X-Class Proton Storm
            </span>
          </div>

          <span className="font-display text-sm font-extrabold text-[#79C8E8] sm:text-base">
            {stage === 'prep'
              ? 'Lock all 3 glass shutters & zap the 2 fake radar glitches!'
              : 'Rotate the Water-Wall shield arc to deflect solar protons!'}
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
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-[#79C8E8]/35 bg-[#070D20]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerMove={handleCanvasPointerMove}
          onPointerDown={handleCanvasPointerDown}
          className="pixelated aspect-video max-h-full max-w-full block cursor-pointer touch-none"
        />
      </div>

      {/* Bottom Controls */}
      {stage === 'prep' ? (
        <div className="grid shrink-0 grid-cols-2 gap-3">
          <button
            type="button"
            onClick={lockNextShutter}
            disabled={prepUi.shutters >= 3}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 font-display text-base font-extrabold transition-colors ${
              prepUi.shutters >= 3
                ? 'border-[#9BD8A7] bg-[#9BD8A7]/20 text-[#9BD8A7]'
                : 'border-[#FFD66B] bg-[#FFD66B] text-[#0F172A] hover:brightness-95'
            }`}
          >
            <Lock className="h-5 w-5" />
            {prepUi.shutters >= 3 ? 'SHUTTERS LOCKED (3/3) ✓' : `LOCK SHUTTER (${prepUi.shutters}/3)`}
          </button>

          <button
            type="button"
            onClick={filterNextFake}
            disabled={prepUi.fakeLeft === 0}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 font-display text-base font-extrabold transition-colors ${
              prepUi.fakeLeft === 0
                ? 'border-[#9BD8A7] bg-[#9BD8A7]/20 text-[#9BD8A7]'
                : 'border-[#A995E8] bg-[#A995E8] text-[#0F172A] hover:brightness-95'
            }`}
          >
            <Radar className="h-5 w-5" />
            {prepUi.fakeLeft === 0 ? 'RADAR CLEAN ✓' : `ZAP FAKE ALARM (${2 - prepUi.fakeLeft}/2)`}
          </button>
        </div>
      ) : (
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
            className="flex flex-1 touch-none select-none items-center justify-center gap-2 rounded-xl border-2 border-[#79C8E8] bg-[#1E293B] py-2.5 font-display text-base font-extrabold text-[#79C8E8] hover:bg-[#79C8E8]/20 focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
          >
            <ArrowLeft className="h-5 w-5" />
            ROTATE LEFT
          </button>

          <div className="rounded-xl bg-[#1E293B] px-5 py-2.5 font-display text-base font-extrabold text-[#9BD8A7]">
            Deflected: {Math.min(TARGET_BLOCKED, blockedUi)} / {TARGET_BLOCKED}
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
            className="flex flex-1 touch-none select-none items-center justify-center gap-2 rounded-xl border-2 border-[#79C8E8] bg-[#1E293B] py-2.5 font-display text-base font-extrabold text-[#79C8E8] hover:bg-[#79C8E8]/20 focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
          >
            ROTATE RIGHT
            <ArrowRight className="h-5 w-5" />
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
                {earnedGrade.toUpperCase()} · SAFE DOSE (mSv)
              </span>
            </div>

            <h3 className="font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
              SOLAR PROTON STORM DEFLECTED!
            </h3>

            {/* ADR-0004 Visual Proof: Satellite Observation vs Internal Habitat Dose */}
            <svg
              viewBox="0 0 560 132"
              className="w-full max-w-lg rounded-xl border border-[#79C8E8]/35 bg-[#0F172A]"
              aria-hidden="true"
            >
              <circle cx="72" cy="46" r="22" fill="#E879F9" fillOpacity="0.35" stroke="#FFD66B" strokeWidth="2" />
              <path d="M98 46 L180 54" stroke="#E879F9" strokeWidth="3" strokeDasharray="6 4" />
              <text x="86" y="106" textAnchor="middle" fill="#E879F9" fontSize="12" fontWeight="700">
                Outside: X-Class Storm
              </text>

              <path d="M225 22 Q256 66 225 110" stroke="#38BDF8" strokeWidth="10" fill="none" strokeLinecap="round" />
              <text x="235" y="122" textAnchor="middle" fill="#79C8E8" fontSize="11" fontWeight="700">
                Water Wall
              </text>

              <rect x="295" y="34" width="230" height="66" rx="10" fill="#1E293B" stroke="#9BD8A7" strokeWidth="2" />
              <text x="410" y="62" textAnchor="middle" fill="#9BD8A7" fontSize="15" fontWeight="700">
                Inside Base: Low mSv ✓
              </text>
              <text x="410" y="84" textAnchor="middle" fill="#CBD5E1" fontSize="12" fontWeight="700">
                External Flare != Habitat Dose
              </text>
            </svg>

            <p className="max-w-lg text-sm font-bold text-slate-200">
              Space satellites spot X-class storms outside, while locked shutters and water walls keep indoor radiation (mSv) low!
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
