
import React, { useState, useMemo, useEffect } from 'react';
import { Candidate } from '../types';
import { useInterviewContext } from '../hooks/useInterviewState';
import { BarChartIcon, ClockIcon, DeleteIcon, DownloadIcon, EyeIcon, HashIcon, SearchIcon, SortAscIcon, SortDescIcon, UserIcon, UsersIcon, XIcon } from './icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InterviewerDashboard: React.FC = () => {
    const { state, dispatch } = useInterviewContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Candidate; direction: 'asc' | 'desc' } | null>({ key: 'finalScore', direction: 'desc' });
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    const filteredCandidates = useMemo(() => {
        return state.candidates.filter(c =>
            c.profile.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [state.candidates, searchTerm]);

    const sortedCandidates = useMemo(() => {
        let sortableCandidates = [...filteredCandidates];
        if (sortConfig !== null) {
            sortableCandidates.sort((a, b) => {
                const aValue = a[sortConfig.key] ?? a.profile[sortConfig.key as keyof typeof a.profile];
                const bValue = b[sortConfig.key] ?? b.profile[sortConfig.key as keyof typeof b.profile];

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableCandidates;
    }, [filteredCandidates, sortConfig]);

    const requestSort = (key: keyof Candidate) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Candidate) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <SortAscIcon className="w-4 h-4 text-slate-500" />;
        }
        return sortConfig.direction === 'asc' ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />;
    };

    const handleDelete = (candidateId: string) => {
        if (window.confirm("Are you sure you want to delete the interview data for this candidate?")) {
            dispatch({ type: 'DELETE_CANDIDATE', payload: candidateId });
        }
    };
    
    const handleDeleteAll = () => {
        if (window.confirm("Are you sure you want to delete ALL candidate data? This action cannot be undone.")) {
            dispatch({ type: 'DELETE_ALL_CANDIDATES' });
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 text-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <UsersIcon className="w-8 h-8"/>
                    Candidate Dashboard
                </h1>
                {state.candidates.length > 0 && (
                    <button onClick={handleDeleteAll} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600/20 text-red-400 rounded-md hover:bg-red-600/30 transition-colors">
                        <DeleteIcon className="w-4 h-4" />
                        Delete All Candidates
                    </button>
                )}
            </div>

            <div className="mb-4 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {sortedCandidates.length === 0 ? (
                 <div className="text-center py-20">
                    <p className="text-slate-400">No candidates found. Start a new interview from the "Interviewee" tab.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-slate-800/50 rounded-lg border border-slate-700">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <button onClick={() => requestSort('name' as any)} className="flex items-center gap-2">Name {getSortIcon('name' as any)}</button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <button onClick={() => requestSort('interviewStatus')} className="flex items-center gap-2">Status {getSortIcon('interviewStatus')}</button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <button onClick={() => requestSort('finalScore')} className="flex items-center gap-2">Score {getSortIcon('finalScore')}</button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <button onClick={() => requestSort('interviewDate')} className="flex items-center gap-2">Date {getSortIcon('interviewDate')}</button>
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {sortedCandidates.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-slate-800 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">{candidate.profile.name || 'Unnamed Candidate'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            candidate.interviewStatus === 'Completed' ? 'bg-green-600/20 text-green-400' : 
                                            candidate.interviewStatus === 'InProgress' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-slate-600/20 text-slate-400'
                                        }`}>
                                            {candidate.interviewStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">
                                        {candidate.finalScore !== null ? `${candidate.finalScore} / 100` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(candidate.interviewDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-4">
                                            <button onClick={() => setSelectedCandidate(candidate)} className="text-cyan-400 hover:text-cyan-300 transition-colors" title="View Details">
                                                <EyeIcon className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => handleDelete(candidate.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete">
                                                <DeleteIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {selectedCandidate && (
                <CandidateDetailModal 
                    candidate={selectedCandidate} 
                    onClose={() => setSelectedCandidate(null)} 
                    dispatch={dispatch}
                />
            )}
        </div>
    );
};

const CandidateDetailModal = ({ candidate, onClose, dispatch }: { candidate: Candidate, onClose: () => void, dispatch: React.Dispatch<any> }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEsc);
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleDownloadPdf = () => {
        setIsDownloading(true);
        try {
            const doc = new jsPDF();
            const { name, email, phone } = candidate.profile;

            doc.setFontSize(20);
            doc.text(`Interview Report: ${name}`, 14, 22);
            doc.setFontSize(10);
            doc.text(`Date: ${new Date(candidate.interviewDate).toLocaleDateString()}`, 14, 30);
            
            autoTable(doc, {
                startY: 35,
                head: [['Candidate Details', '']],
                body: [
                    ['Email', email || 'N/A'],
                    ['Phone', phone || 'N/A'],
                    ['Final Score', `${candidate.finalScore} / 100`],
                ],
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] }
            });

            const finalY = (doc as any).lastAutoTable.finalY;
            doc.setFontSize(12);
            doc.text('Final Summary', 14, finalY + 15);
            doc.setFontSize(10);
            doc.text(doc.splitTextToSize(candidate.finalFeedback || "No summary available.", 180), 14, finalY + 22);

            const tableBody = candidate.answers.map(ans => [
                ans.questionText,
                ans.answerText,
                ans.score,
                doc.splitTextToSize(ans.feedback, 70)
            ]);

            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 50,
                head: [['Question', 'Answer', 'Score', 'Feedback']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 15 },
                    3: { cellWidth: 'auto' },
                }
            });

            doc.save(`Interview_Report_${name.replace(/\s/g, '_')}.pdf`);
        } catch(e) {
            console.error("Failed to generate PDF:", e);
            alert("There was an error generating the PDF report.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleRetake = () => {
        if (window.confirm(`Are you sure you want to reset the interview for ${candidate.profile.name}? All their current questions, answers, and scores will be permanently deleted.`)) {
            dispatch({ type: 'RESET_CANDIDATE_INTERVIEW', payload: candidate.id });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold flex items-center gap-3"><UserIcon className="w-6 h-6"/> {candidate.profile.name}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><XIcon className="w-6 h-6"/></button>
                </header>

                <main className="flex-grow p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                            <h3 className="text-sm text-slate-400 font-bold uppercase">Final Score</h3>
                            <p className="text-4xl font-mono text-cyan-400">{candidate.finalScore ?? 'N/A'}<span className="text-2xl text-slate-400">/100</span></p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                            <h3 className="text-sm text-slate-400 font-bold uppercase">Questions</h3>
                            <p className="text-4xl font-mono text-cyan-400">{candidate.answers.length}</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                            <h3 className="text-sm text-slate-400 font-bold uppercase">Avg. Time</h3>
                            <p className="text-4xl font-mono text-cyan-400">N/A</p>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><BarChartIcon className="w-5 h-5"/> AI Summary</h3>
                        <p className="text-slate-300 bg-slate-900/50 p-4 rounded-lg">{candidate.finalFeedback || "No final summary generated."}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><HashIcon className="w-5 h-5"/> Full Transcript</h3>
                        <div className="space-y-4">
                            {candidate.answers.map(ans => (
                                <div key={ans.questionId} className="bg-slate-900/50 p-4 rounded-lg">
                                    <p className="font-bold text-slate-300">Q: {ans.questionText}</p>
                                    <p className="pl-4 border-l-2 border-slate-600 my-2 text-slate-200">{ans.answerText}</p>
                                    <div className="text-xs text-slate-400 flex items-center gap-4">
                                        <span><strong className="font-mono text-cyan-400">{ans.score}/10</strong> score</span>
                                        <span><ClockIcon className="w-3 h-3 inline mr-1"/> {ans.timeToAnswer}s</span>
                                    </div>
                                    <p className="text-sm mt-2 pt-2 border-t border-slate-700/50 text-slate-400 italic">Feedback: {ans.feedback}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <footer className="flex justify-between items-center p-4 border-t border-slate-700">
                    <button 
                        onClick={handleRetake} 
                        disabled={candidate.interviewStatus !== 'Completed'}
                        className="px-4 py-2 text-sm bg-slate-600/50 text-slate-300 rounded-md hover:bg-slate-600/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Retake Interview
                    </button>
                    <button onClick={handleDownloadPdf} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50">
                        <DownloadIcon className="w-4 h-4"/>
                        {isDownloading ? "Generating..." : "Download PDF"}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default InterviewerDashboard;
