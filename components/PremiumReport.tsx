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

    const getHorizonStyle = (horizon: string) => {
        const h = horizon.toLowerCase();
        if (h.includes('immédiat')) return { backgroundColor: '#fee2e2', color: '#b91c1c' }; // red-100/700
        if (h.includes('court')) return { backgroundColor: '#ffedd5', color: '#c2410c' };   // orange-100/700
        if (h.includes('moyen')) return { backgroundColor: '#fef3c7', color: '#b45309' };   // amber-100/700
        return { backgroundColor: '#d1fae5', color: '#047857' };                            // emerald-100/700
    };

    const getPriorityStyle = (priorite: number) => {
        switch (priorite) {
            case 1: return { backgroundColor: '#fee2e2', color: '#b91c1c' };
            case 2: return { backgroundColor: '#ffedd5', color: '#c2410c' };
            case 3: return { backgroundColor: '#d1fae5', color: '#047857' };
            default: return { backgroundColor: '#d1fae5', color: '#047857' };
        }
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
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap");
    
    .premium-report-root {
        --primary: #03a39b;
        --primary-light: #e0f4f3;
        --slate-50: #f8fafc;
        --slate-100: #f1f5f9;
        --slate-200: #e2e8f0;
        --slate-300: #cbd5e1;
        --slate-400: #94a3b8;
        --slate-500: #64748b;
        --slate-600: #475569;
        --slate-700: #334155;
        --slate-800: #1e293b;
        --slate-900: #0f172a;
        --emerald-500: #10b981;
        --emerald-600: #059669;
        --amber-500: #f59e0b;
        --red-100: #fee2e2;
        --red-700: #b91c1c;
        --orange-100: #ffedd5;
        --orange-700: #c2410c;
        
        font-family: "Inter", system-ui, -apple-system, sans-serif;
        background: white;
        color: var(--slate-800);
        line-height: 1.6;
        padding: 60px 70px; 
        width: 210mm;
        margin: 0 auto;
        position: relative;
        box-sizing: border-box;
    }

    .premium-report-root * { box-sizing: border-box; margin: 0; padding: 0; }

    /* Typography */
    .premium-report-root h1 { font-size: 32px; font-weight: 700; color: var(--slate-900); margin-bottom: 8px; }
    .premium-report-root h2 { font-size: 24px; font-weight: 700; color: var(--slate-900); margin-bottom: 32px; display: flex; align-items: center; gap: 16px; }
    .premium-report-root h3 { font-size: 18px; font-weight: 700; color: var(--slate-900); margin-bottom: 12px; }
    .premium-report-root p { font-size: 15px; color: var(--slate-600); }

    /* Badges & Tags */
    .premium-report-root .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 16px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: normal;
        text-align: center;
        min-width: 100px;
        line-height: 1.2;
    }

    .premium-report-root .tag {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
    }

    /* Layout Utilities */
    .premium-report-root .flex { display: flex; }
    .premium-report-root .items-center { align-items: center; }
    .premium-report-root .justify-between { justify-content: space-between; }
    .premium-report-root .gap-2 { gap: 8px; }
    .premium-report-root .gap-4 { gap: 16px; }
    .premium-report-root .gap-6 { gap: 24px; }
    .premium-report-root .mb-8 { margin-bottom: 32px; }
    .premium-report-root .mb-12 { margin-bottom: 48px; }
    .premium-report-root .mb-16 { margin-bottom: 64px; }
    .premium-report-root .w-full { width: 100%; }
    
    /* Specific Components */
    .premium-report-root .header {
        border-bottom: 1px solid var(--slate-100);
        padding-bottom: 32px;
        margin-bottom: 48px;
    }

    .premium-report-root .score-main {
        font-size: 48px;
        font-weight: 900;
        color: var(--primary);
        line-height: 1;
    }

    .premium-report-root .score-sub {
        font-size: 24px;
        color: var(--slate-300);
    }

    .premium-report-root .section-number {
        width: 40px;
        height: 40px;
        background: var(--primary-light);
        color: var(--primary);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 600;
    }

    .premium-report-root .card {
        background: var(--slate-50);
        border-radius: 16px;
        padding: 32px;
        border: 1px solid var(--slate-100);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .premium-report-root .white-card {
        background: white;
        border: 1px solid var(--slate-100);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    /* Progress Bars */
    .premium-report-root .progress-container {
        flex: 1;
        height: 12px;
        background: var(--slate-100);
        border-radius: 9999px;
        overflow: hidden;
    }

    .premium-report-root .progress-bar {
        height: 100%;
        border-radius: 9999px;
    }

    .premium-report-root .score-badge-small {
        height: 28px;
        padding: 0 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 45px;
    }

    .premium-report-root footer {
        text-align: center;
        font-size: 12px;
        color: var(--slate-400);
        padding-top: 32px;
        border-top: 1px solid var(--slate-100);
        margin-top: 48px;
    }
    `;

    // Filter out "Coordonnées" sections for the report
    const filteredSections = (report.scores?.sections || []).filter(sec =>
        !sec.nom.toLowerCase().includes('coordonnées')
    );

    return (
        <div id="premium-report-content" className="premium-report-root" style={{
            width: '210mm',
            backgroundColor: 'white',
            position: 'relative'
        }}>
            <style>{styles}</style>

            {/* Header */}
            <div className="header flex justify-between items-center">
                <div>
                    <h1>Rapport de Diagnostic Pulse+</h1>
                    <div style={{ fontSize: '14px', color: 'var(--slate-500)' }}>
                        <p>Préparé pour : <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{report.meta.prenom} {report.meta.nom}</span></p>
                        <p>Date : {date || new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="score-main">{report.scores.global_score?.toFixed(1)}<span className="score-sub">/5</span></div>
                    <div className="badge" style={{ backgroundColor: getScoreColor(report.scores.global_score, report.scores.global_niveau), color: 'white', marginTop: '8px' }}>
                        {report.scores.global_niveau}
                    </div>
                </div>
            </div>

            {/* Synthesis */}
            <div className="mb-16">
                <h2>
                    <span className="section-number">1</span>
                    Synthèse Exécutive
                </h2>
                <div className="card">
                    <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-500)', marginBottom: '8px' }}>
                        Synthèse générale
                    </h3>
                    <p style={{ fontSize: '16px', color: 'var(--slate-700)', lineHeight: 1.6 }}>
                        {report.synthese.resume_global}
                    </p>
                </div>
            </div>

            {/* Scores List */}
            <div className="mb-16">
                <h2>
                    <span className="section-number">2</span>
                    Détail des Scores
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {filteredSections.map((sec, idx) => {
                        const color = getScoreColor(sec.score, sec.niveau);
                        return (
                            <div key={idx} className="flex items-center gap-6">
                                <div style={{ width: '30%', fontWeight: 500, color: 'var(--slate-700)', fontSize: '15px' }}>{sec.nom}</div>
                                <div className="progress-container">
                                    <div className="progress-bar" style={{ width: `${sec.score_pct}%`, backgroundColor: color }}></div>
                                </div>
                                <div className="score-badge-small" style={{ backgroundColor: color }}>
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
                    <div key={sec.id || idx} className="mb-16">
                        <div className="flex justify-between items-center mb-8">
                            <h2 style={{ marginBottom: 0 }}>
                                <span className="section-number">{idx + 3}</span>
                                {sec.nom}
                            </h2>
                            <div className="badge" style={{ backgroundColor: sectionColor, color: 'white' }}>
                                {sec.niveau}
                            </div>
                        </div>

                        <p style={{ fontSize: '15px', color: 'var(--slate-600)', marginBottom: '24px' }}>
                            {analysisDetails.resume_section}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {(analysisDetails.themes || []).map((theme, tIdx) => (
                                <div key={tIdx} className="white-card">
                                    <h3 style={{ marginBottom: '0' }}>{theme.titre}</h3>
                                    <p style={{ marginTop: '12px' }}>{theme.texte}</p>
                                    {theme.recommandations && theme.recommandations.length > 0 && (
                                        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary)' }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Recommandations :</h4>
                                            <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
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
            <div>
                <h2>
                    <span className="section-number">
                        {(report.analyse_detaillee_par_sections || []).filter(sec => !report.scores?.sections?.find(s => s.id === sec.section_id)?.nom.toLowerCase().includes('coordonnées')).length + 3}
                    </span>
                    Recommandations & Plan d'Action
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {(report.recommandations_et_plan_action || []).map((reco, idx) => (
                        <div key={idx} className="white-card">
                            <div className="flex justify-between items-start" style={{ marginBottom: '16px' }}>
                                <h3 style={{ marginBottom: 0 }}>{reco.titre}</h3>
                                <div className="flex gap-2">
                                    <span className="tag" style={getPriorityStyle(reco.priorite)}>Priorité: {reco.priorite}</span>
                                    <span className="tag" style={getHorizonStyle(reco.horizon)}>Horizon: {reco.horizon}</span>
                                </div>
                            </div>
                            <p>{reco.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer>
                Rapport généré par Pulse Express • {date || new Date().toLocaleDateString('fr-FR')}
            </footer>
        </div>
    );
};

export default PremiumReport;
