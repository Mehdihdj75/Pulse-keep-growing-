
import { supabase } from '../lib/supabase';
import { Company, Questionnaire, DiagnosticResult } from '../types';

/**
 * Service pour interagir avec les tables Supabase.
 * Centralise la logique d'accès aux données pour l'interface Pulse Admin.
 */
export const db = {
  // --- PROFILES ---
  profiles: {
    async count() {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    async getAll() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    async create(profile: any) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id: string, profile: any) {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  // --- ENTREPRISES ---
  companies: {
    async getAll() {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Company[];
    },
    async create(company: Partial<Company>) {
      const { data, error } = await supabase
        .from('companies')
        .insert([company])
        .select()
        .single();
      if (error) throw error;
      return data as Company;
    },
    async update(id: string, company: Partial<Company>) {
      const { data, error } = await supabase
        .from('companies')
        .update(company)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Company;
    },
    async delete(id: string) {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // --- QUESTIONNAIRES ---
  questionnaires: {
    async getAll() {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Map DB columns (titre) to Frontend types (name)
      return (data || []).map((q: any) => ({
        ...q,
        name: q.titre || q.name || 'Sans titre' // Fallback
      })) as Questionnaire[];
    },
    async create(q: Partial<Questionnaire>) {
      const { data, error } = await supabase
        .from('questionnaires')
        .insert([q])
        .select()
        .single();
      if (error) throw error;
      return data as Questionnaire;
    }
  },

  // --- DIAGNOSTICS ---
  diagnostics: {
    async getAll() {
      // Jointure avec profiles et companies pour enrichir les résultats
      const { data, error } = await supabase
        .from('diagnostics')
        .select(`
          id,
          user_id,
          company_id,
          questionnaire_title,
          team_name,
          score,
          status,
          trend,
          created_at,
          profiles:user_id (prenom, nom),
          companies:company_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching diagnostics:', error);
        throw error;
      }

      // Transformation des données pour correspondre à l'interface DiagnosticResult
      return (data || []).map(d => mapDiagnosticData(d)) as DiagnosticResult[];
    },

    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('diagnostics')
        .select(`
          id,
          user_id,
          company_id,
          questionnaire_title,
          team_name,
          score,
          status,
          trend,
          created_at,
          profiles:user_id (prenom, nom),
          companies:company_id (name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(d => mapDiagnosticData(d)) as DiagnosticResult[];
    }
  }
};

const mapDiagnosticData = (d: any) => {
  const company = Array.isArray(d.companies) ? d.companies[0] : d.companies;
  const profile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;

  return {
    id: d.id,
    company: company?.name || 'N/A',
    firstName: profile?.prenom || 'Anonyme',
    lastName: profile?.nom || '',
    team: d.team_name || 'Général',
    questionnaire: d.questionnaire_title || 'Diagnostic Pulse+',
    status: d.status || 'En cours',
    score: d.score || 0,
    trend: (d.trend as any) || 'stable',
    created_at: d.created_at
  };
};
