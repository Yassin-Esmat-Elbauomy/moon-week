import React from 'react';
import { CREW_PROFILES, ON_BASE_CREW_IDS } from '../data/crewProfiles';
import { DAILY_SCENARIOS } from '../data/dailyScenarios';
import type {
  CrewExpression,
  CrewId,
  DayNumber,
  EndingId,
  GameState,
  MiniGameId,
  OnBaseCrewId,
  RoomId,
} from '../types/game';

export type MissionPhase = 'morning' | 'midday';

export interface RoomBound {
  id: RoomId;
  name: string;
  shortLabel: string;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  specialistId?: OnBaseCrewId;
  miniGame?: MiniGameId;
}

export const BASE_CANVAS_WIDTH = 1280;
export const BASE_CANVAS_HEIGHT = 720;

export const ROOM_BOUNDS: Record<RoomId, RoomBound> = {
  comms_room: {
    id: 'comms_room',
    name: 'Lunar Comms Room',
    shortLabel: 'COMMS',
    x: 214,
    y: 170,
    width: 236,
    height: 166,
    centerX: 332,
    centerY: 253,
    specialistId: 'taha',
    miniGame: 'rover_surface',
  },
  control_room: {
    id: 'control_room',
    name: 'Command Bridge',
    shortLabel: 'CONTROL',
    x: 462,
    y: 170,
    width: 268,
    height: 166,
    centerX: 596,
    centerY: 253,
    miniGame: 'lunar_lander',
  },
  science_lab: {
    id: 'science_lab',
    name: 'Science Lab & Shield Bay',
    shortLabel: 'SCIENCE LAB',
    x: 742,
    y: 170,
    width: 236,
    height: 166,
    centerX: 860,
    centerY: 253,
    specialistId: 'sayed',
    miniGame: 'radiation',
  },
  main_habitat: {
    id: 'main_habitat',
    name: 'Habitat & Life Support',
    shortLabel: 'HABITAT CORE',
    x: 214,
    y: 348,
    width: 764,
    height: 132,
    centerX: 596,
    centerY: 414,
  },
  power_station: {
    id: 'power_station',
    name: 'Power Core',
    shortLabel: 'POWER CORE',
    x: 214,
    y: 492,
    width: 182,
    height: 174,
    centerX: 305,
    centerY: 579,
    specialistId: 'albaraa',
    miniGame: 'power_grid',
  },
  medbay: {
    id: 'medbay',
    name: 'Medbay & Quarters',
    shortLabel: 'MEDBAY',
    x: 408,
    y: 492,
    width: 196,
    height: 174,
    centerX: 506,
    centerY: 579,
    specialistId: 'omar',
    miniGame: 'medbay',
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Hydroponic Greenhouse',
    shortLabel: 'GREENHOUSE',
    x: 616,
    y: 492,
    width: 182,
    height: 174,
    centerX: 707,
    centerY: 579,
    specialistId: 'sayed',
    miniGame: 'greenhouse',
  },
  robotics_bay: {
    id: 'robotics_bay',
    name: 'Robotics Bay & Airlock',
    shortLabel: 'ROBOTICS',
    x: 810,
    y: 492,
    width: 168,
    height: 174,
    centerX: 894,
    centerY: 579,
    specialistId: 'yassin',
    miniGame: 'rover_surface',
  },
};

export const ROOM_ORDER: readonly RoomId[] = [
  'comms_room',
  'control_room',
  'science_lab',
  'main_habitat',
  'power_station',
  'medbay',
  'greenhouse',
  'robotics_bay',
];

export interface FeaturedDayTarget {
  day: DayNumber;
  crewId: OnBaseCrewId;
  crewShortName: string;
  badgeText: string;
  roomId: RoomId;
  roomLabel: string;
  crewX: number;
  crewY: number;
  meetX: number;
  meetY: number;
}

export function getFeaturedDayTarget(day: DayNumber): FeaturedDayTarget {
  switch (day) {
    case 1: {
      const r = ROOM_BOUNDS.power_station;
      return {
        day: 1,
        crewId: 'albaraa',
        crewShortName: 'Al-Baraa',
        badgeText: '★ MEET AL-BARAA',
        roomId: 'power_station',
        roomLabel: 'Power Room',
        crewX: r.centerX + 26,
        crewY: r.y + 104,
        meetX: r.centerX - 24,
        meetY: r.y + 104,
      };
    }
    case 2: {
      const r = ROOM_BOUNDS.greenhouse;
      return {
        day: 2,
        crewId: 'sayed',
        crewShortName: 'Sayed',
        badgeText: '★ MEET SAYED',
        roomId: 'greenhouse',
        roomLabel: 'Greenhouse',
        crewX: r.centerX + 25,
        crewY: r.centerY + 10,
        meetX: r.centerX - 25,
        meetY: r.centerY + 10,
      };
    }
    case 3: {
      const r = ROOM_BOUNDS.comms_room;
      return {
        day: 3,
        crewId: 'taha',
        crewShortName: 'Taha',
        badgeText: '★ MEET TAHA',
        roomId: 'comms_room',
        roomLabel: 'Comms Room',
        crewX: r.centerX + 36,
        crewY: r.centerY + 14,
        meetX: r.centerX - 16,
        meetY: r.centerY + 14,
      };
    }
    case 4: {
      const r = ROOM_BOUNDS.control_room;
      return {
        day: 4,
        crewId: 'taha',
        crewShortName: 'Taha',
        badgeText: '★ MEET TAHA',
        roomId: 'control_room',
        roomLabel: 'Storm Shield Room',
        crewX: r.centerX + 38,
        crewY: r.y + 74,
        meetX: r.centerX - 38,
        meetY: r.y + 74,
      };
    }
    case 5: {
      const r = ROOM_BOUNDS.medbay;
      return {
        day: 5,
        crewId: 'omar',
        crewShortName: 'Omar',
        badgeText: '★ MEET OMAR',
        roomId: 'medbay',
        roomLabel: 'Medbay',
        crewX: r.centerX + 28,
        crewY: r.y + 76,
        meetX: r.centerX - 26,
        meetY: r.y + 76,
      };
    }
    case 6: {
      const r = ROOM_BOUNDS.robotics_bay;
      return {
        day: 6,
        crewId: 'yassin',
        crewShortName: 'Yassin',
        badgeText: '★ MEET YASSIN',
        roomId: 'robotics_bay',
        roomLabel: 'Rover Pad',
        crewX: r.centerX + 28,
        crewY: r.y + 64,
        meetX: r.centerX - 24,
        meetY: r.y + 64,
      };
    }
    case 7: {
      const r = ROOM_BOUNDS.control_room;
      return {
        day: 7,
        crewId: 'albaraa',
        crewShortName: 'Al-Baraa',
        badgeText: '★ MEET AL-BARAA',
        roomId: 'control_room',
        roomLabel: 'Command Bridge',
        crewX: r.centerX + 38,
        crewY: r.y + 74,
        meetX: r.centerX - 38,
        meetY: r.y + 74,
      };
    }
    default: {
      const _exhaustive: never = day;
      return _exhaustive;
    }
  }
}

function getFriendlyRoomLabel(roomId: RoomId): string {
  switch (roomId) {
    case 'comms_room':
      return 'Comms Room';
    case 'control_room':
      return 'Command Bridge';
    case 'science_lab':
      return 'Science Lab';
    case 'main_habitat':
      return 'Habitat Core';
    case 'power_station':
      return 'Power Room';
    case 'medbay':
      return 'Medbay';
    case 'greenhouse':
      return 'Greenhouse';
    case 'robotics_bay':
      return 'Rover Pad';
    default: {
      const _exhaustive: never = roomId;
      return _exhaustive;
    }
  }
}

export function getActiveDayTarget(
  day: DayNumber,
  missionPhase: MissionPhase = 'morning',
  state?: Readonly<GameState>,
): FeaturedDayTarget {
  if (missionPhase === 'morning') {
    return getFeaturedDayTarget(day);
  }
  const anomaly =
    state?.anomaly && state.anomaly.day === day
      ? state.anomaly
      : DAILY_SCENARIOS[day].anomaly;
  const room = ROOM_BOUNDS[anomaly.roomId];
  const crewProfile = CREW_PROFILES[anomaly.specialistId];
  const crewShortName = crewProfile.name.split(' ')[0] ?? crewProfile.name;
  const crewY =
    anomaly.roomId === 'main_habitat'
      ? room.centerY + 8
      : room.y + Math.min(104, Math.round(room.height * 0.58));

  return {
    day,
    crewId: anomaly.specialistId,
    crewShortName,
    badgeText: `⚠ FIX: ${anomaly.title.toUpperCase()}`,
    roomId: anomaly.roomId,
    roomLabel: getFriendlyRoomLabel(anomaly.roomId),
    crewX: room.centerX + 26,
    crewY,
    meetX: room.centerX - 24,
    meetY: crewY,
  };
}

export interface GuidePoint {
  readonly x: number;
  readonly y: number;
}

function findContainingRoomId(x: number, y: number): RoomId | null {
  for (const roomId of ROOM_ORDER) {
    const r = ROOM_BOUNDS[roomId];
    if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
      return roomId;
    }
  }
  return null;
}

function getRoomDoorwayY(roomId: RoomId): number {
  const r = ROOM_BOUNDS[roomId];
  return r.y < ROOM_BOUNDS.main_habitat.y ? 342 : 486;
}

export function getGuideWaypointsToRoom(
  startX: number,
  startY: number,
  roomId: RoomId,
  meetX: number,
  meetY: number,
): readonly GuidePoint[] {
  const points: GuidePoint[] = [{ x: startX, y: startY }];
  const startRoom = findContainingRoomId(startX, startY);

  if (startRoom === roomId) {
    points.push({ x: meetX, y: meetY });
    return points;
  }

  const corridorY = 458;
  const targetRoom = ROOM_BOUNDS[roomId];
  const targetDoorX = targetRoom.centerX;
  const targetDoorY = getRoomDoorwayY(roomId);

  if (startRoom !== null && startRoom !== 'main_habitat') {
    const exitDoorX = ROOM_BOUNDS[startRoom].centerX;
    const exitDoorY = getRoomDoorwayY(startRoom);
    points.push({ x: exitDoorX, y: exitDoorY });
    points.push({ x: exitDoorX, y: corridorY });
  } else if (Math.abs(startY - corridorY) > 10 && Math.abs(startX - targetDoorX) > 24) {
    points.push({ x: startX, y: corridorY });
  }

  if (roomId !== 'main_habitat') {
    points.push({ x: targetDoorX, y: corridorY });
    points.push({ x: targetDoorX, y: targetDoorY });
  } else {
    points.push({ x: meetX, y: corridorY });
  }
  points.push({ x: meetX, y: meetY });
  return points;
}

/** Waypoints routing cleanly through pressurized doorways toward today's featured crew mate. */
export function getFeaturedGuideWaypoints(
  startX: number,
  startY: number,
  featured: FeaturedDayTarget,
): readonly GuidePoint[] {
  return getGuideWaypointsToRoom(
    startX,
    startY,
    featured.roomId,
    featured.meetX,
    featured.meetY,
  );
}

export type SpriteFacing = 'down' | 'up' | 'left' | 'right';

export interface RegolithDustPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  size: number;
}

export interface BaseMapViewState {
  commanderX: number;
  commanderY: number;
  targetX: number;
  targetY: number;
  hoveredRoom: RoomId | null;
  selectedRoom: RoomId | null;
  animTick: number;
  elapsedMs?: number;
  commanderMoving?: boolean;
  commanderDir?: SpriteFacing;
  walkPhase?: number;
  dustPuffs?: readonly RegolithDustPuff[];
  missionPhase?: MissionPhase;
}

export interface CrewAvatarProps {
  crewId: CrewId;
  expression: CrewExpression;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showNameBadge?: boolean;
}

// ADR-0003 override seam: drop PNGs under public/assets/avatars/<crewId>/<expression>.png and register here to load without 404 probes
const REGISTERED_AVATAR_PNGS: Partial<Record<CrewId, readonly CrewExpression[]>> = {};

function hasRegisteredAvatarPng(crewId: CrewId, expression: CrewExpression): boolean {
  return REGISTERED_AVATAR_PNGS[crewId]?.includes(expression) ?? false;
}

export function resolveCrewAvatarUrl(crewId: CrewId, expression: CrewExpression): string {
  return `/assets/avatars/${crewId}/${expression}.png`;
}

const AVATAR_PIXEL_SIZES: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 128,
};

function darkenHex(hex: string, amount: number): string {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  if (clean.length !== 6) {
    return '#1E293B';
  }
  const r = Math.max(0, Math.min(255, parseInt(clean.slice(0, 2), 16) - amount));
  const g = Math.max(0, Math.min(255, parseInt(clean.slice(2, 4), 16) - amount));
  const b = Math.max(0, Math.min(255, parseInt(clean.slice(4, 6), 16) - amount));
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return '#1E293B';
  }
  const toHex = (n: number): string => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function renderHairElements(
  hairStyle: 'short_wave' | 'neat_crop' | 'curly_top' | 'spiky' | 'side_part' | 'fade',
  hairColor: string,
): React.ReactNode[] {
  const shade = darkenHex(hairColor, 26);
  switch (hairStyle) {
    case 'short_wave':
      return [
        React.createElement('path', {
          key: 'h-base',
          d: 'M38 50 C38 33, 82 33, 82 50 L79 44 C73 39, 64 43, 55 41 C48 39, 43 43, 40 46 Z',
          fill: hairColor,
        }),
        React.createElement('path', {
          key: 'h-wave',
          d: 'M43 41 Q54 35 66 39 Q74 41 78 45',
          stroke: shade,
          strokeWidth: 2,
          fill: 'none',
          strokeLinecap: 'round',
        }),
      ];
    case 'neat_crop':
      return [
        React.createElement('path', {
          key: 'h-crop',
          d: 'M39 50 C39 34, 81 34, 81 50 L79 45 C72 40, 48 40, 41 45 Z',
          fill: hairColor,
        }),
        React.createElement('rect', {
          key: 'h-trim',
          x: 44,
          y: 38,
          width: 32,
          height: 3,
          rx: 1.5,
          fill: shade,
          opacity: 0.45,
        }),
      ];
    case 'curly_top':
      return [
        React.createElement('circle', { key: 'c1', cx: 46, cy: 40, r: 7, fill: hairColor }),
        React.createElement('circle', { key: 'c2', cx: 56, cy: 36, r: 8, fill: hairColor }),
        React.createElement('circle', { key: 'c3', cx: 66, cy: 37, r: 8, fill: hairColor }),
        React.createElement('circle', { key: 'c4', cx: 75, cy: 41, r: 6.5, fill: hairColor }),
        React.createElement('circle', { key: 'c5', cx: 41, cy: 45, r: 5, fill: shade }),
        React.createElement('circle', { key: 'c6', cx: 79, cy: 46, r: 5, fill: shade }),
      ];
    case 'spiky':
      return [
        React.createElement('path', {
          key: 'h-spike',
          d: 'M39 49 L41 38 L48 42 L53 31 L60 39 L67 30 L72 41 L79 36 L81 49 L77 45 L43 45 Z',
          fill: hairColor,
          strokeLinejoin: 'round',
        }),
        React.createElement('path', {
          key: 'h-spike-hi',
          d: 'M53 34 L59 40 L66 34',
          stroke: shade,
          strokeWidth: 1.8,
          fill: 'none',
        }),
      ];
    case 'side_part':
      return [
        React.createElement('path', {
          key: 'h-side',
          d: 'M39 51 C38 33, 81 32, 81 49 L78 44 C70 43, 62 39, 51 43 C45 45, 42 47, 39 51 Z',
          fill: hairColor,
        }),
        React.createElement('path', {
          key: 'h-part',
          d: 'M65 36 L60 42',
          stroke: shade,
          strokeWidth: 2,
          strokeLinecap: 'round',
        }),
      ];
    case 'fade':
      return [
        React.createElement('path', {
          key: 'h-fade',
          d: 'M40 48 C40 35, 80 35, 80 48 L77 43 C70 39, 50 39, 43 43 Z',
          fill: hairColor,
        }),
        React.createElement('rect', {
          key: 'h-fade-side-l',
          x: 39,
          y: 45,
          width: 3,
          height: 8,
          rx: 1.5,
          fill: shade,
        }),
        React.createElement('rect', {
          key: 'h-fade-side-r',
          x: 78,
          y: 45,
          width: 3,
          height: 8,
          rx: 1.5,
          fill: shade,
        }),
      ];
    default: {
      const _exhaustive: never = hairStyle;
      return _exhaustive;
    }
  }
}

function renderFacialHairElements(
  facialHair: 'none' | 'light_stubble' | 'neat_beard',
  hairColor: string,
): React.ReactNode[] {
  const beardTone = darkenHex(hairColor, 12);
  switch (facialHair) {
    case 'none':
      return [];
    case 'light_stubble':
      return [
        React.createElement('path', {
          key: 'stubble',
          d: 'M45 69 Q60 82 75 69 Q71 78 60 79 Q49 78 45 69 Z',
          fill: beardTone,
          opacity: 0.28,
        }),
      ];
    case 'neat_beard':
      return [
        React.createElement('path', {
          key: 'beard',
          d: 'M43 65 C43 77, 51 82, 60 82 C69 82, 77 77, 77 65 L74 65 C73 72, 67 76, 60 76 C53 76, 47 72, 46 65 Z',
          fill: beardTone,
          opacity: 0.85,
        }),
      ];
    default: {
      const _exhaustive: never = facialHair;
      return _exhaustive;
    }
  }
}

function renderExpressionFeatures(
  expression: CrewExpression,
  hairColor: string,
  accentColor: string,
): React.ReactNode[] {
  const browColor = darkenHex(hairColor, 18);
  const eyeColor = '#0F172A';

  const standardEyes = (pupilOffsetY = 0, radius = 3.1): React.ReactNode[] => [
    React.createElement('ellipse', { key: 'el-w', cx: 51, cy: 58, rx: 4.2, ry: radius + 1.1, fill: '#F8FAFC' }),
    React.createElement('ellipse', { key: 'er-w', cx: 69, cy: 58, rx: 4.2, ry: radius + 1.1, fill: '#F8FAFC' }),
    React.createElement('circle', { key: 'el-p', cx: 51, cy: 58 + pupilOffsetY, r: radius, fill: eyeColor }),
    React.createElement('circle', { key: 'er-p', cx: 69, cy: 58 + pupilOffsetY, r: radius, fill: eyeColor }),
    React.createElement('circle', { key: 'el-g', cx: 52.1, cy: 56.8 + pupilOffsetY, r: 1.1, fill: '#F8FAFC' }),
    React.createElement('circle', { key: 'er-g', cx: 70.1, cy: 56.8 + pupilOffsetY, r: 1.1, fill: '#F8FAFC' }),
  ];

  switch (expression) {
    case 'normal':
      return [
        React.createElement('path', {
          key: 'bl',
          d: 'M46 51.5 Q51 49.5 55.5 51.2',
          stroke: browColor,
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('path', {
          key: 'br',
          d: 'M64.5 51.2 Q69 49.5 74 51.5',
          stroke: browColor,
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        ...standardEyes(0, 2.9),
        React.createElement('path', {
          key: 'm',
          d: 'M53 69 Q60 73.5 67 69',
          stroke: '#7C2D12',
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
      ];

    case 'happy':
      return [
        React.createElement('path', {
          key: 'bl',
          d: 'M45.5 49.5 Q51 46.5 56 49.5',
          stroke: browColor,
          strokeWidth: 2.3,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('path', {
          key: 'br',
          d: 'M64 49.5 Q69 46.5 74.5 49.5',
          stroke: browColor,
          strokeWidth: 2.3,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('path', {
          key: 'el-arc',
          d: 'M46.5 58.5 Q51 53.5 55.5 58.5',
          stroke: eyeColor,
          strokeWidth: 2.6,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('path', {
          key: 'er-arc',
          d: 'M64.5 58.5 Q69 53.5 73.5 58.5',
          stroke: eyeColor,
          strokeWidth: 2.6,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('ellipse', { key: 'ch-l', cx: 46, cy: 64.5, rx: 3.6, ry: 2, fill: '#FB7185', opacity: 0.45 }),
        React.createElement('ellipse', { key: 'ch-r', cx: 74, cy: 64.5, rx: 3.6, ry: 2, fill: '#FB7185', opacity: 0.45 }),
        React.createElement('path', {
          key: 'm-happy',
          d: 'M51.5 68 Q60 76 68.5 68 Z',
          fill: '#F8FAFC',
          stroke: '#7C2D12',
          strokeWidth: 1.8,
          strokeLinejoin: 'round',
        }),
      ];

    case 'worried':
      return [
        React.createElement('path', {
          key: 'bl',
          d: 'M45.5 52.5 Q50.5 49.5 55.5 48.2',
          stroke: browColor,
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('path', {
          key: 'br',
          d: 'M64.5 48.2 Q69.5 49.5 74.5 52.5',
          stroke: browColor,
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        ...standardEyes(0.4, 2.7),
        React.createElement('path', {
          key: 'm-worried',
          d: 'M53 71.5 Q56.5 68.5 60 70.5 Q63.5 72.5 67 69.5',
          stroke: '#7C2D12',
          strokeWidth: 2.1,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('path', {
          key: 'sweat',
          d: 'M76 49 C78 52, 78.5 55, 76 55 C73.5 55, 74 52, 76 49 Z',
          fill: '#79C8E8',
          stroke: '#0284C7',
          strokeWidth: 0.8,
        }),
      ];

    case 'surprised':
      return [
        React.createElement('path', {
          key: 'bl',
          d: 'M46 47.5 Q51 44 56 47.5',
          stroke: browColor,
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('path', {
          key: 'br',
          d: 'M64 47.5 Q69 44 74 47.5',
          stroke: browColor,
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('circle', { key: 'el-w', cx: 51, cy: 57.5, r: 4.8, fill: '#F8FAFC' }),
        React.createElement('circle', { key: 'er-w', cx: 69, cy: 57.5, r: 4.8, fill: '#F8FAFC' }),
        React.createElement('circle', { key: 'el-p', cx: 51, cy: 57.5, r: 2.3, fill: eyeColor }),
        React.createElement('circle', { key: 'er-p', cx: 69, cy: 57.5, r: 2.3, fill: eyeColor }),
        React.createElement('circle', { key: 'el-g', cx: 52, cy: 56.3, r: 1, fill: '#F8FAFC' }),
        React.createElement('circle', { key: 'er-g', cx: 70, cy: 56.3, r: 1, fill: '#F8FAFC' }),
        React.createElement('ellipse', {
          key: 'm-surp',
          cx: 60,
          cy: 70.5,
          rx: 3.8,
          ry: 4.6,
          fill: '#991B1B',
          stroke: '#7C2D12',
          strokeWidth: 1.5,
        }),
      ];

    case 'focused':
      return [
        React.createElement('path', {
          key: 'bl',
          d: 'M45.5 50 L56 52',
          stroke: browColor,
          strokeWidth: 2.5,
          strokeLinecap: 'round',
        }),
        React.createElement('path', {
          key: 'br',
          d: 'M74.5 50 L64 52',
          stroke: browColor,
          strokeWidth: 2.5,
          strokeLinecap: 'round',
        }),
        React.createElement('rect', { key: 'el-f', x: 46.5, y: 55.5, width: 9, height: 4.2, rx: 2, fill: '#F8FAFC' }),
        React.createElement('rect', { key: 'er-f', x: 64.5, y: 55.5, width: 9, height: 4.2, rx: 2, fill: '#F8FAFC' }),
        React.createElement('circle', { key: 'el-fp', cx: 51.5, cy: 57.6, r: 2.3, fill: eyeColor }),
        React.createElement('circle', { key: 'er-fp', cx: 69.5, cy: 57.6, r: 2.3, fill: eyeColor }),
        React.createElement('path', {
          key: 'm-foc',
          d: 'M54 69.5 L66 69.5',
          stroke: '#7C2D12',
          strokeWidth: 2.2,
          strokeLinecap: 'round',
        }),
        React.createElement('path', {
          key: 'hud-scan',
          d: 'M32 52 L42 52 L44 54',
          stroke: accentColor,
          strokeWidth: 1.3,
          opacity: 0.75,
          fill: 'none',
        }),
      ];

    case 'alert':
      return [
        React.createElement('path', {
          key: 'bl',
          d: 'M45.5 48.5 L56 52.2',
          stroke: browColor,
          strokeWidth: 2.6,
          strokeLinecap: 'round',
        }),
        React.createElement('path', {
          key: 'br',
          d: 'M74.5 48.5 L64 52.2',
          stroke: browColor,
          strokeWidth: 2.6,
          strokeLinecap: 'round',
        }),
        React.createElement('circle', { key: 'el-w', cx: 51, cy: 58, r: 4.6, fill: '#F8FAFC' }),
        React.createElement('circle', { key: 'er-w', cx: 69, cy: 58, r: 4.6, fill: '#F8FAFC' }),
        React.createElement('circle', { key: 'el-p', cx: 51, cy: 58, r: 2.4, fill: eyeColor }),
        React.createElement('circle', { key: 'er-p', cx: 69, cy: 58, r: 2.4, fill: eyeColor }),
        React.createElement('circle', { key: 'el-g', cx: 52, cy: 56.8, r: 1, fill: '#F8FAFC' }),
        React.createElement('circle', { key: 'er-g', cx: 70, cy: 56.8, r: 1, fill: '#F8FAFC' }),
        React.createElement('rect', {
          key: 'm-alert',
          x: 54,
          y: 67.5,
          width: 12,
          height: 5.5,
          rx: 2.6,
          fill: '#991B1B',
          stroke: '#7C2D12',
          strokeWidth: 1.5,
        }),
        React.createElement(
          'circle',
          {
            key: 'beacon-pip',
            cx: 92,
            cy: 28,
            r: 4.5,
            fill: '#EF4444',
            stroke: '#FEF2F2',
            strokeWidth: 1.4,
          },
          React.createElement('animate', {
            attributeName: 'opacity',
            values: '1;0.3;1',
            dur: '0.9s',
            repeatCount: 'indefinite',
          }),
        ),
      ];

    case 'concerned':
      return [
        React.createElement('path', {
          key: 'bl',
          d: 'M45.5 52 Q51 48.5 55.8 50',
          stroke: browColor,
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        React.createElement('path', {
          key: 'br',
          d: 'M64.2 50 Q69 48.5 74.5 52',
          stroke: browColor,
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
        ...standardEyes(0.5, 2.8),
        React.createElement('path', {
          key: 'm-conc',
          d: 'M53.5 71 Q60 67.8 66.5 71',
          stroke: '#7C2D12',
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          fill: 'none',
        }),
      ];

    default: {
      const _exhaustive: never = expression;
      return _exhaustive;
    }
  }
}

export const CrewAvatar: React.FC<CrewAvatarProps> = ({
  crewId,
  expression,
  size = 'md',
  className = '',
  showNameBadge = false,
}) => {
  const profile = CREW_PROFILES[crewId];
  const pxSize = AVATAR_PIXEL_SIZES[size];
  const url = resolveCrewAvatarUrl(crewId, expression);
  const shouldLoadOverride = hasRegisteredAvatarPng(crewId, expression);
  const [overrideState, setOverrideState] = React.useState<'loading' | 'loaded' | 'error'>('loading');

  React.useEffect(() => {
    setOverrideState('loading');
  }, [url, shouldLoadOverride]);

  const { skinTone, hairColor, hairStyle, hasGlasses, facialHair } = profile.templateFeatures;
  const skinShadow = darkenHex(skinTone, 24);
  const instanceId = React.useId().replace(/:/g, '');
  const helmetGlowId = `helmet-glow-${crewId}-${expression}-${instanceId}`;
  const crewBlinkDur = `${(3.5 + (crewId.length % 4) * 0.45).toFixed(2)}s`;
  const shouldBlink = expression !== 'happy';

  const proceduralSvg = React.createElement(
    'svg',
    {
      viewBox: '0 0 120 120',
      width: pxSize,
      height: pxSize,
      role: 'img',
      'aria-label': `${profile.name} (${expression})`,
      className: 'block w-full h-full select-none',
    },
    React.createElement(
      'defs',
      null,
      React.createElement(
        'radialGradient',
        { id: helmetGlowId, cx: '50%', cy: '45%', r: '55%' },
        React.createElement('stop', { offset: '0%', stopColor: '#263C75' }),
        React.createElement('stop', { offset: '100%', stopColor: '#0F172A' }),
      ),
    ),
    React.createElement('circle', {
      cx: 60,
      cy: 60,
      r: 58,
      fill: `url(#${helmetGlowId})`,
      stroke: profile.accentColor,
      strokeWidth: 3,
    }),
    React.createElement(
      'circle',
      { cx: 20, cy: 26, r: 1.3, fill: '#F8FAFC', opacity: 0.75 },
      React.createElement('animate', {
        attributeName: 'opacity',
        values: '0.35;0.95;0.35',
        dur: '2.6s',
        repeatCount: 'indefinite',
      }),
    ),
    React.createElement(
      'circle',
      { cx: 99, cy: 24, r: 1.5, fill: '#FFD66B', opacity: 0.85 },
      React.createElement('animate', {
        attributeName: 'opacity',
        values: '0.9;0.35;0.9',
        dur: '3.1s',
        repeatCount: 'indefinite',
      }),
    ),
    React.createElement('circle', { cx: 102, cy: 84, r: 1.2, fill: '#79C8E8', opacity: 0.7 }),
    // Breathing head-only helmet & collar group
    React.createElement(
      'g',
      null,
      React.createElement('animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        values: '0 0.7; 0 -0.9; 0 0.7',
        dur: '3.4s',
        repeatCount: 'indefinite',
      }),
      // Minimal collar & neck ring (strictly head + collar framing, NO full body)
      React.createElement('path', {
        d: 'M20 112 C24 94, 40 90, 60 90 C80 90, 96 94, 100 112 Z',
        fill: '#E2E8F0',
        stroke: '#94A3B8',
        strokeWidth: 2,
      }),
      React.createElement('path', {
        d: 'M33 95 L45 112 M87 95 L75 112',
        stroke: profile.accentColor,
        strokeWidth: 4.5,
        strokeLinecap: 'round',
      }),
      React.createElement('rect', {
        x: 34,
        y: 86,
        width: 52,
        height: 10,
        rx: 5,
        fill: '#334155',
        stroke: '#CBD5E1',
        strokeWidth: 1.6,
      }),
      React.createElement('rect', {
        x: 52,
        y: 88.5,
        width: 16,
        height: 5,
        rx: 2,
        fill: profile.accentColor,
      }),
      // Outer space helmet shell
      React.createElement('circle', {
        cx: 60,
        cy: 56,
        r: 41,
        fill: '#F8FAFC',
        stroke: '#CBD5E1',
        strokeWidth: 2.5,
      }),
      // Side earpods / comms mounts
      React.createElement('rect', {
        x: 15,
        y: 48,
        width: 7,
        height: 18,
        rx: 3,
        fill: profile.accentColor,
        stroke: '#263C75',
        strokeWidth: 1.5,
      }),
      React.createElement('rect', {
        x: 98,
        y: 48,
        width: 7,
        height: 18,
        rx: 3,
        fill: profile.accentColor,
        stroke: '#263C75',
        strokeWidth: 1.5,
      }),
      // Inner helmet lining & visor tint
      React.createElement('ellipse', {
        cx: 60,
        cy: 57,
        rx: 33,
        ry: 29,
        fill: '#1E293B',
        stroke: '#64748B',
        strokeWidth: 2.2,
      }),
      React.createElement('ellipse', {
        cx: 60,
        cy: 57,
        rx: 31,
        ry: 27,
        fill: profile.visorTint,
        opacity: 0.22,
      }),
      // Neck & ears inside helmet
      React.createElement('rect', {
        x: 52,
        y: 74,
        width: 16,
        height: 12,
        rx: 4,
        fill: skinShadow,
      }),
      React.createElement('circle', { cx: 40, cy: 59, r: 4.5, fill: skinShadow }),
      React.createElement('circle', { cx: 80, cy: 59, r: 4.5, fill: skinShadow }),
      // Head
      React.createElement('ellipse', {
        cx: 60,
        cy: 58,
        rx: 19.5,
        ry: 21.5,
        fill: skinTone,
      }),
      React.createElement('path', {
        d: 'M44 68 Q60 79 76 68',
        stroke: skinShadow,
        strokeWidth: 1.4,
        opacity: 0.35,
        fill: 'none',
      }),
      React.createElement('path', {
        d: 'M59.5 58 L58 63.5 L61.5 64',
        stroke: skinShadow,
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: 'none',
      }),
      ...renderHairElements(hairStyle, hairColor),
      ...renderFacialHairElements(facialHair, hairColor),
      ...renderExpressionFeatures(expression, hairColor, profile.accentColor),
      // Natural eyelid blink accent
      ...(shouldBlink
        ? [
            React.createElement(
              'g',
              { key: 'eyelid-blink', opacity: 0 },
              React.createElement('animate', {
                attributeName: 'opacity',
                values: '0;0;1;0;0',
                keyTimes: '0;0.945;0.965;0.985;1',
                dur: crewBlinkDur,
                repeatCount: 'indefinite',
              }),
              React.createElement('ellipse', { cx: 51, cy: 58, rx: 4.8, ry: 4.8, fill: skinTone }),
              React.createElement('ellipse', { cx: 69, cy: 58, rx: 4.8, ry: 4.8, fill: skinTone }),
              React.createElement('path', {
                d: 'M46.5 58.5 Q51 60.5 55.5 58.5 M64.5 58.5 Q69 60.5 73.5 58.5',
                stroke: '#1E293B',
                strokeWidth: 2,
                strokeLinecap: 'round',
                fill: 'none',
              }),
            ),
          ]
        : []),
      ...(hasGlasses
        ? [
            React.createElement('rect', {
              key: 'gl-l',
              x: 44,
              y: 53.5,
              width: 13.5,
              height: 9.5,
              rx: 2.8,
              fill: '#79C8E8',
              fillOpacity: 0.16,
              stroke: '#1E293B',
              strokeWidth: 1.9,
            }),
            React.createElement('rect', {
              key: 'gl-r',
              x: 62.5,
              y: 53.5,
              width: 13.5,
              height: 9.5,
              rx: 2.8,
              fill: '#79C8E8',
              fillOpacity: 0.16,
              stroke: '#1E293B',
              strokeWidth: 1.9,
            }),
            React.createElement('line', {
              key: 'gl-br',
              x1: 57.5,
              y1: 57.5,
              x2: 62.5,
              y2: 57.5,
              stroke: '#1E293B',
              strokeWidth: 1.8,
            }),
          ]
        : []),
      ...(crewId === 'abdelrahman' || crewId === 'taha'
        ? [
            React.createElement('path', {
              key: 'mic-boom',
              d: 'M34 65 Q41 72 52 72',
              stroke: '#94A3B8',
              strokeWidth: 2,
              fill: 'none',
              strokeLinecap: 'round',
            }),
            React.createElement('circle', {
              key: 'mic-tip',
              cx: 53,
              cy: 72,
              r: 2.2,
              fill: crewId === 'abdelrahman' ? '#79C8E8' : '#9BD8A7',
            }),
          ]
        : []),
      React.createElement('path', {
        d: 'M35 43 Q45 33 61 32',
        stroke: '#F8FAFC',
        strokeWidth: 2.6,
        strokeLinecap: 'round',
        opacity: 0.5,
        fill: 'none',
      }),
      ...(profile.isRemote
        ? [
            React.createElement('circle', {
              key: 'earth-pip',
              cx: 86,
              cy: 102,
              r: 5.5,
              fill: '#263C75',
              stroke: '#79C8E8',
              strokeWidth: 1.4,
            }),
            React.createElement('path', {
              key: 'earth-land',
              d: 'M84 100 Q87 101 86 104 Q88 103 89 101 Z',
              fill: '#9BD8A7',
            }),
          ]
        : []),
    ),
  );

  const portraitContainer = React.createElement(
    'div',
    {
      className: 'relative rounded-full overflow-hidden shrink-0 shadow-md',
      style: { width: pxSize, height: pxSize },
    },
    proceduralSvg,
    shouldLoadOverride && overrideState !== 'error'
      ? React.createElement('img', {
          src: url,
          alt: `${profile.name} (${expression})`,
          onLoad: () => setOverrideState('loaded'),
          onError: () => setOverrideState('error'),
          className: `absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
            overrideState === 'loaded' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`,
        })
      : null,
  );

  if (!showNameBadge) {
    return React.createElement(
      'div',
      { className: `inline-flex items-center justify-center ${className}`.trim() },
      portraitContainer,
    );
  }

  return React.createElement(
    'div',
    { className: `inline-flex flex-col items-center gap-1 ${className}`.trim() },
    portraitContainer,
    React.createElement(
      'div',
      {
        className:
          'px-2 py-0.5 rounded-full bg-slate-900/90 border text-center leading-tight shadow-sm',
        style: { borderColor: profile.accentColor },
      },
      React.createElement(
        'span',
        { className: 'block font-display text-[11px] font-semibold text-white tracking-wide' },
        profile.name,
      ),
      size === 'lg' || size === 'xl'
        ? React.createElement(
            'span',
            {
              className: 'block text-[10px] font-semibold',
              style: { color: profile.accentColor },
            },
            profile.role,
          )
        : null,
    ),
  );
};

/* ============================================================================
 * SHARED PIXEL PRIMITIVES & 60FPS MOTION TRACKING
 * ========================================================================== */

const MAX_DUST_PUFFS = 64;

interface CommanderMotionTracker {
  lastX: number;
  lastY: number;
  lastTimeMs: number;
  facing: SpriteFacing;
  walkPhase: number;
  dustCooldown: number;
  dustPuffs: RegolithDustPuff[];
}

const commanderTrackers = new WeakMap<CanvasRenderingContext2D, CommanderMotionTracker>();

function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
): void {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawBadgeLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  textColor: string,
  borderColor: string,
  align: CanvasTextAlign = 'center',
): void {
  ctx.font = 'bold 11px Nunito, sans-serif';
  const textW = Math.ceil(ctx.measureText(text).width);
  const padX = 8;
  const boxW = textW + padX * 2;
  const boxH = 18;
  const left =
    align === 'center'
      ? Math.round(x - boxW / 2)
      : align === 'right'
        ? Math.round(x - boxW)
        : Math.round(x);
  const top = Math.round(y - 13);

  drawPixelRect(ctx, left, top, boxW, boxH, 'rgba(15, 23, 42, 0.92)');
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(left, top, boxW, boxH);

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(text, left + boxW / 2, top + 13);
}

function drawLayeredPixelEarth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  tSec: number,
  haloPad: number,
  strokeWidth: number,
): void {
  // Outer atmospheric glow halo
  const halo = ctx.createRadialGradient(cx, cy, r * 0.76, cx, cy, r + haloPad);
  halo.addColorStop(0, 'rgba(121, 200, 232, 0.42)');
  halo.addColorStop(0.55, 'rgba(56, 189, 248, 0.16)');
  halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, r + haloPad, 0, Math.PI * 2);
  ctx.fill();

  // Clipped rotating Earth globe
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // Multi-tone ocean depth gradient (sunlit top-left to deep abyssal limb)
  const oceanGrad = ctx.createRadialGradient(
    cx - r * 0.36,
    cy - r * 0.32,
    r * 0.12,
    cx,
    cy,
    r * 1.08,
  );
  oceanGrad.addColorStop(0, '#38BDF8');
  oceanGrad.addColorStop(0.45, '#0284C7');
  oceanGrad.addColorStop(1, '#1E3A8A');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // Subtle sunlit equatorial current shimmer
  drawPixelRect(ctx, cx - r * 0.8, cy - r * 0.08, r * 1.15, r * 0.14, 'rgba(125, 211, 252, 0.22)');

  const landSpan = r * 2.8;
  const wrapLandX = (anchor: number): number =>
    cx + ((((anchor + tSec * 7.5) % landSpan) + landSpan) % landSpan) - landSpan * 0.5;

  // Cluster A: Multi-step Americas-inspired landmass with coastal shelf & highlands
  const ax = wrapLandX(0.35 * r);
  const ay = cy - r * 0.48;
  drawPixelRect(ctx, ax - r * 0.24, ay, r * 0.42, r * 0.22, '#15803D');
  drawPixelRect(ctx, ax - r * 0.18, ay + r * 0.04, r * 0.32, r * 0.16, '#22C55E');
  drawPixelRect(ctx, ax - r * 0.08, ay + r * 0.06, r * 0.16, r * 0.1, '#4ADE80');
  drawPixelRect(ctx, ax - r * 0.02, ay + r * 0.2, r * 0.14, r * 0.12, '#16A34A');
  drawPixelRect(ctx, ax + r * 0.04, ay + r * 0.3, r * 0.26, r * 0.34, '#15803D');
  drawPixelRect(ctx, ax + r * 0.08, ay + r * 0.34, r * 0.2, r * 0.24, '#22C55E');
  drawPixelRect(ctx, ax + r * 0.12, ay + r * 0.38, r * 0.1, r * 0.14, '#84CC16');
  drawPixelRect(ctx, ax + r * 0.1, ay + r * 0.62, r * 0.12, r * 0.18, '#16A34A');
  drawPixelRect(ctx, ax - r * 0.34, ay + r * 0.12, r * 0.09, r * 0.08, '#4ADE80');

  // Cluster B: Afro-Eurasia-inspired stepped plateau, Sahara ochre & island chain
  const bx = wrapLandX(1.72 * r);
  const by = cy - r * 0.42;
  drawPixelRect(ctx, bx - r * 0.32, by, r * 0.56, r * 0.24, '#15803D');
  drawPixelRect(ctx, bx - r * 0.24, by + r * 0.04, r * 0.44, r * 0.18, '#22C55E');
  drawPixelRect(ctx, bx - r * 0.06, by + r * 0.08, r * 0.2, r * 0.1, '#4ADE80');
  drawPixelRect(ctx, bx - r * 0.28, by + r * 0.24, r * 0.34, r * 0.22, '#CA8A04');
  drawPixelRect(ctx, bx - r * 0.22, by + r * 0.27, r * 0.22, r * 0.12, '#EAB308');
  drawPixelRect(ctx, bx - r * 0.16, by + r * 0.44, r * 0.2, r * 0.26, '#16A34A');
  drawPixelRect(ctx, bx + r * 0.16, by + r * 0.36, r * 0.18, r * 0.14, '#22C55E');
  drawPixelRect(ctx, bx + r * 0.26, by + r * 0.54, r * 0.14, r * 0.1, '#4ADE80');

  // Cluster C: Archipelago islands in Pacific basin
  const ix = wrapLandX(2.38 * r);
  const iy = cy + r * 0.12;
  drawPixelRect(ctx, ix - r * 0.1, iy, r * 0.14, r * 0.1, '#22C55E');
  drawPixelRect(ctx, ix + r * 0.06, iy + r * 0.08, r * 0.1, r * 0.08, '#4ADE80');
  drawPixelRect(ctx, ix - r * 0.02, iy - r * 0.14, r * 0.08, r * 0.07, '#16A34A');

  // Polar Ice Caps (layered Arctic & Antarctic pixel shelves)
  drawPixelRect(ctx, cx - r * 0.58, cy - r, r * 1.16, Math.max(4, r * 0.14), '#E0F2FE');
  drawPixelRect(ctx, cx - r * 0.38, cy - r * 0.9, r * 0.76, Math.max(3, r * 0.1), '#F8FAFC');
  drawPixelRect(ctx, cx - r * 0.46, cy + r * 0.84, r * 0.92, Math.max(4, r * 0.16), '#E0F2FE');

  // Translucent drifting cloud wisps across multiple latitudes
  const cloudSpan = r * 3.0;
  const wrapCloudX = (anchor: number): number =>
    cx + ((((anchor + tSec * 11.5) % cloudSpan) + cloudSpan) % cloudSpan) - cloudSpan * 0.5;

  const cloudRibbons: readonly { anchor: number; yOff: number; w: number; h: number }[] = [
    { anchor: 0.2 * r, yOff: -0.58, w: 0.72, h: 0.09 },
    { anchor: 0.55 * r, yOff: -0.22, w: 0.54, h: 0.08 },
    { anchor: 1.35 * r, yOff: 0.06, w: 0.84, h: 0.1 },
    { anchor: 1.95 * r, yOff: 0.38, w: 0.62, h: 0.08 },
    { anchor: 2.55 * r, yOff: -0.44, w: 0.48, h: 0.07 },
  ];
  for (const band of cloudRibbons) {
    const wx = wrapCloudX(band.anchor);
    const wy = cy + r * band.yOff;
    const bw = r * band.w;
    const bh = Math.max(3, r * band.h);
    drawPixelRect(ctx, wx - bw * 0.5, wy, bw, bh, 'rgba(248, 250, 252, 0.58)');
    drawPixelRect(ctx, wx - bw * 0.32, wy - bh * 0.45, bw * 0.56, Math.max(2, bh * 0.6), 'rgba(224, 242, 254, 0.42)');
  }

  // Inner atmospheric rim sheen & gentle night terminator
  const innerRim = ctx.createRadialGradient(cx, cy, r * 0.65, cx, cy, r);
  innerRim.addColorStop(0, 'rgba(121, 200, 232, 0)');
  innerRim.addColorStop(1, 'rgba(121, 200, 232, 0.34)');
  ctx.fillStyle = innerRim;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  const termGrad = ctx.createLinearGradient(cx - r * 0.85, cy - r * 0.2, cx + r, cy + r * 0.65);
  termGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
  termGrad.addColorStop(0.58, 'rgba(15, 23, 42, 0.14)');
  termGrad.addColorStop(1, 'rgba(7, 11, 22, 0.74)');
  ctx.fillStyle = termGrad;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  // Crisp cyan atmospheric horizon rim
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
}

interface WorldDustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface WorldProtonStreak {
  x: number;
  y: number;
  speed: number;
  len: number;
  magenta: boolean;
}

interface WorldSparkMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  color: string;
}

interface WorldEffectsTracker {
  lastTimeMs: number;
  orangeDust: WorldDustParticle[];
  protonStreaks: WorldProtonStreak[];
  co2Motes: WorldSparkMote[];
  staticSeed: number;
}

const worldEffectsTrackers = new WeakMap<CanvasRenderingContext2D, WorldEffectsTracker>();

function createInitialWorldEffectsTracker(timeMs: number): WorldEffectsTracker {
  const orangeDust: WorldDustParticle[] = [];
  for (let i = 0; i < 32; i++) {
    orangeDust.push({
      x: 10 + ((i * 53) % 192),
      y: 176 + ((i * 89) % 466),
      vx: 26 + (i % 4) * 9,
      vy: 6 + (i % 3) * 4,
      size: i % 4 === 0 ? 4 : 3,
      color: i % 3 === 0 ? '#FB923C' : i % 2 === 0 ? '#F97316' : '#FDBA74',
    });
  }

  const protonStreaks: WorldProtonStreak[] = [];
  for (let i = 0; i < 34; i++) {
    protonStreaks.push({
      x: (i * 97) % BASE_CANVAS_WIDTH,
      y: (i * 61) % BASE_CANVAS_HEIGHT,
      speed: 240 + (i % 5) * 48,
      len: 26 + (i % 4) * 10,
      magenta: i % 2 === 1,
    });
  }

  const co2Motes: WorldSparkMote[] = [];
  for (let i = 0; i < 26; i++) {
    const inMedbay = i < 14;
    const baseRoom = inMedbay ? ROOM_BOUNDS.medbay : ROOM_BOUNDS.main_habitat;
    const minX = inMedbay ? baseRoom.x + 18 : baseRoom.x + 390;
    const spanX = inMedbay ? baseRoom.width - 36 : 320;
    co2Motes.push({
      x: minX + ((i * 41) % spanX),
      y: baseRoom.y + 34 + ((i * 29) % (baseRoom.height - 56)),
      vx: ((i % 3) - 1) * 14,
      vy: -9 - (i % 4) * 4,
      age: (i * 0.17) % 2.4,
      maxAge: 2.4,
      color: i % 2 === 0 ? '#F59E0B' : '#FBBF24',
    });
  }

  return {
    lastTimeMs: timeMs,
    orangeDust,
    protonStreaks,
    co2Motes,
    staticSeed: 0,
  };
}

function advanceWorldEffectsTracker(
  ctx: CanvasRenderingContext2D,
  timeMs: number,
): WorldEffectsTracker {
  let tracker = worldEffectsTrackers.get(ctx);
  if (!tracker) {
    tracker = createInitialWorldEffectsTracker(timeMs);
    worldEffectsTrackers.set(ctx, tracker);
    return tracker;
  }

  const dt = Math.min(0.05, Math.max(0.001, (timeMs - tracker.lastTimeMs) / 1000));
  tracker.lastTimeMs = timeMs;
  tracker.staticSeed += dt;

  for (const p of tracker.orangeDust) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x > 205) {
      p.x = 6;
    }
    if (p.y > 650) {
      p.y = 176;
    }
  }

  for (const s of tracker.protonStreaks) {
    s.x += s.speed * dt;
    s.y += s.speed * 0.42 * dt;
    if (s.x > BASE_CANVAS_WIDTH + 40) {
      s.x = -40;
      s.y = (s.y + 137) % BASE_CANVAS_HEIGHT;
    }
    if (s.y > BASE_CANVAS_HEIGHT + 20) {
      s.y = -20;
    }
  }

  for (let i = 0; i < tracker.co2Motes.length; i++) {
    const m = tracker.co2Motes[i];
    if (!m) continue;
    m.age += dt;
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    if (m.age >= m.maxAge) {
      m.age = 0;
      const inMedbay = i < 14;
      const baseRoom = inMedbay ? ROOM_BOUNDS.medbay : ROOM_BOUNDS.main_habitat;
      const minX = inMedbay ? baseRoom.x + 18 : baseRoom.x + 390;
      const spanX = inMedbay ? baseRoom.width - 36 : 320;
      m.x = minX + ((i * 53 + Math.floor(timeMs * 0.03)) % spanX);
      m.y = baseRoom.y + baseRoom.height - 26;
    }
  }

  return tracker;
}

function drawParallaxSkyAndEarthLimb(
  ctx: CanvasRenderingContext2D,
  w: number,
  skyHeight: number,
  tSec: number,
  options: {
    earthX: number;
    earthY: number;
    earthR: number;
    solarStormActive: boolean;
    sunlitRidge: boolean;
    craterShadow: boolean;
    radioStaticActive: boolean;
  },
): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, skyHeight);
  skyGrad.addColorStop(0, options.solarStormActive ? '#14081E' : '#070B16');
  skyGrad.addColorStop(0.65, options.solarStormActive ? '#26112E' : '#0F172A');
  skyGrad.addColorStop(1, options.solarStormActive ? '#4A153B' : '#1A2744');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, skyHeight);

  // 3 parallax star layers
  for (let i = 0; i < 88; i++) {
    const layer = i % 3;
    const speed = layer === 0 ? 1.8 : layer === 1 ? 4.5 : 8.5;
    const sx = ((i * 197 + tSec * speed) % (w + 16)) - 8;
    const sy = 6 + ((i * 73) % (skyHeight - 24));
    const twinkle = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(tSec * (2.2 + layer) + i * 1.13));
    const size = layer === 2 && i % 6 === 0 ? 3 : 2;
    const starColor =
      i % 9 === 0
        ? `rgba(255, 214, 107, ${twinkle.toFixed(2)})`
        : i % 5 === 0
          ? `rgba(121, 200, 232, ${twinkle.toFixed(2)})`
          : `rgba(248, 250, 252, ${twinkle.toFixed(2)})`;
    drawPixelRect(ctx, sx, sy, size, size, starColor);
  }

  // Slowly rotating Earth limb over northern horizon
  const { earthX, earthY, earthR } = options;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, skyHeight - 4);
  ctx.clip();
  drawLayeredPixelEarth(ctx, earthX, earthY, earthR, tSec, 18, 2.5);

  // Dramatic X-class Solar Storm golden/magenta aurora & proton bands in sky on Day 4
  if (options.solarStormActive) {
    for (let wave = 0; wave < 4; wave++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        const wy = 24 + wave * 24 + Math.sin(x * 0.02 + tSec * 4.4 + wave * 1.1) * 11;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.strokeStyle =
        wave % 2 === 0 ? 'rgba(255, 214, 107, 0.55)' : 'rgba(232, 121, 249, 0.55)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  // Day 7 crackling solar radio static interference waves across the starfield
  if (options.radioStaticActive) {
    for (let s = 0; s < 16; s++) {
      const sy = 12 + ((s * 29 + Math.floor(tSec * 90)) % (skyHeight - 36));
      const sx = (s * 149 + Math.floor(tSec * 310)) % (w - 90);
      const sw = 34 + (s % 4) * 24;
      const staticColor =
        s % 3 === 0
          ? 'rgba(248, 113, 113, 0.65)'
          : s % 3 === 1
            ? 'rgba(251, 191, 36, 0.55)'
            : 'rgba(232, 121, 249, 0.5)';
      drawPixelRect(ctx, sx, sy, sw, 2, staticColor);
      drawPixelRect(ctx, sx + 12, sy + 3, Math.round(sw * 0.55), 2, 'rgba(248, 250, 252, 0.45)');
    }

    // Crackling radio burst arcs around Earth-Moon sky link
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let bx = 315; bx <= 1120; bx += 22) {
      const jitter = Math.sin(bx * 0.14 + tSec * 24) * 7;
      const by = 68 + jitter;
      if (bx === 315) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }

  ctx.restore();

  // Distant Shackleton Crater mountain ridge horizon
  const ridgePoints: readonly [number, number][] = [
    [0, skyHeight - 18],
    [96, skyHeight - 36],
    [186, skyHeight - 16],
    [296, skyHeight - 40],
    [412, skyHeight - 20],
    [530, skyHeight - 34],
    [664, skyHeight - 14],
    [792, skyHeight - 44],
    [912, skyHeight - 22],
    [1044, skyHeight - 48],
    [1168, skyHeight - 26],
    [1280, skyHeight - 38],
  ];

  ctx.beginPath();
  ctx.moveTo(0, skyHeight);
  for (const [rx, ry] of ridgePoints) {
    ctx.lineTo(rx, ry);
  }
  ctx.lineTo(w, skyHeight);
  ctx.closePath();
  ctx.fillStyle = options.craterShadow ? '#111A30' : '#182235';
  ctx.fill();

  ctx.beginPath();
  for (let idx = 0; idx < ridgePoints.length; idx++) {
    const pt = ridgePoints[idx];
    if (!pt) continue;
    if (idx === 0) ctx.moveTo(pt[0], pt[1]);
    else ctx.lineTo(pt[0], pt[1]);
  }
  ctx.strokeStyle = options.solarStormActive
    ? '#F472B6'
    : options.sunlitRidge
      ? '#FFD66B'
      : options.craterShadow
        ? '#79C8E8'
        : '#475569';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Gentle crater shadow rim below northern ridge
  drawPixelRect(ctx, 0, skyHeight - 4, w, 6, '#0F172A');
}

function drawPixelRover(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tSec: number,
  moving: boolean,
  hasIceCargo = false,
  frostedWheels = false,
): void {
  const rx = Math.round(x);
  const ry = Math.round(y);
  const treadOffset = moving ? Math.floor(tSec * 12) % 4 : 0;

  // Wheels + animated tread ticks (frosted cyan/white rim in -200°C crater chill)
  const wheelPositions: readonly [number, number][] = [
    [rx - 5, ry + 2],
    [rx + 26, ry + 2],
    [rx - 5, ry + 22],
    [rx + 26, ry + 22],
  ];
  for (const [wx, wy] of wheelPositions) {
    drawPixelRect(ctx, wx, wy, 7, 10, '#0F172A');
    drawPixelRect(
      ctx,
      wx + 1,
      wy + 1 + treadOffset,
      5,
      2,
      frostedWheels ? '#BAE6FD' : '#64748B',
    );
    drawPixelRect(
      ctx,
      wx + 1,
      wy + ((5 + treadOffset) % 8),
      5,
      2,
      frostedWheels ? '#79C8E8' : '#64748B',
    );
  }

  // Gold foil & white rover chassis
  drawPixelRect(ctx, rx, ry + 4, 28, 26, '#F8FAFC');
  drawPixelRect(ctx, rx + 4, ry + 8, 20, 14, '#FFD66B');
  drawPixelRect(ctx, rx + 7, ry + 11, 14, 8, '#263C75');

  if (hasIceCargo) {
    // Glowing blue Shackleton ice-core canisters loaded on cargo rack
    drawPixelRect(ctx, rx + 2, ry + 22, 10, 7, '#0284C7');
    drawPixelRect(ctx, rx + 3, ry + 23, 8, 5, '#79C8E8');
    drawPixelRect(ctx, rx + 5, ry + 24, 4, 3, '#E0F2FE');
  }

  // Mast camera & blinking telemetry beacon
  drawPixelRect(ctx, rx + 11, ry - 5, 6, 9, '#475569');
  drawPixelRect(ctx, rx + 8, ry - 7, 12, 4, '#79C8E8');
  const ledOn = Math.floor(tSec * 3) % 2 === 0;
  drawPixelRect(ctx, rx + 12, ry + 24, 4, 4, ledOn ? '#9BD8A7' : '#166534');
}

function drawDay1TouchdownLander(
  ctx: CanvasRenderingContext2D,
  cx: number,
  padY: number,
  tSec: number,
  activelyDescending: boolean,
): void {
  // Expanding concentric pixel dust ripples on Day 1 touchdown pad
  if (activelyDescending) {
    for (let ring = 0; ring < 3; ring++) {
      const progress = (tSec * 0.9 + ring * 0.33) % 1;
      const rx = 24 + progress * 64;
      const ry = 9 + progress * 22;
      const alpha = (1 - progress) * 0.72;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, padY + 6, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 214, 107, ${alpha.toFixed(2)})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // Outward drifting pixel dust puffs around touchdown skirt
    for (let d = 0; d < 8; d++) {
      const dir = d % 2 === 0 ? -1 : 1;
      const cycle = (tSec * 1.4 + d * 0.21) % 1;
      const dx = cx + dir * (18 + cycle * 58);
      const dy = padY + 4 - Math.sin(cycle * Math.PI) * 14 + (d % 3) * 3;
      const dAlpha = Math.max(0, (1 - cycle) * 0.7);
      drawPixelRect(ctx, dx - 3, dy - 3, 6, 6, `rgba(203, 213, 225, ${dAlpha.toFixed(2)})`);
    }
  }

  const hoverCycle = activelyDescending ? Math.abs(Math.sin(tSec * 1.15)) * 22 : 0;
  const ly = Math.round(padY - 22 - hoverCycle);

  // Thruster exhaust plume when descending
  if (activelyDescending) {
    const flameLen = 14 + Math.round((Math.sin(tSec * 36) * 0.5 + 0.5) * 12);
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.moveTo(cx - 9, ly + 18);
    ctx.lineTo(cx + 9, ly + 18);
    ctx.lineTo(cx, ly + 18 + flameLen);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFD66B';
    ctx.beginPath();
    ctx.moveTo(cx - 5, ly + 18);
    ctx.lineTo(cx + 5, ly + 18);
    ctx.lineTo(cx, ly + 14 + flameLen * 0.75);
    ctx.closePath();
    ctx.fill();
  }

  // Landing legs
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 12, ly + 12);
  ctx.lineTo(cx - 21, ly + 22);
  ctx.moveTo(cx + 12, ly + 12);
  ctx.lineTo(cx + 21, ly + 22);
  ctx.stroke();
  drawPixelRect(ctx, cx - 25, ly + 21, 8, 3, '#FFD66B');
  drawPixelRect(ctx, cx + 17, ly + 21, 8, 3, '#FFD66B');

  // Gold foil descent stage & white crew cabin
  drawPixelRect(ctx, cx - 15, ly + 4, 30, 12, '#D97706');
  drawPixelRect(ctx, cx - 12, ly + 6, 24, 8, '#FFD66B');
  drawPixelRect(ctx, cx - 11, ly - 10, 22, 14, '#F8FAFC');
  drawPixelRect(ctx, cx - 6, ly - 6, 12, 6, '#263C75');
  drawPixelRect(ctx, cx - 4, ly - 5, 8, 2, '#79C8E8');
}

function drawJaggedMoonBoulder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  const s = scale;
  drawPixelRect(ctx, x - 12 * s, y, 24 * s, 10 * s, '#334155');
  drawPixelRect(ctx, x - 9 * s, y - 6 * s, 17 * s, 8 * s, '#475569');
  drawPixelRect(ctx, x - 5 * s, y - 10 * s, 9 * s, 5 * s, '#64748B');
  drawPixelRect(ctx, x - 3 * s, y - 9 * s, 4 * s, 3 * s, '#94A3B8');
}

/* ============================================================================
 * 3/4 TOP-DOWN CUTAWAY LUNAR BASE RENDERER (1280 x 720)
 * ========================================================================== */

function drawExteriorSurface(
  ctx: CanvasRenderingContext2D,
  state: Readonly<GameState>,
  tSec: number,
  tracker: WorldEffectsTracker,
  missionPhase: MissionPhase,
): void {
  const skyHeight = 148;
  const site = state.flags.landingSite;
  const solarStormActive = state.day === 4;
  const day7StaticActive =
    state.day === 7 && (state.commsBlackout || !state.eveningDecisionCompletedForDay);

  // Panoramic northern lunar sky & Earth limb
  drawParallaxSkyAndEarthLimb(ctx, BASE_CANVAS_WIDTH, skyHeight, tSec, {
    earthX: 254,
    earthY: 112,
    earthR: 54,
    solarStormActive,
    sunlitRidge: site === 'sunlit_ridge',
    craterShadow: site === 'crater_shadow',
    radioStaticActive: day7StaticActive,
  });

  // Base regolith background (y: 148..720)
  drawPixelRect(ctx, 0, skyHeight, BASE_CANVAS_WIDTH, BASE_CANVAS_HEIGHT - skyHeight, '#1B2436');

  // Checkerboard lunar dust tiles (32px grid)
  for (let gx = 0; gx < 40; gx++) {
    for (let gy = 5; gy < 23; gy++) {
      const alt = (gx + gy) % 2 === 0;
      const shade = alt ? '#232F44' : '#1D273B';
      drawPixelRect(ctx, gx * 32, gy * 32, 32, 32, shade);
    }
  }

  // Persistent Day 1 Sunlit Ridge golden lighting wash & extra sunlight rays vs Shaded Crater Wall & protective rock berm
  if (site === 'sunlit_ridge') {
    const sunWash = ctx.createLinearGradient(0, 148, BASE_CANVAS_WIDTH, 720);
    sunWash.addColorStop(0, 'rgba(255, 214, 107, 0.22)');
    sunWash.addColorStop(0.5, 'rgba(255, 214, 107, 0.08)');
    sunWash.addColorStop(1, 'rgba(245, 158, 11, 0.16)');
    ctx.fillStyle = sunWash;
    ctx.fillRect(0, skyHeight, BASE_CANVAS_WIDTH, BASE_CANVAS_HEIGHT - skyHeight);

    // Warm diagonal golden sunbeams across West Solar Field
    ctx.save();
    for (let r = 0; r < 3; r++) {
      const rx = 20 + r * 58;
      ctx.fillStyle = `rgba(255, 243, 196, ${(0.07 + 0.03 * Math.sin(tSec * 2 + r)).toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(rx, 148);
      ctx.lineTo(rx + 28, 148);
      ctx.lineTo(rx + 96, 680);
      ctx.lineTo(rx + 60, 680);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (site === 'crater_shadow') {
    const shadeWash = ctx.createLinearGradient(880, 148, 1280, 720);
    shadeWash.addColorStop(0, 'rgba(15, 23, 42, 0)');
    shadeWash.addColorStop(0.45, 'rgba(15, 23, 42, 0.45)');
    shadeWash.addColorStop(1, 'rgba(10, 22, 54, 0.68)');
    ctx.fillStyle = shadeWash;
    ctx.fillRect(880, skyHeight, 400, BASE_CANVAS_HEIGHT - skyHeight);

    // Protective regolith rock berm shielding East Habitat flank
    const bermYs: readonly number[] = [318, 356, 396, 434];
    for (let b = 0; b < bermYs.length; b++) {
      const by = bermYs[b];
      if (by === undefined) continue;
      drawJaggedMoonBoulder(ctx, 1012, by, b % 2 === 0 ? 1.15 : 0.95);
    }
    drawPixelRect(ctx, 1002, 304, 16, 168, 'rgba(121, 200, 232, 0.16)');
  }

  // Scattered South Pole craters outside base footprint
  const craters: readonly { cx: number; cy: number; r: number }[] = [
    { cx: 58, cy: 176, r: 20 },
    { cx: 144, cy: 678, r: 18 },
    { cx: 48, cy: 492, r: 15 },
    { cx: 420, cy: 698, r: 16 },
    { cx: 780, cy: 700, r: 14 },
    { cx: 1228, cy: 184, r: 22 },
    { cx: 1244, cy: 472, r: 18 },
    { cx: 1030, cy: 692, r: 16 },
  ];
  for (const c of craters) {
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
    ctx.fillStyle = '#141D2D';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#334155';
    ctx.stroke();
  }

  // ---- WEST SOLAR ARRAY FIELD (x: 18..188, y: 172..668) ----
  const day3DustActive =
    state.day === 3 ||
    (state.anomaly !== null && !state.anomaly.resolved && state.anomaly.roomId === 'power_station');
  const solarDusty = day3DustActive || state.primary.power < 42;
  const solarScorched = state.day >= 4 && state.primary.shielding < 65;

  // Power bus trench leading into Power Core
  drawPixelRect(ctx, 148, 570, 66, 12, '#475569');
  const lowPower = state.primary.power < 35;
  drawPixelRect(ctx, 148, 574, 66, 4, lowPower ? '#F59E0B' : '#FFD66B');
  const pulseX = 152 + ((tSec * 44) % 56);
  drawPixelRect(ctx, pulseX, 573, 8, 6, lowPower ? '#F87171' : '#F8FAFC');

  // Day 3 yellow electric spark arcs near Power Station bus trench (or continuous when overclocking regulators)
  const sparkStorm =
    state.day === 3 ||
    state.flags.day3Allocation === 'overclock_regulators' ||
    state.flags.hardwareFaultRisk;
  if (sparkStorm) {
    const sparkRate = missionPhase === 'midday' ? 16 : 12;
    const sparkTick = Math.floor(tSec * sparkRate) % 4;
    if (sparkTick !== 2) {
      ctx.save();
      ctx.strokeStyle = sparkTick % 2 === 0 ? '#FFD66B' : '#FFFBEB';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(156, 566);
      ctx.lineTo(170, 554 + (sparkTick * 3));
      ctx.lineTo(182, 569);
      ctx.lineTo(196, 558);
      ctx.lineTo(208, 572);
      ctx.stroke();

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(164, 586);
      ctx.lineTo(178, 598 - sparkTick * 2);
      ctx.lineTo(194, 583);
      ctx.stroke();
      ctx.restore();
    }
  }

  const arrayYs: readonly number[] =
    site === 'sunlit_ridge' ? [184, 286, 388, 490, 592] : [194, 304, 414, 524];
  for (let i = 0; i < arrayYs.length; i++) {
    const ay = arrayYs[i];
    if (ay === undefined) continue;
    const wingH = site === 'sunlit_ridge' ? 44 : 48;

    drawPixelRect(ctx, 90, ay + 14, 12, wingH - 12, '#64748B');
    const wingColor = site === 'sunlit_ridge' ? '#263C75' : '#1E3A8A';
    drawPixelRect(ctx, 24, ay, 60, wingH, wingColor);
    drawPixelRect(ctx, 108, ay, 60, wingH, wingColor);

    ctx.strokeStyle = site === 'sunlit_ridge' ? '#FFD66B' : '#79C8E8';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, ay, 60, wingH);
    ctx.strokeRect(108, ay, 60, wingH);

    // PV cell seams
    for (let cell = 1; cell < 4; cell++) {
      const seamY = ay + Math.round((wingH / 4) * cell);
      drawPixelRect(ctx, 24, seamY, 60, 1, 'rgba(121, 200, 232, 0.65)');
      drawPixelRect(ctx, 108, seamY, 60, 1, 'rgba(121, 200, 232, 0.65)');
    }

    // Glinting solar wing sweep reflection (brighter on Sunlit Ridge)
    const glintX = ((tSec * 46 + i * 28) % 88) - 14;
    if (glintX >= 0 && glintX < 54 && !solarDusty) {
      const glintAlpha = site === 'sunlit_ridge' ? 0.48 : 0.25;
      drawPixelRect(ctx, 26 + glintX, ay + 2, 6, wingH - 4, `rgba(255, 251, 235, ${glintAlpha})`);
      drawPixelRect(ctx, 110 + glintX, ay + 2, 6, wingH - 4, `rgba(255, 251, 235, ${glintAlpha})`);
    }

    if (solarDusty) {
      // Electrostatic orange lunar dust buildup on solar wings
      drawPixelRect(ctx, 30, ay + 6, 22, 12, 'rgba(249, 115, 22, 0.56)');
      drawPixelRect(ctx, 52, ay + 26, 18, 10, 'rgba(251, 146, 60, 0.5)');
      drawPixelRect(ctx, 118, ay + 20, 26, 12, 'rgba(249, 115, 22, 0.56)');
      drawPixelRect(ctx, 134, ay + 8, 16, 8, 'rgba(251, 146, 60, 0.48)');
    }
    if (solarScorched) {
      drawPixelRect(ctx, 50, ay + 26, 12, 8, 'rgba(15, 23, 42, 0.78)');
      drawPixelRect(ctx, 116, ay + 10, 10, 8, 'rgba(249, 115, 22, 0.5)');
    }
    if (lowPower && Math.floor(tSec * 6 + i) % 3 === 0) {
      drawPixelRect(ctx, 94, ay + 12, 4, 4, '#F59E0B');
    }
  }

  // Animated drifting electrostatic orange lunar dust grains across solar array on Day 3
  if (day3DustActive) {
    for (const dust of tracker.orangeDust) {
      drawPixelRect(ctx, dust.x, dust.y, dust.size, dust.size, dust.color);
    }
  }

  drawBadgeLabel(ctx, 96, 650, 'WEST SOLAR FIELD', '#F8FAFC', '#475569');

  // ---- EAST SHACKLETON CRATER RIM, S-BAND RELAY & TOUCHDOWN/ROVER PAD (x: 994..1264) ----
  // S-Band Relay Pad (North-East, x: 1044..1240, y: 174..286)
  drawPixelRect(ctx, 1044, 174, 196, 112, '#334155');
  ctx.strokeStyle = state.flags.relayReinforced ? '#9BD8A7' : '#64748B';
  ctx.lineWidth = 2;
  ctx.strokeRect(1044, 174, 196, 112);

  // Relay cable trench to Science/Comms wing
  drawPixelRect(ctx, 978, 224, 66, 10, '#475569');
  drawPixelRect(ctx, 978, 228, 66, 3, day7StaticActive ? '#F87171' : '#79C8E8');

  // Rotating S-Band radar sweep beam
  const dishX = 1142;
  const dishY = 216;
  if (!day7StaticActive) {
    const sweepAngle = tSec * 1.5;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(dishX, dishY);
    ctx.arc(dishX, dishY, 44, sweepAngle, sweepAngle + 0.62);
    ctx.closePath();
    ctx.fillStyle = state.flags.relayReinforced
      ? 'rgba(155, 216, 167, 0.28)'
      : 'rgba(121, 200, 232, 0.22)';
    ctx.fill();
    ctx.restore();
  }

  // Relay hardware mast & dish
  drawPixelRect(ctx, dishX - 10, dishY + 10, 20, 14, '#94A3B8');
  if (state.flags.relayReinforced) {
    drawPixelRect(ctx, dishX - 16, dishY + 12, 6, 12, '#9BD8A7');
    drawPixelRect(ctx, dishX + 10, dishY + 12, 6, 12, '#9BD8A7');
  }
  ctx.beginPath();
  ctx.arc(dishX, dishY, 19, Math.PI * 0.85, Math.PI * 1.95);
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 4;
  ctx.stroke();
  drawPixelRect(ctx, dishX - 2, dishY - 17, 4, 17, '#CBD5E1');

  const beaconColor = day7StaticActive
    ? Math.floor(tSec * 6) % 2 === 0
      ? '#F87171'
      : '#FBBF24'
    : state.flags.relayReinforced
      ? '#9BD8A7'
      : '#FFD66B';
  ctx.beginPath();
  ctx.arc(dishX, dishY - 21, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = beaconColor;
  ctx.fill();

  // Day 7 crackling static interference ripples radiating around S-Band Comms Dish
  if (day7StaticActive) {
    for (let r = 0; r < 3; r++) {
      const wavePhase = (tSec * 2.2 + r * 0.33) % 1;
      const radius = 14 + wavePhase * 42;
      ctx.save();
      ctx.strokeStyle =
        r % 2 === 0
          ? `rgba(248, 113, 113, ${(1 - wavePhase) * 0.85})`
          : `rgba(251, 191, 36, ${(1 - wavePhase) * 0.8})`;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(dishX, dishY - 16, radius, -Math.PI * 0.85, Math.PI * 0.1);
      ctx.stroke();
      ctx.restore();
    }
  } else if (state.flags.relayReinforced) {
    const pulseR = 10 + ((tSec * 28) % 26);
    ctx.beginPath();
    ctx.arc(dishX, dishY - 21, pulseR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(155, 216, 167, ${(1 - (pulseR - 10) / 26) * 0.65})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  drawBadgeLabel(
    ctx,
    1142,
    274,
    day7StaticActive ? 'S-BAND: STATIC' : 'S-BAND RELAY',
    day7StaticActive ? '#F87171' : '#F8FAFC',
    day7StaticActive ? '#F87171' : '#64748B',
  );

  // Shackleton Crater Ice Rim (East-Center)
  const craterX = 1142;
  const craterY = 398;
  const deepIceShadow = site === 'crater_shadow' || state.day === 3 || state.day === 6;

  // Day 3 creeping icy -200°C crater shadow expansion
  if (state.day === 3 || site === 'crater_shadow') {
    const creep = state.day === 3 ? 6 + Math.sin(tSec * 1.4) * 5 : 4;
    ctx.beginPath();
    ctx.ellipse(craterX - 6, craterY + 6, 98 + creep, 84 + creep * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 16, 44, 0.72)';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.ellipse(craterX, craterY, 86, 74, 0, 0, Math.PI * 2);
  ctx.fillStyle = deepIceShadow ? '#0B1636' : '#1E293B';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = site === 'sunlit_ridge' ? '#FFD66B' : deepIceShadow ? '#79C8E8' : '#475569';
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(craterX + 4, craterY + 6, 56, 46, 0, 0, Math.PI * 2);
  ctx.fillStyle = deepIceShadow ? '#060E24' : '#162032';
  ctx.fill();

  // Water-ice crystal glints (extra rich on Crater Shadow, Day 3, Day 6)
  const iceAlpha = site === 'crater_shadow' ? 0.95 : deepIceShadow ? 0.78 : 0.42;
  const shimmer = 0.55 + 0.45 * Math.sin(tSec * 3.2);
  const iceColor = `rgba(121, 200, 232, ${(iceAlpha * shimmer).toFixed(2)})`;
  drawPixelRect(ctx, craterX - 28, craterY - 12, 10, 8, iceColor);
  drawPixelRect(ctx, craterX + 12, craterY + 12, 12, 8, iceColor);
  drawPixelRect(ctx, craterX - 10, craterY + 26, 10, 8, iceColor);
  if (site === 'crater_shadow' || state.day === 3) {
    drawPixelRect(ctx, craterX + 26, craterY - 16, 10, 10, '#BAE6FD');
    drawPixelRect(ctx, craterX - 42, craterY + 8, 8, 8, '#E0F2FE');
  }

  const rimText =
    state.day === 3
      ? '-200°C ICE SHADOW'
      : site === 'sunlit_ridge'
        ? 'SUNLIT RIDGE'
        : site === 'crater_shadow'
          ? 'CRATER ICE RIM'
          : 'SHACKLETON RIM';
  drawBadgeLabel(
    ctx,
    craterX,
    314,
    rimText,
    site === 'sunlit_ridge' ? '#FFD66B' : '#79C8E8',
    site === 'sunlit_ridge' ? '#FFD66B' : '#475569',
  );

  // East Airlock Apron & Landing Pad / Day 6+ Exterior Rover Zone (y: 496..690)
  drawPixelRect(ctx, 978, 548, 52, 54, '#475569');
  drawPixelRect(ctx, 982, 554, 44, 42, '#334155');
  for (let s = 0; s < 5; s++) {
    drawPixelRect(ctx, 984 + s * 8, 552, 5, 4, '#FFD66B');
    drawPixelRect(ctx, 984 + s * 8, 594, 5, 4, '#FFD66B');
  }

  if (state.flags.hardLandingPenaltyApplied) {
    drawPixelRect(ctx, 1000, 608, 22, 8, '#7C2D12');
    if (Math.floor(tSec * 4) % 2 === 0) {
      drawPixelRect(ctx, 1008, 610, 6, 4, '#F59E0B');
    }
  }

  if (state.day === 1) {
    // Day 1 Touchdown Pad with descending lander plume & concentric dust ripples
    drawPixelRect(ctx, 1068, 560, 148, 62, '#334155');
    ctx.strokeStyle = '#FFD66B';
    ctx.lineWidth = 2;
    ctx.strokeRect(1068, 560, 148, 62);
    drawPixelRect(ctx, 1084, 572, 116, 38, '#1E293B');
    drawDay1TouchdownLander(ctx, 1142, 588, tSec, true);
    drawBadgeLabel(ctx, 1142, 650, 'TOUCHDOWN PAD', '#FFD66B', '#FFD66B');
  } else if (state.day >= 6) {
    // Day 6+ Jagged rocks, dark -200°C frost shadow pool, tire tracks, rolling Moon Rover & flickering comms arc
    ctx.beginPath();
    ctx.ellipse(1204, 636, 48, 26, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#070E24';
    ctx.fill();
    ctx.strokeStyle = '#79C8E8';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawPixelRect(ctx, 1184, 628, 8, 6, 'rgba(186, 230, 253, 0.72)');
    drawPixelRect(ctx, 1216, 638, 10, 6, 'rgba(121, 200, 232, 0.68)');

    // Jagged lunar rocks near rover path
    drawJaggedMoonBoulder(ctx, 1066, 514, 1.1);
    drawJaggedMoonBoulder(ctx, 1236, 524, 1.25);
    drawJaggedMoonBoulder(ctx, 1062, 660, 0.95);

    // Curved rover tracks out of East Airlock
    for (let tx = 1032; tx < 1188; tx += 12) {
      const curveY = Math.round(Math.sin((tx - 1032) * 0.03) * 8);
      drawPixelRect(ctx, tx, 564 + curveY, 6, 3, '#0F172A');
      drawPixelRect(ctx, tx, 586 + curveY, 6, 3, '#0F172A');
    }

    const roverMoving = state.day === 6;
    const roverPatrolX = roverMoving ? 1118 + Math.sin(tSec * 0.75) * 42 : 1126;
    const roverPatrolY = roverMoving ? 556 + Math.cos(tSec * 1.5) * 8 : 558;
    const hasIceCargo = state.flags.day6Objective === 'crater_ice_extraction';
    const frostedWheels =
      state.day >= 6 &&
      (!hasIceCargo || state.flags.landingSite === 'crater_shadow' || state.flags.day3Allocation === 'battery_storage');
    drawPixelRover(ctx, roverPatrolX, roverPatrolY, tSec, roverMoving, hasIceCargo, frostedWheels);

    // Flickering comms telemetry arc between Rover mast and S-Band Relay Dish
    const arcVisible = Math.floor(tSec * 9) % 5 !== 0;
    if (arcVisible) {
      ctx.save();
      ctx.strokeStyle = state.day === 7 ? 'rgba(248, 113, 113, 0.75)' : 'rgba(121, 200, 232, 0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -tSec * 36;
      ctx.beginPath();
      ctx.moveTo(roverPatrolX + 14, roverPatrolY - 7);
      ctx.quadraticCurveTo(1062, 412, dishX, dishY + 4);
      ctx.stroke();
      ctx.restore();
    }

    drawBadgeLabel(ctx, 1196, 678, '-200°C SHADOW', '#79C8E8', '#334155');
    drawBadgeLabel(
      ctx,
      1136,
      534,
      hasIceCargo ? 'ICE COLLECTED' : 'ROVER ON PATROL',
      '#A995E8',
      '#A995E8',
    );
  } else {
    // Days 2..5: Parked lander silhouette & Rover Pad standby
    drawPixelRect(ctx, 1084, 548, 116, 48, '#293548');
    drawDay1TouchdownLander(ctx, 1142, 574, tSec, false);
    drawBadgeLabel(ctx, 1142, 622, 'LANDER PAD', '#CBD5E1', '#475569');
  }

  // Day 4 dramatic X-class Solar Storm golden/magenta proton streaks across exterior
  if (solarStormActive) {
    ctx.save();
    for (const streak of tracker.protonStreaks) {
      ctx.strokeStyle = streak.magenta
        ? 'rgba(232, 121, 249, 0.72)'
        : 'rgba(255, 214, 107, 0.78)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(streak.x + streak.len, streak.y + streak.len * 0.42);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawRoomShellsAndFloor(
  ctx: CanvasRenderingContext2D,
  state: Readonly<GameState>,
  tSec: number,
): void {
  // Base foundation drop shadow & armored hull
  drawPixelRect(ctx, 196, 158, 802, 526, 'rgba(2, 6, 23, 0.62)');
  drawPixelRect(ctx, 200, 156, 792, 524, '#475569');
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 3;
  ctx.strokeRect(200, 156, 792, 524);

  // Shimmering Cyan Water-Wall Dome during Day 4 Solar Storm or active shielding
  const partialStorm = state.day === 4 && state.flags.day4Protocol === 'partial_shielding';
  const strongWaterShield =
    (state.day === 4 && !partialStorm && state.primary.shielding >= 35) ||
    state.flags.day4Protocol === 'max_shielding' ||
    state.primary.shielding >= 60;

  if (strongWaterShield || state.day === 4) {
    const shieldAlpha = 0.24 + 0.16 * Math.sin(tSec * 3.4);
    ctx.save();
    if (state.day === 4 && !partialStorm) {
      // Full shimmering cyan water-wall dome protecting the lunar outpost
      ctx.fillStyle = `rgba(56, 189, 248, ${(0.06 + 0.04 * Math.sin(tSec * 4)).toFixed(2)})`;
      ctx.fillRect(190, 146, 812, 544);

      ctx.strokeStyle = `rgba(121, 200, 232, ${(0.62 + 0.3 * Math.sin(tSec * 4.5)).toFixed(2)})`;
      ctx.lineWidth = 5;
      ctx.strokeRect(190, 146, 812, 544);

      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 2;
      ctx.setLineDash([18, 10]);
      ctx.lineDashOffset = -tSec * 48;
      ctx.strokeRect(184, 140, 824, 556);

      // Proton deflection bursts along top & left water-wall perimeter
      for (let d = 0; d < 6; d++) {
        const phase = (tSec * 1.9 + d * 0.37) % 1;
        const bx = 220 + ((d * 145) % 740);
        const by = d % 2 === 0 ? 142 : 692;
        const r = 4 + phase * 12;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(224, 242, 254, ${(1 - phase) * 0.85})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = partialStorm
        ? `rgba(245, 158, 11, ${(shieldAlpha + 0.2).toFixed(2)})`
        : `rgba(121, 200, 232, ${shieldAlpha.toFixed(2)})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 10]);
      ctx.lineDashOffset = -tSec * 28;
      ctx.strokeRect(192, 148, 808, 540);
    }
    ctx.restore();
  }

  const floorColors: Record<RoomId, string> = {
    comms_room: '#1E3A5F',
    control_room: '#263C75',
    science_lab: '#1B4353',
    main_habitat: '#2A364B',
    power_station: '#3B2F2F',
    medbay: '#22454B',
    greenhouse: '#1F3D2B',
    robotics_bay: '#2D3142',
  };

  for (const roomId of ROOM_ORDER) {
    const r = ROOM_BOUNDS[roomId];
    drawPixelRect(ctx, r.x, r.y, r.width, r.height, floorColors[roomId]);

    // 16px pixel floor tile grid
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.05)';
    ctx.lineWidth = 1;
    for (let tx = r.x + 16; tx < r.x + r.width; tx += 16) {
      ctx.beginPath();
      ctx.moveTo(tx, r.y);
      ctx.lineTo(tx, r.y + r.height);
      ctx.stroke();
    }
    for (let ty = r.y + 16; ty < r.y + r.height; ty += 16) {
      ctx.beginPath();
      ctx.moveTo(r.x, ty);
      ctx.lineTo(r.x + r.width, ty);
      ctx.stroke();
    }

    // 3/4 north depth shadow & room border
    drawPixelRect(ctx, r.x, r.y, r.width, 12, 'rgba(15, 23, 42, 0.5)');
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.width, r.height);
  }

  // Pressurized doorways connecting every room cleanly to Habitat Core
  const doorwayCenters: readonly { x: number; y: number }[] = [
    { x: 332, y: 336 },
    { x: 596, y: 336 },
    { x: 860, y: 336 },
    { x: 305, y: 480 },
    { x: 506, y: 480 },
    { x: 707, y: 480 },
    { x: 894, y: 480 },
  ];
  for (const d of doorwayCenters) {
    drawPixelRect(ctx, d.x - 22, d.y, 44, 14, '#475569');
    drawPixelRect(ctx, d.x - 18, d.y + 2, 36, 10, '#1E293B');
    drawPixelRect(ctx, d.x - 18, d.y + 5, 36, 2, '#79C8E8');
  }

  // North & South hull viewports (closing tungsten/cyan blast shutters on Day 4 storm)
  const shuttersClosed = state.day === 4 || state.flags.day4Protocol === 'max_shielding';
  const windowXs: readonly number[] = [292, 558, 824];
  for (const wx of windowXs) {
    if (shuttersClosed) {
      drawPixelRect(ctx, wx, 156, 72, 12, '#64748B');
      drawPixelRect(ctx, wx + 4, 158, 64, 8, '#334155');
      drawPixelRect(
        ctx,
        wx + 26,
        159,
        20,
        6,
        state.flags.day4Protocol === 'max_shielding' ? '#79C8E8' : '#F59E0B',
      );

      drawPixelRect(ctx, wx, 668, 72, 12, '#64748B');
      drawPixelRect(ctx, wx + 4, 670, 64, 8, '#334155');
      drawPixelRect(
        ctx,
        wx + 26,
        671,
        20,
        6,
        state.flags.day4Protocol === 'max_shielding' ? '#79C8E8' : '#F59E0B',
      );
    } else {
      drawPixelRect(ctx, wx, 158, 72, 8, '#79C8E8');
      drawPixelRect(ctx, wx, 670, 72, 8, '#79C8E8');
    }
  }

  // Day 4 partial shielding flickering amber storm warning lights along hull corners
  if (state.day === 4 && state.flags.day4Protocol === 'partial_shielding') {
    const warnOn = Math.floor(tSec * 6) % 2 === 0;
    const beaconCol = warnOn ? '#F59E0B' : '#F87171';
    drawPixelRect(ctx, 200, 156, 10, 10, beaconCol);
    drawPixelRect(ctx, 982, 156, 10, 10, beaconCol);
    drawPixelRect(ctx, 200, 670, 10, 10, beaconCol);
    drawPixelRect(ctx, 982, 670, 10, 10, beaconCol);
  }

  // Day 3 Choice: Battery Storage -> Blue frost crystals on Crew Quarters walls; Essential Heating -> Warm orange glow
  if (state.flags.day3Allocation === 'battery_storage') {
    const med = ROOM_BOUNDS.medbay;
    const hab = ROOM_BOUNDS.main_habitat;
    ctx.fillStyle = 'rgba(121, 200, 232, 0.14)';
    ctx.fillRect(med.x + 2, med.y + 2, med.width - 4, med.height - 4);
    ctx.strokeStyle = '#79C8E8';
    ctx.lineWidth = 2;
    ctx.strokeRect(med.x + 2, med.y + 2, med.width - 4, med.height - 4);

    // Jagged blue frost crystals hugging Crew Quarters (Medbay + Right Habitat bunks) walls
    const crystalXs: readonly number[] = [
      med.x + 8,
      med.x + 48,
      med.x + 92,
      med.x + 144,
      hab.x + 560,
      hab.x + 635,
      hab.x + 710,
    ];
    for (let c = 0; c < crystalXs.length; c++) {
      const cx = crystalXs[c];
      if (cx === undefined) continue;
      const wallY = c < 4 ? med.y + 4 : hab.y + 4;
      drawPixelRect(ctx, cx, wallY, 8, 8, '#79C8E8');
      drawPixelRect(ctx, cx + 2, wallY + 6, 4, 5, '#E0F2FE');
      drawPixelRect(ctx, cx + 8, wallY + 2, 4, 4, '#BAE6FD');
    }
    drawPixelRect(ctx, med.x + 3, med.y + 52, 6, 14, '#BAE6FD');
    drawPixelRect(ctx, med.x + med.width - 9, med.y + 62, 6, 14, '#79C8E8');
  } else if (state.flags.day3Allocation === 'essential_heating') {
    const med = ROOM_BOUNDS.medbay;
    const hab = ROOM_BOUNDS.main_habitat;
    const warmPulse = (0.11 + 0.04 * Math.sin(tSec * 2.4)).toFixed(2);
    ctx.fillStyle = `rgba(249, 115, 22, ${warmPulse})`;
    ctx.fillRect(med.x + 4, med.y + 4, med.width - 8, med.height - 8);
    ctx.fillRect(hab.x + 420, hab.y + 4, 336, hab.height - 8);
  }
}

function drawRoomEquipment(
  ctx: CanvasRenderingContext2D,
  state: Readonly<GameState>,
  tSec: number,
  tracker: WorldEffectsTracker,
): void {
  const blackout = state.day === 7 && (state.commsBlackout || !state.eveningDecisionCompletedForDay);

  // 1. Comms Room (214, 170, 236x166)
  {
    const r = ROOM_BOUNDS.comms_room;
    drawPixelRect(ctx, r.x + 18, r.y + 28, 152, 30, '#0F172A');
    drawPixelRect(ctx, r.x + 24, r.y + 33, 66, 20, blackout ? '#7F1D1D' : '#082F49');
    drawPixelRect(ctx, r.x + 98, r.y + 33, 66, 20, blackout ? '#7F1D1D' : '#082F49');

    if (blackout) {
      const flash = Math.floor(tSec * 4) % 2 === 0;
      drawPixelRect(ctx, r.x + 24, r.y + 33, 66, 20, flash ? '#EF4444' : '#991B1B');
      drawPixelRect(ctx, r.x + 98, r.y + 33, 66, 20, flash ? '#DC2626' : '#7F1D1D');
      for (let n = 0; n < 14; n++) {
        const nx = r.x + 26 + ((n * 23 + Math.floor(tSec * 90)) % 132);
        const ny = r.y + 35 + ((n * 11 + Math.floor(tSec * 45)) % 16);
        drawPixelRect(ctx, nx, ny, 4, 2, '#FCA5A5');
      }
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 10px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOS — STATIC', r.x + 94, r.y + 47);
    } else {
      // Scrolling S-Band waveform bars & telemetry lines
      ctx.strokeStyle = '#79C8E8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let wx = 0; wx <= 58; wx += 4) {
        const wy = r.y + 43 + Math.sin(wx * 0.28 + tSec * 7) * 6;
        if (wx === 0) ctx.moveTo(r.x + 28 + wx, wy);
        else ctx.lineTo(r.x + 28 + wx, wy);
      }
      ctx.stroke();

      for (let b = 0; b < 6; b++) {
        const barH = 4 + Math.round((0.5 + 0.5 * Math.sin(tSec * 5 + b * 0.9)) * 12);
        drawPixelRect(ctx, r.x + 104 + b * 9, r.y + 51 - barH, 6, barH, '#9BD8A7');
      }
    }

    // Mini radar monitor + transceiver rack
    drawPixelRect(ctx, r.x + 186, r.y + 28, 32, 64, '#334155');
    drawPixelRect(ctx, r.x + 192, r.y + 36, 20, 5, blackout ? '#F87171' : '#79C8E8');
    drawPixelRect(ctx, r.x + 192, r.y + 48, 20, 5, '#FFD66B');
    drawPixelRect(ctx, r.x + 192, r.y + 60, 20, 5, blackout ? '#F87171' : '#9BD8A7');

    // Radar scope on floor console
    ctx.beginPath();
    ctx.arc(r.x + 56, r.y + 110, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = blackout ? '#F87171' : '#79C8E8';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!blackout) {
      const ang = tSec * 2.2;
      ctx.beginPath();
      ctx.moveTo(r.x + 56, r.y + 110);
      ctx.lineTo(r.x + 56 + Math.cos(ang) * 18, r.y + 110 + Math.sin(ang) * 18);
      ctx.strokeStyle = '#9BD8A7';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Crackling static zigzag inside radar scope
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(r.x + 40, r.y + 110);
      ctx.lineTo(r.x + 48, r.y + 103 + Math.sin(tSec * 28) * 5);
      ctx.lineTo(r.x + 56, r.y + 116 - Math.sin(tSec * 24) * 5);
      ctx.lineTo(r.x + 64, r.y + 105);
      ctx.lineTo(r.x + 72, r.y + 111);
      ctx.stroke();
    }
  }

  // 2. Command Bridge / Control Room (462, 170, 268x166)
  {
    const r = ROOM_BOUNDS.control_room;
    drawPixelRect(ctx, r.x + 28, r.y + 26, 212, 30, '#0F172A');
    if (blackout) {
      const flash = Math.floor(tSec * 4) % 2 === 0;
      drawPixelRect(ctx, r.x + 34, r.y + 31, 200, 20, flash ? '#DC2626' : '#7F1D1D');
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOS — EARTH LINK OFFLINE', r.x + 134, r.y + 45);
    } else {
      drawPixelRect(ctx, r.x + 34, r.y + 31, 200, 20, '#172554');
      drawPixelRect(ctx, r.x + 42, r.y + 36, 52, 10, '#79C8E8');
      drawPixelRect(ctx, r.x + 106, r.y + 36, 56, 10, '#9BD8A7');
      drawPixelRect(ctx, r.x + 174, r.y + 36, 50, 10, '#FFD66B');
    }

    // Holographic Briefing Table + spinning 3D wireframe Moon emblem
    drawPixelRect(ctx, r.x + 80, r.y + 82, 108, 54, '#475569');
    drawPixelRect(ctx, r.x + 90, r.y + 88, 88, 42, '#0F172A');
    const holoX = r.x + 134;
    const holoY = r.y + 109;
    const holoR = 14;
    ctx.strokeStyle = '#79C8E8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(holoX, holoY, holoR, 0, Math.PI * 2);
    ctx.stroke();

    const meridianRx = Math.max(2, Math.abs(Math.cos(tSec * 1.6)) * holoR);
    ctx.beginPath();
    ctx.ellipse(holoX, holoY, meridianRx, holoR, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFD66B';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(holoX, holoY, holoR, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(121, 200, 232, 0.7)';
    ctx.stroke();

    // Blinking crisp console LEDs on side desks
    const ledColorA = Math.floor(tSec * 3) % 2 === 0 ? '#9BD8A7' : '#334155';
    const ledColorB = Math.floor(tSec * 3 + 1) % 2 === 0 ? '#FFD66B' : '#334155';
    drawPixelRect(ctx, r.x + 28, r.y + 92, 34, 24, '#334155');
    drawPixelRect(ctx, r.x + 34, r.y + 98, 6, 6, ledColorA);
    drawPixelRect(ctx, r.x + 48, r.y + 98, 6, 6, ledColorB);
    drawPixelRect(ctx, r.x + 206, r.y + 92, 34, 24, '#334155');
    drawPixelRect(ctx, r.x + 212, r.y + 98, 6, 6, ledColorB);
    drawPixelRect(ctx, r.x + 226, r.y + 98, 6, 6, ledColorA);
  }

  // 3. Science Lab & Water-Wall Shield Bay (742, 170, 236x166)
  {
    const r = ROOM_BOUNDS.science_lab;
    // DONKI space weather monitor
    drawPixelRect(ctx, r.x + 18, r.y + 28, 114, 30, '#0F172A');
    drawPixelRect(ctx, r.x + 23, r.y + 33, 104, 20, '#064E3B');
    ctx.strokeStyle = state.day === 4 ? '#FFD66B' : '#9BD8A7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= 96; px += 6) {
      const amp = state.day === 4 ? 7 : 3.5;
      const py = r.y + 43 + Math.sin(px * 0.25 + tSec * 7) * amp;
      if (px === 0) ctx.moveTo(r.x + 27 + px, py);
      else ctx.lineTo(r.x + 27 + px, py);
    }
    ctx.stroke();

    // Water-Wall Radiation Shelter Jacket & Magnetic Shield Ring
    drawPixelRect(ctx, r.x + 150, r.y + 28, 64, 54, '#334155');
    drawPixelRect(ctx, r.x + 156, r.y + 34, 52, 42, '#082F49');
    const ringRadius = 14 + Math.sin(tSec * 3.5) * 2.5;
    ctx.beginPath();
    ctx.arc(r.x + 182, r.y + 55, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = state.day === 4 ? '#FFD66B' : '#79C8E8';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r.x + 182, r.y + 55, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#A995E8';
    ctx.fill();

    // Sample analysis bench
    drawPixelRect(ctx, r.x + 22, r.y + 92, 82, 36, '#475569');
    drawPixelRect(ctx, r.x + 30, r.y + 100, 16, 18, '#79C8E8');
    drawPixelRect(ctx, r.x + 54, r.y + 100, 16, 18, '#9BD8A7');
    drawPixelRect(ctx, r.x + 78, r.y + 100, 16, 18, '#FFD66B');
  }

  // 4. Main Habitat & Life Support Spine (214, 348, 764x132)
  {
    const r = ROOM_BOUNDS.main_habitat;
    // Left O2 scrubber pistons & water columns
    const pistonShiftA = Math.round(Math.sin(tSec * 4.2) * 5);
    const pistonShiftB = Math.round(Math.cos(tSec * 4.2) * 5);
    drawPixelRect(ctx, r.x + 26, r.y + 30, 32, 74, '#0284C7');
    drawPixelRect(ctx, r.x + 31, r.y + 38 + pistonShiftA, 22, 44, '#79C8E8');
    drawPixelRect(ctx, r.x + 68, r.y + 30, 32, 74, '#059669');
    drawPixelRect(ctx, r.x + 73, r.y + 38 + pistonShiftB, 22, 44, '#9BD8A7');

    // Pressurized life support airflow conduit + gliding teal airflow chevrons
    drawPixelRect(ctx, r.x + 104, r.y + 62, 270, 10, '#082F49');
    ctx.strokeStyle = '#79C8E8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(r.x + 104, r.y + 62, 270, 10);
    for (let c = 0; c < 4; c++) {
      const cx = r.x + 112 + ((tSec * 75 + c * 66) % 252);
      const cy = r.y + 67;
      ctx.strokeStyle = '#9BD8A7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 3);
      ctx.lineTo(cx + 2, cy);
      ctx.lineTo(cx - 4, cy + 3);
      ctx.stroke();
    }

    // Central crew briefing & galley table
    drawPixelRect(ctx, r.x + 392, r.y + 36, 152, 62, '#475569');
    drawPixelRect(ctx, r.x + 402, r.y + 44, 132, 46, '#64748B');
    drawPixelRect(ctx, r.x + 416, r.y + 56, 28, 20, '#FFD66B');
    drawPixelRect(ctx, r.x + 462, r.y + 56, 52, 22, '#0F172A');

    // Right water recycling & pressure valves
    drawPixelRect(ctx, r.x + 634, r.y + 30, 104, 74, '#334155');
    drawPixelRect(ctx, r.x + 644, r.y + 38, 36, 58, '#0284C7');
    drawPixelRect(ctx, r.x + 690, r.y + 38, 36, 58, '#0D9488');
  }

  // 5. Power Core (214, 492, 182x174)
  {
    const r = ROOM_BOUNDS.power_station;
    const lowPwr = state.primary.power < 35;
    for (let i = 0; i < 3; i++) {
      const bx = r.x + 20 + i * 50;
      drawPixelRect(ctx, bx, r.y + 26, 38, 46, '#0F172A');
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, r.y + 26, 38, 46);

      const pulseOffset = Math.sin(tSec * 4 + i * 0.8) * 0.04;
      const fillRatio = Math.max(0.14, Math.min(1, state.primary.power / 100 + pulseOffset));
      const barH = Math.round(36 * fillRatio);
      drawPixelRect(
        ctx,
        bx + 5,
        r.y + 68 - barH,
        28,
        barH,
        lowPwr ? '#F59E0B' : '#79C8E8',
      );
      drawPixelRect(
        ctx,
        bx + 5,
        r.y + 68 - barH,
        28,
        4,
        lowPwr ? '#FFD66B' : '#F8FAFC',
      );
    }

    drawPixelRect(ctx, r.x + 24, r.y + 130, 134, 28, '#334155');
    drawPixelRect(ctx, r.x + 32, r.y + 136, 118, 16, '#0F172A');
    const faultFlash = (state.flags.hardwareFaultRisk || lowPwr || state.day === 3) && Math.floor(tSec * 6) % 2 === 0;
    drawPixelRect(ctx, r.x + 42, r.y + 141, 98, 6, faultFlash ? '#F87171' : '#FFD66B');

    // Day 3 / fault / overclock yellow electric spark arcs inside Power Core
    if (
      state.day === 3 ||
      state.flags.day3Allocation === 'overclock_regulators' ||
      state.flags.hardwareFaultRisk
    ) {
      const phase = Math.floor(tSec * 10) % 3;
      if (phase !== 1) {
        ctx.save();
        ctx.strokeStyle = '#FFD66B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.x + 38, r.y + 126);
        ctx.lineTo(r.x + 62, r.y + 114 + phase * 3);
        ctx.lineTo(r.x + 88, r.y + 128);
        ctx.lineTo(r.x + 118, r.y + 112);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // 6. Medbay & Crew Quarters (408, 492, 196x174)
  {
    const r = ROOM_BOUNDS.medbay;
    drawPixelRect(ctx, r.x + 16, r.y + 25, 78, 22, '#0F172A');
    ctx.strokeStyle = '#9BD8A7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const scanSweep = (tSec * 42) % 68;
    ctx.moveTo(r.x + 22, r.y + 36);
    ctx.lineTo(r.x + 40, r.y + 36);
    ctx.lineTo(r.x + 46, r.y + 29);
    ctx.lineTo(r.x + 52, r.y + 43);
    ctx.lineTo(r.x + 58, r.y + 36);
    ctx.lineTo(r.x + 88, r.y + 36);
    ctx.stroke();
    drawPixelRect(ctx, r.x + 20 + scanSweep, r.y + 27, 3, 18, 'rgba(155, 216, 167, 0.35)');

    drawPixelRect(ctx, r.x + 114, r.y + 25, 66, 22, '#E2E8F0');
    drawPixelRect(ctx, r.x + 120, r.y + 29, 54, 14, '#9BD8A7');

    // Day 3 Thermal choice hardware indicator: Heater Radiator vs Frosted Coil
    if (state.flags.day3Allocation === 'essential_heating') {
      drawPixelRect(ctx, r.x + 14, r.y + 56, 44, 14, '#7C2D12');
      for (let coil = 0; coil < 4; coil++) {
        drawPixelRect(
          ctx,
          r.x + 18 + coil * 10,
          r.y + 59,
          6,
          8,
          Math.floor(tSec * 5 + coil) % 2 === 0 ? '#FB923C' : '#F97316',
        );
      }
    } else if (state.flags.day3Allocation === 'battery_storage') {
      drawPixelRect(ctx, r.x + 14, r.y + 56, 44, 14, '#082F49');
      drawPixelRect(ctx, r.x + 18, r.y + 59, 36, 8, '#79C8E8');
      drawPixelRect(ctx, r.x + 22, r.y + 61, 8, 4, '#E0F2FE');
    }

    for (let b = 0; b < 3; b++) {
      const by = r.y + 98 + b * 22;
      drawPixelRect(ctx, r.x + 18, by, 74, 17, '#475569');
      drawPixelRect(ctx, r.x + 22, by + 2, 14, 13, '#F8FAFC');
      drawPixelRect(
        ctx,
        r.x + 38,
        by + 2,
        50,
        13,
        state.flags.day3Allocation === 'battery_storage' ? '#38BDF8' : '#79C8E8',
      );

      drawPixelRect(ctx, r.x + 104, by, 74, 17, '#475569');
      drawPixelRect(ctx, r.x + 108, by + 2, 14, 13, '#F8FAFC');
      drawPixelRect(ctx, r.x + 124, by + 2, 50, 13, '#A995E8');
    }
  }

  // Day 5 slow drifting amber CO2 haze in Crew Quarters turning into crisp oxygen sparkles once ventilated
  if (state.day === 5 || state.day >= 6) {
    const day5Ventilated =
      state.day >= 6 ||
      state.anomaly?.resolved === true ||
      state.eveningDecisionCompletedForDay;

    if (state.day === 5 && !day5Ventilated) {
      // Soft amber CO2 haze clouds drifting slowly over Medbay & Habitat Quarters
      const med = ROOM_BOUNDS.medbay;
      const hab = ROOM_BOUNDS.main_habitat;
      const driftA = Math.sin(tSec * 1.1) * 8;
      const driftB = Math.cos(tSec * 0.9) * 8;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.fillRect(med.x + 6, med.y + 14, med.width - 12, med.height - 20);
      ctx.fillRect(hab.x + 380, hab.y + 12, 370, hab.height - 20);

      for (const m of tracker.co2Motes) {
        const alpha = Math.sin((m.age / m.maxAge) * Math.PI) * 0.72;
        ctx.fillStyle = `rgba(251, 191, 36, ${Math.max(0, alpha).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(m.x + driftA * 0.4, m.y + driftB * 0.3, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      drawBadgeLabel(ctx, med.centerX, med.y + 162, 'CO2 HAZE', '#FBBF24', '#F59E0B');
    } else if (day5Ventilated) {
      // Crisp twinkling oxygen (O2) sparkles circulating cleanly
      for (let i = 0; i < tracker.co2Motes.length; i++) {
        const m = tracker.co2Motes[i];
        if (!m) continue;
        const sparkle = 0.35 + 0.65 * Math.abs(Math.sin(tSec * 3.8 + i * 0.7));
        const col =
          i % 2 === 0
            ? `rgba(155, 216, 167, ${sparkle.toFixed(2)})`
            : `rgba(121, 200, 232, ${sparkle.toFixed(2)})`;
        drawPixelRect(ctx, m.x - 1, m.y - 3, 2, 6, col);
        drawPixelRect(ctx, m.x - 3, m.y - 1, 6, 2, col);
      }
      if (state.day === 5) {
        drawBadgeLabel(
          ctx,
          ROOM_BOUNDS.medbay.centerX,
          ROOM_BOUNDS.medbay.y + 162,
          'O2 FRESH',
          '#9BD8A7',
          '#9BD8A7',
        );
      }
    }
  }

  // 7. Hydroponic Greenhouse (616, 492, 182x174)
  {
    const r = ROOM_BOUNDS.greenhouse;
    const mode = state.flags.farmingMode;
    const stalled = state.flags.activePumpsStalled;
    const lushDay = state.day >= 3 && !stalled;

    drawPixelRect(ctx, r.x + 18, r.y + 26, 146, 14, '#334155');
    // Pipe bubble pulse inside upper horizontal pipe manifold
    if (!stalled) {
      for (let hb = 0; hb < 4; hb++) {
        const bx = r.x + 26 + ((tSec * 42 + hb * 36) % 130);
        drawPixelRect(ctx, bx, r.y + 30, 5, 5, '#BAE6FD');
      }
    }

    // Left & right transparent microalgae/water riser tubes with rising bubbles
    const pipeColor = stalled
      ? Math.floor(tSec * 4) % 2 === 0
        ? '#F87171'
        : '#7F1D1D'
      : mode === 'capillary_ponds'
        ? '#0D9488'
        : '#0284C7';
    drawPixelRect(ctx, r.x + 22, r.y + 40, 12, 110, pipeColor);
    drawPixelRect(ctx, r.x + 148, r.y + 40, 12, 110, pipeColor);

    if (!stalled) {
      for (let b = 0; b < 5; b++) {
        const bubbleY = r.y + 142 - ((tSec * 42 + b * 22) % 98);
        const pulse = b % 2 === 0 ? 5 : 4;
        drawPixelRect(ctx, r.x + 26, bubbleY, pulse, pulse, '#F8FAFC');
        drawPixelRect(ctx, r.x + 152, bubbleY, pulse, pulse, '#F8FAFC');
      }
    }

    // 3 Grow trays + progressive crop lushness
    for (let row = 0; row < 3; row++) {
      const ty = r.y + 48 + row * 36;
      drawPixelRect(
        ctx,
        r.x + 42,
        ty,
        98,
        24,
        mode === 'capillary_ponds' ? '#78350F' : '#1E293B',
      );
      if (mode === 'capillary_ponds') {
        drawPixelRect(ctx, r.x + 44, ty + 18, 94, 4, '#2DD4BF');
        for (let m = 0; m < 3; m++) {
          const mistY = ty + 8 - ((tSec * 14 + m * 6 + row * 4) % 12);
          drawPixelRect(ctx, r.x + 54 + m * 30, mistY, 3, 3, 'rgba(121, 200, 232, 0.72)');
        }
      }
      for (let col = 0; col < 5; col++) {
        const lx = r.x + 48 + col * 18;
        const leafColor = stalled ? '#CA8A04' : lushDay ? '#22C55E' : '#4ADE80';
        const tipColor = stalled ? '#A16207' : '#9BD8A7';
        const extraH = lushDay ? 3 : 0;
        drawPixelRect(ctx, lx, ty + 4 - extraH, 10, 12 + extraH, leafColor);
        drawPixelRect(ctx, lx + 2, ty + 1 - extraH, 6, 6, tipColor);
        if (state.day >= 4 && !stalled && (row + col) % 2 === 0) {
          drawPixelRect(ctx, lx + 3, ty + 6, 4, 4, '#F87171');
        }
      }
    }

    // Day 2 (and active greenhouse) floating 1/6g microgravity water droplets
    if ((state.day === 2 || mode === 'active_pumps') && !stalled) {
      const count = state.day === 2 ? 9 : 4;
      for (let d = 0; d < count; d++) {
        const dx = r.x + 46 + ((d * 27 + Math.sin(tSec * 1.8 + d) * 8) % 92);
        const dy = r.y + 44 + ((d * 31 + Math.cos(tSec * 2.1 + d * 1.4) * 10) % 96);
        const dropSize = d % 3 === 0 ? 5 : 4;
        drawPixelRect(ctx, dx, dy, dropSize, dropSize, '#38BDF8');
        drawPixelRect(ctx, dx + 1, dy + 1, 2, 2, '#E0F2FE');
      }
    }

    if (stalled) {
      drawBadgeLabel(ctx, r.centerX, r.y + 162, 'PUMP STALLED', '#F87171', '#F87171');
    } else if (mode !== null) {
      drawBadgeLabel(
        ctx,
        r.centerX,
        r.y + 162,
        mode === 'active_pumps' ? 'ACTIVE PUMPS' : 'CAPILLARY PONDS',
        mode === 'active_pumps' ? '#79C8E8' : '#9BD8A7',
        '#334155',
      );
    }
  }

  // 8. Robotics Bay & Airlock (810, 492, 168x174)
  {
    const r = ROOM_BOUNDS.robotics_bay;
    drawPixelRect(ctx, r.x + 18, r.y + 28, 108, 22, '#475569');
    drawPixelRect(ctx, r.x + 26, r.y + 33, 36, 12, '#A995E8');
    drawPixelRect(ctx, r.x + 74, r.y + 33, 42, 12, '#FFD66B');

    drawPixelRect(ctx, r.x + 36, r.y + 68, 92, 74, '#0F172A');
    ctx.strokeStyle = '#A995E8';
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x + 36, r.y + 68, 92, 74);

    if (state.day < 6) {
      drawPixelRover(ctx, r.x + 68, r.y + 88, tSec, false);
    } else {
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 10px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ROVER OUT', r.x + 82, r.y + 108);
    }

    // Pressurized east airlock seal
    drawPixelRect(ctx, r.x + r.width - 8, r.y + 66, 10, 48, '#FFD66B');
    drawPixelRect(ctx, r.x + r.width - 6, r.y + 72, 6, 36, '#1E293B');
  }
}

function drawEmergencyOverlayAndLabels(
  ctx: CanvasRenderingContext2D,
  _state: Readonly<GameState>,
  view: BaseMapViewState,
  activeTarget: FeaturedDayTarget,
  tSec: number,
  missionPhase: MissionPhase,
): void {
  const pulse = 0.5 + 0.5 * Math.sin(tSec * (missionPhase === 'midday' ? 6.4 : 4.2));
  const isMidday = missionPhase === 'midday';
  const primaryColor = isMidday ? '#F87171' : '#79C8E8';
  const secondaryColor = isMidday ? '#F59E0B' : '#BAE6FD';
  const fillGlow = isMidday
    ? `rgba(248, 113, 113, ${(0.08 + 0.08 * pulse).toFixed(2)})`
    : `rgba(121, 200, 232, ${(0.07 + 0.06 * pulse).toFixed(2)})`;

  for (const roomId of ROOM_ORDER) {
    const r = ROOM_BOUNDS[roomId];
    const isTarget = roomId === activeTarget.roomId;
    const isHovered = view.hoveredRoom === roomId;

    if (!isTarget) {
      drawPixelRect(ctx, r.x, r.y, r.width, r.height, 'rgba(9, 13, 22, 0.44)');
      drawBadgeLabel(
        ctx,
        r.x + 8,
        r.y + 18,
        r.shortLabel,
        '#94A3B8',
        '#334155',
        'left',
      );
      continue;
    }

    // Highlight target room with pulsing cyan beacon (morning) or urgent amber/coral anomaly outline (midday)
    drawPixelRect(ctx, r.x, r.y, r.width, r.height, fillGlow);
    ctx.strokeStyle = isHovered ? '#FFFBEB' : primaryColor;
    ctx.lineWidth = isHovered ? 4.5 : 3.5;
    ctx.strokeRect(r.x - 1, r.y - 1, r.width + 2, r.height + 2);

    if (isMidday) {
      // Sparking alert outline & corner sparks around Midday Anomaly room
      ctx.save();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -tSec * 48;
      ctx.strokeRect(r.x - 5, r.y - 5, r.width + 10, r.height + 10);
      ctx.restore();

      const corners: readonly [number, number][] = [
        [r.x, r.y],
        [r.x + r.width, r.y],
        [r.x, r.y + r.height],
        [r.x + r.width, r.y + r.height],
      ];
      const sparkStep = Math.floor(tSec * 14) % 4;
      for (let c = 0; c < corners.length; c++) {
        const pt = corners[c];
        if (!pt) continue;
        if ((c + sparkStep) % 2 === 0) {
          drawPixelRect(ctx, pt[0] - 4, pt[1] - 4, 8, 8, '#FFD66B');
          drawPixelRect(ctx, pt[0] - 2, pt[1] - 8, 4, 16, '#F87171');
          drawPixelRect(ctx, pt[0] - 8, pt[1] - 2, 16, 4, '#F87171');
        }
      }
    }

    drawBadgeLabel(
      ctx,
      r.x + 8,
      r.y + 18,
      activeTarget.roomLabel.toUpperCase(),
      isMidday ? '#FFD66B' : '#79C8E8',
      primaryColor,
      'left',
    );
  }
}

function drawBouncingArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tSec: number,
  fillColor: string,
): void {
  const bob = Math.sin(tSec * 5.2) * 4.5;
  const ax = Math.round(x);
  const ay = Math.round(y + bob);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ax - 4, ay - 16);
  ctx.lineTo(ax + 4, ay - 16);
  ctx.lineTo(ax + 4, ay - 7);
  ctx.lineTo(ax + 10, ay - 7);
  ctx.lineTo(ax, ay + 4);
  ctx.lineTo(ax - 10, ay - 7);
  ctx.lineTo(ax - 4, ay - 7);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawDirectionalGuideChevrons(
  ctx: CanvasRenderingContext2D,
  view: BaseMapViewState,
  activeTarget: FeaturedDayTarget,
  tSec: number,
  missionPhase: MissionPhase,
): void {
  const waypoints = getFeaturedGuideWaypoints(view.commanderX, view.commanderY, activeTarget);
  const spacing = 24;
  const chevronSamples: Array<{ x: number; y: number; angle: number }> = [];
  let carryDist = 18;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const segLen = Math.hypot(dx, dy);
    if (segLen < 1) continue;
    const angle = Math.atan2(dy, dx);

    while (carryDist <= segLen) {
      const ratio = carryDist / segLen;
      chevronSamples.push({
        x: a.x + dx * ratio,
        y: a.y + dy * ratio,
        angle,
      });
      carryDist += spacing;
    }
    carryDist -= segLen;
  }

  const isMidday = missionPhase === 'midday';
  const ribbonColor = isMidday ? 'rgba(248, 113, 113, 0.2)' : 'rgba(121, 200, 232, 0.2)';
  const baseColor = isMidday ? '#F59E0B' : '#79C8E8';
  const hotColor = isMidday ? '#F87171' : '#E0F2FE';

  ctx.save();
  ctx.strokeStyle = ribbonColor;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < waypoints.length; i++) {
    const pt = waypoints[i];
    if (!pt) continue;
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // Animated directional floor chevrons marching toward active specialist/anomaly room
  for (let i = 0; i < chevronSamples.length; i++) {
    const pt = chevronSamples[i];
    if (!pt) continue;
    const chase = Math.max(0, Math.sin(tSec * 7.2 - i * 0.78));
    const scale = 0.85 + chase * 0.35;
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.angle);
    ctx.scale(scale, scale);
    ctx.strokeStyle = chase > 0.7 ? hotColor : baseColor;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.lineTo(3, 0);
    ctx.lineTo(-4, 5);
    ctx.stroke();
    ctx.restore();
  }

  // Pulsing guide beacon pad around active specialist & meeting spot
  const padPulse = 0.5 + 0.5 * Math.sin(tSec * (isMidday ? 6.2 : 4.2));
  ctx.beginPath();
  ctx.ellipse(
    activeTarget.crewX,
    activeTarget.crewY + 12,
    22 + padPulse * 5,
    9 + padPulse * 2.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = isMidday
    ? `rgba(248, 113, 113, ${(0.18 + padPulse * 0.16).toFixed(2)})`
    : `rgba(121, 200, 232, ${(0.18 + padPulse * 0.16).toFixed(2)})`;
  ctx.fill();
  ctx.strokeStyle = isMidday ? '#F87171' : '#79C8E8';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  const distToMeet = Math.hypot(
    activeTarget.meetX - view.commanderX,
    activeTarget.meetY - view.commanderY,
  );
  if (distToMeet > 28) {
    ctx.beginPath();
    ctx.arc(activeTarget.meetX, activeTarget.meetY + 6, 9 + padPulse * 3, 0, Math.PI * 2);
    ctx.strokeStyle = isMidday ? 'rgba(245, 158, 11, 0.9)' : 'rgba(121, 200, 232, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

function drawFeaturedCrewCallout(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  tSec: number,
  missionPhase: MissionPhase,
): void {
  const isMidday = missionPhase === 'midday';
  const pulse = 0.5 + 0.5 * Math.sin(tSec * (isMidday ? 6.4 : 4.6));
  const floatY = Math.sin(tSec * 3.8) * 2;
  const px = Math.round(x);
  const badgeCenterY = Math.round(y - 36 + floatY);

  ctx.save();
  ctx.font = '800 12px Nunito, sans-serif';
  const textW = Math.ceil(ctx.measureText(text).width);
  const boxW = textW + 20;
  const boxH = 22;
  const left = Math.round(Math.max(12, Math.min(BASE_CANVAS_WIDTH - boxW - 12, px - boxW / 2)));
  const top = badgeCenterY - Math.round(boxH / 2);

  // Pulsing outer aura (cyan for morning guide beacon, coral/amber for midday anomaly)
  ctx.strokeStyle = isMidday
    ? `rgba(248, 113, 113, ${(0.45 + pulse * 0.45).toFixed(2)})`
    : `rgba(121, 200, 232, ${(0.4 + pulse * 0.45).toFixed(2)})`;
  ctx.lineWidth = 5;
  ctx.strokeRect(left - 2, top - 2, boxW + 4, boxH + 4);

  drawPixelRect(ctx, left, top, boxW, boxH, isMidday ? '#F87171' : '#79C8E8');
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, boxW, boxH);

  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'center';
  ctx.fillText(text, left + boxW / 2, top + 15);
  ctx.restore();

  drawBouncingArrow(ctx, px, top - 8, tSec, isMidday ? '#F59E0B' : '#79C8E8');
}

export type CrewMapEmote = 'cold' | 'tired' | 'cough' | 'cheer' | 'shield';

function drawCrewEmoteIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  emote: CrewMapEmote,
  tSec: number,
): void {
  const bob = Math.round(Math.sin(tSec * 4.5) * 1.5);
  const ex = Math.round(x);
  const ey = Math.round(y + bob);

  switch (emote) {
    case 'cold': {
      // Crisp 7x7 cyan pixel snowflake crystal
      drawPixelRect(ctx, ex - 3, ey, 7, 1, '#BAE6FD');
      drawPixelRect(ctx, ex, ey - 3, 1, 7, '#BAE6FD');
      drawPixelRect(ctx, ex - 2, ey - 2, 1, 1, '#79C8E8');
      drawPixelRect(ctx, ex + 2, ey - 2, 1, 1, '#79C8E8');
      drawPixelRect(ctx, ex - 2, ey + 2, 1, 1, '#79C8E8');
      drawPixelRect(ctx, ex + 2, ey + 2, 1, 1, '#79C8E8');
      break;
    }
    case 'tired': {
      const floatUp = Math.round((tSec * 10) % 7);
      ctx.fillStyle = '#A995E8';
      ctx.font = 'bold 9px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('zZ', ex + 2, ey - floatUp);
      break;
    }
    case 'cough': {
      // Drifting amber CO2 swirl puffs
      const puff = Math.round((tSec * 8) % 6);
      drawPixelRect(ctx, ex - 1, ey - puff, 4, 4, '#FBBF24');
      drawPixelRect(ctx, ex + 3, ey - 3 - puff, 3, 3, '#F59E0B');
      break;
    }
    case 'cheer': {
      // Sparkling gold 4-point star
      const col = Math.floor(tSec * 6) % 2 === 0 ? '#FFD66B' : '#FFFBEB';
      drawPixelRect(ctx, ex - 3, ey, 7, 1, col);
      drawPixelRect(ctx, ex, ey - 3, 1, 7, col);
      drawPixelRect(ctx, ex - 1, ey - 1, 3, 3, col);
      break;
    }
    case 'shield': {
      // Cyan radiation shield emblem
      drawPixelRect(ctx, ex - 3, ey - 3, 7, 6, '#0284C7');
      drawPixelRect(ctx, ex - 2, ey - 2, 5, 4, '#79C8E8');
      drawPixelRect(ctx, ex - 1, ey + 3, 3, 2, '#79C8E8');
      break;
    }
    default: {
      const _exhaustive: never = emote;
      return _exhaustive;
    }
  }
}

function drawCrewStatusBubble(
  ctx: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
  text: string,
  accentColor: string,
): void {
  ctx.save();
  ctx.font = 'bold 10px Nunito, sans-serif';
  const metrics = ctx.measureText(text);
  const boxW = Math.ceil(metrics.width) + 12;
  const boxH = 16;
  const left = Math.round(Math.max(8, Math.min(BASE_CANVAS_WIDTH - boxW - 8, anchorX - boxW / 2)));
  const top = Math.round(Math.min(BASE_CANVAS_HEIGHT - boxH - 6, anchorY));

  drawPixelRect(ctx, left, top, boxW, boxH, 'rgba(15, 23, 42, 0.92)');
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(left, top, boxW, boxH);

  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.fillText(text, left + boxW / 2, top + 11);
  ctx.restore();
}

function drawAstronautSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accentColor: string,
  label: string,
  options: {
    isCommander?: boolean;
    isResting?: boolean;
    isFeatured?: boolean;
    featuredBadgeText?: string;
    missionPhase?: MissionPhase;
    shivering?: boolean;
    visorShielding?: boolean;
    emote?: CrewMapEmote | null;
    statusBubble?: string | null;
    fatigued?: boolean;
    readyPing?: boolean;
    tSec: number;
    phaseOffset: number;
    walking: boolean;
    walkPhase: number;
    facing: SpriteFacing;
  },
): void {
  if (options.isResting) {
    const px = Math.round(x);
    const py = Math.round(y);
    drawPixelRect(ctx, px - 12, py - 6, 24, 12, '#F8FAFC');
    drawPixelRect(ctx, px - 14, py - 7, 11, 11, '#E2E8F0');
    drawPixelRect(ctx, px - 11, py - 5, 6, 6, '#79C8E8');
    const zDrift = ((options.tSec * 14 + options.phaseOffset * 5) % 14);
    ctx.fillStyle = '#79C8E8';
    ctx.font = 'bold 10px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('zZ', px + 10, py - 7 - zDrift);
    return;
  }

  // 4-frame walk cycle or subtle idle breathing bob (plus cold shiver tremor when quarters unheated)
  const frameIndex = options.walking ? Math.floor(options.walkPhase) % 4 : 1;
  const strideBob =
    options.walking && (frameIndex === 0 || frameIndex === 2)
      ? -1.6
      : !options.walking
        ? Math.sin(options.tSec * 2.4 + options.phaseOffset) * 1.1
        : 0;
  const shiverOffsetX = options.shivering
    ? Math.sin(options.tSec * 28 + options.phaseOffset * 2) * 1.4
    : 0;

  const px = Math.round(x + shiverOffsetX);
  const py = Math.round(y + strideBob);

  // Drop shadow
  ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
  ctx.beginPath();
  ctx.ellipse(px, Math.round(y) + 12, 10, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Boots (4-frame alternating stride)
  const leftBootOffset = frameIndex === 0 ? -2 : frameIndex === 2 ? 2 : 0;
  const rightBootOffset = frameIndex === 0 ? 2 : frameIndex === 2 ? -2 : 0;
  drawPixelRect(ctx, px - 6, py + 6 + leftBootOffset, 5, 6, '#CBD5E1');
  drawPixelRect(ctx, px + 1, py + 6 + rightBootOffset, 5, 6, '#CBD5E1');

  // Torso & swinging arms (right arm raises over visor when shielding against partial solar storm)
  drawPixelRect(ctx, px - 8, py - 5, 16, 12, '#F8FAFC');
  drawPixelRect(ctx, px - 8, py - 4, 16, 3, accentColor);

  const leftArmY = py - 3 + (frameIndex === 0 ? 2 : frameIndex === 2 ? -2 : 0);
  const rightArmY = options.visorShielding
    ? py - 15
    : py - 3 + (frameIndex === 0 ? -2 : frameIndex === 2 ? 2 : 0);
  drawPixelRect(ctx, px - 11, leftArmY, 3, 7, '#E2E8F0');
  drawPixelRect(ctx, px + 8, rightArmY, 3, 7, options.visorShielding ? '#FFD66B' : '#E2E8F0');

  // Oxygen PLSS backpack when facing up or side
  if (options.facing === 'up') {
    drawPixelRect(ctx, px - 6, py - 6, 12, 11, '#94A3B8');
    drawPixelRect(ctx, px - 4, py - 4, 8, 3, options.isCommander ? '#FFD66B' : accentColor);
  }

  // Helmet shell
  drawPixelRect(ctx, px - 8, py - 17, 16, 13, '#F8FAFC');
  ctx.strokeStyle = options.isCommander || options.isFeatured ? '#FFD66B' : '#94A3B8';
  ctx.lineWidth = options.isCommander || options.isFeatured ? 2 : 1;
  ctx.strokeRect(px - 8, py - 17, 16, 13);

  // Directional visor + natural periodic eye blink inside helmet
  if (options.facing !== 'up') {
    const visorShiftX =
      options.facing === 'left' ? -2 : options.facing === 'right' ? 2 : 0;
    const vx = px - 5 + visorShiftX;
    const vy = py - 14;
    drawPixelRect(
      ctx,
      vx,
      vy,
      10,
      7,
      options.visorShielding ? '#92400E' : options.isCommander ? '#263C75' : '#1E293B',
    );

    const blinkCycle = (options.tSec + options.phaseOffset * 0.7) % 4.1;
    const isBlinking = blinkCycle > 3.96;
    if (isBlinking) {
      drawPixelRect(ctx, vx + 2, vy + 4, 2, 1, '#79C8E8');
      drawPixelRect(ctx, vx + 6, vy + 4, 2, 1, '#79C8E8');
    } else {
      drawPixelRect(ctx, vx + 2, vy + 3, 2, 2, '#F8FAFC');
      drawPixelRect(ctx, vx + 6, vy + 3, 2, 2, '#F8FAFC');
    }
    drawPixelRect(ctx, vx + 1, vy + 1, 4, 1, 'rgba(121, 200, 232, 0.75)');
  }

  // Tiny puffing cold-breath pixels when shivering in battery-save chill
  if (options.shivering) {
    const breathPhase = (options.tSec * 2 + options.phaseOffset) % 1;
    const bx = px + 6 + Math.round(breathPhase * 8);
    const by = py - 10 - Math.round(breathPhase * 4);
    drawPixelRect(
      ctx,
      bx,
      by,
      3,
      3,
      `rgba(186, 230, 253, ${(0.85 * (1 - breathPhase)).toFixed(2)})`,
    );
  }

  // Optional pixel reaction emote next to helmet
  if (options.emote) {
    drawCrewEmoteIcon(ctx, px + 14, py - 16, options.emote, options.tSec);
  }

  // Pulsing guide badge above today's featured specialist; calm name pill on others
  if (options.isFeatured && options.featuredBadgeText) {
    drawFeaturedCrewCallout(
      ctx,
      px,
      py,
      options.featuredBadgeText,
      options.tSec,
      options.missionPhase ?? 'morning',
    );
  } else {
    drawBadgeLabel(
      ctx,
      px,
      py - 22,
      label,
      options.isCommander ? '#FFD66B' : '#CBD5E1',
      options.isCommander ? '#FFD66B' : '#334155',
    );
  }

  if (options.statusBubble) {
    drawCrewStatusBubble(ctx, px, py + 18, options.statusBubble, accentColor);
  }
}

function getSpecialistMapPosition(
  id: OnBaseCrewId,
  state: Readonly<GameState>,
  restingIndex: number,
  featured?: FeaturedDayTarget,
): { x: number; y: number; resting: boolean; roomId: RoomId } {
  if (featured && id === featured.crewId) {
    return {
      x: featured.crewX,
      y: featured.crewY,
      resting: false,
      roomId: featured.roomId,
    };
  }

  const runtime = state.specialists[id];
  if (runtime.assignment === 'resting' || runtime.forcedRest) {
    const med = ROOM_BOUNDS.medbay;
    const row = Math.floor(restingIndex / 2);
    const col = restingIndex % 2;
    return {
      x: med.x + 56 + col * 86,
      y: med.y + 106 + row * 22,
      resting: true,
      roomId: 'medbay',
    };
  }

  switch (id) {
    case 'albaraa': {
      const r = ROOM_BOUNDS.power_station;
      return { x: r.centerX, y: r.y + 109, resting: false, roomId: 'power_station' };
    }
    case 'omar': {
      const r = ROOM_BOUNDS.medbay;
      return { x: r.centerX, y: r.y + 82, resting: false, roomId: 'medbay' };
    }
    case 'taha': {
      const r = ROOM_BOUNDS.comms_room;
      return { x: r.centerX, y: r.centerY + 8, resting: false, roomId: 'comms_room' };
    }
    case 'yassin': {
      const r = ROOM_BOUNDS.robotics_bay;
      return { x: r.centerX, y: r.y + 64, resting: false, roomId: 'robotics_bay' };
    }
    case 'sayed': {
      const inGreenhouse =
        state.day === 2 || (state.day === 7 && state.day7Stage === 'part_c_stage2');
      const targetRoom = inGreenhouse ? ROOM_BOUNDS.greenhouse : ROOM_BOUNDS.science_lab;
      return {
        x: targetRoom.centerX,
        y: targetRoom.centerY + 14,
        resting: false,
        roomId: inGreenhouse ? 'greenhouse' : 'science_lab',
      };
    }
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

function resolveCommanderMotion(
  ctx: CanvasRenderingContext2D,
  view: BaseMapViewState,
  timeMs: number,
): { moving: boolean; facing: SpriteFacing; walkPhase: number; puffs: readonly RegolithDustPuff[] } {
  let tracker = commanderTrackers.get(ctx);
  if (!tracker) {
    tracker = {
      lastX: view.commanderX,
      lastY: view.commanderY,
      lastTimeMs: timeMs,
      facing: view.commanderDir ?? 'down',
      walkPhase: view.walkPhase ?? 0,
      dustCooldown: 0,
      dustPuffs: [],
    };
    commanderTrackers.set(ctx, tracker);
  }

  const dt = Math.min(0.05, Math.max(0.001, (timeMs - tracker.lastTimeMs) / 1000));
  tracker.lastTimeMs = timeMs;

  const dx = view.commanderX - tracker.lastX;
  const dy = view.commanderY - tracker.lastY;
  tracker.lastX = view.commanderX;
  tracker.lastY = view.commanderY;

  const targetDx = view.targetX - view.commanderX;
  const targetDy = view.targetY - view.commanderY;
  const movedDist = Math.hypot(dx, dy);
  const targetDist = Math.hypot(targetDx, targetDy);

  const moving = view.commanderMoving ?? (movedDist > 0.25 || targetDist > 3);

  let facing: SpriteFacing = view.commanderDir ?? tracker.facing;
  if (view.commanderDir === undefined) {
    const dirX = movedDist > 0.2 ? dx : targetDist > 3 ? targetDx : 0;
    const dirY = movedDist > 0.2 ? dy : targetDist > 3 ? targetDy : 0;
    if (Math.abs(dirX) > Math.abs(dirY) && Math.abs(dirX) > 0.1) {
      facing = dirX < 0 ? 'left' : 'right';
    } else if (Math.abs(dirY) > 0.1) {
      facing = dirY < 0 ? 'up' : 'down';
    }
  }
  tracker.facing = facing;

  if (view.walkPhase !== undefined) {
    tracker.walkPhase = view.walkPhase;
  } else if (moving) {
    tracker.walkPhase = (tracker.walkPhase + dt * 9.5) % 4;
  } else {
    tracker.walkPhase = 0;
  }

  // Update internal regolith dust puff pool (capped at MAX_DUST_PUFFS = 64)
  if (view.dustPuffs === undefined) {
    for (let i = tracker.dustPuffs.length - 1; i >= 0; i--) {
      const puff = tracker.dustPuffs[i];
      if (!puff) continue;
      puff.age += dt;
      puff.x += puff.vx * dt;
      puff.y += puff.vy * dt;
      if (puff.age >= puff.maxAge) {
        tracker.dustPuffs.splice(i, 1);
      }
    }

    tracker.dustCooldown -= dt;
    if (moving && tracker.dustCooldown <= 0 && tracker.dustPuffs.length < MAX_DUST_PUFFS) {
      tracker.dustCooldown = 0.085;
      const backX = facing === 'left' ? 14 : facing === 'right' ? -14 : 0;
      const backY = facing === 'up' ? 12 : facing === 'down' ? -6 : 6;
      tracker.dustPuffs.push({
        x: view.commanderX + backX * 0.4 + (Math.random() - 0.5) * 6,
        y: view.commanderY + 11,
        vx: backX + (Math.random() - 0.5) * 10,
        vy: -8 + backY * 0.25,
        age: 0,
        maxAge: 0.36,
        size: 3 + Math.round(Math.random()),
      });
    }
  }

  return {
    moving,
    facing,
    walkPhase: tracker.walkPhase,
    puffs: view.dustPuffs ?? tracker.dustPuffs,
  };
}

function pickChoiceStatusBubble(
  state: Readonly<GameState>,
  featuredCrewId: CrewId,
): { readonly crewId: OnBaseCrewId; readonly text: string } | null {
  const fallback: OnBaseCrewId = featuredCrewId === 'omar' ? 'yassin' : 'omar';
  const pickNonFeatured = (preferred: OnBaseCrewId): OnBaseCrewId => {
    const chosen = featuredCrewId === preferred ? fallback : preferred;
    const rt = state.specialists[chosen];
    if (rt.assignment === 'resting' || rt.forcedRest) {
      for (const candidate of ON_BASE_CREW_IDS) {
        if (
          candidate !== featuredCrewId &&
          state.specialists[candidate].assignment !== 'resting' &&
          !state.specialists[candidate].forcedRest
        ) {
          return candidate;
        }
      }
    }
    return chosen;
  };

  if (state.day === 4 && state.flags.day4Protocol === 'max_shielding') {
    return { crewId: pickNonFeatured('omar'), text: 'Water-wall blocked the storm!' };
  }
  if (state.day === 4 && state.flags.day4Protocol === 'partial_shielding') {
    return { crewId: pickNonFeatured('omar'), text: 'Solar flare hot! Visors down!' };
  }
  const day5Ventilated =
    state.anomaly?.resolved === true || state.eveningDecisionCompletedForDay;
  if (state.day === 5 && !day5Ventilated) {
    return { crewId: pickNonFeatured('taha'), text: 'CO2 haze drifting! Open vents!' };
  }
  if (state.day === 5 && day5Ventilated) {
    return { crewId: pickNonFeatured('taha'), text: 'Fresh O2! Crew breathing easy!' };
  }
  if (state.flags.day3Allocation === 'battery_storage' && state.day >= 3 && state.day <= 4) {
    return { crewId: pickNonFeatured('omar'), text: 'Brrr! Cold rooms saved battery!' };
  }
  if (state.flags.day3Allocation === 'essential_heating' && state.day >= 3 && state.day <= 4) {
    return { crewId: pickNonFeatured('omar'), text: 'Heaters warm! Crew feeling cozy!' };
  }
  if (state.flags.day3Allocation === 'overclock_regulators' && state.day >= 3) {
    return { crewId: pickNonFeatured('albaraa'), text: 'Overclocked! Watch those sparks!' };
  }
  if (state.flags.day6Objective === 'crater_ice_extraction' && state.day >= 6) {
    return { crewId: pickNonFeatured('yassin'), text: 'Ice canisters packed on Rover!' };
  }
  if (
    state.flags.farmingMode === 'active_pumps' &&
    !state.flags.activePumpsStalled &&
    state.day >= 2
  ) {
    return { crewId: pickNonFeatured('sayed'), text: 'Pumps humming! Greens thriving!' };
  }
  if (state.flags.farmingMode === 'capillary_ponds' && state.day >= 2) {
    return { crewId: pickNonFeatured('sayed'), text: 'Wicks steady! Gardener tired...' };
  }
  if (state.flags.landingSite === 'sunlit_ridge') {
    return { crewId: pickNonFeatured('albaraa'), text: 'Sunlit ridge powers extra arrays!' };
  }
  if (state.flags.landingSite === 'crater_shadow') {
    return { crewId: pickNonFeatured('yassin'), text: 'Crater ice berm shields base!' };
  }
  return null;
}

export function drawTopDownBase(
  ctx: CanvasRenderingContext2D,
  state: Readonly<GameState>,
  viewOrElapsedMs: BaseMapViewState | number,
  elapsedMs?: number,
): void {
  const missionPhase: MissionPhase =
    typeof viewOrElapsedMs === 'number' ? 'morning' : (viewOrElapsedMs.missionPhase ?? 'morning');
  const featured = getActiveDayTarget(state.day, missionPhase, state);
  const view: BaseMapViewState =
    typeof viewOrElapsedMs === 'number'
      ? {
          commanderX: 556,
          commanderY: 458,
          targetX: 556,
          targetY: 458,
          hoveredRoom: null,
          selectedRoom: featured.roomId,
          animTick: Math.floor((viewOrElapsedMs / 1000) * 60),
          elapsedMs: viewOrElapsedMs,
          missionPhase,
        }
      : viewOrElapsedMs;

  const timeMs = elapsedMs ?? view.elapsedMs ?? view.animTick * (1000 / 60);
  const tSec = timeMs / 1000;
  const tracker = advanceWorldEffectsTracker(ctx, timeMs);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (ctx.canvas.width !== BASE_CANVAS_WIDTH || ctx.canvas.height !== BASE_CANVAS_HEIGHT) {
    ctx.scale(ctx.canvas.width / BASE_CANVAS_WIDTH, ctx.canvas.height / BASE_CANVAS_HEIGHT);
  }

  drawExteriorSurface(ctx, state, tSec, tracker, missionPhase);
  drawRoomShellsAndFloor(ctx, state, tSec);
  drawRoomEquipment(ctx, state, tSec, tracker);
  drawEmergencyOverlayAndLabels(ctx, state, view, featured, tSec, missionPhase);
  drawDirectionalGuideChevrons(ctx, view, featured, tSec, missionPhase);

  const motion = resolveCommanderMotion(ctx, view, timeMs);

  // Fading pixel regolith dust puffs behind moving boots
  for (const puff of motion.puffs) {
    const alpha = Math.max(0, 0.65 * (1 - puff.age / puff.maxAge));
    ctx.fillStyle = `rgba(203, 213, 225, ${alpha.toFixed(2)})`;
    ctx.fillRect(Math.round(puff.x), Math.round(puff.y), puff.size, puff.size);
  }

  const shivering =
    state.flags.day3Allocation === 'battery_storage' &&
    (state.day === 3 || state.day === 4 || state.primary.power < 45);
  const visorShielding = state.day === 4 && state.flags.day4Protocol === 'partial_shielding';
  const day5Ventilated =
    state.anomaly?.resolved === true || state.eveningDecisionCompletedForDay;
  const activeBubble = pickChoiceStatusBubble(state, featured.crewId);

  const resolveCrewEmote = (id: OnBaseCrewId): CrewMapEmote | null => {
    if (state.day === 4 && state.flags.day4Protocol === 'max_shielding') {
      return id === 'sayed' || id === 'taha' ? 'shield' : null;
    }
    if (shivering) return 'cold';
    if (state.day === 5 && id === 'omar') {
      return day5Ventilated ? 'cheer' : 'cough';
    }
    if (
      (state.flags.farmingMode === 'capillary_ponds' && state.day >= 2 && id === 'sayed') ||
      state.specialists[id].fatigue >= 65
    ) {
      return 'tired';
    }
    if (id === featured.crewId && missionPhase === 'morning') return 'cheer';
    return null;
  };

  // Draw calm non-featured Specialists first, then featured crew mate on top
  let restingCount = 0;
  let featuredSlot: {
    id: OnBaseCrewId;
    x: number;
    y: number;
    accentColor: string;
    shortName: string;
    phaseOffset: number;
  } | null = null;

  for (let i = 0; i < ON_BASE_CREW_IDS.length; i++) {
    const id = ON_BASE_CREW_IDS[i];
    if (!id) continue;
    const profile = CREW_PROFILES[id];
    const pos = getSpecialistMapPosition(id, state, restingCount, featured);
    if (pos.resting) {
      restingCount += 1;
    }
    const shortName = profile.name.split(' ')[0] ?? profile.name;

    if (id === featured.crewId) {
      featuredSlot = {
        id,
        x: pos.x,
        y: pos.y,
        accentColor: profile.accentColor,
        shortName,
        phaseOffset: i * 1.37,
      };
      continue;
    }

    // Offset non-featured co-located crew away from featured specialist slot during midday anomalies
    const spriteX = !pos.resting && pos.roomId === featured.roomId ? pos.x - 36 : pos.x;

    drawAstronautSprite(ctx, spriteX, pos.y, profile.accentColor, shortName, {
      isResting: pos.resting,
      isFeatured: false,
      shivering: !pos.resting && shivering,
      visorShielding: !pos.resting && visorShielding,
      emote: pos.resting ? null : resolveCrewEmote(id),
      statusBubble:
        !pos.resting && activeBubble && activeBubble.crewId === id ? activeBubble.text : null,
      fatigued: state.specialists[id].fatigue >= 65,
      readyPing: false,
      tSec,
      phaseOffset: i * 1.37,
      walking: false,
      walkPhase: 0,
      facing: 'down',
    });
  }

  if (featuredSlot) {
    drawAstronautSprite(
      ctx,
      featuredSlot.x,
      featuredSlot.y,
      featuredSlot.accentColor,
      featuredSlot.shortName,
      {
        isResting: false,
        isFeatured: true,
        featuredBadgeText: featured.badgeText,
        missionPhase,
        shivering,
        visorShielding,
        emote: resolveCrewEmote(featuredSlot.id),
        fatigued: false,
        readyPing: false,
        tSec,
        phaseOffset: featuredSlot.phaseOffset,
        walking: false,
        walkPhase: 0,
        facing: 'down',
      },
    );
  }

  // Draw Mission Commander sprite with 4-frame stride cycle
  drawAstronautSprite(ctx, view.commanderX, view.commanderY, '#FFD66B', 'COMMANDER', {
    isCommander: true,
    shivering,
    visorShielding,
    tSec,
    phaseOffset: 0.25,
    walking: motion.moving,
    walkPhase: motion.walkPhase,
    facing: motion.facing,
  });

  ctx.restore();
}

/* ============================================================================
 * CUTSCENE FRAME RENDERER (1280 x 720 WIDESCREEN — OPENING & 4 ENDINGS)
 * ========================================================================== */

const CUTSCENE_W = BASE_CANVAS_WIDTH;
const CUTSCENE_H = BASE_CANVAS_HEIGHT;

function drawCutsceneStarfield(
  ctx: CanvasRenderingContext2D,
  tSec: number,
  driftPxPerSec: number,
  streakStars = false,
): void {
  const grad = ctx.createLinearGradient(0, 0, 0, CUTSCENE_H);
  grad.addColorStop(0, '#070B16');
  grad.addColorStop(0.7, '#0F172A');
  grad.addColorStop(1, '#1A2744');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CUTSCENE_W, CUTSCENE_H);

  for (let i = 0; i < 110; i++) {
    const layer = (i % 3) + 1;
    const rawX = (i * 181 + tSec * driftPxPerSec * layer) % CUTSCENE_W;
    const sx = rawX < 0 ? rawX + CUTSCENE_W : rawX;
    const sy = (i * 97) % (CUTSCENE_H - 90);
    const twinkle = 0.38 + 0.62 * (0.5 + 0.5 * Math.sin(tSec * (2 + layer) + i));
    const sz = i % 7 === 0 ? 3 : 2;
    const color =
      i % 8 === 0
        ? `rgba(255, 214, 107, ${twinkle.toFixed(2)})`
        : i % 5 === 0
          ? `rgba(121, 200, 232, ${twinkle.toFixed(2)})`
          : `rgba(248, 250, 252, ${twinkle.toFixed(2)})`;
    if (streakStars && layer === 3) {
      drawPixelRect(ctx, sx, sy, 14, 2, color);
    } else {
      drawPixelRect(ctx, sx, sy, sz, sz, color);
    }
  }
}

function drawCutsceneEarth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  tSec: number,
): void {
  drawLayeredPixelEarth(ctx, cx, cy, r, tSec, 24, 3);
}

function drawOrionSpacecraft(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  thrust: number,
  tSec: number,
  horizontal = false,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  if (horizontal) {
    ctx.rotate(Math.PI / 2);
  }
  ctx.scale(scale, scale);

  if (thrust > 0) {
    const flicker = (Math.sin(tSec * 38) * 0.5 + 0.5) * 16 * thrust;
    ctx.fillStyle = '#F87171';
    ctx.beginPath();
    ctx.moveTo(-14, 42);
    ctx.lineTo(14, 42);
    ctx.lineTo(0, 74 + 30 * thrust + flicker);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFD66B';
    ctx.beginPath();
    ctx.moveTo(-8, 42);
    ctx.lineTo(8, 42);
    ctx.lineTo(0, 62 + 18 * thrust + flicker * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Orion Service Module solar wings
  drawPixelRect(ctx, -46, 10, 30, 14, '#263C75');
  drawPixelRect(ctx, 16, 10, 30, 14, '#263C75');
  ctx.strokeStyle = '#79C8E8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-46, 10, 30, 14);
  ctx.strokeRect(16, 10, 30, 14);

  // Service Module cylinder
  drawPixelRect(ctx, -14, -4, 28, 46, '#CBD5E1');
  drawPixelRect(ctx, -14, 6, 28, 10, '#263C75');
  drawPixelRect(ctx, -14, 28, 28, 6, '#F97316');

  // Orion Crew Capsule cone
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.moveTo(-16, -4);
  ctx.lineTo(16, -4);
  ctx.lineTo(7, -34);
  ctx.lineTo(-7, -34);
  ctx.closePath();
  ctx.fill();
  drawPixelRect(ctx, -5, -42, 10, 8, '#94A3B8');

  // Capsule window
  ctx.fillStyle = '#79C8E8';
  ctx.beginPath();
  ctx.arc(0, -18, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCutsceneOutpostHorizon(
  ctx: CanvasRenderingContext2D,
  tSec: number,
  options: {
    litLevel: number;
    emergencyAmber: boolean;
    beaconGreen: boolean;
    frosted: boolean;
    roverPresent: boolean;
    stormClearing?: boolean;
    hatchOpenProgress?: number;
    flagWave?: boolean;
  },
): void {
  // Lunar ground surface
  drawPixelRect(ctx, 0, 470, CUTSCENE_W, 250, '#1B2436');
  for (let gx = 0; gx < 40; gx++) {
    for (let gy = 15; gy < 23; gy++) {
      if ((gx + gy) % 2 === 0) {
        drawPixelRect(ctx, gx * 32, gy * 32, 32, 32, '#222E44');
      }
    }
  }
  ctx.strokeStyle = options.emergencyAmber ? '#F59E0B' : '#79C8E8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.lineTo(CUTSCENE_W, 470);
  ctx.stroke();

  // West Solar Arrays
  for (let i = 0; i < 3; i++) {
    const ax = 90 + i * 86;
    drawPixelRect(ctx, ax + 24, 418, 10, 52, '#64748B');
    const panelLit = options.litLevel > i * 0.25;
    drawPixelRect(ctx, ax, 386, 58, 34, panelLit ? '#263C75' : '#1E293B');
    ctx.strokeStyle = options.emergencyAmber ? '#F59E0B' : panelLit ? '#FFD66B' : '#64748B';
    ctx.lineWidth = 2;
    ctx.strokeRect(ax, 386, 58, 34);
  }

  // Habitat Modules
  const winColor = options.emergencyAmber
    ? Math.floor(tSec * 3) % 2 === 0
      ? '#F59E0B'
      : '#92400E'
    : options.litLevel > 0.45
      ? '#FFD66B'
      : '#334155';

  drawPixelRect(ctx, 376, 380, 152, 90, '#CBD5E1');
  drawPixelRect(ctx, 536, 360, 198, 110, '#F8FAFC');
  drawPixelRect(ctx, 742, 388, 154, 82, '#E2E8F0');

  drawPixelRect(ctx, 402, 404, 38, 24, winColor);
  drawPixelRect(ctx, 462, 404, 38, 24, winColor);
  drawPixelRect(ctx, 564, 390, 44, 28, winColor);
  drawPixelRect(ctx, 660, 390, 44, 28, winColor);

  // Greenhouse Dome + crops
  ctx.beginPath();
  ctx.arc(819, 388, 56, Math.PI, 0);
  ctx.fillStyle = options.frosted
    ? 'rgba(186, 230, 253, 0.42)'
    : options.litLevel > 0.6
      ? 'rgba(155, 216, 167, 0.34)'
      : 'rgba(121, 200, 232, 0.2)';
  ctx.fill();
  ctx.strokeStyle = options.frosted ? '#BAE6FD' : '#79C8E8';
  ctx.lineWidth = 3;
  ctx.stroke();

  if (options.litLevel > 0.5) {
    for (let cx = 778; cx <= 854; cx += 16) {
      const h = options.frosted ? 10 : 18 + Math.round(Math.sin(tSec * 2 + cx) * 2);
      drawPixelRect(ctx, cx, 386 - h, 10, h, options.frosted ? '#9BD8A7' : '#4ADE80');
    }
  }

  // Opening Relief Hatch (for Critical Survival Scene 2)
  if (options.hatchOpenProgress !== undefined) {
    const openGap = Math.round(options.hatchOpenProgress * 28);
    drawPixelRect(ctx, 616, 418, 36, 52, '#FFD66B');
    drawPixelRect(ctx, 616 - openGap, 418, 18, 52, '#475569');
    drawPixelRect(ctx, 634 + openGap, 418, 18, 52, '#475569');
  }

  // Proud Artemis Flag (for Mission Accomplished)
  if (options.flagWave) {
    drawPixelRect(ctx, 336, 386, 4, 84, '#E2E8F0');
    const wave = Math.round(Math.sin(tSec * 6) * 2);
    drawPixelRect(ctx, 340, 388, 34, 22, '#263C75');
    drawPixelRect(ctx, 356, 388 + wave, 18, 11, '#79C8E8');
    drawPixelRect(ctx, 346, 394, 8, 8, '#FFD66B');
  }

  // S-Band Tower & Beacon Pulse
  drawPixelRect(ctx, 944, 326, 12, 144, '#94A3B8');
  const bColor = options.beaconGreen
    ? '#4ADE80'
    : options.emergencyAmber
      ? '#F59E0B'
      : '#79C8E8';
  ctx.beginPath();
  ctx.arc(950, 318, 8, 0, Math.PI * 2);
  ctx.fillStyle = bColor;
  ctx.fill();

  if (options.litLevel > 0.35 || options.emergencyAmber) {
    const pulseR = 14 + ((tSec * 36) % 34);
    ctx.beginPath();
    ctx.arc(950, 318, pulseR, 0, Math.PI * 2);
    ctx.strokeStyle = options.beaconGreen
      ? 'rgba(74, 222, 128, 0.52)'
      : options.emergencyAmber
        ? 'rgba(245, 158, 11, 0.55)'
        : 'rgba(121, 200, 232, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  if (options.roverPresent) {
    drawPixelRover(ctx, 1002, 434, tSec, false);
  }
}

function drawEarthRadioPulseArc(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tSec: number,
  color = '#79C8E8',
): void {
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -tSec * 56;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 52, x2, y2);
  ctx.stroke();

  const pulseProgress = (tSec * 0.38) % 1;
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - 52;
  const inv = 1 - pulseProgress;
  const px = inv * inv * x1 + 2 * inv * pulseProgress * cx + pulseProgress * pulseProgress * x2;
  const py = inv * inv * y1 + 2 * inv * pulseProgress * cy + pulseProgress * pulseProgress * y2;
  ctx.fillStyle = '#FFD66B';
  ctx.beginPath();
  ctx.arc(px, py, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOpeningScene(
  ctx: CanvasRenderingContext2D,
  sceneIndex: number,
  sceneSec: number,
  ambientSec: number,
): void {
  switch (sceneIndex) {
    case 0: {
      // Scene 1: Artemis deep-space approach & 2.6s Earth radio pulse
      drawCutsceneStarfield(ctx, ambientSec, -44, true);
      drawCutsceneEarth(ctx, 205, 196, 94, ambientSec);

      const shipX = 470 + Math.min(280, sceneSec * 52);
      const shipY = 238 + Math.sin(ambientSec * 1.8) * 10 + Math.min(90, sceneSec * 16);

      // Animated 2.6s Earth-Moon S-Band radio pulse arc
      drawEarthRadioPulseArc(ctx, 294, 184, shipX - 40, shipY, ambientSec, '#79C8E8');
      drawBadgeLabel(ctx, 470, 118, '2.6s EARTH RADIO PULSE', '#79C8E8', '#79C8E8');

      // Curved Lunar South Pole crescent below right horizon
      ctx.fillStyle = '#182235';
      ctx.beginPath();
      ctx.ellipse(980, 690, 420, 170, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFD66B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(980, 690, 420, 170, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

      drawOrionSpacecraft(ctx, shipX, shipY, 1.45, 0.95, ambientSec, true);
      break;
    }

    case 1: {
      // Scene 2: Lunar South Pole sunlight vs icy crater dilemma + 6 specialists (incl. Abdul on Earth Link)
      drawCutsceneStarfield(ctx, ambientSec, -10);
      drawCutsceneEarth(ctx, 182, 140, 60, ambientSec);

      // Left Sunlit Solar Ridge vs Right Deep Icy Shackleton Crater Horizon
      const sunGrad = ctx.createRadialGradient(260, 410, 20, 260, 410, 260);
      sunGrad.addColorStop(0, 'rgba(255, 214, 107, 0.35)');
      sunGrad.addColorStop(1, 'rgba(255, 214, 107, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 180, 560, 320);

      // Sunlit mountain ridge (left) + deep ice crater rim (right)
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(0, CUTSCENE_H);
      ctx.lineTo(0, 445);
      ctx.lineTo(190, 395);
      ctx.lineTo(420, 455);
      ctx.lineTo(640, 480);
      ctx.lineTo(830, 565);
      ctx.lineTo(1060, 560);
      ctx.lineTo(1280, 445);
      ctx.lineTo(1280, CUTSCENE_H);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#FFD66B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 445);
      ctx.lineTo(190, 395);
      ctx.lineTo(420, 455);
      ctx.lineTo(640, 480);
      ctx.stroke();

      // Crater shadow glowing ice deposits
      ctx.fillStyle = '#091128';
      ctx.beginPath();
      ctx.ellipse(950, 545, 240, 58, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#79C8E8';
      ctx.lineWidth = 3;
      ctx.stroke();

      const iceGlow = (0.55 + 0.4 * Math.sin(ambientSec * 3.4)).toFixed(2);
      drawPixelRect(ctx, 845, 535, 18, 12, `rgba(121, 200, 232, ${iceGlow})`);
      drawPixelRect(ctx, 935, 548, 22, 12, `rgba(186, 230, 253, ${iceGlow})`);
      drawPixelRect(ctx, 1030, 532, 16, 12, `rgba(121, 200, 232, ${iceGlow})`);

      drawBadgeLabel(ctx, 210, 368, 'SUNLIGHT RIDGE', '#FFD66B', '#FFD66B');
      drawBadgeLabel(ctx, 950, 474, 'ICY CRATER SHADOW', '#79C8E8', '#79C8E8');

      // Holographic Earth Uplink Pod for Earth Flight Lead Abdul (#6)
      drawEarthRadioPulseArc(ctx, 182, 200, 146, 410, ambientSec, '#79C8E8');
      drawPixelRect(ctx, 94, 412, 104, 46, '#0F172A');
      ctx.strokeStyle = '#79C8E8';
      ctx.lineWidth = 2;
      ctx.strokeRect(94, 412, 104, 46);
      drawBadgeLabel(ctx, 146, 402, 'EARTH: ABDUL', '#79C8E8', '#79C8E8');

      // All 5 On-Base Specialists waving on Lunar Horizon (= 6 Specialists total!)
      for (let i = 0; i < ON_BASE_CREW_IDS.length; i++) {
        const id = ON_BASE_CREW_IDS[i];
        if (!id) continue;
        const prof = CREW_PROFILES[id];
        const shortName = prof.name.split(' ')[0] ?? id;
        const bounce = Math.abs(Math.sin(ambientSec * 3.2 + i * 0.7)) * 4;
        drawAstronautSprite(ctx, 410 + i * 112, 466 - bounce, prof.accentColor, shortName, {
          tSec: ambientSec,
          phaseOffset: i * 0.9,
          walking: false,
          walkPhase: 0,
          facing: 'down',
        });
      }
      break;
    }

    case 2: {
      // Scene 3: Spacesuit & Base Life Support (O2/CO2, Solar kW, Shield mSv)
      drawCutsceneStarfield(ctx, ambientSec, -6);
      drawCutsceneEarth(ctx, 180, 144, 56, ambientSec);
      drawCutsceneOutpostHorizon(ctx, ambientSec, {
        litLevel: 1,
        emergencyAmber: false,
        beaconGreen: true,
        frosted: false,
        roverPresent: true,
        flagWave: true,
      });

      // 3 crisp illuminated cutaway Life Support module cards above the outpost
      const panels: readonly { x: number; title: string; metric: string; color: string }[] = [
        { x: 280, title: 'LIFE SUPPORT', metric: 'O2 / CO2 SCRUB', color: '#9BD8A7' },
        { x: 640, title: 'SOLAR POWER', metric: 'SOLAR kW GRID', color: '#FFD66B' },
        { x: 1000, title: 'WATER SHIELD', metric: 'RADIATION mSv', color: '#79C8E8' },
      ];
      for (let p = 0; p < panels.length; p++) {
        const card = panels[p];
        if (!card) continue;
        const bob = Math.sin(ambientSec * 2.5 + p * 1.1) * 4;
        const cx = card.x - 108;
        const cy = 198 + bob;
        drawPixelRect(ctx, cx, cy, 216, 86, 'rgba(15, 23, 42, 0.94)');
        ctx.strokeStyle = card.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(cx, cy, 216, 86);

        ctx.fillStyle = card.color;
        ctx.font = 'bold 14px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(card.title, card.x, cy + 28);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 16px Nunito, sans-serif';
        ctx.fillText(card.metric, card.x, cy + 58);
      }

      drawAstronautSprite(ctx, 560, 464, '#FFD66B', 'COMMANDER', {
        isCommander: true,
        tSec: ambientSec,
        phaseOffset: 0,
        walking: false,
        walkPhase: 0,
        facing: 'down',
      });
      drawAstronautSprite(ctx, 690, 464, CREW_PROFILES.omar.accentColor, 'Omar', {
        tSec: ambientSec,
        phaseOffset: 1.2,
        walking: false,
        walkPhase: 0,
        facing: 'left',
      });
      break;
    }

    case 3:
    default: {
      // Scene 4: Final descent (< 3.0 m/s limit) transitioning into Day 1
      drawCutsceneStarfield(ctx, ambientSec, -8);
      drawCutsceneEarth(ctx, 205, 148, 64, ambientSec);

      const touchdownProgress = Math.min(1, sceneSec / 1.8);
      drawCutsceneOutpostHorizon(ctx, ambientSec, {
        litLevel: 0.4 + touchdownProgress * 0.6,
        emergencyAmber: false,
        beaconGreen: touchdownProgress > 0.75,
        frosted: false,
        roverPresent: false,
        flagWave: true,
      });

      // Touchdown Pad + safe < 3.0 m/s descent meter badge
      drawPixelRect(ctx, 1020, 464, 190, 16, '#475569');
      drawPixelRect(ctx, 1044, 464, 142, 6, '#FFD66B');
      const landerY = 186 + touchdownProgress * 232;
      const thrust = touchdownProgress < 0.96 ? 1.0 - touchdownProgress * 0.55 : 0;
      drawOrionSpacecraft(ctx, 1115, landerY, 0.98, thrust, ambientSec, false);

      const speedText = touchdownProgress < 0.95 ? 'DESCENT < 3.0 m/s' : 'TOUCHDOWN SAFE!';
      drawBadgeLabel(
        ctx,
        1115,
        136,
        speedText,
        touchdownProgress < 0.95 ? '#FFD66B' : '#9BD8A7',
        touchdownProgress < 0.95 ? '#FFD66B' : '#9BD8A7',
      );

      if (touchdownProgress > 0.45) {
        const dustProgress = Math.min(1, (touchdownProgress - 0.45) / 0.55);
        const alpha = Math.max(0, 0.72 * (1 - dustProgress * 0.5));
        for (let d = 0; d < 10; d++) {
          const dir = d % 2 === 0 ? -1 : 1;
          const dx = 1115 + dir * (28 + d * 12 + dustProgress * 95);
          const dy = 458 - Math.sin(dustProgress * Math.PI) * (12 + (d % 3) * 8);
          ctx.fillStyle = `rgba(255, 214, 107, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(dx, dy, 12 + d * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawAstronautSprite(ctx, 540, 464, CREW_PROFILES.albaraa.accentColor, 'Al-Baraa', {
        tSec: ambientSec,
        phaseOffset: 0.4,
        walking: false,
        walkPhase: 0,
        facing: 'right',
      });
      break;
    }
  }
}

function drawEndingScene(
  ctx: CanvasRenderingContext2D,
  ending: EndingId,
  sceneIndex: number,
  sceneSec: number,
  ambientSec: number,
  state: Readonly<GameState>,
): void {
  const isSunlit = state.flags.landingSite === 'sunlit_ridge';
  const isCrater = state.flags.landingSite === 'crater_shadow';
  const lushGreenhouse = !state.flags.activePumpsStalled && state.flags.farmingMode !== null;
  const maxShield = state.flags.day4Protocol === 'max_shielding' || state.primary.shielding >= 55;
  const hasIceCargo = state.flags.day6Objective === 'crater_ice_extraction';
  const frosted = state.flags.day3Allocation === 'battery_storage';

  switch (ending) {
    case 'SCIENTIFIC_BREAKTHROUGH': {
      drawCutsceneStarfield(ctx, ambientSec, 12);
      // Golden sunrise over Shackleton Ridge
      const sunGlow = ctx.createRadialGradient(1040, 468, 24, 1040, 468, 280);
      sunGlow.addColorStop(0, 'rgba(255, 214, 107, 0.9)');
      sunGlow.addColorStop(0.35, 'rgba(251, 191, 36, 0.36)');
      sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(720, 180, 560, 292);
      ctx.beginPath();
      ctx.arc(1040, 468, 54, Math.PI, 0);
      ctx.fillStyle = '#FFD66B';
      ctx.fill();

      drawCutsceneEarth(ctx, 195, 162, 68, ambientSec);
      drawCutsceneOutpostHorizon(ctx, ambientSec, {
        litLevel: 1,
        emergencyAmber: false,
        beaconGreen: true,
        frosted: false,
        roverPresent: true,
        flagWave: true,
      });

      if (isCrater || hasIceCargo) {
        drawPixelRect(ctx, 820, 460, 18, 12, '#79C8E8');
        drawPixelRect(ctx, 844, 462, 14, 10, '#E0F2FE');
      }
      if (isSunlit) {
        drawPixelRect(ctx, 322, 412, 48, 20, '#263C75');
        ctx.strokeStyle = '#FFD66B';
        ctx.lineWidth = 2;
        ctx.strokeRect(322, 412, 48, 20);
      }

      if (sceneIndex === 0) {
        // Scene 1: Golden Sunrise & Celebratory Science Fireworks
        const colors: readonly string[] = ['#FFD66B', '#79C8E8', '#9BD8A7', '#A995E8'];
        for (let fw = 0; fw < 4; fw++) {
          const fx = 380 + fw * 195;
          const fy = 155 + (fw % 2) * 52;
          const burst = ((ambientSec * 1.4 + fw * 0.45) % 1) * 46;
          const col = colors[fw] ?? '#FFD66B';
          for (let ray = 0; ray < 8; ray++) {
            const ang = (ray * Math.PI) / 4;
            drawPixelRect(ctx, fx + Math.cos(ang) * burst, fy + Math.sin(ang) * burst, 4, 4, col);
          }
        }
        if (maxShield) {
          drawBadgeLabel(ctx, 640, 326, 'STORM SHIELDED', '#79C8E8', '#79C8E8');
        }
      } else if (sceneIndex === 1) {
        // Scene 2: Science Score + Harvest & Ice-Core Rover Display
        drawPixelRover(ctx, 865, 434, ambientSec, true, hasIceCargo, false);
        drawBadgeLabel(
          ctx,
          640,
          312,
          `SCIENCE SCORE: ${state.sub.scienceScore} PTS`,
          '#FFD66B',
          '#FFD66B',
        );
        if (lushGreenhouse) {
          drawBadgeLabel(ctx, 430, 368, 'HARVEST THRIVING', '#9BD8A7', '#9BD8A7');
        }
      } else {
        // Scene 3: Earth Uplink Broadcast to Abdul & Relief Lander Salute
        drawEarthRadioPulseArc(ctx, 950, 314, 258, 174, ambientSec, '#9BD8A7');
        drawBadgeLabel(ctx, 490, 146, 'ABDUL & EARTH RECEIVING DATA!', '#9BD8A7', '#9BD8A7');
        const landerY = Math.min(372, 110 + sceneSec * 78);
        drawOrionSpacecraft(ctx, 1135, landerY, 0.9, landerY < 368 ? 1 : 0.2, ambientSec, false);
      }

      for (let i = 0; i < ON_BASE_CREW_IDS.length; i++) {
        const id = ON_BASE_CREW_IDS[i];
        if (!id) continue;
        const jump = Math.abs(Math.sin(ambientSec * 5.2 + i * 0.9)) * 10;
        drawAstronautSprite(
          ctx,
          410 + i * 92,
          456 - jump,
          CREW_PROFILES[id].accentColor,
          CREW_PROFILES[id].name.split(' ')[0] ?? id,
          {
            tSec: ambientSec,
            phaseOffset: i,
            walking: false,
            walkPhase: 0,
            facing: 'down',
            emote: 'cheer',
          },
        );
      }
      break;
    }

    case 'MISSION_ACCOMPLISHED': {
      drawCutsceneStarfield(ctx, ambientSec, 8);
      drawCutsceneEarth(ctx, 215, 168, 64, ambientSec);
      drawCutsceneOutpostHorizon(ctx, ambientSec, {
        litLevel: 1,
        emergencyAmber: false,
        beaconGreen: true,
        frosted,
        roverPresent: true,
        flagWave: true,
      });

      if (sceneIndex === 0) {
        drawAstronautSprite(ctx, 560, 456, '#FFD66B', 'COMMANDER', {
          isCommander: true,
          tSec: ambientSec,
          phaseOffset: 0,
          walking: false,
          walkPhase: 0,
          facing: 'down',
          emote: 'cheer',
        });
        if (isSunlit) {
          drawBadgeLabel(ctx, 430, 360, 'SUNLIT SOLAR RIDGE', '#FFD66B', '#FFD66B');
        } else if (isCrater) {
          drawBadgeLabel(ctx, 430, 360, 'CRATER ICE CAMP', '#79C8E8', '#79C8E8');
        }
      } else if (sceneIndex === 1) {
        drawPixelRover(ctx, 845, 436, ambientSec, true, hasIceCargo, frosted);
        for (let i = 0; i < ON_BASE_CREW_IDS.length; i++) {
          const id = ON_BASE_CREW_IDS[i];
          if (!id) continue;
          drawAstronautSprite(
            ctx,
            405 + i * 86,
            458,
            CREW_PROFILES[id].accentColor,
            CREW_PROFILES[id].name.split(' ')[0] ?? id,
            {
              tSec: ambientSec,
              phaseOffset: i * 0.8,
              walking: false,
              walkPhase: 0,
              facing: 'down',
              emote: lushGreenhouse ? 'cheer' : null,
            },
          );
        }
      } else {
        const ferryY = Math.min(368, 108 + sceneSec * 68);
        drawOrionSpacecraft(ctx, 1120, ferryY, 0.92, ferryY < 364 ? 0.85 : 0.15, ambientSec, false);
        drawEarthRadioPulseArc(ctx, 950, 318, 275, 172, ambientSec, '#FFD66B');
        drawBadgeLabel(ctx, 520, 146, 'ABDUL: NEXT CREW ARRIVING!', '#9BD8A7', '#9BD8A7');
      }
      break;
    }

    case 'CRITICAL_SURVIVAL': {
      drawCutsceneStarfield(ctx, ambientSec, 6);
      drawCutsceneEarth(ctx, 200, 158, 52, ambientSec);
      drawCutsceneOutpostHorizon(ctx, ambientSec, {
        litLevel: sceneIndex === 0 ? 0.72 : 0.98,
        emergencyAmber: sceneIndex === 0,
        beaconGreen: sceneIndex > 0,
        frosted,
        roverPresent: true,
        hatchOpenProgress: sceneIndex >= 1 ? Math.min(1, sceneSec / 1.5) : 0,
      });

      if (sceneIndex === 0) {
        // Receding X-class solar flare streaks & brave shielding crew
        for (let s = 0; s < 6; s++) {
          const sx = 240 + ((s * 175 + ambientSec * 190) % 900);
          const sy = 120 + (s % 3) * 62;
          ctx.strokeStyle = s % 2 === 0 ? 'rgba(251, 191, 36, 0.65)' : 'rgba(232, 121, 249, 0.55)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + 56, sy + 22);
          ctx.stroke();
        }
        drawBadgeLabel(
          ctx,
          640,
          318,
          maxShield ? 'WATER-WALL HELD STRONG!' : 'HULL HELD AGAINST STORM!',
          '#79C8E8',
          '#79C8E8',
        );
      } else if (sceneIndex === 1) {
        for (let i = 0; i < ON_BASE_CREW_IDS.length; i++) {
          const id = ON_BASE_CREW_IDS[i];
          if (!id) continue;
          drawAstronautSprite(
            ctx,
            430 + i * 84,
            458,
            CREW_PROFILES[id].accentColor,
            CREW_PROFILES[id].name.split(' ')[0] ?? id,
            {
              tSec: ambientSec,
              phaseOffset: i,
              walking: false,
              walkPhase: 0,
              facing: 'down',
              shivering: frosted,
              emote: frosted ? 'cold' : 'shield',
            },
          );
        }
      } else {
        const reliefY = Math.min(372, 120 + sceneSec * 72);
        drawOrionSpacecraft(ctx, 1125, reliefY, 0.88, reliefY < 368 ? 0.85 : 0.15, ambientSec, false);
        drawEarthRadioPulseArc(ctx, 950, 318, 252, 162, ambientSec, '#79C8E8');
        drawBadgeLabel(ctx, 510, 146, 'ABDUL: RELIEF FERRY ON PAD!', '#79C8E8', '#79C8E8');
      }
      break;
    }

    case 'MISSION_FAILURE': {
      drawCutsceneStarfield(ctx, ambientSec, 10);
      drawCutsceneEarth(ctx, 210, 158, 60, ambientSec);
      drawCutsceneOutpostHorizon(ctx, ambientSec, {
        litLevel: 0.65,
        emergencyAmber: true,
        beaconGreen: false,
        frosted,
        roverPresent: false,
      });

      if (sceneIndex === 0) {
        drawEarthRadioPulseArc(ctx, 268, 166, 946, 318, ambientSec, '#FFD66B');
        drawBadgeLabel(ctx, 540, 144, 'ABDUL: SAFE EVACUATION PROTOCOL!', '#FFD66B', '#FFD66B');
        drawOrionSpacecraft(ctx, 1110, 412, 0.88, 0.15, ambientSec, false);
      } else if (sceneIndex === 1) {
        for (let i = 0; i < 3; i++) {
          const id = ON_BASE_CREW_IDS[i];
          if (!id) continue;
          drawAstronautSprite(
            ctx,
            840 + i * 52,
            458,
            CREW_PROFILES[id].accentColor,
            CREW_PROFILES[id].name.split(' ')[0] ?? id,
            {
              tSec: ambientSec,
              phaseOffset: i,
              walking: true,
              walkPhase: (ambientSec * 6) % 4,
              facing: 'right',
            },
          );
        }
        drawOrionSpacecraft(ctx, 1110, 408, 0.9, 0.55, ambientSec, false);
      } else {
        drawOrionSpacecraft(ctx, 760, 184, 0.92, 0.25, ambientSec, true);
        const climb = Math.min(200, sceneSec * 52);
        drawOrionSpacecraft(ctx, 1110, 392 - climb, 0.85, climb < 198 ? 1.0 : 0.2, ambientSec, false);
        drawBadgeLabel(ctx, 935, 144, 'ALL 6 CREW MEMBERS SAFE!', '#9BD8A7', '#9BD8A7');
      }
      break;
    }

    default: {
      const _exhaustive: never = ending;
      return _exhaustive;
    }
  }
}

export function drawCutsceneFrame(
  ctx: CanvasRenderingContext2D,
  type: 'opening' | EndingId,
  sceneIndex: number,
  tick: number,
  state: Readonly<GameState>,
  elapsedMs?: number,
): void {
  const sceneSec = tick / 60;
  const ambientSec = elapsedMs !== undefined ? elapsedMs / 1000 : sceneSec;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (ctx.canvas.width !== CUTSCENE_W || ctx.canvas.height !== CUTSCENE_H) {
    ctx.scale(ctx.canvas.width / CUTSCENE_W, ctx.canvas.height / CUTSCENE_H);
  }

  if (type === 'opening') {
    drawOpeningScene(ctx, sceneIndex, sceneSec, ambientSec);
  } else {
    drawEndingScene(ctx, type, sceneIndex, sceneSec, ambientSec, state);
  }

  ctx.restore();
}
