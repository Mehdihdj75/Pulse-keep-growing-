
export const generateSectionCode = (index: number) => `S${index + 1}`;
export const generateRubricCode = (sectionIndex: number, rubricIndex: number) => 
  `S${sectionIndex + 1}R${rubricIndex + 1}`;
export const generateQuestionCode = (sectionIndex: number, rubricIndex: number, questionIndex: number) => 
  `S${sectionIndex + 1}R${rubricIndex + 1}Q${questionIndex + 1}`;

export interface RawQuestionnaire {
  nom: string;
  description: string;
  version: string;
  statut: 'brouillon' | 'actif';
  echelle: { min: number; max: number };
  sections: Array<{
    code: string;
    titre: string;
    rubriques: Array<{
      code: string;
      titre: string;
      questions: Array<{
        code: string;
        texte: string;
      }>;
    }>;
  }>;
}

export const createEmptySection = (index: number) => ({
  code: generateSectionCode(index),
  titre: `Section ${index + 1}`,
  rubriques: [
    {
      code: generateRubricCode(index, 0),
      titre: 'Rubrique 1',
      questions: []
    }
  ]
});
