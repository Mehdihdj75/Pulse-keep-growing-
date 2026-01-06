
import React from 'react';
import { KPIStats } from '../types';

export const KPICard: React.FC<KPIStats & { compact?: boolean }> = ({ label, value, icon, trend, trendUp, compact }) => {
  if (compact) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[120px]">
        <span className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">{label}</span>
        <span className="text-brand-midnight text-xl font-bold">{value}</span>
        {trend && (
            <span className={`text-[10px] mt-1 font-medium ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trendUp ? '↗' : '↘'} {trend}
            </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-6 hover:shadow-md transition-shadow">
      <div className="p-4 bg-slate-50 rounded-2xl text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-0.5">{label}</p>
        <h3 className="text-brand-midnight text-3xl font-bold tracking-tight">{value}</h3>
      </div>
    </div>
  );
};
