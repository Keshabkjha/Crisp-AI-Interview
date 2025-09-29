import { useState, useRef, useEffect, useCallback } from 'react';
import { Answer, Question } from '../types';
import { SendIcon, MicIcon, UserIcon, BotIcon, LoadingIcon } from './icons';

// Extend the Window interface for cross-browser SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatWindowProps {
  currentQuestion: Question | undefined;
  answers: Answer[];
  onAnswerSubmit: (text: string) => void;
  isOnline: boolean;
}

export function ChatWindow({
  currentQuestion,
  answers,
  onAnswerSubmit,
  isOnline,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [currentQuestion, answers]);

  const handleSend = async () => {
    if (inputText.trim() && !isProcessing) {
      setIsProcessing(true);
      await onAnswerSubmit(inputText);
      setInputText('');
      setIsProcessing(false);
    }
  };
  
   // Speech Recognition Logic
  const handleToggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setInputText(prev => prev + finalTranscript + interimTranscript);
        };
        
        recognitionRef.current.onend = () => {
            if (isListeningRef.current) {
                recognitionRef.current.start();
            }
        };

        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Sorry, your browser doesn't support speech recognition.");
      }
    }
  }, [isListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAnswerForQuestion = (q: Question) => answers.find(a => a.questionId === q.id);

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg shadow-md border border-slate-700">
      <div className="flex-1 p-4 overflow-y-auto">
        {currentQuestion && (
            <div className="flex items-start gap-3 my-4">
                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <BotIcon className="w-5 h-5 text-cyan-400" />
                 </div>
                 <div className="p-3 rounded-lg max-w-lg bg-slate-700 text-slate-200">
                    <p className="text-sm">{currentQuestion.text}</p>
                 </div>
            </div>
        )}

        {currentQuestion && getAnswerForQuestion(currentQuestion) && (
            <>
                <div className="flex items-start gap-3 my-4 justify-end">
                    <div className="p-3 rounded-lg max-w-lg bg-cyan-600 text-white">
                        <p className="text-sm">{getAnswerForQuestion(currentQuestion)?.text}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-white" />
                    </div>
                </div>

                 {isOnline && getAnswerForQuestion(currentQuestion)?.feedback && (
                    <div className="my-4 p-3 rounded-lg bg-slate-700/50 border border-slate-700 text-xs">
                        <p className="font-bold text-cyan-400">AI Feedback (Score: {getAnswerForQuestion(currentQuestion)?.score}/10)</p>
                        <p className="text-slate-400 italic mt-1">{getAnswerForQuestion(currentQuestion)?.feedback}</p>
                    </div>
                 )}
            </>
        )}
        
        {isProcessing && (
          <div className="flex items-start gap-3 my-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <BotIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="p-3 rounded-lg bg-slate-700">
              <LoadingIcon className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
            rows={2}
            disabled={isProcessing}
          />
          <button
            onClick={handleToggleListening}
            title={isListening ? "Stop listening" : "Start listening"}
            className={`p-2 rounded-full ${isListening ? 'bg-red-500/20 text-red-400' : 'hover:bg-slate-700'}`}
            disabled={isProcessing}
          >
            <MicIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleSend}
            disabled={isProcessing || !inputText.trim()}
            className="p-2 bg-cyan-600 text-white rounded-full disabled:bg-slate-600"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}