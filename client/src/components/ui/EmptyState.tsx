import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There is no data to show in this view.',
  icon = <FolderOpen size={24} />,
  action
}) => {
  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh] w-full animate-in fade-in duration-200">
      <div className="bg-indigo-50 p-4 rounded-full text-indigo-500 mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
