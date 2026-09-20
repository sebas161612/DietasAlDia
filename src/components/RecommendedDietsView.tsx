import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  Filter,
  Flame,
  HeartPulse,
  Info,
  Layers,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Utensils,
  XCircle,
} from 'lucide-react';
import { CompatibilityAnalysis, Patient } from '../types';
import { evaluatePatientDiets } from '../services/clinicalEngine';

interface RecommendedDietsViewProps {
  patient: Patient;
  allPatients: Patient[];
  onSwitchPatient: (patient: Patient) => void;
  onOpenTechnicalSheet: (analysis: CompatibilityAnalysis) => void;
  onSelectDietToAssign: (analysis: CompatibilityAnalysis) => void;
  onBackToPatients: () => void;
  onViewPatientProfile: (patient: Patient) => void;
}

export const RecommendedDietsView: React.FC<RecommendedDietsViewProps> = ({
  patient,
  allPatients,
  onSwitchPatient,
  onOpenTechnicalSheet,
  onSelectDietToAssign,
  onBackToPatients,
  onViewPatientProfile,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'compatible' | 'incompatible'>('all');
  const [showPatientSwitcher, setShowPatientSwitcher] = useState(false);

  // Execute deterministic clinical cross-engine (EPIC 28)
  const evaluation = useMemo(() => {
    return evaluatePatientDiets(patient);
  }, [patient]);

  const filteredAnalyses = useMemo(() => {
    if (filterMode === 'compatible') {
      return evaluation.analyses.filter((a) => a.status === 'COMPATIBLE');
    }
    if (filterMode === 'incompatible') {
      return evaluation.analyses.filter((a) => a.status === 'INCOMPATIBLE');
    }
    return evaluation.analyses;
  }, [evaluation.analyses, filterMode]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="btn-back-to-patients"
          onClick={onBackToPatients}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Directorio de Pacientes</span>
        </button>

        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span>Tiempo estimado de selección segura: <strong>&lt; 90s (CA4)</strong></span>
        </div>
      </div>

      {/* Persistent Patient Clinical Context Header (MANDATORY for CA1, CA2 & CA3) */}
      <section
        id="patient-sticky-context-bar"
        className="bg-white rounded-3xl border-2 border-teal-600/30 p-5 sm:p-6 shadow-md relative"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Patient identification */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-teal-700 text-white font-mono">
                {patient.medicalRecordNumber}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Space_Grotesk']">
                {patient.fullName}
              </h1>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {patient.age} años • {patient.gender === 'F' ? 'Mujer' : 'Hombre'} • {patient.roomBed}
              </span>

              {/* Patient Switcher Dropdown */}
              <div className="relative inline-block">
                <button
                  id="btn-toggle-patient-switcher"
                  onClick={() => setShowPatientSwitcher(!showPatientSwitcher)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200 transition"
                >
                  <span>Cambiar paciente</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showPatientSwitcher && (
                  <div className="absolute left-0 mt-1 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 text-xs space-y-1 animate-in fade-in">
                    <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                      Seleccionar otro paciente para prueba:
                    </p>
                    {allPatients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSwitchPatient(p);
                          setShowPatientSwitcher(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition flex items-center justify-between ${
                          p.id === patient.id
                            ? 'bg-teal-700 text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="truncate">{p.fullName}</span>
                        <span className="text-[10px] opacity-75 font-mono ml-1">
                          {p.medicalRecordNumber}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Registered Diagnosis in context */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                Diagnóstico activo:
              </span>
              {evaluation.evaluatedDiseases.map((dis) => (
                <span
                  key={dis.id}
                  className="inline-flex items-center gap-1.5 font-bold text-teal-950 bg-teal-100/80 border border-teal-300/80 px-2.5 py-1 rounded-lg"
                >
                  <span>{dis.name}</span>
                  <span className="text-[10px] font-mono bg-white/80 px-1 rounded text-teal-800">
                    CIE-10: {dis.code}
                  </span>
                </span>
              ))}

              <button
                onClick={() => onViewPatientProfile(patient)}
                className="text-[11px] font-bold text-teal-700 hover:underline ml-1"
              >
                Ver historia clínica completa
              </button>
            </div>

            {/* Patient Nutritional & Caloric Requirements (Feature 4 Visibility) */}
            {patient.clinicalRequirements && (
              <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700">
                <span className="font-bold text-slate-900 flex items-center gap-1 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Requerimiento nutricional del paciente:
                </span>
                <span className="italic font-medium text-slate-600">
                  {patient.clinicalRequirements}
                </span>
              </div>
            )}
          </div>

          {/* Patient Allergies & Restrictions Box */}
          <div className="lg:max-w-md w-full bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Alergias e Incompatibilidades Registradas
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.2 rounded">
                Base del cruce clínico
              </span>
            </div>

            {patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((allergy) => (
                  <span
                    key={allergy.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>{allergy.name}</span>
                    <span className="text-[10px] font-normal text-amber-800">
                      ({allergy.severity})
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Sin alergias conocidas registradas.
              </p>
            )}

            {patient.foodRestrictions.length > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 flex items-center gap-1 flex-wrap text-[11px] text-amber-900">
                <span className="font-bold">Restricciones:</span>
                {patient.foodRestrictions.map((r) => (
                  <span key={r.id} className="bg-amber-100/50 px-1.5 py-0.5 rounded">
                    {r.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Clinical Cross Summary Engine Banner (Demonstrates automated cross in 1 step - CA1) */}
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 shadow-sm border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white font-['Space_Grotesk']">
                  Cruce Automático de Dietas Asociadas (EPIC 28)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Determinista
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Se obtuvieron automáticamente <strong>{evaluation.stats.totalEvaluated} dietas</strong> formuladas para{' '}
                <strong className="text-teal-200">{evaluation.evaluatedDiseases.map((d) => d.name).join(', ')}</strong>{' '}
                y se cruzaron sus ingredientes frente al perfil alérgico de {patient.fullName}.
              </p>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                Compatibles / Seguras
              </span>
              <span className="text-base font-black text-emerald-400 font-['Space_Grotesk']">
                {evaluation.stats.compatibleCount}
              </span>
            </div>

            <div className="bg-amber-950/80 border border-amber-500/40 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">
                Incompatibilidades
              </span>
              <span className="text-base font-black text-amber-400 font-['Space_Grotesk']">
                {evaluation.stats.incompatibleCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Mostrar:
          </span>
          <button
            id="tab-filter-all"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todas las dietas ({evaluation.analyses.length})
          </button>
          <button
            id="tab-filter-compatible"
            onClick={() => setFilterMode('compatible')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterMode === 'compatible'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Solo Compatibles ({evaluation.stats.compatibleCount})</span>
          </button>
          <button
            id="tab-filter-incompatible"
            onClick={() => setFilterMode('incompatible')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterMode === 'incompatible'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Con Incompatibilidades ({evaluation.stats.incompatibleCount})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Ordenadas por seguridad clínica
        </span>
      </div>

      {/* Diets Evaluation Cards (CA1 & CA2 Implementation) */}
      <div className="space-y-4">
        {filteredAnalyses.map((analysis) => {
          const isCompatible = analysis.status === 'COMPATIBLE';
          const diet = analysis.diet;

          return (
            <div
              key={diet.id}
              id={`diet-card-${diet.id}`}
              className={`rounded-3xl border-2 transition shadow-xs bg-white overflow-hidden ${
                isCompatible
                  ? 'border-emerald-200/90 hover:border-emerald-400 hover:shadow-md'
                  : 'border-amber-300 bg-amber-50/20 hover:border-amber-400 hover:shadow-md'
              }`}
            >
              {/* Compatibility Status Banner (MANDATORY for CA2: unequivocal differentiation) */}
              <div
                className={`px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompatible
                    ? 'bg-emerald-50/90 border-b border-emerald-100 text-emerald-900'
                    : 'bg-amber-100 border-b border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isCompatible ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs animate-pulse">
                      <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                          isCompatible
                            ? 'bg-emerald-200 text-emerald-950'
                            : 'bg-amber-200 text-amber-950 border border-amber-300'
                        }`}
                      >
                        {isCompatible ? '✓ COMPATIBLE — DIETA SEGURA' : '⚠ INCOMPATIBILIDAD DETECTADA'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {diet.code}
                      </span>
                    </div>
                    <p className="text-xs font-medium mt-0.5">
                      {analysis.clinicalSummary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                    Score: <strong>{analysis.compatibilityScore}%</strong>
                  </span>
                </div>
              </div>

              {/* Incompatible Conflict Details Box (CA2 Requirement: Food + Allergy + Affected Diet) */}
              {!isCompatible && analysis.conflicts.length > 0 && (
                <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 border-b border-amber-300/80 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      Detalle Explícito de Incompatibilidades Clínicas (CA2)
                    </h4>
                    <span className="text-[11px] font-bold bg-amber-200 px-2 py-0.5 rounded text-amber-900">
                      {analysis.conflicts.length} conflicto(s) detectado(s)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {analysis.conflicts.map((conflict, idx) => (
                      <div
                        key={idx}
                        className="bg-white/90 p-3 rounded-xl border border-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="space-y-0.5">
                          <p className="text-slate-900 font-bold">
                            Alimento causante: <span className="text-rose-700 font-extrabold underline">{conflict.foodName}</span>
                          </p>
                          <p className="text-amber-950 font-semibold">
                            Alergia/restricción del paciente: <span className="text-amber-800 font-bold">{conflict.patientRestriction}</span>
                          </p>
                          <p className="text-[11px] text-slate-600">
                            {conflict.clinicalExplanation}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 self-start sm:self-center shrink-0">
                          Riesgo Clínico
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet Content Details */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left: Identity, Objective & Technical definition */}
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Space_Grotesk'] leading-snug">
                        {diet.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        <strong>Objetivo:</strong> {diet.objective}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                      <strong>Definición técnica:</strong> {diet.technicalDefinition}
                    </p>

                    {/* Quick composition highlight */}
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-700">Composición principal: </span>
                      <span>
                        {diet.foods.map((f) => f.notes || f.foodId).join(' • ')}
                      </span>
                    </div>
                  </div>

                  {/* Right: Nutritional & Prescription quick stats */}
                  <div className="lg:w-80 shrink-0 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Aporte Calórico
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {diet.caloricKcal} kcal/día
                      </span>
                    </div>

                    {/* Macronutrient breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">HC</span>
                        <span className="font-bold text-slate-800">{diet.nutrients.carbohydratesGrams}g</span>
                        <span className="text-[10px] text-slate-500 block">({diet.nutrients.carbohydratesPercentage}%)</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Prot</span>
                        <span className="font-bold text-slate-800">{diet.nutrients.proteinsGrams}g</span>
                        <span className="text-[10px] text-slate-500 block">({diet.nutrients.proteinsPercentage}%)</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Lípidos</span>
                        <span className="font-bold text-slate-800">{diet.nutrients.fatsGrams}g</span>
                        <span className="text-[10px] text-slate-500 block">({diet.nutrients.fatsPercentage}%)</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                      <p>• <strong>Vía:</strong> {diet.routeOfAdministration}</p>
                      <p>• <strong>Pauta:</strong> {diet.schedule.length} tiempos de comida</p>
                      <p>• <strong>Sodio:</strong> {diet.nutrients.sodiumMg} mg/día</p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (CA3 & CA4) */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    id={`btn-tech-sheet-${diet.id}`}
                    onClick={() => onOpenTechnicalSheet(analysis)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs active:scale-95"
                  >
                    <FileText className="w-4 h-4 text-teal-700" />
                    <span>Ver Ficha Técnica Completa (CA3)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isCompatible ? (
                      <button
                        id={`btn-select-safe-diet-${diet.id}`}
                        onClick={() => onSelectDietToAssign(analysis)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-bold hover:bg-emerald-800 shadow-sm transition active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Seleccionar Dieta Segura (CA4)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        id={`btn-attempt-incompatible-${diet.id}`}
                        onClick={() => onSelectDietToAssign(analysis)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/90 text-white text-xs font-bold hover:bg-amber-700 shadow-2xs transition"
                        title="Esta dieta posee advertencias críticas. Al pulsar se requerirá confirmación de excepción clínica estricta."
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Revisar Advertencia para Asignación</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAnalyses.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No hay dietas en este filtro</h3>
            <p className="text-xs text-slate-500">
              Pruebe cambiando el filtro superior a "Todas las dietas".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
