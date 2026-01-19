
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useInterviewState } from '../hooks/useInterviewState';
import { ChatWindow } from './ChatWindow';
import { Timer } from './Timer';
import {
  consumeOfflineFallbackNotice,
  evaluateAnswer,
  generateFinalFeedback,
  generateInterviewQuestions,
} from '../services/geminiService';
import { generateOfflineQuestions } from '../services/offlineQuestions';
import { Question, Answer } from '../types';
import { LoadingIcon } from './icons';
import { MAX_FOLLOW_UPS, MAX_CONSECUTIVE_NO_ANSWERS } from '../constants';
import { OfflineNotice } from './OfflineMessaging';
import { useOfflineMessaging } from '../hooks/useOfflineMessaging';
import { validateInterviewSettings } from '../schemas/interviewSettings';

export function IntervieweeView() {
  const { state, activeCandidate, actions } = useInterviewState();
  const { isOnline } = state;
  const { startInterview, submitAnswer, addFollowUpQuestion, updateAnswerWithFeedback, endInterview } = actions;
  
  const [viewState, setViewState] = useState<'loading' | 'interview' | 'completing' | 'complete'>('loading');
  const [loadingMessage, setLoadingMessage] = useState('Initializing interview...');
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const offlineMessages = useOfflineMessaging();
  const retryDelaysMs = useMemo(() => [1000, 2000], []);

  const currentQuestion = useMemo(() => 
    activeCandidate?.questions[activeCandidate.currentQuestionIndex], 
    [activeCandidate]
  );
  
  const processAnswerAsync = useCallback(async (answerText: string) => {
    if (!activeCandidate || !currentQuestion) return;

    const answer: Answer = {
      questionId: currentQuestion.id,
      text: answerText,
      timestamp: Date.now(),
    };
    
    // Immediately submit the answer for UI update
    submitAnswer(answer);

    if (isOnline) {
      const evaluation = await evaluateAnswer(currentQuestion, answer.text);
      if (evaluation) {
        updateAnswerWithFeedback(currentQuestion.id, evaluation.score, evaluation.feedback);

        const followUpCount = activeCandidate.questions.filter(
          (q) => q.isFollowUp && q.followUpFor === (currentQuestion.followUpFor || currentQuestion.id)
        ).length;
        
        if (evaluation.followUp && followUpCount < MAX_FOLLOW_UPS) {
          addFollowUpQuestion(evaluation.followUp);
        }
      }
    }
  }, [activeCandidate, currentQuestion, isOnline, submitAnswer, updateAnswerWithFeedback, addFollowUpQuestion]);

  // Effect to generate questions when the component mounts for a new interview
  useEffect(() => {
    const setupInterview = async () => {
      if (activeCandidate && activeCandidate.interviewStatus === 'not-started') {
        setOfflineNotice(null);
        setLoadingMessage('Generating tailored interview questions...');
        const validatedSettings = validateInterviewSettings(
          activeCandidate.interviewSettings
        );
        let questions: Question[] = [];
        let shouldNotifyOfflineFallback = false;
        let offlineNoticeMessage: string | null = null;
        if (isOnline) {
          for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
            if (attempt > 0) {
              const delayMs = retryDelaysMs[attempt - 1];
              setLoadingMessage(offlineMessages.retryingAi(attempt, delayMs));
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
            questions = await generateInterviewQuestions(
              validatedSettings,
              activeCandidate.profile
            );
            shouldNotifyOfflineFallback =
              shouldNotifyOfflineFallback || consumeOfflineFallbackNotice();
            if (questions.length > 0) break;
          }
        } else {
          offlineNoticeMessage = offlineMessages.offlineDetectedNotice;
        }
        
        // Fallback to offline questions if AI fails or we're offline
        if (questions.length === 0) {
          setLoadingMessage(
            shouldNotifyOfflineFallback
              ? offlineMessages.aiUnavailableStart
              : offlineMessages.offlineStartLoading
          );
          offlineNoticeMessage = shouldNotifyOfflineFallback
            ? offlineMessages.aiUnavailableNotice
            : offlineNoticeMessage ?? offlineMessages.offlineStartNotice;
           questions = await generateOfflineQuestions(
             activeCandidate.profile.skills,
             validatedSettings.difficultyDistribution,
             {
               categories: activeCandidate.profile.skills,
               tags: [
                 ...activeCandidate.profile.skills,
                 ...validatedSettings.topics,
               ],
             }
           );
        }
        
        startInterview(questions);
        setOfflineNotice(offlineNoticeMessage);
        setViewState('interview');
      } else if (activeCandidate && activeCandidate.interviewStatus === 'in-progress') {
        setViewState('interview');
      } else if (activeCandidate && activeCandidate.interviewStatus === 'completed') {
        setViewState('complete');
      }
    };
    setupInterview();
  }, [activeCandidate, isOnline, offlineMessages, retryDelaysMs, startInterview]);


  // Effect to handle end of interview
  useEffect(() => {
    const finishInterview = async () => {
        if (!activeCandidate) return;

        if (activeCandidate.interviewStatus === 'completed' && !activeCandidate.finalFeedback) {
            setViewState('completing');
            setLoadingMessage('Analyzing interview and generating final report...');
            
            let finalScore = 75; // Default score
            let summary = "The interview was completed offline. Final feedback could not be generated by the AI.";

            if(isOnline) {
                const feedback = await generateFinalFeedback(
                    activeCandidate.profile,
                    activeCandidate.questions,
                    activeCandidate.answers
                );

                if (feedback) {
                    finalScore = feedback.finalScore;
                    summary = feedback.summary;
                }
            } else {
                // Basic offline scoring
                const totalPossibleScore = activeCandidate.answers.length * 10;
                const actualScore = activeCandidate.answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
                if (totalPossibleScore > 0) {
                    finalScore = Math.round((actualScore / totalPossibleScore) * 100);
                }
            }

            endInterview(finalScore, summary);
            setViewState('complete');
        } else if (activeCandidate.interviewStatus === 'completed') {
             setViewState('complete');
        }
    };

     const isLastQuestionAnswered = activeCandidate && activeCandidate.currentQuestionIndex >= activeCandidate.questions.length - 1;
    if (isLastQuestionAnswered) {
        finishInterview();
    }
  }, [activeCandidate, isOnline, endInterview]);

  // Auto-submit on timer completion or if too many consecutive skips
  useEffect(() => {
    if (activeCandidate?.consecutiveNoAnswers && activeCandidate.consecutiveNoAnswers >= MAX_CONSECUTIVE_NO_ANSWERS) {
      endInterview(0, "Interview ended prematurely due to multiple unanswered questions.");
    }
  }, [activeCandidate?.consecutiveNoAnswers, endInterview]);

  if (viewState === 'loading' || !activeCandidate) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <LoadingIcon className="w-12 h-12 text-cyan-400" />
        <p className="text-slate-300 text-lg animate-pulse">{loadingMessage}</p>
      </div>
    );
  }
  
  if (viewState === 'completing') {
     return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <LoadingIcon className="w-12 h-12 text-cyan-400" />
        <p className="text-slate-300 text-lg animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  if (viewState === 'complete') {
    return (
        <div className="bg-slate-800 p-8 rounded-lg shadow-2xl max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-slate-100 mb-4">Interview Complete!</h1>
            <p className="text-slate-300 mb-6">Thank you for your time. Here is your summary.</p>
            
            <div className="bg-slate-700 p-6 rounded-lg text-left mb-6">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Final Score: {activeCandidate.finalScore}%</h2>
                <h3 className="font-semibold text-slate-200 mb-2">Hiring Manager's Summary:</h3>
                <p className="text-slate-300 whitespace-pre-wrap">{activeCandidate.finalFeedback}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => actions.startNewInterview()}
                className="py-2 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-md"
              >
                Start New
              </button>
              <button
                onClick={() => actions.setCurrentView('dashboard')}
                className="py-2 px-6 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md"
              >
                View Dashboard
              </button>
            </div>
         </div>
     );
   }
  
  const timeLimit = currentQuestion ? activeCandidate.interviewSettings.timeLimits[currentQuestion.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'] : 0;
  
  return (
    <div className="flex flex-col h-full">
      {offlineNotice && (
        <OfflineNotice message={offlineNotice} className="mb-4" />
      )}
      <header className="flex justify-between items-center mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div>
           <p className="text-sm text-slate-400">Question {activeCandidate.currentQuestionIndex + 1} of {activeCandidate.questions.length}</p>
           <p className="font-semibold text-slate-200">{currentQuestion?.difficulty} Difficulty</p>
        </div>
        <Timer
          key={currentQuestion?.id}
          duration={timeLimit * 1000}
          onComplete={() => processAnswerAsync('')}
        />
      </header>
      <div className="flex-1">
        <ChatWindow
          key={activeCandidate.id}
          currentQuestion={currentQuestion}
          answers={activeCandidate.answers}
          onAnswerSubmit={processAnswerAsync}
          isOnline={isOnline}
        />
      </div>
    </div>
  );
}
