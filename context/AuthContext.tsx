
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  loginAsDemo: (role: 'ADMIN' | 'DIRECTEUR' | 'MANAGER' | 'INDIVIDUEL') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILES: Record<string, Profile> = {
  ADMIN: {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Valid UUID
    prenom: 'David',
    nom: 'Zaoui',
    email: 'admin@demo.com',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'
  },
  DIRECTEUR: {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', // Valid UUID
    prenom: 'Sophie',
    nom: 'Martin',
    email: 'directeur@demo.com',
    role: 'DIRECTEUR',
    entreprise_id: 'ent-1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
  },
  INDIVIDUEL: {
    id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380133', // Valid UUID
    prenom: 'Invité',
    nom: 'Utilisateur',
    email: 'invite@demo.com',
    role: 'INDIVIDUEL',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Invité'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('pulse_demo_user_v2');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si une session Supabase existe déjà
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        // Auto-login logic for MVP
        if (!localStorage.getItem('pulse_demo_user_v2')) {
          // Check for admin query param (robust check anywhere in URL)
          const isAdmin = window.location.href.includes('admin=true');

          console.log(isAdmin ? "Mode Admin Detected" : "Mode Public Detected");

          const defaultUser = isAdmin ? DEMO_PROFILES.ADMIN : DEMO_PROFILES.INDIVIDUEL;

          localStorage.setItem('pulse_demo_user_v2', JSON.stringify(defaultUser));
          setProfile(defaultUser);
        }
        setLoading(false);
      }
    };

    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      } catch (e) {
        console.error("Erreur lors de la récupération du profil Supabase:", e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else if (!localStorage.getItem('pulse_demo_user_v2')) {
        // Auto-login fallback in listener
        const isAdmin = window.location.href.includes('admin=true');
        console.log("Mode MVP listener: Auto-login as " + (isAdmin ? "Admin" : "Public"));

        const defaultUser = isAdmin ? DEMO_PROFILES.ADMIN : DEMO_PROFILES.INDIVIDUEL;

        localStorage.setItem('pulse_demo_user_v2', JSON.stringify(defaultUser));
        setProfile(defaultUser);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('pulse_demo_user_v2');
    await supabase.auth.signOut();
    setProfile(null);
  };

  const loginAsDemo = (role: 'ADMIN' | 'DIRECTEUR' | 'MANAGER' | 'INDIVIDUEL') => {
    const demoUser = DEMO_PROFILES[role] || DEMO_PROFILES.ADMIN;
    localStorage.setItem('pulse_demo_user_v2', JSON.stringify(demoUser));
    setProfile(demoUser);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signOut, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
