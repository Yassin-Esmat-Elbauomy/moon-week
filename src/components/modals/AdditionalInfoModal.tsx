import React, { useEffect, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import {
  ALL_DAYS,
  ASTRONAUT_SUIT_ITEMS,
  BASE_MACHINE_ITEMS,
  DAILY_OBSTACLES_BY_DAY,
  NASA_SOURCES_BY_DAY,
} from '../../data/moonWeekInfoData';
import { playCue } from '../../services/soundEngine';
import type { DayNumber } from '../../types/game';

export interface AdditionalInfoModalProps {
  onClose: () => void;
}

type InfoCategory = 'suit' | 'machines' | 'obstacles' | 'nasa';

interface TabDescriptor {
  id: InfoCategory;
  label: string;
}

const INFO_TABS: readonly TabDescriptor[] = [
  { id: 'suit', label: '👨‍🚀 Astronaut Suit' },
  { id: 'machines', label: '⚙️ Base Machines' },
  { id: 'obstacles', label: '⚠️ Daily Obstacles' },
  { id: 'nasa', label: '🛰️ NASA Sources & Links' },
];

export const AdditionalInfoModal: React.FC<AdditionalInfoModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<InfoCategory>('suit');
  const [selectedDay, setSelectedDay] = useState<DayNumber>(1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        playCue('click');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleClose = () => {
    playCue('click');
    onClose();
  };

  const handleSelectTab = (tabId: InfoCategory) => {
    playCue('click');
    setActiveTab(tabId);
  };

  const handleSelectDay = (day: DayNumber) => {
    playCue('click');
    setSelectedDay(day);
  };

  const dayObstacles = DAILY_OBSTACLES_BY_DAY[selectedDay];
  const dayTopics = NASA_SOURCES_BY_DAY[selectedDay];

  const obstacleGridCols = dayObstacles.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';
  const nasaGridCols =
    dayTopics.length === 1
      ? 'grid-cols-1'
      : dayTopics.length === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-3';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/85 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="additional-info-title"
      onClick={handleClose}
    >
      <div
        className="flex w-full max-w-6xl max-h-[94vh] flex-col overflow-hidden rounded-2xl border-2 border-[#79C8E8]/55 bg-[#0F172A] text-[#F8FAFC] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700/80 bg-[#1E293B] px-4 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="rounded-full bg-[#FFD66B] px-3 py-0.5 font-display text-xs font-extrabold uppercase text-[#090D16]">
              🌙 Moon Week Guide
            </span>
            <h2
              id="additional-info-title"
              className="truncate font-display text-base font-extrabold text-[#F8FAFC]"
            >
              Astronaut Gear, Base Machines, Obstacles &amp; NASA Data
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Additional Info"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-600 bg-[#0F172A] px-3 py-1 font-display text-xs font-extrabold text-[#F8FAFC] transition-colors hover:border-[#79C8E8] hover:text-[#79C8E8]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            CLOSE
          </button>
        </header>

        {/* 4 Category Tabs */}
        <nav
          aria-label="Additional Info Categories"
          className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-800 bg-[#090D16]/80 px-4 py-2"
        >
          {INFO_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleSelectTab(tab.id)}
                className={`rounded-xl border px-3.5 py-1.5 font-display text-xs font-extrabold transition-colors ${
                  isActive
                    ? 'border-[#FFD66B] bg-[#FFD66B] text-[#090D16]'
                    : 'border-slate-700 bg-[#1E293B] text-[#F8FAFC] hover:border-[#79C8E8]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Body (Zero scrollbars at 1280x720) */}
        <div className="flex-1 overflow-hidden p-4">
          {activeTab === 'suit' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
              {ASTRONAUT_SUIT_ITEMS.map((item, idx) => (
                <article
                  key={item.id}
                  className={`flex flex-col gap-1.5 rounded-2xl border-2 bg-[#1E293B] p-3.5 ${
                    idx < 3 ? 'md:col-span-2' : 'md:col-span-3'
                  }`}
                  style={{ borderColor: `${item.accentHex}66` }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-[#0F172A] text-lg"
                      style={{ borderColor: `${item.accentHex}88` }}
                      aria-hidden="true"
                    >
                      {item.emoji}
                    </span>
                    <h3
                      className="font-display text-sm font-extrabold leading-tight"
                      style={{ color: item.accentHex }}
                    >
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-100">{item.description}</p>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'machines' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {BASE_MACHINE_ITEMS.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-2.5 rounded-2xl border-2 bg-[#1E293B] p-4"
                  style={{ borderColor: `${item.accentHex}66` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-[#0F172A] text-2xl"
                      style={{ borderColor: `${item.accentHex}88` }}
                      aria-hidden="true"
                    >
                      {item.emoji}
                    </span>
                    <h3
                      className="font-display text-base font-extrabold leading-tight"
                      style={{ color: item.accentHex }}
                    >
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-100">{item.description}</p>
                </article>
              ))}
            </div>
          )}

          {(activeTab === 'obstacles' || activeTab === 'nasa') && (
            <div className="flex flex-col gap-3">
              {/* Day 1..7 Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xs font-extrabold uppercase tracking-wider text-[#79C8E8]">
                  Select Day:
                </span>
                {ALL_DAYS.map((dayNum) => {
                  const active = selectedDay === dayNum;
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`rounded-xl border px-3 py-1 font-display text-xs font-extrabold transition-colors ${
                        active
                          ? 'border-[#79C8E8] bg-[#79C8E8] text-[#090D16]'
                          : 'border-slate-700 bg-[#1E293B] text-slate-200 hover:border-[#79C8E8]'
                      }`}
                    >
                      Day {dayNum}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'obstacles' ? (
                <div className={`grid gap-3 ${obstacleGridCols}`}>
                  {dayObstacles.map((obs, index) => (
                    <article
                      key={obs.id}
                      className="flex flex-col gap-2 rounded-2xl border-2 border-[#FFD66B]/45 bg-[#1E293B] p-3.5"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFD66B] font-display text-xs font-extrabold text-[#090D16]">
                          {index + 1}
                        </span>
                        <h3 className="font-display text-sm font-extrabold leading-snug text-[#FFD66B]">
                          {obs.title}
                        </h3>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-100">{obs.description}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={`grid gap-3 ${nasaGridCols}`}>
                  {dayTopics.map((topicItem, index) => (
                    <article
                      key={topicItem.id}
                      className="flex flex-col justify-between gap-2.5 rounded-2xl border-2 border-[#79C8E8]/45 bg-[#1E293B] p-3.5"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-[#A995E8]/60 bg-[#A995E8]/20 px-2 py-0.5 font-display text-[10px] font-extrabold uppercase text-[#A995E8]">
                            Topic {index + 1}
                          </span>
                        </div>
                        <h3 className="font-display text-sm font-extrabold leading-snug text-[#F8FAFC]">
                          {topicItem.topic}
                        </h3>
                      </div>

                      <div className="flex flex-col gap-1.5 border-t border-slate-700/80 pt-2">
                        {topicItem.links.map((link) => (
                          <a
                            key={`${topicItem.id}-${link.title}`}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playCue('click')}
                            className="inline-flex items-center justify-between gap-2 rounded-xl border border-[#79C8E8]/40 bg-[#0F172A] px-2.5 py-1.5 text-xs font-bold text-[#79C8E8] transition-colors hover:border-[#FFD66B] hover:bg-[#090D16] hover:text-[#FFD66B]"
                          >
                            <span className="leading-snug">{link.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
