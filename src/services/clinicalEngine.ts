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

// Map patient allergy / restriction strings to semantic keywords for matching allergenTags
function getSemanticAllergenKeys(text: string): string[] {
  const norm = normalizeText(text);
  const keys: string[] = [];

  const mappings: Record<string, string[]> = {
    mani: ['mani', 'cacahuate', 'cacahuete', 'peanut'],
    frutos_secos: ['frutos_secos', 'frutos secos', 'nueces', 'nuez', 'avellana', 'almendra', 'pistacho', 'fruto seco'],
    mariscos: ['mariscos', 'marisco', 'crustaceo', 'crustaceos', 'camaron', 'camarones', 'langostino'],
    lactosa: ['lactosa', 'lacteo', 'leche', 'caseina', 'suero_leche', 'proteina_lactea'],
    gluten: ['gluten', 'tacc', 'trigo', 'cebada', 'centeno'],
    huevo: ['huevo', 'huevos', 'albumina', 'ovomucina'],
    soya: ['soya', 'soja'],
    pescado: ['pescado', 'pescado_marisco', 'salmon'],
  };

  for (const [canonicalKey, aliases] of Object.entries(mappings)) {
    if (aliases.some((alias) => norm.includes(alias))) {
      keys.push(canonicalKey);
    }
  }

  return keys;
}

/**
 * Checks whether a specific food item conflicts with any of the patient's registered allergies or restrictions.
 * Compares patient allergies & restrictions against the structured food.allergenTags.
 */
export function checkFoodConflict(
  food: Food,
  patient: Patient
): IncompatibilityConflict[] {
  const conflicts: IncompatibilityConflict[] = [];
  const foodTags = food.allergenTags.map(normalizeText);

  // If the food has no allergen tags, it produces no allergen/restriction conflicts
  if (foodTags.length === 0) {
    return conflicts;
  }

  // 1. Check Patient Allergies against food.allergenTags
  for (const allergy of patient.allergies) {
    const allergyKeys = getSemanticAllergenKeys(allergy.name);
    let matchedTag = '';

    for (const tag of foodTags) {
      const tagKeys = getSemanticAllergenKeys(tag);
      // Match if canonical allergen key matches or exact/normalized tag inclusion
      const hasKeyMatch = allergyKeys.some((ak) => tagKeys.includes(ak) || tag === ak);
      const hasDirectMatch = tag.length >= 4 && normalizeText(allergy.name).includes(tag);

      if (hasKeyMatch || hasDirectMatch) {
        matchedTag = tag;
        break;
      }
    }

    if (matchedTag) {
      conflicts.push({
        foodId: food.id,
        foodName: food.name,
        restrictionType: 'ALERGIA',
        patientRestriction: `${allergy.name} (${allergy.severity})`,
        matchedTag: matchedTag,
        clinicalExplanation: `Riesgo alergénico directo: el alimento '${food.name}' contiene la etiqueta alergénica '${matchedTag}' que entra en conflicto con el antecedente de '${allergy.name}' del paciente (${allergy.reaction || 'reacción de hipersensibilidad'}).`,
      });
    }
  }

  // 2. Check Patient Food Restrictions / Intolerances against food.allergenTags
  for (const restriction of patient.foodRestrictions) {
    const restrictionKeys = getSemanticAllergenKeys(restriction.name + ' ' + restriction.description);
    let matchedTag = '';

    for (const tag of foodTags) {
      const tagKeys = getSemanticAllergenKeys(tag);
      const hasKeyMatch = restrictionKeys.some((rk) => tagKeys.includes(rk) || tag === rk);
      const hasDirectMatch = tag.length >= 4 && normalizeText(restriction.name).includes(tag);

      if (hasKeyMatch || hasDirectMatch) {
        matchedTag = tag;
        break;
      }
    }

    if (matchedTag) {
      // Avoid duplicate if already matched under allergy
      const exists = conflicts.some(
        (c) => c.foodId === food.id && c.patientRestriction.includes(restriction.name)
      );
      if (!exists) {
        conflicts.push({
          foodId: food.id,
          foodName: food.name,
          restrictionType: restriction.type,
          patientRestriction: restriction.name,
          matchedTag: matchedTag,
          clinicalExplanation: `Incompatibilidad funcional: el alimento '${food.name}' (etiqueta alergénica '${matchedTag}') vulnera la indicación de '${restriction.name}' (${restriction.description}).`,
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
