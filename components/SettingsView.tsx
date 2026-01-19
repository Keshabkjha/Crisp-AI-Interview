import { useState, useMemo } from 'react';
import { useInterviewState } from '../hooks/useInterviewState';
import { DEFAULT_INTERVIEW_SETTINGS } from '../constants';
import { InterviewSettings, QuestionSource } from '../types';

export function SettingsView() {
  const { state, actions } = useInterviewState();
  const { interviewSettings } = state;
  const { updateInterviewSettings } = actions;
  
  const [settings, setSettings] = useState<InterviewSettings>(interviewSettings);
  const [saved, setSaved] = useState(false);
  const [topicsInput, setTopicsInput] = useState(
    settings.topics.join(', ')
  );

  const totalQuestions = useMemo(() =>
    Object.values(settings.difficultyDistribution).reduce((sum, count) => sum + count, 0),
    [settings.difficultyDistribution]
  );
  
  const handleDistributionChange = (difficulty: 'easy' | 'medium' | 'hard', value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 0) {
      setSettings(prev => ({
        ...prev,
        difficultyDistribution: {
          ...prev.difficultyDistribution,
          [difficulty]: count,
        },
      }));
    }
  };

  const handleTimeChange = (difficulty: 'easy' | 'medium' | 'hard', unit: 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
        const currentSeconds = settings.timeLimits[difficulty];
        const currentMinutes = Math.floor(currentSeconds / 60);
        const currentRemainingSeconds = currentSeconds % 60;
        
        let newTotalSeconds;
        if (unit === 'minutes') {
            newTotalSeconds = numValue * 60 + currentRemainingSeconds;
        } else {
             if (numValue > 59) return;
             newTotalSeconds = currentMinutes * 60 + numValue;
        }
        
        setSettings(prev => ({
            ...prev,
            timeLimits: { ...prev.timeLimits, [difficulty]: newTotalSeconds }
        }));
    }
  };

  const handleTopicsChange = (value: string) => {
    setTopicsInput(value);
    const parsedTopics = value
      .split(',')
      .map((topic) => topic.trim())
      .filter(Boolean);
    setSettings(prev => ({ ...prev, topics: parsedTopics }));
  };

  const handleSave = () => {
    updateInterviewSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const handleReset = () => {
    setSettings(DEFAULT_INTERVIEW_SETTINGS);
    setTopicsInput(DEFAULT_INTERVIEW_SETTINGS.topics.join(', '));
  };

  const formatTime = (totalSeconds: number) => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return {
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0')
      };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-100 mb-6">
        Interview Settings
      </h1>
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl space-y-8">
        {/* Question Distribution */}
        <div>
          <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">
            Question Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              <div key={diff}>
                <label className="block text-sm font-medium text-slate-300 capitalize mb-1">{diff}</label>
                <input
                  type="number"
                  min="0"
                  value={settings.difficultyDistribution[diff]}
                  onChange={e => handleDistributionChange(diff, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200"
                />
              </div>
            ))}
            <div className="text-center md:mt-6">
                <p className="text-slate-400 text-sm">Total Questions</p>
                <p className="text-2xl font-bold text-cyan-400">{totalQuestions}</p>
            </div>
          </div>
        </div>

        {/* Time Limits */}
        <div>
          <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">
            Time Limits (MM:SS)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['easy', 'medium', 'hard'] as const).map(diff => {
               const { minutes, seconds } = formatTime(settings.timeLimits[diff]);
               return (
                  <div key={diff}>
                    <label className="block text-sm font-medium text-slate-300 capitalize mb-1">{diff}</label>
                    <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={minutes}
                          onChange={e => handleTimeChange(diff, 'minutes', e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 text-center"
                        />
                        <span className="font-bold text-slate-400">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={seconds}
                          onChange={e => handleTimeChange(diff, 'seconds', e.target.value)}
                           className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 text-center"
                        />
                    </div>
                  </div>
              )})}
          </div>
        </div>
        
         {/* Interview Topics */}
         <div>
           <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">
             Interview Topics
           </h2>
           <label htmlFor="topics" className="block text-sm font-medium text-slate-300 mb-2">
             Topics (comma-separated)
           </label>
           <textarea
             id="topics"
             rows={3}
             value={topicsInput}
             onChange={e => handleTopicsChange(e.target.value)}
             className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500"
             placeholder="e.g., React, Node.js, System Design"
           />
           <p className="text-xs text-slate-400 mt-2">
             These topics are used when the question source includes topics.
           </p>
         </div>

         {/* Question Source */}
        <div>
          <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">
            Question Source
          </h2>
           <select 
             value={settings.questionSource}
             onChange={e => setSettings(prev => ({...prev, questionSource: e.target.value as QuestionSource}))}
             className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500"
           >
               <option>Resume & Topics</option>
               <option>Resume Only</option>
               <option>Topics Only</option>
           </select>
        </div>


        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-700">
          <button onClick={handleReset} className="px-4 py-2 bg-slate-600 text-white rounded-md text-sm font-medium hover:bg-slate-700">
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-md text-sm font-medium ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-cyan-600 text-white hover:bg-cyan-700'
            }`}
          >
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
