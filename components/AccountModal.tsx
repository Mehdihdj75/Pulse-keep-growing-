
import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { Profile, UserRole, Company } from '../types';
import { db } from '../services/database';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    account?: Profile | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSuccess, account }) => {
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        phone: '',
        role: 'MANAGER' as UserRole,
        entreprise_id: '',
        bio: '',
        avatar: ''
    });
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!account;

    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const data = await db.companies.getAll();
                setCompanies(data);
            } catch (err) {
                console.error("Error loading companies:", err);
            }
        };
        loadCompanies();
    }, []);

    useEffect(() => {
        if (account) {
            setFormData({
                prenom: account.prenom || '',
                nom: account.nom || '',
                email: account.email || '',
                phone: account.phone || '',
                role: account.role || 'MANAGER',
                entreprise_id: account.entreprise_id || '',
                bio: account.bio || '',
                avatar: account.avatar || ''
            });
        } else {
            setFormData({
                prenom: '',
                nom: '',
                email: '',
                phone: '',
                role: 'MANAGER',
                entreprise_id: '',
                bio: '',
                avatar: ''
            });
        }
        setError(null);
    }, [account, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.prenom.trim() || !formData.nom.trim() || !formData.email.trim()) {
            setError('Prénom, Nom et Email sont requis');
            return;
        }

        setLoading(true);
        try {
            if (isEditMode && account) {
                await db.profiles.update(account.id, {
                    prenom: formData.prenom,
                    nom: formData.nom,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    entreprise_id: formData.entreprise_id || null,
                    bio: formData.bio,
                    avatar: formData.avatar
                });
            } else {
                await db.profiles.create({
                    id: crypto.randomUUID(),
                    prenom: formData.prenom,
                    nom: formData.nom,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    entreprise_id: formData.entreprise_id || null,
                    bio: formData.bio,
                    avatar: formData.avatar
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-brand-midnight">
                        {isEditMode ? 'Modifier le compte' : 'Ajouter un compte'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="prenom" className="block text-sm font-bold text-slate-700">
                                Prénom <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="prenom"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                                placeholder="Jean"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="nom" className="block text-sm font-bold text-slate-700">
                                Nom <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nom"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                                placeholder="Dupont"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                            Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                            placeholder="jean.dupont@entreprise.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-bold text-slate-700">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                                placeholder="+33 6 12 34 56 78"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="role" className="block text-sm font-bold text-slate-700">
                                Rôle
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                            >
                                <option value="MANAGER">Manager</option>
                                <option value="DIRECTEUR">Directeur</option>
                                <option value="ADMIN">Admin</option>
                                <option value="INDIVIDUEL">Particulier</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="entreprise_id" className="block text-sm font-bold text-slate-700">
                            Entreprise
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                id="entreprise_id"
                                name="entreprise_id"
                                value={formData.entreprise_id}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all appearance-none"
                            >
                                <option value="">Aucune entreprise</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="avatar" className="block text-sm font-bold text-slate-700">
                            URL Avatar
                        </label>
                        <input
                            type="url"
                            id="avatar"
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 bg-brand-turquoise text-white text-sm font-bold rounded-xl hover:bg-brand-turquoise-dark transition-all shadow-lg shadow-brand-turquoise/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Enregistrement...</span>
                            </>
                        ) : (
                            <span>{isEditMode ? 'Enregistrer' : 'Créer le compte'}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
