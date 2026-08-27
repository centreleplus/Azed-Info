import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";

interface ChallengeTimerProps {
  currentExerciseIndex: number;
}

export default function ChallengeTimer({ currentExerciseIndex }: ChallengeTimerProps) {
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset and restart the timer whenever the active exercise changes
  useEffect(() => {
    setSeconds(0);
    setIsActive(true);
  }, [currentExerciseIndex]);

  // Effect to manage the interval timer tick
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // Toggle Play/Pause
  const handleToggle = () => {
    setIsActive(!isActive);
  };

  // Reset the current timer to 0
  const handleReset = () => {
    setSeconds(0);
  };

  // Format time as MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-full px-3 py-1 text-xs select-none shadow-xs text-slate-700 dark:text-slate-300 font-medium transition-colors"
      title="Temps écoulé sur ce défi d'algorithmique"
    >
      <div className="flex items-center gap-1.5">
        <Timer size={13} className="text-blue-600 dark:text-purple-400 animate-pulse" />
        <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Chrono :</span>
        <span className="font-mono text-[13px] text-slate-900 dark:text-slate-100 font-semibold tracking-tight tabular-nums w-12">
          {formatTime(seconds)}
        </span>
      </div>

      {/* Active state pulsing dot */}
      <span className="relative flex h-2 w-2 mr-0.5">
        {isActive ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
        )}
      </span>

      {/* Control Buttons */}
      <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
        <button
          type="button"
          onClick={handleToggle}
          className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-750 active:scale-90 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
          title={isActive ? "Pause" : "Démarrer"}
        >
          {isActive ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-750 active:scale-90 transition-all text-slate-650 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
          title="Réinitialiser le chrono"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
