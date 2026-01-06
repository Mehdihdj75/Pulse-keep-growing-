import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Building2 } from 'lucide-react';

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const invitationToken = searchParams.get('token');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Invitation state
    const [invitationData, setInvitationData] = useState<any>(null);
    const [verifyingToken, setVerifyingToken] = useState(!!invitationToken);

    useEffect(() => {
        if (invitationToken) {
            verifyInvitation(invitationToken);
        }
    }, [invitationToken]);

    const verifyInvitation = async (token: string) => {
        try {
            const { data, error } = await supabase
                .from('invitations')
                .select('*, companies(name)')
                .eq('token', token)
                .eq('status', 'pending')
                .single();

            if (error || !data) {
                console.error("Invalid invitation:", error);
                setError("Ce lien d'invitation est invalide ou a expiré.");
            } else {
                setInvitationData(data);
                setEmail(data.email); // Pre-fill email
            }
        } catch (err) {
            console.error("Verification error:", err);
            setError("Impossible de vérifier l'invitation.");
        } finally {
            setVerifyingToken(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin,
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Prepare Profile Data
                const profileUpdates: any = {
                    prenom: firstName,
                    nom: lastName,
                    bio: invitationData
                        ? `Membre de l'équipe ${invitationData.companies?.name || ''}`
                        : 'Compte particulier (Express)',
                    avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D9488&color=fff`
                };

                // Link to Company if Invitation is valid
                if (invitationData) {
                    profileUpdates.entreprise_id = invitationData.company_id;
                    // Note: Role remains 'INDIVIDUEL' by default trigger, but now they have entreprise_id
                    // which enables the "Team" flow routing we implemented.
                }

                // 3. Update Profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update(profileUpdates)
                    .eq('id', authData.user.id);

                if (profileError) throw profileError;

                // 4. Accept Invitation (if applicable)
                if (invitationToken && invitationData) {
                    await supabase
                        .from('invitations')
                        .update({ status: 'accepted' })
                        .eq('id', invitationData.id);
                }

                // Success!
                navigate('/');
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    if (verifyingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-soft-bg">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-brand-turquoise border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Vérification de votre invitation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-soft-bg p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-brand-midnight rounded-2xl flex items-center justify-center font-bold text-white text-3xl italic mb-4 shadow-lg shadow-brand-midnight/20">
                        KG
                    </div>
                    {invitationData ? (
                        <>
                            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-2 border border-emerald-100">
                                <Building2 size={12} />
                                <span>Invitation : {invitationData.companies?.name}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-brand-midnight text-center">Rejoindre l'équipe</h1>
                            <p className="text-slate-400 text-sm mt-1 text-center">Finalisez votre compte pour accéder à Pulse.</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-brand-midnight">Créer un compte</h1>
                            <p className="text-slate-400 text-sm mt-1">Rejoignez Pulse dès maintenant.</p>
                        </>
                    )}
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Prénom</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Jean"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-turquoise focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Nom</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Dupont"
                                    className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-turquoise focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                disabled={!!invitationData} // Lock email if invited
                                className={`w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-turquoise focus:bg-white transition-all outline-none ${invitationData ? 'opacity-75 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-turquoise focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold leading-tight flex items-center space-x-2">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-brand-turquoise text-white rounded-2xl font-bold hover:bg-brand-turquoise-dark transition-all shadow-lg shadow-brand-turquoise/20 flex items-center justify-center space-x-2 mt-4"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                <span>{invitationData ? "Rejoindre l'équipe" : "Créer mon compte"}</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        Déjà un compte ? <Link to="/login" className="text-brand-midnight font-bold hover:underline">Se connecter</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
