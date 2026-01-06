
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Company } from '../types';
import { db } from '../services/database';

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    company?: Company | null;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose, onSuccess, company }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        sector: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!company;

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || '',
                address: company.address || '',
                phone: company.phone || '',
                email: company.email || '',
                sector: company.sector || ''
            });
        } else {
            setFormData({
                name: '',
                address: '',
                phone: '',
                email: '',
                sector: ''
            });
        }
        setError(null);
    }, [company, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('Le nom de l\'entreprise est requis');
            return;
        }

        setLoading(true);
        try {
            if (isEditMode && company) {
                await db.companies.update(company.id, formData);
            } else {
                await db.companies.create(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                        {isEditMode ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'}
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

                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-bold text-slate-700">
                            Nom de l'entreprise <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                            placeholder="Ex: Acme Corporation"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="sector" className="block text-sm font-bold text-slate-700">
                            Secteur d'activité
                        </label>
                        <input
                            type="text"
                            id="sector"
                            name="sector"
                            value={formData.sector}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                            placeholder="Ex: SaaS, E-commerce, Finance..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                            placeholder="contact@entreprise.com"
                        />
                    </div>

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
                            placeholder="+33 1 23 45 67 89"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className="block text-sm font-bold text-slate-700">
                            Adresse
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-turquoise focus:border-transparent transition-all"
                            placeholder="123 Rue de la République, 75001 Paris"
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
                            <span>{isEditMode ? 'Enregistrer' : 'Créer l\'entreprise'}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
