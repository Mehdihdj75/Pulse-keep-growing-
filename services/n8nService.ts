
/**
 * Service de communication avec n8n pour l'automatisation des diagnostics Pulse.
 */

export const N8N_WEBHOOK_URL = "https://n8n.srv864713.hstgr.cloud/webhook-test/7e875dda-419b-43f9-ba61-4b88e268156f";

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

/**
 * Envoie les données au webhook n8n via une requête POST JSON.
 * Gère les erreurs de réponse et loggue l'activité.
 */
export const sendToN8N = async (items: N8NSubmissionItem[]) => {
  console.log(`[Pulse n8n Connector] Tentative d'envoi de ${items.length} réponses...`, items);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
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

    const data = await response.json().catch(() => ({})); // Handle cases where no JSON is returned gracefully
    console.log(`[Pulse n8n Connector] Succès : Données transmises au webhook.`);
    return data;
  } catch (error) {
    console.error(`[Pulse n8n Connector] Échec de l'envoi :`, error);
    throw error;
  }
};
