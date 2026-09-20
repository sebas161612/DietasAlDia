import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  HeartPulse,
  Info,
  Play,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Patient, PrescribedTreatment } from '../types';
import { getDiseaseById } from '../services/clinicalEngine';

interface DashboardViewProps {
  patients: Patient[];
  treatments: PrescribedTreatment[];
  onSelectPatientForEvaluation: (patient: Patient) => void;
  onViewPatientProfile: (patient: Patient) => void;
  onGoToTreatments: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  treatments,
  onSelectPatientForEvaluation,
  onViewPatientProfile,
  onGoToTreatments,
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Clinical Hero Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Sistema Clínico de Soporte a Decisiones Nutricionales</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-tight">
            Asignación de Tratamiento Nutricional Seguro (EPIC 28)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-teal-100/90 leading-relaxed">
            Consulte automáticamente dietas compatibles con el diagnóstico del paciente
            y detecte al instante alimentos incompatibles con sus alergias registradas,
            eliminando la necesidad de cruces manuales.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="btn-quick-start-demo"
              onClick={() => onSelectPatientForEvaluation(patients[0])}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 text-sm font-bold shadow-md hover:bg-teal-400 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Evaluar Paciente: {patients[0].fullName.split(' ')[0]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-xs text-teal-200/80 font-medium px-2 py-1">
              ✓ Cruce algorítmico determinista sin latencia
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Metrics & Safeguards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pacientes Activos
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 font-['Space_Grotesk']">
            {patients.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Con perfil clínico completo</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dietas Compatibles
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 font-['Space_Grotesk']">
            100%
          </p>
          <p className="mt-1 text-xs text-slate-500">Verificadas frente a alérgenos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Alertas Incompatibles
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 font-['Space_Grotesk']">
            Detección Activa
          </p>
          <p className="mt-1 text-xs text-slate-500">Antes de cualquier confirmación</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tratamientos
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 font-['Space_Grotesk']">
            {treatments.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Asignaciones registradas</p>
        </div>
      </section>

      {/* Acceptance Criteria Interactive Scenario Showcase */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              Escenarios Clínicos de Prueba (Criterios de Aceptación CA1–CA4)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pruebe de forma interactiva e inmediata los casos clínicos solicitados en la especificación.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Haga clic para ejecutar cruce
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {/* Scenario 1: Maria Gonzalez */}
          <div
            id="card-scenario-1"
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-teal-50/40 hover:border-teal-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  CA1 & CA2 Demostración
                </span>
                <span className="text-xs text-slate-500 font-mono">HC-94821</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">María González (58a)</h3>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Diagnóstico:</strong> Diabetes Mellitus Tipo 2
              </p>
              <div className="mt-2.5 bg-amber-50/80 border border-amber-200 rounded-lg p-2 text-xs text-amber-900">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Alergia registrada: Maní y frutos secos</p>
                    <p className="text-[11px] text-amber-800/90 mt-0.5">
                      El motor detectará incompatibilidad con Dieta Mediterránea y mostrará segura la Dieta Hipocalórica Estándar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectPatientForEvaluation(patients[0])}
              className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition"
            >
              <span>Ejecutar Cruce Clínico</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario 2: Carlos Mendez */}
          <div
            id="card-scenario-2"
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-teal-50/40 hover:border-teal-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                  Doble Incompatibilidad
                </span>
                <span className="text-xs text-slate-500 font-mono">HC-63014</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Carlos Méndez (64a)</h3>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Diagnóstico:</strong> Insuficiencia Cardíaca + HTA
              </p>
              <div className="mt-2.5 bg-rose-50/80 border border-rose-200 rounded-lg p-2 text-xs text-rose-900">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Alergia a Mariscos + Intol. Lactosa</p>
                    <p className="text-[11px] text-rose-800/90 mt-0.5">
                      El motor detecta 2 alertas simultáneas en la Dieta DASH Marina y recomienda Dieta Hiposódica Estricta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectPatientForEvaluation(patients[1])}
              className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition"
            >
              <span>Ejecutar Cruce Clínico</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario 3: Lucia Fernandez */}
          <div
            id="card-scenario-3"
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-teal-50/40 hover:border-teal-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Enfermedad Celíaca
                </span>
                <span className="text-xs text-slate-500 font-mono">HC-77150</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Lucía Fernández (32a)</h3>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Diagnóstico:</strong> Celíaca / Síndrome Malabsortivo
              </p>
              <div className="mt-2.5 bg-amber-50/80 border border-amber-200 rounded-lg p-2 text-xs text-amber-900">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Restricción Gluten (TACC) + Alergia Soya</p>
                    <p className="text-[11px] text-amber-800/90 mt-0.5">
                      Bloquea de inmediato dieta astringente con fideos de trigo y destaca dieta celíaca certificada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectPatientForEvaluation(patients[2])}
              className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition"
            >
              <span>Ejecutar Cruce Clínico</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Patient List Preview */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Pacientes en Espera de Tratamiento Nutricional
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Seleccione un paciente para abrir directamente sus dietas recomendadas en un solo paso (CA1).
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {patients.map((patient) => {
            const disease = getDiseaseById(patient.activeDiseaseIds[0]);
            const hasAllergies = patient.allergies.length > 0;

            return (
              <div
                key={patient.id}
                id={`patient-row-${patient.id}`}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-xl transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {patient.fullName}
                    </span>
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {patient.medicalRecordNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      {patient.age} años • {patient.gender === 'F' ? 'Femenino' : 'Masculino'} • IMC {patient.bmi}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80">
                      <HeartPulse className="w-3 h-3 text-teal-600" />
                      {disease ? disease.name : 'Diagnóstico registrado'}
                    </span>

                    {hasAllergies ? (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {patient.allergies.map((a) => a.name).join(', ')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Sin alergias conocidas
                      </span>
                    )}

                    <span className="text-slate-500 text-[11px]">
                      {patient.roomBed}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id={`btn-view-profile-${patient.id}`}
                    onClick={() => onViewPatientProfile(patient)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Historia Clínica
                  </button>

                  <button
                    id={`btn-eval-diets-${patient.id}`}
                    onClick={() => onSelectPatientForEvaluation(patient)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 shadow-2xs transition active:scale-95"
                  >
                    <span>Ver Dietas Recomendadas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Treatments Quick Overview */}
      {treatments.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                Tratamientos Nutricionales Prescritos Recientemente
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Histórico local de dietas asignadas y confirmadas por el médico nutricionista.
              </p>
            </div>
            <button
              onClick={onGoToTreatments}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Ver todos ({treatments.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {treatments.slice(0, 3).map((treatment) => (
              <div
                key={treatment.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {treatment.patientName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {treatment.patientMRN}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {treatment.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    Dieta: <strong>{treatment.dietName}</strong> ({treatment.caloricKcal} kcal/día)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Prescrito por {treatment.physicianName} • {treatment.prescriptionDate}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Asignación Segura
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
