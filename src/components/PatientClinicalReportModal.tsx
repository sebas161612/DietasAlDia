import React from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Printer,
  ShieldAlert,
  ShieldCheck,
  User,
  Utensils,
  X,
} from 'lucide-react';
import { Patient, PrescribedTreatment } from '../types';
import { getDiseaseById } from '../services/clinicalEngine';

interface PatientClinicalReportModalProps {
  patient: Patient | null;
  treatments: PrescribedTreatment[];
  onClose: () => void;
}

export const PatientClinicalReportModal: React.FC<PatientClinicalReportModalProps> = ({
  patient,
  treatments,
  onClose,
}) => {
  if (!patient) return null;

  const disease = getDiseaseById(patient.activeDiseaseIds[0]);
  const patientTreatments = treatments.filter((t) => t.patientId === patient.id);
  const printDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Control Bar - Hidden on print */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black font-['Space_Grotesk'] text-white">
                Informe Clínico y Nutricional del Paciente
              </h2>
              <p className="text-xs text-slate-400">
                Formato oficial de historia clínica hospitalaria para impresión o guardado como PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-print-patient-report"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar como PDF</span>
            </button>
            <button
              id="btn-close-patient-report"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cerrar vista de informe"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="patient-clinical-report-document" className="p-6 sm:p-10 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          {/* Hospital Brand Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-700 text-white font-black text-sm flex items-center justify-center">
                  DA
                </span>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wider text-slate-900 font-['Space_Grotesk']">
                    Dietas al Día — Departamento de Nutrición Clínica
                  </h1>
                  <p className="text-xs text-slate-600">
                    Hospital Clínico Universitario • Servicio de Alimentación y Dietoterapia
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <p><strong>Nº Historia Clínica:</strong> <span className="font-mono text-slate-900 font-bold text-sm">{patient.medicalRecordNumber}</span></p>
              <p><strong>Fecha de Emisión:</strong> {printDate}</p>
              <p><strong>Ubicación:</strong> {patient.roomBed}</p>
            </div>
          </div>

          <div className="space-y-6 text-slate-800 text-xs sm:text-sm">
            {/* 1. Datos de Identificación y Somatometría */}
            <section className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <User className="w-4 h-4 text-teal-700" />
                1. Datos de Identificación y Antropometría
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Nombre Completo</span>
                  <p className="font-bold text-slate-900 text-sm">{patient.fullName}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Edad / Género</span>
                  <p className="font-semibold text-slate-900">
                    {patient.age} años • {patient.gender === 'F' ? 'Femenino' : 'Masculino'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Peso / Talla</span>
                  <p className="font-semibold text-slate-900">
                    {patient.weightKg} kg / {patient.heightCm} cm
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Índice Masa Corporal (IMC)</span>
                  <p className="font-bold text-slate-900">
                    {patient.bmi} kg/m²{' '}
                    <span className="text-[11px] font-normal text-slate-600">
                      ({patient.bmi >= 30 ? 'Obesidad' : patient.bmi >= 25 ? 'Sobrepeso' : 'Normal'})
                    </span>
                  </p>
                </div>
              </div>

              {/* Signos Vitales */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Presión Arterial:</span>
                  <span className="font-mono font-bold text-slate-800">{patient.vitalSigns.bloodPressure}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Frecuencia Cardíaca:</span>
                  <span className="font-mono font-bold text-slate-800">{patient.vitalSigns.heartRate} lpm</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Saturación O2:</span>
                  <span className="font-mono font-bold text-slate-800">{patient.vitalSigns.oxygenSaturation}%</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Glucemia Capilar:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {patient.vitalSigns.glucoseMgDl ? `${patient.vitalSigns.glucoseMgDl} mg/dL` : 'No registrada'}
                  </span>
                </div>
              </div>
            </section>

            {/* 2. Diagnóstico Clínico Principal */}
            <section className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-teal-800 mb-2.5 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <HeartPulse className="w-4 h-4 text-teal-700" />
                2. Diagnóstico Activo y Base Clínica
              </h2>

              {disease ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {disease.name}
                    </h3>
                    <span className="font-mono text-xs font-bold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded border border-teal-300">
                      CIE-10: {disease.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {disease.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <strong className="text-slate-900">Objetivo del tratamiento:</strong> {disease.treatmentGoal}
                    </div>
                    <div>
                      <strong className="text-slate-900">Tratamiento de base:</strong> {disease.treatment}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Sin diagnóstico registrado.</p>
              )}
            </section>

            {/* 3. Alergias Registradas y Restricciones */}
            <section className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-2.5 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                3. Alergias e Incompatibilidades Alimentarias (Cruce de Seguridad CA2)
              </h2>

              {patient.allergies.length > 0 ? (
                <div className="space-y-2">
                  {patient.allergies.map((allergy) => (
                    <div
                      key={allergy.id}
                      className="p-3 rounded-xl bg-amber-50/80 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-950 text-xs sm:text-sm">{allergy.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                            Severidad: {allergy.severity}
                          </span>
                        </div>
                        <p className="text-xs text-amber-900/90 mt-0.5">
                          <strong>Manifestación:</strong> {allergy.reaction}
                        </p>
                      </div>
                      <span className="text-[11px] text-amber-800 font-medium">
                        Categoría: {allergy.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>El paciente no presenta antecedentes alérgicos alimentarios registrados.</span>
                </div>
              )}

              {/* Restricciones alimentarias funcionales */}
              {patient.foodRestrictions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Restricciones Alimentarias Específicas:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {patient.foodRestrictions.map((res) => (
                      <div key={res.id} className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <p className="font-bold text-slate-800 text-xs">{res.name}</p>
                        <p className="text-slate-600 text-[11px]">{res.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 4. Requerimientos Nutricionales e Historia Clínica */}
            <section className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <Utensils className="w-4 h-4 text-teal-700" />
                4. Requerimiento Nutricional y Antecedentes
              </h2>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Requerimientos Nutricionales Prescritos
                </span>
                <p className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium">
                  {patient.clinicalRequirements}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Resumen de Antecedentes Clínicos e Historia de Ingreso
                </span>
                <p className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {patient.clinicalHistory}
                </p>
              </div>
            </section>

            {/* 5. Historial de Tratamientos Nutricionales Prescritos (Feature 1 y 4) */}
            <section className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  5. Tratamientos Nutricionales Prescritos para este Paciente
                </h2>
                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  {patientTreatments.length} registro(s)
                </span>
              </div>

              {patientTreatments.length > 0 ? (
                <div className="space-y-3">
                  {patientTreatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {treatment.dietName}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-500">
                              [{treatment.dietCode}]
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Fecha de Prescripción: <strong>{treatment.prescriptionDate}</strong> • Orden: #{treatment.id}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            treatment.compatibilityAtAssignment === 'COMPATIBLE'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {treatment.compatibilityAtAssignment === 'COMPATIBLE' ? '✓ Compatible' : '⚠ Excepción Autorizada'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200 uppercase">
                            {treatment.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                        <div>
                          <strong>Aporte:</strong> {treatment.caloricKcal} kcal/día
                        </div>
                        <div>
                          <strong>Duración:</strong> {treatment.durationDays} días
                        </div>
                        <div>
                          <strong>Vía:</strong> {treatment.routeOfAdministration}
                        </div>
                      </div>

                      <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <strong className="text-slate-800">Indicaciones clínicas:</strong> {treatment.clinicalNotes}
                      </div>

                      {treatment.conflictOverrideJustification && (
                        <div className="text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-300 text-amber-950">
                          <strong>Justificación médica documentada:</strong> {treatment.conflictOverrideJustification}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 pt-1 flex justify-between items-center">
                        <span>Médico prescriptor: <strong>{treatment.physicianName}</strong></span>
                        <span className="font-mono text-[10px]">{treatment.physicianLicense}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                  No hay tratamientos nutricionales registrados previamente para este paciente en la sesión actual.
                </div>
              )}
            </section>

            {/* Medical Signature Line for Printed Document */}
            <div className="pt-10 mt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="w-48 mx-auto border-b border-slate-400 pb-1 mb-1">
                  <span className="font-mono text-[11px] text-slate-400">Firma electrónica certificada</span>
                </div>
                <p className="font-bold text-slate-800">Dr. Roberto Valenzuela</p>
                <p className="text-[11px] text-slate-500">Médico Especialista en Nutrición Clínica</p>
                <p className="text-[10px] font-mono text-slate-400">Reg. Colegio Médico: 28491</p>
              </div>

              <div>
                <div className="w-48 mx-auto border-b border-slate-400 pb-1 mb-1">
                  <span className="font-mono text-[11px] text-slate-400">Validación de Servicio</span>
                </div>
                <p className="font-bold text-slate-800">Servicio de Dietoterapia y Cocina Central</p>
                <p className="text-[11px] text-slate-500">Recepción y Verificación de Alérgenos</p>
                <p className="text-[10px] text-slate-400">Hospital Clínico</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions - Hidden on print */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Cerrar Informe
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-bold hover:bg-teal-800 shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
