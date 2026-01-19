
import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useInterviewState } from '../hooks/useInterviewState';
import { extractTextFromFile } from '../services/resumeParser';
import { extractInfoFromResume } from '../services/geminiService';
import { LoadingIcon, UploadIcon } from './icons';
import { PhotoCapture } from './PhotoCapture';
import { CandidateProfile } from '../types';

// Limit the PDF preview scale to avoid rendering extremely large canvases.
const MAX_PDF_SCALE = 10;
// Use a taller preview area to keep the PDF content readable while scrolling.
const PDF_PREVIEW_HEIGHT_CLASS = 'h-64';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Returns undefined for empty or whitespace-only strings to preserve existing user input during merge.
// This ensures parsed empty values don't overwrite user-entered data.
const normalizeContactValue = (value?: string) => value?.trim() || undefined;

const readFileAsDataUrl = (file: File) =>
  new Promise<string | undefined>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : undefined);
    };
    reader.onerror = () => {
      console.error('Failed to read resume file', reader.error);
      resolve(undefined);
    };
    reader.readAsDataURL(file);
  });

/**
 * Separates contact values from other extracted profile data and normalizes them.
 */
const splitExtractedProfile = (info: Partial<CandidateProfile>) => {
  const { name, email, phone, ...profile } = info;
  return {
    contact: {
      name: normalizeContactValue(name),
      email: normalizeContactValue(email),
      phone: normalizeContactValue(phone),
    },
    profile,
  };
};

export function InterviewSetup() {
  const { actions, state } = useInterviewState();
  const { addCandidate } = actions;
  const { currentView, interviewSettings, isOnline } = state;

  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({
    name: '',
    email: '',
    phone: '',
    resumeText: '',
    resumeFileName: '',
    resumeFileType: '',
    resumeFileData: '',
    photo: null,
    skills: [],
    yearsOfExperience: 0,
    keyProjects: [],
    technologies: [],
  });
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileType, setResumeFileType] = useState('');
  const [topics, setTopics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfPreviewError, setPdfPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfPreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

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
      setResumeFileName(file.name);
      setResumeFileType(file.type);
      setResumePreviewUrl(
        file.type === 'application/pdf' ? URL.createObjectURL(file) : null
      );
      const [text, resumeFileData] = await Promise.all([
        extractTextFromFile(file),
        readFileAsDataUrl(file),
      ]);
      const extractedInfo = isOnline ? await extractInfoFromResume(text) : {};
      const { contact, profile: extractedProfile } =
        splitExtractedProfile(extractedInfo);
      const extractedSkills = Array.isArray(extractedInfo.skills)
        ? extractedInfo.skills.filter(
            (skill): skill is string =>
              typeof skill === 'string' && skill.trim().length > 0
          )
        : [];
      setProfile((prev) => ({
        ...prev,
        resumeText: text,
        resumeFileName: file.name,
        resumeFileType: file.type,
        resumeFileData,
        ...extractedProfile,
        name: contact.name ?? prev.name,
        email: contact.email ?? prev.email,
        phone: contact.phone ?? prev.phone,
      }));
      if (extractedSkills.length > 0 && currentView !== 'interviewee') {
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
    const selectedTopics =
      currentView === 'interviewee' ? interviewSettings.topics : parsedTopics;
    const requiresResume = interviewSettings.questionSource !== 'Topics Only';
    const requiresTopics = interviewSettings.questionSource !== 'Resume Only';
    const hasResume = Boolean(profile.resumeText?.trim());
    const hasTopics = selectedTopics.length > 0;
    if (!profile.name) {
      setError('Please provide your name.');
      return;
    }
    if (requiresResume && !hasResume) {
      setError('Please provide your resume.');
      return;
    }
    if (requiresTopics && !hasTopics) {
      setError(
        currentView === 'interviewee'
          ? 'Interview topics are not configured. Please ask the interviewer to update settings.'
          : 'Please add some topics to discuss.'
      );
      return;
    }
    addCandidate(profile as CandidateProfile, {
      ...interviewSettings,
      topics: selectedTopics,
    });
  };

  const handleInputChange = (field: keyof CandidateProfile, value: string) => {
      setProfile(prev => ({...prev, [field]: value}));
  };

  const formatList = (items?: string[]) =>
    items && items.length > 0 ? items.join(', ') : 'Not provided';

  const formatProjects = (
    projects?: CandidateProfile['keyProjects']
  ): string => {
    if (!projects || projects.length === 0) {
      return 'Not provided';
    }
    return projects
      .map((project) => `${project.title}: ${project.description}`)
      .join(' • ');
  };

  const formatRankedSkills = (
    rankedSkills?: CandidateProfile['rankedSkills']
  ): string => {
    if (!rankedSkills || rankedSkills.length === 0) {
      return 'Not provided';
    }
    return rankedSkills
      .map(
        (skill) =>
          `${skill.name} (${skill.level}, ${Math.round(
            skill.confidence * 100
          )}%)`
      )
      .join(', ');
  };

  const formatYearsOfExperience = (value?: number) =>
    typeof value === 'number' && value > 0 ? `${value} years` : 'Not provided';
  const showPdfPreview = resumeFileType === 'application/pdf' && resumePreviewUrl;
  const showPdfNotice =
    resumeFileType !== '' && resumeFileType !== 'application/pdf';
  const showExtractedDetails = currentView !== 'interviewee';

  useEffect(() => {
    if (!showPdfPreview || !resumePreviewUrl) {
      setPdfPreviewError(false);
      return;
    }

    let isCancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    const renderPreview = async () => {
      const canvas = pdfPreviewCanvasRef.current;
      const context = canvas?.getContext('2d');

      if (!canvas || !context) {
        return;
      }

      try {
        setPdfPreviewError(false);
        loadingTask = pdfjsLib.getDocument(resumePreviewUrl);
        const pdf = await loadingTask.promise;
        if (isCancelled) {
          return;
        }
        const page = await pdf.getPage(1);
        if (isCancelled) {
          await pdf.destroy();
          return;
        }
        const viewport = page.getViewport({ scale: 1 });
        if (viewport.width <= 0 || viewport.height <= 0) {
          setPdfPreviewError(true);
          return;
        }
        const container = canvas.parentElement;
        const containerWidth =
          container?.clientWidth && container.clientWidth > 0
            ? container.clientWidth
            : viewport.width;
        // Scale to the container width to keep text readable; allow vertical
        // overflow so the preview remains scrollable.
        const scale =
          viewport.width > 0 && containerWidth > 0
            ? containerWidth / viewport.width
            : 1;
        const previewScale =
          Number.isFinite(scale) && scale > 0 && scale <= MAX_PDF_SCALE
            ? scale
            : 1;
        const scaledViewport = page.getViewport({ scale: previewScale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        await page.render({ canvasContext: context, viewport: scaledViewport })
          .promise;
      } catch (renderError) {
        if (!isCancelled) {
          setPdfPreviewError(true);
        }
        console.error(renderError);
      }
    };

    renderPreview();

    return () => {
      isCancelled = true;
      try {
        loadingTask?.destroy();
      } catch (cleanupError) {
        console.error('Failed to cleanup PDF loading task:', cleanupError);
      }
    };
  }, [resumePreviewUrl, showPdfPreview]);

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
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx" aria-label="Upload resume (PDF or DOCX files only)" />
                        {showPdfPreview ? (
                          <div className="text-left space-y-2">
                             <p className="text-sm font-semibold text-cyan-400">
                               Resume PDF Preview
                             </p>
                              <div
                                className={`${PDF_PREVIEW_HEIGHT_CLASS} overflow-auto rounded-md border border-slate-700 bg-slate-900`}
                                role="region"
                                aria-label="PDF preview scroll area"
                              >
                               {pdfPreviewError ? (
                                 <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-xs text-slate-400">
                                   <p>PDF preview unavailable.</p>
                                   <a
                                     href={resumePreviewUrl}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     onClick={(event) => event.stopPropagation()}
                                     className="text-cyan-400 underline"
                                   >
                                     Open PDF
                                   </a>
                                 </div>
                               ) : (
                                <div className="relative h-full w-full">
                                  <canvas
                                    ref={pdfPreviewCanvasRef}
                                    className="h-full w-full rounded-md bg-white"
                                    data-testid="resume-pdf-preview"
                                    role="img"
                                    aria-label="Resume PDF preview"
                                  />
                                  <a
                                    href={resumePreviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    className="absolute inset-0 cursor-pointer"
                                    aria-label="Open resume in new tab"
                                    aria-describedby="resume-preview-help"
                                  />
                                </div>
                               )}
                              </div>
                              <p id="resume-preview-help" className="sr-only">
                                Preview of the uploaded resume. Click the preview to open the full document in a new tab.
                              </p>
                              <p className="text-xs text-slate-500">
                                Click the preview to open the resume in a new tab.
                              </p>
                            <p className="text-xs text-slate-500">
                              {resumeFileName
                                ? `File: ${resumeFileName}`
                                : 'PDF file uploaded.'}
                            </p>
                            <p className="text-xs text-slate-500">
                              Click or drag and drop to replace the resume.
                            </p>
                          </div>
                        ) : profile.resumeText ? (
                          <div className="text-left space-y-2">
                            <p className="text-sm font-semibold text-cyan-400">
                              Resume Text Preview
                            </p>
                            <div className="max-h-48 overflow-y-auto rounded-md bg-slate-900/60 p-3 text-sm text-slate-200 whitespace-pre-wrap">
                              {profile.resumeText}
                            </div>
                            {showPdfNotice && (
                              <p className="text-xs text-slate-500">
                                PDF preview is available for uploaded PDF
                                files.
                              </p>
                            )}
                            <p className="text-xs text-slate-500">
                              Click or drag and drop to replace the resume.
                            </p>
                          </div>
                        ) : (
                          <>
                            <UploadIcon className="w-10 h-10 mx-auto text-slate-500 mb-4" />
                            <p className="text-slate-300">
                              <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500 mt-1">PDF or DOCX</p>
                          </>
                        )}
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
                      className="w-full resize-y bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="Paste your full resume text here..."
                      value={profile.resumeText}
                      onChange={(e) => handleInputChange('resumeText', e.target.value)}
                    />
                  </div>
                )}

                  {currentView !== 'interviewee' && (
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
                  )}
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
                      {showExtractedDetails && (
                        <div
                          className="rounded-lg border border-slate-700 bg-slate-900/60 p-4"
                          role="region"
                          aria-labelledby="extracted-details-heading"
                          aria-live={profile.resumeText ? 'polite' : 'off'}
                        >
                          <h3
                            id="extracted-details-heading"
                            className="text-sm font-semibold text-slate-200 mb-3"
                          >
                            Extracted Details
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-slate-400">Name</p>
                              <p className="text-slate-200">
                                {profile.name?.trim() || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Email</p>
                              <p className="text-slate-200">
                                {profile.email?.trim() || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Phone</p>
                              <p className="text-slate-200">
                                {profile.phone?.trim() || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">
                                Years of Experience
                              </p>
                              <p className="text-slate-200">
                                {formatYearsOfExperience(
                                  profile.yearsOfExperience
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Skills</p>
                              <p className="text-slate-200">
                                {formatList(profile.skills)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Technologies</p>
                              <p className="text-slate-200">
                                {formatList(profile.technologies)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Key Projects</p>
                              <p className="text-slate-200">
                                {formatProjects(profile.keyProjects)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Ranked Skills</p>
                              <p className="text-slate-200">
                                {formatRankedSkills(profile.rankedSkills)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
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
