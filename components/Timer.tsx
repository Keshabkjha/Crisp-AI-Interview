import React, { useState, useEffect, useRef } from 'react';
import { ClockIcon } from './icons';

interface TimerProps {
  duration: number; // in seconds
  startTime: number | null; // timestamp when timer started
  onComplete: () => void;
  isRunning: boolean;
}

export const Timer: React.FC<TimerProps> = ({ duration, startTime, onComplete, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onCompleteRef = useRef(onComplete);

  // Keep the onComplete callback ref updated with the latest version
  // This prevents the interval from needing to be reset when the callback changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // This effect synchronizes the timer's display if it's re-rendered mid-countdown
  useEffect(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeLeft(Math.max(0, duration - elapsed));
    } else {
      setTimeLeft(duration);
    }
  }, [duration, startTime]);

  // This effect manages the countdown interval
  useEffect(() => {
    // FIX: Changed NodeJS.Timeout to number, as setInterval in browsers returns a number.
    let intervalId: number | null = null;

    if (isRunning && startTime) {
      const tick = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = duration - elapsed;
        
        if (remaining <= 0) {
          setTimeLeft(0);
          if (intervalId) clearInterval(intervalId);
          onCompleteRef.current(); // Use the ref to call the latest callback
        } else {
          setTimeLeft(remaining);
        }
      };
      
      tick(); // Initial tick to sync immediately
      intervalId = window.setInterval(tick, 1000);
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime, duration]); // onComplete is intentionally omitted

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const timeColor = timeLeft <= 10 ? 'text-red-400' : 'text-slate-300';
  const isPulsing = timeLeft <= 10 && timeLeft > 0;

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-semibold px-3 py-1 rounded-full bg-slate-700/50 transition-colors ${timeColor} ${isPulsing ? 'animate-pulse' : ''}`}>
      <ClockIcon className="w-5 h-5" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
