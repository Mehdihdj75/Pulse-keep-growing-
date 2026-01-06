import React, { useState } from 'react';
import { X, Mail, Copy, Check, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { profile } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleCreateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!profile?.entreprise_id) {
                throw new Error("Vous n'êtes rattaché à aucune entreprise.");
            }

            // Generate unique token
            const token = crypto.randomUUID();

            // Store in database
            const { error: dbError } = await supabase
                .from('invitations')
                .insert([{
                    email,
                    company_id: profile.entreprise_id,
                    token,
                    status: 'pending'
                }]);

            if (dbError) throw dbError;

            // Generate Link
            const link = `${window.location.origin}/#/signup?token=${token}`;
            setInviteLink(link);
            onSuccess(); // Refresh parent list if needed

        } catch (err: any) {
            console.error('Invite error:', err);
            setError(err.message || "Erreur lors de la création de l'invitation.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const reset = () => {
        setEmail('');
        setInviteLink(null);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-midnight/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-brand-midnight">Inviter un membre</h2>
                            <p className="text-slate-400 font-medium text-sm mt-1">Ajoutez un collaborateur à votre équipe.</p>
                        </div>
                        <button onClick={reset} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-brand-midnight">
                            <X size={24} />
                        </button>
                    </div>

                    {!inviteLink ? (
                        <form onSubmit={handleCreateInvite} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email du collaborateur</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-turquoise transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="collegue@entreprise.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-medium text-brand-midnight focus:ring-4 focus:ring-brand-turquoise/10 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center space-x-2">
                                    <span>⚠️ {error}</span>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-brand-turquoise text-white rounded-2xl font-bold hover:bg-brand-turquoise-dark transition-all shadow-lg shadow-brand-turquoise/20 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Users size={20} />
                                            <span>Générer le lien</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Check size={24} strokeWidth={3} />
                                </div>
                                <h3 className="text-emerald-800 font-bold mb-1">Invitation créée !</h3>
                                <p className="text-emerald-600/80 text-sm">Partagez ce lien avec votre collaborateur.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Lien d'invitation</label>
                                <div className="flex space-x-2">
                                    <input
                                        readOnly
                                        value={inviteLink}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-mono text-sm focus:outline-none"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 ${copied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-brand-midnight text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-center pt-4">
                                <button onClick={reset} className="text-slate-400 font-bold hover:text-brand-midnight transition-colors">
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
