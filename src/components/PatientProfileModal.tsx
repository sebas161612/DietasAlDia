import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Info,
  Scale,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { Patient } from '../types';
import { getDiseaseById } from '../services/clinicalEngine';

interface PatientProfileModalProps {
  patient: Patient | null;
  onClose: () => void;
  onGoToRecommendedDiets: (patient: Patient) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  patient,
  onClose,
  onGoToRecommendedDiets,
}) => {
  if (!patient) return null;

  const disease = getDiseaseById(patient.activeDiseaseIds[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with clinical badges */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            id="btn-close-profile-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-extrabold text-base">
              {patient.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                  {patient.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-900/60 text-teal-300 border border-teal-700/50">
                  {patient.medicalRecordNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>{patient.age} años</span>
                <span>•</span>
                <span>{patient.gender === 'F' ? 'Femenino' : 'Masculino'}</span>
                <span>•</span>
                <span>{patient.roomBed}</span>
                <span>•</span>
                <span>Ingreso: {patient.admissionDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Somatometry & Vitals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Peso / Talla
              </span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {patient.weightKg} kg / {patient.heightCm} cm
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                IMC
              </span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {patient.bmi} kg/m²{' '}
                <span className="text-[11px] font-medium text-slate-500">
                  ({patient.bmi >= 30 ? 'Obesidad' : patient.bmi >= 25 ? 'Sobrepeso' : 'Normal'})
                </span>
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Presión Arterial
              </span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {patient.vitalSigns.bloodPressure}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Frecuencia / SatO2
              </span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {patient.vitalSigns.heartRate} lpm / {patient.vitalSigns.oxygenSaturation}%
              </p>
            </div>
          </div>

          {/* Diagnosis Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              Enfermedad y Diagnóstico Principal
            </h3>
            {disease ? (
              <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-teal-950 text-sm sm:text-base">
                    {disease.name}
                  </h4>
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                    CIE-10: {disease.code}
                  </span>
                </div>
                <p className="text-xs text-teal-900/80 mt-1.5 leading-relaxed">
                  {disease.description}
                </p>
                <div className="mt-3 pt-2.5 border-t border-teal-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-teal-950">
                  <div>
                    <span className="font-bold">Objetivo terapéutico: </span>
                    <span>{disease.treatmentGoal}</span>
                  </div>
                  <div>
                    <span className="font-bold">Tratamiento de base: </span>
                    <span>{disease.treatment}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No se encontraron diagnósticos asociados.</p>
            )}
          </div>

          {/* Registered Allergies Alert Box */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Alergias Alimentarias Registradas (Cruce Crítico CA2)
            </h3>
            {patient.allergies.length > 0 ? (
              <div className="space-y-2">
                {patient.allergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-950 text-sm">{allergy.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                          Severidad: {allergy.severity}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/90">
                        <strong>Manifestación clínica:</strong> {allergy.reaction}
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Categoría: {allergy.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>El paciente no presenta antecedentes alérgicos alimentarios registrados.</span>
              </div>
            )}
          </div>

          {/* Restrictions & Clinical History */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Restricciones Alimentarias
              </h4>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                {patient.foodRestrictions.map((res) => (
                  <div key={res.id}>
                    <p className="font-bold text-slate-800">{res.name}</p>
                    <p className="text-slate-600 text-[11px]">{res.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Requerimiento Nutricional
              </h4>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {patient.clinicalRequirements}
              </div>
            </div>
          </div>

          {/* Clinical notes */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resumen Clínico de Ingreso
            </h4>
            <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
              {patient.clinicalHistory}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Volver a la lista
          </button>

          <button
            id="btn-modal-go-to-diets"
            onClick={() => {
              onClose();
              onGoToRecommendedDiets(patient);
            }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-bold hover:bg-teal-800 shadow-md transition active:scale-95"
          >
            <span>Ver Dietas Recomendadas (Cruce Automático EPIC 28)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
