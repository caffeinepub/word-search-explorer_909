import { useEffect, useRef, useState, useCallback } from "react";
import { Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { useAudio } from "../hooks/useAudio";
import {
  TIMER_WARNING_THRESHOLD,
  TIMER_CRITICAL_THRESHOLD,
} from "../utils/themes";

interface TimerDisplayProps {
  initialSeconds: number;
  isRunning: boolean;
  onTimeUp: () => void;
  onTimeChange?: (remaining: number) => void;
}

export function TimerDisplay({
  initialSeconds,
  isRunning,
  onTimeUp,
  onTimeChange,
}: TimerDisplayProps) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const { playTimerTick, playTimeUp } = useAudio();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const onTimeChangeRef = useRef(onTimeChange);

  // Keep refs updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    onTimeChangeRef.current = onTimeChange;
  }, [onTimeChange]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;

        if (next <= TIMER_CRITICAL_THRESHOLD && next > 0) {
          playTimerTick();
        }

        if (next <= 0) {
          clearTimer();
          playTimeUp();
          onTimeUpRef.current();
          return 0;
        }

        onTimeChangeRef.current?.(next);
        return next;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer, playTimerTick, playTimeUp]);

  // Pause timer when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        clearTimer();
      } else if (!document.hidden && isRunning && remaining > 0) {
        // Restart the interval when tab becomes visible
        intervalRef.current = setInterval(() => {
          setRemaining((prev) => {
            const next = prev - 1;

            if (next <= TIMER_CRITICAL_THRESHOLD && next > 0) {
              playTimerTick();
            }

            if (next <= 0) {
              clearTimer();
              playTimeUp();
              onTimeUpRef.current();
              return 0;
            }

            onTimeChangeRef.current?.(next);
            return next;
          });
        }, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, remaining, clearTimer, playTimerTick, playTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const isWarning =
    remaining <= TIMER_WARNING_THRESHOLD &&
    remaining > TIMER_CRITICAL_THRESHOLD;
  const isCritical = remaining <= TIMER_CRITICAL_THRESHOLD;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm font-semibold transition-colors",
        !isWarning && !isCritical && "bg-muted text-muted-foreground",
        isWarning &&
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        isCritical &&
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse",
      )}
    >
      <Clock className="w-4 h-4" />
      <span>{timeString}</span>
    </div>
  );
}
