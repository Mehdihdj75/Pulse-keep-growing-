
import React, { useState, useMemo } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Info, 
  Layers, 
  HelpCircle,
  CheckCircle2,
  FileText,
  AlertCircle,
  Zap,
  Code2
} from 'lucide-react';
import { 
  generateSectionCode, 
  generateRubricCode, 
  generateQuestionCode, 
  RawQuestionnaire,
  createEmptySection 
} from '../utils/questionnaireHelpers';

interface QuestionnaireWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RawQuestionnaire) => void;
}

export const QuestionnaireWizard: React.FC<QuestionnaireWizardProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [bulkInputs, setBulkInputs] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<RawQuestionnaire>({
    nom: '',
    description: '',
    version: 'Pulse+ v1.0',
    statut: 'brouillon',
    echelle: { min: 0, max: 3 },
    sections: [createEmptySection(0)]
  });

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!formData.nom) errs.push("Le nom est obligatoire.");
    if (formData.sections.length === 0) errs.push("Au moins une section est requise.");
    const hasRubric = formData.sections.some(s => s.rubriques.length > 0);
    if (!hasRubric) errs.push("Chaque section doit avoir au moins une rubrique.");
    
    if (step === 3) {
      const totalQ = formData.sections.reduce((acc, s) => acc + s.rubriques.reduce((ra, r) => ra + r.questions.length, 0), 0);
      if (totalQ === 0) errs.push("Le questionnaire doit contenir au moins une question.");
    }
    return errs;
  }, [formData, step]);

  const isValid = errors.length === 0 || (step === 1 && formData.nom !== '') || (step === 2 && formData.sections.length > 0);

  const updateCodes = (sections: RawQuestionnaire['sections']) => {
    return sections.map((s, si) => ({
      ...s,
      code: generateSectionCode(si),
      rubriques: s.rubriques.map((r, ri) => ({
        ...r,
        code: generateRubricCode(si, ri),
        questions: r.questions.map((q, qi) => ({
          ...q,
          code: generateQuestionCode(si, ri, qi)
        }))
      }))
    }));
  };

  const handleAddSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: updateCodes([...prev.sections, createEmptySection(prev.sections.length)])
    }));
  };

  const handleRemoveSection = (si: number) => {
    setFormData(prev => ({
      ...prev,
      sections: updateCodes(prev.sections.filter((_, i) => i !== si))
    }));
  };

  const handleAddRubric = (si: number) => {
    setFormData(prev => {
      const next = [...prev.sections];
      next[si].rubriques.push({
        code: '', // updated by updateCodes
        titre: `Nouvelle Rubrique`,
        questions: []
      });
      return { ...prev, sections: updateCodes(next) };
    });
  };

  const handleRemoveRubric = (si: number, ri: number) => {
    setFormData(prev => {
      const next = [...prev.sections];
      next[si].rubriques = next[si].rubriques.filter((_, i) => i !== ri);
      return { ...prev, sections: updateCodes(next) };
    });
  };

  const handleAddQuestion = (si: number, ri: number) => {
    setFormData(prev => {
      const next = [...prev.sections];
      next[si].rubriques[ri].questions.push({
        code: '', // updated by updateCodes
        texte: ''
      });
      return { ...prev, sections: updateCodes(next) };
    });
  };

  const handleBulkImport = (si: number, ri: number) => {
    const key = `${si}-${ri}`;
    const text = bulkInputs[key] || '';
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return;

    setFormData(prev => {
      const next = [...prev.sections];
      const newQuestions = lines.map(line => ({ code: '', texte: line.trim() }));
      next[si].rubriques[ri].questions = [...next[si].rubriques[ri].questions, ...newQuestions];
      return { ...prev, sections: updateCodes(next) };
    });
    
    setBulkInputs(prev => ({ ...prev, [key]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      <div 
        className="absolute inset-0 bg-brand-midnight/60 backdrop-blur-[2px] transition-opacity animate-fade-in" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right transform transition-transform duration-500">
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100">
          <div 
            className="h-full bg-brand-turquoise transition-all duration-500 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-soft-bg rounded-2xl flex items-center justify-center text-brand-midnight">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-midnight tracking-tight">Configuration Pulse+</h2>
              <p className="text-slate-400 text-sm font-medium">Étape {step} sur 3 • {step === 1 ? 'Identité' : step === 2 ? 'Architecture' : 'Questions'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-300 hover:text-brand-midnight hover:bg-slate-50 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Wizard Steps */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
          {step === 1 && (
            <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nom du questionnaire <span className="text-rose-500">*</span></label>
                <input 
                  autoFocus
                  type="text"
                  value={formData.nom}
                  onChange={e => setFormData({...formData, nom: e.target.value})}
                  placeholder="ex: Baromètre Engagement Q4 2024"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-brand-turquoise/10 focus:border-brand-turquoise focus:bg-white outline-none transition-all font-bold text-brand-midnight text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  placeholder="Expliquez brièvement l'objectif de ce diagnostic..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-brand-turquoise/10 focus:border-brand-turquoise focus:bg-white outline-none transition-all font-medium text-slate-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 p-6 bg-brand-soft-bg rounded-[2rem] border border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Code2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Version</span>
                  </div>
                  <p className="text-sm font-bold text-brand-midnight">{formData.version}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Zap size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Échelle</span>
                  </div>
                  <p className="text-sm font-bold text-brand-midnight">Likert {formData.echelle.min} à {formData.echelle.max}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Statut initial</label>
                <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                  {['brouillon', 'actif'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormData({...formData, statut: s as any})}
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        formData.statut === s 
                          ? 'bg-white text-brand-midnight shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-brand-midnight uppercase tracking-widest flex items-center space-x-3">
                  <div className="w-1.5 h-6 bg-brand-turquoise rounded-full" />
                  <span>Structure des sections & rubriques</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400">{formData.sections.length} Sections</span>
              </div>
              
              <div className="space-y-6">
                {formData.sections.map((section, si) => (
                  <div key={si} className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-brand-midnight text-white text-[10px] font-black rounded-xl flex items-center justify-center shadow-lg shadow-brand-midnight/10">
                          {section.code}
                        </div>
                        <input 
                          type="text"
                          value={section.titre}
                          onChange={e => {
                            const next = [...formData.sections];
                            next[si].titre = e.target.value;
                            setFormData({...formData, sections: next});
                          }}
                          className="bg-transparent border-none text-brand-midnight font-black outline-none focus:ring-0 text-lg placeholder:text-slate-300 flex-1"
                        />
                      </div>
                      {formData.sections.length > 1 && (
                        <button onClick={() => handleRemoveSection(si)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    
                    <div className="p-8 space-y-6">
                      <div className="space-y-3">
                        {section.rubriques.map((rubric, ri) => (
                          <div key={ri} className="flex items-center space-x-4 animate-in slide-in-from-left-2">
                            <span className="text-[10px] font-black text-slate-300 w-12 text-right">{rubric.code}</span>
                            <div className="flex-1 relative">
                              <input 
                                type="text"
                                value={rubric.titre}
                                onChange={e => {
                                  const next = [...formData.sections];
                                  next[si].rubriques[ri].titre = e.target.value;
                                  setFormData({...formData, sections: next});
                                }}
                                placeholder="Nom de la rubrique..."
                                className="w-full pl-5 pr-12 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-brand-turquoise/10 focus:border-brand-turquoise outline-none transition-all shadow-sm"
                              />
                              {section.rubriques.length > 1 && (
                                <button 
                                  onClick={() => handleRemoveRubric(si, ri)} 
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200 hover:text-rose-400 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => handleAddRubric(si)}
                        className="ml-16 text-[11px] font-black text-brand-turquoise uppercase tracking-widest flex items-center space-x-2 bg-brand-turquoise/5 px-5 py-2.5 rounded-xl hover:bg-brand-turquoise/10 transition-all border border-brand-turquoise/10"
                      >
                        <Plus size={16} />
                        <span>Ajouter une rubrique</span>
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={handleAddSection}
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 hover:text-brand-turquoise hover:border-brand-turquoise hover:bg-brand-turquoise/5 transition-all font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center space-x-4"
                >
                  <Plus size={24} />
                  <span>Ajouter une nouvelle section</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
              {formData.sections.map((section, si) => (
                <div key={si} className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="px-4 py-1.5 bg-brand-midnight text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-brand-midnight/10">
                      {section.code}
                    </div>
                    <h4 className="text-xl font-black text-brand-midnight truncate">{section.titre}</h4>
                  </div>

                  <div className="space-y-10 pl-6 border-l-2 border-slate-100">
                    {section.rubriques.map((rubric, ri) => (
                      <div key={ri} className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{rubric.code} • {rubric.titre}</span>
                          <span className="text-[10px] font-bold text-brand-turquoise px-3 py-1 bg-brand-turquoise/10 rounded-full">{rubric.questions.length} Questions</span>
                        </div>

                        <div className="space-y-3">
                          {rubric.questions.map((q, qi) => (
                            <div key={qi} className="flex items-center space-x-4 animate-in slide-in-from-left-2">
                              <span className="text-[10px] font-black text-slate-200 w-14 text-right">{q.code}</span>
                              <input 
                                type="text"
                                value={q.texte}
                                onChange={e => {
                                  const next = [...formData.sections];
                                  next[si].rubriques[ri].questions[qi].texte = e.target.value;
                                  setFormData({...formData, sections: next});
                                }}
                                placeholder="Intitulé de la question..."
                                className="flex-1 px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-brand-midnight focus:ring-4 focus:ring-brand-turquoise/20 focus:bg-white transition-all outline-none"
                              />
                              <button 
                                onClick={() => {
                                  const next = [...formData.sections];
                                  next[si].rubriques[ri].questions = next[si].rubriques[ri].questions.filter((_, i) => i !== qi);
                                  setFormData({...formData, sections: updateCodes(next)});
                                }}
                                className="text-slate-200 hover:text-rose-500 p-2"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Bulk Input Tool */}
                        <div className="bg-slate-50/80 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 space-y-5 transition-all focus-within:border-brand-turquoise/40 focus-within:bg-brand-turquoise/5">
                          <textarea 
                            value={bulkInputs[`${si}-${ri}`] || ''}
                            onChange={e => setBulkInputs(prev => ({ ...prev, [`${si}-${ri}`]: e.target.value }))}
                            placeholder="Importez rapidement vos questions ici : collez une question par ligne..."
                            className="w-full bg-transparent border-none text-sm font-medium text-slate-600 placeholder:text-slate-300 resize-none outline-none min-h-[100px] custom-scrollbar"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && e.metaKey) {
                                    handleBulkImport(si, ri);
                                }
                            }}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-slate-300">
                                <Info size={14} />
                                <span className="text-[9px] font-bold uppercase tracking-widest italic">Cmd+Entrée pour valider l'import</span>
                            </div>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => handleAddQuestion(si, ri)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center space-x-2"
                                >
                                    <Plus size={14} />
                                    <span>Ligne unique</span>
                                </button>
                                <button 
                                    onClick={() => handleBulkImport(si, ri)}
                                    disabled={!(bulkInputs[`${si}-${ri}`]?.trim())}
                                    className="px-5 py-2 bg-brand-turquoise text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-turquoise-dark disabled:opacity-30 transition-all flex items-center space-x-2 shadow-lg shadow-brand-turquoise/20"
                                >
                                    <Zap size={14} />
                                    <span>Importer bloc</span>
                                </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action bar sticky bottom */}
        <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 z-20">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button 
              onClick={onClose}
              className="px-8 py-4 text-[11px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-[0.2em] transition-colors"
            >
              Annuler
            </button>
            
            <div className="flex items-center space-x-4">
              {step > 1 && (
                <button 
                  onClick={() => setStep(s => s - 1)}
                  className="px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center space-x-2 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeft size={18} />
                  <span>Précédent</span>
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  disabled={!isValid}
                  onClick={() => setStep(s => s + 1)}
                  className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center space-x-3 transition-all shadow-xl shadow-brand-midnight/10 ${
                    !isValid
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-brand-midnight text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Architecture</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  disabled={!isValid}
                  onClick={() => onSave(formData)}
                  className={`px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center space-x-3 transition-all shadow-xl ${
                    isValid 
                      ? 'bg-brand-turquoise text-white hover:bg-brand-turquoise-dark shadow-brand-turquoise/30' 
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                  }`}
                >
                  <CheckCircle2 size={18} />
                  <span>Publier le questionnaire</span>
                </button>
              )}
            </div>
          </div>

          {!isValid && step === 3 && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-rose-500 animate-fade-in">
              <AlertCircle size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{errors[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
