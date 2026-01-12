import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, AlertTriangle, LayoutDashboard } from 'lucide-react';
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

const HeaderCard: React.FC<{ meta: DiagnosticMeta, scores: DiagnosticScores }> = ({ meta, scores }) => (
    <div className="bg-gradient-to-br from-[#e0f4f3] via-white to-white rounded-[18px] shadow-sm border border-brand-turquoise/20 p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-brand-midnight mb-1">
                Rapport Pulse+ – {meta.prenom} {meta.nom}
            </h1>
            <p className="text-sm text-slate-500">
                Rôle : <strong>{meta.role || "Collaborateur"}</strong><br />
                ID : {meta.user_id || "-"}
            </p>
            <div className="inline-flex items-center gap-2 bg-[#e0f4f3] text-brand-turquoise rounded-full px-3 py-1 text-xs font-semibold mt-3">
                <span className="w-2 h-2 rounded-full bg-brand-turquoise"></span>
                <span>Évaluation issue du questionnaire Pulse+</span>
            </div>
        </div>

        <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            {/* Radial Gauge CSS-only trick */}
            <div
                className="relative w-[70px] h-[70px] rounded-full flex items-center justify-center font-bold text-brand-midnight text-lg"
                style={{
                    background: `conic-gradient(#03a39b ${scores.global_score_pct}%, #edf2f7 0)`
                }}
            >
                <div className="absolute inset-2 bg-white rounded-full"></div>
                <span className="relative z-10">{scores.global_score_pct}%</span>
            </div>

            <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">Moyenne globale</span>
                <span className="text-xl font-black text-brand-midnight">{scores.global_score?.toFixed(2)} / 5</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${scores.global_niveau?.includes('Fragile') ? 'bg-brand-turquoise/10 text-brand-turquoise' :
                        scores.global_niveau?.includes('Vulnérable') ? 'bg-amber-100 text-amber-600' :
                            scores.global_niveau?.includes('Excellent') ? 'bg-emerald-100 text-emerald-600' :
                                'bg-teal-100 text-teal-700' // Solid default
                    }`}>
                    {scores.global_niveau}
                </span>
            </div>
        </div>
    </div>
);

const SynthesisCard: React.FC<{ synthese: DiagnosticSynthesis, sections: SectionScore[] }> = ({ synthese, sections }) => (
    <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
        <div>
            <h2 className="text-lg font-bold text-brand-midnight mb-2">1. Synthèse globale</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{synthese.resume_global}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-sm">
                <strong className="block text-brand-midnight mb-1">Forces principales</strong>
                <span className="text-slate-500">{synthese.forces_principales}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-sm">
                <strong className="block text-brand-midnight mb-1">Axes de vigilance</strong>
                <span className="text-slate-500">{synthese.axes_de_vigilance}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-sm">
                <strong className="block text-brand-midnight mb-1">Lecture générale</strong>
                <span className="text-slate-500">Ce rapport met en évidence la dynamique globale et les priorités d'action.</span>
            </div>
        </div>

        <div className="pt-4 border-t border-dashed border-slate-200 space-y-3">
            {sections.map(sec => (
                <div key={sec.id} className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2 min-w-[30%]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sec.color || '#03a39b' }}></span>
                        <span className="font-medium text-brand-midnight truncate">{sec.nom}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${sec.score_pct}%`, backgroundColor: sec.color || '#03a39b' }}></div>
                        </div>
                        <div className="text-right min-w-[90px] text-xs text-slate-400 font-medium">
                            {sec.score_pct}% • {sec.niveau}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DetailedAnalysisCard: React.FC<{ analyses: SectionAnalysis[], sections: SectionScore[] }> = ({ analyses, sections }) => (
    <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm p-6 lg:p-8 space-y-8">
        <h2 className="text-lg font-bold text-brand-midnight">2. Analyse détaillée par section</h2>
        <div className="space-y-8">
            {analyses.map(analysis => {
                const secMeta = sections.find(s => s.id === analysis.section_id) || { color: '#03a39b', score_pct: 0, niveau: '-' };
                return (
                    <div key={analysis.section_id} className="pl-4 border-l-4 space-y-4" style={{ borderColor: secMeta.color }}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-base font-bold text-brand-midnight">{analysis.section_nom}</h3>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
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

const RecommendationsCard: React.FC<{ recos: ActionPlanItem[] }> = ({ recos }) => (
    <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-lg font-bold text-brand-midnight mb-2">3. Recommandations & plan d’action</h2>
        <p className="text-sm text-slate-500 mb-6">Les pistes ci-dessous sont priorisées pour faciliter le passage à l’action.</p>

        <ul className="space-y-3">
            {recos.map((reco, idx) => (
                <li key={idx} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-brand-turquoise uppercase tracking-wider">Priorité {reco.priorite}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{reco.horizon}</span>
                    </div>
                    <div className="font-bold text-brand-midnight text-sm mb-1">{reco.titre}</div>
                    <div className="text-xs text-slate-500">{reco.description}</div>
                </li>
            ))}
        </ul>
    </div>
);

const MyResult: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { profile } = useAuth(); // Get auth profile for name fallback
    const { result, answers, diagnosticId } = location.state || {}; // Retrieve passed data
    const [dbReport, setDbReport] = React.useState<DiagnosticReport | null>(null);
    const [loading, setLoading] = React.useState(false);

    const [isCTAOpen, setIsCTAOpen] = React.useState(false);

    // CTA Modal Timer - Every 30 seconds
    React.useEffect(() => {
        const interval = setInterval(() => {
            setIsCTAOpen(true);
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Fetch from DB if no state (e.g. direct link or history)
    // Note: We might want to use a query param or URL param :id
    React.useEffect(() => {
        if (!result && !loading) {
            // Check if we have an ID in URL search params (if we implement history links)
            const searchParams = new URLSearchParams(location.search);
            const id = searchParams.get('id');
            if (id) {
                setLoading(true);
                supabase.from('diagnostics').select('report_data').eq('id', id).single()
                    .then(({ data, error }) => {
                        if (data && data.report_data) {
                            setDbReport(data.report_data);
                        }
                        setLoading(false);
                    });
            }
        }
    }, [location, result]);

    const handleDownloadPDF = async () => {
        const input = document.getElementById('premium-report-content');
        if (!input) return;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 0; // No margin as the design has its own padding/bg
        const availableWidth = pdfWidth;

        // Force display block for capture, although it's off-screen
        input.style.display = 'block';

        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0f1a', // Match theme background
            logging: false,
            windowWidth: 1200 // Force wide render for desktop layout
        });

        // Split into pages if needed (basic A4 ratio check)
        // With this design, it's better to capture sections or the whole thing.
        // Given it's a specific design, let's try to fit or split intelligently.
        // For V1, let's just create a multi-page PDF by slicing the canvas.

        const imgWidth = pdfWidth;
        const pageHeight = pdfHeight;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`Pulse_Express_${profile?.nom || 'Rapport'}.pdf`);

        // Hide again
        input.style.display = 'none';
    };

    let candidateData = dbReport || result;

    if (Array.isArray(result) && result.length > 0) {
        candidateData = result[0];
    }

    // Unwrap 'json' if present
    const reportData: DiagnosticReport = (candidateData && candidateData.json) ? candidateData.json : (candidateData || {});

    // Validation: Check for a key property like 'scores'
    const hasValidData = reportData && reportData.scores;

    // Final data to use (Mock if invalid)
    const finalReportData = hasValidData ? reportData : MOCK_REPORT_DATA;

    // Warning banner if using mock data
    const isMock = !hasValidData;

    return (
        <div className="min-h-screen bg-brand-soft-bg p-4 md:p-8 lg:p-12 animate-fade-in font-sans">
            <div className="max-w-[1120px] mx-auto space-y-6" id="report-content">

                {/* Navigation & Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                        to="/diagnostics"
                        className="flex items-center text-slate-400 hover:text-brand-midnight transition-colors font-bold text-sm"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Retour aux résultats
                    </Link>

                    {/* PDF Download Button */}
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-brand-midnight text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-brand-midnight/20"
                    >
                        <Download size={18} />
                        <span>Télécharger le PDF</span>
                    </button>
                </div>

                {isMock && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                        <AlertTriangle size={18} />
                        <span>Mode démonstration : Affichage de données fictives car le diagnostic n'est pas encore connecté à la nouvelle structure de données.</span>
                    </div>
                )}

                {/* 1. Header Card - Use profile name if meta is generic */}
                <HeaderCard
                    meta={{
                        ...finalReportData.meta,
                        prenom: (finalReportData.meta?.prenom === 'Utilisateur' || !finalReportData.meta?.prenom) && profile?.prenom ? profile.prenom : finalReportData.meta?.prenom,
                        nom: (finalReportData.meta?.nom === '' || !finalReportData.meta?.nom) && profile?.nom ? profile.nom : finalReportData.meta?.nom
                    }}
                    scores={finalReportData.scores || { global_score: 0, global_score_pct: 0, global_niveau: "-", sections: [] }}
                />

                {/* 2. Synthesis Card */}
                <SynthesisCard
                    synthese={finalReportData.synthese || {}}
                    sections={finalReportData.scores?.sections || []}
                />

                {/* 3. Detailed Analysis */}
                <DetailedAnalysisCard
                    analyses={finalReportData.analyse_detaillee_par_sections || []}
                    sections={finalReportData.scores?.sections || []}
                />

                {/* 4. Recommendations */}
                <RecommendationsCard recos={finalReportData.recommandations_et_plan_action || []} />

                {/* 5. Conclusion */}
                <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm p-6 lg:p-8">
                    <h2 className="text-lg font-bold text-brand-midnight mb-2">4. Conclusion</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        {finalReportData.conclusion}
                    </p>
                </div>

                <div className="text-center text-xs text-slate-400 mt-8">
                    Rapport généré automatiquement par votre workflow Pulse+ IA.
                </div>
            </div>

            {/* Hidden container for PDF generation */}
            <div style={{ position: 'absolute', top: -10000, left: -10000, overflow: 'hidden' }}>
                <PremiumReport report={{
                    ...finalReportData,
                    meta: {
                        ...finalReportData.meta,
                        // Ensure we use the latest profile name if available
                        prenom: profile?.prenom || finalReportData.meta?.prenom || 'Utilisateur',
                        nom: profile?.nom || finalReportData.meta?.nom || '',
                        role: profile?.role || finalReportData.meta?.role || 'Individuel'
                    }
                }} />
            </div>

            <CallToActionModal isOpen={isCTAOpen} onClose={() => setIsCTAOpen(false)} />
        </div>
    );
};

export default MyResult;
