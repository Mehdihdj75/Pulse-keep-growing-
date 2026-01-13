import React from 'react';
import { DiagnosticReport, SectionScore, SectionAnalysis } from '../types';

interface PremiumReportProps {
    report: DiagnosticReport;
    date?: string;
}

const PremiumReport: React.FC<PremiumReportProps> = ({ report, date }) => {
    // Helper to get color based on score or default
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

    // Construct QuickChart URLs
    const getGaugeUrl = (scorePct: number, color: string) => {
        const config = {
            type: 'gauge',
            data: {
                datasets: [{
                    value: scorePct,
                    data: [25, 50, 75, 100],
                    backgroundColor: ['#ef6355', '#f59e0b', '#03a39b', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                valueLabel: { display: true, fontSize: 18, color: '#ffffff', backgroundColor: 'transparent', bottomMarginPercentage: 5 },
                needle: { radiusPercentage: 2, widthPercentage: 3.2, lengthPercentage: 80, color: '#ffffff' }
            }
        };
        return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&w=180&h=100&bkg=transparent`;
    };

    const getRadarUrl = (sections: SectionScore[]) => {
        const labels = sections.map(s => s.nom.substring(0, 15));
        const data = sections.map(s => s.score_pct);
        const config = {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Score',
                    data: data,
                    backgroundColor: 'rgba(3,163,155,0.3)',
                    borderColor: '#03a39b',
                    borderWidth: 2,
                    pointBackgroundColor: '#03a39b',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                legend: { display: false },
                scale: {
                    ticks: { beginAtZero: true, max: 100, stepSize: 25, fontColor: '#94a3b8', backdropColor: 'transparent' },
                    pointLabels: { fontColor: '#94a3b8', fontSize: 11 },
                    gridLines: { color: 'rgba(255,255,255,0.1)' },
                    angleLines: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        };
        return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&w=300&h=260&bkg=%230a0f1a`;
    };

    const styles = `
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
    .premium-report-root { --bg:#0a0f1a;--bg-card:#111827;--bg-section:#1a2332;--bg-rubrique:#0d1219;--primary:#03a39b;--primary-light:rgba(3,163,155,0.15);--text:#f1f5f9;--text-soft:#94a3b8;--text-muted:#64748b;--border:rgba(255,255,255,0.08);--success:#10b981;--warning:#f59e0b;--danger:#ef6355; font-family:"Inter",system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.5;padding:32px; padding-bottom: 1px; width: 1100px; margin: 0 auto; }
    .premium-report-root * { box-sizing:border-box;margin:0;padding:0; }
    .premium-report-root .report-header{background:var(--bg-card);border-radius:16px;padding:28px 32px;margin-bottom:24px;border:1px solid var(--border);}
    .premium-report-root .header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);}
    .premium-report-root .header-left{display:flex;align-items:center;gap:16px;}
    .premium-report-root .logo{width:44px;height:44px;}
    .premium-report-root .header-title{font-size:22px;font-weight:700;}
    .premium-report-root .header-subtitle{font-size:14px;color:var(--text-soft);margin-top:2px;}
    .premium-report-root .header-date{font-size:12px;color:var(--text-muted);}
    .premium-report-root .header-content{display:grid;grid-template-columns:200px 1fr 260px;gap:28px;align-items:start;}
    .premium-report-root .main-score-box{text-align:center;padding:20px;background:var(--bg-section);border-radius:12px;}
    .premium-report-root .main-score-box h3{font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;}
    .premium-report-root .chart-img{display:block;margin:0 auto;max-width:100%;}
    .premium-report-root .score-label-main{font-size:12px;color:var(--text-soft);margin-top:8px;}
    .premium-report-root .spider-box{text-align:center;}
    .premium-report-root .spider-box h3{font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;}
    .premium-report-root .score-list{background:var(--bg-section);border-radius:12px;padding:16px;}
    .premium-report-root .score-list h4{font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;}
    .premium-report-root .score-item{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);}
    .premium-report-root .score-item:last-child{border-bottom:none;}
    .premium-report-root .score-item-name{font-size:12px;color:var(--text);flex:1;padding-right:12px;}
    .premium-report-root .score-item-sub{font-size:10px;color:var(--text-muted);display:block;}
    .premium-report-root .score-badge{display: inline-flex; align-items: center; justify-content: center; height: 24px; padding:0 12px; border-radius:6px; font-size:11px; font-weight:600; color:#fff; white-space:nowrap; vertical-align: middle; line-height: 1;}
    .premium-report-root .section-block{background:var(--bg-card);border-radius:16px;margin-bottom:24px;border:1px solid var(--border);overflow:hidden; page-break-inside: avoid;}
    .premium-report-root .section-header{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:var(--bg-section);border-bottom:1px solid var(--border);}
    .premium-report-root .section-title{font-size:15px;font-weight:600;color:var(--primary);}
    .premium-report-root .section-title span{color:var(--text);}
    .premium-report-root .section-content{display:grid;grid-template-columns:1fr;gap:24px;padding:24px;}
    .premium-report-root .section-analysis h4{font-size:12px;color:var(--primary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;}
    .premium-report-root .section-analysis p{font-size:14px;color:var(--text-soft);line-height:1.6;margin-bottom:16px;}
    .premium-report-root .section-reco{background:var(--primary-light);border-radius:8px;padding:12px 14px;border-left:3px solid var(--primary);}
    .premium-report-root .section-reco h5{font-size:11px;color:var(--primary);text-transform:uppercase;margin-bottom:6px;}
    .premium-report-root .section-reco p{font-size:13px;color:var(--text-soft);margin:0;}
    .premium-report-root .rubriques-list{padding:0 24px 24px;}
    .premium-report-root .rubrique-card{background:var(--bg-rubrique);border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid var(--border);}
    .premium-report-root .rubrique-card:last-child{margin-bottom:0;}
    .premium-report-root .rubrique-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;}
    .premium-report-root .rubrique-num{font-size:11px;color:var(--text-muted);margin-bottom:4px;}
    .premium-report-root .rubrique-title{font-size:14px;font-weight:600;color:var(--primary);}
    .premium-report-root .rubrique-subtitle{font-size:13px;color:var(--text-soft);margin-top:4px;}
    .premium-report-root .rubrique-body{margin-top:12px;}
    .premium-report-root .rubrique-analysis h5{font-size:11px;color:var(--primary);text-transform:uppercase;margin-bottom:6px;}
    .premium-report-root .rubrique-analysis p{font-size:13px;color:var(--text-soft);margin-bottom:12px;}
    .premium-report-root .report-footer{text-align:center;padding:24px; padding-bottom: 0px; margin-bottom: 0px; color:var(--text-muted);font-size:10px; opacity: 0.6;}
    `;

    // Filter out "Coordonnées" sections for the report
    const filteredSections = (report.scores?.sections || []).filter(sec =>
        !sec.nom.toLowerCase().includes('coordonnées')
    );

    return (
        <div id="premium-report-content" className="premium-report-root" style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '40px',
            backgroundColor: 'white',
            fontFamily: 'Inter, sans-serif',
            color: '#1e293b',
            position: 'relative'
        }}>
            <style>{styles}</style>

            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Rapport de Diagnostic Pulse+</h1>
                    <div className="text-slate-500 text-sm">
                        <p>Préparé pour : <span className="font-semibold text-[#0f172a]">{report.meta.prenom} {report.meta.nom}</span></p>
                        <p>Date : {date || new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black text-[#03a39b] mb-1">{report.scores.global_score?.toFixed(1)}<span className="text-lg text-slate-300">/5</span></div>
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: getScoreColor(report.scores.global_score, report.scores.global_niveau) }}>
                        {report.scores.global_niveau}
                    </div>
                </div>
            </div>

            {/* Synthesis */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#e0f4f3] text-[#03a39b] flex items-center justify-center text-sm">1</span>
                    Synthèse Exécutive
                </h2>
                <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-sm text-slate-600 leading-relaxed shadow-sm">
                    {report.synthese.resume_global}
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-5">
                        <h3 className="font-bold text-emerald-800 mb-2 text-sm uppercase tracking-wide">Forces identifiées</h3>
                        <p className="text-sm text-emerald-900/80">{report.synthese.forces_principales || "Information non disponible"}</p>
                    </div>
                    <div className="border border-amber-100 bg-amber-50/50 rounded-xl p-5">
                        <h3 className="font-bold text-amber-800 mb-2 text-sm uppercase tracking-wide">Points de vigilance</h3>
                        <p className="text-sm text-amber-900/80">{report.synthese.axes_de_vigilance || "Information non disponible"}</p>
                    </div>
                </div>
            </div>

            {/* Scores List */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#e0f4f3] text-[#03a39b] flex items-center justify-center text-sm">2</span>
                    Détail des Scores
                </h2>
                <div className="space-y-3">
                    {filteredSections.map((sec, idx) => {
                        const color = getScoreColor(sec.score, sec.niveau);
                        return (
                            <div key={idx} className="flex items-center gap-4 text-sm">
                                <div className="w-1/3 font-medium text-slate-700">{sec.nom}</div>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${sec.score_pct}%`, backgroundColor: color }}></div>
                                </div>
                                <div className="score-badge" style={{ backgroundColor: color }}>
                                    {sec.score_pct}%
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* SECTIONS */}
            {(report.analyse_detaillee_par_sections || []).map((analysisDetails, idx) => {
                const sec = report.scores?.sections?.find(s => s.id === analysisDetails.section_id);
                if (!sec || sec.nom.toLowerCase().includes('coordonnées')) return null;

                const sectionColor = getScoreColor(sec.score, sec.niveau);

                return (
                    <div key={sec.id || idx} className="mb-12">
                        <h2 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-[#e0f4f3] text-[#03a39b] flex items-center justify-center text-sm">{idx + 3}</span>
                            {sec.nom}
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ml-auto"
                                style={{ backgroundColor: sectionColor }}>
                                {sec.niveau}
                            </span>
                        </h2>
                        <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-sm text-slate-600 leading-relaxed shadow-sm">
                            {analysisDetails.resume_section}
                        </div>

                        {/* RUBRIQUES (Themes) */}
                        <div className="space-y-6">
                            {(analysisDetails.themes || []).map((theme, tIdx) => (
                                <div key={tIdx} className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm">
                                    <h3 className="font-bold text-[#0f172a] mb-2 text-base">{theme.titre}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{theme.texte}</p>
                                    {theme.recommandations && theme.recommandations.length > 0 && (
                                        <div className="bg-blue-50 border-l-4 border-blue-200 p-4 text-sm text-blue-800">
                                            <h4 className="font-semibold mb-2">Recommandations :</h4>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {theme.recommandations.map((reco, rIdx) => (
                                                    <li key={rIdx}>{reco}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* RECOMMENDATIONS SECTION */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#e0f4f3] text-[#03a39b] flex items-center justify-center text-sm">
                        {(report.analyse_detaillee_par_sections || []).filter(sec => !report.scores?.sections?.find(s => s.id === sec.section_id)?.nom.toLowerCase().includes('coordonnées')).length + 3}
                    </span>
                    Recommandations Générales & Plan d'Action
                </h2>
                <div className="space-y-6">
                    {(report.recommandations_et_plan_action || []).map((reco, idx) => (
                        <div key={idx} className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-[#0f172a] text-base">{reco.titre}</h3>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <span className="px-2 py-1 rounded-full bg-slate-100">Priorité: {reco.priorite}</span>
                                    <span className="px-2 py-1 rounded-full bg-slate-100">Horizon: {reco.horizon}</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{reco.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="text-center text-xs text-slate-400 pt-8 border-t border-slate-100">
                Rapport généré par Pulse Express • {date || new Date().toLocaleDateString('fr-FR')}
            </footer>
        </div>
    );
};

export default PremiumReport;
