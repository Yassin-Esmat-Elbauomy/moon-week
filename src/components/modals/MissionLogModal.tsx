import React, { useMemo, useState } from 'react';
import { ArrowDownUp, BookOpen, Filter, X } from 'lucide-react';
import { playCue } from '../../services/soundEngine';
import type { DayNumber, GameState, MissionLogEntry } from '../../types/game';

export interface MissionLogModalProps {
  state: Readonly<GameState>;
  isOpen: boolean;
  onClose: () => void;
}

type DayFilter = 'all' | DayNumber;
type CategoryFilter = 'all' | MissionLogEntry['category'];

const DAY_FILTERS: ReadonlyArray<DayFilter> = ['all', 1, 2, 3, 4, 5, 6, 7];

const CATEGORY_FILTERS: ReadonlyArray<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'decision', label: 'Decisions' },
  { id: 'nasa', label: 'NASA Data' },
  { id: 'minigame', label: 'Drills' },
  { id: 'anomaly', label: 'Anomalies' },
  { id: 'comms', label: 'Comms' },
  { id: 'system', label: 'System' },
];

const CATEGORY_STYLES: Record<MissionLogEntry['category'], string> = {
  decision: 'border-[#79C8E8]/50 bg-[#79C8E8]/15 text-[#79C8E8]',
  nasa: 'border-[#A995E8]/50 bg-[#A995E8]/15 text-[#A995E8]',
  minigame: 'border-[#9BD8A7]/50 bg-[#9BD8A7]/15 text-[#9BD8A7]',
  anomaly: 'border-[#F87171]/50 bg-[#F87171]/15 text-[#F87171]',
  comms: 'border-[#FFD66B]/50 bg-[#FFD66B]/15 text-[#FFD66B]',
  system: 'border-slate-600 bg-[#0F172A] text-slate-300',
};

const snapshotColor = (value: number): string => {
  if (value < 35) return 'text-[#F87171] border-[#F87171]/40 bg-[#F87171]/10';
  if (value < 60) return 'text-[#FFD66B] border-[#FFD66B]/40 bg-[#FFD66B]/10';
  return 'text-[#9BD8A7] border-[#9BD8A7]/40 bg-[#9BD8A7]/10';
};

export const MissionLogModal: React.FC<MissionLogModalProps> = ({ state, isOpen, onClose }) => {
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [newestFirst, setNewestFirst] = useState(true);

  const visibleLogs = useMemo(() => {
    const filtered = state.logs.filter((entry) => {
      if (dayFilter !== 'all' && entry.day !== dayFilter) return false;
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false;
      return true;
    });
    return newestFirst ? [...filtered].reverse() : filtered;
  }, [state.logs, dayFilter, categoryFilter, newestFirst]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/85 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-log-title"
    >
      <div className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#79C8E8]/40 bg-[#0F172A] text-[#F8FAFC] shadow-2xl">
        {/* Header */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 bg-[#1E293B] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#79C8E8]/40 bg-[#0F172A] text-[#79C8E8]">
              <BookOpen className="h-4 w-4" />
            </span>
            <div>
              <h2 id="mission-log-title" className="font-display text-base font-extrabold">
                Lunar Outpost Telemetry Log
              </h2>
              <p className="text-[11px] text-slate-300">
                {visibleLogs.length} of {state.logs.length} recorded events across Sols 1–{state.day}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playCue('click');
                setNewestFirst((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-[#0F172A] px-3 py-1.5 font-display text-xs font-bold text-[#79C8E8] transition-colors hover:border-[#79C8E8]"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              {newestFirst ? 'Newest First' : 'Oldest First'}
            </button>

            <button
              type="button"
              onClick={() => {
                playCue('click');
                onClose();
              }}
              aria-label="Close Mission Log"
              className="rounded-lg border border-slate-700 bg-[#0F172A] p-1.5 text-slate-300 transition-colors hover:border-[#79C8E8] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex shrink-0 flex-col gap-2 border-b border-slate-800 bg-[#090D16]/70 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Filter className="h-3 w-3" />
              Sol:
            </span>
            {DAY_FILTERS.map((dayOpt) => (
              <button
                key={String(dayOpt)}
                type="button"
                onClick={() => {
                  playCue('click');
                  setDayFilter(dayOpt);
                }}
                className={`rounded-lg border px-2 py-0.5 font-display text-[11px] font-bold transition-colors ${
                  dayFilter === dayOpt
                    ? 'border-[#FFD66B] bg-[#FFD66B] text-[#090D16]'
                    : 'border-slate-700 bg-[#1E293B] text-slate-300 hover:border-[#79C8E8]'
                }`}
              >
                {dayOpt === 'all' ? 'All' : `Sol ${dayOpt}`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Type:
            </span>
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playCue('click');
                  setCategoryFilter(cat.id);
                }}
                className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold transition-colors ${
                  categoryFilter === cat.id
                    ? 'border-[#79C8E8] bg-[#79C8E8]/20 text-[#79C8E8]'
                    : 'border-slate-700 bg-[#1E293B] text-slate-300 hover:border-[#79C8E8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {visibleLogs.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-[#1E293B]/60 p-6 text-center text-xs text-slate-300">
              No mission log entries match this filter yet.
            </div>
          ) : (
            visibleLogs.map((entry) => (
              <article
                key={entry.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-700/80 bg-[#1E293B] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-[#090D16] px-2 py-0.5 font-mono text-[10px] font-bold text-[#FFD66B]">
                      Sol {entry.day} • {entry.shift}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase ${CATEGORY_STYLES[entry.category]}`}
                    >
                      {entry.category}
                    </span>
                    <h3 className="font-display text-xs font-extrabold text-[#F8FAFC] sm:text-sm">
                      {entry.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-snug text-slate-300">{entry.detail}</p>
                </div>

                {/* Primary Meter Snapshot */}
                <div className="flex shrink-0 flex-wrap gap-1 font-mono text-[10px] font-bold">
                  <span
                    className={`rounded border px-1.5 py-0.5 ${snapshotColor(entry.primarySnapshot.lifeSupport)}`}
                  >
                    O2 {Math.round(entry.primarySnapshot.lifeSupport)}%
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.5 ${snapshotColor(entry.primarySnapshot.power)}`}
                  >
                    PWR {Math.round(entry.primarySnapshot.power)}%
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.5 ${snapshotColor(entry.primarySnapshot.shielding)}`}
                  >
                    SHD {Math.round(entry.primarySnapshot.shielding)}%
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.5 ${snapshotColor(entry.primarySnapshot.crewReadiness)}`}
                  >
                    RDY {Math.round(entry.primarySnapshot.crewReadiness)}%
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
