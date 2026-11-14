import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  BASE_CANVAS_HEIGHT,
  BASE_CANVAS_WIDTH,
  CrewAvatar,
  drawCutsceneFrame,
} from './assets/proceduralPixelArt';
import { EndingCutscene } from './components/cutscenes/EndingCutscene';
import { OpeningCutscene } from './components/cutscenes/OpeningCutscene';
import { TopHud } from './components/hud/TopHud';
import { TopDownLunarBase } from './components/map/TopDownLunarBase';
import { GreenhouseMiniGame } from './components/minigames/GreenhouseMiniGame';
import { LunarLanderGame } from './components/minigames/LunarLanderGame';
import { MedbayMiniGame } from './components/minigames/MedbayMiniGame';
import { PowerGridMiniGame } from './components/minigames/PowerGridMiniGame';
import { RadiationMiniGame } from './components/minigames/RadiationMiniGame';
import { RoverSurfaceMiniGame } from './components/minigames/RoverSurfaceMiniGame';
import { AdditionalInfoModal } from './components/modals/AdditionalInfoModal';
import { AiAdvisorModal } from './components/modals/AiAdvisorModal';
import { DebriefScreen } from './components/modals/DebriefScreen';
import { DecisionModal } from './components/narrative/DecisionModal';
import { DialoguePanel } from './components/narrative/DialoguePanel';
import { CREW_PROFILES } from './data/crewProfiles';
import { DAILY_SCENARIOS } from './data/dailyScenarios';
import * as soundEngine from './services/soundEngine';
import type { SoundCueId } from './services/soundEngine';
import {
  computeMissionEnding,
  createInitialGameState,
  transitionGameState,
} from './simulation/engine';
import { clearSavedGameState, loadGameState, saveGameState } from './simulation/storage';
import type {
  CrewExpression,
  CrewId,
  DayNumber,
  DecisionRecord,
  EndingId,
  GameState,
  JumpTarget,
  LandingSite,
  MiniGameGrade,
  MiniGameId,
  OnBaseCrewId,
} from './types/game';

export type LinearDayStep =
  | 'chapter_intro'
  | 'morning_walk'
  | 'morning_intro'
  | 'morning_minigame'
  | 'midday_walk'
  | 'midday_intro'
  | 'midday_minigame'
  | 'decision'
  | 'day_complete';

interface DayBeatConfig {
  crewId: OnBaseCrewId;
  miniGame: MiniGameId;
}

const DAY_MORNING_CONFIG: Record<DayNumber, DayBeatConfig> = {
  1: { crewId: 'albaraa', miniGame: 'lunar_lander' },
  2: { crewId: 'sayed', miniGame: 'greenhouse' },
  3: { crewId: 'taha', miniGame: 'power_grid' },
  4: { crewId: 'taha', miniGame: 'radiation' },
  5: { crewId: 'omar', miniGame: 'medbay' },
  6: { crewId: 'yassin', miniGame: 'rover_surface' },
  7: { crewId: 'albaraa', miniGame: 'power_grid' },
};

const DAY_MIDDAY_CONFIG: Record<DayNumber, DayBeatConfig> = {
  1: { crewId: 'albaraa', miniGame: 'power_grid' },
  2: { crewId: 'sayed', miniGame: 'medbay' },
  3: { crewId: 'albaraa', miniGame: 'radiation' },
  4: { crewId: 'sayed', miniGame: 'power_grid' },
  5: { crewId: 'omar', miniGame: 'greenhouse' },
  6: { crewId: 'yassin', miniGame: 'radiation' },
  7: { crewId: 'taha', miniGame: 'rover_surface' },
};

interface ChapterEventSpec {
  badge: string;
  title: string;
  summary: string;
  sfx: SoundCueId;
  secondarySfx?: SoundCueId;
  middaySfx: SoundCueId;
  borderClass: string;
  badgeClass: string;
}

const CHAPTER_EVENTS: Record<DayNumber, ChapterEventSpec> = {
  1: {
    badge: '🚀 DAY 1 EVENT • LUNAR APPROACH',
    title: 'Rocket Descent in 1.62 m/s² Gravity!',
    summary: 'No air slows us down—fire thrusters gently under 3.0 m/s to touch down at the South Pole!',
    sfx: 'thruster',
    middaySfx: 'alert',
    borderClass: 'border-[#FFD66B]/75',
    badgeClass: 'bg-[#FFD66B]/15 text-[#FFD66B] border-[#FFD66B]/50',
  },
  2: {
    badge: '💧 DAY 2 EVENT • 1/6G HYDROPONICS',
    title: 'Floating Water & Pipe Air Bubbles!',
    summary: 'Weak lunar gravity makes water curl into floating spheres and trap bubbles inside garden pipes!',
    sfx: 'bubble',
    middaySfx: 'bubble',
    borderClass: 'border-[#9BD8A7]/75',
    badgeClass: 'bg-[#9BD8A7]/15 text-[#9BD8A7] border-[#9BD8A7]/50',
  },
  3: {
    badge: '⚡ DAY 3 EVENT • ELECTROSTATIC DUST',
    title: 'Orange Dust Storm & Power Sparks!',
    summary: 'Charged lunar dust clings to solar wings and sparks electrical junctions as shadows freeze!',
    sfx: 'dust_sweep',
    secondarySfx: 'power_overload',
    middaySfx: 'power_overload',
    borderClass: 'border-[#FFD66B]/80',
    badgeClass: 'bg-[#FFD66B]/15 text-[#FFD66B] border-[#FFD66B]/55',
  },
  4: {
    badge: '☀️ DAY 4 EVENT • X-CLASS SOLAR FLARE',
    title: 'Proton Wave Slamming Moon Base!',
    summary: 'NASA DONKI tracked a giant solar burst! High-speed protons race toward the base right now!',
    sfx: 'solar_flare',
    middaySfx: 'solar_flare',
    borderClass: 'border-[#F87171]/80',
    badgeClass: 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/55',
  },
  5: {
    badge: '🌫️ DAY 5 EVENT • CABIN AIR & SLEEP',
    title: 'Amber CO2 Gas Haze Building Up!',
    summary: 'Storm lockdown raised CO2 ppm inside quarters—scrub stale air and reset crew sleep clocks!',
    sfx: 'co2_hiss',
    middaySfx: 'co2_hiss',
    borderClass: 'border-[#A995E8]/80',
    badgeClass: 'bg-[#A995E8]/15 text-[#A995E8] border-[#A995E8]/55',
  },
  6: {
    badge: '🧊 DAY 6 EVENT • -200°C CRATER TRAP',
    title: 'Moon Rover vs -200°C Ice Craters!',
    summary: 'Deep crater shadows plunge to -200°C! Steer carefully around freeze traps and aim our radio!',
    sfx: 'frost_freeze',
    middaySfx: 'frost_freeze',
    borderClass: 'border-[#79C8E8]/80',
    badgeClass: 'bg-[#79C8E8]/15 text-[#79C8E8] border-[#79C8E8]/55',
  },
  7: {
    badge: '📡 DAY 7 EVENT • SOLAR RADIO BLACKOUT',
    title: 'Giant Solar Static Wave Cuts Earth!',
    summary: 'Radio noise severed Abdul at Earth Control! Your lunar crew must finish the rescue solo!',
    sfx: 'comms_static',
    middaySfx: 'comms_static',
    borderClass: 'border-[#F87171]/85',
    badgeClass: 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/60',
  },
};

const DAY_LIST: readonly DayNumber[] = [1, 2, 3, 4, 5, 6, 7];

const DAY_TO_JUMP_TARGET: Record<DayNumber, JumpTarget> = {
  1: 'day_1',
  2: 'day_2',
  3: 'day_3',
  4: 'day_4',
  5: 'day_5',
  6: 'day_6',
  7: 'day_7_blackout',
};

function deriveStepFromState(state: Readonly<GameState>): LinearDayStep {
  if (state.activeMiniGame !== null) {
    return state.shift === 'midday' ? 'midday_minigame' : 'morning_minigame';
  }
  if (state.shift === 'evening' && !state.eveningDecisionCompletedForDay) {
    return 'decision';
  }
  if (state.shift === 'midday') {
    return 'midday_walk';
  }
  return 'morning_walk';
}

const ChapterEventSceneSvg: React.FC<{ day: DayNumber }> = ({ day }) => {
  switch (day) {
    case 1:
      return (
        <svg
          viewBox="0 0 460 185"
          className="w-full h-auto max-h-[190px] block rounded-2xl bg-[#070B14] border border-slate-700/80"
          role="img"
          aria-label="Day 1 Animated Rocket Descent Scene"
        >
          <circle cx="48" cy="28" r="1.5" fill="#F8FAFC" opacity="0.8" />
          <circle cx="148" cy="18" r="1.2" fill="#79C8E8" opacity="0.8" />
          <circle cx="350" cy="24" r="1.6" fill="#F8FAFC" opacity="0.85" />
          <circle cx="412" cy="40" r="1.3" fill="#FFD66B" opacity="0.8" />
          {/* Earth + Radio Wave */}
          <circle cx="58" cy="42" r="15" fill="#2563EB" stroke="#79C8E8" strokeWidth="1.5" />
          <path d="M51 36 h9 v5 h-4 v5 h-5 z" fill="#9BD8A7" />
          <path d="M78 40 Q150 18 206 42" fill="none" stroke="#79C8E8" strokeWidth="2" strokeDasharray="5 4">
            <animate attributeName="stroke-dashoffset" values="18;0" dur="1.3s" repeatCount="indefinite" />
          </path>
          <text x="142" y="21" textAnchor="middle" fill="#79C8E8" fontSize="10" fontWeight="bold">
            1.3s Radio Signal
          </text>
          {/* South Pole Terrain */}
          <path d="M0 162 L90 138 L185 156 L265 158 L335 135 L460 148 L460 185 L0 185 Z" fill="#334155" />
          <path d="M335 135 L380 166 L425 142 Z" fill="#0F172A" />
          <text x="68" y="176" textAnchor="middle" fill="#FFD66B" fontSize="10" fontWeight="bold">
            ☀️ Sunlit Peak
          </text>
          <text x="380" y="177" textAnchor="middle" fill="#79C8E8" fontSize="10" fontWeight="bold">
            🧊 Crater Rim
          </text>
          {/* Descending Rocket Lander */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,-16;0,12;0,-16"
              dur="3.2s"
              repeatCount="indefinite"
            />
            <polygon points="230,112 244,144 216,144" fill="#FFD66B" opacity="0.9">
              <animate attributeName="opacity" values="0.95;0.45;0.95" dur="0.28s" repeatCount="indefinite" />
            </polygon>
            <rect x="212" y="72" width="36" height="32" rx="6" fill="#E2E8F0" stroke="#79C8E8" strokeWidth="2.5" />
            <polygon points="216,72 230,52 244,72" fill="#FFD66B" />
            <circle cx="230" cy="88" r="6" fill="#0F172A" stroke="#79C8E8" strokeWidth="1.5" />
            <line x1="214" y1="104" x2="202" y2="118" stroke="#94A3B8" strokeWidth="3" />
            <line x1="246" y1="104" x2="258" y2="118" stroke="#94A3B8" strokeWidth="3" />
          </g>
          <rect x="300" y="54" width="136" height="44" rx="10" fill="#1E293B" stroke="#9BD8A7" strokeWidth="1.5" />
          <text x="368" y="72" textAnchor="middle" fill="#9BD8A7" fontSize="10.5" fontWeight="bold">
            Gravity: 1.62 m/s²
          </text>
          <text x="368" y="88" textAnchor="middle" fill="#F8FAFC" fontSize="10">
            Target &lt; 3.0 m/s
          </text>
        </svg>
      );
    case 2:
      return (
        <svg
          viewBox="0 0 460 185"
          className="w-full h-auto max-h-[190px] block rounded-2xl bg-[#070B14] border border-slate-700/80"
          role="img"
          aria-label="Day 2 Animated Microgravity Water Spheres and Pipe Bubbles"
        >
          {/* Greenhouse Dome */}
          <path d="M55 156 Q230 16 405 156 Z" fill="#0F172A" stroke="#9BD8A7" strokeWidth="2.5" />
          <line x1="45" y1="156" x2="415" y2="156" stroke="#475569" strokeWidth="4" />
          {/* Pipe Loop with Bubbles */}
          <path d="M90 128 L370 128" fill="none" stroke="#334155" strokeWidth="14" strokeLinecap="round" />
          <path d="M90 128 L370 128" fill="none" stroke="#79C8E8" strokeWidth="6" strokeDasharray="16 14">
            <animate attributeName="stroke-dashoffset" values="30;0" dur="1.1s" repeatCount="indefinite" />
          </path>
          {/* Floating Water Spheres in 1/6g */}
          <circle cx="145" cy="72" r="14" fill="#79C8E8" opacity="0.75" stroke="#BAE6FD" strokeWidth="2">
            <animate attributeName="cy" values="72;58;72" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="225" cy="54" r="10" fill="#79C8E8" opacity="0.8" stroke="#BAE6FD" strokeWidth="2">
            <animate attributeName="cy" values="54;68;54" dur="2.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="305" cy="76" r="12" fill="#79C8E8" opacity="0.75" stroke="#BAE6FD" strokeWidth="2">
            <animate attributeName="cy" values="76;60;76" dur="2.7s" repeatCount="indefinite" />
          </circle>
          {/* Pipe Air Bubbles */}
          <circle cx="170" cy="128" r="5" fill="#F8FAFC">
            <animate attributeName="cx" values="120;340" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="260" cy="128" r="4" fill="#F8FAFC">
            <animate attributeName="cx" values="160;350" dur="2.0s" repeatCount="indefinite" />
          </circle>
          {/* Space Lettuce */}
          <ellipse cx="145" cy="148" rx="18" ry="11" fill="#4ADE80" />
          <ellipse cx="230" cy="148" rx="22" ry="12" fill="#9BD8A7" />
          <ellipse cx="315" cy="148" rx="18" ry="11" fill="#4ADE80" />
          <text x="230" y="175" textAnchor="middle" fill="#9BD8A7" fontSize="11" fontWeight="bold">
            1/6g Floating Water &amp; Air Bubbles Inside Garden Loop
          </text>
        </svg>
      );
    case 3:
      return (
        <svg
          viewBox="0 0 460 185"
          className="w-full h-auto max-h-[190px] block rounded-2xl bg-[#070B14] border border-slate-700/80"
          role="img"
          aria-label="Day 3 Electrostatic Orange Dust Storm and Power Sparks"
        >
          {/* Solar Wing */}
          <polygon points="75,90 250,62 270,136 95,160" fill="#1E3A8A" stroke="#79C8E8" strokeWidth="2.5" />
          <line x1="162" y1="76" x2="182" y2="148" stroke="#79C8E8" strokeWidth="1.5" opacity="0.7" />
          <line x1="85" y1="124" x2="260" y2="98" stroke="#79C8E8" strokeWidth="1.5" opacity="0.7" />
          {/* Drifting Orange Dust Clouds */}
          <g opacity="0.78">
            <ellipse cx="155" cy="108" rx="44" ry="16" fill="#F97316">
              <animate attributeName="cx" values="120;220;120" dur="3.0s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="220" cy="126" rx="52" ry="14" fill="#FB923C">
              <animate attributeName="cx" values="250;140;250" dur="2.6s" repeatCount="indefinite" />
            </ellipse>
          </g>
          {/* Power Junction Box & Sparking Arcs */}
          <rect x="312" y="76" width="84" height="72" rx="10" fill="#1E293B" stroke="#FFD66B" strokeWidth="2.5" />
          <path d="M342 94 L330 114 L346 114 L336 134" fill="none" stroke="#FFD66B" strokeWidth="4" strokeLinecap="round">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.35s" repeatCount="indefinite" />
          </path>
          <path d="M262 96 L310 104" stroke="#FFD66B" strokeWidth="3" strokeDasharray="6 4">
            <animate attributeName="opacity" values="0.9;0.1;0.9" dur="0.25s" repeatCount="indefinite" />
          </path>
          <text x="354" y="166" textAnchor="middle" fill="#FFD66B" fontSize="10.5" fontWeight="bold">
            ⚡ Dust Sparks &amp; -160°C Shadows
          </text>
        </svg>
      );
    case 4:
      return (
        <svg
          viewBox="0 0 460 185"
          className="w-full h-auto max-h-[190px] block rounded-2xl bg-[#070B14] border border-slate-700/80"
          role="img"
          aria-label="Day 4 X-Class Solar Flare Proton Wave"
        >
          {/* Flaring Sun */}
          <circle cx="54" cy="92" r="42" fill="#EA580C" />
          <circle cx="54" cy="92" r="32" fill="#FACC15">
            <animate attributeName="r" values="30;35;30" dur="1.1s" repeatCount="indefinite" />
          </circle>
          {/* Proton Waves Slamming Base */}
          <path d="M104 42 Q144 92 104 142" fill="none" stroke="#F43F5E" strokeWidth="4">
            <animateTransform attributeName="transform" type="translate" values="0,0;180,0" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite" />
          </path>
          <path d="M124 32 Q170 92 124 152" fill="none" stroke="#FFD66B" strokeWidth="4">
            <animateTransform attributeName="transform" type="translate" values="0,0;170,0" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          {/* Moon Base under Shield */}
          <path d="M300 148 Q365 76 430 148 Z" fill="#1E293B" stroke="#79C8E8" strokeWidth="3.5" />
          <rect x="330" y="118" width="70" height="30" rx="6" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
          <line x1="250" y1="148" x2="450" y2="148" stroke="#475569" strokeWidth="4" />
          <text x="365" y="170" textAnchor="middle" fill="#F87171" fontSize="11" fontWeight="bold">
            ☀️ X8.7 Proton Storm Incoming!
          </text>
        </svg>
      );
    case 5:
      return (
        <svg
          viewBox="0 0 460 185"
          className="w-full h-auto max-h-[190px] block rounded-2xl bg-[#070B14] border border-slate-700/80"
          role="img"
          aria-label="Day 5 Amber and Purple CO2 Haze and Air Scrubber"
        >
          {/* Habitat Room */}
          <rect x="44" y="28" width="372" height="128" rx="16" fill="#1E293B" stroke="#A995E8" strokeWidth="2.5" />
          {/* Amber & Purple CO2 Haze Clouds */}
          <circle cx="130" cy="76" r="28" fill="#D97706" opacity="0.45">
            <animate attributeName="cx" values="120;155;120" dur="3.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="185" cy="96" r="32" fill="#9333EA" opacity="0.4">
            <animate attributeName="cx" values="195;160;195" dur="2.9s" repeatCount="indefinite" />
          </circle>
          <text x="148" y="92" textAnchor="middle" fill="#FFD66B" fontSize="14" fontWeight="bold">
            CO2 ppm
          </text>
          {/* Scrubber Fan */}
          <circle cx="290" cy="92" r="30" fill="#0F172A" stroke="#79C8E8" strokeWidth="2.5" />
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 290 92"
              to="360 290 92"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <line x1="290" y1="68" x2="290" y2="116" stroke="#79C8E8" strokeWidth="5" strokeLinecap="round" />
            <line x1="266" y1="92" x2="314" y2="92" stroke="#79C8E8" strokeWidth="5" strokeLinecap="round" />
          </g>
          {/* Clean O2 Sparkles */}
          <circle cx="364" cy="74" r="6" fill="#9BD8A7">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="386" cy="104" r="5" fill="#79C8E8">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.1s" repeatCount="indefinite" />
          </circle>
          <text x="372" y="132" textAnchor="middle" fill="#9BD8A7" fontSize="12" fontWeight="bold">
            Fresh O2
          </text>
          <text x="230" y="174" textAnchor="middle" fill="#A995E8" fontSize="11" fontWeight="bold">
            Scrub Stale CO2 &amp; Tune 460/600 nm Crew Rest Lights
          </text>
        </svg>
      );
    case 6:
      return (
        <svg
          viewBox="0 0 460 185"
          className="w-full h-auto max-h-[190px] block rounded-2xl bg-[#070B14] border border-slate-700/80"
          role="img"
          aria-label="Day 6 Moon Rover vs -200°C Crater Freeze Trap"
        >
          {/* Crater Ground */}
          <path d="M0 144 L170 144 L235 164 L320 164 L375 138 L460 144 L460 185 L0 185 Z" fill="#334155" />
          <path d="M195 144 L235 164 L315 164 L350 144 Z" fill="#0F172A" />
          {/* -200C Frost Spikes */}
          <polygon points="220,162 232,126 244,162" fill="#79C8E8" opacity="0.85">
            <animate attributeName="opacity" values="0.95;0.5;0.95" dur="1.4s" repeatCount="indefinite" />
          </polygon>
          <polygon points="262,162 276,120 290,162" fill="#38BDF8" opacity="0.85">
            <animate attributeName="opacity" values="0.5;0.95;0.5" dur="1.4s" repeatCount="indefinite" />
          </polygon>
          <text x="255" y="110" textAnchor="middle" fill="#79C8E8" fontSize="12" fontWeight="bold">
            ❄️ -200°C Ice Trap
          </text>
          {/* Animated Moon Rover */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0;48,0;0,0"
              dur="3.6s"
              repeatCount="indefinite"
            />
            <rect x="64" y="102" width="76" height="28" rx="6" fill="#E2E8F0" stroke="#A995E8" strokeWidth="2.5" />
            <rect x="108" y="84" width="22" height="18" rx="4" fill="#1E293B" stroke="#FFD66B" strokeWidth="2" />
            <circle cx="78" cy="136" r="10" fill="#0F172A" stroke="#94A3B8" strokeWidth="3" />
            <circle cx="102" cy="136" r="10" fill="#0F172A" stroke="#94A3B8" strokeWidth="3" />
            <circle cx="126" cy="136" r="10" fill="#0F172A" stroke="#94A3B8" strokeWidth="3" />
          </g>
          {/* S-Band Dish */}
          <path d="M385 112 Q408 82 430 112" fill="none" stroke="#FFD66B" strokeWidth="3" />
          <line x1="408" y1="112" x2="408" y2="140" stroke="#94A3B8" strokeWidth="4" />
          <text x="230" y="177" textAnchor="middle" fill="#A995E8" fontSize="11" fontWeight="bold">
            Steer Rover Around Freeze Traps &amp; Aim Crater Dish
          </text>
        </svg>
      );
    case 7:
      return (
        <svg
          viewBox="0 0 460 185"
          className="w-full h-auto max-h-[190px] block rounded-2xl bg-[#070B14] border border-slate-700/80"
          role="img"
          aria-label="Day 7 Giant Solar Radio Static Wave Blackout"
        >
          {/* S-Band Dish */}
          <line x1="92" y1="110" x2="92" y2="156" stroke="#94A3B8" strokeWidth="5" />
          <path d="M62 84 Q92 126 126 84" fill="#1E293B" stroke="#79C8E8" strokeWidth="3" />
          <circle cx="94" cy="78" r="5" fill="#FFD66B" />
          {/* Static Wave Jamming Bars */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => {
            const x = 152 + idx * 18;
            const h = 34 + ((idx * 19) % 44);
            return (
              <rect
                key={idx}
                x={x}
                y={82 - h / 2}
                width="9"
                height={h}
                rx="3"
                fill={idx % 2 === 0 ? '#F87171' : '#FFD66B'}
              >
                <animate
                  attributeName="height"
                  values={`${h};${18 + (idx % 4) * 14};${h}`}
                  dur={`${0.28 + (idx % 3) * 0.12}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y"
                  values={`${82 - h / 2};${82 - (18 + (idx % 4) * 14) / 2};${82 - h / 2}`}
                  dur={`${0.28 + (idx % 3) * 0.12}s`}
                  repeatCount="indefinite"
                />
              </rect>
            );
          })}
          {/* Earth Offline Icon */}
          <circle cx="395" cy="82" r="24" fill="#1E3A8A" stroke="#F87171" strokeWidth="2.5" strokeDasharray="4 3" />
          <text x="395" y="86" textAnchor="middle" fill="#F87171" fontSize="11" fontWeight="bold">
            OFFLINE
          </text>
          <text x="230" y="170" textAnchor="middle" fill="#F87171" fontSize="11" fontWeight="bold">
            ⚡ Total Comms Blackout — Crew Operates Autonomously!
          </text>
        </svg>
      );
    default: {
      const _exhaustive: never = day;
      return _exhaustive;
    }
  }
};

interface DayTransformationSummary {
  choiceTitle: string;
  baseChange: string;
  crewChange: string;
  crewId: OnBaseCrewId;
  crewExpression: CrewExpression;
  isChillyOrRisky: boolean;
  isShielded: boolean;
}

function getDayChoiceTransformation(
  record: DecisionRecord | undefined,
  state: Readonly<GameState>,
): DayTransformationSummary {
  const choiceId = record?.choiceId;
  switch (choiceId) {
    case '1A_sunlit_ridge':
      return {
        choiceTitle: record?.title ?? 'Sunlit Peak',
        baseChange: 'Gleaming solar arrays anchored on Sunlit Peak (+6 Power/day)!',
        crewChange: 'AlBaraa is energized by steady sunshine (watch Sol 4 sky cover).',
        crewId: 'albaraa',
        crewExpression: 'happy',
        isChillyOrRisky: false,
        isShielded: false,
      };
    case '1B_crater_shadow':
      return {
        choiceTitle: record?.title ?? 'Crater Rim',
        baseChange: 'Protective crater rock berm & glowing ice vein surround the base!',
        crewChange: 'Sayed cheers the +15 Water & +10 Storm Shielding cover!',
        crewId: 'sayed',
        crewExpression: 'happy',
        isChillyOrRisky: false,
        isShielded: true,
      };
    case '2A_active_pumps':
      return {
        choiceTitle: record?.title ?? 'Electric Pumps',
        baseChange: 'Hydroponic Greenhouse grows lush tall greens & cool water mist!',
        crewChange: 'Sayed loves fast harvests (+8 Air/Food/day, needs Power >= 25%).',
        crewId: 'sayed',
        crewExpression: 'happy',
        isChillyOrRisky: false,
        isShielded: false,
      };
    case '2B_capillary_ponds':
      return {
        choiceTitle: record?.title ?? 'Capillary Tubes',
        baseChange: 'Cyan 0 kW NASA PONDS capillary blocks installed in Greenhouse!',
        crewChange: 'Sayed works extra hand-tending shifts (+8 Fatigue/day), saving kW.',
        crewId: 'sayed',
        crewExpression: 'focused',
        isChillyOrRisky: false,
        isShielded: false,
      };
    case '3A_essential_heating':
      return {
        choiceTitle: record?.title ?? 'Warm Cabins',
        baseChange: 'Warm orange heaters glow inside Quarters; Rover capped at 55%.',
        crewChange: 'Crew stays cozy (+5 Morale), but watch tomorrow’s storm surge!',
        crewId: 'omar',
        crewExpression: 'happy',
        isChillyOrRisky: false,
        isShielded: false,
      };
    case '3B_battery_storage':
      return {
        choiceTitle: record?.title ?? 'Bank Battery',
        baseChange: 'Blue frost crystals coat cabin walls while Rover charges to 100%!',
        crewChange: 'Brrr! Crew shivers in chilly rooms to protect Sol 4 shields.',
        crewId: 'taha',
        crewExpression: 'worried',
        isChillyOrRisky: true,
        isShielded: false,
      };
    case '3C_overclock_regulators':
      return {
        choiceTitle: record?.title ?? 'Overclock Bus',
        baseChange: 'Power conduits spark bright yellow as regulators run above limits!',
        crewChange: 'AlBaraa strains over hot wires (+15 Fatigue, Sol 7 fault risk).',
        crewId: 'albaraa',
        crewExpression: 'alert',
        isChillyOrRisky: true,
        isShielded: false,
      };
    case '4A_max_shielding':
      return {
        choiceTitle: record?.title ?? 'Full Water-Wall',
        baseChange: state.flags.unbufferedStormOverloadTriggered
          ? 'Water-Wall Dome sealed, but unbuffered storm surge stalled pumps!'
          : 'Shimmering cyan Water-Wall Dome & steel blast shutters locked tight!',
        crewChange: state.flags.unbufferedStormOverloadTriggered
          ? 'Crew scrambles as Power dipped under 25%—recovery starts tomorrow!'
          : 'Taha & crew cheer safely inside zero-mSv storm shelter!',
        crewId: 'taha',
        crewExpression: state.flags.unbufferedStormOverloadTriggered ? 'alert' : 'happy',
        isChillyOrRisky: state.flags.unbufferedStormOverloadTriggered,
        isShielded: true,
      };
    case '4B_partial_shielding':
      return {
        choiceTitle: record?.title ?? 'Half Shield',
        baseChange: 'Amber warning lights flicker on thin shields while saving kW.',
        crewChange: 'Crew raises visors (-12 Health, needs Medkits tomorrow).',
        crewId: 'omar',
        crewExpression: 'concerned',
        isChillyOrRisky: true,
        isShielded: false,
      };
    case '5A_full_rest':
      return {
        choiceTitle: record?.title ?? 'Full Rest',
        baseChange: '600 nm warm amber sleep lights & sparkling O2 fill Habitat Core!',
        crewChange: 'Dr. Omar & crew feel sharp and resilient (+5 Sol 7 Morale)!',
        crewId: 'omar',
        crewExpression: 'happy',
        isChillyOrRisky: false,
        isShielded: false,
      };
    case '5B_rationed_split_shift':
      return {
        choiceTitle: record?.title ?? 'Split Shift',
        baseChange: 'Science Lab rigs stay lit late while saving Medbay supplies.',
        crewChange: 'Crew gains +10 Science, feeling sleepy heading into Day 6.',
        crewId: 'omar',
        crewExpression: 'concerned',
        isChillyOrRisky: true,
        isShielded: false,
      };
    case '6A_crater_ice':
      return {
        choiceTitle: record?.title ?? 'Drill Moon Ice',
        baseChange: 'Moon Rover hauls glowing blue ice-core canisters into the airlock!',
        crewChange: 'Yassin cheers +25 Water & +25 Science! Get ready for Day 7!',
        crewId: 'yassin',
        crewExpression: 'happy',
        isChillyOrRisky: false,
        isShielded: false,
      };
    case '6B_comms_maintenance':
      return {
        choiceTitle: record?.title ?? 'Fix Solar Relay',
        baseChange: 'Upgraded S-band dish & spotless solar wings shine above the base!',
        crewChange: 'Yassin & Taha locked emergency backup power for Day 7!',
        crewId: 'yassin',
        crewExpression: 'happy',
        isChillyOrRisky: false,
        isShielded: true,
      };
    default:
      return {
        choiceTitle: record?.title ?? 'Mission Choice',
        baseChange: 'Moon Base subsystems updated for tomorrow!',
        crewChange: 'Your crew adjusted stations for the next Sol.',
        crewId: DAY_MORNING_CONFIG[state.day].crewId,
        crewExpression: 'normal',
        isChillyOrRisky: false,
        isShielded: false,
      };
  }
}

export function App() {
  const [state, dispatch] = useReducer(transitionGameState, undefined, () => {
    return loadGameState() ?? createInitialGameState();
  });

  const [showStartMenu, setShowStartMenu] = useState<boolean>(true);
  const [dayStep, setDayStep] = useState<LinearDayStep>(() =>
    deriveStepFromState(state),
  );
  const [completedDayNum, setCompletedDayNum] = useState<DayNumber>(1);
  const [activeDialogueCrew, setActiveDialogueCrew] = useState<CrewId | null>(null);
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState<boolean>(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [previewEnding, setPreviewEnding] = useState<EndingId | null>(null);

  const startCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTotalSecRef = useRef<number>(0);
  const startLastFrameRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const hasSavedProgress =
    state.screenStage !== 'opening_cutscene' ||
    state.day > 1 ||
    state.decisions.length > 0 ||
    state.tutorialCompleted;

  // Keep localStorage synced cleanly.
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // Keep muted flag synchronized with the procedural Web Audio engine.
  useEffect(() => {
    soundEngine.setMuted(state.muted);
  }, [state.muted]);

  // Auto-skip tutorial stage so the kid enters straight into Day 1 Chapter Event.
  useEffect(() => {
    if (!showStartMenu && state.screenStage === 'tutorial') {
      dispatch({ kind: 'COMPLETE_TUTORIAL' });
      setDayStep('chapter_intro');
    }
  }, [showStartMenu, state.screenStage]);

  // Keep procedural ambient soundtrack synced with the current stage.
  useEffect(() => {
    if (
      showStartMenu ||
      previewEnding !== null ||
      state.screenStage === 'opening_cutscene' ||
      state.screenStage === 'ending_cutscene' ||
      state.screenStage === 'debrief'
    ) {
      soundEngine.setAmbientTrack('cutscene');
      return;
    }
    if (state.day === 4 || state.day === 7 || dayStep.startsWith('midday_')) {
      soundEngine.setAmbientTrack('crisis');
      return;
    }
    soundEngine.setAmbientTrack('exploration');
  }, [dayStep, previewEnding, showStartMenu, state.day, state.screenStage]);

  // Play automatic event SFX on chapter_intro, midday_walk, and day_complete beats.
  useEffect(() => {
    if (showStartMenu || previewEnding !== null || state.screenStage !== 'gameplay') {
      return;
    }

    if (dayStep === 'chapter_intro') {
      const eventSpec = CHAPTER_EVENTS[state.day];
      soundEngine.playCue(eventSpec.sfx);
      if (eventSpec.secondarySfx) {
        const secondary = eventSpec.secondarySfx;
        const timerId = window.setTimeout(() => {
          soundEngine.playCue(secondary);
        }, 240);
        return () => window.clearTimeout(timerId);
      }
      return;
    }

    if (dayStep === 'midday_walk') {
      const eventSpec = CHAPTER_EVENTS[state.day];
      soundEngine.playCue(eventSpec.middaySfx);
      return;
    }

    if (dayStep === 'day_complete') {
      const current = stateRef.current;
      const latest = current.decisions.find((d) => d.day === completedDayNum);
      const summary = getDayChoiceTransformation(latest, current);
      soundEngine.playCue('choice_impact');
      const followCue: SoundCueId = summary.isChillyOrRisky
        ? 'crew_shiver'
        : summary.isShielded
          ? 'shutter_lock'
          : 'crew_cheer';
      const timerId = window.setTimeout(() => {
        soundEngine.playCue(followCue);
      }, 260);
      return () => window.clearTimeout(timerId);
    }
  }, [
    completedDayNum,
    dayStep,
    previewEnding,
    showStartMenu,
    state.day,
    state.screenStage,
  ]);

  // Keyboard Enter/Space shortcut on chapter_intro and day_complete overlays.
  useEffect(() => {
    if (showStartMenu || previewEnding !== null || state.screenStage !== 'gameplay') {
      return;
    }
    if (dayStep !== 'chapter_intro' && dayStep !== 'day_complete') {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      soundEngine.playCue('confirm');
      if (dayStep === 'chapter_intro') {
        setDayStep(
          state.shift === 'midday'
            ? 'midday_walk'
            : state.shift === 'evening'
              ? 'decision'
              : 'morning_walk',
        );
      } else {
        setDayStep('chapter_intro');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dayStep, previewEnding, showStartMenu, state.screenStage, state.shift]);

  // Animate 60fps Start Menu background scenes using drawCutsceneFrame.
  useEffect(() => {
    if (!showStartMenu) return;

    let rafId = 0;
    const renderLoop = (now: number) => {
      const prev = startLastFrameRef.current ?? now;
      const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
      startLastFrameRef.current = now;
      startTotalSecRef.current += dt;

      const totalSec = startTotalSecRef.current;
      const sceneIdx = Math.floor(totalSec / 5) % 3;
      const sceneFrame = Math.floor((totalSec % 5) * 60);

      const canvas = startCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawCutsceneFrame(
            ctx,
            'opening',
            sceneIdx,
            sceneFrame,
            stateRef.current,
            totalSec * 1000,
          );
        }
      }

      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);
    return () => {
      window.cancelAnimationFrame(rafId);
      startLastFrameRef.current = null;
    };
  }, [showStartMenu]);

  const handleStartMenuPointerDown = () => {
    soundEngine.unlock();
    if (!state.muted) {
      soundEngine.setAmbientTrack('cutscene');
    }
  };

  const handleToggleStartMute = () => {
    soundEngine.unlock();
    const nextMuted = !state.muted;
    soundEngine.setMuted(nextMuted);
    dispatch({ kind: 'SET_MUTED', muted: nextMuted });
    if (!nextMuted) {
      soundEngine.setAmbientTrack('cutscene');
      soundEngine.playCue('click');
    }
  };

  const handlePlayNewGame = () => {
    soundEngine.unlock();
    soundEngine.playCue('confirm');
    clearSavedGameState();
    dispatch({ kind: 'START_NEW_MISSION' });
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setInfoModalOpen(false);
    setPreviewEnding(null);
    setDayStep('chapter_intro');
    setShowStartMenu(false);
  };

  const handleContinueGame = () => {
    soundEngine.unlock();
    soundEngine.playCue('confirm');
    if (state.screenStage === 'tutorial') {
      dispatch({ kind: 'COMPLETE_TUTORIAL' });
    }
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setInfoModalOpen(false);
    setPreviewEnding(null);
    setDayStep(deriveStepFromState(state));
    setShowStartMenu(false);
  };

  const handleJumpToDay = (day: DayNumber) => {
    soundEngine.unlock();
    soundEngine.playCue('confirm');
    dispatch({ kind: 'JUMP_TO_TARGET', target: DAY_TO_JUMP_TARGET[day] });
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setInfoModalOpen(false);
    setPreviewEnding(null);
    setDayStep('chapter_intro');
    setShowStartMenu(false);
  };

  const handleRestartDay1FromHud = () => {
    soundEngine.unlock();
    soundEngine.playCue('confirm');
    clearSavedGameState();
    dispatch({ kind: 'JUMP_TO_TARGET', target: 'day_1' });
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setInfoModalOpen(false);
    setPreviewEnding(null);
    setDayStep('chapter_intro');
  };

  const handleFinishOpeningCutscene = () => {
    soundEngine.playCue('confirm');
    dispatch({ kind: 'FINISH_OPENING_CUTSCENE' });
    dispatch({ kind: 'COMPLETE_TUTORIAL' });
    setActiveDialogueCrew(null);
    setAiAdvisorOpen(false);
    setPreviewEnding(null);
    setDayStep('chapter_intro');
  };

  const handleTalkToCrew = (crewId: CrewId) => {
    setActiveDialogueCrew(crewId);
    if (dayStep === 'midday_walk') {
      setDayStep('midday_intro');
    } else {
      setDayStep('morning_intro');
    }
  };

  const handleStartMorningMiniGame = () => {
    const morningCfg = DAY_MORNING_CONFIG[state.day];
    setActiveDialogueCrew(null);
    dispatch({ kind: 'OPEN_MINIGAME', miniGame: morningCfg.miniGame });
    setDayStep('morning_minigame');
  };

  const handleStartMiddayMiniGame = () => {
    const middayCfg = DAY_MIDDAY_CONFIG[state.day];
    setActiveDialogueCrew(null);
    dispatch({ kind: 'OPEN_MINIGAME', miniGame: middayCfg.miniGame });
    setDayStep('midday_minigame');
  };

  const handleMorningMiniGameComplete = (
    miniGame: MiniGameId,
    grade: MiniGameGrade,
    extra?: { landingSite?: LandingSite; touchdownVelocity?: number },
  ) => {
    if (!state.rosterConfirmedForDay) {
      dispatch({ kind: 'CONFIRM_MORNING_ROSTER' });
    }
    dispatch({
      kind: 'COMPLETE_MINIGAME',
      miniGame,
      grade,
      ...(extra?.landingSite ? { landingSite: extra.landingSite } : {}),
      ...(typeof extra?.touchdownVelocity === 'number'
        ? { touchdownVelocity: extra.touchdownVelocity }
        : {}),
    });

    if (state.day < 7) {
      if (state.shift === 'morning') {
        dispatch({ kind: 'ADVANCE_SHIFT' });
      }
    } else if (state.shift === 'morning') {
      dispatch({ kind: 'ADVANCE_DAY7_SUBSTAGE', stage: 'part_b_blackout' });
    }

    setDayStep('midday_walk');
  };

  const handleMiddayMiniGameComplete = (
    _miniGame: MiniGameId,
    grade: MiniGameGrade,
  ) => {
    dispatch({ kind: 'OPEN_MINIGAME', miniGame: null });
    dispatch({ kind: 'REPAIR_MIDDAY_ANOMALY', grade });
    dispatch({ kind: 'ADVANCE_SHIFT' });
    setDayStep('decision');
  };

  const handleCloseMiniGame = () => {
    soundEngine.playCue('click');
    dispatch({ kind: 'OPEN_MINIGAME', miniGame: null });
    setDayStep(dayStep === 'midday_minigame' ? 'midday_walk' : 'morning_walk');
  };

  const handleDecisionComplete = (finishedDay: DayNumber) => {
    setAiAdvisorOpen(false);
    if (finishedDay < 7) {
      setCompletedDayNum(finishedDay);
      setDayStep('day_complete');
    } else {
      setDayStep('chapter_intro');
    }
  };

  // Preview Any of the 4 Alternative Endings directly (from DebriefScreen or TopHud)
  if (previewEnding !== null) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#090D16]">
        <EndingCutscene
          state={state}
          ending={previewEnding}
          onOpenDebrief={() => setPreviewEnding(null)}
        />
      </div>
    );
  }

  // Initial Start Menu (never auto-start straight into cutscenes or gameplay)
  if (showStartMenu) {
    return (
      <div
        onPointerDown={handleStartMenuPointerDown}
        className="h-screen w-screen overflow-hidden relative bg-[#090D16] flex items-center justify-center text-[#F8FAFC] select-none p-3 sm:p-4"
      >
        {/* 60fps Live Animated Pixel-Art Canvas Background */}
        <canvas
          ref={startCanvasRef}
          width={BASE_CANVAS_WIDTH}
          height={BASE_CANVAS_HEIGHT}
          className="absolute inset-0 w-full h-full object-cover pixelated pointer-events-none"
          aria-hidden="true"
        />

        {/* Sleek Gradient Vignette for Foreground Readability */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#090D16]/65 via-[#090D16]/50 to-[#090D16]/85"
          aria-hidden="true"
        />

        {/* Top-Right Music Button with Animated Equalizer Bars */}
        <button
          type="button"
          onClick={handleToggleStartMute}
          onMouseEnter={() => soundEngine.playCue('hover')}
          className="absolute top-4 right-4 z-20 px-4 py-2 rounded-2xl bg-[#0F172A]/90 hover:bg-[#1E293B] border-2 border-[#79C8E8]/65 text-sm font-extrabold text-[#F8FAFC] flex items-center gap-2.5 cursor-pointer shadow-lg transition-transform duration-150 hover:scale-[1.02]"
        >
          <span aria-hidden="true">{state.muted ? '🔇' : '🔊'}</span>
          <span>{state.muted ? 'MUSIC OFF' : 'MUSIC ON'}</span>
          {!state.muted ? (
            <span className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
              <span className="w-1 h-full rounded-full bg-[#9BD8A7] eq-bar eq-bar-1" />
              <span className="w-1 h-full rounded-full bg-[#79C8E8] eq-bar eq-bar-2" />
              <span className="w-1 h-full rounded-full bg-[#FFD66B] eq-bar eq-bar-3" />
              <span className="w-1 h-full rounded-full bg-[#9BD8A7] eq-bar eq-bar-4" />
            </span>
          ) : null}
        </button>

        {/* Centered Sleek Start Card */}
        <div className="relative z-10 w-full max-w-xl rounded-3xl bg-[#0F172A]/92 border-2 border-[#79C8E8]/70 start-card-glow p-5 sm:p-6 flex flex-col items-center text-center gap-3.5 backdrop-blur-md">
          <div className="moon-float inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1E293B] border border-[#FFD66B]/70 text-xs font-extrabold uppercase tracking-widest text-[#FFD66B]">
            <span aria-hidden="true">🚀</span>
            <span>7-DAY NASA LUNAR ADVENTURE</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F8FAFC] drop-shadow"
              style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
            >
              🌙 MOON WEEK
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#79C8E8]">
              Run a Moon Base! Ages 7–12
            </p>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handlePlayNewGame}
              onMouseEnter={() => soundEngine.playCue('hover')}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#9BD8A7] hover:bg-[#7fc98e] text-[#090D16] text-2xl font-extrabold tracking-wide shadow-lg shadow-[#9BD8A7]/30 border-2 border-[#cef2d5] cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
              style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
            >
              ▶ PLAY GAME
            </button>

            {hasSavedProgress ? (
              <button
                type="button"
                onClick={handleContinueGame}
                onMouseEnter={() => soundEngine.playCue('hover')}
                className="w-full py-3 px-6 rounded-2xl bg-[#1E293B] hover:bg-slate-700 border-2 border-[#79C8E8]/70 text-[#F8FAFC] text-lg font-extrabold tracking-wide cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                ▶ CONTINUE (DAY {state.day})
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                soundEngine.unlock();
                soundEngine.playCue('click');
                setInfoModalOpen(true);
              }}
              onMouseEnter={() => soundEngine.playCue('hover')}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#1E293B] hover:bg-slate-700 border-2 border-[#FFD66B]/65 text-[#FFD66B] text-sm sm:text-base font-extrabold tracking-wide cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
              style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
            >
              📚 ADDITIONAL INFO (SUIT, MACHINES &amp; NASA DATA)
            </button>
          </div>

          {/* Compact Select Day 1..7 Quick-Jump Row */}
          <div className="w-full pt-2.5 border-t border-slate-700/80 flex flex-col items-center gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              SELECT DAY (1–7)
            </span>
            <div className="grid grid-cols-7 gap-2 w-full">
              {DAY_LIST.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleJumpToDay(day)}
                  onMouseEnter={() => soundEngine.playCue('hover')}
                  className="h-9 rounded-xl bg-[#1E293B] hover:bg-[#79C8E8] hover:text-[#090D16] border border-slate-600 hover:border-[#79C8E8] text-sm font-extrabold text-[#F8FAFC] cursor-pointer transition-transform duration-150 hover:scale-[1.04]"
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {infoModalOpen ? (
          <AdditionalInfoModal onClose={() => setInfoModalOpen(false)} />
        ) : null}
      </div>
    );
  }

  // Opening Cutscene
  if (state.screenStage === 'opening_cutscene') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#090D16]">
        <OpeningCutscene state={state} onComplete={handleFinishOpeningCutscene} />
      </div>
    );
  }

  // Ending Cutscene
  if (state.screenStage === 'ending_cutscene') {
    const resolvedEnding = state.ending ?? computeMissionEnding(state);
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#090D16]">
        <EndingCutscene
          state={state}
          ending={resolvedEnding}
          onOpenDebrief={() => dispatch({ kind: 'OPEN_DEBRIEF' })}
        />
      </div>
    );
  }

  // Scorecard Debrief Screen
  if (state.screenStage === 'debrief') {
    return (
      <DebriefScreen
        state={state}
        dispatch={dispatch}
        onPlayAgain={handlePlayNewGame}
        onPreviewEnding={(ending) => setPreviewEnding(ending)}
      />
    );
  }

  // Gameplay Loop: 6-Beat Sequential Story per Day (1..7)
  const morningConfig = DAY_MORNING_CONFIG[state.day];
  const middayConfig = DAY_MIDDAY_CONFIG[state.day];
  const scenario = DAILY_SCENARIOS[state.day];
  const chapterEvent = CHAPTER_EVENTS[state.day];

  const activeMissionPhase: 'morning' | 'midday' =
    dayStep === 'midday_walk' || dayStep === 'midday_intro' || dayStep === 'midday_minigame'
      ? 'midday'
      : 'morning';

  const isWalkingBeat = dayStep === 'morning_walk' || dayStep === 'midday_walk';
  const isOverlayOpen = !isWalkingBeat || infoModalOpen;

  const activeMiniGame: MiniGameId =
    state.activeMiniGame ??
    (dayStep === 'midday_minigame' ? middayConfig.miniGame : morningConfig.miniGame);

  const isMiddayMiniGame = dayStep === 'midday_minigame';

  const renderMiniGameOverlay = () => {
    const onCompleteSimple = (grade: MiniGameGrade) =>
      isMiddayMiniGame
        ? handleMiddayMiniGameComplete(activeMiniGame, grade)
        : handleMorningMiniGameComplete(activeMiniGame, grade);

    switch (activeMiniGame) {
      case 'lunar_lander':
        return (
          <LunarLanderGame
            state={state}
            onComplete={(grade, site, touchdownVelocity) =>
              isMiddayMiniGame
                ? handleMiddayMiniGameComplete('lunar_lander', grade)
                : handleMorningMiniGameComplete('lunar_lander', grade, {
                    landingSite: site,
                    touchdownVelocity,
                  })
            }
            onClose={handleCloseMiniGame}
          />
        );
      case 'greenhouse':
        return (
          <GreenhouseMiniGame
            state={state}
            onComplete={onCompleteSimple}
            onClose={handleCloseMiniGame}
          />
        );
      case 'power_grid':
        return (
          <PowerGridMiniGame
            state={state}
            onComplete={onCompleteSimple}
            onClose={handleCloseMiniGame}
          />
        );
      case 'radiation':
        return (
          <RadiationMiniGame
            state={state}
            onComplete={onCompleteSimple}
            onClose={handleCloseMiniGame}
          />
        );
      case 'medbay':
        return (
          <MedbayMiniGame
            state={state}
            onComplete={onCompleteSimple}
            onClose={handleCloseMiniGame}
          />
        );
      case 'rover_surface':
        return (
          <RoverSurfaceMiniGame
            state={state}
            onComplete={onCompleteSimple}
            onClose={handleCloseMiniGame}
          />
        );
      default: {
        const _exhaustive: never = activeMiniGame;
        return _exhaustive;
      }
    }
  };

  const completedRecord = state.decisions.find((d) => d.day === completedDayNum);
  const completedSummary = getDayChoiceTransformation(completedRecord, state);
  const middaySpecialistProfile = CREW_PROFILES[scenario.anomaly.specialistId];

  const dayCompleteBars: Array<{
    icon: string;
    label: string;
    value: number;
    colorClass: string;
  }> = [
    { icon: '⚡', label: 'Power', value: state.primary.power, colorClass: 'bg-[#FFD66B]' },
    { icon: '💧', label: 'Air', value: state.primary.lifeSupport, colorClass: 'bg-[#79C8E8]' },
    { icon: '🛡️', label: 'Shield', value: state.primary.shielding, colorClass: 'bg-[#A995E8]' },
    { icon: '😊', label: 'Morale', value: state.primary.crewReadiness, colorClass: 'bg-[#9BD8A7]' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#090D16] text-[#F8FAFC] select-none">
      <TopHud
        state={state}
        dispatch={dispatch}
        currentStep={dayStep}
        displayDay={dayStep === 'day_complete' ? completedDayNum : state.day}
        onOpenStartMenu={() => setShowStartMenu(true)}
        onRestartDay1={handleRestartDay1FromHud}
        onJumpDay={handleJumpToDay}
        onOpenInfoModal={() => setInfoModalOpen(true)}
        onPreviewEnding={(ending) => setPreviewEnding(ending)}
      />

      <main className="flex-1 min-h-0 relative overflow-hidden">
        <TopDownLunarBase
          state={state}
          dispatch={dispatch}
          missionPhase={activeMissionPhase}
          onTalkToCrew={handleTalkToCrew}
          onOpenMiniGame={(miniGame) => {
            setActiveDialogueCrew(null);
            dispatch({ kind: 'OPEN_MINIGAME', miniGame });
            setDayStep(dayStep === 'midday_walk' ? 'midday_minigame' : 'morning_minigame');
          }}
          onOpenDecisionModal={() => {
            if (state.shift === 'evening' && !state.eveningDecisionCompletedForDay) {
              setDayStep('decision');
            }
          }}
          isOverlayOpen={isOverlayOpen}
        />

        {/* Midday Obstacle Floating Alert Banner during midday_walk */}
        {dayStep === 'midday_walk' ? (
          <div className="pointer-events-none absolute top-3 inset-x-4 z-20 flex justify-center">
            <div className="rounded-2xl bg-[#2A1119]/92 border-2 border-[#F87171]/80 px-4 py-2 shadow-xl backdrop-blur-sm flex items-center gap-3">
              <span className="text-lg animate-pulse" aria-hidden="true">
                ⚠️
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#F8FAFC]">
                MIDDAY OBSTACLE: {scenario.anomaly.title} — Meet {middaySpecialistProfile.name}!
              </span>
            </div>
          </div>
        ) : null}

        {/* Safety Fallback Pill if player pressed Escape out of Evening Decision */}
        {isWalkingBeat && state.shift === 'evening' && !state.eveningDecisionCompletedForDay ? (
          <div className="absolute top-3 right-4 z-20">
            <button
              type="button"
              onClick={() => {
                soundEngine.playCue('confirm');
                setDayStep('decision');
              }}
              className="rounded-xl bg-[#FFD66B] hover:bg-[#f2c44c] px-4 py-2 text-xs font-extrabold text-[#090D16] shadow-lg cursor-pointer"
            >
              ⚖️ OPEN DAY {state.day} CHOICE
            </button>
          </div>
        ) : null}

        {/* Beat 1: Animated Visual Event Cut-In */}
        {dayStep === 'chapter_intro' ? (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/82 backdrop-blur-sm p-3 select-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chapter-event-title"
          >
            <div
              className={`w-full max-w-xl max-h-[92vh] overflow-hidden rounded-3xl bg-[#0F172A] border-2 ${chapterEvent.borderClass} shadow-2xl p-5 flex flex-col items-center text-center gap-3.5`}
            >
              <span
                className={`px-3.5 py-1 rounded-full border text-xs font-extrabold uppercase tracking-wider ${chapterEvent.badgeClass}`}
              >
                {chapterEvent.badge}
              </span>

              <h2
                id="chapter-event-title"
                className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] leading-tight"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                {chapterEvent.title}
              </h2>

              <ChapterEventSceneSvg day={state.day} />

              <p className="text-sm sm:text-base font-bold text-slate-200 leading-snug">
                {chapterEvent.summary}
              </p>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playCue('confirm');
                  setDayStep(
                    state.shift === 'midday'
                      ? 'midday_walk'
                      : state.shift === 'evening'
                        ? 'decision'
                        : 'morning_walk',
                  );
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#FFD66B] hover:bg-[#f2c44c] text-[#090D16] text-lg font-extrabold tracking-wide shadow-lg shadow-[#FFD66B]/25 cursor-pointer transition-colors"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                {state.shift === 'midday'
                  ? `FIX OBSTACLE ON DAY ${state.day} →`
                  : `BEGIN DAY ${state.day} →`}
              </button>
            </div>
          </div>
        ) : null}

        {/* Beat 2b: Morning Specialist Science Briefing */}
        {dayStep === 'morning_intro' ? (
          <DialoguePanel
            state={state}
            crewId={activeDialogueCrew ?? morningConfig.crewId}
            missionPhase="morning"
            onClose={() => setDayStep('morning_walk')}
            onStartMiniGame={handleStartMorningMiniGame}
            onOpenMiniGame={handleStartMorningMiniGame}
          />
        ) : null}

        {/* Beat 3b: Midday Obstacle Specialist Briefing */}
        {dayStep === 'midday_intro' ? (
          <DialoguePanel
            state={state}
            crewId={activeDialogueCrew ?? scenario.anomaly.specialistId}
            missionPhase="midday"
            onClose={() => setDayStep('midday_walk')}
            onStartMiniGame={handleStartMiddayMiniGame}
            onOpenMiniGame={handleStartMiddayMiniGame}
          />
        ) : null}

        {/* Beat 2c / 3c: Morning or Midday Mini-Game */}
        {dayStep === 'morning_minigame' || dayStep === 'midday_minigame' ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/85 backdrop-blur-sm p-3 sm:p-4">
            {renderMiniGameOverlay()}
          </div>
        ) : null}

        {/* Beat 4: Evening Compounding Decision Modal */}
        {dayStep === 'decision' ? (
          <DecisionModal
            state={state}
            dispatch={dispatch}
            onClose={() => setDayStep('midday_walk')}
            onOpenAiAdvisor={() => setAiAdvisorOpen(true)}
            onDecisionComplete={handleDecisionComplete}
          />
        ) : null}

        {/* Compact Earth Control Radio Popup (Abdul) */}
        {aiAdvisorOpen ? (
          <AiAdvisorModal state={state} onClose={() => setAiAdvisorOpen(false)} />
        ) : null}

        {/* Choice Consequence & "Base & Crew Updated!" Card */}
        {dayStep === 'day_complete' ? (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/82 backdrop-blur-sm p-3"
            role="dialog"
            aria-modal="true"
            aria-label={`Day ${completedDayNum} complete`}
          >
            <div className="w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl bg-[#0F172A] border-2 border-[#FFD66B]/75 shadow-2xl p-5 flex flex-col items-center text-center gap-3.5">
              <div className="flex flex-col items-center gap-1">
                <span className="px-3 py-0.5 rounded-full bg-[#9BD8A7]/15 border border-[#9BD8A7]/50 text-xs font-extrabold uppercase tracking-wider text-[#9BD8A7]">
                  ✨ Base &amp; Crew Updated!
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-extrabold text-[#FFD66B]"
                  style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
                >
                  🌟 DAY {completedDayNum} COMPLETE! — {completedSummary.choiceTitle}
                </h2>
              </div>

              {/* Base & Crew Physical Transformation Summary */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl bg-[#11192E] border border-[#79C8E8]/50 p-3.5 flex flex-col gap-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#79C8E8]">
                    🏠 Base Transformation
                  </span>
                  <p className="text-sm font-bold text-[#F8FAFC] leading-snug">
                    {completedSummary.baseChange}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#11192E] border border-[#9BD8A7]/50 p-3.5 flex items-center gap-3">
                  <div className="p-1 rounded-xl bg-[#1E293B] border border-slate-600 shrink-0">
                    <CrewAvatar
                      crewId={completedSummary.crewId}
                      expression={completedSummary.crewExpression}
                      size="sm"
                    />
                  </div>
                  <div className="min-w-0 flex flex-col gap-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#9BD8A7]">
                      👩‍🚀 Crew Reaction
                    </span>
                    <p className="text-sm font-bold text-[#F8FAFC] leading-snug">
                      {completedSummary.crewChange}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Live Resource Bars */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {dayCompleteBars.map((bar) => {
                  const pct = Math.max(0, Math.min(100, Math.round(bar.value)));
                  return (
                    <div
                      key={bar.label}
                      className="rounded-xl bg-[#11192E] border border-slate-700/80 p-2.5 flex flex-col gap-1 text-left"
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="flex items-center gap-1 text-slate-100">
                          <span aria-hidden="true">{bar.icon}</span>
                          <span>{bar.label}</span>
                        </span>
                        <span className="tabular-nums text-[#F8FAFC]">{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${bar.colorClass}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playCue('confirm');
                  setDayStep('chapter_intro');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#9BD8A7] hover:bg-[#7fc98e] text-[#090D16] text-xl font-extrabold tracking-wide shadow-lg shadow-[#9BD8A7]/25 cursor-pointer transition-colors"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                START DAY {completedDayNum + 1} →
              </button>
            </div>
          </div>
        ) : null}

        {infoModalOpen ? (
          <AdditionalInfoModal onClose={() => setInfoModalOpen(false)} />
        ) : null}
      </main>
    </div>
  );
}

export default App;
