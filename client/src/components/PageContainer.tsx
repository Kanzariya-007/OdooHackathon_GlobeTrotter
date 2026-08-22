import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle
}) => {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-900 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all">
      {(title || subtitle) && (
        <div className="mb-8 border-b border-slate-800 pb-5">
          {title && (
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="animate-fade-in">
        {children}
      </div>
    </main>
  );
};

export default PageContainer;
