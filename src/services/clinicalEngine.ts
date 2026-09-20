import {
  CompatibilityAnalysis,
  CompatibilityStatus,
  Diet,
  Disease,
  Food,
  IncompatibilityConflict,
  Patient,
  RestrictionType,
} from '../types';
import { dietsData, diseasesData, foodsData } from '../data/mockData';

// Helper to normalize strings for comparison (remove accents, lowercase)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Map patient allergy / restriction strings to semantic keywords
function extractKeywords(text: string): string[] {
  const norm = normalizeText(text);
  const keywords: string[] = [];

  const mappings: Record<string, string[]> = {
    mani: ['mani', 'cacahuate', 'cacahuete', 'peanuts'],
    frutos_secos: ['frutos secos', 'nueces', 'nuez', 'avellana', 'almendra', 'pistacho', 'fruto seco'],
    mariscos: ['mariscos', 'marisco', 'crustaceo', 'crustaceos', 'camaron', 'camarones', 'langostino'],
    lactosa: ['lactosa', 'lacteo', 'leche', 'caseina', 'crema de leche', 'yogur', 'queso'],
    gluten: ['gluten', 'tacc', 'trigo', 'cebada', 'centeno', 'harina de trigo', 'semola', 'fideos'],
    huevo: ['huevo', 'huevos', 'clara de huevo', 'yema', 'albumina', 'ovomucina'],
    soya: ['soya', 'soja', 'tofu', 'edamame'],
    pescado: ['pescado', 'salmon', 'merluza', 'atun'],
  };

  for (const [key, aliases] of Object.entries(mappings)) {
    if (aliases.some((alias) => norm.includes(alias))) {
      keywords.push(key);
      keywords.push(...aliases);
    }
  }

  // Also include the normalized words of the text
  const words = norm.split(/\s+/).filter((w) => w.length > 3);
  keywords.push(...words);

  return Array.from(new Set(keywords));
}

/**
 * Checks whether a specific food item conflicts with any of the patient's registered allergies or restrictions.
 */
export function checkFoodConflict(
  food: Food,
  patient: Patient
): IncompatibilityConflict[] {
  const conflicts: IncompatibilityConflict[] = [];
  const normalizedFoodName = normalizeText(food.name);
  const normalizedFoodDef = normalizeText(food.definition);
  const foodTags = food.allergenTags.map(normalizeText);

  // 1. Check Patient Allergies
  for (const allergy of patient.allergies) {
    const allergyKeywords = extractKeywords(allergy.name);
    let matched = false;
    let matchedReason = '';

    // Check tags
    for (const tag of foodTags) {
      if (allergyKeywords.includes(tag) || allergyKeywords.some((k) => tag.includes(k) || k.includes(tag))) {
        matched = true;
        matchedReason = `Etiqueta alergénica '${tag}' coincide con '${allergy.name}'`;
        break;
      }
    }

    // Check food name
    if (!matched) {
      for (const kw of allergyKeywords) {
        if (kw.length >= 4 && normalizedFoodName.includes(kw)) {
          matched = true;
          matchedReason = `Alimento '${food.name}' contiene '${kw}' asociado a '${allergy.name}'`;
          break;
        }
      }
    }

    // Check food definition
    if (!matched) {
      for (const kw of allergyKeywords) {
        if (kw.length >= 5 && normalizedFoodDef.includes(kw)) {
          matched = true;
          matchedReason = `Composición técnica de '${food.name}' contiene '${kw}' asociado a '${allergy.name}'`;
          break;
        }
      }
    }

    if (matched) {
      conflicts.push({
        foodId: food.id,
        foodName: food.name,
        restrictionType: 'ALERGIA',
        patientRestriction: `${allergy.name} (${allergy.severity})`,
        matchedTag: allergy.name,
        clinicalExplanation: `Riesgo alergénico directo: '${food.name}' genera conflicto con el antecedente de ${allergy.name} del paciente (${allergy.reaction || 'reacción de hipersensibilidad'}).`,
      });
    }
  }

  // 2. Check Patient Food Restrictions / Intolerances
  for (const restriction of patient.foodRestrictions) {
    const restrictionKeywords = extractKeywords(restriction.name + ' ' + restriction.description);
    let matched = false;

    for (const tag of foodTags) {
      if (restrictionKeywords.includes(tag) || restrictionKeywords.some((k) => tag.includes(k) || k.includes(tag))) {
        matched = true;
        break;
      }
    }

    if (!matched) {
      for (const kw of restrictionKeywords) {
        if (kw.length >= 4 && (normalizedFoodName.includes(kw) || normalizedFoodDef.includes(kw))) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      // Avoid duplicate if already matched under allergy
      const exists = conflicts.some((c) => c.foodId === food.id && c.patientRestriction.includes(restriction.name));
      if (!exists) {
        conflicts.push({
          foodId: food.id,
          foodName: food.name,
          restrictionType: restriction.type,
          patientRestriction: restriction.name,
          matchedTag: restriction.name,
          clinicalExplanation: `Incompatibilidad funcional: '${food.name}' vulnera la indicación de '${restriction.name}' (${restriction.description}).`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Executes the clinical cross-engine (EPIC 28):
 * Patient -> Diagnosed Diseases -> Associated Diets -> Foods Analysis -> Allergies & Incompatibilities Check
 * Returns evaluated diets with deterministic compatibility status.
 */
export function evaluatePatientDiets(
  patient: Patient,
  selectedDiseaseId?: string
): {
  patient: Patient;
  evaluatedDiseases: Disease[];
  analyses: CompatibilityAnalysis[];
  stats: {
    totalEvaluated: number;
    compatibleCount: number;
    incompatibleCount: number;
  };
} {
  // 1. Identify patient diseases
  const targetDiseaseIds = selectedDiseaseId
    ? [selectedDiseaseId]
    : patient.activeDiseaseIds;

  const evaluatedDiseases = diseasesData.filter((d) =>
    targetDiseaseIds.includes(d.id)
  );

  // 2. Collect associated diets
  const associatedDietIdSet = new Set<string>();
  for (const disease of evaluatedDiseases) {
    disease.associatedDietIds.forEach((id) => associatedDietIdSet.add(id));
  }

  const associatedDiets = dietsData.filter((diet) =>
    associatedDietIdSet.has(diet.id)
  );

  // 3. For each diet, inspect foods and cross against patient allergies/restrictions
  const analyses: CompatibilityAnalysis[] = associatedDiets.map((diet) => {
    const dietFoods: Food[] = diet.foodIds
      .map((fId) => foodsData.find((f) => f.id === fId))
      .filter((f): f is Food => !!f);

    const conflicts: IncompatibilityConflict[] = [];

    for (const food of dietFoods) {
      const foodConflicts = checkFoodConflict(food, patient);
      conflicts.push(...foodConflicts);
    }

    // Additional check on diet contraindications and precautions text
    const normalizedContraindications = normalizeText(
      diet.contraindications.join(' ') + ' ' + (diet.clinicalPrecaution || '')
    );
    for (const allergy of patient.allergies) {
      const keywords = extractKeywords(allergy.name);
      for (const kw of keywords) {
        if (kw.length >= 4 && normalizedContraindications.includes(kw)) {
          // If not already covered by a food conflict
          if (!conflicts.some((c) => c.patientRestriction.includes(allergy.name))) {
            conflicts.push({
              foodId: 'contraindication-ref',
              foodName: `Contraindicación técnica de la dieta (${diet.name})`,
              restrictionType: 'ALERGIA',
              patientRestriction: allergy.name,
              matchedTag: kw,
              clinicalExplanation: `La ficha técnica de la dieta contempla contraindicación expresa para ${allergy.name}.`,
            });
          }
        }
      }
    }

    const status: CompatibilityStatus =
      conflicts.length === 0 ? 'COMPATIBLE' : 'INCOMPATIBLE';

    let clinicalSummary = '';
    if (status === 'COMPATIBLE') {
      clinicalSummary =
        '✓ Compatible — No se detectaron incompatibilidades con las alergias ni restricciones alimentarias registradas del paciente.';
    } else {
      const distinctFoods = Array.from(new Set(conflicts.map((c) => c.foodName))).join(', ');
      const distinctAllergies = Array.from(new Set(conflicts.map((c) => c.patientRestriction))).join(' | ');
      clinicalSummary = `⚠ Incompatibilidad detectada — Contiene ${distinctFoods} incompatible con: ${distinctAllergies}.`;
    }

    return {
      diet,
      status,
      conflicts,
      compatibilityScore: status === 'COMPATIBLE' ? 100 : Math.max(0, 100 - conflicts.length * 40),
      clinicalSummary,
    };
  });

  // Sort: Compatible diets first for clinical speed (< 90s CA4), then Incompatible
  analyses.sort((a, b) => {
    if (a.status === 'COMPATIBLE' && b.status === 'INCOMPATIBLE') return -1;
    if (a.status === 'INCOMPATIBLE' && b.status === 'COMPATIBLE') return 1;
    return a.diet.name.localeCompare(b.diet.name);
  });

  const compatibleCount = analyses.filter((a) => a.status === 'COMPATIBLE').length;
  const incompatibleCount = analyses.filter((a) => a.status === 'INCOMPATIBLE').length;

  return {
    patient,
    evaluatedDiseases,
    analyses,
    stats: {
      totalEvaluated: analyses.length,
      compatibleCount,
      incompatibleCount,
    },
  };
}

/**
 * Lookup helper to retrieve full food object by ID.
 */
export function getFoodById(id: string): Food | undefined {
  return foodsData.find((f) => f.id === id);
}

/**
 * Lookup helper to retrieve disease object by ID.
 */
export function getDiseaseById(id: string): Disease | undefined {
  return diseasesData.find((d) => d.id === id);
}
