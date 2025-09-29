import React from 'react';
import { BotIcon } from './icons';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <BotIcon className="w-8 h-8 text-blue-600" />
      <span className="text-xl font-bold text-gray-800">AI Interviewer</span>
    </div>
  );
}
