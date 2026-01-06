
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'En cours', value: 19, color: '#2DD4BF' },
  { name: 'Terminés', value: 62, color: '#0F172A' },
  { name: 'Pas commencés', value: 0, color: '#E2E8F0' },
];

const total = data.reduce((acc, item) => acc + item.value, 0);

export const DonutDiagnostics: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-brand-midnight text-xl font-bold">État des diagnostics</h3>
        <button className="px-4 py-2 bg-brand-turquoise text-white text-sm font-semibold rounded-full hover:bg-brand-turquoise-dark transition-colors shadow-sm">
          Voir Détails
        </button>
      </div>

      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-4xl font-bold text-brand-midnight block">{total}</span>
          <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Total</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        {data.map((item) => (
          <div key={item.name} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-500 text-xs font-semibold uppercase">{item.name}</span>
            </div>
            <span className="text-brand-midnight text-2xl font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
