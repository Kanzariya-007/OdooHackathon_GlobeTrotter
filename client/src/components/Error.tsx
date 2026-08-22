import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading the page. Please try again.',
  onRetry
}) => {
  return (
    <div 
      className="max-w-md mx-auto my-8 overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-950/20 backdrop-blur-md p-6 shadow-xl"
      id="globetrotter-error"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:bg-rose-500 hover:shadow-rose-600/20 active:scale-95"
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Error;
