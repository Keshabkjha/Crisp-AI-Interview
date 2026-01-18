
import { useState, useRef } from 'react';
import { useInterviewState } from '../hooks/useInterviewState';
import { extractTextFromFile } from '../services/resumeParser';
import { extractInfoFromResume } from '../services/geminiService';
import { LoadingIcon, UploadIcon } from './icons';
import { PhotoCapture } from './PhotoCapture';
import { CandidateProfile } from '../types';

export function InterviewSetup() {
  const { actions, state } = useInterviewState();
  const { addCandidate } = actions;
  const { isOnline } = state;

  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({
    name: '',
    email: '',
    phone: '',
    resumeText: '',
    photo: null,
    skills: [],
     yearsOfExperience: 0,
    keyProjects: [],
    technologies: [],
  });
  const [topics, setTopics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError('');
    try {
      const text = await extractTextFromFile(file);
      const extractedInfo = isOnline ? await extractInfoFromResume(text) : {};
      const extractedSkills = Array.isArray(extractedInfo.skills)
        ? extractedInfo.skills.filter(
            (skill): skill is string =>
              typeof skill === 'string' && skill.trim().length > 0
          )
        : [];
      setProfile((prev) => ({
        ...prev,
        resumeText: text,
        ...extractedInfo,
      }));
      if (extractedSkills.length > 0) {
        setTopics(extractedSkills.join(', '));
      }
    } catch (err) {
      setError(
        'Failed to parse file. Please try another file or paste the text manually.'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleStartInterview = () => {
    const parsedTopics = topics
      .split(',')
      .map((topic) => topic.trim())
      .filter(Boolean);
    if (!profile.name || (!profile.resumeText && parsedTopics.length === 0)) {
        setError('Please provide your name and either a resume or some topics to discuss.');
        return;
    }
    addCandidate(profile as CandidateProfile, {
      ...state.interviewSettings,
      topics: parsedTopics,
    });
  };

  const handleInputChange = (field: keyof CandidateProfile, value: string) => {
      setProfile(prev => ({...prev, [field]: value}));
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-100">
          Prepare for Your AI Interview
        </h1>
        <p className="text-center text-slate-400 mb-8">
          Provide your details to get started. The AI will tailor questions
          based on your profile.
        </p>

         {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Input */}
            <div>
                 <div className="mb-6">
                    <div className="flex border-b border-slate-700">
                        <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'upload' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400'}`}>Upload Resume</button>
                        <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'manual' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400'}`}>Paste Manually</button>
                    </div>
                </div>

                {activeTab === 'upload' && (
                    <div 
                        className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx" />
                        <UploadIcon className="w-10 h-10 mx-auto text-slate-500 mb-4" />
                        <p className="text-slate-300">
                            <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF or DOCX</p>
                    </div>
                )}

                 {activeTab === 'manual' && (
                     <div>
                        <label htmlFor="resumeText" className="block text-sm font-medium text-slate-300 mb-2">
                            Paste Resume Text
                        </label>
                         <textarea
                            id="resumeText"
                            rows={8}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            placeholder="Paste your full resume text here..."
                            value={profile.resumeText}
                            onChange={(e) => handleInputChange('resumeText', e.target.value)}
                         />
                     </div>
                 )}

                 <div className="mt-4">
                    <label htmlFor="topics" className="block text-sm font-medium text-slate-300 mb-2">
                        Topics to Discuss
                    </label>
                    <input 
                        type="text"
                        id="topics"
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        placeholder="e.g., React, Node.js, System Design"
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                    />
                 </div>
            </div>

            {/* Right Column: Profile */}
            <div>
                 <div className="space-y-4">
                     <PhotoCapture onPhotoTaken={(p) => setProfile(prev => ({...prev, photo: p}))} />
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                        <input type="text" id="name" value={profile.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                     </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input type="email" id="email" value={profile.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                     </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                        <input type="tel" id="phone" value={profile.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                     </div>
                 </div>
            </div>
        </div>
        
        <div className="mt-8">
            <button
                onClick={handleStartInterview}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-600"
            >
                {isLoading ? <><LoadingIcon className="w-5 h-5"/> Analyzing Profile...</> : 'Start Interview'}
            </button>
        </div>
         {!isOnline && (
            <div className="mt-4 text-center text-yellow-400 text-sm bg-yellow-500/10 p-2 rounded-md">
                You are currently offline. The interview will use a standard set of questions.
            </div>
        )}
      </div>
    </div>
  );
}
