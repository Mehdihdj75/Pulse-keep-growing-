
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                // 2. Update Profile (created by trigger) with user details
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        prenom: firstName,
                        nom: lastName,
                        // role is handled by trigger (default INDIVIDUEL), providing bio/avatar
                        bio: 'Compte particulier créé via l\'application',
                        avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D9488&color=fff`
                    })
                    .eq('id', authData.user.id);

                if (profileError) {
                    // If profile creation fails, we might want to cleanup the auth user, 
                    // but for now let's just show the error.
                    throw profileError;
                }

                // Success! Redirect directly to dashboard or login
                // If auto-confirm is on, they are logged in.
                navigate('/');
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-soft-bg p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-brand-midnight rounded-2xl flex items-center justify-center font-bold text-white text-3xl italic mb-4 shadow-lg shadow-brand-midnight/20">
                        KG
                    </div>
                    <h1 className="text-2xl font-bold text-brand-midnight">Créer un compte</h1>
                    <p className="text-slate-400 text-sm mt-1">Rejoignez Pulse dès maintenant.</p>
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
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-turquoise focus:bg-white transition-all outline-none"
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
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold leading-tight">
                            {error}
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
                                <span>Créer mon compte</span>
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
