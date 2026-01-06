
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';

const Login: React.FC = () => {
  const { loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Tentative réelle
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      if (supabase.auth.getSession() === null && (supabase as any).supabaseUrl.includes('your-project-url')) {
        setError("Le backend Supabase n'est pas configuré. Utilisez le Mode Démo ci-dessous.");
      } else {
        setError(loginError.message);
      }
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
          <h1 className="text-2xl font-bold text-brand-midnight">Bienvenue sur <span className="text-brand-turquoise">Pulse</span></h1>
          <p className="text-slate-400 text-sm mt-1">Connectez-vous pour accéder à votre espace.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-midnight text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-brand-midnight/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Se connecter</span>
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-slate-400 text-sm">
                Pas encore de compte ? <Link to="/signup" className="text-brand-turquoise font-bold hover:underline">Créer un compte</Link>
              </p>
            </div>

          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-xs">
            Besoin d'aide ? Contactez le <a href="#" className="text-brand-turquoise font-bold hover:underline">Support KG</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
