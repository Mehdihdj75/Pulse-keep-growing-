
import React, { useEffect, useState } from 'react';
import { KPICard } from '../components/KPICard';
import { CompanyModal } from '../components/CompanyModal';
import { db } from '../services/database';
import { Company } from '../types';
import { Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const Entreprises: React.FC = () => {
  const [items, setItems] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await db.companies.getAll();
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette entreprise ?')) return;
    try {
      await db.companies.delete(id);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const handleSuccess = async () => {
    // Recharger la liste des entreprises
    try {
      const data = await db.companies.getAll();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tableau de bord &gt; Entreprises</p>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-brand-midnight tracking-tight">Gestion des Entreprises</h1>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 px-5 py-3 bg-brand-turquoise text-white rounded-xl text-sm font-bold hover:bg-brand-turquoise-dark transition-all shadow-lg shadow-brand-turquoise/20"
          >
            <Plus size={18} />
            <span>Ajouter une entreprise</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <KPICard label="Entreprises" value={loading ? '...' : items.length} icon={null} compact trend="Bdd réelle" trendUp />
        <KPICard label="Directeurs" value={23} icon={null} compact trend="2%" trendUp />
        <KPICard label="Managers" value={89} icon={null} compact trend="8%" trendUp />
        <KPICard label="Équipes" value={312} icon={null} compact trend="4%" trendUp />
        <KPICard label="Collaborateurs" value="1,540" icon={null} compact trend="6%" trendUp />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none focus:ring-2 focus:ring-brand-turquoise rounded-xl text-sm"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span>Filtres</span>
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <Loader2 className="animate-spin text-brand-turquoise" size={32} />
            </div>
          )}

          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nom</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Adresse</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Téléphone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Secteur</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.length > 0 ? items.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-brand-midnight">{company.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500 truncate block max-w-[200px]">{company.address || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{company.phone || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500 font-medium">{company.email || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {company.sector || 'SaaS'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(company)}
                        className="p-2 text-slate-400 hover:text-brand-turquoise hover:bg-brand-turquoise/10 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-brand-midnight hover:bg-slate-200 rounded-lg transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    Aucune entreprise trouvée en base de données.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-400 font-medium">Données synchronisées en temps réel</p>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 cursor-not-allowed opacity-50">
              <ChevronLeft size={18} />
            </button>
            <button className="w-10 h-10 rounded-lg text-sm font-bold bg-brand-turquoise text-white">1</button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 cursor-not-allowed opacity-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        company={selectedCompany}
      />
    </div>
  );
};

export default Entreprises;
