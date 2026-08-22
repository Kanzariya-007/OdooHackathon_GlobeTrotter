import React, { useMemo } from 'react';
import { Trip } from '../../types/trip';
import { PiggyBank, ShieldCheck, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface BudgetDashboardProps {
  trip: Trip;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({ trip }) => {
  // Helper to calculate number of days in the trip
  const tripDaysCount = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return 1;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays || 1;
  }, [trip.startDate, trip.endDate]);

  // Dynamically calculate expenses from activities array (single source of truth)
  const categoryExpenses = useMemo(() => {
    const expenses = {
      transport: 0,
      accommodation: 0,
      activities: 0,
      food: 0,
      other: 0
    };

    (trip.activities || []).forEach(act => {
      const cost = Number(act.cost) || 0;
      const cat = act.category.toLowerCase();
      if (cat.includes('transport')) {
        expenses.transport += cost;
      } else if (cat.includes('accommodation')) {
        expenses.accommodation += cost;
      } else if (cat.includes('food')) {
        expenses.food += cost;
      } else if (cat.includes('activity') || cat.includes('activities')) {
        expenses.activities += cost;
      } else {
        expenses.other += cost;
      }
    });

    return expenses;
  }, [trip.activities]);

  const totalCalculatedCost = useMemo(() => {
    return (
      categoryExpenses.transport +
      categoryExpenses.accommodation +
      categoryExpenses.activities +
      categoryExpenses.food +
      categoryExpenses.other
    );
  }, [categoryExpenses]);

  const targetBudgetLimit = trip.budget?.totalBudget ?? 50000;
  const averageDailyCost = totalCalculatedCost / tripDaysCount;
  const isOverBudget = totalCalculatedCost > targetBudgetLimit;

  // Chart Data preparation
  const chartData = useMemo(() => {
    return [
      { name: 'Transport', value: categoryExpenses.transport, color: '#4f46e5' }, // Indigo-600
      { name: 'Accommodation', value: categoryExpenses.accommodation, color: '#0d9488' }, // Teal-600
      { name: 'Activities', value: categoryExpenses.activities, color: '#d97706' }, // Amber-600
      { name: 'Food', value: categoryExpenses.food, color: '#e11d48' }, // Rose-600
      { name: 'Other', value: categoryExpenses.other, color: '#64748b' } // Slate-500
    ].filter(item => item.value > 0);
  }, [categoryExpenses]);

  return (
    <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">
      
      {/* Target Budget Alert/Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Target Limit */}
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Limit</span>
          <h4 className="text-xl font-extrabold text-slate-900 mt-1">₹{targetBudgetLimit.toLocaleString('en-IN')}</h4>
          <span className="text-[9px] text-slate-400 mt-2 block">Set during trip creation</span>
        </div>

        {/* Total Cost Allocated */}
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Allocated Cost</span>
          <h4 className="text-xl font-extrabold text-indigo-650 mt-1">
            ₹{totalCalculatedCost.toLocaleString('en-IN')}
          </h4>
          <span className="text-[9px] text-slate-400 mt-2 block">Calculated from scheduled items</span>
        </div>

        {/* Status Indicator */}
        <div className={`border rounded-xl p-4.5 shadow-xs flex flex-col justify-between ${
          isOverBudget ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            isOverBudget ? 'text-red-400' : 'text-emerald-500'
          }`}>
            Budget Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            {isOverBudget ? (
              <>
                <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                <h4 className="text-sm font-extrabold text-red-750">⚠️ Over Budget</h4>
              </>
            ) : (
              <>
                <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
                <h4 className="text-sm font-extrabold text-emerald-750">Within Budget</h4>
              </>
            )}
          </div>
          <span className={`text-[9px] font-semibold mt-2 block ${
            isOverBudget ? 'text-red-500/80' : 'text-emerald-600/85'
          }`}>
            {isOverBudget 
              ? `Exceeded limit by ₹${(totalCalculatedCost - targetBudgetLimit).toLocaleString('en-IN')}`
              : `₹${(targetBudgetLimit - totalCalculatedCost).toLocaleString('en-IN')} remaining cushion`
            }
          </span>
        </div>

      </div>

      {/* Breakdown Details & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Category allocations and stats */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-800 text-xs tracking-tight uppercase">Category Breakdown</h3>
              <div className="text-right">
                <span className="text-[9px] font-semibold text-slate-400 uppercase">Avg daily cost</span>
                <p className="text-xs font-bold text-slate-700">₹{Math.round(averageDailyCost).toLocaleString('en-IN')} / day</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { name: 'Transport', val: categoryExpenses.transport, barColor: 'bg-indigo-600' },
                { name: 'Accommodation', val: categoryExpenses.accommodation, barColor: 'bg-teal-600' },
                { name: 'Activities', val: categoryExpenses.activities, barColor: 'bg-amber-600' },
                { name: 'Food', val: categoryExpenses.food, barColor: 'bg-rose-600' },
                { name: 'Other', val: categoryExpenses.other, barColor: 'bg-slate-500' }
              ].map((category) => {
                const pct = totalCalculatedCost > 0 ? (category.val / totalCalculatedCost) * 100 : 0;
                return (
                  <div key={category.name} className="flex flex-col gap-1.5 text-left">
                    <div className="flex justify-between items-center text-[11px] font-semibold">
                      <span className="text-slate-700">{category.name}</span>
                      <span className="text-slate-500">
                        ₹{category.val.toLocaleString('en-IN')} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full ${category.barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${totalCalculatedCost > 0 ? pct : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Donut Allocation Chart */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[300px]">
          <h3 className="font-extrabold text-slate-800 text-xs tracking-tight uppercase border-b border-slate-100 pb-3 mb-2">Allocation share</h3>
          
          {totalCalculatedCost === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <PiggyBank size={32} className="text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-400">No budget data available</p>
              <p className="text-[10px] text-slate-450 mt-1 max-w-[160px]">Schedule activities with costs to draw your allocation chart.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center relative">
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Cost']}
                      contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center text in donut chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Allocated</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    ₹{totalCalculatedCost >= 100000 ? `${(totalCalculatedCost / 1000).toFixed(0)}k` : totalCalculatedCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Compact custom legend layout */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center items-center mt-2.5">
                {chartData.map((item, index) => {
                  const pct = totalCalculatedCost > 0 ? (item.value / totalCalculatedCost) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name} ({Math.round(pct)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
