import React from 'react';
import { DiagnosticReport, SectionScore, SectionAnalysis } from '../types';

interface PremiumReportProps {
    report: DiagnosticReport;
    date?: string;
}

const PremiumReport: React.FC<PremiumReportProps> = ({ report, date }) => {
    // Helper to get color based on score or default
    const getScoreColor = (scorePct: number) => {
        if (scorePct >= 75) return '#10b981'; // Success
        if (scorePct >= 50) return '#03a39b'; // Primary
        if (scorePct >= 25) return '#f59e0b'; // Warning
        return '#ef6355'; // Danger
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
        <div id="premium-report-content" className="premium-report-root">
            <style>{styles}</style>

            {/* HEADER */}
            <header className="report-header">
                <div className="header-top">
                    <div className="header-left">
                        <svg className="logo" viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="10" fill="#03a39b" /><text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" dominantBaseline="middle">KG</text></svg>
                        <div>
                            <div className="header-title">Rapport de Synthèse</div>
                            <div className="header-subtitle">
                                Utilisateur : {report.meta?.prenom} {report.meta?.nom} | Rôle : {report.meta?.role}
                            </div>
                        </div>
                    </div>
                    <div className="header-date">{date || new Date().toISOString().split('T')[0]}</div>
                </div>

                <div className="header-content">
                    {/* SPEEDOMETER - Score Global */}
                    <div className="main-score-box">
                        <h3>Score Global</h3>
                        {report.scores?.global_score_pct !== undefined && (
                            <img src={getGaugeUrl(report.scores.global_score_pct, report.scores.global_color || '#03a39b')} alt="Score" className="chart-img" />
                        )}
                        <div className="score-label-main">{report.scores?.global_score?.toFixed(1) || '0.0'} / 5 – {report.scores?.global_niveau || '-'}</div>
                    </div>

                    {/* SPIDER CHART PRINCIPAL */}
                    <div className="spider-box">
                        <h3>Spider Chart – Répartition</h3>
                        {/* Use filtered sections for the chart too if appropriate, but usually spider includes all. 
                            However, Coordonnées probably has no score. If it does, keep it? 
                            Assuming Coordonnées has score 0 or is irrelevant, filtering is safer visually. */}
                        {filteredSections.length > 0 && (
                            <img src={getRadarUrl(filteredSections)} alt="Spider Chart" className="chart-img" />
                        )}
                    </div>

                    {/* SCORE LIST */}
                    <div className="score-list">
                        <h4>Score par Section</h4>
                        {filteredSections.map((sec, idx) => (
                            <div key={sec.id || idx} className="score-item">
                                <div className="score-item-name">{sec.nom}<span className="score-item-sub">Section {idx + 1}</span></div>
                                <span className="score-badge" style={{ background: sec.color || '#ccc' }}>Score {sec.score?.toFixed(1) || '0.0'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* SECTIONS */}
            {filteredSections.map((sec, idx) => {
                const analysisDetails = (report.analyse_detaillee_par_sections || []).find(a => a.section_id === sec.id);
                return (
                    <div key={sec.id || idx} className="section-block">
                        <div className="section-header">
                            <div className="section-title">Section {idx + 1} : <span>{sec.nom}</span></div>
                            <span className="score-badge" style={{ background: sec.color || '#ccc' }}>Score {sec.score?.toFixed(1) || '0.0'}</span>
                        </div>

                        <div className="section-content">
                            <div className="section-analysis">
                                <h4>Analyse de la section</h4>
                                <p>
                                    Score de {sec.score_pct}% - {sec.niveau}.
                                    {sec.niveau === 'Excellent' ? ' Excellent travail, une référence pour l\'équipe.' :
                                        sec.niveau === 'Solide' ? ' De bonnes bases, quelques ajustements possibles.' :
                                            ' Cette section nécessite une attention particulière.'}
                                </p>
                            </div>
                        </div>

                        {/* RUBRIQUES (Themes) */}
                        <div className="rubriques-list">
                            {(analysisDetails?.themes || []).map((theme, tIdx) => (
                                <div key={tIdx} className="rubrique-card">
                                    <div className="rubrique-header">
                                        <div>
                                            <div className="rubrique-num">Thème {tIdx + 1}</div>
                                            <div className="rubrique-title">{theme.titre}</div>
                                        </div>
                                    </div>
                                    <div className="rubrique-body">
                                        <div className="rubrique-analysis">
                                            <h5>Analyse</h5>
                                            <p>{theme.texte}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* RECOMMENDATIONS SECTION */}
            <div className="section-block">
                <div className="section-header">
                    <div className="section-title">Recommandations & Plan d'Action</div>
                </div>
                <div className="rubriques-list">
                    {(report.recommandations_et_plan_action || []).map((reco, idx) => (
                        <div key={idx} className="rubrique-card">
                            <div className="rubrique-header">
                                <div>
                                    <div className="rubrique-num">Priorité {reco.priorite} - {reco.horizon}</div>
                                    <div className="rubrique-title">{reco.titre}</div>
                                </div>
                            </div>
                            <div className="rubrique-body">
                                <p className="text-sm text-slate-400">{reco.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="report-footer">Rapport généré par Pulse Express • {date || new Date().toISOString().split('T')[0]}</footer>
        </div>
    );
};

export default PremiumReport;
