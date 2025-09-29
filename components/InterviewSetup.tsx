import React, { useState, useCallback } from 'react';
import { useInterviewDispatch, useInterviewState } from '../hooks/useInterviewState';
import { extractTextFromFile } from '../services/resumeParser';
import { PhotoCapture } from './PhotoCapture';
import { FileTextIcon, BrainCircuitIcon } from './icons';
import { QuestionSource, CandidateProfile } from '../types';
import { extractInfoFromResume } from '../services/geminiService';

type SetupStage = 'initial' | 'parsing' | 'manualEntry';

export const InterviewSetup: React.FC = () => {
    const dispatch = useInterviewDispatch();
    const { interviewSettings, isOffline } = useInterviewState();
    const [profile, setProfile] = useState<Omit<CandidateProfile, 'resumeText'>>({
        name: '',
        email: '',
        phone: '',
        skills: '',
        photoDataUrl: null,
        yearsOfExperience: null,
        keyProjects: null,
        technologies: null,
    });
    const [resumeText, setResumeText] = useState<string | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [stage, setStage] = useState<SetupStage>('initial');
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileDrop = useCallback(async (file: File) => {
        if (file) {
            setResumeFile(file);
            setStage('parsing');
            setError(null);
            try {
                const text = await extractTextFromFile(file);
                setResumeText(text);

                if (isOffline) {
                    setError("Offline: Could not analyze resume. Please enter details manually.");
                    setStage('manualEntry');
                    return;
                }

                const extractedInfo = await extractInfoFromResume(text);
                setProfile(prev => ({ ...prev, ...extractedInfo }));
                setStage('manualEntry');
            } catch (err: any) {
                setError(err.message + " Please enter details manually.");
                setStage('manualEntry');
            }
        }
    }, [isOffline]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFileDrop(e.target.files[0]);
        }
    };
    
    const handleDragEvents = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragover') setIsDragOver(true);
        if (e.type === 'dragleave' || e.type === 'drop') setIsDragOver(false);
        if (e.type === 'drop') handleFileDrop(e.dataTransfer.files[0]);
    }

    const handleProfileChange = (field: keyof Omit<CandidateProfile, 'resumeText' | 'photoDataUrl' | 'yearsOfExperience' | 'keyProjects' | 'technologies'>, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.name.trim()) {
            setError("Candidate name is required.");
            return;
        }

        if (interviewSettings.questionSource !== QuestionSource.TopicsOnly && !resumeText) {
             setError("A resume is required for the selected question source setting.");
             return;
        }
        
        setIsStarting(true);
        setError(null);
        
        try {
            dispatch({
                type: 'CREATE_AND_START_INTERVIEW',
                payload: { profile: { ...profile, resumeText } }
            });

        } catch (err: any) {
            setError(err.message);
            setIsStarting(false);
        }
    };

    if (stage === 'parsing') { /* UI unchanged */ return (
        <div className="text-center p-12 bg-slate-800 rounded-lg">
            <BrainCircuitIcon className="w-16 h-16 text-cyan-400 animate-pulse mx-auto mb-4"/>
            <h3 className="text-xl font-semibold text-slate-200">Analyzing Resume...</h3>
            <p className="text-slate-400">The AI is extracting key information.</p>
        </div>
    );}

    if (stage === 'initial') { /* UI unchanged */ return (
        <div className="max-w-xl mx-auto p-8 bg-slate-800/40 rounded-lg border border-slate-700/50 text-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Start a New Interview</h2>
            <p className="text-slate-400 mb-6">Welcome to your AI-powered interview assistant. Please upload a candidate's resume to begin the automated screening process.</p>
            <label 
                htmlFor="resume-upload" 
                onDragOver={handleDragEvents}
                onDragLeave={handleDragEvents}
                onDrop={handleDragEvents}
                className={`flex flex-col items-center justify-center w-full h-48 px-4 transition bg-slate-700 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer hover:bg-slate-600/50 hover:border-slate-500 ${isDragOver ? 'border-cyan-500 bg-cyan-900/20' : ''}`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileTextIcon className={`w-10 h-10 mb-3 ${isDragOver ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">PDF or DOCX</p>
                </div>
                <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
            </label>
        </div>
    );}

    return (
        <div className="max-w-2xl mx-auto p-8 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">Confirm Candidate Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                 {resumeFile && (
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center text-sm">
                        <span className="font-semibold text-cyan-400">Resume:</span> <span className="text-slate-300">{resumeFile.name}</span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Candidate Name</label>
                        <input type="text" id="name" value={profile.name} onChange={e => handleProfileChange('name', e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input type="email" id="email" value={profile.email} onChange={e => handleProfileChange('email', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                    <input type="tel" id="phone" value={profile.phone} onChange={e => handleProfileChange('phone', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                     <label htmlFor="skills" className="block text-sm font-medium text-slate-300 mb-1">Key Skills (comma-separated)</label>
                     <textarea id="skills" value={profile.skills} onChange={e => handleProfileChange('skills', e.target.value)} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                
                <PhotoCapture onPhotoTaken={(dataUrl) => setProfile(p => ({...p, photoDataUrl: dataUrl || null }))} />

                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm text-center">{error}</p>}

                <button type="submit" disabled={isStarting || !profile.name.trim()} className="w-full flex justify-center items-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isStarting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                            Starting Interview...
                        </>
                    ) : (
                        <>
                            <BrainCircuitIcon className="w-6 h-6" />
                            Start AI Interview
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};