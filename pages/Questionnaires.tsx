
import React, { useState } from 'react';
import { questionnaires as initialQuestionnaires } from '../data/mockData';
import { QuestionnaireWizard } from '../components/QuestionnaireWizard';
import { RawQuestionnaire } from '../utils/questionnaireHelpers';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Layout, 
  UserPlus, 
  Search, 
  RefreshCcw, 
  MoreVertical, 
  Pause, 
  Play,
  Plus,
  Rocket
} from 'lucide-react';

const Questionnaires: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [questionnaires, setQuestionnaires] = useState(initialQuestionnaires);

  const handleSaveQuestionnaire = (data: RawQuestionnaire) => {
    // CONTRAT n8n compatible payload
    const payload = {
      nom: data.nom,
      description: data.description,
      version: data.version,
      statut: data.statut,
      echelle: data.echelle,
      sections: data.sections.map(s => ({
        code: s.code,
        titre: s.titre,
        rubriques: s.rubriques.map(r => ({
          code: r.code,
          titre: r.titre,
          questions: r.questions.map(q => ({
            code: q.code,
            texte: q.texte
          }))
        }))
      }))
    };

    console.group('🚀 [Keep Growing n8n Connector] Questionnaire Created');
    console.log('Payload:', payload);
    console.log('JSON Output (ready for POST /api/questionnaires):', JSON.stringify(payload, null, 2));
    console.groupEnd();
    
    // UI Update Simulation
    const questionsCount = data.sections.reduce(
      (acc, s) => acc + s.rubriques.reduce((rAcc, r) => rAcc + r.questions.length, 0), 0
    );

    const newQ = {
      id: `Q-${Math.floor(100 + Math.random() * 900)}`,
      name: data.nom,
      employees: 0,
      sections: data.sections.length,
      questions: questionsCount,
      status: data.statut === 'actif' ? 'Actif' : 'En pause' as any,
      updatedAt: new Date().toLocaleDateString('fr-FR'),
      createdAt: new Date().toLocaleDateString('fr-FR')
    };
    
    setQuestionnaires([newQ, ...questionnaires]);
    setIsWizardOpen(false);
    
    // In production, this would trigger a toast
    alert(`Success: Questionnaire "${data.nom}" created and synced with n8n orchestration.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-brand-midnight tracking-tight">Vue d'ensemble des questionnaires</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Gérez vos diagnostics Pulse+ et préparez vos rapports automatisés.</p>
        </div>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center space-x-3 px-8 py-4 bg-brand-turquoise text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-turquoise-dark transition-all shadow-xl shadow-brand-turquoise/20 hover:-translate-y-1 active:scale-95"
        >
          <Rocket size={18} />
          <span>Nouveau questionnaire</span>
        </button>
      </div>

      {/* Stats row with premium cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: <FileText className="text-brand-turquoise" />, label: 'Total', value: questionnaires.length, color: 'bg-brand-turquoise/10' },
          { icon: <FileSpreadsheet className="text-emerald-500" />, label: 'Excel', value: 58, color: 'bg-emerald-500/10' },
          { icon: <Download className="text-indigo-500" />, label: 'CSV', value: 45, color: 'bg-indigo-500/10' },
          { icon: <Layout className="text-amber-500" />, label: 'Template', value: 21, color: 'bg-amber-500/10' },
          { icon: <UserPlus className="text-rose-500" />, label: 'Affecter', value: 87, color: 'bg-rose-500/10' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all cursor-pointer group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-xl font-black text-brand-midnight">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6 bg-white">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par titre ou ID..." 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-brand-midnight focus:ring-4 focus:ring-brand-turquoise/10 focus:bg-white transition-all outline-none"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-50 px-5 py-2.5 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trier</span>
                <select className="bg-transparent border-none text-xs font-black text-brand-midnight outline-none focus:ring-0 cursor-pointer">
                    <option>Nom (A-Z)</option>
                    <option>Récent</option>
                    <option>Statut</option>
                </select>
            </div>
            <button className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-brand-midnight transition-all">
              <RefreshCcw size={20} />
            </button>
            <button className="flex items-center space-x-2 px-8 py-4 bg-brand-midnight text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-midnight/20 hover:bg-slate-800 transition-all">
              <Download size={18} />
              <span>Export global</span>
            </button>
          </div>
        </div>

        {/* Table with refined layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifiant</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Titre Questionnaire</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Sections</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Questions</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dernière MAJ</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {questionnaires.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/40 transition-all group">
                  <td className="px-8 py-7 text-xs font-mono text-slate-300">#{q.id}</td>
                  <td className="px-8 py-7">
                    <span className="text-sm font-black text-brand-midnight group-hover:text-brand-turquoise transition-colors">{q.name}</span>
                  </td>
                  <td className="px-8 py-7 text-sm text-center font-bold text-slate-500">{q.sections}</td>
                  <td className="px-8 py-7 text-sm text-center font-bold text-slate-500">{q.questions}</td>
                  <td className="px-8 py-7">
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      q.status === 'Actif' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2.5 ${q.status === 'Actif' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-amber-500'}`}></span>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-8 py-7">
                    <p className="text-xs font-black text-brand-midnight">{q.updatedAt}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Diagnostic Pulse</p>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end space-x-3">
                        <button className="p-3 text-slate-300 hover:text-brand-midnight bg-slate-50 rounded-2xl transition-all hover:bg-white hover:shadow-md">
                            {q.status === 'Actif' ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button className="p-3 text-slate-300 hover:text-brand-midnight bg-slate-50 rounded-2xl transition-all hover:bg-white hover:shadow-md">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QuestionnaireWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onSave={handleSaveQuestionnaire}
      />
    </div>
  );
};

export default Questionnaires;
