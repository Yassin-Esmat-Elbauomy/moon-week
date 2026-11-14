import React, { useEffect, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Droplets,
  FlaskConical,
  HeartPulse,
  Pill,
  Utensils,
  X,
} from 'lucide-react';
import type {
  GameAction,
  GameState,
  OnBaseCrewId,
  SpecialistAssignment,
  SubResources,
} from '../../types/game';
import { CREW_PROFILES, ON_BASE_CREW_IDS } from '../../data/crewProfiles';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import { playCue } from '../../services/soundEngine';

export interface ResourceDrawerProps {
  state: Readonly<GameState>;
  isOpen: boolean;
  onClose: () => void;
  dispatch: (action: GameAction) => void;
}

interface SubMetricSpec {
  key: keyof SubResources;
  label: string;
  lowerIsBetter?: boolean;
  uncapped?: boolean;
  warnCheck: (val: number) => boolean;
  warnLabel: string;
  barClass: string;
  renderIcon: (className: string) => React.ReactNode;
}

const SUB_METRIC_SPECS: readonly SubMetricSpec[] = [
  {
    key: 'crewHealth',
    label: 'Crew Health',
    warnCheck: (v) => v < 50,
    warnLabel: 'LOW',
    barClass: 'bg-[#9BD8A7]',
    renderIcon: (c) => <HeartPulse className={c} aria-hidden="true" />,
  },
  {
    key: 'crewFatigue',
    label: 'Crew Fatigue',
    lowerIsBetter: true,
    warnCheck: (v) => v > 65,
    warnLabel: 'HIGH',
    barClass: 'bg-[#FFD66B]',
    renderIcon: (c) => <Activity className={c} aria-hidden="true" />,
  },
  {
    key: 'medicalSupplies',
    label: 'Medical Kits',
    warnCheck: (v) => v < 25,
    warnLabel: 'LOW',
    barClass: 'bg-[#A995E8]',
    renderIcon: (c) => <Pill className={c} aria-hidden="true" />,
  },
  {
    key: 'foodAndSupplies',
    label: 'Food Stock',
    warnCheck: (v) => v < 30,
    warnLabel: 'LOW',
    barClass: 'bg-[#FFD66B]',
    renderIcon: (c) => <Utensils className={c} aria-hidden="true" />,
  },
  {
    key: 'waterAvailability',
    label: 'Water',
    warnCheck: (v) => v < 30,
    warnLabel: 'LOW',
    barClass: 'bg-[#79C8E8]',
    renderIcon: (c) => <Droplets className={c} aria-hidden="true" />,
  },
  {
    key: 'roverBattery',
    label: 'Rover Battery',
    warnCheck: (v) => v < 35,
    warnLabel: 'LOW',
    barClass: 'bg-[#9BD8A7]',
    renderIcon: (c) => <BatteryCharging className={c} aria-hidden="true" />,
  },
  {
    key: 'scienceScore',
    label: 'Science Score',
    uncapped: true,
    warnCheck: () => false,
    warnLabel: '',
    barClass: 'bg-[#A995E8]',
    renderIcon: (c) => <FlaskConical className={c} aria-hidden="true" />,
  },
];

function buildCompactStatusChips(state: Readonly<GameState>): Array<{
  id: string;
  label: string;
  toneClass: string;
}> {
  const chips: Array<{ id: string; label: string; toneClass: string }> = [];

  if (state.flags.landingSite === 'sunlit_ridge') {
    chips.push({
      id: 'site',
      label: 'Sunlit Ridge (+Power)',
      toneClass: 'bg-[#FFD66B]/15 border-[#FFD66B]/50 text-[#FFD66B]',
    });
  } else if (state.flags.landingSite === 'crater_shadow') {
    chips.push({
      id: 'site',
      label: 'Crater Shadow (+Shield)',
      toneClass: 'bg-[#79C8E8]/15 border-[#79C8E8]/50 text-[#79C8E8]',
    });
  }

  if (state.flags.activePumpsStalled) {
    chips.push({
      id: 'pumps',
      label: 'Pumps Stalled',
      toneClass: 'bg-[#F87171]/20 border-[#F87171]/60 text-[#F87171]',
    });
  } else if (state.flags.farmingMode === 'active_pumps') {
    chips.push({
      id: 'pumps',
      label: 'Active Pumps',
      toneClass: 'bg-[#9BD8A7]/15 border-[#9BD8A7]/50 text-[#9BD8A7]',
    });
  } else if (state.flags.farmingMode === 'capillary_ponds') {
    chips.push({
      id: 'pumps',
      label: 'Capillary PONDS',
      toneClass: 'bg-[#79C8E8]/15 border-[#79C8E8]/50 text-[#79C8E8]',
    });
  }

  if (state.flags.day3Allocation === 'battery_storage') {
    chips.push({
      id: 'battery',
      label: 'Battery Buffered',
      toneClass: 'bg-[#9BD8A7]/15 border-[#9BD8A7]/50 text-[#9BD8A7]',
    });
  }

  if (state.flags.hardwareFaultRisk) {
    chips.push({
      id: 'fault',
      label: 'Hardware Fault Risk',
      toneClass: 'bg-[#F87171]/20 border-[#F87171]/60 text-[#F87171]',
    });
  }

  if (state.flags.crisisResilience) {
    chips.push({
      id: 'resilience',
      label: 'Crisis Resilience',
      toneClass: 'bg-[#9BD8A7]/15 border-[#9BD8A7]/50 text-[#9BD8A7]',
    });
  }

  if (state.flags.relayReinforced) {
    chips.push({
      id: 'relay',
      label: 'Relay Reinforced',
      toneClass: 'bg-[#79C8E8]/15 border-[#79C8E8]/50 text-[#79C8E8]',
    });
  }

  if (state.commsBlackout) {
    chips.push({
      id: 'blackout',
      label: 'Comms Blackout',
      toneClass: 'bg-[#F87171]/25 border-[#F87171]/70 text-[#F87171]',
    });
  }

  return chips;
}

export const ResourceDrawer: React.FC<ResourceDrawerProps> = ({
  state,
  isOpen,
  onClose,
  dispatch,
}) => {
  const drawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        playCue('click');
        onClose();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (drawerRef.current && drawerRef.current.contains(target)) return;
      if (
        target.closest('[data-tutorial="primary-meters"]') ||
        target.closest('[data-tutorial="menu-button"]')
      ) {
        return;
      }
      playCue('click');
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const canEditRoster = state.shift === 'morning' && !state.rosterConfirmedForDay;
  const statusChips = buildCompactStatusChips(state);

  const handleToggleSpecialist = (crewId: OnBaseCrewId, assignment: SpecialistAssignment) => {
    playCue('click');
    dispatch({ kind: 'SET_SPECIALIST_ASSIGNMENT', crewId, assignment });
  };

  return (
    <aside
      ref={drawerRef}
      role="dialog"
      aria-label="Sub-Resources and Specialist Shifts"
      className="fixed top-16 right-4 z-30 w-[calc(100vw-2rem)] max-w-xl max-h-[calc(100vh-5rem)] overflow-y-auto bg-[#0F172A]/95 backdrop-blur-md border border-[#79C8E8]/40 rounded-2xl text-[#F8FAFC] p-3 shadow-2xl space-y-2.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10">
        <h2 className="font-display font-bold text-sm text-[#F8FAFC]">
          Sub-Resources &amp; Shifts
        </h2>
        <button
          type="button"
          onClick={() => {
            playCue('click');
            onClose();
          }}
          aria-label="Close Sub-Resources Drawer"
          className="p-1 rounded-lg bg-[#1E293B] hover:bg-slate-700 border border-white/15 text-[#F8FAFC] cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* 7 Sub-Resource Metrics */}
      <section aria-labelledby="sub-metrics-heading" className="space-y-1.5">
        <h3 id="sub-metrics-heading" className="text-[11px] font-black uppercase tracking-wider text-[#FFD66B]">
          7 Sub-Resource Metrics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {SUB_METRIC_SPECS.map((spec) => {
            const rawValue = state.sub[spec.key];
            const displayVal = Math.max(0, Math.round(rawValue));
            const isWarn = spec.warnCheck(displayVal);
            const ratio = Math.max(0, Math.min(1, displayVal / 100));

            return (
              <div
                key={spec.key}
                className={`rounded-xl border p-1.5 ${
                  spec.key === 'scienceScore' ? 'col-span-2 sm:col-span-3' : ''
                } ${
                  isWarn
                    ? 'bg-amber-950/60 border-[#FFD66B]/70'
                    : 'bg-[#1E293B]/90 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[#79C8E8] shrink-0">{spec.renderIcon('w-3 h-3')}</span>
                    <span className="text-[11px] font-bold text-[#F8FAFC] whitespace-nowrap truncate">{spec.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isWarn && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1 py-0.5 rounded bg-[#F87171]/25 text-[#F87171]">
                        <AlertTriangle className="w-2.5 h-2.5" aria-hidden="true" />
                        <span>{spec.warnLabel}</span>
                      </span>
                    )}
                    {spec.lowerIsBetter && !isWarn && (
                      <span className="text-[9px] font-bold text-[#79C8E8]">LOW=OK</span>
                    )}
                    {spec.key === 'scienceScore' && (
                      <span
                        className={`text-[9px] font-black px-1 py-0.5 rounded ${
                          displayVal >= 75
                            ? 'bg-[#9BD8A7]/20 text-[#9BD8A7]'
                            : 'bg-[#A995E8]/20 text-[#A995E8]'
                        }`}
                      >
                        {displayVal >= 75 ? '75+ MET' : 'GOAL 75+'}
                      </span>
                    )}
                    <span className="font-mono text-[11px] font-black tabular-nums text-[#F8FAFC]">
                      {spec.uncapped ? `${displayVal}` : `${displayVal}%`}
                    </span>
                  </div>
                </div>

                <div
                  className="w-full h-1 rounded-full bg-[#0F172A] overflow-hidden"
                  role="progressbar"
                  aria-label={spec.label}
                  aria-valuenow={displayVal}
                  aria-valuemin={0}
                  aria-valuemax={spec.uncapped ? Math.max(100, displayVal) : 100}
                >
                  <div
                    className={`h-full w-full rounded-full origin-left transition-transform duration-300 ${
                      isWarn ? 'bg-[#FFD66B]' : spec.barClass
                    }`}
                    style={{ transform: `scaleX(${ratio})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Flags Chips (Compact) */}
      {statusChips.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {statusChips.map((chip) => (
            <span
              key={chip.id}
              className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${chip.toneClass}`}
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}

      {/* Specialist Fatigue & Morning Shift Toggles */}
      <section aria-labelledby="specialist-shifts-heading" className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 id="specialist-shifts-heading" className="text-[11px] font-black uppercase tracking-wider text-[#9BD8A7]">
            Specialist Fatigue &amp; Shifts
          </h3>
          {canEditRoster && (
            <button
              type="button"
              onClick={() => {
                playCue('confirm');
                dispatch({ kind: 'CONFIRM_MORNING_ROSTER' });
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#9BD8A7] hover:bg-[#b5e4be] text-[#0F172A] font-display font-bold text-[11px] cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              <span>Confirm Roster</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {ON_BASE_CREW_IDS.map((crewId) => {
            const profile = CREW_PROFILES[crewId];
            const runtime = state.specialists[crewId];
            const fatigueVal = Math.max(0, Math.min(100, Math.round(runtime.fatigue)));
            const isMandatoryRest = runtime.forcedRest || fatigueVal >= 90;
            const isExhausted = fatigueVal >= 70 && !isMandatoryRest;
            const isResting = runtime.assignment === 'resting';
            const canToggle = canEditRoster && !isMandatoryRest;
            const firstName = profile.name.split(' ')[0] ?? profile.name;

            return (
              <div
                key={crewId}
                className={`rounded-xl border px-2 py-1.5 flex items-center justify-between gap-1.5 ${
                  isMandatoryRest
                    ? 'bg-red-950/60 border-[#F87171]/70'
                    : isExhausted
                      ? 'bg-amber-950/50 border-[#FFD66B]/60'
                      : 'bg-[#1E293B]/90 border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#0F172A] border border-white/10">
                    <CrewAvatar
                      crewId={crewId}
                      expression={isMandatoryRest || isExhausted ? 'worried' : runtime.expression}
                      size="sm"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[11px] text-[#F8FAFC] truncate">
                        {firstName}
                      </span>
                      <span className="font-mono text-[10px] font-bold tabular-nums text-slate-200 shrink-0">
                        {fatigueVal}%
                      </span>
                    </div>
                    <div
                      className="w-full h-1 rounded-full bg-[#0F172A] overflow-hidden mt-1"
                      role="progressbar"
                      aria-label={`${profile.name} fatigue`}
                      aria-valuenow={fatigueVal}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`h-full w-full rounded-full origin-left transition-transform duration-300 ${
                          isMandatoryRest
                            ? 'bg-[#F87171]'
                            : isExhausted
                              ? 'bg-[#FFD66B]'
                              : 'bg-[#79C8E8]'
                        }`}
                        style={{ transform: `scaleX(${fatigueVal / 100})` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center bg-[#0F172A] border border-white/15 rounded-lg p-0.5 gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={!canToggle}
                    onClick={() => handleToggleSpecialist(crewId, 'station')}
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                      !isResting
                        ? 'bg-[#79C8E8] text-[#0F172A]'
                        : 'text-slate-300 hover:bg-[#1E293B]'
                    } ${canToggle ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    Station
                  </button>
                  <button
                    type="button"
                    disabled={!canToggle}
                    onClick={() => handleToggleSpecialist(crewId, 'resting')}
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                      isResting
                        ? 'bg-[#9BD8A7] text-[#0F172A]'
                        : 'text-slate-300 hover:bg-[#1E293B]'
                    } ${canToggle ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    Rest
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
};
