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

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeLeft(Math.max(0, duration - elapsed));
    } else {
      setTimeLeft(duration);
    }
  }, [duration, startTime]);

  useEffect(() => {
    let intervalId: number | null = null;

    if (isRunning && startTime) {
      const tick = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = duration - elapsed;
        
        if (remaining <= 0) {
          setTimeLeft(0);
          if (intervalId) clearInterval(intervalId);
          onCompleteRef.current();
        } else {
          setTimeLeft(remaining);
        }
      };
      
      tick();
      intervalId = window.setInterval(tick, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime, duration]);

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