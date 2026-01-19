export function OfflineNotice({
  message,
  className = '',
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-yellow-400/40 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-200 ${className}`}
    >
      {message}
    </div>
  );
}
