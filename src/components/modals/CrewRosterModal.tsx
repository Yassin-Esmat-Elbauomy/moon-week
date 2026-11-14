import React from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  Users,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import { ALL_CREW_IDS, CREW_PROFILES } from '../../data/crewProfiles';
import { playCue } from '../../services/soundEngine';
import type { CrewId, GameAction, GameState, OnBaseCrewId } from '../../types/game';

export interface CrewRosterModalProps {
  state: Readonly<GameState>;
  isOpen: boolean;
  onClose: () => void;
  dispatch: (action: GameAction) => void;
  onTalkToCrew: (crewId: CrewId) => void;
}

export const CrewRosterModal: React.FC<CrewRosterModalProps> = ({
  state,
  isOpen,
  onClose,
  dispatch,
  onTalkToCrew,
}) => {
  if (!isOpen) return null;

  const isMorningOpen = state.shift === 'morning' && !state.rosterConfirmedForDay;
  const isBlackout = state.day === 7 && state.commsBlackout === true;

  const getSpecialistRuntime = (id: OnBaseCrewId) => state.specialists[id];

  const restingCount = ALL_CREW_IDS.reduce((count, id) => {
    if (id === 'abdelrahman') return count;
    return state.specialists[id].assignment === 'resting' ? count + 1 : count;
  }, 0);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/85 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crew-roster-title"
    >
      <div className="flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#79C8E8]/40 bg-[#0F172A] text-[#F8FAFC] shadow-2xl">
        {/* Header */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 bg-[#1E293B] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#79C8E8]/40 bg-[#0F172A] text-[#79C8E8]">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="crew-roster-title" className="font-display text-base font-extrabold">
                  Lunar Outpost Crew Roster
                </h2>
                <span className="rounded-full bg-[#FFD66B] px-2 py-0.5 font-display text-[10px] font-extrabold uppercase text-[#090D16]">
                  Sol {state.day} • {state.shift}
                </span>
                <span className="rounded-full border border-slate-600 bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold text-[#9BD8A7]">
                  {5 - restingCount}/5 Active • {restingCount} Resting
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Assign Morning duty or rest before shift lock-in. Fatigue &ge;70% halves output;
                &ge;90% forces rest.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMorningOpen && (
              <button
                type="button"
                onClick={() => {
                  playCue('confirm');
                  dispatch({ kind: 'CONFIRM_MORNING_ROSTER' });
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#9BD8A7] px-3.5 py-1.5 font-display text-xs font-extrabold text-[#090D16] transition-colors hover:bg-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Morning Roster
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playCue('click');
                onClose();
              }}
              aria-label="Close Crew Roster"
              className="rounded-lg border border-slate-700 bg-[#0F172A] p-1.5 text-slate-300 transition-colors hover:border-[#79C8E8] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ALL_CREW_IDS.map((id) => {
              const profile = CREW_PROFILES[id];
              const runtime = id !== 'abdelrahman' ? getSpecialistRuntime(id) : null;
              const fatigue = runtime ? Math.round(runtime.fatigue) : 0;
              const isCritical = fatigue >= 90 || (runtime?.forcedRest ?? false);
              const isTired = !isCritical && fatigue >= 70;
              const expression =
                id === 'abdelrahman' && isBlackout
                  ? 'alert'
                  : runtime
                    ? runtime.expression
                    : profile.dayDialogues[state.day].expression;

              const barColor = isCritical
                ? 'bg-[#F87171]'
                : isTired
                  ? 'bg-[#FFD66B]'
                  : 'bg-[#9BD8A7]';

              const fatigueRatio = Math.max(0.04, Math.min(1, fatigue / 100));

              return (
                <article
                  key={id}
                  className="flex flex-col justify-between rounded-xl border border-slate-700 bg-[#1E293B] p-3"
                >
                  <div>
                    {/* Identity Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <CrewAvatar crewId={id} expression={expression} size="sm" />
                        <div className="min-w-0">
                          <h3 className="font-display text-sm font-extrabold leading-tight text-[#F8FAFC]">
                            {profile.name}
                          </h3>
                          <p className="mt-0.5 text-[11px] font-semibold leading-tight text-[#79C8E8]">
                            {profile.role}
                          </p>
                          <p className="text-[10px] leading-tight text-slate-400">
                            {profile.stationName}
                          </p>
                        </div>
                      </div>

                      {id === 'abdelrahman' ? (
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            isBlackout
                              ? 'border-[#F87171]/60 bg-[#F87171]/15 text-[#F87171]'
                              : 'border-[#79C8E8]/50 bg-[#79C8E8]/15 text-[#79C8E8]'
                          }`}
                        >
                          {isBlackout ? (
                            <>
                              <WifiOff className="h-3 w-3" />
                              LOS
                            </>
                          ) : (
                            'Earth Uplink'
                          )}
                        </span>
                      ) : runtime ? (
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                            runtime.assignment === 'resting'
                              ? 'border-[#A995E8]/50 bg-[#A995E8]/15 text-[#A995E8]'
                              : 'border-[#9BD8A7]/50 bg-[#9BD8A7]/15 text-[#9BD8A7]'
                          }`}
                        >
                          {runtime.assignment === 'resting' ? 'Resting' : 'On Station'}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-[11px] leading-snug text-slate-300">
                      {profile.specialty}
                    </p>

                    {/* Fatigue Bar (On-Base Specialists) or Earth Link Card */}
                    {runtime !== null ? (
                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-300">Specialist Fatigue</span>
                          <span
                            className={`font-mono ${
                              isCritical
                                ? 'text-[#F87171]'
                                : isTired
                                  ? 'text-[#FFD66B]'
                                  : 'text-[#9BD8A7]'
                            }`}
                          >
                            {fatigue}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#090D16]">
                          <div
                            className={`h-full w-full origin-left rounded-full transition-transform ${barColor}`}
                            style={{ transform: `scaleX(${fatigueRatio})` }}
                          />
                        </div>
                        {isCritical ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#F87171]">
                            <ShieldAlert className="h-3 w-3 shrink-0" />
                            Mandatory Rest (&ge;90% fatigue)
                          </div>
                        ) : isTired ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#FFD66B]">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            Half Output (&ge;70% fatigue)
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-2.5 rounded-lg border border-slate-700 bg-[#0F172A] px-2.5 py-2 text-[11px] text-slate-300">
                        {isBlackout
                          ? 'Solar radio burst severed S-Band carrier until Sol 7 stages clear.'
                          : 'Remote Houston Telemetry Desk • 1.3s one-way / 2.6s round-trip.'}
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-700/80 pt-2.5">
                    {id !== 'abdelrahman' && runtime !== null ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={!isMorningOpen || isCritical}
                          onClick={() => {
                            playCue('click');
                            dispatch({
                              kind: 'SET_SPECIALIST_ASSIGNMENT',
                              crewId: id,
                              assignment: 'station',
                            });
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition-colors ${
                            runtime.assignment === 'station'
                              ? 'border-[#9BD8A7] bg-[#9BD8A7]/20 text-[#9BD8A7]'
                              : 'border-slate-700 bg-[#0F172A] text-slate-300 hover:border-[#79C8E8]'
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <Wrench className="h-3 w-3" />
                          Station
                        </button>

                        <button
                          type="button"
                          disabled={!isMorningOpen}
                          onClick={() => {
                            playCue('click');
                            dispatch({
                              kind: 'SET_SPECIALIST_ASSIGNMENT',
                              crewId: id,
                              assignment: 'resting',
                            });
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition-colors ${
                            runtime.assignment === 'resting'
                              ? 'border-[#A995E8] bg-[#A995E8]/20 text-[#A995E8]'
                              : 'border-slate-700 bg-[#0F172A] text-slate-300 hover:border-[#79C8E8]'
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <BatteryCharging className="h-3 w-3" />
                          Rest
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] font-semibold text-slate-400">
                        Houston Uplink
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={id === 'abdelrahman' && isBlackout}
                      onClick={() => {
                        playCue('click');
                        onTalkToCrew(id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#79C8E8]/50 bg-[#79C8E8]/15 px-2.5 py-1 text-[11px] font-extrabold text-[#79C8E8] transition-colors hover:bg-[#79C8E8]/25 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-[#090D16] disabled:text-slate-500"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Talk
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
