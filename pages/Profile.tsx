import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Profile() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                prenom: profile.prenom || '',
                nom: profile.nom || '',
                email: profile.email || '',
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!profile?.id) throw new Error("Profil introuvable");

            const { error } = await supabase
                .from('profiles')
                .update({
                    prenom: formData.prenom,
                    nom: formData.nom
                })
                .eq('id', profile.id);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Reload page to refresh context (simple way) or we could update context
            window.location.reload();
        } catch (err: any) {
            setError(err.message || "Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">

            {/* Header */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex items-center space-x-6">
                <div className="relative">
                    <img
                        src={profile?.avatar || `https://ui-avatars.com/api/?name=${formData.prenom}+${formData.nom}&background=0D9488&color=fff`}
                        alt="Avatar"
                        className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-50"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-brand-midnight">{formData.prenom || 'Utilisateur'} {formData.nom}</h1>
                    <p className="text-slate-500 text-sm font-medium bg-slate-100 inline-block px-3 py-1 rounded-full mt-2">
                        {profile?.role || 'Membre'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-brand-midnight mb-6 flex items-center">
                    <User className="mr-2 text-brand-turquoise" size={20} />
                    Informations personnelles
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Prénom</label>
                            <input
                                type="text"
                                value={formData.prenom}
                                onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-turquoise transition-all outline-none"
                                placeholder="Votre prénom"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Nom</label>
                            <input
                                type="text"
                                value={formData.nom}
                                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-turquoise transition-all outline-none"
                                placeholder="Votre nom"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 opacity-60">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email (non modifiable)</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-2xl text-slate-500 cursor-not-allowed"
                        />
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-brand-midnight text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-brand-midnight/20 flex items-center"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                            Enregistrer les modifications
                        </button>

                        {success && (
                            <div className="flex items-center text-emerald-600 text-sm font-bold animate-fade-in">
                                <CheckCircle2 size={18} className="mr-2" />
                                Profil mis à jour !
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center text-rose-600 text-sm font-bold animate-fade-in">
                                <AlertCircle size={18} className="mr-2" />
                                {error}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
