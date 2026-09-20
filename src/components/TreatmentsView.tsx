import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  Filter,
  HeartPulse,
  Printer,
  ShieldCheck,
  User,
  Utensils,
} from 'lucide-react';
import { PrescribedTreatment } from '../types';

interface TreatmentsViewProps {
  treatments: PrescribedTreatment[];
  onSelectPatient: (patientId: string) => void;
}

export const TreatmentsView: React.FC<TreatmentsViewProps> = ({
  treatments,
  onSelectPatient,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filtered = treatments.filter((t) => {
    if (filter === 'active') return t.status === 'ACTIVO';
    if (filter === 'completed') return t.status === 'FINALIZADO';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Space_Grotesk'] flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-teal-700" />
              Registro de Tratamientos Nutricionales Prescritos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Historial de dietas asignadas a través del motor clínico de compatibilidad (EPIC 28).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir Todo</span>
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-1">Filtrar por estado:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({treatments.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'active'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Activos ({treatments.filter((t) => t.status === 'ACTIVO').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'completed'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Finalizados ({treatments.filter((t) => t.status === 'FINALIZADO').length})
          </button>
        </div>
      </div>

      {/* Treatments List */}
      <div className="space-y-4">
        {filtered.map((treatment) => (
          <div
            key={treatment.id}
            id={`treatment-card-${treatment.id}`}
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:shadow-md transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
                  <FileCheck className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {treatment.patientName}
                    </h3>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {treatment.patientMRN}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        treatment.status === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {treatment.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Diagnóstico asociado: <strong>{treatment.diseaseName}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-400 block">
                  {treatment.id}
                </span>
                <span className="text-[11px] text-slate-500">
                  Prescrito el {treatment.prescriptionDate}
                </span>
              </div>
            </div>

            {/* Diet Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dieta Prescrita
                </span>
                <p className="font-bold text-slate-900 mt-0.5 text-sm">
                  {treatment.dietName}
                </p>
                <p className="text-slate-500 mt-0.5">{treatment.caloricKcal} kcal/día</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Duración & Vía
                </span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {treatment.durationDays} días programados
                </p>
                <p className="text-slate-500 mt-0.5">{treatment.routeOfAdministration}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Médico Responsable
                </span>
                <p className="font-bold text-teal-800 mt-0.5">
                  {treatment.physicianName}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verificación de compatibilidad superada
                </p>
              </div>
            </div>

            {/* Clinical Notes */}
            {treatment.clinicalNotes && (
              <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">
                  Observaciones médicas e indicaciones para cocina:
                </span>
                <p className="leading-relaxed">{treatment.clinicalNotes}</p>
              </div>
            )}

            {/* Schedule Preview */}
            {treatment.schedule && treatment.schedule.length > 0 && (
              <div className="text-xs">
                <span className="font-bold text-slate-600 block mb-1.5">
                  Distribución de tomas hospitalarias:
                </span>
                <div className="flex flex-wrap gap-2">
                  {treatment.schedule.map((sch, i: number) => (
                    <span
                      key={i}
                      className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 font-medium"
                    >
                      <span className="font-mono font-bold text-teal-700">{sch.time}</span>
                      <span>{sch.mealName}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No hay tratamientos registrados</h3>
            <p className="text-xs text-slate-500">
              Utilice el panel de pacientes para prescribir dietas compatibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
