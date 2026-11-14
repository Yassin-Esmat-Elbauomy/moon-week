import React, { useCallback, useEffect, useState } from 'react';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import {
  SUGGESTED_ADVISOR_QUESTIONS,
  queryEarthControl,
  type EarthControlReply,
} from '../../services/aiAdvisor';
import * as soundEngine from '../../services/soundEngine';
import type { GameState } from '../../types/game';

export interface AiAdvisorModalProps {
  state: Readonly<GameState>;
  onClose: () => void;
}

type AdvisorModalStatus = 'transmitting' | 'reply' | 'blackout';

type QueryOutcome =
  | { ok: true; reply: EarthControlReply }
  | { ok: false };

const STATIC_BAR_HEIGHTS: readonly number[] = [28, 72, 44, 92, 36, 84, 52, 96, 40, 76, 30, 64];

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ state, onClose }) => {
  const suggested = SUGGESTED_ADVISOR_QUESTIONS[state.day];
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    suggested[0] ?? 'What should we pick tonight?',
  );
  const [status, setStatus] = useState<AdvisorModalStatus>('transmitting');
  const [reply, setReply] = useState<EarthControlReply | null>(null);
  const [requestSeq, setRequestSeq] = useState<number>(0);

  useEffect(() => {
    const first = SUGGESTED_ADVISOR_QUESTIONS[state.day][0] ?? 'What should we pick tonight?';
    setSelectedQuestion(first);
    setRequestSeq((n) => n + 1);
  }, [state.day, state.commsBlackout]);

  useEffect(() => {
    let cancelled = false;
    setStatus('transmitting');
    soundEngine.playCue('radio_ping');

    const isBlackoutState = state.day === 7 && state.commsBlackout;
    const minDelayMs = isBlackoutState ? 650 : 1300;
    const delayPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, minDelayMs);
    });

    const queryPromise: Promise<QueryOutcome> = queryEarthControl(state, selectedQuestion)
      .then((res): QueryOutcome => ({ ok: true, reply: res }))
      .catch((): QueryOutcome => ({ ok: false }));

    Promise.all([delayPromise, queryPromise]).then(([, outcome]) => {
      if (cancelled) return;
      if (!outcome.ok) {
        soundEngine.playCue('comms_static');
        setReply(null);
        setStatus('blackout');
        return;
      }
      soundEngine.playCue('confirm');
      setReply(outcome.reply);
      setStatus('reply');
    });

    return () => {
      cancelled = true;
    };
  }, [requestSeq, selectedQuestion, state]);

  const handleClose = useCallback(() => {
    soundEngine.playCue('click');
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleClose]);

  const handleAskQuestion = (question: string) => {
    if (status === 'transmitting') return;
    setSelectedQuestion(question);
    setRequestSeq((n) => n + 1);
  };

  const isBlackout = status === 'blackout';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/82 backdrop-blur-sm p-3 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Abdul Earth Control Uplink"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-lg rounded-3xl border-2 p-5 shadow-2xl flex flex-col items-center text-center gap-3.5 ${
          isBlackout
            ? 'bg-[#1F0F16] border-[#F87171]'
            : 'bg-[#0F172A] border-[#79C8E8]/70'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header: Abdul Portrait + Name + Delay Pill */}
        <div className="w-full flex items-center justify-between gap-3 rounded-2xl bg-[#1E293B] border border-slate-700 px-3.5 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-1 rounded-xl border-2 shrink-0 ${
                isBlackout
                  ? 'bg-[#2B121B] border-[#F87171]/80'
                  : 'bg-[#0F172A] border-[#79C8E8]/70'
              }`}
            >
              <CrewAvatar
                crewId="abdelrahman"
                expression={
                  isBlackout
                    ? 'alert'
                    : (reply?.expression ?? 'focused')
                }
                size="sm"
              />
            </div>
            <div className="text-left min-w-0">
              <p
                className="text-base font-extrabold text-[#F8FAFC] truncate"
                style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
              >
                Abdul (Earth Control)
              </p>
              <p className="text-xs font-extrabold text-[#79C8E8]">
                {isBlackout ? '⚡ S-Band Signal Severed' : '📡 1.3s One-Way • 2.6s Round-Trip'}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase shrink-0 border ${
              isBlackout
                ? 'bg-[#F87171]/20 border-[#F87171] text-[#F87171]'
                : status === 'transmitting'
                  ? 'bg-[#FFD66B]/20 border-[#FFD66B] text-[#FFD66B]'
                  : 'bg-[#9BD8A7]/20 border-[#9BD8A7] text-[#9BD8A7]'
            }`}
          >
            {isBlackout ? 'BLACKOUT' : status === 'transmitting' ? 'PINGING...' : 'LINKED'}
          </span>
        </div>

        {/* Animated Earth -> Moon Radio Wave Visualizer */}
        <div
          className={`w-full rounded-2xl border px-3 py-2.5 ${
            isBlackout
              ? 'bg-[#2A1119] border-[#F87171]/60'
              : 'bg-[#0B1222] border-slate-700/80'
          }`}
        >
          <svg
            viewBox="0 0 360 82"
            className="w-full h-auto block"
            role="img"
            aria-label={
              isBlackout
                ? 'Solar radio static blocking Earth to Moon uplink'
                : 'Animated radio wave travelling between Earth and Moon Base'
            }
          >
            {/* Earth Node */}
            <circle cx="34" cy="41" r="18" fill="#2563EB" stroke="#79C8E8" strokeWidth="2" />
            <path d="M25 34 h10 v6 h-5 v6 h-5 z" fill="#9BD8A7" />
            <path d="M38 42 h8 v6 h-8 z" fill="#9BD8A7" />
            <text x="34" y="73" textAnchor="middle" fill="#79C8E8" fontSize="9" fontWeight="bold">
              EARTH
            </text>

            {/* Moon Node */}
            <circle cx="326" cy="41" r="16" fill="#475569" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="321" cy="36" r="3.5" fill="#334155" />
            <circle cx="331" cy="45" r="4.5" fill="#334155" />
            <circle cx="323" cy="48" r="2" fill="#334155" />
            <text x="326" y="73" textAnchor="middle" fill="#FFD66B" fontSize="9" fontWeight="bold">
              MOON BASE
            </text>

            {isBlackout ? (
              <g>
                {/* Severed Signal + Animated Solar Static Bars */}
                <line
                  x1="58"
                  y1="41"
                  x2="140"
                  y2="41"
                  stroke="#F87171"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                <line
                  x1="220"
                  y1="41"
                  x2="304"
                  y2="41"
                  stroke="#F87171"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                {STATIC_BAR_HEIGHTS.map((heightPct, idx) => {
                  const barH = Math.max(8, Math.round((heightPct / 100) * 34));
                  const x = 144 + idx * 6;
                  const y = 41 - barH / 2;
                  return (
                    <rect
                      key={idx}
                      x={x}
                      y={y}
                      width="4"
                      height={barH}
                      rx="1.5"
                      fill={idx % 2 === 0 ? '#F87171' : '#FFD66B'}
                    >
                      <animate
                        attributeName="height"
                        values={`${barH};${Math.max(6, 38 - barH)};${barH}`}
                        dur={`${0.26 + (idx % 4) * 0.09}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="y"
                        values={`${41 - barH / 2};${41 - Math.max(6, 38 - barH) / 2};${41 - barH / 2}`}
                        dur={`${0.26 + (idx % 4) * 0.09}s`}
                        repeatCount="indefinite"
                      />
                    </rect>
                  );
                })}
                <text x="180" y="14" textAnchor="middle" fill="#F87171" fontSize="9.5" fontWeight="bold">
                  SOLAR STATIC BURST — LINK SEVERED
                </text>
              </g>
            ) : (
              <g>
                {/* Carrier Arcs */}
                <path
                  d="M58 36 Q180 10 302 36"
                  fill="none"
                  stroke="#79C8E8"
                  strokeWidth="2"
                  strokeDasharray="6 5"
                  opacity={status === 'transmitting' ? '0.95' : '0.45'}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="22;0"
                    dur="1.3s"
                    repeatCount="indefinite"
                  />
                </path>
                <path
                  d="M302 46 Q180 72 58 46"
                  fill="none"
                  stroke="#9BD8A7"
                  strokeWidth="2"
                  strokeDasharray="6 5"
                  opacity={status === 'reply' ? '0.9' : '0.35'}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="22;0"
                    dur="1.3s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Travelling Radio Photon Packet (1.3s each way) */}
                <circle r="5" fill="#FFD66B">
                  <animateMotion
                    dur="1.3s"
                    repeatCount="indefinite"
                    path="M58 36 Q180 10 302 36"
                  />
                </circle>
                {status === 'reply' ? (
                  <circle r="4.5" fill="#9BD8A7">
                    <animateMotion
                      dur="1.3s"
                      repeatCount="indefinite"
                      path="M302 46 Q180 72 58 46"
                    />
                  </circle>
                ) : null}

                <text x="180" y="14" textAnchor="middle" fill="#FFD66B" fontSize="9" fontWeight="bold">
                  1.3s Earth → Moon (2.6s Round-Trip)
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Status Card */}
        {status === 'transmitting' ? (
          <div className="w-full rounded-2xl bg-[#1E293B] border border-slate-700 px-4 py-4 flex flex-col items-center gap-2">
            <p className="text-base font-extrabold text-[#F8FAFC]">
              📡 Sending radio wave across 384,400 km...
            </p>
            <p className="text-xs font-bold text-slate-300">
              Even at light speed, Abdul’s message takes 2.6 seconds round-trip!
            </p>
          </div>
        ) : null}

        {isBlackout ? (
          <div className="w-full rounded-2xl bg-[#2A1119] border-2 border-[#F87171]/80 px-4 py-3.5 flex flex-col items-center gap-2">
            <div className="flex items-end justify-center gap-1 h-6" aria-hidden="true">
              {STATIC_BAR_HEIGHTS.slice(0, 8).map((val, idx) => (
                <span
                  key={idx}
                  className="w-1.5 rounded-full bg-[#F87171] animate-pulse"
                  style={{ height: `${Math.max(25, val)}%` }}
                />
              ))}
            </div>
            <p className="text-base font-extrabold text-[#F87171]">
              ⚡ RADIO BLACKOUT ACTIVE!
            </p>
            <p className="text-sm font-bold text-slate-100 leading-snug">
              Solar static blocked Earth! Your Moon crew has full command — choose your rescue steps!
            </p>
          </div>
        ) : null}

        {status === 'reply' && reply ? (
          <div className="w-full flex flex-col gap-2 text-left">
            <div className="rounded-2xl bg-[#1E293B] border border-[#79C8E8]/55 px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#FFD66B]">
                  {reply.headline}
                </span>
                <span className="text-[11px] font-bold text-[#9BD8A7]">
                  {reply.telemetryAnalysis}
                </span>
              </div>
              <p className="text-base font-bold text-[#F8FAFC] leading-snug">
                “{reply.tradeOffWarning}”
              </p>
              <p className="text-xs font-bold text-[#79C8E8]">
                🛰️ {reply.scientificNote}
              </p>
            </div>

            {/* Quick Question Chips */}
            <div className="grid grid-cols-1 gap-1.5">
              {suggested.slice(0, 2).map((q) => {
                const isSelected = q === selectedQuestion;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAskQuestion(q)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#79C8E8]/15 border-[#79C8E8] text-[#79C8E8]'
                        : 'bg-[#11192E] border-slate-700 text-slate-200 hover:border-[#FFD66B]'
                    }`}
                  >
                    💬 {q}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playCue('confirm');
            onClose();
          }}
          className={`w-full py-3 px-5 rounded-2xl text-lg font-extrabold cursor-pointer transition-colors ${
            isBlackout
              ? 'bg-[#F87171] hover:bg-[#ef5b5b] text-[#090D16]'
              : 'bg-[#79C8E8] hover:bg-[#5eb8dc] text-[#090D16]'
          }`}
          style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
        >
          GOT IT! →
        </button>
      </div>
    </div>
  );
};
