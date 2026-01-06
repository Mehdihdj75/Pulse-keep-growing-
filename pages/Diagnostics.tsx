
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { DiagnosticResult } from '../types';
// Fix typo: sendToN8n -> sendToN8N as exported in n8nService.ts
import { sendToN8N, N8NSubmissionItem } from '../services/n8nService';
import { DiagnosticSubmissionModal } from '../components/DiagnosticSubmissionModal';
import { 
  ClipboardCheck, 
  Target, 
  Activity, 
  Search, 
  Eye, 
  Download, 
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  CheckCircle2,
  Loader2,
  Plus
} from 'lucide-react';

const Diagnostics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [items, setItems] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncedIds, setSyncedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await db.diagnostics.getAll();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleN8NSync = async (diagnostic: DiagnosticResult) => {
    setSyncingId(diagnostic.id);
    const payload: N8NSubmissionItem[] = [
      { 
        json: { 
          respondant: `${diagnostic.firstName} ${diagnostic.lastName}`, 
          section: "Section 1 - Vision", 
          rubrique: "Vision support", 
          question: "Q1", 
          score: Math.floor(Math.random() * 4) 
        } 
      }
    ];

    try {
      // Fix typo: sendToN8n -> sendToN8N
      await sendToN8N(payload);
      setSyncedIds(prev => new Set(prev).add(diagnostic.id));
    } catch (err) {
      alert("Erreur sync n8n");
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-brand-midnight tracking-tight">Diagnostics & Résultats</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-3 px-8 py-4 bg-brand-turquoise text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-turquoise/20 hover:bg-brand-turquoise-dark transition-all hover:-translate-y-1 active:scale-95"
        >
          <Plus size={18} />
          <span>Nouveau Diagnostic</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Analyses</p>
                <h4 className="text-4xl font-black text-brand-midnight">{loading ? '...' : items.length}</h4>
            </div>
            <div className="w-16 h-16 bg-brand-turquoise/10 flex items-center justify-center rounded-2xl text-brand-turquoise">
                <ClipboardCheck size={32} />
            </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between overflow-hidden relative">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score moyen global</p>
                <h4 className="text-4xl font-black text-brand-turquoise">8.2</h4>
            </div>
            <div className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10 text-brand-midnight">
                <Target size={120} />
            </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Activité</p>
                <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                    Temps réel Supabase
                </p>
            </div>
            <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400">
                <Activity size={32} />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
             <Loader2 className="animate-spin text-brand-turquoise" size={32} />
          </div>
        )}

        <div className="p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 border border-slate-100">
              <span>Filtres avancés</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex-1 max-sm relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-turquoise/10 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[200px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entreprise</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Collaborateur</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Score</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.length > 0 ? items.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/40 transition-all group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-brand-midnight">{d.company}</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{d.team}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-brand-midnight">{d.firstName} {d.lastName}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      d.status === 'Terminé' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-midnight text-white'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-brand-turquoise">
                    {d.score ? d.score.toFixed(1) : '—'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                        {syncedIds.has(d.id) ? (
                          <div className="p-2.5 text-emerald-500"><CheckCircle2 size={18} /></div>
                        ) : (
                          <button onClick={() => handleN8NSync(d)} className="p-2.5 text-slate-300 hover:text-brand-turquoise">
                            {syncingId === d.id ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                          </button>
                        )}
                        <button className="p-2.5 text-slate-300 hover:text-brand-midnight"><Eye size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : !loading && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400 italic font-medium">Aucun résultat en base.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DiagnosticSubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => alert("Sync OK")} />
    </div>
  );
};

export default Diagnostics;
