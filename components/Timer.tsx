
import { useState, useEffect } from 'react';

interface TimerProps {
  duration: number; // in milliseconds
  onComplete: () => void;
}

export function Timer({ duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration); // Reset timer when duration changes (new question)
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1000);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onComplete]);

  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div className="text-lg font-mono bg-slate-700 px-3 py-1 rounded-md text-cyan-400">
      <span>{String(minutes).padStart(2, '0')}</span>:
      <span>{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}
