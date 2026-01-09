import { DiagnosticReport } from '../types';

/**
 * Service de communication avec n8n pour l'automatisation des diagnostics Pulse.
 */

export const N8N_INDIVIDUAL_WEBHOOK_URL = "https://n8n.srv864713.hstgr.cloud/webhook/7e875dda-419b-43f9-ba61-4b88e268156f";
export const N8N_CORP_WEBHOOK_URL = "https://n8n.srv864713.hstgr.cloud/webhook/7e875dda-419b-43f9-ba61-4b88e268156f";

export interface Answer {
  section: string;
  rubrique: string;
  question: string;
  score: number | string | string[]; // 0..5 or text
}

export interface N8NSubmissionItem {
  json: {
    respondant: string;
    email: string; // Added email field
    section: string;
    rubrique: string;
    question: string;
    score: number | string | string[];
  };
}

/**
 * Transforme une liste de réponses à plat en format d'items JSON pour n8n.
 * Format attendu par le workflow : un tableau d'objets avec une clé "json".
 */
export const buildN8NPayload = (respondant: string, email: string, answers: Answer[]): N8NSubmissionItem[] => {
  return answers.map(ans => ({
    json: {
      respondant: respondant,
      email: email,
      section: ans.section,
      rubrique: ans.rubrique,
      question: ans.question,
      score: typeof ans.score === 'number' ? Math.round(ans.score) : ans.score
    }
  }));
};

// Basic interface for the profile info needed for routing
interface RoutingProfile {
  role: string;
  entreprise_id?: string;
  [key: string]: any;
}

/**
 * Envoie les réponses au webhook n8n approprié selon le profil utilisateur.
 * 
 * Logique de routage :
 * 1. Pulse Express (Individuel Sans Entreprise) -> Webhook INDIVIDUEL
 * 2. Pulse Team (Individuel AVEC Entreprise) -> Webhook CORP/ADMIN
 * 3. Manager/Admin/Directeur -> Webhook CORP/ADMIN
 * 
 * @param items Les données à envoyer
 * @param profile Le profil utilisateur pour le routage
 */
export const sendToN8N = async (items: N8NSubmissionItem[], profile?: RoutingProfile): Promise<DiagnosticReport> => {
  const isExpressUser = profile?.role === 'INDIVIDUEL' && !profile?.entreprise_id;

  // Determine webhook URL
  const targetUrl = isExpressUser
    ? N8N_INDIVIDUAL_WEBHOOK_URL
    : N8N_CORP_WEBHOOK_URL;

  const mode = isExpressUser ? "Express (Individuel)" : "Team/Corp (Entreprise)";
  console.log(`[Pulse n8n Connector] Tentative d'envoi de ${items.length} réponses. Mode: ${mode}`);
  console.log(`[Pulse n8n Connector] Cible : ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP n8n : ${response.status} - ${errorText || response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Pulse n8n Connector] Succès : Données transmises et rapport reçu.`, data);

    // Normalize n8n response which might be [{ json: { ... } }] or { json: { ... } } or directly { ... }
    let report = data;
    if (Array.isArray(data) && data.length > 0) {
      report = data[0];
    }
    if (report && report.json) {
      report = report.json;
    }

    return report as DiagnosticReport;
  } catch (error) {
    console.error(`[Pulse n8n Connector] Échec de l'envoi :`, error);
    throw error;
  }
};

/**
 * Synchronise la définition d'un questionnaire avec le webhook n8n ADMIN/ENTREPRISE.
 * 
 * @param payload La structure du questionnaire à synchroniser
 */
export const syncQuestionnaireToN8N = async (payload: any): Promise<any> => {
  console.log(`[Pulse n8n Connector] Synchronisation du questionnaire (Admin/Corp)...`, payload);

  try {
    const response = await fetch(N8N_CORP_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP n8n (Sync) : ${response.status} - ${errorText || response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Pulse n8n Connector] Succès : Questionnaire synchronisé.`, data);
    return data;
  } catch (error) {
    console.error(`[Pulse n8n Connector] Échec de la synchronisation :`, error);
    throw error;
  }
};
