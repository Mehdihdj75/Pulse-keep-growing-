
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
