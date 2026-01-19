import { useState, useMemo, useEffect } from 'react';
import { useInterviewState } from '../hooks/useInterviewState';
import { Candidate, Answer, Question } from '../types';
import {
  TrashIcon,
  SearchIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DownloadIcon,
  UserIcon,
  ClipboardIcon,
  RestartIcon,
  // FIX: Import the missing LoadingIcon component.
  LoadingIcon,
} from './icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type SortKey = 'name' | 'createdAt' | 'finalScore';
type SortDirection = 'asc' | 'desc';

// Extend the jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function InterviewerDashboard() {
  const { state, actions } = useInterviewState();
  const { candidates } = state;
  const { deleteCandidate, deleteAllCandidates, resetCandidateInterview, setActiveCandidate } = actions;

  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isPdfLoading, setIsPdfLoading] = useState(false);


  useEffect(() => {
    const handleBodyScroll = (shouldLock: boolean) => {
      document.body.style.overflow = shouldLock ? 'hidden' : 'auto';
    };
    
    if (selectedCandidate) {
      handleBodyScroll(true);
    } else {
      handleBodyScroll(false);
    }
    
    return () => handleBodyScroll(false);
  }, [selectedCandidate]);


  const filteredAndSortedCandidates = useMemo(() => {
    return [...candidates]
      .filter((c) =>
        c.profile.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let valA, valB;
        if (sortKey === 'name') {
          valA = a.profile.name;
          valB = b.profile.name;
        } else if (sortKey === 'createdAt') {
          valA = a.createdAt;
          valB = b.createdAt;
        } else {
          valA = a.finalScore ?? -1;
          valB = b.finalScore ?? -1;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [candidates, searchTerm, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete ALL candidate data? This action cannot be undone.')) {
        deleteAllCandidates();
    }
  }

  const handleRetakeInterview = (candidateId: string) => {
      if (window.confirm('Are you sure you want to reset the interview for this candidate? All their current questions, answers, and scores will be permanently deleted.')) {
          resetCandidateInterview(candidateId);
          setSelectedCandidate(null);
      }
  }

  const openModal = (candidate: Candidate) => {
    setActiveCandidate(candidate.id);
    setSelectedCandidate(candidate);
  };

  const handleGeneratePdf = (candidate: Candidate) => {
      setIsPdfLoading(true);
      setTimeout(() => { // Simulate generation time to show loading state
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('AI Interview Report', 14, 22);
        doc.setFontSize(12);
        doc.text(`Candidate: ${candidate.profile.name}`, 14, 32);
        doc.text(`Date: ${new Date(candidate.createdAt).toLocaleDateString()}`, 14, 38);

        doc.setFontSize(16);
        doc.text('Final Score & Summary', 14, 55);
        doc.setFontSize(11);
        const summaryText = `Overall Score: ${candidate.finalScore}%\n\n${candidate.finalFeedback}`;
        const splitSummary = doc.splitTextToSize(summaryText, 180);
        doc.text(splitSummary, 14, 62);

        const tableBody = candidate.questions.map((q, i) => {
            const answer = candidate.answers.find(a => a.questionId === q.id);
            return [
                i + 1,
                `${q.text} [${q.difficulty}]`,
                answer?.text || '(No answer)',
                answer?.score ?? 'N/A',
                answer?.feedback || 'N/A'
            ];
        });

        doc.autoTable({
            head: [['#', 'Question', 'Answer', 'Score', 'Feedback']],
            body: tableBody,
            startY: 100,
            headStyles: { fillColor: [41, 128, 185] },
            didDrawPage: function (data: any) {
                // Footer
                // FIX: Cast `doc.internal` to `any` to bypass incorrect type definitions for `getNumberOfPages`.
                const str = 'Page ' + (doc.internal as any).getNumberOfPages();
                doc.setFontSize(10);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        doc.save(`Interview_Report_${candidate.profile.name}.pdf`);
        setIsPdfLoading(false);
      }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">
          Candidate Dashboard
        </h1>
        {candidates.length > 0 && (
            <button onClick={handleDeleteAll} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-md text-sm font-medium hover:bg-red-600/40">
                <TrashIcon className="w-4 h-4" />
                Delete All Candidates
            </button>
        )}
      </div>

      <div className="bg-slate-800 p-4 rounded-lg shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {filteredAndSortedCandidates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400">No candidates found. Start a new interview!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  {['name', 'createdAt', 'finalScore'].map((key) => (
                    <th
                      key={key}
                      className="p-4 text-sm font-semibold text-slate-400 cursor-pointer"
                      onClick={() => handleSort(key as SortKey)}
                    >
                      <div className="flex items-center gap-1">
                        {key === 'createdAt' ? 'Date' : key === 'finalScore' ? 'Score' : 'Name'}
                        {sortKey === key &&
                          (sortDirection === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                  ))}
                   <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
                  <th className="p-4 text-sm font-semibold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/50 cursor-pointer"
                    onClick={() => openModal(candidate)}
                  >
                    <td className="p-4 text-slate-200 font-medium">{candidate.profile.name}</td>
                    <td className="p-4 text-slate-300">{new Date(candidate.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-200 font-semibold">{candidate.finalScore !== null ? `${candidate.finalScore}%` : 'N/A'}</td>
                    <td className="p-4">
                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            candidate.interviewStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                            candidate.interviewStatus === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-slate-600 text-slate-300'
                         }`}>
                             {candidate.interviewStatus === 'not-started' ? 'Not Started' : candidate.interviewStatus}
                         </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete the interview data for ${candidate.profile.name}?`)) {
                            deleteCandidate(candidate.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-400"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onGeneratePdf={handleGeneratePdf}
          onRetake={handleRetakeInterview}
          isPdfLoading={isPdfLoading}
        />
      )}
    </div>
  );
}

// Modal Component
function CandidateDetailModal({
  candidate,
  onClose,
  onGeneratePdf,
  onRetake,
  isPdfLoading,
}: {
  candidate: Candidate;
  onClose: () => void;
  onGeneratePdf: (c: Candidate) => void;
  onRetake: (id: string) => void;
  isPdfLoading: boolean;
}) {
    
  const handleCopyResume = () => {
    navigator.clipboard.writeText(candidate.profile.resumeText);
    // Add toast notification later
  }

  const resumeFileData = candidate.profile.resumeFileData;
  const resumeFileName = candidate.profile.resumeFileName;
  const resumeFileType = candidate.profile.resumeFileType;
  const dataPrefix = resumeFileType ? `data:${resumeFileType};base64,` : null;
  const safeResumeData =
    dataPrefix && resumeFileData?.startsWith(dataPrefix)
      ? resumeFileData
      : undefined;
  const hasResumeFile = Boolean(safeResumeData && resumeFileName);

  const getQuestionById = (id: string): Question | undefined => candidate.questions.find(q => q.id === id);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-slate-700 flex justify-between items-start">
            <div className="flex items-start gap-4">
                 {candidate.profile.photo ? (
                    <img src={candidate.profile.photo} alt={candidate.profile.name} className="w-20 h-20 rounded-full object-cover border-2 border-slate-600"/>
                 ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                        <UserIcon className="w-10 h-10 text-slate-500" />
                    </div>
                 )}
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">{candidate.profile.name}</h2>
                    <p className="text-slate-400">{candidate.profile.email}</p>
                    <p className="text-slate-400">{candidate.profile.phone}</p>
                </div>
            </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-700 rounded-full">&times;</button>
        </header>
        <main className="p-6 flex-1 overflow-y-auto">
             {candidate.interviewStatus === 'completed' && (
                <div className="bg-slate-700/50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-cyan-400">Final Score: {candidate.finalScore}%</h3>
                    <p className="text-slate-300 mt-2 whitespace-pre-wrap">{candidate.finalFeedback}</p>
                </div>
             )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Transcript */}
                <div>
                     <h3 className="text-lg font-semibold text-slate-200 mb-4">Interview Transcript</h3>
                     <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {candidate.answers.map((answer: Answer) => {
                            const question = getQuestionById(answer.questionId);
                            if (!question) return null;
                            return (
                                <div key={answer.questionId}>
                                    <p className="font-semibold text-slate-300">{question.text}</p>
                                    <p className="text-slate-200 bg-slate-700 p-3 rounded-md mt-1">{answer.text || 'No answer provided'}</p>
                                     {answer.score !== undefined && (
                                        <div className="mt-2 text-xs p-2 rounded-md bg-slate-900 border border-slate-700">
                                            <p className="text-cyan-400 font-bold">AI Feedback (Score: {answer.score}/10)</p>
                                            <p className="text-slate-400 italic">{answer.feedback}</p>
                                        </div>
                                     )}
                                </div>
                            )
                        })}
                     </div>
                </div>
                {/* Resume */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-200">Resume</h3>
                        <div className="flex items-center gap-3">
                          {hasResumeFile && (
                            <>
                              <a
                                href={safeResumeData}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-slate-400 hover:text-cyan-400"
                              >
                                View
                              </a>
                              <a
                                href={safeResumeData}
                                download={resumeFileName}
                                className="text-xs text-slate-400 hover:text-cyan-400"
                              >
                                Download
                              </a>
                            </>
                          )}
                          <button
                            onClick={handleCopyResume}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400"
                          >
                            <ClipboardIcon className="w-4 h-4" /> Copy
                          </button>
                        </div>
                    </div>
                    {hasResumeFile ? (
                      <p className="text-xs text-slate-500 mb-2">
                        Uploaded file: {resumeFileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mb-2">
                        Uploaded resume file is not available.
                      </p>
                    )}
                     <div className="bg-slate-900 p-4 rounded-md max-h-96 overflow-y-auto border border-slate-700">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{candidate.profile.resumeText}</p>
                     </div>
                </div>
            </div>

        </main>
        <footer className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-4">
            <button
                onClick={() => onRetake(candidate.id)}
                disabled={candidate.interviewStatus !== 'completed'}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-md text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <RestartIcon className="w-4 h-4"/>
                Retake Interview
            </button>
            <button
                onClick={() => onGeneratePdf(candidate)}
                disabled={isPdfLoading || candidate.interviewStatus !== 'completed'}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPdfLoading ? <LoadingIcon className="w-4 h-4"/> : <DownloadIcon className="w-4 h-4" />}
                {isPdfLoading ? 'Generating...' : 'Download PDF'}
            </button>
        </footer>
      </div>
    </div>
  );
}
