
import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase configuré avec les identifiants du projet Pulse.
 * Note: Dans un environnement de production, ces valeurs devraient être dans un fichier .env
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing in environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
