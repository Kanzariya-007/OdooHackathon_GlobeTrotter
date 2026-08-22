import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An error occurred',
  message = 'Failed to load details. Please verify your connection.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border border-red-100 bg-red-50/50 p-4 shadow-sm text-left max-w-md mx-auto my-4 ${className}`}>
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 shadow-sm">
          <AlertCircle size={18} />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-slate-800 leading-snug">{title}</h4>
          <p className="mt-1 text-[11px] text-slate-500 leading-normal">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow hover:bg-red-500 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw size={10} />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
