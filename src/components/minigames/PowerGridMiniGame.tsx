import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Brush, Cpu, Flame, Radio, Zap } from 'lucide-react';
import type { GameState, MiniGameGrade } from '../../types/game';
import { playCue } from '../../services/soundEngine';

interface PowerGridMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

type StageId = 'dust' | 'breaker';

interface DustClump {
  id: number;
  x: number;
  y: number;
  r: number;
  wing: number;
  cleared: boolean;
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
  size: number;
}

interface PowerSim {
  elapsed: number;
  dust: DustClump[];
  stageTransitionTimer: number;
  heatersOn: boolean;
  scienceOn: boolean;
  roverOn: boolean;
  tempProgress: number; // 0..100 (-35C -> +20C)
  scienceProgress: number; // 0..100
  roverProgress: number; // 0..100
  overloadHeat: number; // 0..2.2s
  trips: number;
  particles: SparkParticle[];
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const MAX_KW = 100;
const HEATERS_KW = 45;
const SCIENCE_KW = 40;
const ROVER_KW = 35;
const OVERLOAD_TRIP_SEC = 2.2;

function createDustClumps(): DustClump[] {
  const clumps: DustClump[] = [];
  const wingStarts: readonly number[] = [150, 505, 860];
  let id = 1;
  for (let w = 0; w < wingStarts.length; w++) {
    const sx = wingStarts[w] ?? 150;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        clumps.push({
          id,
          x: sx + 72 + col * 126 + (row % 2) * 14,
          y: 270 + row * 124,
          r: 44,
          wing: w,
          cleared: false,
        });
        id += 1;
      }
    }
  }
  return clumps;
}

function createParticlePool(): SparkParticle[] {
  return Array.from({ length: 84 }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0.5,
    color: '#FFD66B',
    size: 6,
  }));
}

function spawnParticles(
  pool: SparkParticle[],
  x: number,
  y: number,
  color: string,
  count: number,
): void {
  let spawned = 0;
  for (const p of pool) {
    if (!p.active) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 70 + Math.random() * 190;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd;
      p.maxLife = 0.45;
      p.life = 0.45;
      p.color = color;
      p.size = 6;
      spawned += 1;
      if (spawned >= count) return;
    }
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, pool: SparkParticle[]): void {
  for (const p of pool) {
    if (!p.active) continue;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawDustStage(ctx: CanvasRenderingContext2D, sim: PowerSim): void {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#080F24';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Sunbeams from upper-left
  const sunGlow = ctx.createRadialGradient(90, 80, 10, 90, 80, 180);
  sunGlow.addColorStop(0, 'rgba(255, 214, 107, 0.75)');
  sunGlow.addColorStop(1, 'rgba(255, 214, 107, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, 420, 360);

  ctx.beginPath();
  ctx.arc(88, 78, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD66B';
  ctx.fill();

  const clearedCount = sim.dust.filter((d) => d.cleared).length;
  const kwOut = Math.round(28 + (clearedCount / sim.dust.length) * 72);

  // Animated photon rays hitting solar wings
  for (let i = 0; i < 6; i++) {
    const rayProgress = (sim.elapsed * 0.65 + i * 0.18) % 1;
    const rx = 140 + rayProgress * (210 + i * 165);
    const ry = 95 + rayProgress * 195;
    ctx.fillStyle = 'rgba(255, 214, 107, 0.7)';
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lunar Regolith Horizon
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 560, CANVAS_WIDTH, 160);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 610, CANVAS_WIDTH, 110);

  // Power conduit cable running underneath solar wings
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(140, 520, 1000, 26);
  ctx.fillStyle = kwOut >= 99 ? '#9BD8A7' : '#FFD66B';
  ctx.fillRect(140, 528, Math.round(1000 * (kwOut / 100)), 10);

  // 3 Solar Panel Wings
  const wingStarts: readonly number[] = [150, 505, 860];
  for (let w = 0; w < wingStarts.length; w++) {
    const wx = wingStarts[w] ?? 150;
    // Support strut
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(wx + 125, 476, 26, 84);

    // Solar Wing Frame
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(wx, 200, 276, 278);
    ctx.strokeStyle = '#79C8E8';
    ctx.lineWidth = 4;
    ctx.strokeRect(wx, 200, 276, 278);

    // Photovoltaic Grid Cells
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = '#1D4ED8';
        ctx.fillRect(wx + 14 + c * 64, 214 + r * 64, 56, 56);
        ctx.fillStyle = 'rgba(121, 200, 232, 0.28)';
        ctx.fillRect(wx + 16 + c * 64, 216 + r * 64, 52, 8);
      }
    }
  }

  // Sticky Electrostatic Orange Lunar Dust Clumps
  for (const clump of sim.dust) {
    if (clump.cleared) continue;
    const jitter = Math.sin(sim.elapsed * 14 + clump.id) * 2;
    ctx.fillStyle = 'rgba(234, 88, 12, 0.88)';
    ctx.beginPath();
    ctx.arc(clump.x + jitter, clump.y, clump.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    ctx.arc(clump.x - 10 + jitter, clump.y - 8, clump.r * 0.58, 0, Math.PI * 2);
    ctx.fill();

    // Static charge sparks (+/-)
    ctx.fillStyle = '#FFD66B';
    ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(Math.sin(sim.elapsed * 8 + clump.id) > 0 ? '⚡ STATIC' : 'DUST', clump.x, clump.y + 6);
    ctx.textAlign = 'left';
  }

  drawParticles(ctx, sim.particles);

  // Top-Right Live Solar kW Output Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(830, 22, 418, 66);
  ctx.strokeStyle = kwOut >= 100 ? '#9BD8A7' : '#FFD66B';
  ctx.lineWidth = 3;
  ctx.strokeRect(830, 22, 418, 66);
  ctx.fillStyle = kwOut >= 100 ? '#9BD8A7' : '#FFD66B';
  ctx.font = 'bold 26px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    kwOut >= 100 ? 'SOLAR OUTPUT: 100 kW ✓' : `SOLAR OUTPUT: ${kwOut} / 100 kW`,
    856,
    64,
  );
}

function drawBreakerStage(ctx: CanvasRenderingContext2D, sim: PowerSim): void {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#090F22';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const loadKw =
    (sim.heatersOn ? HEATERS_KW : 0) +
    (sim.scienceOn ? SCIENCE_KW : 0) +
    (sim.roverOn ? ROVER_KW : 0);
  const overloaded = loadKw > MAX_KW;

  // Main Power Bus Header Gauge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(60, 24, 1160, 108);
  ctx.strokeStyle = overloaded ? '#F87171' : '#79C8E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 24, 1160, 108);

  ctx.fillStyle = overloaded ? '#F87171' : '#FFD66B';
  ctx.font = 'bold 24px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    overloaded
      ? `BREAKER OVERLOAD! ${loadKw} kW > ${MAX_KW} kW LIMIT — TURN ONE SWITCH OFF!`
      : `MAIN BUS BREAKER LOAD: ${loadKw} kW / ${MAX_KW} kW SAFE LIMIT`,
    90,
    60,
  );

  // Breaker Load Bar
  const barX = 90;
  const barY = 78;
  const barW = 1100;
  const barH = 34;
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(barX, barY, barW, barH);
  const safeEnd = Math.round((MAX_KW / 125) * barW);
  const fillW = Math.round((Math.min(125, loadKw) / 125) * barW);
  ctx.fillStyle = overloaded ? '#F87171' : loadKw >= 75 ? '#FFD66B' : '#9BD8A7';
  ctx.fillRect(barX, barY, fillW, barH);

  // 100 kW Trip Marker Line
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(barX + safeEnd - 3, barY - 6, 6, barH + 12);

  // Overload sparks along top bus if > 100 kW
  if (overloaded) {
    ctx.strokeStyle = Math.sin(sim.elapsed * 30) > 0 ? '#FFD66B' : '#F87171';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(180, 148);
    for (let sx = 240; sx <= 1100; sx += 80) {
      ctx.lineTo(sx, 148 + (Math.random() - 0.5) * 26);
    }
    ctx.stroke();

    // Countdown trip warning bar
    const tripRatio = Math.min(1, sim.overloadHeat / OVERLOAD_TRIP_SEC);
    ctx.fillStyle = '#F87171';
    ctx.fillRect(90, 138, Math.round(1100 * tripRatio), 8);
  }

  // 3 Interactive Subsystem Panels
  const modules: readonly {
    id: 'heaters' | 'science' | 'rover';
    title: string;
    kw: number;
    on: boolean;
    progress: number;
    x: number;
    accent: string;
    metricText: string;
  }[] = [
    {
      id: 'heaters',
      title: 'HABITAT HEATERS',
      kw: HEATERS_KW,
      on: sim.heatersOn,
      progress: sim.tempProgress,
      x: 72,
      accent: '#FB923C',
      metricText: `TEMP: ${Math.round(-35 + (sim.tempProgress / 100) * 55)}°C / +20°C`,
    },
    {
      id: 'science',
      title: 'SPECTROMETERS',
      kw: SCIENCE_KW,
      on: sim.scienceOn,
      progress: sim.scienceProgress,
      x: 458,
      accent: '#A995E8',
      metricText: `ROCK SCAN: ${Math.round(sim.scienceProgress)}%`,
    },
    {
      id: 'rover',
      title: 'ROVER CHARGER',
      kw: ROVER_KW,
      on: sim.roverOn,
      progress: sim.roverProgress,
      x: 844,
      accent: '#9BD8A7',
      metricText: `BATTERY: ${Math.round(sim.roverProgress)}%`,
    },
  ];

  for (const mod of modules) {
    const done = mod.progress >= 100;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(mod.x, 178, 364, 498);
    ctx.strokeStyle = done ? '#9BD8A7' : mod.on ? mod.accent : '#475569';
    ctx.lineWidth = done || mod.on ? 4 : 2.5;
    ctx.strokeRect(mod.x, 178, 364, 498);

    // Module title & kW badge
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 24px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mod.title, mod.x + 182, 220);

    ctx.fillStyle = mod.on ? mod.accent : '#334155';
    ctx.fillRect(mod.x + 114, 236, 136, 36);
    ctx.fillStyle = mod.on ? '#0F172A' : '#CBD5E1';
    ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
    ctx.fillText(`${mod.kw} kW · ${mod.on ? 'ON' : 'OFF'}`, mod.x + 182, 261);

    // Visual animated machine inside panel
    const cx = mod.x + 182;
    const cy = 384;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(mod.x + 36, 290, 292, 190);

    if (mod.id === 'heaters') {
      // Cryo frost crystals that melt away as tempProgress increases
      const frostAlpha = Math.max(0, 1 - mod.progress / 100);
      if (frostAlpha > 0.05) {
        ctx.fillStyle = `rgba(121, 200, 232, ${(frostAlpha * 0.45).toFixed(2)})`;
        ctx.fillRect(mod.x + 42, 296, 280, 178);
      }
      // Heating coils
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = mod.on ? '#FB923C' : '#475569';
        ctx.fillRect(cx - 88 + c * 48, cy - 42, 28, 84);
      }
      if (mod.on) {
        const pulse = Math.sin(sim.elapsed * 8) * 6;
        ctx.strokeStyle = '#FFD66B';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - 102 - pulse * 0.4, cy - 52, 204 + pulse * 0.8, 104);
      }
    } else if (mod.id === 'science') {
      // Lunar rock crystal + purple laser scanner
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy + 56);
      ctx.lineTo(cx - 26, cy - 10);
      ctx.lineTo(cx + 12, cy - 26);
      ctx.lineTo(cx + 52, cy + 56);
      ctx.closePath();
      ctx.fill();
      if (mod.on) {
        const beamX = cx + Math.sin(sim.elapsed * 5) * 44;
        ctx.strokeStyle = '#E879F9';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 76);
        ctx.lineTo(beamX, cy + 20);
        ctx.stroke();
      }
    } else {
      // Rover battery cells filling up
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 4;
      ctx.strokeRect(cx - 70, cy - 42, 140, 84);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(cx + 70, cy - 18, 14, 36);
      const bars = Math.ceil((mod.progress / 100) * 4);
      for (let b = 0; b < 4; b++) {
        ctx.fillStyle = b < bars ? '#9BD8A7' : '#1E293B';
        ctx.fillRect(cx - 58 + b * 31, cy - 30, 24, 60);
      }
    }

    // Progress bar + metric label
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(mod.x + 36, 502, 292, 28);
    ctx.fillStyle = done ? '#9BD8A7' : mod.accent;
    ctx.fillRect(mod.x + 36, 502, Math.round(292 * (mod.progress / 100)), 28);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(mod.x + 36, 502, 292, 28);

    ctx.fillStyle = done ? '#9BD8A7' : '#F8FAFC';
    ctx.font = 'bold 20px Nunito, sans-serif';
    ctx.fillText(done ? 'COMPLETE ✓' : mod.metricText, cx, 562);

    // Big clickable toggle pill inside canvas
    ctx.fillStyle = done ? '#9BD8A7' : mod.on ? '#FFD66B' : '#334155';
    ctx.fillRect(mod.x + 56, 588, 252, 60);
    ctx.fillStyle = done || mod.on ? '#0F172A' : '#F8FAFC';
    ctx.font = 'bold 22px Fredoka, Nunito, sans-serif';
    ctx.fillText(done ? 'POWERED ✓' : mod.on ? 'TURN OFF' : 'TURN ON', cx, 626);
    ctx.textAlign = 'left';
  }

  drawParticles(ctx, sim.particles);
}

export const PowerGridMiniGame: React.FC<PowerGridMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [stage, setStage] = useState<StageId>('dust');
  const [dustLeftUi, setDustLeftUi] = useState<number>(12);
  const [switchesUi, setSwitchesUi] = useState<{
    heaters: boolean;
    science: boolean;
    rover: boolean;
    loadKw: number;
  }>({ heaters: true, science: false, rover: false, loadKw: HEATERS_KW });
  const [won, setWon] = useState<boolean>(false);
  const [earnedGrade, setEarnedGrade] = useState<MiniGameGrade>('gold');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<StageId>('dust');
  const wonRef = useRef<boolean>(false);
  const lastSweepSfxRef = useRef<number>(0);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  const simRef = useRef<PowerSim>({
    elapsed: 0,
    dust: createDustClumps(),
    stageTransitionTimer: 0,
    heatersOn: true,
    scienceOn: false,
    roverOn: false,
    tempProgress: 10,
    scienceProgress: 0,
    roverProgress: 0,
    overloadHeat: 0,
    trips: 0,
    particles: createParticlePool(),
  });

  useEffect(() => {
    if (won) {
      continueBtnRef.current?.focus();
    }
  }, [won]);

  const syncSwitchState = useCallback(() => {
    const sim = simRef.current;
    const loadKw =
      (sim.heatersOn ? HEATERS_KW : 0) +
      (sim.scienceOn ? SCIENCE_KW : 0) +
      (sim.roverOn ? ROVER_KW : 0);
    setSwitchesUi({
      heaters: sim.heatersOn,
      science: sim.scienceOn,
      rover: sim.roverOn,
      loadKw,
    });
  }, []);

  const sweepDustAt = useCallback((px: number, py: number) => {
    const sim = simRef.current;
    let swept = false;
    for (const d of sim.dust) {
      if (!d.cleared && Math.hypot(px - d.x, py - d.y) <= 72) {
        d.cleared = true;
        swept = true;
        spawnParticles(sim.particles, d.x, d.y, '#FB923C', 12);
      }
    }
    if (swept) {
      const now = performance.now();
      if (now - lastSweepSfxRef.current > 130) {
        playCue('dust_sweep');
        lastSweepSfxRef.current = now;
      }
      const left = sim.dust.filter((d) => !d.cleared).length;
      setDustLeftUi(left);
      if (left === 0) {
        playCue('confirm');
        sim.stageTransitionTimer = 0.85;
      }
    }
  }, []);

  const sweepNextDustBatch = useCallback(() => {
    const sim = simRef.current;
    let count = 0;
    for (const d of sim.dust) {
      if (!d.cleared) {
        d.cleared = true;
        spawnParticles(sim.particles, d.x, d.y, '#FB923C', 12);
        count += 1;
        if (count >= 2) break;
      }
    }
    if (count > 0) {
      playCue('dust_sweep');
      const left = sim.dust.filter((d) => !d.cleared).length;
      setDustLeftUi(left);
      if (left === 0) {
        playCue('confirm');
        sim.stageTransitionTimer = 0.85;
      }
    }
  }, []);

  const toggleSubsystem = useCallback(
    (which: 'heaters' | 'science' | 'rover') => {
      if (wonRef.current || stageRef.current !== 'breaker') return;
      const sim = simRef.current;
      if (which === 'heaters') sim.heatersOn = !sim.heatersOn;
      else if (which === 'science') sim.scienceOn = !sim.scienceOn;
      else sim.roverOn = !sim.roverOn;

      const loadKw =
        (sim.heatersOn ? HEATERS_KW : 0) +
        (sim.scienceOn ? SCIENCE_KW : 0) +
        (sim.roverOn ? ROVER_KW : 0);
      playCue(loadKw > MAX_KW ? 'alert' : 'click');
      syncSwitchState();
    },
    [syncSwitchState],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
        return;
      }
      if (wonRef.current) return;
      if (stageRef.current === 'dust' && e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        sweepNextDustBatch();
      } else if (stageRef.current === 'breaker') {
        if (e.key === '1') toggleSubsystem('heaters');
        else if (e.key === '2') toggleSubsystem('science');
        else if (e.key === '3') toggleSubsystem('rover');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, sweepNextDustBatch, toggleSubsystem]);

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
        if (stageRef.current === 'dust') {
          if (sim.dust.every((d) => d.cleared)) {
            sim.stageTransitionTimer -= dt;
            if (sim.stageTransitionTimer <= 0) {
              stageRef.current = 'breaker';
              setStage('breaker');
              syncSwitchState();
              playCue('meter_up');
            }
          }
        } else {
          const loadKw =
            (sim.heatersOn ? HEATERS_KW : 0) +
            (sim.scienceOn ? SCIENCE_KW : 0) +
            (sim.roverOn ? ROVER_KW : 0);

          if (loadKw > MAX_KW) {
            sim.overloadHeat += dt;
            if (Math.random() < 0.35) {
              spawnParticles(sim.particles, 240 + Math.random() * 800, 150, '#FFD66B', 3);
            }
            if (sim.overloadHeat >= OVERLOAD_TRIP_SEC) {
              sim.overloadHeat = 0;
              sim.trips += 1;
              sim.roverOn = false;
              sim.scienceOn = false;
              playCue('power_overload');
              spawnParticles(sim.particles, 640, 150, '#F87171', 26);
              syncSwitchState();
            }
          } else {
            sim.overloadHeat = Math.max(0, sim.overloadHeat - dt * 1.6);
            if (sim.heatersOn) {
              sim.tempProgress = Math.min(100, sim.tempProgress + 16.5 * dt);
            }
            if (sim.scienceOn) {
              sim.scienceProgress = Math.min(100, sim.scienceProgress + 18 * dt);
            }
            if (sim.roverOn) {
              sim.roverProgress = Math.min(100, sim.roverProgress + 18 * dt);
            }

            // Auto-flip completed loads nicely so kids notice they freed capacity
            if (sim.heatersOn && sim.tempProgress >= 100 && (sim.scienceProgress < 100 || sim.roverProgress < 100)) {
              sim.heatersOn = false;
              playCue('meter_up');
              syncSwitchState();
            }
            if (sim.scienceOn && sim.scienceProgress >= 100 && (sim.tempProgress < 100 || sim.roverProgress < 100)) {
              sim.scienceOn = false;
              playCue('meter_up');
              syncSwitchState();
            }
            if (sim.roverOn && sim.roverProgress >= 100 && (sim.tempProgress < 100 || sim.scienceProgress < 100)) {
              sim.roverOn = false;
              playCue('meter_up');
              syncSwitchState();
            }

            if (
              sim.tempProgress >= 100 &&
              sim.scienceProgress >= 100 &&
              sim.roverProgress >= 100
            ) {
              wonRef.current = true;
              const grade: MiniGameGrade = sim.trips <= 1 ? 'gold' : 'silver';
              setEarnedGrade(grade);
              playCue('success');
              setWon(true);
            }
          }
        }
      }

      for (const p of sim.particles) {
        if (!p.active) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) p.active = false;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (stageRef.current === 'dust') {
            drawDustStage(ctx, sim);
          } else {
            drawBreakerStage(ctx, sim);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [syncSwitchState]);

  const handleCanvasPointer = (clientX: number, clientY: number, isClick: boolean) => {
    if (wonRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const py = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    if (stageRef.current === 'dust') {
      sweepDustAt(px, py);
    } else if (isClick) {
      if (px >= 72 && px <= 436 && py >= 178 && py <= 676) toggleSubsystem('heaters');
      else if (px >= 458 && px <= 822 && py >= 178 && py <= 676) toggleSubsystem('science');
      else if (px >= 844 && px <= 1208 && py >= 178 && py <= 676) toggleSubsystem('rover');
    }
  };

  return (
    <div
      className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col gap-2.5 bg-[#0F172A] border-2 border-[#79C8E8]/55 rounded-2xl p-3 sm:p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Solar Dust & Power Grid"
    >
      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#FFD66B] p-1.5 text-[#0F172A]">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="font-display text-base font-bold text-[#F8FAFC] sm:text-lg">
              Solar Dust &amp; Grid
            </h2>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#1E293B] px-2.5 py-1 text-xs font-extrabold">
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'dust'
                  ? 'bg-[#FFD66B] text-[#0F172A]'
                  : 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
              }`}
            >
              {stage === 'dust' ? '1: Brush Solar Dust' : '1: 100 kW Restored ✓'}
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'breaker' && !won
                  ? 'bg-[#79C8E8] text-[#0F172A]'
                  : won
                    ? 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
                    : 'text-slate-400'
              }`}
            >
              2: Balance 100 kW Bus
            </span>
          </div>

          <span className="font-display text-sm font-extrabold text-[#FFD66B] sm:text-base">
            {stage === 'dust'
              ? 'Brush orange static lunar dust off the solar wings!'
              : 'Power all 3 machines (keep total <= 100 kW so breakers never trip)!'}
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
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-[#79C8E8]/35 bg-[#080F24]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={(e) => handleCanvasPointer(e.clientX, e.clientY, true)}
          onPointerMove={(e) => {
            if (stageRef.current === 'dust' && e.buttons > 0) {
              handleCanvasPointer(e.clientX, e.clientY, false);
            }
          }}
          className="pixelated aspect-video max-h-full max-w-full block cursor-pointer touch-none"
        />
      </div>

      {/* Bottom Controls */}
      {stage === 'dust' ? (
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="rounded-xl bg-[#1E293B] px-4 py-2.5 font-display text-sm font-extrabold text-[#FB923C] sm:text-base">
            Dust Clumps Left: {dustLeftUi} / 12
          </div>
          <button
            type="button"
            onClick={sweepNextDustBatch}
            className="flex flex-1 max-w-md items-center justify-center gap-2 rounded-xl bg-[#FFD66B] px-6 py-2.5 font-display text-base font-extrabold text-[#0F172A] shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
          >
            <Brush className="h-5 w-5" />
            STATIC BRUSH SWEEP (SPACE)
          </button>
        </div>
      ) : (
        <div className="grid shrink-0 grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => toggleSubsystem('heaters')}
            className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 font-display text-sm font-extrabold transition-colors sm:text-base ${
              switchesUi.heaters
                ? 'border-[#FFD66B] bg-[#FB923C] text-[#0F172A]'
                : 'border-slate-600 bg-[#1E293B] text-slate-200 hover:border-[#FB923C]'
            }`}
          >
            <Flame className="h-4 w-4" />
            Heaters (45 kW)
          </button>

          <button
            type="button"
            onClick={() => toggleSubsystem('science')}
            className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 font-display text-sm font-extrabold transition-colors sm:text-base ${
              switchesUi.science
                ? 'border-[#FFD66B] bg-[#A995E8] text-[#0F172A]'
                : 'border-slate-600 bg-[#1E293B] text-slate-200 hover:border-[#A995E8]'
            }`}
          >
            <Cpu className="h-4 w-4" />
            Science (40 kW)
          </button>

          <button
            type="button"
            onClick={() => toggleSubsystem('rover')}
            className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 font-display text-sm font-extrabold transition-colors sm:text-base ${
              switchesUi.rover
                ? 'border-[#FFD66B] bg-[#9BD8A7] text-[#0F172A]'
                : 'border-slate-600 bg-[#1E293B] text-slate-200 hover:border-[#9BD8A7]'
            }`}
          >
            <Radio className="h-4 w-4" />
            Rover (35 kW)
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
                {earnedGrade.toUpperCase()} · 100 kW BALANCED
              </span>
            </div>

            <h3 className="font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
              SOLAR CLEANED &amp; BASE THAWED SAFELY!
            </h3>

            <svg
              viewBox="0 0 560 132"
              className="w-full max-w-lg rounded-xl border border-[#79C8E8]/35 bg-[#0F172A]"
              aria-hidden="true"
            >
              <circle cx="52" cy="36" r="18" fill="#FFD66B" />
              <path d="M72 48 L120 68" stroke="#FFD66B" strokeWidth="3" strokeDasharray="5 4" />
              <rect x="115" y="54" width="90" height="44" rx="4" fill="#1D4ED8" stroke="#79C8E8" strokeWidth="2" />
              <text x="160" y="114" textAnchor="middle" fill="#FFD66B" fontSize="12" fontWeight="700">
                Dust Free = 100 kW
              </text>

              <path d="M214 76 L266 76 M256 68 L266 76 L256 84" stroke="#9BD8A7" strokeWidth="3" fill="none" />

              <rect x="280" y="34" width="250" height="68" rx="8" fill="#1E293B" stroke="#9BD8A7" strokeWidth="2" />
              <rect x="296" y="52" width="176" height="16" rx="4" fill="#9BD8A7" />
              <line x1="482" y1="46" x2="482" y2="74" stroke="#F8FAFC" strokeWidth="3" />
              <text x="405" y="90" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700">
                45 + 40 = 85 kW &lt;= 100 kW Safe!
              </text>
            </svg>

            <p className="max-w-lg text-sm font-bold text-slate-200">
              Brushing static Moon dust restores solar kW, and balancing breakers keeps wires cool while thawing -35°C cold!
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
