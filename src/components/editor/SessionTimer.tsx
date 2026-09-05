import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Flame,
  Award
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

  // Baseline word count when session started
  const [startingWordCount, setStartingWordCount] = useState(currentWordCount);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Words added in current session
  const sessionWords = Math.max(0, currentWordCount - startingWordCount);

  // Calculate WPM
  const wordsPerMinute = useMemo(() => {
    const activeTimeInMinutes =
      mode === 'countdown'
        ? (targetMinutes * 60 - secondsRemaining) / 60
        : secondsElapsed / 60;
    if (activeTimeInMinutes < 0.2) return 0;
    return Math.round(sessionWords / activeTimeInMinutes);
  }, [mode, targetMinutes, secondsRemaining, secondsElapsed, sessionWords]);

  // Gentle audio chime using Web Audio API (no external asset required)
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
      // AudioContext unavailable or blocked by browser
    }
  };

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'countdown') {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              setIsRunning(false);
              setShowCelebration(true);
              playChime();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setSecondsElapsed((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, soundEnabled]);

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
    <div className="relative inline-block" ref={containerRef}>
      {/* TRIGGER BADGE */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono transition-all cursor-pointer border ${
          isRunning
            ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
            : 'bg-[#F9F8F6] text-[#736F66] border-[#EBE8E2] hover:text-[#1A1814] hover:bg-[#F2EFE9]'
        }`}
        title="Session Writing Timer & Sprint"
      >
        <Timer size={13} className={isRunning ? 'text-amber-600 animate-pulse' : 'text-[#8C887F]'} />
        <span className="font-semibold tabular-nums">{displayTime}</span>
        {sessionWords > 0 && (
          <span className="text-[10px] text-emerald-700 font-semibold hidden sm:inline">
            +{sessionWords}w
          </span>
        )}
        <ChevronDown size={10} className="text-[#8C887F]" />
      </button>

      {/* POPOVER CARD */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white/98 backdrop-blur-md rounded-xl border border-[#E5E1D8] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#F0ECE1]">
            <div className="flex items-center gap-1.5">
              <Timer size={15} className="text-amber-700" />
              <span className="text-xs font-serif font-semibold text-[#1A1814]">
                Writing Session Sprint
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 text-[#8C887F] hover:text-[#1A1814] rounded cursor-pointer"
                title={soundEnabled ? 'Chime on sprint finish (Enabled)' : 'Chime (Muted)'}
              >
                {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#8C887F] hover:text-[#1A1814] rounded cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* CELEBRATION BANNER */}
          {showCelebration && (
            <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2 animate-in zoom-in-95">
              <Award size={18} className="text-amber-600 shrink-0" />
              <div>
                <div className="font-semibold">Sprint Finished!</div>
                <div className="text-[11px] text-amber-800">
                  You drafted {sessionWords} words in this session. Take a gentle breath.
                </div>
              </div>
            </div>
          )}

          {/* BIG DISPLAY TIME */}
          <div className="text-center my-3">
            <div className="text-4xl font-mono font-bold tracking-tight text-[#1A1814] tabular-nums">
              {displayTime}
            </div>
            <div className="text-[11px] font-mono text-[#8C887F] mt-1 flex items-center justify-center gap-2">
              <span className="capitalize">{mode} Mode</span>
              <span>·</span>
              <span className="text-emerald-700 font-semibold">+{sessionWords} words</span>
              {wordsPerMinute > 0 && (
                <>
                  <span>·</span>
                  <span>{wordsPerMinute} wpm</span>
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
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
              >
                <Pause size={14} /> Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2D2A26] text-white rounded-lg text-xs font-semibold hover:bg-[#1A1814] transition-colors shadow-xs cursor-pointer"
              >
                <Play size={14} /> {secondsElapsed > 0 || secondsRemaining < targetMinutes * 60 ? 'Resume' : 'Start'}
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 border border-[#E5E1D8] text-[#736F66] hover:text-[#1A1814] hover:bg-[#F2EFE9] rounded-lg text-xs transition-colors cursor-pointer"
              title="Reset session timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* PRESETS */}
          <div className="pt-2 border-t border-[#F0ECE1]">
            <span className="text-[10px] font-mono text-[#AAA69F] uppercase tracking-wider block mb-1.5">
              Sprint Presets
            </span>
            <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
              {[15, 25, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectPreset(m)}
                  className={`py-1 rounded text-center transition-colors cursor-pointer ${
                    mode === 'countdown' && targetMinutes === m
                      ? 'bg-[#2D2A26] text-white font-semibold'
                      : 'bg-[#F9F8F6] text-[#3C3933] hover:bg-[#EBE8E2]'
                  }`}
                >
                  {m}m
                </button>
              ))}
              <button
                type="button"
                onClick={handleSelectStopwatch}
                className={`py-1 rounded text-center transition-colors cursor-pointer ${
                  mode === 'stopwatch'
                    ? 'bg-[#2D2A26] text-white font-semibold'
                    : 'bg-[#F9F8F6] text-[#3C3933] hover:bg-[#EBE8E2]'
                }`}
              >
                Stopwatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
