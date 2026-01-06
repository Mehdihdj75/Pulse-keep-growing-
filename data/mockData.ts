
import { Company, Questionnaire, DiagnosticResult, AccountManager } from '../types';

export const companies: Company[] = [
  { id: '1', name: 'Acme Corp', address: '123 Main St, Paris, France', phone: '+33 1 23 45 67 89', email: 'contact@acmecorp.com', sector: 'Technologie' },
  { id: '2', name: 'Omni Solutions', address: '45 Rue de la Paix, Lyon, France', phone: '+33 4 56 78 90 12', email: 'hello@omnisol.fr', sector: 'Services' },
  { id: '3', name: 'Beta Group', address: '88 Blvd Haussmann, Paris, France', phone: '+33 1 88 99 00 11', email: 'info@betagroup.com', sector: 'Finance' },
  { id: '4', name: 'Gamma Enterprises', address: '12 Avenue des Champs, Paris, France', phone: '+33 1 22 33 44 55', email: 'admin@gamma.com', sector: 'Industrie' },
  { id: '5', name: 'Delta Services', address: '56 Rue de Rivoli, Paris, France', phone: '+33 1 66 77 88 99', email: 'support@delta.fr', sector: 'Luxe' },
  { id: '6', name: 'Zeta Consulting', address: '10 Place Bellecour, Lyon, France', phone: '+33 4 11 22 33 44', email: 'contact@zeta.fr', sector: 'Conseil' },
];

export const questionnaires: Questionnaire[] = [
  { id: 'Q-101', name: 'Évaluation Annuelle 2024', employees: 15, sections: 5, subSections: 12, questions: 45, status: 'Actif', createdAt: '15/01/2024', updatedAt: '20/06/2024' },
  { id: 'Q-102', name: 'Feedback Trimestriel Q2', employees: 42, sections: 3, subSections: 8, questions: 25, status: 'Actif', createdAt: '01/04/2024', updatedAt: '18/06/2024' },
  { id: 'Q-103', name: 'Engagement Collaborateur', employees: 63, sections: 4, subSections: 10, questions: 35, status: 'Actif', createdAt: '10/02/2024', updatedAt: '22/05/2024' },
  { id: 'Q-104', name: 'Culture d\'Entreprise', employees: 28, sections: 6, subSections: 15, questions: 60, status: 'En pause', createdAt: '05/03/2024', updatedAt: '12/06/2024' },
];

export const diagnostics: DiagnosticResult[] = [
  { id: 'D-001', company: 'TechSolutions Inc.', team: 'Engineering', lastName: 'Dubois', firstName: 'Jean', questionnaire: 'Leadership Assessment 2024', status: 'Terminé', score: 8.5, trend: 'up' },
  { id: 'D-002', company: 'Global Finance', team: 'Sales', lastName: 'Moreau', firstName: 'Sophie', questionnaire: 'Sales Performance Review', status: 'En cours', score: 7.1, trend: 'stable' },
  { id: 'D-003', company: 'Innovatech', team: 'Product', lastName: 'Leroy', firstName: 'Thomas', questionnaire: 'Employee Engagement Survey', status: 'Archivé', score: 6.5, trend: 'down' },
  { id: 'D-004', company: 'Acme Corp', team: 'HR', lastName: 'Petit', firstName: 'Marie', questionnaire: 'Culture Check 2024', status: 'Terminé', score: 9.2, trend: 'up' },
  { id: 'D-005', company: 'Zeta Consulting', team: 'Strategy', lastName: 'Girard', firstName: 'Luc', questionnaire: 'Leadership Assessment 2024', status: 'En cours', score: 6.8, trend: 'stable' },
];

export const accountManagers: AccountManager[] = [
  {
    id: '1',
    name: 'David Zaoui',
    email: 'david@keepgrowing.fr',
    phone: '+33 6 12 34 56 78',
    role: 'Admin',
    companiesCount: 12,
    lastActivity: 'Il y a 2 min',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Sarah Cohen',
    email: 'sarah@keepgrowing.fr',
    phone: '+33 6 98 76 54 32',
    role: 'Manager',
    companiesCount: 8,
    lastActivity: 'Il y a 1 h',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
  }
];
