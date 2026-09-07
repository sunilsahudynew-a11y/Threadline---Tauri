import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  X,
  Volume2,
  VolumeX,
  Award,
  Flame
} from 'lucide-react';

interface SessionTimerProps {
  currentWordCount: number;
}

export type TimerMode = 'countdown' | 'stopwatch';

export const SessionTimer: React.FC<SessionTimerProps> = ({ currentWordCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Word count tracked for this session
  const [startingWordCount, setStartingWordCount] = useState(currentWordCount);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; right: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Update startingWordCount when idle if it hasn't started yet
  useEffect(() => {
    if (!isRunning && secondsElapsed === 0 && secondsRemaining === targetMinutes * 60) {
      setStartingWordCount(currentWordCount);
    }
  }, [currentWordCount, isRunning, secondsElapsed, secondsRemaining, targetMinutes]);

  // Words added in current session
  const sessionWords = Math.max(0, currentWordCount - startingWordCount);

  // Calculate Words Per Minute (WPM)
  const wordsPerMinute = useMemo(() => {
    const activeTimeInMinutes =
      mode === 'countdown'
        ? (targetMinutes * 60 - secondsRemaining) / 60
        : secondsElapsed / 60;
    if (activeTimeInMinutes < 0.2) return 0;
    return Math.round(sessionWords / activeTimeInMinutes);
  }, [mode, targetMinutes, secondsRemaining, secondsElapsed, sessionWords]);

  // Audio chime using Web Audio API on completion
  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.6); // G5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  // Robust timer interval runner
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      if (mode === 'countdown') {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      } else {
        setSecondsElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning, mode]);

  // Handle countdown sprint completion
  useEffect(() => {
    if (mode === 'countdown' && isRunning && secondsRemaining === 0) {
      setIsRunning(false);
      setShowCelebration(true);
      playChime();
    }
  }, [mode, isRunning, secondsRemaining]);

  // Calculate popover coordinates when opening
  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rightMargin = Math.max(16, window.innerWidth - rect.right);
      setPopoverCoords({
        top: rect.bottom + 6,
        right: rightMargin
      });
    }
  };

  const handleToggleOpen = () => {
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  const handleStart = () => {
    if (!isRunning && (secondsElapsed === 0 || secondsRemaining === targetMinutes * 60)) {
      setStartingWordCount(currentWordCount);
    }
    setIsRunning(true);
    setShowCelebration(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleTogglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) {
      handlePause();
    } else {
      handleStart();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(targetMinutes * 60);
    setSecondsElapsed(0);
    setStartingWordCount(currentWordCount);
    setShowCelebration(false);
  };

  const handleSelectPreset = (minutes: number) => {
    setMode('countdown');
    setTargetMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setIsRunning(false);
    setStartingWordCount(currentWordCount);
    setShowCelebration(false);
  };

  const handleSelectStopwatch = () => {
    setMode('stopwatch');
    setSecondsElapsed(0);
    setIsRunning(false);
    setStartingWordCount(currentWordCount);
    setShowCelebration(false);
  };

  // Time format helper (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const displayTime =
    mode === 'countdown' ? formatTime(secondsRemaining) : formatTime(secondsElapsed);

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      {/* TRIGGER BADGE WITH QUICK PLAY/PAUSE */}
      <div
        className={`inline-flex items-center rounded-md border text-xs font-mono transition-all select-none ${
          isRunning
            ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
            : 'bg-[#F1EAD9] text-[#7A705F] border-[#E5DEC9] hover:text-[#221E18] hover:bg-[#EAE4D6]'
        }`}
      >
        {/* Quick Play/Pause Action Icon */}
        <button
          type="button"
          onClick={handleTogglePlayPause}
          className={`p-1.5 rounded-l-md cursor-pointer transition-colors flex items-center justify-center ${
            isRunning
              ? 'text-amber-700 hover:bg-amber-100'
              : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#E2DAC3]'
          }`}
          title={isRunning ? 'Pause session timer (click to pause)' : 'Start session timer (click to start)'}
        >
          {isRunning ? (
            <Pause size={12} className="fill-current text-amber-700" />
          ) : (
            <Play size={12} className="fill-current text-[#7A705F]" />
          )}
        </button>

        {/* Time Display and Popover Opener */}
        <button
          type="button"
          onClick={handleToggleOpen}
          className="flex items-center gap-1.5 py-1 pr-2 pl-0.5 cursor-pointer rounded-r-md"
          title="Session Writing Timer & Sprint Settings"
        >
          <span className="font-semibold tabular-nums text-xs">{displayTime}</span>
          {sessionWords > 0 && (
            <span className="text-[10px] text-emerald-700 font-semibold hidden sm:inline">
              +{sessionWords}w
            </span>
          )}
          <ChevronDown size={11} className={isRunning ? 'text-amber-700' : 'text-[#7A705F]'} />
        </button>
      </div>

      {/* POPOVER CARD VIA PORTAL (GUARANTEED NEVER CLIPPED BY ANY PARENT OVERFLOW OR Z-INDEX) */}
      {isOpen &&
        popoverCoords &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${popoverCoords.top}px`,
              right: `${popoverCoords.right}px`,
              zIndex: 9999
            }}
            className="w-80 bg-[#FAF6EE] rounded-xl border border-[rgba(34,30,24,0.15)] shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 text-[#221E18] select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[rgba(34,30,24,0.1)]">
              <div className="flex items-center gap-1.5">
                <Timer size={15} className="text-[#B54B32]" />
                <span className="text-xs font-serif font-semibold text-[#221E18]">
                  Writing Session Sprint
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 text-[#7A705F] hover:text-[#221E18] rounded cursor-pointer transition-colors"
                  title={soundEnabled ? 'Completion chime enabled (click to mute)' : 'Completion chime muted (click to unmute)'}
                >
                  {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-[#7A705F] hover:text-[#221E18] rounded cursor-pointer transition-colors"
                  title="Close timer panel"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* CELEBRATION BANNER */}
            {showCelebration && (
              <div className="mb-3 p-2.5 bg-amber-100 border border-amber-300 rounded-lg text-xs text-amber-950 flex items-center gap-2 animate-in zoom-in-95">
                <Award size={18} className="text-[#B54B32] shrink-0" />
                <div>
                  <div className="font-semibold text-[#221E18]">Sprint Finished!</div>
                  <div className="text-[11px] text-[#7A705F]">
                    You drafted {sessionWords} words in this session. Well done!
                  </div>
                </div>
              </div>
            )}

            {/* BIG DISPLAY TIME */}
            <div className="text-center my-3 py-1 bg-[#F1EAD9]/60 rounded-lg border border-[#E5DEC9]">
              <div className="text-4xl font-mono font-bold tracking-tight text-[#221E18] tabular-nums">
                {displayTime}
              </div>
              <div className="text-[11px] font-mono text-[#7A705F] mt-1 flex items-center justify-center gap-2">
                <span className="capitalize font-semibold">{mode}</span>
                <span>·</span>
                <span className="text-emerald-800 font-semibold">+{sessionWords} words</span>
                {wordsPerMinute > 0 && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{wordsPerMinute} wpm</span>
                  </>
                )}
              </div>
            </div>

            {/* CONTROLS */}
            <div className="flex items-center justify-center gap-2 my-3">
              {isRunning ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B54B32] text-[#FAF6EE] rounded-lg text-xs font-semibold hover:bg-[#9E3E27] transition-colors shadow-xs cursor-pointer"
                >
                  <Pause size={14} /> Pause Sprint
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#221E18] text-[#FAF6EE] rounded-lg text-xs font-semibold hover:bg-[#35505F] transition-colors shadow-xs cursor-pointer"
                >
                  <Play size={14} />
                  {secondsElapsed > 0 || (mode === 'countdown' && secondsRemaining < targetMinutes * 60)
                    ? 'Resume Sprint'
                    : 'Start Sprint'}
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="p-2 border border-[#E5DEC9] bg-[#FAF6EE] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded-lg text-xs transition-colors cursor-pointer"
                title="Reset session timer and words"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* SPRINT PRESETS */}
            <div className="pt-2.5 border-t border-[rgba(34,30,24,0.1)]">
              <span className="text-[10px] font-mono text-[#7A705F] uppercase tracking-wider block mb-1.5 font-medium">
                Sprint Presets
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
                {[15, 25, 45].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectPreset(m)}
                    className={`py-1.5 rounded-md text-center transition-colors cursor-pointer ${
                      mode === 'countdown' && targetMinutes === m
                        ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                        : 'bg-[#F1EAD9] text-[#221E18] hover:bg-[#E5DEC9]'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSelectStopwatch}
                  className={`py-1.5 rounded-md text-center transition-colors cursor-pointer ${
                    mode === 'stopwatch'
                      ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                      : 'bg-[#F1EAD9] text-[#221E18] hover:bg-[#E5DEC9]'
                  }`}
                >
                  Count Up
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
