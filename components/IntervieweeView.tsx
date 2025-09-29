import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useInterviewState, useInterviewDispatch } from '../hooks/useInterviewState';
import { View, InterviewStatus, QuestionDifficulty, QuestionOrigin } from '../types';
import { generateIntroFollowUp, generateInterviewQuestions, evaluateAnswer, generateFinalFeedback } from '../services/geminiService';
import { generateOfflineQuestions } from '../services/offlineQuestions';
import { ChatWindow } from './ChatWindow';
import { Timer } from './Timer';
import { SendIcon, BrainCircuitIcon, CheckCircleIcon, MicrophoneIcon, MicrophoneSlashIcon } from './icons';

interface IntervieweeViewProps {
  setView: (view: View) => void;
}

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

export const IntervieweeView: React.FC<IntervieweeViewProps> = ({ setView }) => {
  const { candidates, selectedCandidateId, interviewSettings, isOffline } = useInterviewState();
  const dispatch = useInterviewDispatch();

  const candidate = useMemo(() => candidates.find(c => c.id === selectedCandidateId), [candidates, selectedCandidateId]);

  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const initialTextRef = useRef('');
  const [isForceEnding, setIsForceEnding] = useState(false);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (!recognition) return;

    const handleResult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setAnswer(initialTextRef.current + finalTranscript + interimTranscript);
    };
    
    // Auto-restart if it stops unexpectedly, but not if we intentionally stopped it.
    const handleEnd = () => {
      if (isListeningRef.current) {
        recognition.start();
      }
    };

    if (isListening) {
      initialTextRef.current = answer ? answer.trim() + ' ' : '';
      recognition.addEventListener('result', handleResult);
      recognition.addEventListener('end', handleEnd);
      recognition.start();
    }

    return () => {
        if(recognition) {
            recognition.removeEventListener('result', handleResult);
            recognition.removeEventListener('end', handleEnd);
            recognition.stop();
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);
  
  const isInterviewOver = candidate?.interviewStatus === InterviewStatus.Completed;

  // This effect handles the "2 consecutive no-answers" rule
  useEffect(() => {
    if (candidate && candidate.consecutiveNoAnswers >= 2 && !isInterviewOver && !isForceEnding) {
        const forceEnd = async () => {
            setIsForceEnding(true);
            setIsProcessing(true);
            setError(null);
            try {
                if (isOffline) {
                    dispatch({ type: 'COMPLETE_INTERVIEW', payload: { candidateId: candidate.id, finalScore: null, finalFeedback: "Interview ended due to inactivity. Final evaluation not available." } });
                } else {
                    const { finalScore, finalFeedback } = await generateFinalFeedback(candidate);
                    const finalFeedbackWithMessage = finalFeedback + "\n\nNote: The interview was concluded early due to two consecutive unanswered questions.";
                    dispatch({ type: 'COMPLETE_INTERVIEW', payload: { candidateId: candidate.id, finalScore, finalFeedback: finalFeedbackWithMessage } });
                }
            } catch (err: any) {
                setError(err.message || "Failed to generate final feedback.");
                dispatch({ type: 'COMPLETE_INTERVIEW', payload: { candidateId: candidate.id, finalScore: null, finalFeedback: `An error occurred during final evaluation after inactivity: ${err.message}` } });
            }
        };
        forceEnd();
    }
  }, [candidate, dispatch, isOffline, isInterviewOver, isForceEnding]);

  if (!candidate) {
    return (
      <div className="text-center p-12 bg-slate-800 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-200">No Interview in Progress</h3>
        <p className="text-slate-400">Please start a new interview from the setup screen.</p>
      </div>
    );
  }
  
  const currentQuestion = candidate.questions[candidate.currentQuestionIndex];

  // Start the interview if it hasn't started
  useEffect(() => {
    if (candidate && candidate.currentQuestionIndex === -1 && candidate.interviewStatus !== InterviewStatus.Completed) {
      dispatch({ type: 'ADVANCE_QUESTION', payload: { candidateId: candidate.id } });
    }
  }, [candidate, dispatch]);

  const processAnswerAsync = useCallback(async () => {
    if (!candidate || candidate.interviewStatus !== InterviewStatus.FollowUp) return;

    setIsProcessing(true);
    setError(null);

    try {
      const lastAnswer = [...candidate.answers].pop();
      if (!lastAnswer) throw new Error("Could not find the last answer.");
      const answeredQuestion = candidate.questions.find(q => q.id === lastAnswer.questionId);
      if (!answeredQuestion) throw new Error("Could not find the question for the submitted answer.");

      // Branch based on question type
      if (answeredQuestion.source === 'intro') {
          let mainQuestions;
          let introFollowUpText: string | null = null;
          
          // Step 1: Generate main questions (with fallback)
          try {
              if (isOffline) throw new Error("Offline mode"); // Force fallback if offline
              mainQuestions = await generateInterviewQuestions(candidate.profile, interviewSettings);
          } catch (e) {
              console.warn("AI question generation failed, using offline bank:", e);
              mainQuestions = generateOfflineQuestions(candidate.profile, interviewSettings);
              if (!isOffline) {
                  setError("Could not connect to AI, using standard questions.");
              }
          }
          
          const difficultyOrder = { [QuestionDifficulty.Easy]: 1, [QuestionDifficulty.Medium]: 2, [QuestionDifficulty.Hard]: 3 };
          mainQuestions.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

          // Step 2: Generate intro follow-up (only if online)
          if (!isOffline) {
              try {
                  introFollowUpText = await generateIntroFollowUp(lastAnswer.answerText);
              } catch (e) {
                  console.warn("Could not generate intro follow-up:", e);
              }
          }

          // Step 3: Dispatch questions to state
          if (mainQuestions && mainQuestions.length > 0) {
               dispatch({
                type: 'ADD_QUESTIONS_TO_QUEUE',
                payload: {
                  candidateId: candidate.id,
                  questions: mainQuestions.map((q) => ({
                    ...q,
                    source: 'skills' as QuestionOrigin,
                    timeLimit: interviewSettings.timeLimits[q.difficulty] || 120,
                  })),
                },
              });
          }

          if (introFollowUpText) {
              dispatch({ type: 'INSERT_FOLLOW_UP_QUESTION', payload: { 
                  candidateId: candidate.id, 
                  question: { 
                      text: introFollowUpText, 
                      difficulty: QuestionDifficulty.Easy, 
                      timeLimit: interviewSettings.timeLimits.Easy, 
                      isFollowUp: true, 
                      source: 'intro-followup' 
                  } 
              } });
          }

      } else { // Handle regular questions (non-intro)
          if (!isOffline) {
              try {
                  const evaluation = await evaluateAnswer(answeredQuestion, lastAnswer.answerText, interviewSettings.topics);
                  dispatch({ type: 'UPDATE_EVALUATION', payload: { candidateId: candidate.id, questionId: answeredQuestion.id, score: evaluation.score, feedback: evaluation.feedback } });
                  if (evaluation.needsFollowUp && evaluation.followUpQuestionText) {
                      dispatch({ type: 'INSERT_FOLLOW_UP_QUESTION', payload: { 
                          candidateId: candidate.id, 
                          question: { 
                              text: evaluation.followUpQuestionText, 
                              difficulty: answeredQuestion.difficulty, 
                              timeLimit: interviewSettings.timeLimits[answeredQuestion.difficulty], 
                              isFollowUp: true, 
                              source: 'clarification-followup' 
                          } 
                      } });
                  }
              } catch (e: any) {
                  console.error("Answer evaluation failed:", e);
                  setError(`AI evaluation failed for the last answer. (${e.message})`);
              }
          }
      }
      
      dispatch({ type: 'ADVANCE_QUESTION', payload: { candidateId: candidate.id } });

    } catch (err: any) {
      setError(err.message || "An AI service error occurred. Please try again.");
      // Still try to advance to prevent getting stuck
      if(candidate) dispatch({ type: 'ADVANCE_QUESTION', payload: { candidateId: candidate.id } });
    } finally {
        setIsProcessing(false);
    }
  }, [candidate, dispatch, interviewSettings, isOffline]);

  useEffect(() => {
    if (candidate?.interviewStatus === InterviewStatus.FollowUp && !isProcessing) {
      processAnswerAsync();
    }
  }, [candidate?.interviewStatus, candidate?.id, processAnswerAsync, isProcessing]);


  const finalizeInterviewAsync = useCallback(async () => {
    if (!candidate) return;
    const isReadyToFinalize = candidate.currentQuestionIndex >= candidate.questions.length && candidate.interviewStatus !== InterviewStatus.Completed;
    if (!isReadyToFinalize) return;

    setIsProcessing(true);
    setError(null);
    try {
      if (isOffline) {
        dispatch({ type: 'COMPLETE_INTERVIEW', payload: { candidateId: candidate.id, finalScore: null, finalFeedback: "Interview completed in offline mode. Final evaluation not available." } });
      } else {
        const { finalScore, finalFeedback } = await generateFinalFeedback(candidate);
        dispatch({ type: 'COMPLETE_INTERVIEW', payload: { candidateId: candidate.id, finalScore, finalFeedback } });
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate final feedback.");
      // Still complete the interview but with an error message
      dispatch({ type: 'COMPLETE_INTERVIEW', payload: { candidateId: candidate.id, finalScore: null, finalFeedback: `An error occurred during final evaluation: ${err.message}` } });
    } finally {
      setIsProcessing(false);
    }
  }, [candidate, dispatch, isOffline]);

  useEffect(() => {
    finalizeInterviewAsync();
  }, [candidate?.currentQuestionIndex, candidate?.questions.length, candidate?.interviewStatus, finalizeInterviewAsync]);

  const handleSubmit = () => {
    if (!candidate || !currentQuestion || isProcessing) return;
    const answerText = answer.trim() || '(No answer provided)';
    dispatch({ type: 'SUBMIT_ANSWER', payload: { candidateId: candidate.id, questionId: currentQuestion.id, answerText } });
    setAnswer('');
    if(isListening) setIsListening(false);
  };

  const handleTimeout = useCallback(() => {
    if (!candidate || !currentQuestion || isProcessing) return;
    const answerText = answer.trim() || '(No answer provided - time ran out)';
    dispatch({ type: 'SUBMIT_ANSWER', payload: { candidateId: candidate.id, questionId: currentQuestion.id, answerText: answerText } });
    setAnswer('');
    if(isListening) setIsListening(false);
  }, [candidate, currentQuestion, isProcessing, dispatch, isListening, answer]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
  };


  if (isInterviewOver) {
    const showFeedbackBlock = candidate.finalScore !== null || (candidate.finalFeedback && candidate.finalFeedback.trim() !== '');

    return (
        <div className="text-center p-8 sm:p-12 bg-slate-800/40 rounded-lg border border-slate-700/50 max-w-2xl mx-auto">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4"/>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">Interview Complete!</h3>
            <p className="text-slate-400 mb-6">Thank you for your time. The hiring team will be in touch with you soon.</p>
            
            {showFeedbackBlock && (
                 <div className="bg-slate-900/50 p-4 rounded-lg text-left mb-6">
                    {candidate.finalScore !== null && (
                      <p className="text-sm font-semibold text-slate-300 mb-2">Final Score: <span className="text-cyan-400 font-bold">{candidate.finalScore}/100</span></p>
                    )}
                    {candidate.finalFeedback && (
                      <>
                        <p className="text-sm font-semibold text-slate-300">Feedback Summary:</p>
                        <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap">{candidate.finalFeedback}</p>
                      </>
                    )}
                </div>
            )}
            <button
                onClick={() => {
                  dispatch({type: 'SELECT_CANDIDATE', payload: null});
                  setView('dashboard');
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                View Dashboard
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-grow overflow-y-auto pr-4 -mr-4">
        <ChatWindow 
            questions={candidate.questions} 
            answers={candidate.answers} 
            currentQuestionIndex={candidate.currentQuestionIndex}
            showFeedback={false}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center p-4 text-center h-[138px]">
            <BrainCircuitIcon className="w-10 h-10 text-cyan-400 animate-pulse mb-3"/>
            <p className="text-slate-300 font-semibold">AI is analyzing your answer...</p>
            <p className="text-slate-400 text-sm">Please wait, the next question will appear shortly.</p>
          </div>
        ) : (
          <>
            {currentQuestion && (
              <div className="flex justify-end mb-3">
                  <Timer 
                    key={currentQuestion.id} // Re-mounts timer for each question
                    duration={currentQuestion.timeLimit} 
                    startTime={candidate.currentQuestionStartTime}
                    onComplete={handleTimeout} 
                    isRunning={!!candidate.currentQuestionStartTime && candidate.interviewStatus === InterviewStatus.InProgress}
                  />
              </div>
            )}
            <div className="relative">
              <textarea
                id="answer-textarea"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentQuestion ? "Type your answer here... (Enter to submit, Shift+Enter for new line)" : "Loading question..."}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 pr-28 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                rows={4}
                disabled={isProcessing || !currentQuestion}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 {recognition && (
                    <button
                        onClick={() => setIsListening(prev => !prev)}
                        className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse-bg' : 'bg-slate-600 hover:bg-slate-500'}`}
                        aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
                    >
                        {isListening ? <MicrophoneSlashIcon className="w-5 h-5 text-white" /> : <MicrophoneIcon className="w-5 h-5 text-white" />}
                    </button>
                 )}
                 <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !answer.trim()}
                    className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Submit Answer"
                  >
                    <SendIcon className="w-5 h-5 text-white" />
                  </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};