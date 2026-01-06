
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  BarChart3,
  Users,
  UserCircle,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Contact2
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, path, active }) => (
  <Link
    to={path}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
      ? 'bg-brand-turquoise text-white shadow-lg shadow-brand-turquoise/20'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
  >
    <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-brand-turquoise'}>
      {icon}
    </span>
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [diagnosticCount, setDiagnosticCount] = React.useState(0);

  React.useEffect(() => {
    const checkDiagnostics = async () => {
      if (profile?.role === 'INDIVIDUEL') {
        const { count } = await supabase
          .from('diagnostics')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);
        setDiagnosticCount(count || 0);
      }
    };
    if (profile) checkDiagnostics();
  }, [profile]);

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', path: '/', roles: ['ADMIN', 'DIRECTEUR', 'MANAGER', 'INDIVIDUEL'] },
    { icon: <ClipboardList size={20} />, label: 'Nouveau Diagnostic', path: '/diagnostic/start', roles: ['INDIVIDUEL'] },
    { icon: <Building2 size={20} />, label: 'Entreprises', path: '/entreprises', roles: ['ADMIN'] },
    { icon: <ClipboardList size={20} />, label: 'Questionnaires', path: '/questionnaires', roles: ['ADMIN', 'DIRECTEUR'] },
    { icon: <BarChart3 size={20} />, label: 'Diagnostics & Résultats', path: '/diagnostics', roles: ['ADMIN', 'DIRECTEUR', 'MANAGER'] },
    { icon: <BarChart3 size={20} />, label: 'Mes Résultats', path: '/diagnostics', roles: ['INDIVIDUEL'] }, // Separate item for clarity
    { icon: <Contact2 size={20} />, label: 'Chargés de compte', path: '/charges-de-compte', roles: ['ADMIN'] },
    { icon: <Users size={20} />, label: 'Équipes', path: '/equipes', roles: ['DIRECTEUR', 'MANAGER'] },
  ];

  const filteredItems = navItems.filter(item => {
    if (!profile || !item.roles.includes(profile.role)) return false;

    // Logic for INDIVIDUEL: Hide "Nouveau Diagnostic" and "Mes Résultats" if no diagnosis completed
    if (profile.role === 'INDIVIDUEL' && (item.path === '/diagnostic/start' || item.path === '/diagnostics')) {
      return diagnosticCount > 0;
    }

    return true;
  });

  return (
    <div className="min-h-screen flex bg-brand-soft-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="bg-brand-midnight w-72 flex flex-col p-6 h-screen sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center space-x-3 px-2 mb-10">
          <div className="w-10 h-10 bg-brand-turquoise rounded-xl flex items-center justify-center font-bold text-white text-xl italic">
            KG
          </div>
          <span className="text-white text-xl font-bold tracking-tight">KEEP <span className="text-brand-turquoise">GROWING</span></span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredItems.map((item) => (
            <SidebarItem
              key={item.path}
              {...item}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-6">
          <button
            onClick={signOut}
            className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 w-full rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="text-brand-midnight font-bold text-xl">{location.pathname === '/charges-de-compte' ? 'Gestion des Chargés de compte' : location.pathname === '/profil' ? 'Mon Profil' : 'Pulse Express'}</h2>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-400 hover:text-brand-midnight">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-100"></div>

            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-brand-midnight group-hover:text-brand-turquoise transition-colors">
                  {profile?.prenom} {profile?.nom}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{profile?.role}</p>
              </div>
              <div className="relative">
                <img
                  src={profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.prenom} ${profile?.nom}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full ring-2 ring-slate-100 group-hover:ring-brand-turquoise transition-all bg-slate-50 object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};
