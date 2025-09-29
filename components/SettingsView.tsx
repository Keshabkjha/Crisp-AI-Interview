
import React, { useState, useEffect } from 'react';
import { useInterviewState, useInterviewDispatch } from '../hooks/useInterviewState';
import { InterviewSettings, QuestionSource, QuestionDifficulty } from '../types';
import { DEFAULT_INTERVIEW_SETTINGS } from '../constants';
import { CheckCircleIcon } from './icons';

export const SettingsView: React.FC = () => {
  const { interviewSettings } = useInterviewState();
  const dispatch = useInterviewDispatch();
  const [settings, setSettings] = useState<InterviewSettings>(interviewSettings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(interviewSettings);
  }, [interviewSettings]);

  const handleDifficultyChange = (difficulty: QuestionDifficulty, value: string) => {
    const newCount = Math.max(0, Math.min(10, parseInt(value, 10) || 0)); // Clamp value between 0 and 10
    setSettings(prev => ({
        ...prev,
        difficultyDistribution: {
            ...prev.difficultyDistribution,
            [difficulty]: newCount,
        }
    }));
  };

  const handleTimeLimitChange = (difficulty: QuestionDifficulty, unit: 'minutes' | 'seconds', value: string) => {
    // --- DEPLOYMENT POLISH: Robust input handling ---
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericValue) && value !== '') return; // Ignore non-numeric input that isn't an empty string

    setSettings(prev => {
        const currentTotalSeconds = prev.timeLimits[difficulty] || 0;
        
        let minutes = Math.floor(currentTotalSeconds / 60);
        let seconds = currentTotalSeconds % 60;

        if (unit === 'minutes') {
            minutes = isNaN(numericValue) ? 0 : Math.max(0, Math.min(15, numericValue));
        } else {
            seconds = isNaN(numericValue) ? 0 : Math.max(0, Math.min(59, numericValue));
        }

        const newTotalSeconds = (minutes * 60) + seconds;

        return {
            ...prev,
            timeLimits: {
                ...prev.timeLimits,
                [difficulty]: newTotalSeconds,
            }
        };
    });
  };
  
  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    const newSettings = DEFAULT_INTERVIEW_SETTINGS;
    setSettings(newSettings);
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };
  
  const totalQuestions = Object.values(settings.difficultyDistribution).reduce((sum, count) => sum + (count || 0), 0);

  
  const RadioButton = ({ id, value, checked, onChange, label, description }: any) => (
    <label
      htmlFor={id}
      className={`relative flex flex-col justify-between p-4 h-full bg-slate-800 border-2 rounded-lg cursor-pointer transition-all duration-200 
                  ${checked 
                    ? 'border-cyan-500 bg-cyan-900/30' 
                    : 'border-slate-700 hover:border-slate-500'
                  }`}
    >
      <input
        id={id}
        type="radio"
        value={value}
        name="questionSource"
        className="hidden"
        checked={checked}
        onChange={onChange}
        aria-describedby={`${id}-description`}
      />
      {checked && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 border-2 border-slate-900/50">
          <CheckCircleIcon className="h-4 w-4 text-white" />
        </div>
      )}
      <div className="text-sm">
        <div className={`font-semibold ${checked ? 'text-cyan-400' : 'text-slate-200'}`}>
          {label}
        </div>
        <div id={`${id}-description`} className="text-slate-400 mt-1">{description}</div>
      </div>
    </label>
  );


  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Interview Settings</h2>
      <div className="space-y-8">
        
        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50">
            <label htmlFor="topics" className="block text-lg font-semibold text-slate-200 mb-2">Interview Topics</label>
            <p className="text-slate-400 mb-3 text-sm">Define the core focus for the AI to generate relevant questions.</p>
            <input
                id="topics"
                type="text"
                value={settings.topics}
                onChange={(e) => setSettings(prev => ({ ...prev, topics: e.target.value }))}
                placeholder="e.g., React Hooks, Node.js performance"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
        </div>

        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Question Distribution</h3>
            <p className="text-slate-400 mb-3 text-sm">Set the number of main questions for each difficulty level.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="easy-questions" className="block text-sm font-medium text-green-400 mb-1">Easy</label>
                    <input id="easy-questions" type="number" min="0" max="10" value={settings.difficultyDistribution[QuestionDifficulty.Easy]} onChange={(e) => handleDifficultyChange(QuestionDifficulty.Easy, e.target.value)}
                           className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"/>
                </div>
                <div>
                    <label htmlFor="medium-questions" className="block text-sm font-medium text-yellow-400 mb-1">Medium</label>
                    <input id="medium-questions" type="number" min="0" max="10" value={settings.difficultyDistribution[QuestionDifficulty.Medium]} onChange={(e) => handleDifficultyChange(QuestionDifficulty.Medium, e.target.value)}
                           className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"/>
                </div>
                <div>
                    <label htmlFor="hard-questions" className="block text-sm font-medium text-red-400 mb-1">Hard</label>
                    <input id="hard-questions" type="number" min="0" max="10" value={settings.difficultyDistribution[QuestionDifficulty.Hard]} onChange={(e) => handleDifficultyChange(QuestionDifficulty.Hard, e.target.value)}
                           className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
            </div>
            <p className="text-right mt-3 font-semibold text-slate-300">Total Questions: <span className="text-cyan-400 text-lg">{totalQuestions}</span></p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Time Limits per Question</h3>
            <p className="text-slate-400 mb-3 text-sm">Set the time limit for each question difficulty in MM:SS format.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {([QuestionDifficulty.Easy, QuestionDifficulty.Medium, QuestionDifficulty.Hard] as QuestionDifficulty[]).map(difficulty => {
                    const totalSeconds = settings.timeLimits[difficulty] || 0;
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    const colors = {
                        Easy: { text: 'text-green-400', ring: 'focus:ring-green-500' },
                        Medium: { text: 'text-yellow-400', ring: 'focus:ring-yellow-500' },
                        Hard: { text: 'text-red-400', ring: 'focus:ring-red-500' },
                    };
                    const { text, ring } = colors[difficulty];

                    return (
                        <div key={difficulty}>
                            <label htmlFor={`${difficulty.toLowerCase()}-minutes`} className={`block text-sm font-medium ${text} mb-1 capitalize`}>{difficulty}</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    id={`${difficulty.toLowerCase()}-minutes`} 
                                    type="text"
                                    value={String(minutes).padStart(2, '0')} 
                                    onChange={(e) => handleTimeLimitChange(difficulty, 'minutes', e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                    className={`w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-center focus:outline-none focus:ring-2 ${ring}`}
                                    aria-label={`${difficulty} minutes`}
                                    maxLength={2}
                                />
                                <span className="text-slate-400 font-bold">:</span>
                                <input 
                                    id={`${difficulty.toLowerCase()}-seconds`} 
                                    type="text"
                                    value={String(seconds).padStart(2, '0')}
                                    onChange={(e) => handleTimeLimitChange(difficulty, 'seconds', e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                    className={`w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-center focus:outline-none focus:ring-2 ${ring}`}
                                    aria-label={`${difficulty} seconds`}
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
        
        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Question Generation Source</h3>
            <p className="text-slate-400 mb-3 text-sm">Choose how the AI should source questions. A resume is required for resume-based modes.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <RadioButton 
                    id="source-topics" 
                    value={QuestionSource.TopicsOnly} 
                    checked={settings.questionSource === QuestionSource.TopicsOnly}
                    onChange={(e: any) => setSettings(prev => ({ ...prev, questionSource: e.target.value }))}
                    label="Topics Only"
                    description="Generates general questions based on the topics defined above."
                />
                 <RadioButton 
                    id="source-resume" 
                    value={QuestionSource.ResumeOnly} 
                    checked={settings.questionSource === QuestionSource.ResumeOnly}
                    onChange={(e: any) => setSettings(prev => ({ ...prev, questionSource: e.target.value }))}
                    label="Resume Only"
                    description="Analyzes the resume to ask specifically about listed skills and experience."
                />
                 <RadioButton 
                    id="source-both" 
                    value={QuestionSource.TopicsAndResume} 
                    checked={settings.questionSource === QuestionSource.TopicsAndResume}
                    onChange={(e: any) => setSettings(prev => ({ ...prev, questionSource: e.target.value }))}
                    label="Topics & Resume"
                    description="Combines topics with the resume for highly tailored questions. (Recommended)"
                />
            </div>
        </div>

        <div className="flex flex-wrap justify-end items-center gap-4 pt-4">
          <button onClick={handleReset} className="bg-slate-600 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors">
            Reset to Defaults
          </button>
          <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 min-w-[140px] justify-center">
            {isSaved ? <><CheckCircleIcon className="w-5 h-5"/> Saved!</> : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
