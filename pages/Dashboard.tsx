
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { KPICard } from '../components/KPICard';
import { DonutDiagnostics } from '../components/DonutDiagnostics';
import { Building2, Users, Briefcase, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/database';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    directeurs: 0,
    equipes: 0,
    collaborateurs: 0,
    scoreMoyen: 8.2,
    totalDiagnostics: 0,
    history: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile || profile.role === 'INDIVIDUEL') {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch real data from Supabase
        const [companies, diagnostics, collaboratorsCount] = await Promise.all([
          db.companies.getAll(),
          db.diagnostics.getAll(),
          db.profiles.count()
        ]);

        const totalDiagnostics = diagnostics.length;
        const totalScore = diagnostics.reduce((acc, d) => acc + (d.score || 0), 0);
        const scoreMoyen = totalDiagnostics > 0 ? Number((totalScore / totalDiagnostics).toFixed(1)) : 0;

        // Count unique teams
        const uniqueTeams = new Set(diagnostics.map(d => d.team).filter(Boolean)).size;

        if (profile?.role === 'ADMIN') {
          setStats({
            directeurs: companies.length, // Displayed as "Entreprises" for Admin
            equipes: uniqueTeams,
            collaborateurs: collaboratorsCount,
            scoreMoyen,
            totalDiagnostics
          });
        } else {
          // Logic for others (simplified for demo)
          setStats({
            directeurs: 1,
            equipes: uniqueTeams,
            collaborateurs: collaboratorsCount,
            scoreMoyen,
            totalDiagnostics,
            history: diagnostics // Store full list for history
          });
        }
      } catch (e) {
        console.error("Error fetching dashboard stats:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  if (profile?.role === 'INDIVIDUEL') {
    if (stats.totalDiagnostics === 0 && !loading) {
      return (
        <div className="max-w-4xl mx-auto mt-12 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-12 border border-slate-100 text-center relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-turquoise/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-midnight/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-brand-turquoise/10 rounded-3xl flex items-center justify-center text-brand-turquoise mb-8 shadow-sm">
                <TrendingUp size={40} />
              </div>

              <h1 className="text-4xl font-black text-brand-midnight tracking-tight mb-4">
                Bienvenue sur <span className="text-brand-turquoise">Pulse Express</span>
              </h1>

              <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Découvrez vos forces et vos axes d’amélioration en quelques minutes grâce à notre diagnostic personnalisé.
              </p>

              <Link
                to="/diagnostic/start"
                className="inline-flex items-center space-x-3 bg-brand-turquoise hover:bg-brand-turquoise-dark text-white text-lg font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-brand-turquoise/20 hover:scale-105 active:scale-95"
              >
                <span>Commencer mon diagnostic</span>
                <TrendingUp size={20} />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Individual User WITH History
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-midnight tracking-tight">Bonjour, {profile?.prenom} 👋</h1>
            <p className="text-slate-500 font-medium">Retrouvez vos rapports de diagnostic ci-dessous.</p>
          </div>
          <Link to="/diagnostic/start" className="bg-brand-midnight text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">
            + Nouveau Diagnostic
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <h2 className="text-xl font-bold text-brand-midnight">Vos Rapports</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {stats.history.map((diag: any) => (
              <div key={diag.id} className="p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-turquoise/10 rounded-2xl flex items-center justify-center text-brand-turquoise font-bold">
                    {diag.score}/5
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-midnight">{diag.questionnaire_title || 'Diagnostic Commercial'}</h3>
                    <p className="text-xs text-slate-400">
                      Réalisé le {new Date(diag.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/diagnostic/result?id=${diag.id}`}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:border-brand-turquoise hover:text-brand-turquoise transition-all"
                >
                  Voir le rapport
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-midnight tracking-tight">Bonjour, {profile?.prenom} 👋</h1>
          <p className="text-slate-500 font-medium">Espace {profile?.role?.toLowerCase()}. Voici un aperçu de l'activité.</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          label={profile?.role === 'ADMIN' ? "Entreprises" : "Directeurs"}
          value={loading ? '...' : stats.directeurs}
          icon={<Building2 size={24} />}
        />
        <KPICard
          label="Équipes"
          value={loading ? '...' : stats.equipes}
          icon={<Users size={24} />}
        />
        <KPICard
          label="Collaborateurs"
          value={loading ? '...' : stats.collaborateurs}
          icon={<Briefcase size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Main Chart Section */}
        <div className="lg:col-span-8 flex flex-col">
          <DonutDiagnostics />
        </div>

        {/* Global Score Card - Redesigned to match the screenshot precisely */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center flex-1 relative overflow-hidden h-full">
            <h3 className="text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-center">Score Moyen Global</h3>

            <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
              {/* SVG Gauge */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-[225deg]">
                {/* Background Arc (3/4 of a circle) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="8"
                  strokeDasharray="188.5 251.3" /* 75% of 2*pi*40 */
                  strokeLinecap="round"
                />
                {/* Progress Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#2DD4BF"
                  strokeWidth="8"
                  strokeDasharray={`${(stats.scoreMoyen / 10) * 188.5} 251.3`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Centered Score Text */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <span className="text-[72px] font-black text-[#0F172A] tracking-tighter leading-none">{stats.scoreMoyen}</span>
                <span className="text-[#94A3B8] font-bold text-lg mt-1">/ 10</span>
              </div>
            </div>

            <div className="mt-auto pt-8 flex flex-col items-center space-y-6">
              <p className="text-[#64748B] text-sm text-center leading-relaxed">
                Analyse basée sur <span className="text-brand-midnight font-black">{stats.totalDiagnostics}</span> <br />
                <span className="text-brand-midnight font-black">diagnostics</span> complétés.
              </p>

              <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#F0FDFA] text-[#0D9488] rounded-full text-[11px] font-black uppercase tracking-wider">
                <TrendingUp size={14} className="mb-0.5" />
                <span>+1.2% ce mois</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
