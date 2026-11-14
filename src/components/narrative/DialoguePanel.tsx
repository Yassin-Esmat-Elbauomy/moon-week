import React, { useEffect } from 'react';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import { CREW_PROFILES, getCrewDialogueForPhase } from '../../data/crewProfiles';
import { DAILY_SCENARIOS, getDynamicStoryRipple } from '../../data/dailyScenarios';
import { VERIFIED_NASA_DATASETS } from '../../data/nasaVerifiedData';
import * as soundEngine from '../../services/soundEngine';
import type { CrewId, DayNumber, GameState, MiniGameId } from '../../types/game';

export interface DialoguePanelProps {
  state: Readonly<GameState>;
  crewId: CrewId;
  onClose: () => void;
  onStartMiniGame?: () => void;
  missionPhase?: 'morning' | 'midday';
  onOpenMiniGame?: (miniGame: MiniGameId) => void;
  onOpenDecisions?: () => void;
}

interface ScienceVisualizerProps {
  day: DayNumber;
  phase: 'morning' | 'midday';
}

const ScienceVisualizerSvg: React.FC<ScienceVisualizerProps> = ({ day, phase }) => {
  const isMidday = phase === 'midday';

  switch (day) {
    case 1:
      return (
        <svg
          viewBox="0 0 340 176"
          className="w-full h-auto block rounded-xl bg-[#090D16] border border-slate-700/80"
          role="img"
          aria-label="Day 1 Lunar Descent Physics Diagram"
        >
          {/* Starfield & Earth */}
          <circle cx="28" cy="24" r="1.5" fill="#F8FAFC" opacity="0.8" />
          <circle cx="95" cy="18" r="1.2" fill="#79C8E8" opacity="0.7" />
          <circle cx="220" cy="22" r="1.5" fill="#F8FAFC" opacity="0.7" />
          <circle cx="48" cy="40" r="13" fill="#2563EB" />
          <path d="M41 35 h8 v5 h-4 v4 h-4 z" fill="#9BD8A7" />
          <text x="48" y="64" textAnchor="middle" fill="#79C8E8" fontSize="9" fontWeight="bold">
            Earth (2.6s)
          </text>

          {/* 1.3s/2.6s Radio Wave Arc */}
          <path
            d="M66 40 Q135 16 196 42"
            fill="none"
            stroke="#79C8E8"
            strokeWidth="2"
            strokeDasharray="5 4"
          >
            <animate attributeName="stroke-dashoffset" values="18;0" dur="1.3s" repeatCount="indefinite" />
          </path>
          <text x="132" y="21" textAnchor="middle" fill="#FFD66B" fontSize="9" fontWeight="bold">
            1.3s radio pulse →
          </text>

          {/* Moon Terrain: Sunlit Peak vs Crater Rim */}
          <path d="M0 152 L90 138 L155 150 L235 158 L280 132 L340 138 L340 176 L0 176 Z" fill="#334155" />
          <path d="M265 136 L295 160 L330 138 Z" fill="#0F172A" />
          <text x="58" y="166" textAnchor="middle" fill="#FFD66B" fontSize="9" fontWeight="bold">
            Sunlit Peak (+kW)
          </text>
          <text x="292" y="169" textAnchor="middle" fill="#79C8E8" fontSize="9" fontWeight="bold">
            -200°C Ice Rim
          </text>

          {/* Animated Lander + Thruster Plume */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={isMidday ? '0,10;0,10' : '0,-10;0,8;0,-10'}
              dur="2.8s"
              repeatCount="indefinite"
            />
            <polygon points="185,104 195,126 175,126" fill="#FFD66B" opacity="0.9">
              <animate attributeName="opacity" values="0.95;0.45;0.95" dur="0.35s" repeatCount="indefinite" />
            </polygon>
            <rect x="172" y="72" width="26" height="24" rx="4" fill="#E2E8F0" stroke="#79C8E8" strokeWidth="2" />
            <polygon points="175,72 185,58 195,72" fill="#FFD66B" />
            <line x1="173" y1="96" x2="165" y2="108" stroke="#94A3B8" strokeWidth="2.5" />
            <line x1="197" y1="96" x2="205" y2="108" stroke="#94A3B8" strokeWidth="2.5" />
          </g>

          {/* Gravity & Speed Limit Readout */}
          <rect x="220" y="54" width="108" height="58" rx="8" fill="#1E293B" stroke={isMidday ? '#F87171' : '#9BD8A7'} strokeWidth="1.5" />
          <text x="274" y="70" textAnchor="middle" fill="#F8FAFC" fontSize="9" fontWeight="bold">
            {isMidday ? 'GYRO TILT ALERT' : 'Gravity: 1.62 m/s²'}
          </text>
          <text x="274" y="86" textAnchor="middle" fill={isMidday ? '#F87171' : '#9BD8A7'} fontSize="11" fontWeight="bold">
            {isMidday ? 'Level Sensor!' : 'Safe < 3.0 m/s'}
          </text>
          <text x="274" y="102" textAnchor="middle" fill="#94A3B8" fontSize="8.5">
            {isMidday ? 'Control Room' : '>= 3.0 m/s = -10 Shield'}
          </text>
        </svg>
      );

    case 2:
      return (
        <svg
          viewBox="0 0 340 176"
          className="w-full h-auto block rounded-xl bg-[#090D16] border border-slate-700/80"
          role="img"
          aria-label="Day 2 Lunar Greenhouse Water Physics Diagram"
        >
          {/* Left Box: 1/6g Floating Water Blanket */}
          <rect x="12" y="16" width="148" height="144" rx="10" fill="#11192E" stroke="#F87171" strokeWidth="1.5" />
          <text x="86" y="34" textAnchor="middle" fill="#F87171" fontSize="10" fontWeight="bold">
            1/6g Floating Water
          </text>
          <path d="M86 58 v34 m0 -20 l-14 14 m14 -8 l14 12" stroke="#9BD8A7" strokeWidth="3" fill="none" />
          <circle cx="86" cy="96" r="22" fill="#38BDF8" opacity="0.45">
            <animate attributeName="r" values="20;24;20" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="66" cy="70" r="6" fill="#79C8E8">
            <animate attributeName="cy" values="70;60;70" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="110" cy="74" r="5" fill="#79C8E8">
            <animate attributeName="cy" values="74;84;74" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="86" y="142" textAnchor="middle" fill="#FCA5A5" fontSize="9" fontWeight="bold">
            {isMidday ? 'Air Bubble Block!' : 'Water Chokes Roots'}
          </text>

          {/* Right Box: Capillary PONDS vs Active Pumps */}
          <rect x="180" y="16" width="148" height="144" rx="10" fill="#11192E" stroke="#9BD8A7" strokeWidth="1.5" />
          <text x="254" y="34" textAnchor="middle" fill="#9BD8A7" fontSize="10" fontWeight="bold">
            {isMidday ? 'Bleed Pipe Valve' : 'PONDS Capillary Wick'}
          </text>
          <rect x="234" y="76" width="40" height="52" rx="6" fill="#1E293B" stroke="#79C8E8" strokeWidth="1.5" />
          <rect x="242" y="110" width="24" height="14" fill="#38BDF8" opacity="0.8" />
          {/* Rising capillary droplets */}
          <circle cx="250" cy="112" r="3" fill="#79C8E8">
            <animate attributeName="cy" values="114;80;114" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="258" cy="108" r="3" fill={isMidday ? '#FFD66B' : '#79C8E8'}>
            <animate attributeName="cy" values="112;78;112" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <path d="M254 76 v-22 m0 10 l-12 -10 m12 10 l12 -10" stroke="#9BD8A7" strokeWidth="3.5" fill="none" />
          <text x="254" y="146" textAnchor="middle" fill="#9BD8A7" fontSize="9" fontWeight="bold">
            {isMidday ? 'Clear Trapped Gas' : '0 kW Wick vs -8 kW Pump'}
          </text>
        </svg>
      );

    case 3:
      return (
        <svg
          viewBox="0 0 340 176"
          className="w-full h-auto block rounded-xl bg-[#090D16] border border-slate-700/80"
          role="img"
          aria-label="Day 3 Lunar Dust & Power Grid Diagram"
        >
          {/* Sunlight rays */}
          <circle cx="44" cy="36" r="18" fill="#FFD66B" />
          <line x1="66" y1="42" x2="132" y2="74" stroke="#FFD66B" strokeWidth="2.5" strokeDasharray="5 4">
            <animate attributeName="stroke-dashoffset" values="18;0" dur="1s" repeatCount="indefinite" />
          </line>

          {/* Solar Array with Electrostatic Dust */}
          <polygon points="82,92 190,72 206,112 98,132" fill="#1E3A8A" stroke="#79C8E8" strokeWidth="2" />
          <line x1="115" y1="86" x2="131" y2="126" stroke="#79C8E8" strokeWidth="1" opacity="0.6" />
          <line x1="150" y1="80" x2="166" y2="120" stroke="#79C8E8" strokeWidth="1" opacity="0.6" />
          {/* Orange Dust Grains */}
          <circle cx="118" cy="100" r="4" fill="#F97316">
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="148" cy="96" r="5" fill="#FB923C">
            <animate attributeName="cy" values="92;100;92" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="172" cy="102" r="4" fill="#F97316" />

          {/* Sparks if Midday */}
          {isMidday ? (
            <path d="M188 86 l10 -12 l-4 14 l12 -4" stroke="#FFD66B" strokeWidth="2.5" fill="none">
              <animate attributeName="opacity" values="1;0.1;1" dur="0.45s" repeatCount="indefinite" />
            </path>
          ) : null}

          {/* kW Load & Cold Shadow Meter */}
          <rect x="220" y="20" width="108" height="136" rx="10" fill="#11192E" stroke={isMidday ? '#F87171' : '#FFD66B'} strokeWidth="1.5" />
          <text x="274" y="40" textAnchor="middle" fill="#FFD66B" fontSize="10" fontWeight="bold">
            {isMidday ? 'BUS SURGE ALERT' : 'Dust Cuts Solar kW'}
          </text>
          <rect x="234" y="54" width="80" height="14" rx="4" fill="#1E293B" />
          <rect x="234" y="54" width="44" height="14" rx="4" fill={isMidday ? '#F87171' : '#FFD66B'}>
            <animate attributeName="width" values={isMidday ? '76;36;76' : '40;64;40'} dur="1.8s" repeatCount="indefinite" />
          </rect>
          <text x="274" y="88" textAnchor="middle" fill="#79C8E8" fontSize="10" fontWeight="bold">
            Shadow: -160°C
          </text>
          <text x="274" y="108" textAnchor="middle" fill="#F8FAFC" fontSize="9">
            Heaters vs Battery
          </text>
          <text x="274" y="126" textAnchor="middle" fill="#9BD8A7" fontSize="8.5" fontWeight="bold">
            Save kW for Sol 4 Storm!
          </text>
          <text x="274" y="146" textAnchor="middle" fill="#FCA5A5" fontSize="8.5">
            Avoid 25% Pump Stall
          </text>
        </svg>
      );

    case 4:
      return (
        <svg
          viewBox="0 0 340 176"
          className="w-full h-auto block rounded-xl bg-[#090D16] border border-slate-700/80"
          role="img"
          aria-label="Day 4 X-Class Solar Flare vs Water Wall mSv Diagram"
        >
          {/* Sun & X-Class Flare */}
          <circle cx="28" cy="88" r="24" fill="#F59E0B" />
          <circle cx="28" cy="88" r="28" fill="none" stroke="#F472B6" strokeWidth="2" opacity="0.7">
            <animate attributeName="r" values="26;35;26" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <text x="34" y="132" textAnchor="middle" fill="#FFD66B" fontSize="9" fontWeight="bold">
            X8.7 Flare
          </text>

          {/* Animated Proton Wave */}
          <path d="M58 58 Q96 42 134 58" stroke="#F472B6" strokeWidth="2.5" fill="none" strokeDasharray="6 4">
            <animate attributeName="stroke-dashoffset" values="20;0" dur="0.7s" repeatCount="indefinite" />
          </path>
          <path d="M58 88 Q98 72 138 88" stroke="#FFD66B" strokeWidth="2.5" fill="none" strokeDasharray="6 4">
            <animate attributeName="stroke-dashoffset" values="20;0" dur="0.55s" repeatCount="indefinite" />
          </path>
          <path d="M58 118 Q96 102 134 118" stroke="#F472B6" strokeWidth="2.5" fill="none" strokeDasharray="6 4">
            <animate attributeName="stroke-dashoffset" values="20;0" dur="0.8s" repeatCount="indefinite" />
          </path>

          {/* Cyan H2O Water-Wall Shield */}
          <path d="M154 30 Q180 88 154 146" fill="none" stroke="#38BDF8" strokeWidth="10" opacity="0.85">
            <animate attributeName="opacity" values="0.95;0.55;0.95" dur="1.5s" repeatCount="indefinite" />
          </path>
          <text x="158" y="20" textAnchor="middle" fill="#79C8E8" fontSize="9.5" fontWeight="bold">
            H2O Water Wall
          </text>

          {/* Protected Habitat & Dose Comparison */}
          <rect x="192" y="34" width="136" height="114" rx="12" fill="#1E293B" stroke={isMidday ? '#F87171' : '#9BD8A7'} strokeWidth="2" />
          <text x="260" y="56" textAnchor="middle" fill="#F8FAFC" fontSize="10" fontWeight="bold">
            {isMidday ? 'RADLAB SENSOR DRIFT' : 'External Flux != Dose'}
          </text>
          <rect x="206" y="68" width="108" height="24" rx="6" fill="#090D16" />
          <text x="260" y="84" textAnchor="middle" fill="#F472B6" fontSize="9.5" fontWeight="bold">
            Outside: &gt;1,400 km/s CME
          </text>
          <rect x="206" y="98" width="108" height="24" rx="6" fill="#090D16" />
          <text x="260" y="114" textAnchor="middle" fill="#9BD8A7" fontSize="9.5" fontWeight="bold">
            Inside: Safe mSv!
          </text>
          <text x="260" y="138" textAnchor="middle" fill="#FFD66B" fontSize="8.5">
            {isMidday ? 'Filter False Alarms!' : 'Shield Surge: -25 Power'}
          </text>
        </svg>
      );

    case 5:
      return (
        <svg
          viewBox="0 0 340 176"
          className="w-full h-auto block rounded-xl bg-[#090D16] border border-slate-700/80"
          role="img"
          aria-label="Day 5 CO2 Scrubbing & Circadian Spectrum Diagram"
        >
          {/* Left: CO2 ppm to Clean O2 Scrubber */}
          <rect x="12" y="16" width="150" height="144" rx="10" fill="#11192E" stroke={isMidday ? '#F87171' : '#9BD8A7'} strokeWidth="1.5" />
          <text x="87" y="34" textAnchor="middle" fill={isMidday ? '#F87171' : '#FFD66B'} fontSize="10" fontWeight="bold">
            {isMidday ? 'CLOGGED SCRUBBER' : 'CO2 ppm → Clean O2'}
          </text>
          <circle cx="46" cy="70" r="8" fill="#F59E0B" opacity="0.85">
            <animate attributeName="cx" values="40;76;40" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <text x="46" y="73" textAnchor="middle" fill="#090D16" fontSize="7" fontWeight="bold">
            CO2
          </text>
          <rect x="82" y="54" width="14" height="58" rx="3" fill={isMidday ? '#F87171' : '#9BD8A7'} />
          <circle cx="128" cy="82" r="8" fill="#9BD8A7">
            <animate attributeName="cx" values="108;138;108" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <text x="128" y="85" textAnchor="middle" fill="#090D16" fontSize="8" fontWeight="bold">
            O2
          </text>
          <text x="87" y="138" textAnchor="middle" fill="#E2E8F0" fontSize="9" fontWeight="bold">
            Target &lt; 1,000 CO2 ppm
          </text>

          {/* Right: 460nm vs 600nm Circadian Waves */}
          <rect x="178" y="16" width="150" height="144" rx="10" fill="#11192E" stroke="#79C8E8" strokeWidth="1.5" />
          <text x="253" y="34" textAnchor="middle" fill="#79C8E8" fontSize="10" fontWeight="bold">
            Circadian Body Clock
          </text>
          <path d="M192 66 Q212 46 232 66 T272 66 T312 66" fill="none" stroke="#38BDF8" strokeWidth="3">
            <animate attributeName="opacity" values="1;0.45;1" dur="1.6s" repeatCount="indefinite" />
          </path>
          <text x="253" y="86" textAnchor="middle" fill="#79C8E8" fontSize="9" fontWeight="bold">
            460 nm Blue = Alert Focus
          </text>
          <path d="M192 112 Q222 98 252 112 T312 112" fill="none" stroke="#F59E0B" strokeWidth="3">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </path>
          <text x="253" y="134" textAnchor="middle" fill="#FFD66B" fontSize="9" fontWeight="bold">
            600 nm Amber = Deep Rest
          </text>
        </svg>
      );

    case 6:
      return (
        <svg
          viewBox="0 0 340 176"
          className="w-full h-auto block rounded-xl bg-[#090D16] border border-slate-700/80"
          role="img"
          aria-label="Day 6 Moon Rover -200C Shadow & S-Band Dish Diagram"
        >
          {/* Crater shadow zone */}
          <ellipse cx="185" cy="144" rx="68" ry="20" fill="#020617" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="185" y="148" textAnchor="middle" fill="#79C8E8" fontSize="9.5" fontWeight="bold">
            -200°C Frost Shadow (Wheel Freeze!)
          </text>

          {/* Rocky Ridge & S-Band Relay Dish */}
          <polygon points="240,140 278,86 330,140" fill="#334155" />
          <line x1="278" y1="86" x2="278" y2="66" stroke="#E2E8F0" strokeWidth="3" />
          <path d="M266 64 Q278 76 290 64" fill="none" stroke="#79C8E8" strokeWidth="3" />
          <path d="M262 52 Q278 40 294 52" fill="none" stroke="#FFD66B" strokeWidth="2">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.1s" repeatCount="indefinite" />
          </path>
          <text x="278" y="34" textAnchor="middle" fill="#FFD66B" fontSize="9" fontWeight="bold">
            S-Band Dish Beam
          </text>

          {/* Animated Rover */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0;28,0;0,0"
              dur="3.4s"
              repeatCount="indefinite"
            />
            <rect x="38" y="102" width="46" height="22" rx="5" fill="#E2E8F0" stroke={isMidday ? '#F87171' : '#A995E8'} strokeWidth="2" />
            <rect x="46" y="90" width="22" height="12" rx="3" fill="#FFD66B" />
            <circle cx="46" cy="128" r="8" fill="#1E293B" stroke="#79C8E8" strokeWidth="2.5" />
            <circle cx="76" cy="128" r="8" fill="#1E293B" stroke="#79C8E8" strokeWidth="2.5" />
          </g>
          <text x="72" y="156" textAnchor="middle" fill="#A995E8" fontSize="9" fontWeight="bold">
            {isMidday ? 'Wipe Dusty Seal!' : 'Drill Ice vs Fix Relay'}
          </text>
        </svg>
      );

    case 7:
      return (
        <svg
          viewBox="0 0 340 176"
          className="w-full h-auto block rounded-xl bg-[#090D16] border border-[#F87171]/60"
          role="img"
          aria-label="Day 7 Solar Radio Static Blackout Diagram"
        >
          {/* Earth Icon */}
          <circle cx="44" cy="54" r="18" fill="#2563EB" opacity="0.7" />
          <text x="44" y="84" textAnchor="middle" fill="#79C8E8" fontSize="9" fontWeight="bold">
            Earth (Lost)
          </text>

          {/* Static Burst Waveform */}
          <path
            d="M72 54 L90 36 L104 72 L120 26 L138 78 L156 28 L172 74 L190 34 L208 68 L224 44 L244 54"
            fill="none"
            stroke="#F87171"
            strokeWidth="3"
          >
            <animate attributeName="opacity" values="1;0.35;1" dur="0.45s" repeatCount="indefinite" />
          </path>
          <text x="158" y="20" textAnchor="middle" fill="#F87171" fontSize="10" fontWeight="bold">
            {isMidday ? 'COMMS BLACKOUT ACTIVE' : 'SOLAR RADIO BURST STATIC'}
          </text>

          {/* Moon Base Dish */}
          <circle cx="288" cy="54" r="18" fill="#475569" />
          <path d="M276 50 Q288 64 300 50" fill="none" stroke="#FFD66B" strokeWidth="2.5" />
          <text x="288" y="84" textAnchor="middle" fill="#FFD66B" fontSize="9" fontWeight="bold">
            Moon Base
          </text>

          {/* 3-Stage Autonomous Rescue Triangle */}
          <rect x="20" y="102" width="300" height="58" rx="10" fill="#11192E" stroke="#FFD66B" strokeWidth="1.5" />
          <text x="170" y="122" textAnchor="middle" fill="#FFD66B" fontSize="10" fontWeight="bold">
            Autonomous Rescue: 3 Stages Solo
          </text>
          <text x="170" y="142" textAnchor="middle" fill="#9BD8A7" fontSize="9.5" fontWeight="bold">
            1. Power Bus → 2. Cabin O2 → 3. Lock Dish
          </text>
        </svg>
      );

    default: {
      const _exhaustive: never = day;
      return _exhaustive;
    }
  }
};

export const DialoguePanel: React.FC<DialoguePanelProps> = ({
  state,
  crewId,
  onClose,
  onStartMiniGame,
  missionPhase,
  onOpenMiniGame,
  onOpenDecisions,
}) => {
  const profile = CREW_PROFILES[crewId];
  const scenario = DAILY_SCENARIOS[state.day];
  const dataset = VERIFIED_NASA_DATASETS[state.day];
  const effectivePhase: 'morning' | 'midday' =
    missionPhase ?? (state.shift === 'midday' ? 'midday' : 'morning');
  const beat = getCrewDialogueForPhase(crewId, state.day, effectivePhase);
  const storyRipple = getDynamicStoryRipple(state);

  const handlePrimaryAction = () => {
    soundEngine.playCue('confirm');
    if (onStartMiniGame) {
      onStartMiniGame();
    } else if (onOpenMiniGame) {
      onOpenMiniGame(scenario.signatureMiniGame);
    } else if (onOpenDecisions) {
      onOpenDecisions();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        soundEngine.playCue('click');
        onClose();
        return;
      }
      if (
        (event.key === 'Enter' || event.key === ' ') &&
        !(event.target instanceof HTMLButtonElement)
      ) {
        event.preventDefault();
        soundEngine.playCue('confirm');
        if (onStartMiniGame) {
          onStartMiniGame();
        } else if (onOpenMiniGame) {
          onOpenMiniGame(scenario.signatureMiniGame);
        } else if (onOpenDecisions) {
          onOpenDecisions();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onOpenDecisions, onOpenMiniGame, onStartMiniGame, scenario.signatureMiniGame]);

  const primaryCtaLabel =
    effectivePhase === 'midday'
      ? 'FIX MIDDAY ANOMALY →'
      : onStartMiniGame || onOpenMiniGame
        ? 'PLAY STATION MINI-GAME →'
        : onOpenDecisions
          ? 'OPEN NIGHT DECISION →'
          : 'CONTINUE →';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/80 backdrop-blur-sm p-3 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogue-crew-name"
    >
      <div
        className={`w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-[#0F172A] border-2 shadow-2xl p-4 flex flex-col gap-2.5 ${
          effectivePhase === 'midday' ? 'border-[#F87171]/70' : 'border-[#79C8E8]/65'
        }`}
      >
        {/* Top Crew Header */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#1E293B] border border-slate-700 px-3.5 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-1 rounded-2xl bg-[#0F172A] border-2 shrink-0"
              style={{ borderColor: profile.accentColor }}
            >
              <CrewAvatar crewId={crewId} expression={beat.expression} size="md" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="dialogue-crew-name"
                  className="text-lg font-extrabold text-[#F8FAFC] leading-tight"
                  style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
                >
                  {profile.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#0F172A] border border-slate-600 text-[11px] font-bold text-[#79C8E8]">
                  {profile.role} • {profile.stationName}
                </span>
              </div>
              <p className="text-xs font-extrabold uppercase tracking-wider mt-0.5 text-[#FFD66B]">
                Sol {state.day} / 7 • {scenario.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${
                effectivePhase === 'midday'
                  ? 'bg-[#F87171]/15 border-[#F87171]/60 text-[#F87171]'
                  : 'bg-[#79C8E8]/15 border-[#79C8E8]/60 text-[#79C8E8]'
              }`}
            >
              {effectivePhase === 'midday' ? 'Midday Anomaly' : 'Morning Briefing'}
            </span>
            <button
              type="button"
              onClick={() => {
                soundEngine.playCue('click');
                onClose();
              }}
              aria-label="Close briefing"
              className="w-8 h-8 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-600 text-slate-300 hover:text-[#F8FAFC] font-extrabold text-sm cursor-pointer flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main 2-Column Visual Science Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0">
          {/* Left: Animated SVG Science Visualizer + Key Units */}
          <div className="md:col-span-5 flex flex-col gap-2">
            <ScienceVisualizerSvg day={state.day} phase={effectivePhase} />
            <div className="grid grid-cols-2 gap-1.5">
              {dataset.rawMetrics.slice(0, 2).map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl bg-[#11192E] border border-slate-700/80 px-2.5 py-1.5"
                >
                  <div className="text-[10px] font-bold uppercase text-slate-400 truncate">
                    {metric.label}
                  </div>
                  <div className="text-xs font-extrabold text-[#FFD66B] truncate">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Story Speech, Ripple & 3-Chip Science Strip */}
          <div className="md:col-span-7 flex flex-col justify-between gap-2.5">
            {/* Crew Briefing Speech */}
            <div
              className={`rounded-2xl border p-3 ${
                effectivePhase === 'midday'
                  ? 'bg-[#26131C] border-[#F87171]/60'
                  : 'bg-[#1E293B] border-slate-700'
              }`}
            >
              {effectivePhase === 'midday' ? (
                <div className="space-y-1">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#F87171]">
                    ⚠️ {scenario.anomaly.title}
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-[#F8FAFC] leading-snug">
                    “{beat.greeting}”
                  </p>
                  <p className="text-xs font-bold text-slate-200 leading-snug">
                    {beat.advice}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-extrabold text-[#F8FAFC] leading-snug">
                    “{beat.greeting}”
                  </p>
                  <p className="text-xs font-bold text-[#79C8E8] leading-snug">
                    💡 {beat.advice}
                  </p>
                </div>
              )}
            </div>

            {/* Story Ripple Bar */}
            <div className="rounded-xl bg-[#11192E] border border-[#A995E8]/45 px-3 py-2 flex items-start gap-2">
              <span className="text-xs font-extrabold uppercase text-[#A995E8] shrink-0">
                Story Ripple:
              </span>
              <span className="text-xs font-bold text-slate-100 leading-snug">
                {storyRipple}
              </span>
            </div>

            {/* 3-Chip NASA Observation -> Meaning -> Base Rule Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#11192E] border border-[#79C8E8]/45 p-2 flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#79C8E8]">
                  🛰️ NASA Observation
                </span>
                <p className="text-[11px] font-semibold text-slate-200 leading-snug">
                  {dataset.satelliteObservation}
                </p>
              </div>
              <div className="rounded-xl bg-[#11192E] border border-[#FFD66B]/45 p-2 flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFD66B]">
                  🔬 Meaning
                </span>
                <p className="text-[11px] font-semibold text-slate-200 leading-snug">
                  {dataset.scientificInterpretation}
                </p>
              </div>
              <div className="rounded-xl bg-[#11192E] border border-[#9BD8A7]/45 p-2 flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9BD8A7]">
                  🎮 Base Rule
                </span>
                <p className="text-[11px] font-semibold text-slate-200 leading-snug">
                  {dataset.gameSimulationRule}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Row */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundEngine.playCue('click');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-xs sm:text-sm font-extrabold text-slate-200 cursor-pointer transition-colors"
          >
            ← Back to Base
          </button>

          <button
            type="button"
            onClick={handlePrimaryAction}
            className={`flex-1 sm:flex-initial sm:min-w-[260px] py-3 px-6 rounded-2xl text-base sm:text-lg font-extrabold tracking-wide shadow-lg cursor-pointer transition-colors ${
              effectivePhase === 'midday'
                ? 'bg-[#FFD66B] hover:bg-[#f2c44c] text-[#090D16] border-2 border-[#fff0bd]'
                : 'bg-[#9BD8A7] hover:bg-[#7fc98e] text-[#090D16] border-2 border-[#c9f0d0]'
            }`}
            style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
          >
            {primaryCtaLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
