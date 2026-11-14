import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Droplets, HeartPulse, Moon, Sun, Wind } from 'lucide-react';
import type { GameState, MiniGameGrade, OnBaseCrewId } from '../../types/game';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import { playCue } from '../../services/soundEngine';

interface MedbayMiniGameProps {
  state: Readonly<GameState>;
  onComplete: (grade: MiniGameGrade) => void;
  onClose: () => void;
}

type StageId = 'scrub' | 'circadian';
type TreatmentType = 'blue_460' | 'warm_600' | 'hydrate';

interface Co2Molecule {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  scrubbed: boolean;
}

interface AirParticle {
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

interface CrewNeedStep {
  crewId: OnBaseCrewId;
  name: string;
  cueTitle: string;
  cueDetail: string;
  needed: TreatmentType;
}

interface MedbaySim {
  elapsed: number;
  molecules: Co2Molecule[];
  scrubbedCount: number;
  stageTransitionTimer: number;
  activeStepIdx: number;
  flashTreatment: TreatmentType | null;
  flashTimer: number;
  feedbackMsg: string;
  mistakes: number;
  particles: AirParticle[];
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const TARGET_SCRUB = 10;

const CIRCADIAN_STEPS: readonly CrewNeedStep[] = [
  {
    crewId: 'albaraa',
    name: 'AlBaraa',
    cueTitle: 'SOLAR SHIFT STARTING',
    cueDetail: 'Needs daytime alertness light!',
    needed: 'blue_460',
  },
  {
    crewId: 'taha',
    name: 'Taha',
    cueTitle: 'SLEEP POD READY',
    cueDetail: 'Needs cozy evening sleep spectrum!',
    needed: 'warm_600',
  },
  {
    crewId: 'yassin',
    name: 'Yassin',
    cueTitle: 'POST-ROVER THIRST',
    cueDetail: 'Dehydrated after EVA — needs water!',
    needed: 'hydrate',
  },
  {
    crewId: 'sayed',
    name: 'Sayed',
    cueTitle: 'GREENHOUSE NIGHT REST',
    cueDetail: 'Tired from tending — needs sleep light!',
    needed: 'warm_600',
  },
];

function createInitialMolecules(): Co2Molecule[] {
  return Array.from({ length: TARGET_SCRUB }, (_, idx) => ({
    id: idx + 1,
    x: 130 + ((idx * 177) % 720),
    y: 230 + ((idx * 97) % 390),
    vx: (idx % 2 === 0 ? 1 : -1) * (42 + (idx % 3) * 14),
    vy: -(38 + (idx % 4) * 12),
    radius: 34,
    scrubbed: false,
  }));
}

function createParticlePool(): AirParticle[] {
  return Array.from({ length: 76 }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0.5,
    color: '#9BD8A7',
    size: 6,
  }));
}

function spawnAirParticles(
  pool: AirParticle[],
  x: number,
  y: number,
  color: string,
  count: number,
): void {
  let spawned = 0;
  for (const p of pool) {
    if (!p.active) {
      const ang = (Math.PI * 2 * spawned) / count + Math.random() * 0.35;
      const spd = 75 + Math.random() * 145;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(ang) * spd;
      p.vy = Math.sin(ang) * spd;
      p.maxLife = 0.52;
      p.life = 0.52;
      p.color = color;
      p.size = 6;
      spawned += 1;
      if (spawned >= count) return;
    }
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, pool: AirParticle[]): void {
  for (const p of pool) {
    if (!p.active) continue;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawScrubStage(ctx: CanvasRenderingContext2D, sim: MedbaySim): void {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#091124';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const ppm = Math.max(400, 2400 - sim.scrubbedCount * 200);
  const airFreshRatio = sim.scrubbedCount / TARGET_SCRUB;

  // Ambient stale amber haze fading into crisp mint air as CO2 drops
  const hazeAlpha = Math.max(0.03, (1 - airFreshRatio) * 0.22);
  ctx.fillStyle = `rgba(245, 158, 11, ${hazeAlpha.toFixed(2)})`;
  ctx.fillRect(0, 0, 910, CANVAS_HEIGHT);

  // Top LiOH Air Scrubber Unit & Spinning Fan
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(280, 26, 380, 96);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 4;
  ctx.strokeRect(280, 26, 380, 96);

  ctx.save();
  ctx.translate(344, 74);
  ctx.rotate(sim.elapsed * 5.2);
  ctx.fillStyle = '#9BD8A7';
  ctx.fillRect(-28, -6, 56, 12);
  ctx.fillRect(-6, -28, 12, 56);
  ctx.restore();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 22px Fredoka, Nunito, sans-serif';
  ctx.fillText('LiOH CO2 SCRUBBER', 398, 68);
  ctx.fillStyle = '#9BD8A7';
  ctx.font = 'bold 17px Nunito, sans-serif';
  ctx.fillText('Click amber CO2 to turn into green O2!', 398, 98);

  // Floor vent grill where CO2 rises from
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(80, 646, 780, 52);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 646, 780, 52);

  // Floating Amber CO2 Molecules (O=C=O shape!)
  for (const m of sim.molecules) {
    if (m.scrubbed) continue;
    ctx.save();
    ctx.translate(Math.round(m.x), Math.round(m.y));

    ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, m.radius + 10, 0, Math.PI * 2);
    ctx.fill();

    // Two oxygen side atoms + center carbon
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(-20, 0, 14, 0, Math.PI * 2);
    ctx.arc(20, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F87171';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FEF3C7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CO2', 0, 6);
    ctx.restore();
  }
  ctx.textAlign = 'left';

  // Right Side Live CO2 ppm & Reflex Speed Telemetry Panel
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(920, 32, 326, 654);
  ctx.strokeStyle = ppm <= 600 ? '#9BD8A7' : '#FFD66B';
  ctx.lineWidth = 3;
  ctx.strokeRect(920, 32, 326, 654);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 24px Fredoka, Nunito, sans-serif';
  ctx.fillText('MEDBAY AIR METER', 954, 78);

  ctx.fillStyle = ppm <= 600 ? '#9BD8A7' : '#FB923C';
  ctx.font = 'bold 34px Fredoka, Nunito, sans-serif';
  ctx.fillText(`${ppm} ppm`, 954, 128);

  // Vertical CO2 column
  const barX = 964;
  const barY = 160;
  const barW = 72;
  const barH = 340;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(barX, barY, barW, barH);

  // Green bottom safe band (< 600 ppm)
  ctx.fillStyle = 'rgba(155, 216, 167, 0.25)';
  ctx.fillRect(barX, barY + barH - 70, barW, 70);

  const co2FillH = Math.round(((ppm - 200) / 2400) * barH);
  ctx.fillStyle = ppm <= 600 ? '#9BD8A7' : ppm <= 1200 ? '#FFD66B' : '#FB923C';
  ctx.fillRect(barX + 8, barY + barH - co2FillH, barW - 16, co2FillH);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barW, barH);

  // Labels next to column
  ctx.fillStyle = '#FB923C';
  ctx.font = 'bold 16px Nunito, sans-serif';
  ctx.fillText('2400 ppm', 1054, 182);
  ctx.fillText('Sleepy Air', 1054, 204);

  ctx.fillStyle = '#9BD8A7';
  ctx.fillText('400 ppm', 1054, 466);
  ctx.fillText('Fresh O2 ✓', 1054, 488);

  // Crew Reflex Indicator
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(952, 536, 264, 118);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 2;
  ctx.strokeRect(952, 536, 264, 118);
  ctx.fillStyle = '#79C8E8';
  ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
  ctx.fillText('CREW REFLEXES:', 972, 570);
  ctx.fillStyle = ppm <= 600 ? '#9BD8A7' : ppm <= 1400 ? '#FFD66B' : '#F87171';
  ctx.font = 'bold 26px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    ppm <= 600 ? 'SHARP & READY!' : ppm <= 1400 ? 'RECOVERING...' : 'SLOW & SLEEPY',
    972,
    612,
  );

  drawParticles(ctx, sim.particles);
}

function drawCircadianStage(ctx: CanvasRenderingContext2D, sim: MedbaySim): void {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#091124';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const step = CIRCADIAN_STEPS[sim.activeStepIdx] ?? CIRCADIAN_STEPS[0]!;
  const activeColor =
    sim.flashTimer > 0 && sim.flashTreatment
      ? sim.flashTreatment === 'blue_460'
        ? '#38BDF8'
        : sim.flashTreatment === 'warm_600'
          ? '#FBBF24'
          : '#79C8E8'
      : step.needed === 'blue_460'
        ? '#38BDF8'
        : step.needed === 'warm_600'
          ? '#FBBF24'
          : '#79C8E8';

  // Top SSLA Light Spectrum Sine Wave Display
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(60, 26, 1160, 178);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 26, 1160, 178);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 22px Fredoka, Nunito, sans-serif';
  ctx.fillText('NASA ISS SOLID-STATE LIGHTING (SSLA) BODY CLOCK SPECTRUM', 90, 62);

  // Draw 460nm short blue wave on left vs 600nm warm long wave on right
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#38BDF8';
  ctx.beginPath();
  for (let x = 90; x <= 570; x += 6) {
    const y = 132 + Math.sin((x - 90) * 0.085 - sim.elapsed * 6) * 28;
    if (x === 90) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
  ctx.fillText('460 nm BLUE WAVE = WAKE & ALERT', 140, 186);

  ctx.strokeStyle = '#FBBF24';
  ctx.beginPath();
  for (let x = 670; x <= 1180; x += 6) {
    const y = 132 + Math.sin((x - 670) * 0.042 - sim.elapsed * 3.5) * 28;
    if (x === 670) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#FBBF24';
  ctx.fillText('600 nm WARM AMBER = CALM & SLEEP', 735, 186);

  // Active Crew Treatment Stage Card in Center
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(140, 232, 1000, 392);
  ctx.strokeStyle = activeColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(140, 232, 1000, 392);

  // Overhead SSLA Light Cone shining down on the astronaut pod
  if (sim.flashTimer > 0) {
    const coneGrad = ctx.createLinearGradient(640, 240, 640, 590);
    coneGrad.addColorStop(0, activeColor);
    coneGrad.addColorStop(1, 'rgba(15, 23, 42, 0.05)');
    ctx.fillStyle = coneGrad;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(520, 240);
    ctx.lineTo(760, 240);
    ctx.lineTo(880, 600);
    ctx.lineTo(400, 600);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Astronaut Checkup Pod Progress Pips
  for (let i = 0; i < CIRCADIAN_STEPS.length; i++) {
    const st = CIRCADIAN_STEPS[i]!;
    const px = 210 + i * 225;
    const py = 266;
    const isDone = i < sim.activeStepIdx;
    const isCur = i === sim.activeStepIdx;
    ctx.fillStyle = isDone ? '#9BD8A7' : isCur ? '#FFD66B' : '#0F172A';
    ctx.fillRect(px, py, 190, 44);
    ctx.strokeStyle = isCur ? '#F8FAFC' : '#475569';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(px, py, 190, 44);
    ctx.fillStyle = isDone || isCur ? '#0F172A' : '#94A3B8';
    ctx.font = 'bold 18px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isDone ? `${st.name} ✓` : st.name, px + 95, py + 28);
  }

  // Big clear cue for active crew member
  ctx.fillStyle = '#FFD66B';
  ctx.font = 'bold 34px Fredoka, Nunito, sans-serif';
  ctx.fillText(`${step.name}: ${step.cueTitle}`, 640, 396);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 26px Nunito, sans-serif';
  ctx.fillText(step.cueDetail, 640, 446);

  // Visual icon hint for what body clock needs
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(340, 482, 600, 62);
  ctx.strokeStyle = activeColor;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(340, 482, 600, 62);
  ctx.fillStyle = sim.feedbackMsg.startsWith('Try') ? '#F87171' : '#9BD8A7';
  ctx.font = 'bold 22px Fredoka, Nunito, sans-serif';
  ctx.fillText(
    sim.feedbackMsg || 'Pick the matching Light Spectrum or H2O below!',
    640,
    521,
  );
  ctx.textAlign = 'left';

  drawParticles(ctx, sim.particles);
}

export const MedbayMiniGame: React.FC<MedbayMiniGameProps> = ({
  state: _state,
  onComplete,
  onClose,
}) => {
  const [stage, setStage] = useState<StageId>('scrub');
  const [scrubbedUi, setScrubbedUi] = useState<number>(0);
  const [stepIdxUi, setStepIdxUi] = useState<number>(0);
  const [won, setWon] = useState<boolean>(false);
  const [earnedGrade, setEarnedGrade] = useState<MiniGameGrade>('gold');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<StageId>('scrub');
  const wonRef = useRef<boolean>(false);
  const lastSfxRef = useRef<number>(0);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  const simRef = useRef<MedbaySim>({
    elapsed: 0,
    molecules: createInitialMolecules(),
    scrubbedCount: 0,
    stageTransitionTimer: 0,
    activeStepIdx: 0,
    flashTreatment: null,
    flashTimer: 0,
    feedbackMsg: '',
    mistakes: 0,
    particles: createParticlePool(),
  });

  useEffect(() => {
    if (won) {
      continueBtnRef.current?.focus();
    }
  }, [won]);

  const scrubNextMolecule = useCallback(() => {
    const sim = simRef.current;
    const target = sim.molecules.find((m) => !m.scrubbed);
    if (!target) return;
    target.scrubbed = true;
    sim.scrubbedCount += 1;
    spawnAirParticles(sim.particles, target.x, target.y, '#9BD8A7', 16);
    playCue('co2_hiss');
    setScrubbedUi(sim.scrubbedCount);
    if (sim.scrubbedCount >= TARGET_SCRUB) {
      sim.stageTransitionTimer = 0.85;
      playCue('confirm');
    }
  }, []);

  const applyTreatment = useCallback((choice: TreatmentType) => {
    if (wonRef.current || stageRef.current !== 'circadian') return;
    const sim = simRef.current;
    const current = CIRCADIAN_STEPS[sim.activeStepIdx];
    if (!current) return;

    if (choice === current.needed) {
      sim.flashTreatment = choice;
      sim.flashTimer = 0.7;
      sim.feedbackMsg = `${current.name} synced!`;
      spawnAirParticles(
        sim.particles,
        640,
        410,
        choice === 'blue_460' ? '#38BDF8' : choice === 'warm_600' ? '#FBBF24' : '#79C8E8',
        20,
      );
      playCue(choice === 'hydrate' ? 'water_flow' : 'crew_cheer');

      const nextIdx = sim.activeStepIdx + 1;
      if (nextIdx >= CIRCADIAN_STEPS.length) {
        wonRef.current = true;
        const grade: MiniGameGrade = sim.mistakes <= 1 ? 'gold' : 'silver';
        setEarnedGrade(grade);
        setStepIdxUi(CIRCADIAN_STEPS.length);
        playCue('success');
        setWon(true);
      } else {
        sim.activeStepIdx = nextIdx;
        setStepIdxUi(nextIdx);
      }
    } else {
      sim.mistakes += 1;
      playCue('alert');
      if (current.needed === 'blue_460') {
        sim.feedbackMsg = 'Try 460 nm Blue Light to wake up for shift!';
      } else if (current.needed === 'warm_600') {
        sim.feedbackMsg = 'Try 600 nm Warm Light to help sleep!';
      } else {
        sim.feedbackMsg = 'Try Hydrate Water for thirsty EVA crew!';
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
      if (wonRef.current) return;
      if (stageRef.current === 'scrub' && e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        scrubNextMolecule();
      } else if (stageRef.current === 'circadian') {
        if (e.key === '1') applyTreatment('blue_460');
        else if (e.key === '2') applyTreatment('warm_600');
        else if (e.key === '3') applyTreatment('hydrate');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [applyTreatment, onClose, scrubNextMolecule]);

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
        if (stageRef.current === 'scrub') {
          for (const m of sim.molecules) {
            if (m.scrubbed) continue;
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            if (m.x < 120 || m.x > 840) m.vx *= -1;
            if (m.y < 170) m.y = 610;
            if (m.y > 620) m.y = 180;
          }

          if (sim.scrubbedCount >= TARGET_SCRUB) {
            sim.stageTransitionTimer -= dt;
            if (sim.stageTransitionTimer <= 0) {
              stageRef.current = 'circadian';
              setStage('circadian');
              playCue('confirm');
            }
          }
        } else if (sim.flashTimer > 0) {
          sim.flashTimer = Math.max(0, sim.flashTimer - dt);
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
          if (stageRef.current === 'scrub') {
            drawScrubStage(ctx, sim);
          } else {
            drawCircadianStage(ctx, sim);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleCanvasPointer = (clientX: number, clientY: number) => {
    if (wonRef.current || stageRef.current !== 'scrub') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const py = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    const sim = simRef.current;

    for (const m of sim.molecules) {
      if (!m.scrubbed && Math.hypot(px - m.x, py - m.y) <= 64) {
        m.scrubbed = true;
        sim.scrubbedCount += 1;
        spawnAirParticles(sim.particles, m.x, m.y, '#9BD8A7', 16);
        const now = performance.now();
        if (now - lastSfxRef.current > 120) {
          playCue('co2_hiss');
          lastSfxRef.current = now;
        }
        setScrubbedUi(sim.scrubbedCount);
        if (sim.scrubbedCount >= TARGET_SCRUB) {
          sim.stageTransitionTimer = 0.85;
          playCue('confirm');
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
      aria-label="Medbay Air & Body Clock Checkup"
    >
      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#9BD8A7] p-1.5 text-[#0F172A]">
              <HeartPulse className="h-5 w-5" />
            </div>
            <h2 className="font-display text-base font-bold text-[#F8FAFC] sm:text-lg">
              Medbay Checkup
            </h2>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#1E293B] px-2.5 py-1 text-xs font-extrabold">
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'scrub'
                  ? 'bg-[#FFD66B] text-[#0F172A]'
                  : 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
              }`}
            >
              {stage === 'scrub' ? '1: Scrub CO2 → O2' : '1: Fresh O2 ✓'}
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={`rounded-lg px-2 py-0.5 ${
                stage === 'circadian' && !won
                  ? 'bg-[#79C8E8] text-[#0F172A]'
                  : won
                    ? 'bg-[#9BD8A7]/25 text-[#9BD8A7]'
                    : 'text-slate-400'
              }`}
            >
              2: Circadian Clocks &amp; H2O
            </span>
          </div>

          <span className="font-display text-sm font-extrabold text-[#9BD8A7] sm:text-base">
            {stage === 'scrub'
              ? 'Click amber CO2 molecules to scrub fresh O2!'
              : 'Match 460 nm Blue (Alert), 600 nm Warm (Sleep), or Hydrate Water!'}
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
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-[#79C8E8]/35 bg-[#091124]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={(e) => handleCanvasPointer(e.clientX, e.clientY)}
          onPointerMove={(e) => {
            if (e.buttons > 0 && stageRef.current === 'scrub') {
              handleCanvasPointer(e.clientX, e.clientY);
            }
          }}
          className="pixelated aspect-video max-h-full max-w-full block cursor-pointer touch-none"
        />
      </div>

      {/* Bottom Controls */}
      {stage === 'scrub' ? (
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="rounded-xl bg-[#1E293B] px-4 py-2.5 font-display text-sm font-extrabold text-[#FB923C] sm:text-base">
            CO2 Scrubbed: {scrubbedUi} / {TARGET_SCRUB}
          </div>
          <button
            type="button"
            onClick={scrubNextMolecule}
            className="flex flex-1 max-w-md items-center justify-center gap-2 rounded-xl bg-[#9BD8A7] px-6 py-2.5 font-display text-base font-extrabold text-[#0F172A] shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#FFD66B]"
          >
            <Wind className="h-5 w-5" />
            SCRUB CO2 TO O2 (SPACE)
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-between gap-2.5">
          {/* Compact Crew Avatar Strip */}
          <div className="hidden items-center gap-1.5 rounded-xl bg-[#1E293B] px-2.5 py-1 md:flex">
            {CIRCADIAN_STEPS.map((st, idx) => {
              const done = idx < stepIdxUi;
              const active = idx === stepIdxUi;
              return (
                <div
                  key={st.crewId}
                  className={`rounded-lg border p-0.5 ${
                    done
                      ? 'border-[#9BD8A7] bg-[#9BD8A7]/15'
                      : active
                        ? 'border-[#FFD66B] bg-[#FFD66B]/15'
                        : 'border-slate-700 opacity-60'
                  }`}
                >
                  <CrewAvatar
                    crewId={st.crewId}
                    expression={done ? 'happy' : active ? 'concerned' : 'normal'}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="grid flex-1 grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyTreatment('blue_460')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#38BDF8] px-3 py-2.5 font-display text-sm font-extrabold text-[#0F172A] shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#F8FAFC] sm:text-base"
            >
              <Sun className="h-4 w-4" />
              460 nm Blue Alert
            </button>

            <button
              type="button"
              onClick={() => applyTreatment('warm_600')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#FBBF24] px-3 py-2.5 font-display text-sm font-extrabold text-[#0F172A] shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#F8FAFC] sm:text-base"
            >
              <Moon className="h-4 w-4" />
              600 nm Warm Rest
            </button>

            <button
              type="button"
              onClick={() => applyTreatment('hydrate')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#9BD8A7] px-3 py-2.5 font-display text-sm font-extrabold text-[#0F172A] shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#F8FAFC] sm:text-base"
            >
              <Droplets className="h-4 w-4" />
              Hydrate Water
            </button>
          </div>
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
                {earnedGrade.toUpperCase()} · O2 + SSLA SYNCED
              </span>
            </div>

            <h3 className="font-display text-2xl font-extrabold text-[#F8FAFC] sm:text-3xl">
              FRESH AIR &amp; BODY CLOCKS RESTORED!
            </h3>

            <svg
              viewBox="0 0 560 132"
              className="w-full max-w-lg rounded-xl border border-[#79C8E8]/35 bg-[#0F172A]"
              aria-hidden="true"
            >
              <circle cx="64" cy="64" r="24" fill="#FB923C" fillOpacity="0.35" stroke="#FB923C" strokeWidth="2" />
              <text x="64" y="69" textAnchor="middle" fill="#FFD66B" fontSize="13" fontWeight="700">
                CO2
              </text>
              <path d="M96 64 L138 64 M130 57 L138 64 L130 71" stroke="#9BD8A7" strokeWidth="3" fill="none" />
              <circle cx="170" cy="64" r="24" fill="#9BD8A7" fillOpacity="0.28" stroke="#9BD8A7" strokeWidth="2" />
              <text x="170" y="69" textAnchor="middle" fill="#9BD8A7" fontSize="13" fontWeight="700">
                O2 ✓
              </text>

              <line x1="220" y1="20" x2="220" y2="112" stroke="#334155" strokeWidth="2" />

              <path d="M245 48 Q265 24 285 48 T325 48 T365 48" stroke="#38BDF8" strokeWidth="3" fill="none" />
              <text x="305" y="72" textAnchor="middle" fill="#38BDF8" fontSize="12" fontWeight="700">
                460 nm Alert
              </text>

              <path d="M400 48 Q435 24 470 48 T535 48" stroke="#FBBF24" strokeWidth="3" fill="none" />
              <text x="468" y="72" textAnchor="middle" fill="#FBBF24" fontSize="12" fontWeight="700">
                600 nm Rest
              </text>
              <text x="390" y="108" textAnchor="middle" fill="#79C8E8" fontSize="12" fontWeight="700">
                Clean O2 + Light Wavelengths + H2O = Sharp Crew!
              </text>
            </svg>

            <p className="max-w-lg text-sm font-bold text-slate-200">
              Scrubbing CO2 keeps astronaut reflexes sharp, while 460 nm blue light and 600 nm warm light tune space body clocks!
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
