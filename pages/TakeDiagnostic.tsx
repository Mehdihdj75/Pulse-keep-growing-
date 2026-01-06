import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, Loader2, AlertTriangle, Info, ArrowLeft, ChevronDown } from 'lucide-react';
import { sendToN8N, buildN8NPayload, Answer } from '../services/n8nService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Nouveaux types pour le questionnaire flexible
type QuestionType = 'scale' | 'select' | 'multiselect';

interface QuestionDef {
    code: string;
    text: string;
    type: QuestionType;
    options?: string[]; // Pour select/multiselect
}

interface RubricDef {
    titre: string;
    questions: QuestionDef[];
}

interface SectionDef {
    titre: string;
    rubriques: RubricDef[];
}

const DETAILED_QUESTIONNAIRE: { id: string; name: string; sections: SectionDef[] } = {
    id: 'Pulse-Sales-v2',
    name: 'Diagnostic Commercial Pulse',
    sections: [
        {
            titre: "1. Votre Entreprise & Contexte",
            rubriques: [
                {
                    titre: "Profil",
                    questions: [
                        {
                            code: "taille_equipe",
                            text: "Taille de l’équipe commerciale (ETP vendeurs) *",
                            type: "select",
                            options: ["1-9", "10-19", "20–49", "50–99", "100-249", "250-500", "500+"]
                        },
                        {
                            code: "contexte",
                            text: "Contexte du moment *",
                            type: "select",
                            options: [
                                "Hypercroissance / scale",
                                "Post-levée (Seed / Série A-B+)",
                                "Réorganisation commerciale",
                                "Pipeline / marge / win-rate en ralentissement",
                                "Hausse du chiffre d'affaire",
                                "Besoin d’aligner vision ↔ priorités"
                            ]
                        },
                        {
                            code: "blocages",
                            text: "Où se situent vos principaux blocages dans l’entonnoir commercial ? *",
                            type: "multiselect",
                            options: [
                                "Acquisition / génération de leads",
                                "Qualification (MQL → SQL)",
                                "Démonstration / évaluation",
                                "Proposition / devis",
                                "Closing / contractualisation & facturation",
                                "Onboarding / activation",
                                "Fidélisation / expansion",
                                "Taux d’attrition (churn)"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            titre: "2. Vision & Formalisation",
            rubriques: [
                {
                    titre: "Clarté du Cycle",
                    questions: [
                        { code: "vision_etapes", text: "Les étapes de notre cycle de vente sont connues et comprises par toute l’équipe ? *", type: "scale" },
                        { code: "vision_definitions", text: "Chaque étape du cycle est clairement définie avec des critères objectifs ? *", type: "scale" },
                        { code: "vision_realite", text: "Le cycle est cohérent avec notre façon réelle de vendre ? *", type: "scale" }
                    ]
                }
            ]
        },
        {
            titre: "3. Utilisation du CRM",
            rubriques: [
                {
                    titre: "Fiabilité",
                    questions: [
                        { code: "crm_reflet", text: "Le CRM reflète fidèlement l’état réel des opportunités ? *", type: "scale" },
                        { code: "crm_maj", text: "Le CRM est mis à jour régulièrement par les commerciaux ? *", type: "scale" },
                        { code: "crm_alignement", text: "Les étapes du CRM sont bien alignées avec le cycle de vente formalisé ? *", type: "scale" }
                    ]
                }
            ]
        },
        {
            titre: "4. Discipline & Suivi",
            rubriques: [
                {
                    titre: "Rigueur",
                    questions: [
                        { code: "suivi_etapes", text: "Les opportunités suivent le cycle de vente sans sauter d’étapes ? *", type: "scale" },
                        { code: "suivi_perte", text: "Les requalifications ou pertes sont systématiquement expliquées ? *", type: "scale" },
                        { code: "suivi_position", text: "Nous savons toujours dans quelle étape se situe chaque opportunité ? *", type: "scale" }
                    ]
                }
            ]
        },
        {
            titre: "5. Rituels & Alignement",
            rubriques: [
                {
                    titre: "Management",
                    questions: [
                        { code: "rituels_structure", text: "Des rituels d’équipe structurent le suivi du pipeline (ex : deal review, forecast, Q&A…) ? *", type: "scale" },
                        { code: "rituels_efficacite", text: "Ces rituels sont efficaces et font avancer les opportunités ? *", type: "scale" },
                        { code: "rituels_pilotage", text: "Le management utilise le cycle pour piloter la performance (pas juste pour contrôler) ? *", type: "scale" }
                    ]
                }
            ]
        },
        {
            titre: "6. Qualité & Prise de décision",
            rubriques: [
                {
                    titre: "Data Driven",
                    questions: [
                        { code: "qualite_data", text: "Les décisions commerciales s’appuient sur des données fiables issues du pipeline ? *", type: "scale" },
                        { code: "qualite_priorites", text: "Le cycle nous aide à prioriser les bonnes opportunités ? *", type: "scale" },
                        { code: "qualite_grille", text: "Les étapes floues ou inefficaces sont régulièrement remises en question ? *", type: "scale" }
                    ]
                }
            ]
        },
        {
            titre: "7. Appropriation & Responsabilité",
            rubriques: [
                {
                    titre: "Engagement équipe",
                    questions: [
                        { code: "approp_roles", text: "Chacun dans l’équipe sait ce qu’il doit faire à chaque étape du cycle ? *", type: "scale" },
                        { code: "approp_soutien", text: "Le cycle est vécu comme un appui à la vente, pas comme une contrainte ? *", type: "scale" },
                        { code: "approp_jalons", text: "L’équipe commerciale est alignée sur les jalons et les critères clés ? *", type: "scale" }
                    ]
                }
            ]
        },
        {
            titre: "8. Symptômes & Risques",
            rubriques: [
                {
                    titre: "Santé du business",
                    questions: [
                        { code: "symptomes_inexplique", text: "Les pertes de deals “inexpliquées” sont rares ? *", type: "scale" },
                        { code: "symptomes_reunions", text: "Les discussions en réunion pipeline sont claires, structurées et orientées action ? *", type: "scale" }
                    ]
                }
            ]
        }
    ]
};

const TakeDiagnostic: React.FC = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);

    // State pour stocker les réponses (number | string | string[])
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [error, setError] = useState<string | null>(null);

    // Liste à plat pour validation
    const flattenedQuestions = useMemo(() => {
        const list: { section: string, rubrique: string, question: string, id: string, type: string }[] = [];
        DETAILED_QUESTIONNAIRE.sections.forEach(s => {
            s.rubriques.forEach(r => {
                r.questions.forEach(q => {
                    list.push({
                        id: q.code, // Use code as ID for stability
                        section: s.titre,
                        rubrique: r.titre,
                        question: q.text,
                        type: q.type
                    });
                });
            });
        });
        return list;
    }, []);

    const handleAnswerChange = (qCode: string, value: any) => {
        setAnswers(prev => ({ ...prev, [qCode]: value }));
    };

    const handleMultiSelectToggle = (qCode: string, option: string) => {
        setAnswers(prev => {
            const current = (prev[qCode] as string[]) || [];
            if (current.includes(option)) {
                return { ...prev, [qCode]: current.filter(o => o !== option) };
            } else {
                return { ...prev, [qCode]: [...current, option] };
            }
        });
    };

    const calculateAverageScore = () => {
        // Only count numeric scale answers
        const values = Object.values(answers).filter(v => typeof v === 'number');
        if (values.length === 0) return 0;
        const sum = values.reduce((a, b) => a + (b as number), 0);
        // Scale is 0-5. To normalize to 10: (avg / 5) * 10 = avg * 2
        return Number(((sum / values.length) * 2).toFixed(1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        setError(null);

        // Validation
        const missing = flattenedQuestions.filter(q => {
            const val = answers[q.id];
            if (q.type === 'multiselect') return !val || val.length === 0;
            return val === undefined || val === '';
        });

        if (missing.length > 0) {
            setError(`Veuillez répondre à toutes les questions (${missing.length} manquantes).`);
            setLoading(false);
            // Scroll to top error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            // 1. Prepare payload
            const payloadAnswers: Answer[] = flattenedQuestions.map(q => ({
                section: q.section,
                rubrique: q.rubrique,
                question: q.question,
                score: answers[q.id]
            }));

            // 2. n8n payload
            const payload = buildN8NPayload(`${profile.prenom} ${profile.nom}`, profile.email, payloadAnswers);

            // 3. Send to n8n
            const n8nResult = await sendToN8N(payload); // Capture response

            // 4. Save to Supabase (only numeric score stored for Dashboard avg)
            const { data, error: dbError } = await supabase
                .from('diagnostics')
                .insert([{
                    user_id: profile.id,
                    company_id: profile.entreprise_id,
                    questionnaire_title: DETAILED_QUESTIONNAIRE.name,
                    score: Math.round(calculateAverageScore()), // Database expects integer
                    status: 'Terminé',
                    trend: 'stable',
                    team_name: 'Personnel',
                    report_data: n8nResult // Store the full JSON report
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            // 5. Redirect to processing with data AND the saved ID
            navigate('/diagnostic/processing', {
                state: {
                    result: n8nResult,
                    answers: answers,
                    diagnosticId: data?.id
                }
            });

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erreur d'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-slate-400 hover:text-brand-midnight transition-colors">
                <ArrowLeft size={20} />
                <span className="font-bold text-sm">Retour au tableau de bord</span>
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-brand-turquoise/10 rounded-2xl flex items-center justify-center text-brand-turquoise">
                            <Send size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-brand-midnight tracking-tight">Diagnostic Commercial</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pulse Express</p>
                        </div>
                    </div>
                </div>

                {/* Video Intro */}
                <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl aspect-video bg-black">
                    <iframe
                        src="https://player.vimeo.com/video/1127102476?h=0f295b3996&title=0&byline=0&portrait=0"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title="Vimeo Video"
                    ></iframe>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-10">
                    {DETAILED_QUESTIONNAIRE.sections.map((section, si) => (
                        <div key={si} className="space-y-6">
                            <div className="flex items-center space-x-3 text-brand-midnight">
                                <span className="text-base font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg text-brand-turquoise">{section.titre}</span>
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </div>

                            <div className="space-y-6">
                                {section.rubriques.flatMap((rubric) => rubric.questions).map((q, qi) => (
                                    <div key={qi} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 hover:bg-white hover:shadow-md transition-all group">
                                        <p className="text-base font-bold text-brand-midnight">{q.text}</p>

                                        {q.type === 'scale' && (
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex space-x-2 flex-wrap">
                                                    {[0, 1, 2, 3, 4, 5].map((val) => (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => handleAnswerChange(q.code, val)}
                                                            className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${answers[q.code] === val
                                                                ? 'bg-brand-turquoise text-white shadow-lg scale-110'
                                                                : 'bg-white text-slate-400 hover:text-brand-midnight border border-slate-100'
                                                                }`}
                                                        >
                                                            {val}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="hidden sm:flex text-[9px] font-black text-slate-300 uppercase tracking-widest gap-2">
                                                    <span>0=Pas du tout</span>
                                                    <span>5=Totalement</span>
                                                </div>
                                            </div>
                                        )}

                                        {q.type === 'select' && (
                                            <div className="relative">
                                                <select
                                                    value={answers[q.code] || ''}
                                                    onChange={(e) => handleAnswerChange(q.code, e.target.value)}
                                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl appearance-none font-bold text-brand-midnight focus:ring-4 focus:ring-brand-turquoise/10 outline-none"
                                                >
                                                    <option value="" disabled>Sélectionnez une réponse...</option>
                                                    {q.options?.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                            </div>
                                        )}

                                        {q.type === 'multiselect' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {q.options?.map(opt => {
                                                    const selected = (answers[q.code] as string[] || []).includes(opt);
                                                    return (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => handleMultiSelectToggle(q.code, opt)}
                                                            className={`px-4 py-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${selected
                                                                ? 'bg-brand-turquoise text-white shadow-md'
                                                                : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-turquoise'
                                                                }`}
                                                        >
                                                            <span>{opt}</span>
                                                            {selected && <CheckCircle2 size={14} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600 animate-fade-in">
                            <AlertTriangle size={18} />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-brand-turquoise text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-turquoise/20 hover:bg-brand-turquoise-dark transition-all flex items-center justify-center space-x-3 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Traitement en cours...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    <span>Valider mon diagnostic</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TakeDiagnostic;
