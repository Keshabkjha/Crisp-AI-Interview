import React, { useEffect, useRef } from 'react';
import { Question, Answer, QuestionDifficulty } from '../types';
import { BrainCircuitIcon, UserCircleIcon } from './icons';

interface ChatWindowProps {
    questions: Question[];
    answers: Answer[];
    currentQuestionIndex: number;
    showFeedback: boolean;
}

const getDifficultyChip = (difficulty: QuestionDifficulty) => {
    switch (difficulty) {
        case QuestionDifficulty.Easy:
            return <span className="text-xs font-medium text-green-300 bg-green-900/50 px-2 py-0.5 rounded-full ml-2">Easy</span>;
        case QuestionDifficulty.Medium:
            return <span className="text-xs font-medium text-yellow-300 bg-yellow-900/50 px-2 py-0.5 rounded-full ml-2">Medium</span>;
        case QuestionDifficulty.Hard:
            return <span className="text-xs font-medium text-red-300 bg-red-900/50 px-2 py-0.5 rounded-full ml-2">Hard</span>;
    }
};


export const ChatWindow: React.FC<ChatWindowProps> = ({ questions, answers, currentQuestionIndex, showFeedback }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const transcript = questions
        .slice(0, currentQuestionIndex + 1)
        .map((question) => {
            const answer = answers.find(a => a.questionId === question.id);
            return {
                id: question.id,
                question,
                answer,
            };
        });

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }, [transcript.length, transcript[transcript.length-1]?.answer?.feedback]);

    return (
        <div className="space-y-6">
            {transcript.map(({ id, question, answer }) => (
                <React.Fragment key={id}>
                    {/* AI Question */}
                    <div className={'flex items-start gap-4 animate-fade-in'}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center">
                            <BrainCircuitIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="flex-1 bg-slate-800 p-4 rounded-lg rounded-tl-none border border-slate-700">
                            <p className="font-semibold text-slate-200 flex items-center">
                                AI Interviewer {question.source !== 'intro' && getDifficultyChip(question.difficulty)}
                            </p>
                            <p className="text-slate-300 mt-2 whitespace-pre-wrap">{question.text}</p>
                        </div>
                    </div>

                    {/* User Answer */}
                    {answer && (
                         <div className="flex items-start gap-4 animate-fade-in justify-end">
                            <div className="flex-1 bg-slate-700 p-4 rounded-lg rounded-tr-none border border-slate-600 max-w-2xl">
                                <p className="font-semibold text-slate-200">Your Answer</p>
                                <p className="text-slate-300 mt-2 whitespace-pre-wrap">{answer.answerText}</p>
                                {showFeedback && answer.score !== null && (
                                    <div className="mt-3 pt-3 border-t border-slate-600/50 text-xs space-y-1">
                                        <p><span className="font-semibold text-slate-400">Score:</span> {answer.score}/10</p>
                                        <p><span className="font-semibold text-slate-400">Feedback:</span> {answer.feedback}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                                <UserCircleIcon className="w-5 h-5 text-slate-300" />
                            </div>
                        </div>
                    )}
                </React.Fragment>
            ))}
            <div ref={scrollRef} />
        </div>
    );
};