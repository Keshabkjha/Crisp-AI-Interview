
interface WelcomeBackModalProps {
  onContinue: () => void;
  onRestart: () => void;
}

export function WelcomeBackModal({
  onContinue,
  onRestart,
}: WelcomeBackModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl max-w-sm w-full border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-slate-100">Welcome Back!</h2>
        <p className="text-slate-300 mb-6">
          You have an interview in progress. Would you like to continue where
          you left off or start a new one?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-slate-600 text-slate-200 rounded-md hover:bg-slate-700"
          >
            Start New
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 font-semibold"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
