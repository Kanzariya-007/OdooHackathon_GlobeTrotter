import React from 'react';

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading GlobeTrotter...', 
  fullPage = false 
}) => {
  const containerClasses = fullPage 
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm' 
    : 'flex flex-col items-center justify-center py-12 px-4 w-full';

  return (
    <div className={containerClasses} id="globetrotter-loading">
      <div className="relative flex items-center justify-center">
        {/* Animated outer ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-violet-500 border-t-transparent shadow-lg"></div>
        {/* Inner pulsing logo point */}
        <div className="absolute h-6 w-6 animate-ping rounded-full bg-indigo-400 opacity-75"></div>
        <div className="absolute h-4 w-4 rounded-full bg-violet-600"></div>
      </div>
      <p className="mt-6 text-sm font-semibold tracking-wide text-indigo-200 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loading;
