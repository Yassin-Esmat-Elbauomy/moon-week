import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Droplets, Sprout, Wind } from 'lucide-react';
import type { GameState, MiniGameGrade } from '../../types/game';
import { playCue } from '../../services/soundEngine';

interface GreenhouseMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

type StageId = 'bubbles' | 'ponds';

interface PipeBubble {
  id: number;
  x: number;
  y: number;
  t: number;
  radius: number;
  popped: boolean;
}

interface FloatingSphere {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  absorbedTarget: number | null;
}

interface PlantPod {
  id: number;
  name: string;
  x: number;
  moisture: number; // 0..100 (ideal 35..75)
  growth: number; // 0..100
  blanketed: boolean;
}

interface MistParticle {
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

interface GreenhouseSim {
  elapsed: number;
  bubbles: PipeBubble[];
  waterFrontT: number;
  stageTransitionTimer: number;
  spheres: FloatingSphere[];
  nextSphereSpawn: number;
  sphereIdSeq: number;
  pods: PlantPod[];
  particles: MistParticle[];
  drownWarnings: number;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const BUBBLE_COUNT = 6;

function pipePointAt(t: number): { x: number; y: number } {
  const x = 185 + t * 880;
  const y = 365 + Math.sin(t * Math.PI * 2.5) * 98;
  return { x, y };
}

function createInitialBubbles(): PipeBubble[] {
  return Array.from({ length: BUBBLE_COUNT }, (_, idx) => {
    const t = 0.14 + idx * 0.145;
    const pt = pipePointAt(t);
    return {
      id: idx + 1,
      x: pt.x,
      y: pt.y,
      t,
      radius: 34,
      popped: false,
    };
  });
}

function createInitialPods(): PlantPod[] {
  return [
    { id: 0, name: 'SPACE LETTUCE', x: 310, moisture: 26, growth: 12, blanketed: false },
    { id: 1, name: 'DWARF TOMATO', x: 640, moisture: 30, growth: 12, blanketed: false },
    { id: 2, name: 'MOON KALE', x: 970, moisture: 24, growth: 12, blanketed: false },
  ];
}

function createInitialSpheres(): FloatingSphere[] {
  return [
    { id: 1, x: 260, y: 190, vx: 38, vy: 18, radius: 28, active: true, absorbedTarget: null },
    { id: 2, x: 520, y: 145, vx: -30, vy: 26, radius: 30, active: true, absorbedTarget: null },
    { id: 3, x: 810, y: 185, vx: 32, vy: 20, radius: 28, active: true, absorbedTarget: null },
    { id: 4, x: 1030, y: 155, vx: -36, vy: 22, radius: 29, active: true, absorbedTarget: null },
  ];
}

function createParticlePool(): MistParticle[] {
  return Array.from({ length: 72 }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0.5,
    color: '#79C8E8',
    size: 6,
  }));
}

function spawnBurst(
  pool: MistParticle[],
  x: number,
  y: number,
  color: string,
  count: number,
): void {
  let spawned = 0;
  for (const p of pool) {
    if (!p.active) {
      const ang = (Math.PI * 2 * spawned) / count + Math.random() * 0.4;
      const spd = 70 + Math.random() * 140;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(ang) * spd;
      p.vy = Math.sin(ang) * spd;
      p.maxLife = 0.48;
      p.life = 0.48;
      p.color = color;
      p.size = 6;
      spawned += 1;
      if (spawned >= count) return;
    }
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, pool: MistParticle[]): void {
  for (const p of pool) {
    if (!p.active) continue;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawBubbleStage(ctx: CanvasRenderingContext2D, sim: GreenhouseSim): void {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#0B132B';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Background greenhouse grid
  ctx.strokeStyle = 'rgba(121, 200, 232, 0.08)';
  ctx.lineWidth = 2;
  for (let gx = 0; gx < CANVAS_WIDTH; gx += 64) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let gy = 0; gy < CANVAS_HEIGHT; gy += 64) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(CANVAS_WIDTH, gy);
    ctx.stroke();
  }

  // Left: H2O Recycler Tank
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(36, 220, 150, 290);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 220, 150, 290);
  ctx.fillStyle = 'rgba(121, 200, 232, 0.35)';
  ctx.fillRect(46, 280, 130, 220);

  // Spinning impeller inside tank
  ctx.save();
  ctx.translate(111, 390);
  ctx.rotate(sim.elapsed * 4.2);
  ctx.fillStyle = '#9BD8A7';
  ctx.fillRect(-32, -6, 64, 12);
  ctx.fillRect(-6, -32, 12, 64);
  ctx.restore();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('H2O', 111, 252);
  ctx.fillText('RECYCLER', 111, 274);

  // Right: Greenhouse Veggie Bay
  const allCleared = sim.bubbles.every((b) => b.popped);
  ctx.fillStyle = allCleared ? 'rgba(155, 216, 167, 0.2)' : '#1E293B';
  ctx.fillRect(1080, 220, 164, 290);
  ctx.strokeStyle = allCleared ? '#9BD8A7' : '#475569';
  ctx.lineWidth = 4;
  ctx.strokeRect(1080, 220, 164, 290);
  ctx.fillStyle = '#9BD8A7';
  ctx.fillText('VEGGIE', 1162, 260);
  ctx.fillText('GARDEN', 1162, 284);

  // Little plant sprouts waiting in garden bay
  for (let i = 0; i < 3; i++) {
    const px = 1116 + i * 44;
    const py = 460;
    ctx.fillStyle = '#78350F';
    ctx.fillRect(px - 14, py, 28, 22);
    ctx.fillStyle = allCleared ? '#9BD8A7' : '#64748B';
    ctx.fillRect(px - 3, py - 24, 6, 24);
    ctx.fillRect(px - 14, py - 28, 12, 10);
    ctx.fillRect(px + 2, py - 28, 12, 10);
  }
  ctx.textAlign = 'left';

  // Pipe outer casing
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 74;
  ctx.beginPath();
  for (let s = 0; s <= 40; s++) {
    const t = s / 40;
    const pt = pipePointAt(t);
    if (s === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // Pipe inner glass lumen
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 54;
  ctx.stroke();

  // Animated water column flowing up to waterFrontT
  if (sim.waterFrontT > 0.01) {
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 44;
    ctx.beginPath();
    const steps = 40;
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * sim.waterFrontT;
      const pt = pipePointAt(t);
      if (s === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Sparkling moving water pulses inside wet portion
    ctx.fillStyle = '#BAE6FD';
    for (let d = 0; d < 16; d++) {
      const dtPos = ((d / 16 + sim.elapsed * 0.45) % 1) * sim.waterFrontT;
      const pt = pipePointAt(dtPos);
      ctx.fillRect(Math.round(pt.x - 6), Math.round(pt.y - 4 + Math.sin(d + sim.elapsed * 7) * 8), 12, 6);
    }
  }

  // Trapped Air Lock Bubbles inside pipe
  for (const b of sim.bubbles) {
    if (b.popped) continue;
    const wobble = Math.sin(sim.elapsed * 6 + b.id) * 3;
    const r = b.radius + wobble * 0.6;

    ctx.fillStyle = 'rgba(255, 214, 107, 0.28)';
    ctx.beginPath();
    ctx.arc(b.x, b.y, r + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 214, 107, 0.78)';
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Shine dot
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(b.x - r * 0.35, b.y - r * 0.35, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AIR', b.x, b.y + 6);
    ctx.textAlign = 'left';
  }

  drawParticles(ctx, sim.particles);

  // Stage 1 HUD Counter
  const remaining = sim.bubbles.filter((b) => !b.popped).length;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(28, 22, 360, 56);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(28, 22, 360, 56);
  ctx.fillStyle = remaining === 0 ? '#9BD8A7' : '#FFD66B';
  ctx.font = 'bold 24px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    remaining === 0
      ? 'WATER FLOWING! LOADING PONDS...'
      : `AIR BUBBLES LEFT: ${remaining} / ${BUBBLE_COUNT}`,
    48,
    58,
  );
}

function drawPondsStage(ctx: CanvasRenderingContext2D, sim: GreenhouseSim): void {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#0B132B';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Purple-pink ISS Veggie LED grow light beams
  const beamPositions: readonly number[] = [310, 640, 970];
  for (const bx of beamPositions) {
    const grad = ctx.createLinearGradient(bx, 64, bx, 560);
    grad.addColorStop(0, 'rgba(169, 149, 232, 0.36)');
    grad.addColorStop(1, 'rgba(169, 149, 232, 0.03)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(bx - 75, 64);
    ctx.lineTo(bx + 75, 64);
    ctx.lineTo(bx + 135, 560);
    ctx.lineTo(bx - 135, 560);
    ctx.closePath();
    ctx.fill();

    // LED fixture bar
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(bx - 88, 46, 176, 22);
    ctx.fillStyle = '#E879F9';
    ctx.fillRect(bx - 74, 62, 148, 8);
  }

  // Gravity badge top-right
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(928, 20, 326, 52);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(928, 20, 326, 52);
  ctx.fillStyle = '#79C8E8';
  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.fillText('1/6g GRAVITY (1.62 m/s²)', 948, 53);

  // Floor Tray
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(60, 588, CANVAS_WIDTH - 120, 112);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 588, CANVAS_WIDTH - 120, 112);

  // Draw 3 Plant Pods + NASA PONDS Capillary Wicking Blocks
  for (const pod of sim.pods) {
    const ideal = pod.moisture >= 35 && pod.moisture <= 75;
    const flooded = pod.moisture > 75;

    // PONDS Porous Capillary Block Base
    ctx.fillStyle = '#D97706';
    ctx.fillRect(pod.x - 86, 518, 172, 70);
    ctx.strokeStyle = '#FFD66B';
    ctx.lineWidth = 3;
    ctx.strokeRect(pod.x - 86, 518, 172, 70);

    // Porous honeycomb pores showing capillary water climbing UP
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        const px = pod.x - 72 + col * 26;
        const py = 528 + row * 19;
        const climbWave = Math.sin(sim.elapsed * 5 - row * 0.8 + pod.id) > 0;
        ctx.fillStyle = pod.moisture > 22 && climbWave ? '#79C8E8' : '#78350F';
        ctx.fillRect(px, py, 14, 11);
      }
    }

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 14px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PONDS CAPILLARY WICK', pod.x, 578);

    // Root Chamber Box above PONDS block
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(pod.x - 70, 444, 140, 74);
    ctx.strokeStyle = flooded ? '#F87171' : ideal ? '#9BD8A7' : '#FFD66B';
    ctx.lineWidth = 3;
    ctx.strokeRect(pod.x - 70, 444, 140, 74);

    // Roots inside chamber
    ctx.strokeStyle = flooded ? '#38BDF8' : '#E2E8F0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pod.x, 446);
    ctx.lineTo(pod.x - 26, 488);
    ctx.moveTo(pod.x, 446);
    ctx.lineTo(pod.x + 28, 492);
    ctx.moveTo(pod.x, 446);
    ctx.lineTo(pod.x, 504);
    ctx.stroke();

    // Flooded water blanket visual if drowning (>75%)
    if (flooded) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.52)';
      ctx.beginPath();
      ctx.arc(pod.x, 480, 42 + Math.sin(sim.elapsed * 7) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 15px Fredoka, Nunito, sans-serif';
      ctx.fillText('TAP TO VENT!', pod.x, 485);
    }

    // Growing pixel plant above root box
    const gScale = 0.4 + (pod.growth / 100) * 0.85;
    const stemH = Math.round(78 * gScale);
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(pod.x - 5, 444 - stemH, 10, stemH);

    // Leaves
    const leafW = Math.round(34 * gScale);
    const leafH = Math.round(18 * gScale);
    ctx.fillStyle = '#9BD8A7';
    ctx.fillRect(pod.x - leafW - 4, 444 - stemH + 14, leafW, leafH);
    ctx.fillRect(pod.x + 4, 444 - stemH + 14, leafW, leafH);
    ctx.fillRect(pod.x - Math.round(leafW * 0.8), 444 - stemH - 6, Math.round(leafW * 1.6), leafH);

    // Cherry tomatoes / blossoms when >= 70% grown
    if (pod.growth >= 70) {
      ctx.fillStyle = pod.id === 1 ? '#F87171' : '#FFD66B';
      ctx.beginPath();
      ctx.arc(pod.x - 16, 444 - stemH + 18, 8, 0, Math.PI * 2);
      ctx.arc(pod.x + 18, 444 - stemH + 12, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Air + Water Mix Bar beneath PONDS block
    const barX = pod.x - 86;
    const barY = 602;
    const barW = 172;
    const barH = 22;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(barX, barY, barW, barH);
    // Ideal green middle band (35%..75%)
    ctx.fillStyle = 'rgba(155, 216, 167, 0.32)';
    ctx.fillRect(barX + Math.round(barW * 0.35), barY, Math.round(barW * 0.4), barH);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    const needleX = barX + Math.round((pod.moisture / 100) * barW);
    ctx.fillStyle = flooded ? '#F87171' : ideal ? '#9BD8A7' : '#FFD66B';
    ctx.fillRect(needleX - 4, barY - 3, 8, barH + 6);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 15px Nunito, sans-serif';
    ctx.fillText(
      `${pod.name} · ${Math.round(pod.growth)}%`,
      pod.x,
      646,
    );
    ctx.fillStyle = flooded ? '#F87171' : ideal ? '#9BD8A7' : '#FFD66B';
    ctx.font = 'bold 14px Fredoka, Nunito, sans-serif';
    ctx.fillText(
      flooded ? 'ROOT FLOODED (CLICK!)' : ideal ? 'AIR + WATER MIX OK ✓' : 'THIRSTY — CLICK SPHERE!',
      pod.x,
      668,
    );
    ctx.textAlign = 'left';
  }

  // 1/6g Floating Water Spheres
  for (const sp of sim.spheres) {
    if (!sp.active) continue;
    const wobble = Math.sin(sim.elapsed * 5 + sp.id) * 2.5;
    const r = sp.radius + wobble;

    ctx.fillStyle = 'rgba(121, 200, 232, 0.25)';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, r + 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Specular drop shine
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(sp.x - r * 0.34, sp.y - r * 0.34, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }

  drawParticles(ctx, sim.particles);

  // Top-left Growth Progress Box
  const avgGrowth = Math.round(
    (sim.pods[0]!.growth + sim.pods[1]!.growth + sim.pods[2]!.growth) / 3,
  );
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(26, 20, 390, 52);
  ctx.strokeStyle = '#9BD8A7';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(26, 20, 390, 52);
  ctx.fillStyle = '#9BD8A7';
  ctx.font = 'bold 22px Fredoka, Nunito, sans-serif';
  ctx.fillText(`PONDS GARDEN GROWTH: ${avgGrowth}%`, 44, 53);
}

export const GreenhouseMiniGame: React.FC<GreenhouseMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [stage, setStage] = useState<StageId>('bubbles');
  const [bubblesLeftUi, setBubblesLeftUi] = useState<number>(BUBBLE_COUNT);
  const [growthUi, setGrowthUi] = useState<number>(12);
  const [won, setWon] = useState<boolean>(false);
  const [earnedGrade, setEarnedGrade] = useState<MiniGameGrade>('gold');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<StageId>('bubbles');
  const wonRef = useRef<boolean>(false);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  const simRef = useRef<GreenhouseSim>({
    elapsed: 0,
    bubbles: createInitialBubbles(),
    waterFrontT: 0.1,
    stageTransitionTimer: 0,
    spheres: createInitialSpheres(),
    nextSphereSpawn: 1.5,
    sphereIdSeq: 10,
    pods: createInitialPods(),
    particles: createParticlePool(),
    drownWarnings: 0,
  });

  useEffect(() => {
    if (won) {
      continueBtnRef.current?.focus();
    }
  }, [won]);

  const popNextBubble = useCallback(() => {
    const sim = simRef.current;
    const next = sim.bubbles.find((b) => !b.popped);
    if (!next) return;
    next.popped = true;
    playCue('bubble');
    spawnBurst(sim.particles, next.x, next.y, '#FFD66B', 14);
    const remaining = sim.bubbles.filter((b) => !b.popped).length;
    setBubblesLeftUi(remaining);
    if (remaining === 0) {
      playCue('water_flow');
      sim.stageTransitionTimer = 1.1;
    }
  }, []);

  const wickNearestSphere = useCallback(() => {
    const sim = simRef.current;
    const activeSphere = sim.spheres.find((s) => s.active && s.absorbedTarget === null);
    if (!activeSphere) return;
    // Pick thirstiest non-complete pod
    let bestIdx = 0;
    let lowestMoist = Infinity;
    for (let i = 0; i < sim.pods.length; i++) {
      const p = sim.pods[i];
      if (!p) continue;
      if (p.moisture < lowestMoist) {
        lowestMoist = p.moisture;
        bestIdx = i;
      }
    }
    activeSphere.absorbedTarget = bestIdx;
    playCue('water_flow');
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
        return;
      }
      if (e.code === 'Space' && !e.repeat && !wonRef.current) {
        e.preventDefault();
        if (stageRef.current === 'bubbles') {
          popNextBubble();
        } else {
          wickNearestSphere();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, popNextBubble, wickNearestSphere]);

  // 60fps Loop
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    let uiSyncAccum = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;

      const sim = simRef.current;
      sim.elapsed += dt;
      uiSyncAccum += dt;

      if (!wonRef.current) {
        if (stageRef.current === 'bubbles') {
          const firstBlocked = sim.bubbles.find((b) => !b.popped);
          const targetT = firstBlocked ? Math.max(0.08, firstBlocked.t - 0.04) : 1.0;
          sim.waterFrontT += (targetT - sim.waterFrontT) * Math.min(1, dt * 7);

          if (!firstBlocked) {
            sim.stageTransitionTimer -= dt;
            if (sim.stageTransitionTimer <= 0) {
              stageRef.current = 'ponds';
              setStage('ponds');
              playCue('confirm');
            }
          }
        } else {
          // Stage 2: 1/6g Floating water spheres + PONDS capillary uptake
          sim.nextSphereSpawn -= dt;
          const activeCount = sim.spheres.filter((s) => s.active).length;
          if (sim.nextSphereSpawn <= 0 && activeCount < 5) {
            sim.sphereIdSeq += 1;
            const spawnX = 160 + Math.random() * 960;
            sim.spheres.push({
              id: sim.sphereIdSeq,
              x: spawnX,
              y: 95 + Math.random() * 140,
              vx: (Math.random() - 0.5) * 85,
              vy: 24 + Math.random() * 28,
              radius: 26 + Math.random() * 6,
              active: true,
              absorbedTarget: null,
            });
            sim.nextSphereSpawn = 1.6;
          }

          for (const sp of sim.spheres) {
            if (!sp.active) continue;
            if (sp.absorbedTarget !== null) {
              const pod = sim.pods[sp.absorbedTarget];
              if (!pod) {
                sp.active = false;
                continue;
              }
              const tx = pod.x;
              const ty = 540;
              const dx = tx - sp.x;
              const dy = ty - sp.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 26) {
                sp.active = false;
                pod.moisture = Math.min(92, pod.moisture + 24);
                spawnBurst(sim.particles, tx, 530, '#79C8E8', 12);
                playCue('bubble');
              } else {
                sp.x += (dx / dist) * 560 * dt;
                sp.y += (dy / dist) * 560 * dt;
              }
            } else {
              // 1/6g slow floating drift
              sp.x += sp.vx * dt;
              sp.y += sp.vy * dt + Math.sin(sim.elapsed * 2.2 + sp.id) * 14 * dt;
              if (sp.x < 90 || sp.x > CANVAS_WIDTH - 90) sp.vx *= -1;
              if (sp.y < 90) sp.vy = Math.abs(sp.vy);
              // Stray sphere drifts onto a plant root blanket if unhandled
              if (sp.y >= 460) {
                let hitPod: PlantPod | null = null;
                for (const pod of sim.pods) {
                  if (Math.abs(sp.x - pod.x) < 92) {
                    hitPod = pod;
                    break;
                  }
                }
                if (hitPod) {
                  sp.active = false;
                  hitPod.moisture = Math.min(96, hitPod.moisture + 34);
                  if (hitPod.moisture > 75) {
                    sim.drownWarnings += 1;
                    playCue('alert');
                  }
                  spawnBurst(sim.particles, hitPod.x, 470, '#38BDF8', 10);
                } else {
                  sp.vy = -Math.abs(sp.vy);
                }
              }
            }
          }

          // Update plant moisture decay and healthy growth
          let totalGrowth = 0;
          for (const pod of sim.pods) {
            pod.moisture = Math.max(12, pod.moisture - 3.6 * dt);
            pod.blanketed = pod.moisture > 75;
            if (pod.moisture >= 35 && pod.moisture <= 75) {
              pod.growth = Math.min(100, pod.growth + 10.5 * dt);
            } else if (pod.moisture >= 24 && pod.moisture < 35) {
              pod.growth = Math.min(100, pod.growth + 3.2 * dt);
            }
            totalGrowth += pod.growth;
          }

          const avg = Math.round(totalGrowth / sim.pods.length);
          if (uiSyncAccum >= 0.14) {
            uiSyncAccum = 0;
            setGrowthUi(avg);
          }

          if (sim.pods.every((p) => p.growth >= 100)) {
            wonRef.current = true;
            const grade: MiniGameGrade = sim.drownWarnings <= 2 ? 'gold' : 'silver';
            setEarnedGrade(grade);
            setGrowthUi(100);
            playCue('success');
            setWon(true);
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
          if (stageRef.current === 'bubbles') {
            drawBubbleStage(ctx, sim);
          } else {
            drawPondsStage(ctx, sim);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleCanvasPointerAction = (clientX: number, clientY: number) => {
    if (wonRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const py = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    const sim = simRef.current;

    if (stageRef.current === 'bubbles') {
      for (const b of sim.bubbles) {
        if (!b.popped && Math.hypot(px - b.x, py - b.y) <= 58) {
          b.popped = true;
          playCue('bubble');
          spawnBurst(sim.particles, b.x, b.y, '#FFD66B', 14);
          const remaining = sim.bubbles.filter((item) => !item.popped).length;
          setBubblesLeftUi(remaining);
          if (remaining === 0) {
            playCue('water_flow');
            sim.stageTransitionTimer = 1.0;
          }
          break;
        }
      }
      return;
    }

    // Stage 2: Check floating spheres first
    for (const sp of sim.spheres) {
      if (sp.active && sp.absorbedTarget === null && Math.hypot(px - sp.x, py - sp.y) <= 62) {
        let bestIdx = 0;
        let lowestDist = Infinity;
        for (let i = 0; i < sim.pods.length; i++) {
          const pod = sim.pods[i];
          if (!pod) continue;
          const score = Math.abs(sp.x - pod.x) + (pod.moisture > 70 ? 600 : 0);
          if (score < lowestDist) {
            lowestDist = score;
            bestIdx = i;
          }
        }
        sp.absorbedTarget = bestIdx;
        playCue('water_flow');
        return;
      }
    }

    // Check if player tapped a flooded plant root to vent excess blanket water
    for (const pod of sim.pods) {
      if (pod.moisture > 70 && Math.abs(px - pod.x) <= 95 && py >= 420 && py <= 585) {
        pod.moisture = 55;
        spawnBurst(sim.particles, pod.x, 470, '#9BD8A7', 12);
        playCue('bubble');
        return;
      }
    }
  };

  return (
    <div
      className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col gap-2.5 bg-[#0F172A] border-2 border-[#79C8E8]/55 rounded-2xl p-3 sm:p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Space Greenhouse Hydroponics"
    >
      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#9BD8A7] p-1.5 text-[#0F172A]">
              <Sprout className="h-5 w-5" />
            </div>
            <h2 className="font-display text-base font-bold text-[#F8FAFC] sm:text-lg">
              Greenhouse Water Lab
            </h2>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#1E293B] px-2.5 py-1 text-xs font-extrabold">
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'bubbles'
                  ? 'bg-[#FFD66B] text-[#0F172A]'
                  : 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
              }`}
            >
              {stage === 'bubbles' ? '1: Pipe Bubbles' : '1: Pipes Clear ✓'}
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'ponds' && !won
                  ? 'bg-[#79C8E8] text-[#0F172A]'
                  : won
                    ? 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
                    : 'text-slate-400'
              }`}
            >
              2: 1/6g PONDS Wicks
            </span>
          </div>

          <span className="font-display text-sm font-extrabold text-[#79C8E8] sm:text-base">
            {stage === 'bubbles'
              ? 'Tap or drag across the trapped air bubbles in the pipe!'
              : 'Click floating water spheres to wick into PONDS blocks (keep Air+Water green)!'}
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
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-[#79C8E8]/35 bg-[#0B132B]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={(e) => handleCanvasPointerAction(e.clientX, e.clientY)}
          onPointerMove={(e) => {
            if (e.buttons > 0 || stageRef.current === 'bubbles') {
              if (e.buttons > 0) {
                handleCanvasPointerAction(e.clientX, e.clientY);
              }
            }
          }}
          className="pixelated aspect-video max-h-full max-w-full block cursor-pointer touch-none"
        />
      </div>

      {/* Bottom Controls */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-[#1E293B] px-4 py-2.5 font-display text-sm font-extrabold text-[#79C8E8] sm:text-base">
          <Droplets className="h-5 w-5" />
          {stage === 'bubbles'
            ? `Bubbles Left: ${bubblesLeftUi} / ${BUBBLE_COUNT}`
            : `Crop Growth: ${growthUi}%`}
        </div>

        {stage === 'bubbles' ? (
          <button
            type="button"
            onClick={popNextBubble}
            className="flex flex-1 max-w-md items-center justify-center gap-2 rounded-xl bg-[#FFD66B] px-6 py-2.5 font-display text-base font-extrabold text-[#0F172A] shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
          >
            <Wind className="h-5 w-5" />
            PURGE NEXT BUBBLE (SPACE)
          </button>
        ) : (
          <button
            type="button"
            onClick={wickNearestSphere}
            className="flex flex-1 max-w-md items-center justify-center gap-2 rounded-xl bg-[#9BD8A7] px-6 py-2.5 font-display text-base font-extrabold text-[#0F172A] shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#FFD66B]"
          >
            <Droplets className="h-5 w-5" />
            WICK SPHERE TO PONDS (SPACE)
          </button>
        )}
      </div>

      {/* Visual Science Completion Card ("Science Proved!") */}
      {won && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[#0F172A]/95 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border-2 border-[#9BD8A7]/60 bg-[#1E293B] p-5 text-center shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#9BD8A7] px-3 py-0.5 font-display text-xs font-extrabold uppercase text-[#0F172A]">
                Science Proved!
              </span>
              <span className="rounded-full bg-[#FFD66B] px-3 py-0.5 font-display text-xs font-extrabold uppercase text-[#0F172A]">
                {earnedGrade.toUpperCase()} · PONDS CAPILLARY
              </span>
            </div>

            <h3 className="font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
              SPACE CROPS THRIVING IN 1/6g!
            </h3>

            {/* Visual Proof Diagram */}
            <svg
              viewBox="0 0 560 132"
              className="w-full max-w-lg rounded-xl border border-[#79C8E8]/35 bg-[#0F172A]"
              aria-hidden="true"
            >
              {/* Left: Floating sphere drowning roots */}
              <circle cx="95" cy="58" r="28" fill="#38BDF8" fillOpacity="0.45" stroke="#79C8E8" strokeWidth="2" />
              <text x="95" y="63" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700">
                1/6g Blob
              </text>
              <text x="95" y="112" textAnchor="middle" fill="#F87171" fontSize="12" fontWeight="700">
                Chokes Root Air
              </text>

              {/* Arrow */}
              <path d="M168 64 L222 64 M212 56 L222 64 L212 72" stroke="#FFD66B" strokeWidth="3" fill="none" />

              {/* Right: PONDS capillary wicking block */}
              <rect x="260" y="76" width="120" height="32" rx="4" fill="#D97706" stroke="#FFD66B" strokeWidth="2" />
              <rect x="285" y="34" width="70" height="42" fill="#1E293B" stroke="#9BD8A7" strokeWidth="2" />
              <path d="M320 98 L320 46 M313 54 L320 46 L327 54" stroke="#79C8E8" strokeWidth="3" fill="none" />
              <text x="320" y="24" textAnchor="middle" fill="#9BD8A7" fontSize="13" fontWeight="700">
                PONDS Capillary Block
              </text>
              <text x="468" y="54" textAnchor="middle" fill="#79C8E8" fontSize="13" fontWeight="700">
                Air + Water Mix
              </text>
              <text x="468" y="76" textAnchor="middle" fill="#9BD8A7" fontSize="12" fontWeight="700">
                0 Electric Watts!
              </text>
            </svg>

            <p className="max-w-lg text-sm font-bold text-slate-200">
              Porous NASA PONDS blocks pull 1/6g water upward through tiny holes so roots drink water AND breathe air!
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
