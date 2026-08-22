import React from 'react';
import PageContainer from '../components/PageContainer';
import { DollarSign, Info } from 'lucide-react';

export const Budget: React.FC = () => {
  return (
    <PageContainer title="Budget & Expenses" subtitle="Monitor your tour costs and logs.">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center max-w-2xl mx-auto my-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
          <DollarSign className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-200">Budgeting & Expense Tracker</h3>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          This view will log expense allocations, support standard currencies (USD, EUR, etc.), categorize costs, and analyze budget details.
        </p>
        
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-950/40 border border-slate-800 p-4 text-slate-400">
          <Info className="h-4 w-4 shrink-0 text-violet-400" />
          <span className="text-xs">This feature belongs to <strong>Member 4</strong> and will be integrated in subsequent hours.</span>
        </div>
      </div>
    </PageContainer>
  );
};

export default Budget;
