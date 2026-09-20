import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  HeartPulse,
  Info,
  Pill,
  Scale,
  ShieldAlert,
  ShieldCheck,
  User,
  Utensils,
  X,
} from 'lucide-react';
import { CompatibilityAnalysis, Patient } from '../types';
import { getDiseaseById, getFoodById } from '../services/clinicalEngine';

interface TechnicalSheetModalProps {
  analysis: CompatibilityAnalysis | null;
  patient: Patient;
  onClose: () => void;
  onSelectToAssign: (analysis: CompatibilityAnalysis) => void;
}

export const TechnicalSheetModal: React.FC<TechnicalSheetModalProps> = ({
  analysis,
  patient,
  onClose,
  onSelectToAssign,
}) => {
  if (!analysis) return null;

  const diet = analysis.diet;
  const isCompatible = analysis.status === 'COMPATIBLE';
  const disease = getDiseaseById(patient.activeDiseaseIds[0]);

  // Set of food IDs that caused conflict
  const conflictingFoodIds = new Set(analysis.conflicts.map((c) => c.foodId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Context Bar: Keeps Patient + Diagnosis + Compatibility clearly visible (CA3 MANDATE) */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-800 text-teal-200 font-mono">
                  FICHA TÉCNICA CLÍNICA (CA3)
                </span>
                <span className="text-xs text-slate-400">Contexto clínico activo:</span>
              </div>

              {/* Patient Identification */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm font-extrabold text-white">
                  <User className="w-4 h-4 text-teal-400" />
                  <span>Paciente: <strong>{patient.fullName}</strong></span>
                  <span className="text-xs font-mono text-slate-400 font-normal">({patient.medicalRecordNumber})</span>
                </div>
                <span className="text-xs text-slate-400">•</span>
                <div className="flex items-center gap-1.5 text-xs text-teal-200 font-semibold">
                  <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
                  <span>Diagnóstico: <strong>{disease ? disease.name : 'Registrado'}</strong></span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              id="btn-close-technical-sheet"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cerrar ficha técnica"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Compatibility Status Pill inside Sheet (CA3 Requirement) */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Estado de Compatibilidad para este paciente:</span>
              {isCompatible ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ✓ COMPATIBLE — DIETA SEGURA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ⚠ INCOMPATIBILIDAD DETECTADA ({analysis.conflicts.length} alerta{analysis.conflicts.length > 1 ? 's' : ''})
                </span>
              )}
            </div>

            <span className="text-xs font-mono text-slate-400">
              Código Dieta: {diet.code}
            </span>
          </div>
        </div>

        {/* Warning Banner if Incompatible (Preserved inside Sheet) */}
        {!isCompatible && (
          <div className="bg-amber-100/90 border-b border-amber-200 px-6 py-3.5 text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-amber-950 uppercase tracking-wider">
                Alerta Crítica de Seguridad del Paciente:
              </p>
              {analysis.conflicts.map((c, i) => (
                <p key={i}>
                  • Contiene <strong>{c.foodName}</strong> que entra en conflicto directo con la{' '}
                  <strong>{c.patientRestriction}</strong> de {patient.fullName}.
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Sheet Body Content */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Diet Title & Objective */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Space_Grotesk']">
              {diet.name}
            </h2>
            <div className="mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs sm:text-sm">
              <p>
                <strong className="text-slate-900">Objetivo Clínico:</strong>{' '}
                <span className="text-slate-700">{diet.objective}</span>
              </p>
              <p>
                <strong className="text-slate-900">Definición Técnica:</strong>{' '}
                <span className="text-slate-700">{diet.technicalDefinition}</span>
              </p>
            </div>
          </div>

          {/* Caloric Intake & Macronutrient Breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Aporte Calórico e Información Nutricional
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Calorías Totales</span>
                <span className="text-lg font-black text-amber-950 font-mono">{diet.caloricKcal}</span>
                <span className="text-[10px] text-amber-800 block">kcal/día</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Carbohidratos</span>
                <span className="text-base font-bold text-slate-800 font-mono">{diet.nutrients.carbohydratesGrams}g</span>
                <span className="text-[10px] text-slate-500 block">({diet.nutrients.carbohydratesPercentage}%)</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Proteínas</span>
                <span className="text-base font-bold text-slate-800 font-mono">{diet.nutrients.proteinsGrams}g</span>
                <span className="text-[10px] text-slate-500 block">({diet.nutrients.proteinsPercentage}%)</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Grasas Totales</span>
                <span className="text-base font-bold text-slate-800 font-mono">{diet.nutrients.fatsGrams}g</span>
                <span className="text-[10px] text-slate-500 block">({diet.nutrients.fatsPercentage}%)</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Fibra / Sodio</span>
                <span className="text-base font-bold text-slate-800 font-mono">{diet.nutrients.fiberGrams}g</span>
                <span className="text-[10px] text-slate-500 block">{diet.nutrients.sodiumMg} mg Na+</span>
              </div>
            </div>
          </div>

          {/* Foods breakdown with red warning for conflicting foods */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-teal-600" />
              Alimentos que la Componen y Detección de Alérgenos
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Alimento</th>
                    <th className="py-2.5 px-3">Porción / Detalle</th>
                    <th className="py-2.5 px-3">Origen y Función</th>
                    <th className="py-2.5 px-3">Estado de Incompatibilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {diet.foods.map((foodItem, idx) => {
                    const foodDetail = getFoodById(foodItem.foodId);
                    const isConflict = conflictingFoodIds.has(foodItem.foodId);

                    return (
                      <tr
                        key={idx}
                        className={isConflict ? 'bg-amber-50/70 font-medium' : 'hover:bg-slate-50/60'}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {foodDetail ? foodDetail.name : foodItem.foodId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {foodItem.portion} {foodItem.notes ? `(${foodItem.notes})` : ''}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {foodDetail ? `${foodDetail.origin} — ${foodDetail.mainFunction}` : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          {isConflict ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              INCOMPATIBLE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Tolerado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Prescription Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Vía de Administración
              </span>
              <p className="font-bold text-slate-800 mt-0.5">{diet.routeOfAdministration}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Duración Sugerida
              </span>
              <p className="font-bold text-slate-800 mt-0.5">{diet.duration}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Dosificación y Pauta
              </span>
              <p className="font-bold text-slate-800 mt-0.5">{diet.dosage}</p>
            </div>
          </div>

          {/* Schedule (Pauta de tomas) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              Pauta de Horarios y Distribución de Tomas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {diet.schedule.map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-1 rounded text-[11px] border border-teal-200 shrink-0">
                    {item.time}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.mealName}</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-tight">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplements & Ingesta Necesaria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                Ingesta Necesaria
              </h4>
              <p className="text-slate-600 leading-relaxed">{diet.requiredIntake}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                Suplementos Prescritos
              </h4>
              <ul className="text-slate-600 list-disc list-inside space-y-0.5">
                {diet.supplements && diet.supplements.length > 0 ? (
                  diet.supplements.map((sup, idx) => <li key={idx}>{sup}</li>)
                ) : (
                  <li>No requiere suplementación farmacológica obligatoria.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Contraindications & Precautions */}
          <div className="space-y-1.5 bg-rose-50/50 p-4 rounded-2xl border border-rose-200 text-xs">
            <h4 className="font-bold text-rose-950 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-700" />
              Contraindicaciones e Incompatibilidades Técnicas Conocidas
            </h4>
            <ul className="text-rose-900/90 list-disc list-inside space-y-1 mt-1 leading-relaxed">
              {diet.contraindications.map((contra, idx) => (
                <li key={idx}>{contra}</li>
              ))}
            </ul>
            {diet.clinicalPrecaution && (
              <p className="mt-2 pt-2 border-t border-rose-200 text-rose-900 font-semibold">
                <strong>Precaución Médica:</strong> {diet.clinicalPrecaution}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cerrar Ficha Técnica
          </button>

          <button
            id="btn-assign-from-tech-sheet"
            onClick={() => {
              onClose();
              onSelectToAssign(analysis);
            }}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 ${
              isCompatible
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {isCompatible ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Proceder a Asignar esta Dieta Compatible</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Revisar Incompatibilidad para Asignar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
