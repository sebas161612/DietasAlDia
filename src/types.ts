export type Gender = 'M' | 'F' | 'Otro';

export type RestrictionType = 'ALERGIA' | 'INTOLERANCIA' | 'RESTRICCIÓN';

export interface Allergy {
  id: string;
  name: string;
  category: string; // e.g. 'Fruto seco', 'Marisco', 'Proteína animal', 'Cereal'
  severity: 'LEVE' | 'MODERADA' | 'SEVERA' | 'ANAFILAXIA';
  reaction: string;
}

export interface FoodRestriction {
  id: string;
  name: string;
  type: RestrictionType;
  description: string;
}

export interface Food {
  id: string;
  name: string;
  definition: string;
  origin: string; // e.g., 'Vegetal', 'Animal', 'Cereal', 'Legumbre'
  mainFunction: string; // e.g., 'Aporte de fibra soluble y energía', 'Aporte proteico de alto valor biológico'
  allergenTags: string[]; // normalized tags for cross matching: ['mani', 'frutos_secos', 'gluten', 'lactosa', 'mariscos', 'huevo', 'soya', etc.]
  nutritionalHighlights?: string;
}

export interface Macronutrients {
  caloriesKcal: number;
  carbohydratesGrams: number;
  carbohydratesPercentage: number;
  proteinsGrams: number;
  proteinsPercentage: number;
  fatsGrams: number;
  fatsPercentage: number;
  fiberGrams: number;
  sodiumMg: number;
}

export interface DietScheduleItem {
  time: string;
  mealName: string;
  description: string;
}

export type AdministrationRoute =
  | 'Vía Oral'
  | 'Vía Enteral por Sonda'
  | 'Vía Mixta (Oral asistida)'
  | 'Vía Mixta (Oral + Enteral)'
  | 'Vía Parenteral Complementaria';

export interface Diet {
  id: string;
  code: string;
  name: string;
  objective: string;
  technicalDefinition: string;
  caloricKcal: number;
  associatedDiseaseIds: string[];
  foodIds: string[];
  foods: {
    foodId: string;
    portion: string;
    notes?: string;
  }[];
  nutrients: Macronutrients;
  requiredIntake: string;
  routeOfAdministration: AdministrationRoute | string;
  duration: string;
  dosage: string;
  schedule: DietScheduleItem[];
  supplements?: string[];
  contraindications: string[];
  clinicalPrecaution?: string;
}

export interface Disease {
  id: string;
  code: string; // CIE-10
  name: string;
  description: string;
  causes: string;
  diagnosis: string;
  differentialDiagnoses: string[];
  treatment: string;
  treatmentGoal: string;
  associatedDietIds: string[];
}

export interface Patient {
  id: string;
  medicalRecordNumber: string; // Historial clínico #
  fullName: string;
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  bmi: number;
  roomBed: string;
  activeDiseaseIds: string[];
  allergies: Allergy[];
  foodRestrictions: FoodRestriction[];
  clinicalHistory: string;
  clinicalRequirements: string;
  admissionDate: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    glucoseMgDl?: number;
    oxygenSaturation: number;
  };
}

export interface IncompatibilityConflict {
  foodId: string;
  foodName: string;
  restrictionType: RestrictionType;
  patientRestriction: string;
  matchedTag: string;
  clinicalExplanation: string;
}

export type CompatibilityStatus = 'COMPATIBLE' | 'INCOMPATIBLE';

export interface CompatibilityAnalysis {
  diet: Diet;
  status: CompatibilityStatus;
  conflicts: IncompatibilityConflict[];
  compatibilityScore: number; // 100 if compatible, < 100 if conflicts
  clinicalSummary: string;
}

export interface PrescribedTreatment {
  id: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  dietId: string;
  dietName: string;
  dietCode: string;
  diseaseId: string;
  diseaseName: string;
  caloricKcal: number;
  prescriptionDate: string;
  physicianName: string;
  physicianLicense: string;
  status: 'ACTIVO' | 'EN_REVISIÓN' | 'SUSPENDIDO' | 'FINALIZADO';
  routeOfAdministration: string;
  durationDays: number;
  clinicalNotes: string;
  compatibilityAtAssignment: CompatibilityStatus;
  conflictOverrideJustification?: string;
  schedule?: DietScheduleItem[];
}
