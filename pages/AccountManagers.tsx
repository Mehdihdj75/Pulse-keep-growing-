
import React, { useEffect, useState } from 'react';
import { Search, Filter, UserPlus, Mail, Phone, MoreHorizontal, Users, Building2, Activity, Edit, Trash2 } from 'lucide-react';
import { db } from '../services/database';
import { Profile, Company } from '../types';
import { AccountModal } from '../components/AccountModal';

const AccountManagers: React.FC = () => {
  const [managers, setManagers] = useState<Profile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Profile | null>(null);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const [profilesData, companiesData] = await Promise.all([
        db.profiles.getAll(),
        db.companies.getAll()
      ]);
      setManagers(profilesData || []);
      setCompanies(companiesData || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleAddClick = () => {
    setSelectedManager(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (manager: Profile) => {
    setSelectedManager(manager);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      try {
        await db.profiles.delete(id);
        fetchManagers();
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  }


  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <h1 className="text-3xl font-black text-brand-midnight tracking-tight">Gestion des Chargés de compte</h1>

        {/* KPI Stats Row - Keeping static for now or can calculate from data if needed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Chargés de compte</p>
              <h4 className="text-4xl font-black text-brand-midnight">{managers.length}</h4>
            </div>
            <div className="w-14 h-14 bg-brand-turquoise/5 flex items-center justify-center rounded-2xl text-brand-turquoise">
              <UserPlus size={28} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Entreprises Gérées</p>
              <h4 className="text-4xl font-black text-brand-midnight">--</h4>
            </div>
            <div className="w-14 h-14 bg-emerald-50 flex items-center justify-center rounded-2xl text-emerald-500">
              <Building2 size={28} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Taux d'activité</p>
              <h4 className="text-4xl font-black text-brand-midnight">--%</h4>
            </div>
            <div className="w-14 h-14 bg-indigo-50 flex items-center justify-center rounded-2xl text-indigo-500">
              <Activity size={28} />
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un chargé de compte..."
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-turquoise/10 focus:bg-white transition-all outline-none"
                />
              </div>
              <button className="flex items-center space-x-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <Filter size={18} />
                <span>Filtrer</span>
              </button>
            </div>


          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nom</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rôle</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entreprises</th>
                  {/* <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dernière activité</th> */}
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                      Chargement...
                    </td>
                  </tr>
                ) : managers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                      Aucun compte trouvé
                    </td>
                  </tr>
                ) : (
                  managers.map((manager) => (
                    <tr key={manager.id} className="hover:bg-slate-50/40 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <img
                            src={manager.avatar || `https://ui-avatars.com/api/?name=${manager.prenom}+${manager.nom}&background=random`}
                            alt={`${manager.prenom} ${manager.nom}`}
                            className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:ring-4 ring-brand-turquoise/10 transition-all"
                          />
                          <span className="text-sm font-black text-brand-midnight">{manager.prenom} {manager.nom}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-slate-400 hover:text-brand-midnight transition-colors cursor-pointer">
                            <Mail size={14} />
                            <span className="text-xs font-medium">{manager.email}</span>
                          </div>
                          {manager.phone && (
                            <div className="flex items-center space-x-2 text-slate-400 hover:text-brand-midnight transition-colors cursor-pointer">
                              <Phone size={14} />
                              <span className="text-xs font-medium">{manager.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${manager.role === 'ADMIN' ? 'bg-brand-turquoise/10 text-brand-turquoise-dark' :
                          manager.role === 'DIRECTEUR' ? 'bg-indigo-50 text-indigo-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                          {manager.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-brand-midnight">
                          {companies.find(c => c.id === manager.entreprise_id)?.name || '--'}
                        </span>
                      </td>
                      {/* <td className="px-8 py-6">
                        <span className="text-xs font-medium text-slate-400">
                            {manager.created_at ? formatDistanceToNow(new Date(manager.created_at), { addSuffix: true, locale: fr }) : '-'}
                        </span>
                    </td> */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(manager)}
                            className="p-3 text-slate-300 hover:text-brand-midnight bg-slate-50 rounded-2xl transition-all hover:bg-white hover:shadow-md"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(manager.id)}
                            className="p-3 text-slate-300 hover:text-rose-500 bg-slate-50 rounded-2xl transition-all hover:bg-white hover:shadow-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchManagers}
          account={selectedManager}
        />
      </div>
    </>
  );
};

export default AccountManagers;
