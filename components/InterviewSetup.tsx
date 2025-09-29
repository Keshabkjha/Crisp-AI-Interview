import React, { useState } from 'react';
import { generateInterviewQuestions } from '../services/geminiService';
import { parseResume } from '../services/resumeParser';
import { LoadingIcon } from './icons';

interface InterviewSetupProps {
  onSubmit: (details: {
    intervieweeName: string;
    jobDescription: string;
    resumeText: string;
    questions: string[];
  }) => void;
}

export function InterviewSetup({ onSubmit }: InterviewSetupProps) {
  const [name, setName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAutofillName = async () => {
    if (resumeText && !name) {
      const parsedData = await parseResume(resumeText);
      if (parsedData?.name) {
        setName(parsedData.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription || !resumeText) {
      setError('Please provide a job description and a resume.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const questions = await generateInterviewQuestions(
        jobDescription,
        resumeText
      );
      if (questions.length === 0) {
        setError('Could not generate questions. Please try again.');
        setIsLoading(false);
        return;
      }
      onSubmit({
        intervieweeName: name || 'Candidate',
        jobDescription,
        resumeText,
        questions,
      });
    } catch (e) {
      setError('An error occurred while setting up the interview.');
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Setup Your Interview
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="job-desc"
              className="block text-sm font-medium text-gray-700"
            >
              Job Description
            </label>
            <textarea
              id="job-desc"
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste the job description here..."
              required
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="resume"
              className="block text-sm font-medium text-gray-700"
            >
              Your Resume
            </label>
            <textarea
              id="resume"
              rows={10}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              onBlur={handleAutofillName}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste your resume text here"
              required
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Your Name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Jane Doe (can be auto-filled from resume)"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isLoading ? (
              <LoadingIcon className="w-5 h-5" />
            ) : (
              'Start Interview'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
