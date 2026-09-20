import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  HeartPulse,
  Printer,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { CompatibilityAnalysis, Patient, PrescribedTreatment } from '../types';
import { getDiseaseById } from '../services/clinicalEngine';

interface AssignmentModalProps {
  analysis: CompatibilityAnalysis | null;
  patient: Patient;
  onClose: () => void;
  onConfirmAssignment: (treatment: PrescribedTreatment) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  analysis,
  patient,
  onClose,
  onConfirmAssignment,
}) => {
  if (!analysis) return null;

  const diet = analysis.diet;
  const isCompatible = analysis.status === 'COMPATIBLE';
  const disease = getDiseaseById(patient.activeDiseaseIds[0]);

  // Form State
  const [durationDays, setDurationDays] = useState('14');
  const [route, setRoute] = useState<string>(diet.routeOfAdministration);
  const [clinicalNotes, setClinicalNotes] = useState(
    isCompatible
      ? `Indicación de tratamiento nutricional según protocolo clínico para ${disease?.name || 'paciente'}. Paciente sin contraindicaciones alérgicas detectadas.`
      : ''
  );
  const [overrideJustification, setOverrideJustification] = useState('');
  const [confirmedOverride, setConfirmedOverride] = useState(false);
  const [isPrescribed, setIsPrescribed] = useState(false);
  const [prescribedObject, setPrescribedObject] = useState<PrescribedTreatment | null>(null);

  const handleConfirm = () => {
    if (!isCompatible && !confirmedOverride) {
      return;
    }

    const newTreatment: PrescribedTreatment = {
      id: `rx-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientMRN: patient.medicalRecordNumber,
      dietId: diet.id,
      dietName: diet.name,
      dietCode: diet.code,
      caloricKcal: diet.caloricKcal,
      diseaseId: patient.activeDiseaseIds[0],
      diseaseName: disease?.name || 'Diagnóstico activo',
      physicianName: 'Dr. Roberto Valenzuela',
      physicianLicense: 'RUT: 14.892.401-2 | Reg. Col. Médicos: 28491',
      prescriptionDate: new Date().toISOString().split('T')[0],
      durationDays: parseInt(durationDays, 10) || 14,
      routeOfAdministration: route,
      schedule: diet.schedule,
      clinicalNotes: isCompatible
        ? clinicalNotes
        : `${clinicalNotes} [EXCEPCIÓN MÉDICA AUTORIZADA: ${overrideJustification}]`,
      status: 'ACTIVO',
      compatibilityAtAssignment: analysis.status,
      conflictOverrideJustification: overrideJustification,
    };

    setPrescribedObject(newTreatment);
    setIsPrescribed(true);
    onConfirmAssignment(newTreatment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {!isPrescribed ? (
          <>
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                    Confirmación de Prescripción (EPIC 28)
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-['Space_Grotesk'] text-white mt-1">
                    Asignar Tratamiento Nutricional
                  </h2>
                </div>
                <button
                  id="btn-close-assignment-modal"
                  onClick={onClose}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Context bar in prescription modal */}
              <div className="mt-3 text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                <span>Paciente: <strong className="text-white">{patient.fullName}</strong> ({patient.medicalRecordNumber})</span>
                <span>•</span>
                <span>Dieta: <strong className="text-teal-300">{diet.name}</strong></span>
              </div>
            </div>

            {/* Incompatible Severe Warning Box */}
            {!isCompatible && (
              <div className="p-4 bg-rose-50 border-b border-rose-300 text-rose-950 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-950">
                    Advertencia Crítica: Dieta con Incompatibilidad Detectada
                  </h3>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed">
                  Esta dieta contiene ingredientes que presentan riesgo clínico directo para las alergias registradas del paciente:
                </p>
                <div className="space-y-1">
                  {analysis.conflicts.map((c, i) => (
                    <div key={i} className="text-xs bg-white/90 p-2 rounded-lg border border-rose-200">
                      <strong>{c.foodName}</strong> genera conflicto con <strong>{c.patientRestriction}</strong>.
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-rose-200 text-xs">
                  <label className="flex items-start gap-2 cursor-pointer font-bold text-rose-950">
                    <input
                      type="checkbox"
                      id="check-override-incompatibility"
                      checked={confirmedOverride}
                      onChange={(e) => setConfirmedOverride(e.target.checked)}
                      className="mt-0.5 rounded text-rose-700 focus:ring-rose-500"
                    />
                    <span>
                      Confirmo como médico responsable que he evaluado esta advertencia clínica y asumo la excepción médica documentada abajo.
                    </span>
                  </label>

                  {confirmedOverride && (
                    <div className="mt-2">
                      <label className="text-[11px] font-bold text-rose-900 block mb-1">
                        Justificación médica de la excepción (Obligatorio):
                      </label>
                      <input
                        type="text"
                        value={overrideJustification}
                        onChange={(e) => setOverrideJustification(e.target.value)}
                        placeholder="Ej. Se excluye el ingrediente de la pauta de cocina del hospital..."
                        className="w-full text-xs p-2 rounded-lg border border-rose-300 focus:outline-hidden focus:ring-2 focus:ring-rose-600 bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compatible Verification Banner */}
            {isCompatible && (
              <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-950 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-emerald-950">
                    Verificación de Seguridad Exitosa (CA4)
                  </p>
                  <p className="text-emerald-800">
                    El algoritmo determinista certificó que ningún alimento de esta dieta genera conflicto con las alergias o restricciones de {patient.fullName}.
                  </p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Duración del Tratamiento (Días)
                  </label>
                  <input
                    id="input-treatment-days"
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden bg-slate-50/50"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Sugerido: {diet.duration}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Vía de Administración
                  </label>
                  <select
                    id="select-treatment-route"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden bg-slate-50/50"
                  >
                    <option value="Vía Oral">Vía Oral</option>
                    <option value="Vía Enteral por Sonda">Vía Enteral por Sonda</option>
                    <option value="Vía Mixta (Oral + Enteral)">Vía Mixta (Oral + Enteral)</option>
                    <option value="Vía Parenteral Complementaria">Vía Parenteral Complementaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Indicaciones y Observaciones Médicas para el Servicio de Nutrición y Cocina
                </label>
                <textarea
                  id="textarea-clinical-notes"
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Instrucciones específicas, tolerancias o recomendaciones..."
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:outline-hidden bg-slate-50/50 leading-relaxed"
                />
              </div>

              {/* Physician Signature Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800 font-bold">
                    RV
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Dr. Roberto Valenzuela</p>
                    <p className="text-[11px] text-slate-500">Médico Nutricionista Clínico • Reg. 48219-N</p>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-teal-700 font-bold bg-white px-2 py-1 rounded border border-slate-200">
                  Firma Digital Verificada
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>

              <button
                id="btn-confirm-prescription"
                disabled={!isCompatible && (!confirmedOverride || !overrideJustification.trim())}
                onClick={handleConfirm}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95 ${
                  !isCompatible && (!confirmedOverride || !overrideJustification.trim())
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-teal-700 text-white hover:bg-teal-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Prescribir Tratamiento</span>
              </button>
            </div>
          </>
        ) : (
          /* Confirmation Receipt View (Orden Médica Generada) */
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
              <FileCheck className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Tratamiento Asignado Exitosamente
              </span>
              <h2 className="text-2xl font-black text-slate-900 font-['Space_Grotesk']">
                Orden Médica de Nutrición Emitida
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                La dieta <strong>{diet.name}</strong> ha sido asignada al paciente{' '}
                <strong>{patient.fullName}</strong> y sincronizada con el servicio de nutrición hospitalaria.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Código de Orden:</span>
                <span className="font-mono font-bold text-slate-900">{prescribedObject?.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Paciente:</span>
                <span className="font-bold text-slate-900">{patient.fullName} ({patient.medicalRecordNumber})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Dieta Prescrita:</span>
                <span className="font-bold text-slate-900">{diet.name} ({diet.caloricKcal} kcal/d)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Duración:</span>
                <span className="font-bold text-slate-900">{durationDays} días ({route})</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Médico Prescriptor:</span>
                <span className="font-bold text-teal-800">Dr. Roberto Valenzuela (Nutrición Clínica)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Imprimir Orden Médica</span>
              </button>

              <button
                id="btn-finish-assignment-flow"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-bold hover:bg-teal-800 shadow-md"
              >
                <span>Finalizar y Ver Tratamientos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
