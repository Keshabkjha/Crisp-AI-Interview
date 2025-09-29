import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useInterviewState, useInterviewDispatch } from '../hooks/useInterviewState';
import { Candidate, InterviewStatus } from '../types';
import { UsersIcon, TrashIcon, UserCircleIcon, XIcon, DownloadIcon, FileTextIcon, RefreshCwIcon } from './icons';
import { ChatWindow } from './ChatWindow'; // Import ChatWindow
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const ResumeViewerModal: React.FC<{ resumeText: string, onClose: () => void }> = ({ resumeText, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={onClose}>
            <div 
                className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-2xl w-full h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="resume-viewer-title"
            >
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 id="resume-viewer-title" className="text-lg font-bold text-white">Resume Text</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2" aria-label="Close resume viewer"><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 flex-grow overflow-y-auto">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{resumeText}</pre>
                </div>
            </div>
        </div>
    );
}

const CandidateDetailModal: React.FC<{ candidate: Candidate; onClose: () => void }> = ({ candidate, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isResumeVisible, setIsResumeVisible] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const dispatch = useInterviewDispatch();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if(isResumeVisible) setIsResumeVisible(false);
                else onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isResumeVisible]);

    const handleRetakeInterview = () => {
        if (window.confirm(`Are you sure you want to reset the interview for ${candidate.profile.name}? All their current questions, answers, and scores will be permanently deleted.`)) {
            dispatch({ type: 'RESET_CANDIDATE_INTERVIEW', payload: candidate.id });
            onClose();
        }
    }

    const generatePDF = () => {
        setIsGeneratingPdf(true);
        // Use a timeout to allow the UI to update before the potentially blocking PDF generation starts
        setTimeout(() => {
            try {
                const doc = new jsPDF();
                
                doc.setFontSize(22);
                doc.text(`Interview Report: ${candidate.profile.name}`, 14, 22);
                
                doc.setFontSize(12);
                doc.setTextColor(100);
                doc.text(`Date: ${new Date(parseInt(candidate.id.split('_')[1])).toLocaleDateString()}`, 14, 30);
                
                doc.setFontSize(16);
                doc.setTextColor(0);
                doc.text(`Final Score: ${candidate.finalScore ?? 'N/A'}/100`, 14, 45);
                
                doc.setFontSize(12);
                doc.text('Overall Feedback:', 14, 55);
                const feedbackLines = doc.splitTextToSize(candidate.finalFeedback || 'Not available.', 180);
                doc.text(feedbackLines, 14, 62);
                
                const tableBody = candidate.questions.map((q, i) => {
                    const answer = candidate.answers.find(a => a.questionId === q.id);
                    const questionText = `Q${i+1} (${q.difficulty}): ${q.text}\n\nAnswer: ${answer?.answerText || '(No answer provided)'}`;
                    const evaluationText = `Score: ${answer?.score ?? 'N/A'} / 10\n\nFeedback:\n${answer?.feedback || 'N/A'}`;
                    return [questionText, evaluationText];
                });

                autoTable(doc, {
                    startY: (doc as any).autoTable.previous.finalY + 15 > 80 ? (doc as any).autoTable.previous.finalY + 15 : 80,
                    head: [['Question & Answer', 'Evaluation']],
                    body: tableBody,
                    theme: 'grid',
                    headStyles: { fillColor: [22, 163, 74] },
                    styles: { cellPadding: 3, fontSize: 10, overflow: 'linebreak' },
                    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 'auto' } },
                });

                doc.save(`Interview_Report_${candidate.profile.name.replace(/\s+/g, '_')}.pdf`);
            } catch (error) {
                console.error("Failed to generate PDF:", error);
                alert("An error occurred while generating the PDF report.");
            } finally {
                setIsGeneratingPdf(false);
            }
        }, 50);
    };

    return (
        <>
        {isResumeVisible && candidate.profile.resumeText && <ResumeViewerModal resumeText={candidate.profile.resumeText} onClose={() => setIsResumeVisible(false)} />}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div 
                ref={modalRef} 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="candidate-detail-title"
            >
                <header className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                           {candidate.profile.photoDataUrl ? <img src={candidate.profile.photoDataUrl} alt={candidate.profile.name} className="w-full h-full object-cover"/> : <UserCircleIcon className="w-full h-full p-1 text-slate-500"/>}
                        </div>
                        <div>
                            <h2 id="candidate-detail-title" className="text-2xl font-bold text-white">{candidate.profile.name}</h2>
                            <p className="text-slate-400">{candidate.profile.email}</p>
                            <p className="text-slate-400">{candidate.profile.phone}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2" aria-label="Close modal"><XIcon className="w-6 h-6"/></button>
                </header>
                
                <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-span-1 bg-slate-900/50 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-slate-400 mb-2">Final Score</h3>
                            <p className="text-4xl font-bold text-cyan-400">{candidate.finalScore ?? 'N/A'}<span className="text-xl text-slate-400">/100</span></p>
                        </div>
                         <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-slate-400 mb-2">Overall Feedback</h3>
                            <p className="text-slate-300 text-sm whitespace-pre-wrap">{candidate.finalFeedback || "No final feedback available."}</p>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-200 mb-4">Interview Transcript</h3>
                     <ChatWindow 
                        questions={candidate.questions} 
                        answers={candidate.answers} 
                        currentQuestionIndex={candidate.questions.length - 1}
                        showFeedback={true}
                    />
                </div>
                
                <footer className="p-4 border-t border-slate-700 flex flex-col sm:flex-row-reverse gap-4">
                    <button onClick={generatePDF} disabled={candidate.interviewStatus !== InterviewStatus.Completed || isGeneratingPdf} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[210px]">
                        {isGeneratingPdf ? (
                            <>
                                <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                                Generating PDF...
                            </>
                        ) : (
                             <>
                                <DownloadIcon className="w-5 h-5"/> Download PDF Report
                            </>
                        )}
                    </button>
                    <button onClick={handleRetakeInterview} disabled={candidate.interviewStatus !== InterviewStatus.Completed} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshCwIcon className="w-5 h-5"/> Retake Interview
                    </button>
                    {candidate.profile.resumeText && (
                        <button onClick={() => setIsResumeVisible(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mr-auto">
                            <FileTextIcon className="w-5 h-5"/> View Resume
                        </button>
                    )}
                </footer>
            </div>
        </div>
        </>
    );
};

export const InterviewerDashboard: React.FC = () => {
    const { candidates } = useInterviewState();
    const dispatch = useInterviewDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('date');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    useEffect(() => {
        if (selectedCandidate) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
             document.body.style.overflow = 'unset';
        }
    }, [selectedCandidate]);

    const sortedAndFilteredCandidates = useMemo(() => {
        return [...candidates]
            .filter(c => c.profile.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                switch (sortBy) {
                    case 'score':
                        return (b.finalScore ?? -1) - (a.finalScore ?? -1);
                    case 'name':
                        return a.profile.name.localeCompare(b.profile.name);
                    case 'date':
                    default:
                        return parseInt(b.id.split('_')[1]) - parseInt(a.id.split('_')[1]);
                }
            });
    }, [candidates, searchTerm, sortBy]);


    const getStatusChip = (status: InterviewStatus) => {
        switch (status) {
            case InterviewStatus.Completed:
                return <span className="px-2 py-1 text-xs font-medium text-green-300 bg-green-900/50 rounded-full">Completed</span>;
            case InterviewStatus.InProgress:
            case InterviewStatus.FollowUp:
                return <span className="px-2 py-1 text-xs font-medium text-yellow-300 bg-yellow-900/50 rounded-full">In Progress</span>;
            case InterviewStatus.NotStarted:
            default:
                return <span className="px-2 py-1 text-xs font-medium text-slate-300 bg-slate-700 rounded-full">Not Started</span>;
        }
    };
    
    const handleSelectCandidate = (candidateId: string) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
            setSelectedCandidate(candidate);
        }
    };
    
    const handleCloseModal = useCallback(() => {
        setSelectedCandidate(null);
    }, []);

    const handleDelete = (e: React.MouseEvent, candidateId: string, candidateName: string) => {
        e.stopPropagation();
        if(window.confirm(`Are you sure you want to delete the interview data for ${candidateName}? This action cannot be undone.`)) {
            dispatch({ type: 'DELETE_CANDIDATE', payload: candidateId });
        }
    };
    
    const handleDeleteAll = () => {
         if(window.confirm(`Are you sure you want to delete ALL candidate data? This action cannot be undone.`)) {
            dispatch({ type: 'DELETE_ALL_CANDIDATES' });
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
             {selectedCandidate && <CandidateDetailModal candidate={selectedCandidate} onClose={handleCloseModal} />}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-100">Interviewer Dashboard</h2>
                {candidates.length > 0 && (
                     <button 
                        onClick={handleDeleteAll}
                        className="flex items-center gap-2 text-sm bg-red-900/50 hover:bg-red-900 text-red-300 font-semibold py-2 px-3 rounded-lg transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" /> Delete All Candidates
                    </button>
                )}
            </div>
            
             {candidates.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white">
                                <XIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex-shrink-0">
                         <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'date')}
                            className="w-full sm:w-auto bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-full"
                        >
                            <option value="date">Sort by Date (Newest)</option>
                            <option value="score">Sort by Score (Highest)</option>
                            <option value="name">Sort by Name (A-Z)</option>
                        </select>
                    </div>
                </div>
            )}


            {sortedAndFilteredCandidates.length === 0 ? (
                <div className="text-center p-12 bg-slate-800/40 rounded-lg border border-slate-700/50">
                    <UsersIcon className="w-16 h-16 text-slate-500 mx-auto mb-4"/>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">No Candidates Found</h3>
                    <p className="text-slate-400">
                        {candidates.length > 0 ? "Your search/filter returned no results." : 'Navigate to the "Interviewee" tab to start a new interview.'}
                    </p>
                </div>
            ) : (
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
                   {/* Mobile View: Cards */}
                   <ul className="divide-y divide-slate-700/50 md:hidden">
                       {sortedAndFilteredCandidates.map(c => (
                           <li key={c.id} className="p-4" onClick={() => handleSelectCandidate(c.id)}>
                               <div className="flex items-center gap-4 mb-3">
                                   <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                                       {c.profile.photoDataUrl ? <img src={c.profile.photoDataUrl} alt={c.profile.name} className="w-full h-full object-cover"/> : <UserCircleIcon className="w-full h-full p-1 text-slate-500"/>}
                                   </div>
                                   <div>
                                       <p className="font-semibold text-slate-100">{c.profile.name}</p>
                                       <p className="text-sm text-slate-400">{c.profile.email || 'No email'}</p>
                                   </div>
                               </div>
                               <div className="flex justify-between items-center">
                                   <div>{getStatusChip(c.interviewStatus)}</div>
                                   <div className="flex items-center gap-2">
                                       {c.finalScore !== null && <div className="font-bold text-lg text-cyan-400">{c.finalScore}<span className="text-xs text-slate-400">/100</span></div>}
                                       <button onClick={(e) => handleDelete(e, c.id, c.profile.name)} className="text-slate-500 hover:text-red-400 p-2"><TrashIcon className="w-5 h-5"/></button>
                                   </div>
                               </div>
                           </li>
                       ))}
                   </ul>

                   {/* Desktop View: Table */}
                    <table className="hidden md:table w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Candidate</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Score</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAndFilteredCandidates.map(candidate => (
                                <tr 
                                    key={candidate.id} 
                                    className="bg-slate-900/20 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                                    onClick={() => handleSelectCandidate(candidate.id)}
                                >
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                                                {candidate.profile.photoDataUrl ? <img src={candidate.profile.photoDataUrl} alt={candidate.profile.name} className="w-full h-full object-cover"/> : <UserCircleIcon className="w-full h-full p-1 text-slate-500"/>}
                                            </div>
                                            <div>
                                                <div className="text-base font-semibold">{candidate.profile.name}</div>
                                                <div className="font-normal text-slate-400">{candidate.profile.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusChip(candidate.interviewStatus)}</td>
                                    <td className="px-6 py-4 text-center font-bold text-lg text-cyan-400">
                                        {candidate.finalScore !== null ? `${candidate.finalScore}/100` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={(e) => handleDelete(e, candidate.id, candidate.profile.name)} 
                                            className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-full"
                                            aria-label={`Delete candidate ${candidate.profile.name}`}
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};