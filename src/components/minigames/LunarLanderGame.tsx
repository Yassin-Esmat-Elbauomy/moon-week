import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Flame, Radar, Rocket, RotateCcw } from 'lucide-react';
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

type StageId = 'scan' | 'descent';

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

interface BoulderSpec {
  x: number;
  y: number;
  r: number;
}

interface LanderPhysics {
  x: number;
  vx: number;
  alt: number;
  vDown: number;
  elapsed: number;
  boulderBumps: number;
  onPad: boolean;
  particles: DustParticle[];
}

interface ScanState {
  sunlitProgress: number;
  craterProgress: number;
  sunlitDone: boolean;
  craterDone: boolean;
  activeScan: LandingSite | null;
  laserX: number;
}

interface TouchdownOutcome {
  grade: MiniGameGrade;
  site: LandingSite;
  touchdownVelocity: number;
  gentle: boolean;
  bothScanned: boolean;
  onPad: boolean;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const GROUND_BASE_Y = 622;
const START_ALT = 62;
const MAX_ALT = 68;
const PX_PER_M_ALT = 7.45;
const LUNAR_GRAVITY = 1.62;
const RETRO_THRUST = 4.35;
const SAFE_SPEED_LIMIT = 3.0;
const MAX_VISUAL_SPEED = 6.5;
const MAX_PARTICLES = 84;
const PAD_WIDTH = 340;
const HORIZ_ACCEL = 540;
const MAX_HORIZ_SPEED = 240;

const STARS: readonly StarDot[] = Array.from({ length: 84 }, (_, idx) => ({
  x: ((idx * 173 + 29) % (CANVAS_WIDTH - 20)) + 10,
  y: ((idx * 101 + 17) % 430) + 12,
  size: idx % 7 === 0 ? 4 : idx % 3 === 0 ? 3 : 2,
  baseAlpha: 0.4 + ((idx * 19) % 50) / 100,
  twinkleSpeed: 1.4 + (idx % 5) * 0.65,
  phase: idx * 0.85,
}));

const SITE_PAD_X: Record<LandingSite, number> = {
  sunlit_ridge: 640,
  crater_shadow: 650,
};

const SITE_BOULDERS: Record<LandingSite, readonly BoulderSpec[]> = {
  sunlit_ridge: [
    { x: 220, y: GROUND_BASE_Y - 12, r: 54 },
    { x: 405, y: GROUND_BASE_Y - 6, r: 34 },
    { x: 890, y: GROUND_BASE_Y - 8, r: 38 },
    { x: 1060, y: GROUND_BASE_Y - 14, r: 58 },
  ],
  crater_shadow: [
    { x: 205, y: GROUND_BASE_Y - 14, r: 62 },
    { x: 395, y: GROUND_BASE_Y - 8, r: 36 },
    { x: 895, y: GROUND_BASE_Y - 8, r: 40 },
    { x: 1075, y: GROUND_BASE_Y - 16, r: 64 },
  ],
};

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

function drawBackdropAndEarth(ctx: CanvasRenderingContext2D, elapsed: number, site: LandingSite | null): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#050918');
  skyGrad.addColorStop(0.65, site === 'crater_shadow' ? '#0D1936' : '#132247');
  skyGrad.addColorStop(1, site === 'crater_shadow' ? '#172549' : '#263C75');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (const s of STARS) {
    const twinkle = 0.65 + 0.35 * Math.sin(elapsed * s.twinkleSpeed + s.phase);
    ctx.fillStyle = `rgba(248, 250, 252, ${(s.baseAlpha * twinkle).toFixed(2)})`;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
  }

  // Slowly rotating Earth in upper left
  const earthX = 148;
  const earthY = 114;
  ctx.save();
  ctx.beginPath();
  ctx.arc(earthX, earthY, 48, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(121, 200, 232, 0.2)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(earthX, earthY, 38, 0, Math.PI * 2);
  ctx.fillStyle = '#2563EB';
  ctx.fill();
  ctx.clip();

  const shift = ((elapsed * 6) % 76) - 38;
  ctx.fillStyle = '#9BD8A7';
  ctx.fillRect(Math.round(earthX - 18 + shift * 0.45), earthY - 22, 20, 15);
  ctx.fillRect(Math.round(earthX + 2 + shift * 0.45), earthY + 2, 18, 16);
  ctx.fillStyle = 'rgba(248, 250, 252, 0.72)';
  ctx.fillRect(Math.round(earthX - 24 - shift * 0.3), earthY - 8, 26, 5);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(earthX, earthY, 39, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(121, 200, 232, 0.78)';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawScanStage(
  ctx: CanvasRenderingContext2D,
  scan: ScanState,
  elapsed: number,
  hoveredSite: LandingSite | null,
): void {
  ctx.imageSmoothingEnabled = false;
  drawBackdropAndEarth(ctx, elapsed, null);

  // Low-angle South Pole Sun on left horizon
  const sunPulse = 4 + Math.sin(elapsed * 2.5) * 4;
  ctx.beginPath();
  ctx.arc(82, 340, 62 + sunPulse, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 214, 107, 0.16)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(82, 340, 38, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD66B';
  ctx.fill();

  // Golden sunlight beams stretching onto Left Sunny Peak
  ctx.save();
  const beamGrad = ctx.createLinearGradient(82, 340, 620, 520);
  beamGrad.addColorStop(0, 'rgba(255, 214, 107, 0.25)');
  beamGrad.addColorStop(1, 'rgba(255, 214, 107, 0.02)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(82, 305);
  ctx.lineTo(615, 440);
  ctx.lineTo(615, 580);
  ctx.lineTo(82, 378);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Left Terrain: Sunny Peak
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.moveTo(0, 560);
  ctx.lineTo(140, 470);
  ctx.lineTo(540, 470);
  ctx.lineTo(640, 565);
  ctx.lineTo(640, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(140, 464, 400, 12);

  // Right Terrain: Shaded Crater Rim & Deep Cold Shadow Wall
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(640, 565);
  ctx.lineTo(740, 430);
  ctx.lineTo(880, 430);
  ctx.lineTo(955, 545);
  ctx.lineTo(1160, 545);
  ctx.lineTo(1230, 440);
  ctx.lineTo(CANVAS_WIDTH, 440);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.lineTo(640, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Dark frost shadow inside crater floor
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.beginPath();
  ctx.moveTo(880, 430);
  ctx.lineTo(1230, 440);
  ctx.lineTo(1160, 545);
  ctx.lineTo(955, 545);
  ctx.closePath();
  ctx.fill();

  // Glowing Ice Crystals inside Crater Rim
  const iceSpots: readonly { x: number; y: number }[] = [
    { x: 985, y: 530 },
    { x: 1055, y: 536 },
    { x: 1125, y: 528 },
  ];
  for (let i = 0; i < iceSpots.length; i++) {
    const spot = iceSpots[i];
    if (!spot) continue;
    const glow = 0.6 + 0.4 * Math.sin(elapsed * 4 + i);
    ctx.fillStyle = `rgba(121, 200, 232, ${glow.toFixed(2)})`;
    ctx.beginPath();
    ctx.moveTo(spot.x, spot.y - 22);
    ctx.lineTo(spot.x + 14, spot.y);
    ctx.lineTo(spot.x, spot.y + 12);
    ctx.lineTo(spot.x - 14, spot.y);
    ctx.closePath();
    ctx.fill();
  }

  // Orbiting LRO Satellite above sweeping laser beam
  const satX = 640 + Math.sin(elapsed * 1.15) * 430;
  const satY = 82;
  const targetBeamX =
    scan.activeScan === 'sunlit_ridge'
      ? 340 + Math.sin(elapsed * 9) * 140
      : scan.activeScan === 'crater_shadow'
        ? 950 + Math.sin(elapsed * 9) * 140
        : satX;

  ctx.save();
  ctx.strokeStyle = scan.activeScan ? 'rgba(155, 216, 167, 0.55)' : 'rgba(121, 200, 232, 0.35)';
  ctx.lineWidth = scan.activeScan ? 6 : 3;
  ctx.beginPath();
  ctx.moveTo(satX, satY + 18);
  ctx.lineTo(targetBeamX, 490);
  ctx.stroke();

  // LRO Satellite sprite
  ctx.fillStyle = '#263C75';
  ctx.fillRect(Math.round(satX - 48), satY - 8, 28, 16);
  ctx.fillRect(Math.round(satX + 20), satY - 8, 28, 16);
  ctx.fillStyle = '#FFD66B';
  ctx.fillRect(Math.round(satX - 18), satY - 12, 36, 24);
  ctx.fillStyle = '#79C8E8';
  ctx.fillRect(Math.round(satX - 6), satY + 12, 12, 8);
  ctx.restore();

  // Site Cards directly on Canvas (Left: Sunny Peak, Right: Shaded Crater Rim)
  const drawSiteCard = (
    site: LandingSite,
    boxX: number,
    title: string,
    accent: string,
    done: boolean,
    progress: number,
    facts: readonly { label: string; color: string }[],
  ) => {
    const isHovered = hoveredSite === site;
    const isScanning = scan.activeScan === site;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(boxX, 178, 510, 230);
    ctx.strokeStyle = done ? '#9BD8A7' : isScanning || isHovered ? '#FFD66B' : accent;
    ctx.lineWidth = done || isHovered || isScanning ? 4 : 2.5;
    ctx.strokeRect(boxX, 178, 510, 230);

    ctx.fillStyle = accent;
    ctx.font = 'bold 28px Fredoka, Nunito, sans-serif';
    ctx.fillText(title, boxX + 24, 222);

    ctx.fillStyle = done ? '#9BD8A7' : isScanning ? '#FFD66B' : '#CBD5E1';
    ctx.font = 'bold 20px Nunito, sans-serif';
    ctx.fillText(
      done ? 'SCAN COMPLETE - CLICK TO LAND' : isScanning ? 'SCANNING TERRAIN...' : 'CLICK TO SCAN ZONE',
      boxX + 24,
      254,
    );

    // Progress bar or revealed science pills
    if (!done) {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(boxX + 24, 284, 462, 26);
      ctx.fillStyle = accent;
      ctx.fillRect(boxX + 24, 284, Math.round(462 * progress), 26);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX + 24, 284, 462, 26);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 18px Nunito, sans-serif';
      ctx.fillText('LRO Altimeter + Diviner Thermal Scan', boxX + 24, 344);
    } else {
      facts.forEach((f, idx) => {
        const y = 286 + idx * 36;
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(boxX + 24, y, 462, 28);
        ctx.fillStyle = f.color;
        ctx.fillRect(boxX + 24, y, 10, 28);
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 19px Nunito, sans-serif';
        ctx.fillText(f.label, boxX + 44, y + 20);
      });
    }
  };

  drawSiteCard(
    'sunlit_ridge',
    84,
    'SUNNY PEAK (SHACKLETON RIDGE)',
    '#FFD66B',
    scan.sunlitDone,
    scan.sunlitProgress,
    [
      { label: 'SOLAR POWER: +90% Sunlight (+kW)', color: '#FFD66B' },
      { label: 'WATER ICE: None (Dry Sunlit Rock)', color: '#F87171' },
      { label: 'STORM COVER: Open Ridge (Needs Shield)', color: '#79C8E8' },
    ],
  );

  drawSiteCard(
    'crater_shadow',
    686,
    'SHADED CRATER RIM',
    '#79C8E8',
    scan.craterDone,
    scan.craterProgress,
    [
      { label: 'WATER ICE: Trapped H2O Crystals (-200°C)', color: '#79C8E8' },
      { label: 'STORM COVER: Tall Crater Rock Wall', color: '#9BD8A7' },
      { label: 'SOLAR POWER: Low Sunlight (Save Power)', color: '#FFD66B' },
    ],
  );

  // Subtle divider badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(606, 266, 68, 44);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 2;
  ctx.strokeRect(606, 266, 68, 44);
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', 640, 295);
  ctx.textAlign = 'left';
}

function drawDescentScene(
  ctx: CanvasRenderingContext2D,
  phys: LanderPhysics,
  site: LandingSite,
  thrusting: boolean,
  landed: boolean,
): void {
  ctx.imageSmoothingEnabled = false;
  drawBackdropAndEarth(ctx, phys.elapsed, site);

  if (site === 'sunlit_ridge') {
    // Golden polar sun glow
    ctx.beginPath();
    ctx.arc(92, 488, 36, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD66B';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(92, 488, 60, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 214, 107, 0.2)';
    ctx.fill();
  } else {
    // Protective dark Crater Rim wall on far right + icy glow
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(980, GROUND_BASE_Y);
    ctx.lineTo(1080, 390);
    ctx.lineTo(CANVAS_WIDTH, 340);
    ctx.lineTo(CANVAS_WIDTH, GROUND_BASE_Y);
    ctx.closePath();
    ctx.fill();

    // Ice glints on crater floor
    for (let i = 0; i < 4; i++) {
      const ix = 140 + i * 290;
      const iy = GROUND_BASE_Y + 18;
      ctx.fillStyle = 'rgba(121, 200, 232, 0.55)';
      ctx.fillRect(ix, iy, 18, 6);
    }
  }

  // Distant moon ridge silhouettes
  ctx.fillStyle = site === 'crater_shadow' ? '#17223B' : '#1E293B';
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
  ctx.fillStyle = site === 'crater_shadow' ? '#475569' : '#64748B';
  ctx.fillRect(0, GROUND_BASE_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_BASE_Y);
  ctx.fillStyle = site === 'crater_shadow' ? '#334155' : '#475569';
  ctx.fillRect(0, GROUND_BASE_Y + 30, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_BASE_Y - 30);

  // Jagged boulders to steer clear of
  const boulders = SITE_BOULDERS[site];
  for (const b of boulders) {
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(b.x - b.r, GROUND_BASE_Y);
    ctx.lineTo(b.x - b.r * 0.65, b.y - b.r * 0.85);
    ctx.lineTo(b.x + b.r * 0.15, b.y - b.r);
    ctx.lineTo(b.x + b.r * 0.85, b.y - b.r * 0.55);
    ctx.lineTo(b.x + b.r, GROUND_BASE_Y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#F87171';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.fillRect(Math.round(b.x - b.r * 0.3), Math.round(b.y - b.r * 0.65), Math.round(b.r * 0.45), 10);
  }

  // Wide glowing landing pad
  const padCenterX = SITE_PAD_X[site];
  const padLeft = padCenterX - PAD_WIDTH / 2;
  ctx.fillStyle = 'rgba(155, 216, 167, 0.18)';
  ctx.fillRect(padLeft - 14, GROUND_BASE_Y - 18, PAD_WIDTH + 28, 22);

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(padLeft, GROUND_BASE_Y - 8, PAD_WIDTH, 22);
  ctx.fillStyle = '#9BD8A7';
  ctx.fillRect(padLeft + 12, GROUND_BASE_Y - 8, PAD_WIDTH - 24, 10);

  const beaconBright = Math.sin(phys.elapsed * 6) > 0;
  ctx.fillStyle = beaconBright ? '#9BD8A7' : '#FFD66B';
  ctx.fillRect(padLeft - 8, GROUND_BASE_Y - 38, 12, 32);
  ctx.fillRect(padLeft + PAD_WIDTH - 4, GROUND_BASE_Y - 38, 12, 32);
  ctx.fillStyle = beaconBright ? 'rgba(155, 216, 167, 0.45)' : 'rgba(255, 214, 107, 0.35)';
  ctx.beginPath();
  ctx.arc(padLeft - 2, GROUND_BASE_Y - 38, 16, 0, Math.PI * 2);
  ctx.arc(padLeft + PAD_WIDTH + 2, GROUND_BASE_Y - 38, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9BD8A7';
  ctx.fillText('LANDING PAD (< 3.0 m/s)', padCenterX, GROUND_BASE_Y + 46);
  ctx.textAlign = 'left';

  // Pooled exhaust & regolith dust particles
  for (const p of phys.particles) {
    if (!p.active) continue;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // Pixel Lunar Lander centered at phys.x
  const rocketY = GROUND_BASE_Y - 40 - phys.alt * PX_PER_M_ALT;
  ctx.save();
  ctx.translate(Math.round(phys.x), Math.round(rocketY));
  ctx.rotate(Math.max(-0.18, Math.min(0.18, phys.vx / 900)));

  if (thrusting && !landed) {
    const flicker = Math.sin(phys.elapsed * 48) * 12;
    const flameLen = 44 + flicker;

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

  // Nose cone
  ctx.fillStyle = '#F87171';
  ctx.beginPath();
  ctx.moveTo(-22, -44);
  ctx.lineTo(0, -70);
  ctx.lineTo(22, -44);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Top-Left Telemetry Readout Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(22, 18, 300, 98);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(22, 18, 300, 98);

  ctx.fillStyle = '#FFD66B';
  ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
  ctx.fillText(site === 'sunlit_ridge' ? 'TARGET: SUNNY PEAK' : 'TARGET: CRATER RIM', 38, 46);
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 20px Nunito, sans-serif';
  ctx.fillText(`ALT: ${Math.max(0, phys.alt).toFixed(1)} m   |   g = 1.62 m/s²`, 38, 76);
  ctx.fillStyle = phys.vDown < SAFE_SPEED_LIMIT ? '#9BD8A7' : '#F87171';
  ctx.fillText(`SPEED: ${phys.vDown.toFixed(1)} m/s (Goal < 3.0)`, 38, 104);

  // Right Side Live Speed Meter (< 3.0 m/s Safe Zone)
  const barX = 1130;
  const barY = 96;
  const barW = 68;
  const barH = 430;
  const safeRatio = SAFE_SPEED_LIMIT / MAX_VISUAL_SPEED;
  const safeH = Math.round(barH * safeRatio);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(barX - 44, barY - 46, 158, barH + 86);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(barX - 44, barY - 46, 158, barH + 86);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 20px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPEED m/s', barX + barW / 2, barY - 14);

  ctx.fillStyle = 'rgba(155, 216, 167, 0.35)';
  ctx.fillRect(barX, barY, barW, safeH);
  ctx.strokeStyle = '#9BD8A7';
  ctx.lineWidth = 3;
  ctx.strokeRect(barX, barY, barW, safeH);

  ctx.fillStyle = 'rgba(248, 113, 113, 0.25)';
  ctx.fillRect(barX, barY + safeH, barW, barH - safeH);
  ctx.strokeStyle = '#F87171';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY + safeH, barW, barH - safeH);

  ctx.fillStyle = '#9BD8A7';
  ctx.font = 'bold 16px Nunito, sans-serif';
  ctx.fillText('< 3.0', barX + barW / 2, barY + safeH / 2 - 4);
  ctx.fillText('SAFE', barX + barW / 2, barY + safeH / 2 + 16);

  ctx.fillStyle = '#F87171';
  ctx.fillText('>= 3.0', barX + barW / 2, barY + safeH + (barH - safeH) / 2 - 4);
  ctx.fillText('HARD', barX + barW / 2, barY + safeH + (barH - safeH) / 2 + 16);

  const clampedV = Math.max(0, Math.min(MAX_VISUAL_SPEED, phys.vDown));
  const markerY = barY + (clampedV / MAX_VISUAL_SPEED) * barH;
  const inGreen = phys.vDown < SAFE_SPEED_LIMIT;

  ctx.fillStyle = inGreen ? '#9BD8A7' : '#F87171';
  ctx.fillRect(barX - 12, Math.round(markerY - 8), barW + 24, 16);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  ctx.strokeRect(barX - 12, Math.round(markerY - 8), barW + 24, 16);

  ctx.fillStyle = inGreen ? '#9BD8A7' : '#FFD66B';
  ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
  ctx.fillText(inGreen ? 'GENTLE' : 'HOLD THRUST!', barX + barW / 2, barY + barH + 26);
  ctx.textAlign = 'left';
}

export const LunarLanderGame: React.FC<LunarLanderGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [stage, setStage] = useState<StageId>('scan');
  const [scanUi, setScanUi] = useState<{ sunlitDone: boolean; craterDone: boolean }>({
    sunlitDone: false,
    craterDone: false,
  });
  const [selectedSite, setSelectedSite] = useState<LandingSite>('sunlit_ridge');
  const [thrustingUi, setThrustingUi] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<TouchdownOutcome | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<StageId>('scan');
  const siteRef = useRef<LandingSite>('sunlit_ridge');
  const hoveredSiteRef = useRef<LandingSite | null>(null);
  const scanRef = useRef<ScanState>({
    sunlitProgress: 0,
    craterProgress: 0,
    sunlitDone: false,
    craterDone: false,
    activeScan: null,
    laserX: 640,
  });
  const physRef = useRef<LanderPhysics>({
    x: 640,
    vx: 0,
    alt: START_ALT,
    vDown: 1.9,
    elapsed: 0,
    boulderBumps: 0,
    onPad: true,
    particles: createParticlePool(),
  });
  const keysRef = useRef<{ thrust: boolean; left: boolean; right: boolean }>({
    thrust: false,
    left: false,
    right: false,
  });
  const spaceHeldRef = useRef<boolean>(false);
  const blockSpaceConfirmRef = useRef<boolean>(false);
  const outcomeRef = useRef<TouchdownOutcome | null>(null);
  const lastCueRef = useRef<number>(0);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  const beginDescent = useCallback((site: LandingSite) => {
    playCue('confirm');
    siteRef.current = site;
    setSelectedSite(site);
    physRef.current = {
      x: site === 'sunlit_ridge' ? 540 : 740,
      vx: 0,
      alt: START_ALT,
      vDown: 1.9,
      elapsed: physRef.current.elapsed,
      boulderBumps: 0,
      onPad: true,
      particles: createParticlePool(),
    };
    outcomeRef.current = null;
    setOutcome(null);
    stageRef.current = 'descent';
    setStage('descent');
  }, []);

  const triggerScanSite = useCallback((site: LandingSite) => {
    const scan = scanRef.current;
    if (site === 'sunlit_ridge' && scan.sunlitDone) {
      beginDescent('sunlit_ridge');
      return;
    }
    if (site === 'crater_shadow' && scan.craterDone) {
      beginDescent('crater_shadow');
      return;
    }
    scan.activeScan = site;
    playCue('radar_ping');
  }, [beginDescent]);

  const handleConfirmWin = useCallback(() => {
    if (!outcomeRef.current) return;
    playCue('confirm');
    onComplete(
      outcomeRef.current.grade,
      outcomeRef.current.site,
      outcomeRef.current.touchdownVelocity,
    );
  }, [onComplete]);

  useEffect(() => {
    if (outcome !== null) {
      continueBtnRef.current?.focus();
    }
  }, [outcome]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playCue('click');
        onClose();
        return;
      }

      if (stageRef.current === 'scan') {
        if (e.key === '1') {
          triggerScanSite('sunlit_ridge');
        } else if (e.key === '2') {
          triggerScanSite('crater_shadow');
        }
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
        keysRef.current.thrust = true;
        setThrustingUi(true);
      } else if (k === 'arrowleft' || k === 'a') {
        e.preventDefault();
        keysRef.current.left = true;
      } else if (k === 'arrowright' || k === 'd') {
        e.preventDefault();
        keysRef.current.right = true;
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
        keysRef.current.thrust = false;
        setThrustingUi(false);
      } else if (k === 'arrowleft' || k === 'a') {
        keysRef.current.left = false;
      } else if (k === 'arrowright' || k === 'd') {
        keysRef.current.right = false;
      }
    };

    const clearInputs = () => {
      keysRef.current = { thrust: false, left: false, right: false };
      spaceHeldRef.current = false;
      blockSpaceConfirmRef.current = false;
      setThrustingUi(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearInputs);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearInputs);
    };
  }, [onClose, triggerScanSite]);

  // 60fps Canvas Loop (zero per-frame setState)
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;

      const phys = physRef.current;
      phys.elapsed += dt;

      if (stageRef.current === 'scan') {
        const scan = scanRef.current;
        if (scan.activeScan === 'sunlit_ridge' && !scan.sunlitDone) {
          scan.sunlitProgress = Math.min(1, scan.sunlitProgress + dt * 1.1);
          if (scan.sunlitProgress >= 1) {
            scan.sunlitDone = true;
            scan.activeScan = null;
            playCue('confirm');
            setScanUi({ sunlitDone: true, craterDone: scan.craterDone });
          }
        } else if (scan.activeScan === 'crater_shadow' && !scan.craterDone) {
          scan.craterProgress = Math.min(1, scan.craterProgress + dt * 1.1);
          if (scan.craterProgress >= 1) {
            scan.craterDone = true;
            scan.activeScan = null;
            playCue('confirm');
            setScanUi({ sunlitDone: scan.sunlitDone, craterDone: true });
          }
        }
      } else if (outcomeRef.current === null) {
        const site = siteRef.current;
        phys.vDown += LUNAR_GRAVITY * dt;
        if (keysRef.current.thrust) {
          phys.vDown -= RETRO_THRUST * dt;
          if (now - lastCueRef.current > 155) {
            playCue('thruster');
            lastCueRef.current = now;
          }
        }
        phys.vDown = Math.max(-2.2, Math.min(MAX_VISUAL_SPEED, phys.vDown));

        if (keysRef.current.left) {
          phys.vx -= HORIZ_ACCEL * dt;
        } else if (keysRef.current.right) {
          phys.vx += HORIZ_ACCEL * dt;
        } else {
          phys.vx *= Math.max(0, 1 - 4.2 * dt);
        }
        phys.vx = Math.max(-MAX_HORIZ_SPEED, Math.min(MAX_HORIZ_SPEED, phys.vx));
        phys.x = Math.max(110, Math.min(1040, phys.x + phys.vx * dt));
        phys.alt = Math.min(MAX_ALT, phys.alt - phys.vDown * dt);

        const rocketY = GROUND_BASE_Y - 40 - phys.alt * PX_PER_M_ALT;
        // Forgiving boulder deflection buffer near surface
        const boulders = SITE_BOULDERS[site];
        for (const b of boulders) {
          const dist = Math.hypot(phys.x - b.x, rocketY - b.y);
          if (dist < b.r + 36) {
            const pushDir = phys.x >= b.x ? 1 : -1;
            phys.x = b.x + pushDir * (b.r + 38);
            phys.vx = pushDir * 140;
            phys.boulderBumps += 1;
            playCue('alert');
            for (let i = 0; i < 6; i++) {
              spawnParticle(
                phys.particles,
                phys.x,
                rocketY + 12,
                pushDir * (40 + Math.random() * 80),
                -(30 + Math.random() * 60),
                0.38,
                6,
                '#F87171',
              );
            }
          }
        }

        if (keysRef.current.thrust && phys.alt > 0.6) {
          spawnParticle(
            phys.particles,
            phys.x + (Math.random() - 0.5) * 18,
            rocketY + 34,
            (Math.random() - 0.5) * 55,
            110 + Math.random() * 80,
            0.25,
            6,
            Math.random() > 0.4 ? '#FFD66B' : '#F87171',
          );
        }

        if (phys.alt < 20 && keysRef.current.thrust) {
          for (let i = 0; i < 2; i++) {
            const dir = i % 2 === 0 ? -1 : 1;
            spawnParticle(
              phys.particles,
              phys.x + (Math.random() - 0.5) * 32,
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
          keysRef.current.thrust = false;
          setThrustingUi(false);
          if (spaceHeldRef.current) {
            blockSpaceConfirmRef.current = true;
          }

          const padCenter = SITE_PAD_X[site];
          const onPad = Math.abs(phys.x - padCenter) <= PAD_WIDTH * 0.55;
          const speed = Number(Math.max(0.3, phys.vDown).toFixed(1));
          const gentle = speed < SAFE_SPEED_LIMIT;
          const bothScanned = scanRef.current.sunlitDone && scanRef.current.craterDone;

          let grade: MiniGameGrade = 'bronze';
          if (gentle && onPad && phys.boulderBumps === 0) {
            grade = 'gold';
          } else if (gentle) {
            grade = 'silver';
          }

          const nextOutcome: TouchdownOutcome = {
            grade,
            site,
            touchdownVelocity: speed,
            gentle,
            bothScanned,
            onPad,
          };
          outcomeRef.current = nextOutcome;

          for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const spd = 70 + Math.random() * 150;
            spawnParticle(
              phys.particles,
              phys.x,
              GROUND_BASE_Y - 24,
              Math.cos(angle) * spd,
              Math.sin(angle) * spd - 60,
              0.75,
              7,
              gentle ? (i % 2 === 0 ? '#9BD8A7' : '#FFD66B') : '#F87171',
            );
          }

          playCue(gentle ? 'success' : 'alarm');
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
          if (stageRef.current === 'scan') {
            drawScanStage(ctx, scanRef.current, phys.elapsed, hoveredSiteRef.current);
          } else {
            drawDescentScene(
              ctx,
              phys,
              siteRef.current,
              keysRef.current.thrust,
              outcomeRef.current !== null,
            );
          }
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || stageRef.current !== 'scan') return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    hoveredSiteRef.current = x < CANVAS_WIDTH / 2 ? 'sunlit_ridge' : 'crater_shadow';
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;

    if (stageRef.current === 'scan') {
      triggerScanSite(x < CANVAS_WIDTH / 2 ? 'sunlit_ridge' : 'crater_shadow');
    } else if (outcomeRef.current === null) {
      // Gently steer toward clicked horizontal coordinate during descent
      if (x < physRef.current.x - 24) {
        keysRef.current.left = true;
        keysRef.current.right = false;
      } else if (x > physRef.current.x + 24) {
        keysRef.current.right = true;
        keysRef.current.left = false;
      }
    }
  };

  const handleCanvasPointerUp = () => {
    if (stageRef.current === 'descent') {
      keysRef.current.left = false;
      keysRef.current.right = false;
    }
  };

  return (
    <div
      className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col gap-2.5 bg-[#0F172A] border-2 border-[#79C8E8]/55 rounded-2xl p-3 sm:p-4 text-[#F8FAFC] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Lunar South Pole Landing"
    >
      {/* Top Bar: Title + 2-Stage Mission Arc + SKIP */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#FFD66B] p-1.5 text-[#0F172A]">
              <Rocket className="h-5 w-5" />
            </div>
            <h2 className="font-display text-base font-bold text-[#F8FAFC] sm:text-lg">
              Lunar Landing
            </h2>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#1E293B] px-2.5 py-1 text-xs font-extrabold">
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'scan'
                  ? 'bg-[#FFD66B] text-[#0F172A]'
                  : 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
              }`}
            >
              {stage === 'scan' ? '1: Site Scan' : '1: Scanned ✓'}
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'descent' && outcome === null
                  ? 'bg-[#79C8E8] text-[#0F172A]'
                  : outcome !== null
                    ? 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
                    : 'text-slate-400'
              }`}
            >
              2: 1.62 m/s² Descent
            </span>
          </div>

          <span className="font-display text-sm font-extrabold text-[#FFD66B] sm:text-base">
            {stage === 'scan'
              ? 'Scan the South Pole sites, then pick where to land!'
              : 'Steer onto the green pad and hold thrust below 3.0 m/s!'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playCue('confirm');
            onComplete('silver', selectedSite, 1.4);
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
          onPointerMove={handleCanvasPointerMove}
          onPointerLeave={() => {
            hoveredSiteRef.current = null;
          }}
          onPointerDown={handleCanvasPointerDown}
          onPointerUp={handleCanvasPointerUp}
          onPointerCancel={handleCanvasPointerUp}
          className="pixelated aspect-video max-h-full max-w-full block cursor-pointer touch-none"
        />
      </div>

      {/* Bottom Controls */}
      {stage === 'scan' ? (
        <div className="grid shrink-0 grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              scanUi.sunlitDone ? beginDescent('sunlit_ridge') : triggerScanSite('sunlit_ridge')
            }
            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 font-display text-base font-extrabold transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFD66B] ${
              scanUi.sunlitDone
                ? 'border-[#9BD8A7] bg-[#FFD66B] text-[#0F172A]'
                : 'border-[#FFD66B]/60 bg-[#1E293B] text-[#FFD66B] hover:bg-[#FFD66B]/20'
            }`}
          >
            <Radar className="h-5 w-5" />
            {scanUi.sunlitDone ? 'LAND AT SUNNY PEAK →' : 'SCAN SUNNY PEAK (kW)'}
          </button>

          <button
            type="button"
            onClick={() =>
              scanUi.craterDone ? beginDescent('crater_shadow') : triggerScanSite('crater_shadow')
            }
            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 font-display text-base font-extrabold transition-colors focus:outline-none focus:ring-2 focus:ring-[#79C8E8] ${
              scanUi.craterDone
                ? 'border-[#9BD8A7] bg-[#79C8E8] text-[#0F172A]'
                : 'border-[#79C8E8]/60 bg-[#1E293B] text-[#79C8E8] hover:bg-[#79C8E8]/20'
            }`}
          >
            <Radar className="h-5 w-5" />
            {scanUi.craterDone ? 'LAND AT CRATER RIM →' : 'SCAN CRATER RIM (ICE)'}
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-center gap-2.5">
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
            className="flex touch-none select-none items-center justify-center gap-1.5 rounded-xl border-2 border-[#79C8E8]/60 bg-[#1E293B] px-5 py-3 font-display text-base font-extrabold text-[#79C8E8] hover:bg-[#79C8E8]/20 focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
          >
            <ArrowLeft className="h-5 w-5" />
            LEFT
          </button>

          <button
            type="button"
            onPointerDown={() => {
              keysRef.current.thrust = true;
              setThrustingUi(true);
            }}
            onPointerUp={() => {
              keysRef.current.thrust = false;
              setThrustingUi(false);
            }}
            onPointerLeave={() => {
              keysRef.current.thrust = false;
              setThrustingUi(false);
            }}
            onPointerCancel={() => {
              keysRef.current.thrust = false;
              setThrustingUi(false);
            }}
            className={`flex flex-1 max-w-md touch-none select-none items-center justify-center gap-2 rounded-xl px-6 py-3 font-display text-lg font-extrabold shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-[#FFD66B] ${
              thrustingUi
                ? 'scale-[0.98] bg-[#F87171] text-[#0F172A]'
                : 'bg-[#FFD66B] text-[#0F172A] hover:brightness-95'
            }`}
          >
            <Flame className="h-5 w-5" />
            HOLD THRUST (SPACE)
          </button>

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
            className="flex touch-none select-none items-center justify-center gap-1.5 rounded-xl border-2 border-[#79C8E8]/60 bg-[#1E293B] px-5 py-3 font-display text-base font-extrabold text-[#79C8E8] hover:bg-[#79C8E8]/20 focus:outline-none focus:ring-2 focus:ring-[#79C8E8]"
          >
            RIGHT
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Visual Science Completion Card ("Science Proved!") */}
      {outcome !== null && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[#0F172A]/95 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border-2 border-[#9BD8A7]/60 bg-[#1E293B] p-5 text-center shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#9BD8A7] px-3 py-0.5 font-display text-xs font-extrabold uppercase text-[#0F172A]">
                Science Proved!
              </span>
              <span className="rounded-full bg-[#FFD66B] px-3 py-0.5 font-display text-xs font-extrabold uppercase text-[#0F172A]">
                {outcome.grade.toUpperCase()} · {outcome.touchdownVelocity.toFixed(1)} m/s
              </span>
            </div>

            <h3 className="font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
              {outcome.gentle
                ? 'SAFE TOUCHDOWN ON THE MOON!'
                : 'HARD TOUCHDOWN (>= 3.0 m/s)!'}
            </h3>

            {/* Visual Science Diagram */}
            <svg
              viewBox="0 0 560 132"
              className="w-full max-w-lg rounded-xl border border-[#79C8E8]/35 bg-[#0F172A]"
              aria-hidden="true"
            >
              <rect x="0" y="96" width="560" height="36" fill="#334155" />
              <rect x="210" y="90" width="140" height="10" rx="3" fill="#9BD8A7" />
              <text x="18" y="30" fill="#79C8E8" fontSize="14" fontWeight="700">
                1.62 m/s² Moon Gravity
              </text>
              <path d="M90 40 L90 78 M82 70 L90 78 L98 70" stroke="#79C8E8" strokeWidth="3" fill="none" />
              <rect x="262" y="34" width="36" height="36" rx="6" fill="#FFD66B" />
              <polygon points="280,14 260,34 300,34" fill="#F87171" />
              <polygon points="268,70 292,70 280,90" fill="#FFD66B" />
              <text x="366" y="34" fill="#FFD66B" fontSize="14" fontWeight="700">
                {outcome.site === 'sunlit_ridge' ? 'Sunny Peak: +kW' : 'Crater Rim: H2O + Cover'}
              </text>
              <text x="366" y="62" fill={outcome.gentle ? '#9BD8A7' : '#F87171'} fontSize="14" fontWeight="700">
                {`Touchdown: ${outcome.touchdownVelocity.toFixed(1)} m/s`}
              </text>
              <text x="366" y="84" fill="#CBD5E1" fontSize="12" fontWeight="700">
                Safe limit: &lt; 3.0 m/s (No air drag!)
              </text>
            </svg>

            <p className="max-w-lg text-sm font-bold text-slate-200">
              {outcome.gentle
                ? 'With zero air on the Moon, only retro-thrusters slow the 1.62 m/s² fall below 3.0 m/s!'
                : 'Touchdown at 3.0 m/s or faster shocks the lander legs—retry for < 3.0 m/s or continue!'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {!outcome.gentle && (
                <button
                  type="button"
                  onClick={() => beginDescent(outcome.site)}
                  className="flex items-center gap-2 rounded-xl border-2 border-[#FFD66B] bg-[#0F172A] px-6 py-3 font-display text-lg font-extrabold text-[#FFD66B] hover:bg-[#FFD66B]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD66B]"
                >
                  <RotateCcw className="h-5 w-5" />
                  RETRY LANDING
                </button>
              )}
              <button
                ref={continueBtnRef}
                type="button"
                onKeyDown={(e) => {
                  if (e.repeat || (e.code === 'Space' && blockSpaceConfirmRef.current)) {
                    e.preventDefault();
                  }
                }}
                onClick={handleConfirmWin}
                className="rounded-xl bg-[#9BD8A7] px-8 py-3 font-display text-xl font-extrabold text-[#0F172A] shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#F8FAFC]"
              >
                CONTINUE →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
