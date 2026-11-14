import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BASE_CANVAS_HEIGHT,
  BASE_CANVAS_WIDTH,
  drawTopDownBase,
  getFeaturedDayTarget,
  getFeaturedGuideWaypoints,
  ROOM_BOUNDS,
  ROOM_ORDER,
  type GuidePoint,
} from '../../assets/proceduralPixelArt';
import { playCue, unlock } from '../../services/soundEngine';
import type { CrewId, GameAction, GameState, MiniGameId, RoomId } from '../../types/game';

export interface TopDownLunarBaseProps {
  state: Readonly<GameState>;
  dispatch: (action: GameAction) => void;
  onTalkToCrew: (crewId: CrewId) => void;
  onOpenMiniGame: (miniGame: MiniGameId) => void;
  onOpenDecisionModal: () => void;
  isOverlayOpen?: boolean;
}

const COMMANDER_SPAWN: GuidePoint = { x: 556, y: 458 };
const WALK_SPEED_MANUAL = 265;
const WALK_SPEED_GUIDED = 350;

function isPointInsideRoom(x: number, y: number, roomId: RoomId, margin = 8): boolean {
  const r = ROOM_BOUNDS[roomId];
  return (
    x >= r.x + margin &&
    x <= r.x + r.width - margin &&
    y >= r.y + margin &&
    y <= r.y + r.height - margin
  );
}

function isWalkableBaseFloor(x: number, y: number): boolean {
  for (const roomId of ROOM_ORDER) {
    const r = ROOM_BOUNDS[roomId];
    const topMargin = roomId === 'main_habitat' ? 10 : 18;
    if (
      x >= r.x + 12 &&
      x <= r.x + r.width - 12 &&
      y >= r.y + topMargin &&
      y <= r.y + r.height - 10
    ) {
      return true;
    }
  }

  // Allow crossing pressurized doorways between main_habitat and every room
  const northDoors: readonly number[] = [
    ROOM_BOUNDS.comms_room.centerX,
    ROOM_BOUNDS.control_room.centerX,
    ROOM_BOUNDS.science_lab.centerX,
  ];
  for (const doorX of northDoors) {
    if (Math.abs(x - doorX) <= 22 && y >= 324 && y <= 362) {
      return true;
    }
  }

  const southDoors: readonly number[] = [
    ROOM_BOUNDS.power_station.centerX,
    ROOM_BOUNDS.medbay.centerX,
    ROOM_BOUNDS.greenhouse.centerX,
    ROOM_BOUNDS.robotics_bay.centerX,
  ];
  for (const doorX of southDoors) {
    if (Math.abs(x - doorX) <= 22 && y >= 468 && y <= 506) {
      return true;
    }
  }

  return false;
}

function findRoomAtCanvasPoint(x: number, y: number): RoomId | null {
  for (const roomId of ROOM_ORDER) {
    const r = ROOM_BOUNDS[roomId];
    if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
      return roomId;
    }
  }
  return null;
}

export const TopDownLunarBase: React.FC<TopDownLunarBaseProps> = ({
  state,
  onTalkToCrew,
  isOverlayOpen = false,
}) => {
  const featured = getFeaturedDayTarget(state.day);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<RoomId | null>(null);

  const posRef = useRef<{ x: number; y: number }>({
    x: COMMANDER_SPAWN.x,
    y: COMMANDER_SPAWN.y,
  });
  const targetRef = useRef<{ x: number; y: number }>({
    x: COMMANDER_SPAWN.x,
    y: COMMANDER_SPAWN.y,
  });
  const waypointsRef = useRef<GuidePoint[]>([]);
  const autoMeetQueuedRef = useRef(false);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const wasInsideTargetRef = useRef(false);

  const stateRef = useRef(state);
  const featuredRef = useRef(featured);
  const isOverlayOpenRef = useRef(isOverlayOpen);
  const hoveredRoomRef = useRef(hoveredRoom);
  const onTalkToCrewRef = useRef(onTalkToCrew);
  const prevDayRef = useRef(state.day);

  stateRef.current = state;
  featuredRef.current = featured;
  isOverlayOpenRef.current = isOverlayOpen;
  hoveredRoomRef.current = hoveredRoom;
  onTalkToCrewRef.current = onTalkToCrew;

  // Reset Commander smoothly to central corridor hub whenever advancing to a new Day
  useEffect(() => {
    if (prevDayRef.current !== state.day) {
      prevDayRef.current = state.day;
      posRef.current = { x: COMMANDER_SPAWN.x, y: COMMANDER_SPAWN.y };
      targetRef.current = { x: COMMANDER_SPAWN.x, y: COMMANDER_SPAWN.y };
      waypointsRef.current = [];
      autoMeetQueuedRef.current = false;
      pressedKeysRef.current.clear();
      wasInsideTargetRef.current = false;
      setHoveredRoom(null);
    }
  }, [state.day]);

  // Prevent stale keys or immediate re-trigger when an overlay modal opens or closes
  useEffect(() => {
    pressedKeysRef.current.clear();
    if (isOverlayOpen) {
      waypointsRef.current = [];
      autoMeetQueuedRef.current = false;
      targetRef.current = { x: posRef.current.x, y: posRef.current.y };
    } else {
      wasInsideTargetRef.current = isPointInsideRoom(
        posRef.current.x,
        posRef.current.y,
        featuredRef.current.roomId,
        14,
      );
    }
  }, [isOverlayOpen]);

  const startGuidedMeet = useCallback(() => {
    unlock();
    const target = featuredRef.current;
    const dist = Math.hypot(
      target.meetX - posRef.current.x,
      target.meetY - posRef.current.y,
    );

    if (dist <= 26) {
      waypointsRef.current = [];
      autoMeetQueuedRef.current = false;
      targetRef.current = { x: target.meetX, y: target.meetY };
      posRef.current = { x: target.meetX, y: target.meetY };
      wasInsideTargetRef.current = true;
      playCue('confirm');
      onTalkToCrewRef.current(target.crewId);
      return;
    }

    const path = getFeaturedGuideWaypoints(posRef.current.x, posRef.current.y, target);
    const remaining = path.slice(1);
    waypointsRef.current = remaining;
    const nextPt = remaining[0];
    if (nextPt) {
      targetRef.current = { x: nextPt.x, y: nextPt.y };
    }
    autoMeetQueuedRef.current = true;
    playCue('click');
  }, []);

  // Keyboard navigation (WASD / Arrow keys to walk + Space/E/Enter to walk & meet)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isOverlayOpenRef.current) return;

      const key = event.key.toLowerCase();
      if (
        key === 'w' ||
        key === 'a' ||
        key === 's' ||
        key === 'd' ||
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright'
      ) {
        event.preventDefault();
        unlock();
        waypointsRef.current = [];
        autoMeetQueuedRef.current = false;
        pressedKeysRef.current.add(key);
        return;
      }

      if (key === ' ' || key === 'e' || key === 'enter') {
        event.preventDefault();
        startGuidedMeet();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      pressedKeysRef.current.delete(event.key.toLowerCase());
    };

    const onBlur = () => {
      pressedKeysRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [startGuidedMeet]);

  // 60fps Canvas animation + walk simulation loop (zero React per-frame setState)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let elapsedMs = 0;
    let footstepAccum = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      elapsedMs += dt * 1000;

      const overlayActive = isOverlayOpenRef.current;
      const target = featuredRef.current;

      if (!overlayActive) {
        const keys = pressedKeysRef.current;
        let dx = 0;
        let dy = 0;
        if (keys.has('w') || keys.has('arrowup')) dy -= 1;
        if (keys.has('s') || keys.has('arrowdown')) dy += 1;
        if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
        if (keys.has('d') || keys.has('arrowright')) dx += 1;

        if (dx !== 0 || dy !== 0) {
          const len = Math.hypot(dx, dy);
          const stepX = (dx / len) * WALK_SPEED_MANUAL * dt;
          const stepY = (dy / len) * WALK_SPEED_MANUAL * dt;

          const cur = posRef.current;
          let nextX = cur.x;
          let nextY = cur.y;

          if (isWalkableBaseFloor(cur.x + stepX, cur.y)) {
            nextX = cur.x + stepX;
          }
          if (isWalkableBaseFloor(nextX, cur.y + stepY)) {
            nextY = cur.y + stepY;
          }

          const movedDist = Math.hypot(nextX - cur.x, nextY - cur.y);
          posRef.current = { x: nextX, y: nextY };
          targetRef.current = { x: nextX, y: nextY };

          if (movedDist > 0.2) {
            footstepAccum += movedDist;
            if (footstepAccum >= 48) {
              footstepAccum = 0;
              playCue('footstep');
            }
          }
        } else if (waypointsRef.current.length > 0 || autoMeetQueuedRef.current) {
          const nextWaypoint = waypointsRef.current[0];
          const goal = nextWaypoint ?? targetRef.current;
          const cur = posRef.current;
          const toX = goal.x - cur.x;
          const toY = goal.y - cur.y;
          const dist = Math.hypot(toX, toY);
          const maxStep = WALK_SPEED_GUIDED * dt;

          if (dist <= maxStep) {
            posRef.current = { x: goal.x, y: goal.y };
            if (nextWaypoint) {
              waypointsRef.current = waypointsRef.current.slice(1);
              const upcoming = waypointsRef.current[0];
              if (upcoming) {
                targetRef.current = { x: upcoming.x, y: upcoming.y };
              }
            }

            if (waypointsRef.current.length === 0 && autoMeetQueuedRef.current) {
              autoMeetQueuedRef.current = false;
              wasInsideTargetRef.current = true;
              playCue('confirm');
              onTalkToCrewRef.current(target.crewId);
            }
          } else {
            const stepX = (toX / dist) * maxStep;
            const stepY = (toY / dist) * maxStep;
            posRef.current = { x: cur.x + stepX, y: cur.y + stepY };
            targetRef.current = { x: goal.x, y: goal.y };

            footstepAccum += maxStep;
            if (footstepAccum >= 48) {
              footstepAccum = 0;
              playCue('footstep');
            }
          }
        }

        // Manual walk-in trigger: walking cleanly into today's highlighted room meets crew mate
        const insideTarget = isPointInsideRoom(
          posRef.current.x,
          posRef.current.y,
          target.roomId,
          14,
        );
        if (
          insideTarget &&
          !wasInsideTargetRef.current &&
          !autoMeetQueuedRef.current
        ) {
          wasInsideTargetRef.current = true;
          pressedKeysRef.current.clear();
          waypointsRef.current = [];
          targetRef.current = { x: posRef.current.x, y: posRef.current.y };
          playCue('confirm');
          onTalkToCrewRef.current(target.crewId);
        } else if (!insideTarget) {
          wasInsideTargetRef.current = false;
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawTopDownBase(ctx, stateRef.current, {
            commanderX: posRef.current.x,
            commanderY: posRef.current.y,
            targetX: targetRef.current.x,
            targetY: targetRef.current.y,
            hoveredRoom: hoveredRoomRef.current,
            selectedRoom: target.roomId,
            animTick: Math.floor((elapsedMs / 1000) * 60),
            elapsedMs,
          });
        }
      }

      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number): GuidePoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      const scaleX = BASE_CANVAS_WIDTH / rect.width;
      const scaleY = BASE_CANVAS_HEIGHT / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (isOverlayOpenRef.current) {
        if (hoveredRoomRef.current !== null) setHoveredRoom(null);
        return;
      }
      const pt = toCanvasCoords(event.clientX, event.clientY);
      if (!pt) return;
      const room = findRoomAtCanvasPoint(pt.x, pt.y);
      const nextHovered = room === featuredRef.current.roomId ? room : null;
      if (nextHovered !== hoveredRoomRef.current) {
        setHoveredRoom(nextHovered);
      }
    },
    [toCanvasCoords],
  );

  const handleCanvasMouseLeave = useCallback(() => {
    if (hoveredRoomRef.current !== null) {
      setHoveredRoom(null);
    }
  }, []);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (isOverlayOpenRef.current) return;
      unlock();
      const pt = toCanvasCoords(event.clientX, event.clientY);
      if (!pt) return;

      const clickedRoom = findRoomAtCanvasPoint(pt.x, pt.y);
      const target = featuredRef.current;

      // Only today's highlighted room opens the crew interaction; non-featured rooms stay calm
      if (clickedRoom === target.roomId) {
        startGuidedMeet();
        return;
      }

      // Clicking inside main_habitat gently walks there without opening distractions
      if (clickedRoom === 'main_habitat' && isWalkableBaseFloor(pt.x, pt.y)) {
        waypointsRef.current = [{ x: pt.x, y: pt.y }];
        targetRef.current = { x: pt.x, y: pt.y };
        autoMeetQueuedRef.current = false;
        playCue('click');
      }
    },
    [startGuidedMeet, toCanvasCoords],
  );

  return (
    <div
      data-tutorial="base-map"
      className="relative h-full w-full flex items-center justify-center overflow-hidden bg-[#090D16] select-none"
    >
      <div className="relative h-full w-full max-w-[177.78vh] max-h-[56.25vw] aspect-video flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={BASE_CANVAS_WIDTH}
          height={BASE_CANVAS_HEIGHT}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          onClick={handleCanvasClick}
          className={`h-full w-full pixelated block ${
            hoveredRoom === featured.roomId ? 'cursor-pointer' : 'cursor-default'
          }`}
        />

        {/* Single Big Friendly Bottom-Center Action Button */}
        {!isOverlayOpen && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
            <button
              type="button"
              onClick={startGuidedMeet}
              className="pointer-events-auto rounded-2xl border-2 border-[#FFFBEB]/85 bg-[#FFD66B] px-6 py-3.5 sm:px-8 sm:py-4 font-display text-base sm:text-xl font-extrabold tracking-wide text-[#0F172A] shadow-[0_0_30px_rgba(255,214,107,0.7)] transition hover:scale-[1.03] hover:brightness-105 active:scale-95"
            >
              ▶ STEP 1: MEET {featured.crewShortName.toUpperCase()} ({featured.roomLabel})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
