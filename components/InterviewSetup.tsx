import React, { useState } from 'react';
import { InterviewConfig } from '../types';

interface Props {
  onStart: (config: InterviewConfig) => void;
  isLoading: boolean;
}

const InterviewSetup: React.FC<Props> = ({ onStart, isLoading }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-2 text-center">AI Interview Practice</h1>
        <p className="text-gray-400 mb-8 text-center">
          Paste a job description and your resume to start a tailored mock interview.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-300">Job Description</label>
            <textarea
              className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-300">Your Resume</label>
            <textarea
              className="w-full h-48 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your resume text here, or upload a file."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
        </div>
        <button
          className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => onStart({ jobDescription, resumeText })}
          disabled={!jobDescription || !resumeText || isLoading}
        >
          {isLoading ? 'Setting Up...' : 'Start Interview'}
        </button>
      </div>
    </div>
  );
};

export default InterviewSetup;
