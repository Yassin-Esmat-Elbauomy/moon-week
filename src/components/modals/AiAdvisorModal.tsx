import React, { useEffect, useState } from 'react';
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

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ state, onClose }) => {
  const [status, setStatus] = useState<AdvisorModalStatus>('transmitting');
  const [reply, setReply] = useState<EarthControlReply | null>(null);

  useEffect(() => {
    let cancelled = false;
    const defaultQuestion =
      SUGGESTED_ADVISOR_QUESTIONS[state.day][0] ?? 'What should we pick tonight?';

    const minDelayMs = state.day === 7 && state.commsBlackout ? 500 : 1300;
    const delayPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, minDelayMs);
    });

    const queryPromise: Promise<QueryOutcome> = queryEarthControl(state, defaultQuestion)
      .then((res): QueryOutcome => ({ ok: true, reply: res }))
      .catch((): QueryOutcome => ({ ok: false }));

    soundEngine.playCue('radio_ping');

    Promise.all([delayPromise, queryPromise]).then(([, outcome]) => {
      if (cancelled) return;
      if (!outcome.ok) {
        soundEngine.playCue('static_burst');
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
  }, [state]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/80 backdrop-blur-sm p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Earth Control Radio"
    >
      <div
        className={`w-full max-w-md rounded-3xl border-2 p-6 shadow-2xl flex flex-col items-center text-center gap-4 ${
          status === 'blackout'
            ? 'bg-[#1F0F16] border-[#F87171]'
            : 'bg-[#0F172A] border-[#79C8E8]/70'
        }`}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`p-2 rounded-2xl border-2 ${
              status === 'blackout'
                ? 'bg-[#2B121B] border-[#F87171]/80'
                : 'bg-[#1E293B] border-[#79C8E8]/70'
            }`}
          >
            <CrewAvatar
              crewId="abdelrahman"
              expression={
                status === 'blackout'
                  ? 'alert'
                  : (reply?.expression ?? 'focused')
              }
              size="md"
            />
          </div>
          <span
            className="text-sm font-extrabold uppercase tracking-wider text-[#79C8E8]"
            style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
          >
            Abd-Elrahman (Earth Control)
          </span>
        </div>

        {/* Body */}
        {status === 'transmitting' ? (
          <div className="w-full rounded-2xl bg-[#1E293B] border border-slate-700 px-4 py-5 flex flex-col items-center gap-3">
            <div className="flex items-end justify-center gap-1.5 h-8" aria-hidden="true">
              <span className="w-2 h-3 rounded-full bg-[#79C8E8] animate-bounce" />
              <span
                className="w-2 h-6 rounded-full bg-[#FFD66B] animate-bounce"
                style={{ animationDelay: '120ms' }}
              />
              <span
                className="w-2 h-8 rounded-full bg-[#9BD8A7] animate-bounce"
                style={{ animationDelay: '240ms' }}
              />
              <span
                className="w-2 h-5 rounded-full bg-[#FFD66B] animate-bounce"
                style={{ animationDelay: '360ms' }}
              />
              <span
                className="w-2 h-3 rounded-full bg-[#79C8E8] animate-bounce"
                style={{ animationDelay: '480ms' }}
              />
            </div>
            <p className="text-base font-extrabold text-[#F8FAFC]">
              📡 Calling Earth Control (1.3s radio wave)...
            </p>
          </div>
        ) : null}

        {status === 'blackout' ? (
          <div className="w-full rounded-2xl bg-[#2A1119] border-2 border-[#F87171]/80 px-4 py-5 flex flex-col items-center gap-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#F87171] font-extrabold text-lg animate-pulse">
              <span aria-hidden="true">⚡</span>
              <span>RADIO BLACKOUT!</span>
              <span aria-hidden="true">⚡</span>
            </div>
            <p className="text-base font-bold text-slate-100 leading-snug">
              Solar static blocked Earth! Trust your Moon crew and decide!
            </p>
          </div>
        ) : null}

        {status === 'reply' && reply ? (
          <div className="w-full rounded-2xl bg-[#1E293B] border border-[#79C8E8]/50 px-5 py-4">
            <p className="text-lg font-bold text-[#F8FAFC] leading-snug">
              “{reply.tradeOffWarning}”
            </p>
          </div>
        ) : null}

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playCue('confirm');
            onClose();
          }}
          className={`w-full py-3.5 px-5 rounded-2xl text-lg font-extrabold cursor-pointer transition-colors ${
            status === 'blackout'
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
