import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, AlertTriangle, LayoutDashboard, FileText, ArrowRight, X, Lock } from 'lucide-react';
import PremiumReport from '../components/PremiumReport';
import { CallToActionModal } from '../components/CallToActionModal';

import { DiagnosticReport, DiagnosticMeta, DiagnosticScores, DiagnosticSynthesis, SectionAnalysis, ActionPlanItem, SectionScore } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// --- MOCK DATA FOR DEV/FALLBACK ---
const MOCK_REPORT_DATA: DiagnosticReport = {
    meta: {
        prenom: "Utilisateur",
        nom: "Démo",
        role: "Individuel",
        user_id: "USER-123"
    },
    scores: {
        global_score: 3.4,
        global_score_pct: 68,
        global_niveau: "Solide",
        global_color: "#20a4a0",
        sections: [
            { id: "s1", nom: "Entreprise & Contexte", score: 4.2, score_pct: 84, niveau: "Excellent", color: "#5cb85c" },
            { id: "s2", nom: "Vision & Formalisation", score: 2.8, score_pct: 56, niveau: "Fragile", color: "#3fb4b1" },
            { id: "s3", nom: "Utilisation du CRM", score: 3.5, score_pct: 70, niveau: "Solide", color: "#20a4a0" },
            { id: "s4", nom: "Discipline & Suivi", score: 1.5, score_pct: 30, niveau: "Vulnérable", color: "#ffb020" }
        ]
    },
    synthese: {
        resume_global: "Votre organisation commerciale montre de belles forces structurelles mais pêche dans l'exécution quotidienne.",
        forces_principales: "Alignement stratégique, Outils en place",
        axes_de_vigilance: "Adoption CRM, Discipline de saisie, Rituels managériaux"
    },
    analyse_detaillee_par_sections: [
        {
            section_id: "s2",
            section_nom: "Vision & Formalisation",
            themes: [
                { titre: "Clarté du cycle", texte: "Le cycle est défini mais mal connu des nouveaux arrivants." },
                { titre: "Définitions", texte: "Les critères de sortie d'étape sont flous." }
            ]
        },
        {
            section_id: "s4",
            section_nom: "Discipline & Suivi",
            themes: [
                { titre: "Rigueur CRM", texte: "Moins de 50% des opportunités sont à jour." },
                { titre: "Pilotage", texte: "Le management se fait 'au doigt mouillé' plutôt que sur la data." }
            ]
        }
    ],
    recommandations_et_plan_action: [
        { priorite: 1, titre: "Formaliser les étapes de vente", description: "Créer un playbook simple d'une page.", horizon: "Court terme" },
        { priorite: 2, titre: "Nettoyer le CRM", description: "Archiver les vieilles opportunités (> 6 mois).", horizon: "Immédiat" },
        { priorite: 3, titre: "Instaurer une revue de pipeline hebdo", description: "30 min par commercial, focus sur les points bloquants.", horizon: "Moyen terme" }
    ],
    conclusion: "En résumé, une base saine qui ne demande qu'à être exploitée avec plus de rigueur."
};

// --- COMPONENTS ---

// Helper for score colors
const getScoreColor = (score: number, level?: string): string => {
    const lvl = level?.toLowerCase() || '';
    if (lvl.includes('excellent')) return '#10b981'; // Green-500
    if (lvl.includes('solide')) return '#059669';   // Emerald-600
    if (lvl.includes('fragile')) return '#f59e0b';  // Amber-500
    if (lvl.includes('critique') || lvl.includes('vulnérable')) return '#ef4444'; // Red-500
    // Fallback based on score if no level text
    if (score >= 4.5) return '#10b981';
    if (score >= 3.5) return '#059669';
    if (score >= 2.5) return '#f59e0b';
    return '#ef4444';
};

const getPriorityColor = (priorite: number): string => {
    switch (priorite) {
        case 1: return 'bg-red-100 text-red-700';
        case 2: return 'bg-orange-100 text-orange-700';
        case 3: return 'bg-emerald-100 text-emerald-700';
        default: return 'bg-emerald-100 text-emerald-700';
    }
};

const getHorizonColor = (horizon: string): string => {
    const h = horizon.toLowerCase();
    if (h.includes('immédiat')) return 'bg-red-100 text-red-700';
    if (h.includes('court')) return 'bg-orange-100 text-orange-700';
    if (h.includes('moyen')) return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
};

const HeaderCard = ({ report, scoreColor }: { report: DiagnosticReport, scoreColor: string }) => {
    const scores = report.scores;
    return (
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Rapport de Diagnostic Pulse+</h1>
                    <div className="text-slate-500 text-sm flex gap-4">
                        <p>Préparé pour : <span className="font-semibold text-[#0f172a]">{report.meta?.prenom} {report.meta?.nom}</span></p>
                        <p>Date : {new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-black mb-1" style={{ color: scoreColor }}>{scores?.global_score?.toFixed(1) || '-'}<span className="text-2xl text-slate-300 font-normal">/5</span></div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white`}
                        style={{ backgroundColor: scoreColor }}>
                        {scores?.global_niveau || '-'}
                    </span>
                </div>
            </div>
        </div>
    );
};

const SynthesisCard = ({ synthese }: { synthese: DiagnosticSynthesis }) => {
    // Debug log to check incoming data
    console.log("Synthesis Data:", synthese);

    return (
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#e0f4f3] text-[#03a39b] flex items-center justify-center text-sm font-bold">1</span>
                Synthèse Exécutive
            </h2>

            <div className="space-y-6">
                {/* General Analysis Only */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Synthèse générale
                    </h3>
                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {synthese.resume_global || "La synthèse globale de votre performance commerciale sera disponible une fois le traitement terminé."}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailedAnalysisCard: React.FC<{ analyses: SectionAnalysis[], sections: SectionScore[] }> = ({ analyses, sections }) => (
    <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm p-6 lg:p-8 space-y-8 relative overflow-hidden">
        <h2 className="text-lg font-bold text-brand-midnight">2. Analyse détaillée par section</h2>

        <div className="space-y-8">
            {analyses.map(analysis => {
                const secMeta = sections.find(s => s.id === analysis.section_id) || { color: '#03a39b', score_pct: 0, niveau: '-', score: 0 };
                const color = getScoreColor(secMeta.score!, secMeta.niveau);
                return (
                    <div key={analysis.section_id} className="pl-4 border-l-4 space-y-4" style={{ borderColor: color }}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-base font-bold text-brand-midnight">{analysis.section_nom}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color: color }}>
                                Score : {secMeta.score_pct}% • {secMeta.niveau}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {analysis.themes.map((theme, idx) => (
                                <div key={idx} className="bg-slate-50 rounded-xl p-3">
                                    <div className="text-xs font-bold text-brand-midnight mb-1">{theme.titre}</div>
                                    <div className="text-xs text-slate-500">{theme.texte}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const RecommendationsCard = ({ recommendations }: { recommendations: ActionPlanItem[] }) => (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative">
        <h2 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#e0f4f3] text-[#03a39b] flex items-center justify-center text-sm font-bold">
                3
            </span>
            Recommandations & Plan d'Action
        </h2>
        <div className="space-y-4">
            {recommendations.map((reco, idx) => (
                <li key={idx} className="border border-slate-100 rounded-xl p-5 hover:border-[#03a39b]/30 transition-colors bg-slate-50/30">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-[#0f172a] text-sm md:text-base">{reco.titre}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ml-2 ${getHorizonColor(reco.horizon)}`}>
                            {reco.horizon}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{reco.description}</p>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getPriorityColor(reco.priorite)}`}>Priorité {reco.priorite}</span>
                    </div>
                </li>
            ))}
        </div>
    </div>
);

// Placeholder for Layout component if it's not defined elsewhere
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

import { sendToN8N, buildN8NPayload } from '../services/n8nService';

const MyResult: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useAuth();
    const [resultData, setResultData] = useState<DiagnosticReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEphemeral, setIsEphemeral] = useState(false);
    const [showCTAModal, setShowCTAModal] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Capture diagnosticId and answers which are critical for the update
    const diagnosticId = location.state?.diagnosticId;
    const answers = location.state?.answers;

    useEffect(() => {
        if (location.state?.ephemeral) {
            setIsEphemeral(true);
        }
    }, [location]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Handle data passed from DiagnosticProcessing (key: result or resultData)
                const incomingData = location.state?.result || location.state?.resultData;

                if (incomingData) {
                    console.log("Using result data from navigation state");
                    setResultData(incomingData);
                    // If we have state data, it's considered ephemeral unless we have a user session that matches
                    setIsEphemeral(true);
                    setLoading(false);
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('diagnostics')
                    .select('report_data') // Select report_data directly
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (error) throw error;
                if (data && data.report_data) {
                    setResultData(data.report_data as DiagnosticReport);
                }

                setLoading(false);
            } catch (err: any) {
                console.error("Error loading results:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, location]);

    useEffect(() => {
        if (isEphemeral) {
            const timer = setTimeout(() => {
                setShowCTAModal(true);
            }, 60000); // 1 minute
            return () => clearTimeout(timer);
        }
    }, [isEphemeral]);

    if (loading) return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#03a39b] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Chargement de votre rapport...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f8fafc] p-8 flex justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-lg text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Impossible de charger le rapport</h2>
                <p className="text-slate-600 mb-6">{error}</p>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                    Retour à l'accueil
                </button>
            </div>
        </div>
    );

    if (!resultData) return (
        <div className="min-h-screen bg-[#f8fafc] p-8 flex justify-center items-center">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Aucun résultat disponible</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Il semble que vous n'ayez pas encore effectué de diagnostic ou que votre session ait expiré.
                </p>
                <button onClick={() => navigate('/diagnostic/start')} className="inline-flex items-center gap-2 px-8 py-3 bg-[#03a39b] text-white rounded-xl font-bold shadow-lg shadow-[#03a39b]/20 hover:bg-[#02847e] transition-all transform hover:-translate-y-0.5">
                    Lancer un diagnostic
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const scoreColor = getScoreColor(resultData.scores?.global_score || 0, resultData.scores?.global_niveau);

    const handleDownloadPDF = async () => {
        const input = document.getElementById('premium-report-content');
        if (!input) return;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 0;
        const availableWidth = pdfWidth;

        input.style.display = 'block';

        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0f1a',
            logging: false,
            windowWidth: 1200
        });

        const imgWidth = pdfWidth;
        const pageHeight = pdfHeight;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;

            if (heightLeft < pageHeight - 1) {
                pdf.addPage([pdfWidth, heightLeft], 'p');
            } else {
                pdf.addPage();
            }

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const fileName = `Pulse_Express_${(profile?.nom || resultData.meta?.nom || 'Utilisateur').replace(/Utilisateur/i, '').trim()}.pdf`;
        pdf.save(fileName);

        input.style.display = 'none';
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput || !emailInput.includes('@')) return; // Basic validation

        setIsSubmitting(true);

        try {
            let userId = emailInput; // Fallback to email if profile creation fails/not needed

            // 1. Sync with Profiles Table
            try {
                // Check if profile exists
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', emailInput)
                    .single();

                if (existingProfile) {
                    userId = existingProfile.id;
                    console.log("Found existing profile:", userId);
                } else {
                    // Create new profile (Lead)
                    const newId = crypto.randomUUID();
                    console.log("Creating new profile (lead):", newId);

                    const { error: createError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: newId,
                            email: emailInput,
                            prenom: resultData?.meta?.prenom || 'Utilisateur',
                            nom: resultData?.meta?.nom || '',
                            role: 'INDIVIDUEL',
                            created_at: new Date().toISOString()
                        }]);

                    if (!createError) {
                        userId = newId;
                    } else {
                        console.error("Profile creation error", createError);
                        // If FK constraint to auth.users fails, we just continue with email as metadata specific to diagnostics
                        // or user_id column might be text and accept email. 
                        // If user_id IS a foreign key to auth.users, this INSERT will fail if we use a random UUID. 
                        // Assuming 'profiles' might be a separate table or looser constraint for leads based on user request.
                    }
                }
            } catch (profileErr) {
                console.error("Profile Sync Error", profileErr);
            }

            // 2. Update Diagnostic in DB
            if (diagnosticId) {
                console.log("Updating diagnostic owner...", diagnosticId, userId);
                const { error: dbError } = await supabase
                    .from('diagnostics')
                    .update({
                        user_id: userId, // Link to profile ID or Email
                    })
                    .eq('id', diagnosticId);

                if (dbError) console.error("DB Update Error", dbError);
            }

            // 3. Trigger N8N Webhook with answers and new email
            if (answers && resultData) {
                console.log("Triggering N8N with email", emailInput);
                const n8nPayload = buildN8NPayload(
                    `${resultData.meta?.prenom} ${resultData.meta?.nom}`,
                    emailInput,
                    answers
                );

                // Fire and forget - don't block UI on webhook response
                sendToN8N(n8nPayload, { role: 'INDIVIDUEL', ...resultData.meta }).catch(err => {
                    console.error("N8N Webhook failed", err);
                });
            }

            // 4. Unlock and Download
            setIsEphemeral(false);
            setShowCTAModal(false);

            setTimeout(() => {
                handleDownloadPDF();
            }, 500);

        } catch (err) {
            console.error("Submission error", err);
            // Fallback: unlock anyway so user isn't stuck
            setIsEphemeral(false);
            setShowCTAModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#f8fafc] pb-20 font-['Inter']">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <HeaderCard report={resultData} scoreColor={scoreColor} />

                    <SynthesisCard synthese={resultData.synthese || {}} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h3 className="font-bold text-[#0f172a] mb-4 text-sm uppercase tracking-wide">Détail des scores</h3>
                                <div className="space-y-4">
                                    {(resultData.scores?.sections || []).map((sec, idx) => {
                                        const sColor = getScoreColor(sec.score, sec.niveau);
                                        return (
                                            <div key={idx}>
                                                <div className="flex justify-between text-sm mb-1.5">
                                                    <span className="font-medium text-slate-700">{sec.nom}</span>
                                                    <span className="font-bold" style={{ color: sColor }}>{sec.score?.toFixed(1)}/5</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${sec.score_pct}%`, backgroundColor: sColor }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* CTA Box for PDF */}
                            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-6 text-center text-white shadow-lg">
                                <div className="mb-4 flex justify-center">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Votre rapport complet</h3>
                                <p className="text-sm text-slate-300 mb-6">Téléchargez la version PDF détaillée de votre diagnostic commercial.</p>
                                <button
                                    onClick={() => {
                                        if (isEphemeral) {
                                            setShowCTAModal(true);
                                        } else {
                                            handleDownloadPDF();
                                        }
                                    }}
                                    className="w-full py-3 bg-[#03a39b] hover:bg-[#02847e] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    Télécharger le PDF
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            {/* DETAILED ANALYSIS - ALWAYS VISIBLE (No Blur) */}
                            <DetailedAnalysisCard analyses={resultData.analyse_detaillee_par_sections || []} sections={resultData.scores?.sections || []} />

                            {/* RECOMMENDATIONS with BLUR if Ephemeral */}
                            <div className="relative">
                                <div className={isEphemeral ? "filter blur-sm select-none pointer-events-none opacity-60" : ""}>
                                    <RecommendationsCard recommendations={resultData.recommandations_et_plan_action || []} />
                                </div>
                                {isEphemeral && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50 max-w-md">
                                            <Lock className="w-12 h-12 text-[#03a39b] mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Plan d'action personnalisé</h3>
                                            <p className="text-slate-600 mb-6">Veuillez entrer votre email pour découvrir vos recommandations prioritaires.</p>
                                            <button onClick={() => setShowCTAModal(true)} className="px-8 py-3 bg-[#03a39b] hover:bg-[#02847e] text-white font-bold rounded-xl shadow-lg shadow-[#03a39b]/20 transition-all transform hover:-translate-y-0.5">
                                                Débloquer mes recommandations
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Component */}
            <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
                <PremiumReport report={{
                    ...resultData,
                    meta: {
                        ...resultData.meta,
                        prenom: (profile?.prenom || resultData.meta?.prenom || 'Utilisateur').replace(/Utilisateur/i, '').trim(),
                        nom: (profile?.nom || resultData.meta?.nom || '').replace(/Utilisateur/i, '').trim(),
                        role: profile?.role || resultData.meta?.role || 'Individuel',
                        user_id: resultData.meta?.user_id === 'invite@demo.com' ? 'invite@keepgrowing.fr' : (resultData.meta?.user_id || 'invite@keepgrowing.fr')
                    }
                }} />
            </div>

            {/* CTA MODAL */}
            {showCTAModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center relative">
                            <button
                                onClick={() => setShowCTAModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-16 h-16 bg-[#e0f4f3] rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <FileText className="w-8 h-8 text-[#03a39b]" />
                            </div>

                            <h3 className="text-2xl font-bold text-[#0f172a] mb-3">Sauvegardez votre rapport</h3>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                Votre diagnostic est prêt ! Entrez votre email pour recevoir votre rapport PDF complet et accéder à votre espace personnel.
                            </p>

                            <form className="space-y-4" onSubmit={handleEmailSubmit}>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="votre@email.com"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#03a39b] focus:border-transparent outline-none transition-all font-medium text-[#0f172a] placeholder:text-slate-400"
                                        autoFocus
                                        required
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 bg-[#03a39b] hover:bg-[#02847e] text-white text-lg font-bold rounded-xl shadow-lg shadow-[#03a39b]/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {isSubmitting ? 'Enregistrement...' : 'Voir mon résultat complet'}
                                </button>
                            </form>

                            <p className="mt-6 text-xs text-slate-400">
                                En continuant, vous acceptez nos CGU et notre politique de confidentialité.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MyResult;
