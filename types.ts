
import React from 'react';

export type UserRole = 'ADMIN' | 'DIRECTEUR' | 'MANAGER' | 'INDIVIDUEL';

export interface Profile {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: UserRole;
  entreprise_id?: string;
  equipe_id?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
}

export interface KPIStats {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export interface Company {
  id: string;
  nom?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  sector?: string;
  created_at?: string;
}

export interface Questionnaire {
  id: string;
  titre?: string;
  name: string;
  description?: string;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'Actif' | 'En pause' | 'Archivé';
  employees?: number;
  sections?: number;
  subSections?: number;
  questions?: number;
  employees_count?: number;
  sections_count?: number;
  questions_count?: number;
}

export interface DiagnosticResult {
  id: string;
  assignation_id?: string;
  status: 'DRAFT' | 'GENERATING' | 'DONE' | 'ERROR' | 'Terminé' | 'En cours' | 'Archivé';
  global_score?: number;
  score: number;
  pdf_url?: string;
  company?: string;
  team?: string;
  firstName: string;
  lastName: string;
  questionnaire?: string;
  company_name?: string;
  team_name?: string;
  user_full_name?: string;
  questionnaire_title?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface Assignation {
  id: string;
  user_id: string;
  questionnaire_id: string;
  status: 'PAS_COMMENCE' | 'EN_COURS' | 'TERMINE';
  due_date: string;
}

export interface AccountManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Manager';
  companiesCount: number;
  lastActivity: string;
  avatar: string;
}

// --- Types for n8n Diagnostic Report ---

export interface DiagnosticMeta {
  user_id: string;
  prenom: string;
  nom: string;
  role: string;
}

export interface SectionScore {
  id: string;
  nom: string;
  score: number;
  score_pct: number;
  niveau: string;
  color: string;
}

export interface DiagnosticScores {
  global_score: number;
  global_score_pct: number;
  global_niveau: string;
  global_color: string;
  sections: SectionScore[];
}

export interface DiagnosticSynthesis {
  resume_global: string;
  forces_principales: string;
  axes_de_vigilance: string;
}

export interface ThemeDetail {
  titre: string;
  texte: string;
}

export interface SectionAnalysis {
  section_id: string;
  section_nom: string;
  themes: ThemeDetail[];
}

export interface ActionPlanItem {
  priorite: number;
  titre: string;
  description: string;
  horizon: string;
}

export interface DiagnosticReport {
  meta: DiagnosticMeta;
  scores: DiagnosticScores;
  synthese: DiagnosticSynthesis;
  analyse_detaillee_par_sections: SectionAnalysis[];
  recommandations_et_plan_action: ActionPlanItem[];
  conclusion: string;
}
