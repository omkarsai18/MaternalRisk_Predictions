import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-lg border border-risk-high/20 bg-risk-highBg/50 p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-risk-high/10">
        <AlertCircle className="h-6 w-6 text-risk-high" />
      </div>
      <p className="max-w-md text-sm text-risk-high leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
