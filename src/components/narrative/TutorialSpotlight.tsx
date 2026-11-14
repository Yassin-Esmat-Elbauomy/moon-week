import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Clock,
  Compass,
  Menu,
  Rocket,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import type { CrewExpression, CrewId, GameAction, GameState } from '../../types/game';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import { CREW_PROFILES } from '../../data/crewProfiles';
import { playCue } from '../../services/soundEngine';

export interface TutorialSpotlightProps {
  state: Readonly<GameState>;
  dispatch: (action: GameAction) => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface BubblePosition {
  top: number;
  left: number;
}

interface TutorialStepSpec {
  id: string;
  title: string;
  targetSelector: string;
  placement: 'stage-corner' | 'below-target';
  guideCrewId: CrewId;
  guideExpression: CrewExpression;
  message: string;
  icon: React.ReactNode;
}

const STEP_1: TutorialStepSpec = {
  id: 'base-map',
  title: 'Explore the Lunar Base',
  targetSelector: '[data-tutorial="base-map"]',
  placement: 'stage-corner',
  guideCrewId: 'yassin',
  guideExpression: 'happy',
  message:
    'Walk your Mission Commander across all 8 rooms with WASD, Arrow keys, or a click. Stand in any room to open its action card!',
  icon: <Compass className="w-4 h-4" aria-hidden="true" />,
};

const TUTORIAL_STEPS: readonly TutorialStepSpec[] = [
  STEP_1,
  {
    id: 'day-clock',
    title: 'Mission Days & Shifts',
    targetSelector: '[data-tutorial="day-clock"]',
    placement: 'below-target',
    guideCrewId: 'taha',
    guideExpression: 'focused',
    message:
      'Each Mission Day runs from 06:00 to 22:00 through Morning, Midday, and Evening shifts. Use the speed button beside the clock to pause or fast-forward.',
    icon: <Clock className="w-4 h-4" aria-hidden="true" />,
  },
  {
    id: 'primary-meters',
    title: '4 Primary Resource Meters',
    targetSelector: '[data-tutorial="primary-meters"]',
    placement: 'below-target',
    guideCrewId: 'omar',
    guideExpression: 'normal',
    message:
      'Keep Power, Life Support, Shield, and Crew Morale above 0% to avoid an Automated Safe Abort. Click these meters to inspect all 7 Sub-Resource Metrics and crew shifts!',
    icon: <BarChart3 className="w-4 h-4" aria-hidden="true" />,
  },
  {
    id: 'primary-cta',
    title: 'Your Next Mission Action',
    targetSelector: '[data-tutorial="primary-cta"]',
    placement: 'below-target',
    guideCrewId: 'albaraa',
    guideExpression: 'focused',
    message:
      'This glowing button points to your next main step, like launching a station task, fixing a Midday Anomaly, or locking an Evening decision.',
    icon: <Sparkles className="w-4 h-4" aria-hidden="true" />,
  },
  {
    id: 'music-toggle',
    title: 'Space Music & Sound',
    targetSelector: '[data-tutorial="music-toggle"]',
    placement: 'below-target',
    guideCrewId: 'sayed',
    guideExpression: 'happy',
    message:
      'Tap here anytime to mute or unmute our chiptune space music and sound effects. Listen closely—the music shifts whenever a solar storm hits!',
    icon: <Volume2 className="w-4 h-4" aria-hidden="true" />,
  },
  {
    id: 'menu-button',
    title: 'Crew, Logs & Earth Uplink',
    targetSelector: '[data-tutorial="menu-button"]',
    placement: 'below-target',
    guideCrewId: 'abdelrahman',
    guideExpression: 'happy',
    message:
      'Open Menu for Crew Roster, Mission Log, Judge Jump, and Earth Mission Control Uplink—watch the real 1.3-second Moon-to-Earth signal delay!',
    icon: <Menu className="w-4 h-4" aria-hidden="true" />,
  },
];

const DEFAULT_CARD_WIDTH = 360;
const DEFAULT_CARD_HEIGHT = 210;
const EDGE_MARGIN = 12;

function clampBubblePosition(
  rect: TargetRect | null,
  placement: TutorialStepSpec['placement'],
  cardW: number,
  cardH: number,
  vw: number,
  vh: number,
): BubblePosition {
  const maxLeft = Math.max(EDGE_MARGIN, vw - cardW - EDGE_MARGIN);
  const maxTop = Math.max(EDGE_MARGIN, vh - cardH - EDGE_MARGIN);

  if (!rect) {
    return {
      top: Math.max(EDGE_MARGIN, Math.min(maxTop, Math.round((vh - cardH) / 2))),
      left: Math.max(EDGE_MARGIN, Math.min(maxLeft, Math.round((vw - cardW) / 2))),
    };
  }

  if (placement === 'stage-corner') {
    const rawTop = rect.top + 20;
    const rawLeft = rect.left + 20;
    return {
      top: Math.max(EDGE_MARGIN, Math.min(maxTop, Math.round(rawTop))),
      left: Math.max(EDGE_MARGIN, Math.min(maxLeft, Math.round(rawLeft))),
    };
  }

  const belowTop = rect.top + rect.height + 12;
  const aboveTop = rect.top - cardH - 12;
  const rawTop = belowTop + cardH <= vh - EDGE_MARGIN ? belowTop : Math.max(EDGE_MARGIN, aboveTop);
  const centeredLeft = rect.left + rect.width / 2 - cardW / 2;

  return {
    top: Math.max(EDGE_MARGIN, Math.min(maxTop, Math.round(rawTop))),
    left: Math.max(EDGE_MARGIN, Math.min(maxLeft, Math.round(centeredLeft))),
  };
}

export const TutorialSpotlight: React.FC<TutorialSpotlightProps> = ({ state, dispatch }) => {
  const stepIndex = Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, state.tutorialStep));
  const currentStep = TUTORIAL_STEPS[stepIndex] ?? STEP_1;
  const isFinalStep = stepIndex === TUTORIAL_STEPS.length - 1;
  const guideProfile = CREW_PROFILES[currentStep.guideCrewId];

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [highlightRect, setHighlightRect] = useState<TargetRect | null>(null);
  const [bubblePos, setBubblePos] = useState<BubblePosition>({ top: 76, left: 20 });

  const recomputePositions = useCallback(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
    const cardW = cardRef.current ? cardRef.current.offsetWidth : DEFAULT_CARD_WIDTH;
    const cardH = cardRef.current ? cardRef.current.offsetHeight : DEFAULT_CARD_HEIGHT;

    const target = document.querySelector(currentStep.targetSelector);
    if (!target) {
      setHighlightRect(null);
      setBubblePos(clampBubblePosition(null, currentStep.placement, cardW, cardH, vw, vh));
      return;
    }

    const rect = target.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      setHighlightRect(null);
      setBubblePos(clampBubblePosition(null, currentStep.placement, cardW, cardH, vw, vh));
      return;
    }

    const padded: TargetRect = {
      top: Math.max(2, Math.round(rect.top - 4)),
      left: Math.max(2, Math.round(rect.left - 4)),
      width: Math.min(vw - 4, Math.round(rect.width + 8)),
      height: Math.min(vh - 4, Math.round(rect.height + 8)),
    };
    setHighlightRect(padded);
    setBubblePos(clampBubblePosition(padded, currentStep.placement, cardW, cardH, vw, vh));
  }, [currentStep.placement, currentStep.targetSelector]);

  useLayoutEffect(() => {
    recomputePositions();
    const rafId = window.requestAnimationFrame(recomputePositions);
    window.addEventListener('resize', recomputePositions);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', recomputePositions);
    };
  }, [recomputePositions, stepIndex]);

  const handleSelectStep = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, nextIndex));
      playCue('click');
      dispatch({ kind: 'SET_TUTORIAL_STEP', step: clamped });
    },
    [dispatch],
  );

  const handleComplete = useCallback(
    (playSuccess: boolean) => {
      playCue(playSuccess ? 'success' : 'click');
      dispatch({ kind: 'COMPLETE_TUTORIAL' });
    },
    [dispatch],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleComplete(false);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (isFinalStep) {
          handleComplete(true);
        } else {
          handleSelectStep(stepIndex + 1);
        }
      } else if (event.key === 'ArrowLeft' && stepIndex > 0) {
        event.preventDefault();
        handleSelectStep(stepIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleComplete, handleSelectStep, isFinalStep, stepIndex]);

  const firstName = guideProfile.name.split(' ')[0] ?? guideProfile.name;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mission Control Interactive Tutorial"
    >
      {/* Dimmed backdrop when target isn't found; spotlight ring carries cutout shadow otherwise */}
      {!highlightRect && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-[#0F172A]/75 pointer-events-none"
        />
      )}

      {highlightRect && (
        <div
          aria-hidden="true"
          className="fixed pointer-events-none rounded-2xl border-2 border-[#FFD66B] spotlight-pulse z-[45]"
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.68)',
          }}
        />
      )}

      {/* Compact High-Contrast Floating Coach Bubble */}
      <div
        ref={cardRef}
        style={{ top: bubblePos.top, left: bubblePos.left }}
        className="fixed z-50 w-[360px] max-w-[calc(100vw-24px)] bg-[#0F172A] border-2 border-[#FFD66B] text-[#F8FAFC] rounded-2xl p-4 shadow-2xl space-y-3"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-[#FFD66B] text-[#0F172A] flex items-center justify-center shrink-0">
              {currentStep.icon}
            </span>
            <h2 className="font-display font-bold text-sm text-[#F8FAFC] truncate">
              {currentStep.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded-md bg-[#1E293B] border border-white/15 font-mono text-[11px] font-bold text-[#79C8E8]">
              {stepIndex + 1}/{TUTORIAL_STEPS.length}
            </span>
            <button
              type="button"
              onClick={() => handleComplete(false)}
              aria-label="Skip Tutorial"
              className="p-1 rounded-lg bg-[#1E293B] hover:bg-slate-700 border border-white/15 text-slate-300 hover:text-[#F8FAFC] cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Guide Avatar + 1-2 Short Sentences */}
        <div className="flex items-start gap-3 rounded-xl bg-[#1E293B]/90 border border-white/10 p-2.5">
          <div className="shrink-0">
            <CrewAvatar
              crewId={currentStep.guideCrewId}
              expression={currentStep.guideExpression}
              size="sm"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="text-xs font-extrabold text-[#FFD66B]">{firstName}</div>
            <p className="text-xs sm:text-sm text-[#F8FAFC] leading-snug">
              {currentStep.message}
            </p>
          </div>
        </div>

        {/* Step Dots + Controls */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1" aria-label="Tutorial steps">
            {TUTORIAL_STEPS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectStep(idx)}
                aria-label={`Step ${idx + 1}: ${item.title}`}
                className={`h-2 rounded-full cursor-pointer transition-colors ${
                  idx === stepIndex
                    ? 'w-5 bg-[#FFD66B]'
                    : idx < stepIndex
                      ? 'w-2 bg-[#9BD8A7]'
                      : 'w-2 bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => handleSelectStep(stepIndex - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 border border-white/15 text-xs font-bold text-[#F8FAFC] cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Back</span>
              </button>
            )}

            {isFinalStep ? (
              <button
                type="button"
                onClick={() => handleComplete(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#9BD8A7] hover:bg-[#b5e4be] text-[#0F172A] font-display font-bold text-xs cursor-pointer transition-colors"
              >
                <Rocket className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Start Mission</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSelectStep(stepIndex + 1)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#FFD66B] hover:bg-[#ffe28f] text-[#0F172A] font-display font-bold text-xs cursor-pointer transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
