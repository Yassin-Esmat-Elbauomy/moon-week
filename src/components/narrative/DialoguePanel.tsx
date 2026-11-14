import React, { useEffect } from 'react';
import { CrewAvatar } from '../../assets/proceduralPixelArt';
import { CREW_PROFILES } from '../../data/crewProfiles';
import * as soundEngine from '../../services/soundEngine';
import type { CrewId, GameState, MiniGameId } from '../../types/game';

export interface DialoguePanelProps {
  state: Readonly<GameState>;
  crewId: CrewId;
  onClose: () => void;
  onStartMiniGame?: () => void;
  /** Legacy optional props kept for compatibility. */
  onOpenMiniGame?: (miniGame: MiniGameId) => void;
  onOpenDecisions?: () => void;
}

export const DialoguePanel: React.FC<DialoguePanelProps> = ({
  state,
  crewId,
  onClose,
  onStartMiniGame,
}) => {
  const profile = CREW_PROFILES[crewId];
  const dayDialogue = profile.dayDialogues[state.day];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        soundEngine.playCue('confirm');
        if (onStartMiniGame) {
          onStartMiniGame();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onStartMiniGame]);

  const handlePlayMiniGame = () => {
    soundEngine.playCue('confirm');
    if (onStartMiniGame) {
      onStartMiniGame();
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#090D16]/75 backdrop-blur-sm p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogue-crew-name"
    >
      <div className="w-full max-w-xl rounded-3xl bg-[#0F172A] border-2 border-[#79C8E8]/60 shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center gap-5">
        {/* Big Crew Portrait + Name Badge */}
        <div className="flex flex-col items-center gap-2.5">
          <div
            className="p-2 rounded-2xl bg-[#1E293B] border-2 shadow-lg"
            style={{ borderColor: profile.accentColor }}
          >
            <CrewAvatar
              crewId={crewId}
              expression={dayDialogue.expression}
              size="lg"
            />
          </div>

          <div
            id="dialogue-crew-name"
            className="px-4 py-1 rounded-full bg-[#1E293B] border border-slate-600 flex items-center gap-2"
            style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: profile.accentColor }}
              aria-hidden="true"
            />
            <span className="text-base font-extrabold text-[#F8FAFC]">
              {profile.name}
            </span>
          </div>
        </div>

        {/* Comic Speech Bubble — 1 Short Sentence Only */}
        <div className="w-full rounded-2xl bg-[#1E293B] border border-slate-700 px-5 py-4 shadow-inner">
          <p className="text-xl font-bold text-[#F8FAFC] leading-snug">
            “{dayDialogue.greeting}”
          </p>
        </div>

        {/* Single Huge Glowing Action Button */}
        <button
          type="button"
          onClick={handlePlayMiniGame}
          className="w-full py-4 px-6 rounded-2xl bg-[#9BD8A7] hover:bg-[#7fc98e] text-[#090D16] text-xl font-extrabold tracking-wide shadow-lg shadow-[#9BD8A7]/25 border-2 border-[#c9f0d0] cursor-pointer transition-colors"
          style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
        >
          ▶ PLAY MINI-GAME!
        </button>
      </div>
    </div>
  );
};
