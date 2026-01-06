
import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, Loader2, Send, Info, Star, AlertTriangle } from 'lucide-react';
import { sendToN8N, buildN8NPayload, Answer } from '../services/n8nService';

// Mock d'un questionnaire détaillé pour le diagnostic
const DETAILED_QUESTIONNAIRE = {
  id: 'Q-101',
  name: 'Diagnostic Pulse+ v1.0',
  sections: [
    {
      titre: "Section 1 - Vision & Stratégie",
      rubriques: [
        {
          titre: "Alignement",
          questions: ["La vision de l'entreprise est-elle claire ?", "L'équipe partage-t-elle les mêmes objectifs ?"]
        },
        {
          titre: "Communication",
          questions: ["La direction communique-t-elle assez ?", "Le feedback est-il régulier ?"]
        }
      ]
    },
    {
      titre: "Section 2 - Engagement & Climat",
      rubriques: [
        {
          titre: "Ambiance",
          questions: ["Le climat social est-il propice au travail ?", "Les relations inter-équipes sont-elles fluides ?"]
        }
      ]
    }
  ]
};

interface DiagnosticSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DiagnosticSubmissionModal: React.FC<DiagnosticSubmissionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [respondent, setRespondent] = useState('Mehdi');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  // Génère la liste des questions à plat pour le mapping
  const flattenedQuestions = useMemo(() => {
    const list: { section: string, rubrique: string, question: string, id: string }[] = [];
    DETAILED_QUESTIONNAIRE.sections.forEach(s => {
      s.rubriques.forEach(r => {
        r.questions.forEach(q => {
          list.push({
            id: `${s.titre}-${r.titre}-${q}`,
            section: s.titre,
            rubrique: r.titre,
            question: q
          });
        });
      });
    });
    return list;
  }, []);

  const handleScoreChange = (qId: string, value: number) => {
    setScores(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérifier que toutes les questions ont un score
    const unselected = flattenedQuestions.filter(q => scores[q.id] === undefined);
    if (unselected.length > 0) {
      setError(`Veuillez répondre à toutes les questions (${unselected.length} manquantes).`);
      setLoading(false);
      return;
    }

    try {
      // 1. Transformer les scores en format Answer[]
      const answers: Answer[] = flattenedQuestions.map(q => ({
        section: q.section,
        rubrique: q.rubrique,
        question: q.question,
        score: scores[q.id]
      }));

      // 2. Construire le payload JSON strict pour n8n
      const payload = buildN8NPayload(respondent, answers);

      // 3. Envoyer au webhook
      await sendToN8N(payload);
      
      // 4. Feedback et fermeture
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Échec de la connexion au serveur n8n.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in overflow-hidden">
      <div className="absolute inset-0 bg-brand-midnight/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-turquoise/10 rounded-2xl flex items-center justify-center text-brand-turquoise">
              <Send size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-midnight tracking-tight">Saisie Diagnostic Pulse</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Automatisation n8n Webhook</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-brand-midnight transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {/* Respondent Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Répondant</label>
            <input 
              type="text"
              required
              value={respondent}
              onChange={e => setRespondent(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-turquoise/10 focus:border-brand-turquoise outline-none transition-all font-bold text-brand-midnight"
              placeholder="Nom du collaborateur..."
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-brand-midnight uppercase tracking-widest">Questionnaire : {DETAILED_QUESTIONNAIRE.name}</h3>
                <span className="text-[10px] font-bold text-slate-400">{flattenedQuestions.length} Questions</span>
            </div>

            {DETAILED_QUESTIONNAIRE.sections.map((section, si) => (
              <div key={si} className="space-y-4">
                <div className="flex items-center space-x-3 text-brand-turquoise">
                  <div className="h-px bg-brand-turquoise/20 flex-1"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{section.titre}</span>
                  <div className="h-px bg-brand-turquoise/20 flex-1"></div>
                </div>

                <div className="space-y-3">
                  {section.rubriques.map((rubric, ri) => (
                    <div key={ri} className="space-y-3">
                      {rubric.questions.map((q, qi) => {
                        const qId = `${section.titre}-${rubric.titre}-${q}`;
                        return (
                          <div key={qi} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 hover:bg-white hover:shadow-md transition-all group">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">{rubric.titre}</span>
                              <span className="text-sm font-bold text-brand-midnight group-hover:text-brand-turquoise transition-colors">{q}</span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex space-x-2">
                                {[0, 1, 2, 3].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleScoreChange(qId, val)}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                      scores[qId] === val 
                                        ? 'bg-brand-midnight text-white shadow-lg scale-110' 
                                        : 'bg-white text-slate-400 hover:text-brand-midnight border border-slate-100'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                              <span className="text-[10px] font-black text-slate-300 italic">Score : 0=Insuffisant, 3=Optimal</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 shrink-0 bg-white">
          {error && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600 animate-fade-in">
              <AlertTriangle size={18} />
              <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-5 bg-brand-midnight text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-midnight/20 hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Envoi au webhook...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Publier & Synchroniser n8n</span>
              </>
            )}
          </button>
          
          <div className="mt-4 flex items-center justify-center space-x-2 text-slate-300">
            <Info size={14} />
            <p className="text-[9px] font-bold uppercase tracking-[0.1em]">Serveur cible : n8n.srv864713.hstgr.cloud</p>
          </div>
        </div>
      </div>
    </div>
  );
};
